# 07. Prioritized tool portfolio

Recommended priorities, **not** changes to the approved roadmap and not an authorization to build. Scoring uses the rulebook's section 12 dimensions (0 to 5; weights search 25, repeat 25, usefulness 20, differentiation 10, feasibility 10, trust and performance 10). **All scores are judgment; evidence confidence is shown separately and is mostly low** (`04-USER-PROBLEMS-AND-DEMAND-EVIDENCE.md`). A weighted total is a decision aid, never a measurement.

Priority classes: P0 strong immediate candidate; P1 good next wave; P2 research or lower; ENHANCE; MERGE; DEFER; REJECT.

## A. Scored new-tool candidates

| ID | Candidate | Search | Repeat | Useful | Diff | Feasible | Trust | Weighted /100 | Recommended priority | Evidence confidence |
|---|---|---|---|---|---|---|---|---|---|---|
| C09 | Pomodoro Focus Timer | 4 | 4 | 3 | 1 | 4 | 4 | 70 | P1 (owner-authorized) | Medium that it is offered, Low for differentiation |
| C17 | Business Days Calculator | 4 | 2 | 4 | 3 | 4 | 4 | 68 | P0 | Medium |
| C03 | Meeting Planner (person-based) | 3 | 3 | 4 | 2 | 3 | 4 | 64 | P0 (conditional) | Medium for the problem, Low for demand |
| C10 | Interval and Routine Timer | 3 | 3 | 3 | 2 | 4 | 4 | 62 | P1 | Medium (offered everywhere), Low for demand here |
| C19 | Time Duration Calculator | 3 | 2 | 3 | 2 | 5 | 5 | 61 | P1 | Medium that it is offered, Low for demand |
| C22 | Shift Schedule Planner | 2 | 3 | 3 | 3 | 3 | 4 | 57 | P1 (owner-authorized, use case unconfirmed) | Low |
| C20 | Recurring Date Planner | 2 | 2 | 3 | 2 | 2 | 3 | 46 | P2 | Low |

Why the order is not the score order: Pomodoro scores highest because search and repeat use are guessed high for a commodity, but differentiation is 1 and the duplicate-gate question against the Countdown Timer is open (`../14-DECISIONS-AND-OPEN-QUESTIONS.md`, D6). It is owner-authorized, so it is built, but after the Business Days tool and built together with the Interval Timer so the shared engine is paid for once. The Meeting Planner is P0 only on its conditional model; if the spec cannot show the person-based workflow it becomes an enhancement of the converter.

## B. The recommended final Time Tools portfolio

| Class | Tools |
|---|---|
| Existing, preserved (7) | World Clock, Time Zone Converter, Countdown Timer, Stopwatch, Date Calculator, Date Difference Calculator, Hours & Timesheet Calculator |
| New, recommended (6) | Business Days Calculator (P0); Meeting Planner (P0, conditional); Pomodoro Focus Timer (P1); Interval and Routine Timer (P1); Time Duration Calculator (P1); Shift Schedule Planner (P1) |
| Research only (1) | Recurring Date Planner (P2) |
| Enhancements to existing (5 tools) | Countdown Timer (to-a-date mode, large display), Date Calculator (week number panel), Date Difference (use today), Hours & Timesheet (copy summary, optional rounding), Time Zone Converter (DST notes, a same-section link to the planner) |
| Deferred | Chess Clock and Turn Timer, Multi-Stopwatch and Race Timer, Alarm Clock |
| Rejected | Speech, breathing, metronome and traffic-light timers; Time Block and Workweek Planner; Schedule Duration Analyzer; sunrise and calendar pages |

Result: a Time Tools section of **13 tools** (7 existing plus 6 new), 6 of them new. That is the whole proposal; it is not padded to a count.

## C. Enhancements ranked

| Rank | Enhancement | Value | Cost | Risk |
|---|---|---|---|---|
| 1 | Countdown to a date and large display mode | Medium: offered by competitors, event use | Low to medium: reuses the timer engine and date engine | Low |
| 2 | Hours & Timesheet copy summary and rounding option | Medium | Low | Low (rounding must be explicit and stated) |
| 3 | Date Calculator week-number panel | Low to medium | Low | ISO-week correctness: use a published definition and an independent oracle |
| 4 | Date Difference "use today" button | Low | Trivial | Keeps determinism: the field is never filled silently |
| 5 | Converter DST note and planner link | Low | Low | None |

## D. Why each recommended tool matters (one line)

Business Days: the existing specs exclude it, competitors disagree on conventions, so a stated and tested convention is the product. Meeting Planner: the recurring-meeting DST failure is documented in user discussions, and the converter covers zones but not people. Pomodoro and Interval: an in-demand commodity category that ToolZenHub lacks, cheap because the engine is shared and the timing approach is already proven. Time Duration: a small gap between the Date and Hours tools. Shift Planner: the owner's authorized idea, with documented competitor generators, pending a use-case check.
