# Expert Validation Required

## Current status

All Phase 5 policies carry `requiresExpertValidation = true`. The synthetic food source and unverified food/allergen metadata are for development testing only. No bundled number should be promoted as individualized medical or nutrition advice.

## Required reviews before production

### Nutrition and clinical

- nutrient source selection, transformations, units, and coverage;
- age/sex/life-stage target ranges and upper limits;
- energy floors, goal adjustments, safety restrictions, and special populations;
- missing-data propagation and user-facing interpretation;
- allergen terminology, matching, cross-contact limitations, and escalation copy.

### Product and UX

- whether incomplete-item propagation is appropriately conservative;
- status labels, accessibility, text scaling, and user comprehension;
- consent/revocation journey and dependent-profile expectations;
- separation of calculation, guidance, and recommendation.

### Legal, privacy, and security

- food-dataset license and attribution;
- health/nutrition data classification, retention, export, and deletion policies;
- jurisdiction-specific consent and guardian requirements;
- audit retention and production authorization model.

### Engineering and operations

- authoritative import pipeline, version reconciliation, and data QA;
- monitoring, incident rollback, backup/restore rehearsal, and scale tests;
- production cache policy and invalidation;
- database authorization and admin read-only tooling.

## Activation rule

A policy/source must receive a new approved version and documented reviewer sign-off before `requiresExpertValidation` can be cleared or synthetic/unverified labels can be removed. Existing historical snapshots retain their original source and calculation versions.

