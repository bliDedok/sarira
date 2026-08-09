import { describe, expect, it } from 'vitest';
import {
  calculateRemainingNutrition,
  emptyNutrients,
  evaluateRecipeBalance,
  evaluateRecipeEligibility,
  nutritionDifference,
  scaleNutrition,
  scoreRecipeCandidate,
} from '@sarira/nutrition-engine';

const targets = [
  { nutrientCode: 'ENERGY_KCAL' as const, type: 'RANGE' as const, minimum: 1800, maximum: 2200, unit: 'kcal' as const },
  { nutrientCode: 'PROTEIN_G' as const, type: 'MINIMUM' as const, minimum: 60, unit: 'g' as const },
  { nutrientCode: 'FIBER_G' as const, type: 'MINIMUM' as const, minimum: 28, unit: 'g' as const },
  { nutrientCode: 'SODIUM_MG' as const, type: 'UPPER_LIMIT' as const, maximum: 2000, unit: 'mg' as const },
  { nutrientCode: 'SUGAR_G' as const, type: 'UPPER_LIMIT' as const, maximum: 50, unit: 'g' as const },
  { nutrientCode: 'SATURATED_FAT_G' as const, type: 'UPPER_LIMIT' as const, maximum: 20, unit: 'g' as const },
];

const weights = { mealType: 20, protein: 18, fiber: 12, upperLimits: 20, time: 8, cost: 5, preference: 7, dataQuality: 10 };

describe('Phase 6 deterministic meal planning engine', () => {
  it('membedakan remaining requirement, range, dan upper limit', () => {
    const remaining = calculateRemainingNutrition({ ...emptyNutrients(), ENERGY_KCAL: 500, PROTEIN_G: 20, FIBER_G: 4, SODIUM_MG: 600, SUGAR_G: 10, SATURATED_FAT_G: 5 }, targets);
    expect(remaining.ENERGY_KCAL).toMatchObject({ type: 'RANGE', minimumRemaining: 1300, maximumRemaining: 1700 });
    expect(remaining.PROTEIN_G).toMatchObject({ type: 'MINIMUM', minimumRemaining: 40 });
    expect(remaining.SODIUM_MG).toMatchObject({ type: 'UPPER_LIMIT', maximumRemaining: 1400 });
    expect(remaining.SODIUM_MG?.minimumRemaining).toBeUndefined();
  });

  it('mempertahankan unknown dan tidak mengubahnya menjadi nol', () => {
    const remaining = calculateRemainingNutrition(emptyNutrients(), targets);
    expect(remaining.PROTEIN_G?.minimumRemaining).toBeNull(); expect(remaining.SODIUM_MG?.maximumRemaining).toBeNull();
  });

  it('hard constraint tidak dapat dikalahkan score', () => {
    expect(evaluateRecipeEligibility({ matchedAllergens: ['EGG'], allergenDataComplete: true, dietaryConflicts: [], safetyRestricted: false, ageRestricted: false, criticalNutritionMissing: false })).toEqual({ status: 'INELIGIBLE', reasonCodes: ['ALLERGEN_MATCH'] });
    expect(evaluateRecipeEligibility({ matchedAllergens: [], allergenDataComplete: true, dietaryConflicts: [], safetyRestricted: true, ageRestricted: false, criticalNutritionMissing: false }).status).toBe('INELIGIBLE');
  });

  it('unknown allergen menghasilkan warning, bukan klaim aman', () => {
    expect(evaluateRecipeEligibility({ matchedAllergens: [], allergenDataComplete: false, dietaryConflicts: [], safetyRestricted: false, ageRestricted: false, criticalNutritionMissing: false })).toEqual({ status: 'WARNING', reasonCodes: ['UNKNOWN_ALLERGEN_DATA'] });
  });

  it('critical nutrient missing membuat recipe ineligible', () => {
    expect(evaluateRecipeEligibility({ matchedAllergens: [], allergenDataComplete: true, dietaryConflicts: [], safetyRestricted: false, ageRestricted: false, criticalNutritionMissing: true }).reasonCodes).toContain('MISSING_CRITICAL_NUTRITION_DATA');
  });

  it('soft scoring deterministic dan reason code dapat dijelaskan', () => {
    const remaining = calculateRemainingNutrition({ ...emptyNutrients(), ENERGY_KCAL: 1500, PROTEIN_G: 45, FIBER_G: 23, SODIUM_MG: 1500, SUGAR_G: 30, SATURATED_FAT_G: 10 }, targets);
    const input = { nutrition: { ...emptyNutrients(), ENERGY_KCAL: 400, PROTEIN_G: 15, FIBER_G: 5, SODIUM_MG: 250, SUGAR_G: 5, SATURATED_FAT_G: 3 }, remaining, mealTypeMatch: true, timeMatch: true, costMatch: true, preferenceMatch: false, complete: true, weights };
    expect(scoreRecipeCandidate(input)).toEqual(scoreRecipeCandidate(input)); expect(scoreRecipeCandidate(input).reasonCodes).toContain('HIGH_PROTEIN_FIT');
  });

  it('candidate yang melewati sisa batas sodium mendapat score lebih rendah', () => {
    const remaining = calculateRemainingNutrition({ ...emptyNutrients(), PROTEIN_G: 50, FIBER_G: 24, SODIUM_MG: 1900, SUGAR_G: 45, SATURATED_FAT_G: 17 }, targets);
    const base = { ...emptyNutrients(), ENERGY_KCAL: 300, PROTEIN_G: 10, FIBER_G: 4, SUGAR_G: 2, SATURATED_FAT_G: 1 };
    const shared = { remaining, mealTypeMatch: true, timeMatch: true, costMatch: true, preferenceMatch: false, complete: true, weights };
    expect(scoreRecipeCandidate({ ...shared, nutrition: { ...base, SODIUM_MG: 50 } }).score).toBeGreaterThan(scoreRecipeCandidate({ ...shared, nutrition: { ...base, SODIUM_MG: 500 } }).score);
  });

  it('suggestion priority maksimal tiga dan mendahulukan upper-limit', () => {
    const remaining = calculateRemainingNutrition({ ...emptyNutrients(), PROTEIN_G: 0, FIBER_G: 0, SODIUM_MG: 1900, SUGAR_G: 45, SATURATED_FAT_G: 18 }, targets);
    const suggestions = evaluateRecipeBalance({ ...emptyNutrients(), ENERGY_KCAL: 100, PROTEIN_G: 1, FIBER_G: 0, SODIUM_MG: 200, SUGAR_G: 10, SATURATED_FAT_G: 5 }, remaining);
    expect(suggestions).toHaveLength(3); expect(suggestions[0]?.priority).toBe(2); expect(suggestions.map((item) => item.reasonCode)).toContain('REDUCE_SODIUM');
  });

  it('scale consumption 25% dan difference substitution menjaga unknown', () => {
    const value = { ...emptyNutrients(), ENERGY_KCAL: 400, PROTEIN_G: 20 };
    expect(scaleNutrition(value, 0.25).ENERGY_KCAL).toBe(100);
    expect(nutritionDifference(value, { ...value, ENERGY_KCAL: 350 }).ENERGY_KCAL).toBe(-50);
    expect(nutritionDifference(value, { ...value, SODIUM_MG: 2 }).SODIUM_MG).toBeNull();
  });
});
