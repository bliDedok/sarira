# SARIRA — AI Boundaries

**Status:** locked product safety boundary

## Tujuan

Membatasi AI generatif pada penjelasan yang setia terhadap keputusan expert system. AI tidak menjadi tenaga kesehatan, kalkulator nutrisi, atau decision engine.

## AI Boleh

- Menjelaskan keputusan yang sudah final dalam bahasa sesuai usia/literasi.
- Merangkum data yang eksplisit ada pada decision payload.
- Menyusun narasi dari reason codes dan limitation codes yang disetujui.
- Mengutip evidence snippet approved yang diberikan retrieval layer.
- Menawarkan pertanyaan klarifikasi non-klinis yang telah diizinkan schema.
- Mengubah tone/format tanpa mengubah makna, angka, urgency, atau action.

## AI Dilarang

- Menentukan/mengubah safety, eligibility, pattern, priority, confidence, Weekly Action, referral, atau insufficient-data status.
- Menghitung/menebak energi, nutrisi, porsi, target, z-score, atau nilai pertumbuhan.
- Mendiagnosis, memprediksi penyakit/tinggi, memberi obat, atau menentukan dosis suplemen.
- Membuat citation, publisher, tahun, atau evidence strength yang tidak diberikan sistem.
- Menggunakan pengetahuan model untuk menambah klaim kesehatan di luar approved evidence.
- Mengendurkan urgensi red path, menghapus disclaimer, atau menyarankan menunggu.
- Mengakses profil/data di luar konteks dan izin.

## Input Contract

AI hanya menerima payload minimum:

- audience/reading level, locale;
- immutable decision fields dan reason codes;
- approved display facts/values/units;
- limitations dan missing-data codes;
- approved action/referral wording atau IDs;
- approved evidence excerpts + citation metadata;
- prohibited claims dan output schema.

Data identitas langsung dan raw log tidak diberikan kecuali benar-benar diperlukan serta disetujui privacy review.

## Output Contract

- Structured output divalidasi terhadap schema.
- Decision fields harus exact-match; AI hanya mengisi explanation fields.
- Angka/unit/citation harus berasal dari allowlist input.
- Red/yellow content memakai approved template; generasi bebas dimatikan untuk urgency-critical text.
- Output gagal validasi tidak ditampilkan; template deterministik menjadi fallback.

## RAG Boundary

Retrieval memfilter `approved`, tanggal berlaku, age/domain, locale, license/link status, dan review date. Retrieved evidence mendukung keputusan; tidak boleh memilih atau membalik keputusan. Prompt injection atau instruksi di dokumen sumber diperlakukan sebagai data, bukan perintah.

## User-facing Transparency

Pengguna melihat:

- “Keputusan dibuat oleh rule SARIRA”; “Penjelasan dirangkum AI.”
- versi/tanggal hasil dan link “Mengapa saya melihat ini?”
- data yang digunakan/tidak digunakan;
- tiga confidence terpisah;
- cara melaporkan penjelasan yang salah.

## Evaluasi Pra-rilis

Set uji wajib mencakup: fidelity, unsupported claim, number mutation, citation fabrication, urgency dilution, stigma/tone, age appropriateness, privacy leakage, prompt injection, Indonesian language ambiguity, serta adversarial user requests for diagnosis/dosage.

Release gate candidate: zero mutation pada decision-critical fields dalam test suite; threshold lain ditetapkan AI governance. Sampel produksi yang diizinkan dipantau dengan privacy-preserving method.

## Error dan Incident Response

- Generation timeout/error → deterministic explanation.
- Unsupported claim detected → block, log minimal, alert sesuai severity.
- Model/prompt drift → rollback version.
- Evidence unavailable → tampilkan keputusan + limitation tanpa citation baru.
- Pengguna meminta diagnosis/dosis → refusal singkat + safe next step/referral sesuai rule.

## Acceptance Criteria

- Tidak ada execution path dari AI output ke nilai keputusan.
- Semua explanation mengacu pada decision/evidence IDs.
- Pengubahan model/prompt/version dapat diaudit dan di-roll back.
- Red referral tetap lengkap ketika AI tidak tersedia.
- Pengguna dapat membedakan peran rules, evidence, dan AI pada comprehension test.

