# Phase 3 Overview

**Status:** implemented and verified locally · **Rule/content version:** `phase3-dev-v1`

Phase 3 replaces the onboarding demo with persisted account, profile, role, consent, guardian consent, safety, goal, questionnaire, program preference, and resumable progress flows. Decisions follow **Rules Decide, Evidence Supports, AI Explains**; no LLM participates in safety or eligibility.

## Implemented journey

Registration/login → role → date of birth → guardian consent when 12–17 → required consent → safety screening/result → goal → versioned questionnaire → program preference → summary → server-validated completion → simulated Starter Journey.

The API is authoritative. The UI renders backend configuration, autosaves answers, shows save/retry state, and resumes from `OnboardingProgress.currentStep`. The completion endpoint rechecks every prerequisite.

## Product boundaries

- Supported independent profile age: 12–75. Age is derived from `dateOfBirth`, never stored as a permanent integer.
- Administrative roles are authorized at the API; Phase 3 provides a read-only configuration viewer rather than an editor.
- Supporter roles prepare the account-owner context. Full dependent/family analysis remains out of scope.
- Starter Journey and all health features after onboarding remain explicitly marked Demo.
- Seeded safety and questionnaire content is development-only and requires expert validation.

See [PHASE_3_FINAL_REPORT.md](./PHASE_3_FINAL_REPORT.md) for acceptance results and remaining release gates.
