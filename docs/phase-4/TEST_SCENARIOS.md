# Phase 4 Test Scenarios

## Unit/domain coverage

- Calendar day index, missed day, Day 7/14 availability.
- IANA timezone Asia/Makassar, Asia/Jakarta, UTC dan midnight boundary.
- Sleep cross-midnight dan invalid duration.
- Daily/overall completeness serta READY/PARTIALLY_READY/INSUFFICIENT_DATA.
- Satu active baseline dan task completion idempotency.
- Consent enforcement dan profile ownership.

## Integration A–J

| Scenario | Verification | Result |
|---|---|---|
| A Complete Day 1 | onboarding → starter → baseline → 4 log → score 100 | PASS |
| B Missing Data | check-in saja → PARTIAL dan missing domains | PASS |
| C Resume | login/session baru → baseline ID sama | PASS |
| D Day 7 | FixedClock → checkpoint + feedback | PASS |
| E Day 14 Ready | sufficient coverage → READY, tidak ada Pattern Map | PASS |
| F Day 14 Insufficient | missing coverage → INSUFFICIENT_DATA + extension | PASS |
| G Timezone | Makassar local boundary | PASS |
| H Authorization | user B membuka baseline user A → 403 | PASS |
| I Consent revoked | new activity write → conflict | PASS |
| J Sleep midnight | 23:30 → 06:30 = 420 menit | PASS |

## Database integration

Suite PostgreSQL menjalankan onboarding lengkap, grant consent, safety/goal/questionnaire/program, baseline create, empat domain tracking, completeness 100, lalu memverifikasi Profile, AuditLog, QuestionnaireAnswer, SafetyResult, BaselineSession, DailyRecord, snapshot, dan extension pgvector.

## Commands/results final

- User Jest: 4 suites, 13 tests PASS.
- API Vitest tanpa database: 4 suites PASS, 37 tests PASS, 1 database suite skipped.
- API dengan PostgreSQL: 5 suites, 38 tests PASS.
- Lint dan TypeScript seluruh workspace: PASS.
- User web, admin, API production build: PASS.
- Expo export iOS/Android/web: PASS.

Native validation adalah bundle/export development. Physical device, VoiceOver, dan TalkBack tetap menjadi staging/device acceptance.
