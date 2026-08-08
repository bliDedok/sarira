# Nutrition Engine

## Package and version

The pure engine lives in `packages/nutrition-engine` and exposes `NUTRITION_ENGINE_VERSION = phase5-dev-v1`. It has no network, database, UI, or clock dependency.

## Core calculation

For a nutrient stored per basis amount:

```text
servingGrams = quantity × serving.gramEquivalent
nutrientAmount = foodNutrient.amount × servingGrams / foodNutrient.basisAmount
```

All current food nutrient fixtures use a 100 g basis. Intermediate calculations retain JavaScript numeric precision; rounding happens only in API display output:

- energy and milligrams: 0 decimal places;
- grams: 1 decimal place.

## Functions

- `servingToGrams`: validates positive quantity and a known gram conversion.
- `calculateFoodNutrition`: scales each known nutrient to the requested gram amount.
- `aggregateNutrition`: sums a nutrient across item snapshots.
- `calculateMealNutrition` and `calculateDailyNutrition`: semantic aliases for aggregation.
- `calculateRecipeNutrition`: sums ingredient vectors and divides by a positive serving count. This is a calculation foundation only; no recipe recommendation UI is active.
- `indicatorFor`: evaluates `MINIMUM`, `RANGE`, and `UPPER_LIMIT` targets.
- `roundNutrient`: applies output precision after calculation.

## Unknown is not zero

Each nutrient is `number | null`. A recorded zero means a known value of zero. `null` means unavailable. If any included item lacks a nutrient, the aggregate for that nutrient is `null`; it is never silently replaced with zero.

## Validation and errors

Negative nutrient amounts, non-positive gram/basis values, missing gram equivalents, incomplete target definitions, and non-positive recipe serving counts fail explicitly. API services translate invalid portions and missing entities to stable domain error codes.

## Determinism and auditability

Every saved item snapshot records the engine version, source version, food name, gram amount, missing nutrients, completeness state, and calculated nutrient vector. Later master-data changes therefore do not rewrite historical intake.

