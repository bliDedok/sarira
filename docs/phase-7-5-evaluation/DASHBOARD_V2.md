# Dashboard / Home V2

## Decision

Home is a daily guidance surface, not a control panel for every Phase 3–7 feature. Its primary indicator is **Program Hari Ini** completion because it works across weight management, healthy habits, growth support, fitness, sleep, and healthy aging.

## Recommended hierarchy

1. **Compact header** — greeting/name, optional date, notification, avatar.
2. **Program Hari Ini hero** — next action, short context, progress such as 2/4, one CTA.
3. **Weekly Action** — current action, 2 of 4 days, “Catat hari ini,” “Mengapa dipilih.”
4. **Program or baseline progress** — current phase and next review, not a dense chart.
5. **Nutrition Today** — meal-slot completion and one nutrition sentence.
6. **Meal Plan** — next planned meal with image only if it adds recognition/value.
7. **Activity / Workout** — today’s plan or suggested movement.
8. **Motion Coach** — feature entry, clearly marked preview or available session.
9. **Points and streak** — secondary recognition after health actions.

## Program Today hero

Required content:

- Program name or current phase.
- Progress fraction plus accessible text.
- One next task such as “Catat sarapan” or “Mulai jalan 10 menit.”
- One primary CTA.
- Optional “Lihat semua tugas” secondary link.

Do not include several unrelated metrics, multiple charts, policy labels, or a large photo that reduces task visibility.

## Suggested card model

```text
Program Hari Ini                         2/4
Langkah berikutnya
Catat sarapanmu
[Catat sekarang]
Lihat semua tugas
```

The progress bar includes text; completion is not communicated by color alone.

## Home variants

| State | Hero | Secondary content |
|---|---|---|
| Guest | “Lihat contoh program harian” | Program/food/activity benefits and “Mulai Program Saya” |
| Authenticated, no program | “Buat program pertamamu” | Short value summary; resume draft if present |
| Baseline | “Baseline Hari N” and next check-in | Weekly Action shown only when available |
| Active | Program Today next action | Weekly Action, progress, food/activity summaries |
| Restricted/partial | Safe general action and reason | Clear path to complete safety/profile detail |
| All complete | Calm completion acknowledgment | Tomorrow preview and optional education; no pressure to overdo |

## What moves off Home

- Advanced Nutrition Indicator → Nutrition detail.
- Full meal logging/search/custom food form → Makanan task routes.
- Full activity/steps/history form → Aktivitas routes.
- Body measurement/history forms → Progres detail.
- Pattern evidence and rule details → Pattern detail.
- Consent, policies, and technical metadata → Profile/settings/admin where appropriate.

## Charts

At most one simple progress visualization above the fold. Other information uses text, fraction, mini bar, or compact trend. Every chart needs a text summary and accessible data alternative.

## Notifications and points

- Notification badge should not dominate the header.
- Points/streak should never precede Program Today or Weekly Action.
- A missed day uses neutral reset/restart language.
- Do not show aggressive urgency, calorie debt, or streak-loss threats.

## Mobile behavior

- Single column, 16–20 px padding, 12–16 px gaps.
- Every card is full available width; inner content stacks below 360–393 px.
- No card depends on `minWidth: 280–320` inside a side-by-side row.
- Bottom content clears navigation and safe area.
- Large text may extend card height without clipping/overlay.

## Success criteria

- A user can identify the next action within five seconds.
- Only one primary CTA is visually dominant above the fold.
- No internal version/source/engine label appears.
- No more than one chart is visible before scrolling past core daily actions.
- Guest/new/baseline/active/complete states are intentionally designed.

