# Meal Planning Policy

`MealPlanningPolicy` version `meal-planning-dev-v1` berstatus ACTIVE dan `requiresProductValidation=true`. Configuration menyimpan candidate weights, critical nutrients, snack switch, dan jumlah alternatives.

Bobot development: meal type 20, protein 18, fiber 12, upper limits 20, time 8, cost 5, preference 7, data quality 10. Critical nutrient awal: energy, protein, sodium. Snack default nonaktif dan tidak dipaksakan.

Konfigurasi ini bukan optimasi klinis. Perubahan production harus menghasilkan policy version baru dan validasi product/nutrition expert.
