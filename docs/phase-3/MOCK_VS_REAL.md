# Real vs Demo after Phase 3

## Real application flow

Account/session boundary, persisted profile, DOB-derived age group, role, versioned consent, guardian consent, safety sessions/results, goal selection, versioned questionnaire/answers, onboarding progress, program preference, summary, route guard, completion, audit events, and admin configuration version read are connected to the Phase 3 API/repository.

Local development uses an explicitly named mock identity adapter and may use an in-memory repository. Staging/production mode uses Supabase Auth and PostgreSQL; the UI/API contract is the same.

## Still Demo / out of scope

- Starter Journey tasks and baseline tracking
- Early Pattern, Pattern Map, Weekly Action
- nutrition/calorie calculations and meal recommendations
- Guided Meal/Flex Kitchen calculations
- food scan/barcode, AI explanation, RAG
- wearable/HealthKit/Health Connect
- Motion Coach vision
- Growth, Family Growth, and Digestive analysis
- production notifications, payments, ordering, subscription

The home dashboard labels the simulated area with “Demo”; program descriptions also state that nutrition recommendation/calculation remains simulated. Phase 3 stores only the starter context required for a later reviewed phase.
