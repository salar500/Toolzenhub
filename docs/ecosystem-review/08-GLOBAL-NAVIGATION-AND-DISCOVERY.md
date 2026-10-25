# 08. Global navigation and discovery

Method: source reading (`assets/js/data/*.js`, `assets/js/pages/tool-page.js`, `src/_data/directory.js`), the built `dist-ghpages/` HTML, the URL inventory, one HTTP sweep and the navigation tests from the PDF phase (Home shows five category cards; All Tools shows five sections, 23 groups, five section labels). **No manual or visual walk of the live site was done in this review**; items needing one are marked NOT VERIFIED.

## Structure (verified from the catalog and the inventory)

Five sections: Calculators (8 categories, calculator routes `/calculators/<id>/`), and four flat sections (Time Tools, Developer Tools, Image Tools, PDF Tools) with routes `/tools/<id>/` and landing pages `/<section>.html`. Global discovery is `/tools.html` (All Tools) plus search; the header stays uncluttered by rule (4.5). Breadcrumbs come from one component (4.6). Articles live under `/articles/<topic>/<slug>/`, 34 pages, with `/articles.html`.

## Verified findings

| ID | Current problem | Evidence | User impact | Recommendation | Priority |
|---|---|---|---|---|---|
| N1 | Related tools and related articles are never rendered on any of the 21 non-calculator tool pages | every module exports `showRelatedCalculators = false` and `showRelatedArticles = false`; `tool-page.js` honours the flags | A visitor finishing a task finds no next step except a sentence of body text; curated relations in the catalog are invisible | IMPROVE RELATED NAVIGATION: render the existing related-tools component on non-calculator tools, as the rulebook's approved 4.8 direction says, piloted on one family first | High |
| N2 | A curated relation crosses sections (Time Zone Converter to Unix Timestamp Converter) | `tools.js` | Breaks rulebook 4.2 in data; not rendered today, so harmless until N1 renders it | Resolved in 14 (D2): converter and its text link unchanged; the display component shows same-section relations only | High |
| N3 | Relation graph is uneven or one-directional in several families (SIP/SWP, Date Calculator/Date Difference, World Clock/Time Zone Converter, JSON/Text Diff, JWT/Unix, compressor/Photos to PDF) | 03 to 07 | Missed next steps | Add reciprocal curated relations only where the same user needs both | Medium |
| N4 | Cross-section journeys exist in real use (photos to PDF to merge; cron/JWT to a time converter) | 06, 07, 05 | Genuine but forbidden in related lists | Decide the policy (14, P3 (D5)): text-only mentions, or a deliberate rule change. Do not add sidebars or header items | Medium |
| N5 | Eleven coming-soon calculators and six coming-soon articles are catalog entries without pages | inventory | None visible | KEEP; no placeholder cards (4.4) | n/a |

## Not verified (need a manual pass)

Global and section-scoped search result quality, the mobile menu, footer links, back/forward history, Home card ordering, calculator subcategory navigation. Known problems recorded in `tests/README.md` (lowercase category in calculator breadcrumbs, placeholder `href="#"` footer links, an h1-to-h3 jump on the Loans listing) date from the M0 baseline and were **not re-verified** in this review.

## Rules to respect

Rulebook 4.2 (one section per tool; no cross-section listings), 4.5 (no automatic header item), 4.8 (small steps, pilot first, no site-wide sidebar before it), 5 (search: exact queries win; check both directions), 6.3 (related only when intent overlaps; "no related section" is valid).

## Recommended pilot (proposal)

Pilot N1 on **one** family. The Time Tools are the rulebook's own suggestion and have the most uneven graph, but the Developer Tools are cleaner (no cross-section relation in that family) and the data is already curated. Acceptance: the section's related tools appear on each page in that family, never from another section, keyboard and screen-reader order is sensible, no layout shift on phones, existing URLs and baselines intact apart from the intended DOM diff. A sidebar is not recommended: nothing in the evidence shows a need that the existing related component cannot meet.
