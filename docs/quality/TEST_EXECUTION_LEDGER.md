# Test execution ledger (quality view)

Detailed per-spec history lives in `docs/ecosystem-review/universal-expansion/11-DEVELOPMENT-LEDGER.md` (QC-1 to QC-9, RELEASE-1) and earlier ledgers listed in `TECHNICAL_DEBT.md`. This file records each run with the commit it ran against, and what is carried forward.

Environment: Windows 10, about 4 GB RAM (1.16 GB free at the start of Q3-1), system Chrome via Playwright, one worker. No stale node or chrome processes at start.

## Q3-1 (2026-11-04), commit f5a1df4, tree clean, `origin/main` = HEAD (0 ahead, 0 behind)

| Run | Command | Scope | Result |
|---|---|---|---|
| Build | `npm run build:all` | both builds | pass |
| Links | `npm run test:links` | both bases | pass |
| Assets | `npm run test:assets` | both bases | pass; 4 legacy files unreachable (informational) |
| SEO | `npm run test:seo` | both bases | pass: 127 pages, 126 sitemap URLs, canonical `https://toolzenhub.in` |
| Inventory | `npm run inventory:check` | | pass: 126 live, 1 x 404, 3 Coming Soon not routes |
| Package | zip vs fresh `dist/` | file list and sizes | `ToolZenHub-hostinger-dist-20261103-1428.zip` SHA-256 `A12191702E...DBE42` matches the RELEASE-1 record; its 610 files all exist in a fresh `dist/` with identical sizes (content hashes not compared) |
| Preview | HTTP GET of `salar500.github.io/Toolzenhub` | `/`, `/calculators/ratio/`, an article, a cover image, `sitemap.xml`, `robots.txt` | all 200. Not a workflow result and not a browser check |

Skipped, interrupted: none. Failed: none.

## Q3-2 (WP2a, duplicate date icon), base `b342344` plus uncommitted change, committed after this run

| Run | Command | Result |
|---|---|---|
| Unit | `node --test tests/unit/simple-calculators.test.mjs tests/unit/date-difference-presets.test.mjs` | 39 pass |
| Build | `npm run build:all` | pass |
| Browser, subpath-desktop, 1 worker | `simple-calculators.spec.js`, `time-tools-new.spec.js`, `date-difference.spec.js` (all consumers of the changed date helpers that exercise them) | 66 pass, 0 fail, 0 skipped |

Not run: the other date-field consumers (`business-days`, `countdown-timer` date mode, `gratuity`, `xirr`) use the same markup helper but have no date-icon assertion; mobile project not run for this change.

## Q3-3 (WP3a, Countdown Timer), base `e49b020` plus uncommitted change, committed after this run

| Run | Command | Result |
|---|---|---|
| Unit | `node --test tests/unit/countdown-target.test.mjs` | 11 pass |
| Build | `npm run build:all` | pass (first attempt failed: the new module touched `window` at import, fixed) |
| Browser, subpath-desktop, 1 worker | `time-tools-enhancements.spec.js`, `countdown-timer.spec.js` | 42 pass (4 new tests) |
| Browser, subpath-mobile | same two specs | 42 pass |
| Axe | `site-a11y.spec.js -g countdown` desktop | 1 pass |

Pins changed deliberately: `countdown-timer.spec.js` finish state now lists "Stop sound" (the reminder sounds); two date-mode assertions now state the clock format. Not run: other time tools; no real-audio check (a fake Web Audio counts tones), so audibility is manual.

## Q3-4 (WP5a, All Tools search clearing), base `b8dbc2b` plus uncommitted change

Build pass. `navigation.spec.js` subpath-desktop 45 pass, 2 skipped by design (0 fail), one new test; subpath-mobile: the new test only. Time-tool sound audit (no code change): Stopwatch, Business Days, Time Duration and Shift Planner have no sound by design; Pomodoro and Interval share `cycle-controller.js`, which already has an opt-in single beep and a checkbox.

## Q3-5 (WP2b, Loan Comparison slider fill), base `e9d7c27` plus uncommitted change

Build pass. `loan-comparison.spec.js` subpath-desktop 20 pass (1 new, JavaScript disabled); subpath-mobile new test pass; `dom-baseline.spec.js` desktop 16 pass (no baseline changed). First attempt of the new test failed because my edit had put the style on the number input instead of the slider; found by the test, fixed.

## Q3-6 (WP1a, header active state), base `f541efa` plus uncommitted change

Build pass. `navigation.spec.js` subpath-desktop 46 pass, 2 skipped by design (1 new test, 17 pages); `dom-baseline.spec.js` desktop 16 pass. Not run: mobile menu (same script and links), the root-base project (its portable subset does not include this test).

## Q3-7 (WP4a, JSON line numbers), base `d4c4b04` plus uncommitted change

Build pass. New `line-gutter.spec.js` (3 tests, repeated 4 times on each project: 12 pass each). Consumers: `json-formatter`, `json-formatter-indent`, `json-compare`, `line-gutter` desktop 51 pass; `json-formatter`, `json-compare`, `line-gutter` mobile 47 pass; axe and 820 px sweeps for the two pages 4 pass. Faults found by the tests and fixed: a compare error state without an `error` object threw in my marker call (the 1,000,000-character limit test caught it); the new spec raced the tool's start (now waits for the gutters); the output gutter was taller than its box until the wrapper became a flex column. Screenshots of both pages viewed (desktop and 390 px). Not run: `text-diff`, which does not use the gutter.

## Q3-8 (WP4b, JSON suggested fixes), base `eab0705` plus uncommitted change

Unit: `json-suggested-fix.test.mjs` 12 pass; full unit suite run once because the CSS custom-property test is global: 3,718 pass, 1 fail, 4 skipped (3,723). The 1 failure was `design-tokens.test.mjs` (my new `--lg-*` variables were set only by script); defaults moved into the stylesheet and that file re-run: 9 pass. The full suite was not re-run afterwards (the fix touched one stylesheet). Build pass. Browser subpath-desktop: `json-formatter` (29 with 6 new), `line-gutter`, `json-compare`: all pass after the CSS fix; mobile `json-formatter` 29 pass; axe on json-formatter 1 pass.

## Q3-9 (consolidation at the end of the Q3 cycle), base `b714e57` plus the records commit

Static layer re-run on the final tree: `build:all`, links, assets, SEO, inventory all exit 0. `smoke.spec.js` subpath-desktop (every live page: status, title, images, console and network errors; shared `header.js` changed in WP1a): 143 pass. Not run at this checkpoint: the full unit suite after the CSS default fix (design-tokens re-run alone, 9 pass; the last full run was 3,718 pass, 1 fail since fixed, 4 skipped), the mobile and root projects for the whole site, the axe sweep of all 126 pages, visual baselines. These are the release-checkpoint items in `RELEASE_LEDGER.md`.

## Q3-10 (Phase C, Practice Labs as a section), base `9dc8987` plus uncommitted change

Shared catalog change (sections, tool `sectionId`, icons, directory pages), so consumers were tested. Unit: full suite 3,723 tests, 3,719 pass, 0 fail, 4 skipped after six stale section pins were updated deliberately. Static: `build:all`, links, assets, SEO, inventory exit 0 (126 pages, URLs unchanged). Browser subpath-desktop: `navigation` (+1 new test), `developer-tools-related` (+5 new), `smart-flashcards`, `dom-baseline`, `links`, `seo-baseline`, `learning-a11y` all pass after pins and baselines were updated; axe and 820 px sweeps for the hub, developer-tools, home and categories pass; subpath-mobile `navigation`, `developer-tools-related`, `smart-flashcards` 89 pass; root-desktop `navigation` 7 pass. Baselines accepted after diffing: DOM footer, home and tools-directory (Practice Labs link, card, rail row and group; Developer Tools 17 to 12), links (+1 internal link per page, +3 on Home), SEO (visibleTextChars only). Not run: `learning-widths`, `learning-resilience` (layout unchanged), visual baselines.

## Q3-11 (Phase B, "More <section>" switcher), base Phase C commit plus uncommitted change

New `section-switcher` component (native details of same-section links under every tool breadcrumb; build-time only). New `section-switcher.spec.js` 8 pass desktop. Consumers: `dom-baseline`, `smoke`, `site-a11y` desktop 285 pass; `site-tablet` 126 pass. Mobile run of emi, stopwatch, pdf-tools, image-compressor-resizer found five stale pins (section order and counts after Practice Labs, plus link and details counts now including the switcher); corrected and re-run on desktop (image-compressor-resizer, pdf-tools, stopwatch: all pass). The mobile project was not re-run after the pin fixes, and `loan-comparison` mobile did not complete (run stopped). An orphaned Playwright process held port 4173 until stopped by hand.

## Carried forward (not re-run at f5a1df4)

These ran on the working tree that was committed as `6b01b85`..`f5a1df4` (RELEASE-1 records HEAD `45fc888` plus 102 uncommitted entries, 5,597 insertions across 102 files, now in the three commits). That equivalence is inferred from the records and a clean tree; it was not proved by diffing a saved copy.

| Evidence | Result | Source |
|---|---|---|
| Full unit suite | 3,711 tests: 3,707 pass, 0 fail, 4 skipped (3 symlink tests, 1 pypdf cross-check, both environmental) | QC-4.5, QC-9 |
| Browser, subpath-desktop | every spec except `visual` ran to a verdict | QC-7 |
| Browser, subpath-mobile (390x844) | 1,744 passed, 0 failed, 2 skipped by design; D-2 spec 13/13 | QC-8 |
| Browser, root-desktop portable subset | 274 passed, 0 failed | QC-9 |
| Axe on all live pages | 126/126 desktop, 126/126 mobile; tablet 820 px 126/126 | QC-5, QC-9 |

## Not run, and why

- Visual baselines and Lighthouse on the Pack 53 pages: not needed for a documentation-only change; informational only.
- Mutation tests: not needed.
- Firefox, WebKit, real Android/iOS, screen readers: not available here; manual.
- A full re-run of the above at f5a1df4: not justified. No code has changed since the evidence was gathered, and rule 10.7 says stop once covered. Re-run it at the next checkpoint or after any code change (see invalidation rules in `TEST_STRATEGY.md`).

## Recovery list

None outstanding. Earlier interruptions (QC-5/6) were fully recovered in QC-7.
