# Tool Pack 19: Time Zone Converter (with Meeting overlap)

Status: built and verified      Base commit: e730f79
Id and slug: `time-zone-converter` (route `/tools/time-zone-converter/`)
Section: **Time Tools** (`time-tools`), flat, no subcategory. Previous pack: `18-text-diff.md`.

## Product check (done before building)

- **Real pain.** "It is 3 pm here: what time is that there?" and, harder, "when can all of us meet?" Remote teams, interviews, client calls, family abroad, online events, travel, developers coordinating a deploy. It recurs weekly for the people who have it.
- **Why not just ask an AI.** A model does this arithmetic from memory, and daylight saving is exactly where that goes wrong: it will confidently convert across a spring-forward date using the wrong offset, or answer for a local time that does not exist. A deterministic tool uses the browser's own IANA data for the chosen date, answers instantly, can be nudged a minute at a time, and shows a time that does not exist or happens twice instead of guessing. The text is also private: meeting plans stay in the browser.
- **Browser-native advantage.** `Intl.DateTimeFormat` carries the tz database; nothing to download, no API, no geolocation, no account.
- **Differentiation.** The crowded category is "world clock" pages. What this does differently: the date you pick decides the offsets; a nonexistent or repeated local time is explained and the user chooses; meeting overlap uses exact instants and each person's own preferred hours (no assumed global 9 to 5) and a meeting length; the result is a short readable list, not a wall of clocks.
- **Maintenance.** Low: no data of our own. The tz data updates with browsers. The one fragile point is the zone list, which differs by browser (see "Zone list").
- **Search intent.** "time zone converter", "timezone converter", "meeting time converter", "convert time zones", "time difference between countries".
- **Verdict: BUILD,** narrowed as below. Not built: a world-clock dashboard, a calendar scheduler, invites, a continuously ticking clock, city or country databases, AI.

## Hierarchy, route, name

Home → All Tools → Time Tools → Time Zone Converter. Route `/tools/time-zone-converter/` (the section's `tools` path prefix). Public name **Time Zone Converter**; the meeting feature is a section of the page, not part of the name. SEO title "Time Zone Converter and Meeting Time Planner". No subcategory.

## Semantics (frozen)

**Instant.** An integer count of milliseconds since the epoch (Number). Minute precision is all the product needs; nothing finer is produced or accepted. Seconds are not shown.

**Source.** A calendar date, a time (HH:MM) and a source zone mean "this wall-clock reading in that zone", never "in the browser's zone". The browser zone is only the default for the zone, and the clock behind the default date and time.

**Resolution of a wall time in a zone** gives exactly one of:
- one instant (normal);
- two instants (the clocks went back: the reading happens twice). Both are shown, each with its offset ("Earlier: 01:30 UTC−04:00", "Later: 01:30 UTC−05:00"), and the user must choose. Nothing is converted until they do;
- no instant (the clocks went forward over that reading). The page says "This local time does not exist in this time zone because of a daylight-saving transition", names what the clocks did ("went from 01:59 to 03:00 on 2026-03-08") and the nearest valid times before and after, and converts nothing. It never moves the time silently.

Candidate instants are found without hand-written offsets: sample the zone's offset at several points around the reading, accept an offset only if the zone really has that offset at the implied instant. This finds both of a repeated hour and none for a skipped one, including 30-minute shifts (Australia/Lord_Howe).

**Destinations.** An instant shown in a zone is always unambiguous: date, time, weekday, and the offset in force at that instant ("UTC+05:30", "UTC−04:00", "UTC+00:00"). The offset is never a property of the zone name. The IANA identifier is the primary identity; a short abbreviation from the browser may appear as secondary text only.

**Day relation** compares local calendar dates with the source's: "Same day", "Next day", "Previous day", and for larger gaps "2 days later", "2 days earlier" (it is not capped at one day, so Kiritimati against Pago Pago works). Words, never colour alone.

**Changing zones.**
- Changing the **source** zone keeps the typed date and time and re-reads them in the new zone ("10:00 in the zone I now chose"). A previous overlap choice is forgotten.
- Changing or adding a **destination** keeps the resolved instant; only its display changes.
- **Swap** exchanges the source with the first destination and keeps the instant: the new source date and time are the former destination's local reading (with the overlap choice set so that it names the same instant).
- **Use current time** sets date and time to the current minute in the source zone. There is no ticking clock: a converter is about a chosen instant, and per-second updates would be noise (and a screen-reader hazard).

**Defaults.** Source zone = the browser's resolved zone (shown as "Your time zone: Asia/Kolkata", never "you are in Kolkata"; no geolocation, no IP lookup). Date and time = now in that zone (the system clock expressed in the browser zone, not read as UTC; tested). No destination until chosen, with quick-add buttons for common zones.

**Limit.** At most 6 zones in all: the source and up to 5 others. No duplicates (the source counts, so adding the source zone again is refused with a message). Removing a destination updates the board and the overlap and touches nothing else.

## Zone list and picker

The list is `Intl.supportedValuesOf("timeZone")` where it exists, plus "UTC", plus a small fixed list of preferred modern spellings that browsers often still list under the old name (Asia/Kolkata for Asia/Calcutta, Asia/Kathmandu, Asia/Ho_Chi_Minh, Europe/Kyiv, Asia/Yangon), each added only if the browser accepts it. Where the API is missing, a short built-in list of common zones is used (only those the browser accepts). Every chosen identifier is validated by constructing an `Intl.DateTimeFormat`; an unsupported one gives "This time zone is not supported by this browser" and nothing crashes.

The picker is an accessible combobox (a text box with a listbox of at most 8 matches; arrows, Enter and Escape). Search lowercases and treats `_`, `/` and `-` as spaces, requires every typed word to appear, and ranks by exact city, then starts-with, then contains; a legacy spelling also matches its modern name (Calcutta finds Asia/Kolkata). It searches IANA names only. There is no city or country database, so "India" finds nothing by itself; the hint says to search by city as written in the zone name, and quick-add buttons cover the common zones. This is a deliberate limit, not a geopolitical statement.

## Result and board

The first destination is the primary result: the converted time large, with weekday, date, zone, offset and the day relation in words. Further destinations are rows on a board (zone, time, date and weekday, offset, day relation), each with a named remove button. A 12-hour or 24-hour display choice (a checkbox; the default follows the browser's hour cycle) changes only how times are printed; every printed time is unambiguous (AM/PM, or 24-hour).

## Meeting overlap (secondary)

A collapsed-by-default section, "Find a time that works for everyone", on the same date as the converter. It needs at least two zones.

- **Preferred hours** (not "working hours", and not assumed universal): one range per zone, default 09:00 to 17:00, editable, in 15-minute steps. A range must start before it ends within one local day. **Overnight ranges (22:00 to 02:00) are not supported in v1** and the page says so; the control step keeps the rule simple, and the hours always mean the local clock.
- **Meeting length:** 15, 30, 45, 60 or 90 minutes (default 30). A window is shown only if a meeting of that length fits inside everyone's hours.
- **The day:** the selected date in the source zone, from its local midnight to the next. A start time must fall inside that day. Previous day and Next day buttons move the shared date.
- **Grid:** start times are every 15 minutes on the source zone's local clock (so a half-hour or 45-minute zone never makes the grid uneven). All offsets in use are whole multiples of 15 minutes.
- **Fit rule** (exact, from instants, never from fixed offsets): a meeting starting at instant t for L minutes fits a participant when every minute from t to t+L has that participant's local time of day inside their range. When no zone offset changes during the meeting this reduces to the local start and end falling inside the range; when one does change (a DST change inside the meeting) each minute is checked.
- **DST** is therefore handled by date: the same preferred hours give a different overlap before and after a transition, and a range that contains a skipped or repeated hour is evaluated on the real clock.
- **Result:** common available times as windows: consecutive valid start times merged, each shown as "Start between A and B" with the span "earliest start to latest start plus the length", in every zone's local time (day relation shown when a zone is on another date), at most 6 windows. The copy action offers the earliest window's start in every zone. No score, no "best time"; the heading says "Times inside everyone's preferred hours".
- **No overlap:** "No time falls inside everyone's preferred hours on this date." followed by each zone's preferred hours expressed in the source zone's time on that date, so the user can see why. No "closest compromise" (no defined metric, so none is invented).
- Single zone, or an invalid range, shows what to fix instead of a result.

## Copy and share

- **Copy times:** plain text. One line of header with the date in the source zone, then one line per zone: `3:00 PM  Asia/Kolkata  UTC+05:30` style lines in the chosen clock format, with "(next day)" words where the date differs. When the overlap section is open and has a window, "Copy meeting times" copies the earliest start instead.
- **Copy link and URL state: implemented.** Unlike a pasted text, the state is not private content: `?d=2026-10-13&t=15:00&from=Asia/Kolkata&to=Europe/London,America/New_York`, plus `c=earlier|later` when an overlap was chosen. The page writes it with `history.replaceState` (no history entries, canonical untouched, no sitemap entries). On load every value is validated (date pattern and real calendar day, time pattern, every zone must be accepted by the browser, at most 5 destinations, duplicates dropped); anything invalid is ignored and the defaults are used, and values are only ever placed with `textContent` or as an input value. No names, titles, notes or hours are encoded. Hours and duration are not in the URL.
- **Persistence: none.** No localStorage, sessionStorage or cookies.

## Privacy and security

No request, geolocation, IP lookup, account or storage. Zone identifiers and query values are untrusted: validated against the browser, never put in `innerHTML`.

## Accessibility

Visible labels on every control (date, time, source zone, each destination picker, hours, length); the zone picker follows the ARIA combobox pattern; the DST gap is an alert-style message inside the result, the overlap choice a radio group with a legend; a settled result is announced once, politely, after a short pause (never a clock, never per keystroke); remove buttons are named ("Remove Europe/London"); day relation and the lower/overlap states are words; visible 3 px focus; 44 px touch targets on phones; 16 px inputs.

## Mobile and desktop

Controls stack; the board is a list of rows (not a table) that wraps; overlap windows are cards that stack; nothing widens the page at 320, 360 and 390 px. From 900 px the date, time and source zone sit in a row.

## Performance

Conversion for six zones, and the overlap (about 96 grid starts by up to six zones, a few offset lookups each), are a few milliseconds; measured and recorded below. No Web Worker.

## Related tools, search, integration

Curated relation: the Unix Timestamp Converter (both read instants and zones); one sentence on the page links it. One-way: the Unix page is not changed. `autoRelated: false` so the section does not auto-relate it to the other Time Tools. Aliases: time zone converter, timezone converter, time converter, convert time zones, world time converter, meeting time converter, international time converter, time difference between countries, meeting overlap. Not "time". Present in Time Tools, All Tools and global search; absent from Calculator Categories, All Calculators, Loans and Developer Tools. Featured Tools unchanged; Home unchanged except the metadata-derived Time Tools summary; no articles; no imagery; no issue-report block.

## Verification plan

- **Engine unit tests** (pure): UTC, India, Nepal (+05:45), Australia (+09:30 and Lord Howe), US and EU gaps and overlaps, southern-hemisphere DST, Lord Howe 30-minute shifts, date line (Kiritimati, Adak, Honolulu), day relations including two days, source-change, destination-change and swap semantics, unsupported zone, picker search, preferred-hours validation, overlap (normal, none, exact-boundary, duration fit, date-specific DST, a transition inside the meeting), the default date semantics.
- **Independent reference:** `tests/fixtures/time-zone-golden.py` (Python `datetime` and `zoneinfo`, no shared logic): wall-time resolution (kind and every candidate instant and offset), instant to local fields in target zones, and meeting windows by a minute-by-minute brute force over the source day. Fixtures are pinned and compared.
- **Browser (focused, `--workers=1`):** the workflow; defaults with a fixed clock and zone; gap and overlap UI; Nepal and Lord Howe; swap; board add, remove, limit, duplicates; overlap valid and none; copy; URL state valid and hostile; a11y; three widths; integration and search.
- **Visual:** the tool at desktop and mobile, plus Time Tools and All Tools only if they visibly change. **Static:** links, assets, SEO, inventory; root and preview builds. No full regression.

## Acceptance

Manual checks A to L of the brief pass; the performance numbers are recorded; existing tools are unchanged.

## Implementation notes

What was measured, and the deviations from the plan above.

- **Not shared with the Unix converter, on purpose.** Its zone helpers are exported and proven, but they work on BigInt nanoseconds and live in a 1,240-line module with batch and epoch parsing. Importing it would add about 40 KB for roughly 100 lines of need, and couple two tools. The new engine keeps the same correctness principle (sample the zone's offsets, accept an offset only if the zone really has it at the implied instant) in its own small module, and the Unix converter is untouched.
- **Independent reference:** `tests/fixtures/time-zone-golden.py` (Python `datetime` and `zoneinfo`, tzdata 2025.1; run it with plain `python`, not `python -I`, which hides the user-site tzdata package). Pinned in `tests/fixtures/time-zone-golden.json`: 1,476 wall-time resolutions (100 repeated hours, 100 skipped hours and ordinary times, around every 2026 and 2027 transition of 22 zones including Lord Howe, Chatham, St John's, Casablanca, Adak, Kiritimati and Pago Pago), 262 instant-to-zone conversions with day differences, and 42 meeting-window cases computed minute by minute (including transitions inside a meeting). The engine matches on every case.
- **Browser zone name.** Chromium reports India as `Asia/Calcutta`, so the page shows that name for the visitor's own zone (never a location claim). Duplicate detection uses the browser's canonical zone identity, so `Asia/Kolkata` and `Asia/Calcutta` are one zone and the quick-add button for Kolkata does not appear next to the source.
- **Abbreviations** appear only where the browser returns a real one (for example EDT); where it returns "GMT+1" nothing is added, since the offset is already shown.
- **Meeting overlap limits:** dates 1970 to 2100 for conversion; the overlap says so plainly when a zone has an offset on that date that is not a multiple of 15 minutes (for example Liberia in 1971). Windows are listed as "start between A and B", with the earliest start to the latest finish in every zone; at most 6 windows are shown.
- **URL state implemented** (date, time, source, destinations, and the repeat choice), written with `history.replaceState`; hostile or invalid values are ignored. No persistence.
- **Performance** (Node, this 2-core laptop, mean per call): converting to five destinations 0.7 ms; a skipped hour (finding the jump) 1.3 ms; a repeated hour 0.3 ms; zone search 0.6 ms; meeting overlap for 2 zones 15 ms and for 6 zones 41 to 43 ms. The overlap is computed only while its section is open. No Web Worker.
- **Zone list:** 424 entries in Chromium and Node (`Intl.supportedValuesOf`, plus UTC and the five modern spellings).
- **Stale tests fixed on the way:** the Stopwatch spec's Time Tools count assertion had been checking the last section (Developer Tools) since that section was added; it now checks the Time Tools section explicitly.
