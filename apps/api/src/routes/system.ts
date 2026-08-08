import type { FastifyPluginAsync } from 'fastify';
import { success } from '../response';

export const systemRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => success({ status: 'ok', service: 'sarira-api', timestamp: new Date().toISOString() }));
  app.get('/version', async () => success({ version: '0.5.0', apiVersion: 'v1', phase: 5, status: 'nutrition-engine-real', commit: process.env.GIT_SHA ?? 'local' }));
};
