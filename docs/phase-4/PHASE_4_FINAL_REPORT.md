# Phase 4 Final Report

**Versi:** 0.4.0

**Tanggal verifikasi:** 8 Agustus 2026

**Branch:** `feature/phase4-baseline-tracking`

**Status:** **PASS — siap untuk review Phase 4; Phase 5 belum dimulai**

## 1. Ringkasan implementasi

Phase 4 mengubah alur setelah onboarding menjadi Starter Journey dan baseline kalender lokal 14 hari yang memakai data nyata. Daily check-in, makanan, tidur, aktivitas, langkah manual, pengukuran tubuh opsional, keluhan pencernaan, tugas harian, completeness, perjalanan per hari, Day-7 checkpoint, dan Day-14 readiness kini terhubung dari UI ke API dan PostgreSQL. Seluruh hasil analisis lanjutan tetap dipisahkan sebagai Demo.

## 2. Fitur real baru

- Starter Journey berbasis profile, age group, goal, safety status, dan program preference.
- Baseline create/resume, local-day lifecycle, missed-day handling, extension foundation, dan explicit completion.
- Daily check-in dengan draft/retry lokal; meal/sleep/activity/steps/body/digestive history.
- Daily task, daily/overall completeness, perjalanan 14 hari, detail/edit histori.
- Day-7 checkpoint dan feedback; Day-14 READY/PARTIALLY_READY/INSUFFICIENT_DATA.
- Consent enforcement, profile ownership, minimal audit metadata, real API client, dan database seed.

## 3. Fitur yang masih mock

Pattern Map final, Weekly Action decision engine, Nutrition Engine, kalori/makro production, Guided Meal/Flex Kitchen recommendation, AI/LLM/RAG/citation retrieval, foto/barcode makanan, wearable/HealthKit/Health Connect, Motion Coach vision, growth/family growth analysis, dan digestive diagnosis. UI memberi badge **Demo** dan tidak mencampurnya dengan nilai tracking nyata.

## 4. Baseline lifecycle

Baseline hanya dapat dimulai setelah authentication, onboarding lengkap, profile valid, goal, safety screening, dan required consent terpenuhi. Satu profile hanya memiliki satu baseline terbuka. Status bergerak melalui ACTIVE, DAY_7_REVIEW_AVAILABLE, DAY_14_REVIEW_AVAILABLE atau DATA_INSUFFICIENT, lalu COMPLETED hanya melalui aksi eksplisit saat readiness READY. Missed day tetap berada di kalender dan tidak menggeser timeline.

## 5. Database entities baru

Lima belas entitas ditambahkan: `BaselineSession`, `DailyRecord`, `DailyCheckIn`, `MealLog`, `SleepLog`, `ActivityLog`, `StepRecord`, `BodyMeasurement`, `DigestiveLog`, `DailyTaskDefinition`, `DailyTaskInstance`, `DataCompletenessSnapshot`, `Day7Checkpoint`, `Day7Feedback`, dan `BaselineReadinessResult`. Foreign key, cascade child, indexes, range checks, unique per hari/resource, dan partial unique active-baseline index telah diterapkan.

## 6. Migration

Migration incremental berada di `prisma/migrations/20260808104126_phase4_baseline_tracking/migration.sql`. Sebelum aplikasi migration, backup development dibuat di `/private/tmp/sarira_phase3_pre_phase4.dump`. Tidak ada reset, drop schema, atau penghapusan data Phase 3. Prisma melaporkan tiga migration up to date. Rollback menggunakan restore ke target terpisah atau forward-repair yang direview, bukan down migration destruktif.

## 7. API endpoint

API `/api/v1` mencakup starter journey; baseline create/current/detail/complete/readiness/days; check-in; CRUD meal/sleep/activity/digestive; manual steps; body measurement; tasks; daily/overall completeness; Day-7 checkpoint dan feedback. Semua route menggunakan bearer auth, schema validation, response envelope yang konsisten, owner scoping, dan safe error. Daftar lengkap ada di `API_ENDPOINTS.md`.

## 8. Completeness algorithm

Empat domain wajib—check-in, food, sleep, activity—masing-masing berbobot 25%. Daily score adalah jumlah domain tersedia; overall score adalah rata-rata coverage domain terhadap hari kalender yang sudah berlalu, dibatasi 14 hari. COMPLETE/PARTIAL/MISSING hanya menggambarkan ketersediaan data. Configuration `phase4-dev-v1` memakai READY ≥75%, PARTIALLY_READY ≥55%, dan minimum coverage tiap domain wajib 60%, seluruhnya berlabel `REQUIRES_PRODUCT_EXPERT_VALIDATION`.

## 9. Day-7 behavior

Mulai Day 7, endpoint dan layar checkpoint menampilkan hari teramati, hari dengan data, coverage setiap domain, data yang sering kosong, observasi deskriptif, serta disclaimer bukan diagnosis. Feedback ease rating, bagian tersulit, keinginan melanjutkan, dan catatan disimpan terpisah serta tidak mengubah safety decision.

## 10. Day-14 readiness behavior

Pencapaian kalender dan kesiapan data dipisahkan. Day 14 menghasilkan persisted readiness. READY dapat ditutup eksplisit dan hanya menyatakan data siap masuk analisis fase berikutnya. PARTIALLY_READY/INSUFFICIENT_DATA menjelaskan kekurangan dan mendukung pencatatan sampai extension terkonfigurasi tujuh hari; API menolak completion jika readiness bukan READY. Pattern Map tidak dibuat.

## 11. Timezone strategy

Baseline menyimpan IANA timezone profile saat dimulai. `startLocalDate` dan tanggal lokal sekarang dihitung dari Clock + timezone baseline; day index dihitung dari selisih tanggal kalender, bukan 24 jam sejak `startedAt`. Perubahan timezone profile setelah mulai tidak mengubah histori. Asia/Makassar, Asia/Jakarta, UTC, dan boundary 23:59→00:01 tercakup test.

## 12. Consent behavior

Required consent diperiksa sebelum baseline dimulai. HEALTH_PROFILE melindungi check-in/body/digestive, NUTRITION_DATA melindungi meal, SLEEP_DATA melindungi sleep, dan ACTIVITY_DATA melindungi activity/steps. Setelah consent dicabut, write baru ditolak dengan conflict yang jelas; read dan data lama tidak otomatis dihapus. Retention/deletion legal policy tetap membutuhkan review.

## 13. Authorization

Semua agregat terikat ke `profileId`. Repository dan route mengecek profile milik user aktif; resource milik profile lain menghasilkan 403, sedangkan resource yang benar-benar tidak ada menghasilkan 404. Test dua user membuktikan isolasi baseline.

## 14. Unit test results

**PASS.** User app Jest: 4 suite, 13 test. API/domain tanpa database: 4 suite, 37 test, dengan 1 suite PostgreSQL di-skip sesuai environment. Cakupan termasuk calendar/timezone, missed day, completeness/readiness, sleep cross-midnight, unique active baseline, tasks, consent, ownership, dan routing onboarding.

## 15. Integration test results

**PASS.** PostgreSQL nyata: 5 file, 38 test. Alur memverifikasi onboarding, consent, safety, goal, questionnaire, preference, baseline, empat tracking domain, completeness 100%, persistence, audit, dan pgvector extension. Seed development dijalankan dua kali berturut-turut dengan hasil sukses/idempotent.

## 16. E2E results

**PASS.** Scenario A–J lulus: complete Day 1, partial data, resume, Day 7, Day 14 READY, Day 14 INSUFFICIENT, Makassar boundary, authorization, revoked consent, dan tidur 23:30→06:30 = 420 menit. Completion READY menghasilkan COMPLETED; INSUFFICIENT menghasilkan 409. Browser critical path juga menguji register → onboarding → Starter Journey → baseline → check-in → meal → sleep → activity/steps → 100% completeness → journey/detail.

## 17. Responsive QA

**PASS.** Browser QA pada 390×844, 768×1024, dan 1440×900 tidak menemukan horizontal overflow. Mobile memakai bottom navigation, tablet memakai compact sidebar, desktop memakai full sidebar. Weekly Action Demo badge dan card food history diperbaiki berdasarkan inspeksi visual/DOM. Audit mobile menemukan 21 control terlihat dan tidak ada target di bawah 44×44.

## 18. Accessibility review

**PASS untuk baseline acceptance dasar.** Status perjalanan memakai ikon + label, bukan warna saja; progress dan tombol memiliki accessible label; form error memakai live/alert semantics; control terlihat memiliki nama; navigation dan action berada di tab order; focus state tersedia; tidak ada nested interactive element. Physical VoiceOver, TalkBack, dynamic text pada device, dan keyboard lintas browser tetap staging/device acceptance.

## 19. Build results

**PASS.** `pnpm lint`, `pnpm typecheck`, user Jest, API Vitest, PostgreSQL integration, user web export (51 static routes), admin Next production build, dan API tsup build lulus. Expo export final menghasilkan bundle iOS, Android, dan web. Ini memvalidasi development bundle; signing, native archive, dan physical-device run bukan bagian environment lokal ini.

## 20. Security review

**PASS.** Authentication dan ownership diwajibkan; tidak ada public development-clock endpoint; audit hanya menyimpan metadata minimum dan bukan isi penuh kesehatan; server menghitung sleep duration; validation/range/database constraints aktif; secret scan tracked source tidak menemukan private key/token/credential nyata. Password seed dan database lokal hanya nilai development sintetis.

## 21. Privacy concerns

Data kebiasaan, tubuh, dan pencernaan tetap sensitif. Consent revocation saat ini menghentikan write baru tetapi tidak menghapus data historis. Sebelum production diperlukan keputusan legal/product mengenai retention, export/delete, guardian/dependent access, regional data residency, audit retention, dan incident response. Tidak ada klaim compliance legal final pada Phase 4.

## 22. Development configuration yang perlu validasi

- Weight 25% per required domain.
- READY 75%, PARTIALLY_READY 55%, minimum required domain coverage 60%.
- Target 14 hari dan extension 7 hari.
- Minimum satu record per domain per hari serta wording observasi/checkpoint.
- Daily task content dan safety/content rules yang ditandai expert validation.

Nilai tersebut deterministik dan nyata di sistem, tetapi bukan clinical threshold.

## 23. Technical debt

- Jalankan physical-device QA, VoiceOver/TalkBack, dynamic text, dan keyboard pada browser/device matrix.
- Validasi threshold, task content, dan microcopy bersama product, clinical/domain expert, legal, serta usability study.
- Uji migration/restore dan observability pada staging dengan PostgreSQL managed serta dataset representatif.
- Selesaikan retention/delete/export policy dan dependent-profile access model sebelum production.
- Perbarui pola query test PostgreSQL sebelum `pg@9`; suite saat ini menampilkan satu deprecation warning non-failing.
- Tambahkan pagination bila extension/history berkembang melampaui batas baseline pendek saat ini.

## 24. Daftar commit

- `8c5a8ea` — `feat(baseline): add phase 4 domain and data model`
- `e546443` — `feat(tracking): add baseline APIs and completeness lifecycle`
- `2c57606` — `feat(app): deliver the real 14-day starter journey`
- `8e55a9f` — `fix(phase4): close final journey QA gaps`
- `docs(phase4): document baseline architecture and acceptance` — commit dokumentasi final.

## 25. Acceptance criteria

| # | Acceptance criterion | Result |
|---:|---|:---:|
| 1 | Baseline hanya setelah onboarding | PASS |
| 2 | Session tersimpan di database | PASS |
| 3 | Satu active baseline per profile | PASS |
| 4 | Day index memakai local date/timezone | PASS |
| 5 | Day 1–14 benar | PASS |
| 6 | Missing day tidak mereset baseline | PASS |
| 7 | Daily Check-in real | PASS |
| 8 | Meal logging basic real | PASS |
| 9 | Sleep logging real | PASS |
| 10 | Activity logging real | PASS |
| 11 | Step manual foundation | PASS |
| 12 | Digestive logging basic real | PASS |
| 13 | Daily task real | PASS |
| 14 | Daily completeness di backend | PASS |
| 15 | Overall completeness di backend | PASS |
| 16 | Dashboard memakai baseline real | PASS |
| 17 | Journey 14 hari real | PASS |
| 18 | Day-7 checkpoint real | PASS |
| 19 | Day-7 feedback tersimpan | PASS |
| 20 | Day-14 readiness real | PASS |
| 21 | Data kurang → INSUFFICIENT_DATA | PASS |
| 22 | Pattern Map tidak dibuat prematur | PASS |
| 23 | Resume setelah login | PASS |
| 24 | Consent enforcement | PASS |
| 25 | Profile ownership | PASS |
| 26 | Audit log | PASS |
| 27 | Timezone test | PASS |
| 28 | Cross-midnight sleep test | PASS |
| 29 | Mobile responsive | PASS |
| 30 | Tablet responsive | PASS |
| 31 | Desktop responsive | PASS |
| 32 | Accessibility dasar | PASS |
| 33 | Unit test | PASS |
| 34 | Integration test | PASS |
| 35 | E2E critical path | PASS |
| 36 | Web build | PASS |
| 37 | API build | PASS |
| 38 | iOS development bundle | PASS |
| 39 | Android development bundle | PASS |
| 40 | Dokumentasi Phase 4 lengkap | PASS |

**Hasil akhir: 40 PASS, 0 FAIL.** Caveat native/accessibility device dicatat sebagai acceptance lanjutan, bukan kegagalan bundle atau functional Phase 4.

## 26. Rekomendasi untuk Phase 5

Jangan mulai Phase 5 sebelum review stakeholder atas laporan, UX, migration, consent/privacy, dan configuration Phase 4. Setelah disetujui, susun Phase 5 sebagai milestone terpisah untuk rule/evidence analysis yang tervalidasi dan Pattern Map, tetap menjaga batas **Rules Decide, Evidence Supports, AI Explains**. Tidak ada implementasi Phase 5 dalam branch ini.
