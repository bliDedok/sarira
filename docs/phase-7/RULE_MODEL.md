# Rule Model

Rule definition berisi `ruleId`, `version`, domain, description, required features, satu typed condition (`LT|LTE|GT|GTE`), contribution, strength category, minimum evidence, exclusions, candidate action codes, eligible age packs, active flag, dan expert-validation flag.

Rule evaluation menyimpan rule definition reference, matched, contribution aktual, observed values, reason codes, evidence refs, dan limitations. Contribution adalah nol bila condition tidak match, evidence tidak cukup, pack tidak sesuai, atau safety exclusion aktif.

Rule IDs aktif: `PAT-PORTION-001/002`, `PAT-SUGAR-001/002`, `PAT-SLEEP-001/002`, `PAT-ACTIVITY-001/002`, `PAT-CONTEXT-001/002`, dan `PAT-BALANCE-001/002/003`. Versi seluruhnya `pattern-rules-dev-v1`.

Constraint `(decisionRecordId, ruleId, ruleVersion)` mencegah duplikasi. Definition tidak dihapus ketika sudah direferensikan evaluation. Threshold dan kontribusi adalah kebijakan development, bukan batas klinis.
