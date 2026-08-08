import { DEVELOPMENT_FOODS, DEVELOPMENT_POLICIES, DEVELOPMENT_SOURCE, nutrientCodes } from '@sarira/nutrition-engine';
import type { FoodItemRecord, FoodServingRecord, MealLogItemRecord, NutrientCode, NutritionTargetProfileRecord } from '@sarira/shared-types';
import type { NutritionFoodDetail, NutritionPolicyRecord, NutritionRepository } from '../contracts';
import { NotFoundError } from '../errors';

const now = () => new Date().toISOString();

export function createMemoryNutritionRepository(allergenLookup: (profileId: string) => string = () => ''): NutritionRepository {
  const source = { id: crypto.randomUUID(), ...DEVELOPMENT_SOURCE, importedAt: now(), active: true };
  const foods: NutritionFoodDetail[] = DEVELOPMENT_FOODS.map((seed) => {
    const foodItemId = crypto.randomUUID();
    const serving: FoodServingRecord = { id: crypto.randomUUID(), foodItemId, label: seed.servingLabel, quantity: 1, unit: seed.servingUnit as FoodServingRecord['unit'], gramEquivalent: seed.gramEquivalent, defaultServing: true, source: DEVELOPMENT_SOURCE.name, verified: false };
    const nutrients = Object.entries(seed.nutrients).map(([nutrientCode, amount]) => ({ nutrientCode: nutrientCode as NutrientCode, amount, unit: nutrientCode.endsWith('_MG') ? 'mg' : nutrientCode === 'ENERGY_KCAL' ? 'kcal' : 'g', basisAmount: 100, basisUnit: 'G' as const, sourceVersion: DEVELOPMENT_SOURCE.version }));
    return { id: foodItemId, code: seed.code, name: seed.name, alternateNames: seed.alternateNames, category: seed.category as FoodItemRecord['category'], countryCode: 'ID', language: 'id-ID', verified: false, active: true, source, servings: [serving], allergens: (seed.allergens ?? []).map((code) => ({ code: code as FoodItemRecord['allergens'][number]['code'], verified: false })), dietaryTags: (seed.tags ?? []).map((tag) => ({ code: tag.code as FoodItemRecord['dietaryTags'][number]['code'], status: tag.status })), nutrientCoverage: nutrients.map((item) => item.nutrientCode), nutrients };
  });
  const policies: NutritionPolicyRecord[] = DEVELOPMENT_POLICIES.map((policy) => ({ id: crypto.randomUUID(), code: policy.code, version: policy.version, ageMin: policy.ageMin, ageMax: policy.ageMax, applicableGoals: [], applicableSafetyStatuses: ['GREEN', 'YELLOW', 'RED'], targetConfiguration: { targets: policy.targets }, requiresExpertValidation: true }));
  const items: MealLogItemRecord[] = [];
  const itemDates = new Map<string, string>();
  const targets: NutritionTargetProfileRecord[] = [];

  const foodById = (id: string) => foods.find((food) => food.id === id) ?? null;
  const itemById = (id: string) => items.find((item) => item.id === id) ?? null;

  return {
    async listNutrients() { return nutrientCodes.map((code) => ({ code, displayName: code.replaceAll('_', ' '), unit: code.endsWith('_MG') ? 'mg' : code === 'ENERGY_KCAL' ? 'kcal' : 'g', category: code === 'ENERGY_KCAL' ? 'ENERGY' : 'MACRO_AND_LIMIT', decimalPrecision: code.endsWith('_MG') || code === 'ENERGY_KCAL' ? 0 : 1 })); },
    async searchFoods(input) {
      const query = input.query?.toLocaleLowerCase('id-ID');
      const filtered = foods.filter((food) => food.active && (!input.category || food.category === input.category) && (input.verified === undefined || food.verified === input.verified) && (!query || food.name.toLocaleLowerCase('id-ID').includes(query) || food.alternateNames.some((name) => name.toLocaleLowerCase('id-ID').includes(query))));
      const start = (input.page - 1) * input.pageSize;
      return { items: filtered.slice(start, start + input.pageSize), total: filtered.length, page: input.page, pageSize: input.pageSize };
    },
    async getFood(id) { return foodById(id); },
    async getServings(foodItemId) { return foodById(foodItemId)?.servings ?? []; },
    async getItem(id) { return itemById(id); },
    async createItem(input) {
      const { localDate, ...record } = input;
      const value: MealLogItemRecord = { id: crypto.randomUUID(), ...record, snapshot: { id: crypto.randomUUID(), ...input.snapshot }, createdAt: now(), updatedAt: now() };
      items.push(value); itemDates.set(value.id, localDate); return value;
    },
    async updateItem(id, input) {
      const value = itemById(id); if (!value) throw new NotFoundError('Item makanan tidak ditemukan.');
      Object.assign(value, { ...input, snapshot: { id: value.snapshot.id, ...input.snapshot }, updatedAt: now() }); return value;
    },
    async deleteItem(id) { const index = items.findIndex((item) => item.id === id); if (index < 0) throw new NotFoundError('Item makanan tidak ditemukan.'); items.splice(index, 1); itemDates.delete(id); },
    async listItemsForDate(profileId, localDate) { return items.filter((item) => item.profileId === profileId && itemDates.get(item.id) === localDate); },
    async getProfileAllergenText(profileId) { return allergenLookup(profileId); },
    async getActivePolicies() { return policies; },
    async getCurrentTarget(profileId, localDate) { return targets.filter((target) => target.profileId === profileId && target.effectiveFrom <= localDate && (!target.effectiveTo || target.effectiveTo >= localDate)).sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt))[0] ?? null; },
    async saveTarget(input) { for (const item of targets.filter((target) => target.profileId === input.profileId && !target.effectiveTo)) item.effectiveTo = input.target.effectiveFrom; const value = { id: crypto.randomUUID(), ...input.target }; targets.push(value); return value; },
  };
}
