# Database Changes

Incremental migration: `prisma/migrations/20260808081900_phase3_onboarding/migration.sql`.

## Added/expanded

- Profile locale/role/onboarding fields and versioned `OnboardingProgress`.
- `GuardianConsent`.
- `SafetyScreeningTemplate`, `SafetyQuestion`, `SafetyRuleDefinition`, expanded sessions/answers/results.
- `GoalDefinition` linked to the existing `Goal` table.
- `QuestionnaireTemplate`, questions, options, sessions, answers.
- `ProgramPreference`.
- Consent required/source/content-status fields and Phase 3 types.
- Phase 3 audit events.

Foreign keys use restrict/cascade semantics appropriate to their owner hierarchy. Indexes cover user/profile ownership, session/status lookups, template code/version, current consent type/version, and audit lookup paths.

## Data preservation

The migration renames `Profile.name` to `fullName`, backfills onboarding status/completion timestamps, converts legacy safety answer text with an explicit `USING CASE`, renames safety reason codes to triggered rules, links result profiles, and backfills progress. It does not reset the database.

## Rollback note

This migration adds PostgreSQL enum values and transforms columns, so automatic down migration is intentionally not shipped. Before production deployment, take a verified backup. Rollback is: stop new writes, restore the pre-migration backup or apply a reviewed forward-repair migration, redeploy the Phase 2 application, and verify referential counts. Do not manually remove enum values or drop Phase 3 tables on a live database.

Local verification applied both migrations, reran the idempotent seed, and reported no pending migrations.
