"""Unit tests for TextParser."""

import pytest
from pathlib import Path
from src.parser.text_parser import TextParser


def test_text_parser_basic(tmp_path: Path):
    sample_text = """Dallas Independent School District
RFP JA-207652
Student and Staff Computing Devices

Due Date: July 9, 2024 at 2:00 PM CST
Contact: Jasmine Alzate, Buyer

Specifications:
Laptops and touch display monitors with USB 3.1 minimum connectivity.
"""
    txt_file = tmp_path / "test_rfp.txt"
    txt_file.write_text(sample_text, encoding="utf-8")

    parser = TextParser(chars_per_page=500)
    parsed = parser.parse(txt_file)

    assert parsed.file_type == "text"
    assert parsed.file_name == "test_rfp.txt"
    assert parsed.total_pages >= 1
    assert "July 9, 2024" in parsed.full_text
    assert parsed.title is not None
    assert "JA-207652" in parsed.title or "RFP" in parsed.title or "Dallas" in parsed.title


def test_text_parser_page_splitting(tmp_path: Path):
    text_content = "Page 1 content\n" + ("x" * 600) + "\n\nPage 2 content\n" + ("y" * 600)
    text_file = tmp_path / "large_rfp.text"
    text_file.write_text(text_content, encoding="utf-8")

    parser = TextParser(chars_per_page=500)
    parsed = parser.parse(text_file)

    assert parsed.file_type == "text"
    assert parsed.total_pages >= 2
    assert parsed.get_page(1) is not None
    assert parsed.get_page(2) is not None
