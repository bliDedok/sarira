import type { FastifyPluginAsync } from 'fastify';
import { getGoalEligibility } from '@sarira/expert-system';
import { goalSelectionSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow } from '../domains/onboarding/service';

export const createGoalRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  const available = async (userId: string) => {
    const profile = await getProfileOrThrow(repositories, userId);
    const safety = await repositories.safety.latestCompleted(profile.id);
    if (profile.age === undefined || !profile.ageGroup || !profile.primaryRole || !safety) throw new ConflictError('Profil, role, usia, dan safety result diperlukan.');
    return getGoalEligibility({ age: profile.age, ageGroup: profile.ageGroup, role: profile.primaryRole as 'USER' | 'PARENT' | 'GUARDIAN' | 'CAREGIVER', safetyStatus: safety.status });
  };

  app.get('/goals/available', { preHandler: app.authenticate }, async (request) => success(await available(request.authUser!.id)));
  app.get('/goals', { preHandler: app.authenticate }, async (request) => success(await available(request.authUser!.id)));

  app.put('/profiles/me/goal', { preHandler: app.authenticate }, async (request) => {
    const input = goalSelectionSchema.parse(request.body);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const eligibility = await available(request.authUser!.id);
    const selected = eligibility.find((item) => item.code === input.code);
    if (!selected?.eligible) throw new ConflictError(selected?.disabledReason ?? 'Tujuan tidak tersedia untuk profil ini.');
    const goal = await repositories.goals.set(request.authUser!.id, profile.id, input.code);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'QUESTIONNAIRE_PENDING', currentStep: 'profile-questionnaire', lastCompletedStep: 'goal-selection' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'GOAL_SELECTED', entityType: 'UserGoal', entityId: goal.id, requestId: request.id, metadata: { code: input.code } });
    return success(goal);
  });
};
