# 10. Image & PDF Tools: shared architecture requirements and feasibility

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No code, test, baseline, rulebook or roadmap was changed.

## 1. Principle

Reuse what exists. A new shared module is justified only when two P0 tools use it (rulebook 9). Today that is exactly two things, both pure modules with no browser API:

| Shared capability | Used by | Notes |
|---|---|---|
| JPEG segment reader and lossless stripper (`jpeg-segments`) | Photos to PDF (IP-3); later a Photo Metadata tool (C05) | Keeps APP0, APP2 (ICC), APP14; removes APP1 and APP13; scan data byte-identical (FR-PP-007, 008) |
| Crop geometry (`image-geometry`) | Compressor (IP-2); later the photo sheet (C20) | Ratio rectangles, rounding rule, rotate and flip maths; checked against Pillow |

Not built: a shared file-list component (each tool's list differs: the Compressor's rows hold results, Photos to PDF's hold order), a shared preview component, a ZIP writer (C22 is P1), a Worker framework (the existing pipeline already injects its canvas environment).

## 2. Existing requirements kept

File selection by a real file input with the drop zone as an enhancement; keyboard alternatives for every pointer action (Move up and down already exist); progress and Cancel as today; Blob downloads; object URL revocation; one polite live region; central breadcrumb and catalog-driven section, search, SEO and counts; both build bases; no analytics change (the consent-based GA4 behaviour is untouched).

## 3. Catalog, search, SEO

No new routes or sections in Option A. At the checkpoint (IP-5): add conversion aliases to the Compressor's catalog entry (png to jpg, jpg to png, webp to jpg, jpg to webp, convert image), refresh its description and title only if the new capabilities warrant it, regenerate the inventory, re-pin counts, and re-check canonicals and the sitemap (the existing static checks). Titles must not promise exact file sizes.

## 4. Library audit (Class B candidates; nothing installed, nothing run)

| Library | Role | Licence | Maintenance | Size | Notes | Verdict |
|---|---|---|---|---|---|---|
| pdf-lib 1.17.1 (shipped) | PDF assembly, merge, split | MIT | no release since 2022-05 (VERIFIED earlier); npm latest 1.17.1 (VERIFIED 2026-10-27) | vendored | Cannot recompress images, encrypt, or render. Rotation by placement to be tested (R-IP-006) | Keep; no change |
| pdfjs-dist 6.4.299 | Render pages for PDF to Images | Apache-2.0 (npm registry) | repository active: last push 2026-10-26, not archived (GitHub API) | **34,913,648 bytes unpacked, 554 files** for the whole package; the subset that would ship is **UNVERIFIED** | No dependencies; optional `@napi-rs/canvas` (Node only). Worker file needed. Must run with scripting off and no network. **Not executed**: a spike needs the owner's permission to run third-party code | CONDITIONALLY FEASIBLE (not verified at runtime) |
| Squoosh codecs (MozJPEG, etc.) | Better JPEG/WebP encoders | Apache-2.0 (repo licence, VERIFIED) | active | WASM modules, size not checked | **Not needed**: the browser's native canvas encoders already work; adding codecs changes output and adds weight | Not proposed |
| libheif-based HEIC decoders | C10 | not audited | not audited | not audited | Deferred | NOT VERIFIED |
| ZIP libraries | C22 | not audited | | | A store-only writer is small and can be checked against Python `zipfile`; a library is not recommended | Own code, if approved |
| Python `pypdf`, Pillow | Independent test oracles | BSD-3 (pypdf per spec 33), HPND (Pillow) | | | Development only, never shipped; spec 33 and 20 already use them | In use |

Package metadata inspection is **not** proof of runtime correctness.

## 4a. Feasibility gates for each P0 enhancement

| Gate | IP-1 batch | IP-2 crop | IP-3 PDF |
|---|---|---|---|
| Browser capability | Existing pipeline | Canvas `drawImage` source rect (exists in all targeted browsers; Safari unverified) | pdf-lib, existing |
| Dependency and licence | none | none | none |
| Security and privacy | Existing | Existing | A byte parser on untrusted JPEG: bounded reads, tested on malformed input |
| Memory | One decode at a time; **phone figure UNKNOWN** | Source-rect draw avoids a full-size copy; **UNKNOWN on phones** | Existing 30-photo limit; unchanged |
| Output correctness | Pillow reads outputs | Pillow crop oracle | pypdf and a real renderer |
| Build and maintenance | Low | Low | Low |
| **Status** | **CONDITIONALLY FEASIBLE** (phone memory) | **CONDITIONALLY FEASIBLE** (touch crop, Safari) | **CONDITIONALLY FEASIBLE** (the Exif question and rotation in viewers) |

No candidate is marked VERIFIED FEASIBLE: nothing was built or run in this phase.

## 5. Image correctness (what the P0 work must keep)

Aspect ratio and exact pixels (crop then scale); EXIF orientation applied once; alpha kept where the format allows and JPEG refused for possible transparency; JPEG and WebP are lossy and said to be; PNG is lossless here; metadata removal is claimed only for what a test shows; animated formats (GIF) refused; file sizes are real Blob sizes; names are sanitised.

## 6. PDF correctness (what the P0 work must keep)

Output PDFs must parse in an independent reader; page order and page count match the list; neutral document information; no claim about fonts, annotations, forms, bookmarks or encryption beyond spec 33's recorded limits; protected, damaged and non-PDF inputs refused by name.

## 7. Delivery

GitHub Pages and the Hostinger package are both produced from the same build; no deployment change is proposed. A push needs the owner's approval; production is not recommended before the consolidated release.
