# Responsive and Adaptive Layout Audit

## Current finding

The current UI is responsive in the narrow technical sense that it renders on a phone, but it is not robustly mobile-adaptive. Desktop-oriented rows, fixed/minimum card widths, absolute bottom navigation, oversized headings, and generic form layouts produce clipping, vertical text, overlay, and keyboard problems at iPhone width.

## Critical current failures

| Failure | Likely cause | Required correction |
|---|---|---|
| Character-by-character text wrapping | Squeezed flex child beside fixed siblings/min-width cards | Stack on phone, allow text region full width, `min-width: 0`, normal word break |
| Bottom nav covers cards/CTA | Absolute positioning plus fixed padding | Shell-level nav, measured content inset + safe area |
| Header subtitle clipped | Long title group beside fixed actions | Compact/two-row mobile header; subtitle below title/actions |
| Consent vertical column | Long text and toggle in one horizontal row | Full-width summary then separate control |
| Keyboard hides context/action | Static viewport/sticky element | Keyboard-aware scroll and CTA strategy |
| Forms become extremely long | Multiple large cards/questions per route | One primary task and progressive routing |

## Breakpoint behavior

### Mobile: 320–767 px

- One column.
- 16 px padding below 375; 20 px at typical 393/430 when content allows.
- Full-width cards and controls.
- Stack title/actions when needed.
- Bottom navigation for five primary destinations.
- No dense side-by-side metric grids; use summary rows/cards.
- Questionnaire/program creation has no main bottom navigation.

### Tablet: 768–1023 px

- One main reading column for questionnaire, consent, safety, recipe, and task flows.
- Up to two columns for browse/inventory cards when each remains readable.
- Portrait may keep bottom nav; wide landscape may use compact navigation rail.
- Content max width prevents stretched text; sheets may become centered dialogs.

### Desktop: ≥1024 px

- Left sidebar with the same information architecture.
- Structured content with 2–3 columns only for independent summaries/browse items.
- Forms remain a focused 560–720 px column, not a full-width grid.
- No mobile bottom nav.
- Prototype/developer routes remain absent from user sidebar.

## Viewport and safe-area rules

- Use dynamic viewport units where appropriate; account for mobile browser chrome.
- Apply `env(safe-area-inset-top/bottom)` through one shell.
- Content bottom clearance is computed from actual navigation/action height.
- Avoid fixed heights for content cards and question areas.
- Landscape supports notches and shortened height without losing controls.
- Modal/sheet max height leaves a dismiss path and scrolls internally only when necessary.

## Keyboard rules

- Focus scrolls into a visible area above the software keyboard.
- Native time picker and selection cards avoid unnecessary keyboard use.
- Numeric fields use correct input mode and persistent labels.
- Sticky CTA does not cover the focused field or error.
- On keyboard close, scroll position remains stable.

## Image behavior

- Explicit aspect ratio prevents layout shift.
- `object-fit: cover` with stored focal point.
- Responsive variants and `sizes` match actual slots.
- Hero may be 16:9 or 4:3; cards use consistent 4:3 or 1:1.
- Image failure preserves card dimensions with neutral placeholder.

## Validation matrix

| Device/layout | Must validate |
|---|---|
| 320×568 small phone | Long headings, CTA reachability, no horizontal overflow |
| 360×800 Android | Keyboard, native controls, bottom navigation |
| 393×852 iPhone target | All Kelompok A regressions, safe area/browser/PWA |
| 430×932 large phone | Max line length and card density |
| 768 portrait tablet | One/two-column decisions, bottom nav/rail |
| 1024 landscape tablet/desktop | Sidebar transition and focused forms |
| 1440 desktop | Max width, structured columns, no stretched content |

Test at 100%, 150%, and 200% text; both portrait/landscape; iOS Safari/installed PWA; Android Chrome; desktop keyboard navigation; slow/offline image states.

## Acceptance criteria

- Zero horizontal scrolling on core mobile screens unless an intentionally accessible carousel is specified.
- Zero character-level wrapping of normal words.
- Bottom nav/sticky CTA never overlaps the last focusable item.
- All text and actions remain readable/reachable at 200% text.
- Desktop uses sidebar/structured content rather than a stretched phone canvas.

