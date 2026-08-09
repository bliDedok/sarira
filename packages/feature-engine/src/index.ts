import type { AnalysisFeatureKey, AnalysisFeatureSet, AnalysisFeatureValue, NutrientCode } from '@sarira/shared-types';

export const FEATURE_ENGINE_VERSION = 'phase7-feature-dev-v1' as const;

export interface FeatureEngineNutritionDay {
  localDate: string;
  totals: Partial<Record<NutrientCode, number | null>>;
  indicators: Partial<Record<NutrientCode, string>>;
  itemCount: number;
  sourceRefs: string[];
}

export interface FeatureEngineDay {
  localDate: string;
  checkIn?: { id: string; mood: string; hunger: number; fullness: number };
  meals: Array<{ id: string; mealType: string; eatenAt?: string; skipped: boolean; sugaryDrinkConsumed?: boolean; eatingContext?: string }>;
  sleep: Array<{ id: string; sleepStartedAt: string; durationMinutes: number; perceivedQuality: string }>;
  activities: Array<{ id: string; durationMinutes: number }>;
  steps?: { id: string; steps: number };
  nutrition?: FeatureEngineNutritionDay;
}

export interface FeatureEngineInput {
  periodStart: string;
  periodEnd: string;
  timezone: string;
  totalDays: number;
  days: FeatureEngineDay[];
  mealPlan: { plannedItems: number; consumedItems: number; evidenceRefs: string[] };
  personalRecipeUsage: { count: number; evidenceRefs: string[] };
}

export interface FeatureEngineOutput {
  version: typeof FEATURE_ENGINE_VERSION;
  inputCompleteness: number;
  features: AnalysisFeatureSet;
  missingFeatures: AnalysisFeatureKey[];
  warnings: string[];
}

const ratio = (value: number, total: number) => total === 0 ? 0 : Math.round(value / total * 10_000) / 10_000;
const average = (values: number[]) => values.length === 0 ? null : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100;
const variance = (values: number[]) => {
  const mean = average(values);
  if (mean === null || values.length < 2) return null;
  return Math.round(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length * 100) / 100;
};
const circularVarianceMinutes = (values: number[]) => {
  if (values.length < 2) return null;
  const radians = values.map((value) => value / 1440 * Math.PI * 2);
  const x = radians.reduce((sum, value) => sum + Math.cos(value), 0) / values.length;
  const y = radians.reduce((sum, value) => sum + Math.sin(value), 0) / values.length;
  return Math.round((1 - Math.sqrt(x ** 2 + y ** 2)) * 10_000) / 10_000;
};
const localMinute = (iso: string, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso));
  return Number(parts.find((part) => part.type === 'hour')?.value ?? 0) * 60 + Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
};

function feature(value: number | null, availableDays: number, totalDays: number, source: string[], evidenceRefs: string[]): AnalysisFeatureValue {
  return { value, availability: value === null ? 'INSUFFICIENT_DATA' : 'AVAILABLE', coverage: { availableDays, totalDays, ratio: ratio(availableDays, totalDays) }, source, evidenceRefs };
}

export function generateFeatures(input: FeatureEngineInput): FeatureEngineOutput {
  const days = [...input.days].sort((a, b) => a.localDate.localeCompare(b.localDate));
  const mealDays = days.filter((day) => day.meals.length > 0);
  const actualMeals = days.flatMap((day) => day.meals.filter((meal) => !meal.skipped));
  const breakfastDays = days.filter((day) => day.meals.some((meal) => meal.mealType === 'BREAKFAST' && !meal.skipped));
  const mealCounts = mealDays.map((day) => day.meals.filter((meal) => !meal.skipped).length);
  const sleepLogs = days.flatMap((day) => day.sleep);
  const activityDays = days.filter((day) => day.activities.some((activity) => activity.durationMinutes > 0));
  const activityMinutes = days.filter((day) => day.activities.length > 0).map((day) => day.activities.reduce((sum, item) => sum + item.durationMinutes, 0));
  const stepDays = days.filter((day) => day.steps !== undefined);
  const checkInDays = days.filter((day) => day.checkIn !== undefined);
  const nutritionDays = days.filter((day) => day.nutrition && day.nutrition.itemCount > 0);
  const nutritionRefs = nutritionDays.flatMap((day) => day.nutrition?.sourceRefs ?? []);
  const targetCoverage = (code: NutrientCode, accepted: string[]) => nutritionDays.filter((day) => accepted.includes(day.nutrition?.indicators[code] ?? '')).length;
  const nutritionAvailable = (code: NutrientCode) => nutritionDays.filter((day) => day.nutrition?.totals[code] !== null && day.nutrition?.totals[code] !== undefined).length;
  const lowMoodMealDays = days.filter((day) => day.checkIn && ['VERY_LOW', 'LOW'].includes(day.checkIn.mood) && day.meals.some((meal) => !meal.skipped));
  const mealEvidence = actualMeals.map((meal) => `MealLog:${meal.id}`);
  const sleepEvidence = sleepLogs.map((sleep) => `SleepLog:${sleep.id}`);
  const activityEvidence = activityDays.flatMap((day) => day.activities.map((activity) => `ActivityLog:${activity.id}`));
  const checkInEvidence = checkInDays.map((day) => `DailyCheckIn:${day.checkIn!.id}`);
  const stepsEvidence = stepDays.map((day) => `StepRecord:${day.steps!.id}`);
  const mealRegularityValue = mealCounts.length < 2 ? null : Math.max(0, Math.round((1 - Math.min(1, Math.sqrt(variance(mealCounts) ?? 0) / 2)) * 10_000) / 10_000);
  const features: AnalysisFeatureSet = {
    breakfastFrequency: feature(ratio(breakfastDays.length, input.totalDays), mealDays.length, input.totalDays, ['MealLog'], mealEvidence),
    mealRegularity: feature(mealRegularityValue, mealDays.length, input.totalDays, ['MealLog'], mealEvidence),
    averageMealCount: feature(average(mealCounts), mealDays.length, input.totalDays, ['MealLog'], mealEvidence),
    sugaryDrinkDays: feature(ratio(days.filter((day) => day.meals.some((meal) => meal.sugaryDrinkConsumed === true)).length, input.totalDays), mealDays.length, input.totalDays, ['MealLog'], mealEvidence),
    averageSleepDuration: feature(average(sleepLogs.map((sleep) => sleep.durationMinutes / 60)), sleepLogs.length, input.totalDays, ['SleepLog'], sleepEvidence),
    sleepDurationVariance: feature(variance(sleepLogs.map((sleep) => sleep.durationMinutes / 60)), sleepLogs.length, input.totalDays, ['SleepLog'], sleepEvidence),
    sleepTimingVariance: feature(circularVarianceMinutes(sleepLogs.map((sleep) => localMinute(sleep.sleepStartedAt, input.timezone))), sleepLogs.length, input.totalDays, ['SleepLog'], sleepEvidence),
    perceivedSleepQuality: feature(average(sleepLogs.map((sleep) => ({ POOR: 1, FAIR: 2, GOOD: 3, VERY_GOOD: 4 }[sleep.perceivedQuality] ?? 0))), sleepLogs.length, input.totalDays, ['SleepLog'], sleepEvidence),
    activeDays: feature(ratio(activityDays.length, input.totalDays), days.filter((day) => day.activities.length > 0).length, input.totalDays, ['ActivityLog'], activityEvidence),
    averageActivityMinutes: feature(average(activityMinutes), activityMinutes.length, input.totalDays, ['ActivityLog'], activityEvidence),
    averageSteps: feature(average(stepDays.map((day) => day.steps!.steps)), stepDays.length, input.totalDays, ['StepRecord'], stepsEvidence),
    lowActivityDays: feature(ratio(activityMinutes.filter((minutes) => minutes < 20).length, input.totalDays), activityMinutes.length, input.totalDays, ['ActivityLog'], activityEvidence),
    hungerAverage: feature(average(checkInDays.map((day) => day.checkIn!.hunger)), checkInDays.length, input.totalDays, ['DailyCheckIn'], checkInEvidence),
    fullnessAverage: feature(average(checkInDays.map((day) => day.checkIn!.fullness)), checkInDays.length, input.totalDays, ['DailyCheckIn'], checkInEvidence),
    lowMoodMealAssociationDays: feature(ratio(lowMoodMealDays.length, input.totalDays), days.filter((day) => day.checkIn && day.meals.length > 0).length, input.totalDays, ['DailyCheckIn', 'MealLog'], [...checkInEvidence, ...mealEvidence]),
    proteinTargetCoverage: feature(nutritionAvailable('PROTEIN_G') === 0 ? null : ratio(targetCoverage('PROTEIN_G', ['MINIMUM_MET']), nutritionAvailable('PROTEIN_G')), nutritionAvailable('PROTEIN_G'), input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    fiberTargetCoverage: feature(nutritionAvailable('FIBER_G') === 0 ? null : ratio(targetCoverage('FIBER_G', ['MINIMUM_MET']), nutritionAvailable('FIBER_G')), nutritionAvailable('FIBER_G'), input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    sodiumLimitFrequency: feature(nutritionAvailable('SODIUM_MG') === 0 ? null : ratio(targetCoverage('SODIUM_MG', ['NEAR_LIMIT', 'OVER_LIMIT']), nutritionAvailable('SODIUM_MG')), nutritionAvailable('SODIUM_MG'), input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    sugarUpperLimitFrequency: feature(nutritionAvailable('SUGAR_G') === 0 ? null : ratio(targetCoverage('SUGAR_G', ['NEAR_LIMIT', 'OVER_LIMIT']), nutritionAvailable('SUGAR_G')), nutritionAvailable('SUGAR_G'), input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    energyRangeFrequency: feature(nutritionAvailable('ENERGY_KCAL') === 0 ? null : ratio(targetCoverage('ENERGY_KCAL', ['WITHIN_RANGE']), nutritionAvailable('ENERGY_KCAL')), nutritionAvailable('ENERGY_KCAL'), input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    mealBalanceCoverage: feature(nutritionDays.length === 0 ? null : ratio(nutritionDays.filter((day) => ['MINIMUM_MET'].includes(day.nutrition?.indicators.PROTEIN_G ?? '') && ['MINIMUM_MET'].includes(day.nutrition?.indicators.FIBER_G ?? '')).length, nutritionDays.length), nutritionDays.length, input.totalDays, ['NutritionSnapshot', 'NutritionTargetProfile'], nutritionRefs),
    skippedMealFrequency: feature(ratio(days.filter((day) => day.meals.some((meal) => meal.skipped)).length, input.totalDays), mealDays.length, input.totalDays, ['MealLog'], mealEvidence),
    mealPlanAdherence: feature(input.mealPlan.plannedItems === 0 ? null : ratio(input.mealPlan.consumedItems, input.mealPlan.plannedItems), input.mealPlan.plannedItems > 0 ? Math.min(input.totalDays, 1) : 0, input.totalDays, ['DailyMealPlanItem'], input.mealPlan.evidenceRefs),
    personalRecipeUsage: feature(input.personalRecipeUsage.count, input.personalRecipeUsage.count > 0 ? 1 : 0, input.totalDays, ['Recipe', 'MealPlanItemSnapshot'], input.personalRecipeUsage.evidenceRefs),
    missingDataRatio: feature(ratio(days.filter((day) => !day.checkIn || day.meals.length === 0 || day.sleep.length === 0 || day.activities.length === 0).length, input.totalDays), days.length, input.totalDays, ['DailyRecord', 'DataCompletenessSnapshot'], days.map((day) => `LocalDate:${day.localDate}`)),
  };
  const missingFeatures = (Object.entries(features) as Array<[AnalysisFeatureKey, AnalysisFeatureValue]>).filter(([, value]) => value.availability === 'INSUFFICIENT_DATA').map(([key]) => key);
  const coreCoverage = [checkInDays.length, mealDays.length, sleepLogs.length, days.filter((day) => day.activities.length > 0).length].map((value) => ratio(Math.min(value, input.totalDays), input.totalDays));
  const inputCompleteness = Math.round(coreCoverage.reduce((sum, value) => sum + value, 0) / coreCoverage.length * 10_000) / 10_000;
  return { version: FEATURE_ENGINE_VERSION, inputCompleteness, features, missingFeatures, warnings: [...(nutritionDays.length === 0 ? ['NUTRITION_DATA_UNAVAILABLE'] : []), ...(stepDays.length === 0 ? ['STEP_DATA_UNAVAILABLE'] : [])] };
}
