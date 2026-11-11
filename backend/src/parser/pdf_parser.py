"""Robust PDF parser using PyMuPDF (fitz) with pypdf fallback."""

import logging
import re
from pathlib import Path
from typing import List, Optional

from src.parser.base_parser import BaseParser, DocumentPage, ParsedDocument

logger = logging.getLogger(__name__)


class PDFParser(BaseParser):
    """Parses PDF documents into page-by-page structured representations."""

    def __init__(self, use_pymupdf: bool = True):
        self.use_pymupdf = use_pymupdf

    def parse(self, file_path: Path) -> ParsedDocument:
        """Parse PDF document, extracting page text and layout cleanly."""
        if not file_path.exists():
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        logger.info(f"Parsing PDF: {file_path.name}")
        pages: List[DocumentPage] = []

        if self.use_pymupdf:
            try:
                pages = self._parse_with_pymupdf(file_path)
            except Exception as e:
                logger.warning(f"PyMuPDF failed on {file_path.name}: {e}. Falling back to pypdf.")
                pages = self._parse_with_pypdf(file_path)
        else:
            pages = self._parse_with_pypdf(file_path)

        # Attempt to derive title from first page or filename
        title = self._extract_title(pages, file_path)

        return ParsedDocument(
            file_path=file_path,
            file_name=file_path.name,
            file_type="pdf",
            title=title,
            pages=pages,
            metadata={
                "page_count": len(pages),
                "file_size_bytes": file_path.stat().st_size,
            },
        )

    def _parse_with_pymupdf(self, file_path: Path) -> List[DocumentPage]:
        """Extract pages using PyMuPDF (fitz)."""
        import pymupdf

        pages: List[DocumentPage] = []
        doc = pymupdf.open(str(file_path))
        try:
            for page_idx in range(len(doc)):
                page_num = page_idx + 1
                try:
                    page = doc[page_idx]
                    # Use sort=True for natural reading order
                    raw_text = page.get_text("text", sort=True)
                    cleaned_text = self._clean_text(raw_text)

                    # Extract basic table/block information if available
                    blocks = page.get_text("blocks")
                    page_meta = {
                        "block_count": len(blocks),
                        "width": page.rect.width,
                        "height": page.rect.height,
                    }

                    pages.append(
                        DocumentPage(
                            page_number=page_num,
                            text=cleaned_text,
                            metadata=page_meta,
                        )
                    )
                except Exception as page_err:
                    logger.error(f"Error extracting page {page_num} of {file_path.name}: {page_err}")
                    pages.append(
                        DocumentPage(
                            page_number=page_num,
                            text="",
                            metadata={"error": str(page_err)},
                        )
                    )
        finally:
            doc.close()

        return pages

    def _parse_with_pypdf(self, file_path: Path) -> List[DocumentPage]:
        """Fallback extractor using pypdf."""
        import pypdf

        pages: List[DocumentPage] = []
        reader = pypdf.PdfReader(str(file_path))
        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            try:
                raw_text = page.extract_text() or ""
                cleaned_text = self._clean_text(raw_text)
                pages.append(
                    DocumentPage(
                        page_number=page_num,
                        text=cleaned_text,
                        metadata={"extractor": "pypdf"},
                    )
                )
            except Exception as page_err:
                logger.error(f"pypdf error on page {page_num} of {file_path.name}: {page_err}")
                pages.append(
                    DocumentPage(
                        page_number=page_num,
                        text="",
                        metadata={"error": str(page_err)},
                    )
                )
        return pages

    def _clean_text(self, text: str) -> str:
        """Sanitize whitespace, control chars, and artifacts."""
        if not text:
            return ""

        # Remove null bytes and non-printable control characters except newline and tab
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]", "", text)

        # Replace excessive whitespace within lines
        lines = []
        for line in text.splitlines():
            cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
            lines.append(cleaned_line)

        # Collapse more than 2 consecutive blank lines into 2
        joined = "\n".join(lines)
        joined = re.sub(r"\n{3,}", "\n\n", joined)
        return joined.strip()

    def _extract_title(self, pages: List[DocumentPage], file_path: Path) -> str:
        """Heuristically extract a title from the first 2 pages or filename."""
        if pages:
            first_text = pages[0].text
            lines = [l for l in first_text.splitlines() if l.strip()]
            for line in lines[:8]:
                # Look for common title patterns
                if any(k in line.lower() for k in ["request for proposal", "rfp", "porfp", "addendum", "solicitation"]):
                    return line
        # Fallback to stem
        return file_path.stem.replace("_", " ")
