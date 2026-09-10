# AI/OCR Blueprint

## Processing Pipeline
1. Upload
2. Security scan
3. File normalization
4. Text extraction
5. OCR if required
6. Document classification
7. Field extraction
8. Normalization
9. Business rules
10. Confidence calculation
11. Duplicate detection
12. Review queue
13. Approval
14. Accounting transformation

## Document Types
- sales invoice
- purchase invoice
- credit note
- debit note
- bank statement
- expense bill
- GST return
- GST notice
- ledger
- trial balance
- other PDF/image/Excel documents

## Confidence Policy
High confidence does not mean automatic truth.

Example thresholds:
- >= 0.98: auto-suggest
- 0.90–0.979: review recommended
- < 0.90: mandatory review

Thresholds must be configurable and field-specific.

## Provenance
Store page, bounding box, OCR text, extraction model, model version and verification status.

## Human Review
Reviewer can:
- edit field
- accept all
- reject
- reprocess
- map ledger
- map tax
- split document
- merge duplicate
- add comment

## AI Safety
- no unrestricted database writes by an LLM
- structured output only
- schema validation
- deterministic accounting calculation
- tool permissions
- audit AI actions
- prompt/version tracking
- PII minimization
