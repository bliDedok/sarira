# Goal and Program Eligibility

Eligibility is calculated by backend domain functions, never by presentation code.

`getGoalEligibility` evaluates current age, age group, onboarding role, and safety status. It returns every configured goal with `eligible`, priority, and a user-facing disabled reason. Examples: `OPTIMIZE_GROWTH` is Teen-only, `MAINTAIN_MOBILITY` is prioritized at 60–75, weight-change goals are adult self-use only, and RED blocks goals that depend on independent programs.

Supporter roles receive `FAMILY_NUTRITION` and `CHILD_GROWTH_SUPPORT`; descriptions explicitly state that dependent analysis is not active.

`getProgramEligibility` evaluates age group, role, safety, and selected goal and returns:

- `GUIDED_MEAL`
- `FLEX_KITCHEN`

Both are blocked for RED, outside the 12–75 MVP, or supporter-role flows whose dependent programs are not part of Phase 3. If every program is blocked, the API permits an explicit skip record so review/completion can represent the restriction without bypassing safety. Program labels are handoff preferences only; nutrition recommendations and calculations remain Demo.
