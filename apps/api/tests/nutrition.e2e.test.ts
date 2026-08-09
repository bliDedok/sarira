import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FixedClock } from '@sarira/baseline';
import { buildApp } from '../src/app';

type Account = { email: string; password: string; headers: { authorization: string } };

describe('Phase 5 nutrition E2E', () => {
  let app: FastifyInstance;
  const clock = new FixedClock(new Date('2026-08-08T08:00:00.000Z'));
  beforeAll(async () => { app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent', RATE_LIMIT_MAX: '10000' }, logger: false, clock }); await app.ready(); });
  afterAll(async () => { await app.close(); });

  async function completeOnboarding(label: string, options: { birthDate?: string; goal?: string; allergy?: string } = {}): Promise<Account> {
    const password = 'StrongPassword1'; const email = `phase5-${label}-${crypto.randomUUID()}@example.test`;
    const register = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: `Phase Five ${label}`, email, password } });
    const headers = { authorization: `Bearer ${register.json().data.accessToken as string}` };
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } });
    const birthDate = options.birthDate ?? '1990-01-01';
    await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth: birthDate, gender: 'FEMALE', timezone: 'Asia/Makassar' } });
    if (Number(birthDate.slice(0, 4)) >= 2009) await app.inject({ method: 'POST', url: '/api/v1/guardian-consent', headers, payload: { guardianName: 'Wali Test', guardianRelationship: 'PARENT', consentVersion: 'phase3-dev-v1', confirmed: true } });
    const consents = (await app.inject({ method: 'GET', url: '/api/v1/consents/available', headers })).json().data as Array<{ type: string; version: string }>;
    for (const consent of consents.filter((item) => ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'HEALTH_PROFILE', 'NUTRITION_DATA', 'ACTIVITY_DATA', 'SLEEP_DATA'].includes(item.type))) await app.inject({ method: 'PUT', url: `/api/v1/consents/${consent.type}`, headers, payload: { granted: true, version: consent.version } });
    const safety = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const safetySession = (await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers })).json().data;
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${safetySession.id as string}/answers`, headers, payload: { answers: (safety.template.questions as Array<{ id: string }>).map((question) => ({ questionId: question.id, answerCode: 'NO' })) } });
    await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${safetySession.id as string}/complete`, headers });
    const birthYear = Number(birthDate.slice(0, 4)); const defaultGoal = birthYear >= 2009 ? 'OPTIMIZE_GROWTH' : birthYear <= 1966 ? 'MAINTAIN_MOBILITY' : 'MAINTAIN_WEIGHT';
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code: options.goal ?? defaultGoal } });
    const questionnaire = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers })).json().data;
    const questionnaireSession = (await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${questionnaire.template.id as string}/sessions`, headers })).json().data;
    const answers = (questionnaire.template.questions as Array<{ id: string; code: string; valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }>).map((question) => ({
      questionId: question.id,
      value: question.code === 'has_allergy' ? Boolean(options.allergy) : question.code === 'allergy_details' ? options.allergy ?? 'Tidak ada' : question.valueType === 'NUMBER' ? question.code === 'height_cm' ? 170 : question.code.includes('weight') ? 65 : Math.max(question.validation?.minimum ?? 1, 2) : question.valueType === 'BOOLEAN' ? false : question.valueType === 'TIME' ? '22:00' : question.valueType === 'SINGLE_SELECT' ? question.options[0]?.code : question.valueType === 'MULTI_SELECT' ? [question.options[0]?.code] : 'Jawaban Phase 5',
    }));
    await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${questionnaireSession.id as string}/answers`, headers, payload: { answers } });
    await app.inject({ method: 'POST', url: `/api/v1/questionnaire-sessions/${questionnaireSession.id as string}/complete`, headers });
    const programs = (await app.inject({ method: 'GET', url: '/api/v1/program-preferences', headers })).json().data;
    const eligible = (programs.options as Array<{ code: string; eligible: boolean }>).find((item) => item.eligible);
    if (eligible) await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/program-preference', headers, payload: { program: eligible.code } }); else await app.inject({ method: 'POST', url: '/api/v1/profiles/me/program-preference/skip', headers });
    expect((await app.inject({ method: 'POST', url: '/api/v1/onboarding/complete', headers })).statusCode).toBe(200);
    return { email, password, headers };
  }

  async function startMeal(account: Account) {
    const baseline = (await app.inject({ method: 'POST', url: '/api/v1/baseline', headers: account.headers })).json().data;
    const meal = await app.inject({ method: 'POST', url: '/api/v1/meal-logs', headers: account.headers, payload: { localDate: baseline.startLocalDate, mealType: 'BREAKFAST', description: 'Sarapan nutrition E2E', skipped: false } });
    return { baseline, meal: meal.json().data as { id: string } };
  }

  async function food(name: string, account: Account) {
    const search = await app.inject({ method: 'GET', url: `/api/v1/foods?q=${encodeURIComponent(name)}`, headers: account.headers });
    const value = search.json().data.items[0]; expect(value).toBeDefined(); return value as { id: string; servings: Array<{ id: string }> };
  }

  async function add(account: Account, mealId: string, name: string, quantity = 1) {
    const value = await food(name, account); const response = await app.inject({ method: 'POST', url: `/api/v1/meal-logs/${mealId}/items`, headers: account.headers, payload: { foodItemId: value.id, servingId: value.servings[0]!.id, quantity } }); expect(response.statusCode).toBe(201); return response.json().data;
  }

  it('A — nasi + telur memperbarui total harian deterministic', async () => {
    const account = await completeOnboarding('adult'); const { baseline, meal } = await startMeal(account); await add(account, meal.id, 'nasi putih'); await add(account, meal.id, 'telur');
    const daily = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: account.headers })).json().data;
    expect(daily).toMatchObject({ itemCount: 2, mealCount: 1 }); expect(daily.totals.ENERGY_KCAL).toBe(280); expect(daily.totals.PROTEIN_G).toBeCloseTo(10.8);
  });

  it('B — edit dan delete porsi menginvalidasi total', async () => {
    const account = await completeOnboarding('portion'); const { baseline, meal } = await startMeal(account); const item = await add(account, meal.id, 'nasi putih');
    expect((await app.inject({ method: 'PATCH', url: `/api/v1/meal-log-items/${item.id as string}`, headers: account.headers, payload: { quantity: 2 } })).json().data.quantity).toBe(2);
    let daily = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: account.headers })).json().data; expect(daily.totals.ENERGY_KCAL).toBe(390);
    await app.inject({ method: 'DELETE', url: `/api/v1/meal-log-items/${item.id as string}`, headers: account.headers }); daily = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: account.headers })).json().data; expect(daily.itemCount).toBe(0);
  });

  it('C — indicator minimum, range, dan upper limit berasal dari target real', async () => {
    const account = await completeOnboarding('indicator'); const { baseline, meal } = await startMeal(account); await add(account, meal.id, 'nasi putih');
    const daily = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: account.headers })).json().data;
    expect(daily.target.policyCode).toBe('ADULT_GENERAL'); expect(daily.indicators.find((item: { nutrientCode: string }) => item.nutrientCode === 'PROTEIN_G').status).toBe('BELOW_MINIMUM'); expect(daily.indicators.find((item: { nutrientCode: string }) => item.nutrientCode === 'SODIUM_MG').status).toBe('WITHIN_LIMIT');
  });

  it('D — sodium missing tampil unknown, bukan nol', async () => {
    const account = await completeOnboarding('unknown'); const { baseline, meal } = await startMeal(account); await add(account, meal.id, 'oatmeal');
    const daily = (await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: account.headers })).json().data; expect(daily.totals.SODIUM_MG).toBeNull(); expect(daily.indicators.find((item: { nutrientCode: string }) => item.nutrientCode === 'SODIUM_MG')).toMatchObject({ status: 'UNAVAILABLE', statusLabel: 'Data belum tersedia.' });
  });

  it('E — allergen profile menghasilkan warning match', async () => {
    const account = await completeOnboarding('allergen', { allergy: 'Alergi telur' }); const egg = await food('telur', account);
    const preview = await app.inject({ method: 'POST', url: '/api/v1/nutrition/preview', headers: account.headers, payload: { foodItemId: egg.id, servingId: egg.servings[0]!.id, quantity: 1 } }); expect(preview.json().data.allergenWarnings[0]).toMatchObject({ code: 'EGG', matchedProfile: true });
  });

  it('F — teen memilih policy khusus dan tidak memakai adult policy', async () => {
    const account = await completeOnboarding('teen', { birthDate: '2011-01-01' }); const target = await app.inject({ method: 'GET', url: '/api/v1/nutrition/targets/current', headers: account.headers }); expect(target.json().data).toMatchObject({ policyCode: 'TEEN_GENERAL', ageGroup: 'TEEN', restricted: true }); expect(target.json().data.restrictionReasons).toContain('TEEN_GENERAL_POLICY_NO_ADULT_FORMULA');
  });

  it('G — Healthy Aging tidak mendapat automatic deficit', async () => {
    const account = await completeOnboarding('aging', { birthDate: '1961-01-01' }); const target = await app.inject({ method: 'GET', url: '/api/v1/nutrition/targets/current', headers: account.headers }); expect(target.json().data.policyCode).toBe('HEALTHY_AGING_GENERAL'); expect(target.json().data.restrictionReasons).toContain('HEALTHY_AGING_NO_AUTOMATIC_DEFICIT');
  });

  it('H — login ulang mempertahankan snapshot dan ownership/consent diterapkan', async () => {
    const owner = await completeOnboarding('resume'); const { baseline, meal } = await startMeal(owner); const item = await add(owner, meal.id, 'tempe');
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: owner.email, password: owner.password } }); const resumed = { authorization: `Bearer ${login.json().data.accessToken as string}` };
    expect((await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: resumed })).json().data.items[0].snapshot.foodName).toMatch(/tempe/i);
    const intruder = await completeOnboarding('intruder'); await startMeal(intruder); expect((await app.inject({ method: 'PATCH', url: `/api/v1/meal-log-items/${item.id as string}`, headers: intruder.headers, payload: { quantity: 2 } })).statusCode).toBe(403);
    await app.inject({ method: 'DELETE', url: '/api/v1/consents/NUTRITION_DATA', headers: owner.headers }); const denied = await app.inject({ method: 'GET', url: `/api/v1/nutrition/daily/${baseline.startLocalDate as string}`, headers: owner.headers }); expect(denied.statusCode).toBe(409); expect(denied.json().error.code).toBe('CONSENT_REQUIRED');
  });

  it('Safety RED menghasilkan target restricted tanpa angka', async () => {
    const account = await completeOnboarding('red');
    expect((await app.inject({ method: 'GET', url: '/api/v1/nutrition/targets/current', headers: account.headers })).json().data.safetyStatus).toBe('GREEN');
    const current = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers: account.headers })).json().data;
    const session = (await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers: account.headers })).json().data;
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${session.id as string}/answers`, headers: account.headers, payload: { answers: (current.template.questions as Array<{ id: string; code: string }>).map((question) => ({ questionId: question.id, answerCode: question.code === 'professional_restriction' ? 'YES' : 'NO' })) } });
    expect((await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${session.id as string}/complete`, headers: account.headers })).json().data.status).toBe('RED');
    const target = await app.inject({ method: 'GET', url: '/api/v1/nutrition/targets/current', headers: account.headers });
    expect(target.json().data).toMatchObject({ safetyStatus: 'RED', restricted: true, targets: [], calculationReason: 'PROFILE_SAFETY_GOAL_OR_POLICY_CHANGED' });
  });
});
