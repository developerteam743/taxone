# API Contract Blueprint

Base path: /api/v1

## Auth
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/password/forgot
POST /auth/password/reset
POST /auth/mfa/challenge

## Organizations
GET /organizations
POST /organizations
GET /organizations/:id
PATCH /organizations/:id
GET /organizations/:id/members
POST /organizations/:id/invitations

## Clients
GET /clients
POST /clients
GET /clients/:id
PATCH /clients/:id
DELETE /clients/:id

## Businesses
GET /businesses
POST /businesses
GET /businesses/:id
PATCH /businesses/:id

## Documents
POST /documents
POST /documents/bulk
GET /documents
GET /documents/:id
POST /documents/:id/process
POST /documents/:id/reprocess
POST /documents/:id/review
POST /documents/:id/approve

## Accounting
GET /ledgers
POST /ledgers
GET /invoices
POST /invoices
POST /invoices/:id/post
POST /purchases
POST /payments
POST /receipts
POST /journals
GET /trial-balance
GET /profit-loss
GET /balance-sheet

## GST
GET /gst/registrations
POST /gst/registrations
GET /gst/returns
POST /gst/returns
POST /gst/returns/:id/validate
POST /gst/reconciliation
GET /gst/mismatches
POST /gst/mismatches/:id/resolve

## Integrations
GET /integrations
POST /integrations
POST /integrations/:id/test
POST /integrations/:id/sync
GET /integrations/:id/jobs

## Tasks
GET /tasks
POST /tasks
PATCH /tasks/:id
POST /tasks/:id/complete

## Communication
GET /conversations
POST /messages
POST /reminders
POST /document-requests

## Admin
GET /admin/audit-logs
GET /admin/jobs
GET /admin/health
GET /admin/usage

## API Rules
- All write endpoints use DTO validation.
- All tenant-owned endpoints enforce organization scope.
- Financial writes support Idempotency-Key.
- Errors use a consistent machine-readable format.
- Pagination is cursor-based for large collections.
- Dates are ISO 8601.
- Monetary values use decimal-safe representations.
- Every endpoint is documented in OpenAPI.
