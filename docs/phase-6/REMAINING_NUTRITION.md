# Remaining Nutrition

`calculateRemainingNutrition()` mempertahankan tipe target:

- MINIMUM → `minimumRemaining = max(0, minimum - consumed)`.
- RANGE → `minimumRemaining` dan `maximumRemaining` terpisah.
- UPPER_LIMIT → hanya `maximumRemaining = max(0, maximum - consumed)`.

Intake `null` menghasilkan remaining `null`, bukan zero. Pengecualian eksplisitnya hanya hari yang belum memiliki satu pun item makanan: konsumsi terukur dianggap 0 agar plan awal dapat dibandingkan dengan target. Setelah ada item, nutrien `null` pada snapshot tetap `UNKNOWN`. UI tidak menyebut sisa upper limit sebagai target yang harus dihabiskan. Remaining dihitung ulang setelah consumption/replacement dari DailyNutritionSummary nyata, sedangkan target snapshot plan tetap immutable.
