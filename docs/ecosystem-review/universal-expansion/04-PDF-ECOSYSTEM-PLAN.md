# 04. PDF ecosystem plan (B12)

## What exists (verified)

PDF Tools (approved section, rule 4.9, flat, `/tools/<id>/`): **Merge PDF**, **Split PDF**, **Extract, Reorder and Rotate PDF Pages** (`pdf-pages`; per the earlier inventory, delete and duplicate are already possible through the page list). **Photos to PDF** sits in Image Tools by rule 4.9 (its input is photos). Libraries vendored: `pdf-lib` and `jspdf` (the vendor folder is 1.5 MB). Shared modules: `pdf-shared/pdf-ops.js`, `pdf-page.js`, `pdf-rules.js`. PDF.js is **not** vendored.

## Reference products (public evidence, doc 00)

Adobe's online Acrobat tools group tasks, not file formats: merge (a 500-page limit is stated), split, organize pages (rotate, move, delete, renumber), compress, crop, delete pages, and conversion to and from Word, Excel and PowerPoint. Regional pages disagree on whether sign-in is required. The lesson for ToolZenHub is the **task grouping and the plain verbs** ("Combine files", "Pick pages", "Reorder and rotate"), not the feature list. Adobe's conversion and compression rely on server-side processing, which ToolZenHub does not do. No visual or proprietary implementation is to be copied.

## Feasibility, browser-local

| Operation | Library | Fidelity | Memory and size risk | Verdict |
|---|---|---|---|---|
| Merge, split, extract, reorder, rotate, delete | `pdf-lib` (built) | Exact: pages are copied, not re-rendered | Bounded by file size limits already defined | Built |
| Add page numbers, header or footer text | `pdf-lib` | Adds text to existing pages; font embedding needed for non-Latin text | Low | **B** (N2) |
| Watermark (text) | `pdf-lib` | As above; opacity and rotation supported | Low | **B** (N2, same tool) |
| View or clear document metadata | `pdf-lib` | Exact for the Info dictionary; XMP packets need care | Low | **C** (N3) |
| PDF to images | PDF.js (new dependency; licence and size not verified in this phase, to be confirmed in the spike) | Renders pages; fonts and complex graphics vary | High: canvas memory per page; needs a page-by-page strategy | **B, spike** (N4) |
| Compress PDF | none adequate in `pdf-lib` | Re-encoding images is outside `pdf-lib`; savings often negligible | Medium | **D** for now (N5) |
| Encrypt or unlock | `pdf-lib` has no encryption support | n/a | n/a | **D** |
| OCR, Word or Excel conversion | server or heavy WASM | Layout fidelity cannot be promised | Very high | **D** |

Existing handling to preserve: invalid and encrypted files are rejected with a clear message; object URLs are released; processing stays in the browser; output validity is tested by reopening the produced file.

## Recommended small pack (not an Adobe clone)

1. **PDF Page Numbers and Watermark** (one tool, one job: "mark pages"). Position, format ("Page 3 of 12"), first-page option, font size, opacity, text or number. Output is a new file; the source is never modified. Spec first (rule 9.5). Verdict B, built only after its spec passes the section 12 gates.
2. **PDF to Images** only after a spike answers: PDF.js size (gzip), worker handling, peak memory for a 50-page file on a 4 GB laptop, licence text. If the spike fails, drop it and record why.
3. Everything else stays deferred or rejected (table above).

## Discoverability inside PDF Tools

The section landing (`/pdf-tools.html`) should group by task verb, not list tools in catalog order: **Combine** (Merge PDF, Photos to PDF cross-mention in text only, never a related list: rule 4.9), **Split and pick pages** (Split, Extract), **Reorder and rotate** (Pages), later **Mark pages** (N2). The grouping is presentation on the landing page; it adds no catalog record and no URL. Rule 4.2 means Photos to PDF may be named in prose but not listed as related.

## Out of scope

OCR, Word, Excel or PowerPoint conversion, compression, encryption, cloud storage, accounts, signing, and any server processing.
