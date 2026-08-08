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
  DailyTaskRecord,
  Day7CheckpointRecord,
  Day7FeedbackRecord,
  DigestiveLogRecord,
  MealLogRecord,
  SleepLogRecord,
} from '@sarira/shared-types';
import type { BaselineRepository } from '../contracts';
import { ConflictError, NotFoundError } from '../errors';

const taskTitles: Record<BaselineDomain, string> = {
  checkIn: 'Isi Daily Check-in',
  food: 'Catat makanan hari ini',
  sleep: 'Lengkapi catatan tidur',
  activity: 'Catat aktivitas hari ini',
};

function id() { return crypto.randomUUID(); }
function emptyCounts(): DomainCounts { return { checkIn: 0, food: 0, sleep: 0, activity: 0 }; }

export function createMemoryBaselineRepository(): BaselineRepository {
  const sessions: BaselineSessionRecord[] = [];
  const days = new Map<string, BaselineDayRecord>();
  const feedback = new Map<string, Day7FeedbackRecord>();
  const checkpoints = new Map<string, Day7CheckpointRecord>();
  const readiness = new Map<string, ReturnType<typeof evaluateReadiness> & { id: string }>();
  const dayKey = (baselineId: string, localDate: string) => `${baselineId}:${localDate}`;

  function session(profileId: string, baselineId: string) {
    const value = sessions.find((item) => item.id === baselineId && item.profileId === profileId);
    if (!value) throw new NotFoundError('Baseline tidak ditemukan.');
    return value;
  }

  function counts(day?: BaselineDayRecord): DomainCounts {
    if (!day) return emptyCounts();
    return { checkIn: day.checkIn ? 1 : 0, food: day.mealLogs.length, sleep: day.sleepLogs.length, activity: day.activityLogs.length };
  }

  function defaultTasks(localDate: string): DailyTaskRecord[] {
    return baselineDomains.map((domain) => ({ id: id(), definitionCode: domain, title: taskTitles[domain], localDate, status: 'PENDING', progress: 0, target: 1, source: 'SYSTEM' }));
  }

  function ensureDay(profileId: string, baselineId: string, localDate: string, dayIndex: number, calculatedAt: string) {
    session(profileId, baselineId);
    const key = dayKey(baselineId, localDate);
    let day = days.get(key);
    if (!day) {
      day = { id: id(), localDate, dayIndex, state: 'MISSING', completenessStatus: 'MISSING', categoryCount: 0, tasks: defaultTasks(localDate), mealLogs: [], sleepLogs: [], activityLogs: [], bodyMeasurements: [], digestiveLogs: [] };
      days.set(key, day);
    }
    sync(day, calculatedAt);
    return day;
  }

  function sync(day: BaselineDayRecord, calculatedAt: string) {
    const result = evaluateDailyCompleteness(counts(day), calculatedAt);
    day.completenessStatus = result.status;
    day.state = result.status;
    day.categoryCount = result.achievedDomains.length;
    day.completedAt = result.status === 'COMPLETE' ? calculatedAt : undefined;
    day.tasks = day.tasks.map((task) => {
      const progress = counts(day)[task.definitionCode];
      if (progress > 0) return { ...task, progress, status: 'COMPLETED', completedAt: task.completedAt ?? calculatedAt };
      if (task.status === 'SKIPPED') return { ...task, progress: 0 };
      return { ...task, progress: 0, status: 'PENDING', completedAt: undefined };
    });
  }

  function allLogs<T extends { baselineSessionId: string; profileId: string; localDate: string }>(selector: (day: BaselineDayRecord) => T[], profileId: string, baselineId: string, localDate?: string) {
    return [...days.values()].filter((day) => !localDate || day.localDate === localDate).flatMap(selector).filter((item) => item.profileId === profileId && item.baselineSessionId === baselineId).sort((a, b) => b.localDate.localeCompare(a.localDate));
  }

  function findLog<T extends { id: string; profileId: string; baselineSessionId: string }>(items: T[], profileId: string, baselineId: string, logId: string) {
    const item = items.find((value) => value.id === logId && value.profileId === profileId && value.baselineSessionId === baselineId);
    if (!item) throw new NotFoundError('Catatan tidak ditemukan.');
    return item;
  }

  return {
    async getCurrent(profileId) {
      return sessions.find((item) => item.profileId === profileId && ['ACTIVE', 'DAY_7_REVIEW_AVAILABLE', 'DAY_14_REVIEW_AVAILABLE', 'DATA_INSUFFICIENT', 'PAUSED'].includes(item.status)) ?? null;
    },
    async getById(profileId, baselineId) { return sessions.find((item) => item.profileId === profileId && item.id === baselineId) ?? null; },
    async getOwnerProfileId(baselineId) { return sessions.find((item) => item.id === baselineId)?.profileId ?? null; },
    async create(profileId, input) {
      const current = await this.getCurrent(profileId);
      if (current) throw new ConflictError('Profil sudah memiliki baseline aktif.');
      const value: BaselineSessionRecord = { id: id(), profileId, status: 'ACTIVE', ...input, currentDay: 1, readinessStatus: 'PENDING', completenessScore: 0, createdAt: input.startedAt, updatedAt: input.startedAt };
      sessions.push(value);
      ensureDay(profileId, value.id, value.startLocalDate, 1, input.startedAt);
      return value;
    },
    async refresh(baselineId, input) {
      const value = sessions.find((item) => item.id === baselineId);
      if (!value) throw new NotFoundError('Baseline tidak ditemukan.');
      Object.assign(value, input, { updatedAt: input.calendarCompletedAt ?? new Date().toISOString() });
      return value;
    },
    async complete(profileId, baselineId, completedAt) {
      const value = session(profileId, baselineId);
      if (value.readinessStatus !== 'READY') throw new ConflictError('Baseline hanya dapat ditutup setelah readiness READY.');
      Object.assign(value, { status: 'COMPLETED', completedAt, updatedAt: completedAt });
      return value;
    },
    async listDays(profileId, baselineId, throughDay, calculatedAt) {
      const value = session(profileId, baselineId);
      const result: BaselineDayRecord[] = Array.from({ length: value.targetDays }, (_, index): BaselineDayRecord => {
        const localDate = addCalendarDays(value.startLocalDate, index);
        const existing = days.get(dayKey(baselineId, localDate));
        if (existing) sync(existing, calculatedAt);
        return existing ?? { localDate, dayIndex: index + 1, state: index + 1 > throughDay ? 'UPCOMING' : 'MISSING', completenessStatus: 'MISSING', categoryCount: 0, tasks: defaultTasks(localDate), mealLogs: [], sleepLogs: [], activityLogs: [], bodyMeasurements: [], digestiveLogs: [] };
      });
      return result.map((day): BaselineDayRecord => ({ ...day, state: day.dayIndex === throughDay ? 'TODAY' : day.dayIndex > throughDay ? 'UPCOMING' : day.completenessStatus }));
    },
    async getDay(profileId, baselineId, localDate, dayIndex, calculatedAt) { return ensureDay(profileId, baselineId, localDate, dayIndex, calculatedAt); },
    async getCheckIn(profileId, baselineId, localDate, dayIndex, calculatedAt) { return ensureDay(profileId, baselineId, localDate, dayIndex, calculatedAt).checkIn ?? null; },
    async putCheckIn(profileId, baselineId, localDate, dayIndex, input, calculatedAt) {
      const day = ensureDay(profileId, baselineId, localDate, dayIndex, calculatedAt);
      day.checkIn = { id: day.checkIn?.id ?? id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, localDate, ...input, createdAt: day.checkIn?.createdAt ?? calculatedAt, updatedAt: calculatedAt };
      sync(day, calculatedAt);
      return day.checkIn;
    },
    async listMeals(profileId, baselineId, localDate) { return allLogs((day) => day.mealLogs, profileId, baselineId, localDate); },
    async getMealById(profileId, baselineId, mealId) { return allLogs((day) => day.mealLogs, profileId, baselineId).find((meal) => meal.id === mealId) ?? null; },
    async createMeal(profileId, baselineId, dayIndex, input, calculatedAt) {
      const day = ensureDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt);
      const value: MealLogRecord = { id: id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, source: 'MANUAL', ...input, createdAt: calculatedAt, updatedAt: calculatedAt };
      day.mealLogs.push(value); sync(day, calculatedAt); return value;
    },
    async updateMeal(profileId, baselineId, logId, input, calculatedAt) {
      const item = findLog(allLogs((day) => day.mealLogs, profileId, baselineId), profileId, baselineId, logId);
      if (input.localDate && input.localDate !== item.localDate) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.');
      Object.assign(item, input, { updatedAt: calculatedAt }); sync(days.get(dayKey(baselineId, item.localDate))!, calculatedAt); return item;
    },
    async deleteMeal(profileId, baselineId, logId, calculatedAt) {
      const item = findLog(allLogs((day) => day.mealLogs, profileId, baselineId), profileId, baselineId, logId);
      const day = days.get(dayKey(baselineId, item.localDate))!; day.mealLogs = day.mealLogs.filter((value) => value.id !== logId); sync(day, calculatedAt);
    },
    async listSleep(profileId, baselineId, localDate) { return allLogs((day) => day.sleepLogs, profileId, baselineId, localDate); },
    async createSleep(profileId, baselineId, dayIndex, input, calculatedAt) {
      const day = ensureDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt);
      const value: SleepLogRecord = { id: id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, source: 'MANUAL', ...input, createdAt: calculatedAt, updatedAt: calculatedAt };
      day.sleepLogs.push(value); sync(day, calculatedAt); return value;
    },
    async updateSleep(profileId, baselineId, logId, input, calculatedAt) {
      const item = findLog(allLogs((day) => day.sleepLogs, profileId, baselineId), profileId, baselineId, logId);
      if (input.localDate && input.localDate !== item.localDate) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.');
      Object.assign(item, input, { updatedAt: calculatedAt }); sync(days.get(dayKey(baselineId, item.localDate))!, calculatedAt); return item;
    },
    async deleteSleep(profileId, baselineId, logId, calculatedAt) {
      const item = findLog(allLogs((day) => day.sleepLogs, profileId, baselineId), profileId, baselineId, logId); const day = days.get(dayKey(baselineId, item.localDate))!; day.sleepLogs = day.sleepLogs.filter((value) => value.id !== logId); sync(day, calculatedAt);
    },
    async listActivity(profileId, baselineId, localDate) { return allLogs((day) => day.activityLogs, profileId, baselineId, localDate); },
    async createActivity(profileId, baselineId, dayIndex, input, calculatedAt) {
      const day = ensureDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); const value: ActivityLogRecord = { id: id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, source: 'MANUAL', ...input, createdAt: calculatedAt, updatedAt: calculatedAt }; day.activityLogs.push(value); sync(day, calculatedAt); return value;
    },
    async updateActivity(profileId, baselineId, logId, input, calculatedAt) {
      const item = findLog(allLogs((day) => day.activityLogs, profileId, baselineId), profileId, baselineId, logId); if (input.localDate && input.localDate !== item.localDate) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); Object.assign(item, input, { updatedAt: calculatedAt }); sync(days.get(dayKey(baselineId, item.localDate))!, calculatedAt); return item;
    },
    async deleteActivity(profileId, baselineId, logId, calculatedAt) { const item = findLog(allLogs((day) => day.activityLogs, profileId, baselineId), profileId, baselineId, logId); const day = days.get(dayKey(baselineId, item.localDate))!; day.activityLogs = day.activityLogs.filter((value) => value.id !== logId); sync(day, calculatedAt); },
    async listSteps(profileId, baselineId) { return allLogs((day) => day.stepRecord ? [day.stepRecord] : [], profileId, baselineId); },
    async putSteps(profileId, baselineId, localDate, dayIndex, input, calculatedAt) { const day = ensureDay(profileId, baselineId, localDate, dayIndex, calculatedAt); day.stepRecord = { id: day.stepRecord?.id ?? id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, localDate, steps: input.steps, source: 'MANUAL', sourceDevice: input.sourceDevice, verified: false, createdAt: day.stepRecord?.createdAt ?? calculatedAt, updatedAt: calculatedAt }; return day.stepRecord; },
    async listBody(profileId, baselineId) { return allLogs((day) => day.bodyMeasurements, profileId, baselineId); },
    async createBody(profileId, baselineId, dayIndex, input, calculatedAt) { const day = ensureDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); const value: BodyMeasurementRecord = { id: id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, source: 'MANUAL', ...input, createdAt: calculatedAt, updatedAt: calculatedAt }; day.bodyMeasurements.push(value); return value; },
    async listDigestive(profileId, baselineId, localDate) { return allLogs((day) => day.digestiveLogs, profileId, baselineId, localDate); },
    async createDigestive(profileId, baselineId, dayIndex, input, calculatedAt) { const day = ensureDay(profileId, baselineId, input.localDate, dayIndex, calculatedAt); const value: DigestiveLogRecord = { id: id(), profileId, baselineSessionId: baselineId, dailyRecordId: day.id!, ...input, createdAt: calculatedAt, updatedAt: calculatedAt }; day.digestiveLogs.push(value); return value; },
    async updateDigestive(profileId, baselineId, logId, input, calculatedAt) { const item = findLog(allLogs((day) => day.digestiveLogs, profileId, baselineId), profileId, baselineId, logId); if (input.localDate && input.localDate !== item.localDate) throw new ConflictError('Tanggal catatan tidak dapat dipindahkan; hapus dan buat ulang.'); Object.assign(item, input, { updatedAt: calculatedAt }); return item; },
    async deleteDigestive(profileId, baselineId, logId) { const item = findLog(allLogs((day) => day.digestiveLogs, profileId, baselineId), profileId, baselineId, logId); const day = days.get(dayKey(baselineId, item.localDate))!; day.digestiveLogs = day.digestiveLogs.filter((value) => value.id !== logId); },
    async getTasks(profileId, baselineId, localDate, dayIndex, calculatedAt) { return ensureDay(profileId, baselineId, localDate, dayIndex, calculatedAt).tasks; },
    async updateTask(profileId, baselineId, taskId, status, calculatedAt) { const day = [...days.values()].find((value) => value.tasks.some((task) => task.id === taskId)); if (!day) throw new NotFoundError('Tugas tidak ditemukan.'); session(profileId, baselineId); const task = day.tasks.find((value) => value.id === taskId)!; task.status = status; task.source = 'USER'; task.completedAt = status === 'COMPLETED' ? calculatedAt : undefined; return task; },
    async getCompleteness(profileId, baselineId, throughDay, localDate, calculatedAt) {
      const value = session(profileId, baselineId);
      if (localDate) { const result = evaluateDailyCompleteness(counts(days.get(dayKey(baselineId, localDate))), calculatedAt); return { ...result, localDate }; }
      const dailyCounts = Array.from({ length: Math.min(throughDay, value.targetDays) }, (_, index) => counts(days.get(dayKey(baselineId, addCalendarDays(value.startLocalDate, index))))); return evaluateOverallCompleteness(dailyCounts, throughDay, calculatedAt);
    },
    async getDay7Checkpoint(profileId, baselineId, calculatedAt) {
      const value = session(profileId, baselineId); const existing = checkpoints.get(baselineId); if (existing) return existing;
      const overall = await this.getCompleteness(profileId, baselineId, Math.min(7, value.currentDay), undefined, calculatedAt);
      const record: Day7CheckpointRecord = { id: id(), baselineSessionId: baselineId, generatedAt: calculatedAt, observedDays: 7, daysWithData: overall.elapsedDays - Array.from({ length: overall.elapsedDays }, (_, index) => days.get(dayKey(baselineId, addCalendarDays(value.startLocalDate, index)))).filter((day) => !day || counts(day).checkIn + counts(day).food + counts(day).sleep + counts(day).activity === 0).length, domainCoverage: overall.domainCoverage, missingDomains: overall.missingDomains, observations: baselineDomains.map((domain) => `${taskTitles[domain]} tersedia pada ${Math.round(overall.domainCoverage[domain] * overall.elapsedDays)} dari ${overall.elapsedDays} hari.`), disclaimer: 'Ringkasan ini bersifat deskriptif tentang catatan yang tersedia, bukan diagnosis atau kesimpulan sebab-akibat.' };
      checkpoints.set(baselineId, record); return record;
    },
    async saveDay7Feedback(profileId, baselineId, input, calculatedAt) { session(profileId, baselineId); const record: Day7FeedbackRecord = { id: feedback.get(baselineId)?.id ?? id(), baselineSessionId: baselineId, ...input, createdAt: feedback.get(baselineId)?.createdAt ?? calculatedAt, updatedAt: calculatedAt }; feedback.set(baselineId, record); return record; },
    async getReadiness(profileId, baselineId, throughDay, calculatedAt) {
      const value = session(profileId, baselineId); const overall = await this.getCompleteness(profileId, baselineId, throughDay, undefined, calculatedAt); const evaluated = evaluateReadiness(overall, throughDay, baselineId, calculatedAt); if (!evaluated) throw new ConflictError('Readiness tersedia setelah hari ke-14.'); const record = { id: readiness.get(baselineId)?.id ?? id(), ...evaluated }; readiness.set(baselineId, record); Object.assign(value, { readinessStatus: record.status, completenessScore: record.completenessScore, status: record.status === 'INSUFFICIENT_DATA' ? 'DATA_INSUFFICIENT' : 'DAY_14_REVIEW_AVAILABLE', calendarCompletedAt: value.calendarCompletedAt ?? calculatedAt, updatedAt: calculatedAt }); return record;
    },
  };
}
