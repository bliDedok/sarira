# Migration Guide

## Local

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
cp .env.example .env
pnpm db:generate
pnpm db:migrate:dev
pnpm db:seed
pnpm db:migrate:status
```

The initial migration is `20260808070934_phase2_foundation`. It enables `vector` and creates foundation entities. It was applied successfully to PostgreSQL 17 with pgvector during Phase 2 verification.

## Change process

1. Edit `prisma/schema.prisma`.
2. Run `pnpm db:validate` and `pnpm db:migrate:dev --name <scope>`.
3. Review SQL for destructive operations, locks, PII, defaults, and indexes.
4. Run API integration tests on a clean/local database.
5. Commit schema and migration together using conventional commit.
6. CI runs `migrate deploy` before integration tests.
7. Staging uses `DIRECT_URL`; API runtime may use pooled `DATABASE_URL`.

Never run `migrate dev` against staging/production. Back up, rehearse rollback/forward-fix, and obtain approval before material production migrations.
