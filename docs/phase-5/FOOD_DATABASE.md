# Food Database

## Model

The master-data foundation consists of:

- `FoodDataSource`: publisher, source type, license, version, dataset label, import time, and active flag.
- `FoodItem`: stable code, localized name, alternate names, category, country/language, source version, verified flag, and active flag.
- `FoodServing`: food-specific label, quantity, unit, optional gram equivalent, default flag, source, and verification state.
- `FoodNutrient`: nutrient amount, unit, basis amount/unit, source, and source version.
- `FoodAllergen` and `FoodDietaryTag`: explicit metadata with verification/status.

Foreign keys use restrictive deletion for master data referenced by history. Food children such as serving and nutrient rows cascade only when an unreferenced food is deliberately removed.

## Development seed

The idempotent Phase 5 seed contains 15 Indonesian/local test foods: white rice, brown rice, egg, tempeh, tofu, chicken, fish, milk, banana, papaya, spinach, carrot, whole-wheat bread, oatmeal, and water.

These records are deliberately synthetic. Oatmeal omits sodium to test unavailable-data behavior. The dataset is not a national food-composition table and must not be presented as one.

## Search behavior

`GET /foods` performs authenticated server-side search over active food names and alternate names. It supports category, verified state, page, and page-size filters. The client uses a 300 ms debounce and requests a bounded page; it never downloads the full database.

Indexes cover food name, category/active, source/active, serving lookup, nutrient lookup, allergen code, and dietary-tag status.

## Verification semantics

`verified = false` is not equivalent to false data; it means the fixture has not completed an approved validation workflow. User UI identifies these records as development samples and shows their source.

