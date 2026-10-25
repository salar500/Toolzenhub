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
| Time Zone Converter to a meeting plan | PROPOSED | The planned Meeting Planner is the missing step. Rulebook R2 says the World Clock deliberately has no planner or conversion |
| Countdown Timer and Stopwatch | EXISTING | Mutual |
| Date Calculator to Date Difference | PARTIAL | One direction; Date Difference does not link back |
| Hours & Timesheet to Date Difference | PARTIAL | One direction; a Shift Planner would extend this |
| Countdown Timer to Pomodoro | PROPOSED | A distinct job only if Pomodoro adds cycles (focus and break); otherwise it is a mode of Countdown |

## Findings

| ID | Current problem | Evidence | Recommendation | Priority | Approval |
|---|---|---|---|---|---|
| T1 | The Time Zone Converter's only curated relation crosses into Developer Tools (rulebook 4.2: related lists never cross sections) | `tools.js`, `time-zone-converter` entry | Report to owner: either keep as text-only, or replace with a same-section relation (World Clock). This phase does not change it | Medium | Owner (rule conflict, section 14) |
| T2 | Reciprocal links missing (World Clock, Date Difference) | table above | IMPROVE RELATED NAVIGATION, text or curated | Low cost | Phase A |
| T3 | Batch 2 tools approved only by prompt statement, not recorded, not specified | repository has no spec | Record the decision, then write specs; each tool needs a differentiation statement against its existing neighbour (see 02) | High when approved | Owner |
| T4 | DST, cross-midnight and timer accuracy are correctness requirements for the Batch 2 tools | the existing time engines and goldens (`date-*-golden`, `time-zone-converter`, `countdown-timer`, `hours-calculator`) are the reusable base | Reuse, do not rebuild; add oracle tests for DST edges | n/a | Within a batch |
| T5 | World Clock is not on production | HTTP 404 | Release remains an owner decision; backup check pending per the owner's memory note | n/a | Owner |

## Opportunity notes (hypotheses)

Business days, working days, deadline and week number look like modes of the Date Calculator, not new pages (see 02 table F). An Interval/Multi-stage Timer overlaps Countdown and Pomodoro and should be decided together with Pomodoro. A DST Transition Checker overlaps the converter and the planner. Persistence (saved zones, history) is not approved by default: the factory's R2 text says browser-local persistence is evaluated separately on user value and upkeep, and rulebook 7.7 requires a reason for any stored data (what spec 28 finally decided was not re-read here).

## Not verified

Timezone, DST and timer behaviour were not re-tested for this review; accessibility and mobile evidence per tool was not audited.
