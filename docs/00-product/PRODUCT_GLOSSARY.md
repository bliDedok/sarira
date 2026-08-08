# SARIRA — Product Glossary

**Status:** controlled vocabulary Phase 0

| Istilah | Definisi operasional | Catatan/batasan |
|---|---|---|
| Baseline 14 Hari | Periode observasi terstruktur hari 1–14 | Bukan masa “diet”; boleh berakhir sebagai data tidak cukup |
| Early Pattern | Ringkasan sementara pada hari ke-7 | Bukan kesimpulan final; hanya rule dengan data memadai |
| Pattern Map | Peta pola prioritas, pendukung, data, dan bukti pada hari ke-14 | Menampilkan keterbatasan dan confidence terpisah |
| Weekly Action | Satu tindakan utama selama satu minggu | Dipilih expert system; pengguna dapat memilih alternatif setara |
| Pattern Priority | Pola yang paling layak ditindak berdasarkan impact, safety, evidence, dan feasibility | Bukan diagnosis |
| Supporting Pattern | Pola relevan yang tidak menjadi tindakan utama | Tidak boleh menambah tuntutan tersembunyi |
| Safety Status | Hijau, kuning, atau merah dari rule safety | Bukan tingkat keparahan diagnosis |
| Hijau | Tidak ada trigger safety yang terdeteksi dari data tersedia | Tidak berarti bebas penyakit |
| Kuning | Ada kondisi yang membutuhkan kehati-hatian, pembatasan, atau konsultasi terjadwal | Rule menentukan fitur yang tetap boleh dipakai |
| Merah | Ada red flag yang memerlukan referral segera/urgent sesuai rule | Rekomendasi terkait dihentikan |
| Data Confidence | Derajat kelengkapan, kualitas, recency, dan konsistensi data input untuk hasil tertentu | Tidak menyatakan kebenaran medis |
| Rule Confidence | Kekuatan kecocokan data dengan kondisi rule, sesuai metode tervalidasi | Bukan output AI dan bukan probabilitas diagnosis |
| Evidence Strength | Tingkat kekuatan serta relevansi sumber pendukung | Terpisah dari confidence data/rule |
| Expert System | Mesin deterministik yang mengevaluasi rule pack berversi | Pemilik keputusan produk |
| Rule Pack | Kumpulan rule tervalidasi untuk domain/populasi tertentu | Memiliki versi, owner, reviewer, dan tanggal berlaku |
| Knowledge Base | Koleksi sumber, klaim, resep, dan metadata yang dikurasi | Hanya status approved dapat dipakai RAG |
| RAG | Mekanisme mengambil potongan sumber disetujui untuk mendukung penjelasan | Tidak menentukan keputusan |
| Citation Card | Tampilan metadata sumber dan alasan pemilihannya | Harus menuju sumber asli yang sah |
| Guided Meal | Menu dari resep terverifikasi dengan substitusi setara | Bukan pemesanan makanan |
| Flex Kitchen | Penyusunan resep sendiri dengan kalkulasi nutrisi formula-based | AI tidak menghitung nutrisi |
| Target Minimum | Ambang asupan yang perlu dicapai/diupayakan menurut formula/rule | Bahasa netral; konteks usia wajib |
| Target Range | Rentang rekomendasi | Nilai dan satuan selalu tampil |
| Maximum Limit | Batas yang tidak disarankan dilampaui | Bukan “jatah dosa” atau instrumen menghukum |
| Referral | Arahan mencari bantuan profesional/layanan yang sesuai | Tidak menjamin ketersediaan layanan |
| Consent Wali | Persetujuan wali terverifikasi untuk remaja 12–17 | Mekanisme verifikasi masih perlu validasi |
| Profil Tanggungan | Profil anak/anggota keluarga yang dikelola pengguna berwenang | Hak akses dan transisi kepemilikan harus ditetapkan |
| Manual Fallback | Input pengguna saat wearable tidak tersedia/diizinkan | Sumber data selalu ditandai |
| Program Eligibility | Status boleh, dibatasi, ditunda, atau tidak boleh mengikuti program | Ditentukan rule dan consent |
| Override | Keputusan berprioritas lebih tinggi yang membatasi keluaran lain | Safety override tidak dapat diubah AI/pengguna |

## Istilah yang Dihindari

“Diagnosis AI”, “prediksi tinggi”, “makanan baik/buruk”, “gagal diet”, “normal/tidak normal” tanpa konteks standar, “akurasi AI” untuk rule confidence, dan “sehat” sebagai klaim absolut.

