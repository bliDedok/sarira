import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthChangeEvent } from '@supabase/supabase-js';
import type { OnboardingStatus, OnboardingStep } from '@sarira/shared-types';
import type { AuthResponse } from '@sarira/api-client';
import { supabase } from './supabase';
import { useMockData } from './environment';
import { api, getApiToken, setApiToken } from './api';

export interface AppSession {
  userId: string;
  email: string;
  accessToken: string;
  onboardingCompleted: boolean;
  onboardingStatus: OnboardingStatus;
  currentStep: OnboardingStep;
}

export interface AuthService {
  getSession(): Promise<AppSession | null>;
  signIn(email: string, password: string): Promise<AppSession>;
  signUp(email: string, password: string, name: string): Promise<AppSession>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  refresh(): Promise<AppSession | null>;
  subscribe(callback: (session: AppSession | null) => void): () => void;
}

const SESSION_KEY = 'sarira.app.session.v2';

const persist = async (session: AppSession | null) => {
  if (session) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else await AsyncStorage.removeItem(SESSION_KEY);
};

const fromAuthResponse = (response: AuthResponse): AppSession => ({
  userId: response.user.id,
  email: response.user.email,
  accessToken: response.accessToken,
  onboardingCompleted: response.user.onboardingCompleted,
  onboardingStatus: response.user.onboardingStatus,
  currentStep: response.user.currentStep,
});

async function establish(response: AuthResponse) {
  await setApiToken(response.accessToken);
  if (!useMockData && supabase && response.refreshToken) {
    const { error } = await supabase.auth.setSession({ access_token: response.accessToken, refresh_token: response.refreshToken });
    if (error) throw error;
  }
  const session = fromAuthResponse(response);
  await persist(session);
  return session;
}

const authServiceImpl: AuthService = {
  async getSession() {
    if (!useMockData && supabase) {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) await setApiToken(data.session.access_token);
    }
    const token = await getApiToken();
    if (!token) return null;
    try { return await this.refresh(); }
    catch {
      await setApiToken(null);
      await persist(null);
      return null;
    }
  },
  async signIn(email, password) { return establish(await api.login({ email, password })); },
  async signUp(email, password, name) { return establish(await api.register({ email, password, name })); },
  async signOut() {
    try { await api.logout(); } catch { /* Local logout still clears the device session. */ }
    if (!useMockData && supabase) await supabase.auth.signOut();
    await setApiToken(null);
    await persist(null);
  },
  async resetPassword(email) {
    if (useMockData) return;
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'sarira://reset-password' });
    if (error) throw error;
  },
  async refresh() {
    const token = await getApiToken();
    if (!token) return null;
    const me = await api.me();
    const session: AppSession = { userId: me.id, email: me.email, accessToken: token, onboardingCompleted: me.onboardingCompleted, onboardingStatus: me.onboardingStatus, currentStep: me.currentStep };
    await persist(session);
    return session;
  },
  subscribe(callback) {
    if (useMockData || !supabase) return () => undefined;
    const { data } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      if (!session) { void setApiToken(null).then(() => persist(null)).then(() => callback(null)); return; }
      void setApiToken(session.access_token).then(() => authServiceImpl.refresh()).then(callback).catch(() => callback(null));
    });
    return () => data.subscription.unsubscribe();
  },
};

export const authService = authServiceImpl;
