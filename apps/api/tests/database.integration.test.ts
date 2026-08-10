import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { MockAuthAdapter } from '../src/auth';
import { createPrismaClient } from '../src/database';
import { createPrismaRepositories } from '../src/repositories/prisma';

const connectionString = process.env.DATABASE_URL;
const prisma = connectionString ? createPrismaClient(connectionString) : null;
const repositories = prisma ? createPrismaRepositories(prisma) : null;

describe.runIf(Boolean(connectionString))('PostgreSQL Phase 3–7 integration', () => {
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
    const profileResponse = await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { declaredAge: 30, country: 'ID', timezone: 'Asia/Makassar', preferredLanguage: 'id-ID' } });
    expect(profileResponse.json().data).toMatchObject({ fullName: 'Integration Phase 3', declaredAge: 30, age: 30, ageGroup: 'ADULT_BALANCE', ageSource: 'DECLARED' });
    const profileId = profileResponse.json().data.id as string;
    expect(await prisma!.profile.findUnique({ where: { id: profileId }, select: { dateOfBirth: true, declaredAge: true, ageRecordedAt: true } })).toMatchObject({ dateOfBirth: null, declaredAge: 30, ageRecordedAt: expect.any(Date) });

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
    const completenessResponse = await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/completeness`, headers });
    expect(completenessResponse.statusCode, completenessResponse.body).toBe(200);
    expect(completenessResponse.json().data).toMatchObject({ score: 100, completedDays: 1 });

    const [dailyCheckIns, mealLogs, sleepLogs, activityLogs, completeDailyRecords, completenessSnapshots] = await Promise.all([
      prisma!.dailyCheckIn.count({ where: { baselineSessionId: baseline.id, profileId } }),
      prisma!.mealLog.count({ where: { baselineSessionId: baseline.id, profileId } }),
      prisma!.sleepLog.count({ where: { baselineSessionId: baseline.id, profileId } }),
      prisma!.activityLog.count({ where: { baselineSessionId: baseline.id, profileId } }),
      prisma!.dailyRecord.count({ where: { baselineSessionId: baseline.id, profileId, completenessStatus: 'COMPLETE' } }),
      prisma!.dataCompletenessSnapshot.count({ where: { baselineSessionId: baseline.id } }),
    ]);
    expect({ dailyCheckIns, mealLogs, sleepLogs, activityLogs, completeDailyRecords, completenessSnapshots }).toEqual({
      dailyCheckIns: 1,
      mealLogs: 1,
      sleepLogs: 1,
      activityLogs: 1,
      completeDailyRecords: 1,
      completenessSnapshots: 2,
    });

    const foods = (await app.inject({ method: 'GET', url: '/api/v1/foods?q=nasi%20putih', headers })).json().data.items as Array<{ id: string; servings: Array<{ id: string }> }>;
    expect(foods).toHaveLength(1);
    const nutritionItem = await app.inject({ method: 'POST', url: `/api/v1/meal-logs/${mealLogResponse.json().data.id as string}/items`, headers, payload: { foodItemId: foods[0]!.id, servingId: foods[0]!.servings[0]!.id, quantity: 1 } });
    expect(nutritionItem.statusCode, nutritionItem.body).toBe(201);
    const dailyNutrition = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate}`, headers })).json().data;
    expect(dailyNutrition).toMatchObject({ itemCount: 1, mealCount: 1, totals: { ENERGY_KCAL: 195 } });
    expect(dailyNutrition.target).toMatchObject({ policyCode: 'ADULT_GENERAL', safetyStatus: 'GREEN' });

    const generatedPlan = await app.inject({ method: 'POST', url: '/api/v1/meal-plans/generate', headers, payload: { localDate: baseline.startLocalDate } });
    expect(generatedPlan.statusCode, generatedPlan.body).toBe(201);
    const plan = generatedPlan.json().data as { id: string; policyVersion: string; items: Array<{ id: string; mealType: string; recipeVersionId: string }> };
    expect(plan.policyVersion).toBe('meal-planning-dev-v1'); expect(plan.items).toHaveLength(3);
    const lunch = plan.items.find((item) => item.mealType === 'LUNCH')!;
    const alternatives = await app.inject({ method: 'GET', url: `/api/v1/meal-plans/${plan.id}/items/${lunch.id}/alternatives`, headers }); expect(alternatives.statusCode, alternatives.body).toBe(200); expect(alternatives.json().data.length).toBeGreaterThan(0);
    const consumption = await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id}/items/${lunch.id}/consume`, headers, payload: { fraction: 0.25 } }); expect(consumption.statusCode, consumption.body).toBe(200); expect(consumption.json().data.alreadyConsumed).toBe(false);
    const repeatedConsumption = await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id}/items/${lunch.id}/consume`, headers, payload: { fraction: 0.25 } }); expect(repeatedConsumption.json().data.alreadyConsumed).toBe(true);

    const personalResponse = await app.inject({ method: 'POST', url: '/api/v1/profiles/me/recipes', headers, payload: { name: 'Nasi pribadi integration', description: 'Recipe private', servings: 2, cookingMethod: 'OTHER', mealTypes: ['LUNCH'], ingredients: [{ foodItemId: foods[0]!.id, servingId: foods[0]!.servings[0]!.id, quantity: 2 }], steps: [{ instruction: 'Siapkan dan sajikan.' }] } });
    expect(personalResponse.statusCode, personalResponse.body).toBe(201); const personal = personalResponse.json().data as { id: string; currentVersion: { version: number } }; expect(personal.currentVersion.version).toBe(1);
    const personalUpdate = await app.inject({ method: 'PATCH', url: `/api/v1/profiles/me/recipes/${personal.id}`, headers, payload: { name: 'Nasi pribadi integration revisi' } }); expect(personalUpdate.statusCode, personalUpdate.body).toBe(200); expect(personalUpdate.json().data.currentVersion.version).toBe(2);

    expect(await prisma!.profile.count({ where: { id: profileId, onboardingStatus: 'COMPLETED' } })).toBe(1);
    expect(await prisma!.auditLog.count({ where: { actorUserId: userId } })).toBeGreaterThanOrEqual(10);
    expect(await prisma!.questionnaireAnswer.count({ where: { sessionId: questionnaireSessionId } })).toBe(answers.length);
    expect(await prisma!.safetyResult.count({ where: { sessionId: safetySessionId, ruleVersion: 'phase3-dev-v1' } })).toBe(1);
    expect(await prisma!.baselineSession.count({ where: { id: baseline.id, profileId } })).toBe(1);
    expect(await prisma!.dailyRecord.count({ where: { baselineSessionId: baseline.id, completenessStatus: 'COMPLETE' } })).toBe(1);
    expect(await prisma!.dataCompletenessSnapshot.count({ where: { baselineSessionId: baseline.id } })).toBeGreaterThanOrEqual(2);
    expect(await prisma!.mealLogItem.count({ where: { profileId, snapshot: { is: { sourceVersion: 'phase5-synthetic-v1' } } } })).toBeGreaterThanOrEqual(4);
    expect(await prisma!.nutritionTargetProfile.count({ where: { profileId, policyVersion: 'phase5-dev-v1' } })).toBe(1);
    expect(await prisma!.dailyMealPlan.count({ where: { id: plan.id, profileId, policyVersion: 'meal-planning-dev-v1' } })).toBe(1);
    expect(await prisma!.mealPlanItemSnapshot.count({ where: { mealPlanItem: { mealPlanId: plan.id } } })).toBe(3);
    expect(await prisma!.mealPlanConsumption.count({ where: { mealPlanItemId: lunch.id } })).toBe(1);
    expect(await prisma!.recipeVersion.count({ where: { recipeId: personal.id } })).toBe(2);
    expect(await prisma!.recipeVersion.count({ where: { recipeId: personal.id, status: 'RETIRED' } })).toBe(1);

    await prisma!.baselineSession.update({ where: { id: baseline.id }, data: { startLocalDate: new Date('2026-07-27T00:00:00.000Z'), currentDay: 14, status: 'DAY_14_REVIEW_AVAILABLE' } });
    await prisma!.dailyRecord.updateMany({ where: { baselineSessionId: baseline.id, localDate: new Date(`${baseline.startLocalDate}T00:00:00.000Z`) }, data: { dayIndex: 14 } });
    for (let dayIndex = 1; dayIndex <= 10; dayIndex += 1) {
      const localDate = new Date(Date.parse('2026-07-27T00:00:00.000Z') + (dayIndex - 1) * 86_400_000).toISOString().slice(0, 10); const stamp = `${localDate}T08:00:00.000Z`;
      await repositories!.baseline.putCheckIn(profileId, baseline.id, localDate, dayIndex, { mood: dayIndex % 3 === 0 ? 'LOW' : 'GOOD', hunger: 4, fullness: 4, barriers: [] }, stamp);
      await repositories!.baseline.createMeal(profileId, baseline.id, dayIndex, { localDate, mealType: 'BREAKFAST', eatenAt: `${localDate}T07:00:00+08:00`, skipped: false, sugaryDrinkConsumed: dayIndex % 2 === 0 }, stamp);
      await repositories!.baseline.createSleep(profileId, baseline.id, dayIndex, { localDate, sleepStartedAt: `${localDate}T00:30:00+08:00`, wokeUpAt: `${localDate}T06:30:00+08:00`, durationMinutes: 360, perceivedQuality: 'FAIR' }, stamp);
      await repositories!.baseline.createActivity(profileId, baseline.id, dayIndex, { localDate, activityType: 'WALKING', durationMinutes: 10, perceivedIntensity: 'LIGHT' }, stamp);
    }
    const phase7 = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers }); expect(phase7.statusCode, phase7.body).toBe(201); const analysis = phase7.json().data;
    expect(analysis.patternMap.primaryPattern).toBeDefined(); expect(analysis.weeklyAction).toBeDefined(); expect(analysis.decision.ruleEvaluations).toHaveLength(13);
    expect(await prisma!.featureSnapshot.count({ where: { profileId, baselineSessionId: baseline.id } })).toBe(1);
    expect(await prisma!.decisionRecord.count({ where: { profileId, baselineSessionId: baseline.id } })).toBe(1);
    expect(await prisma!.patternMap.count({ where: { profileId, baselineSessionId: baseline.id } })).toBe(1);
    expect(await prisma!.weeklyActionAssignment.count({ where: { profileId } })).toBe(1);
    expect(await prisma!.ruleEvaluation.count({ where: { decisionRecordId: analysis.decision.id as string } })).toBe(13);
    const phase7Repeat = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers }); expect(phase7Repeat.statusCode).toBe(200); expect(phase7Repeat.json().data).toMatchObject({ reused: true, decision: { id: analysis.decision.id }, patternMap: { id: analysis.patternMap.id } });
    const checkIn = await app.inject({ method: 'POST', url: `/api/v1/weekly-actions/${analysis.weeklyAction.id as string}/check-ins`, headers, payload: { localDate: analysis.weeklyAction.weekStart } }); expect(checkIn.statusCode, checkIn.body).toBe(200); expect(checkIn.json().data.progress).toBe(1);
    const localDate = '2026-08-06'; const stamp = `${localDate}T08:00:00.000Z`;
    await repositories!.baseline.putCheckIn(profileId, baseline.id, localDate, 11, { mood: 'GOOD', hunger: 3, fullness: 3, barriers: [] }, stamp);
    await repositories!.baseline.createMeal(profileId, baseline.id, 11, { localDate, mealType: 'BREAKFAST', eatenAt: `${localDate}T07:00:00+08:00`, skipped: false, sugaryDrinkConsumed: false }, stamp);
    await repositories!.baseline.createSleep(profileId, baseline.id, 11, { localDate, sleepStartedAt: `${localDate}T00:00:00+08:00`, wokeUpAt: `${localDate}T07:00:00+08:00`, durationMinutes: 420, perceivedQuality: 'GOOD' }, stamp);
    await repositories!.baseline.createActivity(profileId, baseline.id, 11, { localDate, activityType: 'WALKING', durationMinutes: 25, perceivedIntensity: 'LIGHT' }, stamp);
    const phase7Reanalysis = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers }); expect(phase7Reanalysis.statusCode, phase7Reanalysis.body).toBe(201);
    expect(await prisma!.decisionRecord.count({ where: { profileId, baselineSessionId: baseline.id } })).toBe(2); expect(await prisma!.decisionRecord.count({ where: { profileId, supersededAt: null } })).toBe(1);
    expect(await prisma!.patternMap.count({ where: { profileId, baselineSessionId: baseline.id } })).toBe(2); expect(await prisma!.patternMap.count({ where: { profileId, status: 'SUPERSEDED' } })).toBe(1);
    expect(await prisma!.weeklyActionAssignment.count({ where: { profileId, status: 'ACTIVE' } })).toBe(1); expect(await prisma!.weeklyActionAssignment.count({ where: { profileId, status: 'REPLACED' } })).toBe(1);
    const extension = await prisma!.$queryRaw<Array<{ extname: string }>>`select extname from pg_extension where extname = 'vector'`;
    expect(extension[0]?.extname).toBe('vector');
  });
});
