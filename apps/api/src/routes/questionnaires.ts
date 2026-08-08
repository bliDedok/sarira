import type { FastifyPluginAsync } from 'fastify';
import type { QuestionnaireAnswerValue, QuestionnaireQuestionRecord } from '@sarira/shared-types';
import { validateQuestionnaireCompletion } from '@sarira/expert-system';
import { questionnaireAnswersSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError, NotFoundError, ValidationError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow } from '../domains/onboarding/service';

function validateAnswer(question: QuestionnaireQuestionRecord, value: QuestionnaireAnswerValue) {
  if (value === null && !question.required) return;
  const invalidType =
    (question.valueType === 'NUMBER' && typeof value !== 'number') ||
    (question.valueType === 'BOOLEAN' && typeof value !== 'boolean') ||
    ((question.valueType === 'TEXT' || question.valueType === 'TIME' || question.valueType === 'SINGLE_SELECT') && typeof value !== 'string') ||
    (question.valueType === 'MULTI_SELECT' && !Array.isArray(value));
  if (invalidType) throw new ValidationError(`Jawaban ${question.code} memiliki tipe yang tidak sesuai.`);
  if (typeof value === 'number' && question.validation) {
    const minimum = typeof question.validation.minimum === 'number' ? question.validation.minimum : undefined;
    const maximum = typeof question.validation.maximum === 'number' ? question.validation.maximum : undefined;
    if ((minimum !== undefined && value < minimum) || (maximum !== undefined && value > maximum)) throw new ValidationError(`Jawaban ${question.code} berada di luar batas teknis.`);
  }
  if (question.valueType === 'TIME' && typeof value === 'string' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new ValidationError(`Jawaban ${question.code} harus menggunakan format HH:mm.`);
  if (question.valueType === 'SINGLE_SELECT' && typeof value === 'string' && !question.options.some((option) => option.code === value)) throw new ValidationError(`Pilihan ${question.code} tidak tersedia.`);
  if (question.valueType === 'MULTI_SELECT' && Array.isArray(value) && value.some((selected) => !question.options.some((option) => option.code === selected))) throw new ValidationError(`Satu atau lebih pilihan ${question.code} tidak tersedia.`);
}

export const createQuestionnaireRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.get('/questionnaires/onboarding', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const template = await repositories.questionnaires.onboardingTemplate();
    return success({ template, session: await repositories.questionnaires.latest(profile.id) }, { warning: 'DEVELOPMENT CONTENT / REQUIRES EXPERT VALIDATION' });
  });

  app.post<{ Params: { templateId: string } }>('/questionnaires/:templateId/sessions', { preHandler: app.authenticate }, async (request, reply) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    if (!(await repositories.goals.get(profile.id))) throw new ConflictError('Pilih tujuan sebelum memulai kuesioner.');
    const session = await repositories.questionnaires.createSession(request.authUser!.id, profile.id, request.params.templateId);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'QUESTIONNAIRE_PENDING', currentStep: 'profile-questionnaire', lastCompletedStep: 'goal-selection' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'QUESTIONNAIRE_STARTED', entityType: 'QuestionnaireSession', entityId: session.id, requestId: request.id, metadata: { templateVersion: session.templateVersion } });
    return reply.code(201).send(success(session));
  });

  app.put<{ Params: { id: string } }>('/questionnaire-sessions/:id/answers', { preHandler: app.authenticate }, async (request) => {
    const input = questionnaireAnswersSchema.parse(request.body);
    const template = await repositories.questionnaires.onboardingTemplate();
    for (const answer of input.answers) {
      const question = template.questions.find((item) => item.id === answer.questionId);
      if (!question) throw new NotFoundError('Pertanyaan kuesioner tidak ditemukan.');
      validateAnswer(question, answer.value);
    }
    return success(await repositories.questionnaires.saveAnswers(request.authUser!.id, request.params.id, input.answers));
  });

  app.post<{ Params: { id: string } }>('/questionnaire-sessions/:id/complete', { preHandler: app.authenticate }, async (request) => {
    const [session, template] = await Promise.all([
      repositories.questionnaires.getSession(request.authUser!.id, request.params.id),
      repositories.questionnaires.onboardingTemplate(),
    ]);
    if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
    const answers = Object.fromEntries(session.answers.map((answer) => [answer.questionCode, answer.value]));
    const missing = validateQuestionnaireCompletion(template.questions, answers);
    if (missing.length > 0) throw new ValidationError('Kuesioner wajib belum lengkap.', missing.map((code) => ({ code })));
    const completed = await repositories.questionnaires.complete(request.authUser!.id, session.id);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'PROGRAM_PREFERENCE_PENDING', currentStep: 'program-preference', lastCompletedStep: 'profile-questionnaire' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'QUESTIONNAIRE_COMPLETED', entityType: 'QuestionnaireSession', entityId: completed.id, requestId: request.id, metadata: { templateVersion: completed.templateVersion } });
    return success(completed);
  });

  app.get<{ Params: { id: string } }>('/questionnaire-sessions/:id', { preHandler: app.authenticate }, async (request) => {
    const session = await repositories.questionnaires.getSession(request.authUser!.id, request.params.id);
    if (!session) throw new NotFoundError('Sesi kuesioner tidak ditemukan.');
    return success(session);
  });
};
