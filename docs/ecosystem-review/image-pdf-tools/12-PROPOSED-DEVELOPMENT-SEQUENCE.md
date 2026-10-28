# 12. Proposed development sequence

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read or observed in this session), **PUBLIC** (a cited external page, not independently verified), **HYPOTHESIS**, **UNKNOWN**.

## 1. Proposed Tool Packs (spec numbers 42 to 45 were verified unused: the highest existing spec is 41)

Assumption for every pack: **the owner has approved that pack's scope**. Nothing here is approved. One local commit per pack; broad regression only at IP-5.

| Pack | Name | Purpose | Dependencies | Requirements | Technical risks | Focused tests | Rollback | Completion |
|---|---|---|---|---|---|---|---|---|
| IP-0 | Preparation and evidence fixes | Verify unused spec numbers 42-45; settle the D5 body-text question with the owner; add fixture generation for orientation, ICC and Exif cases; correct the stale matrix row for the Compressor (target size and format output are already built) | none | FR none | documentation and fixtures only | Fixture script output checked by Pillow | Revert the commit | Fixtures exist and are reviewed |
| IP-1 | Compressor batch (spec 42) | Batch list, sequential processing, per-file results, per-file download, honest totals | IP-0 | FR-IB-001..018 | memory, throughput, accessibility of a file list | unit (batch maths, naming), browser (batch, cancel, stale), mobile 320/390, privacy, memory counters | Revert; single-file path unchanged by design | AC-IB-001..022 pass; the 46 existing browser tests pass except those rewritten for the new rule |
| IP-2 | Compressor rotate, flip, crop (spec 43) | Geometry engine, crop UI with numeric fields and optional handles, exact size mode | IP-0 (may follow or precede IP-1) | FR-IC-001..018 | wrong pixels, touch crop usability | unit geometry vs Pillow oracle, browser, touch, accessibility | Revert; numeric-only fallback if handles fail | AC-IC-001..017 pass |
| IP-3 | Photos to PDF rotate and metadata (spec 44) | Per-photo rotate; the Exif-in-PDF test; a pure JPEG segment strip if needed | IP-0 | FR-PP-001..012 | viewer differences in rotation; colour change if ICC stripped | unit (segment engine), pypdf oracle, browser, thumbnails | Revert; keep copy neutral | AC-PP-001..009 pass |
| IP-4 | PDF to Images (spec 45) CONDITIONAL | Spike only: renderer size, memory, time, fidelity; build only if every gate passes and the owner permits running the library | IP-0 and a separate owner decision | not specified here | bundle size, memory, permission | n/a until approved | Do not start | Spike report with GO or NO-GO |
| IP-5 | Ecosystem checkpoint | Aliases (png to jpg, jpg to png, etc.) on the Compressor, related-tool decisions, SEO, focused regression, visual review, Android acceptance request | IP-1..IP-3 | NFR-IP-015, 017, 022 | regression breadth on a 4 GB laptop | bounded sequential specs; static checks | Revert the integration commit | Checkpoint report |

## 2. Order and why

1. **IP-0** first: it is small, and its fixtures (orientation 1-8, ICC, Exif text, asymmetric patterns) are needed by IP-2 and IP-3.
2. **IP-3 before IP-1/IP-2 if privacy is the priority**: AC-PP-004 can decide the Exif question with one test. Otherwise **IP-1** (batch) first, because it has the clearest competitor evidence.
3. **IP-2** after IP-1 (they edit the same page module, so they are sequential, not parallel).
4. **IP-4** only on a separate go decision; it never blocks the rest.
5. **IP-5** last.

## 3. Per-pack checks

Unit: engines and geometry against independent oracles. Browser: focused spec per pack, desktop and mobile projects, `--workers=1`, no broad suite. Visual: inspect screenshots at about 1180 and 375 px before regenerating any baseline. Accessibility and privacy checks are inside each browser spec. Static: links, assets, seo, inventory check. The known stale failures (gratuity colour token, the stale All Tools and Image Tools assertions) are tracked separately, and the Compressor's rewritten multi-file refusal tests are an intended change, not a regression.
