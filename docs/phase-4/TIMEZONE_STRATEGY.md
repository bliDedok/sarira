# Timezone Strategy

## Keputusan

Baseline berjalan berdasarkan kalender lokal pengguna, bukan selisih 24 jam dan bukan timezone server. Saat baseline dibuat, timezone profile disalin ke `BaselineSession.timezone` dan `startLocalDate` dihitung dari instant clock pada timezone tersebut.

Perubahan timezone profile setelah baseline dimulai tidak mengubah histori/day index baseline aktif. Semua kalkulasi menggunakan timezone yang dipin pada session.

## Algoritma

1. `Clock.now()` menghasilkan instant UTC.
2. `Intl.DateTimeFormat` dengan IANA timezone menghasilkan `YYYY-MM-DD` lokal.
3. Day index = selisih tanggal kalender UTC-normalized + 1.
4. Day 1 berlaku sampai pergantian tanggal lokal, walau baseline dimulai pukul 21:30.

Contoh: mulai 8 Agustus 21:30 WITA tetap Day 1; 9 Agustus 00:01 WITA adalah Day 2 meski baru 2 jam 31 menit berlalu.

## Input waktu log

UI mengonversi kombinasi local date + `HH:mm` + profile timezone menjadi instant ISO. Sleep menggunakan local date hari bangun dan tanggal sebelumnya jika jam mulai lebih besar/sama dari jam bangun.

## Verifikasi

Unit test mencakup Asia/Makassar, Asia/Jakarta, UTC, boundary 23:59 → 00:01, missed days, dan tidur 23:30 → 06:30. Tidak ada dependency pada timezone host test.
