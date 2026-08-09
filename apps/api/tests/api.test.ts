import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  calculateAge,
  classifyAge,
  evaluateSafety,
  getGoalEligibility,
  isQuestionVisible,
  requiresGuardianConsent,
  validateOnboardingCompletion,
  validateQuestionnaireCompletion,
} from '@sarira/expert-system';
import { bodyProfileSchema, dateOfBirthSchema, guardianConsentSchema, questionnaireAnswersSchema } from '@sarira/validation';
import { buildApp } from '../src/app';
import { hasRequiredRole } from '../src/plugins/auth';
import { parseServerEnv } from '@sarira/config';

describe('Phase 3 domain rules', () => {
  const reference = new Date('2026-08-08T00:00:00.000Z');

  it('menghitung usia dan kelompok pada batas tanggal lahir', () => {
    expect(calculateAge('1996-08-08', reference)).toBe(30);
    expect(calculateAge('1996-08-09', reference)).toBe(29);
    expect(classifyAge('2011-08-08', reference)).toBe('TEEN');
    expect(classifyAge('2008-08-08', reference)).toBe('YOUNG_ADULT');
    expect(classifyAge('1961-08-08', reference)).toBe('HEALTHY_AGING');
    expect(classifyAge('1950-08-07', reference)).toBe('OVER_75');
  });

  it('mewajibkan guardian consent hanya untuk usia 12–17', () => {
    expect(requiresGuardianConsent('2011-01-01', reference)).toBe(true);
    expect(requiresGuardianConsent('2008-01-01', reference)).toBe(false);
  });

  it('mengevaluasi safety secara deterministic, versioned, dan fail-safe', () => {
    const requiredQuestionCodes = ['concerning_change', 'professional_restriction', 'risk_information'];
    expect(evaluateSafety({ age: 30, requiredQuestionCodes, answers: { concerning_change: 'NO', professional_restriction: 'NO', risk_information: 'NO' } }).status).toBe('GREEN');
    expect(evaluateSafety({ age: 30, requiredQuestionCodes, answers: { concerning_change: 'YES', professional_restriction: 'NO', risk_information: 'NO' } }).status).toBe('YELLOW');
    const red = evaluateSafety({ age: 30, requiredQuestionCodes, answers: { concerning_change: 'NO', professional_restriction: 'YES', risk_information: 'NO' } });
    expect(red).toMatchObject({ status: 'RED', referralRequired: true, ruleVersion: 'phase3-dev-v1' });
    expect(evaluateSafety({ age: 30, requiredQuestionCodes, answers: { concerning_change: 'NO' } }).status).toBe('UNKNOWN');
  });

  it('memfilter tujuan menurut usia, role, dan safety', () => {
    const teen = getGoalEligibility({ age: 15, ageGroup: 'TEEN', role: 'USER', safetyStatus: 'GREEN' });
    expect(teen.find((goal) => goal.code === 'OPTIMIZE_GROWTH')).toMatchObject({ eligible: true, priority: true });
    expect(teen.find((goal) => goal.code === 'LOSE_WEIGHT')?.eligible).toBe(false);
    const aging = getGoalEligibility({ age: 65, ageGroup: 'HEALTHY_AGING', role: 'USER', safetyStatus: 'GREEN' });
    expect(aging.find((goal) => goal.code === 'MAINTAIN_MOBILITY')).toMatchObject({ eligible: true, priority: true });
    const red = getGoalEligibility({ age: 30, ageGroup: 'ADULT_BALANCE', role: 'USER', safetyStatus: 'RED' });
    expect(red.find((goal) => goal.code === 'MAINTAIN_WEIGHT')?.eligible).toBe(false);
  });

  it('memvalidasi completion dan required consent/guardian state', () => {
    expect(validateOnboardingCompletion({ roleComplete: true, validDateOfBirth: true, ageGroup: 'TEEN', guardianConsentGranted: false, requiredConsentsGranted: true, safetyCompleted: true, goalValid: true, questionnaireCompleted: true, programPreferenceCompleted: true })).toContain('GUARDIAN_CONSENT_MISSING');
    expect(validateOnboardingCompletion({ roleComplete: true, validDateOfBirth: true, ageGroup: 'ADULT_BALANCE', guardianConsentGranted: false, requiredConsentsGranted: false, safetyCompleted: true, goalValid: true, questionnaireCompleted: true, programPreferenceCompleted: true })).toContain('REQUIRED_CONSENT_MISSING');
  });

  it('mendukung conditional question dari schema', () => {
    const question = { visibleWhen: { questionCode: 'has_allergy', operator: 'equals' as const, value: true } };
    expect(isQuestionVisible(question, { has_allergy: true })).toBe(true);
    expect(isQuestionVisible(question, { has_allergy: false })).toBe(false);
    expect(validateQuestionnaireCompletion([{ id: 'q', code: 'allergy_details', section: 'DIET', prompt: 'Detail', valueType: 'TEXT', required: true, sortOrder: 1, visibleWhen: question.visibleWhen, options: [] }], { has_allergy: false })).toEqual([]);
  });

  it('menerapkan shared schema dan bounds teknis', () => {
    expect(dateOfBirthSchema.safeParse('2099-01-01').success).toBe(false);
    expect(bodyProfileSchema.safeParse({ heightCm: 40, weightKg: 60 }).success).toBe(false);
    expect(guardianConsentSchema.safeParse({ guardianName: 'Wali', guardianRelationship: 'PARENT', consentVersion: 'v1', confirmed: false }).success).toBe(false);
    expect(questionnaireAnswersSchema.safeParse({ answers: [{ questionId: crypto.randomUUID(), value: 172 }] }).success).toBe(true);
  });
});

describe('SARIRA API v1 Phase 6', () => {
  let app: FastifyInstance;
  beforeAll(async () => { app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent' }, logger: false }); await app.ready(); });
  afterAll(async () => app.close());

  it('menyediakan health/version Phase 6 dan melindungi route private', async () => {
    expect((await app.inject({ method: 'GET', url: '/api/v1/health' })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/version' })).json().data).toMatchObject({ apiVersion: 'v1', phase: 6, status: 'meal-planning-real' });
    const denied = await app.inject({ method: 'GET', url: '/api/v1/me' });
    expect(denied.statusCode).toBe(401);
    expect((await app.inject({ method: 'GET', url: '/api/v1/foods' })).statusCode).toBe(401);
    const accepted = await app.inject({ method: 'GET', url: '/api/v1/me', headers: { authorization: 'Bearer mock-user-token' } });
    expect(accepted.json().data).toMatchObject({ onboardingCompleted: false, currentStep: 'role-selection' });
  });

  it('mengizinkan seluruh method onboarding pada preflight web', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/profiles/me/role',
      headers: {
        origin: 'http://localhost:8081',
        'access-control-request-method': 'PUT',
        'access-control-request-headers': 'authorization,content-type',
      },
    });
    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-methods']).toContain('PUT');
    expect(response.headers['access-control-allow-methods']).toContain('PATCH');
    expect(response.headers['access-control-allow-methods']).toContain('DELETE');
  });

  it('membuat account, profile, role, dan consent versioned', async () => {
    const email = `unit-${crypto.randomUUID()}@example.test`;
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: 'Unit Test', email, password: 'StrongPassword1' } });
    expect(registration.statusCode).toBe(201);
    const token = registration.json().data.accessToken as string;
    const headers = { authorization: `Bearer ${token}` };
    expect((await app.inject({ method: 'GET', url: '/api/v1/profiles/me', headers })).json().data.fullName).toBe('Unit Test');
    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } })).statusCode).toBe(200);
    const definitions = (await app.inject({ method: 'GET', url: '/api/v1/consents/required', headers })).json().data as Array<{ type: string; version: string }>;
    for (const definition of definitions) expect((await app.inject({ method: 'PUT', url: `/api/v1/consents/${definition.type}`, headers, payload: { granted: true, version: definition.version, source: 'ONBOARDING' } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/consents/me', headers })).json().data).toHaveLength(definitions.length);
  });

  it('menerapkan role authorization termasuk super admin', () => {
    expect(hasRequiredRole(['USER'], ['ADMIN'])).toBe(false);
    expect(hasRequiredRole(['ADMIN'], ['ADMIN'])).toBe(true);
    expect(hasRequiredRole(['SUPER_ADMIN'], ['CONTENT_REVIEWER'])).toBe(true);
  });

  it('memvalidasi environment dan menolak real mode tanpa secret server', () => {
    expect(parseServerEnv({ APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true' }).PORT).toBe(4000);
    expect(() => parseServerEnv({ APP_ENV: 'staging', NODE_ENV: 'production', USE_MOCK_DATA: 'false' })).toThrow(/Missing server environment/);
  });
});
