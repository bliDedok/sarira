import type { FastifyPluginAsync } from 'fastify';
import { consentSchema, consentTypeSchema, guardianConsentSchema, onboardingRoleSchema, profilePatchSchema } from '@sarira/validation';
import type { DataRepositories } from '../contracts';
import { ConflictError } from '../errors';
import { success } from '../response';
import { getProfileOrThrow } from '../domains/onboarding/service';

export const createAccountRoutes = (repositories: DataRepositories): FastifyPluginAsync => async (app) => {
  app.get('/me', { preHandler: app.authenticate }, async (request) => {
    const user = request.authUser!;
    const profile = await repositories.profiles.getByUserId(user.id) ?? await repositories.profiles.ensure(user.id, user.email.split('@')[0] || 'Pengguna SARIRA');
    const progress = await repositories.onboarding.get(user.id, profile.id);
    return success({ id: user.id, email: user.email, roles: user.roles, onboardingCompleted: profile.onboardingStatus === 'COMPLETED', onboardingStatus: profile.onboardingStatus, currentStep: progress.currentStep });
  });

  app.get('/profiles/me', { preHandler: app.authenticate }, async (request) => success(await getProfileOrThrow(repositories, request.authUser!.id)));

  app.patch('/profiles/me', { preHandler: app.authenticate }, async (request) => {
    const input = profilePatchSchema.parse(request.body);
    const before = await getProfileOrThrow(repositories, request.authUser!.id);
    const ageRecordedAt = input.declaredAge !== undefined ? new Date().toISOString() : undefined;
    const profile = await repositories.profiles.update(request.authUser!.id, { ...input, ...(ageRecordedAt ? { ageRecordedAt } : {}) });
    const ageChanged = input.declaredAge !== undefined
      || (input.dateOfBirth !== undefined && input.dateOfBirth !== before.dateOfBirth);
    if (ageChanged && profile.ageGroup) {
      const ageGroup = profile.ageGroup;
      if (ageGroup === 'TEEN') await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'GUARDIAN_CONSENT_PENDING', currentStep: 'guardian-consent', lastCompletedStep: 'birth-date' });
      else if (ageGroup === 'UNDER_12' || ageGroup === 'OVER_75') await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'BIRTH_DATE_PENDING', currentStep: 'birth-date' });
      else await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'PRIVACY_CONSENT_PENDING', currentStep: 'privacy-consent', lastCompletedStep: 'birth-date' });
      await repositories.audit.record({ actorUserId: request.authUser!.id, event: input.declaredAge !== undefined ? 'DECLARED_AGE_UPDATED' : 'DATE_OF_BIRTH_UPDATED', entityType: 'Profile', entityId: profile.id, requestId: request.id, metadata: { ageGroup, ageSource: profile.ageSource ?? 'UNKNOWN' } });
    } else {
      await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'PROFILE_UPDATED', entityType: 'Profile', entityId: profile.id, requestId: request.id, metadata: { changed: true } });
    }
    return success(await getProfileOrThrow(repositories, request.authUser!.id));
  });

  app.get('/roles/available', { preHandler: app.authenticate }, async () => success(await repositories.roles.available()));

  app.put('/profiles/me/role', { preHandler: app.authenticate }, async (request) => {
    const role = onboardingRoleSchema.parse((request.body as { role?: unknown })?.role);
    const profile = await repositories.roles.setPrimary(request.authUser!.id, role);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'BIRTH_DATE_PENDING', currentStep: 'birth-date', lastCompletedStep: 'role-selection' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'ROLE_SELECTED', entityType: 'Profile', entityId: profile.id, requestId: request.id, metadata: { role } });
    return success(await getProfileOrThrow(repositories, request.authUser!.id));
  });

  app.get('/consents/required', { preHandler: app.authenticate }, async () => success(await repositories.consents.required()));
  app.get('/consents/available', { preHandler: app.authenticate }, async () => success(await repositories.consents.definitions()));
  app.get('/consents/me', { preHandler: app.authenticate }, async (request) => success(await repositories.consents.list(request.authUser!.id)));
  app.get('/consents', { preHandler: app.authenticate }, async (request) => success(await repositories.consents.list(request.authUser!.id)));

  app.put<{ Params: { type: string } }>('/consents/:type', { preHandler: app.authenticate }, async (request) => {
    const type = consentTypeSchema.parse(request.params.type);
    const input = consentSchema.parse(request.body);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const consent = await repositories.consents.set(request.authUser!.id, profile.id, type, input.version, input.granted, input.source);
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: input.granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED', entityType: 'UserConsent', entityId: consent.id, requestId: request.id, metadata: { type, version: input.version, source: input.source } });
    if (!input.granted && (await repositories.consents.required()).some((item) => item.type === type)) {
      await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'PRIVACY_CONSENT_PENDING', currentStep: 'privacy-consent' });
    }
    return success(consent);
  });

  app.delete<{ Params: { type: string } }>('/consents/:type', { preHandler: app.authenticate }, async (request) => {
    const type = consentTypeSchema.parse(request.params.type);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const consent = await repositories.consents.revoke(request.authUser!.id, profile.id, type, 'SETTINGS');
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'CONSENT_REVOKED', entityType: 'UserConsent', entityId: consent.id, requestId: request.id, metadata: { type, source: 'SETTINGS' } });
    if ((await repositories.consents.required()).some((item) => item.type === type)) await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'PRIVACY_CONSENT_PENDING', currentStep: 'privacy-consent' });
    return success(consent);
  });

  app.get('/guardian-consent/status', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    return success({ required: profile.ageGroup === 'TEEN', consent: await repositories.guardian.get(profile.id) });
  });

  app.post('/guardian-consent', { preHandler: app.authenticate }, async (request, reply) => {
    const input = guardianConsentSchema.parse(request.body);
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    if (profile.ageGroup !== 'TEEN') throw new ConflictError('Guardian consent hanya diperlukan untuk profil usia 12–17 tahun.');
    const consent = await repositories.guardian.set(profile.id, input);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'PRIVACY_CONSENT_PENDING', currentStep: 'privacy-consent', lastCompletedStep: 'guardian-consent' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'GUARDIAN_CONSENT_GRANTED', entityType: 'GuardianConsent', entityId: consent.id, requestId: request.id, metadata: { version: input.consentVersion, relationship: input.guardianRelationship } });
    return reply.code(201).send(success(consent));
  });

  app.delete('/guardian-consent', { preHandler: app.authenticate }, async (request) => {
    const profile = await getProfileOrThrow(repositories, request.authUser!.id);
    const consent = await repositories.guardian.revoke(profile.id);
    await repositories.onboarding.advance(request.authUser!.id, profile.id, { status: 'GUARDIAN_CONSENT_PENDING', currentStep: 'guardian-consent' });
    await repositories.audit.record({ actorUserId: request.authUser!.id, event: 'GUARDIAN_CONSENT_REVOKED', entityType: 'GuardianConsent', entityId: consent.id, requestId: request.id });
    return success(consent);
  });

  app.get('/admin/configuration/versions', { preHandler: app.requireRoles(['ADMIN', 'CONTENT_REVIEWER', 'NUTRITION_REVIEWER']) }, async () => success(await repositories.admin.configurationVersions()));
  app.get('/admin/analysis/configuration/versions', { preHandler: app.requireRoles(['ADMIN', 'CONTENT_REVIEWER', 'NUTRITION_REVIEWER']) }, async () => success(await repositories.analysis.configurationVersions()));
};
