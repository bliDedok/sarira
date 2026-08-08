# SARIRA — Open Decisions, Assumptions, and Locked Decisions

**Status:** decision register as of 5 August 2026

## Locked by the Brief/Phase 0

| ID | Decision |
|---|---|
| D-001 | Nama SARIRA dan tagline “Kenali Polamu, Seimbangkan Tubuhmu.” |
| D-002 | Product principle: Rules Decide, Evidence Supports, AI Explains. |
| D-003 | Expert system adalah pemilik keputusan; AI tidak mengubah hasil. |
| D-004 | SARIRA bukan diagnosis/pengganti tenaga kesehatan. |
| D-005 | Pengguna mandiri 12–75; remaja 12–17 membutuhkan consent wali. |
| D-006 | Baseline 14 hari, Early Pattern H7, Pattern Map + first Weekly Action H14. |
| D-007 | Sistem boleh menghasilkan data tidak cukup. |
| D-008 | Guided Meal dan Flex Kitchen; transaksi makanan di luar MVP. |
| D-009 | Nutrisi dihitung database/formula/rule berversi, bukan AI. |
| D-010 | Tidak ada janji tinggi; adult growth diarahkan ke fungsi/postur. |
| D-011 | Tidak mendiagnosis stunting dari satu pengukuran/foto/kuesioner. |
| D-012 | RAG approved-sources only; no scraping/unofficial APIs. |
| D-013 | HealthKit, Health Connect, manual fallback; vendor wearable lain roadmap. |
| D-014 | Data, Rule, dan Evidence confidence dipisahkan. |
| D-015 | Satu Weekly Action utama per siklus (finalisasi untuk menghindari overload). |
| D-016 | Program dirilis feature-gated; “masuk MVP” tidak berarti semua serentak. |
| D-017 | Safety `unknown` tidak boleh default hijau; red mengalahkan seluruh saran terkait. |

## Assumptions (Needs Validation)

| ID | Asumsi | Dampak jika salah | Validasi/owner |
|---|---|---|---|
| A-001 | Peluncuran awal di Indonesia, bahasa utama Indonesia | legal/content/localization berubah | Business+Legal+Research |
| A-002 | Mobile-first, dengan web/admin terpisah | IA/platform scope berubah | Product+Tech |
| A-003 | Parent/caregiver dapat membuat profil anak di bawah 12 | consent/reference/scope besar | Legal+Clinical |
| A-004 | Manual logging cukup untuk baseline tanpa wearable | completion/data quality | Research+Data |
| A-005 | Pengguna menerima baseline 14 hari | retention/burden | Research |
| A-006 | Reviewer ahli gizi dan admin dapat dipisah organisasional | governance/workflow | Operations |
| A-007 | Recipe/food datasets berlisensi dapat diperoleh | Guided/Flex feasibility | Legal+Nutrition |
| A-008 | AI explanation memberi nilai tambahan setelah template | cost/risk/scope | Research+AI Governance |

## Blocking Open Decisions for Phase 1

| ID | Pertanyaan | Opsi/kriteria | Owner candidate | Deadline gate |
|---|---|---|---|---|
| OD-001 | Program/release slice pertama? | risiko, reach, reviewer, data readiness | Product leadership | Sebelum architecture/build |
| OD-002 | Rentang usia profil anak Family Growth? | standards, consent, parent need | Clinical+Legal | Sebelum family design |
| OD-003 | Metode verifikasi usia/wali dan authority? | assurance vs friction/privacy | Legal+Identity | Sebelum teen build |
| OD-004 | Privasi remaja: data apa terlihat wali? | safety, autonomy, law | Legal+Ethics+Youth | Sebelum teen research prototype |
| OD-005 | Transisi profil saat 18 tahun? | ownership, re-consent, guardian access | Legal+Product | Sebelum teen release |
| OD-006 | Exact green/yellow/red triggers dan urgency? | evidence, false +/- | Clinical owners | Sebelum rule implementation |
| OD-007 | Data sufficiency threshold H7/H14 per rule? | quality vs burden/bias | Clinical+Data+Research | Sebelum algorithm spec |
| OD-008 | Rule Confidence scale/method/display? | calibrated meaning/comprehension | Clinical+Data+Content | Sebelum Pattern Map design |
| OD-009 | Nutrition formula, target bands, required attributes? | current Indonesia guidance, exclusions | Nutrition panel | Sebelum food/weight build |
| OD-010 | Food dataset/recipe source/license? | coverage, cost, provenance, allergen | Nutrition+Legal | Sebelum Guided/Flex build |
| OD-011 | Sugar definition dan diversity scoring per age? | evidence/data availability | Nutrition panel | Sebelum indicator build |
| OD-012 | Menu equivalence dimensions/tolerances? | safety, nutrition, preference | Nutrition panel | Sebelum swap feature |
| OD-013 | Growth standards, method, measurement cadence? | Indonesia/WHO, age ranges | Growth experts | Sebelum teen/family rules |
| OD-014 | Healthy Aging fall/function tool dan license? | validity, feasibility, accessibility | Geriatric/rehab experts | Sebelum aging rules |
| OD-015 | Digestive taxonomy, windows, red flags? | safety/usability | Clinical experts | Sebelum digestive rules |
| OD-016 | Referral service registry, regions, owners, review cadence? | accuracy/availability | Safety Ops | Sebelum active red rules |
| OD-017 | HealthKit/Health Connect masuk release pertama? | value, effort, privacy; manual exists | Product+Tech | Before MVP slice scope |
| OD-018 | Data retention, residency, vendors, model provider? | legal/privacy/security/cost | Legal+Security | Before technical architecture |
| OD-019 | AI explanation model/build-vs-buy and privacy? | fidelity, latency, cost, no training | AI Gov+Security | Before AI integration |
| OD-020 | Success metrics dan safeguard metrics? | behavior value without harm | Product+Clinical+Research | Before pilot |

## Non-blocking/Sequencing Decisions

- Notification cadence and channels.
- Search within approved content.
- Offline data scope.
- Number of profiles/supporters per account.
- Direct wearable vendors post-MVP.
- Localization beyond Indonesian.
- Professional directory, moderated community, commerce, corporate, ML roadmap.

## Decision Record Template

```text
Decision ID / title:
Date / owner / approvers:
Status: proposed | approved | rejected | superseded
Problem and scope:
Options considered:
Evidence and constraints:
Safety/privacy/legal impact:
Decision and rationale:
Changed product goal? If yes, why:
Consequences / follow-up / review date:
```

## Changes Made During Finalization

Tidak ada tujuan utama yang diubah. Finalisasi yang dilakukan:

- “Confidence” dipisah menjadi tiga definisi agar tidak ambigu.
- Safety diberi state `unknown` agar missing data tidak berubah menjadi false-green.
- Semua lima program tetap scope, tetapi aktivasi dibuat feature-gated untuk mengelola risiko.
- Satu Weekly Action utama dikunci sebagai interpretasi prinsip prioritas.
- Account, profile subject, manager, supporter, admin, dan reviewer dipisahkan untuk least privilege.
- Family Growth tidak diberi rentang usia anak karena brief belum menentukan; dipindahkan menjadi blocking decision.

