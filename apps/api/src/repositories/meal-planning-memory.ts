import { calculateFoodNutrition, calculateRecipeNutrition, emptyNutrients, NUTRITION_ENGINE_VERSION, nutrientCodes, servingToGrams } from '@sarira/nutrition-engine';
import type { DailyMealPlanRecord, MealPlanItemRecord, RecipeIngredientRecord, RecipeRecord, RecipeVersionRecord } from '@sarira/shared-types';
import type { BaselineRepository, MealPlanningPolicyRecord, MealPlanningRepository, NutritionRepository, RecipeVersionWriteInput } from '../contracts';
import { ConflictError, NotFoundError } from '../errors';

const now = () => new Date().toISOString();
const clone = <T>(value: T): T => structuredClone(value);

const policy: MealPlanningPolicyRecord = {
  id: '96000000-0000-4000-8000-000000000001',
  code: 'DAILY_GUIDED_MEAL',
  version: 'meal-planning-dev-v1',
  configuration: {
    weights: { mealType: 20, protein: 18, fiber: 12, upperLimits: 20, time: 8, cost: 5, preference: 7, dataQuality: 10 },
    criticalNutrients: ['ENERGY_KCAL', 'PROTEIN_G', 'SODIUM_MG'],
    snackEnabled: false,
    alternativesMinimum: 3,
    alternativesMaximum: 5,
  },
  requiresProductValidation: true,
};

const recipeSeeds = [
  { code: 'DEV_NASI_TEMPE_BAYAM', name: 'Nasi, Tempe, dan Bayam', description: 'Menu development sederhana dari bahan pada database Phase 5.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-TEMPE', 'DEV-BAYAM'], quantities: [1, 1, 1], method: 'STIR_FRIED' as const, minutes: 25, cost: 'LOW' as const },
  { code: 'DEV_NASI_AYAM_WORTEL', name: 'Nasi Ayam Wortel', description: 'Menu development dengan nasi, ayam, dan wortel.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-AYAM', 'DEV-WORTEL'], quantities: [1, 1, 1], method: 'BOILED' as const, minutes: 30, cost: 'MEDIUM' as const },
  { code: 'DEV_OAT_PISANG_SUSU', name: 'Oat Pisang Susu', description: 'Menu sarapan development; metadata alergen tetap ditampilkan.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-OATMEAL', 'DEV-PISANG', 'DEV-SUSU'], quantities: [1, 1, 1], method: 'BOILED' as const, minutes: 12, cost: 'LOW' as const },
  { code: 'DEV_NASI_TAHU_BAYAM', name: 'Nasi Tahu Bayam', description: 'Menu development berbasis tahu dan sayur.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-TAHU', 'DEV-BAYAM'], quantities: [1, 1, 1], method: 'STIR_FRIED' as const, minutes: 22, cost: 'LOW' as const },
  { code: 'DEV_TELUR_PISANG_NASI', name: 'Telur, Pisang, dan Nasi', description: 'Menu sarapan development dari data pangan synthetic.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-TELUR-AYAM', 'DEV-PISANG', 'DEV-NASI-PUTIH'], quantities: [1, 1, 1], method: 'BOILED' as const, minutes: 15, cost: 'LOW' as const },
];

async function ingredientFromFood(nutrition: NutritionRepository, code: string, quantity: number, orderIndex: number) {
  const result = await nutrition.searchFoods({ page: 1, pageSize: 50 });
  const food = result.items.find((item) => item.code === code);
  if (!food) throw new NotFoundError(`Development food ${code} tidak tersedia.`);
  const detail = await nutrition.getFood(food.id); if (!detail) throw new NotFoundError('Bahan resep tidak ditemukan.');
  const serving = detail.servings.find((item) => item.defaultServing) ?? detail.servings[0];
  if (!serving) throw new NotFoundError('Porsi bahan resep tidak tersedia.');
  const gramAmount = servingToGrams(quantity, serving.gramEquivalent);
  const calculated = calculateFoodNutrition(detail.nutrients.map((item) => ({ nutrientCode: item.nutrientCode, amount: item.amount, basisAmount: item.basisAmount, basisUnit: 'G' })), gramAmount);
  const ingredient: RecipeIngredientRecord = { id: crypto.randomUUID(), foodItemId: detail.id, servingId: serving.id, foodName: detail.name, quantity, gramAmount, optional: false, orderIndex, sourceType: detail.source.sourceType, food: detail };
  return { ingredient, calculated, sourceVersion: detail.source.version };
}

function versionFromWrite(recipeId: string, version: number, input: RecipeVersionWriteInput): RecipeVersionRecord {
  const calculatedAt = input.nutrition.calculatedAt;
  return {
    id: crypto.randomUUID(), recipeId, version, status: 'ACTIVE', servings: input.servings,
    prepTimeMinutes: input.prepTimeMinutes, cookTimeMinutes: input.cookTimeMinutes, difficulty: input.difficulty,
    estimatedCostCategory: input.estimatedCostCategory, cookingMethod: input.cookingMethod,
    mealTypes: input.mealTypes, dietaryTags: [], equipment: [], ...(input.notes ? { notes: input.notes } : {}), verified: false,
    requiresExpertValidation: true, publishedAt: calculatedAt,
    ingredients: input.ingredients.map((item, index) => ({ id: crypto.randomUUID(), ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}), foodName: item.foodName, quantity: item.quantity, ...(item.gramAmount ? { gramAmount: item.gramAmount } : {}), ...(item.userNutrition ? { userNutrition: item.userNutrition } : {}), optional: false, orderIndex: index + 1, sourceType: item.sourceType })),
    steps: input.steps.map((item, index) => ({ id: crypto.randomUUID(), orderIndex: index + 1, instruction: item.instruction, ...(item.timerSeconds ? { timerSeconds: item.timerSeconds } : {}) })),
    nutrition: { id: crypto.randomUUID(), recipeVersionId: '', ...input.nutrition }, createdAt: calculatedAt, updatedAt: calculatedAt,
  };
}

export function createMemoryMealPlanningRepository(nutrition: NutritionRepository, baseline: BaselineRepository): MealPlanningRepository {
  const recipes: RecipeRecord[] = [];
  const versions = new Map<string, RecipeVersionRecord[]>();
  const plans: DailyMealPlanRecord[] = [];
  const consumptionMealIds = new Map<string, string>();
  let initialized = false;

  const ensureRecipes = async () => {
    if (initialized) return; initialized = true;
    for (const seed of recipeSeeds) {
      const values = await Promise.all(seed.foodCodes.map((code, index) => ingredientFromFood(nutrition, code, seed.quantities[index]!, index + 1)));
      const recipeId = crypto.randomUUID(); const versionId = crypto.randomUUID();
      const calculated = calculateRecipeNutrition(values.map((value) => value.calculated.nutrients), 2);
      const missingNutrients = nutrientCodes.filter((code) => calculated.total[code] === null);
      const createdAt = now();
      const currentVersion: RecipeVersionRecord = { id: versionId, recipeId, version: 1, status: 'ACTIVE', servings: 2, prepTimeMinutes: 8, cookTimeMinutes: seed.minutes, difficulty: seed.minutes <= 15 ? 'EASY' : 'MEDIUM', estimatedCostCategory: seed.cost, cookingMethod: seed.method, mealTypes: [...seed.mealTypes], dietaryTags: [], equipment: ['STOVE'], verified: false, requiresExpertValidation: true, publishedAt: createdAt, ingredients: values.map((value) => value.ingredient), steps: [{ id: crypto.randomUUID(), orderIndex: 1, instruction: 'Siapkan seluruh bahan sesuai porsi.' }, { id: crypto.randomUUID(), orderIndex: 2, instruction: 'Masak bahan hingga matang sesuai metode yang dipilih.' }, { id: crypto.randomUUID(), orderIndex: 3, instruction: 'Sajikan dan periksa kembali porsi.' }], nutrition: { id: crypto.randomUUID(), recipeVersionId: versionId, total: calculated.total, perServing: calculated.perServing, missingNutrients, complete: missingNutrients.length === 0, sourceVersions: [...new Set(values.map((value) => value.sourceVersion))], calculationVersion: NUTRITION_ENGINE_VERSION, calculatedAt: createdAt }, createdAt, updatedAt: createdAt };
      const recipe: RecipeRecord = { id: recipeId, code: seed.code, name: seed.name, description: seed.description, sourceType: 'SYNTHETIC_DEVELOPMENT', sourceId: 'SARIRA-DEVELOPMENT', sourceVersion: 'phase6-dev-v1', verified: false, active: true, private: false, requiresExpertValidation: true, currentVersion, createdAt, updatedAt: createdAt };
      recipes.push(recipe); versions.set(recipe.id, [currentVersion]);
    }
  };

  const visibleRecipe = (recipe: RecipeRecord, profileId: string) => recipe.active && (!recipe.private || recipe.ownerProfileId === profileId);
  const planById = (id: string, profileId: string) => plans.find((item) => item.id === id && item.profileId === profileId) ?? null;
  const itemById = (plan: DailyMealPlanRecord, itemId: string) => plan.items.find((item) => item.id === itemId);
  const emptyRemaining = Object.fromEntries(nutrientCodes.map((code) => [code, undefined])) as DailyMealPlanRecord['remainingNutrition'];

  return {
    async getActivePolicy() { return clone(policy); },
    async listRecipes(input) { await ensureRecipes(); const query = input.query?.toLocaleLowerCase('id-ID'); const filtered = recipes.filter((item) => visibleRecipe(item, input.profileId) && (!query || item.name.toLocaleLowerCase('id-ID').includes(query)) && (!input.mealType || item.currentVersion.mealTypes.includes(input.mealType as never))); const start = (input.page - 1) * input.pageSize; return { items: clone(filtered.slice(start, start + input.pageSize)), total: filtered.length, page: input.page, pageSize: input.pageSize }; },
    async getRecipe(id, profileId) { await ensureRecipes(); const recipe = recipes.find((item) => item.id === id && visibleRecipe(item, profileId)); return recipe ? clone(recipe) : null; },
    async getCurrentPlan(profileId, localDate) { const plan = plans.filter((item) => item.profileId === profileId && item.localDate === localDate && item.status === 'ACTIVE').at(-1); return plan ? clone(plan) : null; },
    async getPlan(id, profileId) { const plan = planById(id, profileId); return plan ? clone(plan) : null; },
    async createPlan(input) {
      for (const current of plans.filter((item) => item.profileId === input.profileId && item.localDate === input.localDate && item.status === 'ACTIVE')) current.status = 'REPLACED';
      const createdAt = input.generatedAt;
      const plan: DailyMealPlanRecord = { id: crypto.randomUUID(), profileId: input.profileId, localDate: input.localDate, targetProfileId: input.targetProfileId, policyVersion: input.policy.version, nutritionPolicyVersion: input.nutritionPolicyVersion, generatedByPolicyVersion: input.policy.version, targetSnapshot: clone(input.targetSnapshot) as DailyMealPlanRecord['targetSnapshot'], status: 'ACTIVE', source: 'DETERMINISTIC_RULES', generatedAt: input.generatedAt, createdAt, updatedAt: createdAt, remainingNutrition: emptyRemaining, items: input.items.map((item, index): MealPlanItemRecord => ({ id: crypto.randomUUID(), mealType: item.mealType, position: index + 1, status: 'PLANNED', recipe: clone(item.recipe), recipeVersionId: item.recipe.currentVersion.id, reasonCodes: item.reasonCodes, recommendationFit: item.recommendationFit, score: item.score, nutritionImpact: item.nutritionImpact })) };
      plans.push(plan); return clone(plan);
    },
    async replacePlanItem(input) { const plan = planById(input.planId, input.profileId); if (!plan) throw new NotFoundError('Rencana makan tidak ditemukan.'); const item = itemById(plan, input.itemId); if (!item) throw new NotFoundError('Item rencana makan tidak ditemukan.'); if (item.status === 'CONSUMED') throw new ConflictError('Menu yang sudah dikonsumsi tidak dapat diganti.'); item.status = 'REPLACED'; const replacement: MealPlanItemRecord = { id: crypto.randomUUID(), mealType: item.mealType, position: item.position, status: 'PLANNED', recipe: clone(input.recipe), recipeVersionId: input.recipe.currentVersion.id, reasonCodes: input.reasonCodes, recommendationFit: input.recommendationFit, score: input.score, nutritionImpact: input.nutritionImpact, ...(input.replacementReason ? { replacementReason: input.replacementReason } : {}) }; item.position += 100; plan.items.push(replacement); plan.updatedAt = now(); return clone(plan); },
    async setCooking(input) { const plan = planById(input.planId, input.profileId); const item = plan && itemById(plan, input.itemId); if (!item) throw new NotFoundError('Item rencana makan tidak ditemukan.'); if (item.status === 'CONSUMED') throw new ConflictError('Menu sudah dikonsumsi.'); item.status = 'COOKING'; return clone(item); },
    async consumePlanItem(input) {
      const plan = planById(input.planId, input.profileId); const item = plan && itemById(plan, input.itemId); if (!plan || !item) throw new NotFoundError('Item rencana makan tidak ditemukan.');
      const existing = consumptionMealIds.get(item.id); if (existing) return { plan: clone(plan), mealLogId: existing, alreadyConsumed: true };
      const meal = await baseline.createMeal(input.profileId, input.baselineSessionId, input.dayIndex, { localDate: input.localDate, mealType: input.mealType, eatenAt: input.consumedAt, description: input.recipeName, skipped: false, homeCooked: true }, input.consumedAt);
      for (const ingredient of input.ingredientItems) await nutrition.createItem({ mealLogId: meal.id, profileId: input.profileId, localDate: input.localDate, ...ingredient });
      consumptionMealIds.set(item.id, meal.id); item.status = 'CONSUMED'; item.consumedAt = input.consumedAt; plan.updatedAt = input.consumedAt;
      if (plan.items.filter((value) => value.status !== 'REPLACED').every((value) => value.status === 'CONSUMED')) plan.status = 'COMPLETED';
      return { plan: clone(plan), mealLogId: meal.id, alreadyConsumed: false };
    },
    async listPersonalRecipes(profileId) { await ensureRecipes(); return clone(recipes.filter((item) => item.ownerProfileId === profileId && !item.archivedAt)); },
    async createPersonalRecipe(profileId, input) { await ensureRecipes(); const createdAt = now(); const recipeId = crypto.randomUUID(); const currentVersion = versionFromWrite(recipeId, 1, input); if (currentVersion.nutrition) currentVersion.nutrition.recipeVersionId = currentVersion.id; const recipe: RecipeRecord = { id: recipeId, code: `USER_${profileId}_${crypto.randomUUID()}`, ownerProfileId: profileId, name: input.name, description: input.description, sourceType: 'USER_CREATED', sourceId: profileId, sourceVersion: '1', verified: false, active: true, private: true, requiresExpertValidation: true, currentVersion, createdAt, updatedAt: createdAt }; recipes.push(recipe); versions.set(recipe.id, [currentVersion]); return clone(recipe); },
    async updatePersonalRecipe(profileId, recipeId, input) { const recipe = recipes.find((item) => item.id === recipeId && item.ownerProfileId === profileId); if (!recipe) throw new NotFoundError('Resep pribadi tidak ditemukan.'); recipe.currentVersion.status = 'RETIRED'; const history = versions.get(recipe.id) ?? [recipe.currentVersion]; const next = versionFromWrite(recipe.id, history.length + 1, input); if (next.nutrition) next.nutrition.recipeVersionId = next.id; history.push(next); versions.set(recipe.id, history); recipe.currentVersion = next; recipe.name = input.name; recipe.description = input.description; recipe.sourceVersion = String(next.version); recipe.updatedAt = now(); return clone(recipe); },
    async duplicatePersonalRecipe(profileId, recipeId) { const recipe = recipes.find((item) => item.id === recipeId && item.ownerProfileId === profileId); if (!recipe) throw new NotFoundError('Resep pribadi tidak ditemukan.'); const input: RecipeVersionWriteInput = { name: `${recipe.name} (salinan)`, description: recipe.description, servings: recipe.currentVersion.servings, prepTimeMinutes: recipe.currentVersion.prepTimeMinutes, cookTimeMinutes: recipe.currentVersion.cookTimeMinutes, difficulty: recipe.currentVersion.difficulty, estimatedCostCategory: recipe.currentVersion.estimatedCostCategory, cookingMethod: recipe.currentVersion.cookingMethod, mealTypes: recipe.currentVersion.mealTypes.filter((item) => item !== 'OTHER'), ...(recipe.currentVersion.notes ? { notes: recipe.currentVersion.notes } : {}), ingredients: recipe.currentVersion.ingredients.map((item) => ({ ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}), quantity: item.quantity, foodName: item.foodName, ...(item.gramAmount ? { gramAmount: item.gramAmount } : {}), ...(item.userNutrition ? { userNutrition: item.userNutrition } : {}), sourceType: item.sourceType })), steps: recipe.currentVersion.steps.map((item) => ({ instruction: item.instruction, ...(item.timerSeconds ? { timerSeconds: item.timerSeconds } : {}) })), nutrition: { total: recipe.currentVersion.nutrition?.total ?? emptyNutrients(), perServing: recipe.currentVersion.nutrition?.perServing ?? emptyNutrients(), missingNutrients: recipe.currentVersion.nutrition?.missingNutrients ?? [...nutrientCodes], complete: recipe.currentVersion.nutrition?.complete ?? false, sourceVersions: recipe.currentVersion.nutrition?.sourceVersions ?? [], calculationVersion: recipe.currentVersion.nutrition?.calculationVersion ?? NUTRITION_ENGINE_VERSION, calculatedAt: now() } }; return this.createPersonalRecipe(profileId, input); },
    async archivePersonalRecipe(profileId, recipeId) { const recipe = recipes.find((item) => item.id === recipeId && item.ownerProfileId === profileId); if (!recipe) throw new NotFoundError('Resep pribadi tidak ditemukan.'); recipe.active = false; recipe.archivedAt = now(); recipe.updatedAt = now(); return clone(recipe); },
  };
}
