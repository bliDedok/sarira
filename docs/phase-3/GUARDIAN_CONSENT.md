# Guardian Consent

Profiles aged 12–17 require a granted `GuardianConsent` before safety screening or onboarding completion. Other supported age groups skip this step.

The minimum record contains minor profile reference, guardian name, relationship (`PARENT` or `LEGAL_GUARDIAN`), status, consent version, source, granted/revoked timestamps, and audit timestamps. It intentionally does not collect guardian health data.

Flow:

1. DOB classification returns `TEEN` and advances progress to `GUARDIAN_CONSENT_PENDING`.
2. The user sees a transparent explanation and supplies the minimum guardian record.
3. Grant records `GUARDIAN_CONSENT_GRANTED` and continues to privacy consent.
4. Revoke records `GUARDIAN_CONSENT_REVOKED` and returns progress to the guardian step.
5. Safety creation and final completion independently recheck the current grant.

This implementation is auditable MVP behavior only. It does not assert legal sufficiency, verify guardian identity, or satisfy every jurisdiction automatically. Legal review is a production release gate.
