import {
  addCalendarDays,
  baselineDomains,
  evaluateDailyCompleteness,
  evaluateOverallCompleteness,
  evaluateReadiness,
  type DomainCounts,
} from '@sarira/baseline';
import type {
  ActivityLogRecord,
  BaselineDayRecord,
  BaselineDomain,
  BaselineSessionRecord,
  BodyMeasurementRecord,
  DailyCheckInRecord,
  DailyTaskRecord,
  DigestiveLogRecord,
  MealLogRecord,
  SleepLogRecord,
  StepRecordValue,
} from '@sarira/shared-types';
import type { BaselineRepository } from '../contracts';
import type { SariraPrismaClient } from '../database';
import { ConflictError, NotFoundError } from '../errors';
import type {
  ActivityLog as DbActivityLog,
  BodyMeasurement as DbBodyMeasurement,
  DailyCheckIn as DbDailyCheckIn,
  DailyRecord as DbDailyRecord,
  DailyTaskDefinition as DbDailyTaskDefinition,
  DailyTaskInstance as DbDailyTaskInstance,
  DigestiveLog as DbDigestiveLog,
  MealLog as DbMealLog,
  SleepLog as DbSleepLog,
  StepRecord as DbStepRecord,
} from '../generated/prisma/client';

const activeStatuses = ['ACTIVE', 'DAY_7_REVIEW_AVAILABLE', 'DAY_14_REVIEW_AVAILABLE', 'DATA_INSUFFICIENT', 'PAUSED'] as const;
const definitions: Array<{ id: string; code: BaselineDomain; title: string; sortOrder: number }> = [
  { id: '70000000-0000-4000-8000-000000000001', code: 'checkIn', title: 'Isi Daily Check-in', sortOrder: 1 },
  { id: '70000000-0000-4000-8000-000000000002', code: 'food', title: 'Catat makanan hari ini', sortOrder: 2 },
  { id: '70000000-0000-4000-8000-000000000003', code: 'sleep', title: 'Lengkapi catatan tidur', sortOrder: 3 },
  { id: '70000000-0000-4000-8000-000000000004', code: 'activity', title: 'Catat aktivitas hari ini', sortOrder: 4 },
];

const dateOnly = (value: string) => new Date(`${value}T00:00:00.000Z`);
const isoDate = (value: Date) => value.toISOString().slice(0, 10);
type DbTaskWithRelations = DbDailyTaskInstance & { definition: DbDailyTaskDefinition; dailyRecord: DbDailyRecord };
type DbDayAggregate = DbDailyRecord & {
  checkIn: DbDailyCheckIn | null;
  mealLogs: DbMealLog[];
  sleepLogs: DbSleepLog[];
  activityLogs: DbActivityLog[];
  stepRecord: DbStepRecord | null;
  bodyMeasurements: DbBodyMeasurement[];
  digestiveLogs: DbDigestiveLog[];
  taskInstances: DbTaskWithRelations[];
};

function sessionRecord(value: {
  id: string; profileId: string; status: string; startedAt: Date; startLocalDate: Date; timezone: string; currentDay: number; targetDays: number;
  calendarCompletedAt: Date | null; completedAt: Date | null; readinessStatus: string; completenessScore: number; extensionAllowed: boolean; extensionDays: number; configVersion: string; createdAt: Date; updatedAt: Date;
}): BaselineSessionRecord {
  return { id: value.id, profileId: value.profileId, status: value.status as BaselineSessionRecord['status'], startedAt: value.startedAt.toISOString(), startLocalDate: isoDate(value.startLocalDate), timezone: value.timezone, currentDay: value.currentDay, targetDays: value.targetDays, ...(value.calendarCompletedAt ? { calendarCompletedAt: value.calendarCompletedAt.toISOString() } : {}), ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}), readinessStatus: value.readinessStatus as BaselineSessionRecord['readinessStatus'], completenessScore: value.completenessScore, extensionAllowed: value.extensionAllowed, extensionDays: value.extensionDays, configVersion: value.configVersion, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() };
}

const checkInRecord = (value: DbDailyCheckIn): DailyCheckInRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), mood: value.mood, hunger: value.hunger, fullness: value.fullness, ...(value.energy !== null ? { energy: value.energy } : {}), ...(value.bodyFeeling ? { bodyFeeling: value.bodyFeeling } : {}), barriers: value.barriers, ...(value.notes ? { notes: value.notes } : {}), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const mealRecord = (value: DbMealLog): MealLogRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), mealType: value.mealType, ...(value.eatenAt ? { eatenAt: value.eatenAt.toISOString() } : {}), ...(value.description ? { description: value.description } : {}), source: value.source, skipped: value.skipped, ...(value.sugaryDrinkConsumed !== null ? { sugaryDrinkConsumed: value.sugaryDrinkConsumed } : {}), ...(value.lateMeal !== null ? { lateMeal: value.lateMeal } : {}), ...(value.homeCooked !== null ? { homeCooked: value.homeCooked } : {}), ...(value.eatingContext ? { eatingContext: value.eatingContext } : {}), ...(value.notes ? { notes: value.notes } : {}), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const sleepRecord = (value: DbSleepLog): SleepLogRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), sleepStartedAt: value.sleepStartedAt.toISOString(), wokeUpAt: value.wokeUpAt.toISOString(), durationMinutes: value.durationMinutes, perceivedQuality: value.perceivedQuality, ...(value.nightAwakenings !== null ? { nightAwakenings: value.nightAwakenings } : {}), ...(value.notes ? { notes: value.notes } : {}), source: value.source, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const activityRecord = (value: DbActivityLog): ActivityLogRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), activityType: value.activityType, ...(value.startedAt ? { startedAt: value.startedAt.toISOString() } : {}), durationMinutes: value.durationMinutes, perceivedIntensity: value.perceivedIntensity, ...(value.description ? { description: value.description } : {}), ...(value.notes ? { notes: value.notes } : {}), source: value.source, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const stepRecord = (value: DbStepRecord): StepRecordValue => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), steps: value.steps, source: value.source, ...(value.sourceDevice ? { sourceDevice: value.sourceDevice } : {}), verified: value.verified, createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const bodyRecord = (value: DbBodyMeasurement): BodyMeasurementRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), measuredAt: value.measuredAt.toISOString(), weightKg: Number(value.weightKg), ...(value.waistCm !== null ? { waistCm: Number(value.waistCm) } : {}), source: value.source, ...(value.notes ? { notes: value.notes } : {}), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const digestiveRecord = (value: DbDigestiveLog): DigestiveLogRecord => ({ id: value.id, profileId: value.profileId, baselineSessionId: value.baselineSessionId, dailyRecordId: value.dailyRecordId, localDate: isoDate(value.localDate), symptomType: value.symptomType, occurredAt: value.occurredAt.toISOString(), intensity: value.intensity, ...(value.relatedMealId ? { relatedMealId: value.relatedMealId } : {}), ...(value.notes ? { notes: value.notes } : {}), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() });
const taskRecord = (value: DbTaskWithRelations): DailyTaskRecord => ({ id: value.id, definitionCode: value.definition.code as BaselineDomain, title: value.definition.title, localDate: isoDate(value.dailyRecord.localDate), status: value.status, progress: value.progress, target: value.target, ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}), source: value.source });

export function createPrismaBaselineRepository(prisma: SariraPrismaClient): BaselineRepository {
  const dayInclude = { checkIn: true, mealLogs: { orderBy: { createdAt: 'desc' as const } }, sleepLogs: { orderBy: { createdAt: 'desc' as const } }, activityLogs: { orderBy: { createdAt: 'desc' as const } }, stepRecord: true, bodyMeasurements: { orderBy: { measuredAt: 'desc' as const } }, digestiveLogs: { orderBy: { occurredAt: 'desc' as const } }, taskInstances: { include: { definition: true, dailyRecord: true }, orderBy: { definition: { sortOrder: 'asc' as const } } } } as const;

  async function ensureDefinitions() {
    await Promise.all(definitions.map((item) => prisma.dailyTaskDefinition.upsert({ where: { code_version: { code: item.code, version: 'phase4-dev-v1' } }, update: { title: item.title, domain: item.code, sortOrder: item.sortOrder, active: true }, create: { ...item, version: 'phase4-dev-v1', domain: item.code, minimumRequirement: 1, sortOrder: item.sortOrder } })));
  }

  async function ensureDay(profileId: string, baselineId: string, localDate: string, dayIndex: number) {
    await ensureDefinitions();
    const day = await prisma.dailyRecord.upsert({ where: { baselineSessionId_localDate: { baselineSessionId: baselineId, localDate: dateOnly(localDate) } }, update: {}, create: { profileId, baselineSessionId: baselineId, localDate: dateOnly(localDate), dayIndex } });
    const taskDefinitions = await prisma.dailyTaskDefinition.findMany({ where: { active: true, version: 'phase4-dev-v1' }, orderBy: { sortOrder: 'asc' } });
    await Promise.all(taskDefinitions.map((definition) => prisma.dailyTaskInstance.upsert({ where: { dailyRecordId_definitionId: { dailyRecordId: day.id, definitionId: definition.id } }, update: {}, create: { dailyRecordId: day.id, definitionId: definition.id, target: definition.minimumRequirement } })));
    return day;
  }

  async function syncDay(profileId: string, baselineId: string, localDate: string, dayIndex: number, calculatedAt: string) {
    const day = await ensureDay(profileId, baselineId, localDate, dayIndex);
    const [checkIn, food, sleep, activity] = await Promise.all([
      prisma.dailyCheckIn.count({ where: { dailyRecordId: day.id } }), prisma.mealLog.count({ where: { dailyRecordId: day.id } }), prisma.sleepLog.count({ where: { dailyRecordId: day.id } }), prisma.activityLog.count({ where: { dailyRecordId: day.id } }),
    ]);
    const counts: DomainCounts = { checkIn, food, sleep, activity };
    const completeness = evaluateDailyCompleteness(counts, calculatedAt);
    const taskInstances = await prisma.dailyTaskInstance.findMany({ where: { dailyRecordId: day.id }, include: { definition: true } });
    await Promise.all(taskInstances.map((task) => {
      const progress = counts[task.definition.code as BaselineDomain] ?? 0;
      return prisma.dailyTaskInstance.update({ where: { id: task.id }, data: progress > 0 ? { progress, status: 'COMPLETED', completedAt: task.completedAt ?? new Date(calculatedAt) } : task.status === 'SKIPPED' ? { progress: 0 } : { progress: 0, status: 'PENDING', completedAt: null } });
    }));
    await prisma.$transaction([
      prisma.dailyRecord.update({ where: { id: day.id }, data: { completenessStatus: completeness.status, completedAt: completeness.status === 'COMPLETE' ? new Date(calculatedAt) : null } }),
      prisma.dataCompletenessSnapshot.upsert({ where: { baselineSessionId_scopeKey: { baselineSessionId: baselineId, scopeKey: `DAY:${localDate}` } }, update: { status: completeness.status, score: completeness.score, achievedDomains: completeness.achievedDomains, missingDomains: completeness.missingDomains, domainCoverage: completeness.domainCoverage, completedDays: completeness.completedDays, elapsedDays: completeness.elapsedDays, configVersion: completeness.configVersion, validationStatus: completeness.validationStatus, calculatedAt: new Date(calculatedAt) }, create: { baselineSessionId: baselineId, scope: 'DAILY', scopeKey: `DAY:${localDate}`, localDate: dateOnly(localDate), status: completeness.status, score: completeness.score, achievedDomains: completeness.achievedDomains, missingDomains: completeness.missingDomains, domainCoverage: completeness.domainCoverage, completedDays: completeness.completedDays, elapsedDays: completeness.elapsedDays, configVersion: completeness.configVersion, validationStatus: completeness.validationStatus, calculatedAt: new Date(calculatedAt) } }),
    ]);
    return completeness;
  }

  async function mapDay(value: DbDayAggregate, state?: BaselineDayRecord['state']): Promise<BaselineDayRecord> {
    const daily = await prisma.dataCompletenessSnapshot.findUnique({ where: { baselineSessionId_scopeKey: { baselineSessionId: value.baselineSessionId, scopeKey: `DAY:${isoDate(value.localDate)}` } } });
    return { id: value.id, localDate: isoDate(value.localDate), dayIndex: value.dayIndex, state: state ?? value.completenessStatus, completenessStatus: value.completenessStatus, ...(value.completedAt ? { completedAt: value.completedAt.toISOString() } : {}), categoryCount: daily?.achievedDomains.length ?? 0, tasks: value.taskInstances.map(taskRecord), ...(value.checkIn ? { checkIn: checkInRecord(value.checkIn) } : {}), mealLogs: value.mealLogs.map(mealRecord), sleepLogs: value.sleepLogs.map(sleepRecord), activityLogs: value.activityLogs.map(activityRecord), ...(value.stepRecord ? { stepRecord: stepRecord(value.stepRecord) } : {}), bodyMeasurements: value.bodyMeasurements.map(bodyRecord), digestiveLogs: value.digestiveLogs.map(digestiveRecord) };
  }

  async function ownedSession(profileId: string, baselineId: string) {
    const value = await prisma.baselineSession.findFirst({ where: { id: baselineId, profileId } });
    if (!value) throw new NotFoundError('Baseline tidak ditemukan.');
    return value;
  }

  async function findOwned(model: 'mealLog' | 'sleepLog' | 'activityLog' | 'digestiveLog', profileId: string, baselineId: string, id: string) {
    const value = model === 'mealLog'
      ? await prisma.mealLog.findFirst({ where: { id, profileId, baselineSessionId: baselineId } })
      : model === 'sleepLog'
        ? await prisma.sleepLog.findFirst({ where: { id, profileId, baselineSessionId: baselineId } })
        : model === 'activityLog'
          ? await prisma.activityLog.findFirst({ where: { id, profileId, baselineSessionId: baselineId } })
          : await prisma.digestiveLog.findFirst({ where: { id, profileId, baselineSessionId: baselineId } });
    if (!value) throw new NotFoundError('Catatan tidak ditemukan.');
    return value;
  }

  const repository: BaselineRepository = {
    async getCurrent(profileId) { const value = await prisma.baselineSession.findFirst({ where: { profileId, status: { in: [...activeStatuses] } }, orderBy: { startedAt: 'desc' } }); return value ? sessionRecord(value) : null; },
    async getLatestForAnalysis(profileId) { const value = await prisma.baselineSession.findFirst({ where: { profileId }, orderBy: { startedAt: 'desc' } }); return value ? sessionRecord(value) : null; },
    async getById(profileId, baselineId) { const value = await prisma.baselineSession.findFirst({ where: { id: baselineId, profileId } }); return value ? sessionRecord(value) : null; },
    async getOwnerProfileId(baselineId) { return (await prisma.baselineSession.findUnique({ where: { id: baselineId }, select: { profileId: true } }))?.profileId ?? null; },
    async create(profileId, input) {
      if (await repository.getCurrent(profileId)) throw new ConflictError('Profil sudah memiliki baseline aktif.');
      try { return sessionRecord(await prisma.baselineSession.create({ data: { profileId, startedAt: new Date(input.startedAt), startLocalDate: dateOnly(input.startLocalDate), timezone: input.timezone, targetDays: input.targetDays, extensionAllowed: input.extensionAllowed, extensionDays: input.extensionDays, configVersion: input.configVersion } })); }
      catch (error) { if (String(error).includes('Unique constraint')) throw new ConflictError('Profil sudah memiliki baseline aktif.'); throw error; }
    },
    async refresh(baselineId, input) { const value = await prisma.baselineSession.update({ where: { id: baselineId }, data: { currentDay: input.currentDay, status: input.status, ...(input.calendarCompletedAt ? { calendarCompletedAt: new Date(input.calendarCompletedAt) } : {}), ...(input.readinessStatus ? { readinessStatus: input.readinessStatus } : {}), ...(input.completenessScore !== undefined ? { completenessScore: input.completenessScore } : {}) } }); return sessionRecord(value); },
    async complete(profileId, baselineId, completedAt) { const current = await ownedSession(profileId, baselineId); if (current.readinessStatus !== 'READY') throw new ConflictError('Baseline hanya dapat ditutup setelah readiness READY.'); return sessionRecord(await prisma.baselineSession.update({ where: { id: baselineId }, data: { status: 'COMPLETED', completedAt: new Date(completedAt) } })); },
    async listDays(profileId, baselineId, throughDay, calculatedAt) {
      const baseline = await ownedSession(profileId, baselineId); const values = await prisma.dailyRecord.findMany({ where: { baselineSessionId: baselineId, profileId }, include: dayInclude, orderBy: { dayIndex: 'asc' } }); const byDate = new Map(values.map((value) => [isoDate(value.localDate), value]));
      return Promise.all(Array.from({ length: baseline.targetDays }, async (_, index) => { const localDate = addCalendarDays(isoDate(baseline.startLocalDate), index); const value = byDate.get(localDate); const state = index + 1 === throughDay ? 'TODAY' : index + 1 > throughDay ? 'UPCOMING' : value?.completenessStatus ?? 'MISSING'; if (value) { await syncDay(profileId, baselineId, localDate, index + 1, calculatedAt); const refreshed = await prisma.dailyRecord.findUnique({ where: { id: value.id }, include: dayInclude }); return mapDay(refreshed!, state); } return { localDate, dayIndex: index + 1, state, completenessStatus: 'MISSING', categoryCount: 0, tasks: definitions.map((definition) => ({ id: `virtual:${baselineId}:${localDate}:${definition.code}`, definitionCode: definition.code, title: definition.title, localDate, status: 'PENDING', progress: 0, target: 1, source: 'SYSTEM' })), mealLogs: [], sleepLogs: [], activityLogs: [], bodyMeasurements: [], digestiveLogs: [] }; }));
    },
    async getDay(profileId, baselineId, localDate, dayIndex, calculatedAt) { await ownedSession(profileId, baselineId); await syncDay(profileId, baselineId, localDate, dayIndex, calculatedAt); return mapDay((await prisma.dailyRecord.findUnique({ where: { baselineSessionId_localDate: { baselineSessionId: baselineId, localDate: dateOnly(localDate) } }, include: dayInclude }))!); },
    async getCheckIn(profileId, baselineId, localDate) { const value = await prisma.dailyCheckIn.findFirst({ where: { profileId, baselineSessionId: baselineId, localDate: dateOnly(localDate) } }); return value ? checkInRecord(value) : null; },
    async putCheckIn(profileId, baselineId, localDate, dayIndex, input, calculatedAt) { const day = await ensureDay(profileId, baselineId, localDate, dayIndex); const value = await prisma.dailyCheckIn.upsert({ where: { dailyRecordId: day.id }, update: { ...input }, create: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(localDate), ...input } }); await syncDay(profileId, baselineId, localDate, dayIndex, calculatedAt); return checkInRecord(value); },
    async listMeals(profileId, baselineId, localDate) { return (await prisma.mealLog.findMany({ where: { profileId, baselineSessionId: baselineId, ...(localDate ? { localDate: dateOnly(localDate) } : {}) }, orderBy: [{ localDate: 'desc' }, { createdAt: 'desc' }] })).map(mealRecord); },
    async getMealById(profileId, baselineId, mealId) { const value = await prisma.mealLog.findFirst({ where: { id: mealId, profileId, baselineSessionId: baselineId } }); return value ? mealRecord(value) : null; },
    async createMeal(profileId, baselineId, dayIndex, input, calculatedAt) { const day = await ensureDay(profileId, baselineId, input.localDate, dayIndex); const value = await prisma.mealLog.create({ data: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(input.localDate), mealType: input.mealType, eatenAt: input.eatenAt ? new Date(input.eatenAt) : null, description: input.description, skipped: input.skipped, sugaryDrinkConsumed: input.sugaryDrinkConsumed, lateMeal: input.lateMeal, homeCooked: input.homeCooked, eatingContext: input.eatingContext, notes: input.notes, source: 'MANUAL' } }); await syncDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); return mealRecord(value); },
    async updateMeal(profileId, baselineId, id, input, calculatedAt) { const current = await findOwned('mealLog', profileId, baselineId, id); if (input.localDate && input.localDate !== isoDate(current.localDate)) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); const value = await prisma.mealLog.update({ where: { id }, data: { mealType: input.mealType, eatenAt: input.eatenAt ? new Date(input.eatenAt) : undefined, description: input.description, skipped: input.skipped, sugaryDrinkConsumed: input.sugaryDrinkConsumed, lateMeal: input.lateMeal, homeCooked: input.homeCooked, eatingContext: input.eatingContext, notes: input.notes } }); await syncDay(profileId, baselineId, isoDate(current.localDate), current.dailyRecordId ? (await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }))!.dayIndex : 1, calculatedAt); return mealRecord(value); },
    async deleteMeal(profileId, baselineId, id, calculatedAt) { const current = await findOwned('mealLog', profileId, baselineId, id); const day = await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }); await prisma.mealLog.delete({ where: { id } }); await syncDay(profileId, baselineId, isoDate(current.localDate), day!.dayIndex, calculatedAt); },
    async listSleep(profileId, baselineId, localDate) { return (await prisma.sleepLog.findMany({ where: { profileId, baselineSessionId: baselineId, ...(localDate ? { localDate: dateOnly(localDate) } : {}) }, orderBy: [{ localDate: 'desc' }, { createdAt: 'desc' }] })).map(sleepRecord); },
    async createSleep(profileId, baselineId, dayIndex, input, calculatedAt) { const day = await ensureDay(profileId, baselineId, input.localDate, dayIndex); const value = await prisma.sleepLog.create({ data: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(input.localDate), sleepStartedAt: new Date(input.sleepStartedAt), wokeUpAt: new Date(input.wokeUpAt), durationMinutes: input.durationMinutes, perceivedQuality: input.perceivedQuality, nightAwakenings: input.nightAwakenings, notes: input.notes, source: 'MANUAL' } }); await syncDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); return sleepRecord(value); },
    async updateSleep(profileId, baselineId, id, input, calculatedAt) { const current = await findOwned('sleepLog', profileId, baselineId, id); if (input.localDate && input.localDate !== isoDate(current.localDate)) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); const value = await prisma.sleepLog.update({ where: { id }, data: { sleepStartedAt: input.sleepStartedAt ? new Date(input.sleepStartedAt) : undefined, wokeUpAt: input.wokeUpAt ? new Date(input.wokeUpAt) : undefined, durationMinutes: input.durationMinutes, perceivedQuality: input.perceivedQuality, nightAwakenings: input.nightAwakenings, notes: input.notes } }); const day = await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }); await syncDay(profileId, baselineId, isoDate(current.localDate), day!.dayIndex, calculatedAt); return sleepRecord(value); },
    async deleteSleep(profileId, baselineId, id, calculatedAt) { const current = await findOwned('sleepLog', profileId, baselineId, id); const day = await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }); await prisma.sleepLog.delete({ where: { id } }); await syncDay(profileId, baselineId, isoDate(current.localDate), day!.dayIndex, calculatedAt); },
    async listActivity(profileId, baselineId, localDate) { return (await prisma.activityLog.findMany({ where: { profileId, baselineSessionId: baselineId, ...(localDate ? { localDate: dateOnly(localDate) } : {}) }, orderBy: [{ localDate: 'desc' }, { createdAt: 'desc' }] })).map(activityRecord); },
    async createActivity(profileId, baselineId, dayIndex, input, calculatedAt) { const day = await ensureDay(profileId, baselineId, input.localDate, dayIndex); const value = await prisma.activityLog.create({ data: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(input.localDate), activityType: input.activityType, startedAt: input.startedAt ? new Date(input.startedAt) : null, durationMinutes: input.durationMinutes, perceivedIntensity: input.perceivedIntensity, description: input.description, notes: input.notes, source: 'MANUAL' } }); await syncDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); return activityRecord(value); },
    async updateActivity(profileId, baselineId, id, input, calculatedAt) { const current = await findOwned('activityLog', profileId, baselineId, id); if (input.localDate && input.localDate !== isoDate(current.localDate)) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); const value = await prisma.activityLog.update({ where: { id }, data: { activityType: input.activityType, startedAt: input.startedAt ? new Date(input.startedAt) : undefined, durationMinutes: input.durationMinutes, perceivedIntensity: input.perceivedIntensity, description: input.description, notes: input.notes } }); const day = await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }); await syncDay(profileId, baselineId, isoDate(current.localDate), day!.dayIndex, calculatedAt); return activityRecord(value); },
    async deleteActivity(profileId, baselineId, id, calculatedAt) { const current = await findOwned('activityLog', profileId, baselineId, id); const day = await prisma.dailyRecord.findUnique({ where: { id: current.dailyRecordId } }); await prisma.activityLog.delete({ where: { id } }); await syncDay(profileId, baselineId, isoDate(current.localDate), day!.dayIndex, calculatedAt); },
    async listSteps(profileId, baselineId) { return (await prisma.stepRecord.findMany({ where: { profileId, baselineSessionId: baselineId }, orderBy: { localDate: 'desc' } })).map(stepRecord); },
    async putSteps(profileId, baselineId, localDate, dayIndex, input) { const day = await ensureDay(profileId, baselineId, localDate, dayIndex); return stepRecord(await prisma.stepRecord.upsert({ where: { dailyRecordId: day.id }, update: { steps: input.steps, sourceDevice: input.sourceDevice, source: 'MANUAL', verified: false }, create: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(localDate), steps: input.steps, sourceDevice: input.sourceDevice, source: 'MANUAL', verified: false } })); },
    async listBody(profileId, baselineId) { return (await prisma.bodyMeasurement.findMany({ where: { profileId, baselineSessionId: baselineId }, orderBy: { measuredAt: 'desc' } })).map(bodyRecord); },
    async createBody(profileId, baselineId, dayIndex, input) { const day = await ensureDay(profileId, baselineId, input.localDate, dayIndex); return bodyRecord(await prisma.bodyMeasurement.create({ data: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(input.localDate), measuredAt: new Date(input.measuredAt), weightKg: input.weightKg, waistCm: input.waistCm, notes: input.notes, source: 'MANUAL' } })); },
    async listDigestive(profileId, baselineId, localDate) { return (await prisma.digestiveLog.findMany({ where: { profileId, baselineSessionId: baselineId, ...(localDate ? { localDate: dateOnly(localDate) } : {}) }, orderBy: [{ localDate: 'desc' }, { occurredAt: 'desc' }] })).map(digestiveRecord); },
    async createDigestive(profileId, baselineId, dayIndex, input) { if (input.relatedMealId && !(await prisma.mealLog.findFirst({ where: { id: input.relatedMealId, profileId, baselineSessionId: baselineId } }))) throw new NotFoundError('Meal terkait tidak ditemukan.'); const day = await ensureDay(profileId, baselineId, input.localDate, dayIndex); return digestiveRecord(await prisma.digestiveLog.create({ data: { profileId, baselineSessionId: baselineId, dailyRecordId: day.id, localDate: dateOnly(input.localDate), symptomType: input.symptomType, occurredAt: new Date(input.occurredAt), intensity: input.intensity, relatedMealId: input.relatedMealId, notes: input.notes } })); },
    async updateDigestive(profileId, baselineId, id, input) { const current = await findOwned('digestiveLog', profileId, baselineId, id); if (input.localDate && input.localDate !== isoDate(current.localDate)) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); if (input.relatedMealId && !(await prisma.mealLog.findFirst({ where: { id: input.relatedMealId, profileId, baselineSessionId: baselineId } }))) throw new NotFoundError('Meal terkait tidak ditemukan.'); return digestiveRecord(await prisma.digestiveLog.update({ where: { id }, data: { symptomType: input.symptomType, occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined, intensity: input.intensity, relatedMealId: input.relatedMealId, notes: input.notes } })); },
    async deleteDigestive(profileId, baselineId, id) { await findOwned('digestiveLog', profileId, baselineId, id); await prisma.digestiveLog.delete({ where: { id } }); },
    async getTasks(profileId, baselineId, localDate, dayIndex, calculatedAt) { await syncDay(profileId, baselineId, localDate, dayIndex, calculatedAt); return (await prisma.dailyTaskInstance.findMany({ where: { dailyRecord: { profileId, baselineSessionId: baselineId, localDate: dateOnly(localDate) } }, include: { definition: true, dailyRecord: true }, orderBy: { definition: { sortOrder: 'asc' } } })).map(taskRecord); },
    async updateTask(profileId, baselineId, id, status, calculatedAt) { const current = await prisma.dailyTaskInstance.findFirst({ where: { id, dailyRecord: { profileId, baselineSessionId: baselineId } }, include: { definition: true, dailyRecord: true } }); if (!current) throw new NotFoundError('Tugas tidak ditemukan.'); return taskRecord(await prisma.dailyTaskInstance.update({ where: { id }, data: { status, source: 'USER', completedAt: status === 'COMPLETED' ? new Date(calculatedAt) : null }, include: { definition: true, dailyRecord: true } })); },
    async getCompleteness(profileId, baselineId, throughDay, localDate, calculatedAt) {
      const baseline = await ownedSession(profileId, baselineId);
      if (localDate) { const dayIndex = Math.max(1, Math.floor((dateOnly(localDate).getTime() - baseline.startLocalDate.getTime()) / 86_400_000) + 1); const result = await syncDay(profileId, baselineId, localDate, dayIndex, calculatedAt); return { ...result, localDate }; }
      const dates = Array.from({ length: Math.min(throughDay, baseline.targetDays) }, (_, index) => addCalendarDays(isoDate(baseline.startLocalDate), index));
      const values = await prisma.dailyRecord.findMany({ where: { baselineSessionId: baselineId, localDate: { in: dates.map(dateOnly) } }, include: { _count: { select: { mealLogs: true, sleepLogs: true, activityLogs: true } }, checkIn: { select: { id: true } } } });
      const countsByDate = new Map(values.map((value) => [isoDate(value.localDate), { checkIn: value.checkIn ? 1 : 0, food: value._count.mealLogs, sleep: value._count.sleepLogs, activity: value._count.activityLogs }]));
      const result = evaluateOverallCompleteness(dates.map((date) => countsByDate.get(date) ?? { checkIn: 0, food: 0, sleep: 0, activity: 0 }), throughDay, calculatedAt);
      await prisma.dataCompletenessSnapshot.upsert({ where: { baselineSessionId_scopeKey: { baselineSessionId: baselineId, scopeKey: 'OVERALL' } }, update: { status: result.status, score: result.score, achievedDomains: result.achievedDomains, missingDomains: result.missingDomains, domainCoverage: result.domainCoverage, completedDays: result.completedDays, elapsedDays: result.elapsedDays, configVersion: result.configVersion, validationStatus: result.validationStatus, calculatedAt: new Date(calculatedAt) }, create: { baselineSessionId: baselineId, scope: 'OVERALL', scopeKey: 'OVERALL', status: result.status, score: result.score, achievedDomains: result.achievedDomains, missingDomains: result.missingDomains, domainCoverage: result.domainCoverage, completedDays: result.completedDays, elapsedDays: result.elapsedDays, configVersion: result.configVersion, validationStatus: result.validationStatus, calculatedAt: new Date(calculatedAt) } });
      return result;
    },
    async getDay7Checkpoint(profileId, baselineId, calculatedAt) { const baseline = await ownedSession(profileId, baselineId); const existing = await prisma.day7Checkpoint.findUnique({ where: { baselineSessionId: baselineId } }); if (existing) return { id: existing.id, baselineSessionId: baselineId, generatedAt: existing.generatedAt.toISOString(), observedDays: existing.observedDays, daysWithData: existing.daysWithData, domainCoverage: existing.domainCoverage as unknown as Record<BaselineDomain, number>, missingDomains: existing.missingDomains as BaselineDomain[], observations: existing.observations, disclaimer: existing.disclaimer }; const overall = await repository.getCompleteness(profileId, baselineId, Math.min(7, baseline.currentDay), undefined, calculatedAt); const observations = baselineDomains.map((domain) => `${definitions.find((item) => item.code === domain)!.title} tersedia pada ${Math.round(overall.domainCoverage[domain] * overall.elapsedDays)} dari ${overall.elapsedDays} hari.`); const created = await prisma.day7Checkpoint.create({ data: { baselineSessionId: baselineId, generatedAt: new Date(calculatedAt), observedDays: 7, daysWithData: await prisma.dailyRecord.count({ where: { baselineSessionId: baselineId, dayIndex: { lte: 7 }, completenessStatus: { not: 'MISSING' } } }), domainCoverage: overall.domainCoverage, missingDomains: overall.missingDomains, observations, disclaimer: 'Ringkasan ini bersifat deskriptif tentang catatan yang tersedia, bukan diagnosis atau kesimpulan sebab-akibat.' } }); return { id: created.id, baselineSessionId: baselineId, generatedAt: created.generatedAt.toISOString(), observedDays: created.observedDays, daysWithData: created.daysWithData, domainCoverage: created.domainCoverage as unknown as Record<BaselineDomain, number>, missingDomains: created.missingDomains as BaselineDomain[], observations: created.observations, disclaimer: created.disclaimer }; },
    async saveDay7Feedback(profileId, baselineId, input, calculatedAt) { void calculatedAt; await ownedSession(profileId, baselineId); const value = await prisma.day7Feedback.upsert({ where: { baselineSessionId: baselineId }, update: { ...input }, create: { baselineSessionId: baselineId, ...input } }); return { id: value.id, baselineSessionId: baselineId, easeRating: value.easeRating, hardestDomains: value.hardestDomains as BaselineDomain[], wantsToContinue: value.wantsToContinue, ...(value.notes ? { notes: value.notes } : {}), createdAt: value.createdAt.toISOString(), updatedAt: value.updatedAt.toISOString() }; },
    async getReadiness(profileId, baselineId, throughDay, calculatedAt) { await ownedSession(profileId, baselineId); const overall = await repository.getCompleteness(profileId, baselineId, throughDay, undefined, calculatedAt); const result = evaluateReadiness(overall, throughDay, baselineId, calculatedAt); if (!result) throw new ConflictError('Readiness tersedia setelah hari ke-14.'); const value = await prisma.baselineReadinessResult.upsert({ where: { baselineSessionId: baselineId }, update: { status: result.status, domainCoverage: result.domainCoverage, missingDomains: result.missingDomains, totalDays: result.totalDays, completedDays: result.completedDays, completenessScore: result.completenessScore, reasonCodes: result.reasonCodes, recommendation: result.recommendation, configVersion: result.configVersion, evaluatedAt: new Date(calculatedAt) }, create: { baselineSessionId: baselineId, status: result.status, domainCoverage: result.domainCoverage, missingDomains: result.missingDomains, totalDays: result.totalDays, completedDays: result.completedDays, completenessScore: result.completenessScore, reasonCodes: result.reasonCodes, recommendation: result.recommendation, configVersion: result.configVersion, evaluatedAt: new Date(calculatedAt) } }); await prisma.baselineSession.update({ where: { id: baselineId }, data: { readinessStatus: result.status, completenessScore: result.completenessScore, status: result.status === 'INSUFFICIENT_DATA' ? 'DATA_INSUFFICIENT' : 'DAY_14_REVIEW_AVAILABLE', calendarCompletedAt: new Date(calculatedAt) } }); return { id: value.id, baselineSessionId: baselineId, status: value.status as 'READY' | 'PARTIALLY_READY' | 'INSUFFICIENT_DATA', domainCoverage: value.domainCoverage as unknown as Record<BaselineDomain, number>, missingDomains: value.missingDomains as BaselineDomain[], totalDays: value.totalDays, completedDays: value.completedDays, completenessScore: value.completenessScore, reasonCodes: value.reasonCodes, recommendation: value.recommendation, configVersion: value.configVersion, evaluatedAt: value.evaluatedAt.toISOString() }; },
  };
  return repository;
}
