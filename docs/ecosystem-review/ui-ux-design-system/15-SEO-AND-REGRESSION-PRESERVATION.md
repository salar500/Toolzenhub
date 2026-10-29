# 15 SEO and regression preservation

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Requirement IDs refer to doc 17.

## SEO preservation (QA-04)

| Item | Rule for the redesign | Check |
| --- | --- | --- |
| Routes and canonical URLs | unchanged; canonicals stay on `https://toolzenhub.in` in every build (rulebook 6.5) | URL inventory check: 107 live pages |
| Titles and descriptions | unchanged unless an owner-approved reason; none is proposed | diff of `<title>` and meta description across all generated pages is empty |
| Sitemap | 107 entries unchanged; the 404 page stays out | `inventory:check` |
| Structured data | unchanged; only visible content | JSON-LD diff empty |
| Headings | text unchanged; the h1-to-h3 jump on two section pages is corrected (DS-09, an improvement, noted) | heading outline diff |
| Indexable content | explanations, FAQ, examples and article bodies remain in the static HTML; nothing moves behind JavaScript | generated-HTML check |
| Internal linking | the rail, chips, cards, footer and breadcrumb are real links in the static HTML; counts derive from the catalog | link check |
| Breadcrumbs | one central component; the lowercase category is corrected (GL-07) | generated HTML |
| Category pages | unchanged routes | URL inventory |
| Mobile navigation | links remain in the DOM; the panel is `hidden`, not removed, and not JavaScript-generated | generated HTML |
| Coming-soon content | never rendered or linked (DS-10) | no link to a missing route |
| Articles | URLs, anchors and heading ids unchanged (CT-01) | anchor diff |
| Search | one shared component; exact-name queries still lead (rulebook 5.2) | existing search specs |
| Analytics | consent-based GA4 untouched; no new tracking (rulebook 8.8) | `assets/js/analytics.js` and `src/_data/site.js` unchanged |
| Open Graph | local default image added (BR-05); canonical og:url unchanged | OG diff |

Navigation patterns and crawlability: a section rail on one page adds anchor links to headings that already exist; it creates no new URL and no duplicate content. A header search field is not proposed. No JavaScript-only navigation is introduced.

## Privacy preservation (QA-05)

No new third-party request. The proposal **removes** Google Fonts and Unsplash. The Privacy page's wording is not changed in this programme; the observation that it does not mention the font request (VERIFIED by text search) is reported in doc 02 as F-09 and left for the owner to decide whether a wording update is wanted when fonts are self-hosted (a wording change on the Privacy page is an owner decision under rulebook 8.8).

## Regression impact map

| Shared change | Direct consumers | Realistic failure modes | Verification (smallest meaningful) |
| --- | --- | --- | --- |
| Token file and colour values (BR-01, BR-09) | all pages | unreadable text on a tinted surface; a missed literal colour; broken `design-tokens` unit test | `design-tokens` and `button-contrast` unit tests; scripted contrast pass; one visual review per family |
| Typography (BR-04) | all pages | layout shift from font swap; missing rupee sign; legal pages reflow | measure CLS and font transfer; render EMI and SIP; legal pages visual |
| Header, footer, menu (GL-01 to GL-03) | all pages | menu cannot close; focus lost; sticky header hides focus; footer link removed by mistake | `navigation.spec.js`, focused keyboard test of the menu, link check |
| Buttons, forms (IX-01 to IX-05) | all 54 tools | a button looks disabled; colours restated per tool; input height change shifts layouts | existing per-tool specs for 8 representative tools; `button-contrast` unit test |
| Tool card and directory (DS-*, GL-04, GL-05) | Home, All Tools, 5 section pages, category pages | missing tool; wrong count; coming-soon shown; search regression | `inventory:check`, directory and search specs, count assertion |
| Calculator layout (TX-02) | 19 calculators | result moves; golden outputs change; focus moves on update | calculator unit and golden tests unchanged; EMI, SIP and Loan Comparison specs |
| Developer tool layout (TX-03) | 12 developer tools | editor sizing, output overflow, textarea resize | JSON Formatter, Text Diff, JSON Compare, JSONPath specs |
| File tools (TX-05) | 5 image and PDF tools | file selection breaks; download link looks disabled | one focused journey per tool; byte-identical output on fixtures |
| Learning tools (TX-06, TX-07) | Flashcards, 4 labs | verdict wording or evaluation altered; storage key changed | existing learning unit tests; opt-in storage test |
| Articles and legal pages (CT-*) | 34 articles, 5 info pages | anchors broken; text changed | anchor and text diff |
| Icon sprite (BR-06) | Home, directory, buttons | missing icon; icon-only button without a name | accessible-name check |
| Logo and favicon (BR-02, BR-03) | all pages; browser tabs | broken favicon path in the preview base `/Toolzenhub/` | asset check in both builds |

## What is protected

Do not modify: financial formulas or validation; calculation modules; PDF processing and the image compressor engines; JSON, JSONPath and cron evaluators; learning-answer evaluation and flashcard scheduling and storage; published URLs; catalog identity and the identity ledger; analytics consent code. A **protected-path diff gate** (QA-08) lists these paths and must be empty for every milestone commit.

## Controlled migration (no big-bang CSS rewrite)

1. Introduce the new tokens **beside** the old names (a mapping layer) so nothing breaks while pages migrate.
2. Migrate the shared layer first (base, components), then one page family per milestone.
3. Keep tool stylesheets untouched until their family milestone; then remove only colour literals and duplicated button rules.
4. Delete the old token names and the unused blue scale only at the checkpoint, after a search shows zero references.
5. Rollback is one revert per milestone commit (doc 18); a mapping layer means a partly migrated site still renders.

## Preserving test evidence (rulebook 10.1, 10.5, 10.6)

Passing coverage for areas a milestone does not touch is carried forward, not re-run. Visual baselines are regenerated only for surfaces a milestone changed, each image reviewed by eye, and named in the milestone report; a baseline is never regenerated to make a test pass. The redesign necessarily changes many images (95 exist today); this is flagged for owner awareness in doc 20.
