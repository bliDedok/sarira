# Phase 4 API Endpoints

Semua path memakai prefix `/api/v1`, bearer authentication, envelope `{ success, data, meta? }`, validasi schema, dan safe error response.

| Area | Method | Path | Catatan |
|---|---|---|---|
| Starter | GET | `/starter-journey` | Konteks onboarding nyata |
| Baseline | POST | `/baseline` | Create atau resume active |
| Baseline | GET | `/baseline/current` | Session, local date, task, completeness |
| Baseline | GET | `/baseline/:id` | Owner-scoped |
| Baseline | POST | `/baseline/:id/complete` | Penutupan eksplisit |
| Readiness | GET | `/baseline/:id/readiness` | Tersedia Day 14 |
| Journey | GET | `/baseline/:id/days` | Periode baseline saja |
| Journey | GET | `/baseline/:id/days/:dayIndex` | Detail satu hari |
| Check-in | GET/PUT | `/daily-checkins/:localDate` | Upsert satu per hari |
| Meal | GET/POST | `/meal-logs` | Filter query `localDate` opsional |
| Meal | PATCH/DELETE | `/meal-logs/:id` | Ownership + consent untuk update |
| Sleep | GET/POST | `/sleep-logs` | Duration backend |
| Sleep | PATCH/DELETE | `/sleep-logs/:id` | Manual source |
| Activity | GET/POST | `/activity-logs` | Manual source |
| Activity | PATCH/DELETE | `/activity-logs/:id` | Owner-scoped |
| Steps | GET | `/step-records` | Baseline history |
| Steps | PUT | `/step-records/:localDate` | Upsert manual |
| Body | GET/POST | `/body-measurements` | Opsional |
| Digestive | GET/POST | `/digestive-logs` | Filter tanggal opsional |
| Digestive | PATCH/DELETE | `/digestive-logs/:id` | Tidak ada diagnosis |
| Tasks | GET | `/daily-tasks/:localDate` | Instance idempotent |
| Tasks | PATCH | `/daily-tasks/:id` | Status task |
| Completeness | GET | `/baseline/:id/completeness` | Overall |
| Completeness | GET | `/baseline/:id/completeness/:localDate` | Daily |
| Day 7 | GET | `/baseline/:id/day-7-checkpoint` | Statistik deskriptif |
| Day 7 | POST | `/baseline/:id/day-7-feedback` | Feedback UX |

## Error behavior

- 401 authentication invalid/missing.
- 403 resource dimiliki profile lain.
- 404 baseline/log tidak ditemukan.
- 409 active lifecycle/consent conflict.
- 422 input, date, timezone, precondition, atau duration invalid.

List history hanya membaca baseline terkait (maksimum target + extension), bukan histori tahunan. Query database menggunakan index profile/baseline/date.
