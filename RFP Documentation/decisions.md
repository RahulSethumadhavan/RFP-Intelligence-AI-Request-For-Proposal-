# Architectural Decisions & Technical Trade-offs

This document details the engineering judgment and rationales behind key design choices in the RFP Intelligence Extractor.

---

### 1. Why PyMuPDF (fitz) with pypdf Fallback?
- **Decision**: Use `pymupdf` as the primary PDF extraction engine, backed by `pypdf` as a graceful fallback.
- **Rationale**:
  - `pymupdf` delivers exceptional speed (10x faster than pure-Python parsers), high fidelity in preserving reading order (`sort=True`), and native block/rect bounding-box support.
  - Unlike naive extractors, it handles complex multi-column text and embedded font mappings without choking.
  - Adding a `pypdf` fallback ensures that environments where C-extensions encounter platform issues never crash the pipeline.

---

### 2. Why BeautifulSoup with ASP.NET Form Preservation?
- **Decision**: Use BeautifulSoup4 with selective boilerplate stripping, explicitly preserving form elements.
- **Rationale**:
  - Procurement portals like BidNet Direct are ASP.NET web applications where virtually the entire document DOM is wrapped inside an outer `<form id="aspnetForm">`.
  - Naively decomposing `<form>` tags (a common web scraping antipattern) would erase the entire body.
  - Our implementation decomposes only genuine navigation elements (`<nav>`, `<script>`, `<style>`, `<footer>`, `<svg>`) and parses structured definition lists and table cells into key-value pairs.

---

### 3. Why Not a Vector Database (RAG)?
- **Decision**: Omit a vector database (e.g. Chroma, FAISS, Pinecone) in favor of section-aware chunking and document authority aggregation.
- **Rationale**:
  - Embedding retrieval frequently breaks on legal addenda: an embedding similarity search for "when is the due date" often retrieves the prominent, 50-times-repeated original date from page 2 of the 60-page RFP, while failing to retrieve the critical one-sentence amendment on page 1 of an Addendum.
  - Vector similarity does not understand document *legal hierarchy*.
  - An addendum-aware extraction pipeline with explicit document role weighting is deterministic, explainable, and vastly superior for procurement amendment precedence.

---

### 4. Why Pydantic v2 for Schema Enforcement?
- **Decision**: Model the 20-field output using Pydantic v2.
- **Rationale**:
  - Strict type coercion and runtime field validation.
  - Sanitizes empty strings, `null`, `"None"`, and `"N/A"` into a single consistent `"Not Specified"` representation.
  - Provides instant JSON serialization and schema export capabilities.

---

### 5. Why an Explicit Conflict Resolution Engine?
- **Decision**: Implement a dedicated `ConflictResolver` rather than asking the LLM to resolve all cross-document conflicts in a single prompt.
- **Rationale**:
  - LLMs are susceptible to recency bias or position bias when given 100+ pages of conflicting information at once.
  - Legal precedence rules in procurement are rigid: Addendum $N$ supersedes Addendum $N-1$, which supersedes the Original RFP.
  - Offloading conflict resolution to an explicit deterministic module guarantees that precedence is respected 100% of the time, and produces a verifiable audit trail explaining *why* a date was chosen.
