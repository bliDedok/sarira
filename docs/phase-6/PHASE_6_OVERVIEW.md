# Phase 6 Overview

Phase 6 menjadikan Guided Meal dan Flex Kitchen fitur nyata tanpa AI/LLM/RAG. Keduanya memakai `@sarira/nutrition-engine` Phase 5 sebagai satu-satunya kalkulator nutrisi. Ruang lingkup mencakup resep versioned, snapshot nutrisi, daily meal plan, replacement, cooking, konsumsi parsial, personal recipe, substitusi, API, UI, dan audit.

Alur utama: profil + consent + safety + target + intake → remaining nutrition → hard filtering → soft scoring versioned → meal plan snapshot. Flex Kitchen memakai food, serving, dan kalkulasi yang sama. Phase 7, diagnosis, inventory kompleks, harga real-time, kamera, wearable, serta rekomendasi berbasis model tidak diimplementasikan.

Semua recipe development berstatus `SYNTHETIC_DEVELOPMENT`, `verified=false`, dan `requiresExpertValidation=true`.
