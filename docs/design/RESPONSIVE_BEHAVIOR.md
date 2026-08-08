# Responsive Behavior

## Mobile — < 768 px

- Target acuan 393×852; satu kolom dan content margin 16 px.
- Header ringkas: brand, title, notification, active-profile avatar.
- Floating bottom navigation berisi lima tab berlabel; fixed di bawah dengan content padding agar akhir halaman tetap terjangkau.
- Card memenuhi lebar; action membungkus saat ruang sempit.
- Primary action berada dalam reach satu tangan dan minimum 44 px.

## Tablet — 768–1023 px

- Navigation rail 82 px, ikon tetap memiliki accessibility label.
- Dua kolom untuk Weekly Action/Baseline, Nutrition/food modes, meal cards, dan split content.
- Header menampilkan profil aktif lengkap.
- Tidak memakai bottom navigation dan tidak sekadar membesarkan mobile.

## Desktop — ≥ 1024 px

- Sidebar permanen 248 px dengan primary navigation, prototype utilities, dan simulation note.
- Header permanen; content dibatasi maksimum 1400 px.
- Grid dua/tiga kolom; detail domain memakai side-by-side cards.
- Hover/pressed/focus state, keyboard order, dan profile switcher tersedia.

## Wide — ≥ 1440 px

Content tetap di tengah dan tidak melebar tanpa batas. Card mempertahankan panjang baris yang nyaman.

## Verification 5 Agustus 2026

| Viewport | Route | Hasil |
|---|---|---|
| 393×852 | `/home` | 1 kolom, 5-tab floating nav, 0 px horizontal overflow |
| 834×1112 | `/food` | navigation rail, 2 kolom, 0 px horizontal overflow |
| 1440×1000 | `/home` | sidebar, header, 2 kolom, focus state terlihat |

Expo static web export juga berhasil membangun 25 route/template. iOS/Android native visual regression memerlukan simulator/device matrix pada review berikutnya.
