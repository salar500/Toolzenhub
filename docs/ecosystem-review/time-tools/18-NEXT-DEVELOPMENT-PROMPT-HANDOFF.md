# 18. Handoff for the next development session

Read order: `CLAUDE.md`, `docs/product-decision-rules.md` (sections 10, 11, 15), `docs/tool-pack-factory.md`, `../00-EXECUTIVE-SUMMARY.md`, `../14-DECISIONS-AND-OPEN-QUESTIONS.md`, then this folder's `00`, `07`, `08` (only the tool being built), `12`, `14` (the wave) and `15`. Do not repeat the competitor research; update `17` only if new sources are used.

## Recommended first assignment (needs the owner's approval of this scope)

**Wave 0 plus Wave 1A and 1B**, in one task:
1. Record D1 (Batch 2 authorization) and the portfolio in the factory in the same phase (rulebook 15), report the rule change or "none".
2. Write the Meeting Planner Tool Pack spec from `08` section 2. **Gate:** if the spec cannot show the person-based model, stop and propose the converter enhancement instead of building a duplicate.
3. Build the Meeting Planner (engine with Python oracle, UI, catalog, tests), then the shared cycle engine and the Pomodoro Focus Timer. Focused tests, one browser pass, one local commit per tool or one for the batch as the owner states.
4. No push, no deployment, no production, no full regression.

Wave 1C (Shift Planner) waits for the owner to confirm the use case. Wave 2 (Business Days, Time Duration) needs its own approval and could run first if the owner prefers the lower-risk start: Business Days is the best-evidenced gap and the cheapest correct tool.

## Preconditions and facts to reuse

- Existing engines are the reuse base (`12`); import from `time-zone-engine.js` by name, as World Clock does. Do not edit existing tools or specs except through an approved enhancement.
- Catalog integration checklist and pinned tests: `../15-CLAUDE-DEVELOPMENT-HANDOFF.md` ("When a tool is added").
- Aliases: do not take the lead on "timer", "focus timer", "study timer" (Countdown), "time zone converter" (converter), "date calculator" or "date difference". Check search in both directions.
- Related lists stay inside Time Tools; do not add cross-section links; related tools are not displayed on tool pages yet.
- Conventions already chosen: dates blank by default with an explicit "Use today" button; no storage; state in the URL; optional sound off by default; copy buttons for results; honest limits stated on the page.
- Honest claims: no "best", no productivity effects, no claim that Pomodoro beats competitors.

## Decisions still open (defaults in `16`)

T-D1 scope approval, T-D2 name, T-D3 fold-in rule, T-D4 shift use case, T-D5 one or two timer pages, T-D6 sound.

## Definition of done per tool

Engine passes its oracle; edge table passes; UI spec passes at 320 to 390 px; keyboard and live-region behaviour verified; catalog, search, inventory and baselines updated; limitations documented; status stated as implemented, locally verified, browser verified (never device accepted without the owner's checklist).
