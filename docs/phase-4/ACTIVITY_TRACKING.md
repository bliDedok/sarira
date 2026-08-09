# Activity Tracking

## Activity log

Jenis awal: `WALKING`, `RUNNING`, `CYCLING`, `STRENGTH`, `STRETCHING`, `SPORT`, dan `OTHER`. Log memuat durasi menit, intensitas yang dirasakan, start time/deskripsi/notes opsional, source manual, profile, baseline, dan local date.

Backend memvalidasi durasi 1–1440 menit. Data manual tidak ditandai sebagai wearable-verified. Satu log memenuhi domain activity pada configuration development, tanpa menilai apakah aktivitas tersebut cukup secara medis.

## Step foundation

`StepRecord` terpisah dan unik per profile, baseline, serta local date. Phase 4 hanya menerima source `MANUAL`, `verified=false`, dan source device opsional. Enum telah menyiapkan Apple Health, Health Connect, Garmin, Fitbit, Samsung, Huawei, Oura, dan Other tanpa menghubungkan provider tersebut.

## Operasi dan consent

Activity mendukung create/list/update/delete. Steps mendukung list/upsert per tanggal. Write memerlukan `ACTIVITY_DATA`; setelah revoke, write baru ditolak dan histori tetap tersedia.

## Batas

Tidak ada calorie burn, target klinis, workout recommendation engine, Motion Coach pose estimation, atau sinkronisasi wearable. Bagian tersebut tetap berlabel **Demo**.
