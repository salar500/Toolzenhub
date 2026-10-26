# Tool Pack 34: Time Tools ecosystem (six new tools, five enhancements, one related-tools pilot)

Status: **IMPLEMENTED LOCALLY (2026-10-26); PREVIEW AND PRODUCTION RELEASE NOT APPROVED.** The owner authorised the whole program for design, build, test, repair and **local commit** only. Nothing is pushed or deployed. No real phone, Safari or Firefox check has been run, and no phone capacity is claimed. The checkpoint (section 12) is the current state; the research behind the program is in `docs/ecosystem-review/time-tools/` (documents 00 to 18).
Tier: **MEDIUM** for the whole pack. None of the tools gives money, tax, legal, medical or safety advice. The engines are pure and are checked against independent reference implementations (section 8).
Evidence labels: **VERIFIED** (observed this session), **DOCUMENTED** (a cited public source), **INFERRED**, **REASONED PROPOSAL**.

## 1. Authorization and scope

- **Authorization (recorded 2026-10-26).** The owner approved the final Time Tools portfolio of **13 tools** and authorised building, testing, repairing and locally committing it as one program of sequential work packages, without routine approvals.
- **The 13 tools.** Seven exist and are preserved, not rebuilt: World Clock, Time Zone Converter, Countdown Timer, Stopwatch, Date Calculator, Date Difference Calculator, Hours & Timesheet Calculator. Six are new (this pack):

| Tool | Id | Route |
| --- | --- | --- |
| International Meeting Planner | `meeting-planner` | `/tools/meeting-planner/` |
| Pomodoro Focus Timer | `pomodoro-timer` | `/tools/pomodoro-timer/` |
| Shift Schedule Planner | `shift-planner` | `/tools/shift-planner/` |
| Interval and Routine Timer | `interval-timer` | `/tools/interval-timer/` |
| Business Days Calculator | `business-days` | `/tools/business-days/` |
| Time Duration Calculator | `time-duration` | `/tools/time-duration/` |

- **Five enhancements** to existing pages (section 5) and **one bounded related-tools pilot** (section 6).
- **Not authorised and unchanged:** any other tool; any article (future opportunities are listed in section 11, none is written); any URL change of an existing tool; a sidebar; a cross-section related list; a framework, backend, database, paid API or account; push, Pages deployment, Hostinger production, remote CI.

## 2. Conventions shared by the new tools

- **Pure engines, thin pages.** Each tool has an engine with no DOM, storage, network or clock of its own (a banned-token scan in the unit tests enforces it), and a page module that reads fields, shows the engine's answer and announces it. Timers take `now` as an input.
- **Time zone facts come from the Time Zone Converter's engine** (`time-zone-engine.js`), not from a second implementation, so there is one rule for offsets, gaps and repeated hours, and no hardcoded offset anywhere.
- **Calendar dates are day numbers** (`date-engine.js` `dayNumber`); weekday index Monday = 0 is `((n + 3) % 7 + 7) % 7`.
- **Durations are integer seconds or minutes.** No floating point; `hours-engine.js` stays free of `toFixed`, `Math.round` and `parseFloat` (an existing test enforces it).
- **Nothing is stored.** No cookie, `localStorage` or IndexedDB. State lives on the page; Pomodoro settings and the Meeting Planner settings can be put in the address, and the Countdown date mode can copy a link, only as the settings (never time left).
- **Dates are blank by default.** A "Use today" button fills a field only when pressed, from the browser's local calendar date.
- **Sound is optional, off by default and never required.** A generated beep, started from a user action; the visual state and the screen-reader announcement carry the same information.
- **Accessibility.** Every control is labelled; errors name the field, set `aria-invalid` and `aria-describedby`, and are announced; results and phase changes use a polite live region (a clear, then a set 50 ms later, so repeats are read); Reset returns focus to the first field; targets are at least 44 px; no horizontal scroll at 320 px.
- **Each page** has an on-page how-to, the exact rules, a worked example computed by the same engine (so the page cannot disagree with it), honest limits and an FAQ.

## 3. The six new tools: frozen rules

### 3.1 Business Days Calculator

- **Modes:** add or subtract *n* business days from a start date; count the business days between two dates.
- **Weekend:** a 7-flag mask, Saturday and Sunday by default, at least one day left a business day.
- **Holidays:** typed by the user (one `YYYY-MM-DD` per line, up to the engine's limit). **No holiday list is shipped**; a holiday on a weekend day changes nothing and the page says so.
- **Add/subtract:** the start is never counted; the result is the *n*th business day after (or before) it; *n* = 0 gives the start date. One business day after a Saturday is the next Monday.
- **Count:** the earlier date is excluded and the later is included; "also count the earlier date" includes it when it is a business day. Reversed dates are swapped and the result says so.
- **Range:** years 1 to 9999; the page names the supported years when exceeded.
- **Result shows:** the answer, calendar days, the weekend/holiday days left out (a list of the first ones), and the convention in a sentence.

### 3.2 Time Duration Calculator

- **Rows:** up to 20, each `+` or `-` with a length: `1:45`, `1:45:30`, `1h 45m`, `90m`, `45s`, or a decimal that is a whole number of seconds (`1.75h`). A decimal that is not whole seconds (`1.3333h`) is **refused**, never silently rounded. Largest row 99,999 h 59 m 59 s.
- **Result:** words, `h:mm:ss`, decimal hours (two places, labelled "(rounded)" when not exact; four places shown beside), total minutes, total seconds; a negative total keeps a minus sign. A day is exactly 24 hours.
- **Boundary:** lengths only; no clock times, dates or zones. Clock-to-clock work with breaks is the Hours & Timesheet Calculator's job.

### 3.3 Shift Schedule Planner

- **Cycle:** 2 to 56 days of `D` (day), `E` (evening), `N` (night) and `O` / `-` (off), typed as `4D 4O`, `DDNNOOO` or `D D N N`.
- **Presets** are written out in full (`4D 4O`, `2D 2O`, `3D 3O`, `5D 2O`, the 14-day `2D 2O 3D 2O 2D 3O`, `2D 2N 4O`); their names are labels, not claims of an official pattern.
- **Inputs:** start date, the day of the cycle that date is, 1 to 52 weeks, and the times of D, E and N (defaults 07:00 to 15:00, 15:00 to 23:00, 23:00 to 07:00). A shift belongs to the date it **starts** on; an end at or before the start means the next morning. Hours are the plain clock difference: no break deduction and no daylight-saving adjustment.
- **Result:** working and off days, hours scheduled, average per week, the longest run on and off (computed around the cycle, not just the window), one month grid per calendar month with a text label for every day (colour is never the only cue), a legend, Copy schedule (runs, not one line per day) and Print.
- **Not done:** pay, overtime, leave, breaks, rest-period or any labour rule.

### 3.4 Pomodoro Focus Timer and 3.5 Interval and Routine Timer (shared cycle engine)

- **One engine** (`timer-cycle/cycle-engine.js`) builds a sequence of phases and tells which phase an elapsed time is in; the page controller (`cycle-controller.js`) owns the steady clock, the five states (idle, running, paused, waiting, done), the buttons for each state, the tab title, announcements and the optional beep.
- **Clock:** `performance.now()`, a steady clock the computer's date cannot move. Elapsed time is derived on every read, so a hidden tab, a throttled timer or a slept laptop shows the right phase when looked at (and the controller re-reads at `visibilitychange` and `pageshow`).
- **Pomodoro:** focus 1 to 120 min (25), short break 1 to 60 (5), long break 1 to 60 (15), long break after 2 to 10 focus periods (4). The cycle repeats until reset. **By default it stops at the end of each phase and waits** ("Start next phase"); automatic advance is an option. A skipped focus period is **not counted** as completed. No claim about productivity or health.
- **Interval:** optional get-ready, up to 8 named stages per round (work or rest, 1 to 3,600 s, zero-length stages dropped), 1 to 99 rounds, optional cool-down, at most 2,000 phases and 10 hours. The rest that would end the last round is dropped. Presets (Tabata-like, HIIT-like, EMOM-like, study blocks) are starting values written out in full, not standards, and no training or safety advice is given.
- **Persistence:** none; a reload starts again. Pomodoro settings may be in the address (`?f=&s=&l=&n=&auto=`).

### 3.6 International Meeting Planner

- **Differentiation gate (rule 1.6): met.** The Time Zone Converter's overlap section takes one preferred-hours range per **zone** for **one day**. The planner takes **people** (2 to 4), each with a name, a zone, a daily window that may **cross midnight**, and the **days of the week** they can meet; it scans **up to 14 days**, **explains a day with no shared time** (whose hours block it and the hours each person does have), and runs a **12-week recurring check** through clock changes. The converter's overlap section is untouched.
- **One exact rule:** a meeting of *L* minutes fits when every 15-minute block of it is inside each person's availability, judged on that person's real clock at that instant (offset by instant). An overnight window belongs to the day it starts on. Equal start and end are refused. Meeting lengths 15, 30, 45, 60, 90, 120. A zone whose offset is not a multiple of 15 minutes on a date is reported as unsupported for that search, not guessed.
- **Recurring check:** the series is fixed on the reference zone's clock; the page reports, per person, the first week the local time moves (by how much, and whether the day changes) and the first week it leaves their hours.
- **Output:** per day, windows with each person's local start range and earliest end; clock changes inside the searched dates; Copy summary and Copy link (settings only, including any names typed, as the page says). Range 1970 to 2100.
- **Zone entry:** a text field with the browser's own zone list (`<datalist>`); a wrong zone is named by person and field. The first person's zone is pre-filled from the browser and editable.

## 4. The engines' independent references

Every engine is compared with a reference written separately in Python (`datetime`, `zoneinfo`, `fractions`, or a per-second expansion) that produced the committed JSON fixtures in `tests/fixtures/*-golden.json`. The references are the oracle; the engines were not tuned to them after the fact beyond fixing real defects.

| Engine | Oracle | Cases |
| --- | --- | --- |
| business days | `business-days-golden.py` (per-day expansion) | 800 |
| time duration | `time-duration-golden.py` (Fraction) | golden set |
| shift planner | `shift-golden.py` (datetime) | golden set |
| meeting planner | `meeting-golden.py` (zoneinfo) | 51 |
| clock changes (DST) | `dst-golden.py` (zoneinfo) | 75 zone cases, 30 difference cases |
| ISO week | `iso-week-golden.py` (`isocalendar`) | about 3,700 dates |
| countdown target | `countdown-target-golden.py` (zoneinfo) | golden set |
| timer cycle | fake clock + closed-form expectations | unit tests |

## 5. The five enhancements (existing pages, no URL change)

| | Page | Change | Default |
| --- | --- | --- | --- |
| A | Time Zone Converter | "Clock Changes Around This Time": per zone, the next and latest change within 200 days (date, what the clock does, offsets) and when the gap between two places moves; no hardcoded offset. A link to the Meeting Planner in the text. The converter's meeting-overlap section is untouched. | Shown with a result |
| B | Countdown Timer | A mode switch: "Count down a length of time" (unchanged) and "Count down to a date" (date, time, zone, optional event name, a repeated hour asks which, a skipped hour is refused, a past time is refused, a link restores it, a reached state). | Length mode |
| C | Date Calculator | ISO week panel under the result (week, week-year, weekday, day of year, weeks in the ISO year) and a short explanation. Not a separate page. | Shown with a result |
| D | Date Difference | "Use today" beside each date, from the browser's local calendar date, filled only on a click. | Blank dates |
| E | Hours & Timesheet | Optional rounding (5, 10, 15, 30 minutes; each shift or the total; halfway up; integer arithmetic) with the exact total always visible, and Copy summary (the exact total is always in it). | **Exact** |

## 6. The related-tools pilot (rulebook 4.8, bounded)

- **Mechanism:** the existing related-tools component, extended so a tool in a section **without categories** renders the section's own related list (heading "Related Time Tools", a "View all" link to the section page, the same card markup). Curated `relatedTools` by id; `autoRelated: false` on the six new tools so no older list changes by accident.
- **Scope:** Time Tools only; same-section links only; no sidebar; no cross-section list (the component filters by section); no URL change.
- **Relations built:**

| Page | Related (in order) |
| --- | --- |
| World Clock | Time Zone Converter, International Meeting Planner |
| Time Zone Converter | Unix Timestamp Converter *(already curated; hidden because it is another section)*, International Meeting Planner |
| International Meeting Planner | Time Zone Converter, World Clock |
| Pomodoro Focus Timer | Interval and Routine Timer, Countdown Timer |
| Interval and Routine Timer | Pomodoro Focus Timer, Countdown Timer |
| Date Calculator | Business Days Calculator, then the existing automatic Time Tools |
| Business Days Calculator | Date Calculator, Date Difference Calculator |
| Time Duration Calculator | Hours & Timesheet Calculator, Date Difference Calculator |
| Hours & Timesheet Calculator | Shift Schedule Planner |
| Shift Schedule Planner | Hours & Timesheet Calculator, Date Calculator |

- **Pages that keep both flags `false`:** Stopwatch, Countdown Timer, Date Difference, and every Developer, Image and PDF tool.

## 7. Integration ledger (what each new tool touched)

Catalog entry (`assets/js/data/tools.js`), `src/_data/toolStyles.json` (shared `assets/css/tools/time-tools.css`; also added to Date Difference and Countdown Timer for the shared inline buttons), Growth ledger `scripts/growth-manifest/identity-ledger.json` (sorted by id), regenerated `tests/inventory/url-inventory.json`, the pinned unit tests (catalog, sections, relationships, search, tool-capabilities), and the DOM, SEO, links and visual baselines. Search aliases do not take the lead on "timer", "focus timer", "study timer" (Countdown Timer), "time zone converter", "date calculator" or "date difference" (checked in both directions in the browser spec and by the search unit test).

## 8. Tests

- **Unit (pure):** `business-days`, `time-duration`, `shift-planner`, `timer-cycle`, `meeting-planner`, `dst-info`, `iso-week`, `countdown-target`, `hours-rounding`, each against its oracle plus edge cases and banned-token scans.
- **Browser (subpath desktop and mobile, one worker):** `time-tools-new.spec.js` (six pages), `time-tools-enhancements.spec.js` (five enhancements and the pilot); the two timers run on Playwright's fake clock, with `fastForward` for background-tab behaviour; the clipboard is stubbed because the test origin is not a secure context.
- **Existing specs re-run for the touched pages:** Countdown Timer, Date Calculator, Date Difference, Hours & Timesheet, Time Zone Converter, World Clock.

## 9. Open-source provenance

No code or data was copied from a third-party project. Algorithms are standard (ISO 8601 week rule; the cycle arithmetic is original); the oracles use the Python standard library. Time zone data is the browser's own (`Intl`), the same source as the existing converter.

## 10. Honest limits

- Time zone and clock-change data are the browser's; an old browser may have older rules.
- Real phones, Safari, Firefox and screen readers were **not** tested. Headless Chrome with a fake clock is the only environment used.
- The Meeting Planner does not know holidays or anyone's real calendar. The Business Days Calculator ships no holiday list. The Shift Planner knows no labour law.
- A page cannot run when the tab is closed or the computer sleeps; the timers say so on the page.

## 11. Future article opportunities (none written)

Pomodoro technique variants and how to choose lengths; how daylight saving shifts a weekly meeting; business days vs calendar days in contracts and shipping; counting ISO weeks; running a rotating shift pattern (4-on-4-off and 2-2-3). Each would need its own evidence and approval; none is committed.

## 12. Checkpoint

| | |
| --- | --- |
| Wave 0 baseline | done (research package `3c279eb`) |
| Waves 1 to 3 (engines, then the six pages) | engines `efe174a`, pages and catalog `e9aa510` |
| Wave 4 (five enhancements) | built; browser specs added |
| Wave 5 (integration) | catalog, styles, ledger, inventory, pinned tests done; baselines see the final report |
| Wave 6 (QA) | Done locally (2026-10-26). Older specs updated for the intended changes (related section, 13 tools, "focus timer" now leads with Pomodoro by name); DOM, SEO, links and visual baselines regenerated after inspecting the diffs (the Countdown mode switch was restyled first). Desktop and mobile browser specs pass except the two existing failures below |
| Existing failures, not caused by this work | World Clock "rows arriving later do not shift" (desktop) and the World Clock add / 320-390 px row / Clear search / chunked-rows tests (mobile): the first and the "Add puts the city" test fail identically on the commit before this program (`8ece03a`); the other mobile row tests were not re-checked there. Visual baselines of SIP, FD, CAGR, calculators and tools pages also differ at that commit's header (an existing change, not accepted here) |
| Next action | a controlled GitHub Pages preview release, then the owner's combined Android acceptance |
