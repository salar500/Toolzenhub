# 11. Open-source and technical references (provenance register)

Checked 2026-10-25. **Verified** fields come from the GitHub REST API (licence field, last push, latest release) or a raw licence file fetched this session. "Not verified" means the API did not report it or a file was not found; nothing was assumed. No code is copied and **no dependency is recommended for any P0 or P1 tool**: the existing vanilla engines cover the arithmetic (see 12), and each library below would add size, licence obligations and a maintenance burden for little gain.

| Reference | URL | Licence (verified?) | Version / activity (verified) | Relevant to | Suitability for ToolZenHub |
|---|---|---|---|---|---|
| Temporal proposal and spec (TC39) | https://github.com/tc39/proposal-temporal | API reports NOASSERTION (not verified) | pushed 2026-10-22, 3.7k stars | Date and time arithmetic design reference | Reference for semantics only. Native support is browser-dependent: secondary sources in search results say Chrome (v144, Jan 2026) and Firefox (v139, May 2025) shipped it and Safari had not shipped it stably as of March 2026 (not confirmed against MDN). **Do not rely on native Temporal** |
| js-temporal polyfill | https://github.com/js-temporal/temporal-polyfill | ISC (API) | pushed 2026-09-22; no GitHub release object | Fallback for Temporal | Not needed: existing engine is exact and tested; adds bundle weight |
| FullCalendar temporal-polyfill | https://github.com/fullcalendar/temporal-polyfill | Not verified (API none; raw LICENSE not found at `main`) | release `temporal-polyfill@1.0.6`, 2026-10-13 | Smaller Temporal polyfill | Same conclusion; licence unverified, so it cannot be adopted without a check |
| Luxon | https://github.com/moment/luxon | MIT (API) | pushed 2026-08-09; 16k stars | Zones, durations, ISO weeks | Not needed; would duplicate the converter's engine |
| Day.js | https://github.com/iamkun/dayjs | MIT (API) | pushed 2026-09-15; 48k stars | Light date library | Not needed |
| date-fns | https://github.com/date-fns/date-fns | Not verified (API reported none) | pushed 2026-10-24 | Date arithmetic helpers | Not needed |
| rrule.js | https://github.com/jkbrzt/rrule | API NOASSERTION; the `LICENCE` file begins with a copyright notice by Jakub Roztocil and Lars Schoning; licence type **not verified** | latest release v2.7.1 (2022-07-14); last push 2024-06-27 | Recurrence rules (RFC 5545) for a future Recurring Date Planner | Maintenance and licence questions; a small purpose-built engine for a few patterns is likelier. Research item only (P2) |
| vvo/tzdb | https://github.com/vvo/tzdb | MIT (API) | pushed 2026-10-19 | JSON of IANA zones with names | Not needed: the converter already lists zones from the browser (`listZones`, VERIFIED) |
| Nager.Date | https://github.com/nager/Nager.Date | MIT (API) | pushed 2026-10-22 | Public-holiday data and API | **Rejected for use**: an external API breaks browser-local privacy; bundled holiday tables go stale (rulebook 13). Business Days uses user-entered holidays |
| IANA time zone database | https://www.iana.org/time-zones | Documented as public-domain data; not fetched here | maintained continuously | Source of DST rules | Reached through the browser's `Intl`, as the existing engine does; no bundled copy |
| ISO 8601 week definition | ISO 8601 | standard | n/a | Week number panel | Implement the published rule (week 1 contains the first Thursday); oracle: Python `date.isocalendar()` |

## Browser facts that matter

Timers must be timestamp-based, not tick-counting: browsers throttle background tabs. The Countdown and Stopwatch engines already do this and are tested with a paused fake clock (VERIFIED, specs 13 and 14). Competitor pages state the same approach (minutebell, DoItBerry: DOCUMENTED-FETCH), and Clock7's page says background sound and notifications depend on browser settings (snippet). No independent accuracy test was found. Notifications and audio need user permission and a user gesture; both stay optional.

## Reusable code inside the repository (inspected first, per instruction)

`time-zone-engine.js` (31 KB): zone validation, offsets by instant, wall-time resolution, meeting windows by exact instant with a 15-minute grid and an independent Python reference (`tests/fixtures/time-zone-golden.py`). `date-engine.js` and `date-arithmetic.js`: day numbers, leap years, month ends, weekdays (Hinnant's algorithms). `timer-engine.js` and `stopwatch-engine.js`: timestamp-based timing with injected clocks. **Conclusion: replace nothing.** Gaps are new pure modules (business-day stepping, cycle sequencing, shift patterns, duration parsing) and a person-based extension of the meeting fit rule.
