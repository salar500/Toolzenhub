# Tool Pack 04: Margin Calculator (pricing and margin)

Status: built and verified (commit pending)      Base commit: a861e0a
Reserved id and slug: `margin` (route `/calculators/margin/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in
`docs/tool-pack-reuse-review.md`.

Build with the current proven architecture only. **Do not** build a generator, extract the compare-card or print CSS,
or add a framework in this pack; observe repetition and record it.

## Selection record

### Candidates (the real catalog, read from `assets/js/data/tools.js`)

Published: Loan Comparison, EMI, Loan Prepayment, Loan Balance Transfer (Loans) and SIP (Investment). Coming Soon,
all in the Calculators section:

| Category | Entries (id) |
| --- | --- |
| Loans | Home Loan (`home-loan`), Personal Loan (`personal-loan`), Loan Eligibility (`loan-eligibility`), Interest (`interest`) |
| Investment | PPF (`ppf`), FD (`fd`), CAGR (`cagr`) |
| Tax | GST (`gst`), Income Tax (`income-tax`) |
| Business | Profit (`profit`), Margin (`margin`), ROI (`roi`) |
| Health | BMI (`bmi`), Calorie (`calorie`), BMR (`bmr`) |
| Math | Percentage (`percentage`), Ratio (`ratio`), Age (`age`) |
| Converter | Unit Converter (`unit-converter`), Currency (`currency`), Date (`date`) |

### Strategic direction

**Prove a third category (Business), not deepen Investment.** Investment already has a flagship (SIP) and its
remaining entries are weak or costly: FD is a one-formula tool, PPF is rule-bound, CAGR is a thin utility. A second
Investment tool would add a cluster, not much user value. Business is the category where a *decision* tool with no
maintained data is available, and it serves a different audience (people who price and sell), which broadens the
site instead of repeating one pattern. Loans is not chosen: Home Loan and Personal Loan duplicate EMI, Eligibility
is lender-rule driven, Interest is generic. Those stay Coming Soon, unchanged.

### Candidates seriously evaluated

HIGH / MEDIUM / LOW; qualitative. "Rule risk", "maintenance", "generic risk" and "live data": lower is better.

| Candidate | Pain | Repeat use | Search / commercial | Differentiation | Decision support | Cluster / links | Feasibility | Maintenance | Rule risk | Live data | Generic risk | Trust complexity | Flagship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Margin** (Business) | HIGH | HIGH (every re-price, every new product) | HIGH / HIGH | HIGH if scoped to pricing, cost shocks and discounts | HIGH | HIGH | HIGH | LOW | NONE | NONE | MEDIUM (LOW as scoped) | LOW | **HIGH** |
| CAGR (Investment) | MEDIUM | MEDIUM | MEDIUM / LOW | MEDIUM (required CAGR, sensitivity) | MEDIUM | MEDIUM (links to SIP's assumed return) | HIGH | LOW | NONE | NONE | HIGH | LOW | MEDIUM |
| Profit (Business) | MEDIUM | MEDIUM | MEDIUM / MEDIUM | MEDIUM (break-even, volume) | MEDIUM | MEDIUM | HIGH | LOW | NONE | NONE | HIGH | LOW | MEDIUM |
| ROI (Business) | MEDIUM | MEDIUM | MEDIUM / MEDIUM | MEDIUM (payback, required ROI) | MEDIUM | LOW | HIGH | LOW | NONE | NONE | HIGH | LOW to MEDIUM | LOW to MEDIUM |
| FD (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM / MEDIUM | LOW to MEDIUM | LOW to MEDIUM | LOW | HIGH | MEDIUM (rates, tax on interest) | MEDIUM | NONE | HIGH | MEDIUM | LOW |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM / LOW | MEDIUM | MEDIUM | MEDIUM | MEDIUM | HIGH (rate, limits, lock-in) | HIGH | NONE | MEDIUM | HIGH | MEDIUM |
| GST (Tax) | MEDIUM | MEDIUM | HIGH / MEDIUM | LOW | LOW | LOW to MEDIUM | HIGH | MEDIUM to HIGH (rates, categories) | MEDIUM to HIGH | NONE | HIGH | MEDIUM | LOW |
| Income Tax (Tax) | HIGH | HIGH (yearly) | HIGH / HIGH | MEDIUM | HIGH | HIGH | MEDIUM | **VERY HIGH** (slabs, regimes, years) | **VERY HIGH** | NONE | LOW | **HIGH** (a wrong figure is costly) | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | HIGH / LOW | LOW | LOW | LOW | HIGH | LOW | MEDIUM (formula choice) | NONE | HIGH | **HIGH** (health claims) | LOW |
| Percentage, Ratio, Age, Date, Unit, Currency (Math, Converter) | LOW to MEDIUM | LOW | HIGH / LOW | LOW | LOW | LOW | HIGH (Currency: needs live rates) | LOW (Currency: HIGH) | NONE | NONE (Currency: YES) | VERY HIGH | LOW | LOW |

Screened out as "two or three numbers in, one obvious number out" with no strong decision layer: Percentage, Ratio,
Age, Unit Converter, FD and GST as plain calculators. Screened out for maintenance or trust: Income Tax, PPF, GST,
Currency, the Health tools.

### Why Margin wins

- It turns the most common arithmetic mistake in small-business pricing into the product: people confuse **margin**
  (profit as a share of the *price*) with **markup** (profit as a share of the *cost*), add a margin percentage to
  the cost, and under-price. A tool that shows both for the same price, and sets the price from either, fixes a real
  and repeated error.
- Its extra value is not a third field: the **price for a target margin**, what a **cost change** does (and the price
  that restores the margin), and what a **discount** costs in volume.
- It is evergreen: no rate, rule, tax table or live data, so nothing can silently go stale.
- It proves category independence in a different audience (sellers, shop owners, freelancers pricing a product) with
  no new platform code.
- It has a real article cluster (margin against markup, pricing for a target, the real cost of a discount) that
  does not depend on a rule or a benchmark.

### Why the runner-up loses (CAGR)

CAGR is cheap and links naturally to SIP (a past result turned into an assumed return), but it is "start, end,
years in; one rate out" with a thin decision layer ("required CAGR for a goal" is the only strong extra), and a user
rarely returns. It also deepens a category that already has its flagship. It stays Coming Soon; it is the better
Pack 5 candidate if an Investment follow-up is wanted. Profit and ROI stay separate: Margin must not absorb them
(see section 27).

### Retention and differentiation tests

- **Why the same user returns:** every new product, every supplier price change, every promotion, every re-pricing
  of a range. A shop owner prices dozens of items; the question recurs and the numbers change each time.
- **What it offers beyond Google's one-line answer:** price from a target margin or markup, both percentages side
  by side with the reason they differ, a table of cost-change scenarios with the price that restores the margin, and
  the volume a discount has to win back.
- **Maintenance:** none beyond the code. Browser-only, user-supplied numbers, no tax or rule data.

## Trust standard for pricing results

This is arithmetic on the visitor's own figures, not a forecast or advice, but it can still mislead.

- **Name the inputs apart:** the *cost* (a fact the user knows), the *selling price or target* (a choice), and the
  optional *discount* (a choice). Results are **calculated figures for the numbers entered**.
- **Say what is left out, next to the result:** "Margin here is per unit, on the cost you enter, before overheads,
  fixed costs, tax and returns. Enter amounts without GST."
- **Never claim** a "good", "healthy", "ideal", "standard" or "industry" margin, or recommend a price. No benchmarks.
- **Discount block wording:** "if the cost per unit stays the same and nothing else changes, you would need to sell
  about X times as many units to earn the same total profit." It is a **break-even on volume, not a prediction** that
  sales will or will not rise.
- **Tax:** no tax is computed. The page states that GST and other taxes are not included and that prices must be
  entered without them. A GST-aware version waits for a verified, dated rule and the GST tool.
- **Local only:** no data leaves the browser.

## Spec

### 1. Tool identity
Margin Calculator; `margin`; Calculators, Business; no subcategory; `toolType` calculator. Keep the catalog title
"Margin Calculator" (the name people search for). Description (replaces "Calculate profit margin."): "Set a selling
price from a target margin or markup, see margin and markup side by side, and see what a cost change or a discount
does to your profit." Aliases (true names): "profit margin calculator", "markup calculator", "selling price
calculator". (Not "gross margin": the page says "before overheads" and does not claim an accounting definition.)

### 2. User problem
A shop owner, small manufacturer, reseller or freelancer sets prices from a cost. They mix up margin and markup,
under-price, and do not see what a supplier increase or a promotion does to profit until the month is over. Today they
use a calculator that returns one percentage, or a spreadsheet they rebuild each time.
**This tool helps a small seller decide what to charge, and understand how a change in cost or a discount moves the
profit on each sale.**

### 3. Jobs to be done
- What price do I charge to earn a 30% margin on this cost?
- I charge this price: what are my margin and my markup?
- My supplier raised the cost by 10%: what does that do to my margin, and what do I charge to keep it?
- If I give 15% off, how many more units must I sell to earn the same total profit?

### 4. Target users
Sellers and small businesses pricing products or services with a clear per-unit cost. Not a tool for accounting
margins, tax, break-even with fixed costs (the Profit tool), investment returns (ROI), or industry comparisons.

### 5. Inputs
| Field | Unit | Default | Limits | Note |
| --- | --- | --- | --- | --- |
| Cost per unit | ₹ | 600 | 0.01 to 10,00,00,000 | what one unit costs you, without GST |
| What do you want to work out from? (choice) | none | Selling price | one of three | Selling price, Target margin, Target markup |
| Selling price (basis: price) | ₹ | 800 | 0.01 to 100,00,00,00,000 | shown only for that basis |
| Target margin (basis: margin) | % of price | 25 | 0 to 95 | shown only for that basis; "share of the price that is profit" |
| Target markup (basis: markup) | % of cost | 33.33 | 0 to 1,000 | shown only for that basis; "profit as a share of the cost" |
| Discount (optional) | % off the price | blank | 0 to 95 | blank means no discount block |

The basis is a segmented control (radio group), one value field at a time: three decisions share one form without
three tools. Left out of v1: quantities and fixed costs (break-even belongs to Profit), tax, currency, several
products, percentages of cost components, and any benchmark.

### 6. Outputs
- **Primary:** the selling price (when working from a target) or the margin (when working from a price).
- **Supporting, always shown together:** profit per unit, **margin** and **markup**, with one sentence saying why the
  two differ (margin is a share of the price, markup a share of the cost).
- **Cost-change table:** cost 10% lower, 5% lower, as entered, 5% higher, 10% higher: the cost, the margin if the
  price stays, and the price needed to keep the margin (and how much that is a change in price).
- **Discount block (only if a discount is entered):** the price after discount, profit per unit and margin after it,
  and the volume multiple needed to earn the same total profit, or a clear "no profit per unit at this discount".
- Not shown: a recommended price, a "good margin", a forecast of sales, any tax, any benchmark.

### 7. Model rules
All money in rupees; paise are the smallest unit. With cost C, price P, margin m (a fraction of the price), markup k
(a fraction of the cost):
- profit = P − C; margin = (P − C) ÷ P; markup = (P − C) ÷ C. They relate by m = k ÷ (1 + k) and k = m ÷ (1 − m).
- **Basis price:** P is the entered price.
- **Basis margin:** P = C ÷ (1 − m). **Basis markup:** P = C × (1 + k).
- **Rounding of a derived price:** rounded **up** to the next paisa; every figure shown (profit, margin, markup) is
  then computed from that **rounded price**, so the page is self-consistent and the margin is never below the
  target. Percentages are shown to 2 decimals. Nothing else is rounded in the model.
- **Cost-change rows:** C′ = C × (1 + c) for c in {−10%, −5%, 0, +5%, +10%}. Margin at the current price =
  (P − C′) ÷ P. **Price to keep the margin** (when margin m > 0) = C′ ÷ (1 − m), rounded up to the paisa; this also
  keeps the markup, since m and k determine each other. When the base margin is 0 or negative, the column shows the
  **price that covers the new cost** (C′, rounded up) and is labelled so.
- **Discount d (a fraction):** P_d = P × (1 − d); profit_d = P_d − C; margin_d = profit_d ÷ P_d. If profit_d > 0 and
  the base profit is > 0, the volume multiple = (P − C) ÷ (P_d − C): the units needed relative to today to earn the
  same total profit, with the same unit cost and nothing else changed. If profit_d ≤ 0 the block says there is no
  profit per unit at that discount, so no finite volume multiple would earn the same total profit under the entered
  assumptions. If the base profit is ≤ 0 the block says the price is already at or below the cost
  and shows no multiple.
- **Independent verification:** a Python `decimal` reference (60 digits). It applies the definitions directly, finds
  the price for a target margin or markup by an **integer search over paise** (the smallest price whose margin or
  markup is at least the target, not the closed form), asserts that the closed form and the search agree, round-trips
  every result (margin from price recovers the target), finds the volume multiple by **counting units** (the smallest
  N′ with N′ × profit_d ≥ N × profit for a large N) and asserts it equals the ratio, and checks the table rows
  against re-derived prices.

### 8. Assumptions (shown on the page)
The cost is per unit and the same for every unit. Margin and markup are per unit, before overheads, fixed costs, tax,
returns and payment charges. Amounts are entered without GST. A discount applies to the selling price and leaves the
unit cost unchanged; the volume figure is the units needed to earn the same *total* profit, not a forecast of sales.
Nothing depends on a rate, a rule or a date; no figure is maintained by the site.

### 9. Edge cases
- Margin 0% (or markup 0%): price equals cost; profit 0; the table and discount block follow ("no profit per unit").
- Price below cost: a loss, shown in neutral words ("below cost by ₹100"); margin and markup negative; the table's
  repricing column covers the cost; the discount block says the price is already at or below cost.
- Price equal to cost.
- Smallest cost (₹0.01) with 50% margin (price ₹0.02); the largest cost with 95% margin (price ₹20,00,00,000).
- A derived price rounding up (cost 333.33, margin 35%: price 512.82, margin shown 35.00%).
- Discount that exactly removes the profit (25% off 800 with cost 600), and one that goes below cost.
- Discount blank, 0, 95.
- A cost-change row whose cost falls below the smallest allowed cost (10% under ₹0.01 is ₹0.009): the row is
  calculated and shown, not clamped, with money displayed to the paisa; a test covers it.

### 10. Validation
Limits as in section 5, tool-owned messages in the style of the other tools, the shared field helpers for linked
errors. Only the field of the chosen basis is validated; hidden bases do not produce errors. A cleared required field
shows the prompt; a cleared discount means "no discount"; a discount above 95 is an error on that field. Margin 100%
and above is never accepted (the price would be undefined); the message says why.

### 11. UX flow
Intro, then one form: cost, the basis control, the one value field for that basis, the optional discount. Live
results (no Calculate button), Reset. Then the result summary, the cost-change table, the discount block (if any),
then how to use, the assumptions and what is left out, an example, how it is calculated, the FAQ. No primary
button. Shared fields, result helpers, buttons, headings only. Changing the basis keeps the cost, and carries the
current price, margin and markup across so the user can switch view without retyping (the value fields are
pre-filled with the equivalent figures).

### 12. Result hierarchy
1. The price (target bases) or the margin (price basis), large.
2. Profit per unit, **margin** and **markup** together, with the one-sentence difference.
3. The cost-change table.
4. The discount block, if a discount was entered.
5. Assumptions and what is not included, next to the results.
A loss is stated in neutral words in the same layout; it does not change the hierarchy and gives no advice.

### 13. Comparison, table or schedule decision
**Table: YES**, one: the five cost-change rows. Columns: Cost change, New cost, Margin at your price, Price to keep
your margin, Change in price. Five rows only; it is the accessible, readable form of the sensitivity and carries the
repricing answer. **Monthly or per-unit schedules: NOT NEEDED.** Scenario cards: NOT NEEDED (the table is the
comparison).

### 14. Chart decision
**NOT NEEDED in v1.** The discount's volume cost is one number and the cost table is five rows; a curve of volume
needed against discount would be the one chart worth drawing, but it adds weight to a tool whose answers are already
in plain numbers. Revisit if the article on discounts shows readers want the curve on the tool page. (The article
image for that topic is drawn separately from the same formula.)

### 15. Export decision
**CSV: NOT NEEDED.** Five rows and a handful of figures are not a record to keep.

### 16. Print decision
**Print Summary: NOT NEEDED in v1.** This is a quick pricing answer, not a document to share; the print CSS is also
not yet shared (reuse review, section 5), so adding a fourth copy has a real cost. Revisit with user evidence.

### 17. Mobile behaviour
At about 390px: single-column fields; the basis control as three full-width radio segments (at least 44px high); one
value field visible at a time; result cards stack; the cost-change table scrolls in a labelled region with a sticky
first column; the discount block stacks; tap targets at least 36px; no horizontal page scroll.

### 18. Accessibility requirements
Labelled fields with linked hints and errors (`aria-invalid`, `aria-describedby`); the basis as a real `fieldset`
and `legend` with radio inputs; the value field that appears has a label that names the basis; a polite live region
with one sentence ("Price ₹1,000, margin 40%, markup 66.67%."); table caption and `scope`; the loss and "no profit"
states are stated in words; no colour-only meaning; contrast 4.5:1 for text; shared focus ring; no animation.

### 19. Search keywords and aliases
Aliases "profit margin calculator", "markup calculator", "selling price calculator". Queries to check: "margin",
"markup", "selling price", "profit margin", "discount". Margin must be found as a published tool, first; the Business
category and Coming Soon Profit and ROI entries must not outrank it or appear usable.

### 20. Related calculators
None in v1 (the other Business tools are Coming Soon). Add only as they exist: Profit (break-even and volume), ROI,
Percentage (a step-up or discount as a percentage) and GST (a price with tax). A cross-category link to the Loan
tools is not natural and is not planned.

### 21. Article cluster
Distinct, no forced count; none depends on a rule, a benchmark or a live number.
1. **Margin vs markup: why 25% markup is only a 20% margin** (explanation and mistake avoidance). The conversion
   table (10, 25, 50, 100 percent markup against its margin), and the pricing error of adding a margin percentage to
   the cost. Primary tool link: Margin.
2. **How to price a product for a target margin** (decision guide). Price = cost ÷ (1 − margin); one worked example
   (cost ₹600 at 25%, 30%, 40%); why the price rises faster than the margin. Links to Margin.
3. **What a discount really costs you** (scenario). ₹800 with cost ₹600: 10% off needs about 1.67 times the units
   for the same profit, 20% off needs 5 times, 25% off removes the profit; a 40%-margin product against a 25%-margin
   one. Framed as break-even on volume, never as a prediction.
Candidate, build only if it is distinct once written: **My supplier raised the price: what do I charge?** (cost-change
scenario); it overlaps article 2 unless it is built around the table, so it is not committed.
Rejected: "what is a good profit margin" and "margins by industry" (benchmarks need dated, sourced data and invite
advice), "best pricing strategy" (advice-shaped), tax-inclusive pricing and GST articles (rule-dependent, they wait for
GST). The Coming Soon placeholder "ROI vs Profit" (a Business article) is unaffected and stays Coming Soon.

### 22. Imagery plan
Each drawn from the formulas, no text, no stock art; PNG plus WebP; descriptive alt text; the tool page needs none.
1. Margin vs markup: one price bar, split into cost and profit, with the profit measured against the whole bar (margin)
   and against the cost segment (markup), two brackets; same ₹800 example.
2. Pricing for a target: three horizontal bars (25%, 30%, 40% margin) of one cost, the price bar growing and the
   profit segment shown.
3. The discount: a curve of the volume multiple needed against the discount for a 25% margin and a 40% margin
   product, ending where the profit disappears.
No image for any further article unless it explains something the text does not.

### 23. SEO plan
Search intent: "margin calculator", "markup calculator", "selling price from margin". Title "Margin Calculator: Price,
Margin and Markup | ToolZen Hub" (about 58 characters). Description direction: set the selling price from a target
margin or markup, see both percentages, and what a cost change or discount does to profit; calculated for the numbers
you enter, before overheads and tax. Canonical `https://toolzenhub.in/calculators/margin/`; one H1; breadcrumb
structured data (the Business crumb goes to `categories.html#business`, as for Investment). The form, the example
and the FAQ in the static HTML. Better than a generic page because it solves the price, shows both percentages and
quantifies the cost change and the discount. No pages for keyword variations, no structured data for content that is
not shown.

### 24. Performance constraints
Tool JS about 8 KB gzipped or less including formulas (no chart), tool CSS about 2 KB, shared styles reused, no new
dependency, loaded only on its own page.

### 25. Tests (risk-based)
**During implementation, run only what the change can break; do not rerun full regression repeatedly.**
- Engine change: the engine unit tests only (`tests/unit/margin-golden.test.mjs`).
- UI change: `tests/browser/margin.spec.js`, on `subpath-desktop` first, `subpath-mobile` when layout changes.
- Table change: the same spec. Helper change (if any): its consumers.
- Catalog publication: focused catalog, search, taxonomy, relationships, articles unit tests, plus `navigation`,
  `articles`, `notfound` specs on one project.
- Visual change: baselines of the affected pages only.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, `subpath-desktop`,
`subpath-mobile` and `root-desktop` (each with `--workers=1`, spec by spec if memory is tight, never called a
monolithic pass when it was not), and the three visual projects.
- **Unit:** golden scenarios from the independent reference; invariants (price rises with margin and with markup;
  margin and markup round-trip through each other; the rounded price never has a margin below the target; margin 0
  gives price = cost; the discount multiple is at least 1 and rises with the discount; the cost-change table is
  ordered); validation, the hidden-basis rule and the optional discount; the catalog entry; relationships.
- **Article figures:** a test like `tests/unit/sip-articles.test.mjs` (every number in the three articles equals the
  engine and the reference). **Coming Soon coverage:** use `tests/helpers/coming-soon.mjs`; do not name a tool.
- **Browser:** live results for each basis and switching between them, the carried-over values, the cost table, the
  discount block (none, profitable, exactly zero, below cost), a loss, validation with linked errors and hidden
  fields not erroring, reset, keyboard, the radio group, mobile layout, search by name and aliases, the home and
  listing cards, articles render and lead to the tool.
- **Accessibility entries; visual baselines** for the new page and every page that changes.
- **Pinned expectations that change:** published and Coming Soon counts, the published tool ids, the
  article counts and per-category counts, inventory, SEO, DOM and link baselines, the Home popular list (Margin is
  not in it today, check), the Business category card, the sidebar article counts.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (section 14), CSV (15), Print Summary (16), related
tools in v1 (20), a Business landing page (nothing but this tool and its articles would be on it; create it at two
published tools), a monthly or per-unit schedule (13).

### 27. Deferred items
Fixed costs and break-even volume (the Profit tool); ROI and payback (the ROI tool); percentage change helpers (the
Percentage tool); GST-inclusive pricing (needs a verified, dated rule and the GST tool); several products or a price
list; currency; Print Summary and CSV; the discount curve as an on-page chart; saving inputs locally; any
benchmark or "good margin" statement (never in scope). **Margin must not grow into Profit or ROI**; if a request
needs those, it is a case for those tools.

### 28. Commit checkpoint
Subject: `feat: add margin calculator and business content cluster`. Afterwards run the exact-tree verification
(`docs/tool-pack-factory.md`, section 8), one Playwright project and spec at a time with `--workers=1`, no
`npm run dev` server running. Do not push.

## Planning goldens (illustrative; the implementation must re-derive them with the independent reference)

Computed with Python `decimal`, price rounded up to the paisa, other figures unrounded then shown to 4 decimals here.

| # | Scenario | Result |
| --- | --- | --- |
| A | Cost 600, price 800 | profit 200; margin 25.0000%; markup 33.3333% |
| B | Cost 600, target margin 40% | price 1,000.00; profit 400.00; markup 66.6667% |
| C | Cost 600, target markup 40% | price 840.00; profit 240.00; margin 28.5714% |
| D | Cost 1, target margin 0% (boundary) | price 1.00; profit 0.00; margin 0%; markup 0% |
| E | Cost 800, price 700 (loss) | profit −100; margin −14.2857%; markup −12.5000% |
| F | Cost 1,00,00,000 (the limit), margin 95% | price 20,00,00,000.00; profit 19,00,00,000.00; markup 1,900% |
| G | Cost 333.33, target margin 35% (rounding) | price 512.82 (rounded up); profit 179.49; margin 35.0006% (shown 35.00%); markup 53.8475% |
| H | Cost 0.01, target margin 50% (smallest) | price 0.02; profit 0.01; markup 100% |
| I | A with cost changes −10 / −5 / 0 / +5 / +10% | margin at ₹800: 32.50 / 28.75 / 25.00 / 21.25 / 17.50%; price to keep 25%: 720 / 760 / 800 / 840 / 880 (−10 / −5 / 0 / +5 / +10% price) |
| J | Loss case E with cost +5% | cost 840.00; margin at 700 −20.0000%; price that covers the cost 840.00 |
| K | A with a discount of 10 / 20 / 25 / 30% | price 720 / 640 / 600 / 560; profit 120 / 40 / 0 / −40; margin 16.6667 / 6.2500 / 0 / negative; volume multiple 1.6667 / 5.0000 / none / none (1,667 units to replace 1,000 at 10% off, by counting) |
| L | Cost 600, price 1,000 (40% margin), discount 10 / 20% | price 900 / 800; margin 33.3333 / 25.0000%; volume multiple 1.3333 / 2.0000 |
| M | Conversion check: markup 10 / 25 / 50 / 100% | margin 9.0909 / 20.0000 / 33.3333 / 50.0000% |

## Implementation sequence (when approved)
1. Python reference (`tests/fixtures/margin-golden.py`), then the engine (`formulas/margin.js`) and its unit tests
   (focused tests only).
2. The tool module and CSS; `tests/browser/margin.spec.js`; run that spec on one project.
3. Catalog entry activation (in place), `toolStyles.json`, aliases; focused catalog, search, taxonomy, relationships
   tests.
4. The three articles, figure tests, the three images; focused articles tests.
5. Pinned expectations, baselines and visual registration for the pages that change.
6. Final Tool Pack gate once (section 25), then the commit.

## Publication effects to review (Coming Soon → live)
The Calculators and Categories cards for Margin and the Business category card become live; search results and
ranking for "margin", "markup", "selling price"; the Business article count (0 → 3) and the Articles listing; the
Home page (check whether Margin is in the Popular Calculators list; today it is not). The Loans pages, the SIP page
and the other tools do not change.

## Implementation notes (deviations from the plan and decisions made while building)

- **Exact arithmetic.** The engine works on the decimal text the visitor typed with whole numbers (BigInt, scale 1e10)
  instead of doubles. Reason: `600 / (1 - 0.4)` is `1000.0000000000001` in floating point, which a round-up would turn
  into 1,000.01. A test pins 600 at a 40% margin to exactly 1,000.00. Results are handed back as ordinary numbers.
- **Discounted price rounding (not in the plan).** The discounted price is rounded to the nearest paisa (half up) and the
  discount figures follow that rounded price, the same self-consistency rule as a derived price. The plan said nothing
  was rounded; with 12.5% off a 512.82 price the exact figure is 448.7175, which cannot be charged. The reference
  rounds the same way, by a different method (`Decimal.quantize`).
- **Price to keep the margin** is computed as `price × new cost ÷ cost` rounded up (exactly the plan's
  `new cost ÷ (1 − margin)`), because it needs no margin figure that is itself rounded; the reference finds it by
  searching paise and asserts the two agree.
- **Cost-change rows are not clamped** (10% under the smallest cost of ₹0.01 is ₹0.009), as written in the plan.
- **Related articles: two, not three.** The cluster is three articles and Business has no other published article, so each
  Margin article relates to the other two. The pinned tests record this (`MARGIN_PACK_PUBLISHED` gets 2).
- **Basis switching** carries the current price, margin and markup into the other fields to 4 decimals (not 2), so a
  price shown as a 33.3333% markup returns to exactly ₹800.00 after the round-up. With 2 decimals it drifted by 2 paise.
- **Money is shown to the paisa** with a local `Intl.NumberFormat` in the tool, not the shared `formatINR`, which rounds to
  whole rupees. The shared formatter was not changed.
- **A fourth article (supplier cost increase) was not published.** The cost-rise numbers (5% and 10% on a ₹800 price)
  are covered inside "How to price a product for a target margin", so a separate article would repeat it.
- **No fifth cost-change control, chart, print or CSV**, as planned.
- **Repetition observed (recorded, not extracted):** the compare-card CSS and the table CSS were copied again from the
  SIP pack; the `init()` skeleton, the notes and the sr-only rules were copied again; `toolStyles.json` gained another
  identical 22-line entry; the publication touch-list needed the same edits (catalog test, search test, sections test,
  tool-catalog test, articles tests, navigation counts, accessibility, tool-controls and visual registrations). The
  related-count rule had to be extended again because the cluster is smaller than three; the Coming Soon helper meant
  no Coming Soon sample had to be swapped this time.
- **Size (a deviation from the plan's "about 8 KB").** Measured, gzipped: tool module 8.5 KB, formulas 3.3 KB (about
  11.9 KB together), tool CSS 1.7 KB (under the 2 KB estimate), no new dependency, no chart. Most of the JS is the page's
  own copy (guide, assumptions, example, FAQ), which the SIP tool also carries (about 11.2 KB without its chart). It was
  not trimmed to meet the estimate: the explanatory text is part of the product, and the size is in line with the other
  tools.
- **Final verification passed.** Engine golden 50, article figures 6, full unit 631; root and GitHub Pages builds; inventory
  (33 live pages, 26 Coming Soon), links, assets and SEO; visual desktop 14, mobile 14, tablet 8. Browser coverage was run
  spec by spec with `--workers=1` (a monolithic run was stopped twice by memory pressure on this laptop), not as whole
  projects: `subpath-desktop` 17 specs (366 passed, 1 skipped), `subpath-mobile` 15 specs (351 passed, 1 skipped) and
  `root-desktop` 6 specs (136 passed).
- **Later effect (Tool Pack 5).** Once the Profit Calculator was published (`docs/tool-packs/05-profit.md`), the Margin page gained it as a
  related calculator through the category relationship, with no change to Margin's code. The "no related calculators" assertion in the
  Margin browser spec and the Margin visual baselines were updated on purpose, and Business article tools became `[margin, profit]`.
