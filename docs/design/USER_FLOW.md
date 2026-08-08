# User Flow — Clickable Prototype

UI route browser tersedia di `/flows`. Setiap node membuka route yang dapat diklik.

## Flow 1 — Pengguna Dewasa

`/` → `/onboarding` → `/welcome` → `/auth/register` → `/setup/role-selection` → `/setup/birth-date` → `/setup/privacy-consent` → `/setup/safety-screening` → `/setup/safety-green` → `/setup/goal-selection` → `/setup/profile-questionnaire` → `/setup/food-preferences` → `/setup/allergies` → `/setup/food-mode` → `/setup/profile-summary` → `/setup/starter-journey` → `/home?day=1`.

## Flow 2 — Remaja

Registration → birth date → guardian consent + teen assent → privacy → teen safety → goal → Growth Path → Starter Journey. Tanpa dua receipt aktif, baseline dan rekomendasi personal tetap terkunci.

## Flow 3 — Orang Tua

Login → role selection → child profile → Family Growth → referral bila diperlukan. Single measurement/photo/questionnaire tidak menghasilkan diagnosis stunting.

## Flow 4 — Baseline

Home Day 1 → Daily Check-in → Early Pattern H7/insufficient → koreksi data → Pattern Map H14/insufficient/restricted → konfirmasi → satu Weekly Action.

## Flow 5 — Guided Meal

Food Dashboard → Guided Meal → Recipe Detail → swap setara → Cooking Mode → consumed log → Nutrition Indicator. Tidak ada checkout/order/payment/delivery.

## Flow 6 — Flex Kitchen

Flex Kitchen → Recipe Builder → ingredient/weight/serving/method → real-time demo calculation → Adjustment Suggestion → save personal recipe.

## Flow 7 — Digestive Support

Digestive log → time/intensity → link to meal event → immediate safety check → temporal pattern/insufficient → education → referral on red flag.

## Global Guards

- age/role/consent/safety/eligibility dievaluasi sebelum recommendation;
- red mengalahkan program/action/engagement;
- unknown bukan hijau;
- permission denied memiliki manual fallback;
- corrections memicu evaluasi ulang dengan histori immutable;
- AI/RAG unavailable tidak menghilangkan rule result/referral;
- semua prototype screen memiliki back/exit/resume path yang aman.
