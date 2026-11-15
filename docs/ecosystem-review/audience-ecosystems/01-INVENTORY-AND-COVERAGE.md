# 01. Inventory, defects and tool-to-knowledge coverage

Checked 2026-11-15 against branch `feature/unified-ecosystem-workspace`, HEAD `cb9f2c56` (app code `997990b0`). Every figure below was produced this session from the catalogs, the built `dist/` (identical app code) or a read-only browser measurement. None is copied from older documents.

## 1. Published surface

| What | Count | Source |
| --- | --- | --- |
| Catalog entries | 76 (75 published, 1 coming-soon) | `getTools()` / `getPublishedTools()` |
| Sitemap URLs | 671 | `dist/sitemap.xml` |
| of which Practice Labs pages | 530 (departments, 31 paths, levels, modules, 264 lessons) | sitemap prefix `/practice-labs/` |
| Calculator pages | 30 | `/calculators/<id>/` |
| Tool pages (other sections) | 45 | `/tools/<id>/` |
| Articles | 43, all published | `getPublishedArticles()` |
| Section and hub pages | 22 | landing, category and information pages |

Articles by category: loans 13, investment 11, business 7, math 4, tax 3, ai 3, health 1, converter 1. **No article serves Time, Developer, Image, PDF or Practice Labs.**

Registries in use (`assets/js/data/`): `tools.js` (catalog, SEO, loaders), `calculators.js`, `categories.js`, `taxonomy.js`, `relationships.js` (curated + fallback related content), `search-index.js`, `tool-capabilities.js`, `articles.js` + `articles/` (19 files). Practice Labs: `practice-labs/curriculum.js` (31 paths), `departments.js` (8 departments). Shared navigation: `components/section-switcher.js` (`SECTION_GROUPS`).

Sections and tools: see `00-RESEARCH-BLUEPRINT.md` section 2. Vendored libraries: pdf-lib, jsPDF, sql.js, pyodide.

## 2. Verified UI defects

Measured at 1366×900 and 390×844 in light mode, and on 3 pages in dark mode: 19 page/size combinations in light mode and 6 in dark mode. Script and screenshots are in the session scratchpad, not the repo.

| # | Defect | Evidence |
| --- | --- | --- |
| D-A | Calculator result card starts above the input card and grows very tall | EMI: results top 319 px vs form 460 px; SIP results column 1,911 px; FD 808 px vs form 1,005 px |
| D-B | XIRR "Remove" overflows its grid column and the card | 150 px button in a 110 px column (`xirr.css:68`), about 109 px past the card edge with the sidebar open |
| D-C | Pomodoro/Interval finish sound = phase-change sound, 0.45 s | `timer-cycle/cycle-controller.js` lines 120–133, called at 250 and 280 |
| D-D | Time-zone search misleads and lacks countries | `searchZones("india")` → America/Indiana/*; `japan`, `brazil`, `germany` → no result; raw/legacy ids as labels |
| D-E | Gap above the footer is 110–161 px on every page type | home 124–130, calculators 151, labs 151, lesson 110–125, article 135, All Tools 155–161 |
| D-F | Nested section padding on Home | outer `section` 32/16 px + inner 18–24/16–34 px |
| D-G | SQL lab topic groups out of order; Power BI "Project" split | SQL exercises 31–38 appended with early topics; PBI 22, 23, 43 |
| D-H | Standalone labs on phones: first exercise far below the fold | Excel lab phone: intro + worked example fill the first two screens; page 8,576 px |
| D-I | All Tools on phones is 17,028 px tall | `/tools.html` at 390 px |
| D-J | 26 hard-coded colours outside the tokens in 8 stylesheets | `loans-hero.css` 10, `shoplite.css` 4, `learn.css` 4, `footer.css` 4, four tool files 1 each |

Not defects (checked): no horizontal page overflow on any page measured; the mobile hero already puts the search before the illustration; dark mode on the home page, EMI and the SQL lab is consistent; learning-path lesson pages already have objectives, prerequisites, a plain-words idea, a runnable example and progress.

## 3. Tool-to-knowledge coverage (per published tool)

Columns: curated related tools; articles (curated `relatedArticles` on the tool plus articles listing the tool, whichever is larger); FAQ section on the page; official external links on the page; links from the tool page to a learning path.

| Section | Tools | With ≥1 article | With FAQ | With an official source | Linking to a learning path |
| --- | --- | --- | --- | --- | --- |
| Calculators | 30 | 19 | 28 (not: risk-reward, gratuity) | **1** (income-tax: e-Gazette ×2, Income Tax Dept rules PDF, PIB) | 0 |
| Time Tools | 13 | 0 | 13 | 0 | 0 |
| Developer Tools | 12 | 0 | 12 | 0 | 0 |
| Practice Labs | 8 | 0 | 0 | 0 | n/a |
| AI Tools | 6 | 3 | 6 | 0 | 0 |
| Image Tools | 2 | 0 | 2 | 0 | 0 |
| PDF Tools | 4 | 0 | **0** | 0 | 0 |
| **All** | **75** | **22** | **61** | **1** | **0** |

Reverse direction: 195 of about 530 Practice Labs pages link to at least one tool, but no tool page links back to a lesson or path. The 43 articles contain no external links at all.

Calculators without any article (11): emi, personal-loan, loan-eligibility, interest, xirr, risk-reward, gratuity, salary-in-hand, bmi, ratio, age. Three more (loan-comparison, swp, credit-card-payoff) have articles in one direction only (an article lists the tool, or the tool lists an article, but not both).

Classification of needs (feeds backlog B8 in `05-ARCHITECTURE-AND-ACCEPTANCE.md`):

| Group | Most useful resource types | Official sources to verify |
| --- | --- | --- |
| Loans (9) | how-to, decide, compare, mistakes, official | RBI (Fair Practices Code, key facts statement), bank rate pages with date |
| Investment (7) | concepts, compare, mistakes, official | SEBI investor pages, NPS Trust, India Post (PPF), AMFI |
| Tax (4) | official (primary), examples, decide | Income Tax Dept, CBIC/GST portal, EPFO, Labour Ministry (gratuity) |
| Health (3) | concepts, limits, official | WHO BMI classification, ICMR-NIN dietary guidelines |
| Business, Math, Converter (7) | examples, mistakes | BIPM SI brochure (units) |
| Time Tools (13) | how-to, examples, official for zones | IANA tz database |
| Developer Tools (12) | examples, mistakes, learn (paths), official specs | RFC 8259, RFC 7519, RFC 4648, RFC 9562, RFC 3986, RFC 9535 (JSONPath), MDN |
| Practice Labs (8) | how-to (lab use), learn (paths), interview | SQLite docs, Microsoft Learn (Excel, Power BI, DAX), ISTQB glossary |
| AI Tools (6) | examples, compare, directory | AI directory entries |
| Image/PDF (6) | how-to, formats, privacy, mistakes; FAQ for PDF | ISO 32000 overview (PDF Association), MDN image formats |

Each source above is a **candidate**. None has been entered or verified yet; verification with `checkedOn` is part of B8.
