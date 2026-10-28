# 04. Complete candidate inventory

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. How to read this

Twenty-four serious candidates were considered across the existing Image Tools (2 tools) and PDF Tools (3 tools) and everything the master prompt named. The class is the feasibility class of the prompt (A browser-native, B library, C expensive or constrained, D needs external processing or fails a constraint). The last column is the verdict (rulebook 12.7) and priority, scored in 05.

**Consolidation decisions (the "one tool or several" question):**
- Format conversion is **not** a set of pages. The Image Compressor & Resizer already outputs JPEG, PNG or WebP (spec 20); separate "JPG to PNG" pages would duplicate it (C07, rejected). Search wording is handled with aliases and page copy at the ecosystem checkpoint.
- Rotate, flip and crop are **one enhancement inside the Compressor** (C02), not a separate page (C24, rejected): a user who must hit a form's pixel size and file size should not move between two pages.
- Rotating PDF pages already lives in `pdf-pages` (Extract, Reorder and Rotate); Split, Extract, Remove and Reorder are already coherent there and in `split-pdf`. No further PDF page-management tool is proposed.

| ID | Candidate | Kind | Main user problem | Input -> output | Class | Why (feasibility, overlap, security) | Evidence | Verdict / priority |
|---|---|---|---|---|---|---|---|---|
| C01 | Image Compressor: batch (several images, same settings) | existing enhancement | Make a set of photos smaller or fit a size in one go | N images -> N images | A | Reuses the verified single-image pipeline one file at a time; spec 20 excluded batch in V1 only | PUBLIC: TinyPNG offers 20 images per batch on upload with a 5 MB cap (2026-10-27); demand UNKNOWN | A / P0 |
| C02 | Image Compressor: rotate, flip, crop and exact output size | existing enhancement | Prepare a photo for a form that wants exact pixel size and a file-size cap without stretching it | 1 image -> 1 image | A | Resize with the aspect unlocked stretches today (spec 20); crop removes the need. Canvas source-rect crop, no new dependency | PUBLIC: Indian portal guidance seen in search snippets lists photo 20-50 KB and signature 10-20 KB with fixed pixel sizes, varying by organisation (not verified at source); demand UNKNOWN | A / P0 |
| C03 | Photos to PDF: rotate each photo; remove photo metadata from kept JPEGs | existing enhancement | Sideways scans; and a PDF that may still carry location data from the original JPEG | N photos -> 1 PDF | A | Rotate was P1 in spec 31. Metadata: the 'keep' path embeds original JPEG bytes (pdf-lib behaviour INFERRED, not tested); a one-test check decides whether stripping is needed | VERIFIED in code: embedStrategy 'keep' path; INFERRED: pdf-lib keeps APP segments | A / P0 |
| C04 | PDF to Images (PDF pages to JPG or PNG) | new tool | Turn pages of a PDF into pictures to share or reuse | 1 PDF -> N images | B (conditional) | Needs a renderer (PDF.js, Apache-2.0). Runtime and memory spike required before any approval; the spike must run third-party code, which an earlier session was refused | PUBLIC: iLovePDF lists Page to JPG and Extract images modes (2026-10-27); demand UNKNOWN | B / P1 |
| C05 | Photo metadata viewer and remover (lossless JPEG strip) | new tool | Remove location and camera data from a photo without re-compressing it | 1 JPEG -> 1 JPEG | A | Becomes cheap once C03's segment engine exists; value depends on privacy demand (hypothesis) | HYPOTHESIS | C / P2 |
| C06 | PDF compression | new tool | Make a PDF small enough to upload or email | 1 PDF -> 1 PDF | C/D | FAILS the reliable-output gate for now: pdf-lib cannot recompress images; a rasterise mode would destroy text; structural rewriting may make files larger. Revisit only with a tested method that shows real savings | PUBLIC: PDF24 compresses on servers with DPI, quality, font and image options (2026-10-27) | D / DEFER |
| C07 | Separate Image Format Converter page(s) (JPG/PNG/WebP) | new tool | Change an image's format | 1 image -> 1 image | A | FAILS the duplicate gate: the Compressor already outputs JPEG, PNG or WebP (spec 20). Handle with aliases and page copy, not new routes | VERIFIED in spec 20 | D / REJECT |
| C08 | PDF page numbers / watermark | new tool | Number or mark the pages of a PDF | 1 PDF -> 1 PDF | B | pdf-lib can draw text; fonts and non-Latin text need care | HYPOTHESIS; matrix row 9 scored 55 | C / P2 |
| C09 | PDF metadata viewer and remover | new tool | See or clear author, title and producer in a PDF | 1 PDF -> 1 PDF | B | XMP packets are not cleared by pdf-lib's Info setters; would need a test | HYPOTHESIS | C / P2 |
| C10 | HEIC to JPG | new tool | iPhone photos that other sites reject | 1+ HEIC -> JPEG | C | Needs a HEIC decoder (WASM). Licence, size and a runtime test are all open; Safari decodes HEIC natively but Chrome does not | HYPOTHESIS | C / DEFER |
| C11 | QR Code Generator | new tool | Make a QR code | text -> image | A | Already deferred by spec 32 (commodity); unchanged | VERIFIED in spec 32 | C / DEFER |
| C12 | OCR and PDF text extraction | new tool | Get text out of a scan or PDF | PDF/image -> text | C | OCR needs a model download and large memory; accuracy cannot be promised; text extraction needs the PDF.js spike first | HYPOTHESIS | D / DEFER |
| C13 | PDF to Word / Word to PDF | new tool | Edit or publish office documents | document -> document | D | FAILS the reliable-output and browser-local gates: layout fidelity is not achievable in-browser without a server | INFERRED | D / REJECT |
| C14 | PDF editing, signing and form filling | new tool | Change content, sign or fill forms | PDF -> PDF | C/D | Large scope; signature validity and form-field fidelity cannot be promised; pdf-lib forms and signatures untested (spec 33) | INFERRED | D / REJECT |
| C15 | PDF password protection | new tool | Lock a PDF with a password | PDF -> PDF | D | pdf-lib does not encrypt; no verified in-browser encryption library; a weak or wrong lock is worse than none | INFERRED from spec 33 (protected files refused) | D / DEFER |
| C16 | PDF password removal | new tool | Open a locked PDF | PDF -> PDF | D | FAILS the safety gate: spec 33 and its Do-not list say never remove protection | VERIFIED in spec 33 and 07 | D / REJECT |
| C17 | PDF repair | new tool | Open a damaged PDF | PDF -> PDF | D | Cannot promise a correct repair; silent loss of content is worse than a refusal | INFERRED | D / REJECT |
| C18 | Image background removal | new tool | Cut out a subject | image -> image | C | Needs an ML model download and heavy memory (06 I3) | VERIFIED in 06 | D / DEFER |
| C19 | SVG conversion | new tool | Convert to or from SVG | svg <-> raster | A | Little demand evidence; SVG is deliberately never rendered (spec 20 security) | VERIFIED in spec 20 | D / REJECT |
| C20 | Photo sheet for printing (user-defined photo size, several copies on A4) | new tool | Print identical small photos on one page | 1 image -> 1 PDF | A | Depends on C02 (crop); the user types the photo size, nothing institutional is hard-coded | HYPOTHESIS | B / P1 |
| C21 | Photos to PDF: aim for a file size | existing enhancement | Keep the PDF under an upload limit | N photos -> 1 PDF | B | Needs repeated whole-PDF builds; only an honest 'up to' is possible | HYPOTHESIS | C / P2 |
| C22 | Batch results as one ZIP (store-only writer, no dependency) | existing enhancement | Download many results at once | N files -> 1 zip | A | Own writer checked against Python zipfile; browsers may prompt on many separate downloads (hypothesis) | HYPOTHESIS | B / P1 |
| C23 | Advanced batch image editing (filters, watermark, bulk rename) | new tool | Edit many images | N -> N | C | Scope creep toward an editor (spec 20 excludes filters and annotations); no evidence | VERIFIED in spec 20 | D / REJECT |
| C24 | Standalone Image Rotate / Crop page | new tool | Rotate or crop an image | 1 image -> 1 image | A | FAILS the duplicate gate once C02 exists, and a second page adds a step (crop here, compress there) | REASONED | D / REJECT |

## 2. What already exists (not re-proposed)

Image Compressor & Resizer, Photos to PDF (Image Tools); Merge PDF, Split PDF, Extract, Reorder and Rotate PDF Pages (PDF Tools). QR Code Generator is a deferred draft (spec 32).
