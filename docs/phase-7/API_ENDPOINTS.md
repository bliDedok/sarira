# Phase 7 API Endpoints

Semua endpoint user memerlukan authentication dan ownership profil. Envelope/error mengikuti API SARIRA.

| Method | Path | Fungsi |
|---|---|---|
| POST | `/analysis/features/generate` | generate/idempotent Feature Snapshot |
| GET | `/analysis/features/latest` | snapshot terbaru |
| POST | `/pattern-maps/generate` | evaluate dan persist decision/map/action |
| GET | `/pattern-maps/current` | current non-superseded map |
| GET | `/pattern-maps/:id` | historical/current map milik profil |
| POST | `/pattern-maps/:id/feedback` | simpan feedback |
| GET | `/decisions/:id` | full Decision Record dan evaluations |
| GET | `/weekly-actions/current` | current eligible assignment |
| GET | `/weekly-actions/history` | assignment history |
| POST | `/weekly-actions/:id/check-ins` | manual idempotent check-in |
| DELETE | `/weekly-actions/:id/check-ins/:localDate` | undo check-in |
| GET | `/admin/analysis/configuration/versions` | read-only active versions untuk role admin/reviewer |

Error Phase 7: `BASELINE_NOT_READY`, `INSUFFICIENT_DATA`, `CONSENT_REQUIRED`, `RULE_PACK_NOT_AVAILABLE`, `ANALYSIS_FAILED`, `ANALYSIS_ALREADY_EXISTS`, `ACTION_NOT_ELIGIBLE`, dan `FORBIDDEN`. Validation error tetap memiliki structured details. API client menyediakan typed method untuk seluruh alur user.
