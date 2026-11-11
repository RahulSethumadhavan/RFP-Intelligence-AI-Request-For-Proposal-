"""Evidence and audit traceability tracker."""

import logging
from typing import Dict, List, Optional
from src.schema.rfp_schema import FieldEvidence

logger = logging.getLogger(__name__)


class EvidenceTracker:
    """Manages ground-truth provenance and traceability for extracted procurement fields."""

    def __init__(self):
        self._evidence_store: Dict[str, FieldEvidence] = {}

    def record_evidence(
        self,
        field_name: str,
        value: str,
        source_document: str,
        page_number: Optional[int] = None,
        evidence_text: Optional[str] = None,
        status: str = "verified",
        confidence_note: Optional[str] = None,
    ) -> FieldEvidence:
        """Record or update evidence for an extracted field."""
        ev = FieldEvidence(
            field_name=field_name,
            value=value,
            source_document=source_document,
            page_number=page_number,
            evidence_text=evidence_text,
            status=status,
            confidence_note=confidence_note,
        )
        self._evidence_store[field_name] = ev
        return ev

    def get_evidence(self, field_name: str) -> Optional[FieldEvidence]:
        """Retrieve evidence for a field."""
        return self._evidence_store.get(field_name)

    def get_all_evidence(self) -> Dict[str, FieldEvidence]:
        """Retrieve all recorded evidence."""
        return self._evidence_store.copy()

    def format_summary(self) -> str:
        """Format a human-readable evidence table."""
        lines = [
            f"{'Field':<35} | {'Source Document':<30} | {'Page':<5} | {'Status':<15}",
            "-" * 95,
        ]
        for f_name, ev in sorted(self._evidence_store.items()):
            page_str = str(ev.page_number) if ev.page_number else "-"
            lines.append(
                f"{f_name:<35} | {ev.source_document[:30]:<30} | {page_str:<5} | {ev.status:<15}"
            )
        return "\n".join(lines)
