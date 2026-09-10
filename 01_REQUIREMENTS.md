# Product Requirements Document

## Product
AI Accounting + GST Automation SaaS for Indian CA/Tax/Accounting Firms

## Personas
1. CA/Firm Owner
2. Accountant/Operator
3. Reviewer/Senior
4. Client/Business Owner
5. Admin
6. Integration/System Service

## Functional Requirements

### Authentication
- Email/password
- MFA
- login/logout
- refresh sessions
- password reset
- invitation
- session/device revocation
- role and permission management

### Tenant Management
- organization creation
- branch management
- user memberships
- tenant-scoped resources
- tenant-level settings

### Client Management
- create client
- multiple businesses
- GST registrations
- contacts
- assigned staff
- compliance status
- documents
- tasks
- communications

### Document Intake
- single/bulk upload
- drag/drop
- PDF/image/Excel/CSV
- duplicate detection
- malware scan
- metadata
- tags
- folders
- source
- processing status

### AI Data Entry
- extract invoice header
- extract line items
- extract GST fields
- extract bank transactions
- suggest ledger
- suggest tax code
- normalize vendor/customer
- confidence score
- reviewer correction
- approve/reject
- reprocess

### Accounting
- chart of accounts
- ledgers
- sales invoices
- purchase invoices
- expenses
- receipts
- payments
- journal entries
- allocations
- bank reconciliation
- financial periods
- lock/unlock controls

### GST
- GST registrations
- return periods
- GSTR-1 preparation
- GSTR-3B preparation
- GSTR-2B import/reconciliation
- mismatch categorization
- ITC tracking
- duplicate detection
- tax validation
- exception queue

### Integrations
- Tally
- Vyapar
- Excel
- CSV
- GST portal/approved APIs
- e-invoice
- e-way bill
- WhatsApp Business
- email
- S3

### Practice Management
- task creation
- recurring tasks
- compliance calendar
- reminders
- staff assignment
- SLA tracking
- client status

### Client Portal
- document requests
- upload
- approval
- messages
- task completion
- return/report access

### Reporting
- trial balance
- ledger
- P&L
- balance sheet
- sales
- purchases
- GST
- ITC
- reconciliation
- outstanding
- firm productivity

## Non-Functional Requirements
- 99.9% target availability for production
- encrypted transport
- encrypted storage
- horizontal API scaling
- asynchronous document processing
- tenant isolation
- auditability
- deterministic financial calculations
- backup and restore
- observability
- disaster recovery
- data retention controls
- India-focused compliance review

## Critical Acceptance Tests
1. User cannot access another organization’s client.
2. User cannot post without required permission.
3. Duplicate payment request does not create two payments.
4. Journal entry always balances.
5. Posted records cannot be silently edited.
6. Uploads are scanned before processing.
7. AI extraction cannot auto-post without required approval policy.
8. Every critical financial mutation is auditable.
9. GST mismatch explains why it failed.
10. Failed external integration does not corrupt accounting data.
