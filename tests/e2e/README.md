# E2E foundation

Automate these journeys after staging credentials exist:

1. Unauthenticated `/home` redirects to `/login`.
2. Register creates Supabase identity and incomplete-onboarding session.
3. Login restores a session across reload and opens `/home`.
4. Logout clears session and returns to `/login`.
5. Reset password returns neutral copy for known/unknown email.
6. Profile PATCH survives reload and appears through API.
7. Consent grant/revoke creates distinct versioned records.
8. USER is denied admin; ADMIN opens dashboard; API repeats the role check.
9. Network loss displays offline/retry state without converting missing data to zero.
10. Mobile/tablet/desktop have no horizontal overflow and retain keyboard focus.

Do not automate real email delivery, health recommendations, AI, nutrition, wearable, or safety-rule outcomes in Phase 2.
