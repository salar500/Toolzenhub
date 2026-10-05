# Tool Pack 09: CAGR Calculator (the yearly growth rate an investment implies, and two investments compared on that footing)

Status: draft (planning only, not implemented, not approved for build)      Base commit: 7093553
Reserved id and slug: `cagr` (route `/calculators/cagr/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in
`docs/tool-pack-reuse-review.md`; the previous packs are `03-sip.md` to `08-gst.md`.

Build with the established architecture only. **Do not** build a generator, change the shared related-calculator layout, extract table, radio or page CSS, redesign the
breadcrumb or add a framework in this pack; observe repetition and record it.

## Taxonomy (spot check, no re-audit)

Catalog, taxonomy, search index and registry agree for the live tools: EMI → Calculators › Loans; SIP and FD → Calculators › Investment; Margin and Profit → Calculators › Business; GST →
Calculators › Tax; no subcategory is defined. The existing catalog entry is `cagr`: category `investment`, status `coming-soon`, so CAGR is owned by **Calculators › Investment** (a category inside
the one section, Calculators). **Expected breadcrumb:** Home › Calculators › investment › CAGR Calculator (the shared breadcrumb prints the category id, as for SIP and FD). No taxonomy change.

## Selection record

### The real remaining catalog (16 Coming Soon calculators)

Loans: Personal Loan, Loan Eligibility, Interest. Investment: PPF, CAGR. Tax: Income Tax. Business: ROI. Health: BMI, Calorie, BMR. Math: Percentage, Ratio, Age. Converter: Unit Converter, Currency,
Date. (The inventory's 22 Coming Soon entries are these 16 plus 6 article placeholders, none of which is a route.)

### Candidates, re-ranked from scratch

HIGH / MEDIUM / LOW. For maintenance, rule risk, live data, trust complexity and generic risk, lower is better.

| Candidate | Pain | Repeat use | Decision value | Differentiation | Search | Commercial | Links and content | Feasibility | Maintenance | Rule risk | Live data | Trust complexity | Generic risk | Mobile | Flagship | Taxonomy fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **CAGR (Investment), as a growth-rate and two-investment comparison tool** | MEDIUM | MEDIUM (every fund, stock, property or business figure checked) | **HIGH** (a fair comparison across periods) | MEDIUM to HIGH | HIGH | MEDIUM | **HIGH** (SIP, FD, two articles) | HIGH | LOW | NONE | NONE | MEDIUM (a past rate is not a forecast) | MEDIUM | HIGH | MEDIUM to HIGH | **HIGH** |
| Date (Converter) | MEDIUM | HIGH | MEDIUM | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | HIGH (a family of modes) | HIGH | MEDIUM | **LOW to MEDIUM** (may belong to a future Time Tools section) |
| Age (Math) | LOW to MEDIUM | MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | HIGH | HIGH | LOW | MEDIUM (overlaps Date) |
| Percentage (Math) | MEDIUM | HIGH | LOW | LOW to MEDIUM | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | **VERY HIGH** (search engines answer it inline) | HIGH | LOW | MEDIUM |
| ROI (Business) | MEDIUM | MEDIUM | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | HIGH | LOW | NONE | NONE | LOW to MEDIUM | HIGH (profit, CAGR overlap) | HIGH | LOW | HIGH |
| Unit Converter (Converter) | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | LOW | MEDIUM (a large table to keep exactly right) | LOW to MEDIUM | NONE | NONE | LOW | **VERY HIGH** | HIGH | LOW | MEDIUM |
| Ratio (Math) | LOW | LOW | LOW | LOW | MEDIUM | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | VERY HIGH | HIGH | LOW | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | MEDIUM | NONE | **HIGH** (read as diagnosis) | HIGH | HIGH | LOW | MEDIUM |
| Income Tax (Tax) | HIGH | HIGH | HIGH | MEDIUM | HIGH | HIGH | HIGH | MEDIUM | **VERY HIGH** | **VERY HIGH** | NONE | HIGH | LOW | MEDIUM | MEDIUM | HIGH |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | LOW | MEDIUM | MEDIUM | **HIGH** | **HIGH** | NONE | HIGH | MEDIUM | HIGH | MEDIUM | HIGH |
| Currency (Converter) | MEDIUM | MEDIUM | LOW | LOW | HIGH | MEDIUM | LOW | MEDIUM | **HIGH** | NONE | **YES** | MEDIUM | HIGH | HIGH | LOW | MEDIUM |
| Personal Loan / Loan Eligibility / Interest (Loans) | MEDIUM / MEDIUM / LOW to MEDIUM | LOW | LOW to MEDIUM | LOW | HIGH | HIGH / HIGH / LOW | LOW | HIGH / MEDIUM / HIGH | LOW / **HIGH** / LOW | LOW / **HIGH** / NONE | NONE | LOW / **HIGH** / LOW | **HIGH** (EMI) / MEDIUM / HIGH | HIGH | LOW | HIGH |

### Hard rejection

- **Income Tax, PPF:** rule-heavy with no versioning workflow, update owner or stale-rule behaviour; not ready for that burden.
- **Currency:** needs a live rate feed; a manual-rate version is too weak to be a product.
- **Health (BMI, BMR, Calorie):** the result can be read as a diagnosis; one formula each; rejected.
- **Percentage, Ratio, Unit Converter:** `input A, input B, output C` with commodity competition and, for Percentage, an inline answer in search; rejected.
- **Personal Loan, Loan Eligibility, Interest:** an EMI duplicate, a lender's decision, and a generic formula; all stay Coming Soon.
- **ROI:** one obvious formula; its time dimension is CAGR's job and its profit side is Profit's; rejected again.
- **Age:** a thin slice of Date.
- **Date (runner-up):** real repeat use and no rule risk, but it is a family of unrelated modes that sprawls, the competition is extreme, and **it may belong to a future Time Tools section**, so building it
  now would either fix it in Calculators › Converter prematurely or invite a move later. It is deferred until the Time Tools architecture is decided; if it wins a later pack, keep the existing taxonomy
  until then and record the concern, do not redesign the hierarchy.

### Why CAGR wins

1. **A real decision: comparing growth across different periods.** "Fund A went from ₹1,00,000 to ₹1,80,000 in 5 years; fund B to ₹2,40,000 in 9. Which grew faster?" The larger gain is not the higher yearly
   rate (12.47% against 10.22%). CAGR is the fair footing, and a plain calculator does not compare two cases. This is the same lesson as the FD pack (a larger amount over a longer time is not a like-for-like
   result), applied to investments in general.
2. **Looking back and looking ahead are one relationship.** `start × (1 + g)^years = end`. Solving for `g` with an end value that happened is a growth rate; with an end value that is wanted it is the rate
   a goal needs. One engine, two honest framings, no unrelated modes.
3. **It exposes a common shortcut.** Dividing the total growth by the number of years (80% over 5 years is "16% a year") overstates the yearly rate that compounding implies (12.47%). Showing the
   simple yearly average (total growth ÷ years) next to the CAGR makes the difference visible.
4. **Evergreen and exact enough.** No rate, rule, feed or classification; the result is a function of three numbers the visitor supplies.
5. **It deepens Investment with a third, genuinely different tool and links it to SIP and FD** (both are about growth; CAGR is how to judge a past figure; neither SIP nor FD compares two outcomes).

### Answers to the product questions

- **Who:** an individual investor, a small-business owner or an analyst checking how fast something grew: a fund or stock holding, a property, a business figure such as revenue.
- **Trigger:** they hold a start value and an end value after some years and want the yearly rate, or have a target and want the rate it needs; often two options side by side.
- **Problem:** the annual growth rate that connects two values over a period, and whether one investment grew faster than another.
- **Decision after the result:** how a past outcome compares with another, or whether a goal's required rate looks realistic to them. The tool never says which is good.
- **Return:** every new holding, fund factsheet, property or target; a different period.
- **Beyond the formula:** the contrast with the simple yearly average, a growth multiple, and a neutral side-by-side of two cases on one yearly footing.
- **What can go wrong:** reading a past CAGR as a forecast; using it for money that was added or withdrawn on the way (SIPs, top-ups); ignoring fees, tax and inflation; a short or lucky period.
- **Excluded or qualified:** contributions and withdrawals (regular investing, XIRR), fees, tax, inflation, dividends unless the end value includes them, and any future return.

## Trust standard

- **Facts the visitor enters:** the starting value, the ending value (or target) and the period.
- **Assumptions:** one lump sum with nothing added or withdrawn, a constant yearly growth rate that would turn the start into the end, compounded yearly, over a whole period of at least one year.
- **Calculated outputs:** the CAGR, the total growth, the growth multiple, the simple yearly average, and, for a second case, the same figures and the differences.
- **Exclusions (shown next to the result):** money added or withdrawn on the way (a SIP or a top-up is not a lump sum), fees, tax, inflation, dividends unless counted in the end value, and what the investment
  will do next.
- **Banned claims:** "expected return", "you will earn", "good" or "bad" return, "beats the market", "best investment", "safe", "guaranteed", "recommended", any statement that a past rate will continue, any
  benchmark or fund named as a comparison.
- **Wording for a comparison:** "Investment B grew at 10.22% a year against 12.47% for A, over a longer period." Differences are stated, never ranked.
- **Local only:** nothing leaves the browser.

## Spec

### 1. Tool identity
CAGR Calculator; `cagr`; Calculators, Investment; no subcategory; `toolType` calculator. Keep the catalog title "CAGR Calculator". New description (replaces "Calculate compound annual growth rate."): "Find the
yearly growth rate that connects a starting and an ending value over a period, see how it differs from a simple average, and compare two investments on the same yearly footing." Aliases (true names only):
"compound annual growth rate", "annualized return calculator", "required cagr", "cagr comparison". Not aliases: "best returns", "fund returns", "xirr", "sip returns".

### 2. User problem
**This tool helps an investor or business owner understand the yearly growth rate behind a start value and an end value, and compare two cases fairly, when judging how something grew or what rate a goal needs.**

### 3. Jobs to be done
- It went from ₹1,00,000 to ₹1,80,000 in 5 years: what yearly rate is that, and how does it differ from "80% in 5 years"?
- I have ₹5,00,000 and want ₹1 crore in 15 years: what yearly growth does that need?
- Fund A over 5 years or fund B over 9: which grew faster per year?
- Why is 80% growth over 5 years not 16% a year?

### 4. Target users
Anyone checking growth between two values over a whole number of years or more. Not for regular investing (SIP), for cash flows at different dates, or for forecasting.

### 5. Inputs
Mode control (Margin's segmented radio), then two number fields and a years-and-months pair in the shared grid (one column on a phone), a hint under each field, "(optional)" on optional ones, Reset.

| Field | Meaning | Unit | Required | Default | Limits | Helper text | Message when invalid |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mode | looking back (a value that happened) or looking ahead (a value you want) | choice: Looking back, Looking ahead | yes | Looking back | one of two | "Looking back: you know the ending value. Looking ahead: you want to reach a target value." | "Choose looking back or looking ahead." |
| Starting value | the value at the beginning | ₹ (two decimals) | yes | 1,00,000 | 0.01 to 99,99,99,999.99 | "The value at the start, in one amount." | "Enter a starting value between ₹0.01 and ₹99,99,99,999.99." |
| Ending value (Looking ahead: Target value) | the value at the end, or the one you want | ₹ | yes | 1,80,000 | 0.01 to 99,99,99,999.99, and between 1/1,000 and 1,000 times the starting value | "The value at the end, including anything you count as part of it." | "Enter an ending value between ₹0.01 and ₹99,99,99,999.99, no more than 1,000 times or less than 1/1,000 of the starting value." |
| Period (years and months) | how long it took, or how long you have | years + months | yes | 5 years 0 months | years 1 to 50, months 0 to 11, total 12 to 600 months | "A whole period of at least one year, for example 5 years and 6 months." | "Enter a period of at least 1 year, up to 50 years, with months from 0 to 11." |
| Investment B ending value (optional) | a second case, in the same units | ₹ | no (blank means no comparison) | blank | as the ending value | "Leave blank to skip. Enter a second ending value to compare two cases." | as the ending value, or leave it blank |
| Investment B starting value (optional) | the second case's start | ₹ | no | blank (the same as the first) | as the starting value | "Leave blank to use the same starting value as the first case." | as the starting value |
| Investment B period (optional) | the second case's period | years + months | no | blank (the same as the first) | as the period | "Leave blank to use the first case's period." | as the period |

Left out of v1: amounts added or withdrawn along the way, dates instead of a period, a period under one year, a third case, units other than rupees, inflation or fees, a chart of the path, future-value projection
from an assumed rate (SIP and FD do that).

### 6. Outputs and result hierarchy
Above the fold on desktop: the form, then the result block.
1. **Primary:** the **CAGR** (large), labelled "Compound annual growth rate" (Looking back) or "Yearly growth needed" (Looking ahead).
2. **Supporting cards (three, so with the primary the grid is a balanced two-by-two):** **total growth** over the whole period; the **growth multiple** (the end divided by the start, "1.80 times"); the **simple yearly
   average** (total growth divided by the years), which is the figure people misread as the rate. Each answers a different question.
3. **Summary (one or two sentences):** "₹1,00,000 growing to ₹1,80,000 over 5 years is a compound annual growth rate of 12.47%. Total growth is 80.00%, which is 16.00% a year as a simple average; the two differ because growth compounds."
4. **Trust note** beside the result.
5. **Comparison table (only when Investment B has an ending value):** see section 12.
6. **Next useful actions (related tools):** SIP and FD.
No metric is shown that the visitor has to decode, and nothing is judged good or bad.

### 7. Model rules
Start `S`, end `E`, period `m` months, `t = m ÷ 12` years.
- **CAGR** `g = (E ÷ S)^(1 ÷ t) − 1`. It is an irrational number in general, so it is shown to two decimals; exactly representable cases (100 to 121 over 2 years is 10.00%) must display exactly.
- **Total growth** `(E − S) ÷ S`; **growth multiple** `E ÷ S`; **simple yearly average** `(E − S) ÷ S ÷ t`.
- **Loss and no change:** `E < S` gives a negative CAGR (50% of the start over 3 years is −20.63%); `E = S` gives 0.00%; `E` cannot be 0 (a total loss is `−100%` and the tool is not for it: the minimum is 0.01 and the ratio is bounded).
- **Looking ahead** uses the same formula with the target as `E`; only the words change ("needed", never "expected").
- **Precision and rounding:** the values are typed decimals; the ratio is computed from whole-number paise to avoid float drift in the inputs, the root with high-precision arithmetic (the engine may use a floating power if the
  reference shows it agrees to at least 10 significant digits on every golden), and percentages are shown to two decimals, rounded half up, with the sign kept (−20.63%).
- **Comparison:** each case is computed separately from its own start, end and period (blank values inherit the first case's); differences are `B − A` in percentage points of CAGR. When the periods differ the
  page says that the CAGR puts them on a yearly footing but says nothing about what either does outside its own period or how the money was used.
- **Impossible states:** a ratio outside 1/1,000 to 1,000, a period under 12 or over 600 months, or an amount outside its limits are validation errors, never a result.

### 8. Assumptions (shown on the page)
One lump sum with nothing added or withdrawn; a constant yearly growth rate compounded yearly; a whole period of at least one year. Not included: regular investments or withdrawals (a SIP is not a lump sum), fees, tax, inflation, dividends unless counted in the end value, and what happens next. A past rate is not a forecast. A calculation from the numbers entered, not advice.

### 9. Edge cases
- End equal to start (0.00%); end below start (a negative CAGR, shown with its sign and a plain sentence); a very high ratio over a year (the largest allowed: 1,000 times in one year, a very large rate shown in full).
- A period with months (5 years 6 months) and the shortest and longest allowed periods (12 and 600 months).
- Exactly representable results (10.00%); a result that rounds across a half (to be pinned by the reference).
- Investment B with the same values as the first (a difference of 0.00 points); with only an ending value (inherits the first case's start and period); with a different period (the on-page note); with a blank ending value but other B fields filled (ignored).

### 10. Validation
Limits and messages as in section 5, tool-owned, with the shared field helpers for linked errors (`aria-invalid`, `aria-describedby`). An emptied required field shows the prompt, not an error; an emptied
optional field means none. Nothing negative or zero.

### 11. User journey
1. The visitor arrives with two values and a period ("it was ₹1,00,000, now it is ₹1,80,000, five years on").
2. They choose Looking back or Looking ahead, then enter the start, the end and the period (three decisions, one screen).
3. The CAGR is the first, largest figure, with the total growth, the multiple and the simple yearly average beside it.
4. The summary sentence states the working and why the average differs.
5. They add a second case and the comparison table appears.
6. The assumptions and what is not included sit beside the result.
7. They try another holding, or open SIP or FD.

### 12. Table decision
**Table: YES**, one, only when Investment B has an ending value. Question: "how do these two growth records compare once each is put on a yearly footing?" Columns: (row label), Investment A, Investment B,
Difference (B − A). Rows: Starting value; Ending value; Period; Total growth; Growth multiple; Simple yearly average; Compound annual growth rate. Seven rows; the CAGR row last and visually the same weight as the others
(nothing is highlighted as better). When the periods differ, one sentence under the table says the CAGR puts them on a yearly footing without saying anything about what either did outside its period. On a phone it scrolls
in a labelled region with a sticky first column (as the other tables). Signs are in text.

### 13. Chart decision
**NOT NEEDED.** A growth path would be an assumed smooth curve between two values, which the data does not contain; the figures and one comparison table say everything true.

### 14. Print and CSV decisions
**Print Summary: NOT NEEDED. CSV: NOT NEEDED.** A rate is a working answer; the print CSS is still unshared. Revisit with evidence.

### 15. Retention
Each fund, stock, property, business figure or goal brings new values and a new period; investors compare several. No account, saved cases or notifications; revisit only with evidence (section 27).

### 16. Mobile behaviour
At about 390px: one column; the mode as two full-width segments (at least 44px high); the years and months side by side; the primary result visible after the form; the four cards stacking; the comparison table scrolls in a labelled
region with a sticky first column; tap targets at least 36px; no horizontal page scroll. Investment B is visually secondary so the first screen stays simple.

### 17. Accessibility requirements
Labelled fields with linked hints and errors; the mode as a `fieldset` with a `legend` and radio inputs (tick drawn by CSS, kept out of the accessible name); the period and Investment B period as labelled groups; a polite
live region with one sentence ("CAGR 12.47%; total growth 80.00%."); table caption and `scope`; differences in words with a sign; text contrast 4.5:1; the shared focus ring; no animation.

### 18. Search keywords and aliases
Aliases "compound annual growth rate", "annualized return calculator", "required cagr", "cagr comparison". Queries to check: "cagr", "compound annual growth rate", "annualized return", "required cagr". CAGR must be found as a
published tool; PPF stays Coming Soon and must not appear as usable. No alias promises returns, funds or rankings.

### 19. Related calculators and articles
- **Live:** SIP and FD, through the Investment category (reciprocal automatically: the SIP page's related calculators become FD and CAGR, the FD page's become SIP and CAGR; both existing pages and their baselines
  change on purpose). **Future, only as they exist:** PPF.
- **Cross-category:** none planned (a Business link for revenue growth is deferred).
- **Articles:** the two below, listing each other, plus one SIP or FD article each where genuinely related.

### 20. Article cluster and article visual strategy
Distinct, no forced count, no forecast or advice. Image decisions follow "concept first, format second"; neither visual repeats the FD spans, the FD tick rows, the GST proportion bar or the GST flow, and neither is a conventional chart.

**Article 1: CAGR vs simple average growth: why 80% growth over 5 years is not 16% CAGR** (explanation of the measure)
- *Intent:* people divide total growth by the number of years and call it the yearly rate. *Unique value:* ₹1,00,000 growing to ₹1,80,000 over 5 years is 80.00% in total; dividing by 5 gives 16.00% a year (the calculator's
  "simple yearly average", defined only as total growth divided by years), but the compounded annual growth rate is about 12.47%: the equal yearly rate that connects the start to the end. The gap widens with the period.
  *Calculator relationship:* the simple-yearly-average and CAGR cards. *Not a duplicate:* it is about the measure, not about comparing cases. The article does not call 16% an average of yearly investment returns, and the tool
  models no series of yearly returns.
- **IMAGE: YES.** *Visual purpose:* show why spreading total growth evenly is not the same as compounding an equal yearly rate. *Visual type:* **compounded-step comparison diagram**: on the left one start block; two
  routes to the same end block on the right. The upper route divides the 80% total growth into five equal additive parts, each 16% of the start (the simple shortcut, where nothing compounds); the lower route is five
  equal compounded steps (each about 12.47% of the value before it, so each step is larger than the last in absolute terms) that reach the same relative end size. Relative sizes only, with no numeric labels. *Why this type:* the concept is spreading growth evenly versus compounding an equal yearly rate.
  *Why not a conventional chart:* there is no observed yearly dataset; the intermediate path is a mathematical model connecting two known endpoints, not measured history. *Data source:* the model's ratio 1.8, five steps, and the
  per-step multiplier (about 1.1247), drawn as proportions. *Anti-repetition:* a compounding step route with a comparison overlay, unlike the FD duration spans and tick rows and unlike the GST proportion bar and grouping flow; it uses
  steps because the concept depends on compounding across periods. *Alt-text intent:* a starting value reaches the same ending value through five equal compounded growth steps, illustrating why total growth divided by five is different
  from CAGR. If review finds the diagram reads as a chart or as a forecast, use no image rather than add axes or figures.

**Article 2: Comparing two investments over different periods: a bigger gain is not a higher yearly rate** (a worked scenario)
- *Intent:* A turned ₹1,00,000 into ₹1,80,000 in 5 years and B turned it into ₹2,40,000 in 9. *Unique value:* B's total growth (140.00%) is larger than A's (80.00%), yet B's CAGR is 10.22% against A's 12.47%; the simple
  yearly averages (15.56% and 16.00%) nearly agree and hide the difference; the CAGR says what each did per year and nothing about what happens outside the period or how the money was used. *Calculator relationship:* the
  Investment B fields and the comparison table. *Not a duplicate:* it is about comparing cases across periods, not about the measure itself, and it does not repeat the FD article's fixed-deposit setting.
- **IMAGE: YES.** *Visual purpose:* make the number of yearly steps and the size of each step visible. *Visual type:* **equal-step growth diagram**: two rows of equal-width year steps, five for A and nine for B, each step a
  small rise; A's rises are larger and B's smaller, and B's row is longer and ends higher. *Why this type:* the idea is the per-step rate across different step counts, which equal steps show; one overall height would
  hide it. *Why not a chart:* there is no measured series (the steps are the model's constant rate, not data); if the staircase reads as a chart in review, drop the image rather than add axes. *Data source:* the step
  counts (5 and 9) and the per-step multipliers from the model (1.1247 and 1.1022), shown as proportions with no figures. *Anti-repetition:* rising equal steps, unlike the FD duration spans. It shares the step idea with article 1, so the two must stay visibly distinct (article 1 is one case reaching one end by two routes; article 2 is two cases with different step counts); if review finds they read as one template, one of them uses no image.
  *Alt-text intent:* two stairs of yearly steps, one with five larger steps and one with nine smaller steps that ends higher.

**Candidate, not committed:** "Why CAGR does not suit a SIP" (money added on the way is not a lump sum; XIRR is out of scope). It depends on a measure the site does not offer and invites advice, so it is not built.
**Rejected:** "good CAGR for mutual funds" and "best return" (a ranking and a benchmark), "CAGR of stocks" (named securities), "inflation-adjusted CAGR" (a different tool).

### 21. Site-wide UX consistency
Reused, nothing invented: Inter and the green/action system; the shared number field (label, unit, hint, linked error, `aria-invalid`) in the two-column desktop grid and single mobile column; the years-and-months pair as
in SIP and FD; "(optional)" labelling; Margin's segmented radio for the mode; the secondary Reset that looks clickable; the shared focus ring; the `calculator-results__*` primary and card metrics (a primary and three
cards, a balanced 2×2); the labelled scrollable table with a sticky first column; the neutral trust note; section titles with the green rule; the live region; the shared breadcrumb; the related-calculators and
related-articles layout; the article template. **Justified difference:** none planned. Not allowed: new colours, spacing scales, button styles, a chart, decorative imagery in the tool.
Design quality: the CAGR is the first and largest figure; the three cards answer three questions; the table appears only when asked for; no orphan card, no filler metric.

### 22. Independent verification and tests (impact-based)
**Independent reference:** `tests/fixtures/cagr-golden.py` (Python `decimal`, 60 digits). It does **not** compute the root with the engine's power: it finds `g` by **bisection on `(1 + g)^t = E ÷ S`** to 40 digits and
asserts the result raises back to the ratio, then compares with a separate `ln`/`exp` derivation. It also checks the exactly representable cases (100 to 121 over 2 years is exactly 10%), the half-rounding boundaries,
the invariants (monotonic in the end value, antisymmetry of growth and loss) and prints the figures quoted in the articles. The JSON is embedded as `GOLDEN` in `tests/unit/cagr-golden.test.mjs`; nothing is copied from the
JavaScript.
**During implementation, test what changed and its real consumers only:**
- formula change: `tests/unit/cagr-golden.test.mjs` only;
- tool UI change: `tests/browser/cagr.spec.js` on `subpath-desktop`, then `subpath-mobile` only if layout can change;
- article figures: `tests/unit/cagr-articles.test.mjs`; article image: only the focused asset check (exists, PNG and WebP, small, alt text describes the concept);
- publication: focused catalog, search, taxonomy, relationships, sections, tool-catalog and articles unit tests; the **real consumers** of the new relationships are the **SIP and FD pages** (their related calculators
  gain CAGR) and the Calculators and Articles listings, the Home page is **not** affected (CAGR is not in its Popular list; verify, do not retest Home);
- a shared helper or CSS change (none planned): identify its actual consumers first;
- use `tests/helpers/coming-soon.mjs`, never name a tool (after publication `getComingSoonTool({ category: "investment" })` returns PPF).
**Required taxonomy assertions at publication:** pin `cagr` as `section = Calculators`, `category = Investment`; assert the derived hierarchy; assert the built breadcrumb `Home › Calculators › investment › CAGR Calculator`;
assert PPF remains Coming Soon in Investment; keep the existing SIP and FD pins.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, the three browser projects with `--workers=1` spec by spec (never reported as monolithic; preserve completed coverage after
any memory kill and continue only the missing specs), and the three visual projects. Before it: stop only clearly stale project processes; clean `test-results`, `tests/.tmp` and `tests/fixtures/__pycache__`.
- **Unit:** golden scenarios; invariants (CAGR rises with the end value and falls with the period; the loss/gain symmetry; the growth multiple equals the ratio; `(1 + g)^t` returns the ratio); validation, optional values.
- **Browser:** live results, both modes, a period with months, no change, a loss, extremes, the comparison (same values, a different period, inherited start and period, an ending value only, a blank ending value with
  other fields), validation with linked errors, reset, keyboard, mobile layout, search by name and aliases, the related SIP and FD cards, the articles; no "good", "expected", "will earn" or ranking wording.
- **Accessibility entries; visual baselines** for the new page and every page that changes (SIP and FD among them).

### 23. Planning goldens (illustrative; the implementation re-derives them with the independent reference)

Computed with Python `decimal` this phase; start, end in rupees; period in months.

| # | Scenario | Result |
| --- | --- | --- |
| A | 1,00,000 to 1,80,000, 60 months (the default) | CAGR **12.4746%**; total growth 80.0000%; multiple 1.8000; simple yearly average 16.0000% |
| B | 1,00,000 to 2,40,000, 108 months | CAGR **10.2163%**; total growth 140.0000%; multiple 2.4000; simple yearly average 15.5556% |
| C | 100 to 121, 24 months (an exactly representable result) | CAGR **10.0000%** exactly |
| D | 1,00,000 to 1,00,000, 60 months (no change) | CAGR 0.0000%; total growth 0.0000% |
| E | 1,00,000 to 50,000, 36 months (a loss) | CAGR **−20.6299%**; total growth −50.0000%; simple yearly average −16.6667% |
| F | 1,00,000 to 1,01,000, 12 months (the shortest period) | CAGR 1.0000% |
| G | 1,00,000 to 1,50,000, 42 months (a period with months) | CAGR **12.2824%**; simple yearly average 14.2857% |
| H | Looking ahead: 5,00,000 to 1,00,00,000, 180 months | needed yearly growth **22.1055%**; multiple 20.0000 |
| J | the largest ratio in a year: 1 to 1,000, 12 months | CAGR 99,900.0000% |
| K | the longest period: 1,00,000 to 1,00,001, 600 months | CAGR rounds to 0.0000% (the true value is about 0.00002%); total growth 0.0010% |
| L | A (case 1: 1,00,000 to 1,80,000, 60 months) against B (case 2: 1,00,000 to 2,40,000, 108 months) | CAGR 12.4746% against 10.2163%; difference −2.2583 points; total growth 80.0000% against 140.0000% |
| M | B with only an ending value (start and period inherited) | the same start and period as A |
| N | B identical to A | difference 0.0000 points |

### 24. SEO plan
Search intent: "cagr calculator", "compound annual growth rate", "annualized return calculator", "required cagr". Title direction "CAGR Calculator: Annual Growth Rate and Compare Investments | ToolZen Hub" (trim to site
conventions if the SEO check requires). Description direction: the yearly growth rate between two values, how it differs from a simple average, and a comparison of two investments; calculated from your numbers, not a
forecast. Canonical `https://toolzenhub.in/calculators/cagr/`; one H1; breadcrumb structured data from the shared model; form, example and FAQ in the static HTML. Better than a generic page because it shows the
simple-average contrast and compares two cases. No fund, stock or "best return" pages.

### 25. Performance constraints
Vanilla JS, dynamic import, browser-local calculation, native UI, no dependency; the tool code loads only on its own page; images optimized (simple diagrams, small as PNG and WebP). No API or data feed. No artificial
size budget.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (13), CSV and Print (14), a period under a year and cash flows (27), a Business revenue link (19).

### 27. Deferred items
Money added or withdrawn on the way (SIP-style and XIRR); dates instead of a period; a period under one year; a third case; other currencies or units; inflation, fee or tax adjustment; a projected future value from an
assumed rate; saved cases (revisit with evidence that visitors re-enter several cases in a session); any named fund, stock, index or benchmark (never in scope).

## Category landing-page decision (Investment)

After this pack Investment has **three live tools** (SIP, FD, CAGR), the first category besides Loans to reach that depth, and still only a category card linking to `categories.html`. A hub is now plausible but not
urgent and **not part of this pack**: revisit Investment, Business (2) and Tax (1) together as **one separate category-foundation phase**, which should also decide how a category page lists future tools and articles.
Taxonomy ownership (Calculators › Investment) does not depend on a landing page.

## Future section and taxonomy concern (recorded only)

Date (the runner-up) may belong to a future **Time Tools** section rather than Calculators › Converter. This pack does not touch it. If Date is selected later, decide then whether to keep Converter or wait for the Time
Tools architecture; the hierarchy stays Section → Category → optional Subcategory → Tool and is not changed here.

## Known shared-quality issues (deferred, unrelated to this pack)

`home-loan.css` contains the invalid property `home-loan-bottom`; the Articles listing's pagination wraps "Next" on a phone; the years-and-months, radio-segment, table and page-skeleton CSS is repeated across tools; the
shared breadcrumb prints the lowercase category id; the Loans related-card grid wraps three plus one. None is touched or made more urgent by this pack (the CAGR page has two related cards; SIP and FD gain a second).

## Publication effects to review (Coming Soon → live)
- **SIP and FD pages** gain CAGR as a related calculator through the category (their specs' related assertions, DOM and visual baselines change on purpose; these are the real consumers to test, no others).
- **Listings and counts:** the Calculators listing (11 built, 15 Coming Soon); the Investment category card and its article count (6 → 8), the Articles listing (pagination to read from the catalog) and sidebar; search and
  ranking for "cagr", "growth", "annual"; inventory (the tool and two new articles: 47 → 50 live pages; Coming Soon calculators 16 → 15, article placeholders unchanged at 6, entries 22 → 21); DOM, link and SEO baselines.
- **Not affected:** the Home page (CAGR is not in its Popular list; check, do not retest), Loans, Business and Tax pages. The Coming Soon helper's first Investment pick becomes PPF.

## Implementation sequence (when approved)
1. `tests/fixtures/cagr-golden.py`, then `formulas/cagr.js` and its unit tests; focused tests only.
2. The tool module and CSS; `tests/browser/cagr.spec.js`; run it on one project, then mobile if layout can change.
3. Catalog activation in place (title kept, description and aliases changed), `toolStyles.json`; focused catalog, search, taxonomy (with the pinned CAGR assertions), relationships, sections and tool-catalog tests;
   update only the SIP and FD related assertions and baselines that actually change.
4. The two articles, figure tests and the two diagram images (checked individually for concept, size and alt text); focused article tests.
5. Pinned expectations, baselines and visual registration for the pages that change.
6. Final Tool Pack gate once (section 22), then the commit.
