import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { calculateSleepDuration, day7Available, day14Available, type Clock } from '@sarira/baseline';
import {
  activityLogPatchSchema,
  activityLogSchema,
  bodyMeasurementSchema,
  dailyCheckInSchema,
  day7FeedbackSchema,
  digestiveLogPatchSchema,
  digestiveLogSchema,
  localDateSchema,
  mealLogPatchSchema,
  mealLogSchema,
  sleepLogPatchSchema,
  sleepLogSchema,
  stepRecordSchema,
  taskPatchSchema,
} from '@sarira/validation';
import { z } from 'zod';
import type { DataRepositories } from '../contracts';
import { ConflictError, NotFoundError } from '../errors';
import { success } from '../response';
import {
  assertBaselinePreconditions,
  assertConsent,
  assertEditableDate,
  baselineByIdContext,
  createBaselineInput,
  currentBaselineContext,
  refreshBaseline,
  starterJourney,
} from '../domains/baseline/service';

const idParams = z.object({ id: z.string().uuid() });
const dateParams = z.object({ localDate: localDateSchema });
const baselineParams = z.object({ id: z.string().uuid() });
const baselineDayParams = z.object({ id: z.string().uuid(), dayIndex: z.coerce.number().int().min(1).max(365) });
const historyQuery = z.object({ localDate: localDateSchema.optional() });

export const createBaselineRoutes = (repositories: DataRepositories, clock: Clock): FastifyPluginAsync => async (app) => {
  const authenticated = { preHandler: app.authenticate };
  const audit = (request: FastifyRequest, event: string, entityType: string, entityId?: string, metadata?: Record<string, string | number | boolean>) => repositories.audit.record({ actorUserId: request.authUser!.id, event, entityType, entityId, requestId: request.id, metadata });

  app.get('/starter-journey', authenticated, async (request) => success(await starterJourney(repositories, request.authUser!.id)));

  app.post('/baseline', authenticated, async (request, reply) => {
    const profile = await assertBaselinePreconditions(repositories, request.authUser!.id);
    const existing = await repositories.baseline.getCurrent(profile.id);
    if (existing) return success((await refreshBaseline(repositories, profile, existing, clock)).baseline, { resumed: true });
    const baseline = await repositories.baseline.create(profile.id, createBaselineInput(profile, clock));
    await audit(request, 'BASELINE_STARTED', 'BaselineSession', baseline.id, { targetDays: baseline.targetDays, timezone: baseline.timezone });
    await audit(request, 'BASELINE_DAY_CREATED', 'DailyRecord', undefined, { dayIndex: 1, localDate: baseline.startLocalDate });
    return reply.code(201).send(success(baseline));
  });

  app.get('/baseline/current', authenticated, async (request) => {
    const context = await currentBaselineContext(repositories, request.authUser!.id, clock);
    const [completeness, tasks] = await Promise.all([
      repositories.baseline.getCompleteness(context.profile.id, context.baseline.id, context.currentDay, undefined, context.now),
      repositories.baseline.getTasks(context.profile.id, context.baseline.id, context.localDate, assertEditableDate(context, context.localDate), context.now),
    ]);
    return success({ baseline: context.baseline, localDate: context.localDate, completeness, tasks, day7Available: day7Available(context.currentDay), day14Available: day14Available(context.currentDay) });
  });

  app.get('/baseline/:id', authenticated, async (request) => success((await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock)).baseline));
  app.post('/baseline/:id/complete', authenticated, async (request) => { const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); const value = await repositories.baseline.complete(context.profile.id, context.baseline.id, context.now); await audit(request, 'BASELINE_COMPLETED', 'BaselineSession', value.id); return success(value); });
  app.get('/baseline/:id/readiness', authenticated, async (request) => { const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); if (!day14Available(context.currentDay)) throw new ConflictError('Readiness tersedia setelah hari ke-14.'); const value = await repositories.baseline.getReadiness(context.profile.id, context.baseline.id, context.currentDay, context.now); await audit(request, value.status === 'INSUFFICIENT_DATA' ? 'BASELINE_DATA_INSUFFICIENT' : 'BASELINE_READY', 'BaselineReadinessResult', value.id, { status: value.status, completenessScore: value.completenessScore }); return success(value); });
  app.get('/baseline/:id/days', authenticated, async (request) => { const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); return success(await repositories.baseline.listDays(context.profile.id, context.baseline.id, context.currentDay, context.now)); });
  app.get('/baseline/:id/days/:dayIndex', authenticated, async (request) => { const params = baselineDayParams.parse(request.params); const context = await baselineByIdContext(repositories, request.authUser!.id, params.id, clock); if (params.dayIndex > context.baseline.targetDays + context.baseline.extensionDays) throw new NotFoundError('Hari baseline tidak ditemukan.'); const localDate = new Date(Date.parse(`${context.baseline.startLocalDate}T00:00:00.000Z`) + (params.dayIndex - 1) * 86_400_000).toISOString().slice(0, 10); return success(await repositories.baseline.getDay(context.profile.id, context.baseline.id, localDate, params.dayIndex, context.now)); });

  app.get('/daily-checkins/:localDate', authenticated, async (request) => { const { localDate } = dateParams.parse(request.params); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); const dayIndex = assertEditableDate(context, localDate); return success(await repositories.baseline.getCheckIn(context.profile.id, context.baseline.id, localDate, dayIndex, context.now)); });
  app.put('/daily-checkins/:localDate', authenticated, async (request) => { const { localDate } = dateParams.parse(request.params); const input = dailyCheckInSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'HEALTH_PROFILE'); const value = await repositories.baseline.putCheckIn(context.profile.id, context.baseline.id, localDate, assertEditableDate(context, localDate), input, context.now); await audit(request, 'DAILY_CHECKIN_UPDATED', 'DailyCheckIn', value.id, { localDate }); return success(value); });

  app.get('/meal-logs', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listMeals(context.profile.id, context.baseline.id, historyQuery.parse(request.query).localDate)); });
  app.post('/meal-logs', authenticated, async (request, reply) => { const input = mealLogSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'NUTRITION_DATA'); const value = await repositories.baseline.createMeal(context.profile.id, context.baseline.id, assertEditableDate(context, input.localDate), input, context.now); await audit(request, 'MEAL_LOG_CREATED', 'MealLog', value.id, { localDate: input.localDate, mealType: input.mealType }); return reply.code(201).send(success(value)); });
  app.patch('/meal-logs/:id', authenticated, async (request) => { const input = mealLogPatchSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'NUTRITION_DATA'); const value = await repositories.baseline.updateMeal(context.profile.id, context.baseline.id, idParams.parse(request.params).id, input, context.now); await audit(request, 'MEAL_LOG_UPDATED', 'MealLog', value.id, { localDate: value.localDate }); return success(value); });
  app.delete('/meal-logs/:id', authenticated, async (request) => { const id = idParams.parse(request.params).id; const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await repositories.baseline.deleteMeal(context.profile.id, context.baseline.id, id, context.now); await audit(request, 'MEAL_LOG_DELETED', 'MealLog', id); return success({ deleted: true }); });

  app.get('/sleep-logs', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listSleep(context.profile.id, context.baseline.id, historyQuery.parse(request.query).localDate)); });
  app.post('/sleep-logs', authenticated, async (request, reply) => { const input = sleepLogSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'SLEEP_DATA'); const value = await repositories.baseline.createSleep(context.profile.id, context.baseline.id, assertEditableDate(context, input.localDate), { ...input, durationMinutes: calculateSleepDuration(input.sleepStartedAt, input.wokeUpAt) }, context.now); await audit(request, 'SLEEP_LOG_CREATED', 'SleepLog', value.id, { localDate: input.localDate, durationMinutes: value.durationMinutes }); return reply.code(201).send(success(value)); });
  app.patch('/sleep-logs/:id', authenticated, async (request) => { const input = sleepLogPatchSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'SLEEP_DATA'); let durationMinutes: number | undefined; if (input.sleepStartedAt && input.wokeUpAt) durationMinutes = calculateSleepDuration(input.sleepStartedAt, input.wokeUpAt); const value = await repositories.baseline.updateSleep(context.profile.id, context.baseline.id, idParams.parse(request.params).id, { ...input, ...(durationMinutes ? { durationMinutes } : {}) }, context.now); return success(value); });
  app.delete('/sleep-logs/:id', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await repositories.baseline.deleteSleep(context.profile.id, context.baseline.id, idParams.parse(request.params).id, context.now); return success({ deleted: true }); });

  app.get('/activity-logs', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listActivity(context.profile.id, context.baseline.id, historyQuery.parse(request.query).localDate)); });
  app.post('/activity-logs', authenticated, async (request, reply) => { const input = activityLogSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'ACTIVITY_DATA'); const value = await repositories.baseline.createActivity(context.profile.id, context.baseline.id, assertEditableDate(context, input.localDate), input, context.now); await audit(request, 'ACTIVITY_LOG_CREATED', 'ActivityLog', value.id, { localDate: input.localDate, durationMinutes: input.durationMinutes }); return reply.code(201).send(success(value)); });
  app.patch('/activity-logs/:id', authenticated, async (request) => { const input = activityLogPatchSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'ACTIVITY_DATA'); return success(await repositories.baseline.updateActivity(context.profile.id, context.baseline.id, idParams.parse(request.params).id, input, context.now)); });
  app.delete('/activity-logs/:id', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await repositories.baseline.deleteActivity(context.profile.id, context.baseline.id, idParams.parse(request.params).id, context.now); return success({ deleted: true }); });

  app.get('/step-records', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listSteps(context.profile.id, context.baseline.id)); });
  app.put('/step-records/:localDate', authenticated, async (request) => { const { localDate } = dateParams.parse(request.params); const input = stepRecordSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'ACTIVITY_DATA'); const value = await repositories.baseline.putSteps(context.profile.id, context.baseline.id, localDate, assertEditableDate(context, localDate), input, context.now); await audit(request, 'STEP_RECORD_UPDATED', 'StepRecord', value.id, { localDate, steps: input.steps, verified: false }); return success(value); });
  app.get('/body-measurements', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listBody(context.profile.id, context.baseline.id)); });
  app.post('/body-measurements', authenticated, async (request, reply) => { const input = bodyMeasurementSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'HEALTH_PROFILE'); return reply.code(201).send(success(await repositories.baseline.createBody(context.profile.id, context.baseline.id, assertEditableDate(context, input.localDate), input, context.now))); });

  app.get('/digestive-logs', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.listDigestive(context.profile.id, context.baseline.id, historyQuery.parse(request.query).localDate)); });
  app.post('/digestive-logs', authenticated, async (request, reply) => { const input = digestiveLogSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'HEALTH_PROFILE'); const value = await repositories.baseline.createDigestive(context.profile.id, context.baseline.id, assertEditableDate(context, input.localDate), input, context.now); await audit(request, 'DIGESTIVE_LOG_CREATED', 'DigestiveLog', value.id, { localDate: input.localDate, symptomType: input.symptomType }); return reply.code(201).send(success(value)); });
  app.patch('/digestive-logs/:id', authenticated, async (request) => { const input = digestiveLogPatchSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await assertConsent(repositories, request.authUser!.id, 'HEALTH_PROFILE'); return success(await repositories.baseline.updateDigestive(context.profile.id, context.baseline.id, idParams.parse(request.params).id, input, context.now)); });
  app.delete('/digestive-logs/:id', authenticated, async (request) => { const context = await currentBaselineContext(repositories, request.authUser!.id, clock); await repositories.baseline.deleteDigestive(context.profile.id, context.baseline.id, idParams.parse(request.params).id, context.now); return success({ deleted: true }); });

  app.get('/daily-tasks/:localDate', authenticated, async (request) => { const { localDate } = dateParams.parse(request.params); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.getTasks(context.profile.id, context.baseline.id, localDate, assertEditableDate(context, localDate), context.now)); });
  app.patch('/daily-tasks/:id', authenticated, async (request) => { const input = taskPatchSchema.parse(request.body); const context = await currentBaselineContext(repositories, request.authUser!.id, clock); return success(await repositories.baseline.updateTask(context.profile.id, context.baseline.id, idParams.parse(request.params).id, input.status, context.now)); });
  app.get('/baseline/:id/completeness', authenticated, async (request) => { const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); return success(await repositories.baseline.getCompleteness(context.profile.id, context.baseline.id, context.currentDay, undefined, context.now)); });
  app.get('/baseline/:id/completeness/:localDate', authenticated, async (request) => { const params = z.object({ id: z.string().uuid(), localDate: localDateSchema }).parse(request.params); const context = await baselineByIdContext(repositories, request.authUser!.id, params.id, clock); return success(await repositories.baseline.getCompleteness(context.profile.id, context.baseline.id, context.currentDay, params.localDate, context.now)); });
  app.get('/baseline/:id/day-7-checkpoint', authenticated, async (request) => { const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); if (!day7Available(context.currentDay)) throw new ConflictError('Checkpoint tersedia pada hari ke-7.'); const value = await repositories.baseline.getDay7Checkpoint(context.profile.id, context.baseline.id, context.now); await audit(request, 'DAY_7_CHECKPOINT_VIEWED', 'Day7Checkpoint', value.id); return success(value); });
  app.post('/baseline/:id/day-7-feedback', authenticated, async (request) => { const input = day7FeedbackSchema.parse(request.body); const context = await baselineByIdContext(repositories, request.authUser!.id, baselineParams.parse(request.params).id, clock); if (!day7Available(context.currentDay)) throw new ConflictError('Feedback tersedia pada hari ke-7.'); const value = await repositories.baseline.saveDay7Feedback(context.profile.id, context.baseline.id, input, context.now); await audit(request, 'DAY_7_FEEDBACK_SUBMITTED', 'Day7Feedback', value.id, { easeRating: value.easeRating, wantsToContinue: value.wantsToContinue }); return success(value); });
};
