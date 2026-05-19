# AUDIT — Mobile notifications width parity + lifecycle truncation

| Field | Value |
|---|---|
| Branch | `fix/notifications-screen-batch` (continuing — 4th fix on top) |
| Base commit | `ebc8126` (HEAD of branch) |
| Date | 2026-05-19 |
| Stage | Phase 0 (read-only) — Phase 1 STOPS until Filip green-lights |

Prior commits intact on this branch:
- `ed9165b` fix(web) notifications batch 1
- `80f6f2f` fix(mobile) notifications batch 1
- `ee7d9c3` chore(deps) api-client pin + coords thread
- `33979ab` feat(web) filter redesign
- `fa84cbf` feat(mobile) filter redesign
- `ebc8126` fix(web) button-in-button

---

## 1. Container chain — side-by-side measurement

Numeric tokens used:
- `theme.spacing.xl` = **20** (per `apps/mobile/lib/theme.ts` `spacing.xl: 20`)
- `SPACING.screenH` = **16** (per `apps/mobile/lib/spacing.ts`)
- `commonStyles.screenPadding` = `{ paddingHorizontal: theme.spacing.xl }` = **20pt**

### Weather screen `apps/mobile/app/(tabs)/weather.tsx`

```
SafeAreaView                         flex:1, no horizontal padding
└─ ScrollView (scrollable=true)      contentContainerStyle.scrollContent = paddingBottom only
   └─ View commonStyles.screenPadding  paddingHorizontal: 20  ← single horizontal inset
      └─ <View style={styles.hero}>    no horizontal padding (marginBottom only)
         └─ <WeatherCard …>            no horizontal padding
      └─ <View style={styles.stack}>   gap only, no horizontal padding
         └─ <HourlyForecast> etc.      child cards have no horizontal padding
```

**TOTAL inset on first content edge (weather): 20pt**

(`screen-layout.tsx:23-25` — `scrollable === true` branch.)

### Alerts screen `apps/mobile/app/(tabs)/alerts.tsx` + `apps/mobile/components/alerts/alert-list.tsx`

```
SafeAreaView                         flex:1, no horizontal padding
└─ View [styles.fill, screenPadding]  flex:1, paddingHorizontal: 20  ← FIRST 20pt
   └─ View styles.tabBar              paddingHorizontal: SPACING.screenH = 16   ← +16 (sub-tabs only)
   │  └─ 3 Pressables                 flex:1 each, paddingHorizontal:8
   └─ View styles.tabContent          flex:1, no horizontal padding
      └─ <AlertList>
         └─ View styles.container     flex:1, no horizontal padding
            └─ View styles.filterTopRow  paddingHorizontal: SPACING.screenH = 16  ← +16 (filter row)
            │  └─ ScrollView + Pressable…
            └─ <FlatList>
               contentContainerStyle: [styles.list]
                 styles.list           paddingHorizontal: SPACING.screenH = 16  ← +16 (CARDS)
                   <AlertCard> (uses <Card> component, no own horizontal padding)
```

**TOTAL inset on first content edge (alert cards): 20 + 16 = 36pt**
**TOTAL inset on filter row content: 20 + 16 = 36pt**
**TOTAL inset on sub-tabs (history/events/reminders): 20 + 16 = 36pt**

### Side-by-side

| Surface | Inset |
|---|---|
| Weather cards | **20pt** |
| Alerts cards | **36pt** |
| **Drift** | **+16pt extra on alerts** |

The 16pt is the **double padding** — `ScreenLayout` already applies 20pt via `commonStyles.screenPadding`, and AlertList re-applies `SPACING.screenH = 16` inside its own subtree (`filterTopRow`, `list`), plus alerts.tsx re-applies it on `tabBar`.

**Single root cause line**:
- `apps/mobile/components/alerts/alert-list.tsx:235` — `styles.list.paddingHorizontal: SPACING.screenH` (cards)
- `apps/mobile/components/alerts/alert-list.tsx:207` — `styles.filterTopRow.paddingHorizontal: SPACING.screenH` (filter row)
- `apps/mobile/app/(tabs)/alerts.tsx:99` — `styles.tabBar.paddingHorizontal: SPACING.screenH` (sub-tab strip)

---

## 2. ScreenLayout behavior

File: `apps/mobile/components/ui/screen-layout.tsx` (verbatim):

```tsx
export function ScreenLayout({ children, style, scrollable = false, header }: ScreenLayoutProps) {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[commonStyles.screen, { backgroundColor: colors.background }, style]}>
      {header}
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={commonStyles.screenPadding}>{children}</View>
        </ScrollView>
      ) : (
        <View style={[styles.fill, commonStyles.screenPadding]}>{children}</View>
      )}
    </SafeAreaView>
  );
}
```

- **Both branches apply `commonStyles.screenPadding` = paddingHorizontal 20pt** — the `scrollable` flag does not change horizontal behaviour. Only vertical scroll vs static view differs.
- So when Filip's screenshot shows different insets between weather and alerts, ScreenLayout itself is NOT the source of the drift — it gives both screens the same 20pt. The drift comes from AlertList re-applying `SPACING.screenH` internally.
- **Audit §0.2 hypothesis falsified**: not "alerts opts out → AlertList must reimplement padding"; both screens get 20pt from ScreenLayout, but AlertList adds extra on top.

---

## 3. AlertList internal layout

From `apps/mobile/components/alerts/alert-list.tsx:182-250`:

```ts
container: { flex: 1 }                          // no horizontal padding ✓
filterTopRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: SPACING.screenH,           // ← +16 EXTRA
  paddingVertical: SPACING.subControlPadV,
  marginBottom: SPACING.subControlBottom,
  gap: 8,
}
list: {                                          // = FlatList contentContainerStyle
  paddingHorizontal: SPACING.screenH,           // ← +16 EXTRA (the visible card-edge drift)
  paddingBottom: theme.spacing['4xl'],
}
```

Both `filterTopRow` and `list` add `SPACING.screenH` on top of ScreenLayout's already-applied 20pt.

---

## 4. Lifecycle row width allocation

Filter row JSX (`alert-list.tsx:98-142`):

```jsx
<View style={styles.filterTopRow}>           // flexDirection:row, gap:8
  <ScrollView horizontal style={styles.lifecycleRow}
              contentContainerStyle={styles.lifecycleRowContent}>
    {LIFECYCLE_OPTIONS.map(key => (
      <Pressable style={styles.lifecycleTab}>
        <Text style={styles.lifecycleText}>{label}</Text>
      </Pressable>
    ))}
  </ScrollView>
  <Pressable style={styles.filterIconButton}>icon + optional badge</Pressable>
</View>
```

```ts
lifecycleRow:        { flex: 1, flexGrow: 1 }                  // takes remaining row width
lifecycleRowContent: { gap: 4, alignItems:'center', paddingHorizontal: 2 }
lifecycleTab:        { paddingHorizontal: 10, paddingVertical: 6 }
lifecycleText:       { fontSize: 14 }
filterIconButton:    { width: 32, height: 32, ... }            // fixed-width, no flexShrink
```

### Why "Všetky" is clipped

The ScrollView's allocated width is correct (parent width minus 32pt icon minus 8pt gap). But the **content inside the ScrollView is wider than the viewport**:

- Approx label widths at 14pt regular: Aktívne ≈ 56pt, Plánované ≈ 76pt, Ukončené ≈ 76pt, Všetky ≈ 56pt → total label width ≈ **264pt**
- Plus 4 tabs × `paddingHorizontal: 10` × 2 sides = **80pt**
- Plus 3 inter-tab gaps × 4 = **12pt**
- Plus `contentContainerStyle.paddingHorizontal: 2` × 2 = **4pt**
- **Content width ≈ 360pt**

Available ScrollView width on an iPhone 14 (393pt screen):
- 393 − 20 ScreenLayout − 16 filterTopRow − 16 filterTopRow − 32 icon − 8 gap = **301pt**

→ Content (360pt) > viewport (301pt). ScrollView shows ~301pt window, last tab "Všetky" is clipped past the right edge, visible as "V…" before the filter icon button which sits flush against the ScrollView's right boundary.

After the §1 inset fix (removing the double-padding), available width grows by 32pt (16pt × 2 sides removed) → ~333pt, still less than 360pt content → "Všetky" still partially clipped, just less.

Horizontal scroll DOES work (technically users can swipe to reveal "Všetky"), but there's no scroll indicator and no fade affordance, so users perceive it as a layout bug.

### Fix candidates (Phase 1 will pick one — see §10 Q1)

| # | Approach | Pros | Cons |
|---|---|---|---|
| F1 | **Replace ScrollView with equal-width row** — 4 `<Pressable flex:1>` tabs, `numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}`. Matches the existing 3-tab strip in `alerts.tsx:51-78` (proven pattern on the SAME screen). | All 4 always visible, no scroll affordance needed, consistent with sub-tabs above, no compromise on the smallest device (iPhone SE 320pt). | Loses the option to add more lifecycle states later without rework. |
| F2 | Keep ScrollView, **reduce tab padding** (10→6) + gap (4→2). | Smaller diff. | Content still 360-too-tight margins. Will re-clip if labels grow in any locale. |
| F3 | Keep ScrollView, **add `contentContainerStyle.paddingRight: theme.spacing.md`** so last tab sits clearly past the icon-button boundary. | Smallest diff. | Doesn't fix truncation; just makes the affordance "yes you can scroll" cleaner — last tab still cut. |

**Recommendation: F1.** Proven pattern in the same file (the top sub-tab strip). Predictable. No scroll affordance debate. Diff is small (~10 lines).

---

## 5. Reference patterns from other screens

Searched for similar horizontal-scroll-tabs + trailing icon patterns:

```
grep "ScrollView horizontal" apps/mobile/components apps/mobile/app
```

- `apps/mobile/components/weather/hourly-forecast.tsx` — horizontal scroll for hourly cards (no trailing icon button)
- `apps/mobile/components/weather/daily-forecast.tsx` — vertical list, no horizontal
- `apps/mobile/components/alerts/alert-list.tsx` — the one we're auditing (only horizontal-scroll + trailing icon pattern in the app)
- **No other "scroll-tabs + trailing icon" precedent** in the codebase. Alerts is the first.

The top sub-tab strip in `alerts.tsx:51-78` uses the **equal-width** pattern (3 tabs `flex: 1`, `adjustsFontSizeToFit`) — same problem domain (compact text-tabs), proven solution. Phase 0 §0.5 reference: this exact pattern lives 70 lines above the broken lifecycle row.

---

## 6. SafeArea handling

Both screens funnel through `ScreenLayout` which renders `<SafeAreaView>` from `react-native-safe-area-context` (see `screen-layout.tsx:3,20`). **Identical SafeArea wrapper across both screens**. No parity issue here. SafeAreaView only contributes safe-area insets (notch / home indicator), not horizontal screen-edge padding.

---

## 7. Root cause hypothesis

### (A) Width parity bug
**Root cause: AlertList double-pads on top of ScreenLayout.** ScreenLayout already applies `commonStyles.screenPadding = paddingHorizontal 20` to both branches (scrollable + non-scrollable). AlertList re-applies `paddingHorizontal: SPACING.screenH = 16` at three internal sites:

- `alert-list.tsx:207` — `styles.filterTopRow.paddingHorizontal: SPACING.screenH`
- `alert-list.tsx:235` — `styles.list.paddingHorizontal: SPACING.screenH` (FlatList contentContainerStyle)
- `alerts.tsx:99` — `styles.tabBar.paddingHorizontal: SPACING.screenH` (sub-tab strip in the screen route)

Each renders inset = 20 + 16 = **36pt** vs weather's **20pt**.

### (B) Lifecycle truncation bug
**Root cause: total intrinsic tab content width exceeds the ScrollView's allocated viewport.** ScrollView/icon flex split is correct (`flex: 1` on ScrollView, fixed 32pt icon, 8pt gap — math checks out). But ~360pt of intrinsic tab content tries to fit in ~301pt of viewport (pre-fix) / ~333pt (post-fix-A), so the last tab clips. ScrollView technically scrolls to reveal "Všetky" but there's no visual indicator → reads as a layout bug.

Source: `alert-list.tsx:99-128` (the ScrollView + 4 `<Pressable>` tabs) — the layout is mechanically right, the design choice (horizontal scroll for 4 fixed labels) is wrong for the available room.

---

## 8. Scope check — fix without touching shared wrappers?

**Yes.** Both bugs fix cleanly inside the alerts surface:

- `apps/mobile/components/alerts/alert-list.tsx` — drop redundant `SPACING.screenH` in `filterTopRow` and `list`; replace lifecycle ScrollView with equal-width row.
- `apps/mobile/app/(tabs)/alerts.tsx` — drop redundant `SPACING.screenH` from `tabBar` styles.

`screen-layout.tsx`, `common-styles.ts`, `spacing.ts`, `theme.ts` — **untouched**. Weather/index/map/settings screens — **untouched**.

**No flag for Filip per §0.8.** Fix is self-contained.

---

## 9. Blockers / Filip's calls needed

| # | Question | Recommended default |
|---|---|---|
| Q1 | Lifecycle row fix — F1 (equal-width row, drop ScrollView) / F2 (shrink padding, keep scroll) / F3 (just paddingRight, accept truncation as scroll affordance). | **F1** — matches sub-tab pattern 70 lines above in the same file; only approach that guarantees all 4 visible on iPhone SE. |
| Q2 | After dropping `SPACING.screenH` from `tabBar` in `alerts.tsx`, the 3 sub-tabs (Notifikácie / Udalosti / Pripomienky) will align with cards at 20pt. Currently they're at 36pt. Visual change to the sub-tab strip — acceptable side effect, or restrict the fix to only AlertList (cards + filter row) and leave the sub-tab strip at 36pt? | **Acceptable side effect.** Consistency across the screen — sub-tabs and cards should share an edge. Restricting to AlertList only would re-introduce mid-screen edge inconsistency. |
| Q3 | `SPACING.screenH = 16` is now de-facto unused on this screen after the fix. Other screens may still use it. Leave the token alone for the separate parity batch? | **Leave it alone.** Plan §1.3 says no theme/token changes. |

No hard blockers. Recommended defaults can run end-to-end on Filip's nod.

---

## 10. End-of-Phase-0 report

- **Weather screen total horizontal inset:** 20pt (ScreenLayout's `commonStyles.screenPadding`)
- **Alerts screen total horizontal inset:** 36pt (ScreenLayout 20 + internal SPACING.screenH 16)
- **Source of width drift:** `alert-list.tsx:207, :235` + `alerts.tsx:99` re-apply `SPACING.screenH` inside ScreenLayout's already-padded view
- **Lifecycle truncation root cause:** 4 fixed tabs' intrinsic content width (~360pt) > available ScrollView viewport (~333pt post-fix-A) → last tab clips
- **Proposed fix touches:** `apps/mobile/components/alerts/alert-list.tsx` + `apps/mobile/app/(tabs)/alerts.tsx`
- **Can fix stay scoped to alerts surface?** YES
- **Blockers for Phase 1:** Q1 (fix variant — recommend F1), Q2 (accept sub-tab side-effect — recommend yes), Q3 (leave SPACING.screenH token — recommend yes). None hard.

**STOP. Awaiting Filip's resolutions on Q1–Q3 before Phase 1.**
