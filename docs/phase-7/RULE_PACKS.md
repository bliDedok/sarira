# Age Rule Packs

| Kelompok usia | Pack |
|---|---|
| Teen 12–17 | `PATTERN-TEEN-DEV-V1` |
| Young Adult 18–25 | `PATTERN-ADULT-DEV-V1` |
| Adult Balance 26–59 | `PATTERN-ADULT-DEV-V1` |
| Healthy Aging 60–75 | `PATTERN-AGING-DEV-V1` |

`UNDER_12` dan `OVER_75` menghasilkan pack out-of-scope dan tidak dipaksakan ke rule dewasa. Rule hanya dapat match jika pack-nya terdaftar. Fase ini memakai threshold development yang sama untuk pack eligible, tetapi menyimpan identitas pack agar revisi ahli per usia dapat dilakukan tanpa merusak reproduksi keputusan lama.

Pack dipilih dari DOB-derived age group, bukan usia yang disimpan manual. Safety masih diterapkan secara independen. Semua pack membutuhkan review ahli gizi/klinis sebelum activation production.
