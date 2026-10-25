# 06. Image Tools ecosystem

Scope: 2 published tools. Image Compressor & Resizer (`/tools/image-compressor-resizer/`, Tool Pack 20, production 200) and Photos to PDF (`/tools/photos-to-pdf/`, Tool Pack 31, production **404**).

## Built tools

| Tool | Input | Output | Notes (from specs and the module list) |
|---|---|---|---|
| Image Compressor & Resizer | One image file | One compressed or resized image | Android verification PASSED, with one layout issue fixed and retested (spec 20 status). Safari/WebKit unverified |
| Photos to PDF | Several photos | One PDF built with the vendored pdf-lib 1.17.1 | Local tests per this project's ledger; owner reported Android PASS in a prompt, no checklist in the repository |

## Journey

IMAGE INPUT, then COMPRESS or RESIZE, then PHOTOS TO PDF: **PARTIAL**. Photos to PDF curates the compressor as related, the compressor does not point to Photos to PDF, and neither page renders related tools (rule suppression, see 08 N1). A user who needs small photos inside a PDF has to find the compressor on their own. This is a same-section relation, so rulebook 4.2 allows it.

## Findings

| ID | Current problem | Recommendation | Priority | Approval |
|---|---|---|---|---|
| I1 | No path from the compressor to Photos to PDF | IMPROVE RELATED NAVIGATION (reciprocal curated relation plus display, N1) | Low cost, medium value | Phase A |
| I2 | Capabilities users ask of a compressor (target file size, batch, format output, crop/rotate) are unscheduled | Treat target size, resize modes and output format as ENHANCE of the existing tool, not new pages (02 table F). Never promise an exact file size when encoder limits prevent it | Hypothesis-led; needs evaluation | Owner |
| I3 | Metadata removal, passport-photo layout, background removal, OCR, watermark | RESEARCH-NEEDED or DEFERRED; background removal and OCR carry large model downloads and memory risk | Low | Owner |
| I4 | QR Code Generator is in this section's roadmap, deferred | KEEP DEFERRED (spec 32 DRAFT) | n/a | Owner |

## Boundaries

Browser memory and camera-photo size, EXIF orientation and error recovery were considered in specs 20 and 31; they were not re-tested here. Privacy claims must stay "not uploaded by this tool"; metadata removal must never be claimed complete without verification.

## Not verified

Current Safari/iOS behaviour, large-photo memory limits on real devices (limits are provisional in spec 31), accessibility per tool.
