# Defect ledger

Severity: P0 blocks release, P1 before production, P2 should fix, P3 minor. Class: GENUINE, STALE EXPECTATION, TEST FAULT, ENVIRONMENTAL. Entries are consolidated from the checkpoint records; the commit column is where the fix landed (earlier fixes are in the history of `3a8390e`, `e429bf7` and before).

## Open

| ID | Sev | Description | Status |
|---|---|---|---|
| O-1 | P3 (product) | Best SIP Strategies and Tax Saving Guide articles were Coming Soon with no sourced content | RESOLVED 2026-11-05: both written and published (ids 7 and 8). The SIP figures come from the SIP Calculator model and `tests/fixtures/sip-golden.py`; the tax rules come from the frozen, source-cited tax-year 2026-27 configuration and Schedule XV of the Income-tax Act, 2025 as read from the Gazette. No second reviewer (T-15). |
| O-2 | P3 (product) | Currency Converter Coming Soon; needs a live-rates decision | PRODUCT DECISION REQUIRED |
| O-3 | P3 (observation) | Related cards limited to six: Credit Card Payoff and Prepayment no longer appear as automatic related cards on some Loans pages | owner decision; a curated `relatedTools` entry restores either and changes pinned unit expectations |

No open P0, P1 or P2 defect is recorded in the repository. That is a statement about the records, not proof of absence: real devices, Safari and Firefox were never tested.

## Fixed (selected, with class)

| ID | Sev | Class | Description | Fix |
|---|---|---|---|---|
| D-8 | P3 | GENUINE | Date fields showed two calendar icons: the browser's own picker icon and a custom aria-hidden button beside "Use today" (owner finding 3; shared by Age and every date field built with `time-ui.js` or `simple-calculator.js`) | custom button, its wiring and CSS removed; "Use today" kept; regression test added (WP2a) |
| D-9 | P2 | GENUINE (design) | Countdown: the zone field looked blank; the event time had no 12/24-hour choice; the finish beep played once for under a second with no stop control; date mode never made a sound (owner findings 5 to 8) | shared `alert-sound.js` (about 12 s repeating beep, Stop sound, option), zone prefilled, clock choice (WP3a). Decision: 12 s, because the owner suggested 10 to 15 s; sound only after a click on Start (browser rule); a link-restored countdown stays silent |
| D-10 | P2 | GENUINE | All Tools: after a search, deleting the text left the old results standing until the form was submitted (owner finding 22) | input listener in `tools-search.js` restores the page and address (WP5a) |
| D-11 | P2 | GENUINE | Loan Comparison sliders showed grey/uncoloured for 1 to 2 s: the fill variable was set only by `initializeLoanInputs()` after the module downloaded (owner finding 2) | initial `--slider-progress` computed into the generated markup (WP2b) |
| D-12 | P2 | GENUINE | Header active state: "All Tools" was lit only for Calculators pages; PDF Tools, Image Tools, Time Tools, Developer Tools, Labs, Health, Converter and every non-calculator tool showed no active item (owner findings 16 to 18) | `TOOLS_AREA_PAGES` extended and `/tools/` routes included in `header.js` (WP1a) |
| D-13 | P2 | GENUINE | SQL Practice Lab: `ATTACH DATABASE` and `VACUUM INTO` write files into the worker's in-memory file system, which outlives each run's database; a value written in one run was readable in the next (found by a new browser spec, 2026-11-05). Scope: the visitor's own tab only; nothing reaches another visitor or the disk | `sql-runner.js` discards the worker after a statement naming ATTACH or VACUUM; `tests/browser/sql-practice-lab-hardening.spec.js` |
| D-14 | P3 | STALE EXPECTATION | about 12 assertions broke when the section switcher added a sixth `<details>` and a link list to every tool page (FAQ counts, "no link to X" checks), and when the last two articles were published | scoped to `.calculator-info` and to the related cards; counts updated (2026-11-05) |
| D-15 | P2 | GENUINE | AI Prompt Builder: the page was drawn as the one-page form and then hidden for the guided steps, a load layout shift of 0.3247 (2026-11-19, D23) | the guided state is drawn in the markup; shift 0.0001 (`23-GUIDED-PANEL.md` §4) |
| D-16 | P3 | GENUINE | AI Prompt Builder role search: "legal" also matched every role of the "Finance and legal" group, because the filter read group titles | the filter reads only the choice's label and keywords; unit and browser tests |
| D-17 | P3 | GENUINE | AI Prompt Builder task search: a QA engineer typing "api" saw "Design or document an API" above "API tests" | the role's own tasks rank first among the closest matches; browser test |
| D-18 | P2 | GENUINE | AI Prompt Builder first-load JavaScript was 54.4 / 16.6 kB against the D17 budget of 50 / 16 after the D23 redesign (measured with a method that reproduces the recorded D21 figure; D22 itself was 48.1 / 14.6, not the 41.3 repeated in notes) | `roles.js` and the pack file code (`pack-io.js`) load on first use: 46.5 / 14.1 (46.7 / 14.2 with D-19); unit test keeps the first screen's profession count equal to `roles.js` |
| D-19 | P3 | GENUINE (F-1 class) | AI Prompt Builder: a press on the role box before the panel's script arrived (found on the live preview, about 0.9 s on a cold phone-sized load) was lost; the visitor had to press again | `panel.js` opens the list when the box already has focus as it starts; browser test holds `panel.js` back, failed before the fix, passes after |
| D-20 | P2 | GENUINE (owner's UX review, 2026-11-20) | AI Prompt Builder on a phone: after a step change the trail (the chosen role and task, and the way to change them) sat under the sticky section menu, because the scroll check used only the page's scroll padding | the panel's top is scrolled below every bar stuck to the top of the window; browser test on desktop and phone |
| D-21 | P3 | GENUINE (owner's UX review) | AI Prompt Builder spacing: 60 px between the introduction and the panel (the introduction's padding plus 28 px), and 40 px between a field's hint and the buttons (two margins), while the step explanation touched the field | panel margin removed (as on the AI Answer Checker), one gap before the buttons, 12 px under the explanation; browser test measures all three; dark baselines reviewed and updated |
| D-22 | P3 | GENUINE (owner's UX review) | AI Prompt Builder wording: "Tasks for:", "Closest to your words", repeated task names and "Essential: it goes into the prompt…" read as internal terms; the role could be changed only from a truncated trail pill; the one-page form's way back was only at its end | plain step words, "Your role: … Change role" on the task step, wider trail pills with tooltips, "Back to the guided steps" also at the top of the one-page form; browser test covers changing the role and the round trip with every answer kept |
| D-23 | P2 | GENUINE (owner's UX review) | AI Prompt Builder, test scenarios and test cases: a prompt for a website did not ask the AI to look at the site, so it wrote generic e-commerce cases; expected results could be vague ("according to defined behaviour") | an optional website question and exploration rules (Observed or Assumed, what could not be reached, no invented features, say if browsing is impossible); exact expected results, "Blocked – Requirement Confirmation Needed" with its question, assumptions labelled; unit test |
| D-1 | P3 | GENUINE | Breadcrumb Home on contact, privacy, terms, disclaimer, loans was `href="#"` until JS ran | base-aware URL in the five templates (QC-3.2) |
| D-2 | P3 | TEST FAULT | axe sampled the Unit Converter Copy button mid colour transition | scan waits for stable colours (QC-8) |
| D-3 | P2 | GENUINE | Smart Flashcards reset dialog ignored Escape early because the handler loaded after a dynamic import | static import, new same-task Escape test (release-readiness 2026-10-29) |
| D-4 | P2 | TEST FAULT | Split PDF reset-focus assertion was timing-dependent | replaced by a deterministic test (`3a8390e`) |
| D-5 | P2 | GENUINE | axe colour-contrast, link-in-text-block and heading-order findings | fixed in shared styles (QC-5) |
| D-6 | P3 | STALE EXPECTATION | 11 Pack 53 pins, 5 articles pins, 24 navigation pins, DOM/links/SEO baselines | each checked against the new truth and corrected (QC-2 to QC-4) |
| D-7 | P3 | GENUINE (content) | three Pack 53 articles had no cover image | covers created and wired (QC-3.3) |

## Method

For each defect: reproduce, expected versus actual, root cause, check shared consumers, smallest fix, regression test, retest, record here. No test is weakened to pass; a stale expectation is corrected only after checking the new truth.
