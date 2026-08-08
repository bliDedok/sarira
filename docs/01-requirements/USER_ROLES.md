# SARIRA — User Roles and Access

**Status:** Phase 0 baseline

## Tujuan

Menetapkan kebutuhan, tujuan, hak akses, batasan, dan alur tiap peran. Prinsip akses: pemisahan **account holder**, **profile subject**, dan **authorized supporter**.

## Model Akses

- **Account holder:** orang yang login dan bertanggung jawab atas akun.
- **Profile subject:** orang yang datanya dicatat dan dianalisis.
- **Profile manager:** account holder yang sah mengelola profil tanggungan.
- **Supporter:** orang yang diberi akses terbatas oleh profile subject/manager.
- **Operational role:** admin/reviewer dengan least privilege dan audit.

Satu orang dapat memegang lebih dari satu konteks, tetapi permission dievaluasi per profil dan aksi.

## Peran Pengguna

### 1. Sarira Teen — 12–17

- **Kebutuhan/tujuan:** memahami pola makan, tidur, aktivitas, kebugaran, postur, dan pertumbuhan tanpa diet ekstrem atau janji tinggi.
- **Hak:** melihat/mencatat data diri, melihat alasan hasil, memilih alternatif Weekly Action aman, mengelola izin opsional yang diizinkan kebijakan, dan meminta bantuan.
- **Batasan:** program terkunci sebelum consent wali aktif; tidak dapat mengubah verifikasi usia/wali; target/rekomendasi khusus remaja; fitur sharing harus default-private.
- **Alur:** registrasi → usia → hubungkan wali → assent remaja + consent wali → safety → Teen Growth/tujuan sesuai eligibility → baseline.
- **Safety:** pesan ramah usia; indikasi gangguan makan, distress, gejala serius, atau target berat ekstrem memicu rule yang perlu divalidasi ahli.

### 2. Sarira Young Adult — 18–25

- **Kebutuhan/tujuan:** transisi ke rutinitas mandiri, Weight Balance, kebiasaan, nutrisi fleksibel.
- **Hak:** kontrol penuh profil diri, consent, wearable, export/delete, program dan sharing.
- **Batasan:** tetap tunduk safety/eligibility; Growth Path tinggi tidak tersedia dan dialihkan ke fungsi/postur.
- **Alur:** onboarding mandiri → safety → tujuan → baseline → action.

### 3. Sarira Adult Balance — 26–59

- **Kebutuhan/tujuan:** menurunkan/menaikkan/menjaga berat secara sehat atau memperbaiki kebiasaan; postur/mobilitas bila memilih growth.
- **Hak:** sama dengan Young Adult; dapat menjadi wali, profile manager, atau pendamping pada profil lain.
- **Batasan:** akses profil lain hanya melalui hubungan terverifikasi; kondisi/red flag dapat membatasi Weight Balance.
- **Alur:** mandiri atau membuat profil tanggungan setelah consent/otorisasi.

### 4. Sarira Healthy Aging — 60–75

- **Kebutuhan/tujuan:** menjaga keteraturan makan, kekuatan, mobilitas, keseimbangan, aktivitas, tidur, dan mengurangi risiko jatuh.
- **Hak:** kontrol penuh profil; dapat mengundang pendamping dengan granular permission; input manual selalu tersedia.
- **Batasan:** pendamping tidak mengambil alih consent kecuali dasar kewenangan ditetapkan; program restriktif dibatasi oleh safety rule.
- **Alur:** onboarding sederhana → opsi pendamping → safety termasuk risiko jatuh → baseline → action fungsional.

### 5. Orang Tua atau Wali

- **Kebutuhan/tujuan:** memberi consent remaja, mengelola atau mendampingi profil anak, melihat safety/referral sesuai hak.
- **Hak:** approve/revoke consent, mengelola data tanggungan yang sah, mengatur permission, menerima pemberitahuan safety yang diizinkan kebijakan.
- **Batasan:** tidak otomatis melihat semua jurnal privat remaja; batas transparansi dan confidentiality harus divalidasi secara legal/etis. Tidak dapat mengubah catatan remaja tanpa provenance.
- **Alur:** verifikasi hubungan → tinjau privacy/safety → consent → atur akses → Family Growth/Teen link.

### 6. Pengasuh Anak

- **Kebutuhan/tujuan:** memasukkan makanan, pengukuran, sakit, dan Posyandu saat merawat anak.
- **Hak:** akses yang didelegasikan wali; create/edit log sesuai scope.
- **Batasan:** tidak memberi consent hukum kecuali juga wali sah; tidak mengelola akun/izin di luar delegasi; tidak melihat data orang tua.
- **Alur:** undangan wali → terima scope → catat → setiap catatan berlabel pengasuh.

### 7. Calon Orang Tua

- **Kebutuhan/tujuan:** edukasi umum dan pembentukan kebiasaan pra-keluarga.
- **Hak:** profil diri dan konten umum yang eligible.
- **Batasan:** tidak ada program kehamilan/medis khusus dalam brief MVP; tidak menerima diagnosis, supplement dose, atau fertility advice.
- **Alur:** profil dewasa → tujuan kebiasaan/edukasi → safety → program yang diizinkan.

### 8. Pendamping Anggota Keluarga

- **Kebutuhan/tujuan:** membantu pencatatan, mengingatkan action, mendukung lansia/anggota keluarga.
- **Hak:** view/log/acknowledge sesuai granular permission dan waktu akses.
- **Batasan:** tidak mengubah consent utama, tujuan, alergi, atau keputusan safety tanpa permission eksplisit; tidak dapat menutup red referral.
- **Alur:** undangan profile owner → pilih scope → aktivitas diaudit → owner dapat mencabut.

### 9. Administrator

- **Kebutuhan/tujuan:** operasi akun, konfigurasi non-klinis, dukungan, audit, incident handling.
- **Hak:** sesuai sub-role; akses data sensitif hanya just-in-time dengan reason code.
- **Batasan:** tidak otomatis menyetujui evidence/rule; tidak mengedit hasil historis; impersonation harus sangat dibatasi/ditandai jika kelak ada.
- **Alur:** akun staf + MFA → role assignment → aksi dengan audit → review berkala.

### 10. Reviewer Konten/Ahli Gizi

- **Kebutuhan/tujuan:** meninjau rule, resep, klaim, citation, dan copy keselamatan.
- **Hak:** draft/review/approve/reject/withdraw pada domain kewenangan; melihat data agregat atau test fixture, bukan profil nyata secara default.
- **Batasan:** tidak mengelola akun pengguna; tidak self-approve perubahan berisiko tinggi; konflik kepentingan dicatat.
- **Alur:** submission → conflict check → review evidence → keputusan + alasan → publish terjadwal → re-review.

## Matriks Permission Ringkas

| Aksi | Diri 18+ | Teen | Wali | Pengasuh | Pendamping | Admin | Reviewer |
|---|---:|---:|---:|---:|---:|---:|---:|
| Lihat/catat profil diri | Ya | Ya, setelah consent | Ya | N/A | N/A | Hanya support terbatas | Tidak |
| Kelola profil tanggungan | Jika berwenang | Tidak | Ya | Delegasi log | Delegasi | Tidak normal | Tidak |
| Beri consent minor | Jika wali | Assent, bukan consent wali | Ya | Tidak* | Tidak | Tidak | Tidak |
| Ubah permission sharing | Ya | Terbatas kebijakan | Ya untuk tanggungan | Tidak | Tidak | Support terbatas | Tidak |
| Lihat keputusan/sumber | Ya | Ya | Sesuai scope | Sesuai scope | Sesuai scope | Support terbatas | Test fixture |
| Approve rule/content | Tidak | Tidak | Tidak | Tidak | Tidak | Tidak default | Sesuai domain |

`*` Kecuali pengasuh juga memiliki status wali yang sah dan diverifikasi.

## Error States

- Hubungan wali gagal diverifikasi: simpan onboarding, jangan aktifkan program minor.
- Consent dicabut: hentikan rekomendasi baru untuk minor dan tampilkan dampak/opsi pengelolaan data.
- Undangan kedaluwarsa: tidak ada akses diberikan.
- Konflik edit: pertahankan kedua provenance, minta resolusi pemilik profil.
- Akses staf tidak sesuai: tolak, audit, dan alert sesuai risiko.

## Hal yang Perlu Divalidasi

Metode verifikasi usia/wali; hak privasi remaja versus notifikasi wali; batas usia profil anak; transisi kepemilikan saat remaja berusia 18; delegasi untuk lansia dengan kapasitas terbatas; dan apakah calon orang tua memerlukan program tersendiri atau hanya persona.

