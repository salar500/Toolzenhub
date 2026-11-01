# 13. Calculator numeric-field inventory and the slider decision (2026-11-01)

Static analysis only (a script over `assets/js/calculators/*/index.js`); no browser, no code changed. It answers the blueprint's open question U9: where would a linked slider and number control genuinely help?

## What exists

- 14 calculators build numeric inputs through the shared `numberField` helper (`assets/js/ui/field.js`): 68 call sites in total. Balance Transfer 7, SIP 7, Home Loan 6, Prepayment 6, CAGR 6, SWP 6, FD 5, Margin 5, Profit 5, EMI 4, Credit Card Payoff 4, PPF 4, GST 2, Income Tax 1. Gratuity, Salary in Hand, Percentage, XIRR and Risk-Reward use their own text fields (decimal keypad, exact parsing).
- **Sliders today:** Loan Comparison only (its own `.loan-slider` markup in `components/LoanCard.js`). No other calculator has one.
- Every `numberField` already carries `min`, `max` and `step` from a limits constant (`L.rate`, `L.years`, `FIELDS`, `PPF_LIMITS`, ...), so the bounds a slider needs exist.

## Where a slider fits

Rate and tenure style fields are bounded, small-range and explored by trying values: 19 fields in 12 calculators (interest rates in Balance Transfer, EMI, FD, Home Loan, PPF, Prepayment; years or tenure in Balance Transfer, CAGR, EMI, FD, Home Loan, PPF, Prepayment, SIP, SWP; GST rate; credit-card APR). Amount fields (loan amount, monthly SIP, deposits) span orders of magnitude, have no sensible linear scale and are typed, so a slider would be worse than the number box. Percentage and Risk-Reward fields are exact decimals the visitor types and should stay text.

## Decision (updated 2026-11-01, later the same day)

**Implemented.** One shared, opt-in enhancement: `numberField({ slider: { min, max, step } })` writes three data attributes; `assets/js/ui/field-slider.js` adds a native range input under the field in the browser; `entries/tool.js` calls it once after a calculator initialises. The number input stays the source of truth: the slider sets it and fires its own `input` event (so every tool recalculates exactly as for typed input), follows typed values, follows a disabled or hidden field, and re-reads after any click or change in the tool (a tool's Reset sets values in code and fires no event, which the first browser test showed). The slider range is a practical range clamped to the field's own limits, so it never offers a refused value; a typed value outside it pins the thumb to the end and leaves the number untouched.

Opted in (practical range, step): interest rates in EMI, Home Loan, Prepayment and both Balance Transfer rates 1 to 20 (0.1); FD rates 1 to 12 (0.1); PPF example rate 5 to 10 (0.1); credit-card APR 5 to 60 (0.5); GST rate 0 to 28 (0.5); years or tenure in EMI, Home Loan, Prepayment, Balance Transfer, CAGR and PPF 1 to 30 (1), FD 1 to 10, SIP and SWP 1 to 40. 19 fields in 11 calculators. Amount fields, the Risk-Reward, Percentage, XIRR, Gratuity and Salary fields, and Margin, Profit and Income Tax have none. No formula, limit or validation changed.

Tests: `tests/unit/field-slider.test.mjs` (6) and `tests/browser/field-slider.spec.js` (10: markup contract, slider to number with recalculation, number to slider and out-of-range pinning, keyboard, a solver hiding a field, Reset, FD and GST representatives, 320/360/390 overflow, non-opted pages). Not covered: a physical touch screen (PENDING USER).

## Not done

Nothing else changed by this audit.
