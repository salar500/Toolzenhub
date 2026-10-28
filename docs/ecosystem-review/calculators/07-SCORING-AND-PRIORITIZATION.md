# 07. Scoring and prioritization

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read, run or observed in this session), **PUBLIC** (a cited public page), **HYPOTHESIS** (reasoned, not measured) and **UNKNOWN**.

## Method

The only scoring model is rulebook section 12: six dimensions scored 0 to 5, weighted Search demand and discoverability 25, Repeat use 25, Practical usefulness 20, Differentiation 10, Implementation and maintenance feasibility 10, Trust, privacy and performance 10, so the total is `sum(weight x score / 5)` out of 100. The weights are decision support, not measurement, and a one-point difference is not treated as superiority.

**Evidence.** There is no non-brand Search Console data (the only recorded figures are about 49 clicks and 1,500 impressions in three months, mostly brand queries), Google Trends returned HTTP 429 on one attempt and was not retried, and no keyword-volume tool was available. **Search and Repeat scores are therefore HYPOTHESIS for every row and were scored conservatively**; nothing below is a demand measurement. Competitor facts are PUBLIC (04).

**Mandatory gates (rule 12), applied to every candidate in 06 before scoring:** meaningful problem; not a duplicate without a real improvement; no unreliable or misleading output; proportionate maintenance; no paid external API; no unacceptable privacy or security risk; acceptable mobile experience; not added only to raise the count. Candidates that fail a gate are in 06 with REJECT, DEFER or EXCLUDED and are not scored.

## Scored candidates

| ID | Candidate | Type | S | R | U | D | F | T | Weighted /100 | Verdict | Priority |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E1 | EMI Calculator 2.0: live results, schedule, solve-for tenure/rate, starting values, copy | ENHANCE existing | 5 | 3 | 4 | 3 | 4 | 4 | 78 | A | P0 |
| E3 | Inflation view (today's money) for SIP and SWP | ENHANCE existing | 3 | 3 | 4 | 3 | 5 | 4 | 70 | A | P0 |
| N4 | Retirement planner (inflation, SIP, SWP combined) | NEW | 3 | 4 | 4 | 3 | 2 | 3 | 67 | B | P1 |
| N6 | Unit Converter (one tool) | NEW | 5 | 2 | 3 | 1 | 4 | 5 | 67 | B | P2 |
| E9 | Percentage: discount and stacked-discount mode | MODE of existing | 4 | 2 | 3 | 2 | 5 | 5 | 66 | B | P1 |
| N1 | XIRR Calculator (dated cash flows) | NEW | 3 | 3 | 4 | 3 | 3 | 4 | 66 | A | P0 |
| N3 | Simple and Compound Interest (solve for any variable) | NEW (replaces coming-soon Interest) | 4 | 2 | 3 | 2 | 5 | 5 | 66 | B | P1 |
| N5 | Average and Weighted Average (grades, portfolios) | NEW | 3 | 3 | 3 | 2 | 5 | 5 | 66 | B | P1 |
| E10 | SIP: lumpsum mode | MODE of existing | 4 | 2 | 3 | 2 | 5 | 4 | 64 | B | P1 |
| N7 | Inflation Calculator (standalone page) | NEW | 4 | 2 | 3 | 2 | 5 | 4 | 64 | C | P2 |
| E2 | Loan Comparison clean-up: remove redundant button, replace third-party PDF scripts | ENHANCE existing | 3 | 3 | 3 | 1 | 4 | 5 | 62 | A | P0 |
| E5 | Calculators related-navigation (reciprocal curated relations) | ENHANCE existing | 2 | 3 | 3 | 2 | 5 | 5 | 61 | A | P0 |
| N2 | Recurring Deposit Calculator | NEW | 4 | 2 | 3 | 2 | 4 | 3 | 60 | B | P1 |
| E7 | Debt snowball versus avalanche (mode of Credit Card Payoff) | MODE of existing | 2 | 3 | 3 | 3 | 4 | 4 | 59 | A | P1 |
| N8 | Freelance Hourly Rate Calculator | NEW | 2 | 2 | 3 | 2 | 4 | 4 | 52 | C | P2 |
| N10 | Standard Deviation Calculator | NEW | 3 | 1 | 3 | 1 | 4 | 5 | 52 | C | P2 |
| N9 | Ratio Calculator | NEW (coming-soon entry) | 3 | 1 | 2 | 1 | 5 | 5 | 50 | C | P2 |
| E4 | PPF Calculator: live results | ENHANCE existing | 2 | 2 | 2 | 1 | 5 | 4 | 48 | B | P0 |
| E8 | Shared copy-summary helper for calculators | ENHANCE existing | 1 | 2 | 3 | 2 | 4 | 4 | 47 | B | P1 |
| E6 | Credit Card Payoff: live results | ENHANCE existing | 2 | 2 | 2 | 1 | 3 | 4 | 44 | B | P1 |

Verdict key (rule 12.7): A approved planning candidate (a planning status only), B needs further validation, C future opportunity, D rejected or unsuitable.

## Reasons behind each score

- **E1 EMI Calculator 2.0: live results, schedule, solve-for tenure/rate, starting values, copy** (78, verdict A, P0): S hypothesis: generic loan queries are the largest family and the owner requested indexing of /emi/ on 2026-10-09 (no non-brand data). D public evidence: Omni solves any of three variables, Calculator.net has a schedule; neither links onward to prepayment or comparison.
- **E2 Loan Comparison clean-up: remove redundant button, replace third-party PDF scripts** (62, verdict A, P0): T verified: the PDF path loads jsPDF, autotable and a font from public CDNs at click time with no integrity check, the font from an unpinned branch.
- **E3 Inflation view (today's money) for SIP and SWP** (70, verdict A, P0): U verified: SWP's own header says inflation is not modelled. Closed form real = nominal / (1+f)^years, checked: 1,00,00,000 at 6% for 20 years is 31,18,047.27.
- **E4 PPF Calculator: live results** (48, verdict B, P0): Owner-requested review of Calculate buttons; rule 7.9 prefers automatic results. Small value, small risk.
- **E5 Calculators related-navigation (reciprocal curated relations)** (61, verdict A, P0): Verified in the catalog: SWP lists SIP but SIP lists nothing; CAGR and FD list nothing; EMI and Loan Comparison list nothing.
- **E6 Credit Card Payoff: live results** (44, verdict B, P1): Explicit Calculate with a stale label by design (spec 24); an exact BigInt engine and its tests must not change.
- **E7 Debt snowball versus avalanche (mode of Credit Card Payoff)** (59, verdict A, P1): Reuses the earlier matrix row 5 (59).
- **E8 Shared copy-summary helper for calculators** (47, verdict B, P1): Only Gratuity has a copy button (verified by search of the modules).
- **E9 Percentage: discount and stacked-discount mode** (66, verdict B, P1): S hypothesis. Percentage already has combined change, so most of the maths exists.
- **E10 SIP: lumpsum mode** (64, verdict B, P1): Groww's page offers a SIP/Lumpsum switch (observed). FV = P(1+i)^n.
- **N1 XIRR Calculator (dated cash flows)** (66, verdict A, P0): D observed: Groww's XIRR page takes a recurring schedule (frequency, dates, amount), not arbitrary dated flows (page text only). Excel's XIRR is the reference. S and R hypothesis.
- **N2 Recurring Deposit Calculator** (60, verdict B, P1): T lowered: public sources disagree on the convention; Groww's worked example states 8% but reproduces only at 8.25% (independently recomputed: 62,730.85).
- **N3 Simple and Compound Interest (solve for any variable)** (66, verdict B, P1): Closed forms, no maintenance; the duplicate gate against FD is passed only by the solve-for-any-variable design.
- **N4 Retirement planner (inflation, SIP, SWP combined)** (67, verdict B, P1): Calculator.net has a four-part retirement tool (observed). Assumption-heavy and close to advice.
- **N5 Average and Weighted Average (grades, portfolios)** (66, verdict B, P1): Exact arithmetic; repeat use plausible for students.
- **N6 Unit Converter (one tool)** (67, verdict B, P2): Search engines answer unit conversions inline (rule 1.4); differentiation is weak. Needs a section decision.
- **N7 Inflation Calculator (standalone page)** (64, verdict C, P2): Only with user-entered rates: historical CPI would need external data (Class D).
- **N8 Freelance Hourly Rate Calculator** (52, verdict C, P2): Hypothesis only.
- **N9 Ratio Calculator** (50, verdict C, P2): Hypothesis only.
- **N10 Standard Deviation Calculator** (52, verdict C, P2): Hypothesis only.

## How the ranking was read

- **Ranking is not the recommendation.** The EMI work scores highest (78) and the Inflation view next (70); the rest of the P0 list is chosen for correctness and trust reasons as much as score: E2 is a security and privacy repair, E4 is the owner's requested Calculate-button review at low cost, E5 is catalog data.
- **XIRR (66)** is a P0 new tool despite a middle score because it is the only new candidate that passes the duplicate gate cleanly (dated, irregular flows are not served by CAGR or SIP), its mathematics is stable (Class B), and no competitor page seen takes arbitrary dated flows. **Its search and repeat scores are hypotheses**; the first non-brand Search Console data after release is the place to test them.
- **Unit Converter (67) and Retirement planner (67)** score at least as high as XIRR but are not P0: the first has weak differentiation and needs a section decision, the second is assumption-heavy and needs a feasibility audit. A near tie is not an instruction to build.
- **Recurring Deposit (60)** is held at P1 because its main risk is trust: the convention differs between public sources and a bank's own calculator may differ from all of them. It becomes P0-eligible once one named bank's published terms and worked example are verified.
- **Previously deferred candidates** (RD, Inflation, XIRR, Age, ROI, Loan Eligibility, Personal Loan, Interest, Ratio) were re-evaluated and none overrides a binding exclusion. Only Currency is a binding exclusion, and it is preserved.
