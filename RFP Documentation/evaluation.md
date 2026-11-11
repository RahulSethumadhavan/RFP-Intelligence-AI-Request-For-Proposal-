# Evaluation & Document Intelligence Report

This report evaluates the extraction results on the real supplied procurement packages: **Bid 1** (`Dallas ISD Student and Staff Computing Devices`) and **Bid 2** (`Maryland State Treasurer Dell Laptops`).

---

## 1. Evaluation Methodology
- **Ground Truth Comparison**: Each of the 20 required fields was audited against the original source documents and legal amendments.
- **Precedence Verification**: Confirmed that later addenda successfully updated original solicitation terms.
- **Hallucination Audit**: Verified that unmentioned fields (e.g., pre-bid meetings or bid bonds in Bid 2) were correctly reported as `"Not Specified"` rather than hallucinated.

---

## 2. Bid 1 Audit: Dallas ISD Computing Devices

| Field | Extracted Value | Source Document | Audit Status |
| :--- | :--- | :--- | :--- |
| `bid_number` | `JA-207652` | Addendum 2 / Original RFP | Verified |
| `title` | `Student and Staff Computing Devices` | Addendum 2 / Original RFP | Verified |
| `due_date` | `July 9, 2024 at 2:00 PM CST` | **Addendum 2** (P.1) | **Verified (Precedence Overrode June 27, 2024)** |
| `bid_submission_type` | Electronic or sealed manual submission (1 hard copy) | Original RFP (P.9) | Verified |
| `term_of_bid` | 3-year base agreement + two 1-year extensions (max 5 yrs) | Original RFP (P.2, 1.2) | Verified |
| `pre_bid_meeting` | June 10, 2024 at 2:00 PM CST via Microsoft Teams | Original RFP (P.2, 1.1) | Verified |
| `installation` | Vendor to track shipped products, asset tagging | Original RFP (P.3) | Verified |
| `bid_bond_requirement` | Insurance/bond requirements in Contract docs | Original RFP (P.9, 17) | Verified |
| `delivery_date` | Delivery per purchase orders during contract term | Original RFP (P.3) | Verified |
| `payment_terms` | Net 30 days prompt payment | Original RFP (P.31, 51) | Verified |
| `additional_documentation_required` | CIQ, Felony Conviction, M/WBE, EDGAR, W-9, signed Addenda | Original RFP (P.9-15) | Verified |
| `mfg_for_registration` | OEM or Authorized Resellers for computing devices | Original RFP (P.3) | Verified |
| `contract_or_cooperative_to_use` | Dallas ISD Contract / Cooperative purchasing | Original RFP (P.1) | Verified |
| `model_no` | Student and Staff Laptops, Desktops, Chromebooks | Original RFP (P.1-3) | Verified |
| `part_no` | Per RFP Section 2.1 Pricing Table Line Items | Original RFP (P.3) | Verified |
| `product` | Student and Staff Computing Devices | Original RFP (P.1) | Verified |
| `contact_info` | Jasmine Alzate, Buyer, JALZATE@dallasisd.org | Original RFP (P.2) | Verified |
| `company_name` | Dallas Independent School District | Original RFP (P.1) | Verified |
| `bid_summary` | Addendum No. 2 extends due date for RFP JA-207652 | Addendum 2 (P.1) | Verified |
| `product_specification` | USB 3.1 minimum requirement on display monitors | **Addendum 1** (P.1) | **Verified (Precedence Applied)** |

---

## 3. Bid 2 Audit: Maryland State Treasurer Dell Laptops

| Field | Extracted Value | Source Document | Audit Status |
| :--- | :--- | :--- | :--- |
| `bid_number` | `#E20P4600040 (eMMA Project: BPM044557)` | PORFP (P.1) | Verified |
| `title` | `Purchase Order Request for Proposals (PORFP) - Dell Laptop` | PORFP (P.1) | Verified |
| `due_date` | `06/10/2024 at 2:00 PM EDT` | PORFP (P.1) / BidNet | Verified |
| `bid_submission_type` | State's eMMA e-Procurement system only | PORFP (P.1) | Verified |
| `term_of_bid` | Purchase Order with 3-year extended warranty; quote valid 90 days | PORFP (P.2) | Verified |
| `pre_bid_meeting` | `Not Specified` | N/A (None in docs) | **Verified (Zero Hallucination)** |
| `installation` | Post Burn, Factory Install CFI Titan Code, Windows AutoPilot | Dell Specs (P.2) | Verified |
| `bid_bond_requirement` | `Not Specified` | N/A (None in docs) | **Verified (Zero Hallucination)** |
| `delivery_date` | Within 45 days of Award | PORFP (P.2, #9) | Verified |
| `payment_terms` | Invoices emailed within 10 days of delivery | PORFP (P.2) | Verified |
| `additional_documentation_required` | Mercury Affidavit, Contract Affidavit, LOA | PORFP (P.2) / Affidavits | Verified |
| `mfg_for_registration` | Dell (Must be authorized reseller) | PORFP (P.2, #4) | Verified |
| `contract_or_cooperative_to_use` | Desktop, Laptop and Tablet 2015 Master Contract, 060B5400007 | PORFP (P.1) | Verified |
| `model_no` | Dell Latitude 5550 (SI# CC7802) & WD22TB4 Dock | PORFP (P.3) / Specs | Verified |
| `part_no` | 210-BLYZ, 379-BFNZ, 619-ARSB, 658-BCSB, 338-CNRG, WD22TB4 | Dell Specs (P.1) | Verified |
| `product` | Dell Latitude 5550 Laptops and WD22TB4 Docks | PORFP (P.3) | Verified |
| `contact_info` | Tamaira Hawkins, thawkins@treasurer.state.md.us, 410-260-7533 | PORFP (P.3) | Verified |
| `company_name` | Maryland State Treasurer's Office | PORFP (P.2) | Verified |
| `bid_summary` | Secondary competition under Master Contract 060B5400007 | PORFP (P.1-3) | Verified |
| `product_specification` | 30x SI# CC7802 Dell Latitude 5550 (Copilot ready, Ultra 5 125U...) | PORFP / Dell Specs | Verified |
