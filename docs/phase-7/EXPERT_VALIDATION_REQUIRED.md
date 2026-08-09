# Expert Validation Required

Seluruh rule, scoring entry, dan Weekly Action definition Phase 7 memiliki `requiresExpertValidation=true` dan label `DEVELOPMENT RULE / NOT CLINICALLY VALIDATED`. Ini adalah working software untuk validasi alur, bukan medical device atau diagnosis.

Review ahli harus mencakup:

- threshold 13 rule dan minimum evidence 0.35;
- contribution/bobot, score 25, strength bands, dan quality bands;
- perbedaan threshold/aksi untuk Teen, Adult, dan Healthy Aging;
- safety exclusion, khususnya aktivitas dan perubahan asupan;
- wording non-stigmatizing, target 4/7, actionability ordering, dan evidence requirements;
- makna hunger/fullness scale, sleep duration/timing, mood association, serta indikator nutrition;
- consent/legal policy, guardian flow, dan escalation/referral boundaries.

Approval production perlu owner, reviewer, tanggal efektif/retire, evidence basis, change log, dan regression fixtures. Mengubah rule/policy wajib membuat versi baru; keputusan historis tidak boleh direplay diam-diam dengan versi berbeda.
