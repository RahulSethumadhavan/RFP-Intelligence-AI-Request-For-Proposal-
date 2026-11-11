"""Document classification, role assignment, and multi-document grouping."""

import logging
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from src.parser.base_parser import ParsedDocument

logger = logging.getLogger(__name__)


@dataclass
class ClassifiedDocument:
    """Document enriched with classification metadata and legal authority weighting."""
    parsed_doc: ParsedDocument
    role: str  # 'MAIN_SOLICITATION', 'ADDENDUM', 'SPEC_SHEET', 'AFFIDAVIT', 'WEB_PORTAL', 'UNKNOWN'
    authority_weight: int
    addendum_number: Optional[int] = None

    @property
    def file_name(self) -> str:
        return self.parsed_doc.file_name


@dataclass
class DocumentPackage:
    """A collection of related documents belonging to a single procurement / bid."""
    package_id: str
    documents: List[ClassifiedDocument] = field(default_factory=list)

    def get_most_authoritative_document(self) -> Optional[ClassifiedDocument]:
        """Return the document with the highest legal precedence."""
        if not self.documents:
            return None
        return max(self.documents, key=lambda d: d.authority_weight)

    def get_addenda(self) -> List[ClassifiedDocument]:
        """Return all addenda sorted by sequence number ascending."""
        addenda = [d for d in self.documents if d.role == "ADDENDUM"]
        return sorted(addenda, key=lambda d: d.addendum_number or 0)


class DocumentGrouper:
    """Classifies document roles and groups multi-document procurement packages."""

    @classmethod
    def classify_document(cls, doc: ParsedDocument) -> ClassifiedDocument:
        """Classify document role based on filename and header content."""
        fname = doc.file_name.lower()
        full_head = doc.full_text[:1000].lower() if doc.pages else ""

        # Check for Addenda
        m_add = re.search(r"addendum\s*(?:no\.?|#)?\s*(\d+)", fname) or re.search(r"addendum\s*(?:no\.?|#)?\s*(\d+)", full_head)
        if m_add or "addendum" in fname or "amendment" in fname:
            seq = int(m_add.group(1)) if m_add else 1
            # Base authority for addenda is 100 + sequence number so later addenda prevail
            weight = 100 + seq
            return ClassifiedDocument(
                parsed_doc=doc,
                role="ADDENDUM",
                authority_weight=weight,
                addendum_number=seq,
            )

        # Check for Specs
        if any(w in fname for w in ["spec", "specs", "specification", "hardware_specs"]):
            return ClassifiedDocument(
                parsed_doc=doc,
                role="SPEC_SHEET",
                authority_weight=40,
            )

        # Check for Affidavits / legal attachments
        if any(w in fname for w in ["affidavit", "cert", "form", "mwbe", "attachment"]):
            return ClassifiedDocument(
                parsed_doc=doc,
                role="AFFIDAVIT",
                authority_weight=20,
            )

        # Check for Web portal capture (HTML)
        if doc.file_type == "html" or "bidnet" in fname:
            return ClassifiedDocument(
                parsed_doc=doc,
                role="WEB_PORTAL",
                authority_weight=30,
            )

        # Check for Main RFP / Solicitation
        if any(w in fname for w in ["rfp", "porfp", "solicitation", "bid", "final"]):
            return ClassifiedDocument(
                parsed_doc=doc,
                role="MAIN_SOLICITATION",
                authority_weight=50,
            )

        # Default fallback
        return ClassifiedDocument(
            parsed_doc=doc,
            role="UNKNOWN",
            authority_weight=10,
        )

    @classmethod
    def group_by_directory_or_id(
        cls, parsed_docs: List[ParsedDocument], default_package_id: Optional[str] = None
    ) -> Dict[str, DocumentPackage]:
        """Group documents into packages by parent directory or shared solicitation IDs."""
        groups: Dict[str, DocumentPackage] = {}

        parent_dirs = {
            doc.file_path.parent.name.lower()
            for doc in parsed_docs
            if doc.file_path and doc.file_path.parent.name.lower() not in ["input", "data"]
        }

        forced_pkg_id = default_package_id
        if not forced_pkg_id and len(parent_dirs) == 1:
            forced_pkg_id = list(parent_dirs)[0]

        for doc in parsed_docs:
            classified = cls.classify_document(doc)
            if forced_pkg_id:
                pkg_id = forced_pkg_id
            else:
                parent_name = doc.file_path.parent.name.lower() if doc.file_path else "default"
                if parent_name.startswith("bid") or parent_name.startswith("rfp"):
                    pkg_id = parent_name
                else:
                    m_id = re.search(r"(ja-\d+|\d{6}|e20p\d+|bpm\d+)", doc.file_name.lower())
                    pkg_id = m_id.group(1).upper() if m_id else parent_name

            if pkg_id not in groups:
                groups[pkg_id] = DocumentPackage(package_id=pkg_id)

            groups[pkg_id].documents.append(classified)
            logger.info(
                f"Grouped '{doc.file_name}' into package '{pkg_id}' as {classified.role} "
                f"(Authority: {classified.authority_weight})"
            )

        return groups
