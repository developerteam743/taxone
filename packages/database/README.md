# @taxone/database

Prisma owns the database schema and migrations for TaxOne.

## Development workflow

1. Set `DATABASE_URL` from `.env.example`.
2. Run `pnpm --filter @taxone/database generate` after schema changes.
3. Create/apply migrations with Prisma in development.
4. Apply committed migrations in deployment with `prisma migrate deploy`.

The package exposes `PrismaClient` and Prisma types from `src/index.ts`.

Financial and tenant-owned data access must remain scoped to the organization boundary defined by the project blueprint.
