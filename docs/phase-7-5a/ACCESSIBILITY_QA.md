# Accessibility QA

## Checklist

| Area | Evidence | Result |
| --- | --- | --- |
| Touch target | Token minimum 44 px; picker buttons 52 px; nav tab min 44×57. | PASS |
| Meaning beyond color | Selection memakai checkmark/border; consent checkbox; safety status text+icon. | PASS |
| Screen-reader labels | Picker +/- buttons, numeric field/unit, time controls, consent, nav, progress. | PASS |
| Selection semantics | Single select `radio`; multi select/consent `checkbox`; checked/disabled state. | PASS |
| Progress semantics | `progressbar` dengan min/max/now. | PASS |
| Focus | Web focus border untuk selection/card/input; button focus tetap platform-aware. | PASS |
| Text wrapping | `minWidth: 0`, flex copy, max two-line header, no character-by-character collapse. | PASS |
| Text scale foundation | Heading diperkecil dan line height ditingkatkan; layout satu kolom/scrollable. | PASS dengan device follow-up |
| Keyboard | Focused input dapat discroll; sticky CTA di keyboard-aware root. | PASS dengan device follow-up |
| Reduced motion | Tidak ada motion wajib baru pada phase ini. | PASS |

## Automated coverage

Jest memverifikasi accessibility value progress, AgePicker boundary disabled, SelectionCard checked/disabled state, TimePicker action, dan ConsentCard expand/check state.

## Manual/browser coverage

DOM accessibility snapshot menunjukkan role/label yang benar untuk radio, checkbox, button, textbox, progressbar, dan heading. Visual QA menunjukkan kontras state dibantu shape/border/icon.

## Remaining device acceptance

- VoiceOver pada iOS device.
- TalkBack pada Android device.
- Dynamic Type/font scaling sampai 200% di device.
- Switch Control/keyboard traversal menyeluruh.
- Browser zoom 200% pada browser target release.

Item tersebut tidak memblokir bundle integrity, tetapi wajib sebelum production accessibility sign-off.
