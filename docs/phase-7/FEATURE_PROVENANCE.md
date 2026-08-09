# Feature Provenance

| Sumber nyata | Feature terkait | Bentuk evidence reference |
|---|---|---|
| `MealLog` | frekuensi, regularitas, minuman manis, skipped meal | `MealLog:<id>` |
| `SleepLog` | durasi, variance, timing, perceived quality | `SleepLog:<id>` |
| `ActivityLog` | active days, menit, low-activity days | `ActivityLog:<id>` |
| `StepRecord` | average steps | `StepRecord:<id>` |
| `DailyCheckIn` | hunger, fullness, mood-meal co-occurrence | `DailyCheckIn:<id>` |
| Nutrition snapshots/targets | protein, fiber, sodium, sugar, energy, balance | snapshot source references |
| `DailyMealPlanItem` | plan adherence | persisted plan-item refs |
| personal `Recipe`/item snapshot | personal recipe usage | recipe/plan refs |
| daily completeness | missing-data ratio | `LocalDate:<date>` |

Provenance adalah pointer audit internal, bukan klaim kausal atau citation ilmiah. Repository memeriksa ownership profil sebelum membaca atau menyimpan. Jika consent optional nutrition, sleep, atau activity dicabut, kategori terkait dikeluarkan dari input analisis baru; hasil historis tetap immutable untuk audit.
