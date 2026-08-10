# Component Inventory V2

## Audit conclusion

The existing shared UI foundation—Button, Card, Chip, progress, Field, radio, checkbox, toggle, modal, and bottom sheet—should be reused. The main gap is not a lack of primitives; it is the absence of mobile task compositions, structured wellness inputs, robust responsive variants, and safe shell behavior.

## Existing components

| Existing component | Decision | Required evaluation/refactor |
|---|---|---|
| Button | Keep/refine | 52–56 px primary height, loading/disabled semantics, large-text wrapping, no hidden CTA |
| Card | Keep/refine | Remove fixed/nested min-width assumptions; surface/border variants before heavy shadows |
| Chip | Keep/refine | Single/multi-select semantics, clear state and removal label |
| Progress | Keep/refine | Text equivalent, determinate/indeterminate semantics, reduced motion |
| Field/TextInput | Keep for true text | Do not reuse for date/time/structured choices/measurements |
| Radio/Checkbox | Keep | Larger hit area, clear label/description, error state |
| Toggle | Keep for settings | Do not use as a substitute for required consent; prevent narrow sibling layout |
| Modal | Keep sparingly | Focus trap/return, readable at large text, avoid multi-step forms |
| BottomSheet | Keep/refine | Safe area, keyboard, drag/close semantics, focus and screen reader |
| ScreenLayout/PublicScreen | Refactor | Shared dynamic safe area and responsive content primitives |
| AppShell/AppHeader | Refactor | Measured nav inset, compact mobile title, no clipping/overlay |

## Proposed composition components

| Component | Purpose | Status | Required variants/states |
|---|---|---|---|
| MobileScreen | Standard phone layout | New/refactor | Scroll/non-scroll, nav/no-nav, keyboard-aware |
| SafeAreaShell | Apply safe-area and viewport behavior | New/refactor | top/bottom/both, browser/PWA |
| AppHeader | Primary/detail header | Refactor | guest, tab root, detail, questionnaire, large text |
| QuestionProgress | Program-creation progress | New | X/Y, stage/percentage, resumed, conditional total |
| SelectionCard | Single choice | New composition | selected, pressed, disabled, error, long description |
| MultiSelectionCard | Multiple choices | New composition | selected count, mutually exclusive option, safety warning |
| AgePicker | Age 12–75 | New | wheel/number, large text, error, screen reader |
| WeightPicker | Weight entry | New | decimal, stepper, numeric edit, bounds |
| HeightPicker | Height entry | New | integer, stepper, numeric edit, bounds |
| TimePicker | Local time | New wrapper | native iOS/Android/web, overnight context |
| ConsentSummary | Readable consent | New composition | required/optional, details, accepted, updated version |
| ProgramCard | Program summary/preview | New composition | guest example, eligible, restricted, active |
| DailyProgramCard | Daily action | New composition | not started, progress, completed, skipped, unavailable |
| MealCard | Meal slot/menu | New composition | planned, complete, missing, loading, image fallback |
| RecipeCard | Recipe preview | New composition | image, time, portion, saved, unavailable |
| NutritionSummary | Progressive nutrition info | New composition | compact, standard, advanced, partial data |
| ActivityCard | Today activity/log | New composition | scheduled, manual, complete, rest |
| WorkoutCard | Workout selection | New composition | eligible, equipment, intensity, restricted |
| MotionCoachCard | Coach entry/status | New composition | MVP available, preview, future, restricted |
| SessionControls | Workout player | New | timer, manual reps, paused, completed, large target |
| WeeklyActionCard | Current weekly action | Refactor/new | available, partial, complete, insufficient data |
| PatternCard | Human-readable pattern | Refactor/new | emerging, stable, insufficient data, restricted |
| ProgressCard | Program/baseline progress | New composition | fraction/bar/trend, no-chart variant |
| PointBadge | Small point recognition | New | earned, pending, reversed; never universal KPI |
| LevelBadge | Engagement level | New | compact/detail, optional hidden state |
| StreakBadge | Consistency status | New | active, grace/restart, hidden |
| BottomNavigation | Five destinations | Refactor | safe area, tablet rail, selected/focus/large text |
| QuickActionSheet | Optional future log shortcuts | Deferred/test | authenticated only, safe area/keyboard |
| GuestGate | Soft authentication explanation | New | sheet/full page, resume intent |
| AuthGate | Route/personal-action boundary | Refactor | preserving destination, loading/error |
| EmptyState | Consistent no-data state | New/refactor | no data, filtered empty, unavailable |
| ErrorState | Recoverable error | New/refactor | inline/page, retry, preserved draft |
| ImageWithFallback | Curated content image | New | responsive source, loading, fallback, focal point |
| EvidenceList | Pattern support | New composition | collapsed/expanded, date/source in human terms |

## Component behavior contracts

### Width and wrapping

- Components are fluid by default (`width: 100%` within parent constraints).
- No mobile composition requires a fixed 280–320 px child beside another content block.
- Text containers may shrink as a whole but do not break words character by character.
- Long localized text and 200% text scaling increase height rather than overlap.

### State semantics

- Selected/complete/error/disabled is conveyed by text/icon/shape plus color.
- Async actions prevent duplicate submission and announce progress/result.
- Loading/empty/error/partial/offline states are part of each data component contract.

### Visual contract

- Common radius/padding/type tokens; limited elevation variants.
- Lime is an accent, not the only state signal.
- Images expose aspect ratio/focal point/fallback; decorative images have empty alt.

## Component test matrix

Every new/refactored component should be evaluated at:

- widths 320, 360, 393, 430, 768, 1024, and 1440;
- text scale 100%, 150%, and 200%;
- light theme/current theme and high-contrast browser/OS conditions;
- keyboard-only web and screen-reader labels;
- loading, empty, error, offline, disabled, long content, and RTL-readiness where applicable;
- iOS Safari/PWA and Android Chrome.

## Out of scope for evaluation

No component is implemented here. No API contract, engine, database model, Prisma schema, or production route is changed.

