# Mobile Design Principles

## North star

SARIRA should feel like a calm, capable companion that tells the user what matters now. Mobile is the source layout; larger screens adapt from the same hierarchy without simply enlarging it.

## Core rules

1. One primary task per screen.
2. One primary CTA in the current viewport.
3. Program action before analytics.
4. Summary before detail; evidence on demand.
5. Human copy before engine metadata.
6. Safe area and keyboard are part of layout, not afterthoughts.
7. Every user-visible state works at 320–430 px and large text.
8. Photography supports meaning; it never competes with safety or forms.

## Validated starting tokens

These are implementation starting points, to be confirmed with device and dynamic-type tests.

| Token | Phone recommendation | Notes |
|---|---:|---|
| Page inline padding | 16 px at 320–374; 20 px at ≥375 | Never reduce text to preserve a row; stack instead |
| Section spacing | 24–32 px | Use 16 px only within a tight group |
| Card gap | 12–16 px | 12 compact, 16 standard |
| Card padding | 16–20 px | Reduce nested cards rather than padding below 16 |
| Card radius | 20–24 px | 28 only for hero/sheet; avoid every surface being pill-shaped |
| Button height | 52–56 px | Minimum target remains 44×44 |
| Input height | 52–60 px | Descriptive selection cards may be taller |
| Bottom nav target | ≥48×48 px | Label remains visible |
| Max reading width | 640–720 px | Prevent overly long desktop lines |

## Mobile typography scale

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 32–34 / 38–41 | 700 | Rare welcome/feature hero; max 2–3 lines |
| H1 | 28–30 / 34–38 | 700 | Screen question/title |
| H2 | 22–24 / 28–32 | 700 | Main section |
| H3 | 18–20 / 24–27 | 650–700 | Card/section title |
| Body | 16 / 23–25 | 400–500 | Primary reading |
| Body Small | 14 / 20–22 | 400–500 | Secondary explanation |
| Caption | 12–13 / 17–19 | 500–600 | Metadata; never safety-critical alone |

Do not lock text height, truncate essential question/consent copy, or reduce body text to fit a row. Support OS/browser text scaling and use flexible containers.

## Layout behavior at ~393 px

- Default is one column.
- Header title/actions may use two rows; subtitle must never sit beneath fixed actions.
- Adjacent buttons only when each remains at least 44 px high and label remains readable; otherwise stack.
- Metric triples become horizontally scrollable only if each card has a complete accessible label; a vertical summary is usually better.
- Avoid nested `min-width` values in flexible rows.
- Text containers use `min-width: 0` and normal word wrapping; do not break words character by character.
- The main scroll content includes measured space for bottom navigation and safe area.

## Safe area, sticky CTA, and keyboard

- Root shell applies top/bottom safe-area insets.
- Bottom navigation participates in a fixed/sticky shell whose height is known to content; no absolute overlap.
- Scroll content ends with `nav height + safe area + 16 px` clearance.
- Questionnaire CTA may be sticky only when the remaining viewport still leaves the active input visible; otherwise it follows content.
- Bottom sheets include bottom safe-area padding and remain keyboard-aware.
- Test iOS Safari/installed web app, Android Chrome, small Android, tablet, and desktop browser.

## Visual direction

- Dark green: high-emphasis brand/hero/nav surface.
- Lime: controlled accent for active progress, small highlights, and primary action on a compatible surface.
- Soft mint: supportive cards and low-intensity selected states.
- Warm neutral/white: reading and form surfaces.
- Never use lime for large backgrounds across multiple consecutive screens.
- Photography has consistent crops/radii and neutral overlays when text is placed on it.

## Motion

- 150–250 ms state transitions; use opacity/transform sparingly.
- Respect `prefers-reduced-motion`.
- Do not animate progress in a way that delays content or implies a health outcome.
- Success feedback is concise and never blocks the next action.

## Content and error states

- Loading uses stable skeleton dimensions or a clear spinner label.
- Empty state explains why it is empty and gives one recovery action.
- Errors preserve user input and provide “Coba lagi.”
- Partial data is shown honestly as “Belum cukup data,” not `UNKNOWN`.
- Offline/pending state distinguishes saved locally from synchronized.

