# 04. Time Tools ecosystem

Scope: the 7 published Time Tools. Batch 2 state is audited below: **International Meeting Planner, Pomodoro Focus Timer and Shift Schedule Planner are NOT implemented** (no catalog entry, no module, no spec, HEAD unchanged since `8ece03a`).

## Built tools and links

| Tool | Route | Neighbours linked in its own text (`getToolById` in the module) | Curated `relatedTools` | Production |
|---|---|---|---|---|
| Date Difference | `/tools/date-difference/` | none | none | 200 |
| Date Calculator | `/tools/date-calculator/` | Date Difference | none | 200 |
| Countdown Timer | `/tools/countdown-timer/` | Stopwatch | Stopwatch | 200 |
| Stopwatch | `/tools/stopwatch/` | Countdown Timer | Countdown Timer | 200 |
| Time Zone Converter | `/tools/time-zone-converter/` | Unix Timestamp Converter (a Developer Tool) | Unix Timestamp Converter | 200 |
| World Clock | `/tools/world-clock/` | Time Zone Converter | Time Zone Converter | **404** |
| Hours & Timesheet Calculator | `/tools/hours-calculator/` | Date Difference | none | 200 |

None of these pages renders a related-tools section (every module exports `showRelatedCalculators = false`). The links above are body text. Time Tools have no articles.

## Journeys

| Journey | Status | Observation |
|---|---|---|
| World Clock to Time Zone Converter | PARTIAL | World Clock links to the converter in text; the converter does not link back. A reciprocal text link or curated relation would be low cost |
| Time Zone Converter to a meeting time | EXISTING | The converter already has a "Find a time that works for everyone" overlap section (spec 19). World Clock deliberately has no planner and hands over to the converter with the cities pre-filled (spec 28, 6.9). The proposed Meeting Planner must add something beyond this (see "Meeting Planner versus Time Zone Converter") |
| Countdown Timer and Stopwatch | EXISTING | Mutual |
| Date Calculator to Date Difference | PARTIAL | One direction; Date Difference does not link back |
| Hours & Timesheet to Date Difference | PARTIAL | One direction; a Shift Planner would extend this |
| Countdown Timer to Pomodoro | PROPOSED | A distinct job only if Pomodoro adds cycles (focus and break); otherwise it is a mode of Countdown |

## Batch 2 status and differentiation (updated 2026-10-25)

**Status of the three tools:** owner-authorized for implementation (14, D1); **not specified, not in the catalog, not built**. Labels below: VERIFIED = read in the repository; PROPOSAL = reasoned, not measured; HYPOTHESIS = demand or usage, unmeasured.

### Meeting Planner versus Time Zone Converter

VERIFIED, from `docs/tool-packs/19-time-zone-converter.md`: the converter already has a collapsed "Find a time that works for everyone" section. It takes the date, up to 6 zones, one preferred-hours range per zone (default 09:00 to 17:00, 15-minute steps), a meeting length (15 to 90 minutes), and lists up to 6 common windows computed from exact instants (DST handled by date). It has copy text and a shareable URL. Its stated limits are the gaps a Meeting Planner could fill:

| Limit of the converter (spec 19) | Possible Meeting Planner capability (PROPOSAL) |
|---|---|
| One range per zone, no notion of a person; no names | Participants, each with a name, a zone and their own hours, several people per zone |
| Overnight preferred hours (22:00 to 02:00) not supported | Overnight availability, for night-shift or split-day participants |
| One date at a time (Previous/Next day buttons) | Search a date range, for example the next 5 working days, and show which days have overlap |
| Hours only; no days of the week | Per-person working days and weekends |
| At most 6 windows, earliest only copied; no "best time" by design | A comparable summary per candidate slot (who is inside hours, who is early or late) without inventing a single score, matching the converter's no-score rule |
| Copy gives the earliest start only | A shareable meeting summary or invite text for the chosen slot |
| One-off | Recurring-series warning when a DST change moves the local time for some participants |

**Verdict (PROPOSAL):** the Meeting Planner is distinct only if its spec commits to the multi-person model (people, individual hours and days, overnight, a date range) and reuses the converter's exact-instant engine instead of re-implementing it. If the spec shows only "overlap windows for several cities", it duplicates the converter and fails the rulebook's duplicate gate; the right form is then an enhancement of the converter. Either way the existing converter keeps its URL, behaviour and tests. World Clock already links to the converter with cities pre-filled; a planner should be reachable from the converter, subject to the same-section related rule.

### Pomodoro Focus Timer versus Countdown Timer

VERIFIED: the Countdown Timer already carries the aliases "focus timer" and "study timer" and leads those queries (spec 13). PROPOSAL: Pomodoro is justified only by automatic focus and break cycles, a long break, a session count or summary and per-phase cues; it must not take the lead on Countdown's queries (rulebook 5.2). Otherwise it is a mode of Countdown. Any saved history needs a rulebook 7.7 reason; start with none.

### Shift Schedule Planner versus Hours & Timesheet Calculator

VERIFIED: the Hours Calculator totals worked hours from start and end times and unpaid breaks, including overnight shifts (spec 23); it plans nothing in advance. PROPOSAL: the planner's distinct job is generating a future rotation (pattern, start date, days on and off, shift times) as a calendar, optionally feeding hours totals as a plain text link. Use case unconfirmed (HYPOTHESIS); confirm it in the spec before any code.

## Findings

| ID | Current problem | Evidence | Recommendation | Priority | Approval |
|---|---|---|---|---|---|
| T1 | The Time Zone Converter's only curated relation crosses into Developer Tools (rulebook 4.2: related lists never cross sections); it is a deliberate one-sentence link in spec 19 | `tools.js`, spec 19 | **Resolved (14, D2): the converter and its link stay unchanged.** When related tools are displayed, the component shows same-section relations only, so the dormant entry never renders | Medium | Display rule needs the Phase B approval |
| T2 | Reciprocal links missing (World Clock, Date Difference) | table above | IMPROVE RELATED NAVIGATION, text or curated; the converter may relate back to World Clock (same section) | Low cost | Phase A |
| T3 | Batch 2 is owner-authorized (14, D1) but not specified or built | repository has no spec | Write one spec per tool, each with a differentiation statement against its neighbour (below) | High | Authorized; each spec is reviewed before build |
| T4 | DST, cross-midnight and timer accuracy are correctness requirements for the Batch 2 tools | the existing time engines and goldens (`date-*-golden`, `time-zone-converter`, `countdown-timer`, `hours-calculator`) are the reusable base | Reuse, do not rebuild; add oracle tests for DST edges | n/a | Within a batch |
| T5 | World Clock is not on production | HTTP 404 | Release remains an owner decision; backup check pending per the owner's memory note | n/a | Owner |

## Opportunity notes (hypotheses)

Business days, working days, deadline and week number look like modes of the Date Calculator, not new pages (see 02 table F). An Interval/Multi-stage Timer overlaps Countdown and Pomodoro and should be decided together with Pomodoro. A DST Transition Checker overlaps the converter and the planner. Persistence (saved zones, history) is not approved by default: the factory's R2 text says browser-local persistence is evaluated separately on user value and upkeep, and rulebook 7.7 requires a reason for any stored data (what spec 28 finally decided was not re-read here).

## Not verified

Timezone, DST and timer behaviour were not re-tested for this review; accessibility and mobile evidence per tool was not audited.
