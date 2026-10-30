# 21 UI/UX development ledger

UI/UX Design System 2.0, Master Prompt 2 (design and development). This is the **one** development ledger. Documents 01 to 20 are the approved research and are not rewritten; where this ledger records a deviation, it says so.

**Authority:** owner approval of Design C recorded in `20-CONSOLIDATED-OWNER-APPROVAL.md` (2026-10-29); rules 1.10 and 4.8 in `docs/product-decision-rules.md`. Local commits are authorised; **no push, pull request, deployment, Hostinger or production change is authorised.**

**Baseline:** research package committed as `9715f6b` on top of `0c2ffe9`. Protected-path gate: `node scripts/ui-protected-paths.mjs` (QA-08), base `0c2ffe9`.

## Milestone order used

Doc 18's dependency order is followed (the prompt's list is the same ten areas in a different order): UI-0 tokens, UI-1 brand, UI-2 shared components, UI-3 header/footer/menu, UI-4 homepage/All Tools/404, UI-5 calculators and Time Tools, UI-6 Developer Tools/labs/flashcards, UI-7 Image and PDF, UI-8 articles and information pages, UI-9 integration.

## Verdict key

GREEN implemented and verified within the stated local evidence scope. AMBER implemented, significant verification gaps remain. RED significant known defect. BLOCKED cannot proceed safely. **Local development complete is not production release accepted.**

## Entries

(Milestone entries are appended below, one per milestone, as each is committed.)

### UI-0 Token foundation, with colour application and self-hosted Inter — GREEN (local scope)

- **Scope.** `base/variables.css` rewritten: semantic tokens (Design C values from doc 05), the older names kept as compatibility aliases pointing at them, type/spacing/radius/shadow/layout/motion scales, breakpoints 640/960/1280 and widths 720/1120/1440 written down. Colour literals across 65 shared and tool stylesheets mapped to tokens (greys to warm neutrals, brand greens to accent or ink, blues to accent, the three status families to the state tokens, form-control borders to the 3:1 `--line-control`, decorative borders to `--line`). Selected and pressed states re-pointed from the success tint to the accent tint (43 rules). Semantic state meaning (success, error, warning) is preserved.
- **Deviation from doc 18.** UI-0 was planned as "no visible change". Because every legacy colour was already a token or a literal, the palette was applied here, so UI-0 and the colour part of UI-1 are one commit. Header, hero art and footer layout are unchanged until their milestones.
- **Requirements.** BR-01, BR-09 (colour part), BR-04 (font part), QA-03 (baseline), QA-08 (gate script). Font condition (owner item 2/BR-04.3): Inter, SIL OFL 1.1 (`assets/fonts/OFL.txt`, no Reserved Font Name), subset made with fontTools (optical size pinned at 14, weights 400 to 700, Basic Latin, Latin-1, punctuation, euro, ₹ U+20B9), **27,136 bytes** against the 70 KB budget, rupee glyph present in the file; metric-matched `Inter Fallback`. All `fonts.googleapis.com` links removed from 9 templates, two data files and `base.njk` (the standalone 404 page keeps its own until UI-4). The `fonts` flag in the data files is now inert. Font tool: `pip install brotli` once, outside the repository (a build-time tool, not a project dependency).
- **Files.** `assets/css/**` (65 files), `assets/fonts/`, 9 `src/*.njk`, `src/_data/{toolStyles,articleStyles}.json`, `src/_includes/layouts/base.njk`, `assets/js/data/tools.js` (theme colour only), `assets/js/pages/categories.js` (one inline colour to a token), `scripts/ui-protected-paths.mjs`, tests `design-tokens`, `button-contrast`, `tool-catalog`.
- **Shared consumers.** Every page. Theme-colour meta is now the page colour `#fafaf9`.
- **Tests.** Unit suite run once in full: 4 failures, all classified and cleared: (1) `build-output` — my README in `assets/fonts` shipped to `dist` (genuine, own defect; README removed, notes live here); (2) `tool-catalog` EMI theme colour — stale expectation, intentionally changed; (3) `time-zone` "fast" timing — environmental/resource (passes alone, 53/53). Re-run after rebuild: design-tokens, button-contrast, tool-catalog, build-output, time-zone all pass. Protected-path gate: 2 changed JS files, both allow-listed (presentation), 0 flagged.
- **Visual review.** Home, EMI, JSON Formatter at 1280 viewed: indigo accent, ink headings, Inter loaded locally, zero third-party font requests (Unsplash photos remain until UI-4), no horizontal overflow. Selected states initially rendered mint (the old success tint doubled as the selected tint): found by eye, fixed by the 43-rule re-point.
- **Performance (CSS gzip, local, `scripts` measure; before = `0c2ffe9` preview build).** Home 24.8 to 26.4 KB, All Tools 17.9 to 19.5, EMI 22.9 to 24.6, JSON 23.5 to 25.2, World Clock 25.9 to 27.5, Article 13.8 to 15.6, Privacy 6.7 to 8.4. Increase 1.6 to 1.8 KB per page (the alias layer), within the +10% budget on the large pages; the Privacy page is +25% in relative terms (+1.7 KB absolute). Plus 27 KB font, minus the Google Fonts CSS request and two preconnects. LCP/CLS not measured.
- **Known gaps.** Component contrast is not yet measured on built components (QA-01.3, due at UI-2 and UI-9). Hero gradient `#eef8f5` and a text-diff "added" highlight keep a green tint by design/until UI-4. Legacy `/loans` page styles remain until their consumers are reviewed.
- **Remaining risk.** Baseline screenshots are expected to differ site-wide; they are reviewed and regenerated per milestone, not blindly.
- **Local commit.** see git log (UI-0).

### UI-1 (logo, favicon) and UI-3 (header, footer, mobile menu) — AMBER (local scope)

- **Scope.** `header.css` rewritten (64 px bar, 36 px SVG mark, desktop links from 960 px, 44 px menu button, backdrop plus panel). `header.js`: inline SVG logo (aria-hidden, link keeps its label); open menu sets `inert` on the page behind, locks scroll (`html.menu-open`), traps Tab, closes on Escape (focus back to the toggle), backdrop click and width of 960 or more. `footer.js`/`footer.css`: dark ink footer; Tools column built from the shared `sections` and `ROUTES`; the four `href="#"` social links removed (owner condition 3: none replaced, no verified URLs supplied). `navigation.css` is a comment-only stub (header.css owns it; removal from page style lists is a UI-9 cleanup).
- **Favicon decision (owner condition 4).** Concepts compared at real 16 and 32 px on light and dark tab strips. The grid mark reads as a generic window at 16 px and its diamond collapses to a speck; the Z monogram stays recognisable. Chosen: Z monogram (ink square, white Z, `#a5b4fc` diamond for kinship with the logo). Files: `favicon.svg`, `assets/icons/favicon-32.png` (`rel="alternate icon"`, so the single `link[rel=icon]` that `notfound.spec.js` requires is kept), `assets/icons/apple-touch-icon.png` (180 px, opaque).
- **Defects found and fixed.** `backdrop-filter` on the header made it the containing block of the fixed backdrop (zero height, backdrop click dead): header is now solid. Legal pages showed list bullets in the header and footer: `ul` reset added.
- **Tests run.** `navigation.spec.js` on `subpath-desktop` and `subpath-mobile`, one worker each: 42 passed, 2 skipped (existing skips), both. An earlier run was killed by the system for low memory; test 37 then showed a 0 ms failure, and was re-run alone and passed, so that was the kill, not a defect. `notfound.spec.js` desktop 8/8. `npm run test:static` (inventory, links, assets, SEO on both builds) passes. Unit: design-tokens, button-contrast, build-output 38/38.
- **Hand-checked (not specs).** Menu at 320 and 390 px: toggle 44x44, background inert, Tab and Shift+Tab contained, Escape and backdrop close, no horizontal overflow. Footer at 1280 and 390 px, no overflow. No screen reader used.
- **Not run.** `accessibility.spec.js`, smoke, DOM and visual baselines; mobile `notfound`. Component contrast on the built header and footer is not yet measured (UI-9).
- **Local commit.** see git log (UI-1/UI-3).

### UI-4 Homepage and All Tools (part) — AMBER (local scope)

- **Scope.** Homepage hero is compact and text-led: the 3D calculator-and-coins illustration (green, gold and blue, off-palette) is removed from the markup (`hero.js`) and hidden-by-removal in `hero.css`; one column, search first, flat page background, accent-tinted eyebrow. Header and footer now share the page container's width and padding (one left edge). All Tools gets the page-scoped section index allowed by rule 4.8: one `nav` in `directory-html.js` (`sectionRail`), a sticky 240 px rail from 960 px and 44 px scrollable chips below; counts are the live tools per section from the same catalog functions the sections use (19, 13, 17, 2, 3 — they match each section's own count badge). The five section cards on the home page stack on a phone (the sideways-scrolling row stays for the eight small category cards) and sit five across from 1100 px. Per-category rainbow icon chips (pink, orange, blue) collapsed to one accent chip. Greenish page gradients replaced by the page surface.
- **Test change (stale by approved design).** `accessibility.spec.js`: the assertion that the home hero offers a WebP/PNG picture is replaced by "compact, text-led, no illustration"; the PNG-fallback test now uses the Articles page hero. The WebP hero files are no longer referenced by the home page (still shipped; removal is a UI-9 clean-up decision).
- **Own defect, caught and fixed.** A scripted CSS edit removed unrelated rules (card typography, the calculator grid) from `categories.css`; found in the screenshot (oversized card titles), file restored from HEAD and the changes re-applied one rule at a time. Diff reviewed afterwards: only icon-chip rules removed.
- **Open decision for the owner (not done).** Doc 18 and the approved design call for no Unsplash photos. The three home article cards still load them. Removing them is not a presentation-only change: the privacy page, its wording test, the PPF and XIRR answer text ("some article pictures from another site") and the article-data tests all state the disclosure. I tried the data change, found that chain, reverted it, and left Unsplash as is. Needs a decision on the wording of the privacy disclosure.
- **Tests run.** `accessibility.spec.js` desktop 32/32; `smoke.spec.js` desktop 138/138; `navigation.spec.js` mobile, All Tools and search-box tests 14 passed, 1 skipped (existing); unit (tokens, contrast, build-output, catalog, directory) 137/137; protected-path gate 0 flagged.
- **Visual review.** Home and All Tools viewed at 1280 and 390 px, no horizontal overflow; home still loads three Unsplash images (see above), All Tools none.
- **Not done in UI-4.** Emoji and glyph icons (an SVG icon sprite is still to do), 404 page (own inline styles and Google Fonts link), section pages and the search-results page, a curated Featured/articles block, mobile `accessibility` and `smoke` projects, visual baselines.
- **Local commit.** see git log (UI-4).

### UI-8 (legal, contact, 404) and UI-9 (integration checkpoint) — AMBER

- **UI-8 done.** Privacy, Terms, Disclaimer and Contact pages: Georgia/Times replaced by the Inter token and the page root sets the face (they had no body font, so text was Times). The standalone 404 page: Google Fonts link and preconnects removed, self-hosted Inter through a base-aware `@font-face`, new mark, tokens for colour, `#2563eb` theme colour to `#fafaf9`. Native checkboxes and radios take `accent-color: var(--accent)` (`base/reset.css`). Text under 12 px (9 px eyebrow, 11 px card text) raised to 12 px.
- **Component contrast, measured on built pages** (computed colours, composited backgrounds, `contrast.mjs` in the scratchpad, 1280 px, 5 pages, 33 selectors): every measured text pair passes, lowest 6.99:1 (muted text on the sunken legal hero); primary text 17.49:1; accent text on page 7.07 to 7.9:1; footer text 11.7 to 17.5:1. Not covered: hover, focus and disabled states, non-text 3:1 borders (set from `--line-control`, 4.4:1 by token), dark mode (none exists), mobile menu panel, error and success states in a live calculator. QA-01.3 is therefore PARTIAL.
- **Test fixes.** `static-checkers.test.mjs`: the CASE MISMATCH injection renamed `hero-calculators.png`, which no live page references any more; it now renames `articles-hero.png`. Full `npm run test:unit` run once: one failure (that one), fixed, re-run alone passes.
- **Not done (honest list).** SVG icon sprite and replacement of the emoji and glyph icons (still emoji on the home section cards, glyph search icons); shared component rework beyond what the token migration gave (buttons, forms, cards keep their existing structure and now carry the new tokens); Time, Developer, Image/PDF, Labs and Flashcards pages were migrated by the token pass and sampled (EMI, JSON, Image, Flashcards, World Clock at 1280), not redesigned; section landing pages and search-results page not re-viewed; curated Featured block; article hero illustrations are still the old green PNGs (assets, need regeneration); `navigation.css` stub and the unused hero WebP files remain; tool-page content width (1180) and the header and footer (1280) still differ; Unsplash (owner decision, see UI-4).
- **Verification not run.** Visual baselines (95; all expected to differ, none reviewed or regenerated), Lighthouse and CLS, mobile projects of `accessibility`, `smoke` and `notfound`, `root-desktop`, tool-specific specs, screen reader (none used). Memory: about 1 GB free, one worker at a time throughout.
- **Traceability (P0 summary).** Tokens, font, header, mobile menu, footer, favicon, All Tools rail and chips, compact home hero, 404, legal typography: implemented and checked as listed. Icons, component library, tool-family layouts, baselines, performance budgets: PARTIAL or NOT RUN. No P0 item is claimed PASS without the evidence listed above.
- **Local commit.** see git log (UI-9).

### Owner decision 2026-10-30: remove the Unsplash article photos — DONE (local)

- **Decision.** The owner approved removing unnecessary Unsplash article photos, using an existing local image where relevant, otherwise none, with the privacy disclosures corrected to match. Scoped to this redesign; no new images, none downloaded.
- **Audit.** 12 `cardImage` entries pointed at `images.unsplash.com` (the three home cards among them). Five articles have a relevant local hero (`/assets/Images/articles/<slug>.png`): their cards now use it. The other seven (including unpublished ones) have `cardImage: null`, which the registry and card renderer already treat as "no image block". Content and routes unchanged. Built output (`dist`, `dist-ghpages`) contains no Unsplash, Google Fonts or other image host; the only external request left in the code is Google Tag Manager, loaded after "Accept analytics". The only other `https://` strings are links to official sources and a default URL inside the vendored jsPDF that this site never calls.
- **Privacy wording.** `src/privacy.njk` "Third-Party Services": states that fonts, pictures and scripts come from this site, that the one third-party service the site can load is Google Analytics and only after "Accept analytics", and that outbound links go to sites with their own policies. Analytics and cookie sections unchanged. The PPF and XIRR answers now say the page "loads its own files from this site; see the privacy page" (the claim about article pictures is gone; they do not claim the site makes no network requests).
- **Tests.** `privacy-wording` (new wording, and no mention of Unsplash), `articles` (card image is local or none; legacy registry shape), `smoke` and ten calculator specs now allow NO external request (they used to tolerate Google Fonts and Unsplash). Stale colour pins from UI-0 updated: eight calculator button checks, `tool-controls` (accent, ink, disabled pair), `world-clock` (ink action link, accent links).
- **Run.** Unit: privacy-wording and articles 20/20. Browser (desktop, one worker): smoke 138/138, sip plus articles 75/75 after the pin fix (the one failure was the stale colour), tool-controls 30/30, the world-clock link test. Other calculator specs got the same one-line edit and were not each re-run.
- **Rulebook.** None changed. Test helper `test-base.mjs` and the Lighthouse script still stub or block Unsplash and Google Fonts hosts; harmless, left as defence.

### UI-1 (icons) and UI-4/UI-8 follow-up: shared SVG icon system — AMBER

- **Scope.** `assets/js/ui/icons.js`: 20 inline SVG icons (24 px grid, 1.75 stroke, `currentColor`, `aria-hidden`), written as constants in the module (no fetch, no sprite file, no user input in any path; about 3 KB of source, loaded only by the pages that draw cards). Replaced the emoji and glyph icons on: the home section and featured cards, the category pages and category-tool cards, calculator and related-calculator cards, the All Tools and section pages, every search box (hero, All Tools, categories, loans, calculators index) and the articles empty state, plus the article card date and read-time marks and the article sidebar category icons. Tool and category data (`icon` strings in `data/tools.js` and `data/categories.js`) is untouched: the renderers map by section and category id; unknown ids get a generic tool icon. Time Tools therefore share one clock icon.
- **Not replaced.** The per-tool glyphs in the data (over 100) are no longer shown on cards but remain in the data; arrows and ticks used as typography inside calculator copy; the footer and the 404 page already use the new mark.
- **Home rhythm.** One vertical spacing for the three home sections (was about 100 px gaps).
- **Tests.** Pin updated: category card "🏠" is now one SVG (navigation spec). Run: full `npm run test:unit` 3623 tests, 0 failed (4 skipped); navigation desktop 42 and mobile 42 passed (2 skipped each); accessibility desktop 32/32; articles desktop 48/48; tool-controls 30/30; smoke 138/138 (before the icon change). A 320 px sweep of 20 representative pages (home, All Tools, listing pages for every section, articles, about, privacy, contact, 404, EMI, GST, World Clock, JSON, Image, Merge PDF, Flashcards, an article): 0 px horizontal overflow, 200 on all, and no request to any host but our own.
- **Visual review.** Home, Time Tools, All Tools search results, Calculators index, Articles listing at 1280 and 390 px.
- **Still not done.** A shared component rework (buttons, forms and cards keep their structure and take tokens); tool-family layouts beyond the token pass (Time, Developer, Image/PDF, Labs, Flashcards were sampled, not redesigned); article hero and card pictures are still the old green PNGs (assets; regenerating them needs a design decision); visual baselines (95) not reviewed; Lighthouse and CLS not measured; mobile projects of `smoke` and `notfound`; `root-desktop` project; screen reader not used.

### UI-2 shared components and tool-family audit (Master Prompt 2 continuation) — AMBER

- **Method.** Each family was viewed in a working state, not only empty: EMI with results and schedule (1280 and 390), Loan Comparison (earlier), JSON Formatter with output and with an invalid input, Countdown Timer running, World Clock list, Merge PDF empty, Image Compressor with a generated 1600x1000 PNG compressed (390), JSON Error-Fixing Lab with a wrong answer, Smart Flashcards deck setup, an article body and end, section listings, search results. Findings below are what those views showed.
- **Defects found and fixed (shared, one place each).** (1) The reset removes list markers, so every "How to use" and "Common uses" list was unmarked: `calculator-base.css` restores disc and decimal markers inside `.calculator-info`. (2) Info body text was 13 px: now 14 px. (3) The native "Choose files" button rendered in the browser's own style on the Image and PDF tools: `::file-selector-button` now matches the secondary button (ink outline, 36 px, token font). (4) FAQ summaries had no minimum height or focus ring: 44 px, ring added. (5) Related-tool cards on Developer and Time pages showed the generic wrench: the card now maps by section id, then category. All five reach every tool family through `calculator-base.css` and `related-calculators.js`; no per-tool CSS was rewritten.
- **Checked and left as is (already coherent after tokens, icons and UI-0).** Primary ink and secondary outline buttons read as enabled, disabled ones read as disabled with an explanatory line (flashcards export, merge before two files); results panels, schedule tables, the running timer display, lab feedback ("Not yet" panel with the validator message), invalid JSON state (red outline) and the world-clock list all use the shared tokens and 44 px targets. Article body: reading width about 780 px (about 75 characters), 16 px text, takeaway panel in the accent tint; article and card images keep their existing green (owner allowed).
- **Observations for Master Prompt 3, not changed (behaviour or content):** on a phone the JSON validator's message appears below the button row, out of the first view after pressing Validate; the yearly repayment table scrolls sideways inside its card on a phone with no visual cue; header and footer use the 1280 px page container while tool pages use a narrower one, so the left edges differ by about 30 px on a wide screen; Time Tools all share one clock icon.
- **Tests.** Browser (desktop, one worker): developer-tools-related, pdf-tools and tool-controls 89/89. Unit (related, calculator-base, tokens, buttons) 790 of 793 passed, 0 failed (3 skipped). Image tool: 390 px page overflow 0, no external request during upload and compress. Protected-path gate: lists `xirr` and `ppf` (the approved privacy sentence), `articles.js` (the approved card-image data) and the allow-listed UI files; no engine code changed.
- **Coverage honesty.** Families received: tokens (all), shared component fixes (all tool pages), icons (cards and listings), and a layout review at working state (the families above). They did not receive per-tool layout redesigns; none was needed after review for the families viewed. Not viewed in a working state: Photos to PDF, Split PDF, PDF Pages, Cron, JSONPath, JWT, Text Diff, List Comparer, Meeting Planner, Shift Planner, Time Zone Converter, the other four calculators' results states, Practice Labs other than the JSON lab.

- **All-pages sweep (addendum).** Every tool and calculator page in the sitemap (54) at 320 px, in a real browser: 0 px horizontal overflow on all, no request to any host but our own, no uncaught script error. Under-40 px controls: the range sliders on Loan Comparison (native control, left), two inline "Load an example" buttons in a sentence (inline-link exception, left), the Flashcards import file input (now 44 px through `input[type=file]`). Mobile project run: pdf-tools and accessibility specs 72/72.

## Master Prompt 3: independent testing and local closure (2026-10-30), verdict AMBER

Re-verified at the start: `main`, HEAD `528d22f`, 10 commits ahead of `origin/main` (local information only), tree clean. Free RAM about 515 MB of 3962 MB, so one worker and one project at a time throughout.

**Independently re-run this session:** `build:all` (110 pages per build); `test:static` (107 live pages, 17 Coming-soon entries not routed); full unit run 3623 tests, 3619 pass, 0 fail, 4 skipped; Playwright `navigation`, `accessibility`, `json-formatter`, `tool-controls` on `subpath-desktop` and `subpath-mobile`, 127 passed and 2 skipped each.

| Ref | Observation or defect | Result |
|---|---|---|
| O1 | Phone: JSON validation result below the action row | FIXED. Status line is scrolled into view only when off-screen after an explicit Validate (never while typing). The live region already announced it and the input already had `aria-invalid`. Regression test fails without the fix and passes with it. |
| O2 | Yearly tables scroll sideways with no cue | FIXED (shared). Edge shadows plus a one-line hint under 640 px; no column or value changed. |
| O3 | Header and footer wider than tool content | FIXED (shared). Tool, listing and article containers now 1248 px content width, left edges match the header and footer at 1280 and 1440. |
| O4 | One clock icon for all Time Tools | FIXED. Per-tool icons (calendar, globe, timer) through `iconForTool`; section and category fallbacks unchanged. |
| D1 | Footer content touched the footer's top edge (padding 0) | FIXED, P2. Regression test added in `navigation.spec.js`. |
| D2 | Breadcrumb, "View all" and directory links 17 to 20 px tall on phones | FIXED. 44 px on coarse pointers and under 760 px; inline links in sentences left alone (WCAG 2.2 inline exception). |
| O5 | Native range sliders | NOT RE-MEASURED. Left as is; browser-drawn control, to be judged against 2.5.8 in a later pass. |
| O6 | Inline "Load an example" controls | NOT A DEFECT in principle (inline exception); not individually re-measured. |
| O7 to O10, O14 | Image, PDF, other Developer, Time and Lab working states; screen reader | DEFERRED, not exercised this session. No screen-reader testing has been done. |
| O12 | Lighthouse and CLS | DEFERRED. Memory too low to run Chrome-based audits safely. |
| O13 | Mobile `smoke` and `notfound`, `root-desktop` | DEFERRED, not run. |

**Visual baselines (95 files).** `visual-desktop` was run in compare mode: 39 of 39 fail. Baselines were last touched by tool-pack commits before the redesign, so the whole set shows the old green design. Only `home` was reviewed (EXPECTED CHANGE, approved Design C; it exposed D1). The other 38 desktop, and all mobile and tablet baselines, are UNVERIFIED. No baseline was updated. Updating needs a reviewed batch per family and project.

No engine, formula, parser, evaluator or URL change. Rules changed: none.

## Master Prompt 3 continuation (2026-10-30): verdict AMBER

Scope: continue the incomplete gates after `8dd0a77`. Nothing pushed, deployed or published. Rules changed: none.

Defects fixed (all presentation, accessibility or stale tests; no engine, formula, parser or URL change):
- Footer CLS 0.49 on five script-rendered pages: `html[data-pending] #footer` hold restored (home CLS 0.4947 to 0.0001).
- Hidden Flashcards import input became 1x44 under the file-input rule: `:not(.lx-sr-only)`.
- World Clock reserved-space over-reserved a row at 3 columns: arithmetic fixed.
- Loan Comparison summary cards clipped at 820 px: two-column grid for 651-1100 px (test added).
- Remaining emoji on categories, loans and loan-comparison replaced by the shared SVG icons.
- 404 had no navigation landmark or search (CT-06.1): labelled nav and search form added (test added).
- Article measure about 90-110 characters: capped at 35rem, about 70 (test added; GL-08.1).
- Home Featured and Latest rows scrolled sideways at 390 px: stacked (DS-02.1, test added); Featured is three across from 641 px so descriptions run about 49 characters, not 16 (DS-03.1).
- 73 font-size declarations of 9-11 px raised to 12 px across 39 stylesheets; a 78-page rendered scan then finds no text under 12 px apart from four superscripts.
- Stale card-image alts (stock-photo descriptions) replaced with chart descriptions; the legacy-registry unit expectation updated to match.
- Stale specs updated: income-tax, percentage, time-tools-enhancements.

Visual baselines: all 98 reviewed at contact-sheet scale (not pixel level) and classified EXPECTED CHANGE (stale pre-redesign or intended Design C changes); updated in reviewed batches by name, never a global regenerate. Desktop 39/39, mobile 39/39, tablet 20/20 stable afterwards. Links and SEO baselines updated after diff review (only counts, placeholders 4 to 0, themeColor, visibleTextChars).

Tests (independently run): unit 3623 tests, 0 fail, 4 skipped (final articles file 18/18 after the alt fix); `test:static` passes on the final build (107 live pages); earlier family runs passed before the 12 px change (calculators 502, Time 258, Developer 225, Image/PDF 134, Labs/Flashcards 131+49, root-desktop 264, mobile smoke/notfound 146, consolidated desktop 369 and mobile 234). After the 12 px change the 98 visual compares, the home/navigation/articles/notfound/loan-comparison specs on desktop and mobile passed.

The single full `subpath-desktop` regression after the 12 px change was stopped by the memory guard at 81 of 1714 tests and was not repeated as one run; it was replaced by bounded batches (see the final closure section below).

Open items: GL-07.1 lowercase "loans" in the EMI breadcrumb (owner decision; capitalising changes BreadcrumbList JSON-LD and conflicts with QA-04.2); Flashcards desktop CLS 0.143 (cause not determined); categories CLS 0.075; `loans` category page keeps the old green hero art (P3); sliders lack aria-valuetext (P3); All Tools shows "Coming soon" category labels; screen reader testing NOT VERIFIED; Lighthouse single-run on 3 pages only; mobile family specs for calculators, Time and Developer tools not run; P0 matrix: doc 22 (29 PASS, 44 PARTIAL, 28 NOT RUN, 1 FAIL of 102).

## Master Prompt 3 final closure (2026-10-30): verdict AMBER

Owner decisions applied: breadcrumb category label "Loans" with the matching BreadcrumbList name only (narrow QA-04.2 exception, recorded in rule 4.6, doc 17 and doc 20; rules changed: that one sentence in 4.6). Nothing pushed, deployed or published.

Corrections (local commits `00b5a10` and the closure commit):
- Breadcrumb label: `displayCategory()` in the central component; visible text and JSON-LD agree; URLs, hierarchy and canonicals unchanged. Unit, DOM baseline and navigation expectations updated.
- URL Parser: the invisible radios now fill their labels. After the tool container widening (8dd0a77) the 1px radio sat at a fractional offset under its label, so `check()` could not reach it; a real click worked. Spec 18/18 on desktop and mobile.
- Flashcards CLS 0.1427 to 0.0001 at 1280 px (also 0.0000-0.0001 at 960, 768, 390, 320): the placeholder was one line and the mounted deck chooser 440-1010 px tall, pushing the explanation sections down. Space is reserved only while the placeholder is the sole child, scoped to Flashcards.
- Link crawl: waits for network idle before counting; baseline holds the settled counts (3 lab pages +1 link each; all existing routes). Stable over three runs and on root-desktop.
- 12 DOM baselines and the SEO record reviewed (icons to SVG, Unsplash and hero image removed, placeholder social links removed, 404 nav and search, All Tools rail with the same 66 links) and updated; only `visibleTextChars` changed in the SEO record.

Measured, no change made: Categories CLS 0.075-0.078 on desktop (script-rendered cards push the "Can't find what you need?" search down 305 px; mobile 0.0000; under the 0.1 threshold, so left as is).

Accessibility (sampled, built pages): nav link 7.63:1; card text 17.49:1 (9.93:1 hover); focus rings 18.22:1 (card), 8.77:1 (footer on dark), 7.9:1 (button); input border 4.8:1, invalid 6.47:1; JSON error text 5.91:1; disabled Copy output 2.01:1 (WCAG-exempt, distinct from enabled 17.49:1); invalid fields on EMI, GST and SIP have aria-invalid and a visible message linked by aria-describedby. Sliders (spacing exception) and inline "Load an example" (inline exception) keep their documented exceptions. Screen readers: NOT VERIFIED.

Regression, run as bounded sequential batches (one worker, RAM checked before each, records in the batch log): all 73 non-visual spec files ran on `subpath-desktop` after the last CSS change (A1 152, A2 201, A3 155, B 150, C1 161, C2 130+, D 135, E 136, F 266+, G1 77, and re-runs below); `visual` is covered by its three projects (desktop 39, mobile 39, tablet 20, all stable). Mobile working-state batches on `subpath-mobile`: calculators 146, Time Tools 104, Developer Tools 145, Flashcards and learning 54, URL Parser 18, navigation 44. Unit 3623 tests, 3619 pass, 0 fail, 4 skipped. `test:static` passes. 320 px sweep: overflow 0 on 20 pages; no external requests.

Open and recorded:
- World Clock has an intermittent failure (a different width or step each full-file run; passes alone most of the time). The same block also failed 1 of 4 runs on the pre-programme commit 0c2ffe9 in an isolated comparison, so it is not shown to be introduced by this programme; the failure rate was not shown to be identical.
- World Clock on mobile: the test "Add puts the city on the board ..." fails (scrollY moves 19-20 px because the search hint shrinks from two lines to one). It fails identically on 0c2ffe9, so it is pre-existing and was not fixed.
- Not run: TX-04 (stopwatch CLS, World Clock node count), IX-06 (reduced motion), IX-08, focus order on the All Tools rail, full all-pages JSON-LD diff, Safari and real Android, Lighthouse beyond 3 pages.
- Visual baselines still carry the lowercase breadcrumb pixels inside the comparison tolerance; they were not regenerated for a one-letter change.
- GL-07.1 closed by the owner decision.

Incident: while removing a temporary comparison worktree, `git worktree remove --force` followed a junction I had created and emptied the real `node_modules`. It was restored with `npm ci` from the unchanged lockfile (327 packages; Playwright 1.63.0, Eleventy 3.1.6, Lighthouse 12.8.2; `package.json` and `package-lock.json` unchanged) and the suites above were run after the restore. A second comparison used a nested worktree with no junction.

## Final quality closure (2026-10-31): verdict AMBER

Scope: the autonomous closure prompt. Nothing was pushed, deployed or published.

Fixed (verified defects against the spec, GL-01, GL-04, DS-08, IX-08):
- Header: 56 px on phones (not sticky) and 64 px from 960 px, where `#header` is now sticky. Before, the bar was 64 px everywhere and did not stay at the top, although the All Tools rail assumed it did. `--header-offset` follows the breakpoint, so the mobile panel and `scroll-padding-top` follow it too.
- All Tools: a rail link moves focus to its section heading. A no-match search lists the section links (taken from the page's own section index) next to Clear search.
- Shared calculator error shows a drawn bold lead word ("Check this:"); the element text is unchanged.
- New tests: navigation.spec (header height and sticky, rail focus, no-match links) and emi.spec (error feedback). Mobile and tablet baselines (59) were re-reviewed at contact-sheet scale and updated for the 8 px header change; desktop baselines are unchanged (39/39).

Verification after these changes (bounded, one worker): navigation + emi 67 passed on desktop and mobile; accessibility, dom-baseline, seo-baseline and links 50 passed on desktop; visual 39/39 desktop, 39/39 mobile, 20/20 tablet.

World Clock flake (classification: resource-sensitive timing in test synchronisation, pre-existing). The "readable rows, Clear search" block fails intermittently at one narrow width with "Element is not attached" or a 45 s `scrollIntoViewIfNeeded` timeout in `expectReadableRows`. It passed alone on the base commit 3 of 4 times and failed identically on 0c2ffe9 under load; the page was stable when probed with and without the fake clock. No test change was made: the safe fix (wait for the explore list's `data-pending` to clear) was not established by a passing repeat run, and the run budget does not allow repeats. Affected: that block at 320, 360 and 390. Not marked PASS. Separately, "Add puts the city on the board" (mobile) fails because the search hint changes from 2 lines to 1 and scrollY moves about 20 px; also pre-existing on 0c2ffe9.

Matrix after ten criteria were re-evidenced: 34 PASS, 55 PARTIAL, 13 NOT RUN, 0 FAIL (102). Still NOT RUN: BR-03.1/2/3 (favicon), BR-09.2, GL-08.2, GL-09.1, DS-05.1, TX-02.3, TX-04.1, TX-04.2, TX-08.1, IX-01.2, IX-02.2. TX-02.3 found no jump link on EMI at 390; that needs a spec decision, not a guess.
