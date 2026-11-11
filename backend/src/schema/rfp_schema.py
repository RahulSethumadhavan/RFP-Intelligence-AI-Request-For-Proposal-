"""Pydantic v2 models for RFP 20-field extraction, validation, and evidence tracking."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class FieldEvidence(BaseModel):
    """Traceability representation for an individual extracted field."""

    field_name: str
    value: str
    source_document: str
    page_number: Optional[int] = None
    evidence_text: Optional[str] = None
    status: str = "verified"  # 'verified', 'not_specified', 'superseded_by_addendum'
    confidence_note: Optional[str] = None


class RFPExtractionRecord(BaseModel):
    """The mandatory 20-field structured procurement extraction record."""

    bid_number: str = Field(
        default="Not Specified",
        description="Unique solicitation, bid, or reference identifier.",
    )
    title: str = Field(
        default="Not Specified",
        description="Formal title of the procurement or RFP.",
    )
    due_date: str = Field(
        default="Not Specified",
        description="Final proposal submission deadline, date, time, and timezone.",
    )
    bid_submission_type: str = Field(
        default="Not Specified",
        description="Method of submission: electronic portal, sealed physical delivery, etc.",
    )
    term_of_bid: str = Field(
        default="Not Specified",
        description="Duration of the awarded contract, base term, and renewal options.",
    )
    pre_bid_meeting: str = Field(
        default="Not Specified",
        description="Date, time, location, or virtual link for pre-proposal conference.",
    )
    installation: str = Field(
        default="Not Specified",
        description="Installation, deployment, staging, or setup requirements.",
    )
    bid_bond_requirement: str = Field(
        default="Not Specified",
        description="Bid bond, proposal guarantee, or surety requirements.",
    )
    delivery_date: str = Field(
        default="Not Specified",
        description="Specified delivery timeline or required fulfillment date.",
    )
    payment_terms: str = Field(
        default="Not Specified",
        description="Payment terms, invoicing schedules, or prompt payment conditions.",
    )
    additional_documentation_required: str = Field(
        default="Not Specified",
        description="Required affidavits, certifications, W-9, licenses, or compliance forms.",
    )
    mfg_for_registration: str = Field(
        default="Not Specified",
        description="Original Equipment Manufacturer (OEM) required for dealer authorization.",
    )
    contract_or_cooperative_to_use: str = Field(
        default="Not Specified",
        description="Master contract vehicle, cooperative agreement, or purchasing schedule.",
    )
    model_no: str = Field(
        default="Not Specified",
        description="Manufacturer model numbers or hardware identifiers.",
    )
    part_no: str = Field(
        default="Not Specified",
        description="Part numbers, SKUs, or manufacturer catalog identifiers.",
    )
    product: str = Field(
        default="Not Specified",
        description="Primary product, service, or commodity requested.",
    )
    contact_info: str = Field(
        default="Not Specified",
        description="Buyer or procurement officer contact details: name, email, phone.",
    )
    company_name: str = Field(
        default="Not Specified",
        description="Issuing organization, government body, or school district.",
    )
    bid_summary: str = Field(
        default="Not Specified",
        description="Factual, high-level summary of the procurement objectives.",
    )
    product_specification: str = Field(
        default="Not Specified",
        description="Detailed technical specifications, configurations, and requirements.",
    )

    @field_validator("*", mode="before")
    @classmethod
    def sanitize_field_value(cls, v: Any) -> str:
        """Ensure missing, null, or empty string values normalize consistently to 'Not Specified'."""
        if v is None:
            return "Not Specified"
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned or cleaned.lower() in ("none", "null", "n/a", "na", "unknown", "not specified"):
                return "Not Specified"
            return cleaned
        return str(v).strip()

    def to_dict(self) -> Dict[str, str]:
        """Return exactly the 20-field dictionary in specified order."""
        return {
            "bid_number": self.bid_number,
            "title": self.title,
            "due_date": self.due_date,
            "bid_submission_type": self.bid_submission_type,
            "term_of_bid": self.term_of_bid,
            "pre_bid_meeting": self.pre_bid_meeting,
            "installation": self.installation,
            "bid_bond_requirement": self.bid_bond_requirement,
            "delivery_date": self.delivery_date,
            "payment_terms": self.payment_terms,
            "additional_documentation_required": self.additional_documentation_required,
            "mfg_for_registration": self.mfg_for_registration,
            "contract_or_cooperative_to_use": self.contract_or_cooperative_to_use,
            "model_no": self.model_no,
            "part_no": self.part_no,
            "product": self.product,
            "contact_info": self.contact_info,
            "company_name": self.company_name,
            "bid_summary": self.bid_summary,
            "product_specification": self.product_specification,
        }


class DocumentExtractionItem(BaseModel):
    """Extraction record for an individual document inside a procurement package."""

    order: int
    filename: str
    stem: str
    json_filename: str
    file_type: str
    role: str
    fields: Dict[str, str] = Field(default_factory=dict)
    summary: Dict[str, int] = Field(default_factory=dict)


class RFPPackageExtraction(BaseModel):
    """Encapsulates the complete extraction result with audit provenance and conflict log."""

    bid_id: str
    record: RFPExtractionRecord
    evidence: Dict[str, FieldEvidence] = Field(default_factory=dict)
    conflict_resolutions: List[Dict[str, Any]] = Field(default_factory=list)
    source_documents: List[str] = Field(default_factory=list)
    per_document_extractions: List[DocumentExtractionItem] = Field(default_factory=list)

    def to_clean_json(self) -> Dict[str, str]:
        """Export the mandatory 20 fields as required by the assignment."""
        return self.record.to_dict()

    def to_audit_json(self) -> Dict[str, Any]:
        """Export complete extraction record including full evidence and conflict resolution log."""
        return {
            "bid_id": self.bid_id,
            "fields": self.record.to_dict(),
            "evidence": {k: v.model_dump() for k, v in self.evidence.items()},
            "conflict_resolutions": self.conflict_resolutions,
            "source_documents": self.source_documents,
            "per_document_extractions": [d.model_dump() for d in self.per_document_extractions],
        }

