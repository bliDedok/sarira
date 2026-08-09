import 'dotenv/config';
import { createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { phase3DevelopmentSafetyRules, phase3GoalConfigurations, PHASE_3_CONTENT_STATUS, PHASE_3_RULE_VERSION } from '../packages/expert-system/src/index';
import { calculateFoodNutrition, calculateRecipeNutrition, DEVELOPMENT_FOODS, DEVELOPMENT_POLICIES, DEVELOPMENT_SOURCE, NUTRITION_ENGINE_VERSION, nutrientCodes } from '../packages/nutrition-engine/src/index';
import {
  ConsentType,
  ContentStatus,
  Prisma,
  PrismaClient,
  QuestionnaireValueType,
  Role,
  SafetyStatus,
  FoodCategory,
  FoodSourceType,
  FoodUnit,
  AllergenCode,
  DietaryTagCode,
  DietaryTagStatus,
  NutritionPolicyStatus,
  RecipeSourceType,
  RecipeVersionStatus,
  RecipeDifficulty,
  EstimatedCostCategory,
  CookingMethod,
  MealPlanningPolicyStatus,
} from '../apps/api/src/generated/prisma/client';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? 'postgresql://sarira:sarira_dev_only@localhost:54322/sarira?schema=public';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const version = 'phase3-dev-v1';
const activeAt = new Date('2026-08-08T00:00:00.000Z');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

const consentContent = [
  [ConsentType.TERMS_OF_SERVICE, 'Ketentuan Layanan', 'Ketentuan penggunaan SARIRA.', true],
  [ConsentType.PRIVACY_POLICY, 'Kebijakan Privasi', 'Cara data diproses dan hak pengguna.', true],
  [ConsentType.HEALTH_PROFILE, 'Profil Kesehatan', 'Pemrosesan jawaban safety dan kuesioner onboarding.', true],
  [ConsentType.NUTRITION_DATA, 'Data Nutrisi', 'Opsional; pemrosesan catatan pangan, target, dan indikator nutrisi.', false],
  [ConsentType.ACTIVITY_DATA, 'Data Aktivitas', 'Opsional; izin dapat diubah dari Settings.', false],
  [ConsentType.SLEEP_DATA, 'Data Tidur', 'Opsional; izin dapat diubah dari Settings.', false],
  [ConsentType.CAMERA_FOOD, 'Kamera Makanan', 'Opsional dan diminta saat fitur digunakan.', false],
  [ConsentType.CAMERA_WORKOUT, 'Kamera Latihan', 'Opsional dan diminta saat fitur digunakan.', false],
  [ConsentType.LOCATION, 'Lokasi', 'Opsional; tidak diminta pada onboarding.', false],
  [ConsentType.WEARABLE, 'Perangkat Wearable', 'Opsional; input manual tetap tersedia.', false],
  [ConsentType.BODY_PHOTO, 'Foto Tubuh', 'Opsional; tidak diaktifkan pada Phase 3.', false],
  [ConsentType.CHILD_DATA, 'Data Anak', 'Kondisional untuk profil tanggungan di fase berikutnya.', false],
] as const;

const safetyQuestions = [
  { code: 'concerning_change', category: 'GENERAL', prompt: 'Apakah ada perubahan kondisi yang terasa mengkhawatirkan?', helpText: 'Pilih Tidak yakin bila kamu belum dapat menilai.', required: true, allowsUnknown: true, sortOrder: 1 },
  { code: 'professional_restriction', category: 'GENERAL', prompt: 'Apakah program atau aktivitas tertentu sedang dibatasi tenaga kesehatan?', helpText: null, required: true, allowsUnknown: true, sortOrder: 2 },
  { code: 'risk_information', category: 'GENERAL', prompt: 'Apakah ada jawaban keselamatan penting yang belum kamu ketahui?', helpText: 'Jawaban Tidak yakin tidak dianggap otomatis aman.', required: true, allowsUnknown: true, sortOrder: 3 },
];

type QuestionnaireSeed = {
  code: string;
  section: string;
  prompt: string;
  helpText?: string;
  valueType: QuestionnaireValueType;
  required: boolean;
  sortOrder: number;
  validation?: Prisma.InputJsonValue;
  visibleWhen?: Prisma.InputJsonValue;
  options?: Array<{ code: string; label: string }>;
};

const questionnaire: QuestionnaireSeed[] = [
  { code: 'height_cm', section: 'BODY_PROFILE', prompt: 'Berapa tinggi badanmu dalam sentimeter?', valueType: 'NUMBER', required: true, sortOrder: 1, validation: { minimum: 80, maximum: 250, basis: 'technical-bound-only' } },
  { code: 'weight_kg', section: 'BODY_PROFILE', prompt: 'Berapa berat badanmu dalam kilogram?', valueType: 'NUMBER', required: true, sortOrder: 2, validation: { minimum: 20, maximum: 300, basis: 'technical-bound-only' } },
  { code: 'target_weight_kg', section: 'BODY_PROFILE', prompt: 'Apakah ada target berat yang ingin dicatat?', helpText: 'Opsional dan tidak digunakan untuk perhitungan production.', valueType: 'NUMBER', required: false, sortOrder: 3, validation: { minimum: 20, maximum: 300, basis: 'technical-bound-only' } },
  { code: 'waist_cm', section: 'BODY_PROFILE', prompt: 'Lingkar pinggang dalam sentimeter', helpText: 'Opsional.', valueType: 'NUMBER', required: false, sortOrder: 4, validation: { minimum: 30, maximum: 250, basis: 'technical-bound-only' } },
  { code: 'daily_context', section: 'ROUTINE', prompt: 'Kegiatan utama sehari-hari', valueType: 'SINGLE_SELECT', required: true, sortOrder: 5, options: [{ code: 'SCHOOL', label: 'Sekolah atau kuliah' }, { code: 'DESK_WORK', label: 'Kerja lebih banyak duduk' }, { code: 'ACTIVE_WORK', label: 'Kerja lebih banyak bergerak' }, { code: 'SHIFT_WORK', label: 'Kerja shift' }, { code: 'RETIRED', label: 'Pensiun' }, { code: 'OTHER', label: 'Lainnya' }] },
  { code: 'shift_schedule', section: 'ROUTINE', prompt: 'Ceritakan pola jadwal shift-mu', valueType: 'TEXT', required: true, sortOrder: 6, visibleWhen: { questionCode: 'daily_context', operator: 'equals', value: 'SHIFT_WORK' } },
  { code: 'sitting_hours', section: 'ROUTINE', prompt: 'Perkiraan jam duduk per hari', valueType: 'NUMBER', required: true, sortOrder: 7, validation: { minimum: 0, maximum: 24, basis: 'technical-bound-only' } },
  { code: 'free_time_minutes', section: 'ROUTINE', prompt: 'Perkiraan waktu luang per hari dalam menit', valueType: 'NUMBER', required: false, sortOrder: 8, validation: { minimum: 0, maximum: 1440, basis: 'technical-bound-only' } },
  { code: 'sleep_time', section: 'SLEEP', prompt: 'Biasanya mulai tidur pukul berapa?', valueType: 'TIME', required: true, sortOrder: 9 },
  { code: 'wake_time', section: 'SLEEP', prompt: 'Biasanya bangun pukul berapa?', valueType: 'TIME', required: true, sortOrder: 10 },
  { code: 'sleep_quality', section: 'SLEEP', prompt: 'Bagaimana kualitas tidur menurutmu?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 11, options: [{ code: 'POOR', label: 'Kurang baik' }, { code: 'FAIR', label: 'Cukup' }, { code: 'GOOD', label: 'Baik' }] },
  { code: 'meal_frequency', section: 'FOOD_HABIT', prompt: 'Berapa kali biasanya makan utama?', valueType: 'NUMBER', required: true, sortOrder: 12, validation: { minimum: 0, maximum: 10, basis: 'technical-bound-only' } },
  { code: 'breakfast_habit', section: 'FOOD_HABIT', prompt: 'Seberapa sering sarapan?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 13, options: [{ code: 'RARELY', label: 'Jarang' }, { code: 'SOMETIMES', label: 'Kadang' }, { code: 'OFTEN', label: 'Sering' }] },
  { code: 'sweet_drinks', section: 'FOOD_HABIT', prompt: 'Seberapa sering memilih minuman manis?', valueType: 'SINGLE_SELECT', required: false, sortOrder: 14, options: [{ code: 'RARELY', label: 'Jarang' }, { code: 'SOMETIMES', label: 'Kadang' }, { code: 'OFTEN', label: 'Sering' }] },
  { code: 'cooking_habit', section: 'FOOD_HABIT', prompt: 'Bagaimana biasanya mendapatkan makanan?', valueType: 'MULTI_SELECT', required: true, sortOrder: 15, options: [{ code: 'COOK', label: 'Memasak' }, { code: 'BUY', label: 'Membeli' }, { code: 'FAMILY', label: 'Disiapkan keluarga' }] },
  { code: 'has_allergy', section: 'DIET_PREFERENCE', prompt: 'Apakah ada alergi yang perlu dicatat?', valueType: 'BOOLEAN', required: true, sortOrder: 16 },
  { code: 'allergy_details', section: 'DIET_PREFERENCE', prompt: 'Tuliskan alergi yang perlu dihindari', valueType: 'TEXT', required: true, sortOrder: 17, visibleWhen: { questionCode: 'has_allergy', operator: 'equals', value: true } },
  { code: 'diet_preferences', section: 'DIET_PREFERENCE', prompt: 'Pilih preferensi makan yang sesuai', valueType: 'MULTI_SELECT', required: false, sortOrder: 18, options: [{ code: 'NO_PREFERENCE', label: 'Tidak ada preferensi khusus' }, { code: 'VEGETARIAN', label: 'Vegetarian' }, { code: 'HALAL', label: 'Halal' }] },
  { code: 'activity_level', section: 'ACTIVITY', prompt: 'Bagaimana tingkat aktivitasmu saat ini?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 19, options: [{ code: 'LOW', label: 'Ringan' }, { code: 'MODERATE', label: 'Sedang' }, { code: 'HIGH', label: 'Tinggi' }] },
  { code: 'activity_types', section: 'ACTIVITY', prompt: 'Aktivitas yang biasa dilakukan', valueType: 'MULTI_SELECT', required: false, sortOrder: 20, options: [{ code: 'WALKING', label: 'Jalan kaki' }, { code: 'STRENGTH', label: 'Latihan kekuatan' }, { code: 'SPORT', label: 'Olahraga' }, { code: 'OTHER', label: 'Lainnya' }] },
  { code: 'mobility_limitation', section: 'ACTIVITY', prompt: 'Apakah ada keterbatasan gerak yang ingin dicatat?', valueType: 'BOOLEAN', required: true, sortOrder: 21 },
  { code: 'mobility_details', section: 'ACTIVITY', prompt: 'Ceritakan penyesuaian gerak yang kamu perlukan', valueType: 'TEXT', required: true, sortOrder: 22, visibleWhen: { questionCode: 'mobility_limitation', operator: 'equals', value: true } },
];

async function seedConsents() {
  for (const [type, displayName, description, required] of consentContent) {
    await prisma.consentVersion.upsert({
      where: { type_version_locale: { type, version, locale: 'id-ID' } },
      update: { displayName, description, required, contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true },
      create: { type, version, locale: 'id-ID', displayName, description, required, contentHash: hash(`${type}:${version}:${description}`), contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true, activeAt },
    });
  }
}

async function seedSafety() {
  const template = await prisma.safetyScreeningTemplate.upsert({
    where: { code_version: { code: 'ONBOARDING_SAFETY', version } },
    update: { title: 'Pemeriksaan keselamatan awal', description: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION', contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true },
    create: { code: 'ONBOARDING_SAFETY', version, title: 'Pemeriksaan keselamatan awal', description: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION', contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true, activeAt },
  });
  for (const question of safetyQuestions) {
    await prisma.safetyQuestion.upsert({ where: { templateId_code: { templateId: template.id, code: question.code } }, update: question, create: { templateId: template.id, ...question } });
  }
  for (const rule of phase3DevelopmentSafetyRules) {
    await prisma.safetyRuleDefinition.upsert({
      where: { ruleId_version: { ruleId: rule.ruleId, version: rule.version } },
      update: { condition: rule.condition, severity: rule.severity, result: rule.result as SafetyStatus, restrictedPrograms: rule.restrictedPrograms, messageKey: rule.messageKey, referralRequired: rule.referralRequired },
      create: { templateId: template.id, ruleId: rule.ruleId, version: rule.version, applicableAgeMin: rule.applicableAge.minimum, applicableAgeMax: rule.applicableAge.maximum, condition: rule.condition, severity: rule.severity, result: rule.result as SafetyStatus, restrictedPrograms: rule.restrictedPrograms, messageKey: rule.messageKey, referralRequired: rule.referralRequired, contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true },
    });
  }
}

async function seedGoals() {
  for (const goal of phase3GoalConfigurations) {
    await prisma.goalDefinition.upsert({
      where: { code: goal.code },
      update: { label: goal.label, description: goal.description, minimumAge: goal.minimumAge, maximumAge: goal.maximumAge, allowedRoles: goal.roles as Role[], blockedSafetyStatuses: goal.blockedStatuses as SafetyStatus[], priorityAgeGroups: goal.priorityGroups, active: true },
      create: { code: goal.code, label: goal.label, description: goal.description, minimumAge: goal.minimumAge, maximumAge: goal.maximumAge, allowedRoles: goal.roles as Role[], blockedSafetyStatuses: goal.blockedStatuses as SafetyStatus[], priorityAgeGroups: goal.priorityGroups, contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true, active: true },
    });
  }
}

async function seedQuestionnaire() {
  const template = await prisma.questionnaireTemplate.upsert({
    where: { code_version: { code: 'ONBOARDING_PROFILE', version } },
    update: { title: 'Kenali rutinitasmu', description: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION', contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true },
    create: { code: 'ONBOARDING_PROFILE', version, title: 'Kenali rutinitasmu', description: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION', contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true, activeAt },
  });
  for (const item of questionnaire) {
    const question = await prisma.questionnaireQuestion.upsert({
      where: { templateId_code: { templateId: template.id, code: item.code } },
      update: { section: item.section, prompt: item.prompt, helpText: item.helpText, valueType: item.valueType, required: item.required, sortOrder: item.sortOrder, validation: item.validation ?? Prisma.DbNull, visibleWhen: item.visibleWhen ?? Prisma.DbNull },
      create: { templateId: template.id, code: item.code, section: item.section, prompt: item.prompt, helpText: item.helpText, valueType: item.valueType, required: item.required, sortOrder: item.sortOrder, validation: item.validation, visibleWhen: item.visibleWhen },
    });
    for (const [index, choice] of (item.options ?? []).entries()) {
      await prisma.questionnaireOption.upsert({ where: { questionId_code: { questionId: question.id, code: choice.code } }, update: { label: choice.label, sortOrder: index + 1 }, create: { questionId: question.id, code: choice.code, label: choice.label, sortOrder: index + 1 } });
    }
  }
}

const taskDefinitions = [
  { id: '70000000-0000-4000-8000-000000000001', code: 'checkIn', title: 'Isi Daily Check-in', sortOrder: 1 },
  { id: '70000000-0000-4000-8000-000000000002', code: 'food', title: 'Catat makanan hari ini', sortOrder: 2 },
  { id: '70000000-0000-4000-8000-000000000003', code: 'sleep', title: 'Lengkapi catatan tidur', sortOrder: 3 },
  { id: '70000000-0000-4000-8000-000000000004', code: 'activity', title: 'Catat aktivitas hari ini', sortOrder: 4 },
];

async function seedTaskDefinitions() {
  for (const item of taskDefinitions) {
    await prisma.dailyTaskDefinition.upsert({
      where: { code_version: { code: item.code, version: 'phase4-dev-v1' } },
      update: { title: item.title, domain: item.code, minimumRequirement: 1, sortOrder: item.sortOrder, active: true },
      create: { ...item, version: 'phase4-dev-v1', domain: item.code, minimumRequirement: 1, sortOrder: item.sortOrder, contentStatus: ContentStatus.DEVELOPMENT_REQUIRES_EXPERT_VALIDATION, expertValidationRequired: true },
    });
  }
}

const nutrientRegistry = [
  ['ENERGY_KCAL', 'Energi', 'kcal', 'ENERGY', 0],
  ['PROTEIN_G', 'Protein', 'g', 'MACRONUTRIENT', 1],
  ['CARBOHYDRATE_G', 'Karbohidrat', 'g', 'MACRONUTRIENT', 1],
  ['FAT_G', 'Lemak', 'g', 'MACRONUTRIENT', 1],
  ['SATURATED_FAT_G', 'Lemak jenuh', 'g', 'LIMIT', 1],
  ['FIBER_G', 'Serat', 'g', 'MACRONUTRIENT', 1],
  ['SUGAR_G', 'Gula', 'g', 'LIMIT', 1],
  ['SODIUM_MG', 'Natrium', 'mg', 'LIMIT', 0],
] as const;

async function seedPhase5Nutrition() {
  for (const [code, displayName, unit, category, decimalPrecision] of nutrientRegistry) {
    await prisma.nutrientDefinition.upsert({ where: { code }, update: { displayName, unit, category, decimalPrecision, active: true }, create: { code, displayName, unit, category, decimalPrecision, active: true } });
  }
  const source = await prisma.foodDataSource.upsert({
    where: { name_version: { name: DEVELOPMENT_SOURCE.name, version: DEVELOPMENT_SOURCE.version } },
    update: { publisher: DEVELOPMENT_SOURCE.publisher, sourceType: FoodSourceType.SYNTHETIC_TEST_DATA, license: DEVELOPMENT_SOURCE.license, datasetLabel: DEVELOPMENT_SOURCE.datasetLabel, active: true },
    create: { ...DEVELOPMENT_SOURCE, sourceType: FoodSourceType.SYNTHETIC_TEST_DATA },
  });
  const definitions = new Map((await prisma.nutrientDefinition.findMany({ where: { code: { in: [...nutrientCodes] } } })).map((item) => [item.code, item]));
  for (const foodSeed of DEVELOPMENT_FOODS) {
    const food = await prisma.foodItem.upsert({
      where: { code: foodSeed.code },
      update: { name: foodSeed.name, alternateNames: foodSeed.alternateNames, category: foodSeed.category as FoodCategory, sourceId: source.id, sourceVersion: source.version, verified: false, active: true },
      create: { code: foodSeed.code, name: foodSeed.name, alternateNames: foodSeed.alternateNames, category: foodSeed.category as FoodCategory, sourceId: source.id, sourceVersion: source.version, countryCode: 'ID', language: 'id-ID', verified: false, active: true, description: DEVELOPMENT_SOURCE.datasetLabel },
    });
    const serving = await prisma.foodServing.upsert({
      where: { foodItemId_label: { foodItemId: food.id, label: foodSeed.servingLabel } },
      update: { quantity: 1, unit: foodSeed.servingUnit as FoodUnit, gramEquivalent: foodSeed.gramEquivalent, defaultServing: true, source: source.name, verified: false },
      create: { foodItemId: food.id, label: foodSeed.servingLabel, quantity: 1, unit: foodSeed.servingUnit as FoodUnit, gramEquivalent: foodSeed.gramEquivalent, defaultServing: true, source: source.name, verified: false },
    });
    await prisma.foodItem.update({ where: { id: food.id }, data: { defaultServingId: serving.id } });
    for (const [code, amount] of Object.entries(foodSeed.nutrients)) {
      const definition = definitions.get(code); if (!definition || amount === undefined) continue;
      await prisma.foodNutrient.upsert({ where: { foodItemId_nutrientId: { foodItemId: food.id, nutrientId: definition.id } }, update: { amount, sourceId: source.id, sourceVersion: source.version }, create: { foodItemId: food.id, nutrientId: definition.id, amount, unit: definition.unit, basisAmount: 100, basisUnit: FoodUnit.G, sourceId: source.id, sourceVersion: source.version } });
    }
    for (const allergen of foodSeed.allergens ?? []) await prisma.foodAllergen.upsert({ where: { foodItemId_code: { foodItemId: food.id, code: allergen as AllergenCode } }, update: { verified: false, sourceNote: DEVELOPMENT_SOURCE.datasetLabel }, create: { foodItemId: food.id, code: allergen as AllergenCode, verified: false, sourceNote: DEVELOPMENT_SOURCE.datasetLabel } });
    for (const tag of foodSeed.tags ?? []) await prisma.foodDietaryTag.upsert({ where: { foodItemId_code: { foodItemId: food.id, code: tag.code as DietaryTagCode } }, update: { status: tag.status as DietaryTagStatus, sourceNote: DEVELOPMENT_SOURCE.datasetLabel }, create: { foodItemId: food.id, code: tag.code as DietaryTagCode, status: tag.status as DietaryTagStatus, sourceNote: DEVELOPMENT_SOURCE.datasetLabel } });
  }
  for (const policy of DEVELOPMENT_POLICIES) {
    const targetConfiguration = { targets: policy.targets, goalEnergyAdjustmentKcal: policy.goalEnergyAdjustmentKcal };
    await prisma.nutritionPolicy.upsert({ where: { code_version: { code: policy.code, version: policy.version } }, update: { status: NutritionPolicyStatus.ACTIVE, targetConfiguration: targetConfiguration as Prisma.InputJsonValue, requiresExpertValidation: true }, create: { code: policy.code, version: policy.version, ageMin: policy.ageMin, ageMax: policy.ageMax, applicableGoals: [], applicableSafetyStatuses: [SafetyStatus.GREEN, SafetyStatus.YELLOW, SafetyStatus.RED], status: NutritionPolicyStatus.ACTIVE, effectiveFrom: activeAt, targetConfiguration: targetConfiguration as Prisma.InputJsonValue, sourceMetadata: { datasetLabel: DEVELOPMENT_SOURCE.datasetLabel, evidenceStatus: 'DEVELOPMENT_CONFIGURATION' }, requiresExpertValidation: true } });
  }
}

const developmentRecipes = [
  { code: 'DEV-RECIPE-NASI-TEMPE-BAYAM', name: 'Nasi, Tempe, dan Bayam', description: 'Menu development sederhana dari bahan pada database Phase 5.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-TEMPE', 'DEV-BAYAM'], method: CookingMethod.STIR_FRIED, minutes: 25, cost: EstimatedCostCategory.LOW },
  { code: 'DEV-RECIPE-NASI-AYAM-WORTEL', name: 'Nasi Ayam Wortel', description: 'Menu development dengan nasi, ayam, dan wortel.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-AYAM', 'DEV-WORTEL'], method: CookingMethod.BOILED, minutes: 30, cost: EstimatedCostCategory.MEDIUM },
  { code: 'DEV-RECIPE-NASI-TAHU-BAYAM', name: 'Nasi Tahu Bayam', description: 'Menu development berbasis tahu dan sayur.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-PUTIH', 'DEV-TAHU', 'DEV-BAYAM'], method: CookingMethod.STIR_FRIED, minutes: 22, cost: EstimatedCostCategory.LOW },
  { code: 'DEV-RECIPE-NASI-IKAN-WORTEL', name: 'Nasi Ikan Wortel', description: 'Menu development berbasis ikan dan sayur.', mealTypes: ['LUNCH', 'DINNER'] as const, foodCodes: ['DEV-NASI-MERAH', 'DEV-IKAN', 'DEV-WORTEL'], method: CookingMethod.GRILLED, minutes: 32, cost: EstimatedCostCategory.MEDIUM },
  { code: 'DEV-RECIPE-OAT-PISANG-SUSU', name: 'Oat Pisang Susu', description: 'Menu sarapan development dengan satu data nutrisi yang sengaja tidak lengkap.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-OATMEAL', 'DEV-PISANG', 'DEV-SUSU'], method: CookingMethod.BOILED, minutes: 12, cost: EstimatedCostCategory.LOW },
  { code: 'DEV-RECIPE-TELUR-PISANG-NASI', name: 'Telur, Pisang, dan Nasi', description: 'Menu sarapan development dari fixture synthetic.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-TELUR-AYAM', 'DEV-PISANG', 'DEV-NASI-PUTIH'], method: CookingMethod.BOILED, minutes: 15, cost: EstimatedCostCategory.LOW },
  { code: 'DEV-RECIPE-NASI-MERAH-TELUR-PEPAYA', name: 'Nasi Merah, Telur, dan Pepaya', description: 'Menu sarapan development dengan buah.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-NASI-MERAH', 'DEV-TELUR-AYAM', 'DEV-PEPAYA'], method: CookingMethod.BOILED, minutes: 18, cost: EstimatedCostCategory.LOW },
  { code: 'DEV-RECIPE-ROTI-TELUR-PISANG', name: 'Roti, Telur, dan Pisang', description: 'Menu sarapan development dengan data alergen synthetic.', mealTypes: ['BREAKFAST'] as const, foodCodes: ['DEV-ROTI', 'DEV-TELUR-AYAM', 'DEV-PISANG'], method: CookingMethod.BOILED, minutes: 10, cost: EstimatedCostCategory.LOW },
];

async function seedPhase6MealPlanning() {
  await prisma.mealPlanningPolicy.upsert({
    where: { code_version: { code: 'DAILY_GUIDED_MEAL', version: 'meal-planning-dev-v1' } },
    update: { status: MealPlanningPolicyStatus.ACTIVE, requiresProductValidation: true },
    create: { code: 'DAILY_GUIDED_MEAL', version: 'meal-planning-dev-v1', status: MealPlanningPolicyStatus.ACTIVE, effectiveFrom: activeAt, requiresProductValidation: true, configuration: { weights: { mealType: 20, protein: 18, fiber: 12, upperLimits: 20, time: 8, cost: 5, preference: 7, dataQuality: 10 }, criticalNutrients: ['ENERGY_KCAL', 'PROTEIN_G', 'SODIUM_MG'], snackEnabled: false, alternativesMinimum: 3, alternativesMaximum: 5, validationStatus: 'REQUIRES_PRODUCT_VALIDATION' } },
  });
  for (const seed of developmentRecipes) {
    const recipe = await prisma.recipe.upsert({
      where: { code: seed.code },
      update: { name: seed.name, description: seed.description, sourceType: RecipeSourceType.SYNTHETIC_DEVELOPMENT, sourceVersion: 'phase6-dev-v1', verified: false, active: true, private: false, archivedAt: null, requiresExpertValidation: true },
      create: { code: seed.code, name: seed.name, description: seed.description, sourceType: RecipeSourceType.SYNTHETIC_DEVELOPMENT, sourceId: 'SARIRA-DEVELOPMENT', sourceVersion: 'phase6-dev-v1', verified: false, active: true, private: false, requiresExpertValidation: true },
    });
    const version = await prisma.recipeVersion.upsert({
      where: { recipeId_version: { recipeId: recipe.id, version: 1 } },
      update: { status: RecipeVersionStatus.ACTIVE, servings: 2, prepTimeMinutes: 8, cookTimeMinutes: seed.minutes, difficulty: seed.minutes <= 15 ? RecipeDifficulty.EASY : RecipeDifficulty.MEDIUM, estimatedCostCategory: seed.cost, cookingMethod: seed.method, mealTypes: [...seed.mealTypes], dietaryTags: [], equipment: ['STOVE'], verified: false, requiresExpertValidation: true, publishedAt: activeAt },
      create: { recipeId: recipe.id, version: 1, status: RecipeVersionStatus.ACTIVE, servings: 2, prepTimeMinutes: 8, cookTimeMinutes: seed.minutes, difficulty: seed.minutes <= 15 ? RecipeDifficulty.EASY : RecipeDifficulty.MEDIUM, estimatedCostCategory: seed.cost, cookingMethod: seed.method, mealTypes: [...seed.mealTypes], dietaryTags: [], equipment: ['STOVE'], verified: false, requiresExpertValidation: true, publishedAt: activeAt },
    });
    const nutritionInputs = [];
    const sourceVersions: string[] = [];
    for (const [index, code] of seed.foodCodes.entries()) {
      const food = await prisma.foodItem.findUniqueOrThrow({ where: { code }, include: { source: true, servings: true, nutrients: { include: { nutrient: true } } } });
      const serving = food.servings.find((item) => item.defaultServing) ?? food.servings[0]; if (!serving?.gramEquivalent) throw new Error(`Serving gram tidak tersedia untuk ${code}.`);
      const gramAmount = Number(serving.gramEquivalent);
      const calculation = calculateFoodNutrition(food.nutrients.map((item) => ({ nutrientCode: item.nutrient.code as (typeof nutrientCodes)[number], amount: Number(item.amount), basisAmount: Number(item.basisAmount), basisUnit: 'G' })), gramAmount);
      nutritionInputs.push(calculation.nutrients); sourceVersions.push(food.source.version);
      await prisma.recipeIngredient.upsert({ where: { recipeVersionId_orderIndex: { recipeVersionId: version.id, orderIndex: index + 1 } }, update: { foodItemId: food.id, servingId: serving.id, customName: null, quantity: 1, gramAmount, optional: false, sourceType: FoodSourceType.SYNTHETIC_TEST_DATA }, create: { recipeVersionId: version.id, foodItemId: food.id, servingId: serving.id, quantity: 1, gramAmount, optional: false, orderIndex: index + 1, sourceType: FoodSourceType.SYNTHETIC_TEST_DATA } });
    }
    const stepTexts = ['Siapkan seluruh bahan sesuai porsi.', 'Masak bahan hingga matang sesuai metode yang dipilih.', 'Sajikan dan periksa kembali porsi.'];
    for (const [index, instruction] of stepTexts.entries()) await prisma.recipeStep.upsert({ where: { recipeVersionId_orderIndex: { recipeVersionId: version.id, orderIndex: index + 1 } }, update: { instruction }, create: { recipeVersionId: version.id, orderIndex: index + 1, instruction } });
    const nutrition = calculateRecipeNutrition(nutritionInputs, 2); const missingNutrients = nutrientCodes.filter((code) => nutrition.total[code] === null); const total = nutrition.total;
    await prisma.recipeNutritionSnapshot.upsert({ where: { recipeVersionId: version.id }, update: { totalEnergyKcal: total.ENERGY_KCAL, totalProteinG: total.PROTEIN_G, totalCarbohydrateG: total.CARBOHYDRATE_G, totalFatG: total.FAT_G, totalSaturatedFatG: total.SATURATED_FAT_G, totalFiberG: total.FIBER_G, totalSugarG: total.SUGAR_G, totalSodiumMg: total.SODIUM_MG, perServing: nutrition.perServing, missingNutrients, complete: missingNutrients.length === 0, sourceVersions: [...new Set(sourceVersions)], calculationVersion: NUTRITION_ENGINE_VERSION, calculatedAt: activeAt }, create: { recipeVersionId: version.id, totalEnergyKcal: total.ENERGY_KCAL, totalProteinG: total.PROTEIN_G, totalCarbohydrateG: total.CARBOHYDRATE_G, totalFatG: total.FAT_G, totalSaturatedFatG: total.SATURATED_FAT_G, totalFiberG: total.FIBER_G, totalSugarG: total.SUGAR_G, totalSodiumMg: total.SODIUM_MG, perServing: nutrition.perServing, missingNutrients, complete: missingNutrients.length === 0, sourceVersions: [...new Set(sourceVersions)], calculationVersion: NUTRITION_ENGINE_VERSION, calculatedAt: activeAt } });
  }
}

const seedProfiles = [
  { key: 'day1', suffix: '01', email: 'phase4-day1@sarira.test', name: 'Dewasa Day 1', birthDate: '1996-01-01', startDate: '2026-08-08', currentDay: 1, status: 'ACTIVE' as const, mode: 'day1' },
  { key: 'day7', suffix: '02', email: 'phase4-day7-teen@sarira.test', name: 'Remaja Day 7', birthDate: '2011-01-01', startDate: '2026-08-02', currentDay: 7, status: 'DAY_7_REVIEW_AVAILABLE' as const, mode: 'missing' },
  { key: 'ready', suffix: '03', email: 'phase4-day14-ready-aging@sarira.test', name: 'Healthy Aging Ready', birthDate: '1961-01-01', startDate: '2026-07-26', currentDay: 14, status: 'DAY_14_REVIEW_AVAILABLE' as const, mode: 'ready' },
  { key: 'insufficient', suffix: '04', email: 'phase4-day14-insufficient@sarira.test', name: 'Dewasa Insufficient', birthDate: '1991-01-01', startDate: '2026-07-26', currentDay: 14, status: 'DATA_INSUFFICIENT' as const, mode: 'insufficient' },
  { key: 'missing', suffix: '05', email: 'phase4-missing-days@sarira.test', name: 'Dewasa Missing Days', birthDate: '1988-01-01', startDate: '2026-08-02', currentDay: 7, status: 'DAY_7_REVIEW_AVAILABLE' as const, mode: 'missing' },
];

const stableUuid = (group: string, value: number) => `${group}-0000-4000-8000-${String(value).padStart(12, '0')}`;

async function seedPhase4Profiles() {
  const template = await prisma.safetyScreeningTemplate.findUniqueOrThrow({ where: { code_version: { code: 'ONBOARDING_SAFETY', version } } });
  const goalDefinition = await prisma.goalDefinition.findUniqueOrThrow({ where: { code: 'MAINTAIN_WEIGHT' } });
  const consentVersions = await prisma.consentVersion.findMany({ where: { version, type: { in: [ConsentType.TERMS_OF_SERVICE, ConsentType.PRIVACY_POLICY, ConsentType.HEALTH_PROFILE, ConsentType.NUTRITION_DATA, ConsentType.ACTIVITY_DATA, ConsentType.SLEEP_DATA] } } });

  for (const [profileIndex, seed] of seedProfiles.entries()) {
    const number = profileIndex + 1;
    const userId = stableUuid('81000000', number);
    const profileId = stableUuid('82000000', number);
    const baselineId = stableUuid('83000000', number);
    const user = await prisma.user.upsert({ where: { externalAuthId: stableUuid('80000000', number) }, update: { email: seed.email, status: 'ACTIVE' }, create: { id: userId, externalAuthId: stableUuid('80000000', number), email: seed.email, status: 'ACTIVE' } });
    await prisma.roleAssignment.upsert({ where: { userId_role: { userId: user.id, role: Role.USER } }, update: {}, create: { userId: user.id, role: Role.USER } });
    const profile = await prisma.profile.upsert({ where: { userId: user.id }, update: { fullName: seed.name, dateOfBirth: new Date(`${seed.birthDate}T00:00:00.000Z`), timezone: 'Asia/Makassar', primaryRole: Role.USER, onboardingStatus: 'COMPLETED', onboardingCompletedAt: activeAt }, create: { id: profileId, userId: user.id, fullName: seed.name, dateOfBirth: new Date(`${seed.birthDate}T00:00:00.000Z`), timezone: 'Asia/Makassar', primaryRole: Role.USER, onboardingStatus: 'COMPLETED', onboardingCompletedAt: activeAt } });
    await prisma.onboardingProgress.upsert({ where: { userId: user.id }, update: { profileId: profile.id, status: 'COMPLETED', currentStep: 'starter-journey', lastCompletedStep: 'profile-summary', completedAt: activeAt }, create: { id: stableUuid('84000000', number), userId: user.id, profileId: profile.id, status: 'COMPLETED', currentStep: 'starter-journey', lastCompletedStep: 'profile-summary', completedAt: activeAt } });
    for (const [consentIndex, consentVersion] of consentVersions.entries()) {
      await prisma.userConsent.upsert({ where: { id: stableUuid(`85${seed.suffix}0000`, consentIndex + 1) }, update: { status: 'GRANTED', grantedAt: activeAt, revokedAt: null }, create: { id: stableUuid(`85${seed.suffix}0000`, consentIndex + 1), userId: user.id, profileId: profile.id, consentVersionId: consentVersion.id, status: 'GRANTED', source: 'ONBOARDING', grantedAt: activeAt } });
    }
    const safetySessionId = stableUuid('86000000', number);
    await prisma.safetyScreeningSession.upsert({ where: { id: safetySessionId }, update: { status: 'COMPLETED', completedAt: activeAt }, create: { id: safetySessionId, userId: user.id, profileId: profile.id, templateId: template.id, rulesetId: template.code, rulesetHash: `${template.code}:${template.version}`, ruleVersion: version, status: 'COMPLETED', startedAt: activeAt, completedAt: activeAt } });
    await prisma.safetyResult.upsert({ where: { sessionId: safetySessionId }, update: { status: 'GREEN', profileId: profile.id }, create: { id: stableUuid('87000000', number), sessionId: safetySessionId, profileId: profile.id, status: 'GREEN', triggeredRules: [], restrictedPrograms: [], referralRequired: false, ruleVersion: version, completedAt: activeAt } });
    await prisma.userGoal.upsert({ where: { id: stableUuid('88000000', number) }, update: { status: 'ACTIVE', code: goalDefinition.code, definitionId: goalDefinition.id }, create: { id: stableUuid('88000000', number), userId: user.id, profileId: profile.id, definitionId: goalDefinition.id, code: goalDefinition.code, status: 'ACTIVE' } });
    await prisma.programPreference.upsert({ where: { profileId: profile.id }, update: { program: 'GUIDED_MEAL' }, create: { id: stableUuid('89000000', number), profileId: profile.id, program: 'GUIDED_MEAL' } });
    const readinessStatus = seed.mode === 'ready' ? 'READY' : seed.mode === 'insufficient' ? 'INSUFFICIENT_DATA' : 'PENDING';
    await prisma.baselineSession.upsert({ where: { id: baselineId }, update: { status: seed.status, currentDay: seed.currentDay, readinessStatus, completenessScore: seed.mode === 'ready' ? 79 : seed.mode === 'insufficient' ? 2 : 0 }, create: { id: baselineId, profileId: profile.id, status: seed.status, startedAt: new Date(`${seed.startDate}T00:00:00.000Z`), startLocalDate: new Date(`${seed.startDate}T00:00:00.000Z`), timezone: 'Asia/Makassar', currentDay: seed.currentDay, targetDays: 14, readinessStatus, completenessScore: seed.mode === 'ready' ? 79 : seed.mode === 'insufficient' ? 2 : 0, extensionAllowed: true, extensionDays: 7, configVersion: 'phase4-dev-v1', ...(seed.currentDay === 14 ? { calendarCompletedAt: activeAt } : {}) } });

    const loggedDays = seed.mode === 'ready' ? 11 : seed.mode === 'day1' ? 1 : seed.mode === 'insufficient' ? 1 : 3;
    for (let dayIndex = 1; dayIndex <= loggedDays; dayIndex += 1) {
      const localDate = new Date(`${seed.startDate}T00:00:00.000Z`); localDate.setUTCDate(localDate.getUTCDate() + (seed.mode === 'missing' && dayIndex > 1 ? dayIndex : dayIndex - 1));
      const recordNumber = number * 100 + dayIndex;
      const dailyRecordId = stableUuid('8a000000', recordNumber);
      const complete = seed.mode === 'ready' || seed.mode === 'day1';
      await prisma.dailyRecord.upsert({ where: { baselineSessionId_localDate: { baselineSessionId: baselineId, localDate } }, update: { completenessStatus: complete ? 'COMPLETE' : 'PARTIAL' }, create: { id: dailyRecordId, baselineSessionId: baselineId, profileId: profile.id, localDate, dayIndex: Math.round((localDate.getTime() - new Date(`${seed.startDate}T00:00:00.000Z`).getTime()) / 86_400_000) + 1, completenessStatus: complete ? 'COMPLETE' : 'PARTIAL', ...(complete ? { completedAt: activeAt } : {}) } });
      await prisma.dailyCheckIn.upsert({ where: { dailyRecordId }, update: { mood: 'GOOD', hunger: 3, fullness: 4 }, create: { id: stableUuid('8b000000', recordNumber), profileId: profile.id, baselineSessionId: baselineId, dailyRecordId, localDate, mood: 'GOOD', hunger: 3, fullness: 4, barriers: [] } });
      if (complete) {
        await prisma.mealLog.upsert({ where: { id: stableUuid('8c000000', recordNumber) }, update: {}, create: { id: stableUuid('8c000000', recordNumber), profileId: profile.id, baselineSessionId: baselineId, dailyRecordId, localDate, mealType: 'BREAKFAST', description: 'Data uji sarapan', source: 'MANUAL', skipped: false } });
        await prisma.sleepLog.upsert({ where: { id: stableUuid('8d000000', recordNumber) }, update: {}, create: { id: stableUuid('8d000000', recordNumber), profileId: profile.id, baselineSessionId: baselineId, dailyRecordId, localDate, sleepStartedAt: new Date(`${localDate.toISOString().slice(0, 10)}T00:00:00.000Z`), wokeUpAt: new Date(`${localDate.toISOString().slice(0, 10)}T07:00:00.000Z`), durationMinutes: 420, perceivedQuality: 'GOOD', source: 'MANUAL' } });
        await prisma.activityLog.upsert({ where: { id: stableUuid('8e000000', recordNumber) }, update: {}, create: { id: stableUuid('8e000000', recordNumber), profileId: profile.id, baselineSessionId: baselineId, dailyRecordId, localDate, activityType: 'WALKING', durationMinutes: 20, perceivedIntensity: 'LIGHT', source: 'MANUAL' } });
      }
    }
    if (seed.currentDay === 14) {
      await prisma.baselineReadinessResult.upsert({ where: { baselineSessionId: baselineId }, update: { status: readinessStatus, completenessScore: seed.mode === 'ready' ? 79 : 2 }, create: { id: stableUuid('8f000000', number), baselineSessionId: baselineId, status: readinessStatus, domainCoverage: seed.mode === 'ready' ? { checkIn: 0.79, food: 0.79, sleep: 0.79, activity: 0.79 } : { checkIn: 0.07, food: 0, sleep: 0, activity: 0 }, missingDomains: seed.mode === 'ready' ? [] : ['checkIn', 'food', 'sleep', 'activity'], totalDays: 14, completedDays: seed.mode === 'ready' ? 11 : 0, completenessScore: seed.mode === 'ready' ? 79 : 2, reasonCodes: seed.mode === 'ready' ? ['MINIMUM_SCORE_MET', 'REQUIRED_DOMAIN_COVERAGE_MET'] : ['COMPLETENESS_BELOW_READY_THRESHOLD'], recommendation: seed.mode === 'ready' ? 'Data baseline siap dianalisis.' : 'Data belum cukup; lanjutkan pencatatan.', configVersion: 'phase4-dev-v1', evaluatedAt: activeAt } });
    }
  }
}

async function main() {
  if (PHASE_3_CONTENT_STATUS !== 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION' || PHASE_3_RULE_VERSION !== version) throw new Error('Phase 3 seed version tidak konsisten.');
  await seedConsents();
  await seedSafety();
  await seedGoals();
  await seedQuestionnaire();
  await seedTaskDefinitions();
  await seedPhase5Nutrition();
  await seedPhase6MealPlanning();
  if (process.env.SEED_REFERENCE_DATA_ONLY !== 'true') await seedPhase4Profiles();
}

main().finally(() => prisma.$disconnect());
