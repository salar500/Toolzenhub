# 14. Proposed development waves

A proposal, **not an approval**. The next development prompt authorizes a reviewed scope. No dates. Effort uses **relative units**: 1 unit is roughly one complete simple Time Tool phase in this repository (specification, pure engine with oracle, UI, catalog integration, focused tests, documentation), such as the Hours Calculator. Units are for comparing tools, not a time or token estimate, and a single uninterrupted session may not finish more than one wave, so every wave is split into resumable work packages (WP).

## Effort table (complexity bands and assumptions)

| Work | Complexity | Units | New algorithm work | Shared reuse | Main correctness risk | Test complexity |
|---|---|---|---|---|---|---|
| Business Days Calculator | LOW to MEDIUM | 1.0 | day stepping with weekend mask and holidays | date engines | start-date and holiday conventions | Medium: oracle with 500 generated cases |
| Time Duration Calculator | LOW | 0.7 | duration parsing and formatting | none | parsing ambiguity | Low |
| Meeting Planner | HIGH | 2.0 | person availability with overnight and days of week; date-range scan; recurring check | converter engine and its Python reference | DST, half-hour zones, overnight across midnight | High |
| Pomodoro Focus Timer | MEDIUM | 1.2 | cycle engine (shared) | timer approach, Stopwatch announcement pattern | boundaries and hidden-tab reconciliation | Medium (fake clock) |
| Interval and Routine Timer | LOW to MEDIUM after Pomodoro | 0.7 | stage list editor | cycle engine | stage totals | Medium |
| Shift Schedule Planner | MEDIUM | 1.3 | cycle indexing, calendar and print | date engines | preset definitions | Medium |
| Five enhancements | LOW each | 1.5 total | few | existing engines | rounding statement, ISO week | Low |
| Related-tools pilot for Time Tools | MEDIUM | 1.0 | none | existing related component | DOM baselines | Medium (baselines) |
| Guides | LOW each | 0.3 each | none | none | accuracy of examples | Low |

Assumptions: the owner approves each wave; the PDF-batch integration checklist applies; no new dependency; the laptop runs one worker with focused tests only. **Total proposed: about 11 units** plus guides; not a promise of completion in any period.

## Waves

| Wave | Scope | Dependencies | Why this order | Correctness models | UX scope | Testing expectation | Approval needed |
|---|---|---|---|---|---|---|---|
| **0 Preserve and verify** | No code. Record D1 in the factory; fix documentation drift; run the Android/Safari checks the owner chooses for existing Time Tools; keep Time Zone Converter, World Clock and others unchanged | none | Cheap, removes ambiguity before any build | n/a | none | none new | Owner (documentation commit, `../14-...` P4) |
| **1 Finish the authorized tools** | 1A Meeting Planner (spec with the person-based model, then build; if the spec cannot justify it, switch to an enhancement of the converter); 1B Pomodoro Focus Timer plus the shared cycle engine; 1C Shift Schedule Planner after the use case is confirmed | 1A reuses the converter engine; 1B creates the cycle engine; 1C needs preset definitions verified | These are already owner-authorized | Oracles: `zoneinfo` reference; fake-clock goldens; Python cycle oracle | Per `09` | Per-tool focused tests, one batch browser pass | Spec reviews per tool |
| **2 Highest-value distinct utilities** | Business Days Calculator; Time Duration Calculator | Date engines | Business Days fills a gap the existing specs explicitly leave open | `datetime` and `timedelta` oracles | Per `09` | As above | **New tools: owner approval** |
| **3 Strong repeat-use workflows** | Interval and Routine Timer (reuses 1B); Countdown to-a-date and large display; Hours copy and rounding; Date Calculator week panel; Date Difference "use today" | 1B | Cheap once the engine exists | Fake clock; ISO week oracle | Small | Focused | Owner for the new tool and each enhancement |
| **4 Justified advanced or niche** | Research spike for the Recurring Date Planner (recurrence patterns, a small purpose-built engine versus rrule.js licence check); decide on Chess Clock, Multi-Stopwatch and Alarm only if evidence appears | Search Console data after Waves 1 to 3 | Needs data that does not exist yet | RFC 5545 definitions | n/a | Spike only | Owner |
| **5 Ecosystem integration and QA** | Related-tools display pilot for Time Tools (same-section only); guides that pass rulebook 6.1; consolidated regression, Safari, Firefox, Android, screen readers; release decisions | Waves 1 to 3 built | Integration after the tools exist | n/a | Pilot per rulebook 4.8 | Consolidated (the one allowed full pass) | Owner for pilot, release |

## Resumable work packages (example, Business Days)

WP1 spec freeze and fixture table; WP2 oracle script and golden JSON; WP3 engine and unit tests; WP4 UI module and CSS; WP5 catalog, aliases, pinned tests, inventory, baselines; WP6 focused browser spec and documentation; WP7 commit. Each package ends with a checkpoint line in the tool's spec so a new session resumes from it.
