import AsyncStorage from '@react-native-async-storage/async-storage';
import { createApiClient } from '@sarira/api-client';
import { appEnvironment } from './environment';

const TOKEN_KEY = 'sarira.api.access-token.v1';
let memoryToken: string | null = null;

export async function setApiToken(token: string | null) {
  memoryToken = token;
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getApiToken() {
  if (memoryToken) return memoryToken;
  memoryToken = await AsyncStorage.getItem(TOKEN_KEY);
  return memoryToken;
}

export const api = createApiClient({ baseUrl: appEnvironment.EXPO_PUBLIC_API_BASE_URL, getAccessToken: getApiToken });
