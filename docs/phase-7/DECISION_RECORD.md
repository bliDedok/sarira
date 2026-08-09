# Decision Record

Decision Record adalah audit source untuk satu eksekusi Expert System. Ia mengikat profile, baseline, immutable Feature Snapshot, input signature, exact expert/scoring/action versions, rule versions, status, primary/supporting codes, selected action code, overall quality, six domain scores, limitations, generated timestamp, dan optional `supersededAt`.

Setiap rule memiliki child `RuleEvaluation` dengan observed value, match result, contribution, reason code, evidence reference, dan limitation. Constraint signature+versions menjamin idempotency, namun perubahan input, safety, goal, atau policy menghasilkan keputusan baru.

Persistensi real menjalankan superseding, Decision Record, 13 evaluations, Pattern Map, dan maksimum satu action dalam satu PostgreSQL transaction. Historical Decision Record tidak di-update selain marker superseded; snapshot keputusan tetap dapat direproduksi dari data dan versi yang direkam.
