# Audience ecosystems: research report (Prompt 1 of 3), final

Date: 2026-11-15. Status: **research complete; nothing implemented; no application file changed; the rulebook is not edited.** The owner asked (2026-11-15) for decisions to be made on the evidence rather than waiting; they are in `03`. Rule wording changes are proposed (R1–R7), not applied, because the rulebook allows only the owner to change rules (section 15).

**Superseded in part by the owner's master prompt of 2026-11-15 ("Ultimate master prompt"):** there are **no audience landing pages** (`/for/...` is not built; D1, D3's audience row, R1, R2 and R4 are withdrawn). Developers, QA Testers, Data/BI Analysts, General Professionals and Content Creators are audience *tags* inside the AI Tools directory only. The SQL lab keeps its exercise numbers: it is shown in numerical order with topic, difficulty and a topic filter, and the array is not reordered (B2 revised). Persistent learning progress (D5) and palettes (D4) are not part of that prompt and stay deferred. Implementation is recorded in `docs/site-audit-ledger.md` (Phase "Master prompt 2026-11-15").

Evidence labels (rulebook 12.4): **verified** (observed this session), **observed** (on a competitor's own page), **secondary** (a third-party page), **hypothesis**, **unknown**.

| Doc | Contents |
| --- | --- |
| `01-INVENTORY-AND-COVERAGE.md` | real inventory, 10 verified UI defects, per-tool knowledge coverage |
| `02-COMPETITOR-RESEARCH.md` | 25 competitors and sources across QA, developer, SQL/Excel/Power BI, AI directories, calculators, PDF/image |
| `03-DECISIONS-AND-RULEBOOK-PROPOSALS.md` | D1–D7 with alternatives and trade-offs; R1–R7 rule wording |
| `04-AI-DIRECTORY-PLAN.md` | taxonomy, schema, 66 candidate URLs checked, launch set, acceptance |
| `05-ARCHITECTURE-AND-ACCEPTANCE.md` | IA, data files, components, hub contents, backlog B1–B17 with acceptance criteria, dependencies, risks, test plan |
| `06-PROMPT-2-HANDOFF.md` | stage-by-stage start instructions |

## 1. Checkpoint (verified)

Branch `feature/unified-ecosystem-workspace` at `cb9f2c56`, level with origin; clean at the start. App code is identical to the release candidate `f994b41c` (zip built, not deployed). The GitHub Pages preview answers 200 (last deployed 14 Nov 14:10 GMT). Hostinger was not inspected or touched. The ZIP mentioned in the brief was not in this session; the repository is the source of truth.

## 2. What exists (verified, details in `01`)

- 75 published tools: Calculators 30, Time 13, Developer 12, Practice Labs 8, AI Tools 6, PDF 4, Image 2. The owner's "2 image, about 4 PDF" is accurate. Coverage already includes merge, split, extract/reorder/rotate, page numbers and watermark, images to PDF, and image compression, resizing and format conversion.
- 43 articles, all finance, business, maths, health or AI; none for time, developer, image, PDF or labs.
- 31 learning paths with 264 lessons in 8 departments, plus 3 data labs, the Test Design Lab, the ShopLite practice shop and 6 flashcard decks (SQL, Excel, Power BI, Software Testing, HTTP and APIs, JSON). These map directly onto the three audiences.
- Knowledge connections: 22 of 75 tools have at least one article; **1** tool page (Income Tax) cites official sources (e-Gazette, Income Tax Department, PIB); **0** of 43 articles have external links; **0** tool pages link to a learning path, while 195 learning pages link to tools.

## 3. Verified defects (details in `01` section 2)

| | Defect | Pri |
| --- | --- | --- |
| D-B | XIRR remove button overflows its 110 px column and the card, by about 109 px, when the sidebar is open | P0 |
| D-G | SQL lab exercises 31–38 out of topic order (sidebar and Next/Previous); Power BI "Project" split | P0 |
| D-D | Time-zone search: "india" returns America/Indiana; no country search; raw and legacy labels | P0/P1 |
| D-A | Calculator result card 141 px above the form; SIP result column 1,911 px | P1 |
| D-C | Pomodoro/Interval finish = phase cue, a single 0.45 s beep | P1 |
| D-E/F | 110–161 px gap above the footer on every page type; nested section padding on Home | P1 |
| D-H | Labs on phones: the first exercise two screens down | P1 |
| D-I | All Tools on phones is 17,028 px tall | P2 |
| D-J | 26 hard-coded colours outside the tokens (blocks palettes) | P2 |
| — | Mobile hero: **not reproduced** at 390×844 (the search is already above the art); art compaction proposed | P2 |

SQL answer checking is already result-based (real SQLite execution compared with independently generated expected rows) and must not be weakened.

## 4. Strategy in one page

1. **Audiences are a discovery layer** (D1): `/for/developers/`, `/for/qa-testers/`, `/for/data-analysts/`, curated in one `audiences.js`. Sections, URLs, breadcrumbs and the workspace sidebar are unchanged. Validated: the roles are recognised (roadmap.sh lists QA, Data Analyst and BI Analyst, observed), our content clusters there (verified), and overlap is many-to-many (SQL in all three hubs).
2. **The learning labs are the core differentiator.** Competitors either teach by reading (Guru99, Excel Easy), by external IDE or CLI (Exercism), behind accounts and tiers (Ministry of Testing, DataLemur premium), or officially but at length (Microsoft Learn). Ours runs in the page with real checking and no account. Priorities: fix order, the five-question layout, then depth for Excel and Power BI, SQL interview sets, and opt-in progress.
3. **AI directory as a small, dated, audience-filtered page** (D2) at `/ai-tools/directory/`: about 50 entries out of 66 candidates whose official URLs were checked. 5 of the 66 had already moved to another product, which is the evidence for per-entry dates and a 180-day re-check.
4. **Tool-to-knowledge as one metadata layer** (D7): `knowledge.js` + `official-sources.js` feed a "Learn and check" block on every tool, lab and lesson page, with official sources carrying check dates. Bank pages are linked, never copied.
5. **Image/PDF expansion only where output is reliable**: Image Crop and Rotate, Image Metadata (view and remove), PDF to Images (pdf.js, D6). Compress PDF, protect/unlock, OCR and background removal are deferred, with reasons.
6. **UX fixes at the shared source**: calculator layout, spacing tokens, lab shell, timer cue, time-zone engine.
7. **Theme**: Standard plus High contrast and Warm (D4), after the colour clean-up.

## 5. Backlog and order (details and acceptance in `05`)

| Stage | Items | Needs |
| --- | --- | --- |
| A, defects | B1 XIRR, B2 lab order, B3 time zone, B6 finish sound, B4 calculator layout, B5 spacing, B7 lab layout | nothing |
| B, knowledge | B8 knowledge layer and official sources, B17 article candidates | R7 for lesson links only |
| C, discovery | B9 hubs, B10 AI directory, B15 mobile hero | R1–R4 |
| D, depth | B11 learning depth, B12 image tools, B13 PDF to images, B14 palettes, B16 opt-in progress | R5, R6; Tool Pack specs |
| Prompt 3 | targeted tests per stage, one final regression, fresh package from the final commit | — |

## 6. The only owner decision left

Approve R1–R7 (`03`): seven small amendments to existing rules. Nothing else involves cost, credentials or an irreversible step; Stage A can begin without them.

## 7. Rule changes in this phase

None. Seven are proposed (R1–R7), none applied.
