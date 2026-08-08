# Repository Structure

```text
sarira/
├── apps/
│   ├── user-app/          Expo app; migrated from Phase 1 prototype
│   ├── admin-web/         Next.js App Router admin foundation
│   └── api/               Fastify modular API
├── packages/
│   ├── ui/                Cross-platform UI components
│   ├── design-tokens/     Active Balance tokens and breakpoints
│   ├── shared-types/      Transport-safe shared types
│   ├── validation/        Zod schemas shared by client/server
│   ├── api-client/        Typed HTTP client
│   ├── config/            Environment schemas
│   ├── logger/            Logging/observability ports
│   ├── expert-system/     Phase 2 placeholder only
│   ├── nutrition-engine/  Phase 2 placeholder only
│   └── knowledge-base/    Phase 2 placeholder only
├── prisma/                Schema, generated migration, seed
├── infrastructure/
│   ├── docker/            Local PostgreSQL + pgvector
│   ├── environments/      Secret-free environment templates
│   ├── deployment/        Staging operational notes
│   ├── monitoring/        Observability boundary notes
│   └── supabase/          Storage bucket/RLS SQL
├── docs/
│   ├── 00-product..05-quality/  Phase 0 source of truth
│   ├── design/                  Phase 1 handoff
│   ├── architecture/            Phase 2 architecture
│   ├── api/                     API v1 contract
│   └── database/                Data model and migration guide
├── tests/e2e/             E2E foundation/runbook
└── .github/workflows/     CI and manual staging deployment
```

Generated folders (`dist`, `.next`, `.expo`, generated Prisma client, coverage) are ignored. `apps/user-app` keeps the Phase 1 screens, layouts, features, mocks, and utilities; production services/providers were added around them.

## Dependency direction

Applications may depend on packages. Packages must not import applications. `ui` depends only on tokens/types and React Native peers. API repositories do not leak Prisma models into public API contracts.
