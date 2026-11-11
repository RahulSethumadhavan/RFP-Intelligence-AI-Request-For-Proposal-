# Testing & Quality Assurance

## 1. Test Strategy Overview
The pipeline follows a multi-tiered testing strategy ensuring robustness, zero hallucination, and deterministic execution:

1. **Deterministic Unit Tests**: 100% offline, executing without external API keys or network calls.
2. **Assignment-Specific Addendum Test**: Verifies legal precedence abstraction where an amendment modifies an original value, confirming the resolution reasoning log.
3. **Parsing Tests**: Verifies PDF page extraction, empty page handling, HTML boilerplate stripping, and table extraction on real and synthetic documents.
4. **Schema & Validation Tests**: Verifies 20-field completeness, null handling, type checking, and hallucination placeholder detection.
5. **End-to-End Pipeline Tests**: Validates full orchestration from raw input directory to final JSON output.

---

## 2. Test Suite Categories & File Mapping

| Test File | Category | Focus |
| :--- | :--- | :--- |
| `tests/test_pdf_parser.py` | Parser | PDF parsing, page count, text sanitization, error handling |
| `tests/test_html_parser.py` | Parser | HTML boilerplate removal, key-value extraction from web portals |
| `tests/test_schema.py` | Validation | 20 mandatory fields, null/'Not Specified' strategy, placeholder rejection |
| `tests/test_normalization.py` | Normalization | Oracle date parsing, timezone preservation, mojibake/text cleaning |
| `tests/test_document_grouper.py` | Grouping | Document role classification, authority weighting, multi-file bundling |
| `tests/test_addendum_resolution.py` | Precedence | Reusable addendum precedence abstraction, conflict reasoning logs |
| `tests/test_pipeline.py` | Integration | End-to-end processing of Bid1 and Bid2, output JSON structure |

---

## 3. Running the Tests

Execute all tests with pytest:
```bash
python -m pytest tests/ -v
```

Execute a specific test category:
```bash
python -m pytest tests/test_addendum_resolution.py -v
```

Execute with coverage report:
```bash
python -m pytest --cov=src tests/ -v
```
