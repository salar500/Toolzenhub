# Tool Pack 08: GST Calculator (add or remove GST across the items of an invoice)

Status: built and verified (commit pending)      Base commit: 5d37d6c
Reserved id and slug: `gst` (route `/calculators/gst/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in
`docs/tool-pack-reuse-review.md`; the previous packs are `03-sip.md` to `07-fd.md`.

Build with the current proven architecture only. **Do not** build a generator, change the shared related-calculator layout, extract table/radio/page
CSS, redesign the breadcrumb or add a framework in this pack; observe repetition and record it.

## Taxonomy verification (done statically, before selecting)

Derived from `assets/js/data/categories.js` (one section, `calculators`; eight categories each naming `sectionId`), `assets/js/data/tools.js` (a tool names its
`category`) and `assets/js/data/taxonomy.js` (tool → category → section), then cross-checked against the search index and the registry:

| Tool | Taxonomy | Search index | Registry | Subcategory |
| --- | --- | --- | --- | --- |
| EMI | Calculators › Loans | Calculators › Loans | loans | none |
| Home Loan | Calculators › Loans | Calculators › Loans | loans | none |
| SIP | Calculators › Investment | Calculators › Investment | investment | none |
| FD | Calculators › Investment | Calculators › Investment | investment | none |
| Margin | Calculators › Business | Calculators › Business | business | none |
| Profit | Calculators › Business | Calculators › Business | business | none |

**Result: PASS.** Investment (like Loans, Tax and Business) is a **category inside Calculators**, never a top-level section; there is one section today and
no subcategory is defined. The catalog entry `gst` already exists: id `gst`, category `tax`, status `coming-soon`, so GST is owned by **Calculators › Tax**. Tax has
no live tool yet, so GST is its first.

## Future section architecture (preserved, not built)

The model stays **Section → Category → optional Subcategory → Tool**. Developer Tools and Time Tools / Timers may later be added as further entries of `sections`
(each with its own `pathPrefix`) and their own categories; nothing here pre-empts that. The Converter entries (Unit Converter, Currency, Date) stay where they are;
if some later belong to a future Time Tools section (Date is the likeliest) that is a separate decision, not made here.

## Selection record

### The real remaining catalog (17 Coming Soon calculators)

Loans: Personal Loan, Loan Eligibility, Interest. Investment: PPF, CAGR. Tax: GST, Income Tax. Business: ROI. Health: BMI, Calorie, BMR. Math: Percentage, Ratio,
Age. Converter: Unit Converter, Currency, Date. (The inventory's 23 Coming Soon entries are these 17 plus 6 article placeholders, none of which is a route.)

### Candidates re-ranked from scratch

HIGH / MEDIUM / LOW. For maintenance, rule risk, live data, trust complexity and generic risk, lower is better. Nothing carries over from Pack 7's ranking.

| Candidate | Pain | Repeat use | Decision value | Differentiation | Search | Commercial | Links and content | Feasibility | Maintenance | Rule risk | Live data | Trust complexity | Generic risk | Mobile | Flagship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **GST (Tax), as an invoice-level add / remove with a breakdown by rate** | MEDIUM to HIGH | **HIGH** (invoice after invoice) | MEDIUM | MEDIUM to HIGH | HIGH | HIGH | HIGH (Margin, Profit, first Tax tool) | HIGH | LOW (the rate is the user's) | LOW to MEDIUM | NONE | MEDIUM | MEDIUM (one-line calculators are everywhere) | HIGH | **MEDIUM to HIGH** |
| Date (Converter), days between / add or subtract / business days | MEDIUM | HIGH | MEDIUM | MEDIUM | HIGH | LOW | LOW | HIGH | LOW (holidays are the user's) | NONE | NONE | LOW | HIGH (many mode collections) | HIGH | MEDIUM |
| CAGR (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | LOW | MEDIUM (SIP, FD) | HIGH | LOW | NONE | NONE | LOW | HIGH | HIGH | MEDIUM |
| ROI (Business) | MEDIUM | MEDIUM | MEDIUM | MEDIUM | MEDIUM | MEDIUM | MEDIUM (Margin, Profit) | HIGH | LOW | NONE | NONE | LOW to MEDIUM | HIGH | HIGH | LOW to MEDIUM |
| Percentage (Math) | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | **VERY HIGH** | HIGH | LOW |
| Unit Converter (Converter) | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | LOW | MEDIUM (a large table to keep right) | LOW to MEDIUM | NONE | NONE | LOW | **VERY HIGH** | HIGH | LOW |
| Income Tax (Tax) | HIGH | HIGH (yearly) | HIGH | MEDIUM | HIGH | HIGH | HIGH | MEDIUM | **VERY HIGH** (slabs, regimes, deductions, years) | **VERY HIGH** | NONE | **HIGH** | LOW | MEDIUM | MEDIUM |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | LOW | MEDIUM | MEDIUM | **HIGH** (rate, limits, lock-in, extension rules) | **HIGH** | NONE | HIGH | MEDIUM | HIGH | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | MEDIUM (formula choice) | NONE | **HIGH** (reads as diagnosis) | HIGH | HIGH | LOW |
| Currency (Converter) | MEDIUM | MEDIUM | LOW | LOW | HIGH | MEDIUM | LOW | MEDIUM | **HIGH** | NONE | **YES** | MEDIUM | HIGH | HIGH | LOW |
| Interest / Personal Loan / Loan Eligibility (Loans) | LOW to MEDIUM / MEDIUM / MEDIUM | LOW | LOW to MEDIUM | LOW | HIGH | LOW / HIGH / HIGH | LOW | HIGH / HIGH / MEDIUM | LOW / LOW / **HIGH** | NONE / LOW / **HIGH** | NONE | LOW / LOW / **HIGH** | HIGH / **HIGH** (EMI) / MEDIUM | HIGH | LOW |

### Hard rejection

- **Income Tax:** high pain, but it needs assessment-year and regime versioning, an update owner, stale-version behaviour and pinned rule tests that ToolZen Hub does not
  have; rejected for now.
- **PPF:** a government rate, deposit limits, lock-in and extension rules that change; no versioning workflow; rejected for now.
- **Health (BMI, BMR, Calorie):** the result can be read as a diagnosis and depends on formula and demographic choices; one formula per tool; rejected.
- **Percentage, Ratio, Unit Converter:** `input A, input B, output C` with no added value; commodity; rejected. **Age** overlaps Date.
- **Currency:** needs a live rate feed that is stale the moment it is cached; rejected.
- **Interest, Personal Loan:** a generic formula and an EMI wrapper; **Loan Eligibility:** a lender's decision, overlapping Home Loan. All three stay Coming Soon.
- **ROI and CAGR:** each is one obvious formula whose time dimension drags in the other (and in payback); neither has a decision that is not already served by Profit, Margin,
  SIP or FD. Not rewarded merely for completing a Business or Investment trio.
- **Date:** a real tool with real repeat use and no rule risk, but it is a family of modes (between, add, subtract, business days, age) that is easy to let sprawl, the
  competition is extreme, and it may belong to a future Time Tools section. It is the **runner-up**.

### Why GST wins

1. **The strongest genuine repeat use left.** A person who raises or checks invoices, quotes, bills or purchase prices does it again and again, each time with a different
   amount and often a different rate.
2. **A one-line formula is the starting point, not the product.** Every GST calculator adds or removes a rate on one amount. The job in practice is an **invoice**: several
   items at different rates, the tax split by rate, and a total that adds up. ToolZen Hub shows all three amounts (before GST, the GST, with GST), the share the tax is of the
   final amount, and a breakdown by rate for up to four items.
3. **A mistake people actually make.** Removing GST by subtracting the rate from the inclusive amount (₹1,180 less 18% gives ₹967.60, not ₹1,000) is wrong, because the tax is
   15.25% of the inclusive amount, not 18%. Showing the share, and the two articles, address a real error.
4. **Evergreen.** The visitor types the rate. No rate table, product class, return or credit is embedded, so there is nothing to version; if rates change the tool is still
   right for whatever rate is entered.
5. **It connects the Business tools.** Margin and Profit work on prices "before GST" and say so; GST is the natural next step for the same business visitor, and it opens the
   Tax category with a low-risk tool.

### Answers to the product questions

- **Who:** a small-business owner, a shopkeeper, a freelancer or an accountant's assistant; also a buyer checking a bill.
- **Trigger:** an invoice or quote is being made, or a price on a bill needs to be split into the amount and the tax.
- **Problem:** what the GST is, what the amount is before it, and what the total is, for one item or several, at the rate(s) they enter.
- **Decision after the result:** what to write on the invoice, what to quote, or whether a bill's tax line is what they expect.
- **Return:** every invoice, quote or bill; each new item mix; a different rate.
- **Beyond the formula:** all three amounts at once, the tax as a share of the total, a by-rate breakdown for mixed items, exact paise rounding stated, and a plain explanation
  of why adding then removing the same rate is not subtracting it.
- **What can go wrong:** treating it as a tax determination or filing aid; the rate must be the visitor's; rounding conventions vary between invoices and software.
- **Excluded or qualified:** which rate applies to a product or service, HSN or SAC classification, input tax credit, returns, cess, reverse charge, place of supply,
  e-invoicing and rounding rules of any particular accounting software.

## Trust standard

- **Facts the visitor enters:** each amount and the rate for each item, and whether the amounts already include GST.
- **Assumptions:** the rate is the one entered, GST is one percentage of the amount before it, and each item's tax is rounded to the paisa (half up) before the items are added.
- **Calculated outputs:** the amount before GST, the GST, the amount with GST, the tax as a share of the amount with GST, and the totals by rate.
- **Exclusions (shown next to the result):** which rate applies to what, classification, input tax credit, returns, cess, reverse charge, place of supply, e-invoicing, and any
  rounding rule other than the one stated. Another system may differ by a paisa on a multi-item invoice.
- **Banned claims:** "correct rate", "the GST on this product is", "you must charge", "eligible for credit", "compliant", "tax advice", "official", "file", any rate presented as
  current or applicable, any product or HSN claim.
- **Rates are the visitor's:** the default 18% is labelled as an example, not as the rate for anything.
- **Local only:** nothing leaves the browser.

## Spec

### 1. Tool identity
GST Calculator; `gst`; Calculators, Tax; no subcategory; `toolType` calculator. Keep the catalog title "GST Calculator". New description (replaces "Calculate GST easily and
accurately."): "Add GST to an amount or take it out of one, for the rate you enter, across up to four items, with the tax by rate. Calculated from your numbers." Aliases (true
names only): "add gst", "remove gst", "gst inclusive exclusive", "reverse gst calculator". Not aliases: rate lists, "gst rate for", "hsn".
**Expected breadcrumb:** Home › Calculators › tax › GST Calculator (the shared breadcrumb prints the category id, as for SIP and FD).

### 2. User problem
**This tool helps a small-business owner or a buyer understand the amount before GST, the GST and the amount with GST for one or several items, when raising an invoice, quoting a
price, or splitting the tax out of a bill.**

### 3. Jobs to be done
- I have a price before GST: what is the GST and the total?
- I have an inclusive price: what was the price before GST and how much of it is tax?
- My invoice has items at different rates: what is the tax on each rate and the total?
- Why is the tax 15.25% of the amount with GST when the rate is 18%?

### 4. Target users
Anyone raising, checking or splitting a GST amount. Not for choosing a rate, classifying a product, filing a return or claiming credit.

### 5. Inputs
Mode control (Margin's segmented radio), then up to four item rows in the shared form grid (one column on a phone). Item 1 is required; items 2 to 4 are optional and count only when
their amount is filled. A hint under each field; "(optional)" on the optional ones; Reset.

| Field | Meaning | Unit | Required | Default | Limits | Helper text | Message when invalid |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Mode | add GST to the amounts, or take it out of them | choice: Add GST, Remove GST | yes | Add GST | one of two | "Add GST if your amount is before GST. Remove GST if it already includes it." | "Choose whether to add or remove GST." |
| Item 1 amount | the amount of the item | ₹ (two decimals) | yes | 10,000 | 0.01 to 99,99,99,999.99 | "Before GST in Add mode, including GST in Remove mode." | "Enter an amount between ₹0.01 and ₹99,99,99,999.99." |
| Item 1 GST rate | the rate for this item | % | yes | 18 | 0 to 50, up to two decimals | "The rate you are charging or were charged. 18% is only an example." | "Enter a GST rate between 0% and 50%." |
| Items 2 to 4, amount (optional) | further items | ₹ | no | blank | as Item 1 | "Leave blank to skip this item." | as Item 1, or leave it blank |
| Items 2 to 4, rate | the item's rate | % | when its amount is entered; blank means Item 1's rate | blank | as Item 1 | "Leave blank to use Item 1's rate." | as Item 1 |

Left out of v1: item descriptions, quantities and unit prices, discounts, a fifth item, rate presets or lists, a place-of-supply choice, two-part (central/state) display, cess, rounding
choices, saved invoices.

### 6. Outputs and result hierarchy
Above the fold on desktop: the form, then the result block.
1. **Primary:** the amount the visitor asked for: **Amount with GST** in Add mode, **Amount before GST** in Remove mode (large; the card is labelled to say which).
2. **Supporting cards (three, so with the primary the grid is a balanced two-by-two):** the other of the two amounts, the **GST amount**, and **GST as a share of the amount with GST**
   (the figure behind the common mistake). Each answers a different question.
3. **Summary (one or two sentences):** "₹10,000.00 before GST at 18% is ₹1,800.00 of GST and ₹11,800.00 with GST."
4. **Trust note** beside the result.
5. **By-rate table (only when more than one item is filled):** the question it answers is "how does the tax and the total split across the rates on this invoice?" (section 12).
6. **Next useful actions (related tools):** Margin and Profit (price and profit before GST).

### 7. Model rules
Rupees held as whole paise; rate r a percentage with up to two decimals; amount a.
- **Add:** before = a; GST = round(a × r ÷ 100); with = before + GST.
- **Remove:** with = a; before = round(a × 100 ÷ (100 + r)); GST = with − before.
- **Rounding:** half up to the paisa, **per item**, using exact whole-number arithmetic on the typed decimals (BigInt, as in the Home Loan and FD engines). The tax, not the amount, is rounded in Add mode;
  the amount before GST is rounded and the tax is the remainder in Remove mode, so before + GST = with, always, with no stray paisa.
- **Invoice totals** are the sums of the per-item figures. (An invoice computed on the grand total can differ by a paisa; the page says so. Example: three items of 10.10 at 5% give
  1.53 of tax item by item and 1.52 on the total.)
- **GST share of the amount with GST** = GST ÷ with, as a percentage to two decimals (18% → 15.25%, 5% → 4.76%, 28% → 21.88%); shown for the whole invoice.
- **By-rate table:** items with the same rate are merged (sums of the per-item figures), rows ordered by ascending rate, with a total row.
- **Round trip (planning wording, superseded by the measurement in the implementation notes):** the planning draft expected Add then Remove to return the original "usually"; the reference measured it instead (section 22 and the implementation notes).
  The page claims only what was measured, within the tested domain.
- **Zero rate:** GST 0.00, before = with.
- **Impossible states:** none beyond validation.

### 8. Assumptions (shown on the page)
The rate is the visitor's; GST is one percentage of the amount before it; each item is rounded to the paisa (half up) before the items are added. Not included: which rate applies to a
product or service, classification codes, input tax credit, returns, cess, reverse charge, place of supply, e-invoicing, other rounding rules. A calculation from the numbers entered,
not tax advice.

### 9. Edge cases
- Rate 0%; the smallest amount (0.01 at 18% gives 0.00 of GST); the largest amount at the highest rate (millions of rupees, still exact).
- Odd-paisa tax (100.10 at 5% gives 5.005, rounded to 5.01).
- Remove mode with an amount too small for a paisa of tax.
- Items with equal rates (merged) and with all different rates; an optional item with a rate but no amount (ignored); an amount with no rate (Item 1's rate).
- Mode switched with items already entered: the amounts keep their values and the labels change; nothing is converted.

### 10. Validation
Limits and messages as in section 5, tool-owned, with the shared field helpers for linked errors (`aria-invalid`, `aria-describedby`). An emptied required field shows the prompt, not
an error; an emptied optional item is skipped. Nothing negative; an invalid optional item marks only its own fields.

### 11. User journey
1. The visitor arrives mid-invoice ("what is 18% GST on this?" or "how much of this bill is tax?").
2. They choose Add or Remove, enter the amount and the rate (two fields, one screen).
3. The amount they asked for is the first, largest figure, with the other amount, the GST and the tax share beside it.
4. The summary states the working in a sentence they can copy into an invoice.
5. For a mixed invoice they fill more items and the by-rate table appears with the total.
6. The assumptions and what is not included sit beside the result.
7. They enter the next invoice, or open Margin or Profit.

### 12. Table decision
**Table: YES**, one, only when more than one item is filled. Question: "how does the tax and the total split across the rates on this invoice?" Columns: GST rate, Amount before GST,
GST, Amount with GST. Rows: one per distinct rate, ascending, then a Total row (rows at most four). With one item the cards already say everything and no table is shown. On a phone it
scrolls in a labelled region with a sticky first column (as the other tables). No colour-only meaning.

### 13. Chart decision
**NOT NEEDED.** Three amounts and a few rate rows are exact figures to read, not a trend or a comparison of magnitudes.

### 14. Print and CSV decisions
**Print Summary: NOT NEEDED. CSV: NOT NEEDED.** A copyable summary sentence is enough for v1; print CSS is still unshared. Revisit with evidence (an invoice breakdown is the obvious future
candidate).

### 15. Retention
Each invoice, quote or bill brings new amounts and often new rates, and a business raises many. No account, saved invoices or notifications; revisit only with evidence (section 27).

### 16. Mobile behaviour
At about 390px: one column; the mode as two full-width segments (at least 44px high); each item as an amount and a rate side by side, or stacked if too narrow; the primary result visible after the
form; the four cards stacking; the by-rate table scrolls in a labelled region with a sticky first column; tap targets at least 36px; no horizontal page scroll. Optional items are visually
secondary so the first screen stays simple.

### 17. Accessibility requirements
Labelled fields with linked hints and errors; the mode as a `fieldset` with a `legend` and radio inputs (the tick drawn by CSS kept out of the accessible name, as in Margin and FD); each
item row grouped in a `fieldset` with a legend ("Item 2"); a polite live region with one sentence ("Amount with GST ₹11,800.00; GST ₹1,800.00."); table caption and `scope`; the total row marked
in text; text contrast 4.5:1; the shared focus ring; no animation.

### 18. Search keywords and aliases
Aliases "add gst", "remove gst", "gst inclusive exclusive", "reverse gst calculator". Queries to check: "gst", "gst calculator", "remove gst", "inclusive", "reverse gst". GST must be found as a
published tool; Income Tax stays Coming Soon and must not appear as usable. No alias promises rates, classification or filing.

### 19. Related calculators and articles
- **Live, curated (cross-category):** Margin and Profit, via `relatedTools: ["margin", "profit"]` on the GST entry, because they price and cost "before GST". The automatic rule gives GST no
  category neighbours (it is the only live Tax tool), so the curated list is what makes the page useful. **The reciprocal link from Margin and Profit to GST is deferred** (it would change both
  Business pages and their baselines; it can follow as a deliberate small change).
- **Future:** Income Tax, only when it exists and is live.
- **Articles:** the two below, listing each other, plus one curated Business article each where genuinely related.

### 20. Article cluster and article visual strategy
Distinct, no forced count, no rate or rule claims. Image decisions follow "concept first, format second"; the two visuals are different forms and neither is a bar, line or histogram chart.

**Article 1: Adding and removing GST: why the tax is not the same share both ways** (explanation and a common mistake)
- *Intent:* people subtract 18% from a GST-inclusive price and get it wrong. *Unique value:* ₹1,000 plus 18% is ₹1,180, and the ₹180 is 18% of ₹1,000 but **15.25%** of ₹1,180; subtracting
  18% from ₹1,180 gives ₹967.60, not ₹1,000. At 5% the share is 4.76%, at 28% it is 21.88%. *Calculator relationship:* the Add and Remove modes and the tax-share card. *Not a duplicate:* it is
  about direction (adding versus removing), not about invoices.
- **IMAGE: YES.** *Visual purpose:* show in two or three seconds that the same ₹180 is a different share of the before and the with amounts. *Visual type:* **proportion (composition) diagram**: one
  bar of 118 units split into a 100-unit base and an 18-unit tax block, with a bracket under the base labelled by length (the tax is 18 of 100) and a bracket under the whole bar (the tax is 18 of 118).
  *Why this type:* the idea is a ratio of lengths, which proportion shows directly. *Why not a chart:* there is one amount, not a series or a trend. *Data source:* the model's own 100, 18 and 118
  units (ratio only; no rupee figures in the picture). *Anti-repetition:* a single stacked proportion bar with two brackets; unlike the FD tick rows and spans. *Alt-text intent:* one bar of a base
  and a smaller tax block, with the tax measured against the base and against the whole.

**Article 2: GST on a mixed invoice: how the tax adds up across rates** (a worked scenario)
- *Intent:* an invoice with items at 5% and 18%. *Unique value:* ₹1,000 at 5% (GST ₹50.00) and ₹2,000 and ₹500 at 18% (GST ₹360.00 and ₹90.00) give ₹500.00 of GST on ₹3,500.00 and a total of ₹4,000.00; the
  by-rate view shows ₹50.00 on the 5% row and ₹450.00 on the 18% row; rounding item by item can differ by a paisa from rounding the grand total (three items of ₹10.10 at 5%: ₹1.53 against ₹1.52).
  The rates are examples the reader enters, not statements about what applies. *Calculator relationship:* the extra items and the by-rate table. *Not a duplicate:* it is about several rates on one
  document, not about direction.
- **IMAGE: YES.** *Visual purpose:* show how items fall into rate groups and then add up. *Visual type:* **grouping flow diagram**: three item blocks (widths by amount) sorted into two rate columns, each
  column ending in one subtotal block, and both subtotals meeting in one total. *Why this type:* the idea is sorting and adding, a process. *Why not a chart:* the point is how figures combine, not
  how big each is. *Data source:* the model's item amounts and rates (shapes by proportion; no figures printed). *Anti-repetition:* branching and merging blocks, unlike the single proportion bar of
  article 1. *Alt-text intent:* three item blocks sorted into two rate groups and added to one total.

**Candidate, not committed:** "Why your GST total can differ by a paisa" (per-item versus grand-total rounding). It is narrow, partly a convention of accounting software, and is covered by a note in article 2.
**Rejected:** "GST rates list" and "which GST rate applies" (rule-dependent, dated, invites advice), "GST on ... services" (classification), anything about returns or credit.

### 21. Site-wide UX consistency
Reused, nothing invented: Inter and the green/action system; the shared number field (label, unit, hint, linked error, `aria-invalid`) in the two-column desktop grid and single mobile column;
"(optional)" labelling; Margin's segmented radio for the mode; the secondary Reset that looks clickable; the shared focus ring; the `calculator-results__*` primary and card metrics (a primary and
three cards, a balanced 2×2); the labelled scrollable table with a sticky first column; the neutral trust note; section titles with the green rule; the live region; the shared breadcrumb; the
related-calculators and related-articles layout; the article template. **Justified difference:** repeated item rows (four amount-and-rate pairs), built from the same shared fields in `fieldset`s, no new
control. Not allowed: new colours, spacing scales, button styles, a chart, add/remove-row scripting, decorative imagery in the tool.
Design quality: the answer the visitor asked for is the first and largest figure; optional items are visually quieter; the table appears only for a mixed invoice; no orphan card, no filler metric.

### 22. Tests (risk-based) and independent verification
**Independent reference:** `tests/fixtures/gst-golden.py` (Python `decimal` and `fractions`). It does **not** reuse the engine's integer formulas: it works in exact `Fraction`s and rounds half up with
`ROUND_HALF_UP`, computes Remove mode by **integer search over whole paise** (the paise `b` for which `b` is the nearest to `with × 100 ÷ (100 + r)`), checks `before + GST = with` for every case, and
**exhaustively** compares the closed forms over amounts from 0.01 to 2,000.00 at several rates, reporting how often Add-then-Remove returns the original (planning expected "usually"; the measured result is in the implementation notes). It prints every figure
quoted in the articles. The JSON is embedded as `GOLDEN` in `tests/unit/gst-golden.test.mjs`; no figure is copied from the JavaScript.
**During implementation, run only what the change can break; never the whole site:**
- formula change: `tests/unit/gst-golden.test.mjs` only;
- tool UI change: `tests/browser/gst.spec.js` on `subpath-desktop`, then `subpath-mobile` when layout changes;
- article figure change: `tests/unit/gst-articles.test.mjs`; article visual change: only the focused asset check (exists, PNG and WebP, small, alt text describes the concept);
- catalog publication: focused catalog, search, taxonomy, relationships, sections, tool-catalog and articles unit tests, plus `navigation`, `articles` and `notfound` on one project; use
  `tests/helpers/coming-soon.mjs`, never name a tool (note: `getComingSoonTool({ category: "tax" })` will then return Income Tax);
- the curated Margin/Profit links on the GST page only: the GST spec's related assertions.
**Required taxonomy assertions at publication:** pin `gst` as `section = Calculators`, `category = Tax` in the catalog, taxonomy, search-index and registry tests; assert the derived hierarchy
`Calculators › Tax`; assert the built breadcrumb `Home › Calculators › tax › GST Calculator`; assert Income Tax remains Coming Soon in Tax; keep the existing SIP and FD pins.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, the three browser projects with `--workers=1` spec by spec (never reported as monolithic; preserve completed
coverage after any memory kill), and the three visual projects. Before it: stop only clearly stale Playwright, Chromium, Node and Eleventy processes; clean `test-results`, `tests/.tmp` and
`tests/fixtures/__pycache__`.
- **Unit:** golden scenarios; invariants (before + GST = with; GST ≥ 0 and rises with the rate; the tax share equals r ÷ (100 + r); item totals equal the sum of the items; the by-rate rows equal the
  sums of their items; mode and rate monotonicity); validation, optional items.
- **Browser:** live results, each mode, zero rate, odd-paisa tax, extremes, a one-item invoice (no table), a mixed invoice (table, total row, ordering, merging of equal rates), an optional item with a
  rate only, validation with linked errors and per-item marking, reset, keyboard (the radio group, tab order through the items), mobile layout, search by name and aliases, the related Margin and Profit
  cards, the Income Tax Coming Soon card not offered, the articles; no "correct rate", "must charge", "compliant" or "tax advice" wording.
- **Accessibility entries; visual baselines** for the new page and every page that changes.

### 23. Planning goldens (illustrative; the implementation must re-derive them with the independent reference)

Computed with Python `decimal` (half up to the paisa); amounts in rupees.

| # | Scenario | Result |
| --- | --- | --- |
| A | Add, 1,000 at 18% | before 1,000.00; GST 180.00; with 1,180.00; share 15.25% |
| B | Remove, 1,180 at 18% | before 1,000.00; GST 180.00; with 1,180.00 |
| C | Remove, 1,000 at 18% | before 847.46; GST 152.54; with 1,000.00; share 15.25% |
| D | Add, 99.99 at 5% (tax 4.9995) | GST 5.00; with 104.99 |
| E | Add, 100.10 at 5% (odd paisa, 5.005) | GST 5.01; with 105.11; share 4.77% |
| F | Add, 1,000 at 0% | GST 0.00; with 1,000.00; share 0.00% |
| G | Add, 0.01 at 18% (smallest) | GST 0.00; with 0.01 |
| H | Remove, 0.01 at 18% (smallest) | before 0.01; GST 0.00 |
| I | Add, 1,00,00,000 at 28% | GST 28,00,000.00; with 1,28,00,000.00; share 21.88% |
| J | Add, 99,99,99,999.99 at 28% (largest) | GST ₹2,80,00,00,000.00 (2,799,999,999.9972 rounds to 2,800,000,000.00); with GST ₹12,79,99,99,999.99. *(This row corrects the earlier planning value, which had the wrong digit grouping and magnitude: "28,00,00,000.00" and "1,27,99,99,999.99" were wrong and are superseded.)* |
| K | Remove, 12,345.67 at 12% | before 11,022.92; GST 1,322.75; share 10.71% |
| L | Add, three items: 1,000 at 5%; 2,000 at 18%; 500 at 18% | GST 50.00, 360.00, 90.00; by rate 5%: 1,000.00 / 50.00 / 1,050.00; 18%: 2,500.00 / 450.00 / 2,950.00; total 3,500.00 / 500.00 / 4,000.00 |
| M | Remove, the same three as inclusive 1,050 at 5%; 2,360 and 590 at 18% | before 1,000.00; 2,000.00; 500.00; GST 50.00; 360.00; 90.00; totals 3,500.00 / 500.00 / 4,000.00 |
| N | Add, three items of 10.10 at 5% | per item GST 0.51, 1.53 in all; (a grand-total computation gives 1.52: the stated convention differs by 0.01) |

### 24. SEO plan
Search intent: "gst calculator", "add gst", "remove gst", "gst inclusive exclusive". Title direction "GST Calculator: Add or Remove GST on an Invoice | ToolZen Hub" (trim if the SEO check
requires). Description direction: add GST to an amount or take it out, for the rate you enter, across several items with the tax by rate; calculated from your numbers, not tax advice. Canonical
`https://toolzenhub.in/calculators/gst/`; one H1; breadcrumb structured data from the shared model; form, example and FAQ in the static HTML. Better than a generic page because it handles a mixed
invoice, shows the tax share and states its rounding. No rate-list pages, no page per rate, no keyword variations.

### 25. Performance constraints
Vanilla JS, dynamic import, browser-local calculation, native UI, no dependency; the tool code loads only on its own page; images optimized (simple diagrams, small as PNG and WebP). No API or
data feed. No artificial size budget.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (13), CSV and Print (14), item descriptions and quantities (27), a Tax landing page (below).

### 27. Deferred items
Item descriptions, quantities and unit prices; discounts; more than four items and add/remove-row controls; two-part (central/state) display; cess; rounding-method choices (grand-total versus per
item); a printable or exportable invoice breakdown; saved invoices (revisit with evidence that visitors re-enter several invoices in a session); any rate list, preset, classification or filing aid (never
in scope); the reciprocal links from Margin and Profit.

## Category landing-page decision (Tax)

**NOT YET.** After this pack Tax has one live tool (GST) and its Coming Soon Income Tax, with only a category card linking to `tax.html`; a hub for one tool adds nothing. Investment and Business each have
two live tools and also no page of their own; Loans has one. Revisit Tax, Investment and Business together, as **one separate category-foundation phase**, when there is evidence visitors cannot find the
set; it must not be bundled into a tool pack. Taxonomy ownership (Calculators › Tax) does not depend on a landing page.

## Known shared-quality issues (deferred, unrelated to this pack)

`home-loan.css` contains the invalid property `home-loan-bottom` (a copy artefact); the Articles listing's pagination wraps "Next" on a phone; the years-and-months, radio-segment, table and page-skeleton
CSS is repeated across tools; the shared breadcrumb prints the lowercase category id (`tax`), styled by CSS; the Loans related-card grid wraps three plus one. None is touched by this pack, and none is made
more urgent by it (the GST page has two related cards).

## Publication effects to review (Coming Soon → live)
- **The Tax category** gets its first live tool: the Calculators listing (10 built, 16 Coming Soon), the Categories card counts, search and ranking for "gst", "tax", "inclusive", the sections and
  tool-catalog registries and the published and Coming Soon counts.
- **Inventory:** the tool and two new articles: 44 → 47 live pages; Coming Soon calculators 17 → 16, article placeholders unchanged at 6, entries 23 → 22; the DOM, link and SEO baselines.
- **Articles:** new topic `gst`, category `tax` (published Tax articles 0 → 2 in the sidebar and the listing, pagination 7 → 7 or 8 pages, to be read from the catalog); the Articles listing baselines.
- **Coming Soon helper:** `getComingSoonTool()` (no category) still returns Personal Loan; a test that asks for category `tax` now gets Income Tax; check that no existing test names GST as its example.
- **Not affected:** the Home page (GST is not in its Popular list; check), the Loans, Investment and Business pages (no reciprocal link in v1).

## Implementation sequence (when approved)
1. `tests/fixtures/gst-golden.py`, then `formulas/gst.js` and its unit tests; focused tests only.
2. The tool module and CSS; `tests/browser/gst.spec.js`; run it on one project, then mobile.
3. Catalog activation in place (title kept, description, aliases, curated `relatedTools`), `toolStyles.json`; focused catalog, search, taxonomy (with the pinned GST assertions), relationships,
   sections and tool-catalog tests.
4. The two articles, figure tests and the two diagram images (checked individually for concept, size and alt text); focused article tests.
5. Pinned expectations, baselines and visual registration for the pages that change.
6. Final Tool Pack gate once (section 22), then the commit.

## Checkpoint clarifications (spec commit review)

These sharpen the sections above; where they differ, this section wins.

1. **Product job.** GST is not "amount × percentage = tax". The job is an invoice, quote or bill: add GST to an amount before GST; take GST out of an amount that includes it; see the amount before GST,
   the GST and the amount with GST; understand the GST as a share of the final amount; and optionally combine up to four items and rates into one breakdown.
2. **Mode wording.** The two choices are **Add GST** ("I have an amount before GST.") and **Remove GST** ("I have an amount that already includes GST."). The helper text uses those sentences; the page
   does not rely on the words "inclusive" or "exclusive" alone.
3. **Reverse GST is not subtraction.** Remove mode must never be `amount − amount × rate%`. For ₹1,180 at 18% that gives ₹967.60; the correct result is ₹1,000.00 before GST and ₹180.00 of GST. Remove mode is
   also not `GST = round(amount × rate ÷ 100)` (₹212.40 on ₹1,180). The page and the first article state this plainly.
4. **Remove-mode invariant (pinned by tests).** For every item: **before + GST = the entered amount with GST, exactly in whole paise.** The amount before GST is the nearest paisa to
   `with × 100 ÷ (100 + r)` (half up) and the GST is the remainder, so the invariant holds by construction. The independent reference reaches the same `before` by an integer search over whole
   paise (not by the engine's formula) and asserts the invariant for every case.
5. **Per-item, half-up, then add.** Money is held as whole paise. Each item's GST (Add) or amount before GST (Remove) is rounded half up to the paisa on its own; invoice totals are the **sums of the rounded
   item figures**. This differs by up to a paisa from computing GST once on the grand total (three items of ₹10.10 at 5%: ₹1.53 item by item, ₹1.52 on ₹30.30). The page states the convention and that another
   system may round differently.
6. **GST share.** "GST as a share of the final amount" = GST ÷ amount with GST (₹180 ÷ ₹1,180 = 15.25%). It is **not** the entered rate and is never called the rate, the effective rate or the applicable rate.
   For several items it is the invoice total GST over the invoice total with GST.
7. **Items.** Item 1 is required. Items 2 to 4 are optional and fixed (no add or remove row, no names, quantities, discounts, HSN or SAC, invoice numbers, customer or company data, downloads). A blank
   amount means the row is ignored (even if a rate is typed, with no error); an amount with a blank rate inherits Item 1's rate; both present are calculated. An unused row produces no validation noise.
8. **By-rate table.** Shown whenever **more than one item has an amount**, even when all share one rate (then it is a single rate row and a Total row). Items with the same rate are merged; rows ascend by rate.
   Columns: GST Rate, Amount Before GST, GST, Amount With GST.
9. **Zero rate.** Add and Remove are both valid at 0%: before = with, GST = ₹0.00, share = 0.00%.
10. **Limits.** Amount ₹0.01 to ₹99,99,99,999.99 (exact paise, no overflow, negatives invalid); rate 0 to 50 with up to two decimals; the default 18% is labelled an example, never standard, current, common or
    official.
11. **Round-trip plan.** For valid Add amounts the reference exhaustively checks every amount from ₹0.01 to ₹2,000.00 at several rates: Add gives T, Remove on T with the same rate recovers `before`, and it reports
    how often the original is recovered exactly. *(The planning draft expected recovery to be rare-miss and worded the page "usually"; that expectation is superseded by the measured result in the implementation notes.)*
    The implementation's goldens are re-derived from the reference, not copied.
12. **Added planning golden O (inherited rate).** Add, Item 1: ₹1,000.00 at 18%; Item 2: ₹500.00 with the rate left blank (inherits 18%): GST 180.00 and 90.00; one row at 18%: before 1,500.00, GST 270.00, with
    1,770.00. With goldens A to N this covers: Add 1,000 at 18%; Remove 1,180 and 1,000 at 18%; 0%; ₹0.01; the odd-paisa half-up case; a large and the largest amount; same-rate items (L); different-rate items (L);
    Add multi-item (L); Remove multi-item (M); inherited rate (O); and item-level against grand-total rounding (N).
13. **Trust boundary.** The tool calculates from the rates entered. It does not determine whether GST applies, which rate applies, classification, HSN or SAC, place of supply, reverse charge, input tax credit,
    returns, cess, e-invoicing, filing or compliance. Banned wording: correct rate, you must charge, compliant, GST-compliant invoice, tax advice, current GST rate, officially applicable rate (except in a denial).
14. **Related tools and Tax.** Curated related tools: Margin and Profit (business pricing); Income Tax is never exposed; the reciprocal Margin and Profit links are deferred. No Tax landing page in this pack
    (`categories.html#tax` stays); Tax stays a category inside Calculators.
15. **Articles (titles as approved).** (1) Adding and Removing GST: Why the Tax Is Not the Same Share Both Ways; (2) GST on a Mixed Invoice: How the Tax Adds Up Across Rates. Candidate only, not built: Why Your GST
    Total Can Differ by a Paisa. Not published: rate lists, which-rate-applies, return filing, input credit.
16. **Visuals (concept first, format second).** Article 1: a proportion diagram, one bar of 100 base plus 18 tax with a bracket for 18 of 100 and another for 18 of 118. Article 2: a grouping flow diagram, item blocks
    sorted by rate into subtotals that merge into one total. Neither is a bar, pie, stacked-bar, line or histogram chart, they are visually distinct from each other and from the FD diagrams, and either is dropped if an
    image adds no explanatory value. No images in this checkpoint.
17. **SEO.** Canonical `https://toolzenhub.in/calculators/gst/`; title direction "GST Calculator: Add or Remove GST on an Invoice | ToolZen Hub", trimmed to site conventions if needed; the emphasis is add GST,
    remove GST and the invoice breakdown, never latest rates, a rate finder or classification.

## Implementation notes (Tool Pack 8 built; commit pending)

- **Built as specified.** `assets/js/calculators/formulas/gst.js` (pure; whole-paise BigInt arithmetic, rates in hundredths of a percent), `assets/js/calculators/gst/index.js`,
  `assets/css/calculators/gst.css`. A mode (Add GST / Remove GST) as Margin's segmented radio; Item 1 required and Items 2 to 4 optional as four fixed fieldsets built from the shared number field; the
  answer plus three cards form a natural 2x2 block; the by-rate table appears when more than one item has an amount; no chart, Print or CSV.
- **Remove mode** takes the nearest paisa to `with x 100 / (100 + rate)` (a tie going up) as the amount before GST and the GST is the remainder, so `before + GST = the amount entered` always. The page and
  the first article state plainly that subtracting the rate (₹1,180 less 18% = ₹967.60) is wrong.
- **Round trip: measured.** The reference ran Add then Remove over every amount from ₹0.01 to ₹2,000.00 (200,000 amounts) at seven rates (0, 0.25, 2.5, 5, 12, 18, 28): **all 200,000 amounts came back exactly at each of those
  seven rates**, and Remove kept `before + GST = the amount entered` on every one. The engine's unit tests repeat a dense range at eight rates. The page words this only as far as it was verified ("In testing, every amount from
  ₹0.01 to ₹2,000.00 at seven different rates came back exactly"); it is **not** claimed as a guarantee beyond that tested domain, and no proof is asserted here. (There is a reason to expect it, since Add moves the exact
  value by at most half a paisa, but that argument has not been separately verified as a proof, so the tested domain is the claim.)
- **Spec correction.** Golden J in the planning table was wrong and is corrected in the table itself (marked there as superseded): the GST on ₹99,99,99,999.99 at 28% is ₹2,80,00,00,000.00 and the amount with GST is ₹12,79,99,99,999.99.
- **Independent reference** `tests/fixtures/gst-golden.py` (Fractions with half-up rounding; Remove found by a search over whole paise; a full unbounded search cross-checked on a range): 16 single-item scenarios,
  6 invoices (mixed Add and Remove, inherited rate, rate formatting, four sorted rates, the item-by-item rounding example), the round trip (`--full` for the 2,000.00 range, about five minutes) and the article figures.
  `tests/unit/gst-golden.test.mjs` (45 tests) embeds its output; `tests/unit/gst-articles.test.mjs` (7 tests) pins every article number; `tests/browser/gst.spec.js` has 30 tests.
- **Two articles** (topic `gst`, category Tax). Image 1: a proportion diagram (a base of 100 and a tax of 18, then the same 18 as a part of 100 and as a part of 118); image 2: a grouping flow (three item blocks
  into two rate groups into one total). No text and no figures in either; PNG and WebP, under 7 KB each.
- **Taxonomy** pinned: `taxonomy.test.mjs` asserts GST and Income Tax are Calculators > Tax (GST live, Income Tax Coming Soon), through the catalog, the derived path, the search index, the registry and the breadcrumb
  items; the built breadcrumb reads Home > Calculators > tax > GST Calculator.
- **Publication effects reviewed and updated on purpose:** GST was already in the Home page's hand-written Popular Calculators list as a Coming Soon card, so it became a live link there (5 live, 1 Coming Soon; not added
  twice); the Calculators listing (10 built, 16 Coming Soon); Tax articles 0 to 2; the curated Margin and Profit links on the GST page (Margin and Profit do not link back: deferred); inventory (47 live pages; 16 Coming
  Soon calculators + 6 article placeholders = 22 entries); DOM, link, SEO and visual baselines (Home, Calculators, the new GST page).
- **Layout note (GST-only CSS):** on wide screens Items 2 to 4 sit side by side so the optional part of the form is one short row; below 1000px they stack.
- **Observed, not changed:** the years-and-months pair, radio-segment, table and page-skeleton CSS are now copied once more (Margin/FD/GST radios; FD/GST table, notes and screen-reader rules); the tool-publication
  touch list (Home, navigation, articles listing, search, sections, taxonomy) is the same long list; the earlier unrelated observations (Home Loan `home-loan-bottom`, Articles pagination on a phone, the lowercase
  breadcrumb category id, the Loans 3+1 grid) are untouched.
