# Tool Pack 28: World Clock (Time Tools)

Status: **Specification finalized as documentation on 2026-10-19 (base commit `397b674`); decisions OD1 to OD10 recorded in section 16. NOT authorized for implementation:** the user's approval covers this document and a local documentation commit only. A build needs a separate, explicit implementation authorization (an "implementation readiness" phase), including the prerequisites listed at the end of section 16.
Roadmap: R2 item 1 (PROPOSED, a candidate, not an authorization; `docs/tool-pack-factory.md` section 10). R2 stays proposed; World Clock is not an approved roadmap item. The roadmap's wording is not changed by this specification.
Tier: **MEDIUM**, with one part verified at HIGH rigor (the next-clock-change calculation has an independent oracle, section 7.4). A browser-local reference tool: no money, tax or legal content, no stored data. When unsure the factory says take the higher tier; the single risky calculation is the part that gets the higher treatment.
Id, slug and route: `world-clock`, `/tools/world-clock/`. Section: **Time Tools** (`time-tools`, flat, no category).

**Identifier check (verified 2026-10-19).** `docs/tool-packs/` ends at 27 and has no `28-*`; no catalog id, route, alias, source file, style entry or Growth record named `world-clock` exists (the only mentions are prose in three docs: the Time Zone Converter and Unix converter specs, and the factory's P1 line and R2 rows). Tool Pack 28 and the path are available.

**Decisions already made by the user (2026-10-19) that this draft follows.** D1 narrow live multi-city dashboard, no duplicate of the TP19 planner (approved for evaluation); D2 small curated alias table acceptable if needed, bounded and testable; D3 prefer reusing TP19's calculation capability where technically appropriate, no inappropriate coupling, no TP19 refactor in this phase; D4 hours and minutes by default; D5 persistent favorites deferred, shareable URL selections to be evaluated, no `localStorage` without separate approval. Gratuity Calculator (second R2 candidate) means the Indian employee gratuity benefit, not a tip calculator; it is **not** specified here.

---

## 1. Tool identity
- **Title:** World Clock. **Description (draft):** "See the current time in several cities at once, with each city's date, UTC offset and how far ahead of or behind you it is. It runs in your browser."
- **Catalog:** `id: "world-clock"`, `status: "published"` only at integration, `sectionId: "time-tools"`, `autoRelated: false`, `relatedTools: ["time-zone-converter"]` (one-way: TP19 is **not** changed). Placed after the Time Zone Converter in the catalog (listing order reviewed at integration).
- **Aliases that are true:** world clock, world time, current time in cities, city clocks, multiple clocks, time in different cities. **Not** used: "time zone converter", "meeting time converter", "convert time zones" (TP19's), and not the bare word "time".
- **Catalog conventions verified 2026-10-19 (`assets/js/data/tools.js`, the Time Zone Converter entry as the model):** fields `id`, `status`, `loader` (lazy import of `../tools/<id>/index.js`), `sectionId`, `icon` (one character), `title`, `description`, `autoRelated`, `relatedTools`, `aliases`, `capabilities` (`copy`, `multipleInputs`, `validation`, `explanation`, `realtime`, `urlState`, `localProcessing`) and `seo { title, description }`; SEO titles end with " | ToolZen Hub" (the site's spelling); the static check requires one description, one canonical per page, and the tool's `markup()` ids present in the built HTML. Capabilities are set only for what is true (draft: `copy`, `realtime`, `urlState`, `localProcessing`, `explanation`; not `validation` unless an input shows errors, to be decided at integration).
- **SEO (draft, not final):** title "World Clock: Live Time in Cities and Time Zones | ToolZen Hub"; description: "Free world clock: see the current time, date and UTC offset in several cities at once and how far ahead or behind each is. Search well-known cities or any time zone your browser supports. It runs in your browser." No claim of complete city coverage. **Exact strings, the icon and the capability flags are verified against the live conventions and the site's length checks before implementation (OD7).**

## 2. User problem
"What time is it over there right now, and is it a sensible hour to call?" Remote teams, families abroad, travellers and anyone following several places want a board they can glance at, not a calculation. Today they open a large clock site full of other content, search a phone's clock app one city at a time, or do offset arithmetic in their head. The job is live and passive; it recurs without any date being chosen. **Evidence labels:** the need is a *reasoned hypothesis*; demand is *unknown* (no Search Console or GA4 data exists for it). See section 3.

## 3. Evidence-based selection rationale
Rulebook section 12 comparison done 2026-10-19 (candidates: World Clock, Gratuity Calculator, R1 items 6, 7, 8). Summary, labelled:
- **Verified (repository):** TP19 already offers conversion, up to six zones and a meeting planner, and its spec deliberately omitted a dashboard, a ticking clock and a city database. No existing tool shows live multi-city time. TP19's search matches IANA zone names only: of 77 distinct common city names run through its `searchZones`, **22 returned nothing** (Mumbai, Delhi, New Delhi, Bangalore, Chennai, Hyderabad, Pune, Beijing, San Francisco, Washington, Houston, Dallas, Miami, Boston, Seattle, Atlanta, Doha, Abu Dhabi, Tel Aviv, Lahore, Hanoi, Osaka). The list of 77 was chosen by the reviewer, not drawn from query data; the failure class (cities without their own IANA zone) is certain, the percentage is illustrative.
- **Public evidence (thin, secondhand):** established world-clock and scheduling sites exist (timeanddate.com, Time.is, World Time Buddy, ZoneMap, worldclock.me). The study could not fetch timeanddate.com (HTTP 403) and relied on third-party listings. Their features were not verified first hand.
- **Unknown:** search volume, ranking prospects, repeat use and revenue. None is stated.
- **Mandatory gates:** none fails (real if modest problem; not a pure duplicate given section 4; browser-local; no paid API; low privacy risk; mobile feasible; proportionate upkeep; not added to raise the count).
- **Verdict (rulebook 12.7): B, needs further validation.** Recommendation was a narrow GO on feasibility, quality and restraint, not on proven demand. World Clock does **not** advance the R1 6-of-8 milestone.
- **Differentiation as the reason to choose ToolZenHub (rule 12.5):** a calm board built around "how far from *you* (or from a city you pick)", correct on odd offsets and clock changes, with cities findable by their everyday names, mobile-first, with no account and no storage. "No login" and "private" are stated as facts, not as the differentiator.

## 4. Differentiation from the Time Zone Converter (TP19)
| | Time Zone Converter (TP19) | World Clock (TP28) |
|---|---|---|
| Question | "When it is 15:00 here, what is it there?" / "When can we all meet?" | "What time is it there now?" |
| Time | A chosen date and time; never ticks | The current moment; updates each minute |
| Output | One conversion plus an overlap planner | A board of up to 12 cities, a live comparison |
| Search | IANA names only | Everyday city names, aliases, countries, plus IANA names |
| State | Date, time, source, targets (URL) | Cities and a reference (URL) |

**Boundary rules (frozen):** World Clock has no date or time input, no preferred-hours, no meeting length, no overlap windows, no wall-time resolution of nonexistent or repeated local times. Anything that needs a chosen instant is a link to TP19 (section 6.9). If a future request asks World Clock to "find a meeting time", the answer is TP19.

## 5. Complete v1 scope and explicit exclusions
**In v1**
1. A board of **up to 12 city cards** plus a fixed, non-removable **"Your time"** card (the browser's zone) shown first.
2. Each card: city, country, large digital time (hours and minutes), weekday and date, UTC offset, difference from the reference zone in words, day relation ("Today / Tomorrow / Yesterday / 2 days later") and approximate **Daytime / Night-time** word with icon. **Optional, secondary, removable:** the **next clock change** line (OD2, conditional on independent verification; the card is complete and excellent without it).
3. **Add a city:** a search combobox over the curated directory (section 8) plus a **region** filter. **Two different coverage statements, never blurred:** (a) a *selection* of well-known cities searchable by everyday name; (b) *every time zone the browser lists*, reachable by its IANA name (for example America/Chicago) as a fallback. The interface says so in plain words (6.3). Neither is a claim of worldwide city coverage.
4. **Compare with:** a select that chooses the reference for the difference line (default "Your time"; or any city on the board). OD3 (approved).
5. 12-hour or 24-hour display (checkbox; default follows the browser).
6. Remove a city; **Copy link**; a **default starter board** (OD4).
7. **Shareable URL** (`cities=`, `ref=`), section 9. A link to TP19, section 6.9.
8. One short on-page explanation of how to read the clocks and their limits (no article).

**Excluded from v1 (and why)**
- Meeting planning, overlap, date or time input, conversion: TP19's job.
- **Persistent favorites** or any `localStorage`, `sessionStorage`, cookie or IndexedDB (D5; rulebook 7.7). Revisit condition in section 14.
- **Seconds display** (D4): no demonstrated value; adds per-second rendering and screen-reader noise.
- **Analog clocks**, animations, sunrise or sunset, weather, coordinates, maps: decorative or data we would not maintain.
- A day/night or offset **filter**: on a board of at most 12 cards a filter hides nothing worth hiding; region filtering applies to the directory, where it helps.
- Per-city pages, programmatic SEO pages, articles, imagery (thin-content risk; rulebook 6).
- A full global city database, exhaustive coverage claims, external APIs, geolocation, IP lookup, network time (section 10 limits).
- Drag-and-drop reordering and a **Sort control** (deferred, OD3: the order of adding plus "Compare with" give the comparison; sorting does not materially improve v1 usability and adds a control).

## 6. Detailed UX behaviour

### 6.1 Page order
Shared tool hero and heading (existing layout) → **toolbar** (Add a city combobox with its coverage hint, Region select, Compare with select, 12/24-hour checkbox) → **board** (heading "Your clocks", then the card list) → board actions (Copy link, "Plan a meeting or convert a time across these cities" link to TP19) → **How to read these clocks** note → shared tool footer sections. Headings: the page title is the only `h1`; "Your clocks" and "Add a city" and the note are `h2`; each card's city is an `h3`. Pinned decision: the **"Your time" card must be visible in the first viewport at 390 × 844** (toolbar compact; see 6.7).

### 6.2 The clock card (uniform specification)
Every card has the same five rows and the same typography; only content differs.
1. **Header row:** city name (`h3`) and country on one line that **wraps** (no truncation, so text zoom and long names stay readable); a **Remove** button (absent on "Your time"; "Your time" shows a small "Your time" label and the zone name instead, for example "Your time · Asia/Calcutta").
2. **Time:** `<time datetime="…">` with hours and minutes, `--font-4xl` weight 700 on desktop and tablet and `--font-3xl` below 560px, `font-variant-numeric: tabular-nums` so digits do not shift. In 12-hour mode "AM/PM" is a smaller suffix in the same element. The accessible text is the full reading ("2:32 PM"), never split.
3. **Date row:** weekday and date ("Mon, 19 Oct 2026") and the day relation in words (Today, Tomorrow, Yesterday, "2 days later", "2 days earlier"), measured against the **reference zone's local date**, not 24-hour spans.
4. **Difference and offset row:** "UTC+05:30" (real minus sign "−") and the difference from the reference: "3h 30m ahead of Your time", "45m behind London, United Kingdom", or "Same time as Your time". Computed from the two zones' offsets at the one reference instant, so clock changes and 15-minute offsets are exact.
5. **Status row:** the **day word** (Daytime or Night-time, with an `aria-hidden` inline SVG sun or moon) and, **only if the feature is included and the zone has a result, the optional next clock change line**. The row, the card structure and the card height are the same with or without that line (6.11).

Equal height: the grid stretches cards to equal height within a row; `min-height` is set so a card with no clock-change text does not collapse. Row 5 alone may add one line; identical *structure* is guaranteed, identical *height* only within a grid row. Colour: neutral card (`--bg-card`, 1px `--color-slate-200`, `--radius-md`/14px as TP19's cards), the day/night badge has a quiet tint (never the only signal: the word is always present). No shadows beyond `--shadow-sm`, no motion, no gradients.

**Day word (frozen definition).** Local minute-of-day in [06:00, 18:00) is "Daytime", otherwise "Night-time". It is explained on the page as "approximate, by the local clock; not sunrise or sunset, and the same all year and at every latitude". No third state in v1.

**Next clock change line (optional and secondary; see OD2 and 7.4).** Small, muted, last in the card, never the focus. One line: "Clocks change Sun 1 Nov: UTC−04:00 → UTC−05:00 (at 02:00)". When none is found within the checked window: "No clock change found in the next 13 months (this browser's data)" (a statement about what was found, **not** that none will occur). The page never says "DST in effect" or "standard time": browsers do not expose that, and the tz database models some zones (for example Europe/Dublin) with negative savings, so the offsets are the only honest statement. The line is produced by one removable function behind one constant (`SHOW_NEXT_CLOCK_CHANGE`); setting it false removes the line and the function's tests without touching any other card content (tested, 6.11).

### 6.3 Add a city: search and region
- A labelled **combobox** "Add a city" (ARIA combobox pattern, listbox of **at most 10** matches; arrows, Enter, Escape, Home and End), and a labelled **Region** select: All regions, Africa, Americas, Asia, Europe, Oceania. Regions are browsing aids only (the page says so; no geopolitical claim).
- **Coverage hint (visible, linked to the combobox as its description):** "Search well-known cities, or any time zone your browser supports, such as America/Chicago. Not every city is listed; a city that isn't may share a time zone with one that is." This states the distinction (a selection of cities against every browser-listed zone) without jargon and without promising completeness.
- Search rules are in section 8.4. **Region** narrows the combobox results. With the box empty and a region chosen, a **browse list** shows that region's directory entries alphabetically (capped at 60 with "Showing 60 of N. Type to narrow." when larger), so users can discover cities without knowing a name.
- Selecting a result (click, tap or Enter) adds the card, clears the box, **keeps focus in the box** (adding several cities is the common flow), and announces once, politely: "Added Mumbai, India. 5 of 12 cities."
- Already on the board: the result is shown as "On your board" and is not added again.
- At 12 cities: the box is disabled with the visible text "The board is full (12 cities). Remove one to add another." and focus is not trapped.
- **No results** (never blank): `No match for "<query>". Try a city name such as Lisbon, a country such as Kenya, or a time-zone name such as America/Chicago. This list does not include every city in the world.` With a region chosen and no match: add "Try All regions." The query is shown with `textContent`.
- **Directory empty or unreadable** (should not happen; the data is shipped): the IANA fallback alone still works.

### 6.4 Compare with (reference)
A labelled select, default "Your time", listing "Your time" and each board city. Changing it re-renders the difference rows and day relations; no card is added or removed; announce once: "Comparing with London, United Kingdom." If the reference city is removed, the reference silently falls back to "Your time" **with the same polite announcement** ("Comparing with Your time."). The reference is in the URL (section 9).

### 6.5 Order
"Your time" first, then cities in the order added (the URL order). **No Sort control in v1** (deferred, OD3); revisit if users report the order getting in the way.

### 6.6 Remove, copy, handoff
- **Remove:** a button named "Remove London, United Kingdom". Focus moves to the next card's Remove button, or to the previous, or to the "Your clocks" heading (`tabindex="-1"`) when no city remains; announced once.
- **Copy link:** copies the page URL with the current `cities` and `ref`; if the clipboard refuses, the URL is shown in a selectable read-only field with the message "Copy this link". A polite "Link copied" on success. The link contains no personal data.
- **12/24-hour:** a checkbox; changes only formatting; every printed time is unambiguous (AM/PM or 24-hour).

### 6.7 Layout
- **Mobile (about 320, 360, 390px):** one column; toolbar controls stack at full width (16px text, at least 44px tall); the combobox and the Region select sit together so the "Your time" card is still visible in the first viewport; no page-level horizontal scroll; cards keep the five rows (the time and the relation wrap under each other, no side-by-side squeeze).
- **Tablet (about 560 to 899px):** two columns of cards; toolbar in a row where it fits.
- **Desktop (≥900px):** `repeat(auto-fill, minmax(260px, 1fr))` (three columns in the 1280px container, four where it fits); toolbar in one row.
- Tablet is checked visually only because the grid breakpoint is a specific responsive risk (rulebook 10).

### 6.8 States
| State | Behaviour |
|---|---|
| First visit, no URL | The default starter board (OD4): "Your time" plus up to four cities. |
| Board only "Your time" (all removed) | "Your time" card plus: "Add a city above to see its time here." and the quick-add buttons (the starter cities not on the board). |
| Unrecognised items in a shared link | The board shows the valid ones; a polite note: "N items in this link were not recognised and were skipped." (never silent; the raw text is not echoed). |
| Whole link invalid or empty | Treated as no URL: the default board. |
| The browser lacks `Intl` time-zone support | No cards; a message: "This browser can't provide time-zone data, so the clocks can't be shown." The page does not crash. |
| A single card cannot be computed | That card shows "Time unavailable for this zone"; the others continue. |
| Entry zone rejected by this browser | The entry is hidden from the directory (never shown as a card that cannot work). |

### 6.9 Handoff to TP19
Under the board: "**Plan a meeting or convert a specific time across these cities →**", a link to `/tools/time-zone-converter/?from=<your zone>&to=<up to 5 distinct zones from the board>`. Built from board zones de-duplicated by canonical zone, skipping any equal to the source; TP19's own `parseQuery` accepts it (a contract test, 7.6). It uses the same base-path helper as other internal links and is tested on both the root and subpath builds. TP19 is not changed; a reverse link from TP19 is a separate decision (OD9).

### 6.10 Update behaviour (one clock, one timer)
- **One shared reference instant** per paint: a single `Date.now()` read feeds every card; no card reads the clock itself, so cards never disagree by a minute.
- **One coordinated timer:** a single `setTimeout` aimed at the next minute boundary (`60000 − (now mod 60000)` plus a small margin, re-aimed from a fresh clock read on every tick so drift and manual clock changes self-correct). No `setInterval`, no per-card timers, no `requestAnimationFrame`.
- **Hidden page:** on `visibilitychange` to hidden the timer is cleared (rulebook 7.4: no work while hidden). On visible (and on `pageshow` after a back-forward restore) the board renders immediately from a fresh clock read, then re-arms. A long sleep or tab suspension is therefore never shown stale.
- **Rendering:** only the elements whose text changed are written (time, date, relation), so a minute tick touches at most 13 small text nodes. Offsets and next-clock-change values are cached per zone and recomputed only when the reference instant passes the cached change (7.4), not every tick.
- **No announcements per tick.** The polite live region speaks only for add, remove, reference change, link notes and copy (section 11).

### 6.11 The board stays excellent without the optional parts
The core is: the cards (time, date, offset, difference, day word), add and remove, the IANA fallback search, 12/24-hour, and the URL. Everything else is optional and must fail or be switched off without damaging that core:
| Optional part | If absent or failing |
|---|---|
| Next clock change line | The row shows the day word only; no empty space or placeholder; the other fields are unaffected. |
| Compare with | The difference is always against "Your time". |
| Curated directory or aliases | Search still works through the IANA fallback (zone names). |
| Region filter | Search runs over everything. |
| Copy link / clipboard | The link is shown in a selectable field. |
| Starter board | "Your time" plus the quick-add buttons. |
| `Intl.supportedValuesOf` | The fallback list of common zones (as on TP19); directory entries are validated individually. |
A test builds the board with the clock-change feature off and with the directory empty and asserts the core still works (section 12).

## 7. Time-zone engineering and the shared calculation interface

### 7.1 Zones and browser limits
- Identity is the IANA identifier. Validity is `isValidZone` (shape check plus constructing an `Intl.DateTimeFormat`); an unsupported identifier is never shown as a card.
- Zone list: `listZones()` (`Intl.supportedValuesOf("timeZone")` where present, plus UTC and the modern spellings; the short built-in list otherwise). In Node 20 on the development machine `supportedValuesOf` returned 418 zones before the additions; that is an observation, not a guarantee for any visitor's browser.
- **Browser coverage limits (stated on the page and tested):** the time-zone database ships with the browser or operating system and can lag a recent government change; browsers differ in the zones they list and in whether they use old names (Chromium reports `Asia/Calcutta`); a browser without `Intl.supportedValuesOf` gets a short fallback list. The page never claims "all cities" or "always up to date".
- **Device clock limit (stated on the page):** every time comes from the device's own clock. If the device clock is wrong, every card is wrong by the same amount; the site does not read network time. The "How to read" note says so in one sentence.
- Zone identity for duplicate detection uses `canonicalZone` only where two entries must not be the same *zone* (the TP19 hand-off list); **two directory entries may share a zone** (Mumbai and Delhi both use `Asia/Kolkata`) and both may be on the board, because the city label is the thing the user asked for.

### 7.2 Calculation contract (the pure engine)
A new pure module `assets/js/tools/world-clock/clock-engine.js` (no DOM, no globals except `Intl`) exports:
- `buildCard({ nowMs, entry, refZone, hour12 })` → `{ key, city, country, zone, h, mi, timeText, isoLocal, weekday, dateLabel, offsetSeconds, offset, deltaSeconds, differenceText, dayDelta, dayWord, phase, nextChange }`.
- `differenceText(deltaSeconds, refLabel)`: "Same time as …" when 0, otherwise `"{h}h {m}m ahead of …"` or `"…behind…"` with zero parts omitted ("45m", "5h"), exact for 15-minute offsets.
- `dayPhase(minuteOfDay)`: the frozen 06:00 to 18:00 rule.
- `dayRelation(delta)`: Today, Tomorrow, Yesterday, "N days later", "N days earlier" (not capped: Kiritimati against Pago Pago can be 2).
- `nextClockChange(zone, fromMs, options)`: 7.4. **Optional**; nothing else in the engine depends on it (`buildCard` returns `nextChange: null` when the feature is off).
- `msUntilNextMinute(nowMs)`.
- `parseBoardQuery(search, directory)`, `buildBoardQuery(state)`, `defaultBoard(localZone, directory)`: section 9 and OD4.

All take the instant as an argument (never `Date.now()` inside), so tests are deterministic.

### 7.3 Reuse of TP19's engine (D3 assessment and decision)
**Inspected** (`assets/js/tools/time-zone-converter/time-zone-engine.js`): pure, self-contained (no imports, no DOM), about 32 KB raw and 9.3 KB gzip; exports used here: `isValidZone`, `canonicalZone`, `sameZone`, `localZone`, `listZones`, `searchZones` (fallback only), `offsetSecondsAt`, `wallAt`, `offsetLabel`, `formatClock`. Not used: `resolveWall`, `convert`, `meetingOverlap`, `parseQuery`, `buildQuery` (World Clock has its own query contract). `describeInZone` is not used because its relation wording ("Next day") is relative to a source and its abbreviation work is not needed.
**Precedent for one engine importing another:** `jwt-decoder/jwt-engine.js` imports the JSON and Unix engines; `date-calculator/date-arithmetic.js` imports the date-difference engine. TP19's own spec chose not to import the Unix engine because that module is BigInt-based and 1,240 lines for about 100 lines of need; the opposite is true here (about ten small pure functions of a 32 KB module, same domain, same correctness principle).
**Decision (OD6, approved):** World Clock **imports the named exported functions** from TP19's engine rather than copying them or creating a new shared module now. Reasons: one tested implementation of offsets and DST instead of two; no refactor of TP19 (which the user ruled out for this phase); the cost is that the whole 9.3 KB gzip module loads on the World Clock page including meeting code it never calls, accepted at this size.
**Safeguards**
1. World Clock imports only the functions it uses; **the import statement in its source is the contract** (a missing named export fails at module load, which is itself a loud check). Tests do **not** freeze TP19's full export list or its internals; TP19 may add, rename-with-alias or reorganise anything World Clock does not import.
2. A **behavioural contract test** `tests/unit/world-clock-engine-contract.test.mjs` exercises the imported functions through World Clock's own use of them and asserts observable results only: for sample zones and instants, the offset in seconds, the wall fields and the offset label (Kolkata +19800 s, Kathmandu +20700 s, New York −14400 s on 2026-10-19 and −18000 s on 2026-11-15); that an invalid zone is rejected and a valid one accepted; that two spellings of one zone compare equal; that `listZones()` returns a non-empty, sorted list of valid zones (**without asserting a particular count or order beyond that**, since browsers differ); and that `searchZones` finds a zone by a typed city. A TP19 change that alters these behaviours fails here with a clear message; a change that does not alter them does not.
3. TP19's own unit tests and its golden fixture (`tests/fixtures/time-zone-golden.json`) keep running; any future edit of the engine for either tool requires the full time-zone unit set to pass.
4. **No change to TP19 is required by this specification.** If implementation finds one is needed, work stops and it is proposed as a separately approved change; the engine is not edited silently.
5. The next-clock-change function, the directory, the query contract and the card model live in World Clock's own modules, not in TP19.
**Future option (not now):** extract the shared pure helpers to `assets/js/utils/` with both tools importing them. That is a refactor of TP19 and needs its own approval; revisit when a third consumer appears.

### 7.4 Next-clock-change algorithm (documented; independent oracle)
**Purpose:** report the next instant after `fromMs` at which the zone's UTC offset changes, with the offsets either side.
**Algorithm (deterministic, bounded):**
1. `o0 = offsetSecondsAt(fromMs, zone)`.
2. Step forward from `fromMs` in **72-hour** steps up to a horizon of **400 days** (about 134 steps); at each step `t`, `o = offsetSecondsAt(t, zone)`. Stop at the first step where `o !== o0`.
3. If none differs, return `null` ("none found in 13 months").
4. Otherwise bracket `[t − 72 h, t]` and **bisect on whole seconds** (about 18 iterations) to the first instant `x` where the offset differs from `o0`.
5. Return `{ atMs: x, fromOffset: o0, toOffset: offsetSecondsAt(x, zone) }`. The line shows the zone's local date and clock reading just *before* the jump ("at 02:00") and both offsets.
**Cost:** about 150 offset lookups per zone, a fraction of a millisecond each; computed when a card is added and again only when the cached change has passed or the horizon has run out. Never per tick.
**Known limits (stated, and documented in the code and on the page where relevant):**
- **The 72-hour step can miss changes.** If the offset changes and changes back (or two changes cancel) inside one 72-hour step, the sampled offsets are equal and the change is not seen. Smaller steps reduce, but cannot remove, this; the algorithm is bounded sampling plus bisection, not a read of the tz transition table, which `Intl` does not expose.
- **Fixture agreement is tested correctness, not a proof.** The oracle covers the named zones, the named 2026 to 2027 reference instants and the tzdata version pinned; agreement there does **not** establish correctness for every zone, every date, historical dates (the feature looks forward from the present only) or future rule changes. The specification and the notes say "agrees on the tested cases", never "always correct".
- **Browser data may differ or lag.** It reports what *this browser's* tz data says; governments change rules and the data can lag; Node ICU, Python tzdata and a visitor's browser can be at different versions.
- **"None found" is a statement about the sampled window**, not a forecast.
**Removable by design:** the function, its one render slot and its tests are the only places the feature exists (6.11); removing it is a deletion, not a rework.
**Independent oracle:** `tests/fixtures/world-clock-golden.py` using Python's `zoneinfo` (no shared logic with the JS): for about 30 zones and several reference instants it finds the next offset change by scanning at 1-hour resolution then refining by the minute, and records the transition instant and both offsets; the instant must match to the minute. The fixture pins the `tzdata` version used (as TP19's does) and **only uses 2026 to 2027 reference dates and zones whose rules are stable in that window**; if the Node ICU version and the pinned tzdata disagree on a zone, the disagreement is reported, not hidden.
**Inclusion condition (OD2):** the line ships only if the oracle agrees on the defined supported cases (the fixture zones and reference instants above). **If it cannot be made to agree, the line is dropped from v1, not weakened or hidden behind caveats.**

### 7.5 Date and offset correctness
Display values come from `wallAt` (the browser's own `Intl` data for the instant), never from fixed offsets. Required cases: whole-hour zones, UTC, **+05:30** (Kolkata), **+05:45** (Kathmandu), **+09:30** (Adelaide, Darwin), **−03:30** (St John's), **+03:30** (Tehran), **+04:30** (Kabul), **+06:30** (Yangon), **+12:45 / +13:45** (Chatham), **30-minute clock change** (Lord Howe), the **International Date Line** (Kiritimati +14, Pago Pago −11, up to 2 calendar days apart), southern-hemisphere clock changes, and a card crossing local midnight.

### 7.6 Fixtures and contract tests
- `tests/fixtures/world-clock-golden.py` and `.json` as in 7.4, plus the instant-to-local-fields, offset and difference cases for the same zones and instants (so the card model is checked against `zoneinfo`).
- Contract tests (behavioural, 7.3): the imported functions' observable results; and the **TP19 handoff link**: for sample boards the URL built here is accepted by TP19's `parseQuery` (zones kept, none dropped). This one test names `parseQuery` because the link is a published URL contract between the two pages; if TP19 renames its parameters the test fails and the link is fixed deliberately.

## 8. City directory and aliases

### 8.1 Dataset contract
A new data module `assets/js/tools/world-clock/city-directory.js`, a frozen array of entries:
`{ id, city, country, zone, region, aliases }`
- `id`: lowercase slug of the city plus `-` plus the **ISO 3166-1 alpha-2 country code** (`mumbai-in`, `london-gb`, `london-ca`, `portland-us`); pattern `^[a-z0-9]+(-[a-z0-9]+)*-[a-z]{2}$`, length at most 40, **unique**.
- `city`: English display name; `country`: the two-letter code; a small `COUNTRY_NAMES` map in the same module gives the English country name (shipped data, so no `Intl.DisplayNames` dependency and fully testable).
- `zone`: an IANA identifier that the **modern** spelling the engine lists where possible (`Asia/Kolkata`); validated with `isValidZone`.
- `region`: one of Africa, Americas, Asia, Europe, Oceania.
- `aliases`: 0 to 3 strings (for example Mumbai: "Bombay"; Kolkata: "Calcutta"; Bengaluru: "Bangalore"; Chennai: "Madras"; Beijing: "Peking"; Ho Chi Minh City: "Saigon"; New York: "NYC"; Yangon: "Rangoon").

### 8.2 Size, inclusion rule and maintenance
- **Bounded:** between **150 and 250 entries**; a unit test fails above 250 or below 150. Aliases at most 3 per entry.
- **Inclusion rule (not demand-based; no demand data exists):** (a) sovereign-state capitals and the best-known large cities, so every country a typical user names has at least one entry where the browser has a zone for it; (b) the major metros of India (the site's main audience); (c) at least one city for **each unusual-offset zone** listed in 7.5; (d) a city is added only with a zone the browser accepts. The final list is delivered as a table in the implementation notes for the owner's review; no figure about popularity is claimed.
- **One entry per (normalised city, country).** A second same-named city inside one country (the other Portland) is **not** included in v1; it is reachable through the IANA fallback. This keeps collisions structural and testable.
- **Maintenance:** edits are one array row each, covered by the directory tests (8.5). The IANA names do not need maintenance (the browser carries them). No scheduled data refresh.
- **Coverage claim on the page:** the hint in 6.3 ("well-known cities, or any time zone your browser supports... Not every city is listed"). It separates the curated *city names* (a selection we maintain) from the *time zones* (whatever the browser lists, which differs between browsers and can lag). Never "all cities", never "worldwide coverage". Titles, descriptions and the explanation note follow the same wording.

### 8.3 Source and attribution
Entries are written by hand for this site. City and country names are facts and carry no licence obligation. Zone assignments are checked against the IANA time-zone database (public domain) through Python's `zoneinfo` and, where the installed `tzdata` includes `zone.tab` and `iso3166.tab`, against those files; **if they are absent the check is limited to zone validity and offsets, and that is recorded**, not assumed. **No third-party city dataset** (such as GeoNames, which would require attribution and a licence review) and no population or coordinate data is used. The privacy-and-about note on the page gets one line: "Time-zone data comes from your browser (the IANA time-zone database)."

### 8.4 Search behaviour
- **Normalise** query and fields: Unicode NFD with combining marks removed (so "São Paulo" and "Zürich" match "sao paulo", "zurich"), lowercase, every run of non-alphanumeric characters becomes one space, trimmed.
- **Match fields:** city, aliases, country name, country code (exact two-letter match only).
- **Every typed word must match** (prefix of a word, or contained in a field for words of three or more letters). Aliases of **three letters or fewer match only exactly** (so "la" does not match everything and "NYC" still finds New York).
- **Rank:** 0 exact city or alias; 1 city or alias starts with the query; 2 a word of the city or alias starts with it; 3 country name or code match; 4 contained in the city. Within a rank: alphabetical by city, then country. Cap 10.
- **IANA fallback:** after directory results, zones from `searchZones` whose `canonicalZone` is **not** represented by any directory entry are appended as "Time zone: America/Indiana/Knox", up to the cap. Their card title is the zone's last path segment (underscores to spaces) and the line "Time zone" in place of a country.
- **Region** restricts directory entries; the IANA fallback is hidden while a region is chosen (zones are not region-tagged by us).
- **Collisions in results:** every result shows city **and** country ("London, United Kingdom" and "London, Canada"); two entries are never distinguishable by city alone.
- **Predictable no-results:** exactly the message in 6.3.

### 8.5 Directory tests (run in section 12)
Every entry: valid id pattern, unique id, unique (normalised city, country), country code in `COUNTRY_NAMES`, `region` in the allowed set, 0 to 3 aliases, no alias equal to another entry's city or alias (except an intentional shared name that is a collision case, then both entries are returned), zone passes `isValidZone` **in the test runtime**, size within 150 to 250, every unusual-offset city from 7.5 present, and the 22 city names from section 3 each return a result. A duplicate-name fixture (London GB and London CA, Hyderabad IN and PK if both are included) proves both are returned and distinguishable.

## 9. Shareable URL state (`cities=`)
**Recommended and specified (D5, privacy-preserving, compatible with the existing replaceState approach).** No storage.
- **Parameters:** `cities` (comma-separated tokens) and `ref` (one token). Nothing else is read or written.
- **Accepted tokens:** (a) a **directory id** matching `^[a-z0-9]+(-[a-z0-9]+)*-[a-z]{2}$` that exists in the directory; (b) an **IANA zone identifier** (it contains `/`, or is `UTC`) accepted by `isValidZone` (length at most 64, `ZONE_SHAPE`). Nothing else: no names, no free text, no offsets.
- **Limits:** the whole query string is read up to **2,000 characters** (TP19's precedent); the `cities` value up to **600 characters**; at most **20 tokens are examined and 12 are kept** (in order).
- **Duplicates:** the same directory id twice keeps the first; two zone tokens with the same `canonicalZone` keep the first; a zone token equal to a directory entry's zone is allowed (they are different labels).
- **Invalid or malicious input:** an unknown or malformed token is skipped (and counted for the one polite note, 6.8); the raw text is never echoed to the page or the announcer; values reach the DOM only through `textContent` or as control values, never `innerHTML`. Directory lookup uses a `Map` (so `__proto__` or `constructor` as tokens find nothing). `ref` must name a board token, else it is ignored. A query longer than the limit is truncated before parsing.
- **Graceful fallback:** zero valid tokens means the default starter board.
- **Writing:** the page keeps the address in step with the board using `history.replaceState` (**no new history entries**; the Back button leaves the page, as on TP19); `buildBoardQuery` writes only directory ids and zone tokens and omits `ref` when it is "Your time". The canonical URL and the sitemap are unchanged: `?cities=` variants are not separate pages and are never listed.
- **Privacy:** the link carries only city choices. It does not carry the viewer's own zone ("Your time" is whatever the opener's browser reports), which is why a shared board shows differences for each viewer.

## 10. Privacy and security
No request after load, no geolocation, no IP lookup, no account, no `localStorage`, `sessionStorage`, cookie or IndexedDB, no network time, no third-party script. The browser's zone name is read locally and never sent. The site-wide consent-based GA4 is unchanged and **this pack adds no analytics events**. User-influenced strings (query values, search text) are data, never markup; hostile cases are tested (script text, quotes, very long values, `__proto__`). The directory and fixtures contain no personal data.

## 11. Accessibility and performance expectations
**Accessibility:** visible labels on every control (Add a city, Region, Compare with, 12-hour clock); the combobox follows the ARIA pattern with the listbox linked to it; the board is a labelled list (`ul`, label "World clocks") with one `li` per card; each time is a `<time>` element; Remove buttons are named by city; focus is visible (3px) and managed after add and remove; all state is words (Daytime or Night-time, ahead or behind, Tomorrow); contrast 4.5:1 for text and 3:1 for outlines; targets at least 44px on phones; 16px inputs; no motion at all; works at 200% text and at 320px without sideways scroll. **A single polite live region** announces only add, remove, reference change, link note and copy. **The clocks themselves are never live regions** and nothing is announced per minute.
**Performance:** proposed budgets (gzip; **targets set before any code exists and not yet measured**; they are measured and recorded at integration, and exceeding one is reported and needs a decision, not a silent change): World Clock JS (index plus clock engine plus directory) at most **16 KB**, CSS at most **3.5 KB**, in addition to the imported TP19 engine (9.3 KB gzip measured on 2026-10-19); no new dependency; nothing loads on other pages (the catalog `loader` imports the tool lazily as for every tool). At most 13 cards; one timer; at most one text write per changed field per minute; no layout thrash (reads, then writes). Directory search over at most 250 entries is immediate; a unit test records (loosely, never as a hard benchmark) that 13 cards render in a few milliseconds.

## 12. Test and acceptance criteria (risk-based; no full regression)
Follows the established policy: focused correctness, security and integration checks for the changed code and genuinely affected consumers; broader regression stays at the approved milestone; **real Android and Safari/WebKit stay UNVERIFIED until actually tested** and nothing says otherwise.

**Unit (pure, `node --test`)**
- *Engine:* offsets and labels for UTC, Kolkata, Kathmandu, Adelaide, Darwin, St John's, Tehran, Kabul, Yangon, Chatham, Lord Howe; difference text (zero, 15-minute, hour, over a day); day relation including 2 days (Kiritimati/Pago Pago); local-midnight rollover; clock-change cases (US and EU spring and autumn, southern hemisphere, Lord Howe 30 minutes, a zone with none); `msUntilNextMinute` at second and millisecond boundaries.
- *Oracle (OD1, enhanced time-zone correctness):* the Python `zoneinfo` fixture for card fields, offsets, differences and, **if the feature is included**, **next clock change** (7.4 and 7.6), over every zone named in 7.5 plus a spread of ordinary zones, at several reference instants including both sides of each 2026 and 2027 transition; results reported as "agrees on the tested cases".
- *Degradation (6.11):* the card model and the board with the clock-change feature off and with an empty directory still give correct cards and a working IANA search.
- *Reuse:* the behavioural TP19 contract (7.3 and 7.6); it does not enumerate TP19's exports.
- *Directory:* all of 8.5, and **search**: exact, prefix, alias, short alias exactness, diacritics, country search, ranking, cap, collision pair, IANA fallback exclusion of represented zones, region filter, and the exact no-results text.
- *URL:* valid, mixed valid and invalid, duplicates, over-limit tokens and length, `__proto__`, markup, very long, unknown ref, empty, round trip with `buildBoardQuery`; the TP19 handoff parse.
**Browser (focused, `--workers=1`, subpath desktop and mobile; root desktop smoke `@portable`)**
- Fixed zone and locale with Playwright's fake clock (`page.clock.install`), as `tests/browser/time-zone-converter.spec.js` does.
- Flows: default board; add by city name, alias ("Bombay") and country; region filter and browse list; add until 12 and the full state; remove and focus placement; reference change and fallback; 12/24-hour; copy link including a refusing clipboard; shared-link load with valid, mixed and hostile values; the TP19 link.
- *Timer:* after `page.clock.runFor(60000)` the time advances once; **no `setInterval` is ever created and at most one timeout is pending**; with `visibilitychange` to hidden the pending timer is cleared and none runs; on visible the board refreshes immediately; a clock jump (`setSystemTime`) corrects on the next tick; a card crosses local midnight and updates its date and relation.
- *Accessibility:* names, labels, combobox keyboard, Escape, focus after add and remove, a polite region that is silent on ticks (assert no live region text change on a minute tick), no horizontal scroll at 320, 360 and 390px, 200% text.
- *Integration:* listing, search and related links.
**Visual:** the tool at desktop and mobile; tablet for the grid breakpoint; Time Tools and All Tools only where they visibly change.
**Static and integration:** links, assets, SEO, inventory on the root and preview builds.
**Pinned expectations that change (to enumerate by a focused search before any broad run; the Base64 lesson was to run only the listing and count tests first):** the catalog, sections, relationships, search and tool-capabilities unit tests; the Time Tools count and listing in `stopwatch`, `countdown-timer`, `date-calculator`, `date-difference`, `hours-calculator` and `navigation` browser specs and any other found by that search; `time-zone-converter.spec.js` only if it asserts counts; `tests/inventory/url-inventory.json` (regenerate); the DOM, links, SEO and visual baselines for Time Tools, All Tools and Home where the new card or text changes them (reviewed by eye).
**Acceptance:** every test above passes at the end of the one bounded implementation scope; the TP19 contract tests pass; the oracle agrees (or the clock-change line is dropped); budgets are recorded; existing tools are unchanged; no `localStorage` appears in the tool.

## 13. Integration impacts
- **Files (new):** `assets/js/tools/world-clock/{index.js,clock-engine.js,city-directory.js}`, `assets/css/tools/world-clock.css`, the two tests and the fixture above, a directory test, the browser spec.
- **Files (edited):** `assets/js/data/tools.js` (entry), `src/_data/toolStyles.json`, the Growth ledger `scripts/growth-manifest/identity-ledger.json` (one record), `assets/js/data/categories.js` only if the Time Tools summary text must change, the pinned tests and baselines listed in section 12.
- **Not edited:** TP19 (`time-zone-converter/*`), the Unix converter, the rulebook, GA4, advertising, Featured Tools, the home page except metadata-derived text.
- **Visible side effects to review:** a new card in Time Tools and All Tools; search results and ranking for "world clock", "time" queries (the directory page only; no new aliases collide with TP19's); Time Tools count 6 to 7 in pinned specs; the home page's metadata-derived summary.
- **Docs at integration:** the implementation-notes section of this file; the R2 row and R1/R2 wording are updated only by a separately approved decision.

## 14. Deferred items (and the condition for revisiting)
| Deferred | Revisit when |
|---|---|
| Persistent favorites (browser storage) | Evidence (Search Console, consent-based GA4, or direct feedback) shows repeat visitors rebuilding the same board, **and** the rulebook 7.7 documented reason is written and approved. The shareable URL and a bookmark are the v1 answer. |
| Seconds display | A demonstrated need that justifies per-second rendering; an optional toggle with its own cost check. |
| Larger or data-driven city list, more aliases | Real unmatched searches are observed (not before), and a licensed data source is reviewed. |
| Analog clock faces, sunrise or sunset, weather | A clear user value and a maintained data source; none today. |
| Shared time-zone utility module | A third consumer appears; needs its own approval (TP19 refactor). |
| Reverse link from TP19 to World Clock | Separate decision (OD9). |
| Drag reordering, groups, labels or notes | Never needed by evidence; each adds state we do not store. |
| Articles | Only a distinct question with independent value (rulebook 6); none planned. |
| Gratuity Calculator | Separate specification; **independent verification of current Indian legal requirements from authoritative sources**, no assumed limits. |

## 15. Risks and rollback
**Risks**
1. **Demand unproven; incumbents are strong** (verdict B). Mitigation: a small, low-cost scope; no claim of demand.
2. **Repeat use without persistence** depends on bookmarks and shared links; this may limit retention (revisit per section 14).
3. **Next-clock-change logic is new and correctness-critical** (oracle; dropped if it cannot be verified).
4. **tz data differences** between the browser, Node ICU and Python's tzdata can produce false test mismatches or real user-visible lag; stated limits and a pinned, windowed fixture.
5. **Directory maintenance and mapping errors** (a city on the wrong zone); tests plus the owner's review of the delivered table.
6. **Coupling to TP19's engine:** behavioural contract tests (not an export-list freeze); TP19 changes need the time-zone unit set.
7. **Pinned counts and baselines** touch many specs (the Base64 pack found 16 failures in a wide first run); enumerate first.
8. **Device clock accuracy** cannot be corrected; stated on the page.
9. Real Android and Safari/WebKit remain unverified.
**Rollback:** one local commit for the bounded scope; `git revert` removes the tool, the catalog entry, the style and ledger records, the tests and the baseline changes together. There is no stored data, no migration and no server component. If a deployed route is later removed, redirect or 404 handling is a separate, explicitly approved decision. Nothing here touches production.

## 16. Decisions OD1 to OD10 (recorded 2026-10-19, as given by the user)
| # | Decision | Outcome |
|---|---|---|
| OD1 | Tier MEDIUM | **APPROVED**, with enhanced independent verification of time-zone correctness (7.4, 7.6, 12). |
| OD2 | Next clock change line | **CONDITIONAL.** Included only if the independent oracle agrees on the defined supported cases; its limits are documented (7.4); it must be removable without damaging the clock experience (6.11). |
| OD3 | Compare with; sorting | **APPROVED:** Compare with is in v1. Sorting is **deferred** (it does not materially improve v1 usability). |
| OD4 | Default starter board | **APPROVED:** New York, London, Dubai, Singapore, Sydney, excluding any city whose zone is the same zone as the user's (compared with `sameZone`, so `Asia/Kolkata` and `Asia/Calcutta` count as one), first four kept. |
| OD5 | City directory | **CONDITIONALLY APPROVED:** bounded, curated, with documented sources, coverage limits, collision handling and validation; **the actual entries are reviewed before release**. |
| OD6 | Reuse of TP19 pure exports | **APPROVED**, subject to behavioural contract tests and avoiding coupling beyond the imported functions (7.3). |
| OD7 | Catalog and SEO | **CONDITIONALLY APPROVED:** follow existing catalog, naming, routing, SEO and internal-linking conventions; **exact metadata is verified before implementation** (section 1 records the conventions found and marks the strings as draft). |
| OD8 | Implementation scope | **APPROVED AS A PLAN** (one bounded scope, one local commit under factory section 2a). **This does not authorize implementation or any commit of code.** |
| OD9 | Backlink from TP19 | **DEFERRED.** No TP19 backlink in this phase; evaluate separately after World Clock is validated. (The World Clock to TP19 handoff link, 6.9, is part of this spec and changes nothing in TP19.) |
| OD10 | Persistence | **DEFERRED.** No persistent favorites and no rulebook 7.7 exception in v1; revisit only with credible evidence of user value (section 14). |

**Implementation is not authorized by this document.** Before a build, a separate implementation-readiness phase and an explicit authorization are required. Prerequisites that phase must settle:
1. The reviewed city list (OD5) and its source cross-check (8.3), including whether `zone.tab` is available in the installed `tzdata`.
2. Verified catalog metadata, icon and capability flags (OD7).
3. A decision on the unpushed local commits and how the GitHub Pages preview will reflect them (the repository is 22 commits ahead of the stale local `origin/main` reference; Git operations are outside this specification).
4. A focused enumeration of the pinned tests and baselines that change (section 12).
5. Confirmation of the proposed budgets (11) as targets, and the oracle environment (Python with a pinned `tzdata`).
6. The outcome of the oracle for the clock-change line, which decides OD2.

**Roadmap status note.** `docs/tool-pack-factory.md` R2 stays **PROPOSED**; its World Clock row carries a pointer to this specification, stating it is not approved for implementation. No R1, P1 or P2 entry is changed.

## 17. Commit checkpoint (for the future implementation, not this phase)
Subject proposal: `feat: add World Clock`. Exact-tree verification afterwards: working tree clean apart from the intended files; unit set for time-zone, directory, URL and contract tests; the focused browser specs on subpath desktop and mobile; static checks on both builds; Growth manifest `--check`; no `localStorage` in the tool; budgets recorded. Push and any deployment need separate explicit authorization; production is never touched.
