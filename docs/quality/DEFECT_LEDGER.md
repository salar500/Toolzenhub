# Defect ledger

Severity: P0 blocks release, P1 before production, P2 should fix, P3 minor. Class: GENUINE, STALE EXPECTATION, TEST FAULT, ENVIRONMENTAL. Entries are consolidated from the checkpoint records; the commit column is where the fix landed (earlier fixes are in the history of `3a8390e`, `e429bf7` and before).

## Open

| ID | Sev | Description | Status |
|---|---|---|---|
| O-1 | P3 (product) | Best SIP Strategies and Tax Saving Guide articles are Coming Soon with no sourced content | PRODUCT DECISION REQUIRED; content must not be invented |
| O-2 | P3 (product) | Currency Converter Coming Soon; needs a live-rates decision | PRODUCT DECISION REQUIRED |
| O-3 | P3 (observation) | Related cards limited to six: Credit Card Payoff and Prepayment no longer appear as automatic related cards on some Loans pages | owner decision; a curated `relatedTools` entry restores either and changes pinned unit expectations |
| O-4 | unknown | Owner-reported items 16, 17, 18 in `MASTER_REGRESSION_CATALOG.md` have no automated assertion | needs the manual pass in `MANUAL_QA_GUIDE.md` to confirm or reproduce; not reproduced here (no browser run this session) |

No open P0, P1 or P2 defect is recorded in the repository. That is a statement about the records, not proof of absence: real devices, Safari and Firefox were never tested.

## Fixed (selected, with class)

| ID | Sev | Class | Description | Fix |
|---|---|---|---|---|
| D-8 | P3 | GENUINE | Date fields showed two calendar icons: the browser's own picker icon and a custom aria-hidden button beside "Use today" (owner finding 3; shared by Age and every date field built with `time-ui.js` or `simple-calculator.js`) | custom button, its wiring and CSS removed; "Use today" kept; regression test added (WP2a) |
| D-9 | P2 | GENUINE (design) | Countdown: the zone field looked blank; the event time had no 12/24-hour choice; the finish beep played once for under a second with no stop control; date mode never made a sound (owner findings 5 to 8) | shared `alert-sound.js` (about 12 s repeating beep, Stop sound, option), zone prefilled, clock choice (WP3a). Decision: 12 s, because the owner suggested 10 to 15 s; sound only after a click on Start (browser rule); a link-restored countdown stays silent |
| D-10 | P2 | GENUINE | All Tools: after a search, deleting the text left the old results standing until the form was submitted (owner finding 22) | input listener in `tools-search.js` restores the page and address (WP5a) |
| D-11 | P2 | GENUINE | Loan Comparison sliders showed grey/uncoloured for 1 to 2 s: the fill variable was set only by `initializeLoanInputs()` after the module downloaded (owner finding 2) | initial `--slider-progress` computed into the generated markup (WP2b) |
| D-1 | P3 | GENUINE | Breadcrumb Home on contact, privacy, terms, disclaimer, loans was `href="#"` until JS ran | base-aware URL in the five templates (QC-3.2) |
| D-2 | P3 | TEST FAULT | axe sampled the Unit Converter Copy button mid colour transition | scan waits for stable colours (QC-8) |
| D-3 | P2 | GENUINE | Smart Flashcards reset dialog ignored Escape early because the handler loaded after a dynamic import | static import, new same-task Escape test (release-readiness 2026-10-29) |
| D-4 | P2 | TEST FAULT | Split PDF reset-focus assertion was timing-dependent | replaced by a deterministic test (`3a8390e`) |
| D-5 | P2 | GENUINE | axe colour-contrast, link-in-text-block and heading-order findings | fixed in shared styles (QC-5) |
| D-6 | P3 | STALE EXPECTATION | 11 Pack 53 pins, 5 articles pins, 24 navigation pins, DOM/links/SEO baselines | each checked against the new truth and corrected (QC-2 to QC-4) |
| D-7 | P3 | GENUINE (content) | three Pack 53 articles had no cover image | covers created and wired (QC-3.3) |

## Method

For each defect: reproduce, expected versus actual, root cause, check shared consumers, smallest fix, regression test, retest, record here. No test is weakened to pass; a stale expectation is corrected only after checking the new truth.
