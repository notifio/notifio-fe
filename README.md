# Notifio Frontend

Turborepo monorepo containing the web app and mobile app for **Notifio** — a hyperlocal real-time notification platform for weather, utility outages, traffic incidents, and air quality in Slovakia.

## Architecture

```
notifio-fe/
├── apps/
│   ├── web/            Next.js 15 (App Router) — landing page + dashboard
│   └── mobile/         React Native (Expo 55, Expo Router) — iOS + Android
├── packages/
│   ├── api-client/     Typed HTTP client (not yet integrated)
│   └── ui/             Shared design tokens (colors, spacing, typography)
└── turbo.json          Build orchestration
```

**Related repos:**

- [`notifio-api`](https://github.com/notifio/notifio-api) — Express/TS backend (Railway)
- [`notifio-shared`](https://github.com/notifio/notifio-shared) — Published as `@notifio/shared@0.17.0` on GitHub Packages (types, Zod schemas, formatters, i18n)

## Tech Stack

| Concern       | Web                          | Mobile                                |
| ------------- | ---------------------------- | ------------------------------------- |
| Framework     | Next.js 15 (App Router)      | Expo 55 (managed workflow)            |
| Routing       | App Router                   | Expo Router (file-based)              |
| Styling       | Tailwind CSS 4               | StyleSheet + `theme.ts` tokens        |
| Maps          | MapLibre GL JS 5.x           | react-native-maps + map-clustering    |
| Icons         | Tabler Icons React           | Tabler Icons React Native             |
| Auth          | Supabase Auth                | Onboarding flow (no auth yet)         |
| State         | React hooks + context        | React hooks + context                 |

**Shared across both apps:** `@notifio/shared` (types, Zod schemas, formatters), Turborepo, TypeScript 5.9 (strict mode), ESLint 9, Prettier.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 11+
- Backend running at `localhost:3001` (see [notifio-api](https://github.com/notifio/notifio-api))
- For mobile: Xcode (iOS) or Android Studio (Android), Expo Go app

### Installation

```bash
git clone https://github.com/notifio/notifio-fe.git
cd notifio-fe
npm install
```

### Environment Variables

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Mobile** — create `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### Running

```bash
# Web (Next.js dev server at http://localhost:3000)
npm run dev:web

# Mobile (Expo dev server)
npm run dev:mobile
```

### Build & Quality

```bash
npm run build        # Build all packages + apps
npm run typecheck    # Type-check everything (strict, no `any`)
npm run lint         # Lint everything (ESLint 9)
npm run test         # Run all tests
npm run clean        # Remove build artifacts
```

## Features

### Web App

| Feature                 | Status | Description                                                                |
| ----------------------- | ------ | -------------------------------------------------------------------------- |
| Landing page            | Done   | Hero, features grid, how-it-works, CTA, footer                            |
| Authentication          | Done   | Supabase Auth, sign-in/sign-out flow                                       |
| Dashboard               | Done   | Split view — left panel (weather + alerts), right panel (interactive map)  |
| Weather card            | Done   | Gradient card with temp, feels-like, wind, humidity, visibility, timestamp |
| Air quality indicator   | Done   | Collapsible AQI section on weather card with pollutant grid               |
| Interactive map         | Done   | MapLibre GL with clustered pins, click-to-zoom, pin popups                |
| Map filter bar          | Done   | Toggle electricity/water/heat/traffic pins, per-source count badges       |
| Alert feed              | Done   | Notification history with pagination, category badges                     |
| Event reporting         | Done   | FAB on map → subcategory picker, location, radius slider → submit         |
| Membership & pricing    | Done   | Pricing page, checkout (fake Stripe-ready), tier badges, ProGate          |
| GDPR consent            | Done   | First-launch consent modal, privacy section in settings, 451 re-trigger   |
| Personal reminders      | Done   | PRO-gated CRUD with recurrence, ProGate upsell for non-PRO               |
| Source ratings           | Done   | Star ratings (accuracy/timeliness), credibility score, comments           |
| Ad placeholders         | Done   | Banner/card/inline ad slots for FREE tier, "Remove ads" upsell            |
| Toast notifications     | Done   | Success/error/warning/info toasts, auto-dismiss, stackable               |
| Settings                | Done   | Subscription, push, notification prefs, privacy, data sources, account    |
| i18n                    | Done   | SK + EN via next-intl, shared + web-local namespaces                       |
| Loading/error states    | Done   | Non-blocking spinner overlay on map, error banner with retry              |

**Routes:**

| Path                | Description                           |
| ------------------- | ------------------------------------- |
| `/`                 | Landing page (public)                 |
| `/sign-in`          | Authentication page                   |
| `/dashboard`        | Main app — weather, alerts, map       |
| `/map`              | Full-screen map view                  |
| `/notifications`    | Notification history                  |
| `/pricing`          | Membership tier comparison            |
| `/checkout`         | Fake payment form (Stripe-ready)      |
| `/reminders`        | Personal reminders (PRO-gated)        |
| `/profile`          | User profile                          |
| `/settings`         | Preferences hub                       |
| `/settings/sources` | Data source ratings                   |

### Mobile App

| Feature                 | Status | Description                                                                |
| ----------------------- | ------ | -------------------------------------------------------------------------- |
| Onboarding flow         | Done   | Welcome → location permission → notification types → complete              |
| Tab navigation          | Done   | 4 tabs: Overview, Alerts, Map, Settings                                   |
| Weather card            | Done   | Same gradient card as web, with AQI indicator                              |
| Air quality indicator   | Done   | Expandable AQI section with pollutant grid (LayoutAnimation)              |
| Clustered map           | Done   | react-native-maps + clustering, custom markers, callout tooltips           |
| Map filter bar          | Done   | Horizontal pill toggles with source counts, safe area aware               |
| Alert feed              | Mock   | Same 7 hardcoded alerts                                                   |
| Settings                | Done   | Alert types, severity, language, version info, reset onboarding            |
| Loading/error states    | Done   | ActivityIndicator overlay, error banner with retry                         |

**Screens:**

| Tab       | Screen           | Description                          |
| --------- | ---------------- | ------------------------------------ |
| Overview  | `(tabs)/index`   | Weather card + traffic placeholder   |
| Alerts    | `(tabs)/alerts`  | Alert feed list                      |
| Map       | `(tabs)/map`     | Full-screen clustered map            |
| Settings  | `(tabs)/settings`| Preferences + about                  |

## API Integration

Both apps communicate with the Notifio backend via `@notifio/api-client` — a typed HTTP client that handles auth tokens, locale headers, and error parsing.

| Endpoint group                          | Methods                                                    | Status |
| --------------------------------------- | ---------------------------------------------------------- | ------ |
| Weather & air quality                   | `getWeather`, `getWeatherWarnings`, `getAirQuality`        | Live   |
| Traffic                                 | `getTraffic`, `getTrafficFlow`                             | Live   |
| Outages                                 | `getOutages`                                               | Live   |
| Events                                  | `getEvents`, `createEvent`, `getEventCategories`, `getUserEvents`, `getEventDetail`, `voteOnEvent` | Live |
| Devices                                 | `registerDevice`, `refreshDeviceToken`, `submitDeviceLocation`, `deactivateDevice` | Live |
| User profile & locations                | `getProfile`, `updateProfile`, `getLocations`, `createLocation`, `updateLocation`, `deleteLocation` | Live |
| Preferences                             | `getPreferences`, `updatePreferences`                      | Live   |
| Membership                              | `getMembership`, `upgradeMembership`, `downgradeMembership` | Live  |
| Consents                                | `getConsents`, `updateConsent`                             | Live   |
| Reminders (PRO)                         | `getReminders`, `createReminder`, `updateReminder`, `deleteReminder` | Live |
| Sources & ratings                       | `getSources`, `rateSource`, `deleteSourceRating`           | Live   |
| Notifications                           | `getNotificationHistory`                                   | Live   |
| Source preferences / weather thresholds | `getSourcePreferences`, `setSourcePreference`, `getWeatherThresholds`, `setWeatherThreshold` | Live |

**Response envelope:** `{ success: boolean, data?: T, error?: string, meta?: {} }`

**Error handling:** `ApiError` with `status` + `body`. Global handlers for 401 (redirect to sign-in), 429 (rate-limit toast), 451 (consent-required modal).

**Partial failure handling:** Each data source is fetched independently. If some sources fail, available data still renders. Only if all sources fail does the error banner appear.

## Map System

Both platforms display outage and traffic pins on an interactive map centered on Bratislava.

**Data flow:**

1. `useMapData` hook fetches outages (electricity, water, heat) and traffic incidents in parallel
2. `normalizeMapPins()` converts heterogeneous API responses into a unified `MapPin[]`
3. Map renders pins color-coded by source type, with clustering for zoom levels
4. Filter bar toggles visibility per source type

**Pin types:**

| Source      | Color   | Icon         |
| ----------- | ------- | ------------ |
| Electricity | Yellow  | Zap          |
| Water       | Blue    | Droplets     |
| Heat        | Red     | Thermometer  |
| Traffic     | Purple  | Car          |

**Pin states:** Active pins render at full opacity. Scheduled outages render at 50% opacity.

**Clustering:** Web uses MapLibre's built-in GeoJSON clustering. Mobile uses `react-native-map-clustering` with supercluster. Both use radius 50.

## Project Structure (Detailed)

### Web (`apps/web/src/`)

```
app/
├── layout.tsx                      Root layout (Geist fonts, Providers)
├── page.tsx                        Landing page
├── sign-in/page.tsx                Sign-in page
└── (app)/
    ├── layout.tsx                  AuthGuard + ConsentGate + TopBar
    ├── dashboard/page.tsx          Dashboard (weather + alerts + map + event FAB)
    ├── pricing/page.tsx            Membership tier comparison
    ├── checkout/page.tsx           Fake payment form (Stripe-ready)
    ├── reminders/page.tsx          Personal reminders (PRO-gated)
    └── settings/
        ├── page.tsx                Subscription, push, prefs, privacy, account
        └── sources/page.tsx        Data source ratings

components/
├── app/
│   ├── dashboard-map.tsx           MapLibre GL wrapper
│   ├── weather-card.tsx            Weather gradient card
│   ├── alert-list.tsx              Scrollable alert feed
│   ├── map-filter-bar.tsx          Filter toggle bar
│   ├── top-bar.tsx                 Header navigation + dropdown
│   ├── pro-gate.tsx                Tier gate — shows upsell if tier not met
│   ├── ad-placeholder.tsx          Ad slot for FREE users (banner/card/inline)
│   ├── consent-modal.tsx           GDPR consent modal (non-dismissible)
│   ├── consent-gate.tsx            Blocks app until consents exist
│   ├── event-report-modal.tsx      Community event reporting
│   ├── reminder-form-modal.tsx     Create/edit reminder modal
│   ├── api-error-toaster.tsx       Bridges API error events to toasts
│   └── checkout/
│       └── payment-form.tsx        Fake card form (Stripe swap point)
├── landing/                        Landing page sections
└── ui/
    ├── toggle.tsx                  Switch toggle
    ├── star-rating.tsx             1-5 star picker (hover, click, readonly)
    └── toast.tsx                   Toast system (ToastProvider + useToast)

hooks/
├── use-weather.ts                  Weather data + loading/error/refresh
├── use-air-quality.ts              AQI data
├── use-map-data.ts                 Outages + traffic → MapPin[]
├── use-preferences.ts              Notification preference CRUD
├── use-membership.ts               Tier checks, upgrade/downgrade
├── use-consents.ts                 GDPR consent CRUD
├── use-reminders.ts                Personal reminder CRUD (PRO)
├── use-sources.ts                  Source ratings CRUD
├── use-event-categories.ts         Event subcategories (cached)
└── use-geolocation-tracker.ts      GPS watch + throttled backend submit

lib/
├── api.ts                          API client instance + error event dispatchers
├── auth.ts                         requireUser() server guard
├── location.ts                     DEFAULT_LOCATION (Bratislava)
├── normalize-pins.ts               OutageRecord/TrafficIncident → MapPin
├── map-pin-config.ts               PIN_STYLES, FILTER_SOURCES
├── category-groups.ts              Notification category groupings
├── format.ts                       formatRelativeTime
└── utils.ts                        cn() (clsx + tailwind-merge)
```

### Mobile (`apps/mobile/`)

```
app/
├── _layout.tsx                     Root navigator (auth → onboarding → tabs)
├── (auth)/
│   ├── welcome.tsx                 Welcome screen
│   └── login.tsx                   Login (not implemented)
├── onboarding/
│   ├── location.tsx                Location permission
│   └── notifications.tsx           Alert type selection
└── (tabs)/
    ├── _layout.tsx                 Tab bar (4 tabs)
    ├── index.tsx                   Overview (weather + placeholder)
    ├── alerts.tsx                  Alert feed
    ├── map.tsx                     Clustered map
    └── settings.tsx                Preferences

components/
├── alerts/                         Alert card + list
├── map/                            Filter bar, status card, marker, callout
├── weather/                        Weather card + AQI indicator
└── ui/                             Screen layout, badge, card, icon, toggle

hooks/
├── use-weather.ts
├── use-air-quality.ts
├── use-map-data.ts
├── use-preferences.ts
└── use-onboarding.ts               Onboarding completion state

lib/
├── theme.ts                        Design tokens (colors, spacing, fonts, shadows)
├── api.ts                          Fetch wrapper (subpath imports from @notifio/shared)
├── location.ts                     DEFAULT_LOCATION
├── normalize-pins.ts               MapPin normalization
├── map-pin-config.ts               PIN_STYLES, FILTER_SOURCES
├── mock-data.ts                    MOCK_ALERTS
├── alert-config.ts                 ALERT_TYPE_CONFIG (icons, colors)
├── format.ts                       Formatting utilities
└── common-styles.ts                Shared StyleSheet definitions

providers/
└── onboarding-provider.tsx         OnboardingContext
```

## What's Hardcoded / Not Yet Implemented

| Item                        | Current State                                   | Target                                     |
| --------------------------- | ----------------------------------------------- | ------------------------------------------ |
| Stripe payments             | Fake card form (any values accepted)             | Stripe Elements integration                |
| `@notifio/ui` tokens        | Exported, not consumed                           | Single source for web + mobile themes      |
| Mobile membership/consent   | Not yet ported                                   | Replicate web flows in Expo                |
| Pollen data                 | Hardcoded placeholder                            | Real `/api/v1/pollen` endpoint             |

## Key Technical Notes

- **Mobile `@notifio/shared` imports:** Must use subpath imports (`@notifio/shared/types`, `@notifio/shared/weather`) instead of the barrel export. The barrel pulls in `h3-js` which calls `new TextDecoder("utf-16le")` — unsupported by Hermes, causing a runtime crash.
- **API query param:** Backend expects `lng` (not `lon`) for longitude.
- **No barrel exports:** Component directories use direct imports per CLAUDE.md convention.
- **Map tiles:** Web uses free CARTO Positron basemap (`basemaps.cartocdn.com`). Mobile uses platform-default (Apple Maps on iOS, Google Maps on Android).
- **Responsive layout:** Web dashboard flips from vertical (mobile viewport) to horizontal split (desktop) at the `lg` breakpoint.
- **Membership API response:** `getMembership()` returns `{ current: { tier, name, features, priceMonthly, ... }, usage, availableUpgrades }`. The `priceMonthly`/`priceYearly` are strings (e.g. `"4.99"`), not numbers.
- **Stripe prep:** `PaymentForm` at `components/app/checkout/payment-form.tsx` is an isolated fake card form. Single file swap to Stripe Elements when ready.
- **Geolocation tracker:** Uses `isTrackingRef` (not state) in useEffect deps to avoid infinite re-render loop.
- **i18n merge:** Web messages are a deep merge of `@notifio/shared/i18n` (shared namespaces) + `apps/web/messages/` (web-local namespaces).

## Scripts Reference

| Script           | Scope  | Description                         |
| ---------------- | ------ | ----------------------------------- |
| `npm run dev:web`    | Root   | Start Next.js dev server            |
| `npm run dev:mobile` | Root   | Start Expo dev server               |
| `npm run build`      | Root   | Build all packages + apps           |
| `npm run typecheck`  | Root   | Type-check all packages             |
| `npm run lint`       | Root   | Lint all packages                   |
| `npm run test`       | Root   | Run all tests                       |
| `npm run clean`      | Root   | Remove build artifacts              |

Per-app via Turbo:

```bash
npx turbo run dev --filter=@notifio/web
npx turbo run build --filter=@notifio/mobile
```

## License

Private — all rights reserved.
