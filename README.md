# TaxOne

Tax and accounting automation platform for CA firms, accountants, and businesses.

## Vision

A responsive web/PWA application that works on mobile, tablet, desktop, and can be self-hosted on an office computer/server or deployed to a VPS/cloud environment.

## Architecture

- Frontend: Next.js + TypeScript + Tailwind CSS
- API: NestJS + TypeScript
- Database: PostgreSQL + Prisma
- Background jobs: Redis + BullMQ
- Document/OCR service: Python/FastAPI
- Storage: local filesystem in development, S3-compatible storage in production
- Deployment: Docker Compose for self-hosting; containerized cloud deployment later

## Product modules

1. Authentication and RBAC
2. Firm/organization and client management
3. Businesses, GST registrations and financial years
4. Accounting: chart of accounts, ledgers, journals, cash/bank, receivables/payables
5. Sales and purchase invoices
6. Credit/debit notes and payments
7. GST data, returns and reconciliation
8. Invoice/document OCR and review workflow
9. Reports and PDF/Excel exports
10. Client portal and document management
11. Notifications and integrations
12. Audit logs, backups, security and administration

## Repository layout

```text
apps/web       Responsive web/PWA
apps/api       REST API
apps/worker    Background jobs
packages/*     Shared domain, database, UI and configuration packages
services/ocr   Document OCR service
services/gst-reconciliation GST matching service
docs/          Architecture, database, API, security, deployment and roadmap
docker/        Container configuration
.github/       CI/CD workflows
```

## Development principles

- Multi-tenant by organization.
- Every business transaction is auditable.
- Financial records are append-oriented; avoid destructive updates.
- GST rules are isolated from presentation/UI code.
- Mobile-first responsive UX.
- API-first architecture so mobile/desktop clients can share the same backend.
- Secrets never belong in Git.
- External GST/e-invoice/e-way-bill integrations must be isolated behind adapters and validated against current official specifications before production use.

## Roadmap

### Phase 1 — Foundation
Authentication, organizations, users, roles, clients, businesses, GST registrations, financial years, dashboard, database and Docker development environment.

### Phase 2 — Accounting
Chart of accounts, ledger, journal entries, sales, purchases, payments, trial balance, P&L, balance sheet and exports.

### Phase 3 — GST
GST tax engine, purchase/sales GST records, return data import, GSTR-2B workflow and reconciliation.

### Phase 4 — Document AI
Upload PDF/images, OCR, invoice field extraction, validation, human review and accounting-entry creation.

### Phase 5 — Integrations
Tally, email, WhatsApp and official tax-system integrations through replaceable adapters.

### Phase 6 — Production
Backups, monitoring, security hardening, rate limiting, audit review, cloud/VPS deployment and office-server deployment documentation.

## Security

This project is intended for financial/tax data. Production deployments must use HTTPS, strong authentication, least-privilege access, encrypted backups, audit logging, secure secrets management and appropriate retention/deletion policies.

## License

Private/proprietary unless changed by the project owner.
