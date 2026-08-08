# Nutrient Registry

Phase 5 activates eight canonical nutrients:

| Code | Display | Unit | Output precision | Target use |
|---|---|---:|---:|---|
| `ENERGY_KCAL` | Energi | kcal | 0 | range |
| `PROTEIN_G` | Protein | g | 1 | minimum |
| `CARBOHYDRATE_G` | Karbohidrat | g | 1 | range |
| `FAT_G` | Lemak | g | 1 | range |
| `SATURATED_FAT_G` | Lemak jenuh | g | 1 | upper limit |
| `FIBER_G` | Serat | g | 1 | minimum |
| `SUGAR_G` | Gula | g | 1 | upper limit |
| `SODIUM_MG` | Natrium | mg | 0 | upper limit |

`NutrientDefinition` stores code, display name, unit, category, decimal precision, and active state. `FoodNutrient` references this registry and separately stores the amount and basis.

The registry prevents spelling-based joins and unit ambiguity. API and UI use the same shared codes. A missing registry entry cannot be silently accepted by the seed.

Precision is a presentation rule only. Snapshots retain unrounded calculation values in decimal database columns, while API summaries round once at the output boundary.

