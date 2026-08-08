# Privacy and Consent

Dokumen ini adalah keputusan implementasi Phase 4, bukan pendapat atau kepastian legal.

## Purpose mapping

| Data | Consent write |
|---|---|
| Daily check-in, body, digestive | `HEALTH_PROFILE` |
| Meal log | `NUTRITION_DATA` |
| Sleep log | `SLEEP_DATA` |
| Activity dan steps | `ACTIVITY_DATA` |

Baseline creation juga mensyaratkan seluruh consent wajib Phase 3 masih aktif. Optional consent yang belum diberikan menghasilkan penolakan jelas saat fitur terkait dipakai, bukan grant diam-diam.

## Revocation

Setelah revoke, create/update baru pada purpose terkait ditolak. Historical data tidak otomatis dihapus, tetap dapat dibaca sesuai policy sementara, dan delete oleh pemilik tetap tersedia. Retention, export, deletion cascade berbasis permintaan, dan konsekuensi legal lintas yurisdiksi masih memerlukan review sebelum production.

## Data minimization

- Source Phase 4 adalah manual; wearable identifiers tidak dikumpulkan.
- Audit menyimpan event, actor/entity ID, request ID, dan metadata minimum—bukan jawaban check-in, deskripsi makan, notes, atau data kesehatan lengkap.
- Daily check-in draft hanya disimpan lokal untuk recovery/retry dan dihapus setelah save berhasil.
- Tidak ada foto tubuh, body-fat estimate, raw image, AI prompt, embedding, atau diagnosis.

## Ownership

Repository selalu memfilter melalui profile milik user terautentikasi. ID baseline milik profile lain dibedakan sebagai forbidden setelah owner lookup, sementara ID yang tidak ada adalah not found. Model profile-first mempertahankan jalur untuk dependent/family authorization berikutnya tanpa menganggap semua profile otomatis dapat diakses.
