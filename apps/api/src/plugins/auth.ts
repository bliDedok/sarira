import plugin from 'fastify-plugin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UserRole } from '@sarira/shared-types';
import type { AccountRecord, AuthPort, DataRepositories } from '../contracts';
import { AuthenticationError, AuthorizationError } from '../errors';

declare module 'fastify' {
  interface FastifyRequest { authUser: AccountRecord | null; accessToken: string | null; }
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    requireRoles(roles: UserRole[]): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export function hasRequiredRole(actual: UserRole[], required: UserRole[]) {
  return required.length === 0 || required.some((role) => actual.includes(role) || actual.includes('SUPER_ADMIN'));
}

export const authPlugin = plugin(async (app, options: { auth: AuthPort; repositories: DataRepositories }) => {
  app.decorateRequest('authUser', null);
  app.decorateRequest('accessToken', null);
  app.decorate('authenticate', async (request: FastifyRequest) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new AuthenticationError();
    const accessToken = authorization.slice(7);
    const identity = await options.auth.verify(accessToken);
    request.authUser = await options.repositories.accounts.getOrCreate(identity);
    request.accessToken = accessToken;
  });
  app.decorate('requireRoles', (roles: UserRole[]) => async (request: FastifyRequest, reply: FastifyReply) => {
    await app.authenticate(request, reply);
    if (!request.authUser || !hasRequiredRole(request.authUser.roles, roles)) throw new AuthorizationError();
  });
});
