# Design Tokens

Source code: `packages/design-tokens/src/index.ts`.

## Colors

| Token | Nilai | Penggunaan |
|---|---:|---|
| Primary Green | `#176B52` | brand, link, progress, focus |
| Primary Dark | `#0E2A1B` | hero, sidebar, bottom navigation |
| Lime Accent | `#C8F238` | primary action tertentu, selected, progress, Weekly Action |
| Soft Lime | `#EAF8B8` | selected/supporting surface |
| Soft Mint | `#EAF8EF` | nutrition/success/supporting surface |
| Warm Cream | `#F8F7EF` | recipe, baseline, neutral emphasis |
| Surface White | `#FFFFFF` | primary surface |
| Surface Soft | `#F5F7F4` | app background dan input support |
| Text Primary | `#121814` | heading/body utama |
| Text Secondary | `#667069` | body sekunder |
| Text Muted | `#8A938D` | metadata/caption |
| Success | `#3D8A62` | success state plus text/icon |
| Warning | `#E7A52A` | warning state plus text/icon |
| Danger | `#D95B5B` | referral/error plus text/icon |
| Information | `#4F7CAC` | info notice |
| Border | `#E2E8E3` | separator dan outline |

Dark samples: background `#111412`, surface `#1A1F1C`, elevated `#222824`, text `#F4F7F4`.

## Typography

Font coded prototype: Inter 400/500/600/700. Rekomendasi iOS production: SF Pro.

| Style | Ukuran | Catatan |
|---|---:|---|
| Display | 40 | hero dan brand entry |
| H1 | 32 | page title desktop |
| H2 | 26 | section/hero mobile |
| H3 | 21 | card heading |
| Body Large | 18 | context penting |
| Body | 16 | body default |
| Caption | 13 | metadata, tetap terbaca |

## Spacing, Radius, Motion

- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- Radius: input 16, button 20, card 24, large card 28, floating nav 32, pill 999.
- Touch target minimum: 44 px; default button 52 px.
- Motion: fast 120 ms, normal 220 ms, slow 360 ms; reduced-motion mematikan transisi non-esensial.
- Breakpoint: tablet 768 px, desktop 1024 px, wide 1440 px.
- Icon: 16, 20, 24, 32 px; ikon penting selalu memiliki label aksesibel.

## States

Default, hover, focus, pressed, selected, disabled, loading, success, warning, error. Focus memakai border/outline kontras dan tidak bergantung pada perubahan warna halus.
