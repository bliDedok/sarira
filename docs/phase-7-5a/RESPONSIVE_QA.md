# Responsive QA

Tanggal QA: 2026-08-10
Runtime: Expo web lokal, in-app browser, production-equivalent components.

## Viewport matrix

| Viewport | Mode | Horizontal overflow | Vertical-character wrap | CTA/nav overlap | Result |
| --- | --- | --- | --- | --- | --- |
| 320×568 | mobile | Tidak | Tidak | Tidak | PASS |
| 360×800 | mobile | Tidak | Tidak | Tidak | PASS |
| 393×852 | mobile target | Tidak | Tidak | Tidak | PASS |
| 430×932 | large mobile | Tidak | Tidak | Tidak | PASS |
| 768×1024 | tablet | Tidak | Tidak | Tidak | PASS |
| 1280×800 | desktop | Tidak | Tidak | Tidak | PASS |

Browser metrics pada seluruh ukuran menunjukkan `scrollWidth === clientWidth`.

## Screen coverage

- Registration: header, copy, fields, button, dan bottom spacing.
- Foundation preview saat QA: selection cards, age/weight/height/time picker, consent, sticky CTA.
- Consent expanded state.
- Focused weight input; scroll bergerak agar field tetap terlihat.
- Existing shell/prototype home: header dan bottom navigation pada 393 dan 320 px.
- Tablet/desktop: content max width dan sticky CTA mengikuti form, tidak membentang tanpa batas.

Preview QA bersifat sementara dan sudah dihapus setelah capture; tidak ada route debug baru pada final tree.

## Evidence output

Screenshot QA disimpan di temporary workspace, bukan git/build artifact:

- `register-393.png`
- `foundation-393.png`
- `input-focus-393.png`
- `consent-393.png`
- `bottom-nav-320.png`
- `desktop-1280.png`

## Keyboard caveat

Mobile web focus/scroll behavior dan native keyboard-aware configuration tervalidasi. Keyboard fisik/virtual pada device nyata, browser chrome aktual, Dynamic Island, serta OEM Android tetap perlu device acceptance. iOS dan Android production bundles berhasil dibuat.
