# Tool Pack 06: Home Loan Calculator (the loan that fits an EMI budget)

Status: built and verified (commit pending)      Base commit: 2bce60c
Reserved id and slug: `home-loan` (route `/calculators/home-loan/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in
`docs/tool-pack-reuse-review.md`; the previous packs are `03-sip.md`, `04-margin.md` and `05-profit.md`.

Build with the current proven architecture only. **Do not** build a generator, extract the compare-card or print CSS, add a
shared controller or add a framework in this pack; observe repetition and record it.

## Selection record

### Candidates (the real catalog, read from `assets/js/data/tools.js`)

Published (7): Loan Comparison, EMI, Loan Prepayment, Loan Balance Transfer (Loans), SIP (Investment), Margin and Profit (Business).
Coming Soon (19 tools; the 25 Coming Soon entries of the URL inventory also count 6 article placeholders):

| Category | Entries (id) |
| --- | --- |
| Loans | Home Loan (`home-loan`), Personal Loan (`personal-loan`), Loan Eligibility (`loan-eligibility`), Interest (`interest`) |
| Investment | PPF (`ppf`), FD (`fd`), CAGR (`cagr`) |
| Tax | GST (`gst`), Income Tax (`income-tax`) |
| Business | ROI (`roi`) |
| Health | BMI (`bmi`), Calorie (`calorie`), BMR (`bmr`) |
| Math | Percentage (`percentage`), Ratio (`ratio`), Age (`age`) |
| Converter | Unit Converter (`unit-converter`), Currency (`currency`), Date (`date`) |

### Strategic direction

**Return to Loans for one use case that none of the four live Loans tools covers.** The old runner-up (CAGR) was re-evaluated against
the whole remaining catalog and does not win by default: it is "start, end, years in; one rate out", and a user rarely returns. The
live Loans tools all start from a loan the visitor already has or has chosen (EMI, Prepayment, Balance Transfer, Loan Comparison).
None answers the question that comes *before* them, and that most home buyers ask first: **"how big a loan fits my monthly budget?"**
That is a different decision (it solves for the loan, not for the EMI), it recurs while someone is house-hunting, and it leads
naturally into every live Loans tool.

### Candidates seriously evaluated

HIGH / MEDIUM / LOW; qualitative. For maintenance, rule risk, live data, trust complexity and generic risk, lower is better.

| Candidate | Pain | Repeat use | Decision value | Differentiation | Search | Commercial | Links and cluster | Feasibility | Maintenance | Rule risk | Live data | Trust complexity | Generic risk | Mobile | Flagship |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Home Loan (as the loan that fits an EMI budget)** | HIGH | MEDIUM to HIGH (a house-hunt is many scenarios; rates and income change) | HIGH | HIGH (solves for the loan; tenure trade-off) | HIGH | HIGH | HIGH (all four Loans tools, the Loans cluster) | HIGH | LOW | NONE (the EMI share is the user's own) | NONE | MEDIUM (must not read as an approval) | LOW to MEDIUM | HIGH | **HIGH** |
| ROI (Business) | MEDIUM | MEDIUM (per project) | MEDIUM | MEDIUM (target ROI, cost overrun) | MEDIUM | MEDIUM | MEDIUM (completes Margin, Profit) | HIGH | LOW | NONE | NONE | LOW to MEDIUM | HIGH ("one obvious formula") | HIGH | MEDIUM |
| CAGR (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM (required CAGR, future value) | MEDIUM | LOW | MEDIUM (SIP) | HIGH | LOW | NONE | NONE | LOW | HIGH | HIGH | MEDIUM |
| Loan Eligibility (Loans) | HIGH | MEDIUM | MEDIUM | MEDIUM | HIGH | HIGH | HIGH | MEDIUM | HIGH (lender rules: credit score, age, income proof, ratios) | HIGH | NONE | **HIGH** (reads as an approval) | MEDIUM | HIGH | LOW (as named) |
| Personal Loan (Loans) | MEDIUM | LOW | LOW | LOW (EMI with another name) | HIGH | HIGH | MEDIUM | HIGH | LOW | LOW | NONE | LOW | **HIGH** (an EMI wrapper) | HIGH | LOW |
| Interest (Loans) | LOW to MEDIUM | LOW | LOW | LOW (simple and compound interest) | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | HIGH | HIGH | LOW |
| FD (Investment) | MEDIUM | LOW to MEDIUM | LOW to MEDIUM | LOW | MEDIUM | MEDIUM | LOW | HIGH | MEDIUM (rates, tax on interest) | MEDIUM | NONE | MEDIUM | HIGH | HIGH | LOW |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | LOW | MEDIUM | MEDIUM | HIGH (rate, limits, lock-in) | HIGH | NONE | HIGH | MEDIUM | HIGH | MEDIUM |
| GST (Tax) | MEDIUM | MEDIUM | LOW | LOW | HIGH | MEDIUM | LOW to MEDIUM | HIGH | MEDIUM to HIGH | MEDIUM to HIGH | NONE | MEDIUM | HIGH | HIGH | LOW |
| Income Tax (Tax) | HIGH | HIGH (yearly) | HIGH | MEDIUM | HIGH | HIGH | HIGH | MEDIUM | **VERY HIGH** (slabs, regimes, years) | **VERY HIGH** | NONE | **HIGH** | LOW | MEDIUM | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | MEDIUM (formula choice) | NONE | **HIGH** (reads as diagnosis) | HIGH | HIGH | LOW |
| Percentage, Ratio, Age, Date, Unit, Currency (Math, Converter) | LOW to MEDIUM | LOW (Currency: MEDIUM) | LOW | LOW | HIGH | LOW | LOW | HIGH (Currency: live rates) | LOW (Currency: HIGH) | NONE | NONE (Currency: YES) | LOW | VERY HIGH | HIGH | LOW |

### Rejected as the Pack 6 flagship

- **ROI:** the formula is one line; its useful extras (a target ROI, a cost overrun) are modest, and the number means little without a
  time period, which pulls in annualised return, that is CAGR's job. Per-project, not recurring. It completes a Business trio, but
  that is a reason of symmetry, not of user value. It remains the Business candidate for a later pack, with payback kept out.
- **CAGR:** see above; best treated later as "the assumed return behind a SIP".
- **Loan Eligibility:** lender approval depends on credit score, age, income proof and the lender's own ratios, none of which the site
  can know or maintain, and the word promises an answer it cannot give. The question people really have is the one this pack answers,
  stated honestly as "what fits my budget". Its entry stays Coming Soon; whether to retire or merge it into Home Loan is a separate
  catalog decision for after this pack ships (not made here, nothing deleted).
- **Personal Loan and Interest:** an EMI wrapper and a generic formula. They stay Coming Soon.
- **Tax, Health, Math, Converter, FD, PPF:** as in the Pack 5 selection: rule-bound with no update plan (Income Tax, GST, PPF), a
  result that can read as a diagnosis (Health), or commoditized with one obvious answer (Math, Converter), and FD is one formula.

### Why this wins

1. **A different decision.** Every live Loans tool starts from a known loan. This starts from the visitor's income and obligations and
   solves for the **loan** that fits, which no other page here does and which is the real first question of a home purchase.
2. **A non-obvious insight, not a formula.** At one EMI budget, taking the loan over a longer tenure raises the loan only a little but
   adds a great deal of interest (planning example: 20 to 30 years lifts the loan by about 13% and the interest by about 84%). The
   tenure table shows that, in the visitor's own numbers.
3. **Recurring use.** Someone looking at properties re-runs it for each property budget, each rate quote, a co-applicant's income, an
   existing EMI that closes, a different tenure.
4. **A lifecycle.** It feeds the EMI Calculator (the EMI of a chosen amount), Loan Comparison (two offers), Loan Prepayment and Balance
   Transfer (after the loan is taken): the Loans cluster becomes a path, not five separate pages.
5. **No rule, rate or live data.** The share of income for EMIs is the visitor's own assumption; the site claims no lender limit.
6. **A real article cluster** (start from the EMI, tenure against interest, the rate's effect) with numbers from one engine.

### Answers to the product questions

- **Who:** a home buyer, usually first-time, with a monthly income, perhaps some existing EMIs, and a loan rate quote in mind.
- **Trigger:** they have seen a property price or heard "you can get about this much", and want to know what budget really holds
  before they talk to a lender or choose a property.
- **Problem:** how large a loan fits a monthly EMI limit they choose, over a tenure, at a rate; and what that costs in interest.
- **Decision after the result:** the loan amount to ask about and the property budget to look at; whether to lengthen the tenure for
  a larger loan knowing what it costs; which EMI limit they are comfortable with.
- **Return:** a new rate quote, a changed income or obligation, a different tenure, another property; then the other Loans tools.
- **Beyond a basic calculator:** it solves for the loan (not the EMI), shows the tenure's price in interest, and stays honest that it is
  not a lender's decision.
- **Trust risk:** it must not read as an approval, an eligibility or advice (section "Trust standard").
- **Maintenance:** none beyond the code.
- **Fit:** EMI, Loan Comparison, Loan Prepayment, Loan Balance Transfer, the Loans landing page and the ten Loans articles; also the
  Home page's Popular Calculators list, where Home Loan already appears as a Coming Soon card.

## Boundaries inside Loans

- **EMI (live):** a known **loan amount**, rate and tenure give the **EMI**. Home Loan is the reverse: a known **EMI budget**, rate and tenure
  give the **loan amount**. It never presents "enter a loan amount, get an EMI" as its main answer; it links to EMI for that.
- **Loan Eligibility (Coming Soon, separate):** a lender's decision. Home Loan uses only the visitor's own planning assumptions (income, their chosen
  share, existing EMIs, rate, tenure) and none of a lender's rules (approval criteria, age, employment, credit score, income documents,
  lender-specific ratios or loan-to-value limits). It never says "eligible" or "eligible loan amount".
- **Loan Comparison (live):** two loans side by side. Home Loan has one loan.
- **Loan Prepayment and Balance Transfer (live):** an existing loan. Home Loan is before the loan exists.
- **Not in Home Loan:** a lender's eligibility, credit score, age or income-proof rules, loan-to-value limits, processing fees, stamp duty,
  registration, insurance, tax benefits, a floating-rate path, part-payments, a repayment schedule (EMI's job).

## Trust standard

- **Facts the visitor enters:** the monthly income and the existing EMIs and loan payments. **Assumptions:** the share of income they are
  willing to put towards EMIs (**their** limit, not a lender's), a rate that stays the same for the whole tenure, equal monthly
  payments made at the end of each month, and the own funds for the property. **Calculated outputs:** the EMI room, the loan, the
  EMI on it, the total interest and repayment, the property budget and the tenure table.
- **Wording:** "the loan that fits your EMI budget", "under these assumptions", "could". **Banned, in the page, the articles and the aliases:**
  "eligible" and "eligible loan amount", "approved", "the bank will lend" and "the lender will lend", "you can safely afford", "recommended",
  "best", "ideal" or "longest/shortest" tenure advice, "ideal EMI ratio", "guaranteed", and any claim about what a lender allows. No alias
  contains "eligibility" or "eligible".
- **Tenure framing:** the table and the articles state the arithmetic only: a longer tenure can raise the loan that fits while raising the
  total interest. They never recommend a tenure, a longest or a shortest one, or say what is best.
- **Default:** the 40% share and the 8.5% rate are **examples** the page says so; no lender or rule is cited.
- **Exclusions (shown next to the result):** a lender's eligibility and its own limits, credit score, age, income proof, loan-to-value,
  processing fees, stamp duty and registration, insurance, rate changes on a floating loan, tax benefits and part-payments.
- **Outcome wording:** "no room for a new EMI at this share" is a statement about the entered numbers, not a verdict.
- **Local only:** nothing leaves the browser.

## Spec

### 1. Tool identity
Home Loan Calculator; `home-loan`; Calculators, Loans; no subcategory; `toolType` calculator. The catalog title "Home Loan Calculator" is
kept (the name people search for). The catalog description changes from "Calculate home loan EMI, interest and total repayment." to:
"Work out the home loan that fits your monthly EMI budget, what it would cost in interest, and how the tenure changes it." Aliases (true
names): "home loan affordability", "how much loan can i afford", "loan amount calculator". (Deliberately **not** "eligibility": that is a
lender's decision.)

### 2. User problem
**This tool helps a home buyer understand how large a loan fits the monthly EMI they are willing to pay, and what the tenure costs in
interest, when they are deciding what property budget to look at.** Today they use an EMI calculator backwards by trial and error, or
rely on a headline "you can get ₹X" with no view of the cost.

### 3. Jobs to be done
- How much loan fits an EMI of about ₹X a month at this rate and tenure?
- What property budget does that give, with my own funds?
- If I take a longer tenure, how much more can I borrow, and what does it cost in interest?
- How much room do my existing EMIs take away?

### 4. Target users
People planning a home loan. Not for a lender's approval, for comparing two offers (Loan Comparison), for a known amount's EMI (EMI),
or for an existing loan (Prepayment, Balance Transfer).

### 5. Inputs (one mode; the same field pattern as the other tools)
Amounts in rupees; the same period (a month) for income and EMIs. A two-column grid on desktop, one column on mobile, a hint under
each field, optional fields marked "(optional)", Reset.

| Field | Meaning | Unit | Required | Default | Limits | Precision | Helper text | Message when invalid |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Monthly income | the income you want the EMI limit based on (take-home or gross: your choice) | ₹ | yes | 1,00,000 | 1,000 to 1,00,00,000 | paise | "The monthly income you want your EMI limit based on, for example your take-home pay." | "Enter a monthly income between ₹1,000 and ₹1 crore." |
| Existing EMIs and loan payments | what you already pay every month | ₹ | no (blank means 0) | blank | 0 to 1,00,00,000 | paise | "Leave blank if none. Add every EMI and loan payment you already make each month." | "Enter existing payments between ₹0 and ₹1 crore, or leave it blank." |
| Share of income for EMIs | the part of income you are willing to put towards EMIs | % | yes | 40 | 1 to 90 | 0.1 | "Your own limit, not a lender's. 40% is only an example; lenders set their own limits, which this does not know." | "Enter a share of income between 1% and 90%." |
| Interest rate | the yearly rate you expect | % a year | yes | 8.5 | 0 to 30 | 0.01 | "An assumption: the rate for the whole tenure. 8.5% is only an example." | "Enter an interest rate between 0% and 30%." |
| Loan tenure | how long you would repay | years | yes | 20 | 1 to 30, whole years | 1 | "Whole years, from 1 to 30." | "Enter a tenure of 1 to 30 whole years." |
| Own funds for the property (optional) | money you would add to the loan | ₹ | no | blank | 0 to 100,00,00,000 | paise | "Leave blank to skip. If you enter it, you also see the property budget." | "Enter your own funds between ₹0 and ₹100 crore, or leave it blank." |

Left out: a loan type, a co-applicant (add their income and EMIs yourself), a lender, processing fees, a floating rate, part-payments.

### 6. Outputs and result hierarchy
Above the fold on desktop: the form, then the result block.
1. **Primary:** the loan that fits your EMI budget (₹), large.
2. **Supporting cards (always four, so the grid has no orphan):** the monthly EMI room for a new loan; the total interest over the tenure;
   the total to repay; the share of income the existing EMIs already use. (The EMI on the loan itself, a paisa or two under the room, is
   in the summary sentence, not a card.)
3. **Summary (two or three sentences):** income × share, less existing EMIs, leaves the room; the loan and its EMI; the property budget
   when own funds were entered.
4. **Breakdown (a compact definition list, only with own funds):** the loan, your own funds, the property budget.
5. **Tenure table:** what the same EMI room would borrow over other tenures, and the interest it costs.
6. **Trust note** beside the result; assumptions and exclusions lower on the page.
7. **Next useful actions (related tools):** EMI for a chosen amount, Loan Comparison for two offers.
Not a card: the EMI on the loan, the rate, the tenure (they are inputs). Nothing is shown that the visitor must decode.

### 7. Model rules
Rupees; income I, existing EMIs X, share s (percent), rate a (percent a year), tenure N years, own funds O. Monthly rate r = a ÷ 12 ÷ 100;
n = 12 × N months. Payments are equal, monthly, at the end of each month (the convention of the EMI Calculator).
- **EMI room** B = max(0, I × s ÷ 100 − X).
- **EMI of a loan P:** E(P) = P × r × (1 + r)^n ÷ ((1 + r)^n − 1); at r = 0, E = P ÷ n.
- **Loan that fits:** the **largest whole-rupee** P with E(P) ≤ B, that is P = ⌊B × ((1 + r)^n − 1) ÷ (r × (1 + r)^n)⌋ (P = ⌊B × n⌋ at r = 0). When
  B = 0 the loan is 0.
- **EMI on that loan:** E(P) (not rounded; shown to the paisa, at most B). **Total repaid** = E(P) × n. **Total interest** = total repaid − P.
- **Existing share** = X ÷ I.
- **Property budget** = P + O (only when O is entered). It is a simple planning total of the loan and the visitor's own funds. It does not say
  the funds meet a down-payment requirement, or cover stamp duty, registration or fees, or satisfy a lender's loan-to-value limit.
- **Tenure table:** the same B at tenures 10, 15, 20, 25 and 30 years, plus the entered tenure if it is not among them (sorted; the entered
  one is marked "your tenure"): the loan, the total interest and the total to repay for each. A tenure above the entered one never shows a smaller loan.
- **Precision:** exact arithmetic for money and the loan (whole-number arithmetic on the typed decimals, the power (1 + r)^n kept exact
  as a ratio of whole numbers, as the Margin and Profit engines do for money); results are handed back as numbers. Percentages to 2 decimals.
- **Independent verification:** section 25.

### 8. Assumptions (shown on the page)
The share of income, the rate and the tenure are the visitor's choices; the rate is the same for the whole tenure; payments are equal and
monthly. This is the loan that fits a budget **the visitor set**, not a lender's offer, limit or approval. Not included: a lender's rules,
credit score, age, income proof, loan-to-value, processing fees, stamp duty, registration, insurance, rate changes, tax benefits,
part-payments. A calculation, not advice.

### 9. Edge cases
- Existing EMIs equal to or above the EMI limit (I × s ÷ 100 ≤ X): **valid input, not an error**. The room is 0, the loan is 0; neutral wording ("your existing payments
  already use all of that share"); the table shows 0 for every tenure; no division by zero.
- Zero existing EMIs (blank).
- Rate 0%: the loan is B × n; total interest 0.
- Tenure 1 year; tenure 30 years; the entered tenure equal to one of the table's.
- A tiny budget (₹50 a month) and the largest income and share: large loans stay readable with Indian grouping.
- A budget with paise (income × share leaves paise): the loan still rounds **down** to a whole rupee.
- Own funds blank, zero, or large.
- The existing share above 100% of income (X > I): valid input, room 0.

### 10. Validation
Limits and messages as in section 5, tool-owned, with the shared field helpers for linked errors (`aria-invalid`, `aria-describedby`).
An emptied required field shows the prompt, not an error; an emptied existing-EMIs or own-funds field means none. The tenure must be a whole
number of years. Nothing negative is accepted.

### 11. User journey
1. The visitor lands with a real question ("what loan fits what I can pay?").
2. They enter income, share, rate and tenure (existing EMIs and own funds only if they apply).
3. The loan that fits their EMI budget is the first thing they read, with the room it comes from.
4. The summary says how it was reached; the cards give the cost (interest, total) and how much existing EMIs already take.
5. The tenure table shows the trade-off: a longer tenure borrows more but costs far more interest.
6. The assumptions and what is not included sit beside the result; the page links to the EMI Calculator and Loan Comparison.
7. They change the tenure, the rate or the share and see the page update, then move to the next tool.

### 12. Table decision
**Table: YES**, one: the tenure table. The question it answers: "if I take the loan over a different number of years, how much more can I
borrow and what does it cost?". Columns: Tenure, Loan that fits, Total interest, Total to repay. Six rows at most (the five tenures and the
entered one when it differs), the entered tenure marked. It is also the accessible form of the trade-off. On mobile it scrolls in a
labelled region with a sticky first column (as the Margin and Profit tables). A rate table is deferred (section 27).

### 13. Chart decision
**NOT NEEDED in v1.** The table already carries the trade-off in four columns and six rows; a chart would repeat it. The picture of loan
against interest by tenure belongs in the tenure article, drawn from the same numbers.

### 14. Print and CSV decisions
**Print Summary: NOT NEEDED. CSV: NOT NEEDED.** A budget estimate is a working answer, not a document to share, and the print CSS is still
unshared. Revisit with user evidence.

### 15. Retention
The repeat-use mechanism comes from the problem: a house-hunt means many properties and many quotes. Each visit changes one input (the
rate, the tenure, the share, an EMI that closes) and the whole answer and the tenure table update at once. No account, history, saved cases,
cloud or notifications; revisited only with evidence (section 27).

### 16. Mobile behaviour
At about 390px: one column; the two-field rows stack; the four cards stack in two columns where they fit; the tenure table scrolls in a
labelled region with a sticky first column; tap targets at least 36px; no horizontal page scroll; the loan (the primary figure) is
visible without scrolling past the form's first screen on a typical phone once the form is filled.

### 17. Accessibility requirements
Labelled fields with linked hints and errors (`aria-invalid`, `aria-describedby`); a polite live region with one sentence ("A loan of
₹34,56,925 fits an EMI room of ₹30,000."); table caption and `scope`; "no room" stated in words; text contrast 4.5:1; the shared focus ring;
no animation; the entered tenure's row marked with text ("your tenure"), not only by colour.

### 18. Search keywords and aliases
Aliases "home loan affordability", "how much loan can i afford", "loan amount calculator". Queries to check: "home loan", "home loan
affordability", "how much loan", "loan amount", "emi budget". Home Loan must be found as a published tool; the Coming Soon Loan Eligibility
and Personal Loan entries must not appear as usable.

### 19. Related calculators and articles
- **Live:** EMI Calculator (the EMI of a chosen amount), Loan Comparison (two offers), Loan Prepayment and Loan Balance Transfer (after the
  loan is taken). The Loans pages relate to each other by category, so Home Loan gains these and they gain Home Loan (an intended
  publication effect; see below).
- **Future, only as they exist:** Personal Loan, Loan Eligibility (not exposed while Coming Soon).
- **Articles:** the three below, plus curated cross-links to existing Loans articles (each new article lists the other two and one existing
  Loans article).

### 20. Article cluster
Distinct, no forced count; none depends on a lender rule or a rate quote.
1. **How much home loan fits your EMI budget** (decision guide). Start from the EMI, not the property: income × share − existing EMIs =
   the room; the loan is the room's present value at the rate and tenure. One worked example: ₹1,00,000 income, a 40% share, ₹10,000 of
   existing EMIs, 8.5% over 20 years: a room of ₹30,000 and a loan of ₹34,56,925; with ₹5,00,000 of own funds a property budget of
   ₹39,56,925. Links to Home Loan and, in related, to "EMI vs total interest".
2. **Longer tenure, bigger loan, much more interest** (scenario and interpretation). The same ₹30,000 over 10, 15, 20, 25 and 30 years:
   ₹24,19,634 to ₹39,01,609 (about 61% more) while the interest goes from ₹11,80,366 to ₹68,98,390 (about 5.8 times). Going from 20 to
   30 years adds about 13% to the loan and about 84% to the interest. Distinct from the existing "loan tenure and total interest" article
   (a fixed loan's tenure): this one fixes the EMI budget and varies the loan. Related to it.
3. **How the interest rate changes the loan you can borrow** (scenario). The same ₹30,000 over 20 years at 7.5%, 8.5%, 9.5% and 10.5%:
   ₹37,23,963, ₹34,56,925, ₹32,18,431, ₹30,04,868 (each point lowers the loan by roughly ₹2 to ₹2.7 lakh). Stated as arithmetic on a rate
   that stays the same, never a view on where rates go. Related to the existing "fixed vs floating" article.
Candidate, only if distinct once written: **How existing EMIs shrink the loan that fits** (₹46,09,233 with none against ₹34,56,925 with
₹10,000: ₹11,52,308 less). It risks repeating article 1 and is not committed.
Rejected: "home loan eligibility criteria", "how much loan will the bank give" (lender rules, dated sources, an approval implied), "best home
loan tenure" (advice), "ideal EMI to income ratio" (a benchmark), tax benefits (rule-dependent).

### 21. Imagery plan
From the engine's numbers; no text, no stock art; PNG plus WebP; descriptive alt text; the tool page needs none.
1. **EMI room:** one income bar split into existing EMIs, the new EMI room and the rest of the income (₹10,000, ₹30,000, ₹60,000 of ₹1,00,000),
   so the budget's origin is visible at a glance.
2. **Tenure:** paired bars for 10, 15, 20, 25 and 30 years: the loan (green) beside the total interest (slate), the interest growing much
   faster than the loan.
3. **Rate:** four loan bars (7.5% to 10.5%) falling by steps at the same EMI and tenure.
No image for any further article unless it explains something the text does not.

### 22. Site-wide UX consistency
Reused, nothing invented: Inter and the green/action system; the shared number field (label, unit, hint, linked error, `aria-invalid`) in the
two-column desktop grid and single mobile column; "(optional)" labelling; the secondary Reset that looks clickable; the shared focus ring;
the `calculator-results__*` primary and card metrics (four cards, so no orphan and no new grid rule); the compact definition-list card
(breakdown); the labelled scrollable table with a sticky first column and `scope` headers; the neutral trust note; section titles with the
green rule; the live region; the shared breadcrumb (Home, Calculators, Loans as the existing Loans crumb, the tool); the related-calculators
and related-articles layout; the article template and cards.
**No new control:** the tenure is a number field (whole years), not a slider or a select. **Justified differences:** none planned. Not allowed:
new colours, spacing scales, button styles, control shapes or card styles, a chart, decorative imagery in the tool.
Design quality: the loan is the largest, first figure (it stays visually dominant); the four supporting cards are there because each answers a
question the visitor has (what EMI room, what it costs in interest, what in total, how much existing EMIs already take), not to fill a grid, and no
metric is added or removed for symmetry; the four cards sit in a two-by-two grid; the breakdown card appears only when own
funds are entered; the tenure table is below the trust note and the summary; nothing is collapsed; no orphan card, no empty half-row.

### 23. SEO plan
Search intent: "home loan calculator", "how much home loan can I afford", "home loan affordability". Title "Home Loan Calculator: Loan Amount for Your
EMI Budget | ToolZen Hub" (about 66 characters; trim at build if the check requires). Description direction: work out the home loan that fits your
EMI budget, with the interest it costs and how the tenure changes it; calculated for the numbers you enter, not a lender's offer.
Canonical `https://toolzenhub.in/calculators/home-loan/`; one H1; breadcrumb structured data; form, example and FAQ in the static HTML.
Better than a generic page because it solves for the loan and shows the tenure's price. No pages for keyword variations.

### 24. Performance constraints
Vanilla JS, dynamic import, browser-local calculation, native UI, no dependency; the tool code loads only on its own page; images optimized.
No artificial size budget. The exact power `(1 + r)^n` with n up to 360 uses whole-number arithmetic that stays small and runs once per
result and table row (six rows); no unnecessary runtime work.

### 25. Tests (risk-based) and independent verification
**Independent reference:** `tests/fixtures/home-loan-golden.py` (Python `decimal`, 80 digits). It does **not** use the closed form to find the
loan: it **simulates the amortisation month by month** (balance = balance × (1 + r) − payment) and finds, by integer search over whole
rupees, the largest loan whose balance is cleared within the tenure at the EMI room; it asserts the closed form ⌊B × ((1 + r)^n − 1) ÷
(r × (1 + r)^n)⌋ gives the same loan; it checks that one rupee more is not repaid; it recomputes the EMI, total repaid and interest from the
formula and the simulation; and it prints every figure quoted in the articles. The JSON is embedded as `GOLDEN` in
`tests/unit/home-loan-golden.test.mjs`, as for Margin and Profit; no figure is copied from the JavaScript.
**During implementation, run only what the change can break; never the whole site:**
- formula change: `tests/unit/home-loan-golden.test.mjs` only;
- tool UI change: `tests/browser/home-loan.spec.js` on `subpath-desktop`, then `subpath-mobile` when layout changes;
- tenure table change: the same spec;
- article figure change: `tests/unit/home-loan-articles.test.mjs`;
- catalog publication: focused catalog, search, taxonomy, relationships, sections, tool-catalog and articles unit tests, plus the `navigation`,
  `articles` and `notfound` specs on one project; use `tests/helpers/coming-soon.mjs`, never name a tool;
- a related-tool change on another Loans page: only that page's focused spec and visual baseline;
- shared helper change (none planned): its consumers; shared CSS change (none planned): visual tests of the affected pages.
Broaden only along an impact path: a change to the Home Loan formula alone does not rerun the Loans, SIP, Margin or Profit browser specs.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, the three browser projects with `--workers=1` (spec by
spec if memory is tight, never reported as a monolithic pass when it was not, preserving completed coverage after any memory kill), and the
three visual projects. Before it: stop only clearly stale Playwright, Chromium, Node and Eleventy processes (not an active `npm run dev`
unless it is clearly this project's old server), clean `test-results`, `tests/.tmp` and `tests/fixtures/__pycache__`.
- **Unit:** golden scenarios; invariants (the loan rises with the income, the share, the tenure and falls with the rate and with existing EMIs;
  EMI(loan) ≤ the room and EMI(loan + 1 rupee) > the room; a longer tenure never gives a smaller loan; the room is 0 when existing EMIs reach
  the share; total interest ≥ 0); validation, optional fields, whole-year tenure.
- **Article figures:** a test like `tests/unit/profit-articles.test.mjs`.
- **Browser:** live results, the default, existing EMIs, no room, rate 0, own funds and the breakdown, the tenure table (rows, the marked
  tenure, a tenure outside the five), validation with linked errors, optional fields, reset, keyboard, mobile layout, search by name and
  aliases, the related Loans tools, the cards and articles; no "eligible"/"approved" wording; no ROI or other Coming Soon link.
- **Accessibility entries; visual baselines** for the new page and every page that changes.

### 26. Publication effects to review (Coming Soon → live)
- **The Home page.** Home Loan is already in the Popular Calculators list as a Coming Soon card, so it becomes a live link (as SIP did).
  The Home DOM and visual baselines, the "Coming soon" counts in the navigation spec and the named Coming Soon cards in its assertions change on purpose.
- **The Loans pages.** Home Loan joins the Loans landing page and the related-calculator cards of the four live Loans tools wherever the
  category fallback lists it; each affected page's baseline is reviewed and updated only if its cards changed.
- **The Coming Soon helper.** `getComingSoonTool()` returns the first Coming Soon calculator, which is Home Loan today; once it is live it
  returns Personal Loan. The tests that use it follow automatically. The navigation spec's search of the sample's title must be checked
  (a query for "Personal Loan Calculator" may also match live Loans cards): keep the assertion's purpose and fix the query, not the check.
- **Counts and listings:** the Calculators and Categories cards, search and ranking for "home loan", the Loans article count (10 → 13) and
  the Articles listing pagination, the sidebar counts, inventory, SEO, DOM and link baselines, the sections and tool-catalog registries, the
  published and Coming Soon counts and the related-count rule for the new cluster.
- **Loan Eligibility** stays Coming Soon, unchanged; it now overlaps this tool and is flagged for a later retire-or-merge decision.

### 27. Deferred items
A rate table or stress rows (what the same budget borrows if the rate moves); a repayment schedule (EMI's job); a co-applicant block; a
loan-to-value or lender view; processing fees, stamp duty and registration; a floating-rate path; part-payments (Prepayment's job);
Personal Loan and Loan Eligibility (a separate decision); a chart; Print and CSV; saved cases (revisit with evidence that visitors re-enter
several properties in a session); anything that implies a lender's approval (never in scope).

### 28. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (13), CSV and Print (14), a schedule (EMI covers it), a Loans landing page (it
exists).

### 29. Commit checkpoint
Subject: `feat: add home loan calculator and affordability content cluster`. Afterwards run the exact-tree verification
(`docs/tool-pack-factory.md`, section 8), one Playwright project and spec at a time with `--workers=1`, no dev server writing to `dist`. Do not push.

## Category landing-page decision

**Business landing page: B. NOT YET — keep the current category-anchor behaviour (`categories.html#business`).** Business has two live
tools and six articles, but this pack adds nothing to Business, and the page would mostly repeat what `categories.html#business` and the
Articles filter already show for two tools. A hub is justified by discovery and navigation it adds, and two tools do not yet need one. The
breadcrumb's plain-text category crumb and the card already link to the anchor. Revisit at three live Business tools (ROI or another), or on
evidence that visitors cannot find the Business set; then do it as its **own small category-foundation phase** (what the page lists, the
breadcrumb target, the sitemap and navigation tests), not bundled into a tool pack. (Loans already has its landing page; Investment has one
tool and no landing page.)

## Planning goldens (illustrative; the implementation must re-derive them with the independent reference)

Computed with Python `decimal` by simulating the amortisation and searching whole rupees (the closed form asserted equal). Income I, existing
EMIs X, share s, rate a, tenure N; the room B = I × s ÷ 100 − X.

| # | Scenario | Result |
| --- | --- | --- |
| A | I 1,00,000; X 0; s 40; a 8.5; N 20 (the defaults) | room 40,000; loan **46,09,233**; EMI 39,999.99; total repaid 95,99,998.76; interest 49,90,765.76 |
| B | I 1,00,000; X 10,000; s 40; a 8.5; N 20; own funds 5,00,000 | room 30,000; loan **34,56,925**; EMI 30,000.00; total 71,99,999.59; interest 37,43,074.59; property budget 39,56,925 |
| C | I 50,000; X 25,000; s 40 (existing above the share) | room 0 (20,000 − 25,000); loan 0 |
| D | I 50,000; X 20,000; s 40 (room exactly zero) | room 0; loan 0 |
| E | I 1,00,000; X 10,000; s 40; a 0; N 20 (zero rate) | loan 72,00,000 (= 30,000 × 240); interest 0 |
| F | B with N 30 | loan 39,01,609; interest 68,98,390.16 |
| G | B with N 1 | loan 3,43,958; EMI 29,999.94; interest 16,041.30 |
| H | I 1,000; X 0; s 5; a 30; N 1 (a tiny room of ₹50) | loan 512; EMI 49.91 |
| I | I 1,00,00,000; X 5,00,000; s 90; a 6.75; N 30 (large) | room 85,00,000; loan 1,31,05,18,801; interest 1,74,94,81,198.44 |
| J | I 87,654.32; X 1,234.56; s 37.5; a 9.25; N 15 (paise in the room) | room 31,635.81; loan 30,73,848 (rounded down to a whole rupee) |
| K | The tenure table for B (room 30,000, a 8.5) | 10 y: loan 24,19,634, interest 11,80,365.86; 15 y: 30,46,490, 23,53,508.59; 20 y: 34,56,925, 37,43,074.59; 25 y: 37,25,657, 52,74,342.76; 30 y: 39,01,609, 68,98,390.16 |
| L | The rate effect for room 30,000, 20 y | 7.5%: 37,23,963; 8.5%: 34,56,925; 9.5%: 32,18,431; 10.5%: 30,04,868 |
| M | Existing EMIs' effect (A against B) | 46,09,233 with none, 34,56,925 with ₹10,000: 11,52,308 less |

## Implementation sequence (when approved)
1. `tests/fixtures/home-loan-golden.py`, then `formulas/home-loan.js` and its unit tests; focused tests only.
2. The tool module and CSS; `tests/browser/home-loan.spec.js`; run it on one project, then mobile.
3. Catalog activation in place (title kept, description and aliases changed), `toolStyles.json`; focused catalog, search, taxonomy, relationships,
   sections and tool-catalog tests; the Coming Soon helper's new pick; the navigation and Home assertions that changed on purpose.
4. The three articles, figure tests and the three images; focused article tests.
5. Pinned expectations, baselines and visual registration for the pages that change (the Home page and the affected Loans pages among them).
6. Final Tool Pack gate once (section 25), then the commit.

## Implementation notes (deviations from the plan and decisions made while building)

- **Exact arithmetic with an exact power.** The engine keeps `(1 + r)^n` as a ratio of whole numbers (BigInt, rate scaled by 1e10, n up to
  360) and takes the loan as a floored whole-number division, so the loan is never off by a rupee. The EMI, total repaid and interest are
  integer divisions scaled by 1e8 and handed back as numbers. A test brackets every checked loan with a plain-double EMI: the EMI of the
  loan is within the room and the EMI of one rupee more is above it.
- **The reference grew to 17 scenarios** (the planned A to M plus: a 18-year tenure outside the five, existing EMIs above income, a
  zero rate over 30 years, the smallest income and share, a zero own funds, a high rate with a high share and a loan with a room that is
  not a whole rupee). The planning figures were all reproduced; the totals differ from the planning run only in the digits after the
  paise (the planning run used a double-precision EMI, the reference an 80-digit one).
- **The loan is the full-width primary card; the four supporting cards are a two-by-two block.** The plan said five metrics with no orphan;
  in the shared two-column grid that needs the primary to span the row, done with one rule scoped to `#home-loan-results` in
  `home-loan.css`. The shared grid is unchanged and nothing changes on a phone (one column). A browser test checks the layout at desktop widths.
- **Related articles: three each, not two.** Each new article lists the other two and one existing Loans article
  (`emi-vs-total-interest`, `loan-tenure-total-interest`, `fixed-vs-floating-interest-rates`), as the plan intended; the Margin and Profit
  clusters, which had no other Business article, had two.
- **Intended publication effects, all reviewed:** Home Loan joined the Home page's Popular Calculators (the existing Coming soon card became
  a link; no card was added), the Loans landing page and the Calculators page; every Loans tool page now relates to four tools instead of three
  (the Home Loan card is added), so the EMI, Loan Comparison, Prepayment and Balance Transfer specs, DOM, link and SEO baselines and visual
  baselines changed on purpose; the Loans article count went from 10 to 13.
- **A visual observation, not changed here:** with four related calculators the shared related-calculators grid shows three in a row and the
  fourth alone on the next row at desktop width, on every Loans tool page. Fixing it is a shared layout decision (a four-column grid or a
  limit of three) and is left for a separate, deliberate refinement.
- **The Coming Soon helper followed the change** (its first pick is now Personal Loan). One test had used Home Loan as its example of an
  unpublished tool (the curated-tools test in `relationships.test.mjs`); it now asks the helper for a Coming Soon Loans tool, keeping its purpose.
- **Search ranking:** Home Loan is a published tool whose description mentions an EMI, so it now ranks among the published results (before
  Loan Prepayment by catalog order) for "emi" and "interest", and the new article titles and descriptions match "emi" and "tenure". These pinned
  rankings were reviewed and updated.
- **Size.** Measured, gzipped: tool module 7.3 KB, formulas 3.3 KB (about 10.5 KB together), tool CSS 1.5 KB; no dependency, no chart. Images
  (PNG / WebP): 3.9 KB / 2.9 KB, 5.2 KB / 4.6 KB and 4.3 KB / 3.9 KB. No size budget was set and none was chased.
- **Not done (deferred, as planned):** a rate table, a repayment schedule, a co-applicant, print, CSV, a chart; the fourth article ("how existing
  EMIs reduce the loan that fits"), whose numbers are covered inside the first article.
- **Repetition observed (recorded, not extracted):** the `init()` skeleton, the notes, the definition-list card, the table and sr-only rules were
  copied again from Profit and Margin; the BigInt helpers (`scaled`) are now in three engines; `toolStyles.json` gained another identical
  22-line entry; the publication touch-list again needed the catalog, sections, search, taxonomy, articles and relationships tests, the
  navigation counts, the articles listing pagination, and the accessibility, tool-controls and visual registrations. The Loans category touched
  more pinned expectations than Business or Investment because four existing tools list each other.
- **Final verification passed.** Engine golden 38, article figures 6, full unit 726; root and GitHub Pages builds; inventory (41 live pages, 24
  Coming Soon), links, assets and SEO; visual desktop 16, mobile 16, tablet 10. Browser coverage was run spec by spec with `--workers=1` (monolithic
  runs were stopped by memory pressure on this laptop in earlier packs), not as whole projects: `subpath-desktop` 19 specs (443 passed, 1 skipped),
  `subpath-mobile` 17 specs (428 passed, 1 skipped) and `root-desktop` 6 specs (148 passed).
