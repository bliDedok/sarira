# SARIRA — MVP Scope

**Status:** proposed MVP baseline; urutan peluncuran masih open decision

## Tujuan MVP

Menguji apakah pengguna dapat mengumpulkan baseline yang memadai, memahami Pattern Map yang aman dan dapat ditelusuri, lalu menjalankan satu Weekly Action—tanpa diagnosis, transaksi makanan, atau AI sebagai pengambil keputusan.

## Must-have Capability

### 1. Trust and Access

- Account access, role/profile model, privacy consent, consent wali 12–17.
- Permission center, manual fallback, correction/export/delete request.
- Non-diagnosis disclosure yang kontekstual.

### 2. Safety and Eligibility

- Safety screening awal dan re-screen dari data baru.
- Green/yellow/red routing, program restriction, referral content.
- Rule/version trace dan deterministic fallback.

### 3. Observation and Baseline

- Starter Journey dan log untuk seluruh kategori baseline yang relevan.
- Source/provenance, unit, timestamp, edit history, missing/unknown.
- Early Pattern H7, Pattern Map H14, dan insufficient-data result.

### 4. Decision and Explanation

- Enam rule pack: Teen Growth, Adult Weight Balance, Healthy Aging, Family Growth, Digestive Support, Nutrition Recommendation.
- Satu pola prioritas, pola pendukung, tiga confidence terpisah.
- Satu Weekly Action, approved alternatives, weekly evaluation/adaptation.
- Explanation AI yang constrained + fallback template; approved citations only.

### 5. Programs

- Weight Balance (turun/naik/maintain/kebiasaan).
- Growth Path remaja serta redirect fungsi/postur untuk dewasa.
- Family Growth logging/trend/education/referral.
- Healthy Aging.
- Digestive Support logging/temporal pattern/red flags/referral.

### 6. Food

- Guided Meal dengan resep terverifikasi dan swap setara.
- Flex Kitchen dengan perhitungan database/formula, per porsi, indikator, allergen/pantangan, alternatif, resep pribadi.
- Indikator: energi, protein, karbohidrat, lemak, serat, cairan, gula, natrium, lemak jenuh, keragaman—hanya jika formula/target approved.

### 7. Integration and Operations

- HealthKit dan Health Connect untuk langkah, jarak, active minutes, workout, tidur; exact MVP sequencing perlu feasibility validation.
- Curated knowledge base, review workflow, citation card.
- Admin/reviewer access separation, audit, monitoring, rollback.

## Explicit Non-goals MVP

Tidak ada ordering, payment, delivery, marketplace, restaurant dashboard, diagnosis, obat, dosis suplemen, body scan, real-time professional consultation, full community, corporate wellness, advanced ML personalization, atau direct integration dengan banyak wearable vendor.

## MVP Release Gate

| Gate | Bukti yang diperlukan |
|---|---|
| Clinical/content | rule pack + source + owner + reviewer + tests + expiry/review date |
| Safety | red/yellow scenarios, referral copy, emergency localization, fail-safe test |
| Privacy/legal | consent minor, purpose map, retention, rights workflow, vendor review |
| Trust | decision trace, confidence comprehension, AI fidelity evaluation |
| Data | licensed/approved food dataset, units, provenance, deduplication |
| Usability/accessibility | tests across teen/wali/adult/lansia/family and WCAG target |
| Operations | incidents, alerting, rollback, evidence withdrawal, support playbooks |

## Slice yang Disarankan untuk Mengurangi Risiko

MVP adalah scope produk, bukan keharusan merilis semua program serentak. Urutan candidate:

1. Core platform + Adult Weight Balance + manual input + limited approved nutrition.
2. Guided Meal/Flex Kitchen + integrasi platform health.
3. Teen Growth setelah consent/safety validation.
4. Healthy Aging setelah fall-risk/function validation.
5. Family Growth setelah age standards/measurement/referral validation.
6. Digestive Support setelah red flag governance validation.

Urutan final diputuskan di Phase 1 discovery; fitur belum boleh disebut siap hanya karena tercantum dalam MVP.

## Exit Criteria MVP Learning

- ≥ target pengguna (belum ditetapkan) menyelesaikan baseline tanpa pola bahaya pencatatan.
- Pengguna dapat membedakan data/rule/evidence confidence.
- Weekly Action dinilai dapat dilakukan dan alasannya dipahami.
- Safety path dan referral bekerja dalam usability simulation.
- Tidak ada evidence of AI changing/adding decision fields.
- Clinical/product team dapat mereproduksi sample decision dari audit trace.

## Risiko Scope

Cakupan lima program dan tiga kelompok sensitif terlalu besar untuk satu rilis aman. Mitigasi yang dikunci: shared platform boleh dibangun sekali, tetapi aktivasi program harus feature-gated per rule pack dan release gate.

