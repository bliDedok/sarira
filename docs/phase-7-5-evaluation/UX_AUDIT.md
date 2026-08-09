# SARIRA Phase 7.5 — UX/UI Audit

Status: evaluation only. Evidence: Kelompok A screenshots, inspection of current routes/components, and the current Phase 3–7 product behavior. No production change is proposed as already implemented.

## Audit conclusion

SARIRA has substantial real capability, but the current presentation behaves like a desktop dashboard compressed into a phone. At approximately 393 px, nested flexible rows, fixed minimum card widths, long technical labels, absolute bottom navigation, and generic text inputs create critical failures. The primary refactor should therefore simplify task hierarchy and layout behavior before adding visual polish.

The target is a mobile wellness companion: one primary task per screen, progressive disclosure, human language, safe and age-inclusive interactions, and a visible daily program.

## Evidence from Kelompok A

| Evidence | Observed problem | User impact | Priority |
|---|---|---|---|
| Home / Beranda | Text inside the starter card collapses to one character per line | The main card is unreadable and the page appears broken | P0 |
| Home / Beranda | Floating bottom navigation covers the card and page content | Content and actions cannot be reached reliably | P0 |
| Consent | Terms description collapses into a very narrow vertical column beside the toggle | Required consent cannot be understood safely | P0 |
| Nutrition Indicator | Header subtitle is hidden behind bell/avatar actions | Page identity and explanation are clipped | P1 |
| Nutrition Indicator | `PHASE5-DEV-V1`, `RULE-BASED`, `ADA DATA UNKNOWN`, and safety rule IDs are visible | Users see implementation state rather than useful guidance | P1 |
| Questionnaire | Many large fields are placed in one long section | High effort, unclear completion, abandonment risk | P1 |
| Questionnaire | Time is entered as a string and numeric fields are blank text boxes | Validation errors and keyboard friction are likely | P1 |
| Profile summary | Raw enums such as `YOUNG_ADULT` and `USER` are shown | Confusing, impersonal, and not localized | P1 |
| Onboarding | Heading scale consumes much of the viewport | The actual choice/action is pushed below the fold | P1 |
| Date of birth | Full `YYYY-MM-DD` is requested with a text keyboard | Excess data collection and poor mobile input | P1 |
| Several screens | Browser keyboard and bottom chrome obscure content/CTA | Users can lose context or be unable to continue | P0 |
| Dashboard cards | Dense metrics and multiple CTAs compete equally | No obvious “what should I do now?” | P1 |

## Root causes in the current UI

1. `AppShell` uses an absolutely positioned mobile navigation with a fixed content inset. It does not adapt to safe-area, browser chrome, keyboard, or dynamic navigation height.
2. Several cards use desktop-oriented rows and `minWidth` values around 280–320 px inside already padded containers. Sibling controls then leave too little width for text.
3. The header combines long title/subtitle content with fixed notification and avatar controls without a robust compact mobile variant.
4. Generic text input is reused for date, time, height, weight, and structured choices.
5. Onboarding groups many questions in large section cards instead of a guided conversation.
6. Internal engine metadata is passed directly to presentation components.
7. Home, Food, Activity, and Progress each aggregate too many workflows on one route.
8. Current route guards make authentication the first gate, so value is not demonstrated before account creation.

## Prioritized issue register

### P0 — critical usability

| ID | Issue | Required outcome |
|---|---|---|
| P0-01 | Bottom navigation or sticky CTA overlays content | Safe-area-aware shell with measured bottom inset and scroll clearance |
| P0-02 | Text can collapse vertically in narrow flex layouts | Mobile stacks; every text region gets usable width and `min-width: 0` behavior |
| P0-03 | Consent content is unreadable | Full-width consent summary, separate “read details,” and full-width confirmation control |
| P0-04 | Keyboard can hide the active field or CTA | Keyboard-aware scrolling, focus reveal, and non-obstructing actions |
| P0-05 | Required actions can fall outside reachable scroll area | Last interactive element clears safe area, nav, and browser chrome |

### P1 — high

| ID | Issue | Required outcome |
|---|---|---|
| P1-01 | Long administrative onboarding | Guest-first discovery and short program creation after authentication |
| P1-02 | Multiple questions/tasks per screen | One primary task; progressive follow-up after first program |
| P1-03 | Full DOB requested for age grouping | Age-first UX with safe data/refactor plan; no synthetic DOB |
| P1-04 | Generic input for time and measurements | Native time control and measurement picker/stepper |
| P1-05 | Home is a dense dashboard | Daily program-first hierarchy with one primary CTA |
| P1-06 | Developer/debug language is visible | Presentation adapter maps all enums/rules/versions to plain language |
| P1-07 | Raw enums and source states are exposed | Localized labels and expandable user-facing explanations |
| P1-08 | Header content clips on mobile | Compact title, optional subtitle below actions, tested at large text |
| P1-09 | Food, Activity, Progress combine creation, history, and analytics | Task-focused entry screens and detail routes |
| P1-10 | No guest preview | Public Explore surface with soft authentication gates |
| P1-11 | Product lacks a visible program concept | Program Home, Today plan, phase, and next action derived from existing engines |

### P2 — medium

| ID | Issue | Required outcome |
|---|---|---|
| P2-01 | Typography hierarchy is oversized on phones | Mobile-specific type scale and line-length controls |
| P2-02 | Spacing/radius varies by feature | Shared mobile tokens and composition primitives |
| P2-03 | Advanced nutrition competes with daily tasks | Simple summary first, detail on demand |
| P2-04 | Pattern Map exposes implementation concepts | Plain “what we noticed / why / try this” structure |
| P2-05 | Empty, loading, error, and partial-data states vary | Standard state components and recovery action |
| P2-06 | Active/selected states sometimes depend mainly on color | Checkmark, label, border, and state announcement |
| P2-07 | Profile is a primary tab despite low daily frequency | Move profile/settings to header avatar |
| P2-08 | Desktop/tablet merely stretch mobile cards | Deliberate 1–2 column tablet and sidebar desktop layouts |

### P3 — polish

| ID | Issue | Required outcome |
|---|---|---|
| P3-01 | Over-reliance on geometric decoration | Curated photography only where it explains content or increases motivation |
| P3-02 | Lime can dominate large surfaces | Lime as controlled accent on dark green, mint, white, and warm neutral surfaces |
| P3-03 | Motion and feedback are inconsistent | Short, reduced-motion-safe transitions and clear success feedback |
| P3-04 | Content voice varies between clinical, technical, and promotional | Warm, factual, body-neutral SARIRA voice |

## Current information-density audit

| Surface | Current density | V2 rule |
|---|---|---|
| Splash/auth | Technical phase/adaptor language | One value statement and two choices: Explore or Sign in |
| Program creation | Administrative steps plus grouped questionnaire | Guided, short, conditional conversation |
| Home | Many metrics/cards/charts | Today’s program, Weekly Action, then summaries |
| Food | Log form, search, custom food, items, nutrition indicators | Meal slots first; add/plan/detail as separate tasks |
| Activity | Logging, steps, history, coach teaser | Today activity and clear Motion Coach entry |
| Progress | Measurements, baseline, digestive, Pattern Map, actions | Program progress summary with separate detail routes |
| Pattern Map | Scores/rules/policies | Pattern, evidence, meaning, and one safe action |

## Copy sanitization examples

| Internal/current | User-facing proposal |
|---|---|
| `PHASE5-DEV-V1` | Omit |
| `RULE-BASED` | “Dihitung dari catatan dan profilmu” when explanation is needed |
| `SAFETY_YELLOW_GENERAL_TARGET_ONLY` | “Saranmu dibatasi agar tetap sesuai dengan kondisi yang kamu catat.” |
| `UNKNOWN` | “Belum ada cukup data” |
| `TARGET_ONLY` | “Target umum sementara” |
| `POLICY VERSION` / `RULE VERSION` | Omit; available only in admin/debug views |
| `YOUNG_ADULT` | “Usia 18–25 tahun” or an age-neutral sentence |
| `USER` | “Untuk diri sendiri” |

## Refactor success signals

- No horizontal overflow, character-by-character wrapping, or obscured actions at 320–430 px.
- A new visitor can explain SARIRA’s value before registration.
- A registered, eligible user reaches a first program summary in seven core screens or fewer, excluding safety/guardian conditional steps.
- Home answers three questions in order: what should I do, how am I progressing, what else is available.
- Engine results remain intact; only their presentation and interaction layer changes.
- Internal IDs, policy versions, phase labels, or environment terminology never appear in normal user mode.

