# Digestive Logging

Pencatatan pencernaan Phase 4 hanya menyimpan dan menampilkan histori.

Kategori: kembung, mual, nyeri perut, diare, konstipasi, panas dada/ulu hati, nafsu makan menurun, ketidaknyamanan setelah makan, dan other. `DigestiveLog` menyimpan waktu kejadian, intensitas 1–5, related meal opsional, notes, source manual, profile, baseline, dan local date.

Pengguna dapat membuat, mengedit, dan menghapus log. Related meal, bila dikirim, harus berasal dari profile/baseline yang sama. UI tidak membuat hubungan sebab-akibat antara makanan dan keluhan.

Write memerlukan consent `HEALTH_PROFILE`. Revocation memblokir log baru/perubahan, sementara histori tetap dibaca. Delete tetap tersedia sebagai kendali koreksi data.

Keluhan pencernaan bersifat optional coverage dan tidak mengubah readiness Phase 4. Tidak ada diagnosis GERD, intoleransi, IBS, atau penyakit lain; tidak ada rules yang menyimpulkan bahan tertentu sebagai penyebab.
