# Frontend Architecture

## User app

- Expo SDK 57, React Native 0.86, TypeScript 6, Expo Router, React Native Web.
- Route groups: `(public)`, `(auth)`, `(onboarding)`, `(app)`, `(family)`, `(settings)`.
- `AuthProvider` restores and subscribes to Supabase/mock sessions.
- `RouteGuard` resolves unauthenticated, onboarding-incomplete, and authenticated states.
- `services/auth.ts` implements a replaceable `AuthService`; mock data remains separated behind `EXPO_PUBLIC_USE_MOCK_DATA`.
- `useResponsiveLayout()` maps viewport width to mobile/tablet/desktop/wide using shared tokens.
- Server communication goes through `@sarira/api-client`; screens never query PostgreSQL.

Local state remains the default. No heavy global store was introduced: auth and Phase 1 prototype context are the only shared providers. Server-state caching is deferred until real feature endpoints need it.

## Admin web

- Next.js 16 App Router with Server Components by default.
- Supabase SSR stores sessions in cookies and refreshes them through `proxy.ts`.
- Proxy performs optimistic authentication/role routing; API authorization remains authoritative.
- Initial pages: login, dashboard, access denied, profile.

## UI states

Shared UI now includes Loading, EmptyState, ErrorState (including offline), Toast, Modal, BottomSheet, Checkbox, Radio, Toggle, TextInput, NumberInput, and SearchInput. All preserve Phase 1 touch target and focus conventions.

## Mock-to-real transition

`EXPO_PUBLIC_USE_MOCK_DATA=true` keeps 60 Phase 1 screens useful for visual regression. Setting it to `false` switches auth to Supabase. Feature mocks remain isolated under `apps/user-app/mocks` until their real Phase 3 services exist.
