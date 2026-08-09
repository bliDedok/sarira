# Test Scenarios

| Layer | Cakupan utama |
|---|---|
| Feature unit | 25 typed features, provenance, missing/null, timezone/circular sleep, deterministic replay |
| Expert unit | six domains, rule match/no-match, domain abstain, tie-break, age/safety/goal, reproducibility, max one action |
| API unit/mock | readiness/consent gates, generate/current/history, ownership, feedback, check-in/undo, error codes |
| E2E mock | ready main path dan insufficient-data path |
| PostgreSQL | Phase 3→7 real flow, transaction, seed definitions, immutable history, idempotency, reanalysis/superseding, active-action constraints |
| UI | real route integration, empty/loading/error/partial states, mobile/tablet/desktop, keyboard/screen-reader semantics |
| Build | Expo web export, admin Next, API tsup, iOS Hermes, Android Hermes |

Critical assertions: same inputs+versions yield same snapshot/decision; data change yields new version; goal changes ranking but not observed score; safety red excludes restricted action; Day 7 cannot generate final map; insufficient domain has `null` score; retry check-in does not double-count; cross-profile IDs are rejected.
