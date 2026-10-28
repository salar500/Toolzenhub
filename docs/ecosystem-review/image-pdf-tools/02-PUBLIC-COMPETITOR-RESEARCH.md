# 02. Image & PDF Tools: public competitor research

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No code, test, baseline, rulebook or roadmap was changed.

## 1. Method and its limits

Observation date for every row: **2026-10-27**. Each page was read with the WebFetch tool, which fetches a page, converts it to text and answers a question about it using a small model. Therefore:
- Everything below is **OBSERVED** (what the page text said through that tool) or **CLAIMED** (the vendor's statement). **Nothing was TESTED**: no file was uploaded or processed on any competitor.
- "Not stated" means the fetched text did not say it. It does **not** mean the product lacks it, and a page may show more to a logged-in user or after a file is added.
- Single-page summaries can miss content on long pages. Treat each row as a lead for a closer look, not a finding of fact about the product.
- No site restriction was bypassed. One site was rate-limited (see section 4).

## 2. Competitors reached

| Competitor / page | Observed (2026-10-27) | Evidence | Where files are processed |
|---|---|---|---|
| iLovePDF Compress PDF, `ilovepdf.com/compress_pdf` | Three levels: Extreme, Recommended, Less compression. Sources: computer, Google Drive, Dropbox. Size, file-count and retention limits not stated on the page; login and Pricing links exist | OBSERVED | Not stated; upload progress UI suggests upload (INFERRED) |
| iLovePDF JPG to PDF, `/jpg_to_pdf` | Orientation (portrait or landscape), page size (fit to image, A4, US Letter), margin (none, small, big), several images, a merge-all option, sorting by name; only JPG named; manual reorder not stated | OBSERVED | Not stated |
| iLovePDF PDF to JPG, `/pdf_to_jpg` | Two modes: every page to JPG, or extract embedded images; quality Normal or High; limits not stated | OBSERVED | Not stated |
| Smallpdf Compress PDF, `smallpdf.com/compress-pdf` | Levels Basic, Moderate, Strong; "Moderate and Strong are Pro features"; "usage limits may apply"; files deleted after one hour; described as browser-based and cloud-based with TLS | OBSERVED / CLAIMED | Cloud (CLAIMED: "cloud-based") |
| PDF24 Compress PDF, `tools.pdf24.org/en/compress-pdf` | DPI and image-quality settings; toggles for thumbnails, duplicate streams, rasterising, font subsetting, grayscale, Flate, flattening forms, stripping metadata and attachments; "No limits" badge, no registration; deleted after one hour; servers in Germany; a desktop app exists for offline | OBSERVED / CLAIMED | **Server** ("compressed in the cloud on our servers", CLAIMED) |
| Sejda Compress PDF, `sejda.com/compress-pdf` | Free: 50 MB per file, 5 MB per image file, **3 tasks per hour**, one file per task (the page also gives conflicting page limits, 50 or 200 pages); image quality Medium, Good, Best; ppi 72 to 720; grayscale; fonts optimise (experimental); deleted after 2 hours; Sejda Desktop sold as the no-upload option | OBSERVED / CLAIMED | Upload (CLAIMED: "safely uploaded"); desktop version local |
| TinyPNG / Tinify, `tinypng.com` | JPEG XL, AVIF, WebP, JPG, PNG, APNG; **20 images per batch**, **5 MB each**, free users 3 images in one conversion note; kept up to 48 hours then deleted; paid "Web Ultra" for unlimited | OBSERVED / CLAIMED | Upload (the retention claim implies it) |
| Squoosh, `squoosh.app` and `github.com/GoogleChromeLabs/squoosh` | "Images never leave your device"; open image, compare, save; codecs in WebAssembly; Apache-2.0, not archived, last push 2026-10-22, 26,068 stars | OBSERVED / CLAIMED; licence and activity from GitHub API | **Local** (CLAIMED) |

## 3. Not reached in this phase (UNKNOWN)

Adobe Acrobat online tools, PDF Candy, TinyWow, Xodo, Compressor.io, ImageResizer.com, ResizePixel, Img2Go, Convertio, CloudConvert were **not fetched** (time-boxed on a low-memory laptop). Their features, limits and claims are **UNKNOWN** here. Earlier phases also recorded browser-based JPG to PDF competitors from a search on 2026-10-25 (miniwebtool, templated.io, 3dgifmaker; PUBLIC, spec 31 section 1).

## 4. Search-demand tool access

Google Trends returned **HTTP 429** (rate limited) on 2026-10-27. Not retried, per the brief. See 03.

## 5. What the evidence supports

| Observation | Support | Consequence for ToolZenHub |
|---|---|---|
| The established PDF compressors all offer several levels and most process on **servers** (Smallpdf, PDF24, Sejda, iLovePDF's UI), with limits, waiting, or paid tiers | OBSERVED / CLAIMED | A local, no-limit alternative would be differentiated **if** it worked, but PDF compression is not feasible to do honestly in the browser today (06, R-IP-011) |
| Image batch tools exist with caps (TinyPNG 20 files, 5 MB) and an upload step | OBSERVED / CLAIMED | A local batch with no per-file 5 MB cap and no upload is a credible, stated differentiator (C01), subject to phone memory limits |
| Squoosh is local and excellent for single images but is a codec-comparison tool, not a form-preparation tool | OBSERVED (what it says it does); the rest is INFERRED | The unmet job is "make this photo fit a form": exact pixels plus a size cap (C02) |
| JPG to PDF tools offer orientation, size, margin and merge | OBSERVED | Photos to PDF already matches these; reorder, thumbnails and per-image rotation are where ToolZenHub can be clearer |
| PDF to image is a mainstream feature (two modes at iLovePDF) | OBSERVED | Real, but needs a renderer; conditional (C04) |
| "No sign-up" and "private" are common claims | CLAIMED | Not a differentiator by themselves (rulebook 12.5) |

## 6. Gaps in this research

No competitor was exercised, no mobile behaviour was observed, accessibility was not assessed, pricing beyond what the pages stated is unknown, complaint data (reviews, forums) was not gathered, and the second half of the competitor list was not reached. These limit confidence in the differentiation claims; every differentiator is therefore labelled a hypothesis in 05.
