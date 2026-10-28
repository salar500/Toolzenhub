# 08. Ecosystem scope options

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

## 1. Options

| | A. Focused | B. Balanced (recommended) | C. Expanded |
|---|---|---|---|
| Interaction changes | EMI, Loan Comparison, PPF | same | same, plus Credit Card Payoff |
| Enhancements | EMI 2.0, inflation view, navigation | same | same, plus snowball/avalanche, SIP lumpsum, Percentage discount mode, copy-summary helper |
| New calculators | none | **XIRR** | XIRR, RD, interest solver, weighted average, retirement planner, Unit Converter, inflation page |
| Published calculators after | 18 | 19 | up to 26 |
| Tool Packs | 45 to 48, 50 (5) | 45 to 50 (6) | 45 to 50 plus about 9 more |
| Main risk | leaves the one clear catalog gap (XIRR) open | one new tool means new formula, parser and test surface | many unvalidated demand hypotheses; RD convention and retirement advice risk; maintenance load |
| Approval needed | one decision | one decision | many; several items fail to clear validation (B verdict) |

## 2. Recommendation: B

1. Everything in A is justified by verified source facts (an explicit button where rule 7.9 prefers automatic results, a security finding, a documented gap in EMI).
2. XIRR is the single new tool with an observed competitor gap (04) and an independent reference (11). No Search or Repeat figure supports it more than the others; it is chosen for feasibility, trust and differentiation, and the 07 scores say so.
3. C's extra items score B or C in 07, depend on hypotheses that no available data can test (05), and some need prior evidence (an official RD convention, a retirement-advice boundary). They stay as P1 or P2 candidates for later approval, not part of this baseline.

## 3. Tradeoffs the owner is accepting under B

- EMI loses its button: users who expect a button see results sooner; the EMI spec and tests are rewritten.
- Credit Card Payoff keeps its button for now (deliberate earlier design).
- One new tool means one more page to maintain and index.
- Demand is unmeasured; the plan includes non-brand Search Console review after release (05).
- Statutory calculators (tax, salary, gratuity) get no features, only the annual rules update, with 2027-03-31 the next hard date.
