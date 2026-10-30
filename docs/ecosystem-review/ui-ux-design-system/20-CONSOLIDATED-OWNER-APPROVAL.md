# 20 Consolidated owner approval

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29.

## OWNER DECISION RECORDED 2026-10-29 (approved baseline, with conditions)

The owner approved the recommended **Design C: Premium Neutral + Indigo** as the baseline for Master Prompt 2, subject to the conditions below. The rest of this document, and documents 01 to 19, are left unchanged as the original research evidence and proposal; where a condition differs from a recommendation, **this record governs**. **Implementation has not started and Master Prompt 2 has not been supplied.** No push, deployment, pull request, Hostinger or production change is approved, and no commit is authorised by this decision.

| # | Decision | Recorded outcome |
| --- | --- | --- |
| 1 | Visual identity | Approved: C (page `#fafaf9`, ink `#1c1917`, accent `#4338ca`). Actual component contrast is verified during implementation (added as acceptance criterion QA-01.3) |
| 2 | Typography | Approved **conditionally**: self-hosted Inter only after licence, measured size and the rupee glyph are verified; system-font fallback (BR-04.3) |
| 3 | Logo | Approved preferred direction: Concept 2, connected tools, refined for brand quality |
| 4 | Favicon | **Not fixed to Concept 2.** Compare Concepts 2 and 3 at real 16 and 32 px, choose the clearest, keep it visually consistent with the logo (BR-03.3) |
| 5 | Desktop sidebar | Approved: page-scoped rail on All Tools only; no permanent global sidebar; tool-page rail stays DEFER |
| 6 | Mobile navigation | Approved: focus management, keyboard operation, Escape, backdrop, 44 px controls, responsive layout (GL-03) |
| 7 | Homepage | Approved: compact hero, prominent search, five section cards, curated Featured, relevant articles, no unnecessary stock art, no fabricated popularity |
| 8 | All Tools directory | Approved: desktop rail, mobile section navigation, catalog reuse, clear cards, accessible filtering and search, route preserved |
| 9 | Component system | Approved: cards, buttons, forms, inputs, results, alerts, dialogs, tables, navigation, focus states |
| 10 | Tool pages | Approved across the five ecosystems; functionality, calculations, processing engines and learning evaluators preserved |
| 11 | Icons and imagery | Approved: one SVG icon system and meaningful imagery only; asset licences and loading costs reviewed |
| 12 | Footer | Placeholder social links are removed or replaced **only** with owner-verified destinations; none is invented (GL-02.3) |
| 13 | Accessibility | WCAG 2.2 AA target; real components verified, not only palette pairs |
| 14 | Performance | Existing lightweight architecture; no framework, no heavy animation dependency |
| 15 | Development sequence | UI-0 to UI-9 approved, subject to actual dependency verification; focused testing per milestone |
| 16 | Rulebook | **Applied in this phase** (see below) |
| 17 | Documentation integrity | Discrepancy resolved (see below); original evidence kept |
| 18 | Boundaries | As stated above |

### Rulebook changes made in this phase (rulebook 15 maintenance process)

Two scoped edits to `docs/product-decision-rules.md`, each replacing or extending the clause it concerns rather than adding a parallel rule:

1. **Rule 1.10:** the sentence "there is no broad redesign" now carries an approved exception naming the UI/UX Design System 2.0 programme as the one authorised site-wide visual redesign, presentation only, delivered as separately approved milestones UI-0 to UI-9, preserving URLs, features, calculations and engines; not a general permission.
2. **Rule 4.8:** the page-scoped All Tools category rail (desktop) and section chips (phones) are allowed as an in-page directory index; not a permanent global sidebar; no sidebar on tool pages or elsewhere; the opening note "no sidebar exists" now points to this exception. The pilot requirement for contextual tool-page navigation is unchanged.

No other rule changed. Dark mode, the contextual tool-page rail and the related-tools panel (GL-06) remain outside this approval.

### Acceptance-criteria count discrepancy: resolved

An interim count of 115 was reported while the package was being built, before a criterion was added to the mobile-menu requirement (GL-03: toggle at least 44 px). The validated total was then 116 and is **120** after the four owner conditions above were added as testable criteria (BR-03.3, BR-04.4, GL-02.3, QA-01.3). Document 17 is generated from the validated dataset and shows 120 criteria for 62 requirements, of which 118 are assigned to milestones and 2 sit on the deferred items BR-08 and TX-09 (the earlier gap between a milestone sum and the total). Priorities are unchanged: 50 P0, 9 P1, 1 P2, 2 DEFER. No document hard-codes a different count.

## Original approval request (unchanged below)

 This is the **one** approval request for the programme. Nothing below is approved until the owner answers it. Until then no application file, test or baseline changes, no rule changes, and no push or deployment occurs.

Review aids: `concepts/design-concepts.html` (open locally in a browser; four direction tabs), the three SVG logo concepts in `concepts/`, and the recommended answers below. The owner can reply "approve all recommended" or change any line.

## Decisions requested (16)

| # | Decision | Recommendation | Alternatives | Where to read |
| --- | --- | --- | --- | --- |
| 1 | Overall visual direction | **C · Premium Neutral + Indigo** ("editorial calm": ink buttons, one indigo accent, airy density) | D Deep Teal and Ink (runner-up); A Modern Emerald; B Blue and Slate | 04, 05, 16 |
| 2 | Brand colour palette | Option C values in doc 05: page `#fafaf9`, ink `#1c1917`, primary `#1c1917`, accent and link `#4338ca`, control border `#78716c`, success `#166534`, error `#b91c1c`, warning `#92400e` (80 of 80 contrast checks pass) | the other three tables in doc 05 | 05 |
| 3 | Typography | Inter self-hosted (Latin plus ₹), system fallback, system monospace, Georgia and Google Fonts removed; fall back to the pure system stack if the font exceeds 70 KB | system stack only | 05 |
| 4 | Logo direction | **Concept 2, connected tools** (tiles with one offset accent tile), plain Inter wordmark | Concept 1 Hub; Concept 3 Z monogram | 06 |
| 5 | Favicon direction | the compact symbol of the chosen concept (larger tiles, no wordmark), SVG plus 32 px and 180 px PNG | Concept 3's Z is the safest at 16 px | 06 |
| 6 | Desktop sidebar model | **No global sidebar.** A sticky 240 px **rail on the All Tools page only** (section links with counts, search above); contextual tool-page rail DEFER | strict reading of rulebook 4.8: chips only, no rail | 08 |
| 7 | Mobile navigation model | existing dropdown menu, restyled: 44 px toggle, backdrop, focus containment, Escape, close button; section chips on All Tools; no bottom bar, no gesture dependence | side drawer | 09 |
| 8 | Homepage architecture | compact hero with search, five section cards with catalog counts, curated Featured, latest articles, narrow trust line; no stock illustration | keep the current hero art | 10 |
| 9 | All Tools directory architecture | keep `/tools.html`; search, section chips or rail, section blocks with a shared tool card; published tools only | none | 10 |
| 10 | Shared component system | one token file, one card, one button hierarchy (primary, secondary, tertiary, destructive), 44 px controls with 3:1 borders, one alert, native accordion, one focus ring | per-family styles | 12 |
| 11 | Tool-page layout principles | one shared frame, a different working area per family, per-tool privacy note replacing the generic badge, formulas and engines untouched | one identical layout | 11 |
| 12 | Iconography | one inline SVG sprite, about 30 meaning-bearing icons; no emoji or glyph icons | an open-source icon set under a permissive licence | 13 |
| 13 | Imagery direction | explanatory diagrams or none; remove the hero artwork and all Unsplash photographs; no third-party image host | keep the hero art | 13 |
| 14 | Major accessibility requirements | WCAG 2.2 AA targets in doc 14: 4.5:1 text, 3:1 non-text, 44 px controls, visible focus not obscured, reflow at 320 px, reduced motion, text plus icon for state | none | 14 |
| 15 | Development sequence | ten milestones UI-0 to UI-9, each its own approved phase and commit, one Playwright worker | reorder | 18 |
| 16 | Material architectural exceptions and rule changes | see below | | 19 |

### Item 16 in detail: exceptions the owner is asked to confirm

1. **Rulebook 1.10** says there is no broad redesign. Approving this programme means replacing that sentence with wording that permits a design-system programme delivered as approved milestones. The change would be made in the phase that records the approval, in the document that owns it (`docs/product-decision-rules.md`, with `docs/shared-tool-ux.md` for the shared layer), replacing the old wording, and named in that phase's report. **No rule has been changed in this research phase** (none is approved).
2. **Rulebook 4.8** and the All Tools rail: confirm the rail is a page-scoped directory index and not the site-wide sidebar that needs a pilot (decision 6).
3. **Visual baselines (10.5):** approve regenerating baselines per milestone for changed surfaces only, each reviewed by eye.
4. **Privacy page:** whether to add a line about self-hosted fonts after the change (a wording decision under rulebook 8.8); not required for the build.
5. **Related-tools panel (GL-06):** needs its own approval and is **not** part of this approval.
6. **Dark mode and the contextual tool rail** are DEFERRED; they are not part of this approval.

### Not asked

Variable names, spacing details, CSS class names, module names and ordinary test organisation are decided during development (rulebook 7.8).

## What approval would authorise

Master Prompt 2 of 3 (design and development), delivered milestone by milestone with focused, risk-based verification and local commits only; then Master Prompt 3 of 3 (independent testing, defect fixing and local closure). Pushing and deploying to the GitHub Pages preview remain separate authorisations (rulebook 11.2). Production (`toolzenhub.in`, Hostinger) is never touched without an explicit request.

## What this research did not verify

Core Web Vitals; screen-reader output; real Android and Safari; every page in every family (sampled); the interactions beyond the mobile menu and one search; the licence and size of Inter and of any icon source; the visual properties of the public references.

## Counts for this package

See `17-ACCEPTANCE-CRITERIA-AND-TRACEABILITY.md`: requirements, acceptance criteria and priority totals are generated there and validated by script.

## Owner decision after Master Prompt 3 (2026-10-30)

Breadcrumb category label: show "Loans" (title case) instead of "loans", with the matching BreadcrumbList name change only. URLs, hierarchy, canonicals and unrelated structured data are unchanged. This is a narrow exception to QA-04.2 (doc 17) and is recorded in rule 4.6 of `docs/product-decision-rules.md`.
