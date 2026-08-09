# Phase 5 Database Changes

## Migration

Incremental migration: `prisma/migrations/20260808142710_phase5_nutrition_engine/migration.sql`.

Phase 0–4 migrations were not edited, squashed, or reapplied. The migration adds Phase 5 enums, tables, indexes, foreign keys, profile/meal relations, and audit event values.

## New tables

- `FoodDataSource`
- `FoodItem`
- `FoodServing`
- `NutrientDefinition`
- `FoodNutrient`
- `FoodAllergen`
- `FoodDietaryTag`
- `MealLogItem`
- `NutritionSnapshot`
- `NutritionPolicy`
- `NutritionTargetProfile`

## Relationship summary

- One source has many foods and nutrient values.
- One food has many servings, nutrient values, allergens, tags, and meal-item references.
- One `MealLog` has many items; each item belongs to one profile and has one optional snapshot.
- One policy has many target-profile snapshots; each target belongs to one profile.

## Integrity and indexes

Stable uniqueness includes source name/version, food code, food/serving label, nutrient code, food/nutrient pair, food/allergen pair, food/tag pair, item/snapshot, and policy code/version. Indexes cover active search/filter fields, source and nutrient joins, meal/profile history, policy selection, and target effective periods.

Master-data references from historical records use restrictive deletion. Item deletion cascades to its snapshot. Profile and meal ownership relations preserve Phase 4 lifecycle behavior.

## Seed

The seed is idempotent and upserts 8 nutrient definitions, 1 synthetic source, 15 foods with food-specific servings/nutrients, allergens/tags, and 4 active development policies.

