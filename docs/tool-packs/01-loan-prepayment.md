# Tool Pack 01: Loan Prepayment Calculator

**Status: specification only.** Nothing in this document is built or published. The tool, its page,
its articles and its search presence do not exist yet; the catalog entry `prepayment` is still Coming
Soon. Follow `docs/tool-pack-template.md` to build it, and `docs/content-clusters.md` for the articles.

## 1. Why this tool first

### What the evidence in the repository says

- The Loans category is the only one with real tools, six published articles, and a landing page.
- One of the six articles is "What Is Loan Prepayment?", and two others (reducing home loan interest,
  loan tenure) touch it. The site already explains the idea but gives the reader **no way to test it
  with their own numbers**. Those articles are also qualitative, with no worked figures.
- The catalog already reserves it: `prepayment` ("Prepayment Calculator", Coming Soon), whose page
  would be `/calculators/prepayment/`. No new URL decision is needed.
- It reuses the amortization logic the site already has (`formulas/loan.js`) and verifies cleanly
  (below), so it carries no external API, no rule tables and no data that goes stale.

### Candidates considered

| Candidate | Pain solved | Repeat use | Sophistication | Content depth | Implementation risk |
| --- | --- | --- | --- | --- | --- |
| **Loan Prepayment Calculator** (`prepayment`) | "I have extra money: what does paying my loan down actually save, and should I shorten the loan or lower the EMI?" A real decision | Returns whenever a bonus, maturity or savings arrives, or the rate changes | High: baseline vs two outcomes, timing, recurring extra payments, net of charges, yearly balance table | Strong and distinct (timing, tenure vs EMI, extra monthly); builds on 2 existing articles | Low to moderate: well-defined math, verifiable two ways; needs careful timing assumptions |
| Balance Transfer Calculator (`balance-transfer`) | "Is switching lenders worth the fees?" High decision value | Occasional, rate-change driven | High (break-even months, net saving) | Good | Moderate: depends on fee structures (processing fee, taxes, charges) that vary and change; more assumptions to state |
| Home Loan Calculator (`home-loan`) | "What will my home loan cost?" | Moderate | Low unless it adds costs outside the loan, which vary by state and change | Overlaps EMI and the existing articles | Low for the EMI part; moderate if it adds fees or tax benefit rules |
| Personal Loan Calculator (`personal-loan`) | EMI plus fees for a personal loan | Moderate | Low (an EMI calculator with a fee field) | Thin, overlaps EMI | Low, but it adds little over EMI |
| Loan Eligibility Calculator (`loan-eligibility`) | "How much can I borrow?" | Moderate | Looks rich, but depends on each lender's policy, income rules and credit scoring | Risk of misleading content | High accuracy risk: assumptions differ by lender and change; invites overclaiming |
| SIP Calculator (`sip`) | "What will my monthly investment grow to?" | High | Moderate (a step-up SIP, goal reverse) | Deep but crowded, and a new category with no content yet | Low math risk, but returns assumptions and investment-advice sensitivity; weak link to the current assets |
| Goal Investment Calculator (not in the catalog) | "How much must I invest monthly to reach a target?" | High | Moderate | Pairs with SIP | Not in the catalog; better as a later extension of SIP |
| Interest Calculator (`interest`) | Simple and compound interest | Low to moderate | Low (generic) | Thin | Low, but low differentiation |

A "loan payoff" calculator is **not** a separate tool: paying off the loan is the case where the
prepayment amount clears the balance, so the Prepayment Calculator covers it.

**Why not the easy one:** a generic EMI-style calculator would be quick but adds little beyond EMI.
Balance transfer is the strongest next tool, because it reuses this pack's relationships and logic,
but it needs fee assumptions the site has not yet had to state; it is the natural **Tool Pack 02**.

## 2. Product specification

| | |
| --- | --- |
| Name | **Loan Prepayment Calculator** (the catalog title today is "Prepayment Calculator"; see decisions) |
| Id / route | `prepayment` / `/calculators/prepayment/` (already reserved) |
| Section / category / subcategory | Calculators / Loans / none |
| `toolType` / status | `calculator` / `coming-soon` now, `published` when built |
| Target user | An Indian borrower with a running home, personal or car loan who has money to put towards it |
| Problem | Show what a one-time payment and/or a regular extra payment does to a loan: interest saved, time saved, the new EMI, and whether shortening the loan or lowering the EMI saves more |
| Processing | In the browser only; no network, no storage, no URL state in v1 |

### Inputs

| Input | Unit | Default | Allowed | Notes |
| --- | --- | --- | --- | --- |
| Outstanding loan amount | ₹ | 25,00,000 | 1,000 to 10,00,00,000, step 1,000 | what the lender shows as outstanding principal |
| Interest rate | % a year | 8.5 | 0.1 to 30, step 0.01 | assumed fixed for the rest of the loan |
| Remaining tenure | months | 180 | whole number, 1 to 480 | a live line shows it as years and months |
| One-time prepayment | ₹ | 3,00,000 | 0 or more, step 1,000 | 0 turns it off |
| Prepay after EMI number | EMIs paid | 24 | whole number, 0 to remaining months minus 1 | 0 means before the next EMI |
| Extra payment every month | ₹ | 0 | 0 or more, step 500 | paid with each EMI from the next one |
| Prepayment charge | % of the one-time amount | 0 | 0 to 10, step 0.1 | for the user to fill in from their loan terms; the tool states no rule about charges |

**Validation** (the tool owns the rules and wording; presentation uses the shared error wiring, with
the offending inputs marked `aria-invalid` and linked to the error):

- amount, rate and tenure inside their ranges; tenure and "after EMI number" are whole numbers;
- "after EMI number" is less than the remaining months;
- prepayment and extra payment are not negative;
- a prepayment that is as large as the outstanding balance at that point is allowed and shown as
  "this pays off the loan";
- if neither a prepayment nor an extra payment is entered, show the empty state, not a result.

### Calculation model (must be verified before release)

Notation: `i` = annual rate / 12 / 100; `n` = remaining months; `P` = outstanding amount;
payments are made at the end of each month; interest accrues monthly on the reducing balance.
This is the same model as `formulas/loan.js` (`calculateEMI`, `calculateAmortization`).

- **Baseline EMI** = `P·i·(1+i)^n / ((1+i)^n − 1)` (or `P/n` when `i = 0`).
- **Balance after k EMIs** = `P(1+i)^k − EMI·((1+i)^k − 1)/i`. This equals the schedule's balance.
- **One-time prepayment `L` after EMI `k`**: balance becomes `B' = B_k − L` (if `L ≥ B_k` the loan
  ends at month `k`).
- **Outcome A, keep the EMI (finish sooner)**: months after the prepayment
  `m = ceil( −ln(1 − B'·i / EMI) / ln(1+i) )`; the last payment is the remaining balance plus interest.
- **Outcome B, lower the EMI (same end date)**: `EMI' = B'·i·(1+i)^(n−k) / ((1+i)^(n−k) − 1)`.
  Total interest is the baseline interest of the first `k` months plus `EMI'·(n−k) − B'`.
- **Recurring extra payment `X`** is added to every EMI from the next one in outcome A. It has no
  closed form with a prepayment present, so use month-by-month simulation. **Outcome B does not apply
  when `X > 0`** (a lower EMI contradicts paying more each month); the tool says so instead of showing it.
- **Interest saved** = baseline total interest − outcome total interest.
  **Net saving** = interest saved − (`L` × charge %). **Total paid** = all EMIs + `L` + charge.
- **Rounding:** calculate unrounded in floating point (as the other tools do) and round only for
  display. The last payment absorbs the remainder so the balance ends at exactly zero.

**What must be verified during implementation (do not skip):**

1. The simulation and the closed forms above agree (months and interest) across a grid of inputs.
2. With no prepayment and no extra payment, results equal the existing EMI, interest and schedule.
3. Golden values come from an *independent* calculation (for example a separate high-precision
   script), not from the code under test, and are pinned in `tests/unit/prepayment-golden.test.mjs`.
4. Invariants: interest saved is never negative; it grows with the prepayment; for the same lump sum
   outcome A never saves less interest than outcome B; a later prepayment never saves more than an
   earlier one; balances never go below zero; the sum of principal paid equals the amount.
5. Edge cases: `i = 0`, `k = 0`, the lump sum equal to or above the balance, very large extra payments,
   the minimum and maximum of every range.
6. Timing assumption is stated on the page (the prepayment is applied right after the chosen EMI).
   Real lenders may apply it mid-month or compute interest daily, so results are estimates.

**Illustrative figures** (computed during E5 by simulation and by closed form, which agreed; to be
re-derived and pinned by the golden tests, not relied on until then). Loan ₹25,00,000, 8.5%, 180
months: EMI about ₹24,618, total interest about ₹19,31,328. With ₹3,00,000 prepaid after 24 EMIs:
outcome A finishes in 148 months (32 sooner) and saves about ₹5,04,951; outcome B lowers the EMI to
about ₹21,435 and saves about ₹1,96,632. The same ₹3,00,000 saves about ₹6,35,199 if paid at the start
and about ₹1,31,906 after 120 EMIs. An extra ₹5,000 every month (no lump sum) finishes in 130 months.

### Results

- **Headline:** interest saved and time saved for outcome A, with the net saving after any charge.
- **Comparison** (three columns): *without prepayment*, *prepay and keep the EMI (finish sooner)*,
  *prepay and lower the EMI (same end date)*. Rows: EMI, months remaining, total interest, total paid,
  interest saved, net saving. Outcome B is omitted (with a one-line reason) when an extra monthly
  payment is entered.
- **Secondary:** saving per ₹1 prepaid; when the loan ends (months, and years and months).
- **Yearly balance table**: end-of-year balance for each outcome (at most 40 rows), in a labelled,
  keyboard-focusable scroll region, with a caption and `th scope`. No chart in v1 (the site has no
  shared chart, and the table carries the same information).
- **Assumptions** listed next to the results, in plain language, and a link to the disclaimer page.
  The wording separates calculation from advice: it never says whether to prepay.

### Behaviour, states and accessibility

- Results update as the visitor types (`realtime`), with **one** concise `aria-live="polite"` summary
  line ("You save about ₹5,04,951 and finish 32 months sooner") so a screen reader is not flooded.
- Reset restores the defaults and the empty state. No copy, share, download or print in v1.
- Empty state before there is something to show; an error state (results-level message plus the
  invalid inputs linked to it); no loading state (synchronous).
- Mobile: single column, inputs first; comparison as stacked cards on narrow screens; the table scrolls
  inside its region. Keyboard order follows reading order; focus is always visible; reduced motion
  respected. Uses the shared primitives (`numberField`, `resultMetric`, `setFieldsInvalid`).

### Capabilities to declare (only when the code does them)

`reset`, `compare`, `table`, `schedule`, `multipleInputs`, `validation`, `explanation`, `examples`,
`realtime`, `localProcessing`. Everything else stays `false`: `chart`, `download`, `print`, `share`,
`copy`, `presets`, `history`, `savedState`, `urlState`, `unitSelection`, `modal`, `timer`.

### SEO and relationships

- Intent: "loan prepayment calculator" / "how much interest will I save if I prepay my loan".
  One title and one description, unique among the site's pages. Draft (finalise at build):
  title `Loan Prepayment Calculator | ToolZen Hub`; description "See how much interest a loan
  prepayment can save, and whether shortening the loan or lowering the EMI works out better."
- Breadcrumb structured data only (like the other tools). Canonical on `https://toolzenhub.in`.
- `relatedTools`: `emi`, `loan-comparison`. `relatedArticles` (strongest first): the guide, then the
  new cluster articles below.

## 3. Article cluster

Six distinct questions. The first already exists and is **not rewritten**; the rest are new. Each gets
a cluster brief (`docs/content-clusters.md`) before drafting, with numbers computed from the tool's
logic. The cluster topic segment is a decision (below).

| # | Working title | Role | Question it answers | How it differs | Links | Build |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | *What Is Loan Prepayment?* (exists) | guide | What is prepayment and how does it work? | The concept, no figures | tool; articles 1 and 2 | Existing: link it |
| 1 | Reduce Tenure or Lower the EMI After Prepaying: Which Saves More? | comparison | Same lump sum, two choices: which saves more interest, and when does lower EMI make sense? | Existing guide spends two paragraphs on the idea; this is the numbers, the reason keeping the EMI saves more, and the cash-flow trade-off | tool; 0; 2 | **Pack #1** |
| 2 | Why When You Prepay Matters: Early vs Late | examples | Does the same payment save the same interest at any point in the loan? | Timing only, with the same amount at the start, the middle and near the end | tool; 1; 3 | **Pack #1** |
| 3 | What If You Pay a Little Extra Every Month? | examples | What does a regular extra payment do to the tenure and interest? | Recurring extra payments, not a lump sum | tool; 2; the tenure article | **Pack #1** |
| 4 | Prepay Your Loan or Invest the Money? | comparison | How do I think about a guaranteed interest saving against an uncertain return? | A decision framework with stated assumptions; no return claims, no advice | tool; 1; 3 | Later: needs careful framing and review |
| 5 | Prepayment Charges and Conditions: What to Check First | mistakes | Which terms can reduce the benefit of prepaying, and how do I net them off? | A checklist tied to the tool's charge input | tool; 0 | Later: its facts depend on rules and lenders, so they must be verified first |

Also linked, not rewritten: *How to Reduce Your Home Loan Interest* (the umbrella) and *How Loan Tenure
Affects Total Interest*. Each new article links to the tool once, clearly, and to 2 to 3 siblings.

## 4. Build order for Tool Pack 01

1. Approve the decisions below and this spec.
2. Pure logic `assets/js/calculators/formulas/prepayment.js` (no DOM, no formatting).
3. Golden tests and invariants (`tests/unit/prepayment-golden.test.mjs`) with an independent reference.
4. Catalog entry: publish `prepayment` in `assets/js/data/tools.js` (loader, capabilities, SEO text,
   related ids, title decision), and `src/_data/toolStyles.json`.
5. Tool module `assets/js/calculators/prepayment/index.js`: `markup()` and `init()`, shared primitives.
6. Validation, results, comparison, yearly table, assumptions, explanation and example sections.
7. Accessibility pass (labels, errors, live summary, table region, keyboard, reduced motion).
8. SEO text and breadcrumb; confirm canonical and structured data.
9. Search: verify results and ordering; Coming Soon behaviour unchanged for the rest.
10. Relationships: tool `relatedArticles`, articles' `tools` (decision on the primary tool), `related` lists.
11. Regenerate the URL inventory; review the one new live page and sitemap URL.
12. Articles 1 to 3: briefs, content modules, images (PNG and WebP), catalog entries, relationships.
13. Browser tests (calculate, validate, reset, keyboard, error wiring, ids, both modes), accessibility
    additions, visual baselines for the new page and the listings that now show it (reviewed).
14. Update the expectations that name the published set (intentional edits).
15. Clean builds for the root and `/Toolzenhub/`; link, asset and SEO checks; fingerprint and explain.
16. Localhost verification (`docs/tool-pack-template.md`, section 10).
17. Review the diff; one local commit.

## 5. Out of scope for v1

Charts; copy, share, download or print; saved scenarios or URL state (this needs the storage and share
policy deferred in E2); an input for the user's actual EMI (lenders round and reset, so it can differ
slightly from the formula; a good later addition); floating-rate resets; daily-interest loans;
tax effects; investment comparison inside the tool (that belongs in article 4, with its assumptions).

## 6. Decisions needed before building

1. **Confirm the flagship** and retitle the catalog entry from "Prepayment Calculator" to
   "Loan Prepayment Calculator" (the id and URL do not change).
2. **Article topic segment** for the new articles: `loan-prepayment` (recommended: names the cluster;
   the existing guide stays under `loan-comparison`, because its URL cannot move) or reusing
   `loan-comparison`.
3. **Inputs:** remaining tenure in months only (recommended) or years plus months; the prepayment
   charge field in v1 (recommended) or later.
4. **Make `prepayment` the primary tool** of "What Is Loan Prepayment?" (its call to action would
   change to the new tool, which means editing a sentence in an existing article), or leave
   `loan-comparison` primary and add `prepayment` second.
5. **Tool-page article cap or order:** a tool page currently lists every article that points at it.
6. **Presentation:** whether the footer's tool links and the home page's featured tools gain the tool.
7. **Visual baselines:** accept the new page and the listings that turn a Coming Soon card into a link.
8. **Articles 4 and 5 timing** and the review they need.

## 7. Implementation notes (as built)

The tool shipped at the existing id and URL (`prepayment`, `/calculators/prepayment/`) as the "Loan Prepayment Calculator". Where the build differs from the specification above, this is what was decided and why.

| Topic | Decision |
| --- | --- |
| Prepayment charge input | **Omitted.** It does not change the mechanics (it is a subtraction from the saving), and charges vary by lender and loan type. The page states that interest saved is before any charge. |
| Recurring extra monthly payment | **Omitted** from v1: it has no closed form, adds a second scenario to every comparison and was not needed for the lump-sum question. Article 3 ("What If You Pay a Little Extra Every Month?") is deferred with it. |
| Tenure | Years and months fields, normalized to months (1 to 480) in the engine. |
| "Make the prepayment after" | Default 0 EMIs (right away), because the inputs describe the current balance. |
| EMI | Computed from balance, rate and remaining tenure; there is no "actual EMI" input. |
| Prepayment at or above the balance | Allowed; treated as clearing the loan. Lowering the EMI is then not applicable. |
| Visualization | No chart. A yearly balance table plus three comparison cards. |
| Articles | Published: articles 1 and 2 of the cluster. Deferred: article 3 (above) and the rule-dependent articles 4 and 5. |
| Tool page articles | The tool's curated `relatedArticles` list is shown as written (four), not padded. |

Timing convention: a prepayment "after k EMIs" is applied immediately after EMI k (k = 0 means before the next EMI). The engine is `assets/js/calculators/formulas/prepayment.js`; its expected values come from the independent reference `tests/fixtures/prepayment-golden.py` (Python `decimal`, closed form and simulation required to agree) and are asserted in `tests/unit/prepayment-golden.test.mjs`.

## 8. Refinement pass

**Repayment schedule.** The first build showed only the balance at the end of each year, for the three outcomes side by side. That says how fast the balance falls but not what each year costs or where the prepayment lands, so it is replaced by a schedule that answers "what changes in my remaining loan?":

- A native radio group chooses the outcome: without prepayment, prepay and keep the EMI (the default), prepay and lower the EMI. The choice survives recalculation, and Reset returns to the default.
- The default view is by year (opening balance, EMIs paid, interest, principal, prepayment, closing balance). A "Show month-by-month detail" button opens the monthly rows in a box that scrolls on its own, so the page never gets hundreds of rows by default.
- `buildSchedule` and `summarizeByYear` in `formulas/prepayment.js` build the rows from the EMIs `calculatePrepayment` already worked out. No existing formula changed. Tests tie the rows to the independent reference (year-end balances, total interest, everything repaid, the prepayment in month k only; a prepayment before the first EMI is a "Start" row in year 1).
- The comparison cards gained "Time saved" (keep EMI) and "EMI change" (lower EMI). The three-way balance table is gone: the schedule's closing-balance column replaces it.

**Buttons.** The shared calculator buttons had no keyboard focus style of their own. `.calculator-form__button:focus-visible` now uses the site's existing focus ring (2px brand green, 2px offset) in `base/accessibility.css`, which also covers the EMI and Loan Comparison buttons. Reset stays the secondary button (the results update live, so there is no primary action). The monthly toggle reuses the shared secondary button style.

**Export: CSV and print (added after the refinement pass).** The schedule is an estimate for one "what if", so the export is deliberately plain. "Download CSV" saves the schedule that is selected (`prepayment/export.js`, native `Blob`, nothing leaves the browser): columns Period, Opening Balance, Payment, Principal, Interest, Prepayment, Closing Balance; plain two-decimal numbers (no rupee signs); a "Start" row for a prepayment before the first EMI; UTF-8 with a byte order mark and CRLF line ends; file names such as `loan-prepayment-keep-emi-schedule.csv`. "Print Summary" calls `window.print()`; print CSS in `prepayment.css` leaves out the site header and footer, form, guide text, related content and buttons, and prints the entered loan, the result, the comparison and the selected schedule. No PDF engine is built: the browser's "Save as PDF" does that.

**Imagery.** The two new article images are plain charts built from the engine's own numbers, with no text, people or stock-style art. Older imagery that deserves a visual-quality cleanup later (not changed here): the five hero PNGs `what-is-loan-prepayment`, `emi-vs-total-interest`, `fixed-vs-floating-interest-rates`, `how-to-reduce-home-loan-interest` and `loan-tenure-total-interest`. They read as generated infographics with in-image text and are 1.1 to 1.3 MB each. The generic Unsplash card images on the article listing are also stock-looking.


## 9. Design quality pass (DQ1)

Fixed in the shared layer, so EMI, Loan Comparison and Loan Prepayment (and every future tool) agree. The rules are in `docs/tool-pack-template.md` ("Visual quality rules").

- **Buttons.** Secondary buttons were flat light grey (EMI, Loan Prepayment) or grey text with no outline (Loan Comparison's Reset), which read as disabled. There is now one definition in `components/buttons.css`: primary solid action green (#087f47, white text 5.08:1; the brand green #0b9f58 is only 3.43:1 and is not used inside controls), secondary white with an action-green outline and text, disabled flat grey with a not-allowed cursor. Hover and pressed states were measured too (`tests/unit/button-contrast.test.mjs`). Loan Comparison's own blue `loan-primary-button` and `loan-reset-button` (and its schedule dialog buttons) now use the shared classes, so its primary button is the same action green as the other tools.
- **Headings.** Section titles on EMI and Loan Prepayment get the short green rule; sub-section titles get a divider and a clearer size; Loan Comparison's "Things to Consider" and "FAQs" were sized by the browser default (about 44px, with an emoji) and now match the other information titles (19px).
- **Focus.** The green focus ring now also covers Loan Comparison's schedule link and the dialog close button.
- **Images.** Audit of the images the three tools' pages and articles use:

| Image | Class | Decision |
| --- | --- | --- |
| `reduce-tenure-or-lower-emi-after-prepayment`, `early-vs-late-loan-prepayment` (hero) | A, chart from the engine | kept |
| `what-is-loan-prepayment` (hero) | C, generic AI illustration with pseudo-text | replaced by a balance chart (with and without one prepayment) |
| `emi-vs-total-interest` (hero) | C | replaced by a chart: EMI falls, total interest rises with tenure |
| `how-to-reduce-home-loan-interest` (hero) | C | replaced by a bar chart: total interest as it is, with a prepayment, a shorter tenure, a lower rate |
| `loan-tenure-total-interest` (hero) | C and mismatched (it showed a "prepayment effect" scene) | replaced by stacked bars: principal and interest for tenures of 10 to 30 years |
| `fixed-vs-floating-interest-rates` (hero) | C | replaced by an illustrative diagram, with no numbers: a flat fixed rate against a floating rate that moves in steps (the alt text says it is illustrative) |
| Unsplash card images on article cards | B, stock photos, loosely related | kept (hotlinked; a later visual-content pass could replace them with local charts) |

The EMI page itself has no imagery. The new charts are PNG plus WebP, about 4 to 29 KB each, replacing images of 1.1 to 1.3 MB.
