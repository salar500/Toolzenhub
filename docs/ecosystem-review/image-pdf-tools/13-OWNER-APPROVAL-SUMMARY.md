# 13. Image & PDF Tools: owner approval summary

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No code, test, baseline, rulebook or roadmap was changed.

## Decision requested

> Do you approve the recommended Image & PDF Tools ecosystem scope and detailed requirements as the baseline for architecture, design and development?

## What is recommended

**Option A (Focused): keep all five existing tools and improve three of them. Add no new tool now.**

| Preserve | Improve (P0) | Conditional (P1) | Later or never |
|---|---|---|---|
| Image Compressor & Resizer, Photos to PDF, Merge PDF, Split PDF, Extract/Reorder/Rotate PDF Pages; all routes and behaviour | C01 batch compress and resize; C02 rotate, flip, crop and exact output size inside the Compressor; C03 per-photo rotate in Photos to PDF, and a test (then a lossless strip) for location data in the PDF | C04 PDF to Images (spike first); C20 photo sheet for printing; C22 ZIP of batch results | P2: photo metadata tool, PDF page numbers, PDF metadata, Photos to PDF size target. DEFER: PDF compression, HEIC, OCR, PDF protection, background removal, QR code. REJECT: format-converter pages, PDF to Word, PDF editing and signing, password removal, repair, SVG, a standalone crop page |

Counts (from the generated documents): **0 new P0 tools, 3 P0 enhancements, 48 functional requirements (18 + 18 + 12), 22 nonfunctional, 12 security, 48 acceptance criteria, 20 risks, 24 candidates, 6 proposed packs (IP-0 to IP-5).**

## Evidence in one paragraph

Competitors reviewed on 2026-10-27 (page text only, nothing tested): iLovePDF, Smallpdf, PDF24, Sejda, TinyPNG, Squoosh. Compression services process on servers with limits or paid tiers; TinyPNG batches 20 images up to 5 MB each after upload; Squoosh is local but is a codec tool. Search demand is **UNKNOWN** (Google Trends returned HTTP 429; no Search Console data). A public search suggests Indian form uploads ask for photos of roughly 20 to 50 KB with fixed pixel sizes that vary by organisation (not verified at source and never to be built in).

## Why this and not more

The gaps that are both real and fixable are in tools already shipped. The most prominent missing feature (PDF compression) cannot be done honestly in the browser with the shipped library; PDF to Images needs a large renderer, unproven phone memory and permission to run it. No new dependency is needed for Option A.

## Findings you should know about

1. **The brief's baseline was out of date.** Photos to PDF, Merge, Split and Pages are already built (01).
2. **The opportunity matrix is stale for the Compressor.** Target size and output format are already in the tool; the real gaps are batch, crop and rotate. These documents correct it in their own text; the authoritative matrix and roadmap were **not** edited (not authorized here).
3. **Possible privacy gap (unverified):** Photos to PDF embeds original JPEG bytes, which may keep Exif/GPS data inside the PDF. One test settles it (AC-PP-004).
4. **Rule conflict reported, not overridden:** the brief asks for related connections between Image and PDF tools, but rule 4.2 forbids related lists across sections. Recommendation: keep separate sections, body-text mentions only (pending D5).

## Material risks and conditional gates

Phone memory for batch and large crops is UNKNOWN (R-IP-001); wrong crop pixels are the main correctness risk (R-IP-004); Safari, Firefox and real phones are unverified; PDF to Images needs a size, memory and fidelity spike and the owner's permission to run the library (R-IP-008..010); the Exif question decides whether IP-3 needs a strip (R-IP-007).

## Proposed order

IP-0 fixtures and evidence fixes, then IP-1 batch, IP-2 crop (or IP-3 first if privacy is the priority), then IP-3, then IP-5 checkpoint. IP-4 only on a separate decision. See 12.

## Open material decisions for you

1. Approve Option A (or ask for B or C).
2. Is batch the first pack, or the metadata question (IP-3)?
3. D5: allow body-text mentions across Image and PDF Tools?
4. Is a spike for PDF to Images wanted, and may a downloaded renderer be run for it?
5. Any real-phone or Safari testing resources for the checkpoint?

Nothing has been pushed, deployed or committed in this phase; production is not recommended before the consolidated release.
