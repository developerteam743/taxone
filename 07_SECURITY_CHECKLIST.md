# Production Security Checklist

## Authentication
[ ] Argon2id password hashing
[ ] MFA
[ ] refresh-token rotation
[ ] refresh-token revocation
[ ] secure cookies/BFF
[ ] brute-force protection
[ ] rate limiting
[ ] password reset expiry
[ ] session revocation

## Authorization
[ ] RBAC guards
[ ] permission checks
[ ] tenant guards
[ ] object-level authorization
[ ] integration credential isolation
[ ] admin separation

## Files
[ ] size limits
[ ] extension allowlist
[ ] MIME verification
[ ] malware scanning
[ ] checksum/dedup
[ ] private buckets
[ ] signed URLs
[ ] retention/lifecycle

## API
[ ] DTO validation
[ ] request IDs
[ ] security headers
[ ] CORS allowlist
[ ] CSRF strategy
[ ] idempotency
[ ] webhook signature verification
[ ] timeout limits

## Data
[ ] TLS
[ ] encryption at rest
[ ] encrypted backups
[ ] secret manager
[ ] PII minimization
[ ] redacted logs
[ ] audit logs

## Operations
[ ] dependency scanning
[ ] container scanning
[ ] secret scanning
[ ] backup automation
[ ] restore drill
[ ] monitoring
[ ] alerting
[ ] incident response plan
