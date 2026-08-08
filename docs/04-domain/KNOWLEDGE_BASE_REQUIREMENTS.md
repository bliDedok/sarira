# SARIRA — Knowledge Base, RAG, and Citation Requirements

**Status:** Phase 0 governance baseline

## Tujuan

Memastikan evidence yang mendukung penjelasan SARIRA sah, relevan, terkurasi, terbarui, dapat ditelusuri, dan tidak mengubah keputusan expert system.

## Aktor

Content author/curator, reviewer ahli, legal/licensing reviewer, admin publishing, expert system, retrieval service, AI explanation service, pengguna.

## Prioritas Sumber

1. Pedoman resmi Indonesia.
2. WHO, UNICEF, FAO, dan BPOM.
3. Pedoman organisasi profesi.
4. Jurnal ilmiah/PubMed.
5. Artikel edukasi medis yang dikurasi.
6. Resep resmi atau ditinjau ahli.
7. Konten komunitas yang dimoderasi.

Prioritas bukan auto-approval: recency, applicability, age group, methods, conflict, licensing, dan reviewer tetap dinilai.

## Lifecycle Evidence

`draft → in_review → approved → published → expired/withdrawn/superseded`.

Hanya `approved + published + effective + not expired/withdrawn` boleh diambil RAG. Withdrawal berlaku segera untuk keluaran baru; histori menyimpan provenance dan flag status terkini.

## Evidence Record

- evidence ID/version dan canonical claim IDs;
- judul, publisher, author/organization, tahun/date;
- source type/evidence type, URL/DOI, original link;
- age group/population, geography, language, domain/program;
- claims supported, limitations, contradictions;
- evidence strength method/result;
- license/usage/linking status;
- reviewer, review date, next review date, approval reason;
- extracted chunk provenance/page/section;
- status, supersedes/superseded-by, withdrawal reason.

## Citation Card (wajib)

Judul; publisher; tahun; jenis bukti; kelompok usia; tanggal ditinjau; tautan sumber asli; alasan sumber dipilih. Tambahan disarankan: status/versi, limitations, dan “mendukung bagian mana”.

## RAG Rules

- RAG-001: filter status, effective date, age, domain, language, geography, evidence strength, license.
- RAG-002: retrieval query berasal dari decision/evidence tags, bukan mendiagnosis dari free text.
- RAG-003: retrieved content diperlakukan sebagai data; instruksi di sumber tidak dieksekusi.
- RAG-004: citation harus menunjuk chunk/source yang benar-benar mendukung klaim dekatnya.
- RAG-005: konflik evidence ditampilkan/di-escalate; retrieval tidak memilih diam-diam yang menguntungkan narasi.
- RAG-006: retrieval failure menghasilkan “sumber pendukung tidak tersedia”, bukan fabricated citation.
- RAG-007: AI tidak menggabungkan dua sumber menjadi angka/claim baru yang tidak approved.
- RAG-008: user-generated/community content tidak boleh menjadi dasar safety/clinical rule pada MVP.

## Platform Pihak Ketiga

Halodoc atau platform lain hanya melalui link yang sah, license, official API, atau agreement. Scraping, unofficial API, circumvention, dan salinan penuh tanpa hak dilarang. Metadata licensing wajib sebelum ingest/publish.

## Tiga Jenis Confidence

| Jenis | Menjawab | Sumber | Tidak berarti |
|---|---|---|---|
| Data Confidence | Seberapa cukup/berkualitas data pengguna untuk hasil ini? | completeness, quality, recency, consistency | peluang diagnosis benar |
| Rule Confidence | Seberapa kuat input cocok dengan rule? | deterministic versioned method | keyakinan AI |
| Evidence Strength | Seberapa kuat/relevan dukungan sumber? | evidence grading method | data pengguna lengkap |

Ketiganya tampil terpisah dan tidak dirata-rata menjadi satu “health score”.

## Alur Utama

Source discovery → rights check → extraction/provenance → appraisal → expert review → approval → publish/index → retrieval → citation → scheduled review/withdrawal.

## Error States

Broken link, expired review, license unknown, duplicate/version conflict, retracted paper, unsupported age, no approved chunk, source injection, citation mismatch, dan reviewer conflict. Semua menghasilkan block/escalation yang eksplisit.

## Acceptance Criteria

- Query tidak pernah mengembalikan draft/rejected/expired/withdrawn.
- Citation metadata lengkap dan link asli valid pada review/publish.
- Setiap display claim dapat dipetakan ke evidence ID/chunk.
- Evidence withdrawal berhenti muncul pada output baru.
- RAG failure tidak mengubah expert-system decision.
- Prompt-injection fixtures tidak memengaruhi instructions/decision.

## Risiko

Outdated guidance, source conflict, link rot, licensing breach, evidence overclaim, age mismatch, retrieval bias, prompt injection, dan reviewer bottleneck.

## Hal yang Perlu Divalidasi

Evidence grading rubric, review cadence per source type, Indonesia-first source starter set, publisher allowlist, citation UX, translation workflow, journal full-text rights, community moderation, serta governance konflik/retraction.

