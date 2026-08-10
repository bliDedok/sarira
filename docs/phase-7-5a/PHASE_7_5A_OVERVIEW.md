# Phase 7.5A — Mobile Foundation + Age Migration

Tanggal penyelesaian lokal: 2026-08-10
Branch: `feature/phase7-5-mobile-ux`
Base specification: `ce044b5f37fd4ec13b7d4ca899f30205c325b380`

## Tujuan

Phase 7.5A membentuk fondasi mobile yang dapat dipakai ulang dan mengganti kewajiban tanggal lahir untuk profil baru dengan usia yang dinyatakan pengguna. Phase ini adalah refactor fondasi dan privasi, bukan redesign produk penuh.

## Hasil utama

- Safe-area shell, keyboard-aware scroll, sticky action, dan navigasi bawah yang tidak menimpa konten.
- Skala typography dan spacing mobile berbasis token.
- `MobileScreen`, `KeyboardAwareScreen`, `ScrollableScreen`, `FormScreen`, `StickyActionArea`, `AppHeader`, `MobileCard`, `Section`, dan `BottomSafeSpacer`.
- `AgePicker`, `WeightPicker`, `HeightPicker`, `TimePicker`, `SelectionCard`, `MultiSelectionCard`, dan `ConsentCard`.
- Onboarding yang menggunakan declared age 12–75 tanpa membuat DOB sintetis.
- Resolver usia tunggal dengan prioritas declared age dan fallback DOB legacy.
- Dua migrasi PostgreSQL incremental, backup sebelum migrasi, dan kompatibilitas Phase 3–7.

## Prinsip implementasi

1. Mobile-first, single-column, dan tetap aman pada tablet/desktop.
2. Data lama tetap dapat dibaca; kolom DOB tidak dihapus.
3. Declared age tidak bertambah otomatis tanpa konfirmasi pengguna.
4. Makna state tidak hanya dibedakan dengan warna.
5. Underlying audit/legal semantics dipertahankan.
6. Technical metadata tidak ditampilkan pada layar normal yang disentuh phase ini.

## Tidak dikerjakan

Guest Explore, auth soft gate, Program Creation V2, Dashboard V2, Program Hari Ini, Food UX V2, Guided Meal/Flex Kitchen redesign, Motion Coach, gamification, Unsplash, Pattern Map/Weekly Action redesign, AI, RAG, CV/pose detection, Phase 7.5B–7.5E, dan Phase 8 tidak dikerjakan.

## Dokumen terkait

- `MOBILE_FOUNDATION.md`
- `AGE_MIGRATION.md`
- `AGE_RESOLVER.md`
- `STRUCTURED_INPUTS.md`
- `CONSENT_MOBILE_UX.md`
- `RESPONSIVE_QA.md`
- `ACCESSIBILITY_QA.md`
- `DATABASE_CHANGES.md`
- `TEST_SCENARIOS.md`
- `PHASE_7_5A_FINAL_REPORT.md`
