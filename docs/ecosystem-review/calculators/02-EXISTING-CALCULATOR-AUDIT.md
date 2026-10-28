# 02. Existing calculator audit

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

**Audit depth, stated plainly.** For all 18 published calculators this phase read the engine header (formula, convention, rounding, exclusions), the engine's exported parameters, the page module's header and event wiring, the catalog entry and the list of existing tests. It did **not** open the pages in a browser, so layout, touch targets, focus behaviour and screen-reader output are **NOT VERIFIED** here; where the table says a feature exists, it was found in the source. Engine correctness was independently checked for EMI and SIP only (11). Everything else about correctness rests on the existing golden tests, which this phase did not re-run.

## 1. Capability matrix

Legend: LIVE = results appear as the visitor types; EXPLICIT = needs a Calculate action; Sched = a payment or year-by-year schedule; Copy = a copy-summary control; Exp = file export; Print = browser print control; Live region = a polite status region exists in the source.

| # | Calculator | Category | Model | Sched | Copy | Exp | Print | Live region | Exact arithmetic | Golden test |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | EMI | Loans | EXPLICIT | no | no | no | no | yes | no (float) | `emi-golden`, `loan-formulas` |
| 2 | Loan Comparison | Loans | LIVE in effect, with a redundant button | modal | no | PDF (CDN) | no | n/a | no | browser spec |
| 3 | Home Loan | Loans | LIVE | no | no | no | no | yes | no (floor to whole rupee) | `home-loan-golden` |
| 4 | Balance Transfer | Loans | LIVE | no | no | no | yes | yes | no | `balance-transfer-golden` |
| 5 | Loan Prepayment | Loans | LIVE | yes | no | CSV | yes | yes | no | `prepayment-golden`, `prepayment-export` |
| 6 | Credit Card Payoff | Loans | EXPLICIT (stale label) | no (summary only) | no | no | no | yes | **BigInt, paise** | `credit-card-payoff` |
| 7 | SIP | Investment | LIVE | yearly | no | no | yes | yes | no | `sip-golden` |
| 8 | SWP | Investment | LIVE | yearly | no | no | no | yes | no | `swp-golden` |
| 9 | FD | Investment | LIVE | no | no | no | no | yes | no | `fd-golden` |
| 10 | CAGR | Investment | LIVE | no | no | no | no | yes | integer paise | `cagr-golden` |
| 11 | PPF | Investment | EXPLICIT (stale label) | yes | no | no | no | yes | no | `ppf-golden` |
| 12 | GST | Tax and pay | LIVE | items | no | no | no | yes | integer paise | `gst-golden` |
| 13 | Old vs New Tax Regime | Tax and pay | LIVE (settled results only) | no | no | no | no | yes | integer paise | `income-tax-golden` |
| 14 | Gratuity (India) | Tax and pay | LIVE (G9) | no | **yes** | no | no | yes | integer paise | `gratuity-golden` and four more |
| 15 | Salary / CTC to In-Hand | Tax and pay | LIVE | no | no | no | no | yes | integer fractions | `salary-in-hand-golden` |
| 16 | Profit | Business | LIVE | no | no | no | no | yes | no | `profit-golden` |
| 17 | Margin | Business | LIVE | no | no | no | no | yes | paise rounding up for derived price | `margin-golden` |
| 18 | Percentage | Math | LIVE | no | no | no | no | yes | **BigInt** | `percentage-golden` |

## 2. Per-calculator assessment

Each entry gives purpose and user, what it computes (inputs and formula), assumptions and rounding, what it does not do, interaction, links and articles (article counts from `03-CALCULATORS-ECOSYSTEM.md`, not recounted), and the recommended action. "Action" values: KEEP, ENHANCE (named change, see 07 and 09), or INTERACTION (Calculate-button change, see 03).

### 2.1 EMI Calculator
- **Purpose and user.** Monthly instalment, total interest and total payment for a reducing-balance loan; anyone sizing a loan. Generic and the likeliest entry point for loan queries (HYPOTHESIS; the owner requested indexing of `/calculators/emi/` on 2026-10-09).
- **Inputs and formula.** Loan amount, annual rate, tenure in years. `r = annual / 12 / 100`, `n = round(years x 12)`, `EMI = P r (1+r)^n / ((1+r)^n - 1)`, and `P / n` when `r = 0`. An invalid or non-positive input returns 0 from the engine.
- **Assumptions and rounding.** Payments at month end, fixed rate, no fees or insurance; the engine does not round, the page displays rounded figures.
- **Not done.** No schedule (although `calculateAmortization` exists), no tenure or rate solver, no copy, no hand-off to Prepayment or Loan Comparison, no curated related tools.
- **Interaction.** Explicit: the form's submit runs `calculate()`; the button reads "Calculate EMI".
- **Verified numerically.** 10,00,000 at 8.5% for 20 years: EMI 8,678.23, total interest 10,82,775.76 (matches the independent reference).
- **Action.** ENHANCE and INTERACTION: pack 45.

### 2.2 Loan Comparison Calculator
- **Purpose.** Two loans side by side (amount with a unit selector, rate, years, linked sliders), EMI, interest and total repayment, an amortization view for each and a PDF.
- **Interaction.** The page compares once on load and every input and slider calls `compareLoans()`, so the "Compare Loans" button changes nothing the visitor has not already seen. The catalog already declares `realtime: true`.
- **Risk.** The PDF path loads jsPDF, AutoTable and a font from public CDNs at click time (F-SEC-1).
- **Action.** INTERACTION (remove the redundant button) and SECURITY repair: pack 46.

### 2.3 Home Loan Calculator (EMI budget)
- **Purpose.** The loan that fits the visitor's EMI budget: income, existing EMIs, share of income, rate, years, own funds.
- **Formula.** `room = max(0, income x share - existing)`, `P = floor(room (((1+r)^n - 1) / (r (1+r)^n)))`, rounded **down** to a whole rupee so the EMI never exceeds the room. Never says "eligible" or "approved".
- **Action.** KEEP. This tool already covers the Loan Affordability candidate.

### 2.4 Loan Balance Transfer Calculator
- **Purpose.** Whether moving the outstanding balance saves money: both loans' EMI and tenure, user-entered closing and new-loan charges.
- **Model.** `S(m) = EMI0 min(m,n0) - EMI1 min(m,n1) - charges`; break-even is the first month with `S >= 0`; a longer new tenure can make the saving only temporary (detected and said).
- **Action.** KEEP.

### 2.5 Loan Prepayment Calculator
- **Purpose.** What a part-payment saves. Inputs: balance, rate, remaining months, prepayment, after how many EMIs.
- **Model.** Two outcomes, keep the EMI (loan ends sooner) or reduce the EMI (same end date); schedule shown; CSV export; print.
- **Action.** KEEP.

### 2.6 Credit Card Payoff Calculator
- **Purpose.** Months to clear a balance at a fixed monthly payment, with an optional second payment for comparison.
- **Model.** `rate = APR / 12`, interest on the opening balance before that month's payment, payment at month end, 600-payment horizon, three outcomes (non-amortizing, payoff, beyond horizon). Money in whole paise and a BigInt fixed-point balance (scaled 10^24 per paisa) because doubles gave the wrong paise near the interest threshold.
- **Not modelled by design.** Purchases, fees, minimum-payment rules, issuer behaviour.
- **Interaction.** Explicit; editing after a result labels it out of date (spec 24).
- **Action.** INTERACTION (P1) and a snowball/avalanche mode (P1). The BigInt engine must not change.

### 2.7 SIP Calculator
- **Purpose.** Projected value of a monthly SIP, with a yearly step-up, a target mode and three scenario returns (the entered return and two spread rates).
- **Formula.** Instalment at the start of each month: `value = P ((1+i)^n - 1) / i (1+i)`, `i = annual / 12 / 100` (**ToolZen Hub's documented convention**; see 11 for the other published convention and its difference).
- **Not modelled.** Taxes, expense ratios, exit loads, inflation.
- **Verified numerically.** 1,000 a month for 12 months at 12%: 12,809.33 (engine and independent reference agree).
- **Action.** ENHANCE (optional inflation view, pack 48); lumpsum mode (P1).

### 2.8 SWP Calculator
- **Purpose.** How long a corpus lasts, or what a corpus supports, with a yearly withdrawal increase and up to 12 withdrawals a year.
- **Formula.** `i = (1+r)^(1/m) - 1` so the corpus grows by exactly `r` a year whatever `m` is; withdrawal at the start of each period; 50-year horizon; four stated outcomes.
- **Not modelled.** Sequence-of-returns risk, taxes, charges, **inflation**.
- **Action.** ENHANCE (optional today's-money view, pack 48).
- **Note.** SWP uses an *effective* periodic rate while SIP uses annual/12. Both are documented in their own pages; the difference is a deliberate convention, not a defect (11).

### 2.9 FD Calculator
- **Purpose.** Maturity of a fixed deposit for a chosen compounding frequency, with a second option for comparison and the effective annual yield.
- **Formula.** `M = P (1+i)^k (1 + i q / L)`; completed periods compound and a broken period earns simple interest pro rata (**ToolZen Hub's own convention**, stated on the page; banks differ).
- **Action.** KEEP.

### 2.10 CAGR Calculator
- **Purpose.** Growth rate between two values over a period, looking back or ahead, with a second case.
- **Formula.** `g = (E/S)^(1/t) - 1`, `t = months / 12`, money in integer paise, the root taken with a floating-point power (accurate to about 15 digits, checked against a bisection reference).
- **Not done.** Intermediate cash flows (that is XIRR, pack 49).
- **Action.** KEEP.

### 2.11 PPF Calculator
- **Purpose.** Balance after a number of financial years for a yearly or monthly deposit pattern at a **user-entered** rate.
- **Model (V1 assumptions, stated in the engine).** Interest each month on the lowest balance (balance after that month's deposits), at `rate / 12`, summed and added once at the year end. This is "our reading" of the scheme's wording, not an official formula.
- **Interaction.** Explicit; the result is labelled out of date after an edit.
- **Evidence gap.** The official scheme text for the interest rule was not re-read in this phase (**UNKNOWN**); Stage 2 must read it before touching the page.
- **Action.** INTERACTION: pack 47 (engine unchanged).

### 2.12 GST Calculator
- **Purpose.** Add or remove GST on one or more items at a rate the visitor enters; never classifies goods or says an invoice is compliant.
- **Arithmetic.** Integer paise, half up per item, totals are sums of rounded items; `before = round(T x 100 / (100 + rate))` so `before + GST = T` exactly.
- **Action.** KEEP.

### 2.13 Old vs New Tax Regime Calculator
- **Purpose.** Tax under both regimes for tax year 2026-27 (the first under the Income-tax Act, 2025), including an HRA calculation, deductions, rebate and cess.
- **Rules.** One frozen configuration with the source provision named per value (new regime nil to 4,00,000 with 5% to 8,00,000, 10% to 12,00,000, 15% to 16,00,000, 20% to 20,00,000, 25% to 24,00,000, 30% above; rebate caps 60,000 new and 12,500 old; these figures are what the configuration holds, **not re-verified against the primary text in this phase**), `validThrough` 2027-03-31, expiry handling in the page.
- **Maintenance obligation.** A new tax year is a new configuration object, written from the enacted law and verified. **1 April 2027 is the next hard date.**
- **Action.** KEEP; the next change is the annual update, not a feature.

### 2.14 Gratuity Calculator (India) and 2.15 Salary / CTC to In-Hand (India)
- **State.** Built, automatic results, polite live region that never moves focus; Gratuity has a copy-summary control; **both are held back from production by the owner's gate (D4)**.
- **Rules.** Gratuity: Code on Social Security 2020 s.53 and 54, effective 21 November 2025, 15/26 of monthly wages per counted year, rules last checked 2026-10-21. Salary: provident fund 12% of wages, tax through the Income Tax engine, year 2026-27, verified 2026-10-22.
- **Competitor disagreement observed.** Public pages disagree on the wage base and on whether the fixed-term one-year rule is in force (04). That is a reason to keep the existing official-source discipline, not to follow competitors.
- **Action.** KEEP; no change proposed. Annual and rule-change updates only.

### 2.16 Profit Calculator and 2.17 Margin Calculator
- **Profit.** Price, variable cost, fixed costs, units, optional target; contribution, revenue, profit, break-even units `ceil(F / c)`, margin of safety, units for a target.
- **Margin.** Cost with a price, margin or markup basis, optional discount; derived price rounded **up** to the paisa; a cost-change table of -10% to +10%.
- **Overlap result.** Break-even, markup and contribution margin candidates are already covered by these two tools (06).
- **Action.** KEEP.

### 2.18 Percentage Calculator
- **Purpose.** Solve any one of start, percentage change and end; an optional second change shows why changes do not add; the change that undoes a change.
- **Arithmetic.** BigInt numerators and denominators, rounding only for display, half up away from zero, never "-0.00".
- **Action.** KEEP; a discount and stacked-discount mode is P1.

## 3. Cross-cutting findings

| ID | Finding | Evidence | Consequence |
|---|---|---|---|
| X1 | Three calculators still require Calculate although rule 7.9 prefers automatic results | source wiring | 03 and packs 45, 47 |
| X2 | The only "copy a summary" control is in Gratuity | search of modules | shared helper is P1 (E8) |
| X3 | Only Loan Comparison loads third-party scripts | search of modules | pack 46 |
| X4 | Reciprocal related-tool curation is missing for six tools | catalog | pack 50 |
| X5 | The two investment engines use different documented rate conventions | headers | state both clearly; never silently unify (11) |
| X6 | Tax and pay calculators have dated configuration and expiry handling; the next expiry is 2027-03-31 | config | maintenance requirement NFR-REG-001 |
