# SARIRA — Phase 7 Expert System & Pattern Map

SARIRA Phase 7 extends the real onboarding, 14-day baseline, Nutrition Engine, Guided Meal, and Flex Kitchen with a deterministic Feature Engine, six-domain expert system, traceable Pattern Map, and exactly one eligible Weekly Action per week.

Pattern decisions are versioned, reproducible, safety/age/consent aware, and may abstain when domain evidence is insufficient. Rules decide; internal evidence supports; AI explanation is not part of Phase 7.

Feature snapshots, Pattern Maps, Decision Records, feedback, Weekly Action selection, and manual progress are real application paths. Development thresholds, rules, foods, recipes, and policy weights require expert/product validation. AI/RAG, food vision, production barcode lookup, wearables, Motion Coach, growth analysis, and digestive diagnosis remain out of scope.

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

Mock infrastructure is the safe local default and uses the same Phase 7 API contract and deterministic domain engines. Set `EXPO_PUBLIC_USE_MOCK_DATA=false` and `USE_MOCK_DATA=false` only after Supabase/database variables are configured. Public client values use `EXPO_PUBLIC_*` or `NEXT_PUBLIC_*`; service-role keys and database URLs are server-only.

Templates live in `infrastructure/environments`. Do not commit populated `.env` files.

## Documentation

- Phase 0 product source: `docs/00-product` through `docs/05-quality`
- Phase 1 design handoff: `docs/design`
- Phase 2 architecture: `docs/architecture`
- Phase 3 implementation, decisions, and final report: `docs/phase-3`
- Phase 4 baseline implementation and final report: `docs/phase-4`
- Phase 5 nutrition architecture, provenance, policy, tests, and final report: `docs/phase-5`
- Phase 6 recipes, meal planning, Flex Kitchen, migrations, tests, and final report: `docs/phase-6`
- Phase 7 features, expert-system rules, Pattern Map, Weekly Action, migrations, tests, and final report: `docs/phase-7`
- API contract: `docs/api`
- Database model/migrations: `docs/database`
- Historical Phase 2 report: `PHASE_2_FINAL_REPORT.md`
