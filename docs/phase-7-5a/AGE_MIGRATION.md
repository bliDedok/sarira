# Declared Age Migration

## Keputusan privasi

Profil baru tidak lagi diwajibkan memberikan tanggal lahir. Pengguna menyatakan usia saat ini melalui `AgePicker` dengan rentang 12–75 tahun.

Tidak ada synthetic/fake DOB. Nilai `declaredAge = 20` tidak pernah diterjemahkan menjadi tanggal seperti `2006-01-01`.

## Schema sebelum dan sesudah

Sebelum:

- `Profile.dateOfBirth Date?`

Sesudah:

- `Profile.dateOfBirth Date?` — dipertahankan untuk legacy.
- `Profile.declaredAge Int?`
- `Profile.ageRecordedAt DateTime? @db.Timestamptz(3)`

Constraint database mengharuskan kedua field baru sama-sama null atau `declaredAge` berada pada 12–75 dan `ageRecordedAt` tidak null.

## Transition strategy

1. Tambahkan dua kolom nullable secara incremental.
2. Jangan backfill DOB menjadi declared age dan jangan membuat DOB baru.
3. Profil baru menyimpan `declaredAge`; server menetapkan `ageRecordedAt`.
4. Resolver memprioritaskan declared age.
5. Profil tanpa declared age tetap menggunakan DOB lama.
6. Audit mencatat `DECLARED_AGE_UPDATED`.

## API behavior

Profile update menerima `declaredAge` yang tervalidasi. Timestamp tidak dipercaya dari klien; repository/server menetapkan waktu pencatatan. Response profile menyertakan effective age, age group, source, dan flag reconfirmation.

Route/status legacy bernama `birth-date` dan beberapa issue code lama dipertahankan agar deep link, session, dan consumer Phase 3–7 tidak putus. UI route tersebut sudah menampilkan pertanyaan usia, bukan input DOB.

## Compatibility

- Legacy DOB: supported dan dihitung dinamis pada reference date.
- Declared age: source utama jika tersedia.
- DOB dan declared age dapat coexist selama transisi; declared age menang.
- Kolom DOB tidak di-drop.
- Tidak ada data pengguna lama yang dihapus atau diubah.

## Age drift

Declared age tidak bertambah otomatis. Setelah satu tahun dari `ageRecordedAt`, resolver hanya memberi `requiresReconfirmation = true`. Eligibility/safety tidak berubah diam-diam di background.

## Rollback

Rollback aplikasi yang aman adalah kembali memakai consumer DOB legacy sambil membiarkan kolom baru tetap ada. Jangan drop kolom pada rollback normal. Untuk database development yang benar-benar perlu kembali ke snapshot, gunakan backup pre-migration setelah menghentikan writer dan memverifikasi target database; ini operasi eksplisit, bukan otomatis.
