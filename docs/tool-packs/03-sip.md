# Tool Pack 03: SIP Calculator

Status: draft (planning only, not implemented, not approved for build)      Base commit: df994d6
Reserved id and slug: `sip` (route `/calculators/sip/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; the lifecycle and gate are in `docs/tool-pack-factory.md`.

**After Tool Pack 3 is implemented, review the repeated mechanical work across Packs 1 to 3 and decide whether a
limited scaffolding generator is now justified** (`docs/tool-pack-factory.md`, section 9). Also at that point
decide whether the print CSS and the comparison-card CSS, now used a third time, should become shared styles
(see section 24). Do neither during the build.

## Selection record

### Candidates (the real catalog)

Published today: Loan Comparison, EMI, Loan Prepayment, Loan Balance Transfer (all Loans). Every other entry is
Coming Soon. Reserved entries outside Loans, all in the Calculators section:

| Category | Entries (id) |
| --- | --- |
| Investment | SIP Calculator (`sip`), PPF Calculator (`ppf`), FD Calculator (`fd`), CAGR Calculator (`cagr`) |
| Tax | GST Calculator (`gst`), Income Tax Calculator (`income-tax`) |
| Business | Profit Calculator (`profit`), Margin Calculator (`margin`), ROI Calculator (`roi`) |
| Health | BMI (`bmi`), Calorie (`calorie`), BMR (`bmr`) |
| Math | Percentage (`percentage`), Ratio (`ratio`), Age (`age`) |
| Converter | Unit Converter (`unit-converter`), Currency Converter (`currency`), Date Calculator (`date`) |

There are no catalog entries for a step-up SIP, a lump-sum or an investment-goal calculator, so those are
treated as capabilities of the SIP entry, not as separate tools.

Levels are qualitative (HIGH / MEDIUM / LOW) and describe the candidate as the first flagship of its category.

| Candidate | Pain | Repeat use | Search / commercial intent | Decision support | Differentiation | Cluster potential | Feasibility | Maintenance and rule risk | Generic-3-field risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **SIP** (`sip`, Investment) | HIGH | HIGH (revisited as goals change) | HIGH / HIGH | HIGH (how much, for how long, what if returns differ) | MEDIUM to HIGH, **if** scoped to step-up, scenarios and a target | HIGH | HIGH, no new platform code | LOW: the return is a user assumption; no live data or rules | MEDIUM: real unless scoped as below |
| FD (`fd`, Investment) | MEDIUM | LOW to MEDIUM | MEDIUM / MEDIUM | LOW to MEDIUM | LOW (one formula) | LOW | HIGH | MEDIUM (rates change; tax on interest) | HIGH |
| PPF (`ppf`, Investment) | MEDIUM | LOW to MEDIUM | MEDIUM / LOW | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | **HIGH** (a government-set rate, deposit limit and lock-in rules change) | MEDIUM |
| CAGR (`cagr`, Investment) | MEDIUM | MEDIUM | MEDIUM / LOW | MEDIUM | LOW | LOW to MEDIUM | HIGH | LOW | HIGH |
| ROI (`roi`, Business) | MEDIUM | MEDIUM | MEDIUM / MEDIUM | LOW | LOW | LOW | HIGH | LOW | HIGH |
| Income Tax (`income-tax`, Tax) | HIGH | HIGH (yearly) | HIGH / HIGH | HIGH | MEDIUM | HIGH | MEDIUM | **VERY HIGH** (slabs, regimes, deductions and years must be maintained; a wrong answer is costly) | LOW |
| GST (`gst`, Tax) | MEDIUM | MEDIUM | HIGH / MEDIUM | LOW | LOW | LOW to MEDIUM | HIGH | MEDIUM (rates and categories change) | HIGH |
| Margin / Profit (`margin`, `profit`, Business) | MEDIUM | MEDIUM | MEDIUM / MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH | LOW | HIGH |

Screened out as first flagships: Health (BMI, Calorie, BMR: sensitive, generic formulas), Math and Converter
tools (generic utilities; Currency needs live data), and the Loans-category Interest Calculator (a loans entry,
and a plain simple-and-compound formula).

### Why SIP

- It is the only second-category candidate with high pain, high repeat use, high search intent and **no rule or
  live data the site must maintain**. Income Tax has the pain but not the maintainability; PPF is rule-bound;
  FD, CAGR, ROI, GST and Margin are the "three fields in, one number out" calculators that would not show the
  standard.
- It proves category independence with the least new platform code. The category exists in the taxonomy; a
  category without a landing page already works (its breadcrumb and card link to `categories.html#investment`),
  so no Investment landing page is needed yet. The architecture needs one new pure module, one tool module and
  the shared pieces already used by Packs 1 and 2.
- The differentiator is real if the scope is held: a step-up option, return scenarios, a target, and a view of
  how much is your money and how much is assumed growth. Without those it would be amount, rate and years in,
  future value out, which the site should not ship.
- It starts the Investment cluster and gives later tools (FD, PPF, CAGR) a trust pattern and a projection table
  to follow.

### What makes it more than "amount + rate + years = future value"

1. **Your money against assumed growth, over time** (a chart and a year table).
2. **Return scenarios**: the same plan at a lower and a higher assumed return, so the range is visible.
3. **Step-up**: raising the monthly amount once a year, which changes the result more than most people expect.
4. **A target**: the monthly amount that a target needs, and whether the plan reaches it.

### Essential v1, useful optional, deferred

- **Essential v1:** the projection (monthly amount, assumed return, period), your total investment against the
  estimated growth, the optional annual step-up, the three return scenarios, the year-by-year table and the
  chart, Reset.
- **Useful optional, included only as one optional field:** a target amount, answering "how much per month would
  I need?" and "does this plan reach it?". It is linear in the monthly amount, so it needs no extra model.
  Print Summary is also included (native print).
- **Deferred:** inflation-adjusted value (an extra assumption; its article waits with it), CSV, a lump-sum
  addition, taxes, fund charges and exit loads, actual-return (XIRR) analysis, paused or skipped months,
  different compounding conventions, any live fund or market data.

## Trust standard for projections (applies to this and every Investment tool)

An investment projection is a different promise from a loan calculation: nothing here is certain.

- **Name the three things apart, always:** what you put in (your contributions), the **assumed** annual return
  (an input, never presented as expected), and the **estimated** value that follows.
- **Use these words:** assumed return, estimated value, estimated growth, projection, scenario.
- **Never use:** guaranteed, expected profit stated as certain, "you will earn", "returns of X%" as a fact, a
  recommendation, a "best" rate, or a default described as typical.
- **On the page, next to the result:** "This is a projection based on a return you assume. Returns are not
  guaranteed, can be lower than assumed and can be negative. Investments are subject to market risk." And: "It
  does not include taxes, fund charges, exit loads or inflation." And: "This is not advice and ToolZen Hub
  does not recommend any investment."
- **Defaults are examples, not forecasts:** the default return (10%) is an example, not a forecast, and the
  page says so; the scenarios exist so no single rate is read as the answer.
- **Scenario framing:** scenarios are "if returns are lower / as assumed / higher", never "worst / best case".
- **No data from the visitor leaves the browser**, as for every tool.

## Spec

### 1. Tool identity
SIP Calculator; `sip`; Calculators, Investment; no subcategory; `toolType` calculator. Display title kept as the
catalog's "SIP Calculator" (it is the name people search for). Description: "Estimate what a monthly SIP could
grow to for a return you assume, with a yearly step-up, return scenarios and a target." Aliases (true names):
"systematic investment plan", "step-up sip".

### 2. User problem
Someone planning to invest a fixed amount every month, or to reach a goal, wants to see what it could become and
how sensitive that is to the return they assume. Today they use a calculator that returns one number for one
rate, which hides how much of it is their own money, how much depends on the assumption, and what raising the
amount each year would do.

### 3. Jobs to be done
- What could my SIP grow to, and how much of that is my own money?
- How different is the result if returns are lower or higher than I assume?
- What if I raise my SIP every year?
- How much per month would I need to reach a target, and does my plan reach it?

### 4. Target users
People planning regular monthly investing. Not a tool for choosing a fund, forecasting returns, comparing
products or computing tax.

### 5. Inputs
| Field | Unit | Default | Limits | Note |
| --- | --- | --- | --- | --- |
| Monthly SIP amount | ₹ | 10,000 | 100 to 10,00,000 | the first year's monthly amount |
| Assumed annual return | % a year | 10 | 0 to 30 | "an assumption you control, not a forecast"; 0 is allowed |
| Investment period | years + months | 15 y 0 m | 1 to 480 months | as in the Prepayment and Transfer tools |
| Yearly step-up (optional) | % | 0 | 0 to 50 | raises the monthly amount once a year; 0 keeps it fixed |
| Target amount (optional) | ₹ | blank | 10,000 to 100,00,00,000 | blank means no target |

Empty handling differs from the loan tools in one place: an emptied **required** field shows the prompt (as
elsewhere), but the optional target may be blank. Left out of v1: inflation, a starting lump sum, tax, charges,
a month-by-month schedule, any live data.

### 6. Outputs
- **Primary:** the estimated value at the end of the period (a projection, in the headline label).
- **Supporting:** what you would invest in total; the estimated growth; the estimated value as a multiple of
  what you invest.
- **Scenarios:** the estimated value and growth at the assumed return minus 2 points and plus 2 points, beside
  the assumed return (the lower is clipped at 0%, the higher at 30%; a scenario equal to the assumption is
  not repeated).
- **Target (only if entered):** whether the plan reaches it (by how much, or the shortfall), and the monthly
  amount that would be needed at the assumed return, with the same step-up.
- **Chart and table:** what you have invested against the estimated value, year by year.
- Not shown: advice, a recommended rate or amount, a "best" case, any tax or inflation figure.

### 7. Model rules
- Monthly rate i = assumed annual return ÷ 12 ÷ 100 (the convention most SIP calculators use; the page states it
  and notes that calculators using an effective annual rate differ slightly). **Decision to confirm at approval:**
  this nominal convention (reproducible against other calculators) against an effective-annual-rate convention
  (`(1 + r)^(1/12) − 1`, closer to an "annualised return"). This spec recommends the nominal one.
- The SIP is invested at the **start** of each month and grows for that month; the value is read at the end of
  the last month. With a fixed amount P over n months:
  value = P × ((1 + i)^n − 1) ÷ i × (1 + i); at i = 0 the value is P × n.
- Step-up s%: the monthly amount for months 1 to 12 is P, for months 13 to 24 it is P × (1 + s/100), and so on,
  raised once at the start of each year of the plan. Total invested is the sum of all monthly amounts.
- Estimated growth = estimated value − total invested. Nothing is rounded in the model; callers round for display.
- Required starting amount for a target T: the estimated value is linear in P, so P_needed = T ÷ (the value of a
  ₹1 SIP under the same rate, period and step-up).
- Scenarios are the same calculation at the other rates.
- Independent verification: a Python `decimal` reference that simulates the balance month by month
  (balance = (balance + payment) × (1 + i)), with the closed form asserted equal wherever it exists (no
  step-up), and the target answer cross-checked by feeding P_needed back in.

### 8. Assumptions (shown on the page)
The return is an assumption you enter and is applied evenly every month; real returns vary and can be negative.
The SIP is invested at the start of each month and every instalment is made. The step-up happens once a year. No
taxes, fund charges, exit loads or inflation are included. Calculators can use different conventions, so another
calculator's figure may differ slightly. It is a projection for understanding, not advice and not a forecast.

### 9. Edge cases
- Return 0%: value equals what you invest; growth 0; scenarios of 0% and +2 only (the lower is clipped).
- Return at the upper limit (30%) with the +2 scenario clipped.
- Period of 1 month, 11 months (a partial first year), and 480 months.
- Step-up 0 (identical to the plain SIP) and 50%.
- Target: met comfortably, met exactly, missed; a target smaller than what you invest; a target of 0 or blank.
- Very small amounts and the largest amounts (no overflow, formatting stays readable).
- A final partial year in the table and chart (labelled, as in the Transfer tool).

### 10. Validation
Limits as in section 5, with tool-owned messages in the style of the other tools and the shared field helpers for
linked errors. Years 0 to 40 and months 0 to 11 as whole numbers, total 1 to 480 months. Step-up and return may
be decimal. A cleared required field shows the prompt; a cleared target is "no target"; a target outside its
limits is an error on that field.

### 11. UX flow
Intro, then one form (monthly amount, assumed return, period, step-up, optional target), live results (no
Calculate button), Reset. Then the result summary, the scenarios, the target block (if any), the chart, the
yearly table, Print Summary; then how to use, the assumptions and the trust wording, an example, how it is
calculated, and the FAQ. No primary button. Shared fields, result helpers, buttons and headings only.

### 12. Result hierarchy
First: the estimated value (labelled as a projection), with your total investment and the estimated growth.
Second: the scenarios, so the single figure is never read alone. Third: the target block. Fourth: the chart.
Fifth: the yearly table. An unfavourable target result (a shortfall) uses the same layout and neutral wording.

### 13. Comparison, table and schedule decision
**Scenario cards: needed** (three; they are the honesty feature). **Yearly table: needed** (year, monthly SIP in
that year, total invested so far, estimated value, estimated growth). It carries the step-up (the monthly amount
changes by year) and is the accessible equivalent of the chart. **Monthly detail: NOT NEEDED** (up to 480
rows with no decision in them).

### 14. Chart decision
**Needed, one chart.** Total invested against estimated value over the years shows what the cards and the table
do not: the gap that compounding opens, and how it accelerates late in the period. Built natively (an inline SVG
drawn from the same numbers as the table; no chart library). It has a text alternative (the table beside it and a
one-sentence `aria-label` summary), distinguishes the two lines by style as well as colour, is labelled
(legend, start and end values) and prints. No decorative chart, no animation, no extra chart for the scenarios.

### 15. Export decision
**CSV: NOT NEEDED.** The table has at most 40 rows and a projection built on an assumption is not a record to
keep. Revisit with user evidence.

### 16. Print decision
**Print Summary: needed** (a plan is often shared with a partner or an adviser). Native browser print, no PDF
engine. Prints the inputs, the assumption wording, the result, the scenarios, the target block, the chart and the
yearly table; hides the site chrome, the form and the buttons. This is the third use of the print pattern: see
section 24.

### 17. Mobile behaviour
Single column fields with the period pair side by side; the result cards and scenarios stack; the chart scales to
the width (a fixed viewBox, no sideways scroll) and keeps its labels readable; the table scrolls in a labelled
region with a sticky first column; the action row wraps with at least 36px tap targets.

### 18. Accessibility requirements
Labelled fields with linked hints and errors (`aria-invalid`, `aria-describedby`); a polite live region with one
sentence; the chart is `role="img"` with a text summary and the table as its equivalent; the lines differ by
dash and marker as well as colour; table caption and `scope`; the target result is stated in words; contrast of
the chart strokes at least 3:1 and of every text at 4.5:1; focus ring from the shared layer; reduced motion (no
animation to begin with); Print Summary reachable by keyboard.

### 19. Search keywords and aliases
Aliases "systematic investment plan" and "step-up sip" (both true names for what the tool does). Queries to check:
"sip", "systematic investment plan", "step up", "monthly investment". Search for "sip" currently finds the
Investment category and the Coming Soon placeholder; it must find the tool first afterwards.

### 20. Related calculators
None in v1 by category (the other Investment tools are Coming Soon, so the category fallback finds nothing).
Add related tools only as they exist: FD and PPF (compare an assumed return with a deposit rate), CAGR (turn a
past result into an assumed rate). A cross-category link to the Loan Prepayment Calculator belongs only with a
published article that compares the two (see section 21).

### 21. Article cluster
Build only what is ready and distinct; no forced count; none of these depends on a rule or a live rate.
1. **How a SIP grows: your money against assumed growth** (explanation): compounding, why the gap widens late,
   with the chart's numbers.
2. **What a higher or lower return does to your SIP** (interpretation): the three scenarios on one plan, and
   why a single rate should not be read as the answer.
3. **Step-up SIP: what raising your SIP every year does** (scenario): flat against stepped, same start.
4. **How much SIP do you need for a goal?** (decision guide): the target block, with a shortfall and a met case.
Candidate, build only with careful non-advice framing: **a SIP against paying down a loan** (a cross-category
scenario using the Prepayment engine's interest saved against an assumed SIP value; it compares a known saving
with an assumption and must say so). Deferred: inflation and the real value of a target (needs the deferred
inflation field), taxes on mutual-fund gains and anything about a scheme's rules (dated sources needed). The
existing Coming Soon placeholder "Best SIP Strategies for Beginners" (article id 7) is advice-shaped and vague:
it stays Coming Soon and is not built as written; retire or replace it with a real brief at build time.

### 22. Imagery plan
Each from the engine's numbers, no text, no stock art: (1) two lines, total invested and estimated value, the gap
widening; (2) three lines for the lower, assumed and higher return that fan out from the same start; (3) a
stepped monthly amount against a flat one with the two resulting values; (4) the estimated value line against a
target line, showing a shortfall. PNG plus WebP, descriptive alt text; the tool page itself needs no image.

### 23. SEO plan
Title "SIP Calculator | ToolZen Hub"; a description about the estimated value, the step-up, the scenarios and the
target, with the words "assumed" or "estimate"; canonical `https://toolzenhub.in/calculators/sip/`; one H1;
breadcrumb structured data (generated; the category crumb goes to `categories.html#investment`); the form,
example and FAQ in the static HTML; no pages for keyword variations. No structured data for content not shown.

### 24. Performance constraints
Tool JS about 11 KB gzipped or less including the formulas and the chart, tool CSS about 2.5 KB, shared styles
reused, no new dependency, loaded only on its own page.
**Shared-style decision (the third use):** the comparison cards and the print CSS now exist in two tools. Only
**after** the SIP implementation is finished, compare them with the SIP versions and, if they are truly the same,
extract them into shared stylesheets in a **separate** refinement commit with no visual change to the Prepayment
and Balance Transfer pages (their baselines must pass unchanged). Do not extract anything inside the SIP build.

### 25. Tests
- **Unit:** golden scenarios from the independent reference; invariants (value rises with the amount, the return,
  the period and the step-up; value at 0% equals the amount invested; a step-up of 0 equals the plain SIP;
  growth is never negative at a return of 0 or more; the closed form equals the month-by-month simulation;
  P_needed fed back gives the target; scenarios are ordered); validation, tolerances and the optional target;
  the catalog entry; relationships.
- **Starting scenarios** (illustrative planning figures worked out with a separate month-by-month simulation;
  the implementation must **re-derive** them independently). Monthly rate = annual ÷ 12, SIP at the start of
  each month:
  - Ordinary: ₹10,000 a month at 10% for 15 years: invested ₹18,00,000, estimated value ₹41,79,242.66,
    growth ₹23,79,242.66 (2.32 times). Scenarios: 8% gives ₹34,83,451.43 and 12% gives ₹50,45,760.00.
  - Zero return: ₹5,000 at 0% for 10 years: invested and value both ₹6,00,000, growth 0.
  - Short: ₹5,000 at 8% for 12 months: value ₹62,664.63, growth ₹2,664.63. One month of ₹10,000 at 10%: value
    ₹10,083.33.
  - High assumed return: ₹10,000 at 30% for 10 years: invested ₹12,00,000, value ₹75,26,841.43 (6.27 times).
  - Long: ₹1,000 at 10% for 40 years: invested ₹4,80,000, value ₹63,76,780.24.
  - Step-up: ₹10,000 at 10% for 15 years with a 10% yearly step-up: invested ₹38,12,697.80, value
    ₹74,37,840.10. With a 5% step-up for 20 years: invested ₹39,67,914.49, value ₹1,08,25,699.99.
  - Target: ₹1,00,00,000 for the ordinary plan misses by ₹58,20,757.34 and needs about ₹23,927.78 a month; for
    the 10% step-up plan it misses by ₹25,62,159.90 and needs a first-year SIP of about ₹13,444.76.
- **Browser:** live results, each scenario, the step-up, the target states (none, met, missed), the chart's
  accessible name and its data, validation and linked errors, the optional target, reset, keyboard, print summary
  calls print, mobile layout, search by name and aliases, related content, the home page card.
- **Accessibility spec entries; visual baselines** for the new page and every page that changes (see below).
- **The suite uses SIP as its "Coming Soon tool" example in many places.** Publishing it is an intentional edit of
  those tests, which switch to another Coming Soon entry (PPF is also Investment) and keep every assertion
  they make: `tests/unit/catalog.test.mjs`, `relationships.test.mjs`, `search.test.mjs`, `taxonomy.test.mjs`,
  `static-checkers.test.mjs` (the mutation that publishes a Coming Soon tool), `tests/browser/navigation.spec.js`
  and `notfound.spec.js`. The Coming Soon article placeholder (id 7) is unaffected.
- **Visible side effects to review:** the **Home page's Popular Calculators list already contains SIP**, so its
  card becomes a live link (the home page baselines and the "Coming Soon cards" count change); the Categories,
  All Calculators and search results; the Investment category card. The Loans pages, the footer links and the
  other tools do not change.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: CSV (section 15), monthly detail (section 13), related
tools in v1 (section 20), an Investment landing page (the category already works without one; create it when it
has at least two published tools).

### 27. Deferred items
Any recommendation, ranking or comparison of funds (never in scope); inflation-adjusted value and its article; CSV; a lump-sum addition; taxes, charges and exit loads; XIRR or
actual-return analysis; paused months; other compounding conventions; related tools until FD, PPF or CAGR
exist; an Investment landing page; the SIP-against-loan article unless framed carefully; rule-dependent
articles. Revisit each with user evidence or a verified, dated rule.

### 28. Commit checkpoint
Commit subject: `feat: add sip calculator and content cluster`. Afterwards run the exact-tree verification
(`docs/tool-pack-factory.md`, section 8), one Playwright project and spec at a time with `--workers=1` on this
laptop, with no stale `npm run dev` servers running (they write to `dist` while tests run). Do not push.

## Future category relationships (planning only; nothing here is activated)
- **Investment:** FD and PPF (an assumed SIP return against a deposit or scheme rate), CAGR (a past result turned
  into an assumed return for the SIP), and a future lump-sum or goal tool built on the same projection module.
- **Math:** Percentage (a step-up or return as a percentage) as an occasional internal link.
- **Loans:** Loan Prepayment (prepaying a loan against investing, the cross-category article above).
- **Converter:** none.
