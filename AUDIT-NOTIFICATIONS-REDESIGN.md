# AUDIT — Notifications screen redesign (web + mobile)

| Field | Value |
|---|---|
| Branch | `feat/notifications-filter-redesign` (based on `development`) |
| Base commit | `f9d073c` |
| Date | 2026-05-19 |
| Shared package version | installed `@notifio/shared@1.14.0` — root pin `^1.11.0` (stale, see §10 blocker B5) |
| Stage | Phase 0 (read-only) — Phase 1 STOPS until Filip green-lights |

---

## 1. Component & file inventory

### Web (`apps/web/`)

| Role | Path | Key facts |
|---|---|---|
| Notifications route | `apps/web/src/app/(app)/notifications/page.tsx` | Renders `<h1>{t('title')}</h1>` ("Notifikácie") + 3 sub-tabs (`history / events / reminders`) using dynamic `t(\`tabs.${tab}\`)` interpolation. Active tab marked with orange underline. |
| History list section | `apps/web/src/app/(app)/notifications/history-section.tsx` | Hosts both filter pill rows in a single parent `<div className="mt-6">` — lifecycle row L124-139, category row L141-156. |
| Alert card | `apps/web/src/components/app/alert-card.tsx` | Outer `<button>` L93 wraps inner vote `<button>`s L182 + L190. Confirmed nesting (§6). |

Verbatim filter-row excerpt (`history-section.tsx:122-157`):
```tsx
<div className="mt-6">
  {/* Lifecycle chips */}
  <div className="mb-2 flex flex-wrap gap-1.5">
    {LIFECYCLE_OPTIONS.map((key) => (
      <button key={key} onClick={() => setLifecycle(key)}
        className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          lifecycle === key ? 'bg-accent text-white'
            : 'border border-border text-text-secondary hover:text-text-primary')}>
        {t(`lifecycle.${key}`)}
      </button>
    ))}
  </div>
  {/* Category pills */}
  <div className="flex flex-wrap gap-1.5">
    {['all', ...CATEGORY_FILTERS.map((f) => f.key)].map((key) => (
      <button key={key} onClick={() => setActiveFilter(key)}
        className={cn('rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
          activeFilter === key ? 'bg-accent text-white'
            : 'border border-border text-text-secondary hover:text-text-primary')}>
        {t(`filters.${key}`)}
      </button>
    ))}
  </div>
</div>
```

### Mobile (`apps/mobile/`)

| Role | Path | Key facts |
|---|---|---|
| Alerts screen route | `apps/mobile/app/(tabs)/alerts.tsx` | Renders `<ScreenHeader title={t('screens.alerts.title')}/>` ("Upozornenia") + 3 sub-tabs using `TABS` array referencing `reminders.tabs.{history,events,reminders}`. Tabs are conditional content on same screen (not separate Expo Router routes). |
| Filter row | `apps/mobile/components/alerts/alert-list.tsx:88-119` | Single row: left "Filter" button (`IconAdjustments` + `t('alerts.filter')` + badge) opens bottom sheet for status; right is `ScrollView horizontal` of `TogglePill` for category. |
| Filter sheet (status) | `apps/mobile/components/alerts/filter-sheet.tsx` | `STATUS_OPTIONS` = `[active, upcoming, ended, all]` — internal value `ended` (BE mapping to `resolved` in `alert-list.tsx:63`); `upcoming` labelKey is `alerts.upcoming` which **does not exist in shared** (see §2 critical gap). |
| Alert card | `apps/mobile/components/alerts/alert-card.tsx` | Outer `<Card onPress={...}>` is conditionally a `Pressable` (per `card.tsx`). Inner vote buttons are nested `Pressable`s. RN allows but touch dispatch can be subtle. |

### UI primitives discovery

**Web** (`apps/web/src/components/ui/`):
- ✅ `searchable-select.tsx` — custom keyboard-accessible dropdown (used only by `event-report-modal`). Generic `<SearchableSelect value onChange options getLabel getKey>` API. Reusable as the category dropdown trigger.
- ✅ `cluster-pins-sheet.tsx` (in `components/app/`) — **viewport-responsive modal/drawer pattern**: ≥640px centered modal, <640px slide-up drawer from bottom. ESC handler, body-scroll lock, backdrop click. Template for the filter drawer.
- ❌ **No `@radix-ui/*`, no `Sheet`, no `Popover`, no `DropdownMenu`, no `Dialog`.** No shadcn install. No `headlessui`.
- Modal components exist (`upsell-modal`, `consent-modal`, `event-report-modal`, `location-modal`, `reminder-form-modal`) — all custom one-offs, no shared modal primitive.

**Mobile** (`apps/mobile/components/ui/`):
- ✅ `bottom-sheet.tsx` — **custom implementation, not `@gorhom/bottom-sheet`**. `Modal transparent` + `Pressable` backdrop + `PanResponder` swipe-to-dismiss (threshold 80px or velocity > 0.6). Supports header + scrollable body. Already used by `filter-sheet.tsx`.
- ✅ `TogglePill` (used in `alert-list.tsx:110-117`) — chip primitive.
- Icon library: `@tabler/icons-react-native`. `IconAdjustments` already used as filter icon.

**Tailwind breakpoints (web):**
- `apps/web/tailwind.config.*` — file does not exist. Tailwind v4 with inline `@theme` in `globals.css`, no `screens` override.
- Defaults apply: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`, `2xl: 1536px`.

---

## 2. i18n key migration table (no new strings rule enforced)

**Source of truth**: all listed `notificationsPage.*`, `alerts.*`, `notificationType.*`, `notificationSeverity.*`, `tabs.*`, `nav.*`, `screens.*`, `reminders.*` keys live in `node_modules/@notifio/shared/dist/i18n/{sk,en,cs,de,hu,uk}.json`. Web's `apps/web/messages/{locale}.json` files are effectively empty (only `auth.signInWith`, `nav.weather`, `pollen.title/noData`); shared wins on overlap. Mobile has **no local locale files at all** — 100 % of mobile i18n is `getSharedMessages(locale)` per `apps/mobile/lib/i18n.ts:16-20,28-34`. Mobile falls back en → sk for missing keys.

### Verified state (probed directly via Node + the live shared JSON)

| Required label | Slovak | Web current key | Mobile current key | Recommended key (Phase 1) | All 6 shared locales? | Action |
|---|---|---|---|---|---|---|
| Notifikácie (renamed tab) | "Notifikácie" | `notificationsPage.tabs.history` ("História") | `reminders.tabs.history` ("História") | `tabs.alerts` ("Notifikácie") OR `nav.notifications` ("Notifikácie") — either exists | ✅ both keys all 6 | MOVE (call-site repoint) |
| Aktívne (lifecycle) | "Aktívne" | `notificationsPage.lifecycle.active` | `alerts.active` | KEEP per app | ✅ both keys all 6 | KEEP |
| Plánované (lifecycle) | "Plánované" | `notificationsPage.lifecycle.upcoming` ✅ | **`alerts.upcoming`** ❌ MISSING all 6 — mobile renders raw string today | mobile repoint to `notificationsPage.lifecycle.upcoming` | shared web key ✅ all 6; mobile alerts key absent | **COPY (call-site repoint, no new strings)** |
| Ukončené (lifecycle) | "Ukončené" | `notificationsPage.lifecycle.resolved` ("Ukončené") | `alerts.ended` ("Ukončené") | KEEP per app — both yield same Slovak | ✅ both keys all 6 | KEEP |
| Všetky (lifecycle "all") | "Všetky" | `notificationsPage.lifecycle.all` | `alerts.all` | KEEP per app | ✅ both keys all 6 | KEEP |
| Všetky kategórie (dropdown trigger) | "Všetky" | `notificationsPage.filters.all` ("Všetky") | `alerts.filters.all` ("Všetko") | KEEP — see Q1 (web "Všetky" vs mobile "Všetko") | ✅ both keys all 6 | KEEP (with naming wart noted) |
| Počasie/Doprava/Výpadky/Peľ | per | `notificationsPage.filters.{weather,traffic,outages,pollen}` | `alerts.filters.*` | KEEP per app | ✅ both keys all 6 | KEEP |
| Udalosti | "Udalosti" | `notificationsPage.tabs.events` | `reminders.tabs.events` | KEEP per app | ✅ both keys all 6 | KEEP |
| Pripomienky | "Pripomienky" | `notificationsPage.tabs.reminders` | `reminders.tabs.reminders` | KEEP per app | ✅ both keys all 6 | KEEP |
| Filter (mobile trigger label) | "Filter" | n/a (no current "Filter" text on web) | `alerts.filter` | KEEP mobile | ✅ all 6 | KEEP |
| DNES | "Dnes" | `notificationsPage.history.today` | — (mobile feed has no day-grouping today) | KEEP web only | ✅ all 6 | KEEP (web-only by design — see Q5) |
| VČERA | "Včera" | `notificationsPage.history.yesterday` | — | KEEP web only | ✅ all 6 | KEEP |
| STARŠIE | "Staršie" | `notificationsPage.history.older` | — | KEEP web only | ✅ all 6 | KEEP |

### Counts

| Action | Count |
|---|---|
| KEEP | 11 |
| MOVE (call-site repoint, web tab rename) | 1 |
| **COPY** (call-site repoint, mobile `alerts.upcoming` → `notificationsPage.lifecycle.upcoming`) | 1 |
| MISSING (no shared key, blocker) | 0 |
| LOCALE-GAP | 0 |

### Critical confirmation re: `alerts.upcoming`

Direct probe of all 6 shared locale JSONs:
```
sk: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Plánované
en: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Upcoming
cs: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Plánované
de: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Geplant
hu: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Tervezett
uk: alerts.upcoming=MISSING | notificationsPage.lifecycle.upcoming=Заплановані
```
Today mobile's filter sheet button for `upcoming` displays the literal text `alerts.upcoming` (i18next falls through en→sk, both miss, falls back to the key string). **Bug surfaced for free by this audit.** Fix path with no new strings: repoint `STATUS_OPTIONS` `'upcoming'` row's `labelKey` to `notificationsPage.lifecycle.upcoming`.

### Verdict per plan §0.2 rule

All required Slovak labels exist somewhere in shared with all 6 locales translated. **No `MISSING` rows. No `LOCALE-GAP` rows.** The `COPY` action for `alerts.upcoming` is a pure call-site repoint — zero new strings written to any locale file, fully compliant with the rule.

---

## 3. BE per-lifecycle counts — drop from mobile design

Inspected `node_modules/@notifio/shared/dist/notifications/schemas.d.ts` directly.

`PaginatedNotifications` envelope shape:
```ts
{ items: NotificationHistoryItem[]; page: number; limit: number; total: number; }
```

**No `counts: { active, upcoming, resolved, all }` field.** The envelope carries only the aggregate `total`. Per-lifecycle counts would require either:
1. Three separate API calls (one per status) — wasteful, breaks `useNotificationHistory` flow.
2. Client-side derivation from the current page's `items[].eventStatus` — inaccurate across pagination.
3. BE addition — out of scope (shared bump, BE work).

**Decision: drop counts from mobile design.** Phase 1 implements horizontally-scrolling lifecycle tabs without count badges.

---

## 4. Drawer / sheet pattern discovery

### Web small-viewport drawer
- **No** `Sheet` component, **no** `@radix-ui/react-dialog`, **no** shadcn dialog.
- **Existing template:** `apps/web/src/components/app/cluster-pins-sheet.tsx` already implements the **exact pattern this redesign needs**: viewport-responsive (≥640px centered modal, <640px bottom slide-up drawer), with backdrop, ESC handler, body-scroll lock, click-outside close. Was written for a different feature (clustered map pins) but is repurposable.
- **Recommendation:** Use `cluster-pins-sheet.tsx` as a **structural template** — copy the modal/drawer scaffold into a new `notification-filter-sheet.tsx` (or similar) with the filter UI. Do not depend on it directly (different domain). No new library needed.
- **Side-drawer-from-right specifically** (plan asked for right-side drawer, not bottom): cluster-pins-sheet slides from bottom. Sliding from right needs minor `transform: translateX` swap; trivial Tailwind change. Flag to Filip (Q3): is bottom drawer (matching cluster-pins-sheet) acceptable, or must it slide from right?

### Mobile bottom sheet (category picker)
- **`@gorhom/bottom-sheet` not installed.** Confirmed via package.json grep.
- **Existing custom `BottomSheet`** at `apps/mobile/components/ui/bottom-sheet.tsx`: `Modal transparent`, swipe-to-dismiss via `PanResponder`, optional header with X close, scrollable body option. Already used by `filter-sheet.tsx` (status picker). **Directly reusable** for the category picker — same pattern, new content.
- No flag. Phase 1 can confidently land mobile category bottom sheet.

---

## 5. Tab rename impact + page-title hierarchy

### 5.1 Web tab rename

Single grep target: `notificationsPage.tabs.history` referenced **only** at one indirect call site (`apps/web/src/app/(app)/notifications/page.tsx:37` — `t(\`tabs.${tab}\`)` with `tab='history'`). Internal type `Tab = 'history' | 'events' | 'reminders'` cascades through the file but never leaves it.

**Two strategies:**

| Strategy | Pros | Cons |
|---|---|---|
| A. **Rename key value** (change `notificationsPage.tabs.history` from "História" to "Notifikácie" in all 6 shared locales) | Single-source change, no FE refactor | **VIOLATES "no shared bump" constraint** — shared package edit. Disqualified. |
| B. **Repoint call site** to an existing key (e.g. `tabs.alerts` = "Notifikácie" or `nav.notifications` = "Notifikácie") | No shared edit, zero new strings, single-line code change | Mixes namespaces — `t('tabs.alerts')` from inside `useTranslations('notificationsPage')` doesn't work; need a second `useTranslations()` call or the function form with full key path |

**Recommendation: Strategy B with `nav.notifications`.** Use a top-level `useTranslations()` (no namespace) and reference `'nav.notifications'` for that one button only. Cleaner than `tabs.alerts` because `tabs.*` namespace is mobile-bottom-tab semantics on shared; `nav.*` is the canonical "navigation label" namespace.

```tsx
// page.tsx — pseudocode for Phase 1
const t = useTranslations('notificationsPage');
const tNav = useTranslations('nav');
…
{tab === 'history' ? tNav('notifications') : t(`tabs.${tab}`)}
```

### 5.2 Mobile tab rename

Symmetric situation. Mobile's `TABS` array (`alerts.tsx:19-23`) maps `'history'` → `reminders.tabs.history` ("História"). Repoint that one entry to `nav.notifications` (or `tabs.alerts`).

**Caveat: mobile bottom-nav already uses `tabs.alerts` = "Notifikácie"** as the bottom-tab label that leads to this screen. Renaming the in-screen sub-tab to "Notifikácie" creates **bottom-tab "Notifikácie" + page sub-tab "Notifikácie"** double-labeling. See Q4 — same family of problem as web's h1-vs-tab conflict.

### 5.3 Page-title-vs-tab conflict (web)

- Page renders `<h1 className="text-2xl font-bold">{t('title')}</h1>` ("Notifikácie") at `page.tsx:22`.
- If sub-tab #1 also reads "Notifikácie", DOM shows the word twice in adjacent rows. Visually jarring on max-w-2xl container at mobile.

**Three resolution options (Filip to pick — Q4):**

| Option | What changes |
|---|---|
| W1. **Drop the h1** (rely on tab bar as page heading) | Removes redundancy. Page becomes denser, no breadcrumb. |
| W2. **Shrink h1 to "eyebrow"** (small uppercase muted text e.g. "NOTIFIKÁCIE • PREHĽAD") | Keeps a heading element but visually demotes it. |
| W3. **Keep h1, rename tab to something else** (e.g. "Aktívne" / "Upozornenia" — but those are taken / wrong semantics) | Avoids redundancy but contradicts the design's stated intent. |

Recommendation: **W1 (drop h1)** — cleanest for the redesign; visual hierarchy = tab bar carries the page identity, content area carries the lifecycle filter.

### 5.4 Page-title-vs-tab conflict (mobile)

- `ScreenHeader title={t('screens.alerts.title')}` = "Upozornenia". Sub-tab renamed to "Notifikácie" via Q4 resolution. Different words → no semantic clash, but conceptually overlapping ("alerts" vs "notifications"). Mobile bottom-tab in `(tabs)/_layout.tsx` is `tabs.alerts` = "Notifikácie". So user navigates from bottom-nav "Notifikácie" → screen header "Upozornenia" → sub-tab "Notifikácie".
- Filip to call (Q4): keep this triple-labeling, or rename `screens.alerts.title` (out of scope — shared edit), or drop the ScreenHeader title entirely on this screen?

---

## 6. Button-in-button — confirmed (web only)

### Web `alert-card.tsx` (verbatim, lines 92-145 condensed)

```tsx
return (
  <button onClick={handleClick} className="…" style={{…}}>            ← OUTER
    <div className="flex min-w-0 flex-1 gap-3 p-3">
      <div>…icon…</div>
      <div className="min-w-0 flex-1">
        <p>…title…</p>{notification.body && <p>…body…</p>}
        <div>…severity + category + time badges…</div>
        {isCommunity && !resolved && (
          <div className="mt-2 flex … border-t pt-2">
            <span>…stillHappening…</span>
            <div className="flex items-center gap-3">
              <button onClick={(e) => handleVote(true, e)} …>           ← INNER 1
                <IconCheck />{te('confirm')}
              </button>
              <button onClick={(e) => handleVote(false, e)} …>          ← INNER 2
                <IconX />{te('deny')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </button>                                                              ← OUTER close
);
```

**Confirmed** outer `<button>` (L93) contains two inner `<button>`s (L182, L190) at 4-level DOM depth. Next.js 15 React 19 throws hydration error per the trace Filip shared (L189 = inner vote button). `handleVote` stops propagation via `e.stopPropagation()` at L62 — runtime works, but the DOM is still invalid HTML and the React reconciler complains.

**Fix in Phase 1 §1.1.9–10**: outer becomes `<div role="button" tabIndex={0} onClick onKeyDown>`, inner buttons keep `stopPropagation()` (already correct).

### Mobile `alert-card.tsx` — Pressable nesting documented, not a bug

Outer `Card` (`apps/mobile/components/ui/card.tsx`) conditionally wraps children in `Pressable` when `onPress` is provided. Vote buttons inside are also `Pressable`. RN allows nested Pressables; the runtime hands the responder to the innermost. Vote buttons are `disabled={voted !== null || voting}` which gracefully cedes the responder after voting completes. No console warning emitted in standard Hermes. **Document, do not change.** Plan §1.2.8 fallback ("if RN doesn't warn, leave alone") applies.

---

## 7. Visual hierarchy notes

### Web option A target layout

Current parent at `history-section.tsx:122`:
```html
<div className="mt-6">
  <div className="mb-2 flex flex-wrap gap-1.5">[lifecycle pills]</div>
  <div className="flex flex-wrap gap-1.5">[category pills]</div>
</div>
```

Target:
```html
<div className="mt-6 flex flex-wrap items-center gap-3">
  [SegmentedControl: 4 lifecycle options]
  [CategoryDropdownTrigger: button + chevron]
</div>
```

Children swap from `flex-wrap gap-1.5` (pill rows) to `flex items-center gap-3` (segmented control + dropdown side-by-side). Single row on `sm+` (640+). Below `sm`: collapse to single "Filter" button opening the drawer (per §4 / cluster-pins-sheet template). No restructuring needed outside this `<div className="mt-6">` block — adjacent `mt-5` notification list stays at L160 unchanged.

### Mobile option 3 target layout

Current row at `alert-list.tsx:88-119`:
```jsx
<View style={styles.filterTopRow}>
  <Pressable>…Filter button + badge…</Pressable>
  <ScrollView horizontal>…category TogglePills…</ScrollView>
</View>
```

Target:
```jsx
<View style={styles.filterTopRow}>
  <ScrollView horizontal>…lifecycle text-tabs (Aktívne / Plánované / Ukončené / Všetky)…</ScrollView>
  <Pressable>…Filter icon button (no text, opens category sheet)…</Pressable>
</View>
```

Direction-swap of children + replace category chips with lifecycle tabs + replace text-Filter-button with icon-only filter button. `ScrollView horizontal showsHorizontalScrollIndicator={false}` already exists in the file (same construct used for category chips today) — proven pattern. `IconAdjustments` already imported. No new dependencies.

---

## 8. Mobile screen-width parity (§0.8 — observation only, no fix)

All three audited screens (`(tabs)/index.tsx` Prehľad, `(tabs)/weather.tsx` Počasie, `(tabs)/alerts.tsx` Notifikácie) wrap in `<ScreenLayout>` which applies `commonStyles.screenPadding = { paddingHorizontal: theme.spacing.xl }` (= 16pt) uniformly. No `maxWidth`. Difference: Prehľad/Počasie use `scrollable` prop → ScreenLayout supplies a `<ScrollView>`; Alerts does NOT use `scrollable` because `AlertList` manages its own `FlatList` scroll. **No horizontal-width parity issue.** Vertical scroll containers differ but that's correct given list-vs-scroll semantics.

---

## 9. Branch base & overlap risk (NEW — Filip should be aware)

This batch was branched from `development` per plan instruction. `development` does **not** yet contain the previous PR's commits (`fix/notifications-screen-batch` — still local + open as PR). That PR touches **the same files** this redesign rewrites:

- `apps/web/src/app/(app)/notifications/history-section.tsx` (last PR rewired error state, dropped isRead, repointed `markAllRead`→`loadMore`)
- `apps/web/src/components/app/alert-card.tsx` (last PR replaced `isResolved()` call, applied severity normalizer)
- `apps/web/src/hooks/use-notification-history.ts` (last PR dropped `activeOnly`, fixed polling)
- `apps/mobile/components/alerts/alert-list.tsx` (last PR overrode `resolved` at renderItem, fixed `keyExtractor`, error state, tab rename `ended`→`resolved`)
- `apps/mobile/components/alerts/filter-sheet.tsx` (last PR already renamed `'ended'` → `'resolved'` in mobile internal types + repointed label to `notifications.eventStatus.resolved`)
- `apps/mobile/hooks/use-notification-history.ts` (last PR dropped `activeOnly`, fixed polling)
- `apps/mobile/components/alerts/alert-card.tsx` (last PR applied severity normalizer)
- `packages/api-client/package.json` + root `package.json` (last PR bumped shared pin to `^1.14.0`)

**Phase 1 will edit the pre-fix versions of these files** unless this branch is rebased on top of the previous PR's branch. After both PRs land sequentially, conflicts are likely. Filip should call:
- (i) accept the overlap, resolve conflicts when merging Phase 1 PR after Phase 0's previous PR; OR
- (ii) rebase this branch onto `fix/notifications-screen-batch` before Phase 1 starts; OR
- (iii) merge previous PR first, then rebase before Phase 1.

Recommendation: **(iii)**. Cleanest for review.

Side effect: this audit notes a few "bugs" the previous PR already fixes (e.g. `'ended'` internal symbol on mobile). After rebase those won't appear in the Phase 1 diff because they've already been resolved upstream.

---

## 10. Blockers for Phase 1 — Filip's calls needed

| # | Question | Recommended default |
|---|---|---|
| Q1 | **"Všetky" wart**: web's `notificationsPage.filters.all` = "Všetky" but mobile's `alerts.filters.all` = "Všetko" (different Slovak word). Both translate "all". Acceptable cross-app inconsistency, or repoint mobile to web's key? | Accept the inconsistency. Repointing means crossing namespaces just for one string — overengineered. |
| Q2 | **Filter drawer direction (web)**: plan asks for right-side slide. `cluster-pins-sheet` template slides from bottom. Right-side adds a tweak (`translate-x` instead of `translate-y`). Approve right-side? | Right-side — matches plan intent. |
| Q3 | **Web tab-rename strategy**: repoint sub-tab `history` to `nav.notifications` ("Notifikácie") via second `useTranslations()`. OK or prefer `tabs.alerts`? | `nav.notifications` (semantically purest). |
| Q4 | **Page-title-vs-tab conflict**: web drops h1 (W1) / shrinks to eyebrow (W2) / picks different tab label (W3). Mobile triple-labeling (bottom-tab + screen header + sub-tab): keep as-is / drop screen header / different sub-tab label? | Web W1 (drop h1). Mobile: keep as-is for now; "Upozornenia" vs "Notifikácie" reads as different layers (header vs tab) so triple-labeling isn't strictly redundant. |
| Q5 | **Mobile day-grouping**: plan §0.2 lists DNES/VČERA/STARŠIE under required labels. Mobile feed currently has no day-grouping. Add it to mobile in Phase 1 (in-scope creep), or strict mobile = option-3-as-specified (lifecycle tabs + filter icon, no day grouping)? | Strict option-3. Add day-grouping later if Filip asks; not in this redesign's scope. |
| Q6 | **`alerts.upcoming` fix**: confirmed broken today (shows literal `alerts.upcoming` text on mobile filter sheet). Repoint to `notificationsPage.lifecycle.upcoming`. Mixes namespaces on mobile (existing pattern: `alerts.active/.ended/.all` + new `notificationsPage.lifecycle.upcoming`). OR migrate all 4 mobile lifecycle labels to `notificationsPage.lifecycle.*` for namespace purity. | Migrate all 4 to `notificationsPage.lifecycle.*` — consistent, fixes the broken key, no new strings. |
| Q7 | **Mobile Pressable nesting**: documented in §6, RN allows it, no warning. Leave alone (per plan §1.2.8 fallback)? | Leave alone. |
| Q8 | **Branch base / overlap risk (§9)**: accept the overlap / rebase onto previous PR's branch / merge previous PR first then rebase? | Merge previous PR first, then rebase. |
| Q9 | **Brand colors**: plan §1.1 inlines `#0E223F`, `#162D4F`, `#FF7A2F`, `#1A3254`, `#0B1B32`. Web today uses CSS variables (`bg-accent`, `bg-card`, `text-text-primary`) defined in `globals.css`. Inlining HEX literals bypasses the variable system and breaks light/dark theming. Inline anyway (as plan says) or use the existing CSS vars? | Use existing CSS vars (`bg-card`, `bg-accent`, `text-text-primary`, etc.) — they map to the brand HEX values already in `globals.css` and preserve theming. |

**Hard blocker**: none. All required Slovak strings exist in shared with full 6-locale coverage; all UI primitives have working templates or existing components. Phase 1 can land entirely without shared/library changes if Filip approves the recommended defaults above.

---

## 11. End-of-Phase-0 report

- **Web page route**: `apps/web/src/app/(app)/notifications/page.tsx`
- **Mobile screen path**: `apps/mobile/app/(tabs)/alerts.tsx`
- **i18n**: COPY 1 (mobile `alerts.upcoming` → `notificationsPage.lifecycle.upcoming`) / MOVE 1 (web tab key repoint) / DELETE 0 / MISSING 0 / LOCALE-GAP 0
- **Counts in mobile sub-tabs**: **drop** (no BE field, three-call workaround rejected)
- **Drawer components**: web → `cluster-pins-sheet.tsx` as structural template; mobile → existing `BottomSheet` reused
- **Button-in-button confirmed**: web only (Next 15 hydration). Mobile Pressable nesting present but RN-OK.
- **Page-title-vs-tab conflict on web**: yes — Filip picks W1/W2/W3 in Q4
- **Blockers for Phase 1**: Q1–Q9 above. None are hard blockers; recommended defaults can run if Filip nods.

**STOP. Awaiting Filip's resolutions on Q1–Q9 before Phase 1.**
