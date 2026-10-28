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
| 45 EMI 2.0 | NOT_STARTED | |
| 47 PPF automatic results | NOT_STARTED | |
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
