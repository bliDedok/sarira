# Test Scenarios

## Automated coverage

Unit tests cover age calculation/boundaries, age classification, guardian requirement, required consent/completion, deterministic safety including uncertainty, goal/program eligibility, conditional questions, shared validation, route authorization, and environment fail-closed behavior.

The PostgreSQL integration test exercises registration → profile/role → consent → safety session/answers/result → goal → questionnaire/answers → program preference → summary/completion against the real Prisma repository.

## E2E acceptance A–H

| Scenario | Expected | Result |
|---|---|---|
| A · adult 30 | GREEN, maintain weight, complete | PASS |
| B · teen 15, no guardian | completion blocked | PASS |
| C · teen 15, valid guardian | Growth Path goal available | PASS |
| D · age 65 | Healthy Aging/mobility prioritized | PASS |
| E · RED | programs blocked and referral payload | PASS |
| F · revoke required consent | state returns to consent | PASS |
| G · exit during questionnaire | login resumes session/answers | PASS |
| H · autosave API failure | local answer retained, retry succeeds | PASS |

Latest local result: user UI 9/9 tests; API in-memory suite 19 passed with database suite skipped by default; API with `DATABASE_URL` 20/20 passed. Lint, all TypeScript checks, and production builds passed.

Provider-level Supabase email/reset delivery still requires a credentialed staging acceptance run. Native verification in this environment covers successful iOS/Android bundling, not physical-device interaction.
