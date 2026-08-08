# SARIRA — Product Vision

**Status:** Phase 0 baseline · **Versi:** 0.1 · **Tanggal:** 5 Agustus 2026

## Tujuan

SARIRA membantu individu dan keluarga mengenali pola harian yang paling berpengaruh terhadap keseimbangan tubuh dan pertumbuhan, lalu memilih satu perubahan yang realistis, aman, dan dapat dijelaskan.

Tagline: **“Kenali Polamu, Seimbangkan Tubuhmu.”**

## Masalah yang Diselesaikan

Data makan, tidur, aktivitas, pertumbuhan, mood, dan keluhan tubuh biasanya tersebar, tidak konsisten, dan sulit diterjemahkan menjadi tindakan. Aplikasi kesehatan umum sering memberi terlalu banyak saran sekaligus atau menyampaikan keluaran tanpa alasan yang dapat ditelusuri. SARIRA mengubah catatan harian menjadi pola prioritas, bukti pendukung, dan tindakan mingguan yang terbatas serta transparan.

## Visi Produk

Menjadi pendamping keseimbangan tubuh dan pertumbuhan keluarga yang dipercaya karena keputusan dapat ditelusuri, keselamatan didahulukan, pengguna tetap memegang kendali atas data, dan AI tidak mengambil alih keputusan kesehatan.

## Pengguna yang Dilayani

- Pengguna langsung usia 12–75 tahun: Teen (12–17), Young Adult (18–25), Adult Balance (26–59), dan Healthy Aging (60–75).
- Orang tua/wali, pengasuh anak, calon orang tua, dan pendamping anggota keluarga.
- Administrator dan reviewer konten/ahli gizi sebagai peran operasional.

Usia anak yang dapat dibuat sebagai profil tanggungan pada Family Growth belum dikunci; lihat `OPEN_DECISIONS.md`.

## Nilai Utama

1. **Prioritas, bukan banjir saran.** Sistem memilih perubahan dengan dampak dan kelayakan tertinggi.
2. **Terjelaskan.** Pengguna dapat melihat data, rule, keterbatasan, confidence, dan bukti yang mendasari keluaran.
3. **Aman sesuai usia dan peran.** Safety screening, consent wali, pembatasan program, dan referral berlaku sebelum rekomendasi.
4. **Fleksibel terhadap kehidupan nyata.** Pengguna dapat memilih Guided Meal atau Flex Kitchen, memakai wearable atau input manual, serta mengubah tindakan mingguan.
5. **Tidak menghakimi.** Bahasa berfokus pada pola dan pilihan, bukan label moral terhadap makanan, tubuh, atau konsistensi pengguna.

## North Star dan Hasil Produk

**North Star candidate:** persentase pengguna yang menyelesaikan Weekly Action aman dan relevan sedikitnya 4 dari 7 hari, dengan data memadai dan tanpa safety override.

North Star ini masih harus divalidasi agar tidak mendorong pencatatan obsesif atau mengorbankan keselamatan. Metrik pendamping:

- baseline completion dan data sufficiency;
- pemahaman pengguna atas alasan rekomendasi;
- penerimaan atau penggantian Weekly Action;
- kejadian red/yellow safety path dan penyelesaian referral;
- consent withdrawal dan penghapusan data yang berhasil;
- laporan bahasa menghakimi atau keluaran yang tidak sesuai.

## Batas Visi

SARIRA bukan alat diagnosis, bukan pengganti tenaga kesehatan, tidak menjanjikan penambahan tinggi, tidak meresepkan obat/suplemen, dan tidak membuat keputusan berbasis AI generatif. Marketplace, transaksi makanan, konsultasi real-time, serta personalisasi machine learning lanjutan tidak termasuk MVP.

## Ukuran Keberhasilan Phase 0

- Visi, peran, alur, scope, safety, domain, dan quality requirements tidak saling bertentangan.
- Semua keluaran kesehatan memiliki pemilik keputusan yang jelas: rule pack berversi.
- Asumsi dan keputusan terbuka dipisahkan dari keputusan yang dikunci.
- MVP dapat dipotong menjadi backlog Phase 1 tanpa menambah ruang lingkup implisit.

