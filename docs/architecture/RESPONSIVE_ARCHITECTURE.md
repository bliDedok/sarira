# Responsive Architecture

Shared breakpoints remain token-based:

| Mode | Width |
|---|---|
| mobile | 0–767 px |
| tablet | 768–1023 px |
| desktop | 1024–1439 px |
| wide | 1440 px+ |

`useResponsiveLayout()` returns mode and boolean helpers. `AppShell` chooses a five-tab floating mobile navigation, compact tablet rail, or desktop/wide sidebar. It never branches on iPhone/iPad product names.

Phase 2 browser regression results:

- 393×852: auth and Home; five tabs; 0 px horizontal overflow.
- 834×1112: compact rail; eight links; 0 px horizontal overflow.
- 1440×1000: full sidebar; eight links; 0 px horizontal overflow.

Native bundles for iOS and Android pass. Runtime device testing remains required because this environment has neither Xcode Simulator nor Android SDK/emulator.
