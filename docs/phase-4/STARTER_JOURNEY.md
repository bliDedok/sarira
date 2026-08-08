# Starter Journey

Starter Journey adalah handoff nyata dari onboarding ke baseline, bukan rekomendasi kesehatan.

## Data yang digunakan

`GET /api/v1/starter-journey` membaca profile pemilik, age group, goal, safety result, program preference bila ada, dan baseline aktif bila sudah dibuat. Endpoint menolak akses jika onboarding belum `COMPLETED` atau konteks inti tidak lengkap.

## Urutan pengguna

1. Onboarding menyelesaikan validasi server dan mengarahkan pengguna ke `/starter-journey`.
2. Halaman menjelaskan periode 14 hari, empat kategori inti, kemampuan memperbaiki histori, dan belum adanya kesimpulan final.
3. `POST /api/v1/baseline` memvalidasi ulang authentication, onboarding, profile, goal, safety screening, consent wajib, dan timezone.
4. Jika baseline aktif sudah ada, API mengembalikan baseline tersebut dengan metadata `resumed: true`; tidak membuat duplikat.
5. Baseline baru mengarahkan pengguna ke Home untuk Day 1.

Starter Journey tidak membuat baseline diam-diam saat halaman dibuka. Error precondition ditampilkan sebagai pesan yang dapat ditindaklanjuti.

## Bahasa produk

Copy menekankan pencatatan sesuai kondisi sebenarnya, tidak perlu sempurna, dan bahwa data lebih lengkap membantu gambaran di fase analisis berikutnya. UI tidak mengklaim mengetahui penyebab kondisi tubuh dan tidak menampilkan nutrition/pattern output seolah sudah dihitung.

## Resume

Session autentikasi memulihkan profile dan onboarding state. Setelah login, `GET /baseline/current` mengambil baseline aktif milik profile yang sama. Nilai `currentDay`, status lifecycle, task, dan completeness dihitung ulang menggunakan clock server dan timezone baseline.
