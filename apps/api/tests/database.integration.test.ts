import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { MockAuthAdapter } from '../src/auth';
import { createPrismaClient } from '../src/database';
import { createPrismaRepositories } from '../src/repositories/prisma';

const connectionString = process.env.DATABASE_URL;
const prisma = connectionString ? createPrismaClient(connectionString) : null;
const repositories = prisma ? createPrismaRepositories(prisma) : null;

describe.runIf(Boolean(connectionString))('PostgreSQL Phase 3–5 integration', () => {
  let app: FastifyInstance;
  let userId: string | undefined;
  const email = `phase3-integration-${crypto.randomUUID()}@example.test`;

  beforeAll(async () => {
    app = await buildApp({
      env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent' },
      auth: new MockAuthAdapter(),
      repositories: repositories!,
      logger: false,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app?.close();
    if (prisma && userId) await prisma.user.delete({ where: { id: userId } });
    await prisma?.$disconnect();
  });

  it('menjalankan onboarding → baseline → daily tracking → completeness pada database nyata', async () => {
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: 'Integration Phase 3', email, password: 'StrongPassword1' } });
    expect(registration.statusCode, registration.body).toBe(201);
    userId = registration.json().data.user.id as string;
    const headers = { authorization: `Bearer ${registration.json().data.accessToken as string}` };

    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } })).statusCode).toBe(200);
    const profileResponse = await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth: '1996-01-01', country: 'ID', timezone: 'Asia/Makassar', preferredLanguage: 'id-ID' } });
    expect(profileResponse.json().data).toMatchObject({ fullName: 'Integration Phase 3', ageGroup: 'ADULT_BALANCE' });
    const profileId = profileResponse.json().data.id as string;

    const required = (await app.inject({ method: 'GET', url: '/api/v1/consents/required', headers })).json().data as Array<{ type: string; version: string }>;
    expect(required.length).toBeGreaterThanOrEqual(3);
    for (const item of required) expect((await app.inject({ method: 'PUT', url: `/api/v1/consents/${item.type}`, headers, payload: { granted: true, version: item.version, source: 'ONBOARDING' } })).statusCode).toBe(200);

    const safetyCurrent = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const safetySession = await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers });
    const safetySessionId = safetySession.json().data.id as string;
    const safetyAnswers = (safetyCurrent.template.questions as Array<{ id: string }>).map((question) => ({ questionId: question.id, answerCode: 'NO' }));
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${safetySessionId}/answers`, headers, payload: { answers: safetyAnswers } });
    expect((await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${safetySessionId}/complete`, headers })).json().data.status).toBe('GREEN');

    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code: 'MAINTAIN_WEIGHT' } })).statusCode).toBe(200);
    const questionnaire = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers })).json().data;
    const questionnaireSession = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${questionnaire.template.id as string}/sessions`, headers });
    const questionnaireSessionId = questionnaireSession.json().data.id as string;
    const answers = (questionnaire.template.questions as Array<{ id: string; valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }>).map((question) => ({
      questionId: question.id,
      value: question.valueType === 'NUMBER' ? Math.max(question.validation?.minimum ?? 1, question.validation?.minimum === 80 ? 170 : question.validation?.minimum === 20 ? 65 : 2) : question.valueType === 'BOOLEAN' ? false : question.valueType === 'TIME' ? '22:00' : question.valueType === 'SINGLE_SELECT' ? question.options[0]?.code : question.valueType === 'MULTI_SELECT' ? [question.options[0]?.code] : 'Jawaban integration',
    }));
    expect((await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${questionnaireSessionId}/answers`, headers, payload: { answers } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: `/api/v1/questionnaire-sessions/${questionnaireSessionId}/complete`, headers })).statusCode).toBe(200);
    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/program-preference', headers, payload: { program: 'GUIDED_MEAL' } })).statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/api/v1/onboarding/complete', headers })).statusCode).toBe(200);

    const available = (await app.inject({ method: 'GET', url: '/api/v1/consents/available', headers })).json().data as Array<{ type: string; version: string }>;
    for (const item of available.filter((consent) => ['NUTRITION_DATA', 'SLEEP_DATA', 'ACTIVITY_DATA'].includes(consent.type))) {
      expect((await app.inject({ method: 'PUT', url: `/api/v1/consents/${item.type}`, headers, payload: { granted: true, version: item.version, source: 'FEATURE_PROMPT' } })).statusCode).toBe(200);
    }
    const baselineResponse = await app.inject({ method: 'POST', url: '/api/v1/baseline', headers });
    expect(baselineResponse.statusCode).toBe(201);
    const baseline = baselineResponse.json().data as { id: string; startLocalDate: string };
    expect((await app.inject({ method: 'PUT', url: `/api/v1/daily-checkins/${baseline.startLocalDate}`, headers, payload: { mood: 'GOOD', hunger: 3, fullness: 4, barriers: [] } })).statusCode).toBe(200);
    const mealLogResponse = await app.inject({ method: 'POST', url: '/api/v1/meal-logs', headers, payload: { localDate: baseline.startLocalDate, mealType: 'BREAKFAST', description: 'Sarapan integration', skipped: false } });
    expect(mealLogResponse.statusCode).toBe(201);
    expect((await app.inject({ method: 'POST', url: '/api/v1/sleep-logs', headers, payload: { localDate: baseline.startLocalDate, sleepStartedAt: `${baseline.startLocalDate}T00:00:00+08:00`, wokeUpAt: `${baseline.startLocalDate}T07:00:00+08:00`, perceivedQuality: 'GOOD' } })).statusCode).toBe(201);
    expect((await app.inject({ method: 'POST', url: '/api/v1/activity-logs', headers, payload: { localDate: baseline.startLocalDate, activityType: 'WALKING', durationMinutes: 20, perceivedIntensity: 'LIGHT' } })).statusCode).toBe(201);
    expect((await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/completeness`, headers })).json().data).toMatchObject({ score: 100, completedDays: 1 });

    const foods = (await app.inject({ method: 'GET', url: '/api/v1/foods?q=nasi%20putih', headers })).json().data.items as Array<{ id: string; servings: Array<{ id: string }> }>;
    expect(foods).toHaveLength(1);
    const nutritionItem = await app.inject({ method: 'POST', url: `/api/v1/meal-logs/${mealLogResponse.json().data.id as string}/items`, headers, payload: { foodItemId: foods[0]!.id, servingId: foods[0]!.servings[0]!.id, quantity: 1 } });
    expect(nutritionItem.statusCode, nutritionItem.body).toBe(201);
    const dailyNutrition = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate}`, headers })).json().data;
    expect(dailyNutrition).toMatchObject({ itemCount: 1, mealCount: 1, totals: { ENERGY_KCAL: 195 } });
    expect(dailyNutrition.target).toMatchObject({ policyCode: 'ADULT_GENERAL', safetyStatus: 'GREEN' });

    expect(await prisma!.profile.count({ where: { id: profileId, onboardingStatus: 'COMPLETED' } })).toBe(1);
    expect(await prisma!.auditLog.count({ where: { actorUserId: userId } })).toBeGreaterThanOrEqual(10);
    expect(await prisma!.questionnaireAnswer.count({ where: { sessionId: questionnaireSessionId } })).toBe(answers.length);
    expect(await prisma!.safetyResult.count({ where: { sessionId: safetySessionId, ruleVersion: 'phase3-dev-v1' } })).toBe(1);
    expect(await prisma!.baselineSession.count({ where: { id: baseline.id, profileId } })).toBe(1);
    expect(await prisma!.dailyRecord.count({ where: { baselineSessionId: baseline.id, completenessStatus: 'COMPLETE' } })).toBe(1);
    expect(await prisma!.dataCompletenessSnapshot.count({ where: { baselineSessionId: baseline.id } })).toBeGreaterThanOrEqual(2);
    expect(await prisma!.mealLogItem.count({ where: { profileId, snapshot: { is: { sourceVersion: 'phase5-synthetic-v1' } } } })).toBe(1);
    expect(await prisma!.nutritionTargetProfile.count({ where: { profileId, policyVersion: 'phase5-dev-v1' } })).toBe(1);
    const extension = await prisma!.$queryRaw<Array<{ extname: string }>>`select extname from pg_extension where extname = 'vector'`;
    expect(extension[0]?.extname).toBe('vector');
  });
});
