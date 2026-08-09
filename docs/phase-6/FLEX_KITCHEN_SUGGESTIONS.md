# Flex Kitchen Suggestions

`evaluateRecipeBalance()` adalah rule engine deterministik dengan reason codes: `ALLERGEN_WARNING`, `REDUCE_SODIUM`, `REDUCE_SUGAR`, `REDUCE_SATURATED_FAT`, `ADD_PROTEIN`, `ADD_FIBER`, `ENERGY_BELOW_TARGET`, `ENERGY_ABOVE_TARGET`, dan `NUTRIENT_DATA_INCOMPLETE`.

Prioritas: safety/allergen, upper-limit, minimum gaps, range fit, preference. Hanya tiga pesan teratas ditampilkan. Protein/fiber candidate dicari dari FoodItem category lalu disaring allergen; pemilihan bukan sekadar nutrient tertinggi. Pesan tidak mengandung diagnosis atau klaim penyembuhan.
