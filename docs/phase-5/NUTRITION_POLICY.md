# Nutrition Policy

## Versioned policy rows

`NutritionPolicy` stores code, version, age bounds, optional sex, applicable goals and safety states, effective dates, status, JSON target configuration, source metadata, and `requiresExpertValidation`.

The active development policies are:

- `TEEN_GENERAL`, ages 12–17;
- `YOUNG_ADULT_GENERAL`, ages 18–25;
- `ADULT_GENERAL`, ages 26–59;
- `HEALTHY_AGING_GENERAL`, ages 60–75.

All use version `phase5-dev-v1` and require expert validation.

## Selection

The service calculates age from date of birth through the existing profile domain, then selects an active policy whose inclusive age range and optional sex match. Missing age context or no matching policy produces `TARGET_UNAVAILABLE` or `POLICY_NOT_AVAILABLE`; it never falls back to an adult policy.

## Recalculation

The current target remains stable until relevant context changes. A new target is saved when there is no target or when goal, safety status, age group, policy code, or policy version differs. Explicit recalculation is also available. The calculation reason is stored.

Weight/activity thresholds are not activated because the development policy does not yet define validated thresholds. A future policy must add explicit, versioned thresholds before those inputs affect a target.

## Safety behavior

- `GREEN`: general target may be produced; bounded adult goal adjustment is allowed for eligible adult groups.
- `YELLOW`: general target remains restricted and is labeled `SAFETY_YELLOW_GENERAL_TARGET_ONLY`.
- `RED`: target numbers are empty and `SAFETY_RED_PROFESSIONAL_REVIEW_REQUIRED` is stored.

Teen and Healthy Aging policies also add explicit restriction reason codes.

