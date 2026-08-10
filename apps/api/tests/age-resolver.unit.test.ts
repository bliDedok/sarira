import { describe, expect, it } from 'vitest';
import { classifyAgeValue, resolveAgeContext } from '@sarira/expert-system';
import { declaredAgeSchema } from '@sarira/validation';

describe('Phase 7.5A age resolver', () => {
  const now = new Date('2026-08-10T00:00:00.000Z');

  it.each([
    [12, 'TEEN'], [17, 'TEEN'],
    [18, 'YOUNG_ADULT'], [25, 'YOUNG_ADULT'],
    [26, 'ADULT_BALANCE'], [59, 'ADULT_BALANCE'],
    [60, 'HEALTHY_AGING'], [75, 'HEALTHY_AGING'],
  ] as const)('memetakan batas usia %s ke %s', (age, group) => {
    expect(classifyAgeValue(age)).toBe(group);
  });

  it('memprioritaskan usia yang dikonfirmasi tanpa membuat atau membaca DOB sintetis', () => {
    expect(resolveAgeContext({ declaredAge: 30, ageRecordedAt: '2026-08-09T00:00:00.000Z', dateOfBirth: '2011-01-01' }, now)).toMatchObject({
      age: 30,
      ageGroup: 'ADULT_BALANCE',
      source: 'DECLARED',
      requiresReconfirmation: false,
    });
  });

  it('mempertahankan usia deklaratif dan hanya menandai konfirmasi ulang setelah satu tahun', () => {
    expect(resolveAgeContext({ declaredAge: 17, ageRecordedAt: '2025-08-10T00:00:00.000Z' }, now)).toMatchObject({
      age: 17,
      ageGroup: 'TEEN',
      source: 'DECLARED',
      requiresReconfirmation: true,
    });
  });

  it('menggunakan DOB lama sebagai fallback yang kompatibel', () => {
    expect(resolveAgeContext({ dateOfBirth: '1996-08-10' }, now)).toEqual({
      age: 30,
      ageGroup: 'ADULT_BALANCE',
      source: 'LEGACY_DOB',
      requiresReconfirmation: false,
    });
  });

  it('menolak usia di luar 12–75 dan pencatatan yang tidak berpasangan', () => {
    expect(declaredAgeSchema.safeParse(11).success).toBe(false);
    expect(declaredAgeSchema.safeParse(76).success).toBe(false);
    expect(() => resolveAgeContext({ declaredAge: 30 }, now)).toThrow(/Waktu pencatatan/);
  });
});
