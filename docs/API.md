# API Blueprint

Base path: `/api/v1`

## Auth

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Organization

- `GET /organizations/:id`
- `GET /organizations/:id/members`
- `POST /organizations/:id/members`
- `PATCH /organizations/:id/members/:memberId`

## Clients

- `GET /clients`
- `POST /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`
- `GET /clients/:id/businesses`

## Businesses

- `GET /businesses`
- `POST /businesses`
- `GET /businesses/:id`
- `PATCH /businesses/:id`
- `GET /businesses/:id/gst-registrations`
- `GET /businesses/:id/financial-years`

## Accounting

- `GET /businesses/:id/accounts`
- `POST /businesses/:id/accounts`
- `GET /businesses/:id/ledger`
- `POST /businesses/:id/journal-entries`
- `POST /businesses/:id/journal-entries/:entryId/post`
- `GET /businesses/:id/reports/trial-balance`
- `GET /businesses/:id/reports/profit-loss`
- `GET /businesses/:id/reports/balance-sheet`

## Sales/Purchase

- `GET /businesses/:id/invoices`
- `POST /businesses/:id/invoices`
- `GET /businesses/:id/invoices/:invoiceId`
- `POST /businesses/:id/invoices/:invoiceId/post`
- `GET /businesses/:id/purchases`
- `POST /businesses/:id/purchases`
- `POST /businesses/:id/payments`

## GST

- `GET /businesses/:id/gst/periods`
- `POST /businesses/:id/gst/import`
- `GET /businesses/:id/gst/reconciliation`
- `POST /businesses/:id/gst/reconciliation/run`
- `GET /businesses/:id/gst/reconciliation/:id/items`

## Documents/OCR

- `POST /documents`
- `GET /documents/:id`
- `POST /documents/:id/ocr`
- `GET /ocr/jobs/:id`
- `POST /documents/:id/review`
- `POST /documents/:id/approve`

## API rules

- Validate all input with DTO/schema validation.
- Return consistent error envelopes.
- Use pagination for collections.
- Require idempotency keys for payment/posting endpoints where duplicate requests are dangerous.
- Enforce authorization at the API service layer, not only in the UI.
