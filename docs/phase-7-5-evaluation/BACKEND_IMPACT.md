# Backend and Migration Impact

No backend, schema, API, engine, or migration is changed by Phase 7.5 evaluation. This document classifies potential implementation impacts.

## Classification legend

- **NO CHANGE** — can use existing public/presentation data and current contracts.
- **MINOR LOGIC CHANGE** — routing/orchestration/adapter/API behavior without a new durable domain model.
- **SCHEMA CHANGE** — new/changed persisted fields or entity.
- **MIGRATION REQUIRED** — existing rows/contracts require safe transition/backfill/versioning.

## Impact matrix

| Proposal | Classification | Backend/API implications | Engine boundary |
|---|---|---|---|
| Static Guest Explore with bundled examples | NO CHANGE | Public assets/content only | No real eligibility result |
| Public previews served remotely | MINOR LOGIC CHANGE | Public read endpoint/cache/content governance if not bundled | Demo data clearly separated |
| Soft auth gate and route resume | MINOR LOGIC CHANGE | Preserve allow-listed intended action through auth | No engine change |
| Cross-device anonymous guest profile/progress | SCHEMA CHANGE + MIGRATION REQUIRED | Guest/session ownership, expiry, conversion, deletion | Not recommended in first scope |
| Guest → registered intent conversion | MINOR LOGIC CHANGE | Validate/clear local intent; idempotent resume | Personal answers start after auth |
| Guest → registered personal-data migration | SCHEMA CHANGE + MIGRATION REQUIRED | Anonymous ownership and merge conflict rules | Avoid for first scope |
| New mobile UI/components/copy | NO CHANGE | Existing contracts through adapters | Engines unchanged |
| Presentation adapter for enums/rules | MINOR LOGIC CHANGE | Mapping/version/fallback; may be client-only | Raw result retained internally |
| Questionnaire orchestration/reordering | MINOR LOGIC CHANGE | Draft/resume and conditional validation may need endpoint changes | Required inputs preserved |
| Progressive questions | MINOR LOGIC CHANGE | Profile completeness becomes capability-specific | Engine calls validate required input |
| Replace DOB UX with declared age | SCHEMA CHANGE + MIGRATION REQUIRED | New age fields/timestamps/resolver; existing DOB transition | Engines continue receiving age/AgeGroup |
| Continue requiring DOB internally while hiding it | Unsafe/rejected | Synthetic DOB or undocumented inference | Do not implement |
| Teen 17→18 boundary | MINOR LOGIC CHANGE plus age migration dependency | Scheduled/login-time reconfirmation, guardian state transition | Re-evaluate safety/eligibility |
| Derived Program presentation from current goal/baseline/action | NO CHANGE or MINOR LOGIC CHANGE | Aggregation/read model may be client/BFF | No eligibility rewrite |
| Durable Program Enrollment lifecycle | SCHEMA CHANGE + MIGRATION REQUIRED | Enrollment, phase, start/pause/end/version/history | Engines remain decision providers |
| Food Today meal-slot presentation | NO CHANGE or MINOR LOGIC CHANGE | Aggregate existing logs/plans by local day/slot | Nutrition/Meal Planning unchanged |
| Motion Coach manual MVP | SCHEMA CHANGE likely; MIGRATION REQUIRED if added to existing activity history | Session/exercise completion if not representable by activity model | Safety eligibility unchanged |
| Future camera/pose validation | Major future system; SCHEMA CHANGE + MIGRATION REQUIRED | Permissions, inference/session data, retention, audit | Separate Phase, not current |
| Points/streak/level/badge | SCHEMA CHANGE + MIGRATION REQUIRED | Idempotent event ledger, policy version, aggregates/reversal | Must not alter health eligibility |
| Pattern/Weekly Action copy/layout | NO CHANGE or MINOR LOGIC CHANGE | Presentation mapping/aggregation | Phase 7 computation unchanged |
| Curated Unsplash manifest | NO CHANGE if bundled | Optional content manifest/CDN only; no API now | No engine impact |

## Age migration proposal

1. Approve data semantics: declared age, declaration timestamp, reconfirmation policy.
2. Add nullable fields without removing DOB.
3. Implement one age-context resolver and contract tests at 12, 17, 18, 25, 26, 59, 60, 75, and out-of-range boundaries.
4. For existing users, derive an initial declared/effective age from stored DOB and mark source as migrated; request confirmation at next appropriate session.
5. New UX writes declared age; full DOB remains only for approved legacy/legal use during transition.
6. Update onboarding completion, safety, goal, baseline, nutrition input adapters, validation, and Expert System adapters.
7. Re-run teen/guardian and safety/target policies on boundary/change.
8. Remove mandatory DOB only after monitoring/regression approval; retain historical data according to privacy policy.

No backfill should invent a DOB from age.

## Gamification data proposal

If approved later, prefer:

- `GamificationEvent` with unique idempotency key, actor/user, type, source entity, effective local day, points, policy version, status/reversal, timestamps;
- derived or cached balance/level/streak;
- badge award record with unique rule/badge/user constraint;
- daily caps and audit/recalculation path.

A single mutable `points` column is insufficient for deduplication, correction, policy changes, or audit.

## Program model decision

Start with a presentation-derived “current program” if existing data can provide a stable answer. Introduce a durable Program Enrollment only when requirements explicitly include multiple programs, pause/resume lifecycle, historical program versions, or program-level analytics. This controls schema risk and avoids rebuilding engines.

## Compatibility requirements

- Safety, Nutrition, Meal Planning, Expert System, Pattern Map, and Weekly Action outputs remain authoritative.
- New UI adapters must tolerate missing/partial legacy data.
- API responses should retain machine values internally while the UI uses localized presentation labels.
- Writes are idempotent where retry is possible.
- Local day/timezone rules are explicit for meal slots, daily tasks, streaks, and progress.
- Every schema proposal requires separate approval, migration, rollback, data-quality checks, and tests.

