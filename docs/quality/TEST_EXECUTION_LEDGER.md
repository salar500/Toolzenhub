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
