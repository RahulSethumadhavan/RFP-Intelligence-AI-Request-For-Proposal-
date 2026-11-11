"""Unit tests for RFPExtractionRecord and Pydantic validation."""

import pytest
from pydantic import ValidationError
from src.schema.rfp_schema import RFPExtractionRecord
from src.validation.validator import ExtractionValidator, MANDATORY_20_FIELDS


def test_schema_has_exactly_20_required_fields():
    """Verify that the model exposes exactly the 20 mandated fields."""
    record = RFPExtractionRecord()
    d = record.to_dict()
    assert len(d) == 20
    for field in MANDATORY_20_FIELDS:
        assert field in d


def test_schema_defaults_and_null_handling():
    """Verify that None or empty values normalize to 'Not Specified'."""
    record = RFPExtractionRecord(
        bid_number="BID-100",
        due_date=None,
        payment_terms="   ",
        installation="None",
        pre_bid_meeting="N/A",
    )
    assert record.bid_number == "BID-100"
    assert record.due_date == "Not Specified"
    assert record.payment_terms == "Not Specified"
    assert record.installation == "Not Specified"
    assert record.pre_bid_meeting == "Not Specified"


def test_validator_detects_missing_keys():
    """Verify validator identifies missing required fields."""
    incomplete = {
        "bid_number": "123",
        "title": "Title",
    }
    is_valid, errors = ExtractionValidator.validate_record(incomplete)
    assert not is_valid
    assert any("Missing mandatory field: 'due_date'" in e for e in errors)


def test_validator_detects_unexpected_keys():
    """Verify validator flags extraneous fields not in the 20-field schema."""
    data = RFPExtractionRecord().to_dict()
    data["extra_unwanted_key"] = "Surprise"
    is_valid, errors = ExtractionValidator.validate_record(data)
    assert not is_valid
    assert any("Unexpected extra field" in e for e in errors)


def test_validator_flags_hallucination_placeholders():
    """Verify validator catches placeholder tokens like [Insert Date]."""
    data = RFPExtractionRecord().to_dict()
    data["due_date"] = "[Insert Date Here]"
    is_valid, errors = ExtractionValidator.validate_record(data)
    assert not is_valid
    assert any("Suspicious placeholder pattern" in e for e in errors)
