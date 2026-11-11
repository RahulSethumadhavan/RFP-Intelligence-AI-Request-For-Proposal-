"""Text parser for plain text (.txt, .text) procurement documents."""

import logging
import re
from pathlib import Path
from typing import List, Optional

from src.parser.base_parser import BaseParser, DocumentPage, ParsedDocument

logger = logging.getLogger(__name__)


class TextParser(BaseParser):
    """Parses plain text documents (.txt, .text) into structured ParsedDocument."""

    def __init__(self, chars_per_page: int = 3000):
        self.chars_per_page = chars_per_page

    def parse(self, file_path: Path) -> ParsedDocument:
        """Parse text document into logical pages and extract metadata."""
        if not file_path.exists():
            raise FileNotFoundError(f"Text file not found: {file_path}")

        logger.info(f"Parsing Text document: {file_path.name}")
        raw_text = self._read_file_safely(file_path)

        # Chunk text into logical pages
        pages = self._chunk_into_pages(raw_text)
        title = self._extract_title(raw_text, file_path)

        return ParsedDocument(
            file_path=file_path,
            file_name=file_path.name,
            file_type="text",
            title=title,
            pages=pages,
            metadata={
                "page_count": len(pages),
                "char_count": len(raw_text),
                "file_size_bytes": file_path.stat().st_size,
            },
        )

    def _read_file_safely(self, file_path: Path) -> str:
        """Read file trying UTF-8, then Latin-1, then Windows-1252."""
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                with open(file_path, "r", encoding=enc) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        # Fallback with replacement
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    def _chunk_into_pages(self, text: str) -> List[DocumentPage]:
        """Split text into logical pages based on form feeds, page markers, or char length."""
        if not text.strip():
            return [DocumentPage(page_number=1, text="")]

        # Check for explicit form feed / page breaks (\x0c or "Page X of Y")
        raw_chunks = re.split(r"\x0c|(?:\n\s*[-=]{3,}\s*(?:Page|\d+)\s*[-=]{3,}\s*\n)", text)
        if len(raw_chunks) > 1:
            pages = []
            for idx, c in enumerate(raw_chunks, start=1):
                clean = c.strip()
                if clean:
                    pages.append(DocumentPage(page_number=idx, text=clean))
            if pages:
                return pages

        # Fallback: split by character length keeping paragraph boundaries intact
        paragraphs = text.split("\n\n")
        pages: List[DocumentPage] = []
        curr_text = ""
        page_num = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if len(curr_text) + len(para) > self.chars_per_page and curr_text:
                pages.append(DocumentPage(page_number=page_num, text=curr_text.strip()))
                page_num += 1
                curr_text = para + "\n\n"
            else:
                curr_text += para + "\n\n"

        if curr_text.strip():
            pages.append(DocumentPage(page_number=page_num, text=curr_text.strip()))

        return pages or [DocumentPage(page_number=1, text=text.strip())]

    def _extract_title(self, text: str, file_path: Path) -> str:
        """Derive document title from first few lines or filename."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:5]:
            # If line is capitalized or contains keywords like RFP, Solicitation, Notice
            if len(line) > 5 and len(line) < 120 and not line.startswith("http"):
                if any(w in line.lower() for w in ["rfp", "bid", "solicitation", "procurement", "notice", "project"]):
                    return line
        if lines:
            return lines[0][:80]
        return file_path.stem.replace("_", " ").title()
