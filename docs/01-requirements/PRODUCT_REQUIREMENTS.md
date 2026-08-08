# SARIRA — Product Requirements Document

**Status:** Phase 0 baseline for review · **Versi:** 0.1 · **Tanggal:** 5 Agustus 2026

## 1. Tujuan

Dokumen ini menetapkan kebutuhan produk SARIRA sebelum desain dan implementasi. Detail lintas dokumen tunduk pada prinsip: **Rules Decide, Evidence Supports, AI Explains**.

## 2. Latar Belakang dan Outcome

SARIRA mengumpulkan data kebiasaan dan pertumbuhan, menilai keselamatan dan kecukupan data, membentuk Pattern Map yang dapat ditelusuri, lalu menawarkan satu Weekly Action. Outcome pengguna adalah memahami pola serta mencoba perubahan aman—bukan menerima diagnosis atau janji hasil biologis tertentu.

Outcome bisnis dan klinis kuantitatif belum dikunci. Phase 1 harus dimulai dengan discovery, validasi rule, serta target metrik yang tidak mendorong perilaku berisiko.

## 3. Aktor

- Teen 12–17, Young Adult 18–25, Adult 26–59, Healthy Aging 60–75.
- Orang tua/wali, pengasuh anak, calon orang tua, pendamping anggota keluarga.
- Administrator dan reviewer konten/ahli gizi.

Peran, akses, dan batasan lengkap terdapat pada `USER_ROLES.md`.

## 4. Prasyarat Penggunaan

1. Usia dan peran telah diberikan.
2. Terms/privacy consent wajib telah disetujui.
3. Untuk pengguna 12–17, consent wali aktif dan dapat dibuktikan.
4. Safety screening selesai atau statusnya memaksa jalur aman.
5. Program dipilih dan eligibility dinilai.
6. Pengguna memahami bahwa SARIRA bukan layanan diagnosis.

## 5. Scope Produk MVP

### 5.1 Fondasi lintas program

- Registrasi/login dan pemilihan peran/profil.
- Consent, kontrol izin, safety screening, dan referral.
- Kuesioner profil serta pilihan tujuan.
- Baseline 14 Hari, Early Pattern hari ke-7, Pattern Map hari ke-14.
- Weekly Action dan evaluasi mingguan.
- Expert system, explanation payload, citation cards, dan audit trail.
- Input manual; HealthKit/Health Connect ditargetkan MVP dengan keputusan sequencing pada `OPEN_DECISIONS.md`.

### 5.2 Program

1. Weight Balance: turun, naik, mempertahankan berat secara sehat, atau membangun kebiasaan.
2. Growth Path remaja: makan, protein/keragaman, tidur, aktivitas, kebugaran, postur, tinggi/berat, referral.
3. Family Growth: catatan pertumbuhan/makan/sakit/Posyandu, edukasi, dan referral.
4. Healthy Aging: makan, kekuatan, massa otot sebagai area pemantauan non-diagnostik, mobilitas, keseimbangan, aktivitas, tidur, risiko jatuh, referral.
5. Digestive Support: log keluhan, hubungan temporal dengan makanan, pola, edukasi, red flag, referral.
6. Guided Meal dan Flex Kitchen sebagai dua mode perencanaan makanan.

## 6. Alur Utama

Splash → Onboarding → Welcome → Login/Registrasi → Pilih Peran → Input Usia → Consent Wali bila perlu → Privacy Consent → Safety Screening → Pilih Tujuan → Kuesioner Profil → Pilih Program Makanan → Ringkasan Profil → Starter Journey → Baseline → Early Pattern H7 → Pattern Map H14 → Weekly Action → Evaluasi → Adaptasi.

Setiap tahap dapat memiliki jalur berhenti, tunda, data tidak cukup, atau referral. Detail ada pada `USER_FLOW.md`.

## 7. Baseline dan Kecukupan Data

### 7.1 Jadwal

- Hari 1–6: pengumpulan data dan bantuan pencatatan.
- Hari 7: Early Pattern/checkpoint, atau status belum cukup.
- Hari 8–13: pengumpulan dan koreksi data; bukan intervensi agresif.
- Hari 14: Pattern Map dan Weekly Action pertama jika eligible.

### 7.2 Data

Waktu/frekuensi makan; komposisi/porsi; minuman manis; sarapan; tidur; langkah; aktivitas; olahraga; mood; lapar/kenyang; hambatan; keluhan tubuh/pencernaan; dan konsistensi pencatatan.

Kecukupan harus dihitung per rule/domain, bukan hanya jumlah hari global. Threshold angka adalah keputusan klinis terbuka; nilai sementara untuk usability test tidak boleh dianggap tervalidasi.

## 8. Model Keputusan

```text
Input tervalidasi + provenance
  → consent/age/program eligibility
  → safety rules (override tertinggi)
  → data sufficiency
  → domain rule pack
  → priority/supporting pattern + confidence
  → Weekly Action/referral
  → evidence retrieval dari approved KB
  → AI explanation terikat pada payload
```

Setiap output menyimpan input field yang dipakai, rule/version, formula/dataset version, timestamp, safety status, tiga jenis confidence, evidence IDs, dan explanation version.

## 9. Business Rules yang Dikunci

- BR-001: AI tidak menentukan atau mengubah keputusan expert system.
- BR-002: Safety red mengalahkan program, Weekly Action, engagement, dan AI.
- BR-003: Remaja 12–17 tidak dapat melanjutkan program tanpa consent wali aktif.
- BR-004: Satu pengukuran/foto/kuesioner tidak boleh menghasilkan diagnosis stunting.
- BR-005: Growth Path tidak menjanjikan penambahan tinggi tertentu.
- BR-006: Untuk dewasa, growth diarahkan ke postur, fleksibilitas, kekuatan inti, mobilitas, dan kesehatan tulang.
- BR-007: Kalkulasi nutrisi hanya dari database, formula, dan rule berversi.
- BR-008: RAG hanya memakai evidence `approved` dan tidak mengubah keputusan.
- BR-009: Pengguna boleh menolak izin wearable dan tetap memakai input manual.
- BR-010: Sistem harus dapat mengembalikan `insufficient_data`.
- BR-011: Maksimal satu Weekly Action utama dalam satu siklus.
- BR-012: Tidak ada transaksi/pemesanan/pengantaran makanan dalam MVP.

## 10. Output Sistem Minimum

Setiap Early Pattern, Pattern Map, Weekly Action, atau referral menampilkan:

- judul dan ringkasan netral;
- data yang dipakai serta yang belum tersedia;
- safety status dan arti terbatasnya;
- rule ID/version dan alasan terpicu dalam bahasa pengguna;
- Data Confidence, Rule Confidence, Evidence Strength secara terpisah;
- keterbatasan/non-diagnosis;
- tindakan atau alternatif yang diperbolehkan;
- Citation Card jika ada klaim berbasis bukti;
- waktu evaluasi berikutnya atau instruksi referral.

## 11. Error dan Empty States

- Consent belum ada/kedaluwarsa: program terkunci, cara memperoleh consent ditampilkan.
- Permission ditolak: fitur yang terdampak dijelaskan; manual fallback tersedia.
- Data wearable kosong/duplikat: sumber dan koreksi tersedia; tidak diasumsikan nol aktivitas.
- Data nutrisi/resep tidak terverifikasi: tidak boleh dipakai untuk rekomendasi.
- Knowledge retrieval gagal: keputusan rule tetap tampil tanpa klaim/rujukan yang tidak tersedia.
- AI explanation gagal/menyimpang: tampilkan template deterministik dari payload.
- Data tidak cukup: tunjukkan field/hari yang perlu dilengkapi.
- Safety merah: keluaran program terkait disembunyikan/dibekukan dan referral ditonjolkan.

## 12. Acceptance Gate Tingkat Produk

MVP tidak boleh dirilis sampai:

1. rule pack aktif ditinjau pemilik domain dan memiliki test fixtures;
2. red/yellow referral content diverifikasi untuk wilayah peluncuran;
3. consent minor, privacy, deletion, dan account recovery melewati legal/privacy review;
4. tidak ada jalur AI yang dapat menulis nilai keputusan;
5. semua hasil dapat direproduksi dari input dan versi artefak;
6. accessibility dan usability test mencakup remaja, wali, dewasa, serta lansia;
7. monitoring safety, rollback, dan incident response siap.

## 13. Risiko

Risiko utama: salah tafsir sebagai diagnosis, rule klinis belum tervalidasi, target nutrisi tidak tepat, consent wali lemah, konflik data manual/wearable, over-notification, bias terhadap pengguna yang tidak rutin mencatat, dan cakupan MVP terlalu lebar. Register lengkap pada `PRODUCT_RISKS.md`.

## 14. Asumsi dan Validasi

- Bahasa peluncuran utama Indonesia; perlu dikonfirmasi.
- Peluncuran awal di Indonesia; perlu dikonfirmasi.
- Profil anak dapat berusia di bawah 12 walau pengguna mandiri minimal 12; batas usia harus diputuskan.
- Reviewer konten/ahli gizi adalah peran terpisah dari admin; dikunci sebagai prinsip least privilege, workflow detail perlu validasi.
- Exact data-sufficiency threshold, formula energi, target nutrisi, daftar red flag, dan service-level referral memerlukan panel ahli.

## 15. Dependensi Phase 1

Clinical governance, legal/privacy review, katalog sumber awal, rule specification template, dataset pangan/resep berlisensi, riset pengguna, threat model, dan keputusan platform/urutan program.

