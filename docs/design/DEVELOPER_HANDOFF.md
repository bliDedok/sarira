# Developer Handoff

## Architecture

```text
apps/prototype/
├── app/                 # Expo Router routes
├── components/          # layout helpers + component tests
├── features/prototype/  # local state + reusable screen renderer
├── layouts/             # responsive AppShell
├── mocks/               # screen registry, flow, nutrition, recipes, profiles
├── utils/               # route helpers
└── types/               # reserved for app-local contracts
packages/
├── design-tokens/       # token source of truth
├── ui/                  # reusable React Native primitives
└── shared-types/        # cross-package contracts
```

## Stack

- Expo SDK 57, React Native 0.86, React 19.2, TypeScript 5.9.
- Expo Router file-based navigation.
- React Native Web + Metro static export.
- Inter bundled with Expo Font.
- Lucide React Native + React Native SVG.
- Jest 29 + Testing Library for component and inventory tests.

## Commands

```bash
pnpm install
pnpm web
pnpm ios
pnpm android
pnpm lint
pnpm typecheck
pnpm test
pnpm check
```

Web export: `pnpm --dir apps/prototype export:web`.

## Data Flow

`PrototypeProvider` owns local in-memory active profile, elder/reduced-motion toggles, task completion, dan Weekly Action progress. Tidak ada persistence atau network request.

Screen registry in `mocks/prototypeScreens.ts` is the source of truth for 60 screens. Dynamic navigation must use `screenHref(slug)` because Expo Router needs an explicit `/prototype/[slug]` parameter object; do not rename it to reserved `screen`.

## Safety Contracts for Future Implementation

1. Never place AI/RAG in age, consent, safety, eligibility, sufficiency, pattern, priority, action, nutrition calculation, or referral decisions.
2. Implement deterministic versioned rule payloads before connecting explanation.
3. `red > yellow > green`; missing required safety data returns `unknown`.
4. Minor profile requires active guardian consent + teen assent receipts.
5. Nutrition needs versioned dataset/formula/target type and hard allergen filter.
6. Wearable must preserve provenance and distinguish missing/denied/unavailable/delayed/zero.
7. Referral must render completely without AI/RAG and use a reviewed registry.
8. Do not add commerce vocabulary/actions to food.

## Mock Boundaries

- Auth buttons navigate locally only.
- Safety results are UX states, not clinical rule output.
- Nutrition targets/values/formula are illustrative.
- Recipe cost/time/nutrition and equivalence are illustrative.
- AI/citations are deterministic placeholder copy and metadata.
- Camera/scan/Motion Coach/wearable are non-integrated.
- Referral has no real trigger, urgency, number, or service registry.

## Testing Strategy

- Unit: UI action semantics, progress accessibility, safety status text.
- Registry: exactly 60 unique screens, seven valid flows, simulation flags.
- Static: lint with zero warnings and strict TypeScript.
- Build: Expo web static export.
- Manual browser: 393×852, 834×1112, 1440×1000; route clicks and keyboard focus.

## Productionization Checklist

- Resolve OD-001 through OD-020 owners and approvals.
- Choose first feature-gated release slice.
- Approve rule schemas, fixtures, formula/data licenses, and service registry.
- Create consent/privacy/security architecture and threat model.
- Replace local state with secure, least-privilege storage/services.
- Add error boundaries, offline policy, deletion/export workflows, monitoring, audit, rollback, and incident playbooks.
- Run native screen-reader, dynamic type, localization, device, timezone, and network matrices.
