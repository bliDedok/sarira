import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

type Headers = { authorization: string };

describe('Phase 3 critical onboarding scenarios', () => {
  let app: FastifyInstance;
  beforeEach(async () => { app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent' }, logger: false }); await app.ready(); });
  afterEach(async () => app.close());

  async function register(label: string) {
    const email = `${label}-${crypto.randomUUID()}@example.test`;
    const password = 'StrongPassword1';
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: `User ${label}`, email, password } });
    expect(response.statusCode).toBe(201);
    return { email, password, headers: { authorization: `Bearer ${response.json().data.accessToken as string}` } };
  }

  async function profile(headers: Headers, dateOfBirth: string, role = 'USER') {
    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role } })).statusCode).toBe(200);
    return (await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth } })).json().data;
  }

  async function grantRequired(headers: Headers) {
    const definitions = (await app.inject({ method: 'GET', url: '/api/v1/consents/required', headers })).json().data as Array<{ type: string; version: string }>;
    for (const definition of definitions) expect((await app.inject({ method: 'PUT', url: `/api/v1/consents/${definition.type}`, headers, payload: { granted: true, version: definition.version, source: 'ONBOARDING' } })).statusCode).toBe(200);
    return definitions;
  }

  async function safety(headers: Headers, red = false) {
    const current = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const created = await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers });
    expect(created.statusCode).toBe(201);
    const sessionId = created.json().data.id as string;
    const answers = (current.template.questions as Array<{ id: string; code: string }>).map((question) => ({ questionId: question.id, answerCode: red && question.code === 'professional_restriction' ? 'YES' : 'NO' }));
    expect((await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${sessionId}/answers`, headers, payload: { answers } })).statusCode).toBe(200);
    const result = await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${sessionId}/complete`, headers });
    expect(result.statusCode).toBe(200);
    return result.json().data;
  }

  async function selectGoal(headers: Headers, code: string) {
    const available = (await app.inject({ method: 'GET', url: '/api/v1/goals/available', headers })).json().data as Array<{ code: string; eligible: boolean; priority: boolean }>;
    expect(available.find((goal) => goal.code === code)?.eligible).toBe(true);
    expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code } })).statusCode).toBe(200);
    return available;
  }

  function valueFor(question: { valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }) {
    if (question.valueType === 'NUMBER') return Math.max(question.validation?.minimum ?? 1, question.validation?.minimum === 80 ? 170 : question.validation?.minimum === 20 ? 65 : 2);
    if (question.valueType === 'BOOLEAN') return false;
    if (question.valueType === 'TIME') return '22:00';
    if (question.valueType === 'SINGLE_SELECT') return question.options[0]?.code ?? 'OTHER';
    if (question.valueType === 'MULTI_SELECT') return [question.options[0]?.code ?? 'OTHER'];
    return 'Jawaban development';
  }

  async function questionnaire(headers: Headers) {
    const data = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers })).json().data;
    const created = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${data.template.id as string}/sessions`, headers });
    expect(created.statusCode).toBe(201);
    const sessionId = created.json().data.id as string;
    const answers = (data.template.questions as Array<{ id: string; valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }>).map((question) => ({ questionId: question.id, value: valueFor(question) }));
    expect((await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${sessionId}/answers`, headers, payload: { answers } })).statusCode).toBe(200);
    const completed = await app.inject({ method: 'POST', url: `/api/v1/questionnaire-sessions/${sessionId}/complete`, headers });
    expect(completed.statusCode).toBe(200);
    return { sessionId, data };
  }

  async function program(headers: Headers) {
    const data = (await app.inject({ method: 'GET', url: '/api/v1/program-preferences', headers })).json().data;
    const eligible = (data.options as Array<{ code: string; eligible: boolean }>).find((item) => item.eligible);
    if (eligible) expect((await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/program-preference', headers, payload: { program: eligible.code } })).statusCode).toBe(200);
    else expect((await app.inject({ method: 'POST', url: '/api/v1/profiles/me/program-preference/skip', headers })).statusCode).toBe(200);
    return data;
  }

  async function completeStandard(headers: Headers, dateOfBirth: string, goal: string, red = false) {
    await profile(headers, dateOfBirth);
    await grantRequired(headers);
    const safetyResult = await safety(headers, red);
    await selectGoal(headers, goal);
    await questionnaire(headers);
    await program(headers);
    const summary = await app.inject({ method: 'GET', url: '/api/v1/onboarding/summary', headers });
    expect(summary.json().data.completionIssues).toEqual([]);
    const completed = await app.inject({ method: 'POST', url: '/api/v1/onboarding/complete', headers });
    expect(completed.statusCode).toBe(200);
    return { safetyResult, summary: summary.json().data, completed: completed.json().data };
  }

  it('SCENARIO A — dewasa 30, GREEN, maintain weight, selesai', async () => {
    const account = await register('adult-green');
    const result = await completeStandard(account.headers, '1996-01-01', 'MAINTAIN_WEIGHT');
    expect(result.safetyResult.status).toBe('GREEN');
    expect(result.completed.starterContext).toMatchObject({ ageGroup: 'ADULT_BALANCE', selectedGoal: 'MAINTAIN_WEIGHT', simulatedJourney: false });
  });

  it('SCENARIO B — remaja tanpa guardian consent diblokir', async () => {
    const account = await register('teen-blocked');
    expect((await profile(account.headers, '2011-01-01')).ageGroup).toBe('TEEN');
    await grantRequired(account.headers);
    const blocked = await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers: account.headers });
    expect(blocked.statusCode).toBe(409);
    expect(blocked.json().error.message).toMatch(/Guardian consent/);
  });

  it('SCENARIO C — remaja dengan guardian consent mendapat Growth Path', async () => {
    const account = await register('teen-growth');
    await profile(account.headers, '2011-01-01');
    expect((await app.inject({ method: 'POST', url: '/api/v1/guardian-consent', headers: account.headers, payload: { guardianName: 'Wali Test', guardianRelationship: 'PARENT', consentVersion: 'guardian-phase3-dev-v1', confirmed: true } })).statusCode).toBe(201);
    await grantRequired(account.headers);
    await safety(account.headers);
    const goals = await selectGoal(account.headers, 'OPTIMIZE_GROWTH');
    expect(goals.find((goal) => goal.code === 'OPTIMIZE_GROWTH')?.priority).toBe(true);
  });

  it('SCENARIO D — usia 65 mendapat prioritas Healthy Aging', async () => {
    const account = await register('healthy-aging');
    await profile(account.headers, '1961-01-01');
    await grantRequired(account.headers); await safety(account.headers);
    const goals = (await app.inject({ method: 'GET', url: '/api/v1/goals/available', headers: account.headers })).json().data as Array<{ code: string; eligible: boolean; priority: boolean }>;
    expect(goals.find((goal) => goal.code === 'MAINTAIN_MOBILITY')).toMatchObject({ eligible: true, priority: true });
  });

  it('SCENARIO E — RED membatasi program dan menampilkan referral payload', async () => {
    const account = await register('red-route');
    await profile(account.headers, '1996-01-01'); await grantRequired(account.headers);
    const result = await safety(account.headers, true);
    expect(result).toMatchObject({ status: 'RED', referralRequired: true });
    expect(result.restrictedPrograms).toContain('GUIDED_MEAL');
    const goals = (await app.inject({ method: 'GET', url: '/api/v1/goals/available', headers: account.headers })).json().data as Array<{ code: string; eligible: boolean }>;
    expect(goals.find((goal) => goal.code === 'MAINTAIN_WEIGHT')?.eligible).toBe(false);
  });

  it('SCENARIO F — menarik required consent mengembalikan state ke consent', async () => {
    const account = await register('consent-revoke');
    await completeStandard(account.headers, '1996-01-01', 'MAINTAIN_WEIGHT');
    expect((await app.inject({ method: 'DELETE', url: '/api/v1/consents/PRIVACY_POLICY', headers: account.headers })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: account.headers })).json().data).toMatchObject({ onboardingCompleted: false, currentStep: 'privacy-consent' });
  });

  it('SCENARIO G — logout/login di tengah questionnaire melanjutkan session dan jawaban', async () => {
    const account = await register('resume');
    await profile(account.headers, '1996-01-01'); await grantRequired(account.headers); await safety(account.headers); await selectGoal(account.headers, 'MAINTAIN_WEIGHT');
    const data = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers: account.headers })).json().data;
    const created = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${data.template.id as string}/sessions`, headers: account.headers });
    const sessionId = created.json().data.id as string;
    const question = data.template.questions[0] as { id: string };
    await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${sessionId}/answers`, headers: account.headers, payload: { answers: [{ questionId: question.id, value: 170 }] } });
    await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: account.headers });
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: account.email, password: account.password } });
    const resumedHeaders = { authorization: `Bearer ${login.json().data.accessToken as string}` };
    expect(login.json().data.user.currentStep).toBe('profile-questionnaire');
    const resumed = await app.inject({ method: 'GET', url: `/api/v1/questionnaire-sessions/${sessionId}`, headers: resumedHeaders });
    expect(resumed.json().data.answers[0].value).toBe(170);
  });

  it('SCENARIO H — kegagalan autosave tidak menghapus jawaban dan retry berhasil', async () => {
    const account = await register('autosave-retry');
    await profile(account.headers, '1996-01-01'); await grantRequired(account.headers); await safety(account.headers); await selectGoal(account.headers, 'MAINTAIN_WEIGHT');
    const data = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers: account.headers })).json().data;
    const created = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${data.template.id as string}/sessions`, headers: account.headers });
    const sessionId = created.json().data.id as string;
    const question = data.template.questions[0] as { id: string };
    expect((await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${sessionId}/answers`, headers: account.headers, payload: { answers: [{ questionId: question.id, value: 170 }] } })).statusCode).toBe(200);
    const failed = await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${sessionId}/answers`, headers: account.headers, payload: { answers: [{ questionId: '99999999-9999-4999-8999-999999999999', value: 180 }] } });
    expect(failed.statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: `/api/v1/questionnaire-sessions/${sessionId}`, headers: account.headers })).json().data.answers[0].value).toBe(170);
    expect((await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${sessionId}/answers`, headers: account.headers, payload: { answers: [{ questionId: question.id, value: 171 }] } })).json().data.answers[0].value).toBe(171);
  });

  it('SCENARIO I — profil baru memakai declared age tanpa DOB sintetis', async () => {
    const account = await register('declared-adult');
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers: account.headers, payload: { role: 'USER' } });
    const response = await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers: account.headers, payload: { declaredAge: 30 } });
    expect(response.statusCode, response.body).toBe(200);
    expect(response.json().data).toMatchObject({ declaredAge: 30, age: 30, ageGroup: 'ADULT_BALANCE', ageSource: 'DECLARED', ageRequiresReconfirmation: false });
    expect(response.json().data.dateOfBirth).toBeUndefined();
    expect(response.json().data.ageRecordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: account.headers })).json().data.currentStep).toBe('privacy-consent');
  });

  it('SCENARIO J — declared age remaja tetap memerlukan guardian dan bounds fail closed', async () => {
    const account = await register('declared-teen');
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers: account.headers, payload: { role: 'USER' } });
    const teen = await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers: account.headers, payload: { declaredAge: 17 } });
    expect(teen.json().data).toMatchObject({ age: 17, ageGroup: 'TEEN', ageSource: 'DECLARED' });
    expect((await app.inject({ method: 'GET', url: '/api/v1/me', headers: account.headers })).json().data.currentStep).toBe('guardian-consent');
    await grantRequired(account.headers);
    expect((await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers: account.headers })).statusCode).toBe(409);
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers: account.headers, payload: { declaredAge: 11 } })).statusCode).toBe(400);
    expect((await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers: account.headers, payload: { declaredAge: 76 } })).statusCode).toBe(400);
  });
});
