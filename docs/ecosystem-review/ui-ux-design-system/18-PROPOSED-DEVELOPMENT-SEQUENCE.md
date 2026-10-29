# 18 Proposed development sequence

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. The milestones are **provisional** and optimised against the dependencies recorded in doc 17 (validated by script: no requirement depends on a later milestone). Each milestone is its own approved phase with its own commit (rulebook 11.2 and 11.7). No development is authorised by this document.

## Order and why it differs from the provisional list

The provisional list had brand first and components fourth. Dependencies place **tokens first** (everything reads them), then **brand** (logo, type and icons feed the header), then **shared components** (buttons, forms, cards, focus) **before** the header, directory and tool pages that consume them. Calculators and Time Tools share a milestone because both consume the calculator frame; Developer Tools, Practice Labs and Flashcards share one because they share the editor layout and learning styles. The checkpoint stays last.

| Milestone | Name | Requirements |
| --- | --- | --- |
| UI-0 | Baseline, gates and design-token foundation | BR-01, BR-09, GL-08, GL-09, QA-03, QA-08, QA-09 |
| UI-1 | Brand identity: logo, favicon, typography, icons | BR-02, BR-03, BR-04, BR-05, BR-06, BR-07 |
| UI-2 | Shared components: buttons, forms, cards, states | IX-01 to IX-09, DS-07, TX-08 |
| UI-3 | Header, footer, mobile menu, breadcrumbs | GL-01, GL-02, GL-03, GL-07 |
| UI-4 | Homepage, All Tools, section pages, search, 404 | DS-01 to DS-06, DS-08 to DS-10, GL-04, GL-05, GL-10, CT-06 |
| UI-5 | Calculators and Time Tools layouts | TX-01, TX-02, TX-04, CT-03 |
| UI-6 | Developer Tools, Practice Labs, Flashcards (and related-tools pilot) | TX-03, TX-06, TX-07, GL-06 |
| UI-7 | Image and PDF tool layouts | TX-05 |
| UI-8 | Articles and informational pages | CT-01, CT-02, CT-04, CT-05 |
| UI-9 | Integration checkpoint and conformance verification | QA-01, QA-02, QA-04, QA-05, QA-06, QA-07 |

P1 and P2 items inside a milestone (BR-05, BR-07, IX-07, IX-09, DS-09, GL-06, GL-10, CT-01, CT-02, CT-04) are optional within it: a milestone is complete when its P0 items pass; a P1 or P2 item not done is recorded, not hidden. GL-06 starts only after its own approval.

## Milestone specifications

Standing rules for every milestone: one Playwright worker, one project at a time; `npm run build` or `build:preview` only when built output changed; static checks (`inventory:check`, links, assets, SEO) when pages, routes or assets changed; protected-path diff must be empty (QA-08); baselines regenerated only for changed surfaces and reviewed by eye (rulebook 10.5); no push or deployment without the phase's own authorisation (rulebook 11).

### UI-0 Baseline, gates and token foundation
- **Objective.** Record a before-state and introduce the new tokens beside the old ones.
- **User benefit.** None visible; it makes every later step safe and measurable.
- **Requirements.** BR-01, BR-09, GL-08, GL-09, QA-03, QA-08, QA-09.
- **Files.** `assets/css/base/variables.css` (new token block and a mapping from old names), `tests/unit/design-tokens.test.mjs` if the rule set changes, a recorded baseline measurement file under `docs/`.
- **Dependencies.** Owner approval (doc 20).
- **Shared components.** none yet.
- **Accessibility.** scripted contrast pass over the token pairs.
- **Focused tests.** `design-tokens` and `button-contrast` unit tests; a one-time Lighthouse run on six representative pages on a GitHub-hosted runner if local memory is low (rulebook 10.3), to record LCP and CLS (not measured in this research).
- **Regression consumers.** all pages, but no visual change is expected.
- **Performance limit.** CSS transfer within +2%.
- **Completion.** tokens defined, mapping layer in place, baseline numbers recorded, protected-path gate defined.
- **Rollback.** revert the commit.

### UI-1 Brand identity
- **Objective.** One logo, favicon, font and icon set.
- **User benefit.** A coherent, recognisable identity; no third-party font request; legal pages stop rendering in Times.
- **Requirements.** BR-02 to BR-07 (BR-05 and BR-07 optional).
- **Files.** logo and favicon SVGs and PNG fallbacks, `src/_includes/layouts/base.njk` (icon links), header and footer templates and `components/header.css`, `components/footer.css`, a font file under `assets/`, the sprite file.
- **Dependencies.** UI-0; owner choices on logo, favicon and palette.
- **Shared components.** logo, icon sprite, type tokens.
- **Accessibility.** accessible logo name; icons named when alone; rupee glyph present.
- **Focused tests.** asset check in both builds; computed font on EMI, SIP and the legal pages; no request to Google Fonts; favicon visible at 16 px (manual).
- **Regression consumers.** every page (header, footer, font).
- **Performance limit.** font at most 70 KB; sprite under 8 KB gzip; zero third-party font requests; CLS from font swap at most 0.02.
- **Completion.** BR-02, BR-03, BR-04, BR-06 pass.
- **Rollback.** revert; mapping layer keeps old tokens working.

### UI-2 Shared components
- **Objective.** One button, form-control, card, alert, tab and accordion layer with states and focus.
- **User benefit.** Controls look and behave the same on all 54 tools; enabled secondary actions look usable.
- **Requirements.** IX-01 to IX-09, DS-07, TX-08.
- **Files.** `components/buttons.css`, `components/forms.css`, `components/cards.css`, `base/accessibility.css`, `calculators/calculator-form.css`; no tool stylesheet yet.
- **Dependencies.** UI-0, UI-1.
- **Accessibility.** 44 px targets, 3:1 borders, focus ring, no colour-only state.
- **Focused tests.** `button-contrast` unit; `tool-controls.spec.js`; `accessibility.spec.js`; one calculator, one developer tool, one file tool and Flashcards specs.
- **Regression consumers.** all tools (HIGH); mitigated by the mapping layer and by testing eight representative tools.
- **Performance limit.** CSS within +10% of baseline.
- **Completion.** IX-01, IX-02, IX-04, IX-05, IX-06, IX-08, DS-07, TX-08 pass.
- **Rollback.** revert.

### UI-3 Header, footer, mobile menu, breadcrumbs
- **Objective.** New header and footer; a contained, 44 px mobile menu; corrected breadcrumbs.
- **User benefit.** Consistent navigation on every page; keyboard users cannot fall out of the open menu.
- **Requirements.** GL-01, GL-02, GL-03, GL-07.
- **Files.** `assets/js/components/header.js`, `footer.js`, `breadcrumb.js`, `components/header.css`, `navigation.css`, `footer.css`.
- **Dependencies.** UI-1, UI-2.
- **Accessibility.** one banner, labelled navs, `aria-current`, focus containment, Escape and focus return, scroll padding for the sticky header.
- **Focused tests.** `navigation.spec.js`, a new focused keyboard test of the menu, `links.spec.js`.
- **Regression consumers.** every page.
- **Performance limit.** JavaScript +1 KB gzip at most.
- **Completion.** GL-01 to GL-03, GL-07 pass; footer has no dead link.
- **Rollback.** revert.

### UI-4 Homepage, All Tools, section pages, search, 404
- **Objective.** New discovery experience.
- **User benefit.** Faster scanning of five sections, a rail or chips on All Tools, no stock art, a useful 404.
- **Requirements.** DS-01 to DS-06, DS-08 to DS-10, GL-04, GL-05, GL-10, CT-06.
- **Files.** `src/home.njk`, `src/tools.njk`, `src/section-pages.njk`, `src/404.njk`, `pages/home.css`, `pages/directory.css`, `components/hero.css`, `search*.css`, `src/_data/directory.js` (read-only unless a count needs exposing).
- **Dependencies.** UI-2, UI-3; owner confirmation of the sidebar reading (doc 08).
- **Accessibility.** labelled navs, focus to section heading, polite result counts, no-results state.
- **Focused tests.** `directory`, `search`, `catalog` unit tests; `navigation.spec.js`; `notfound.spec.js`; `inventory:check`; visual baselines for Home, All Tools and the 404 only.
- **Regression consumers.** Home, All Tools, 5 section pages, category pages, search.
- **Performance limit.** Home images at most 50 KB above the fold; All Tools DOM under 600; no third-party host.
- **Completion.** DS-01 to DS-06, DS-08, DS-10, GL-04, GL-05, CT-06 pass; tool count 54; no coming-soon rendered.
- **Rollback.** revert.

### UI-5 Calculators and Time Tools
- **Objective.** Apply the frame and result layout.
- **User benefit.** A clear result, tabular numbers, a stable live clock.
- **Requirements.** TX-01, TX-02, TX-04, CT-03.
- **Files.** `calculators/calculator-base.css`, `calculator-form.css`, `calculator-results.css`, `tools/time-tools.css` and the tool stylesheets touched only for colour literals and layout.
- **Dependencies.** UI-2.
- **Accessibility.** jump link focus, polite results, table regions.
- **Focused tests.** golden calculator unit tests unchanged; EMI, SIP, Loan Comparison, Stopwatch and World Clock specs; one calculator visual and one time-tool visual at 390 and 1280.
- **Regression consumers.** 19 calculators, 13 time tools.
- **Performance limit.** World Clock DOM not above 3,370; Stopwatch CLS 0 over one minute.
- **Completion.** TX-01, TX-02, TX-04, CT-03 pass.
- **Rollback.** revert.

### UI-6 Developer Tools, Practice Labs, Flashcards
- **Objective.** Workspace layout, action placement, verdict regions, reveal pattern.
- **User benefit.** The primary action is on screen without scrolling; clear feedback.
- **Requirements.** TX-03, TX-06, TX-07, GL-06 (pilot only after approval).
- **Files.** `tools/json-formatter.css`, `text-diff.css`, `json-compare.css`, `jsonpath-tester.css`, `learning.css` and similar.
- **Dependencies.** UI-2, UI-5 (frame).
- **Accessibility.** verdict text, polite regions, no focus movement.
- **Focused tests.** existing specs for JSON Formatter, Text Diff, JSON Compare, JSONPath, the four labs, `smart-flashcards.spec.js`, `learning-a11y.spec.js`, `learning-widths.spec.js`; unit tests unchanged.
- **Regression consumers.** 17 developer tools.
- **Performance limit.** no new JavaScript except the related-tools panel (at most 1 KB).
- **Completion.** TX-03, TX-06, TX-07 pass.
- **Rollback.** revert.

### UI-7 Image and PDF tools
- **Objective.** Upload, list, action and result presentation.
- **User benefit.** A clear first step and a visible, enabled Download.
- **Requirements.** TX-05.
- **Files.** `tools/image-compressor-resizer.css`, `photos-to-pdf.css`, `pdf-tools.css`.
- **Dependencies.** UI-2.
- **Accessibility.** keyboard-only journey; no drag requirement.
- **Focused tests.** `image-compressor-resizer.spec.js`, `photos-to-pdf.spec.js`, `pdf-tools.spec.js`; output fixtures byte-identical; low memory means one file tool at a time.
- **Regression consumers.** 5 tools.
- **Performance limit.** memory limits already specified are unchanged.
- **Completion.** TX-05 passes.
- **Rollback.** revert.

### UI-8 Articles and informational pages
- **Objective.** Reading layout and legal pages inside the system.
- **User benefit.** Comfortable reading; consistent legal pages.
- **Requirements.** CT-01, CT-02, CT-04, CT-05.
- **Files.** `pages/article/*.css`, `pages/articles*.css`, `pages/privacy.css`, `terms.css`, `disclaimer.css`, `about.css`, `contact.css`.
- **Dependencies.** UI-1, UI-2.
- **Accessibility.** heading anchors preserved; TOC collapsible.
- **Focused tests.** `articles.spec.js`, `seo-baseline.spec.js`, `contact.spec.js`; text and anchor diff; visual baselines for one article and one legal page.
- **Regression consumers.** 34 articles, 5 information pages.
- **Performance limit.** no stock images; hero diagrams under 40 KB.
- **Completion.** CT-05 passes (CT-01, CT-02, CT-04 optional).
- **Rollback.** revert.

### UI-9 Integration checkpoint
- **Objective.** Verify the whole at a deliberate checkpoint (rulebook 10.12).
- **Requirements.** QA-01, QA-02, QA-04, QA-05, QA-06, QA-07.
- **Checks selected (not everything).** static suite; `accessibility.spec.js`; navigation and search; one project at a time for desktop, mobile and visual; Lighthouse on six pages versus the UI-0 baseline; reflow at 320 px on the 20-page sample; screen-reader and real-device checks reported as unverified unless the owner performs them.
- **Completion.** every P0 acceptance criterion in doc 17 is passed, or listed with its reason and risk. No full regression is assumed necessary beyond this checkpoint.
- **Rollback.** per-milestone reverts; the checkpoint itself changes only defects it finds.

## Machine and process limits

The laptop has about 4 GB RAM (free memory read at 880 MB during this research). Therefore: one Playwright worker, sequential projects, focused specs, Lighthouse and heavier visual runs on a GitHub-hosted runner using a temporary branch with read-only permissions and no deployment step (rulebook 10.3), and no repeat of builds that are already fresh.
