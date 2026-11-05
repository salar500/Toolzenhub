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
