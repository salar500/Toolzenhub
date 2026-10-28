# 04. Competitor research

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. No proprietary design or text was copied.

## 1. Method and its limits

All research was done on **2026-10-28** with a text fetcher that returns the page text, and one web search per topic. **Nothing was TESTED:** the fetcher does not run a page's JavaScript or click controls, so no competitor calculator was exercised, and interactive behaviour (live versus button, validation messages, mobile layout, accessibility) is mostly **UNKNOWN** unless a page states it. Labels used:

- **OBSERVED:** visible in the fetched page text.
- **CLAIMED:** a statement a site makes (for example a worked example) that I did not exercise; where I could recompute it independently, the recomputation is stated.
- **INFERRED:** a reasoned reading of OBSERVED text.
- **UNKNOWN:** not determinable from what was reached.
- **TESTED:** not used (see above).

## 2. What was reached and what was not

| Source | URL | Result |
|---|---|---|
| Calculator.net, Loan | https://www.calculator.net/loan-calculator.html | reached |
| Calculator.net, Retirement | https://www.calculator.net/retirement-calculator.html | reached |
| Groww, SIP | https://groww.in/calculators/sip-calculator | reached |
| Groww, XIRR | https://groww.in/calculators/xirr-calculator | reached |
| Groww, RD | https://groww.in/calculators/rd-calculator | reached |
| Omni, EMI | https://www.omnicalculator.com/finance/emi | reached |
| Web search, income-tax calculators FY 2026-27 | search snippets only | third-party calculator pages, not ClearTax |
| Web search, gratuity calculators | search snippets only | third-party articles |
| Web search, RD formula | search snippets only | bank and finance blogs, Wikipedia |
| ClearTax income-tax calculator | https://cleartax.in/s/income-tax-calculator | **HTTP 404, UNKNOWN** |
| Bankrate mortgage calculator | https://www.bankrate.com/mortgages/mortgage-calculator/ | **HTTP 405, UNKNOWN** |
| HDFC Bank EMI calculator | https://www.hdfcbank.com/personal/tools-and-calculators/emi-calculator | **timed out, UNKNOWN** |
| NerdWallet, ET Money, Paisabazaar, Policybazaar, SBI, ICICI | not attempted | **UNKNOWN** (the research was bounded; this is a stated gap, not a finding) |
| Google Trends | https://trends.google.com/trends/explore | **HTTP 429**, not retried (05) |

## 3. Observations by tool

### EMI and loans
- **Omni EMI** (OBSERVED): inputs principal, term, annual rate; outputs EMI, total payable, total interest with a split; **updates automatically, no calculate button** ("As soon as any of the values are changed..."); can solve for any one of the three inputs given a target EMI; "Reload" and "Clear all changes"; a Share-result option; **no amortization schedule and no side-by-side comparison**; states the standard reducing-balance formula and an example of 1,00,00,000 at 10% for 10 years giving 1,32,150.74. **CLAIMED, then recomputed independently: 1,32,150.74 is correct** (11).
- **Calculator.net Loan** (OBSERVED): amortized loan, deferred-payment loan and bond modes; compounding and pay-back frequency choices; a "View Amortization Table" link; a principal/interest split chart; **no comparison features visible**; explains APR versus APY; a mention of clicking a calculate button is in the page text (whether the button exists is UNKNOWN). Default values: not stated in the text.
- **Implication (INFERRED):** a schedule, a solve-for mode and automatic updating are expected features of a competent EMI page; no page reached connects the EMI result to a prepayment or a comparison. ToolZen Hub already has both of those tools.

### Investment
- **Groww SIP** (OBSERVED): SIP and Lumpsum switch; monthly amount, expected return, period; outputs invested, estimated returns, total value; **no step-up or goal mode visible**; an "Invest now" button. The guide gives `M = P x ((1+i)^n - 1) / i x (1+i)` and says to convert the annual rate to a monthly rate by `(1 + annual)^(1/12) - 1` and not by dividing by 12; its example of 1,000 a month for 12 months at 12% gives about 12,766. **CLAIMED, then recomputed: 12,766.50 under the effective-monthly convention; ToolZen Hub's documented annual/12 convention gives 12,809.33** (0.34% higher). Both are defensible; the difference must be stated, never hidden (11). Disclaimers: returns are estimates, no exit load or expense ratio.
- **Groww XIRR** (OBSERVED): investment frequency (14 days, monthly, quarterly, half-yearly, yearly), start and maturity dates, a recurring amount and a total maturity amount; output "Your XIRR". **No list of arbitrary dated cash flows is visible in the text** (INFERRED limitation: the UI may expose more than the text shows). No day-count convention or formula is stated; no validation or error messages are visible. This is the observed opening for an XIRR tool that takes irregular dated flows and states its convention.
- **Groww RD** (OBSERVED): monthly amount, rate, years; states quarterly compounding and `A = P (1 + R/N)^(Nt)` applied to each instalment and summed; notes TDS is not included. **CLAIMED worked example of 5,000 a month for one year is stated at 8% but reproduces only at 8.25%** (recomputed: 62,730.85 at 8.25%, 62,646.63 at 8%). An internal inconsistency on a competitor's own page, OBSERVED and independently recomputed.
- **Calculator.net Retirement** (OBSERVED): four sub-calculators (how much to retire, how to save, how much can be withdrawn, how long money lasts); user-entered return and inflation; no stated defaults; an advice-adjacent tone moderated by "talk to licensed professionals".

### Tax and pay (search snippets only)
- The third-party income-tax calculator pages returned by the search **disagree with each other** on the FY 2026-27 new-regime slab table and on the rebate (one set matches the figures in ToolZen Hub's configuration: nil to 4,00,000 and a rebate cap of 60,000 for the new regime; another set shows an older schedule; one shows a 25,000 rebate at 7,00,000). This is CLAIMED by third parties and **not** a verification of any figure; it is evidence that competitors cannot be used as the correctness reference for statutory calculators.
- Gratuity pages disagree on the wage base and on whether the fixed-term one-year rule applies; a worked example on one page is inconsistent with its own formula (the search summary recomputed 15/26 x 30,000 = 17,308). CLAIMED.

## 4. Comparison of the dimensions the brief asks for

| Dimension | Observed in what was reached | ToolZen Hub today | Opportunity |
|---|---|---|---|
| Live versus button | Omni EMI live; others UNKNOWN | 14 of 18 live | make EMI, PPF and Loan Comparison live (03) |
| Schedules | Calculator.net has an amortization table; Omni EMI none | EMI none; Prepayment, Loan Comparison, PPF, SIP, SWP have schedules | EMI schedule |
| Solve-for-any-variable | Omni EMI | EMI no; SIP target, SWP modes, Percentage yes | EMI tenure and rate modes |
| Comparisons | none seen on the pages reached | Loan Comparison, Balance Transfer, FD two options, CAGR two cases | already stronger |
| Formula explanation | stated by Omni, Groww; conventions sometimes differ | each page states its convention | keep; state convention differences |
| Hand-off to a related tool | none seen | curated for 4 tools only | pack 50 |
| Trust language | Groww disclaims estimates; Calculator.net notes limits | wording prohibits "best", "safe", "guaranteed" (rulebook 3) | keep |
| Accessibility and mobile of competitors | UNKNOWN | not exercised here either | Stage 3 measures ToolZen Hub only |

## 5. What this research does and does not support

- **Supports:** an EMI schedule and solve-for modes are expected features; the XIRR irregular-flow gap on one major Indian page; the risk that RD and SIP conventions differ between sites; the unreliability of competitor statutory figures.
- **Does not support:** any claim that ToolZen Hub is better than a competitor, any claim about competitor mobile or accessibility quality, or any demand figure.
- **Differentiation statements** in 07 are therefore limited to "does something the pages reached did not show" and are labelled hypothesis where they depend on UI behaviour that could not be seen.
