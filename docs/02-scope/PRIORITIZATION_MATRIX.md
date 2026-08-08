# SARIRA — Prioritization Matrix

**Status:** Phase 0 proposal

## Metode

Gunakan **Safety-adjusted RICE** saat data tersedia:

`Priority = (Reach × Impact × Confidence) / Effort`, lalu terapkan gate.

Gate mengalahkan skor: fitur blocking safety/legal/consent/data harus selesai sebelum fitur engagement. Confidence pada rumus ini adalah confidence perencanaan, bukan Rule Confidence.

## Kategori

| Level | Arti |
|---|---|
| P0 | Release blocker: keselamatan, consent, keputusan, data integrity |
| P1 | Inti value proposition MVP |
| P2 | Mendukung usability/adoption; dapat menyusul dalam MVP slice |
| P3 | Roadmap/post-MVP |

## Matriks Capability

| Capability | Nilai | Risiko bila absen | Effort | Prioritas | Catatan |
|---|---:|---:|---:|---:|---|
| Safety screening + override + referral | Sangat tinggi | Kritis | Tinggi | P0 | Sebelum program |
| Consent/privacy/minor governance | Sangat tinggi | Kritis | Tinggi | P0 | Remaja feature-gated |
| Versioned expert system + audit trace | Sangat tinggi | Kritis | Tinggi | P0 | Pemilik keputusan |
| Data sufficiency + no-conclusion | Sangat tinggi | Tinggi | Sedang | P0 | Cegah false certainty |
| Baseline log + correction + provenance | Sangat tinggi | Tinggi | Tinggi | P0 | Fondasi data |
| AI decision boundary + deterministic fallback | Tinggi | Kritis | Sedang | P0 | AI tidak boleh override |
| Pattern Map + confidence separation | Sangat tinggi | Tinggi | Sedang | P1 | Value proposition |
| Weekly Action + alternatives + review | Sangat tinggi | Sedang | Sedang | P1 | Value loop |
| Approved KB + citation card | Tinggi | Tinggi | Tinggi | P1 | Evidence Supports |
| Adult Weight Balance slice | Tinggi | Sedang | Tinggi | P1 | Kandidat peluncuran awal |
| Guided Meal | Tinggi | Sedang | Tinggi | P1 | Butuh content/data |
| Flex Kitchen | Tinggi | Sedang | Tinggi | P1 | Kalkulasi kompleks |
| HealthKit/Health Connect | Sedang | Rendah (ada manual) | Tinggi | P2 | Sequencing perlu validasi |
| Teen Growth | Tinggi | Kritis jika lemah | Sangat tinggi | P1 gated | Consent/safety dulu |
| Healthy Aging | Tinggi | Tinggi | Sangat tinggi | P1 gated | Accessibility/falls |
| Family Growth | Tinggi | Kritis jika lemah | Sangat tinggi | P1 gated | Child measurement |
| Digestive Support | Sedang | Kritis jika lemah | Tinggi | P1 gated | Red flags dulu |
| Notifikasi adaptif | Sedang | Rendah | Sedang | P2 | Hindari pressure |
| Vendor wearable langsung | Rendah awal | Rendah | Tinggi | P3 | Roadmap |
| Full community | Tidak inti | Moderation risk | Sangat tinggi | P3 | Roadmap |
| Commerce makanan | Tidak inti MVP | Scope/regulatory | Sangat tinggi | P3 | Roadmap terpisah |
| Advanced ML | Belum terbukti | Black-box risk | Sangat tinggi | P3 | Setelah baseline stabil |

## Decision Rule

- Item P0 tidak dapat dipotong untuk mengejar tanggal; scope program yang dikurangi.
- Program gated boleh berada dalam “MVP product scope” tetapi tidak aktif pada release pertama.
- Jika reviewer, dataset, atau referral content belum siap, program tetap nonaktif.
- P2 dapat naik hanya bila riset menunjukkan hambatan utama terhadap baseline/action.

## Hal yang Perlu Divalidasi

Reach per segmen, business objective, kapasitas reviewer, effort engineering, licensing cost, target platform, dan program pertama. Setelah data tersedia, matriks harus diberi skor numerik dan owner.

