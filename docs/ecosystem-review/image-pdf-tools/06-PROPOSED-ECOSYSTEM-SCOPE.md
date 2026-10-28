# 06. Image & PDF Tools: proposed ecosystem scope

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No code, test, baseline, rulebook or roadmap was changed.

## 1. Starting point

Five tools exist: Image Compressor & Resizer and Photos to PDF (Image Tools), Merge PDF, Split PDF and Extract, Reorder and Rotate PDF Pages (PDF Tools). They are preserved in every option; no route, id or working behaviour changes.

## 2. The three options

| | A. Focused (recommended) | B. Balanced | C. Expanded |
|---|---|---|---|
| Existing tools preserved | 5 | 5 | 5 |
| Existing enhancements | C01 batch, C02 crop/rotate/flip/exact size, C03 Photos to PDF rotate and metadata | A, plus C22 ZIP of batch results | B |
| New tools | 0 | 1, **conditional**: PDF to Images (C04), after a spike and a permission decision | up to 5 more: PDF to Images, Photo metadata (C05), photo sheet (C20), PDF page numbers/watermark (C08), PDF metadata (C09) |
| Total tools | **5** | 5 now, 6 if the spike passes | 5 to 11 |
| Shared engines | JPEG segment strip (pure), crop geometry (pure) | A, plus a store-only ZIP writer | B, plus a renderer wrapper, text drawing |
| User value | Closes the three evidenced gaps in tools people can already use | A plus the most requested missing PDF job | Wider, but most added value rests on hypotheses |
| Search opportunity | Alias wording for conversion (no new pages) | A plus "pdf to jpg" intent | More pages, unmeasured demand |
| Differentiation | Local batch with no per-file cap or upload; form-fitting crop; honest metadata statement | A plus a local PDF to image | Mostly parity |
| Development complexity | Low to medium | Medium; PDF.js is large | High |
| Mobile feasibility | Good (one decode at a time) | PDF rendering on low-memory phones UNKNOWN | Worst |
| Maintenance | Low (no new dependency) | A dependency to track (pdfjs-dist is Apache-2.0, active, 34.9 MB unpacked package; the shipped subset is **UNVERIFIED**) | Several dependencies and fonts |
| Security | Existing boundaries | Renderer must run with scripting and network off | Larger surface |
| Testing burden | Focused specs, Pillow and pypdf oracles | A plus a rendering oracle | Large |
| Scope exclusions | PDF compression, OCR, HEIC, editing, signing, protection, repair, conversion to Office formats | A smaller list | Same exclusions |

## 3. Recommendation: Option A

**Build the three enhancements; add no new tool now.** Reasons:
1. The evidence for gaps is in the tools already built (no batch, no crop, no rotate, a possible metadata leak), and it is concrete (02, 03, 01 section 4).
2. The evidence for new tools is weak: demand data is UNKNOWN, the most prominent competitor feature (PDF compression) fails the reliable-output gate, and PDF to Images has unproven size, memory and permission requirements.
3. It adds no dependency, which matches the project's restraint (rulebook 9) and the 4 GB constraint.
4. Tool count is not a goal (rulebook 1.2). Time Tools has 13 and Developer Tools 12 because the evidence supported more; here it supports fewer.

PDF to Images is a **P1 with a spike gate (pack IP-4)**, so Option A can grow into Option B without rework. Nothing in A depends on it.

## 4. Section structure (no change proposed)

| Question | Recommendation | Basis |
|---|---|---|
| One section or two? | **Keep two**: Image Tools and PDF Tools | Owner decision 2026-10-26 (rule 4.9); inputs differ (photos versus PDF files); merging needs approval (rule 4.7, 11.7) |
| Subcategories? | None | Rule 4.1: five tools do not earn another layer |
| The Image-to-PDF journey (photos, then merge with other PDFs) | Body-text mentions only until the owner decides D5; **no related-list link across the two sections** | Rule 4.2 and 4.9; doc 14 P3 |
| Alternative the owner could choose | Change rule 4.2 to allow one explicit cross-section "next step" link between Photos to PDF and Merge PDF | **Not recommended now**: it changes the rulebook; reported as a conflict with the brief's request for related connections, not overridden |

## 5. Related-tool relationships (within the rules)

Same section only: the Compressor currently lists no related tools and Photos to PDF lists the Compressor. Proposed at IP-5: make it reciprocal (Compressor to Photos to PDF) and show the section on both pages, as the Time and Developer Tools pilots did. The brief's illustrative chains (Image Format Converter, PDF Merge to PDF Compression, PDF Split to PDF to Image, Image Crop to Compressor) are mostly not applicable: the converter and crop are inside the Compressor, and compression and PDF to Images are not P0.

## 6. Cross-tool file transfer

Not proposed. A file passed between tools would need storage or a shared in-memory handoff, with privacy and memory rules of its own (SEC-IP-009). The user chooses a file again in each tool.
