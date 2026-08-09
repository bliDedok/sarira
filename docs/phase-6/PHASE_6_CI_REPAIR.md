# Phase 6 — CI Integration Repair

Tanggal verifikasi: 2026-08-09  
Branch: `feature/phase6-meal-planning`  
Scope: perbaikan integrasi CI Phase 6; tanpa Phase 7, tanpa perubahan acceptance criteria, dan tanpa merge.

## 1. Failing test

GitHub Actions run `31297870816` gagal pada job `quality-and-build`, langkah `pnpm test`:

- File: `apps/api/tests/database.integration.test.ts`
- Suite: `PostgreSQL Phase 3–6 integration`
- Skenario: `menjalankan onboarding → baseline → daily tracking → completeness pada database nyata`
- Assertion: baris 45, `expect(required.length).toBeGreaterThanOrEqual(3)`
- Endpoint sebelum assertion: `GET /api/v1/consents/required`
- Nilai aktual di CI: `0`
- Nilai minimal yang diharapkan: `3`

Field yang bernilai nol adalah panjang daftar consent wajib. Test mengharapkan tiga consent onboarding aktif—`TERMS_OF_SERVICE`, `PRIVACY_POLICY`, dan `HEALTH_PROFILE`—sebelum melanjutkan ke safety screening, questionnaire, baseline, daily tracking, nutrition, dan meal planning.

## 2. Actual root cause

Akar masalahnya adalah bootstrap database CI yang tidak lengkap. Workflow lama menjalankan `prisma migrate deploy`, tetapi tidak menjalankan seed data referensi sebelum test. Migrasi berhasil membuat schema dan keenam migration tercatat applied, tetapi migrasi memang tidak mengisi `ConsentVersion`, safety template/rules, questionnaire, goal configuration, Phase 4 task definition, nutrition reference/policy, atau meal-planning reference/policy.

Pada database PostgreSQL baru yang hanya dimigrasikan, pemeriksaan langsung menghasilkan seluruh reference count `0` dan single integration test gagal identik di baris 45. Setelah reference seed dijalankan, test yang sama lulus.

`USE_MOCK_DATA=true` bukan penyebabnya: test database secara eksplisit membuat Prisma client dan meng-inject real Prisma repositories ke aplikasi. Audit juga tidak menemukan penyebab pada timezone, clock, raw current time, filter completeness, promise yang tidak di-`await`, race condition, atau perubahan service Phase 4.

## 3. Why local pass but CI fail

Database lokal sudah memiliki data hasil `pnpm db:seed` dari pengembangan Phase 3–6. Runner GitHub selalu memulai PostgreSQL baru, lalu sebelumnya hanya menerapkan migration. Karena itu code, runtime, dan test command sama, tetapi state reference data berbeda.

| Komponen | Lokal saat diagnosis | GitHub Actions saat gagal | Setelah repair |
|---|---|---|---|
| Node.js | `v22.23.1` | `22` | `22` |
| pnpm | `11.7.0` | `11.7.0` | `11.7.0` |
| PostgreSQL | `pgvector/pgvector:pg17`, runtime `17.10` | `pgvector/pgvector:pg17` | sama |
| Database | port `54322`, database persisten/temporer lokal | `localhost:5432/sarira`, database baru | database baru |
| `APP_ENV` | `test` | `test` | `test` |
| `NODE_ENV` | `test` | `test` | `test` |
| `USE_MOCK_DATA` | `true`; real repositories di-inject oleh DB test | sama | sama |
| Migration | 6 migration, up to date | 6 migration, up to date | 6 migration, fail-fast status sebelum test |
| Reference seed | sudah tersedia | tidak dijalankan | reference-only seed sebelum lint/test |
| Test command | `pnpm test` / targeted Vitest | `pnpm test` | `pnpm test` |

Perbedaan penentunya hanya reference bootstrap, bukan versi runtime atau implementasi fitur.

## 4. Files

- `.github/workflows/ci.yml`: memberi nama langkah, memindahkan migration status ke sebelum test, dan menambahkan deterministic integration reference seed.
- `prisma/seed.ts`: menambahkan mode `SEED_REFERENCE_DATA_ONLY=true`; default seed lokal tetap menyertakan development profiles, sedangkan CI hanya memuat reference data.
- `apps/api/tests/database.integration.test.ts`: mempertahankan skenario kritikal dan menambah verifikasi persistence langsung untuk enam artefak Phase 4.
- `docs/phase-6/PHASE_6_CI_REPAIR.md`: laporan diagnosis, repair, dan verifikasi.

Tidak ada file fitur Phase 7, UI, service, route, schema, atau migration yang diubah.

## 5. Database/config impact

Urutan CI sekarang adalah:

1. PostgreSQL service sehat melalui `pg_isready`.
2. Prisma client digenerate.
3. Seluruh 6 migration diterapkan.
4. `prisma migrate status` harus menyatakan database up to date.
5. `SEED_REFERENCE_DATA_ONLY=true pnpm db:seed` mem-bootstrap reference data deterministik.
6. Lint, typecheck, test, dan build berjalan.

Reference-only bootstrap pada database baru menghasilkan:

- User: `0`
- BaselineSession: `0`
- Required consent: `3`
- Safety template: `1`
- Questionnaire template: `1`
- DailyTaskDefinition `phase4-dev-v1`: `4`
- Active nutrition policy: `4`
- Active meal-planning policy: `1`

Test membuat user dan seluruh state skenario sendiri dengan email ber-UUID, lalu cascade cleanup mengembalikan jumlah User ke `0`. Tidak ada data pengguna fixture yang dipakai CI.

## 6. Migration changed?

Tidak. Tidak ada migration baru atau migration lama yang diedit. Total tetap enam:

1. `20260808070934_phase2_foundation`
2. `20260808081900_phase3_onboarding`
3. `20260808104126_phase4_baseline_tracking`
4. `20260808142710_phase5_nutrition_engine`
5. `20260809040519_phase6_meal_planning`
6. `20260809043100_phase6_consumption_cascade`

`prisma migrate status` lulus pada database reproduksi dan runner GitHub sebelum test dimulai.

## 7. Seed changed?

Ya, hanya pada cara pemanggilan untuk isolasi CI. `prisma/seed.ts` sekarang melewati `seedPhase4Profiles()` ketika `SEED_REFERENCE_DATA_ONLY=true`. Semua reference seeding tetap memakai upsert deterministik dan source/version yang sudah ada.

Perilaku default `pnpm db:seed` lokal tidak berubah. CI tidak lagi bergantung pada development profile fixtures; CI hanya bergantung pada reference configuration/catalog yang memang dibutuhkan oleh alur nyata Phase 3–6.

## 8. Regression test

Skenario PostgreSQL kritikal yang gagal tetap dipertahankan tanpa skip, fake assertion, sleep, atau pelemahan expected value. Sesudah menulis Day 1 data, test sekarang memeriksa langsung:

- `DailyCheckIn = 1`
- `MealLog = 1`
- `SleepLog = 1`
- `ActivityLog = 1`
- `DailyRecord` berstatus `COMPLETE = 1`
- `DataCompletenessSnapshot = 2` (`DAY` dan `OVERALL`)

Endpoint completeness juga wajib memberi HTTP `200`, `score: 100`, dan `completedDays: 1`. Assertion existing untuk onboarding, audit, questionnaire answer, safety result, baseline, nutrition, plan snapshots, idempotent consumption, serta recipe version history tetap aktif.

## 9. Local test

Hasil lokal final:

- Reproduksi database baru, migration-only: FAIL identik `expected 0 to be greater than or equal to 3`.
- Database baru, reference-only seed: single PostgreSQL integration PASS; User sebelum/sesudah test `0`.
- User app mock tests: `13/13 PASS`.
- API mock mode: `65 PASS`, database suite `1 skipped` sesuai mode tanpa URL database.
- API real PostgreSQL: `66/66 PASS`, 9/9 test files.
- Lint seluruh workspace: PASS.
- Typecheck seluruh workspace: PASS.
- Prisma schema validate dan migration diff check: PASS.
- PostgreSQL 6 migration dan migration status: PASS.
- Expo web export: PASS, 61 static routes.
- Next admin production build: PASS.
- API tsup build: PASS.
- iOS Hermes export: PASS, bundle 7.5 MB.
- Android Hermes export: PASS, bundle 7.8 MB.
- Secret scan: PASS, no matches.

Warning deprecation dari package `pg` masih non-failing dan tetap dicatat sebagai technical debt Phase 6; warning tersebut bukan penyebab kegagalan CI.

## 10. GitHub Actions

| Run | Commit | Hasil | Keterangan |
|---|---|:---:|---|
| [31297870816](https://github.com/bliDedok/sarira/actions/runs/31297870816) | `20e7a38` | FAIL | Reference seed belum ada; `required.length = 0` |
| [31298584286](https://github.com/bliDedok/sarira/actions/runs/31298584286) | `5d2febc` | PASS | Migration status + deterministic seed + strengthened DB assertion |
| [31298812081](https://github.com/bliDedok/sarira/actions/runs/31298812081) | `6a363c8` | PASS | Final reference-only bootstrap; `quality-and-build` hijau penuh |

Pada final run, langkah install, Prisma generate, 6 migration, migration status, reference-only seed, lint, typecheck, tests, build, dan container cleanup seluruhnya sukses.

## 11. Commit hash

- `5d2febc` — `fix(ci): bootstrap PostgreSQL integration data`
- `6a363c8` — `fix(ci): isolate integration reference seed`

Kedua commit sudah di-push ke `origin/feature/phase6-meal-planning`. Branch baru tidak dibuat dan PR tidak di-merge.

## 12. Final Phase 6 CI status

**PASS — Phase 6 lokal dan CI benar-benar hijau.**

Root cause telah diperbaiki pada bootstrap CI, bukan ditutupi di test. Skenario onboarding → baseline → daily tracking → completeness → nutrition → meal planning tetap berjalan pada PostgreSQL nyata dengan prerequisite reference data deterministik dan user state yang terisolasi. Seluruh acceptance criteria Phase 6 tetap berlaku, tidak ada fitur Phase 7 yang dimulai, dan tidak ada merge yang dilakukan.
