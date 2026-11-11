"""Context management and section-aware document chunker."""

import logging
import re
from dataclasses import dataclass
from typing import List, Optional

from src.parser.base_parser import ParsedDocument

logger = logging.getLogger(__name__)


@dataclass
class DocumentChunk:
    """Represents a chunk of text with document and page provenance."""
    doc_name: str
    page_number: int
    text: str
    section_heading: Optional[str] = None
    chunk_index: int = 0


class DocumentChunker:
    """Intelligently chunks long documents preserving section boundaries and page numbers."""

    # Keywords signaling high-value procurement sections
    KEY_SECTION_KEYWORDS = [
        "scope",
        "specification",
        "schedule",
        "due date",
        "deadline",
        "terms",
        "condition",
        "bond",
        "payment",
        "contact",
        "pre-bid",
        "meeting",
        "submission",
        "pricing",
        "requirement",
        "hardware",
        "model",
        "warranty",
    ]

    def __init__(self, max_chunk_chars: int = 4000, overlap_chars: int = 400):
        self.max_chunk_chars = max_chunk_chars
        self.overlap_chars = overlap_chars

    def chunk_document(self, doc: ParsedDocument) -> List[DocumentChunk]:
        """Convert a parsed document into structured, provenance-tracked chunks."""
        chunks: List[DocumentChunk] = []
        chunk_idx = 0

        for page in doc.pages:
            page_text = page.text.strip()
            if not page_text:
                continue

            # If page fits in one chunk, keep it intact
            if len(page_text) <= self.max_chunk_chars:
                heading = self._detect_heading(page_text)
                chunks.append(
                    DocumentChunk(
                        doc_name=doc.file_name,
                        page_number=page.page_number,
                        text=page_text,
                        section_heading=heading,
                        chunk_index=chunk_idx,
                    )
                )
                chunk_idx += 1
            else:
                # Split page text into smaller paragraph-respecting chunks
                paras = page_text.split("\n\n")
                curr_buf: List[str] = []
                curr_len = 0

                for para in paras:
                    para = para.strip()
                    if not para:
                        continue
                    if curr_len + len(para) > self.max_chunk_chars and curr_buf:
                        chunk_content = "\n\n".join(curr_buf)
                        heading = self._detect_heading(chunk_content)
                        chunks.append(
                            DocumentChunk(
                                doc_name=doc.file_name,
                                page_number=page.page_number,
                                text=chunk_content,
                                section_heading=heading,
                                chunk_index=chunk_idx,
                            )
                        )
                        chunk_idx += 1
                        # Retain tail for overlap
                        curr_buf = [para]
                        curr_len = len(para)
                    else:
                        curr_buf.append(para)
                        curr_len += len(para)

                if curr_buf:
                    chunk_content = "\n\n".join(curr_buf)
                    heading = self._detect_heading(chunk_content)
                    chunks.append(
                        DocumentChunk(
                            doc_name=doc.file_name,
                            page_number=page.page_number,
                            text=chunk_content,
                            section_heading=heading,
                            chunk_index=chunk_idx,
                        )
                    )
                    chunk_idx += 1

        return chunks

    def select_salient_chunks(
        self, chunks: List[DocumentChunk], max_total_chars: int = 60000
    ) -> List[DocumentChunk]:
        """Prioritize chunks containing vital procurement keywords plus first/last summary pages."""
        if not chunks:
            return []

        scored_chunks = []
        for c in chunks:
            score = 0
            # Early pages (cover, header, schedule) get strong initial priority
            if c.page_number <= 3:
                score += 15
            # Keyword matches
            low_text = c.text.lower()
            for kw in self.KEY_SECTION_KEYWORDS:
                if kw in low_text:
                    score += 5
            scored_chunks.append((score, c))

        # Sort descending by score, maintaining page order for ties
        scored_chunks.sort(key=lambda x: (-x[0], x[1].page_number, x[1].chunk_index))

        selected: List[DocumentChunk] = []
        total_len = 0
        for _, c in scored_chunks:
            if total_len + len(c.text) > max_total_chars:
                continue
            selected.append(c)
            total_len += len(c.text)

        # Re-sort chronologically by document and page number
        selected.sort(key=lambda x: (x.doc_name, x.page_number, x.chunk_index))
        return selected

    def _detect_heading(self, text: str) -> Optional[str]:
        """Detect section title from first non-empty line."""
        for line in text.splitlines():
            line = line.strip()
            if line and len(line) < 80 and not line.endswith("."):
                return line
        return None
