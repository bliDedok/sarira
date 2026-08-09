# Pattern Ranking

Domain hanya masuk ranking jika tersedia dan score minimal 25. Stable ordering menggunakan urutan berikut: data-quality rank, goal tie-break, actionability, score, lalu fixed domain priority. Fixed priority adalah meal balance, portion, sugary/energy-dense, sleep, activity, contextual eating.

Goal `IMPROVE_FITNESS` memprioritaskan activity ketika quality setara; weight-related goals memprioritaskan meal balance. Goal tidak mengubah feature, matched rule, contribution, atau domain score.

Domain peringkat pertama menjadi primary pattern. Maksimum dua berikutnya menjadi supporting patterns. Code, label, explanation, strength, quality, score, evidence, dan limitations disalin ke historical Pattern Map. Input dan versions identik menghasilkan ordering identik.
