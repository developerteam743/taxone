# TaxOne Architecture Blueprint

## 1. Goals

TaxOne is a multi-tenant tax/accounting platform designed for CA firms, accountants and business users. The same API serves browsers, mobile/PWA clients and future native clients.

## 2. High-level architecture

```text
Browser / PWA / Mobile
          |
       HTTPS
          |
   Reverse Proxy / TLS
          |
      API Gateway
          |
     NestJS API
      /   |   \
 PostgreSQL Redis Object Storage
      |      |
   Prisma   BullMQ
              |
        Background Worker
          /         \
       OCR       GST Jobs
        |
 Python/FastAPI OCR
```

## 3. Multi-tenancy

All business data belongs to an organization. User access is resolved through organization membership and role/permission checks. Records that are business-specific also carry `businessId` and records that are financial-year-specific carry `financialYearId` where appropriate.

Recommended isolation rules:

- Never trust organization/client/business IDs from the client without authorization checks.
- Enforce tenant filters in repository/service methods.
- Add database constraints and indexes for tenant keys.
- Consider PostgreSQL row-level security for higher-assurance deployments.

## 4. Core domain

### Organization
Owns users, clients, businesses and configuration.

### Client
A customer of a CA/accounting firm. A client may own one or more businesses.

### Business
Legal/business entity with accounting and tax records.

### GST registration
A business can have multiple GST registrations, including state-specific registrations.

### Financial year
Separates accounting periods and controls reporting.

### Accounting
Double-entry accounting using journal entries and journal lines. Posted entries should be immutable; corrections should use reversal/adjustment entries.

### Documents
Files are metadata in PostgreSQL while binary content lives in local/S3-compatible storage. OCR jobs reference document IDs.

## 5. API boundaries

Suggested modules:

- `/auth`
- `/organizations`
- `/users`
- `/clients`
- `/businesses`
- `/gst-registrations`
- `/financial-years`
- `/accounts`
- `/ledger`
- `/journal-entries`
- `/customers`
- `/suppliers`
- `/items`
- `/invoices`
- `/payments`
- `/gst`
- `/reconciliation`
- `/documents`
- `/ocr`
- `/reports`
- `/notifications`
- `/audit`

REST is the initial interface. Keep domain services independent of transport so GraphQL or native-client APIs can be added later.

## 6. Accounting transaction flow

```text
Draft document
    |
Validate master data + tax
    |
Calculate invoice totals
    |
Post accounting transaction
    |
Create journal entry + lines
    |
Create GST record
    |
Audit event
    |
Report/query projections
```

## 7. Invoice OCR flow

```text
Upload -> virus/type/size validation -> object storage
       -> OCR queue -> OCR worker -> structured extraction
       -> confidence + validation -> human review
       -> approve -> create invoice/accounting transaction
```

OCR must not automatically post low-confidence results. Store raw extraction and normalized values separately.

## 8. GST reconciliation

Inputs can include purchase records and imported government-provided return data. Matching should use configurable weighted criteria such as GSTIN, invoice number, invoice date, taxable value and tax amounts. Output statuses should include matched, probable match, partial match, missing in return, extra in return and needs review.

Keep GST rules and import formats versioned because government specifications can change.

## 9. Security

- HTTPS everywhere outside localhost.
- Password hashing with Argon2id/bcrypt.
- Short-lived access tokens and rotating refresh tokens.
- RBAC and permission checks server-side.
- Rate limiting for authentication and sensitive APIs.
- Audit logs for authentication, master-data changes, posting, document approvals and permission changes.
- Encrypt backups and protect object-storage access with signed URLs.
- Never log passwords, tokens, tax credentials or document contents unnecessarily.
- Secrets supplied through environment/secret manager, never committed.

## 10. Self-hosting

For an office deployment:

```text
Windows/Linux server
  |-- Docker Engine
  |-- reverse proxy
  |-- TaxOne web
  |-- TaxOne API
  |-- worker
  |-- PostgreSQL
  |-- Redis
  `-- document storage
```

Use a private LAN by default. For remote access use a VPN or hardened public deployment rather than exposing PostgreSQL/Redis directly.

## 11. Production scaling

The API and worker are stateless and can scale horizontally. PostgreSQL remains the source of truth. Redis is for queues/caching, not accounting truth. Object storage holds documents. Long-running OCR/report/export operations belong in workers.

## 12. Observability

Provide structured logs, request IDs, job IDs, health endpoints, database/queue metrics, failed-job tracking and error alerts.

## 13. Backups

At minimum:

- Scheduled PostgreSQL backups.
- Point-in-time recovery where supported.
- Separate document-storage backup.
- Periodic restore testing.
- Encrypted backup credentials.
