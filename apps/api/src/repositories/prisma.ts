import type {
  ConsentDefinition,
  ConsentRecord,
  GoalDefinitionRecord,
  GuardianConsentRecord,
  OnboardingProgressRecord,
  OnboardingStep,
  ProgramPreferenceRecord,
  QuestionnaireAnswerValue,
  QuestionnaireSessionRecord,
  QuestionnaireTemplateRecord,
  SafetyResultRecord,
  SafetySessionRecord,
  SafetyTemplateRecord,
  UserGoalRecord,
  UserRole,
} from '@sarira/shared-types';
import { calculateAge, classifyAge } from '@sarira/expert-system';
import { ConflictError, NotFoundError } from '../errors';
import type { DataRepositories, ProfileRecord } from '../contracts';
import type { SariraPrismaClient } from '../database';
import {
  AuditEvent,
  ConsentStatus,
  GuardianConsentStatus,
  Prisma,
  QuestionnaireSessionStatus,
  Role,
  SafetySessionStatus,
} from '../generated/prisma/client';
import type { ConsentSource, ConsentType, OnboardingStatus, ProgramCode, SafetyAnswerCode, SafetyStatus } from '../generated/prisma/client';

const dateOnly = (value: Date) => value.toISOString().slice(0, 10);

const profileRecord = (value: {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth: Date | null;
  gender: string | null;
  country: string;
  timezone: string;
  preferredLanguage: string;
  primaryRole: string | null;
  onboardingStatus: string;
  onboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): ProfileRecord => {
  const dob = value.dateOfBirth ? dateOnly(value.dateOfBirth) : undefined;
  return {
    id: value.id,
    userId: value.userId,
    fullName: value.fullName,
    ...(dob ? { dateOfBirth: dob, age: calculateAge(dob), ageGroup: classifyAge(dob) } : {}),
    ...(value.gender ? { gender: value.gender as ProfileRecord['gender'] } : {}),
    country: value.country,
    timezone: value.timezone,
    preferredLanguage: value.preferredLanguage,
    ...(value.primaryRole ? { primaryRole: value.primaryRole as UserRole } : {}),
    onboardingStatus: value.onboardingStatus as ProfileRecord['onboardingStatus'],
    ...(value.onboardingCompletedAt ? { onboardingCompletedAt: value.onboardingCompletedAt.toISOString() } : {}),
    createdAt: value.createdAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
};

const progressRecord = (value: {
  id: string; userId: string; profileId: string; status: string; currentStep: string; lastCompletedStep: string | null;
  stateVersion: number; startedAt: Date; completedAt: Date | null; updatedAt: Date;
}): OnboardingProgressRecord => ({
  id: value.id,
  userId: value.userId,
  profileId: value.profileId,
  status: value.status as OnboardingProgressRecord['status'],
  currentStep: value.currentStep as OnboardingStep,
  ...(value.lastCompletedStep ? { lastCompletedStep: value.lastCompletedStep as OnboardingStep } : {}),
  stateVersion: value.stateVersion,
  startedAt: value.startedAt.toISOString(),
  ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}),
  updatedAt: value.updatedAt.toISOString(),
});

const consentDefinitionRecord = (value: {
  id: string; type: string; version: string; displayName: string; description: string; required: boolean;
  contentStatus: string; expertValidationRequired: boolean;
}): ConsentDefinition => ({
  id: value.id,
  type: value.type as ConsentDefinition['type'],
  version: value.version,
  displayName: value.displayName,
  description: value.description,
  required: value.required,
  contentStatus: value.contentStatus as ConsentDefinition['contentStatus'],
  expertValidationRequired: value.expertValidationRequired,
});

const consentRecord = (value: {
  id: string; status: string; source: string; grantedAt: Date | null; revokedAt: Date | null; updatedAt: Date;
  consentVersion: { type: string; version: string };
}): ConsentRecord => ({
  id: value.id,
  type: value.consentVersion.type as ConsentRecord['type'],
  version: value.consentVersion.version,
  status: value.status as ConsentRecord['status'],
  source: value.source as ConsentRecord['source'],
  ...(value.grantedAt ? { grantedAt: value.grantedAt.toISOString() } : {}),
  ...(value.revokedAt ? { revokedAt: value.revokedAt.toISOString() } : {}),
  updatedAt: value.updatedAt.toISOString(),
});

const guardianRecord = (value: {
  id: string; minorProfileId: string; guardianName: string; guardianRelationship: string; status: string; consentVersion: string;
  grantedAt: Date | null; revokedAt: Date | null; updatedAt: Date;
}): GuardianConsentRecord => ({
  id: value.id,
  minorProfileId: value.minorProfileId,
  guardianName: value.guardianName,
  guardianRelationship: value.guardianRelationship,
  status: value.status as GuardianConsentRecord['status'],
  consentVersion: value.consentVersion,
  ...(value.grantedAt ? { grantedAt: value.grantedAt.toISOString() } : {}),
  ...(value.revokedAt ? { revokedAt: value.revokedAt.toISOString() } : {}),
  updatedAt: value.updatedAt.toISOString(),
});

const safetyTemplateRecord = (value: {
  id: string; code: string; version: string; title: string; description: string; contentStatus: string; expertValidationRequired: boolean;
  questions: Array<{ id: string; code: string; category: string; prompt: string; helpText: string | null; required: boolean; allowsUnknown: boolean; sortOrder: number }>;
}): SafetyTemplateRecord => ({
  id: value.id,
  code: value.code,
  version: value.version,
  title: value.title,
  description: value.description,
  contentStatus: value.contentStatus,
  expertValidationRequired: value.expertValidationRequired,
  questions: value.questions.map((question) => ({ id: question.id, code: question.code, category: question.category, prompt: question.prompt, ...(question.helpText ? { helpText: question.helpText } : {}), required: question.required, allowsUnknown: question.allowsUnknown, sortOrder: question.sortOrder })),
});

const safetyResultRecord = (value: {
  id: string; sessionId: string; profileId: string | null; status: string; triggeredRules: string[]; restrictedPrograms: string[];
  referralRequired: boolean; ruleVersion: string; completedAt: Date;
}): SafetyResultRecord => {
  if (!value.profileId) throw new ConflictError('Safety result tidak terhubung ke profil.');
  return { id: value.id, sessionId: value.sessionId, profileId: value.profileId, status: value.status as SafetyResultRecord['status'], triggeredRules: value.triggeredRules, restrictedPrograms: value.restrictedPrograms, referralRequired: value.referralRequired, ruleVersion: value.ruleVersion, completedAt: value.completedAt.toISOString() };
};

const safetySessionRecord = (value: {
  id: string; profileId: string | null; templateId: string | null; ruleVersion: string; status: string; startedAt: Date; updatedAt: Date;
  template: { version: string } | null;
  answers: Array<{ questionId: string; answerCode: string; updatedAt: Date; questionDefinition: { id: string; code: string } | null }>;
  result: { id: string; sessionId: string; profileId: string | null; status: string; triggeredRules: string[]; restrictedPrograms: string[]; referralRequired: boolean; ruleVersion: string; completedAt: Date } | null;
}): SafetySessionRecord => {
  if (!value.profileId || !value.templateId || !value.template) throw new ConflictError('Sesi safety lama tidak memiliki template Phase 3.');
  return {
    id: value.id,
    profileId: value.profileId,
    templateId: value.templateId,
    templateVersion: value.template.version,
    ruleVersion: value.ruleVersion,
    status: value.status as SafetySessionRecord['status'],
    answers: value.answers.map((answer) => ({ questionId: answer.questionDefinition?.id ?? answer.questionId, questionCode: answer.questionDefinition?.code ?? answer.questionId, answerCode: answer.answerCode as SafetyAnswerCode, updatedAt: answer.updatedAt.toISOString() })),
    ...(value.result ? { result: safetyResultRecord(value.result) } : {}),
    startedAt: value.startedAt.toISOString(),
    updatedAt: value.updatedAt.toISOString(),
  };
};

const questionnaireTemplateRecord = (value: {
  id: string; code: string; version: string; title: string; description: string; contentStatus: string; expertValidationRequired: boolean;
  questions: Array<{ id: string; code: string; section: string; prompt: string; helpText: string | null; valueType: string; required: boolean; sortOrder: number; validation: unknown; visibleWhen: unknown; options: Array<{ id: string; code: string; label: string; sortOrder: number }> }>;
}): QuestionnaireTemplateRecord => ({
  id: value.id,
  code: value.code,
  version: value.version,
  title: value.title,
  description: value.description,
  contentStatus: value.contentStatus,
  expertValidationRequired: value.expertValidationRequired,
  questions: value.questions.map((question) => ({
    id: question.id,
    code: question.code,
    section: question.section,
    prompt: question.prompt,
    ...(question.helpText ? { helpText: question.helpText } : {}),
    valueType: question.valueType as QuestionnaireTemplateRecord['questions'][number]['valueType'],
    required: question.required,
    sortOrder: question.sortOrder,
    ...(question.validation && typeof question.validation === 'object' ? { validation: question.validation as Record<string, unknown> } : {}),
    ...(question.visibleWhen && typeof question.visibleWhen === 'object' ? { visibleWhen: question.visibleWhen as QuestionnaireTemplateRecord['questions'][number]['visibleWhen'] } : {}),
    options: question.options.map((option) => ({ id: option.id, code: option.code, label: option.label, sortOrder: option.sortOrder })),
  })),
});

const questionnaireSessionRecord = (value: {
  id: string; profileId: string; templateId: string; status: string; startedAt: Date; completedAt: Date | null; updatedAt: Date;
  template: { version: string };
  answers: Array<{ questionId: string; value: unknown; updatedAt: Date; question: { code: string } }>;
}): QuestionnaireSessionRecord => ({
  id: value.id,
  profileId: value.profileId,
  templateId: value.templateId,
  templateVersion: value.template.version,
  status: value.status as QuestionnaireSessionRecord['status'],
  answers: value.answers.map((answer) => ({ questionId: answer.questionId, questionCode: answer.question.code, value: answer.value as QuestionnaireAnswerValue, updatedAt: answer.updatedAt.toISOString() })),
  startedAt: value.startedAt.toISOString(),
  ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}),
  updatedAt: value.updatedAt.toISOString(),
});

export function createPrismaRepositories(prisma: SariraPrismaClient): DataRepositories {
  const safetySessionInclude = { template: true, answers: { include: { questionDefinition: true } }, result: true } as const;
  const questionnaireSessionInclude = { template: true, answers: { include: { question: true }, orderBy: { updatedAt: 'asc' as const } } } as const;

  return {
    accounts: {
      async getOrCreate(identity) {
        const user = await prisma.user.upsert({
          where: { externalAuthId: identity.externalAuthId },
          update: { email: identity.email },
          create: { externalAuthId: identity.externalAuthId, email: identity.email, status: 'ACTIVE', roles: { create: { role: Role.USER } } },
          include: { roles: true },
        });
        return { id: user.id, externalAuthId: user.externalAuthId, email: user.email, roles: user.roles.map((item) => item.role as UserRole) };
      },
      async findById(id) {
        const user = await prisma.user.findUnique({ where: { id }, include: { roles: true } });
        return user ? { id: user.id, externalAuthId: user.externalAuthId, email: user.email, roles: user.roles.map((item) => item.role as UserRole) } : null;
      },
    },
    profiles: {
      async getByUserId(userId) {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        return profile ? profileRecord(profile) : null;
      },
      async ensure(userId, fullName) {
        const existing = await prisma.profile.findUnique({ where: { userId } });
        if (existing) return profileRecord(existing);
        const profile = await prisma.profile.create({
          data: { userId, fullName, onboardingProgress: { create: { userId } } },
        });
        return profileRecord(profile);
      },
      async update(userId, input) {
        const current = await prisma.profile.findUnique({ where: { userId } });
        if (!current) throw new NotFoundError('Profil belum dibuat.');
        const data = {
          ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
          ...(input.dateOfBirth !== undefined ? { dateOfBirth: new Date(`${input.dateOfBirth}T00:00:00.000Z`) } : {}),
          ...(input.gender !== undefined ? { gender: input.gender } : {}),
          ...(input.country !== undefined ? { country: input.country } : {}),
          ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
          ...(input.preferredLanguage !== undefined ? { preferredLanguage: input.preferredLanguage } : {}),
          ...(input.primaryRole !== undefined ? { primaryRole: input.primaryRole as Role } : {}),
          ...(input.onboardingStatus !== undefined ? { onboardingStatus: input.onboardingStatus as OnboardingStatus } : {}),
          ...(input.onboardingCompletedAt !== undefined ? { onboardingCompletedAt: input.onboardingCompletedAt ? new Date(input.onboardingCompletedAt) : null } : {}),
        };
        return profileRecord(await prisma.profile.update({ where: { userId }, data }));
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
      async setPrimary(userId, role) {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) throw new NotFoundError('Profil belum dibuat.');
        await prisma.$transaction([
          prisma.roleAssignment.upsert({ where: { userId_role: { userId, role: role as Role } }, update: {}, create: { userId, role: role as Role } }),
          prisma.profile.update({ where: { userId }, data: { primaryRole: role as Role, onboardingStatus: 'BIRTH_DATE_PENDING' } }),
        ]);
        return profileRecord((await prisma.profile.findUnique({ where: { userId } }))!);
      },
    },
    consents: {
      async required() {
        const values = await prisma.consentVersion.findMany({ where: { required: true, activeAt: { lte: new Date() }, retiredAt: null }, orderBy: [{ type: 'asc' }, { activeAt: 'desc' }] });
        const latest = new Map<string, ConsentDefinition>();
        for (const value of values) if (!latest.has(value.type)) latest.set(value.type, consentDefinitionRecord(value));
        return [...latest.values()];
      },
      async definitions() {
        const values = await prisma.consentVersion.findMany({ where: { activeAt: { lte: new Date() }, retiredAt: null }, orderBy: [{ type: 'asc' }, { activeAt: 'desc' }] });
        const latest = new Map<string, ConsentDefinition>();
        for (const value of values) if (!latest.has(value.type)) latest.set(value.type, consentDefinitionRecord(value));
        return [...latest.values()];
      },
      async list(userId) {
        const values = await prisma.userConsent.findMany({ where: { userId }, include: { consentVersion: true }, orderBy: { createdAt: 'desc' } });
        const latest = new Map<string, ConsentRecord>();
        for (const value of values) if (!latest.has(value.consentVersion.type)) latest.set(value.consentVersion.type, consentRecord(value));
        return [...latest.values()];
      },
      async set(userId, profileId, type, version, granted, source) {
        const consentVersion = await prisma.consentVersion.findUnique({ where: { type_version_locale: { type: type as ConsentType, version, locale: 'id-ID' } } });
        if (!consentVersion || consentVersion.retiredAt || consentVersion.activeAt > new Date()) throw new ConflictError('Versi consent tidak aktif.');
        const value = await prisma.userConsent.create({
          data: { userId, profileId, consentVersionId: consentVersion.id, status: granted ? ConsentStatus.GRANTED : ConsentStatus.REVOKED, source: source as ConsentSource, grantedAt: granted ? new Date() : null, revokedAt: granted ? null : new Date() },
          include: { consentVersion: true },
        });
        return consentRecord(value);
      },
      async revoke(userId, profileId, type, source) {
        const latest = await prisma.userConsent.findFirst({ where: { userId, profileId, consentVersion: { type: type as ConsentType } }, include: { consentVersion: true }, orderBy: { createdAt: 'desc' } });
        if (!latest) throw new NotFoundError('Consent belum pernah diberikan.');
        const value = await prisma.userConsent.create({ data: { userId, profileId, consentVersionId: latest.consentVersionId, status: ConsentStatus.REVOKED, source: source as ConsentSource, revokedAt: new Date() }, include: { consentVersion: true } });
        return consentRecord(value);
      },
    },
    guardian: {
      async get(profileId) {
        const value = await prisma.guardianConsent.findFirst({ where: { minorProfileId: profileId }, orderBy: { createdAt: 'desc' } });
        return value ? guardianRecord(value) : null;
      },
      async set(profileId, input) {
        await prisma.guardianConsent.updateMany({ where: { minorProfileId: profileId, status: GuardianConsentStatus.GRANTED }, data: { status: GuardianConsentStatus.REVOKED, revokedAt: new Date() } });
        const value = await prisma.guardianConsent.create({ data: { minorProfileId: profileId, guardianName: input.guardianName, guardianRelationship: input.guardianRelationship, status: GuardianConsentStatus.GRANTED, consentVersion: input.consentVersion, grantedAt: new Date() } });
        return guardianRecord(value);
      },
      async revoke(profileId) {
        const current = await prisma.guardianConsent.findFirst({ where: { minorProfileId: profileId, status: GuardianConsentStatus.GRANTED }, orderBy: { createdAt: 'desc' } });
        if (!current) throw new NotFoundError('Guardian consent aktif tidak ditemukan.');
        return guardianRecord(await prisma.guardianConsent.update({ where: { id: current.id }, data: { status: GuardianConsentStatus.REVOKED, revokedAt: new Date() } }));
      },
    },
    onboarding: {
      async get(userId, profileId) {
        const value = await prisma.onboardingProgress.upsert({ where: { userId }, update: {}, create: { userId, profileId } });
        return progressRecord(value);
      },
      async advance(userId, profileId, input) {
        const [value] = await prisma.$transaction([
          prisma.onboardingProgress.upsert({ where: { userId }, update: { status: input.status as OnboardingStatus, currentStep: input.currentStep, lastCompletedStep: input.lastCompletedStep, stateVersion: { increment: 1 } }, create: { userId, profileId, status: input.status as OnboardingStatus, currentStep: input.currentStep, lastCompletedStep: input.lastCompletedStep } }),
          prisma.profile.update({ where: { id: profileId }, data: { onboardingStatus: input.status as OnboardingStatus } }),
        ]);
        return progressRecord(value);
      },
      async touch(userId, profileId, currentStep) {
        return progressRecord(await prisma.onboardingProgress.upsert({ where: { userId }, update: { currentStep, stateVersion: { increment: 1 } }, create: { userId, profileId, currentStep } }));
      },
      async complete(userId, profileId) {
        const completedAt = new Date();
        const [value] = await prisma.$transaction([
          prisma.onboardingProgress.update({ where: { userId }, data: { status: 'COMPLETED', currentStep: 'starter-journey', lastCompletedStep: 'profile-summary', completedAt, stateVersion: { increment: 1 } } }),
          prisma.profile.update({ where: { id: profileId }, data: { onboardingStatus: 'COMPLETED', onboardingCompletedAt: completedAt } }),
        ]);
        return progressRecord(value);
      },
    },
    safety: {
      async currentTemplate() {
        const template = await prisma.safetyScreeningTemplate.findFirst({ where: { activeAt: { lte: new Date() }, retiredAt: null }, include: { questions: { orderBy: { sortOrder: 'asc' } } }, orderBy: { activeAt: 'desc' } });
        if (!template) throw new NotFoundError('Template safety aktif belum tersedia.');
        return safetyTemplateRecord(template);
      },
      async createSession(userId, profileId) {
        const existing = await prisma.safetyScreeningSession.findFirst({ where: { userId, profileId, status: SafetySessionStatus.IN_PROGRESS }, include: safetySessionInclude, orderBy: { createdAt: 'desc' } });
        if (existing) return safetySessionRecord(existing);
        const template = await prisma.safetyScreeningTemplate.findFirst({ where: { activeAt: { lte: new Date() }, retiredAt: null }, orderBy: { activeAt: 'desc' } });
        if (!template) throw new NotFoundError('Template safety aktif belum tersedia.');
        const created = await prisma.safetyScreeningSession.create({ data: { userId, profileId, templateId: template.id, rulesetId: template.code, rulesetHash: `${template.code}:${template.version}`, ruleVersion: template.version, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, include: safetySessionInclude });
        return safetySessionRecord(created);
      },
      async saveAnswers(userId, sessionId, answers) {
        const session = await prisma.safetyScreeningSession.findFirst({ where: { id: sessionId, userId }, include: safetySessionInclude });
        if (!session) throw new NotFoundError('Sesi safety tidak ditemukan.');
        if (session.status !== SafetySessionStatus.IN_PROGRESS) throw new ConflictError('Sesi safety sudah selesai atau kedaluwarsa.');
        if (session.expiresAt && session.expiresAt < new Date()) {
          await prisma.safetyScreeningSession.update({ where: { id: sessionId }, data: { status: SafetySessionStatus.EXPIRED } });
          throw new ConflictError('Sesi safety kedaluwarsa. Mulai sesi baru.');
        }
        const questions = await prisma.safetyQuestion.findMany({ where: { templateId: session.templateId ?? undefined, id: { in: answers.map((answer) => answer.questionId) } } });
        if (questions.length !== answers.length) throw new NotFoundError('Satu atau lebih pertanyaan safety tidak ditemukan.');
        await prisma.$transaction(answers.map((answer) => {
          const question = questions.find((item) => item.id === answer.questionId)!;
          return prisma.safetyAnswer.upsert({ where: { sessionId_questionId: { sessionId, questionId: question.code } }, update: { answerCode: answer.answerCode as SafetyAnswerCode, questionDefinitionId: question.id }, create: { sessionId, questionId: question.code, questionDefinitionId: question.id, answerCode: answer.answerCode as SafetyAnswerCode } });
        }));
        return safetySessionRecord((await prisma.safetyScreeningSession.findUnique({ where: { id: sessionId }, include: safetySessionInclude }))!);
      },
      async getSession(userId, sessionId) {
        const value = await prisma.safetyScreeningSession.findFirst({ where: { id: sessionId, userId }, include: safetySessionInclude });
        return value ? safetySessionRecord(value) : null;
      },
      async latestCompleted(profileId) {
        const value = await prisma.safetyResult.findFirst({ where: { profileId }, orderBy: { completedAt: 'desc' } });
        return value ? safetyResultRecord(value) : null;
      },
      async complete(userId, sessionId, result) {
        const session = await prisma.safetyScreeningSession.findFirst({ where: { id: sessionId, userId }, include: { result: true } });
        if (!session || !session.profileId) throw new NotFoundError('Sesi safety tidak ditemukan.');
        if (session.result) return safetyResultRecord(session.result);
        const completedAt = new Date();
        const [created] = await prisma.$transaction([
          prisma.safetyResult.create({ data: { sessionId, profileId: session.profileId, status: result.status as SafetyStatus, triggeredRules: result.triggeredRules, restrictedPrograms: result.restrictedPrograms, referralRequired: result.referralRequired, ruleVersion: result.ruleVersion, completedAt } }),
          prisma.safetyScreeningSession.update({ where: { id: sessionId }, data: { status: SafetySessionStatus.COMPLETED, completedAt } }),
        ]);
        return safetyResultRecord(created);
      },
    },
    goals: {
      async definitions() {
        const values = await prisma.goalDefinition.findMany({ where: { active: true }, orderBy: { code: 'asc' } });
        return values.map((value): GoalDefinitionRecord => ({ id: value.id, code: value.code as GoalDefinitionRecord['code'], label: value.label, description: value.description, eligible: true, priority: false, expertValidationRequired: value.expertValidationRequired }));
      },
      async get(profileId) {
        const value = await prisma.userGoal.findFirst({ where: { profileId, status: 'ACTIVE' }, include: { definition: true }, orderBy: { updatedAt: 'desc' } });
        return value ? { id: value.id, code: value.code as UserGoalRecord['code'], label: value.definition?.label ?? value.code, status: value.status, updatedAt: value.updatedAt.toISOString() } : null;
      },
      async set(userId, profileId, code) {
        const definition = await prisma.goalDefinition.findUnique({ where: { code } });
        if (!definition || !definition.active) throw new NotFoundError('Tujuan tidak tersedia.');
        await prisma.userGoal.updateMany({ where: { profileId, status: 'ACTIVE' }, data: { status: 'ARCHIVED' } });
        const value = await prisma.userGoal.create({ data: { userId, profileId, definitionId: definition.id, code }, include: { definition: true } });
        return { id: value.id, code: value.code as UserGoalRecord['code'], label: value.definition?.label ?? value.code, status: value.status, updatedAt: value.updatedAt.toISOString() };
      },
    },
    questionnaires: {
      async onboardingTemplate() {
        const template = await prisma.questionnaireTemplate.findFirst({ where: { code: 'ONBOARDING_PROFILE', activeAt: { lte: new Date() }, retiredAt: null }, include: { questions: { include: { options: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } } }, orderBy: { activeAt: 'desc' } });
        if (!template) throw new NotFoundError('Template kuesioner aktif belum tersedia.');
        return questionnaireTemplateRecord(template);
      },
      async createSession(userId, profileId, templateId) {
        const template = await prisma.questionnaireTemplate.findUnique({ where: { id: templateId } });
        if (!template || template.retiredAt) throw new NotFoundError('Template kuesioner tidak tersedia.');
        const existing = await prisma.questionnaireSession.findFirst({ where: { userId, profileId, templateId, status: QuestionnaireSessionStatus.IN_PROGRESS }, include: questionnaireSessionInclude, orderBy: { updatedAt: 'desc' } });
        if (existing) return questionnaireSessionRecord(existing);
        const value = await prisma.questionnaireSession.create({ data: { userId, profileId, templateId }, include: questionnaireSessionInclude });
        return questionnaireSessionRecord(value);
      },
      async getSession(userId, sessionId) {
        const value = await prisma.questionnaireSession.findFirst({ where: { id: sessionId, userId }, include: questionnaireSessionInclude });
        return value ? questionnaireSessionRecord(value) : null;
      },
      async latest(profileId) {
        const value = await prisma.questionnaireSession.findFirst({ where: { profileId }, include: questionnaireSessionInclude, orderBy: { updatedAt: 'desc' } });
        return value ? questionnaireSessionRecord(value) : null;
      },
      async saveAnswers(userId, sessionId, answers) {
        const session = await prisma.questionnaireSession.findFirst({ where: { id: sessionId, userId } });
        if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
        if (session.status !== QuestionnaireSessionStatus.IN_PROGRESS) throw new ConflictError('Sesi kuesioner sudah selesai.');
        const questions = await prisma.questionnaireQuestion.findMany({ where: { templateId: session.templateId, id: { in: answers.map((answer) => answer.questionId) } } });
        if (questions.length !== answers.length) throw new NotFoundError('Satu atau lebih pertanyaan kuesioner tidak ditemukan.');
        await prisma.$transaction(answers.map((answer) => prisma.questionnaireAnswer.upsert({
          where: { sessionId_questionId: { sessionId, questionId: answer.questionId } },
          update: { value: answer.value === null ? Prisma.JsonNull : answer.value as Prisma.InputJsonValue },
          create: { sessionId, questionId: answer.questionId, value: answer.value === null ? Prisma.JsonNull : answer.value as Prisma.InputJsonValue },
        })));
        return questionnaireSessionRecord((await prisma.questionnaireSession.findUnique({ where: { id: sessionId }, include: questionnaireSessionInclude }))!);
      },
      async complete(userId, sessionId) {
        const session = await prisma.questionnaireSession.findFirst({ where: { id: sessionId, userId }, include: questionnaireSessionInclude });
        if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
        if (session.status === QuestionnaireSessionStatus.COMPLETED) return questionnaireSessionRecord(session);
        const value = await prisma.questionnaireSession.update({ where: { id: sessionId }, data: { status: QuestionnaireSessionStatus.COMPLETED, completedAt: new Date() }, include: questionnaireSessionInclude });
        return questionnaireSessionRecord(value);
      },
    },
    programs: {
      async get(profileId) {
        const value = await prisma.programPreference.findUnique({ where: { profileId } });
        return value ? { id: value.id, profileId: value.profileId, program: value.program as ProgramPreferenceRecord['program'], selectedAt: value.selectedAt.toISOString(), updatedAt: value.updatedAt.toISOString() } : null;
      },
      async set(profileId, program) {
        const value = await prisma.programPreference.upsert({ where: { profileId }, update: { program: program as ProgramCode, selectedAt: new Date() }, create: { profileId, program: program as ProgramCode } });
        return { id: value.id, profileId: value.profileId, program: value.program as ProgramPreferenceRecord['program'], selectedAt: value.selectedAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
      },
    },
    admin: {
      async configurationVersions() {
        const [consents, questionnaires, safety, rules, goals] = await Promise.all([
          prisma.consentVersion.findMany({ where: { retiredAt: null }, orderBy: { activeAt: 'desc' } }),
          prisma.questionnaireTemplate.findMany({ where: { retiredAt: null }, orderBy: { activeAt: 'desc' } }),
          prisma.safetyScreeningTemplate.findMany({ where: { retiredAt: null }, orderBy: { activeAt: 'desc' } }),
          prisma.safetyRuleDefinition.findMany({ orderBy: { ruleId: 'asc' } }),
          prisma.goalDefinition.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
        ]);
        return {
          consentVersions: consents.map((item) => ({ type: item.type, version: item.version, status: item.contentStatus })),
          questionnaireVersions: questionnaires.map((item) => ({ code: item.code, version: item.version, status: item.contentStatus })),
          safetyVersions: safety.map((item) => ({ code: item.code, version: item.version, ruleVersions: rules.filter((rule) => rule.templateId === item.id).map((rule) => rule.version), status: item.contentStatus })),
          goals: goals.map((item) => ({ code: item.code, status: item.contentStatus })),
        };
      },
    },
    audit: {
      async record(input) {
        if (!(input.event in AuditEvent)) return;
        await prisma.auditLog.create({ data: { actorUserId: input.actorUserId, event: input.event as AuditEvent, entityType: input.entityType, entityId: input.entityId, requestId: input.requestId, metadata: input.metadata } });
      },
    },
  };
}
