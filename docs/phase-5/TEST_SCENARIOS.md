# Phase 5 Test Scenarios

## Unit coverage

- serving-to-gram conversion and missing conversion;
- gram-based nutrient scaling without early rounding;
- meal/daily aggregation and `null` versus zero;
- 4-serving recipe foundation;
- minimum, range, upper-limit, near-limit, and unavailable states;
- output rounding;
- allergen match and incomplete allergen metadata.

## API/E2E scenarios

| Scenario | Expected result |
|---|---|
| A: Adult adds rice + egg | 2 items, 1 meal, 280 kcal, about 10.8 g protein |
| B: Edit/delete portion | snapshot and daily totals change immediately |
| C: Real indicators | adult target, protein minimum, sodium upper-limit states |
| D: Oatmeal missing sodium | sodium is `null`; UI says “Data belum tersedia” |
| E: Profile says egg allergy | egg preview shows matched allergen warning |
| F: Teen profile | `TEEN_GENERAL`; no adult policy |
| G: Healthy Aging | dedicated policy; no automatic deficit |
| H: Login again | meal snapshots/history persist; another profile is forbidden |
| Safety RED after GREEN target | current-target read automatically replaces it with restricted empty targets |

## Database integration

With local PostgreSQL enabled, tests verify migration-backed search, add item, daily snapshot aggregation, and target persistence. The development seed is run twice to prove idempotency.

## Browser critical path

QA covers registration, full onboarding with nutrition consent and egg-allergy profile, baseline start, meal creation, debounced search, serving preview, add rice/egg, warning, edit/delete, oatmeal unknown, custom food without values, eight indicators, 7-day history, logout/login, and persisted snapshots.

## Responsive/accessibility matrix

- Mobile 390×844: stacked cards, bottom navigation, no horizontal overflow.
- Tablet 768×1024: sidebar and split cards, no clipped meal summary.
- Desktop 1440×900: overview/list/detail layout, no horizontal overflow.
- Interactive controls are at least 44×44 CSS pixels in the tested Phase 5 flow.
- Indicators expose labels and text status, not color alone; search and controls expose semantic roles/labels.

## Quality commands

Run root lint, typecheck, unit/E2E tests, PostgreSQL integration tests, migration status, seed idempotency, API/admin/user builds, Expo web/iOS/Android export validation, secret scan, and `git diff --check` before signing the final report.

