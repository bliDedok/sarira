# SARIRA — Nutrition and Weight Balance Requirements

**Status:** Phase 0 product baseline; target/formula values pending expert approval

## Tujuan

Mendukung Weight Balance, Guided Meal, dan Flex Kitchen dengan kalkulasi nutrisi deterministik, aman, sesuai konteks, serta berbahasa netral.

## Aktor

Pengguna 12–75 yang eligible, wali/pengasuh/pendamping sesuai permission, reviewer ahli gizi, dan admin non-klinis.

## Prasyarat

Usia/peran/goal, safety dan eligibility, alergi/pantangan, consent, serta dataset/formula/rule aktif. Target personalized hanya muncul bila input minimum tersedia.

## Ruang Lingkup

### Weight Balance

- Menurunkan berat secara sehat.
- Menaikkan berat secara sehat.
- Mempertahankan berat.
- Membangun kebiasaan sehat tanpa target berat.

Sistem harus menerima bahwa perubahan berat bukan outcome yang aman/relevan untuk setiap pengguna; safety rule dapat mengalihkan ke kebiasaan atau referral.

Untuk usia 12–17, tujuan terkait berat memakai Teen Growth + Nutrition Recommendation rules dengan consent/safeguard remaja. Untuk usia 60–75, tujuan tersebut memakai Healthy Aging + Nutrition Recommendation rules agar fungsi, kekuatan, dan keselamatan tidak dikalahkan oleh target berat.

### Guided Meal

Filter hard safety → kebutuhan/goal → preferensi/anggaran/waktu/bahan/alat → kandidat resep approved → ranking → menu → swap setara → log konsumsi aktual. Ranking tidak boleh meloloskan alergi/pantangan atau mengoptimalkan engagement di atas safety.

### Flex Kitchen

Bahan + kuantitas edible portion + unit + metode masak/yield → allergen/pantangan → nutrient lookup → total resep → jumlah/berat porsi → per-porsi → indikator → alternatif → simpan/log. Unknown data tetap unknown.

## Nutrition Indicator Classification

| Indikator | Klasifikasi default produk | Tampilan | Catatan validasi |
|---|---|---|---|
| Energi | Target range | posisi terhadap rentang | Formula, goal, adjustment rate, kontraindikasi |
| Protein | Target minimum atau range sesuai pack | tercapai/belum + rentang bila ada | Usia, fungsi, kondisi; jangan pakai satu nilai universal |
| Karbohidrat | Target range | posisi terhadap rentang | Distribusi/definition perlu reviewer |
| Lemak total | Target range | posisi terhadap rentang | Konteks energi dan usia |
| Serat | Target minimum | progres ke minimum | Age/sex/context |
| Cairan | Target range | progres + caution | Tidak untuk kondisi yang perlu pembatasan tanpa clinical input |
| Gula | Batas maksimum | sisa batas, bukan “jatah” | Definisi free/added/total sugar harus dikunci |
| Natrium | Batas maksimum | sisa batas | Konversi sodium/salt dan dataset |
| Lemak jenuh | Batas maksimum | sisa batas | Basis energi/formula |
| Keragaman makanan | Target minimum berbasis scoring rule | kelompok tercatat/target | Skor berbeda kelompok usia/program |

Satu indikator dapat memiliki guard tambahan, tetapi UI harus jelas apakah nilai adalah minimum, range, atau maximum. Tidak boleh memakai satu progress bar yang menyiratkan “lebih banyak selalu lebih baik”.

## Business Rules

- NUTR-BR-001: AI tidak menghitung atau menebak nutrisi.
- NUTR-BR-002: Setiap hasil menyimpan food dataset, formula, target rule, unit conversion, dan recipe version.
- NUTR-BR-003: Alergen/pantangan adalah hard filter; unknown allergen status memicu warning/blocked behavior menurut rule.
- NUTR-BR-004: Menu swap memenuhi equivalence dimensions yang disetujui (mis. energy/protein/food group/portion), plus safety/preference/budget.
- NUTR-BR-005: Log planned meal dan consumed meal dibedakan.
- NUTR-BR-006: Perubahan jumlah porsi/yield menghitung ulang, bukan sekadar membagi label lama.
- NUTR-BR-007: Pengguna dapat memperbaiki bahan/kuantitas dan melihat indikator diperbarui.
- NUTR-BR-008: Bahasa “lebih/kurang dari target” menggantikan “baik/buruk/gagal/cheat”.
- NUTR-BR-009: [Permenkes No. 28 Tahun 2019 tentang AKG](https://peraturan.bpk.go.id/Details/138621/Permenkes-No-28-%20Tahun-2019) dan pedoman Indonesia terbaru adalah kandidat sumber utama, tetapi penggunaan individual dan versi aktif wajib ditinjau ahli.

## Safety Rules

- Target ekstrem, red flag, kondisi yang memerlukan diet terapeutik, atau pola makan berisiko dapat membatasi/menolak program dan memicu referral.
- Remaja tidak diberi target restriktif tanpa rule khusus dan governance.
- Lansia tidak didorong ke defisit yang dapat membahayakan fungsi/massa otot.
- Alergi tidak dapat di-override oleh preference/ranking/AI.
- SARIRA tidak memberi dosis suplemen atau meal plan terapeutik untuk penyakit.

## Data yang Diperlukan

Usia/date-of-birth, goal, program, anthropometry yang benar-benar dibutuhkan formula, activity context, alergi/pantangan, preferences, budget band, cooking time/equipment, ingredient IDs, quantities/units, edible/cooked yield, serving count/weight, food dataset provenance, dan relevant exclusions. Sex/gender field semantics untuk target harus ditentukan secara sensitif dan evidence-based.

## Output Sistem

Target + tipe + nilai/satuan/periode; consumed/planned value; unknown amount; data/formula version; neutral explanation; allergen/pantangan warnings; approved substitutions; confidence/limitations; citations.

## Error States

Unknown ingredient/nutrient, ambiguous household unit, zero/invalid yield, serving count invalid, recipe expired, allergen metadata missing, incompatible target, formula unavailable, stale saved recipe, dan dataset conflict. Sistem tidak boleh menebak.

## Acceptance Criteria

- Kalkulasi benchmark dapat direproduksi sampai dataset/formula/unit.
- Mengubah porsi memperbarui total/per-porsi secara benar.
- Allergen hard-filter lulus negative tests dan tidak bisa dilewati swap.
- Setiap indikator menunjukkan tipe targetnya.
- Nilai unknown tidak dianggap nol.
- AI explanation tidak memperkenalkan angka baru.

## Risiko

Data pangan tidak lengkap, household measures tidak presisi, cooking/yield factors, conflating planned/consumed, false precision, eating-risk, cultural mismatch, dan overload indikator.

## Hal yang Perlu Divalidasi

Formula/inputs/adjustment cadence; exact target values dan bands; definition sugar; food diversity score; equivalence tolerance; dataset license; recipe review; allergen taxonomy; special conditions; serta apakah semua 10 indikator tampil serentak atau progressive disclosure.
