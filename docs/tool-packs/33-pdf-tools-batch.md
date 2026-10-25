# Tool Pack 33: PDF Tools batch (Merge PDF; Split PDF; Extract, Reorder and Rotate PDF Pages)

Status: **REQUIREMENTS AND SPIKE COMPLETE (2026-10-26). IMPLEMENTATION BLOCKED AT ONE OWNER DECISION: which section these tools belong to (section 3). No application code, catalog entry or route exists.** Documentation only.
Tier: **MEDIUM** (interactive file tools, no money, tax or legal content; they produce binary files, so structure is verified by an independent reader).
Evidence labels: **VERIFIED** (observed this session), **PUBLIC** (documentation, cited, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Authorization and scope

- **Authorization (recorded 2026-10-26).** The owner authorised development of exactly these three tools as a one-time, bounded batch, for local implementation and verification only, with no push, no deployment and no full regression. The batch is the one proposed in the preceding batch-selection report, which took them from the P1 inventory "Documents & Files" group in `docs/tool-pack-factory.md`:
  1. **Merge PDF** (P1 Documents & Files 1).
  2. **Split PDF** (P1 Documents & Files 2).
  3. **Extract, Reorder and Rotate PDF Pages** (P1 Documents & Files 5-7, the three "Secondary" page operations that rulebook 1.6 says are probably modes of one tool: here they are one tool).
- **Not authorised and unchanged:** PDF to Images, QR Code Generator, any other PDF or Documents & Files candidate, any new tool family, any reordering or re-statusing of Roadmap R1/R2/P1/P2. Photos to PDF (Tool Pack 31) is built and is not touched.
- The ids and routes below are **provisional**; a route exists only when the tool is built. Routes will be `/tools/<id>/` (the convention for flat non-calculator sections, rulebook 4.3).

| Tool (name as authorised) | Provisional id |
| --- | --- |
| Merge PDF | `merge-pdf` |
| Split PDF | `split-pdf` |
| Extract, Reorder and Rotate PDF Pages | `pdf-pages` |

## 2. Why these three, and how they differ

| | Merge PDF | Split PDF | Extract, Reorder and Rotate PDF Pages |
| --- | --- | --- | --- |
| Job | Several PDFs become one | One PDF becomes several | One PDF becomes one new PDF with chosen pages in a chosen order, optionally turned |
| Input | 2 to 20 PDFs | 1 PDF | 1 PDF |
| Output | 1 file | 1 to 20 files | 1 file |
| Overlap | None | "Split into parts" and "extract pages" are different outputs: Split cuts the whole document into consecutive parts; Pages builds one custom document | Single output of Split's "a range" case is reachable here too, by design: Split is for many files, this is for one |

## 3. The taxonomy decision (the one genuine approval boundary)

**Fact (VERIFIED in `assets/js/data/categories.js`):** the Image Tools section is described as "Private browser-based tools for resizing and optimizing images", and its own code comment says "only image tools belong here". Photos to PDF fits that (its input is photos). A PDF-in, PDF-out tool does not. Rulebook 4.2 gives each tool exactly one section, 4.7 says a creation, rename or move of a section needs the owner's approval (section 11, item 7), and the authorising instruction forbids a new top-level section without explicit approval. So the batch **cannot honestly be placed without a decision**.

Options (the recommendation is first):
1. **New section "PDF Tools"** with its own landing page (`/pdf-tools.html`, derived from the catalog). It needs the section 4.7 case: audience (people who handle documents), distinct jobs (merge, split, reorganise now; the 14-entry P1 Documents & Files group later), three useful products at launch, feasibility (this document), and demand evidence labelled per rulebook section 12 (**none gathered yet: HYPOTHESIS**). Photos to PDF stays in Image Tools unchanged, with cross-links.
2. **Widen Image Tools** to "Image and PDF tools": the section id, `/image-tools.html` and Photos to PDF's route stay; the section description, comment and SEO text change. It is a rename-class change under 4.7.
3. **Keep PDF tools out of the catalog** until the group is larger.

No other URL or existing tool changes under any option. If option 1 is chosen the batch also needs the section's description, icon and landing wiring (small, catalog-driven).

## 4. Shared requirements (all three tools)

- **Files:** PDF only, recognised by content (the file must start with `%PDF-` within its first 1 KB and contain `%%EOF` in its last 1 KB) and not by name or type. Anything else is refused by name with a reason.
- **Local only:** nothing is uploaded; no analytics on content; no file names or sizes are logged or sent; the tool code contains no network call (a source-scan unit test, as in Tool Pack 31). Do not claim offline support.
- **Encrypted PDFs:** refused with a clear message ("This PDF is protected with a password or restrictions. ToolZen Hub does not remove protection. Open it in a PDF reader that allows it and save an unprotected copy, only if you are allowed to."). This includes owner-only restrictions with an empty user password, because the library cannot tell them apart (VERIFIED, section 7).
- **Damaged or incomplete PDFs:** refused with a message that names the file. The extra `%%EOF` tail check exists because the library silently opens a truncated file with fewer pages (VERIFIED, section 7), which would produce a wrong output without any error.
- **Limits (PROVISIONAL, not measured on any phone):** 20 files, 50 MB per file, 100 MB in total for Merge, 1,000 pages in total, and 20 output files for Split. One job at a time.
- **Flow:** choose → arrange or set → create → download, in the Tool Pack 31 pattern: cards with numbered titles, an editable area that is `inert` while busy, Create (Merge, Split, Pages) / Cancel / Reset, a live region for announcements, a result card that takes focus, one object URL per result revoked on any change, Reset and `pagehide`. No Calculate-style automatic run (an explicit button, because creating a file is not an instant recalculation).
- **Cancellation:** checked between files and pages; Reset and Cancel drop late results. A document that cannot be read fails the whole job with its name; there is never a partial file.
- **Output hygiene:** classic cross-reference table (`useObjectStreams: false`); no creator, producer or date written (`updateMetadata: false`); no library name in the file; default names `merged.pdf`, `part-1.pdf` and so on, `pages.pdf`.
- **Not claimed:** compatibility with every PDF, preservation of bookmarks, forms, tags or digital signatures, or any phone's capacity. Output states plainly what is not kept (section 7).
- **Accessibility and mobile:** the Tool Pack 31 patterns, including `aria-disabled` end buttons that keep their label, names that include the file name, 44 px controls, one column below 640 px, no horizontal overflow at 320 to 390 px.
- **Shared code (planned):** `assets/js/tools/pdf-shared/` with `pdf-inspect.js` (header and tail check, load with the library, page count and sizes, error classification), `pdf-ranges.js` (the range parser below, pure) and `pdf-ops.js` (merge, split, organise; pure with the library injected), reusing the vendored pdf-lib (`assets/js/vendor/pdf-lib/`, version 1.17.1, already verified) through `loadPdfLib()`. No PDF.js, no new dependency.

## 5. Per-tool requirements

### 5.1 Merge PDF
- **Problem:** combine several PDFs into one, in a chosen order.
- **Inputs:** PDF files (multiple; more can be added). **Controls:** file list with Move up / Move down / Remove; no page settings.
- **Primary:** Create PDF. **Secondary:** Cancel, Reset. **Result:** one file, "N files, P pages", Download `merged.pdf`.
- **Details shown per file:** name, size, page count (read when the file is added, serially).
- **Empty state:** "Add at least two PDFs." (one file is allowed to be added but Create needs two).
- **Unsupported:** protected, damaged, non-PDF files, more than the limits; page-level content of the inputs is not edited.
- **Acceptance:** output page count = the sum; pages in file order then page order; every page's dimensions and rotation equal its source page; text labels of each page match the sources in order (independent reader); no extra blank pages.

### 5.2 Split PDF
- **Problem:** cut one PDF into several files.
- **Input:** one PDF (replacing it clears the result). **Mode (radio):** "Every N pages" (N, default 1) or "At these page ranges" (one part per range, for example `1-3, 4-4, 5-12`; each range makes one part). The ranges must be valid and within the page count; overlapping ranges are allowed (a part is only a copy).
- **Primary:** Create PDFs. **Result:** a list, one row per part ("part-1.pdf, pages 1 to 3, 3 pages") each with its own Download link. There is no ZIP in P0 (it would need a second library); with more than one part the page says so and each link works separately. Phones may ask permission to download several files in a row (**UNKNOWN**, to be checked on the phone).
- **Limits:** at most 20 parts; Every N is refused when it would make more than 20.
- **Acceptance:** the parts' page counts and ranges are exactly those requested; their pages match the source in order; the concatenation of all parts of an "Every N" split equals the source page for page.

### 5.3 Extract, Reorder and Rotate PDF Pages
- **Problem:** make one new PDF from chosen pages, in a chosen order, optionally turned.
- **Input:** one PDF; the page count and the size of each page are listed (up to 1,000 pages, read from the file; **no thumbnails in P0**, PDF.js is not justified yet).
- **Controls:** "Pages to keep, in order" (text, default all pages, for example `3, 1, 5-8`; a page may be repeated; `8-5` runs backwards; `all` is accepted), then "Turn" (None, 90° clockwise, 180°, 90° anticlockwise) and "Apply the turn to" (all kept pages, or a range such as `2, 4-6` of the original page numbers). A summary table shows the resulting page list ("Page 1 = original 3, turned 90°") before creating.
- **Primary:** Create PDF. **Result:** one file `pages.pdf` with the count, Download.
- **Validation:** the same range grammar as Split, with the clear messages in section 6.
- **Acceptance:** the output has exactly the listed pages in the listed order; each page's rotation equals (source rotation + the turn) modulo 360; dimensions unchanged; text labels in the listed order.

## 6. The range grammar (pure and shared)

`1-3, 5, 7-9`: pages are 1-based; items separated by commas (a semicolon or space between items is also accepted); `a-b` with a ≤ b is a run, `a-b` with a > b is a descending run (Pages tool only; refused in Split, where a part must be consecutive); whitespace ignored; the word `all`; no empty items, no zero, no negative numbers, no page beyond the document, no more than 1,000 resulting pages. Each error names the wrong item ("Page 12 does not exist: this PDF has 9 pages.").

## 7. Technical spike (2026-10-26): evidence ledger

Environment: Windows 10, Node 20.17.0, pdf-lib 1.17.1 (the vendored build), reader **pypdf 6.21.2 (BSD-3-Clause) with cryptography 50.0.2, installed only in a throwaway virtual environment outside the repository and used only as an independent oracle**. Fixtures were synthetic and disposable (labelled pages "A-P1" and so on, made by pdf-lib; the encrypted, annotated, bookmarked and rotated variants were made by pypdf, so the input is not made by the library under test). Scripts are in the scratchpad, not in the repository.

| # | Question | Result (VERIFIED) |
| --- | --- | --- |
| 1 | Does merging keep order and dimensions? | Yes: A (3 pages: 595x842, 612x792, 300x400), B (2 pages, an object-stream PDF) and C (1 page) merged into 6 pages in the expected order, with identical dimensions, read back with pypdf text extraction. |
| 2 | Is a source page's rotation kept on copy? | Yes: a page with `/Rotate 90` kept 90 in split and organise outputs. |
| 3 | Can pages be turned? | Yes with `setRotation(existing + turn)` modulo 360: 90 became 90, and 0 plus 270 became 270. |
| 4 | Order, subset, repetition and splitting through `copyPages` | Yes: [3,1,2] produced exactly A-P3, A-P1, A-P2; split parts had the expected pages. |
| 5 | Do link annotations survive? | An external URL link annotation on a copied page survived (1 annotation in the outputs that contained that page). Links to other pages, and any other annotation type, were **not tested**. |
| 6 | Do bookmarks survive? | **No.** The source had 2 outline entries; every output had 0. The page says so. |
| 7 | Forms (AcroForm), tags, signatures | **Not tested.** Not claimed. A signature would be invalidated by any edit; the page says outputs are new documents. |
| 8 | Encrypted input (AES-256, RC4-128, AES-128 with an owner-only restriction and an empty user password) | All three are refused with "is encrypted" by default. The owner-only case, which most readers open, is refused too: the tool cannot distinguish it. Decision: refuse; no bypass. |
| 9 | Not a PDF at all | Throws a parse error ("No PDF header found"). |
| 10 | A file that starts with `%PDF-` but is garbage | Throws a **TypeError** ("Cannot read properties of undefined"), not a parse error: error handling must catch every exception and classify, not match message text. |
| 11 | A truncated PDF (the first half of a 3-page file) | **Opens silently with 2 pages** (the third lost). This is the dangerous case. Mitigation: require `%%EOF` in the last 1 KB before loading (the truncated file fails that check). Files damaged in a way that keeps the tail are not detected: stated as a limitation. |
| 12 | Cost | Merging two 300-page text documents (124 KB each) took about 1 s in Node and added about 13 MB of heap; the output was 600 pages (read back with pypdf). **Browser time and memory, large scanned PDFs and any phone: UNKNOWN.** |

**Not established (UNVERIFIED):** any physical phone, Safari/WebKit and Firefox, large image-heavy PDFs (a 50 MB scan is the real memory risk), how a phone delivers several downloads, forms, internal links, tagged PDFs, signed PDFs.

## 8. References and licences

- **pdf-lib 1.17.1**: already vendored and verified in Tool Pack 31 (MIT; upstream `github.com/Hopding/pdf-lib`; integrity and notices in `assets/js/vendor/pdf-lib/NOTICE.txt`; no release since 2022-05-12, 0 `npm audit` findings). Merge, split, page copy and rotation are first-class features of its API (`copyPages`, `setRotation`). No second library is needed and no custom PDF parser or writer is written.
- **PDF.js (Apache-2.0)**: **not used** in P0. It would only be needed for page thumbnails or PDF to Images (excluded), at a large bundle and memory cost. Thumbnails are a P1 candidate, with their own decision.
- **pypdf (BSD-3-Clause)**: development-time oracle only, never shipped, not added to the repository; the unit tests will use the existing JS-only structure reader plus an optional Python check that skips when pypdf is absent.
- **Behaviour reference only** (no code copied): the commonly used browser-local PDF tools built on pdf-lib; their behaviour on encryption and truncation is exactly what section 7 measured instead.

## 9. Test design (to run when built; none is run yet)

- **Pure unit tests:** the range grammar (valid, descending, `all`, empty items, zero, beyond count, over 1,000, the exact message), `inspect` (header, tail, encrypted, non-PDF, garbage header, truncated), the planner for Every N and for ranges, rotation arithmetic.
- **Output tests with an independent reader:** extend `tests/helpers/pdf-structure.mjs` to read page labels (content streams are uncompressed in the synthetic fixtures), page count, MediaBox, `/Rotate`, and to flag Producer, creation date and the library name; plus the optional pypdf check for the same properties.
- **Browser (Chrome desktop and mobile emulation, one worker, zero retries):** per tool the full flow, download read back, refusals (protected, damaged, truncated, non-PDF, over limit), Reset, cancel, object-URL cleanup, keyboard, three phone widths; then one catalog, search, route, loading and static-check checkpoint.
- **Fixtures:** the synthetic set of section 7 (committed as small files with a generator and a manifest, as in Tool Pack 31).

## 10. Open items

1. **The section decision (section 3): blocks implementation.**
2. The Android acceptance of each tool is a separate release gate and is **not run**.
3. Demand evidence for a "PDF Tools" section is a HYPOTHESIS (section 3, option 1).
4. Copy for the "what is not kept" notice (bookmarks removed; forms, signatures and tags not preserved; link annotations to a page not verified).
