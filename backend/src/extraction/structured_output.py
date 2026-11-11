"""Parsing, extraction of JSON, and schema conversion from LLM responses."""

import json
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from src.processing.conflict_resolver import CandidateFieldValue
from src.schema.rfp_schema import RFPExtractionRecord
from src.validation.validator import ExtractionValidator, MANDATORY_20_FIELDS

logger = logging.getLogger(__name__)


class StructuredOutputParser:
    """Extracts and validates structured RFP records from raw LLM responses."""

    @classmethod
    def parse_response(cls, raw_text: str) -> Dict[str, Any]:
        """Extract JSON dictionary from raw model text, stripping markdown fences if present."""
        text = raw_text.strip()

        # Handle ```json ... ``` code blocks
        m_fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if m_fence:
            text = m_fence.group(1).strip()
        else:
            # Look for outer curly braces
            m_brace = re.search(r"(\{.*\})", text, re.DOTALL)
            if m_brace:
                text = m_brace.group(1).strip()

        try:
            parsed = json.loads(text)
            if isinstance(parsed, dict):
                return parsed
            raise ValueError(f"Expected JSON dict, got {type(parsed).__name__}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON: {e}\nRaw snippet: {text[:200]}")
            # Fallback: attempt regex extraction of key-values
            return cls._fallback_regex_extract(text)

    @classmethod
    def _fallback_regex_extract(cls, text: str) -> Dict[str, str]:
        """Fallback key-value regex recovery if model output has minor JSON syntax errors."""
        result = {}
        for field in MANDATORY_20_FIELDS:
            pattern = rf'"{field}"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"'
            match = re.search(pattern, text)
            if match:
                result[field] = match.group(1)
            else:
                result[field] = "Not Specified"
        return result

    @classmethod
    def to_candidate_values(
        cls,
        data: Dict[str, Any],
        doc_name: str,
        doc_role: str,
        authority_weight: int,
        source_text: str,
    ) -> List[CandidateFieldValue]:
        """Convert a parsed extraction dictionary into CandidateFieldValue objects for conflict resolution."""
        candidates: List[CandidateFieldValue] = []
        for field in MANDATORY_20_FIELDS:
            val = str(data.get(field, "Not Specified")).strip()
            # If value is specified, find a short evidence snippet from the source text
            evidence_snippet = None
            if val and val.lower() != "not specified":
                # Find occurrence of key words in text
                val_sample = val[:40].strip()
                idx = source_text.lower().find(val_sample.lower())
                if idx != -1:
                    start = max(0, idx - 40)
                    end = min(len(source_text), idx + len(val_sample) + 60)
                    evidence_snippet = "..." + source_text[start:end].replace("\n", " ") + "..."

            candidates.append(
                CandidateFieldValue(
                    field_name=field,
                    value=val,
                    source_document=doc_name,
                    authority_weight=authority_weight,
                    doc_role=doc_role,
                    evidence_text=evidence_snippet,
                )
            )
        return candidates
