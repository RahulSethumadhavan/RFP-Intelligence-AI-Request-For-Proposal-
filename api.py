"""Root launcher for FastAPI API server."""

import sys
from pathlib import Path

# Add backend directory to sys.path so imports resolve
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_path))

from backend.api import app

if __name__ == "__main__":
    import os
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.api:app", host=host, port=port, reload=True)
