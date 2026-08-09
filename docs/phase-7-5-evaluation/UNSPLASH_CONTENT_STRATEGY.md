# Curated Unsplash Content Strategy

Status: evaluation and curation proposal only. No API, image request, or production asset is integrated in Phase 7.5.

## Recommendation

Use a fixed, reviewed manifest of 15–25 free-license Unsplash candidates instead of random/dynamic search. Each record should pin a photo ID/source, intended crop, alt text, attribution, fallback, and review status. Do not use Unsplash+ candidates unless SARIRA separately acquires and records the applicable license.

Unsplash’s current general license permits free commercial/non-commercial use and modification, with attribution appreciated; it prohibits selling images without significant modification and compiling images into a competing service: [Unsplash License](https://unsplash.com/license). If a future implementation uses the Unsplash API, it must use the image URLs returned by the API, keep the `ixid`, hotlink them, attribute Unsplash and the photographer, and trigger the download endpoint for download-like actions: [API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines), [Hotlinking](https://help.unsplash.com/en/articles/2511271-guideline-hotlinking-images). License and availability must be rechecked at implementation time.

## Candidate library (20)

The “photo URL” below is a stable candidate/download or CDN reference for evaluation, not the final production `src`. Final implementation must resolve and pin the approved `urls.regular`/responsive variants or host a downloaded free-license asset under the approved asset policy.

| # | Category | Photo URL | Photographer | Source page | Intended usage | Proposed alt text |
|---:|---|---|---|---|---|---|
| 1 | Explore Hero / Indonesian meal | [candidate](https://unsplash.com/photos/0x1T8JRBuc8/download?force=true) | Hardingferrent | [photo](https://unsplash.com/photos/someone-is-about-to-enjoy-a-delicious-indonesian-meal-0x1T8JRBuc8) | Explore or nutrition hero | “Sepiring gado-gado dengan sayuran, telur, saus kacang, dan kerupuk.” |
| 2 | Nutrition / Indonesian food | [candidate](https://unsplash.com/photos/5cOBjzGbJSo/download?force=true) | Inna Safa | [photo](https://unsplash.com/photos/a-white-plate-topped-with-rice-and-greens-5cOBjzGbJSo) | Meal plan card | “Nasi dengan aneka sayuran tersaji di piring putih.” |
| 3 | Recipe / Indonesian food | [candidate](https://unsplash.com/photos/Npr3EneJzbw/download?force=true) | Mufid Majnun | [photo](https://unsplash.com/photos/a-person-preparing-food-in-a-bowl-Npr3EneJzbw) | Recipe/Flex Kitchen education | “Tangan menyiapkan hidangan Indonesia berisi nasi dan sayuran.” |
| 4 | Healthy breakfast | [candidate](https://unsplash.com/photos/LoqxO-ZpNA0/download?force=true) | Haberdoedas | [photo](https://unsplash.com/photos/healthy-breakfast-bowl-with-fruit-and-granola-LoqxO-ZpNA0) | Breakfast recommendation | “Mangkuk sarapan berisi granola, stroberi, dan buah.” |
| 5 | Nutrition | [candidate](https://unsplash.com/photos/APDMfLHZiRA/download?force=true) | Kevin McCutcheon | [photo](https://unsplash.com/photos/APDMfLHZiRA) | Nutrition education card | “Bahan makanan segar sedang disiapkan di dapur.” |
| 6 | Balanced meal | [candidate](https://unsplash.com/photos/KPDbRyFOTnE/download?force=true) | Ella Olsson | [photo](https://unsplash.com/photos/KPDbRyFOTnE) | Program meal/Guided Meal | “Aneka makanan seimbang tersusun dalam beberapa mangkuk.” |
| 7 | Meal preparation | [candidate](https://unsplash.com/photos/uQs1802D0CQ/download?force=true) | Katie Smith | [photo](https://unsplash.com/photos/uQs1802D0CQ) | Meal-preparation guide | “Sayuran dan bahan masak ditata untuk persiapan makanan.” |
| 8 | Recipe | [candidate](https://unsplash.com/photos/S2Eql9vHN3o/download?force=true) | Or Hakim | [photo](https://unsplash.com/photos/S2Eql9vHN3o) | Recipe detail | “Proses menyiapkan makanan sehat di atas meja dapur.” |
| 9 | Flex Kitchen | [candidate](https://unsplash.com/photos/yWG-ndhxvqY/download?force=true) | Alyson McPhee | [photo](https://unsplash.com/photos/yWG-ndhxvqY) | Ingredient-selection hero | “Aneka bahan segar disiapkan untuk memasak di rumah.” |
| 10 | Healthy Habit | [candidate](https://unsplash.com/photos/EzH46XCDQRY/download?force=true) | Maarten van den Heuvel | [photo](https://unsplash.com/photos/EzH46XCDQRY) | Healthy cooking program | “Seseorang menyiapkan bahan makanan di dapur rumah.” |
| 11 | Meal | [candidate](https://unsplash.com/photos/GaLWM8dX73U/download?force=true) | Gaelle Marcel | [photo](https://unsplash.com/photos/GaLWM8dX73U) | Meal card/education | “Makanan dan bahan segar tersaji di meja makan.” |
| 12 | Sleep | [candidate](https://unsplash.com/photos/-R2uNyGmeM4/download?force=true) | Priscilla Du Preez | [photo](https://unsplash.com/photos/-R2uNyGmeM4) | Sleep program card | “Tempat tidur rapi dengan cahaya pagi yang lembut.” |
| 13 | Sleep wellness | [candidate](https://unsplash.com/photos/wBuPCQiweuA/download?force=true) | bruce mars | [photo](https://unsplash.com/photos/wBuPCQiweuA) | Sleep educational content | “Seseorang bangun dan meregangkan tubuh di tempat tidur.” |
| 14 | Workout | [candidate](https://unsplash.com/photos/lrQPTQs7nQQ/download?force=true) | Jonathan Borba | [photo](https://unsplash.com/photos/lrQPTQs7nQQ) | Workout library card | “Seseorang melakukan latihan tubuh di rumah.” |
| 15 | Motion Coach | [CDN candidate](https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1200&q=80) | Kelly Sikkema | [photo](https://unsplash.com/photos/IZOAOjvwhaM) | Motion Coach introduction | “Seseorang berolahraga di atas matras di dalam rumah.” |
| 16 | Mobility / workout | [candidate](https://unsplash.com/photos/t1NEMSm1rgI/download?force=true) | Dane Wetton | [photo](https://unsplash.com/photos/t1NEMSm1rgI) | Stretching/workout card | “Seseorang melakukan peregangan sebagai bagian dari latihan.” |
| 17 | Healthy Aging | [CDN candidate](https://images.unsplash.com/photo-1764173040188-8194f7738e49?auto=format&fit=crop&w=1200&q=80) | Centre for Ageing Better | [photo](https://unsplash.com/photos/4gNy9e_ybfM) | Healthy Aging program | “Sekelompok orang lanjut usia bermain bulu tangkis di dalam gedung.” |
| 18 | Healthy Aging / wellness | [CDN candidate](https://images.unsplash.com/photo-1765939945740-22d995927e56?auto=format&fit=crop&w=1200&q=80) | Hoi An Photographer | [photo](https://unsplash.com/photos/2RXJ-VuJ7Bk) | Program/Explore card | “Pasangan lanjut usia berjalan berpegangan tangan di taman.” |
| 19 | Family wellness | [CDN candidate](https://images.unsplash.com/photo-1683621284476-549af8467c8d?auto=format&fit=crop&w=1200&q=80) | Sweet Life | [photo](https://unsplash.com/photos/Rtij1ic7Nrc) | Family cooking benefit | “Sekelompok orang menyiapkan makanan bersama di dapur.” |
| 20 | Growth Support | [candidate](https://unsplash.com/photos/yjG68tEvtu8/download?force=true) | Fajar Herlambang STUDIO | [photo](https://unsplash.com/photos/young-people-cooking-and-steaming-food-in-a-kitchen-yjG68tEvtu8) | Growth-support healthy skills | “Sekelompok remaja belajar menyiapkan makanan bersama.” |

Candidates 1–20 require final visual, release/trademark, crop, license, and availability review. Do not assume that an identifiable person endorses SARIRA. Avoid images with visible brands or sensitive contextual implications; consult [Unsplash guidance on identifiable people/brands](https://help.unsplash.com/en/articles/2646379-what-if-there-s-a-brand-or-identifiable-person-depicted-in-an-image-that-i-download).

## Image placement rules

### Use

- Explore hero and public feature previews.
- Program cards and education.
- Guided Meal, meal, and recipe recognition.
- Workout/Motion Coach demonstration context.
- Sleep, healthy aging, growth-support, and lifestyle education.

### Do not use

- Questionnaire, consent, safety warning, settings, Pattern Map, data table, technical nutrition indicator, form validation, empty/error state.
- Before/after comparison or any claim that a photographed body represents an outcome.

## Ratios and crops

| Surface | Ratio | Crop rule |
|---|---|---|
| Explore hero | 16:9 or 4:3 | Preserve faces/hands/food; mobile focal point stored |
| Program | 16:9 | Consistent horizon and safe text-free area |
| Meal/recipe/workout | 4:3 | Subject centered; no critical content at edge |
| Compact recommendation | 1:1 | Prefer object/meal over tightly cropped faces |

Use `object-fit: cover`, stored focal point, responsive `srcset`/sizes, lazy loading below the fold, explicit width/height/aspect ratio, and compression appropriate to device DPR. Avoid text directly on busy photos; use a separate surface or tested overlay.

## Fallback and performance

- Stable neutral SARIRA placeholder: warm neutral/soft mint gradient plus category icon.
- Preserve aspect ratio during loading/error to avoid layout shift.
- Retry only once; never show a broken-image icon.
- Preload only the true above-the-fold hero.
- Maintain a manifest status: proposed, approved, replaced, unavailable.
- Cache responsibly while respecting the chosen licensing/delivery method.

## Inclusion and safety curation

- Body-neutral, realistic movement and meals.
- Represent teens, adults, older adults, different bodies, and varied daily contexts.
- Avoid extreme bodybuilding, extreme thinness, body shame, graphic medical content, and unrealistic “perfect” meals.
- Prefer Indonesian/regional meal relevance where quality/licensing allow it.
- Alt text describes the image, not an inferred health status, age diagnosis, or emotion.

## Governance checklist

1. Confirm the item is under the free Unsplash License, not Unsplash+.
2. Record photo ID, photographer, source page, retrieval/review date, usage, crop, and alt.
3. Check visible logos, trademarks, identifiable people, and contextual suitability.
4. Recheck availability/license before release.
5. Show attribution in an in-app “Kredit foto” page even when not strictly required by the general license.
6. If using the API later, use compliant hotlinked URLs and attribution; do not hide an access key in the client.

