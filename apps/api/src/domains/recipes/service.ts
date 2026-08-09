import {
  calculateFoodNutrition,
  calculateRecipeNutrition,
  calculateRemainingNutrition,
  emptyNutrients,
  evaluateRecipeBalance,
  evaluateRecipeEligibility,
  NUTRITION_ENGINE_VERSION,
  nutrientCodes,
  nutritionDifference,
  scoreRecipeCandidate,
  servingToGrams,
  type NutrientVector,
} from '@sarira/nutrition-engine';
import { localDateAt, type Clock } from '@sarira/baseline';
import type { AllergenCode, DailyMealPlanRecord, FlexKitchenIngredientInput, FlexKitchenPreviewRecord, MealAlternativeRecord, RecipeRecord } from '@sarira/shared-types';
import type { DataRepositories, MealPlanningPolicyRecord, RecipeVersionWriteInput } from '../../contracts';
import { ConflictError, FoodNotFoundError, NotFoundError, PolicyNotAvailableError, TargetUnavailableError } from '../../errors';
import { assertEditableDate, currentBaselineContext } from '../baseline/service';
import { getProfileOrThrow } from '../onboarding/service';
import { allergenWarnings, assertNutritionConsent, currentTarget, dailyNutrition } from '../nutrition/service';

const allergenTerms: Record<AllergenCode, string[]> = {
  MILK: ['susu', 'milk', 'laktosa'], EGG: ['telur', 'egg'], FISH: ['ikan', 'fish'], SHELLFISH: ['udang', 'kepiting', 'kerang', 'shellfish'],
  PEANUT: ['kacang tanah', 'peanut'], TREE_NUT: ['almond', 'mete', 'kenari', 'tree nut'], SOY: ['kedelai', 'soy', 'tempe', 'tahu'],
  WHEAT: ['gandum', 'wheat', 'gluten'], SESAME: ['wijen', 'sesame'], OTHER: [],
};

async function profileConstraints(repositories: DataRepositories, profileId: string) {
  const [allergenText, questionnaire, safety] = await Promise.all([
    repositories.nutrition.getProfileAllergenText(profileId),
    repositories.questionnaires.latest(profileId),
    repositories.safety.latestCompleted(profileId),
  ]);
  const dietary = questionnaire?.answers.find((item) => item.questionCode === 'diet_preferences')?.value;
  return { allergenText: allergenText.toLocaleLowerCase('id-ID'), dietary: Array.isArray(dietary) ? dietary : [], safety };
}

function dietaryConflicts(recipe: RecipeRecord, dietary: string[]) {
  const foods = recipe.currentVersion.ingredients.map((item) => item.food).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const conflicts: string[] = [];
  const allVerified = (tags: Array<'VEGETARIAN' | 'VEGAN' | 'HALAL_VERIFIED'>) => foods.every((food) => food.dietaryTags.some((item) => tags.includes(item.code as never) && item.status === 'VERIFIED'));
  if (dietary.includes('VEGETARIAN') && !allVerified(['VEGETARIAN', 'VEGAN'])) conflicts.push('VEGETARIAN_RESTRICTION');
  if (dietary.includes('VEGAN') && !allVerified(['VEGAN'])) conflicts.push('VEGAN_RESTRICTION');
  if (dietary.includes('HALAL') && !allVerified(['HALAL_VERIFIED'])) conflicts.push('HALAL_NOT_VERIFIED');
  if (foods.some((food) => food.dietaryTags.some((item) => item.code === 'PORK' || item.code === 'ALCOHOL'))) conflicts.push('PORK_OR_ALCOHOL_RESTRICTION');
  return conflicts;
}

function eligibilityFor(recipe: RecipeRecord, constraints: Awaited<ReturnType<typeof profileConstraints>>, policy: MealPlanningPolicyRecord) {
  const allergens = recipe.currentVersion.ingredients.flatMap((item) => item.food?.allergens ?? []);
  const matchedAllergens = allergens.filter((allergen) => allergenTerms[allergen.code].some((term) => constraints.allergenText.includes(term))).map((item) => item.code);
  const allergenDataComplete = recipe.currentVersion.ingredients.every((item) => item.food && item.food.source.sourceType !== 'SYNTHETIC_TEST_DATA' && item.food.source.sourceType !== 'USER_ENTERED' && item.food.allergens.every((allergen) => allergen.verified));
  const missing = recipe.currentVersion.nutrition?.missingNutrients ?? [...nutrientCodes];
  const criticalNutritionMissing = policy.configuration.criticalNutrients.some((code) => missing.includes(code));
  const result: { status: 'ELIGIBLE' | 'WARNING' | 'INELIGIBLE'; reasonCodes: string[] } = evaluateRecipeEligibility({ matchedAllergens, allergenDataComplete, dietaryConflicts: dietaryConflicts(recipe, constraints.dietary), safetyRestricted: !constraints.safety || constraints.safety.status === 'RED' || constraints.safety.restrictedPrograms.includes('GUIDED_MEAL'), ageRestricted: false, criticalNutritionMissing });
  return { ...result, ...(result.reasonCodes.includes('UNKNOWN_ALLERGEN_DATA') ? { allergenMessage: 'Informasi alergen belum lengkap.' } : {}) };
}

async function activePolicy(repositories: DataRepositories) {
  const policy = await repositories.mealPlanning.getActivePolicy();
  if (!policy) throw new PolicyNotAvailableError();
  return policy;
}

async function remainingFor(repositories: DataRepositories, clock: Clock, userId: string, localDate: string) {
  const [summary, target] = await Promise.all([dailyNutrition(repositories, clock, userId, localDate), currentTarget(repositories, clock, userId)]);
  const effectiveTarget = summary.target ?? target;
  if (!effectiveTarget) throw new TargetUnavailableError();
  const consumed = summary.itemCount === 0
    ? Object.fromEntries(nutrientCodes.map((code) => [code, 0])) as NutrientVector
    : summary.totals;
  return { summary, target: effectiveTarget, remaining: calculateRemainingNutrition(consumed, effectiveTarget.targets.map((item) => ({ ...item, unit: item.unit }))) };
}

async function decoratePlan(repositories: DataRepositories, clock: Clock, userId: string, plan: DailyMealPlanRecord) {
  const current = await remainingFor(repositories, clock, userId, plan.localDate);
  return { ...plan, remainingNutrition: current.remaining };
}

async function eligibleCandidates(repositories: DataRepositories, profileId: string, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK', policy: MealPlanningPolicyRecord, constraints: Awaited<ReturnType<typeof profileConstraints>>, remaining: Awaited<ReturnType<typeof calculateRemainingNutrition>>, excludeRecipeIds: string[] = []) {
  const result = await repositories.mealPlanning.listRecipes({ profileId, mealType, page: 1, pageSize: 50 });
  return result.items.filter((recipe) => !excludeRecipeIds.includes(recipe.id)).map((recipe) => ({ recipe: { ...recipe, eligibility: eligibilityFor(recipe, constraints, policy) } })).filter((item) => item.recipe.eligibility?.status !== 'INELIGIBLE').map((item) => {
    const scoring = scoreRecipeCandidate({ nutrition: item.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients(), remaining, mealTypeMatch: item.recipe.currentVersion.mealTypes.includes(mealType), timeMatch: item.recipe.currentVersion.prepTimeMinutes + item.recipe.currentVersion.cookTimeMinutes <= 45, costMatch: item.recipe.currentVersion.estimatedCostCategory !== 'HIGH', preferenceMatch: false, complete: item.recipe.currentVersion.nutrition?.complete ?? false, weights: policy.configuration.weights });
    return { ...item, ...scoring };
  }).sort((a, b) => b.score - a.score || a.recipe.code.localeCompare(b.recipe.code));
}

export async function listRecipes(repositories: DataRepositories, userId: string, query: { q?: string; mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; page: number; pageSize: number }) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const [policy, constraints] = await Promise.all([activePolicy(repositories), profileConstraints(repositories, profile.id)]);
  const result = await repositories.mealPlanning.listRecipes({ profileId: profile.id, query: query.q, mealType: query.mealType, page: query.page, pageSize: query.pageSize });
  return { ...result, items: result.items.map((recipe) => ({ ...recipe, eligibility: eligibilityFor(recipe, constraints, policy) })) };
}

export async function getRecipe(repositories: DataRepositories, userId: string, recipeId: string) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const recipe = await repositories.mealPlanning.getRecipe(recipeId, profile.id); if (!recipe) throw new NotFoundError('Resep tidak ditemukan.'); const [policy, constraints] = await Promise.all([activePolicy(repositories), profileConstraints(repositories, profile.id)]); return { ...recipe, eligibility: eligibilityFor(recipe, constraints, policy) };
}

export async function currentMealPlan(repositories: DataRepositories, clock: Clock, userId: string, localDate: string) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const plan = await repositories.mealPlanning.getCurrentPlan(profile.id, localDate); return plan ? decoratePlan(repositories, clock, userId, plan) : null;
}

export async function mealPlanById(repositories: DataRepositories, clock: Clock, userId: string, id: string) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const plan = await repositories.mealPlanning.getPlan(id, profile.id); if (!plan) throw new NotFoundError('Rencana makan tidak ditemukan.'); return decoratePlan(repositories, clock, userId, plan);
}

export async function generateDailyMealPlan(repositories: DataRepositories, clock: Clock, userId: string, localDate: string) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const context = await currentBaselineContext(repositories, userId, clock); assertEditableDate(context, localDate);
  const [policy, constraints, current] = await Promise.all([activePolicy(repositories), profileConstraints(repositories, profile.id), remainingFor(repositories, clock, userId, localDate)]);
  if (!constraints.safety || constraints.safety.status === 'RED' || constraints.safety.restrictedPrograms.includes('GUIDED_MEAL')) throw new ConflictError('Guided Meal dibatasi oleh hasil safety dan memerlukan review profesional.');
  const mealTypes: Array<'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'> = ['BREAKFAST', 'LUNCH', 'DINNER', ...(policy.configuration.snackEnabled ? ['SNACK' as const] : [])];
  const items = [];
  const used: string[] = [];
  for (const mealType of mealTypes) {
    const candidates = await eligibleCandidates(repositories, profile.id, mealType, policy, constraints, current.remaining, used);
    const selected = candidates[0] ?? (await eligibleCandidates(repositories, profile.id, mealType, policy, constraints, current.remaining))[0];
    if (!selected) continue;
    used.push(selected.recipe.id); items.push({ mealType, recipe: selected.recipe, reasonCodes: selected.reasonCodes.length ? selected.reasonCodes : ['CONSTRAINTS_MATCH'], recommendationFit: selected.fit, score: selected.score, nutritionImpact: selected.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients() });
  }
  if (!items.length) throw new ConflictError('Belum ada recipe eligible untuk profil dan target hari ini.');
  const generatedAt = clock.now().toISOString();
  const plan = await repositories.mealPlanning.createPlan({ profileId: profile.id, localDate, targetProfileId: current.target.id, policy, nutritionPolicyVersion: current.target.policyVersion, targetSnapshot: current.target, generatedAt, items });
  return decoratePlan(repositories, clock, userId, plan);
}

export async function mealAlternatives(repositories: DataRepositories, clock: Clock, userId: string, planId: string, itemId: string): Promise<MealAlternativeRecord[]> {
  const profile = await getProfileOrThrow(repositories, userId); const [plan, policy, constraints] = await Promise.all([mealPlanById(repositories, clock, userId, planId), activePolicy(repositories), profileConstraints(repositories, profile.id)]); const item = plan.items.find((value) => value.id === itemId); if (!item) throw new NotFoundError('Item rencana makan tidak ditemukan.');
  const values = await eligibleCandidates(repositories, profile.id, item.mealType as never, policy, constraints, plan.remainingNutrition, [item.recipe.id]);
  const before = item.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients();
  return values.slice(0, policy.configuration.alternativesMaximum).map((candidate) => { const after = candidate.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients(); const difference = nutritionDifference(before, after); const sodium = difference.SODIUM_MG; return { recipe: candidate.recipe, score: candidate.score, recommendationFit: candidate.fit, reasonCodes: candidate.reasonCodes, difference, differenceMessage: sodium === null ? 'Perbandingan natrium belum tersedia.' : sodium > 0 ? 'Alternatif ini sedikit lebih tinggi natrium.' : sodium < 0 ? 'Alternatif ini lebih rendah natrium.' : 'Natrium alternatif setara pada data yang tersedia.' }; });
}

export async function replaceMeal(repositories: DataRepositories, clock: Clock, userId: string, planId: string, itemId: string, recipeId: string, reason?: string) {
  const profile = await getProfileOrThrow(repositories, userId); const alternatives = await mealAlternatives(repositories, clock, userId, planId, itemId); const selected = alternatives.find((item) => item.recipe.id === recipeId); if (!selected) throw new ConflictError('Recipe pengganti tidak termasuk alternatif eligible saat ini.'); const plan = await repositories.mealPlanning.replacePlanItem({ profileId: profile.id, planId, itemId, recipe: selected.recipe, reasonCodes: selected.reasonCodes, recommendationFit: selected.recommendationFit, score: selected.score, nutritionImpact: selected.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients(), ...(reason ? { replacementReason: reason } : {}) }); return decoratePlan(repositories, clock, userId, plan);
}

export async function startCooking(repositories: DataRepositories, userId: string, planId: string, itemId: string) { await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); return repositories.mealPlanning.setCooking({ profileId: profile.id, planId, itemId }); }

async function ingredientCalculation(repositories: DataRepositories, input: FlexKitchenIngredientInput, scale = 1) {
  if (input.foodItemId && input.servingId) {
    const food = await repositories.nutrition.getFood(input.foodItemId); if (!food) throw new FoodNotFoundError(); const serving = food.servings.find((item) => item.id === input.servingId); if (!serving) throw new NotFoundError('Porsi bahan tidak ditemukan.');
    const gramAmount = servingToGrams(input.quantity * scale, serving.gramEquivalent); const calculation = calculateFoodNutrition(food.nutrients.map((item) => ({ nutrientCode: item.nutrientCode, amount: item.amount, basisAmount: item.basisAmount, basisUnit: 'G' })), gramAmount);
    return { food, serving, foodName: food.name, gramAmount, nutrition: calculation.nutrients, missingNutrients: calculation.missingNutrients, sourceVersion: food.source.version, sourceType: food.source.sourceType, itemSource: 'DATABASE_FOOD' as const };
  }
  const values = Object.fromEntries(nutrientCodes.map((code) => [code, input.userNutrition?.[code] === undefined ? null : input.userNutrition[code] === null ? null : input.userNutrition[code]! * input.quantity * scale])) as NutrientVector;
  return { foodName: input.customName ?? 'Bahan custom', nutrition: values, missingNutrients: nutrientCodes.filter((code) => values[code] === null), sourceVersion: input.userNutrition ? 'user-entered-label-v1' : 'user-custom-no-nutrition-v1', sourceType: 'USER_ENTERED' as const, itemSource: 'USER_ENTERED' as const };
}

export async function previewFlexKitchen(repositories: DataRepositories, clock: Clock, userId: string, input: { localDate: string; servings: number; ingredients: FlexKitchenIngredientInput[] }): Promise<FlexKitchenPreviewRecord> {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const [values, current, constraints] = await Promise.all([Promise.all(input.ingredients.map((item) => ingredientCalculation(repositories, item))), remainingFor(repositories, clock, userId, input.localDate), profileConstraints(repositories, profile.id)]);
  const calculated = calculateRecipeNutrition(values.map((item) => item.nutrition), input.servings); const missingNutrients = nutrientCodes.filter((code) => calculated.total[code] === null); const calculatedAt = clock.now().toISOString();
  const suggestions: FlexKitchenPreviewRecord['suggestions'] = evaluateRecipeBalance(calculated.perServing, current.remaining, values.some((item) => item.food ? allergenWarnings(item.food, constraints.allergenText).some((warning) => warning.matchedProfile) : false));
  for (const suggestion of suggestions) {
    const category = suggestion.reasonCode === 'ADD_PROTEIN' ? 'PROTEIN' : suggestion.reasonCode === 'ADD_FIBER' ? 'VEGETABLE' : undefined; if (!category) continue;
    const foods = await repositories.nutrition.searchFoods({ category, page: 1, pageSize: 20 });
    for (const food of foods.items) { const detail = await repositories.nutrition.getFood(food.id); if (!detail) continue; const warnings = allergenWarnings(detail, constraints.allergenText); if (warnings.some((warning) => warning.matchedProfile)) continue; suggestion.candidateFood = food; break; }
  }
  return { servings: input.servings, ingredients: input.ingredients.map((item, index) => ({ id: `preview-${index + 1}`, ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}), foodName: values[index]!.foodName, quantity: item.quantity, ...(values[index]!.gramAmount ? { gramAmount: values[index]!.gramAmount } : {}), ...(item.userNutrition ? { userNutrition: item.userNutrition } : {}), optional: false, orderIndex: index + 1, sourceType: values[index]!.sourceType, ...(values[index]!.food ? { food: values[index]!.food } : {}) })), nutrition: { id: 'preview', recipeVersionId: 'preview', total: calculated.total, perServing: calculated.perServing, missingNutrients, complete: missingNutrients.length === 0, sourceVersions: [...new Set(values.map((item) => item.sourceVersion))], calculationVersion: NUTRITION_ENGINE_VERSION, calculatedAt }, impact: calculated.perServing, remainingNutrition: current.remaining, suggestions };
}

function nutritionSimilarity(before: NutrientVector, after: NutrientVector) { const codes = ['ENERGY_KCAL', 'PROTEIN_G', 'FIBER_G', 'SODIUM_MG'] as const; const values = codes.map((code) => before[code] === null || after[code] === null ? 0 : 1 - Math.min(1, Math.abs(before[code]! - after[code]!) / Math.max(before[code]!, after[code]!, 1))); return values.reduce((sum, value) => sum + value, 0) / values.length * 100; }

export async function substitutions(repositories: DataRepositories, clock: Clock, userId: string, input: { localDate: string; ingredient: FlexKitchenIngredientInput; replacementFoodItemId?: string }) {
  await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const before = await ingredientCalculation(repositories, input.ingredient); if (!before.food) throw new ConflictError('Substitusi otomatis memerlukan bahan dari database.'); const constraints = await profileConstraints(repositories, profile.id); const foods = await repositories.nutrition.searchFoods({ category: before.food.category, page: 1, pageSize: 50 }); const candidates = [];
  for (const food of foods.items.filter((item) => item.id !== before.food!.id && (!input.replacementFoodItemId || item.id === input.replacementFoodItemId))) { const serving = food.servings.find((item) => item.defaultServing) ?? food.servings[0]; if (!serving) continue; const replacementInput = { foodItemId: food.id, servingId: serving.id, quantity: input.ingredient.quantity }; const after = await ingredientCalculation(repositories, replacementInput); if (!after.food || allergenWarnings(after.food, constraints.allergenText).some((warning) => warning.matchedProfile)) continue; candidates.push({ original: { id: 'original', foodItemId: before.food.id, servingId: before.serving?.id, foodName: before.foodName, quantity: input.ingredient.quantity, ...(before.gramAmount ? { gramAmount: before.gramAmount } : {}), optional: false, orderIndex: 1, sourceType: before.sourceType, food: before.food }, replacement: { id: 'replacement', foodItemId: after.food.id, servingId: after.serving?.id, foodName: after.foodName, quantity: input.ingredient.quantity, ...(after.gramAmount ? { gramAmount: after.gramAmount } : {}), optional: false, orderIndex: 1, sourceType: after.sourceType, food: after.food }, before: before.nutrition, after: after.nutrition, difference: nutritionDifference(before.nutrition, after.nutrition), score: Math.round(nutritionSimilarity(before.nutrition, after.nutrition) * 10) / 10, reasonCodes: ['CATEGORY_MATCH', 'NUTRIENT_SIMILARITY', 'ALLERGEN_FILTERED'], requiresConfirmation: true as const }); }
  return candidates.sort((a, b) => b.score - a.score).slice(0, 5);
}

function writeInputFromPreview(input: { name: string; description: string; servings: number; prepTimeMinutes: number; cookTimeMinutes: number; difficulty: RecipeVersionWriteInput['difficulty']; estimatedCostCategory: RecipeVersionWriteInput['estimatedCostCategory']; cookingMethod: RecipeVersionWriteInput['cookingMethod']; mealTypes: RecipeVersionWriteInput['mealTypes']; ingredients: FlexKitchenIngredientInput[]; notes?: string; steps: RecipeVersionWriteInput['steps'] }, preview: FlexKitchenPreviewRecord): RecipeVersionWriteInput { return { ...input, ingredients: input.ingredients.map((item, index) => ({ ...item, foodName: preview.ingredients[index]!.foodName, ...(preview.ingredients[index]!.gramAmount ? { gramAmount: preview.ingredients[index]!.gramAmount } : {}), sourceType: preview.ingredients[index]!.sourceType })), nutrition: { total: preview.nutrition.total, perServing: preview.nutrition.perServing, missingNutrients: preview.nutrition.missingNutrients, complete: preview.nutrition.complete, sourceVersions: preview.nutrition.sourceVersions, calculationVersion: preview.nutrition.calculationVersion, calculatedAt: preview.nutrition.calculatedAt } }; }

export async function savePersonalRecipe(repositories: DataRepositories, clock: Clock, userId: string, input: Parameters<typeof writeInputFromPreview>[0], recipeId?: string) { await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); const localDate = localDateAt(clock.now(), profile.timezone); const preview = await previewFlexKitchen(repositories, clock, userId, { localDate, servings: input.servings, ingredients: input.ingredients }); const prepared = writeInputFromPreview(input, preview); return recipeId ? repositories.mealPlanning.updatePersonalRecipe(profile.id, recipeId, prepared) : repositories.mealPlanning.createPersonalRecipe(profile.id, prepared); }

export async function listPersonalRecipes(repositories: DataRepositories, userId: string) { await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); return repositories.mealPlanning.listPersonalRecipes(profile.id); }
export async function duplicatePersonalRecipe(repositories: DataRepositories, userId: string, recipeId: string) { await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); return repositories.mealPlanning.duplicatePersonalRecipe(profile.id, recipeId); }
export async function archivePersonalRecipe(repositories: DataRepositories, userId: string, recipeId: string) { await assertNutritionConsent(repositories, userId); const profile = await getProfileOrThrow(repositories, userId); return repositories.mealPlanning.archivePersonalRecipe(profile.id, recipeId); }

export async function consumeMealPlanItem(repositories: DataRepositories, clock: Clock, userId: string, planId: string, itemId: string, fraction: number) {
  await assertNutritionConsent(repositories, userId); const context = await currentBaselineContext(repositories, userId, clock); const plan = await repositories.mealPlanning.getPlan(planId, context.profile.id); if (!plan) throw new NotFoundError('Rencana makan tidak ditemukan.'); assertEditableDate(context, plan.localDate); const item = plan.items.find((value) => value.id === itemId); if (!item) throw new NotFoundError('Item rencana makan tidak ditemukan.');
  const factor = fraction / item.recipe.currentVersion.servings; const allergenText = await repositories.nutrition.getProfileAllergenText(context.profile.id); const ingredientItems = [];
  for (const ingredient of item.recipe.currentVersion.ingredients) {
    if (ingredient.foodItemId && ingredient.servingId) { const food = await repositories.nutrition.getFood(ingredient.foodItemId); if (!food) throw new FoodNotFoundError(); const serving = food.servings.find((value) => value.id === ingredient.servingId); if (!serving) throw new NotFoundError('Porsi bahan recipe tidak ditemukan.'); const gramAmount = servingToGrams(ingredient.quantity * factor, serving.gramEquivalent); const calculation = calculateFoodNutrition(food.nutrients.map((value) => ({ nutrientCode: value.nutrientCode, amount: value.amount, basisAmount: value.basisAmount, basisUnit: 'G' })), gramAmount); ingredientItems.push({ foodItemId: food.id, servingId: serving.id, itemSource: 'DATABASE_FOOD' as const, quantity: ingredient.quantity * factor, gramAmount, sourceVersion: food.source.version, snapshot: { sourceVersion: food.source.version, foodName: food.name, gramAmount, nutrients: calculation.nutrients, missingNutrients: calculation.missingNutrients, complete: calculation.complete, calculationVersion: calculation.calculationVersion }, allergenWarnings: allergenWarnings(food, allergenText) }); }
    else {
      const quantity = ingredient.quantity * factor;
      const nutrients = ingredient.userNutrition
        ? Object.fromEntries(nutrientCodes.map((code) => [code, ingredient.userNutrition?.[code] === undefined || ingredient.userNutrition[code] === null ? null : ingredient.userNutrition[code]! * quantity])) as NutrientVector
        : emptyNutrients();
      const missingNutrients = nutrientCodes.filter((code) => nutrients[code] === null);
      const sourceVersion = ingredient.userNutrition ? 'user-entered-label-v1' : 'user-custom-no-nutrition-v1';
      ingredientItems.push({ itemSource: ingredient.userNutrition ? 'USER_ENTERED' as const : 'CUSTOM_FOOD' as const, customName: ingredient.foodName, quantity, sourceVersion, snapshot: { sourceVersion, foodName: ingredient.foodName, nutrients, missingNutrients, complete: missingNutrients.length === 0, calculationVersion: NUTRITION_ENGINE_VERSION }, allergenWarnings: [{ code: 'OTHER' as const, label: 'Informasi alergen belum lengkap', matchedProfile: false, verified: false }] });
    }
  }
  const consumedAt = clock.now().toISOString(); const result = await repositories.mealPlanning.consumePlanItem({ profileId: context.profile.id, baselineSessionId: context.baseline.id, dayIndex: assertEditableDate(context, plan.localDate), planId, itemId, localDate: plan.localDate, mealType: item.mealType as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK', recipeName: item.recipe.name, fraction, consumedAt, ingredientItems }); const nutrition = await dailyNutrition(repositories, clock, userId, plan.localDate); return { ...result, plan: await decoratePlan(repositories, clock, userId, result.plan), nutrition };
}
