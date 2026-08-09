# Privacy Impact Assessment — UX Proposal

## Summary

Guest-first discovery can reduce unnecessary data collection, while replacing full date of birth with declared age improves data minimization. However, age affects teen/guardian and eligibility policy, so the change cannot be a front-end-only substitution. Do not fabricate a birth date from age.

## Data-minimization decisions

- Public Explore requires no health profile.
- Guest state stores only allow-listed navigation/preview intent.
- Age is requested instead of full DOB in the proposed UX.
- Progressive questions are asked when they enable a visible feature, not preemptively.
- Full health/safety/allergy answers are collected only in an authenticated, explained context.
- Photos/camera are not required for Motion Coach MVP.

## Age replacing DOB

### Current dependency

Current flows calculate age and `AgeGroup` from `dateOfBirth`; onboarding completion, safety, goal, baseline, and validation pathways depend directly or indirectly on that result. Nutrition and Phase 7 commonly consume age group, while teen flow requires guardian consent.

### Recommended data plan (future approval required)

- Add `declaredAgeYears` constrained to 12–75.
- Add `ageDeclaredAt` or `ageLastConfirmedAt` so age does not remain stale.
- Use a central age-context resolver that returns effective age and AgeGroup for existing engines.
- Reconfirm annually and at policy boundaries such as 17→18 and 75→out-of-range.
- Retain full DOB only when a separately documented legal/clinical/product requirement exists and the user understands the reason.
- Do not generate a sentinel/synthetic date (e.g., January 1 of a derived year); it creates false precision and future age errors.

This is a **SCHEMA CHANGE + MIGRATION REQUIRED** if approved.

## Teen and guardian impact

- Age 12–17 triggers the existing guardian path and age-appropriate policy.
- Record guardian consent with its own timestamps/version/history; do not infer it from account ownership alone.
- On transition to 18, retain the historical record for audit but stop requiring active guardian consent after policy re-evaluation.
- Re-run relevant safety/eligibility/target context at the boundary.
- Do not expose teen personal data in a guest session.

## Guest data boundary

Allowed local values:

- last public route;
- preview category/filter;
- intended personal action;
- non-sensitive display preference.

Prohibited before authenticated/contextual consent:

- age, weight, height, target;
- medical/safety/allergy answers;
- food, sleep, digestive, activity, measurement logs;
- camera frames or biometric/pose-derived data;
- free text that may contain health data.

Guest intent should expire, be cleared on cancel/conversion, and never be mixed into another signed-in account without explicit confirmation.

## Sensitive UI practices

- Explain why each sensitive field is needed.
- Show preview data as fictional/example.
- Avoid health data in push notification bodies and lock-screen previews by default.
- Hide internal safety/policy identifiers from user-facing pages while retaining authorized audit access.
- Provide consent history and data controls in Profile/Privacy.
- Avoid analytics payloads containing raw health answers, measurement values, recipe notes, or camera data.

## Unsplash/photo privacy

Content photos are editorial assets, not user data. Avoid implying photographed people use or endorse SARIRA. Check license, identifiable-person context, and trademarks. Attribution links should not include personal user state.

## Motion Coach future privacy

Future camera use requires a separate DPIA/security review, just-in-time permission, explicit purpose, preferably on-device processing, no default recording/upload, retention/deletion controls, teen/guardian policy, and a non-camera alternative. No such processing is in current scope.

## User rights and transparency

V2 should provide:

- understandable privacy summary and full notice;
- consent history and current status;
- correction of profile/age information;
- export/delete/request paths according to approved policy;
- ability to hide optional gamification;
- clear explanation when data is insufficient or a feature is restricted.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Age becomes stale | Timestamp and scheduled/boundary reconfirmation |
| Synthetic DOB contaminates policy decisions | Explicitly prohibit synthetic dates |
| Guest intent leaks health information | Strict allow-list and short expiry |
| Soft gate feels coercive | Gate only personal actions; offer “Nanti” |
| Technical metadata leaks sensitive logic | Presentation adapter and authorized debug separation |
| Camera data becomes biometric-like sensitive data | Separate future DPIA, on-device preference, no default recording |
| Points analytics expose health behavior | Pseudonymous event telemetry, minimization, access control, retention limits |

## Required reviews before implementation

Product/legal/privacy review of the age model; safety and nutrition regression analysis; teen/guardian lifecycle; consent wording/versioning; guest analytics; camera roadmap; Unsplash licensing/identifiable-person usage; and data retention/deletion behavior.

