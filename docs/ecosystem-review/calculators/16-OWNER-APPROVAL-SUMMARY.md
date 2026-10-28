# 16. Owner approval summary

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

## Decision requested (one question)

Do you approve the recommended Calculators Ecosystem 2.0 scope, including selected new calculators, meaningful enhancements to existing calculators, and the proposed Calculate-button interaction changes, as the baseline for architecture, design and development?

## What approval covers (Option B)

- **Interaction:** EMI and PPF become automatic and lose Calculate; Loan Comparison loses its redundant button; Credit Card Payoff keeps its button for now; the other fourteen are untouched (03).
- **Enhancements:** EMI 2.0 (tenure and rate solving, schedule, copy summary, links to Prepayment and Loan Comparison); optional inflation view in SIP and SWP; Loan Comparison PDF no longer loads third-party code; curated related links and EMI aliases.
- **New calculator:** XIRR only (Actual/365, irregular dated cash flows, paste support, no storage).
- **Totals:** 68 functional requirements in 6 packs (45 to 50); 19 published calculators afterwards.

## Tradeoffs

1. EMI and PPF specs and tests are rewritten for the missing button.
2. PDF in Loan Comparison must either ship vendored with hash tests (font licence and size to check) or be dropped.
3. Demand is unmeasured; every ranking is a hypothesis (05, 07).
4. Credit Card Payoff stays explicit until its own review.
5. Tax-year configuration expires 2027-03-31 regardless of this scope.

## Evidence gaps the owner should know

No competitor page was exercised (04); official PPF text unread; Excel/LibreOffice XIRR comparison not done; Google Trends unavailable.

## Narrowing options

Approval may be narrowed without disturbing the rest: EMI only; drop XIRR; drop the inflation view; choose Option A or C (08).
