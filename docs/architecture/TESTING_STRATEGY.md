# Testing Strategy

## Test pyramid

- Unit: validation, responsive resolver, auth route resolver, role matcher.
- Component: Button, progress, status semantics, design tokens.
- API: Fastify `inject` tests for health/version, auth guard, profile, consent, errors.
- Integration: real PostgreSQL migration, Prisma repositories, audit log, pgvector extension.
- E2E foundation: documented browser journeys for user/admin/API under `tests/e2e`.
- Manual/native: iOS and Android device matrix after SDK installation and credentials.

## Required commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:migrate:status
```

CI provisions `pgvector/pgvector:pg17`, applies migration, runs all quality checks, and builds all three applications.

## Phase 2 evidence

- User app: 3 suites, 9 tests.
- API: 2 suites, 7 tests when PostgreSQL integration is enabled.
- Migration: one migration applied; schema up to date.
- Builds: Expo iOS/Android/web, Next admin, bundled API.
- Browser: login, route guard, reset validation, logout, mobile/tablet/desktop, no console errors.

Coverage thresholds and full E2E automation are deferred until real feature services exist; tests must not validate mock health outputs as clinical truth.
