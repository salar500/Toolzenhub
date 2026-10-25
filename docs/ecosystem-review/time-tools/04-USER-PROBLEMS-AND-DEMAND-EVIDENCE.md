# 04. User problems and demand evidence

**No search-volume, traffic, retention or revenue figure was obtained or invented.** Evidence classes: VERIFIED SEARCH DEMAND (none gathered), VERIFIED USER DISCUSSION, VERIFIED COMPETITOR OFFERING, DOCUMENTED REPEAT-USE CASE, REASONED HYPOTHESIS, NO SUPPORTING EVIDENCE. Confidence is the strength of the evidence for the *job*, not a market-size claim.

## Evidence actually found

| Job | Evidence | Class | Confidence |
|---|---|---|---|
| Recurring international meetings shift by an hour when regions change clocks on different dates | W3C public-tt thread (2023-10), ISO C++ SG16 thread (2022-03), OASIS XACML threads (2013 and 2009), a Tyler Cipriani blog post (2023), a vendor checklist and blog (itime.day, MeetGeek); sources agree the mismatch weeks are the risk and that a recurring invite stays correct only if it stores an IANA zone | VERIFIED USER DISCUSSION (mailing lists, one blog) plus vendor copy | Medium for the problem; says nothing about how many use a free planner |
| Finding a meeting time across zones | Seven competitor products and the existing converter's overlap section | VERIFIED COMPETITOR OFFERING | Medium |
| Counting business days and deadlines | Dedicated business-day tools at dateandtime.tools, timeanddate menus (snippet), several free calculators; the snippets disagree on conventions | VERIFIED COMPETITOR OFFERING | Medium; the disagreement is itself the user problem (REASONED HYPOTHESIS) |
| Pomodoro, interval and countdown timers | Offered by every timer suite read (minutebell, DoItBerry, Smart Stopwatch, Pomofocus, Clock7) | VERIFIED COMPETITOR OFFERING | Medium for existence; differentiation weak |
| Shift pattern calendars | Three free generators (snippets) with PDF, print and calendar export; one notes full-coverage cycles are 28 days for 2-2-3 | VERIFIED COMPETITOR OFFERING | Low to medium |
| Adding and subtracting durations | Four calculators (snippets) | VERIFIED COMPETITOR OFFERING | Medium for existence |
| Countdown to an event date | minutebell and time.is offer it with sharing | VERIFIED COMPETITOR OFFERING | Medium |
| Hours and timesheets | Clockify (via reviews), Clockit and others | VERIFIED COMPETITOR OFFERING | Medium |

## What was not found (NO SUPPORTING EVIDENCE)

- Independent complaints about free planners (a Reddit-targeted search returned only vendor blogs).
- Any independent accuracy test of browser timers in background tabs.
- Any measure of how often a visitor returns to a time tool.
- Demand for chess clocks, race timers, multi-stopwatches or speech timers on a site like this.

## Audiences (not all are target audiences)

| Group | Relevant job | Target? |
|---|---|---|
| International teams, freelancers with foreign clients, remote workers | find and communicate meeting times | **Yes**: the clearest recurring job |
| Hourly and shift workers, small employers | hours totals, shift calendars | Yes (existing tool; planner is unconfirmed) |
| Students and knowledge workers | focus cycles, countdowns | Yes for focus cycles, with modest differentiation |
| Teachers | classroom timer, stations | Possible; a display mode of Countdown rather than new pages |
| Fitness users | interval timers | Possible; adjacent, shares engine |
| Event organisers | countdown to a date, recurring dates | Yes, light |
| Developers | time zone, epoch, cron | Already served in Developer Tools |
| Chess, race, sports | specialised clocks | No evidence; not targeted |

## Repeat-use hypotheses (REASONED HYPOTHESIS unless stated)

Recurring meetings and global clocks bring people back weekly; focus timers daily; timesheets weekly; countdowns until the event; business-day and date calculations are mostly one-off. No data supports any frequency. Evidence that would validate: Search Console non-branded queries per page, consent-based GA4 returning-user counts after a tool ships, and a small number of owner interviews.

## Privacy and trust

Competitors that gate sharing or calendar export behind sign-in or Pro (WorldTimeBuddy, Every Time Zone) leave "no account, nothing uploaded, shareable URL" as a stated difference only where it is true. ToolZenHub's existing converter already uses URL state, so the claim is checkable. "No login" is not by itself a differentiator (rulebook 12.5).
