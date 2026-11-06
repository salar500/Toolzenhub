# Master regression catalogue

Source of truth for inventory: `tests/inventory/url-inventory.json` (generated; `npm run inventory:check`). At HEAD `f5a1df4`: 126 live pages, 66 built calculators and tools (ids in the inventory `summary`), 36 published articles, 1 Coming Soon tool, 2 Coming Soon articles. Coming Soon items have no route and must return 404 (asserted by `smoke.spec.js` and the inventory).

"Executed" evidence below is from the QC-1 to QC-9 checkpoint (2026-11-02/03, ledger `docs/ecosystem-review/universal-expansion/11-DEVELOPMENT-LEDGER.md`) on the tree that became commits `6b01b85`..`f5a1df4`. Only the build and static layer was re-run on `f5a1df4` itself (see `TEST_EXECUTION_LEDGER.md`).

## Area scenarios and the automated owner of each

| Area | Scenarios | Automated owner |
|---|---|---|
| Homepage, header, footer, categories, sidebar, back/forward, deep links, mobile menu | rendering, active state, navigation | `smoke`, `navigation`, `build`, `dom-baseline`, `links` specs |
| Search (global, All Tools) | match, no result, empty, clear, URL state, direct navigation | `navigation.spec.js`, `tests/unit/search.test.mjs` |
| Calculators (30 built) | render, defaults, golden values, boundaries, invalid and empty, rounding, Reset, input/slider sync, results, related, 320/390 px, axe | one spec per calculator (`emi`, `sip`, `gst`, ..., `simple-calculators`, `risk-reward`), `field-slider`, `calculators-stage3-responsive`, unit golden tests (`*-golden.test.mjs`, `simple-calculators.test.mjs`) |
| Time Tools (13) | date maths, DST and zones, start/pause/resume/reset, sound controls, mobile | `date-calculator`, `date-difference`, `hours-calculator`, `countdown-timer`, `stopwatch`, `time-zone-converter`, `world-clock`, `time-tools-new`, `time-tools-enhancements`, `unix-timestamp-converter`; unit oracles (`dst-info`, `time-zone`, `world-clock-oracle`, `countdown-target`) |
| Developer Tools (12 utilities) | valid/invalid input, large input, errors, copy/download, line numbers, keyboard, local-only | `json-formatter(-indent)`, `json-compare`, `jsonpath-tester`, `jwt-decoder`, `base64*`, `url-parser`, `uuid-generator`, `list-comparer`, `text-diff(-options)`, `json-csv`, `cron-explainer`, `developer-tools-related` |
| Labs and Flashcards (8: JSON, JSONPath, Cron, Test design, SQL, Excel, Power BI, Smart Flashcards) | instructions, challenges, feedback, answer correctness, progress, mobile | `cron-challenge-lab`, `json-error-fixing-lab`, `jsonpath-challenge-lab`, `test-design-lab`, `smart-flashcards`, `learning-a11y/resilience/widths` |
| Image Tools (1 page + tools) | selection, formats, output, dimensions, download, large and invalid files, local privacy | `image-batch`, `image-crop`, `image-compressor-resizer` |
| PDF Tools (merge, split, pages, marks, photos-to-pdf) | selection, merge, split, extraction and order, output validity, download, invalid files | `pdf-tools`, `pdf-marks`, `photos-to-pdf`, `photos-to-pdf-turn-metadata`; unit PDF validity tests |
| Articles | render, metadata, images, internal links, related, category nav, readability | `articles`, `swp-articles`, `build`, article unit tests, static assets/SEO |
| Cross-site | responsive, keyboard, names, focus, contrast, links, console errors, SEO, consent, analytics | `site-a11y` (axe, 126 pages), `site-tablet` (820 px), `accessibility`, `analytics`, `links`, `notfound`, `seo-baseline`, static checks |
| Visual and performance | layout fidelity, Lighthouse | `visual.spec.js` (changed surfaces only), `npm run baseline:lighthouse` (informational) |

Planned and Coming Soon, tracked separately and not tested as features: Currency Converter (needs live rates, product decision), JSON Schema Validator (Tool Pack 41, blocked at the library gate and not in the catalog), SQL/Excel/Power BI learning ecosystem (not implemented; no routes).

## Owner's manual QA findings as regression scenarios

Status key: AUTO = an automated spec covers it (matched by file and test name, not re-run at `f5a1df4`); AUTO+MANUAL = behaviour is automated, quality needs a person; MANUAL = no automated check found; OPEN = product or content work outstanding. "Matched" means the spec exists and its titles address the item; individual assertions were not re-read for every row.

| # | Scenario | Status | Evidence / what to check |
|---|---|---|---|
| 1 | Slider sync, endpoints, initial styling | AUTO+MANUAL | `field-slider.spec.js` (move, type, keys, Reset, out-of-range pin); initial styling by eye |
| 2 | Loan Comparison slider loading delay | AUTO | WP2b: cause was the slider fill (`--slider-progress`) being applied only after the script ran; the initial fill is now in the generated markup; asserted with JavaScript disabled in `loan-comparison.spec.js`. Other calculators' sliders are created by `field-slider.js` already coloured |
| 3 | Age Calculator duplicate date icons | AUTO | fixed in WP2a: custom calendar button removed, native picker kept; `simple-calculators.spec.js` last test; confirm by eye in Safari |
| 4 | Date Difference inclusive presets | AUTO | `date-difference-presets.test.mjs`, `date-difference.spec.js` |
| 5 | Countdown 12/24-hour presentation | AUTO | WP3a: date mode has a 12-hour/24-hour choice (device default) that rewrites the event line live; `time-tools-enhancements.spec.js` |
| 6 | Countdown timezone field | AUTO | WP3a: field now starts as the device zone (legacy `Asia/Calcutta` shown as `Asia/Kolkata`); same spec |
| 7 | Countdown reminder duration, stop/mute | AUTO+MANUAL | WP3a: reminder repeats about 12 s in both modes, Stop sound button, option to turn it off; fake Web Audio counts tones in `time-tools-enhancements.spec.js`; loudness and clarity are manual |
| 8 | Stopwatch and time-tool sounds | AUTO+MANUAL | `stopwatch.spec.js`; audibility manual |
| 9 | International Meeting Planner usability | AUTO+MANUAL | `time-tools-new.spec.js`; clarity manual |
| 10 | Time Zone Converter clarity | AUTO+MANUAL | `time-zone-converter.spec.js`; wording manual |
| 11 | JSON Formatter precise errors, line/column | AUTO | `json-formatter.spec.js`, `json-error-fixing-lab.spec.js` |
| 12 | JSON Formatter input/output line numbers | AUTO | WP4a: shared `ui/line-gutter.js` numbers the input and the output (including values set by code), follows scrolling, marks the error line; `line-gutter.spec.js`. CORRECTION: the earlier AUTO mark was a keyword match on error text |
| 13 | JSON correction suggestions without silent mutation | AUTO | WP4b: the engine proposes a fix (`error.fix`) only for a trailing comma, a missing comma, a missing colon, an unquoted property name and unclosed brackets; shown with the line as it would read, applied only on "Apply this fix", hidden once the text changes. Never proposed where the intent is unknown (a line break in a string, `tru`, single quotes, leading zeros). `json-suggested-fix.test.mjs` (12, oracle: JSON.parse) and `json-formatter.spec.js`. CORRECTION: the earlier AUTO mark was wrong |
| 14 | JSON Compare line numbers, corresponding lines | AUTO+MANUAL | WP4a: both inputs numbered and the error line marked (`line-gutter.spec.js`). Differences are reported by JSON path, not by line, so "corresponding lines" is not applicable to the result; mapping a path to a line is not built |
| 15 | Long JSON document usability | AUTO+MANUAL | width and overflow tests; a 400-line document scrolls with its numbers (`line-gutter.spec.js`); feel on a 100,000-line document is manual |
| 16 | PDF Tools sidebar active state | AUTO | WP1a: the header "All Tools" item was lit only for the Calculators area, so PDF, Image, Time, Developer, Labs, Health and Converter pages and every `/tools/<id>/` tool showed no active item; now lit on all of them; `navigation.spec.js` (17 pages, plus Articles/About stay un-lit). There is still no persistent sidebar (see TECHNICAL_DEBT T-13) |
| 17 | Image Tools sidebar active state | AUTO | WP1a: the header "All Tools" item was lit only for the Calculators area, so PDF, Image, Time, Developer, Labs, Health and Converter pages and every `/tools/<id>/` tool showed no active item; now lit on all of them; `navigation.spec.js` (17 pages, plus Articles/About stay un-lit). There is still no persistent sidebar (see TECHNICAL_DEBT T-13) |
| 18 | All category sidebar active states | AUTO | WP1a: the header "All Tools" item was lit only for the Calculators area, so PDF, Image, Time, Developer, Labs, Health and Converter pages and every `/tools/<id>/` tool showed no active item; now lit on all of them; `navigation.spec.js` (17 pages, plus Articles/About stay un-lit). There is still no persistent sidebar (see TECHNICAL_DEBT T-13) |
| 19 | Labs separation and navigation | AUTO+MANUAL | WP C: Practice Labs is now its own section (rulebook 4.10): home card, All Tools group, footer link, hub, breadcrumbs, same-section related lists; `navigation.spec.js` (new test), `developer-tools-related.spec.js` |
| 20 | Incomplete SIP and Tax articles | OPEN | two articles are Coming Soon with no route (404 asserted); product decision, content not fabricated |
| 21 | Broken article images | AUTO | `smoke.spec.js` (images load, 126 pages), static asset check, three Pack 53 covers added |
| 22 | All Tools search clearing | AUTO | WP5a: emptying or space-only input on All Tools now restores the unfiltered page, the URL and the robots hint at once (it previously needed a submit); `navigation.spec.js` |
| 23 | Global search | AUTO | `navigation.spec.js`, `search.test.mjs` |
| 24 | Homepage hero loading and accessibility | AUTO+MANUAL | `site-a11y`, `build`, `dom-baseline`; visual load by eye |
| 25 | Responsive category workspace | AUTO+MANUAL | Phase 1: section navigation on every tool page, held-open sidebar from 1000 px with search and Hide/Show, disclosure below; `section-switcher.spec.js` (sidebar at 1280, hide and show, search, first/middle/last tool of each section, resize, axe, every tool page at 1000, 1280 and 1600 px without overflow), `site-tablet`, mobile runs; feel manual |
| 26 | SQL, Excel, Power BI ecosystem | NOT IMPLEMENTED | no routes; nothing to test |
| 27 | Image/PDF expansion | AUTO | merge, split, pages, marks, photos-to-pdf, crop, batch specs; `large-files-workspace.spec.js` (12 MP photo, 2 x 150-page merge, 26 MB and unreadable-file refusals at 1000, 1280 and 1600 px, state kept when the sidebar is hidden) |
| 28 | Slider values drive the calculation | AUTO | `slider-inventory.spec.js` (the control, 19 calculators) and `slider-calculation.spec.js` (slider equals typing, edge inputs, Reset, CAGR independent check; EMI, FD, GST excluded by instruction) |
| 29 | Running timers and in-page state survive the sidebar | AUTO | `large-files-workspace.spec.js` (stopwatch running and laps while the sidebar is hidden and shown) |
| 30 | EMI and Home Loan schedule CSV matches an independent calculation, only offered when a schedule exists | AUTO | `tests/unit/schedule-csv.test.mjs`, `loan-schedule-export.spec.js` |
| 31 | Lab exercises and lessons link both ways; typed answers kept; nothing stored | AUTO | `lab-lesson-navigation.spec.js` (SQL, Excel, Power BI) |
| 32 | Sidebar hide/show width, Back/Forward, refresh and search carry-over in all six ecosystems | AUTO | `sidebar-history.spec.js` |
| 33 | Large files near their limits succeed (35 MP image, 55 MB merge, 20 files) | AUTO | `large-files-near-limits.spec.js` |
| 34 | EMI, FD and GST sliders agree with typed values; FD and GST independent numbers | AUTO | `slider-calculation.spec.js` |
| 35 | Sidebar groups expand and collapse; the current group is open; search opens matching groups; phone drawer opens, closes (button, backdrop, Escape) and keeps typed values | AUTO | `section-switcher.spec.js` |
| 36 | Date Difference grouped quick dates and previous and future period presets (boundaries: month, year, leap day, Monday to Sunday weeks) | AUTO | `date-difference-presets.spec.js, date-difference-presets.test.mjs` |
| 37 | Calendar button and Use today on every date input; Use today is the local date; not offered for birth or joining dates; Business Days quick ranges | AUTO | `date-fields.spec.js` |
| 38 | Home hero (call to action, inline illustration, no external request), six ecosystem cards, one logo mark in header, footer and favicon | AUTO | `home-brand.spec.js` |

## Maintenance

Add a row when a tool or page is published (the inventory check fails otherwise) and when the owner reports a defect. Move a row to AUTO only after reading the spec's assertion, not its title.
