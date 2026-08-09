# Phase 5 — Real Nutrition Engine

## Outcome

Phase 5 converts the food and nutrition path from presentation-only demo data into an authenticated, deterministic, versioned application domain. It preserves the real Phase 3 onboarding and Phase 4 baseline and does not implement Phase 6 recommendation features.

## Real scope

- Versioned food source, food, serving, nutrient, allergen, and dietary-tag records.
- Food-specific serving-to-gram conversion.
- Pure food, meal, daily, and recipe-foundation calculations.
- `MealLogItem` records with stable `NutritionSnapshot` values.
- Versioned age-group nutrition policies and profile-specific target snapshots.
- Minimum, range, and upper-limit indicators for eight nutrients.
- Server-side food search, preview, add, edit, delete, daily summary, and 7-day history.
- Profile ownership, nutrition-consent enforcement, audit events, and explicit unknown-data semantics.
- Responsive user flow for mobile, tablet, and desktop.

## Data flow

`FoodDataSource → FoodItem → FoodServing/FoodNutrient → preview → MealLogItem → NutritionSnapshot → daily aggregation → NutritionIndicator`

Target flow:

`Profile + age group + Goal + SafetyResult + active NutritionPolicy → NutritionTargetProfile`

The engine is deterministic. The same food source version, serving, quantity, and policy context produce the same output. No AI or probabilistic model participates.

## Important boundary

The bundled food and target values are synthetic development fixtures. They validate product mechanics, not clinical adequacy. Every source and policy is visibly marked as development data and policies carry `requiresExpertValidation = true`.

## Explicitly not implemented

Guided Meal recommendations, Flex Kitchen optimization, AI/LLM, RAG, final Pattern Map, Weekly Action engine, food vision, production barcode lookup, wearable integrations, Motion Coach, growth recommendations, Family Growth analysis, and digestive diagnosis remain Demo or out of scope.

