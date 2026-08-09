# Food Logging Basic

Phase 4 menyimpan catatan makan dasar, bukan hasil Nutrition Engine.

## Model dan operasi

`MealLog` memuat profile, baseline, DailyRecord, local date, kategori `BREAKFAST|LUNCH|DINNER|SNACK|OTHER`, waktu opsional, deskripsi, source manual, meal skipped, notes, dan signal minimal `sugaryDrinkConsumed`, `lateMeal`, serta `homeCooked`.

Pengguna dapat membuat, melihat per hari, mengedit, dan menghapus log. Meal yang dilewati tetap dapat dicatat secara eksplisit. Update/delete memverifikasi ownership melalui profile dan baseline.

## Completeness

Satu atau lebih MealLog pada hari terkait memenuhi domain food sesuai `minimumDailyRequirement` development. Ini hanya ketersediaan catatan dan bukan penilaian kualitas makan.

## Consent

Write memerlukan consent `NUTRITION_DATA` aktif. Revocation memblokir create/update berikutnya; histori lama tetap dapat dibaca. Delete tetap diizinkan agar pengguna dapat mengoreksi/menghapus catatan miliknya.

## Batas

Tidak ada kalori, protein, karbohidrat, lemak, natrium, serat, porsi nutrition-authoritative, rekomendasi menu, Guided Meal engine, atau Flex Kitchen calculation. Kartu terkait tetap **Demo**.
