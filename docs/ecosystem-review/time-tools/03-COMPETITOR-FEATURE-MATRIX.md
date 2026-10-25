# 03. Competitor feature matrix

Cells: Y = stated on the fetched page (DOCUMENTED-FETCH), s = stated only in a search snippet, - = not stated on the page read (**not** proof of absence), ? = not reached. ToolZenHub column = verified in this repository (specs and source). "Account" notes what the page states about sign-in.

## Planning and global time

| Capability | ToolZenHub today | dateandtime.tools | WorldTimeBuddy | Every Time Zone | timeanddate |
|---|---|---|---|---|---|
| Convert one date and time across zones | Y (up to 6 zones) | Y | Y | Y | ? |
| DST-exact conversion, gap/overlap explained | **Y** (spec 19) | Y (states DST-safe) | - | - | s |
| Overlap of working hours across zones | Y (one range per zone) | Y (Global Working Hours, overnight supported) | - | - | s (traffic-light hours) |
| Per-person availability | - | - | - | - | - |
| Overnight availability | **no** (spec 19 non-goal) | Y | - | - | - |
| Multi-day search for a slot | no | - | - | Y (timeline across days) | - |
| Share link | Y (URL state) | Y | Y | Y | ? |
| Calendar export (.ics / Google) | no | - | Y (buttons) | iCal (Pro) | s (app) |
| Needs account | no | no (stated GET URLs) | optional, to save settings | optional; Pro plans | ? |

## Date calculators

| Capability | ToolZenHub | dateandtime.tools | timeanddate | Typical free business-day pages |
|---|---|---|---|---|
| Date difference (y/m/d, days) | Y | Y | s | - |
| Add/subtract dates | Y | - | s | - |
| Business days, count and add | **no** (deliberately excluded, specs 11 and 12) | Y (optional holidays) | s | Y; holiday data source and start-date counting differ between sites (s) |
| Week number, weekday | weekday Y; week number no | - | s | - |
| Duration add/subtract | no | Time Difference | s (date to date) | s (Inch, DQYDJ, Helping With Math) |

## Timers

| Capability | ToolZenHub | minutebell | DoItBerry | Smart Stopwatch | Pomofocus |
|---|---|---|---|---|---|
| Countdown, presets | Y (24 h limit) | Y (URL slugs, full-screen, sound) | Y | Y (sound, overtime) | - |
| Countdown to a date, shareable | no | Y | - | - | - |
| Pomodoro with cycles | no | Y (long break every 4, auto-start, daily count) | Y | Y | Y (tasks, reports) |
| Interval (work/rest/rounds) | no | Y (Tabata, EMOM) | Y | - | - |
| Sequence/stations | no | Y | - | - | - |
| Visual/classroom display | no | Y (visual, full-screen) | Y (classroom) | - | - |
| Stopwatch with laps | Y (100 laps) | Y | Y | Y (saved sessions) | - |
| Multi-stopwatch / race | no (excluded) | - | - | Y (12 at once, race timer) | - |
| Chess clock / turn timer | no | Y | - | Y | - |
| Sound at end | no (stopwatch excludes sound; countdown not confirmed here) | Y | - | Y | Y |
| Background-tab accuracy stated | Y (timestamp engine, tested) | Y (wall-clock scheduling) | Y (timestamps) | notes throttling | - |
| Account needed | no | no | no | partly (some timers) | optional/unstated |

## Work hours and shifts

| Capability | ToolZenHub | Clockify free calculator (via reviews, s) | ShiftScheduleUp / TeamBridge (s) |
|---|---|---|---|
| Hours from start/end with breaks, overnight | Y | Y | n/a |
| Overtime and pay | no (excluded by design) | Y (rate, overtime) | some pages estimate pay |
| CSV/print export | no | Y | PDF, print, Google Calendar |
| Shift pattern generation (2-2-3, 4-on-4-off, DuPont, Pitman, Kelly) | no | n/a | Y |

## UX opportunities (INFERRED, each marked meaningful or cosmetic)

| Opportunity | Where | Meaningful? | Why |
|---|---|---|---|
| Person-based planning with own hours, overnight and a date range, no sign-in | Meeting Planner | Meaningful | Competitors read in this research are zone-based, or gate sharing; the converter's own limits show the gap |
| One clearly stated business-day convention (what counts as day 1, which weekend, user-entered holidays, no bundled holiday list) | Business Days | Meaningful | Sources disagree on conventions; stating and testing one is checkable |
| Timers that state accuracy behaviour and use a shared cycle engine | Pomodoro, Interval | Partly meaningful | Competitors also claim timestamp accuracy; the difference is a tested claim, not a new feature |
| Printable/exportable cycle with the full 28-day coverage shown | Shift Planner | Meaningful if the use case is confirmed | Competitor snippets note single-cycle views hide coverage |
| Countdown to a date as a mode of the existing timer | Countdown Timer | Meaningful, low cost | Offered by minutebell and time.is |
| Visual themes, colours, sounds menus | any | Cosmetic | no verified task benefit |
