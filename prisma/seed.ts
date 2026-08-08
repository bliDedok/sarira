import 'dotenv/config';
import { createHash } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { phase3DevelopmentSafetyRules, phase3GoalConfigurations, PHASE_3_CONTENT_STATUS, PHASE_3_RULE_VERSION } from '../packages/expert-system/src/index';
import {
  ConsentType,
  ContentStatus,
  Prisma,
  PrismaClient,
  QuestionnaireValueType,
  Role,
  SafetyStatus,
} from '../apps/api/src/generated/prisma/client';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL atau DIRECT_URL diperlukan untuk seed.');

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const version = 'phase3-dev-v1';
const activeAt = new Date('2026-08-08T00:00:00.000Z');
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

const consentContent = [
  [ConsentType.TERMS_OF_SERVICE, 'Ketentuan Layanan', 'Ketentuan penggunaan SARIRA.', true],
  [ConsentType.PRIVACY_POLICY, 'Kebijakan Privasi', 'Cara data diproses dan hak pengguna.', true],
  [ConsentType.HEALTH_PROFILE, 'Profil Kesehatan', 'Pemrosesan jawaban safety dan kuesioner onboarding.', true],
  [ConsentType.NUTRITION_DATA, 'Data Nutrisi', 'Opsional; rekomendasi nutrisi masih demo.', false],
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

async function main() {
  if (PHASE_3_CONTENT_STATUS !== 'DEVELOPMENT_REQUIRES_EXPERT_VALIDATION' || PHASE_3_RULE_VERSION !== version) throw new Error('Phase 3 seed version tidak konsisten.');
  await seedConsents();
  await seedSafety();
  await seedGoals();
  await seedQuestionnaire();
}

main().finally(() => prisma.$disconnect());
