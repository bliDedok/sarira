# SARIRA — Product Positioning

**Status:** Phase 0 baseline · **Versi:** 0.1

## Pernyataan Positioning

Untuk individu usia 12–75 tahun dan keluarga yang ingin memahami hubungan antara kebiasaan harian dan keseimbangan tubuh, SARIRA adalah pendamping berbasis expert system dan AI yang mempelajari pola makan, tidur, aktivitas, olahraga, pertumbuhan, keluhan tubuh, dan rutinitas untuk menentukan perubahan yang paling perlu diprioritaskan. Berbeda dari pelacak kebiasaan umum atau chatbot kesehatan, SARIRA memisahkan keputusan rule-based, bukti pendukung, dan penjelasan AI sehingga alasan, keterbatasan, confidence, dan sumber dapat dilihat pengguna.

## Kategori Produk

Pendamping wellness, nutrisi, pertumbuhan keluarga, dan pembentukan kebiasaan. SARIRA bukan perangkat diagnosis atau layanan klinis kecuali klasifikasi regulasi di masa depan memutuskan lain; bila demikian, scope dan kontrol harus dinilai ulang sebelum rilis.

## Jobs to Be Done

| Pengguna | Ketika | Ingin | Agar |
|---|---|---|---|
| Individu | catatan hariannya terasa acak | melihat pola prioritas | tahu perubahan kecil mana yang dimulai |
| Remaja | ingin mendukung pertumbuhan | panduan aman sesuai usia | tidak terjebak janji tinggi atau diet restriktif |
| Orang tua/pengasuh | memantau pertumbuhan anak | mencatat tren dan tanda perlu bantuan | dapat bertindak tepat waktu tanpa diagnosis mandiri |
| Dewasa | ingin menyeimbangkan berat/kebiasaan | target dan menu fleksibel | bisa bertahan dalam rutinitas nyata |
| Lanjut usia/pendamping | menjaga fungsi harian | memantau makan, kekuatan, mobilitas, keseimbangan | risiko penurunan fungsi atau jatuh dikenali lebih awal |

## Pembeda Inti

- **Rules Decide:** hanya expert system tervalidasi yang menentukan pola, safety, program, Weekly Action, dan referral.
- **Evidence Supports:** knowledge base terkurasi dan RAG hanya mengambil sumber disetujui.
- **AI Explains:** AI merangkum hasil tanpa mengubah keputusan, angka, atau urgensi.
- **Data can be insufficient:** sistem boleh menunda kesimpulan.
- **User control:** pengguna dapat melihat sumber data, mengoreksi catatan, menolak izin opsional, dan memilih alternatif aman.

## Pesan yang Boleh dan Tidak Boleh

**Boleh:** “Catatan 10 hari menunjukkan waktu tidur tidak konsisten. Rule TG-SLEEP-04 menjadikan tidur sebagai prioritas minggu ini. Bukti pendukung dan keterbatasan tersedia.”

**Tidak boleh:** “AI kami mendiagnosis penyebab berat badan Anda,” “tinggi akan bertambah 5 cm,” “makanan ini buruk,” atau “abaikan saran tenaga kesehatan.”

## Segmen Peluncuran yang Disarankan

MVP tetap mendefinisikan seluruh program yang diminta, tetapi peluncuran perlu bertahap. Kandidat urutan validasi: Adult Weight Balance → Teen Growth (dengan governance wali) → Healthy Aging → Family Growth → Digestive Support. Urutan ini **belum keputusan final** karena beban validasi klinis, sasaran bisnis, serta kapasitas reviewer belum tersedia.

## Risiko Positioning

- Istilah “AI” dapat membuat pengguna menganggap produk mendiagnosis.
- “Growth” dapat disalahartikan sebagai janji tinggi atau diagnosis stunting.
- Cakupan usia 12–75 dan profil anak membuat satu pesan produk terlalu luas.
- Istilah “confidence” dapat dianggap probabilitas medis jika tidak dijelaskan.

Mitigasi: disclaimer kontekstual, istilah confidence terpisah, onboarding berbasis program, dan uji pemahaman dengan tiap kelompok usia.

