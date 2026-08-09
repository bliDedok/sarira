# Domain Scoring

Untuk domain yang sufficient:

`score = round(sum(matched contribution) / sum(possible contribution) × 100)`

Score menjadi `LOW` untuk 0–33, `MODERATE` untuk 34–66, dan `STRONG` untuk 67–100. Domain insufficient tidak mendapat score nol; ia mendapat `null` dan `NOT_AVAILABLE`. Ini mencegah missing data dibaca sebagai kondisi baik.

`pattern-scoring-dev-v1` menyimpan feature, weight/contribution, threshold, direction, minimum evidence, active flag, dan validation flag. Data quality dihitung terpisah. UI memakai label sinyal dan quality, sementara nilai internal tetap tersimpan untuk audit/ranking.

Seluruh bobot dan threshold perlu validasi ahli; angka Phase 7 hanya deterministic development policy.
