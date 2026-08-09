import { createHash } from 'node:crypto';
import { calendarDayIndex, day14Available, localDateAt, type Clock } from '@sarira/baseline';
import { FEATURE_ENGINE_VERSION, generateFeatures, type FeatureEngineInput } from '@sarira/feature-engine';
import {
  PHASE_7_EXPERT_SYSTEM_VERSION,
  PHASE_7_RULE_VERSION,
  PHASE_7_SCORING_POLICY_VERSION,
  PHASE_7_WEEKLY_ACTION_POLICY_VERSION,
  evaluatePhase7,
  phase7RuleDefinitions,
} from '@sarira/expert-system';
import type { ConsentType, PatternMapFeedbackValue } from '@sarira/shared-types';
import type { DataRepositories } from '../../contracts';
import {
  ActionNotEligibleError,
  BaselineNotReadyError,
  ConsentRequiredError,
  NotFoundError,
  RulePackNotAvailableError,
  ValidationError,
} from '../../errors';
import { getProfileOrThrow, requiredConsentsGranted } from '../onboarding/service';

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.entries(value as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(',')}}`;
  return JSON.stringify(value);
};
const signature = (value: unknown) => createHash('sha256').update(stable(value)).digest('hex');

async function phase7Context(repositories: DataRepositories, clock: Clock, userId: string) {
  if (!(await requiredConsentsGranted(repositories, userId))) throw new ConsentRequiredError('Consent wajib profil kesehatan harus tetap aktif sebelum analisis baru.');
  const profile = await getProfileOrThrow(repositories, userId);
  const baseline = await repositories.baseline.getLatestForAnalysis(profile.id);
  if (!baseline) throw new BaselineNotReadyError();
  const now = clock.now().toISOString();
  const localDate = localDateAt(clock.now(), baseline.timezone);
  const currentDay = Math.max(baseline.currentDay, calendarDayIndex(baseline.startLocalDate, localDate));
  if (!day14Available(currentDay) && baseline.readinessStatus === 'PENDING') throw new BaselineNotReadyError();
  const [readiness, consents, safety, goal] = await Promise.all([
    repositories.baseline.getReadiness(profile.id, baseline.id, Math.max(14, currentDay), now),
    repositories.consents.list(userId),
    repositories.safety.latestCompleted(profile.id),
    repositories.goals.get(profile.id),
  ]);
  if (!profile.ageGroup || !safety || !goal) throw new ValidationError('Profil, safety, atau tujuan belum lengkap untuk analisis.', [{ code: 'PHASE7_PROFILE_CONTEXT_INCOMPLETE' }]);
  const granted = (type: ConsentType) => consents.some((item) => item.type === type && item.status === 'GRANTED');
  return { profile, baseline, now, localDate, currentDay, readiness, safety, goal, granted };
}

function consentFilteredInput(input: FeatureEngineInput, granted: (type: ConsentType) => boolean): FeatureEngineInput {
  const nutritionGranted = granted('NUTRITION_DATA');
  const sleepGranted = granted('SLEEP_DATA');
  const activityGranted = granted('ACTIVITY_DATA');
  return {
    ...input,
    days: input.days.map((day) => ({
      localDate: day.localDate,
      ...(day.checkIn ? { checkIn: day.checkIn } : {}),
      meals: nutritionGranted ? day.meals : [],
      sleep: sleepGranted ? day.sleep : [],
      activities: activityGranted ? day.activities : [],
      ...(activityGranted && day.steps ? { steps: day.steps } : {}),
      ...(nutritionGranted && day.nutrition ? { nutrition: day.nutrition } : {}),
    })),
    mealPlan: nutritionGranted ? input.mealPlan : { plannedItems: 0, consumedItems: 0, evidenceRefs: [] },
    personalRecipeUsage: nutritionGranted ? input.personalRecipeUsage : { count: 0, evidenceRefs: [] },
  };
}

export async function generateFeatureSnapshot(repositories: DataRepositories, clock: Clock, userId: string) {
  const context = await phase7Context(repositories, clock, userId);
  const rawInput = await repositories.analysis.loadFeatureInput(context.profile.id, context.baseline.id);
  const input = consentFilteredInput(rawInput, context.granted);
  const inputSignature = signature({ featureEngineVersion: FEATURE_ENGINE_VERSION, input });
  const existing = await repositories.analysis.findFeatureSnapshot(context.profile.id, context.baseline.id, FEATURE_ENGINE_VERSION, inputSignature);
  if (existing) return { snapshot: existing, reused: true, context };
  const output = generateFeatures(input);
  const snapshot = await repositories.analysis.saveFeatureSnapshot({ profileId: context.profile.id, baselineId: context.baseline.id, generatedAt: context.now, inputSignature, output, periodStart: input.periodStart, periodEnd: input.periodEnd });
  return { snapshot, reused: false, context };
}

async function assertConfiguration(repositories: DataRepositories) {
  const configuration = await repositories.analysis.configurationVersions();
  const scoringAvailable = configuration.scoringPolicies.some((item) => item.version === PHASE_7_SCORING_POLICY_VERSION);
  const availableRules = new Set(configuration.rules.map((item) => `${item.ruleId}:${item.version}`));
  const rulesAvailable = phase7RuleDefinitions.every((item) => availableRules.has(`${item.ruleId}:${PHASE_7_RULE_VERSION}`));
  if (!scoringAvailable || !rulesAvailable) throw new RulePackNotAvailableError();
}

export async function generatePatternMap(repositories: DataRepositories, clock: Clock, userId: string) {
  const generated = await generateFeatureSnapshot(repositories, clock, userId);
  await assertConfiguration(repositories);
  const previousActionCodes = await repositories.analysis.previousActionCodes(generated.context.profile.id);
  const evaluation = evaluatePhase7({
    features: generated.snapshot.features,
    baselineReady: generated.context.readiness.status === 'READY' || generated.context.readiness.status === 'PARTIALLY_READY',
    ageGroup: generated.context.profile.ageGroup!,
    safetyStatus: generated.context.safety.status,
    goal: generated.context.goal.code,
    previousActionCodes,
  });
  const inputSignature = signature({
    featureSnapshot: generated.snapshot.inputSignature,
    ageGroup: generated.context.profile.ageGroup,
    safetyStatus: generated.context.safety.status,
    safetyRuleVersion: generated.context.safety.ruleVersion,
    goal: generated.context.goal.code,
    expertSystemVersion: PHASE_7_EXPERT_SYSTEM_VERSION,
    scoringPolicyVersion: PHASE_7_SCORING_POLICY_VERSION,
    weeklyActionPolicyVersion: PHASE_7_WEEKLY_ACTION_POLICY_VERSION,
  });
  return repositories.analysis.persistAnalysis({ profileId: generated.context.profile.id, baselineId: generated.context.baseline.id, snapshot: generated.snapshot, evaluation, inputSignature, generatedAt: generated.context.now, weekStart: generated.context.localDate });
}

export async function latestFeatureSnapshot(repositories: DataRepositories, userId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  const snapshot = await repositories.analysis.getLatestFeatureSnapshot(profile.id);
  if (!snapshot) throw new NotFoundError('Feature Snapshot belum tersedia.');
  return snapshot;
}

export async function currentPatternMap(repositories: DataRepositories, userId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  const patternMap = await repositories.analysis.getCurrentPatternMap(profile.id);
  if (!patternMap) throw new NotFoundError('Pattern Map belum tersedia.');
  return patternMap;
}

export async function patternMapById(repositories: DataRepositories, userId: string, patternMapId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  const patternMap = await repositories.analysis.getPatternMap(profile.id, patternMapId);
  if (!patternMap) throw new NotFoundError('Pattern Map tidak ditemukan.');
  return patternMap;
}

export async function decisionById(repositories: DataRepositories, userId: string, decisionId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  const decision = await repositories.analysis.getDecision(profile.id, decisionId);
  if (!decision) throw new NotFoundError('Decision Record tidak ditemukan.');
  return decision;
}

export async function savePatternFeedback(repositories: DataRepositories, userId: string, patternMapId: string, value: PatternMapFeedbackValue, notes?: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  return repositories.analysis.savePatternFeedback(profile.id, patternMapId, value, notes);
}

async function assertActionEligibility(repositories: DataRepositories, userId: string, action: Awaited<ReturnType<DataRepositories['analysis']['getWeeklyAction']>>) {
  if (!action) throw new NotFoundError('Weekly Action tidak ditemukan.');
  const profile = await getProfileOrThrow(repositories, userId);
  const safety = await repositories.safety.latestCompleted(profile.id);
  if (!profile.ageGroup || !safety || !action.definition.ageEligibility.includes(profile.ageGroup) || action.definition.safetyRestrictions.includes(safety.status)) throw new ActionNotEligibleError();
  return action;
}

export async function currentWeeklyAction(repositories: DataRepositories, userId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  return assertActionEligibility(repositories, userId, await repositories.analysis.getCurrentWeeklyAction(profile.id));
}

export async function weeklyActionHistory(repositories: DataRepositories, userId: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  return repositories.analysis.listWeeklyActions(profile.id);
}

export async function checkInWeeklyAction(repositories: DataRepositories, userId: string, assignmentId: string, localDate: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  await assertActionEligibility(repositories, userId, await repositories.analysis.getWeeklyAction(profile.id, assignmentId));
  return repositories.analysis.addWeeklyActionCheckIn(profile.id, assignmentId, localDate, 'USER_CONFIRMED');
}

export async function undoWeeklyActionCheckIn(repositories: DataRepositories, userId: string, assignmentId: string, localDate: string) {
  const profile = await getProfileOrThrow(repositories, userId);
  await assertActionEligibility(repositories, userId, await repositories.analysis.getWeeklyAction(profile.id, assignmentId));
  return repositories.analysis.removeWeeklyActionCheckIn(profile.id, assignmentId, localDate);
}
