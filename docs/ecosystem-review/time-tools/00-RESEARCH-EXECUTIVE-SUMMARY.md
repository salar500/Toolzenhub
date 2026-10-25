# 00. Time Tools research: executive summary

Research and planning only, 2026-10-25, repository `42b7bb6`. No application code, rulebook, roadmap or Tool Pack was changed. Everything below is a finding or a **recommendation** until the owner approves it. Evidence labels used throughout: VERIFIED (repository or API read this session), DOCUMENTED-FETCH (a competitor's own page text), SNIPPET (search summary), REASONED PROPOSAL, UNVERIFIED HYPOTHESIS.

## Vision

A small, accurate, private Time Tools section whose tools each do one distinct job and whose correctness is checkable: exact date and zone arithmetic, honest timers, and clearly stated conventions. Quality over count.

## State today (VERIFIED)

7 Time Tools are published (World Clock, Time Zone Converter, Countdown Timer, Stopwatch, Date Calculator, Date Difference Calculator, Hours & Timesheet Calculator); World Clock is not on production. The three owner-authorized tools (International Meeting Planner, Pomodoro Focus Timer, Shift Schedule Planner) are **not built and not specified**. No Time Tools article exists. Details: `01`.

## What the research found

1. **Competitor base:** 8 sites read (time.is, minutebell, DoItBerry, dateandtime.tools, Smart Stopwatch, Pomofocus, WorldTimeBuddy, Every Time Zone), plus snippet-level evidence on timeanddate (its pages returned HTTP 403 and were not read), Clockify (via reviews), shift generators, business-day and duration calculators. Nothing was exercised in a browser (`02`, `17`).
2. **The Meeting Planner overlaps the converter.** Tool Pack 19 already contains a meeting-overlap section. The planner is justified only by a person-based model (names, own hours and days, overnight, date-range scan, recurring-series DST warning); otherwise it should be an enhancement of the converter (`06`, `08`).
3. **Business days is the clearest gap.** The Date Calculator and Date Difference specs explicitly exclude it, competitors offer it, and their holiday and start-date conventions disagree (snippets). A stated, tested convention is the product.
4. **Timers are a crowded commodity.** Every suite offers Pomodoro, interval and countdown-to-date. ToolZenHub can compete on tested accuracy, URL-shareable settings and clarity, not on novelty. The Countdown Timer already leads "focus timer" and "study timer" queries.
5. **User-discussion evidence exists only for one job:** recurring meetings shifting by an hour when regions change clocks on different dates (W3C, ISO C++ and OASIS mailing-list threads, a blog). For everything else the evidence is that competitors offer it (`04`).
6. **No demand figures were obtained.** No search volumes, traffic, retention or revenue data. Evidence that would validate each opportunity is listed in `04`.

## Recommended portfolio (`07`)

Preserve all 7 existing tools. Build **6 new tools**: Business Days Calculator (P0), Meeting Planner (P0, conditional), Pomodoro Focus Timer (P1), Interval and Routine Timer (P1), Time Duration Calculator (P1), Shift Schedule Planner (P1, use case unconfirmed). Enhance 5 existing tools (Countdown, Date Calculator, Date Difference, Hours, Converter). Research one more (Recurring Date Planner). Defer Chess Clock, Multi-Stopwatch, Alarm. Reject speech/breathing/metronome timers, time-block and workweek planners, schedule analyzer. Result: 13 tools. 44 candidates were deduplicated into 26 concepts (`05`).

## Effort and order (`14`)

About 11 relative units (one unit is roughly one complete simple tool phase), in waves: 0 preserve and record; 1 finish the authorized tools; 2 Business Days and Time Duration; 3 repeat-use enhancements and the Interval Timer; 4 research spikes; 5 integration, QA and release decisions. No dates; a single session may not finish a wave, so work packages are resumable.

## Technical stance (`11`, `12`)

No new dependency and no replacement of existing code: the vanilla date, zone and timer engines are the reuse base; new pure engines plus Python oracles. Native Temporal is not relied on (Safari support unconfirmed). External holiday APIs are rejected for privacy. No persistence; state in the URL.

## Confidence

| Area | Confidence | Why |
|---|---|---|
| Existing tool inventory, limits and exclusions | High | Specs and source read |
| Overlap with the converter; business days as a gap | High | Specs state it |
| Competitor feature lists | Medium | Page text only; some sites unreadable |
| Demand and repeat use | Low | No data |
| Shift Planner use case | Low | Competitors exist; no evidence of need here |
| Effort estimates | Low to medium | Relative units from one comparable phase |

## Highest-value differentiators (specific, checkable)

Stated and tested business-day convention; person-based availability with overnight hours and no sign-in; DST-exact results from an independently verified engine; timestamp-accurate timers with tested background behaviour; URL-shareable settings with no storage.

## Open decisions and next step

T-D1 to T-D6 in `16`; earlier pending items in `../14-DECISIONS-AND-OPEN-QUESTIONS.md`. The next development assignment can start from `18` once the owner approves the Wave 0 and Wave 1 scope.

## Documents

`00` to `18` in this folder; `07` portfolio, `08` requirements, `12` architecture and `18` handoff are the ones the next session needs.
