# Extraction Strategy & Prompt Engineering

## 1. Zero-Hallucination Grounding Principles
Procurement documents require exactness. An inaccurate date, incorrect part number, or fabricated bond requirement can cause disqualification or financial exposure. The extraction strategy enforces five core rules:

1. **Explicit Grounding**: The LLM is instructed to extract *only* facts directly supported by the context window.
2. **Missing Information Strategy**: Any field not mentioned in the source context must return `"Not Specified"`. The system strictly prohibits guessing or filling values based on general knowledge.
3. **No Temporal Assumption**: The model is barred from calculating dates (e.g. converting "within 45 days" into a specific calendar day); relative timelines are preserved as stated.
4. **Metadata Isolation**: Document publishing dates, printer footers, and portal view timestamps are isolated from formal solicitation due dates.
5. **Post-Extraction Validation**: Outputs are scrubbed for placeholder strings like `"[Insert Date]"`, `"[TBD]"`, or generic hallucinations.

---

## 2. The 20 Required Fields & Extraction Criteria

1. **`bid_number`**: Extracts solicitation identifier (e.g., `JA-207652`, `#E20P4600040`).
2. **`title`**: Formal procurement title from cover/header.
3. **`due_date`**: Exact submission deadline including hour, minute, and timezone.
4. **`bid_submission_type`**: Physical delivery (hand, courier, mail) vs. electronic portal (eMMA, Bonfire).
5. **`term_of_bid`**: Base contract period and renewal extensions (e.g. 3 years + two 1-year renewals).
6. **`pre_bid_meeting`**: Date, time, platform, or physical room for pre-bid conference.
7. **`installation`**: Staging, asset tagging, factory install (CFI), or deployment duties.
8. **`bid_bond_requirement`**: Percentage or dollar bond/surety requirement.
9. **`delivery_date`**: Required delivery window or fulfillment schedule.
10. **`payment_terms`**: Invoicing instructions and payment timeframe (e.g. Net 30).
11. **`additional_documentation_required`**: Mandatory compliance forms, affidavits (Mercury, Contract), W-9.
12. **`mfg_for_registration`**: Required OEM for reseller authorization (e.g. Dell).
13. **`contract_or_cooperative_to_use`**: Master contract vehicle or cooperative schedule.
14. **`model_no`**: Specific hardware model numbers.
15. **`part_no`**: Line item numbers, manufacturer SKUs, or catalog IDs.
16. **`product`**: High-level equipment or commodity category.
17. **`contact_info`**: Buyer/POC name, email address, phone number.
18. **`company_name`**: Formal purchasing entity name.
19. **`bid_summary`**: Objective, concise summary of procurement scope.
20. **`product_specification`**: Hardware/technical specifications (processor, memory, display, OS).

---

## 3. Context Management & Chunking Strategy
- Procurement documents can range from 1-page addenda to 70+ page master solicitations.
- To balance token efficiency, cost, and recall:
  - Documents are split into paragraph-aware chunks respecting page boundaries.
  - Saliency scoring prioritizes:
    1. Early pages (cover, header, schedule of events).
    2. Sections with keywords: `due date`, `schedule`, `scope`, `specification`, `bond`, `terms`.
  - For multi-document packages, extraction is performed per document, creating candidate records that are synthesized across the package by the `ConflictResolver`.
