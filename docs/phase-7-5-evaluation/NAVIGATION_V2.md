# Mobile Navigation V2

## Recommended primary navigation

1. **Beranda**
2. **Program**
3. **Makanan**
4. **Aktivitas**
5. **Progres**

Profile and Settings open from the avatar in the header. Pattern Map and Weekly Action live under Progres and are surfaced contextually on Home. Nutrition detail lives under Makanan. This matches daily intent and gives Program an explicit home.

## Why Profile moves out of the tab bar

Profile is important but lower-frequency than Program. Keeping it as a tab hides the product’s main organizing concept. The avatar remains a familiar, accessible path and can expose settings, privacy, dependents, and account state.

## Quick action recommendation

Do **not** ship a global central `+` in the first mobile refactor. The current app already has overlay problems, and an additional raised control would add competition and a sixth navigation concept. First provide contextual actions:

- Home: next Program action;
- Makanan: “Catat makanan”;
- Aktivitas: “Catat aktivitas” / “Mulai latihan”;
- Progres: “Catat pengukuran.”

After usability data shows repeated cross-feature logging friction, test a safe-area-aware **Catat** button that opens a bottom sheet with:

- Catat makanan;
- Daily Check-in;
- Catat berat;
- Catat aktivitas;
- Mulai latihan.

It must not be a sixth destination, must not cover content, and must be hidden in Guest Explore and focused program-creation/consent/safety flows.

## Bottom navigation behavior

- Fixed/sticky at the shell level, not absolutely positioned inside page content.
- Content bottom inset is derived from actual nav height plus safe area.
- Icon and text label remain visible; never icon-only for the main five.
- Each item has a minimum 48×48 px target.
- Active state uses icon/label emphasis and shape, not lime alone.
- A tab press returns to the last useful root; a second press may scroll to top only after usability testing.
- Detail pages retain back navigation and do not replace tab history unexpectedly.

## Header behavior

| Context | Header |
|---|---|
| Primary tab | Compact title/greeting, optional notification, avatar |
| Detail | Back, concise title, optional contextual action |
| Questionnaire/program creation | Back/close, progress; no bottom nav |
| Guest Explore | SARIRA identity, “Masuk”; no personal avatar |
| Full-screen Motion Coach/cooking | Minimal exit/pause controls; bottom nav hidden |

## Navigation state safety

- Auth gate preserves the intended destination.
- Changing tab while a draft exists prompts only when data would actually be lost.
- Hardware/browser back follows history and never silently exits a session.
- Deep links into personal screens authenticate then resume.
- A restricted feature explains why it is unavailable and provides the next safe action.

## Tablet and desktop

- Tablet may retain bottom nav in portrait and use a compact rail in wide landscape.
- Desktop uses a left sidebar with the same five labels; profile/settings live in the sidebar footer/avatar menu.
- Development/prototype routes are excluded from production user navigation.

## Acceptance criteria

- At 320–430 px, all labels fit without character-level wrapping.
- No scroll content or CTA is obscured by navigation/safe area.
- Five destinations have unique purpose and correct selected state.
- Focus order and screen-reader labels match visual order.
- Program creation, safety, cooking, and coach sessions intentionally hide the main nav.

