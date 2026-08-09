# Database Changes

## Pre-migration backup

Path: `/private/tmp/sarira_phase7_5a_pre_migration_20260810.dump`
Format: PostgreSQL custom/gzip
Size: 297,012 bytes
SHA-256: `809e58dd26f030560ba69927e256700d0acaf834abf6bde447bab30315f74f27`
TOC entries: 553
Source/pg_dump: PostgreSQL 17.10

Katalog backup berhasil dibaca menggunakan `pg_restore -l` dalam container PostgreSQL.

## Migrations

### `20260810002000_phase7_5a_declared_age`

- Menambah `Profile.declaredAge INTEGER NULL`.
- Menambah `Profile.ageRecordedAt TIMESTAMPTZ(3) NULL`.
- Menambah `Profile_declared_age_range_check`.
- Tidak mengubah/drop `dateOfBirth`.
- Tidak melakukan backfill.

### `20260810003000_phase7_5a_declared_age_audit`

- Menambah enum audit `DECLARED_AGE_UPDATED` dengan `IF NOT EXISTS`.

## Live verification

- Prisma menemukan 11 migration.
- `Database schema is up to date`.
- DB columns: `dateOfBirth` nullable, `declaredAge` nullable, `ageRecordedAt` nullable.
- Constraint live sesuai pair/range 12–75.
- Setelah integration test cleanup: 5 profile legacy DOB, 0 declared-age fixture tertinggal.

## Rollback strategy

Preferred rollback adalah code rollback: consumer kembali ke DOB fallback, sementara kolom tambahan dibiarkan karena nullable dan tidak mengganggu schema lama.

Jangan menjalankan drop column/enum otomatis. Jika development database harus dikembalikan penuh:

1. hentikan semua writer;
2. pastikan target adalah DB development, bukan staging/production;
3. buat backup baru dari keadaan terkini;
4. verifikasi checksum snapshot pre-migration;
5. restore custom dump ke database kosong/terisolasi terlebih dahulu;
6. lakukan smoke test sebelum mengganti target aplikasi.

Restore penuh bersifat destructive dan tidak dijalankan dalam Phase 7.5A.
