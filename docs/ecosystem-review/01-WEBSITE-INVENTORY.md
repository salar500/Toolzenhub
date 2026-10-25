# 01. Website inventory

Facts below were read from the repository at `8ece03a` (clean tree, equal to `origin/main`) on 2026-10-25. Source of truth for the list is `assets/js/data/tools.js` (catalog), `assets/js/data/categories.js` (sections), `assets/js/data/articles.js` (articles) and `tests/inventory/url-inventory.json` (89 live URLs). HTTP codes are from one GET sweep of those 89 URLs against GitHub Pages and against `https://toolzenhub.in` on the same day. A 200 proves the URL answers; it does not prove the production page is the current version.

## Status vocabulary (never merged)

| Code | Meaning | Evidence used |
|---|---|---|
| A | Implemented in source | catalog entry `status: "published"` plus a module under `assets/js/` |
| B | Included in the generated site | URL listed in `url-inventory.json` and present in `dist-ghpages/` |
| C | On the GitHub Pages preview | HTTP 200 from `salar500.github.io/Toolzenhub` (latest Pages run for `8ece03a`: success) |
| D | On production | HTTP 200 from `toolzenhub.in` (status only) |
| E | Automated tests passed | existing test files; a pass is recorded in the tool's spec or this session's ledger, not re-run here |
| F | Device acceptance | only what a spec records, or what the owner stated in a prompt |
| G | Production release approved | no repository document grants this for any tool listed as 404 on production |

## Counts

| Section | Published tools | Catalog entries marked coming-soon |
|---|---|---|
| Calculators | 18 (loans 6, investment 5, tax 4, business 2, math 1) | 11 (loans 3, health 3, business 1, math 2, converter 2) |
| Time Tools | 7 | 0 |
| Developer Tools | 6 | 0 |
| Image Tools | 2 | 0 |
| PDF Tools | 3 | 0 |
| **Total** | **36** | **11** (47 catalog entries) |

The 11 coming-soon entries are catalog data only. They are not counted as implemented, have no page in the live inventory and no sitemap URL.

## Published tools

| Tool | ID | Route | Section / category | Built (catalog `published`) | Preview HTTP | Production HTTP | Spec | Unit test files | Browser spec files | Articles |
|---|---|---|---|---|---|---|---|---|---|---|
| Loan Comparison Calculator | `loan-comparison` | `/calculators/loan-comparison/` | Calculators / loans | yes | 200 | 200 | — | loan-formulas | loan-comparison | 6 |
| EMI Calculator | `emi` | `/calculators/emi/` | Calculators / loans | yes | 200 | 200 | — | emi-golden, loan-formulas | emi | 0 |
| Home Loan Calculator | `home-loan` | `/calculators/home-loan/` | Calculators / loans | yes | 200 | 200 | 06 | home-loan-articles, home-loan-golden | home-loan | 3 |
| Loan Balance Transfer Calculator | `balance-transfer` | `/calculators/balance-transfer/` | Calculators / loans | yes | 200 | 200 | 02 | balance-transfer-articles, balance-transfer-golden | balance-transfer | 2 |
| Loan Prepayment Calculator | `prepayment` | `/calculators/prepayment/` | Calculators / loans | yes | 200 | 200 | 01 | loan-formulas, prepayment-export, prepayment-golden | prepayment | 4 |
| Credit Card Payoff Calculator | `credit-card-payoff` | `/calculators/credit-card-payoff/` | Calculators / loans | yes | 200 | 200 | 24 | credit-card-payoff | credit-card-payoff | 0 |
| SIP Calculator | `sip` | `/calculators/sip/` | Calculators / investment | yes | 200 | 200 | 03 | sip-articles, sip-golden | sip | 4 |
| PPF Calculator | `ppf` | `/calculators/ppf/` | Calculators / investment | yes | 200 | 200 | 26 | ppf-golden | ppf | 0 |
| FD Calculator | `fd` | `/calculators/fd/` | Calculators / investment | yes | 200 | 200 | 07 | fd-articles, fd-golden | fd | 2 |
| CAGR Calculator | `cagr` | `/calculators/cagr/` | Calculators / investment | yes | 200 | 200 | 09 | cagr-articles, cagr-golden | cagr | 2 |
| SWP Calculator | `swp` | `/calculators/swp/` | Calculators / investment | yes | 200 | 200 | 21 | swp-articles, swp-golden | swp-articles, swp | 2 |
| GST Calculator | `gst` | `/calculators/gst/` | Calculators / tax | yes | 200 | 200 | 08 | gst-articles, gst-golden | gst | 2 |
| Old vs New Tax Regime Calculator | `income-tax` | `/calculators/income-tax/` | Calculators / tax | yes | 200 | 200 | 17 | income-tax-golden | income-tax | 0 |
| Gratuity Calculator (India) | `gratuity` | `/calculators/gratuity/` | Calculators / tax | yes | 200 | 404 | 29 | gratuity-auto-wiring, gratuity-auto, gratuity-golden, gratuity-p1, gratuity-ui | gratuity-auto | 0 |
| Salary / CTC to In-Hand Calculator (India) | `salary-in-hand` | `/calculators/salary-in-hand/` | Calculators / tax | yes | 200 | 404 | 30 | salary-in-hand-golden, salary-in-hand-ui | salary-in-hand | 0 |
| Profit Calculator | `profit` | `/calculators/profit/` | Calculators / business | yes | 200 | 200 | 05 | profit-articles, profit-golden | profit | 3 |
| Margin Calculator | `margin` | `/calculators/margin/` | Calculators / business | yes | 200 | 200 | 04 | margin-articles, margin-golden | margin | 3 |
| Percentage Calculator | `percentage` | `/calculators/percentage/` | Calculators / math | yes | 200 | 200 | 10 | percentage-articles, percentage-golden | percentage | 3 |
| Date Difference Calculator | `date-difference` | `/tools/date-difference/` | Time Tools | yes | 200 | 200 | 11 | date-difference-golden | date-difference | 0 |
| Date Calculator | `date-calculator` | `/tools/date-calculator/` | Time Tools | yes | 200 | 200 | 12 | date-calculator-golden | date-calculator | 0 |
| Countdown Timer | `countdown-timer` | `/tools/countdown-timer/` | Time Tools | yes | 200 | 200 | 13 | countdown-timer | countdown-timer | 0 |
| Stopwatch | `stopwatch` | `/tools/stopwatch/` | Time Tools | yes | 200 | 200 | 14 | stopwatch | stopwatch | 0 |
| Time Zone Converter | `time-zone-converter` | `/tools/time-zone-converter/` | Time Tools | yes | 200 | 200 | 19 | none | time-zone-converter | 0 |
| World Clock | `world-clock` | `/tools/world-clock/` | Time Tools | yes | 200 | 404 | 28 | world-clock-contract, world-clock-country-zones, world-clock-directory, world-clock-engine, world-clock-explore, world-clock-oracle, world-clock-search, world-clock-time-query, world-clock-url | world-clock | 0 |
| Hours & Timesheet Calculator | `hours-calculator` | `/tools/hours-calculator/` | Time Tools | yes | 200 | 200 | 23 | hours-calculator | hours-calculator | 0 |
| JSON Formatter & Validator | `json-formatter` | `/tools/json-formatter/` | Developer Tools | yes | 200 | 200 | 15 | json-formatter | json-formatter | 0 |
| Unix Timestamp Converter | `unix-timestamp-converter` | `/tools/unix-timestamp-converter/` | Developer Tools | yes | 200 | 200 | 16 | unix-timestamp | unix-timestamp-converter | 0 |
| Text Diff / Compare | `text-diff` | `/tools/text-diff/` | Developer Tools | yes | 200 | 200 | 18 | text-diff | text-diff | 0 |
| JWT Decoder | `jwt-decoder` | `/tools/jwt-decoder/` | Developer Tools | yes | 200 | 200 | 22 | jwt-decoder | jwt-decoder | 0 |
| Cron Expression Explainer | `cron-expression-explainer` | `/tools/cron-expression-explainer/` | Developer Tools | yes | 200 | 200 | 25 | cron-explainer | cron-explainer | 0 |
| Base64 Encoder & Decoder | `base64-encoder-decoder` | `/tools/base64-encoder-decoder/` | Developer Tools | yes | 200 | 200 | 27 | base64-encoder-decoder | base64-encoder-decoder | 0 |
| Image Compressor & Resizer | `image-compressor-resizer` | `/tools/image-compressor-resizer/` | Image Tools | yes | 200 | 200 | 20 | image-engine | image-compressor-resizer | 0 |
| Photos to PDF | `photos-to-pdf` | `/tools/photos-to-pdf/` | Image Tools | yes | 200 | 404 | 31 | photos-to-pdf | photos-to-pdf | 0 |
| Merge PDF | `merge-pdf` | `/tools/merge-pdf/` | PDF Tools | yes | 200 | 404 | 33 | pdf-tools | pdf-tools | 0 |
| Split PDF | `split-pdf` | `/tools/split-pdf/` | PDF Tools | yes | 200 | 404 | 33 | pdf-tools | pdf-tools | 0 |
| Extract, Reorder and Rotate PDF Pages | `pdf-pages` | `/tools/pdf-pages/` | PDF Tools | yes | 200 | 404 | 33 | pdf-tools | pdf-tools | 0 |

"Unit test files" and "Browser spec files" are name matches in `tests/unit/` and `tests/browser/`; a name match shows a test exists, not that it passes today or covers a given risk. Section landing pages: `/calculators.html`, `/categories.html` (Calculator Categories), `/time-tools.html`, `/developer-tools.html`, `/image-tools.html`, `/pdf-tools.html`, plus `/tools.html` (All Tools) and the Calculators category pages.

## Release position per tool group (A to G)

| Group | A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|---|
| 29 tools answering 200 on production | yes | yes | yes | yes (status only) | recorded in specs | Image Compressor: Android PASS recorded in its spec (Tool Pack 20). Others: not recorded in the documents read | not re-verified; the owner deployed production earlier |
| World Clock | yes | yes | yes | **no (404)** | yes (spec 28, focused tests) | not recorded | **no**: a production ZIP was built 2026-10-20 and not deployed (owner memory note, not a repository document) |
| Gratuity Calculator | yes | yes | yes | **no (404)** | engine golden tests (spec 29) | not recorded | **no**: spec 29 is a DRAFT, release not approved |
| Salary / CTC to In-Hand | yes | yes | yes | **no (404)** | spec 30 records S3 and S4 oracle work | not recorded | **no**: spec 30 says "DRAFT, RELEASE NOT APPROVED" |
| Photos to PDF | yes | yes | yes | **no (404)** | unit and browser (this project's ledger) | OWNER-REPORTED Android PASS (device, browser, date and per-check results not supplied; specs 31 and 33 not updated) | **no** |
| Merge PDF, Split PDF, Extract/Reorder/Rotate PDF Pages | yes | yes | yes (Pages run for `8ece03a` succeeded; this sweep also returned 200) | **no (404)** | unit 32 and browser 40 per project (spec 33 ledger) | OWNER-REPORTED Android PASS (device, browser, date and per-check results not supplied; specs 31 and 33 not updated) | **no** |

Caution that follows from this table: Gratuity and Salary are `published` in the catalog, so they are in the preview, the sitemap and any production `dist/` build, while their own specs say release is not approved. Production uploads are manual and file by file, so the gate is procedural, not technical (see 14, P1 (D4)).

## Coming-soon catalog entries (not implemented)

| Title | ID | Reserved route | Category | Status |
|---|---|---|---|---|
| Personal Loan Calculator | `personal-loan` | `/calculators/personal-loan/` | loans | coming-soon; catalog entry only (not in the live URL inventory) |
| Loan Eligibility Calculator | `loan-eligibility` | `/calculators/loan-eligibility/` | loans | coming-soon; catalog entry only (not in the live URL inventory) |
| Interest Calculator | `interest` | `/calculators/interest/` | loans | coming-soon; catalog entry only (not in the live URL inventory) |
| BMI Calculator | `bmi` | `/calculators/bmi/` | health | coming-soon; catalog entry only (not in the live URL inventory) |
| Calorie Calculator | `calorie` | `/calculators/calorie/` | health | coming-soon; catalog entry only (not in the live URL inventory) |
| BMR Calculator | `bmr` | `/calculators/bmr/` | health | coming-soon; catalog entry only (not in the live URL inventory) |
| ROI Calculator | `roi` | `/calculators/roi/` | business | coming-soon; catalog entry only (not in the live URL inventory) |
| Ratio Calculator | `ratio` | `/calculators/ratio/` | math | coming-soon; catalog entry only (not in the live URL inventory) |
| Age Calculator | `age` | `/calculators/age/` | math | coming-soon; catalog entry only (not in the live URL inventory) |
| Unit Converter | `unit-converter` | `/calculators/unit-converter/` | converter | coming-soon; catalog entry only (not in the live URL inventory) |
| Currency Converter | `currency` | `/calculators/currency/` | converter | coming-soon; catalog entry only (not in the live URL inventory) |

## Existing-tool assessment

Classes: KEEP, SMALL (localized UX, accessibility, content or discovery), ENHANCE (a missing capability that belongs inside the tool), REPAIR (verified correctness, privacy or integrity problem), CONSOLIDATE, NEW (a distinct problem). Nothing here is approved work. Labels follow the rulebook: **verified** (observed in the repository or a GET this session) or **hypothesis**.

| Tool or group | Class | Finding | Label |
|---|---|---|---|
| All 21 non-calculator tools | SMALL (shared) | Each module sets `showRelatedCalculators = false` and `showRelatedArticles = false`, so the related-tools component never renders on these pages. The catalog `relatedTools` data exists for them but is not displayed; neighbours are linked only by hand-written text in each module. Rulebook 4.8 records "ecosystem navigation" as an approved direction with nothing built | verified |
| Time Zone Converter | SMALL (rule check) | Its curated `relatedTools` is `unix-timestamp-converter`, a Developer Tools entry. Rulebook 4.2 says related lists never cross sections. The list is not displayed, but the module text links to that tool. A conflict to report, not to fix silently | verified |
| Unix Timestamp Converter | SMALL | Relates only to JSON Formatter, while Time Zone Converter, Cron, JWT and JSON Formatter link to it in text; the relation graph is uneven | verified |
| Image Compressor & Resizer, Photos to PDF | SMALL | Photos to PDF curates the compressor as related (not displayed, same suppression). The compressor does not link to Photos to PDF | verified |
| Calculators with no curated `relatedTools` (EMI, Loan Comparison, Home Loan, SIP, FD, CAGR, PPF, Profit, Margin, others) | KEEP | Calculator pages render related lists and fall back to the category when no curated list exists; not inspected visually here | NOT VERIFIED (display) |
| `design-tokens` unit test | REPAIR (cosmetic) | Fails today on `assets/css/calculators/gratuity.css` (`#667085`). Pre-existing, unrelated to the PDF work | verified |
| Brand green as small text | SMALL (shared) | 3.43:1 on white, below AA for normal text; recorded in `docs/design-follow-ups.md` and `tests/README.md` | recorded, not re-measured |
| Tool Pack status lines 23 and 26 | SMALL (docs) | Spec 23 says "draft, awaiting approval. Not implemented." and spec 26 says "Not implemented", although both tools are published. The factory roadmap R1 table is correct; those two status lines are stale | verified |
| Gratuity, Salary | KEEP behind a gate | Built and on the preview, release not approved | verified |
| The rest of the 36 | KEEP | No defect is recorded in the documents read. That is absence of evidence, not a clean audit; per-tool accessibility and device evidence was not audited | NOT VERIFIED |

## Not verified in this phase

Per-tool accessibility results, Lighthouse scores (the baseline in `tests/README.md` dates from M0 and is informational), Safari and WebKit, real-device behaviour beyond what specs record, and the visual rendering of every tool page. No browser test was run for this review.
