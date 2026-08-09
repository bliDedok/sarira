import type { Clock } from '@sarira/baseline';
import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { DataRepositories } from '../contracts';
import {
  checkInWeeklyAction,
  currentPatternMap,
  currentWeeklyAction,
  decisionById,
  generateFeatureSnapshot,
  generatePatternMap,
  latestFeatureSnapshot,
  patternMapById,
  savePatternFeedback,
  undoWeeklyActionCheckIn,
  weeklyActionHistory,
} from '../domains/pattern-map/service';
import { success } from '../response';

const idParams = z.object({ id: z.string().uuid() });
const checkInParams = z.object({ id: z.string().uuid(), localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
const checkInBody = z.object({ localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
const feedbackBody = z.object({ value: z.enum(['VERY_ACCURATE', 'FAIRLY_ACCURATE', 'LESS_ACCURATE', 'UNSURE']), notes: z.string().trim().max(1000).optional() });

export const createAnalysisRoutes = (repositories: DataRepositories, clock: Clock): FastifyPluginAsync => async (app) => {
  const authenticated = { preHandler: app.authenticate };
  const audit = (request: FastifyRequest, event: string, entityType: string, entityId?: string, metadata?: Record<string, string | number | boolean>) => repositories.audit.record({ actorUserId: request.authUser!.id, event, entityType, entityId, requestId: request.id, metadata });

  app.post('/analysis/features/generate', authenticated, async (request, reply) => {
    const value = await generateFeatureSnapshot(repositories, clock, request.authUser!.id);
    if (!value.reused) await audit(request, 'FEATURE_SNAPSHOT_GENERATED', 'FeatureSnapshot', value.snapshot.id, { version: value.snapshot.featureEngineVersion, completeness: value.snapshot.inputCompleteness });
    return reply.code(value.reused ? 200 : 201).send(success({ snapshot: value.snapshot, reused: value.reused }));
  });
  app.get('/analysis/features/latest', authenticated, async (request) => success(await latestFeatureSnapshot(repositories, request.authUser!.id)));
  app.post('/pattern-maps/generate', authenticated, async (request, reply) => {
    const value = await generatePatternMap(repositories, clock, request.authUser!.id);
    if (!value.reused) {
      await audit(request, 'PATTERN_MAP_GENERATED', 'PatternMap', value.patternMap.id, { status: value.patternMap.status, decisionRecordId: value.decision.id });
      if (value.weeklyAction) await audit(request, 'WEEKLY_ACTION_ASSIGNED', 'WeeklyActionAssignment', value.weeklyAction.id, { actionCode: value.weeklyAction.definition.code });
    }
    return reply.code(value.reused ? 200 : 201).send(success(value));
  });
  app.get('/pattern-maps/current', authenticated, async (request) => success(await currentPatternMap(repositories, request.authUser!.id)));
  app.get('/pattern-maps/:id', authenticated, async (request) => success(await patternMapById(repositories, request.authUser!.id, idParams.parse(request.params).id)));
  app.post('/pattern-maps/:id/feedback', authenticated, async (request) => {
    const patternMapId = idParams.parse(request.params).id; const input = feedbackBody.parse(request.body);
    const value = await savePatternFeedback(repositories, request.authUser!.id, patternMapId, input.value, input.notes);
    await audit(request, 'PATTERN_MAP_FEEDBACK_SAVED', 'PatternMapFeedback', patternMapId, { value: input.value });
    return success(value);
  });
  app.get('/decisions/:id', authenticated, async (request) => success(await decisionById(repositories, request.authUser!.id, idParams.parse(request.params).id)));
  app.get('/weekly-actions/current', authenticated, async (request) => success(await currentWeeklyAction(repositories, request.authUser!.id)));
  app.get('/weekly-actions/history', authenticated, async (request) => success(await weeklyActionHistory(repositories, request.authUser!.id)));
  app.post('/weekly-actions/:id/check-ins', authenticated, async (request) => {
    const assignmentId = idParams.parse(request.params).id; const input = checkInBody.parse(request.body);
    const value = await checkInWeeklyAction(repositories, request.authUser!.id, assignmentId, input.localDate);
    await audit(request, 'WEEKLY_ACTION_CHECKED_IN', 'WeeklyActionCheckIn', assignmentId, { localDate: input.localDate, source: 'USER_CONFIRMED' });
    return success(value);
  });
  app.delete('/weekly-actions/:id/check-ins/:localDate', authenticated, async (request) => {
    const params = checkInParams.parse(request.params); const value = await undoWeeklyActionCheckIn(repositories, request.authUser!.id, params.id, params.localDate);
    await audit(request, 'WEEKLY_ACTION_CHECKIN_REMOVED', 'WeeklyActionCheckIn', params.id, { localDate: params.localDate });
    return success(value);
  });
};
