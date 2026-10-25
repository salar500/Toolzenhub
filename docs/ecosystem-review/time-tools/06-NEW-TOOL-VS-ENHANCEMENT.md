# 06. New tool versus enhancement

Options per rulebook-style order: (A) already available, (B) improve existing, (C) add a mode, (D) distinct new tool, (E) guide, (F) defer or reject. The overlap questions the owner asked are answered first.

## Overlap matrix

| Pair | Verified overlap | Decision | Reason |
|---|---|---|---|
| World Clock vs Time Zone Converter | World Clock has no date/time input, no hours, no overlap, no wall-time resolution (spec 28 boundary rules); it hands off to the converter | Keep both | Live board versus exact-date calculation |
| Time Zone Converter vs Meeting Planner | The converter already finds shared times for up to 6 zones with one range per zone (spec 19) | **Meeting Planner is a new tool only if it is person-based**: names, own hours and days, overnight, a date-range search, a recurring-series DST warning. Otherwise ENHANCE the converter | Avoids a duplicate page (rulebook 12 gate) |
| Countdown vs Event Countdown | Countdown counts a duration; a date target is a different input | ENHANCE Countdown with a "to a date and time" mode and URL state | Same job family, one page, no keyword duplicate |
| Countdown vs Pomodoro | Countdown is one timer, no cycles (spec 13); "focus timer" and "study timer" are Countdown aliases | Pomodoro as a new page built on a cycle engine, **must not take the lead on Countdown's queries** | Cycles, long break and session count are not a Countdown mode |
| Pomodoro vs Interval Timer | Both are repeated work/rest sequences; Pomodoro is a fixed 25/5 pattern with a long break; interval is arbitrary work/rest with rounds | Two pages, one shared engine; Pomodoro could later be a preset of Interval if the owner prefers one page | Different audiences and defaults; shared code removes the cost |
| Interval vs Multi-Stage Routine Timer | A multi-stage routine is an interval timer with named stages of different lengths | MERGE into one "Interval and Routine Timer" | Same engine, same screen |
| Date Calculator vs Deadline Planner | A deadline in business days needs a working-day model that spec 12 deliberately excluded | Deadline becomes a mode of the Business Days tool | One model, one page |
| Date Difference vs Business Days | Spec 11 excludes business days and holidays | Business Days is a new tool; Date Difference gets a link, not the feature | The specs already say business days needs its own clear model |
| Shift Planner vs Shift Rotation Calendar | Same concept | MERGE | |
| Hours & Timesheet vs Weekly Hours Planner | Hours tool totals entered times; a weekly planner mostly re-presents those rows | NO new tool; ENHANCE hours with copy summary and an optional rounding | Avoids a duplicate |
| Time Duration Calculator vs Time Duration Adder | Same job | MERGE | |
| Time Duration vs Hours & Timesheet | Hours takes clock times and breaks; durations take lengths such as 1h 20m | Separate small tool | Different input type; searches differ (hypothesis) |
| Week Number vs Date Calculator | Date Calculator already shows the weekday of a result | PANEL in Date Calculator plus a guide | Tiny job, no page |
| DST Transition Checker vs Time Zone Converter | The converter already explains gaps and overlaps by date | MERGE into converter notes and a guide | |

## Decisions summary

| Capability | Option |
|---|---|
| Person-based meeting scheduling | D (new), conditional; else B |
| Business days, workdays, deadlines | D (new) |
| Pomodoro | D (new), shared engine |
| Interval and routine timer | D (new), shared engine |
| Shift schedule patterns | D (new), use case to confirm |
| Time duration add/subtract | D (new, small) |
| Event countdown, large display | C (modes of Countdown) |
| Week number | C (panel in Date Calculator) + E |
| "Use today" on Date Difference | B |
| Copy summary and rounding on Hours | B |
| DST gaps and overlaps | E (guide) + B (converter note) |
| Chess clock, multi-stopwatch, alarm | F (defer) |
| Time blocks, workweek planner, schedule analyzer | F (reject) |
| Recurring dates | F (research) |
