"""Unit tests for HTMLParser."""

from pathlib import Path
import pytest
from src.parser.html_parser import HTMLParser


def test_html_parser_on_bidnet_direct():
    """Verify HTML parser removes boilerplate and extracts structured fields from real bid HTML."""
    candidates = [
        Path("backend/data/reference/input/bid2/Dell Laptops w_Extended Warranty - Bid Information - {3} _ BidNet Direct.html"),
        Path("data/reference/input/bid2/Dell Laptops w_Extended Warranty - Bid Information - {3} _ BidNet Direct.html"),
        Path("backend/data/input/bid2/Dell Laptops w_Extended Warranty - Bid Information - {3} _ BidNet Direct.html"),
        Path("data/input/bid2/Dell Laptops w_Extended Warranty - Bid Information - {3} _ BidNet Direct.html"),
    ]
    html_path = next((p for p in candidates if p.exists()), candidates[0])
    if not html_path.exists():
        pytest.skip(f"Test file not found: {html_path}")

    parser = HTMLParser()
    doc = parser.parse(html_path)

    assert doc.file_type == "html"
    assert "Dell Laptops" in doc.title
    assert len(doc.pages) == 1
    # Check that navigation boilerplate was removed
    assert "<script>" not in doc.full_text
    assert "<style>" not in doc.full_text
    # Check structured key values were extracted
    kvs = doc.metadata.get("structured_fields", {})
    assert "Reference Number" in kvs
    assert kvs["Reference Number"] == "00004079359"
    assert "State of Maryland Treasurer's Office" in kvs.get("Issuing Organization", "")


def test_html_parser_synthetic_boilerplate_removal(tmp_path):
    """Verify boilerplate removal on synthetic HTML."""
    html_content = """
    <html>
      <head>
        <title>Procurement Notice</title>
        <script>alert('noise');</script>
        <style>.test{color:red;}</style>
      </head>
      <body>
        <nav><a href="/">Home</a><a href="/menu">Menu</a></nav>
        <h1>Solicitation 2026-X</h1>
        <p>This is genuine solicitation text.</p>
        <table>
          <tr><td>Bid Deadline:</td><td>August 15, 2026 5:00 PM EST</td></tr>
        </table>
        <footer>Copyright 2026 Procurement Org</footer>
      </body>
    </html>
    """
    test_file = tmp_path / "synthetic.html"
    test_file.write_text(html_content, encoding="utf-8")

    parser = HTMLParser()
    doc = parser.parse(test_file)

    assert doc.title == "Procurement Notice"
    assert "genuine solicitation text" in doc.full_text
    assert "alert('noise')" not in doc.full_text
    assert "Copyright 2026" not in doc.full_text
    assert "August 15, 2026 5:00 PM EST" in doc.full_text
