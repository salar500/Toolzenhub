# 14. Image & PDF Tools: development progress ledger

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: DEVELOPMENT IN PROGRESS (local only; not pushed, not deployed)
PHASE: Stage 2, development, started 2026-10-28

Scope built here: the three enhancements the owner approved on 2026-10-28 (P0-A compressor batch, P0-B rotate, flip, crop and exact size, P0-C Photos to PDF rotation and the metadata investigation). PDF to Images (IP-4) is **not** built. Requirements are in 07 to 09; this ledger records what was done and how it was checked. Evidence labels: VERIFIED (run in this phase), UNKNOWN.

Authority: the owner's Stage 2 prompt of 2026-10-28 approves the scope and says to commit verified work locally. Nothing was pushed or deployed and Hostinger was not touched. Rule changes: none.

## Order followed and why

IP-0 (fixtures), IP-3, IP-1, IP-2, IP-5, as the owner's prompt directed. IP-3 first also settles the Exif question, which decides whether a strip is needed.

## IP-0 and IP-3: Photos to PDF rotation and photo details (spec 44; recorded in spec 31 section 17)

| Item | Result |
|---|---|
| Fixtures (IP-0) | `tests/fixtures/images/make-metadata-fixtures.py` makes `meta-keep.jpg` (orientation 1) and `meta-rot6.jpg` (EXIF turn 6) with invented Exif text, GPS tags, an XMP packet, an IPTC block, an ICC profile and a comment. The stale matrix row for the Compressor is **not** edited here: that file is an authoritative roadmap document and no rule or priority decision was agreed. It stays listed as a correction for the owner (see 01). |
| Exif question (FR-PP-006, AC-PP-004) | **Retained.** Before the change, the PDF contained the whole source JPEG: Exif text, GPS tags, XMP and IPTC were all found in it (VERIFIED, unit test `FINDING`). |
| Fix (FR-PP-007, 008, 012) | `jpeg-segments.js`, a pure module, removes APP1 and APP13. Segment by segment and scan data byte for byte unchanged; Pillow reads the same pixels and the same colour profile and finds no Exif (VERIFIED). Truncated or odd files return null and are redrawn instead. |
| Redraw path | A JPEG saved again by the browser carries none of the markers into the PDF (VERIFIED in Chrome, browser test). |
| Rotate (FR-PP-001..005) | Rotate left and Rotate right per row, state text, turn kept with the photo, applied by placement with no re-encode, Automatic and Fit use the turned shape, Reset clears (VERIFIED). |
| Rotation correctness | The PDF's matrix is painted by an independent Python reader and compared with Pillow's rotation for 0, 90, 180 and 270 degrees; the check rejects the opposite turn (VERIFIED). Real viewers: **UNKNOWN**. |
| FR-PP-011 | An unturned photo's PDF is byte-identical to before apart from the removed segments (VERIFIED, test compares turn 0 and 4 with no turn). |
| Page text (FR-PP-009) | Says Exif, XMP and IPTC are removed from unchanged JPEGs, that comments and other information can remain, and that a photo saved again carries none; it does not claim that all metadata is gone. The old sentence "A photo cannot be turned by hand" was replaced. |
| Tests | New unit file `photos-to-pdf-turn-and-metadata.test.mjs`: 12 pass. Existing `photos-to-pdf.test.mjs`: 26 pass. New browser spec `photos-to-pdf-turn-metadata.spec.js`: 5 tests, 10 pass (desktop and mobile emulation, one worker). Existing `photos-to-pdf.spec.js`: 26 pass (desktop and mobile). |
| Visual | Inspected the list at the desktop and mobile emulation widths: five buttons in one row at 1000 px and wider, three plus two on phones; the thumbnail turns correctly (quadrant colours checked by eye against the clockwise turn). No visual baseline exists for this page, so none was changed. |
| Not verified | Real phones, Safari, Firefox, real PDF viewers' drawing of a turned page, 30 large photos on a phone. |

## IP-1: Image Compressor batch (spec 42; recorded in spec 20, section "Batch")

| Item | Result |
|---|---|
| Built | FR-IB-001..018 as written: 20 images and 100 MB (provisional), per-file checks, list with thumbnails (at most 160 px) and Remove, "same format" or one format for all, quality or Up to N KB, Keep size or Longest side (never enlarges), one image at a time, "File n of N", Cancel, failure isolation, per-row results and total, per-row Download (no ZIP), unique names, stale on any settings change, Reset, one announcement at start, end and cancel, 320/360/390 px. One image behaves as before. |
| Code | `batch-rules.js` (pure), `batch-ui.js` (list and controller), `thumbnail.js` (shared with Photos to PDF), a `fit` option in `processImage`; `index.js` hands two or more images to the controller. |
| Deviation | A new selection replaces the list (no "add more" later), matching "1 to 20 files in one selection". Result previews are one at a time through a Preview button. |
| Unit | `image-batch.test.mjs` 9 pass (limits, worked example 1, sizes checked against Pillow, names, totals); `image-engine.test.mjs` 48 pass. |
| Browser | New `image-batch.spec.js`: 12 tests, desktop 12 pass; the stale, Cancel, phone-width and list tests also pass in mobile emulation. The existing `image-compressor-resizer.spec.js` ran 46 pass, 4 fail on desktop: two are the assertions this pack intentionally changed (multiple attribute and hint wording; dropping several files), rewritten and re-run to pass on desktop and mobile; two are the known stale All Tools and Image Tools assertions (lines 858 and 873), untouched. |
| Defect found in visual inspection | The Download link text was green on a green button (unreadable). Fixed with a more specific rule and a computed-colour assertion. |
| Not verified | Phones (memory with 20 large photos: UNKNOWN), Safari, Firefox, the 20-image limit as a measured figure. |
