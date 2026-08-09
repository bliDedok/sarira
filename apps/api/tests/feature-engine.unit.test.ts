import { describe, expect, it } from 'vitest';
import { FEATURE_ENGINE_VERSION, generateFeatures, type FeatureEngineDay, type FeatureEngineInput } from '@sarira/feature-engine';

function completeInput(): FeatureEngineInput {
  return {
    periodStart: '2026-08-01', periodEnd: '2026-08-14', timezone: 'Asia/Makassar', totalDays: 14,
    days: Array.from({ length: 14 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      return {
        localDate: `2026-08-${day}`,
        checkIn: { id: `check-${day}`, mood: index % 3 === 0 ? 'LOW' : 'GOOD', hunger: 4, fullness: 3 },
        meals: [{ id: `meal-${day}`, mealType: 'BREAKFAST', eatenAt: `2026-08-${day}T07:00:00+08:00`, skipped: false, sugaryDrinkConsumed: index % 2 === 0 }],
        sleep: [{ id: `sleep-${day}`, sleepStartedAt: `2026-08-${day}T23:00:00+08:00`, durationMinutes: 390, perceivedQuality: 'FAIR' }],
        activities: [{ id: `activity-${day}`, durationMinutes: index % 2 === 0 ? 10 : 30 }],
        steps: { id: `steps-${day}`, steps: 5000 + index },
        nutrition: { localDate: `2026-08-${day}`, totals: { ENERGY_KCAL: 1600, PROTEIN_G: 40, FIBER_G: 12, SUGAR_G: index % 2 === 0 ? 60 : 20, SODIUM_MG: 1800 }, indicators: { ENERGY_KCAL: 'WITHIN_RANGE', PROTEIN_G: 'BELOW_MINIMUM', FIBER_G: 'BELOW_MINIMUM', SUGAR_G: index % 2 === 0 ? 'OVER_LIMIT' : 'WITHIN_LIMIT', SODIUM_MG: 'NEAR_LIMIT' }, itemCount: 1, sourceRefs: [`NutritionSnapshot:nutrition-${day}`] },
      };
    }),
    mealPlan: { plannedItems: 14, consumedItems: 7, evidenceRefs: ['DailyMealPlanItem:one'] },
    personalRecipeUsage: { count: 2, evidenceRefs: ['DailyMealPlanItem:personal'] },
  };
}

describe('Phase 7 Feature Engine', () => {
  it('menghasilkan registry versioned, provenance, dan nilai deterministik', () => {
    const input = completeInput();
    const first = generateFeatures(input);
    const reordered = generateFeatures({ ...input, days: [...input.days].reverse() });
    expect(first).toEqual(reordered);
    expect(first.version).toBe(FEATURE_ENGINE_VERSION);
    expect(Object.keys(first.features)).toHaveLength(25);
    expect(first.inputCompleteness).toBe(1);
    expect(first.features.breakfastFrequency.value).toBe(1);
    expect(first.features.sugaryDrinkDays.value).toBe(0.5);
    expect(first.features.proteinTargetCoverage.evidenceRefs[0]).toMatch(/^NutritionSnapshot:/);
    expect(first.features.averageSleepDuration.source).toEqual(['SleepLog']);
  });

  it('mempertahankan unknown sebagai null dan memisahkan coverage dari observed value', () => {
    const input = completeInput();
    const withoutNutrition: FeatureEngineInput = { ...input, days: input.days.map((day) => { const copy: FeatureEngineDay = { ...day }; delete copy.nutrition; return copy; }), mealPlan: { plannedItems: 0, consumedItems: 0, evidenceRefs: [] } };
    const output = generateFeatures(withoutNutrition);
    expect(output.features.proteinTargetCoverage).toMatchObject({ value: null, availability: 'INSUFFICIENT_DATA', coverage: { availableDays: 0, totalDays: 14, ratio: 0 } });
    expect(output.features.energyRangeFrequency.value).toBeNull();
    expect(output.features.mealPlanAdherence.value).toBeNull();
    expect(output.warnings).toContain('NUTRITION_DATA_UNAVAILABLE');
  });
});
