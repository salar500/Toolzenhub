# 05. Complete candidate universe

Every idea in the owner's four groups plus ideas found in research, deduplicated into **product concepts**. "Disposition" is a recommendation, not an approval. Concept IDs are used by later documents.

| ID | Concept | Absorbs (from the lists) | Group | Disposition |
|---|---|---|---|---|
| C01 | World Clock | World Clock, City Time Comparison, Time Difference Between Locations | A | EXISTS (`world-clock`); NO ACTION |
| C02 | Time Zone Converter | Time Zone Converter, DST Transition Checker (as notes) | A | EXISTS; MINOR IMPROVEMENT |
| C03 | Meeting Planner | International Meeting Planner, Working-Hours Overlap, Time Zone Availability Planner, Recurring Global Meeting Planner, Global Team Availability Board, Global Working Hours | A | OWNER-AUTHORIZED; NEW TOOL **only with the multi-person model**, else ENHANCE C02 |
| C04 | DST Transition Checker (as a guide and a converter note) | DST Transition Checker | A | MERGE into C02 and a guide |
| C05 | Countdown Timer | Countdown Timer | B | EXISTS; ENHANCE |
| C06 | Event Countdown | Event Countdown, Date Countdown | B/C | ENHANCE C05 (mode "to a date", URL state) |
| C07 | Stopwatch | Stopwatch, Race/Lap Timer (laps exist) | B | EXISTS; NO ACTION |
| C08 | Multi-Stopwatch and Race Timer | Multi-Stopwatch, Race/Lap Timer (multi-runner) | B | DEFER (excluded in spec 14; no demand evidence for this site) |
| C09 | Pomodoro Focus Timer | Pomodoro, Study Session Timer, Focus Session Summary | B | OWNER-AUTHORIZED; NEW TOOL (cycle engine) |
| C10 | Interval and Routine Timer | Interval Timer, Multi-Stage Routine Timer, Presentation Timer, Sequence Timer | B | NEW TOOL, shares the cycle engine with C09 |
| C11 | Classroom Visual Timer | Classroom Visual Timer | B | ENHANCE C05 (large/full-screen display mode) |
| C12 | Chess Clock and Turn Timer | Chess Clock, Turn Timer | B | DEFER (separate audience, touch-first design) |
| C13 | Alarm Clock | (found in research) | B | DEFER (background alarm reliability and notification permissions are browser-limited) |
| C14 | Speech, breathing, metronome, traffic-light timers | (found in research) | B | REJECT for this ecosystem (not date and time jobs; low fit) |
| C15 | Date Calculator | Date Calculator, Weekday Finder | C | EXISTS; MINOR IMPROVEMENT (week number panel) |
| C16 | Date Difference | Date Difference Calculator | C | EXISTS; MINOR IMPROVEMENT ("use today") |
| C17 | Business Days Calculator | Business Days Calculator, Workdays Between Dates, Deadline Planner, Working-Day Deadline Calculator | C | NEW TOOL (a different model, excluded from C15 and C16 by their specs) |
| C18 | Week Number Calculator | Week Number Calculator | C | MERGE into C15 as a panel, plus a guide |
| C19 | Time Duration Calculator | Time Duration Calculator, Time Duration Adder/Subtractor | C | NEW TOOL (small) |
| C20 | Recurring Date Planner | Recurring Date Planner, Calendar Date Sequence Generator | C | P2: research (recurrence rules; library licence unclear) |
| C21 | Hours & Timesheet Calculator | Hours & Timesheet, Break-Time Calculator, Weekly Hours Planner, Overnight hours | D | EXISTS; MINOR IMPROVEMENT (copy summary, rounding option, both deferred in spec 23) |
| C22 | Shift Schedule Planner | Shift Schedule Planner, Shift Rotation Calendar, Overnight Shift Planner | D | OWNER-AUTHORIZED; NEW TOOL (use case unconfirmed) |
| C23 | Time Block Planner and Workweek Planner | Time Block Planner, Workweek Planner | D | REJECT (calendar-app scope, persistence-heavy) |
| C24 | Schedule Duration Analyzer | Schedule Duration Analyzer | D | REJECT (undefined job) |
| C25 | Epoch and ISO formatter | (found at dateandtime.tools) | other | EXISTS in Developer Tools (Unix Timestamp Converter); NO ACTION here |
| C26 | Sunrise/sunset, calendars | (found at time.is) | other | REJECT (data and astronomy, outside the ecosystem) |

**Count (checked against the table):** 26 concepts, from the 44 candidates the owner listed plus several found in research (alarm clock, speech/breathing/metronome/traffic-light timers, sunrise data, epoch and ISO formatting, calendars). Dispositions: 8 already exist (C01, C02, C05, C07, C15, C16, C21, C25); **6 recommended new standalone pages** (C03 conditional, C09, C10, C17, C19, C22); 4 absorbed into an existing tool or a guide (C04, C06, C11, C18); 1 research-only (C20); 3 deferred (C08, C12, C13); 4 rejected (C14, C23, C24, C26). Enhancements to existing tools therefore come from C02, C05 (with C06 and C11), C15 (with C18), C16 and C21.
