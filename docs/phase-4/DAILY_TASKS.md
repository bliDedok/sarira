# Daily Tasks

## Struktur

`DailyTaskDefinition` adalah konfigurasi berversi. `DailyTaskInstance` mengikat definition ke profile, baseline, DailyRecord, dan local date dengan status `PENDING|IN_PROGRESS|COMPLETED|SKIPPED`, progress, source, serta completed timestamp.

Seed `phase4-dev-v1` menyediakan empat task pencatatan:

1. Isi Daily Check-in.
2. Catat makanan.
3. Lengkapi catatan tidur.
4. Catat aktivitas.

Jumlah minimum adalah kebutuhan data teknis, bukan rekomendasi medis.

## Sinkronisasi

Instance dibuat idempotent saat task hari dibaca. Progress domain dihitung dari record nyata. Ketika log memenuhi minimum, task menjadi `COMPLETED`; bila tidak, status/progress tetap menunjukkan kekurangan. Endpoint PATCH juga mendukung perubahan eksplisit ke status yang diizinkan.

Dashboard Home mengambil task dari `GET /daily-tasks/:localDate` melalui payload current baseline. Tombol task membuka formulir nyata. Status ditampilkan dengan ikon, label, dan progress sehingga tidak bergantung pada warna.

Task untuk tanggal masa depan tidak dibuat. Task histori masih dapat dibuka selama baseline dapat diedit.
