# SARIRA — Functional Requirements

**Status:** Phase 0 baseline · **Konvensi:** `FR-[DOMAIN]-[NNN]`

## Tujuan

Menjadi katalog kebutuhan fungsional tingkat produk. Detail domain menambahkan acceptance criteria tanpa mengganti ID di sini.

## Akun, Peran, Profil, dan Consent

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-AUTH-001 | Sistem harus mendukung registrasi, login, logout, pemulihan akun, dan penghentian sesi. | Must |
| FR-AUTH-002 | Sistem harus meminta pemilihan peran sebelum membuat profil program. | Must |
| FR-PROF-001 | Sistem harus menyimpan tanggal lahir/usia, peran, tujuan, preferensi, alergi, pantangan, kondisi relevan, dan sumber data dengan consent yang sesuai. | Must |
| FR-PROF-002 | Satu akun berwenang dapat mengelola profil diri dan/atau profil tanggungan sesuai relasi akses. | Must |
| FR-PROF-003 | Sistem harus menilai ulang segmentasi usia dan eligibility ketika usia berubah melewati batas kelompok. | Must |
| FR-CONS-001 | Sistem harus mencatat versi, waktu, tujuan, dan status setiap consent. | Must |
| FR-CONS-002 | Pengguna 12–17 harus diblokir dari program sampai consent wali terverifikasi dan aktif. | Must |
| FR-CONS-003 | Sistem harus mendukung penolakan atau pencabutan izin opsional tanpa mengunci fitur inti yang memiliki fallback. | Must |
| FR-CONS-004 | Pengguna harus dapat meminta ekspor, koreksi, dan penghapusan data sesuai kebijakan yang berlaku. | Must |

## Safety dan Eligibility

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SAFE-001 | Safety screening harus dilakukan sebelum rekomendasi program. | Must |
| FR-SAFE-002 | Expert system harus mengembalikan status hijau, kuning, atau merah beserta rule trace. | Must |
| FR-SAFE-003 | Red status harus menghentikan keluaran terkait dan menampilkan referral berprioritas tinggi. | Must |
| FR-SAFE-004 | Yellow status harus menerapkan pembatasan yang ditetapkan rule dan menampilkan saran konsultasi. | Must |
| FR-SAFE-005 | Sistem harus melakukan re-screen ketika ada data baru yang relevan atau jawaban red flag berubah. | Must |
| FR-SAFE-006 | Pengguna dapat mengakui referral, melihat ulang instruksi, dan mencatat bahwa bantuan telah dicari tanpa dipaksa memberi diagnosis. | Should |
| FR-ELIG-001 | Sistem harus menentukan program `allowed`, `limited`, `deferred`, atau `not_allowed` berdasarkan usia, consent, data, dan safety. | Must |

## Onboarding dan Baseline

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-ONBD-001 | Sistem harus menjalankan urutan onboarding dan menyimpan progres yang dapat dilanjutkan. | Must |
| FR-ONBD-002 | Ringkasan profil harus dapat dikoreksi sebelum Starter Journey dimulai. | Must |
| FR-BASE-001 | Sistem harus mengumpulkan seluruh kategori data baseline yang relevan dan membedakan field wajib, kondisional, dan opsional. | Must |
| FR-BASE-002 | Setiap catatan harus memiliki waktu, pemilik profil, sumber, status edit, dan unit bila berlaku. | Must |
| FR-BASE-003 | Sistem harus menghitung kecukupan data per rule/domain dan menjelaskan kekurangan data. | Must |
| FR-BASE-004 | Hari ke-7 harus memicu Early Pattern atau `insufficient_data`, bukan kesimpulan paksa. | Must |
| FR-BASE-005 | Hari ke-14 harus memicu Pattern Map dan Weekly Action bila safety/eligibility/data memadai. | Must |
| FR-BASE-006 | Koreksi data harus menandai hasil terdampak dan memicu evaluasi ulang. | Must |

## Pattern, Weekly Action, dan Evaluasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-PATT-001 | Expert system harus menghasilkan paling banyak satu pola prioritas serta nol atau lebih pola pendukung. | Must |
| FR-PATT-002 | Pattern Map harus menampilkan data trace, rule trace, tiga confidence, keterbatasan, dan sumber bukti. | Must |
| FR-PATT-003 | Penjelasan AI harus terikat pada payload keputusan dan tidak dapat mengubah field keputusan. | Must |
| FR-WKLY-001 | Sistem harus memberi satu Weekly Action utama yang aman, spesifik, dan dapat dievaluasi. | Must |
| FR-WKLY-002 | Pengguna dapat menerima, menunda, atau memilih alternatif setara yang telah disetujui rule. | Must |
| FR-WKLY-003 | Evaluasi mingguan harus menangkap pelaksanaan, hambatan, feedback, perubahan safety, dan preferensi. | Must |
| FR-WKLY-004 | Adaptasi harus mempertahankan, menyederhanakan, mengganti, atau menghentikan action melalui rule berversi. | Must |

## Makanan dan Nutrisi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-FOOD-001 | Pengguna harus dapat memilih Guided Meal atau Flex Kitchen dan berganti mode tanpa kehilangan histori. | Must |
| FR-MEAL-001 | Guided Meal harus memfilter resep terverifikasi berdasarkan profil, tujuan, kebutuhan, alergi, pantangan, preferensi, anggaran, waktu, bahan, dan alat. | Must |
| FR-MEAL-002 | Penggantian menu hanya boleh memakai alternatif setara yang lolos safety dan nutrition rules. | Must |
| FR-FLEX-001 | Flex Kitchen harus menghitung nutrisi bahan dan per porsi memakai database/formula berversi. | Must |
| FR-FLEX-002 | Indikator harus diperbarui ketika bahan, kuantitas, hasil porsi, atau metode masak berubah. | Must |
| FR-FLEX-003 | Sistem harus menampilkan kekurangan, sisa batas, alternatif bahan, serta peringatan alergi/pantangan. | Must |
| FR-FLEX-004 | Pengguna dapat menyimpan, menyalin, memperbarui, dan menghapus resep pribadi. | Must |
| FR-NUTR-001 | Sistem harus mengelompokkan indikator sebagai target minimum, target range, atau batas maksimum. | Must |
| FR-NUTR-002 | Energi, protein, karbohidrat, lemak, serat, cairan, gula, natrium, lemak jenuh, dan keragaman makanan harus didukung jika target tervalidasi tersedia. | Must |
| FR-NUTR-003 | AI tidak boleh menghitung, menebak, atau mengoreksi angka nutrisi. | Must |

## Program Domain

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-WBAL-001 | Weight Balance harus mendukung turun, naik, mempertahankan berat, dan kebiasaan sehat tanpa target ekstrem. | Must |
| FR-GROW-001 | Teen Growth harus menilai makan, protein/keragaman, tidur, aktivitas, kebugaran, postur, serta tren tinggi/berat. | Must |
| FR-GROW-002 | Teen Growth tidak boleh menjanjikan tinggi; red/yellow rule harus dapat memicu referral. | Must |
| FR-GROW-003 | Pengguna dewasa yang memilih “growth” harus dialihkan ke postur, fleksibilitas, kekuatan inti, mobilitas, dan kesehatan tulang. | Must |
| FR-FAM-001 | Family Growth harus mendukung tinggi/panjang, berat, makanan, keragaman, riwayat sakit, dan kunjungan Posyandu. | Must |
| FR-FAM-002 | Family Growth tidak boleh menyimpulkan stunting dari satu pengukuran, foto, atau kuesioner. | Must |
| FR-AGE-001 | Healthy Aging harus mendukung makan, kekuatan, mobilitas, keseimbangan, aktivitas, tidur, dan screening risiko jatuh. | Must |
| FR-DIG-001 | Digestive Support harus menghubungkan waktu keluhan dengan waktu makanan sebagai pola temporal, bukan kausalitas/diagnosis. | Must |
| FR-DIG-002 | Digestive red flags harus dievaluasi rule dan menghasilkan referral. | Must |

## Wearable dan Provenance

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-WEAR-001 | Sistem harus mendukung langkah, jarak, active minutes, workout, dan tidur dari sumber yang disetujui. | Must |
| FR-WEAR-002 | Pengguna dapat menghubungkan HealthKit/Health Connect dengan izin granular dan mencabutnya. | Must |
| FR-WEAR-003 | Input manual harus tersedia sebagai fallback dan diberi label sumber. | Must |
| FR-WEAR-004 | Sistem harus mendeteksi/menangani duplikasi menurut kebijakan provenance deterministik. | Must |

## Knowledge, AI, dan Operasional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-RAG-001 | RAG hanya boleh mengambil sumber `approved`, berlaku, cocok usia/domain, dan memiliki provenance lengkap. | Must |
| FR-RAG-002 | Citation Card harus menampilkan seluruh metadata wajib dan tautan asli yang sah. | Must |
| FR-RAG-003 | Jika bukti tidak tersedia, AI tidak boleh membuat citation atau klaim pendukung baru. | Must |
| FR-AI-001 | Sistem harus memvalidasi explanation terhadap decision payload dan menyediakan fallback deterministik. | Must |
| FR-ADM-001 | Admin harus dapat mengelola pengguna/akses operasional tanpa hak otomatis menyetujui konten klinis. | Must |
| FR-REV-001 | Reviewer harus dapat membuat, meninjau, menyetujui, menolak, menjadwalkan review ulang, dan menarik evidence/rule/content sesuai kewenangan. | Must |
| FR-AUD-001 | Sistem harus merekam audit event untuk consent, keputusan, perubahan rule/content, akses data sensitif, dan override. | Must |

## Acceptance Criteria Katalog

- Setiap `Must` dipetakan ke satu atau lebih skenario di `ACCEPTANCE_CRITERIA.md` sebelum build.
- Requirement yang memerlukan angka klinis tidak dianggap implementable sampai nilai, sumber, versioning, dan reviewer disetujui.
- Konflik antara requirement diselesaikan menurut hierarki pada `PRODUCT_PRINCIPLES.md` dan dicatat sebagai decision record.

