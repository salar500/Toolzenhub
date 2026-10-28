# 08. Nonfunctional and security requirements

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Nonfunctional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-IP-001 | Correctness | Every output file is produced from the original input and is checked by an independent reader (Pillow for images; pypdf for PDF, test-only and not shipped). |
| NFR-IP-002 | Correctness | A tool says what it keeps, changes or may lose. It never says 'lossless' for a lossy step, and never claims metadata is removed beyond what a test shows. |
| NFR-IP-003 | Correctness | Sizes shown are the real Blob sizes. 'Up to N KB' is a bounded search and reports 'not reached' when it cannot be met; no exact size is ever promised. |
| NFR-IP-004 | Reliability | A failed or cancelled operation leaves no partial download and no stale result; the input files are never modified. |
| NFR-IP-005 | Reliability | One bad file never stops the others in a batch. |
| NFR-IP-006 | Privacy | No file, file name or content leaves the page: no request, no storage, no URL state, no logging. Tests prove this before any privacy sentence is shown. |
| NFR-IP-007 | Privacy | Privacy copy says 'not uploaded by this tool' and does not claim more (rulebook section 8). |
| NFR-IP-008 | Performance | Limits are guardrails proposed from existing specs and are measured on the build, then recorded in each pack; they are not safe-limit claims for every phone. |
| NFR-IP-009 | Performance | At most one full-size decoded image or rendered page is in memory at a time; previews are 640 px or smaller; thumbnails 160 px or smaller. |
| NFR-IP-010 | Performance | Heavy work runs in a Worker where the existing feature test passes and falls back to the main thread otherwise; the main-thread fallback is tested. |
| NFR-IP-011 | Performance | Object URLs are revoked on Remove, Reset, stale results and page unload; a repeated-run test shows no growth in live URLs. |
| NFR-IP-012 | Mobile | No horizontal overflow at 320, 360 and 390 px; tablets and desktop checked; targets at least 44 px; inputs at least 16 px. |
| NFR-IP-013 | Accessibility | Every control is keyboard-operable with visible focus; nothing depends on drag-and-drop or on colour alone; errors use aria-invalid and aria-describedby; one polite live region. |
| NFR-IP-014 | Accessibility | Headings stay in order; file lists are real lists with named buttons; contrast meets the design tokens already in use. |
| NFR-IP-015 | Browser | Chromium desktop and mobile emulation are tested. Safari, Firefox and real phones are recorded as unverified until tested; feature detection covers Worker, OffscreenCanvas, createImageBitmap and each encoder. |
| NFR-IP-016 | Dependencies | No new runtime dependency in P0. A library (for P1 PDF to Images) needs the full audit in doc 10 and a recorded owner decision on running it. |
| NFR-IP-017 | Build | Works under both bases ('/' and '/Toolzenhub/'); nothing unreferenced ships in dist; the build-output test passes. |
| NFR-IP-018 | Offline | After the first load the tools work without a network; no CDN is used. |
| NFR-IP-019 | Maintainability | New engines are pure modules with unit tests; the pipeline stays environment-injected as today; the design-token test passes. |
| NFR-IP-020 | Trust language | No 'guaranteed', 'perfect' or '100%'; no government endorsement implied; no unverified institution size shown. |
| NFR-IP-021 | Visual quality | Screenshots are inspected at about 1180 and 375 px and the new states are included in the visual baselines only after viewing. |
| NFR-IP-022 | Integration | Catalog, search aliases, SEO, canonical, sitemap and relationship tests are updated from the central catalog; counts are re-pinned deliberately. |

## 2. Security requirements

| ID | Requirement |
|---|---|
| SEC-IP-001 | Every input file is untrusted. Type is decided by bytes; the name and the declared type are never trusted. |
| SEC-IP-002 | Pixel and dimension limits are read from the header and checked before decoding, so a decompression bomb is refused without allocating its bitmap (existing rule, kept for every new path). |
| SEC-IP-003 | File names and metadata text are shown with textContent only; SVG is refused and never rendered. |
| SEC-IP-004 | Output names are sanitised: no path separators, control characters, trailing dots or reserved names. |
| SEC-IP-005 | Embedded content in a PDF (scripts, launch actions, external references) is never executed or fetched; P1 PDF to Images renders to pixels only and must disable scripting and network in the renderer. |
| SEC-IP-006 | Protected PDFs are refused, never unlocked (existing rule). |
| SEC-IP-007 | Third-party code is vendored from a verified source with licence, hash and provenance, and is not modified. |
| SEC-IP-008 | A library's runtime tests run only with the owner's permission for that execution; a refusal ends the attempt and is recorded, never worked around. |
| SEC-IP-009 | No user file is stored in localStorage, sessionStorage, IndexedDB or cookies; cross-tool file transfer does not exist in P0. |
| SEC-IP-010 | No document content or file name appears in a URL, a console message, an error report or analytics. |
| SEC-IP-011 | A worker is terminated on Cancel and on Reset; a stale worker answer is dropped. |
| SEC-IP-012 | Downloads use Blob object URLs with a generated name; the download attribute is set; nothing navigates to user data. |

## 3. Limits: proposed, and how each is to be measured

| Limit | Proposed (provisional) | Source | Measurement before it is stated as a limit |
|---|---|---|---|
| Files per batch (compressor) | 20 | competitor batch size (TinyPNG 20) and PDF tools (20) | Run 20 camera-class photos on the build; record time and the renderer memory curve; lower it if the main thread or memory is unsafe |
| Batch total | 100 MB | existing PDF and Photos to PDF total | As above |
| Per file / pixels / side | 25 MB, 40 MP, 16,384 px | existing (spec 20) | Already measured on a laptop (not a phone) |
| Output | 8,192 px per side, 16.7 MP | existing | Existing |
| Crop | inside the picture, at least 1 x 1 | requirement | Unit tests |
| PDF to Images (P1) | page count, scale and total pixels to be set by the spike | none yet | The spike (IP-4) |

No figure here is a measured safe limit for a phone. Real-phone memory is **UNKNOWN** (specs 20, 31 and 33 record the same gap).
