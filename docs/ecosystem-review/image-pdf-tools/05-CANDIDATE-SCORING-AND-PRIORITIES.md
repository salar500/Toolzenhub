# 05. Candidate scoring and priorities

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Method (the authoritative one)

Rulebook section 12 is used unchanged: six dimensions scored 0 to 5, with weights Search demand 25%, Repeat use 25%, Practical usefulness 20%, Differentiation 10%, Feasibility and upkeep 10%, Trust, privacy and performance 10%. The 0-100 total is `sum(score x weight) / 5`, the same arithmetic as the existing matrix (`12-ECOSYSTEM-OPPORTUNITY-MATRIX.md`, row 4: 4,2,4,2,3,4 gives 64). Verdicts are A (approved planning candidate), B (needs validation), C (future opportunity), D (rejected or unsuitable). A verdict A is a planning status only.

**Mandatory gates (rulebook 12):** meaningful problem; not a duplicate; no unreliable or misleading output; proportionate maintenance; no paid API; no unacceptable privacy or security risk; acceptable mobile experience; not added for tool count. A candidate that fails a gate is D or deferred whatever its score (C06, C07, C13-C17, C24).

## 2. Evidence status

Every **demand** and **repeat-use** score is a **hypothesis**. Google Trends returned HTTP 429 on 2026-10-27 and no Search Console, Keyword Planner or GA4 data is in the repository for these topics (see 03). The scores are therefore conservative judgement, not measurements, and **differences of a few points between candidates are not evidence**. The ordering that matters is the gate result and the three clearly separated groups: P0 (the existing-tool enhancements, 66 to 68), then conditional new tools, then deferrals.

Scores for usefulness, differentiation, feasibility and trust rest partly on **verified** facts (the code and specs in 01, the competitor pages in 02) and partly on reasoning; each candidate's reason is in 04.

## 3. Scores

Order: demand / repeat / usefulness / differentiation / feasibility / trust.

| ID | Candidate | Scores | Total | Verdict | Priority | Gate or note |
|---|---|---|---|---|---|---|
| C01 | Image Compressor: batch (several images, same settings) | 3 / 3 / 4 / 3 / 4 / 4 | **68** | A | P0 | Reuses the verified single-image pipeline one file at a time; spec 20 excluded batch in V1 only |
| C02 | Image Compressor: rotate, flip, crop and exact output size | 3 / 3 / 4 / 3 / 3 / 4 | **66** | A | P0 | Resize with the aspect unlocked stretches today (spec 20); crop removes the need. Canvas source-rect crop, no new dependency |
| C03 | Photos to PDF: rotate each photo; remove photo metadata from kept JPEGs | 3 / 3 / 4 / 2 / 4 / 5 | **68** | A | P0 | Rotate was P1 in spec 31. Metadata: the 'keep' path embeds original JPEG bytes (pdf-lib behaviour INFERRED, not tested); a one-test check decides whether stripping is needed |
| C04 | PDF to Images (PDF pages to JPG or PNG) | 4 / 3 / 4 / 3 / 2 / 3 | **67** | B | P1 | Needs a renderer (PDF.js, Apache-2.0). Runtime and memory spike required before any approval; the spike must run third-party code, which an earlier session was refused |
| C05 | Photo metadata viewer and remover (lossless JPEG strip) | 2 / 2 / 3 / 4 / 4 / 5 | **58** | C | P2 | Becomes cheap once C03's segment engine exists; value depends on privacy demand (hypothesis) |
| C06 | PDF compression | 4 / 2 / 3 / 1 / 1 / 2 | **50** | D | DEFER | FAILS the reliable-output gate for now: pdf-lib cannot recompress images; a rasterise mode would destroy text; structural rewriting may make files larger. Revisit only with a tested method that shows real savings |
| C07 | Separate Image Format Converter page(s) (JPG/PNG/WebP) | 3 / 2 / 3 / 1 / 5 / 4 | **57** | D | REJECT | FAILS the duplicate gate: the Compressor already outputs JPEG, PNG or WebP (spec 20). Handle with aliases and page copy, not new routes |
| C08 | PDF page numbers / watermark | 3 / 2 / 3 / 2 / 4 / 3 | **55** | C | P2 | pdf-lib can draw text; fonts and non-Latin text need care |
| C09 | PDF metadata viewer and remover | 2 / 2 / 3 / 3 / 4 / 4 | **54** | C | P2 | XMP packets are not cleared by pdf-lib's Info setters; would need a test |
| C10 | HEIC to JPG | 3 / 2 / 4 / 2 / 1 / 3 | **53** | C | DEFER | Needs a HEIC decoder (WASM). Licence, size and a runtime test are all open; Safari decodes HEIC natively but Chrome does not |
| C11 | QR Code Generator | 3 / 2 / 2 / 1 / 5 / 5 | **55** | C | DEFER | Already deferred by spec 32 (commodity); unchanged |
| C12 | OCR and PDF text extraction | 3 / 2 / 3 / 2 / 1 / 2 | **47** | D | DEFER | OCR needs a model download and large memory; accuracy cannot be promised; text extraction needs the PDF.js spike first |
| C13 | PDF to Word / Word to PDF | 4 / 2 / 3 / 1 / 1 / 2 | **50** | D | REJECT | FAILS the reliable-output and browser-local gates: layout fidelity is not achievable in-browser without a server |
| C14 | PDF editing, signing and form filling | 3 / 2 / 3 / 1 / 1 / 2 | **45** | D | REJECT | Large scope; signature validity and form-field fidelity cannot be promised; pdf-lib forms and signatures untested (spec 33) |
| C15 | PDF password protection | 3 / 2 / 3 / 2 / 1 / 3 | **49** | D | DEFER | pdf-lib does not encrypt; no verified in-browser encryption library; a weak or wrong lock is worse than none |
| C16 | PDF password removal | 2 / 1 / 2 / 1 / 1 / 1 | **29** | D | REJECT | FAILS the safety gate: spec 33 and its Do-not list say never remove protection |
| C17 | PDF repair | 2 / 1 / 2 / 1 / 1 / 2 | **31** | D | REJECT | Cannot promise a correct repair; silent loss of content is worse than a refusal |
| C18 | Image background removal | 3 / 2 / 3 / 2 / 1 / 2 | **47** | D | DEFER | Needs an ML model download and heavy memory (06 I3) |
| C19 | SVG conversion | 1 / 1 / 1 / 1 / 3 / 3 | **28** | D | REJECT | Little demand evidence; SVG is deliberately never rendered (spec 20 security) |
| C20 | Photo sheet for printing (user-defined photo size, several copies on A4) | 3 / 3 / 3 / 3 / 4 / 4 | **64** | B | P1 | Depends on C02 (crop); the user types the photo size, nothing institutional is hard-coded |
| C21 | Photos to PDF: aim for a file size | 3 / 2 / 3 / 3 / 2 / 4 | **55** | C | P2 | Needs repeated whole-PDF builds; only an honest 'up to' is possible |
| C22 | Batch results as one ZIP (store-only writer, no dependency) | 3 / 3 / 3 / 2 / 4 / 4 | **62** | B | P1 | Own writer checked against Python zipfile; browsers may prompt on many separate downloads (hypothesis) |
| C23 | Advanced batch image editing (filters, watermark, bulk rename) | 2 / 2 / 2 / 1 / 2 / 3 | **40** | D | REJECT | Scope creep toward an editor (spec 20 excludes filters and annotations); no evidence |
| C24 | Standalone Image Rotate / Crop page | 3 / 2 / 3 / 1 / 5 / 4 | **57** | D | REJECT | FAILS the duplicate gate once C02 exists, and a second page adds a step (crop here, compress there) |

## 4. Counts

- P0: 3 (all enhancements of existing tools; **no new tool is P0**). P1: 3. P2: 4. DEFER: 6. REJECT: 8.

## 5. Why no new tool is P0

The two most-requested new jobs by competitor prominence (PDF compression, PDF to images) are not ready: compression fails the reliable-output gate, and PDF to Images needs a renderer whose size, memory and (for this project) permission to run are all unproven. The honest, evidence-backed gaps are in the tools already built: no batch, no crop, no rotate in Photos to PDF, and a possible metadata leak. Fixing them is higher value per unit of risk than adding pages.
