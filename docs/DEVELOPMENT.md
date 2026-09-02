# Development

## Prerequisites
Node 22+, pnpm 9+, Docker.

## Local
1. Copy `.env.example` to `.env` and set strong secrets.
2. Start PostgreSQL and Redis with `docker compose up -d postgres redis`.
3. Run `pnpm install`.
4. Run `pnpm --filter @taxone/database prisma:generate`.
5. Run `pnpm --filter @taxone/database prisma:migrate`.
6. Run `pnpm --filter @taxone/database seed`.
7. Run API/web/worker with `pnpm dev`.

Demo login: `admin@example.com` / `Admin@12345` (development only).

## Docker
`docker compose up --build`

The repository is intentionally adapter-based: paid OCR, email, WhatsApp and official GST integrations can be added without changing accounting domain code. Never use development credentials in production.
