# Meal Nutrition

## Data model

An existing Phase 4 `MealLog` owns zero or more `MealLogItem` rows. An item belongs to a profile and contains either a database food/serving reference or a custom-food name. Each item owns one `NutritionSnapshot`.

## Add flow

1. Confirm `NUTRITION_DATA` consent.
2. Resolve the authenticated user's active profile and baseline.
3. Verify the meal belongs to that profile/baseline and its local date remains editable.
4. Resolve food and serving, convert quantity to grams, calculate the eight-nutrient vector, and create allergen warnings.
5. Save item and snapshot together; record `MEAL_LOG_ITEM_CREATED`.

## Snapshot fields

The snapshot stores source version, food name, gram amount, nutrient columns, missing-nutrient codes, completeness, and calculation version. Historical reads never recalculate it from current food master data.

## Aggregation

Meal totals sum item snapshots nutrient by nutrient. If one included item lacks a nutrient, the meal value for that nutrient is unavailable. Custom foods without label values intentionally create an all-null snapshot.

## Edit and delete

Database-food quantity/serving edits recalculate and replace the snapshot. Custom food without nutrition cannot be portion-recalculated. Delete removes the item and its snapshot through a cascade, then the next daily read immediately recomputes totals.

All edit/delete paths enforce `profileId` ownership and emit audit events.

