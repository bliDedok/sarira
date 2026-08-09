# Recipe Nutrition

Recipe nutrition tidak diinput manual untuk curated/development recipe. Setiap ingredient dihitung oleh `calculateFoodNutrition`, diagregasi oleh `calculateRecipeNutrition`, lalu dibagi servings. Ini adalah fungsi Phase 5 yang sama dengan food log.

`RecipeNutritionSnapshot` menyimpan total delapan nutrient, `perServing` JSON, missing nutrients, completeness, source versions, calculation version, dan timestamp. `null` dipertahankan saat satu ingredient tidak memiliki nutrient; unknown tidak pernah menjadi zero.

Consumption menghitung kembali snapshot ingredient berdasarkan fraction aktual dan versi sumber, lalu menyimpan `NutritionSnapshot` pada setiap `MealLogItem`.
