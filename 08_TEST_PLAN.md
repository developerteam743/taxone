# Test Strategy

## Unit
- GST calculations
- invoice calculations
- journal balancing
- ledger mapping
- OCR normalization
- validation rules
- permission checks

## Integration
- database transactions
- tenant isolation
- idempotency
- queue jobs
- object storage
- integration adapters
- webhooks

## E2E
1. signup -> organization -> invite user
2. client -> business -> GST registration
3. upload invoice -> OCR -> extraction -> review -> approve
4. approved invoice -> accounting posting
5. purchase -> 2B import -> reconciliation
6. payment -> allocation -> outstanding
7. client portal -> document upload
8. reminder -> delivery -> webhook

## Security Tests
- cross-tenant access
- IDOR
- privilege escalation
- expired token
- revoked refresh token
- upload bypass
- malicious file
- rate-limit bypass
- webhook spoofing
- SQL injection
- XSS
- CSRF

## Financial Invariant Tests
- debit equals credit
- no duplicate posting
- locked period blocks mutation
- reversal leaves audit trail
- tax totals reconcile
