import { emptyNutrients, NUTRITION_ENGINE_VERSION, nutrientCodes } from '@sarira/nutrition-engine';
import type { DailyMealPlanRecord, FoodItemRecord, MealPlanItemRecord, NutrientAmountMap, RecipeIngredientRecord, RecipeRecord, RecipeVersionRecord } from '@sarira/shared-types';
import type { MealPlanningPolicyRecord, MealPlanningRepository, RecipeVersionWriteInput } from '../contracts';
import type { SariraPrismaClient } from '../database';
import { ConflictError, NotFoundError } from '../errors';
import { MealPlanItemStatus, MealPlanStatus, RecipeSourceType, RecipeVersionStatus } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

const number = (value: { toNumber(): number } | number) => typeof value === 'number' ? value : value.toNumber();
const dateOnly = (value: Date) => value.toISOString().slice(0, 10);

const foodInclude = { source: true, servings: { orderBy: [{ defaultServing: 'desc' as const }, { label: 'asc' as const }] }, allergens: true, dietaryTags: true, nutrients: { include: { nutrient: true } } } satisfies Prisma.FoodItemInclude;
const recipeVersionInclude = { ingredients: { include: { foodItem: { include: foodInclude }, serving: true }, orderBy: { orderIndex: 'asc' as const } }, steps: { orderBy: { orderIndex: 'asc' as const } }, nutritionSnapshot: true } satisfies Prisma.RecipeVersionInclude;
const recipeInclude = { versions: { where: { status: RecipeVersionStatus.ACTIVE }, include: recipeVersionInclude, orderBy: { version: 'desc' as const }, take: 1 } } satisfies Prisma.RecipeInclude;
const planInclude = { items: { include: { recipe: true, recipeVersion: { include: recipeVersionInclude } }, orderBy: [{ mealType: 'asc' as const }, { position: 'asc' as const }] } } satisfies Prisma.DailyMealPlanInclude;

type FoodPayload = Prisma.FoodItemGetPayload<{ include: typeof foodInclude }>;
type VersionPayload = Prisma.RecipeVersionGetPayload<{ include: typeof recipeVersionInclude }>;
type RecipePayload = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>;
type PlanPayload = Prisma.DailyMealPlanGetPayload<{ include: typeof planInclude }>;

function foodRecord(value: FoodPayload): FoodItemRecord {
  return {
    id: value.id, code: value.code, name: value.name, alternateNames: value.alternateNames, category: value.category,
    ...(value.description ? { description: value.description } : {}), countryCode: value.countryCode, language: value.language,
    verified: value.verified, active: value.active,
    source: { id: value.source.id, name: value.source.name, publisher: value.source.publisher, version: value.source.version, sourceType: value.source.sourceType, ...(value.source.sourceUrl ? { sourceUrl: value.source.sourceUrl } : {}), license: value.source.license, datasetLabel: value.source.datasetLabel, importedAt: value.source.importedAt.toISOString(), ...(value.source.reviewedAt ? { reviewedAt: value.source.reviewedAt.toISOString() } : {}), active: value.source.active },
    servings: value.servings.map((item) => ({ id: item.id, foodItemId: item.foodItemId, label: item.label, quantity: number(item.quantity), unit: item.unit, ...(item.gramEquivalent !== null ? { gramEquivalent: number(item.gramEquivalent) } : {}), defaultServing: item.defaultServing, source: item.source, verified: item.verified })),
    allergens: value.allergens.map((item) => ({ code: item.code, verified: item.verified })),
    dietaryTags: value.dietaryTags.map((item) => ({ code: item.code, status: item.status })),
    nutrientCoverage: value.nutrients.map((item) => item.nutrient.code as NonNullable<FoodItemRecord['nutrientCoverage']>[number]),
  };
}

function nutritionMap(snapshot: VersionPayload['nutritionSnapshot'], total: boolean): NutrientAmountMap {
  if (!snapshot) return emptyNutrients();
  if (!total) return snapshot.perServing as unknown as NutrientAmountMap;
  return {
    ENERGY_KCAL: snapshot.totalEnergyKcal === null ? null : number(snapshot.totalEnergyKcal),
    PROTEIN_G: snapshot.totalProteinG === null ? null : number(snapshot.totalProteinG),
    CARBOHYDRATE_G: snapshot.totalCarbohydrateG === null ? null : number(snapshot.totalCarbohydrateG),
    FAT_G: snapshot.totalFatG === null ? null : number(snapshot.totalFatG),
    SATURATED_FAT_G: snapshot.totalSaturatedFatG === null ? null : number(snapshot.totalSaturatedFatG),
    FIBER_G: snapshot.totalFiberG === null ? null : number(snapshot.totalFiberG),
    SUGAR_G: snapshot.totalSugarG === null ? null : number(snapshot.totalSugarG),
    SODIUM_MG: snapshot.totalSodiumMg === null ? null : number(snapshot.totalSodiumMg),
  };
}

function versionRecord(value: VersionPayload): RecipeVersionRecord {
  const ingredients: RecipeIngredientRecord[] = value.ingredients.map((item) => ({
    id: item.id, ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}),
    foodName: item.foodItem?.name ?? item.customName ?? 'Bahan custom', quantity: number(item.quantity), ...(item.gramAmount !== null ? { gramAmount: number(item.gramAmount) } : {}),
    ...(item.preparationNote ? { preparationNote: item.preparationNote } : {}), optional: item.optional, ...(item.replacementGroup ? { replacementGroup: item.replacementGroup } : {}), orderIndex: item.orderIndex, sourceType: item.sourceType,
    ...(item.userNutrition && typeof item.userNutrition === 'object' && !Array.isArray(item.userNutrition) ? { userNutrition: item.userNutrition as Partial<NutrientAmountMap> } : {}),
    ...(item.foodItem ? { food: foodRecord(item.foodItem) } : {}),
  }));
  return {
    id: value.id, recipeId: value.recipeId, version: value.version, status: value.status, servings: number(value.servings), prepTimeMinutes: value.prepTimeMinutes,
    cookTimeMinutes: value.cookTimeMinutes, difficulty: value.difficulty, estimatedCostCategory: value.estimatedCostCategory, cookingMethod: value.cookingMethod,
    mealTypes: value.mealTypes, dietaryTags: value.dietaryTags, equipment: value.equipment, ...(value.notes ? { notes: value.notes } : {}), verified: value.verified,
    requiresExpertValidation: value.requiresExpertValidation, ...(value.publishedAt ? { publishedAt: value.publishedAt.toISOString() } : {}),
    ingredients, steps: value.steps.map((item) => ({ id: item.id, orderIndex: item.orderIndex, instruction: item.instruction, ...(item.timerSeconds ? { timerSeconds: item.timerSeconds } : {}) })),
    ...(value.nutritionSnapshot ? { nutrition: { id: value.nutritionSnapshot.id, recipeVersionId: value.id, total: nutritionMap(value.nutritionSnapshot, true), perServing: nutritionMap(value.nutritionSnapshot, false), missingNutrients: value.nutritionSnapshot.missingNutrients as NonNullable<RecipeVersionRecord['nutrition']>['missingNutrients'], complete: value.nutritionSnapshot.complete, sourceVersions: value.nutritionSnapshot.sourceVersions, calculationVersion: value.nutritionSnapshot.calculationVersion, calculatedAt: value.nutritionSnapshot.calculatedAt.toISOString() } } : {}),
    createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(),
  };
}

function recipeRecord(value: Omit<RecipePayload, 'versions'> & { versions: VersionPayload[] }): RecipeRecord {
  const currentVersion = value.versions[0]; if (!currentVersion) throw new ConflictError('Resep tidak memiliki versi aktif.');
  return { id: value.id, code: value.code, ...(value.ownerProfileId ? { ownerProfileId: value.ownerProfileId } : {}), name: value.name, description: value.description, sourceType: value.sourceType, sourceId: value.sourceId, sourceVersion: value.sourceVersion, verified: value.verified, active: value.active, private: value.private, ...(value.archivedAt ? { archivedAt: value.archivedAt.toISOString() } : {}), requiresExpertValidation: value.requiresExpertValidation, currentVersion: versionRecord(currentVersion), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
}

function planRecord(value: PlanPayload): DailyMealPlanRecord {
  const items = value.items.map((item): MealPlanItemRecord => ({
    id: item.id, mealType: item.mealType, position: item.position, status: item.status,
    recipe: recipeRecord({ ...item.recipe, versions: [item.recipeVersion] }), recipeVersionId: item.recipeVersionId,
    reasonCodes: item.reasonCodes, recommendationFit: item.recommendationFit as MealPlanItemRecord['recommendationFit'], score: number(item.score), nutritionImpact: item.nutritionImpact as unknown as NutrientAmountMap,
    ...(item.replacementReason ? { replacementReason: item.replacementReason } : {}), ...(item.consumedAt ? { consumedAt: item.consumedAt.toISOString() } : {}),
  }));
  return { id: value.id, profileId: value.profileId, localDate: dateOnly(value.localDate), targetProfileId: value.targetProfileId, policyVersion: value.policyVersion, nutritionPolicyVersion: value.nutritionPolicyVersion, generatedByPolicyVersion: value.generatedByPolicyVersion, targetSnapshot: value.targetSnapshot as unknown as DailyMealPlanRecord['targetSnapshot'], status: value.status, source: value.source, generatedAt: value.generatedAt.toISOString(), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString(), remainingNutrition: Object.fromEntries(nutrientCodes.map((code) => [code, undefined])) as DailyMealPlanRecord['remainingNutrition'], items };
}

function snapshotData(nutrition: RecipeVersionWriteInput['nutrition']) {
  const total = nutrition.total;
  return { totalEnergyKcal: total.ENERGY_KCAL, totalProteinG: total.PROTEIN_G, totalCarbohydrateG: total.CARBOHYDRATE_G, totalFatG: total.FAT_G, totalSaturatedFatG: total.SATURATED_FAT_G, totalFiberG: total.FIBER_G, totalSugarG: total.SUGAR_G, totalSodiumMg: total.SODIUM_MG, perServing: nutrition.perServing as Prisma.InputJsonValue, missingNutrients: nutrition.missingNutrients, complete: nutrition.complete, sourceVersions: nutrition.sourceVersions, calculationVersion: nutrition.calculationVersion, calculatedAt: new Date(nutrition.calculatedAt) };
}

export function createPrismaMealPlanningRepository(prisma: SariraPrismaClient): MealPlanningRepository {
  const createPersonal = async (profileId: string, input: RecipeVersionWriteInput) => {
    const value = await prisma.recipe.create({ data: { code: `USER_${profileId}_${crypto.randomUUID()}`, ownerProfileId: profileId, name: input.name, description: input.description, sourceType: RecipeSourceType.USER_CREATED, sourceId: profileId, sourceVersion: '1', verified: false, private: true, requiresExpertValidation: true, versions: { create: { version: 1, status: RecipeVersionStatus.ACTIVE, servings: input.servings, prepTimeMinutes: input.prepTimeMinutes, cookTimeMinutes: input.cookTimeMinutes, difficulty: input.difficulty, estimatedCostCategory: input.estimatedCostCategory, cookingMethod: input.cookingMethod, mealTypes: input.mealTypes, dietaryTags: [], equipment: [], notes: input.notes, verified: false, requiresExpertValidation: true, publishedAt: new Date(input.nutrition.calculatedAt), ingredients: { create: input.ingredients.map((item, index) => ({ foodItemId: item.foodItemId, servingId: item.servingId, customName: item.customName, quantity: item.quantity, gramAmount: item.gramAmount, orderIndex: index + 1, sourceType: item.sourceType, userNutrition: item.userNutrition as Prisma.InputJsonValue | undefined })) }, steps: { create: input.steps.map((item, index) => ({ orderIndex: index + 1, instruction: item.instruction, timerSeconds: item.timerSeconds })) }, nutritionSnapshot: { create: snapshotData(input.nutrition) } } } }, include: recipeInclude });
    return recipeRecord(value);
  };

  return {
    async getActivePolicy() { const value = await prisma.mealPlanningPolicy.findFirst({ where: { status: 'ACTIVE', effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] }, orderBy: { effectiveFrom: 'desc' } }); if (!value) return null; return { id: value.id, code: value.code, version: value.version, configuration: value.configuration as unknown as MealPlanningPolicyRecord['configuration'], requiresProductValidation: value.requiresProductValidation }; },
    async listRecipes(input) { const where: Prisma.RecipeWhereInput = { active: true, archivedAt: null, OR: [{ private: false }, { ownerProfileId: input.profileId }], ...(input.query ? { name: { contains: input.query, mode: 'insensitive' } } : {}), ...(input.mealType ? { versions: { some: { status: RecipeVersionStatus.ACTIVE, mealTypes: { has: input.mealType as never } } } } : {}) }; const [values, total] = await Promise.all([prisma.recipe.findMany({ where, include: recipeInclude, orderBy: { name: 'asc' }, skip: (input.page - 1) * input.pageSize, take: input.pageSize }), prisma.recipe.count({ where })]); return { items: values.map(recipeRecord), total, page: input.page, pageSize: input.pageSize }; },
    async getRecipe(id, profileId) { const value = await prisma.recipe.findFirst({ where: { id, active: true, archivedAt: null, OR: [{ private: false }, { ownerProfileId: profileId }] }, include: recipeInclude }); return value ? recipeRecord(value) : null; },
    async getCurrentPlan(profileId, localDate) { const value = await prisma.dailyMealPlan.findFirst({ where: { profileId, localDate: new Date(`${localDate}T00:00:00.000Z`), status: MealPlanStatus.ACTIVE }, include: planInclude, orderBy: { generatedAt: 'desc' } }); return value ? planRecord(value) : null; },
    async getPlan(id, profileId) { const value = await prisma.dailyMealPlan.findFirst({ where: { id, profileId }, include: planInclude }); return value ? planRecord(value) : null; },
    async createPlan(input) {
      return prisma.$transaction(async (tx) => {
        await tx.dailyMealPlan.updateMany({ where: { profileId: input.profileId, localDate: new Date(`${input.localDate}T00:00:00.000Z`), status: MealPlanStatus.ACTIVE }, data: { status: MealPlanStatus.REPLACED } });
        const value = await tx.dailyMealPlan.create({ data: { profileId: input.profileId, localDate: new Date(`${input.localDate}T00:00:00.000Z`), targetProfileId: input.targetProfileId, mealPlanningPolicyId: input.policy.id, policyVersion: input.policy.version, nutritionPolicyVersion: input.nutritionPolicyVersion, generatedByPolicyVersion: input.policy.version, targetSnapshot: input.targetSnapshot as Prisma.InputJsonValue, generatedAt: new Date(input.generatedAt), items: { create: input.items.map((item, index) => ({ mealType: item.mealType, recipeId: item.recipe.id, recipeVersionId: item.recipe.currentVersion.id, position: index + 1, reasonCodes: item.reasonCodes, recommendationFit: item.recommendationFit, score: item.score, nutritionImpact: item.nutritionImpact as Prisma.InputJsonValue, snapshot: { create: { recipeVersionId: item.recipe.currentVersion.id, recipeName: item.recipe.name, recipeVersion: item.recipe.currentVersion.version, servings: item.recipe.currentVersion.servings, nutritionPerServing: (item.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients()) as Prisma.InputJsonValue, ingredients: item.recipe.currentVersion.ingredients as unknown as Prisma.InputJsonValue, sourceVersion: item.recipe.sourceVersion, calculationVersion: item.recipe.currentVersion.nutrition?.calculationVersion ?? NUTRITION_ENGINE_VERSION } } })) } }, include: planInclude });
        return planRecord(value);
      });
    },
    async replacePlanItem(input) { return prisma.$transaction(async (tx) => { const current = await tx.dailyMealPlanItem.findFirst({ where: { id: input.itemId, mealPlanId: input.planId, mealPlan: { profileId: input.profileId } } }); if (!current) throw new NotFoundError('Item rencana makan tidak ditemukan.'); if (current.status === MealPlanItemStatus.CONSUMED) throw new ConflictError('Menu yang sudah dikonsumsi tidak dapat diganti.'); await tx.dailyMealPlanItem.update({ where: { id: current.id }, data: { status: MealPlanItemStatus.REPLACED, position: current.position + 100 } }); await tx.dailyMealPlanItem.create({ data: { mealPlanId: input.planId, mealType: current.mealType, recipeId: input.recipe.id, recipeVersionId: input.recipe.currentVersion.id, position: current.position, reasonCodes: input.reasonCodes, recommendationFit: input.recommendationFit, score: input.score, nutritionImpact: input.nutritionImpact as Prisma.InputJsonValue, replacementReason: input.replacementReason, replacedFromItemId: current.id, snapshot: { create: { recipeVersionId: input.recipe.currentVersion.id, recipeName: input.recipe.name, recipeVersion: input.recipe.currentVersion.version, servings: input.recipe.currentVersion.servings, nutritionPerServing: (input.recipe.currentVersion.nutrition?.perServing ?? emptyNutrients()) as Prisma.InputJsonValue, ingredients: input.recipe.currentVersion.ingredients as unknown as Prisma.InputJsonValue, sourceVersion: input.recipe.sourceVersion, calculationVersion: input.recipe.currentVersion.nutrition?.calculationVersion ?? NUTRITION_ENGINE_VERSION } } } }); const plan = await tx.dailyMealPlan.findFirstOrThrow({ where: { id: input.planId, profileId: input.profileId }, include: planInclude }); return planRecord(plan); }); },
    async setCooking(input) { const item = await prisma.dailyMealPlanItem.update({ where: { id: input.itemId, mealPlanId: input.planId, mealPlan: { profileId: input.profileId }, status: { in: [MealPlanItemStatus.PLANNED, MealPlanItemStatus.COOKING] } }, data: { status: MealPlanItemStatus.COOKING }, include: { recipe: true, recipeVersion: { include: recipeVersionInclude } } }); return planRecord({ ...(await prisma.dailyMealPlan.findUniqueOrThrow({ where: { id: item.mealPlanId }, include: planInclude })) }).items.find((value) => value.id === item.id)!; },
    async consumePlanItem(input) {
      const existing = await prisma.mealPlanConsumption.findUnique({ where: { mealPlanItemId: input.itemId }, include: { mealPlanItem: { include: { mealPlan: { include: planInclude } } } } });
      if (existing) return { plan: planRecord(existing.mealPlanItem.mealPlan), mealLogId: existing.mealLogId, alreadyConsumed: true };
      return prisma.$transaction(async (tx) => {
        const item = await tx.dailyMealPlanItem.findFirst({ where: { id: input.itemId, mealPlanId: input.planId, mealPlan: { profileId: input.profileId } } }); if (!item) throw new NotFoundError('Item rencana makan tidak ditemukan.'); if (item.status === MealPlanItemStatus.CONSUMED) throw new ConflictError('Konsumsi sudah tercatat.');
        const daily = await tx.dailyRecord.upsert({ where: { baselineSessionId_localDate: { baselineSessionId: input.baselineSessionId, localDate: new Date(`${input.localDate}T00:00:00.000Z`) } }, update: {}, create: { baselineSessionId: input.baselineSessionId, profileId: input.profileId, localDate: new Date(`${input.localDate}T00:00:00.000Z`), dayIndex: input.dayIndex } });
        const meal = await tx.mealLog.create({ data: { profileId: input.profileId, baselineSessionId: input.baselineSessionId, dailyRecordId: daily.id, localDate: new Date(`${input.localDate}T00:00:00.000Z`), mealType: input.mealType, eatenAt: new Date(input.consumedAt), description: input.recipeName, homeCooked: true, items: { create: input.ingredientItems.map((ingredient) => ({ foodItemId: ingredient.foodItemId, servingId: ingredient.servingId, itemSource: ingredient.itemSource, customName: ingredient.customName, quantity: ingredient.quantity, gramAmount: ingredient.gramAmount, sourceVersion: ingredient.sourceVersion, allergenWarnings: ingredient.allergenWarnings as Prisma.InputJsonValue, profileId: input.profileId, snapshot: { create: { sourceVersion: ingredient.snapshot.sourceVersion, foodName: ingredient.snapshot.foodName, gramAmount: ingredient.snapshot.gramAmount, energyKcal: ingredient.snapshot.nutrients.ENERGY_KCAL, proteinG: ingredient.snapshot.nutrients.PROTEIN_G, carbohydrateG: ingredient.snapshot.nutrients.CARBOHYDRATE_G, fatG: ingredient.snapshot.nutrients.FAT_G, saturatedFatG: ingredient.snapshot.nutrients.SATURATED_FAT_G, fiberG: ingredient.snapshot.nutrients.FIBER_G, sugarG: ingredient.snapshot.nutrients.SUGAR_G, sodiumMg: ingredient.snapshot.nutrients.SODIUM_MG, missingNutrients: ingredient.snapshot.missingNutrients, complete: ingredient.snapshot.complete, calculationVersion: ingredient.snapshot.calculationVersion } } })) } } });
        await tx.mealPlanConsumption.create({ data: { mealPlanItemId: item.id, mealLogId: meal.id, consumedFraction: input.fraction, consumedAt: new Date(input.consumedAt) } });
        await tx.dailyMealPlanItem.update({ where: { id: item.id }, data: { status: MealPlanItemStatus.CONSUMED, consumedAt: new Date(input.consumedAt) } });
        const remaining = await tx.dailyMealPlanItem.count({ where: { mealPlanId: input.planId, status: { in: [MealPlanItemStatus.PLANNED, MealPlanItemStatus.COOKING] } } }); if (remaining === 0) await tx.dailyMealPlan.update({ where: { id: input.planId }, data: { status: MealPlanStatus.COMPLETED } });
        const plan = await tx.dailyMealPlan.findFirstOrThrow({ where: { id: input.planId, profileId: input.profileId }, include: planInclude }); return { plan: planRecord(plan), mealLogId: meal.id, alreadyConsumed: false };
      });
    },
    async listPersonalRecipes(profileId) { const values = await prisma.recipe.findMany({ where: { ownerProfileId: profileId, archivedAt: null }, include: recipeInclude, orderBy: { updatedAt: 'desc' } }); return values.map(recipeRecord); },
    async createPersonalRecipe(profileId, input) { return createPersonal(profileId, input); },
    async updatePersonalRecipe(profileId, recipeId, input) { return prisma.$transaction(async (tx) => { const recipe = await tx.recipe.findFirst({ where: { id: recipeId, ownerProfileId: profileId, archivedAt: null }, include: { versions: { orderBy: { version: 'desc' }, take: 1 } } }); if (!recipe) throw new NotFoundError('Resep pribadi tidak ditemukan.'); await tx.recipeVersion.updateMany({ where: { recipeId, status: RecipeVersionStatus.ACTIVE }, data: { status: RecipeVersionStatus.RETIRED } }); const version = (recipe.versions[0]?.version ?? 0) + 1; await tx.recipe.update({ where: { id: recipeId }, data: { name: input.name, description: input.description, sourceVersion: String(version), versions: { create: { version, status: RecipeVersionStatus.ACTIVE, servings: input.servings, prepTimeMinutes: input.prepTimeMinutes, cookTimeMinutes: input.cookTimeMinutes, difficulty: input.difficulty, estimatedCostCategory: input.estimatedCostCategory, cookingMethod: input.cookingMethod, mealTypes: input.mealTypes, dietaryTags: [], equipment: [], notes: input.notes, verified: false, requiresExpertValidation: true, publishedAt: new Date(input.nutrition.calculatedAt), ingredients: { create: input.ingredients.map((item, index) => ({ foodItemId: item.foodItemId, servingId: item.servingId, customName: item.customName, quantity: item.quantity, gramAmount: item.gramAmount, orderIndex: index + 1, sourceType: item.sourceType, userNutrition: item.userNutrition as Prisma.InputJsonValue | undefined })) }, steps: { create: input.steps.map((item, index) => ({ orderIndex: index + 1, instruction: item.instruction, timerSeconds: item.timerSeconds })) }, nutritionSnapshot: { create: snapshotData(input.nutrition) } } } } }); return recipeRecord(await tx.recipe.findUniqueOrThrow({ where: { id: recipeId }, include: recipeInclude })); }); },
    async duplicatePersonalRecipe(profileId, recipeId) { const recipe = await prisma.recipe.findFirst({ where: { id: recipeId, ownerProfileId: profileId, archivedAt: null }, include: recipeInclude }); if (!recipe) throw new NotFoundError('Resep pribadi tidak ditemukan.'); const record = recipeRecord(recipe); const version = record.currentVersion; return createPersonal(profileId, { name: `${record.name} (salinan)`, description: record.description, servings: version.servings, prepTimeMinutes: version.prepTimeMinutes, cookTimeMinutes: version.cookTimeMinutes, difficulty: version.difficulty, estimatedCostCategory: version.estimatedCostCategory, cookingMethod: version.cookingMethod, mealTypes: version.mealTypes.filter((item): item is 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' => item !== 'OTHER'), ...(version.notes ? { notes: version.notes } : {}), ingredients: version.ingredients.map((item) => ({ ...(item.foodItemId ? { foodItemId: item.foodItemId } : {}), ...(item.servingId ? { servingId: item.servingId } : {}), ...(item.customName ? { customName: item.customName } : {}), quantity: item.quantity, foodName: item.foodName, ...(item.gramAmount ? { gramAmount: item.gramAmount } : {}), ...(item.userNutrition ? { userNutrition: item.userNutrition } : {}), sourceType: item.sourceType })), steps: version.steps.map((item) => ({ instruction: item.instruction, ...(item.timerSeconds ? { timerSeconds: item.timerSeconds } : {}) })), nutrition: { total: version.nutrition?.total ?? emptyNutrients(), perServing: version.nutrition?.perServing ?? emptyNutrients(), missingNutrients: version.nutrition?.missingNutrients ?? [...nutrientCodes], complete: version.nutrition?.complete ?? false, sourceVersions: version.nutrition?.sourceVersions ?? [], calculationVersion: version.nutrition?.calculationVersion ?? NUTRITION_ENGINE_VERSION, calculatedAt: new Date().toISOString() } }); },
    async archivePersonalRecipe(profileId, recipeId) { const current = await prisma.recipe.findFirst({ where: { id: recipeId, ownerProfileId: profileId, archivedAt: null } }); if (!current) throw new NotFoundError('Resep pribadi tidak ditemukan.'); return recipeRecord(await prisma.recipe.update({ where: { id: recipeId }, data: { active: false, archivedAt: new Date() }, include: recipeInclude })); },
  };
}
