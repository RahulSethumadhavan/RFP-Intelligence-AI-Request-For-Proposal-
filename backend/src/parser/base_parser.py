"""Base interfaces and data structures for document parsers."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional


@dataclass
class DocumentPage:
    """Represents a single page or logical section of a document."""
    page_number: int
    text: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    tables: List[List[str]] = field(default_factory=list)


@dataclass
class ParsedDocument:
    """Represents a fully parsed document containing pages and overall metadata."""
    file_path: Path
    file_name: str
    file_type: str  # 'pdf' or 'html'
    title: Optional[str] = None
    pages: List[DocumentPage] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def total_pages(self) -> int:
        return len(self.pages)

    @property
    def full_text(self) -> str:
        """Concatenated cleaned text across all pages."""
        return "\n\n".join(p.text for p in self.pages if p.text.strip())

    def get_page(self, page_number: int) -> Optional[DocumentPage]:
        """Get page by 1-indexed page number."""
        for p in self.pages:
            if p.page_number == page_number:
                return p
        return None


class BaseParser(ABC):
    """Abstract base class for all file format parsers."""

    @abstractmethod
    def parse(self, file_path: Path) -> ParsedDocument:
        """Parse given file and return structured ParsedDocument."""
        pass
