import { flowGroups } from '@/mocks/data';
import { prototypeScreens, prototypeScreenMap } from '@/mocks/prototypeScreens';
import { screenPath } from '@/utils/routes';

describe('inventaris Phase 1', () => {
  it('memuat tepat 60 layar prioritas dengan slug unik', () => {
    expect(prototypeScreens).toHaveLength(60);
    expect(new Set(prototypeScreens.map((screen) => screen.slug)).size).toBe(60);
    expect(prototypeScreens.map((screen) => screen.number)).toEqual(Array.from({ length: 60 }, (_, index) => index + 1));
  });

  it('memastikan semua node pada tujuh flow memiliki layar dan route', () => {
    expect(flowGroups).toHaveLength(7);
    for (const flow of flowGroups) {
      for (const slug of flow.steps) {
        expect(prototypeScreenMap.has(slug)).toBe(true);
        expect(screenPath(slug)).toMatch(/^\//);
      }
    }
  });

  it('menandai capability yang bergantung integrasi sebagai simulasi tanpa melabeli fitur real', () => {
    const simulated = ['food-scan', 'motion-coach', 'wearable-connection'];
    for (const slug of simulated) {
      expect(prototypeScreenMap.get(slug)?.simulation).toBe(true);
    }
    for (const slug of ['login', 'registration', 'daily-check-in', 'digestive-support']) {
      expect(prototypeScreenMap.get(slug)?.simulation).not.toBe(true);
    }
  });
});
