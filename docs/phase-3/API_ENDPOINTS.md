# Phase 3 API Endpoints

All routes use `/api/v1`. Private routes require a bearer token and return the shared `{ data, meta? }` envelope; validation/auth/conflict errors use safe messages without stack traces.

| Area | Method and path |
|---|---|
| System | `GET /health`, `GET /version` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me` |
| Profile/role | `GET /profiles/me`, `PATCH /profiles/me`, `GET /roles/available`, `PUT /profiles/me/role` |
| Consent | `GET /consents/required`, `GET /consents/available`, `GET /consents/me`, `PUT /consents/:type`, `DELETE /consents/:type` |
| Guardian | `GET /guardian-consent/status`, `POST /guardian-consent`, `DELETE /guardian-consent` |
| Progress | `GET /onboarding/status`, `PATCH /onboarding/status` |
| Safety | `GET /safety-screening/current`, `POST /safety-screening/sessions`, `PUT /safety-screening/sessions/:id/answers`, `POST /safety-screening/sessions/:id/complete`, `GET /safety-screening/sessions/:id/result` |
| Goals | `GET /goals/available`, `PUT /profiles/me/goal` |
| Questionnaire | `GET /questionnaires/onboarding`, `POST /questionnaires/:templateId/sessions`, `PUT /questionnaire-sessions/:id/answers`, `POST /questionnaire-sessions/:id/complete`, `GET /questionnaire-sessions/:id` |
| Program | `GET /program-preferences`, `PUT /profiles/me/program-preference`, `POST /profiles/me/program-preference/skip` |
| Summary | `GET /onboarding/summary`, `POST /onboarding/complete` |
| Admin read-only | `GET /admin/configuration/versions` |

Password reset is deliberately handled by the Supabase client SDK rather than a custom password endpoint. Compatibility aliases `GET /consents` and `GET /goals` remain for Phase 2 clients.

Write endpoints scope sessions and records to the authenticated owner. Duplicate active safety/questionnaire sessions return the resumable existing session; completion endpoints are safe to repeat.
