#!/usr/bin/env python
"""Root entrypoint shortcut for RFP Intelligence Extractor."""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from backend.src.main import main
except ImportError:
    from src.main import main

if __name__ == "__main__":
    sys.exit(main())
