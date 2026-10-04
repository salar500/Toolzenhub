# Tool Pack 05: Profit Calculator (profit and break-even for a period)

Status: built and verified (commit pending)      Base commit: 0815e3c
Reserved id and slug: `profit` (route `/calculators/profit/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in
`docs/tool-pack-reuse-review.md`; the previous packs are `03-sip.md` and `04-margin.md`.

Build with the current proven architecture only. **Do not** build a generator, extract the compare-card or print CSS,
add a shared controller or add a framework in this pack; observe repetition and record it.

## Selection record

### Candidates (the real catalog, read from `assets/js/data/tools.js`)

Published (6): Loan Comparison, EMI, Loan Prepayment, Loan Balance Transfer (Loans), SIP (Investment), Margin (Business).
Coming Soon (20), all in the Calculators section:

| Category | Entries (id) |
| --- | --- |
| Loans | Home Loan (`home-loan`), Personal Loan (`personal-loan`), Loan Eligibility (`loan-eligibility`), Interest (`interest`) |
| Investment | PPF (`ppf`), FD (`fd`), CAGR (`cagr`) |
| Tax | GST (`gst`), Income Tax (`income-tax`) |
| Business | Profit (`profit`), ROI (`roi`) |
| Health | BMI (`bmi`), Calorie (`calorie`), BMR (`bmr`) |
| Math | Percentage (`percentage`), Ratio (`ratio`), Age (`age`) |
| Converter | Unit Converter (`unit-converter`), Currency (`currency`), Date (`date`) |

### Strategic direction

**Deepen a proven category: Business.** Margin was built as a per-unit pricing tool and *deliberately* left out fixed
costs, business-wide profit and break-even (its spec, section 27, says "if a request needs those, it is a case for
those tools"). Those are the next questions the same user asks: "I set the price, what do I actually earn this month,
and how many sales do I need?". That is a real follow-up, not a tool added for its category: the visitor who prices a
product with Margin returns with the cost and price in hand. A new category (Tax, Health) would add architecture
breadth but, for the reasons below, not better products; a second Investment tool (CAGR) or a Loans tool would repeat a
pattern that already has a flagship.

### Candidates seriously evaluated

HIGH / MEDIUM / LOW; qualitative. For maintenance, rule risk, live data, generic risk and trust complexity, lower is better.

| Candidate | Pain | Repeat use | Decision value | Differentiation | Search / commercial | Links and cluster | Feasibility | Maintenance | Rule risk | Live data | Generic risk | Trust complexity | Mobile UX | Flagship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Profit** (Business) | HIGH | HIGH (every month, product or price change) | HIGH | HIGH if scoped to break-even, a target and "what if" | HIGH / HIGH | HIGH (Margin both ways, a Business cluster) | HIGH | LOW | NONE | NONE | MEDIUM (LOW as scoped) | LOW | HIGH | **HIGH** |
| CAGR (Investment) | MEDIUM | MEDIUM | MEDIUM | MEDIUM (required CAGR, future value) | MEDIUM / LOW | MEDIUM (SIP's assumed return) | HIGH | LOW | NONE | NONE | HIGH | LOW | HIGH | MEDIUM |
| ROI (Business) | MEDIUM | MEDIUM | MEDIUM | MEDIUM (payback is a different idea) | MEDIUM / MEDIUM | MEDIUM | HIGH | LOW | NONE | NONE | HIGH | LOW to MEDIUM | HIGH | LOW to MEDIUM |
| FD (Investment) | MEDIUM | LOW to MEDIUM | LOW to MEDIUM | LOW | MEDIUM / MEDIUM | LOW | HIGH | MEDIUM (rates, tax on interest) | MEDIUM | NONE | HIGH | MEDIUM | HIGH | LOW |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM / LOW | MEDIUM | MEDIUM | HIGH (rate, limits, lock-in) | HIGH | NONE | MEDIUM | HIGH | HIGH | MEDIUM |
| GST (Tax) | MEDIUM | MEDIUM | LOW | LOW | HIGH / MEDIUM | LOW to MEDIUM | HIGH | MEDIUM to HIGH | MEDIUM to HIGH | NONE | HIGH | MEDIUM | HIGH | LOW |
| Income Tax (Tax) | HIGH | HIGH (yearly) | HIGH | MEDIUM | HIGH / HIGH | HIGH | MEDIUM | **VERY HIGH** (slabs, regimes, years) | **VERY HIGH** | NONE | LOW | **HIGH** | MEDIUM | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH / LOW | LOW | HIGH | LOW | MEDIUM (formula choice) | NONE | HIGH | **HIGH** (it can read as diagnosis) | HIGH | LOW |
| Percentage, Ratio (Math) | LOW to MEDIUM | LOW | LOW | LOW | HIGH / LOW | LOW | HIGH | LOW | NONE | NONE | VERY HIGH | LOW | HIGH | LOW |
| Age, Date (Converter/Math) | LOW | LOW (once) | LOW | LOW | HIGH / LOW | LOW | HIGH | LOW | NONE | NONE | HIGH | LOW | HIGH | LOW |
| Unit, Currency (Converter) | LOW to MEDIUM | LOW (Currency: MEDIUM) | LOW | LOW | HIGH / LOW | LOW | HIGH (Currency: live rates) | LOW (Currency: HIGH) | NONE | NONE (Currency: YES) | VERY HIGH | LOW | HIGH | LOW |
| Home Loan, Personal Loan (Loans) | MEDIUM | LOW | LOW | LOW (EMI already live) | HIGH / HIGH | LOW | HIGH | LOW | LOW | NONE | HIGH (duplicate of EMI) | LOW | HIGH | LOW |
| Loan Eligibility, Interest (Loans) | MEDIUM | LOW | LOW | LOW | HIGH / MEDIUM | LOW | MEDIUM | HIGH (lender rules) / LOW | HIGH / NONE | NONE | MEDIUM / HIGH | HIGH / LOW | HIGH | LOW |

### Rejected as Pack 5 flagships

- **Tax (Income Tax, GST):** Income Tax has the pain and the repeat use but slabs, regimes, deductions and years change and a wrong
  figure is costly; there is no credible update strategy yet. GST is a one-formula tool until rates and categories are
  added, and then it is rule-dependent.
- **Health (BMI, BMR, Calorie):** a band or a number that can be read as a diagnosis, formula and demographic choices
  that change the answer, and little decision value; the trust model is not strong.
- **Math and Converter (Percentage, Ratio, Age, Date, Unit, Currency):** extremely commoditized, one obvious answer, used
  once. Currency needs live rates (a maintained feed). They may be worthwhile later as utilities; they would not make
  Pack 5 a stronger product.
- **Loans (Home Loan, Personal Loan, Loan Eligibility, Interest):** Home and Personal Loan repeat EMI; Eligibility is
  lender-rule driven; Interest is a generic formula. They stay Coming Soon, unchanged.
- **FD:** one formula; the only extras (tax on interest, rates) are rule-bound. **PPF:** a government rate, limits and
  lock-in rules to maintain.

### Why Profit wins

1. **A natural continuation of Margin.** Margin ends where a business owner's real question begins: price and unit cost are
   known; what is the profit for the month, and how many sales cover the fixed costs? Profit answers that, and the two tools
   link both ways, so a user moves from "what do I charge" to "what do I earn".
2. **Repeat use is built into the job.** A seller re-runs it every month, for every product or service, and whenever a
   price, a supplier cost, rent or volume changes.
3. **It is a decision tool, not a subtraction.** Revenue minus costs is one line; the value is the break-even point, the
   units a target profit needs, and a "what if" table that shows which lever (price, cost, volume, fixed costs) moves profit
   most.
4. **No rule, rate or live data.** Everything is the visitor's own numbers; nothing can go stale. Maintenance is the code.
5. **Distinct from Margin and from ROI** (see "Boundaries").
6. **A real article cluster** (break-even, which lever matters, units for a target) that does not depend on a benchmark or a
   rule.

### Why the runner-up loses (CAGR)

CAGR is cheap and links to SIP (a past result turned into an assumed return), but it stays "start, end, years in; one rate
out". Its strongest extras (a required CAGR for a goal, a future value) are modest, and a user rarely returns for it. It
deepens a category whose flagship is already live. It remains the best Investment candidate for a later pack.

### Answers to the user-perspective filter

- **Who:** a small seller, shop owner, freelancer or small manufacturer who knows a price, a per-unit cost, their monthly
  fixed costs and roughly how much they sell. Not an accountant preparing statements, and not a business-planning suite.
- **When:** at the start or end of a month, when costs or prices change, when considering a new product or service, a new
  rent, or a hire paid as a fixed cost.
- **Job:** understand what the business actually earns for a period, how many sales it needs to cover fixed costs, what a
  target profit needs, and which change matters most.
- **Pain if wrong:** selling at a price that never covers the fixed costs, or setting a volume target that earns nothing.
- **Return:** monthly re-runs and what-if changes for each product or service (changing assumptions).
- **Differentiator:** break-even units (rounded up to whole units), a target-profit solve, margin of safety, and a table that
  ranks the four levers, with plain wording and no benchmarks.
- **Trust and assumptions:** constant price and unit cost, every unit sold at that price, fixed costs unchanged across the
  range, no tax; a calculation, not an accounting profit or a forecast.
- **Maintenance:** none beyond the code; nothing silently outdates.
- **Fit:** Margin (the price and unit cost come from there), the future ROI, Percentage and GST tools, and the Business
  articles.

## Boundaries (the shared vocabulary of the three Business tools)

- **Margin (live):** one unit. A price, a target margin or markup; margin and markup together; a cost change; a discount.
  No fixed costs, no volumes beyond a ratio.
- **Profit (this pack):** one product or service for a **period**. Price per unit, variable cost per unit, fixed costs and
  units sold give profit, the break-even point, a target and a what-if. It uses "contribution per unit" (price minus
  variable cost). It does not set a price from a margin (Margin does) and does not judge an investment (ROI will).
- **ROI (future):** a gain against an amount invested, and payback. Profit must not grow into it: no investment, no payback
  period, no return percentage on capital.
- **Not in Profit:** several products at once, a full profit-and-loss statement, tax or GST, depreciation, interest, loans,
  stock, cash flow, seasonality, forecasting.

## Retention without accounts

Every re-run is a new set of numbers typed in seconds; the tool opens with the previous example's shape, not a blank
page. No history, login, saved cases, cloud, notifications or local persistence in v1 (a visitor with several products
types each in turn; see section 27 for the condition to revisit).

## Trust standard

- **Facts the visitor enters:** the price per unit, the variable cost per unit, the fixed costs for the period, the units
  sold. **Assumptions:** that the price and the unit cost are the same for every unit; that every unit is sold at that price;
  that the fixed costs do not change across the volumes shown; an optional target profit is a goal, not an expectation.
  **Calculated outputs:** profit, contribution, break-even, margin of safety, units for a target and the what-if rows.
  **Exclusions (shown next to the results):** tax and GST, depreciation, interest, the owner's pay unless the visitor
  put it in fixed costs, returns and discounts, stock, and every cost not entered.
- **Banned claims:** "you will make", "safe", "viable", "healthy" or "good" profit, "recommended" price, volume or target,
  "you should sell", "expected sales", a forecast of any kind, a benchmark or an industry figure, and a "guaranteed break-even"
  or any break-even described as a guarantee.
- **Wording for outcomes:** a loss is "a loss of ₹X for the period" in neutral words; "break-even not reached" is a
  statement about the entered numbers, never a verdict on the business. The what-if table says "if this changed by 10%,
  holding the rest", not that it will.
- **Tax:** none is computed; amounts are without GST.
- **Local only:** nothing leaves the browser.

## Spec

### 1. Tool identity
Profit Calculator; `profit`; Calculators, Business; no subcategory; `toolType` calculator. Keep the catalog title
"Profit Calculator" (the name people search for). Description (replaces "Calculate business profit."): "Work out your profit
for a period, the break-even point and the sales a target needs, and see which of price, cost, volume or fixed costs
moves profit most." Aliases (true names): "break-even calculator", "business profit calculator", "contribution margin
calculator". (Not "profit and loss calculator": this is not a statement.)

### 2. User problem
**This tool helps a small seller understand what a product or service really earns for a period, and how many sales it
needs to cover fixed costs, when prices, costs or volumes change.** Today they use a spreadsheet they rebuild, or a
calculator that subtracts two numbers and hides the fixed costs.

### 3. Jobs to be done
- What is my profit this month on this product, after variable and fixed costs?
- How many units do I have to sell just to cover the fixed costs?
- How many units would a profit of ₹X need?
- If the price, the unit cost, my volume or my fixed costs changed by 10%, which change matters most?

### 4. Target users
Sellers and small businesses with one clear per-unit price and cost. Not for accounting statements, several products at
once, investments (ROI), or tax.

### 5. Inputs (one mode; no basis control)
All amounts are in rupees without GST, for the **same period** (a month, for example). The form follows the Margin and
SIP forms: a two-column grid of number fields with a hint under each, one optional field, Reset.

| Field | Unit | Default | Required | Limits | Helper text | Message when invalid |
| --- | --- | --- | --- | --- | --- | --- |
| Selling price per unit | ₹ | 800 | yes | 0.01 to 10,00,00,000 | "What you charge for one unit, without GST." | "Enter a selling price between ₹0.01 and ₹10 crore." |
| Variable cost per unit | ₹ | 600 | yes | 0 to 10,00,00,000 | "What one more unit costs you to make or buy: materials, packing, delivery. It may be more than the price." | "Enter a variable cost per unit between ₹0 and ₹10 crore." |
| Fixed costs for the period | ₹ | 50,000 | yes | 0 to 100,00,00,000 | "Costs that do not change with sales in the period: rent, salaries, subscriptions. Use the same period as the units sold." | "Enter fixed costs between ₹0 and ₹100 crore." |
| Units sold in the period | units | 400 | yes | 0 to 10,00,00,000, whole numbers | "How many units you sold, or expect to sell, in that period." | "Enter the units sold as a whole number from 0 to 10 crore." |
| Target profit (optional) | ₹ | blank | no | 0.01 to 100,00,00,000 | "Leave blank to skip. If you enter one, you see the units and revenue it would need." | "Enter a target profit between ₹0.01 and ₹100 crore, or leave it blank." |

Mobile: one column, 16px gutter, the same input height as Margin and SIP, fields in the order above. Left out of v1:
several products, per-period labels, tax rates, a break-even in time, owner's pay as a separate field, a selling-price
solve (that is Margin).

### 6. Outputs
- **Primary:** the profit (or loss) for the period.
- **Supporting cards (four):** break-even point in units, margin of safety (or the units short of break-even),
  contribution per unit, profit as a share of revenue.
- **Breakdown (one compact list):** revenue, variable costs, fixed costs, profit, so the primary figure can be traced.
- **Target block (only if entered):** the units and the revenue the target needs, compared with the units sold.
- **What-if table:** the four levers at −10% and +10%.
- Not shown: advice, a recommended price or volume, a forecast, a benchmark, tax.

### 7. Model rules
Rupees; Price P, variable cost V, fixed costs F, units Q, target T. All exact (as in Margin: whole-number arithmetic on the
typed decimals), nothing rounded in the model except the whole units of a break-even.
- contribution per unit c = P − V; revenue R = P × Q; variable costs = V × Q.
- **profit = R − V × Q − F = c × Q − F.** Profit as a share of revenue = profit ÷ R (not shown when R = 0).
- **Break-even units** = the smallest whole number n with c × n ≥ F, that is ⌈F ÷ c⌉ when c > 0; 0 when F = 0. When c ≤ 0 there
  is no break-even: every unit sells at or below its variable cost, so more sales never cover the fixed costs.
  **Break-even revenue** = P × break-even units.
- **Margin of safety** = Q − break-even units (units), and ÷ Q (a share of the units sold). When Q is below break-even it
  is shown as "units short of break-even" in neutral words; when Q equals the break-even it says "at break-even" (0 units
  above or short); when Q is above it, it is "units above break-even", with the share of the units sold (units above ÷ units
  sold; not shown when Q is 0). Not shown when there is no break-even.
- **Units for a target** T: the smallest whole n with c × n − F ≥ T, that is ⌈(F + T) ÷ c⌉ when c > 0; revenue = P × n.
  When c ≤ 0 no number of units reaches a positive target. Compared with Q: "N more units than you sold" or "you sold N
  more than that".
- **What-if rows:** the four inputs each changed by −10% and +10% (the others held): the changed value, the new profit, the
  change in profit and the new break-even units ("Not reached" where c ≤ 0). The base row is first. A units row does not
  change break-even. A changed quantity is not rounded (360 units is exact; 85.5 is shown as 85.5).
- **Precision:** money to the paisa for display, units as whole numbers except in a what-if quantity, percentages to 2
  decimals, break-even units rounded **up**. A break-even over 100 crore units is shown in full, not capped.
- **Independent verification:** see section 25.

### 8. Assumptions (shown on the page)
Price and variable cost are the same for every unit; every unit is sold at that price; fixed costs do not change across
the volumes shown; amounts are without GST and for one period. Not included: tax, depreciation, interest, the owner's pay
(unless entered as a fixed cost), returns, discounts, stock and any cost not entered. A calculation for understanding,
not an accounting profit or a forecast.

### 9. Edge cases
- Price equals the variable cost, or is below it: no break-even; neutral wording; target "cannot be reached"; the what-if
  table shows "Not reached" for break-even in those rows.
- Fixed costs 0: break-even 0 units; margin of safety equals the units sold.
- Units sold 0: a loss equal to the fixed costs; margin of safety negative (units short of break-even = break-even); no
  profit share (revenue is 0).
- Exactly at break-even: profit 0, margin of safety 0.
- A break-even that needs rounding (F ÷ c not whole): rounded up, with the profit at that many units at least 0.
- Smallest price with no variable cost and a huge fixed cost: a very large break-even, shown in full with Indian grouping.
- Target blank, or a value outside its limits.
- A what-if row where the changed price falls below the variable cost, or the changed cost rises above the price.
- Large valid values (price ₹10 lakh, fixed costs ₹50 crore): no overflow, readable grouping.

### 10. Validation
Limits and messages as in section 5, tool-owned, with the shared field helpers for linked errors (`aria-invalid`,
`aria-describedby`). An emptied required field shows the prompt, not an error; an emptied target means none. Units must be
whole. **Negative values are not accepted in any field**; zero is valid for the variable cost, the fixed costs and the units
sold (a result, not an error). A variable cost above the price is valid input (a result, not an error).

### 11. UX flow
Intro, one form (the four facts and the optional target), live results (no Calculate button), Reset; then the result, the
target block, the what-if table, how to use, reading the result, the assumptions and what is not included, an example, how
it is calculated, the FAQ, related articles and tools. No primary button; the only action is Reset.

### 12. Result hierarchy
1. Profit (or loss) for the period, large.
2. Four cards: break-even units, margin of safety (or units short), contribution per unit, profit as a share of revenue.
3. The breakdown (revenue, variable costs, fixed costs, profit) and one summary sentence.
4. The target block, if entered.
5. The what-if table, with the biggest lever identified in a sentence, not as advice.
6. The trust note beside the result.
A loss and "break-even not reached" use the same layout in neutral words.

### 13. Comparison, table or schedule decision
**Table: YES**, one: the what-if table. The question it answers: "which change moves my profit most, and what does it do to my
break-even?". Columns: What changes, New value, Profit, Change in profit, Break-even (units). Nine rows (the base and eight
changes). It is also the accessible form of the sensitivity. **Schedules or monthly detail: NOT NEEDED.**

### 14. Chart decision
**NOT NEEDED in v1.** A break-even chart (revenue and total cost lines crossing) is the textbook picture, but the cards and the
what-if table already carry every figure, and a chart would add a module without a new fact. The picture belongs in the
break-even article, drawn from the same numbers. Revisit if readers of that article ask for it on the tool page.

### 15. Export decision
**CSV: NOT NEEDED.** Nine rows and a handful of figures are not a record to keep.

### 16. Print decision
**Print Summary: NOT NEEDED in v1.** A month's figures are a working answer, and a fifth copy of the print CSS would add to a
duplication the reuse review has already flagged (print CSS stays unshared until print baselines exist). Revisit with user
evidence.

### 17. Mobile behaviour
At about 390px: single-column fields; the four cards stack in two columns where they fit; the breakdown list stacks; the
what-if table scrolls in a labelled region with a sticky first column (as the Margin table does); tap targets at least 36px;
no horizontal page scroll.

### 18. Accessibility requirements
Labelled fields with linked hints and errors; a polite live region with one sentence ("Profit ₹30,000; break-even at 250
units."); table caption and `scope`; a loss, "not reached" and "units short" stated in words, never by colour or sign alone;
text contrast 4.5:1; the shared focus ring; no animation.

### 19. Search keywords and aliases
Aliases "break-even calculator", "business profit calculator", "contribution margin calculator". Queries to check: "profit",
"break even", "break-even point", "contribution margin", "fixed costs". Profit must be found first as a published tool; the
Coming Soon ROI must not appear as usable.

### 20. Related calculators
- **Margin (live):** the price and the unit cost come from a pricing decision; both tools link to each other (Margin gets a
  related calculator for the first time, so the Margin page changes: see Publication effects).
- Future, only as they exist: ROI (a return on an amount invested), Percentage (a change as a percentage), GST (a price
  with tax).

### 21. Article cluster
Distinct, no forced count; none depends on a rule or a benchmark.
1. **How to find your break-even point** (explanation and decision guide). Fixed and variable costs, contribution per unit,
   ₹50,000 ÷ ₹200 = 250 units, why a fractional answer is rounded up (₹50,000 ÷ ₹130 is 384.6, so 385 units), and what
   the break-even revenue is. Primary link: Profit.
2. **Price, cost or volume: which matters most?** (scenario). The what-if rows on one example: a 10% price change moves
   profit by ₹32,000, a 10% variable cost change by ₹24,000, volume by ₹8,000 and fixed costs by ₹5,000. Framed as the
   result of one example, never as a rule about businesses.
3. **How many units do you need for a target profit?** (decision guide). (F + T) ÷ c; ₹50,000 fixed, ₹200 contribution: 500
   units for ₹50,000, 750 for ₹1,00,000, 1,250 for ₹2,00,000; what the units sold so far already cover.
Candidate, only if distinct once written: **Fixed costs vs variable costs: where does each cost go?** (mistake avoidance).
It risks repeating article 1 and is not committed.
Rejected: "good profit margin" and margins or break-even by industry (benchmarks need dated, sourced data and invite advice),
"how to increase profit" (advice-shaped), tax and GST articles (rule-dependent), anything on ROI or payback (that tool's
cluster). The Coming Soon "ROI vs Profit" Business placeholder stays Coming Soon.

### 22. Imagery plan
From the formulas, no text, no stock art; PNG plus WebP; descriptive alt text; the tool page needs none.
1. **Break-even:** two straight lines over units, revenue and total cost, crossing at the break-even point, with the loss region
   to the left and the profit region to the right (₹800, ₹600, ₹50,000: crossing at 250 units, marker at 400 units).
2. **Which lever matters:** horizontal bars of the change in profit for each lever at −10% and +10% on the example (₹32,000,
   ₹24,000, ₹8,000, ₹5,000), centred on zero.
3. **Units for a target:** stacked bars of the units that cover the fixed costs and the further units a target needs (250 plus
   250, 500, 1,000) for the three targets.
No image for any further article unless it explains something the text does not.

### 23. SEO plan
Search intent: "break even calculator", "business profit calculator", "contribution margin". Title "Profit Calculator: Profit and
Break-Even Point | ToolZen Hub" (about 60 characters). Description direction: work out profit for a period, the break-even point
and the units a target needs, and what price, cost or volume changes do; calculated for the numbers you enter, before tax.
Canonical `https://toolzenhub.in/calculators/profit/`; one H1; breadcrumb structured data (the Business crumb goes to
`categories.html#business` as for Margin); form, example and FAQ in the static HTML. Better than a generic page because it
solves the break-even, a target and ranks the levers, in plain words. No pages for keyword variations.

### 24. Performance constraints
Vanilla JS, dynamic import, browser-local, native UI, no dependency. The tool code loads only on its own page; images are
optimized (the Margin images are 3 to 11 KB). No artificial size budget: the product copy is part of the tool, and the Margin
and SIP modules are the reference for scale (about 12 KB gzipped with formulas). No unnecessary runtime work.

### 25. Tests (risk-based)
**Independent reference:** `tests/fixtures/profit-golden.py` (Python `decimal`, 60 digits). It applies the definitions
(profit = revenue − variable costs − fixed costs), finds the break-even and the target units by an **integer search over
units** (the smallest whole n whose profit reaches the target), and asserts that the closed forms ⌈F ÷ c⌉ and ⌈(F + T) ÷ c⌉
agree; checks that the profit at one unit fewer is below the target and at that many is not; recomputes every what-if row
from scratch with the changed input; and prints the figures quoted in the articles. The JSON is embedded as `GOLDEN` in
`tests/unit/profit-golden.test.mjs`, as for Margin; the figures are not copied from the JavaScript.
**During implementation, run only what the change can break; do not rerun full regression repeatedly:**
- formula change: `tests/unit/profit-golden.test.mjs` only;
- tool UI change: `tests/browser/profit.spec.js` on `subpath-desktop`, then `subpath-mobile` when layout changes;
- what-if table change: the same spec (and its accessibility checks);
- article figure change: `tests/unit/profit-articles.test.mjs`;
- catalog publication: focused catalog, search, taxonomy, relationships, sections, tool-catalog, articles unit tests, plus the
  `navigation`, `articles` and `notfound` specs on one project; use `tests/helpers/coming-soon.mjs`, never name a tool;
- shared helper change (none planned): every known consumer;
- shared CSS change (none planned): visual tests for every affected page;
- visual change: the baselines of the affected pages only.
Broaden only along a real impact path (a shared formatter change tests the tools that use it; a breadcrumb change tests tool,
category and article pages). A change to the Profit formula alone does not rerun the Loans, SIP or Margin browser specs.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, the three browser projects with
`--workers=1` (spec by spec if memory is tight, and never reported as a monolithic pass when it was not), and the three visual
projects. Before it: inspect stale Playwright, Chromium, Node and Eleventy processes, stop only clearly stale ones, clean
`test-results`, `tests/.tmp` and `tests/fixtures/__pycache__`, and make sure no dev watcher writes to `dist`.
- **Unit:** golden scenarios; invariants (profit rises with price and units and falls with variable and fixed costs; profit at
  break-even units is at least 0 and one unit less is below; the units for a target reach it and one fewer does not; break-even
  is unchanged by units sold; each what-if row equals a fresh calculation); validation, optional target, whole units.
- **Article figures:** a test like `tests/unit/margin-articles.test.mjs`.
- **Browser:** live results, loss, break-even exactly reached, no break-even (price at or below cost), zero fixed costs, zero
  units, the target block (none, reachable, unreachable), the what-if rows, validation with linked errors, reset, keyboard,
  mobile layout, search by name and aliases, the related Margin link, the cards and articles.
- **Accessibility entries; visual baselines** for the new page and every page that changes.
- **Pinned expectations that change (the factory touch-list):** published and Coming Soon counts, published tool ids, article
  counts and per-category counts, inventory, SEO, DOM and link baselines, the sections and tool-catalog registries, the
  related-count rule (the cluster is three, so two related per article, as Margin), the navigation counts, accessibility and
  tool-controls registrations, visual registration. **Intentional side effect: the Margin page.** With Profit live, Margin gets a
  related calculator, so `tests/browser/margin.spec.js` ("no related calculators in v1") and the Margin visual baselines change
  on purpose, and the Margin articles' related tools are re-checked.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (14), CSV (15), Print Summary (16), a Business landing page in
this pack (see below), a schedule (13).

### 27. Deferred items
Several products or a price list; a statement-style profit and loss; tax and GST; depreciation, interest and loans; cash
flow and payback; ROI (the ROI tool); a break-even in time; seasonality or forecasting; a selling-price solve (Margin);
Print Summary and CSV; the break-even chart on the tool page; saving or comparing several cases locally (revisit with evidence
that visitors re-enter several products in a session); benchmarks (never in scope). **Profit must not grow into ROI or a
planning suite.**

### 28. Commit checkpoint
Subject: `feat: add profit calculator and business break-even content`. Afterwards run the exact-tree verification
(`docs/tool-pack-factory.md`, section 8), one Playwright project and spec at a time with `--workers=1`, no `npm run dev`
server running. Do not push.

## Planning goldens (illustrative; the implementation must re-derive them with the independent reference)

Computed with Python `decimal`; break-even and target units by integer search; P price, V variable cost, F fixed costs, Q units.

| # | Scenario | Result |
| --- | --- | --- |
| A | P 800, V 600, F 50,000, Q 400; target 1,00,000 | contribution 200; revenue 3,20,000; **profit 30,000**; profit share 9.3750%; break-even 250 units (revenue 2,00,000); margin of safety 150 units (37.50%); target needs **750 units** (revenue 6,00,000) |
| B | A with Q 200 (a loss) | profit −10,000; share −6.25%; break-even 250; 50 units short (−25.00% of units sold) |
| C | A with Q 250 (exactly break-even) | profit 0; margin of safety 0 |
| D | P 730, V 600, F 50,000, Q 500 (rounding up) | contribution 130; F ÷ c = 384.6; **break-even 385 units** (revenue 2,81,050); profit 15,000; safety 115 units |
| E | P 600, V 600, F 50,000, Q 400 (price = cost) | contribution 0; profit −50,000; **no break-even** |
| E2 | P 500, V 600 (price below cost) | contribution −100; profit −90,000; **no break-even** |
| F | A with F 0, Q 100 (no fixed costs) | break-even 0 units; profit 20,000; safety 100 units (100%) |
| G | A with Q 0 | profit −50,000; break-even 250; no profit share |
| H | P 0.01, V 0, F 10,00,00,000, Q 1,000 (tiny contribution) | break-even 1,000 crore units (10,00,00,00,000); profit −9,99,99,990 |
| I | P 10,00,000, V 4,00,000, F 50,00,00,000, Q 5,000; target 250,00,00,000 | contribution 6,00,000; profit 2,50,00,00,000; break-even 834; target 5,000 units |
| J | P 2,000, V 0, F 60,000, Q 40 (a service); target 50,000 | break-even 30 units; profit 20,000; target needs 55 units (revenue 1,10,000) |
| K | What-if on A (±10%) | price −10%: profit −2,000 (−32,000), break-even 417; price +10%: 62,000 (+32,000), 179; variable cost −10%: 54,000 (+24,000), 193; variable cost +10%: 6,000 (−24,000), 358; units −10%: 22,000 (−8,000), 250; units +10%: 38,000 (+8,000), 250; fixed costs −10%: 35,000 (+5,000), 225; fixed costs +10%: 25,000 (−5,000), 275 |
| L | Target units on A for 50,000 / 1,00,000 / 2,00,000 | 500 / 750 / 1,250 units |

## Site-wide UX consistency

The tool reuses the established patterns and invents nothing; any difference is listed.
- **Reused as they are:** Inter typography and the green/action system; the shared number field (label, unit, hint, linked error,
  `aria-invalid`); the two-column field grid on desktop and single column on mobile; the optional field with a "(optional)" label;
  the secondary Reset button that looks clickable (white, green text, pointer); the shared focus ring; the `calculator-results__*`
  primary and card metrics; section titles with the green rule; the compact definition-list card (as in the Margin discount and
  SIP scenario cards); the labelled, scrollable table region with a sticky first column and `scope` headers; the neutral trust
  note (calm border, opens with the words that carry its meaning); the live region; the breadcrumb with a plain-text Business
  crumb; the related-articles and related-calculators layout; the article cards and article page template.
- **No basis or mode control** is needed (one model), so the radio segment pattern is not used; if a later version adds a mode it
  reuses the Margin segmented control unchanged.
- **Justified difference:** none planned. The breakdown list is the existing compare-card definition list; the what-if table is the
  existing results table with a different set of columns.
- **Not allowed:** new colours, spacing scales, button styles, control shapes or card styles; a chart; decorative imagery in the tool.

## Implementation sequence (when approved)
1. Python reference (`tests/fixtures/profit-golden.py`), then the engine (`formulas/profit.js`) and its unit tests; focused tests only.
2. The tool module and CSS; `tests/browser/profit.spec.js`; run it on one project, then mobile.
3. Catalog activation (in place), `toolStyles.json`, aliases, `relatedArticles`; focused catalog, search, taxonomy, relationships,
   sections and tool-catalog tests; update the Margin spec's related-calculator assertion on purpose.
4. The three articles, figure tests, the three images; focused article tests.
5. Pinned expectations, baselines and visual registration for the pages that change (the Margin page among them).
6. Final Tool Pack gate once (section 25), then the commit.

## Publication effects to review (Coming Soon → live)
The Calculators and Categories cards for Profit; search results and ranking for "profit", "break even", "contribution margin";
the Business article count (3 → 6) and the Articles listing; the Business category card; **the Margin page (a related calculator
appears) and its visual baseline**; the Home page does not change (Profit is not in its Popular Calculators list; check).
**Category landing page decision: NO in this pack.** Business will have two live tools and six articles after this pack, which is
the condition recorded in the Margin spec for considering a landing page; that is a separate, small decision for after the pack
ships (what the page would hold, whether the existing category anchor already serves), not part of its scope. The Loans pages,
SIP and the other tools do not change.

## Implementation notes (deviations from the plan and decisions made while building)

- **What-if units are rounded to whole units (a change from the plan).** The plan left a changed quantity unrounded (85.5 shown
  as 85.5). Units are whole, so a what-if quantity is rounded to the nearest whole unit, half up (95 units less 10% is 86, more
  10% is 105), and the table says so. The independent reference rounds the same way with `Decimal.quantize`; the engine does it
  with whole-number arithmetic.
- **Golden I was adjusted.** The planned target of ₹250 crore is above the tool's own ₹100 crore limit, so golden I uses a target of
  ₹90 crore (2,334 units, already reached by the 5,000 sold). The planned fixed costs of ₹50 crore are kept.
- **No break-even whenever the contribution is zero or negative, even with zero fixed costs.** The plan said "no break-even" for
  a contribution of 0 or less; the reference now checks that first, so a price at or below the variable cost with no fixed costs is
  not shown as "break-even at 0 units".
- **The result shows five metrics:** profit (primary), break-even point, units above or short of break-even (or "Against break-even"
  when it is at break-even or not applicable), contribution per unit, and profit as a share of revenue. In the shared two-column
  grid the fifth card would sit alone in half a row, so a final refinement lets the last odd metric span the row, with one rule scoped
  to `#profit-results` in `profit.css`. The shared results grid and the Margin and SIP pages are unchanged; on a phone the grid is
  one column and the rule has no effect. The three Profit visual baselines were regenerated for it.
- **Exact arithmetic** is the same whole-number approach as Margin (decimals as typed, scale 1e10; the what-if rows at a scale of
  100 times that, so a whole-percent change is exact). A break-even of exactly 50 is never 51 because of floating point
  (a test pins 0.3 − 0.1 = 0.2 against 10).
- **Margin gains a related calculator (an intended publication effect).** Profit now appears on the Margin page and Margin on the
  Profit page by the category relationship, with no code change to Margin. The Margin spec's "no related calculators" assertion, its
  scope scan (which read the related card's text) and its visual baselines were updated on purpose. Business articles now relate to
  both Business tools, `[margin, profit]` and `[profit, margin]`.
- **Related articles: two per article**, as for Margin (a three-article cluster).
- **Size.** Measured, gzipped: tool module 8.0 KB, formulas 3.4 KB (about 11.4 KB together), tool CSS 1.2 KB; no new dependency, no
  chart. Images: 9.6 KB and 11.4 KB (break-even PNG and WebP), 4.9 KB and 3.6 KB (levers), 5.5 KB and 4.1 KB (target units). No size
  budget was set and none was chased.
- **A fourth article (fixed vs variable costs) was not published.** The distinction is explained inside the break-even article.
- **No chart, print or CSV**, as planned; the break-even picture is the first article's image.
- **Repetition observed (recorded, not extracted):** the `init()` skeleton, the notes, the definition-list card, the table and sr-only
  rules were copied again from Margin; the BigInt helpers (`scaled`, `ceilDiv`, `ratio`) are now in two engines; `toolStyles.json`
  gained another identical 22-line entry; the publication touch-list again needed the catalog, sections, search, taxonomy, articles
  and relationships tests, the navigation counts, the articles listing pagination and the accessibility, tool-controls and visual
  registrations. The Coming Soon helper meant no Coming Soon sample had to be swapped. Per-pack related-count rules had to be extended
  once more (two per article for the Margin and Profit clusters).
- **Final verification passed.** Engine golden 45, article figures 6, full unit 682; root and GitHub Pages builds; inventory (37 live
  pages, 25 Coming Soon), links, assets and SEO; visual desktop 15, mobile 15, tablet 9. Browser coverage was run spec by spec with
  `--workers=1` (monolithic runs were stopped by memory pressure on this laptop in earlier packs), not as whole projects:
  `subpath-desktop` 18 specs (407 passed, 1 skipped), `subpath-mobile` 16 specs (392 passed, 1 skipped) and `root-desktop` 6 specs
  (142 passed). After the fifth-card refinement only the Profit checks were rerun: `profit.spec.js` on `subpath-desktop` and
  `subpath-mobile` (29 passed each) and the Profit visual test on desktop, mobile and tablet (1 passed each).
