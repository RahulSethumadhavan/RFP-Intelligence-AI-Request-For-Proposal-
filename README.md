# 📄 RFP Intelligence Extractor & Hub

A production-ready procurement document intelligence platform that transforms heterogeneous RFP documents (PDF solicitations, legal addenda, specification sheets, and web procurement notices) into validated, structured 20-field procurement intelligence records with multi-document conflict resolution.

---

## ⚡ Quick Start: How to Run the Application

You can run the application in two ways:
- **[Method 1: Modern Web Application (Recommended)](#-method-1-modern-web-application-recommended)** — Full interactive dashboard, drag-and-drop custom upload, and visual intelligence viewer.
- **[Method 2: Command Line Interface (CLI)](#-method-2-command-line-interface-cli)** — Fast, headless batch processing directly in your terminal.

---

### 📦 Prerequisites & 1-Minute Setup

Make sure you have:
- **Python 3.10 – 3.14** installed ([python.org](https://www.python.org/))
- **Node.js 18+** installed ([nodejs.org](https://nodejs.org/))

#### 1. Install Backend Dependencies
Open your terminal in the project root:
```bash
pip install -r requirements.txt
```

#### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

*(Optional)* If you want to use live LLM inference with Groq, OpenAI, or Gemini, copy `.env.example` to `.env` and add your API key. If not configured, the application runs in high-speed offline **Demo Mode** with zero external API costs.

---

### 🌐 Method 1: Modern Web Application (Recommended)

Running the web application requires two terminal windows (one for the backend API and one for the frontend UI).

#### Step 1: Start the Backend API Server
In **Terminal 1** (at the project root):
```bash
python api.py
```
> Server will start at: **`http://localhost:8000`**  
> API docs available at: **`http://localhost:8000/docs`**

#### Step 2: Start the Frontend UI
In **Terminal 2**:
```bash
cd frontend
npm run dev
```
> Web interface will start at: **`http://localhost:5173`**

#### Step 3: Open in Your Browser
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### How to Use the Web Application:
1. **Analyze Entire Bid Folders & Documents**:
   - Click **"Upload Entire Bid Folder"** or drag & drop mixed files (`.pdf`, `.html`, `.txt`, `.text`) into the upload zone.
   - Files are automatically indexed with ordered sequence badges (`#1`, `#2`, `#3`...).
   - *(Optional)* Set a custom folder name (e.g. `"Bid1"` or `"Transit_RFP_2026"`).
   - Click **"Analyze Bid Folder"** — extracts each file in sequence and synthesizes 20-field records!
   - In the extraction view, switch between **"Table View"**, **"Ordered Files (Per-File JSONs)"**, and **"Consolidated JSON"**.
   - Download individual JSONs (`file1.json`, `file2.json`...) or click **"Export Folder (ZIP)"**!
2. **Explore Benchmark Reference Bids (Bid 1 & Bid 2)**:
   - Click the **"Load Benchmark Bids (Bid 1 & Bid 2)"** button on the Dashboard.
   - Instantly loads the Dallas ISD and MD Treasurer benchmark packages with full 20-field extractions and addendum conflict logs.
   - Click **"Clear Reference Bids"** anytime to return to a clean workspace.

---

### 💻 Method 2: Command Line Interface (CLI)

You can run the extractor directly from your terminal using `main.py`.

#### A. Run on Entire Bid Folders (Ordered Per-File JSON Extractions)
When analyzing an entire bid folder, the pipeline processes each file in sequence and produces individual `.json` outputs mirroring the folder structure:
```bash
# Process a bid folder with mixed PDF, HTML, and Text documents:
# Input:  bid_folder/file1.pdf, file2.pdf, filet3.html, file4.text
# Output: data/output/bid_folder/file1.json, file2.json, filet3.json, file4.json + _manifest.json
python main.py --input "path/to/my_bid_folder" --demo
```

#### B. Run Benchmark Sample Bids (Bid 1 & Bid 2)
Test the extraction pipeline on benchmark packages with zero API costs:
```bash
python main.py --sample --demo
```

#### C. Run Active Input Directory
If you placed files into `backend/data/input`:
```bash
python main.py --demo
```

#### D. Run with Real LLM (Groq LPU / OpenAI / Gemini)
Ensure your `.env` file has your API key set, then run without `--demo`:
```bash
python main.py --input "path/to/my_bid_folder"
```


---

### 🧪 Method 3: Run Automated Test Suite

Run the full automated test suite (25 unit and integration tests):
```bash
python -m pytest
```
> **Status**: 25 passed in ~5 seconds (100% pass rate).

---

## 🏛️ System Architecture Overview

<p align="center">
  <img src="docs/architecture_poster.jpg" alt="RFP Intelligence Hub Technical Architecture Poster" width="700"/>
</p>

The **RFP Intelligence Extractor** solves critical procurement automation challenges:
- **Heterogeneous Formats**: Seamlessly extracts from multi-page PDFs, web portal HTML captures (e.g. BidNet Direct, eMMA), technical spec sheets, and legal affidavits.
- **Addendum Hierarchy Precedence**: Accurately detects post-issuance amendments (e.g., Addendum 2 extending a deadline from June 27 to July 9) and overrides earlier documents with full reasoning.
- **Zero Hallucination Guarantee**: Strictly grounds all extracted values to source documents and verbatim quotes; missing items default to `"Not Specified"`.

```
DOCUMENTS (PDFs, HTML)
       │
       ▼
 [INGESTION & DETECTION] ──► (PDF / HTML format detection)
       │
       ▼
 ┌─────────────────────────┐
 │ PDFParser (PyMuPDF)     │ Page-aware extraction, spatial sort, clean layout
 │ HTMLParser (BS4/lxml)   │ Strips scripts/nav, preserves ASP.NET form & tables
 └─────────────┬───────────┘
               │
               ▼
 [DOCUMENT GROUPER] ───────► Bundles multi-document packages & assigns legal authority
               │
               ▼
 [CONTEXT CHUNKER] ────────► Section-aware chunking preserving provenance
               │
               ▼
 [LLM EXTRACTION] ─────────► Multi-provider service (Groq / OpenAI / Gemini / Claude / Mock)
               │             Grounded 20-field zero-hallucination prompt
               ▼
 [STRUCTURED PARSER] ──────► Validates JSON schema & generates candidate fields
               │
               ▼
 [CONFLICT RESOLVER] ──────► Enforces Addendum Precedence (e.g. Addendum 2 > Original RFP)
               │             Logs resolution reasoning & previous candidate values
               ▼
 [PYDANTIC VALIDATION] ────► Enforces 20-field completeness & 'Not Specified' strategy
               │
               ▼
 [OUTPUT EXPORT] ──────────► data/output/<bid>.json & data/output/<bid>_audit.json
```

---

## 📋 The Mandatory 20 Procurement Fields

Every extraction produces a uniform JSON file containing exactly these 20 fields:

| # | Field Name | Description | Example Extracted Value |
|---|---|---|---|
| 1 | `bid_number` | Formal solicitation identifier | `"JA-207652"` / `"#E20P4600040"` |
| 2 | `title` | Title of the procurement package | `"Student and Staff Computing Devices"` |
| 3 | `due_date` | Final submission deadline | `"July 9, 2024 at 2:00 PM CST"` |
| 4 | `bid_submission_type` | Submission method & delivery instructions | `"Electronic submission via Dallas ISD e-procurement portal"` |
| 5 | `term_of_bid` | Contract duration & renewals | `"Three (3) year agreement with two (2) successive 1-yr options"` |
| 6 | `pre_bid_meeting` | Pre-proposal conference details | `"June 10, 2024 at 2:00 PM CST via Teams"` |
| 7 | `installation` | Hardware deployment requirements | `"Vendor to track shipped products, asset tagging and deployment"` |
| 8 | `bid_bond_requirement` | Required surety bonds & insurance | `"Insurance and bond requirements as enumerated in Contract"` |
| 9 | `delivery_date` | Delivery lead times / schedules | `"Within 45 days of Award"` |
| 10 | `payment_terms` | Invoicing & net payment schedule | `"Net 30 days prompt payment"` |
| 11 | `additional_documentation_required` | Mandatory affidavits & compliance forms | `"CIQ, Felony Conviction Notification, W-9, signed Addenda"` |
| 12 | `mfg_for_registration` | OEM authorization requirements | `"Original Equipment Manufacturer (OEM) or Authorized Resellers"` |
| 13 | `contract_or_cooperative_to_use` | Purchasing contract / cooperative | `"Dallas ISD Contract / Cooperative purchasing if applicable"` |
| 14 | `model_no` | Target device model numbers | `"Dell Latitude 5550 & Thunderbolt 4 Dock WD22TB4"` |
| 15 | `part_no` | Specific manufacturer part numbers | `"210-BLYZ, 379-BFNZ, 619-ARSB, WD22TB4"` |
| 16 | `product` | Summary of commodity / items | `"Student and Staff Computing Devices (Laptops, Desktops, Docks)"` |
| 17 | `contact_info` | Contracting buyer POC & email | `"Jasmine Alzate, Buyer, Email: JALZATE@dallasisd.org"` |
| 18 | `company_name` | Public issuing agency or entity | `"Dallas Independent School District"` |
| 19 | `bid_summary` | Executive summary of procurement | `"Addendum No. 2 extends the formal proposal due date..."` |
| 20 | `product_specification` | Detailed hardware requirements | `"30x Dell Latitude 5550 Intel Core Ultra 5, 16GB DDR5, 256GB SSD"` |

---

## ⚖️ Legal Document Precedence & Addendum Precedence

When multiple documents are provided in a single procurement package (e.g. an original RFP, specification sheet, and amendments), the **Conflict Resolver** applies deterministic legal authority weights:

$$\text{ADDENDUM } N \ (\text{Weight: } 100 + N) \ > \ \text{MAIN\_SOLICITATION (50)} \ > \ \text{SPEC\_SHEET (40)} \ > \ \text{WEB\_PORTAL (30)} \ > \ \text{AFFIDAVIT (20)}$$

### Real Precedence Example (Dallas ISD Bid 1):
- **Original RFP Statement**: Proposal due date was `June 27, 2024 at 2:00 PM CST`.
- **Addendum 2 Amendment**: Due date was explicitly extended to `July 9, 2024 at 2:00 PM CST`.
- **Resolution**: Addendum 2 (weight: 102) superseded Original RFP (weight: 50). The final output accurately reflects `July 9, 2024` with the full audit reasoning captured in `bid1_audit.json`.

---

## 📁 Repository Structure

```
RFP Intelligence/
├── main.py                        # Root CLI entrypoint shortcut
├── api.py                         # FastAPI backend launcher (port 8000)
├── pytest.ini                     # Pytest configuration (pythonpath = backend)
├── requirements.txt               # Python dependencies
├── .env.example                   # Environment variable template
│
├── backend/
│   ├── api.py                     # REST API implementation with upload & sample routes
│   ├── src/
│   │   ├── config.py              # Environment configuration & directory paths
│   │   ├── pipeline.py            # End-to-end extraction pipeline orchestrator
│   │   ├── main.py                # Core CLI implementation
│   │   ├── parser/                # PyMuPDF and BeautifulSoup parsers
│   │   ├── extraction/            # Structured prompts & multi-provider LLM clients
│   │   ├── schema/                # Pydantic v2 data models
│   │   ├── processing/            # Document grouper & Addendum conflict resolver
│   │   ├── validation/            # Schema validator & anti-hallucination checks
│   │   └── evidence/              # Grounding tracker & audit exporter
│   ├── data/
│   │   ├── input/                 # Active user upload directory (clean by default)
│   │   ├── output/                # Active extraction output directory (clean by default)
│   │   └── reference/             # Benchmark reference storage
│   │       ├── input/             # Bid 1 & Bid 2 reference solicitations
│   │       └── output/            # Bid 1 & Bid 2 pre-extracted records
│   └── tests/                     # 25 automated pytest tests
│
├── frontend/                      # React + TypeScript + Vite + TailwindCSS UI
│   ├── src/
│   │   ├── pages/                 # Dashboard, Documents, Extractions, Processing
│   │   ├── components/            # File uploader, status cards, steppers
│   │   └── services/              # API client & sample loaders
│   └── package.json
│
└── docs/                          # Architecture & design documentation
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env` to configure optional API keys:
```ini
# LLM Provider: 'groq', 'openai', 'gemini', 'anthropic', or 'mock'
LLM_PROVIDER=groq

# Groq API Key (Free tier supported at console.groq.com)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# OpenAI API Key (Optional)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Google Gemini API Key (Optional)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# System Defaults
TEMPERATURE=0.0
MAX_TOKENS=4096
DEBUG=false
```

---

## 🛡️ Zero-Hallucination Controls

1. **Strict Missing Strategy**: Any field not explicitly verified in the text defaults to `"Not Specified"`.
2. **Forbidden Token Audits**: Post-extraction filters detect and reject placeholder tokens like `"[TBD]"`, `"[Insert Date]"`, or generic assumptions.
3. **Verbatim Grounding**: Every field is accompanied by verbatim quotes, page numbers, and source document filenames in the audit trail.
