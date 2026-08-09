import { addCalendarDays } from '@sarira/baseline';
import type { FeatureEngineInput } from '@sarira/feature-engine';
import { aggregateNutrition, emptyNutrients, indicatorFor, nutrientCodes, type NutritionTarget } from '@sarira/nutrition-engine';
import type {
  AnalysisFeatureSet,
  DecisionRecordRecord,
  DomainScoreRecord,
  FeatureSnapshotRecord,
  PatternMapFeedbackValue,
  PatternMapRecord,
  PatternSelectionRecord,
  Phase7AnalysisResult,
  RuleEvaluationRecord,
  WeeklyActionAssignmentRecord,
  WeeklyActionDefinitionRecord,
} from '@sarira/shared-types';
import type { AnalysisRepository } from '../contracts';
import type { SariraPrismaClient } from '../database';
import { ConflictError, NotFoundError } from '../errors';
import {
  PatternMapStatus,
  Prisma,
  WeeklyActionAssignmentStatus,
} from '../generated/prisma/client';
import type { AnalysisDataQuality, AnalysisStatus, PatternDomain, PatternMapFeedbackValue as DbPatternMapFeedbackValue, WeeklyActionCompletionSource } from '../generated/prisma/client';
import { createPrismaNutritionRepository } from './nutrition-prisma';

const dateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);
const isoDate = (value: Date) => value.toISOString().slice(0, 10);
const decimal = (value: { toNumber(): number } | number | null) => value === null ? null : typeof value === 'number' ? value : value.toNumber();
const json = (value: unknown) => value as Prisma.InputJsonValue;

const snapshotRecord = (value: { id: string; profileId: string; baselineSessionId: string; featureEngineVersion: string; periodStart: Date; periodEnd: Date; generatedAt: Date; inputCompleteness: number; features: unknown; missingFeatures: string[]; warnings: string[]; inputSignature: string; createdAt: Date }): FeatureSnapshotRecord => ({
  id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, featureEngineVersion: value.featureEngineVersion,
  periodStart: isoDate(value.periodStart), periodEnd: isoDate(value.periodEnd), generatedAt: value.generatedAt.toISOString(), inputCompleteness: value.inputCompleteness,
  features: value.features as unknown as AnalysisFeatureSet, missingFeatures: value.missingFeatures as FeatureSnapshotRecord['missingFeatures'], warnings: value.warnings, inputSignature: value.inputSignature, createdAt: value.createdAt.toISOString(),
});

const definitionRecord = (value: { id: string; code: string; version: string; domain: string; title: string; description: string; durationDays: number; targetCount: number; ageEligibility: string[]; safetyRestrictions: string[]; requiredEvidence: string[]; actionability: number; active: boolean; requiresExpertValidation: boolean }): WeeklyActionDefinitionRecord => ({
  id: value.id, code: value.code, version: value.version, domain: value.domain as WeeklyActionDefinitionRecord['domain'], title: value.title, description: value.description, durationDays: value.durationDays, targetCount: value.targetCount, ageEligibility: value.ageEligibility as WeeklyActionDefinitionRecord['ageEligibility'], safetyRestrictions: value.safetyRestrictions as WeeklyActionDefinitionRecord['safetyRestrictions'], requiredEvidence: value.requiredEvidence as WeeklyActionDefinitionRecord['requiredEvidence'], actionability: value.actionability, active: value.active, requiresExpertValidation: value.requiresExpertValidation,
});

const evaluationRecord = (value: { id: string; ruleId: string; ruleVersion: string; domain: string; matched: boolean; contribution: number; observedValues: unknown; reasonCodes: string[]; evidenceRefs: string[]; limitations: string[] }): RuleEvaluationRecord => ({
  id: value.id, ruleId: value.ruleId, ruleVersion: value.ruleVersion, domain: value.domain as RuleEvaluationRecord['domain'], matched: value.matched, contribution: value.contribution, observedValues: value.observedValues as Record<string, number | null>, reasonCodes: value.reasonCodes, evidenceRefs: value.evidenceRefs, limitations: value.limitations,
});

const decisionRecord = (value: { id: string; profileId: string; baselineSessionId: string; featureSnapshotId: string; expertSystemVersion: string; scoringPolicyVersion: string; weeklyActionPolicyVersion: string; status: string; primaryPatternCode: string | null; supportingPatternCodes: string[]; selectedActionCode: string | null; dataQuality: string; domainScores: unknown; limitations: string[]; ruleVersions: string[]; inputSignature: string; generatedAt: Date; supersededAt: Date | null; ruleEvaluations: Array<{ id: string; ruleId: string; ruleVersion: string; domain: string; matched: boolean; contribution: number; observedValues: unknown; reasonCodes: string[]; evidenceRefs: string[]; limitations: string[] }> }): DecisionRecordRecord => ({
  id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, featureSnapshotId: value.featureSnapshotId, expertSystemVersion: value.expertSystemVersion, scoringPolicyVersion: value.scoringPolicyVersion, weeklyActionPolicyVersion: value.weeklyActionPolicyVersion, status: value.status as DecisionRecordRecord['status'], ...(value.primaryPatternCode ? { primaryPatternCode: value.primaryPatternCode } : {}), supportingPatternCodes: value.supportingPatternCodes, ...(value.selectedActionCode ? { selectedActionCode: value.selectedActionCode } : {}), dataQuality: value.dataQuality as DecisionRecordRecord['dataQuality'], domainScores: value.domainScores as unknown as DomainScoreRecord[], ruleEvaluations: value.ruleEvaluations.map(evaluationRecord), limitations: value.limitations, ruleVersions: value.ruleVersions, inputSignature: value.inputSignature, generatedAt: value.generatedAt.toISOString(), ...(value.supersededAt ? { supersededAt: value.supersededAt.toISOString() } : {}),
});

type AssignmentPayload = {
  id: string; profileId: string; patternMapId: string; assignedAt: Date; weekStart: Date; weekEnd: Date; targetCount: number; progress: number; status: string; completedAt: Date | null; reasonCodes: string[]; alternatives: unknown; selectionVersion: string; why: string;
  actionDefinition: { id: string; code: string; version: string; domain: string; title: string; description: string; durationDays: number; targetCount: number; ageEligibility: string[]; safetyRestrictions: string[]; requiredEvidence: string[]; actionability: number; active: boolean; requiresExpertValidation: boolean };
  checkIns: Array<{ id: string; assignmentId: string; localDate: Date; source: string; evidenceRef: string | null; createdAt: Date }>;
};
const assignmentRecord = (value: AssignmentPayload): WeeklyActionAssignmentRecord => ({
  id: value.id, profileId: value.profileId, patternMapId: value.patternMapId, definition: definitionRecord(value.actionDefinition), assignedAt: value.assignedAt.toISOString(), weekStart: isoDate(value.weekStart), weekEnd: isoDate(value.weekEnd), targetCount: value.targetCount, progress: value.progress, status: value.status as WeeklyActionAssignmentRecord['status'], ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}), reasonCodes: value.reasonCodes, alternatives: value.alternatives as WeeklyActionAssignmentRecord['alternatives'], selectionVersion: value.selectionVersion, why: value.why, checkIns: value.checkIns.map((checkIn) => ({ id: checkIn.id, assignmentId: checkIn.assignmentId, localDate: isoDate(checkIn.localDate), source: checkIn.source as WeeklyActionAssignmentRecord['checkIns'][number]['source'], ...(checkIn.evidenceRef ? { evidenceRef: checkIn.evidenceRef } : {}), createdAt: checkIn.createdAt.toISOString() })),
});

type PatternPayload = {
  id: string; profileId: string; baselineSessionId: string; featureSnapshotId: string; decisionRecordId: string; status: string; primaryPattern: unknown; supportingPatterns: unknown; domains: unknown; dataQuality: string; limitations: string[]; generatedAt: Date; acknowledgedAt: Date | null; version: number;
  feedback: Array<{ value: string; notes: string | null; createdAt: Date }>;
  weeklyAction: AssignmentPayload | null;
};
const patternRecord = (value: PatternPayload): PatternMapRecord => ({
  id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, featureSnapshotId: value.featureSnapshotId, decisionRecordId: value.decisionRecordId, status: value.status as PatternMapRecord['status'], ...(value.primaryPattern ? { primaryPattern: value.primaryPattern as unknown as PatternSelectionRecord } : {}), supportingPatterns: value.supportingPatterns as unknown as PatternSelectionRecord[], domains: value.domains as unknown as DomainScoreRecord[], dataQuality: value.dataQuality as PatternMapRecord['dataQuality'], limitations: value.limitations, generatedAt: value.generatedAt.toISOString(), ...(value.acknowledgedAt ? { acknowledgedAt: value.acknowledgedAt.toISOString() } : {}), ...(value.feedback[0] ? { feedback: { value: value.feedback[0].value as PatternMapFeedbackValue, ...(value.feedback[0].notes ? { notes: value.feedback[0].notes } : {}), createdAt: value.feedback[0].createdAt.toISOString() } } : {}), version: value.version,
});

const patternInclude = { feedback: { orderBy: { createdAt: 'desc' as const }, take: 1 }, weeklyAction: { include: { actionDefinition: true, checkIns: { orderBy: { localDate: 'asc' as const } } } } } as const;
const decisionInclude = { ruleEvaluations: { orderBy: { ruleId: 'asc' as const } } } as const;

export function createPrismaAnalysisRepository(prisma: SariraPrismaClient): AnalysisRepository {
  const nutritionRepository = createPrismaNutritionRepository(prisma);
  const fetchPattern = async (profileId: string, id: string) => {
    const value = await prisma.patternMap.findFirst({ where: { id, profileId }, include: patternInclude });
    return value ? patternRecord(value as unknown as PatternPayload) : null;
  };
  const fetchAssignment = async (profileId: string, id: string) => {
    const value = await prisma.weeklyActionAssignment.findFirst({ where: { id, profileId }, include: { actionDefinition: true, checkIns: { orderBy: { localDate: 'asc' } } } });
    return value ? assignmentRecord(value as unknown as AssignmentPayload) : null;
  };

  return {
    async loadFeatureInput(profileId, baselineId): Promise<FeatureEngineInput> {
      const baseline = await prisma.baselineSession.findFirst({
        where: { id: baselineId, profileId },
        include: { dailyRecords: { include: { checkIn: true, mealLogs: true, sleepLogs: true, activityLogs: true, stepRecord: true }, orderBy: { dayIndex: 'asc' } } },
      });
      if (!baseline) throw new NotFoundError('Baseline tidak ditemukan.');
      const periodStart = isoDate(baseline.startLocalDate);
      const periodEnd = addCalendarDays(periodStart, baseline.targetDays - 1);
      const [items, target, planItems] = await Promise.all([
        prisma.mealLogItem.findMany({ where: { profileId, mealLog: { baselineSessionId: baseline.id, localDate: { gte: dateOnly(periodStart), lte: dateOnly(periodEnd) } } }, include: { snapshot: true, mealLog: true }, orderBy: { createdAt: 'asc' } }),
        nutritionRepository.getCurrentTarget(profileId, periodEnd),
        prisma.dailyMealPlanItem.findMany({ where: { mealPlan: { profileId, localDate: { gte: dateOnly(periodStart), lte: dateOnly(periodEnd) } } }, include: { consumption: true, recipe: { select: { ownerProfileId: true } } }, orderBy: { createdAt: 'asc' } }),
      ]);
      const records = new Map(baseline.dailyRecords.map((record) => [isoDate(record.localDate), record]));
      const itemGroups = new Map<string, typeof items>();
      for (const item of items) { const date = isoDate(item.mealLog.localDate); itemGroups.set(date, [...(itemGroups.get(date) ?? []), item]); }
      const days = Array.from({ length: baseline.targetDays }, (_, index) => {
        const localDate = addCalendarDays(periodStart, index);
        const record = records.get(localDate);
        const nutritionItems = itemGroups.get(localDate) ?? [];
        const vectors = nutritionItems.map((item) => ({ ENERGY_KCAL: decimal(item.snapshot?.energyKcal ?? null), PROTEIN_G: decimal(item.snapshot?.proteinG ?? null), CARBOHYDRATE_G: decimal(item.snapshot?.carbohydrateG ?? null), FAT_G: decimal(item.snapshot?.fatG ?? null), SATURATED_FAT_G: decimal(item.snapshot?.saturatedFatG ?? null), FIBER_G: decimal(item.snapshot?.fiberG ?? null), SUGAR_G: decimal(item.snapshot?.sugarG ?? null), SODIUM_MG: decimal(item.snapshot?.sodiumMg ?? null) }));
        const totals = vectors.length ? aggregateNutrition(vectors) : emptyNutrients();
        const indicators = Object.fromEntries(nutrientCodes.map((code) => { const entry = target?.targets.find((candidate) => candidate.nutrientCode === code); return [code, entry ? indicatorFor(totals[code], entry as NutritionTarget).status : totals[code] === null ? 'UNAVAILABLE' : 'TARGET_UNAVAILABLE']; }));
        return {
          localDate,
          ...(record?.checkIn ? { checkIn: { id: record.checkIn.id, mood: record.checkIn.mood, hunger: record.checkIn.hunger, fullness: record.checkIn.fullness } } : {}),
          meals: (record?.mealLogs ?? []).map((meal) => ({ id: meal.id, mealType: meal.mealType, ...(meal.eatenAt ? { eatenAt: meal.eatenAt.toISOString() } : {}), skipped: meal.skipped, ...(meal.sugaryDrinkConsumed !== null ? { sugaryDrinkConsumed: meal.sugaryDrinkConsumed } : {}), ...(meal.eatingContext ? { eatingContext: meal.eatingContext } : {}) })),
          sleep: (record?.sleepLogs ?? []).map((sleep) => ({ id: sleep.id, sleepStartedAt: sleep.sleepStartedAt.toISOString(), durationMinutes: sleep.durationMinutes, perceivedQuality: sleep.perceivedQuality })),
          activities: (record?.activityLogs ?? []).map((activity) => ({ id: activity.id, durationMinutes: activity.durationMinutes })),
          ...(record?.stepRecord ? { steps: { id: record.stepRecord.id, steps: record.stepRecord.steps } } : {}),
          ...(nutritionItems.length ? { nutrition: { localDate, totals, indicators, itemCount: nutritionItems.length, sourceRefs: nutritionItems.flatMap((item) => item.snapshot ? [`NutritionSnapshot:${item.snapshot.id}`] : []) } } : {}),
        };
      });
      const consumedItems = planItems.filter((item) => item.consumption);
      const personalUsage = consumedItems.filter((item) => item.recipe.ownerProfileId === profileId);
      return { periodStart, periodEnd, timezone: baseline.timezone, totalDays: baseline.targetDays, days, mealPlan: { plannedItems: planItems.length, consumedItems: consumedItems.length, evidenceRefs: planItems.map((item) => `DailyMealPlanItem:${item.id}`) }, personalRecipeUsage: { count: personalUsage.length, evidenceRefs: personalUsage.map((item) => `DailyMealPlanItem:${item.id}`) } };
    },
    async findFeatureSnapshot(profileId, baselineId, featureEngineVersion, inputSignature) {
      const value = await prisma.featureSnapshot.findFirst({ where: { profileId, baselineSessionId: baselineId, featureEngineVersion, inputSignature } });
      return value ? snapshotRecord(value) : null;
    },
    async saveFeatureSnapshot(input) {
      const value = await prisma.featureSnapshot.upsert({ where: { baselineSessionId_featureEngineVersion_inputSignature: { baselineSessionId: input.baselineId, featureEngineVersion: input.output.version, inputSignature: input.inputSignature } }, update: {}, create: { profileId: input.profileId, baselineSessionId: input.baselineId, featureEngineVersion: input.output.version, periodStart: dateOnly(input.periodStart), periodEnd: dateOnly(input.periodEnd), generatedAt: new Date(input.generatedAt), inputCompleteness: input.output.inputCompleteness, features: json(input.output.features), missingFeatures: input.output.missingFeatures, warnings: input.output.warnings, inputSignature: input.inputSignature } });
      return snapshotRecord(value);
    },
    async getLatestFeatureSnapshot(profileId) {
      const value = await prisma.featureSnapshot.findFirst({ where: { profileId }, orderBy: { generatedAt: 'desc' } });
      return value ? snapshotRecord(value) : null;
    },
    async persistAnalysis(input): Promise<Phase7AnalysisResult> {
      const existing = await prisma.decisionRecord.findFirst({ where: { featureSnapshotId: input.snapshot.id, expertSystemVersion: input.evaluation.expertSystemVersion, scoringPolicyVersion: input.evaluation.scoringPolicyVersion, weeklyActionPolicyVersion: input.evaluation.weeklyActionPolicyVersion, inputSignature: input.inputSignature }, include: decisionInclude });
      if (existing) {
        const patternMap = await prisma.patternMap.findUniqueOrThrow({ where: { decisionRecordId: existing.id }, include: patternInclude });
        const mappedPattern = patternRecord(patternMap as unknown as PatternPayload);
        return { featureSnapshot: input.snapshot, decision: decisionRecord(existing), patternMap: mappedPattern, ...(patternMap.weeklyAction ? { weeklyAction: assignmentRecord(patternMap.weeklyAction as unknown as AssignmentPayload) } : {}), reused: true };
      }
      const ruleRows = await prisma.patternRuleDefinition.findMany({ where: { OR: input.evaluation.ruleEvaluations.map((rule) => ({ ruleId: rule.ruleId, version: rule.ruleVersion })) } });
      if (ruleRows.length !== input.evaluation.ruleEvaluations.length) throw new ConflictError('RULE_PACK_NOT_AVAILABLE');
      const actionRow = input.evaluation.selectedAction ? await prisma.weeklyActionDefinition.findUnique({ where: { code_version: { code: input.evaluation.selectedAction.code, version: input.evaluation.selectedAction.version } } }) : null;
      if (input.evaluation.selectedAction && !actionRow) throw new ConflictError('ACTION_NOT_ELIGIBLE');
      const generatedAt = new Date(input.generatedAt);
      const created = await prisma.$transaction(async (tx) => {
        await tx.patternMap.updateMany({ where: { profileId: input.profileId, status: { in: [PatternMapStatus.READY, PatternMapStatus.PARTIAL, PatternMapStatus.INSUFFICIENT_DATA, PatternMapStatus.ACKNOWLEDGED] } }, data: { status: PatternMapStatus.SUPERSEDED } });
        await tx.decisionRecord.updateMany({ where: { profileId: input.profileId, supersededAt: null }, data: { supersededAt: generatedAt } });
        await tx.weeklyActionAssignment.updateMany({ where: { profileId: input.profileId, status: WeeklyActionAssignmentStatus.ACTIVE }, data: { status: WeeklyActionAssignmentStatus.REPLACED } });
        const version = await tx.patternMap.count({ where: { baselineSessionId: input.baselineId } }) + 1;
        const decision = await tx.decisionRecord.create({ data: { profileId: input.profileId, baselineSessionId: input.baselineId, featureSnapshotId: input.snapshot.id, expertSystemVersion: input.evaluation.expertSystemVersion, scoringPolicyVersion: input.evaluation.scoringPolicyVersion, weeklyActionPolicyVersion: input.evaluation.weeklyActionPolicyVersion, status: input.evaluation.status as AnalysisStatus, primaryPatternCode: input.evaluation.primaryPattern?.code, supportingPatternCodes: input.evaluation.supportingPatterns.map((pattern) => pattern.code), selectedActionCode: input.evaluation.selectedAction?.code, dataQuality: input.evaluation.dataQuality as AnalysisDataQuality, domainScores: json(input.evaluation.domainScores), limitations: input.evaluation.limitations, ruleVersions: [...new Set(input.evaluation.ruleEvaluations.map((rule) => rule.ruleVersion))], inputSignature: input.inputSignature, generatedAt, ruleEvaluations: { create: input.evaluation.ruleEvaluations.map((evaluation) => ({ ruleDefinitionId: ruleRows.find((row) => row.ruleId === evaluation.ruleId && row.version === evaluation.ruleVersion)!.id, ruleId: evaluation.ruleId, ruleVersion: evaluation.ruleVersion, domain: evaluation.domain as PatternDomain, matched: evaluation.matched, contribution: evaluation.contribution, observedValues: json(evaluation.observedValues), reasonCodes: evaluation.reasonCodes, evidenceRefs: evaluation.evidenceRefs, limitations: evaluation.limitations })) } }, include: decisionInclude });
        const patternMap = await tx.patternMap.create({ data: { profileId: input.profileId, baselineSessionId: input.baselineId, featureSnapshotId: input.snapshot.id, decisionRecordId: decision.id, status: input.evaluation.status as PatternMapStatus, primaryPattern: input.evaluation.primaryPattern ? json(input.evaluation.primaryPattern) : Prisma.JsonNull, supportingPatterns: json(input.evaluation.supportingPatterns), domains: json(input.evaluation.domainScores), dataQuality: input.evaluation.dataQuality as AnalysisDataQuality, limitations: input.evaluation.limitations, generatedAt, version } });
        let assignmentId: string | undefined;
        if (actionRow && input.evaluation.selectedAction && input.evaluation.primaryPattern) {
          const assignment = await tx.weeklyActionAssignment.create({ data: { profileId: input.profileId, patternMapId: patternMap.id, actionDefinitionId: actionRow.id, assignedAt: generatedAt, weekStart: dateOnly(input.weekStart), weekEnd: dateOnly(addCalendarDays(input.weekStart, input.evaluation.selectedAction.durationDays - 1)), targetCount: input.evaluation.selectedAction.targetCount, reasonCodes: input.evaluation.actionReasonCodes, alternatives: json(input.evaluation.actionAlternatives.map((action) => ({ code: action.code, title: action.title }))), selectionVersion: input.evaluation.weeklyActionPolicyVersion, why: `Action ini dipilih karena ${input.evaluation.primaryPattern.label.toLocaleLowerCase('id-ID')} menjadi pola utama dengan kualitas data ${input.evaluation.primaryPattern.dataQuality.toLocaleLowerCase('id-ID')}.` } });
          assignmentId = assignment.id;
        }
        return { decisionId: decision.id, patternMapId: patternMap.id, assignmentId };
      });
      const [decision, patternMap, weeklyAction] = await Promise.all([
        prisma.decisionRecord.findUniqueOrThrow({ where: { id: created.decisionId }, include: decisionInclude }),
        prisma.patternMap.findUniqueOrThrow({ where: { id: created.patternMapId }, include: patternInclude }),
        created.assignmentId ? fetchAssignment(input.profileId, created.assignmentId) : Promise.resolve(null),
      ]);
      return { featureSnapshot: input.snapshot, decision: decisionRecord(decision), patternMap: patternRecord(patternMap as unknown as PatternPayload), ...(weeklyAction ? { weeklyAction } : {}), reused: false };
    },
    async getCurrentPatternMap(profileId) {
      const value = await prisma.patternMap.findFirst({ where: { profileId, status: { in: [PatternMapStatus.READY, PatternMapStatus.PARTIAL, PatternMapStatus.INSUFFICIENT_DATA, PatternMapStatus.ACKNOWLEDGED] } }, include: patternInclude, orderBy: { generatedAt: 'desc' } });
      return value ? patternRecord(value as unknown as PatternPayload) : null;
    },
    async getPatternMap(profileId, id) { return fetchPattern(profileId, id); },
    async getDecision(profileId, id) { const value = await prisma.decisionRecord.findFirst({ where: { id, profileId }, include: decisionInclude }); return value ? decisionRecord(value) : null; },
    async savePatternFeedback(profileId, patternMapId, value, notes) {
      const pattern = await prisma.patternMap.findFirst({ where: { id: patternMapId, profileId } });
      if (!pattern) throw new NotFoundError('Pattern Map tidak ditemukan.');
      await prisma.$transaction([prisma.patternMapFeedback.create({ data: { patternMapId, profileId, value: value as DbPatternMapFeedbackValue, notes } }), prisma.patternMap.update({ where: { id: patternMapId }, data: { status: PatternMapStatus.ACKNOWLEDGED, acknowledgedAt: new Date() } })]);
      return (await fetchPattern(profileId, patternMapId))!;
    },
    async getCurrentWeeklyAction(profileId) {
      const value = await prisma.weeklyActionAssignment.findFirst({ where: { profileId, patternMap: { status: { in: [PatternMapStatus.READY, PatternMapStatus.PARTIAL, PatternMapStatus.ACKNOWLEDGED] } } }, include: { actionDefinition: true, checkIns: { orderBy: { localDate: 'asc' } } }, orderBy: { assignedAt: 'desc' } });
      return value ? assignmentRecord(value as unknown as AssignmentPayload) : null;
    },
    async getWeeklyAction(profileId, assignmentId) { return fetchAssignment(profileId, assignmentId); },
    async listWeeklyActions(profileId) { return (await prisma.weeklyActionAssignment.findMany({ where: { profileId }, include: { actionDefinition: true, checkIns: { orderBy: { localDate: 'asc' } } }, orderBy: { assignedAt: 'desc' } })).map((value) => assignmentRecord(value as unknown as AssignmentPayload)); },
    async addWeeklyActionCheckIn(profileId, assignmentId, localDate, source, evidenceRef) {
      const assignment = await prisma.weeklyActionAssignment.findFirst({ where: { id: assignmentId, profileId }, include: { patternMap: true } });
      if (!assignment) throw new NotFoundError('Weekly Action tidak ditemukan.');
      if (assignment.patternMap.status === PatternMapStatus.SUPERSEDED || (assignment.status !== WeeklyActionAssignmentStatus.ACTIVE && assignment.status !== WeeklyActionAssignmentStatus.COMPLETED)) throw new ConflictError('ACTION_NOT_ELIGIBLE');
      const date = dateOnly(localDate); if (date < assignment.weekStart || date > assignment.weekEnd) throw new ConflictError('Tanggal check-in berada di luar minggu action.');
      await prisma.weeklyActionCheckIn.upsert({ where: { assignmentId_localDate: { assignmentId, localDate: date } }, update: { source: source as WeeklyActionCompletionSource, evidenceRef }, create: { assignmentId, localDate: date, source: source as WeeklyActionCompletionSource, evidenceRef } });
      const progress = await prisma.weeklyActionCheckIn.count({ where: { assignmentId } });
      await prisma.weeklyActionAssignment.update({ where: { id: assignmentId }, data: { progress: Math.min(progress, assignment.targetCount), status: progress >= assignment.targetCount ? WeeklyActionAssignmentStatus.COMPLETED : WeeklyActionAssignmentStatus.ACTIVE, completedAt: progress >= assignment.targetCount ? new Date() : null } });
      return (await fetchAssignment(profileId, assignmentId))!;
    },
    async removeWeeklyActionCheckIn(profileId, assignmentId, localDate) {
      const assignment = await prisma.weeklyActionAssignment.findFirst({ where: { id: assignmentId, profileId }, include: { patternMap: true } });
      if (!assignment) throw new NotFoundError('Weekly Action tidak ditemukan.');
      if (assignment.patternMap.status === PatternMapStatus.SUPERSEDED) throw new ConflictError('ACTION_NOT_ELIGIBLE');
      await prisma.weeklyActionCheckIn.deleteMany({ where: { assignmentId, localDate: dateOnly(localDate) } });
      const progress = await prisma.weeklyActionCheckIn.count({ where: { assignmentId } });
      await prisma.weeklyActionAssignment.update({ where: { id: assignmentId }, data: { progress: Math.min(progress, assignment.targetCount), status: WeeklyActionAssignmentStatus.ACTIVE, completedAt: null } });
      return (await fetchAssignment(profileId, assignmentId))!;
    },
    async previousActionCodes(profileId) { return (await prisma.weeklyActionAssignment.findMany({ where: { profileId }, include: { actionDefinition: { select: { code: true } } }, orderBy: { assignedAt: 'desc' }, take: 12 })).map((value) => value.actionDefinition.code); },
    async configurationVersions() {
      const [scoringPolicies, rules, actions] = await Promise.all([prisma.patternScoringPolicy.findMany({ where: { active: true }, orderBy: { version: 'desc' } }), prisma.patternRuleDefinition.findMany({ where: { active: true }, orderBy: [{ domain: 'asc' }, { ruleId: 'asc' }] }), prisma.weeklyActionDefinition.findMany({ where: { active: true }, orderBy: [{ domain: 'asc' }, { code: 'asc' }] })]);
      return { scoringPolicies: scoringPolicies.map((item) => ({ code: item.code, version: item.version, requiresExpertValidation: item.requiresExpertValidation })), rules: rules.map((item) => ({ ruleId: item.ruleId, version: item.version, domain: item.domain, requiresExpertValidation: item.requiresExpertValidation })), actions: actions.map((item) => ({ code: item.code, version: item.version, domain: item.domain, requiresExpertValidation: item.requiresExpertValidation })) };
    },
  };
}
