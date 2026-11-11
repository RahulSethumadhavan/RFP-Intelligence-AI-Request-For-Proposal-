"""Conflict and Addendum Resolution Engine for multi-document procurements."""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

from src.processing.document_grouper import ClassifiedDocument, DocumentPackage
from src.schema.rfp_schema import FieldEvidence, RFPExtractionRecord

logger = logging.getLogger(__name__)


@dataclass
class CandidateFieldValue:
    """Candidate value for a procurement field extracted from a specific document."""
    field_name: str
    value: str
    source_document: str
    authority_weight: int
    doc_role: str
    page_number: Optional[int] = None
    evidence_text: Optional[str] = None


class ConflictResolver:
    """Resolves conflicting values across original solicitations, addenda, and supporting documents."""

    @classmethod
    def resolve_candidates(
        cls,
        candidates: List[CandidateFieldValue],
        package: Optional[DocumentPackage] = None,
    ) -> Tuple[RFPExtractionRecord, Dict[str, FieldEvidence], List[Dict[str, Any]]]:
        """Resolve a list of candidate extractions into a single authoritative 20-field record."""
        # Group candidates by field name
        field_groups: Dict[str, List[CandidateFieldValue]] = {}
        for c in candidates:
            field_groups.setdefault(c.field_name, []).append(c)

        resolved_dict: Dict[str, str] = {}
        evidence_dict: Dict[str, FieldEvidence] = {}
        resolution_log: List[Dict[str, Any]] = []

        # Iterate through all 20 required fields
        dummy_record = RFPExtractionRecord()
        all_fields = list(dummy_record.model_dump().keys())

        for field_name in all_fields:
            cands = field_groups.get(field_name, [])
            # Filter out empty or "Not Specified" candidates if any specified ones exist
            specified_cands = [
                c for c in cands if c.value and c.value.strip().lower() not in ("not specified", "none", "null")
            ]

            if not specified_cands:
                # No specified values found across documents
                resolved_dict[field_name] = "Not Specified"
                evidence_dict[field_name] = FieldEvidence(
                    field_name=field_name,
                    value="Not Specified",
                    source_document="N/A",
                    status="not_specified",
                    confidence_note="Field absent or unmentioned across all package documents",
                )
                continue

            if len(specified_cands) == 1:
                # Single candidate, no conflict
                winner = specified_cands[0]
                resolved_dict[field_name] = winner.value
                evidence_dict[field_name] = FieldEvidence(
                    field_name=field_name,
                    value=winner.value,
                    source_document=winner.source_document,
                    page_number=winner.page_number,
                    evidence_text=winner.evidence_text,
                    status="verified",
                )
                continue

            # Multiple candidates: check for conflict and resolve by authority and addendum rules
            winner, log_entry = cls._resolve_field_conflict(field_name, specified_cands)
            resolved_dict[field_name] = winner.value
            evidence_dict[field_name] = FieldEvidence(
                field_name=field_name,
                value=winner.value,
                source_document=winner.source_document,
                page_number=winner.page_number,
                evidence_text=winner.evidence_text,
                status="verified" if winner.doc_role != "ADDENDUM" else "superseded_by_addendum",
                confidence_note=f"Resolved via {log_entry['reason']}" if log_entry else None,
            )
            if log_entry:
                resolution_log.append(log_entry)

        final_record = RFPExtractionRecord(**resolved_dict)
        return final_record, evidence_dict, resolution_log

    @classmethod
    def _resolve_field_conflict(
        cls, field_name: str, candidates: List[CandidateFieldValue]
    ) -> Tuple[CandidateFieldValue, Optional[Dict[str, Any]]]:
        """Resolve conflict between multiple non-empty candidate values."""
        # Sort candidates descending by authority weight
        sorted_cands = sorted(candidates, key=lambda c: c.authority_weight, reverse=True)
        winner = sorted_cands[0]

        # Check if any lower-ranked candidate differed
        differing = [
            c for c in sorted_cands[1:] if c.value.strip().lower() != winner.value.strip().lower()
        ]

        if not differing:
            # Values agreed across documents
            return winner, None

        # Conflict detected!
        alt = differing[0]
        if winner.doc_role == "ADDENDUM":
            reason = (
                f"Authoritative addendum precedence: '{winner.source_document}' (weight {winner.authority_weight}) "
                f"superseded '{alt.source_document}' (weight {alt.authority_weight})"
            )
            res_type = "addendum_precedence"
        elif winner.authority_weight > alt.authority_weight:
            reason = (
                f"Document authority hierarchy: '{winner.source_document}' ({winner.doc_role}) "
                f"takes precedence over '{alt.source_document}' ({alt.doc_role})"
            )
            res_type = "authority_hierarchy"
        else:
            # Equal weight, prefer more descriptive value
            if len(winner.value) < len(alt.value):
                winner, alt = alt, winner
            reason = "Selected more comprehensive specification value among equal-authority sources"
            res_type = "specificity_preference"

        log_entry = {
            "field": field_name,
            "selected_value": winner.value,
            "selected_source": winner.source_document,
            "previous_value": alt.value,
            "previous_source": alt.source_document,
            "reason": reason,
            "resolution_type": res_type,
        }

        logger.info(f"Conflict Resolved for [{field_name}]: {reason}")
        return winner, log_entry
