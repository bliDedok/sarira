# Recipe Versioning

Perubahan bahan pada personal recipe membuat `RecipeVersion` baru dan menandai versi lama `RETIRED`; histori tidak ditimpa. Versi aktif unik secara logis melalui service/repository.

Meal plan item menyimpan `recipeVersionId` dan `MealPlanItemSnapshot`. Snapshot mencakup nama, versi, servings, nutrition per serving, ingredient snapshot, source version, dan calculation version. Karena itu edit recipe atau food database berikutnya tidak mengubah plan/konsumsi lama.

Recipe development dimulai dari versi 1. `sourceVersion`, `publishedAt`, `requiresExpertValidation`, dan snapshot `calculatedAt` menyediakan traceability.
