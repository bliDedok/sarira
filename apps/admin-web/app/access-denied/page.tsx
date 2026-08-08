import Link from 'next/link';

export default function AccessDeniedPage() {
  return <div className="login-card-wrap" style={{ minHeight: '100vh' }}><div className="card login-card"><span className="pill">403 · ACCESS DENIED</span><h1>Akses belum diizinkan.</h1><p className="muted">Akun berhasil dikenali, tetapi tidak memiliki role admin yang diperlukan. Hubungi SUPER_ADMIN melalui proses resmi; jangan berbagi credential.</p><Link href="/login" className="button" style={{ display: 'grid', placeItems: 'center' }}>Kembali ke login</Link></div></div>;
}
