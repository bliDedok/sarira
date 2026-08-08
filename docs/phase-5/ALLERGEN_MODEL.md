# Allergen Model

## Foundation

`FoodAllergen` supports `MILK`, `EGG`, `FISH`, `SHELLFISH`, `PEANUT`, `TREE_NUT`, `SOY`, `WHEAT`, `SESAME`, and `OTHER`. Each row stores verification state and an optional source note.

`FoodDietaryTag` supports `VEGETARIAN`, `VEGAN`, `HALAL_VERIFIED`, `PORK`, `ALCOHOL`, and `OTHER`, with `VERIFIED` or `UNKNOWN` status.

## Warning behavior

Preview compares food allergen codes with normalized allergen text from the active profile questionnaire. A match produces a visible danger notice before saving. Non-matching but present metadata remains visible. A food with no allergen rows produces “Informasi alergen belum lengkap”; absence of rows is never treated as allergen-free.

Warnings are saved on the meal item for audit and history. They are advisory safety signals, not diagnosis, medical clearance, or a guarantee against cross-contact.

## Verification

All synthetic fixtures are unverified. A future production workflow must validate source, ingredient scope, cross-contact semantics, localization, and update procedures before setting `verified = true`.

## Ownership and privacy

Profile allergen text is accessed only while processing that profile's authenticated request. It is not copied into source master data, logs, or target snapshots.
