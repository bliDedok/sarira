# Flex Kitchen

Flex Kitchen adalah recipe builder pengguna: tambah/hapus bahan, ubah quantity/serving, atur jumlah porsi, lihat total/per-serving, dampak hari ini, saran maksimal tiga, preview substitusi, lalu simpan sebagai recipe private.

Perubahan ingredient memanggil endpoint preview dengan debounce UI. Preview tidak menulis MealLog. Nilai custom tanpa label tetap `null/UNKNOWN`; nilai label yang dimasukkan pengguna berprovenance `USER_ENTERED`. Penyimpanan atau konsumsi adalah aksi eksplisit terpisah. Tombol konsumsi mencatat satu porsi ke MealLog/MealLogItem dan segera mengembalikan DailyNutrition terbaru.

Mobile memakai daftar ingredient dan ringkasan yang mudah dijangkau; layout tablet/desktop membagi builder dan nutrition panel.
