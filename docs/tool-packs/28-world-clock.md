# Tool Pack 28: World Clock (Time Tools)

Status: **Implemented locally on 2026-10-19 (base commit `fce61ba`) under the owner's authorization of this specification, then refined the same day (section 19: search, geographic discovery, add feedback); see sections 18 and 19 for the implementation notes.** **World Clock 2.0 is specified in section 20 (specification only: not approved for implementation, not built).** Not pushed and not deployed; the city list and the icon await the owner's review before any release. The specification itself was finalized on 2026-10-19 (decisions OD1 to OD10 in section 16); until the implementation authorization it read: not authorized for implementation, a separate readiness phase and explicit authorization required.
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
- **Catalog conventions verified 2026-10-19 (`assets/js/data/tools.js`, the Time Zone Converter entry as the model):** fields `id`, `status`, `loader` (lazy import of `../tools/<id>/index.js`), `sectionId`, `icon` (one character), `title`, `description`, `autoRelated`, `relatedTools`, `aliases`, `capabilities` (flags from the closed vocabulary in `assets/js/data/tool-capabilities.js`; an unknown key is an error) and `seo { title, description }`; `toolType` is optional and defaults to "calculator" (no Time Tools entry sets it; whether World Clock sets `timezone` is an integration check, not a v1 requirement); SEO titles end with " | ToolZen Hub" (the site's spelling); the static check requires one description, one canonical per page, and the tool's `markup()` ids present in the built HTML.
- **Proposed capability flags (corrected 2026-10-19 after the readiness audit; proposed metadata only, the catalog is not changed by this document):** `share` (the page offers Copy link, which shares the board), `urlState` (the board is encoded in the URL), `realtime` (the cards update without a button), `timer` (the tool runs against the clock), `multipleInputs`, `explanation`, `localProcessing`. **Not set:** `copy` (that flag means copy-to-clipboard *of a result*; copying a link is `share`, and the spec has no result-copy feature), `reset`, `presets`, `savedState`/`history` (nothing is stored), and **`validation`**: no visitor-entered value is reported as invalid (a skipped item in a shared link is a note, not a field error), so existing catalog usage (Countdown Timer and TP19 set it for input fields they check) does not justify it here; revisit only if the final UI adds a checked input.
- **Vocabulary caveat (verified):** no existing catalog entry sets `timer` or `share`, and Countdown Timer and Stopwatch, which also run against the clock, declare only `realtime`. The two flags are in the vocabulary with definitions that fit World Clock literally, and nothing in `assets/` reads them (capabilities are descriptive metadata); the only tests that pin flags are for EMI and Loan Comparison. If implementation finds a consumer or a convention that argues against `timer` or `share`, the flag set is corrected there and the reason recorded in the implementation notes.
- **Icon (a distinct one is required):** the catalog's `icon` is one character shown on tool cards. In use on 2026-10-19: `◷` (three tools, including the Time Zone Converter), `◴` (Stopwatch), `◔`, `⊞`, `Σ`, `⇄`, `≠`, `÷`, `↔`, `¤`, `▣`, `◉`, `◈` and others. **Candidate: `◶` (U+25F6)**, which does not appear in the catalog. **It is not selected yet:** before it is final, check how it renders on the real card sizes on desktop and mobile in the font the browser actually uses (the site's Inter stack may not supply this glyph, in which case a system fallback font draws it and its look can differ by platform), that it reads as a clock-like mark next to `◷` and `◴`, and that it is not mistaken for a loading indicator; if it fails, pick another unused single character the same way. Shared icons, fonts and existing tool metadata are not modified.
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
- **Rendering:** only the elements whose text changed are written (time, date, relation), so a minute tick touches at most 13 small text nodes. Offsets and next-clock-change values are cached per zone and recomputed only when the reference instant passes the cached change (7.4), not every tick. **The optional clock-change values are computed after the first paint** (7.4), so first paint and the first minute tick never wait for them.
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
**Cost, scheduling and caching (corrected after the readiness audit):** about 150 offset lookups per zone. **Measured, Node 20.17 on the development laptop, warm:** about 16 µs per lookup and about **1.5 ms per zone**, about 20 ms for 13 zones computed together. A browser on a phone is **unmeasured** and likely slower. Therefore:
- The clock-change values are computed **after the first paint**, never before it: the board renders from the cheap per-card values (time, date, offset, difference, day word) first; then the clock-change lines are filled in one card at a time by short one-shot callbacks (`requestIdleCallback` where it exists, otherwise `setTimeout` with a zero delay), so no single task approaches the cost of all cards and first paint is never blocked. A card without its value yet shows no placeholder (6.11).
- **Cache** per canonical zone (cards sharing a zone, such as Mumbai and Delhi, share one value), holding `{ computedFromMs, result, validUntilMs }`. The value is reused on every minute tick and recomputed only when the reference instant passes the cached change instant, passes the end of the checked window, or jumps by more than a day (a manual clock change). Never per tick.
- Adding a card computes only that card's value (and only if its zone is not cached).
- This deferred work is a short-lived chain that ends within moments of load or of an add; it is **not** a second recurring timer (the one-timer rule in 6.10 and the timer tests in section 12 concern the recurring clock timer).
**Measured in the readiness audit (2026-10-19; one-off scans with scratch scripts that were not committed, so they are evidence, not fixtures):** Node 20.17.0 with ICU 75.1 (time-zone data **2024a**); 424 zones from `listZones()` (the 418 `supportedValuesOf` zones plus the engine's additions); reference instant 2026-10-19 00:00 UTC; window 400 days.
- An hourly scan (each change refined by bisection to the second) found at least one offset change in **132** zones and none in **292**.
- The 72-hour algorithm returned the **same first change as the hourly scan in all 424 zones**.
- Among zones with two or more changes in the window, the **shortest gap was 840 hours** (Africa/Casablanca and Africa/El_Aaiun); no pair was closer than 72 hours.
- Compared with Python `zoneinfo` on **tzdata 2025a** (hourly scan, refined to the minute), the first change agreed to the minute, with the same offsets, in **423 of 424 zones**. The one difference is `America/Asuncion` (7.4a).
- **What this does not show:** other dates or windows, other tz versions, future rule changes, or any case finer than an hourly scan (two changes within an hour of each other are invisible to that scan). It shows adequacy on the tested case, not universal correctness.
**Known limits (stated, and documented in the code and on the page where relevant):**
- **The 72-hour step can miss changes.** If the offset changes and changes back (or two changes cancel) inside one 72-hour step, the sampled offsets are equal and the change is not seen. Smaller steps reduce, but cannot remove, this; the algorithm is bounded sampling plus bisection, not a read of the tz transition table, which `Intl` does not expose.
- **Fixture agreement is tested correctness, not a proof.** The oracle covers the named zones, the named 2026 to 2027 reference instants and the tzdata version pinned; agreement there does **not** establish correctness for every zone, every date, historical dates (the feature looks forward from the present only) or future rule changes. The specification and the notes say "agrees on the tested cases", never "always correct".
- **Browser data may differ or lag.** It reports what *this browser's* tz data says; governments change rules and the data can lag; Node ICU, Python tzdata and a visitor's browser can be at different versions.
- **"None found" is a statement about the sampled window**, not a forecast.
**Removable by design:** the function, its one render slot and its tests are the only places the feature exists (6.11); removing it is a deletion, not a rework.
**Independent oracle:** `tests/fixtures/world-clock-golden.py` using Python's `zoneinfo` (no shared logic with the JS): for about 30 zones and several reference instants it finds the next offset change by scanning at 1-hour resolution then refining by the minute, and records the transition instant and both offsets; the instant must match to the minute. The fixture **pins the `tzdata` version** (2025a is the version the audit used) in the JSON it generates, and uses 2026 to 2027 reference dates. Python runs only when the fixture is deliberately regenerated; routine tests read the committed JSON.

**Inclusion condition (OD2, conditional):** the line ships only if the oracle agrees on the defined supported cases (the fixture zones and reference instants above), with expected database-version divergences handled only as 7.4a allows. **If it cannot be made to agree, the line is dropped from v1, not weakened or hidden behind caveats.** The algorithm is **not changed by this specification**; the feature stays behind `SHOW_NEXT_CLOCK_CHANGE` and the core board is complete without it (6.11).

### 7.4a Time-zone database version divergence (observed; regression case)
**Observed:** the Node 20.17 runtime used tz data **2024a** and the Python oracle used **2025a**. They agreed on 423 of 424 zones. `America/Asuncion` differed: the older data has a clock change on **2027-03-28** (UTC−03:00 to UTC−04:00 in this runtime's data) and the newer data (Paraguay's change to permanent UTC−03:00) has **no** change in the window. This is a *database-version difference*, not a calculation defect: the engine reported what its runtime's data said. A visitor's browser can be at yet another version, which is why the page says "this browser's data".
**Rules (all enforced by tests, not by convention):**
1. `America/Asuncion` **stays in the test suite as an explicit version-divergence regression case.** It is not deleted or ignored.
2. It is **excluded only from the strict cross-version fixtures** that require the JavaScript result and the pinned oracle to be identical. Those strict fixtures use zones with no known divergence between the pinned version and the runtimes the project supports.
3. A separate **divergence test** documents it. The fixture records the oracle's answer (`none in the window`, tzdata 2025a) and a `KNOWN_DIVERGENT_ZONES` entry (`America/Asuncion`, the reason, the versions involved). The test passes in exactly two ways: the runtime result **equals** the oracle (the runtime has data at least as new as the pin), or it differs **and** the zone is listed **and** the runtime's tz version (`process.versions.tz`) is older than the pinned version. Any other difference fails as a defect.
4. A difference on a zone **not** in the list always fails, whatever the versions: expected database differences and genuine calculation defects must be distinguishable, and the list is small, reviewed and dated.
5. The list is revisited when the pinned version or the supported runtime baseline moves (a zone whose runtime now agrees may be removed, with the reason noted).
6. The oracle version is never assumed to match the runtime or any visitor's browser. Agreement on bounded fixtures is reported as "agrees on the tested cases" and is **never** described as proof of correctness for all zones, dates or future rules.
### 7.5 Date and offset correctness
Display values come from `wallAt` (the browser's own `Intl` data for the instant), never from fixed offsets. Required cases: whole-hour zones, UTC, **+05:30** (Kolkata), **+05:45** (Kathmandu), **+09:30** (Adelaide, Darwin), **−03:30** (St John's), **+03:30** (Tehran), **+04:30** (Kabul), **+06:30** (Yangon), **+12:45 / +13:45** (Chatham), **30-minute clock change** (Lord Howe), the **International Date Line** (Kiritimati +14, Pago Pago −11, up to 2 calendar days apart), southern-hemisphere clock changes, and a card crossing local midnight.

### 7.6 Fixtures and contract tests
- `tests/fixtures/world-clock-golden.py` and `.json` as in 7.4, plus the instant-to-local-fields, offset and difference cases for the same zones and instants (so the card model is checked against `zoneinfo`). The JSON records the pinned tzdata version, the strict cross-version cases, and the `KNOWN_DIVERGENT_ZONES` list of 7.4a.
- `tests/fixtures/zone-country.json` (8.3) and its directory tests (8.5).
- The **version-divergence test** (7.4a), including `America/Asuncion`.
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
Entries are written by hand for this site. City and country names are facts and carry no licence obligation.

**Zone-to-country reference (decided after the readiness audit, 2026-10-19).** A time-zone database is an identifier database, not a city directory: the audit verified that the installed `tzdata` 2025a ships `zone.tab` (417 data rows: country code, rough coordinates, zone, comment), `zone1970.tab` (311) and `iso3166.tab`, and that `zone.tab` has `Asia/Kolkata` for India but no Mumbai, Delhi, Bangalore or Chennai. It can therefore **validate** which country a zone belongs to; it cannot **supply** the cities. The directory stays hand-written.
- **Pinned snapshot:** `tests/fixtures/zone-country.json`, generated once from the `zone.tab` and `iso3166.tab` of one identified tzdata release (2025a is the version verified) and committed. It records: the tzdata version, the generation date, and, for each zone, its ISO country code(s). It holds no coordinates or comments. It is **not created by this specification**; creating it is part of the future implementation.
- **Routine JavaScript tests read only the committed JSON.** They require no Python and no locally installed `tzdata` (the audit found the package under a per-user `AppData\Roaming` site-packages path, which must not be a dependency of routine tests).
- **Regeneration** is a separate, documented, manual step (a small script under `tests/fixtures/`, run when the pinned release is deliberately updated); the new snapshot is diffed and reviewed like any fixture, and the version is changed on purpose, never implicitly.
- **Per-entry validation:** the entry's `zone` is present in the snapshot (by name, links included), the entry's `country` is one of that zone's countries in the snapshot, and the zone also passes `isValidZone` in the test runtime. A zone the runtime accepts but the snapshot lacks (a newer or renamed zone) is an explicit, reviewed exception list in the test, with a reason, never a silent skip.
- **If the snapshot or the runtime disagree** the failure names the entry and says which of the two checks failed; an entry is fixed or the exception recorded, not loosened.

**No third-party city dataset** (such as GeoNames, which would require attribution and a licence review) and no population or coordinate data is used. The privacy-and-about note on the page gets one line: "Time-zone data comes from your browser (the IANA time-zone database)."

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
Every entry: valid id pattern, unique id, unique (normalised city, country), country code in `COUNTRY_NAMES`, `region` in the allowed set, 0 to 3 aliases, no alias equal to another entry's city or alias (except an intentional shared name that is a collision case, then both entries are returned), zone passes `isValidZone` **in the test runtime**, zone and country agree with the pinned `zone-country.json` snapshot (8.3; exceptions explicit and reasoned), the snapshot file itself is well formed and names its tzdata version, size within 150 to 250, every unusual-offset city from 7.5 present, and the 22 city names from section 3 each return a result. A duplicate-name fixture (London GB and London CA, Hyderabad IN and PK if both are included) proves both are returned and distinguishable.

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
**Measured versus not measured (readiness audit, 2026-10-19).** *Measured:* the TP19 engine's size (31.6 KB raw, 9.3 KB gzip) and TP19's `index.js` (45 KB raw, about 10 KB gzip); in Node 20.17 on the development laptop, about 16 µs per offset lookup and about 1.5 ms per zone for the clock-change scan (7.4). *Not measured, only proposed:* the budgets below; the size of the not-yet-written directory (an estimate of 4 to 5 KB gzip for about 200 entries is a guess); render, search and tick cost in a real browser; anything on a phone; memory and battery effect of the minute timer; Lighthouse. *Not verified on any device or browser:* real Android, Safari and WebKit; the combobox, focus placement and the silent-tick policy in any assistive technology; `Intl.supportedValuesOf` and `Intl` details on older engines (TP19's fallback list covers a missing `supportedValuesOf`, but no browser support table was checked). **These stay outstanding and are reported as unverified until actually tested.**
**Performance:** proposed budgets (gzip; **provisional targets set before any code exists and not yet measured, not established results**; they are measured and recorded at integration, and exceeding one is reported and needs a decision, not a silent change; TP19's own `index.js` is about 10 KB gzip for a larger UI, so 16 KB for index plus engine plus directory is plausible but tight): World Clock JS (index plus clock engine plus directory) at most **16 KB**, CSS at most **3.5 KB**, in addition to the imported TP19 engine (9.3 KB gzip measured on 2026-10-19); no new dependency; nothing loads on other pages (the catalog `loader` imports the tool lazily as for every tool). At most 13 cards; one timer; at most one text write per changed field per minute; no layout thrash (reads, then writes). Directory search over at most 250 entries is immediate; a unit test records (loosely, never as a hard benchmark) that 13 cards render in a few milliseconds.

## 12. Test and acceptance criteria (risk-based; no full regression)
Follows the established policy: focused correctness, security and integration checks for the changed code and genuinely affected consumers; broader regression stays at the approved milestone; **real Android and Safari/WebKit stay UNVERIFIED until actually tested** and nothing says otherwise.

**Unit (pure, `node --test`)**
- *Engine:* offsets and labels for UTC, Kolkata, Kathmandu, Adelaide, Darwin, St John's, Tehran, Kabul, Yangon, Chatham, Lord Howe; difference text (zero, 15-minute, hour, over a day); day relation including 2 days (Kiritimati/Pago Pago); local-midnight rollover; clock-change cases (US and EU spring and autumn, southern hemisphere, Lord Howe 30 minutes, a zone with none); `msUntilNextMinute` at second and millisecond boundaries.
- *Oracle (OD1, enhanced time-zone correctness):* the Python `zoneinfo` fixture for card fields, offsets, differences and, **if the feature is included**, **next clock change** (7.4 and 7.6), over every zone named in 7.5 plus a spread of ordinary zones, at several reference instants including both sides of each 2026 and 2027 transition; results reported as "agrees on the tested cases". The strict cross-version cases exclude known-divergent zones; **`America/Asuncion` is tested separately as the version-divergence case (7.4a), never dropped**; a difference on any other zone fails as a defect.
- *Degradation (6.11):* the card model and the board with the clock-change feature off and with an empty directory still give correct cards and a working IANA search.
- *Reuse:* the behavioural TP19 contract (7.3 and 7.6); it does not enumerate TP19's exports.
- *Directory:* all of 8.5, and **search**: exact, prefix, alias, short alias exactness, diacritics, country search, ranking, cap, collision pair, IANA fallback exclusion of represented zones, region filter, and the exact no-results text.
- *URL:* valid, mixed valid and invalid, duplicates, over-limit tokens and length, `__proto__`, markup, very long, unknown ref, empty, round trip with `buildBoardQuery`; the TP19 handoff parse.
**Browser (focused, `--workers=1`, subpath desktop and mobile; root desktop smoke `@portable`)**
- Fixed zone and locale with Playwright's fake clock (`page.clock.install`), as `tests/browser/time-zone-converter.spec.js` does.
- Flows: default board; add by city name, alias ("Bombay") and country; region filter and browse list; add until 12 and the full state; remove and focus placement; reference change and fallback; 12/24-hour; copy link including a refusing clipboard; shared-link load with valid, mixed and hostile values; the TP19 link.
- *Timer:* after `page.clock.runFor(60000)` the time advances once; **no `setInterval` is ever created and, once the board has settled (after the deferred clock-change work of 7.4 has finished), exactly one timeout is pending: the minute timer**; with `visibilitychange` to hidden the pending timer is cleared and none runs; on visible the board refreshes immediately; a clock jump (`setSystemTime`) corrects on the next tick; a card crosses local midnight and updates its date and relation.
- *Accessibility:* names, labels, combobox keyboard, Escape, focus after add and remove, a polite region that is silent on ticks (assert no live region text change on a minute tick), no horizontal scroll at 320, 360 and 390px, 200% text.
- *Integration:* listing, search and related links.
**Visual:** the tool at desktop and mobile; tablet for the grid breakpoint; Time Tools and All Tools only where they visibly change.
**Static and integration:** links, assets, SEO, inventory on the root and preview builds.
**Pinned expectations that change (focused search done in the readiness audit, 2026-10-19; line numbers may drift and the search is repeated at implementation; run only the listing, count and metadata tests first, as the Base64 pack learned):**
- *Unit:* `tests/unit/catalog.test.mjs` (the id, section and title map around lines 131 to 142, which names every Time Tools tool); `tests/unit/tool-capabilities.test.mjs` (line 173 lists the non-calculator tools to exclude from the built-calculators comparison: `world-clock` must be added; the flag tests pin EMI and Loan Comparison only, so new flags need no change there); `sections`, `relationships` and `search` unit tests (published set, related lists, search ranking); the Growth manifest tests (`growth-manifest-items`, `-validate`, `-export`) and `scripts/growth-manifest/identity-ledger.json` (one new `{id, module, moduleChanges: [], provenance: "added", state: "active"}` record, as for Base64), then `node scripts/growth-manifest/export.mjs --check`.
- *Metadata and inventory:* `assets/js/data/tools.js` (entry), `src/_data/toolStyles.json`, `tests/inventory/url-inventory.json` (regenerate; `npm run inventory:check`).
- *Browser:* `stopwatch.spec.js` (about line 315, "6 tools" for Time Tools); `time-zone-converter.spec.js` (about line 567, "Time Tools has 6 tools", and the listing, navigation and relation tests near lines 556, 577, 616 and 625); `navigation.spec.js` (about line 491, `.directory-group` count 18 becomes 19, and the section-card checks near lines 19 to 26 and 478); `unix-timestamp-converter.spec.js` (about line 504) and `text-diff.spec.js` (about line 492), which assert that Time Tools is "unchanged" or holds no developer tool; `ppf.spec.js` (about line 454, reads `time-tools.html`); `visual.spec.js` (line 38, the `time-tools` baseline).
- *Baselines (reviewed by eye, updated only for what the new card changes):* DOM, SEO and links baselines for Time Tools, All Tools, Home (metadata-derived text) and the new page; visual baselines for Time Tools and All Tools; DOM, SEO and link checks for the new page on the root and preview builds.
- *Not expected to change:* the Time Zone Converter's own engine tests and golden fixture (they must keep passing, 7.3); `tool-capabilities.test.mjs` flag tests.
- **Existing unrelated failures, kept separate and not fixed by this pack:** the image-compressor smoke test (images without `src`) and the `home-loan` tablet visual baseline (recorded in the Base64 notes). If either appears during focused runs it is reported as pre-existing, never absorbed into this scope.
- **No unrelated broad regression is run automatically**; the final gate runs once, risk-based, at the end of the approved scope (factory sections 2a, 4 and 6).
**Acceptance:** every test above passes at the end of the one bounded implementation scope; the TP19 contract tests pass; the oracle agrees (or the clock-change line is dropped); budgets are recorded; existing tools are unchanged; no `localStorage` appears in the tool.

## 13. Integration impacts
- **Files (new):** `assets/js/tools/world-clock/{index.js,clock-engine.js,city-directory.js}`, `assets/css/tools/world-clock.css`, the engine and contract tests, the oracle fixture (`world-clock-golden.py` and `.json`), the pinned `tests/fixtures/zone-country.json` and its regeneration script, the directory and version-divergence tests, the browser spec.
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
1. The reviewed city list (OD5), checked against the pinned `zone-country.json` snapshot (8.3). **Readiness finding:** `zone.tab` is available in the installed `tzdata` 2025a, so the snapshot can be generated; it is not created by this specification.
2. Final catalog metadata (OD7): the corrected capability flags (section 1), a **distinct icon verified for rendering and consistency** (`◶` is only a candidate), exact SEO strings against the site's checks.
3. The unpushed local commits: the repository is **23** commits ahead of the stale local `origin/main` reference as of `43512a7` (the count grows with each documentation commit). Reconciling them and verifying the GitHub Pages preview is a **separate Git synchronization phase** (Git operations are outside this specification, and nothing here depends on its outcome beyond the preview baseline).
4. The pinned tests and baselines of section 12, re-enumerated by a focused search at implementation.
5. The budgets of section 11 as provisional targets, and the oracle environment: Python with `tzdata` 2025a (or a deliberately chosen newer pin), used only to regenerate fixtures.
6. The oracle outcome for the clock-change line (with the 7.4a divergence rules), which decides OD2.
7. **Still outstanding and unverified:** real Android and Safari/WebKit, assistive-technology behaviour, in-browser performance (section 11).

**Roadmap status note.** `docs/tool-pack-factory.md` R2 stays **PROPOSED**; its World Clock row carries a pointer to this specification, stating it is not approved for implementation. No R1, P1 or P2 entry is changed.

## 17. Commit checkpoint (for the future implementation, not this phase)
Subject proposal: `feat: add World Clock`. Exact-tree verification afterwards: working tree clean apart from the intended files; unit set for time-zone, directory, URL and contract tests; the focused browser specs on subpath desktop and mobile; static checks on both builds; Growth manifest `--check`; no `localStorage` in the tool; budgets recorded. Push and any deployment need separate explicit authorization; production is never touched.


## 18. Implementation notes (2026-10-19)
Facts only. Tier MEDIUM; one bounded scope; one local commit (`feat: add World Clock`). Specification status at this point: **implemented locally; not pushed, not deployed; the city list and the icon are still awaiting the owner's review before any release.**

**What was built.** `assets/js/tools/world-clock/{index.js, clock-engine.js, city-directory.js}`, `assets/css/tools/world-clock.css`; the catalog entry after the Time Zone Converter (`id: "world-clock"`, `autoRelated: false`, `relatedTools: ["time-zone-converter"]`, one way); the style entry; the Growth ledger record; the regenerated URL inventory. The Time Zone Converter is **unchanged**. Imported from it (the contract of section 7.3): `isValidZone, canonicalZone, sameZone, localZone, listZones, searchZones, offsetSecondsAt, wallAt, offsetLabel, formatClock`.

**Catalog metadata as implemented.** Icon `◶` (U+25F6; compared in a browser beside the existing Time Tools icons, where it reads as part of the same circle-and-quadrant family and is distinct from `◷` (used twice), `◴` and `◔`; rendering on Android, iOS and Safari is unverified). Capability flags: `share, urlState, realtime, timer, multipleInputs, explanation, localProcessing` (no `copy`, no `validation`). SEO title "World Clock: Live Time in Cities and Time Zones | ToolZen Hub" and the description of section 1; the static checks pass. The six aliases of section 1; none collides with the Time Zone Converter's.

**Deviations from this specification (each deliberate).**
1. **Toolbar and board header.** To keep the "Your time" card on screen at 390 x 844 (section 6.1), Region and Compare with share a row on a phone, the region hint paragraph was removed (its sentence moved into the "How to Read" note), and the 24-hour checkbox sits beside the "Your clocks" heading instead of in the toolbar. In a browser at 390 x 844 the first card's time and date are visible without scrolling.
2. **Search hint** is shorter than the draft: "Search well-known cities, or any time zone your browser supports, such as America/Chicago. Not every city is listed." The sentence about shared zones is in the "What This Covers" note.
3. **A typed zone path finds cities.** The hint invites "America/Chicago", but the zone fallback leaves out zones a listed city already covers, so that query found nothing. Directory search now also matches a word of the city's IANA zone name **only when the query contains a slash or underscore**; the city that gives the zone its name (Chicago for America/Chicago, Tokyo for Asia/Tokyo) ranks first. A plain name such as "london" does not list every city on Europe/London.
4. **Search order.** Cities of one name follow the directory's own order, which lists the better-known city first (London, United Kingdom before London, Canada), instead of country-code order (which would put Canada first).
5. **The snapshot** `tests/fixtures/zone-country.json` also holds the list of valid ISO country codes, besides the zone to country map and the tzdata release.
6. **Deferred clock-change work** uses `requestIdleCallback` (timeout 500 ms) where it exists and `setTimeout(0)` otherwise, one card per callback.
7. **Test hook:** the panel sets `data-ready="true"` once it has painted, as the other tools do.
8. **The visitor's own zone is shown as the browser names it** (Chromium says Asia/Calcutta for India), as the Time Zone Converter does.
9. **Sort control: not built** (OD3, deferred).

**Time-zone oracle (independent Python zoneinfo, tzdata 2025a).** `tests/fixtures/world-clock-golden.py` and `.json`: 32 zones x 8 fixed instants = 256 strict cases (offset, local date, time, weekday and the next clock change found by an hourly scan then a minute refinement) and 2 divergent cases. On this machine (Node 20.17, ICU 75.1, tz data 2024a) **all 256 strict cases agree**; the divergent zone (America/Asuncion) behaves as documented (the runtime shows the 2027-03-28 change, the pin has none), passes through the version-divergence rule (7.4a) and stays in the suite. **This is agreement on the tested cases, not proof for every zone, date or future rule.** The clock-change line is **included** (OD2's condition is met for the tested cases) behind `SHOW_NEXT_CLOCK_CHANGE`.

**Measured (this laptop; timings in Node; sizes gzip level 9).**
| Item | Value | Provisional target |
| --- | --- | --- |
| World Clock JS: index 9.4 KB + engine 5.8 KB + directory 7.0 KB | **22.1 KB** | 16 KB: **exceeded** (reported, not changed) |
| World Clock CSS | 2.2 KB | 3.5 KB: met |
| Time Zone Converter engine (imported) | 9.3 KB | not in the budget |
| Directory search over 195 entries | about 0.6 ms per call | "immediate" |
| Directory search plus the zone fallback | about 4.8 ms per call | "immediate" |
| Next clock change for one zone | about 1.5 ms (audit measurement) | after first paint |
Not measured: in-browser render and tick cost, anything on a phone, memory, battery, Lighthouse.

**Tests run (focused; no full browser regression).** Unit, new: engine 35, directory 19, URL 13, contract 9, oracle 7. Browser, new (`tests/browser/world-clock.spec.js`): 28 tests, passing on subpath-desktop and subpath-mobile. Pinned expectations updated deliberately: the `catalog`, `sections`, `relationships`, `search` and `tool-capabilities` unit tests; the Time Tools counts (6 to 7) and the directory-group count (18 to 19) in the `hours-calculator`, `image-compressor-resizer`, `json-formatter`, `navigation`, `stopwatch`, `text-diff`, `time-zone-converter` and `unix-timestamp-converter` browser specs; the link crawl now allows the one World Clock to Time Zone Converter hand-off query (`from`, `to`). Baselines refreshed after review: DOM `tools-directory`, the links summary, the SEO baseline (the new page and three visibleTextChars values on listings), visual `time-tools` and `tools` (desktop and mobile). New visual baselines: `world-clock` (desktop, mobile, tablet).

**Failures that are not from this change (left as they are).** The `sip`, `fd` and `cagr` visual baselines (desktop and mobile) already fail on the commit before this change (checked by building that commit in a temporary worktree: the same three fail there, while `tools` and `time-tools` pass). Several tablet baselines do not exist; Playwright writes a new image on the first run, and the four it wrote for other tools during this work were deleted. The image-compressor smoke test and the `home-loan` tablet baseline are the earlier known cases and were not re-run.

**Not verified.** Real Android, Safari and WebKit; assistive technology (the combobox, focus placement and the silent-tick policy are tested in Chromium only); `Intl` details on older engines (a zone a browser rejects hides that directory entry, so Europe/Kyiv needs tz data from 2022b or later, otherwise Kyiv is simply not offered); the icon's rendering on other platforms; Lighthouse.

**Risks to review.**
1. **JS budget exceeded** (22.1 KB against 16 KB). Most of it is the static page text inside `markup()` (about 11 KB raw of index.js) and the directory data (7 KB gzip). Trimming is possible (a shorter FAQ, a leaner entry encoding) and is the owner's decision.
2. **Directory content** is for the owner's review before release (table below).
3. **No persistence:** a repeat visitor rebuilds the board from the address or a bookmark.
4. The clock-change line states what the browser's data says and cannot see two changes within one 72-hour step.

**City directory review table (195 entries).** By region: Africa 24, Americas 53, Asia 56, Europe 40, Oceania 22. Every zone is accepted by this runtime and is listed in the pinned zone.tab (tzdata 2025a) for the entry's country; no exception is needed. Same-name pairs, told apart by country: London (United Kingdom, Canada), Birmingham (United Kingdom, United States), Hyderabad (India, Pakistan), San Jose (United States) and San José (Costa Rica). Region follows the zone's IANA area (Istanbul is Europe; Nicosia is Asia; Honolulu, Guam and Pago Pago are Oceania; Reykjavik is Europe; Malé is Asia; Port Louis and Antananarivo are Africa). America/Asuncion is listed deliberately (the version-divergence case).

| id | City | Country | Zone | Region | Aliases |
| --- | --- | --- | --- | --- | --- |
| `mumbai-in` | Mumbai | India | `Asia/Kolkata` | Asia | Bombay |
| `delhi-in` | Delhi | India | `Asia/Kolkata` | Asia | New Delhi |
| `bengaluru-in` | Bengaluru | India | `Asia/Kolkata` | Asia | Bangalore |
| `chennai-in` | Chennai | India | `Asia/Kolkata` | Asia | Madras |
| `kolkata-in` | Kolkata | India | `Asia/Kolkata` | Asia | Calcutta |
| `hyderabad-in` | Hyderabad | India | `Asia/Kolkata` | Asia |  |
| `pune-in` | Pune | India | `Asia/Kolkata` | Asia | Poona |
| `ahmedabad-in` | Ahmedabad | India | `Asia/Kolkata` | Asia |  |
| `karachi-pk` | Karachi | Pakistan | `Asia/Karachi` | Asia |  |
| `lahore-pk` | Lahore | Pakistan | `Asia/Karachi` | Asia |  |
| `islamabad-pk` | Islamabad | Pakistan | `Asia/Karachi` | Asia |  |
| `hyderabad-pk` | Hyderabad | Pakistan | `Asia/Karachi` | Asia |  |
| `dhaka-bd` | Dhaka | Bangladesh | `Asia/Dhaka` | Asia | Dacca |
| `colombo-lk` | Colombo | Sri Lanka | `Asia/Colombo` | Asia |  |
| `kathmandu-np` | Kathmandu | Nepal | `Asia/Kathmandu` | Asia | Katmandu |
| `thimphu-bt` | Thimphu | Bhutan | `Asia/Thimphu` | Asia |  |
| `kabul-af` | Kabul | Afghanistan | `Asia/Kabul` | Asia |  |
| `tashkent-uz` | Tashkent | Uzbekistan | `Asia/Tashkent` | Asia |  |
| `almaty-kz` | Almaty | Kazakhstan | `Asia/Almaty` | Asia |  |
| `tehran-ir` | Tehran | Iran | `Asia/Tehran` | Asia | Teheran |
| `baghdad-iq` | Baghdad | Iraq | `Asia/Baghdad` | Asia |  |
| `dubai-ae` | Dubai | United Arab Emirates | `Asia/Dubai` | Asia |  |
| `abu-dhabi-ae` | Abu Dhabi | United Arab Emirates | `Asia/Dubai` | Asia |  |
| `doha-qa` | Doha | Qatar | `Asia/Qatar` | Asia |  |
| `riyadh-sa` | Riyadh | Saudi Arabia | `Asia/Riyadh` | Asia |  |
| `jeddah-sa` | Jeddah | Saudi Arabia | `Asia/Riyadh` | Asia |  |
| `kuwait-city-kw` | Kuwait City | Kuwait | `Asia/Kuwait` | Asia |  |
| `muscat-om` | Muscat | Oman | `Asia/Muscat` | Asia |  |
| `manama-bh` | Manama | Bahrain | `Asia/Bahrain` | Asia |  |
| `tel-aviv-il` | Tel Aviv | Israel | `Asia/Jerusalem` | Asia | Tel Aviv-Yafo |
| `jerusalem-il` | Jerusalem | Israel | `Asia/Jerusalem` | Asia |  |
| `amman-jo` | Amman | Jordan | `Asia/Amman` | Asia |  |
| `beirut-lb` | Beirut | Lebanon | `Asia/Beirut` | Asia |  |
| `nicosia-cy` | Nicosia | Cyprus | `Asia/Nicosia` | Asia |  |
| `baku-az` | Baku | Azerbaijan | `Asia/Baku` | Asia |  |
| `tbilisi-ge` | Tbilisi | Georgia | `Asia/Tbilisi` | Asia |  |
| `yerevan-am` | Yerevan | Armenia | `Asia/Yerevan` | Asia |  |
| `bangkok-th` | Bangkok | Thailand | `Asia/Bangkok` | Asia |  |
| `hanoi-vn` | Hanoi | Vietnam | `Asia/Ho_Chi_Minh` | Asia |  |
| `ho-chi-minh-city-vn` | Ho Chi Minh City | Vietnam | `Asia/Ho_Chi_Minh` | Asia | Saigon |
| `phnom-penh-kh` | Phnom Penh | Cambodia | `Asia/Phnom_Penh` | Asia |  |
| `yangon-mm` | Yangon | Myanmar | `Asia/Yangon` | Asia | Rangoon |
| `kuala-lumpur-my` | Kuala Lumpur | Malaysia | `Asia/Kuala_Lumpur` | Asia | KL |
| `singapore-sg` | Singapore | Singapore | `Asia/Singapore` | Asia |  |
| `jakarta-id` | Jakarta | Indonesia | `Asia/Jakarta` | Asia |  |
| `manila-ph` | Manila | Philippines | `Asia/Manila` | Asia |  |
| `hong-kong-hk` | Hong Kong | Hong Kong | `Asia/Hong_Kong` | Asia | HK |
| `beijing-cn` | Beijing | China | `Asia/Shanghai` | Asia | Peking |
| `shanghai-cn` | Shanghai | China | `Asia/Shanghai` | Asia |  |
| `shenzhen-cn` | Shenzhen | China | `Asia/Shanghai` | Asia |  |
| `taipei-tw` | Taipei | Taiwan | `Asia/Taipei` | Asia |  |
| `seoul-kr` | Seoul | South Korea | `Asia/Seoul` | Asia |  |
| `tokyo-jp` | Tokyo | Japan | `Asia/Tokyo` | Asia |  |
| `osaka-jp` | Osaka | Japan | `Asia/Tokyo` | Asia |  |
| `ulaanbaatar-mn` | Ulaanbaatar | Mongolia | `Asia/Ulaanbaatar` | Asia | Ulan Bator |
| `male-mv` | Malé | Maldives | `Indian/Maldives` | Asia |  |
| `london-gb` | London | United Kingdom | `Europe/London` | Europe |  |
| `birmingham-gb` | Birmingham | United Kingdom | `Europe/London` | Europe |  |
| `edinburgh-gb` | Edinburgh | United Kingdom | `Europe/London` | Europe |  |
| `dublin-ie` | Dublin | Ireland | `Europe/Dublin` | Europe |  |
| `lisbon-pt` | Lisbon | Portugal | `Europe/Lisbon` | Europe | Lisboa |
| `madrid-es` | Madrid | Spain | `Europe/Madrid` | Europe |  |
| `barcelona-es` | Barcelona | Spain | `Europe/Madrid` | Europe |  |
| `paris-fr` | Paris | France | `Europe/Paris` | Europe |  |
| `brussels-be` | Brussels | Belgium | `Europe/Brussels` | Europe |  |
| `amsterdam-nl` | Amsterdam | Netherlands | `Europe/Amsterdam` | Europe |  |
| `luxembourg-lu` | Luxembourg | Luxembourg | `Europe/Luxembourg` | Europe |  |
| `berlin-de` | Berlin | Germany | `Europe/Berlin` | Europe |  |
| `frankfurt-de` | Frankfurt | Germany | `Europe/Berlin` | Europe |  |
| `munich-de` | Munich | Germany | `Europe/Berlin` | Europe | München |
| `zurich-ch` | Zurich | Switzerland | `Europe/Zurich` | Europe |  |
| `geneva-ch` | Geneva | Switzerland | `Europe/Zurich` | Europe |  |
| `vienna-at` | Vienna | Austria | `Europe/Vienna` | Europe | Wien |
| `rome-it` | Rome | Italy | `Europe/Rome` | Europe | Roma |
| `milan-it` | Milan | Italy | `Europe/Rome` | Europe | Milano |
| `athens-gr` | Athens | Greece | `Europe/Athens` | Europe |  |
| `copenhagen-dk` | Copenhagen | Denmark | `Europe/Copenhagen` | Europe |  |
| `stockholm-se` | Stockholm | Sweden | `Europe/Stockholm` | Europe |  |
| `oslo-no` | Oslo | Norway | `Europe/Oslo` | Europe |  |
| `helsinki-fi` | Helsinki | Finland | `Europe/Helsinki` | Europe |  |
| `reykjavik-is` | Reykjavik | Iceland | `Atlantic/Reykjavik` | Europe |  |
| `warsaw-pl` | Warsaw | Poland | `Europe/Warsaw` | Europe |  |
| `prague-cz` | Prague | Czechia | `Europe/Prague` | Europe |  |
| `budapest-hu` | Budapest | Hungary | `Europe/Budapest` | Europe |  |
| `bucharest-ro` | Bucharest | Romania | `Europe/Bucharest` | Europe |  |
| `sofia-bg` | Sofia | Bulgaria | `Europe/Sofia` | Europe |  |
| `belgrade-rs` | Belgrade | Serbia | `Europe/Belgrade` | Europe |  |
| `zagreb-hr` | Zagreb | Croatia | `Europe/Zagreb` | Europe |  |
| `riga-lv` | Riga | Latvia | `Europe/Riga` | Europe |  |
| `tallinn-ee` | Tallinn | Estonia | `Europe/Tallinn` | Europe |  |
| `vilnius-lt` | Vilnius | Lithuania | `Europe/Vilnius` | Europe |  |
| `kyiv-ua` | Kyiv | Ukraine | `Europe/Kyiv` | Europe | Kiev |
| `minsk-by` | Minsk | Belarus | `Europe/Minsk` | Europe |  |
| `moscow-ru` | Moscow | Russia | `Europe/Moscow` | Europe |  |
| `saint-petersburg-ru` | Saint Petersburg | Russia | `Europe/Moscow` | Europe | St Petersburg |
| `istanbul-tr` | Istanbul | Turkey | `Europe/Istanbul` | Europe |  |
| `cairo-eg` | Cairo | Egypt | `Africa/Cairo` | Africa |  |
| `lagos-ng` | Lagos | Nigeria | `Africa/Lagos` | Africa |  |
| `accra-gh` | Accra | Ghana | `Africa/Accra` | Africa |  |
| `abidjan-ci` | Abidjan | Ivory Coast | `Africa/Abidjan` | Africa |  |
| `dakar-sn` | Dakar | Senegal | `Africa/Dakar` | Africa |  |
| `casablanca-ma` | Casablanca | Morocco | `Africa/Casablanca` | Africa |  |
| `algiers-dz` | Algiers | Algeria | `Africa/Algiers` | Africa |  |
| `tunis-tn` | Tunis | Tunisia | `Africa/Tunis` | Africa |  |
| `tripoli-ly` | Tripoli | Libya | `Africa/Tripoli` | Africa |  |
| `khartoum-sd` | Khartoum | Sudan | `Africa/Khartoum` | Africa |  |
| `addis-ababa-et` | Addis Ababa | Ethiopia | `Africa/Addis_Ababa` | Africa |  |
| `nairobi-ke` | Nairobi | Kenya | `Africa/Nairobi` | Africa |  |
| `kampala-ug` | Kampala | Uganda | `Africa/Kampala` | Africa |  |
| `dar-es-salaam-tz` | Dar es Salaam | Tanzania | `Africa/Dar_es_Salaam` | Africa |  |
| `kinshasa-cd` | Kinshasa | DR Congo | `Africa/Kinshasa` | Africa |  |
| `luanda-ao` | Luanda | Angola | `Africa/Luanda` | Africa |  |
| `lusaka-zm` | Lusaka | Zambia | `Africa/Lusaka` | Africa |  |
| `harare-zw` | Harare | Zimbabwe | `Africa/Harare` | Africa |  |
| `maputo-mz` | Maputo | Mozambique | `Africa/Maputo` | Africa |  |
| `windhoek-na` | Windhoek | Namibia | `Africa/Windhoek` | Africa |  |
| `johannesburg-za` | Johannesburg | South Africa | `Africa/Johannesburg` | Africa | Joburg |
| `cape-town-za` | Cape Town | South Africa | `Africa/Johannesburg` | Africa |  |
| `port-louis-mu` | Port Louis | Mauritius | `Indian/Mauritius` | Africa |  |
| `antananarivo-mg` | Antananarivo | Madagascar | `Indian/Antananarivo` | Africa |  |
| `new-york-us` | New York | United States | `America/New_York` | Americas | NYC, New York City |
| `boston-us` | Boston | United States | `America/New_York` | Americas |  |
| `washington-d-c-us` | Washington, D.C. | United States | `America/New_York` | Americas | Washington DC, DC |
| `philadelphia-us` | Philadelphia | United States | `America/New_York` | Americas |  |
| `atlanta-us` | Atlanta | United States | `America/New_York` | Americas |  |
| `miami-us` | Miami | United States | `America/New_York` | Americas |  |
| `detroit-us` | Detroit | United States | `America/Detroit` | Americas |  |
| `chicago-us` | Chicago | United States | `America/Chicago` | Americas |  |
| `houston-us` | Houston | United States | `America/Chicago` | Americas |  |
| `dallas-us` | Dallas | United States | `America/Chicago` | Americas |  |
| `birmingham-us` | Birmingham | United States | `America/Chicago` | Americas |  |
| `denver-us` | Denver | United States | `America/Denver` | Americas |  |
| `phoenix-us` | Phoenix | United States | `America/Phoenix` | Americas |  |
| `los-angeles-us` | Los Angeles | United States | `America/Los_Angeles` | Americas | LA |
| `san-francisco-us` | San Francisco | United States | `America/Los_Angeles` | Americas | SF |
| `san-jose-us` | San Jose | United States | `America/Los_Angeles` | Americas |  |
| `seattle-us` | Seattle | United States | `America/Los_Angeles` | Americas |  |
| `las-vegas-us` | Las Vegas | United States | `America/Los_Angeles` | Americas |  |
| `anchorage-us` | Anchorage | United States | `America/Anchorage` | Americas |  |
| `toronto-ca` | Toronto | Canada | `America/Toronto` | Americas |  |
| `ottawa-ca` | Ottawa | Canada | `America/Toronto` | Americas |  |
| `montreal-ca` | Montreal | Canada | `America/Toronto` | Americas |  |
| `london-ca` | London | Canada | `America/Toronto` | Americas |  |
| `winnipeg-ca` | Winnipeg | Canada | `America/Winnipeg` | Americas |  |
| `calgary-ca` | Calgary | Canada | `America/Edmonton` | Americas |  |
| `edmonton-ca` | Edmonton | Canada | `America/Edmonton` | Americas |  |
| `vancouver-ca` | Vancouver | Canada | `America/Vancouver` | Americas |  |
| `halifax-ca` | Halifax | Canada | `America/Halifax` | Americas |  |
| `st-john-s-ca` | St. John's | Canada | `America/St_Johns` | Americas | Saint John's, St Johns |
| `mexico-city-mx` | Mexico City | Mexico | `America/Mexico_City` | Americas | Ciudad de México |
| `guadalajara-mx` | Guadalajara | Mexico | `America/Mexico_City` | Americas |  |
| `monterrey-mx` | Monterrey | Mexico | `America/Monterrey` | Americas |  |
| `tijuana-mx` | Tijuana | Mexico | `America/Tijuana` | Americas |  |
| `guatemala-city-gt` | Guatemala City | Guatemala | `America/Guatemala` | Americas |  |
| `san-jose-cr` | San José | Costa Rica | `America/Costa_Rica` | Americas |  |
| `panama-city-pa` | Panama City | Panama | `America/Panama` | Americas |  |
| `havana-cu` | Havana | Cuba | `America/Havana` | Americas | La Habana |
| `kingston-jm` | Kingston | Jamaica | `America/Jamaica` | Americas |  |
| `santo-domingo-do` | Santo Domingo | Dominican Republic | `America/Santo_Domingo` | Americas |  |
| `san-juan-pr` | San Juan | Puerto Rico | `America/Puerto_Rico` | Americas |  |
| `bogota-co` | Bogotá | Colombia | `America/Bogota` | Americas |  |
| `quito-ec` | Quito | Ecuador | `America/Guayaquil` | Americas |  |
| `lima-pe` | Lima | Peru | `America/Lima` | Americas |  |
| `caracas-ve` | Caracas | Venezuela | `America/Caracas` | Americas |  |
| `la-paz-bo` | La Paz | Bolivia | `America/La_Paz` | Americas |  |
| `santiago-cl` | Santiago | Chile | `America/Santiago` | Americas |  |
| `buenos-aires-ar` | Buenos Aires | Argentina | `America/Argentina/Buenos_Aires` | Americas |  |
| `montevideo-uy` | Montevideo | Uruguay | `America/Montevideo` | Americas |  |
| `asuncion-py` | Asunción | Paraguay | `America/Asuncion` | Americas |  |
| `sao-paulo-br` | São Paulo | Brazil | `America/Sao_Paulo` | Americas |  |
| `rio-de-janeiro-br` | Rio de Janeiro | Brazil | `America/Sao_Paulo` | Americas | Rio |
| `brasilia-br` | Brasília | Brazil | `America/Sao_Paulo` | Americas |  |
| `manaus-br` | Manaus | Brazil | `America/Manaus` | Americas |  |
| `sydney-au` | Sydney | Australia | `Australia/Sydney` | Oceania |  |
| `canberra-au` | Canberra | Australia | `Australia/Sydney` | Oceania |  |
| `melbourne-au` | Melbourne | Australia | `Australia/Melbourne` | Oceania |  |
| `brisbane-au` | Brisbane | Australia | `Australia/Brisbane` | Oceania |  |
| `adelaide-au` | Adelaide | Australia | `Australia/Adelaide` | Oceania |  |
| `darwin-au` | Darwin | Australia | `Australia/Darwin` | Oceania |  |
| `perth-au` | Perth | Australia | `Australia/Perth` | Oceania |  |
| `hobart-au` | Hobart | Australia | `Australia/Hobart` | Oceania |  |
| `lord-howe-island-au` | Lord Howe Island | Australia | `Australia/Lord_Howe` | Oceania |  |
| `auckland-nz` | Auckland | New Zealand | `Pacific/Auckland` | Oceania |  |
| `wellington-nz` | Wellington | New Zealand | `Pacific/Auckland` | Oceania |  |
| `chatham-islands-nz` | Chatham Islands | New Zealand | `Pacific/Chatham` | Oceania |  |
| `suva-fj` | Suva | Fiji | `Pacific/Fiji` | Oceania |  |
| `port-moresby-pg` | Port Moresby | Papua New Guinea | `Pacific/Port_Moresby` | Oceania |  |
| `noumea-nc` | Noumea | New Caledonia | `Pacific/Noumea` | Oceania |  |
| `papeete-pf` | Papeete | French Polynesia | `Pacific/Tahiti` | Oceania |  |
| `honolulu-us` | Honolulu | United States | `Pacific/Honolulu` | Oceania |  |
| `hagatna-gu` | Hagåtña | Guam | `Pacific/Guam` | Oceania | Guam |
| `pago-pago-as` | Pago Pago | American Samoa | `Pacific/Pago_Pago` | Oceania |  |
| `apia-ws` | Apia | Samoa | `Pacific/Apia` | Oceania |  |
| `nuku-alofa-to` | Nuku'alofa | Tonga | `Pacific/Tongatapu` | Oceania |  |
| `kiritimati-ki` | Kiritimati | Kiribati | `Pacific/Kiritimati` | Oceania | Christmas Island |


## 19. Refinement phase: search, geographic discovery and add feedback (2026-10-19)
Facts only. Base commit `7c9db2f`; one bounded refinement, one local commit. It follows a read-only review that found seven essential usability problems and two small polish items. **Where this section differs from sections 6, 7.4 and 8 above, this section is what was built.** Not pushed, not deployed.

**What changed.**
1. **Search correctness.** A word is matched inside another word only from four letters ("usa" no longer finds Jerusalem or Lusaka); a country is matched by the start of its name from three letters ("uk" is no longer Ukraine). A whole query that names ONE country (its name or an alias) shows that country's places: aliases USA, US, UK, U.K., Britain, Great Britain, England, Scotland, Wales, Northern Ireland, UAE, Emirates, Holland, the Netherlands, Czech Republic, Burma, Ivory Coast, Côte d'Ivoire, Türkiye, Deutschland, España, Brasil, Bharat, Russian Federation. A name that could mean two countries (Korea, Georgia) is deliberately not an alias. A bare two-letter code is **not** a country query ("la" is Los Angeles, not Laos). "india" is the country (no America/Indiana zones).
2. **Abbreviations are explained, not guessed.** Thirty-four common abbreviations (IST, EST, CST, BST, PST, CET, JST, AEST and others) return no places and a note: one abbreviation can mean several places, so abbreviations are not searched. Abbreviation search itself stays deferred.
3. **Continent words are filters.** asia, europe, africa, oceania, north america, south america and americas list that region's listed cities with a count. "Americas" is split into **North America** (which includes Central America and the Caribbean) and **South America**; the region of a zone under America/ follows its country, and Atlantic and Indian zones are placed by hand.
4. **Country browsing.** A country with several time zones (Australia 12, United States 29, Canada 23, Russia 26, Brazil 16) shows its listed cities first, then every other zone IANA lists for it that the browser knows, each with zone.tab's own description ("Mountain - ID (south)", "Western Australia (Eucla)"). The header counts distinct zones ("Australia · 12 time zones"). The first ten show; "Show all N" shows the rest (up to 60). Data: `assets/js/tools/world-clock/country-zones.js`, **generated** from the IANA zone.tab by `scripts/world-clock/generate-country-zones.py` (tzdata 2025a); it is product data, held to the pinned test fixture by a unit test (same countries, same zones, nothing added or missing). It is loaded by a dynamic import, after the page's first work and after the search warm-up, or on first need. Without it, the listed cities still work and the header says "(listed cities only)".
6. **Rows show the time.** Every search or browse row shows the place's time and UTC offset now (with the weekday only where the date differs from the visitor's), "On your board" where it already is, and the zone's own description for a zone place. A 56-row list costs about 1.5 ms.
7. **Browse places.** A button beside Compare with opens a panel with **Region** (six regions) and a dependent **Country** (the countries that have a zone in that region), an inline list of rows (each a button), a count line, Show all and Clear. It replaces the Region select that sat in the toolbar and that only narrowed the search; search is now always global, so it behaves the same whatever the panel holds. Closed, the panel costs no vertical space on a phone: the "Your time" card is still on screen at 390 x 844.
8. **Add feedback.** The line under the search box (which never changes height) says "Added London, United Kingdom. 5 of 12 cities." (or that a place is already on the board), with a "Show clock" button when the clock is off screen. The new card carries a "Just added" mark and a green border until the next action (typing, adding, removing, changing the reference), with no timer. **Scrolling:** only a pointer or touch choice on a phone (viewport under 720 px) with the card off screen scrolls it into view (smooth unless the visitor prefers reduced motion); a keyboard choice never scrolls and never moves focus; "Show clock" scrolls and moves focus to the card's name because the visitor asked.
9. **Hand-off link contrast.** `.calculator-page a` was giving it the brand green at 3.3:1; `.calculator-page .wc-plan` now gives the action green (rgb 8 127 71), at least 4.5:1, and the shared link colour elsewhere is unchanged (asserted).
10. **First-search delay.** The search structures (the zone list, the usable directory entries, the zone identities, the browser's formatters for the directory zones) are built while the page is idle, in separate idle callbacks (`requestIdleCallback` with a 500 ms timeout, `setTimeout(0)` otherwise), after the first paint; the panel sets `data-warm="true"` when done. Search works before the warm-up has run. Entries sharing a zone are checked once (148 zones instead of 195 entries), and the zone list is searched only for three letters or more or a typed zone path.
11. **Polish.** The visitor's own zone is shown as **Asia/Kolkata** (the browser's Asia/Calcutta stays the identity; five legacy names are mapped for display only, in the page's own table, and the Time Zone Converter import is unchanged). A card with no clock change **says nothing** ("No clock change found…" is gone; the line shows only when a change was verified); the status row no longer pushes the day badge to the bottom, so the badges align across cards.

**Search before and after (this runtime; Node 20.17).**
| Query | Before | After |
| --- | --- | --- |
| usa | Jerusalem, Lusaka | United States · 29 time zones: New York, Boston, … |
| uk | Kyiv, a Pacific zone | United Kingdom: London, Birmingham, Edinburgh |
| india | 8 Indian cities, America/Indiana/Knox, Indianapolis | India · 1 time zone: 8 cities |
| ist / est | Istanbul, Kiritimati / Tallinn, Bucharest | an explanation, no places |
| asia | Asia/Aden, Asia/Dili, … | Asia · 56 listed cities |
| south america / oceania / americas | nothing | the region's listed cities |
| australia | 9 cities, no times | Australia · 12 time zones: 9 cities and the other zones, each with its time |
| united states | the first 10 of 20 cities, alphabetical | 20 cities then 21 more zones, 10 shown and "Show all 41" |
| botswana | nothing | Botswana · 1 time zone: Gaborone |
| england, uae, holland, czech republic, burma | nothing | the right country |

**Country and zone coverage.** 247 countries from zone.tab; every zone this browser knows is reachable under its country (the audit measured 271 of 419 zone identities with no listed city, reachable before only by typing a path fragment). Unchanged: 195 listed cities, not exhaustive, and the page still says so. Contested territories follow IANA's own country listing; nothing is added or removed. Country names are the site's own wording for the listed countries and the browser's `Intl.DisplayNames` for the others, so a name can differ slightly between browsers.

**Performance (this laptop, Chrome, local server without compression; 4x is Chrome's CPU throttle, a rough proxy for a low-end phone, not a device measurement).**
| Measure | Before | After |
| --- | --- | --- |
| First search keystroke, 1x CPU | 98 ms | 19 to 32 ms |
| First search keystroke, 4x CPU | 611 ms | 132 to 162 ms |
| Later keystrokes, 1x | 3 to 8 ms | 3 to 11 ms |
| Add a city, 1x | about 15 ms | about 18 to 30 ms (it now confirms, marks and checks the viewport) |
| Page ready, 12 cities, 1x | 705 ms | about 700 ms |
| Minute repaint | 0.3 to 0.7 ms | 0.3 ms |
Worst case, a keystroke in the first moments before the idle warm-up has run, is still about 110 to 170 ms at 1x. **Size (gzip):** initial script 29.5 KB (index 12.7, engine 8.6, directory 8.3; it was 22.1 KB), CSS 2.7 KB (was 2.2 KB), and the country data **5.7 KB, loaded separately**. The provisional 16 KB target is exceeded further; most of the growth is the new browse and result code and the page text in `markup()`. This is reported, not optimised away.

**Tests.** Unit, new: `world-clock-search` (21) and `world-clock-country-zones` (9); updated: engine 35, directory 19. The browser spec grew from 28 to 39 tests on each of subpath-desktop and subpath-mobile (new: aliases and false matches, abbreviations, continents, row times, Show all, add confirmation with keyboard and phone scrolling, contrast, warm-up and first keystroke under 60 ms, country data failing to load, browse by region and by country). The oracle and the Time Zone Converter contract tests are unchanged and pass. Baselines refreshed after review: SEO (one value, this page's visible text) and visual `world-clock` (desktop, mobile, tablet). The static checks, the build comparison and the growth manifest check are run at the commit. Known failures unrelated to this work are as recorded in section 18.

**Limits and risks.** Real Android, Safari and WebKit, assistive technology (the combobox with its header, note and "Show all" rows; the browse panel's selects and buttons), and real-phone performance remain **unverified**. The country data lists zones and says nothing about which cities exist. `Intl.DisplayNames` is needed for names of countries the site does not list (older browsers fall back to the country code). Abbreviation search, UTC-offset search, "did you mean" suggestions and an expanded directory are deferred.


## 20. World Clock 2.0: specification amendment (2026-10-19)

**Status: SPECIFICATION ONLY. The specification and its defaults were approved on 2026-10-19; implementation is NOT authorized by that approval and needs a separate, explicit approval. Not built.** Sections 1 to 19 remain the record of what was built and what was decided; nothing in them is rewritten. This section extends them. **When World Clock 2.0 is implemented, the sections it names in 20.1 are superseded by this one**; everything else in sections 1 to 19 stays in force.

Basis: the read-only design and feasibility review of 2026-10-19 (prototype measurements are quoted where used and labelled as measurements; sizes not yet built are labelled estimates) and the owner's decisions of the same day (20.16). The existing tool is **extended, not replaced**: the clock engine, the curated directory, country browsing, the shareable board, the time-zone correctness safeguards and the Time Zone Converter hand-off are kept.

### 20.1 What changes and what is superseded
| Existing behaviour | World Clock 2.0 |
| --- | --- |
| The popup search list (an ARIA combobox listbox) | **Replaced** by one inline results surface in the Explore view (20.8). Sections 6.3 and 19 (items 5 to 7, the popup and the Browse panel) are superseded. |
| The Browse panel (Region, Country) | **Absorbed** into the Explore filters (20.9). |
| A board only | The board becomes the **My clocks** view; a new **Explore cities** view is added (20.2). |
| Search by name, country, continent, zone path | Kept (20.4), and extended with current-time, AM/PM, range and UTC-offset search. |
| 12-clock limit | Kept **for the board only**; the directory has no limit. |
| `cities=` and `ref=` | Unchanged (20.14). |

### 20.2 The two views
1. **Explore cities**: a complete, searchable, live worldwide directory (all 195 curated cities, plus a separate group of other browser-supported time zones).
2. **My clocks**: the existing board of up to 12 uniform cards plus Your time, with Compare with, 24-hour, Copy link and the Time Zone Converter hand-off, unchanged in behaviour.

**Page order:** heading, the live reference line (20.7), one search field with example chips, the view tabs, the active view. The search field and the reference line stay above the tabs so they are on screen in both views.

**Tabs (ARIA tabs pattern):** a `tablist` with two `tab`s, "Explore cities (195)" and "My clocks (n)" (n is the number of selected cities; Your time is not counted), and one `tabpanel` each. Roving `tabindex`; Left and Right Arrow move between tabs, Home and End go to the first and last; the tab that receives focus is selected (automatic activation: both panels are local and light). The hidden panel has `hidden` and is not repainted on a minute tick; it repaints once when shown.

**Which view shows first**
- No `cities=` in the address, or one with no valid city: **Explore cities**.
- A valid shared `cities=` (at least one valid city after validation, section 9): **My clocks**.
- The board always starts with the starter cities when the address gives none (section 6.8), so "My clocks" is never empty at load.
- The visitor's choice of view is **not** stored or put in the address.

**Searching switches to Explore.** The first input in the search field while My clocks is showing selects Explore and says so once in the polite region ("Showing results in Explore cities"). It never moves focus out of the search field.

**Adding** (from any row): the board changes, the "My clocks (n)" label changes, and the confirmation line (20.10) says so. The Explore list stays where it is; nothing scrolls.

### 20.3 Reference line and search field
- **Reference line:** "Your time", large digits, weekday and date, the browser zone shown with the modern spelling (Asia/Kolkata), and its current UTC offset. It is one `time` element, repainted on the minute tick, never a live region.
- **One search field** (`type="search"`, in a `role="search"` form), label "Search cities, countries or times", placeholder "City, country, 8 PM, UTC+05:30". It filters the Explore results inline; it is not a combobox and has no popup.
- **Example chips** (buttons): `8 PM`, `AM`, `UTC+05:30`, `Australia`, `Europe`, `Mumbai`. A chip puts its text in the field and runs the search; it never adds a clock.
- **Keyboard:** Enter in the field moves focus to the first result's Add button (it does **not** add a result: a query may have hundreds of matches). Escape clears a non-empty field; in an empty field it does nothing. "/" is not bound.
- **Updates while typing** run on every `input` event (coalesced to one per animation frame); there is no artificial debounce. Only the polite result summary (20.10) is debounced (700 ms after the last input).

### 20.4 Universal search: grammar and precedence
**Normalisation (all classes):** trim; lower case; collapse runs of spaces; "−", "–" and "—" read as "-"; dots removed from "a.m." and "p.m."; the words "noon" and "midnight" are accepted as hour words (20.5); accents removed for text as in section 8.4. The typed text is never shown back in a result heading except clipped to 12 characters (as for abbreviations) and only through `textContent`.

**Classification: the first rule that applies wins.**
| # | Class | It applies when the normalised query | Examples |
| --- | --- | --- | --- |
| 1 | Empty | is empty | (the unfiltered directory) |
| 2 | **UTC offset** | is `utc` or `gmt`, or has an optional `utc`/`gmt` prefix followed by a sign and an offset (20.6) | `utc+08:00`, `+08:00`, `gmt-4`, `-4`, `+5:30`, `utc` |
| 3 | **Time range** | is two time atoms joined by `-` or `to` | `08:00-10:00`, `9 am-12 pm`, `22:00-02:00` |
| 4 | **Specific time** | is one time atom with minutes | `8:30 am`, `20:00`, `14:45`, `5:30` |
| 5 | **Hour** | is one time atom without minutes, or is `noon` or `midnight` | `8`, `08`, `8 am`, `20`, `8pm`, `noon`, `midnight` |
| 6 | **Period** | is exactly `am` or `pm` | `AM`, `pm` |
| 7 | **Invalid time or offset** | starts with a digit or a sign but matches no rule above | `25:00`, `13 pm`, `8:75`, `123`, `+15` |
| 8 | Abbreviation | is one of the known abbreviations (section 19, item 2) | `ist`, `est`, `cst` |
| 9 | Continent or region | is a continent word (section 19, item 3) | `asia`, `north america`, `americas` |
| 10 | Country | is one whole country name or alias (section 19, item 1) | `india`, `usa`, `uk` |
| 11 | Zone path | contains a slash or an underscore | `asia/kolkata`, `america/new_york` |
| 12 | Text | anything else | `mumbai`, `new yor`, `kath` |

**Why this order keeps city names safe:** no city, alias or country name begins with a digit or a sign, so classes 2 to 5 and 7 cannot capture a name; "Time" classes are recognised only from their own grammar. The one real collision is class 6: "am" is also the start of Amman and Amsterdam. A bare `am` therefore shows the period results **with a notice** at the top ("Showing places where it is currently AM. Looking for Amman or Amsterdam? Keep typing."), and the next character (for example "ams") reclassifies the query as text. `pm` collides with no name.

**Region and Country filters combine with every class by AND** (a region or country chosen in Filters narrows time, period and offset results too). Free text combined with a time (for example "8 pm europe") is **not** supported in v1: the whole query is one class.

**Result headings (exact wording; the examples assume 12-hour display, and the 24-hour switch changes only how times are printed):**
| Class | Heading |
| --- | --- |
| Hour (AM or PM given, or 24-hour) | "Places currently between 8:00 PM and 8:59 PM" |
| Bare hour 1 to 12 | two headings, "Places currently between 8:00 AM and 8:59 AM" and "... 8:00 PM and 8:59 PM" |
| Period | "Places where it is currently AM (midnight to 11:59 AM)" |
| Specific time | "Places currently around 8:30 AM (8:15 to 8:45 AM, ±15 minutes)" |
| Range | "Places currently between 8:00 AM and 10:00 AM" (adds "crossing midnight" when it does) |
| Offset | "Places currently using UTC+05:30" |
| Country | "Australia: multiple current time zones" (one zone: "India: one time zone") |
| Continent | "Asia: 56 listed cities" |

### 20.5 Time semantics (exact)
**One shared instant.** Every time, period, range and offset match is decided from one instant `T`, read once per minute tick (and once when the query changes), and from each place's **actual** local clock at `T` (the Time Zone Converter's `wallAt`). Nothing is computed from fixed offsets, so daylight-saving changes, 30-minute and 45-minute offsets, Lord Howe's 30-minute shift and the Date Line are correct by construction. A place's *local minute* `m` is its local hour times 60 plus its local minute, 0 to 1439.

**Time atoms.** `H` or `HH` (0 to 23), optionally `:MM` (00 to 59), optionally `am` or `pm` (a space before it is allowed, and none: `8pm`). With am/pm the hour is 1 to 12; otherwise 0 to 23.
- **12-hour:** 12 AM is 00:00 (midnight) and belongs to AM; 12 PM is 12:00 (noon) and belongs to PM; 1 to 11 AM is 01:00 to 11:00; 1 to 11 PM is 13:00 to 23:00.
- **24-hour:** a leading zero (`08`), an hour above 12 (`20`), or hour `0`/`00` reads on the 24-hour clock.
- **`noon` and `midnight` (words).** As a whole query, `noon` means the **current local hour 12:00 to 12:59** (the same as `12 pm`) and `midnight` means the **current local hour 00:00 to 00:59** (the same as `12 am`). Neither means an exact minute, neither takes a tolerance, and neither is a specific time: the result heading says "Places currently between 12:00 PM and 12:59 PM" (or "...12:00 AM and 12:59 AM"). They are not accepted with minutes (`noon:30` is invalid). As a **range endpoint** the word means the time 12:00 or 00:00 (endpoints are times, below), so `midnight-6 am` is 00:00 up to 06:00. They are words, never city names, so they cannot capture a name.
- **Bare 1 to 12 with no leading zero and no am/pm** (`8`, `5:30`, `12`) is read **both ways**, as the AM and the PM reading, shown as two separately labelled groups (AM group first). It is never silently one of them.

**Matching contracts (all at minute granularity, all inclusive of the stated ends)**
| Query | Place matches when |
| --- | --- |
| Hour `H` (resolved to 24-hour hour `h`) | `60h <= m <= 60h+59` (8 AM is 08:00 to 08:59; 8 PM is 20:00 to 20:59; `08` is 08:00 to 08:59) |
| `AM` | `0 <= m <= 719` (midnight through 11:59) |
| `PM` | `720 <= m <= 1439` (noon through 23:59) |
| Specific time `t` with tolerance `k` | the circular distance between `m` and `t` is at most `k` minutes: the window `[t-k, t+k]`, both ends included, wrapping across midnight |
| Range `a-b` | `a <= m <= b` when `a <= b`; otherwise `m >= a` or `m <= b` (crossing midnight). Both end minutes are included. |

**Specific time and tolerance.** The default is **±15 minutes**, always **labelled "around"** in the heading with the window written out (20.4). Four optional controls (a segmented group labelled "Around by"): ±5, **±15 (selected by default)**, ±30, ±60 minutes. The choice applies to the current search only and is not stored. A specific time **never silently widens**. There is no "exactly" control in v1: the measurements behind this decision were that an exact-minute match returns anything in only 30 of 1,440 minutes (2.1%) across the 195 cities, because every place in a whole-hour zone shares the same minute, and that a ±15 window is empty in 41% of sampled minutes for the curated cities and 31% across all 419 zone identities (a ±30 window: 10% and 0%).

**Ranges.** Endpoints are **times, not hour buckets**: `9 am-12 pm` is 09:00 up to and including 12:00 (not through 12:59); to include all of the 11 o'clock hour write `9 am-11:59 am`. An hour-only endpoint means the start of that hour. **No endpoint may be a bare 1-to-12** without am/pm and without a leading zero (`9-12`): that range is invalid with a hint ("Add AM or PM, or use 24-hour times such as 09:00-12:00"), because guessing the halves would silently change the answer. Equal endpoints (`8-8`) are invalid ("A range needs two different times"). A range is a time-of-day filter on **current** local clocks: it is not a time-zone conversion, a meeting search or a future or past time (those belong to the Time Zone Converter, with its own handling of dates).

**Invalid and incomplete queries.** Class 7 shows one hint line, never a city fallback and never an empty list with no explanation: "That is not a time or offset we can read. Try 8 PM, 20:00, 8:30 AM, 9 AM-12 PM or UTC+05:30." A half-typed expression (`8:`, `utc+`, `-`) is class 7 and shows the same hint without an error style. Class 8 and the other name classes keep their existing messages.

**Date changes.** Two places in the same clock window can be on different dates (the Date Line). Every row therefore shows the weekday (or Today, Tomorrow, Yesterday relative to the visitor's date) when its date differs from the visitor's, and the heading says nothing about dates.

**Duplicates sharing a time zone.** Cities in one zone show the same time and all appear (Mumbai and Delhi both match). They are not collapsed in v1.

**Refresh contract.** The shared timer (section 6.10) ticks once a minute, and while the page is hidden does nothing. On a tick: (1) times and day/night words are rewritten in place for the displayed rows; (2) for a **time, period, range or offset** query, or a **local-time sort**, the matching and the order are recomputed from the new instant. If keyboard focus is inside the results list, the recomputation is **deferred**: the list keeps its rows, a non-live button "Results changed. Update" appears under the heading, and the update applies on that button, on the next query change, or when focus leaves the list. No row is removed or moved under a focused control, and nothing is announced on a tick. The heading carries "Updated 7:50 PM" (the instant used).

### 20.6 UTC-offset search
- **Forms:** an optional `utc` or `gmt` prefix, a sign (`+`, `-`, `−`), hours (1 or 2 digits), optionally minutes with a colon or as two more digits (`+5:30`, `+05:30`, `+0530`). Bare `utc` or `gmt` means +00:00. Without a prefix a **sign is required** (so `5:30` is a time, `+5:30` is an offset).
- **Valid offsets:** from -12:00 to +14:00 in 15-minute steps. Anything else is class 7 (for example `+15`, `+5:10`).
- **Matching:** a place matches when its offset **at the shared instant** equals the typed one, in seconds. It is **not** a local-hour search and it is **not** a time-zone identity: the heading and a one-line note say "An offset can change with daylight saving, and one offset covers many time zones."
- **`utc` / `gmt` alone:** the same, at +00:00, with an extra note that GMT is a time standard and that, for example, London is UTC+01:00 in summer.

### 20.7 Counts, groups and wording
Three different things are counted and never mixed:
- **Listed cities:** curated directory entries that match.
- **Time zones:** distinct zone identities (by the browser's identity for a zone, section 7.1).
- **Other time zones:** zone identities the browser knows that **no listed city uses** and that match.

A heading line states the scope exactly, for example "9 listed cities in 2 time zones, plus 0 other time zones" (the measured reading for `UTC+05:30` at 14:20 UTC on 2026-10-19: eight Indian cities in Asia/Kolkata and Colombo). A city count is **never** written as a time-zone count and never called "time zones". When the other-zones group is collapsed its count is still stated.

**The other-time-zones group** is a separate, labelled, collapsible group below the listed cities ("Other time zones (no listed city): N"), a disclosure button with `aria-expanded`:
- In the unfiltered directory it is **present and collapsed**, showing its count (269 identities in the review measurement).
- It is **expanded automatically** for a country query, a zone-path query, a Country filter, and any query with no listed-city match; it is **present but collapsed** (with its count) for time, period, range and offset results, and the visitor expands it.
- Its rows are titled by the zone's own place name with zone.tab's description, as in section 19, and carry the same time, offset, day/night and Add controls. They need the country data; if it did not load, the group shows "Other time zones could not be loaded" and nothing else about them is claimed.

### 20.8 The Explore directory
**Content.** All 195 curated cities in one list on one page, no ordinary pagination and no "page" navigation. The default order is **City (A to Z)** by the plain normalised comparison used elsewhere (never the browser's locale), ties by country.

**Row.** A list item. Left: the city (bold) and the country (or, for a zone, its description). Right: the local time (weekday first when the date differs), the UTC offset, the approximate Daytime or Night-time word with its icon, and an **Add** button whose accessible name is "Add Sydney, Australia". Rows are a list, not a table; there is no second grid layout for the directory in v1 (the board's cards are the grid).
- **Already on the board:** the Add button **stays in place** and becomes inert: visible text "On your board", `aria-disabled="true"`, and an accessible name that says so ("Sydney, Australia is on your board"). It is **not removed and not natively disabled**, so it stays focusable and **focus is not lost when you press Add**; activating it does nothing.
- **Board full (12):** every other Add button becomes inert the same way, with the visible reason "Board full" (`aria-disabled="true"`, still focusable, with the reason in its accessible name), and one line under the search field says "The board is full (12 cities). Remove one in My clocks to add another." Pressing the Add that fills the board keeps focus on that button, now "On your board".
- **Zone-only rows:** a place added from the other-zones group is a zone place exactly as in section 9 (token form), with the same 12-clock limit.

**Sorting** (a labelled select "Sort by"; the choice lasts for the session only): **City**, **Country** (then city), **Local time** (earliest local clock first, 00:00 to 23:59, ties by city), **UTC offset** (west to east, ties by city). A query in classes 2 to 6 selects **Local time** by default (for a range that crosses midnight, ordered from the range start; for a specific time, nearest first). An explicit choice by the visitor is kept for the rest of the visit and never overridden.

**Filters** (one disclosure, "Filters (n)" with n the number active, closed by default on a phone): **Region** (six), a dependent **Country**, and **Clear filters**. They combine with the query by AND. (Time and offset are searched, not filtered through separate controls: one source of truth, the search field.)

**Result summary line** under the controls (visible text, not a live region): the heading of 20.4, the count line of 20.7, and "Updated H:MM" for time-sensitive results.

**Progressive rendering (no pagination).** The first 40 rows are rendered synchronously; the rest are appended in chunks of 40 rows, one chunk per idle callback (`requestIdleCallback` with a 500 ms timeout; `setTimeout(0)` if it does not exist), with `aria-busy="true"` on the list while chunks are pending. A new query, filter or sort cancels pending chunks. Each row carries `content-visibility: auto` and `contain-intrinsic-size: auto 64px`; where a browser ignores the property the rows simply lay out normally and the chunking still applies. If chunking itself fails the list renders in one synchronous pass. Rows are keyed by place, so a refresh rewrites text in place and reorders only when the order changed.

### 20.8a Progressive rendering, keyboard and assistive technology
This pins down how the progressive rendering of 20.8 behaves for keyboard and screen-reader users. The rules add no machinery beyond what 20.8 already names.
1. **The match set is computed first and is complete.** A query, filter or sort produces the whole ordered result set at once (a few milliseconds, 20.11); only the **DOM** is built progressively. Every count in the summary line, the headings and the tab labels comes from the full set and is **accurate from the first frame**, whatever has been rendered.
2. **Chunks only append, never reorder.** A chunk adds rows after the last rendered row. No existing row is removed, moved or re-parented while chunks are added, so a focused row is never disturbed and focus is never moved by a chunk. Rows are keyed by place; the order of the set does not change during a render.
3. **Every match is reachable by keyboard.** Each rendered row is in the normal Tab order (its Add button). On the first keyboard interaction inside the results region (`keydown` for Tab, an Arrow, Home or End, or `focusin` on a control in it) any **pending chunks are flushed immediately in one synchronous pass**, appended after the focused row without moving focus. A keyboard user therefore never reaches the end of the rendered rows while more are pending; with row containment this pass costs about 16 ms for 195 rows at 1x (a measurement, not a gate). Pointer and touch users reach later rows by scrolling, which the idle chunks and the same flush on first scroll-driven interaction keep ahead of them.
4. **List semantics for an incomplete DOM.** The list is a native list (`ul`, `li`) with an accessible label. While chunks are pending each rendered `li` carries `aria-setsize` (the full count) and `aria-posinset` (its position), so assistive technology reports "3 of 195" before the rest exist; once complete the attributes may stay.
5. **Loading and completion are visible and exposed, not announced per chunk.** The list has `aria-busy="true"` while chunks are pending and `"false"` when done. A visible, non-live line in the summary says "Showing 80 of 195" and becomes "All 195 shown" on completion (hidden or reduced to the count when complete is acceptable). The **polite region is not used per chunk**: it gets one message per query, after the 700 ms debounce, stating the full count ("195 places"), and nothing on completion unless a render takes longer than 2 seconds, when it adds "All 195 results are now shown" once.
6. **Filtering never silently removes a focused result.** A **visitor-driven** change (typing, choosing a filter or a sort) happens while focus is in the search field, a select or a button outside the list, so it replaces the list freely and cancels pending chunks. A **tick-driven** recomputation (20.5) that would remove or reorder rows is **deferred while focus is inside the list**, with the non-live "Results changed. Update" button. Pressing Add never removes the row (20.8).
7. **A refresh that does not change the set rewrites text in place** and touches no focus. A refresh that does change the set while focus is outside the list replaces only the rows that changed where possible; it may replace the whole list, because focus is not in it.
8. **Fallbacks keep the same behaviour.** Without `requestIdleCallback` the chunks use `setTimeout(0)`; without `content-visibility` rows lay out normally; if neither scheduling call can be used, or a chunk throws, the remaining rows are rendered in one synchronous pass. Counts, order, focus handling and the flush in rule 3 do **not** depend on either feature.
9. **Reduced motion.** Nothing in this section animates; scrolling to a row, if any, is instant.

### 20.9 Empty states and nearest suggestions
When no place matches a **time, period, range or offset** query:
1. The primary area says, in the heading's own words, that no place matches: "No listed city is currently between 5:00 AM and 5:59 AM." (and the same for the other-zones group when it has no match either).
2. **Nothing is silently broadened.** The primary results are empty.
3. An explicit action offers a wider window **only where one exists**: for a specific time, a button "Widen to ±30 minutes" (the next tolerance); for an hour, period, range or offset, no automatic widening is offered.
4. Optionally, a **separately labelled suggestion area** below: "Nearest places (not matches)" with at most 5 places closest in local clock to the requested time (or in offset), each row showing how far it is ("8 minutes after", "1 hour before"). Suggestions use a different heading, a visibly different style, and **never appear in the matches list or its counts**. They are omitted when there is nothing close (more than 3 hours away).
For text, country and region queries the empty state is the existing no-match message with a link to Filters (section 19).

### 20.10 Interaction, feedback and accessibility
- **Confirmation line:** unchanged from section 19: the line under the search field says "Added London, United Kingdom. 5 of 12 cities.", with "Show clock" when the clock is off screen. "Show clock" selects My clocks, scrolls to the card and moves focus to the card's name, only because the visitor asked. A keyboard add never scrolls and never moves focus. The "Just added" mark is shown on the card until the next action.
- **Announcements (one polite region):** the confirmation above; the result summary after a query change (debounced 700 ms): "20 places currently between 8:00 PM and 8:59 PM"; "Showing results in Explore cities"; and the existing board messages. **Never** on a tick, and never the list of rows.
- **Tabs:** as in 20.2. Each tabpanel is labelled by its tab. Switching tabs does not move focus into the panel.
- **Results:** a labelled region ("Results") containing the heading, the summary, the other-zones disclosure and the list; each row's Add button names its place; the sort and filter controls are native selects and buttons with visible labels.
- **Targets and focus:** at least 44 px for every button and select on a phone; the visible 3 px focus ring; no keyboard trap; the "Results changed. Update" button is reachable by Tab and not announced.
- **Contrast** 4.5:1 for text and 3:1 for outlines, with the action green for links and buttons (section 19, item 9); meaning is never carried by colour alone; **reduced motion** disables smooth scrolling and any transition.
- **Phone layout (320, 360, 390 px; checked at 768 px):** the reference line and the search field are on screen without scrolling; example chips wrap; Filters are behind one disclosure; rows are two lines (name and place on the left, time, offset and a 44 px Add on the right) and never a compressed table; nothing is fixed to the screen edges; no horizontal scroll.

### 20.11 Architecture and performance
**Modules.**
| Module | Role | Loaded |
| --- | --- | --- |
| `time-query.js` (new, pure) | the grammar (20.4 to 20.6), the matchers (20.5) and the tolerance windows; no DOM, no clock of its own | with the Explore module |
| `explore.js` (new) | the Explore view: results, sorting, filters, other-zones group, progressive rendering, empty states | **separately**, by dynamic import |
| `index.js` | the shell: reference line, search field, chips, tabs, the existing board, confirmation, the minute timer | initially |
| `clock-engine.js` | existing functions kept; adds the per-zone snapshot, the count helpers and the nearest-place helper | initially |
| `country-zones.js` | existing country data | on demand, as today |

**Loading.** When Explore is the default view, its module is requested at the first paint and the panel shows a skeleton ("Loading the city directory...") until it arrives; when My clocks is the default, it is requested at idle after the warm-up, as the country data is. **Failure:** if the module cannot load, the Explore panel shows "The city directory could not be loaded." with a Retry button; the search field says it is unavailable; **My clocks, the board, the address and the hand-off keep working**; nothing falls back to the removed popup. If the country data cannot load, the existing "listed cities only" degradation applies (section 19).

**Computation.** One snapshot per update: for each **distinct zone** (148 for the 195 cities; 419 for all zones) read `wallAt` once at `T`, then map to cities. A snapshot holds the local minute, the offset in seconds, the day number, the weekday and the day/night phase. There is no per-row timer, no frame loop, and no work while hidden.

**Measured evidence (review prototype, this laptop, Chrome, 390 px viewport; "4x" is Chrome's CPU throttle, a rough proxy and not a device measurement; DOM per row about 10 nodes):**
| Step | 1x | 4x |
| --- | --- | --- |
| Snapshot of 195 cities / 614 places | 3.7 / 7.0 ms | 13 / 47 ms |
| Render 195 rows, no containment | 138 ms | 303 ms |
| Render 195 rows, `content-visibility: auto` | 16 ms | 86 ms |
| Render all 464 places, no containment / contained | 90 / 32 ms | 682 / 233 ms |
| First 40 rows | 2 ms | 32 ms |
| Rewrite all 195 times on a tick | 2.3 ms | 32 ms |
| Time filter, 195 / 614 places, rebuild | 4.8 / 7.2 ms | 42 / 65 ms |
| Sort 195 by local time, rebuild | 11 ms | 71 ms |
| Nine keystrokes, rebuild each time (contained rows) | 44 ms | 270 ms |
| Parser and matcher prototype, gzip, unminified | 1.75 KB | |
These are evidence for the design, **not acceptance thresholds**.

**Budgets (provisional targets, set before the code exists; measured at integration, and exceeding one is reported, not hidden).** Initial script: **no more than 31 KB gzip** (today 29.5 KB; the tab shell and reference line are the only additions). Explore chunk: about 8 KB gzip (an **estimate**) plus about 1.5 KB of CSS (an estimate). Country data unchanged (5.7 KB gzip). Interaction: the first 40 rows of a query visible within one frame budget on this laptop at 1x; a query change on a 195-row list within 50 ms at 1x (measured, 4x recorded, neither a gate). Layout shift: none caused by chunks arriving (rows carry their intrinsic size).

### 20.12 Privacy, trust and wording
Unchanged: browser-local, no request beyond the site's own files, no storage, no account, no geolocation, nothing typed is transmitted. The page states, in the "What This Covers" note, that: the directory is a **selection** of cities, not every city; offsets and local times come from the browser's time-zone data and the device clock; an offset is not a zone identity; Daytime and Night-time are approximate (06:00 to 17:59 by the local clock, not sunrise or sunset); and a time search shows **current** local times only (use the Time Zone Converter for a chosen date and time). No claim of complete coverage, accuracy beyond the data, demand, ranking or SEO effect is made anywhere on the page or in the metadata.

### 20.13 What is preserved and not added
**Not weakened:** the time-zone oracle tests and the America/Asuncion version-divergence safeguards; DST and unusual-offset correctness; the country and city mapping validation; the shareable address contract and its hostile-input handling; the 12-clock board and its comparison reference; the Time Zone Converter hand-off and its contract; the single minute timer and its hidden-page behaviour; the browser-local privacy protections; the abbreviation explanation; the country aliases; the idle warm-up; the optional clock-change line behind its switch.
**Not added:** persistent favorites, accounts, meeting or future-time planning, analog clocks, maps, flags, photographs, a grid layout for the directory, an external API, a backend, a search library, free-text-plus-time queries, abbreviation search, "did you mean" suggestions, a stored view or query.

### 20.14 Shareable address
`cities=` and `ref=` are **unchanged** (section 9): the same tokens, limits, validation, `replaceState` writing and starter-board fallback. **Current-time queries, the Around tolerance, the sort, the filters and the active tab are not stored in the address in v1**: a time query describes the present instant, so a link carrying it would not mean the same thing later. A valid `cities=` only selects the **initial view** (20.2).

### 20.15 Test specification (focused, impact-based; no unrelated full regression)
**Unit, pure (new `time-query` test file and additions):** every row of the grammar table, including each precedence conflict (a city starting like a class, bare `am`, `utc`, `-4` against a range); atoms and normalisation ("8 a.m.", "8am", "noon", unicode minus); AM and PM boundaries at 11:59 and 12:00 and midnight; hour buckets including `12`, `00`, `08`, `20`; the both-ways bare reading and its two groups; specific time windows with each tolerance, both ends included, and the wrap across midnight; ranges, closed ends, `22:00-02:00`, endpoints needing am/pm, equal endpoints, invalid and half-typed input; offsets in every accepted form and every rejected one (`+15`, `+5:10`); offset equality at an instant before and after a DST change; Lord Howe, Kathmandu, Chatham and the Date Line at fixed instants; the counts of 20.7 (listed cities against zone identities against other zones, distinct zones not equal to cities); sorting keys and ties; the nearest-place helper and the 3-hour omission; that the matching never uses a clock of its own (the instant is an argument).
**Unit, hour words:** `noon` is the hour 12:00 to 12:59 and `midnight` is 00:00 to 00:59 as whole queries, equal to `12 pm` and `12 am`; neither takes a tolerance or minutes (`noon:30` invalid); as range endpoints they are 12:00 and 00:00; both stay clear of the name classes.
**Unit, data:** the full directory has 195 rows in the unfiltered result; every listed city is reachable through the unfiltered list and through a time or offset query that matches it; the other-zones group is disjoint from the zones of the listed cities.
**Browser (focused, fake clock, subpath desktop and mobile; root desktop smoke):** ARIA tabs (roles, `aria-selected`, roving `tabindex`, Arrow, Home and End), the default view with and without a valid `cities=`, search switching to Explore without moving focus; the 195 rows present after progressive rendering and `aria-busy` clearing; sorting by each key; region and country filters; the other-zones disclosure (collapsed count, auto-expansion cases); each query class with its heading and a known result at a fixed instant (for example, `8 PM`, bare `8` with two groups, `AM`, `8:30 AM` with the four tolerance controls, a midnight-crossing range, `UTC+05:30`, `utc`); every empty state, with nothing broadened, the widen button, and suggestions kept out of the matches and counts; Add from a row, "On your board", the full-board state; the confirmation, "Show clock" and the keyboard case with no scroll; the minute tick rewriting times, **chunks only appending (a focused row keeps focus and position while chunks arrive), the flush on the first keyboard interaction (Tab to the last row reaches all 195 matches), accurate counts and `aria-busy` while rows are pending, `aria-setsize` and `aria-posinset`, the Add button staying focusable as "On your board" and as "Board full", rendering with idle scheduling and content-visibility removed,** re-filtering when focus is outside the list, and **deferring** with "Results changed. Update" when focus is inside; no announcement on a tick; Enter moving focus to the first Add; Escape clearing; the polite summary after a debounce; the Explore module failing to load (route aborted: the message, Retry, the board and the address still working) and the country data failing (listed cities only); no request other than the site's own; `cities=` and `ref=` round trips and hostile values; phone layouts at 320, 360 and 390 px with no overflow and the reference line and search on screen; reduced motion; contrast and 44 px targets.
**Performance (recorded, not gated):** the measurements of 20.11 repeated on the built page at 1x and 4x, with the first-40-rows and query-change times; `content-visibility` present on rows.
**Visual:** Explore and My clocks at desktop, mobile and tablet, reviewed by eye.
**Existing tests affected:** the browser tests that drive the popup (`#wc-list`, `options`, the region box in Browse) are rewritten for the inline surface (about 15 of the current 39); the board tests, the URL tests, the hand-off, the timer and privacy tests are kept (adjusted for the tab shell); the unit tests for the engine, directory, country data, URL, contract and oracle are expected to pass unchanged. Run first: the world-clock unit files, then `world-clock.spec.js` on desktop and mobile; then the `world-clock` visual baselines and the SEO baseline (the static markup changes); the Time Tools listing and navigation specs only if the catalog description changes. Real Android, Safari/WebKit and assistive technology stay **unverified** until actually tested; `content-visibility` support in Safari is not verified.

### 20.16 Decisions recorded (owner, 2026-10-19; the second table is the approval of the defaults proposed in 20.17)
| # | Decision | Recorded |
| --- | --- | --- |
| 1 | Tabs against stacked sections | **Two tabs.** Explore cities is the default; My clocks when a valid shared `cities=` is opened. |
| 2 | Exact-time search | **±15 minutes, labelled "Around"**, with ±5, ±15, ±30 and ±60 controls. |
| 3 | Bare `8` | **Both 8 AM and 8 PM, in separately labelled groups**; `08` is 08:00 to 08:59. |
| 4 | Grid or list | **A compact list for Explore**; the board keeps its uniform cards. |
| 5 | Search results | **Inline**, replacing the popup, as one accessible search-and-directory experience. |
| 6 | Other IANA zones | **A separate, collapsible group**, shown when relevant to a search or a country filter. |
| 7 | Address | `cities=` and `ref=` kept; **current-time searches not stored in v1**. |
| 8 | Explore module | **Loaded separately**; initial rendering stays fast. |
| refinement | No match | **An honest empty state first**, then optional nearby suggestions; **out-of-interval places never mixed into the matches** (20.9). |

Defaults approved by the owner on 2026-10-19:
| Default | Recorded |
| --- | --- |
| Directory sort | **City A to Z** by default, with Country, Local time and UTC offset available. |
| Example chips | **Six compact, responsive chips** (20.3). |
| `noon` and `midnight` | **Accepted**, as the current local hours 12:00 to 12:59 and 00:00 to 00:59, never an exact minute (20.5). |
| Board full | **Add actions disabled with a clear reason** (kept focusable, 20.8). |
| Catalog and SEO wording | **May be updated in the separately approved implementation phase**, following existing conventions. |
| Explore module | **Loaded separately**, with accessible loading, error and Retry states (20.11). |
| Progressive rendering and keyboard use | **Resolved by 20.8a** before implementation. |

**Implementation of World Clock 2.0 is not authorized by any decision in this section.**

### 20.17 Resolved defaults, remaining risks and unverified items
1. **Resolved (approved):** City A to Z by default; six chips; `noon` and `midnight` as current local hours; Add inert with a reason when the board is full; catalog and SEO wording at implementation; the lazy Explore module with loading, error and Retry states.
2. **Automatic tab activation:** both panels are light; if the Explore module fails the tab still selects and shows the failure message.
4. **Rewriting about 15 browser tests** is the largest test cost; the engine-level tests are kept.
5. **Sparse windows:** an empty hour or window is common at some times of day (the review measured the "8 AM" hour at 0 listed cities at some moments, a median of 7, a maximum of 30), so the empty states are part of the design, not an edge case.
6. **Unverified:** Safari and Android behaviour, assistive technology with the new tabs and results region, `content-visibility` in older browsers, and real-phone performance.
7. **Size:** the Explore chunk and its CSS are estimates until built; the initial-script target of 31 KB is provisional.
3. **Catalog and SEO text** may need a small update (the description mentions a clock board only); approved for the implementation phase only.

### 20.18 Files expected to change at implementation (for scoping; not changed now)
New: `assets/js/tools/world-clock/time-query.js`, `assets/js/tools/world-clock/explore.js`, their unit and browser tests. Changed: `index.js` (shell, tabs, reference line, search field; the popup removed), `clock-engine.js` (snapshot, counts, nearest), `assets/css/tools/world-clock.css`, `tests/browser/world-clock.spec.js`, `tests/browser/visual.spec.js`, the world-clock visual and SEO baselines, this document (implementation notes in a section 21). Not changed: the Time Zone Converter, the oracle and fixtures, the country-data generator, the other tools, the roadmap, GA4 and advertising.
