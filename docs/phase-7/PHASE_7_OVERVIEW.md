# Phase 7 Overview

Phase 7 mengubah data nyata Phase 3–6 menjadi keputusan pola yang deterministic, versioned, traceable, explainable, reproducible, safety-aware, age-aware, consent-aware, dan mampu abstain. Alurnya adalah raw profile/baseline/nutrition/meal-planning data → `@sarira/feature-engine` → immutable `FeatureSnapshot` → domain sufficiency → `@sarira/expert-system` → `DecisionRecord`/`PatternMap` → maksimum satu `WeeklyActionAssignment`.

## Batas implementasi

- Nyata: 25 feature, data quality, 13 rule, enam domain, ranking, feedback, reanalysis, satu action/minggu, check-in/undo, API, PostgreSQL, dan UI.
- Internal: evidence reference berasal dari record SARIRA, bukan literatur eksternal.
- Development-only: threshold, bobot, rule, dan action ditandai `requiresExpertValidation=true` serta `DEVELOPMENT RULE / NOT CLINICALLY VALIDATED`.
- Tidak ada: LLM, generative AI, ML, embedding, vector database, RAG, atau Phase 8.

## Versi aktif

| Komponen | Versi |
|---|---|
| Feature Engine | `phase7-feature-dev-v1` |
| Expert System | `phase7-expert-dev-v1` |
| Rule definitions | `pattern-rules-dev-v1` |
| Scoring policy | `pattern-scoring-dev-v1` |
| Weekly Action policy | `weekly-action-dev-v1` |
| Age packs | `PATTERN-TEEN-DEV-V1`, `PATTERN-ADULT-DEV-V1`, `PATTERN-AGING-DEV-V1` |

Prinsip Phase 7: **rules decide, internal evidence supports, AI explanation belum dikerjakan**.
