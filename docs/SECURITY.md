# Security baseline

- Passwords use Argon2id.
- API authorization derives tenant context from the verified access token; business queries also constrain organization ownership.
- Prisma parameterizes database operations.
- Financial posting occurs inside a database transaction and posted entries are not edited in place.
- Audit records capture financial posting events.
- PostgreSQL and Redis are private Docker services; expose only the web/API ports.
- Production must use long random JWT secrets, TLS, restricted CORS, secure cookies where selected, rate limiting and private object storage.
- Upload endpoints must enforce size/MIME/extension validation and should enable the virus-scanning adapter before production use.
- Do not log passwords, tokens, tax credentials or document contents.

This is a baseline, not a certification. Before production, perform dependency scanning, penetration testing, backup/restore drills and a formal GST/tax compliance review.
