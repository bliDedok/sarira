# Cooking Mode

Cooking Mode menyediakan ingredient checklist, servings adjustment, progress langkah, next/back, dan timer metadata. Menekan next/back tidak menulis nutrisi atau konsumsi.

Status berubah menjadi `COOKING` hanya melalui aksi explicit. Konsumsi memerlukan pilihan 100/75/50/25%, membuat MealLog dan MealLogItem, menyimpan snapshot, mengubah item ke `CONSUMED`, lalu mengembalikan DailyNutritionSummary dan remaining terbaru.

`MealPlanConsumption.mealPlanItemId` unik menjamin retry idempoten. Transaction PostgreSQL mengikat meal log, items, consumption link, dan status plan. Cascade terarah memungkinkan privacy erasure tanpa orphan.
