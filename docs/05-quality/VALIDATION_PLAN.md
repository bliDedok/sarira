# SARIRA — Validation Plan

**Status:** Phase 0 plan; sample sizes/timeline require research and governance input

## Tujuan

Menjawab apakah problem, positioning, flow, rule, safety, nutrition, explanation, consent, accessibility, dan operasional SARIRA layak sebelum serta selama Phase 1/MVP.

## Prinsip

- Validasi paling berisiko dilakukan lebih dulu.
- Usability tidak menggantikan clinical/legal validation.
- Engagement tidak digunakan sebagai proxy keselamatan/kesehatan.
- Remaja, anak, dan lansia memerlukan recruitment/ethics/privacy safeguards.
- Program tetap feature-gated bila evidence belum memadai.

## Workstreams

### V1 — Problem dan Positioning

- **Pertanyaan:** Apakah pengguna memahami nilai “pattern → one action”? Apakah “AI/growth/balance” disalahartikan?
- **Metode:** interview dan concept comprehension per persona; message test.
- **Pass candidate:** mayoritas yang ditetapkan riset dapat menjelaskan non-diagnosis dan peran rules/evidence/AI tanpa prompting.

### V2 — Role, Consent, dan Privacy

- **Pertanyaan:** Apakah remaja/wali tahu siapa melihat apa? Apakah pendamping scope jelas?
- **Metode:** legal review, privacy threat modeling, teen+guardian paired study, permission prototype test.
- **Output:** approved relationship/transition/withdrawal model.

### V3 — Safety dan Referral

- **Pertanyaan:** Apakah trigger, urgency, restrictions, dan referral tepat?
- **Metode:** Delphi/panel ahli atau method agreed; scenario review; red-team; simulation; local service verification.
- **Pass:** seluruh red/yellow fixtures disetujui, deterministic, dan dipahami; zero critical miss pada approved suite.

### V4 — Rule Packs dan Confidence

- **Pertanyaan:** Apakah data minimum/condition/priority/conflict/confidence valid?
- **Metode:** formal rule specification review, synthetic/de-identified fixtures, boundary/regression tests, inter-reviewer agreement.
- **Output:** signed version per pack, exclusions, monitoring.

### V5 — Nutrition, Food Data, dan Recipe

- **Pertanyaan:** Apakah formula/target/dataset/unit/yield/equivalence/allergen benar?
- **Metode:** expert benchmark recipes; reference calculation comparison; unit/yield/allergen test; licensing review.
- **Pass:** toleransi numerik dan coverage dikunci ahli; unknown behavior aman.

### V6 — Baseline and Weekly Loop

- **Pertanyaan:** Apakah 14 hari realistis? Data cukup tanpa logging burden/obsession?
- **Metode:** diary study, prototype field study, missingness analysis, interviews; compare manual/wearable.
- **Output:** thresholds, reminder cadence, extend/exit policy, North Star validation.

### V7 — Explainability, RAG, Citation

- **Pertanyaan:** Apakah pengguna membedakan tiga confidence dan memahami alasan/limitasi?
- **Metode:** comprehension tasks; citation fidelity audit; retrieval relevance; prompt-injection/red-team; AI mutation test.
- **Pass:** zero decision mutation; threshold comprehension/hallucination disepakati governance.

### V8 — Accessibility dan Age Appropriateness

- **Metode:** WCAG audit, screen reader/large text, cognitive walkthrough, teen copy review, Healthy Aging users with/without supporter.
- **Output:** accessibility defects and gate.

### V9 — Wearable/Data Quality

- **Metode:** device/platform matrix; permission denial/partial/revoke; duplicates; timezone/DST; offline; manual conflict.
- **Pass:** no double count in approved fixtures; missing states correct; user can find source.

### V10 — Security, Reliability, Operations

- **Metode:** threat model, privacy impact assessment, security testing, rule/AI/RAG failure injection, rollback/incident tabletop, deletion/export audit.
- **Pass:** no unresolved critical risk; on-call/owner/playbook established.

## Persona Coverage

Teen 12–14 dan 15–17 + wali; Young Adult; Adult 26–59 across goals/literacy/budgets; Healthy Aging 60–75 with/without supporter; parent/guardian with child profile; caregiver; user declining wearable; user with insufficient data; admin/reviewer.

Recruitment quotas/sample size ditetapkan researcher/statistician; Phase 0 tidak mengarang angka.

## Evidence Artifacts

Research plan/consent, interview guide, synthesis, decision log, rule review forms, calculation benchmarks, safety fixtures, accessibility report, privacy/security assessment, usability recordings/notes, test results, and residual-risk acceptance.

## Phase Gates

| Gate | Required evidence |
|---|---|
| Phase 0 approval | Dokumen konsisten + owner/open decisions diketahui |
| Design/architecture start | program pertama + roles/consent + data/rule contract dipilih |
| Build start | validated rule/data schemas + privacy/security plan |
| Internal alpha | test fixtures + governance tools + fail-safe paths |
| Pilot | expert/legal sign-off + usability/accessibility + incident readiness |
| Public release | pilot outcomes + residual risk acceptance + monitoring/rollback |

## Stop Criteria

Stop/feature-disable jika ada critical safety/privacy incident, AI decision mutation yang tampil, unlicensed essential data, consent failure, unavailable referral content for active red rules, or rule pack without accountable reviewer.

