# Ecosystem workspace refinement (started 2026-11-05)

Owner brief: let a user find, use and switch between tools with the least effort, without turning the site into a framework SPA. This file records what was found, what was decided, what is built and what is only proposed. Nothing here changes a route, a canonical URL, a formula or a SQL execution path. Rule changes in this stretch: none.

## 1. Starting state (verified in the repository)

| Area | State found |
|---|---|
| Practice Lab shell (`assets/js/learning/lab-shell.js`) | One exercise at a time, answers kept in memory while switching, Previous/Next, a flat row of numbered buttons with no titles. Used by 10 labs. The three long ones: SQL 49, Excel 55, Power BI 43 exercises. The lessons sit below the exercise on the same page |
| Exercise data | Every SQL, Excel and Power BI exercise has a `topic` and a `difficulty`; no lab has a stored "course order" beyond the array order |
| Sliders | `ui/field-slider.js` mirrors a number input (the source of truth); the slider is decorative for pointers and hidden from assistive technology. No endpoint labels existed |
| Calculator switching | Related calculators and the category pages exist; no side list |

## 2. Decisions

### D1. Practice Lab workspace list (built)

- **Problem.** A learner has to count numbered buttons to find an exercise, and with 49 to 55 exercises the row is a wall of numbers with no titles or topics.
- **Solution.** For a set of 12 or more exercises the shared shell shows a grouped list (by `topic`, otherwise by difficulty) with number, title and a status word, a search box (number, title, topic), the current exercise marked with `aria-current`, and the exercise on the right. Shorter sets keep the plain row.
- **Desktop (960px and wider).** The list sits to the left of the exercise, stays in view while the page scrolls and scrolls on its own.
- **Mobile.** The list folds into one summary that names the current exercise ("Exercise 21 of 49: ... Choose another"); choosing an exercise closes it.
- **State.** Typed answers, hints, checks and "solution viewed" are kept in memory when switching, so nothing is discarded and no warning is needed. Opening an exercise marks nothing completed. Nothing is stored in the browser, as before.
- **Alternatives rejected.** A new page per exercise (breaks the one-page, no-storage model and adds URLs); a drawer on desktop (hides the list the learner wants); a new SQL runner (not needed).
- **Accessibility.** A labelled search field, a `details` summary that is keyboard operable, `aria-current`, button names that include number, title, level and status, a polite status line for search results.
- **SEO.** No change to routes, titles, descriptions or canonical URLs. The list is built by script, like the numbered row before it. Page text counts in the SEO baseline were not expected to change; verify if the baseline test is run.
- **Honest limit.** The learner's answers are lost on reload, exactly as before. The lessons are still lower on the page, not in the list; a lesson-aware list is proposed below, not built.

### D2. Slider ends (built)

- **Problem.** A slider showed only its thumb. A visitor could not tell how far it went.
- **Solution.** Under every slider, both ends of its real range in the field's own unit, for example `₹1 Lakh` and `₹5 Crore`, `1%` and `20%`, `1 Year` and `30 Years`. The current value stays in the number input beside the label, which is the accessible control. The ends are hidden from assistive technology because the number input already carries min and max.
- **Not changed.** Slider ranges, steps, defaults, formulas, input-to-slider synchronisation.

## 3. Coverage matrix: SQL Practice Lab (existing support only; nothing is claimed beyond what is in the data)

| User task | Existing support | Missing | Priority | Action |
|---|---|---|---|---|
| Learn the basics (SELECT, WHERE, sort) | Lessons plus exercises 1 to 12 | none known | done | none |
| Aggregates, grouping, joins, subqueries | Exercises (aggregates 3, grouping 2, joins 5, subqueries 3) | few exercises per topic | P3 | content addition if the owner wants more |
| Window functions, changing data, constraints, transactions | 3, 3, 2, 1 exercises | thin transactions and performance coverage | P3 | proposal only |
| Data cleaning | 8 exercises and a cleaning journey across the three labs | none known | done | none |
| Find an exercise quickly | Workspace list (D1) | lesson-aware list | P2 | proposed |
| Real databases other than SQLite | Explicit notes only | MySQL, PostgreSQL behaviour | out of scope | none |

## 4. Proposed, not built

- A lesson-aware list that links each lesson to its exercises in the same panel.
- Calculator, Time Tools, Developer Tools, Image Tools and PDF Tools side navigation. A per-ecosystem choice is needed: Developer, Image and PDF tools need the whole width for editors and previews, so a collapsible list is the likely pattern; simple Time Tools may only need a compact switcher. This is a "restructuring a section" change under rule 11.7 and is held for the owner.
- Homepage identity and logo work.

## 5. Verification record (2026-11-05, local, not pushed)

| Check | Result |
|---|---|
| Unit suite | 3,854 run: pass except 4 skipped (environmental); the build-output test passed after the root build was refreshed |
| New: `lab-workspace.spec.js` (7 tests), `field-slider.spec.js` (20) | pass on subpath-desktop and subpath-mobile |
| Existing lab specs (SQL, Excel, Power BI, Cron, JSON error fixing, JSONPath, Test Design, learning-widths, learning-a11y) | pass on subpath-desktop and subpath-mobile after the tests were taught to open the folded list (`pickExercise` in `tests/helpers/lab-contract.mjs`); Excel and Power BI have 1 skipped each, by design |
| `seo-baseline`, `dom-baseline` (subpath-desktop) | SEO passes unchanged; DOM baseline `emi-form-and-results` accepted after reading the diff (only the slider-end rows were added) |
| Not run | root-desktop, full suites, visual, Lighthouse, Firefox/WebKit, real phones, screen readers; sliders in calculators other than EMI/FD/GST were not exercised in a browser (the ends come from the same shared code) |

## 6. Universal tool sidebar (built 2026-11-05)

Built on the existing build-time "More <section>" navigation (`components/section-switcher.js`), so the links are still plain, crawlable pages and no route, canonical URL or sitemap entry changed. Rule 4.8 of `docs/product-decision-rules.md` now states the behaviour.

| Item | Decision |
|---|---|
| Where | every tool page of Calculators (30), Time Tools (13), Developer Tools (12), Practice Labs (8), PDF Tools (4), Image Tools (2) |
| Wide (1000 px and up) | left column beside the tool, open by default on every visit, sticky, scrolls on its own, current tool marked. The page is as wide as the window allows (up to 1760 px) so the tool takes the remaining width |
| Hide and show | "Hide tools" in the sidebar; "Show <section>" above the tool when hidden. Hidden, the column is gone (no gap). Hiding changes no field, result or timer. The sidebar does not reload the tool |
| Search | a labelled search box where a section has eight or more tools (Calculators, Time, Developer, Practice Labs); every word must match; Escape clears; the match count is announced politely |
| Groups | Calculators by catalog category; the other sections by `SECTION_GROUPS`, a presentation-only map (a unit test fails if a published tool is missing from it): Time (Timers and clocks, Dates and durations, Time zones and shifts), Developer (JSON, Encoding and decoding, Text and lists, Time and identifiers), Labs (Data, Developer practice, Testing and study), PDF (Combine and split, Edit pages). Image Tools has two tools and no groups |
| Narrow (under 1000 px) | the closed "More <section>" disclosure with the same search, so a phone's screen stays with the tool. No separate drawer was built; the disclosure is the phone pattern |
| Storage | none. A hidden sidebar is not remembered: the next page opens with it open, as the brief requires. Remembering a manual choice was considered and left out (it would hide the navigation from someone entering a workspace) |
| Routing | each entry is the tool's existing URL; Back, Forward, refresh and deep links are the browser's own |
| Practice Labs | a lab with twelve or more exercises also has its own exercise list (section 2, D1) inside the main area, so a long lab shows two lists; the sidebar can be hidden to give the lab more room |

### What the sidebar does not do (open)

- It does not keep state across tools. Moving to another tool is a normal page navigation, so a typed value, a chosen file or a running timer in the old tool is lost, as it always was. Hiding or showing the sidebar does not lose them.
- Image and PDF tools were checked for no sideways scroll and for the sidebar, not for large-file workflows at the new width.
- No separate mobile drawer or bottom bar.

## 7. Slider inventory (browser-tested)

Read from the built pages by `scripts/gen-slider-inventory.mjs`: **71 sliders in 19 calculators**. `tests/browser/slider-inventory.spec.js` finds every one on the page and checks that both ends are written, that the minimum, the midpoint and the maximum set the number field exactly, and that a typed value beyond the range leaves the thumb at an end and the number alone. It passed on desktop and mobile for all 19 calculators (the other 11 calculators have no slider). It does not recheck formulas (their own golden tests do).

| Calculator | Sliders | Ranges (slider min to max, step) |
|---|---|---|
| balance-transfer | 5 | Outstanding Loan Balance 100000 to 2e+07 step 50000; Current Interest Rate 1 to 20 step 0.1; Years 1 to 30 step 1; New Interest Rate 1 to 20 step 0.1; Years 1 to 30 step 1 |
| bmi | 3 | Weight 20 to 300 step 1; Height 100 to 250 step 1; Age 18 to 100 step 1 |
| bmr | 3 | Age 15 to 100 step 1; Weight 20 to 300 step 1; Height 100 to 250 step 1 |
| cagr | 2 | Years 1 to 30 step 1; Years 1 to 30 step 1 |
| calorie | 3 | Age 15 to 100 step 1; Weight 20 to 300 step 1; Height 100 to 250 step 1 |
| credit-card-payoff | 3 | Outstanding Balance 1000 to 1e+06 step 1000; Annual Percentage Rate (APR) 5 to 60 step 0.5; Monthly Payment 500 to 200000 step 500 |
| emi | 3 | Loan Amount 100000 to 5e+07 step 50000; Interest Rate 1 to 20 step 0.1; Loan Tenure 1 to 30 step 1 |
| fd | 5 | Deposit Amount 10000 to 1e+07 step 10000; Interest Rate 1 to 12 step 0.1; Years 1 to 10 step 1; Option B Interest Rate 1 to 12 step 0.1; Years 1 to 10 step 1 |
| gst | 4 | GST Rate 0 to 28 step 0.5; GST Rate 0 to 28 step 0.5; GST Rate 0 to 28 step 0.5; GST Rate 0 to 28 step 0.5 |
| home-loan | 4 | Monthly Income 10000 to 1e+06 step 5000; Share of Income for EMIs 10 to 80 step 1; Interest Rate 1 to 20 step 0.1; Loan Tenure 1 to 30 step 1 |
| interest | 3 | Principal 10000 to 1e+07 step 10000; Interest rate (a year) 1 to 20 step 0.1; Time 1 to 30 step 1 |
| loan-eligibility | 5 | Monthly income 10000 to 1e+06 step 5000; Existing EMIs (optional) 0 to 500000 step 1000; Share of income for loan payments 10 to 70 step 1; Interest rate (a year) 5 to 20 step 0.1; Tenure 1 to 30 step 1 |
| margin | 3 | Target Margin 1 to 90 step 1; Target Markup 1 to 300 step 1; Discount (optional) 0 to 90 step 1 |
| personal-loan | 4 | Loan amount 50000 to 5e+06 step 10000; Interest rate (a year) 5 to 30 step 0.1; Tenure 1 to 10 step 1; Processing fee (optional) 0 to 5 step 0.1 |
| ppf | 4 | Yearly Deposit 500 to 150000 step 500; Monthly Deposit 50 to 12500 step 50; Interest Rate (example) 5 to 10 step 0.1; Financial Years of Deposits 1 to 30 step 1 |
| prepayment | 3 | Outstanding Loan Balance 100000 to 2e+07 step 50000; Interest Rate 1 to 20 step 0.1; Years 1 to 30 step 1 |
| roi | 3 | Amount invested 10000 to 1e+07 step 10000; Final value 10000 to 2e+07 step 10000; Years held (optional) 1 to 30 step 1 |
| sip | 5 | Monthly SIP Amount 500 to 200000 step 500; Assumed Annual Return 1 to 30 step 0.5; Years 1 to 40 step 1; Yearly Step-Up (optional) 0 to 25 step 1; Expected Inflation (optional) 0 to 12 step 0.5 |
| swp | 6 | Starting Corpus 100000 to 5e+07 step 100000; Withdrawal Each Time 1000 to 500000 step 1000; How Long 1 to 40 step 1; Assumed Annual Return 1 to 20 step 0.5; Yearly Increase in Withdrawal (optional) 0 to 15 step 1; Expected Inflation (optional) 0 to 12 step 0.5 |

29 of the sliders start with an empty field or a value outside the slider range (for example BMI weight, or an optional comparison rate of 0); the thumb sits at the minimum until a value is typed, by design.

## 8. Verification record, sidebar phase (2026-11-05, local, not pushed)

| Check | Result |
|---|---|
| Unit suite | 3,858 run: 3,854 pass, 4 skipped (environmental), 0 fail after one hard-coded colour was replaced by the focus token |
| `section-switcher.spec.js` (switcher, sidebar, every tool page at 1000, 1280 and 1600 px, axe) and `lab-workspace.spec.js` | 28 passed on subpath-desktop and 28 on subpath-mobile |
| `slider-inventory.spec.js` | 19 passed, 11 skipped (no slider) on desktop and on mobile |
| Existing specs on both projects: navigation, links, home-loan, sip, countdown-timer, stopwatch, world-clock, json-formatter, image-compressor-resizer, pdf-tools, photos-to-pdf, learning-widths, site-a11y | pass after three stale pins (Developer Tools 12 tools, six sections, Practice Labs 8 tools) and two World Clock checks (the sidebar has a live region and lists World Clock) were corrected; pdf-tools, photos-to-pdf, learning-widths, site-a11y (131) and the lab specs passed without change |
| `seo-baseline`, `dom-baseline` | SEO accepted after reading the diff (only visible text counts rose, 30 to 60 characters on 37 pages); DOM passes |
| `visual-desktop` | 38 of 39 baselines were different and were accepted. Individually looked at: EMI, Image Compressor, the home page, Contact (footer only), plus live screenshots of JSON Formatter, the SQL lab, PDF and mobile EMI. Most differences are the sidebar plus the Practice Labs footer link, which no earlier phase had refreshed |
| `visual-mobile`, `visual-tablet` | NOT accepted. 39 and 20 baselines differ (pages 40 to 600 px taller than recorded: the footer link, the slider-end rows and earlier phases). Left as they are and reported as stale; they need a one-by-one review |
| `npm run build:all`, inventory check, links, assets, SEO (both builds) | pass; 132 pages each, sitemap 131, 5,511 internal links, 0 problems. The known P3 SEO items (28 long titles, 64 long descriptions, 2 pages without one H1, 6 heading skips) are unchanged |
| Not run | Firefox, Safari/WebKit, real phones, screen readers, Lighthouse, full suites, the full-width Image/PDF workflows at the new width |

Defects found and fixed in this phase: the Image Compressor download link was blue on near-black (a shared link colour outranked the button colour; PDF Tools had the same fix already); three stale test pins from the Practice Labs section.
