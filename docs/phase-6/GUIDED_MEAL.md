# Guided Meal

Guided Meal adalah pemilih menu deterministik. Input server meliputi profile, age group, goal, SafetyResult, NutritionTarget, intake hari ini, remaining nutrition, allergy text, dietary preference, meal type, waktu, biaya, dan metadata recipe. Output berisi kandidat eligible, pilihan, `reasonCodes`, Recipe Fit, nutrition impact, dan alternatives.

Urutan wajib:

1. Validasi `NUTRITION_DATA` consent dan ownership profile.
2. Ambil SafetyResult serta target Phase 5.
3. Hitung intake dan remaining nutrition.
4. Terapkan hard constraints.
5. Skor hanya kandidat yang lolos.
6. Simpan plan, target snapshot, recipe version, dan policy version.

Wording UI: “Menu yang disarankan untuk membantu memenuhi target program hari ini.” Guided Meal bukan menu wajib, resep medis, atau janji hasil berat badan.
