# Day 7 Checkpoint

Checkpoint tersedia ketika calendar day index mencapai 7. `FixedClock` menguji availability tanpa endpoint waktu publik.

## Isi

Backend membuat/memperbarui `Day7Checkpoint` idempotent dan mengembalikan:

- jumlah hari berdata dan observed days;
- coverage check-in, food, sleep, dan activity;
- missing domains;
- observations deskriptif berbasis availability;
- disclaimer bahwa hasil bukan diagnosis atau hubungan sebab-akibat.

UI menampilkan coverage sebagai “N dari 7 hari”, progress berlabel aksesibel, bagian yang masih dapat dilengkapi, dan istilah `Early Observation`. Tidak ada Pattern Map final atau Weekly Action yang dihitung.

## Feedback pengguna

`POST /baseline/:id/day-7-feedback` menyimpan ease rating 1–5, domain tersulit, keinginan melanjutkan, dan notes opsional. Feedback ditujukan untuk UX/future personalization dan tidak mengubah safety result, completeness, atau readiness.

## Audit

View menghasilkan `DAY_7_CHECKPOINT_VIEWED`; submit menghasilkan `DAY_7_FEEDBACK_SUBMITTED`. Metadata audit hanya ID/status/rating minimum, tanpa menyalin notes atau isi data kesehatan.
