# TaxOne Production Runbook

This runbook turns the architecture/security blueprint into an operational deployment baseline. The architecture requires HTTPS, private PostgreSQL/Redis, controlled migrations, backups, monitoring and tenant-aware authorization. See `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md` and `docs/SECURITY.md`.

## 1. Required production prerequisites

- Linux host or managed container platform with persistent volumes.
- DNS record pointing the public hostname to the reverse proxy.
- Docker Engine + Compose v2.
- A managed PostgreSQL instance or the included PostgreSQL service with encrypted storage and tested backups.
- Private Redis; never publish port 6379.
- Private object storage for documents; never make the bucket public.
- TLS certificate. Caddy obtains and renews public certificates automatically when DNS and ports 80/443 are reachable.
- Secret manager or protected environment file. Never commit production secrets.

## 2. Environment

Copy `.env.example` to a protected production environment file and replace every placeholder. Generate independent random values for `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`.

`NEXT_PUBLIC_API_URL` must be the public HTTPS API base, normally `https://<domain>/api/v1`. `APP_URL` must be the exact trusted web origin.

Do not use the development demo credentials or mock OCR in a production workflow.

## 3. Deploy

```bash
docker compose build --pull
docker compose up -d postgres redis
# Run the reviewed Prisma production migration command from the release process.
docker compose up -d api worker ocr web proxy
docker compose ps
```

Use `prisma migrate deploy` for production migrations. Do not use `prisma migrate dev` against production.

## 4. Network model

Only the Caddy proxy publishes ports 80/443. PostgreSQL, Redis and OCR remain on the internal backend network. The API and web services are reachable only through the application networks.

For office deployments, prefer a VPN for remote access. Never expose PostgreSQL or Redis directly to the Internet.

## 5. Backups

Back up both PostgreSQL and document/object storage. Keep backups outside the primary host, encrypt them, restrict backup credentials, and test a full restore on a schedule. Point-in-time recovery is recommended for financial data.

A backup is not considered production-ready until a restore has been successfully exercised.

## 6. Release gates

Before every production release:

1. CI is green.
2. Dependencies and containers have no unreviewed critical/high vulnerabilities.
3. Database migrations are reviewed and tested on a production-like copy.
4. Accounting posting, payment allocation, GST calculations and tenant isolation tests pass.
5. A database backup exists immediately before a destructive migration.
6. Health endpoints respond through the public HTTPS origin.
7. Logs and alerts are receiving events.
8. Rollback procedure is known and tested.

## 7. Security gates still required in application code

The current repository is a production-hardening baseline, not a claim of production certification. Before handling real tax/financial data, complete:

- Refresh-token rotation and server-side revocation/session management.
- Server-side RBAC/permission guards on every protected controller/service.
- Rate limiting, especially login and financial mutation endpoints.
- Idempotency keys for invoice posting/payment endpoints.
- DTO validation and consistent error envelopes across all controllers.
- Object-storage signed URLs and malware scanning for uploads.
- Structured logs with request/job correlation IDs and secret/document-content redaction.
- Formal audit-log review and immutable/append-oriented financial correction workflows.
- Automated tenant-isolation tests.
- Dependency, image and secret scanning plus penetration testing.
- Formal GST/tax compliance review before filing or relying on generated returns.

## 8. Operational monitoring

Monitor API error rate/latency, authentication failures, PostgreSQL health/storage, Redis health, worker queue depth/failures, OCR failures, document-storage capacity, backup success and certificate expiry.

Alert on repeated authentication failures, queue growth, failed backups, database disk pressure, application crash loops and sustained 5xx responses.
