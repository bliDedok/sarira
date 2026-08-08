# Entity Dictionary

| Entity | Purpose | Sensitive notes |
|---|---|---|
| User | Internal account mapped to Supabase identity | Email; no password |
| Profile | Primary health-profile identity | DOB/gender may be sensitive |
| RoleAssignment | Many roles per user | Privileged changes require audit |
| DependentProfile | Child/family/tanggung profile | Guardian authority not yet verified |
| ConsentVersion | Versioned legal copy metadata | Hash, locale, activation lifecycle |
| UserConsent | Append grant/revoke event | Never overwrite history |
| Goal | User-selected goal foundation | Not a health recommendation |
| SafetyScreeningSession | Versioned screening trace container | No evaluator implemented |
| SafetyAnswer | Answer codes tied to session | Avoid free-text sensitive values |
| SafetyResult | Status/reason-code container | Not active clinical logic |
| AppPreference | Scoped JSON preferences | Schema key allowlist needed later |
| DeviceSession | Session/device inventory | Stores only device hash |
| AuditLog | Security/privacy action trace | Minimum metadata; no payload dump |

All entities except immutable-like event intent have `createdAt` and `updatedAt`. `SafetyResult` and consent structures are foundations and do not certify rules, thresholds, or legal wording.
