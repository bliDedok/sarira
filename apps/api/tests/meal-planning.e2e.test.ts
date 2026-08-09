import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { FixedClock } from '@sarira/baseline';
import { buildApp } from '../src/app';

type Account = { headers: { authorization: string }; localDate: string };

describe('Phase 6 Guided Meal and Flex Kitchen E2E', () => {
  let app: FastifyInstance;
  const clock = new FixedClock(new Date('2026-08-08T08:00:00.000Z'));
  beforeAll(async () => { app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent', RATE_LIMIT_MAX: '10000' }, logger: false, clock }); await app.ready(); });
  afterAll(async () => app.close());

  async function completeAccount(label: string, options: { allergy?: string; dietary?: string[]; red?: boolean } = {}): Promise<Account> {
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: `Phase Six ${label}`, email: `phase6-${label}-${crypto.randomUUID()}@example.test`, password: 'StrongPassword1' } });
    const headers = { authorization: `Bearer ${registration.json().data.accessToken as string}` };
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } });
    await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth: '1990-01-01', gender: 'FEMALE', timezone: 'Asia/Makassar' } });
    const consents = (await app.inject({ method: 'GET', url: '/api/v1/consents/available', headers })).json().data as Array<{ type: string; version: string }>;
    for (const consent of consents.filter((item) => ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'HEALTH_PROFILE', 'NUTRITION_DATA', 'ACTIVITY_DATA', 'SLEEP_DATA'].includes(item.type))) await app.inject({ method: 'PUT', url: `/api/v1/consents/${consent.type}`, headers, payload: { granted: true, version: consent.version } });
    const safety = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const safetySession = (await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers })).json().data;
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${safetySession.id as string}/answers`, headers, payload: { answers: (safety.template.questions as Array<{ id: string; code: string }>).map((question) => ({ questionId: question.id, answerCode: options.red && question.code === 'professional_restriction' ? 'YES' : 'NO' })) } });
    await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${safetySession.id as string}/complete`, headers });
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code: 'MAINTAIN_WEIGHT' } });
    const questionnaireResponse = await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers }); expect(questionnaireResponse.statusCode, questionnaireResponse.body).toBe(200); const questionnaire = questionnaireResponse.json().data;
    const sessionResponse = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${questionnaire.template.id as string}/sessions`, headers }); expect(sessionResponse.statusCode, sessionResponse.body).toBe(201); const session = sessionResponse.json().data;
    const answers = (questionnaire.template.questions as Array<{ id: string; code: string; valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }>).map((question) => ({
      questionId: question.id,
      value: question.code === 'has_allergy' ? Boolean(options.allergy) : question.code === 'allergy_details' ? options.allergy ?? 'Tidak ada' : question.code === 'diet_preferences' ? options.dietary ?? ['NO_PREFERENCE'] : question.valueType === 'NUMBER' ? question.code === 'height_cm' ? 170 : question.code.includes('weight') ? 65 : Math.max(question.validation?.minimum ?? 1, 2) : question.valueType === 'BOOLEAN' ? false : question.valueType === 'TIME' ? '22:00' : question.valueType === 'SINGLE_SELECT' ? question.options[0]?.code : question.valueType === 'MULTI_SELECT' ? [question.options[0]?.code] : 'Jawaban Phase 6',
    }));
    await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${session.id as string}/answers`, headers, payload: { answers } });
    await app.inject({ method: 'POST', url: `/api/v1/questionnaire-sessions/${session.id as string}/complete`, headers });
    const programs = (await app.inject({ method: 'GET', url: '/api/v1/program-preferences', headers })).json().data;
    const guided = (programs.options as Array<{ code: string; eligible: boolean }>).find((item) => item.code === 'GUIDED_MEAL' && item.eligible);
    if (guided) await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/program-preference', headers, payload: { program: guided.code } }); else await app.inject({ method: 'POST', url: '/api/v1/profiles/me/program-preference/skip', headers });
    expect((await app.inject({ method: 'POST', url: '/api/v1/onboarding/complete', headers })).statusCode).toBe(200);
    const baseline = await app.inject({ method: 'POST', url: '/api/v1/baseline', headers }); expect(baseline.statusCode).toBe(201);
    return { headers, localDate: baseline.json().data.startLocalDate as string };
  }

  it('Guided Meal menghasilkan plan versioned, alternatif eligible, replacement, Cooking Mode, dan konsumsi idempoten', async () => {
    const account = await completeAccount('guided');
    const generated = await app.inject({ method: 'POST', url: '/api/v1/meal-plans/generate', headers: account.headers, payload: { localDate: account.localDate } });
    expect(generated.statusCode, generated.body).toBe(201); const plan = generated.json().data;
    expect(plan).toMatchObject({ status: 'ACTIVE', policyVersion: 'meal-planning-dev-v1', nutritionPolicyVersion: 'phase5-dev-v1' }); expect(plan.items.length).toBe(3);
    expect(plan.remainingNutrition.PROTEIN_G).toMatchObject({ type: 'MINIMUM' }); expect(plan.remainingNutrition.SODIUM_MG).toMatchObject({ type: 'UPPER_LIMIT' });
    const lunch = plan.items.find((item: { mealType: string }) => item.mealType === 'LUNCH'); expect(lunch.recipe.sourceType).toBe('SYNTHETIC_DEVELOPMENT'); expect(lunch.recipe.currentVersion.nutrition.perServing.ENERGY_KCAL).toBeGreaterThan(0);
    const detail = await app.inject({ method: 'GET', url: `/api/v1/recipes/${lunch.recipe.id as string}`, headers: account.headers }); expect(detail.json().data.currentVersion.ingredients).toHaveLength(3);
    const alternatives = await app.inject({ method: 'GET', url: `/api/v1/meal-plans/${plan.id as string}/items/${lunch.id as string}/alternatives`, headers: account.headers }); expect(alternatives.statusCode).toBe(200); expect(alternatives.json().data.length).toBeGreaterThan(0); expect(alternatives.json().data[0]).toHaveProperty('difference');
    const replacement = alternatives.json().data[0]; const replaced = await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id as string}/items/${lunch.id as string}/replace`, headers: account.headers, payload: { recipeId: replacement.recipe.id, reason: 'VARIETY' } }); expect(replaced.statusCode).toBe(200);
    const activeLunch = replaced.json().data.items.find((item: { mealType: string; status: string }) => item.mealType === 'LUNCH' && item.status !== 'REPLACED');
    expect((await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id as string}/items/${activeLunch.id as string}/cooking`, headers: account.headers })).json().data.status).toBe('COOKING');
    const consumed = await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id as string}/items/${activeLunch.id as string}/consume`, headers: account.headers, payload: { fraction: 0.5 } }); expect(consumed.statusCode, consumed.body).toBe(200); expect(consumed.json().data).toMatchObject({ alreadyConsumed: false }); expect(consumed.json().data.nutrition.itemCount).toBe(3);
    const repeated = await app.inject({ method: 'POST', url: `/api/v1/meal-plans/${plan.id as string}/items/${activeLunch.id as string}/consume`, headers: account.headers, payload: { fraction: 0.5 } }); expect(repeated.json().data).toMatchObject({ alreadyConsumed: true }); expect(repeated.json().data.nutrition.itemCount).toBe(3);
  });

  it('Flex Kitchen menghitung real-time, mempertahankan unknown, memberi substitusi before/after, dan menjaga ownership personal recipe', async () => {
    const owner = await completeAccount('flex'); const foods = (await app.inject({ method: 'GET', url: '/api/v1/foods?pageSize=20', headers: owner.headers })).json().data.items; const tempe = foods.find((item: { name: string }) => item.name.toLowerCase().includes('tempe')); const tofu = foods.find((item: { name: string }) => item.name.toLowerCase().includes('tahu'));
    const preview = await app.inject({ method: 'POST', url: '/api/v1/flex-kitchen/preview', headers: owner.headers, payload: { localDate: owner.localDate, servings: 2, ingredients: [{ foodItemId: tempe.id, servingId: tempe.servings[0].id, quantity: 2 }, { customName: 'Bumbu keluarga', quantity: 1 }] } }); expect(preview.statusCode, preview.body).toBe(200); expect(preview.json().data.nutrition.perServing.SODIUM_MG).toBeNull(); expect(preview.json().data.nutrition.missingNutrients).toContain('SODIUM_MG'); expect(preview.json().data.suggestions.length).toBeLessThanOrEqual(3);
    const substitution = await app.inject({ method: 'POST', url: '/api/v1/flex-kitchen/substitutions', headers: owner.headers, payload: { localDate: owner.localDate, ingredient: { foodItemId: tempe.id, servingId: tempe.servings[0].id, quantity: 1 }, replacementFoodItemId: tofu.id } }); expect(substitution.statusCode, substitution.body).toBe(200); expect(substitution.json().data[0]).toMatchObject({ requiresConfirmation: true }); expect(substitution.json().data[0]).toHaveProperty('before'); expect(substitution.json().data[0]).toHaveProperty('after');
    const saved = await app.inject({ method: 'POST', url: '/api/v1/profiles/me/recipes', headers: owner.headers, payload: { name: 'Tempe pribadi', description: 'Private test recipe', servings: 2, prepTimeMinutes: 5, cookTimeMinutes: 15, difficulty: 'EASY', estimatedCostCategory: 'LOW', cookingMethod: 'STIR_FRIED', mealTypes: ['LUNCH'], ingredients: [{ foodItemId: tempe.id, servingId: tempe.servings[0].id, quantity: 2 }], steps: [{ instruction: 'Masak sampai matang.' }] } }); expect(saved.statusCode, saved.body).toBe(201); const recipe = saved.json().data; expect(recipe).toMatchObject({ sourceType: 'USER_CREATED', private: true });
    const updated = await app.inject({ method: 'PATCH', url: `/api/v1/profiles/me/recipes/${recipe.id as string}`, headers: owner.headers, payload: { name: 'Tempe pribadi revisi', ingredients: [{ foodItemId: tofu.id, servingId: tofu.servings[0].id, quantity: 2 }] } }); expect(updated.json().data.currentVersion.version).toBe(2);
    expect((await app.inject({ method: 'POST', url: `/api/v1/profiles/me/recipes/${recipe.id as string}/duplicate`, headers: owner.headers })).statusCode).toBe(201);
    const intruder = await completeAccount('intruder'); expect((await app.inject({ method: 'GET', url: `/api/v1/profiles/me/recipes/${recipe.id as string}`, headers: intruder.headers })).statusCode).toBe(404);
    expect((await app.inject({ method: 'POST', url: `/api/v1/profiles/me/recipes/${recipe.id as string}/archive`, headers: owner.headers })).statusCode).toBe(200);
  });

  it('allergen, revoked consent, dan RED safety memblokir planning baru', async () => {
    const allergic = await completeAccount('allergy', { allergy: 'Alergi telur' }); const recipes = await app.inject({ method: 'GET', url: '/api/v1/recipes?pageSize=50', headers: allergic.headers }); const eggRecipes = recipes.json().data.items.filter((recipe: { currentVersion: { ingredients: Array<{ foodName: string }> } }) => recipe.currentVersion.ingredients.some((item) => item.foodName.toLowerCase().includes('telur'))); expect(eggRecipes.length).toBeGreaterThan(0); expect(eggRecipes.every((recipe: { eligibility: { status: string; reasonCodes: string[] } }) => recipe.eligibility.status === 'INELIGIBLE' && recipe.eligibility.reasonCodes.includes('ALLERGEN_MATCH'))).toBe(true);
    await app.inject({ method: 'DELETE', url: '/api/v1/consents/NUTRITION_DATA', headers: allergic.headers }); expect((await app.inject({ method: 'POST', url: '/api/v1/meal-plans/generate', headers: allergic.headers, payload: { localDate: allergic.localDate } })).json().error.code).toBe('CONSENT_REQUIRED');
    const red = await completeAccount('red'); const currentSafety = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers: red.headers })).json().data; const redSession = (await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers: red.headers })).json().data; await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${redSession.id as string}/answers`, headers: red.headers, payload: { answers: (currentSafety.template.questions as Array<{ id: string; code: string }>).map((question) => ({ questionId: question.id, answerCode: question.code === 'professional_restriction' ? 'YES' : 'NO' })) } }); await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${redSession.id as string}/complete`, headers: red.headers }); const denied = await app.inject({ method: 'POST', url: '/api/v1/meal-plans/generate', headers: red.headers, payload: { localDate: red.localDate } }); expect(denied.statusCode).toBe(409); expect(denied.json().error.message).toMatch(/safety|review profesional/i);
  });
});
