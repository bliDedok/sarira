import { z } from 'zod';

export const publicAppEnvSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_API_BASE_URL: z.url().default('http://localhost:4000/api/v1'),
  EXPO_PUBLIC_SUPABASE_URL: z.url().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  EXPO_PUBLIC_USE_MOCK_DATA: z.enum(['true', 'false']).default('true'),
});

export const serverEnvSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  SUPABASE_URL: z.url().optional(),
  SUPABASE_ANON_KEY: z.string().min(20).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:8081'),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  USE_MOCK_DATA: z.enum(['true', 'false']).default('true'),
});

export type PublicAppEnv = z.infer<typeof publicAppEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parsePublicAppEnv(value: Record<string, string | undefined>): PublicAppEnv {
  return publicAppEnvSchema.parse(value);
}

export function parseServerEnv(value: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.parse(value);
  if (result.APP_ENV !== 'test' && result.USE_MOCK_DATA === 'false') {
    const required = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;
    const missing = required.filter((key) => !result[key]);
    if (missing.length > 0) throw new Error(`Missing server environment: ${missing.join(', ')}`);
  }
  return result;
}
