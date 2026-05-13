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

### Per-workspace verification (after batch implementation)

```bash
# Web
npx turbo run typecheck --filter=@notifio/web
npx turbo run lint --filter=@notifio/web
npx turbo run build --filter=@notifio/web

# Mobile (Hermes bundling catches errors typecheck misses)
cd apps/mobile && npx expo export --platform ios --output-dir /tmp/expo-export-smoke
```

`@notifio/shared` lives in a separate repo and is consumed as a published package — verification of shared happens in that repo, not here.

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

## Refactor Workflow

Multi-file refactors follow a five-step pattern:

1. **Audit first.** Write a Stage 1 audit prompt that READS but doesn't EDIT. Output: classification table, decision list, file plan. STOP for review before any implementation prompt.
2. **Decisions in chat.** Surface every non-trivial decision before implementation, not during. Bake answers into the next prompt.
3. **Stage-by-stage with STOP.** Multi-stage prompts STOP between each stage for review. No cascading.
4. **Verify before commit.** `npx turbo run typecheck && lint && build` (mobile: also `expo export --platform ios` smoke for Hermes-only failures). Single commit per batch — no per-stage commits unless explicitly bisect-friendly.
5. **Skip dirty state.** Pre-existing untracked/modified files unrelated to the batch stay unstaged. Commit only batch-scoped changes.

Common file patterns:

- `PROMPTS-{BATCH}-{NAME}.md` — planner output, run by Claude Code
- `temp/incoming_code/{web,mobile}/` — drop zone for cross-app code drops feeding shared extractions
- `EXTRACTION-AUDIT.md` or similar — sprint-level decision log (one per refactor sprint)

End-of-stage reports from Claude Code: ≤10 lines summary + diff stats + verification result. Tables only when explicitly asked.

Commit messages: `<scope>(<workspace>): <subject>` (e.g. `refactor(web): consume @notifio/shared/hooks`). Body describes WHAT and WHY. Footer references the batch from the sprint audit doc when applicable.

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
- `@notifio/shared` — types, Zod schemas, i18n (sk/en/cs/hu/de/uk parity), H3 utils, hooks, preferences helpers, map module. The current pin is tracked under "Bumping `@notifio/shared`" below so feature branches can verify they aren't stale; `package.json` remains the runtime source of truth.
- Response envelope: `{ success: boolean, data?: T, error?: string, meta?: {} }`
- Auth: Bearer token via Supabase Auth

**Path quirk:** Web's API singleton lives at `apps/web/src/lib/api.ts` (with `src/`). Mobile's lives at `apps/mobile/lib/api.ts` (no `src/`). When referencing in prompts or commits, use the actual paths — these aren't symmetric.

### Bumping `@notifio/shared`

#### Current `@notifio/shared` pin

**Pinned version:** `^0.36.0` (as of 2026-05-12)

When you start a new FE feature branch, verify your branch carries this pin or newer:

```bash
cat packages/api-client/package.json | grep '"@notifio/shared"'
cat package.json | grep '"@notifio/shared"'
```

If your branch was created before this pin landed, rebase onto main before opening a PR. Stale pins break typecheck the moment your code touches a shared field added after the pin.

When a new shared version publishes, the FIRST FE PR that consumes the new feature bumps the pin in the same PR. Subsequent in-flight FE branches must rebase onto post-bump main.

Update this section every time the pin moves.

#### Bump procedure

When `@notifio/shared` publishes a new version, **also bump the pin in `packages/api-client/package.json` in the same PR**. Otherwise type drift accumulates silently at the api-client boundary: api-client emits stale shapes against the new shared contract, forcing apps to use `as unknown as ...` casts at every consumer.

Example: shared `0.27.0` introduced `MembershipResponse` (nested under `current`) replacing the flat `MembershipDetails`. api-client was still pinned to `^0.21.0`, so apps had to cast `api as unknown as NotifioApi` at every `<ApiProvider>` mount until api-client's pin caught up (Batch E1 fix).

Practical rule: any commit that bumps the root `@notifio/shared` dep also touches `packages/api-client/package.json` to match. Run `npm install` after to dedupe the nested copy under api-client to the new hoisted version.

### BE follow-ups (queued, not yet shipped)

Running list of BE-side gaps the FE has worked around with local widening casts or heuristics. When BE lands these, the corresponding FE cast / fallback can be removed.

- **`isUserReported` projection on `EventDetail` + `EventFeedItem` + `NotificationHistoryItem`.** BE writes `f_event.key_created_by_user` for community reports but doesn't project it. FE currently uses `source.code === 'user_report'` which misses provider-attributed user reports (e.g. user reporting "BVS water outage" gets `cod_source_adapter='bvs_outage'`, not `'user_report'`). Full audit in `AUDIT-COMMUNITY-EVENT-FLAG.md`. Once BE projects `isUserReported: boolean`, replace the source-code heuristic everywhere (alert card, event detail Komunitné pill, source attribution helper).
- **api-client `EventDetail` type drift.** `packages/api-client/src/shared-types.ts` `interface EventDetail` only exposes `sourceId` and a flat `location`. BE has projected `source: { code, name, label, url }`, `description`, `address`, `locality`, `providerName` since shared 0.29. FE currently widens the cast inline at consumer sites. Proper fix: delete the local interface and re-export from `@notifio/shared` (which has the canonical shape).
- **`providerName` projection meaningfulness.** BE's `event.service.ts` falls back `providerName` to `c_source_adapter.txt_name` when the polygon doesn't set it explicitly — making the field always non-null but only sometimes meaningful (otherwise it duplicates `source.name`). FE can't surface a "Poskytovateľ" row cleanly without that distinction. Ask: project `providerName: string | null` where null = FK fallback, non-null = explicit polygon-set, so FE can render the row only when it adds info.

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

## Git Conventions

- Never push to `main` directly. All work goes on feature branches → PR → merge after CI.
- Branch naming: `chore/<topic>`, `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `refactor/<topic>`.
- Single commit per batch is OK; squash on merge if PR has multiple.

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
