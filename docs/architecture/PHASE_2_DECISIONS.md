# Phase 2 Decisions

| ID | Decision | Reason / consequence |
|---|---|---|
| P2-001 | Fastify 5 | Modular plugin encapsulation with a small initial API surface. |
| P2-002 | Prisma 7 + pg adapter | Current ESM/driver-adapter model; generated client kept outside node_modules. |
| P2-003 | Supabase Auth | Shared identity for Expo and admin; passwords stay out of SARIRA DB. |
| P2-004 | Next.js 16 App Router | Current admin foundation; uses `proxy.ts`, not deprecated middleware naming. |
| P2-005 | No heavy global state | Auth/provider state only; add server cache when real endpoints require it. |
| P2-006 | Append-only consent events | Preserves grant/revoke history and version trace. |
| P2-007 | Database-backed roles | JWT/Proxy gates are optimistic; API remains authoritative. |
| P2-008 | Vercel + Render + Supabase staging | Simple, provider-managed, and no production auto-deploy. |
| P2-009 | pgvector extension only | Prepares database without implementing RAG. |
| P2-010 | Preserve Phase 1 mock UI | Maintains visual/user-flow validation while data services transition. |

## Phase 1 refactors

- `apps/prototype` renamed to `apps/user-app`.
- Files moved into route groups without recreating screens.
- Auth pages changed from inert demo buttons to Supabase/mock service flows.
- AppShell consumes shared responsive hook.
- UI package gained missing production states/components and z-index token.
- Logout route made explicit after browser QA found an auth-guard race.

## Git strategy

Recommended branches: `main`, `develop`, `feature/*`, `fix/*`. Conventional commits are required. This workspace is not a Git repository, so Phase 2 cannot truthfully provide an actual commit history. Suggested commit slices appear in the final report; do not create one synthetic giant commit after the fact.
