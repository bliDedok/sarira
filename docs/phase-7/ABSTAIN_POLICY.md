# Abstain Policy

Sistem abstain jika baseline belum Day-14 ready, konteks profile/safety/goal tidak lengkap, required consent tidak aktif, rule pack/policy tidak tersedia, semua domain insufficient, atau tidak ada domain dengan score minimal 25. Optional consent yang dicabut dapat membuat sebagian domain abstain tanpa menghapus hasil historis.

Abstain menghasilkan status `INSUFFICIENT_DATA`, missing/limitation details, evaluasi rule yang dapat diaudit, tanpa primary pattern dan tanpa Weekly Action. Domain lain boleh tetap `PARTIAL` jika sebagian bukti cukup.

Sistem tidak memilih “pattern terbaik yang tersedia” ketika gate inti gagal dan tidak mengubah missing menjadi normal/healthy. API memakai error terstruktur untuk readiness/consent/configuration, sementara hasil analisis insufficient disimpan agar alasan abstain dapat dilihat dan direproduksi.
