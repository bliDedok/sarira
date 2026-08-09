# Safe Gamification Proposal

## Goal

Use lightweight recognition to reinforce consistent, safe participation. Gamification is secondary to Program Today and Weekly Action and must be optional, understandable, and resistant to unhealthy optimization.

## Reward principles

- Reward completion, consistency, reflection, and approved healthy action.
- Do not reward rapid weight change, lowest intake, calorie deficit, long fasting, extreme exercise, or camera-estimated “perfect form.”
- Cap repeatable events and make awards idempotent.
- A missed day never creates debt, shame, or a punitive notification.
- Points do not change safety/eligibility or clinical-like advice.

## Proposed points

| Event | Points | Limit/guardrail |
|---|---:|---|
| Daily check-in completed | +5 | Once per local day |
| Meal slot logged/confirmed | +3 | Max 3 eligible meal slots/day; no reward based on amount |
| All required Daily Program tasks completed | +10 | Once/day; no duplicate farming |
| Approved activity/workout completed | +8 | Max one standard award/day; duration threshold from safe plan |
| Motion Coach MVP session completed | +8 | Same activity cap; no extra for camera/form |
| Weekly Action check-in | +4 | Only scheduled days |
| Weekly Action target completed | +15 | Once/week |
| Seven-day consistency | +20 | Based on meaningful participation, not perfection |
| Baseline/review milestone | +15 | Once per milestone |

Numbers are proposals for usability and safety review, not an implemented scoring contract.

## Streak

- A day counts when at least one meaningful scheduled program action is completed.
- Rest days can count when the program schedules rest/recovery.
- Allow a neutral “mulai lagi” after interruption.
- Consider a one-day grace mechanism only if it reduces anxiety; do not sell it or create scarcity.
- Show streak after the daily action, not as a threat before it.

## Levels

| Level | Proposed name | Cumulative points (example) |
|---:|---|---:|
| 1 | Mulai | 0–99 |
| 2 | Konsisten | 100–299 |
| 3 | Aktif | 300–699 |
| 4 | Seimbang | 700–1,199 |
| 5 | Berkembang | 1,200+ |

Levels indicate engagement only. They do not imply health status or body outcome.

## Badges

Keep the first set small:

- Program Pertama;
- Baseline Selesai;
- Aksi Mingguan;
- Tujuh Hari Konsisten;
- Resep Pertama;
- Sesi Aktivitas Pertama.

Avoid badges for weight amount, low calorie intake, maximum exercise, or consecutive fasting.

## UI placement

- Home: compact points/streak row below core program sections.
- Progres: dedicated achievement detail and history.
- Completion result: small award confirmation with reason.
- Header: do not permanently compete with notifications/profile unless testing proves useful.

## Abuse, consistency, and backend design

If implemented, use an append-only/idempotent event ledger with unique event key, user, event type, source record, local effective day, points, policy version, and reversal capability. Derive/calculate balance and streak from eligible events or safely cached aggregates. This is a schema/migration project; do not store only a mutable total.

## Safety monitoring

- Review whether points increase logging obsession or disordered behavior.
- Cap events, detect duplicates, and permit corrections/reversals.
- Provide “hide points/streak” preference.
- Test wording with teens, healthy-aging users, and weight-related program users.
- Never use points as a substitute for safety warnings or professional guidance.

