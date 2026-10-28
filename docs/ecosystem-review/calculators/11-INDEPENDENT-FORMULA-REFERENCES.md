# 11. Independent formula references

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

## 1. How the references were made

`formula-reference-check.py` (same folder) uses only the Python standard library and 50-digit `Decimal` arithmetic, written from the textbook definitions, **without reading the engines' arithmetic**. Existing JavaScript engines were separately compared for EMI, the schedule and SIP (agreement to the paisa). It was run on 2026-10-28; its output is reproduced below. Everything else is **not independently verified in this phase**: rely on each engine's existing golden test.

## 2. References and outputs

| Ref | Definition | Output of the script |
|---|---|---|
| F-EMI | `E = P r (1+r)^n / ((1+r)^n - 1)`, `r = annual/1200`, `r=0` gives `P/n` | 10,00,000 at 8.5%, 20 y: 8,678.23; total interest 10,82,775.76. 1,00,00,000 at 10%, 10 y: 1,32,150.74 |
| F-AMORT | monthly interest on opening balance | month 1: interest 7,083.33, principal 1,594.90; balance after 12: 9,80,097.71; final balance 0 |
| F-EMI-N | months to clear from `-ln(1 - P r/E)/ln(1+r)` (oracle only; the product steps month by month) | 10,00,000 at 9%, EMI 15,000: 92.77 months (93 payments) |
| F-EMI-R | rate by bisection on the monthly rate | 10,00,000, 240 months, EMI 9,000: 9.004261% |
| F-SIP-CONV | start-of-month instalments; two conventions | 1,000 x 12 at 12%: annual/12 12,809.33; effective monthly 12,766.50; 5,000 x 120: 11,61,695.38 |
| F-INF | `real = nominal / (1+f)^years`; `after-inflation return = (1+r)/(1+f)-1` | 1,00,00,000, 20 y, 6%: 31,18,047.27; 1,00,000 in year 20 at 6%: 33,051.30; 12% and 6%: 5.6604% |
| F-XIRR | `sum A_i (1+r)^(-days_i/365) = 0` by bisection | reference example: 14.394394%; two flows 1,827 days: 14.852405% (equals `2^(365/1827)-1`); two-root flows on days 0, 365, 730: NPV 0.00 at 10% and at 20% |
| F-PPF | not independently derived | UNKNOWN; official scheme text not read (FR-PPF-006) |
| other | RD 5,000 x 24 at 6.5%: 1,28,425.30; compound 1,00,000 at 8%, 5 y quarterly: 1,48,594.74; simple: 1,40,000.00 | for P1 candidates only |

## 3. Conventions, assumptions and where sources disagree

- **SIP rate:** annual/12 (ToolZen Hub, stated) versus effective monthly (Groww's guide). The page must state which is used and, where useful, that the other convention gives a result about 0.34% lower in the example. The engine is **not** changed by this package.
- **XIRR:** Actual/365 matches Excel and LibreOffice; other day counts exist; the page states its choice.
- **Possible multiple rates:** XIRR can have more than one root; the specified behaviour is to say so and show the root nearest zero.
- **RD:** public sources use different conventions; not in P0.
- **Statutory figures:** not derived here; tax, gratuity and salary rules are unchanged and dated in their own configuration files.

## 4. Limitations

Floating-point JavaScript will differ from `Decimal` in the last digits; tests must compare to a stated tolerance (for example 1e-9 relative for rates, exact paise for money after rounding). The script has no check against any spreadsheet or published table; an Excel/LibreOffice XIRR comparison is **not done** and is a Stage 2 task.
