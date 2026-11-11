"""Command Line Interface for RFP Intelligence Extractor."""

import argparse
import logging
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from src.config import Settings
from src.pipeline import RFPExtractionPipeline


def setup_logging(debug: bool = False) -> None:
    """Configure structured logging output."""
    level = logging.DEBUG if debug else logging.INFO
    log_format = "%(asctime)s | %(levelname)-7s | %(message)s"
    logging.basicConfig(
        level=level,
        format=log_format,
        datefmt="%H:%M:%S",
        handlers=[logging.StreamHandler(sys.stdout)],
    )


def print_summary_table(bid_id: str, fields: dict) -> None:
    """Print an attractive summary table of extracted fields to stdout."""
    print("\n" + "=" * 90)
    print(f"  RFP EXTRACTION SUMMARY FOR PACKAGE: {bid_id.upper()}")
    print("=" * 90)
    for idx, (k, v) in enumerate(fields.items(), start=1):
        # Truncate long values cleanly for console display
        display_v = (v[:65] + "...") if len(v) > 68 else v
        print(f"  {idx:2d}. {k:<34} : {display_v}")
    print("=" * 90 + "\n")


from src.utils.file_utils import SUPPORTED_EXTENSIONS


def print_ordered_files_table(bid_id: str, per_doc_extractions: list) -> None:
    """Print an attractive summary table showing ordered input files and their corresponding output JSONs."""
    if not per_doc_extractions:
        return
    print("\n" + "=" * 94)
    print(f"  ORDERED FILE EXTRACTION FLOW FOR BID FOLDER: {bid_id.upper()} ({len(per_doc_extractions)} files)")
    print("=" * 94)
    for doc in per_doc_extractions:
        verified = doc.summary.get("verified", 0) if isinstance(doc.summary, dict) else 0
        print(f"  [{doc.order:d}/{len(per_doc_extractions):d}] Input: {doc.filename[:32]:<32} -> Output: {bid_id}/{doc.json_filename} [Fields: {verified}/20, {doc.role}]")
    print("=" * 94 + "\n")


def parse_args() -> argparse.Namespace:
    """Parse command line flags."""
    parser = argparse.ArgumentParser(
        description="RFP Intelligence Extractor — Modular procurement document extraction pipeline.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        default=None,
        help="Path to custom input directory or file (PDF/HTML/TEXT)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default=None,
        help="Path to output JSON file (default: data/output/<package_id>.json)",
    )
    parser.add_argument(
        "--sample",
        action="store_true",
        help="Process benchmark reference sample bids (Bid 1 and Bid 2)",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in deterministic offline demo mode without calling external LLM APIs",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging and export extended provenance audit JSONs",
    )
    return parser.parse_args()


def main() -> int:
    """CLI entrypoint."""
    args = parse_args()
    setup_logging(debug=args.debug)
    logger = logging.getLogger("RFP_CLI")

    logger.info("Initializing RFP Intelligence Extractor...")
    settings = Settings.load(demo_mode=args.demo, debug=args.debug)

    pipeline = RFPExtractionPipeline(settings)

    # Determine input directory
    if args.input:
        in_path = Path(args.input)
        if not in_path.exists():
            logger.error(f"Provided input path does not exist: {in_path}")
            return 1
        out_file = Path(args.output) if args.output else None
        results = pipeline.run_on_directory(in_path, output_file=out_file)
    elif args.sample:
        # Process sample benchmark packages from reference directory
        sample_dir = settings.reference_dir / "input"
        if not sample_dir.exists():
            logger.error(f"Reference sample directory not found: {sample_dir}")
            return 1
        logger.info(f"Processing reference benchmark sample bids from: {sample_dir}")
        results = pipeline.run_on_directory(sample_dir, output_file=None)
    else:
        # Dynamically scan user input directory for custom packages or documents
        subdirs = [d for d in settings.input_dir.iterdir() if d.is_dir()] if settings.input_dir.exists() else []
        results = []
        if subdirs:
            for subdir in sorted(subdirs):
                logger.info(f"--- Processing custom package: {subdir.name} ---")
                res = pipeline.run_on_directory(subdir, output_file=settings.output_dir / f"{subdir.name}.json")
                results.extend(res)
        else:
            # Check for direct documents in input_dir
            doc_files = [f for f in settings.input_dir.glob("*") if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS] if settings.input_dir.exists() else []
            if doc_files:
                logger.info(f"Processing documents found in {settings.input_dir}...")
                results = pipeline.run_on_directory(settings.input_dir)
            else:
                logger.info("No documents found in active data/input directory.")
                logger.info("Usage options:")
                logger.info("  1. Custom Bid:   python main.py --input <path_to_folder_or_file>")
                logger.info("  2. Benchmark:    python main.py --sample --demo")
                logger.info("  3. Web App:      python api.py (drag-and-drop custom RFPs in UI)")
                return 0

    # Display results summary
    logger.info(f"Pipeline finished! Extracted {len(results)} package(s).")
    for r in results:
        # Print ordered per-file JSON table
        if r.per_document_extractions:
            print_ordered_files_table(r.bid_id, r.per_document_extractions)
        print_summary_table(r.bid_id, r.to_clean_json())
        if r.conflict_resolutions:
            print(f"  * Addendum/Conflict Resolutions for {r.bid_id.upper()}:")
            for cr in r.conflict_resolutions:
                print(f"    - Field: {cr['field']}")
                print(f"      Selected: {cr['selected_value']} (from {cr['selected_source']})")
                print(f"      Reason: {cr['reason']}")
            print()

    return 0



if __name__ == "__main__":
    sys.exit(main())
