# Phase 4 Overview

**Milestone:** SARIRA 0.4.0 · **Scope:** Starter Journey, baseline 14 hari, daily tracking, completeness, Day 7, dan Day 14 readiness.

Phase 4 mengubah pencatatan kebiasaan dasar dari prototype menjadi alur nyata yang tersimpan. Onboarding Phase 3 tetap menjadi gerbang. Setelah onboarding lengkap, pengguna melihat Starter Journey berbasis profile, age group, selected goal, safety result, dan program preference yang nyata; baseline tidak dibuat sampai pengguna menekan tombol mulai.

## Hasil utama

- Satu baseline aktif per profile, berjalan menurut tanggal kalender pada timezone yang dipin saat mulai.
- Check-in, makanan, tidur, aktivitas, langkah, pengukuran tubuh, dan keluhan pencernaan tersimpan melalui API v1.
- Tugas harian dan kelengkapan data dihitung backend, bukan angka mock atau health score.
- Perjalanan 14 hari membedakan lengkap, sebagian, kosong, hari ini, dan belum datang dengan ikon serta teks.
- Day 7 memberi statistik deskriptif dan feedback UX; Day 14 memberi readiness tanpa membuat Pattern Map.
- Riwayat dapat dikoreksi selama baseline belum `COMPLETED` atau `CANCELLED`.

## Prinsip dan batas

`Rules Decide, Evidence Supports, AI Explains` tetap menjadi arah arsitektur, tetapi Phase 4 hanya memiliki rule kelengkapan teknis. Threshold berstatus `REQUIRES_PRODUCT_EXPERT_VALIDATION` dan bukan threshold klinis.

Phase 4 tidak mengimplementasikan Nutrition Engine, final Pattern Map, Weekly Action decision engine, AI/RAG, citation retrieval production, food recognition, barcode, wearable sync, HealthKit/Health Connect, Motion Coach, growth/family analysis, atau diagnosis pencernaan. Bagian tersebut tetap diberi label **Demo** pada UI.

## Komponen utama

- `@sarira/baseline`: clock, kalender lokal, kelengkapan, readiness, dan konfigurasi.
- Prisma/PostgreSQL: agregat baseline serta semua log, task, snapshot, checkpoint, dan readiness.
- API: service precondition/ownership/consent dan repository memory/Prisma dengan kontrak yang sama.
- Expo Router: Starter Journey, Home nyata, formulir tracking, kalender baseline, Day 7, dan progres.

Lihat dokumen lain di folder ini untuk kontrak, lifecycle, migration, testing, dan batas produksi.
