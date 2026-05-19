# AUDIT — Hlásenia tab (Udalosti → Hlásenia) + width + creation flow

| Field | Value |
|---|---|
| Branch | `fix/notifications-screen-batch` (continuing — 8th commit on top) |
| Latest commit | `b3e6197` (mobile width fix) |
| Date | 2026-05-19 |
| Shared package | `1.14.0` installed, root pin `^1.11.0` (already noted as lag in prior audits) |
| Stage | Phase 0 (read-only) — Phase 1 STOPS until Filip green-lights |

Prior commits on branch (8 cumulative if Phase 1 lands):
- `ed9165b` fix(web) notifications batch 1
- `80f6f2f` fix(mobile) notifications batch 1
- `ee7d9c3` chore(deps) api-client pin + coords thread
- `33979ab` feat(web) filter redesign
- `fa84cbf` feat(mobile) filter redesign
- `ebc8126` fix(web) button-in-button
- `b3e6197` fix(mobile) width parity + lifecycle overflow

Remote ref `origin/fix/notifications-screen-batch` not present at fetch time — branch is local-only or PR sits on a different name; not blocking.

---

## 1. Current Udalosti sub-tab state

### Web

| Concern | Detail |
|---|---|
| Route renderer | `apps/web/src/app/(app)/notifications/page.tsx:52-55` — `{activeTab === 'events' && (<div className="mt-6"><EventsSection /></div>)}` |
| Sub-tab content | `apps/web/src/app/(app)/profile/events-section.tsx` (155 lines) |
| Data hook | `useUserEvents()` re-exported from `@notifio/shared/hooks` — hits `GET /events/mine` |
| What it shows today | User's own events only (no Mine/All toggle). Cards with subcategoryName, isResolved badge, createdAt, inline Resolve + Delete buttons. Empty state: `<IconAlertTriangle>` + `t('myEvents.empty')` = "Zatiaľ ste nenahlásili žiadne udalosti" — placeholder text, no CTA. |
| Section namespace | `useTranslations('profile')` — keys like `myEvents.title`, `myEvents.empty`, `myEvents.resolve`. Uses `events.*` for shared button strings (delete, cancel). |
| Width | Inherits from page `<div class="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-10">`. EventsSection itself has no padding overrides. **No drift vs Notifikácie tab.** |

### Mobile

| Concern | Detail |
|---|---|
| Route renderer | `apps/mobile/app/(tabs)/alerts.tsx:84` — `{activeTab === 'events' && <MyEventsList />}` |
| Sub-tab content | `apps/mobile/components/events/my-events-list.tsx` (~237 lines) |
| Data hook | `useUserEvents()` from `@notifio/shared/hooks` (same as web) — hits `GET /events/mine` |
| What it shows today | User's own events only, FlatList of rows with subcategoryName, status badge (`event.status.active|resolved`), createdAt, inline Resolve (IconCheck) + Delete (IconTrash) Pressables. Empty state: `<EmptyState icon={IconAlertTriangle} message={t('reminders.tabs.eventsEmpty')}/>` = "Žiadne nahlásené udalosti" — no CTA, no map deeplink. |
| FlatList padding | `contentContainerStyle: { paddingHorizontal: SPACING.screenH (16), paddingBottom: theme.spacing['4xl'] }` ← **same double-padding bug** that was just fixed on AlertList in commit `b3e6197`. |

### Card render block (mobile, abridged from `my-events-list.tsx:59-127`)

```tsx
const renderItem = ({ item }: { item: UserEvent }) => {
  const resolved = item.isResolved;
  return (
    <Pressable onPress={() => handlePress(item)} style={…row + bg + border, pressed}>
      <View style={styles.rowText}>
        <View style={styles.titleRow}>
          <Text>{item.subcategoryName || item.title}</Text>
          <View style={[styles.statusBadge,
            resolved ? { backgroundColor: colors.severity.info.bg }
                     : { backgroundColor: colors.severity.warning.bg }]}>
            <Text>{resolved ? t('event.status.resolved') : t('event.status.active')}</Text>
          </View>
        </View>
        <Text>{formatDateTime(item.createdAt, i18n.language)}</Text>
      </View>
      <View style={styles.actions}>
        {!resolved && <Pressable onPress={() => handleResolve(...)}><IconCheck /></Pressable>}
        <Pressable onPress={() => confirmDelete(...)}><IconTrash /></Pressable>
      </View>
    </Pressable>
  );
};
```

---

## 2. Tab label migration — Udalosti → Hlásenia

### Current resolution

Both apps resolve sub-tab #2's label via:
- Web: `t(\`tabs.${tab}\`)` with `tab='events'` → `notificationsPage.tabs.events` (shared) = `"Udalosti"` (sk)
- Mobile: `TABS[1].labelKey = 'reminders.tabs.events'` → `reminders.tabs.events` (shared) = `"Udalosti"` (sk)

Both shared. **No shared edit allowed per plan.**

### Existing shared "Hlásenia" candidates probed (all 6 locales)

```
events.myEvents          → "Moje hlásenia"   (My reports — too possessive for tab)
profile.myEvents.title   → "Moje hlásenia"   (same)
myEvents.confirmDelete.title → "Vymazať hlásenie?"
alerts.sourceCommunity   → "Komunitné hlásenie"
events.reportButton      → "Nahlásiť"
```

**No standalone `"Hlásenia"` (Reports — plural noun for the tab) exists in shared.** Closest is `events.myEvents` but the "Moje" (My) prefix is wrong for a section tab.

### Strategy

#### Web — strategy: new local namespace + call-site repoint

`apps/web/src/i18n/request.ts:72` merges via `deepMerge(web, shared)` — **shared wins on overlap.** A new key under an existing shared namespace would be overwritten. Solution: use a fresh namespace that shared doesn't have, OR repoint the call site, mirroring how `history` was already repointed to `nav.notifications`.

Recommend: add `localTabs.hlasenia` to `apps/web/messages/{locale}.json` (namespace `localTabs.*` is not in shared, so web-local wins by lack of collision). Then in `page.tsx`:
```ts
const labelFor = (tab: Tab) =>
  tab === 'history' ? tNav('notifications') :
  tab === 'events'  ? tLocal('localTabs.hlasenia') :
  t(`tabs.${tab}`);
```

#### Mobile — strategy: add local merge layer in `i18n.ts`

`apps/mobile/lib/i18n.ts:6-15` comment explicitly states mobile-local locale files were deleted in favour of pure shared. The file comments invite re-introduction: "Add mobile-only namespaces back here only if shared genuinely doesn't cover them" (line 14). Re-introduce a tiny override layer:

```ts
const MOBILE_OVERRIDES: Record<SupportedLocale, Record<string, string>> = {
  sk: { 'localTabs.hlasenia': 'Hlásenia' }, // TODO: migrate to @notifio/shared
  en: { 'localTabs.hlasenia': 'Reports' },
  cs: { 'localTabs.hlasenia': 'Hlášení' },
  de: { 'localTabs.hlasenia': 'Meldungen' },
  hu: { 'localTabs.hlasenia': 'Bejelentések' },
  uk: { 'localTabs.hlasenia': 'Повідомлення' },
};

const resources = supportedLocales.reduce(…, (acc, loc) => {
  const shared = getSharedMessages(loc);
  acc[loc] = { translation: { ...shared, ...MOBILE_OVERRIDES[loc] } };
  return acc;
}, {});
```

Then in `alerts.tsx`: change `TABS[1].labelKey` from `'reminders.tabs.events'` to `'localTabs.hlasenia'`.

### 6-locale strings to ship

| Locale | Tab label |
|---|---|
| sk | Hlásenia |
| en | Reports |
| cs | Hlášení |
| de | Meldungen |
| hu | Bejelentések |
| uk | Повідомлення |

Ukrainian sanity-check needed (Q1 in §12): "Повідомлення" is "notifications" / "reports" — semantically overlaps with shared's `nav.notifications` = "Сповіщення". Suggest "Звіти" instead for "Reports" (closer to the user-report semantic). Filip's call.

All entries get a `// TODO: migrate to @notifio/shared in next shared bump` neighbor comment.

---

## 3. Reusable filter row + sheet components

### Web

| Piece | Reusability |
|---|---|
| Segmented lifecycle control in `history-section.tsx:154-168` | Inline JSX, hardcoded `t(\`lifecycle.${key}\`)` from `notificationsPage` namespace. Not directly reusable. |
| Category dropdown popover `history-section.tsx:172-218` | Inline JSX, hardcoded i18n keys. Not directly reusable. |
| Small-viewport Filter button `history-section.tsx:221-232` | Inline JSX with badge logic. Not directly reusable. |
| `notification-filter-sheet.tsx` (the bottom sheet component) | **Partially reusable.** Accepts `lifecycle/onLifecycleChange/category/onCategoryChange/lifecycleOptions/categoryOptions` as props — generic. BUT hardcodes `useTranslations('notificationsPage')` on L36 and `t(\`lifecycle.${key}\`)` / `t(\`filters.${key}\`)` template lookups. To reuse for Hlásenia (different category set + scope toggle), would need either a namespace prop or a renderer prop. |

**Recommendation**: extract a `<FilterSheet>` primitive with generic API:
```ts
<FilterSheet
  sections={[
    { title, options: [{ id, label, active }], onSelect }, …
  ]}
  doneLabel onClose
/>
```
…then have both `history-section.tsx` and the new Hlásenia tab compose their own sections. Lower-cost alternative: duplicate the file as `events-filter-sheet.tsx` and accept ~150 lines of cosmetic duplication.

### Mobile

| Piece | Reusability |
|---|---|
| Lifecycle 4-tab strip in `alert-list.tsx:99-128` | Inline JSX, hardcoded `t(\`notificationsPage.lifecycle.${key}\`)`. Easy to copy but not extracted. |
| Filter icon button `alert-list.tsx:130-141` | Inline JSX. Same. |
| `BottomSheet` primitive at `apps/mobile/components/ui/bottom-sheet.tsx` | **Generic, fully reusable.** Already consumed by `filter-sheet.tsx`. |
| `FilterSheet` at `apps/mobile/components/alerts/filter-sheet.tsx` | **Tied to category-only API** (`category: CategoryFilter; onCategoryChange`). The CategoryFilter type is hardcoded `'all' \| 'weather' \| 'traffic' \| 'outages' \| 'pollen'`. Not reusable for the event category set. |

**Recommendation**: copy the lifecycle strip + icon button JSX into MyEventsList; build a new `events-filter-sheet.tsx` next to the existing one with the Hlásenia-specific options (Mine/All scope + event category list). Don't try to make one component serve both — semantics differ enough (see §4 + §6).

---

## 4. BE Scope filter — TWO ENDPOINTS, NOT ONE PARAM

Critical finding contradicting the plan's hypothesis.

### Reality

```ts
api.getEvents({ lat, lng, radius? })  // GET /events?lat&lng&radius — returns ALL events in radius
api.getUserEvents()                   // GET /events/mine — returns ONLY caller's events, no params
```

There is **no `scope` / `mine` / `onlyMine` / `userId` query param** on any event endpoint. Mine vs All is a **different endpoint**, not a toggleable param.

### Implications for Phase 1

A Mine|All scope toggle would have to **switch between two hook calls** (`useUserEvents()` vs a new `useEvents({ lat, lng, radius })` consumer). This is significantly more wiring than a single state toggle:

1. The "All" case needs **resolved location coordinates** + radius. Current EventsSection / MyEventsList have no location context — they just call the userId-bound endpoint. To support "All", the screen needs `useResolvedLocation()` like the map screen does, and an explicit radius (50km? user-config? default? — needs decision).
2. `getEvents()` returns `EventFeedItem[]` (has `status: upcoming|active|resolved`, `category`, `subcategoryName`, etc.) — a different shape than `UserEvent[]` (`isResolved: boolean`, no upcoming, `categoryCode` not `category`).
3. Mutations (`updateEvent`, `deleteEvent`) only work on items the user owns. If a card displays an "All" item that isn't owned, Resolve/Delete buttons must hide. Today the cards always show them.

**Effort estimate**: a real Mine/All toggle is ~half a day of FE work (location threading + dual-hook + card props normalization). It is meaningfully larger than "wire up a state to a query param".

### Recommended Phase 1 scope (Filip's call — Q2)

Three options:
- **A**: Ship Mine-only (keep current behavior, no scope toggle in the sheet). Filter sheet shows only category selector (if applicable per §6) — or sheet is omitted entirely if no usable filters exist.
- **B**: Ship the Mine/All toggle. Wire location threading, dual-hook, card-shape normalization. Half-day expansion of plan scope.
- **C**: Ship the toggle as UI but defer "All" wiring — toggle disabled with tooltip "Coming soon", scope state always 'mine'. Cosmetic groundwork for future All-mode without the wiring cost.

Recommend **A**. Plan says "if BE only supports one of them … fall back accordingly with flag" — this is exactly that. Document the "All" path as a follow-up. Sheet either ships with nothing in it (just close) or with category filter only (per §6).

---

## 5. BE Lifecycle filter — does not exist, asymmetric data shapes

No `?status=` / `?lifecycle=` / `?eventStatus=` query param on `/events` or `/events/mine`.

### What data the FE can filter client-side

| Source | Lifecycle field | Possible client-side options |
|---|---|---|
| `UserEvent` (from `/events/mine`) | `isResolved: boolean` | Active (isResolved=false), Resolved (isResolved=true). **No `upcoming` state** for user-reported events. |
| `EventFeedItem` (from `/events?lat&lng`) | `status: 'upcoming' \| 'active' \| 'resolved'` | Active, Upcoming, Resolved, All — same 4-tab semantic as Notifikácie. |

### Implication

The 4-tab lifecycle strip Filip wants (Aktívne / Plánované / Ukončené / Všetky) **matches `EventFeedItem` only**. For `UserEvent` it's only 2 meaningful states (Active vs Resolved); `Plánované` doesn't exist on user-created events.

If Phase 1 ships Mine-only (§4 option A), the lifecycle strip would be 2 options or it would have non-functional tabs ("Plánované" with always-empty list). Recommend the strip degrades to 2 tabs (Aktívne / Ukončené) + optional "Všetky" for "all of mine regardless of resolved" — see Q3.

If Mine/All ships (§4 option B), the strip is always 4-option, and the Mine view simply has zero results in the Upcoming tab (which is acceptable as an empty state — "no upcoming" reads naturally).

---

## 6. Category filter applicability

`EventFeedItem.category` is a string (any of the API-known codes, dynamic from `/events/categories`). `UserEvent.categoryCode` likewise dynamic.

The event-report-modal pulls categories via `useEventCategories()` → `GET /events/categories`, lists them grouped, user picks one.

### Mismatch vs Notifikácie hardcoded set

Notifikácie tab uses a hardcoded local `CATEGORY_FILTERS = [weather, traffic, outages, pollen]` with **prefix-matching** against `n.category`. Events have a **finer category structure** (subcategoryCode + categoryCode with provider attribution): outage_electric, outage_water, outage_heat, outage_gas, etc. — much longer list than 4.

### Phase 1 recommendation

- **A**: skip category filter on Hlásenia entirely (sheet has scope only, or nothing). Simpler.
- **B**: implement category filter using `useEventCategories()` → dropdown of all category codes. Bigger sheet, dynamic options, harder UX.

Recommend **A** for this batch. Add category filter later when there's enough user-reported volume to make filtering useful. (Currently `events.myEvents.empty` is the typical user experience — most users have 0–3 reports total.)

---

## 7. Width drift confirmation

### Web

| Sub-tab | Container chain | Inset | Drift vs Notifikácie |
|---|---|---|---|
| Notifikácie (HistorySection) | page `px-4 / md:px-8` → `<div class="mt-6">` → inline | inherits parent | reference |
| Hlásenia (EventsSection) | page `px-4 / md:px-8` → `<div class="mt-6">` → `<section>` (no padding) | inherits parent | **0 drift** |
| Pripomienky (RemindersSection) | page `px-4 / md:px-8` → `<div class="mt-6">` → toggle row (no horizontal padding) | inherits parent | **0 drift** |

**No web fix needed.**

### Mobile

| Sub-tab | Container chain | Inset | Drift |
|---|---|---|---|
| Notifikácie (AlertList, post-`b3e6197`) | `<ScreenLayout>` 20pt → `<View tabContent>` → AlertList (no extra padding) | **20pt** | reference |
| Hlásenia (MyEventsList) | `<ScreenLayout>` 20pt → `<View tabContent>` → FlatList `contentContainerStyle: { paddingHorizontal: SPACING.screenH }` = +16pt | **36pt** | **+16pt drift** |
| Pripomienky (RemindersTabContent + ReminderList) | `<ScreenLayout>` 20pt → `<View tabContent>` → `toggleRow { paddingHorizontal: SPACING.screenH }` + ReminderList `list { paddingHorizontal: SPACING.screenH }` | **36pt** | **+16pt drift** |

**Same double-padding bug as the one fixed on AlertList in `b3e6197`.** Three remaining sites:

- `apps/mobile/components/events/my-events-list.tsx` `styles.list.paddingHorizontal: SPACING.screenH`
- `apps/mobile/components/reminders/reminders-tab-content.tsx` `styles.toggleRow.paddingHorizontal: SPACING.screenH`
- `apps/mobile/components/reminders/reminder-list.tsx` `styles.list.paddingHorizontal: SPACING.screenH` (need to verify exact path — Explore output cited but didn't paste; will verify in Phase 1)

**Fix: identical to `b3e6197` — drop `paddingHorizontal: SPACING.screenH` from each, relying on ScreenLayout's 20pt edge.**

Plan §1.5 + §0.10 explicitly green-lights bundling the Reminders width fix here. ✓

---

## 8. Report creation flow — bug audit (no fix)

### Static analysis findings

**Web** `apps/web/src/components/app/event-report-modal.tsx:84-103` submit:
```ts
await api.createEvent({
  subcategoryCode: selectedCategory.code,
  lat: pickerCoords.lat,
  lng: pickerCoords.lng,
  ...(selectedProvider ? { providerCode: selectedProvider.code } : {}),
} as Parameters<typeof api.createEvent>[0]);
```

**Mobile** `apps/mobile/components/events/event-report-modal.tsx:92-114` submit:
```ts
await api.createEvent({
  subcategoryCode: selectedCategory.code,
  title: selectedCategory.name,
  lat: region.latitude,
  lng: region.longitude,
  ...(selectedProvider ? { providerCode: selectedProvider.code } : {}),
} as Parameters<typeof api.createEvent>[0]);
```

### Concrete findings

| # | Finding | Severity | Notes |
|---|---|---|---|
| F1 | Mobile sends `title: selectedCategory.name`; web does NOT send title at all (lat/lng + subcategoryCode + optional providerCode). The api-client method signature `createEvent(body: CreateUserEventBody)` accepts whatever shape `CreateUserEventBodySchema` permits — needs check. If `title` is **required** on the schema, web's call would 422 and Filip's "couldn't create" might be a web vs mobile asymmetry. If `title` is optional/derived, no impact. | Unknown until schema checked | Verify `node_modules/@notifio/shared/dist/schemas/user.d.ts` `CreateUserEventBodySchema` — see Q5 in §12. |
| F2 | Both call `as Parameters<typeof api.createEvent>[0]` — this is a TS escape hatch hiding type mismatches between the local body literal and api-client's `CreateUserEventBody`. The cast silences type errors that would otherwise flag F1. | Low | Audit smell. Not a runtime bug per se. |
| F3 | No `await` issues, no missing handlers, no TODO/FIXME/XXX/HACK in either file. | n/a | Clean static surface. |
| F4 | Auth wiring: api-client `request()` injects Supabase bearer token via the token callback configured in `apps/mobile/lib/api.ts` / `apps/web/src/lib/api.ts` at app init. Both screens render only when session exists (per `ConsentGate` / route guard upstream). No static auth gap. | n/a | Runtime check needed if token attachment is the cause. |
| F5 | Mobile `region.latitude, region.longitude` comes from the map's currently-visible region state (passed via `initialCenter`). If the user **never moves the map**, the initial region might be undefined or stale; if `region` is null at submit time, JS throws (no null guard). Worth runtime test. | Medium | Could explain Filip's "couldn't create from mobile" if the map state was uninitialized. |
| F6 | BE may return error `success: false` with `error: …` — both modals only catch via try/catch and show generic toast (`eventReport.error`). If BE 4xx with descriptive body, user gets no specifics. Not a creation-failure root cause, but masks diagnostics. | Low | Improvement opportunity, not a bug. |

### Verdict

**No definitive static bug found.** F1 (title field asymmetry) and F5 (mobile region state) are the strongest leads. Phase 0 cannot prove either is the cause without a runtime repro from Filip. **Phase 1 does not fix per plan §0.8.** Findings documented for a separate fix prompt.

---

## 9. Empty state design

### Mobile current

```
<EmptyState icon={IconAlertTriangle} message={t('reminders.tabs.eventsEmpty')} />
```
- Icon: `IconAlertTriangle` — wrong semantic for an empty user-events state (alert/warning icon)
- Message: "Žiadne nahlásené udalosti" — single line, no subtitle, no CTA

### Web current

```
<IconAlertTriangle size={32} className="mx-auto text-muted" />
<p className="mt-2 text-sm text-muted">{t('myEvents.empty')}</p>
```
- Same `IconAlertTriangle` issue
- Message: "Zatiaľ ste nenahlásili žiadne udalosti" — single line, no CTA

### Proposed redesign (per plan)

| Element | Value |
|---|---|
| Icon | `IconMapPin` or `IconMessage2` from Tabler — represents "tap the map to add a report". `IconMapPin` recommended (creation flow IS the map). |
| Title | `localEmpty.noReports.title` |
| Subtitle | `localEmpty.noReports.subtitle` |
| CTA button | label `localEmpty.noReports.openMap` → navigates to map tab/route |

### 6-locale strings to ship (in local i18n with TODO marker)

| Key | sk | en | cs | de | hu | uk |
|---|---|---|---|---|---|---|
| `localEmpty.noReports.title` | Žiadne hlásenia | No reports yet | Žádná hlášení | Keine Meldungen | Nincsenek bejelentések | Немає звітів |
| `localEmpty.noReports.subtitle` | Pridaj nové hlásenie z mapy | Add a new report from the map | Přidej hlášení z mapy | Füge eine Meldung über die Karte hinzu | Adj hozzá bejelentést a térképről | Додайте звіт з мапи |
| `localEmpty.noReports.openMap` | Otvoriť mapu | Open map | Otevřít mapu | Karte öffnen | Térkép megnyitása | Відкрити мапу |

Native-speaker review recommended for sk/cs/de/hu/uk (see Q1).

### Navigation target

- Web: `router.push('/map')` (Next.js App Router)
- Mobile: `router.push('/(tabs)/map')` (Expo Router)

Both apps already have a `/map` route. Verify it accepts a navigation push without params — quick grep should confirm.

---

## 10. Reminders tab quick check (bonus per plan §0.10)

| App | Has width drift? | Files |
|---|---|---|
| Web | NO — RemindersSection inherits parent padding, no internal `px-*` overrides | n/a |
| Mobile | **YES — same `paddingHorizontal: SPACING.screenH` bug** | `reminders-tab-content.tsx` (toggleRow), `reminder-list.tsx` (FlatList list contentContainerStyle) |

Mobile Reminders fix is identical to MyEventsList — drop the redundant `paddingHorizontal: SPACING.screenH`. Plan §1.5 says bundle this fix. No filter changes to Reminders in this batch.

Note: there may also be a `reminder-calendar-view.tsx` on mobile (mirror of web's calendar variant). Phase 1 will check that file too and apply the same fix if the same bug exists.

---

## 11. Open questions for Filip — Phase 1 blockers / defaults

| # | Question | Recommended default |
|---|---|---|
| Q1 | **Locale translations**: are sk/en/cs/de/hu/uk strings in §2 + §9 acceptable, or send to a translator? Particular concern: uk `"Повідомлення"` overlaps with shared's `nav.notifications` = "Сповіщення" — suggest `"Звіти"` instead. | Use the audit's drafts. Filip flags any that read wrong; ship and let runtime feedback drive corrections. |
| Q2 | **Mine vs All scope**: option A (Mine-only, plan §1.2 fall-back path), B (full Mine/All wiring — half-day expansion), C (toggle as UI, defer All wiring). | **A** — strict scope discipline. Document All as a follow-up. |
| Q3 | **Lifecycle filter on Mine-only events**: 2 tabs (Active / Resolved) or 4 (with Plánované always-empty + Všetky)? | 4 tabs **only if** we also ship All-mode wiring (which we won't per Q2). Otherwise 2 tabs — Aktívne / Ukončené (+ optional Všetky meaning "regardless of resolved"). Cleaner default: **3 tabs (Aktívne / Ukončené / Všetky)** — clearly maps to Mine semantics, parity with web's button layout. |
| Q4 | **Category filter on Hlásenia**: include (with dynamic `/events/categories` list) or skip for this batch? | **Skip** — bottom sheet has scope-only (or, with Q2=A, nothing at all besides Close). Lower complexity, ships faster. |
| Q5 | **Creation-flow audit findings (F1/F5)**: do you want Phase 0 to also fetch + paste `CreateUserEventBodySchema` to confirm whether `title` is required? Plan said no fix; if F1 is a real schema mismatch it's a one-line fix. Bundle or defer? | **Defer.** Audit-only this batch per plan §0.8. Phase 1 stays scoped to redesign + width. |
| Q6 | **Filter row reuse strategy**: extract a shared FE primitive (effort) or duplicate the lifecycle-strip + filter-icon JSX into MyEventsList (less effort, ~30 LOC dup)? | **Duplicate.** Plan said either is fine; duplication is the lower-risk option for a single-screen reuse. |
| Q7 | **What does the bottom sheet contain on mobile if we go Q2=A + Q4=skip?** Effectively nothing — just a "Filter" icon button that opens an empty sheet. Should the icon button hide entirely when there's nothing to filter? | **Hide the filter icon button when there's nothing to filter.** Skip the sheet entirely on Hlásenia until either scope (Q2=B) or category (Q4=ship) lands. Lifecycle strip stays inline regardless. |

**Hard blockers**: none. All recommended defaults converge to a smaller-than-plan Phase 1 that nonetheless lands the visible deliverables (tab rename, lifecycle strip, empty state with CTA, width parity fix).

---

## 12. Scope-shrink recap with recommended defaults

If Filip green-lights the recommended defaults, Phase 1 ships:

**Tab rename + i18n**:
- Web: new local namespace `localTabs.*` and `localEmpty.*` keys in 6 locales; call-site repoint for events tab + new empty state.
- Mobile: add `MOBILE_OVERRIDES` merge layer in `lib/i18n.ts`; same 6-locale keys.

**Width parity (mobile only)**:
- Drop `paddingHorizontal: SPACING.screenH` from `my-events-list.tsx`, `reminders-tab-content.tsx`, `reminder-list.tsx`, plus `reminder-calendar-view.tsx` if affected.

**Filter row redesign**:
- Web + mobile: add 3-tab lifecycle strip (Aktívne / Ukončené / Všetky) above the events list. Wire client-side filter via `isResolved` (true/false/none).
- **No filter icon button, no bottom sheet** on Hlásenia until Q2 / Q4 land.

**Empty state**:
- Replace current `IconAlertTriangle` + flat message with `IconMapPin` + title + subtitle + CTA → `/map`.

**Creation bug**: documented, not fixed.

If Filip overrides any defaults (especially Q2=B Mine/All), Phase 1 scope expands accordingly.

---

## End-of-Phase-0 report

- **Latest commit SHA on branch:** `b3e6197`
- **Web events sub-tab path:** `apps/web/src/app/(app)/profile/events-section.tsx` (rendered from `notifications/page.tsx:52-55`)
- **Mobile events sub-tab path:** `apps/mobile/components/events/my-events-list.tsx` (rendered from `alerts.tsx:84`)
- **BE Scope filter param available:** **NO** — Mine and All are separate endpoints (`/events/mine` vs `/events?lat&lng&radius`), not a toggle.
- **BE Lifecycle filter param available:** **NO** — client-side filter only. Mine has `isResolved` boolean (2-state); All has `status` enum (3-state). Asymmetric.
- **Category filter applicable:** Technically yes via `/events/categories`, but recommend skip this batch (Q4).
- **Width drift on Hlásenia tab:** Web NO, Mobile **YES +16pt** (same `b3e6197` bug pattern, fix scope: 1 file)
- **Width drift on Reminders tab:** Web NO, Mobile **YES +16pt** (same bug, 2-3 files)
- **Report creation bugs found:** **0 definitive** (F1 title-field asymmetry + F5 mobile region-state are leads, runtime repro needed; documented, not fixed)
- **Local i18n file paths:** Web `apps/web/messages/{sk,en,cs,de,hu,uk}.json` (already exist, mostly empty). Mobile NONE — needs `MOBILE_OVERRIDES` merge layer added in `apps/mobile/lib/i18n.ts`.
- **Blockers requiring Filip's call:** Q1–Q7 in §11. None hard — recommended defaults can run.

**STOP. Awaiting Filip's resolutions on Q1–Q7 (especially Q2 scope mode + Q3 lifecycle tab count + Q7 filter icon hide) before Phase 1.**
