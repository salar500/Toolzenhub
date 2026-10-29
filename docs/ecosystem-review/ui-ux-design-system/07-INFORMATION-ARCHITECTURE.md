# 07 Information architecture

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. This document changes **presentation, not structure**. No route, section, category, canonical or catalog rule changes.

## Current structure (VERIFIED)

```
Home /
├─ All Tools /tools.html                 (global discovery: search, 5 sections, 23 groups)
├─ Calculators /calculators.html         (8 categories; /calculators/<id>/ ; 19 tools)
│   └─ category pages: Loans, Investment, Business, Tax, Math (and /categories.html)
├─ Time Tools /time-tools.html           (13 tools, /tools/<id>/)
├─ Developer Tools /developer-tools.html (17 tools incl. Smart Flashcards and 4 Practice Labs)
├─ Image Tools /image-tools.html         (2 tools)
├─ PDF Tools /pdf-tools.html             (3 tools)
├─ Articles /articles.html               (34 articles, /articles/<topic>/<slug>/)
└─ About, Contact, Privacy, Terms, Disclaimer
```

Header: Home, All Tools, Articles, About. Footer: quick links, resources, calculators, legal.

## Constraints from the rulebook that bind the IA

| Rule | Consequence for the redesign |
| --- | --- |
| 4.1 hierarchy is earned by scale | no new section, category or subcategory is proposed |
| 4.2 a tool belongs to exactly one section and never appears in another section's listings, scoped searches, related lists or counts | any rail, chip, card, related panel or count shows one section only |
| 4.3 routes, sections, links and counts derive from the catalog | counts in cards, chips and the rail are generated, never typed |
| 4.4 real pages only; coming-soon entries are catalog data | no coming-soon card appears anywhere (DS-10) |
| 4.5 the header stays uncluttered; a new section is not automatically a header item | the header keeps its four links (GL-01) |
| 4.6 breadcrumbs from one central component | tool modules never render their own (GL-07) |
| 4.8 ecosystem navigation in small steps, same-section only, no site-wide sidebar before a pilot | see doc 08: the only sidebar-like element proposed is on one directory page; the tool-page rail is DEFER |
| 5.1 global search covers all tools; section searches stay scoped | the shared search stays one component; no second implementation |

## Proposed IA presentation

1. **Header (all pages).** Logo, four links, the mobile menu button. Active page marked with `aria-current` and a non-colour cue. No search field is added to the header in this programme (the shared search is on Home, All Tools and the 404 page; a header search is a P2 idea only if evidence shows people leave without searching).
2. **Home.** Value proposition and search; five section cards with catalog counts; a short curated Featured list; latest articles; a narrow trust line. No extra homepage sections (doc 10).
3. **All Tools.** Remains the global directory at `/tools.html`: search, then five sections in catalog order each with its count and a one-line purpose, then cards. A section navigation (rail on desktop, chips on phones) jumps within the page (GL-04, GL-05).
4. **Section pages.** Unchanged routes. Each uses the shared tool card. No cross-section content.
5. **Tool pages.** Shared frame (breadcrumb, eyebrow, h1, description, privacy note, workspace, explanation). An in-flow **Related tools** panel (same section only) is a P1 pilot with its own approval (GL-06).
6. **Articles.** Unchanged routes and anchors; reading-width layout (CT-01).
7. **Footer.** Five sections plus resources and legal, generated from the catalog; placeholder social links removed (GL-02).

## Search and discovery (IA view)

The task asked whether search remains the primary discovery method. Evidence: Home and All Tools both place search first (VERIFIED); competitors observed in doc 03 show category tabs or grouped menus more often than a search field on the landing page (OBSERVED: none of iLovePDF, Smallpdf, PDF24, Omni or Calculator.net exposed a search field in the retrieved text; Codecademy did). Recommendation: **keep search first, add scannable section structure beneath it.** No usage data exists to say which is used more (UNKNOWN). Both are required, because 54 tools in five sections is too many for a flat list on a phone and too few to hide behind search alone.

## URL, title and heading preservation

Unchanged (QA-04). Headings change only where a defect exists (the h1-to-h3 jump on two section pages, DS-09). New elements (rail, chips, cards) are additional landmarks or lists in the static HTML, labelled `aria-label="Sections"`; they do not alter the heading outline.

## Open IA questions for the owner

None blocks Prompt 2. One is a rule question (doc 20, item 16): whether the All Tools section rail counts as the "sidebar" that rulebook 4.8 says needs a pilot first. This package argues it does not, because it is a within-page directory index on one route, not site-wide ecosystem navigation, and asks the owner to confirm.
