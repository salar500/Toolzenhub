# 05. User demand and search research

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

## 1. The honest summary

**No measured demand figure for any calculator exists in this package.** Every Search and Repeat score in 07 is a HYPOTHESIS. The reasons, all VERIFIED this session:

| Source | What was possible | Result |
|---|---|---|
| Google Trends | one attempt, India, 12 months, "emi calculator, sip calculator, xirr calculator" | HTTP 429 (rate limited). **Not retried**, as instructed. UNKNOWN. |
| Search Console | the only recorded figures are in the 2026-10-12 handoff: about 49 clicks and 1,500 impressions over three months, mostly the queries "toolzen" and "toolzen login" (some possibly the owner's own searches); on 2026-10-09 the owner requested indexing of `/calculators/emi/`, `/loan-comparison/`, `/percentage/`, `/credit-card-payoff/` and the JSON Formatter; the result is not recorded | **VERIFIED data, but brand-only**: it says nothing about non-brand calculator demand |
| Keyword tool | none available | UNKNOWN |
| Analytics (GA4, consent-based) | no export in the repository | UNKNOWN |
| Competitor evidence | 04 | PUBLIC; shows what competitors offer, not what people search |

Nothing in this document is a search volume, a ranking, a traffic projection or a retention rate.

## 2. User problems (reasoned from the catalog and the competitor pages; HYPOTHESIS)

India-specific:
- **Loan sizing and repayment.** Home, personal, car and education loans are the everyday large decisions; the calculators needed are EMI, a schedule, prepayment and comparison. ToolZen Hub already has the last three; EMI lacks a schedule and tenure/rate solving.
- **Saving and investing by instalment.** SIP, SWP, FD, PPF are the instruments the catalog already covers. Missing from the catalog are RD (a bank product with quarterly-compounding conventions) and XIRR (irregular dated flows, used to compare a real portfolio's return).
- **Tax and pay.** Seasonal pressure around the financial year-end (tax-saving decisions) and at appraisal time (CTC to in-hand). These are rule-bound (Class C) and already built.
- **Small-business arithmetic.** GST, margin and profit.

Worldwide, where it differs: unit conversion and general-purpose interest calculators attract broad generic intent, but search engines answer many of them inline, which lowers the value of a standalone page (rulebook 1.4).

## 3. Search-intent notes (HYPOTHESIS, no volumes)

- "EMI calculator", "loan calculator" style queries are generic and head-term; the page must win on being immediately useful (live result, schedule).
- "<product> loan EMI" (personal, car, education) are long-tail variants of the same job. Rulebook 1.6 and 5.2 say not to create near-duplicate routes; the answer is aliases and starting values on the EMI page, not new URLs.
- "XIRR calculator", "RD calculator", "lumpsum calculator", "inflation calculator", "weighted average calculator" each have clear intent; none can be sized here.
- **Seasonality (HYPOTHESIS):** income-tax and HRA intent clusters toward the end of the financial year and at declaration time; the existing tax tools carry the maintenance obligation of an annual rule update, which is when demand is likely highest.

## 4. Repeat-use hypotheses

Highest plausible repeat use: tools used with changing inputs (loan comparison with a new offer, SIP planning, a portfolio's XIRR when new flows are added, a rate comparison). Lowest: one-shot arithmetic (a single percentage). These are reasons for the Repeat scores, not data.

## 5. How the hypotheses will be tested

1. After the first release of each P0 item, read **non-brand** Search Console queries for the changed pages (separating branded from non-branded queries, rulebook 12.6).
2. Read consent-based GA4 events for use of the new controls, knowing it may undercount (rulebook 12.6).
3. Record any later-verified figure in the form rulebook 12.4 requires: source, date, geography, keyword, range, intent, interpretation of competition, confidence, limits.

## 6. Confidence

| Claim | Confidence |
|---|---|
| Brand-only Search Console data exists | High (VERIFIED, from a dated handoff note) |
| Any statement about demand for a specific calculator | **None; hypothesis** |
| Competitors offer EMI schedules, live updates and solve-for modes | Medium (OBSERVED on pages reached; others UNKNOWN) |
