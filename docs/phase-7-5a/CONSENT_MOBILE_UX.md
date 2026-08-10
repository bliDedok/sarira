# Consent Mobile UX

## Tujuan

Consent harus terbaca pada mobile tanpa kolom sempit, teks vertikal, raw version, atau toggle yang terpisah dari konteksnya.

## `ConsentCard`

Setiap consent menampilkan:

- nama yang dapat dipahami pengguna;
- badge Wajib/Opsional;
- ringkasan singkat;
- tombol `Baca penjelasan`/`Tutup penjelasan`;
- penjelasan panjang dalam lebar card penuh;
- checkbox dengan label eksplisit `Saya menyetujui ...`.

Card mempertahankan ukuran sentuh, focus state, disabled state, dan status checked di accessibility tree.

## Legal semantics

- Tidak ada consent yang digabung.
- Consent account/terms dan health/program data tetap tipe terpisah.
- Required/optional tetap berasal dari definition backend.
- Versi dan audit event tetap dikirim ke API tetapi tidak menjadi label teknis utama di UI.
- Optional consent dapat dilewati dan diubah kembali.
- Required consent tetap divalidasi sebelum onboarding lanjut.

## Teen flow

Guardian consent tetap layar dan record terpisah. Nama wali, relationship, confirmation, version, dan audit semantics existing dipertahankan. Refactor hanya memperbaiki presentation dan mobile form foundation.

## Technical label cleanup

Layar yang disentuh tidak lagi menampilkan raw rule/phase/version/backend metadata pada mode pengguna normal. Data tersebut tetap tersedia untuk audit/debug internal. Copy registrasi sekarang menjelaskan urutan onboarding tanpa menyebut API, session, consent version, atau tanggal lahir.

## QA result

Pada 393×852, consent details dapat dibuka, card tetap satu kolom, checkbox terlihat, tidak ada overflow horizontal, dan sticky CTA tidak memotong legal text.
