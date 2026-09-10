# Database Blueprint

## Tenant Boundary
Organization is the root tenant.

Core relationship:
Organization
 -> Membership -> User
 -> Business
 -> Client
 -> Document
 -> Accounting
 -> GST
 -> Tasks
 -> Communication
 -> Integration
 -> Audit

## Important Constraints
- organization_id on every tenant-owned aggregate
- unique(org_id, natural_key)
- foreign keys
- soft delete only where legally/business appropriate
- immutable audit records
- financial period locking

## Suggested Financial Tables
journal_entries
journal_lines
invoices
invoice_lines
purchases
purchase_lines
payments
receipts
allocations
ledger_accounts
tax_codes
bank_accounts
bank_transactions
reconciliations

## Suggested AI Tables
documents
document_versions
document_extractions
extraction_fields
review_tasks
ai_models
ai_runs
ai_feedback

## Suggested GST Tables
gst_registrations
gst_returns
gst_return_lines
gst_reconciliations
gst_matches
gst_mismatches
itc_records
notices

## Idempotency
idempotency_keys:
- organization_id
- key
- endpoint
- request_hash
- response_status
- response_body
- created_at
- expires_at

Unique key should prevent duplicate processing.

## Audit
audit_logs:
- organization_id
- actor_user_id
- action
- entity_type
- entity_id
- before
- after
- request_id
- ip metadata where permitted
- created_at
