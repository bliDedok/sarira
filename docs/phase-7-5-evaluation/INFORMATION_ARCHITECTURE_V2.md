# SARIRA Information Architecture V2

## Principles

1. Organize by the user’s intent, not by engine or implementation phase.
2. Keep public examples separate from personal data.
3. Make Program the organizing concept; tracking, meals, actions, and progress support it.
4. Keep advanced evidence available one level deeper.
5. Separate daily tasks from history/configuration.

## A. Public / Guest

- Splash
- Welcome
- Explore Home
  - How SARIRA works
  - Program previews
  - Food and Guided Meal preview
  - Activity and Motion Coach preview
  - Progress, Pattern Map, and Weekly Action examples
  - Safety/non-diagnostic statement
- Program preview detail
- Feature preview detail
- Public help, privacy, and terms
- Soft authentication gate

All examples use fictional/clearly labeled demo content and contain no personal result.

## B. Authentication

- Sign in
- Register
- Reset password
- Verification/status
- Resume intended action

Technical adaptor/environment labels are excluded from user mode.

## C. Program Creation

- Introduction / “Buat Program Saya”
- Age and actor context
- Body basics when required
- Goal
- Activity level
- Safety checkpoint
- Conditional guardian consent
- Conditional target/pace
- Concise required consents
- Eligible program choice when more than one exists
- Program summary
- Start/resume draft

## D. Home

- Greeting and avatar
- Program Today hero
- Weekly Action
- Program/baseline progress
- Nutrition today
- Meal plan
- Activity/workout
- Motion Coach entry
- Points and streak
- Notifications and contextual reminders

## E. Program

- Program Home
- Today plan
- Program phase/timeline
- Task detail
- Baseline journey/day
- Day 7 checkpoint
- Program review
- Pause/change program guidance

## F. Food / Nutrition

- Food Today by meal slot
- Add food
- Search/select food
- Meal detail
- Guided Meal
- Meal Plan
- Recipe detail
- Cooking mode
- Swap/substitution
- Flex Kitchen
- Saved/personal recipes
- Nutrition summary
- Advanced Nutrition Indicator

## G. Activity / Motion Coach

- Activity Today
- Add activity/steps
- Activity history
- Workout library
- Workout detail
- Motion Coach introduction
- Session preparation
- Session player/timer/repetition
- Workout result
- Future camera/AI readiness states, clearly marked unavailable until implemented

## H. Progress

- Program Progress
- Baseline progress
- Measurements
- Daily/weekly history
- Sleep detail
- Digestive detail
- Activity/nutrition trends
- Achievements, points, streak, and level

## I. Pattern Map / Weekly Action

- Pattern overview
- Pattern detail
- Supporting data
- Weekly Action detail
- Weekly Action check-in
- Previous actions/history

Internal scores, rule IDs, and policy versions are not part of the normal IA.

## J. Profile / Settings

- Profile summary
- Personal context
- Family/dependent profiles
- Safety and consent records
- Units, reminders, accessibility, language
- Privacy and data controls
- Help/about/non-diagnostic notice
- Account/session
- Admin/debug only when explicitly authorized

## Navigation model

- Bottom navigation: **Beranda, Program, Makanan, Aktivitas, Progres**.
- Avatar opens Profile/Settings.
- Contextual back navigation is used for detail and task flows.
- Pattern Map is reached from Progress and Weekly Action, not a top-level tab.
- Nutrition detail is reached from Makanan and Home summary.
- Quick action is not in the initial recommended nav; see `NAVIGATION_V2.md`.

## Access boundary

| Area | Guest | Authenticated without program | Active program |
|---|---:|---:|---:|
| Public Explore | Full | Full | Full |
| Preview Program/Food/Activity/Progress | Full example | Full example | Full example |
| Personal Home | No | Setup/resume state | Yes |
| Program creation | Auth gate | Yes | Change/review path |
| Personal logs/plans/progress | No | Limited until eligible | Yes |
| Safety/consent/profile | No | Yes | Yes |

