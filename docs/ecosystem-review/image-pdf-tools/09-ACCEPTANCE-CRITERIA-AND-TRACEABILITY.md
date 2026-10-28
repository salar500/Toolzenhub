# 09. Acceptance criteria and traceability

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Acceptance criteria

None of these has been run. They are proposals for the Tool Pack that will implement them. "Oracle" means an independent reference (Pillow, pypdf as a test-only tool) that does not share code with the implementation.

| ID | Covers | Criterion | Test category | Risk | Pack |
|---|---|---|---|---|---|
| AC-IB-001 | FR-IB-001 | One file in, same settings: the output bytes equal those of the build before this change (fixture compare). | UNIT+BROWSER | R-IP-001 | IP-1 |
| AC-IB-002 | FR-IB-001 | Selecting 21 files adds 20 and names the one not added; the existing multi-file refusal test is rewritten for the new rule. | BROWSER | R-IP-001 | IP-1 |
| AC-IB-003 | FR-IB-002 | A 26 MB file, a 17,000 px file, a 41 MP file and an empty file are each refused by name while two valid files are processed. | BROWSER | R-IP-002 R-IP-004 | IP-1 |
| AC-IB-004 | FR-IB-002 | A set whose total is over 100 MB stops adding files at the limit and says how many were not added. | UNIT+BROWSER | R-IP-002 | IP-1 |
| AC-IB-005 | FR-IB-003 | A PNG named .jpg, a HEIC, a GIF, an SVG with a script and a text file are classified by bytes with the existing messages. | UNIT | R-IP-012 | IP-1 |
| AC-IB-006 | FR-IB-004 | Rows show thumbnail, name, size, pixel size and status; each Remove button's name contains the file name; removing a row removes its object URL. | BROWSER+A11Y | R-IP-002 | IP-1 |
| AC-IB-007 | FR-IB-005 | Longest side 800 on a 4000x3000 and a 600x400 file gives 800x600 and 600x400 (never enlarged); aspect to within one pixel. | UNIT | R-IP-004 | IP-1 |
| AC-IB-008 | FR-IB-005 | With two files loaded the exact width/height and unlock controls are disabled and the sentence is present. | BROWSER | R-IP-004 | IP-1 |
| AC-IB-009 | FR-IB-006 | JPEG output with one transparent PNG and one opaque PNG: the first is skipped with a reason, the second is converted; no flattened copy is produced. | BROWSER | R-IP-012 | IP-1 |
| AC-IB-010 | FR-IB-006 | Up to 200 KB on three fixtures reports met or not reached per file, and every reported size equals the real Blob size. | UNIT+BROWSER | R-IP-003 | IP-1 |
| AC-IB-011 | FR-IB-007 | A 10-file run never holds more than one decode at a time (instrumented pipeline counter) and the main thread's longest gap stays under the measured single-file figure plus a margin set in the pack. | PERF-MEASURE | R-IP-001 | IP-1 |
| AC-IB-012 | FR-IB-008 | Cancel during file 3 of 6 leaves files 1 to 2 downloadable and 3 to 6 marked cancelled; a corrupt file in the middle is marked failed and the rest finish. | BROWSER | R-IP-001 | IP-1 |
| AC-IB-013 | FR-IB-009 | A tiny already-optimised file yields 'Larger by' with no success styling; the figures equal the Blob sizes. | UNIT+BROWSER | R-IP-003 | IP-1 |
| AC-IB-014 | FR-IB-010 | The summary totals equal the sum of the rows (checked in the test, not recomputed from the same code). | UNIT | R-IP-003 | IP-1 |
| AC-IB-015 | FR-IB-011 | Each Download link downloads a file that an independent decoder (Pillow in the fixture script) opens with the stated format and size. | FIXTURE-ORACLE | R-IP-003 | IP-1 |
| AC-IB-016 | FR-IB-012 | Two inputs named photo.jpg give photo-compressed.jpg and photo-compressed-2.jpg; a Unicode name and a 200-character name are handled without path characters. | UNIT | R-IP-004 | IP-1 |
| AC-IB-017 | FR-IB-013 | After a 10-file run, Reset leaves no live object URL and no retained Blob (page hook counts); repeated 5 runs do not grow the count. | BROWSER+PERF-MEASURE | R-IP-001 | IP-1 |
| AC-IB-018 | FR-IB-014 | Changing quality after a run clears the results and disables every Download link. | BROWSER | R-IP-003 | IP-1 |
| AC-IB-019 | FR-IB-015 | Reset empties everything and focuses the file button. | BROWSER+A11Y | R-IP-001 | IP-1 |
| AC-IB-020 | FR-IB-016 | A 14-file run produces at most three live-region messages. | BROWSER+A11Y | R-IP-017 | IP-1 |
| AC-IB-021 | FR-IB-017 | At 320, 360 and 390 px there is no horizontal overflow with a 200-character file name; controls are at least 44 px. | MOBILE+VISUAL | R-IP-017 | IP-1 |
| AC-IB-022 | FR-IB-018 | No request carries image data, storage stays empty and the URL is unchanged after a run. | SECURITY | R-IP-018 | IP-1 |
| AC-IC-001 | FR-IC-001 | With two images loaded the Rotate, Flip and Crop controls are disabled and explained. | BROWSER | R-IP-004 | IP-2 |
| AC-IC-002 | FR-IC-002 | Rotate right then flip horizontally on an asymmetric fixture gives the pixel pattern computed in advance (Pillow oracle). | FIXTURE-ORACLE | R-IP-004 | IP-2 |
| AC-IC-003 | FR-IC-002 | An EXIF Orientation 6 fixture shown upright then rotated right ends as the 180-degree-from-original result, not double-rotated. | FIXTURE-ORACLE | R-IP-004 | IP-2 |
| AC-IC-004 | FR-IC-003 FR-IC-007 | Each ratio preset on a 4000x3000 image gives the expected largest centred rectangle, to the pixel. | UNIT | R-IP-004 | IP-2 |
| AC-IC-005 | FR-IC-004 FR-IC-006 | Left, top, width and height refuse 0, negative, decimal, text and out-of-bounds values on the field; the last valid crop stays. | UNIT+BROWSER | R-IP-004 | IP-2 |
| AC-IC-006 | FR-IC-005 | Arrow keys move the focused region by 1 px and Shift by 10 px and clamp at the edges. | BROWSER+A11Y | R-IP-004 | IP-2 |
| AC-IC-007 | FR-IC-008 | A crop dragged with the pointer and the same crop typed give identical output pixels. | BROWSER | R-IP-004 | IP-2 |
| AC-IC-008 | FR-IC-009 | The output of crop (100,50,300,200) equals the Pillow crop of the same box; no intermediate canvas larger than the output exists (instrumented). | FIXTURE-ORACLE+PERF-MEASURE | R-IP-005 | IP-2 |
| AC-IC-009 | FR-IC-010 | Exact size 200x230 on a 4000x3000 photo returns exactly 200x230, centred crop, no stretch (feature check: a circle fixture stays circular). | FIXTURE-ORACLE | R-IP-004 | IP-2 |
| AC-IC-010 | FR-IC-011 | An exact size of 9000x100 is refused with the output-limit message. | UNIT | R-IP-005 | IP-2 |
| AC-IC-011 | FR-IC-012 | A transparent PNG cropped to PNG keeps its alpha; cropped to JPEG is refused as today. | FIXTURE-ORACLE | R-IP-012 | IP-2 |
| AC-IC-012 | FR-IC-013 | Exact size larger than the crop shows the soft-image note; not shown otherwise. | BROWSER | R-IP-004 | IP-2 |
| AC-IC-013 | FR-IC-014 | Crop plus resize names the file -cropped and the result lists final pixels and crop box. | BROWSER | R-IP-004 | IP-2 |
| AC-IC-014 | FR-IC-015 | No portal name or fixed institutional size appears in the page text or code (grep test); the check-your-form line is present. | UNIT | R-IP-019 | IP-2 |
| AC-IC-015 | FR-IC-016 | On a 390 px emulated touch screen the handle hit area is at least 44 px and a vertical page swipe outside the crop surface scrolls the page. | MOBILE | R-IP-017 | IP-2 |
| AC-IC-016 | FR-IC-017 | Ten arrow presses produce one announcement after the pause. | BROWSER+A11Y | R-IP-017 | IP-2 |
| AC-IC-017 | FR-IC-018 | Changing the crop after a result clears it; Cancel during a cropped 24 MP run stops it and keeps the previous state clean. | BROWSER | R-IP-001 | IP-2 |
| AC-PP-001 | FR-PP-001 FR-PP-002 | Rotate right on photo 2 of 3 rotates its thumbnail only and the button name includes 'photo 2' and its file name. | BROWSER+A11Y | R-IP-006 | IP-3 |
| AC-PP-002 | FR-PP-002 FR-PP-005 | Moving a rotated photo keeps its rotation; Reset clears all. | BROWSER | R-IP-006 | IP-3 |
| AC-PP-003 | FR-PP-003 FR-PP-004 | The built PDF read by pypdf (test oracle) and rendered in the browser shows the same upright picture as the thumbnail for 0, 90, 180 and 270 degrees, with the page size following the rotated shape. | FIXTURE-ORACLE | R-IP-006 | IP-3 |
| AC-PP-004 | FR-PP-006 | A JPEG with planted Exif GPS text is built into a PDF and the PDF bytes are searched for the marker; the result is recorded as the answer to the open question, before any code change. | UNIT | R-IP-007 | IP-3 |
| AC-PP-005 | FR-PP-007 FR-PP-008 | After the strip, the JPEG has no APP1 or APP13, keeps APP0, APP2 and APP14, and every byte from the first SOS marker onward is identical to the original. | UNIT | R-IP-007 | IP-3 |
| AC-PP-006 | FR-PP-007 | An ICC-profiled fixture renders with the same colours before and after (pixel compare in a real decoder within a stated tolerance). | FIXTURE-ORACLE | R-IP-007 | IP-3 |
| AC-PP-007 | FR-PP-009 | The page contains no metadata claim unless AC-PP-004 and AC-PP-005 have passed; once they have, the claim names what is removed and says other data may remain. | UNIT | R-IP-007 | IP-3 |
| AC-PP-008 | FR-PP-010 FR-PP-011 | The 30-photo limit, 100 MB limit and neutral PDF information still hold; a one-photo PDF differs from the old build only in removed segments. | UNIT+BROWSER | R-IP-006 | IP-3 |
| AC-PP-009 | FR-PP-012 | The strip module imports no browser API (static test) and runs under node --test. | UNIT | R-IP-007 | IP-3 |

## 2. Traceability: requirement to criteria

| Requirement | Criteria |
|---|---|
| FR-IB-001 | AC-IB-001 AC-IB-002 |
| FR-IB-002 | AC-IB-003 AC-IB-004 |
| FR-IB-003 | AC-IB-005 |
| FR-IB-004 | AC-IB-006 |
| FR-IB-005 | AC-IB-007 AC-IB-008 |
| FR-IB-006 | AC-IB-009 AC-IB-010 |
| FR-IB-007 | AC-IB-011 |
| FR-IB-008 | AC-IB-012 |
| FR-IB-009 | AC-IB-013 |
| FR-IB-010 | AC-IB-014 |
| FR-IB-011 | AC-IB-015 |
| FR-IB-012 | AC-IB-016 |
| FR-IB-013 | AC-IB-017 |
| FR-IB-014 | AC-IB-018 |
| FR-IB-015 | AC-IB-019 |
| FR-IB-016 | AC-IB-020 |
| FR-IB-017 | AC-IB-021 |
| FR-IB-018 | AC-IB-022 |
| FR-IC-001 | AC-IC-001 |
| FR-IC-002 | AC-IC-002 AC-IC-003 |
| FR-IC-003 | AC-IC-004 |
| FR-IC-004 | AC-IC-005 |
| FR-IC-005 | AC-IC-006 |
| FR-IC-006 | AC-IC-005 |
| FR-IC-007 | AC-IC-004 |
| FR-IC-008 | AC-IC-007 |
| FR-IC-009 | AC-IC-008 |
| FR-IC-010 | AC-IC-009 |
| FR-IC-011 | AC-IC-010 |
| FR-IC-012 | AC-IC-011 |
| FR-IC-013 | AC-IC-012 |
| FR-IC-014 | AC-IC-013 |
| FR-IC-015 | AC-IC-014 |
| FR-IC-016 | AC-IC-015 |
| FR-IC-017 | AC-IC-016 |
| FR-IC-018 | AC-IC-017 |
| FR-PP-001 | AC-PP-001 |
| FR-PP-002 | AC-PP-001 AC-PP-002 |
| FR-PP-003 | AC-PP-003 |
| FR-PP-004 | AC-PP-003 |
| FR-PP-005 | AC-PP-002 |
| FR-PP-006 | AC-PP-004 |
| FR-PP-007 | AC-PP-005 AC-PP-006 |
| FR-PP-008 | AC-PP-005 |
| FR-PP-009 | AC-PP-007 |
| FR-PP-010 | AC-PP-008 |
| FR-PP-011 | AC-PP-008 |
| FR-PP-012 | AC-PP-009 |

## 3. Traceability: user problem to pack

| User problem | Feature | Requirements | Criteria | Risks | Pack |
|---|---|---|---|---|---|
| Reduce several photos for an upload | Compressor batch | FR-IB-001..018 | AC-IB-001..022 | R-IP-001..003 | IP-1 |
| Hit a form's exact pixel size and file size without stretching | Rotate, flip, crop, exact size | FR-IC-001..018 | AC-IC-001..017 | R-IP-004, 005, 019 | IP-2 |
| Fix sideways scans in a photo PDF | Rotate in Photos to PDF | FR-PP-001..005 | AC-PP-001..003 | R-IP-006 | IP-3 |
| Avoid sharing location data inside a PDF | Segment strip (after the test) | FR-PP-006..012 | AC-PP-004..009 | R-IP-007 | IP-3 |

## 4. Not covered by automation (stays a real-device or browser gate)

Safari, iOS, Firefox, a real Android gallery and camera photos, how a phone delivers a download, screen readers, and large-batch memory on a phone.
