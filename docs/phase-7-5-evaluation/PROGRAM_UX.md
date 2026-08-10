# Program UX

## Definition

A SARIRA Program is the user-facing structure that connects an eligible goal, safety boundary, baseline, daily actions, meals/activity, Weekly Action, and progress review. It should make Phase 3–7 capabilities feel coherent without rebuilding their engines.

## Program families

Proposed labels, subject to content/legal review:

| Family | User intent | Important guardrail |
|---|---|---|
| Kelola Berat | Gradual gain, loss, or maintenance | No guaranteed result, unsafe pace, or appearance judgment |
| Kebiasaan Sehat | Eating, sleep, activity, routine | Success based on consistent actions |
| Aktivitas & Kebugaran | Regular movement/fitness | Safety and mobility context; not gym-only |
| Dukungan Pertumbuhan | Teen growth-supportive habits | Guardian and age-appropriate policies |
| Healthy Aging | Strength, mobility, nutrition, routine | Accessible pacing and non-stereotyped content |

Availability remains decided by existing age/goal/safety/profile logic.

## Program Home

1. Program title and current phase.
2. Today’s completion and next task.
3. Weekly Action.
4. Seven-day schedule/overview.
5. Program progress and next review.
6. “Why this program” and safety boundary.
7. Optional eligible features.

## Daily program task

Each task has:

- action-oriented title;
- short reason;
- estimated time when meaningful;
- status: not started, in progress, complete, skipped/adjusted;
- one CTA;
- point proposal only after safe completion;
- data source/result in plain language when needed.

Examples: morning check-in, meal slot, hydration reminder, ten-minute walk, sleep-window setup, Weekly Action check-in. The engine determines content; the card determines presentation.

## Program phases

| Phase | Presentation |
|---|---|
| Setup | Minimum profile and safety complete |
| Baseline | Observe patterns for the current baseline period; avoid “test” language |
| Active | Daily actions and Weekly Action |
| Review | What changed, Pattern Map evidence, and eligible adjustment |
| Continue | Confirm goal/safety and select a safe next focus |

Do not promise that a program automatically ends on a specific body result date.

## Adjust, pause, and resume

- “Sesuaikan program” first explains which changes are safe/currently available.
- Goal/safety changes re-run existing eligibility pathways.
- Pause is neutral and reversible; no streak punishment.
- Resume shows the next small action, not an accumulated backlog.
- Completed programs remain readable in history if durable lifecycle persistence is later approved.

## Program progress

Use completion and pattern consistency rather than only body measurements. Suggested dimensions:

- daily tasks completed;
- Weekly Action days;
- baseline completeness;
- meal/activity/sleep consistency as relevant;
- review checkpoint reached.

Body measurement trends are optional context, not the universal success definition.

## Technical boundary

### Presentation-only V2

Derive the visible current program from existing goal, safety, program preference, baseline, nutrition, Expert System, Pattern Map, and Weekly Action data. This is the recommended first scope.

### Future lifecycle model

Multiple enrollments, historical versions, pause/resume records, program transitions, and explicit phase state may require a new Program Enrollment schema and migration. That must be separately approved and is not part of this evaluation.

## Acceptance criteria

- Program appears as a primary destination and Home organizing concept.
- Eligibility/safety output is never overridden by UI choice.
- The user can always identify phase, next action, and next review.
- Raw engine identifiers/versions are absent.
- Progress does not reward unsafe speed, restriction, or extreme exercise.

