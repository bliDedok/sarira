# Pattern Map

Pattern Map adalah presentational snapshot dari satu Decision Record—bukan tempat menghitung rule. Ia menyimpan primary pattern opsional, maksimum dua supporting patterns, enam domain results, overall data quality, limitations, status, generated time, dan integer version.

Status: `READY`, `PARTIAL`, `INSUFFICIENT_DATA`, `ACKNOWLEDGED`, atau `SUPERSEDED`. Hanya map current milik profil yang dapat diambil melalui endpoint current; ID lookup tetap ownership-scoped. Generate baru menandai map lama `SUPERSEDED`, bukan mengubah payload historisnya.

Feedback `VERY_ACCURATE|FAIRLY_ACCURATE|LESS_ACCURATE|UNSURE` disimpan terpisah dengan optional notes. Feedback tidak melatih model, tidak mengubah score, dan tidak menulis ulang keputusan. UI menampilkan observed signals, quality, evidence, limitations, non-diagnostic notice, feedback, dan reanalysis CTA.
