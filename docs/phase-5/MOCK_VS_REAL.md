# Mock vs Real After Phase 5

## Real application paths

- account/auth API contract and onboarding;
- deterministic safety and goal eligibility;
- 14-day baseline and daily tracking;
- versioned food database and provenance;
- server food search and food-specific servings;
- food, meal, and daily nutrient calculations;
- stable meal-item snapshots and history;
- profile nutrition targets and recalculation;
- eight nutrition indicators;
- allergen-warning and dietary-tag foundations;
- consent, ownership, and audit events.

Local development may use in-memory repositories/auth adapters, but it executes the same API contracts and nutrition engine. Production persistence/auth requires the configured PostgreSQL and Supabase adapters.

## Development data, not production truth

The real calculations currently run on explicitly synthetic food and policy fixtures. “Real” means the end-to-end behavior and persistence are implemented; it does not mean the fixture values have clinical or regulatory approval.

## Still Demo or out of scope

- Guided Meal recommendations;
- Flex Kitchen intelligent adjustment;
- AI insight/LLM and RAG;
- final Pattern Map and Weekly Action;
- photo recognition and production barcode integration;
- wearable, HealthKit, Health Connect, and Motion Coach;
- growth/stunting recommendations and Family Growth analysis;
- digestive analysis/diagnosis;
- payments, marketplace, ordering, and personalized recipe recommendation.

Phase 5 removes Demo labels from food search, portion calculation, daily nutrition, and nutrition indicators. Existing prototype galleries remain design demonstrations and are kept visually separated from production routes.

