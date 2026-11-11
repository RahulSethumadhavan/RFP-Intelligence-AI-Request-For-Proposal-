"""Assignment-Specific Unit Tests for Addendum Precedence and Conflict Resolution.

Verifies that when an Addendum conflicts with an Original Solicitation,
the Addendum value is preferred, the conflict reason is tracked, and
the resolution abstraction works for any arbitrary procurement field.
"""

import pytest
from src.processing.conflict_resolver import CandidateFieldValue, ConflictResolver


def test_addendum_precedence_reusable_abstraction():
    """Generic test abstraction establishing that later addendum supersedes original value."""
    # Setup candidate extractions
    original_cand = CandidateFieldValue(
        field_name="due_date",
        value="June 27, 2024 2:00 PM",
        source_document="Original_RFP.pdf",
        authority_weight=50,
        doc_role="MAIN_SOLICITATION",
        page_number=2,
        evidence_text="Solicitation Due 27-JUN-2024 14:00:00",
    )

    addendum_cand = CandidateFieldValue(
        field_name="due_date",
        value="July 9, 2024 2:00 PM CST",
        source_document="Addendum_2.pdf",
        authority_weight=102,
        doc_role="ADDENDUM",
        page_number=1,
        evidence_text="The new due date for this RFP will be July 9, 2024 at 2:00 PM CST.",
    )

    record, evidence, log = ConflictResolver.resolve_candidates([original_cand, addendum_cand])

    # 1. Verify authoritative addendum won
    assert record.due_date == "July 9, 2024 2:00 PM CST"

    # 2. Verify evidence points to the addendum
    assert evidence["due_date"].source_document == "Addendum_2.pdf"
    assert evidence["due_date"].status == "superseded_by_addendum"

    # 3. Verify conflict log recorded the exact reasoning
    assert len(log) == 1
    entry = log[0]
    assert entry["field"] == "due_date"
    assert entry["selected_value"] == "July 9, 2024 2:00 PM CST"
    assert entry["previous_value"] == "June 27, 2024 2:00 PM"
    assert entry["resolution_type"] == "addendum_precedence"
    assert "Authoritative addendum precedence" in entry["reason"]


def test_addendum_precedence_on_arbitrary_custom_field():
    """Verify precedence works for non-date fields, e.g. payment_terms or specifications."""
    original_spec = CandidateFieldValue(
        field_name="product_specification",
        value="Display monitor with USB 3.0 required",
        source_document="Original_RFP.pdf",
        authority_weight=50,
        doc_role="MAIN_SOLICITATION",
    )

    addendum_spec = CandidateFieldValue(
        field_name="product_specification",
        value="Display monitor with USB 3.1 minimum requirement",
        source_document="Addendum_1.pdf",
        authority_weight=101,
        doc_role="ADDENDUM",
    )

    record, evidence, log = ConflictResolver.resolve_candidates([original_spec, addendum_spec])

    assert record.product_specification == "Display monitor with USB 3.1 minimum requirement"
    assert evidence["product_specification"].source_document == "Addendum_1.pdf"
    assert len(log) == 1
    assert log[0]["resolution_type"] == "addendum_precedence"


def test_later_addendum_supersedes_earlier_addendum():
    """Verify that Addendum 2 (weight 102) supersedes Addendum 1 (weight 101)."""
    add1 = CandidateFieldValue(
        field_name="due_date",
        value="July 1, 2024",
        source_document="Addendum_1.pdf",
        authority_weight=101,
        doc_role="ADDENDUM",
    )

    add2 = CandidateFieldValue(
        field_name="due_date",
        value="July 9, 2024",
        source_document="Addendum_2.pdf",
        authority_weight=102,
        doc_role="ADDENDUM",
    )

    record, evidence, log = ConflictResolver.resolve_candidates([add1, add2])
    assert record.due_date == "July 9, 2024"
    assert evidence["due_date"].source_document == "Addendum_2.pdf"
