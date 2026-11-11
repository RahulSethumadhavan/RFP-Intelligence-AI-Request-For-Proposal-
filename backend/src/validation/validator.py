"""Validation module ensuring integrity, 20-field completeness, and hallucination checks."""

import logging
import re
from typing import Any, Dict, List, Tuple
from src.schema.rfp_schema import RFPExtractionRecord

logger = logging.getLogger(__name__)

MANDATORY_20_FIELDS = [
    "bid_number",
    "title",
    "due_date",
    "bid_submission_type",
    "term_of_bid",
    "pre_bid_meeting",
    "installation",
    "bid_bond_requirement",
    "delivery_date",
    "payment_terms",
    "additional_documentation_required",
    "mfg_for_registration",
    "contract_or_cooperative_to_use",
    "model_no",
    "part_no",
    "product",
    "contact_info",
    "company_name",
    "bid_summary",
    "product_specification",
]

SUSPICIOUS_HALLUCINATIONS = [
    r"\bplaceholder\b",
    r"\binsert\s+\w+\s+here\b",
    r"\blorem\s+ipsum\b",
    r"\[TBD\]",
    r"\[to be determined\]",
    r"\[your\s+\w+\]",
    r"\bunknown\s+vendor\b",
]


class ExtractionValidator:
    """Validates raw dictionaries and Pydantic records against rigorous RFP quality standards."""

    @classmethod
    def validate_record(cls, data: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """Validate that all 20 fields are present, valid types, and free of hallucination artifacts."""
        errors: List[str] = []

        # 1. Missing keys
        for f in MANDATORY_20_FIELDS:
            if f not in data:
                errors.append(f"Missing mandatory field: '{f}'")

        # 2. Unexpected extraneous keys
        for k in data.keys():
            if k not in MANDATORY_20_FIELDS:
                errors.append(f"Unexpected extra field in output: '{k}'")

        # 3. Value validations & Hallucination checks
        for k, v in data.items():
            if k in MANDATORY_20_FIELDS:
                if not isinstance(v, str):
                    errors.append(f"Field '{k}' must be string, found {type(v).__name__}")
                    continue

                # Check for suspicious hallucination placeholders
                for pattern in SUSPICIOUS_HALLUCINATIONS:
                    if re.search(pattern, v, re.I):
                        errors.append(f"Suspicious placeholder pattern '{pattern}' detected in field '{k}': '{v}'")

        is_valid = len(errors) == 0
        if not is_valid:
            logger.warning(f"Validation failed with {len(errors)} issues: {errors}")
        else:
            logger.info("Validation passed successfully: All 20 fields verified.")

        return is_valid, errors

    @classmethod
    def enforce_pydantic(cls, data: Dict[str, Any]) -> RFPExtractionRecord:
        """Coerce data into validated RFPExtractionRecord, filling missing fields with 'Not Specified'."""
        cleaned = {}
        for f in MANDATORY_20_FIELDS:
            val = data.get(f, "Not Specified")
            if val is None or (isinstance(val, str) and not val.strip()):
                cleaned[f] = "Not Specified"
            else:
                cleaned[f] = str(val).strip()
        return RFPExtractionRecord(**cleaned)
