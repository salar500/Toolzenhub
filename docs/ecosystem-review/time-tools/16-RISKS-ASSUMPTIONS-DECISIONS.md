# 16. Risks, assumptions and decisions

## Risks

| ID | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| R1 | The Meeting Planner duplicates the Time Zone Converter's overlap section | Medium / High (wasted build, duplicate page) | The spec must show the person-based model (08 section 2); otherwise ENHANCE the converter (06) |
| R2 | Pomodoro and Interval are commodities and differentiation is weak | High / Medium | Keep them small, share one engine, make accuracy a tested claim, never claim to beat established apps; do not take Countdown's queries |
| R3 | Business-day conventions (start date counted or not, holidays) confuse users | Medium / Medium | One stated convention, shown in the result and in a guide; user-entered holidays only |
| R4 | Shift presets (2-2-3, DuPont, Pitman, Kelly) are defined differently by different sources | Medium / Medium | Ship only presets confirmed against two published sources; otherwise custom cycles only |
| R5 | Demand for every candidate is unmeasured | High / Medium | Evidence needed is listed in 04; Wave 4 depends on real data |
| R6 | Timer accuracy in background tabs and during sleep | Medium / Medium | Timestamp engine, stated limitation, fake-clock tests; never claim device-level accuracy |
| R7 | Names in planner links are personal data the user shares | Low / Medium | Names optional; copy-link warning; no storage |
| R8 | Scope creep into a calendar app or an account system | Medium / High | Non-goals in 08; rulebook 12 gates |
| R9 | One session cannot finish a wave | High / Low | Resumable work packages with checkpoints (14) |

## Assumptions

1. The existing converter engine and its Python reference remain correct (they carry their own tests; not re-run here).
2. The owner's Batch 2 authorization stands (`../14-...`, D1).
3. Browser `Intl` time-zone data is current enough for 1970 to 2100; the converter already depends on it (spec 19).
4. No new dependency is needed for P0 and P1.
5. Competitor pages describe themselves accurately; none was exercised.

## Decisions made in this research (reasoned, reversible, none an approval)

Business Days is a new tool because specs 11 and 12 exclude it; Event Countdown and the classroom display are modes of Countdown; Week Number is a panel; Multi-stage timers merge into Interval; Weekly Hours Planner, Time Block Planner, Workweek Planner and Schedule Duration Analyzer are rejected or merged; no library is recommended for P0/P1; no persistence in any proposed tool.

## Decisions genuinely needing the owner (material)

| ID | Decision | Default |
|---|---|---|
| T-D1 | Approve the Wave 0 to 3 scope and the six new tools (the next development prompt) | Approve Waves 0 and 1 first, Wave 2 next |
| T-D2 | Keep the name "International Meeting Planner" or shorten to "Meeting Planner" | Keep the authorized name unless the owner prefers the shorter |
| T-D3 | If the Meeting Planner spec cannot show a distinct person-based model, fold it into the converter | Fold it in |
| T-D4 | Confirm the Shift Planner use case (who needs it and why) before it is specified | Specify last in Wave 1 |
| T-D5 | Whether Pomodoro and Interval ship as two pages or one tool with a preset | Two pages, one engine |
| T-D6 | Permission to add sound (optional, off by default) to timers | Allow, generated beep, no audio files |

Pending items from the earlier review (cross-section text mentions, production release of Gratuity and Salary, related-tools pilot approval, documentation drift commit) remain as recorded in `../14-DECISIONS-AND-OPEN-QUESTIONS.md`.
