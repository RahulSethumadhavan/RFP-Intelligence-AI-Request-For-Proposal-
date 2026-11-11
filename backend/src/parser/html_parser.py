"""Robust HTML parser for web-captured procurement documents (e.g. BidNet Direct)."""

import logging
import re
from pathlib import Path
from typing import Dict, List, Optional
from bs4 import BeautifulSoup

from src.parser.base_parser import BaseParser, DocumentPage, ParsedDocument

logger = logging.getLogger(__name__)


class HTMLParser(BaseParser):
    """Parses HTML documents, removing navigation/boilerplate and formatting tables cleanly."""

    # Tags to strip entirely
    BOILERPLATE_TAGS = [
        "script",
        "style",
        "nav",
        "footer",
        "noscript",
        "svg",
        "iframe",
    ]

    def parse(self, file_path: Path) -> ParsedDocument:
        """Parse HTML file, stripping boilerplate and extracting readable content."""
        if not file_path.exists():
            raise FileNotFoundError(f"HTML file not found: {file_path}")

        logger.info(f"Parsing HTML: {file_path.name}")
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_html = f.read()

        soup = BeautifulSoup(raw_html, "html.parser")

        # Extract title before decomposing tags
        title = None
        if soup.title and soup.title.string:
            title = soup.title.string.strip()

        # Decompose unwanted elements
        for tag_name in self.BOILERPLATE_TAGS:
            for tag in soup.find_all(tag_name):
                tag.decompose()

        # Extract structured key-values from labels, tables, or definition lists before layout stripping
        extracted_kvs = self._extract_key_values(soup)

        # Remove header elements that represent top bars / banners
        for banner in soup.find_all(["nav", "header"], class_=re.compile(r"navbar|nav-bar|header-menu", re.I)):
            banner.decompose()

        # Convert table structures to clean text representations
        self._format_tables(soup)

        # Clean text
        raw_text = soup.get_text(separator="\n")
        cleaned_text = self._clean_text(raw_text)

        # Append structured key-value summary if detected
        if extracted_kvs:
            kv_summary = "\n--- Structured Key-Value Fields from HTML ---\n"
            for k, v in extracted_kvs.items():
                kv_summary += f"{k}: {v}\n"
            cleaned_text = kv_summary + "\n" + cleaned_text

        # Create single logical page for HTML document
        page = DocumentPage(
            page_number=1,
            text=cleaned_text,
            metadata={"source": "html", "key_values": extracted_kvs},
        )

        return ParsedDocument(
            file_path=file_path,
            file_name=file_path.name,
            file_type="html",
            title=title or file_path.stem.replace("_", " "),
            pages=[page],
            metadata={
                "title": title,
                "file_size_bytes": file_path.stat().st_size,
                "structured_fields": extracted_kvs,
            },
        )

    def _extract_key_values(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract explicit key-value pairs from labels, tables, or definition lists."""
        kvs: Dict[str, str] = {}

        # 1. Search for specific label elements like mets-field-label
        for label_el in soup.find_all(
            lambda t: t.name in ["span", "label"] and any(
                "field-label" in c.lower() for c in t.get("class", [])
            )
        ):
            key = label_el.get_text(" ", strip=True).rstrip(":")
            parent = label_el.parent
            if parent and key and 2 <= len(key) <= 50:
                # Direct sibling text or value element
                val_el = parent.find(
                    lambda t: t != label_el and any(
                        "field-value" in c.lower() or "value" in c.lower() for c in t.get("class", [])
                    )
                )
                if val_el:
                    val = val_el.get_text(" ", strip=True)
                else:
                    p_text = parent.get_text(" ", strip=True)
                    if p_text.startswith(key):
                        val = p_text[len(key):].strip()
                    else:
                        val = p_text.replace(key, "", 1).strip()
                if val and len(val) < 200 and val != key:
                    kvs[key] = val

        # 2. Search for table rows with 2 cells
        for tr in soup.find_all("tr"):
            cells = tr.find_all(["td", "th"])
            if len(cells) == 2:
                key = cells[0].get_text(" ", strip=True).rstrip(":")
                val = cells[1].get_text(" ", strip=True)
                if 2 <= len(key) <= 50 and val and len(val) < 300:
                    kvs[key] = val

        # 3. Search for dl / dt / dd
        dts = soup.find_all("dt")
        dds = soup.find_all("dd")
        if len(dts) == len(dds):
            for dt, dd in zip(dts, dds):
                k = dt.get_text(" ", strip=True).rstrip(":")
                v = dd.get_text(" ", strip=True)
                if k and v and len(v) < 300:
                    kvs[k] = v

        return kvs

    def _format_tables(self, soup: BeautifulSoup) -> None:
        """Replace table HTML elements with readable formatted text."""
        for table in soup.find_all("table"):
            rows_text = []
            for tr in table.find_all("tr"):
                cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
                if cells:
                    rows_text.append(" | ".join(cells))
            if rows_text:
                table.replace_with("\n" + "\n".join(rows_text) + "\n")

    def _clean_text(self, text: str) -> str:
        """Sanitize text lines and collapse redundant whitespace."""
        lines = []
        for line in text.splitlines():
            cleaned = re.sub(r"[ \t]+", " ", line).strip()
            # Ignore repetitive short navigational noise
            if cleaned and not any(
                cleaned.lower() == noise
                for noise in [
                    "skip to main content",
                    "loading...",
                    "ok",
                    "go to homepage",
                    "logout",
                    "follow",
                    "print",
                    "share",
                ]
            ):
                lines.append(cleaned)

        joined = "\n".join(lines)
        return re.sub(r"\n{3,}", "\n\n", joined).strip()
