# Accessibility Guidelines

Target: WCAG 2.2 AA untuk web dan perilaku ekuivalen pada iOS/Android.

## Implemented

- Minimum touch target 44×44; button default 52 px.
- Interaksi memakai `Pressable`, `Button`, `TextInput`, dan `Switch` semantik.
- Button/link/tab/checkbox/radio/progressbar memiliki role, label, state, dan value.
- Status safety selalu memiliki teks dan ikon; tidak bergantung pada warna.
- Progress ring/bar memiliki `accessibilityValue`.
- Active profile diumumkan; pergantian profil memakai label kontekstual.
- Dekorasi hero/food/motion dikeluarkan dari accessibility tree.
- Focus state terlihat pada desktop; audit keyboard menunjukkan border putih 2 px plus browser outline.
- Kontras sidebar aktif/nonaktif diperbaiki setelah audit visual.
- Error/helper text ditulis dekat field dan live region digunakan untuk error.
- Mode lansia dan reduced-motion toggle tersedia.
- Layout tidak memiliki horizontal overflow pada tiga viewport uji.

## Elder Mode

Mode menaikkan ruang header/kepadatan layout dan menjadi hook untuk skala teks/tombol lebih besar. Phase 2 harus menghubungkan setting ke typography scale penuh dan mengujinya dengan screen magnification serta Dynamic Type native.

## Keyboard Order

Urutan mengikuti DOM visual: sidebar/rail → header actions → page content → footer. Modal/bottom sheet production harus memiliki focus trap dan return focus.

## Content Rules

- Link dan tombol memakai kata kerja yang menjelaskan hasil.
- Caption tidak menjadi satu-satunya tempat informasi safety.
- Minimum/range/maximum ditulis eksplisit.
- “Simulasi” dan “Bukan diagnosis” tersedia dalam konteks, tidak hanya onboarding.

## Remaining Manual Tests

- VoiceOver iOS, TalkBack Android, NVDA/VoiceOver web.
- Dynamic Type maksimum dan browser zoom 200%.
- Contrast analyzer seluruh state termasuk danger/warning.
- Reduced-motion pada OS nyata.
- Usability remaja, wali, dan pengguna 60–75.
