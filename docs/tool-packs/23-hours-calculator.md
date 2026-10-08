# Tool Pack 23: Hours & Timesheet Calculator (the sixth Time Tools tool)

Status: **draft, awaiting approval. Not implemented.**      Base commit: a47175d
Roadmap: item 1 of Roadmap R1 (`docs/tool-pack-factory.md` section 10). The roadmap does not authorize this build; approval of this specification does.
Reserved id and slug: `hours-calculator` (route `/tools/hours-calculator/`)
Section: **Time Tools** (`time-tools`, flat, no category).

## 1. Tool identity
- Id `hours-calculator`; title **Hours & Timesheet Calculator**; section Time Tools; no category or subcategory.
- Description (one sentence, catalog): "Add up the hours you worked across several shifts: enter start and end times and unpaid breaks, including overnight shifts, and see each shift and the total in hours and minutes and in decimal hours. It runs in your browser."
- Aliases (true of the tool; none steals an existing lead): hours calculator, hours worked calculator, work hours calculator, timesheet calculator, time card calculator, shift hours calculator, overnight hours calculator, calculate hours worked, total hours calculator. **Not** "elapsed time" (the Stopwatch leads it), not "time calculator" or "date calculator" (the Date Calculator leads those), and not "payroll", "pay" or "overtime" (the tool does none of that).
- Capabilities (existing flags only): `reset`, `validation`, `explanation`, `examples`, `multipleInputs`, `realtime`, `localProcessing`. No `copy`, `print`, `table` or `savedState` in V1.

## 2. User problem
Someone who works shifts, or pays or checks someone who does, needs the hours actually worked: several start and end times in a week, some past midnight, with unpaid breaks taken off, and a total they can type into a timesheet or an invoice. Today they use a spreadsheet (time formats trip people up: negative times, overnight rows, `7:20` versus `7.33`) or a phone calculator and mental arithmetic. The tool does exact minute arithmetic, shows each shift and the total, and shows both forms people need: hours and minutes (`7:20`) and decimal hours (`7.33`).

**Distinct job (verified in the repository):** the Date Difference and Date Calculator specs exclude time of day; the Countdown Timer and Stopwatch measure live time; the Time Zone Converter converts an instant between zones. Nothing adds up clock-time shifts.

**AI-era test (rule 1.4):** an assistant can do one sum, but a multi-row timesheet needs repeatable exact arithmetic, an overnight rule that is stated and tested, and entering times without describing them. The browser adds privacy for working hours and no prompt.

## 3. Jobs to be done
1. "How many hours did I work this shift, after my break?"
2. "What is my total for these shifts?" (the figure they will copy somewhere)
3. "What is that in decimal hours?" (`7:20` is 7.33, not 7.20)
4. "Does a shift that ends after midnight work?"
5. "Which row did I get wrong?"

## 4. Target users
Hourly and shift workers, freelancers logging time, small-business owners checking timesheets, parents and carers tracking paid hours. **Not** for payroll processing, overtime or break-law compliance, or anyone needing time zones or dates.

## 5. Inputs
Per shift row (a row is one shift; rows are independent and unordered):

| Field | Control | Format | Default | Limits | Notes |
| --- | --- | --- | --- | --- | --- |
| Start | `<input type="time" step="60">` | `HH:MM`, 24-hour value (the picker may display 12-hour) | empty | 00:00 to 23:59 | Same control the Time Zone Converter already uses. Value is read as `HH:MM`. |
| End | same | same | empty | same | May be earlier than the start (see overnight). |
| Unpaid break | `<input type="text" inputmode="numeric">` labelled "Unpaid break (minutes)" | whole minutes | empty (means 0) | 0 to 1,439, at most 4 digits | Trimmed; digits only; leading zeros allowed. |

Rows: 1 at the start (empty), at most **31** (one a day for a month), added with "Add shift". Left out on purpose: dates, a row label, an hourly rate, per-row notes, break start and end times, rounding settings, 12-hour text entry.

If a browser renders `type="time"` as a plain text box, the value is parsed strictly as `HH:MM` 24-hour (the unit-tested path), with the message in section 10.

## 6. Outputs
Per row (below the row): **Shift** (gross time from start to end), **Unpaid break**, **Worked** (net), each as `h:mm`, plus the worked time in decimal hours, and an "Ends next day" tag for overnight shifts.

Combined (below the rows): **Total worked** as the primary figure in both forms (`19:15` and `19.25 decimal hours`), then secondary figures: total shift time, total unpaid breaks, and "Shifts counted". A plain notice states how many rows were not counted and why (section 9). Not shown: pay, overtime, averages, weekday names, percentages.

**Approved clarifications (applied in the implementation).**
1. **Included versus excluded rows.** Every row is shown as empty (ignored), incomplete (a time is missing; hint, not an error), invalid (a rule is broken; error) or Counted. The total card always states "Rows included" and "Rows excluded" with the split ("1 row excluded: 1 incomplete", "4 rows excluded: 2 incomplete, 2 invalid") and a note that the total includes only the counted rows. Empty rows are ignored and are not counted as excluded.
2. **Longest shift and clock-time arithmetic.** The page states, above the rows and in the Overnight section, that a shift can run from 1 minute up to 23 hours 59 minutes, that an earlier end time means the next day, and that these are clock times with no dates or time zones and no daylight-saving adjustment.

## 7. Calculation / model rules
All arithmetic is on **whole minutes (integers)**. No `Date` object, no time zone, no floating point in any duration.

- `minutes(t)` = `hours * 60 + minutes` of an `HH:MM` value (0 to 1439).
- `gross = ((end - start) mod 1440 + 1440) mod 1440`. If `end < start` the shift is **overnight** (it ends the next day). If `end == start` the row is invalid (section 9). So a valid shift is 1 to 1,439 minutes.
- `break` is an integer 0 to 1,439. Valid only if `break <= gross`. `net = gross - break` (0 allowed).
- Combined: `totalGross`, `totalBreak`, `totalNet` are sums over **valid** rows only.
- `h:mm` display: `floor(m / 60)` hours (no upper limit, no leading zero on hours) and `m mod 60` minutes padded to two digits: 450 is `7:30`, 0 is `0:00`, 1155 is `19:15`, 44609 is `743:29`. Spoken form: "7 hours 30 minutes" (singular and zero handled).
- **Decimal hours, display only:** `hundredths = floor((minutes * 100 + 30) / 60)` (integer division), shown as `floor(h/100) "." pad2(h mod 100)`. This is round-half-up to two places of `minutes / 60`; a tie never occurs (it would need `10 * minutes = 6k + 3`, which has no integer solution), so any rounding rule gives the same answer. Examples: 1 minute is `0.02`, 20 is `0.33`, 40 is `0.67`, 440 is `7.33`, 525 is `8.75`, 1439 is `23.98`.
- Each row's decimal and the total's decimal are each converted from **their own exact minutes**, never summed from rounded figures, so rounded row figures can differ from the total by a hundredth (three 0:20 rows show `0.33` each and a total of `1.00`). The page says so.
- **No automatic rounding of shifts** (no nearest 5 or 15 minutes). The only rounding is the two-decimal display above, and the exact `h:mm` is always shown beside it.
- Clock arithmetic, not elapsed time: a shift across a daylight-saving change is not adjusted. Stated on the page.

**Independent verification method** (section 25): a Python reference using `datetime.combine` with an explicit next-day step for overnight, and `decimal.Decimal` (`ROUND_HALF_UP`) for decimals, plus an exhaustive sweep of all 1,440 x 1,440 start and end pairs and all minute totals up to the maximum.

## 8. Assumptions (shown next to the results)
- Times are clock times as entered; no dates, no time zones, no daylight-saving adjustment.
- An end time earlier than the start time means the shift ends the next day.
- Breaks are unpaid and subtracted exactly as entered.
- Shifts are added as listed; the tool does not check whether two rows overlap.
- Nothing is rounded except the two-decimal display of decimal hours.
- This is arithmetic, not payroll: no pay, overtime, break rules or legal compliance. Check your own employer's or country's rules.

Nothing depends on a rate, a rule or a date the site would have to maintain. **No upkeep.**

## 9. Edge cases (decisions, not left to implementation)
| Case | Behaviour |
| --- | --- |
| Overnight shift (end earlier than start) | Valid. `22:00` to `06:00` is 8:00. Tagged "Ends next day". |
| Equal start and end | **Invalid**, never 0 or 24 hours: "Start and end are the same time. A shift must be at least 1 minute and less than 24 hours." |
| Maximum shift | 23:59 (1,439 minutes): `00:00` to `23:59`, or any pair one minute short of a full day. Longer shifts are not supported (stated). |
| Midnight boundaries | `23:00` to `00:00` is 1:00; `23:59` to `00:00` is 0:01; `00:00` to `00:01` is 0:01. `00:00` is a valid time. |
| Break zero or blank | Blank means 0; `0` is 0. |
| Break equal to the shift | Valid; worked 0:00. |
| Break longer than the shift | **Invalid**: "Break is 90 minutes but the shift is 60 minutes. The break cannot be longer than the shift." |
| Break not a whole number | Invalid: "Break must be a whole number of minutes from 0 to 1,439." (covers `abc`, `-5`, `1.5`, `1e2`, `30m`, `5 minutes`, empty-looking symbols, more than 4 digits). `" 30 "` and `05` are valid. |
| Multiple shifts on the same day | Allowed; rows are just shifts. No overlap detection (stated). |
| Dates | Not collected; not required. |
| **Empty row** (all three fields blank) | Ignored: not counted, no message. |
| **Incomplete row** (start without end, end without start, or a break without both times) | Not counted; neutral hint under the row ("Enter an end time.", "Enter a start time.", "Enter start and end times for this shift."); not styled as an error. |
| **Invalid row** (any rule above broken) | Not counted; error text under the row, the field marked `aria-invalid`. |
| Total with some rows not counted | The total is shown for the valid rows and a notice says exactly what was left out: "Total of 2 shifts. 1 row is incomplete and 1 has a problem; neither is counted." |
| No valid rows | No total; the empty state "Enter a start and end time for at least one shift to see the total." |
| 31 rows | "Add shift" becomes disabled and says "You can add up to 31 shifts." |
| Time field half-filled (browser `badInput`) | Treated as invalid: "Enter a complete time, such as 09:00." |
| Fallback text mode, bad time (`9:00`, `24:00`, `12:60`) | "Use 24-hour time such as 09:00 or 17:30." |
| Total beyond 24 hours | Shown as hours that keep counting (`46:30`), never wrapped to a day. Maximum possible 743:29. |

## 10. Validation
Row validation runs on every change, per row, with no blocking: the row's result (or hint, or error) and the combined total update together. Messages are the exact strings in section 9, plain language, each naming the problem and the fix, displayed in the row; none is shown while a row is merely empty. Invalid input never clears what was typed. Time values are accepted only as `HH:MM` (00 to 23, 00 to 59). Break text is trimmed and must match `^[0-9]{1,4}$` (ASCII digits) and be at most 1,439.

## 11. UX flow
Order: intro and trust card ("Your times stay in your browser"); **Shifts** (one card per row); the row actions (Add shift, Load example, Clear all); **Total** card; How to use; Worked example; Hours and minutes versus decimal hours; Overnight shifts; What it does not do; Common uses; FAQ.
- Updates live (no Calculate button, `realtime`). Primary action: Add shift when the user needs more rows; there is no "submit".
- **Load example** replaces the rows with the three-shift example (section 12 of the page text, below) and leaves focus on the button.
- **Clear all** (secondary): returns to one empty row, removes every result, hint and error, moves focus to that row's Start field. No confirmation (nothing is stored; the example restores a sample).
- **Remove** (per row): removes that row; renumbers "Shift N"; on the only remaining row it clears the row instead. Focus goes to the next row's Start field (or the previous row's if it was last).
- **Add shift**: appends an empty row and moves focus to its Start field.
- Enter inside a field does nothing special. No keyboard shortcuts. No persistence, no URL state (a reload clears everything, stated).

## 12. Result hierarchy
1. **Total worked** (large): `19:15` with `19.25 decimal hours` beside it.
2. Per-row **Worked** (bold) with **Shift** and **Unpaid break** in lighter text, each labelled in words.
3. Supporting totals (shift time, breaks, shifts counted) and the not-counted notice.
A shift with zero worked time is shown plainly as `0:00`; nothing is styled as a verdict.

## 13. Table or schedule decision
**NOT NEEDED** as a table: up to 31 rows are cards with a result line each, which reads better on a phone than a wide table and keeps one column. (A printable table is a future option, section 27.)

## 14. Chart decision
**NOT NEEDED.** A chart would restate the numbers.

## 15. Export decision
**NOT NEEDED in V1.** Users copy a total by hand. A "copy summary" is a future option (it would need an explicit-copy test like the JWT Decoder's).

## 16. Print decision
**NOT NEEDED in V1** (see section 27).

## 17. Mobile behaviour
One column at 320 to 390 px. Each shift card: a heading ("Shift 1") with a 44 px Remove button; Start and End side by side (each at least 44 px tall, 16 px text so iOS does not zoom); Break full width; the row's result line below as three labelled items that wrap. Add, Load example and Clear are 48 px, full width or two columns. No horizontal page scroll, including with 31 rows, 4-digit breaks and the 743:29 total. The native time picker is used on phones.

## 18. Accessibility requirements
- Each row is a group (`role="group"`) named by its heading ("Shift 2"); each field's accessible name combines the row and the label ("Shift 2 Start", "Shift 2 End", "Shift 2 Unpaid break (minutes)") via `aria-labelledby`.
- Row errors are text in an element linked by `aria-describedby`, the field `aria-invalid="true"`; the incomplete hint is plain text, not an alert. Meaning is never colour alone.
- One polite live region (`role="status"`). After a 500 ms pause after the last change it announces one sentence: "Total 19 hours 15 minutes, 19.25 decimal hours, from 3 shifts." When rows are not counted it adds "1 row is incomplete and not counted." / "1 row has a problem and is not counted." When a row first shows an error it announces that row's message once ("Shift 2: Break is 90 minutes but the shift is 60 minutes..."). Add, Remove, Clear and Load example announce "Shift 4 added.", "Shift 2 removed. 2 shifts remain.", "All shifts cleared.", "Example loaded."
- Focus moves as in section 11; Remove buttons are named "Remove shift 2"; Add shift names its limit when disabled; all controls reachable and operable by keyboard in a natural order (per row: Start, End, Break, Remove; then Add shift, Load example, Clear all); visible focus from the shared styles; 44 px targets.

## 19. Search keywords and aliases
As section 1. Present in Time Tools, All Tools and global search; absent from Calculators, Developer Tools and Image Tools; the calculators page lists calculators only (unchanged). The SEO text does not claim payroll, legal or "accurate pay" outcomes.

## 20. Related tools
**None in V1.** The entry sets `autoRelated: false` and no `relatedTools`, so it joins no existing Time Tool's automatic list and the pinned lists of the four older Time Tools are unchanged (as the Time Zone Converter did). The page may mention, in one sentence, the Date Difference Calculator for counting days; that is a text link, not a catalog relation.

## 21. Article cluster
**NOT NEEDED.** The page already carries the worked example, the decimal-hours explanation and the overnight rule. Any later article must have independent explanatory value (rule 12) and is a separate decision.

## 22. Imagery plan
**NOT NEEDED.** No images.

## 23. SEO plan
- **Title:** "Hours Worked Calculator: Shifts, Breaks and Total Hours | ToolZen Hub"
- **Description:** "Free hours worked calculator: enter start and end times for each shift, take off unpaid breaks, including overnight shifts, and see each shift and the total in hours and minutes and in decimal hours. It runs in your browser."
- **H1:** "Hours & Timesheet Calculator".
- **Intent (hypotheses, not measured):** people searching to add up hours worked, work hours, a time card or an overnight shift. No keyword volumes, traffic or rankings are claimed or implied.
- **Page content:** How to Use; Worked Example (below); Hours and Minutes versus Decimal Hours; Overnight Shifts; What This Tool Does Not Do; Common Uses; FAQ.
- **Worked example** (also "Load example"): Shift 1: 09:00 to 17:30, break 30, worked 8:00 (8.00); Shift 2: 22:00 to 06:00 (next day), break 45, worked 7:15 (7.25); Shift 3: 13:00 to 17:00, no break, worked 4:00 (4.00). Total shift time 20:30, breaks 1:15, **total worked 19:15 = 19.25 decimal hours**, 3 shifts.
- **Decimal hours section:** 7:20 is 7.33 hours because 20 minutes is a third of an hour; hours and minutes are not decimals; to turn decimal hours into pay, multiply by a rate yourself; the tool does not.
- **Overnight section:** an end time earlier than the start time means the next day; equal times are not accepted; shifts must be under 24 hours; the tool does not know dates or daylight-saving changes.
- **FAQ (5):** Does it round my time? (no, only the two-decimal display); How are shifts past midnight counted?; Why is 7:20 shown as 7.33?; Can a break be longer than the shift? (no); Is my data stored or sent anywhere? (no: calculated in the browser, nothing stored, a reload clears it, and the tests check it). A sixth, "Does it calculate pay or overtime?" (no), may replace the shortest.
- **Internal links:** one sentence to the Date Difference Calculator. No related-tools block.
- **No claim** of payroll, legal or labour-law compliance anywhere.

## 24. Performance constraints
Tiny, synchronous, no worker, no timers beyond the 500 ms announcement debounce, no dependencies. Row results update in place (no full re-render per keystroke, so focus and the native picker are not disturbed). The page loads only its own module, engine and CSS (a tool stylesheet registered in `toolStyles.json`).

## 25. Tests (risk-based; no broad regression)
**Independent reference:** `tests/fixtures/hours-golden.py` (Python standard library; written from this specification, not from the JavaScript) writes `tests/fixtures/hours-golden.json`:
- Gross by `datetime.combine` with an explicit next-day step for overnight; decimals by `decimal.Decimal` with `ROUND_HALF_UP`.
- Named vectors (below) plus **exhaustive sweeps**: all 1,440 x 1,440 start and end pairs (gross and overnight flag, compared as a digest over every pair) and every total from 0 to 44,609 minutes (the `h:mm` and decimal text, compared as a digest). The JS test computes the same digests with `node:crypto`.

**Named vectors (expected values worked out above and re-derived by the reference):**
| Case | Input | Expected |
| --- | --- | --- |
| Standard day | 09:00 to 17:00, break 30 | shift 8:00, break 0:30, worked 7:30, 7.50 |
| Overnight | 22:00 to 06:00, break 0 | worked 8:00, 8.00, next day |
| Zero break | 08:15 to 12:45, break 0 (and blank) | 4:30, 4.50 |
| Break equal | 09:00 to 10:00, break 60 | worked 0:00, 0.00 |
| Break longer | 09:00 to 10:00, break 61 | invalid, message with 61 and 60 |
| Equal times | 09:00 to 09:00 | invalid |
| Midnight | 23:00 to 00:00; 23:59 to 00:00; 00:00 to 00:01; 12:00 to 11:59 | 1:00; 0:01; 0:01; 23:59 (next day) |
| Decimal | 1, 20, 40, 440, 470, 525, 1439 minutes | 0.02, 0.33, 0.67, 7.33, 7.83, 8.75, 23.98 |
| Rounded rows vs total | three 20-minute shifts | rows 0.33 each, total 1:00 and 1.00 |
| Multiple rows | the worked example | total shift 20:30, breaks 1:15, worked 19:15, 19.25, 3 shifts |
| Not counted | one valid, one incomplete, one invalid, one empty | total of the valid row only, notice names 1 incomplete and 1 problem, empty ignored |
| Invalid break text | `abc`, `-5`, `1.5`, `1e2`, `30m`, `12345`, `9999` | all invalid; `" 30 "` and `05` valid |
| Bad time (fallback parse) | `9:00`, `24:00`, `12:60`, `09:5` | invalid |
| Maximum | 31 rows of 00:00 to 23:59 | total 743:29, 743.48 |

**Floating-point avoidance:** every duration is an integer number of minutes; there is no division except the integer `floor((m * 100 + 30) / 60)` and `floor(m / 60)`, `m mod 60`; no `toFixed`, no `Math.round`, no `Date`. A unit test greps the engine source for `toFixed`, `Math.round`, `new Date` and `parseFloat`.

**Unit** (`tests/unit/hours-calculator.test.mjs`): the vectors and sweeps; row classification (empty, incomplete, invalid, valid); every message string; the `h:mm` and spoken forms; the wording scan (nothing says pay, wage, overtime, payroll, legal, compliant); mutations of the key rules (equal-time rule, the overnight sign, `break <= gross`, the `+ 30`) each caught, then reverted.

**Browser** (`tests/browser/hours-calculator.spec.js`, `subpath-desktop` and `subpath-mobile`, `--workers=1`): initial state and labels; load example and its figures; add, remove (focus and renumbering), clear (focus), the 31-row limit and the disabled Add; overnight tag; the not-counted notices; error text linked with `aria-describedby`; announcements; keyboard path; **privacy** (no non-GET or fetch/XHR/beacon request, empty storage, unchanged URL and title, nothing logged); 320, 360 and 390 px with 31 rows, no page-level overflow and 44 px targets. Mutation check of the page (for example live total ignoring the not-counted rule), then reverted.

**Integration and static:** the pinned unit tests (catalog, sections, relationships, search with its alias list and counts, tool-capabilities), the regenerated inventory, links, assets and SEO checks, and the Time Tools count literals (5 to 6; the All Tools group count 15 to 16) in the specs that pin them. Affected visual baselines: the All Tools and Time Tools listings (reviewed by eye). **Decision for approval:** whether the new page gets its own visual baseline (default: no, as for the JWT Decoder).

**Manual (at the Roadmap R1 milestone, not before):** real Android and Safari/WebKit: the native time picker, overnight entry, the on-screen keyboard over the break field, a 31-row page. Until then Android and Safari are reported **unverified**. The browser-level partial-time case (`badInput`) is covered manually, since automation cannot enter half a time.

## 26. Quality gate
All eight rule 12 gates pass on the current information: a real problem; not a duplicate; exact deterministic output; no upkeep (no changing data); no API; no privacy risk (times stay local, tested); good on a phone by design (to be confirmed on a device at the milestone); not added for the count. Weighted score 3.75 of 5, with search and retention as hypotheses.

## 27. Deferred items (optional future improvements, each a separate decision)
Row labels or weekday names; dates and overlap detection; a copy-summary button; a printable table; rounding options (nearest 5, 10 or 15 minutes) as an explicit choice; break start and end times; saving a week (persistence would need its own privacy decision); a soft warning for very long shifts (for example 16 hours or more) to catch AM/PM mistakes; 12-hour text entry.

**Excluded (not planned):** pay, hourly rate and earnings, overtime, tax, break or labour-law rules, employer-specific rules, time zones, daylight-saving adjustment, accounts, any API, sharing links, analytics, imagery, articles.

## 28. Anticipated implementation files (proposed; none exist yet)
**New:**
- `assets/js/tools/hours-calculator/hours-engine.js` (pure: parsing, classification, minutes arithmetic, formatting, messages)
- `assets/js/tools/hours-calculator/index.js` (the page: `markup()`, `render()`, `init()`; text via `textContent`)
- `assets/css/tools/hours-calculator.css`
- `tests/unit/hours-calculator.test.mjs`
- `tests/browser/hours-calculator.spec.js`
- `tests/fixtures/hours-golden.py` and `tests/fixtures/hours-golden.json`

**Existing, small changes:**
- `assets/js/data/tools.js` (the entry: `sectionId: "time-tools"`, `autoRelated: false`, aliases, capabilities, SEO)
- `assets/js/data/categories.js` (the Time Tools `seoDescription` and `summary` name the tools)
- `src/_data/toolStyles.json` (style entry)
- `tests/unit/catalog.test.mjs`, `sections.test.mjs`, `relationships.test.mjs`, `search.test.mjs`, `tool-capabilities.test.mjs`
- `tests/browser/stopwatch.spec.js`, `json-formatter.spec.js`, `text-diff.spec.js`, `unix-timestamp-converter.spec.js`, `time-zone-converter.spec.js`, `image-compressor-resizer.spec.js`, `navigation.spec.js` (Time Tools count 5 to 6, All Tools groups 15 to 16)
- `tests/inventory/url-inventory.json` (regenerated); DOM (home main, tools directory), links and SEO baselines; the All Tools and Time Tools visual baselines
- `docs/tool-packs/23-hours-calculator.md` (this file: an Implementation notes section is added after the build)

No shared component, global header, footer or navigation change; no dependency.

## 29. Risks and open questions (for approval)
1. `type="time"` versus a text box (recommended: native, with the strict fallback).
2. Equal start and end rejected (rather than 0 or 24 hours).
3. Row limit of 31.
4. Incomplete and invalid rows excluded from the total with an explicit notice (rather than blocking the total).
5. Break entered in whole minutes only (no `h:mm`).
6. Two-decimal decimal hours.
7. No related tools in V1.
8. Id, title and alias list.
9. A visual baseline for the new page, or none.
- **Residual risks:** native time pickers differ by device and are only checked at the milestone; a mistaken AM/PM on a phone can produce a plausible wrong shift (a soft warning is a future option); users may read the total as pay (the page states it is not).

## 30. Implementation notes (built locally, not committed)

Status after the build: implemented and verified in Chrome (desktop and the mobile emulation project). **Real Android: UNVERIFIED. Safari/WebKit: UNVERIFIED.** The native time picker, overnight entry on a phone and the on-screen keyboard over the break field are checked at the Roadmap R1 milestone.

**Deviations from the plan above (all small):**
- A visible "Shifts" heading (h2) sits above the rows so the row headings (h3) do not skip a level; the rows box is a labelled group.
- The "Rows included" and "Rows excluded" lines read as sentences ("3 rows included in the total", "2 rows excluded: 1 incomplete, 1 invalid") because the same sentences are announced to screen readers.
- Incomplete rows show a plain hint; invalid rows show the error and mark the field `aria-invalid`; both are labelled in the row's status ("Incomplete, not counted", "Invalid, not counted"). The total says it includes only the counted rows.
- The page states the 23 h 59 min maximum, the next-day rule and "no dates or time zones, no daylight-saving adjustment" in a note above the rows and in the Overnight section (the two approved clarifications).
- Remove is a compact button in the row heading; on the only row it clears the row.

**Verification run (risk-based, no broad regression):**
- Unit, `tests/unit/hours-calculator.test.mjs`: 28 tests against `tests/fixtures/hours-golden.py` (Python `datetime` and `Decimal`): named vectors and exhaustive sweeps of all 1,440 x 1,440 start and end pairs, every total from 0 to 44,609 minutes, and a break grid. A source check confirms no `toFixed`, `Math.round`, `Date`, timers, storage or imports in the engine. Five deliberate mutations were caught (one more is an equivalent mutant: `+ 29` instead of `+ 30` in the decimal formula never changes a result because no tie can occur); `+ 0` is caught.
- Browser, `tests/browser/hours-calculator.spec.js`: 22 tests per project on `subpath-desktop` and `subpath-mobile` (live results, example, row states and counts, break text, overnight, add, remove and clear with focus and announcements, 31 rows and 743:29, announcements, accessible names and heading order, keyboard, hostile text, privacy, 320, 360 and 390 px with 31 mixed rows, Time Tools listing, related tools, search). Two page mutations were caught after one assertion was strengthened (the excluded-rows note must be visible, not merely contain text).
- Pinned tests updated: catalog, sections, relationships (the tool relates to nothing and joins no other list), search (aliases and counts), tool-capabilities; the Time Tools count (5 to 6) and All Tools group count (15 to 16) in the stopwatch, JSON Formatter, Text Diff, Unix, Time Zone, Image Compressor and navigation specs. Inventory regenerated (77 live pages); DOM, links and SEO baselines updated; visual baselines updated and reviewed only for the Home (desktop), All Tools (mobile) and Time Tools (desktop and mobile) listings. No visual baseline was created for the new page.
- Static: inventory, links, assets and SEO checks pass for both builds.

**Known limitations:** no overlap detection, no dates, no daylight-saving adjustment, shifts under 24 hours only, whole-minute breaks only, two-decimal decimal hours; the browser-level half-filled time case (`badInput`) is covered by the engine and a manual check only.
