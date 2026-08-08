# Authentication Architecture

## User app flow

1. Registration/login uses Supabase Auth email/password.
2. On native, the SDK persists session in AsyncStorage; web uses browser storage.
3. `AuthProvider` restores session and subscribes to changes.
4. `RouteGuard` sends unauthenticated protected routes to `/login`.
5. Authenticated users with incomplete onboarding go to `/setup/role-selection`.
6. Completed users entering auth pages go to `/home`.
7. Logout clears the local Supabase/mock session and returns to `/login`.
8. Reset-password always displays a neutral response.

OAuth adapters for Apple/Google are intentionally not configured without credentials.

## API flow

Bearer JWT is sent by `@sarira/api-client`. API verifies the token against Supabase Auth and maps `externalAuthId` to internal `User`. Role assignments are then read from PostgreSQL. Client claims never replace database authorization.

## Admin flow

Next.js uses `@supabase/ssr` with cookies and PKCE-compatible flow. `proxy.ts` refreshes tokens and performs an optimistic role gate. Data endpoints must still call the API, which is authoritative.

## Roles

USER, PARENT, GUARDIAN, CAREGIVER, ADMIN, CONTENT_REVIEWER, NUTRITION_REVIEWER, SUPER_ADMIN. `SUPER_ADMIN` satisfies every role guard. No admin role-editing UI exists in Phase 2.
