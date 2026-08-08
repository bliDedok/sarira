# Role Model

Supported roles are `USER`, `PARENT`, `GUARDIAN`, `CAREGIVER`, `ADMIN`, `CONTENT_REVIEWER`, `NUTRITION_REVIEWER`, and `SUPER_ADMIN`.

The onboarding picker exposes only the first four roles. `USER` represents self-use; the three supporter roles create the account-owner context and expose family-support goals, while dependent analysis remains deferred.

Authorization rules:

- User endpoints require a valid session and scope repository reads/writes to the authenticated account/profile.
- The configuration version endpoint accepts `ADMIN`, `CONTENT_REVIEWER`, or `NUTRITION_REVIEWER`; `SUPER_ADMIN` inherits all role checks.
- Administrative role assignment is never accepted from the onboarding client.
- `RoleAssignment` remains the many-to-many authority; `Profile.primaryRole` stores the selected onboarding context.

Role selection advances backend progress to date of birth and records `ROLE_SELECTED` with minimal metadata.
