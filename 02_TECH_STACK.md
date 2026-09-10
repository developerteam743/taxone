# Technology & Infrastructure Specification

## Frontend
- Next.js
- TypeScript
- Tailwind CSS
- accessible component library
- TanStack Query
- React Hook Form
- Zod
- Playwright

## API
- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Swagger/OpenAPI

## AI
- Python
- FastAPI
- OCR abstraction
- PDF parser
- vision/LLM provider abstraction
- deterministic post-processing

## Storage
- S3-compatible object storage
- private buckets
- signed URLs
- lifecycle rules

## Deployment
Development:
Docker Compose

Production:
- managed PostgreSQL preferred
- managed Redis preferred
- object storage
- container runtime/Kubernetes/ECS equivalent
- reverse proxy/ingress
- secrets manager
- centralized logs
- metrics + alerts
- CI/CD

## Required Environments
- local
- development
- staging
- production

## CI Gates
- frozen dependency install
- lint
- typecheck
- unit tests
- integration tests
- Prisma validation
- migration validation
- build
- dependency vulnerability scan
- container scan
- secret scan

## Database
Use migrations only. Never modify production schema manually.

Recommended PostgreSQL features:
- indexes for tenant + business + date
- unique constraints
- check constraints for financial invariants where possible
- transactions
- row-level security may be added as defense-in-depth

## Event Architecture
Use:
API -> DB transaction -> outbox -> queue -> worker -> integration/provider

Never rely on an external API call inside a long financial DB transaction.
