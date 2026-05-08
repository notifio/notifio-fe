# Notifio — Project Backlog

> ⚠️ **This is a FE-repo SNAPSHOT** taken 8.5.2026 from `notifio-api/docs/BACKLOG.md`.
> The canonical file lives in `notifio-api/docs/BACKLOG.md` — edit there, never here.
> This copy adds an "FE follow-ups shipped" section at the top so reviewers of the
> notifio-fe `feat/backlog-fe-followups-2026-05` branch can see what's covered.

---

## ✅ FE follow-ups shipped — `feat/backlog-fe-followups-2026-05` (8.5.2026)

Batch addresses Filip-lane FE items queued by JARO's BE+shared work in early May. Verified `npx turbo run typecheck lint --filter=@notifio/web --filter=@notifio/mobile` green; web `build` and mobile Hermes `expo export --platform ios` smoke also green.

| Item | Status | Notes |
|---|---|---|
| **FE-MAP-SHOW-UPCOMING-DEFAULT** | ✅ | `showUpcoming` default flipped `false → true` on 3 sites (web `/dashboard/map-panel`, web `/map`, mobile `(tabs)/map`) + `dashboard-map.tsx` default prop. Fixes "ráno mapa prázdna" report. |
| **FE-REPORT-AUTO-RADIUS** | ✅ | Hardcoded 8-button radius picker + `radiusM` payload removed from web + mobile `event-report-modal`. BE auto-fills from `c_event_type.num_default_radius_m`. |
| **FE-LOCATION-PICKER-EXTEND** | ✅ | Mobile `LABEL_VALUES` / `KNOWN_LABEL_CODES` + web `LABEL_OPTIONS` extended `home/work/school/gym/other → +parents/+cottage`. Web modal switched from hardcoded English to shared `locations.labels.*`. |
| **FE-P1-LANG-PERSIST** | ✅ | Mobile language switcher persists via `api.updateProfile({ locale })`; api-client signature extended. |
| **FE-NOTIF-PLANNED-CHIP** | ✅ | `'upcoming'` lifecycle option added to mobile filter sheet + new lifecycle chip row on web history-section. `?status` wired through both notification-history hooks; api-client `getNotificationHistory` extended. i18n × 6 web locales + mobile temp. |
| **FE-REPORT-PROVIDER-PICKER** | ✅ | Provider picker rendered conditionally on `providerRequired === true` for outage_* subcategories; sends `providerCode` in payload. **Unblocks** the silent BE-400 on user-reported `internet/electric/water/gas/heat_outage` events. Local type extension `CategoryWithProvider` until shared schema bump. |
| **FE-P1-ERROR-REPORTER-WEB** | ✅ | New `apps/web/src/lib/error-reporter.ts` + Next.js `global-error.tsx` + `<ErrorReporterInstaller />` in root layout. 8 KB stack cap, 60s dedup, mandatory `x-device-id`, `keepalive: true`, drop-on-429. |
| **FE-P1-ERROR-REPORTER-MOBILE** | ✅ | New `apps/mobile/lib/error-reporter.ts` with `ErrorUtils.setGlobalHandler` + RN rejection-tracking + AsyncStorage offline queue (max 100, 7-day TTL). Wired in `app/_layout.tsx`. |
| **PERMS-1** | ✅ | Onboarding `location.tsx` + `notifications.tsx` skip auto-advance when OS permission already granted. |
| **TECH-DEBT-1** | ✅ | `npm run typecheck` clean in both workspaces. |
| **FE-P2-WEB-PREFS-UI** | ✅ partial | `setQuietHours` + `<QuietHoursSection>` shipped on web Settings. Dual `sendNotifications` / `showOnMap` per-category toggles deferred — current mobile is still single `enabled`, no parity to mirror. |
| **FE-P2-EVENT-DELETED-FALLBACK** | ✅ | Web event-detail + mobile `useEventDetail` distinguish 404 retention sweep from generic load failure; locale-specific "archived" copy × 6 web locales + mobile temp. |
| **Map filter polish (web)** | ✅ | `MapFilterBar` 10% wider (`minWidth 286 → 315px`), scrollbar hidden, outer wrapper rounded to match inner clip mask, responsive max-height `.map-filter-max-h` (mobile `100vh - 168px` / md+ `100vh - 104px` to clear top bar 56px + bottom tab 64px + 48px padding), `gap: 12px` between "Filter by category" + "Clear all". |

### Out of scope (re-audit after this batch merges)

BUG-4 OAuth, BUG-8 calendar i18n, MAP-UX-1 viewport bbox, MAP-UX-2/3, LANDING-2, REQUEST-6 FAQ, FE-P1-EVENT-TIME-RANGE-FILTER, FE-P2-MOBILE-PRO-PARITY, FE-P2-MOBILE/WEB-PREFS-LOCATION-UI, FE-P2-CUSTOM-OVERVIEW, FE-NOTIF-PLANNED-TAB (chip variant shipped instead), all design-changing items (REQUEST-1/4/7, LANDING-1/3/4, Step 10, NEW-3 IAP).

---

**Posledný audit:** 4. máj 2026 evening (post Sprint 2 deploy)
**Source of truth:** tento súbor v `notifio-api/docs/BACKLOG.md`
**Mirror:** každý developer si môže držať lokálnu kópiu, ale zmeny idú vždy cez PR.

---

## 🤝 Team workflow — ako použiť tento doc

### Vlastníctvo (kto čo robí)

| Tag | Osoba | Zodpovednosť |
|---|---|---|
| **[JARO]** | Jaro | Backend, infrastructure, data quality, system audits |
| **[FILIP]** | Filip | FE web/mobile, refactor doc, landing page |
| **[DIA]** | Dia | Design lane (wireframes, mockups, brand assets) |
| **[SHARED]** | Viacerí | Item ktorý chce viac ako jeden — koordinovať pred štartom |

> **Product decisions** robíme spolu (JARO + FILIP + DIA) — žiadny vlastník nerozhoduje sám. V tagged itemoch tag označuje **executora**, nie rozhodcu; otázky scope / prioritizácie / UX direction prejdú spoločnou krátkou debatou pred začatím práce.

### Ako pridať / upraviť položku

1. **Pull latest:** `git checkout main && git pull` (alebo `development`)
2. **Feature branch:** `git checkout -b docs/backlog-<short-desc>` (napr. `docs/backlog-jaro-redis-audit`)
3. **Edit** `docs/BACKLOG.md` — pridať / upraviť položku v správnej sekcii s vlastným tagom
4. **Commit:** descriptive message, prefix `docs(backlog):` (napr. `docs(backlog): add JARO Redis audit + retention items`)
5. **PR:** base = `development` (nie `main` — Notifio konvencia)
6. **Žiadny review-block:** docs PR-y môžu sa mergovať rýchlo, hlavné je nech sú konzistentné

### Ako uzatvoriť položku (claim → in-progress → done)

- **Claim:** pri začatí pridajte `🚧 [in-progress]` k titulu položky a v commit message zmienku "claim"
- **Done:** keď dokončíte, presuňte celú položku do `docs/BACKLOG-archive.md` (alebo do "Closed items" sekcie nižšie) s commit/PR referenciou
  - Príklad: `### BUG-1 [JARO] ✅ DONE (PR #312, commit a1b2c3d)`
- Pre väčšie items je OK držať `🚧 in-progress` aj cez viac dní; ostatní vidia kto na čom robí

### Paralelná práca — bezpečnostné pravidlá

- **Edituj iba svoju sekciu / svoj tag.** Ak narazíš na overlap s iným členom, pridaj `[SHARED]` tag a dohodni cez Slack/Discord
- **Atomické commity** — radšej viac malých docs PR-ov ako jeden veľký, znižuje merge konflikty
- **Top-priority sekcia** sa edituje na konci PR-u (občas merge konflikty) — ak meníš poradie, zaokomentuj
- **Nikdy** nedirektívne `git push --force` na shared branch

### Kde hľadať info

- **Closed items / archív:** lokálny `project_backlog_archiv.md` (Filipova memory)
- **Refactor doc (Filipo notes):** REFACTOR-SUGGESTIONS-FOR-BE.md (handed off 2.5.)
- **Sprint summary (1.-2.5.):** SESSION-CHANGELOG.md (Filipo notes)
- **Tomorrow plan (1.5.):** TOMORROW-PLAN.md (Filipo notes)

---

## ═══ DEPLOYED STATUS (4.5.2026 evening) ═══

| Repo | Verzia | Shared |
|---|---|---|
| notifio-api | 1.0.0 | ✅ `@notifio/shared@^0.22.0` |
| notifio-fe | web 0.1.0, mobile 0.1.0 | ✅ `@notifio/shared@^0.22.0` |
| notifio-shared | **0.22.0** | — |

**Posledné nasadené (4.5. evening):**
- **Sprint 1** BUG-1/2/3 fixy (BE PRs #298–#300, FE PRs #93–#95) — auth sign-out endpoint, default-to-skip targeting, live-GPS targeting, mobile splash gate, mobile + web map filter respect prefs
- **BUG-7** docs entry (PR #302) — FE typecheck drift surfaced in canonical backlog
- **Sprint 2 BE** (PR #304) — migrácie 0065+0066, B3 split toggles + B1 per-location + global quiet hours
- **Sprint 2 FE mobile** (PR #96) — api-client augmented types, mobile UI dual toggles + QuietHoursSection, 8 i18n keys × 6 locales
- **Quality systems BE batch** (8 PRs, 4.–5.5.):
  - `feat/be-scheduler-last-run-ttl` — 30d TTL na `scheduler:lastRun:*` Redis keys (Redis hygiene)
  - `feat/be-event-retention-fk-cascade` — migrácia 0067, FK cascade r_event_h3 + f_event_credibility, SET NULL pre notification logs
  - `feat/be-event-ttl-from-codebook` — migrácia 0068, `c_event_type.num_default_ttl_hours` + TTL cache v `event-write.service`
  - `feat/be-event-retention-90d` — `event-retention.scheduler.ts` (conservative 90d sweep, 50k cap, manuálny `f_event_hist` cleanup)
  - `feat/be-event-status-notif` — `eventStatus` projektovaný v `/me/notifications` JOIN
  - `feat/be-error-log-schema-v2` — migrácia 0069 `f_error_log` + Drizzle schema, SHA-256 hashed user IDs
  - `feat/be-client-errors-endpoint` — `POST /api/v1/client-errors` route, rate-limit 10/min/device, anonymous+bearer-optional
  - `docs/forecast-coverage-audit-2026-05` — QUALITY-5 audit dokument (gap-fill defer per Filip)
  - `fix/be-scheduler-lint-strict-deps` (PR #316) — post-merge cleanup, drop positional `startScheduler()` back-compat wrapper to clear 3 `@typescript-eslint` errors blocking CI lint job (no behaviour change; 1448/1448 testov pass)
  - `fix/be-migrations-table-column-names` (5.5. evening) — production-blocking fix: 0067 referenced renamed tables `f_notification_log` / `f_notification_batch` (premenované na `t_*` v 0008), 0068 referenced neexistujúci stĺpec `sa.cod_adapter` + adapter kódy s pomlčkami (reálne s podčiarkovníkmi `spp_gas`, `veolia_heat`, …). Obidve migrácie spadli `BEGIN/COMMIT` rollbackom v produkcii. Fix robí migrácie idempotentné (`IF EXISTS` / `IF NOT EXISTS`) aby boli safe na re-run. **Akcia:** spustiť 0067 + 0068 znova proti produkcii po merge.
  - `fix/be-rate-limit-ipv6-safe-keygen` (5.5. evening) — security: globálny rate-limiter v `app.ts` aj `client-errors.routes.ts` keyovali na `req.ip` priamo, čo IPv6 useri vedeli obísť rotovaním v rámci svojho /64 prefixu. CI flagovala iba `client-errors.routes.ts` (`ERR_ERL_KEY_GEN_IPV6`), `app.ts` mal `validate: { default: false }` čo varovanie tichilo, ale rovnaký bypass tam fungoval. Obidva keyGeneratory teraz volajú `ipKeyGenerator(req.ip ?? '0.0.0.0')` ktorý IPv6 normalizuje na /56 subnet. **FE follow-up:** [`x-device-id` je teraz CRITICAL pre FE error reportéry](#fe-p1-error-reporter-web) — bez neho user-y za rovnakým NAT/IPv6 prefixom zdieľajú jeden bucket.
  - `fix/be-zsd-codebook-align-with-excel` (5.5. evening) — migrácia **0070** alignuje produkčné `c_event_type` + `c_source_adapter` s `default/*.xlsx` zdrojom pravdy pre ZSD adapter (key=37). 3 zmeny: (1) flag `flg_data_source: false → true` lebo scraper je live od 30.4.; (2) ZSD outage radius `2000 → 1000m` aby boli ZSD radii konzistentné; (3) nový event_type row `d4e5f6a7-0048-0000-0000-000000000390` pre `electric_emergency × adapter 37` (UUID -39x band). Excel sources updated v parallel, plus pridaný stĺpec `num_default_ttl_hours` v `c_event_type.xlsx` (backfill 27 rows per migration 0068 mapping). **Akcia:** spustiť 0070 proti produkcii po merge. **Pozn.:** skutočná príčina "ráno sa na mape nič nezobrazovalo" NIE JE BE — 306 ZSD eventov je v DB; FE mapa filtruje iba `active now`. Tracked v novom **FE-MAP-SHOW-UPCOMING-DEFAULT [FILIP]**.
  - `fix/be-location-label-add-gym-other` (5.5. evening) — **BUG-6** root-cause fix, migrácia **0071**. Audit odhalil 2-of-5 enum mismatch medzi `@notifio/shared.LocationLabelSchema` (home/work/school/gym/other) a Excel + prod DB (home/work/school/parents/cottage). Path-C: aditívne v oboch — DB + Excel teraz majú 7 entries (pridané gym=Telocvicna key=6, other=Ine key=7). Idempotentná migrácia (ON CONFLICT DO NOTHING). **Akcia:** spustiť 0071 + verify shared bump (FE-SHARED-LOCATION-LABEL-EXTEND nižšie). **FE follow-up:** FE-LOCATION-PICKER-EXTEND.
  - `feat/be-audit-shared-vs-excel-codebooks` (5.5. evening) — nový script `scripts/audit-shared-vs-excel.cjs` + npm aliasy `audit:codebooks` / `audit:excels` / `audit:migrations`. Porovnáva `@notifio/shared` Zod enums vs `default/*.xlsx` `cod_*` columns, exit kód 1 ak drift (CI-friendly). Aktuálne audituje 4 páry: LocationLabel ✗ (BUG-6, in flight), Platform ✓, MembershipTier ✓, ConsentCategoryCode ✓. Po LocationLabel shared bumpe všetko zelené. Pridať nový pair: edituj `AUDIT_PAIRS` v hornej časti súboru. Druhý commit `c728660` na rovnakej branchi pridáva strip-comments fix v `extractEnum()` (regex zachytával backticked code spans v JSDoc komentároch ako enum hodnoty).
  - `notifio-shared#feat/location-label-extend-and-i18n` (5.5. evening) — Path-2 fix BUG-6 strany: rozšírený `LocationLabelSchema` z 5 na 7 entries (`parents`, `cottage`) + i18n keys `locations.labels.parents` / `locations.labels.cottage` doplnené v 6 lokáloch (sk Rodičia/Chata, en Parents/Cottage, cs Rodiče/Chata, hu Szülők/Hétvégi ház, de Eltern/Ferienhaus, uk Батьки/Дача). Changeset → minor bump 0.25 → 0.26 po merge. **Akcia po merge + publish:** `npm install` v `notifio-api` + oba FE workspace (mobile + web). Po inštalácii audit `npm run audit:codebooks` musí vrátiť exit 0.
  - `fix/be-bug9-pro-custom-labels-feature` (6.5.2026) — **BUG-9** root-cause fix: migrácia **0072** seeduje `custom_labels` row do `r_membership_feature` pre PLUS + PRO tier (FREE intentionally NOT included). Plus 1-line fix `FREE_MEMBERSHIP_ID` constant v `middleware/membership-resolve.ts` z `a1b2c3d4-...` (dev-only seed) na `a0000001-...` (prod = Excel). Excel `r_membership_feature.xlsx` updated v parallel. Idempotentné cez `uq_r_membership_feature` UNIQUE. **Akcia po merge:** spustiť 0072 v prod + buď počkať 15 min na Redis cache TTL alebo `redis del membership:user:*` na force-refresh.
  - `fix/be-bug10-locality-fallback-and-loud-drop` (6.5.2026) — **BUG-10** silent push drop fix: 4-layer change. (1) `scraper-utils.enrichOutageRecords` rozšírený o Tier 3 (split-locality) a Tier 4 (mine title/description) fallback chain — pokrýva BVS `"MČ, Ulica"`, SPP `"Pravotice, Nedašovce"`, VVS `"Janovík a Lemešany"`, StVPS `"Bojnice; X - Y"`, ZSVS `"... (Šípkov)"` formáty. (2) `event-write.upsertEvent` log.error keď h3Cells empty (predtým silent). (3) `scheduler/index.ts` outage guard skip enqueue ak `result.h3Cells.length === 0`. (4) `notification-targeting.findTargetDevices` WARN → ERROR. Pre-existing 104 silent-drop rows v prod sa naturálne opraví ďalším pollom (cod_source_id UNIQUE upsert s novým enrichmentom). **Žiadny manual backfill.**
  - `docs/redis-audit-2026-05` (6.5.2026) — **QUALITY-4** audit-only deliverable. Inventúra 23 key prefixov v 4 tieroch + 4 risk findings + 6 diagnostických Upstash queries. Hlavné identifikované riziká: (a) `membership:user:*` LRU eviction risk (accept — DB fallback existuje), (b) `h3:devices:*` SET eviction → live-GPS targeting silent degradation (nový follow-up `QUALITY-4-RECOMMENDATION-1`), (c) Stripe webhook stale (already tracked v BE-P0-WEBHOOK-CACHE). Ostatné prefixy sú správne nastavené.
  - `fix/be-quality6-7-feature-and-translation-cleanup` (6.5.2026) — **QUALITY-6** + **QUALITY-7** spojené. (1) `default/r_membership_feature.xlsx` doplnený o 9 chýbajúcich rows (`hydrology_warning`, `internet_outage`, `wildfire_alert` × FREE/PLUS/PRO) — Excel teraz match prod (22/51/65 features). Žiadna DB migrácia netreba. (2) Migrácia **0073** re-keys 18 orphan `c_membership` translation rows v `d_translation` z legacy `a1b2c3d4-...` UUID family na prod `a0000001-...`. Excel `d_translation.xlsx` updated v parallel. Idempotentné. **Akcia po merge:** spustiť 0073 v prod.
  - `feat/be-request3-isp-provider-selection` (docs-only, 7.5.2026) — **REQUEST-3** ✅ FULLY DONE BE-side: prod konfigurácia 100% správna. BE infrastruktúra existuje od P3.1 / migrácie 0048; prod state overený 2 SQL audit queries — 22 user-pickable (provider × subcategory) kombinácií, každá utility má kompletný set: ISP=8, water=6, heat=4, electric=2 (SSD+VSD sú flg_active=false), gas=2 (SPP je jediný gas distribútor SK). Pridaný refined audit SQL pre budúcnosť + FE follow-up `FE-REPORT-PROVIDER-PICKER`. **BLOCKING:** bez FE pickera user-reported outage_* events vracajú BE 400 (BE validuje correctly, ale FE nepýta provider). Filip lane priority.
  - `feat/be-request5-reminder-recurrence` + `notifio-shared#feat/reminder-recurrence-yearly-biweekly` (7.5.2026) — **REQUEST-5** BE+shared. Pridané `BIWEEKLY` (14-day cycle) + `YEARLY` (annual, s leap-year clamp Feb 29 → Feb 28 v non-leap rokoch) k existujúcim 4 cadences (`ONCE/DAILY/WEEKLY/MONTHLY`). Žiadna DB migrácia (cod_recurrence je varchar(20) bez CHECK constraint). Shared bumpne `ReminderRecurrenceSchema` enum z 4 na 6 hodnôt + i18n keys × 6 lokálov × 2 surfaces (`recurrenceOptions.{BIWEEKLY,YEARLY}` UPPERCASE pre badge/list, `form.{biweekly,yearly}` lowercase pre form picker). BE: service `VALID_RECURRENCE` Set + route Zod `RecurrenceSchema` enum + Swagger doc + `computeNextTrigger` switch s explicit leap-year handling cez `setDate(0)` clamp. **+ 13 nových testov** v `user-reminder-recurrence.test.ts` (regresné guards pre existujúce 4 + BIWEEKLY 14-day + month/year roll-overs + YEARLY ordinary case + Feb 29 → Feb 28 clamp + non-leap pass-through). **Akcia po merge:** publikovať shared PR (changeset auto-bumpne minor 0.30 → 0.31), potom api PR môže merge. FE follow-up: `FE-REMINDER-RECURRENCE-EXTEND` v BACKLOG.
  - `feat/be-sprint1-jaro-quick-wins` + `notifio-shared#feat/notification-prefs-subcategory-name` (7.5.2026) — **batch JARO sprint 1**: BUG-5 BE + shared, BUG-7 BE, REQUEST-2 docs only (BE už hotový), REQUEST-8 close (decided "NETREBA"), REQUEST-9 audit doc (`docs/audit-request9-share-og-2026-05.md`). FE follow-ups vytvorené ako separate items pre Filipa: **FE-REPORT-AUTO-RADIUS** (skryť RadiusPicker), **FE-NOTIF-PLANNED-CHIP** (4. chip v FilterSheet), **FE-SETTINGS-DATA-TRANSPARENCY** (optional banner). **Akcia po merge:** spustiť `notifio-shared` PR ako prvý (publishne novú verziu s `subcategoryName` field), potom merge api PR a bumpnúť `@notifio/shared` dep v notifio-api a oboch FE workspace-och na novú verziu (~0.30.0).
  - `feat/be-quality1-adapter-run-log` (PR #354, 6.5.2026) — **QUALITY-1 Phase 1A + 1B** spojené. (1) Migrácia **0074** vytvára `t_adapter_run_log` (rename z `f_*` per `t_*` transactional log konvenciu) + atomicky dropne never-written legacy `t_source_poll_log` + jeho FK column na `t_notification_batch.key_source_poll_log` (overené greppingom: zero writers v codebase). Schema má `cod_source_adapter / dtm_started/finished / num_duration_ms / num_rows_fetched/written/changed / num_geocode_fail / cod_outcome (success|partial|failed) / txt_error / jsn_metrics`. Retention 30d, sweep v Phase 2. (2) `AdapterRunLogService.recordRun()` (best-effort INSERT, Pino fallback ak DB fail) + `PollStats` interface + `wrapPoll()` helper. (3) Inštrumentované všetky scheduled adapter call sites: `executeOutagePoll` (14 outage adaptérov cez jeden wrapper, Phase 1A) + 7 simple-poll services (earthquake, hydro, wildfire, traffic-incidents, isp-outage, ba-rozkopavky, zjazdnost) refactored z `Promise<number>` → `Promise<PollStats>` s throw-on-fail + scheduler wrap-y, intelligence schedulers (weather-intelligence, environmental-intelligence) so synthetic codes `weather_intel` / `env_intel`, inline inštrumentácia v weather-warning + nameday + holiday cez `try/finally` (Phase 1B). (4) Test mocks pre 3 scheduler test súbory aby db/connection.ts neboot-oval cez import chain v CI. **Decision:** žiadny FK z `t_notification_batch → t_adapter_run_log` (legacy column nikdy nebol naplnený, downstream join cez `cod_source_id` + časové okno stačí). **Akcia po merge:** spustiť 0074 v prod. Phase 2 (digest + alerts + retention sweep) + Phase 3 (admin dashboard) tracked separately v QUALITY-1 sekcii nižšie.

**Detail closed items v `project_backlog_archiv.md` (sekcie 1.–2.5. + 4.5.).**

**Lokálne housekeeping:**
- API: `git checkout main && git pull`
- FE: `git checkout main && git pull` + cleanup feature branches

---

## Legenda priority

| Tag | Význam |
|---|---|
| **[JARO]** | Položka z môjho backlogu (auditované 30.4. + 4.5.) |
| **[FILIP]** | Filip lane — landing page, product decisions, REFACTOR-SUGGESTIONS-FOR-BE.md + SESSION-CHANGELOG.md + TOMORROW-PLAN.md (1.–2.5. dev session) + nové asks z 4.5. |
| **[DIA]** | Nový člen tímu — design lane (landing page) |
| **[SHARED]** | Viacerí to mali nezávisle — merge / dedup |

---

# 🐛 NOVÉ USER REPORTY (4.5.2026) — [JARO]

Najvyššia priorita. Triage pred ďalším sprintom.

> **BUG-1 / BUG-2 / BUG-3** ✅ deployed 4.5. (Sprint 1) — detail v `project_backlog_archiv.md`. BE sign-out endpoint, default-to-skip targeting, live-GPS targeting, mobile boot splash gate, mobile + web map filter respect prefs.

### BUG-4 [JARO+FILIP=SHARED] · OAuth providers — chýba Facebook + Apple + email login
**JARO ask:** doplniť Facebook, Apple, email/password (mimo Google).
**FILIP NEW-2 (TOMORROW-PLAN, 1.5.):** rovnaká téma rozpísaná detailnejšie — Apple Sign-In je **MANDATORY** podľa App Store policy ak ponúkame iný social login (Google už máme → Apple sa musí pridať pred iOS launch).

**Scope (FILIP detail):**
1. Supabase Auth provider config (Apple + Facebook v dashboard)
2. Apple Developer account: Sign in with Apple service ID + key
3. Facebook Developers: app + App ID + secret
4. BE: `auth.controller.ts` callbacks (Supabase abstrahuje, len test)
5. FE web: 2 nové buttons na auth screens
6. FE mobile: native Apple cez `expo-apple-authentication` (mandatory iOS), Facebook cez `expo-auth-session` alebo `react-native-fbsdk-next`
7. Test full flow on real iOS device (Apple sign-in nefunguje v sim pre Production)

**Apple gotchas (FILIP):**
- Private email relay (`@privaterelay.appleid.com`) — nemôžeme assume valid email
- Pri PRVOM sign-ine Apple posiela name+email JEDNORAZOVO. BE musí persistnúť, inak sa stratí
- Apple revocation webhook — invalidate session keď user revoke

**Email/password (JARO add):**
- Supabase má built-in
- FE: `<EmailLoginForm>` s email + password
- Verify email cez Supabase confirmation link

**Effort:** 1–1.5 dňa (FILIP odhad)
**Severita:** 🟠 MEDIUM (mandatory pre iOS launch, ale neblokuje súčasný stav)

### BUG-5 [JARO] · Mixed Slovak/English v Notifications settings + nejasná hierarchia 🚧 BE+shared DONE 7.5.
**Repro:** v `/settings/notifications`:
- SK label "Kategórie" / "weather" (mix — kategória v EN)
- Pod "Weather" sub-kategória "Meteorologické výstrahy" (SK)
- Pod ňou 7 ďalších skupín, každá má label `weather_warning` (raw event_type kód)

**Root cause (overené 7.5.2026 cross-repo audit):**
- BE `user-preference.service.ts:237` populoval `subcategoryName: row.txtSubcategoryName` (raw SK z `c_event_subcategory.txt_name`) — kategórie boli translatované cez `d_translation`, sub-kategórie nie.
- `@notifio/shared` `NotificationPreferenceItemSchema` **NEMAL** `subcategoryName` field → Zod v4 default `.strip()` mode odhodil pole pri parse → FE renderer (`apps/mobile/components/notifications/notification-prefs-list.tsx:117`) defensive cast `(item as { subcategoryName?: ... })` našiel undefined → fallback na raw `subcategoryCode`.
- 7× `weather_warning` raw kódy = 7 saved-location override rows pre rovnakú subcategoriu (Sprint 2 / B1 per-location prefs) — všetky stratili label cez stripped pole.

**Stav (7.5.2026):**
- ✅ **shared** `feat/notification-prefs-subcategory-name` — pridané `subcategoryName: z.string().nullable()` do `NotificationPreferenceItemSchema`. Changeset minor bump (0.29 → 0.30 po merge). Komentár v shared linkuje BE-side fix nižšie.
- ✅ **BE** `feat/be-sprint1-jaro-quick-wins` — generalizovaný `loadCategoryTranslations` → `loadCodebookTranslations(entity, keys, locale)` ktorý funguje pre `c_event_category` aj `c_event_subcategory`. Subcategory teraz dostáva `d_translation` lookup pred fallbackom na `txt_name`. Pridané 2 nové unit testy (`subcategoryName populated` + `null on parent rows`).
- ⏳ **FE auto-fix po shared bumpe** — defensive cast v `notification-prefs-list.tsx:117` môže byť odstránený keď FE workspaces bumpneme `@notifio/shared` na novú verziu. Žiadny FE PR netreba — typescript narrowing si vyrieši zvyšok.
- ⏳ **Doplnková kontrola — `d_translation` SK rows pre `c_event_category` + `c_event_subcategory`** (audit SQL):
  ```sql
  -- Categories missing SK translation rows (would show codCategory raw):
  SELECT cec.cod_category, cec.txt_name
  FROM c_event_category cec
  WHERE NOT EXISTS (
    SELECT 1 FROM d_translation dt
    WHERE dt.txt_entity = 'c_event_category'
      AND dt.txt_entity_key = cec.key_event_category
      AND dt.key_country = 1  -- SK
      AND dt.txt_field = 'txt_name'
  );

  -- Subcategories missing SK translation rows:
  SELECT ces.cod_subcategory, ces.txt_name
  FROM c_event_subcategory ces
  WHERE NOT EXISTS (
    SELECT 1 FROM d_translation dt
    WHERE dt.txt_entity = 'c_event_subcategory'
      AND dt.txt_entity_key = ces.key_event_subcategory
      AND dt.key_country = 1
      AND dt.txt_field = 'txt_name'
  );
  ```
  Spusti tieto v prod po merge tohto PRka. Ak vrátia rows, treba migráciu aby doplnila chýbajúce SK translations (cross-ref BE-P2.7 — Excel `d_translation.xlsx` full sync).

**Cross-ref:** BUG-5 šíri tému širšieho drift-u medzi BE response shape (10+ fields) a `@notifio/shared` schema (6 fields). Ďalšie missing fields ktoré ešte čakajú: `categoryName` (na items level), `locationId`, `locationLabel`, `sendNotifications`, `showOnMap` (Sprint 2 / B1+B3 splits). Je to follow-up audit (zatiaľ netracked) — `quietHoursStart/End` na items level je dokonca **wrong** v shared (BE ich má na top-level `quietHours`).

**Severita:** 🟡 MEDIUM → 🟢 LOW (BE+shared opravené, FE auto-fix po bump, broader drift queued).

### BUG-6 [JARO] · Saved locations nefungujú správne + "free test" v DB ✅ BE DONE 5.5.

**Stav (5.5.2026):** ✅ root cause identifikovaný + BE strana opravená.

**Audit findings:**
- **Skutočná príčina** "doplnkové lokácie sa neukladajú": 2-of-5 enum mismatch medzi `@notifio/shared.LocationLabelSchema` (home/work/school/**gym**/**other**) a Excel + prod DB (home/work/school/**parents**/**cottage**). Strict shared schema nepustila parents/cottage; BE service `lookupLabel('gym')` / `lookupLabel('other')` vrátil null lebo DB ich nemala → silent VALIDATION_ERROR. Iba `home/work/school` kombinácia fungovala.
- **"free test"** = vlastný typed `txt_custom_label` v živom rowe vytvorenom 5.5.2026 15:36 pre user JARO, NIE leftover seed/fixture. Žiadny cleanup nepotrebný.

**BE shipped (5.5.):** PR `fix/be-location-label-add-gym-other` — migrácia **0071** pridáva gym + other do `c_location_label` (Path-C: aditívne, oba enum sety v DB) + Excel update v parallel + audit script `feat/be-audit-shared-vs-excel-codebooks` aby táto drift nikdy nezačal nepozorovane.

**Otvorené (FE/SHARED):**
- **FE-SHARED-LOCATION-LABEL-EXTEND [SHARED]** — bump shared aby enum mal 7 entries (pridať parents+cottage). Bez tohto user nemôže editovať existing parents/cottage lokácie.
- **FE-LOCATION-PICKER-EXTEND [FILIP]** — LocationPicker UI rozšíriť na 7 options + i18n × 6 lokálov pre 4 nové stringy.

**Severita:** 🔴 HIGH → 🟢 BE DONE; FE/SHARED pending

### REQUEST-1 [FILIP] · Login screen redesign s animovaným OSM pozadím
**Vision:** prihlasovacia stránka aktuálne má hore logo + názov + nižšie "Welcome to Notifio". Chce:
- Odstrániť vrchné logo + názov
- Pozadie = full-screen animácia mapy z LOGO-4 OSM Bratislava
- Animácia = vznik a zánik eventov v loope (oranžové pulse markers)
- Text + login buttons cez animovaný background

**Implementation:**
- React Native: `react-native-svg` + `react-native-reanimated` — pulse circles na náhodných coords v meste
- Web: SVG / Canvas + CSS / Framer Motion
- Reusable na splash + onboarding screens
- Performance: low-power, 30fps max idle

**Závislosti:** LOGO-4 v2 (✅ deployed), decision o štýle (radar pulse / fade pin / drift along streets)

**Severita:** 🟢 LOW (vizuálny upgrade)

### BUG-7 [JARO] · Filter "Plánované" chýba v Notifications filtri 🚧 BE DONE 7.5., FE pending
**Repro (4.5.2026, 13:00, mobile screenshot):** Upozornenia → tab "História" → Filter sheet → STAV má 3 možnosti: **Aktívne / Ukončené / Všetky**. Chýba **Plánované** (Naplánované) pre upcoming/future-dated eventy (BVS plánované odstávky, MeteoAlarm forecasts, naplánované cestné práce, ZSD plánované odstávky elektriny).

**Citát:** *"Vo filtri nám stále chýbajú naplánované"*.

**Stav (7.5.2026):**
- ✅ **BE** `feat/be-sprint1-jaro-quick-wins` — `notification-history.service.ts.getHistory()` prijíma optional `status?: 'upcoming' | 'active' | 'resolved' | 'all'`. SQL predikát mapnutý na lifecycle CASE (rovnaký výraz aký už computuje `eventStatus` na response items): `upcoming = dtm_event_from > NOW()`, `active = dtm_event_from <= NOW() AND (dtm_event_to IS NULL OR dtm_event_to > NOW())`, `resolved = dtm_event_to <= NOW()`. **Server-side** filter aby pagination + `total` boli konzistentné s requested slice (predtým FE filtroval client-side cez `eventStatus` field, čo zlomilo "next page" hneď ako sa stránka prečistila).
- ✅ **Controller** `me.controller.ts.getNotifications()` parsuje `?status` z query string, neznáme hodnoty padnú na `undefined` (no filter) — žiadne 400 pre legacy/old apps počas rolloutu.
- ✅ **Swagger** doc updatnutý so štyrmi enum hodnotami + popisom mappingu na lifecycle.
- ✅ **Tests** — pridaný `notification-history.service.test.ts` s pokrytím empty-state, pagination clamp, a všetkých 4 status hodnôt.
- ⏳ **FE follow-up [FILIP]** — viď nižšie `FE-NOTIF-PLANNED-CHIP` (pridať 4. chip "Plánované" v `apps/mobile/components/alerts/filter-sheet.tsx` + i18n × 6 locales). API call: `GET /api/v1/me/notifications?status=upcoming&page=1&limit=20`.

**Cross-ref:** BE-P0.3 (future-dated events fixed v PR #244), MAP-1 (plánované elektrina chýba na mape — rovnaký pattern, FE filter wiring), `FE-NOTIF-PLANNED-CHIP` (Filip lane).

**Severita:** 🟡 MEDIUM → 🟢 LOW (BE done, FE chip je 1-line config v `STATUS_OPTIONS` array + i18n)

### REQUEST-2 [JARO] · Polomer pri reporte udalosti má byť auto-set podľa kategórie, nie manuálny dropdown ✅ BE READY 7.5., FE pending
**Repro (4.5.2026, 12:53, mobile screenshot):** "Nahlásiť udalosť" form → "OVPLYVNENÝ POLOMER" sekcia má 8 ručne voliteľných buttonov: **100m / 250m / 500m / 1km / 2km / 5km / 10km / 20km**. UX issue: typický užívateľ nevie, aký radius je správny pre svoj report.

**Citát:** *"polomer sa ma nastavit automaticky, nie takto cez moznost"*.

**Stav (7.5.2026 audit):**
- ✅ **BE už hotový**: `user-event.service.ts:317` má 3-level fallback chain: `data.radiusM ?? eventTypeRow.defaultRadius ?? DEFAULT_RADIUS_M (1000)`. Keď FE neposlie `radiusM`, BE auto-fillne z `c_event_type.num_default_radius_m` (per-category default z migrácie 0046, plus per-subcategory overrides cez 0044/0046/0058 atď.). Žiadna BE zmena netreba.
- ⏳ **FE follow-up [FILIP]** — `FE-REPORT-AUTO-RADIUS` nižšie. Mobile aj web `event-report-modal.tsx` majú hardcoded `RADIUS_STEPS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000]` + always sendnú explicit `radiusM`. Skryť picker úplne ALEBO presunúť do "Pokročilé nastavenia" collapsed by default + prestať posielať `radiusM` z user-report flow → BE z codebook auto-fillne.

**Defaulty per kategória (referenčné, žijú v `c_event_type.num_default_radius_m`):** `outage_water` 250m, `outage_electricity` 500m, `outage_heat` 300m, `outage_gas` 250m, `outage_internet` 1000m (ISP coverage zone), `traffic_road_closure` 1000m, `traffic_accident` 250m, `traffic_jam` 500m, `flood` 500m. Ops môže tweaknúť cez SQL UPDATE bez redeploy.

**Cross-ref:** `FE-REPORT-AUTO-RADIUS` (Filip lane), QUALITY-1 (kvalita user-reportov sa môže merať aj cez "fallback default vs explicit user choice" ratio — sub-feature pre Phase 3 admin dashboard).

**Severita:** 🟡 MEDIUM → 🟢 LOW (BE už podporuje, FE 1-line skrytie pickera + 1-line drop `radiusM` z payload)

### REQUEST-3 [JARO] · Provider selection chýba pri "Výpadok internetu" (a možno aj pri iných utility kategóriách) ✅ BE DONE (prod fully configured 7.5.)
**Repro (4.5.2026, 12:55, mobile screenshot):** "Vyberte kategóriu" zoznam má `Outage_Internet` → "Výpadok internetu" ako **single button** bez follow-up "Ktorý ISP?". Pre voda/elektrina/plyn/teplo je distribútor implicitný (jedno BVS pre BA, jeden ZSD pre západ, ...), ale ISP má **viacerých konkurenčných providerov**.

**Citát:** *"skontrolovat ci vo vypadky mame moznost vyberu providerov f.e Orange, TELEKOM, o2, swan"* + *"provider sa mal čerpať z source_adapter"*.

**Audit (7.5.2026) — BE je z 80% hotový:**

✅ **Existing BE infrastructure** (P3.1, migrácia **0048**):
- `c_source_adapter.flg_user_selectable BOOLEAN` (default FALSE) — flip na TRUE pre adaptéry ktoré chceme ako user-pickable provider voľbu
- `c_event_subcategory.flg_user_provider_required BOOLEAN` (default FALSE) — flip na TRUE pre subkategórie ktoré **vyžadujú** user pick (e.g. `internet_outage`)
- `user-event.service.ts:107-184` `getAllowedCategories()` — vracia `CategoryOption[]` s `providerRequired: boolean` + `providers: ProviderOption[]` array (ID + name) per subcategory. Auto-selecting provider rows cez `c_event_type.key_source_adapter` JOIN s `flg_user_selectable=true` adapters.
- `user-event.service.ts:234-313` `createEvent()` — when `subcategory.providerRequired === true`, vyžaduje `data.providerCode` ktorý musí byť `c_source_adapter.cod_source_adapter` value s `flg_user_selectable=true` a matching `c_event_type` row pre danú subkategóriu. **Inak 400 VALIDATION_ERROR.**
- API endpoint `GET /api/v1/events/categories` (alebo whatever route — Filip skontroluje) už existuje a vracia tento payload

**Stav v prod (overené 7.5.2026 cez SQL):**

✅ **`c_source_adapter` má všetkých 8 ISP user-pickable rows** (data poskytnuté JAROm, prod state):
- `swan_status` (29) — flg_user_selectable=true, **flg_data_source=true** (jediný ktorý je aj real scraper aj user-pickable)
- `telekom_isp` (30) — flg_user_selectable=true, flg_data_source=false (shadow)
- `orange_isp` (31), `o2_isp` (32), `vodafone_isp` (33), `upc_isp` (34) — všetky shadow user-pickable
- `antik_isp` (35), `other_isp` (36) — shadow + fallback

Plus pre regional distribúrov (water/electric/gas/heat) sú existujúce real scrappers (bvs_outage, sevak_water, stvps_water, tavos_water, vvs_water, zsvs_water, spp_outage, ssd_outage, vsd_electric, zsd_electric, mhth_heat, teho_heat, veolia_outage, termostav_heat) flipnuté na `flg_user_selectable=true`, plus `other_X` shadow rows pre fallback.

✅ **`c_event_subcategory` — všetkých 5 outage subkategórií má `flg_user_provider_required=true`:**
`electric_outage`, `heat_outage`, `internet_outage`, `gas_outage`, `water_outage`.

✅ **`c_event_type` completeness — overené 7.5.2026:** 22 user-pickable (provider × subcategory) kombinácií v prod, každá utility má kompletný set:

| Subkategória | User-pickable provideri (count) |
|---|---|
| `internet_outage` | swan_status, telekom_isp, orange_isp, o2_isp, vodafone_isp, upc_isp, antik_isp, other_isp (**8**) |
| `water_outage` | bvs_outage, sevak_water, stvps_water, tavos_water, vvs_water, other_water (**6**) |
| `heat_outage` | teho_heat, termostav_heat, veolia_outage, other_heat (**4**) |
| `electric_outage` | zsd_electric, other_electric (**2** — SSD + VSD sú flg_active=false v prod) |
| `gas_outage` | spp_outage, other_gas (**2** — SPP je jediný gas distribútor v SK) |

Refined audit query (pre budúcnosť):
```sql
SELECT
  s.cod_subcategory,
  string_agg(a.cod_source_adapter, ', ' ORDER BY a.num_priority, a.cod_source_adapter)
    AS user_pickable_providers,
  COUNT(*) AS provider_count
FROM c_event_subcategory s
JOIN c_event_type et
  ON et.key_event_subcategory = s.key_event_subcategory
  AND et.flg_deleted = false AND et.dtm_valid_to IS NULL
JOIN c_source_adapter a
  ON a.key_source_adapter = et.key_source_adapter
  AND a.flg_user_selectable = true AND a.flg_active = true
WHERE s.flg_user_provider_required = true
  AND s.flg_deleted = false
GROUP BY s.cod_subcategory
ORDER BY s.cod_subcategory;
```

**Lesson learned:** Predchádzajúci CROSS JOIN audit query produkoval 88 false-positive MISSING rows (cross-utility nezmysly ako `electric_outage × bvs_outage`). Refined query iba listuje skutočne nakonfigurované páry — kratšia ako očakávaná dĺžka znamená Excel gap.

⏳ **FE follow-up [FILIP]** — `FE-REPORT-PROVIDER-PICKER` nižšie. `event-report-modal.tsx` už má `useEventCategories()` hook ktorý dostáva `providers[]` array per subcategory (BE už vracia), ale UI **nerendereuje** provider picker. Pridať `<select>` keď `selectedCategory.providerRequired === true`, send `providerCode` v `api.createEvent()`.

**Pre regional distribútorov (water/electric/gas/heat):** každý má real scraper (BVS pre BA, ZSD/SSD/VSD pre elektrinu, atď.) ALEBO shadow row (`other_X`). Auto-select cez geocoded coords je nice-to-have ale **nie blokujúce** — currently user vidí dropdown so všetkými distribútormi a vyberie. Geo auto-select je separate ticket ak chceme.

**Cross-ref:** DATA-3 (Slovanet by mohol byť pridaný neskôr — momentálne nie je v prod ISP set), DATA pre Orange real scraper (future), FE-REPORT-PROVIDER-PICKER (Filip lane), BE-P2.3 event source attribution (event detail by mal zobrazovať provider name z `f_event.cod_source_id` parsing alebo z `c_source_adapter.txt_name` JOIN).

**Severita:** 🟡 MEDIUM → ✅ BE FULLY DONE (verified 7.5.2026); FE pending Filip lane.

### REQUEST-4 [FILIP] · UX redesign "Nahlásiť udalosť" — ikonky namiesto/popri textových názvov + reorder
**Repro (4.5.2026, 12:55-12:57, screenshoty):** aktuálny layout reportu má **vertikálny zoznam textových buttonov** ("Neplánovaný výpadok elektriny / tepla / internetu / plynu", "Uzávierka cesty", "Zatopená cesta", "Cestné práce", "Nehoda", "Dopravná zápcha", "Neplánovaný výpadok vody"). **Mapa "Poloha udalosti"** je až **pod** kategóriami → musíš scrollovať dole.

**Inšpirácia:** screenshot baby-tracker appky (poslaný 4.5. 12:57) — farebné okrúhle ikonky v gridoch pod nadpismi sekcií ("Jedlo", "Aktivita", "Tempo Rastu", "Zdravie", "Nálada", "Dôležitá udalosť"). 4-5 ikoniek v rade s labelmi pod nimi. Vizuálne rýchlejšie pre rozpoznanie.

**Citát:** *"Zvazit pouzite ikoniek miesto nazvov. aky by to malo dopad? Polohu udalosti by som dala navrch a pod tým zoznam/ikonky ako sa dohodneme"*.

**Návrh:**
- **Reorder:** (1) **Mapa "Poloha udalosti" navrch** (sticky alebo pinned), (2) zoznam kategórií dole ako grid s ikonkami
- **Grid layout:** 4–5 ikoniek v rade, okrúhle, farebné podľa kategórie (consistent s map-pin colors)
- **Sekcie:** zoskupené (Výpadky utility / Doprava / Počasie+príroda)
- **Label:** kratší text pod ikonou (napr. "Voda" namiesto "Neplánovaný výpadok vody")

**Otvorené pri triage:**
- Ikony pre všetky user-submittable kategórie (electric/water/gas/heat/internet/road_closure/flood/accident/traffic_jam) — máme set alebo treba design?
- A11y: ikona bez labelu nestačí (screen reader, malé telefóny) → label pod ikonou je nutný
- Mobile vs web layout (web má širší priestor → viac ikoniek v rade)
- Dopad na conversion rate user-submissions — zmerať pred/po cez analytics

**Cross-ref:** FE-P1.2 (FE icons pre 5 kategórií — air_quality, pollen, hydrology, wildfire, outage_internet — môžu byť reused), MAP-UX-2 (cluster tap → list — UX consistency v navigácii)

**Severita:** 🟢 LOW (UX nice-to-have — funkčne nič neblokuje, ale viditeľne zlepšuje first-impression)

### REQUEST-5 [JARO] · Vlastné pripomienky — pridať "Ročne" + "Bi-weekly" recurrence 🚧 BE+shared DONE 7.5., FE pending
**Repro (4.5.2026, 13:01, screenshot):** "Vytvoriť pripomienku" → Opakovanie má 4 možnosti: **Jednorazovo / Denne / Týždenne / Mesačne**. Chýbajú typické use-cases.

**Citát:** *"Vlastne pripomienky, určite treba pridať viac možnosti, minimálne ročne (kvôli narodkam) a bi-weekly"*.

**Audit (7.5.2026) — current state:**

| Layer | Path | Stav |
|---|---|---|
| DB schema | `db/schema/users.ts:300` `dUserReminder.codRecurrence` | `varchar('cod_recurrence', { length: 20 }).notNull().default('ONCE')` — **bez DB CHECK constraint**, jednoducho varchar(20). Žiadna migrácia netreba (nie je enum). |
| BE service | `services/user-reminder.service.ts:10,42` | `RecurrenceType = 'ONCE' \| 'DAILY' \| 'WEEKLY' \| 'MONTHLY'` + `VALID_RECURRENCE` Set tých istých 4. Validation v `createReminder` rejects unknown. |
| BE route | `routes/me.routes.ts:1258` | Zod `RecurrenceSchema = z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY'])` — gate nad service. |
| BE scheduler | `scheduler/user-reminder.scheduler.ts:23-53` `computeNextTrigger` | Switch case `DAILY → +1 day`, `WEEKLY → +7 days alebo recurrenceDays array`, `MONTHLY → +1 month`. ONCE → `null` (disable po triggere). |
| FE shared types | `@notifio/shared/src/schemas/preferences.ts` (alebo similar) | (need verify) |

**Implementation plan (clean — žiadna DB migrácia):**

1. **BE service** `user-reminder.service.ts`:
   - Rozšíriť type union: `RecurrenceType = 'ONCE' \| 'DAILY' \| 'WEEKLY' \| 'BIWEEKLY' \| 'MONTHLY' \| 'YEARLY'`
   - Pridať do `VALID_RECURRENCE` Set: `'BIWEEKLY'` + `'YEARLY'`
2. **BE route** `me.routes.ts`:
   - Rozšíriť `RecurrenceSchema = z.enum(['ONCE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY'])`
   - Update Swagger doc enum hodnotami
3. **BE scheduler** `user-reminder.scheduler.ts:computeNextTrigger`:
   - Pridať `case 'BIWEEKLY':` → `next.setDate(next.getDate() + 14); return next;` (jednoduché)
   - Pridať `case 'YEARLY':` s **leap year handling**:
     ```ts
     case 'YEARLY': {
       // Edge case: 29-Feb trigger v leap roku → next leap rok je o 4 roky.
       // Decision: rok+1 a fallback na 28-Feb v non-leap rokoch (most apps follow this).
       const month = current.getMonth();
       const day = current.getDate();
       next.setFullYear(next.getFullYear() + 1);
       // setMonth nepretočí ak target month má menej dní (Feb 29 → March 1 by Date,
       // ktorý NIE je čo chceme). Force-clamp:
       if (next.getMonth() !== month) {
         next.setDate(0); // posuň na posledný deň predošlého mesiaca = Feb 28
       }
       return next;
     }
     ```
4. **shared package** (`@notifio/shared`):
   - Verify `schemas/preferences.ts` (alebo whatever schema models reminder) — extend any `RecurrenceSchema` enum tam tiež s biweekly + yearly. Bump minor.
5. **i18n** v `@notifio/shared/src/i18n/{sk,en,cs,de,hu,uk}.json` — pridať 2 nové stringy do `reminders.recurrence` namespace:
   - `biweekly`: SK "Každé 2 týždne" / EN "Bi-weekly" / CS "Dvoutýdenně" / DE "Zweiwöchentlich" / HU "Kéthetente" / UK "Раз на 2 тижні"
   - `yearly`: SK "Ročne" / EN "Yearly" / CS "Ročně" / DE "Jährlich" / HU "Évente" / UK "Щорічно"
6. **FE** (Filip lane — `FE-REMINDER-RECURRENCE-EXTEND`):
   - Mobile reminder form — rozšíriť radio buttons z 4 na 6 entries
   - Web ekvivalent
   - i18n keys už v shared (po bumpe)
7. **Tests** — extend `user-reminder.service.test.ts` (alebo whatever) s test cases pre BIWEEKLY (`+14 days`) a YEARLY (incl. leap year edge na 29-Feb)

**Migration potreba:** **žiadna** — `cod_recurrence` je `varchar(20)` bez CHECK constraint, takže nové hodnoty pôjdu cez bez DDL zmeny. Existing rows ostanú validne.

**Stav (7.5.2026):**
- ✅ **shared** `feat/reminder-recurrence-yearly-biweekly` — `ReminderRecurrenceSchema` enum rozšírený zo 4 na 6 hodnôt; JSDoc explicitly dokumentuje leap-year clamp (Feb 29 → Feb 28). i18n keys × 6 lokálov × 2 surfaces pridané. Changeset → minor bump 0.30 → 0.31 po merge.
- ✅ **BE** `feat/be-request5-reminder-recurrence` — `RecurrenceType` union (6 values), `VALID_RECURRENCE` Set, route Zod `RecurrenceSchema` enum, Swagger doc enum hodnotami a opisom leap-year edge, `computeNextTrigger` switch má `BIWEEKLY` (14 days) a `YEARLY` (s explicit `setDate(0)` clamp keď setFullYear posunie Feb 29 mimo February). 13 nových testov v `user-reminder-recurrence.test.ts` pokrývajú: ONCE returns null, DAILY/WEEKLY/MONTHLY regression, BIWEEKLY (14d, month roll-over, year roll-over), YEARLY ordinary, YEARLY Feb 29 → Feb 28 clamp, non-leap pass-through, March 31 no-clamp, unknown value.
- ⏳ **FE follow-up [FILIP]** — `FE-REMINDER-RECURRENCE-EXTEND` nižšie. Mobile + web reminder forms majú radio buttons / picker pre 4 cadences; po `npm install @notifio/shared@^0.31` rozšíriť na 6.

**Cross-ref:** BUG-11 audit (`docs/audit-notification-event-display-2026-05.md`) — reminder notification body je momentálne `description ?? 'Pripomienka'` (`user-reminder.scheduler.ts:103`), čo je **silent default** ktorý môže duplikovať title. Recurrence-aware copy ("Pripomienka — narodeniny mamy (ročne)") je separate scope, queued v BUG-11 fix.

**Effort:** S–M ✅ DONE BE+shared (~3h v 1 sprinte); +1-2h FE radio buttons po shared bump.
**Severita:** 🟢 LOW → 🟢 DONE BE; FE pending Filip lane

### BUG-8 [FILIP] · Kalendár v Pripomienkach je v angličtine + chýba nastavenie "týždeň začína Po/Ne"
**Repro (4.5.2026, 13:04, mobile screenshot):** Upozornenia → tab "Pripomienky" → toggle "Kalendár" → kalendár view zobrazuje:
- Mesiac: **"May 2026"** (anglicky) — pre SK locale by malo byť **"Máj 2026"**
- Day labels: **Sun Mon Tue Wed Thu Fri Sat** (anglicky) — pre SK by mali byť **Ne Po Ut St Št Pi So** (alebo plné mená)
- Týždeň začína **Sun** (US/iOS default) — v EU stardarde **Po (pondelok)**

**Citát:** *"Kalendár je po anglicky, plus keď mame kalendár určite treba dat voľbu do nastavení či týždeň začína nedeľou alebo pondelok"*.

**Hypotézy:**
- (a) Calendar komponent (`react-native-calendars` alebo custom) nedostáva `locale` prop → fallback EN
- (b) `expo-localization` nie je správne integrované s calendarom (web/mobile inconsistency)
- (c) Hardcoded weekStart=0 (Sun) bez možnosti override-u
- (d) i18n keys pre mesiace + day names existujú, ale calendar komponent nepoužíva `t()`/`useLocale`

**Akcie:**
1. **FE i18n:** identifikovať calendar komponent v `apps/mobile/components/reminders/CalendarView.tsx`, pridať `locale={i18n.language}` prop a `firstDay` config
2. **Setting UI:** nový toggle v `/settings` → "Začiatok týždňa: Pondelok / Nedeľa" (default Po pre EU locales sk/cs/hu/de, Ne pre EN-US)
3. **DB:** `d_user.cod_first_day_of_week` (smallint 0=Sun, 1=Mon) alebo cookie/AsyncStorage local-only setting
4. **i18n keys:** mesiace (Január..December v 6 locales), days short + long names — overiť či sú v `messages/*.json` a v shared dictionary
5. **Cross-ref:** BE-P0.5 / FE-P0.3 (i18n infra), REQUEST-5 (yearly reminders pre narodeniny — kalendár je primárny UI pre browsing)

**Severita:** 🟡 MEDIUM (blocking i18n quality — SK/CS/HU/DE/UK userov si všimnú EN texty hneď na top-level UI)

### REQUEST-6 [FILIP] · FAQ + kontakt (technická podpora) v Nastaveniach
**Citát:** *"Treba do nastavení pridať FAQ a kontakt (technická podpora)"*.

**Návrh:**
- Nová sekcia v `/settings` pod "Pomoc" (alebo "Podpora"):
  - **FAQ** — list častých otázok (in-app markdown content alebo embedded WebView na docs site)
  - **Kontakt** — email link (`mailto:support@notifio.sk?subject=...&body=...`) + voliteľne in-app contact form (POST → support inbox)
  - **Verzia appky** — `1.0.0 (build 42)` zobrazenie pre debugging support requestov
  - **Reportovať problém** — automaticky doplní device info, locale, app version, last events do email body

**FAQ obsah (návrh kategórií):**
- Začíname (čo Notifio je, ako sa registrovať, ako pridať lokáciu)
- Notifikácie (prečo nedostávam, ako vypnúť/zapnúť, ako fungujú kategórie)
- Mapa a udalosti (čo znamenajú farby pinov, ako filtrovať, ako reportovať)
- Členstvo (free vs Plus vs Pro, billing, zrušenie)
- Súkromie (GDPR, dáta, mazanie účtu)

**Akcie:**
1. Decision: in-app FAQ obsah (statický markdown) vs externý docs site (Notion / Mintlify / vlastný web)
2. **i18n:** FAQ obsah v 6 locales (najprv SK + EN, ostatné po launch-i)
3. Email setup: `support@notifio.sk` + odkaz na inbox/Helpdesk (Plain.com / HelpScout / jednoduchý Gmail label)
4. **FE:** nový screen `/settings/help` + linky z hlavných error states ("Niečo nefunguje? Kontaktuj nás")
5. Versioning info: `Constants.nativeAppVersion` + `Constants.expoVersion` zobrazenie

**Severita:** 🟡 MEDIUM (UX gap — bez FAQ user pri probléme nemá kde hľadať, contact je standardné expectation)

### REQUEST-7 [FILIP] · App Store / Google Play rating prompt (in-app)
**Repro (4.5.2026, screenshot reference):** referenčný UI z inej appky — heart icon + text *"Ak sa vám páči naša aplikácia, zvážte prosím jej hodnotenie. Budeme radi a pomôžete nám sa zlepšiť!"* + button "Ohodnotiť".

**Citát:** *"Aj toto tam potrebujeme (hodnotenie na app/google store)"*.

**Návrh:**
- Custom in-app dialog (heart + text + "Ohodnotiť" / "Neskôr") → tap "Ohodnotiť" → open **native review prompt** cez `expo-store-review`
- iOS: `SKStoreReviewController` (limit 3× ročne per user, OS rozhoduje či prompt naozaj zobrazí)
- Android: Google Play In-App Review API (`requestReviewFlow()`)
- **Trigger logika:** zobraziť custom prompt iba keď sú "happy moments":
  - User otvoril appku ≥10× (engagement)
  - User dostal a otvoril ≥5 notifikácií (= app dáva value)
  - ≥7 dní od install/last-prompt
  - Žiadne nedávne crash / NPS<7 feedback
  - Nezobrazovať na cold-start (až po niekoľkých sekundách interakcie)
- **Frequency cap:** 1× za 90 dní, max 3× ročne (iOS limit aj tak)

**DB / state:**
- `d_user.dtm_rating_prompted_at` + `cod_rating_outcome` (asked/dismissed/rated/never_again)
- AsyncStorage local fallback ak BE roundtrip pomalý

**Akcie:**
1. **FE:** komponent `<RatingPrompt />` s heart UI + "Ohodnotiť" / "Neskôr" / "Už nie" buttons
2. **Trigger service:** mobile-side hook `useRatingPromptTrigger()` ktorý sleduje engagement signals
3. **i18n:** texty pre 6 locales
4. **Native:** `expo-store-review` install + plat config (App Store ID, Play Store package name)
5. **Web equivalent:** žiadny native prompt na webe → nahradiť linkami na Trustpilot / G2 / vlastný feedback form

**Severita:** 🟢 LOW (growth feature — neblokuje, ale ovplyvňuje store ranking long-term)

### REQUEST-8 [JARO] · Sync / Záloha — overiť či túto feature potrebujeme ✅ DECIDED 7.5. — NETREBA
**Repro:** screenshot inej appky s toggle "Povoliť synchronizáciu — Synchronizujte svoje dáta so všetkými svojimi zariadeniami" + "Záloha — dnes, 7:39:39".

**Citát:** *"Toto nám netreba?"* (otvorená otázka).

**Triage analýza:**
- **Notifio = cloud-first.** Všetky user data (saved locations, custom reminders, notification history, preferences) sú v Supabase Postgres → multi-device sync = automatický cez sign-in. Otvor app na inom telefóne, prihlás sa, dáta sú tam.
- **Local-only state:** dismissed banners, cached map tiles, recent searches — toto by sync potreboval, ale je to edge-case (užívateľ nezvykne mať 3 telefóny)
- **Backup:** Supabase = managed Postgres s automatic backups (point-in-time recovery). User-strana má GDPR data export (BE už má) — to je effectívne backup
- **Záver:** explicitný "Sync" toggle nie je potrebný — sign-in UX je sync. "Backup" toggle nie je potrebný — Supabase ho rieši + GDPR export

**Otvorené pri triage:**
- Ak chceme expose UX pre transparenciu ("vaše dáta sú zálohované") → settings sekcia "Vaše dáta" s textom "Vaše dáta sú bezpečne uložené v cloude. Dátum poslednej zálohy: <auto>" + button "Stiahnuť moje dáta" (existing GDPR export)
- Ak chceme **offline mode** (app funguje bez internetu) → potom treba lokálnu DB (SQLite) + sync algoritmus → veľký scope, mimo MVP

**Decision (formalizovaná 7.5.2026):** **NETREBA** ako separate feature.
- Cloud-first architektúra: sign-in JE sync (otvor app na inom telefóne, prihlás sa, dáta tam sú)
- Supabase managed Postgres má built-in point-in-time recovery (backup je infraštruktúra problem, nie user-facing toggle)
- GDPR data export (BE už má) je effectívne backup pre user-side use
- Žiadny BE/FE work netreba pre závery samotné

**Optional FE follow-up (low-pri):** `FE-SETTINGS-DATA-TRANSPARENCY [FILIP]` nižšie — banner v Settings "Vaše dáta sú bezpečne uložené v cloude" + button "Stiahnuť moje dáta" linkuje na existing GDPR export. Toto je informačná UX clean-up, nie funkčná feature.

**Severita:** 🟢 DONE (decision shipped, feature gap closed)

### REQUEST-9 [JARO] · Share button na udalosti — generated image pre sociálne siete 🚧 BE audit DONE 7.5.
**Citát:** *"Nezabudnúť na share button na udalosti, vytvorí sa obrázok ktorý si ľudia budú môcť posielat (zdielat na sociálnych sieťach)"*.

**Stav (7.5.2026):** ✅ BE foundation audit shipped — `docs/audit-request9-share-og-2026-05.md`. Slúži ako kontrakt pre FE strana (Filip) a tech-stack rozhodnutie pre BE implementáciu.

**Audit summary:**
- Recommended stack: **Satori** (`satori` + `@resvg/resvg-js`) na Node runtime, ~80–150 ms render time, fits Railway
- Endpoint: `GET /api/og/event/:id` → 1200×630 PNG, public (žiadny auth — social scrapers nemajú bearer), Cache-Control 1h browser / 24h CDN, Redis cache `og:event:{id}` per-event
- DB: nová tabuľka `t_event_share` (telemetry: scrape source, channel, referer, hashed user). 90d retention v existujúcom event-retention scheduler
- Deep linking: universal links (iOS) + app links (Android) cez `apple-app-site-association` + `assetlinks.json` na webe
- OG meta tags na webe: `generateMetadata` v Next.js event detail route → `og:image` ukazuje na BE endpoint
- 4-phase implementation: A=BE endpoint+telemetry (M, ~2 dni), B=web FE (M, ~1 deň), C=mobile FE (S, ~půl dňa), D=optional shared types

**Otvorené pre design:** brand decisions (logo + stripe? plain wordmark?), localizácia card text-u, map snapshot (SVG-only vs real tiles), QR code (drop pre v1?), privacy hashing IP. **Blokuje DIA mockup** card layoutu pred štartom Phase A.

**Severita:** 🟡 MEDIUM → 🟢 LOW (audit-only deliverable, implementation queued na DIA design lane)

**Návrh:**
- **Event detail screen** (mobile + web) → share button v top-right
- Tap → vygeneruje **share card image** s:
  - Notifio logo + brand farby
  - Mini mapa s pinom udalosti
  - Title + kategória + čas + lokalita
  - QR code / short URL na deep link
- Otvorí native share sheet (iOS/Android) → user pošle cez WhatsApp/FB/Insta/SMS/Twitter

**Tech approach:**
- **FE mobile:** `react-native-view-shot` + `expo-sharing` — rendrovať skrytý komponent → snapshot → share PNG
- **FE web:** `html2canvas` alebo server-side render (Node + Puppeteer / Satori from Vercel)
- **Server-side OG image (recommended pre web virality):**
  - Endpoint `GET /api/og/event/:id` → vráti 1200×630 PNG
  - Open Graph meta tagy v `/event/:id` web stránke → keď user paste-ne URL na FB/X/Slack, automaticky sa zobrazí preview
  - Tech: Vercel `@vercel/og` (Satori) alebo Cloudflare Workers
- **Deep linking:** universal links (iOS) / app links (Android) → share URL → tap → otvorí Notifio app na konkrétnom evente

**Use cases:**
- "V Petržalke je 5 hodín bez vody, pozrite si mapu" → share na Susedia z Petržalky FB skupiny
- "Cestné práce na D1 — počítajte s kolapsami" → share Twitter/WhatsApp

**Akcie:**
1. **Design:** mock-up share card layoutu (responsive na rôzne udalosti — water vs traffic vs weather)
2. **BE:** `GET /api/og/event/:id` endpoint (Satori SVG → PNG)
3. **FE:** share button v event detail + native share intent
4. **DB:** `f_event_share (key_event_share, key_event, key_user_optional, cod_channel, dtm_shared)` — telemetria + viral attribution
5. **Deep linking:** universal links setup (vyžaduje hosting `apple-app-site-association` + `assetlinks.json`)
6. **Web preview:** OG meta tagy + dynamic image render

**Severita:** 🟡 MEDIUM (growth feature — viral loop je top-3 acquisition channel pre lokálne apps; tiež boost legitimity)

### BUG-9 [JARO] · PRO custom location names — Add Location ukazuje "available with Plus" + locked input ✅ BE DONE 6.5.
**Repro:** prihlásený ako **PRO** user → mobile → Settings → Locations → tap **+** (Add Location). Field "Custom name" je **locked** (read-only / disabled) s hintom **"Custom name available with Plus"**.

**FE check je správny:**
```ts
features.includes('custom_labels')
```

**Bug:** `GET /me/membership` response pre PRO tier **nevracia `'custom_labels'` v `features` array**, hoci PRO by mal mať všetko čo Plus + viac.

**Hypotézy:**
- (a) **Seed gap:** `r_membership_feature` (alebo `c_membership.arr_features_*`) má pre `pro` tier chýbajúci `custom_labels` row. Buď tam nie je vôbec, alebo bol pridaný len pre `plus` tier a forgotten pre `pro`.
- (b) **Response mapper:** `/me/membership` controller vracia features iba pre **explicit tier match** namiesto **inheritance** (pro = plus + pro_extras). Map by mal robiť `features = [...features_free, ...features_plus, ...features_pro]` cez tier hierarchy.
- (c) **Cache stale:** Stripe webhook upgrade Free→PRO neinvalidoval Redis cache pre `/me/membership` → response stále vracia `free` features. (Cross-ref BE-P0-WEBHOOK-CACHE — REFACTOR-#9 mal toto riešiť.)
- (d) **Tier ID mismatch:** user má `key_membership` mapovaný na PRO row v DB, ale features lookup robí join cez `cod_membership` string ('pro') ktorý nesedí (napr. 'pro' vs 'PRO' vs 'pro_monthly').

**Akcie (poradie pri triage):**
1. **SQL audit seedu:**
   ```sql
   SELECT cm.cod_membership, rmf.cod_feature
   FROM c_membership cm
   LEFT JOIN r_membership_feature rmf ON rmf.key_membership = cm.key_membership
   WHERE cm.cod_membership = 'pro'
   ORDER BY rmf.cod_feature;
   ```
   → musí obsahovať `custom_labels` (a všetko z `plus` tieru).
2. **Ak v seede chýba:** migrácia ktorá doplní `custom_labels` do PRO tieru + audit ostatných features (max_locations, push_priority, ad_free, atď.) či PRO má **superset** Plus features.
3. **Ak v seede je:** audit `/me/membership` controller v `notifio-api/src/routes/me/membership.routes.ts` (alebo equivalent) — sleduj kód cez `MembershipService.getFeatures(key_membership)` či robí inheritance alebo iba flat lookup.
4. **Cache check:** vymaž Redis kľúč `membership:user:<key_user>` a refetch — ak sa fix prejaví, je to BE-P0-WEBHOOK-CACHE issue.
5. **FE verification:** po BE fixe overiť že `useMembership()` hook re-fetchne (možno potrebné `queryClient.invalidateQueries(['membership'])` po Stripe webhook signal).

**Cross-ref:**
- **BE-P0.6** (Pricing FE→DB→Stripe sync) — features bundling pre PRO musí byť konzistentný s pricing page
- **BE-P0-WEBHOOK-CACHE** (REFACTOR-#9) — Stripe webhook redis.del() on tier change
- **FE-P0.4** (Pricing UI source-of-truth) — features list by sa mal čítať z DB cez `c_membership` namiesto hardcoded array

**Severita:** 🔴 HIGH → 🟢 BE DONE — paying user už dostane správnu odpoveď.

**Stav (6.5.2026):** ✅ root cause identifikovaný + opravený, **migrácia 0072** + Excel update + 1-line constant fix.

**Audit findings:**
- **Hypotéza (a) confirmed** — `r_membership_feature` mal **ZERO** rows s `cod_feature='custom_labels'`. Excel `r_membership_feature.xlsx` mal rovnaký gap. Feature bol referenced v BE `user-location.service.ts` aj v FE `LocationPicker`, ale nikdy nebol seednutý → **každý tier** failoval check, FE ukazoval "available with Plus" pre všetkých.
- **Hypotéza (b) NEPLATÍ** — `loadFeatures()` v `membership.service.ts` aj `membership-resolve.ts` neinheritoval, ALE Excel mal **manuálne enumerated inheritance** (FREE 19, PLUS 47 = 19 FREE + 28 extras, PRO 61 = 47 PLUS + 14 extras). Code path bol OK, dáta chýbali.
- **Hypotéza (c) — cache stale** — TTL 15 min v `membership-resolve.ts` cache. Po migrácii 0072 buď čakať 15 min alebo `invalidateMembershipCache(userId)` pri tier change. Pre už-cachovaných userov možný workaround `redis del membership:user:*`.
- **Hypotéza (d) — UUID mismatch** — confirmed na inom mieste! `FREE_MEMBERSHIP_ID` constant v `middleware/membership-resolve.ts` mal `a1b2c3d4-...` (z dev seedu, nikdy v prod) namiesto `a0000001-...` (z Excelu = prod). Anonymous requesty padali do hardcoded fallback `features: []` namiesto skutočných FREE features. Opravené pri tej istej PR.

**BE shipped:** PR `fix/be-bug9-pro-custom-labels-feature` — migrácia **0072** (INSERT custom_labels pre PLUS + PRO, idempotentné cez `uq_r_membership_feature`), Excel update, `FREE_MEMBERSHIP_ID` constant fix.

**Cross-ref:** BE-P0-WEBHOOK-CACHE [FILIP REFACTOR-#9] — Stripe webhook redis.del() na tier change už pokrýva post-deploy invalidation pre upgrade flow.

### BUG-10 [JARO] · notification-targeting — "No H3 cells provided → returning empty targets" (silent notification drop) ✅ BE DONE 6.5.
**Repro (4.5.2026, 13:10:07 UTC, prod log):**
```
[2026-05-04 13:03:11.393 +0000] INFO: Scraped active StVPS water faults
    provider: "stvps-water"  count: 8
[2026-05-04 13:05:00.297 +0000] INFO: Scraped active Veolia heat faults
    provider: "veolia-heat"  count: 0
[2026-05-04 13:10:07.003 +0000] WARN: No H3 cells provided — returning empty targets
    service: "notification-targeting"
    eventId: "c2224969-b94c-4f04-8fc3-8722879fac34"
```

**Bug:** Event `c2224969-...` bol úspešne zapísaný do `f_event` (má UUID), ale `notification-targeting` service nevedel zistiť **komu poslať notifikáciu**, lebo dostal prázdny H3 cells array. Výsledok: **zero notifikácie pre tento event** — silently dropped.

**Time correlation:** WARN príde 7 min po StVPS scrape (8 záznamov) — c22... môže byť jeden z nich, ALE tiež môže byť úplne iný event z paralelne bežiaceho adaptera.

**Hypotézy:**
- (a) **Write-side gap:** adapter zapíše `f_event` row s coords + bbox, ale **nezavolá** `polygonToCells()` / `latLngToCell()` enrichment → `arr_h3_cells` ostane null/empty. Konkrétne `stvps-water` adapter je suspekt (8 nových rows tesne pred WARN-om).
- (b) **Geometry chýba alebo je broken:** event má `dec_lat=NULL` / `dec_lng=NULL` (geocoding fail) ALEBO `(0, 0)` / `null island` → H3 conversion vráti empty/nezmysel, ale write-side neabortuje.
- (c) **Polygon-only event bez radius fallback:** napr. weather warning má `area_polygon` ale `dec_lat/lng=NULL` a `polygonToCells()` zlyhá ticho (napr. self-intersecting polygon, alebo coordinates v zlom CRS).
- (d) **Field name mismatch:** event má `arr_h3_cells` populated ale targeting service číta `txt_h3_cells_array` (alebo opačne) — Drizzle column rename nesynced cez všetky service vrstvy.
- (e) **Race condition:** event-write zapíše row, notification-targeting beží na `pg_listen` / queue trigger PRED tým, ako H3 enrichment async job dobehol → empty cells v moment fetch-u.
- (f) **Resolution mismatch:** event má cells na res 9, targeting očakáva res 7 (alebo opačne), `cellToParent` / `cellToChildren` lookup chýba.

**Akcie (poradie pri triage):**
1. **SQL: čo je c22...?**
   ```sql
   SELECT key_event, cod_source_id, cod_event_type, dec_lat, dec_lng,
          arr_h3_cells, area_polygon, dtm_created, dtm_event_from, txt_address
   FROM f_event
   WHERE key_event = 'c2224969-b94c-4f04-8fc3-8722879fac34';
   ```
   → odhalí ktorý adapter, či má coords, polygon, H3 cells.
2. **Systemic check** — koľko events za posledných 24h nemá H3 cells:
   ```sql
   SELECT cod_source_id, COUNT(*),
          COUNT(*) FILTER (WHERE arr_h3_cells IS NULL OR cardinality(arr_h3_cells)=0) AS empty_h3,
          COUNT(*) FILTER (WHERE dec_lat IS NULL OR dec_lng IS NULL) AS no_coords
   FROM f_event
   WHERE dtm_created > now() - interval '24 hours' AND flg_deleted=false
   GROUP BY cod_source_id ORDER BY empty_h3 DESC;
   ```
   → ak per-adapter pattern, dropdown na konkrétny adapter; ak je rozptýlené, code path issue.
3. **Code audit `notification-targeting` service:** kde sa berie H3 cells array zo eventu? Má fallback ak prázdny (napr. derive z `dec_lat/lng` real-time)?
4. **Code audit `event-write.service` / per-adapter normalize:** kde sa volá H3 enrichment? Existuje guard `if (cells.length === 0) throw` alebo iba `console.warn`?
5. **WARN vs ERROR severity:** aktuálne `WARN` → log noise, prejde bez monitorovania. Eskalovať na `ERROR` + Sentry alert ak `arr_h3_cells.length === 0` po enrichment-e (event-write by mal byť atomic — buď je H3 OK, alebo write zlyhá).

**Cross-ref:**
- **BE-P0.10** / **DATA-* coverage** — silent notification drops znižujú effective coverage (event je v DB, ale nikto nedostal push) → real-world coverage je horšia ako SQL counts naznačujú
- **QUALITY-1** [JARO] — kontrola kvality zdrojov by mala monitorovať `empty_h3_rate` per adapter ako metric
- **BE-P1-DATA-DEDUP** — duplicates inflate row count, ale silent drops naopak depliate effective notifications — obe zhoršujú signal-to-user

**Severita:** 🔴 HIGH → 🟢 BE DONE — silent drop path closed.

**Stav (6.5.2026):** ✅ root cause identified + 4-layer fix shipped (PR `fix/be-bug10-locality-fallback-and-loud-drop`).

**Audit findings:**
- Prod má **104 active events bez r_event_h3 cells** (silent drops). Z toho **>20 je BVS-water** s formátom `"Bratislava-Vrakuňa, Hrušovská"` — geocodeLocality(whole) failuje lebo lokality string obsahuje aj ulicu. ďalej SPP `"Pravotice, Nedašovce"`, VVS `"Janovík a Lemešany"`, StVPS `"Bojnice; križovatka - Nemocničná"`, ZSVS `"Regionálna odstávka (Šípkov)"`.
- 4-vrstvový fix:
  1. **`scraper-utils.enrichOutageRecords`** — pridané Tier 3 (split locality cez `,;` ` - ` ` – ` ` — ` ` a `; preserve hyphenated obec names) + Tier 4 (mine title/description for `(parens)`, `Obec X`, `mesta X`, `MČ X`). Per-record `log.error` na MISS.
  2. **`event-write.upsertEvent`** — `log.error` keď `h3Cells.length === 0` (predtým silent). Row sa stále zapíše (Path B per Filip+Jaro decision).
  3. **`scheduler/index.ts` outage path** — explicit guard: skip `enqueueNotification` keď `result.h3Cells.length === 0`. Notifikácia sa neenqueue-ne, nie je čo dropnúť v targeting layer.
  4. **`notification-targeting.findTargetDevices`** — `log.warn` → `log.error`. Po fix-och #1-#3 by toto malo byť unreachable z outage path; ak fire-uje, je to upstream bug worth investigation.

**Backfill:** žiadny manual — naturálne re-poll (5-15 min interval) upsertne 104 stale rows cez `cod_source_id` UNIQUE s opraveným enrichmentom. Do 24h by sa malo všetko prirodzene opraviť.

**Cross-ref:** QUALITY-1 (source quality monitoring) — `f_adapter_run_log.num_geocode_fail` column môže monitorovať per-cycle aggregate vrátane Tier 3-4 hits/misses.

### BUG-11 [JARO] · Notification title/body duplikuje rovnaký info + Event detail screen nezobrazuje description / locality 🔍 audit DONE 7.5.
**Citát (7.5.2026):** *"mame duplikovane udaje o evente. Ked pride notifikacie tak sa zobrazi napr Dnes ma meniny: Hermina a v druhom riadku je Vsetko najlepsie k meninam: Hermina"*.

**Audit:** `docs/audit-notification-event-display-2026-05.md` mapuje **3 overlapping issues**:

1. **Notification title vs body duplikuje rovnaký info** — 11 generation sites v BE, 4 patterns:
   - **Pattern A (full duplicate):** nameday (`Dnes má meniny: X` + `Všetko najlepšie k meninám: X`), weather-warning expired (`Výstraha zrušená: X` + `Výstraha bola zrušená: X`)
   - **Pattern B (body restate title topic):** lifecycle reminders (title=`Pripomienka: ${typeName}`, body=`${typeName}`)
   - **Pattern C (numeric value 2×):** earthquake (magnitude), hydro (stationName), wildfire (FRP)
   - **Pattern D (adapter-emitted):** outage scrappers ssd-electric / stvps-water / tavos-water / vypadokelektriny majú fallback paths kde `description` restates `title` prefix s rovnakou lokalitou
2. **Event detail screen nezobrazuje description ani lokalitu** — `apps/mobile/app/events/[eventId].tsx:131` ukazuje iba `event.type.name` (generic codebook label) + raw `lat/lng` cez `toFixed(4)°`. Address, locality, provider name, description text sú **nikdy renderované**. User notification banner má bohatý body, ale po klik strati context (cross-ref MAP-UX-3 rovnaký problém).
3. **`@notifio/shared/i18n/notificationTemplates`** má iba **title** templates, žiadne body templates → BE musí hardcodeovať SK strings priamo, žiadny systematický spôsob udržať konzistenciu naprieč locale.

**Fix scope (per audit doc):**

| Phase | Repo | Scope | Effort |
|---|---|---|---|
| **A1** | `notifio-shared` | Add `*_body` template keys do `notificationTemplates` (~30 keys × sk+en first). Bump minor. | M (~3-4h) |
| **A2** | `notifio-shared` | Pridať `description / address / locality / providerName` do `EventDetail` schema. Bump minor. | S |
| **B**  | `notifio-api` | Refactor 11 generation sites consume templates namiesto hardcoded SK. Outage adapter fallback dedup. | M (~1 day) |
| **C**  | `notifio-api` | Audit `event.service.getEventDetail()` — confirm response carries `jsn_polygon.{title, description, address, locality, provider}`. Add fields ak chýbajú. | S |
| **D**  | `notifio-fe` (mobile + web) | Event detail screen: render description, address (replace raw coords), provider attribution. Cross-ref MAP-UX-3 + BE-P2.3. | M (~1 day) |
| **E**  | `notifio-shared` (i18n review) | Translator review — fill cs/de/hu/uk pre nové template keys. | S–M |

**Total scope:** ~3-4 days dev + translator review. Multi-repo, recommend phased ship A1+A2 → B+C → D → E v 4 PRs.

**Single user-visible KPI:** *"When user taps a notification, the detail screen shows everything that was in the push (and more)."*

**Cross-ref:** BE-P1-OUTAGE-I18N (re-scope — pôvodne plánované cez `d_translation`, ale templates patria do shared/i18n nie do d_translation), BE-P2.3 event source attribution (resume — branch bola deleted), MAP-UX-3 (rovnaký coord vs address issue), REQUEST-9 (share OG card potrebuje rovnaké rich event metadata), BUG-5 (rovnaký drift pattern: BE generates field, shared schema strips, FE falls back to raw — audit script sa hodí rozšíriť o detection of hardcoded SK strings v BE čo by mali byť shared/i18n keys).

**Severita:** 🟠 MEDIUM (UX consistency + lost notification context — viditeľné na takmer každej notifikácii)

---

# 🆕 NOVÉ SYSTÉMOVÉ POŽIADAVKY (4.5.2026) — [JARO]

### QUALITY-1 [JARO] · Kontrola kvality zdrojov 🚧 Phase 1A+1B DONE 6.5., Phase 2+3 pending
**Goal:** systematicky monitorovať kvalitu dát z 29+ adapterov — coverage, freshness, accuracy, geocoding fail rate, duplicates.

**Stav:** kontroly ad-hoc (BE-P0.10 audit ručne). Coverage drop (Notifio 14 vs ZSDIS 177 BA) odhalený iba dogfoodingom.

**Komponenty:**
1. ✅ **`t_adapter_run_log`** tabuľka per-cycle: `key_run, cod_source_adapter, dtm_started/finished, num_rows_fetched/written/changed, num_geocode_fail, txt_error, num_duration_ms, jsn_metrics, cod_outcome` (column názov matchuje `c_source_adapter.cod_source_adapter` pre intuitívne JOINy). **Spec doc pôvodne navrhoval `f_adapter_run_log`, ale rename na `t_*` per konvenciu (transactional/append-only log) a drop never-written legacy `t_source_poll_log` urobené v migrácii 0074.** Retention: 30d.
2. **Daily quality digest** — per-adapter rows_fetched_24h, geocode_fail_rate, last_successful_run, delta vs 7d avg. Alert ak coverage drop > 30% alebo `last_successful_run > 6h`
3. **Admin dashboard** `/admin/sources` (cross-ref BE-P2.4) — health badge, recent rows, "force run"
4. **Source rating** prepojiť — user-voted credibility × auto-derived freshness/coverage = composite
5. **Duplicate detection** [SHARED s FILIP REFACTOR-#13] — auto scan `(category, lat, lng, title)` tuples

**Stav (6.5.2026):** ✅ **Phase 1A + 1B DONE** v PR #354 (`feat/be-quality1-adapter-run-log`).
- **Phase 1A** (`0970cf3`): migrácia 0074 (vytvára `t_adapter_run_log`, dropne unused legacy `t_source_poll_log` + jeho FK column na `t_notification_batch`); Drizzle schema; `AdapterRunLogService.recordRun()` (best-effort, Pino fallback); `executeOutagePoll` plne inštrumentovaný — pokrýva všetkých 14 outage adapterov cez jeden wrapper.
- **Phase 1B** (`d2d53b6`): `PollStats` interface + `wrapPoll()` helper; refactored 7 simple-poll services (earthquake / hydro / wildfire / traffic-incidents / isp-outage / ba-rozkopavky / zjazdnost) na throw-on-fail + return PollStats; wrap-y v 7 simple-poll schedulers; intelligence schedulers (weather-intelligence / environmental-intelligence) so synthetic codes `weather_intel` / `env_intel`; inline inštrumentácia v weather-warning + nameday + holiday cez `try/finally`; tests update.
- **Test mocks fix** (`379d5cc`): mock adapter-run-log v 3 scheduler test súboroch aby db/connection.ts neboot-oval cez import chain v CI.
- **Decision (6.5.):** žiadny FK z `t_notification_batch.key_run → t_adapter_run_log` — legacy column nikdy nebol naplnený, downstream join cez `cod_source_id` + časové okno stačí, daily digest + dashboard nepotrebujú batch join (cardinality 1:N s asynchronnou queue navyše komplikuje race).

**Otvorené (Phase 2 + 3):**
- **Phase 2** (~půl dňa): daily digest cron (06:00 SK) — per-adapter agregát z `t_adapter_run_log` za 24h + 7d baseline; alert thresholds (last_successful_run > 6h, coverage drop > 30%, geocode_fail_rate > 20%) → Pino error log + optional Slack webhook (env-gated). 30-day retention sweep cron (`45 3 * * *` UTC, po event-retention).
- **Phase 3** (cross-ref BE-P2.4): `/admin/sources` dashboard — per-adapter health badge, recent rows, force-run button. Ak Phase 2 pridá daily rollup tabuľku, Phase 3 z nej kreslí trend lines bez re-aggregating.
- **Component 4** (source rating composite): user-voted credibility × auto-derived freshness/coverage. Cross-ref existing `source-rating.service.ts` (BE side má, FE chýba UI).
- **Component 5** (duplicate detection): cross-ref BE-P1-DATA-DEDUP — `(category, lat, lng, title)` tuples auto-scan.

**Effort:** Phase 1 ✅ DONE · Phase 2 S–M · Phase 3 L · Components 4+5 M each.
**Severita:** 🟠 MEDIUM (foundation done, digest+dashboard ready to extend)

### QUALITY-2 [JARO] · Audit event auto-close + retencia DB
**Concern:** "Nepozdáva sa mi automatické uzatváranie eventov, či si nerušíme eventy ktoré majú stále platiť. Skontrolovať ako sa odmazávajú eventy + retencia, lebo nám napĺňa DB."

**Background:** BE-P0.8 (`c2518c4` daily sweep + 0052 backfill + TomTom 6h rolling TTL) deployed 1.5. Pochybnosti o správnosti heuristiky.

**Akcie:**
1. **Audit current heuristics:** SQL `SELECT cod_event_type, dtm_event_to IS NULL AS open, COUNT(*) FROM f_event WHERE flg_deleted=false GROUP BY 1, 2`. Aké rules má `EventLifecycleService`?
2. **False-close audit:** 50 random eventov uzavretých 24h, manuálne overiť že source feed ich naozaj odstránil
3. **DB size monitoring:** `f_event` row count + growth rate, Supabase storage. **Retention policy:** forever / 90d? Decision potrebné
4. **Soft vs hard-delete:** `pg_cron` job ktorý hard-delete `flg_resolved=true AND dtm_resolved < now() - interval '90d'`?
5. Cross-ref FILIP REFACTOR-#13 (duplicates inflate row count)

**Stav (5.5.2026):** ✅ retention shipnutá — `event-retention.scheduler.ts` s 90d konzervatívnou heuristikou (`dtm_event_to < now()-90d` OR `flg_deleted AND dtm_deleted < now()-90d`), FK cascade migrácia 0067, TTL codebook 0068. Source-driven close (NIE time-driven) zachovaná. `dtm_event_to` ostáva informačné (BE-P0-VERIFY-LIFECYCLE rozhodnutie 4.5.). **Otvorené:** false-close audit (akcia 2) — overiť 50 vzoriek po 7 dňoch produkcie.

**Severita:** 🔴 HIGH (DB napĺňanie + možno strácame valid eventy) → 🟢 LOW (retention live, ostáva audit)

### QUALITY-4 [JARO] · Redis audit ✅ DONE 6.5. (audit-only deliverable)

**Stav (6.5.2026):** ✅ audit shipnutý — `docs/redis-audit-2026-05.md`. Kompletná inventúra 23 key prefixov, 4 risk findings (3 already-tracked, 1 nový), 6 diagnostických Upstash queries, decisions snapshot.

**Audit findings:**
- ✅ Tier 1 (provider response caches): 9 prefixov, všetky majú správne TTL, žiadny eviction risk. Geocode 30-day TTL je intentional (Nominatim 1 req/s rate limit).
- ⚠️ Tier 2 (user state): `membership:user:*` LRU eviction risk pri memory pressure — accept (DB fallback existuje). Stripe webhook stale cache → BE-P0-WEBHOOK-CACHE už tracked.
- ⚠️ Tier 3: `h3:devices:*` SET eviction loses live-GPS targeting → **nový follow-up QUALITY-4-RECOMMENDATION-1** (DB fallback v targeting layer).
- ✅ Tier 4 (scheduler heartbeats, BullMQ): správne TTLs po fix-och z 4.5./5.5.
- ⚠️ Notification key explosion (`notified:*` + `subcat_notified:*`) — math fits within Upstash pay-as-you-go limits (~50-250k keys live), monitor at scale-out.

**Doc obsahuje:** TL;DR, 4-tier inventory table, 4 risk descriptions s decision matrix, 6 diagnostických queries pre Upstash CLI/console, decisions snapshot, cross-refs do existujúcich backlog items.

**Cross-ref:** BE-P0-WEBHOOK-CACHE (Stripe invalidation, queued FILIP), BE-P1-PERF-2 (singleflight at scale-out), QUALITY-1 (`f_adapter_run_log` for adapter-side metrics).

### QUALITY-4-RECOMMENDATION-1 [JARO] · DB fallback v notification-targeting pri h3:devices SET eviction
**Trigger (QUALITY-4 audit, 6.5.):** `h3:devices:{cell}` SETs môžu byť LRU-evicted pod memory pressure → live-GPS targeting silently degraduje (saved-locations users sú OK, lebo Postgres-backed; live GPS users miss alert).

**Akcie:**
1. V `notification-targeting.findAffectedUserLocations` (alebo v live-GPS path) — keď `redis.sunion(h3-cells)` vráti empty pre cell ktoré má aspoň jeden recent `t_device_location` row → fallback na SQL query `SELECT key_device FROM t_device_location WHERE txt_h3_res7 IN (...)`.
2. Pridať do log signál ("h3 cache miss, DB fallback used") + counter.
3. Telemetry monitoring — koľko percent targeting calls fall na DB fallback. Ak >5% → znak že Upstash plan needs upgrade alebo H3 device index treba presunúť do DB ako primary source.

**Cross-ref:** QUALITY-4 audit Risk #2, `notification-targeting.service.ts`, `device-location.service.ts`.

**Effort:** S (~3-4 hodiny — fallback query + log + counter)
**Severita:** 🟢 LOW (zatiaľ žiadny meraný eviction tlak; preventívny)

### QUALITY-5 [JARO] · Forecast coverage check
**Ask:** "Skontrolovať forecast pre všetko či máme."

**Goal:** systematicky overiť že každá kategória pre ktorú má zmysel forecast (počasie, AQ, peľ, hydrológia, traffic outlook, plánované odstávky) má aktívnu predpoveď a používateľ ju vidí.

**Stav (5.5.2026):** ✅ **AUDIT SHIPPED** — `docs/forecast-coverage-audit-2026-05.md` (PR `docs/forecast-coverage-audit-2026-05`). Per Filip 4.5. decision **gap-fill deferred**, audit-only deliverable.

**Audit results:**
- ✅ Wired & forecast-emitting (5): Weather Intelligence, Air quality, Pollen, Planned outages (10 providers), Weather warnings (MeteoAlarm)
- ✅ Upcoming events (3 more): Weather forecast f_event rows, Namedays D+1, Holidays
- ❓ Audit-confirmed gaps (deferred): hydrology crests, wildfire risk, traffic prediction
- ❌ N/A: earthquakes (no scientific sub-day forecast), community user events, source ratings

**Doc obsahuje:** TL;DR, per-category coverage table, 4 verifikačné SQL queries (universal upcoming, WI emit smoke test, planned-outages-by-provider 7d window, zero-coverage regression check, stuck-adapter detection), decisions snapshot.

**Cross-ref:** BE-P0-VERIFY-LIFECYCLE (overlap — forecast eventy nesmú byť auto-closed predčasne), FE-P1-EVENT-TIME-RANGE-FILTER (4-chip segmented control consume forecast events)

**Effort:** S — DONE
**Severita:** 🟢 DONE (gaps separately tracked)

### QUALITY-6 [JARO] · Membership feature drift Excel ↔ prod DB ✅ DONE 6.5.
**Trigger (BUG-9 audit, 6.5.2026):** SQL query proti prod ukázal **64** active features pre PRO tier, ale Excel `r_membership_feature.xlsx` má iba **61**. Net +3 drift v favor prod. Pre PLUS / FREE drift neoverený (možno tiež).

**Akcie:**
1. **SQL diff** — vytiahnuť aktuálny prod feature set per tier:
   ```sql
   SELECT m.cod_membership, rmf.cod_feature
   FROM r_membership_feature rmf
   INNER JOIN c_membership m ON rmf.key_membership = m.key_membership
   WHERE rmf.flg_enabled = true
   ORDER BY m.cod_membership, rmf.cod_feature;
   ```
2. **Compare vs `default/r_membership_feature.xlsx`** — identifikovať 3 features v prod ktoré chýbajú v Exceli + akékoľvek opačné (Excel-only ktoré chýbajú v prod).
3. **Decision per drift:** keep ako-je (prod source-of-truth) ALEBO backport do Excelu (Excel zdroj pravdy). User-pravidlo: Excel = zdroj pravdy → backport.
4. **Migration alebo Excel update** — odstrániť asymetriu.
5. **Rozšíriť audit script** (`scripts/audit-shared-vs-excel.cjs`) o pair `MembershipFeatureCode` ↔ `r_membership_feature.cod_feature` aby sa drift zachytil v budúcnosti — predpokladá že shared bude mať enum / const array s feature kódmi.

**Cross-ref:** BUG-9 (parent), BE-P2.7 (Excel c_event_type sync s DB — rovnaký pattern), audit script extension.

**Stav (6.5.2026):** ✅ Excel updated v PR `fix/be-quality6-7-feature-and-translation-cleanup`. Diff identifikoval 3 features chýbajúce v Exceli pre **každý tier** (FREE/PLUS/PRO): `hydrology_warning`, `internet_outage`, `wildfire_alert` — globálne emergency alerts ktoré sú v prod ale Excel ich nemal back-portnuté. 9 nových rows pridaných do `default/r_membership_feature.xlsx`. Po update: prod 22/51/65 = Excel 22/51/65 ✓. **Žiadna DB migrácia netreba** — features už sú v prod, drift bol Excel→DB direction.

**Effort:** S — DONE
**Severita:** 🟢 DONE

### QUALITY-7 [JARO] · Cleanup orphan d_translation rows pre `c_membership` ✅ DONE 6.5.
**Trigger (BUG-9 audit, 6.5.2026):** Migrácia 0060 + dev seedy `001/002_*.sql` vkladali `d_translation` rows s `txt_entity='c_membership', txt_entity_key='a1b2c3d4-...'` — UUID family ktoré v prod **neexistuje** (prod `c_membership` má `a0000001-...` z Excelu). Tieto translation rows sú orphan — žiadny BE service ich nečíta, ale žijú v DB.

**Akcie:**
1. **Verify orphan count:**
   ```sql
   SELECT COUNT(*) FROM d_translation 
   WHERE txt_entity = 'c_membership' 
     AND txt_entity_key LIKE 'a1b2c3d4-%';
   -- expected: ~30+ rows (6 locales × 3 tiers × 1-2 fields per migration 0060)
   ```
2. **Decision:** delete ALEBO re-key (UPDATE txt_entity_key from 'a1b2c3d4-…000NNN' to 'a0000001-…000NNN' — bullet by bullet). **Ja navrhujem delete + re-seed cez Excel** — translation by mali byť v Excel zdroji pravdy, nie hand-curated v migráciách.
3. **Future-proof:** v `seeds/001_codebooks.sql` + `seeds/002_translations.sql` migrovať UUIDs na prod-compatible formát (alebo nechať ako separate dev fixture s vlastnou self-consistent UUID schemou — ujasniť konvenciu).

**Cross-ref:** BUG-9 (parent), BE-P2.7 (codebook sync), QUALITY-6.

**Stav (6.5.2026):** ✅ Path C aplikovaný v PR `fix/be-quality6-7-feature-and-translation-cleanup`. Migrácia **0073** UPDATE-uje 18 orphan rows v `d_translation` (txt_entity='c_membership') z legacy `a1b2c3d4-...` UUID family na prod `a0000001-...` (preserve content, re-key target). Excel mirror `default/d_translation.xlsx` updated v parallel. Idempotentné (UPDATE WHERE legacy UUID = no-op druhý beh). **Out of scope** (separate cleanup ak treba): `seeds/001_codebooks.sql`, `seeds/002_translations.sql`, mig 0060 — historical/dev-only fixtures, ich migration-discipline (BE-P2-REFACTOR-3) bráni edit-u.

**Effort:** S — DONE
**Severita:** 🟢 DONE

### QUALITY-3 [JARO] · Error logging / tracking system
**Ask:** "Potrebujeme vytvoriť logy pre chyby, aby sme vedeli trackovať chyby."

**Stav:** Pino → stdout (Railway). Chýba persistent error tracking pre unhandled exceptions, adapter failures, DB violations, 500s.

**Návrh:**
1. **Sentry SDK** (1 deň): `@sentry/node` BE, `@sentry/react` web, `sentry-expo` mobile. Free tier 5k events/mo.
2. **DIY** (3 dni): `f_error_log` table + admin viewer. Express middleware + cron sweep > 30d.
3. **Hybrid:** Sentry pre crashes + DIY pre business-level events (adapter failures, geocoding misses)

**Decision (Filip 4.5.):** **DIY** — vlastná tabuľka `f_error_log`, žiadny Sentry. Anonymné client-error ingestion + rate-limit 10/min/device, bearer optional.

**Stav (5.5.2026):** ✅ BE shipnuté:
- Migrácia 0069 `f_error_log` (key_error_log, key_request_id, cod_module, cod_severity, cod_error_type, txt_message, txt_stack, jsn_context, key_user, dtm_created) + 5 indexes
- `error-logger.service.ts` — SHA-256 hashed user IDs (env `ERROR_LOG_USER_HASH_SALT`), best-effort writes (Pino fallback ak DB fail), 8KB stack cap, hash format zachovaný ako UUID aby `key_user` ostal `uuid` typ
- `error-handler.ts` middleware — fire-and-forget log call po Pino warn/error
- `POST /api/v1/client-errors` route — anonymný endpoint, rate-limit 10/min/device, prefer `x-device-id` header, fallback IP
- Admin viewer + 30d sweep cron: pending (samostatný admin ticket)

**Otvorené (FE):** FE-P1-ERROR-REPORTER-WEB + FE-P1-ERROR-REPORTER-MOBILE — viď nižšie. Bez FE-side klientov je BE endpoint hotový ale nepoužívaný.

**Severita:** 🟠 MEDIUM → 🟢 LOW (BE done; FE pending Filip lane)

---

# 🗺️ MAP UX BACKLOG (mostly FILIP)

### MAP-UX-1 [FILIP] · Dynamické zobrazenie eventov v zobrazenom okne (nie radius)
**Ask:** "zobrazovanie udalosti v okoli by malo byt dinamicke a zaroven nie v okoli ale v zobrazenom okne."

**Stav:** Aktuálne `/events?lat&lng&radius=20000` query — 20km kruh okolo user. Pri zoom-out na celé Slovensko user vidí iba 20km okolie svojej polohy, ostatné chýbajú. Pri pan na inú časť mapy → fetch sa nepohne.

**Návrh:**
- API: `GET /events?bbox=south,west,north,east` namiesto `lat&lng&radius`
- FE: viewport-based refetch on map move/zoom (debounced 500ms — už spomenuté v FE-P1.3)
- BE: `event.service.ts` accept bbox, query `dec_lat BETWEEN s AND n AND dec_lng BETWEEN w AND e`
- H3 spatial: bbox → cover cells via `polygonToCells` → query
- Cap rezultátov pre veľké bbox (napr. celé SK = thousands of pins → cap 500 + cluster)

**Cross-ref:** FE-P1.3 (viewport refetch je tam ako sub-bullet — promote to top-level), MAP-UX-2 (cluster on identical coord)

**Effort:** M (BE bbox endpoint + FE viewport hook)
**Severita:** 🟠 MEDIUM (core map UX — user expects events kde sa pozerá, nie tam kde stojí)

### MAP-UX-2 [FILIP] · Detail udalosti — preklik z mini-mapy späť na hlavnú mapu
**Ask:** "detail udalosti - cez mapu preklik naspat na event na mape."

**Stav:** Event detail screen má pravdepodobne mini-mapu s polygónom / pinom (event detail map shipnutý v PR #80 commit `3358f0c`). Tap na túto mini-mapu nemá akciu (alebo má iba zoom).

**Návrh:**
- Tap mini-map → navigate `/map?eventId={id}&zoom=14` (web) alebo `router.push("/map?eventId=...")` (mobile)
- Map screen detect query param → center na event coords + open pin callout
- Spätná navigácia (back button) sa vráti na detail (ak je v history)

**Effort:** S (1-2 hodiny FE)
**Severita:** 🟢 LOW (navigation polish)

### MAP-UX-3 [FILIP] · Detail udalosti — názov polohy namiesto GPS súradníc
**Ask:** "Poloha v detaile ak by sa dalo nazov nie gps."

**Stav:** Event detail pravdepodobne zobrazuje `dec_lat, dec_lng` ako numerický string (alebo coordinate format) namiesto reverse-geocoded názvu adresy.

**Návrh:**
- BE: `f_event.txt_address` má geocoded address (z forward geocoding pri ingest-e). Project ho na response ako `event.locationName`
- FE: zobraz `event.locationName` namiesto `lat, lng` (alebo s lat/lng ako secondary label)
- Fallback: ak `txt_address` chýba (vzácne), použiť reverse-geocoding na klient (Nominatim) alebo zobraziť coords

**Cross-ref:** BE-P0.9 (geocoding personal name leak — fixnuté 1.5., redaction stripping pattern)

**Effort:** S (BE field projection + FE label swap)
**Severita:** 🟢 LOW (UX nice-to-have)

### MAP-UX-4 [FILIP duplicate ref] · Cluster tap → list všetkých
**Ask:** "a este ked na ne kliknem chcem vidiet skupinu vsetkych."

**Cross-ref:** FE-P0-WEB-CLUSTER (web port), Mobile `ClusterEventsSheet` už shipnutý.

---

# 🔑 PERMISSIONS UX (FILIP)

### PERMS-1 [FILIP] · Nepýtať notifikácie/polohu opakovane keď už boli povolené
**Ask:** "Filip aby nebolo potrebne stale povolovat notifikacie ak uz raz boli povolene a zaroven aby nebolo potrebne stale povolovat polohu ak uz bola povolena. mali by sme viac citat z nastaveni telefona, co povolil aplikacii."

**Stav:** PUSH-1 fix (commit `1bab978`, 1.5.) pridal `checkPermissions()` rehydration na mount. Lenže pravdepodobne aj UI ho znovu pýta.

**Hypotézy:**
- (a) Onboarding flow (po sign-in alebo na app re-open) má pevný step "request notification permission" + "request location permission" bez kontroly či už máme grant
- (b) `LocationStatusBanner` / `PushNotificationsToggle` znovu spustia request flow keď user navštívi settings
- (c) FE state sa neupdátuje po app foreground → permissions cached false aj keď už sú true v OS

**Akcie:**
1. Boot flow audit: `apps/mobile/app/(authed)/_layout.tsx` + onboarding screens
2. Skontrolovať že `expo-notifications.getPermissionsAsync()` + `expo-location.getForegroundPermissionsAsync()` sa volajú na mount
3. Skip onboarding "Allow X" steps ak `status === 'granted'`
4. Settings UI: zobraz aktuálny stav (granted/denied/blocked) namiesto generického toggle
5. **Reading device settings vs in-app preferences** — clarify rozdiel:
   - **OS permission** (granted/denied) — system-level, FE iba čítá
   - **In-app preference** (user toggle "send me traffic alerts") — user-controllable, ortogonálne
   - User flow: OS denies notif → settings banner "Notifikácie sú vypnuté na úrovni OS, otvor nastavenia"; OS allows → in-app toggle riadi delivery. **Cross-ref BUG-2** (in-app toggle ignored)

**Effort:** S-M (boot flow audit + UI tweaks)
**Severita:** 🟠 MEDIUM (UX paper cut — cíti sa amaterské pýtať dookola)

---

# 🌐 LANDING PAGE & ONBOARDING

### LANDING-1 [FILIP] · Odstrániť logo z hlavičky prihlasovacej stránky
**Ask:** v top hlavičke prihlasovacej stránky aktuálne logo + názov "Notifio". Odstrániť.

**Cross-ref:** REQUEST-1 [JARO] (login screen redesign s OSM animáciou) — overlap. Pri implementácii REQUEST-1 odstránenie logy je súčasť scope.

**Severita:** 🟢 LOW (vizuálny cleanup)

### LANDING-2 [FILIP] · Jazyk picker na landing page
**Ask:** doplniť language switcher na landing page (mimo už existujúceho na webe v avatar dropdown).

**Kontext:** webový language switcher 1.5. presunutý do avatar dropdown (PR `6d36385`) — viditeľný iba pre prihlásených. Landing page (anonym users) zostal bez switchera → user nemôže meniť jazyk pred login.

**Akcie:**
1. Pridať komponent `<LanguageSwitcher />` (existujúci) na `apps/web/src/components/landing/navbar.tsx`
2. Decision: 6-pill (predošlá UI) vs compact dropdown vs flag-icon menu
3. Cookie persistence rovnako ako autenticovaná verzia

**Severita:** 🟠 MEDIUM (blokuje non-SK users na landing)

### LANDING-3 [FILIP] · Zmeniť landing page (general redesign brief)
**Ask:** "Zmenit landing page" — vyžiadať konkrétny brief od Filipa (čo zmeniť — copy, layout, sections, CTA).

**Cross-ref:** LANDING-4 (Dia má design lane), REQUEST-1 (login redesign).

**Severita:** ❓ TBD (depends on brief)

### LANDING-4 [DIA] · Navrhnúť landing page (design lane)
**Owner:** Dia (nový člen tímu)
**Ask:** úloha = "navrhnúť landing page".

**Outputs očakávané:**
- Wireframe / mockup (Figma alebo iný design tool)
- Mobile + desktop breakpoints
- Dark mode parity (Notifio má dark UI baseline)
- Brand colors (`#0E223F` navy, `#FF7A2F` orange, `#2A4870` river)
- LOGO-4 v2 OSM map ako možný background motív (consistent s app icon)

**Hand-off:** keď Dia odovzdá design, FILIP / FILIP si ho prevezme na implementáciu.

**Severita:** 🟢 LOW (parallel s ostatnými lanes)

---

# 🖥️ BACKEND — aktívna prioritizácia

## 🔴 BE-P0 — produkčné

### BE-P0.1 [JARO] · Dokončiť LIVE Stripe webhook + Railway rollback
**Stav:** TEST mode overený end-to-end. LIVE config pending (~15 min).

1. Stripe Dashboard → LIVE → vytvoriť webhook endpoint URL `https://notifio-api-production.up.railway.app/api/v1/payments/webhook`, eventy `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`
2. **Rotovať LIVE secret key** (vystavený v konverzácii 24.4.)
3. Railway env: `STRIPE_SECRET_KEY` → `sk_live_...`, `STRIPE_WEBHOOK_SECRET` → `whsec_...`, 4× `STRIPE_PRICE_*`
4. Test LIVE checkout (2.99€, refund)
5. Over logy

### BE-P0-WEBHOOK-CACHE [FILIP REFACTOR-#9] · Stripe webhook redis.del() on tier change
**Symptom:** Po PRO upgrade FILIP videl stále teasery 15 min lebo Redis cache `membership:user:{userId}` mala stale FREE features (15-min TTL).

**Akcia:** v `auth/stripe-webhook.controller.ts` po update `d_user.key_membership` zavolať `redis.del("membership:user:" + userId)`. Pridať aj na user-initiated tier-change.

**Effort:** S (1 line)
**Severita:** 🔴 HIGH (user-visible bug, trivial fix)

### BE-P0.6 [JARO] · Pricing FE→DB→Stripe sync (€5.99 vs €4.99)
**Repro:** FE pricing **€5.99/mes** Pro tier, Stripe billing portal **4.99 €/mes**.

**Návrh:**
1. Tabuľka `c_membership_tier (cod_tier, cod_stripe_price_id, num_price_eur, cod_currency, cod_billing_period, arr_features_*, flg_active, flg_featured, num_sort_order)`
2. Endpoint `GET /api/v1/membership/tiers?locale=sk`
3. Stripe webhook: `price.updated`, `product.updated` → upsert
4. FE `useMembershipTiers()` hook nahradí hardcoded objekt

**Cross-ref:** FE-P0.4

### BE-P0-VERIFY-LIFECYCLE [JARO] · Re-overiť BE-P0.8 heuristiky
**Cross-ref s QUALITY-2.** BE-P0.8 deployed 1.5., user pochybuje. Akcie tam.

---

## 🟡 BE-P1 — kvalita & coverage

### BE-P1-OUTAGE-I18N [JARO] · Outage descriptions cez d_translation
Aktuálne všetky outage descriptions raw SK z adaptera, neprekladajú sa pre EN/CS/HU/DE/UK. Refactor BVS/SPP/ZSD/Veolia/MHTH/ZSVS/Slovanet adapterov na `tAll('notificationTemplates.<key>', vars)` + zmena response shape pre map pin tooltips. 1-2 dni.

(Promote z BE-P2.2 — bol odložený)

### BE-P1-TEST-INFRA [FILIP REFACTOR-#6] · Real-Postgres test layer
**Symptom:** Events SQL hotfix saga 1.5. — 4 sequential SQL bugy odhalené až v produkcii. Mocked unit testy passli, real Postgres parsoval/binoval ináč.

**Návrh:** Testcontainers s Postgres image + migrácie v CI, integration tier pre query-binding correctness.

**Effort:** M setup → S per test
**Severita:** 🔴 HIGH (najvyššia páka — saga = 1 deň cascading prod fixov)

### BE-P1-PERF-2 [JARO] · Redis-backed translation cache
Pre horizontal scaling (2+ Railway pods). Aktuálne in-memory per-pod cache pri scale-out → každý pod cold start `loadLocale()`.

### BE-P1-PERF-3 [JARO] · Scheduler per-adapter timeouts + circuit breakers
14 outage adapterov, sequential 10s stagger pri startup-e bez per-adapter timeout-u. Hangujúci scraper (Nominatim) zablokuje ostatné. `Promise.race(timeout)` + concurrency limit.

### BE-P1-DATA-DEDUP [FILIP REFACTOR-#13 + JARO QUALITY-1 dup detection] · Identical-coord events
**Symptom (FILIP 1.5.):** `/events?lat=48.1486&lng=17.1077&radius=20000` vracia 19 eventov, ale 2 coord clustre obsahujú 4× a 7× duplicate gas outages na rovnakých coords s rovnakým titlom (rôzne eventId).

**Príklad:** 7 identických na `48.14060, 17.11230` všetko `category: outage_gas`, `txt_title: "Porucha plynu – Bratislava Staré Mesto"`. SPP scraper emituje per-affected-building.

**Návrh:**
- **(a) Dedup at ingest** — `event-write.service.ts` collapse `(category, lat, lng, title)` tuples na 1 row + `affectedAddressCount: N`. Cleaner, vyžaduje migration backfill.
- **(b) Aggregate at read** — feed query `GROUP BY (category, lat, lng) WITH count(*)`. Less invasive, platí pri každom čítaní.

**Diagnostic SQL:**
```sql
SELECT json_build_object('lat', dec_lat, 'lng', dec_lng) AS coord, txt_title,
       count(*) AS dup_count, array_agg(key_event) AS event_ids
FROM f_event WHERE flg_active = true
GROUP BY dec_lat, dec_lng, txt_title HAVING count(*) > 1
ORDER BY dup_count DESC LIMIT 20;
```

**Effort:** S (read-time) → M (ingest s backfill)
**Severita:** 🟠 MEDIUM (user-visible — 7 stacked pinov)

### BE-P1-EVENT-STATUS-NOTIF [FILIP REFACTOR-#14] · Add eventStatus to NotificationHistoryItem
**Symptom:** `/me/notifications` vracia items s `eventId` ale bez `eventStatus`. FE nemôže filtrovať notifikácie pre upcoming/active/resolved bez fragile string matching `title.startsWith('Pripomienka:')`.

**Blokuje:** "Plánované" tab na notifications screen (FE shipped 3-tab, 4. tab queued).

**Návrh:** v `/me/notifications` query JOIN na `f_event` + project `eventStatus` cez existujúce `computeEventStatus()`.

**Stav:** BE shipnuté (`feat/be-event-status-notif`, merged 4.5.). `eventStatus` (`'upcoming' | 'active' | 'resolved' | null`) sa už projektuje cez LEFT JOIN na `f_event` v `notification-history.service.ts`. **Ostáva FE consume** — viď `FE-SHARED-EVENT-STATUS-TYPE` + `FE-NOTIF-PLANNED-TAB` nižšie.

**Effort:** S — DONE BE side
**Severita:** 🟢 LOW (UX nice-to-have)

### FE-SHARED-EVENT-STATUS-TYPE [FILIP] · Bump @notifio/shared — pridať eventStatus do NotificationHistoryItem
**Goal:** rozšíriť shared TypeScript type pre notification history items o nové BE pole `eventStatus`, aby web + mobile mohli filtrovať bez ad-hoc string matchingu.

**Predchodca:** BE-P1-EVENT-STATUS-NOTIF (BE už posiela `eventStatus` na response). Bez bumped shared package FE má `(item as any).eventStatus` workaround.

**Akcie:**
1. **`packages/shared/src/types/notification.ts`** — pridať `eventStatus?: EventLifecycleStatus | null` do `NotificationHistoryItem` interface (optional pre back-compat počas roll-out)
2. **Re-export `EventLifecycleStatus`** z `@notifio/shared/types` (už existuje pre `Event` type) — žiadny nový type, len re-export point pre FE consumers
3. **Bump shared verzia** — minor bump (napr. `0.22.0 → 0.23.0`), npm publish do GitHub Packages registry
4. **Update both FE workspaces** — `apps/web/package.json` + `apps/mobile/package.json` na novú verziu, `npm install`
5. **Verify type narrowing** — `if (item.eventStatus === 'upcoming') { ... }` musí byť type-safe v oboch workspaceoch

**Cross-ref:** BE-P1-EVENT-STATUS-NOTIF (BE source), FE-NOTIF-PLANNED-TAB (consumer), TECH-DEBT-1 (shared verzia drift hypotéza pre staré errors)

**Effort:** S (~1 hr — pridať pole, bump version, npm publish, double npm install)
**Severita:** 🟢 LOW (blokuje len 4. tab vo Notifications, ostatné funguje)

### FE-SHARED-LOCATION-LABEL-EXTEND [SHARED] · Bump @notifio/shared — pridať parents + cottage do LocationLabelSchema ✅ DONE 5.5.
**Trigger (BUG-6, 5.5.2026):** Audit `npm run audit:codebooks` odhalil 2-of-5 enum mismatch — shared mal `home/work/school/gym/other`, Excel + prod DB malo `home/work/school/parents/cottage`. BE strana opravená cez Path-C v migrácii 0071 (DB + Excel teraz majú 7 labels). Shared však stále vidí iba 5 — užívatelia s existujúcimi `parents` / `cottage` lokáciami **nemôžu ich editovať** (PATCH validation reject), iba čítať.

**Predchodca:** PR `fix/be-location-label-add-gym-other` (BE-shipped 5.5., čaká produkčné `npm run db:migrate` pre 0071).

**Akcie:**
1. **`packages/shared/src/types/user.ts`** — rozšíriť `LocationLabelSchema` enum:
   ```ts
   export const LocationLabelSchema = z.enum([
     "home", "work", "school", "gym", "other",
     "parents", "cottage",  // added 5.5.2026 — match c_location_label codebook
   ]);
   ```
2. **Bump shared verzia** — minor (`0.23.0 → 0.24.0`), npm publish do GitHub Packages
3. **Update both FE workspaces** — `apps/web/package.json` + `apps/mobile/package.json` na novú verziu, `npm install`
4. **Verify audit clean** — po deploy `npm run audit:codebooks` v `notifio-api/` vráti exit 0
5. **Guidance pre FE update** (FE-LOCATION-PICKER-EXTEND nižšie)

**Cross-ref:** BUG-6, BE PR `fix/be-location-label-add-gym-other`, BE PR `feat/be-audit-shared-vs-excel-codebooks` (audit script ktorý túto drift detekuje)

**Owner:** [SHARED] — buď JARO (zvládne shared bump aj on, je to 1-line zmena enum + version) alebo Filip (FE side musí aj tak update). Decide podľa toho kto má GitHub Packages publish prístup.

**Stav (5.5.2026):** ✅ shipnutý PR `feat/location-label-extend-and-i18n` v `notifio-shared` repo (base=`main`). Path 2 — enum **+** i18n keys: rozšírený `LocationLabelSchema` z 5 na 7, plus `locations.labels.parents` + `locations.labels.cottage` doplnené v 6 lokáloch (sk/en/cs/hu/de/uk). Changeset attached → po merge changesets bot bumpne 0.25 → 0.26, publish do GitHub Packages. Po publish: `npm install` v `notifio-api` + oba FE workspace.

**Effort:** S — DONE BE/SHARED side
**Severita:** 🟠 MEDIUM → 🟢 DONE (čaká iba merge + publish)

### FE-LOCATION-PICKER-EXTEND [FILIP] · LocationPicker rozšíriť na 7 labels (web + mobile)
**Predchodca:** FE-SHARED-LOCATION-LABEL-EXTEND musí byť shipnutý (shared verzia s parents+cottage).

**Goal:** UI v `LocationPicker` (web + mobile) zobrazí všetkých 7 labels namiesto súčasných 5. User môže vybrať `parents` alebo `cottage` pri pridávaní lokácie + editovať existujúce.

**Akcie:**
1. **Mobile `apps/mobile/components/locations/location-picker-modal.tsx`** — rozšíriť `LABEL_VALUES` z 5 na 7: `['home', 'work', 'school', 'gym', 'other', 'parents', 'cottage']`. Tiež `apps/mobile/app/settings/locations.tsx` `KNOWN_LABEL_CODES` z 5 na 7 (pre `isKnownLabelCode` type guard). Po tejto zmene parents/cottage rows v list view zobrazia správny text z `t('locations.labels.${code}')` (i18n keys už pribudli v shared 0.26 v rámci FE-SHARED-LOCATION-LABEL-EXTEND, all 6 lokálov hotové).
2. **Web `apps/web/src/components/app/location-modal.tsx`** — rozšíriť hardcoded `LABEL_OPTIONS` array z 5 na 7 entries.
3. **i18n** — **NETREBA** (shared 0.26 už obsahuje všetkých 14 keys: home/work/school/gym/other/parents/cottage × sk/en/cs/de/hu/uk). FE iba `npm install` po publish.
4. **Default ikony** — vybrať 2 ikony pre parents/cottage (existujúce 5 už sú v UI). Hľadať Lucide ikony: `Home / Briefcase / GraduationCap / Dumbbell / MapPin / Users / TreePine` alebo podobné.
5. **Verify** — pridať lokáciu s každým z 7 labels, edit existing, delete. Plus `cd notifio-api && npm run audit:codebooks` → exit 0 ✓

**Cross-ref:** BUG-6, FE-SHARED-LOCATION-LABEL-EXTEND, audit script (po deploy beží zelený)

**Effort:** S-M (~3-4 hodiny — 2 platformy × picker UI + i18n × 6 lokálov × 4 nových strings)
**Severita:** 🟡 MEDIUM (UX consistency — bez tohto user nevidí parents/cottage v pickri ale BE ich vie uložiť)

### FE-REPORT-PROVIDER-PICKER [FILIP] · Event report modal — pridať provider picker pre user-selectable subkategórie
**Predchodca:** REQUEST-3 BE+prod konfigurácia hotová 7.5. — `getAllowedCategories()` API už vracia `providers[]` array per subcategory pre 5 outage subkategórií (`internet_outage`, `electric_outage`, `water_outage`, `gas_outage`, `heat_outage`). 8 ISP providerov + regional distribútori + `other_X` fallbacks pre každú utility subkategóriu sú v prod DB.

**Aký je teraz stav:**
- Mobile `apps/mobile/components/events/event-report-modal.tsx` — `useEventCategories()` hook fetchne `CategoryOption[]` ktoré obsahuje `providerRequired: boolean` + `providers: ProviderOption[]` array (cesta `code`, `name`)
- UI **NERENDERuje provider picker** — keď user vyberie `internet_outage` (alebo iný outage_*), formulár nepýta provider, submit ide **bez `providerCode`** → BE vráti **400 VALIDATION_ERROR** "Provider is required for subcategory ..."
- Teda v aktuálnom prod state, **user-reported outage_* events nie sú možné** kvôli FE gap (BE strana validuje correctly).

**Ako má byť:**
- Po výbere kategórie ktorá má `providerRequired === true`, formulár zobrazí druhý picker s providers list (`providers[]` z `getAllowedCategories` response)
- Submit `api.createEvent({ subcategoryCode, providerCode, lat, lng })` — provider code ide ako separate field
- BE validuje provider × subcategory combo cez `c_event_type` JOIN; ak combo neexistuje → 400 z BE

**Akcie:**
1. **Mobile** `apps/mobile/components/events/event-report-modal.tsx`:
   - Pridať state `selectedProvider: ProviderOption | null` reset-nutý pri zmene kategórie
   - Render `<View style={styles.providerSection}>` s nadpisom `t('eventReport.selectProvider')` + zoznam pickable providerov (rovnaký pattern ako category list, ale podzoznam)
   - Conditionally render iba keď `selectedCategory.providerRequired === true`
   - Submit button disabled keď `providerRequired && !selectedProvider`
   - V `handleSubmit` pridať `providerCode: selectedProvider?.code` do `api.createEvent()` payload
2. **Web** `apps/web/src/components/app/event-report-modal.tsx` — to isté
3. **i18n keys** — pridať do `notifio-shared/src/i18n/{sk,en,cs,de,hu,uk}.json`:
   - `eventReport.selectProvider` (SK "Vyberte poskytovateľa" / EN "Select provider" / atď.)
   - `eventReport.providerRequired` (validation hint, "Pred odoslaním vyberte poskytovateľa")
4. **Verify** — pripojiť ako PRO user, vybrať `Výpadok internetu`, picker by mal ukázať Telekom/Orange/O2/Vodafone/UPC/Antik/SWAN/Iný + povinný výber pred submit

**Cross-ref:** REQUEST-3 (parent), `user-event.service.ts:107-184` (`getAllowedCategories` BE source), `user-event.service.ts:234-313` (BE validation that returns 400 today), BE-P2.3 event source attribution (zobraziť provider name na event detail screen — separate work, viď BUG-11 audit doc).

**Effort:** S (~2-3h — picker UI × 2 platformy + i18n × 6 lokálov × 2 keys)
**Severita:** 🟠 MEDIUM (BLOCKS user-reported outage events; bez tohto user-report flow padá pre celých 5 outage subkategórií)

### FE-REMINDER-RECURRENCE-EXTEND [FILIP] · Reminder form — pridať Bi-weekly + Yearly picker options
**Predchodca:** REQUEST-5 BE+shared shipnuté 7.5. — `ReminderRecurrenceSchema` má 6 hodnôt v `@notifio/shared@^0.31`, `notifio-api` Zod enum + scheduler ich akceptujú a roll-ujú správne (vrátane leap-year clamp Feb 29 → Feb 28).

**Aký je teraz stav (predpokladaný — Filip overí):**
- Mobile reminder form (`apps/mobile/app/...reminders.../create/edit screen`) — radio buttons / picker pre 4 cadences (Once/Daily/Weekly/Monthly)
- Web ekvivalent — to isté
- i18n keys už v shared 0.31: `reminders.recurrenceOptions.{BIWEEKLY,YEARLY}` (uppercase pre badge/list) + `reminders.form.{biweekly,yearly}` (lowercase pre form picker). 6 lokálov hotových.

**Akcie:**
1. **Bump `@notifio/shared`** v root + `packages/api-client/package.json` z `^0.30.0` na `^0.31.0`, `npm install`
2. **Mobile** reminder form — rozšíriť radio buttons array zo 4 na 6 entries: `'ONCE' | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY'`. Render text cez `t('reminders.form.biweekly')` / `t('reminders.form.yearly')`.
3. **Web** ekvivalent
4. **Optional UX:** keď user vyberie `YEARLY` a `triggerAt` má month=Feb + day=29, zobraziť hint "Feb 29 sa v ne-prestupných rokoch vykoná 28. februára" (mirror BE clamp behavior). Samostatný nice-to-have, neblokuje core feature.
5. **Verify** — vytvoriť reminder s `BIWEEKLY` → po 14 dní fire-uje; vytvoriť reminder s `YEARLY` → fire o rok.

**Cross-ref:** REQUEST-5 (parent), `notifio-shared#feat/reminder-recurrence-yearly-biweekly`, `notifio-api#feat/be-request5-reminder-recurrence`.

**Effort:** XS (~30 min — bump + 2 picker rows × 2 platformy)
**Severita:** 🟢 LOW (feature gap, neblokuje primárny use-case)

### FE-REPORT-AUTO-RADIUS [FILIP] · Skryť RadiusPicker v event-report-modal — BE auto-fillne
**Predchodca:** REQUEST-2 BE strana audit (7.5.2026) potvrdila že BE už 3-level fallback chain `data.radiusM ?? c_event_type.num_default_radius_m ?? 1000` plumbe automaticky.

**Aký je teraz stav:**
- Mobile `apps/mobile/components/events/event-report-modal.tsx:21,93` — hardcoded `RADIUS_STEPS = [100, 250, 500, 1000, 2000, 5000, 10000, 20000]` + `radiusM: RADIUS_STEPS[radiusIdx]` always sent
- Web `apps/web/src/components/app/event-report-modal.tsx:27,82` — identický 8-button picker, identický send

**Ako má byť:**
- **A) Skryť picker úplne** (recommended pre MVP UX) — odstrániť `RADIUS_STEPS` array + UI section, **prestať posielať** `radiusM` z `api.createEvent({ subcategoryCode, lat, lng })`. BE auto-fillne z codebook.
- **B) Presunúť do "Pokročilé nastavenia"** collapsed-by-default sekcie — picker zostáva pre power-userov ale defaultne neskryté.

**Akcie:**
1. **Mobile** `apps/mobile/components/events/event-report-modal.tsx`:
   - Odstrániť `RADIUS_STEPS` const + `formatRadius` helper + `radiusIdx` state
   - Odstrániť `<View style={styles.radiusRow}>` blok celý (lines ~218-231)
   - V `api.createEvent()` payload odstrániť `radiusM: RADIUS_STEPS[radiusIdx]` line — **NEPOSIELAŤ** field, BE fallback ho doplní
2. **Web** `apps/web/src/components/app/event-report-modal.tsx` — to isté pre web variant (lines 27 + 82 + UI section)
3. **Pre A/B variant:** ak chceme pokročilé nastavenia, picker collapsed za toggle "Pokročilé". Ja by som išiel **A** lebo 95 % userov radius nepotrebuje.
4. **Verify** — submitted user event musí mať `valRadiusM` z codebook (overiť cez `SELECT key_event, val_radius_m FROM f_event WHERE cod_source_id LIKE 'user_report:%' ORDER BY dtm_created DESC LIMIT 5`)

**Cross-ref:** REQUEST-2 (parent), BE `user-event.service.ts:317` (3-level fallback), QUALITY-1 dashboard (Phase 3 môže zobraziť % user-reportov ktoré používajú default vs explicit radius)

**Effort:** XS (~30 min — 2 platformy × delete UI + delete payload field)
**Severita:** 🟡 MEDIUM (UX clutter — 8 buttonov ktoré 95% userov nepotrebuje, BE už podporuje)

### FE-NOTIF-PLANNED-CHIP [FILIP] · 4. chip "Plánované" v History FilterSheet (mobile + web)
**Predchodca:** BUG-7 BE strana shipnutá 7.5. — `GET /api/v1/me/notifications?status=upcoming` filtruje server-side cez lifecycle CASE.

**Aký je teraz stav:**
- Mobile `apps/mobile/components/alerts/filter-sheet.tsx:8-14` — hardcoded `STATUS_OPTIONS = [{ id: 'active' }, { id: 'ended' }, { id: 'all' }]`
- Žiadny `?status` parameter sa neposiela na BE — pravdepodobne FE filtruje client-side cez `eventStatus` field z response (ktorý už BE-P1-EVENT-STATUS-NOTIF dodáva)

**Ako má byť:**
- 4 chips: **Aktívne / Plánované / Ukončené / Všetky** (alebo: Active / Upcoming / Resolved / All)
- API call `getNotificationHistory({ status: 'upcoming' | 'active' | 'resolved' | 'all' })` — server-side filter aby pagination + total správne fungovali
- Web equivalent v `apps/web/src/app/notifications/page.tsx` (alebo kdekoľvek je History view)

**Akcie:**
1. **Mobile** `apps/mobile/components/alerts/filter-sheet.tsx`:
   - Rozšíriť `StatusFilter` type union o `'upcoming'`: `'active' | 'upcoming' | 'ended' | 'all'`
   - Pridať položku `{ id: 'upcoming', labelKey: 'alerts.upcoming' }` do `STATUS_OPTIONS`
2. **i18n** — pridať `alerts.upcoming` key do `notifio-shared/src/i18n/{sk,en,cs,de,hu,uk}.json`. SK = "Plánované", EN = "Upcoming", CS = "Plánované", DE = "Geplant", HU = "Tervezett", UK = "Заплановані". (Cross-ref `alerts.active` / `alerts.ended` namespace.)
3. **Wire `?status` param** — kdekoľvek hook konzumuje notification history, dať tomu prop `status` a passnúť do `api.getNotificationHistory({ page, limit, status })`. **Mapping** `'upcoming' → 'upcoming'`, `'active' → 'active'`, `'ended' → 'resolved'`, `'all' → 'all'` (alebo undefined).
4. **Web** ekvivalent na webovej History view (zatiaľ neoveril path — môže byť `apps/web/src/app/(app)/notifications/...`)
5. **Verify** — open History → tap "Plánované" chip → požaduje sa iba upcoming events (eventy s `dtm_event_from > NOW()`)

**Cross-ref:** BUG-7 (parent), BE PR `feat/be-sprint1-jaro-quick-wins`, `FE-NOTIF-PLANNED-TAB` nižšie (alternatívne riešenie cez screen-level tab — Filip rozhodne ktorý approach + možno oboje, ale nemá zmysel keď chip+tab dupluje funkcionalitu).

**Effort:** S (~2h — 2 platformy × chip + i18n × 6 lokálov × 1 string)
**Severita:** 🟡 MEDIUM (BE done, FE 1-line config + 1 i18n key + 1 query param)

### FE-SETTINGS-DATA-TRANSPARENCY [FILIP] · Optional banner v Settings "Vaše dáta sú v cloude"
**Predchodca:** REQUEST-8 decision (7.5.2026) — sync/backup feature **NETREBA** ako separate toggle, ale možno chceme transparency banner pre user comfort.

**Návrh (low-pri):**
- Sekcia "Vaše dáta" v Settings (medzi "Účet" a "Pravne") s textom: "Vaše dáta sú bezpečne uložené v cloude. Sync funguje automaticky pri prihlásení na inom zariadení."
- Button "Stiahnuť moje dáta" — link na existing GDPR data export endpoint (`/me/data-export` alebo whatever path Settings → GDPR má)
- Žiadny toggle, žiadny "backup now" button — nič užívateľské nemení sa správanie

**Akcie (ak chceme):**
1. Mobile `apps/mobile/app/settings/...` — nová sekcia s `<Card>` + 1 paragraf + 1 button linkujúci na `data-export` flow ktorý už existuje
2. Web `apps/web/src/app/(app)/settings/...` — to isté
3. i18n — 1 paragraf + 1 button label, 6 lokálov

**Cross-ref:** REQUEST-8 (parent decision), existing GDPR export flow (`POST /me/data-export` v BE shipnutý v migrácii 0036)

**Effort:** XS (~1h ak chceme — UI je iba copy + button)
**Severita:** 🟢 LOW (optional, BACKLOG ako "ak treba" — žiadny pressure)

### FE-NOTIF-PLANNED-TAB [FILIP] · "Plánované" tab v Notifications screen (web + mobile)
**Goal:** rozšíriť notifikácie obrazovku z 3 tabov (Všetky / Aktívne / Vyriešené) na **4 taby** s novým "Plánované" tabom pre eventy s `eventStatus === 'upcoming'`.

**Predchodca:** BE-P1-EVENT-STATUS-NOTIF + FE-SHARED-EVENT-STATUS-TYPE (oba musia byť mergnuté pred touto úlohou).

**Akcie:**
1. **Mobile (`apps/mobile`)** — `app/(tabs)/notifications.tsx` (alebo ekvivalent) — pridať 4. SegmentedControl tab "Plánované" / "Upcoming" / "Geplant" / atď. pre 6 lokálov (sk/en/cs/de/hu/uk)
2. **Web (`apps/web`)** — `src/app/notifications/page.tsx` — to isté, 4 taby
3. **Filter logic** — taby:
   - **Všetky** → žiadny filter
   - **Plánované** → `item.eventStatus === 'upcoming'`
   - **Aktívne** → `item.eventStatus === 'active'` alebo `null` (notifikácie bez eventu sa default v "Aktívne" — žiadne lifecycle)
   - **Vyriešené** → `item.eventStatus === 'resolved'`
4. **Empty states** — preklad pre "Žiadne plánované notifikácie" + ostatné taby
5. **i18n keys** — pridať `notifications.tab.planned` do shared `i18n/notifications.ts`, 6 lokálov

**Cross-ref:** BE-P1-EVENT-STATUS-NOTIF (BE source), FE-SHARED-EVENT-STATUS-TYPE (type), `EventStatusBadge` komponent (už existuje, badges už zobrazené per-item)

**Effort:** S (1 deň — 2 obrazovky × tab + filter; väčšina už hotová, iba pridať 4. tab a filter)
**Severita:** 🟢 LOW (UX completeness; user už vie cez badge ktoré sú plánované)

### DATA-8 [JARO] · STVPS havárie multi-street parsing
**Repro:** parser číta len mesto/PSČ, ignoruje "Upresnenie" pole s ulicami.
- Adresa: `96501 Žiar nad Hronom, M.R.Štefánika 1`
- Upresnenie: `Odstavené budú: Ul. Sládkovičova – 1,2,3,4,5,6,7. Ul. M.R. Štefánika – 1,3,5...`
- Bug: pin v strede mesta namiesto na 4 reálne ulice

**Návrh:** regex `Ul\.\s*([^–\-]+)\s*[–\-]?\s*([\d,\s]*)` na "Upresnenie" → per-ulicu event.

### EVENT-2 [JARO] · Per-street consolidation
**Aktuálne** každá adresa → vlastný pin → 160+ pinov v Petržalke. Návrh: **1 pin per (ulica × event_type × time_window)** s zoznamom čísel v detail view.

**Cross-ref:** BE-P1-DATA-DEDUP (overlap — REFACTOR-#13 = identical lat/lng, EVENT-2 = lat/lng-blízke per-street).

### BE-P1-AREA-COVERAGE-CHECK [JARO] · Verify FE dostáva area/polygon eventu
**Ask:** "Skontrolovať či do FE sa dostáva aj plocha pre ktorú platí event, aby sme vedeli vykresliť — povedzme platnosť pre počasie."

**Background:** `f_event.jsn_polygon` field obsahuje polygon/multi-polygon pre event areas (weather warnings cez EMMA region codes, hydro stretches, wildfire perimeter). Otázka či sa správne propaguje do FE response a či FE renderer to zobrazuje.

**Akcie:**
1. **API audit** — `EventResponseDto` má pole pre `polygon` / `area` / `geometry`? `event.service.ts` projection?
2. **SQL sample** — `SELECT key_event, cod_event_type, jsn_polygon FROM f_event WHERE jsn_polygon IS NOT NULL LIMIT 20` — koľko eventov má polygon a aké šejpy (Point / Polygon / MultiPolygon)?
3. **FE check (web):** MapLibre supports geojson polygons → `apps/web/src/lib/map-renderer.ts` audit
4. **FE check (mobile):** `react-native-maps` `<Polygon>` komponent → audit `apps/mobile/components/map/`
5. **Per-category coverage:** weather warnings (EMMA regions), hydro (river stretch), wildfire (perimeter), traffic (TomTom LineString) — overiť že každý category správne mapne na FE rendering
6. **Cross-ref FILIP Step 10** (deferred) — weather warning area circles. Ak BE už polygon posiela, Step 10 je skoro hotový

**Effort:** S (audit) → M-L (variable fix per category)
**Severita:** 🟠 MEDIUM (UX — weather warnings ako point pin sú technically incorrect; user nevidí "tu kde žijem to platí")

---

## 🟢 BE-P2 — refactor (bez urgencie)

### BE-P2-REFACTOR-1 [FILIP] · Extract adapter-type-registry.ts
`event-write.service.ts` 704 lines. Move `PROVIDER_TO_ADAPTER` + adapter-specific resolution. Pure extraction.

**Effort:** S, **Risk:** Low

### BE-P2-REFACTOR-2 [FILIP] · Extract NotificationRenderer
`notification-delivery.service.ts` ~500 lines mixuje targeting, anti-spam, FCM dispatch, locale rendering. Stateless `NotificationRenderer(template, locale, fallbackChain)`.

**Effort:** M, **Risk:** Low

### BE-P2-REFACTOR-3 [FILIP] · Migration discipline
0047/0048/0055/0056 boli edited po commit. 0061 správne fixnuté cez nový file = right pattern. Establish: **no edits to committed migrations**, vždy nový file. Pre-commit hook / CI rule.

**Open Q:** Boli pre-edit verzie 0047/0048/0055/0056 deploynuté na prod?

### BE-P2-REFACTOR-4 [FILIP] · Centralize event status
`computeEventStatus()` v utility (51 lines), ale `event.service.ts` má aj inline status logic vo feed query. Route všetko cez utility.

### BE-P2-REFACTOR-5 [FILIP] · Split referral.service.ts (watch, neactnúť)
523 lines mixuje validation, code generation, Stripe coupon, refund cascade. Action ak rastie >600 lines alebo nová responsibility.

### BE-P2-REFACTOR-11 [FILIP] · Split event.routes/service
`event.routes.ts` 650 lines, `event.service.ts` 380+ a rastie. Split: `event-feed`, `event-detail`, `event-vote`, `event-write` routes; extract `event-feed.service`, `event-vote.service`.

**Effort:** M (mechanical)

### BE-P2.1 [JARO] · Shared types dedup
Po bumpe 0.18.1 nahradiť lokálne duplikáty:
- `nameday.service.ts` → `NamedayResponse/Day/Query` zo shared
- `stripe.service.ts` → `CheckoutBody/Response`, `PortalBody/Response`, `PaymentPlan`
- GDPR routes → `DataExportStatus/Job/Result`

### BE-P2.3 [SHARED s FILIP TOMORROW Item 4] · Event source attribution
- `event.source.{name, url}` už na response (pôvodne JARO BE-P2.3)
- FE pridať "Source: BVS, a.s." badge s clickable link (FILIP TOMORROW Item 4 — ~1 hr both apps)
- i18n: `event.sourceLabel` × 6 locales

### BE-P2.4 [JARO] · Admin panel (cross-ref s QUALITY-1)
Auth cez `d_user.flg_admin` + `requireAdmin` middleware:
- Event moderation (list/search deleted, force-delete, override credibility)
- User moderation (ban/unban, promote admin, reset rate limit)
- Source adapter control (toggle `flg_active`, poll history) — feeds QUALITY-1 dashboard

### BE-P2.5 [JARO] · Traffic Flow classifyCongestion polish
Príliš citlivé prahy — filtrovať len hlavné cesty, zvýšiť min segment length + threshold pre "moderate".

### BE-P2.6 [JARO] · Weather intelligence threshold audit (po 2-3 mesiacoch)

### BE-P2.7 [JARO] · Excel c_event_type full sync s DB
Excel obsahuje subset DB rows (47 vs 60+). Chýbajú SPP gas, StVPS/TAVOS/VVS water, TEHO heat, ISP/SWAN, Nameday types.
**Riešenie:** úplný export z DB do Excel (Excel sa stane zdrojom pravdy).

### BE-P2.8 [JARO] · Wildfire radius do DB (ako hydro)
Aktuálne `WildfireService` prepisuje `radiusM` v kóde. Mirror hydro pattern z migrácie 0044 — 3 event_type rows podľa materiality level.

### npm audit [JARO]
- HIGH: `xlsx` ✅ replaced s `exceljs` per archív
- MODERATE: `esbuild` (dev-only)
- LOW: `@tootallnate/once`

---

# 📱 FRONTEND — aktívna prioritizácia

## 🔴 FE-P0 — kritické

### FE-P0.1 [FILIP] · Event display bugy (web)
Reziduálne z 30.4 audit:
- Galvaniho road_works neviditeľný — event v API response, FE ho nezobrazuje
- Duplikované piny — TomTom viaceré incidents → cross-ref BE-P1-DATA-DEDUP
- Clustering bez click-to-expand — verify či `ClusterEventsSheet` pattern z mobile sa portoval na web

### FE-P0-WEB-CLUSTER [FILIP] · Web zgrupovanie eventov v jednom bode
**Ask:** "filip web zgroupovanie eventov v jednom bode."

**Stav:** Mobile má `ClusterEventsSheet` (commit `07d76ba`, 2.5.) — list sheet on cluster tap so child events. **Web nemá ekvivalent** — pri cluster tape sa MapLibre default zoomne, ale 7 identical-coord eventov sa nezoomne ďalej.

**Implementation:**
1. Port mobile `ClusterEventsSheet` pattern na web
2. MapLibre `cluster_id` → `getClusterChildren()` API → list of child features
3. Modal / side-sheet komponent (web equivalent of slide-up Modal)
4. Plurals z shared `mapCluster.eventsAtLocation` / `eventsNearby` (už máme po Step 11)
5. Tap row → `Link` to `/events/{eventId}` (web pattern, mobile už má)

**Cross-ref:** FE-P0-WEB-CLUSTER-DETAIL (nižšie), BE-P1-DATA-DEDUP (root cause = identical coords)

**Effort:** S (mobile pattern už existuje, len portovanie)
**Severita:** 🟠 MEDIUM (web parity, identický UX gap ako mobile mal pred 2.5.)

### FE-P0.4 [FILIP] · Pricing UI source-of-truth
**Cross-ref:** BE-P0.6
- Hardcoded `pricingTiers` → `useMembershipTiers()` hook
- Features list lokalizovať
- Trial badge `dateFnsLocale` based on user locale
- 2-tier vs 3-tier overiť

---

## 🟡 FE-P1 — vysoká

### FE-P1-EVENT-STATUS-BADGES [FILIP TOMORROW Item 3] · Verify deploy
**Stav:** EventStatusBadge komponent shipnutý PR #78, wildfire→campfire icon swap.
- Verify mobile parity
- 3 colors: info blue (upcoming) / accent orange (active) / muted gray (resolved)
- Badge sits next to event title on alert cards + event detail
- i18n keys partially in shared after Step 11 (verify)

### FE-P1-LANG-PERSIST [FILIP TOMORROW Item 5] · Mobile language → server persistence
Mobile language switcher iba `i18next.changeLanguage` lokálne. Pridať `PATCH /me { locale }` call alongside. "Use country default" option (sends `null`). Web už persistuje cez cookie.

**Effort:** ~30 min

### FE-P1.3 [FILIP] · Mapa & vizualizácia polish (web)
- Event clustering tuning (Supercluster) — `clusterRadius: 60`, `clusterMinPoints: 3`
- Category filter toggle buttony
- Standalone Map / Notifications pages
- Profile + membership management UX polish
- `React.memo(DashboardMap)` to prevent re-renders
- Viewport-based event refetch on pan (debounced 500ms)

### FE-P1-EVENT-TIME-RANGE-FILTER [FILIP] · Segmented control 1d / 3d / 7d (web + mobile)
**Ask (Filip 4.5.):** "segmented control (4 chips) na webe + mobile pre quick-glance" — quick filter pre upcoming eventy kde user vidí len to čo prichádza v najbližších N hodinách/dňoch.

**Goal:** na hlavnej Map / Events obrazovke (web + mobile) pridať jednotný 4-chip segmented control: **Teraz / 1d / 3d / 7d**. Filter aplikovaný read-time na klientovi (BE už vracia future eventy s `dtm_event_from`).

**Akcie:**
1. **Shared komponent** — `packages/shared/components/EventTimeRangeFilter.tsx` (alebo lokálny per-platform mirror — ak shared nedovolí native SegmentedControl)
2. **State** — `useState<'now' | '1d' | '3d' | '7d'>('now')` v parent (Map page); default 'now' (current snapshot, žiadny upcoming filter)
3. **Mobile** — `react-native-segmented-control` alebo custom `Pressable` row (matchnúť dizajn ostatných filter chips), 4 lokály SK/EN/CS/DE/HU/UK pre `now / 1d / 3d / 7d` labels
4. **Web** — `<div role="tablist">` s 4 buttonami (zladiť s existujúcim `category-filter-buttons` štýlom)
5. **Filter logic** — read-time predikát na fetched events:
   - **Teraz:** `dtm_event_from <= now() AND (dtm_event_to IS NULL OR dtm_event_to > now())`
   - **1d:** `dtm_event_from <= now() + 24h` (zahŕňa current + upcoming v 24h)
   - **3d:** `dtm_event_from <= now() + 72h`
   - **7d:** `dtm_event_from <= now() + 7d`
6. **Persist v `d_user_preference`** (optional, M effort) — `default_event_time_range: '1d'` aby sa user nastavenie nezabudlo pri reloade
7. **Map pin styling** — upcoming pinov môžu byť slightly tlmené (50% opacity) ak chip = '1d/3d/7d' aby user vedel ktoré sú "teraz aktívne" vs "v budúcnosti"

**Cross-ref:** QUALITY-5 forecast audit (čo všetko má upcoming events — viď `docs/forecast-coverage-audit-2026-05.md`), FE-P1.3 (map polish), `EventStatusBadge` (už zobrazuje upcoming/active/resolved per pin)

**Effort:** S-M (~1 deň — komponent + filter + i18n × 6 lokálov × 2 platformy; persist +0.5 dňa)
**Severita:** 🟢 LOW-MEDIUM (UX nice-to-have, ale kľúčový pre power-users plánujúcich budúce týždne)

### FE-MAP-SHOW-UPCOMING-DEFAULT [FILIP] · Mapa default zahrnúť aj upcoming eventy (web + mobile)
**Trigger (5.5.2026 ZSD audit):** User reportoval, že "ráno sa na mape nič nezobrazovalo", napriek tomu že na zsdis.sk bolo veľa naplánovaných odstávok na ten deň. BE audit potvrdil — 306 ZSD eventov je v `f_event` s H3 cells, ale **0 je práve teraz active**: 232 sú `upcoming` (`dtm_event_from > now()`) a 74 `ended`. ZSD odstávky bežia 08:00–15:00; ráno pred 8:00 sú všetky dnes-naplánované eventy upcoming a aktuálny FE map filter ich skrýva → user vidí prázdnu mapu.

**Citát:** *"na mape v aplikacii sa nam nic nezobrazovalo rano a bolo vela planovanych odstavok elektriny"*

**Príčina v FE:** Mapa filter aktuálne berie iba eventy s `now() BETWEEN dtm_event_from AND dtm_event_to` (= "active right now"). Plánované odstávky sa do tejto definície nezmestia kým nezačnú.

**Goal:** zmeniť default mapy tak, aby zobrazovala aj **upcoming eventy v rozumnom horizonte** (default 24h dopredu), nie iba `active now`. Drobnejšia úprava ako `FE-P1-EVENT-TIME-RANGE-FILTER` — tu nejde o user-facing chip selector, iba o lepší default predikát.

**Akcie:**
1. **Web** (`apps/web/src/hooks/use-map-data.ts` alebo equivalent map filter site) — predikát zmeniť z:
   ```ts
   const isVisibleNow = (e: Event) =>
     e.dtm_event_from <= now && (!e.dtm_event_to || e.dtm_event_to > now);
   ```
   na:
   ```ts
   // Default: now + 24h horizon — zachytí upcoming eventy ktoré
   // začnú v najbližšom dni (typicky ranné výpadky elektriny / vody).
   const HORIZON_MS = 24 * 60 * 60 * 1000;
   const isVisible = (e: Event) =>
     e.dtm_event_from <= now + HORIZON_MS &&
     (!e.dtm_event_to || e.dtm_event_to > now);
   ```
2. **Mobile** (`apps/mobile/hooks/use-map-data.ts`) — rovnaká zmena
3. **Pin styling** — upcoming eventy (start > now()) zobraziť mierne tlmené (~70% opacity) alebo s "Plánované" badge aby user vedel rozlíšenie. Reuse existujúci `EventStatusBadge`.
4. **Žiadny BE change** — BE už posiela všetky non-deleted eventy s `dtm_event_from < now() + horizon` (záleží na `?status` query param ak FE ho posiela; toto treba overiť).

**Cross-ref:**
- `FE-P1-EVENT-TIME-RANGE-FILTER` — väčšia úloha (4-chip Teraz/1d/3d/7d). Tato menšia položka mení iba **default**, FE-P1-EVENT-TIME-RANGE-FILTER pridáva **user-controllable selector**. Po implementácii oboch: default = '1d' chip selected, user môže prepnúť.
- `BUG-7` — Filter "Plánované" v Notifications. Rovnaká patológia "FE skryje upcoming" v inom screen.
- `MAP-UX-1` — Viewport-based fetching. Po zmene default horizon-u BE response môže byť väčšia → cap môže byť potrebný.
- BE PR `fix/be-zsd-codebook-align-with-excel` (5.5.2026) — fix codebook drift ktorý audit ZSD odhalil; BE strana je čistá.

**Effort:** S (~3–4 hodiny — 2 platformy × hook predikát + opacity styling + i18n badge text ak treba)
**Severita:** 🟠 MEDIUM (user-visible — "ráno na mape nič" je živý report; rovnaký dopad pre BVS, SPP, MeteoAlarm planned warnings, atď. — nie iba ZSD)

### FE-P1-ERROR-REPORTER-WEB [FILIP] · Next.js error boundary + global handlers → POST /client-errors
**Goal:** capture neošetrené chyby z webového Next.js appu (React render errors, runtime exceptions, unhandled promise rejections) a poslať ich do BE `f_error_log` cez nový endpoint `POST /api/v1/client-errors` (rate-limit 10/min/device, anonymné; bearer optional).

**Predchodca:** BE shipnuté — `feat/be-client-errors-endpoint` PR (route + controller + rate-limit + ErrorLoggerService persist). Endpoint hotový, čaká FE klient.

**Akcie:**
1. **`apps/web/src/lib/error-reporter.ts`** — singleton client:
   ```ts
   export async function reportClientError(payload: {
     module: 'fe_web';
     severity: 'error' | 'warning';
     errorType: 'react_render' | 'window_error' | 'unhandled_rejection' | 'manual';
     message: string;
     stack?: string;
     context?: Record<string, unknown>;
   }): Promise<void>
   ```
   - Beží `fetch('/api/proxy/client-errors', { method: 'POST', headers: { 'x-device-id': deviceId, ...optionalAuth }, body })`
   - 8KB stack cap (BE má cap, klient skráti aby sa nezbytočne neposielalo)
   - `keepalive: true` (na navigation unload)
   - Best-effort — žiadny await na response, žiadny error throw
2. **`apps/web/src/app/global-error.tsx`** — Next.js root error boundary:
   ```tsx
   useEffect(() => { reportClientError({ module: 'fe_web', errorType: 'react_render', ... }) }, [error]);
   ```
3. **`apps/web/src/lib/global-handlers.ts`** — registrované raz cez `_app` / root layout:
   ```ts
   window.addEventListener('error', (e) => reportClientError({ errorType: 'window_error', ... }));
   window.addEventListener('unhandledrejection', (e) => reportClientError({ errorType: 'unhandled_rejection', ... }));
   ```
4. **Device ID — MANDATORY `x-device-id` header** — generuj UUID pri prvom boote, persist v `localStorage.getItem('notifio:device-id')`, vždy posielaj na BE v `x-device-id` header. **Nie optional.** BE rate-limiter (10/min/device) padá na IPv6-normalizované /56 ak header chýba, takže všetci useri za rovnakým corporate NATom alebo mobile carrier prefixom by zdieľali 10/min bucket — jeden buggy peer by zhasol celú firmu. Reuse existujúce telemetry deviceId ak je (single source of truth)
5. **Rate limit prevention** — debounce identical errors (rovnaký `message + stack[:100]`) na max 1× za 60s na klientovi (BE má 10/min, klient sa nemá moc opakovať)
6. **429 retry behaviour** — keď BE vráti 429, **NIE re-tryuj okamžite** — drop celý batch (errors aren't load-bearing). Re-try by mohol viesť k feedback-loop ak je rate-limit z buggy clienta. Inkrementuj iba lokálny `dropped_due_to_rate_limit` counter pre debug
7. **Manual reporting hook** — `useErrorReporter()` pre kód ktorý chce log konkrétny error (`try/catch` v service callovi)

**Cross-ref:** QUALITY-3 (error logging system parent ticket), BE PR `feat/be-client-errors-endpoint`, BE PR `feat/be-error-log-schema-v2` (DB tabuľka `f_error_log`), BE PR `fix/be-rate-limit-ipv6-safe-keygen` (IPv6 bucket safety), FE-P1-ERROR-REPORTER-MOBILE (mobile counterpart)

**Effort:** S (~1 deň — singleton + 2 boundary points + dedup logic + manual hook)
**Severita:** 🟠 MEDIUM (nutnosť pre observability — bez toho silent FE crashes)

### FE-P1-ERROR-REPORTER-MOBILE [FILIP] · Expo ErrorUtils.setGlobalHandler + queue → POST /client-errors
**Goal:** capture neošetrené JS exceptions a unhandled promise rejections z Expo (RN) appu, batch ich pri offline a poslať na BE `f_error_log`. iOS + Android.

**Predchodca:** rovnaký ako FE-P1-ERROR-REPORTER-WEB — BE endpoint `POST /api/v1/client-errors` shipnutý.

**Akcie:**
1. **`apps/mobile/lib/error-reporter.ts`** — analogický web verzii:
   ```ts
   export async function reportClientError(payload: {
     module: 'fe_mobile';  // 'fe_mobile_ios' | 'fe_mobile_android' ak treba split
     severity: 'error' | 'warning';
     errorType: 'js_error' | 'unhandled_rejection' | 'native_crash' | 'manual';
     message: string;
     stack?: string;
     context?: Record<string, unknown>;
   }): Promise<void>
   ```
2. **Global JS handler** — v `app/_layout.tsx` alebo skoro v lifecycle:
   ```ts
   ErrorUtils.setGlobalHandler((error, isFatal) => {
     reportClientError({ errorType: 'js_error', severity: isFatal ? 'error' : 'warning', ... });
   });
   ```
3. **Promise rejection** — `require('promise/setimmediate/rejection-tracking').enable({ allRejections: true, onUnhandled: ... })` (RN nemá `unhandledrejection` event natívne)
4. **`expo-error-recovery`** — capture native module errors a ulož do AsyncStorage queue (offline-safe). Pri ďalšom launchi reportuj zvyšky.
5. **Batched AsyncStorage queue** — `notifio:error-queue` v AsyncStorage:
   - Pri error: ak network OK → fetch; ak fail → push do queue, max 100 items
   - Pri app foreground / network reconnect → flush queue (10 per request, sequenčne)
   - Stale items (> 7 dní) drop
6. **Device ID — MANDATORY `x-device-id` header** — `expo-application` `getAndroidId()` / `getIosIdForVendorAsync()` alebo `expo-device` UUID stored v SecureStore. **Vždy posielať na BE v `x-device-id` header.** Bez neho BE rate-limiter padá na IPv6-normalizované /56 a useri za rovnakou T-Mobile/Orange CGN bránou by zdieľali 10/min bucket — jeden buggy peer zhasne notification reporting pre stovky ostatných. Reuse existujúce telemetry deviceId ak je
7. **429 retry behaviour** — pri 429 z BE drop batch (NEpush spať do queue). Errors nie sú load-bearing dáta, retry-loop by mohla zhoršiť situáciu. Lokálny `dropped_due_to_rate_limit` counter pre debug
8. **Native crash placeholder** — Crashlytics / Sentry SDK (separate ticket, NEW); pre teraz iba JS errors

**Cross-ref:** QUALITY-3 (parent), FE-P1-ERROR-REPORTER-WEB (web counterpart), BE PRs `feat/be-error-log-schema-v2` + `feat/be-client-errors-endpoint`, BE PR `fix/be-rate-limit-ipv6-safe-keygen` (IPv6 bucket safety)

**Effort:** M (~1.5 dňa — handler wiring + queue + replay + 2 platform-specific deviceId helpery)
**Severita:** 🟠 MEDIUM (mobile crashes sú teraz úplne neviditeľné)

### FE-P1-PERF-4 [FILIP] · Web i18n SSR cache
`apps/web/src/i18n/request.ts` cez `unstable_cache` po locale (per-request SSR čítanie disku).

---

## 🟢 FE-P2 — stredná

### FE-P2.1 [FILIP] · Mobile P1 Core
Mobile pokrýva 13 z 40+ api-client metód = **32% coverage**. Doplniť:
- Profile (`/me`), Membership tier + billing status
- Location CRUD
- Pollen live data
- Map viewport cache, Geolocation tracking
- Event pins + voting + detail

### FE-P2-MOBILE-PRO-PARITY [FILIP NEW-1] · Mobile zrkadlí web PRO surfaces (sprint, 2-3 dni)
**Goal:** All tier-gated UI works on mobile. Upgrade samotný stays on web (Stripe Checkout). Mobile tap "Upgrade" → web → after upgrade mobile picks via `/me/membership` refresh.

**Why web-only payment:**
- iOS App Store policy ALLOWS pre "reader" apps (Notifio fits)
- Avoids 30% Apple cut na web-acquired customers
- No StoreKit / Google Play Billing (yet)

**Scope:**
1. Mobile source preferences screen (PRO) — drag-to-reorder per outage subcategory
2. Mobile advanced filters (Phase 0 inventory)
3. Mobile weather thresholds — confirm complete vs web
4. Mobile saved locations — tier-aware count limits + upsell
5. Mobile quiet hours — PRO toggle (verify wired)
6. Mobile event reminders / digest mode
7. ProGate component (mobile equiv)
8. Mobile upgrade button → `notifio.com/upgrade?from=mobile` (web detect param, deeplink back)
9. After-upgrade refresh — auto-refresh membership at foreground

**Phase 0 inventory needed:**
- ✅ Weather thresholds
- ❌ Source preferences (mobile placeholder)
- ❓ Quiet hours, saved location count UI, custom notification scheduling, event reminders advanced

**Owner:** Filip lane (FE sprint)

### FE-P2.2 [FILIP] · i18n rozšírenie (web)
- 6 hardcoded SK stringov do messages
- Preklady pre nové features (consent, reminders, payments, data export)
- Session analytics FE hook (BE endpoints existujú)

### FE-P2-DYNAMIC-PRICING [FILIP TOMORROW Item 7] · Dynamic pricing on web
`/membership/tiers` returns live tier configs. Replace hardcoded array. Skeleton during load, hardcoded fallback. Render whatever count of tiers BE returns. **Cross-ref FE-P0.4.**

**Effort:** ~1.5 hr

### FE-P2-CUSTOM-OVERVIEW [FILIP] · Voliteľný overview/dashboard
**Ask:** "Filip volitelny prehlad. user si moze vybrat co chce."

**Stav:** Aktuálne Overview obrazovka má pevné poradie kariet (weather, AQ, pollen, nameday, alerts, ...). User nemôže prepnúť/skryť/preusporiadať.

**Návrh:**
- Settings → "Customize overview" sekcia
- Drag-to-reorder cards alebo on/off toggles per card
- Persist v `d_user_preference` (`overview_layout: ['weather', 'alerts', 'aqi', ...]`)
- Default layout pre nových users
- Card catalog (každá karta má `id`, `title`, `defaultEnabled`, `requiredTier?`)
- PRO-only cards behind ProGate (napr. detailed forecast, source preferences quick-edit)

**Cross-ref:** FE-P2-MOBILE-PRO-PARITY (NEW-1 — source preferences ide podobnou cestou drag-to-reorder)

**Effort:** M (1-2 dni FE + BE preference field)
**Severita:** 🟢 LOW (power-user feature)

### FE-P2-DELETE-GRACE [FILIP TOMORROW Item 6] · DELETE /me grace period flow
Cancel-deletion banner shipnutý ale trigger flow may be incomplete. Phase 0 verifies state first; defer to quieter day.

**Effort:** ~3 hr (lowest priority)

### FE-P2-WEB-PREFS-UI [SHARED] · Web settings UI rewrite na 2-toggle pattern (Sprint 2 follow-up)
**Stav:** BE ships nové fields (sendNotifications + showOnMap + locationId + global quietHours) cez `/me/preferences` — mobile UI rewrite shipnutý 4.5. (PR #96), web stále používa starú UI s `enabled` togglom (backward compat shim funguje, ale neodhaľuje nové možnosti).

**Akcie:**
1. Update `apps/web/src/hooks/use-preferences.ts` — pridať `toggleSendNotifications`, `toggleShowOnMap`, `toggleCategorySend`, `toggleCategoryShow`, `setQuietHours` (zrkadlo mobile hook signature)
2. Rewrite `apps/web/src/components/settings/notification-preferences-section.tsx` — TWO toggles per category, sub-categories collapsible
3. Pridať `<QuietHoursSection>` web equivalent — `<input type="time">` namiesto native pickeru
4. Reuse same i18n keys ako mobile (`notificationPreferences.showOnMap`, `.sendNotifications`, `.quietHoursEnabled`, atď.)

**Cross-ref:** Sprint 2 BE PR #304 (BE side done), Sprint 2 FE mobile PR #96 (mobile side done)

**Effort:** 1.5–2 dni FE (web)
**Severita:** 🟡 MEDIUM (user-visible inconsistency: mobile + web Settings divergujú; web-first/desktop power-users očakávajú parity)

### FE-P2-MOBILE-PREFS-LOCATION-UI [FILIP] · Per-saved-location override UI v Settings (Sprint 2 follow-up)
**Stav:** BE migrácia 0066 + service podporujú per-saved-location preference overrides (Filip product decision: iba saved lokácie, nie live GPS). Sprint 2 FE mobile rewrite UI na dual-toggle pattern, ale **per-location override UI bol zámerne odložený** ako samostatná položka.

**Akcie:**
1. Each category card v `notification-prefs-list.tsx` rozšíriť o collapsible "Pre lokácie" sekciu
2. List user's saved locations (z `useLocations()` hook) → per location 2 toggle-y (sendNotifications + showOnMap)
3. Pri toggle: `usePreferences.toggleSendNotifications(categoryCode, subcategoryCode, locationId, value)` — hook musí byť rozšírený o 4. parameter `locationId`
4. UI: ak žiadna saved lokácia neexistuje, hide collapsible alebo zobraz hint "Pridaj lokáciu pre per-miesto override"
5. Backend resolution hierarchy už podporuje (4-tier specificity): no extra BE work

**Cross-ref:** BE-P0.6 / Sprint 2 BE PR #304, FE Sprint 2 PR #96 (mobile dual-toggle base)

**Effort:** M (1.5 dňa: hook update + UI tree + saved-locations integration + i18n keys)
**Severita:** 🟢 LOW (power-user feature; bez per-location override stále full Sprint 2 hodnota — global toggles fungujú)

### FE-P2-WEB-PREFS-LOCATION-UI [FILIP] · Per-saved-location override UI na webe
Mirror of FE-P2-MOBILE-PREFS-LOCATION-UI for web. Same hook signature change + collapsible per-location section.

**Effort:** M (1.5 dňa)
**Severita:** 🟢 LOW

### FE-P2-EVENT-DELETED-FALLBACK [FILIP] · Graceful 404 keď event bol hard-deleted retention sweepom (web + mobile)
**Background:** BE `event-retention.scheduler.ts` (deployed 4.5.) hard-mazal eventy 90 dní po `dtm_event_to` alebo po soft-delete. Cascade do `r_event_h3` + `f_event_credibility`; SET NULL do `t_notification_log` / `t_notification_batch` / `f_sponsored_notification` (tabuľky `t_notification_*` boli premenované z `f_*` v migrácii 0008 — fix referencií v 0067 v PR `fix/be-migrations-table-column-names`). **`t_notification_log.key_event` po sweepe môže byť `NULL`** — notifikácie zostávajú v histórii, ale event už neexistuje.

**Symptom (FE):**
- User otvorí starú push notifikáciu → deeplink na `/events/{eventId}` → 404 z BE → zlý UX (default "Page not found" alebo crash)
- Notification history list ukazuje notifikáciu, tap → opening event detail page → loading → 404
- Map deep link `?eventId=...` → event neexistuje, mapa sa nepohne, žiadny feedback

**Goal:** každý FE entry-point ktorý vie odkazovať na konkrétny event musí mať graceful fallback, nie crash / generic error.

**Akcie:**
1. **API client error mapping** — `@notifio/api-client` GET /events/:id → ak 404, return `{ deleted: true, eventId, hint: 'event_archived' }` namiesto throw
2. **Web `apps/web/src/app/events/[id]/page.tsx`**:
   - Ak `deleted === true` → render `EventDeletedFallback` komponent: ikona "archív", text **"Táto udalosť už nie je aktívna a bola archivovaná."** (i18n key `event.deleted.title`), CTA "Späť na mapu" → `Link` na `/`
   - Pridať badge `Archivované` ak BE začne neskôr posielať soft-deleted info (ak ešte nie je hard-deleted, badge "Vyriešené pred X dňami")
3. **Mobile `apps/mobile/app/events/[id].tsx`** — ekvivalent: `<EventDeletedFallback />` screen, CTA "Naspäť" / "Späť na mapu"
4. **Notification history (web + mobile)** — list item s `eventId` ktorý nie je accessible: dim opacity 0.5, badge "Archivované", tap → `EventDeletedFallback` modal namiesto navigation (žiadny dead-end)
5. **Map deeplink** (`?eventId=` query param) — pri 404 zobraz toast/banner "Vybraná udalosť bola archivovaná" + clear deeplink z URL (replace state)
6. **i18n** — pridať keys do shared:
   - `event.deleted.title` (sk/en/cs/de/hu/uk)
   - `event.deleted.body`
   - `event.deleted.cta_back_to_map`

**Cross-ref:** BE-P0-VERIFY-LIFECYCLE (90d retention scheduler shipnutý), BE PR `feat/be-event-retention-90d`, BE PR `feat/be-event-retention-fk-cascade` (cascade rules), QUALITY-2 (parent retention concern)

**Effort:** S-M (~1 deň — 1 fallback komponent × 2 platformy + 3 entry points + i18n × 6 lokálov)
**Severita:** 🟢 LOW (rare path — 90d po resolution; ale zlý UX keď sa stane)

### TECH-DEBT-1 [SHARED] · FE typecheck drift (mobile 7 + web 5 errors, pôvodne BUG-7 v canonical 4.5.)
**Repro:** `npm run typecheck` v `apps/mobile` (notifio-fe) vypíše 6-7 errors, v `apps/web` 4-5 errors. **NIE sú regresie zo Sprintu 1/2** — odhalené pri Sprint 1 #4-#6 verifikácii. Stoja v ceste strict CI / pre-commit hooks.

**Mobile (~7 errors):**
- `components/reminders/reminder-calendar-view.tsx:5` — `Cannot find module 'react-native-calendars'` (chýba install / type stub)
- `hooks/use-map-data.ts:78,79,83` — `Property 'teasers' does not exist on type ...EventFeedItem[]`, `Property 'events' does not exist`
- `lib/normalize-pins.ts:2` — `Module '@notifio/shared/types' has no exported member 'TeaserPin'`
- `lib/normalize-pins.ts:135,144` — `Property 'status' / 'title' does not exist on type ...EventFeedItem`

**Web (~5 errors, post-Sprint-2 augmented types reduced to 4):**
- `src/hooks/use-map-data.ts:131,132,136` — `Property 'teasers' / 'events' does not exist`
- `src/lib/normalize-pins.ts:2` — `Module '@notifio/api-client' has no exported member 'EventFeedItem' / 'TeaserPin'`

**Hypotézy:**
- (a) `@notifio/shared` / `@notifio/api-client` boli bumpnuté na 0.21.0/0.22.0, ale **lokálny `node_modules/@notifio/shared` má staršiu verziu** (audit 4.5.: `version: 0.20.0` v node_modules vs. `^0.22.0` v package.json) → výsledok: hooks importujú podľa starej shape
- (b) `EventFeedItem` / `TeaserPin` sa **prestali re-exportovať** z `@notifio/api-client` keď sa konsolidovali typy v shared (Step 1 sprint, 1.5.). FE imports treba prepnúť z `@notifio/api-client` na `@notifio/shared/types`
- (c) `react-native-calendars` bol pridaný do code (PR #80 reminders calendar rework) ale **chýba v `package.json`** alebo `npm install` nebol commitnutý
- (d) `EventFeedItem.status / title` field shape sa zmenil

**Akcie:**
1. **Verify shared verzia:** `npm ls @notifio/shared` v oboch FE workspaces. Ak `0.20.0`, force re-install `@notifio/shared@^0.22.0`
2. **Audit re-exports:** otvoriť `node_modules/@notifio/api-client/dist/index.d.ts` — má `export { EventFeedItem, TeaserPin } from '@notifio/shared/types'`?
3. **`react-native-calendars`:** `cd apps/mobile && npm install react-native-calendars` a commit `package-lock.json` zmeny
4. **Field rename audit:** ak shared bumpol field names, update FE call sites
5. Po fixoch: `npm run typecheck` musí vrátiť 0 errors v oboch workspaceoch

**Owner:** [SHARED] — buď JARO (rebuild api-client/shared dist) alebo FILIP (FE imports update + react-native-calendars install)
**Effort:** S (1-2h triage + fix)
**Severita:** 🟡 MEDIUM (typecheck broken na CI; runtime OK)

**Cross-ref:** Sprint 1 #4-#6 verifikácia (commit messages: "typecheck baseline = 7/5 errors, 0 new"). Bol pôvodne tagnutý "BUG-7" v canonical 4.5., ale user lokálne pridal vlastné BUG-7 (Filter Plánované) → premenované na TECH-DEBT-1 aby sa neprekrývali.

---

# ❓ OPEN QUESTIONS (z FILIP REFACTOR doc)

Tieto si vyžadujú answer od FILIP/BE team, nie code change:

1. **Migration deployment state** [FILIP #1] — boli pre-edit verzie 0047/0048/0055/0056 deployed?
2. **Referral refund UX** [FILIP #2] — `cancelSubscriptionsUsingCoupon()` immediate downgrade alebo grace?
3. **`flg_user_provider_required` rollout** [FILIP #3] — TRUE pre nejaké subcategories v prod?
4. **Event status cacheability** [FILIP #4] — DB query vs service layer?
5. **Locale fallback documentation** [FILIP #5] — `locale → en → sk` chain do shared README
6. **Migration 0053 retroactivity** [FILIP #6] — "default traffic notifications off" only new users alebo retroactive?
7. **Account deletion grace** [FILIP #7] — 24h (CLAUDE.md) vs 30d (`findDueDeletions`)?
8. **ZSD electric adapter rate limit** [FILIP #8] — verified proti published limits?
9. **TomTom flow current state** [FILIP #9] — `TOMTOM_API_KEY` v Railway active + within quota?
10. **Weather warning regions response** [FILIP #10] — pridať `radiusKm` ak revisit Step 10

---

# 🔮 STRATEGIC / FUTURE

### NEW-3 [FILIP] · Mobile native payment IAP — DEFER decision
**Reco:** počkať na produkčné dáta z web payment funnel + user research. Ship NEW-1 + NEW-2 first; revisit za 2-4 týždne.

**Path A (RevenueCat, 2-3 dni):** account + entitlements, App Store Connect/Play Console subscription products, `react-native-purchases` SDK, BE webhook handler, cross-platform tier sync. **$120/mo do MRR threshold.**

**Path B (self-roll, 5+ dní):** full StoreKit 2 + Google Play Billing. Ongoing maintenance.

**Path C (current):** web-only payment (allowed pre "reader" apps).

### Step 10 weather warning area circles [FILIP] — DEFERRED
Mockupy V1/V2/V3 drafted. Backlogged kým product nepýta. Aktuálne MeteoAlarm warnings ako point pins — technicky incorrect pre area-based.

### Mobile widget [FILIP]
Home screen widget (Expo widget API, background fetch).

### Referral systém FE [FILIP]
2 endpointy (BE existuje), 2+ screens, signup flow integration.

### Analytics session tracking FE [JARO+FILIP]
BE endpoints existujú, FE hook `useSessionTracking`.

### Public web SEO/ASO layer [FILIP]

### Mobile TestFlight first build [FILIP] — po icon verify, ~85% prep done

### Cloudflare proxy pred Railway [FILIP] — keď custom domain

### Android notification channels per category [FILIP]

### iOS per-channel custom notification sounds [FILIP]

### Community-sourced events [JARO] — variant C partner program
FB scraping = legal risk. Direct API/email feed s facility-management firmami (BPS&Tulipa, Stavebné bytové družstvá).

### Comments on user events [JARO + API repo BACKLOG]

### Source ratings UI [FILIP] — BE má, FE chýba UI

### Membership ratings & reviews [JARO]

### Gamifikácia [JARO]
Credibility body (`f_user_points`, levely, odznaky), Tester membership tier.

### NormalizedAlert / alert normalization [FILIP standing]

### ProGate localization [FILIP standing]

### Translator review [FILIP standing]
German Pollen/Wildfire, UK strings native speaker pass.

---

# 📊 NEW DATA SOURCES (low-medium)

| # | Zdroj | Status | Pri |
|---|---|---|---|
| 26 | SHMÚ river levels | Client-side rendered | 🟡 |
| 27 | EFFIS wildfires | Complex GeoJSON/WMS | 🟡 |
| 28 | UVZ swimming water | Seasonal | 🟢 |
| 29 | Waste collection | Per-municipality fragmentation | 🟢 |
| 31 | Heat (Termostav-Mráz, SPP CZT) | TBD | 🟡 |
| 33 | DPB/DPMK MHD | Static GTFS only | 🟡 |
| 34 | SEVAK water | TBD | 🟢 |
| 38 | ZSD planned (legacy) | Headless browser | 🟢 |
| 39 | VSD planned | IBM WebSphere portal | 🟢 |
| Orange | `orange.sk/pomoc/nedostupnost-sluzieb` | Scrapable HTML | 🟡 |
| Telekom/O2/Vodafone/Antik | TBD | Neoverené | 🟢 |

---

# 🎯 Odporúčaný order (subjektívne)

**Tento týždeň (najvyššia páka):**
1. ~~BUG-1/2/3 [JARO]~~ ✅ DONE 4.5. (Sprint 1 BE PRs #298–#300, FE #93–#95)
2. ~~BUG-6 [JARO]~~ ✅ BE DONE 5.5. (migrácia 0071) + ✅ SHARED 0.26 shipped 5.5. — FE pending: **FE-LOCATION-PICKER-EXTEND [FILIP]**
2a. ~~BUG-9 [JARO]~~ ✅ BE DONE 6.5. (migrácia 0072 + FREE_MEMBERSHIP_ID fix)
2b. ~~BUG-10 [JARO]~~ ✅ BE DONE 6.5. (4-layer fix — locality fallback Tier 3-4 + loud silent-drop guard)
3. **BE-P0-WEBHOOK-CACHE [FILIP REFACTOR-#9]** — 1-line fix
4. ~~QUALITY-2 [JARO]~~ ✅ DONE 5.5. (retention scheduler + FK cascade + TTL codebook live)
5. ~~QUALITY-4 [JARO]~~ ✅ DONE 6.5. (audit shipped — `docs/redis-audit-2026-05.md`; QUALITY-4-RECOMMENDATION-1 queued)
6. **FE-MAP-SHOW-UPCOMING-DEFAULT [FILIP]** — predikát na map filter (~3–4 hod, fixne živý "ráno mapa prázdna" report; cross-ref BE PR `fix/be-zsd-codebook-align-with-excel`)

**Tento mesiac:**
6. **BE-P0.1 [JARO]** LIVE Stripe webhook (15 min config)
7. **BE-P0.6 [JARO] + FE-P0.4 [FILIP]** Pricing sync
8. **BUG-4 [SHARED]** OAuth Apple + FB + email (Apple je mandatory pre iOS launch)
9. ~~QUALITY-3 [JARO]~~ BE ✅ DONE 5.5. — FE pending: **FE-P1-ERROR-REPORTER-WEB + FE-P1-ERROR-REPORTER-MOBILE [FILIP]**
10. **BE-P1-TEST-INFRA [FILIP REFACTOR-#6]** Real-Postgres
11. **BUG-5 [JARO]** Notifications settings i18n hierarchy
12. **FE-P1-LANG-PERSIST [FILIP TOMORROW Item 5]** — 30 min quick win
13. **PERMS-1 [FILIP]** Nepýtať permissions opakovane (~S-M)
14. **MAP-UX-1 [FILIP]** Viewport-dynamic event fetching
15. **FE-P0-WEB-CLUSTER [FILIP]** Web port mobile ClusterEventsSheet
16. **BE-P1-AREA-COVERAGE-CHECK [JARO]** FE dostáva polygon area pre eventy
17. **LANDING-2 [FILIP]** Language switcher na landing
18. **LANDING-1 [FILIP]** Odstrániť logo z prihlasovacej stránky (overlap REQUEST-1)
19. **FE-SHARED-EVENT-STATUS-TYPE [FILIP]** — bump shared, unblocks Plánované tab (~1 hr)
20. **FE-NOTIF-PLANNED-TAB [FILIP]** — 4. tab v notifications, depends on #19 (~1 deň)
21. **FE-P1-EVENT-TIME-RANGE-FILTER [FILIP]** — 4-chip 1d/3d/7d na map (~1 deň)

**Sprint scope (next 2-4 týždne):**
- **FE-P2-MOBILE-PRO-PARITY [FILIP NEW-1]** 2-3 dni
- **REQUEST-1 [JARO]** Login screen redesign s OSM animáciou (overlap LANDING-1)
- **QUALITY-1 [JARO]** Source quality monitoring (cross-ref BE-P2.4)
- **BE-P1-OUTAGE-I18N [JARO]** outage descriptions cez d_translation
- **BE-P1-DATA-DEDUP [SHARED]** identical-coord events fix
- **EVENT-2 [JARO]** per-street consolidation
- ~~BE-P1-EVENT-STATUS-NOTIF [FILIP]~~ ✅ DONE 4.5. (BE side; FE consumer is FE-SHARED-EVENT-STATUS-TYPE)
- **FE-P2-DYNAMIC-PRICING [FILIP TOMORROW Item 7]** ~1.5 hr
- **MAP-UX-2/3 [FILIP]** Detail mini-map preklik + location name namiesto GPS (~S each)
- **LANDING-3 [FILIP]** Landing redesign (depends on Dia design)
- **LANDING-4 [DIA]** Landing page design lane (parallel)
- ~~QUALITY-5 [JARO]~~ ✅ DONE 5.5. (audit shipped — `docs/forecast-coverage-audit-2026-05.md`)
- **FE-P2-EVENT-DELETED-FALLBACK [FILIP]** — graceful 404 keď retention sweep zmaže event (~1 deň)

**Backburner:**
- **FE-P2-CUSTOM-OVERVIEW [FILIP]** Voliteľný dashboard (M, power-user feature)
- BE-P2 refactor cluster (1, 2, 4, 11) — 4 položky FILIP
- BE-P1-PERF-2/3 (scaling pre 2+ pods) — 2 položky JARO
- FE-P1-PERF-4 (web SSR cache) — FILIP
- FE-P2-DELETE-GRACE [FILIP Item 6] (lowest pri)
- New data sources

---

*Posledný audit 5.5.2026 — quality systems BE batch (8 PRs) shipped + 5 nových FE špecov pre Filipa (FE-SHARED-EVENT-STATUS-TYPE, FE-NOTIF-PLANNED-TAB, FE-P1-EVENT-TIME-RANGE-FILTER, FE-P1-ERROR-REPORTER-WEB, FE-P1-ERROR-REPORTER-MOBILE, FE-P2-EVENT-DELETED-FALLBACK). Detail closed items v `project_backlog_archiv.md`. Tagy [JARO]/[FILIP]/[SHARED] indikujú origin témy.*
