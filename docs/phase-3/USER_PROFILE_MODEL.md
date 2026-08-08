# User Profile Model

`User` owns authentication identity and status. `Profile` holds the minimum onboarding context.

| Profile field | Purpose |
|---|---|
| `id`, `userId` | Stable internal identity and owner link |
| `fullName` | Display name |
| `dateOfBirth` | Source for current age and age group |
| `gender` | Optional agreed Phase 0 field |
| `country`, `timezone`, `preferredLanguage` | Locale context |
| `primaryRole` | Selected application context |
| `onboardingStatus`, `onboardingCompletedAt` | Server workflow state |
| timestamps | Auditability |

Age groups are calculated at read/decision time: under 12, Teen 12–17, Young Adult 18–25, Adult Balance 26–59, Healthy Aging 60–75, and over 75. Under-12 users cannot create an independent program profile; over-75 users receive an MVP-scope message and cannot complete independent onboarding.

`DependentProfile` is retained as a foundation entity. Phase 3 does not collect a full dependent health profile or perform Family Growth analysis.

Data minimization decisions: no permanent age, calculated nutrition need, diagnosis, raw provider token, or Phase 4 pattern output is stored in `Profile`.
