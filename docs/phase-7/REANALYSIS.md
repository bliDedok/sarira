# Reanalysis and Superseding

Feature generation menghitung stable input signature. Input+engine version identik mengembalikan snapshot yang sama. Perubahan source data atau consent menghasilkan snapshot baru. Pattern generation menghitung decision signature yang juga mencakup latest safety, goal, rule pack, policy versions, dan feature snapshot.

Decision identik bersifat idempotent. Context berubah menghasilkan Decision Record dan Pattern Map version baru. Dalam satu transaction, map lama menjadi `SUPERSEDED`, decision lama mendapat `supersededAt`, active action lama menjadi `REPLACED`, lalu record baru dibuat.

Historical Feature Snapshot, rule evaluations, Decision Record, Pattern Map payload, feedback, assignment, dan check-in tidak ditimpa. Current endpoint hanya mengembalikan versi aktif. Reanalysis tidak menghapus data ketika consent optional dicabut; data tersebut hanya tidak ikut input analisis baru.
