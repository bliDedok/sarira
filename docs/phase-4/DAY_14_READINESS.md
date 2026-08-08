# Day 14 Readiness

Day 14 memisahkan pencapaian kalender dari kesiapan data. Saat calendar day index `>= 14`, backend mengisi `calendarCompletedAt`, menghitung completeness, dan menyimpan/upsert `BaselineReadinessResult`.

## Status

- `READY`: score minimum dan coverage seluruh domain wajib terpenuhi.
- `PARTIALLY_READY`: ada data bermakna tetapi syarat READY belum lengkap.
- `INSUFFICIENT_DATA`: data belum cukup untuk kesimpulan yang dapat diandalkan.

Result menyimpan domain coverage, missing domains, total/completed days, score, reason codes, recommendation, config version, dan evaluated time. UI dapat mengatakan “Data baseline siap dianalisis” untuk READY, tetapi tetap menyatakan Pattern Map datang pada fase berikutnya.

Untuk data kurang, UI menjelaskan bagian yang belum cukup dan bahwa pencatatan/perbaikan dapat diteruskan. Extension teknis maksimum 7 hari tersedia melalui configuration; baseline tidak menjadi endless secara otomatis.

## Completion

Baseline tidak otomatis `COMPLETED` pada Day 14. Pengguna menutup baseline secara eksplisit setelah hasil review yang memenuhi kebijakan. `DATA_INSUFFICIENT` tidak dapat ditutup sebagai final; pengguna melanjutkan tracking atau melengkapi histori selama jendela extension.

## Audit

Transisi pertama Day 14 menghasilkan `BASELINE_DAY_14_REACHED`; evaluasi menghasilkan `BASELINE_READY` atau `BASELINE_DATA_INSUFFICIENT`; penutupan menghasilkan `BASELINE_COMPLETED`.
