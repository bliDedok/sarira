# Phase 5 API Endpoints

All endpoints use the existing `/api/v1` envelope, bearer authentication, request IDs, validation, rate limiting, and ownership checks.

## Food master

| Method | Path | Purpose |
|---|---|---|
| GET | `/foods` | Paginated server search; `q`, `category`, `verified`, `page`, `pageSize` |
| GET | `/foods/:id` | Food detail, source, servings, nutrients, allergens, tags |
| GET | `/foods/:id/servings` | Food-specific servings |
| GET | `/nutrients` | Active nutrient registry |

## Nutrition

| Method | Path | Purpose |
|---|---|---|
| POST | `/nutrition/preview` | Calculate a food/serving/quantity and allergen warnings without saving |
| GET | `/nutrition/targets/current` | Read or initialize a context-current target |
| POST | `/nutrition/targets/recalculate` | Explicitly save a new target with audit event |
| GET | `/nutrition/daily/:localDate` | Daily totals, target, indicators, source versions, items |
| GET | `/nutrition/history?from=&to=` | Bounded local-date history, maximum 31 days |

## Meal items

| Method | Path | Purpose |
|---|---|---|
| POST | `/meal-logs/:mealLogId/items` | Add a database food item and snapshot |
| POST | `/meal-logs/:mealLogId/items/custom` | Add custom food with unavailable nutrition |
| PATCH | `/meal-log-items/:id` | Change database-food serving/quantity and snapshot |
| DELETE | `/meal-log-items/:id` | Delete owned item and snapshot |

## Consent and authorization

Nutrition calculation and item-processing endpoints require granted `NUTRITION_DATA` consent. Revocation blocks new nutrition-specific processing but does not delete old data. Ownership is resolved through authenticated user → active profile → active baseline/meal/item.

## Error codes

Phase 5 exposes `FOOD_NOT_FOUND`, `SERVING_NOT_FOUND`, `INVALID_PORTION`, `NUTRITION_DATA_MISSING`, `TARGET_UNAVAILABLE`, `POLICY_NOT_AVAILABLE`, `ALLERGEN_DATA_UNKNOWN`, `CONSENT_REQUIRED`, and existing `FORBIDDEN`/validation errors. Missing nutrient values return successful incomplete summaries with metadata; they are not transport errors and are never replaced with invented numbers.

No AI or recipe-recommendation endpoint was added.

