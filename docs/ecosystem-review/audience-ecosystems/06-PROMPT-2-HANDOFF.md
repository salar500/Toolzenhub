# 06. Handoff to Prompt 2 (development)

Read first: rulebook (`docs/product-decision-rules.md`, sections 10, 11 and 15), then `00` (summary), `03` (decisions and R1–R7), `05` (architecture, backlog, acceptance). Recover state from the repository first (rule 11.1); research was done at HEAD `cb9f2c56`.

## Starting conditions

- Branch `feature/unified-ecosystem-workspace`. Commit per stage; push to that branch only after the stage's checks pass (rule 11.3). Never `main`, never Hostinger.
- The research documents in this folder are uncommitted at the end of Prompt 1. Commit them first, as a docs-only commit, once the owner authorises commits for this milestone.
- Any app change invalidates the release candidate `toolzenhub-production-f994b41c.zip`. A new package is built only in Prompt 3.
- Check free memory once before builds and browser runs (rule 10.3 thresholds).

## Stage A: defects (no rule change needed). Start here.

1. B1 XIRR rows: `assets/css/calculators/xirr.css` (line 68 grid), its markup in the XIRR module; container query.
2. B2 lab order: `assets/js/tools/sql-practice-lab/exercises.js` (move ids `sql-…` of exercises 31–38 into their topic blocks), `power-bi-practice-lab/exercises.js` (move the first two "project" items or the last one, whichever keeps the curriculum's sense). First grep `tests/` for pinned exercise numbers. Add a contiguity unit test.
3. B3 time zone: generate `country-zones.js` from tzdb `zone.tab` + `iso3166.tab` (public domain; record the tzdb version); extend `searchZones` and the labels; keep `MAX_ZONES`.
4. B6 finish sound: `assets/js/tools/timer-cycle/cycle-controller.js`.
5. B4 + B5 shared calculator layout and spacing (one pass, one visual review).
6. B7 lab layout in `assets/js/learning/lab-shell.js`.

Stage A done = the B1–B7 acceptance criteria in `05` met, Stage A tests from `05` section 8 run and recorded in `docs/site-audit-ledger.md`, one commit per coherent change group, pushed to the preview, preview spot-checked.

## Stage B: knowledge layer

B8, then B17 candidates (each passes rule 6.1 or is dropped). Official sources and article links can go first; lesson links wait for R7.

## Stage C: hubs, directory, home (needs R1–R4)

B9, B10 (per-entry verification by reading official pages; record `verifiedOn` and `source`), B15.

## Stage D: depth and new tools (needs R5–R6 for B14/B16; Tool Pack specs for B12/B13)

B11, B12, B13, B14, B16.

## Rules of engagement during Prompt 2

- Make routine UI and implementation decisions without asking (rule 7.8).
- Apply R1–R7 to the rulebook only after the owner approves them, in a rules-only commit naming each change.
- If a stage is blocked, record the exact blocker in the ledger and continue with the next independent stage.
- Report at the end of each stage: what changed, what was tested and not tested, rule changes, and the next step.
