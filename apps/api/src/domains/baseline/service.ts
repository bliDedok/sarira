import {
  BASELINE_CONFIG,
  calendarDayIndex,
  day14Available,
  day7Available,
  localDateAt,
  type Clock,
} from '@sarira/baseline';
import type { BaselineSessionRecord, ConsentType, StarterJourneyRecord } from '@sarira/shared-types';
import type { DataRepositories, ProfileRecord } from '../../contracts';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '../../errors';
import { getProfileOrThrow, onboardingSummary, requiredConsentsGranted } from '../onboarding/service';

export interface BaselineContext {
  profile: ProfileRecord;
  baseline: BaselineSessionRecord;
  now: string;
  localDate: string;
  currentDay: number;
  calendarReachedNow: boolean;
}

export async function starterJourney(repositories: DataRepositories, userId: string): Promise<StarterJourneyRecord> {
  const summary = await onboardingSummary(repositories, userId);
  if (summary.profile.onboardingStatus !== 'COMPLETED' || !summary.profile.onboardingCompletedAt) throw new ConflictError('Selesaikan onboarding sebelum membuka Starter Journey.');
  if (!summary.profile.ageGroup || !summary.goal || !summary.safetyResult) throw new ConflictError('Profil, tujuan, atau hasil safety belum lengkap.');
  return { profile: summary.profile, ageGroup: summary.profile.ageGroup, goal: summary.goal, safetyResult: summary.safetyResult, ...(summary.programPreference ? { programPreference: summary.programPreference } : {}), baseline: await repositories.baseline.getCurrent(summary.profile.id) };
}

export async function assertBaselinePreconditions(repositories: DataRepositories, userId: string) {
  const summary = await onboardingSummary(repositories, userId);
  const issues: string[] = [];
  if (summary.profile.onboardingStatus !== 'COMPLETED' || !summary.profile.onboardingCompletedAt) issues.push('ONBOARDING_NOT_COMPLETED');
  if (!summary.profile.fullName || summary.profile.age === undefined || !summary.profile.ageGroup || !summary.profile.timezone) issues.push('PROFILE_INCOMPLETE');
  if (!summary.goal) issues.push('GOAL_MISSING');
  if (!summary.safetyResult) issues.push('SAFETY_SCREENING_MISSING');
  if (!(await requiredConsentsGranted(repositories, userId))) issues.push('REQUIRED_CONSENT_MISSING');
  try { localDateAt(new Date(), summary.profile.timezone); } catch { issues.push('PROFILE_TIMEZONE_INVALID'); }
  if (issues.length) throw new ValidationError('Baseline belum dapat dimulai.', issues.map((code) => ({ code })));
  return summary.profile;
}

export async function refreshBaseline(repositories: DataRepositories, profile: ProfileRecord, baseline: BaselineSessionRecord, clock: Clock): Promise<BaselineContext> {
  const nowDate = clock.now();
  const now = nowDate.toISOString();
  const localDate = localDateAt(nowDate, baseline.timezone);
  const rawDay = Math.max(1, calendarDayIndex(baseline.startLocalDate, localDate));
  const maximumDay = baseline.extensionAllowed ? baseline.targetDays + baseline.extensionDays : baseline.targetDays;
  const currentDay = Math.min(rawDay, maximumDay);
  const calendarReachedNow = day14Available(rawDay) && !baseline.calendarCompletedAt;
  let status = baseline.status;
  if (!['COMPLETED', 'CANCELLED', 'PAUSED'].includes(status)) {
    if (day14Available(rawDay)) status = 'DAY_14_REVIEW_AVAILABLE';
    else if (day7Available(rawDay)) status = 'DAY_7_REVIEW_AVAILABLE';
    else status = 'ACTIVE';
  }
  let readinessStatus = baseline.readinessStatus;
  let completenessScore = baseline.completenessScore;
  let calendarCompletedAt = baseline.calendarCompletedAt;
  if (day14Available(rawDay) && status !== 'COMPLETED' && status !== 'CANCELLED') {
    const readiness = await repositories.baseline.getReadiness(profile.id, baseline.id, rawDay, now);
    readinessStatus = readiness.status;
    completenessScore = readiness.completenessScore;
    calendarCompletedAt ??= now;
    status = readiness.status === 'INSUFFICIENT_DATA' ? 'DATA_INSUFFICIENT' : 'DAY_14_REVIEW_AVAILABLE';
  } else {
    const overall = await repositories.baseline.getCompleteness(profile.id, baseline.id, rawDay, undefined, now);
    completenessScore = overall.score;
  }
  const refreshed = await repositories.baseline.refresh(baseline.id, { currentDay, status, ...(calendarCompletedAt ? { calendarCompletedAt } : {}), readinessStatus, completenessScore });
  return { profile, baseline: refreshed, now, localDate, currentDay: rawDay, calendarReachedNow };
}

export async function currentBaselineContext(repositories: DataRepositories, userId: string, clock: Clock): Promise<BaselineContext> {
  const profile = await getProfileOrThrow(repositories, userId);
  const baseline = await repositories.baseline.getCurrent(profile.id);
  if (!baseline) throw new NotFoundError('Baseline aktif belum tersedia. Mulai dari Starter Journey.');
  return refreshBaseline(repositories, profile, baseline, clock);
}

export async function baselineByIdContext(repositories: DataRepositories, userId: string, baselineId: string, clock: Clock): Promise<BaselineContext> {
  const profile = await getProfileOrThrow(repositories, userId);
  const baseline = await repositories.baseline.getById(profile.id, baselineId);
  if (!baseline) {
    const ownerProfileId = await repositories.baseline.getOwnerProfileId(baselineId);
    if (ownerProfileId && ownerProfileId !== profile.id) throw new AuthorizationError('Baseline dimiliki profil lain.');
    throw new NotFoundError('Baseline tidak ditemukan.');
  }
  return refreshBaseline(repositories, profile, baseline, clock);
}

export function assertEditableDate(context: BaselineContext, localDate: string) {
  if (['COMPLETED', 'CANCELLED'].includes(context.baseline.status)) throw new ConflictError('Baseline sudah ditutup dan histori tidak dapat diubah.');
  const dayIndex = calendarDayIndex(context.baseline.startLocalDate, localDate);
  const maximumDay = context.baseline.extensionAllowed ? context.baseline.targetDays + context.baseline.extensionDays : context.baseline.targetDays;
  if (dayIndex < 1) throw new ValidationError('Tanggal berada sebelum baseline dimulai.');
  if (localDate > context.localDate) throw new ValidationError('Catatan untuk tanggal mendatang belum dapat dibuat.');
  if (dayIndex > maximumDay) throw new ConflictError('Tanggal berada di luar periode baseline yang diizinkan.');
  return dayIndex;
}

export async function assertConsent(repositories: DataRepositories, userId: string, type: ConsentType) {
  const consents = await repositories.consents.list(userId);
  if (!consents.some((consent) => consent.type === type && consent.status === 'GRANTED')) throw new ConflictError(`Consent ${type} diperlukan untuk pencatatan baru. Data lama tetap tersimpan sesuai kebijakan.`);
}

export function createBaselineInput(profile: ProfileRecord, clock: Clock) {
  const now = clock.now();
  return { startedAt: now.toISOString(), startLocalDate: localDateAt(now, profile.timezone), timezone: profile.timezone, targetDays: BASELINE_CONFIG.targetDays, extensionAllowed: BASELINE_CONFIG.extensionAllowed, extensionDays: BASELINE_CONFIG.extensionDays, configVersion: BASELINE_CONFIG.version };
}
