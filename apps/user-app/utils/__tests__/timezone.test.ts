import { isoToLocalTime, localDateTimeToIso } from '@/utils/timezone';

describe('timezone input baseline', () => {
  it.each([
    ['Asia/Makassar', '2026-08-08', '07:15', '2026-08-07T23:15:00.000Z'],
    ['Asia/Jakarta', '2026-08-08', '07:15', '2026-08-08T00:15:00.000Z'],
    ['UTC', '2026-08-08', '07:15', '2026-08-08T07:15:00.000Z'],
  ])('mengubah waktu lokal %s menjadi instant UTC', (timezone, localDate, time, expected) => {
    expect(localDateTimeToIso(localDate, time, timezone)).toBe(expected);
    expect(isoToLocalTime(expected, timezone)).toBe(time);
  });

  it('menolak format dan waktu di luar rentang', () => {
    expect(() => localDateTimeToIso('2026-08-08', '7:15', 'Asia/Makassar')).toThrow('HH:mm');
    expect(() => localDateTimeToIso('2026-08-08', '25:00', 'Asia/Makassar')).toThrow('tidak valid');
  });
});
