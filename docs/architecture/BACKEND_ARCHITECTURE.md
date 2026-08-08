# Backend Architecture

## Decision

Fastify 5 was selected over NestJS. Phase 2 needs a small API with explicit module boundaries; Fastify plugins provide encapsulation without requiring a larger framework surface. A future split into services remains possible because route, auth, repository, and domain boundaries are already separate.

## Request lifecycle

1. Fastify creates/propagates request ID.
2. Helmet, CORS, and rate limit run.
3. Auth pre-handler verifies Bearer token with Supabase `getUser` or test adapter.
4. Account and roles are loaded through repository interface.
5. Zod validates params/body.
6. Route invokes a repository/use-case boundary.
7. Response uses success/error envelope.
8. Audit event is written for sensitive state changes.
9. Redacted structured completion/error log is emitted.

## Adapters

- `MockAuthAdapter` and memory repositories: development/tests only.
- `SupabaseAuthAdapter`: registration, login, token verification.
- Prisma repositories: account/profile/consent/audit persistence.
- `LoggerPort` and `ObservabilityAdapter`: external vendor-neutral boundaries.

## Domain modules

Typed module descriptors exist for authentication, users, profiles, family, consent, safety, goals, baseline, check-ins, nutrition, recipes, food-log, activity, sleep, workouts, growth, digestive-support, pattern-map, weekly-actions, evidence, referrals, devices, and notifications.

Only authentication/users/profiles/consent/goals/safety-storage boundaries have Phase 2 foundation. Other modules deliberately report placeholder status and own no health rules.
