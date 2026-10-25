# 15. Testing and release strategy (for the future build phases)

Follows rulebook section 10 and the low-memory rules: sequential commands, `node --test` on single files (not `npm run test:unit`, which triggers a full build), one browser worker, zero retries, no full regression except the Wave 5 checkpoint, Lighthouse only if authorized. Evidence is recorded in each tool's spec ledger (commit, scope, environment, result), as spec 33 does.

## Per tool

| Layer | Content |
|---|---|
| Unit (pure engine) | Independent oracle golden (Python), fixed edge table, invalid inputs, boundaries, an assertion that the engine has no DOM or network access (existing source-scan pattern) |
| UI | One focused Playwright spec on `subpath-desktop` and `subpath-mobile`: flow, validation messages, reset focus, keyboard, live-region text, three phone widths, no external requests |
| Accessibility | Labelled controls, named Remove buttons, status text not colour-only, focus visible; checks already used by the existing specs |
| Visual | One baseline per new page only if the project convention requires it; no mass screenshots |

## Difficult cases to cover (with the oracle)

| Area | Cases |
|---|---|
| Calendar | Leap day (29 Feb), 28/29/30/31-day month ends, year 1 and 9999 limits, century leap rules (1900 not, 2000 yes) |
| Business days | Start on weekend, on holiday; N = 0; negative N; all-weekend mask refused; holiday on a weekend; duplicate holidays; both start-date conventions stated and tested; Friday-Saturday weekend |
| Time zones and DST | Spring-forward gap and fall-back overlap inside a meeting; US and EU change dates differing by weeks; half-hour (India), 45-minute (Nepal), 30-minute DST (Lord Howe), date line (Kiritimati); zones with no DST; the engine's year range 1970 to 2100 |
| Overnight | Availability and shifts crossing midnight; availability day-of-week attributed to the day the window starts; overnight with a DST change |
| Timers | Phase boundaries exact; pause and resume 60 times; background gap of 10 minutes reconciles once; computer sleep (documented limitation, not tested as a feature); zero-length rest rejected; stage totals |
| Recurrence | Weekly series across two DST transitions; the recurring warning lists exactly the shifted weeks |
| ISO weeks | 31 Dec in week 1 of next year; 1 Jan in week 52/53; years with 53 weeks |
| Durations | Carry across seconds, minutes, hours; negative results; mixed formats; no floating-point drift |

## Per batch (ecosystem)

Search both directions (new aliases must not take the lead on "timer", "focus timer", "time zone converter", "date calculator", "date difference"), routes, catalog and sections pins, related relations (same-section only), static build output, inventory check, links, SEO baseline, the affected existing Time Tools' own specs only where shared code changed (for example the converter spec if the planner touches shared helpers).

## Automatic localized defect workflow

1. Reproduce with a failing test. 2. Find the root cause. 3. Smallest fix. 4. Run the failed test and directly impacted tests only. 5. Record the defect in the spec ledger. 6. Continue. Do not change an expected value to make a test pass; an oracle disagreement is investigated, not suppressed.

## Release gates (unchanged by this plan)

Implemented, locally verified, browser verified are claimed by evidence. Preview push needs the owner's approval for that push; device acceptance needs the owner's real-device checklist; production is the owner's manual deployment. A tool whose spec is draft or whose legal or correctness gates are open is not included in a production package.
