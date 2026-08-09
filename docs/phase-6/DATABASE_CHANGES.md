# Database Changes

Migration incremental menambah enum recipe/planning serta tabel:

- Recipe, RecipeVersion, RecipeIngredient, RecipeStep, RecipeNutritionSnapshot.
- MealPlanningPolicy, DailyMealPlan, DailyMealPlanItem, MealPlanItemSnapshot, MealPlanConsumption.

Relasi ditambahkan ke Profile, FoodItem, FoodServing, NutritionTargetProfile, dan MealLog. Tidak ada tabel/nilai Phase 5 yang ditimpa. Index mencakup ownership, source/status, recipe version, plan date/status, item status, dan unique consumption.

Seed menambah 8 synthetic development recipes, 8 versions, 24 ingredients, 8 nutrition snapshots, dan satu policy ACTIVE. Seed idempoten melalui upsert.
