# Weekly Action Selection

Candidate berasal hanya dari primary-pattern domain. Filter wajib: age eligible, latest safety tidak ada pada restrictions, minimal satu required feature tersedia, definition aktif, analysis tidak abstain. Sort deterministik menghindari action yang baru dipakai, lalu actionability tertinggi, lalu lexical code.

Hanya candidate pertama dipersist sebagai assignment; alternative tersimpan untuk trace. Alasan selection berisi primary domain, data quality, dan actionability. `why` diturunkan dari primary pattern, bukan teks AI.

Database memastikan satu assignment per Pattern Map dan satu active assignment per profile/week melalui constraint/index. Transaction menandai assignment lama `REPLACED` ketika reanalysis sah. Saat check-in, repository memeriksa kembali current-map status dan latest safety; action yang tidak eligible ditolak dengan `ACTION_NOT_ELIGIBLE`.
