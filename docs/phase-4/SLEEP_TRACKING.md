# Sleep Tracking

`SleepLog` menyimpan waktu mulai, waktu bangun, kualitas yang dirasakan, jumlah terbangun opsional, notes, source manual, profile, baseline, dan tanggal lokal hari bangun.

## Duration authoritative

Client mengirim dua instant ISO, bukan duration. Backend menghitung selisih dalam menit dan menolak durasi `<= 0` atau lebih dari 24 jam. Contoh 23:30 → 06:30 dibuat dengan tanggal mulai sebelumnya dan menghasilkan 420 menit. Patch hanya menghitung ulang jika kedua timestamp baru dikirim; data model tetap memiliki check constraint teknis.

## Timezone UI

Form mengubah jam lokal memakai timezone profile menjadi ISO. Tanggal log adalah tanggal pengguna bangun. Tampilan histori mengubah instant kembali ke jam lokal dan selalu memberi label `Sumber · Manual`.

## Consent dan batas

Create/update memerlukan consent `SLEEP_DATA`. Revocation tidak menghapus histori dan tidak mengubah nilai kosong menjadi nol. Apple Health, Health Connect, wearable sync, sleep staging, dan diagnosis tidur tidak diimplementasikan.

Satu log sudah memenuhi domain sleep untuk kelengkapan harian development; nilai kualitas atau panjang tidur tidak memengaruhi score.
