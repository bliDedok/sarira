# Input Component Mapping

## Current → recommended

| Data/task | Current | Recommended | Mobile details | Validation/accessibility |
|---|---|---|---|---|
| Date of birth | `YYYY-MM-DD` text input | AgePicker, 12–75 | Wheel/number picker with visible selected age | Announce “usia N tahun”; no synthetic DOB |
| Weight | Blank/generic numeric field | WeightPicker or stepper | `− 65.5 kg +`, tap center for numeric keyboard; 0.1/0.5 step by policy | Unit always visible; bounds and errors announced |
| Height | Blank/generic numeric field | HeightPicker or stepper | `− 168 cm +`; optional wheel | Whole centimeters; large touch targets |
| Target weight | Generic numeric field | TargetWeightPicker | Shows current weight context and policy-safe range | Body-neutral copy; no unsafe pace |
| Sleep start | `HH:mm` text input | TimePicker | Tap row → iOS/Android/native web time control | Locale format visual; canonical storage remains explicit |
| Wake time | `HH:mm` text input | TimePicker | Same component; shows next-day context if needed | Overnight interval explained |
| Goal | Radio/generic control | SelectionCard | Large title + one short consequence | `role=radio`, selected text/checkmark |
| Daily activity | Generic choice | SelectionCard | Behavior examples such as mostly seated / mixed / active | Do not expose multipliers |
| Workout frequency | Generic choice | SelectionCard | 0, 1–2, 3–5, 6+ with plain examples | Avoid moral labels like “lazy” |
| Stress | Text/radio | 3–5 point labeled scale/cards | Low/medium/high with optional context | Labels plus position; no color-only state |
| Sleep quality | Text/radio | Labeled selection cards | Poor/okay/good with plain examples | Explain this is self-reported |
| Food preference | Text or long form | Choice chips/cards | Multi-select with “Tidak ada preferensi” | Clear selected count and reset |
| Allergy/restriction | Text | Searchable multi-select chips/cards plus “Lainnya” | Separate allergy from preference; confirmation summary | Safety-critical; never hide selected items |
| Health consideration | Multiple generic fields | MultiSelectionCard | Clear options, “Tidak ada,” “Tidak yakin” | Mutual-exclusion rules and follow-up |
| Consent | Long text beside toggle | ConsentSummary + Checkbox/acknowledgement | Full-width summary and “Baca detail” | Required control has explicit label; no prechecked consent |
| Recipe serving | Text number | Stepper | `− 2 porsi +` | Minimum/maximum and unit announced |
| Food amount | Text number | Quantity stepper + unit picker | Common quick amounts; numeric keyboard for custom | Supports grams/servings without ambiguity |
| Daily note | Large generic text field | Optional compact TextArea | Character guidance and dismissible keyboard | Label persists; not placeholder-only |

## Measurement interaction decision

Default to a compact stepper with an editable numeric center value. It is faster for small adjustments and more accessible than an unlabeled custom wheel. A wheel may be offered where native support is reliable, but must not trap focus or make large jumps difficult.

### Weight

- Default display: one decimal and `kg`.
- Minus/plus controls are at least 44×44 px.
- Long press acceleration is optional and must stop at validated bounds.
- Tapping the number opens numeric input with decimal separator appropriate to locale.
- Do not use slider: it is imprecise and difficult for assistive technology.

### Height

- Default display: integer centimeters.
- Editable numeric center plus stepper.
- Do not ask feet/inches unless unit preferences are introduced and converted safely.

## Native time control

Preferred interaction: tap labeled row → native time picker or platform-appropriate modal → confirm → return to the same screen. On web, `input[type=time]` may be used when its browser behavior passes device testing; otherwise a fully accessible custom dialog is required.

Rules:

- Keep a visible label after a value is selected.
- Store/transport canonical local time plus timezone context where the domain needs it.
- Explain overnight sleep (e.g. 23:00–07:00, next day).
- Do not show a text keyboard for normal time selection.
- Closing without confirmation preserves the previous value.

## Selection card anatomy

1. Optional icon with no critical meaning.
2. Clear title.
3. One short example/explanation.
4. Radio/checkbox semantics.
5. Checkmark and border on selection.
6. Minimum 52 px height; usually 72–92 px for descriptive choices.

## Keyboard behavior

- Numeric data opens numeric/decimal keyboard.
- “Next” moves to the next field only within a paired input screen.
- Focused field scrolls above keyboard and sticky CTA.
- Dismissal does not reset input.
- The CTA either moves with the keyboard or remains in document flow; it must not obscure the field.
- Web keyboard navigation has visible focus and logical tab order.

