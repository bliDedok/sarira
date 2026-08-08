# SARIRA — Information Architecture

**Status:** Phase 0 conceptual IA; bukan sitemap UI final

## Tujuan

Mengelompokkan informasi berdasarkan mental model pengguna sekaligus menjaga pemisahan profil, safety, keputusan, evidence, dan operasi.

## Hierarki Pengguna

```text
SARIRA
├── Akses
│   ├── Welcome / Login / Recovery
│   ├── Role & Profile Selection
│   └── Consent Center
├── Today
│   ├── Safety notice (jika ada)
│   ├── Weekly Action
│   ├── Quick Log
│   └── Baseline / weekly progress
├── Log
│   ├── Food & Drink
│   ├── Sleep
│   ├── Activity & Workout
│   ├── Mood / Hunger / Fullness / Barriers
│   ├── Body & Digestive Complaints
│   └── Growth / Illness / Posyandu (profil anak)
├── Patterns
│   ├── Early Pattern
│   ├── Pattern Map
│   ├── Data / Rule / Evidence confidence
│   ├── Why this result
│   └── History
├── Food
│   ├── Guided Meal
│   ├── Flex Kitchen
│   ├── Recipes
│   └── Nutrition Indicators
├── Programs
│   ├── Weight Balance
│   ├── Growth Path / Adult Function
│   ├── Family Growth
│   ├── Healthy Aging
│   └── Digestive Support
├── Learn
│   ├── Approved education
│   └── Citation Cards / sources
└── Settings
    ├── Profile switcher & supporters
    ├── Goals, allergies, preferences
    ├── HealthKit / Health Connect / manual
    ├── Notifications
    ├── Privacy, permissions, export, delete
    └── Help, limitations, referral history
```

## Context Rules

- Header/global context selalu menunjukkan profil aktif; aksi lintas profil membutuhkan konfirmasi.
- Safety notice menempati prioritas visual tertinggi dan tidak disembunyikan oleh tab program.
- “Patterns” memisahkan hasil dari raw logs dan selalu menyertakan provenance.
- “Food” bukan marketplace; tidak ada bahasa cart, order, payment, delivery, merchant, atau promo restoran.
- “Learn” hanya memuat konten approved; konten tidak membuat rekomendasi personal di luar rule.
- Profil anak menggunakan terminologi panjang/tinggi sesuai usia/metode yang ditetapkan domain.

## Model Objek Informasi

| Objek | Relasi utama | Pemilik/otoritas |
|---|---|---|
| Account | memiliki roles, sessions, consent | account holder |
| Profile | dimiliki/dikelola account; memiliki program/log | profile subject/manager |
| Relationship | menghubungkan account dan profile dengan scope | owner/wali |
| Consent Receipt | account/profile/purpose/version | user/wali + governance |
| Observation | profile, time, source, unit, author | user/source |
| Safety Result | observations + safety rule version | expert system |
| Pattern Result | observations + domain rules | expert system |
| Weekly Action | pattern + approved alternative set | expert system/user choice |
| Nutrition Calculation | ingredients + formula + dataset | calculation service |
| Evidence Record | source metadata + status + review | reviewer |
| Explanation | immutable decision payload + citations | AI/template, not authority |
| Audit Event | actor/action/object/reason/time | system governance |

## Navigation States

- **Pre-consent:** akses, consent, help, dan konten publik saja.
- **Safety red:** referral/safety front-and-center; program terkait dibatasi.
- **Baseline:** Today fokus quick log dan coverage, bukan score tubuh.
- **Insufficient:** missing-data guidance dan exit/extend.
- **Active action:** Today fokus action + log minimal.
- **Multiple profiles:** profile switcher jelas, warna bukan satu-satunya pembeda.

## Search dan Discoverability

Search MVP, jika ada, hanya mencari resep/konten approved dan tidak bertindak sebagai chatbot diagnosis. Pencarian gejala harus diarahkan ke safety screening/edukasi dengan disclaimer, atau ditunda sampai governance memadai.

## Error States

Unknown active profile, revoked relationship, stale decision, expired evidence, unavailable integration, conflicting observation, dan deleted profile masing-masing memiliki state eksplisit; tidak boleh diam-diam berpindah profil atau memakai cache lama.

## Hal yang Perlu Divalidasi

Model navigasi mobile/web, jumlah profil yang wajar, kebutuhan pencarian, visibilitas riwayat referral, pemisahan privacy remaja/wali, dan apakah program perlu menjadi entry point utama atau atribut profil.

