import type { FastifyInstance } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FixedClock, addCalendarDays } from '@sarira/baseline';
import { buildApp } from '../src/app';
import { createMemoryRepositories } from '../src/repositories/memory';
import type { DataRepositories } from '../src/contracts';

type Account = { userId: string; profileId: string; headers: { authorization: string }; baselineId: string };

describe('Phase 7 Pattern Map E2E', () => {
  let app: FastifyInstance;
  let clock: FixedClock;
  let repositories: DataRepositories;

  beforeEach(async () => {
    clock = new FixedClock(new Date('2026-08-21T08:00:00.000Z'));
    repositories = createMemoryRepositories();
    app = await buildApp({ env: { APP_ENV: 'test', NODE_ENV: 'test', USE_MOCK_DATA: 'true', LOG_LEVEL: 'silent', RATE_LIMIT_MAX: '10000' }, repositories, clock, logger: false });
    await app.ready();
  });
  afterEach(async () => app.close());

  async function account(label: string): Promise<Account> {
    const registration = await app.inject({ method: 'POST', url: '/api/v1/auth/register', payload: { name: `Phase Seven ${label}`, email: `phase7-${label}-${crypto.randomUUID()}@example.test`, password: 'StrongPassword1' } });
    expect(registration.statusCode).toBe(201);
    const userId = registration.json().data.user.id as string;
    const headers = { authorization: `Bearer ${registration.json().data.accessToken as string}` };
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/role', headers, payload: { role: 'USER' } });
    await app.inject({ method: 'PATCH', url: '/api/v1/profiles/me', headers, payload: { dateOfBirth: '1990-01-01', gender: 'FEMALE', timezone: 'Asia/Makassar' } });
    const profile = (await app.inject({ method: 'GET', url: '/api/v1/profiles/me', headers })).json().data as { id: string };
    const consents = (await app.inject({ method: 'GET', url: '/api/v1/consents/available', headers })).json().data as Array<{ type: string; version: string }>;
    for (const consent of consents.filter((item) => ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'HEALTH_PROFILE', 'NUTRITION_DATA', 'ACTIVITY_DATA', 'SLEEP_DATA'].includes(item.type))) await app.inject({ method: 'PUT', url: `/api/v1/consents/${consent.type}`, headers, payload: { granted: true, version: consent.version, source: 'ONBOARDING' } });
    const safety = (await app.inject({ method: 'GET', url: '/api/v1/safety-screening/current', headers })).json().data;
    const session = (await app.inject({ method: 'POST', url: '/api/v1/safety-screening/sessions', headers })).json().data;
    await app.inject({ method: 'PUT', url: `/api/v1/safety-screening/sessions/${session.id as string}/answers`, headers, payload: { answers: (safety.template.questions as Array<{ id: string }>).map((question) => ({ questionId: question.id, answerCode: 'NO' })) } });
    await app.inject({ method: 'POST', url: `/api/v1/safety-screening/sessions/${session.id as string}/complete`, headers });
    await app.inject({ method: 'PUT', url: '/api/v1/profiles/me/goal', headers, payload: { code: 'MAINTAIN_WEIGHT' } });
    const baseline = await repositories.baseline.create(profile.id, { startedAt: '2026-08-08T00:00:00.000Z', startLocalDate: '2026-08-08', timezone: 'Asia/Makassar', targetDays: 14, extensionAllowed: true, extensionDays: 7, configVersion: 'baseline-phase4-dev-v1' });
    return { userId, profileId: profile.id, headers, baselineId: baseline.id };
  }

  async function fillDay(value: Account, dayIndex: number) {
    const localDate = addCalendarDays('2026-08-08', dayIndex - 1); const stamp = `${localDate}T08:00:00.000Z`;
    await repositories.baseline.putCheckIn(value.profileId, value.baselineId, localDate, dayIndex, { mood: dayIndex % 3 === 0 ? 'LOW' : 'GOOD', hunger: 4, fullness: 4, barriers: [] }, stamp);
    await repositories.baseline.createMeal(value.profileId, value.baselineId, dayIndex, { localDate, mealType: 'BREAKFAST', eatenAt: `${localDate}T07:00:00+08:00`, description: 'Sarapan baseline', skipped: false, sugaryDrinkConsumed: dayIndex % 2 === 0, eatingContext: 'Di rumah' }, stamp);
    await repositories.baseline.createSleep(value.profileId, value.baselineId, dayIndex, { localDate, sleepStartedAt: `${localDate}T00:30:00+08:00`, wokeUpAt: `${localDate}T06:30:00+08:00`, durationMinutes: 360, perceivedQuality: 'FAIR' }, stamp);
    await repositories.baseline.createActivity(value.profileId, value.baselineId, dayIndex, { localDate, activityType: 'WALKING', durationMinutes: 10, perceivedIntensity: 'LIGHT' }, stamp);
  }

  it('menjalankan main path, idempotency, trace, feedback, progress, undo, ownership, dan reanalysis', async () => {
    const owner = await account('owner'); for (let day = 1; day <= 11; day += 1) await fillDay(owner, day);
    const first = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers: owner.headers });
    expect(first.statusCode, first.body).toBe(201); const original = first.json().data;
    expect(original).toMatchObject({ reused: false, patternMap: { version: 1 }, decision: { expertSystemVersion: 'phase7-expert-dev-v1' } }); expect(['READY', 'PARTIAL']).toContain(original.patternMap.status);
    expect(original.patternMap.primaryPattern).toBeDefined(); expect(original.patternMap.supportingPatterns.length).toBeLessThanOrEqual(2); expect(original.weeklyAction).toBeDefined();
    const repeated = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers: owner.headers });
    expect(repeated.statusCode).toBe(200); expect(repeated.json().data).toMatchObject({ reused: true, patternMap: { id: original.patternMap.id }, decision: { id: original.decision.id } });
    expect((await app.inject({ method: 'GET', url: `/api/v1/decisions/${original.decision.id as string}`, headers: owner.headers })).json().data.ruleEvaluations).toHaveLength(13);
    const feedback = await app.inject({ method: 'POST', url: `/api/v1/pattern-maps/${original.patternMap.id as string}/feedback`, headers: owner.headers, payload: { value: 'FAIRLY_ACCURATE' } }); expect(feedback.json().data.feedback.value).toBe('FAIRLY_ACCURATE');
    const checkIn = await app.inject({ method: 'POST', url: `/api/v1/weekly-actions/${original.weeklyAction.id as string}/check-ins`, headers: owner.headers, payload: { localDate: original.weeklyAction.weekStart } }); expect(checkIn.json().data.progress).toBe(1);
    const undo = await app.inject({ method: 'DELETE', url: `/api/v1/weekly-actions/${original.weeklyAction.id as string}/check-ins/${original.weeklyAction.weekStart as string}`, headers: owner.headers }); expect(undo.json().data.progress).toBe(0);
    const intruder = await account('intruder'); expect((await app.inject({ method: 'GET', url: `/api/v1/pattern-maps/${original.patternMap.id as string}`, headers: intruder.headers })).statusCode).toBe(404);
    await fillDay(owner, 12);
    const reanalysis = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers: owner.headers }); expect(reanalysis.statusCode, reanalysis.body).toBe(201); const updated = reanalysis.json().data;
    expect(updated.patternMap.id).not.toBe(original.patternMap.id); expect(updated.patternMap.version).toBe(2); expect(updated.decision.id).not.toBe(original.decision.id);
    expect((await app.inject({ method: 'GET', url: `/api/v1/pattern-maps/${original.patternMap.id as string}`, headers: owner.headers })).json().data.status).toBe('SUPERSEDED');
    expect((await app.inject({ method: 'GET', url: `/api/v1/decisions/${original.decision.id as string}`, headers: owner.headers })).json().data.supersededAt).toBeDefined();
    expect((await app.inject({ method: 'GET', url: '/api/v1/weekly-actions/history', headers: owner.headers })).json().data.length).toBe(2);
  });

  it('abstain pada data minim dan mengabaikan activity setelah consent dicabut', async () => {
    const value = await account('insufficient'); await fillDay(value, 1);
    await app.inject({ method: 'DELETE', url: '/api/v1/consents/ACTIVITY_DATA', headers: value.headers });
    const featureResponse = await app.inject({ method: 'POST', url: '/api/v1/analysis/features/generate', headers: value.headers });
    expect(featureResponse.statusCode, featureResponse.body).toBe(201); const feature = featureResponse.json().data.snapshot;
    expect(feature.features.averageActivityMinutes.value).toBeNull(); expect(feature.features.averageActivityMinutes.evidenceRefs).toEqual([]);
    const analysis = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers: value.headers });
    expect(analysis.statusCode, analysis.body).toBe(201); expect(analysis.json().data.patternMap).toMatchObject({ status: 'INSUFFICIENT_DATA' }); expect(analysis.json().data.patternMap.primaryPattern).toBeUndefined(); expect(analysis.json().data.weeklyAction).toBeUndefined();
  });

  it('menolak Pattern Map sebelum hari ke-14 sehingga Day-7 tetap checkpoint', async () => {
    clock.set(new Date('2026-08-14T08:00:00.000Z')); const value = await account('day7'); for (let day = 1; day <= 7; day += 1) await fillDay(value, day);
    const response = await app.inject({ method: 'POST', url: '/api/v1/pattern-maps/generate', headers: value.headers });
    expect(response.statusCode).toBe(409); expect(response.json().error.code).toBe('BASELINE_NOT_READY');
  });
});
