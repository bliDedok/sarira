# Database Architecture

## Platform

PostgreSQL is accessed only by the API through Prisma 7 and the `pg` driver adapter. `DIRECT_URL` is used by migration tooling; a pooled `DATABASE_URL` may be used by the deployed API. IDs use UUID consistently.

## Identity separation

`User` represents the SARIRA account mapped by `externalAuthId` to Supabase Auth. `Profile` contains health-profile attributes. `DependentProfile` belongs to an owner user and supports multiple dependents. Age is never stored; it is derived from `dateOfBirth`.

## Privacy and traceability

- Consent text/version/hash lives in `ConsentVersion`.
- Every grant/revoke is an append-only `UserConsent` event.
- `AuditLog.metadata` must contain only minimum non-sensitive descriptors.
- Safety records store ruleset ID/hash, answer codes, result status, and reason codes—no Phase 3 evaluator exists.
- `DeviceSession.deviceIdHash` avoids storing raw device identifiers.

## pgvector

The initial migration enables the `vector` extension, but no vector column, embedding job, document table, retrieval query, RAG, or AI integration is created.

## Lifecycle

Schema changes require a named migration, review of generated SQL, local migration test, CI deploy to an ephemeral database, then staging deployment. Production migration remains manual/approved.
