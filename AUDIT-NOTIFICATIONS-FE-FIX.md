# AUDIT — Notifications screen fix (web + mobile)

| Field           | Value                                                       |
| --------------- | ----------------------------------------------------------- |
| Branch          | `fix/notifications-screen-batch` (based on `development`)   |
| Base commit     | `f9d073c`                                                   |
| Date            | 2026-05-18                                                  |
| Shared version  | `@notifio/shared@1.14.0` (installed; root pin `^1.14.0`)    |
| api-client pin  | `^1.11.0` ⚠ (still stale, see open question Q5)             |
| Stage           | 1 (read-only audit) — Stage 2 STOPS until Filip green-lights |

---

## 1. File path inventory

### Web (`apps/web/`)

| Role                              | Path                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| Notifications page route          | `apps/web/src/app/(app)/notifications/page.tsx`                     |
| List section component            | `apps/web/src/app/(app)/notifications/history-section.tsx`          |
| `useNotificationHistory` hook     | `apps/web/src/hooks/use-notification-history.ts`                    |
| Alert card                        | `apps/web/src/components/app/alert-card.tsx`                        |
| Lifecycle + category chips        | inline in `history-section.tsx` (no dedicated component)            |
| `CATEGORY_FILTERS` + `matchesFilter` | top of `history-section.tsx` (L18–38)                            |

Notes
- Page route lives directly under `(app)/notifications/`; **no `[locale]` segment** (web uses next-intl middleware-based locale, not URL prefix here).
- Filter chips are inline buttons; no shared `FilterChip` component.

### Mobile (`apps/mobile/`)

| Role                              | Path                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| Alerts/notifications screen       | `apps/mobile/app/(tabs)/alerts.tsx`                           |
| `useNotificationHistory` hook     | `apps/mobile/hooks/use-notification-history.ts`               |
| `AlertList` component             | `apps/mobile/components/alerts/alert-list.tsx`                |
| Alert card                        | `apps/mobile/components/alerts/alert-card.tsx`                |
| Filter sheet (status + chips)     | `apps/mobile/components/alerts/filter-sheet.tsx`              |
| `notificationToCard` adapter call | `alert-list.tsx:7,76`                                         |
| `STATUS_OPTIONS` / `TabFilter`    | `filter-sheet.tsx:8,10–15` + `alert-list.tsx:18`              |

---

## 2. i18n key migration table

Plan's canonical namespace split:
- **`notifications.*`** — alert-card content (badge label, severity label, category label, lifecycle pill, vote CTAs), filter-chip labels, "load more" / "retry" actions.
- **`notificationsPage.*`** — page header, page-level tabs, section titles, empty states phrased as page-level, screen-only chrome.

Notation: **KEEP** stays as-is. **MOVE → x.y** rename. **DELETE** remove (dead). **REVIEW** needs Filip's call.

### Web

| Key                                   | App | Current ns        | Proposed                                    | Verdict |
| ------------------------------------- | --- | ----------------- | ------------------------------------------- | ------- |
| `notificationsPage.title`             | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.tabs.history`      | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.tabs.events`       | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.tabs.reminders`    | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.history.today`     | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.history.yesterday` | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.history.older`     | web | notificationsPage | —                                           | KEEP    |
| `notificationsPage.history.empty`     | web | notificationsPage | (page-level → KEEP) OR `notifications.empty`| REVIEW  |
| `notificationsPage.history.markAllRead` | web | notificationsPage | `notifications.loadMore`                  | MOVE (rename + drop old key) |
| `notificationsPage.lifecycle.active`   | web | notificationsPage | `notifications.eventStatus.active` (?)     | REVIEW  |
| `notificationsPage.lifecycle.upcoming` | web | notificationsPage | `notifications.eventStatus.upcoming` (?)   | REVIEW  |
| `notificationsPage.lifecycle.resolved` | web | notificationsPage | `notifications.eventStatus.resolved` (?)   | REVIEW  |
| `notificationsPage.lifecycle.all`      | web | notificationsPage | no clean shared equivalent                  | REVIEW  |
| `notificationsPage.filters.all`        | web | notificationsPage | per rule → `notifications.filters.*`        | REVIEW  |
| `notificationsPage.filters.weather`    | web | notificationsPage | per rule → `notifications.filters.*`        | REVIEW  |
| `notificationsPage.filters.traffic`    | web | notificationsPage | per rule → `notifications.filters.*`        | REVIEW  |
| `notificationsPage.filters.outages`    | web | notificationsPage | per rule → `notifications.filters.*`        | REVIEW  |
| `notificationsPage.filters.pollen`     | web | notificationsPage | per rule → `notifications.filters.*`        | REVIEW  |
| `notificationsPage.filters.events`     | web | notificationsPage | (chip removed)                              | DELETE  |
| `notificationType.all_clear`           | web | notificationType  | —                                           | KEEP    |
| `notificationSeverity.<severity>`      | web | notificationSeverity | —                                        | KEEP    |
| `categoryBadge.<category>`             | web | categoryBadge     | —                                           | KEEP    |
| `events.stillHappening`                | web | events            | —                                           | KEEP    |
| `events.confirm`                       | web | events            | —                                           | KEEP    |
| `events.deny`                          | web | events            | —                                           | KEEP    |

### Mobile

| Key                                   | App    | Current ns | Proposed                                | Verdict |
| ------------------------------------- | ------ | ---------- | --------------------------------------- | ------- |
| `screens.alerts.title`                | mobile | screens    | —                                       | KEEP    |
| `screens.alerts.subtitle`             | mobile | screens    | —                                       | KEEP    |
| `reminders.tabs.history`              | mobile | reminders  | —                                       | KEEP    |
| `reminders.tabs.events`               | mobile | reminders  | —                                       | KEEP    |
| `reminders.tabs.reminders`            | mobile | reminders  | —                                       | KEEP    |
| `alerts.filter`                       | mobile | alerts     | per rule → `notifications.*`            | REVIEW  |
| `alerts.filters.<cat>` (×5)           | mobile | alerts     | per rule → `notifications.filters.*`    | REVIEW  |
| `alerts.noNotifications`              | mobile | alerts     | `notifications.empty`                   | MOVE    |
| `alerts.status`                       | mobile | alerts     | per rule → `notifications.*`            | REVIEW  |
| `alerts.active` / `.upcoming` / `.ended` / `.all` | mobile | alerts | `notifications.tabs.{active,upcoming,ended,all}` | REVIEW (ended vs resolved naming clash, see Q1) |
| `notificationType.all_clear`          | mobile | notificationType | —                                 | KEEP    |
| `notificationSeverity.<key>`          | mobile | notificationSeverity | —                             | KEEP    |
| `events.stillHappening`               | mobile | events     | —                                       | KEEP    |
| `events.confirm`                      | mobile | events     | —                                       | KEEP    |
| `events.deny`                         | mobile | events     | —                                       | KEEP    |
| `events.voteError`                    | mobile | events     | —                                       | KEEP    |
| `common.done`                         | mobile | common     | —                                       | KEEP    |

### Counts

| Verdict | Web | Mobile | Total |
| ------- | --- | ------ | ----- |
| KEEP    | 12  | 11     | 23    |
| MOVE    |  1  |  1     |  2    |
| DELETE  |  1  |  0     |  1    |
| REVIEW  | 11  |  7     | 18    |

REVIEW count is high because the plan's split rule mandates a canonical `notifications.filters.*` and `notifications.lifecycle.*` / chip key set that **does not exist in shared 1.14.0**. See Q1–Q3.

---

## 3. Bugs — evidence

### Web

| # | Plan-listed bug | File:line | Still present? | Notes |
|---|---|---|---|---|
| 1 | `isRead = status !== 'sent'` inversion | `apps/web/src/app/(app)/notifications/history-section.tsx:186` | ✅ yes | `const isRead = g.item.status !== 'sent';` — inverted: a `failed` delivery is rendered as "read". |
| 2 | `markAllRead` mislabel | `history-section.tsx:212–220` | ✅ yes | Button calls `loadMore()` but uses key `notificationsPage.history.markAllRead`. No mark-as-read API call exists. |
| 3 | Polling resets to page 1 | `apps/web/src/hooks/use-notification-history.ts:69–78` | ✅ yes | `setInterval(() => { fetchPage(1, false); setPage(1); }, 60_000)` — clobbers user's pagination every minute. |
| 4 | Error state ignored | `use-notification-history.ts` exposes `error` (L18 in mobile hook); web hook signature — **need to confirm web hook exposes `error` & whether HistorySection consumes it** | ✅ partial | Web hook returns `{ items, isLoading, hasMore, loadMore }` per L98–101 of HistorySection — `error` not destructured. Hook impl needs check; if it does emit error, the section drops it. |
| 5 | Dead i18n key `notificationsPage.filters.events` | `history-section.tsx:29` (comment only) | ✅ yes | Comment marks it dead; key still in all 6 web locale files. |
| 6 | Dead `activeOnly` prop on hook | `use-notification-history.ts:13,32,95–96` | ✅ yes | Declared, destructured, used in filter logic — but no caller passes it. |

### Mobile

| # | Plan-listed bug | File:line | Still present? | Notes |
|---|---|---|---|---|
| 7 | `keyExtractor` uses volatile `${id}-${index}` | `apps/mobile/components/alerts/alert-list.tsx:131` | ✅ yes | Exact pattern: `keyExtractor={(item, index) => \`${item.id}-${index}\`}`. |
| 8 | Error state ignored | `apps/mobile/hooks/use-notification-history.ts:42,54` + `alert-list.tsx:64` | ✅ yes | Hook tracks `error` in state; `AlertList` destructures `{ items, isLoading, hasMore, loadMore, refresh }` — drops `error`. |
| 9 | Polling resets to page 1 | `apps/mobile/hooks/use-notification-history.ts:67–76` | ✅ yes | Same shape as web. |
| 10 | `activeFilterCount` ignores category chip | `apps/mobile/components/alerts/alert-list.tsx:57–58` | ✅ yes | `const activeFilterCount = tab === 'active' ? 0 : 1;` — `categoryFilter` not factored in. |
| 11 | UI label `ended` (should be `resolved`) | `apps/mobile/components/alerts/filter-sheet.tsx:8,13` + `alert-list.tsx:18,62–63` | ✅ yes | `TabFilter = 'active'\|'upcoming'\|'ended'\|'all'`; maps `ended → resolved` for API. Plan says rename UI to `resolved`. |

### New bugs surfaced during audit

| # | Bug | File:line | Note |
|---|---|---|---|
| 12 | Mobile alert-list filter chips don't actually update `categoryFilter` state | `apps/mobile/components/alerts/alert-list.tsx:110–117` | The `<TogglePill>` rendered in `CATEGORY_FILTERS.map` passes `active={categoryFilter === filter.id}` and `onRefresh={refresh}` — but no `onPress`/`onChange` that calls `setCategoryFilter(filter.id)`. The chips look interactive but don't change the filter. (Suspected — needs to verify `TogglePill` prop API; if `onRefresh` is misnamed-but-actually-onPress, then false alarm. **REVIEW.**) |
| 13 | Mobile's `categoryFilter` state has no actual list-filtering applied | `apps/mobile/components/alerts/alert-list.tsx:54,73–81` | `filtered` is used as FlatList data, but I see no code path filtering by `categoryFilter` in the excerpt — need to confirm `filtered` derivation (lines outside the audit window). Flag for verification before Stage 2 writes. |
| 14 | api-client pin lag | `packages/api-client/package.json` still `^1.11.0` while root is `^1.14.0` | Per CLAUDE.md ("Bumping `@notifio/shared`" section) this drift is the recurring problem and should be bumped in the same PR. Plan says "no shared bump in scope" — interpretation question (Q5). |
| 15 | `notificationsPage.lifecycle.*` keys present in 6 locales — at least the "resolved" string is `Ukončené` (visible in user's Slovak UI). This is the immediate user-visible symptom of the `isResolved` bug. (Not a separate bug — just confirming the surface label.) | shared `notificationsPage.lifecycle.resolved` | — |

---

## 4. Resolved-derivation plan per app

Rule (single source of truth, both apps):
```ts
const resolved = item.notificationType === 'all_clear' || item.eventStatus === 'resolved';
```
Delivery `status` (`'failed'`, `'filtered'`, etc.) is irrelevant to the badge. Title text is never parsed.

### Web — strategy (a)

`apps/web/src/components/app/alert-card.tsx` receives raw `NotificationHistoryItem` directly. Replace `const resolved = isResolved(notification);` (L48) with:

```ts
const resolved =
  notification.notificationType === 'all_clear' ||
  notification.eventStatus === 'resolved';
```

- `NotificationHistoryItem` is re-exported by `@notifio/api-client` from `@notifio/shared`. Since installed shared is 1.14.0, both `notificationType` and `eventStatus` are present on the type. **No widening cast needed.**
- Remove the `isResolved` import from the same file. Verify no other consumer in `apps/web/src/` uses it (audit confirms alert-card is the sole call site).

### Mobile — strategy (b)

Mobile's `AlertCard` reads `item.resolved` from an `AlertCardItem` (shared adapter output). The adapter `notificationToCard` calls shared's `isResolved` internally → broken transitively. The adapter doesn't expose `notificationType` / `eventStatus` on `AlertCardItem`.

Plan: at the page boundary (`apps/mobile/components/alerts/alert-list.tsx:73–81`), compute `resolved` from raw `NotificationHistoryItem` BEFORE passing to AlertCard, then override the adapter's field:

```ts
const renderItem = useCallback(
  ({ item }: { item: NotificationHistoryItem }) => {
    const card = notificationToCard(item as unknown as NotificationHistoryItemInput);
    const resolved =
      item.notificationType === 'all_clear' || item.eventStatus === 'resolved';
    return (
      <AlertCard
        item={{ ...card, resolved }}
        onPress={onAlertPress ? () => onAlertPress(item) : undefined}
      />
    );
  },
  [onAlertPress],
);
```

- Does not modify shared.
- Does not call `isResolved` directly from FE (audit confirms mobile has zero direct call sites; the leak is via the adapter — overriding the output field is the clean fix without a shared bump).
- The `as unknown as NotificationHistoryItemInput` widening cast already exists at this site (api-client / adapter input shape mismatch) — left untouched.

---

## 5. Category translator call sites

Audit confirms `categoryBeToShared` is **not currently imported anywhere** in `apps/web` or `apps/mobile`. Every category-code render site reads the raw BE field. Sites that need wrapping per plan §1.5:

### Web

| File:line | Current | Proposed |
|---|---|---|
| `apps/web/src/components/app/alert-card.tsx:48` | `getNotificationIcon(notification.category)` | `getNotificationIcon(categoryBeToShared(notification.category))` |
| `apps/web/src/components/app/alert-card.tsx:88–90` | `tcb.has(notification.category) ? tcb(notification.category) : null` | wrap `notification.category` with `categoryBeToShared` first |
| `apps/web/src/components/app/alert-card.tsx:56` | `COMMUNITY_CATEGORIES.has(notification.category)` | wrap with `categoryBeToShared` |
| `apps/web/src/app/(app)/notifications/history-section.tsx` (`matchesFilter` usage) | `category.startsWith(p)` | wrap the BE `category` once at item ingestion or at `matchesFilter` boundary |

### Mobile

| File:line | Current | Proposed |
|---|---|---|
| `apps/mobile/components/alerts/alert-card.tsx:30` | `getNotificationIcon(item.category)` | wrap |
| `apps/mobile/components/alerts/alert-list.tsx:73–81` | (after adapter, before passing to card) — `card.category` is BE-shaped; wrap at adapter override point or inside category-derived helpers |
| `apps/mobile/components/alerts/alert-list.tsx` filtering path | (same — see bug #13: verify category filter is actually applied) |

**Per-app helper:** in each app `lib/notification-icons.ts` (web) and `lib/notification-icons.ts` (mobile, if separate) — push the `categoryBeToShared` call inside `getNotificationIcon` so callers don't all need to wrap. **REVIEW (Q4)**: do this once in the helper, or at every call site?

---

## 6. Severity normalizer plan

Shared 1.14.0 has **no `normalizeSeverity` export** (verified). `NotificationSeveritySchema.options = ['info','low','medium','high','critical','warning']` — `warning` is the legacy alias.

Plan §1.6 fallback: render `warning` and `medium` to the same UI label / color.

Inspection of current code:
- Web alert-card: `SEVERITY_COLORS[notification.severity]` (L143–147) — `SEVERITY_COLORS` is imported from `@notifio/shared`. Verify it has a `warning` entry; if missing, severity `warning` renders as fallback `#3A86FF` (info-blue). Needs check inside shared dist.
- Mobile alert-card: `SEVERITY_COLORS[severityKey]` (L33–36) — same mechanism.
- Web/mobile severity i18n: `notificationSeverity.warning` exists in shared (verified in §1.6 grep above).

Proposed rule (no shared bump):

```ts
const severityNormalized = severity === 'warning' ? 'medium' : severity;
```

Apply at every render site that maps severity → color/label. Single tiny helper in each app (e.g. `apps/web/src/lib/severity.ts`) — keeps it DRY. Filip might prefer a different fold direction (`medium → warning`?); flag as **REVIEW (Q6)**.

---

## 7. Verification plan for Stage 2

After Stage 2 implementation:

```bash
npm install
npx turbo run typecheck --filter=@notifio/web --filter=@notifio/mobile
npx turbo run lint --filter=@notifio/web --filter=@notifio/mobile
npx turbo run build --filter=@notifio/web
cd apps/mobile && npx expo export --platform ios --output-dir /tmp/expo-export-smoke
```

Sanity greps (must return zero hits where indicated):
- `grep -rn "isResolved(" apps/web/src/ apps/mobile/` → zero (full removal from FE consumers).
- `grep -rn "notificationsPage.filters.events" apps/web/messages/` → zero.
- `grep -rn "activeOnly" apps/web/src/hooks/ apps/web/src/app/` → zero.
- `grep -rn "'ended'" apps/mobile/components/alerts/` → only inside any mapping helper that translates UI→API; UI label code paths use `'resolved'`.

---

## 8. Open questions for Filip (blockers for Stage 2)

**Q1 — Mobile lifecycle UI label rename: `ended` → `resolved`.** The plan says yes. Confirmed. But shared 1.14.0's mobile-side i18n key set is `alerts.{active,upcoming,ended,all}` — the `ended` label is baked in. Renaming the UI label means either (a) keep using the `alerts.ended` key but display Slovak translation `Vyriešené` instead of `Ukončené` → requires a shared bump to update the JSON, OR (b) switch the mobile filter sheet to `notifications.tabs.{active,upcoming,resolved,all}` — but **shared has no `notifications.tabs.resolved` key, only `notifications.tabs.ended`** (alongside `eventStatus.resolved`). Neither path lands cleanly without either a shared bump or accepting the cosmetic label "Ukončené" remains under a key technically called `ended`. **Which?**

**Q2 — Web lifecycle pill keys.** Plan rule says move to `notifications.*`. Shared has `notifications.eventStatus.{active,upcoming,resolved}` (no "all"). Either: (i) keep using `notificationsPage.lifecycle.*` (violates rule but works); (ii) move active/upcoming/resolved to `notifications.eventStatus.*` and leave `notificationsPage.lifecycle.all` for the "all" pill (split keyspace, ugly); (iii) add `notifications.lifecycle.*` to shared (out of scope per plan). **Which?**

**Q3 — Category filter chip keys.** Plan rule says `notifications.filters.*`. Shared has `notificationsPage.filters.*` (web) and `alerts.filters.*` (mobile) — no `notifications.filters.*`. Same three options as Q2. **Which?**

**Q4 — Where to call `categoryBeToShared`.** Wrap once inside `getNotificationIcon` (DRY, one place) or wrap at every call site (explicit, no hidden conversion)? Affects 4 sites on web + 2 on mobile.

**Q5 — api-client stale pin (`^1.11.0`).** Plan says "no shared bump in scope". But CLAUDE.md's "Bumping `@notifio/shared`" section explicitly says api-client pin should track root. Strict reading of plan → leave alone. CLAUDE.md spirit → bump to `^1.14.0` in this PR. **Bump or leave?**

**Q6 — Severity normalizer.** Fold `warning → medium` (proposed) or `medium → warning` or keep both distinct? Affects label + color.

**Q7 — Bug #12/#13: mobile category filter chip wiring.** I could not confirm from the audit window whether `TogglePill` props are correctly named or whether `filtered` actually applies the category filter. If broken, scope expands beyond plan's listed bugs. Should the Stage 2 sweep fix this if found broken, or strictly stay in plan scope?

**Q8 — Web hook `error` exposure.** Plan instructs HistorySection to consume `error` from the hook. Need to confirm web `useNotificationHistory` actually returns it (audit found mobile hook does; web hook needs a deeper read to be sure). If web hook doesn't expose `error`, Stage 2 must add that to the hook return shape too. OK to add?

**Until Filip answers Q1–Q3 + Q5, Stage 2 cannot proceed cleanly.** Q4, Q6, Q7, Q8 are deferrable to Stage 2 commit time with reasonable defaults.

---

## End-of-Stage-1 report

- **Web route:** `apps/web/src/app/(app)/notifications/page.tsx`
- **Mobile screen:** `apps/mobile/app/(tabs)/alerts.tsx`
- **i18n keys:** KEEP 23 / MOVE 2 / DELETE 1 / REVIEW 18
- **Bugs confirmed present:** 11 from plan + up to 4 newly surfaced (incl. 2 suspected pending verification)
- **Adapter strategy:** web (a) inline at alert-card; mobile (b) override at alert-list renderItem
- **Severity normalizer in shared:** NO — local fold `warning → medium` proposed
- **Blockers requiring Filip's call:** Q1 (mobile label rename mechanics), Q2 (web lifecycle keyspace), Q3 (category-filter keyspace), Q5 (api-client pin)

**STOP. Awaiting Filip's answers before Stage 2.**
