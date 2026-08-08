# SARIRA — Phase 0 Final Report

**Versi:** 0.1 · **Tanggal:** 5 Agustus 2026 · **Status:** siap diperiksa pemilik produk

## Ringkasan Eksekutif

Draft konsep SARIRA telah diaudit dan diubah menjadi 31 dokumen kebutuhan produk plus indeks. Tujuan utama tidak diubah. Paket mengunci batas keputusan expert system, peran AI, consent remaja, jalur safety, baseline 14 hari, dua mode makanan, non-diagnosis, dan scope MVP/roadmap. Semua area yang belum memiliki dasar klinis, legal, data, atau bisnis dipisahkan sebagai asumsi atau keputusan terbuka.

SARIRA **siap masuk Phase 1 secara kondisional setelah dokumen ini disetujui**. Phase 1 tidak boleh dimulai otomatis; 20 keputusan blocking telah dicatat dan program pertama harus dipilih sebelum architecture/build.

## 1. Dokumen yang Dibuat

Paket `docs/` berisi:

- 4 dokumen product: vision, positioning, principles, glossary.
- 7 dokumen requirements: PRD, functional/non-functional, roles, journey, flow, IA.
- 4 dokumen scope: MVP, out-of-scope, roadmap, prioritization.
- 5 dokumen safety: expert/safety rules, AI, privacy, consent, referral.
- 7 dokumen domain: nutrition, Growth Path, Family Growth, Healthy Aging, Digestive, wearable, knowledge base/RAG.
- 4 dokumen quality: acceptance criteria, risks, validation, open decisions.
- 1 indeks yang menjelaskan urutan review dan source of truth.

## 2. Keputusan Produk yang Dikunci

1. **Rules Decide, Evidence Supports, AI Explains.** Expert system adalah pemilik semua keputusan; AI hanya menjelaskan payload yang immutable.
2. Safety merah mengalahkan seluruh recommendation/engagement; missing safety data menghasilkan `unknown`, bukan hijau.
3. Pengguna 12–17 wajib memiliki consent wali aktif plus assent ramah usia.
4. Baseline tetap 14 hari: H7 Early Pattern/checkpoint dan H14 Pattern Map + action pertama, dengan hasil `insufficient_data` yang sah.
5. Satu Weekly Action utama per siklus untuk menjaga fokus dan explainability.
6. Growth Path tidak menjanjikan tinggi; pengguna dewasa diarahkan ke fungsi/postur/mobilitas/tulang.
7. Family Growth tidak mendiagnosis stunting dari satu pengukuran, foto, atau kuesioner.
8. Nutrisi hanya dihitung database/formula/rule berversi; indikator dibedakan sebagai minimum/range/maximum.
9. RAG hanya memakai source approved; no scraping/unofficial API; citation dapat ditelusuri.
10. Wearable bersifat permission-based dan memiliki manual fallback; denied/missing bukan zero.
11. Semua program dapat berada dalam product MVP scope, tetapi aktivasi harus feature-gated dan tidak wajib serentak.

## 3. Bagian yang Digabungkan atau Dipisahkan

### Digabungkan

- Weight Balance, Guided Meal, Flex Kitchen, dan indikator nutrisi ditempatkan dalam satu domain contract agar kalkulasi, allergen, target, dan formula tidak terduplikasi.
- Safety screening, program eligibility, data sufficiency, rule evaluation, action, dan referral disusun sebagai satu hierarki expert-system.
- Baseline H1–14, Early Pattern, Pattern Map, Weekly Action, dan weekly adaptation disusun sebagai satu feedback loop.

### Dipisahkan

- Account holder, profile subject, wali/profile manager, pengasuh, pendamping, admin, dan reviewer dipisah untuk least privilege.
- Data Confidence, Rule Confidence, dan Evidence Strength dipisah agar tidak membentuk satu misleading “health score”.
- Expert-system decision, evidence retrieval, dan AI explanation dipisah teknis/produk.
- Planned meal dan actual consumption; missing/denied/zero; raw source dan canonical wearable value dipisah.
- “Masuk MVP scope” dan “aktif pada release pertama” dipisah melalui feature gate.
- Keputusan terkunci, asumsi, roadmap, dan blocking open decisions dipisah eksplisit.

## 4. Fitur MVP

- Akun, role/profile relationship, consent/privacy/minor governance.
- Safety screening dan re-screen; hijau/kuning/merah/unknown; referral.
- Tujuan, profil, program eligibility, Starter Journey.
- Baseline 14 hari, Early Pattern H7, Pattern Map H14, insufficient-data.
- Enam rule pack berversi, trace, tiga confidence, satu Weekly Action, weekly review/adaptation.
- Weight Balance, Growth Path, Family Growth, Healthy Aging, Digestive Support sebagai program feature-gated.
- Guided Meal dan Flex Kitchen tanpa transaksi.
- Curated knowledge base, approved-only RAG, Citation Card.
- HealthKit/Health Connect sebagai target MVP dengan sequencing terbuka; manual fallback wajib.
- Admin/reviewer separation, audit, monitoring, rollback, deterministic AI fallback.

## 5. Fitur Roadmap

- Ordering, payment, delivery, marketplace, restaurant dashboard.
- Direct integration banyak wearable.
- Body scan otomatis.
- Diagnosis, obat, dosis suplemen.
- Konsultasi profesional real-time.
- Full community.
- Corporate wellness.
- Advanced ML personalization.

Program pregnancy/fertility/disease-specific dan pengguna mandiri di luar 12–75 juga bukan scope yang telah didefinisikan.

## 6. Risiko Produk Utama

Risiko tertinggi: keluaran dianggap diagnosis/false reassurance; consent/confidentiality remaja; cakupan lima program terlalu luas; digestive association dianggap sebab; red flag terlewat; AI mutation; formula nutrisi/allergen; growth label dari data lemah; data sensitif salah akses; referral kedaluwarsa.

Risk register memiliki 22 risiko awal dengan likelihood, impact, mitigation, owner candidate, dan trigger. Risiko impact 5 atau score ≥15 menjadi release blocker sampai residual risk diterima oleh owner berwenang.

## 7. Asumsi yang Masih Perlu Validasi

- Peluncuran awal di Indonesia dan Bahasa Indonesia.
- Mobile-first.
- Profil anak di bawah 12 dikelola wali/pengasuh.
- Manual logging cukup untuk baseline.
- Baseline 14 hari dapat diterima pengguna.
- Admin dan reviewer dapat dipisah organisasional.
- Food/recipe dataset berlisensi tersedia.
- AI explanation memberi nilai lebih dibanding template saja.

## 8. Pertanyaan Terbuka

Blocking questions meliputi: release slice pertama; batas usia profil anak; verifikasi usia/wali; privacy remaja; transisi usia 18; daftar red/yellow trigger; threshold data H7/H14; Rule Confidence; formula/target nutrisi; dataset/license; sugar/diversity definitions; menu equivalence; growth standard/cadence; fall-risk tool; digestive taxonomy/windows; referral registry; wearable sequencing; retention/residency/vendor; AI model/privacy; dan success/safeguard metrics.

Tidak ada nilai klinis, formula, red flag list, atau threshold yang dikarang untuk menutup pertanyaan tersebut.

## 9. Kesiapan Masuk Phase 1

**Status: Ready with approval and blockers.** Paket siap menjadi dasar Phase 1 setelah pemilik produk:

1. menyetujui Phase 0 atau memberi revisi;
2. mengonfirmasi yurisdiksi/audiens dan memilih release slice pertama;
3. menunjuk owner Product, Clinical/Safety, Nutrition, Legal/Privacy, Security, Research, Knowledge Governance;
4. memprioritaskan keputusan OD-001 s.d. OD-020;
5. menyetujui bahwa program tetap feature-disabled sampai release gate masing-masing lulus.

Phase 1 sebaiknya dimulai dengan discovery, governance, rule/data specification, legal/privacy/security assessment, dan riset pengguna—bukan langsung production build.

## Rujukan Primer yang Dipakai sebagai Pagar Awal

- [UU RI No. 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- [Permenkes No. 28 Tahun 2019 tentang Angka Kecukupan Gizi](https://peraturan.bpk.go.id/Details/138621/Permenkes-No-28-%20Tahun-2019)
- [WHO Child Growth Standards](https://www.who.int/news-room/questions-and-answers/item/child-growth-standards)
- [Kementerian Kesehatan — Isi Piringku](https://ayosehat.kemkes.go.id/isi-piringku-kebutuhan-gizi-harian-seimbang)
- [Apple HealthKit authorization](https://developer.apple.com/documentation/HealthKit/authorizing-access-to-health-data)
- [Android Health Connect permissions](https://developer.android.com/health-and-fitness/health-connect/ui/permissions)

Rujukan ini belum merupakan knowledge base final. Evidence appraisal, versioning, lisensi, kelompok usia, dan review ahli tetap wajib.
