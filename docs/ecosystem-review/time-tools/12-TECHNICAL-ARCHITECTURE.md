# 12. Technical architecture (no code in this phase)

Constraints: vanilla ES modules, existing catalog and shell, lazy dynamic imports, Eleventy static build, no framework, no backend, no database, no paid API, no new dependency for P0 and P1. Pattern: a **pure engine** (no DOM, injectable clock, golden-tested) and a **thin UI module** per tool, exactly as the existing Time Tools.

## Module plan

| Tool | Directory | Engine (pure) | Imports from existing code | New CSS |
|---|---|---|---|---|
| Business Days | `assets/js/tools/business-days/` | `business-days-engine.js`: weekend mask, holiday set parsing, step and count functions | `date-engine.js` (`dayNumber`, `isLeapYear`), `date-arithmetic.js` (`dateFromDayNumber`, `weekdayOf`) | `assets/css/tools/business-days.css` or the shared time-tools sheet |
| Meeting Planner | `.../meeting-planner/` | `meeting-engine.js`: availability windows (overnight, days of week), candidate scan, per-participant fit table, recurring-shift check | `time-zone-engine.js` by named import (the pattern approved for World Clock, spec 28 OD6): `offsetSecondsAt`, `wallAt`, `isValidZone`, `describeInZone`, `GRID_MINUTES`, `searchZones` | meeting-planner.css |
| Pomodoro and Interval | `.../pomodoro-timer/`, `.../interval-timer/` | **shared** `assets/js/tools/timer-cycle/cycle-engine.js`: build a sequence of `{label, seconds}` and `phaseAt(sequence, elapsedMs)`; Pomodoro and Interval only generate sequences | the timestamp approach of `timer-engine.js` (copy the proven reconcile logic into the cycle engine, or import its functions if they fit; decide while building) | one shared timers sheet |
| Time Duration | `.../time-duration/` | `duration-engine.js`: parse to integer seconds, sum, format | none | small |
| Shift Planner | `.../shift-planner/` | `shift-engine.js`: day-code cycles and day-number indexing | `date-engine.js`, `date-arithmetic.js` | shift-planner.css with a print stylesheet |

A common "time helpers" module is **not** proposed: the shared pieces already exist (date and zone engines) and each new engine needs different functions. Abstraction only when two consumers need the same code, as with the cycle engine.

## Per-tool integration touchpoints (from the PDF batch checklist, `../15-CLAUDE-DEVELOPMENT-HANDOFF.md`)

Catalog entries in `assets/js/data/tools.js` (`sectionId: "time-tools"`, `autoRelated: false`, curated same-section relations, aliases, SEO, capabilities that describe only what is built); `src/_data/toolStyles.json`; Growth ledger records; the inventory generator and regenerated `url-inventory.json`; pinned tests (catalog, sections, relationships, search, taxonomy, taxonomy-root, tool-capabilities); DOM, SEO, links and visual baselines; the Time Tools landing page derives from the catalog (no hard-coded list). Search: add aliases per tool, check both directions (rulebook 5): "timer" and "focus timer" must keep leading with Countdown, "time zone converter" and "meeting time converter" with the converter, "date calculator" and "date difference" unchanged.

## Persistence and state

No storage in any P0 or P1 tool. State that helps a return visit lives in the **URL** (settings for timers, participants for the planner, parameters for date tools), which the converter and World Clock already do. A saved-defaults feature would need a rulebook 7.7 reason and is not proposed.

## Performance and build

Each tool's JavaScript is lazy-loaded by route as the existing tools are. Engines are small (the converter engine is about 31 KB raw). The planner's scan is about 16,000 fit checks for the maximum input; verify in the build phase on the development laptop and record the measured time (never assumed). No change to the static build is needed beyond the new pages.

## Correctness verification approach

Pure engines plus independent oracles (Python `datetime`, `zoneinfo`, `timedelta`, `isocalendar`), committed as JSON goldens with a generator script, the way `time-zone-golden.py`, `fd-golden` and others work. The oracle shares no code with the engine.

## Not proposed

A framework, a backend, accounts, a database, a bundled holiday dataset, a Temporal polyfill, a calendar library.
