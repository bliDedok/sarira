# Energy Policy

## Development-only configuration

Energy targets are configuration fixtures for product testing, not clinical prescriptions.

| Policy | Age | Energy range | Goal adjustment |
|---|---:|---:|---:|
| `TEEN_GENERAL` | 12–17 | 1800–2200 kcal | none |
| `YOUNG_ADULT_GENERAL` | 18–25 | 1800–2200 kcal | up to ±150 kcal |
| `ADULT_GENERAL` | 26–59 | 1750–2150 kcal | up to ±150 kcal |
| `HEALTHY_AGING_GENERAL` | 60–75 | 1700–2100 kcal | none |

The adjustment value is stored in each policy's versioned target configuration. It is applied only for eligible `LOSE_WEIGHT` or `GAIN_WEIGHT` goals when safety is GREEN and age group is Young Adult or Adult Balance. Loss adjustments retain a 1500 kcal minimum floor; gain adjustments retain a 1700 kcal maximum-floor baseline in this development configuration.

## Deliberate exclusions

Phase 5 does not use an adult BMR/TDEE formula for teens, older adults, pregnancy/breastfeeding, or profiles with missing required context. It does not use activity multipliers or weight-change thresholds without validated, versioned rules.

## Safety-first fallback

Yellow results restrict the target to general guidance. Red results remove numeric targets. Healthy Aging is marked `HEALTHY_AGING_NO_AUTOMATIC_DEFICIT`, and teen is marked `TEEN_GENERAL_POLICY_NO_ADULT_FORMULA`.

## Validation requirement

The numerical ranges, floors, goal adjustment, and upper-limit choices require product, nutrition-expert, legal, and locale review before production activation.

