"""Integration test verifying REST API endpoints for per-file extraction and zip export."""

import sys
from pathlib import Path
import pytest

from fastapi.testclient import TestClient
from api import app


def test_api_files_in_order_and_zip_export():
    client = TestClient(app)

    # 1. Fetch extraction details for bid1
    res = client.get("/api/extractions/bid1")
    if res.status_code == 404:
        client.post("/api/samples/load")
        res = client.get("/api/extractions/bid1")
    if res.status_code == 404:
        pytest.skip("Reference bid1 output files not present in workspace")
    assert res.status_code == 200
    data = res.json()

    assert "files_in_order" in data
    files_order = data["files_in_order"]
    assert len(files_order) == 4

    for idx, f in enumerate(files_order, start=1):
        assert f["order"] == idx
        assert "filename" in f
        assert "json_filename" in f
        assert len(f["fields"]) == 20

    # 2. Fetch an individual file's JSON
    first_file = files_order[0]["json_filename"]
    f_res = client.get(f"/api/extractions/bid1/files/{first_file}")
    assert f_res.status_code == 200
    f_data = f_res.json()
    assert isinstance(f_data, dict)
    assert len(f_data) == 20

    # 3. Fetch folder ZIP export
    zip_res = client.get("/api/extractions/bid1/export/zip")
    assert zip_res.status_code == 200
    assert len(zip_res.content) > 500
    assert "application/zip" in zip_res.headers.get("content-type", "")
