# Nutrition Targets

## Target snapshot

`NutritionTargetProfile` is tied to `profileId` and a specific `NutritionPolicy`. It records policy version, goal, age group, effective period, target values, input context, calculation reason, safety status, restriction reasons, expert-validation flag, and calculation timestamp.

Older open targets are closed when a replacement is saved. Reads select the newest target effective for the requested local date.

## Target types

- `MINIMUM`: below minimum or minimum met.
- `RANGE`: below, within, or above a minimum–maximum interval.
- `UPPER_LIMIT`: within, near, or over a maximum. “Near” begins at 80% of the configured limit.

An unavailable intake produces `UNAVAILABLE`, not a misleading safe/unsafe state. A missing target produces `TARGET_UNAVAILABLE` display metadata.

## Automatic freshness check

`GET /nutrition/targets/current` compares the stored goal, safety status, age group, policy code, and policy version with current profile context. A mismatch writes a new target with reason `PROFILE_SAFETY_GOAL_OR_POLICY_CHANGED`.

## Restrictions

Teen never receives an adult target. Healthy Aging never receives automatic deficit/surplus adjustment. Safety RED receives no numeric target. All development targets disclose that expert validation remains required.

## Audit events

Explicit target recalculation records `NUTRITION_TARGET_CALCULATED` with policy version, safety status, and restricted state. Target snapshots contain no free-form health notes or secrets.

