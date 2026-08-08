import { describe, expect, it } from 'vitest';
import {
  BASELINE_CONFIG,
  calculateSleepDuration,
  calendarDayIndex,
  day14Available,
  day7Available,
  evaluateDailyCompleteness,
  evaluateOverallCompleteness,
  evaluateReadiness,
  localDateAt,
} from '@sarira/baseline';
import { createMemoryBaselineRepository } from '../src/repositories/phase4-memory';

describe('Phase 4 baseline domain', () => {
  it('menggunakan batas tanggal kalender per timezone, bukan timezone server', () => {
    const before = new Date('2026-08-08T15:59:00.000Z');
    const after = new Date('2026-08-08T16:01:00.000Z');
    expect(localDateAt(before, 'Asia/Makassar')).toBe('2026-08-08');
    expect(localDateAt(after, 'Asia/Makassar')).toBe('2026-08-09');
    expect(localDateAt(after, 'Asia/Jakarta')).toBe('2026-08-08');
    expect(localDateAt(after, 'UTC')).toBe('2026-08-08');
  });

  it('menghitung day index dan mempertahankan missed day', () => {
    expect(calendarDayIndex('2026-08-08', '2026-08-08')).toBe(1);
    expect(calendarDayIndex('2026-08-08', '2026-08-09')).toBe(2);
    expect(calendarDayIndex('2026-08-08', '2026-08-14')).toBe(7);
    expect(calendarDayIndex('2026-08-08', '2026-08-21')).toBe(14);
    expect(evaluateOverallCompleteness([{ checkIn: 1, food: 1, sleep: 1, activity: 1 }], 3).elapsedDays).toBe(3);
  });

  it('menghitung daily dan overall completeness sebagai ketersediaan data', () => {
    expect(evaluateDailyCompleteness({ checkIn: 1, food: 0, sleep: 0, activity: 0 })).toMatchObject({ status: 'PARTIAL', score: 25 });
    expect(evaluateDailyCompleteness({ checkIn: 1, food: 1, sleep: 1, activity: 1 })).toMatchObject({ status: 'COMPLETE', score: 100 });
    const complete = Array.from({ length: 11 }, () => ({ checkIn: 1, food: 1, sleep: 1, activity: 1 }));
    const overall = evaluateOverallCompleteness(complete, 14);
    expect(overall).toMatchObject({ score: 79, completedDays: 11, validationStatus: 'REQUIRES_PRODUCT_EXPERT_VALIDATION' });
    expect(evaluateReadiness(overall, 14, crypto.randomUUID())?.status).toBe('READY');
  });

  it('membedakan readiness READY, PARTIALLY_READY, dan INSUFFICIENT_DATA', () => {
    const ready = evaluateOverallCompleteness(Array.from({ length: 11 }, () => ({ checkIn: 1, food: 1, sleep: 1, activity: 1 })), 14);
    const partial = evaluateOverallCompleteness(Array.from({ length: 8 }, () => ({ checkIn: 1, food: 1, sleep: 1, activity: 1 })), 14);
    const low = evaluateOverallCompleteness([{ checkIn: 1, food: 0, sleep: 0, activity: 0 }], 14);
    expect(evaluateReadiness(ready, 14, 'ready')?.status).toBe('READY');
    expect(evaluateReadiness(partial, 14, 'partial')?.status).toBe('PARTIALLY_READY');
    expect(evaluateReadiness(low, 14, 'low')?.status).toBe('INSUFFICIENT_DATA');
    expect(evaluateReadiness(ready, 13, 'early')).toBeNull();
  });

  it('mengaktifkan checkpoint dan readiness pada hari yang tepat', () => {
    expect(day7Available(6)).toBe(false);
    expect(day7Available(7)).toBe(true);
    expect(day14Available(13)).toBe(false);
    expect(day14Available(BASELINE_CONFIG.targetDays)).toBe(true);
  });

  it('menghitung tidur lintas tengah malam dari timestamp backend', () => {
    expect(calculateSleepDuration('2026-08-08T23:30:00+08:00', '2026-08-09T06:30:00+08:00')).toBe(420);
    expect(() => calculateSleepDuration('2026-08-09T06:30:00+08:00', '2026-08-08T23:30:00+08:00')).toThrow();
  });

  it('mencegah dua baseline aktif dan mengubah task dari data real', async () => {
    const repository = createMemoryBaselineRepository();
    const profileId = crypto.randomUUID();
    const input = { startedAt: '2026-08-08T00:00:00.000Z', startLocalDate: '2026-08-08', timezone: 'Asia/Makassar', targetDays: 14, extensionAllowed: true, extensionDays: 7, configVersion: 'phase4-dev-v1' };
    const baseline = await repository.create(profileId, input);
    await expect(repository.create(profileId, input)).rejects.toThrow(/baseline aktif/i);
    await repository.putCheckIn(profileId, baseline.id, '2026-08-08', 1, { mood: 'GOOD', hunger: 3, fullness: 3, barriers: [] }, input.startedAt);
    const tasks = await repository.getTasks(profileId, baseline.id, '2026-08-08', 1, input.startedAt);
    expect(tasks.find((task) => task.definitionCode === 'checkIn')).toMatchObject({ status: 'COMPLETED', progress: 1 });
    expect(tasks.find((task) => task.definitionCode === 'food')).toMatchObject({ status: 'PENDING', progress: 0 });
  });
});
