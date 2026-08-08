import {
  aggregateNutrition,
  calculateFoodNutrition,
  emptyNutrients,
  indicatorFor,
  NUTRITION_ENGINE_VERSION,
  nutrientCodes,
  roundNutrient,
  servingToGrams,
  type NutritionTarget,
} from '@sarira/nutrition-engine';
import type {
  AllergenCode,
  DailyNutritionSummaryRecord,
  MealLogItemRecord,
  NutrientCode,
  NutritionIndicatorRecord,
  NutritionSnapshotRecord,
  NutritionTargetEntry,
  NutritionTargetProfileRecord,
} from '@sarira/shared-types';
import type { Clock } from '@sarira/baseline';
import { localDateAt } from '@sarira/baseline';
import type { DataRepositories, NutritionFoodDetail, NutritionPolicyRecord, ProfileRecord } from '../../contracts';
import { AuthorizationError, ConsentRequiredError, FoodNotFoundError, InvalidPortionError, NotFoundError, PolicyNotAvailableError, ServingNotFoundError, TargetUnavailableError } from '../../errors';
import { getProfileOrThrow } from '../onboarding/service';
import { assertEditableDate, currentBaselineContext } from '../baseline/service';

const allergenLabels: Record<AllergenCode, string> = {
  MILK: 'Susu', EGG: 'Telur', FISH: 'Ikan', SHELLFISH: 'Krustasea/kerang', PEANUT: 'Kacang tanah',
  TREE_NUT: 'Kacang pohon', SOY: 'Kedelai', WHEAT: 'Gandum', SESAME: 'Wijen', OTHER: 'Alergen lain',
};

const allergenTerms: Record<AllergenCode, string[]> = {
  MILK: ['susu', 'milk', 'laktosa'], EGG: ['telur', 'egg'], FISH: ['ikan', 'fish'], SHELLFISH: ['udang', 'kepiting', 'kerang', 'shellfish'],
  PEANUT: ['kacang tanah', 'peanut'], TREE_NUT: ['almond', 'mete', 'kenari', 'tree nut'], SOY: ['kedelai', 'soy'],
  WHEAT: ['gandum', 'wheat', 'gluten'], SESAME: ['wijen', 'sesame'], OTHER: [],
};

const nutrientNames: Record<NutrientCode, string> = {
  ENERGY_KCAL: 'Energi', PROTEIN_G: 'Protein', CARBOHYDRATE_G: 'Karbohidrat', FAT_G: 'Lemak',
  SATURATED_FAT_G: 'Lemak jenuh', FIBER_G: 'Serat', SUGAR_G: 'Gula', SODIUM_MG: 'Natrium',
};

export async function assertNutritionConsent(repositories: DataRepositories, userId: string) {
  const records = await repositories.consents.list(userId);
  if (!records.some((record) => record.type === 'NUTRITION_DATA' && record.status === 'GRANTED')) throw new ConsentRequiredError();
}

export function allergenWarnings(food: NutritionFoodDetail, profileAllergenText: string): MealLogItemRecord['allergenWarnings'] {
  const normalized = profileAllergenText.toLocaleLowerCase('id-ID');
  if (food.allergens.length === 0) return [{ code: 'OTHER', label: 'Informasi alergen belum lengkap', matchedProfile: false, verified: false }];
  return food.allergens.map((allergen) => ({ code: allergen.code, label: allergenLabels[allergen.code], matchedProfile: allergenTerms[allergen.code].some((term) => normalized.includes(term)), verified: allergen.verified }));
}

function snapshotFor(food: NutritionFoodDetail, servingId: string, quantity: number, warnings: MealLogItemRecord['allergenWarnings']) {
  const serving = food.servings.find((item) => item.id === servingId);
  if (!serving) throw new ServingNotFoundError();
  let gramAmount: number;
  try { gramAmount = servingToGrams(quantity, serving.gramEquivalent); } catch (error) { throw new InvalidPortionError(error instanceof Error ? error.message : undefined); }
  const calculation = calculateFoodNutrition(food.nutrients.map((item) => ({ nutrientCode: item.nutrientCode, amount: item.amount, basisAmount: item.basisAmount, basisUnit: 'G' })), gramAmount);
  const snapshot: Omit<NutritionSnapshotRecord, 'id'> = { sourceVersion: food.source.version, foodName: food.name, gramAmount, nutrients: calculation.nutrients, missingNutrients: calculation.missingNutrients, complete: calculation.complete, calculationVersion: calculation.calculationVersion };
  return { serving, gramAmount, snapshot, warnings };
}

export async function previewFood(repositories: DataRepositories, userId: string, input: { foodItemId: string; servingId: string; quantity: number }) {
  await assertNutritionConsent(repositories, userId);
  const profile = await getProfileOrThrow(repositories, userId);
  const food = await repositories.nutrition.getFood(input.foodItemId);
  if (!food) throw new FoodNotFoundError();
  const warnings = allergenWarnings(food, await repositories.nutrition.getProfileAllergenText(profile.id));
  const result = snapshotFor(food, input.servingId, input.quantity, warnings);
  return { food, serving: result.serving, quantity: input.quantity, gramAmount: result.gramAmount, nutrition: result.snapshot, allergenWarnings: warnings };
}

export async function addMealItem(repositories: DataRepositories, clock: Clock, userId: string, mealLogId: string, input: { foodItemId: string; servingId: string; quantity: number }) {
  await assertNutritionConsent(repositories, userId);
  const context = await currentBaselineContext(repositories, userId, clock);
  const meal = await repositories.baseline.getMealById(context.profile.id, context.baseline.id, mealLogId);
  if (!meal) throw new NotFoundError('Meal log tidak ditemukan pada baseline aktif.');
  assertEditableDate(context, meal.localDate);
  const preview = await previewFood(repositories, userId, input);
  return repositories.nutrition.createItem({ mealLogId, profileId: context.profile.id, localDate: meal.localDate, foodItemId: preview.food.id, servingId: preview.serving.id, itemSource: 'DATABASE_FOOD', quantity: input.quantity, gramAmount: preview.gramAmount, sourceVersion: preview.food.source.version, snapshot: preview.nutrition, allergenWarnings: preview.allergenWarnings });
}

export async function addCustomMealItem(repositories: DataRepositories, clock: Clock, userId: string, mealLogId: string, input: { customName: string; servingDescription: string; quantity: number }) {
  await assertNutritionConsent(repositories, userId);
  const context = await currentBaselineContext(repositories, userId, clock);
  const meal = await repositories.baseline.getMealById(context.profile.id, context.baseline.id, mealLogId);
  if (!meal) throw new NotFoundError('Meal log tidak ditemukan pada baseline aktif.');
  assertEditableDate(context, meal.localDate);
  const snapshot: Omit<NutritionSnapshotRecord, 'id'> = { sourceVersion: 'user-custom-no-nutrition-v1', foodName: input.customName, nutrients: emptyNutrients(), missingNutrients: [...nutrientCodes], complete: false, calculationVersion: NUTRITION_ENGINE_VERSION };
  return repositories.nutrition.createItem({ mealLogId, profileId: context.profile.id, localDate: meal.localDate, itemSource: 'CUSTOM_FOOD', customName: `${input.customName} · ${input.servingDescription}`, quantity: input.quantity, sourceVersion: snapshot.sourceVersion, snapshot, allergenWarnings: [{ code: 'OTHER', label: 'Informasi alergen belum lengkap', matchedProfile: false, verified: false }] });
}

export async function updateMealItem(repositories: DataRepositories, clock: Clock, userId: string, itemId: string, input: { servingId?: string; quantity?: number }) {
  await assertNutritionConsent(repositories, userId);
  const context = await currentBaselineContext(repositories, userId, clock);
  const current = await repositories.nutrition.getItem(itemId);
  if (!current) throw new NotFoundError('Item makanan tidak ditemukan.');
  if (current.profileId !== context.profile.id) throw new AuthorizationError('Item makanan dimiliki profile lain.');
  if (!current.foodItemId || current.itemSource !== 'DATABASE_FOOD') throw new InvalidPortionError('Custom food tanpa nilai label tidak memiliki kalkulasi porsi.');
  const meal = await repositories.baseline.getMealById(context.profile.id, context.baseline.id, current.mealLogId);
  if (!meal) throw new NotFoundError('Meal log tidak ditemukan pada baseline aktif.');
  assertEditableDate(context, meal.localDate);
  const food = await repositories.nutrition.getFood(current.foodItemId); if (!food) throw new FoodNotFoundError();
  const warnings = allergenWarnings(food, await repositories.nutrition.getProfileAllergenText(context.profile.id));
  const servingId = input.servingId ?? current.servingId; if (!servingId) throw new ServingNotFoundError();
  const quantity = input.quantity ?? current.quantity;
  const calculated = snapshotFor(food, servingId, quantity, warnings);
  return repositories.nutrition.updateItem(itemId, { servingId, quantity, gramAmount: calculated.gramAmount, sourceVersion: food.source.version, snapshot: calculated.snapshot, allergenWarnings: warnings });
}

export async function deleteMealItem(repositories: DataRepositories, clock: Clock, userId: string, itemId: string) {
  await assertNutritionConsent(repositories, userId);
  const context = await currentBaselineContext(repositories, userId, clock);
  const item = await repositories.nutrition.getItem(itemId); if (!item) throw new NotFoundError('Item makanan tidak ditemukan.');
  if (item.profileId !== context.profile.id) throw new AuthorizationError('Item makanan dimiliki profile lain.');
  const meal = await repositories.baseline.getMealById(context.profile.id, context.baseline.id, item.mealLogId); if (!meal) throw new NotFoundError('Meal log tidak ditemukan pada baseline aktif.');
  assertEditableDate(context, meal.localDate); await repositories.nutrition.deleteItem(itemId);
}

function targetConfig(policy: NutritionPolicyRecord): NutritionTargetEntry[] {
  const targets = policy.targetConfiguration.targets;
  if (!Array.isArray(targets)) throw new PolicyNotAvailableError();
  return targets.map((item) => ({ ...(item as NutritionTargetEntry) }));
}

function policyFor(profile: ProfileRecord, policies: NutritionPolicyRecord[]) {
  if (profile.age === undefined || !profile.ageGroup) throw new TargetUnavailableError('Tanggal lahir dan kelompok usia diperlukan.');
  const policy = policies.find((item) => profile.age! >= item.ageMin && profile.age! <= item.ageMax && (!item.applicableSex || item.applicableSex === profile.gender));
  if (!policy) throw new PolicyNotAvailableError();
  return policy;
}

export async function recalculateTarget(repositories: DataRepositories, clock: Clock, userId: string, reason = 'USER_REQUESTED_RECALCULATION') {
  await assertNutritionConsent(repositories, userId);
  const profile = await getProfileOrThrow(repositories, userId);
  const [goal, safety, policies] = await Promise.all([repositories.goals.get(profile.id), repositories.safety.latestCompleted(profile.id), repositories.nutrition.getActivePolicies()]);
  if (!goal || !safety || !profile.ageGroup) throw new TargetUnavailableError('Goal, safety, dan kelompok usia harus tersedia.');
  const policy = policyFor(profile, policies);
  let targets = targetConfig(policy);
  const restrictionReasons: string[] = [];
  if (safety.status === 'RED') { targets = []; restrictionReasons.push('SAFETY_RED_PROFESSIONAL_REVIEW_REQUIRED'); }
  if (safety.status === 'YELLOW') restrictionReasons.push('SAFETY_YELLOW_GENERAL_TARGET_ONLY');
  if (profile.ageGroup === 'TEEN') restrictionReasons.push('TEEN_GENERAL_POLICY_NO_ADULT_FORMULA');
  if (profile.ageGroup === 'HEALTHY_AGING') restrictionReasons.push('HEALTHY_AGING_NO_AUTOMATIC_DEFICIT');
  const adultAdjustable = ['YOUNG_ADULT', 'ADULT_BALANCE'].includes(profile.ageGroup) && safety.status === 'GREEN';
  if (adultAdjustable && ['LOSE_WEIGHT', 'GAIN_WEIGHT'].includes(goal.code)) {
    const delta = goal.code === 'LOSE_WEIGHT' ? -150 : 150;
    targets = targets.map((target) => target.nutrientCode === 'ENERGY_KCAL' ? { ...target, minimum: Math.max(1500, (target.minimum ?? 0) + delta), maximum: Math.max(1700, (target.maximum ?? 0) + delta) } : target);
  }
  const calculatedAt = clock.now().toISOString();
  const effectiveFrom = localDateAt(clock.now(), profile.timezone);
  const target: Omit<NutritionTargetProfileRecord, 'id'> = { profileId: profile.id, policyCode: policy.code, policyVersion: policy.version, ageGroup: profile.ageGroup, goal: goal.code, safetyStatus: safety.status, effectiveFrom, targets, calculationReason: reason, calculatedAt, requiresExpertValidation: policy.requiresExpertValidation, restricted: restrictionReasons.length > 0, restrictionReasons };
  return repositories.nutrition.saveTarget({ profileId: profile.id, policy, target });
}

export async function currentTarget(repositories: DataRepositories, clock: Clock, userId: string) {
  await assertNutritionConsent(repositories, userId);
  const profile = await getProfileOrThrow(repositories, userId);
  const localDate = localDateAt(clock.now(), profile.timezone);
  return (await repositories.nutrition.getCurrentTarget(profile.id, localDate)) ?? recalculateTarget(repositories, clock, userId, 'INITIAL_TARGET');
}

export async function dailyNutrition(repositories: DataRepositories, clock: Clock, userId: string, localDate: string): Promise<DailyNutritionSummaryRecord> {
  await assertNutritionConsent(repositories, userId);
  const profile = await getProfileOrThrow(repositories, userId);
  const items = await repositories.nutrition.listItemsForDate(profile.id, localDate);
  let target: NutritionTargetProfileRecord | undefined;
  try { target = (await repositories.nutrition.getCurrentTarget(profile.id, localDate)) ?? await recalculateTarget(repositories, clock, userId, 'INITIAL_TARGET'); } catch (error) { if (!(error instanceof TargetUnavailableError || error instanceof PolicyNotAvailableError)) throw error; }
  const raw = items.length ? aggregateNutrition(items.map((item) => item.snapshot.nutrients)) : emptyNutrients();
  const totals = Object.fromEntries(nutrientCodes.map((code) => [code, roundNutrient(code, raw[code])])) as typeof raw;
  const indicators: NutritionIndicatorRecord[] = nutrientCodes.map((code) => {
    const targetEntry = target?.targets.find((item) => item.nutrientCode === code);
    if (!targetEntry) return { nutrientCode: code, displayName: nutrientNames[code], unit: code.endsWith('_MG') ? 'mg' : code === 'ENERGY_KCAL' ? 'kcal' : 'g', amount: totals[code], status: 'TARGET_UNAVAILABLE', statusLabel: totals[code] === null ? 'Data belum tersedia.' : 'Target belum tersedia untuk profil ini.', complete: totals[code] !== null };
    const result = indicatorFor(totals[code], targetEntry as NutritionTarget);
    return { nutrientCode: code, displayName: nutrientNames[code], unit: targetEntry.unit, amount: totals[code], target: targetEntry, status: result.status, statusLabel: result.label, complete: totals[code] !== null };
  });
  return { profileId: profile.id, localDate, timezone: profile.timezone, totals, missingNutrients: nutrientCodes.filter((code) => totals[code] === null), complete: nutrientCodes.every((code) => totals[code] !== null), mealCount: new Set(items.map((item) => item.mealLogId)).size, itemCount: items.length, indicators, ...(target ? { target } : {}), sourceVersions: [...new Set(items.map((item) => item.sourceVersion))], calculatedAt: clock.now().toISOString(), items };
}

export async function nutritionHistory(repositories: DataRepositories, clock: Clock, userId: string, from: string, to: string) {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00.000Z`); const end = new Date(`${to}T00:00:00.000Z`);
  while (cursor <= end && dates.length < 31) { dates.push(cursor.toISOString().slice(0, 10)); cursor.setUTCDate(cursor.getUTCDate() + 1); }
  return { from, to, days: await Promise.all(dates.map((date) => dailyNutrition(repositories, clock, userId, date))) };
}
