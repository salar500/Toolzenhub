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
| 48 Inflation view (SIP, SWP) | NOT_STARTED | |
| 49 XIRR Calculator | NOT_STARTED | |
| 50 Navigation and aliases | NOT_STARTED | |

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
