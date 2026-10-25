# 03. Calculators ecosystem

Scope: the 18 published calculators (loans 6, investment 5, tax 4, business 2, math 1) and 11 coming-soon entries (not built). Rulebook anchors: sections 1, 3.5 to 3.7, 4, 6.3, 8 and 12. All demand statements are **hypothesis** unless stated; no search or usage data is in the repository.

## Built nodes and how they are connected today

| Category | Tools | Curated `relatedTools` (catalog) | Articles (primary tool) |
|---|---|---|---|
| Loans | EMI, Loan Comparison, Home Loan, Loan Prepayment, Loan Balance Transfer, Credit Card Payoff | Prepayment: EMI, Loan Comparison, Balance Transfer. Balance Transfer: Prepayment, EMI, Loan Comparison. Credit Card Payoff: Balance Transfer, Prepayment, EMI. EMI, Loan Comparison, Home Loan: none (category fallback) | Loan Comparison 6, Prepayment 4 (one shared), Balance Transfer 2, Home Loan 3, EMI 0, Credit Card Payoff 0 |
| Investment | SIP, SWP, FD, CAGR, PPF | SWP: SIP. Others none (fallback) | SIP 4, FD 2, CAGR 2, SWP 2, PPF 0 |
| Tax and pay | GST, Income Tax, Gratuity, Salary / CTC to In-Hand | GST: Margin, Profit. Income Tax: Home Loan. Gratuity: Income Tax. Salary: Income Tax | GST 2, others 0 |
| Business | Profit, Margin | none (fallback) | Profit 3, Margin 3 |
| Math | Percentage | GST, Margin | Percentage 3 |

Calculator pages do render related-tools and related-article sections (only non-calculator tools suppress them). How the fallback lists look on a real page was not inspected: **NOT VERIFIED**.

## Users and jobs (reasoned, not measured)

Individuals deciding about a loan, a savings or investment plan, tax or pay; small sellers pricing goods; students and everyday users doing percentages. The jobs are decisions with a number attached, which is why the rulebook treats correctness and honest framing as mandatory (3.5 to 3.7, 8).

## Journeys

| Journey | Built nodes | Missing or proposed nodes | Reused inputs | Existing links | Class |
|---|---|---|---|---|---|
| Choose and test a loan: EMI, Loan Comparison, Home Loan | EMI, Loan Comparison, Home Loan | none needed | amount, rate, tenure | Fallback only; Home Loan articles 27 to 29 and Loan Comparison articles 1 to 6 explain the trade-offs | PARTIAL |
| Pay a loan down: Prepayment, Balance Transfer, Credit Card Payoff | all three | none | balance, rate, EMI | Curated in the catalog (Prepayment and Balance Transfer reciprocal; Credit Card Payoff points to both); guides 13 to 16 cover the decisions | EXISTING (strongest cluster) |
| Save and draw down: SIP, SWP, FD, CAGR, PPF | all five | Lumpsum/RD/XIRR are not roadmap items | corpus, rate, years | SWP points to SIP only; SIP points to nothing; articles 17 to 20 (SIP), 39 to 40 (SWP) | PARTIAL: a SIP-then-SWP story exists in data in one direction only |
| Compare two investments: CAGR, FD | CAGR, FD | none | start, end, years | Guides 31 and 34 to 35 teach the comparison, but the tools are not curated to each other | PARTIAL |
| Pay and benefits: Salary, Income Tax, Gratuity | all three | none | salary, regime | Curated: Salary to Income Tax; Gratuity to Income Tax; no Salary to Gratuity link | PARTIAL |
| Price and profit: Margin, Profit, Percentage, GST | all four | none | cost, price, rate | GST to Margin and Profit; Percentage to GST and Margin; guides 21 to 26 | EXISTING |
| GST then Income Tax | | | | Not related: different jobs. **Do not force a link** | NOT A JOURNEY |

## Findings (each is a proposal until approved)

| ID | Current problem | Evidence | User impact | Recommendation | Scope | Risk | Priority | Approval | Acceptance |
|---|---|---|---|---|---|---|---|---|---|
| C1 | The SIP, SWP and CAGR/FD stories are linked in one direction or not at all in the catalog | `tools.js` curated lists above | A reader of the SIP guide cannot reach the SWP calculator from the SIP page by a curated link | IMPROVE RELATED NAVIGATION: add curated reciprocal relations (SIP and SWP; CAGR and FD) | Catalog data only; relations test update | Low | High value, low cost | Owner approval for a Phase A change | Each pair shows the other in the related list; relationships tests updated; no cross-section link |
| C2 | EMI, Credit Card Payoff, PPF, Income Tax, Gratuity and Salary have no explanatory guide | article table in 09 | Users who do not understand an output have no page to read | CREATE NEW GUIDE only where an independent question exists (see 09); rule-dependent topics are BLOCKED until a dated source is verified | Content | Medium for tax and PPF (rule currency) | Medium | Per guide | Rulebook 6.1 test: distinct question, real numbers or dated facts |
| C3 | Gratuity and Salary are built and on the preview but not releasable | specs 29 and 30 | None until release; risk is an accidental upload | Keep the release gate explicit; see D4 in 14 | Process | Medium | High (risk control) | Owner | Written gate before any production upload |
| C4 | Eleven coming-soon calculators exist as catalog entries | `tools.js` | None on a live page | KEEP DEFERRED; do not promote | none | n/a | n/a | n/a | n/a |

## Entries that should stay empty

Health (BMI, BMR, Calorie), Currency and Unit Converter stay excluded under R1 until the factory records a different decision. Loan Eligibility, Personal Loan, Interest and ROI are variants of existing tools or failed a gate per the factory; this review does not reopen them.

## Retention and advantage

Hypothesis: calculators used repeatedly are those with changing inputs (loan comparison with new offers, SIP planning). No retention data exists. Browser-local exact calculation and visible assumptions are real, checkable strengths (golden-file tests exist for many engines: `emi-golden`, `fd-golden`, `gst-golden`, `income-tax-golden`, others).
