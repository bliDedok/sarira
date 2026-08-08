# SARIRA — Product Risk Register

**Status:** initial Phase 0 register · **Skala:** Likelihood (L) dan Impact (I) 1–5; score = L×I

## Risiko Prioritas

| ID | Risiko | L | I | Score | Mitigasi/control | Owner candidate | Trigger/indicator |
|---|---|---:|---:|---:|---|---|---|
| R-001 | Pengguna menganggap hasil sebagai diagnosis | 4 | 5 | 20 | positioning, contextual disclaimer, explainability, comprehension test | Product+Clinical | user report/claim wording |
| R-002 | Safety red flag terlewat/terlambat | 3 | 5 | 15 | expert rules, fixtures, fail-safe, monitoring, incident response | Clinical+Safety | referral miss simulation/incident |
| R-003 | False reassurance dari status hijau | 4 | 5 | 20 | label terbatas, unknown state, re-screen, limitation | Clinical+Content | comprehension failure |
| R-004 | AI mengubah/menambah keputusan atau klaim | 3 | 5 | 15 | structured payload, validator, no write path, fallback | AI Governance | fidelity test failure |
| R-005 | Target nutrisi/formula salah untuk pengguna | 3 | 5 | 15 | versioned formulas, exclusions, expert review, no guess | Nutrition | benchmark/regression failure |
| R-006 | Harm terhadap body image/eating behavior remaja | 3 | 5 | 15 | teen-specific rules/copy, no extreme targets, research/referral | Clinical+Youth Safety | harmful feedback/behavior signal |
| R-007 | Consent wali atau confidentiality remaja tidak sah/jelas | 4 | 5 | 20 | legal review, dual consent, permission map, comprehension | Legal+Privacy | dispute/consent audit fail |
| R-008 | Data anak/health bocor atau disalahakses | 3 | 5 | 15 | least privilege, encryption, audit, threat model | Security+Privacy | access anomaly/incident |
| R-009 | Diagnosis stunting tersirat dari data tunggal | 3 | 5 | 15 | hard rule prohibition, trend/quality, content tests | Family Growth Owner | copy/test failure |
| R-010 | Referral info salah/kedaluwarsa | 3 | 5 | 15 | registry owner, review date, link check, generic fallback | Safety Operations | broken link/expired entry |
| R-011 | Double counting/missing wearable data | 4 | 3 | 12 | provenance, dedup fixtures, separate missing states | Data/Integration | anomaly rate |
| R-012 | Food/allergen data tidak lengkap | 3 | 5 | 15 | hard filters, unknown-block policy, approved dataset | Nutrition+Content | unknown allergen/correction |
| R-013 | RAG memakai sumber tidak sah/usang | 3 | 4 | 12 | status filter, licensing, review/withdrawal workflow | Knowledge Governance | retrieval violation |
| R-014 | Baseline mendorong logging obsesif/notif fatigue | 3 | 4 | 12 | low-pressure UX, optional notifications, research/safety flags | Product+Clinical | churn/distress feedback |
| R-015 | Insufficient data bias terhadap pengguna sibuk/low-tech | 4 | 3 | 12 | partial patterns, manual fallback, low-burden logs | Research+Product | sufficiency disparity |
| R-016 | Cakupan lima program menurunkan kualitas/safety | 5 | 4 | 20 | feature-gated releases, P0 gates, staged roadmap | Product Leadership | unresolved risks per pack |
| R-017 | Lansia mendapat activity/action yang meningkatkan risiko jatuh | 2 | 5 | 10 | fall override, expert action library, accessibility testing | Healthy Aging Owner | action adverse report |
| R-018 | Temporal digestive pattern dianggap penyebab/alergi | 4 | 4 | 16 | association wording, data counts, no diagnosis/elimination | Digestive Owner | comprehension failure |
| R-019 | Kalkulasi resep memberi false precision | 4 | 3 | 12 | unknown/coverage, units/yield, range/rounding policy | Nutrition+Data | large correction variance |
| R-020 | Role conflict/edit profile yang salah | 3 | 4 | 12 | active-profile context, granular roles, audit, conflict state | Identity/Product | cross-profile incident |
| R-021 | Evidence/reviewer bottleneck menghambat update | 4 | 3 | 12 | ownership/cadence, queues, SLA candidate, feature gate | Content Ops | overdue review rate |
| R-022 | Regulatory classification berubah/keliru | 2 | 5 | 10 | legal/regulatory review, claims boundary, change control | Legal | authority/app store feedback |

## Risk Treatment Rules

- Score ≥15 atau impact 5: release-blocking sampai owner, treatment, validation, and residual-risk acceptance tersedia.
- Score 10–14: mitigation dan monitoring wajib sebelum related capability.
- Score <10: monitor; dapat naik karena incident/evidence.
- Risiko anak, safety, privacy, allergen, dan diagnosis tidak diturunkan hanya karena likelihood diperkirakan rendah.

## Incident Classes

- **Critical:** missed/altered red referral, cross-profile health-data exposure, allergen unsafe recommendation, diagnosis/medication/dosage output.
- **High:** yellow restriction failure, AI decision mutation blocked after display, invalid growth label, repeated wrong nutrient calculation.
- **Medium/Low:** stale non-safety content, isolated display/source issue, non-critical latency.

Severity/response timing final ditetapkan security/safety incident plan di Phase 1.

## Review Cadence

Review register pada setiap rule/content/model release, incident, new population/program, regulatory change, dan setidaknya cadence berkala yang disepakati. Residual risk harus memiliki named accountable owner, bukan hanya “team”.

