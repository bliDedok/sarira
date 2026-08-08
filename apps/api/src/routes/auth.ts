import type { FastifyPluginAsync } from 'fastify';
import { loginSchema, registerSchema } from '@sarira/validation';
import type { AuthPort, DataRepositories } from '../contracts';
import { success } from '../response';

export const createAuthRoutes = (auth: AuthPort, repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.post('/auth/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const tokens = await auth.register(input.email, input.password, input.name);
    const account = await repositories.accounts.getOrCreate(tokens);
    const profile = await repositories.profiles.ensure(account.id, input.name);
    const progress = await repositories.onboarding.get(account.id, profile.id);
    await repositories.audit.record({ actorUserId: account.id, event: 'USER_REGISTERED', entityType: 'User', entityId: account.id, requestId: request.id });
    await repositories.audit.record({ actorUserId: account.id, event: 'ONBOARDING_STARTED', entityType: 'OnboardingProgress', entityId: progress.id, requestId: request.id });
    return reply.code(201).send(success({ user: { id: account.id, email: account.email, roles: account.roles, onboardingCompleted: false, onboardingStatus: profile.onboardingStatus, currentStep: progress.currentStep }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }));
  });

  app.post('/auth/login', async (request) => {
    const input = loginSchema.parse(request.body);
    const tokens = await auth.login(input.email, input.password);
    const account = await repositories.accounts.getOrCreate(tokens);
    const profile = await repositories.profiles.getByUserId(account.id) ?? await repositories.profiles.ensure(account.id, account.email.split('@')[0] || 'Pengguna SARIRA');
    const progress = await repositories.onboarding.get(account.id, profile.id);
    await repositories.audit.record({ actorUserId: account.id, event: 'USER_LOGGED_IN', entityType: 'User', entityId: account.id, requestId: request.id });
    return success({ user: { id: account.id, email: account.email, roles: account.roles, onboardingCompleted: profile.onboardingStatus === 'COMPLETED', onboardingStatus: profile.onboardingStatus, currentStep: progress.currentStep }, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  });

  app.post('/auth/logout', { preHandler: app.authenticate }, async (request) => {
    if (request.accessToken) await auth.logout(request.accessToken);
    await repositories.audit.record({ actorUserId: request.authUser?.id, event: 'USER_LOGGED_OUT', entityType: 'User', entityId: request.authUser?.id, requestId: request.id });
    return success({ loggedOut: true });
  });
};
