"""End-to-end pipeline integration tests."""

import json
from pathlib import Path
import pytest
from src.config import Settings
from src.pipeline import RFPExtractionPipeline


def test_pipeline_bid1_execution(tmp_path):
    """Test full pipeline run on Bid1 package."""
    candidates = [
        Path("backend/data/reference/input/bid1"),
        Path("data/reference/input/bid1"),
        Path("backend/data/input/bid1"),
        Path("data/input/bid1"),
    ]
    input_dir = next((p for p in candidates if p.exists()), candidates[0])
    if not input_dir.exists():
        pytest.skip("Bid1 directory not found")

    output_file = tmp_path / "bid1_test.json"
    settings = Settings.load(demo_mode=True, debug=True)
    pipeline = RFPExtractionPipeline(settings)

    results = pipeline.run_on_directory(input_dir, output_file=output_file)

    assert len(results) == 1
    pkg_res = results[0]
    assert pkg_res.bid_id == "bid1"

    # Verify output JSON
    assert output_file.exists()
    with open(output_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) == 20
    assert data["due_date"] == "July 9, 2024 at 2:00 PM CST"
    assert "Dallas" in data["company_name"]


def test_pipeline_bid2_execution(tmp_path):
    """Test full pipeline run on Bid2 package."""
    candidates = [
        Path("backend/data/reference/input/bid2"),
        Path("data/reference/input/bid2"),
        Path("backend/data/input/bid2"),
        Path("data/input/bid2"),
    ]
    input_dir = next((p for p in candidates if p.exists() and any(p.iterdir())), None)
    if not input_dir or not input_dir.exists():
        pytest.skip("Bid2 input files not found")

    output_file = tmp_path / "bid2_test.json"
    settings = Settings.load(demo_mode=True, debug=True)
    pipeline = RFPExtractionPipeline(settings)

    results = pipeline.run_on_directory(input_dir, output_file=output_file)

    assert len(results) == 1
    pkg_res = results[0]
    assert pkg_res.bid_id == "bid2"

    assert output_file.exists()
    with open(output_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert len(data) == 20
    assert "06/10/2024" in data["due_date"]
    assert "Latitude 5550" in data["model_no"]
    assert data["pre_bid_meeting"] == "Not Specified"
    assert data["bid_bond_requirement"] == "Not Specified"
