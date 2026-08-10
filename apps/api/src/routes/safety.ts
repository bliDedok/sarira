import type { FastifyPluginAsync } from 'fastify';
import { evaluateSafety } from '@sarira/expert-system';
import { safetyAnswersSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow, requiredConsentsGranted } from '../domains/onboarding/service';

export const createSafetyRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.get('/safety-screening/current', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const template = await repositories.safety.currentTemplate();
    return success({ template, latestResult: await repositories.safety.latestCompleted(profile.id) }, { warning: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION' });
  });

  app.post('/safety-screening/sessions', { preHandler: app.authenticate }, async (request, reply) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    if (profile.age === undefined || !profile.ageGroup || profile.ageGroup === 'UNDER_12' || profile.ageGroup === 'OVER_75') throw new ConflictError('Usia dan cakupan usia 12–75 harus valid sebelum safety screening.');
    if (!(await requiredConsentsGranted(repositories, request.authUser!.id))) throw new ConflictError('Required consent harus aktif sebelum safety screening.');
    if (profile.ageGroup === 'TEEN' && (await repositories.guardian.get(profile.id))?.status !== 'GRANTED') throw new ConflictError('Guardian consent diperlukan untuk profil remaja.');
    const session = await repositories.safety.createSession(request.authUser!.id, profile.id);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'SAFETY_SCREENING_PENDING', currentStep: 'safety-screening', lastCompletedStep: 'privacy-consent' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'SAFETY_SCREENING_STARTED', entityType: 'SafetyScreeningSession', entityId: session.id, requestId: request.id, metadata: { ruleVersion: session.ruleVersion } });
    return reply.code(201).send(success(session));
  });

  app.put<{ Params: { id: string } }>('/safety-screening/sessions/:id/answers', { preHandler: app.authenticate }, async (request) => {
    const input = safetyAnswersSchema.parse(request.body);
    return success(await repositories.safety.saveAnswers(request.authUser!.id, request.params.id, input.answers));
  });

  app.post<{ Params: { id: string } }>('/safety-screening/sessions/:id/complete', { preHandler: app.authenticate }, async (request) => {
    const [session, template] = await Promise.all([
      repositories.safety.getSession(request.authUser!.id, request.params.id),
      repositories.safety.currentTemplate(),
    ]);
    if (!session) throw new NotFoundError('Sesi safety tidak ditemukan.');
    if (session.status === 'COMPLETED' && session.result) return success(session.result);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    if (profile.age === undefined) throw new ConflictError('Usia belum tersedia.');
    const answers = Object.fromEntries(session.answers.map((answer) => [answer.questionCode, answer.answerCode]));
    const evaluation = evaluateSafety({ age: profile.age, answers, requiredQuestionCodes: template.questions.filter((question) => question.required).map((question) => question.code) });
    if (evaluation.status === 'UNKNOWN') throw new ValidationError('Safety screening belum lengkap.', evaluation.triggeredRules.map((code) => ({ code })));
    const result = await repositories.safety.complete(request.authUser!.id, session.id, evaluation);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'GOAL_PENDING', currentStep: 'goal-selection', lastCompletedStep: 'safety-result' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'SAFETY_SCREENING_COMPLETED', entityType: 'SafetyScreeningSession', entityId: session.id, requestId: request.id, metadata: { ruleVersion: result.ruleVersion } });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'SAFETY_RESULT_CREATED', entityType: 'SafetyResult', entityId: result.id, requestId: request.id, metadata: { status: result.status, ruleVersion: result.ruleVersion, referralRequired: result.referralRequired } });
    return success(result);
  });

  app.get<{ Params: { id: string } }>('/safety-screening/sessions/:id/result', { preHandler: app.authenticate }, async (request) => {
    const session = await repositories.safety.getSession(request.authUser!.id, request.params.id);
    if (!session?.result) throw new NotFoundError('Hasil safety belum tersedia.');
    return success(session.result);
  });
};
