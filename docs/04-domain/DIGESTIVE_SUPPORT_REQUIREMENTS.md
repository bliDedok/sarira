# SARIRA — Digestive Support Requirements

**Status:** Phase 0 product baseline; symptom/red-flag taxonomy pending expert review

## Tujuan

Memungkinkan pengguna mencatat keluhan pencernaan, menghubungkan waktunya dengan makanan sebagai pola temporal, memperoleh edukasi umum, dan menerima referral bila rule mendeteksi red flag—tanpa diagnosis.

## Aktor

Pengguna eligible, wali/pendamping sesuai permission, reviewer medis/gizi, admin terbatas.

## Prasyarat

Consent, usia/peran, safety screening, vocabulary gejala dan severity scale yang disetujui, Digestive Support Rule Pack dan referral content aktif.

## Alur Utama

Log makanan/waktu → log keluhan/waktu/severity/duration/context → safety rule segera → baseline/pola temporal berulang → neutral Pattern Map → edukasi/logging action atau referral.

## Alur Alternatif

- Red flag pada satu log: referral segera; jangan menunggu H7/H14.
- Data terlalu sedikit: tampilkan insufficient, bukan dugaan trigger food.
- Makanan kompleks/ingredient unknown: tampilkan hubungan ke meal event, jangan menebak bahan penyebab.
- Keluhan membaik/memburuk: review rule; tidak menutup referral tanpa criteria.
- Minor: consent/safety dan wali visibility policy berlaku.

## Business Rules

- DIG-BR-001: temporal association tidak dinarasikan sebagai causation.
- DIG-BR-002: sistem tidak memberi label penyakit, intoleransi, alergi, IBS, GERD, atau diagnosis lain.
- DIG-BR-003: elimination/restrictive diet tidak diberikan tanpa rule dan expert governance; diagnosis/treatment tetap out of scope.
- DIG-BR-004: red flag dievaluasi pada entry, edit, dan review—tidak menunggu baseline.
- DIG-BR-005: pola mencantumkan jumlah observasi, jendela waktu, missing data, dan limitations.
- DIG-BR-006: user text tidak langsung menjadi rule input tanpa normalization/confirmation yang disetujui.

## Safety Rules

Daftar gejala, severity, durasi, kombinasi, usia, dan contextual red/yellow triggers harus disusun reviewer klinis. Red output menggunakan approved referral wording; AI tidak menambah self-treatment.

## Data yang Diperlukan

Meal time/food/ingredients bila diketahui; complaint category; onset/time, duration, frequency, severity scale, associated user-reported signs, medication/supplement logging hanya jika scope/privacy disetujui (tanpa dosis recommendation), age, relevant context, data source, safety answers.

## Output Sistem

Timeline dan frequency; association language (“tercatat setelah/di sekitar”); data/rule/evidence confidence; limitation; approved education; next logging step/action; referral.

## Error States

Unknown onset, free-text unclassified, timezone mismatch, duplicate symptom, edited meal, incomplete red-flag answers, rule unavailable, dan uncertain severity. Unknown safety tidak menjadi hijau.

## Acceptance Criteria

- Red flag path dipicu segera dan tidak dapat ditunda baseline.
- Pattern text tidak menyatakan sebab atau diagnosis.
- Insufficient data jelas menunjukkan observasi yang kurang.
- Editing meal/symptom mengevaluasi ulang pattern/safety.
- AI failure tidak menghilangkan referral.

## Risiko

Delayed care, over-restriction, anxiety, misattributed food, missing red flag, unstructured text ambiguity, dan privacy of symptom data.

## Hal yang Perlu Divalidasi

Symptom taxonomy, severity scale, temporal windows, minimum observations, red/yellow flags, eligible ages, action/education library, medication log scope, referral levels, dan clinical reviewers.

