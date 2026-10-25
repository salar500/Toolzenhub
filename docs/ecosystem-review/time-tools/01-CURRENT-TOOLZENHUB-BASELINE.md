# 01. Current ToolZenHub baseline (Time Tools)

Verified 2026-10-25 at `42b7bb6` (branch `main`, 2 commits ahead of `origin/main`, both documentation-only; application code identical to the preview build of `8ece03a`). Sources: `assets/js/data/tools.js`, each module and engine file, Tool Packs 11 to 14, 19, 23 and 28, and `../01-WEBSITE-INVENTORY.md`. Status vocabulary follows the ecosystem review: implemented, tested locally, on preview, device-accepted, on production, approved-not-built, proposed, deferred, rejected. Tests were **not** re-run for this research.

## Time Tools today: 7 published

| Tool | ID and route | Implemented | Tested locally (per spec) | Preview | Production | Device accepted |
|---|---|---|---|---|---|---|
| Date Difference | `date-difference` `/tools/date-difference/` | yes | unit golden + browser | 200 | 200 | not recorded |
| Date Calculator | `date-calculator` `/tools/date-calculator/` | yes | unit golden + browser | 200 | 200 | not recorded |
| Countdown Timer | `countdown-timer` `/tools/countdown-timer/` | yes | unit (fake clock) + browser | 200 | 200 | not recorded |
| Stopwatch | `stopwatch` `/tools/stopwatch/` | yes | unit (injected clock) + browser | 200 | 200 | not recorded |
| Time Zone Converter | `time-zone-converter` `/tools/time-zone-converter/` | yes | unit + independent Python reference (`time-zone-golden.py`) + browser | 200 | 200 | not recorded |
| World Clock | `world-clock` `/tools/world-clock/` | yes | focused tests (spec 28) | 200 | **404** | not recorded |
| Hours & Timesheet Calculator | `hours-calculator` `/tools/hours-calculator/` | yes | unit + browser | 200 | 200 | not recorded |

## Approved but not built (3)

International Meeting Planner, Pomodoro Focus Timer, Shift Schedule Planner: owner-authorized (see `../14-DECISIONS-AND-OPEN-QUESTIONS.md`, D1). **Not in the catalog, no module, no spec.** No progress beyond the documents in this folder.

## Per-tool facts

Labels: V = verified in a spec or source this session; limits are the spec's stated limits.

| Tool | Main job | Workflow | Strongest capability (V) | Limitations (V, from specs) | Decision |
|---|---|---|---|---|---|
| Date Difference | Years, months, days, total days and weeks between two dates | Two native date inputs; both blank by default; result with explanation | Deterministic, leap-year and month-end rules tested against goldens | Calendar days only: **no business days, holidays, time of day or zones** (spec 11 exclusions); no "today" default | KEEP; MINOR IMPROVEMENT ("use today" button would keep determinism) |
| Date Calculator | Add or subtract years, months, weeks, days; weekday of the result | Date plus amounts, Add or Subtract | Weekday and month-end behaviour stated and tested | **Weekdays-only or business-day mode deliberately excluded** (spec 12); whole-number amounts; years 1 to 9999 | KEEP; MINOR IMPROVEMENT (week number panel) |
| Countdown Timer | Count down a duration | Hours/minutes/seconds or presets; start, pause, resume, reset; end time; tab title | Timestamp-based engine; tested against throttled background tabs | One timer, 24 hour limit, no labels or progress ring in v1 (spec 13); no countdown-to-a-date mode | KEEP; IMPORTANT ENHANCEMENT candidate (date mode, large display) |
| Stopwatch | Measure elapsed time | Start, pause, resume, reset, lap | Injected-clock tests; 60 pause cycles equal running time | Max 99:59:59.9; 100 laps; no sound, no multiple stopwatches, no lap export (spec 14 exclusions) | KEEP, NO ACTION |
| Time Zone Converter | Convert a date and time across up to 6 zones; find meeting overlap | Date, time, source zone, destinations; collapsed "Find a time that works for everyone" | Exact-instant engine; DST gap and overlap explained; shareable URL; independent Python reference | Overlap: one hours range per zone, no overnight ranges, one date at a time, at most 6 windows, no people model (spec 19) | KEEP; MINOR IMPROVEMENT (DST notes, link to a planner if built) |
| World Clock | Live multi-city board | Add cities, compare, 12/24 hour; handoff to the converter with cities pre-filled | Reuses the converter engine by import (spec 28, OD6) | No date or time input, no overlap (by design); not on production | KEEP, NO ACTION |
| Hours & Timesheet | Total hours from start/end times and unpaid breaks, overnight allowed | Rows (limit 31), example, totals in h:mm and decimal | Overnight rule stated and tested | No pay, overtime, rounding options, dates, saving; no copy button (spec 23 deferred list) | KEEP; MINOR IMPROVEMENT candidate (copy summary, rounding) |

Spec 23's own status line still says "draft, not implemented" although the tool is published; that documentation drift is listed in `../14-...` (P4).

## Shared code (reuse base)

`time-zone-engine.js` (about 31 KB; exports `parseDate`, `addDays`, `isValidZone`, `canonicalZone`, `offsetSecondsAt`, `wallAt`, `resolveWall`, `describeInZone`, `searchZones`, `GRID_MINUTES = 15`, `MAX_ZONES = 6`, year range 1970 to 2100); `date-engine.js` (`dayNumber`, `daysInMonth`, `isLeapYear`, `addMonths`); `date-arithmetic.js` (`weekdayOf`, `dateFromDayNumber`); `timer-engine.js` and `stopwatch-engine.js` (timestamp-based, fake-clock testable); `hours-engine.js`. World Clock already imports the converter engine, which is the approved pattern for sharing.

## Related navigation and articles

No Time Tool renders related tools or articles (module flags are `false`); neighbours are body-text links (`../04-TIME-TOOLS-ECOSYSTEM.md`). **No Time Tools articles exist.**

## Accessibility, mobile, performance

Specs record keyboard, labelled-control and live-region designs and browser tests at 320 to 390 px. Not verified in this research: current pass results, screen readers, Safari, real devices. Timer tools depend on browser throttling behaviour, which their specs address with timestamp arithmetic.

## Known defects

None recorded for Time Tools in the documents read.
