# SARIRA — Safety and Expert-System Rules

**Status:** product contract; clinical thresholds/content not yet validated

## Tujuan

Menetapkan cara expert system membuat keputusan secara deterministik, dapat ditelusuri, dan fail-safe. Dokumen ini bukan daftar klinis final.

## Hierarki Evaluasi

1. Validasi profil, usia, relationship, dan consent.
2. Validasi data: unit, range, recency, provenance, missing/unknown.
3. Evaluasi safety rules lintas domain.
4. Terapkan override tertinggi (merah > kuning > hijau).
5. Evaluasi program eligibility.
6. Evaluasi data sufficiency per rule.
7. Evaluasi domain pattern, priority, Weekly Action, dan referral.
8. Ambil evidence approved dan bangun explanation.

AI/RAG tidak berada pada langkah 1–7 sebagai decision maker.

## Safety Status Contract

| Status | Arti | Perilaku sistem |
|---|---|---|
| Hijau | Tidak ada trigger kuning/merah dari data yang tersedia | Program yang eligible boleh berjalan; disclaimer keterbatasan tetap tampil |
| Kuning | Perlu kehati-hatian, pembatasan, verifikasi, atau konsultasi terjadwal | Rule menentukan fitur/action allowed; tampilkan alasan dan referral |
| Merah | Ada red flag/urgent condition menurut rule | Suppress/hentikan rekomendasi terkait; tampilkan referral urgent; re-screen tidak menunda bantuan |
| Unknown | Safety belum dapat ditentukan karena data wajib tidak ada/invalid | Jangan default ke hijau; minta data atau arahkan bantuan sesuai rule |

Tidak ada dismiss permanen untuk status merah. Acknowledgement tidak mengubah status.

## Anatomi Rule

Setiap rule wajib memiliki:

- `rule_id`, nama, rule pack, semantic version, status, effective/expiry date;
- tujuan, populasi/usia, program, inclusion/exclusion;
- input field, unit, acceptable range, recency, source precedence;
- data minimum dan missing-data behavior;
- kondisi deterministik dan conflict resolution;
- output: safety, eligibility, pattern, action/referral, confidence method;
- explanation facts yang boleh digunakan;
- evidence IDs dan evidence strength;
- owner, expert reviewer, legal/privacy reviewer bila relevan;
- positive, negative, boundary, missing, conflict, dan regression test fixtures;
- monitoring signal, rollback rule, dan changelog.

## Rule Confidence

Rule Confidence dihitung oleh metode berversi dari kecocokan input valid terhadap kondisi rule, termasuk konsistensi/ulang pengamatan bila memang ditetapkan rule. Dilarang:

- menggunakan skor AI/LLM;
- menyamakannya dengan peluang penyakit;
- meningkatkan confidence karena pengguna sering membuka aplikasi;
- menyembunyikan rendahnya Data Confidence.

Label numerik atau kategori (`rendah/sedang/tinggi`) belum dikunci; harus diuji pemahaman.

## Rule Packs

### Teen Growth Rule Pack (`TG`)

- **Tujuan:** pola makan/protein/keragaman, tidur, aktivitas/kebugaran, postur, dan tren tinggi/berat yang sesuai remaja.
- **Guard:** usia 12–17, consent wali aktif, larangan janji tinggi, safety eating/weight/growth.
- **Output:** priority/supporting pattern, action kebiasaan, measurement guidance, referral.
- **Tidak boleh:** prediksi tinggi, diet restriktif otomatis, diagnosis growth disorder.

### Adult Weight Balance Rule Pack (`AWB`)

- **Tujuan:** tujuan turun/naik/maintain/kebiasaan yang realistis; pola makan, tidur, aktivitas, hambatan.
- **Guard:** usia 18–59 sebagai default pack; kondisi/safety dapat membatasi target.
- **Output:** priority/action, energy/nutrition strategy dari formula approved, referral.
- **Tidak boleh:** target ekstrem, diagnosis, rekomendasi obat/suplemen dosis.

Tujuan keseimbangan berat pada usia 12–17 dievaluasi melalui Teen Growth + Nutrition Recommendation rules, bukan AWB. Pada usia 60–75, Healthy Aging + Nutrition Recommendation rules menjaga agar fungsi dan keselamatan tetap menjadi prioritas.

### Healthy Aging Rule Pack (`HA`)

- **Tujuan:** keteraturan makan, kecukupan terkait fungsi, kekuatan, mobilitas, keseimbangan, aktivitas, tidur, risiko jatuh.
- **Guard:** usia 60–75, accessibility/supporter context, fall/symptom safety.
- **Output:** functional action, restriction/referral.
- **Tidak boleh:** menyimpulkan sarcopenia/penyakit atau mendorong restriksi yang membahayakan fungsi.

### Family Growth Rule Pack (`FG`)

- **Tujuan:** kualitas/tren pengukuran, makan/keragaman, sakit, Posyandu, education/referral.
- **Guard:** umur anak, standar pertumbuhan yang tepat, jenis kelamin/data yang dibutuhkan, teknik dan pengukuran berulang.
- **Output:** remeasure guidance, pattern/trend, referral.
- **Tidak boleh:** diagnosis stunting dari satu pengukuran, foto, atau kuesioner.

### Digestive Support Rule Pack (`DS`)

- **Tujuan:** pola temporal keluhan-makanan, frequency/duration/severity, red flag, general education/referral.
- **Guard:** symptom recency/severity, age/program context.
- **Output:** neutral pattern, log guidance, safe education, referral.
- **Tidak boleh:** menyatakan makanan menyebabkan penyakit atau memberi diagnosis gastrointestinal.

### Nutrition Recommendation Rule Pack (`NR`)

- **Tujuan:** eligibility target, minimum/range/maximum, menu filter, substitution equivalence, allergen/pantangan.
- **Guard:** age, goal, formula/dataset version, condition exclusions, unknown ingredient.
- **Output:** calculated indicators, warnings, approved alternatives.
- **Tidak boleh:** angka hasil AI, tebakan komposisi, menimpa allergen warning.

## Pola Konflik dan Override

- Rule merah berbeda domain → tampilkan semua instruksi non-duplikat menurut urgency; jangan menurunkan status.
- Safety vs goal → safety menang; goal disimpan tetapi deferred/not allowed.
- Manual vs wearable → provenance policy menentukan observasi, bukan rata-rata otomatis.
- Rule versions → hasil baru memakai versi efektif; hasil lama immutable.
- Evidence withdrawn → rule owner menilai apakah rule harus ditarik; RAG langsung berhenti memakai evidence.

## Error States

- Rule service unavailable/unknown version: tidak menerbitkan rekomendasi baru.
- Invalid unit/outlier: minta konfirmasi; jangan pakai untuk keputusan sampai resolved.
- Missing safety field: `unknown`, bukan hijau.
- Rule loop/multiple primary priorities: resolver deterministik atau no-result + incident.
- Explanation tidak sesuai payload: blok explanation, tampilkan template.

## Acceptance Criteria

- Input dan version sama menghasilkan output sama.
- Setiap output dapat direkonstruksi hingga field dan rule condition.
- Setiap pack lulus test positive/negative/boundary/missing/conflict.
- AI dan content layer tidak dapat menulis status/priority/action/referral.
- Perubahan rule berisiko tinggi melalui dual review dan rollback drill.

## Validasi Wajib

Panel ahli harus menetapkan daftar red/yellow flag, threshold, recency, data minimum, conflict resolution, confidence bands, wording, referral urgency, dan review cadence sebelum implementasi rule pack.
