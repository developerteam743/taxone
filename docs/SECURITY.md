# Security baseline

TaxOne is an independent accounting application. Treat all financial and tax data as sensitive.

- Passwords use Argon2id and plaintext credentials must never be logged.
- API authorization derives tenant context from the verified access token; every business query constrains organization ownership.
- Never trust organizationId/businessId supplied by the browser.
- Prisma parameterizes database operations.
- Financial posting occurs inside database transactions and posted entries are not edited in place; corrections use reversals/adjustments.
- Audit records capture authentication and financial posting events.
- PostgreSQL and Redis are private Docker services; expose only web/API ports.
- Production must use long random JWT secrets, TLS, restrictive CORS, secure cookies where selected, rate limiting and private object storage.
- Uploads must enforce size/MIME/extension validation and should pass a malware-scanning adapter before production use.
- Production storage should use private S3-compatible buckets and short-lived signed URLs.
- Do not log passwords, tokens, tax credentials or document contents.

## Production checklist
1. Replace every development secret.
2. Restrict CORS/origins to trusted domains.
3. Put Web/API behind HTTPS or a trusted VPN.
4. Keep PostgreSQL and Redis on the private network.
5. Configure encrypted backups and test restoration regularly.
6. Configure object-storage access policies and lifecycle rules.
7. Enable real email/OCR/GST adapters only after credentials and compliance requirements are reviewed.
8. Run dependency/container scanning and penetration testing before production.
9. Perform a formal GST/tax compliance review before relying on generated returns.

This is a security baseline, not a certification.
