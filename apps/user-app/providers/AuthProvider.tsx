import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { authService, type AppSession } from '@/services/auth';

interface AuthContextValue {
  session: AppSession | null;
  loading: boolean;
  signIn(email: string, password: string): Promise<AppSession>;
  signUp(email: string, password: string, name: string): Promise<AppSession>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  refreshSession(): Promise<AppSession | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void authService.getSession().then((value) => { if (active) setSession(value); }).finally(() => { if (active) setLoading(false); });
    const unsubscribe = authService.subscribe((value) => setSession(value));
    return () => { active = false; unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    loading,
    signIn: async (email, password) => { const next = await authService.signIn(email, password); setSession(next); return next; },
    signUp: async (email, password, name) => { const next = await authService.signUp(email, password, name); setSession(next); return next; },
    signOut: async () => { await authService.signOut(); setSession(null); },
    resetPassword: (email) => authService.resetPassword(email),
    refreshSession: async () => { const refreshed = await authService.refresh(); setSession(refreshed); return refreshed; },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return value;
}
