"""File and system utility functions."""

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Optional


def natural_sort_key(path: Path) -> Any:
    """Sort key that orders files naturally by embedded sequence numbers and alphanumeric chunks."""
    stem = path.stem.lower()
    m = re.search(r"(?:^|[^\d])(\d+)(?:[^\d]|$)", stem)
    first_num = int(m.group(1)) if m else None

    chunks = [int(text) if text.isdigit() else text.lower() for text in re.split(r"(\d+)", path.name)]
    if first_num is not None:
        return (0, first_num, chunks)
    return (1, 0, chunks)



def detect_file_type(path: Path) -> str:
    """Detect whether file is pdf, html, text, or other based on extension."""
    suffix = path.suffix.lower()
    if suffix in [".pdf"]:
        return "pdf"
    if suffix in [".html", ".htm"]:
        return "html"
    if suffix in [".txt", ".text"]:
        return "text"
    return "unknown"


def ensure_dir(path: Path) -> Path:
    """Ensure a directory exists and return it."""
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_json(data: Dict[str, Any], file_path: Path, indent: int = 2) -> None:
    """Save dictionary to JSON file with UTF-8 encoding."""
    ensure_dir(file_path.parent)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, ensure_ascii=False)


def load_json(file_path: Path) -> Dict[str, Any]:
    """Load JSON file safely."""
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


SUPPORTED_EXTENSIONS = [".pdf", ".html", ".htm", ".txt", ".text"]


def list_files_in_dir(dir_path: Path, extensions: Optional[List[str]] = None) -> List[Path]:
    """Find files with given extensions, sorted naturally in directory order."""
    if not dir_path.exists():
        return []
    files = [p for p in dir_path.iterdir() if p.is_file()]
    target_exts = extensions if extensions is not None else SUPPORTED_EXTENSIONS
    if target_exts:
        normalized_exts = [e.lower() if e.startswith(".") else f".{e.lower()}" for e in target_exts]
        files = [p for p in files if p.suffix.lower() in normalized_exts]
    return sorted(files, key=natural_sort_key)

