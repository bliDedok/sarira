# SARIRA — Privacy Requirements

**Status:** Phase 0 product requirements; wajib legal review

## Tujuan dan Dasar

SARIRA memproses data kesehatan/kebiasaan dan data anak yang sensitif. Requirements mengikuti privacy-by-default dan perlu divalidasi terhadap [UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) serta aturan lain yang berlaku pada wilayah/platform peluncuran.

## Data Purpose Matrix Minimum

| Kelompok data | Tujuan | Wajib/kondisional | Pengguna utama | Catatan |
|---|---|---|---|---|
| Account/contact | autentikasi, recovery, consent | Wajib | Account service | Pisahkan dari health profile bila mungkin |
| Usia/tanggal lahir | segmentasi, consent, eligibility | Wajib | Rules/consent | Exact DOB vs age perlu minimization review |
| Relationship/wali | otorisasi profil/consent | Kondisional | Access control | Bukti verifikasi retention terbatas |
| Health/routine logs | baseline, pattern, action | Kondisional per program | Expert system | AI menerima minimum |
| Allergy/pantangan | safety/menu filter | Kondisional, program makanan | Nutrition rules | Perubahan memicu invalidasi menu |
| Growth/illness | Family/Teen trend/referral | Kondisional | Domain rules | Sangat sensitif |
| Wearable | kenyamanan input | Opsional | Integration/rules | Permission granular; manual fallback |
| Audit | trace, safety, compliance | Wajib untuk aksi tertentu | Governance | Batasi payload sensitif |
| Analytics | product improvement | Opsional/terpisah sesuai legal | Analytics | Aggregate/pseudonymize |

## Requirements

- PRIV-001: setiap field memiliki purpose, lawful basis/consent determination, retention, recipient, sensitivity, dan deletion behavior.
- PRIV-002: consent tidak digabung paksa antara layanan inti, wearable, analytics, marketing, dan research.
- PRIV-003: privacy notice berlapis: ringkas sesuai usia + detail lengkap; versi dan receipt disimpan.
- PRIV-004: pengguna dapat melihat profil/relasi mana yang sedang aktif dan siapa yang memiliki akses.
- PRIV-005: akses pendamping/pengasuh granular (`view`, `log`, `manage`) dan dapat dicabut.
- PRIV-006: data tidak digunakan untuk iklan berbasis kondisi kesehatan atau body/weight targeting.
- PRIV-007: export, correction, deletion, restriction/objection workflow dan identity verification dirancang sebelum release.
- PRIV-008: deletion mencakup active store, derived outputs, search/vector indexes, cache, vendor queue; backup behavior dijelaskan.
- PRIV-009: withdrawn wearable permission menghentikan sync; data historis mengikuti pilihan/policy yang transparan.
- PRIV-010: vendor/processor dan cross-border transfer melalui assessment dan contract.
- PRIV-011: support/admin access memakai purpose, reason code, approval menurut risiko, audit, dan time-bound access.
- PRIV-012: log/telemetry tidak berisi journal text, symptom detail, token, atau direct identifier tanpa approval eksplisit.
- PRIV-013: breach/incident response, notification, evidence preservation, dan user support ditetapkan legal/security.
- PRIV-014: data untuk product research/training model memerlukan dasar dan consent terpisah; default tidak digunakan.

## Remaja dan Profil Tanggungan

- Wali harus tahu tujuan, scope, retention, sharing, dan cara mencabut.
- Remaja menerima assent/privacy explanation sesuai usia.
- Batas data yang dapat dilihat wali versus area privat remaja adalah keputusan legal/etis terbuka; tidak boleh diasumsikan total access.
- Saat profil subject mencapai usia 18, akses/consent harus ditinjau ulang dan kepemilikan ditransisikan sebelum pemrosesan baru.
- Pengasuh tidak mewarisi hak wali secara otomatis.

## AI/RAG/Analytics

- Pseudonymize/minimize payload; hindari direct identifiers.
- Model provider tidak boleh melatih model dari data SARIRA kecuali governance dan consent baru secara eksplisit mengizinkan.
- Vector/search index mewarisi classification, retention, deletion, dan access policy sumber.
- Evidence publik dan data profil disimpan sebagai kelas data terpisah.

## Error States

- Consent receipt tidak ditemukan: hentikan pemrosesan terkait sampai resolved.
- Delete/export gagal sebagian: tampilkan status per sistem dan eskalasi; jangan klaim selesai.
- Revoked relationship: token/sesi dan cached access segera di-invalidasi sesuai SLO.
- Unknown vendor status: blok transfer baru.

## Acceptance Criteria

- Semua data field terpetakan ke purpose/retention/access.
- Permission revocation efektif dan diuji end-to-end.
- User dapat menemukan siapa yang mengakses profil dalam ≤3 langkah candidate.
- Penghapusan diuji termasuk derived data/index/cache.
- Legal/privacy review menyetujui minor flow dan notice sebelum teen/family release.

## Open Legal Decisions

Yurisdiksi dan badan usaha, role pengendali/prosesor, data residency, retention, age verification, parental authority, confidentiality teen, emergency disclosure, research consent, serta klasifikasi produk/perangkat medis.
