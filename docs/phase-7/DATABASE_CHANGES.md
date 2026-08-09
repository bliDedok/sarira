# Database Changes

Phase 7 menambah enum domain/quality/status/feedback/action dan sembilan model: `FeatureSnapshot`, `PatternScoringPolicy`, `PatternRuleDefinition`, `DecisionRecord`, `RuleEvaluation`, `PatternMap`, `PatternMapFeedback`, `WeeklyActionDefinition`, `WeeklyActionAssignment`, dan `WeeklyActionCheckIn` (sepuluh model termasuk feedback/check-in entities).

Migration incremental:

1. `20260809070411_phase7_expert_system_pattern_map` — enum, table, relation, index, dan constraints utama.
2. `20260809071000_phase7_analysis_constraints` — active/current uniqueness guards.
3. `20260809082500_phase7_reanalysis_signature` — memasukkan context `inputSignature` ke uniqueness Decision Record agar safety/goal reanalysis sah.

Seed reference-only menulis tepat satu scoring policy, 13 rule definitions, dan 6 action definitions secara deterministic/idempotent. Seed tidak membutuhkan user fixture untuk CI. Foreign key `Restrict` mempertahankan definition yang telah dipakai; user-derived rows mengikuti ownership cascade yang sudah ada.
