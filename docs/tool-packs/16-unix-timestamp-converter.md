# Tool Pack 16: Unix Timestamp Converter (the second Developer Tools tool)

Status: built and verified (see Verification)      Base commit: 59ce059
Id and slug: `unix-timestamp-converter` (route `/tools/unix-timestamp-converter/`)
Section: **Developer Tools** (no subcategory). Follows `docs/product-decision-rules.md`; spec template `docs/tool-packs/_spec-template.md`; previous pack `15-json-formatter-validator.md`.

## Does it earn its place? (checked before building)

- **Recurring pain.** A developer meets an epoch number in a log line, an API response, a JWT, a database row or a webhook, and needs the instant it names, in UTC and in a zone, right now. The reverse (a date and zone to an epoch) is just as common. Daily work for anyone who reads logs.
- **Why not just ask an AI.** An assistant has **no clock** (it cannot know the current Unix time), often slips on epoch arithmetic, unit confusion and daylight-saving rules, and cannot be trusted with an exact instant. This tool is exact and deterministic, answers instantly with no prompt, and logs stay in the browser. It is also useful for values an AI or API produced.
- **Not "timestamp, convert, output".** What makes it a developer workflow: unit ambiguity is shown and never guessed; exact nanosecond arithmetic with BigInt; a daylight-saving gap or overlap is named, never silently resolved; a batch mode that extracts timestamps from pasted log lines; the same instant across several zones; a live "now".
- **Repeat use.** A bookmark-and-return tool. Retention comes from speed and trust. No accounts, history, streaks or points.
- **Browser-native, no dependency.** `Date`, `Intl.DateTimeFormat` (the browser's IANA zone data), `BigInt`. No library, no API, no backend. Maintenance is near zero: there is no data to keep fresh (zone rules come from the browser).
- **Discovery.** "unix timestamp", "epoch converter", "timestamp to date", "date to timestamp" are everyday queries.
- **Verdict: passes.**

## Hierarchy, route, relationships

Home, All Tools, **Developer Tools**, Unix Timestamp Converter. Section landing `/developer-tools.html`; tool route `/tools/unix-timestamp-converter/` (the section's `tools` prefix); breadcrumb Home › Developer Tools › Unix Timestamp Converter from the central component. No subcategory (two tools do not need a grouping layer).

**Related Tools:** JSON Formatter & Validator, both ways (timestamps live in JSON and API payloads): a curated `relatedTools` id on each catalog entry and one sentence with a link on each page, like the Stopwatch and Countdown Timer. **Not** related to Date Difference, Date Calculator, Countdown Timer or Stopwatch: despite the thematic overlap the job is developer epoch conversion. No articles. No imagery.

## Model: the instant

An instant is an exact **BigInt count of nanoseconds** since 1970-01-01T00:00:00Z. Nothing is parsed through `Number`, nothing is rounded. Epoch text is converted by digit arithmetic: the integer and fraction digits are scaled by the unit's factor.

**Supported range: years 1 to 9999** (proleptic Gregorian, UTC): -62135596800 s through 253402300799.999999999 s. This is inside the span of a JavaScript `Date` and of every browser's `Intl`, so behaviour is defined everywhere. Outside it the page says so (with the direction). Negative (pre-1970) timestamps are fully supported.

## Unit support and detection (deterministic)

Units: seconds, milliseconds, microseconds, nanoseconds. The unit selector is **Auto** (default) or an explicit unit. Auto looks only at the number of digits of the integer part (leading zeros ignored; the sign and any fraction do not count):

| Digits | Auto reads it as | Certain? |
| --- | --- | --- |
| 1 to 10 | seconds | yes |
| 11 or 12 | seconds **or** milliseconds | **ambiguous** |
| 13 | milliseconds | yes |
| 14 or 15 | milliseconds **or** microseconds | **ambiguous** |
| 16 | microseconds | yes |
| 17 or 18 | microseconds **or** nanoseconds | **ambiguous** |
| 19 | nanoseconds | yes |
| 20 or more | none | error: choose Nanoseconds |

An ambiguous value is never converted silently. **One refinement:** if only ONE of the two readings is a date between the years 1 and 9999 (for example 12 digits as seconds is after year 9999, so only milliseconds fits), that reading is used and the reason says so ("as seconds it is outside the supported range, so it is read as milliseconds"). If both readings are in range the value stays ambiguous: the page lists each candidate interpretation with its result and a "Use <unit>" button that sets the selector. The detected unit and the reason are always shown ("Read as milliseconds: 13 digits"); a unit the user chose is labelled as chosen. The rule is a table, not a heuristic on value ranges, so the same text always gives the same answer.

## Parsing epoch text (strict)

Accepted: optional `-`, plain digits, optional `.digits`. Everything else is an error with its own message: a plus sign, spaces or separators inside the number (`1,700,000,000`, `1_700`), exponent notation (`1.7e9`), hex, other characters. A fraction is exact; a fraction finer than one nanosecond for the unit (for example `1700000000.1234567891` seconds) is an error, never rounded.

## Outputs: timestamp to date

For a valid instant (hierarchy: the date first, details after): UTC as ISO 8601; the selected zone (weekday, date, time, offset, ISO with offset); the browser's local zone when it differs; a relative time; the unit and why; and the instant as Unix seconds and milliseconds, **exact decimal strings** (a fractional part is shown when the instant is finer than the unit). Copy buttons: UTC ISO, selected-zone ISO, Unix seconds, Unix milliseconds. Time zone names come from `Intl` and may read differently between browsers; the offset is the reliable part.

## Date and time to timestamp

A text field accepting **only** strict ISO 8601 (`YYYY-MM-DD`, optionally `THH:MM[:SS[.fraction]]` with `T` or a space, optionally `Z` or `+HH:MM`/`+HHMM`/`+HH`) or strict RFC 2822 (`Tue, 14 Nov 2023 22:13:20 +0000`; numeric offsets, `GMT`, `UT`; a given weekday must match the date), plus a native `datetime-local` picker that fills the field. No fuzzy or natural-language dates ("tomorrow", "next Friday"). Second 60 (a leap second) is refused. A date with no time is 00:00:00.

- **An explicit offset or `Z`** fixes the instant; the zone selector is not used (the page says so).
- **No offset:** the wall-clock time is read in the selected IANA zone, and checked for daylight saving:
  - **Gap** (the local time does not exist): no result. The page says "This local time does not exist in the selected time zone because of a daylight-saving transition" and names the transition (the clocks moved from X to Y at that moment); the user corrects the time.
  - **Overlap** (the local time happens twice): no single answer. Both instants are shown, labelled **earlier** and **later**, each with its offset, Unix seconds and milliseconds and a copy button. Neither is chosen for the user.
  - **Unique:** the instant, with its offset.
- Zone offsets come from `Intl.DateTimeFormat` (no hand-written offset rules). Candidate instants are found by sampling offsets around the wall time and keeping the ones that round-trip, which handles gaps, overlaps and historical offsets (including seconds-level local mean time).

## Time zones

IANA names only. One page-level **Time zone** control (a native select) is used for the selected-zone output, for reading a local date and time without an offset, and for the batch table. Its first group is Local (the browser's zone name, "Local" shown, no location inferred), UTC and a short common list; its second group is every zone the browser reports (`Intl.supportedValuesOf("timeZone")`). Where the browser cannot list zones the common list is used. Results depend on the browser's time-zone database; the page says so.

## Same instant across zones

A lightweight table for the instant of the Timestamp to date result: UTC and Local always, plus up to **6** chosen zones (default: America/New_York, Europe/London, Asia/Kolkata, Asia/Tokyo, minus any that is UTC or the local zone, which are already shown), add and remove, no duplicates. It is not a world clock: no ticking, no maps, no meeting planner. A date-to-timestamp result has a "Show in Timestamp to date" button that puts its Unix seconds into the first field, so the board follows one clearly identified instant.

## Live "now"

Unix seconds (and milliseconds) of the current moment, with the browser's local zone shown. Copy seconds, Copy milliseconds and **Convert now** (which puts the current second into Timestamp to date) sit beside it. The display repaints **once per second**, scheduled to the next second boundary, and **stops while the tab is hidden** (it catches up when visible). It is `aria-live="off"`: never announced. Copy takes the exact value at the moment of the click, so it is not the stale display. Only seconds and milliseconds are offered: `Date` has millisecond resolution, so microseconds or nanoseconds would be invented precision. The clock is the system wall clock (`Date.now()`), as it must be for a Unix time.

## Batch mode

A textarea. Each non-empty line is one entry: a line that is **only** an epoch value is converted as it is; otherwise the line is searched for **standalone numbers of 10, 13, 16 or 19 digits** (optionally with a leading `-` and a fraction, not part of a longer word or number) and each is converted. A line with nothing that looks like a timestamp is shown as a not-recognised row, not an abort. It uses the page's unit rule (Auto, or an explicit unit applied to all). Output: a table with line, value, unit, UTC and the selected zone; invalid and ambiguous entries are marked in words in their rows. **Limit: 200 entries and 100,000 characters** (extra entries are counted, not rendered, and the page says "Showing the first 200 of N"). One button copies the table as tab-separated text. This is not a log parser: it does not read ISO dates in logs or extract any other field.

## Range, leap seconds, 2038

Range as above. **Leap seconds:** Unix time counts every day as exactly 86,400 seconds; leap seconds are not separate instants, and this tool does not model them (and refuses `:60`). **2038:** the 2038 problem is that systems storing Unix time in a **signed 32-bit** integer overflow at 03:14:07 UTC on 19 January 2038 (2,147,483,647 seconds). It concerns those implementations. A browser's `Date` (and this tool) use 64-bit values and work to the year 9999; the page says so and does not imply the web stops in 2038.

## Privacy and security

Everything runs in the browser: no API, backend, analytics of entered values, account or storage (nothing is written to `localStorage`; a reload starts fresh). Microcopy: "Your timestamps and dates are processed in your browser." Pasted text (batch lines, the date field) is only ever set as `textContent` or a control value, never HTML; the batch rows echo the pasted token or an excerpt of the line as text. Tested with `<script>`, tags, quotes and Unicode.

## UI

A developer workspace in the existing design system, in this order of importance: a compact "Current Unix time" strip; the page-level Time zone control; **Timestamp to date** (the dominant card, with the zone board under its result); **Date to timestamp**; **Batch conversion**; then the explanation (how to use, unit rules, time zones and daylight saving, range, leap seconds and 2038, privacy, FAQ). Conversion is live as you type (an error is shown after a short pause, so a half-typed value does not flash an error); no Convert button is needed. States are words, never colour alone.

## Accessibility

Visible labels and linked hints and errors (`aria-invalid`, `aria-describedby`); native controls; visible focus; a polite status region announces only settled results (after a pause, not per keystroke), errors, copy results and button actions; the live clock and the relative time are not live regions; the batch is a real table with a caption and column headers inside a labelled, focusable scroll region; ambiguity and DST gaps and overlaps are explained in text; 44 px minimum touch targets.

## Search aliases

unix timestamp, epoch converter, epoch time, timestamp converter, unix time converter, timestamp to date, date to timestamp, epoch to date, milliseconds timestamp, unix milliseconds. These lead with this tool; `json`, `stopwatch`, `countdown timer`, `date calculator` and `date difference` keep their first results; it is absent from every calculator-scoped search and from Time Tools.

## Platform changes (small)

`data/categories.js` (the Developer Tools section text now covers two tools), `data/tools.js` (the entry; `relatedTools` on the JSON entry), `src/_data/toolStyles.json`, the tool's module, engine and CSS, one sentence and link on the JSON page. **Featured Tools, the Home hero and the header are unchanged.** The Home Explore card for Developer Tools takes its one-line summary from the section data, so that line is updated to cover both tools.

## Exclusions

Natural-language dates, a calendar or meeting planner, a world clock, cron, JWT or Base64 decoding, ISO-date extraction from logs, scientific-notation input, leap-second modelling, microsecond or nanosecond "now", persistence or history, sharing links that put values in a URL, an API, accounts, articles, imagery, a Temporal API dependency (not used: not universal across the supported browsers).

## Verification

- **Unit** (`tests/unit/unix-timestamp.test.mjs`): golden values pinned from an **independent Python reference** (`tests/fixtures/unix-timestamp-golden.py`: `datetime` and `zoneinfo`, fixed dates only) covering UTC, India (no DST), US spring-forward gap, US fall-back overlap, Europe DST transitions, a pre-1970 instant, a large instant and seconds-versus-milliseconds detection; unit detection for every digit length; negative, whitespace, invalid and huge inputs and the BigInt precision limits; strict date parsing (ISO and RFC 2822) and its refusals; DST gap and overlap resolution; relative text; batch extraction, limits and mixed input; the live-clock tick helper with an injected clock.
- **Browser** (`tests/browser/unix-timestamp-converter.spec.js`, desktop and a mobile critical flow, Playwright's fake clock for "now"): the three conversions, ambiguity choice, DST gap and overlap, batch, the zone board, copy, XSS and no-network, accessibility semantics, 320/360/390 px, Developer Tools landing, All Tools, Home to the tool, global search and isolation.
- Static links, assets, SEO and inventory; root and preview builds; DOM, links and SEO baselines; visual baselines for the tool, the Developer Tools landing, All Tools, and the JSON page (one added sentence). No calculator, other Time Tool or full regression was run.

## Acceptance criteria

Every behaviour above holds; the independent fixtures agree with the engine; `unix timestamp`, `epoch converter`, `timestamp to date` and `date to timestamp` return the tool first while the other tools keep their queries; it is in Developer Tools and All Tools only; Hostinger and production are untouched.

## Known limitations

Needs the page open. Results depend on the browser's time-zone database and zone naming. Only years 1 to 9999. Seconds-level date entry plus a fraction; no leap seconds. The batch extractor finds 10, 13, 16 and 19 digit numbers, so an identifier of that length in a log line is also converted (it is shown, so it is visible). The relative time is approximate beyond days ("about 2 years").
