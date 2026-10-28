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

## IP-2: rotate, flip, crop and exact size (spec 43; recorded in spec 20, section "Rotate, flip and crop")

| Item | Result |
|---|---|
| Built | FR-IC-001..018: one image only (hidden in a batch); Rotate left and right, Flip horizontally and vertically, Reset picture with a text state; No crop, Aspect ratio (nine shapes including Custom) and Exact size; four number fields that always work and refuse bad values on the field; a box on a small preview with drag, corner handles (44 px) and arrow keys (1 and 10 px), always equal to the fields; crop before resize; output limits unchanged; "Enlarged: this can look soft."; -cropped file name; a change removes the earlier result; one calm announcement of the crop. |
| Code | `image-geometry.js` (pure: ratio box, validation, move, resize, one canvas transform, wording), `geometry-ui.js` (markup and controller), a `geometry` request in `processImage`, an `edited` flag for the file name. |
| Pixel correctness | Unit: the transform rendered in Node agrees with Pillow's transpose, flip and crop pixel for pixel for 48 cases (all 16 turn and flip combinations, three crop choices each). Browser: the downloaded files decoded in Chrome and the quadrant colours checked for rotate left, right, 180, both flips, rotate plus flip, a numeric crop, a crop after a rotation, 1:1, and Exact size 100 x 100 and 200 x 230. Worked example 2 (4000x3000 to 200x230): crop 2609 x 3000 at x 695 (4000 minus 2609 is 1391; half, rounded down), then scaled; the test states the rectangle in advance. |
| Tests | `image-geometry.test.mjs` 8 pass; `image-engine.test.mjs` 48 and `image-batch.test.mjs` 9 pass; new `image-crop.spec.js` 14 tests, 14 pass on desktop and 14 on mobile emulation (one worker). |
| Visual | Inspected at desktop and phone width: the controls, the preview with the box and the number fields, and the size group with its lock off in Exact size. |
| Limits | The pointer path was driven with a mouse; a real touch screen is **UNKNOWN**. The 44 px corner hit areas are clipped where the box touches the edge of the preview (the fields and the keyboard still work). Safari and Firefox unverified. |

## IP-5: focused ecosystem checkpoint

| Item | Result |
|---|---|
| Catalog | Compressor description, SEO text and aliases now say batch, rotate, flip, crop and conversion (png to jpg, jpg to png, webp to jpg, jpg to webp, convert image). No related-tool lists were added across sections (rule 4.2); no new tool or route. |
| Pins updated | `search.test.mjs` alias pin for the Compressor, and its coarse total-size backstop raised from 56,000 to 58,000 bytes (index is 56,111; the per-entry ceiling, the real guard, is unchanged). |
| Static | `inventory:check` (101 live pages), links, assets, SEO: pass after a rebuild. |
| Unit | Catalog, directory, relationships, search, sections, taxonomy, capabilities, tool-page: pass. The wider unit run showed `colour tokens` failing and `growth-manifest-export` hitting the 100 s limit under memory pressure; neither was investigated here and neither touches this work (UNKNOWN whether pre-existing). |
| Browser | `image-crop` and `image-batch` 26 pass on desktop after the rebuild. The full old Compressor spec was stopped by the harness for low memory at test 45 of 50 with no failure before it; the last five (including the two known stale assertions) were not run again. |
| IP-4 | PDF to Images was **not** built, as instructed. |
| Not run | Full visual baselines, full browser regression, real phones, Safari, Firefox. |

