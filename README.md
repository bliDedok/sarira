# SARIRA — Phase 3 Real Onboarding

SARIRA Phase 3 connects the Active Balance UI to a real onboarding domain: account/session, profile and age group, role, versioned consent, guardian consent, deterministic safety, goal eligibility, versioned questionnaire, program preference, resumable progress, backend completion validation, and audit events.

Starter Journey and post-onboarding health features remain clearly labeled Demo. AI, RAG, nutrition calculation, wearable sync, Motion Coach, and Pattern Map are not implemented.

## Prerequisites

- Node.js 22+
- pnpm 11.7
- Docker Desktop for local PostgreSQL
- Xcode/Android SDK only when running native simulators

## Install and generate

```bash
pnpm install
pnpm db:generate
```

## Run with local mock services

```bash
pnpm dev:user       # Expo / web / native launcher
pnpm dev:admin      # http://localhost:3001
pnpm dev:api        # http://localhost:4000/api/v1
```

User web shortcut: `pnpm web`. Native: `pnpm ios` or `pnpm android` after platform SDKs are installed.

## Local PostgreSQL

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d postgres
cp .env.example .env
pnpm db:migrate:deploy
pnpm db:seed
pnpm db:migrate:status
```

The example database password is local-development-only. Replace all example values outside local development.

## Quality and builds

```bash
pnpm check
pnpm build
pnpm migration:check
```

`pnpm build:user`, `build:admin`, and `build:api` are available individually.

## Environment modes

Mock mode is the safe local default and uses the same Phase 3 API contract. Set `EXPO_PUBLIC_USE_MOCK_DATA=false` and `USE_MOCK_DATA=false` only after Supabase/database variables are configured. Public client values use `EXPO_PUBLIC_*` or `NEXT_PUBLIC_*`; service-role keys and database URLs are server-only.

Templates live in `infrastructure/environments`. Do not commit populated `.env` files.

## Documentation

- Phase 0 product source: `docs/00-product` through `docs/05-quality`
- Phase 1 design handoff: `docs/design`
- Phase 2 architecture: `docs/architecture`
- Phase 3 implementation, decisions, and final report: `docs/phase-3`
- API contract: `docs/api`
- Database model/migrations: `docs/database`
- Historical Phase 2 report: `PHASE_2_FINAL_REPORT.md`
