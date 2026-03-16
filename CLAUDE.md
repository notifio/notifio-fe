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
- All requests go through `@notifio/api-client`
- Response envelope: `{ success: boolean, data?: T, error?: string, meta?: {} }`
- Auth: Bearer token via Supabase Auth (to be implemented)

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
