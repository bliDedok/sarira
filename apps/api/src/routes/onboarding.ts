import type { FastifyPluginAsync } from 'fastify';
import { onboardingStatusPatchSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError } from '../errors';
import { success } from '../response';
import { assertOnboardingCompletable, getProfileOrThrow, onboardingSummary, stepForStatus } from '../domains/onboarding/service';

export const createOnboardingRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.get('/onboarding/status', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const progress = await repositories.onboarding.get(request.authUser!.id, profile.id);
    return success({ profile, progress, resumePath: `/setup/${progress.currentStep}` });
  });

  app.patch('/onboarding/status', { preHandler: app.authenticate }, async (request) => {
    const input = onboardingStatusPatchSchema.parse(request.body);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const requiredStep = stepForStatus[profile.onboardingStatus];
    if (input.currentStep !== requiredStep) throw new ConflictError(`Tahap onboarding yang harus diselesaikan adalah ${requiredStep}.`);
    return success(await repositories.onboarding.touch(request.authUser!.id, profile.id, input.currentStep));
  });

  app.get('/onboarding/summary', { preHandler: app.authenticate }, async (request) => success(await onboardingSummary(repositories, request.authUser!.id)));

  app.post('/onboarding/complete', { preHandler: app.authenticate }, async (request) => {
    const summary = await assertOnboardingCompletable(repositories, request.authUser!.id);
    const progress = await repositories.onboarding.complete(request.authUser!.id, summary.profile.id);
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'ONBOARDING_COMPLETED', entityType: 'OnboardingProgress', entityId: progress.id, requestId: request.id, metadata: { stateVersion: progress.stateVersion } });
    return success({
      progress,
      starterContext: {
        profileId: summary.profile.id,
        ageGroup: summary.ageGroup,
        selectedGoal: summary.goal?.code,
        programPreference: summary.programPreference?.program,
        safetyStatus: summary.safetyResult?.status,
        simulatedJourney: false,
      },
    });
  });
};
