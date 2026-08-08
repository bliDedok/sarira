export const nutrientCodes = [
  'ENERGY_KCAL',
  'PROTEIN_G',
  'CARBOHYDRATE_G',
  'FAT_G',
  'SATURATED_FAT_G',
  'FIBER_G',
  'SUGAR_G',
  'SODIUM_MG',
] as const;

export type NutrientCode = (typeof nutrientCodes)[number];
export type NutrientVector = Record<NutrientCode, number | null>;
export type TargetType = 'MINIMUM' | 'RANGE' | 'UPPER_LIMIT';

export interface FoodNutrientInput {
  nutrientCode: NutrientCode;
  amount: number;
  basisAmount: number;
  basisUnit: 'G';
}

export interface NutritionCalculation {
  gramAmount: number;
  nutrients: NutrientVector;
  missingNutrients: NutrientCode[];
  complete: boolean;
  calculationVersion: string;
}

export interface NutritionTarget {
  nutrientCode: NutrientCode;
  type: TargetType;
  minimum?: number;
  target?: number;
  maximum?: number;
  unit: 'kcal' | 'g' | 'mg';
}

export type IndicatorStatus =
  | 'UNAVAILABLE'
  | 'BELOW_MINIMUM'
  | 'MINIMUM_MET'
  | 'BELOW_RANGE'
  | 'WITHIN_RANGE'
  | 'ABOVE_RANGE'
  | 'WITHIN_LIMIT'
  | 'NEAR_LIMIT'
  | 'OVER_LIMIT';

export interface NutritionIndicatorResult {
  nutrientCode: NutrientCode;
  type: TargetType;
  amount: number | null;
  status: IndicatorStatus;
  label: string;
  target: NutritionTarget;
}

export const NUTRITION_ENGINE_VERSION = 'phase5-dev-v1' as const;
export const NUTRITION_VALIDATION_STATUS = 'REQUIRES_PRODUCT_EXPERT_VALIDATION' as const;
export const NEAR_LIMIT_RATIO = 0.8;

export const emptyNutrients = (): NutrientVector => Object.fromEntries(nutrientCodes.map((code) => [code, null])) as NutrientVector;

function assertFinitePositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} harus lebih dari 0.`);
}

export function calculateFoodNutrition(nutrients: FoodNutrientInput[], gramAmount: number): NutritionCalculation {
  assertFinitePositive(gramAmount, 'Gram makanan');
  const values = emptyNutrients();
  for (const nutrient of nutrients) {
    assertFinitePositive(nutrient.basisAmount, 'Basis nutrisi');
    if (!Number.isFinite(nutrient.amount) || nutrient.amount < 0) throw new Error('Nilai nutrisi tidak valid.');
    values[nutrient.nutrientCode] = nutrient.amount * gramAmount / nutrient.basisAmount;
  }
  const missingNutrients = nutrientCodes.filter((code) => values[code] === null);
  return { gramAmount, nutrients: values, missingNutrients, complete: missingNutrients.length === 0, calculationVersion: NUTRITION_ENGINE_VERSION };
}

export function servingToGrams(quantity: number, gramEquivalent: number | null | undefined) {
  assertFinitePositive(quantity, 'Jumlah porsi');
  if (gramEquivalent === null || gramEquivalent === undefined) throw new Error('Konversi gram untuk porsi ini belum tersedia.');
  assertFinitePositive(gramEquivalent, 'Konversi gram');
  return quantity * gramEquivalent;
}

export function aggregateNutrition(inputs: NutrientVector[]): NutrientVector {
  const result = emptyNutrients();
  for (const code of nutrientCodes) {
    const values = inputs.map((input) => input[code]);
    result[code] = values.length === 0 || values.some((value) => value === null)
      ? null
      : (values as number[]).reduce((sum, value) => sum + value, 0);
  }
  return result;
}

export const calculateMealNutrition = aggregateNutrition;
export const calculateDailyNutrition = aggregateNutrition;

export function calculateRecipeNutrition(ingredients: NutrientVector[], servings: number) {
  assertFinitePositive(servings, 'Jumlah porsi resep');
  const total = aggregateNutrition(ingredients);
  return {
    total,
    perServing: Object.fromEntries(nutrientCodes.map((code) => [code, total[code] === null ? null : total[code]! / servings])) as NutrientVector,
  };
}

export function indicatorFor(amount: number | null, target: NutritionTarget, nearLimitRatio = NEAR_LIMIT_RATIO): NutritionIndicatorResult {
  if (amount === null) return { nutrientCode: target.nutrientCode, type: target.type, amount, status: 'UNAVAILABLE', label: 'Data belum tersedia.', target };
  if (target.type === 'MINIMUM') {
    if (target.minimum === undefined) throw new Error('Target minimum tidak lengkap.');
    return amount >= target.minimum
      ? { nutrientCode: target.nutrientCode, type: target.type, amount, status: 'MINIMUM_MET', label: 'Target minimum hari ini sudah terpenuhi.', target }
      : { nutrientCode: target.nutrientCode, type: target.type, amount, status: 'BELOW_MINIMUM', label: 'Masih perlu dilengkapi.', target };
  }
  if (target.type === 'RANGE') {
    if (target.minimum === undefined || target.maximum === undefined) throw new Error('Target rentang tidak lengkap.');
    const status = amount < target.minimum ? 'BELOW_RANGE' : amount > target.maximum ? 'ABOVE_RANGE' : 'WITHIN_RANGE';
    const label = status === 'BELOW_RANGE' ? 'Masih di bawah kisaran.' : status === 'ABOVE_RANGE' ? 'Sudah melewati kisaran.' : 'Berada dalam kisaran.';
    return { nutrientCode: target.nutrientCode, type: target.type, amount, status, label, target };
  }
  if (target.maximum === undefined) throw new Error('Batas atas tidak lengkap.');
  const status = amount > target.maximum ? 'OVER_LIMIT' : amount >= target.maximum * nearLimitRatio ? 'NEAR_LIMIT' : 'WITHIN_LIMIT';
  const label = status === 'OVER_LIMIT' ? 'Sudah melewati batas harian yang digunakan dalam program ini.' : status === 'NEAR_LIMIT' ? 'Mendekati batas harian.' : 'Masih dalam batas harian.';
  return { nutrientCode: target.nutrientCode, type: target.type, amount, status, label, target };
}

export function roundNutrient(code: NutrientCode, value: number | null): number | null {
  if (value === null) return null;
  const precision = code.endsWith('_MG') || code === 'ENERGY_KCAL' ? 0 : 1;
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export { DEVELOPMENT_FOODS, DEVELOPMENT_POLICIES, DEVELOPMENT_SOURCE } from './development-data';
