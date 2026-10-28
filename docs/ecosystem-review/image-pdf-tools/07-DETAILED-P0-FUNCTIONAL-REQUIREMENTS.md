# 07. Detailed P0 functional requirements

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Scope

P0 means the three enhancements of existing tools (candidates C01, C02, C03). **There is no P0 new tool.** Each requirement is observable and has acceptance criteria in 09. Facets that apply to all three (accepted types, mobile, accessibility, privacy, performance, errors) are stated once in section 2 and in 08; per-tool facets are in the requirement text.

## 2. Facets common to all three enhancements

| Facet | Contract |
|---|---|
| Routes and sections | Unchanged: `/tools/image-compressor-resizer/` and `/tools/photos-to-pdf/`, Image Tools, flat. No new route. |
| Accepted types | JPEG, PNG, WebP by bytes; existing refusals for HEIC/HEIF, GIF, AVIF, SVG. |
| Existing limits kept | 25 MB per file, 40,000,000 input pixels, 16,384 px per side, output 8,192 px per side and 16,777,216 pixels; Photos to PDF 30 photos and 100 MB. |
| Input methods | File picker (always), drop zone (enhancement), no paste or URL. |
| Empty state | The existing empty state; nothing is shown as a result. |
| Errors | Specific, named per file; one message per problem; linked with `aria-describedby`. |
| Output | Blob downloads with generated, sanitised names; the input is never modified. |
| Cancellation | Existing Cancel (terminates the worker); finished results kept; nothing stale downloadable. |
| Preview | Original and result for the selected file only; thumbnails at most 160 px. |
| Related tools | Unchanged in P0 (decision D5 and rule 4.2: no related list across Image and PDF Tools). |
| Practical examples | One short example per page in the existing help section, written with the final behaviour. |
| Explicit exclusions | No upload, no server, no account, no storage, no URL state, no OCR, no HEIC, no filters or annotations, no institution-specific presets, no cross-tool file transfer. |

## 3. Requirements

### Image Compressor & Resizer: batch (Tool Pack IP-1)

- **FR-IB-001**: The file input and the drop zone accept 1 to 20 files in one selection (provisional; measured later). With exactly one file the page behaves as it does today, and its output for the same settings is byte-identical.
- **FR-IB-002**: Each file is checked on its own against the existing limits (25 MB, 40,000,000 pixels, 16,384 px per side). The batch total is limited to 100 MB (provisional). A refused file is listed with its reason, by name; the other files continue.
- **FR-IB-003**: The type of each file is decided by its bytes with the existing sniffing and the existing targeted refusals (HEIC/HEIF, GIF, AVIF, SVG, undecodable).
- **FR-IB-004**: A file list shows, per file, a small thumbnail (at most 160 px), the name, size, pixel size and a status (waiting, working, done, skipped, failed, cancelled). Each row has a Remove button whose accessible name includes the file name. Order is the order added; there is no drag-only action.
- **FR-IB-005**: In batch mode the resize choices are Keep original size, or Longest side N px (never enlarges, aspect always kept). Exact width and height and the aspect unlock are available only for a single image, with a sentence saying why.
- **FR-IB-006**: Output format, quality and Up to N KB behave exactly as for one image and apply to every file. A file that may have transparency is skipped with a reason when JPEG is chosen; it is never flattened silently.
- **FR-IB-007**: Files are processed one at a time: at most one decoded image is in memory. A progress line reads 'File n of N' and the list shows each status.
- **FR-IB-008**: Cancel stops the run. Results already finished are kept and the rest are marked cancelled. A failure on one file never stops the others.
- **FR-IB-009**: Each finished row shows before and after size, pixel size, format, the quality used (JPEG and WebP) and, for Up to N KB, whether the target was met or not reached. An output larger than its input is shown as larger, without success styling.
- **FR-IB-010**: A summary shows the total before, the total after and the difference, with the same honest wording as the single result.
- **FR-IB-011**: Each result has its own Download link. P0 has no Download all (separate downloads are not chained). A ZIP is P1 (candidate C22) and needs its own approval.
- **FR-IB-012**: Output names are the sanitised base name plus -compressed or -resized and the real extension; a repeated name gets -2, -3. Unicode names are kept as the existing sanitiser allows.
- **FR-IB-013**: Results are held as Blobs only. Object URLs are created for the preview and download, and revoked on Remove, Reset, a settings change and when the page unloads. Previews of the original and result are shown for the selected file only.
- **FR-IB-014**: Changing any setting after a run marks the results stale and clears them. Nothing stale can be downloaded.
- **FR-IB-015**: Reset clears the list, results, messages and object URLs, and moves focus to the file button.
- **FR-IB-016**: A batch announces through the polite live region only when the run starts, once when it finishes ('12 of 14 images done; 2 skipped') and on a cancel; never once per file.
- **FR-IB-017**: At 320, 360 and 390 px nothing widens the page; long file names stay inside their row; every control is at least 44 px; inputs are at least 16 px.
- **FR-IB-018**: No request carries image data, nothing is stored in the browser and the address does not change.

### Image Compressor & Resizer: rotate, flip, crop and exact size (Tool Pack IP-2)

- **FR-IC-001**: Rotate, flip and crop are available only when exactly one image is loaded; with several images they are disabled with a sentence saying why.
- **FR-IC-002**: Rotate left and Rotate right (90 degree steps) and Flip horizontally and vertically are buttons with a text state ('Rotated 90 degrees right, flipped horizontally') and a Reset picture control. Transformations are relative to the upright picture the user sees (EXIF orientation already applied).
- **FR-IC-003**: Crop mode is one of: No crop (default), Aspect ratio (Free, 1:1, 4:3, 3:4, 3:2, 2:3, 16:9, 9:16, Custom W:H) or Exact size (W x H pixels: the picture is cropped to that shape, then scaled, never stretched).
- **FR-IC-004**: The crop rectangle is always settable with four numeric fields (left, top, width, height in pixels of the transformed picture). Pointer handles are an enhancement; they never replace the fields.
- **FR-IC-005**: With the crop region focused, the arrow keys move it by 1 px and Shift plus an arrow by 10 px; Page keys are not captured.
- **FR-IC-006**: The rectangle is whole pixels, at least 1 x 1 and inside the picture; a value that would break this is refused on the field with a message, and the last valid rectangle is kept.
- **FR-IC-007**: Choosing a ratio places the largest rectangle of that shape, centred, inside the picture.
- **FR-IC-008**: The overlay on the preview maps to source pixels exactly: the numeric fields and the overlay always agree to the pixel after rounding to whole source pixels.
- **FR-IC-009**: Processing always starts from the original file: decode, apply rotate and flip, draw the crop rectangle as a source rectangle at the output size, encode. Nothing is cropped from a previous output, and no full-size intermediate canvas is kept.
- **FR-IC-010**: Crop comes before resize. In No crop and Aspect ratio modes the width and height fields describe the output and the aspect lock follows the cropped shape. In Exact size mode both are set by the user and the lock is off with the note 'Cropped to fit, not stretched'.
- **FR-IC-011**: Existing output limits (8,192 px per side, 16,777,216 pixels) and input limits are unchanged and apply after the crop.
- **FR-IC-012**: Output format, quality, Up to N KB and the transparency rules are unchanged; crop keeps alpha where the output format allows it.
- **FR-IC-013**: If the output is larger than the cropped area, the result says 'Enlarged: this can look soft'.
- **FR-IC-014**: The result shows the final pixel size and the crop used. The file name ends -cropped when a crop, rotation or flip was applied, otherwise -resized or -compressed as today.
- **FR-IC-015**: No institution's size is built in. The Custom ratio and Exact size fields take any value, with the line 'Check the size your form asks for; ToolZen Hub does not know it.'
- **FR-IC-016**: On touch screens the handles have a hit area of at least 44 px, the crop surface alone has touch-action none, and page scrolling elsewhere is unaffected.
- **FR-IC-017**: A change to the crop is announced through the polite live region after a short pause, as one message ('Crop 600 by 800 pixels, left 120, top 40'), not per keystroke.
- **FR-IC-018**: Cancel, Reset and stale-result behaviour are unchanged; a crop, rotation or flip change marks the result stale.

### Photos to PDF: rotate and photo metadata (Tool Pack IP-3)

- **FR-PP-001**: Each photo has Rotate left and Rotate right (90 degree steps) buttons whose accessible names include the file name and position, and a text state ('Rotated 90 degrees right').
- **FR-PP-002**: The thumbnail shows the rotation at once; Move up, Move down and Remove keep each photo's rotation with it.
- **FR-PP-003**: The PDF page shows the photo exactly as the thumbnail does. A 'keep' JPEG is rotated by page placement without being re-encoded when a test proves this is correct in an independent reader; otherwise it is redrawn at the existing quality and the page says so.
- **FR-PP-004**: Automatic orientation and Fit use the rotated width and height.
- **FR-PP-005**: Reset clears every rotation with the list.
- **FR-PP-006**: Before any change, a test settles a fact now only inferred: whether a kept JPEG's Exif, XMP and IPTC segments (which can hold GPS position) remain inside the PDF.
- **FR-PP-007**: If they remain, kept JPEGs have APP1 (Exif and XMP) and APP13 (IPTC) segments removed before embedding. The JFIF, ICC profile (APP2) and Adobe (APP14) segments stay, so colour does not change.
- **FR-PP-008**: The strip is lossless: the entropy-coded scan data and every other byte of the image are unchanged, checked byte for byte against the original.
- **FR-PP-009**: The page states what is removed only after FR-PP-006 and FR-PP-008 pass, and never claims that all metadata is gone.
- **FR-PP-010**: Existing limits (30 photos, 100 MB total, 25 MB per file, 40 MP) and the neutral PDF information (no producer, creator or date) are unchanged.
- **FR-PP-011**: With one unrotated photo, the PDF differs from today's only by the removed metadata segments, if any.
- **FR-PP-012**: The strip engine is a pure module with no browser API, so a later Photo Metadata tool (C05) can reuse it.

## 4. Worked examples (to become test fixtures)

1. **Batch:** three photos 4000x3000, 3000x4000 and 600x400, Longest side 800, JPEG quality 80: results 800x600, 600x800, 600x400 (the last is not enlarged).
2. **Exact size:** a 4000x3000 photo, Exact size 200 x 230 (a portrait shape, 200:230 = 0.8696). The height limits the crop: 3000 x 200/230 = 2608.7, so the centred crop is about 2609 x 3000 (the pack fixes the rounding rule and the test states the rectangle in advance, computed independently with Pillow), then scaled to exactly 200 x 230. Nothing is stretched.
3. **Rotate in a PDF:** a 3-photo PDF where photo 2 is rotated right gives a 3-page PDF whose page 2 shows photo 2 turned 90 degrees clockwise.
