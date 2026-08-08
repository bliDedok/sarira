import type { NutrientCode, NutritionTarget } from './index';

export const DEVELOPMENT_SOURCE = {
  name: 'SARIRA Phase 5 Synthetic Nutrition Fixtures',
  publisher: 'SARIRA Development Team',
  version: 'phase5-synthetic-v1',
  sourceType: 'SYNTHETIC_TEST_DATA' as const,
  license: 'INTERNAL-DEVELOPMENT-ONLY',
  datasetLabel: 'SYNTHETIC TEST DATA — NOT FOR NUTRITION RECOMMENDATION',
};

type FoodSeed = {
  code: string;
  name: string;
  alternateNames: string[];
  category: string;
  servingLabel: string;
  servingUnit: string;
  gramEquivalent: number;
  nutrients: Partial<Record<NutrientCode, number>>;
  allergens?: string[];
  tags?: Array<{ code: string; status: 'VERIFIED' | 'UNKNOWN' }>;
};

const n = (energy: number, protein: number, carbohydrate: number, fat: number, saturatedFat: number, fiber: number, sugar: number, sodium: number): Record<NutrientCode, number> => ({
  ENERGY_KCAL: energy, PROTEIN_G: protein, CARBOHYDRATE_G: carbohydrate, FAT_G: fat,
  SATURATED_FAT_G: saturatedFat, FIBER_G: fiber, SUGAR_G: sugar, SODIUM_MG: sodium,
});

// Nilai berikut adalah fixture sintetis yang sengaja dibulatkan untuk menguji kalkulasi.
// Nilai ini bukan hasil impor database resmi dan tidak boleh dipromosikan sebagai rekomendasi pangan.
export const DEVELOPMENT_FOODS: FoodSeed[] = [
  { code: 'DEV-NASI-PUTIH', name: 'Nasi putih matang', alternateNames: ['nasi putih'], category: 'GRAIN', servingLabel: '1 porsi (centong)', servingUnit: 'SERVING', gramEquivalent: 150, nutrients: n(130, 2.4, 28.2, 0.3, 0.1, 0.4, 0.1, 1), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-NASI-MERAH', name: 'Nasi merah matang', alternateNames: ['beras merah matang'], category: 'GRAIN', servingLabel: '1 porsi', servingUnit: 'SERVING', gramEquivalent: 150, nutrients: n(122, 2.7, 25.6, 1, 0.2, 1.6, 0.3, 4), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-TELUR-AYAM', name: 'Telur ayam matang', alternateNames: ['telur rebus'], category: 'PROTEIN', servingLabel: '1 butir', servingUnit: 'PIECE', gramEquivalent: 55, nutrients: n(155, 13, 1.1, 11, 3.3, 0, 1.1, 124), allergens: ['EGG'] },
  { code: 'DEV-TEMPE', name: 'Tempe matang', alternateNames: ['tempe kedelai'], category: 'PROTEIN', servingLabel: '1 potong', servingUnit: 'PIECE', gramEquivalent: 50, nutrients: n(190, 19, 8, 11, 2.2, 4, 1, 9), allergens: ['SOY'], tags: [{ code: 'VEGETARIAN', status: 'VERIFIED' }] },
  { code: 'DEV-TAHU', name: 'Tahu putih', alternateNames: ['tahu kedelai'], category: 'PROTEIN', servingLabel: '1 potong', servingUnit: 'PIECE', gramEquivalent: 80, nutrients: n(80, 8, 2, 5, 0.8, 1, 0.5, 12), allergens: ['SOY'], tags: [{ code: 'VEGETARIAN', status: 'VERIFIED' }] },
  { code: 'DEV-AYAM', name: 'Ayam matang tanpa kulit', alternateNames: ['daging ayam'], category: 'PROTEIN', servingLabel: '1 potong', servingUnit: 'PIECE', gramEquivalent: 100, nutrients: n(165, 31, 0, 3.6, 1, 0, 0, 74) },
  { code: 'DEV-IKAN', name: 'Ikan matang', alternateNames: ['ikan laut'], category: 'PROTEIN', servingLabel: '1 potong', servingUnit: 'PIECE', gramEquivalent: 100, nutrients: n(140, 25, 0, 4.5, 1.2, 0, 0, 70), allergens: ['FISH'] },
  { code: 'DEV-SUSU', name: 'Susu sapi', alternateNames: ['susu cair'], category: 'DAIRY', servingLabel: '1 gelas', servingUnit: 'CUP', gramEquivalent: 240, nutrients: n(61, 3.2, 4.8, 3.3, 1.9, 0, 5, 43), allergens: ['MILK'] },
  { code: 'DEV-PISANG', name: 'Pisang', alternateNames: ['banana'], category: 'FRUIT', servingLabel: '1 buah sedang', servingUnit: 'PIECE', gramEquivalent: 100, nutrients: n(89, 1.1, 22.8, 0.3, 0.1, 2.6, 12.2, 1), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-PEPAYA', name: 'Pepaya', alternateNames: ['papaya'], category: 'FRUIT', servingLabel: '1 potong', servingUnit: 'PIECE', gramEquivalent: 140, nutrients: n(43, 0.5, 10.8, 0.3, 0.1, 1.7, 7.8, 8), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-BAYAM', name: 'Bayam matang', alternateNames: ['sayur bayam'], category: 'VEGETABLE', servingLabel: '1 mangkuk kecil', servingUnit: 'CUP', gramEquivalent: 100, nutrients: n(23, 3, 3.8, 0.3, 0.1, 2.4, 0.4, 70), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-WORTEL', name: 'Wortel matang', alternateNames: ['carrot'], category: 'VEGETABLE', servingLabel: '1 buah sedang', servingUnit: 'PIECE', gramEquivalent: 80, nutrients: n(35, 0.8, 8.2, 0.2, 0, 3, 3.5, 58), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
  { code: 'DEV-ROTI', name: 'Roti gandum', alternateNames: ['roti tawar gandum'], category: 'GRAIN', servingLabel: '1 lembar', servingUnit: 'PIECE', gramEquivalent: 30, nutrients: n(250, 12, 43, 4, 0.8, 7, 6, 430), allergens: ['WHEAT'] },
  { code: 'DEV-OATMEAL', name: 'Oatmeal matang', alternateNames: ['oat'], category: 'GRAIN', servingLabel: '1 mangkuk', servingUnit: 'CUP', gramEquivalent: 230, nutrients: { ENERGY_KCAL: 70, PROTEIN_G: 2.5, CARBOHYDRATE_G: 12, FAT_G: 1.4, SATURATED_FAT_G: 0.2, FIBER_G: 1.7, SUGAR_G: 0.2 }, allergens: ['WHEAT'] },
  { code: 'DEV-AIR', name: 'Air putih', alternateNames: ['air minum'], category: 'BEVERAGE', servingLabel: '1 gelas', servingUnit: 'CUP', gramEquivalent: 240, nutrients: n(0, 0, 0, 0, 0, 0, 0, 0), tags: [{ code: 'VEGAN', status: 'VERIFIED' }] },
];

export const DEVELOPMENT_POLICIES: Array<{ code: string; version: string; ageMin: number; ageMax: number; targets: NutritionTarget[] }> = [
  { code: 'TEEN_GENERAL', version: 'phase5-dev-v1', ageMin: 12, ageMax: 17, targets: [
    { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: 1800, maximum: 2200, unit: 'kcal' },
    { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: 50, unit: 'g' }, { nutrientCode: 'CARBOHYDRATE_G', type: 'RANGE', minimum: 220, maximum: 320, unit: 'g' },
    { nutrientCode: 'FAT_G', type: 'RANGE', minimum: 50, maximum: 80, unit: 'g' }, { nutrientCode: 'FIBER_G', type: 'MINIMUM', minimum: 25, unit: 'g' },
    { nutrientCode: 'SUGAR_G', type: 'UPPER_LIMIT', maximum: 50, unit: 'g' }, { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }, { nutrientCode: 'SATURATED_FAT_G', type: 'UPPER_LIMIT', maximum: 20, unit: 'g' },
  ] },
  { code: 'YOUNG_ADULT_GENERAL', version: 'phase5-dev-v1', ageMin: 18, ageMax: 25, targets: [
    { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: 1800, maximum: 2200, unit: 'kcal' }, { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: 60, unit: 'g' },
    { nutrientCode: 'CARBOHYDRATE_G', type: 'RANGE', minimum: 225, maximum: 330, unit: 'g' }, { nutrientCode: 'FAT_G', type: 'RANGE', minimum: 50, maximum: 80, unit: 'g' },
    { nutrientCode: 'FIBER_G', type: 'MINIMUM', minimum: 28, unit: 'g' }, { nutrientCode: 'SUGAR_G', type: 'UPPER_LIMIT', maximum: 50, unit: 'g' },
    { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }, { nutrientCode: 'SATURATED_FAT_G', type: 'UPPER_LIMIT', maximum: 20, unit: 'g' },
  ] },
  { code: 'ADULT_GENERAL', version: 'phase5-dev-v1', ageMin: 26, ageMax: 59, targets: [
    { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: 1750, maximum: 2150, unit: 'kcal' }, { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: 60, unit: 'g' },
    { nutrientCode: 'CARBOHYDRATE_G', type: 'RANGE', minimum: 220, maximum: 320, unit: 'g' }, { nutrientCode: 'FAT_G', type: 'RANGE', minimum: 50, maximum: 75, unit: 'g' },
    { nutrientCode: 'FIBER_G', type: 'MINIMUM', minimum: 28, unit: 'g' }, { nutrientCode: 'SUGAR_G', type: 'UPPER_LIMIT', maximum: 50, unit: 'g' },
    { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }, { nutrientCode: 'SATURATED_FAT_G', type: 'UPPER_LIMIT', maximum: 20, unit: 'g' },
  ] },
  { code: 'HEALTHY_AGING_GENERAL', version: 'phase5-dev-v1', ageMin: 60, ageMax: 75, targets: [
    { nutrientCode: 'ENERGY_KCAL', type: 'RANGE', minimum: 1700, maximum: 2100, unit: 'kcal' }, { nutrientCode: 'PROTEIN_G', type: 'MINIMUM', minimum: 65, unit: 'g' },
    { nutrientCode: 'CARBOHYDRATE_G', type: 'RANGE', minimum: 210, maximum: 310, unit: 'g' }, { nutrientCode: 'FAT_G', type: 'RANGE', minimum: 50, maximum: 75, unit: 'g' },
    { nutrientCode: 'FIBER_G', type: 'MINIMUM', minimum: 28, unit: 'g' }, { nutrientCode: 'SUGAR_G', type: 'UPPER_LIMIT', maximum: 45, unit: 'g' },
    { nutrientCode: 'SODIUM_MG', type: 'UPPER_LIMIT', maximum: 2000, unit: 'mg' }, { nutrientCode: 'SATURATED_FAT_G', type: 'UPPER_LIMIT', maximum: 18, unit: 'g' },
  ] },
];
