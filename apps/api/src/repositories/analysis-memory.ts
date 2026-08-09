import { addCalendarDays } from '@sarira/baseline';
import type { FeatureEngineInput } from '@sarira/feature-engine';
import {
  PHASE_7_SCORING_POLICY_VERSION,
  phase7RuleDefinitions,
  phase7WeeklyActions,
} from '@sarira/expert-system';
import { aggregateNutrition, emptyNutrients, indicatorFor, nutrientCodes } from '@sarira/nutrition-engine';
import type {
  DecisionRecordRecord,
  FeatureSnapshotRecord,
  PatternMapRecord,
  Phase7AnalysisResult,
  WeeklyActionAssignmentRecord,
} from '@sarira/shared-types';
import type { AnalysisRepository, BaselineRepository, MealPlanningRepository, NutritionRepository } from '../contracts';
import { ConflictError, NotFoundError } from '../errors';

const id = () => crypto.randomUUID();

export function createMemoryAnalysisRepository(
  baseline: BaselineRepository,
  nutrition: NutritionRepository,
  mealPlanning: MealPlanningRepository,
): AnalysisRepository {
  const snapshots: FeatureSnapshotRecord[] = [];
  const decisions: DecisionRecordRecord[] = [];
  const patternMaps: PatternMapRecord[] = [];
  const actions: WeeklyActionAssignmentRecord[] = [];

  const findPattern = (profileId: string, patternMapId: string) => patternMaps.find((item) => item.id === patternMapId && item.profileId === profileId) ?? null;
  const findAction = (profileId: string, assignmentId: string) => actions.find((item) => item.id === assignmentId && item.profileId === profileId) ?? null;

  return {
    async loadFeatureInput(profileId, baselineId): Promise<FeatureEngineInput> {
      const session = await baseline.getById(profileId, baselineId);
      if (!session) throw new NotFoundError('Baseline tidak ditemukan.');
      const periodEnd = addCalendarDays(session.startLocalDate, session.targetDays - 1);
      const [days, target, plans] = await Promise.all([
        baseline.listDays(profileId, baselineId, session.targetDays, new Date().toISOString()),
        nutrition.getCurrentTarget(profileId, periodEnd),
        Promise.all(Array.from({ length: session.targetDays }, (_, index) => mealPlanning.getCurrentPlan(profileId, addCalendarDays(session.startLocalDate, index)))),
      ]);
      const featureDays = await Promise.all(days.map(async (day) => {
        const items = await nutrition.listItemsForDate(profileId, day.localDate);
        const vectors = items.map((item) => item.snapshot.nutrients);
        const totals = vectors.length > 0 ? aggregateNutrition(vectors) : emptyNutrients();
        const indicators = Object.fromEntries(nutrientCodes.map((code) => {
          const nutrientTarget = target?.targets.find((candidate) => candidate.nutrientCode === code);
          return [code, nutrientTarget ? indicatorFor(totals[code], nutrientTarget).status : totals[code] === null ? 'UNAVAILABLE' : 'TARGET_UNAVAILABLE'];
        }));
        return {
          localDate: day.localDate,
          ...(day.checkIn ? { checkIn: { id: day.checkIn.id, mood: day.checkIn.mood, hunger: day.checkIn.hunger, fullness: day.checkIn.fullness } } : {}),
          meals: day.mealLogs.map((meal) => ({ id: meal.id, mealType: meal.mealType, ...(meal.eatenAt ? { eatenAt: meal.eatenAt } : {}), skipped: meal.skipped, ...(meal.sugaryDrinkConsumed !== undefined ? { sugaryDrinkConsumed: meal.sugaryDrinkConsumed } : {}), ...(meal.eatingContext ? { eatingContext: meal.eatingContext } : {}) })),
          sleep: day.sleepLogs.map((sleep) => ({ id: sleep.id, sleepStartedAt: sleep.sleepStartedAt, durationMinutes: sleep.durationMinutes, perceivedQuality: sleep.perceivedQuality })),
          activities: day.activityLogs.map((activity) => ({ id: activity.id, durationMinutes: activity.durationMinutes })),
          ...(day.stepRecord ? { steps: { id: day.stepRecord.id, steps: day.stepRecord.steps } } : {}),
          ...(items.length > 0 ? { nutrition: { localDate: day.localDate, totals, indicators, itemCount: items.length, sourceRefs: items.map((item) => `NutritionSnapshot:${item.snapshot.id}`) } } : {}),
        };
      }));
      const planItems = plans.flatMap((plan) => plan?.items ?? []);
      const consumedItems = planItems.filter((item) => item.status === 'CONSUMED');
      const personalItems = consumedItems.filter((item) => item.recipe.ownerProfileId === profileId);
      return {
        periodStart: session.startLocalDate,
        periodEnd,
        timezone: session.timezone,
        totalDays: session.targetDays,
        days: featureDays,
        mealPlan: { plannedItems: planItems.length, consumedItems: consumedItems.length, evidenceRefs: planItems.map((item) => `MealPlanItem:${item.id}`) },
        personalRecipeUsage: { count: personalItems.length, evidenceRefs: personalItems.map((item) => `MealPlanItem:${item.id}`) },
      };
    },
    async findFeatureSnapshot(profileId, baselineId, featureEngineVersion, inputSignature) {
      return snapshots.find((item) => item.profileId === profileId && item.baselineSessionId === baselineId && item.featureEngineVersion === featureEngineVersion && item.inputSignature === inputSignature) ?? null;
    },
    async saveFeatureSnapshot(input) {
      const existing = snapshots.find((item) => item.baselineSessionId === input.baselineId && item.featureEngineVersion === input.output.version && item.inputSignature === input.inputSignature);
      if (existing) return existing;
      const value: FeatureSnapshotRecord = { id: id(), profileId: input.profileId, baselineSessionId: input.baselineId, featureEngineVersion: input.output.version, periodStart: input.periodStart, periodEnd: input.periodEnd, generatedAt: input.generatedAt, inputCompleteness: input.output.inputCompleteness, features: input.output.features, missingFeatures: input.output.missingFeatures, warnings: input.output.warnings, inputSignature: input.inputSignature, createdAt: input.generatedAt };
      snapshots.push(value);
      return value;
    },
    async getLatestFeatureSnapshot(profileId) { return snapshots.filter((item) => item.profileId === profileId).sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))[0] ?? null; },
    async persistAnalysis(input): Promise<Phase7AnalysisResult> {
      const existing = decisions.find((item) => item.featureSnapshotId === input.snapshot.id && item.expertSystemVersion === input.evaluation.expertSystemVersion && item.scoringPolicyVersion === input.evaluation.scoringPolicyVersion && item.weeklyActionPolicyVersion === input.evaluation.weeklyActionPolicyVersion && item.inputSignature === input.inputSignature);
      if (existing) {
        const patternMap = patternMaps.find((item) => item.decisionRecordId === existing.id)!;
        const weeklyAction = actions.find((item) => item.patternMapId === patternMap.id);
        return { featureSnapshot: input.snapshot, decision: existing, patternMap, ...(weeklyAction ? { weeklyAction } : {}), reused: true };
      }
      for (const patternMap of patternMaps.filter((item) => item.profileId === input.profileId && item.status !== 'SUPERSEDED')) patternMap.status = 'SUPERSEDED';
      for (const decision of decisions.filter((item) => item.profileId === input.profileId && !item.supersededAt)) decision.supersededAt = input.generatedAt;
      for (const action of actions.filter((item) => item.profileId === input.profileId && actionIsCurrent(item))) action.status = 'REPLACED';
      const decision: DecisionRecordRecord = {
        id: id(), profileId: input.profileId, baselineSessionId: input.baselineId, featureSnapshotId: input.snapshot.id,
        expertSystemVersion: input.evaluation.expertSystemVersion, scoringPolicyVersion: input.evaluation.scoringPolicyVersion, weeklyActionPolicyVersion: input.evaluation.weeklyActionPolicyVersion,
        status: input.evaluation.status, ...(input.evaluation.primaryPattern ? { primaryPatternCode: input.evaluation.primaryPattern.code } : {}), supportingPatternCodes: input.evaluation.supportingPatterns.map((item) => item.code),
        ...(input.evaluation.selectedAction ? { selectedActionCode: input.evaluation.selectedAction.code } : {}), dataQuality: input.evaluation.dataQuality, domainScores: input.evaluation.domainScores,
        ruleEvaluations: input.evaluation.ruleEvaluations.map((item) => ({ ...item, id: id() })), limitations: input.evaluation.limitations, ruleVersions: [...new Set(input.evaluation.ruleEvaluations.map((item) => item.ruleVersion))], inputSignature: input.inputSignature, generatedAt: input.generatedAt,
      };
      decisions.push(decision);
      const patternMap: PatternMapRecord = {
        id: id(), profileId: input.profileId, baselineSessionId: input.baselineId, featureSnapshotId: input.snapshot.id, decisionRecordId: decision.id, status: input.evaluation.status,
        ...(input.evaluation.primaryPattern ? { primaryPattern: input.evaluation.primaryPattern } : {}), supportingPatterns: input.evaluation.supportingPatterns, domains: input.evaluation.domainScores,
        dataQuality: input.evaluation.dataQuality, limitations: input.evaluation.limitations, generatedAt: input.generatedAt, version: patternMaps.filter((item) => item.baselineSessionId === input.baselineId).length + 1,
      };
      patternMaps.push(patternMap);
      let weeklyAction: WeeklyActionAssignmentRecord | undefined;
      if (input.evaluation.selectedAction && input.evaluation.primaryPattern) {
        const definition = { id: id(), ...input.evaluation.selectedAction };
        weeklyAction = { id: id(), profileId: input.profileId, patternMapId: patternMap.id, definition, assignedAt: input.generatedAt, weekStart: input.weekStart, weekEnd: addCalendarDays(input.weekStart, definition.durationDays - 1), targetCount: definition.targetCount, progress: 0, status: 'ACTIVE', reasonCodes: input.evaluation.actionReasonCodes, alternatives: input.evaluation.actionAlternatives.map((item) => ({ code: item.code, title: item.title })), selectionVersion: input.evaluation.weeklyActionPolicyVersion, why: `Action ini dipilih karena ${input.evaluation.primaryPattern.label.toLocaleLowerCase('id-ID')} menjadi pola utama dengan kualitas data ${input.evaluation.primaryPattern.dataQuality.toLocaleLowerCase('id-ID')}.`, checkIns: [] };
        actions.push(weeklyAction);
      }
      return { featureSnapshot: input.snapshot, decision, patternMap, ...(weeklyAction ? { weeklyAction } : {}), reused: false };
    },
    async getCurrentPatternMap(profileId) { return patternMaps.filter((item) => item.profileId === profileId && item.status !== 'SUPERSEDED').sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))[0] ?? null; },
    async getPatternMap(profileId, patternMapId) { return findPattern(profileId, patternMapId); },
    async getDecision(profileId, decisionId) { return decisions.find((item) => item.id === decisionId && item.profileId === profileId) ?? null; },
    async savePatternFeedback(profileId, patternMapId, value, notes) {
      const patternMap = findPattern(profileId, patternMapId);
      if (!patternMap) throw new NotFoundError('Pattern Map tidak ditemukan.');
      patternMap.status = 'ACKNOWLEDGED'; patternMap.acknowledgedAt = new Date().toISOString(); patternMap.feedback = { value, ...(notes ? { notes } : {}), createdAt: patternMap.acknowledgedAt };
      return patternMap;
    },
    async getCurrentWeeklyAction(profileId) { return actions.filter((item) => item.profileId === profileId && findPattern(profileId, item.patternMapId)?.status !== 'SUPERSEDED').sort((left, right) => right.assignedAt.localeCompare(left.assignedAt))[0] ?? null; },
    async getWeeklyAction(profileId, assignmentId) { return findAction(profileId, assignmentId); },
    async listWeeklyActions(profileId) { return actions.filter((item) => item.profileId === profileId).sort((left, right) => right.assignedAt.localeCompare(left.assignedAt)); },
    async addWeeklyActionCheckIn(profileId, assignmentId, localDate, source, evidenceRef) {
      const action = findAction(profileId, assignmentId);
      if (!action) throw new NotFoundError('Weekly Action tidak ditemukan.');
      if (!actionIsCurrent(action) || findPattern(profileId, action.patternMapId)?.status === 'SUPERSEDED') throw new ConflictError('ACTION_NOT_ELIGIBLE');
      if (localDate < action.weekStart || localDate > action.weekEnd) throw new ConflictError('Tanggal check-in berada di luar minggu action.');
      const existingCheckIn = action.checkIns.find((item) => item.localDate === localDate);
      if (!existingCheckIn) action.checkIns.push({ id: id(), assignmentId, localDate, source, ...(evidenceRef ? { evidenceRef } : {}), createdAt: new Date().toISOString() });
      action.progress = Math.min(action.checkIns.length, action.targetCount);
      action.status = action.progress >= action.targetCount ? 'COMPLETED' : 'ACTIVE';
      action.completedAt = action.status === 'COMPLETED' ? new Date().toISOString() : undefined;
      return action;
    },
    async removeWeeklyActionCheckIn(profileId, assignmentId, localDate) {
      const action = findAction(profileId, assignmentId);
      if (!action) throw new NotFoundError('Weekly Action tidak ditemukan.');
      if (findPattern(profileId, action.patternMapId)?.status === 'SUPERSEDED') throw new ConflictError('ACTION_NOT_ELIGIBLE');
      action.checkIns = action.checkIns.filter((item) => item.localDate !== localDate);
      action.progress = Math.min(action.checkIns.length, action.targetCount); action.status = 'ACTIVE'; action.completedAt = undefined;
      return action;
    },
    async previousActionCodes(profileId) { return actions.filter((item) => item.profileId === profileId).sort((left, right) => right.assignedAt.localeCompare(left.assignedAt)).slice(0, 12).map((item) => item.definition.code); },
    async configurationVersions() {
      return {
        scoringPolicies: [{ code: 'PATTERN_SCORING', version: PHASE_7_SCORING_POLICY_VERSION, requiresExpertValidation: true }],
        rules: phase7RuleDefinitions.map((item) => ({ ruleId: item.ruleId, version: item.version, domain: item.domain, requiresExpertValidation: item.requiresExpertValidation })),
        actions: phase7WeeklyActions.map((item) => ({ code: item.code, version: item.version, domain: item.domain, requiresExpertValidation: item.requiresExpertValidation })),
      };
    },
  };
}

function actionIsCurrent(action: WeeklyActionAssignmentRecord) {
  return action.status === 'ACTIVE' || action.status === 'COMPLETED';
}
