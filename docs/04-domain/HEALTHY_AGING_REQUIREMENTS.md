# SARIRA — Healthy Aging Requirements

**Status:** Phase 0 product baseline; geriatric/functional rules pending validation

## Tujuan

Membantu pengguna 60–75 menjaga keteraturan makan, kekuatan, fungsi otot, mobilitas, keseimbangan, aktivitas, tidur, dan kewaspadaan risiko jatuh melalui action aman dan referral.

## Aktor

Pengguna Healthy Aging, pendamping/anggota keluarga dengan permission, reviewer ahli terkait, admin terbatas.

## Prasyarat

Consent, safety/eligibility, accessibility settings, supporter permissions jika digunakan, dan Healthy Aging Rule Pack approved.

## Alur Utama

Onboarding sederhana → pilihan pendamping → safety termasuk fall/function questions → baseline makan/tidur/activity/mobility/balance complaints → Pattern Map → satu functional Weekly Action → review/adaptation.

## Alur Alternatif

- Tanpa wearable: manual fallback.
- Memerlukan pendamping: invite granular, bukan account sharing.
- Yellow/red fall/symptom trigger: restriction/referral.
- Kesulitan input: save partial, assisted logging berlabel.
- Target weight loss yang berisiko: alihkan/limit sesuai rule.

## Business Rules

- AGE-BR-001: prioritas fungsi dan keselamatan mengalahkan target estetika/engagement.
- AGE-BR-002: “massa otot” adalah area dukungan/pemantauan, bukan diagnosis sarcopenia.
- AGE-BR-003: action harus memiliki variasi/kontraindikasi yang ditinjau ahli.
- AGE-BR-004: pendamping tidak otomatis mengendalikan profil atau melihat semua data.
- AGE-BR-005: low activity atau missing wearable tidak otomatis berarti tidak aktif.
- AGE-BR-006: konten tidak menyederhanakan risiko jatuh menjadi satu score tanpa limitation.

## Safety Rules

Rule pack wajib memvalidasi classes untuk recent fall, mobility/balance change, concerning symptoms, nutrition/hydration risk, dan exercise contraindication. SARIRA tidak memberi diagnosis atau latihan rehabilitasi klinis.

## Data yang Diperlukan

Usia, goal, makan/frequency/protein diversity/cairan, activity/workout/source, sleep, self-reported function/mobility/balance/falls, complaints, assistive/support context, barriers, safety responses, consent.

## Output Sistem

Priority/supporting pattern; functional action; safe alternative; source data; confidence; accessible explanation; limitation; referral.

## Error States

Conflicting supporter input, unknown fall recency, inaccessible action format, wearable gaps, implausible activity, permission revoked, dan rule contraindication conflict.

## Acceptance Criteria

- UI memenuhi accessibility target dan diuji pengguna/pendamping.
- Fall/red trigger mengalahkan activity action.
- Manual data tidak dianggap lebih rendah tanpa dasar.
- Pendamping entry memiliki author provenance.
- Tidak ada diagnosis sarcopenia/fall disorder.

## Risiko

Jatuh akibat action yang tidak tepat, undernutrition, overexertion, ageist copy, coercive family access, sensory/motor barriers, dan false reassurance.

## Hal yang Perlu Divalidasi

Fall screening tool/license, functional measures, safe action library, target nutrisi/cairan, accessibility research, supporter governance, age ceiling 75, dan professional referral routes.

