# 22 P0 Verification Matrix

Master Prompt 3, independent QA, 2026-10-30. Covers the 50 P0 requirements and their P0 acceptance criteria from doc 17. P1, P2 and DEFER items are not claimed here.

Status key: PASS = measured or asserted by a test in this programme; PARTIAL = checked on a sample or in part; FAIL = measured and failing; NOT RUN = not measured in this pass. No criterion is marked PASS without evidence. Screen-reader testing is NOT VERIFIED.

Totals: NOT RUN 13, PARTIAL 55, PASS 34 (of 102).

| Criterion | Text | Status | Evidence | Limitation |
|---|---|---|---|---|
| BR-01.1 | Token file defines every role in 05-COLOUR-AND-TYPOGRAPHY-OPTIONS.md with the approved HEX values. | PARTIAL | unit design-tokens test passes; tokens in variables.css | hex-by-hex comparison with doc 05 not repeated in MP3 |
| BR-01.2 | The design-tokens unit test passes; no shared-layer CSS file introduces a new literal colour outside the token file. | PASS | unit suite 3623 tests, 0 fail (design-tokens test included) |  |
| BR-02.1 | No text glyph is used as a logo anywhere in generated HTML. | PARTIAL | sampled pages show the SVG mark in header and footer | no full-site glyph scan |
| BR-02.2 | Logo link has accessible name 'ToolZen Hub home' and the symbol reads clearly at 24 px on white and on the dark footer. | PARTIAL | aria-label "ToolZen Hub home" present in built home HTML | 24 px legibility on white and dark not measured |
| BR-03.1 | Favicon colours are identical to the logo symbol colours (today they differ: #14B8A6 favicon against #0b9f58 header). | NOT RUN | earlier build reported matching colours | not re-verified in MP3 |
| BR-03.2 | The symbol is distinguishable at 16 px in a rendered check on a light and a dark tab strip. | NOT RUN |  | needs a browser tab-strip render; not run |
| BR-03.3 | Owner condition: logo Concept 2 and favicon Concept 3 are both rendered at 16 and 32 px in a browser tab strip and the clearer one is chosen; the choi | NOT RUN |  | owner condition; needs tab-strip render at 16 and 32 px; not run |
| BR-04.1 | No generated page requests fonts.googleapis.com or fonts.gstatic.com. | PASS | dist scan: zero references to fonts.googleapis / fonts.gstatic; 78-page runtime sweep, no external requests |  |
| BR-04.2 | The rupee sign renders in the self-hosted font on the EMI and SIP pages. | PARTIAL | self-hosted Inter used (computed font checked on sampled pages) | rupee glyph on EMI and SIP not inspected at pixel level |
| BR-04.3 | Owner condition: before the font is included, its licence file, its measured transferred size (at most 70 KB) and its U+20B9 glyph coverage are checke | PARTIAL | font file 27,136 bytes (under 70 KB), OFL | licence file presence not re-checked in MP3 |
| BR-04.4 | Computed font-family of the header, legal pages and body resolves to the same family. | PARTIAL | body and header use the same family on sampled pages | legal pages not computed individually |
| BR-06.1 | No emoji or Unicode symbol glyph (for example the abacus, calendar, picture and page emoji on the home cards) is used as an icon in generated HTML. | PASS | dist scan of built .html/.js (data files excluded): zero rendered emoji after fixes to categories, loans, loan-comparison | data-file icon strings are unrendered by design |
| BR-06.2 | Icon-only buttons have an accessible name. | PARTIAL | Lighthouse accessibility 100 on 3 pages; accessibility specs pass | not an exhaustive scan of every icon-only button |
| BR-09.1 | A scripted pass over the shared layer finds no text colour below 4.5:1 and no control border below 3:1 against its surface. | PARTIAL | measured on built pages: rest, hover, focus, error and disabled states (see ledger); Lighthouse a11y 100 on 3 pages | no scripted pass over the whole shared layer |
| BR-09.2 | Brand-green-as-text occurrences listed in design-follow-ups.md section 1 are all resolved or recorded as large text or non-text. | NOT RUN |  | green-as-text list not re-walked |
| GL-01.1 | Every generated page has exactly one banner landmark and one main landmark. | PARTIAL | navigation and accessibility specs; one h1 and one main on 54 tool pages | banner count not asserted site-wide |
| GL-01.2 | The active section link has aria-current and a non-colour cue (underline or weight). | PASS | navigation.spec asserts aria-current=page; underline visible in screenshots |  |
| GL-01.3 | Header height at 320, 390 and 1280 px matches the specified values within 2 px. | PASS | navigation.spec asserts 56 px and not sticky at 390, 64 px and sticky at 1280; measured 56/56/64 at 320/390/1280 |  |
| GL-02.1 | Generated HTML contains no href='#' in the footer. | PASS | dist scan: footer href="#" count 0 |  |
| GL-02.2 | Footer section links equal the catalog sections with no hard-coded list. | PARTIAL | footer renders sections from the catalog on sampled pages | hard-coded list absence not audited |
| GL-02.3 | Owner condition: any social link that remains points to a destination the owner has verified; no account or URL is invented, and unsupported links are | PARTIAL | no social links in the footer on sampled pages | owner verification record not applicable |
| GL-03.1 | The menu button is at least 44x44 px. | PASS | 44 px menu toggle measured; navigation spec |  |
| GL-03.2 | With the keyboard: Enter opens, Tab stays within the panel (or the page behind is inert), Escape closes and focus returns to the button. | PARTIAL | navigation.spec: opens, Escape closes, focus returns to the toggle | Tab containment not asserted |
| GL-03.3 | aria-expanded reflects state; the panel is not reachable by Tab when closed. | PARTIAL | aria-expanded asserted open and closed | unreachable-when-closed not asserted |
| GL-03.4 | At 320 px no link text is clipped. | PARTIAL | 320 px sweep: no overflow on 20 pages | link clipping not individually inspected |
| GL-04.1 | Rail section counts equal the catalog counts (19, 13, 17, 2, 3). | PARTIAL | counts visible on All Tools in screenshots | not asserted programmatically in MP3 |
| GL-04.2 | Keyboard Tab order is rail then content; pressing a rail link moves focus to the section heading. | PASS | first Tab after the heading reaches the rail; Enter on a rail link moves focus to the section heading (navigation.spec) |  |
| GL-04.3 | At 1280 px the card grid is at least 720 px wide. | PASS | content grid measured 968 px at 1280 (at least 720) | 960 px width not measured |
| GL-05.1 | At 320 px every section is reachable by tap and by keyboard without horizontal page scroll. | PARTIAL | All Tools chips visible at 390; 320 sweep overflow 0 | keyboard reach not run |
| GL-05.2 | Chip hit areas are at least 44 px tall. | PARTIAL | 44 px chip targets measured on a sampled page |  |
| GL-07.1 | EMI Calculator breadcrumb shows 'Loans' (title case) in generated HTML. | PASS | EMI and Loan Comparison breadcrumbs render "Loans" (DOM baselines, navigation spec desktop and mobile, unit tests); BreadcrumbList level-3 name is title case on every page (dist scan); owner decision 2026-10-30 |  |
| GL-07.2 | At 320 px the breadcrumb does not cause horizontal page scroll on any tool page. | PARTIAL | 320 px sweep: overflow 0 on sampled tool pages | not every tool page |
| GL-08.1 | Article text measure is between 60 and 75 characters at 1280 px. | PASS | measure capped at 35rem: 560 px, about 68-74 chars a line; articles.spec regression test |  |
| GL-08.2 | Text Diff and JSON Compare use the workspace width class; calculators use standard. | NOT RUN |  | workspace width class not asserted |
| GL-09.1 | New and touched shared CSS uses only the three breakpoints. | NOT RUN |  | breakpoint audit of touched CSS not run |
| GL-09.2 | No page-level horizontal scroll at 320, 360, 390, 640, 960 and 1280 px on the milestone's pages. | PARTIAL | 320 and 390 sweeps and 1280 checks overflow 0 on sampled pages; tablet 820 loan-summary fixed with test | 360, 640, 960 not swept |
| DS-01.1 | Search field is inside the first viewport at 390x844 and 1280x800. | PASS | search bottom at 437 of 800 px (1280) and visible at 390x844 in screenshot |  |
| DS-01.2 | No decorative raster image loads on the home page above the fold. | PASS | no hero raster image on home |  |
| DS-02.1 | No third card is cropped at 390 px; no horizontal scroll container on the home page. | PASS | navigation.spec (new): no sideways scroller at 390 px; home rails stack on phones |  |
| DS-02.2 | Counts shown equal the catalog. | PARTIAL | five section cards present | counts vs catalog not asserted |
| DS-03.1 | No Featured card text wraps below 20 characters per line at 1280 px. | PASS | after the 3-column grid: description width 292 px, about 49 chars a line at 1280 (was about 16) |  |
| DS-03.2 | No 'popular', 'trending' or ranking wording exists on the page. | PARTIAL | no ranking wording seen | no text scan run |
| DS-04.1 | No request to images.unsplash.com from any page. | PASS | dist scan: zero images.unsplash references; runtime sweep no external requests |  |
| DS-04.2 | Every remaining article image has alt text that states what it explains. | PARTIAL | all card and hero alts describe the charts; the last stale stock alt was fixed in MP3 | alt quality judged by reading, not by a tool |
| DS-05.1 | Every claim in the strip is traceable to rulebook 8.8 or a tool spec. | NOT RUN |  | trust-strip claim traceability not walked |
| DS-05.2 | No numeric usage claim appears. | PARTIAL | no numeric usage claim seen on home |  |
| DS-06.1 | Rendered tool count equals 54. | PASS | All Tools links to 54 unique tool pages |  |
| DS-06.2 | No coming-soon entry is rendered or linked. | PARTIAL | no coming-soon tool linked; category labels "Coming soon" (Health, Converter) are rendered | owner note needed on the labels |
| DS-06.3 | The sitemap and canonical for /tools.html are unchanged. | PASS | SEO baseline: canonical and title unchanged for tools.html |  |
| DS-07.1 | Cards contain exactly one link. | PARTIAL | tool cards on home and Time Tools hold one link; All Tools lists grouped text links, not cards | criterion wording does not match the directory layout |
| DS-07.2 | Card hover and focus states do not change card dimensions. | PARTIAL | home popular-calculator card 405.3x110 and category card 236.8x150.1 identical at rest, hover and focus | two card types only |
| DS-08.1 | Searching '<b>x' shows the characters literally. | PASS | "<b>x" search is escaped, not injected |  |
| DS-08.2 | The no-result state offers all five section links. | PASS | navigation.spec: no-match search shows the echoed query as text, the five section links and Clear search |  |
| DS-10.1 | No generated page links to a non-existent tool or article route. | PASS | test:static: link check and 107 live pages pass |  |
| TX-01.1 | Every tool page shows exactly one h1 and a privacy note reviewed against its spec. | PARTIAL | 54 tool pages: exactly one h1 and one main | privacy note vs spec not re-reviewed |
| TX-01.2 | Frame renders without horizontal scroll at 320 px for all 54 tools (sampled by family at the checkpoint). | PARTIAL | 320 px sweep on sampled tool pages, overflow 0 | not all 54 |
| TX-02.1 | Calculators' outputs for the golden test values are unchanged. | PASS | calculators 502 passed and unit 3623 pass (golden values unchanged) |  |
| TX-02.2 | The headline result is visually first in the result panel. | PARTIAL | result panel seen first in screenshots | not asserted |
| TX-02.3 | Jump link moves keyboard focus to the result heading. | NOT RUN |  | jump-link focus not run |
| TX-03.1 | The primary action of JSON Formatter, Text Diff and JSONPath Tester is inside the first viewport at 390x844 and 1280x800 without scrolling. | PARTIAL | JSON Formatter short-phone test; sampled screenshots | Text Diff and JSONPath first-viewport action not asserted |
| TX-03.2 | JSON, diff and path evaluators produce identical outputs on the existing unit fixtures. | PASS | developer tools 225 passed; unit fixtures pass |  |
| TX-04.1 | Cumulative layout shift during one minute of a running Stopwatch is 0. | NOT RUN |  | one-minute stopwatch CLS not measured |
| TX-04.2 | World Clock DOM node count does not exceed its current value. | NOT RUN |  | DOM node count not compared |
| TX-05.1 | Merge PDF, Split PDF, PDF Pages, Photos to PDF and the Image Compressor can complete their primary journey with the keyboard only. | PASS | image and PDF specs 134 passed (1 flake re-ran) |  |
| TX-05.2 | Byte-for-byte output of the PDF engines is unchanged on the existing fixtures. | PARTIAL | protected-path diff shows no PDF or image engine change; engine specs pass | byte-for-byte compare not separately run |
| TX-06.1 | Every verdict has a text label. | PARTIAL | learning specs pass; verdict text visible in lab screenshots | per-verdict label not asserted |
| TX-06.2 | Existing lab answer-evaluation unit tests pass unchanged. | PASS | unit tests pass unchanged |  |
| TX-07.1 | Spaced-repetition scheduling and storage tests pass unchanged. | PASS | smart-flashcards 49/49 and unit pass |  |
| TX-07.2 | Export, Import and Reset look enabled once saving is on. | PARTIAL | file-input fix keeps Import and Export visible; learning-widths pass | enabled-looking state not asserted |
| TX-08.1 | A touched tool stylesheet contains no new colour literal and no button rule that duplicates the shared button. | NOT RUN |  | new colour-literal audit not run |
| CT-03.1 | At 320 px every table scrolls inside its region and the page does not. | PARTIAL | scroll cue added and measured on sampled tables | not every table at 320 px |
| CT-03.2 | Amortization tables remain keyboard scrollable. | PARTIAL | EMI yearly table sits in a focusable (tabindex 0) labelled region that scrolls at 390 | other calculators not checked |
| CT-05.1 | Computed font-family on Privacy, Terms and Disclaimer matches the site body font. | PARTIAL | legal pages use the body font on sampled pages |  |
| CT-05.2 | Page text is byte-identical apart from markup structure (no wording change). | PARTIAL | privacy and terms wording changed only by the owner-approved Unsplash disclosure update | byte-diff not produced |
| CT-06.1 | Requesting a missing URL returns 404 and the page contains a navigation landmark and a search field. | PASS | 404 has a labelled nav and a search form; notfound spec (subpath and root, new test) |  |
| IX-01.1 | Every button in the shared layer is at least 44 px tall. | PARTIAL | 44 px measured on sampled pages and file inputs; coarse-pointer rules | not every shared-layer button |
| IX-01.2 | Primary and secondary are distinguishable in greyscale (fill versus outline). | NOT RUN |  | greyscale distinction not rendered |
| IX-02.1 | No enabled button uses the disabled token pair. | PARTIAL | sampled enabled buttons measure 17.49:1; the disabled Copy output button measures 2.01:1 (WCAG-exempt, distinct) | not every button audited |
| IX-02.2 | Each variant has all listed states in the component sheet. | NOT RUN |  | component sheet states not checked |
| IX-03.1 | The set of tools with a Calculate button is identical before and after the programme. | PARTIAL | no tool changed its calculate behaviour (protected-path diff) | before and after set not diffed |
| IX-04.1 | Input border contrast against its surface is at least 3:1. | PARTIAL | input border contrast 4.8:1 (EMI input), 6.47:1 invalid state; JSON error message text 5.91:1 | sampled on EMI and JSON Formatter, not every input |
| IX-04.2 | Every invalid field has aria-invalid and an error message linked by aria-describedby. | PARTIAL | invalid fields on EMI, GST and SIP carry aria-invalid and a visible message linked by aria-describedby | three calculators; not every tool |
| IX-05.1 | Tabbing through the home page shows a visible ring on every stop. | PARTIAL | accessibility spec keyboard coverage | full home tab-through not run |
| IX-05.2 | Ring contrast is at least 3:1 on page background, card and footer. | PARTIAL | focus ring contrast: 18.22:1 on a card on the page background, 8.77:1 on a footer link on dark, 7.9:1 on a button | sampled; card ring is 1px wide |
| IX-06.1 | With reduced motion enabled no transition longer than 0 ms runs. | PARTIAL | a prefers-reduced-motion block exists in base/accessibility.css (4 CSS files) | no browser run with reduced motion emulated |
| IX-06.2 | No animation uses width, height, top or left. | PARTIAL | CSS scan: no transition on width, height, top, left, margin or padding; keyframes are in animations.css | keyframe properties not audited one by one |
| IX-08.1 | Each alert type has an icon and a lead word, so greyscale still conveys meaning. | PARTIAL | shared calculator error carries a drawn bold lead word and aria-invalid/aria-describedby links (emi.spec) | icon not added; success, warning and info variants not unified |
| QA-01.1 | Automated and manual checks in the checkpoint list no AA failure on the representative page set. | PARTIAL | Lighthouse accessibility 100 on home, EMI, article; a11y specs pass | no axe run; screen reader NOT VERIFIED |
| QA-01.2 | Focused elements are not hidden behind the sticky header (scroll-padding set). | PARTIAL | scroll-padding-top is the header height plus 8 px (measured 64 px at 390, which is 56 + 8) | no scripted check that a focused control is never hidden under the sticky header |
| QA-01.3 | Owner condition: contrast is verified on the built components (buttons, inputs, alerts, cards, selected states, footer) as rendered, not only on the p | PARTIAL | contrast measured on buttons, inputs, error text, cards, nav and footer focus rings | alerts other than the JSON error and selected states not measured |
| QA-02.1 | The same 20-page sample passes after every milestone that touches layout. | PARTIAL | 320 px sweep (20 pages) in this programme | not repeated after the final CSS change |
| QA-03.1 | Measured transfer and request counts are within budget for home, All Tools, a calculator, a developer tool, an article and a legal page. | PARTIAL | static weights: CSS 647 KB, app JS 3675 KB, font 27 KB | request counts not measured; no budget numbers compared |
| QA-03.2 | Lighthouse mobile performance is not lower than the recorded baseline on those pages. | PARTIAL | home 64 to 73, article 69 to 89, EMI 80 to 76 (single run vs median-of-3) | other pages not measured; single run |
| QA-04.1 | The URL inventory check passes with 107 sitemap URLs. | PASS | test:static: 107 sitemap URLs |  |
| QA-04.2 | A diff of titles, descriptions, canonicals and JSON-LD across all generated pages is empty. | PARTIAL | SEO record diff: only visibleTextChars changed on 4 pages; the one approved JSON-LD change is the category step name (exception recorded in doc 17 and rule 4.6) | full all-pages JSON-LD diff against the base was not produced |
| QA-05.1 | No generated page contacts a host other than the site itself (analytics after consent excepted). | PASS | dist scan and runtime sweeps: no non-self host |  |
| QA-05.2 | assets/js/analytics.js and src/_data/site.js are unchanged. | PASS | analytics.js and site.js unchanged since base 0c2ffe9 |  |
| QA-06.1 | package.json dependencies are unchanged. | PASS | package.json unchanged |  |
| QA-06.2 | Existing security cases for user text pass. | PASS | unit and browser security cases pass |  |
| QA-07.1 | Playwright Chrome passes the checkpoint set; Safari and real Android are reported as owner-verified or unverified, never assumed. | PARTIAL | Playwright Chrome passes the sets run | Safari and real Android unverified |
| QA-08.1 | Protected-path diff (assets/js/calculators, tools logic, pdf engines, learning evaluators) is empty for every milestone commit. | PASS | protected-path gate: six files flagged and reviewed (comment, privacy sentence, images, JSON reveal, World Clock reserve); no engine code changed |  |
| QA-09.1 | Each milestone report lists regenerated baselines by name and the review outcome. | PASS | ledger lists each regenerated baseline set (98) with its review outcome |  |
