# SARIRA — Growth Path Requirements

**Status:** Phase 0 product baseline; clinical rules pending validation

## Tujuan

Membantu remaja 12–17 membangun pola yang mendukung pertumbuhan sehat melalui makan, protein/keragaman pangan, tidur, aktivitas, kebugaran, postur, dan pemantauan tinggi/berat—tanpa menjanjikan pertambahan tinggi atau mendiagnosis gangguan pertumbuhan.

Untuk usia ≥18, permintaan growth dialihkan ke postur, fleksibilitas, kekuatan inti, mobilitas, dan kesehatan tulang.

## Aktor

Remaja, orang tua/wali, pendamping yang diizinkan, reviewer ahli gizi/ahli terkait.

## Prasyarat

Usia tervalidasi, assent remaja, consent wali aktif, safety screening, tujuan yang tidak berisiko, serta rule pack TG approved.

## Alur Utama

Consent → teen safety/eligibility → profil dan measurement guidance → baseline → H7 early pattern → H14 Pattern Map → satu action → review. Pengukuran tinggi/berat diperlakukan sebagai tren dengan tanggal, alat, metode, dan confidence—not daily score.

## Alur Alternatif

- Consent tidak aktif: simpan onboarding, tidak ada rekomendasi personal.
- Data pengukuran tunggal/meragukan: minta ukur ulang, bukan label.
- Goal tinggi spesifik: jelaskan tidak dapat dijanjikan; arahkan ke kebiasaan pendukung.
- Usia menjadi 18: transisi consent dan adult function path.
- Trigger kuning/merah: batasi program dan referral.

## Business Rules

- GROW-BR-001: tidak ada estimasi centimeter, target tinggi, atau predicted adult height sebagai janji.
- GROW-BR-002: faktor perilaku tidak dinarasikan sebagai satu-satunya penyebab tinggi.
- GROW-BR-003: prioritas dipilih dari pola yang dapat ditindak, bukan penilaian bentuk tubuh.
- GROW-BR-004: tinggi/berat, tidur, makan, dan aktivitas memiliki rule data minimum terpisah.
- GROW-BR-005: komunikasi dengan wali menghormati permission/confidentiality yang akan ditetapkan.
- GROW-BR-006: adult redirect tidak menggunakan Teen Growth rules.

## Safety Rules

Rule pack harus mencakup trigger yang divalidasi untuk pengukuran tidak masuk akal, tren yang memerlukan penilaian, gejala/keluhan, perilaku makan/target berat berisiko, latihan berlebihan, dan distress. SARIRA hanya menyatakan alasan referral, bukan diagnosis.

## Data yang Diperlukan

Usia/tanggal lahir, consent; tinggi/berat + date/unit/method/device/source; makan/protein/keragaman; tidur; aktivitas/workout; postur/keluhan; mood/hambatan; riwayat relevan yang aman diminta; program/safety state. Exact sex/biological reference fields ditentukan reviewer dan privacy review.

## Output Sistem

Trend/measurement quality; priority/supporting pattern; tiga confidence; Weekly Action; non-promise disclaimer; citation card; remeasure/referral instruction jika perlu.

## Error States

Wrong unit, implausible value, device inconsistency, measurement too frequent, consent revoked, transition age, missing reference input, conflicting caregiver entries, dan rule version unavailable.

## Acceptance Criteria

- Tidak ada copy yang menjanjikan tinggi tertentu.
- Satu data point tidak menghasilkan label gangguan pertumbuhan.
- Adult request diarahkan ke functional path.
- Minor guard tidak dapat dilewati.
- Pengguna dapat melihat metode/tanggal pengukuran dan keterbatasan.
- Safety simulation mengalahkan action/program.

## Risiko

Body image/eating harm, parental pressure, measurement error, reference misuse, confidentiality conflict, dan pengguna menunda pemeriksaan karena status hijau.

## Hal yang Perlu Divalidasi

Measurement cadence/protocol, age/reference standard, exact safety triggers, nutrition/sleep/activity action library, guardian visibility, transition at 18, professional reviewers, dan inclusion/exclusion criteria.

## Rujukan Awal

[WHO Child Growth Standards](https://www.who.int/news-room/questions-and-answers/item/child-growth-standards) membedakan standar 0–5 dan referensi 5–19; penerapan SARIRA tetap harus dipilih bersama pedoman Indonesia dan reviewer ahli.

