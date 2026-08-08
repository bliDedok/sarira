# Security Foundation

## Implemented

- Environment schemas fail closed in real staging/production mode.
- Client bundles receive only `EXPO_PUBLIC_*` / `NEXT_PUBLIC_*` variables.
- Passwords are handled by Supabase Auth; SARIRA database stores no password hash.
- Bearer-token verification and database-backed role guards protect API routes.
- Zod validation runs on client and server; server is authoritative.
- Helmet secure headers, explicit CORS origins, and per-minute rate-limit foundation.
- Error envelopes hide stack traces and database errors.
- Structured logs redact authorization, cookie, password, token, consent detail, and health-data keys.
- Audit events capture registration, login/logout, profile, consent, role/dependent, export/delete workflow events.
- Supabase private storage policies scope objects to owner ID.
- CI never auto-deploys production; staging deployment is manual.

## Secret rules

Never place `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, AI keys, deployment hooks, or passwords in Expo/Next public variables. Populate them only in local ignored `.env`, GitHub Environment secrets, Render, Vercel, or Supabase configuration.

## Not complete

- Threat model, penetration test, dependency/SBOM signing, WAF tuning, DDoS plan.
- Admin role provisioning workflow and break-glass process.
- Device attestation, biometric lock, certificate pinning.
- Production incident response and key-rotation drill.
- Security/legal review of Supabase region, retention, and sub-processors.

These are Phase 2 risks, not implicitly solved by framework defaults.
