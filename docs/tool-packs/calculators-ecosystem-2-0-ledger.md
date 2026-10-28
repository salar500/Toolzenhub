# Calculators Ecosystem 2.0: development ledger (Stage 2)

Single progress ledger for packs 45 to 50. Requirements: `docs/ecosystem-review/calculators/09`, `10`, `12` (requirement IDs below refer to them). Formula references: `docs/ecosystem-review/calculators/formula-reference-check.py`. Pack numbers are provisional ids from the research package (the spec files in this folder stop at 41). This file is the continuation point after any interruption: read it, then `git log`.

Status values: NOT_STARTED, IN_PROGRESS, BLOCKED, IMPLEMENTED, VERIFIED, COMPLETED. Release state of everything here: **local only** (not pushed, not on GitHub Pages, not on production).

Base commit: `6450f8f`. Owner scope: the approved Balanced option (Option B). Do not add other candidates.

## Architecture decisions (routine, recorded once)

- Stack unchanged: vanilla ES modules, pure engines in `assets/js/calculators/formulas/`, page modules in `assets/js/calculators/<id>/`, Eleventy. No new runtime dependency.
- Live calculation uses the pattern the live calculators already use (settled results, one polite status message, no focus move); per-pack notes below.
- Engines are not changed unless a pack says so; new arithmetic lives in new pure modules with golden tests whose expected values come from `formula-reference-check.py` or hand-checkable closed forms.
- Tests are updated deliberately; each change to a pin or a baseline is named below.

## Pack ledger

| Pack | Status | Commit |
|---|---|---|
| 46 Loan Comparison tidy and PDF repair | IMPLEMENTED (see below) | see git log |
| 45 EMI 2.0 | IMPLEMENTED (see below) | see git log |
| 47 PPF automatic results | IMPLEMENTED (see below) | see git log |
| 48 Inflation view (SIP, SWP) | IMPLEMENTED (see below) | see git log |
| 49 XIRR Calculator | IMPLEMENTED (see below) | see git log (same commit as pack 50) |
| 50 Navigation and aliases | IMPLEMENTED (see below) | see git log (same commit as pack 49) |

## Pack 46: Loan Comparison tidy and PDF repair

Requirements: FR-LC-001 to FR-LC-006.

Implemented:
- The redundant "Compare Loans" button and its click wiring are removed from `loans/loan-comparison/index.js`; the comparison already ran on load and on every field and slider change. Reset stays.
- jsPDF 2.5.1, jsPDF-AutoTable 3.8.2 and Noto Sans Regular now live in `assets/js/vendor/jspdf/` with a `NOTICE.txt` (provenance, licences MIT / MIT / SIL OFL 1.1, SHA-256 and the cdnjs SRI values, which were compared and matched when the files were obtained on 2026-10-28). `pdfLoader.js` exports `VENDOR_BASE` and loads the two scripts from it; `pdfDocument.js` fetches the font from it. The PDF code names no remote host. The libraries still load only when a PDF is requested.
- The files were downloaded to a scratch folder, hash-checked, and never executed before being committed; they run in the visitor's browser only.

Tests added or changed (deliberate):
- NEW `tests/unit/jspdf-vendor.test.mjs` (hash pins, notice, no remote host in the PDF code, no button): 4 pass.
- `tests/browser/loan-comparison.spec.js`: removed the button clicks, asserted the button is absent, added a real-PDF test (valid `%PDF-` file, expected file name, no request to another host). 16 of 16 pass (subpath-desktop, one worker).
- `tests/browser/tool-controls.spec.js`, `build.spec.js`, `dom-baseline.spec.js`, `tests/inventory/generate-inventory.mjs` and `url-inventory.json`: the primary-selector for Loan Comparison changed from `#compare-loans` to `#reset-loans`.
- DOM baseline `tests/baselines/dom/loan-comparison-main-subpath-desktop.txt`: one line removed (the button). Diffed against the received outline before accepting.

Known limitations: the font's provenance rests on the recorded SHA-256 and its embedded licence, not on an upstream checksum; the PDF still embeds the whole font (about 0.5 MB base64-expanded in memory at click time, as before).

## Pack 45: EMI Calculator 2.0

Requirements: FR-EMI-001 to FR-EMI-018.

Implemented:
- `assets/js/calculators/emi/index.js` rewritten around one form: no Calculate button; three modes (Find the EMI / tenure / rate); results appear when the needed fields are valid; empty fields give a prompt; an invalid value is reported when its field is left (not while it has focus), marks only that field, and removes the previous figure; one polite announcement 600 ms after typing stops (separate `#emi-live` status, the results region is no longer a live region); updates never move focus; Reset restores defaults, announces once and focuses the loan field.
- NEW `assets/js/calculators/formulas/emi-solve.js` (pure): `payoffSchedule` (steps the balance month by month; states payoff / non-amortizing / beyond-horizon at 600 payments), `rateForEmi` (bisection on the monthly rate), `yearlySummary`. `loan.js` is unchanged.
- Yearly summary table and a monthly table in a closed `<details>` that is built when first opened (and kept open across edits); totals row; a note on rounding. Starting-value buttons (Home, Personal, Car, Education) set only amount and tenure. Copy summary with a selected-text fallback. Plain links to Loan Prepayment and Loan Comparison (no values passed).
- `assets/css/calculators/emi.css` (new, registered in `src/_data/toolStyles.json`); catalog: seven aliases, `realtime`, `table`, `copy`, `presets`, `examples` capabilities.

Deviations from the requirement text (decided in development, recorded here):
- FR-EMI-005 asks for two-decimal display. The headline figures keep the whole-rupee display the page always had (existing tests and golden literals depend on it); the schedules show two decimals. The two-decimal EMI is therefore visible only in the schedule.
- Input limits: the rate may now be 0 (it was 1 in the form attributes, although the engine always handled 0); the loan amount and tenure no longer need to be round (`step="any"`; the old step of 1,000 rejected 12,34,567). Bounds are otherwise the old ones (loan 1,000 to 10,00,00,000; rate up to 30; tenure 1 to 40 years).
- Mode labels are "Find the EMI / tenure / rate", so they cannot be mistaken for the field labels.
- A fifth figure, the principal share of repayment, follows the original four.

Verification (all on this machine, one worker):
- Unit: `tests/unit/emi-solve.test.mjs` 12/12 (literals from `formula-reference-check.py`: 93 payments, last 11,496.54, interest 3,91,496.54; 29 payments; 9.004261%; non-amortizing and beyond-horizon cases; cross-check against `calculateAmortization`).
- Browser: `tests/browser/emi.spec.js` 19/19 on `subpath-desktop` and 19/19 on `subpath-mobile`; the EMI tests in accessibility, tool-controls and build specs 37/37; DOM baselines for EMI (one updated after diffing; breadcrumb and related-content unchanged).
- Visual baselines `emi-visual-{desktop,mobile,tablet}.png` replaced after viewing the desktop and mobile images (the page is intentionally different).
- Pins changed deliberately: `search.test.mjs` (EMI aliases; the query "home" now also finds EMI through "home loan emi", after Home Loan), `tool-capabilities.test.mjs` (EMI capabilities), `shared-ui.test.mjs` (4 number fields, 15 result metrics).
- Not run: Firefox/WebKit/real devices; the full browser regression; `root-desktop` project for the EMI spec.

Observations:
- The preview is served over plain http on a non-local host name, where the browser offers no clipboard; the copy test therefore installs a recording stand-in for the success path, and the fallback is the behaviour the browser actually showed.
- The shared related-article cards on every calculator page load their thumbnails from images.unsplash.com. This predates this work and is outside the calculator code; it is recorded here because the privacy statement of the tools should not be read to cover it. The EMI network test excludes images for that reason.

## Pack 47: PPF Calculator automatic results

Requirements: FR-PPF-001 to FR-PPF-006.

Official-rule check (FR-PPF-006), done 2026-10-28 before changing the page:
- Source read: the text of the Public Provident Fund Scheme, 2019 (Gazette of India, Ministry of Finance, December 2019) as reproduced on taxguru.in. The official India Post PDF could not be read here (no PDF text tool), so the quotations are from that mirror and the reading has not been compared with the gazette file itself.
- Para 7(1): interest is "eligible for a calendar month on the lowest balance at the credit of an account between the close of the fifth day and the end of the month". Para 7(2): "Interest shall be credited to the account at the end of each year." Para 4(1): a deposit of not less than ₹500 and not more than ₹1,50,000 in multiples of ₹50 in a year; para 5(2): in one lump sum or in instalments; no limit on the number of deposits is stated. Para 11(1): maturity after fifteen years from the end of the year of opening.
- Result: the engine's V1 reading (lowest balance between the fifth and month end, credited yearly, ₹500 to ₹1,50,000, 15-year maturity) is consistent with these paragraphs. The division of the annual rate by 12 for a month is not stated in the Scheme text I read; the page already says it is this tool's assumption, and that stays. The 7.9% in the 2019 text is superseded by quarterly notification; the tool uses only the rate the visitor enters. No engine change was made or needed.

Implemented (page only; `formulas/ppf.js` untouched):
- No Calculate button and no out-of-date label (its markup, constants and CSS are removed). Results appear when the deposit, rate and years are complete and valid; empty fields give a prompt; an invalid value is reported when its field is left, and the previous figure is removed meanwhile; one polite announcement 600 ms after typing stops; focus is not moved; the year table keeps the open or folded state the visitor chose; Reset restores the starting values, shows the starting result, announces once and focuses the first field.
- Catalog: `realtime: true`. The "how to use" steps were reworded.

Verification: `tests/browser/ppf.spec.js` rewritten for live behaviour (including a live announcement test); 28/28 on `subpath-desktop` and 28/28 on `subpath-mobile`; related unit suites 213/213 (`ppf-golden` unchanged). Not run: `root-desktop` project for this spec; full regression.

## Pack 48: inflation view in SIP and SWP

Requirements: FR-INF-001 to FR-INF-010. No separate page.

Implemented:
- NEW pure module `formulas/inflation.js`: `validateInflation` (blank or 0 = off; 0 to 30 with up to 2 decimals), `realValue(nominal, f, years) = nominal / (1 + f)^years`, `realReturnPercent(r, f) = (1 + r) / (1 + f) - 1`. Neither engine (`sip.js`, `swp.js`) is changed; nominal figures are untouched and the golden tests pass unchanged.
- SIP: optional field "Expected Inflation"; when set, a block "In today's money" restates the estimated value over the whole period and gives the return after inflation; the print summary and the announcement include it.
- SWP: same optional field, shown for all three questions. It restates the final-year withdrawal in today's money (using the yearly increase, if any, and the inflation rate), or the balance after 40 years when the corpus is not used up.
- Wording always says the rate is the visitor's assumption, not a forecast, and that the figures above are unchanged.
- Deviation: the SWP view restates the final-year withdrawal (or the balance), not the remaining corpus in every mode, because the solving modes leave a corpus of about zero by design.

Verification: `tests/unit/inflation.test.mjs` 7/7 (values from `formula-reference-check.py`: 31,18,047.27; 33,051.30; 5.6604%); new `tests/browser/inflation-view.spec.js` 8/8 on `subpath-desktop` and `subpath-mobile` (SIP 41,79,242.66 / 1.06^15 = 17,43,852; SWP 80,000 / 1.06^24 = 19,758 and 80,000 x 1.05^24 / 1.06^24 = 63,722, computed independently with `python -I`); `sip.spec.js` and `swp.spec.js` pass on `subpath-desktop` after the tab-order pins gained the new field; sip/swp golden and related unit suites pass; inventory, assets, SEO and link checks pass.
Baselines changed deliberately: SIP desktop, mobile, tablet and SWP desktop, mobile, tablet visual images (new field; desktop images viewed). Normalised the line endings of the EMI DOM baseline working copy (content unchanged).
Pre-existing, not fixed: `tools-directory` DOM baseline differs on the Image Compressor description (since commit `c718e9a`); `design-tokens` unit test (gratuity colour). Not run: Firefox/WebKit, root-desktop, full regression.

## Pack 49: XIRR Calculator (new tool, `/calculators/xirr/`)

Requirements: FR-XIRR-001 to FR-XIRR-022. Catalog: Calculators > Investment, after SWP.

Implemented:
- NEW pure engine `formulas/xirr.js`: dates (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY as whole days since 1970, 1990 to 2100, real calendar days only), amounts (signs, brackets, ₹/Rs, Indian or western grouping, at most 2 decimals), pasted-row parser, flow validation (2 to 100 flows, money out and in both present, at least one day apart), and the solver.
- Solver: Actual/365; with x = ln(1 + r) the NPV is scanned on 4,000 grid points from r = -99.9999% to 1,000,000%, every sign change is bisected (to 1e-15 in x, at most 200 steps), the NPV is rescaled by its largest term so a long period or an extreme rate cannot overflow; all roots are returned and the one nearest zero is reported; the residual is checked. A double root that only touches zero is not found and no rate outside the range is found; the page says so.
- Page: dated rows (native date field, amount, Money out / Money in), add, remove (two rows always stay), "Fill in an example", Reset, "Paste many rows" with an explicit "Add these rows" action (atomic: any bad line adds nothing and names the line), live result, multiple-rate caution, two-flow closed-form cross-check, totals, cash flows in date order, Copy summary (selected-text fallback). Rows become cards on a phone. No storage, no network, nothing in the address.
- Registration: catalog entry (no alias "sip xirr", because a pinned search test requires the query "sip" to find only SIP), style registration, `xirr.css`, Growth identity-ledger record, regenerated URL inventory (102 live pages).
- Calculator count: 19 published calculators in the catalog after this pack (verified by the catalog test).

Verification:
- Reference values come from `formula-reference-check.py` (Python decimal, run with `python -I`): the four-flow example 14.394394%; two flows over 1,827 days 14.852405% (equal to 2^(365/1827) - 1); flows -1,000 / +2,300 / -1,320 on days 0, 365, 730 have roots 10% and 20%. **No spreadsheet was run, so no spreadsheet parity is claimed.**
- `tests/unit/xirr.test.mjs` 14/14 (reference values, order independence, a loss, money in first, 60-year span, near-total loss, no-root case, parsers, validation, 100 flows).
- `tests/browser/xirr.spec.js` 20/20 on `subpath-desktop` and 20/20 on `subpath-mobile` (shell, example, live typing, errors on leaving the row, neutral prompt versus error, add/remove/100-row limit, paste formats and atomic errors, length and row limits, Reset, single announcement and focus, copy with stub and fallback, no storage or requests, keyboard, labels, 320/360/390 px layout).
- Pins changed deliberately (all because XIRR is a genuine new published tool): `catalog.test.mjs` (published list, titles), `directory.test.mjs`, `taxonomy.test.mjs`, `sections.test.mjs` (published URLs, registry keys), `search.test.mjs` (tool count 60, XIRR aliases), `relationships.test.mjs` (XIRR is auto-related like the other Investment tools until pack 50's curated lists). DOM baselines `investment-page` and `tools-directory` accepted after diff: both differ by the XIRR card and link and the "19 tools" count; `tools-directory` also carried an older one-line difference in the Image Compressor description (from commit `c718e9a`), accepted with it.
- Static checks pass: inventory, assets, SEO, links.

Not done / limits: no visual baseline images were added for the new page; Firefox/WebKit/real devices not tested; the full browser regression was not run; accessibility was checked by role/label assertions only, not with a screen reader.

## Pack 50: ecosystem navigation

Requirements: FR-NAV-001 to FR-NAV-006. Committed together with pack 49: the XIRR tool and the curated lists change the same catalog file and the same pinned tests, and the pins of one cannot be separated cleanly from the other.

Implemented (catalog data only, in `assets/js/data/tools.js`; no component or relationship code changed):
- Curated `relatedTools`, inside the Calculators section only, at most three each: EMI to Loan Comparison, Prepayment, Home Loan; Loan Comparison to EMI, Prepayment, Balance Transfer; Home Loan to EMI, Loan Comparison; SIP to SWP, CAGR; FD to CAGR; CAGR to FD, SIP; XIRR to CAGR, SIP. The existing curated lists (Prepayment, Balance Transfer, Credit Card Payoff, SWP) are unchanged.
- Curated entries come first and the existing automatic category relationship still fills the rest of each list (the related-calculators component shows up to six), so a page keeps every card it had and gains the new ones in a better order. The visible effects: the EMI page lists Prepayment before Home Loan; Loan Comparison lists Prepayment before Balance Transfer and Home Loan; Home Loan lists EMI first; SIP now offers SWP first (SWP already offered SIP, so the link is two-way); FD, CAGR and PPF pages gain XIRR; and no page has a card that links to itself.
- Aliases: the seven EMI aliases are from pack 45 and the six XIRR aliases from pack 49 (no alias that would make the plain query "sip" return another tool).
- The Coming soon Personal Loan and Loan Eligibility placeholders are unchanged. Retiring them needs the owner's approval, so it was not done.

Verification: unit suites for relationships, catalog, tool-catalog, search, sections, taxonomy and directory pass (137); the browser related-card tests of EMI, Loan Comparison, SIP, FD, CAGR, PPF and SWP pass on `subpath-desktop`; the DOM baseline `related-content-emi` was accepted after diff (the one change is Prepayment moving above Home Loan).
Pins changed deliberately: `relationships.test.mjs` (the six curated lists and the parity loop now excludes tools with a curated list, which are pinned one by one), the related-card tests in `emi`, `loan-comparison`, `sip`, `fd`, `cagr`, `ppf` and `swp` specs, and `navigation.spec.js` (30 entries, 19 built; the Investment category page lists XIRR; "personal loan" now finds the EMI Calculator through its pack 45 alias, and "home loan" on the Loans page now also matches EMI, so those assertions look for the Home Loan and Personal Loan cards by what they are).
Not run: Firefox/WebKit, root-desktop, full regression.


## Stage 3: independent testing and local closure (2026-10-28)

Scope: verification and correction of packs 45 to 50 only. Nothing was pushed, deployed or published. No rule in `docs/product-decision-rules.md` changed. Audit scripts: `docs/ecosystem-review/calculators/stage3-evidence/`. Permanent checks added: `tests/unit/calculators-stage3-audit.test.mjs`, `tests/browser/calculators-stage3-responsive.spec.js`, and additions to `tests/unit/xirr.test.mjs`, `tests/browser/xirr.spec.js` and `tests/browser/loan-comparison.spec.js`.

### Independent formula audit (expected values from Python `decimal`, run with `python -I`, never from the engines)

| Area | Cases | Result |
|---|---|---|
| EMI | 240 loans (zero rate, 0.1% to 30%, 1 to 40 years, 1,000 to 10 crore, random non-round amounts) | EMI worst relative error 1.3e-12; schedule length, principal reconciliation (2.4e-15), total interest (8.8e-12) and zero closing balance all hold |
| Payoff (tenure solving) | 240 | Payment count, final payment and total interest all agree |
| Rate solving | 193 | Worst absolute error 3.4e-11 in the page's rate unit (tolerance 1e-6) |
| PPF | 120 random yearly and monthly cases | Engine equals the closed form to 6.0e-16 relative. `formulas/ppf.js`, `sip.js`, `swp.js` and `loan.js` have no diff since base `6450f8f` |
| Inflation | 120 | Today's-money value 5.7e-15 relative, return after inflation 2.7e-14; 0% inflation changes nothing. Negative inflation is not supported (rejected by design, FR-INF-001: 0 to 30) |
| XIRR vs Decimal oracle | 10 sets | Agree to about 1e-15 |

### XIRR spreadsheet parity (VERIFIED against real Excel)

Microsoft Excel 16 (Windows) was driven through COM (`xl_xirr.ps1`) on ten cash-flow sets; LibreOffice is not installed. Excel iterates to about 1e-8, so parity is asserted at 1e-7 (the pinned unit test) and the observed differences are all below 6.1e-9.

| Case | Excel | Engine | Abs. difference |
|---|---|---|---|
| four-flow example | 0.143943935632706 | 0.14394393665169303 | 1.0e-9 |
| two flows, 1,827 days | 0.148524039983749 | 0.1485240459409567 | 6.0e-9 |
| loss (-1000, +500, one year) | -0.49999999627471 | -0.5 | 3.7e-9 |
| leap-year span | 0.0997135818004608 | 0.09971358593414159 | 4.1e-9 |
| money in first | -0.49999999627471 | -0.5 | 3.7e-9 |
| six monthly flows | 0.382709640264511 | 0.38270964409938735 | 3.8e-9 |
| 40 years | 0.102669030427933 | 0.10266903276799111 | 2.3e-9 |
| near zero | 0.00050000250339508 | 0.000500000000000167 | 2.5e-9 |
| same-day flows | 0.199999994039536 | 0.20000000000000018 | 6.0e-9 |
| near-total loss | -0.999989999999889 | -0.99999 | 1.1e-13 |

Excel was run on single-root sets only. For multiple-root sets Excel returns whichever root its iteration reaches from its starting guess, so those are checked against the Decimal oracle (the 10% and 20% roots in the unit test), not against Excel.

### XIRR robustness

3,000 random valid sets (2 to 100 flows, spans of 5 days to 110 years, amounts 1 to 1e12): 1,600 solved, 1,368 correctly reported as "no rate in range", 32 refused by validation. No non-finite rate, no root at or below -100%, worst solve time 77 ms, 763 sets had more than one root. 150 of the "no rate" outcomes were rescanned on a 100-times denser grid and none had a missed sign change. Hostile paste text (markup, scripts, 5,000 digits, `1e999`, `Infinity`, `NaN`, full-width digits, a NUL byte) is refused or parsed to nothing. Known engine limit, unchanged and documented: a double root that only touches zero is not found, and rates outside -99.9999% to 1,000,000% are not searched.

### PPF official source (limitation kept)

The Public Provident Fund Scheme, 2019 (G.S.R. 915(E), 12 December 2019) is published by India Post at `https://www.indiapost.gov.in/documents/offerings/schemesandservices/posb/PublicProvidentFundScheme2019English.pdf`. The file was downloaded, but its text layer cannot be read with the tools available here (embedded fonts without a Unicode map, no OCR); the Income Tax Department copy returned HTTP 403 and the DEA copy is a scanned image. A web-search summary of the official PDF said that paragraph 7 computes interest monthly on the lowest balance between the close of the fifth day and the end of the month; that is a secondary reading, not a reading of the official page. The Stage 2 position therefore stands: the interest rule was checked against a mirror of the gazette text only, the page still labels its interest reading as this tool's assumption, and a reading of the official PDF by a person (or with OCR) remains open. The later amendment G.S.R. 290(E) of 5 May 2020 was not read.

### PDF export (Pack 46)

- Vendored files: `jspdf-vendor.test.mjs` (hashes, versions 2.5.1 and 3.8.2, notice) 4/4. During export the page requests nothing from another host (the article-card images are excluded; see the security finding).
- Content: with the real library and its text observed, the summary and the first and last schedule rows equal an independent calculation (30,00,000 at 8% for 15 years: EMI 28,670, total interest 21,60,521, total 51,60,521, month 1 principal 8,670 and interest 20,000, month 180 principal 28,480 and interest 190, balance 0). No `undefined`, `NaN`, `Infinity` or markup in the text.
- Filename: reduced to lowercase letters, digits and hyphens before download. Libraries load only when a PDF is requested (existing test).

### Defects found and fixed (3 genuine; tests first)

1. XIRR residual was NaN for a valid rate near -100% over a very long period (the plain NPV underflowed). It now uses the solver's own rescaling (`relativeResidual`). Found by the fuzz; the displayed rate was never wrong. Commit `cddb245`.
2. FR-LC-006 gap in Pack 46: a failed PDF export only wrote to the console, so the visitor saw nothing. A fixed plain-language alert now appears next to the button (`[data-pdf-error]`, `role="alert"`); the button is restored and the figures stay. Commit `cddb245`.
3. `gratuity.css:572` used the colour literal `#667085` (it failed `design-tokens`). It now uses `var(--color-ink-muted)`, the same value, so nothing changes visually. Commit `93d2670`.

Test defect corrected (no assertion weakened): the "no other host" PDF test counted images from shared article cards and depended on timing. It now counts only non-image requests made after load, so the export itself must still contact no other host.

### Security and privacy

- The changed pages contain no `localStorage`, `sessionStorage`, cookie, `fetch`, `XMLHttpRequest`, beacon, address-bar or analytics code (grep). Values placed in markup go through `escapeHTML`. A browser test (`xirr.spec.js`, "hostile paste") pastes markup and script text and asserts no injected element, no dialog, no request to another host, nothing stored and no address-bar change.
- Scoped finding, not changed (shared image system): article-card thumbnails on these pages load from `images.unsplash.com`. The requests carry no calculator values, but a page-level claim of "no network request after load" (FR-EMI-016, FR-XIRR-020, FR-LC-003) is accurate for the calculation and export code only, not for those images. Owner decision needed: host the thumbnails locally, or word the claims as "your figures are not sent anywhere".

### Accessibility and responsive

- Widths 320, 360, 390, 768 and 1180 on XIRR, EMI, PPF and Loan Comparison: no horizontal page scroll, and every visible button, select and text input at least 44 px high (20/20). Screenshots of XIRR at 320 and 1180 with a result were inspected: no overlap, readable.
- Findings, shared and pre-existing, not changed: the `.calculator-info` accordion summaries are 26 px high (meets the WCAG 2.2 AA 24 px minimum, below the 44 px used elsewhere), and the Loan Comparison range sliders are 18 px high (below 24 px unless the spacing exception applies). Recorded for the owner.
- Not done: screen-reader testing (none was used, so none is claimed), real-device, zoom and font-scale testing, an automated axe run. No visual baseline was added for the XIRR page.

### Cross-browser

Only system Chrome is installed. Firefox and WebKit are NOT VERIFIED (no large browser packages were installed).

### Catalog, navigation and static checks

19 published calculators (balance-transfer, cagr, credit-card-payoff, emi, fd, gratuity, gst, home-loan, income-tax, loan-comparison, margin, percentage, ppf, prepayment, profit, salary-in-hand, sip, swp, xirr) and 11 coming-soon calculators plus 6 coming-soon articles; none of the 17 is a route (17/17 return the 404 page). Inventory, assets, SEO and link checks pass.


### Requirements traceability (68 functional requirements)

How to read it: "Evidence" names the spec or audit that carries the check. Rows marked S3 have evidence produced in Stage 3; the others rest on the Stage 2 spec named, which passed again in the Stage 3 focused run (see the results line below), and were not re-derived row by row. Status values: Pass, Partial (the criterion is only partly evidenced; the gap is stated), Not run. There are no Fail or Blocked rows.

| ID | Feature | Evidence | Status | Deviation or gap |
|---|---|---|---|---|
| FR-EMI-001 | Automatic results, no Calculate button | `emi.spec.js` | Pass | |
| FR-EMI-002 | Neutral prompt; errors on leaving the field | `emi.spec.js` | Pass | |
| FR-EMI-003 | One polite announcement, no focus move, Reset announces once | `emi.spec.js` | Pass | |
| FR-EMI-004 | Three modes by radio group | `emi.spec.js` | Pass | |
| FR-EMI-005 | EMI, total interest, total payment, principal share | `emi-solve.test.mjs`, S3 `emi_diff.mjs` (240 cases) | Pass | |
| FR-EMI-006 | Find tenure by stepping | S3 Decimal oracle (240 payoff cases) | Pass | |
| FR-EMI-007 | Find rate by bisection | S3 Decimal oracle (193 cases) | Pass | |
| FR-EMI-008 | Yearly summary and monthly schedule | `emi.spec.js`, S3 reconciliation | Pass | |
| FR-EMI-009 | Real tables; schedule scrolls in its own container | `emi.spec.js`, S3 responsive (no page scroll at five widths) | Pass | |
| FR-EMI-010 | Illustrative chips set amount and tenure only | `emi.spec.js` | Pass | |
| FR-EMI-011 | Copy summary with fallback | `emi.spec.js` (clipboard stubbed; the preview is plain http) | Pass | Real clipboard not exercised |
| FR-EMI-012 | Plain hand-off links | `emi.spec.js` | Pass | |
| FR-EMI-013 | Assumption wording | `emi.spec.js` | Pass | |
| FR-EMI-014 | Labels, aria-describedby, keyboard, contrast | `emi.spec.js` role and label assertions | Partial | No screen reader and no automated contrast run |
| FR-EMI-015 | No overflow at 320/360/390/desktop; 44 px targets; 16 px inputs | S3 responsive spec (overflow and 44 px) | Partial | 16 px input text not re-measured in Stage 3 |
| FR-EMI-016 | No network, storage or address-bar state | S3 grep; `emi.spec.js` | Partial | Article-card images load from another host (see Security) |
| FR-EMI-017 | Route, catalog id and golden values unchanged | inventory check, `loan` and `emi-solve` goldens | Pass | |
| FR-EMI-018 | Seven catalog aliases | catalog and search unit tests | Pass | |
| FR-LC-001 | Compare Loans button removed, results live | `loan-comparison.spec.js` | Pass | |
| FR-LC-002 | No computed figure changes | S3 PDF content test against Decimal figures; `loan.js` no diff | Pass | |
| FR-LC-003 | No third-party request in view and PDF | `loan-comparison.spec.js` (non-image requests) | Partial | Images from article cards are third-party (see Security) |
| FR-LC-004 | Libraries and font vendored with hash test | `jspdf-vendor.test.mjs` 4/4 | Pass | |
| FR-LC-005 | Libraries load only on request | `loan-comparison.spec.js` | Pass | |
| FR-LC-006 | Plain message when PDF generation fails | S3 failure test | Pass | Gap fixed in Stage 3 (commit `cddb245`) |
| FR-PPF-001 | Results without a Calculate button | `ppf.spec.js` | Pass | |
| FR-PPF-002 | No out-of-date state | `ppf.spec.js` | Pass | |
| FR-PPF-003 | Engine unchanged | S3: no diff of `formulas/ppf.js` since `6450f8f`; closed-form oracle | Pass | |
| FR-PPF-004 | Example and Reset behaviour | `ppf.spec.js` | Pass | |
| FR-PPF-005 | Assumption statements kept | `ppf.spec.js` | Pass | |
| FR-PPF-006 | Interest rule read from the official text | mirror of the gazette (Stage 2); official PDF located (S3) | Partial | Official PDF unreadable here; see "PPF official source" |
| FR-INF-001 | Optional inflation field, 0 to 30 | `inflation.test.mjs`, `inflation-view.spec.js` | Pass | |
| FR-INF-002 | SIP today's money | S3 oracle (120 cases) | Pass | |
| FR-INF-003 | SWP corpus and last withdrawal today's money | `inflation-view.spec.js` | Pass | |
| FR-INF-004 | Return after inflation | S3 oracle | Pass | |
| FR-INF-005 | Empty field leaves everything as before | `inflation-view.spec.js`; engines no diff | Pass | |
| FR-INF-006 | Invalid value removes only inflation figures | `inflation-view.spec.js` | Pass | |
| FR-INF-007 | Assumption wording, no "will be worth" | `inflation-view.spec.js` | Pass | |
| FR-INF-008 | Announcement includes today's money | `inflation-view.spec.js` | Pass | |
| FR-INF-009 | SIP print view includes it | `inflation-view.spec.js` | Pass | Print rendering not inspected visually |
| FR-INF-010 | One pure shared module | `inflation.test.mjs` | Pass | |
| FR-XIRR-001 | New tool, catalog entry, aliases | catalog and search tests, inventory | Pass | |
| FR-XIRR-002 | Live results; paste is an explicit action | `xirr.spec.js` | Pass | |
| FR-XIRR-003 | Rows with date, amount, type; 2 to 100 rows | `xirr.spec.js` | Pass | |
| FR-XIRR-004 | Amount rules | `xirr.test.mjs`, `xirr.spec.js` | Pass | |
| FR-XIRR-005 | Date formats and range | `xirr.test.mjs` | Pass | Range follows the shipped engine (1990 to 2100) |
| FR-XIRR-006 | Actual/365 | S3 Excel parity (10 sets) | Pass | |
| FR-XIRR-007 | Deterministic solver, bounded | S3 fuzz (3,000 sets), unit tests | Pass | Engine uses a 4,000-point scan with bisection to 1e-15 |
| FR-XIRR-008 | Specific messages for no-rate cases | `xirr.test.mjs`, `xirr.spec.js` | Pass | |
| FR-XIRR-009 | Several rates fit; nearest zero shown | `xirr.test.mjs` (10% and 20%), S3 fuzz | Pass | |
| FR-XIRR-010 | Result figures | `xirr.spec.js`, S3 screenshot | Pass | |
| FR-XIRR-011 | Two rows equal CAGR; link | `xirr.test.mjs`, `xirr.spec.js` | Pass | |
| FR-XIRR-012 | Extreme-rate display | `xirr.spec.js` | Pass | |
| FR-XIRR-013 | Paste box | `xirr.test.mjs`, `xirr.spec.js`, S3 hostile paste | Pass | |
| FR-XIRR-014 | Row accessible names, 44 px Remove, focus on add | `xirr.spec.js`, S3 responsive | Pass | |
| FR-XIRR-015 | Example and Reset | `xirr.spec.js` | Pass | |
| FR-XIRR-016 | Copy summary | `xirr.spec.js` (clipboard stubbed) | Pass | Real clipboard not exercised |
| FR-XIRR-017 | Explanatory content | `xirr.spec.js` | Pass | |
| FR-XIRR-018 | Labels, errors, live region, reduced motion, contrast | `xirr.spec.js` | Partial | No screen reader, no automated contrast run |
| FR-XIRR-019 | Cards at 480 px and below; no overflow; 44 px; 16 px | S3 responsive, S3 screenshots (320 and 1180) | Partial | 16 px input text not re-measured; 100-row layout not inspected at 320 |
| FR-XIRR-020 | No storage, address-bar state or network; paste cap | S3 hostile test, grep | Partial | Article-card images (see Security) |
| FR-XIRR-021 | 100 rows bounded and instant | S3 fuzz (worst 77 ms), unit test | Pass | Timing on this 4 GB laptop only |
| FR-XIRR-022 | No excluded features | catalog entry and page review | Pass | |
| FR-NAV-001 | Curated related lists | `relationships.test.mjs`, related-card specs | Pass | |
| FR-NAV-002 | No list crosses a section | `relationships.test.mjs` | Pass | |
| FR-NAV-003 | Pinned tests updated deliberately | ledger, Pack 50 | Pass | |
| FR-NAV-004 | Placeholders unchanged without approval | S3 inventory (11 coming-soon calculators, none routable) | Pass | |
| FR-NAV-005 | Search-index size backstop reviewed | search unit tests, Pack 50 | Pass | |
| FR-NAV-006 | No published URL changes | inventory check (19 live calculator URLs unchanged) | Pass | |

Results line for the traceability: the Stage 2 specs named above were not all re-run in Stage 3. Run in Stage 3 and passing: loan-comparison.spec.js 18/18 (subpath-desktop), the five-width responsive spec 20/20, the hostile-paste test, and the unit files xirr, jspdf-vendor, emi-solve, design-tokens and the new audit file. A combined focused run of the emi, ppf, inflation-view, xirr, loan-comparison, navigation and home-loan specs (162 tests, subpath-desktop) was stopped by the system for low memory after roughly 80 tests with no failure reported, so it is INCOMPLETE and is not claimed as passed; the mobile run of the same specs did not start. Rows that cite those specs rest on their Stage 2 passes (emi, ppf, inflation-view, xirr 20/20 desktop and mobile; broad run 315/315) and are unconfirmed in Stage 3 for the unfinished part.


### Privacy wording correction and local closure (owner decision, 2026-10-28)

Owner decision applied: privacy wording must not claim that the whole page makes no network requests, and browser-local calculator processing is kept distinct from third-party page assets.

- Corrected: `src/privacy.njk` has a new paragraph under "Third-Party Services" saying that some pages show article pictures loaded from a third-party image host (currently Unsplash), that opening such a page makes the browser request them and lets that host see the IP address and browser details, that this is separate from the calculators (which do not send what you type to anyone), and that it happens whatever the visitor chooses about analytics. The PPF and XIRR "Is my data stored or sent anywhere?" answers now say that nothing you type is stored or sent anywhere and add that the page still loads its own files and some article pictures from another site, with a pointer to the privacy page.
- Unchanged on purpose: the consent-based analytics sections and their disclosures, the calculator formulas, navigation, and every other feature. Other calculator pages say "Calculated in your browser • Nothing is stored" or that values are not stored or sent; those statements are about the visitor's figures and are accurate, so they were left as they are. The requirement texts in `docs/ecosystem-review/calculators/` (FR-EMI-016, FR-LC-003, FR-XIRR-020) keep their original wording as the historical record; read them as "no request carries the visitor's figures".
- Not done, by decision: the Unsplash images were not downloaded or replaced. Local image hosting is recorded as a separate future optimization that needs a licence review (Unsplash licence terms and attribution), a performance review (size, formats, caching, layout shift) and an integration review (Home, Articles, Categories and Loans cards and their visual baselines). It is the same item as section 2 of `docs/design-follow-ups.md`, which already notes the third-party dependency.
- Checks run (focused only): new `tests/unit/privacy-wording.test.mjs` 2/2; the privacy, hostile-input and analytics-related cases of `ppf.spec.js`, `xirr.spec.js` and `analytics.spec.js` on subpath-desktop, 13 passed; link and SEO checks pass. No broad browser regression was run, because the earlier run exhausted memory.
- Effect on the traceability: the "Partial" rows FR-EMI-016, FR-LC-003 and FR-XIRR-020 remain Partial until the images are hosted locally or the owner accepts the wording as corrected.

### Closure state of Calculators Ecosystem 2.0 (local)

Closed locally. Overall verdict stays **AMBER** until these deferred items are done, all carried to the consolidated release-quality checkpoint: the combined focused browser regression (desktop and mobile) that was stopped for low memory; Firefox and WebKit; screen-reader, zoom, real-device and automated accessibility checks; XIRR visual baselines; a person or OCR reading of paragraph 7 of the official PPF Scheme 2019 and of G.S.R. 290(E); the shared target sizes (accordion summaries 26 px, Loan Comparison sliders 18 px); and local image hosting. Nothing was pushed, deployed or published.
