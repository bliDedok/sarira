# Database Changes

Migration incremental: `prisma/migrations/20260808104126_phase4_baseline_tracking/migration.sql`.

## Entitas baru

`BaselineSession`, `DailyRecord`, `DailyCheckIn`, `MealLog`, `SleepLog`, `ActivityLog`, `StepRecord`, `BodyMeasurement`, `DigestiveLog`, `DailyTaskDefinition`, `DailyTaskInstance`, `DataCompletenessSnapshot`, `Day7Checkpoint`, `Day7Feedback`, dan `BaselineReadinessResult`.

Profile menerima relation ke semua agregat tanpa mengubah kontrak onboarding Phase 3. Audit enum menerima event Phase 4. Enum baru mencakup lifecycle, readiness, completeness, mood/barrier, log source, meal/sleep/activity/digestive values, task status/source, dan completeness scope.

## Integrity

- Foreign keys menghubungkan log ke profile, baseline, dan DailyRecord; cascade digunakan untuk child yang tidak bermakna tanpa parent baseline.
- Unique constraint melindungi daily record, daily check-in, daily task instance, step per baseline/tanggal, checkpoint/feedback/readiness per baseline.
- Partial unique index PostgreSQL melindungi satu open baseline per profile.
- Check constraints membatasi day index, target/extension, scores, scales, durations, steps, weight, waist, intensity, dan konsistensi tanggal teknis.
- Index mencakup profile/status, baseline/date, dan lookup history.

## Safety deployment

Sebelum migration, backup development dibuat ke `/private/tmp/sarira_phase3_pre_phase4.dump`. Migration diterapkan tanpa reset/drop dan status Prisma menunjukkan tiga migration up to date. Seed dapat dijalankan berulang.

## Rollback

Tidak ada down migration otomatis karena PostgreSQL enum additions dan tabel berelasi. Rollback aman: hentikan write, simpan log transaksi setelah backup bila dibutuhkan, restore verified pre-Phase-4 dump ke database terpisah/target yang disetujui, deploy aplikasi Phase 3, lalu verifikasi row count dan foreign key. Untuk lingkungan yang sudah menerima data Phase 4, gunakan forward-repair migration atau export/transform yang direview; jangan menghapus enum/table manual dan jangan menjalankan `prisma migrate reset`.
