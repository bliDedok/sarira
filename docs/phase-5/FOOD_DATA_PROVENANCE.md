# Food Data Provenance

## Required metadata

Every food points to a versioned `FoodDataSource`. Every nutrient value also records `sourceId` and `sourceVersion`. The Phase 5 development source is:

- name: `SARIRA Phase 5 Synthetic Nutrition Fixtures`;
- version: `phase5-synthetic-v1`;
- source type: `SYNTHETIC_TEST_DATA`;
- license: `INTERNAL-DEVELOPMENT-ONLY`;
- label: `SYNTHETIC TEST DATA — NOT FOR NUTRITION RECOMMENDATION`.

## Traceability path

The source can be traced from a food search result to its nutrients and serving. When an item is added, its source version and calculated values are copied into a `NutritionSnapshot`. Daily responses return the distinct item source versions used.

## Historical stability

Daily history aggregates saved snapshots, not current food-master rows. Editing a master food in a future version must not mutate an already logged meal. Updating an item's portion creates an updated snapshot using the currently selected version and records an audit event.

## Production import requirement

A production source requires documented publisher authority, license, release/version, import date, transformation rules, verification workflow, and reconciliation strategy. It must use a new immutable source version. The synthetic source must never be renamed to appear authoritative.

## No inferred provenance

Values without an attributable source are unavailable. The system does not invent nutrient values, infer allergen absence, or convert an unknown value to zero.

