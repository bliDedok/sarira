# Environment Strategy

## Environments

| Environment | Data | Deployment | Logging |
|---|---|---|---|
| development | Local pgvector PostgreSQL; mock auth/data by default | Local | debug |
| staging | Dedicated Supabase project/database; real auth | Vercel + Render | info |
| production | Separate Supabase project/database | Not deployed in Phase 2 | info/warn |

Templates are under `infrastructure/environments`. Populate real values only in ignored `.env` or provider secrets.

## Server-only

`DATABASE_URL`, `DIRECT_URL`, `SUPABASE_SERVICE_ROLE_KEY`, deployment hooks, future AI keys.

## Public client

`EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_USE_MOCK_DATA`, and Next equivalents. Public keys still rely on RLS/API authorization and must never be treated as secrets.

## Validation

`@sarira/config` validates client/server variables. When `USE_MOCK_DATA=false`, non-test server startup requires database URL, Supabase URL, and public key. CI tests this failure mode.
