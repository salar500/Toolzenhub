# 01. Image & PDF Tools: verified repository baseline

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read in this session), **PUBLIC**, **HYPOTHESIS**, **UNKNOWN**.

## 1. Repository state (VERIFIED at the start of this phase)

| Fact | Value |
| --- | --- |
| Branch | `main` |
| HEAD | `8291070` (Developer Tools checkpoint closure, local) |
| `origin/main` | `0dc368b`; HEAD is 15 local commits ahead, none pushed |
| Working tree | clean before this phase's documents |
| Stack | Eleventy, vanilla ES modules; no runtime dependencies except the vendored pdf-lib 1.17.1 (MIT, unmodified, with notice) |
| Environments | GitHub Pages preview deploys from any push to `main`; Hostinger production is manual and was not touched |
| Where the PDF batch is | commit `8ece03a` is an ancestor of `origin/main`, so the PDF tools are on the Pages preview; the earlier ecosystem review records them as **not on production** (HTTP 404, historical, not re-checked) |

## 2. A correction to the brief

The brief says the known existing Image Tool is the Image Compressor & Resizer and that Photos to PDF, merge and split were proposals. **The repository shows otherwise.** Five tools are published and tested:

| Tool | Route | Section | Spec | Code | Tests (declared, before project multiplication) |
| --- | --- | --- | --- | --- | --- |
| Image Compressor & Resizer | `/tools/image-compressor-resizer/` | Image Tools | 20 | `assets/js/tools/image-compressor-resizer/` (engine 757 lines, pipeline 410, worker 48, page 1,926) | 48 unit, 46 browser |
| Photos to PDF | `/tools/photos-to-pdf/` | Image Tools | 31 | `photos-to-pdf/` (rules 435, prep 138, build 83, page 1,038) | 26 unit, 11 browser |
| Merge PDF | `/tools/merge-pdf/` | PDF Tools | 33 | `merge-pdf/` (643) + `pdf-shared/` | PDF batch: 32 unit, 26 browser declared |
| Split PDF | `/tools/split-pdf/` | PDF Tools | 33 | `split-pdf/` (689) | same files |
| Extract, Reorder and Rotate PDF Pages | `/tools/pdf-pages/` | PDF Tools | 33 | `pdf-pages/` (754) | same files |

The section decision for PDF Tools was made by the owner on 2026-10-26 (rulebook 4.9). The "no merge or split in v1" remark in the brief was true of Photos to PDF's own scope (spec 31 P2 list); it did not stop PDF Tools being built separately. The brief's historical Trends summaries are **not recorded anywhere in the repository** (a search of `docs/` found no Trends data for these topics), so they are treated as unrecorded context, not evidence.

## 3. Image Compressor & Resizer: capability matrix (VERIFIED from spec 20 and the engine)

| Capability | State |
| --- | --- |
| Input | JPEG, PNG, WebP by bytes; HEIC, GIF, AVIF, SVG refused by name |
| Files at once | **One** (a second selection replaces the first; several dropped files are refused) |
| Limits | 25 MB, 40,000,000 pixels, 16,384 px per side in; 8,192 px per side and 16,777,216 pixels out |
| Resize | width and height, aspect lock on by default, presets; unlocked stretches (with a warning) |
| Output formats | same, JPEG (where safe), WebP (where this browser encodes it), PNG; detected by a real 1x1 encode |
| Quality | JPEG and WebP 30 to 95, default 80; PNG has none |
| **Target size** | "Up to N KB" (10 to 20,000), a bounded search of at most 8 encodes; best valid candidate kept; reports when not reached |
| Transparency | JPEG disabled when alpha is possible (header check, then a worker scan) |
| Orientation | EXIF applied by `createImageBitmap`; baked in; no manual rotation |
| Metadata | removed by re-encoding (spike evidence; the page says "normally") |
| Preview and numbers | scaled previews, honest before and after, "Larger by" when bigger |
| Worker and fallback | Worker with OffscreenCanvas, main-thread fallback tested; Cancel added after a 33.5 s worst case |
| Download | Blob link; name = sanitised base plus -resized or -compressed and the real extension |
| Android | owner-tested; one long-file-name overlap found and fixed (`.ic-download` CSS); the code and a 320/390 px browser test for it are present (VERIFIED in `image-compressor-resizer.css:595` and the spec at line 800). Whether it still passes on a current device is not re-verified here |
| Not supported | batch, crop, rotate, flip, HEIC, GIF, AVIF, SVG, filters, accounts, history |

Important finding: the opportunity matrix row 4 and doc 06 finding I2 treat "target file size and output format" as unscheduled. **They are already built** (spec 20 V1). The real gaps are batch, crop and rotate.

## 4. Photos to PDF (VERIFIED from spec 31 and the code)

30 photos and 100 MB total, 25 MB and 40 MP per file; JPEG, PNG, WebP; Move up and Move down and Remove; A4, Letter or Fit; Automatic, Portrait or Landscape; margins; Cancel; neutral PDF information. A JPEG that is baseline or progressive, 8-bit, 1 or 3 components and has no EXIF turn is **embedded as its original bytes** (`embedStrategy` "keep"); everything else is redrawn as JPEG at 0.92 on white. **No rotate control exists** (spec 31 P1). **Finding (INFERRED, not tested):** pdf-lib's `embedJpg` stores the whole JPEG stream, so Exif or XMP segments, which can contain GPS position, may remain inside the PDF. The page makes no metadata claim (grep of the tool and spec found none), so nothing is currently misleading, but a privacy-minded user may assume the PDF is clean. This is risk R-IP-007 and is settled by one test (AC-PP-004).

## 5. PDF Tools (VERIFIED from spec 33 and doc 07)

pdf-lib only; protected, damaged and non-PDF files refused by name; bookmarks not kept; forms, signatures and tagged structure untested and not claimed; limits 20 files, 50 MB each, 100 MB total, 1,000 pages, 20 parts (provisional, not measured on a phone). No renderer, so **no PDF page previews and no PDF to image**. Compression, OCR, PDF to Images are deferred in docs 02 and 07.

## 6. Shared architecture (VERIFIED)

Central catalog `assets/js/data/tools.js` drives routes, sections, search, SEO and counts; tool modules export markup, render and init; `image-engine.js` is pure and its `sniffFormat` and size rules are already reused by Photos to PDF; `pdf-shared/` holds the PDF rules and page helpers; the pipeline takes an injected canvas environment so it runs in a Worker and on the main thread. There is **no shared file-list or ZIP component**; each tool has its own list code. Tools never pass files to each other (and rule 4.2 forbids related lists across Image Tools and PDF Tools).

## 7. Tests, baselines and known defects

Unit and browser specs exist for all five tools (section 2). Visual baselines exist under `tests/baselines/`. Known stale failures that touch this ecosystem and are **not** caused by this phase: the Image Tools page test and the Image Tools entry of the All Tools test in `image-compressor-resizer.spec.js` (lines 858 and 873, failing on desktop and mobile), and the All Tools assertions in three Developer Tools specs. Real-phone memory, Safari and Firefox are unverified for every tool here.

## 8. Rulebooks that govern this work

`docs/product-decision-rules.md` (sections 1, 3, 4.2, 4.7, 4.9, 8, 10, 11, 12, 15), `docs/tool-pack-factory.md`, `docs/tool-pack-template.md`, `docs/shared-tool-ux.md`, `tests/README.md`, specs 20, 31, 32, 33, and the ecosystem review documents 06, 07, 12, 13 and 14.

## 9. Constraints

Four-gigabyte laptop; sequential bounded commands; no new dependency; no application backend; no paid runtime API; no push, deployment or Hostinger change. A downloaded library may be run only if the permission policy allows it (a refusal ended Tool Pack 41's runtime gates).

## 10. Lessons carried over

Time Tools and Developer Tools: one pure engine per tool, independent oracles (Python, Pillow, pypdf), focused tests, visual inspection before baselines, and honest limits. Developer Tools: do not ship a substitute when a gate fails; record a permission refusal and stop.
