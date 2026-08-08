# Authentication Flow

## Runtime modes

| Mode | Identity provider | Data repository |
|---|---|---|
| Local/test | Development identity adapter | In-memory or PostgreSQL adapter |
| Staging/production | Supabase Auth | PostgreSQL/Prisma |

The application does not implement its own password storage. In real mode, registration and password login use Supabase Auth; reset-password email is initiated with Supabase. Google and Apple remain placeholders until real provider credentials exist.

## Session lifecycle

1. `POST /auth/register` or `POST /auth/login` returns provider access/refresh tokens plus onboarding state.
2. The client stores the access token and a minimal session in `AsyncStorage`.
3. Startup restores the Supabase session in real mode, calls `GET /me`, and refreshes `onboardingStatus/currentStep` from the API.
4. RouteGuard sends unauthenticated users to login, incomplete users to their backend step, and completed users to home.
5. Logout invalidates the local development token when applicable, records an audit event, signs out from Supabase in real mode, and clears device storage.

## Security behavior

- Private routes verify bearer tokens; authorization derives roles from the database, not client claims.
- The API sends generic auth errors and never returns passwords or provider secrets.
- Real mode fails configuration validation when required Supabase/database secrets are absent.
- A local development adapter exists only to make deterministic offline tests possible; it is not a production credential system.

External Supabase email delivery and provider acceptance must be run in the configured staging project before release because no provider credentials are stored in this repository.
