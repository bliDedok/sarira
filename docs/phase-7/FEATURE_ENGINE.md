# Feature Engine

`packages/feature-engine` adalah pure deterministic module. Ia menerima periode, timezone, 14 daily records, meal-plan consumption, personal-recipe usage, serta snapshot Nutrition Engine. Ia tidak memilih pattern atau action.

Output `phase7-feature-dev-v1` memuat `inputCompleteness`, typed feature set, `missingFeatures`, dan warning. Input diurutkan berdasarkan `localDate`; average, ratio, variance, dan circular sleep-time variance dibulatkan secara tetap. Waktu tidur dihitung dengan timezone profil, sehingga hasil tidak bergantung timezone mesin server.

`null` berarti bukti tidak tersedia; engine tidak mengubah missing menjadi nol. Setiap feature membawa availability, available/total days, coverage ratio, source types, dan concrete evidence references. Hasil identik untuk input dan versi identik.

Feature Snapshot disimpan melalui repository, bukan dari engine. SHA-256 `inputSignature` mengikat input nyata dan versi; constraint database membuat generate ulang idempotent. Snapshot yang sudah direferensikan Decision Record tidak diubah.
