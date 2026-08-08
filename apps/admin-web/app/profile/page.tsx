import { AdminShell } from '@/components/AdminShell';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default function AdminProfilePage() {
  return <AdminShell current="profile"><header className="topbar"><div><p className="eyebrow">ACCOUNT</p><h1>Profil admin</h1></div><LogoutButton /></header><article className="card" style={{ maxWidth: 720 }}><h2>Role dan permission</h2><p className="muted">Role authoritative berasal dari database/API. Metadata JWT hanya dipakai sebagai optimistic gate; endpoint tetap melakukan authorization.</p><div className="notice">Role editor belum tersedia pada Phase 4. Perubahan role wajib menghasilkan audit event ROLE_UPDATED.</div></article></AdminShell>;
}
