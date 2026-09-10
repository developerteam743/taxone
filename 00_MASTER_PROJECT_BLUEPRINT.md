# TaxOne-Style AI Accounting & GST Automation Platform
## Master Project Blueprint — v1.0

### 1. Product Goal
Build a production-grade, multi-tenant SaaS for CA/tax/accounting firms that automates:
1. Client/document collection
2. PDF/image/Excel/bank-statement ingestion
3. OCR + AI extraction
4. Ledger/account classification
5. Human review and approval
6. Accounting voucher/invoice generation
7. Tally/Vyapar/export integrations
8. GST data preparation, validation and reconciliation
9. Compliance workflow, notices and deadlines
10. Client communication, reminders and document portal
11. Audit, security, billing and administration

The product should be inspired by the workflow of modern Indian CA automation products, but all code, UI, branding, copy, workflows and implementation must be original.

### 2. Core Product Flow
Client/CA
 -> Upload / WhatsApp / Email / Integration
 -> Document Intake
 -> Virus/MIME/Checksum Validation
 -> OCR / PDF / Spreadsheet Parsing
 -> AI Extraction
 -> Confidence + Rule Validation
 -> Review Queue
 -> Ledger Mapping
 -> Accounting Engine
 -> Approval
 -> Tally/Vyapar/CSV/API Export
 -> GST Engine
 -> Reconciliation
 -> Filing Preparation
 -> Audit Trail

### 3. Major Modules
#### A. Identity & Organization
- Signup/login
- MFA
- session management
- organizations/tenants
- firms
- branches
- users
- roles/permissions
- invitations
- API keys
- device/session management

#### B. CA Practice Management
- clients
- contacts
- businesses
- GST registrations
- PAN/TAN metadata
- financial years
- compliance calendar
- tasks
- assignments
- deadlines
- reminders
- notes
- activity timeline

#### C. Document Management
- upload
- bulk upload
- folders/tags
- document status
- document versioning
- source tracking
- checksum/deduplication
- OCR status
- extraction status
- review status
- retention policies
- private object storage

#### D. AI/OCR
- image OCR
- scanned PDF OCR
- digital PDF extraction
- invoice extraction
- bank statement extraction
- purchase/sales extraction
- GST document extraction
- confidence scores
- field provenance
- model/version tracking
- human correction
- feedback dataset
- reprocessing

#### E. Accounting
- chart of accounts
- ledgers
- customers
- vendors
- items
- tax ledgers
- invoices
- credit/debit notes
- purchases
- expenses
- receipts
- payments
- journal entries
- voucher types
- allocations
- reconciliation
- opening balances
- period lock
- audit history

#### F. GST
- GST registrations
- GSTR-1
- GSTR-3B
- GSTR-2A
- GSTR-2B
- IMS
- ITC
- HSN/SAC
- place of supply
- RCM
- e-invoice
- e-way bill
- credit/debit notes
- duplicate detection
- tax calculation
- return validation
- purchase reconciliation
- vendor mismatch
- period mismatch
- exception workflow
- notices/orders

#### G. Integrations
Use adapters/interfaces so providers can be replaced.
- Tally adapter
- Vyapar adapter
- Excel/CSV adapter
- GST portal adapter
- e-invoice adapter
- e-way bill adapter
- WhatsApp adapter
- Email adapter
- S3-compatible storage
- future banking/e-commerce adapters

#### H. Client Portal
- client login
- document requests
- upload
- status tracking
- pending actions
- invoices/returns
- notices
- messages
- task approvals
- secure downloads

#### I. Communication
- WhatsApp templates
- email
- reminders
- document-request campaigns
- delivery tracking
- conversation timeline
- opt-in/consent records
- retry/dead-letter handling

#### J. Reporting
- P&L
- balance sheet
- trial balance
- ledger
- sales/purchase reports
- GST summaries
- ITC reports
- reconciliation reports
- outstanding reports
- productivity dashboards
- client compliance dashboard

#### K. Platform Administration
- tenant administration
- feature flags
- subscriptions
- usage metering
- plans
- invoices
- audit logs
- system health
- job monitoring
- integration monitoring
- security events

### 4. Recommended Architecture
Frontend:
- Next.js + TypeScript
- Tailwind CSS
- component system
- React Query/TanStack Query
- Zod
- server-side/BFF authentication where practical

Backend:
- NestJS + TypeScript
- REST API initially
- OpenAPI/Swagger
- DTO validation
- RBAC guards
- tenant guards
- idempotency middleware
- request IDs

Data:
- PostgreSQL
- Prisma
- Redis
- BullMQ

AI/OCR:
- Python FastAPI
- OCR provider abstraction
- document parser abstraction
- LLM/vision provider abstraction
- confidence/rules engine

Storage:
- S3-compatible object storage
- signed URLs
- encryption
- lifecycle policies

Infrastructure:
- Docker
- Caddy/Nginx or managed ingress
- PostgreSQL backups
- Redis
- object storage
- CI/CD
- observability

### 5. Repository Structure
apps/
  web/
  api/
  worker/
  ocr/
packages/
  database/
  accounting/
  gst/
  auth/
  validation/
  integrations/
  ai/
  ui/
  config/
  types/
  eslint-config/
  tsconfig/
docs/
  architecture/
  api/
  security/
  accounting/
  gst/
  ai/
  integrations/
  operations/
  compliance/
infra/
  docker/
  caddy/
  terraform/
  monitoring/
scripts/
tests/
  integration/
  e2e/
  security/

### 6. Data Model — Core Entities
Organization
Membership
User
Role
Permission
Business
Branch
Contact
GSTRegistration
FinancialYear
ClientTask
ComplianceDeadline
Document
DocumentVersion
DocumentExtraction
ExtractionField
ReviewTask
ChartOfAccount
Ledger
Customer
Vendor
Item
TaxCode
Invoice
InvoiceLine
Purchase
PurchaseLine
CreditNote
DebitNote
Payment
Receipt
JournalEntry
JournalLine
Allocation
BankAccount
BankTransaction
BankReconciliation
GSTReturn
GSTReturnLine
GSTReconciliation
GSTMismatch
ITCRecord
Notice
Integration
IntegrationCredential
ImportJob
ExportJob
Webhook
Communication
Message
Notification
AuditLog
IdempotencyKey
Subscription
UsageEvent

Every tenant-owned entity must carry an organization/tenant boundary directly or through a rigorously enforced ownership relation.

### 7. AI Extraction Contract
Each extracted field must retain:
- field name
- value
- normalized value
- confidence
- source
- model/provider
- model version
- document location/page/bounding box when available
- created timestamp
- verified flag
- verified by
- verification timestamp

Example:
{
  "field": "gstin",
  "value": "24ABCDE1234F1Z5",
  "normalizedValue": "24ABCDE1234F1Z5",
  "confidence": 0.98,
  "source": "ocr+vision",
  "model": "invoice-extractor-v1",
  "verified": false
}

AI suggestions must never silently become accounting truth. Posting requires deterministic validation and, depending on policy, human approval.

### 8. Accounting Invariants
- Financial records are append-oriented.
- Posted entries cannot be silently mutated.
- Reversal/correction creates traceable entries.
- Debit = credit for every journal entry.
- Posted invoice/payment operations are idempotent.
- Invoice numbers have tenant/business/series constraints.
- Locked financial periods reject writes.
- Every financial mutation produces an audit event.
- Currency/decimal precision is explicit.
- Tax amounts are deterministic and reproducible.

### 9. GST Rule Engine
Rules should be versioned and isolated from controllers/UI.

Minimum rule groups:
- GSTIN format/state code
- invoice number/date
- taxable value
- CGST/SGST/IGST consistency
- place of supply
- HSN/SAC
- rate validation
- RCM
- duplicate invoice
- credit/debit note linkage
- B2B/B2C classification
- GSTR-1 validation
- GSTR-3B mapping
- GSTR-2B matching
- IMS status
- ITC eligibility
- vendor mismatch
- period mismatch

Never hard-code uncertain government rules without validating against current official specifications.

### 10. Security Baseline
Mandatory before production:
- short-lived access tokens
- refresh token rotation + revocation
- HttpOnly Secure SameSite cookies or secure BFF
- MFA
- password hashing with Argon2id
- rate limiting
- brute-force protection
- RBAC
- tenant isolation
- CSRF protection where applicable
- security headers
- input validation
- output encoding
- upload size/type limits
- MIME sniffing
- malware scanning
- private object storage
- signed URLs
- encryption in transit/at rest
- secrets manager
- audit logging
- PII/secret redaction
- request IDs
- dependency scanning
- container scanning
- backup encryption
- restore testing
- vulnerability management

### 11. Reliability
- idempotent write APIs
- transactional financial posting
- job retries with exponential backoff
- dead-letter queues
- job deduplication
- timeouts
- circuit breakers for external providers
- webhook signature validation
- outbox pattern for reliable events
- reconciliation jobs
- health/readiness/liveness endpoints

### 12. Observability
Metrics:
- request latency/error rate
- login failures
- document processing latency
- OCR success rate
- AI extraction confidence
- review rate
- queue depth
- job failures
- GST reconciliation mismatch rate
- integration failures
- financial posting failures

Logs must be structured and must not expose passwords, tokens, API keys, bank credentials or unnecessary sensitive data.

### 13. UX Principles
- mobile-first
- CA dashboard first
- bulk operations
- keyboard-friendly review
- visible confidence/exception indicators
- clear "AI suggestion" vs "verified" states
- one-click approve/reject
- searchable global command bar
- activity timeline
- dark/light theme
- accessibility
- Indian accounting/GST terminology
- fast tables and pagination

### 14. MVP Order
P0: Auth, tenant, users, clients, businesses, documents, accounting core, audit
P1: OCR, AI invoice extraction, review queue, Excel/bank imports
P2: Tally export/integration, GST engine, GSTR-1/3B/2B reconciliation
P3: client portal, reminders, WhatsApp/email
P4: e-invoice/e-way bill, notices, advanced reporting
P5: AI assistant, anomaly detection, predictive workflows

### 15. Definition of Done
A feature is production-ready only when it has:
- DTO/schema validation
- authorization
- tenant isolation
- error handling
- audit trail where relevant
- idempotency where relevant
- unit tests
- integration tests
- E2E tests for critical paths
- observability
- documentation
- migration
- rollback plan
- security review
- performance consideration
