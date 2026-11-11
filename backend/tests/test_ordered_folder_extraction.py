"""Integration test for ordered bid folder analysis and per-file JSON extractions."""

import json
from pathlib import Path
# pyrefly: ignore [missing-import]
import pymupdf

from src.config import Settings
from src.pipeline import RFPExtractionPipeline


def create_minimal_pdf(path: Path, text: str):
    """Create a real minimal PDF with PyMuPDF."""
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), text, fontsize=11)
    doc.save(str(path))
    doc.close()


def test_ordered_bid_folder_extraction(tmp_path: Path):
    """Verify that analyzing an entire bid folder containing mixed documents (.pdf, .html, .text)
    extracts each file in order and outputs matching individual JSON files inside the folder:
    
    bid_folder/file1.pdf -> output/bid_folder/file1.json
    bid_folder/file2.pdf -> output/bid_folder/file2.json
    bid_folder/filet3.html -> output/bid_folder/filet3.json
    bid_folder/file4.text -> output/bid_folder/file4.json
    """
    bid_folder = tmp_path / "bid_folder"
    bid_folder.mkdir(parents=True, exist_ok=True)
    out_dir = tmp_path / "output"
    out_dir.mkdir(parents=True, exist_ok=True)

    # 1. file1.pdf
    create_minimal_pdf(
        bid_folder / "file1.pdf",
        "RFP JA-207652 Main Solicitation\nStudent and Staff Computing Devices\nDue Date: June 27, 2024 at 2:00 PM CST\nDallas Independent School District"
    )

    # 2. file2.pdf
    create_minimal_pdf(
        bid_folder / "file2.pdf",
        "Addendum 2 RFP JA-207652\nDue date is hereby extended to July 9, 2024 at 2:00 PM CST."
    )

    # 3. filet3.html
    html_content = """<!DOCTYPE html>
    <html><body>
      <h1>BidNet Direct Posting #168884</h1>
      <p>Dallas Independent School District</p>
      <p>Due Date: 07/09/2024 03:00 PM EDT</p>
    </body></html>"""
    (bid_folder / "filet3.html").write_text(html_content, encoding="utf-8")

    # 4. file4.text
    text_content = """Title: Technical Specifications Supplement
Commodity: Computing Devices and Display Monitors
Contact: procurement@agency.gov
Delivery: Within 30 days of purchase order
"""
    (bid_folder / "file4.text").write_text(text_content, encoding="utf-8")

    # Run pipeline on bid folder
    settings = Settings.load(demo_mode=True)
    settings.output_dir = out_dir
    pipeline = RFPExtractionPipeline(settings)

    results = pipeline.run_on_directory(bid_folder)
    assert len(results) == 1

    package_res = results[0]
    assert package_res.bid_id == "bid_folder"

    # Verify per-document extractions are in exact order 1..4
    assert len(package_res.per_document_extractions) == 4
    expected_order = [
        ("file1.pdf", "file1.json"),
        ("file2.pdf", "file2.json"),
        ("filet3.html", "filet3.json"),
        ("file4.text", "file4.json"),
    ]

    for idx, (exp_in, exp_out) in enumerate(expected_order, start=1):
        item = package_res.per_document_extractions[idx - 1]
        assert item.order == idx
        assert item.filename == exp_in
        assert item.json_filename == exp_out
        assert len(item.fields) == 20  # All 20 fields present in each file's JSON

    # Verify output directory structure:
    # output/bid_folder/file1.json
    # output/bid_folder/file2.json
    # output/bid_folder/filet3.json
    # output/bid_folder/file4.json
    # output/bid_folder/_manifest.json
    # output/bid_folder.json
    folder_output = out_dir / "bid_folder"
    assert folder_output.exists()
    assert (folder_output / "file1.json").exists()
    assert (folder_output / "file2.json").exists()
    assert (folder_output / "filet3.json").exists()
    assert (folder_output / "file4.json").exists()
    assert (folder_output / "_manifest.json").exists()
    assert (out_dir / "bid_folder.json").exists()

    # Verify individual JSON contents have valid 20 fields
    for _, exp_out in expected_order:
        json_path = folder_output / exp_out
        data = json.loads(json_path.read_text(encoding="utf-8"))
        assert isinstance(data, dict)
        assert len(data) == 20
        assert "bid_number" in data
        assert "due_date" in data
        assert "title" in data

    # Verify manifest order
    manifest = json.loads((folder_output / "_manifest.json").read_text(encoding="utf-8"))
    assert manifest["total_files"] == 4
    assert manifest["files_in_order"][0]["input_file"] == "file1.pdf"
    assert manifest["files_in_order"][0]["output_json"] == "file1.json"
    assert manifest["files_in_order"][1]["input_file"] == "file2.pdf"
    assert manifest["files_in_order"][1]["output_json"] == "file2.json"
    assert manifest["files_in_order"][2]["input_file"] == "filet3.html"
    assert manifest["files_in_order"][2]["output_json"] == "filet3.json"
    assert manifest["files_in_order"][3]["input_file"] == "file4.text"
    assert manifest["files_in_order"][3]["output_json"] == "file4.json"
