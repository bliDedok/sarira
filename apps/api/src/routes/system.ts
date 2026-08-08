import type { FastifyPluginAsync } from 'fastify';
import { success } from '../response';

export const systemRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => success({ status: 'ok', service: 'sarira-api', timestamp: new Date().toISOString() }));
  app.get('/version', async () => success({ version: '0.4.0', apiVersion: 'v1', phase: 4, status: 'baseline-tracking-real', commit: process.env.GIT_SHA ?? 'local' }));
};
