# Daily Tracking

## Daily record

`DailyRecord` adalah agregasi lazy per tanggal lokal. Record menyimpan baseline, profile, tanggal, day index, status kelengkapan, dan timestamp completion. Ia dibuat saat data/task untuk hari tersebut pertama kali diperlukan, bukan dengan job yang mengisi seluruh periode.

## Daily check-in

Satu check-in per `(baselineSessionId, localDate)` dapat dibuat atau diperbarui melalui PUT. Nilai yang disimpan:

- mood: sangat rendah sampai sangat baik;
- hunger dan fullness skala 1–5;
- energy 1–5 dan body feeling opsional;
- barrier codes yang non-diagnostik;
- notes opsional maksimal 500 karakter.

UI mempertahankan draft di local storage. Kegagalan jaringan menampilkan status gagal dan tombol retry; UI tidak mengklaim data sudah tersimpan sebelum API berhasil.

## Riwayat

Kalender baseline membuka detail satu hari, lalu meneruskan `localDate` ke check-in, makanan, tidur, aktivitas, dan keluhan pencernaan. Backend selalu memvalidasi tanggal terhadap baseline serta local date server.

## Recalculation

Write/delete log inti menyinkronkan DailyRecord, task instance, dan snapshot completeness. Optional steps/body/digestive tersimpan dan tampil di histori, tetapi tidak menambah skor empat domain inti pada konfigurasi Phase 4.

## Data source

Semua input Phase 4 bersumber `MANUAL`. Ketiadaan data tidak diubah menjadi nol, dan data manual tidak ditandai sebagai wearable-verified.
