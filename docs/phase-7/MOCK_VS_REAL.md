# Mock vs Real

| Area | Status | Catatan |
|---|---|---|
| Feature calculation | REAL | package pure yang sama untuk memory/Prisma |
| Rule evaluation/ranking/abstain | REAL | package expert system yang sama |
| PostgreSQL persistence | REAL | transaction, constraints, migrations |
| Pattern Map feedback | REAL | stored per owned map |
| Weekly Action/check-in/undo/history | REAL | repository-backed |
| Memory repository | MOCK INFRASTRUCTURE | kontrak dan domain engine sama; data volatile |
| Threshold/rule/action content | DEVELOPMENT | deterministic, belum clinically validated |
| AI explanation/RAG | NOT IMPLEMENTED | Phase 8, tidak disimulasikan sebagai nyata |
| Wearable/vision/growth/digestive diagnosis | OUT OF SCOPE | prototype lama tetap berlabel simulasi bila terlihat |

Guided Meal, Flex Kitchen, Nutrition Engine, Pattern Map, dan Weekly Action tidak lagi diberi badge Demo pada real screens. Fixture/reference content tetap diberi label development/synthetic. UI tidak menjalankan business rule sendiri.
