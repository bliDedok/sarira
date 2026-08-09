import { describe, expect, it } from 'vitest';
import { analysisFeatureKeys, patternDomains, type AnalysisFeatureSet } from '@sarira/shared-types';
import { evaluatePhase7, PHASE_7_EXPERT_SYSTEM_VERSION, PHASE_7_VALIDATION_LABEL, phase7RuleDefinitions, phase7WeeklyActions } from '@sarira/expert-system';

const features = (coverage = 1): AnalysisFeatureSet => Object.fromEntries(analysisFeatureKeys.map((key) => [key, { value: 0.8, availability: coverage < 0.3 ? 'INSUFFICIENT_DATA' : 'AVAILABLE', coverage: { availableDays: Math.round(14 * coverage), totalDays: 14, ratio: coverage }, source: ['test'], evidenceRefs: [`Test:${key}`] }])) as AnalysisFeatureSet;
const allSignals = () => {
  const value = features();
  Object.assign(value, {
    energyRangeFrequency: { ...value.energyRangeFrequency, value: 0.2 }, fullnessAverage: { ...value.fullnessAverage, value: 4.5 }, sugaryDrinkDays: { ...value.sugaryDrinkDays, value: 0.5 }, sugarUpperLimitFrequency: { ...value.sugarUpperLimitFrequency, value: 0.5 },
    averageSleepDuration: { ...value.averageSleepDuration, value: 6 }, sleepTimingVariance: { ...value.sleepTimingVariance, value: 0.3 }, activeDays: { ...value.activeDays, value: 0.2 }, averageActivityMinutes: { ...value.averageActivityMinutes, value: 10 },
    lowMoodMealAssociationDays: { ...value.lowMoodMealAssociationDays, value: 0.4 }, hungerAverage: { ...value.hungerAverage, value: 4.5 }, breakfastFrequency: { ...value.breakfastFrequency, value: 0.3 }, proteinTargetCoverage: { ...value.proteinTargetCoverage, value: 0.2 }, mealRegularity: { ...value.mealRegularity, value: 0.4 },
  });
  return value;
};

describe('Phase 7 deterministic Expert System', () => {
  it('mencakup enam domain, memilih maksimal 1 primary + 2 supporting + 1 action', () => {
    const input = { features: allSignals(), baselineReady: true, ageGroup: 'YOUNG_ADULT' as const, safetyStatus: 'GREEN' as const, goal: 'MAINTAIN_WEIGHT' as const, previousActionCodes: [] };
    const first = evaluatePhase7(input); const second = evaluatePhase7(input);
    expect(first).toEqual(second);
    expect(first.expertSystemVersion).toBe(PHASE_7_EXPERT_SYSTEM_VERSION);
    expect(new Set(first.domainScores.map((item) => item.domain))).toEqual(new Set(patternDomains));
    expect(first.primaryPattern).toBeDefined(); expect(first.supportingPatterns.length).toBeLessThanOrEqual(2); expect(first.selectedAction).toBeDefined();
    expect(first.ruleEvaluations.every((item) => item.observedValues && item.reasonCodes.length > 0 && item.evidenceRefs.length > 0)).toBe(true);
    expect(phase7RuleDefinitions.every((item) => item.requiresExpertValidation)).toBe(true);
    expect(phase7WeeklyActions.every((item) => item.requiresExpertValidation)).toBe(true);
    expect(PHASE_7_VALIDATION_LABEL).toMatch(/NOT CLINICALLY VALIDATED/);
  });

  it('abstain saat evidence domain tidak cukup', () => {
    const output = evaluatePhase7({ features: features(0.1), baselineReady: false, ageGroup: 'ADULT_BALANCE', safetyStatus: 'GREEN', goal: 'IMPROVE_FITNESS', previousActionCodes: [] });
    expect(output.status).toBe('INSUFFICIENT_DATA'); expect(output.primaryPattern).toBeUndefined(); expect(output.selectedAction).toBeUndefined();
    expect(output.domainScores.every((item) => item.availability === 'INSUFFICIENT_DATA' && item.score === null)).toBe(true);
  });

  it('safety RED mengecualikan sinyal aktivitas dan goal tidak mengubah observed domain score', () => {
    const activityOnly = features();
    Object.assign(activityOnly, { activeDays: { ...activityOnly.activeDays, value: 0.1 }, averageActivityMinutes: { ...activityOnly.averageActivityMinutes, value: 5 } });
    const red = evaluatePhase7({ features: activityOnly, baselineReady: true, ageGroup: 'HEALTHY_AGING', safetyStatus: 'RED', goal: 'IMPROVE_FITNESS', previousActionCodes: [] });
    expect(red.ruleEvaluations.filter((item) => item.domain === 'ACTIVITY_SEDENTARY').every((item) => !item.matched && item.reasonCodes.includes('SAFETY_EXCLUSION'))).toBe(true);
    const maintain = evaluatePhase7({ features: allSignals(), baselineReady: true, ageGroup: 'YOUNG_ADULT', safetyStatus: 'GREEN', goal: 'MAINTAIN_WEIGHT', previousActionCodes: [] });
    const fitness = evaluatePhase7({ features: allSignals(), baselineReady: true, ageGroup: 'YOUNG_ADULT', safetyStatus: 'GREEN', goal: 'IMPROVE_FITNESS', previousActionCodes: [] });
    expect(maintain.domainScores).toEqual(fitness.domainScores);
  });
});
