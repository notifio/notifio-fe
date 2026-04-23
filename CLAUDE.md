# Notifio Frontend

Turborepo monorepo containing the public web app and mobile app for Notifio — a hyperlocal real-time notification platform.

## Repo Structure

```
apps/
  web/          Next.js 15 (App Router) — landing page + lightweight web app
  mobile/       React Native (Expo SDK 52+, Expo Router) — iOS + Android
packages/
  api-client/   Typed HTTP client used by both web and mobile
  ui/           Shared design tokens (colors, spacing, typography)
```

## Related Repos

- `notifio-api` — Express/TS backend (separate repo, deployed on Railway)
- `notifio-shared` — Published as `@notifio/shared` on GitHub Packages (types, Zod schemas, H3 utils, i18n)

## Stack

| Concern   | Web                                          | Mobile                       |
| --------- | -------------------------------------------- | ---------------------------- |
| Framework | Next.js 15 (App Router)                      | Expo SDK 52+ (managed)       |
| Routing   | App Router with `[locale]` prefix            | Expo Router (file-based)     |
| Styling   | Tailwind CSS 4                               | NativeWind (Tailwind for RN) |
| State     | Zustand                                      | Zustand                      |
| Maps      | MapLibre GL JS                               | react-native-maps            |
| i18n      | next-intl                                    | i18next + react-i18next      |
| Auth      | Supabase Auth                                | Supabase Auth                |
| Forms     | React Hook Form + Zod (from @notifio/shared) | React Hook Form + Zod        |

## Commands

```bash
# Root
npm run dev:web          # Start Next.js dev server
npm run dev:mobile       # Start Expo dev server
npm run build            # Build all packages + apps
npm run lint             # Lint everything
npm run typecheck        # Type-check everything
npm run test             # Run all tests

# Per-app (from root)
npx turbo run dev --filter=@notifio/web
npx turbo run dev --filter=@notifio/mobile
npx turbo run build --filter=@notifio/web
```

## Code Standards

### TypeScript

- Strict mode, no `any` — use `unknown` + type guards
- All API types come from `@notifio/shared` — never redefine locally
- Zod schemas from `@notifio/shared` for form validation via `zodResolver`
- Prefer `interface` for component props, `type` for unions

### React / Components

- Functional components only, named exports
- Props interface defined above component in same file
- `'use client'` directive only on components that need it (Next.js)
- Collocate component + styles + tests in same directory
- No barrel exports from component directories — import directly

### Naming

- Files: `kebab-case.tsx` (e.g., `alert-card.tsx`, `use-alerts.ts`)
- Components: `PascalCase` (e.g., `AlertCard`, `MapOverlay`)
- Hooks: `camelCase` with `use` prefix (e.g., `useAlerts`, `useLocation`)
- Constants: `SCREAMING_SNAKE_CASE`
- CSS classes: Tailwind utilities only — no custom CSS unless absolutely necessary

### Imports

- `@notifio/shared` for types, schemas, constants, H3 utils, i18n
- `@notifio/api-client` for API calls
- `@notifio/ui` for design tokens
- `@/` alias for app-local imports (e.g., `@/components/`, `@/lib/`)

### i18n

- All user-facing strings must be translated (SK + EN)
- Translation keys from `@notifio/shared/i18n/sk.json` and `en.json`
- Web: `next-intl` with `[locale]` route prefix
- Mobile: `i18next` with `expo-localization` for detection
- Never hardcode user-facing strings in components
- Web i18n merges shared messages (`@notifio/shared/i18n`) with web-local messages (`apps/web/messages/`)
- Shared namespaces: `common`, `auth`, `settings`, `pushSetup`
- Web-local namespaces: `map`, `weather`, `aqi`, `pollen`, `outages`, `traffic`, `mapFilters`, `notifications`, `notificationType`, `locationBanner`, `alerts`, `categoryGroups`, `nav`, `landing`, `membership`, `consent`, `reminders`, `sources`, `events`, `errors`

## Architecture Notes

### Location-first, not city-first

- Users are identified by H3 hex cells, not cities
- Weather, traffic, air quality available everywhere via coordinates
- City-specific sources (utilities) activate automatically when coverage exists
- No city selection UI — location permission is the only onboarding gate

### H3 Spatial

- Resolution 7 (~1.2km) for alert targeting/display
- Resolution 9 (~174m) for user positioning
- Use `@notifio/shared/h3` utilities — never call h3-js directly
- Map hexagons: use `cellToPolygon(h3Cell, true)` for GeoJSON coordinate order

### Notifications-first UX

- Mobile app is a "settings + context" shell, not a content browser
- Users primarily interact via push notifications
- App screens: alert feed, map view, preferences — that's it
- Onboarding flow: permissions are the critical path (location → notifications)

### API

- Base URL configured via env var (`NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`)
- All requests go through `@notifio/api-client` (wraps `fetch` with auth, locale, error handling)
- `@notifio/shared@^0.18.1` — types, Zod schemas, i18n (incl. nameday, payments, GDPR data-export)
- Response envelope: `{ success: boolean, data?: T, error?: string, meta?: {} }`
- Auth: Bearer token via Supabase Auth

### API Client Methods (`@notifio/api-client`)

**Public:** `getWeather`, `getWeatherWarnings`, `getTraffic`, `getTrafficFlow`, `getAirQuality`, `getOutages`

**Events:** `getEventDetail`, `voteOnEvent`, `getUserVote`, `getEvents`, `createEvent`, `updateEvent`, `deleteEvent`, `getEventCategories`, `getUserEvents`

**Devices:** `registerDevice`, `refreshDeviceToken`, `submitDeviceLocation`, `deactivateDevice`

**User (/me):** `getProfile`, `updateProfile`, `deleteAccount`, `getLocations`, `createLocation`, `updateLocation`, `deleteLocation`, `getPreferences`, `updatePreferences`, `getMembership`, `upgradeMembership`, `downgradeMembership`, `getNotificationHistory`

**Consents (/me/consents):** `getConsents`, `updateConsent`

**Reminders (/me/reminders — PRO):** `getReminders`, `createReminder`, `updateReminder`, `deleteReminder`

**Sources:** `getSources`, `rateSource`, `deleteSourceRating`

**Source Preferences (PRO):** `getSourcePreferences`, `setSourcePreference`, `deleteSourcePreference`

**Weather Thresholds (PRO):** `getWeatherThresholds`, `setWeatherThreshold`, `deleteWeatherThreshold`

### Membership & Feature Gating

- `useMembership()` hook — fetches tier, exposes `isFree`/`isPlus`/`isPro` booleans
- API response wraps plan details under `current` (see `MembershipResponse` type in hook)
- `priceMonthly`/`priceYearly` are strings from the API (not numbers)
- `<ProGate requiredTier="PLUS"|"PRO">` — wraps features that require a paid tier, shows upsell if not met
- `<AdPlaceholder variant="banner"|"card"|"inline">` — renders ad slot for FREE users only, null for paid
- Checkout flow: `/pricing` → `/checkout?tier=X&billing=monthly|yearly` → fake payment form
- `PaymentForm` component (`components/app/checkout/payment-form.tsx`) is the single swap point for Stripe Elements

### GDPR Consent

- `ConsentGate` wraps `(app)/layout.tsx` — blocks app until consents exist
- On first launch (empty consents array), shows full-screen `ConsentModal`
- 6 categories: `location_tracking`, `push_notifications`, `analytics`, `personalization`, `marketing`, `data_sharing`
- Required categories are toggled ON + disabled
- API returns 451 for consent-required → dispatches `CONSENT_REQUIRED_EVENT` → modal re-shows
- Privacy section in settings allows per-toggle instant save

### Error Handling

- `ApiError` class with `status` and `body` properties
- `CONSENT_REQUIRED_EVENT` (`notifio:consent-required`) — dispatched on 451, handled by ConsentGate
- `RATE_LIMITED_EVENT` (`notifio:rate-limited`) — dispatched on 429 with `detail.seconds`, handled by ApiErrorToaster
- Toast system: `<ToastProvider>` in providers, `useToast()` hook with `success`/`error`/`warning`/`info` methods
- Global `unhandledrejection` listener in `api.ts` intercepts known error codes

## Environment Variables

### Web (`apps/web/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPTILER_KEY=          # Free tier, for MapLibre tiles
```

### Mobile (`apps/mobile/.env`)

```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```
