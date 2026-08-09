# Migration and Rollback

Pra-migrasi dibuat PostgreSQL custom-format backup di `/private/tmp/sarira_phase5_pre_phase6_20260809.dump` (202827 bytes). Backup bersifat lokal/temporary dan harus dipindahkan ke storage aman bila diperlukan jangka panjang.

Apply: `pnpm db:migrate:deploy`, lalu `pnpm db:seed`, `pnpm db:migrate:status`. Migration Phase 6 bersifat additive; migration kedua memperbaiki cascade consumption untuk privacy erasure.

Rollback aman adalah restore backup ke database kosong/terisolasi lalu verifikasi migration status. Untuk rollback schema manual, hapus foreign keys Phase 6, tabel dalam urutan consumption → snapshots/items/plans → policy → recipe snapshots/steps/ingredients/versions/recipes, lalu enum. Jangan melakukan drop pada production tanpa backup tervalidasi, maintenance window, dan approval eksplisit karena data Phase 6 akan hilang.
