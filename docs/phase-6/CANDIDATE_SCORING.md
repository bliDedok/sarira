# Candidate Scoring

Scoring dijalankan setelah hard filtering. Faktor soft: meal type, protein gap fit, fiber gap fit, sisa sodium/sugar/saturated-fat limit, cooking time, cost category, preference, dan data completeness.

Hasil 0–100 dipetakan ke Recipe Fit HIGH/MEDIUM/LOW. Reason codes bersifat template deterministik: `HIGH_PROTEIN_FIT`, `FIBER_SUPPORT`, `LOWER_LIMIT_FIT`, `TIME_MATCH`, `PREFERENCE_MATCH`, atau `CONSTRAINTS_MATCH`. Tie-break memakai recipe code sehingga hasil repeatable, bukan random.

Fit berarti kecocokan constraint, bukan medical confidence. Weight version `meal-planning-dev-v1` memerlukan product validation.
