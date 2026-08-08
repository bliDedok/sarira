# SARIRA Phase 5 Final Report

Status: **SELESAI — 47/47 acceptance criteria PASS**  
Tanggal verifikasi: 2026-08-08 (Asia/Makassar)  
Scope: Phase 5 Real Nutrition Engine saja; Phase 6 tidak dimulai.

## 1. Ringkasan implementasi

Phase 5 mengaktifkan alur nutrisi end-to-end yang deterministic dan versioned: database pangan traceable, serving khusus pangan, kalkulasi delapan nutrien, item dan snapshot historis, agregasi meal/daily, target berbasis kelompok usia/goal/safety/policy, indikator minimum/range/upper-limit, allergen warning, pencarian/add/edit/delete, history, consent, ownership, dan audit. Guided Meal/Flex Kitchen recommendation, AI, Pattern Map, dan fitur Phase 6 tetap Demo atau out of scope.

## 2. Branch dan base commit

- Branch: `feature/phase5-nutrition-engine`
- Base commit Phase 4: `0aad7e4aa665c5b7ada2f8a2915e169279474d70`
- Tidak ada merge atau push yang dilakukan.

## 3. Database model baru

Model baru: `FoodDataSource`, `FoodItem`, `FoodServing`, `NutrientDefinition`, `FoodNutrient`, `FoodAllergen`, `FoodDietaryTag`, `MealLogItem`, `NutritionSnapshot`, `NutritionPolicy`, dan `NutritionTargetProfile`. Relasi menautkan data ke `profileId`, `MealLog`, sumber/version, dan target policy. Index dan unique constraint mencakup search, source, nutrient, ownership/history, policy selection, dan effective date.

## 4. Migration

Migration incremental `20260808142710_phase5_nutrition_engine` telah diterapkan. Empat migration terdeteksi dan status database “up to date”. Tidak ada migration Phase 0–4 yang diedit atau database reset. `prisma validate` dan `migration:check` lulus.

Backup sebelum migration tersedia sebagai artifact lokal `/private/tmp/sarira_phase4_pre_phase5.dump` (154094 bytes, 2026-08-08 22:26:44 WITA).

## 5. Food source

Source development tersimpan dengan nama `SARIRA Phase 5 Synthetic Nutrition Fixtures`, type `SYNTHETIC_TEST_DATA`, version `phase5-synthetic-v1`, license `INTERNAL-DEVELOPMENT-ONLY`, serta label larangan penggunaan sebagai rekomendasi. Source/version ikut masuk ke snapshot dan daily source metadata.

## 6. Seed dataset

Seed idempotent berisi 15 pangan lokal/development, 8 nutrient definition, 1 source, dan 4 policy. Seed dijalankan dua kali setelah perubahan final dan keduanya lulus. Oatmeal sengaja tidak memiliki sodium untuk membuktikan unknown tidak menjadi zero.

## 7. Nutrition Engine architecture

Pure engine di `packages/nutrition-engine`, version `phase5-dev-v1`, tidak bergantung pada database/UI/network. Service API mengatur consent, ownership, policy context, snapshot, dan audit; repository memory/Prisma mengatur persistence; user app hanya menampilkan respons real API.

Formula utama:

```text
gramAmount = quantity × gramEquivalent
nutrientAmount = amountPerBasis × gramAmount / basisAmount
```

Aggregation menggunakan snapshot dan mempropagasi `null` bila nutrient item tidak tersedia. Rounding hanya pada output.

## 8. Formula/policy yang digunakan

Target mendukung `MINIMUM`, `RANGE`, dan `UPPER_LIMIT`; near-limit dimulai pada 80% maximum. Policy aktif: Teen 12–17, Young Adult 18–25, Adult 26–59, dan Healthy Aging 60–75. Young Adult/Adult GREEN dapat memakai adjustment energi versioned ±150 kcal untuk goal eligible; teen dan Healthy Aging tidak.

## 9. Policy yang masih perlu validasi ahli

Semua 4 policy memiliki `requiresExpertValidation = true`. Rentang nutrient/energi, adjustment, floor, upper limit, special population, allergen semantics, dan dataset license/transform memerlukan review ahli nutrisi, product, legal/privacy, serta operational sebelum production.

## 10. Nutrition target behavior

Target tersimpan sebagai snapshot efektif per profile dan mencatat policy/version, goal, age group, safety, reason, restriction, input values, serta timestamp. Read target membandingkan goal, safety, age group, policy code, dan policy version; mismatch membuat target baru dengan reason `PROFILE_SAFETY_GOAL_OR_POLICY_CHANGED`.

## 11. Safety restriction

GREEN mengizinkan general target dan adult goal adjustment yang dibatasi. YELLOW menghasilkan restricted general target. RED menghasilkan target kosong dan reason professional review. Teen tidak memakai adult policy; Healthy Aging tidak mendapat automatic deficit.

## 12. Allergen behavior

Preview mencocokkan code allergen pangan dengan jawaban profile. Match menampilkan warning sebelum save dan warning disimpan pada item. Metadata kosong tampil sebagai “Informasi alergen belum lengkap”, bukan dianggap bebas alergen. Semua fixture masih unverified.

## 13. API

Endpoint aktif: food search/detail/servings, nutrient registry, preview, current/recalculate target, daily/history, add custom/database item, edit item, dan delete item. Semua private, mengikuti envelope v1, validation, rate limit, stable errors, consent, ownership, dan audit conventions Phase 2–4. Tidak ada AI endpoint.

## 14. UI changes

Route `/food` kini membuat/edit/delete MealLog, mencari pangan melalui server dengan debounce, memilih serving/quantity, menampilkan preview dan provenance, memberi allergen warning, menyimpan item/custom food, serta memperbarui daily summary. Route `/nutrition` menampilkan delapan indikator, policy/safety/source, dan history 7 hari. Home menampilkan empat metric nutrisi real. Touch target interaktif minimal 44 px dan kartu meal tablet diperbaiki berdasarkan QA browser.

## 15. Mock → real changes

Food database/search, portion calculation, food/meal/daily calculation, nutrition target, indicator, dan home nutrition summary tidak lagi berlabel Demo. Data fixture masih development-labeled. Guided Meal/Flex Kitchen recommendation, AI/RAG, final Pattern Map, Weekly Action, food vision/barcode production, wearable/Motion Coach, growth/family/digestive analysis tetap Demo/out of scope.

## 16. Unit tests

Unit test mencakup serving-to-gram, nutrient scaling, meal/daily aggregation, recipe foundation 4 servings, minimum/range/upper-limit, rounding, missing nutrient, null versus zero, serta allergen warning. Root test menghasilkan 13 test user app PASS dan seluruh API memory suite PASS.

## 17. Integration tests

PostgreSQL integration berjalan dengan database lokal seeded: 7 test files, 54 tests PASS. Skenario mencakup onboarding/baseline, search/select/add, daily snapshot/target persistence, edit/delete, ownership, consent, age policy, safety, dan unknown nutrient. Ada warning deprecation `pg` non-blocking yang dicatat sebagai technical debt.

## 18. E2E

Skenario A–H PASS: rice+egg menghasilkan 280 kcal dan sekitar 10.8 g protein; perubahan/hapus porsi mengubah total; indicator real; sodium oatmeal unavailable; allergen egg warning; teen policy; Healthy Aging restriction; reload/login snapshot/history; serta automatic GREEN→RED target refresh.

Browser critical path juga PASS dari registrasi sampai relogin, termasuk custom food tanpa angka karangan.

## 19. Responsive QA

- Mobile 390×844: cards stack, bottom tabs, no horizontal overflow, no touch target <44 px.
- Tablet 768×1024: sidebar dan split cards, meal summary tidak terjepit, no horizontal overflow.
- Desktop 1440×900: sidebar, overview/list/detail, no horizontal overflow, no touch target <44 px.
- Fresh browser load: no console warning/error pada final build state.

## 20. Accessibility

PASS untuk semantic textbox/button/radio/switch/tab/link roles, accessible progress labels, indicator labels, textual status yang tidak bergantung pada warna, live error notices, screen-reader-friendly food results/history, keyboard-capable search input, responsive text wrapping, dan large touch targets. Phase 5 user flow tidak memiliki horizontal clipping pada tiga breakpoint.

## 21. Build results

- `pnpm build:user`: PASS, 53 static routes termasuk `/food` dan `/nutrition`.
- `pnpm build:admin`: PASS, Next.js production build.
- `pnpm build:api`: PASS, ESM bundle.
- Expo export `--platform all`: PASS; web 5.9 MB, iOS Hermes 7.5 MB, Android Hermes 7.8 MB.
- Root lint, typecheck, tests, Prisma validate: PASS.

Development-only `NO_COLOR` warnings during Expo bundling tidak memengaruhi output.

## 22. Security

Private routes require auth; item operations enforce profile ownership; request logs redact authorization/password/health-answer fields; validation and bounded pagination are active; master-data history uses restrictive foreign keys. Secret scan menemukan hanya placeholder pada `.env.example`; tidak ada kandidat secret di luar template.

## 23. Privacy

`NUTRITION_DATA` consent required for new nutrition-specific processing. Revocation blocks processing without automatically deleting historical data. All items/targets use `profileId`; allergen free text is not copied into master data or target snapshots; audit metadata excludes sensitive free-form notes.

## 24. Technical debt

- Replace synthetic foods/policies with licensed, reviewed, versioned production sources.
- Resolve the non-blocking `pg` concurrent-query deprecation warning before pg 9.
- Add production admin read-only source/policy viewer if operations require it; optional Phase 5 admin scope was not expanded.
- Define validated weight/activity recalculation thresholds before activating those triggers.
- Consider version-keyed food-master caching after scale measurement; daily/history intentionally remain uncached.
- Recipe calculation foundation exists, but recipe persistence/recommendation UI and cooking correction factors were not added.
- Legacy prototype/profile demonstration content remains separated and labeled; it is not a nutrition calculation source.

## 25. Daftar commit

1. `5bda933 feat(nutrition): activate deterministic nutrient engine`
2. `f1c0d8c feat(food): add versioned food database foundation`
3. `6258283 feat(nutrition): add food targets meal items and daily APIs`
4. `3d9940f feat(ui): connect real food flow and nutrition indicators`
5. `b71548e fix(nutrition): refresh targets when policy context changes`
6. `d77d073 fix(ui): improve nutrition touch targets and tablet layout`
7. `930aa8a test(nutrition): label postgres suite for phase5`
8. `docs(phase5): document nutrition architecture and acceptance` — commit yang memuat laporan ini.

## 26. Acceptance criteria PASS/FAIL

| # | Acceptance criterion | Status | Evidence ringkas |
|---:|---|---|---|
| 1 | Food database schema real | PASS | Prisma models/migration/repository |
| 2 | Food provenance tersimpan | PASS | Source + version on food/nutrient/snapshot |
| 3 | Nutrient registry real | PASS | 8 seeded definitions and endpoint |
| 4 | Food serving system real | PASS | Food-specific serving rows/API/UI |
| 5 | Portion conversion real | PASS | Pure formula + preview/test |
| 6 | Food nutrient calculation real | PASS | Engine + snapshot values |
| 7 | MealLogItem real | PASS | Persisted item model/CRUD |
| 8 | Nutrition snapshot real | PASS | One stable snapshot per item |
| 9 | Meal nutrition aggregation real | PASS | Snapshot aggregation tests |
| 10 | Daily nutrition aggregation real | PASS | Daily API/history/UI |
| 11 | Nutrition policy versioned | PASS | 4 `phase5-dev-v1` policies |
| 12 | Nutrition target profile real | PASS | Persisted effective target snapshots |
| 13 | Target type MINIMUM bekerja | PASS | Protein/fiber tests and UI |
| 14 | RANGE bekerja | PASS | Energy/carb/fat tests and UI |
| 15 | UPPER_LIMIT bekerja | PASS | Sugar/sodium/saturated-fat tests |
| 16 | Nutrition Indicator tidak lagi mock | PASS | `/nutrition` consumes real daily API |
| 17 | Home nutrition summary real | PASS | 4 metrics from daily API |
| 18 | Food search real | PASS | Server pagination/filter/debounce |
| 19 | Add-food flow real | PASS | Browser/API/PostgreSQL tests |
| 20 | Edit portion real | PASS | Snapshot/total recalculation |
| 21 | Delete meal item recalculates | PASS | E2E and browser QA |
| 22 | Missing nutrient != zero | PASS | Oatmeal sodium `null` |
| 23 | Allergen warning foundation bekerja | PASS | Egg match warning |
| 24 | Dietary tag foundation tersedia | PASS | Model/enum/seed/API detail |
| 25 | Teen tidak menggunakan policy adult | PASS | Dedicated E2E policy assertion |
| 26 | Healthy Aging restriction tersedia | PASS | Dedicated policy/reason test |
| 27 | SafetyResult memengaruhi target eligibility | PASS | GREEN→RED auto-refresh test |
| 28 | Policy auditability tersedia | PASS | version/input/reason/time/safety |
| 29 | Profile ownership bekerja | PASS | cross-profile update returns 403 |
| 30 | Consent enforcement bekerja | PASS | revoked consent returns `CONSENT_REQUIRED` |
| 31 | Historical snapshot stabil | PASS | relogin snapshot/history persists |
| 32 | Timezone daily aggregation benar | PASS | localDate + profile timezone logic/tests |
| 33 | Responsive mobile PASS | PASS | 390×844 browser audit |
| 34 | Tablet PASS | PASS | 768×1024 browser audit |
| 35 | Desktop PASS | PASS | 1440×900 browser audit |
| 36 | Accessibility PASS | PASS | roles, labels, text status, 44 px targets |
| 37 | Unit test PASS | PASS | root check green |
| 38 | Integration test PASS | PASS | PostgreSQL 54/54 |
| 39 | E2E critical scenarios PASS | PASS | A–H + safety RED + browser flow |
| 40 | Web build PASS | PASS | Expo web export |
| 41 | API build PASS | PASS | tsup ESM build |
| 42 | iOS bundle tidak rusak | PASS | Expo Hermes iOS export |
| 43 | Android bundle tidak rusak | PASS | Expo Hermes Android export |
| 44 | Migration incremental PASS | PASS | 4 migrations, database up to date |
| 45 | Secret scan PASS | PASS | only `.example` placeholders found |
| 46 | Dokumentasi lengkap | PASS | 19 required Phase 5 documents |
| 47 | Tidak ada Phase 6 feature prematur | PASS | recommendations/AI/etc remain Demo/out of scope |

**Result: 47 PASS, 0 FAIL.**

## 27. Rekomendasi Phase 6

Jangan memulai implementasi Phase 6 sebelum review pengguna dan expert-validation plan disetujui. Kandidat prerequisite berikutnya adalah memperoleh food source berlisensi, memvalidasi policy dan allergen copy, menetapkan operational import/monitoring/rollback, menutup warning driver PostgreSQL, lalu menulis scope Phase 6 terpisah. Tidak ada rekomendasi resep, AI/RAG, Pattern Map, Weekly Action, food vision, atau wearable yang diaktifkan oleh delivery ini.
