# Deployment Blueprint

## Local development

Prerequisites: Node.js LTS, pnpm, Docker Desktop.

Start infrastructure with:

```bash
docker compose up -d postgres redis
```

Then install dependencies and run web/API/worker from the monorepo.

## Office server

Recommended host: dedicated Windows or Linux machine with a static LAN address and automatic restart. Keep PostgreSQL and Redis private. Publish only the web/API reverse proxy to the LAN. Use scheduled backups to a separate disk/NAS and periodically test restore.

Example LAN topology:

```text
Router
  |
Office LAN
  |
TaxOne Server 192.168.x.x
  |-- reverse proxy :443/:80
  |-- web
  |-- api
  |-- worker
  |-- PostgreSQL (private)
  `-- Redis (private)
```

## Remote access

Preferred options:

1. VPN into the office network.
2. Hardened VPS/cloud deployment with HTTPS.

Do not expose database or Redis ports to the public internet.

## Production checklist

- Replace all example secrets.
- Configure HTTPS.
- Configure database backups and restore tests.
- Configure object/document storage backups.
- Set secure cookie/token settings.
- Configure CORS to trusted origins only.
- Enable rate limiting.
- Enable structured logs and monitoring.
- Run migrations as a controlled deployment step.
- Verify tax integration credentials and official API specifications before enabling production connectors.
