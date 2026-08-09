# Migration and Rollback

## Before deploy

1. Verify a recoverable database backup and record its timestamp/size.
2. Confirm all Phase 0–4 migrations are applied and the working tree uses the intended Phase 4 base.
3. Run `pnpm db:generate` and quality checks.
4. Apply migrations with `pnpm db:migrate:deploy`; never reset a populated database.
5. Run the idempotent development seed only in an authorized non-production environment.
6. Check migration status, table counts, API health, and a known food/target read.

For this local delivery, the pre-Phase-5 PostgreSQL custom-format backup is `/private/tmp/sarira_phase4_pre_phase5.dump`. It is a local QA artifact, not part of the repository.

## Application rollback

If application code must be rolled back while keeping the schema, deploy the last Phase 4 build. New additive tables remain unused. This is the preferred low-risk rollback because the Phase 5 migration is additive.

## Database rollback

Dropping Phase 5 tables would destroy Phase 5 data and is not automated. If an exact schema/data rollback is required:

1. stop writes and preserve a new incident backup;
2. validate the pre-migration backup in an isolated database;
3. restore that backup to a replacement database;
4. point the rolled-back application to the verified replacement;
5. retain the failed database for investigation until approved for disposal.

Do not manually mark the migration rolled back or execute destructive SQL on a production database without an approved recovery plan. A forward-fix migration is preferred when Phase 5 data must be preserved.

## Seed rollback

Synthetic rows are version-labeled. Disable the source/policies by a forward migration or admin-controlled operation rather than renaming them or deleting rows referenced by snapshots.

