# SARIRA — Consent Requirements

**Status:** Phase 0 product policy; mechanism needs legal/usability validation

## Tujuan

Memastikan consent spesifik, terinformasi, dapat dibuktikan, dapat dicabut, sesuai peran, dan bukan dark pattern.

## Jenis Consent/Permission

| ID | Jenis | Subjek | Wajib? | Dampak jika ditolak |
|---|---|---|---|---|
| CONS-CORE | Terms/privacy pemrosesan inti | Account/profile subject | Ya untuk layanan | Program tidak aktif |
| CONS-MINOR | Consent wali + assent remaja | 12–17 + wali | Ya | Program minor terkunci |
| CONS-DEPENDENT | Otorisasi profil tanggungan | Anak/anggota keluarga | Kondisional | Profil tidak dapat dikelola |
| CONS-WEAR | HealthKit/Health Connect per data type | Profile subject/manager | Tidak | Manual fallback |
| CONS-SHARE | Akses pengasuh/pendamping | Owner/manager | Tidak | Tidak ada sharing |
| CONS-NOTIF | Push/email reminder | Account holder | Tidak | In-app state tetap ada |
| CONS-ANALYTICS | Analytics non-esensial | Account holder | Tidak | Core product tetap tersedia |
| CONS-RESEARCH | Riset/model improvement | Subject/wali sesuai hukum | Tidak, terpisah | Data tidak digunakan |

## Prasyarat Consent Valid

- Identitas/peran dan kapasitas pemberi consent sesuai kebijakan.
- Tujuan, data, penerima, risiko/manfaat, masa berlaku, withdrawal, dan dampak penolakan dijelaskan.
- Bahasa sesuai usia/literasi, tidak ada pre-checked optional consent.
- Aksi afirmatif dan receipt berisi policy version, timestamp, actor, subject, purpose, evidence of action.
- Re-consent bila tujuan/material terms berubah atau saat age/relationship transition.

## Alur Minor 12–17

1. Remaja memasukkan usia dan kontak/tautan wali sesuai metode approved.
2. Program disimpan dalam keadaan locked; tidak ada rekomendasi personal.
3. Wali memverifikasi identitas/relationship melalui metode yang disetujui.
4. Wali membaca notice dan memberi/menolak consent.
5. Remaja membaca versi ramah usia dan memberi assent.
6. Sistem mencatat dua receipt dan permission matrix.
7. Bila salah satu dicabut/kedaluwarsa, rekomendasi baru berhenti; data ditangani menurut kebijakan transparan.

## Sharing Consent

- Scope granular: profile, data category, view/log/manage, waktu berlaku.
- Undangan single-use dan expires; penerima mengautentikasi diri.
- Owner melihat daftar akses aktif dan audit ringkas.
- Perubahan permission segera berlaku dan memberitahu pihak terdampak tanpa membuka data sensitif.

## Wearable Consent

SARIRA meminta hanya tipe data yang diperlukan, saat konteksnya jelas, dan menjelaskan nilai/fallback. Izin platform tetap otoritatif. Apple HealthKit memakai izin granular dan pengguna dapat mengubah izin; Android Health Connect menyediakan pengelolaan akses/sinkronisasi. Implementasi harus mengikuti dokumentasi platform aktif saat Phase 1.

## Withdrawal

Withdrawal semudah pemberian consent, tidak memerlukan alasan, dan menjelaskan:

- pemrosesan apa yang berhenti;
- fitur yang tidak lagi bekerja;
- nasib data historis/derived outputs;
- pilihan delete/export;
- kapan perubahan efektif dan cara eskalasi jika gagal.

## Error States

Expired link, duplicate guardian, mismatched profile, revoked guardian authority, age changed, stale policy version, offline consent, dan partial service failure. Tidak ada silent fallback ke consent lama untuk tujuan baru.

## Acceptance Criteria

- Consent receipt dapat direkonstruksi dan policy content dapat ditampilkan ulang.
- Optional consent dapat ditolak tanpa pola manipulatif.
- Minor tidak dapat melewati guard melalui perubahan client-side atau deep link.
- Revocation menghapus akses delegated pada semua sesi/cache sesuai SLO.
- Comprehension test menunjukkan remaja dan wali memahami siapa melihat apa.

## Hal yang Perlu Divalidasi

Verifikasi usia/identitas/wali, dual-parent scenarios, sengketa guardianship, orphaned account, confidentiality remaja, re-consent cadence, dan bukti assent untuk rentang 12–17.

