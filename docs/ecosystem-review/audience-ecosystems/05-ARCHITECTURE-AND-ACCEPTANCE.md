# 05. Architecture, backlog, acceptance criteria and risks

Principles: reuse the catalog, `relationships.js`, Eleventy data files, the shared tool page builder and the section sidebar. Add data files, not systems. No framework, backend, API or account. Every new page is static HTML first and enhanced by script.

## 1. Information architecture

```
Home: hero → "Choose your path" (3 hubs) → ecosystem cards → featured → latest articles
Sections (unchanged, one per tool): Calculators · Time · Developer · Image · PDF · Practice Labs · AI Tools
Discovery layer (not sections):
  /for/developers/   /for/qa-testers/   /for/data-analysts/       ← audiences.js
  /practice-labs/<department>/                                    ← departments.js (exists)
  /ai-tools/directory/  (+ ?audience=, ?category=)                ← ai-directory.js
Learning: /practice-labs/<path>/<level>/<module>/<lesson>/  (exists)
Knowledge layer on every tool/lab/lesson page: "Learn and check"  ← knowledge.js + official-sources.js
```

What each kind of item looks like to a visitor:

| Item | Badge / cue | Opens |
| --- | --- | --- |
| Our tool | section label ("Developer tool") | here |
| Lab or lesson | "Practice" / "Lesson n of m" | here |
| Article | "Guide" | here |
| Official source | publisher name + "checked <date>" + ↗ | new tab |
| AI product | kind badge + "Official site ↗" | new tab |

## 2. Data files (new)

| File | Shape | Read by |
| --- | --- | --- |
| `assets/js/data/audiences.js` | `AUDIENCES: [{ id, slug, name, promise, who, startHere: { new: ref, working: ref }, groups: [{ id, label, job, items: [ref] }], interview: [ref], aiAudience }]`, where `ref` is `{ tool }`, `{ path }`, `{ lesson }`, `{ lab }`, `{ article }`, `{ deck }` or `{ page }` | hub template, All Tools audience chip (later), unit test |
| `assets/js/data/official-sources.js` | `SOURCES: { [id]: { title, publisher, url, kind, checkedOn, note? } }` | knowledge block, link check |
| `assets/js/data/knowledge.js` | `KNOWLEDGE: { [toolOrLabId]: { learn?: [ref], guides?: [articleKey], official?: [sourceId], examples?: [anchor or articleKey], mistakes?: [anchor or articleKey] } }` | `relationships.js` → `getKnowledgeFor(id)` |
| `assets/js/data/ai-directory.js` | see `04` section 2 | directory page, hubs |
| `assets/js/tools/time-zone-converter/country-zones.js` | generated `{ zone: { country: "India", cc: "IN", city: "Kolkata" } }` plus `COUNTRY_INDEX` | `searchZones`, labels |

The existing curated `relatedTools`/`relatedArticles` stay where they are; `knowledge.js` holds only the new types, so no fact is stored twice (rule 9.2).

## 3. Components and templates (new or changed)

| Piece | Change |
| --- | --- |
| `src/audience-pages.njk` + `.11tydata.js` | pagination over `AUDIENCES` → `/for/<slug>/`; breadcrumb Home › For <role>; JSON-LD BreadcrumbList; in sitemap and search index |
| `src/ai-directory.njk` + `.11tydata.js` | `/ai-tools/directory/`; static list + `assets/js/pages/ai-directory.js` filter (≤ 6 KB) |
| `assets/js/components/knowledge-block.js` | pure `buildKnowledgeHtml(items)` used at build time by `pages/tool-page.js` and the lesson template; placed after the result/related tools and before the FAQ |
| `src/home.njk` | "Choose your path" row; hero art sizing at narrow widths |
| `assets/js/learning/lab-shell.js` | five-question layout (objective strip, task box, labelled work area, verdict that names the difference, "why" panel); on phones a "Jump to exercises" link at the top |
| shared calculator CSS (the stylesheet that lays out `.calculator-form` / `.calculator-results`) | heading and intro above the two-column grid; both cards start on one line; result column holds the summary only (`align-self: start`, sticky on desktop); charts and schedules move to a full-width block below |
| `assets/css/calculators/xirr.css` | container query on the rows wrapper; `minmax(0, …)` columns; the remove control becomes a 44 px icon button with an accessible name ("Remove cash flow on <date>") when narrow |
| spacing | tokens `--space-1…7` (4, 8, 12, 16, 24, 32, 48) in `variables.css`; one owner of section padding (the outer section); `main` bottom padding cut so the last block sits 48 px above the footer |
| `timer-cycle/cycle-controller.js` | `cue()` for phase changes (unchanged 0.45 s) and `finish()` (three rising tones, about 2.2 s, played once); still opt-in |
| time-zone engine | country index; label "City, Country · UTC±hh:mm" from `Intl` for the selected date; modern name preferred (`Asia/Kolkata` over `Asia/Calcutta`); a search with no match says so and suggests typing a city or country; quick chips show readable labels |
| theme | `variables.css` palette overrides `[data-palette="contrast"]`, `[data-palette="warm"]` × light/dark; the pre-paint inline script reads `tz-palette`; popover on the theme button (radio group, Escape closes, focus returns) |

## 4. Hub content (first version, every reference real today)

**Developers** (`/for/developers/`). Start: new → JavaScript path lesson 1; working → JSON Formatter.
- Inspect and fix data: json-formatter, json-compare, jsonpath-tester, json-csv-converter, list-comparer, text-diff
- Decode, encode and generate: jwt-decoder, base64-encoder-decoder, url-parser, unix-timestamp-converter, uuid-generator
- Schedules and time: cron-expression-explainer, time-zone-converter
- Practise: json-error-fixing-lab, jsonpath-challenge-lab, cron-challenge-lab; flashcards JSON, HTTP and APIs
- Learn: paths javascript, typescript, python, java, http-apis, html-css-dom, backend, frontend-frameworks, git-devops, regex, dsa, linux, app-security, sql
- Work with AI assistants: context-pack-builder, prompt-builder, ai-answer-checklist, ai-answer-compare; directory `?audience=developers`

**QA testers** (`/for/qa-testers/`). Start: new → Manual testing path lesson 1; working → Test Design Lab.
- Design tests: test-design-lab; paths manual-testing, test-design, specialised-testing
- Automate: paths playwright, selenium, api-automation; ShopLite practice shop (`/practice-labs/shoplite/`)
- Check APIs and data: json-formatter, json-compare, jsonpath-tester, jwt-decoder, url-parser, base64-encoder-decoder, text-diff, list-comparer
- Make test data: uuid-generator, unix-timestamp-converter, json-csv-converter
- SQL for testers: sql path, sql-practice-lab
- Report bugs: bug-report-prompt
- Interview preparation: flashcards Software Testing, HTTP and APIs, SQL
- AI for testing: directory `?audience=qa`

**Data and BI analysts** (`/for/data-analysts/`). Start: new → SQL path lesson 1; working → SQL Practice Lab.
- Learn: paths sql, excel, power-bi, statistics, pandas, database-design, data-engineering
- Practise: sql-practice-lab, excel-practice-lab, power-bi-practice-lab
- Prepare data: json-csv-converter, list-comparer, json-formatter, text-diff
- Business maths: percentage, cagr, margin, profit, roi, ratio
- Dates in reports: date-difference, business-days
- Interview preparation: flashcards SQL, Excel, Power BI
- AI for analysis: directory `?audience=data`

## 5. Prioritised backlog with acceptance criteria

Priority: **P0** defect that misleads or breaks; **P1** high-value; **P2** next iteration; **Future** not in this milestone.

| ID | Item | Pri | Stage | Acceptance criteria |
| --- | --- | --- | --- | --- |
| B1 | XIRR rows | P0 | A | At 1366 px with the sidebar open and hidden, 1000, 768, 390 and 320 px: no control's box exceeds its card; add 3 rows / remove 2 leaves the rate unchanged against the existing golden cases; remove buttons have a unique accessible name |
| B2 | Lab exercise order | P0 | A | SQL and Power BI arrays reordered so each topic's exercises are contiguous; ids unchanged; new unit test "topics contiguous" covers all labs; Next/Previous follows the list; every path still resolves its exercise ids (unit); the browser test that runs every SQL solution still passes |
| B3 | Time-zone search and labels | P0/P1 | A | `india` → Asia/Kolkata first and no America/Indiana in the top 3; `japan` → Asia/Tokyo; `brazil` lists Brazil's zones; `germany` → Europe/Berlin; `est` still finds zones but no abbreviation is used as a label; labels "Kolkata, India · UTC+05:30"; offsets correct for New York on 2026-03-07/09 and 2026-10-31/11-02, London 2026-03-28/30; keyboard: arrows, Enter, Escape; generated table from tzdb with its version recorded |
| B4 | Calculator layout | P1 | A | On EMI, SIP, FD, XIRR and GST at 1366 px: form and result cards start on the same line (±4 px); the primary result is visible in the first screen after the heading; the result column is no taller than the form column unless the summary itself is; phones: result directly after the form; no formula file changed (diff check) |
| B5 | Spacing | P1 | A | Gap from the last content block to the footer is 40–56 px on all page types; home section gaps from one token; no page gets horizontal overflow; visual baselines updated only for the reviewed changed surfaces |
| B6 | Timer finish sound | P1 | A | Pomodoro and Interval: phase cue unchanged, finish pattern different and about 2 s, played once; no sound when the sound box is off; no sound before a user gesture; a stopped or reset timer plays nothing |
| B7 | Lab layout | P1 | A | Each exercise shows, in order, objective, task, work area, check, verdict; an incorrect SQL answer says whether rows, columns or order differ; "why" shows after success or reveal; phones: "Jump to exercises" reaches the first exercise in one tap |
| B8 | Knowledge layer | P1 | B | `knowledge.js` and `official-sources.js` with validation tests; the block renders on tool, lab and lesson pages; every finance and tax calculator has ≥ 1 official source checked within the month; every Developer tool links its spec (RFC/MDN) and ≥ 1 lesson where one exists; PDF tools get an FAQ; a coverage report replaces the table in `01` section 3; no article written only to fill a slot |
| B9 | Audience hubs | P1 | C | Three hubs built from `audiences.js`; every ref resolves (unit); breadcrumbs, canonical, sitemap and search entries; home row; no tool count or section listing changes (unit check of section counts before/after) |
| B10 | AI directory v1 | P1 | C | As `04` section 6 |
| B11 | Learning depth | P1 | D | Excel path toward about 20 lessons and Power BI toward about 16, each lesson with objective, idea, example and practice by id; SQL interview set of 15–20 business-scenario questions on the shop database with expected results generated by the independent sqlite3 build; no empty module |
| B12 | Image Crop and Rotate; Image Metadata (view and remove) | P1 | D | Tool Pack specs first; crop/rotate exact pixel output tests; metadata removal verified by re-reading the output (no EXIF/GPS); 25 MB / 40 MP caps stated; phones usable |
| B13 | PDF to Images | P1 | D | pdf.js weight measured and recorded; 200-page cap; PNG/JPEG per page and ZIP; output page count equals input; render at 150 dpi default; memory released between pages |
| B14 | Theme palettes | P2 | D | 26 hard-coded colours moved to tokens first; contrast test passes for every palette × mode; preference persists across navigation and reload; no flash of the wrong palette |
| B15 | Mobile hero | P2 | C | At 390×844, 360×640 and 320×568 the first screen shows the headline, the primary action, the search and the start of the audience row |
| B16 | Opt-in progress | P2 | D | Off by default; ids only; reset, export, import validated; Privacy page updated |
| B17 | Supporting articles (candidates, each must pass rule 6.1) | P2 | B | Candidates: "JWT decoding is not verification"; "Unix time in seconds or milliseconds"; "Resize or compress: what makes an image smaller"; "Finding a meeting time across daylight-saving changes". Each answers a distinct question with real examples, or is dropped |
| — | Compress PDF, protect/unlock, background removal, OCR, PDF→Word | Future | — | documented in `03` |

## 6. Dependencies between items

- B4 and B5 touch shared CSS: do B1 first (XIRR shares the calculator layout), then B4, then B5, and review the visual baselines once for all three.
- B7 before B11 (new lessons and interview sets use the new layout) and before B16.
- B8 before B9 (hubs reuse the knowledge refs and official sources).
- B10 data verification can run in parallel with B4–B8 (research only, no code conflicts).
- B14 needs the colour clean-up (part of B5's shared CSS pass).
- B9, B10 and B15 need R1–R4; B8's lesson links need R7; B14 needs R5; B16 needs R6.

## 7. Technical risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Shared calculator CSS changes 30 pages | high | Test through representative consumers (EMI, SIP, FD, XIRR, GST, BMI); review screenshots by eye; no formula files touched |
| Memory (about 1 GB free) | high | Browser work in foreground batches, one worker; prefer unit tests; the final link crawl needs a run with more free memory or a GitHub-hosted runner (rule 10.3) |
| Lab reorder breaks pinned expectations | medium | grep tests for exercise numbers before editing; update pins as reviewed edits |
| AI directory staleness | certain over time | dates on every entry, 180-day report, removal rule |
| Official links rot (ClearTax returned 410 during research) | certain over time | all external URLs in one registry; sequential link check at each release |
| pdf.js weight and phone memory | medium | measure first; per-page render and release; caps |
| Scope (three prompts together are several weeks of work) | high | four stages, each committed, pushed to the preview and recorded; stop rule per stage |
| Search ranking regressions when hubs are added to search | low | hubs are low-priority search entries; rule 5.2 checks for existing tool queries |

## 8. Test plan (risk-based, rulebook section 10)

| Stage | Unit (local) | Browser (one worker, batched) | Visual | Static |
| --- | --- | --- | --- | --- |
| A | topic contiguity; path id resolution; time-zone country index + DST cases; finish-sound scheduling (pure) | XIRR rows (4 widths); calculator card tops (5 calculators × 2 widths); lab Next/Previous; time-zone keyboard | calculator template, home, lab shell | inventory, links |
| B | knowledge and official-source schemas; coverage report thresholds | block renders on one tool of each section | one tool page | links incl. official sources (sequential) |
| C | audiences refs; section counts unchanged; directory schema | hubs and directory filters at 1366 and 390 | hubs, directory, home | SEO, sitemap, links |
| D | new tool engines (pixel and metadata oracles); pdf page count; palette contrast; progress store | new tools' journeys; theme persistence | palettes × 3 pages | assets, weights |
| Final (Prompt 3) | full unit suite | the established projects one at a time, batched; link crawl | changed surfaces only | all; fresh root and subpath builds; package checksum |
