# SARIRA Phase 7.5 — Final UX/UI Evaluation & Mobile Experience Proposal

Status: **proposal/evaluation only**. This document does not authorize or contain production implementation. It does not change frontend, backend, database, Prisma, API, Safety Engine, Nutrition Engine, Meal Planning, Expert System, Pattern Map, or Weekly Action.

## 1. Executive summary

SARIRA’s Phase 3–7 capabilities are substantial, but the current mobile presentation is not yet usable as a coherent wellness companion. At iPhone width, content can wrap vertically, navigation covers content, consent becomes unreadable, headings dominate the viewport, keyboards obstruct actions, and desktop-style dashboards expose too many metrics and technical labels.

The recommended V2 is guest-first and program-led:

**Explore value → authenticate only for a personal action → create a short, safety-aware program → see Program Hari Ini and Weekly Action → progressively add food, activity, sleep, and profile detail.**

The first implementation should focus on shell/layout resilience, plain-language presentation, Guest Explore, short program creation, Program/Home hierarchy, and task-focused feature entry screens. Existing engines remain authoritative and are presented more clearly rather than rebuilt.

## 2. Why the refactor is needed

The current app looks and behaves like a responsive web dashboard compressed into a phone. The mismatch is structural:

- page composition is organized by implementation features rather than user intent;
- authentication precedes product value;
- onboarding asks too much before delivering a program;
- generic text fields replace native/structured interactions;
- fixed/minimum widths fail inside narrow nested layouts;
- absolute bottom navigation and fixed padding ignore safe area/keyboard;
- user-facing surfaces leak development, rule, source, and version terminology;
- Home is a dense output dashboard rather than daily guidance.

Visual polish alone cannot solve these problems. Flow, IA, component behavior, and presentation contracts must change first.

## 3. Top UX problems

### P0 — critical

- Bottom navigation/sticky elements obscure content and actions.
- Text collapses character-by-character in Home and consent.
- Required consent cannot be read reliably.
- Software keyboard can hide the active field or CTA.
- Last content/actions are not guaranteed to clear safe area and browser chrome.

### P1 — high

- Login/register is required before value is demonstrated.
- Onboarding is administrative and long.
- DOB, time, height, and weight use high-friction generic fields.
- Home, Food, Activity, and Progress combine too many workflows.
- Headings and header rows are not robust on small/large-text mobile.
- Program is not a clear organizing concept.
- Developer/debug labels and raw enums are visible.

### P2 — medium

- Inconsistent typography, spacing, radius, and state handling.
- Advanced nutrition/pattern evidence competes with daily actions.
- Selected/progress states need non-color signals.
- Tablet/desktop behavior is not deliberately adaptive.
- Empty/loading/error/partial states need a shared contract.

### P3 — polish

- Curated real photography can add warmth where meaningful.
- Lime use should be more restrained.
- Motion/feedback and tone of voice need consistency.

Full evidence and issue IDs are in `UX_AUDIT.md`.

## 4. UX direction

North star: **mobile wellness companion**, not health form and not a gym dashboard.

Principles:

1. One primary task per screen.
2. Show value before account creation.
3. Program action before analytics.
4. Summary before detail; evidence on demand.
5. Ask sensitive questions only when needed and explain why.
6. Use native/structured input where a value has a known shape.
7. Human language in user mode; technical detail only in authorized debug/admin.
8. Body-neutral, non-diagnostic, age-inclusive content.
9. Safe-area, keyboard, large text, and error states are first-class behavior.

## 5. Reference patterns adopted

- One question per screen or one tightly coherent task.
- Clear progress and effort remaining.
- Large selection cards with visible selected state.
- One clear CTA.
- Consistent mobile spacing and stable navigation.
- One main dashboard indicator.
- Daily activity/program cards.
- Lightweight points/level feedback after health actions.

These are general interaction conventions, reinterpreted through SARIRA’s design system and domain.

## 6. Reference patterns rejected

- No copied logo, colors, illustrations, photographs, icons, wording, or pixel composition.
- No universal calorie gauge as the primary wellness status.
- No oversized decorative artwork behind critical tasks.
- No health-condition choice set without “Tidak ada,” “Tidak yakin,” and safe follow-up.
- No reward for rapid weight change, low intake, or extreme exercise.
- No permanent gamification clutter above the daily program.
- No central plus button in the first refactor without usability evidence.

## 7. Guest strategy

Guest Explore provides public, explicitly labeled examples of:

- Home and Program;
- Food/Nutrition and Guided Meal;
- Activity and Motion Coach;
- Progress, Pattern Map, and Weekly Action;
- benefits, scope, safety, and non-diagnostic positioning.

Guest does not receive real eligibility, personal targets, meal plans, logs, measurements, or progress. It may store only allow-listed route/preview intent. Personal data collection begins in an authenticated, contextual flow.

## 8. Authentication strategy

Authentication is a **soft gate** triggered by personal actions such as “Mulai Program Saya,” “Simpan progres,” “Buat Meal Plan Personal,” “Mulai Coach Session,” or logging data. The gate explains the benefit, offers register/sign-in/later, and appears only in response to an explicit action. After success, the app resumes the intended destination.

Returning users always have a direct “Masuk” choice on Welcome. Deep links use the same gate/resume behavior. Repeated passive-browsing login prompts are prohibited.

## 9. Program creation

Replace long administrative onboarding with “Buat Program Saya.” Recommended core:

1. Age and actor context.
2. Body basics (weight and height as one coherent task).
3. Primary goal.
4. Daily activity.
5. Safety checkpoint.
6. Required concise consents.
7. Program summary.

Add guardian consent, target/pace, safety follow-up, allergy, or program choice only when the resolved branch requires them. Existing eligibility and safety engines decide availability.

## 10. Questionnaire

### Required now

Age/context, engine-required body basics, goal, daily activity, safety, required consent, and conditional target/pace.

### Progressive later

Workout frequency, sleep/wake, sleep quality, stress, food preferences, cooking context, and detailed baseline information—asked inside the feature where the answer creates immediate value.

### Optional

Non-required target, notes, additional measurements, preferences, and personalization details.

### Safety required

Existing safety inputs, guardian requirements, allergy/restriction before personalized meals, and mobility/safety before personalized workout.

Target: seven core screens, typically 8–10 with valid conditional branches. Use accurate branch-aware progress. Preserve answers on back/resume/error.

## 11. Input redesign

| Current | Proposed |
|---|---|
| DOB `YYYY-MM-DD` | AgePicker 12–75 |
| Sleep/wake text | Native/platform TimePicker |
| Weight/height/target blank text | Stepper with editable numeric center and explicit unit |
| Activity/workout/stress/quality | Selection cards/labeled scale |
| Health consideration | Multi-selection cards with none/unsure |
| Food preference/allergy | Multi-select chips/cards; allergy remains safety-critical |
| Consent text beside toggle | Full-width summary/details plus explicit acknowledgement |

Numeric keyboard is a fallback/edit mechanism, not the entire experience. Focus, unit, bounds, errors, keyboard dismissal, and safe-area behavior are specified in `INPUT_COMPONENT_MAPPING.md`.

## 12. Dashboard

Home hierarchy:

1. Greeting/header.
2. Program Hari Ini and one next action.
3. Weekly Action.
4. Program/baseline progress.
5. Nutrition Today.
6. Meal Plan.
7. Activity/Workout.
8. Motion Coach.
9. Points and streak.

Program completion is the main indicator, not calories. Home intentionally has guest, no-program, baseline, active, restricted, and completed variants. Advanced charts/forms move to detail routes.

## 13. Program

Program becomes a primary destination connecting goal, safety, baseline, daily tasks, meals/activity, Weekly Action, Pattern Map, and review. Proposed families include Kelola Berat, Kebiasaan Sehat, Aktivitas & Kebugaran, Dukungan Pertumbuhan, and Healthy Aging; eligibility remains engine-controlled.

The recommended first implementation derives the visible current program from existing data. A durable Program Enrollment model is deferred until multiple programs, pause/resume history, versioned lifecycle, or program analytics are explicitly approved.

## 14. Nutrition

Makanan opens with “Hari ini saya makan apa?” and meal slots: breakfast, lunch, dinner, optional snack. Each slot has status, menu/photo when useful, simple nutrition, and one CTA. Food search, custom food, amounts, history, and advanced indicators move into focused flows.

Guided Meal presents menu photo/name/time/portion/key nutrients/why/recipe/swap/cooking. Flex Kitchen becomes ingredient → quantity → simple summary → suggestion → save, with full numbers behind detail. Existing Nutrition Engine, food database, Meal Planning, recipe, and substitution logic remain unchanged.

## 15. Activity

Aktivitas opens with today’s plan and next action. Logging, steps, history, workout library, and Motion Coach are separate, linked tasks. Workout recommendations remain eligibility/safety-aware. Rest and adjustment are valid states, not failure.

## 16. Motion Coach

### MVP now

Workout library, detail/demo, preparation, timer/manual repetition, pause/skip/end, result, self-reported effort, and safe points proposal. The MVP explicitly says it does not check form through the camera.

### Future AI motion validation

Camera → pose detection → repetition detection → form validation → realtime feedback is a separate future system requiring validation, privacy/security review, consent, teen policy, performance testing, and no-camera alternative. Phase 7.5 makes no production claim or implementation.

## 17. Gamification

Use Points, Streak, Level, and a small badge set to reward safe consistency. Proposed examples:

- check-in +5;
- meal slot +3 with daily cap;
- daily program +10;
- approved activity/Motion Coach +8 with daily cap;
- Weekly Action check-in +4 and completion +15;
- seven-day consistency +20.

Levels: Mulai, Konsisten, Aktif, Seimbang, Berkembang. Points never represent health status. If implemented, use an idempotent event ledger and derived aggregates; this requires schema/migration approval.

## 18. Pattern Map

Keep Phase 7 computation. Present each pattern as:

- Pola utama;
- Apa yang terlihat;
- Mengapa;
- Data yang mendukung;
- Yang dapat dicoba.

Normal user mode hides internal scores, rule IDs, feature keys, policy versions, and raw enums. “Belum cukup data” replaces `UNKNOWN`.

## 19. Weekly Action

Weekly Action remains directly below Program Today on Home. It shows one action, progress such as “2 dari 4 hari,” one “Catat hari ini” CTA, and “Mengapa dipilih.” Detail contains supporting pattern/evidence, alternatives, schedule, and safety boundary. Completion rewards consistency, not body outcome.

## 20. Unsplash image strategy

Use a reviewed fixed manifest of 20 free-license candidates for Explore, program, Indonesian meals, healthy cooking, recipes, workouts, Motion Coach, sleep, healthy aging, family wellness, and growth support. No random source and no runtime API integration in this phase.

Required manifest fields: photo ID/URL, photographer, source, free-license review, intended usage, ratio/crop/focal point, alt, fallback, review status. Use 16:9/4:3 hero/program, 4:3 meal/workout, and 1:1 compact crops. Images are unnecessary on questionnaire, consent, safety, Pattern Map, data tables, and error states. Recheck licensing and identifiable-person/trademark context before implementation.

## 21. Navigation

Recommended bottom navigation:

**Beranda · Program · Makanan · Aktivitas · Progres**

Avatar opens Profile/Settings. Pattern Map lives under Progres and contextually on Home; nutrition detail under Makanan. Program creation, safety, cooking, and workout session hide the main nav. Tablet can use bottom nav/rail; desktop uses the same five items in a sidebar.

Do not ship a global plus button initially. Validate contextual log actions first; test a safe `Catat` bottom sheet later only if cross-feature logging friction remains.

## 22. Responsive behavior

- Mobile 320–767: one column, full-width cards, 16–20 px padding, no fixed nested min-widths.
- Tablet 768–1023: focused flows remain one column; browse/summary may use two columns; optional rail in wide landscape.
- Desktop ≥1024: left sidebar and structured 2–3 column independent summaries; forms stay 560–720 px wide.
- Bottom content always clears measured nav, sticky action, safe area, and browser chrome.
- Test iOS Safari/PWA, Android Chrome, landscape, keyboard, slow image, and 100/150/200% text.

## 23. Accessibility

Target WCAG 2.2 AA web behavior and platform conventions:

- tested contrast; lime is not assumed to work with white;
- minimum 44×44 px targets, 48×48 for main navigation;
- 200% text without loss/overlap;
- persistent labels, associated errors, explicit units;
- radio/checkbox semantics for selection cards;
- visible focus, logical keyboard order, dialog focus return;
- screen-reader progress/state announcements;
- chart text alternatives;
- reduced motion and non-audio alternatives;
- plain, non-shaming language suitable for ages 12–75.

## 24. Privacy

Guest Explore collects no health profile. Sensitive answers begin in authenticated context with just-in-time reasons. Replace DOB UX with declared age only after an approved backend/privacy migration plan; never generate synthetic DOB.

Recommended future fields include declared age and declaration/reconfirmation timestamp plus a central age-context resolver. Teen 12–17 keeps guardian requirements; transition to 18 triggers re-evaluation and preserves historical consent appropriately. Future camera processing needs a separate DPIA, explicit permission, on-device preference, no default recording/upload, and retention controls.

## 25. Backend impact

### No change / minor logic

- Static guest examples, mobile UI, dashboard hierarchy, task-focused screens, Pattern/Weekly Action presentation, curated image manifest.
- Route intent/resume, presentation adapters, conditional questionnaire orchestration, and aggregations may require minor logic/API changes.

### Schema/migration

- Replacing DOB dependency with declared age.
- Persistent anonymous guest profiles (not recommended first).
- Durable Program Enrollment lifecycle if approved.
- Points/streak/level/badge ledger.
- Motion Coach session model if current activity data cannot represent it.

All engines remain authoritative and are not rebuilt.

## 26. Migration impact

The only near-term migration candidate created by the UX requirement is age replacing DOB. Proposed staged plan:

1. Define declared-age semantics and reconfirmation policy.
2. Add nullable age/timestamp fields while retaining DOB.
3. Centralize age/AgeGroup resolution and boundary tests.
4. Derive initial effective age for existing users from stored DOB and request confirmation.
5. Route new UX through declared age.
6. Update onboarding, safety, goals, baseline, nutrition, and expert input adapters.
7. Re-run affected eligibility at age boundary/change.
8. Deprecate mandatory DOB only after quality/privacy approval.

No migration or schema change is executed by this evaluation.

## 27. Implementation order

Recommended future sequence after approval:

1. **Regression safety net** — route/data/engine contract inventory and target-device baseline.
2. **Mobile foundation** — SafeAreaShell, measured nav inset, header, typography, wrapping, keyboard, shared states.
3. **Copy boundary** — presentation mapping that removes internal identifiers/versions from user mode.
4. **Public/guest flow** — Splash, Welcome, Explore, previews, soft gate, auth resume.
5. **Program creation** — question components, inputs, conditional flow, consent/safety, summary.
6. **Program/Home** — Program Today, Weekly Action, program/baseline progress.
7. **Primary navigation** — five tabs, avatar profile, tablet/desktop behavior.
8. **Food/Nutrition** — meal slots, Guided Meal, recipe/cooking, Flex Kitchen progressive disclosure.
9. **Activity/Motion Coach MVP** — task-focused Activity and manual session UX.
10. **Progress/Pattern** — simplified progress, Pattern Map, evidence, action history.
11. **Photography** — approve/pin manifest, responsive image/fallback/attribution.
12. **Gamification** — only after data model, safety, and telemetry review.
13. **Accessibility/responsive QA and moderated usability testing** before release.

Age schema migration and durable program/gamification models require their own approved work packages; do not hide them inside UI work.

## 28. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| UI accidentally changes required engine inputs | High | Input-contract tests and engine-authoritative validation |
| Short questionnaire omits necessary safety data | High | Conditional SAFETY REQUIRED map and safety-owner approval |
| Age without DOB becomes stale | High | Timestamp/reconfirmation and boundary resolver; no synthetic DOB |
| Guest preview is mistaken for personal advice | High | Persistent “Contoh” labels and no real eligibility calculation |
| Auth gate loses intended action | Medium | Versioned allow-list intent and end-to-end resume tests |
| New shell regresses browser/PWA layouts | High | Device matrix, keyboard/safe-area automated/manual tests |
| Photos create stereotypes/licensing issues | Medium/High | Free-license manifest, release/trademark review, diverse body-neutral curation |
| Gamification drives unhealthy behavior | High | Safe event list/caps, optional display, monitoring, no outcome rewards |
| Motion Coach implies AI capability | High | Explicit MVP/future labels and no camera/form claim |
| Progressive questions reduce data completeness | Medium | Capability-specific completeness and contextual prompts |
| Too much scope ships at once | High | Foundation-first increments and separate schema-heavy work packages |

## 29. Acceptance criteria proposal

### Mobile foundation

- [ ] No horizontal overflow or character-by-character wrapping on core screens at 320, 360, 393, and 430 px.
- [ ] Bottom nav/sticky CTA never obscures the last focusable item, error, or active field.
- [ ] Safe area and keyboard work on iOS Safari/PWA and Android Chrome.
- [ ] Essential content remains usable at 200% text.
- [ ] Mobile type scale and spacing tokens are consistently applied.

### Guest/auth

- [ ] Guest can understand Program, Food, Activity/Motion Coach, and Progress value without account.
- [ ] Preview content is clearly labeled as example and contains no personal data.
- [ ] Auth gate appears only after explicit personal action and offers “Nanti.”
- [ ] Successful login/register resumes the intended action.
- [ ] Passive browsing is not interrupted by repeated login prompts.

### Program creation/questionnaire

- [ ] Adult general path reaches summary in seven core screens or fewer.
- [ ] Conditional guardian, target/pace, allergy, and safety steps appear only when required.
- [ ] Required safety/consent cannot be bypassed.
- [ ] Back, resume, error, and offline retry preserve valid answers.
- [ ] Progress count/stage remains accurate for conditional branches.
- [ ] No full DOB text input or synthetic DOB is used.
- [ ] Time, measurements, choices, and multi-select use recommended structured controls.

### Home/program/navigation

- [ ] Home shows Program Today, one primary next action, then Weekly Action.
- [ ] Guest/new/baseline/active/restricted/complete Home states are defined.
- [ ] Bottom nav is Beranda/Program/Makanan/Aktivitas/Progres; Profile opens from avatar.
- [ ] Program page shows phase, next task, schedule, progress, and review.
- [ ] UI cannot override existing safety/eligibility decisions.

### Food/activity/progress

- [ ] Makanan opens with meal slots and simple status/CTA.
- [ ] Guided Meal shows photo/name/time/portion/key nutrients/recipe/swap/cooking.
- [ ] Flex Kitchen uses progressive ingredient→amount→summary→suggestion→save flow.
- [ ] Motion Coach manual MVP does not claim camera/form validation.
- [ ] Pattern Map contains observation/reason/evidence/next step and no internal IDs.
- [ ] Weekly Action shows textual progress and one CTA.

### Language, accessibility, and images

- [ ] No `PHASE`, `DEV`, `RULE-BASED`, raw safety code, `UNKNOWN`, policy/rule version, or raw enum appears in normal user mode.
- [ ] Contrast, 44×44 targets, visible focus, screen-reader labels, errors, reduced motion, and chart alternatives pass review.
- [ ] Photos come only from an approved, pinned, free-license manifest with source/photographer/alt/crop/fallback.
- [ ] Image failure never shows a broken-image layout.
- [ ] No photo/gamification/copy promotes extreme bodies, restriction, shame, or unsafe behavior.

### Regression and governance

- [ ] Safety, Nutrition, Meal Planning, Expert System, Pattern Map, and Weekly Action regression suites remain unchanged/passing when implementation eventually occurs.
- [ ] Schema/migration work is not bundled without explicit approval and rollback plan.
- [ ] Moderated usability includes at least teen/guardian-appropriate, adult, older-adult, and assistive-technology perspectives.

## 30. Recommended Phase 7.5 scope

### Include in the future Mobile UX Refactor after approval

- Mobile foundation and safe-area/keyboard/navigation fixes.
- Plain-language presentation layer and removal of debug terminology.
- Public Welcome, Guest Explore, feature previews, and soft authentication gate.
- Short conditional Create My Program flow and program summary.
- New Home/Program hierarchy and five-item navigation.
- Task-focused Food, Activity, Progress, Pattern Map, and Weekly Action presentations.
- Motion Coach manual-MVP UX shell, clearly separated from future AI.
- Curated image manifest integration with fallback/attribution after licensing review.
- Responsive/accessibility QA and user testing.

### Separate approval/work package

- Declared-age schema migration and DOB deprecation.
- Durable Program Enrollment lifecycle.
- Points/streak/level/badge event ledger.
- Motion Coach session schema if needed.
- Any anonymous cross-device guest persistence.

### Explicitly out of scope

- Rebuilding Safety, Nutrition, Meal Planning, Expert System, Pattern Map, or Weekly Action.
- Phase 8, RAG/AI integration, computer vision, pose detection, form validation, or realtime AI feedback.
- Production coding, API/schema/migration change, branch, commit, merge, or push during this evaluation.

Phase 7.5 evaluation stops after delivery of the 24 documents in this directory and awaits review.

