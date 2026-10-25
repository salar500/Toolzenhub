# Tool Pack 31: Photos to PDF (Image Tools; Roadmap R1 item 7)

Status: **P0 IMPLEMENTED LOCALLY (2026-10-25), PREVIEW AND PRODUCTION RELEASE NOT APPROVED.** The owner approved the bounded P0 implementation after the section 15 spike (Block 4); it is committed locally only (not pushed, not deployed), and the implementation notes are in section 16. The Roadmap R1 row for this candidate is **unchanged** in this phase (a roadmap status edit is a separate documentation step). The real-phone check (section 12) has **not** been run, so the mobile gate is open and no phone capacity is claimed.
Tier: **MEDIUM** (an interactive file tool with no money, tax or legal content; it produces a binary file, so structural correctness is verified independently).
Proposed id, slug and route: `photos-to-pdf`, `/tools/photos-to-pdf/` (catalog convention: id = slug; Image Tools tools live under `/tools/`). Section: **Image Tools** (`image-tools`, flat), the second tool after the Image Compressor & Resizer. Tool Pack number 31 was verified unused (the highest existing spec is 30). Nothing named `photos-to-pdf` or `qr-code` exists in `assets/`, `src/` or `tests/`.
Evidence labels: **VERIFIED** (observed this session), **PUBLIC** (a vendor or documentation page, cited, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Feasibility verdict and the rulebook section 12 review

Verdict: **B, needs further validation.** It is a real, recurring job, and it can stay browser-local. Two things are not proven and decide whether it is approved: phone memory and download behaviour (section 12 spike), and whether ToolZenHub can be meaningfully better than the many existing free tools.

| Dimension (weight) | Score | Reason (label) |
| --- | --- | --- |
| Search demand (25%) | 3 | People plainly look for "JPG to PDF" tools: at least five browser-based competitors came up in one search (PUBLIC, below). No volume is known. **Demand is UNKNOWN**; the score is a conservative hypothesis. |
| Repeat use (25%) | 3 | Form uploads, KYC and application documents recur for one person, but each use is a short task (HYPOTHESIS). |
| Practical usefulness (20%) | 4 | A phone user with several photos of a document needs one file; the usual answer is an upload site (HYPOTHESIS, consistent with the existing Image Compressor rationale, VERIFIED in spec 20). |
| Differentiation (10%) | 2 | Competitors already claim in-browser processing, reorder, page size and margins (PUBLIC). "No login" and "private" are **not** a differentiator without research (rulebook 12, item 5). A candidate reason: correctness and honesty (a size and page report, an orientation guarantee, no CDN dependency so it works offline after the first load). That is a hypothesis to be tested by the spike. |
| Feasibility and upkeep (10%) | 4 | PDF assembly is feasible with the MIT-licensed pdf-lib, self-hosted (section 15 spike). Upkeep: the PDF format is stable, but pdf-lib has had no npm release since 2022-05 (VERIFIED). |
| Trust, privacy, performance (10%) | 4 | Local processing is possible (section 6). Memory on phones is **UNKNOWN**. |

Mandatory gates: meaningful problem (pass); not a duplicate of an existing tool (pass: the Image Compressor handles one image and produces no PDF); reliable output (pass if the independent checks in section 9 pass); maintenance (pass); paid API (none needed); privacy (pass if no upload); **acceptable mobile experience (OPEN until the spike)**; not added for tool count (the rulebook's own test: the user job must justify it; the open question is differentiation).

Competitor evidence (PUBLIC, vendor claims, privacy claims not verified; one search, 2026-10-25): [miniwebtool.com/jpg-to-pdf](https://miniwebtool.com/jpg-to-pdf/) (JPG, PNG, WebP, GIF, BMP; reorder; page size, orientation, margins; live preview), [templated.io](https://templated.io/tools/convert-jpg-to-pdf/) (drag reorder, page size, margin, in-browser), [3dgifmaker.com](https://www.3dgifmaker.com/jpg-to-pdf/) (one image per page, auto-upright phone photos), [imageonline.co](https://imageonline.co/merge-jpg-images-to-pdf.php) (basic, page-size fit), [JPGtoPDF.io](https://alternativeto.net/software/jpegtopdf-io/about) (rotation, DPI, compression, N-up, PWA offline). Common weakness reported or implied: very large PDFs when images are embedded at full resolution, and memory limits on big batches. Pricing, account requirements and complaints were **not** researched in depth (UNKNOWN).

## 2. The decision and scope

**The decision it supports:** "Turn these photos into one PDF I can attach or upload, without sending them anywhere."

### P0 (essential for V1)
- Add JPEG, PNG and WebP files (same types and byte-sniffing as the Image Compressor: `sniffFormat`, with the same targeted refusals for HEIC/HEIF, GIF, AVIF, SVG).
- A visible list with a thumbnail, file name, size and position for each image.
- Reorder with **Move up / Move down** buttons (keyboard and touch accessible), and **Remove** per image.
- Page size: A4 (default), US Letter, or Fit to image. Orientation: Automatic (per image: landscape image on a landscape page), Portrait, Landscape. Margin: None, Small, Medium. Fit: the whole image inside the page, centred, never cropped.
- **Create PDF** button, then a result line (page count, file size) and a **Download PDF** button. This is an explicit action, not an automatic calculation, because building a file is heavy and the list is still being edited (the rulebook's rule against unnecessary Calculate actions concerns results, not file production).
- Reset (clears the list, result and errors, revokes every object URL, focuses the Add button). Cancel while a PDF is being built.
- Limits and specific, per-file error messages. Correct upright orientation of phone photos.

### P1 (valuable, after P0 is verified on a phone)
- Rotate an image by 90° steps (scanned pages shot sideways).
- Lossless embedding of PNG (Flate) instead of re-encoding.
- Editable file name.
- Fill-the-page (crop) fit.

### P2 (deferred; not built to imitate PDF editors)
Drag-and-drop reordering, N-up layouts, compression levels or DPI settings, password protection, page numbers, text or OCR, HEIC conversion, merging existing PDFs (that is a different job: Merge PDF is a P1-inventory candidate with its own approval), saving the list between visits.

## 3. Behaviour and rules

**Files.** Accepted: JPEG, PNG, WebP by content, not name. Limits proposed (**PROVISIONAL**, to be settled by the spike): 25 MB per file (the existing `MAX_FILE_BYTES`), 40,000,000 pixels and 16,384 px per side (the existing `MAX_INPUT_PIXELS` and `MAX_INPUT_SIDE`), at most **30 images**, at most **100 MB in total** (lowered from 150 MB at implementation; see section 16). Over a limit: that file is refused with a named reason and the others are kept. A duplicate file (same name and size) is accepted and shown; it is not silently dropped.
**Per-image processing.**
1. A baseline or progressive 8-bit JPEG with 1 or 3 components and no EXIF turn is **embedded as the original bytes** (DCTDecode), so quality is not reduced and large images stay as small as the original.
2. Anything else is decoded by the browser (`createImageBitmap`, which applies the EXIF turn, INFERRED from the note at `image-pipeline.js:229` and not tested for this tool), drawn on a canvas, and encoded as JPEG at a fixed quality (proposed 0.92). Transparent PNG/WebP pixels are placed on **white**, and the page says so.
3. CMYK JPEGs are re-encoded (the PDF colour model would otherwise need a Decode array).
**Page layout.** Page sizes in points: A4 595.28 × 841.89, Letter 612 × 792. Margins: None 0, Small 18 pt, Medium 36 pt. The image is scaled to fit the printable area, centred, aspect ratio kept; **ASSUMPTION A1:** images are scaled to fit the printable area, so a small image is enlarged; this matches the expectation for document photos. The alternative (never upscale) is decision D4.
**Output.** A PDF 1.4 file, one image per page, in list order, built with pdf-lib, self-hosted and loaded only on this page (sections 6 and 15). The result states the page count and byte size; if the PDF is larger than the sum of the inputs by more than a small margin it says why.
**Reset / navigation.** Reset clears everything. There is no persistence of images or the list (nothing stored).
**Errors.** One specific message per problem, in a polite live region, tied to the file (for example "photo-3.heic: HEIC isn't supported in this version. Export it as JPEG first."). A failed image never produces a silent partial PDF: the PDF is built only if every listed image succeeded, or the user removes the failed ones.

## 4. UX and design (existing system only)

| Control | Purpose and label | Default | Validation / disabled | Loading and feedback | Keyboard and mobile |
| --- | --- | --- | --- | --- | --- |
| Add photos | file input, label "Add photos" (multiple) | enabled | refuses wrong types per file | per-file messages | native picker on phones; a visible drop target is optional (P2) |
| Image list | ordered list; each row: thumbnail, name, size, position | empty with a hint | | thumbnail decoded at about 160 px and released | one row per line on a phone |
| Move up / Move down / Remove | per row, with the file name in the accessible name | first Move up and last Move down are `aria-disabled` | | row focus kept after a move; a polite announcement "Moved to position N" | buttons at least 44 px |
| Page size, Orientation, Margin | three selects with plain labels | A4, Automatic, Small | | | native selects |
| Create PDF | builds the file | disabled until at least one valid image | | progress ("Page 3 of 12"), Cancel button | focus moves to the result |
| Download PDF | saves the file | appears with the result | | "Downloaded" confirmation (best effort, see spike) | |
| Reset | clears all | enabled | | announces "Reset." | |

Empty state: one sentence and the Add button. The shell, tokens, buttons, fields, result block and the "out of date" marker for a changed setting after creation follow the existing tool pages; the global design system is not modified.

## 5. Privacy, security, dependencies

- Everything runs in the browser; no upload, no storage, no network call. No analytics event carries a file name, size or count.
- Object URLs (thumbnails and the download) are revoked on remove, Reset, replacement and page hide. Decoded bitmaps are closed after use (the Image Compressor's memory discipline, VERIFIED in `image-pipeline.js`).
- No file content is ever inserted as HTML; file names are shown via text nodes or the escape helper (`assets/js/ui/escape.js`).
- **One new dependency is proposed: pdf-lib 1.17.1 (MIT), vendored in the repository and lazy-loaded** (decision D2 as revised after the section 15 spike; this replaces the earlier "own writer" draft). It is **not** loaded from a CDN: the existing jsPDF loader (`pdfLoader.js:175`, jsPDF 2.5.1 from cdnjs at run time) would make this tool depend on a third party and fail offline. A third-party notices file must carry the licences of pdf-lib and its bundled packages (pako MIT and Zlib, @pdf-lib/upng MIT, @pdf-lib/standard-fonts MIT, tslib 0BSD; VERIFIED from the installed package manifests).
- Spec 20 excluded a codec or image-library dependency for the compressor, because that tool needed none. This tool's job is writing a PDF, which is a different case, and a custom writer was judged not clearly better than a proven library (section 15).
- pdf-lib stamps a Producer string and a creation date into the file by default; the tool should set neutral values (the file must not carry anything about the user's device).

## 6. Architecture

- `assets/js/tools/photos-to-pdf/pdf-build.js`: a thin module around pdf-lib (`PDFDocument.create`, `embedJpg`, `addPage`, `drawImage`, `save({ useObjectStreams: false })`), taking `[{ bytes, width, height }]` and page settings and returning the PDF bytes. The vendored library file lives under `assets/js/vendor/` (path to be settled at implementation) and is imported only by this page.
- `.../jpeg-info.js`: pure; reads SOF dimensions and component count, checks for an EXIF turn, rejects CMYK. Reuses `sniffFormat` and `readSize` from the compressor's `image-engine.js` where they fit.
- `.../index.js`: the page; list state; thumbnails; Create/Cancel; download through a Blob (chunks, not one concatenated buffer).
- Reuse from the Image Compressor: `checkFile`, `sniffFormat`, the limits, the Worker pattern (`image-worker.js`) for re-encoding off the main thread, and the object URL discipline.
- Catalog: id `photos-to-pdf`, section `image-tools`, `autoRelated: false` with `relatedTools: ["image-compressor-resizer"]`; search aliases (proposed): photos to pdf, jpg to pdf, images to pdf, combine images into pdf, picture to pdf. CSS `assets/css/tools/photos-to-pdf.css`; style entry in `src/_data/toolStyles.json`; a Growth ledger record. **None of this is registered in this phase.**
- Static hosting: nothing server-side; works under both base paths.

## 7. Reference research (GitHub, VERIFIED licence data from the API on 2026-10-25)

| Repository | Licence | Last push | Decision |
| --- | --- | --- | --- |
| [parallax/jsPDF](https://github.com/parallax/jsPDF) | MIT | 2026-10-21 | Not used for this tool (CDN, recompression risk). Remains the library for the existing calculator exports. Attribution: keep the licence notice if ever vendored. |
| [Hopding/pdf-lib](https://github.com/Hopding/pdf-lib) | MIT (package manifest and LICENSE.md VERIFIED), v1.17.1 | repository 2024-07-17; npm latest 1.17.1, modified 2022-05-12 | **Selected as the PDF library if the tool is approved (D2).** Spike results in section 15. It embeds JPEG without recompression. Upkeep risk (no npm release since 2022) is accepted for a stable file format. It would also serve Merge/Split PDF if that is ever approved. |
| [mozilla/pdf.js](https://github.com/mozilla/pdf.js) | Apache-2.0 | 2026-10-24 | Not a dependency. Candidate dev-time oracle to open the generated PDF (see section 9). Not otherwise used. |

Test coverage, bundle size and accessibility of these projects were **not** inspected (UNVERIFIED). No code is copied from any of them.

## 8. Mobile behaviour

One column; the list rows stack; every button at least 44 px; the Create PDF button and result sit directly under the settings; file picker opened by the native control. On a phone the main risks are memory with many large photos and how the download is delivered (section 12).

## 9. Independent test design (tier MEDIUM; the output is a binary file, so it gets an independent check)

- **Pure unit tests** (`node --test`): known JPEG fixtures (tiny synthetic baseline, progressive, grayscale, CMYK, EXIF-turned) are generated by a fixture script, with their widths, heights and component counts written in advance; the writer's output must contain exactly N pages, the `/MediaBox` sizes for A4, Letter and Fit-to-image, the expected image placement matrix, and the **original JPEG bytes unchanged** inside the image stream.
- **Independent parser:** a small Python script (`tests/fixtures/photos-to-pdf-check.py`, standard library only) re-parses the generated bytes from scratch: `startxref`, every xref offset must point at `N 0 obj`, `/Count` equals the page count, each page's `/Contents` and `/XObject` resolve, image stream lengths equal `/Length`, and the stream bytes hash to the input JPEG's hash. Image **order** is proved by giving each fixture a distinct size and checking the sequence. If `pypdf` happens to be installed it is used as an additional check (availability UNVERIFIED; not a requirement).
- **Validation:** invalid, empty, truncated, HEIC-like, GIF, SVG-text and renamed files; over the per-file, pixel, count and total limits.
- **State:** Reset and Cancel leave no object URLs (a browser test counts created and revoked URLs through a wrapper) and no stale result; Move up/down at the ends; removing every image disables Create.
- **Browser:** one focused Chrome spec (add two fixture images, reorder, create, download, parse the downloaded bytes with the same checker). Visual appearance alone is never treated as proof.
- **Not covered by automation:** how Safari, iOS and Android phone viewers and file managers handle the download, and large-batch memory. These are real-device checks.

## 10. Search, relationships, SEO (planned only)

Title and description in the existing style ("Photos to PDF: Combine Pictures into One PDF | ToolZen Hub"); related tool: Image Compressor & Resizer (shrink photos before combining; a natural link, not forced). No article is planned for V1 (the rulebook requires independent explanatory value).

## 11. Quality gate and exit criteria (if later approved)

Section 4 of the factory. For this tool in particular: the independent parser passes on every fixture; the phone spike's findings are recorded; a PDF of 10 typical phone photos opens correctly in Chrome and the phone's default viewer; the page works with the network disabled after the first load.

## 12. The real-phone spike (R1 requires it; **not run**)

On one real Android phone (and, if available, an iPhone): (1) build a PDF from 5, 15 and 30 camera photos of 3–12 MB each and record whether the tab survives and the time taken; (2) check that EXIF-turned photos are upright in the viewer; (3) record how the download is delivered and whether it can be found afterwards; (4) open the PDF in the phone's default viewer; (5) record the peak memory behaviour if observable. Safari and iOS availability are **UNKNOWN**. The limits in section 3 are provisional until these results exist.

## 13. Open decisions for the owner

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | Approve a bounded implementation after the spike? | Run the spike first; approve only if it passes |
| D2 | PDF assembly: pdf-lib vendored and lazy-loaded (revised 2026-10-25 after the spike), an own minimal writer, or jsPDF from the CDN? | pdf-lib vendored (no CDN, offline, original JPEG bytes kept). Adds about 525 KB (207 KB gzip) loaded only on this page. |
| D3 | Provisional limits: 30 images, 25 MB each, 100 MB total (implemented; was 150 MB in the draft) | Keep until a phone has been measured |
| D4 | Enlarge small images to fit the page? | Yes (assumption A1) |
| D5 | Rotate in V1 (P1) or P0? | P1 |
| D6 | Differentiation is only a hypothesis; accept that risk? | Owner's call |

## 14. Deferred items
Everything in P2 above. Nothing here changes Roadmap R1.

## 15. Technical spike (2026-10-25): evidence ledger

Scope: a bounded feasibility spike with **synthetic images only**, run outside the repository (nothing in the repo was changed by it except this section). Environment: Windows 10, Node 20.17.0, desktop Google Chrome headless driven by the repository's Playwright 1.63, low-memory laptop. Repository base commit `63241d2`. Library: pdf-lib 1.17.1 from npm (licence read from its manifest). The independent checker is a standard-library Python script that re-parses each generated PDF from its bytes (xref offsets, page count, image order by distinct widths, and the SHA-256 of every embedded image stream against its input JPEG).

| Check | Result | Environment and note |
| --- | --- | --- |
| 5 images, 3000×2000, 1.48 MB in | PDF 1.48 MB; build 50 ms; page count, order and JPEG bytes verified | desktop Chrome headless |
| 15 images, 3000×2000, 4.38 MB in | PDF 4.39 MB; 106 ms; verified | same |
| 30 images, 1600×1200, 5.29 MB in | PDF 5.31 MB; 131 ms; verified | same |
| 1 image, 4000×3000, 1.72 MB in | verified | same |
| 30 JPEGs padded to 2 MB each, **60 MB in** | PDF 62.9 MB (+19 KB); build 843 ms; JS heap peak 134 MB; verified | same; the padding trailing the JPEG end is ignored by decoders, so this tests payload, not decoding |
| Original JPEG bytes embedded unchanged | PASS (hash of every stream equals its input) | pdf-lib `embedJpg` |
| Download via Blob URL and `a[download]` | PASS in desktop Chrome headless: file name `photos.pdf`, bytes identical to the built PDF | **Mobile behaviour UNVERIFIED** |
| Object URL cleanup | PASS: after `revokeObjectURL` the URL can no longer be fetched | desktop Chrome headless |
| Network use | The page made no request other than its own blob URL | pdf-lib was injected from a local file |
| EXIF orientation | **Finding:** for a JPEG with Orientation 6, `createImageBitmap` applies the turn (200×400) but pdf-lib `embedJpg` ignores it (400×200). A pass-through JPEG with an EXIF turn would therefore appear sideways in the PDF. The rule in section 3 (re-encode when an EXIF turn is present) is **required**, not optional | synthetic JPEG with a hand-built Exif segment; real camera files not tested |
| WebP | pdf-lib cannot embed it ("SOI not found in JPEG" when treated as JPEG); canvas re-encode is required, as specified | |
| Garbage bytes | Refused with an error from pdf-lib; our own byte sniffing still comes first | |
| `CompressionStream` | present in this Chrome | other browsers UNVERIFIED |
| Library size and licences | 525,099 bytes minified (206,939 gzip); MIT with MIT, Zlib, 0BSD bundled packages | |

**Not established (UNVERIFIED):** any physical phone (Android or iOS) behaviour, mobile browser memory limits, how a phone delivers the download, Safari and Firefox, real camera photos of 3–12 MB (the synthetic JPEGs are small except the padded ones), PNG embedding at scale (pdf-lib decodes PNG in JavaScript), and whole-process memory (the figure above is the JS heap only and excludes external buffers). The provisional limits in section 3 (30 images, 25 MB each, 150 MB total) are **therefore not yet validated**; the desktop run supports the 60 MB case technically but says nothing about phones. The mobile gate stays **open**.

**Engineering decisions recorded:** (1) use pdf-lib rather than a custom writer, because the spike shows it keeps the original bytes with negligible overhead, so a custom writer would not be clearly better; (2) keep the EXIF re-encode rule; (3) set neutral PDF metadata; (4) self-host the library and add a notices file; (5) no change to the roadmap, the verdict (still **B**) or the approval status.

## 16. Implementation notes (P0, 2026-10-25, local only)

Scope built: exactly the P0 list in section 2, nothing from P1 or P2. Id and route `photos-to-pdf`, `/tools/photos-to-pdf/`, section Image Tools (the second tool there), `autoRelated: false`, one curated one-way relation to the Image Compressor & Resizer (the compressor's own list stays empty and is pinned by a test).

**Files.** `assets/js/tools/photos-to-pdf/` (`pdf-rules.js` pure rules, `pdf-build.js` PDF assembly with the injected library, `image-prep.js` browser decoding and previews, `index.js` the page), `assets/css/tools/photos-to-pdf.css`, `assets/js/vendor/pdf-lib/` (the unmodified upstream build, `NOTICE.txt`, `LICENSE.txt`), the catalog entry, `src/_data/toolStyles.json`, the Growth ledger record, tests (below).

**Decisions made while building (consequential ones only).**
1. **Total limit 100 MB, not 150 MB**: while a PDF is built the browser holds about twice the input plus the output, so the draft figure was lowered for caution. Still provisional; no phone has been measured.
2. **"Same shape as each image"** fixes the longest side of the picture area at 841.89 pt (an A4 long edge) and adds the margin around it, so a 4000 px photo does not become a page tens of inches wide. The direction setting is disabled and says so.
3. **Redraw size cap**: a photo that must be redrawn (PNG, WebP, EXIF-turned, CMYK, 12-bit, lossless or Adobe-RGB JPEG) is drawn at most 16.7 megapixels; larger ones are reduced in proportion and the result says so. A JPEG that is kept is never decoded by the page.
4. **Previews are canvases**, not object URLs. The only object URL is the finished PDF; it is revoked when replaced, when the list or a setting changes, on Reset and on `pagehide`.
5. **Editing is locked while a PDF is built** (the editable cards are `inert`); only Cancel and Reset work. Cancel and Reset drop a late result; a photo that cannot be read fails the build with its name instead of producing a partial PDF.
6. **No Calculate-style automatic run**: the explicit Create PDF button is kept (section 2).
7. **Neutral file**: no creator, producer or date is written (`updateMetadata: false`); a test fails if one appears.
8. **Library files**: the licence file is named `LICENSE.txt` because the build-output check rejects `.md` files in the deployed site.

**Evidence ledger (this phase).** Base `61c87b7`; environment: Windows 10, Node 20.17.0, Chrome driven by Playwright 1.63, `--workers=1`; synthetic fixtures made by Pillow 10.4.0.

| Check | Scope | Result |
| --- | --- | --- |
| `tests/unit/photos-to-pdf.test.mjs` | 26 tests: JPEG reading and the keep/redraw rule on 11 fixtures, limits, ordering, hand-calculated layout and properties, PDF read back by an independent reader (pages, order, MediaBox, placement matrix, original bytes), a second reader in Python, 30 x 1 MB, cancel, failure, no creator or date, vendored file hash against its notice, no network or storage in the tool's code | 26 pass |
| `tests/browser/photos-to-pdf.spec.js` | 13 tests in Chrome desktop and again in the mobile emulation project: flow, reorder, remove, keyboard, redraw of PNG/WebP/EXIF/CMYK in a real decoder (EXIF turn applied), refusals, stale result and object URL cleanup, limit of 30, no external request, three phone widths | 13 pass (desktop) and 13 pass (mobile emulation) |
| Affected existing unit tests | catalog, sections (also root mode), relationships, search, taxonomy (also root), directory, tool-catalog, tool-capabilities, tool-page, build-output, articles, image-engine, growth manifest (registry, items, source-state, manifest), shared-ui, workflow | updated where they pin the published set; all pass except `design-tokens` "colour tokens", which fails on `calculators/gratuity.css` (a pre-existing finding in a file this change does not touch) |
| Static checks | URL inventory, links, assets (including the vendored import path), SEO, on both builds | pass |
| Navigation, DOM, SEO and links baselines | `navigation.spec.js` (All Tools counts), `dom-baseline.spec.js` (tools directory), `seo-baseline.spec.js`, `links.spec.js` | The two counts were updated for the second Image Tools tool. The DOM, SEO and links baselines were refreshed; their diffs also absorbed earlier drift that was already failing on `main` (the Salary / CTC page and its listing entry, and text-length changes on SIP, Investment and Terms), so they now describe the current site |

**Not run (by design for this phase):** the full regression, the visual baselines (no visual baseline exists for this page yet), Lighthouse, the other browser specs, Safari/WebKit and Firefox, any physical phone, screen readers.
**Still unverified:** everything listed under "Not established" in section 15. In particular the 30-photo, 25 MB and 100 MB limits are not validated on any phone, and how a phone delivers the download is unknown.
