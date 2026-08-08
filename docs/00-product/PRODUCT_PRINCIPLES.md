# SARIRA — Product Principles

**Status:** dikunci untuk Phase 0

## Prinsip Keputusan

### P-01 — Rules Decide, Evidence Supports, AI Explains

Expert system berversi adalah satu-satunya komponen yang boleh menetapkan pola prioritas/pendukung, safety status, rule confidence, Weekly Action, referral, kecukupan data, dan kelayakan program. Knowledge base mendukung; AI menjelaskan. Konflik selalu dimenangkan oleh rule engine.

### P-02 — Safety Before Engagement

Red flag, contraindication, consent, dan pembatasan program dievaluasi sebelum target keterlibatan. Sistem tidak boleh memakai streak, notifikasi, atau copy persuasif untuk menunda referral.

### P-03 — Insufficient Data Is a Valid Result

Tidak ada kesimpulan tanpa cakupan data minimum rule terkait. UI menyatakan apa yang kurang, mengapa dibutuhkan, dan cara melengkapinya tanpa menyalahkan pengguna.

### P-04 — One Explainable Priority

Weekly Action utama dibatasi satu pada satu waktu. Pola pendukung boleh ditampilkan, tetapi tidak menjadi tuntutan tambahan tanpa persetujuan pengguna.

### P-05 — User Agency and Reversibility

Pengguna dapat memperbaiki catatan, mengganti tindakan dengan alternatif setara, memilih input manual, mencabut izin, dan menghentikan program. Perubahan yang berdampak pada keputusan harus memicu evaluasi ulang yang terlihat.

### P-06 — Age and Role Appropriate

Bahasa, consent, akses data, target nutrisi, program, dan safety disesuaikan usia serta hubungan pengguna dengan profil. Remaja 12–17 membutuhkan persetujuan wali sebagai kebijakan produk.

### P-07 — Neutral, Non-stigmatizing Language

Gunakan “lebih/kurang dari rentang”, “belum tercatat”, dan “pilihan alternatif”; hindari “nakal”, “gagal”, “buruk”, “cheat”, atau label bentuk tubuh. Tidak ada gamification yang menghukum makan atau berat.

### P-08 — Version Everything That Can Affect an Outcome

Rule, formula nutrisi, dataset pangan, resep, evidence record, prompt penjelasan, dan copy safety memiliki ID, versi, tanggal berlaku, reviewer, serta changelog. Hasil menyimpan versi yang dipakai.

### P-09 — Privacy by Default

Kumpulkan data minimum untuk tujuan yang dijelaskan. Izin wearable dan data opsional bersifat granular. Data kesehatan, anak, dan wali diperlakukan sebagai data sensitif; pemilik profil dapat mengakses hak yang sesuai per kebijakan/legal review.

### P-10 — Escalate, Do Not Diagnose

SARIRA mendeteksi kondisi pemicu referral berdasarkan rule, bukan memberi label penyakit. Jalur merah menghentikan rekomendasi yang berpotensi menunda bantuan.

## Hierarki Penyelesaian Konflik

1. Safety dan kewajiban hukum.
2. Validitas klinis/nutrisi dan batas usia.
3. Consent serta kontrol pengguna.
4. Ketertelusuran keputusan.
5. Kegunaan dan aksesibilitas.
6. Engagement dan tujuan bisnis.

## Definition of Done Produk

Fitur yang menghasilkan saran belum selesai sampai memiliki rule owner, data minimum, jalur insufficient-data, safety override, explanation payload, citation behavior, versi, audit event, error state, dan acceptance criteria.

