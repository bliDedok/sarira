# Baseline Lifecycle

## Status

`ACTIVE` → `DAY_7_REVIEW_AVAILABLE` → `DAY_14_REVIEW_AVAILABLE` atau `DATA_INSUFFICIENT` → `COMPLETED`.

`PAUSED` dan `CANCELLED` tersedia pada data model untuk lifecycle berikutnya. Phase 4 tidak menyediakan UI pause/cancel. `COMPLETED` dan `CANCELLED` menutup kemampuan edit histori.

## Transisi

- Create: baseline dimulai pada instant clock, menyimpan `startLocalDate` serta timezone profile saat itu.
- Day 7: availability berdasarkan calendar day index `>= 7`; timeline tidak bergeser karena hari kosong.
- Day 14: `calendarCompletedAt` diisi saat batas kalender pertama kali tercapai, lalu readiness dihitung terpisah.
- READY/PARTIALLY_READY: status review tersedia; final Pattern Map belum dibuat.
- INSUFFICIENT_DATA: tracking dan perbaikan histori dapat berlanjut maksimal sesuai extension configuration.
- Complete: hanya aksi eksplisit pada baseline yang bukan data-insufficient; record mendapat `completedAt`.

## Kalender versus kesiapan data

Mencapai Day 14 tidak identik dengan data siap. `calendarCompletedAt` menyatakan waktu kalender tercapai, sedangkan `BaselineReadinessResult` menyimpan hasil coverage. Pemisahan ini mencegah pembuatan kesimpulan prematur.

## Hari terlewat dan histori

Hari tanpa data tetap memiliki posisi kalender dan ditampilkan `MISSING`. Hari dengan satu sampai tiga domain inti adalah `PARTIAL`; empat domain adalah `COMPLETE`. Histori Day 1 sampai hari lokal saat ini dapat dibuka dan dikoreksi selama baseline belum ditutup. Tanggal sebelum baseline, masa depan, atau melampaui target plus extension ditolak.

## Proteksi duplikat

API mengembalikan baseline aktif yang sudah ada. Database menjadi pertahanan kedua melalui partial unique index. Race condition create tidak menghasilkan dua active session.
