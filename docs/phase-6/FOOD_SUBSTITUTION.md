# Food Substitution

Substitution foundation menggunakan category match, allergen filtering, dan nutrient similarity pada energy, protein, fiber, serta sodium. Hasil bersifat development configuration dan tidak otomatis diterapkan.

Response menyimpan original/replacement ingredient, before, after, difference, score, reason codes, serta `requiresConfirmation=true`. UI menampilkan contoh protein dan sodium sebelum user mengonfirmasi.

Replacement hanya diambil dari FoodItem database. Custom item tanpa data tidak mendapat substitusi otomatis dan nutrition tidak dikarang.
