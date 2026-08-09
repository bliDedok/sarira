# Migration and Rollback

Backup Phase 6 dibuat sebelum migration di `/private/tmp/sarira_phase6_pre_phase7_20260809.dump`. Format custom PostgreSQL telah diverifikasi dengan `pg_restore -l`; SHA-256 `cf60efb47dba14a305979c6de5407181c4f67407a1419c6adaa2faeff325b9cd`.

## Deploy

1. Pastikan backup tersedia dan cocok checksum.
2. Jalankan migration deploy/status.
3. Jalankan reference-only seed dua kali; jumlah row harus tetap.
4. Jalankan PostgreSQL integration test.

## Rollback development

Rollback schema bersifat operasional, bukan migration down otomatis: hentikan writer, backup keadaan Phase 7, restore dump Phase 6 ke database kosong/terisolasi, arahkan development service ke database hasil restore, lalu verifikasi migration status Phase 6. Jangan menghapus tabel Phase 7 satu per satu pada database yang memuat data audit.

Untuk production kelak diperlukan migration forward-fix dan runbook DBA terpisah. Backup lama Phase 5/6 tidak disentuh oleh Phase 7.
