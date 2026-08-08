import type {
  ConsentDefinition,
  ConsentRecord,
  GoalDefinitionRecord,
  GuardianConsentRecord,
  OnboardingProgressRecord,
  OnboardingRole,
  ProgramPreferenceRecord,
  QuestionnaireAnswerValue,
  QuestionnaireSessionRecord,
  QuestionnaireTemplateRecord,
  SafetyResultRecord,
  SafetySessionRecord,
  SafetyTemplateRecord,
  UserGoalRecord,
} from '@sarira/shared-types';
import { calculateAge, classifyAge, phase3GoalConfigurations, PHASE_3_CONTENT_STATUS, PHASE_3_RULE_VERSION } from '@sarira/expert-system';
import type { AccountRecord, DataRepositories, ProfileRecord } from '../contracts';
import { ConflictError, NotFoundError } from '../errors';
import { createMemoryBaselineRepository } from './phase4-memory';

const now = () => new Date().toISOString();

const consentDefinitions: ConsentDefinition[] = [
  { id: '20000000-0000-4000-8000-000000000001', type: 'TERMS_OF_SERVICE', version: 'phase3-dev-v1', displayName: 'Ketentuan Layanan', description: 'Ketentuan penggunaan layanan SARIRA.', required: true, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000002', type: 'PRIVACY_POLICY', version: 'phase3-dev-v1', displayName: 'Kebijakan Privasi', description: 'Cara data profil diproses dan hak pengguna.', required: true, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000003', type: 'HEALTH_PROFILE', version: 'phase3-dev-v1', displayName: 'Profil Kesehatan', description: 'Pemrosesan jawaban safety dan kuesioner untuk onboarding.', required: true, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000004', type: 'NUTRITION_DATA', version: 'phase3-dev-v1', displayName: 'Data Nutrisi', description: 'Opsional; fitur rekomendasi nutrisi masih demo.', required: false, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000005', type: 'ACTIVITY_DATA', version: 'phase3-dev-v1', displayName: 'Data Aktivitas', description: 'Opsional; dapat diubah dari Settings.', required: false, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000006', type: 'SLEEP_DATA', version: 'phase3-dev-v1', displayName: 'Data Tidur', description: 'Opsional; dapat diubah dari Settings.', required: false, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000007', type: 'WEARABLE', version: 'phase3-dev-v1', displayName: 'Perangkat Wearable', description: 'Opsional dan tidak diminta pada onboarding.', required: false, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
  { id: '20000000-0000-4000-8000-000000000008', type: 'BODY_PHOTO', version: 'phase3-dev-v1', displayName: 'Foto Tubuh', description: 'Opsional; tidak diaktifkan pada Phase 3.', required: false, contentStatus: PHASE_3_CONTENT_STATUS, expertValidationRequired: true },
];

const safetyTemplate: SafetyTemplateRecord = {
  id: '30000000-0000-4000-8000-000000000000',
  code: 'ONBOARDING_SAFETY',
  version: 'phase3-dev-v1',
  title: 'Pemeriksaan keselamatan awal',
  description: 'Development content untuk menguji routing deterministik; bukan daftar klinis final.',
  contentStatus: PHASE_3_CONTENT_STATUS,
  expertValidationRequired: true,
  questions: [
    { id: '30000000-0000-4000-8000-000000000001', code: 'concerning_change', category: 'GENERAL', prompt: 'Apakah ada perubahan kondisi yang terasa mengkhawatirkan?', helpText: 'Pilih Tidak yakin bila kamu belum dapat menilai.', required: true, allowsUnknown: true, sortOrder: 1 },
    { id: '30000000-0000-4000-8000-000000000002', code: 'professional_restriction', category: 'GENERAL', prompt: 'Apakah program atau aktivitas tertentu sedang dibatasi tenaga kesehatan?', required: true, allowsUnknown: true, sortOrder: 2 },
    { id: '30000000-0000-4000-8000-000000000003', code: 'risk_information', category: 'GENERAL', prompt: 'Apakah ada jawaban keselamatan penting yang belum kamu ketahui?', required: true, allowsUnknown: true, sortOrder: 3 },
  ],
};

const option = (id: number, code: string, label: string, sortOrder: number) => ({ id: `50000000-0000-4000-8000-${String(id).padStart(12, '0')}`, code, label, sortOrder });
const questionnaireTemplate: QuestionnaireTemplateRecord = {
  id: '40000000-0000-4000-8000-000000000000',
  code: 'ONBOARDING_PROFILE',
  version: 'phase3-dev-v1',
  title: 'Kenali rutinitasmu',
  description: 'Data minimum untuk menyelesaikan onboarding. Perhitungan nutrisi belum dijalankan.',
  contentStatus: PHASE_3_CONTENT_STATUS,
  expertValidationRequired: true,
  questions: [
    { id: '40000000-0000-4000-8000-000000000001', code: 'height_cm', section: 'BODY_PROFILE', prompt: 'Berapa tinggi badanmu dalam sentimeter?', valueType: 'NUMBER', required: true, sortOrder: 1, validation: { minimum: 80, maximum: 250 }, options: [] },
    { id: '40000000-0000-4000-8000-000000000002', code: 'weight_kg', section: 'BODY_PROFILE', prompt: 'Berapa berat badanmu dalam kilogram?', valueType: 'NUMBER', required: true, sortOrder: 2, validation: { minimum: 20, maximum: 300 }, options: [] },
    { id: '40000000-0000-4000-8000-000000000003', code: 'target_weight_kg', section: 'BODY_PROFILE', prompt: 'Apakah ada target berat yang ingin dicatat?', helpText: 'Opsional dan tidak digunakan untuk perhitungan production.', valueType: 'NUMBER', required: false, sortOrder: 3, validation: { minimum: 20, maximum: 300 }, options: [] },
    { id: '40000000-0000-4000-8000-000000000004', code: 'daily_context', section: 'ROUTINE', prompt: 'Kegiatan utama sehari-hari', valueType: 'SINGLE_SELECT', required: true, sortOrder: 4, options: [option(1, 'SCHOOL', 'Sekolah atau kuliah', 1), option(2, 'DESK_WORK', 'Kerja lebih banyak duduk', 2), option(3, 'ACTIVE_WORK', 'Kerja lebih banyak bergerak', 3), option(4, 'SHIFT_WORK', 'Kerja shift', 4), option(5, 'RETIRED', 'Pensiun', 5), option(6, 'OTHER', 'Lainnya', 6)] },
    { id: '40000000-0000-4000-8000-000000000005', code: 'shift_schedule', section: 'ROUTINE', prompt: 'Ceritakan pola jadwal shift-mu', valueType: 'TEXT', required: true, sortOrder: 5, visibleWhen: { questionCode: 'daily_context', operator: 'equals', value: 'SHIFT_WORK' }, options: [] },
    { id: '40000000-0000-4000-8000-000000000006', code: 'sitting_hours', section: 'ROUTINE', prompt: 'Perkiraan jam duduk per hari', valueType: 'NUMBER', required: true, sortOrder: 6, validation: { minimum: 0, maximum: 24 }, options: [] },
    { id: '40000000-0000-4000-8000-000000000007', code: 'sleep_time', section: 'SLEEP', prompt: 'Biasanya mulai tidur pukul berapa?', valueType: 'TIME', required: true, sortOrder: 7, options: [] },
    { id: '40000000-0000-4000-8000-000000000008', code: 'wake_time', section: 'SLEEP', prompt: 'Biasanya bangun pukul berapa?', valueType: 'TIME', required: true, sortOrder: 8, options: [] },
    { id: '40000000-0000-4000-8000-000000000009', code: 'sleep_quality', section: 'SLEEP', prompt: 'Bagaimana kualitas tidur menurutmu?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 9, options: [option(7, 'POOR', 'Kurang baik', 1), option(8, 'FAIR', 'Cukup', 2), option(9, 'GOOD', 'Baik', 3)] },
    { id: '40000000-0000-4000-8000-000000000010', code: 'meal_frequency', section: 'FOOD_HABIT', prompt: 'Berapa kali biasanya makan utama?', valueType: 'NUMBER', required: true, sortOrder: 10, validation: { minimum: 0, maximum: 10 }, options: [] },
    { id: '40000000-0000-4000-8000-000000000011', code: 'breakfast_habit', section: 'FOOD_HABIT', prompt: 'Seberapa sering sarapan?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 11, options: [option(10, 'RARELY', 'Jarang', 1), option(11, 'SOMETIMES', 'Kadang', 2), option(12, 'OFTEN', 'Sering', 3)] },
    { id: '40000000-0000-4000-8000-000000000012', code: 'has_allergy', section: 'DIET_PREFERENCE', prompt: 'Apakah ada alergi yang perlu dicatat?', valueType: 'BOOLEAN', required: true, sortOrder: 12, options: [] },
    { id: '40000000-0000-4000-8000-000000000013', code: 'allergy_details', section: 'DIET_PREFERENCE', prompt: 'Tuliskan alergi yang perlu dihindari', valueType: 'TEXT', required: true, sortOrder: 13, visibleWhen: { questionCode: 'has_allergy', operator: 'equals', value: true }, options: [] },
    { id: '40000000-0000-4000-8000-000000000014', code: 'diet_preferences', section: 'DIET_PREFERENCE', prompt: 'Pilih preferensi makan yang sesuai', valueType: 'MULTI_SELECT', required: false, sortOrder: 14, options: [option(13, 'NO_PREFERENCE', 'Tidak ada preferensi khusus', 1), option(14, 'VEGETARIAN', 'Vegetarian', 2), option(15, 'HALAL', 'Halal', 3)] },
    { id: '40000000-0000-4000-8000-000000000015', code: 'activity_level', section: 'ACTIVITY', prompt: 'Bagaimana tingkat aktivitasmu saat ini?', valueType: 'SINGLE_SELECT', required: true, sortOrder: 15, options: [option(16, 'LOW', 'Ringan', 1), option(17, 'MODERATE', 'Sedang', 2), option(18, 'HIGH', 'Tinggi', 3)] },
    { id: '40000000-0000-4000-8000-000000000016', code: 'mobility_limitation', section: 'ACTIVITY', prompt: 'Apakah ada keterbatasan gerak yang ingin dicatat?', valueType: 'BOOLEAN', required: true, sortOrder: 16, options: [] },
    { id: '40000000-0000-4000-8000-000000000017', code: 'mobility_details', section: 'ACTIVITY', prompt: 'Ceritakan penyesuaian gerak yang kamu perlukan', valueType: 'TEXT', required: true, sortOrder: 17, visibleWhen: { questionCode: 'mobility_limitation', operator: 'equals', value: true }, options: [] },
  ],
};

const blankProgress = (userId: string, profileId: string): OnboardingProgressRecord => ({ id: crypto.randomUUID(), userId, profileId, status: 'ROLE_PENDING', currentStep: 'role-selection', stateVersion: 1, startedAt: now(), updatedAt: now() });

export function createMemoryRepositories(): DataRepositories {
  const accounts = new Map<string, AccountRecord>();
  const profiles = new Map<string, ProfileRecord>();
  const consents = new Map<string, ConsentRecord[]>();
  const guardianConsents = new Map<string, GuardianConsentRecord>();
  const progress = new Map<string, OnboardingProgressRecord>();
  const safetySessions = new Map<string, SafetySessionRecord>();
  const goals = new Map<string, UserGoalRecord>();
  const questionnaireSessions = new Map<string, QuestionnaireSessionRecord>();
  const programs = new Map<string, ProgramPreferenceRecord>();
  const auditEvents: Array<{ event: string; entityId?: string }> = [];

  const getProfile = (userId: string) => {
    const profile = profiles.get(userId);
    if (!profile) throw new NotFoundError('Profil belum dibuat.');
    return profile;
  };

  const putProfile = (profile: ProfileRecord) => { profiles.set(profile.userId, profile); return profile; };

  const getSession = (userId: string, sessionId: string) => {
    const session = safetySessions.get(sessionId);
    if (!session) return null;
    const profile = [...profiles.values()].find((item) => item.id === session.profileId && item.userId === userId);
    return profile ? session : null;
  };

  return {
    accounts: {
      async getOrCreate(identity) {
        const existing = accounts.get(identity.externalAuthId);
        if (existing) return existing;
        const record: AccountRecord = { id: identity.externalAuthId, ...identity, roles: identity.email.startsWith('admin@') ? ['ADMIN'] : ['USER'] };
        accounts.set(identity.externalAuthId, record);
        return record;
      },
      async findById(id) { return [...accounts.values()].find((item) => item.id === id) ?? null; },
    },
    profiles: {
      async getByUserId(userId) { return profiles.get(userId) ?? null; },
      async ensure(userId, fullName) {
        const existing = profiles.get(userId);
        if (existing) return existing;
        const record: ProfileRecord = { id: crypto.randomUUID(), userId, fullName, country: 'ID', timezone: 'Asia/Makassar', preferredLanguage: 'id-ID', onboardingStatus: 'ROLE_PENDING', createdAt: now(), updatedAt: now() };
        profiles.set(userId, record);
        progress.set(userId, blankProgress(userId, record.id));
        return record;
      },
      async update(userId, input) {
        const current = getProfile(userId);
        const dateOfBirth = input.dateOfBirth ?? current.dateOfBirth;
        return putProfile({ ...current, ...input, ...(dateOfBirth ? { dateOfBirth, age: calculateAge(dateOfBirth), ageGroup: classifyAge(dateOfBirth) } : {}), updatedAt: now() });
      },
    },
    roles: {
      async available() {
        return [
          { role: 'USER', label: 'Untuk diri sendiri', description: 'Saya menggunakan SARIRA untuk profil saya.' },
          { role: 'PARENT', label: 'Orang tua', description: 'Saya mendampingi anak atau keluarga.' },
          { role: 'GUARDIAN', label: 'Wali', description: 'Saya wali yang bertanggung jawab.' },
          { role: 'CAREGIVER', label: 'Pengasuh', description: 'Saya mendampingi anggota keluarga.' },
        ];
      },
      async setPrimary(userId, role: OnboardingRole) {
        const profile = getProfile(userId);
        const account = [...accounts.values()].find((item) => item.id === userId);
        if (account && !account.roles.includes(role)) account.roles = [...account.roles, role];
        return putProfile({ ...profile, primaryRole: role, onboardingStatus: 'BIRTH_DATE_PENDING', updatedAt: now() });
      },
    },
    consents: {
      async required() { return consentDefinitions.filter((item) => item.required); },
      async definitions() { return consentDefinitions; },
      async list(userId) { return consents.get(userId) ?? []; },
      async set(userId, profileId, type, version, granted, source) {
        const definition = consentDefinitions.find((item) => item.type === type && item.version === version);
        if (!definition) throw new ConflictError('Versi consent tidak aktif.');
        const current = consents.get(userId) ?? [];
        const record: ConsentRecord = { id: crypto.randomUUID(), type, version, status: granted ? 'GRANTED' : 'REVOKED', source, ...(granted ? { grantedAt: now() } : { revokedAt: now() }), updatedAt: now() };
        consents.set(userId, [...current.filter((item) => item.type !== type), record]);
        void profileId;
        return record;
      },
      async revoke(userId, profileId, type, source) {
        const current = (consents.get(userId) ?? []).find((item) => item.type === type);
        if (!current) throw new NotFoundError('Consent belum pernah diberikan.');
        return this.set(userId, profileId, type, current.version, false, source);
      },
    },
    guardian: {
      async get(profileId) { return guardianConsents.get(profileId) ?? null; },
      async set(profileId, input) {
        const record: GuardianConsentRecord = { id: crypto.randomUUID(), minorProfileId: profileId, guardianName: input.guardianName, guardianRelationship: input.guardianRelationship, status: 'GRANTED', consentVersion: input.consentVersion, grantedAt: now(), updatedAt: now() };
        guardianConsents.set(profileId, record);
        return record;
      },
      async revoke(profileId) {
        const current = guardianConsents.get(profileId);
        if (!current) throw new NotFoundError('Guardian consent belum tersedia.');
        const record = { ...current, status: 'REVOKED' as const, revokedAt: now(), updatedAt: now() };
        guardianConsents.set(profileId, record);
        return record;
      },
    },
    onboarding: {
      async get(userId, profileId) {
        const current = progress.get(userId) ?? blankProgress(userId, profileId);
        progress.set(userId, current);
        return current;
      },
      async advance(userId, profileId, input) {
        const current = progress.get(userId) ?? blankProgress(userId, profileId);
        const updated: OnboardingProgressRecord = { ...current, ...input, stateVersion: current.stateVersion + 1, updatedAt: now() };
        progress.set(userId, updated);
        putProfile({ ...getProfile(userId), onboardingStatus: input.status, updatedAt: now() });
        return updated;
      },
      async touch(userId, profileId, currentStep) {
        const current = progress.get(userId) ?? blankProgress(userId, profileId);
        const updated = { ...current, currentStep, stateVersion: current.stateVersion + 1, updatedAt: now() };
        progress.set(userId, updated);
        return updated;
      },
      async complete(userId, profileId) {
        const current = progress.get(userId) ?? blankProgress(userId, profileId);
        const completedAt = now();
        const updated: OnboardingProgressRecord = { ...current, status: 'COMPLETED', currentStep: 'starter-journey', lastCompletedStep: 'profile-summary', stateVersion: current.stateVersion + 1, completedAt, updatedAt: completedAt };
        progress.set(userId, updated);
        putProfile({ ...getProfile(userId), onboardingStatus: 'COMPLETED', onboardingCompletedAt: completedAt, updatedAt: completedAt });
        return updated;
      },
    },
    safety: {
      async currentTemplate() { return safetyTemplate; },
      async createSession(userId, profileId) {
        const existing = [...safetySessions.values()].find((item) => item.profileId === profileId && item.status === 'IN_PROGRESS');
        if (existing) return existing;
        const stamp = now();
        const record: SafetySessionRecord = { id: crypto.randomUUID(), profileId, templateId: safetyTemplate.id, templateVersion: safetyTemplate.version, ruleVersion: PHASE_3_RULE_VERSION, status: 'IN_PROGRESS', answers: [], startedAt: stamp, updatedAt: stamp };
        safetySessions.set(record.id, record);
        void userId;
        return record;
      },
      async saveAnswers(userId, sessionId, answers) {
        const session = getSession(userId, sessionId);
        if (!session) throw new NotFoundError('Sesi safety tidak ditemukan.');
        if (session.status !== 'IN_PROGRESS') throw new ConflictError('Sesi safety sudah selesai.');
        const updatedAnswers = [...session.answers];
        for (const answer of answers) {
          const question = safetyTemplate.questions.find((item) => item.id === answer.questionId);
          if (!question) throw new NotFoundError('Pertanyaan safety tidak ditemukan.');
          const record = { questionId: question.id, questionCode: question.code, answerCode: answer.answerCode, updatedAt: now() };
          const index = updatedAnswers.findIndex((item) => item.questionId === question.id);
          if (index >= 0) updatedAnswers[index] = record; else updatedAnswers.push(record);
        }
        const updated = { ...session, answers: updatedAnswers, updatedAt: now() };
        safetySessions.set(sessionId, updated);
        return updated;
      },
      async getSession(userId, sessionId) { return getSession(userId, sessionId); },
      async latestCompleted(profileId) {
        return [...safetySessions.values()].filter((item) => item.profileId === profileId && item.result).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.result ?? null;
      },
      async complete(userId, sessionId, evaluation) {
        const session = getSession(userId, sessionId);
        if (!session) throw new NotFoundError('Sesi safety tidak ditemukan.');
        if (session.result) return session.result;
        const completedAt = now();
        const result: SafetyResultRecord = { id: crypto.randomUUID(), sessionId, profileId: session.profileId, ...evaluation, completedAt };
        safetySessions.set(sessionId, { ...session, status: 'COMPLETED', result, updatedAt: completedAt });
        return result;
      },
    },
    goals: {
      async definitions() {
        return phase3GoalConfigurations.map((goal, index): GoalDefinitionRecord => ({ id: `goal-${index + 1}`, code: goal.code, label: goal.label, description: goal.description, eligible: true, priority: false, expertValidationRequired: true }));
      },
      async get(profileId) { return goals.get(profileId) ?? null; },
      async set(userId, profileId, code) {
        const definition = phase3GoalConfigurations.find((item) => item.code === code);
        if (!definition) throw new NotFoundError('Tujuan tidak ditemukan.');
        const record: UserGoalRecord = { id: goals.get(profileId)?.id ?? crypto.randomUUID(), code, label: definition.label, status: 'ACTIVE', updatedAt: now() };
        goals.set(profileId, record);
        void userId;
        return record;
      },
    },
    questionnaires: {
      async onboardingTemplate() { return questionnaireTemplate; },
      async createSession(userId, profileId, templateId) {
        if (templateId !== questionnaireTemplate.id) throw new NotFoundError('Template kuesioner tidak ditemukan.');
        const existing = [...questionnaireSessions.values()].find((item) => item.profileId === profileId && item.templateId === templateId && item.status === 'IN_PROGRESS');
        if (existing) return existing;
        const stamp = now();
        const record: QuestionnaireSessionRecord = { id: crypto.randomUUID(), profileId, templateId, templateVersion: questionnaireTemplate.version, status: 'IN_PROGRESS', answers: [], startedAt: stamp, updatedAt: stamp };
        questionnaireSessions.set(record.id, record);
        void userId;
        return record;
      },
      async getSession(userId, sessionId) {
        const session = questionnaireSessions.get(sessionId);
        if (!session) return null;
        const profile = [...profiles.values()].find((item) => item.id === session.profileId && item.userId === userId);
        return profile ? session : null;
      },
      async latest(profileId) { return [...questionnaireSessions.values()].filter((item) => item.profileId === profileId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null; },
      async saveAnswers(userId, sessionId, answers) {
        const session = await this.getSession(userId, sessionId);
        if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
        if (session.status !== 'IN_PROGRESS') throw new ConflictError('Sesi kuesioner sudah selesai.');
        const updatedAnswers = [...session.answers];
        for (const answer of answers) {
          const question = questionnaireTemplate.questions.find((item) => item.id === answer.questionId);
          if (!question) throw new NotFoundError('Pertanyaan kuesioner tidak ditemukan.');
          const record = { questionId: question.id, questionCode: question.code, value: answer.value as QuestionnaireAnswerValue, updatedAt: now() };
          const index = updatedAnswers.findIndex((item) => item.questionId === question.id);
          if (index >= 0) updatedAnswers[index] = record; else updatedAnswers.push(record);
        }
        const updated = { ...session, answers: updatedAnswers, updatedAt: now() };
        questionnaireSessions.set(sessionId, updated);
        return updated;
      },
      async complete(userId, sessionId) {
        const session = await this.getSession(userId, sessionId);
        if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
        if (session.status === 'COMPLETED') return session;
        const completedAt = now();
        const updated: QuestionnaireSessionRecord = { ...session, status: 'COMPLETED', completedAt, updatedAt: completedAt };
        questionnaireSessions.set(sessionId, updated);
        return updated;
      },
    },
    programs: {
      async get(profileId) { return programs.get(profileId) ?? null; },
      async set(profileId, program) {
        const stamp = now();
        const record: ProgramPreferenceRecord = { id: programs.get(profileId)?.id ?? crypto.randomUUID(), profileId, program, selectedAt: stamp, updatedAt: stamp };
        programs.set(profileId, record);
        return record;
      },
    },
    baseline: createMemoryBaselineRepository(),
    admin: {
      async configurationVersions() {
        return {
          consentVersions: consentDefinitions.map((item) => ({ type: item.type, version: item.version, status: item.contentStatus })),
          questionnaireVersions: [{ code: questionnaireTemplate.code, version: questionnaireTemplate.version, status: questionnaireTemplate.contentStatus }],
          safetyVersions: [{ code: safetyTemplate.code, version: safetyTemplate.version, ruleVersions: [PHASE_3_RULE_VERSION], status: safetyTemplate.contentStatus }],
          goals: phase3GoalConfigurations.map((item) => ({ code: item.code, status: PHASE_3_CONTENT_STATUS })),
        };
      },
    },
    audit: { async record(input) { auditEvents.push({ event: input.event, ...(input.entityId ? { entityId: input.entityId } : {}) }); } },
  };
}
