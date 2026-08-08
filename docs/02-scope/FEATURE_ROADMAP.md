# SARIRA — Feature Roadmap

**Status:** outcome-based roadmap; tanggal belum ditetapkan

## Prinsip

Roadmap bukan janji tanggal. Setiap capability bergerak hanya setelah evidence, safety, privacy, dan operational gate terpenuhi.

## Phase 0 — Product Definition (sekarang)

- Visi, positioning, principles, glossary.
- PRD, FR/NFR, roles, journey, flow, IA.
- Scope, safety, domain, quality, risks, validation, open decisions.
- Tidak ada coding, database production, API, atau Figma.

**Exit:** review dan persetujuan pengguna atas paket Phase 0.

## Phase 1 — Discovery, Governance, and Technical Definition

- Riset pengguna per persona; service blueprint.
- Panel ahli dan clinical/content governance.
- Rule specification + test fixtures; formula/dataset review.
- Legal/privacy/security assessment; consent minor model.
- Platform, architecture, data model, API contract, observability plan.
- Low-fidelity flows/prototypes setelah scope disetujui.

**Exit:** satu release slice dipilih dan semua blocking open decisions terjawab.

## MVP Delivery — Incremental, Feature-gated

- Shared account/consent/safety/baseline/decision/citation platform.
- Program dirilis satu per satu berdasarkan gates.
- Guided Meal/Flex Kitchen dengan approved content.
- HealthKit/Health Connect jika feasibility dan permission UX lolos.
- Admin/reviewer governance minimum.

## Post-MVP — Near-term Candidate

- Direct wearable support tambahan (vendor dipilih berdasarkan demand dan izin resmi).
- Professional consultation scheduling/referral directory; real-time consultation hanya dengan governance baru.
- Moderated community pilot dengan child-safety controls.
- Expanded food database/local cuisines dan household planning.
- Enhanced accessibility/localization.

## Later / Strategic

- Food marketplace, ordering, payment, delivery, restaurant dashboard.
- Full community.
- Corporate wellness dengan privacy model terpisah.
- Advanced ML personalization hanya jika explainability, bias, monitoring, dan non-override dapat dibuktikan.
- Body scan hanya setelah regulatory/clinical validation; diagnosis tetap bukan asumsi otomatis.
- Professional ecosystem dan interoperability yang sah.

## Dependency Map

| Capability | Wajib sebelum mulai |
|---|---|
| Teen Growth release | consent wali, teen privacy, eating-risk rules, growth evidence |
| Family Growth release | rentang usia, standard/version, measurement protocol, referral network |
| Healthy Aging release | fall-risk screening, accessibility, supporter permissions |
| Digestive Support release | symptom vocabulary, temporal logic, red flags, referral copy |
| Guided Meal | licensed recipe/food data, allergen governance, equivalence rules |
| Flex Kitchen | units/yield/cooking factors, portion logic, unknown ingredient state |
| Advanced ML | stable rule baseline, outcomes, bias assessment, model governance |
| Commerce | separate business, food safety, payment, merchant, logistics requirements |

## Roadmap Metrics

Gate pass rate, unresolved high risks, rule test coverage, evidence freshness, consent comprehension, safety simulation success, baseline sufficiency, action feasibility, and incident rate. Engagement tidak boleh menjadi satu-satunya release metric.

