# Accessibility Review

## Target

SARIRA must serve users aged 12–75 across different vision, motor, cognitive, reading, and technology needs. The refactor target should be WCAG 2.2 AA for the web experience plus platform accessibility conventions for native-like controls.

## High-risk findings

| Finding | Risk | Priority |
|---|---|---|
| Content/controls overlap with navigation and keyboard | Focus/action becomes unavailable | P0 |
| Consent text collapses vertically | Informed acknowledgement is impossible | P0 |
| Oversized headings and fixed layouts | Content disappears at large text | P1 |
| Selected/progress states can rely heavily on color | State is unclear with low color perception | P1 |
| Generic text input for time/measurements | Higher error and motor/cognitive burden | P1 |
| Internal jargon/raw enums | Reading/comprehension barrier | P1 |
| Charts/metrics lack simple equivalent | Screen-reader and cognitive barrier | P1/P2 |

## Required standards

### Contrast and color

- Validate all final foreground/background combinations at AA: 4.5:1 normal text, 3:1 large text and relevant UI graphics.
- Do not assume lime works with white text; choose a tested dark foreground or darker button surface.
- Selected, warning, error, and complete states use text/icon/shape in addition to color.

### Text and zoom

- Body default 16 px; no essential text below 12–13 px.
- Support OS dynamic type and browser zoom/text-only zoom to at least 200% without loss or overlap.
- Avoid fixed text containers, line clamps for essential content, and all-caps paragraphs.
- Keep sentences short, plain, and localized; explain unfamiliar wellness terms.

### Touch, pointer, and keyboard

- Minimum 44×44 px target; 48×48 preferred for primary navigation.
- Adequate separation between destructive/primary actions.
- Visible focus ring with sufficient contrast.
- Logical tab order; no positive tab index.
- Enter/Space semantics match native controls; Escape closes dismissible modal/sheet.
- Focus moves to dialog/sheet and returns to trigger.

### Screen readers

- Every control has programmatic label, value, role, state, and error association.
- Question progress announces “Langkah 3 dari 7,” not only a bar percentage.
- Selection cards use radio/checkbox groups with legend/question.
- Status updates use restrained live regions; do not announce every decorative change.
- Decorative icons/images use empty alt; meaningful photos have concise contextual alt.
- Charts have a text summary and accessible data table/list where detail matters.

### Forms

- Visible labels persist; placeholder is not the only label.
- Error is adjacent, specific, and programmatically associated; focus is moved/summarized after submit when needed.
- Native time picker and numeric input expose platform semantics.
- Units are part of label/value, not only visually adjacent.
- Required vs optional is explicit in text.
- Consent is never preselected and details remain readable before confirmation.

## Cognitive and age-inclusive design

- One primary task per screen and one dominant CTA.
- Predictable back/continue placement.
- Explain why sensitive information is requested at the point of entry.
- Avoid shame, urgency, and punitive streak language.
- Provide examples for activity/stress/sleep choices.
- Preserve drafts; do not force re-entry after error or session interruption.
- Do not require memory of previous technical labels.

## Motion and media

- Respect reduced motion.
- No autoplay sound.
- Demonstration media requires captions/text instructions and controllable playback.
- Motion Coach has a no-audio path and future camera mode must have a no-camera alternative.
- Timers allow pause and do not expire without understandable recovery.

## Page-specific checks

| Surface | Required checks |
|---|---|
| Guest Explore | Preview/personal distinction announced; gate returns focus/action |
| Questionnaire | Group semantics, progress, selected state, back/resume, native controls |
| Consent/safety | Full text access, no precheck, clear result and help |
| Home/nav | Landmark structure, current tab, no overlay, one H1 |
| Food/nutrition | Meal statuses in text; nutrition values have explanation |
| Motion Coach | Distance readability, large pause/stop, text instructions |
| Pattern/Weekly Action | Evidence order, expanded state, progress text |
| Gamification | Points optional; no anxiety-inducing alert or inaccessible animation |

## Proposed accessibility acceptance tests

- Complete core program creation with VoiceOver/TalkBack and keyboard-only web.
- Complete at 200% text without clipping or horizontal scroll.
- Verify all primary/secondary text and controls meet contrast.
- Verify 44×44 minimum targets and focus visibility.
- Verify bottom navigation does not obscure last item at all target devices.
- Verify error, loading, offline, partial-data, image-failure, and reduced-motion states.
- Conduct moderated tests including a teen (with appropriate consent), older adult, and users of assistive technology.

