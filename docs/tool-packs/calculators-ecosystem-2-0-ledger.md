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
