# SARIRA — Non-Functional Requirements

**Status:** Phase 0 baseline; nilai numerik bertanda `candidate` perlu validasi teknis/legal

## Security dan Privacy

| ID | Kebutuhan |
|---|---|
| NFR-SEC-001 | Data in transit dan at rest harus dienkripsi memakai standar industri yang disetujui security review. |
| NFR-SEC-002 | Autentikasi, sesi, pemulihan akun, dan aksi sensitif harus memiliki kontrol risiko serta rate limiting. |
| NFR-SEC-003 | Akses staf mengikuti least privilege, role-based access, review berkala, dan pencabutan segera. |
| NFR-SEC-004 | Secret dan credential tidak boleh muncul di client, log, analytics, atau export pengguna. |
| NFR-SEC-005 | Threat model harus mencakup profil anak, account linking, consent wali, prompt injection RAG, dan admin compromise. |
| NFR-PRIV-001 | Data minimization, purpose limitation, retention, deletion, export, correction, dan consent withdrawal harus terdokumentasi per field. |
| NFR-PRIV-002 | Analytics tidak boleh menerima isi log kesehatan mentah atau identifier langsung kecuali disetujui privacy review. |
| NFR-PRIV-003 | Pemberitahuan privasi harus dapat dipahami kelompok usia yang dituju dan memiliki versi. |
| NFR-PRIV-004 | Data kesehatan dan data anak diperlakukan sebagai data sensitif; transfer/vendor processing memerlukan assessment. |

Rujukan legal awal: UU RI No. 27 Tahun 2022 tentang Pelindungan Data Pribadi. Legal counsel harus memverifikasi seluruh kewajiban aktual sebelum build/release.

## Reliability, Integrity, dan Safety

| ID | Kebutuhan |
|---|---|
| NFR-REL-001 | Decision service harus gagal aman: jika rule/safety dependency tidak tersedia, rekomendasi baru tidak diterbitkan. |
| NFR-REL-002 | Perhitungan dan keputusan harus idempotent untuk input serta versi yang sama. |
| NFR-REL-003 | Semua hasil harus dapat direproduksi dari snapshot input, rule, formula, dan dataset. |
| NFR-REL-004 | Backup/restore, RPO, dan RTO harus ditentukan melalui business impact assessment; belum dikunci pada Phase 0. |
| NFR-SAFE-001 | Perubahan safety rule memerlukan dual review, automated test, staged rollout, monitoring, dan rollback. |
| NFR-SAFE-002 | AI explanation failure tidak boleh menghalangi safety/referral template deterministik. |
| NFR-SAFE-003 | Safety event harus memiliki alerting dan incident triage tanpa mengekspos data berlebihan. |

## Performance dan Scalability

| ID | Kebutuhan |
|---|---|
| NFR-PERF-001 | Candidate: interaksi pencatatan lokal/online memberi feedback visual ≤1 detik pada p95, tidak termasuk sinkronisasi pihak ketiga. |
| NFR-PERF-002 | Candidate: evaluasi rule dan pemuatan Pattern Map ≤3 detik pada p95 dalam kondisi normal. |
| NFR-PERF-003 | Sinkronisasi wearable harus toleran offline, retry terkontrol, dan tidak menggandakan data. |
| NFR-SCAL-001 | Arsitektur harus memungkinkan scale berdasarkan profil dan volume event tanpa mengubah semantik rule. |

## Accessibility dan Usability

| ID | Kebutuhan |
|---|---|
| NFR-ACC-001 | Target aksesibilitas: WCAG 2.2 AA untuk antarmuka digital yang relevan. |
| NFR-ACC-002 | Teks dapat diperbesar, kontras memadai, target sentuh memadai, urutan fokus logis, dan elemen memiliki label aksesibel. |
| NFR-ACC-003 | Informasi status tidak disampaikan hanya dengan warna; hijau/kuning/merah selalu disertai label dan tindakan. |
| NFR-ACC-004 | Alur lansia diuji untuk keterbacaan, beban kognitif, motorik, dan penggunaan oleh pendamping. |
| NFR-USE-001 | Pencatatan harian inti harus dapat dilakukan tanpa memahami istilah klinis. |
| NFR-USE-002 | Copy harus netral, tidak menstigma tubuh/makanan, dan lulus content review. |

## Interoperability dan Data Quality

| ID | Kebutuhan |
|---|---|
| NFR-INT-001 | Unit, timezone, locale, dan konversi harus eksplisit serta diuji. |
| NFR-INT-002 | Integrasi HealthKit/Health Connect harus mengikuti izin dan attribution platform terbaru saat implementasi. |
| NFR-DQ-001 | Validasi range, unit, recency, plausibility, duplicate, dan conflict harus tercatat tanpa diam-diam mengubah input pengguna. |
| NFR-DQ-002 | Missing data dibedakan dari nilai nol dan permission-denied. |

## Explainability, Auditability, dan Governance

| ID | Kebutuhan |
|---|---|
| NFR-EXP-001 | Pengguna harus memahami alasan utama hasil tanpa membaca dokumentasi teknis. |
| NFR-AUD-001 | Audit log bersifat append-oriented, bertimestamp, dapat ditelusuri, dibatasi akses, dan memiliki retention policy. |
| NFR-GOV-001 | Setiap artefak berdampak kesehatan memiliki owner, reviewer, status, versi, tanggal berlaku, dan review due date. |
| NFR-GOV-002 | Sumber yang expired/withdrawn tidak boleh dipakai pada keluaran baru; hasil lama mempertahankan provenance historis. |
| NFR-AI-001 | Model/prompt changes harus dievaluasi terhadap fidelity, hallucination, tone, citation, dan safety sebelum rilis. |

## Localization dan Maintainability

| ID | Kebutuhan |
|---|---|
| NFR-L10N-001 | Bahasa, format tanggal, satuan, bahan pangan, dan konteks budaya tidak boleh hard-coded pada rule naratif. |
| NFR-MNT-001 | Rule, formula, dataset, copy, prompt, dan content dapat diperbarui secara terkendali tanpa menghapus histori versi. |
| NFR-MNT-002 | Observability harus membedakan kegagalan data, rule, RAG, AI explanation, integrasi, dan UI. |

## Hal yang Perlu Divalidasi

SLO/uptime, RPO/RTO, retention per tipe data, batas latency, yurisdiksi hosting, kebutuhan data residency, model ancaman terperinci, platform minimum, dan standar/regulasi tambahan.

