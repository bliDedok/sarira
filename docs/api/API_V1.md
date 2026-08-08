# API v1

Phase 3 expands the stable `/api/v1` foundation into the complete onboarding contract. See [Phase 3 API Endpoints](../phase-3/API_ENDPOINTS.md) for the current route inventory and behavior.

## Conventions

- Public: health/version, register, login.
- Authenticated: own profile, role, consent, guardian, progress, safety, goal, questionnaire, program, summary/completion.
- Role-gated: read-only configuration versions for admin/reviewer roles.
- Success envelope: `{ "data": ..., "meta": ...? }`.
- Errors use stable codes and safe Indonesian messages; no stack traces are returned.
- Session/resource ownership is verified server-side.

## Example profile update

```http
PATCH /api/v1/profiles/me
Authorization: Bearer <token>
Content-Type: application/json

{"fullName":"Ayu","dateOfBirth":"1996-04-14","country":"ID","timezone":"Asia/Makassar","preferredLanguage":"id-ID"}
```

## Example versioned consent

```http
PUT /api/v1/consents/PRIVACY_POLICY
Authorization: Bearer <token>
Content-Type: application/json

{"granted":true,"version":"phase3-dev-v1","source":"ONBOARDING"}
```

The server accepts only cataloged consent types/versions. Seed wording is development content pending Legal/Privacy approval.
