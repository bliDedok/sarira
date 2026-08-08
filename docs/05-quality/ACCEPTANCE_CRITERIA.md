# SARIRA — Acceptance Criteria

**Status:** Phase 0 cross-product criteria; domain numeric fixtures pending expert approval

## Tujuan

Menetapkan skenario perilaku yang harus dipenuhi sebelum capability dinyatakan siap. Format: Given/When/Then. Phase 1 harus menurunkan setiap skenario menjadi test cases dan traceability matrix.

## Account, Role, Consent

### AC-AUTH-001 — Profil minor terkunci

**Given** profile subject berusia 12–17 dan consent wali belum aktif, **when** pengguna membuka baseline/program, **then** sistem menolak rekomendasi personal, menyimpan progres aman, dan menjelaskan cara consent tanpa membocorkan data.

### AC-CONS-001 — Consent dapat dibuktikan

**Given** consent selesai, **when** receipt diaudit, **then** actor, subject, purpose, version, timestamp, scope, dan affirmative action tersedia.

### AC-CONS-002 — Izin opsional ditolak

**Given** pengguna menolak wearable/notifikasi/analytics, **when** melanjutkan, **then** fitur inti yang tidak bergantung padanya tetap tersedia dan dampak dijelaskan tanpa dark pattern.

### AC-CONS-003 — Permission dicabut

**Given** akses pendamping/wearable aktif, **when** owner mencabut, **then** pemrosesan/akses baru berhenti, semua sesi/cache mengikuti SLO, dan status dapat diverifikasi.

## Safety dan Eligibility

### AC-SAFE-001 — Red override

**Given** input memenuhi red rule tervalidasi, **when** dievaluasi dari onboarding/log/edit/review, **then** status merah dan referral muncul, saran terkait disuppress, dan AI/engagement tidak dapat menurunkannya.

### AC-SAFE-002 — Yellow restriction

**Given** yellow rule terpicu, **when** program dibuka, **then** hanya feature/action yang `allowed` tersedia, alasan dan referral/konsultasi terlihat.

### AC-SAFE-003 — Unknown bukan hijau

**Given** field safety wajib missing/invalid, **when** screening dievaluasi, **then** status unknown/insufficient ditampilkan dan sistem tidak menyatakan hijau.

### AC-SAFE-004 — Re-evaluation

**Given** safety status sebelumnya hijau, **when** log/koreksi baru relevan masuk, **then** safety dihitung ulang sebelum rekomendasi berikutnya.

## Baseline dan Pattern

### AC-BASE-001 — H7 data memadai parsial

**Given** hanya rule A memenuhi data minimum, **when** hari ke-7 tiba, **then** Early Pattern hanya untuk A dan domain lain ditandai insufficient.

### AC-BASE-002 — H14 data tidak cukup

**Given** rule priority tidak memenuhi data minimum, **when** hari ke-14 tiba, **then** tidak ada kesimpulan paksa/Weekly Action dari rule itu; missing-data guidance dan exit/extend tersedia.

### AC-BASE-003 — Koreksi data

**Given** hasil telah terbit, **when** input yang digunakan dikoreksi, **then** hasil lama tetap historis, hasil ditandai terdampak, dan evaluasi ulang memakai versi/input baru.

### AC-PATT-001 — Explainable Pattern Map

**Given** Pattern Map valid, **when** pengguna membuka “Mengapa”, **then** data used/missing, rule/version, safety, tiga confidence, limitation, evidence, dan action dapat dilihat.

### AC-PATT-002 — Satu prioritas

**Given** beberapa rule eligible, **when** resolver berjalan, **then** paling banyak satu pola prioritas/Weekly Action utama diterbitkan dan conflict resolution tercatat.

## Weekly Action

### AC-WKLY-001 — Alternatif setara

**Given** action tidak feasible, **when** pengguna memilih ganti, **then** hanya approved alternatives yang safe/equivalent tampil dan perubahan tercatat.

### AC-WKLY-002 — Evaluasi netral

**Given** action tidak terlaksana, **when** weekly review, **then** sistem menangkap hambatan dan memilih simplify/swap/stop via rule tanpa bahasa gagal/menghukum.

## Nutrition dan Food

### AC-NUTR-001 — Kalkulasi reproducible

**Given** ingredient/quantity/yield/serving yang sama dan versi artefak sama, **when** dihitung ulang, **then** nilai nutrisi identik dan lineage tersedia.

### AC-NUTR-002 — Unknown bukan nol

**Given** ingredient/nutrient tidak ada, **when** resep dihitung, **then** unknown amount ditampilkan, total ditandai tidak lengkap, dan AI tidak mengisi nilai.

### AC-NUTR-003 — Target type

**Given** indikator ditampilkan, **when** pengguna melihatnya, **then** label minimum/range/maximum, unit, periode, sumber target, dan limitation terlihat.

### AC-MEAL-001 — Allergen hard filter

**Given** alergi aktif, **when** menu awal atau swap dicari, **then** kandidat yang mengandung/unknown sesuai policy tidak dapat dipilih.

### AC-FLEX-001 — Per porsi real-time

**Given** resep Flex, **when** quantity/yield/servings berubah, **then** total dan per-porsi diperbarui konsisten dengan formula version.

### AC-FOOD-001 — Tidak ada transaksi

**Given** pengguna memilih menu, **when** aksi lanjutan ditampilkan, **then** tidak ada cart/payment/delivery/merchant transaction.

## Growth, Family, Aging, Digestive

### AC-GROW-001 — Tanpa janji tinggi

**Given** remaja meminta target tinggi, **when** SARIRA merespons, **then** tidak ada prediksi/janji cm dan pengguna diarahkan ke kebiasaan/referral yang diizinkan.

### AC-GROW-002 — Adult redirect

**Given** pengguna ≥18 memilih growth, **when** eligibility berjalan, **then** Teen Growth tidak aktif dan opsi fungsi/postur/mobility/bone health ditawarkan.

### AC-FAM-001 — Single measurement

**Given** hanya satu tinggi/panjang/berat, foto, atau questionnaire, **when** dianalisis, **then** tidak ada diagnosis stunting; tampilkan measurement guidance/insufficient/referral sesuai rule.

### AC-FAM-002 — Standard provenance

**Given** growth indicator/trend tampil, **when** detail dibuka, **then** standard/version, age/reference inputs, measurements, method/source, confidence, dan limitations tersedia.

### AC-AGE-001 — Fall-risk override

**Given** fall/symptom rule kuning/merah, **when** activity action akan diberikan, **then** action dibatasi/dihentikan dan referral menang.

### AC-DIG-001 — Temporal, bukan causal

**Given** keluhan sering tercatat setelah meal, **when** Pattern Map dibuat, **then** wording menyatakan association dengan jumlah observasi/jendela/limitasi dan tidak menyatakan diagnosis/penyebab.

### AC-DIG-002 — Immediate red flag

**Given** red flag tercatat pada hari 2, **when** log disimpan, **then** referral muncul segera dan tidak menunggu hari 7/14.

## Wearable

### AC-WEAR-001 — Permission denied

**Given** HealthKit/Health Connect permission ditolak, **when** activity view dibuka, **then** “tidak diizinkan/tidak tersedia” dibedakan dari nol dan manual fallback tersedia.

### AC-WEAR-002 — Deduplication

**Given** record sama tersinkron ulang atau overlap sesuai fixture, **when** canonical aggregate dihitung, **then** nilai tidak berlipat dan source lineage tersedia.

### AC-WEAR-003 — Revocation

**Given** sync aktif, **when** user pause/revoke, **then** ingestion berhenti dan UI menjelaskan data historis/next step sesuai policy.

## Knowledge, AI, Audit

### AC-RAG-001 — Approved only

**Given** index berisi approved/draft/expired/withdrawn, **when** retrieval berjalan, **then** hanya approved+effective+applicable records dikembalikan.

### AC-RAG-002 — Citation fidelity

**Given** explanation memakai claim, **when** citation dibuka, **then** source/chunk mendukung klaim, metadata wajib lengkap, dan link asli tersedia.

### AC-AI-001 — Decision immutability

**Given** AI menghasilkan angka/status/action berbeda dari payload, **when** validator berjalan, **then** output diblokir dan deterministic fallback ditampilkan.

### AC-AI-002 — AI/RAG unavailable

**Given** AI/RAG gagal, **when** hasil rule valid dibuka, **then** decision/referral tetap tampil dengan template dan limitation, tanpa citation palsu.

### AC-AUD-001 — Reproducibility

**Given** decision ID, **when** reviewer berwenang melakukan replay, **then** input snapshot dan semua versi artefak mereproduksi output keputusan.

## Non-functional Gates

- Accessibility: WCAG 2.2 AA target, status tidak hanya warna, teen/lansia usability.
- Security/privacy: threat model, least privilege, audit, encryption, rights workflows, deletion/withdrawal tested.
- Reliability: fail-safe decision, idempotency, monitoring, rollback.
- Performance candidate: logging feedback p95 ≤1s dan Pattern Map p95 ≤3s; dikonfirmasi Phase 1.
- Content: neutral-language lint/review; source freshness dan link checks.

## Release Exit

Semua P0 dan scope program yang diaktifkan lulus automated/manual tests, expert sign-off, legal/privacy gate, accessibility/usability, incident drills, dan no-open-critical-risk. Kegagalan satu gate berarti program tetap feature-disabled.

