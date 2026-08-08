import Link from 'next/link';
import { AdminLoginForm } from '@/components/AdminLoginForm';

export default function AdminLoginPage() {
  return <div className="login-page"><section className="login-visual"><div className="brand"><span className="brand-mark">S</span><span>SARIRA Admin</span></div><div><p className="eyebrow">PHASE 3 · READ-ONLY CONFIGURATION</p><h1>Tinjau versi sebelum konten diaktifkan.</h1><p className="muted" style={{ color: '#c9d9ce', marginTop: 16 }}>Hanya akun admin/reviewer yang dapat membaca versi consent, questionnaire, safety, dan goal. Editor belum tersedia.</p></div><p className="muted" style={{ color: '#9fb3a6' }}>Rules Decide · Evidence Supports · AI Explains</p></section><section className="login-card-wrap"><div className="card login-card"><span className="pill">SECURE ACCESS</span><h2>Masuk ke admin</h2><p className="muted">Session disimpan sebagai cookie Supabase SSR dan diperbarui melalui Next.js Proxy.</p><AdminLoginForm /><Link href="/access-denied" className="muted">Lihat contoh halaman access denied</Link></div></section></div>;
}
