import type { AgeGroup, FoodItemRecord, GoalCode, MealLogItemRecord, NutrientAmountMap, NutrientCode, NutritionSnapshotRecord, NutritionTargetEntry, NutritionTargetProfileRecord } from '@sarira/shared-types';
import type { NutritionFoodDetail, NutritionPolicyRecord, NutritionRepository } from '../contracts';
import type { SariraPrismaClient } from '../database';
import { NotFoundError } from '../errors';
import type { FoodCategory, Prisma } from '../generated/prisma/client';
import { QuestionnaireSessionStatus } from '../generated/prisma/client';

const isoDate = (value: Date) => value.toISOString().slice(0, 10);
const dateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);
const number = (value: { toNumber(): number } | number) => typeof value === 'number' ? value : value.toNumber();
const nullableNumber = (value: { toNumber(): number } | null) => value === null ? undefined : number(value);

const foodInclude = { source: true, servings: { orderBy: [{ defaultServing: 'desc' as const }, { label: 'asc' as const }] }, allergens: true, dietaryTags: true, nutrients: { include: { nutrient: true } } } satisfies Prisma.FoodItemInclude;
const itemInclude = { snapshot: true } satisfies Prisma.MealLogItemInclude;
type FoodPayload = Prisma.FoodItemGetPayload<{ include: typeof foodInclude }>;
type ItemPayload = Prisma.MealLogItemGetPayload<{ include: typeof itemInclude }>;
type SnapshotPayload = NonNullable<ItemPayload['snapshot']>;
type PolicyPayload = Prisma.NutritionPolicyGetPayload<Record<string, never>>;
type TargetPayload = Prisma.NutritionTargetProfileGetPayload<{ include: { policy: true } }>;

function sourceRecord(value: FoodPayload['source']) {
  return { id: value.id, name: value.name, publisher: value.publisher, version: value.version, sourceType: value.sourceType as FoodItemRecord['source']['sourceType'], ...(value.sourceUrl ? { sourceUrl: value.sourceUrl } : {}), license: value.license, datasetLabel: value.datasetLabel, importedAt: value.importedAt.toISOString(), ...(value.reviewedAt ? { reviewedAt: value.reviewedAt.toISOString() } : {}), active: value.active };
}

function foodRecord(value: FoodPayload): NutritionFoodDetail {
  return {
    id: value.id, code: value.code, name: value.name, alternateNames: value.alternateNames,
    category: value.category, ...(value.description ? { description: value.description } : {}),
    countryCode: value.countryCode, language: value.language, verified: value.verified, active: value.active,
    source: sourceRecord(value.source),
    servings: value.servings.map((serving) => ({ id: serving.id, foodItemId: serving.foodItemId, label: serving.label, quantity: number(serving.quantity), unit: serving.unit, ...(serving.gramEquivalent !== null ? { gramEquivalent: number(serving.gramEquivalent) } : {}), defaultServing: serving.defaultServing, source: serving.source, verified: serving.verified })),
    allergens: value.allergens.map((item) => ({ code: item.code, verified: item.verified })),
    dietaryTags: value.dietaryTags.map((item) => ({ code: item.code, status: item.status })),
    nutrientCoverage: value.nutrients.map((item) => item.nutrient.code as NutrientCode),
    nutrients: value.nutrients.map((item) => ({ nutrientCode: item.nutrient.code as NutrientCode, amount: number(item.amount), unit: item.unit, basisAmount: number(item.basisAmount), basisUnit: 'G' as const, sourceVersion: item.sourceVersion })),
  };
}

function snapshotRecord(value: SnapshotPayload): NutritionSnapshotRecord {
  const nutrients: NutrientAmountMap = {
    ENERGY_KCAL: nullableNumber(value.energyKcal) ?? null,
    PROTEIN_G: nullableNumber(value.proteinG) ?? null,
    CARBOHYDRATE_G: nullableNumber(value.carbohydrateG) ?? null,
    FAT_G: nullableNumber(value.fatG) ?? null,
    SATURATED_FAT_G: nullableNumber(value.saturatedFatG) ?? null,
    FIBER_G: nullableNumber(value.fiberG) ?? null,
    SUGAR_G: nullableNumber(value.sugarG) ?? null,
    SODIUM_MG: nullableNumber(value.sodiumMg) ?? null,
  };
  return { id: value.id, sourceVersion: value.sourceVersion, foodName: value.foodName, ...(value.gramAmount !== null ? { gramAmount: number(value.gramAmount) } : {}), nutrients, missingNutrients: value.missingNutrients as NutrientCode[], complete: value.complete, calculationVersion: value.calculationVersion };
}

function itemRecord(value: ItemPayload): MealLogItemRecord {
  if (!value.snapshot) throw new Error('Nutrition snapshot tidak tersedia.');
  return { id: value.id, mealLogId: value.mealLogId, profileId: value.profileId, ...(value.foodItemId ? { foodItemId: value.foodItemId } : {}), ...(value.servingId ? { servingId: value.servingId } : {}), itemSource: value.itemSource, ...(value.customName ? { customName: value.customName } : {}), quantity: number(value.quantity), ...(value.gramAmount !== null ? { gramAmount: number(value.gramAmount) } : {}), sourceVersion: value.sourceVersion, snapshot: snapshotRecord(value.snapshot), allergenWarnings: value.allergenWarnings as MealLogItemRecord['allergenWarnings'], createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
}

function snapshotData(snapshot: Omit<NutritionSnapshotRecord, 'id'>) {
  return {
    sourceVersion: snapshot.sourceVersion, foodName: snapshot.foodName, gramAmount: snapshot.gramAmount,
    energyKcal: snapshot.nutrients.ENERGY_KCAL, proteinG: snapshot.nutrients.PROTEIN_G,
    carbohydrateG: snapshot.nutrients.CARBOHYDRATE_G, fatG: snapshot.nutrients.FAT_G,
    saturatedFatG: snapshot.nutrients.SATURATED_FAT_G, fiberG: snapshot.nutrients.FIBER_G,
    sugarG: snapshot.nutrients.SUGAR_G, sodiumMg: snapshot.nutrients.SODIUM_MG,
    missingNutrients: snapshot.missingNutrients, complete: snapshot.complete, calculationVersion: snapshot.calculationVersion,
  };
}

function policyRecord(value: PolicyPayload): NutritionPolicyRecord {
  return { id: value.id, code: value.code, version: value.version, ageMin: value.ageMin, ageMax: value.ageMax, ...(value.applicableSex ? { applicableSex: value.applicableSex } : {}), applicableGoals: value.applicableGoals, applicableSafetyStatuses: value.applicableSafetyStatuses, targetConfiguration: value.targetConfiguration as Record<string, unknown>, requiresExpertValidation: value.requiresExpertValidation };
}

function targetEntries(value: TargetPayload): NutritionTargetEntry[] {
  return [
    value.energyMin !== null && value.energyMax !== null ? { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: number(value.energyMin), maximum: number(value.energyMax), ...(value.energyTarget !== null ? { target: number(value.energyTarget) } : {}), unit: 'kcal' } : null,
    value.proteinMin !== null ? { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: number(value.proteinMin), ...(value.proteinTarget !== null ? { target: number(value.proteinTarget) } : {}), unit: 'g' } : null,
    value.carbsMin !== null && value.carbsMax !== null ? { nutrientCode: 'CARBOHYDRATE_G', type: 'RANGE', minimum: number(value.carbsMin), maximum: number(value.carbsMax), unit: 'g' } : null,
    value.fatMin !== null && value.fatMax !== null ? { nutrientCode: 'FAT_G', type: 'RANGE', minimum: number(value.fatMin), maximum: number(value.fatMax), unit: 'g' } : null,
    value.fiberMin !== null ? { nutrientCode: 'FIBER_G', type: 'MINIMUM', minimum: number(value.fiberMin), unit: 'g' } : null,
    value.sugarMax !== null ? { nutrientCode: 'SUGAR_G', type: 'UPPER_LIMIT', maximum: number(value.sugarMax), unit: 'g' } : null,
    value.sodiumMax !== null ? { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: number(value.sodiumMax), unit: 'mg' } : null,
    value.saturatedFatMax !== null ? { nutrientCode: 'SATURATED_FAT_G', type: 'UPPER_LIMIT', maximum: number(value.saturatedFatMax), unit: 'g' } : null,
  ].filter(Boolean) as NutritionTargetEntry[];
}

function targetRecord(value: TargetPayload): NutritionTargetProfileRecord {
  return { id: value.id, profileId: value.profileId, policyCode: value.policy.code, policyVersion: value.policyVersion, ageGroup: value.ageGroup as AgeGroup, goal: value.goal as GoalCode, safetyStatus: value.safetyStatus, effectiveFrom: isoDate(value.effectiveFrom), ...(value.effectiveTo ? { effectiveTo: isoDate(value.effectiveTo) } : {}), targets: targetEntries(value), calculationReason: value.calculationReason, calculatedAt: value.calculatedAt.toISOString(), requiresExpertValidation: value.requiresExpertValidation, restricted: value.restrictionReasons.length > 0, restrictionReasons: value.restrictionReasons };
}

export function createPrismaNutritionRepository(prisma: SariraPrismaClient): NutritionRepository {
  return {
    async listNutrients() { return (await prisma.nutrientDefinition.findMany({ where: { active: true }, orderBy: { code: 'asc' } })).map((item) => ({ code: item.code as NutrientCode, displayName: item.displayName, unit: item.unit, category: item.category, decimalPrecision: item.decimalPrecision })); },
    async searchFoods(input) {
      const where: Prisma.FoodItemWhereInput = { active: true, ...(input.category ? { category: input.category as FoodCategory } : {}), ...(input.verified !== undefined ? { verified: input.verified } : {}), ...(input.query ? { OR: [{ name: { contains: input.query, mode: 'insensitive' } }, { alternateNames: { has: input.query } }, { code: { contains: input.query, mode: 'insensitive' } }] } : {}) };
      const [values, total] = await Promise.all([prisma.foodItem.findMany({ where, include: foodInclude, orderBy: [{ name: 'asc' }], skip: (input.page - 1) * input.pageSize, take: input.pageSize }), prisma.foodItem.count({ where })]);
      return { items: values.map(foodRecord), total, page: input.page, pageSize: input.pageSize };
    },
    async getFood(id) { const value = await prisma.foodItem.findUnique({ where: { id }, include: foodInclude }); return value && value.active ? foodRecord(value) : null; },
    async getServings(foodItemId) { const value = await prisma.foodItem.findUnique({ where: { id: foodItemId }, include: foodInclude }); return value ? foodRecord(value).servings : []; },
    async getItem(id) { const value = await prisma.mealLogItem.findUnique({ where: { id }, include: itemInclude }); return value ? itemRecord(value) : null; },
    async createItem(input) {
      const value = await prisma.mealLogItem.create({ data: { mealLogId: input.mealLogId, profileId: input.profileId, foodItemId: input.foodItemId, servingId: input.servingId, itemSource: input.itemSource, customName: input.customName, quantity: input.quantity, gramAmount: input.gramAmount, sourceVersion: input.sourceVersion, allergenWarnings: input.allergenWarnings as Prisma.InputJsonValue, snapshot: { create: snapshotData(input.snapshot) } }, include: itemInclude });
      return itemRecord(value);
    },
    async updateItem(id, input) {
      const value = await prisma.mealLogItem.update({ where: { id }, data: { servingId: input.servingId, quantity: input.quantity, gramAmount: input.gramAmount, sourceVersion: input.sourceVersion, allergenWarnings: input.allergenWarnings as Prisma.InputJsonValue, snapshot: { upsert: { create: snapshotData(input.snapshot), update: snapshotData(input.snapshot) } } }, include: itemInclude });
      return itemRecord(value);
    },
    async deleteItem(id) { try { await prisma.mealLogItem.delete({ where: { id } }); } catch { throw new NotFoundError('Item makanan tidak ditemukan.'); } },
    async listItemsForDate(profileId, localDate) { return (await prisma.mealLogItem.findMany({ where: { profileId, mealLog: { localDate: dateOnly(localDate) } }, include: itemInclude, orderBy: { createdAt: 'asc' } })).map(itemRecord); },
    async getProfileAllergenText(profileId) {
      const session = await prisma.questionnaireSession.findFirst({ where: { profileId, status: QuestionnaireSessionStatus.COMPLETED }, include: { answers: { include: { question: true } } }, orderBy: { completedAt: 'desc' } });
      const value = session?.answers.find((answer) => answer.question.code === 'allergy_details')?.value;
      return typeof value === 'string' ? value : '';
    },
    async getActivePolicies() { return (await prisma.nutritionPolicy.findMany({ where: { status: 'ACTIVE', effectiveFrom: { lte: new Date() }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date() } }] }, orderBy: [{ ageMin: 'asc' }, { version: 'desc' }] })).map(policyRecord); },
    async getCurrentTarget(profileId, localDate) { const value = await prisma.nutritionTargetProfile.findFirst({ where: { profileId, effectiveFrom: { lte: dateOnly(localDate) }, OR: [{ effectiveTo: null }, { effectiveTo: { gte: dateOnly(localDate) } }] }, include: { policy: true }, orderBy: { calculatedAt: 'desc' } }); return value ? targetRecord(value) : null; },
    async saveTarget({ profileId, policy, target }) {
      const entry = (code: NutrientCode) => target.targets.find((item) => item.nutrientCode === code);
      await prisma.nutritionTargetProfile.updateMany({ where: { profileId, effectiveTo: null }, data: { effectiveTo: dateOnly(target.effectiveFrom) } });
      const value = await prisma.nutritionTargetProfile.create({ data: { profileId, policyId: policy.id, policyVersion: policy.version, goal: target.goal, ageGroup: target.ageGroup, effectiveFrom: dateOnly(target.effectiveFrom), effectiveTo: target.effectiveTo ? dateOnly(target.effectiveTo) : undefined, energyMin: entry('ENERGY_KCAL')?.minimum, energyTarget: entry('ENERGY_KCAL')?.target, energyMax: entry('ENERGY_KCAL')?.maximum, proteinMin: entry('PROTEIN_G')?.minimum, proteinTarget: entry('PROTEIN_G')?.target, carbsMin: entry('CARBOHYDRATE_G')?.minimum, carbsMax: entry('CARBOHYDRATE_G')?.maximum, fatMin: entry('FAT_G')?.minimum, fatMax: entry('FAT_G')?.maximum, fiberMin: entry('FIBER_G')?.minimum, sugarMax: entry('SUGAR_G')?.maximum, sodiumMax: entry('SODIUM_MG')?.maximum, saturatedFatMax: entry('SATURATED_FAT_G')?.maximum, inputValues: { ageGroup: target.ageGroup, goal: target.goal, safetyStatus: target.safetyStatus }, calculationReason: target.calculationReason, safetyStatus: target.safetyStatus, restrictionReasons: target.restrictionReasons, requiresExpertValidation: target.requiresExpertValidation, calculatedAt: new Date(target.calculatedAt) }, include: { policy: true } });
      return targetRecord(value);
    },
  };
}
