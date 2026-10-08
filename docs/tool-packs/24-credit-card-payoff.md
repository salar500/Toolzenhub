# Tool Pack 24: Credit Card Payoff Calculator (the sixth published Loans calculator)

Status: **built locally and verified in Chrome (desktop and the mobile emulation project); approved decisions applied. Android and Safari: UNVERIFIED.**      Base commit: 4eecceb
Roadmap: item 2 of Roadmap R1 (`docs/tool-pack-factory.md` section 10). The roadmap does not authorize this build; approval of this specification does. R1 progress when written: 1 of 8.
Id and slug: `credit-card-payoff` (route `/calculators/credit-card-payoff/`)
Section: **Calculators**, category **Loans** (new catalog entry; it does not replace a Coming Soon entry).

## Selection and feasibility record

Chosen from the platform-wide review (weighted score 3.40 of 5; **search and retention are hypotheses, not data**). The feasibility review was CONDITIONAL GO. This specification closes the conditions and **corrects three statements in that review**, found by re-deriving every example with an independent Python reference (section 25):

1. **Doubles are not precise enough.** The feasibility review proposed double-precision arithmetic "as the loan engines do". Measured on 60,000 seeded random cases against a 60-digit Decimal reference: states and month counts always agreed, but the final payment differed by more than half a paisa in 2,171 cases (3.6%) and the total repaid by up to 1.4 parts per million (tens of rupees on a very long payoff). The cause is that a payment just above the first month's interest makes the balance hypersensitive to a 1e-16 error in the monthly rate. The contract therefore uses **exact integer (BigInt fixed-point) arithmetic**, which matched the Decimal reference to within 1.7e-15 rupee on the same 60,000 cases.
2. **The saving in the worked comparison is ₹6,752.50, not ₹6,752.49.** The review subtracted two figures already rounded to the paisa (₹20,360.29 minus ₹13,607.80); the exact totals differ by ₹6,752.50 when rounded once at the end.
3. **"Beyond the horizon" cannot occur at high APRs.** At 42% a payment one paisa above the first month's interest still pays off in 372 months, because the excess compounds. The state is reachable only at lower APRs (for example 12%) or with very small payments; section 5 gives real examples near the 600-month boundary.

Every other example in the feasibility review was confirmed unchanged.

## 1. Tool identity
- Title **Credit Card Payoff Calculator**; id `credit-card-payoff`; `category: "loans"`; no subcategory.
- Description (catalog): "Estimate how many months a fixed monthly payment takes to clear a credit card balance, the interest you would pay, and what a larger payment changes. It is a simplified estimate, not a card statement. It runs in your browser."
- **Aliases (true of the tool):** credit card payoff calculator, credit card repayment calculator, credit card payoff time, pay off credit card, how long to pay off credit card, credit card debt calculator. **Not aliased:** minimum payment (V1 does not model issuer minimum-payment rules), statement, credit card EMI (a different product), "interest calculator" (the Coming Soon Interest entry leads that phrase), anything promising a "date" or a "guaranteed" result.
- Capabilities (existing flags only): `reset`, `validation`, `explanation`, `examples`, `multipleInputs`, `localProcessing`. Not `realtime` (results appear after Calculate, section 11), `copy`, `table` or `schedule`.

## 2. User problem
Someone carrying a card balance pays a fixed amount each month. They want to know how long it will take, what the interest will cost, what a larger payment would change, and whether the payment they make is reducing the balance at all. The last question is the most valuable and the least obvious: a payment at or below one month's interest never clears the debt.

**What the tool is not:** an issuer statement or payoff quote, advice to borrow or to pay a particular amount, or a model of any issuer's minimum-payment rule.

**AI-era test (rule 1.4):** an assistant can compute one payoff time, but a repeatable, exact comparison of two payments with assumptions beside the numbers, in rupees, with no card details and no prompt, is a legitimate reason to build it.

## 3. Jobs to be done
1. "How many months until this card is paid off at my payment?"
2. "How much interest will I pay in total?"
3. "What does a bigger payment change?"
4. "Is my payment even reducing the balance?"

## 4. Target users
People repaying a card balance and wanting an estimate. Not for people who pay the full balance each month (no interest is charged in that case, and the tool does not model purchases or grace periods), and not a tool for choosing a card or an issuer.

## 5. Inputs
| Field | Label | Limits | Notes |
| --- | --- | --- | --- |
| `balance` | Outstanding balance (₹) | ₹100 to ₹1,00,00,000 | At most 2 decimal places |
| `apr` | Annual percentage rate (APR) (%) | 0 to 100 | At most 2 decimal places; 0 is allowed |
| `payment` | Monthly payment (₹) | ₹1 to ₹1,00,00,000 | At most 2 decimal places |
| `comparePayment` | Compare with another monthly payment (₹), optional | blank, or ₹1 to ₹1,00,00,000 | At most 2 decimal places |

**Justified adjustments to the repository's loan conventions** (the loan calculators use balance ₹1,000 to ₹10 crore and a rate of 0.1% to 30%, and accept any number of decimals):
- **Balance from ₹100:** card balances are often small, and the loan floor would refuse them. The upper limit is ₹1 crore, a design choice.
- **APR 0 to 100%:** 0% promotional balances are real, and some card rates are high; the loan ceiling of 30% would refuse legitimate inputs. The tool does not say what APR is typical and uses no rate as a default fact.
- **Two-decimal limit on money and on APR (new):** the classification in section 6 compares the payment with one month's interest **exactly**, in integers (paise and hundredths of a percent). A value with more decimals is **refused with a message, never silently rounded**.
- **Left out on purpose:** card number, issuer, account details, minimum-payment percentage, fees, new purchases, statement and due dates, payment date. The page asks for no personal detail.

Defaults for the example only (Load example): balance ₹50,000, APR 36%, payment ₹3,000, comparison ₹4,000. A fresh page has empty fields and no result.

## 6. Calculation contract

### 6.1 Units and arithmetic (decided)
- Parse the three fields (and the optional fourth) from their text. Money becomes an integer number of **paise** (`P_paise`, `B_paise`); the APR becomes an integer number of **hundredths of a percent** (`A`, so 36% is 3600). A field with more than two decimals, an exponent, a sign, a thousands separator or any other character is invalid.
- The monthly rate is exactly `A / 120000` (APR / 100 / 12, with the APR in hundredths of a percent). It is never converted to a floating-point number.
- All balances are **BigInt fixed-point integers** scaled by 10^24 per paisa. One month: `due = balance * (120000 + A) / 120000` with integer division (an error of at most 1e-24 paisa per month, negligible). No `Number` is used for a balance, an interest figure or a total. This is native (BigInt is already used by the Unix timestamp engine) and adds no dependency.
- Money is **unrounded** inside the simulation and rounded to the paisa only when shown (rulebook section 8.3).

### 6.2 One month
1. `interest = opening * rate` (the first month's interest, `firstInterest = balance * rate`, is also reported).
2. `due = opening + interest`.
3. `pay = due` if `due <= payment + 0.5 paisa`, otherwise `payment` (the payment is capped at the amount due, and a remainder below half a paisa is treated as repaid, as in the loan tools).
4. `closing = due - pay` (set to 0 if below half a paisa).
Payments are made at the **end of each month**; the first payment is one month after the starting balance, so month 1 charges interest first.

### 6.3 The three outcomes (decided; B and C are different states)
**First test, exact, before any simulation.** If `APR > 0` and `payment_paise * 120000 <= balance_paise * A` (all integers, no floating point), the payment is **less than or equal to the first month's interest**: state **NON-AMORTIZING**.
- It reports that the payment does not cover the first month's interest and names the **smallest payment that does**: `floor(balance_paise * APR_hundredths / 120000) + 1` paise, an exact integer, **never derived from the rounded interest shown elsewhere** (when the interest has a fraction of a paisa of one half or more, the rounded interest equals this smallest payment, so "this payment or less does not help" would be false). It reports **no payoff time, no total interest, no total repaid, no final payment**.
- A balance that never falls includes the equal case: a payment exactly equal to the interest leaves the balance unchanged.

**Otherwise simulate up to 600 months** (50 years):
- **PAYOFF**: the balance reaches zero within 600 months. Report the number of payments (the last is usually smaller), total interest, total repaid, the first month's interest and the **final payment**.
- **BEYOND HORIZON**: the payment exceeds the first month's interest but a balance remains after payment 600. Report "the estimated payoff is more than 50 years (600 months) away at this payment". **No exact time, interest or total is reported**, and no figure is invented from the remainder.
`APR = 0` is never NON-AMORTIZING (there is no interest); months = `ceil(balance / payment)`, which is BEYOND HORIZON when it exceeds 600.

### 6.4 Totals and display
- `months` = the number of payments made (including the last). Shown as "N months" and, from 12 months, as "X years Y months" (the shared `formatDuration` may be reused).
- `totalRepaid` = the sum of the payments. `totalInterest` = `totalRepaid - balance` (exactly the sum of the monthly interest, a conservation property that is tested).
- Money is shown **with two decimals** (₹70,360.29) using a tool-local `en-IN` formatter, because payments of ₹3,500.01 and final payments matter to the paisa. The shared whole-rupee `formatINR` is not changed.
- Displayed figures are each rounded once from the exact values, so figures added by hand can differ by a paisa; the page says so (section 8).

### 6.5 Comparison (optional second payment)
Both payments are evaluated with the same balance and APR. The comparison section appears only when the second field is filled and valid.
| Payment 1 | Payment 2 | What is shown |
| --- | --- | --- |
| PAYOFF | PAYOFF | Side by side, plus **months difference** and **interest difference**: "Payment 2 takes 8 fewer months" / "8 more months" / "the same number of months"; "Payment 2 costs ₹6,752.50 less interest" / "more interest" / "the same interest". The difference is computed from the **exact** totals and then rounded once. |
| NON-AMORTIZING | PAYOFF | Side by side; the unavailable state: "Payment 1 does not pay the balance off, so no saving can be worked out." The second payment's result is shown on its own. |
| PAYOFF | NON-AMORTIZING | Mirror image of the row above. |
| BEYOND HORIZON | PAYOFF (or the reverse) | "At payment 1 the estimated payoff is more than 50 years away, so no saving can be worked out." The other result is shown on its own. |
| two non-payoff states (any mix of NON-AMORTIZING and BEYOND HORIZON) | | Each side states its own outcome; the unavailable line says no comparison of time or interest can be worked out. |
| Equal payments | | Both shown; "The two payments are the same." No difference lines. |
**No saving, difference or percentage is ever displayed unless both sides are PAYOFF.**

### 6.6 Validation messages (exact text, shown on the field, nothing silently clamped)
- Balance: "Enter a balance between ₹100 and ₹1,00,00,000, with at most 2 decimal places."
- APR: "Enter an annual percentage rate between 0% and 100%, with at most 2 decimal places."
- Payment (and comparison): "Enter a monthly payment between ₹1 and ₹1,00,00,000, with at most 2 decimal places."
- A blank required field gets the same text. A blank comparison field is simply not used.

## 7. Failure and edge-case behaviour
| Case | Behaviour |
| --- | --- |
| Payment at or below the first month's interest (APR above 0) | NON-AMORTIZING (exact test). Never reported as BEYOND HORIZON. |
| Payment one paisa above the interest | Simulated; PAYOFF if within 600 months, else BEYOND HORIZON. |
| Payment at least the whole debt plus its first month's interest | PAYOFF in 1 payment; the final payment is `balance + first interest`. |
| APR 0 | No interest; months `ceil(balance / payment)`; total interest 0.00; BEYOND HORIZON if over 600 months. |
| Remainder below half a paisa before a payment | That payment is the final one and includes it (so the total repaid is exact and the balance is exactly 0). |
| Very small balance or payment (₹100, ₹1) | Valid. |
| Largest values (₹1 crore, 100%, ₹1 crore) | Valid; computed exactly (BigInt does not overflow). |
| Comparison blank | The comparison section is absent. |

## 8. Assumptions (shown beside the results, not only in the FAQ)
Shown as a short list in the results area, always visible:
- The APR is divided by 12 to give a monthly rate.
- Interest is charged on the balance at the start of each month, **before** that month's payment, and payments are made at the end of each month.
- The payment is fixed and applied in full each month; the last payment is whatever is left.
- A remaining amount of half a paisa or less may be included in the final payment. (Shown as a visible bullet beside the results: it is the half-paisa rule of section 6.2, and it is why the final payment can be shown one paisa above the entered payment in a rare tie, for example ₹100 at 0.06% with ₹100: one payment of ₹100.005, shown ₹100.01 with ₹0.01 of interest.)
- No new purchases, fees, penalties, rewards, taxes or promotions are included.
- No issuer-specific minimum-payment or billing-cycle rules are modelled, and real cards may charge interest on daily balances and statement cycles, so a real payoff can differ.
- This is an estimate, not a statement or a payoff quote, and not advice. Displayed figures are rounded to the paisa from unrounded values, so figures added by hand can differ by a paisa.
Nothing in the tool says its model follows any issuer's terms.

## 9. Trust and safety (decided wording rules, per rule 3.7)
- Results are "estimated" and the model is "simplified"; never "guaranteed", "your payoff date", "will be debt free by". No date is ever shown.
- No recommendation to borrow, to stop paying, to choose a payment or to prefer one of the two compared payments; the comparison is neutral ("takes 8 fewer months").
- The NON-AMORTIZING result states a fact about the model ("this payment does not cover the interest, so the balance does not fall") and shows the first month's interest and the smallest payment that exceeds it; it does not tell the user what to pay.
- No card number or personal detail is requested. Calculation is local; nothing is stored, sent or placed in the address.

## 10. Outputs and result hierarchy
1. **Primary:** the estimated payoff time ("24 months (2 years)"), or the clear explanation of NON-AMORTIZING or BEYOND HORIZON. The state is stated in words first.
2. **Supporting (PAYOFF only):** total interest, total repaid, first month's interest, final payment (and "number of payments").
3. **For NON-AMORTIZING:** first month's interest and the smallest payment that exceeds it (supporting, not a recommendation).
4. **Comparison (optional):** two result columns on wide screens, stacked on phones, then the difference lines or the unavailable line (section 6.5).
5. **Assumptions** directly under the results.
Not shown: a month-by-month schedule, a chart, a payoff date, a "debt-free by" claim, any percentage of interest to principal beyond the plain totals.

## 11. UX flow
Intro and trust card; form (balance, APR, payment, optional comparison); a **Calculate** button (primary, like the other loan calculators; a result appears only after it, and changing an input afterwards marks the result as out of date until Calculate is pressed again, as the SWP calculator does); Load example and Reset (secondary); results with assumptions; How to Use; Worked Example; How the Calculation Works; Why a Payment May Not Reduce the Debt; Comparing Two Payments; Assumptions and Limitations; FAQ. The existing shared field and result components are used. Reset clears every field and result, announces "Cleared", and returns focus to the balance field.

## 12. Result wording (exact strings for the three outcomes)
- PAYOFF: "Estimated payoff: 24 months (2 years)." and "The last payment is ₹1,360.29."
- NON-AMORTIZING: "Your monthly payment does not cover the first month's interest under this model. A payment of at least ₹1,500.01 is needed to start reducing the balance." The result also shows the first month's interest (rounded for display) and "Smallest payment that reduces the balance". The wording promises no payoff: a payment at that threshold may still be beyond the 50-year horizon.
- BEYOND HORIZON: "At this payment the estimated payoff is more than 50 years (600 months) away, so no payoff time is shown."
(The payment figure is the exact smallest whole-paisa payment strictly above the first month's interest. Example: ₹1,00,000 at 12.02% has interest 1,001.6667, shown ₹1,001.67; ₹1,001.66 is told to pay at least ₹1,001.67, and ₹1,001.67 reduces the balance very slowly, so it is beyond the horizon, not non-amortizing.)

## 13. Table, chart, export, print, URL state
**NOT NEEDED in V1** for each: a month-by-month table would imply statement precision the model does not have; a chart restates the numbers; export and print have no clear user job here; URL state is not used for financial inputs (nothing is placed in the address).

## 14. Privacy, storage and network
No request carries a figure, no `localStorage`, `sessionStorage`, IndexedDB or cookie, no address or title change, no logging (all tested as for the JWT Decoder and the Hours Calculator). Inputs are read as text and never inserted as HTML; results are written with `textContent`.

## 15. Mobile behaviour (320, 360, 390 px)
One column. Fields at 16 px with 48 px height; buttons 48 px. Result columns stack. Long figures (₹99,99,99,999.99) wrap; no page-level horizontal scroll with every field at its maximum, in the NON-AMORTIZING and BEYOND HORIZON states, and with the comparison shown.

## 16. Accessibility
Labelled fields; errors as text linked with `aria-describedby`, field `aria-invalid`; a polite live region announces one sentence per Calculate ("Estimated payoff 24 months. Total interest ₹20,360.29." / "This payment will not pay off the balance." / "No payoff within 50 years at this payment."), and the comparison adds one more sentence. The outcome is stated in words, never by colour; headings in order; keyboard operation throughout; visible focus; 44 px targets. The out-of-date marker is text.

## 17. Architecture and exact file impact (proposed; none exist yet)
**New files:**
- `assets/js/calculators/formulas/credit-card-payoff.js` (pure engine: parsing to integers, validation, the exact classification, the BigInt simulation, comparison, formatting helpers; no DOM)
- `assets/js/calculators/credit-card-payoff/index.js` (the page, using `ui/field.js`, `ui/result.js`, `ui/escape.js`)
- `assets/css/calculators/credit-card-payoff.css`
- `tests/unit/credit-card-payoff.test.mjs`, `tests/browser/credit-card-payoff.spec.js`
- `tests/fixtures/credit-card-payoff-golden.py` and `tests/fixtures/credit-card-payoff-golden.json`

**Existing files, small changes:**
- `assets/js/data/tools.js`: the entry (see section 18). The calculator registry and the route are derived from the catalog (`calculator-registry.js`, the build), so nothing else is declared.
- `src/_data/toolStyles.json`: the stylesheet entry.
- Pinned unit tests: `catalog.test.mjs` (the published calculator list, metadata, the Loans list), `sections.test.mjs` (registry keys and metadata), `relationships.test.mjs`, `search.test.mjs`, `tool-capabilities.test.mjs`.
- Browser specs that pin Loans or calculator counts: `navigation.spec.js` (calculators page 26 to 27 entries and 14 to 15 built; Loans page 8 to 9 and 5 to 6 built; All Tools Calculators count), plus any spec that asserts the Loans related lists; each failing literal is read and changed on its merits.
- `tests/inventory/url-inventory.json` (regenerated); the DOM, links and SEO baselines; the visual baselines of the Loans, All Calculators and All Tools listings.
- `docs/tool-packs/24-credit-card-payoff.md` (implementation notes after the build).
No change to shared components, the shared formatter, the global header, footer or navigation; no dependency.

## 18. Catalog metadata and relationships (decided; the established architecture is used)
- `id: "credit-card-payoff"`, `category: "loans"`, `status: "published"`, `loader: () => import("../calculators/credit-card-payoff/index.js")`, an `icon`, the title and description of section 1.
- **`autoRelated` is left at its default (true).** The Loans category's established relationship architecture then applies: every other Loans calculator gains this tool at the end of its related list and this tool gets the other Loans calculators. The affected pinned lists (EMI, Loan Comparison, Home Loan, Balance Transfer, Prepayment) are **updated deliberately**, not avoided.
- `relatedTools: ["balance-transfer", "prepayment", "emi"]` (curated first, then the rest of the category fills): moving a balance to a lower rate, paying extra, and a fixed payment over a term are the natural neighbours.
- `relatedArticles`: `["loan-comparison/loan-tenure-total-interest", "loan-comparison/emi-vs-total-interest"]` (existing published articles about how payment and term change total interest). A curated list is shown as written and is not padded. **No new article is created.** Whether to curate or to accept the automatic Loans-category fill is a decision for approval (section 28).
- The relationships on the articles' side (their automatic related-tool fill from the Loans category) will include the new tool; the pinned expectations are updated after being read.
- SEO: title "Credit Card Payoff Calculator: Months and Interest | ToolZen Hub"; description "Estimate how many months a fixed monthly payment takes to clear a credit card balance, the interest you would pay, and what a larger payment changes. A simplified estimate, not a card statement. It runs in your browser." Canonical, sitemap and breadcrumb (Home, Calculators, Loans, Credit Card Payoff Calculator) come from the existing build and catalog.

## 19. SEO and content plan
- **H1:** Credit Card Payoff Calculator.
- **How to Use:** enter the balance, APR and a monthly payment; press Calculate; optionally add a second payment to compare.
- **Worked Example:** ₹50,000 at 36% with ₹3,000 a month (section 25): the first month's interest is ₹1,500.00, the payoff takes 24 payments, the last is ₹1,360.29, total interest ₹20,360.29, total repaid ₹70,360.29; compared with ₹4,000 a month (16 months, ₹13,607.80 interest) it is 8 fewer months and ₹6,752.50 less interest. The 36% and the amounts are illustrations, not typical rates.
- **How the Calculation Works:** APR divided by 12; interest on the opening balance, then the payment; the last payment is smaller; no dates.
- **Why a Payment May Not Reduce the Debt:** interest each month is the balance times the monthly rate; a payment at or below it leaves the balance unchanged or growing; a payment just above it works very slowly (the page gives the real 12% examples).
- **Comparing Two Payments:** what the difference lines mean and when they are unavailable.
- **Assumptions and Limitations:** section 8, in full, with the "estimate, not a statement or advice" statement.
- **FAQ (5):** Is this my card's exact payoff? (no); Why does my payment not reduce the balance? ; What happens if I pay the minimum? (the tool does not model issuer minimum rules, so it cannot say; it shows what a fixed payment does); Does it include fees or new purchases? (no); Is my data stored or sent? (no).
- No claim of a guaranteed date, no keyword volumes, no recommendation. No supporting article in this phase.

## 20. Performance
Synchronous, at most 600 BigInt iterations per payment (two payments at most), a few hundred microseconds, no worker, no timers beyond the announcement delay, no dependency.

## 21. Tests (risk-based; no broad regression)
See section 26. Mutation checks of the key rules (the `<=` in the exact test, the half-paisa final-payment rule, the 600 cap, the comparison guard) are part of the plan.

## 22. Imagery and articles
**NOT NEEDED.** No image; no new article.

## 23. Risks
- **Model risk (the main one):** real cards use daily balances and statement cycles and add fees and new purchases. Mitigation: the assumptions beside the results, the estimate framing, no date, no promise, no issuer claim.
- **Misreading:** a payoff figure read as a plan or advice. Mitigation: neutral wording, no recommendation, no comparison "winner".
- **Precision at the threshold:** addressed by exact integer arithmetic (section 6.1).
- **Long, very small paydowns:** shown as BEYOND HORIZON, never as an invented figure.
- **Test churn:** the Loans category's automatic relationships change several pinned lists; each is updated deliberately.

## 24. Explicit exclusions (V1)
Minimum-payment simulation or modelling, issuer or card selection, daily accrual and billing cycles, fees, penalty rates, new purchases, promotional rate changes, balance transfers within the tool, a schedule table, a chart, export, print, URL state, saved state, a "payment needed for N months" mode (a natural later addition: it equals the EMI of the balance over N months), any API, any dependency, accounts, articles and imagery.

## 25. Independently verified numerical examples
Every figure below was recomputed with `tests/fixtures/credit-card-payoff-golden.py`'s method (Python `decimal`, 60 digits, month-by-month simulation with the exact rules of section 6; an exact-rational simulation with no tolerance; the closed form `n = -ln(1 - B*i/P) / ln(1 + i)`; and the integer exact test). All three simulation methods agree on every state and every month count; totals agree to the paisa and the closed form agrees with the rounded-up month count.

| # | Balance, APR, payment | State | First interest | Payments | Total repaid | Total interest | Final payment |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ₹50,000, 36%, ₹3,000 | PAYOFF | 1,500.00 | 24 | 70,360.29 | 20,360.29 | 1,360.29 |
| 2 | ₹50,000, 36%, ₹4,000 | PAYOFF | 1,500.00 | 16 | 63,607.80 | 13,607.80 | 3,607.80 |
| 1 vs 2 | comparison | PAYOFF / PAYOFF | | **8 fewer** | | **₹6,752.50 less** (exact difference; rounded figures subtract to 6,752.49) | |
| 3 | ₹1,00,000, 42%, ₹3,500.00 | NON-AMORTIZING | 3,500.00 | | | | |
| 4 | ₹1,00,000, 42%, ₹3,499.99 | NON-AMORTIZING | 3,500.00 | | | | |
| 5 | ₹1,00,000, 42%, ₹3,500.01 | PAYOFF | 3,500.00 | **372** | **12,98,789.18** | **11,98,789.18** | **285.47** |
| 6 | ₹1,00,000, 42%, ₹4,000 | PAYOFF | 3,500.00 | 61 | 2,41,802.51 | 1,41,802.51 | 1,802.51 |
| 7 | ₹24,000, 0%, ₹2,000 | PAYOFF | 0.00 | 12 | 24,000.00 | 0.00 | 2,000.00 |
| 8 | ₹1,000, 36%, ₹5,000 | PAYOFF | 30.00 | 1 | 1,030.00 | 30.00 | 1,030.00 |
| 9 | ₹2,50,000, 40%, ₹7,500 | NON-AMORTIZING | 8,333.33 | | | | |
| 10 | ₹2,50,000, 40%, ₹8,333.33 | NON-AMORTIZING (first interest is 8,333.3333...) | | | | | |
| 11 | ₹2,50,000, 40%, ₹8,333.34 | PAYOFF | 8,333.33 | 429 | 35,67,857.89 | 33,17,857.89 | 1,188.37 |
| 12 | ₹1,00,000, 12%, ₹1,005 | PAYOFF | 1,000.00 | 533 | 5,35,642.74 | 4,35,642.74 | 982.74 |
| 13 | ₹1,00,000, 12%, ₹1,001 | **BEYOND HORIZON** (a balance of about ₹60,941.66 remains after 600 payments; closed form 694.3 months) | 1,000.00 | | | | |
| 14 | ₹1,00,000, 12%, ₹1,002 | **BEYOND HORIZON** (about ₹21,883.32 remains; closed form 624.8 months) | 1,000.00 | | | | |
| 15 | ₹60,000, 0%, ₹100 | PAYOFF in exactly **600** payments | 0.00 | 600 | 60,000.00 | 0.00 | 100.00 |
| 16 | ₹60,000, 0%, ₹99.99 | **BEYOND HORIZON** (601 payments needed) | 0.00 | | | | |
| 18 | ₹1,00,000, 12%, ₹1,500 | PAYOFF | 1,000.00 | 111 | 1,65,616.24 | 65,616.24 | 616.24 |
| 12 vs 18 | comparison | PAYOFF / PAYOFF | | **422 fewer** (533 vs 111) | | **₹3,70,026.50 less** | |

Notes on the verification:
- **Example 5 (₹3,500.01):** the feasibility figures (372, 12,98,789.18, 11,98,789.18, 285.47) are **confirmed**, and an exact-rational simulation also needs 372 payments.
- **Examples 3 to 5, 9 to 11:** the classification is by the exact integer test, so one paisa below, at and above the first month's interest give NON, NON and PAYOFF. The fractional interest case (8,333.3333...) behaves correctly: ₹8,333.33 is below it (NON) and ₹8,333.34 is above it (PAYOFF, 429 payments).
- **Example 13 and 14** show that BEYOND HORIZON is a real, different state (the payment exceeds the interest but is far too small), and example 12 is the nearest PAYOFF at 533 payments. **Examples 15 and 16** pin the 600-month boundary exactly (600 is PAYOFF, 601 is BEYOND).
- **Half-paisa final-payment rule.** Example: balance ₹371.95, APR 5.01%, payment ₹10.87: after 36 payments the amount due in month 37 is ₹10.8724, which is 0.24 paisa above the payment, so the tool makes **37** payments with the last being ₹10.8724 (shown ₹10.87) and a total of ₹402.19; a model with no tolerance would need a 38th payment of about 0.24 paisa. The same behaviour appears at ₹1,587.71, 8.29%, ₹53.97 (33 payments, an exact model needs 34) and ₹2,228.07, 42.42%, ₹135.70 (25, exact needs 26). These cases were found by a targeted search: in the 60,000-case random sample the rule never changed a month count. It is the repository's existing convention (the loan tools treat a balance under half a paisa as repaid).
- The extreme valid corners (₹1 crore, 99.99% or 100%, ₹1 crore payments; ₹100 at ₹1 a month at 0%, which is exactly 100 payments) are in the golden fixture. A payment below ₹1 is invalid input.

## 26. Independent verification plan
**Reference (`tests/fixtures/credit-card-payoff-golden.py`, Python standard library):** three methods that must agree before a value is written: (1) a `decimal` month-by-month simulation with the rules of section 6; (2) an exact `fractions` simulation with no tolerance, which must give the same state and month count, and totals within half a paisa; (3) the closed-form payment count, which must equal the rounded-up month count wherever the tolerance rule does not fire. A fourth cross-check: the payment that clears a balance in N months, from the annuity formula, rounded up to the paisa, must give at most N payments, and one paisa less must give more. The fixture writes the named vectors above plus a seeded sample (about 300 cases covering every state, boundaries one paisa either side of the first interest, the 600/601 boundary, zero APR, tiny and maximal values) and **digests of exhaustive sweeps** (a grid of balances, APRs and payments from one paisa below to one paisa above the first month's interest, classified by the exact test).

**Unit (`tests/unit/credit-card-payoff.test.mjs`):** the vectors and sweeps against the engine (BigInt, no floating point in a balance: a source check forbids `parseFloat` and `Math.pow` there); every validation message and each rejected input form (3 decimals, `1e3`, `-5`, `1,000`, blank, text); the exact classification; conservation (`totalRepaid - balance` equals the sum of the monthly interest and the final balance is 0); monotonicity (a larger payment never takes more payments and never costs more interest, over a seeded grid); the comparison table (every combination of states, and that no saving is produced unless both are PAYOFF); the 600/601 boundary; the half-paisa rule; large values; the wording scan (no "guaranteed", "date", "debt-free by", "recommend", "best", "should"); engine mutations (the `<=`, the half-paisa rule, the 600 cap, the comparison guard) each caught, then reverted.

**Browser (`tests/browser/credit-card-payoff.spec.js`, `subpath-desktop` and `subpath-mobile`, `--workers=1`):** the example and its figures; each of the three outcomes with its exact sentence; the comparison states (PAYOFF/PAYOFF with differences, the unavailable lines for the other combinations, equal payments); validation messages and their `aria` links; out-of-date marking after an edit; Reset and focus; announcements; keyboard path; hostile text in the fields; privacy (no request, empty storage, unchanged URL and title, no logging); 320, 360 and 390 px with maximal values and every state (no page-level overflow, readable text, 44 px targets); breadcrumb and listing. One mutation check of the page.

**Integration (affected consumers only):** the pinned catalog, sections, relationships, search and capabilities tests; the Loans, All Calculators and All Tools listing counts in `navigation.spec.js` and any spec that pins the Loans related lists; the regenerated inventory; the DOM, links and SEO baselines; the affected visual baselines (reviewed by eye); static link, asset and SEO checks. No full regression.

**Manual (at the Roadmap R1 milestone):** real Android and Safari/WebKit (decimal keyboards, BigInt support on older Safari, wrapping of long figures). Until then both are reported **unverified**. BigInt needs Safari 14 or later; the tool should feature-detect it and show a clear message rather than fail silently (the Unix converter already depends on BigInt).

## 27. Quality gate
All eight gates pass on the current information: a real problem; not a duplicate of the term-loan tools; reliable output **given** the displayed assumptions and the exact arithmetic; no upkeep (no changing data); no API; no privacy risk (local, nothing stored, tested); good on a phone by design (device check at the milestone); not added for the count. Weighted score about 3.40 of 5, search and retention being hypotheses.

## 28. Decisions to confirm at approval
1. **Exact BigInt fixed-point arithmetic** instead of the loan engines' doubles (measured reason in the record above).
2. **APR limited to two decimals** (a new rule, needed for the exact classification) and money to two decimals, refused rather than rounded.
3. Balance from ₹100 and APR 0 to 100% (adjusting the loan tools' ₹1,000 and 0.1% to 30%).
4. Results shown to the paisa with a tool-local formatter.
5. Savings computed from exact totals and rounded once (so rounded figures can differ by a paisa, stated on the page).
6. **Curated related articles** (two existing Loans articles) rather than the automatic Loans fill.
7. Curated related tools: Balance Transfer, Prepayment, EMI; `autoRelated` left on.
8. One optional comparison payment (not several).
9. A Calculate button with an out-of-date marker (not live results), as the other loan calculators.
10. The alias list (no "minimum payment", no "interest calculator").
11. Whether the new page gets its own visual baseline (default: no).

## 29. Rulebook note
This specification introduces **no new permanent rule**. One engineering observation may be worth a rule if you approve it: an engine whose answer is hypersensitive to a rounding error near a threshold should use exact arithmetic. It is recorded here as a tool decision (section 6.1) and proposed to you, not added to the rulebook.

## 30. Implementation notes (built locally, not committed)

**Clarifications applied to the contract (half-paisa residual, final payment, conservation):**
- The non-amortizing test is exact and runs first. The half-paisa rule can never change it.
- The rule applies only inside the simulation: when the amount due in a month is no more than half a paisa above the payment, that month's payment is the amount due, so **the final payment can exceed the entered payment by less than half a paisa** (shown rounded to the paisa) and the balance is then exactly zero. A residual below half a paisa therefore never creates another payment.
- Conservation: total repaid minus the starting balance equals the total interest **exactly** (a unit test checks the exact fixed-point values), and every payment but the last equals the entered payment.
- **The rule can decide payoff against beyond-horizon, but only at payment 600.** Example: ₹3,217.77 at 4.75% with ₹14.05 pays off in exactly 600 payments (the 600th is ₹14.0525..., shown ₹14.05); an exact model would need a 601st payment of about 0.25 paisa. One paisa less (₹14.04) is beyond the horizon. This is the repository's existing half-paisa convention, it is documented, and a golden vector and unit tests pin it, so it is never silent.

**Deviations from the plan above (all small):**
- The fields use the shared `numberField` (`type="number"`, `step="any"`), so the browser itself will not accept text such as "abc"; the engine still refuses an exponent (`1e3`), a sign, more than two decimals and any separator with the exact message.
- Load example fills the four fields **and calculates** (an explicit action); Reset leaves the fields empty.
- Under 640 px the fields are 16 px text and 48 px high (the shared 13 px field size would also make iOS zoom on focus).
- BigInt is called as a function (never written as a literal) so the module still loads where BigInt is missing; the page then shows the exact-arithmetic message and disables Calculate. A browser test removes `BigInt` before load.

**Verification run (risk-based, no broad regression):**
- Unit, `tests/unit/credit-card-payoff.test.mjs`: 33 tests against `tests/fixtures/credit-card-payoff-golden.py` (Decimal simulation, exact Fraction simulation, closed form, annuity cross-check): 30 named vectors, a seeded sample of 300 (all three states), 12 comparison pairs, 7 annuity cases and an exhaustive threshold sweep digest. Ten deliberate mutations (the exact `<=`, the half-paisa rule, the 600 cap, the comparison guard, the smallest-reducing `+ 1`, the sign and rounding of the difference, the interest total) were each caught except one equivalent mutant (`APR >= 0` in the threshold test, which cannot change a result because a payment is at least one paisa).
- Browser, `tests/browser/credit-card-payoff.spec.js`: 21 tests per project on `subpath-desktop` and `subpath-mobile`; two page mutations (the out-of-date marker) caught.
- Pinned unit tests updated (catalog, sections, relationships, search; 274 affected unit tests pass); inventory regenerated (78 live pages); DOM, links and SEO baselines and the visual baselines of the Loans, All Calculators and All Tools listings and the five Loans calculator pages (a new related card) updated and reviewed.
- Browser specs updated for the new Loans tool (related-card counts 4 to 5, calculators page 26 to 27 entries and 14 to 15 built, Loans page 8 to 9 and 5 to 6 built, search result lists, the All Tools loan count) and two **stale expectations from earlier packs corrected in the same pass**: the Investment category listing in `navigation.spec.js` (it omitted the SWP Calculator) and `build.spec.js` (the two SWP articles: a related-card count and the image-free second article).

**Known limitations:** a model, not a statement (section 8); results to the paisa from exact arithmetic, so figures added by hand can differ by a paisa; no schedule, chart, export or URL state; BigInt needs a current browser. Real Android and Safari are **unverified**; a screen reader was not used.

## 31. Corrections after the final independent audit

Two required corrections were applied; the approved calculation (exact BigInt arithmetic, APR/12, end-of-month payment, the exact non-amortizing test, the 600-month horizon, the comparison from exact totals and the half-paisa rule) is **unchanged**.
1. **Non-amortizing wording.** The old sentence used the rounded first-month interest ("a payment of ₹1,001.67 or less does not reduce the balance") and was false for ₹1,00,000 at 12.02% when the payment is ₹1,001.67. The sentence now names the exact smallest reducing payment (section 12). The result's third figure is labelled "Smallest payment that reduces the balance".
2. **Half-paisa disclosure.** A visible bullet in the assumptions beside the results (section 8).

Evidence: golden fixture vectors added (the 12.02% pair and the ₹100 / 0.06% tie), unit tests for exact, fractional-paisa and zero-APR thresholds, a seeded grid (4,000 cases) that checks the sentence's amount against the exact integer threshold and the payment just below it, browser tests for the visible message and disclosure on both emulations, and mutations (deriving the sentence from the rounded interest; changing the threshold rounding) both caught. The only baseline that changed is the SEO baseline's `visibleTextChars` for this page (7,133 to 7,214), from the added bullet.
