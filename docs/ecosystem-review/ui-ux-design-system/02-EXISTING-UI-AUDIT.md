# 02 Existing UI audit

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29.

## Method and limits

- **What was inspected.** 20 live-preview pages (`https://salar500.github.io/Toolzenhub/`, build `0c2ffe9`) with the system Chrome, one page at a time: Home, All Tools, Calculators landing, EMI, SIP, Time Tools landing, World Clock, Stopwatch, Developer Tools landing, JSON Formatter, Text Diff, Image Compressor and Resizer, Merge PDF, Smart Flashcards, JSONPath Challenge Lab, Articles, one article, About, Privacy and a missing URL (404). Screenshots at 1280x800 and 390x844 (viewport, plus full page for four); metrics at 1280, 390 and 320 px. Source files were read for the header, tokens, buttons and forms.
- **Interactions exercised.** Mobile menu open, Escape, focus return; typing in the home search. Nothing else was clicked.
- **Not done.** No screen reader, no real device, no Safari or WebKit, no Lighthouse run. Largest Contentful Paint and Cumulative Layout Shift were **not measured** (the in-page timing entries were not available, so those columns are empty rather than zero). Core Web Vitals are therefore NOT VERIFIED. The 95 stored visual baselines were not opened.
- **Labels.** VERIFIED = seen or measured. PREFERENCE = a design judgement, not a defect. A finding without a label is both verified and described by its evidence.
- Some page families (the other 40 non-calculator tools, the other 33 articles, the other category pages) were **sampled, not inspected one by one**. Findings about them are limited to what the shared CSS and templates imply and are marked INFERRED.

## Measured results (live preview, VERIFIED)

| Check | Result |
| --- | --- |
| Horizontal page scroll at 320, 390 and 1280 px | none on all 20 pages |
| h1 count | exactly one on every page |
| Heading level skips | one on Time Tools landing and Developer Tools landing (an h1 to h3 jump); none elsewhere |
| Stylesheet requests | Home 24, All Tools 16, tool pages 23, articles 22 to 25, legal pages 5, 404 page 1 |
| Third-party hosts | `fonts.googleapis.com` and `fonts.gstatic.com` on 18 of 20 pages; `images.unsplash.com` additionally on Home and Articles; none on Privacy and the Calculators landing |
| Images on first load | Home 4 images, 338 KB (response headers); Articles 6 images, 296 KB |
| Interactive elements shorter than 44 px (buttons, links, inputs, summaries) | 19 to 84 per page (All Tools 83 to 84, Articles 47 to 48). These include inline text links, which WCAG 2.2 AA (target size 24 px) treats differently from the rulebook's 44 px control rule, so the number is a screening figure, not a failure count |
| DOM size | 41 (404) to 519 (SIP) nodes; World Clock 3,370 |
| Landmarks | one `main` and one `footer` on every page; `header` element absent on Calculators landing and Privacy (a banner landmark may still be provided another way: NOT VERIFIED); `nav` count 3 to 4 |
| Font families used | Inter, Georgia (header and nav), monospace stack on JSON tools; Privacy resolves to Times New Roman and Arial |

## Verified interaction behaviour

| Behaviour | Result |
| --- | --- |
| Mobile menu toggle | `<button aria-label="Open navigation menu" aria-expanded="false" aria-controls="mobile-navigation">`, **40 x 40 px**; opens a panel of four 54 to 55 px rows; no backdrop; Escape closes; focus returns to the button; **Tab leaves the open menu into the page behind** (no containment); the body is not scroll-locked |
| Home search on 390 px | typing `json` shows a clear button and a focus ring; no result list was visible in the first viewport (where results appear is NOT VERIFIED); the field exposes no `role`, `aria-autocomplete`, `aria-controls` or `aria-expanded` |

## Findings

IDs are local to this document and are cited by the other documents. "Evidence" names where it was seen.

| ID | Finding | Evidence | Kind |
| --- | --- | --- | --- |
| F-01 | The header brand and navigation use Georgia serif while every page body uses Inter, so the two do not look like one system | `components/header.css` lines 47 to 171; screenshots of every page | VERIFIED |
| F-02 | Privacy, Terms and Disclaimer load five stylesheets, no reset and no font, and render in the browser's default serif (Times New Roman) while their header is styled | `privacy.html` head; screenshot `privacy-d`; computed font families | VERIFIED |
| F-03 | The header logo is the text glyph `▦` in a green circle; the favicon is a white "T" on `#14B8A6`; the header green is `#0b9f58`. Three different marks and two different greens | header markup; `favicon.svg`; `variables.css` | VERIFIED |
| F-04 | Brand green `#0b9f58` is 3.43:1 on white and is used for small text in the header, links, eyebrows, breadcrumbs and footer | computed ratio; `docs/design-follow-ups.md` §1 | VERIFIED (ratio computed this session) |
| F-05 | Form control borders are `#d0d5dd`, 1.47:1 on white, below the 3:1 non-text contrast that rulebook 7.3 requires for outlines | `calculators/calculator-form.css` line 93; computed ratio | VERIFIED (interpretation: the border is the only boundary of a white field on a grey page) |
| F-06 | The home hero is a 3D calculator-and-coins illustration with large empty areas above and below at 1280 px. Rulebook 6.4 lists "floating coins" and generic art as to be avoided | `home-d-full` screenshot; `assets/Images/hero-calculators.webp` 190 KB | VERIFIED (rule) / PREFERENCE (emptiness) |
| F-07 | "Explore Tools" shows five cards in a three-column grid, leaving an empty slot on the second row. On a phone it is a horizontal scroller whose third card is cropped, hiding two sections from a first glance | `home-d-full`, `home-m` screenshots | VERIFIED |
| F-08 | The home section cards use emoji (abacus, calendar, picture, page) as icons and the Featured cards use text glyphs, which vary by operating system | screenshot; `tools.js` icon values | VERIFIED |
| F-09 | Home and Articles cards use six hotlinked Unsplash stock photographs (a house model, coins and a plant) that do not explain the topic. The Privacy page discloses Unsplash but contains no mention of fonts, so the Google Fonts request on 18 of the 20 sampled pages is undisclosed | `docs/design-follow-ups.md` §2; `privacy.html` text search | VERIFIED |
| F-10 | The four footer social links point to `href="#"` | generated HTML (4 on Home and on a tool page) | VERIFIED |
| F-11 | Calculator breadcrumbs show a lowercase category ("loans") | EMI screenshot | VERIFIED |
| F-12 | The breadcrumb sits immediately under the header with about 12 px of space on tool pages, while the title block below has a large gap | EMI, JSON Formatter, Flashcards screenshots | PREFERENCE |
| F-13 | Tool pages load 23 stylesheet requests; the design is split into 109 files | metrics | VERIFIED |
| F-14 | On JSON Formatter at 1280x800 the Format, Minify and Validate buttons sit at the bottom edge of the first viewport; on 390x844 the input textarea is about 375 px tall and Format begins at the bottom edge | `json-formatter-d`, `menu-open-m` screenshots | VERIFIED |
| F-15 | The article hero diagram is a large white card that is mostly empty around one small bar graphic | `article-d` screenshot | VERIFIED (emptiness) / PREFERENCE |
| F-16 | The 404 page has one stylesheet and no navigation, search or section links | metrics (`nav` 0); screenshot | VERIFIED |
| F-17 | The token file keeps an unused blue scale and an empty `themes/light.css`; 1,436 hex literals sit outside the tokens, and radius, breakpoint and card styles each have several variants | CSS scan | VERIFIED |
| F-18 | The shared tool frame repeats a "100% Free to Use" badge with a one-line privacy note. The privacy note is specific and good; the badge text is generic | tool screenshots | PREFERENCE |
| F-20 | The mobile menu button is 40 x 40 px (rulebook 7.2 asks for 44 px controls) and focus is not contained while the menu is open | live check at 390x844 | VERIFIED |
| F-19 | Heading jumps from h1 to h3 on the Time Tools and Developer Tools landing pages | metrics | VERIFIED |

## Page-family audit

| Family | Strengths | Weaknesses (finding IDs) | Mobile (390 and 320 px) | Accessibility / performance notes |
| --- | --- | --- | --- | --- |
| A. Home | Clear promise, a working search field, honest "Featured" and counts copy; no overflow | F-06, F-07, F-08, F-09 | Hero legible; section cards cropped; large empty bands between sections | One h1; images 338 KB; two third-party hosts |
| B. All Tools | One page for every tool; five labelled sections with counts; search at the top | Long single column of text links with no section jump; 83 small targets (link rows); no grid of cards like Home | Works at 320 px without overflow | 396 nodes, 16 stylesheets |
| C. Section listings (Calculators, categories, Time, Developer, Image, PDF) | Consistent hero and card lists | F-19; the Calculators landing has no `header` element (banner NOT VERIFIED); categories and landing use different card styles from Home (INFERRED from CSS file names `categories.css`, `cards.css`, `loans-cards.css`) | OK at 320 | |
| D. Calculators (EMI, SIP) | Strong frame (eyebrow, h1, description, privacy chip); mode selector with a visible selected state; linked hints | F-04, F-05, F-11, F-12 | Single column; no overflow | 460 to 519 nodes; 23 stylesheets |
| E. Time Tools (World Clock, Stopwatch) | Clean controls | World Clock is 3,370 DOM nodes; ticking layout shift not measured | OK | NOT VERIFIED: live-clock layout stability |
| F. Developer Tools (JSON Formatter, Text Diff) | Two-pane editor at 1280; monospace stack; specific privacy copy | F-14; very tall empty output pane before use | Stacked; actions at the fold | Wide tools use the same container as calculators (INFERRED) |
| G. Image tools | Familiar upload-and-adjust flow | Shares the generic frame | OK | 69 KB JS |
| H. PDF tools (Merge PDF) | Explicit actions, honest local-processing note | Same frame; upload affordance not interrogated | OK | |
| I. Smart Flashcards | Clear deck chooser with counts; honest disabled controls (Export, Import, Reset look unavailable only because saving is off) | Long explanatory sentence in the opt-in panel; key name `tz-learn-v1` shown to everyone | OK | |
| J. Practice Labs | Same frame | NOT VERIFIED beyond the first viewport (interaction not exercised) | OK | 70 KB JS |
| K. Articles | Readable measure, clear breadcrumb, tag chips, collapsible-looking table of contents | F-15; stock photographs on cards | OK | 22 to 25 stylesheets |
| L. Informational and legal | Plain, readable text | F-02 | OK | 5 stylesheets, no font |
| M. Error and empty states | The 404 page exists with the right status | F-16; search empty-state wording NOT VERIFIED | OK | |

## Strengths worth keeping

1. A single, recognisable tool frame (eyebrow, one h1, one-line description, specific privacy note).
2. No horizontal scroll on any sampled page down to 320 px.
3. Honest copy: Featured is curated, results are labelled estimates, privacy claims are narrow.
4. Mobile menu mechanics are correct (expanded state, Escape, focus return).
5. Disabled controls look disabled only where they are.
6. Specific, linked field hints and a shared result and field vocabulary (`docs/shared-tool-ux.md`).
7. Static HTML for every page: content and navigation are in the generated markup.

## What is not a defect

Dark mode is absent (not a requirement). Pages have different densities because their jobs differ. The footer's dark band is intentional and passes contrast in the screenshots (footer text contrast was not computed; NOT VERIFIED).
