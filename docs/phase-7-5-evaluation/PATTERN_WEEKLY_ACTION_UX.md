# Pattern Map and Weekly Action UX

## Principle

Phase 7 results are real and must remain engine-backed. V2 simplifies how those results are explained; it does not change pattern computation, eligibility, evidence, or Weekly Action selection.

## Pattern Map overview

Show six domains with human-readable state such as:

- Pola mulai terlihat;
- Belum cukup data;
- Stabil minggu ini;
- Perlu perhatian ringan.

Do not show internal score, rule ID, policy version, feature key, raw enum, or confidence terminology in normal mode.

## Pattern detail hierarchy

1. **Pola utama** — one clear observation.
2. **Apa yang terlihat** — plain-language summary.
3. **Mengapa ini muncul** — cautious explanation, no diagnosis.
4. **Data yang mendukung** — dates/facts the user can recognize.
5. **Yang dapat dicoba** — safe, small action.
6. **Batas penjelasan** — “Belum cukup data” or uncertainty when relevant.

Example structure:

> Pola sarapan belum konsisten. Dalam empat dari tujuh hari, catatan sarapan belum lengkap. Coba siapkan satu pilihan sarapan sederhana untuk dua hari berikutnya.

This is preferable to raw scores or `UNKNOWN` states.

## Weekly Action on Home

The card appears directly after Program Today:

```text
Aksi Minggu Ini                           2/4 hari
Tambahkan sumber protein saat sarapan
[Catat hari ini]
Mengapa dipilih
```

Rules:

- One primary action.
- Visible target and progress in text.
- “Mengapa dipilih” opens evidence/explanation.
- Completion updates calmly; no body-outcome claim.
- If no eligible action, show why and the next data task.

## Weekly Action detail

- Action and expected behavior, not guaranteed health result.
- Days scheduled and progress.
- Examples/alternatives appropriate to program.
- Supporting pattern and data.
- Check-in history.
- Adjust/skip path if allowed by existing policy.
- Safety boundary.

## States

| State | Presentation |
|---|---|
| Not enough data | Explain what to record next; no empty technical table |
| Available | Action, reason, target, CTA |
| In progress | Completed days and next scheduled opportunity |
| Complete | Acknowledge consistency and show review timing |
| Restricted | Explain safe limitation and available general action |
| Stale/recalculating | Keep last known explanation labeled with date; avoid flicker |

## Accessibility

- Progress includes “2 dari 4 hari,” not bar/color only.
- Domain icons are decorative unless labeled.
- Evidence list follows chronological/logical reading order.
- Expand/collapse controls announce state.
- Plain language and short sentences support ages 12–75.

## Acceptance criteria

- No internal score/rule/policy ID appears in user mode.
- Every pattern explains observation, reason, evidence, and a safe next step.
- Weekly Action is prominent on active Home and has one CTA.
- Existing Phase 7 engine results remain unchanged.

