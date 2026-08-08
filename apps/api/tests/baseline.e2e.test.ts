import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FixedClock } from '@sarira/baseline';
import { buildApp } from '../src/app';

type Account = { email: string; password: string; headers: { authorization: string } };

describe('Phase 4 E2E scenarios A–J', () => {
  let app: FastifyInstance;
  let clock: FixedClock;

  beforeEach(async () => {
    clock = new FixedClock(new Date('2026-08-08T08:00:00.000Z'));
    app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent' }, clock, logger: false });
    await app.ready();
  });
  afterEach(async () => app.close());

  async function register(label: string): Promise<Account> {
    const email = `${label}-${crypto.randomUUID()}@example.test`;
    const password = 'StrongPassword1';
    const response = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: `User ${label}`, email, password } });
    expect(response.statusCode).toBe(201);
    return { email, password, headers: { authorization: `Bearer ${response.json().data.accessToken as string}` } };
  }

  async function completeOnboarding(label: string): Promise<Account> {
    const account = await register(label);
    const { headers } = account;
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } });
    await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth: '1996-01-01', timezone: 'Asia/Makassar' } });
    const consents = (await app.inject({ method: 'GET', url: '/api/v1/consents/available', headers })).json().data as Array<{ type: string; version: string }>;
    for (const consent of consents.filter((item) => ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'HEALTH_PROFILE', 'NUTRITION_DATA', 'SLEEP_DATA', 'ACTIVITY_DATA'].includes(item.type))) {
      await app.inject({ method: 'PUT', url: `/api/v1/consents/${consent.type}`, headers, payload: { granted: true, version: consent.version, source: 'ONBOARDING' } });
    }
    const current = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const safetySession = await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers });
    const safetyId = safetySession.json().data.id as string;
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${safetyId}/answers`, headers, payload: { answers: (current.template.questions as Array<{ id: string }>).map((question) => ({ questionId: question.id, answerCode: 'NO' })) } });
    await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${safetyId}/complete`, headers });
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code: 'MAINTAIN_WEIGHT' } });
    const questionnaire = (await app.inject({ method: 'GET', url: '/api/v1/questionnaires/onboarding', headers })).json().data;
    const questionnaireSession = await app.inject({ method: 'POST', url: `/api/v1/questionnaires/${questionnaire.template.id as string}/sessions`, headers });
    const questionnaireId = questionnaireSession.json().data.id as string;
    const answers = (questionnaire.template.questions as Array<{ id: string; valueType: string; validation?: { minimum?: number }; options: Array<{ code: string }> }>).map((question) => ({
      questionId: question.id,
      value: question.valueType === 'NUMBER' ? Math.max(question.validation?.minimum ?? 1, question.validation?.minimum === 80 ? 170 : question.validation?.minimum === 20 ? 65 : 2) : question.valueType === 'BOOLEAN' ? false : question.valueType === 'TIME' ? '22:00' : question.valueType === 'SINGLE_SELECT' ? question.options[0]?.code : question.valueType === 'MULTI_SELECT' ? [question.options[0]?.code] : 'Jawaban Phase 4',
    }));
    await app.inject({ method: 'PUT', url: `/api/v1/questionnaire-sessions/${questionnaireId}/answers`, headers, payload: { answers } });
    await app.inject({ method: 'POST', url: `/api/v1/questionnaire-sessions/${questionnaireId}/complete`, headers });
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/program-preference', headers, payload: { program: 'GUIDED_MEAL' } });
    expect((await app.inject({ method: 'POST', url: '/api/v1/onboarding/complete', headers })).statusCode).toBe(200);
    return account;
  }

  async function start(account: Account) {
    const response = await app.inject({ method: 'POST', url: '/api/v1/baseline', headers: account.headers });
    expect([200, 201]).toContain(response.statusCode);
    return response.json().data as { id: string; startLocalDate: string };
  }

  async function fillDay(account: Account, localDate: string) {
    const checkIn = await app.inject({ method: 'PUT', url: `/api/v1/daily-checkins/${localDate}`, headers: account.headers, payload: { mood: 'GOOD', hunger: 3, fullness: 4, energy: 4, barriers: [] } });
    expect(checkIn.statusCode).toBe(200);
    expect((await app.inject({ method: 'POST', url: '/api/v1/meal-logs', headers: account.headers, payload: { localDate, mealType: 'BREAKFAST', eatenAt: `${localDate}T07:00:00+08:00`, description: 'Sarapan rumahan', skipped: false } })).statusCode).toBe(201);
    expect((await app.inject({ method: 'POST', url: '/api/v1/sleep-logs', headers: account.headers, payload: { localDate, sleepStartedAt: `${localDate}T00:00:00+08:00`, wokeUpAt: `${localDate}T07:00:00+08:00`, perceivedQuality: 'GOOD' } })).statusCode).toBe(201);
    expect((await app.inject({ method: 'POST', url: '/api/v1/activity-logs', headers: account.headers, payload: { localDate, activityType: 'WALKING', durationMinutes: 20, perceivedIntensity: 'LIGHT' } })).statusCode).toBe(201);
  }

  it('SCENARIO A — Day 1 lengkap menghasilkan completeness real', async () => {
    const account = await completeOnboarding('day1'); const baseline = await start(account); await fillDay(account, baseline.startLocalDate);
    const current = await app.inject({ method: 'GET', url: '/api/v1/baseline/current', headers: account.headers });
    expect(current.json().data.completeness).toMatchObject({ status: 'COMPLETE', score: 100, completedDays: 1 });
    expect(current.json().data.tasks.every((task: { status: string }) => task.status === 'COMPLETED')).toBe(true);
  });

  it('SCENARIO B — check-in saja tetap PARTIAL dan menjelaskan yang kosong', async () => {
    const account = await completeOnboarding('partial'); const baseline = await start(account);
    await app.inject({ method: 'PUT', url: `/api/v1/daily-checkins/${baseline.startLocalDate}`, headers: account.headers, payload: { mood: 'NEUTRAL', hunger: 3, fullness: 3, barriers: ['BUSY'] } });
    const value = (await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/completeness/${baseline.startLocalDate}`, headers: account.headers })).json().data;
    expect(value).toMatchObject({ status: 'PARTIAL', score: 25, missingDomains: ['food', 'sleep', 'activity'] });
  });

  it('SCENARIO C — logout/login melanjutkan baseline yang sama', async () => {
    const account = await completeOnboarding('resume'); const baseline = await start(account);
    await app.inject({ method: 'POST', url: '/api/v1/auth/logout', headers: account.headers });
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email: account.email, password: account.password } });
    const headers = { authorization: `Bearer ${login.json().data.accessToken as string}` };
    expect((await app.inject({ method: 'GET', url: '/api/v1/baseline/current', headers })).json().data.baseline.id).toBe(baseline.id);
  });

  it('SCENARIO D — Day 7 membuka checkpoint deskriptif dan feedback', async () => {
    const account = await completeOnboarding('day7'); const baseline = await start(account); clock.set(new Date('2026-08-14T08:00:00.000Z'));
    const checkpoint = await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/day-7-checkpoint`, headers: account.headers });
    expect(checkpoint.statusCode).toBe(200); expect(checkpoint.json().data.disclaimer).toMatch(/bukan diagnosis/i);
    const feedback = await app.inject({ method: 'POST', url: `/api/v1/baseline/${baseline.id}/day-7-feedback`, headers: account.headers, payload: { easeRating: 4, hardestDomains: ['activity'], wantsToContinue: true } });
    expect(feedback.json().data).toMatchObject({ easeRating: 4, wantsToContinue: true });
  });

  it('SCENARIO E — Day 14 dengan 11 hari lengkap menjadi READY tanpa Pattern Map', async () => {
    const account = await completeOnboarding('ready'); const baseline = await start(account); clock.set(new Date('2026-08-21T08:00:00.000Z'));
    for (let day = 8; day <= 18; day += 1) await fillDay(account, `2026-08-${String(day).padStart(2, '0')}`);
    const readiness = await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/readiness`, headers: account.headers });
    expect(readiness.json().data).toMatchObject({ status: 'READY', totalDays: 14, completedDays: 11 });
    expect(JSON.stringify(readiness.json().data)).not.toMatch(/patternMap/i);
  });

  it('SCENARIO F — Day 14 dengan data minim menjadi INSUFFICIENT_DATA', async () => {
    const account = await completeOnboarding('insufficient'); const baseline = await start(account); clock.set(new Date('2026-08-21T08:00:00.000Z'));
    await app.inject({ method: 'PUT', url: '/api/v1/daily-checkins/2026-08-08', headers: account.headers, payload: { mood: 'GOOD', hunger: 3, fullness: 3, barriers: [] } });
    const readiness = await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}/readiness`, headers: account.headers });
    expect(readiness.json().data).toMatchObject({ status: 'INSUFFICIENT_DATA' });
    expect(readiness.json().data.recommendation).toMatch(/melanjutkan pencatatan/i);
  });

  it('SCENARIO G — batas tengah malam Asia/Makassar mengubah Day 1 ke Day 2', async () => {
    clock.set(new Date('2026-08-08T15:59:00.000Z')); const account = await completeOnboarding('timezone'); const baseline = await start(account); expect(baseline.startLocalDate).toBe('2026-08-08');
    clock.set(new Date('2026-08-08T16:01:00.000Z')); const current = await app.inject({ method: 'GET', url: '/api/v1/baseline/current', headers: account.headers }); expect(current.json().data.baseline.currentDay).toBe(2);
  });

  it('SCENARIO H — user lain mendapat forbidden pada baseline bukan miliknya', async () => {
    const owner = await completeOnboarding('owner'); const baseline = await start(owner); const intruder = await completeOnboarding('intruder');
    expect((await app.inject({ method: 'GET', url: `/api/v1/baseline/${baseline.id}`, headers: intruder.headers })).statusCode).toBe(403);
  });

  it('SCENARIO I — consent activity dicabut lalu log baru ditolak', async () => {
    const account = await completeOnboarding('revoked'); const baseline = await start(account);
    await app.inject({ method: 'DELETE', url: '/api/v1/consents/ACTIVITY_DATA', headers: account.headers });
    const denied = await app.inject({ method: 'POST', url: '/api/v1/activity-logs', headers: account.headers, payload: { localDate: baseline.startLocalDate, activityType: 'WALKING', durationMinutes: 20, perceivedIntensity: 'LIGHT' } });
    expect(denied.statusCode).toBe(409); expect(denied.json().error.message).toMatch(/Consent ACTIVITY_DATA/);
  });

  it('SCENARIO J — tidur 23:30–06:30 disimpan sebagai 420 menit', async () => {
    const account = await completeOnboarding('sleep'); const baseline = await start(account);
    const response = await app.inject({ method: 'POST', url: '/api/v1/sleep-logs', headers: account.headers, payload: { localDate: baseline.startLocalDate, sleepStartedAt: '2026-08-08T23:30:00+08:00', wokeUpAt: '2026-08-09T06:30:00+08:00', perceivedQuality: 'GOOD' } });
    expect(response.json().data).toMatchObject({ durationMinutes: 420, source: 'MANUAL' });
  });
});
