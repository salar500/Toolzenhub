# 14. Image & PDF Tools: development progress ledger

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: STAGE 3 COMPLETE LOCALLY, verdict AMBER (not pushed, not deployed); see the Stage 3 section
PHASE: Stage 2 development and Stage 3 testing, both 2026-10-28

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

## Stage 3: independent testing, defect fixing and local closure (2026-10-28)

Baseline: branch `main`, HEAD `c718e9a`, clean tree, 19 commits ahead of origin (unpushed). Rule changes: none.

### Metadata privacy (priority item)

| Place in a JPEG | Before Stage 3 | Now | Evidence |
|---|---|---|---|
| Exif and GPS (APP1), XMP (APP1) | removed | removed | unit, browser (Chrome) |
| IPTC (APP13) | removed | removed | unit, browser |
| Comment (COM) | **kept, in the PDF** | removed | new unit audit; browser |
| Vendor segments APP3 to APP12, APP15 | **kept** | removed | new unit audit |
| JFXX thumbnail, JFIF thumbnail (a second copy of the picture) | **kept** | removed (JFIF header kept) | new unit audit |
| MPF multi-picture index (APP2) | **kept** | removed | new unit audit |
| Bytes after the end-of-image marker (motion-photo video, second picture) | **kept, in the PDF** | removed | new unit audit |
| ICC colour profile (APP2), Adobe (APP14), JFIF header, tables, picture scan | kept | kept, byte for byte | unit; Pillow decodes the same pixels for every JPEG fixture and a progressive one |
| PDF document information (author, producer, creator, dates, title, XMP) and the source file name | absent | absent | unit reads the PDF bytes |
| Compressor, a photo saved again by the canvas | none carried | none carried | existing browser test (`exif-secret.jpg`) |

Severity of the defect found: moderate (comments and trailing data are rare but can carry text or a second picture; the page text already warned that comments could remain). Affected workflow: Photos to PDF with an unchanged JPEG. Fix: `jpeg-segments.js` extended (spec 31). Page text now lists what is removed and does not claim all information is gone: the colour profile stays and a picture can still show a name or place in what it draws. A box of other possible hiding places was **not verified**: unusual vendor containers inside the scan data and metadata painted into the pixels.

### Unit failures

| Failure | Reproducible | Predates this work | Cause | Result |
|---|---|---|---|---|
| `design-tokens` "colour tokens" | yes, deterministic | yes: `assets/css/calculators/gratuity.css:572` has `#667085`, added in Gratuity commit `710ffdf`; no Image/PDF commit touched that file | a colour literal outside `variables.css` | **Recorded, not fixed** (Gratuity, outside this scope) |
| `growth-manifest-export` | no | n/a | my own 100 s command limit killed a 91 s test (exit 143) | **Not a defect:** 48 of 48 pass in 91 s |

### Other defects found and fixed in Stage 3

| Defect | Root cause | Fix | Regression coverage |
|---|---|---|---|
| Crop corner handles clipped at the preview edge | 44 px handles centred on the corners inside an `overflow:hidden` stage | 22 px stage padding, box offset by the canvas | `image-crop.spec.js` "no corner handle is clipped" at 320, 390, 1000 px |
| Crop box did not match the picture after a viewport change (178 px against 196 px at 320) | a `window.resize` listener can run before layout settles | `ResizeObserver` on the preview canvas | same test waits for box and canvas to agree |
| Two stale Compressor assertions (Image Tools page "one tool"; All Tools sections and counts) | written before PDF Tools and Photos to PDF existed | expectations corrected to the catalog (Image Tools 2, PDF Tools 3, Time 13, Developer 12); not weakened | `image-compressor-resizer.spec.js` group, 6 of 6 pass |

### Coverage completed

The six tests of "Image Tools in the site" (the group where the earlier run stopped) pass. With the 44 earlier completed tests, the whole old Compressor spec has been run on desktop, in two parts, before the last small UI fixes; the single-image path was not touched by those fixes.

| Run | Result |
|---|---|
| Unit: photos-to-pdf (3 files), geometry, batch, engine, search, catalog | 147 pass, 0 fail |
| Browser, desktop: `image-crop` | 15 pass |
| Browser, mobile emulation: `image-crop` | 15 pass |
| Browser, desktop: `photos-to-pdf` | 13 pass; `photos-to-pdf-turn-metadata` 5 pass |
| Browser, mobile emulation: `image-batch` and `photos-to-pdf-turn-metadata` | 17 pass |
| Static: inventory (101 live pages), links, assets, SEO | pass |

### Search-index backstop (56,000 to 58,000 bytes)

Justified: only the Compressor's catalog text grew (11 aliases, longer description). The meaningful guards are unchanged and pass: every entry's aliases are pinned exactly and each entry stays under 1,000 bytes. The total is documented as a coarse backstop that rises with the catalog.

### Visual and accessibility

Inspected at 320 px and desktop: the crop box with all four handles visible, a batch with a 93-character file name (wraps, no overflow), a failed file with its reason and Remove, a done row. Controls are at least 44 px and inputs at least 16 px at 320, 360 and 390 px (asserted). The crop has number fields and arrow keys as the keyboard alternative to dragging. No baselines were changed. Not verified: a screen reader, real touch.

### Not run or not verified

Full browser regression and visual baselines (memory), Firefox, Safari, real phones, real PDF viewers, 20 large photos on a phone, the old Compressor spec after the last two UI fixes on mobile.

### Verdict

AMBER: no known correctness, privacy or security defect remains open in the approved scope, but the verification above is incomplete and one unrelated failure (Gratuity colour literal) is recorded and unfixed.

