# 17. Evidence register

Access date for every row: **2026-10-25**. Tools used: Claude Code WebFetch (page text summarised by a small model: DOCUMENTED-FETCH), WebSearch (SNIPPET), `curl` against the GitHub REST API and raw files (VERIFIED for the fields named). No row means a feature was exercised in a browser.

## Pages fetched successfully

| URL | Result | Use |
|---|---|---|
| https://www.time.is/ | fetched | feature list of time.is |
| https://www.minutebell.com/ | fetched | timer suite features, accuracy statement |
| https://doitberry.com/timers | fetched | five timers, timestamp statement, disclaimer |
| https://www.dateandtime.tools/ | fetched | eight tools including Business Days and World Meeting Planner |
| https://www.smart-stopwatch.com/ | fetched | stopwatch suite; the page's own tool count was inconsistent (six versus nine cards) |
| https://pomofocus.io/ | fetched | Pomodoro product; data storage not stated |
| https://www.worldtimebuddy.com/ | fetched | planner features; working hours not described |
| https://everytimezone.com/ | fetched | timeline planner; plans labelled Pro |

## Pages that could not be read

| URL | Result |
|---|---|
| https://www.timeanddate.com/worldclock/meeting.html, `/date/workdays.html`, `/date/`, `/countdown/`, `/worldclock/` | HTTP 403 for all five; no workaround attempted. Information about timeanddate comes only from search snippets (menus, an app listing) |
| https://clockify.me/timesheet-calculator, https://toggl.com/track/free-tools/ | HTTP 404 (guessed URLs); real URLs not found. Clockify calculator facts come from third-party reviews in a search snippet (Jibble, a competitor, so treat with caution) |

## Searches run (WebSearch, standard mode)

Clockify free timesheet calculator; shift rotation calendar generators; business days calculators; time duration calculators; timeanddate features; DST meeting mistakes; Reddit-style complaints about meeting planners (found only vendor blogs, no user complaints); Clockify free tools; interval timers; Temporal API browser support. Notable result URLs used: https://lists.w3.org/Archives/Public/public-tt/2023Oct/0003.html, https://lists.isocpp.org/sg16/2022/03/3057.php, https://www.oasis-open.org/archives/xacml/201303/msg00012.html, https://tylercipriani.com/archives/2023/10/, https://itime.day/docs/daylight-saving-meeting-checklist, https://www.meetgeek.ai/blog/time-zone-meeting-planner, https://www.teambridge.com/tools/four-on-four-off-schedule-generator, https://www.timetrex.com/resources/2-2-3-employee-schedule-generator, https://www.clock7.com/interval-timer, https://dqydj.com/time-calculator/, https://inchcalculator.com/time-calculator, https://helpingwithmath.com/math-calculators/time-calculator/. The two mailing-list and one blog result are the only user-discussion evidence found.

## GitHub API facts (VERIFIED, 2026-10-25)

Repositories queried: tc39/proposal-temporal, fullcalendar/temporal-polyfill, js-temporal/temporal-polyfill, jkbrzt/rrule, moment/luxon, iamkun/dayjs, date-fns/date-fns, vvo/tzdb, nager/Nager.Date. Fields: licence (SPDX as reported), last push, latest release where present. Details in `11-OPEN-SOURCE-AND-TECHNICAL-REFERENCES.md`. Raw licence files: rrule `LICENCE` (copyright header only seen), js-temporal and date-fns paths returned 404 or other content and are not relied on.

## Repository evidence (VERIFIED)

Specs 11, 12, 13, 14, 19, 23, 28 (statuses, exclusions, limits); source exports of the time engines; the catalog and article data; the earlier review in `../`.

## Limits

No competitor traffic, rank, pricing or retention data. No keyword volumes. Competitor features are as the page described itself; "not stated" is not proof of absence. The Temporal browser-support statement comes from secondary sources and was not checked against MDN or caniuse. GitHub star counts and push dates will change.
