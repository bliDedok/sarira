# Recipe Eligibility

Eligibility hanya dihitung server-side dan menghasilkan `ELIGIBLE`, `WARNING`, atau `INELIGIBLE`.

Hard reason codes: `ALLERGEN_MATCH`, `DIETARY_CONFLICT`, `SAFETY_RESTRICTION`, `AGE_RESTRICTION`, dan `MISSING_CRITICAL_NUTRITION_DATA`. `UNKNOWN_ALLERGEN_DATA` menghasilkan warning “Informasi alergen belum lengkap.”

Allergen match default ineligible. Vegetarian/vegan memerlukan tag VERIFIED pada seluruh bahan; HALAL hanya lolos jika `HALAL_VERIFIED`, bukan inferensi nama. Pork/alcohol tag menjadi conflict. Safety RED atau restriction Guided Meal memblokir plan baru. Target teen/healthy-aging tetap berasal dari policy Phase 5, tanpa energy formula duplikat.
