# Audit Results — 2026-04-10

## Build Health

| Check | Web | Mobile |
|-------|-----|--------|
| `tsc --noEmit` | PASS | PASS |
| `lint` | PASS (0 errors) | PASS (0 errors) |
| `build` | PASS | N/A (Expo) |

---

## ❌ Errors (must fix before merge)

### E1. Hardcoded English labels in mobile `alert-config.ts`
**File:** `apps/mobile/lib/alert-config.ts:6-10`
**Issue:** 5 hardcoded English labels: 'Weather Warnings', 'Traffic Updates', 'Air Quality', 'Utility Outages', 'Events'. These are rendered in onboarding toggle rows and don't use i18n.
**Impact:** Slovak users see English labels in onboarding.
**Fix:** Replace with `t()` calls or make the config accept translated labels.

---

## ⚠️ Warnings (should fix)

### W1. Mobile missing `getTrafficFlow()` fetch
**File:** `apps/mobile/hooks/use-map-data.ts`
**Issue:** Web fetches both `getTraffic()` and `getTrafficFlow()` for traffic flow line rendering. Mobile fetches only `getTraffic()` — no flow lines on mobile map.
**Impact:** Mobile map shows traffic incident pins but no congestion-colored road overlays. This may be intentional (react-native-maps doesn't have MapLibre's line layer), but the data isn't fetched even if a polyline renderer is added later.
**Fix:** Decide if flow data is needed on mobile. If yes, add fetch + pass to map component.

### W2. Unused API client methods (10 methods)
**File:** `packages/api-client/src/index.ts`
**Methods never called from web or mobile:**
- `voteOnEvent` — added in Prompt 3, UI not built yet
- `getUserVote` — added in Prompt 3, UI not built yet
- `getProfile`, `updateProfile`, `deleteAccount` — profile management not implemented
- `updateLocation`, `deleteLocation` — location CRUD not fully implemented
- `getMembership`, `upgradeMembership`, `downgradeMembership` — membership features not implemented
**Impact:** Dead code, but these are intentionally scaffolded for future features.
**Fix:** Add `// TODO: Wire UI for event voting` comments. No deletion needed.

### W3. Dead code files in web
**Files:**
- `apps/web/src/lib/mock-data.ts` — never imported. Contains old `MOCK_ALERTS` and `ALERT_TYPE_CONFIG`.
- `apps/web/src/components/ui/badge.tsx` — never imported after alert-card rewrite removed its usage.
**Impact:** Bundle size (tree-shaken in production but still in source).
**Fix:** Delete both files.

### W4. Dead code file in mobile
**File:** `apps/mobile/lib/mock-data.ts` — never imported.
**Fix:** Delete.

### W5. Web `notification-icons.ts` uses `ICON_PATHS` from `map-pin-config.ts`
**File:** `apps/web/src/lib/notification-icons.ts`
**Issue:** Reuses map pin SVG paths (designed for 24×32 viewBox) for notification card icons (rendered in 24×24 viewBox). The paths work but were designed for a different viewport — some icons may look slightly off.
**Impact:** Minor visual imperfection.
**Fix:** Consider creating purpose-built icon paths for notifications, or verify all paths render correctly at the notification card size.

---

## ℹ️ Info (nice to know)

### I1. i18n keys: perfect parity between en.json and sk.json
Both web and mobile have identical key structures in their en/sk JSON files. No missing keys in either direction.

### I2. Shared package provides 13 namespaces via deep merge
`@notifio/shared` provides: common, weather, airQuality, traffic, outages, warnings, notifications, auth, settings, pushSetup, locationBanner, map, alerts. Both web and mobile overlay local keys on top. All keys used in code are available at runtime.

### I3. Many i18n keys are used via dynamic construction
Keys like `tabs.*`, `settingsOptions.*`, `categoryGroups.*`, `aqi.*`, `pollen.*`, `notificationType.*` are referenced through variables (e.g., `t(tab.key)`, `t('aqi.' + level)`, `t('categoryGroups.' + groupKey)`). Static analysis misses these — they are NOT dead keys.

### I4. No `console.log` statements remain
All console usage is `console.error` in error handlers. Previous debug `console.log` calls were removed in the audit fix prompt.

### I5. No `@ts-ignore` or `@ts-expect-error` in either app
Only `eslint-disable-next-line` comments exist (2 in web, intentional for react-hooks/exhaustive-deps in MapLibre lifecycle effects).

### I6. Web↔Mobile consistency is good
Both apps have:
- Gas outages in `normalizeMapPins()`, `MAP_FILTER_SOURCES`, and `useMapData()`
- Notification grouping by `eventId` (in component layer, not hook)
- Same category group definitions (`category-groups.ts`)
- Same notification type inference logic (`isResolved`, `inferType`)

### I7. Bundle sizes
| Route | Size | First Load JS |
|-------|------|--------------|
| /dashboard | 8.32 kB | 542 kB |
| /map | 738 B | 535 kB |
| /settings | 7.93 kB | 205 kB |
| /profile | 973 B | 176 kB |

### I8. Mobile dark mode infrastructure in place
`ThemeProvider` + `useAppTheme()` created. 5 core components updated (ScreenLayout, ScreenHeader, Card, tab bar, StatusBar). 23 remaining files still use static `theme.colors` — progressive adoption needed.
