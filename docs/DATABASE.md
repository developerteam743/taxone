# Database Blueprint

PostgreSQL is the system of record. Prisma owns schema/migrations.

## Identity and tenancy

- `organizations(id, name, slug, status, created_at, updated_at)`
- `users(id, email, password_hash, name, status, created_at, updated_at)`
- `roles(id, organization_id, name)`
- `permissions(id, key)`
- `role_permissions(role_id, permission_id)`
- `organization_members(id, organization_id, user_id, role_id)`

## Clients and businesses

- `clients(id, organization_id, display_name, contact_email, phone, status)`
- `client_users(client_id, user_id, access_level)`
- `businesses(id, organization_id, client_id, legal_name, trade_name, pan, constitution, status)`
- `gst_registrations(id, business_id, gstin, state_code, registration_type, legal_name, status)`
- `financial_years(id, business_id, label, starts_on, ends_on, status)`

## Accounting

- `accounts(id, business_id, code, name, account_type, parent_id, opening_balance, active)`
- `journal_entries(id, business_id, financial_year_id, entry_number, entry_date, source_type, source_id, narration, status, posted_at)`
- `journal_lines(id, journal_entry_id, account_id, debit, credit, description, party_type, party_id)`
- `bank_accounts(id, business_id, account_id, bank_name, masked_account_number, ifsc, active)`
- `payments(id, business_id, financial_year_id, payment_number, payment_date, party_type, party_id, account_id, amount, method, reference)`

## Sales and purchase

- `customers(id, business_id, name, gstin, pan, billing_address, shipping_address)`
- `suppliers(id, business_id, name, gstin, pan, address)`
- `items(id, business_id, sku, name, hsn_sac, unit, sale_rate, purchase_rate, gst_rate, active)`
- `invoices(id, business_id, financial_year_id, invoice_number, invoice_date, invoice_type, customer_id, supplier_id, place_of_supply, taxable_value, cgst, sgst, igst, cess, total, status)`
- `invoice_items(id, invoice_id, item_id, description, quantity, rate, taxable_value, gst_rate, cgst, sgst, igst, cess, total)`
- `credit_notes(id, business_id, invoice_id, note_number, note_date, amount, reason, status)`
- `debit_notes(id, business_id, invoice_id, note_number, note_date, amount, reason, status)`

## GST

- `gst_return_periods(id, gst_registration_id, return_type, period, status)`
- `gst_return_records(id, period_id, record_type, source, gstin, invoice_number, invoice_date, taxable_value, cgst, sgst, igst, cess, raw_payload)`
- `gst_purchase_records(id, business_id, source, supplier_gstin, invoice_number, invoice_date, taxable_value, cgst, sgst, igst, cess, eligibility)`
- `gst_reconciliations(id, business_id, period, status, created_at)`
- `gst_reconciliation_items(id, reconciliation_id, purchase_record_id, return_record_id, match_status, score, reason)`

## Documents and OCR

- `documents(id, organization_id, client_id, business_id, filename, mime_type, size_bytes, storage_key, checksum, uploaded_by, status)`
- `ocr_jobs(id, document_id, status, provider, attempts, started_at, completed_at, error)`
- `ocr_results(id, ocr_job_id, document_type, raw_text, extracted_json, confidence, schema_version)`
- `document_reviews(id, document_id, reviewer_id, status, corrections_json, reviewed_at)`

## Audit and notifications

- `audit_logs(id, organization_id, user_id, action, entity_type, entity_id, before_json, after_json, ip, created_at)`
- `notifications(id, organization_id, user_id, channel, template, payload_json, status, sent_at)`

## Rules

1. UUID/ULID primary keys.
2. UTC timestamps in the database; render in organization/user timezone.
3. Money represented as fixed-precision decimal, never floating point.
4. Unique constraints must include tenant/business scope where applicable.
5. Add indexes on tenant keys, GSTIN, invoice number/date, return period and reconciliation status.
6. Never hard-delete posted financial transactions.
7. Store source references for every generated accounting entry.
