# Data Quality and Sufficiency

Data quality dan pattern score adalah dua konsep terpisah. Quality menjawab “berapa cukup bukti yang tersedia”; score menjawab “berapa kontribusi rule yang match”. Score tinggi tidak dapat memperbaiki coverage rendah.

Per domain, rata-rata coverage feature dipetakan menjadi: `<0.30 INSUFFICIENT`, `<0.50 LOW`, `<0.75 MEDIUM`, selain itu `HIGH`. Rule hanya boleh match jika feature tersedia dan coverage mencapai `minimumEvidence=0.35`. Domain `INSUFFICIENT` menghasilkan `score=null`, `availability=INSUFFICIENT_DATA`, serta limitation eksplisit.

Analisis final juga memerlukan readiness Day 14, profile/age/goal/safety lengkap, required consent aktif, serta rule/scoring/action version tersedia. Day 7 tidak dapat menghasilkan Pattern Map final. Optional consent yang dicabut mengurangi input, bukan menyulap nilainya menjadi nol.

UI menampilkan label kualitas, evidence, missing data, dan limitations. Ia tidak menggunakan 0–100 sebagai label kesehatan atau diagnosis.
