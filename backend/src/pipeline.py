"""Core Pipeline Orchestrator connecting ingestion, parsing, extraction, resolution, and output."""

import logging
from pathlib import Path
from typing import Dict, List, Optional

from src.config import Settings
from src.evidence.tracker import EvidenceTracker
from src.extraction.llm_extractor import get_llm_extractor
from src.extraction.structured_output import StructuredOutputParser
from src.parser.base_parser import ParsedDocument
from src.parser.html_parser import HTMLParser
from src.parser.pdf_parser import PDFParser
from src.parser.text_parser import TextParser
from src.processing.chunker import DocumentChunker
from src.processing.conflict_resolver import CandidateFieldValue, ConflictResolver
from src.processing.document_grouper import DocumentGrouper, DocumentPackage
from src.processing.normalizer import normalize_date_string, normalize_text
from src.schema.rfp_schema import DocumentExtractionItem, RFPPackageExtraction
from src.utils.file_utils import SUPPORTED_EXTENSIONS, detect_file_type, ensure_dir, list_files_in_dir, save_json
from src.validation.validator import ExtractionValidator

logger = logging.getLogger(__name__)


class RFPExtractionPipeline:
    """End-to-end RFP intelligence extraction pipeline."""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.pdf_parser = PDFParser()
        self.html_parser = HTMLParser()
        self.text_parser = TextParser()
        self.chunker = DocumentChunker()
        self.extractor = get_llm_extractor(settings)

    def process_file(self, file_path: Path) -> ParsedDocument:
        """Detect file type and parse document."""
        ftype = detect_file_type(file_path)
        if ftype == "pdf":
            return self.pdf_parser.parse(file_path)
        elif ftype == "html":
            return self.html_parser.parse(file_path)
        elif ftype == "text":
            return self.text_parser.parse(file_path)
        else:
            raise ValueError(f"Unsupported document format: {file_path.name}")

    def process_package(self, package: DocumentPackage) -> RFPPackageExtraction:
        """Process a grouped multi-document package, performing per-file extractions and conflict resolution."""
        logger.info(f"Processing procurement package: '{package.package_id}' ({len(package.documents)} documents)")
        all_candidates: List[CandidateFieldValue] = []
        source_doc_names: List[str] = []
        per_doc_items: List[DocumentExtractionItem] = []

        for order_idx, classified_doc in enumerate(package.documents, start=1):
            p_doc = classified_doc.parsed_doc
            source_doc_names.append(p_doc.file_name)
            logger.info(
                f"  [{order_idx}/{len(package.documents)}] Extracting from: {p_doc.file_name} "
                f"[Role: {classified_doc.role}, Authority: {classified_doc.authority_weight}]"
            )

            # Get text for extraction
            chunks = self.chunker.chunk_document(p_doc)
            max_chars = 16000 if self.settings.llm_provider == "groq" else 35000
            salient = self.chunker.select_salient_chunks(chunks, max_total_chars=max_chars)
            doc_context = "\n\n".join(f"[Page {c.page_number}]\n{c.text}" for c in salient)

            # Run LLM extraction for this individual document
            raw_result = self.extractor.extract(
                doc_name=p_doc.file_name,
                doc_type=p_doc.file_type,
                doc_role=classified_doc.role,
                text=doc_context,
            )

            # Build per-document clean 20-field record
            doc_single_record = ExtractionValidator.enforce_pydantic(raw_result)
            doc_record_dict = doc_single_record.to_dict()
            doc_record_dict["due_date"] = normalize_date_string(doc_record_dict.get("due_date", "Not Specified"))
            for k, v in doc_record_dict.items():
                if k != "due_date":
                    doc_record_dict[k] = normalize_text(v)

            doc_single_record = ExtractionValidator.enforce_pydantic(doc_record_dict)
            doc_dict = doc_single_record.to_dict()
            verified_count = sum(1 for val in doc_dict.values() if val != "Not Specified")


            doc_stem = Path(p_doc.file_name).stem
            per_doc_items.append(
                DocumentExtractionItem(
                    order=order_idx,
                    filename=p_doc.file_name,
                    stem=doc_stem,
                    json_filename=f"{doc_stem}.json",
                    file_type=p_doc.file_type.upper(),
                    role=classified_doc.role,
                    fields=doc_dict,
                    summary={
                        "verified": verified_count,
                        "not_specified": 20 - verified_count,
                        "total": 20,
                    },
                )
            )

            # Convert to candidate values for cross-document conflict resolution
            doc_candidates = StructuredOutputParser.to_candidate_values(
                data=raw_result,
                doc_name=p_doc.file_name,
                doc_role=classified_doc.role,
                authority_weight=classified_doc.authority_weight,
                source_text=doc_context,
            )
            all_candidates.extend(doc_candidates)

        # Authoritative conflict resolution across all candidate extractions
        logger.info(f"Resolving {len(all_candidates)} candidates across {len(package.documents)} documents...")
        resolved_record, evidence_dict, resolution_log = ConflictResolver.resolve_candidates(
            all_candidates, package=package
        )

        # Apply final field normalization (dates, whitespace)
        cleaned_dict = resolved_record.to_dict()
        cleaned_dict["due_date"] = normalize_date_string(cleaned_dict["due_date"])
        for k, v in cleaned_dict.items():
            if k != "due_date":
                cleaned_dict[k] = normalize_text(v)

        final_record = ExtractionValidator.enforce_pydantic(cleaned_dict)

        # Validate final 20 fields
        is_valid, errors = ExtractionValidator.validate_record(final_record.to_dict())
        if not is_valid:
            logger.warning(f"Final record for {package.package_id} has validation notices: {errors}")

        package_extraction = RFPPackageExtraction(
            bid_id=package.package_id,
            record=final_record,
            evidence=evidence_dict,
            conflict_resolutions=resolution_log,
            source_documents=source_doc_names,
            per_document_extractions=per_doc_items,
        )

        return package_extraction

    def run_on_directory(
        self, input_dir: Path, output_file: Optional[Path] = None
    ) -> List[RFPPackageExtraction]:
        """Ingest all supported documents in directory, group, extract, and write output JSONs.
        
        Outputs both:
        1. An ordered per-file JSON directory: <output_dir>/<bid_folder>/<file>.json for every file in order.
        2. A consolidated package JSON: <output_dir>/<bid_folder>.json for cross-document analysis.
        """
        logger.info(f"Scanning directory: {input_dir}")
        raw_files = list_files_in_dir(input_dir, extensions=SUPPORTED_EXTENSIONS)
        if not raw_files:
            # Check subdirectories
            for sub in input_dir.iterdir():
                if sub.is_dir():
                    raw_files.extend(list_files_in_dir(sub, extensions=SUPPORTED_EXTENSIONS))

        if not raw_files:
            logger.warning(f"No supported documents ({SUPPORTED_EXTENSIONS}) discovered in {input_dir}")
            return []

        # Parse all documents in natural directory order
        parsed_docs: List[ParsedDocument] = []
        for f in raw_files:
            try:
                parsed_docs.append(self.process_file(f))
            except Exception as e:
                logger.error(f"Error parsing {f.name}: {e}. Skipping file.")

        # Group into procurement packages with input directory as default package ID
        default_pkg = output_file.stem if output_file else input_dir.name
        packages = DocumentGrouper.group_by_directory_or_id(parsed_docs, default_package_id=default_pkg)
        results: List[RFPPackageExtraction] = []

        for pkg_id, pkg in packages.items():
            result = self.process_package(pkg)
            results.append(result)

            # Determine output paths
            if output_file and len(packages) == 1:
                target_json = output_file
            else:
                target_json = self.settings.output_dir / f"{pkg_id}.json"

            ensure_dir(target_json.parent)

            # 1. Output dedicated bid folder containing individual JSONs in exact file order
            bid_folder_dir = target_json.parent / pkg_id
            ensure_dir(bid_folder_dir)

            manifest_files = []
            for doc_item in result.per_document_extractions:
                doc_json_path = bid_folder_dir / f"{doc_item.stem}.json"
                save_json(doc_item.fields, doc_json_path)
                manifest_files.append({
                    "order": doc_item.order,
                    "input_file": doc_item.filename,
                    "output_json": f"{doc_item.stem}.json",
                    "file_type": doc_item.file_type,
                    "role": doc_item.role,
                    "verified_fields": doc_item.summary.get("verified", 0),
                })
                logger.info(f"  -> [{doc_item.order}/{len(result.per_document_extractions)}] Wrote per-file JSON: {doc_json_path.name}")

            manifest_path = bid_folder_dir / "_manifest.json"
            save_json({
                "bid_id": pkg_id,
                "total_files": len(result.per_document_extractions),
                "files_in_order": manifest_files,
            }, manifest_path)

            # 2. Output consolidated package JSON
            save_json(result.to_clean_json(), target_json)
            logger.info(f"Wrote consolidated 20-field package JSON to: {target_json}")

            # 3. Always save audit JSON for full provenance and conflict override tracking
            audit_json = target_json.parent / f"{target_json.stem}_audit.json"
            save_json(result.to_audit_json(), audit_json)
            logger.info(f"Wrote comprehensive audit JSON to: {audit_json}")

        return results

