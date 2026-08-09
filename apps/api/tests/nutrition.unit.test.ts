import { describe, expect, it } from 'vitest';
import {
  aggregateNutrition,
  calculateFoodNutrition,
  calculateRecipeNutrition,
  emptyNutrients,
  indicatorFor,
  roundNutrient,
  servingToGrams,
} from '@sarira/nutrition-engine';
import { createMemoryNutritionRepository } from '../src/repositories/nutrition-memory';
import { allergenWarnings } from '../src/domains/nutrition/service';

describe('Phase 5 nutrition engine', () => {
  it('mengonversi serving khusus food ke gram', () => { expect(servingToGrams(2, 55)).toBe(110); expect(() => servingToGrams(1, null)).toThrow(/belum tersedia/i); });
  it('menghitung nutrisi berdasarkan gram tanpa pembulatan dini', () => {
    const value = calculateFoodNutrition([{ nutrientCode: 'PROTEIN_G', amount: 13, basisAmount: 100, basisUnit: 'G' }], 55);
    expect(value.nutrients.PROTEIN_G).toBeCloseTo(7.15); expect(value.nutrients.SODIUM_MG).toBeNull();
  });
  it('membedakan unknown dari zero saat agregasi', () => {
    const known = { ...emptyNutrients(), ENERGY_KCAL: 0, SODIUM_MG: 0 }; const unknown = { ...emptyNutrients(), ENERGY_KCAL: 100 };
    const result = aggregateNutrition([known, unknown]); expect(result.ENERGY_KCAL).toBe(100); expect(result.SODIUM_MG).toBeNull();
  });
  it('menghitung resep dan per serving secara deterministic', () => {
    const ingredient = { ...emptyNutrients(), ENERGY_KCAL: 400, PROTEIN_G: 20 };
    const value = calculateRecipeNutrition([ingredient], 4); expect(value.perServing.ENERGY_KCAL).toBe(100); expect(value.perServing.PROTEIN_G).toBe(5);
  });
  it('menghasilkan state minimum, range, dan upper limit', () => {
    expect(indicatorFor(48, { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: 60, unit: 'g' }).status).toBe('BELOW_MINIMUM');
    expect(indicatorFor(1900, { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: 1800, maximum: 2100, unit: 'kcal' }).status).toBe('WITHIN_RANGE');
    expect(indicatorFor(1700, { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }).status).toBe('NEAR_LIMIT');
    expect(indicatorFor(null, { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }).status).toBe('UNAVAILABLE');
  });
  it('menerapkan rounding hanya pada output', () => { expect(roundNutrient('ENERGY_KCAL', 72.6)).toBe(73); expect(roundNutrient('PROTEIN_G', 7.149)).toBe(7.1); expect(roundNutrient('SODIUM_MG', null)).toBeNull(); });
  it('menghasilkan warning allergen match dan unknown metadata', async () => {
    const repository = createMemoryNutritionRepository(); const result = await repository.searchFoods({ query: 'telur', page: 1, pageSize: 5 });
    const food = await repository.getFood(result.items[0]!.id); expect(food).not.toBeNull();
    expect(allergenWarnings(food!, 'Saya alergi telur')[0]).toMatchObject({ code: 'EGG', matchedProfile: true, verified: false });
    const rice = await repository.searchFoods({ query: 'nasi putih', page: 1, pageSize: 5 }); const riceFood = await repository.getFood(rice.items[0]!.id);
    expect(allergenWarnings(riceFood!, '')[0]?.label).toMatch(/belum lengkap/i);
  });
});
