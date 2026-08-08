import { createClient } from '@supabase/supabase-js';
import type { AuthIdentity, AuthPort, AuthTokens } from './contracts';
import { AuthenticationError, ConflictError } from './errors';

export class MockAuthAdapter implements AuthPort {
  private readonly identities = new Map<string, AuthIdentity>();
  private readonly accounts = new Map<string, AuthIdentity>();

  constructor() {
    const defaultIdentity = { externalAuthId: '00000000-0000-4000-8000-000000000001', email: 'ayu@contoh.id' };
    const adminIdentity = { externalAuthId: '00000000-0000-4000-8000-000000000099', email: 'admin@sarira.test' };
    this.identities.set('mock-user-token', defaultIdentity);
    this.identities.set('mock-admin-token', adminIdentity);
    this.accounts.set(defaultIdentity.email, defaultIdentity);
    this.accounts.set(adminIdentity.email, adminIdentity);
  }

  private tokens(identity: AuthIdentity): AuthTokens {
    const accessToken = `mock-${crypto.randomUUID()}`;
    this.identities.set(accessToken, identity);
    return { ...identity, accessToken, refreshToken: `mock-refresh-${crypto.randomUUID()}` };
  }

  async register(email: string): Promise<AuthTokens> {
    if (this.accounts.has(email)) throw new ConflictError('Email sudah terdaftar pada mode development.');
    const identity = { externalAuthId: crypto.randomUUID(), email };
    this.accounts.set(email, identity);
    return this.tokens(identity);
  }

  async login(email: string): Promise<AuthTokens> {
    const identity = this.accounts.get(email) ?? { externalAuthId: crypto.randomUUID(), email };
    this.accounts.set(email, identity);
    return this.tokens(identity);
  }

  async verify(accessToken: string): Promise<AuthIdentity> {
    const identity = this.identities.get(accessToken);
    if (!identity) throw new AuthenticationError('Token tidak valid.');
    return identity;
  }
  async logout(accessToken: string): Promise<void> { this.identities.delete(accessToken); }
}

export class SupabaseAuthAdapter implements AuthPort {
  private readonly client;
  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  }
  async register(email: string, password: string, name: string): Promise<AuthTokens> {
    const { data, error } = await this.client.auth.signUp({ email, password, options: { data: { name, onboarding_completed: false } } });
    if (error) throw new ConflictError('Akun tidak dapat dibuat.');
    if (!data.user || !data.session) throw new AuthenticationError('Konfirmasi email diperlukan sebelum masuk.');
    return { externalAuthId: data.user.id, email: data.user.email ?? email, accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
  }
  async login(email: string, password: string): Promise<AuthTokens> {
    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error || !data.user || !data.session) throw new AuthenticationError('Email atau kata sandi tidak valid.');
    return { externalAuthId: data.user.id, email: data.user.email ?? email, accessToken: data.session.access_token, refreshToken: data.session.refresh_token };
  }
  async verify(accessToken: string): Promise<AuthIdentity> {
    const { data, error } = await this.client.auth.getUser(accessToken);
    if (error || !data.user) throw new AuthenticationError('Token tidak valid atau kedaluwarsa.');
    return { externalAuthId: data.user.id, email: data.user.email ?? '' };
  }
  async logout(): Promise<void> { return undefined; }
}
