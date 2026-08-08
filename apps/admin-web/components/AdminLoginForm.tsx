'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError(undefined);
    const client = createClient();
    if (!client) { setError('Supabase staging belum dikonfigurasi.'); setLoading(false); return; }
    const result = await client.auth.signInWithPassword({ email, password });
    if (result.error) { setError('Email atau kata sandi tidak valid.'); setLoading(false); return; }
    router.replace('/dashboard'); router.refresh();
  };
  return <form className="form" onSubmit={submit}>{error ? <div className="notice danger" role="alert">{error}</div> : null}<label>Email admin<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label>Kata sandi<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="button" type="submit" disabled={loading}>{loading ? 'Memverifikasi…' : 'Masuk dengan Supabase Auth'}</button></form>;
}
