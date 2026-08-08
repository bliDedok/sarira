import type { FastifyPluginAsync } from 'fastify';
import { programPreferenceSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow, programEligibilityForProfile } from '../domains/onboarding/service';

export const createProgramRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.get('/program-preferences', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    return success({ options: await programEligibilityForProfile(repositories, profile), selected: await repositories.programs.get(profile.id) });
  });

  app.put('/profiles/me/program-preference', { preHandler: app.authenticate }, async (request) => {
    const input = programPreferenceSchema.parse(request.body);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    if ((await repositories.questionnaires.latest(profile.id))?.status !== 'COMPLETED') throw new ConflictError('Kuesioner harus selesai sebelum memilih program.');
    const eligibility = await programEligibilityForProfile(repositories, profile);
    const selected = eligibility.find((item) => item.code === input.program);
    if (!selected?.eligible) throw new ConflictError('Program ini dibatasi untuk profil saat ini.');
    const preference = await repositories.programs.set(profile.id, input.program);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'REVIEW_PENDING', currentStep: 'profile-summary', lastCompletedStep: 'program-preference' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'PROGRAM_PREFERENCE_SELECTED', entityType: 'ProgramPreference', entityId: preference.id, requestId: request.id, metadata: { program: input.program } });
    return success(preference);
  });

  app.post('/profiles/me/program-preference/skip', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const eligibility = await programEligibilityForProfile(repositories, profile);
    if (eligibility.some((item) => item.eligible)) throw new ConflictError('Pilih salah satu program yang tersedia.');
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'REVIEW_PENDING', currentStep: 'profile-summary', lastCompletedStep: 'program-preference' });
    return success({ skipped: true, reasonCodes: [...new Set(eligibility.flatMap((item) => item.reasonCodes))] });
  });
};
