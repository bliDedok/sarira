# Program Questionnaire V2

## Final recommendation

Use a seven-screen core flow with conditional safety/goal steps, then gather non-essential detail progressively inside the active program. The questionnaire should feel like a guided conversation, not a health form. “One primary task” does not forbid two tightly related values such as weight and height on one body-basics screen.

## Core flow

| Order | Screen | Why now | Interaction |
|---:|---|---|---|
| 1 | “Berapa usiamu?” plus self/dependent context only when relevant | Age, teen, guardian, safety, and eligibility | Age wheel/number picker 12–75 |
| 2 | “Data tubuh dasar” | Needed for relevant target/nutrition logic | Weight and height picker/stepper |
| 3 | “Apa tujuan utamamu?” | Selects program family | Single-selection cards |
| 4 | “Seperti apa aktivitas harianmu?” | Establishes basic context without a long survey | Single-selection cards with examples |
| 5 | “Ada hal yang perlu kami pertimbangkan?” | Required safety boundary | Multi-select cards with “Tidak ada” and “Tidak yakin” |
| 6 | “Sebelum program dibuat” | Required privacy/terms and role-appropriate consent | Concise acknowledgements; details in readable pages/sheets |
| 7 | “Programmu siap ditinjau” | Confirm user intent and start | Summary and edit links |

## Conditional screens

| Condition | Screen | Classification |
|---|---|---|
| Teen/dependent path | Guardian identity/consent | SAFETY REQUIRED |
| Eligible weight-change goal | Target weight | REQUIRED NOW only for that program |
| Eligible weight-change goal | Safe pace/intensity | REQUIRED NOW; constrained, not free-form |
| Meal personalization requested | Allergy/restriction | SAFETY REQUIRED before personalized menu |
| Multiple eligible program variants | Program choice | REQUIRED NOW only when user choice is meaningful |
| Safety response requires detail | Focused follow-up/result | SAFETY REQUIRED |

## Data classification

### REQUIRED NOW

- Declared age and actor context.
- Weight/height only when required by approved eligibility/target/nutrition logic; if not required for a habit-only preview, it may be delayed.
- Primary goal.
- Daily activity context.
- Required consent acknowledgement.
- Engine-required safety inputs.
- Target/pace only for an eligible goal where the existing policy needs them.

### PROGRESSIVE LATER

- Workout frequency, before the first personalized activity plan.
- Sleep time and wake time, as a baseline task.
- Sleep quality and stress, in a recovery check-in.
- Food preferences, before first Guided Meal.
- Cooking time, equipment, skill, budget, and household size for Guided Meal/Flex Kitchen.
- Detailed digestive and activity context in their relevant feature.

### OPTIONAL

- Target weight when not needed for eligibility and the user does not want to set one.
- Notes/free text.
- Waist/other optional body measurements.
- Optional notification preferences, accessibility preferences, and favorite cuisines.

### SAFETY REQUIRED

- Existing safety-screening questions and any engine-mandated follow-up.
- Guardian consent for applicable teen/dependent use.
- Allergy/restriction before generating or saving personalized food guidance.
- Mobility/activity safety before a personalized workout or Motion Coach session.
- Non-diagnostic/scope acknowledgement where currently required.

## Screen count scenarios

| Scenario | Expected screens |
|---|---:|
| Adult, general healthy habits, no safety branch | 7 |
| Adult, eligible weight goal | 9 |
| Teen/dependent | 8–10 depending on safety/goal |
| Meal personalization invoked later | +1–2 in the Food context, not initial program creation |
| Activity personalization invoked later | +1–2 in Activity, not initial program creation |

The UI should state “Langkah X dari Y” only when Y reflects the resolved branch. If the total can change, use a stage label plus progress percentage rather than displaying an inaccurate total.

## Question interaction rules

- Display one clear question, optional one-sentence reason, and answer controls.
- Keep the primary CTA reachable but not overlaid; disable it with an explanatory error only when required.
- Do not auto-advance after selection; explicit “Lanjut” supports review, motor accessibility, and screen readers.
- Back preserves answers.
- Selected state includes checkmark and accessible state announcement.
- Provide “Tidak tahu” only when the engine can safely handle it; otherwise explain why the answer is needed.
- Use examples that describe daily life, not jargon such as activity multipliers.
- Error copy appears beside the answer and says how to fix it.

## Safety and body-neutral wording

- Ask facts without praise or shame.
- Do not promise a body outcome or deadline.
- Pace choices should use safe, policy-approved ranges and explanatory text.
- Health considerations should say “yang perlu dipertimbangkan,” not diagnose.
- “Tidak ada” is mutually exclusive with other safety selections.
- “Tidak yakin” routes to conservative behavior and clear help, never silently treats the user as safe.

## Progressive-question timing

| Moment | Prompt | User value shown first |
|---|---|---|
| Baseline Day 1 | Sleep/wake time | “Membantu membaca pola pemulihan mingguan.” |
| First Activity plan | Workout frequency/mobility | “Agar target aktivitas terasa realistis.” |
| First Guided Meal | Preference/allergy | “Agar menu aman dan sesuai kebiasaanmu.” |
| Weekly review | Stress/sleep quality | “Membantu menjelaskan perubahan pola minggu ini.” |

## Rejected questionnaire approaches

- Full date-of-birth text entry.
- All 16 candidate topics as mandatory consecutive screens.
- One giant scroll with every section.
- Free-form pace/intensity values.
- Raw enumerations in the summary.
- Decorative photos on questionnaire, consent, or safety screens.
- Synthetic birth date generated from age.

