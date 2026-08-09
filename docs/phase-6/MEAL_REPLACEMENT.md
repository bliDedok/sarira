# Meal Replacement

Alternatives hanya berasal dari recipe yang lolos hard constraint untuk meal type yang sama. Server mengurutkan secara deterministik dan mengembalikan hingga lima kandidat.

Preview memuat difference delapan nutrient dan pesan khusus sodium. User mengonfirmasi recipe serta optional reason: disliked, unavailable, too long, too expensive, variety, atau other. Item lama menjadi `REPLACED`; item baru menunjuk snapshot/version baru. Item `CONSUMED` tidak dapat diganti.

Replacement tidak wajib identik nutrisi. Selisih ditampilkan sebelum konfirmasi.
