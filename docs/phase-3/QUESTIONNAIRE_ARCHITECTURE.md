# Questionnaire Architecture

The authoritative hierarchy is `QuestionnaireTemplate` → `QuestionnaireQuestion` → `QuestionnaireOption`; each `QuestionnaireSession` pins a `templateVersion`, and `QuestionnaireAnswer` stores typed values by question reference/code.

The seeded `ONBOARDING_PROFILE` template includes BODY_PROFILE, ROUTINE, SLEEP, FOOD_HABIT, DIET_PREFERENCE, and ACTIVITY. Technical bounds reject structurally unreasonable inputs but are not clinical thresholds. No nutrition need is calculated.

Supported types are text, number, single-select, multi-select, boolean, and time. The API validates type, option membership, time format, technical bounds, and ownership.

## Conditional schema

`visibleWhen` is evaluated by one shared deterministic helper:

- allergy details when `has_allergy = true`;
- shift schedule when `daily_context = SHIFT_WORK`;
- mobility details when `mobility_limitation = true`.

Only required, currently visible questions block completion. This prevents scattered frontend `if` statements and keeps API/UI behavior aligned.

Answers are sent in debounced batches while the session is `IN_PROGRESS`. UI state remains local during failures, displays “Gagal menyimpan — Coba lagi”, and retries the same queued write. The latest session and answers support resume after logout/login.
