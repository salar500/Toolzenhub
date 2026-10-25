# 08. Product requirements (implementation-ready, not approved)

Six new tools and five enhancements. Each spec makes the routine decisions so the next session does not have to. **Label: all behaviour below is a REASONED PROPOSAL** except where marked VERIFIED (read in the repository or a source). Letters follow the owner's A to AD checklist. All tools: section `time-tools`, no category, route `/tools/<id>/`, vanilla ES modules, a pure engine plus a thin UI, no network, no storage unless stated, `showRelated* = false` until the navigation pilot changes it. Common conventions: dates are calendar dates (`yyyy-mm-dd` in native `<input type="date">`), years 1970 to 2100 where a time zone is involved (the converter engine's range, VERIFIED) and 1 to 9999 for pure calendar arithmetic (the date engines' range, VERIFIED).

---

## 1. Business Days Calculator (P0)

| Item | Decision |
|---|---|
| A Identity | Name "Business Days Calculator"; id `business-days`; route `/tools/business-days/` |
| B/C User problem and job | "What date is 10 business days from today?" and "How many working days between two dates?" for deadlines, notice periods, delivery estimates |
| D Intended user | Freelancers, small businesses, HR and operations staff, students |
| E Competitors | dateandtime.tools Business Days (optional holidays); timeanddate Business Date and Business Date to Date (snippet); free pages that disagree on holidays and start-date counting (`02`, `03`) |
| F Differentiation | One stated, tested convention; configurable weekend (including Friday-Saturday); user-entered holidays shown in the result with what was skipped; no bundled holiday list that can go stale; no account |
| G Stories | Add 15 business days to a start date; count business days between two dates; count with a custom holiday list; use a Friday-Saturday weekend |
| H Inputs | Mode (radio: "Add or subtract business days" / "Count business days between two dates"); Start date; Number of business days (integer) or End date; Weekend days (seven checkboxes); Holidays (multi-line text, one `yyyy-mm-dd` per line); "Also count the start date" (count mode only) |
| I Defaults | Mode Add; dates blank (never filled with today; a "Use today" button beside each date sets it explicitly); weekend Saturday and Sunday; holidays empty |
| J Accepted values | Amount: whole number 0 to 99999, sign set by Add/Subtract; at least one non-weekend day required; up to 500 holiday lines; dates within 1 to 9999 |
| K Validation | Field-level messages; a malformed holiday line is listed by line number and blocks the result until it is fixed (it is never silently ignored); duplicates and holidays on weekend days are accepted and reported as "not counted" |
| L Outputs | Add mode: result date with weekday, calendar days elapsed, weekend days skipped, holidays skipped. Count mode: business days (with the stated convention), calendar days, weekend days, holidays that fell on business days. A plain-language sentence states the convention |
| M/N Actions | Calculate is automatic once valid (instant arithmetic); secondary: Copy result text, Swap start and end |
| O Reset | Clears all fields to defaults and moves focus to the first field |
| P Errors | Missing date, invalid date, amount not a whole number, all seven days marked weekend, holiday line malformed, result beyond year 9999 |
| Q Edge cases | Start on a weekend or holiday; amount 0 (result is the start date, with a note when it is not a business day); month and year ends; leap day; very large amounts; end before start in count mode (negative count with a note, or swapped explicitly) |
| R Algorithm | Convention (the one the tool states): **moving N business days from a date lands on the Nth business day after it** (Friday plus 1 is Monday; Saturday plus 1 is Monday). Counting between dates counts business days **after the start date up to and including the end date**, so Monday to Tuesday is 1; "Also count the start date" adds 1 when the start is itself a business day. Implemented by stepping day numbers (the date engine's `dayNumber` and `dateFromDayNumber`, VERIFIED) with a weekend mask and a holiday Set; O(days), which is under a few million steps for the largest input |
| S Date/time conventions | Dates only; no time zone, no time of day; weekdays from the existing `weekdayOf` (VERIFIED) |
| T Accessibility | Labelled controls, radio group with legend, weekend checkboxes in a labelled group, result in an `aria-live="polite"` region, errors tied with `aria-describedby`, visible focus, no colour-only meaning |
| U Mobile | Single column; native date pickers; holidays textarea with 16px font to prevent zoom; nothing wider than 320px |
| V Sharing | Copy text (P0). Shareable URL state is P1 and excludes nothing sensitive (dates only) |
| W Privacy | Calculated in the browser; nothing stored or sent; the text says only that |
| X Performance | Instant; guard the loop with the amount limit |
| Y Aliases | business days calculator, working days calculator, workdays between dates, add business days, business day counter, deadline calculator |
| Z Related | Date Calculator and Date Difference (same section) in body text; guide "Business days vs calendar days" |
| AA Acceptance | Matches the independent oracle on at least 500 generated cases and the fixed edge table (below) |
| AB Browser verification | One browser spec: add, subtract, count, weekend change, holidays, errors, reset, keyboard, three phone widths |
| AC Risks | Users expect public holidays to be pre-filled (stated limit); conventions differ between sites (stated convention) |
| AD Non-goals | Public holiday data or APIs, observed-holiday rules, half days, time zones, hours, recurring rules |

Oracle: a Python script using `datetime` day-by-day loops (no shared code), producing a committed JSON golden like the existing `*-golden` fixtures.

---

## 2. Meeting Planner (P0, conditional on the person-based model)

| Item | Decision |
|---|---|
| A Identity | Name "Meeting Planner"; id `meeting-planner`; route `/tools/meeting-planner/`. The owner-authorized name was "International Meeting Planner"; the spec uses the shorter name only if the owner accepts it (decision for the build prompt; keep "International Meeting Planner" if not) |
| B/C Problem and job | "When can all of these people meet?" with individual hours, days and zones |
| D User | International teams, freelancers, event and class organisers |
| E Competitors | WorldTimeBuddy, Every Time Zone, dateandtime.tools (World Meeting Planner, Global Working Hours), timeanddate Meeting Planner (snippet) |
| F Differentiation | People, not zones; overnight availability; a date range scan; a per-person fit table; a recurring-series DST warning; no account; shareable URL; reuses the converter's exact-instant engine and independent reference. It **must not** be shipped as a second copy of the converter's overlap section (rulebook 12 gate) |
| G Stories | Three people in three zones with different working days; one person works nights; scan the next 5 days; check whether a weekly 9am series will shift for anyone in the next 12 weeks |
| H Inputs | Participants (2 to 12): Name (optional), Time zone (combobox reused from the converter), Available hours start and end (overnight allowed: end earlier than start), Available days (Mon to Sun, default Mon to Fri). Meeting length (15, 30, 45, 60, 90, 120 minutes). First date and Number of days to scan (1 to 14, default 5). Reference zone for results (default: first participant) |
| I Defaults | Two participants (the visitor's zone detected from the browser, one other empty); hours 09:00 to 17:00; Mon to Fri; 30 minutes; first date blank; days 5 |
| J/K Accepted and validation | Zone must be valid IANA; hours on the 15-minute grid; start must differ from end; at least one day; date within 1970 to 2100; names up to 40 characters |
| L Outputs | Per scanned day: windows where everyone is available, "Start between A and B" in the reference zone with each participant's local time and a status line; a per-person fit table for the chosen slot; "No time works on this day" with the blocking person(s) named by constraint (hours, day, or both), **no score and no invented "best time"** (matches the converter's rule) |
| M/N Actions | Find times (automatic once valid); Copy meeting summary (text with every local time); Copy link; optional Download .ics for the chosen slot (P1); Remove participant; Swap reference zone |
| O Reset | Back to two participants and defaults |
| P Errors | Invalid zone; unsupported zone in the browser (reuse `UNSUPPORTED_ZONE` message, VERIFIED); no overlap; date range too long |
| Q Edge cases | Half-hour and 45-minute zones; date line; DST gaps and overlaps inside the meeting; overnight availability crossing midnight; a participant with a single available day; leap day |
| R Algorithm | Reuse the converter's fit rule (VERIFIED, spec 19): a meeting from instant t for L minutes fits a participant when every minute lies inside that participant's availability, evaluated on the participant's real local clock from `offsetSecondsAt`/`wallAt`. Availability on a local day D is `[start, end)` on D, or when `end <= start` it spans from `start` on D to `end` on D+1 and counts only if D is an available day. Candidate starts are the 15-minute grid in the reference zone over the scanned dates. Recurring warning: for the chosen slot, repeat weekly for 12 weeks and flag any week where a participant's local start time or date differs from week 0 |
| S Conventions | Instants first, never fixed offsets; dates and times shown with zone abbreviation and UTC offset; 12/24 hour toggle as in the converter |
| T Accessibility | Participant rows are a labelled list with named Remove buttons; each day's windows are a list; text status ("everyone available", "outside hours") never relies on colour; combobox pattern as in the converter |
| U Mobile | Participants stack as cards; windows are cards; no horizontal scroll at 320 to 390px |
| V Sharing | Copy summary; URL state `?p=Name|Zone|start|end|days;...&len=60&d=2026-11-03&n=5` (names optional); the page warns that a copied link contains the names typed |
| W Privacy | Everything local; names exist only in the page and in a link the user chooses to copy |
| X Performance | 12 participants times 14 days times about 96 starts is about 16,000 fit checks; each is a few offset lookups; target under 100 ms measured on the laptop in the build phase |
| Y Aliases | meeting planner, international meeting planner, meeting time planner, find meeting time across time zones, team availability |
| Z Related | Time Zone Converter, World Clock (same section) |
| AA Acceptance | Windows equal the independent Python reference (`zoneinfo`) on a fixture table including DST weeks and half-hour zones; no regression in the converter's tests |
| AB Browser | Two to four participants flow, overnight case, no-overlap explanation, recurring warning, copy, three widths, keyboard |
| AC Risks | Duplicating the converter (the gate); engine reuse coupling; name privacy in links |
| AD Non-goals | Calendar integrations, invites, availability by sign-in, "best time" scoring, accounts, persistence |

---

## 3. Pomodoro Focus Timer (P1; owner-authorized; shares the cycle engine)

| Item | Decision |
|---|---|
| A Identity | "Pomodoro Focus Timer"; id `pomodoro-timer`; route `/tools/pomodoro-timer/` |
| B/C/D | Alternate focus and break periods; students, writers, developers |
| E Competitors | minutebell, DoItBerry, Smart Stopwatch, Pomofocus (tasks and reports; not copied) |
| F Differentiation | Honest and small: tested timestamp accuracy including a throttled background tab (inherits the Countdown engine's approach, VERIFIED), settings in the URL so a bookmark restores them without storage, clear phase announcements for screen readers, no account, no ads. It does **not** claim to be better than established Pomodoro apps |
| G Stories | Run 25/5 cycles with a long break every 4; change lengths; skip a break; see sessions completed today |
| H Inputs | Focus minutes, Short break, Long break, Long break after N focus sessions, Start next phase automatically (checkbox), Sound at phase end (checkbox) |
| I Defaults | 25, 5, 15, 4; auto-start off; sound off |
| J/K Accepted | Focus 1 to 120, short 1 to 60, long 1 to 60, after 2 to 10; whole minutes |
| L Outputs | Phase name, remaining time, session count in this visit, next phase preview, tab title "24:32 Focus" |
| M/N/O Actions | Start, Pause, Resume, Skip phase, Reset (Reset also resets the count). No stored state |
| P/Q Errors and edges | Invalid settings block Start; phase boundary while the tab is hidden (reconcile on return and announce once); computer sleep (stated limitation, as in Stopwatch, VERIFIED) |
| R Algorithm | `cycle-engine`: a pure sequence generator and `phaseAt(sequence, elapsedMs)` over monotonic timestamps; Pomodoro builds the sequence focus, short, ..., long |
| T Accessibility | Timer `role="timer"` with `aria-live="off"`; a polite status region announces phase changes only (pattern from the Stopwatch, VERIFIED); sound and visual cues both optional |
| U Mobile | Large time display, one primary button, no layout shift on phase change |
| V Sharing | URL carries settings only (`?f=25&s=5&l=15&n=4`); never elapsed state |
| W Privacy | No storage, no network |
| Y Aliases | pomodoro timer, pomodoro, focus timer **(not claimed: Countdown leads it)**, study timer **(not claimed)**, work break timer |
| Z Related | Countdown Timer, Interval Timer, Stopwatch |
| AA Acceptance | Engine matches a fake clock across 4 full cycles with pause/resume and a 10-minute background gap; all phase boundaries exact |
| AC Risks | Weak differentiation; alias collision with Countdown |
| AD Non-goals | Task lists, reports, accounts, integrations, ambient sound, saved history (needs a rulebook 7.7 reason) |

---

## 4. Interval and Routine Timer (P1; shares the cycle engine)

| Item | Decision |
|---|---|
| A Identity | "Interval Timer"; id `interval-timer`; route `/tools/interval-timer/` (title may add "and Routine" if stages ship) |
| B/C/D | Repeat work and rest periods or a named routine; workouts, study blocks, classroom stations |
| E Competitors | minutebell Loop and Sequence timers, DoItBerry Interval, Clock7 (Tabata, HIIT, EMOM) |
| F Differentiation | Same accuracy and URL-settings approach as Pomodoro; routine stages with names; a total-time line before starting. Moderate differentiation only |
| H Inputs | Preset (Tabata 20 s work, 10 s rest, 8 rounds; EMOM 60 s, N rounds; Custom); Warm-up seconds (optional); Work; Rest; Rounds 1 to 99; Cool-down (optional); optional named stages list (up to 20, each label and seconds) repeated N times |
| I Defaults | Tabata preset |
| J/K | Seconds 1 to 3600 per stage; total at most 10 hours; labels up to 30 characters |
| L | Current stage, remaining time, round x of y, total remaining, next stage |
| M/N/O | Start, Pause, Resume, Skip stage, Reset; sound optional (off) |
| R | Sequence generator in `cycle-engine`, same `phaseAt` |
| Q | Rest of zero; one round; stage list with one stage; hidden-tab reconcile |
| T/U/V/W | As Pomodoro; URL state encodes stages compactly |
| Y Aliases | interval timer, hiit timer, tabata timer, emom timer, workout timer, round timer |
| Z Related | Pomodoro, Countdown, Stopwatch |
| AA | Sequence totals and boundaries exact against a fake clock |
| AD Non-goals | Audio coaching, music, workout libraries, accounts, saved programs |

---

## 5. Time Duration Calculator (P1)

| Item | Decision |
|---|---|
| A Identity | "Time Duration Calculator"; id `time-duration`; route `/tools/time-duration/` |
| B/C | Add and subtract lengths of time (1:45, 2h 30m, 90m) to get a total |
| E Competitors | Inch Calculator, DQYDJ, Helping With Math (snippets) |
| F Differentiation | Multi-row, mixed formats, results in days/hours/minutes/seconds, decimal hours and total minutes at once; a clear sign for negatives; no rounding surprises (integer seconds) |
| H Inputs | Rows (up to 20): operator (+ or −), duration text |
| I/J | One empty row; formats `h:mm`, `h:mm:ss`, `1h 30m 15s`, `90m`, `45s`; integer parts, up to 99,999 hours |
| K Validation | Each row shows what it could not read; ignored while empty |
| L Outputs | Total as `d h m s`, `h:mm:ss`, decimal hours (2 places and the exact fraction), total minutes, total seconds |
| M/N/O | Add row, Remove row (named), Copy result, Reset |
| R | Parse to integer seconds; sum with signs; format with integer division; no floating point in the total |
| Q | Negative totals; all rows empty; over a day; leading zeros; mixed units in one row |
| Y Aliases | time duration calculator, time calculator, add hours and minutes, add time, subtract time |
| Z Related | Hours & Timesheet, Date Difference |
| AA | Golden table plus a Python `timedelta` oracle |
| AD Non-goals | Dates, time zones, pay, shifts |

---

## 6. Shift Schedule Planner (P1; owner-authorized; use case to confirm in the build prompt)

| Item | Decision |
|---|---|
| A Identity | "Shift Schedule Planner"; id `shift-planner`; route `/tools/shift-planner/` |
| B/C/D | Lay out a repeating rotation (for example 4 on, 4 off) on a calendar for a person or one crew |
| E Competitors | ShiftScheduleUp, TeamBridge 4-on-4-off, TimeTrex 2-2-3 (snippets); free, no signup, print and calendar export |
| F Differentiation | Cycle definition shown in words and as a strip; the full cycle length stated (a 2-2-3 cycle is 14 days; covering 24/7 needs four crews, as a source notes); hours per week; longest run of work days; print layout; no account |
| H Inputs | Pattern (presets 4 on 4 off, 2-2-3, plus Custom cycle builder of Day/Night/Off days); Cycle start date; Position in the cycle on the start date; Day shift start and end; Night shift start and end (overnight allowed); Weeks to show (4 to 52, default 8) |
| K | Custom cycle 2 to 56 days; times on the 15-minute grid; presets are accepted only after their definitions are confirmed against two published sources |
| L Outputs | Month grids and a list of shifts; summary: shifts counted, average hours per week, longest work run, next 7 shifts |
| M/N/O | Print (CSS print layout), Copy as text; Reset. CSV or calendar export is P2 |
| R | Pure `shift-engine`: pattern as a day-code array; day n is `pattern[(offset + n) mod length]` over day numbers from the date engine |
| Q | Pattern of length 1; shift ending after midnight; month boundaries; leap day; DST ignored (dates, not instants), stated |
| Y Aliases | shift schedule planner, shift rotation calendar, 4 on 4 off calendar, rotating shift schedule |
| Z Related | Hours & Timesheet Calculator, Date Calculator |
| AA | Calendar equals a Python oracle for the presets and 50 random custom cycles |
| AC Risks | Unconfirmed demand; preset definitions must be verified; legal or labour-law claims are forbidden |
| AD Non-goals | Employee rosters, staffing coverage optimisation, pay, overtime, labour-law compliance, accounts |

---

## 7. Enhancements to existing tools (each a small, separate approval)

| Tool | Change | Acceptance |
|---|---|---|
| Countdown Timer | Mode "to a date and time" (local or a chosen zone), live days/hours/minutes/seconds, URL state; large full-screen display option | Existing tests untouched; new engine function tested against a fake clock |
| Date Calculator | Panel: ISO week number, day of year, weekday of the result | Oracle: Python `date.isocalendar()` over a year boundary table (week 52/53 and week 1) |
| Date Difference | "Use today" buttons that fill the field only on click | Determinism preserved: blank by default |
| Hours & Timesheet | Copy summary; optional rounding (nearest 5, 10, 15 minutes) as an explicit, stated choice (both already on spec 23's deferred list) | Rounding never changes the unrounded total shown |
| Time Zone Converter | Note about DST mismatch weeks; same-section link to the planner once built | No change to engine or URL contract |
