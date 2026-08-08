# SARIRA — Referral Rules

**Status:** workflow baseline; clinical triggers and local services pending validation

## Tujuan

Memberi next step yang jelas ketika SARIRA mendeteksi kondisi yang tidak aman, tidak sesuai program, memerlukan pengukuran/penilaian profesional, atau berada di luar kemampuan produk—tanpa membuat diagnosis.

## Jenis Referral

| Level | Use case | Timing language | Product behavior |
|---|---|---|---|
| R1 — Emergency/Urgent | Red flag menurut rule | Approved urgent wording berdasarkan wilayah | Stop/suppress saran terkait; tampilkan tindakan dan layanan darurat resmi |
| R2 — Prompt professional review | Yellow high-priority | Cari bantuan segera/within timeframe yang divalidasi | Batasi program; tampilkan profesi/layanan sesuai kebutuhan |
| R3 — Routine consultation | Ketidakpastian/tren/pembatasan yang perlu dinilai | Jadwalkan konsultasi | Low-risk logging/education boleh jika rule mengizinkan |
| R4 — Measurement/support service | Perlu ukur ulang/Posyandu/dukungan | Pada kunjungan/interval yang disetujui | Tampilkan checklist dan alasan, bukan diagnosis |

Angka waktu tidak boleh diinventarisasi sebelum clinical reviewer menyetujui per trigger.

## Referral Payload

- referral ID/version dan level;
- trigger rule(s) dan data yang dipakai;
- waktu trigger dan status acknowledgement;
- approved user-facing reason tanpa disease label yang tidak sah;
- tindakan segera, tindakan yang harus dihindari, dan program restriction;
- tipe tenaga/layanan yang tepat;
- local official resource link/phone bila terverifikasi;
- limitation: SARIRA tidak memastikan diagnosis/ketersediaan layanan;
- re-screen/resume conditions yang disetujui.

## Business Rules

- REF-001: red referral mengalahkan Weekly Action/menu/notification engagement.
- REF-002: acknowledgement bukan clearance dan tidak mengubah status.
- REF-003: hanya rule pack yang dapat membuat/menutup referral state; AI hanya menjelaskan fixed payload.
- REF-004: lokasi/nomor layanan harus berasal dari registry approved, memiliki review date, dan fallback bila tidak tersedia.
- REF-005: sistem tidak meminta pengguna membagikan diagnosis hasil kunjungan; pengguna dapat mencatat outcome umum secara opsional.
- REF-006: supporter/wali notification mengikuti permission dan kebijakan keselamatan/legal, tidak diasumsikan otomatis.
- REF-007: referral tidak boleh menjadi iklan berbayar tersembunyi; conflict/affiliation diungkapkan.

## Alur

Trigger → deterministic classification → duplicate/priority resolution → freeze/restrict features → render approved card → acknowledge/call/open map/save → optional follow-up → rule-based re-evaluation.

## Error States

- Lokasi tidak tersedia: tampilkan instruksi umum approved dan emergency service official yang relevan jika ada; jangan menebak.
- Link/phone expired: suppress detail dan incident alert; pertahankan safe generic guidance.
- Multiple referrals: deduplicate dan urutkan urgency tanpa menghapus alasan unik.
- Offline: emergency copy penting harus tersedia secara aman bila keputusan teknis mendukung; jangan menjanjikan live availability.
- AI unavailable: referral tetap tampil sepenuhnya dari template.

## Acceptance Criteria

- Red scenario selalu memblokir rekomendasi terkait di seluruh entry point.
- Referral content tetap utuh tanpa AI/RAG.
- Semua link/phone memiliki owner dan last-reviewed date.
- Pengguna dapat kembali melihat referral dan tahu apakah program restricted.
- Usability simulation menguji pemahaman urgency tanpa kepanikan yang tidak perlu.

## Validasi Wajib

Daftar trigger per pack, level/timing, profesi tujuan, wilayah layanan, emergency wording, notification wali/pendamping, resume criteria, liability/disclaimer, dan service registry maintenance.

