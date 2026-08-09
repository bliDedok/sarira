import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { parseServerEnv, type ServerEnv } from '@sarira/config';
import type { AuthPort, DataRepositories } from './contracts';
import { MockAuthAdapter, SupabaseAuthAdapter } from './auth';
import { createMemoryRepositories } from './repositories/memory';
import { createPrismaRepositories } from './repositories/prisma';
import { createPrismaClient, type SariraPrismaClient } from './database';
import { authPlugin } from './plugins/auth';
import { normalizeError, RateLimitError } from './errors';
import { failure } from './response';
import { systemRoutes } from './routes/system';
import { createAuthRoutes } from './routes/auth';
import { createAccountRoutes } from './routes/account';
import { createOnboardingRoutes } from './routes/onboarding';
import { createSafetyRoutes } from './routes/safety';
import { createGoalRoutes } from './routes/goals';
import { createQuestionnaireRoutes } from './routes/questionnaires';
import { createProgramRoutes } from './routes/programs';
import { createBaselineRoutes } from './routes/baseline';
import { createNutritionRoutes } from './routes/nutrition';
import { createMealPlanningRoutes } from './routes/meal-planning';
import { createAnalysisRoutes } from './routes/analysis';
import { SystemClock, type Clock } from '@sarira/baseline';

export interface BuildAppOptions {
  env?: Record<string, string | undefined>;
  auth?: AuthPort;
  repositories?: DataRepositories;
  logger?: boolean;
  clock?: Clock;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const env: ServerEnv = parseServerEnv({ ...process.env, ...options.env });
  const app = Fastify({
    logger: options.logger === false ? false : {
      level: env.LOG_LEVEL,
      redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token', 'body.healthData', 'body.consentDetail', 'body.answers', 'body.guardianName'], censor: '[REDACTED]' },
    },
    trustProxy: env.APP_ENV !== 'development',
    requestIdHeader: 'x-request-id',
  });

  let prisma: SariraPrismaClient | undefined;
  const useMock = env.USE_MOCK_DATA === 'true';
  const repositories = options.repositories ?? (useMock
    ? createMemoryRepositories()
    : createPrismaRepositories((prisma = createPrismaClient(env.DATABASE_URL!))));
  const auth = options.auth ?? (useMock
    ? new MockAuthAdapter()
    : new SupabaseAuthAdapter(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!));
  const clock = options.clock ?? new SystemClock();

  await app.register(helmet, { global: true, contentSecurityPolicy: false });
  await app.register(cors, {
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: env.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
  });
  await app.register(rateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: '1 minute' });
  await app.register(authPlugin, { auth, repositories });

  app.setErrorHandler((error, request, reply) => {
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;
    const normalized = errorCode === 'FST_ERR_RATE_LIMIT' ? new RateLimitError() : normalizeError(error);
    if (normalized.statusCode >= 500) request.log.error({ err: error, requestId: request.id, module: 'http', action: 'request_failed', errorCode: normalized.code }, 'Request failed');
    else request.log.warn({ requestId: request.id, module: 'http', action: 'request_rejected', errorCode: normalized.code }, 'Request rejected');
    return reply.code(normalized.statusCode).send(failure(normalized.code, normalized.message, normalized.details));
  });

  app.addHook('onResponse', async (request, reply) => {
    request.log.info({ requestId: request.id, environment: env.APP_ENV, module: 'http', action: 'request_completed', status: reply.statusCode, duration: reply.elapsedTime }, 'Request completed');
  });

  await app.register(async (v1) => {
    await v1.register(systemRoutes);
    await v1.register(createAuthRoutes(auth, repositories));
    await v1.register(createAccountRoutes(repositories));
    await v1.register(createOnboardingRoutes(repositories));
    await v1.register(createSafetyRoutes(repositories));
    await v1.register(createGoalRoutes(repositories));
    await v1.register(createQuestionnaireRoutes(repositories));
    await v1.register(createProgramRoutes(repositories));
    await v1.register(createBaselineRoutes(repositories, clock));
    await v1.register(createNutritionRoutes(repositories, clock));
    await v1.register(createMealPlanningRoutes(repositories, clock));
    await v1.register(createAnalysisRoutes(repositories, clock));
  }, { prefix: '/api/v1' });

  app.addHook('onClose', async () => { if (prisma) await prisma.$disconnect(); });
  return app;
}
