# 09. Articles and content strategy

Scope: the 34 published articles (the catalog also holds 6 `coming-soon` entries with no page: ids 7 to 12). **This phase audited article metadata, routes and links. Article body text, accuracy and rule currency were NOT reviewed**, so "content quality" and "accuracy" are marked NOT REVIEWED rather than assumed good. Owner standards live in `docs/content-clusters.md` and rulebook 6.

## Facts (verified from `articles.js` and the URL inventory)

- 34 published: loans 13, investment 10, business 6, tax 2, math 3. Every article names at least one tool; the first is the primary tool shown as the call to action.
- Tool coverage: Loan Comparison 6, Prepayment 4 (one shared with Loan Comparison and one with Balance Transfer), Balance Transfer 2, Home Loan 3, SIP 4, FD 2, CAGR 2, SWP 2, Margin 3, Profit 3, GST 2, Percentage 3.
- **Published tools with no article: 24 of 36.** Calculators without articles: EMI, Credit Card Payoff, PPF, Income Tax, Gratuity, Salary / CTC to In-Hand. All 21 non-calculator tools (Time, Developer, Image, PDF) have none.
- Articles with no hero image: 5 (ids 6, 36, 37, 38, 40). `docs/design-follow-ups.md` records only id 6, so the record is behind the data. Six articles use hotlinked Unsplash card images (third-party dependency, recorded in the same follow-up).
- Updated dates range from Aug 25 to Oct 8, 2026. All 34 answer 200 on both preview and production.
- Rule-dependent topics (GST rates, income tax, PPF, gratuity) need dated sources under rulebook 3.6. The GST and FD articles were not re-checked for currency.

## Published article inventory

| ID | Title | Route | Category | Primary tool | Hero image | Related articles | Updated | Preview / Production |
|---|---|---|---|---|---|---|---|---|
| 1 | How to Reduce Your Home Loan Interest | `/articles/loan-comparison/how-to-reduce-home-loan-interest/` | loans | `loan-comparison` | yes | 5 | Aug 25, 2026 | 200 / 200 |
| 2 | EMI vs Total Interest: What Should You Compare? | `/articles/loan-comparison/emi-vs-total-interest/` | loans | `loan-comparison` | yes | 5 | Aug 25, 2026 | 200 / 200 |
| 3 | Fixed vs Floating Interest Rates | `/articles/loan-comparison/fixed-vs-floating-interest-rates/` | loans | `loan-comparison` | yes | 5 | Aug 25, 2026 | 200 / 200 |
| 4 | How Loan Tenure Affects Total Interest | `/articles/loan-comparison/loan-tenure-total-interest/` | loans | `loan-comparison` | yes | 5 | Aug 25, 2026 | 200 / 200 |
| 5 | What Is Loan Prepayment? | `/articles/loan-comparison/what-is-loan-prepayment/` | loans | `prepayment` | yes | 5 | Aug 25, 2026 | 200 / 200 |
| 6 | How to Choose the Right Loan Tenure | `/articles/loan-comparison/choose-right-loan-tenure/` | loans | `loan-comparison` | **no** | 5 | Aug 25, 2026 | 200 / 200 |
| 13 | Reduce Tenure or Lower the EMI After Prepaying: Which Saves More? | `/articles/loan-prepayment/reduce-tenure-or-lower-emi-after-prepayment/` | loans | `prepayment` | yes | 3 | Oct 3, 2026 | 200 / 200 |
| 14 | Why When You Prepay Matters: Early vs Late Prepayment | `/articles/loan-prepayment/early-vs-late-loan-prepayment/` | loans | `prepayment` | yes | 3 | Oct 3, 2026 | 200 / 200 |
| 15 | Is a Loan Balance Transfer Worth It? Use Break-Even to Decide | `/articles/balance-transfer/is-a-loan-balance-transfer-worth-it/` | loans | `balance-transfer` | yes | 3 | Oct 3, 2026 | 200 / 200 |
| 16 | Loan Balance Transfer vs Prepayment: Which Saves More? | `/articles/balance-transfer/balance-transfer-vs-prepayment/` | loans | `balance-transfer` | yes | 3 | Oct 3, 2026 | 200 / 200 |
| 17 | How a SIP Grows: Your Investment vs Estimated Growth | `/articles/sip/how-a-sip-grows/` | investment | `sip` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 18 | How Return Assumptions Change a SIP Projection | `/articles/sip/how-return-assumptions-change-a-sip-projection/` | investment | `sip` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 19 | Step-Up SIP: What Increasing Your SIP Each Year Changes | `/articles/sip/step-up-sip-explained/` | investment | `sip` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 20 | How Much SIP Do You Need for a Goal? | `/articles/sip/how-much-sip-do-you-need-for-a-goal/` | investment | `sip` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 21 | Margin vs Markup: Why They Are Not the Same | `/articles/margin/margin-vs-markup/` | business | `margin` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 22 | How to Price a Product for a Target Margin | `/articles/margin/price-a-product-for-a-target-margin/` | business | `margin` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 23 | What a Discount Really Costs You | `/articles/margin/what-a-discount-really-costs-you/` | business | `margin` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 24 | How to Find Your Break-Even Point | `/articles/profit/how-to-find-your-break-even-point/` | business | `profit` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 25 | Price, Cost or Volume: Which Matters Most? | `/articles/profit/price-cost-or-volume-which-matters-most/` | business | `profit` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 26 | How Many Units Do You Need for a Target Profit? | `/articles/profit/units-needed-for-a-target-profit/` | business | `profit` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 27 | How Much Home Loan Fits Your EMI Budget? | `/articles/home-loan/how-much-home-loan-fits-your-emi-budget/` | loans | `home-loan` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 28 | Longer Tenure, Bigger Loan, Much More Interest | `/articles/home-loan/longer-tenure-bigger-loan-much-more-interest/` | loans | `home-loan` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 29 | How Interest Rates Change the Home Loan You Can Borrow | `/articles/home-loan/how-interest-rates-change-the-home-loan-you-can-borrow/` | loans | `home-loan` | yes | 3 | Oct 4, 2026 | 200 / 200 |
| 30 | How Much Does Compounding Frequency Change an FD's Maturity? | `/articles/fd/how-compounding-frequency-changes-an-fd-maturity/` | investment | `fd` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 31 | Comparing Two Fixed Deposits: A Higher Rate Is Not the Whole Comparison | `/articles/fd/comparing-two-fixed-deposits-higher-rate-is-not-the-whole-comparison/` | investment | `fd` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 32 | Adding and Removing GST: Why the Tax Is Not the Same Share Both Ways | `/articles/gst/adding-and-removing-gst-why-the-tax-is-not-the-same-share-both-ways/` | tax | `gst` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 33 | GST on a Mixed Invoice: How the Tax Adds Up Across Rates | `/articles/gst/gst-on-a-mixed-invoice-how-the-tax-adds-up-across-rates/` | tax | `gst` | yes | 2 | Oct 4, 2026 | 200 / 200 |
| 34 | CAGR vs Simple Average Growth: Why 80% Growth Over 5 Years Is Not 16% CAGR | `/articles/cagr/cagr-vs-simple-average-growth-why-80-percent-over-5-years-is-not-16-percent-cagr/` | investment | `cagr` | yes | 2 | Oct 5, 2026 | 200 / 200 |
| 35 | Comparing Two Investments Over Different Periods: A Bigger Gain Is Not a Higher Yearly Rate | `/articles/cagr/comparing-two-investments-over-different-periods-a-bigger-gain-is-not-a-higher-yearly-rate/` | investment | `cagr` | yes | 2 | Oct 5, 2026 | 200 / 200 |
| 36 | Why +20% Then −20% Doesn't Get You Back | `/articles/percentage/why-a-20-percent-rise-then-a-20-percent-fall-does-not-get-you-back/` | math | `percentage` | **no** | 2 | Oct 5, 2026 | 200 / 200 |
| 37 | How to Find the Original Price Before a Percentage Change | `/articles/percentage/how-to-find-the-original-price-before-a-percentage-change/` | math | `percentage` | **no** | 2 | Oct 5, 2026 | 200 / 200 |
| 38 | Percent vs Percentage Points | `/articles/percentage/percent-vs-percentage-points/` | math | `percentage` | **no** | 2 | Oct 5, 2026 | 200 / 200 |
| 39 | How a Systematic Withdrawal Plan Works: Withdrawals, Growth and the Balance Left | `/articles/swp/how-a-systematic-withdrawal-plan-works/` | investment | `swp` | yes | 2 | Oct 8, 2026 | 200 / 200 |
| 40 | What Changes How Long a Corpus Lasts: Return, Withdrawal and Yearly Increase | `/articles/swp/what-changes-how-long-a-corpus-lasts/` | investment | `swp` | **no** | 2 | Oct 8, 2026 | 200 / 200 |

`ID`s 1 to 6 and 13 to 40 are published; the table lists all 34.

## Article to tool relationship

| Observation | Evidence | Verdict |
|---|---|---|
| Loan, SIP, margin and profit clusters are dense (3 to 6 articles per tool); other tools have none | counts above | Dense clusters are fine only if each answers a distinct question (rulebook 6.1). Overlap was **not** assessed here; the six Loan Comparison articles (ids 1 to 6) are the first place to check for duplicated intent |
| `emi-vs-total-interest` and `choose-right-loan-tenure` sit under Loan Comparison while EMI has no article | table | Possible mismatch of primary tool; check which tool serves the reader |
| Non-calculator tools never show related articles | N1 in 08 | No article would be displayed even if one existed, until N1 |

## Content opportunities (proposals; demand is hypothesis)

| Tool | Candidate guide | Class (A essential, B decision, C worked example, D troubleshooting, E reference, F not worth publishing) | Why it is not answerable on the tool page | Blocker |
|---|---|---|---|---|
| Credit Card Payoff | What the minimum payment actually costs | C | A worked example of balance, rate and time, which the tool computes but does not narrate | None |
| EMI | How EMI is calculated, with one worked loan | A | Formula and sensitivity to rate and tenure | May overlap Loan Comparison articles 2 and 4: check first |
| Income Tax, PPF, Gratuity, Salary | Regime comparison; PPF rules; gratuity eligibility; CTC components | A or B | Real questions, but rule-dependent | **BLOCKED** until dated authoritative sources are verified (rulebook 3.6, 8) |
| JWT Decoder | Reading `exp`, `iat` and `nbf` correctly; seconds versus milliseconds | D | A common mistake the tool exposes | Demand unknown |
| Cron Explainer | Why a cron job runs at the wrong time (time zones, day-of-month and day-of-week semantics) | D | Needs a worked comparison | Demand unknown |
| Time Zone Converter | Daylight-saving gaps and overlaps explained | D or E | The converter shows the result; the cause needs prose | Demand unknown |
| Merge, Split, Pages | What a merged PDF keeps and loses (bookmarks, forms, signatures) | E | Honest limits from the spike, in one place | Must repeat only what spec 33 verified |
| Image Compressor | Why a compressed image can stay large | D | Format and dimension effects | Demand unknown |
| Any other tool | none proposed | F for now | Self-explanatory tools should not get padding articles | |

Rule: no required article count, no articles for keyword variants, no articles written in this phase.

## Findings

| ID | Current problem | Recommendation | Priority | Approval |
|---|---|---|---|---|
| A1 | 24 of 36 tools have no guide, and non-calculator tools could not display one | Do N1 first; then write only guides that pass the rulebook 6.1 test | Medium | Owner |
| A2 | Image debt: 5 articles without hero, 6 Unsplash cards | Follow `docs/design-follow-ups.md`; update that record (ids 36, 37, 38, 40 are missing from it) | Low | Owner |
| A3 | Content quality, accuracy, overlap and review dates are unaudited | A dedicated read-through of the 34 article bodies, starting with rule-dependent ones (GST, FD) | Medium | Owner |
