"""Unit tests for PDFParser."""

from pathlib import Path
import pytest
from src.parser.pdf_parser import PDFParser


def test_pdf_parser_on_real_addendum():
    """Verify parsing of Addendum 2 PDF."""
    candidates = [
        Path("backend/data/reference/input/bid1/Addendum 2 RFP JA-207652 Student and Staff Computing Devices.pdf"),
        Path("data/reference/input/bid1/Addendum 2 RFP JA-207652 Student and Staff Computing Devices.pdf"),
        Path("backend/data/input/bid1/Addendum 2 RFP JA-207652 Student and Staff Computing Devices.pdf"),
        Path("data/input/bid1/Addendum 2 RFP JA-207652 Student and Staff Computing Devices.pdf"),
    ]
    pdf_path = next((p for p in candidates if p.exists()), candidates[0])
    if not pdf_path.exists():
        pytest.skip(f"Test file not found: {pdf_path}")

    parser = PDFParser()
    doc = parser.parse(pdf_path)

    assert doc.file_name == "Addendum 2 RFP JA-207652 Student and Staff Computing Devices.pdf"
    assert doc.file_type == "pdf"
    assert len(doc.pages) == 1
    assert "July 9, 2024 at 2:00 PM CST" in doc.pages[0].text
    assert "JA-207652" in doc.pages[0].text


def test_pdf_parser_nonexistent_file():
    """Verify parser raises FileNotFoundError on missing file."""
    parser = PDFParser()
    with pytest.raises(FileNotFoundError):
        parser.parse(Path("data/input/nonexistent.pdf"))


def test_pdf_parser_cleaning():
    """Verify whitespace and control character cleaning."""
    parser = PDFParser()
    raw = "  Line 1   with   spaces\n\n\n\nLine 2   \x00\x05  "
    cleaned = parser._clean_text(raw)
    assert "Line 1 with spaces" in cleaned
    assert "Line 2" in cleaned
    assert "\x00" not in cleaned
    assert "\n\n\n" not in cleaned
