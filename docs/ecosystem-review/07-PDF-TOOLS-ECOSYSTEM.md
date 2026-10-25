# 07. PDF Tools ecosystem

Scope: the PDF Tools section (approved by the owner 2026-10-26; rulebook 4.9; spec `docs/tool-packs/33-pdf-tools-batch.md`) with Merge PDF, Split PDF and Extract, Reorder and Rotate PDF Pages. All three are on the Pages preview (200) and **not on production** (404), as is `/pdf-tools.html`. Photos to PDF stays in Image Tools (06).

## Verified behaviour (spec 33 sections 7, 11 and 12; not re-run here)

- Built on the vendored pdf-lib 1.17.1 (MIT) only; no PDF.js, no custom parser. pypdf is a throwaway test oracle outside the repository.
- Protected files of every kind are refused, including owner-only restrictions; damaged, truncated and non-PDF files are refused by name.
- Bookmarks are **not** kept; an external link annotation survived in the spike; page turns are preserved; forms, signatures and tagged structure were **not tested and are not claimed**; internal links not tested.
- Limits (provisional, not measured on a phone): 20 files, 50 MB each, 100 MB total, 1,000 pages, 20 parts.
- Merge, Split and Pages each have unit and browser tests (32 unit, 40 browser per project).

## Journeys

| Journey | Class | Navigation today |
|---|---|---|
| Combine files, then fix order: Merge, then Extract/Reorder/Rotate | EXISTING | Mutual curated relations and body links among the three |
| Big document, take the needed part: Split, then Extract | EXISTING | Same |
| Photos to a PDF, then merge with other PDFs | PROPOSED | Rule 4.2 forbids a related-list link between Image Tools and PDF Tools. A body-text mention is the only allowed form, and the wording of rule 4.9 permitting it was written by Claude during the PDF batch and not separately reviewed by the owner (see 14, P3 (D5)) |

## Findings

| ID | Current problem | Recommendation | Priority | Approval |
|---|---|---|---|---|
| P1 | The three PDF tools have an OWNER-REPORTED Android PASS (device, browser, date and per-check results not supplied). Download and memory behaviour on real phones is therefore not documented in detail | Record the pass in spec 33 when the docs commit in 14 (P4) is approved; add details if the owner supplies them | Medium (evidence) | Owner |
| P2 | PDF features users expect after these three (page numbers, watermark, metadata view, compression) are unscheduled | RESEARCH-NEEDED per 02 table F; each would reuse pdf-lib. Compression, PDF to images and OCR need heavy renderers: DEFERRED | Medium | Owner |
| P3 | Section isolation versus the Photos to PDF journey | Decide how to connect Photos to PDF and Merge PDF without a cross-section related list (text-only guide, or a rule change) | Medium | Owner (14, P3 (D5)) |
| P4 | Preview-only; section not in production | Release is an owner decision (rulebook 11) | n/a | Owner |

## Do not

Do not promise that forms, signatures or bookmarks survive. Do not remove protection. Do not recommend blank-page removal or PDF to Images without resolving the risks recorded in P1 of the factory (never delete an uncertain page silently) and a memory spike.

## Not verified

Safari, Firefox, screen readers, large image-heavy PDFs, phone limits.
