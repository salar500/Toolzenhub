# Tool Pack 52: PDF Page Numbers and Watermark (compact specification, tier MEDIUM)

Written 2026-11-01. Authority: blueprint `docs/ecosystem-review/universal-expansion/12-UNIVERSAL-BLUEPRINT-REFRESH-2026-11-01.md` (G, verdict B in doc 03 as N2), the PDF plan (doc 04) and the owner's delegation of 2026-11-01. Section PDF Tools, route `/tools/pdf-marks/`, catalog id `pdf-marks`.

## Decisions

| # | Decision | Reason |
|---|---|---|
| 1 | One tool, one job: "mark pages" (numbers, a text watermark, or both) | Doc 04; a person with a PDF wants both in one pass |
| 2 | `pdf-lib` (already vendored) draws text in standard Helvetica; no new dependency | Rule 9; low risk |
| 3 | Watermark text is Western (Latin-1) only, up to 40 characters; other scripts are refused with a plain message | Standard fonts cannot draw other scripts; embedding a font is a separate decision |
| 4 | Marks apply to every page; the only page choice is "leave the first page unnumbered" and a start number | Smallest useful set; page ranges can follow |
| 5 | Pages with a /Rotate turn get marks turned with them so they read upright | A mark on a landscape-scanned page must be upright to the reader |
| 6 | New PDF is made; the source is never modified; the file is named `<name>-marked.pdf` | Shared PDF-tool behaviour |
| 7 | Related: one way to Pages and Merge (`autoRelated: false`) | PDF Tools stay flat and isolated (rule 4.9); no change to the other tools' lists |
| 8 | A watermark is a visible mark, not protection; the page says so | Rule 3 (honest claims) |

## Settings

Page numbers (on by default): format (1 / Page 1 / Page 1 of N / 1 of N), position (six), first number (1 to 99,999), size (6 to 36 pt), skip first page. Watermark (off by default): text (1 to 40 Latin characters), diagonal or horizontal, strength 5 to 80 percent. At least one of numbers and watermark must be on.

## Model

Numbers: page `i` (0-based) shows `start + i`, minus one when the first page is skipped; "of N" is the last number printed. Geometry is computed on the page as a reader sees it (after /Rotate) and mapped back to the page's own coordinates; the text is rotated by the page turn (plus 45 degrees for a diagonal watermark). Margin 28 pt. Watermark size is the largest whole size from 12 to 96 that fits about 80 percent of the width (horizontal) or 70 percent of the diagonal, grey, centred.

## Limits and errors

One PDF, 50 MB, 1,000 pages (shared limits). Protected or damaged PDFs are refused with the shared messages. Cancel stops the work and returns no file; a late answer from a cancelled run is dropped; the download address is revoked on any change, Reset and page hide.

## Accessibility and UX

Every control is labelled; inline notes carry errors; one polite announcement per action; results card takes focus when ready; the editable area is inert while working. 44 px targets come from the shared PDF layer. Phone review: PENDING USER.

## Tests

`tests/unit/pdf-marks.test.mjs` (14): settings limits; number text and start/skip arithmetic; the visible-to-page mapping against an independent forward rotation for 0, 90, 180 and 270; named positions; watermark sizing and centring; marks read back from the re-opened output's content streams (text and Tm matrix on a turned page); opacity read from the graphics state; source unchanged; damaged file refused; cancel. A wrong-rotation mutation fails two tests. `tests/unit/pdf-marks-ui.test.mjs` (6): markup contract and registration.

## Out of scope / deferred

Page ranges for marks, image watermarks, non-Latin text (needs an embedded font), Bates prefixes and zero-padding, header and footer text, per-page different marks, encryption, compress, PDF to images.

## Status (2026-11-01)

Built locally, uncommitted. Unit: 14 + 6. Browser (`tests/browser/pdf-marks.spec.js`, 12, desktop and mobile): real files with a portrait, a landscape and a page turned 90 degrees, the downloaded file read back, marks decoded, refusals, Reset, overflow at 320, 360, 390 and desktop. Rendered output was viewed in Chrome's viewer for the default numbers with a diagonal watermark and for a top-right "N of M" with a horizontal watermark and the first page skipped, all upright on the turned page. NOT verified: the other four positions rendered, a large PDF, a password-protected file through the browser, Safari or Firefox, a physical phone (PENDING USER).
