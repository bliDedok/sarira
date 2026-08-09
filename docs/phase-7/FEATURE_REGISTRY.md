# Feature Registry

Semua feature bernilai angka atau `null`, dengan coverage dan provenance per feature.

| Kelompok | Feature |
|---|---|
| Makan | `breakfastFrequency`, `mealRegularity`, `averageMealCount`, `sugaryDrinkDays`, `skippedMealFrequency` |
| Tidur | `averageSleepDuration`, `sleepDurationVariance`, `sleepTimingVariance`, `perceivedSleepQuality` |
| Aktivitas | `activeDays`, `averageActivityMinutes`, `averageSteps`, `lowActivityDays` |
| Check-in/konteks | `hungerAverage`, `fullnessAverage`, `lowMoodMealAssociationDays` |
| Nutrition Engine | `proteinTargetCoverage`, `fiberTargetCoverage`, `sodiumLimitFrequency`, `sugarUpperLimitFrequency`, `energyRangeFrequency`, `mealBalanceCoverage` |
| Meal planning | `mealPlanAdherence`, `personalRecipeUsage` |
| Kualitas input | `missingDataRatio` |

Ratio memakai rentang 0–1. Durasi tidur memakai jam, aktivitas memakai menit, langkah memakai langkah/hari, hunger/fullness memakai skala input Phase 4. Variance adalah population variance; `sleepTimingVariance` adalah circular variance agar waktu dekat tengah malam tidak terlihat jauh. Indikator nutrition menggunakan status snapshot Phase 5 dan tidak menghitung nutrien ulang.
