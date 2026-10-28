# 03. Image & PDF Tools: search demand and user problems

PROJECT: ToolZenHub
ECOSYSTEM: Image & PDF Tools
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-27

Research and planning only. Evidence classes follow rulebook 12.4 (verified data, public evidence, reasoned hypothesis, unknown).

## 1. Demand data: what exists

| Source | Result |
|---|---|
| Google Trends (India and worldwide, 12 months, "jpg to pdf", "compress pdf", "merge pdf", "resize image") | **UNKNOWN.** HTTP 429 on 2026-10-27; not retried. |
| The Trends summary quoted in the brief (interest in Image to PDF, JPG to PDF, Merge PDF, Compress PDF, Split PDF, resize, compress to a size, convert, extract pages) | **UNRECORDED.** It is not in the repository (no Trends data for these topics under `docs/`), has no date, geography or keyword table, and so is context only. |
| Search Console or GA4 for the Pages preview or production | **UNKNOWN.** None supplied; the PDF and Image pages are not on production, so they have no production data. |
| Keyword volumes, difficulty, traffic, retention, revenue | **UNKNOWN.** None invented. |

Consequence: every demand and repeat-use score in 05 is a hypothesis, and the recommendation does not rest on a demand ranking.

## 2. Public evidence of the user problems (PUBLIC, not verified at source)

One bounded web search (2026-10-27) on form photo and signature uploads returned Indian institutional guidance pages (including pages hosted by MSTC, the Maharashtra State Pharmacy Council and the Reserve Bank of India, plus scribd copies and a free compressor with a "Max KB" box). Through the search summary, not through reading those documents:
- Photos are commonly asked as JPG or JPEG of roughly 20 to 50 KB and signatures 10 to 20 KB, with stated pixel sizes (examples quoted: 200 x 230 and 140 x 60; another notice 240 x 240), and **limits differ by organisation**.
- Applications can be refused if the size or format is wrong.
- The usual advice is to scan at a given DPI, then crop and resize in an image editor.

This supports the job "make this photo fit exact pixels and a size cap" (C02) as a **real recurring problem**. It does **not** supply verified current requirements: the pages were not opened and are not cited as authority. **No institution's limit may be built into ToolZenHub** (FR-IC-015, R-IP-019).

## 3. Problems the repository already records (VERIFIED in specs 20, 31, 33 and docs 06 and 07)

Photos too big for a form, email or chat; several photos of a document needed as one file; PDFs to combine, split, reorder and rotate; the preference not to upload personal documents. These are the jobs the five existing tools address.

## 4. Candidate problems from this research and their evidence

| Problem | Evidence | Confidence |
|---|---|---|
| Reduce several photos at once | PUBLIC: TinyPNG batch of 20 (02); demand UNKNOWN | Low-medium |
| Exact pixel size without stretching, plus a size cap, for a form | PUBLIC snippets above; the Compressor's own stretch warning (spec 20) | Medium for the problem, UNKNOWN for volume |
| Sideways photos of documents in a PDF | REASONED; spec 31 listed rotate as P1 | Medium |
| A PDF that may still contain location data | INFERRED from code (01 section 4); needs one test | Unknown until tested |
| Turn PDF pages into pictures | PUBLIC: iLovePDF mode list (02); demand UNKNOWN | Low-medium |
| Make a PDF smaller | PUBLIC: all major sites offer it with server processing and limits (02); demand UNKNOWN | Demand plausible; **feasibility is the blocker** |
| iPhone HEIC photos rejected by sites | HYPOTHESIS | Low |

## 5. Mobile and privacy

Mobile need is a hypothesis consistent with the project's own Android review (spec 20 found a real layout defect on a phone) and with photos being taken on phones. Privacy sensitivity of ID, certificate and signature images is plausible (REASONED) and is why "not uploaded by this tool" is stated, but the claim must stay that narrow (rulebook section 8).

## 6. Search intent and content

Queries such as "compress image to 50 kb" or "jpg to pdf" are transactional tool intents (HYPOTHESIS). The Compressor already carries aliases for the compress and resize wordings. **Format-conversion wordings ("png to jpg", "jpg to png", "webp to jpg") are not in its aliases**, although the tool does this job (VERIFIED in the catalog and spec 20); adding them is a low-risk integration step (pack IP-5) that avoids duplicate pages (C07). No article is proposed: none has independent explanatory value beyond the page's own help section (`docs/content-clusters.md`).

## 7. Research limitations

No demand numbers, no complaint mining, one search, no Indian portal document opened. To strengthen: Search Console data after a preview or production period, a Trends retry later, and reading two or three real portal notices (kept out of the product).
