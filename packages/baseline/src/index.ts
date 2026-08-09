import type {
  BaselineDomain,
  BaselineReadinessRecord,
  CompletenessRecord,
  DailyCompletenessStatus,
} from '@sarira/shared-types';

export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now() { return new Date(); }
}

export class FixedClock implements Clock {
  constructor(private current: Date) {}
  now() { return new Date(this.current); }
  set(value: Date) { this.current = new Date(value); }
}

export const BASELINE_CONFIG = {
  version: 'phase4-dev-v1',
  validationStatus: 'REQUIRES_PRODUCT_EXPERT_VALIDATION' as const,
  targetDays: 14,
  day7Checkpoint: 7,
  extensionAllowed: true,
  extensionDays: 7,
  readyMinimumScore: 75,
  partiallyReadyMinimumScore: 55,
  minimumRequiredDomainCoverage: 0.6,
  domains: {
    checkIn: { weight: 0.25, minimumDailyRequirement: 1, requiredForReadiness: true },
    food: { weight: 0.25, minimumDailyRequirement: 1, requiredForReadiness: true },
    sleep: { weight: 0.25, minimumDailyRequirement: 1, requiredForReadiness: true },
    activity: { weight: 0.25, minimumDailyRequirement: 1, requiredForReadiness: true },
  },
} as const;

export const baselineDomains = Object.keys(BASELINE_CONFIG.domains) as BaselineDomain[];

export function localDateAt(instant: Date, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(instant);
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    if (!value.year || !value.month || !value.day) throw new Error('Incomplete date parts');
    return `${value.year}-${value.month}-${value.day}`;
  } catch {
    throw new Error(`Timezone tidak valid: ${timezone}`);
  }
}

export function addCalendarDays(localDate: string, days: number): string {
  const date = new Date(`${localDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error('Tanggal lokal tidak valid.');
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calendarDayIndex(startLocalDate: string, currentLocalDate: string): number {
  const start = Date.parse(`${startLocalDate}T00:00:00.000Z`);
  const current = Date.parse(`${currentLocalDate}T00:00:00.000Z`);
  if (Number.isNaN(start) || Number.isNaN(current)) throw new Error('Tanggal lokal tidak valid.');
  return Math.floor((current - start) / 86_400_000) + 1;
}

export function calculateSleepDuration(sleepStartedAt: string, wokeUpAt: string): number {
  const start = Date.parse(sleepStartedAt);
  const end = Date.parse(wokeUpAt);
  const duration = Math.round((end - start) / 60_000);
  if (!Number.isFinite(duration) || duration <= 0 || duration > 24 * 60) throw new Error('Rentang tidur harus lebih dari 0 dan maksimal 24 jam.');
  return duration;
}

export type DomainCounts = Record<BaselineDomain, number>;

export function evaluateDailyCompleteness(counts: DomainCounts, calculatedAt = new Date().toISOString()): CompletenessRecord {
  const achievedDomains = baselineDomains.filter((domain) => counts[domain] >= BASELINE_CONFIG.domains[domain].minimumDailyRequirement);
  const missingDomains = baselineDomains.filter((domain) => !achievedDomains.includes(domain));
  const score = Math.round(achievedDomains.reduce((sum, domain) => sum + BASELINE_CONFIG.domains[domain].weight, 0) * 100);
  const status: DailyCompletenessStatus = achievedDomains.length === baselineDomains.length ? 'COMPLETE' : achievedDomains.length > 0 ? 'PARTIAL' : 'MISSING';
  return {
    scope: 'DAILY',
    status,
    score,
    achievedDomains,
    missingDomains,
    domainCoverage: Object.fromEntries(baselineDomains.map((domain) => [domain, achievedDomains.includes(domain) ? 1 : 0])) as Record<BaselineDomain, number>,
    completedDays: status === 'COMPLETE' ? 1 : 0,
    elapsedDays: 1,
    configVersion: BASELINE_CONFIG.version,
    validationStatus: BASELINE_CONFIG.validationStatus,
    calculatedAt,
  };
}

export function evaluateOverallCompleteness(dailyCounts: DomainCounts[], elapsedDays: number, calculatedAt = new Date().toISOString()): CompletenessRecord {
  const denominator = Math.max(1, Math.min(elapsedDays, BASELINE_CONFIG.targetDays));
  const daily = Array.from({ length: denominator }, (_, index) => evaluateDailyCompleteness(dailyCounts[index] ?? { checkIn: 0, food: 0, sleep: 0, activity: 0 }, calculatedAt));
  const domainCoverage = Object.fromEntries(baselineDomains.map((domain) => [domain, daily.filter((item) => item.achievedDomains.includes(domain)).length / denominator])) as Record<BaselineDomain, number>;
  const score = Math.round(baselineDomains.reduce((sum, domain) => sum + domainCoverage[domain] * BASELINE_CONFIG.domains[domain].weight, 0) * 100);
  const achievedDomains = baselineDomains.filter((domain) => domainCoverage[domain] >= BASELINE_CONFIG.minimumRequiredDomainCoverage);
  const status: DailyCompletenessStatus = score === 100 ? 'COMPLETE' : score > 0 ? 'PARTIAL' : 'MISSING';
  return {
    scope: 'OVERALL',
    status,
    score,
    achievedDomains,
    missingDomains: baselineDomains.filter((domain) => !achievedDomains.includes(domain)),
    domainCoverage,
    completedDays: daily.filter((item) => item.status === 'COMPLETE').length,
    elapsedDays: denominator,
    configVersion: BASELINE_CONFIG.version,
    validationStatus: BASELINE_CONFIG.validationStatus,
    calculatedAt,
  };
}

export function evaluateReadiness(overall: CompletenessRecord, currentDay: number, baselineSessionId: string, evaluatedAt = new Date().toISOString()): Omit<BaselineReadinessRecord, 'id'> | null {
  if (currentDay < BASELINE_CONFIG.targetDays) return null;
  const allRequiredCovered = baselineDomains.every((domain) => !BASELINE_CONFIG.domains[domain].requiredForReadiness || overall.domainCoverage[domain] >= BASELINE_CONFIG.minimumRequiredDomainCoverage);
  const status = overall.score >= BASELINE_CONFIG.readyMinimumScore && allRequiredCovered
    ? 'READY'
    : overall.score >= BASELINE_CONFIG.partiallyReadyMinimumScore
      ? 'PARTIALLY_READY'
      : 'INSUFFICIENT_DATA';
  const reasonCodes = status === 'READY'
    ? ['MINIMUM_SCORE_MET', 'REQUIRED_DOMAIN_COVERAGE_MET']
    : [...(overall.score < BASELINE_CONFIG.readyMinimumScore ? ['COMPLETENESS_BELOW_READY_THRESHOLD'] : []), ...(overall.missingDomains.map((domain) => `DOMAIN_${domain.toUpperCase()}_BELOW_MINIMUM`))];
  return {
    baselineSessionId,
    status,
    domainCoverage: overall.domainCoverage,
    missingDomains: overall.missingDomains,
    totalDays: BASELINE_CONFIG.targetDays,
    completedDays: overall.completedDays,
    completenessScore: overall.score,
    reasonCodes,
    recommendation: status === 'READY'
      ? 'Baseline 14 hari selesai. Data yang tersedia sudah cukup untuk masuk ke tahap analisis pola.'
      : 'Periode 14 hari sudah selesai, tetapi beberapa bagian data masih belum cukup untuk membuat kesimpulan yang dapat diandalkan. Kamu dapat melanjutkan pencatatan.',
    configVersion: BASELINE_CONFIG.version,
    evaluatedAt,
  };
}

export function day7Available(currentDay: number) { return currentDay >= BASELINE_CONFIG.day7Checkpoint; }
export function day14Available(currentDay: number) { return currentDay >= BASELINE_CONFIG.targetDays; }
