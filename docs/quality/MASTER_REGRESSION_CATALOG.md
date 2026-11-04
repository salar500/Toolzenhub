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
| Labs and Flashcards (5) | instructions, challenges, feedback, answer correctness, progress, mobile | `cron-challenge-lab`, `json-error-fixing-lab`, `jsonpath-challenge-lab`, `test-design-lab`, `smart-flashcards`, `learning-a11y/resilience/widths` |
| Image Tools (1 page + tools) | selection, formats, output, dimensions, download, large and invalid files, local privacy | `image-batch`, `image-crop`, `image-compressor-resizer` |
| PDF Tools (merge, split, pages, marks, photos-to-pdf) | selection, merge, split, extraction and order, output validity, download, invalid files | `pdf-tools`, `pdf-marks`, `photos-to-pdf`, `photos-to-pdf-turn-metadata`; unit PDF validity tests |
| Articles | render, metadata, images, internal links, related, category nav, readability | `articles`, `swp-articles`, `build`, article unit tests, static assets/SEO |
| Cross-site | responsive, keyboard, names, focus, contrast, links, console errors, SEO, consent, analytics | `site-a11y` (axe, 126 pages), `site-tablet` (820 px), `accessibility`, `analytics`, `links`, `notfound`, `seo-baseline`, static checks |
| Visual and performance | layout fidelity, Lighthouse | `visual.spec.js` (changed surfaces only), `npm run baseline:lighthouse` (informational) |

Planned and Coming Soon, tracked separately and not tested as features: Currency Converter (needs live rates, product decision), Best SIP Strategies and Tax Saving Guide articles (no sourced content), JSON Schema Validator (Tool Pack 41, blocked at the library gate and not in the catalog), SQL/Excel/Power BI learning ecosystem (not implemented; no routes).

## Owner's manual QA findings as regression scenarios

Status key: AUTO = an automated spec covers it (matched by file and test name, not re-run at `f5a1df4`); AUTO+MANUAL = behaviour is automated, quality needs a person; MANUAL = no automated check found; OPEN = product or content work outstanding. "Matched" means the spec exists and its titles address the item; individual assertions were not re-read for every row.

| # | Scenario | Status | Evidence / what to check |
|---|---|---|---|
| 1 | Slider sync, endpoints, initial styling | AUTO+MANUAL | `field-slider.spec.js` (move, type, keys, Reset, out-of-range pin); initial styling by eye |
| 2 | Loan Comparison slider loading delay | MANUAL | `loan-comparison.spec.js` covers function, not perceived delay; time it on a slow connection |
| 3 | Age Calculator duplicate date icons | MANUAL | no assertion found; check in Chrome and Safari (native date picker icon plus custom icon) |
| 4 | Date Difference inclusive presets | AUTO | `date-difference-presets.test.mjs`, `date-difference.spec.js` |
| 5 | Countdown 12/24-hour presentation | AUTO | `countdown-target.test.mjs`, `countdown-timer.spec.js` (matched) |
| 6 | Countdown timezone field | AUTO | same specs (matched) |
| 7 | Countdown reminder duration, stop/mute | AUTO+MANUAL | controls in `countdown-timer.spec.js`; whether the sound is understandable is manual |
| 8 | Stopwatch and time-tool sounds | AUTO+MANUAL | `stopwatch.spec.js`; audibility manual |
| 9 | International Meeting Planner usability | AUTO+MANUAL | `time-tools-new.spec.js`; clarity manual |
| 10 | Time Zone Converter clarity | AUTO+MANUAL | `time-zone-converter.spec.js`; wording manual |
| 11 | JSON Formatter precise errors, line/column | AUTO | `json-formatter.spec.js`, `json-error-fixing-lab.spec.js` |
| 12 | JSON Formatter input/output line numbers | AUTO | `json-formatter.spec.js` (matched) |
| 13 | JSON correction suggestions without silent mutation | AUTO | `json-formatter.spec.js`, error-fixing lab (matched) |
| 14 | JSON Compare line numbers, corresponding lines | AUTO | `json-compare.spec.js` |
| 15 | Long JSON document usability | AUTO+MANUAL | width and overflow tests; large-document feel manual |
| 16 | PDF Tools sidebar active state | MANUAL | header active state asserted in `navigation.spec.js:272-290`; sidebar item for PDF not individually confirmed |
| 17 | Image Tools sidebar active state | MANUAL | as 16 |
| 18 | All category sidebar active states | MANUAL | as 16; one representative per category is enough |
| 19 | Labs separation and navigation | AUTO+MANUAL | `developer-tools-related.spec.js`, `navigation.spec.js` |
| 20 | Incomplete SIP and Tax articles | OPEN | two articles are Coming Soon with no route (404 asserted); product decision, content not fabricated |
| 21 | Broken article images | AUTO | `smoke.spec.js` (images load, 126 pages), static asset check, three Pack 53 covers added |
| 22 | All Tools search clearing | AUTO | `navigation.spec.js` (matched) |
| 23 | Global search | AUTO | `navigation.spec.js`, `search.test.mjs` |
| 24 | Homepage hero loading and accessibility | AUTO+MANUAL | `site-a11y`, `build`, `dom-baseline`; visual load by eye |
| 25 | Responsive category workspace | AUTO+MANUAL | `site-tablet`, mobile runs (390, 820); feel manual |
| 26 | SQL, Excel, Power BI ecosystem | NOT IMPLEMENTED | no routes; nothing to test |
| 27 | Image/PDF expansion | AUTO | merge, split, pages, marks, photos-to-pdf, crop, batch specs |

## Maintenance

Add a row when a tool or page is published (the inventory check fails otherwise) and when the owner reports a defect. Move a row to AUTO only after reading the spec's assertion, not its title.
