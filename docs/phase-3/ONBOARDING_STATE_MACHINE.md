# Onboarding State Machine

`OnboardingProgress` is the resumable server state; `Profile.onboardingStatus` is the user-level status. `currentStep`, `lastCompletedStep`, `stateVersion`, and timestamps are persisted.

| Status | UI step | Next decision |
|---|---|---|
| `ROLE_PENDING` | `role-selection` | role → DOB |
| `BIRTH_DATE_PENDING` | `birth-date` | Teen → guardian; supported adult → consent |
| `GUARDIAN_CONSENT_PENDING` | `guardian-consent` | grant → consent |
| `PRIVACY_CONSENT_PENDING` | `privacy-consent` | required active → safety |
| `SAFETY_SCREENING_PENDING` | `safety-screening` | completed result → goal |
| `GOAL_PENDING` | `goal-selection` | valid goal → questionnaire |
| `QUESTIONNAIRE_PENDING` | `profile-questionnaire` | complete → program |
| `PROGRAM_PREFERENCE_PENDING` | `program-preference` | selection/valid restricted skip → review |
| `REVIEW_PENDING` | `review` | server validation → complete |
| `COMPLETED` | home | simulated Starter Journey |

Registration creates progress and records `ONBOARDING_STARTED`. `PATCH /onboarding/status` can touch only the step required by the current server status; it cannot skip prerequisites. Login and startup return the persisted current step. Required/guardian consent revocation moves the state backwards. Final completion is idempotent and validates the full aggregate before setting `COMPLETED`.

`ACCOUNT_CREATED` and `ROLE_COMPLETED` remain available enum states for compatibility/transition history; normal Phase 3 registration initializes actionable state at `ROLE_PENDING`.
