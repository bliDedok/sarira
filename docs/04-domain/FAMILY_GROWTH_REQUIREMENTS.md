# SARIRA — Family Growth Requirements

**Status:** Phase 0 baseline; age range and growth protocol are blocking decisions

## Tujuan

Membantu orang tua/pengasuh mencatat dan memahami tren pertumbuhan serta kebiasaan anak, memberi edukasi, dan mengarahkan referral—tanpa diagnosis stunting otomatis.

## Aktor

Orang tua/wali sebagai profile manager; pengasuh sebagai delegated logger; anak sebagai profile subject; reviewer; admin terbatas.

## Prasyarat

Relationship/authority terverifikasi, consent/notice sesuai usia, rentang usia anak diputuskan, standard pertumbuhan berversi, measurement protocol, serta referral rules approved.

## Alur Utama

Buat profil anak → catat usia/date, panjang/tinggi, berat, metode/sumber → log makanan dan keragaman → catat sakit/Posyandu → tampilkan timeline/trend dan data quality → education/re-measure/referral sesuai rule.

## Alur Alternatif

- Satu pengukuran: simpan dan ajarkan pengukuran; tidak diagnosis.
- Pengukuran berbeda pengasuh/alat: tandai conflict dan prioritaskan measurement policy.
- Posyandu record/foto dokumen: input manual terstruktur; OCR/body-photo inference tidak termasuk MVP.
- Red/yellow trigger: referral; recommendation terkait dibatasi.
- Profil melewati batas umur: transisi ke Teen/adult flow sesuai aturan.

## Business Rules

- FAM-BR-001: stunting tidak didiagnosis dari satu pengukuran, foto, atau kuesioner.
- FAM-BR-002: hasil selalu menyebut standard/version, indikator, data points, dan measurement limitation.
- FAM-BR-003: trend memerlukan aturan minimum yang ditinjau ahli; jumlah measurement tidak diinventarisasi Phase 0.
- FAM-BR-004: catatan sakit adalah riwayat pengguna, bukan diagnosis.
- FAM-BR-005: Posyandu visit direkam sebagai event, bukan endorsement/clinical interpretation otomatis.
- FAM-BR-006: setiap entry menampilkan author/source; wali dapat koreksi tanpa menghapus provenance.
- FAM-BR-007: edukasi dan referral harus sesuai usia.

## Safety Rules

Measurement/health red flags, feeding concern, recurrent illness pattern, dan urgent symptom classes harus ditentukan ahli. Rule hanya memicu remeasure/referral, tidak menetapkan penyakit. Status hijau tidak menjamin pertumbuhan sehat.

## Data yang Diperlukan

Age/date-of-birth; required standard attributes; length/height and weight with unit/date/technique/posture/device/source; meal/food groups; illness dates/symptoms user-reported; Posyandu date/measurements/follow-up; caregiver; consent/relationship; safety responses.

## Output Sistem

Timeline, trend/pattern, data-quality flags, standard/version, confidence, missing inputs, measurement guidance, approved education, referral card, citation.

## Error States

Unknown exact age, length vs height mismatch, impossible unit/range, duplicate visit, standard unavailable, sex/reference input missing, conflicting entries, revoked caregiver, dan stale referral registry.

## Acceptance Criteria

- Single measurement/photo/questionnaire tidak menghasilkan diagnosis stunting.
- Setiap graph/indicator menyebut standard dan limitation.
- Wrong-unit dan technique conflict tidak masuk decision diam-diam.
- Pengasuh hanya dapat aksi yang didelegasikan.
- Referral tetap tersedia tanpa AI.

## Risiko

False alarm/reassurance, parental anxiety, measurement misuse, child privacy, unlicensed standard implementation, delayed care, dan pressure feeding.

## Hal yang Perlu Divalidasi

Rentang usia profil anak; standard Indonesia/WHO dan cutoffs; required attributes; cadence dan number of measures; terminology yang tidak diagnostik; Posyandu integration/manual scope; consent; caregiver conflict; referral network.

## Rujukan Awal

WHO menjelaskan standar 0–5 dan referensi 5–19 secara berbeda pada [Child Growth Standards Q&A](https://www.who.int/news-room/questions-and-answers/item/child-growth-standards), dan menekankan pentingnya pengukuran yang benar pada [10 Steps to Successful Growth Assessment](https://www.who.int/publications/m/item/10-steps-to-successful-growth-assessment-and-counselling). Ini menjadi kandidat evidence, bukan rule final SARIRA.

