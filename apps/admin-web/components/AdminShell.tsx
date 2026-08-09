import Link from 'next/link';

export function AdminShell({ children, current = 'dashboard' }: { children: React.ReactNode; current?: 'dashboard' | 'profile' }) {
  return <div className="admin-shell"><aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">S</span><span>SARIRA Admin</span></Link><nav className="nav" aria-label="Navigasi admin"><Link href="/dashboard" aria-current={current === 'dashboard' ? 'page' : undefined}><span>Dashboard</span></Link><Link href="/profile" aria-current={current === 'profile' ? 'page' : undefined}><span>Profil</span></Link></nav><div className="phase"><strong>Phase 4 read-only</strong><br />Consent, questionnaire, safety, goal, dan fondasi baseline dapat dibaca. Editor belum diaktifkan.</div></aside><main className="main">{children}</main></div>;
}
