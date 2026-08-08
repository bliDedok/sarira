# SARIRA Documentation Index

**Versi implementasi:** Phase 3 · **Tanggal pembaruan:** 8 Agustus 2026 · **Status:** siap review pemilik produk

Dokumen Phase 0 tetap menjadi sumber prinsip produk dan safety. Folder `design`, `architecture`, `api`, `database`, dan `phase-3` mendokumentasikan implementasi yang dibangun pada fase berikutnya.

## Phase 3

Mulai dari `phase-3/PHASE_3_OVERVIEW.md`, lalu review `SAFETY_RULES.md`, `ONBOARDING_STATE_MACHINE.md`, `MOCK_VS_REAL.md`, dan `PHASE_3_FINAL_REPORT.md`. Seluruh konten kesehatan hasil seed masih berstatus development dan memerlukan validasi ahli.

## Urutan Review yang Disarankan

1. `00-product/PRODUCT_VISION.md`
2. `00-product/PRODUCT_PRINCIPLES.md`
3. `01-requirements/PRODUCT_REQUIREMENTS.md`
4. `02-scope/MVP_SCOPE.md` dan `02-scope/OUT_OF_SCOPE.md`
5. `03-safety/SAFETY_RULES.md`, `AI_BOUNDARIES.md`, dan `CONSENT_REQUIREMENTS.md`
6. Dokumen domain yang relevan.
7. `05-quality/OPEN_DECISIONS.md`, `PRODUCT_RISKS.md`, dan `VALIDATION_PLAN.md`

## Daftar Dokumen

### 00 — Product

- `PRODUCT_VISION.md` — visi, masalah, value, outcome, batas.
- `PRODUCT_POSITIONING.md` — kategori, jobs, pembeda, claim boundaries.
- `PRODUCT_PRINCIPLES.md` — prinsip keputusan dan hierarchy conflict.
- `PRODUCT_GLOSSARY.md` — istilah terkendali.

### 01 — Requirements

- `PRODUCT_REQUIREMENTS.md` — PRD utama dan business rules.
- `FUNCTIONAL_REQUIREMENTS.md` — katalog FR ber-ID.
- `NON_FUNCTIONAL_REQUIREMENTS.md` — security, privacy, reliability, accessibility, governance.
- `USER_ROLES.md` — 10 peran, hak akses, batas, flow.
- `USER_JOURNEY.md` — journey dan moments of truth.
- `USER_FLOW.md` — logical flow dan semua cabang wajib.
- `INFORMATION_ARCHITECTURE.md` — IA dan object model konseptual.

### 02 — Scope

- `MVP_SCOPE.md` — must-have, release gates, feature-gated slicing.
- `OUT_OF_SCOPE.md` — larangan dan change control.
- `FEATURE_ROADMAP.md` — Phase 1 sampai strategic roadmap.
- `PRIORITIZATION_MATRIX.md` — safety-adjusted prioritization.

### 03 — Safety

- `SAFETY_RULES.md` — traffic status, expert-system contract, enam rule pack.
- `AI_BOUNDARIES.md` — allow/deny, payload, validation, fallback.
- `PRIVACY_REQUIREMENTS.md` — purpose map dan privacy-by-default.
- `CONSENT_REQUIREMENTS.md` — core/minor/wearable/sharing consent.
- `REFERRAL_RULES.md` — referral levels, payload, override, registry.

### 04 — Domain

- `NUTRITION_REQUIREMENTS.md`
- `GROWTH_PATH_REQUIREMENTS.md`
- `FAMILY_GROWTH_REQUIREMENTS.md`
- `HEALTHY_AGING_REQUIREMENTS.md`
- `DIGESTIVE_SUPPORT_REQUIREMENTS.md`
- `WEARABLE_REQUIREMENTS.md`
- `KNOWLEDGE_BASE_REQUIREMENTS.md`

### 05 — Quality

- `ACCEPTANCE_CRITERIA.md` — cross-product Given/When/Then.
- `PRODUCT_RISKS.md` — scored initial risk register.
- `VALIDATION_PLAN.md` — ten validation workstreams dan gates.
- `OPEN_DECISIONS.md` — locked decisions, assumptions, blockers.

## Source of Truth dan Konflik

- Goal/boundary: `PRODUCT_VISION.md` dan `PRODUCT_PRINCIPLES.md`.
- Requirement IDs: `FUNCTIONAL_REQUIREMENTS.md`/`NON_FUNCTIONAL_REQUIREMENTS.md`.
- Safety conflict: `SAFETY_RULES.md` menang.
- Scope: `MVP_SCOPE.md`/`OUT_OF_SCOPE.md`.
- Belum pasti: `OPEN_DECISIONS.md`; jangan diasumsikan approved.

Jika dokumen detail bertentangan, urutan resolusi adalah safety/legal → consent/privacy → product principles → PRD → domain detail → roadmap.
