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

- ~~A lesson-aware list that links each lesson to its exercises in the same panel.~~ Built 2026-11-05 as D7 (section 10), without a second list.
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

### What the sidebar does not do

- It does not keep state across tools (decision D4, section 10). Moving to another tool is a normal page navigation, so a typed value, a chosen file or a running timer in the old tool is lost, as it always was; the pages promise that nothing is stored. Hiding or showing the sidebar loses nothing (tested: chosen image, typed settings, result, merged PDF, running stopwatch and laps).
- Large Image and PDF files were tested beside the sidebar on 2026-11-05 (section 10); real phones, Safari and Firefox were not.
- No separate mobile drawer or bottom bar.
- A long lab hides the sidebar on screens under 1500 px (D3) so its own exercise list and the exercise keep their width; section 6's earlier line that a long lab "shows two lists" describes screens of 1500 px and up.

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
| `visual-mobile`, `visual-tablet` | Reviewed 2026-11-05 and accepted: 38 mobile and 20 tablet baselines differed (one mobile page already matched). Each pair was compared row by row (changed blocks and their heights), and the largest and a sample of the rest were looked at by eye. Causes found: the closed "More <section>" control under the breadcrumb (+60 px) and the Practice Labs footer link (+44 px) on every tool page; slider end-label rows (about 61 px each, up to five per calculator); related-article and related-calculator cards and tools added in earlier phases (Tools page +3,274 px, PDF Tools card, Percentage, SIP, Risk-Reward and Loan Eligibility cards); Practice Labs split out of Developer Tools and Health calculators moved from Coming soon (Developer Tools -873 px, Categories -671 px); new quick-fill buttons on Date Difference and a longer Countdown Timer sound label. No clipped text, overlap or sideways scroll was seen. Not every one of the 58 was opened by eye; the rest were judged from the row diff alone. Passed 59 of 59 after the update |
| `npm run build:all`, inventory check, links, assets, SEO (both builds) | pass; 132 pages each, sitemap 131, 5,511 internal links, 0 problems. The known P3 SEO items (28 long titles, 64 long descriptions, 2 pages without one H1, 6 heading skips) are unchanged |
| Not run | Firefox, Safari/WebKit, real phones, screen readers, Lighthouse, full suites, the full-width Image/PDF workflows at the new width |

Defects found and fixed in this phase: the Image Compressor download link was blue on near-black (a shared link colour outranked the button colour; PDF Tools had the same fix already); three stale test pins from the Practice Labs section.

## 9. Product research and coverage matrix (2026-11-05)

### 9.1 What was inspected, and how far it goes

| Source | What was read | What it was used for | Limit |
|---|---|---|---|
| W3C WAI-ARIA Authoring Practices, "Disclosure navigation menu" example | the pattern page | confirms the sidebar and the narrow "More <section>" disclosure: a `nav` landmark, buttons with `aria-expanded` and `aria-controls`, `aria-current="page"`, Escape closes and returns focus, Tab is the main key, and site navigation should not use the ARIA menu role | one pattern page |
| GitLab Pajamas, "Navigation sidebar" | the design-system page | a persistent left sidebar visible by default on wide screens that the user can hide; hidden by default on small screens and opened as an overlay; a stored preference | no search guidance; GitLab stores the preference in a cookie, which this site does not do (decision D4) |
| Calculator.net mortgage calculator | the page | a loan calculator reference: schedule by month and by year, extra payments, chart, print | one page of one site; a US mortgage, not an Indian EMI |
| iLovePDF home page | the tool list | the usual PDF tool set (merge, split, remove, extract, organise, compress, repair, OCR, convert, rotate, page numbers, watermark, crop, edit, protect, unlock, sign, redact, compare) | a list of names, not behaviour |
| Squoosh README | the repository front page | confirms in-browser, no-upload compression is a known and accepted pattern | the page names no formats or controls |
| SQLBolt | a search summary only | lessons that end in an exercise, no set-up | the sidebar behaviour was not confirmed |
| Nielsen Norman Group on navigation | not reached; only second-hand summaries came back | nothing is cited from it | treat every NN/g claim in third-party pages as unverified |

This is a small, honest sample, not a market study. No traffic, Search Console, keyword or usage data was gathered, so nothing below is a demand claim. The earlier reasoned-hypothesis package (`docs/ecosystem-review/`) stands as written; this section only adds what was checked now.

### 9.2 Coverage matrix: published tools and working functionality

Counts are the live tools in the catalog (69). "Working" means built and covered by a browser spec in this repository; "gap" is a proposal, not a promise.

| Ecosystem | Live tools | What a visitor can do now | Gap found (priority) | Action |
|---|---|---|---|---|
| Calculators | 30 (loans 9, investment 7, tax 4, health 3, business 3, math 3, converter 1) | every tool has a form that updates as you type; EMI has an amortisation schedule and, with Home Loan, a CSV download; Prepayment has CSV and print; SIP and Balance Transfer have print; the slider audit (sections 7 and 10) covers 16 of the 19 slider calculators at calculation level, the other three by instruction | EMI and Home Loan had no schedule download, while Prepayment did (P2) | built 2026-11-05 (commit 37d6aa4): a browser-only CSV of the monthly schedule on EMI and Home Loan; print for them is not built |
| Time Tools | 13 | timers and clocks (Countdown, Stopwatch, Pomodoro, Interval, World Clock), dates and durations (Date Difference, Date Calculator, Business Days, Time Duration, Hours and Timesheet), zones and shifts (Time Zone Converter, International Meeting Planner, Shift Planner); a running timer is not affected by hiding the sidebar (tested) | none found; no external time-tool comparison was made | none |
| Developer Tools | 12 | JSON (Formatter and Validator, Compare, JSONPath Tester, JSON and CSV), encoding (Base64, URL Parser, JWT Decoder), text (Text Diff, List Comparer), identifiers and time (Unix Timestamp, Cron Explainer, UUID Generator) | none claimed: no competitor feature comparison was made for these | none |
| Image Tools | 2 | Image Compressor and Resizer (resize, quality, target size, format change, batch, crop) and Photos to PDF; the configured limits are 25 MB and 40 MP; tested with 12 and 24 MP photos as successful operations, and with a 26 MB file and a 50 MP image as refusals (inputs just over the limits), with the sidebar open and hidden; nothing was tested as a success at the limits themselves | none found against what the Squoosh README says (it says little) | none |
| PDF Tools | 4 | Merge PDF, Split PDF, Extract, Reorder and Rotate Pages, Page Numbers and Watermark; tested with 2 x 150 pages beside the sidebar and a 600-page merge | iLovePDF also lists compress, crop, protect, unlock, sign, redact, compare, OCR and Office conversion: most need a server or a large library, and `pdf-lib` cannot recompress images, so none is proposed now (P3) | none now |
| Practice Labs | 8 | SQL (49 exercises), Excel (55), Power BI (43) with a grouped, searchable exercise list; JSON Error-Fixing, JSONPath, Cron, Test Design; Smart Flashcards | a lesson-aware list that links each lesson to its exercises (P2, section 4) | proposed |

### 9.3 References worth keeping

W3C APG disclosure navigation (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/); GitLab Pajamas navigation sidebar (https://design.gitlab.com/usability/navigation-sidebar); Calculator.net mortgage calculator (https://www.calculator.net/mortgage-calculator.html); iLovePDF (https://www.ilovepdf.com/); Squoosh (https://github.com/GoogleChromeLabs/squoosh).

### 9.4 Adopted and rejected, per ecosystem

"Reference" is only what was actually opened (9.1); an ecosystem with no reference says so. "Status" is the state in this repository on 2026-11-05.

| Ecosystem | Reference | Observed pattern | Decision | Rationale | Status |
|---|---|---|---|---|---|
| All (navigation) | W3C APG disclosure navigation | `nav` landmark, `aria-expanded`, `aria-current`, Escape returns focus | adopted | matches the section sidebar and its narrow disclosure | built (sidebar) |
| All (navigation) | GitLab Pajamas navigation sidebar | persistent sidebar, user can hide it, overlay on small screens | adopted, without the stored preference | a stored preference needs storage; D4 forbids it | built; the sidebar opens by default every visit |
| Calculators | Calculator.net mortgage calculator | monthly and yearly schedule, extra payments, chart, print | schedule adopted (CSV); chart, print for EMI/Home Loan, extra payments in EMI rejected for now | the schedule is the useful part and is local; a US mortgage's extras are not an Indian EMI feature set; Prepayment already covers part-payments | CSV built; others not built |
| Time Tools | none inspected | not applicable | no decision | no external reference was read, so nothing is adopted or rejected on evidence | no change |
| Developer Tools | none inspected | not applicable | no decision | same | no change |
| Image Tools | Squoosh README | in-browser compression with no upload | adopted (already the design) | privacy promise | built |
| PDF Tools | iLovePDF tool list | the usual set: merge, split, organise, page numbers, watermark and many server-side tools | merge, split, organise, numbers, watermark kept; compress, OCR, sign, redact, protect, unlock, Office conversion rejected | they need a server or a large library; `pdf-lib` cannot recompress images; no backend is allowed | built (4 tools); rest not proposed |
| Practice Labs (SQL) | SQLBolt (search summary only) | lessons that end in an exercise | adopted as a direction: show the lesson with its exercises | the lab list is grouped by topic already; a lesson-aware view needs no new list | being built (section 4) |
| Practice Labs (Excel, Power BI) | none inspected | not applicable | no external decision; the same in-lab navigation is applied for consistency | one navigation pattern across the three labs | being built (section 4) |

## 10. Decisions and results of the completion phase (2026-11-05, local, not pushed)

| # | Decision | Reason | Where |
|---|---|---|---|
| D3 | A long lab (twelve or more exercises) tells the section sidebar to step aside below 1500 px: it starts hidden with "Show Practice Labs" above the tool, and the visitor can show it at once. Labs under twelve exercises and screens of 1500 px and up keep it open. Nothing is stored | with both lists open, the exercise got about 800 px at 1440 px; the two lists are different things (labs against exercises), so this is a layout choice, not a removal | `learning/lab-shell.js` event `tz:lab-workspace`, `ui/section-rail.js`, rule 4.8 |
| D4 | No automatic saving of typed values, chosen files or lab answers when the visitor moves to another tool. Moving is still a normal page load. Hiding or showing the sidebar, and every other in-page interaction, keeps all of it | the pages promise that nothing is stored; the Privacy page lists exactly one stored item (flashcard progress, opt-in). An explicit "save" would need the owner's decision and a Privacy change | not built |
| D5 | Sidebar links are underlined only on hover and focus; the current tool is bold with an accent bar; the search box shows "Search tools" | thirty underlined links read as noise; the bar marks the place without relying on colour alone | `section-switcher.css`, `section-rail.js` |
| D6 | Home: the six ecosystem cards have the tinted icon tile used elsewhere, a live "N tools" count, a flask icon for Practice Labs, and a hero line that names all six ecosystems. Page title and description are unchanged | the tile rule listed the old calculator categories, not the six ecosystems; a hero about loans alone hid five of six | `components/categories.js`, `components/hero.js`, `categories.css`, `ui/icons.js` |
| D7 | Lesson-aware navigation in SQL, Excel and Power BI: each exercise card says which lesson(s) it practises, with "exercise N of M for it, K completed" (this visit only), and a link that opens that lesson below the lab; each lesson's "Practise" entries are buttons that open the exercise. The one grouped exercise list, search, previous/next and active state are unchanged; no second list was added | the lessons sat below the lab and the two were only joined by text; the shell already owns the single list | `learning/lab-shell.js` (`lab.lessons`, `lessonLine`), the three `lessons-view.js`, `learning.css`, `tests/browser/lab-lesson-navigation.spec.js` |

### Results (completion phase, 2026-11-05, local, not pushed)

| Check | Result |
|---|---|
| Large files beside the sidebar (`large-files-workspace.spec.js`) | 10 passed on subpath-desktop and 10 on subpath-mobile: a 12 MP photo, a 2 x 150-page merge and the refusals at 1000, 1280 and 1600 px, plus the stopwatch; chosen file, typed settings, result and running timer survive hiding and showing the sidebar; the preview widens when the sidebar is hidden; no sideways scroll. No defect found |
| Slider audit, calculation level (`slider-calculation.spec.js`) | desktop 16 calculators passed, 11 skipped (no slider); mobile 17 passed (the 16 plus the CAGR number check), 11 skipped. Every slider at minimum, midpoint and maximum gives the same results by slider and by typing; far-out values, text and zero or negative values are answered without NaN or a script error; Reset restores values and results. EMI, FD and GST were not re-run by instruction. CAGR is also checked against `(end/start)^(1/years) - 1` |
| Sidebar, labs, accessibility, navigation, links, sliders on subpath-desktop | section-switcher 21, learning-widths 25, learning-a11y 5, site-a11y 131, navigation 47 (2 skipped), links 1, sql-practice-lab 33, excel-practice-lab 25 (1 skipped), power-bi-practice-lab 24 (1 skipped), slider-inventory 19 (11 skipped), field-slider 20, large-files 10, lab-workspace 9: all passed |
| subpath-mobile | section-switcher 21, lab-workspace 9, large-files 10, slider-calculation 17 (11 skipped), learning-widths 25, navigation 46 (3 skipped): all passed |
| Unit suite | 3,858 run: 3,854 pass, 4 skipped (environmental), 0 fail |
| Builds and static checks | `npm run build:all` passes; inventory, links, assets and SEO checks pass on both builds (132 pages, sitemap 131 URLs) |
| Visual baselines | desktop 38 of 39, mobile 38 of 39 and tablet 19 of 20 passed without a change; only the home page differed on all three and was accepted after looking at it (icon tiles, count pills, a hero line one row longer). The sidebar link style change (D5) is below the 0.5% pixel tolerance of the desktop baselines, so those pass but are slightly stale; they were not refreshed because only the home page was reviewed one by one |
| DOM baseline | `home-main` accepted after reading the diff (the new hero sentence and six count spans); the other 16 passed |
| Root base path (`root-desktop`, all @portable tests) | first run 280 passed and 2 failed: `build.spec.js` expected 5 related-article cards on the two newest articles (Best SIP Strategies, Tax Saving Guide), whose data lists 3 and 2. A stale pin from the commit that published them, not caused by this phase; corrected with a per-article count. The two articles were re-run on `root-desktop` and `subpath-desktop` (4 passed), and then the whole `root-desktop` project was run again after the correction: **282 passed, 0 failed** (10.5 minutes, one worker) |
| Not run | Firefox, Safari/WebKit, real phones, screen readers, Lighthouse, the full regression suites, the mutation suite |

### Test environment (large-file measurements)

| Item | Value |
|---|---|
| Browser | Google Chrome 156.0.8078.80 (system install, Playwright `channel: "chrome"`), headless |
| Driver | Playwright 1.63.0, one worker |
| Runtime | Node.js 20.17.0 |
| Operating system | Windows 10 Home Single Language, 10.0.19045 |
| Memory | 3.9 GB RAM on the test laptop, with the owner's other programs open |
| "Mobile" runs | Chrome with a 390 px viewport (emulation on the same laptop), not a phone |
| Real devices, other browsers | not recorded: none were used |
| Limits versus inputs | configured: images 25 MB and 40 MP; PDFs 50 MB and 20 files. Test inputs: see the table below; refusal inputs: 26 MB and 50 MP |

### Large-file measurements (2026-11-05, `large-files-measure.spec.js`, local)

Each file is random noise, which does not compress, so it is as large as a detailed photograph or a scan. Images are made in the page, PDFs in the test with `pdf-lib` and `jpeg-js`; nothing large is committed. "Ready" is from choosing the file to the tool showing it; "process" is the button to the finished result. Heap is the page's JavaScript heap from `performance.memory` (Chrome rounds it; the decoded bitmaps the browser keeps outside the heap are not in it). Same files on `subpath-desktop` (1280 px) and `subpath-mobile` (390 px); the figures that differ between the two are times only.

| Tool and file | Input | Output | Ready, process (desktop; mobile) | Heap before, after choose, after process, after Reset |
|---|---|---|---|---|
| Image Compressor, JPEG 4000 x 3000 (12 MP) | 9.4 MB | 0.9 MB JPEG, 1920 x 1440 | 3.7 s, 1.2 s; 1.9 s, 1.0 s | 3, 51, 51, 51 MB |
| Image Compressor, JPEG 6000 x 4000 (24 MP) | 12.0 MB | 0.7 MB JPEG, 1920 x 1280 | 5.6 s, 1.6 s; 3.3 s, 1.9 s | 3, 97, 98, 97 MB |
| Image Compressor, PNG 2500 x 1800 (4.5 MP) | 14.8 MB | 8.6 MB PNG, 1920 x 1382 | 1.6 s, 1.0 s; 1.6 s, 1.0 s | 3, 23, 23, 23 MB |
| Merge PDF, 2 PDFs of 6 image pages | 13.7 MB and 13.7 MB | 27.4 MB, 12 pages | 12.1 s, 0.5 s; 8.8 s, 0.5 s | 3, 160 after, 161 after Reset (mobile 188) |
| Page Numbers and Watermark, 6 image pages | 13.7 MB | 13.7 MB, 6 pages | 5.5 s, 0.3 s; 4.9 s, 0.3 s | 3, 88 after, 88 after Reset |

What each case asserts: the input is in the stated size range; the preview shows and reports the right dimensions; the download opens as the right format with the right dimensions (images, read back from the file) or the right page count (PDFs, read back with the strict reader); there is no sideways scroll with the large file chosen and again with the result shown; Reset returns the tool to its empty state and hides the download. All 10 runs (5 on each project) passed and no defect was found.

What these numbers do and do not say. The heap does not fall after Reset: a freshly emptied tool keeps the figure it had, until the browser collects it, so these runs show that Reset empties the tool, not that it frees memory at once. A 24 MP image is 96 MB once decoded (24 million pixels at 4 bytes each, calculated, not measured), held by the browser outside this figure. The slowest step seen is choosing the two 13.7 MB PDFs (9 to 12 s to ready); that time includes the test runner handing 27 MB to the page, so it overstates what a visitor waits; the 50 MB and 20-file PDF limits were not run at their limits; for images the configured limits are 25 MB and 40 MP, and the refusal inputs were 26 MB and 50 MP (`image-compressor-resizer.spec.js`, `large-files-workspace.spec.js`), so a success at 25 MB or 40 MP is not claimed. The inputs above are test inputs (9 to 15 MB, 4.5 to 24 MP), not limits. The machine has 4 GB, so a visitor's device with less memory was not simulated.
