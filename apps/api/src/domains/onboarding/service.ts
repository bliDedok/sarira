import type { OnboardingStep, OnboardingSummaryRecord, ProgramEligibilityRecord } from '@sarira/shared-types';
import { getGoalEligibility, getProgramEligibility, validateOnboardingCompletion } from '@sarira/expert-system';
import type { DataRepositories, ProfileRecord } from '../../contracts';
import { NotFoundError, ValidationError } from '../../errors';

export const stepForStatus: Record<ProfileRecord['onboardingStatus'], OnboardingStep> = {
  ACCOUNT_CREATED: 'role-selection',
  ROLE_PENDING: 'role-selection',
  ROLE_COMPLETED: 'birth-date',
  BIRTH_DATE_PENDING: 'birth-date',
  GUARDIAN_CONSENT_PENDING: 'guardian-consent',
  PRIVACY_CONSENT_PENDING: 'privacy-consent',
  SAFETY_SCREENING_PENDING: 'safety-screening',
  GOAL_PENDING: 'goal-selection',
  QUESTIONNAIRE_PENDING: 'profile-questionnaire',
  PROGRAM_PREFERENCE_PENDING: 'program-preference',
  REVIEW_PENDING: 'profile-summary',
  COMPLETED: 'starter-journey',
};

export async function getProfileOrThrow(repositories: DataRepositories, userId: string) {
  const profile = await repositories.profiles.getByUserId(userId);
  if (!profile) throw new NotFoundError('Profil belum dibuat.');
  return profile;
}

export async function requiredConsentsGranted(repositories: DataRepositories, userId: string) {
  const [required, records] = await Promise.all([repositories.consents.required(), repositories.consents.list(userId)]);
  return required.every((definition) => records.some((record) => record.type === definition.type && record.version === definition.version && record.status === 'GRANTED'));
}

export async function programEligibilityForProfile(repositories: DataRepositories, profile: ProfileRecord): Promise<ProgramEligibilityRecord[]> {
  if (profile.age === undefined || !profile.ageGroup || !profile.primaryRole) return [];
  const safety = await repositories.safety.latestCompleted(profile.id);
  const goal = await repositories.goals.get(profile.id);
  if (!safety || !goal) return [];
  return getProgramEligibility({ ageGroup: profile.ageGroup, role: profile.primaryRole as 'USER' | 'PARENT' | 'GUARDIAN' | 'CAREGIVER', safetyStatus: safety.status, goal: goal.code });
}

export async function onboardingSummary(repositories: DataRepositories, userId: string): Promise<OnboardingSummaryRecord> {
  const profile = await getProfileOrThrow(repositories, userId);
  const [guardianConsent, consents, safetyResult, goal, questionnaire, programPreference, requiredGranted] = await Promise.all([
    repositories.guardian.get(profile.id),
    repositories.consents.list(userId),
    repositories.safety.latestCompleted(profile.id),
    repositories.goals.get(profile.id),
    repositories.questionnaires.latest(profile.id),
    repositories.programs.get(profile.id),
    requiredConsentsGranted(repositories, userId),
  ]);
  const eligibility = await programEligibilityForProfile(repositories, profile);
  const goalEligibility = profile.age !== undefined && profile.ageGroup && profile.primaryRole && safetyResult
    ? getGoalEligibility({ age: profile.age!, ageGroup: profile.ageGroup, role: profile.primaryRole as 'USER' | 'PARENT' | 'GUARDIAN' | 'CAREGIVER', safetyStatus: safetyResult.status })
    : [];
  const completionIssues = validateOnboardingCompletion({
    roleComplete: Boolean(profile.primaryRole),
    validAgeContext: profile.age !== undefined,
    ageGroup: profile.ageGroup,
    guardianConsentGranted: guardianConsent?.status === 'GRANTED',
    requiredConsentsGranted: requiredGranted,
    safetyCompleted: Boolean(safetyResult),
    goalValid: Boolean(goal && goalEligibility.some((item) => item.code === goal.code && item.eligible)),
    questionnaireCompleted: questionnaire?.status === 'COMPLETED',
    programPreferenceCompleted: Boolean(programPreference) || (eligibility.length > 0 && eligibility.every((item) => !item.eligible)),
  });
  return {
    profile,
    ...(profile.ageGroup ? { ageGroup: profile.ageGroup } : {}),
    ...(guardianConsent ? { guardianConsent } : {}),
    consents,
    ...(safetyResult ? { safetyResult } : {}),
    ...(goal ? { goal } : {}),
    ...(questionnaire ? { questionnaire } : {}),
    ...(programPreference ? { programPreference } : {}),
    completionIssues,
  };
}

export async function assertOnboardingCompletable(repositories: DataRepositories, userId: string) {
  const summary = await onboardingSummary(repositories, userId);
  if (summary.completionIssues.length > 0) throw new ValidationError('Onboarding belum lengkap.', summary.completionIssues.map((code) => ({ code })));
  return summary;
}
