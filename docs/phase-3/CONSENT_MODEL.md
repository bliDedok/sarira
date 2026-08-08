# Versioned Consent Model

`ConsentVersion` is the authoritative catalog; `UserConsent` is an append/update record tied to user and profile.

Each record includes type, exact version, status, grant/revoke timestamps, source, and update time. Sources are `ONBOARDING`, `SETTINGS`, `FEATURE_PROMPT`, and `GUARDIAN_FLOW`.

## Phase 3 catalog

- Required during onboarding: `TERMS_OF_SERVICE`, `PRIVACY_POLICY`, `HEALTH_PROFILE`.
- Optional/data-purpose entries: `NUTRITION_DATA`, `ACTIVITY_DATA`, `SLEEP_DATA`, `CAMERA_FOOD`, `CAMERA_WORKOUT`, `LOCATION`, `WEARABLE`, `BODY_PHOTO`, `CHILD_DATA`.

The server compares required types to their currently active version. Optional rejection does not block unrelated features. Camera, location, wearable, and body-photo permissions are not requested automatically by onboarding.

Settings displays current definitions and lets the user grant or revoke them. Revoking a required consent returns onboarding state to `PRIVACY_CONSENT_PENDING`; the dashboard guard then blocks completed-only routes until the requirement is restored and completion is revalidated.

Seed text is development content, not approved legal copy. Legal/Privacy must approve wording, version transitions, retention, deletion, and evidence requirements before production.
