# Mobile Foundation

## Foundation components

| Component | Tanggung jawab |
| --- | --- |
| `KeyboardAwareScreen` | Safe area empat sisi dan `KeyboardAvoidingView` untuk iOS. |
| `ScrollableScreen` | Scroll yang mempertahankan tap, dismiss keyboard, dan inset keyboard iOS. |
| `MobileScreen` | Root screen mobile dengan background konsisten. |
| `FormScreen` | Form satu kolom, lebar maksimum, dan padding berbasis token. |
| `StickyActionArea` | CTA tetap terlihat, menghormati bottom inset, dan dibatasi lebar pada layar besar. |
| `AppHeader` | Header yang aman terhadap wrapping dan action yang tidak collapse. |
| `MobileCard` | Wrapper card reusable. |
| `Section` | Ritme judul, deskripsi, dan content section. |
| `BottomSafeSpacer` | Spacer berdasarkan bottom safe-area inset. |

Implementasi utama berada di `apps/user-app/components/MobileFoundation.tsx` dan diintegrasikan melalui `ScreenLayout.tsx` serta `AppShell.tsx`.

## Safe area dan keyboard

- Root screen menggunakan `SafeAreaView` dengan edge top, left, right, dan bottom.
- iOS menggunakan `KeyboardAvoidingView` dengan behavior `padding`.
- Scroll menggunakan `keyboardShouldPersistTaps="handled"`.
- iOS menggunakan `keyboardDismissMode="interactive"` dan `automaticallyAdjustKeyboardInsets`.
- Android menggunakan dismiss on-drag dan tetap memperoleh safe-area dari provider.
- Sticky CTA berada di luar scroll content tetapi di dalam keyboard-aware root.

## Navigation foundation

Mobile bottom navigation dipindahkan dari absolute overlay menjadi bagian layout normal. Akibatnya:

- konten tidak memerlukan padding tebakan 118 px;
- nav tidak menutupi card terakhir;
- safe area bottom ditangani oleh shell;
- setiap tab mempunyai minimum width 44 px dan minimum height 57 px;
- label tidak collapse menjadi satu karakter per baris.

Destination/IA existing tidak diubah. Navigation V2 tetap scope phase berikutnya.

## Typography dan spacing

Token typography mobile:

- Display 34/41
- H1 30/38
- H2 24/31
- H3 20/27
- Body/Body Small/Caption/Label mempertahankan hierarki readable

Token layout menambahkan page padding mobile/tablet/desktop, content/form max width, tinggi navigation, tinggi sticky action, dan ukuran kontrol. Target minimum touch tetap 44 px.

## Responsive behavior

- Mobile selalu satu kolom.
- Flex child penting menggunakan `minWidth: 0` dan text container menggunakan `flex: 1`.
- Header copy maksimal dua baris; action tidak ikut menyusut.
- Sticky CTA mengikuti max width content pada tablet/desktop.
- Card dan picker memakai width relatif, bukan fixed desktop width.

## Known limitation

Bundle native berhasil, tetapi physical-device keyboard, Dynamic Island, TalkBack, dan VoiceOver tetap perlu acceptance di perangkat nyata/staging. Fondasi kode untuk inset dan keyboard sudah aktif.
