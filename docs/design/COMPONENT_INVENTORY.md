# Component Inventory

## Implemented Foundations

- Colors, typography, spacing, radius, breakpoints, motion, icon sizing, shadows, minimum touch target.
- Inter 400/500/600/700 bundled untuk web/native.
- Light foundations dan dark samples; full dark-mode application belum menjadi flow prioritas.

## Core UI (`packages/ui`)

| Component | Implementasi/state |
|---|---|
| `AppText` | display, H1, H2, H3, body-large, body, label, caption, eyebrow |
| `Button` | primary, lime, secondary, ghost, inverse, danger; focused, pressed, disabled, loading |
| `IconButton` | default, selected, focused, pressed |
| `Card` | white, soft, mint, lime, cream, dark, blue, peach, lilac |
| `Chip` | neutral, lime, mint, warning, danger; selected |
| `Field` | label, helper, error, focused, multiline |
| `SelectionCard` | default/selected, icon, description |
| `ProgressRing` | value + screen-reader progress semantics |
| `ProgressBar` | primary/lime/warning/danger/info + accessible value |
| `LimitIndicator` | status text + limit behavior |
| `StatusPill` | green/yellow/red/unknown with text and icon |
| `InlineNotice` | info/warning/danger/success with alert semantics |
| `SimulatedBadge` | explicit simulation marker |
| `SectionHeader` | title and contextual action |

## Composite Components

- `AppShell`: responsive sidebar/rail/floating bottom navigation, header, profile switcher.
- `PublicScreen`, `PageIntro`, `PrototypeFooter`, `ResponsiveColumns`, `BrandMark`.
- Weekly Action card, Baseline card, task row, Nutrition summary, wellness summary.
- Nutrition grid, recipe hero/card, ingredient row, serving counter.
- Pattern Map, confidence cards, Citation Card, Referral Card.
- Activity hero, abstract motion visual, Form Feedback.
- Profile switcher, settings rows, accessibility toggles.
- Screen inventory cards and clickable flow nodes.

## Renderer Templates

`PrototypeScreenRenderer` menyediakan sembilan template: form, dashboard, status, pattern, nutrition, recipe, activity, settings, dan referral. Screen registry memasok title, copy, highlights, next route, serta simulation state.

## Planned Production Components

Bottom sheet, modal, toast, slider, date/time picker native, chart library wrapper, error boundary UI, skeleton/loading, offline banner, and destructive confirmation belum memerlukan library production pada prototype. Behavior ditunjukkan dengan card/state yang ada dan perlu dipilih saat Phase 2 architecture.
