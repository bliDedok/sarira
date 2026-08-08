import { AdminShell } from '@/components/AdminShell';
import { LogoutButton } from '@/components/LogoutButton';
import { getSupabasePublicConfig } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ConfigurationVersions {
  consentVersions: Array<{ type: string; version: string; status: string }>;
  questionnaireVersions: Array<{ code: string; version: string; status: string }>;
  safetyVersions: Array<{ code: string; version: string; ruleVersions: string[]; status: string }>;
  goals: Array<{ code: string; status: string }>;
}

async function getConfiguration(): Promise<{ data?: ConfigurationVersions; error?: string }> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!supabase || !baseUrl) return { error: 'Supabase atau API URL belum dikonfigurasi.' };
  const { data } = await supabase.auth.getSession();
  if (!data.session) return { error: 'Session admin tidak tersedia.' };
  try {
    const response = await fetch(`${baseUrl}/admin/configuration/versions`, { headers: { authorization: `Bearer ${data.session.access_token}` }, cache: 'no-store' });
    const body = await response.json() as { success: boolean; data?: ConfigurationVersions; error?: { message: string } };
    if (!response.ok || !body.success || !body.data) return { error: body.error?.message ?? 'Konfigurasi belum dapat dibaca.' };
    return { data: body.data };
  } catch { return { error: 'API konfigurasi belum dapat dijangkau.' }; }
}

function VersionList({ items }: { items: Array<{ label: string; version?: string; status: string }> }) {
  return <ul className="version-list">{items.map((item) => <li key={`${item.label}-${item.version ?? item.status}`}><div><strong>{item.label}</strong>{item.version ? <span>v{item.version}</span> : null}</div><small>{item.status.replaceAll('_', ' ')}</small></li>)}</ul>;
}

export default async function DashboardPage() {
  const configured = Boolean(getSupabasePublicConfig());
  const configuration = configured ? await getConfiguration() : { error: 'Supabase belum dikonfigurasi di environment ini.' };
  return <AdminShell current="dashboard"><header className="topbar"><div><p className="eyebrow">PHASE 3 · READ ONLY</p><h1>Konfigurasi aktif SARIRA</h1></div><LogoutButton /></header>{configuration.error ? <div className="notice" role="status">{configuration.error} Build tetap dapat diverifikasi tanpa credential palsu.</div> : null}<section className="grid"><article className="card dark"><span className="pill">SAFETY</span><h2>Rule version aktif</h2>{configuration.data ? <VersionList items={configuration.data.safetyVersions.map((item) => ({ label: item.code, version: `${item.version} · ${item.ruleVersions.join(', ')}`, status: item.status }))} /> : <p className="muted" style={{ color: '#c9d9ce' }}>Menunggu koneksi API staging.</p>}</article><article className="card"><span className="pill">CONSENT</span><h2>Policy version</h2>{configuration.data ? <VersionList items={configuration.data.consentVersions.map((item) => ({ label: item.type, version: item.version, status: item.status }))} /> : <p className="muted">Read-only foundation siap.</p>}</article><article className="card"><span className="pill">QUESTIONNAIRE</span><h2>Template aktif</h2>{configuration.data ? <VersionList items={configuration.data.questionnaireVersions.map((item) => ({ label: item.code, version: item.version, status: item.status }))} /> : <p className="muted">Read-only foundation siap.</p>}</article><article className="card"><span className="pill">GOALS</span><h2>Goal configuration</h2>{configuration.data ? <VersionList items={configuration.data.goals.map((item) => ({ label: item.code, status: item.status }))} /> : <p className="muted">Read-only foundation siap.</p>}</article></section><div className="notice" style={{ marginTop: 24 }}>Editing belum diaktifkan. Seluruh content kesehatan development tetap berlabel requires expert validation.</div></AdminShell>;
}
