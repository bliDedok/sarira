import { parsePublicAppEnv } from '@sarira/config';

export const appEnvironment = parsePublicAppEnv({
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_USE_MOCK_DATA: process.env.EXPO_PUBLIC_USE_MOCK_DATA,
});

export const useMockData = appEnvironment.EXPO_PUBLIC_USE_MOCK_DATA === 'true';
