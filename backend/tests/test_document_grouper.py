"""Unit tests for document classification and package grouping."""

from pathlib import Path
from src.parser.base_parser import ParsedDocument
from src.processing.document_grouper import DocumentGrouper


def test_classify_document_roles():
    """Verify document role and authority weight assignments."""
    doc_addendum = ParsedDocument(
        file_path=Path("bid1/Addendum 2 RFP JA-207652.pdf"),
        file_name="Addendum 2 RFP JA-207652.pdf",
        file_type="pdf",
    )
    classified_add = DocumentGrouper.classify_document(doc_addendum)
    assert classified_add.role == "ADDENDUM"
    assert classified_add.addendum_number == 2
    assert classified_add.authority_weight == 102

    doc_rfp = ParsedDocument(
        file_path=Path("bid1/JA-207652 FINAL.pdf"),
        file_name="JA-207652 FINAL.pdf",
        file_type="pdf",
    )
    classified_rfp = DocumentGrouper.classify_document(doc_rfp)
    assert classified_rfp.role == "MAIN_SOLICITATION"
    assert classified_rfp.authority_weight == 50

    doc_specs = ParsedDocument(
        file_path=Path("bid2/Dell_Laptop_Specs.pdf"),
        file_name="Dell_Laptop_Specs.pdf",
        file_type="pdf",
    )
    classified_specs = DocumentGrouper.classify_document(doc_specs)
    assert classified_specs.role == "SPEC_SHEET"
    assert classified_specs.authority_weight == 40


def test_grouping_by_parent_directory():
    """Verify multiple files from same directory form a single package."""
    d1 = ParsedDocument(file_path=Path("bid1/file1.pdf"), file_name="file1.pdf", file_type="pdf")
    d2 = ParsedDocument(file_path=Path("bid1/file2.pdf"), file_name="file2.pdf", file_type="pdf")
    d3 = ParsedDocument(file_path=Path("bid2/file3.pdf"), file_name="file3.pdf", file_type="pdf")

    packages = DocumentGrouper.group_by_directory_or_id([d1, d2, d3])
    assert "bid1" in packages
    assert "bid2" in packages
    assert len(packages["bid1"].documents) == 2
    assert len(packages["bid2"].documents) == 1
