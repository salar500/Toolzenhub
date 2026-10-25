# 02. Competitor landscape

Researched 2026-10-25 with the Claude Code web tools. **Evidence labels:** DOCUMENTED-FETCH = the page text was fetched and summarised this session (the page's own words about itself, not hands-on use); SNIPPET = a search-result summary of a third-party page; INFERRED = reasoning from the above. **No competitor feature was exercised in a browser.** No traffic, ranking or pricing data was obtained. Links were fetched or returned by search on the access date; two requested URLs failed and are listed as such.

## Reached and read (DOCUMENTED-FETCH)

| Site and exact URL | Type | What it offers (page's own description) |
|---|---|---|
| time.is, https://www.time.is/ | World clock portal | Time for "more than 7 million locations", comparison page, DST pages, countdown, timer, week-number lookup, Unix clock; sign-up, favourites, ad-free option, mobile app |
| minutebell, https://www.minutebell.com/ | Timer suite | "Free, no accounts, works in your browser, nothing you type is uploaded". Countdown with pretty URLs (`/5-minute`), Loop/Interval timer (work, rest, rounds, start delay; Tabata, EMOM, Pomodoro), Pomodoro (25/5, long break every 4 rounds, auto-start, daily count), Visual timer, Speech timer, Countdown to a Date with shareable link, Sequence timer, Chess clock, Turn timer (2 to 8 players), Alarm, Stopwatch with laps; says timers use wall-clock scheduling so tabs stay accurate |
| DoItBerry, https://doitberry.com/timers | Timer suite | Online timer, Classroom timer (projection), Stopwatch with laps, Pomodoro, Interval timer; says timers compute from timestamps to correct throttling; states they are not certified instruments |
| dateandtime.tools, https://www.dateandtime.tools/ | Date/time utility set | Time Zone Converter (DST-aware), **World Meeting Planner**, **Global Working Hours (overnight supported)**, **Business Days (optional holidays)**, Date Difference, ISO/RFC formatter, Time Difference, Epoch converter; IANA zones, GET-based shareable URLs |
| Smart Stopwatch, https://www.smart-stopwatch.com/ | Timer suite | Stopwatch with laps and saved named sessions, countdown with sound and overtime, **multi-stopwatch (up to 12)**, race timer, chess clock, breathing, Pomodoro; some timers need a free account; shares as text or image |
| Pomofocus, https://pomofocus.io/ | Pomodoro product | Customisable focus/break, task list with pomodoro estimates, reports; premium adds yearly reports, CSV export, integrations, no ads |
| WorldTimeBuddy, https://www.worldtimebuddy.com/ | Meeting planner | Locations added, reordered, home location; hover shows converted times; link to a selected time, copy times, calendar export buttons; optional free sign-in to save settings; weekend marking. The page did not describe working-hours highlighting or a maximum count |
| Every Time Zone, https://everytimezone.com/ | Meeting planner | Timeline rows of zones across several days; share link; iCal sharing marked Pro; Meetings Pro and People Pro plans |

## Reached only through search (SNIPPET, treat as weaker)

| Source | What the snippet says |
|---|---|
| timeanddate.com (menus and an app listing) | Site menus list a Meeting Planner, Date to Date, Business Date to Date (exclude holidays), Date Calculator, Business Date, Weekday and Week Number calculators, Date Pattern Calculator; the iOS Meeting Planner listing describes traffic-light colouring (working, non-working, sleeping hours and public holidays), 15-minute slots, meeting duration, unlimited cities, calendar export |
| ShiftScheduleUp, TeamBridge 4-on-4-off generator, TimeTrex 2-2-3 generator | Free shift-pattern generators: 2-2-3, DuPont, Pitman, 4-on-4-off, Kelly, 24/48; Google Calendar, PDF and print export; no signup (ShiftScheduleUp, TeamBridge). A source notes a full 2-2-3 cycle is 28 days and covering 24/7 takes four crews |
| Business-day calculators (peerlist, t.ly, thecoatlessprofessor, Codeshack, others) | Add/subtract and count modes; holiday sources vary (an API for 166 countries, US federal list, custom list); configurable weekends; the snippets disagree on whether the start date is counted |
| Time and duration calculators (Inch Calculator, Helping With Math, DQYDJ, Vedantu) | Add or subtract durations; multi-row time sums; formats like "1h 20m 15s"; overnight assumptions vary |
| Clockify "free time card calculator" (via third-party reviews, Jibble) | Reviews say 12/24 hour, break durations, overtime rate, print and CSV export. The Clockify page itself was **not** reached (two direct URLs returned 404) |
| Clock7 interval timer, native apps | Browser interval timer with Tabata, HIIT and EMOM presets; says background running depends on browser settings |

## Not reached

- **timeanddate.com pages** (meeting planner, workdays, date index, countdown, world clock): the fetch tool returned HTTP 403 for every URL. No attempt was made to work around the block. Facts about timeanddate come only from search snippets above.
- **Clockify** and **Toggl** free-tool pages: the guessed URLs returned 404; the real URLs were not found. Their SaaS platforms (time tracking products) are a different product from their free calculators and are not assessed.

## Observations that follow (INFERRED)

1. Timer sites are saturated by suites that bundle ten or more timers. A single timer page competes on speed and clarity, not breadth.
2. The strongest free planners (WorldTimeBuddy, Every Time Zone) are people-less: they show zones, not individuals, and gate sharing or calendar features behind sign-in or paid plans.
3. Business-day calculators are numerous and **inconsistent** (holiday source, start-date convention), which makes a clearly stated convention a real differentiator.
4. Shift generators are mostly marketing-funded lead tools of workforce platforms; a no-signup version with stated cycle definitions and printable output exists already (ShiftScheduleUp, TeamBridge), so differentiation must come from correctness, clarity and privacy rather than existence.
