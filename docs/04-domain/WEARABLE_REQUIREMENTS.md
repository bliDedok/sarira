# SARIRA — Wearable and Activity Data Requirements

**Status:** Phase 0 baseline; integration sequencing pending feasibility

## Tujuan

Mengambil data langkah, jarak, active minutes, workout, dan tidur dari Apple HealthKit/Android Health Connect dengan kontrol pengguna, provenance, deduplication, dan input manual sebagai fallback.

## Aktor

Pengguna/profile manager, device platform, expert system, support/admin terbatas.

## Prasyarat

Device/platform support, explicit granular permission, purpose notice, profile mapping, timezone/unit policy, and privacy/security review.

## Alur Utama

Jelaskan manfaat dan data type → minta izin platform → sync authorized types → normalize tanpa menghapus source → deduplicate → tampilkan source/coverage → pakai hanya data valid dalam rule → user dapat pause/revoke.

## Alur Alternatif

- Permission ditolak/partial: tampilkan yang tersedia dan manual fallback; tidak menyimpulkan nol.
- Platform tidak tersedia: manual only.
- Multiple devices/sources: precedence/dedup policy.
- Offline: queue/retry + watermark; jangan duplicate.
- Revoke: stop sync dan arahkan pengguna ke platform settings jika diperlukan.

## Business Rules

- WEAR-BR-001: setiap observation menyimpan original source, source record ID/hash, start/end, timezone, unit, sync batch, dan transform version.
- WEAR-BR-002: raw source tidak ditimpa; canonical value merujuk lineage.
- WEAR-BR-003: missing, denied, unavailable, delayed, dan true-zero adalah state berbeda.
- WEAR-BR-004: manual entry berlabel manual dan dapat dipakai rule jika memenuhi quality policy.
- WEAR-BR-005: overlap workouts/steps/sleep ditangani per metric-specific rule; dilarang menjumlah semua sources.
- WEAR-BR-006: active minutes definition antarplatform tidak dianggap identik tanpa normalization review.
- WEAR-BR-007: user dapat melihat source dan memperbaiki/manual-exclude data menurut policy.

## Safety Rules

Wearable tidak digunakan untuk diagnosis. Outlier/absence tidak otomatis memicu klaim klinis. Jika rule memerlukan data yang tidak ada/denied, hasil menjadi insufficient. Action tidak boleh mengejar angka yang mendorong overexercise.

## Data yang Diperlukan

Platform, data type, permission state yang dapat diketahui, timestamps, timezone, unit, value, source/app/device, origin record, sync status, user edit/exclusion, profile mapping.

## Output Sistem

Daily/weekly view dengan source, sync time, coverage/gap, excluded/duplicate status, manual option, dan dampak ke pattern.

## Error States

Permission cancelled/revoked, API unavailable, stale token/store, duplicate batch, future timestamp, timezone travel, unit mismatch, overlapping sleep/workout, source identity change, dan profile mismatch.

## Acceptance Criteria

- Denied permission tidak tampil sebagai 0.
- Re-sync idempotent tidak menggandakan nilai.
- Source terlihat untuk setiap agregat.
- Manual fallback menyelesaikan log yang sama.
- Revoke menghentikan sync dan UI menjelaskan dampak.
- Cross-timezone fixtures menghasilkan tanggal harian yang benar sesuai policy.

## Risiko

Double counting, source semantics mismatch, inferred sleep quality, permission confusion, battery/network, sharing device, dan over-reliance pada completeness.

## Hal yang Perlu Divalidasi

Read-only vs write, exact data types/API availability, platform minimum, source precedence, timezone policy, refresh cadence, retention, background sync, dan apakah integration masuk release pertama.

## Rujukan Platform

Apple mendokumentasikan izin granular dan perubahan izin pengguna pada [Authorizing access to health data](https://developer.apple.com/documentation/HealthKit/authorizing-access-to-health-data). Android mendokumentasikan pause/resume serta pengelolaan akses pada [Health Connect permissions and data access](https://developer.android.com/health-and-fitness/health-connect/ui/permissions). Implementasi Phase 1 harus memeriksa versi dokumentasi aktif.

