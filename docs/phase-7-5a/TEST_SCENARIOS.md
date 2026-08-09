# Phase 7.5A Test Scenarios

## Requirement coverage

| ID | Scenario | Evidence | Result |
| --- | --- | --- | --- |
| A | Boundary age 12/17/18/25/26/59/60/75 | `age-resolver.unit.test.ts` | PASS |
| B | Legacy DOB tetap bekerja | Resolver unit + onboarding existing regression | PASS |
| C | Declared-age profile tanpa DOB | Onboarding E2E + PostgreSQL integration | PASS |
| D | Teen guardian requirement | Onboarding E2E usia 17; adult 18 | PASS |
| E | Safety eligibility tidak berubah | API regression + real DB Phase 3–7 flow | PASS |
| F | Goal eligibility tidak berubah | API regression + real DB flow | PASS |
| G | Nutrition policy age context | Nutrition unit/E2E + real DB flow | PASS |
| H | Expert System age rules | API/expert regression + real DB flow | PASS |
| I | Structured input validation | Jest UI + validation tests | PASS |
| J | Consent rendering state | Jest expand/check + visual QA | PASS |
| K | Existing Phase 3–7 regression | 87 API tests + PostgreSQL integration | PASS |

## Quality commands

| Command/gate | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test` | PASS — UI 16, API 87; DB suite skipped in memory run and run separately. |
| PostgreSQL integration targeted | PASS — 1 test. |
| `pnpm db:validate` | PASS |
| `pnpm migration:check` | PASS |
| `pnpm db:migrate:status` | PASS — 11 up-to-date. |
| `pnpm build` | PASS — web/admin/API. |
| iOS Expo embed bundle | PASS — 5,741,424 bytes. |
| Android Expo embed bundle | PASS — 5,978,872 bytes. |
| High-confidence secret scan | PASS — 0 tracked matches/files. |
| `git diff --check` | PASS. |

## Build outputs

- Expo web: 65 static routes.
- Admin Next: production build complete.
- API tsup: `dist/server.js` 1.02 MB.
- iOS: `/private/tmp/sarira-phase7-5a-ios-final/main.jsbundle`.
- Android: `/private/tmp/sarira-phase7-5a-android-final/index.android.bundle`.

## Non-failing warning

Real PostgreSQL test mencetak deprecation warning `pg` tentang `client.query()` yang sedang mengeksekusi query. Test tetap PASS; perbaikan async flow dicatat sebagai technical debt dan bukan regresi Phase 7.5A.
