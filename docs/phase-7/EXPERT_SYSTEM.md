# Deterministic Expert System

`packages/expert-system/src/phase7.ts` menerima typed Feature Snapshot plus baseline readiness, age group, latest safety status, goal, dan previous action codes. Module ini pure: tidak membaca database, waktu, network, atau UI state.

Urutan evaluasi:

1. Pilih age rule pack.
2. Evaluasi seluruh 13 rule secara typed dan traceable.
3. Hitung sufficiency serta score setiap domain.
4. Ranking domain yang tersedia dan score minimal 25.
5. Pilih maksimum satu primary dan dua supporting pattern.
6. Filter candidate action dengan domain, usia, safety, evidence, dan status analisis.
7. Pilih satu action secara stable; simpan alternative dan reason codes.

Goal hanya menjadi tie-break priority dan tidak mengubah observed values atau domain score. Semua output membawa exact engine/policy/rule versions. Tidak ada random, clock-dependent threshold, ML, atau AI.
