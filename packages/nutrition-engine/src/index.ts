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
export const MEAL_PLANNING_ENGINE_VERSION = 'meal-planning-dev-v1' as const;
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

export interface RemainingNutrient {
  nutrientCode: NutrientCode;
  type: TargetType;
  consumed: number | null;
  minimumRemaining?: number | null;
  maximumRemaining?: number | null;
}

export type RemainingNutrition = Record<NutrientCode, RemainingNutrient | undefined>;

/** Preserves minimum, range, and upper-limit semantics instead of treating every target as a minimum. */
export function calculateRemainingNutrition(intake: NutrientVector, targets: NutritionTarget[]): RemainingNutrition {
  return Object.fromEntries(nutrientCodes.map((code) => {
    const target = targets.find((item) => item.nutrientCode === code);
    if (!target) return [code, undefined];
    const consumed = intake[code];
    if (target.type === 'MINIMUM') return [code, { nutrientCode: code, type: target.type, consumed, minimumRemaining: consumed === null || target.minimum === undefined ? null : Math.max(0, target.minimum - consumed) }];
    if (target.type === 'RANGE') return [code, { nutrientCode: code, type: target.type, consumed, minimumRemaining: consumed === null || target.minimum === undefined ? null : Math.max(0, target.minimum - consumed), maximumRemaining: consumed === null || target.maximum === undefined ? null : Math.max(0, target.maximum - consumed) }];
    return [code, { nutrientCode: code, type: target.type, consumed, maximumRemaining: consumed === null || target.maximum === undefined ? null : Math.max(0, target.maximum - consumed) }];
  })) as RemainingNutrition;
}

export type RecipeEligibilityStatus = 'ELIGIBLE' | 'WARNING' | 'INELIGIBLE';

export interface RecipeEligibilityInput {
  matchedAllergens: string[];
  allergenDataComplete: boolean;
  dietaryConflicts: string[];
  safetyRestricted: boolean;
  ageRestricted: boolean;
  criticalNutritionMissing: boolean;
}

export function evaluateRecipeEligibility(input: RecipeEligibilityInput) {
  const hardReasons: string[] = [];
  if (input.matchedAllergens.length) hardReasons.push('ALLERGEN_MATCH');
  if (input.dietaryConflicts.length) hardReasons.push('DIETARY_CONFLICT');
  if (input.safetyRestricted) hardReasons.push('SAFETY_RESTRICTION');
  if (input.ageRestricted) hardReasons.push('AGE_RESTRICTION');
  if (input.criticalNutritionMissing) hardReasons.push('MISSING_CRITICAL_NUTRITION_DATA');
  if (hardReasons.length) return { status: 'INELIGIBLE' as const, reasonCodes: hardReasons };
  if (!input.allergenDataComplete) return { status: 'WARNING' as const, reasonCodes: ['UNKNOWN_ALLERGEN_DATA'] };
  return { status: 'ELIGIBLE' as const, reasonCodes: [] };
}

export interface CandidateScoringWeights {
  mealType: number;
  protein: number;
  fiber: number;
  upperLimits: number;
  time: number;
  cost: number;
  preference: number;
  dataQuality: number;
}

export interface CandidateScoringInput {
  nutrition: NutrientVector;
  remaining: RemainingNutrition;
  mealTypeMatch: boolean;
  timeMatch: boolean;
  costMatch: boolean;
  preferenceMatch: boolean;
  complete: boolean;
  weights: CandidateScoringWeights;
}

function contributionFit(amount: number | null, remaining: number | null | undefined) {
  if (amount === null || remaining === null || remaining === undefined) return 0;
  if (remaining === 0) return amount === 0 ? 1 : Math.max(0, 1 - amount / Math.max(1, amount));
  return Math.max(0, 1 - Math.abs(remaining - amount) / Math.max(remaining, amount, 1));
}

function upperLimitFit(amount: number | null, remaining: number | null | undefined) {
  if (amount === null || remaining === null || remaining === undefined) return 0;
  if (remaining === 0) return amount === 0 ? 1 : 0;
  return amount <= remaining ? 1 - amount / remaining * 0.2 : Math.max(0, 1 - (amount - remaining) / remaining);
}

export function scoreRecipeCandidate(input: CandidateScoringInput) {
  const protein = contributionFit(input.nutrition.PROTEIN_G, input.remaining.PROTEIN_G?.minimumRemaining);
  const fiber = contributionFit(input.nutrition.FIBER_G, input.remaining.FIBER_G?.minimumRemaining);
  const upperLimit = (upperLimitFit(input.nutrition.SODIUM_MG, input.remaining.SODIUM_MG?.maximumRemaining)
    + upperLimitFit(input.nutrition.SUGAR_G, input.remaining.SUGAR_G?.maximumRemaining)
    + upperLimitFit(input.nutrition.SATURATED_FAT_G, input.remaining.SATURATED_FAT_G?.maximumRemaining)) / 3;
  const raw = (input.mealTypeMatch ? input.weights.mealType : 0)
    + protein * input.weights.protein
    + fiber * input.weights.fiber
    + upperLimit * input.weights.upperLimits
    + (input.timeMatch ? input.weights.time : 0)
    + (input.costMatch ? input.weights.cost : 0)
    + (input.preferenceMatch ? input.weights.preference : 0)
    + (input.complete ? input.weights.dataQuality : 0);
  const totalWeight = Object.values(input.weights).reduce((sum, value) => sum + value, 0);
  const score = totalWeight === 0 ? 0 : Math.round(raw / totalWeight * 1000) / 10;
  const reasonCodes = [
    ...(protein >= 0.55 ? ['HIGH_PROTEIN_FIT'] : []),
    ...(fiber >= 0.55 ? ['FIBER_SUPPORT'] : []),
    ...(upperLimit >= 0.8 ? ['LOWER_LIMIT_FIT'] : []),
    ...(input.timeMatch ? ['TIME_MATCH'] : []),
    ...(input.preferenceMatch ? ['PREFERENCE_MATCH'] : []),
  ];
  return { score, fit: score >= 75 ? 'HIGH' as const : score >= 50 ? 'MEDIUM' as const : 'LOW' as const, reasonCodes };
}

export type RecipeBalanceReason = 'ALLERGEN_WARNING' | 'REDUCE_SODIUM' | 'REDUCE_SUGAR' | 'REDUCE_SATURATED_FAT' | 'ADD_PROTEIN' | 'ADD_FIBER' | 'ENERGY_BELOW_TARGET' | 'ENERGY_ABOVE_TARGET' | 'NUTRIENT_DATA_INCOMPLETE';

export function evaluateRecipeBalance(nutrition: NutrientVector, remaining: RemainingNutrition, allergenWarning = false) {
  const suggestions: Array<{ reasonCode: RecipeBalanceReason; priority: number; message: string }> = [];
  if (allergenWarning) suggestions.push({ reasonCode: 'ALLERGEN_WARNING', priority: 1, message: 'Periksa kembali bahan karena ada informasi alergen yang perlu diperhatikan.' });
  if (nutrition.SODIUM_MG !== null && remaining.SODIUM_MG?.maximumRemaining !== null && remaining.SODIUM_MG?.maximumRemaining !== undefined && nutrition.SODIUM_MG > remaining.SODIUM_MG.maximumRemaining * 0.8) suggestions.push({ reasonCode: 'REDUCE_SODIUM', priority: 2, message: 'Pertimbangkan mengurangi bahan penyumbang natrium atau memilih alternatif yang lebih rendah natrium.' });
  if (nutrition.SUGAR_G !== null && remaining.SUGAR_G?.maximumRemaining !== null && remaining.SUGAR_G?.maximumRemaining !== undefined && nutrition.SUGAR_G > remaining.SUGAR_G.maximumRemaining * 0.8) suggestions.push({ reasonCode: 'REDUCE_SUGAR', priority: 2, message: 'Porsi ini mendekati sisa batas gula yang digunakan hari ini.' });
  if (nutrition.SATURATED_FAT_G !== null && remaining.SATURATED_FAT_G?.maximumRemaining !== null && remaining.SATURATED_FAT_G?.maximumRemaining !== undefined && nutrition.SATURATED_FAT_G > remaining.SATURATED_FAT_G.maximumRemaining * 0.8) suggestions.push({ reasonCode: 'REDUCE_SATURATED_FAT', priority: 2, message: 'Porsi ini mendekati sisa batas lemak jenuh yang digunakan hari ini.' });
  if (contributionFit(nutrition.PROTEIN_G, remaining.PROTEIN_G?.minimumRemaining) < 0.45) suggestions.push({ reasonCode: 'ADD_PROTEIN', priority: 3, message: 'Tambahkan bahan sumber protein yang sesuai alergi dan preferensi makan.' });
  if (contributionFit(nutrition.FIBER_G, remaining.FIBER_G?.minimumRemaining) < 0.45) suggestions.push({ reasonCode: 'ADD_FIBER', priority: 3, message: 'Tambahkan sayur, buah, atau biji-bijian dari database yang sesuai.' });
  if (nutrition.ENERGY_KCAL !== null && remaining.ENERGY_KCAL?.minimumRemaining !== null && remaining.ENERGY_KCAL?.minimumRemaining !== undefined && nutrition.ENERGY_KCAL < remaining.ENERGY_KCAL.minimumRemaining * 0.5) suggestions.push({ reasonCode: 'ENERGY_BELOW_TARGET', priority: 4, message: 'Energi resep masih rendah dibanding sisa kisaran hari ini.' });
  if (nutrition.ENERGY_KCAL !== null && remaining.ENERGY_KCAL?.maximumRemaining !== null && remaining.ENERGY_KCAL?.maximumRemaining !== undefined && nutrition.ENERGY_KCAL > remaining.ENERGY_KCAL.maximumRemaining) suggestions.push({ reasonCode: 'ENERGY_ABOVE_TARGET', priority: 4, message: 'Energi resep melampaui sisa kisaran hari ini.' });
  if (nutrientCodes.some((code) => nutrition[code] === null)) suggestions.push({ reasonCode: 'NUTRIENT_DATA_INCOMPLETE', priority: 2, message: 'Sebagian data nutrisi belum tersedia; nilai yang tidak diketahui tidak dianggap nol.' });
  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}

export function scaleNutrition(nutrition: NutrientVector, factor: number): NutrientVector {
  assertFinitePositive(factor, 'Faktor porsi');
  return Object.fromEntries(nutrientCodes.map((code) => [code, nutrition[code] === null ? null : nutrition[code]! * factor])) as NutrientVector;
}

export function nutritionDifference(before: NutrientVector, after: NutrientVector): NutrientVector {
  return Object.fromEntries(nutrientCodes.map((code) => [code, before[code] === null || after[code] === null ? null : after[code]! - before[code]!])) as NutrientVector;
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
