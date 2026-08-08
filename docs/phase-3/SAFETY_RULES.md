# Deterministic Safety Rules

Rule version: `phase3-dev-v1`. Evaluation is a pure function in `@sarira/expert-system`; no AI/LLM, network call, or UI branch decides safety.

| Rule | Condition | Result | Restriction | Referral |
|---|---|---|---|---|
| `SAFETY-CORE-001` | `professional_restriction = YES` | RED | Guided Meal, Flex Kitchen | yes |
| `SAFETY-CORE-002` | `concerning_change = YES` | YELLOW | none | no |
| `SAFETY-UNKNOWN-001` | `risk_information = NOT_SURE` | YELLOW | none | no |

No matching rule produces GREEN with a limited-data message. A missing required answer produces internal `UNKNOWN` and prevents session completion. Multiple matches use severity order; any RED wins, restrictions are deduplicated, and every triggered rule is persisted.

Each configuration carries rule ID, version, applicable age 12–75, explicit condition, severity, result, restricted programs, message key, referral flag, and development content status. The seeded database mirrors these definitions so admin can inspect active versions.

These rules test routing mechanics, not clinical validity. Safety, clinical, nutrition, and legal reviewers must approve questions, triggers, wording, and program restrictions before production activation.
