# 03. Calculate-button decision matrix

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed, and no Calculate button was removed.

## 1. The governing rule and the headline finding

Rulebook section 7, rule 9 (owner-approved 2026-10-22): *a deterministic, instant, browser-local calculation shows its result as soon as its inputs are complete and valid, instead of waiting for a Calculate button, and keeps Reset where it helps; each tool decides this in its own spec; a file, staged, external or long-running workflow keeps an explicit action; a tool that calculates automatically never shows a partial or invalid result.* This package applies that rule to each tool separately and does not impose live calculation universally.

**Headline finding (VERIFIED in source): the owner's concern is already largely resolved.** Fourteen of the 18 published calculators already have no Calculate button. Only **EMI, Credit Card Payoff and PPF** still require one, and Loan Comparison keeps a button that does nothing the page does not already do. The recommendation therefore touches **four tools, not eighteen**, and leaves fourteen alone.

## 2. Interaction models

- **LIVE (A):** results update as inputs become valid.
- **EXPLICIT (B):** results appear after an action.
- **HYBRID (C):** simple results live, one expensive or irreversible step explicit.

## 3. Existing calculators

Columns: current model, recommended model, whether Calculate stays, whether Reset stays, validation timing, result-update timing, screen-reader behaviour, performance concern, migration risk and testing impact. "Settled" means the tool's own rule that a result appears only when every required field is valid and updates after a short pause, never on a half-typed value.

| # | Calculator | Current | Recommended | Calculate stays? | Reset | Validation timing | Update timing | Screen reader | Performance | Migration risk | Testing impact |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | EMI | B (submit runs `calculate()`) | **A, change** | **No, remove** | keep | field error on leaving a field; none while typing | when all three fields are valid; recalculated on each valid change | one polite announcement of the settled result after a pause, no focus move | one closed-form calculation; trivial | **Medium**: the page and its spec are built around the button | rewrite `emi.spec.js` interaction steps; golden values unchanged |
| 2 | Loan Comparison | A in effect, plus a redundant button | **A, tidy** | **No, remove** | keep | existing field and slider handling | already immediate | existing | two closed forms; trivial | **Low** (the button's handler is the same function the inputs call) | update `loan-comparison.spec.js` (it clicks the button in several places) |
| 3 | Home Loan | A | A | n/a (already none) | keep | on blur | settled | polite | trivial | none | none |
| 4 | Balance Transfer | A | A | n/a | keep | on blur | settled | polite | trivial | none | none |
| 5 | Loan Prepayment | A | A | n/a | keep | on blur | settled | polite | schedule redraw only on selection | none | none |
| 6 | Credit Card Payoff | B with a stale label | **A, change (P1)** | **No, remove** | keep | settled | when the three required fields are valid; the optional second payment joins when valid | polite; the existing stale-result state disappears | up to 600 monthly steps of exact BigInt arithmetic per recalculation; fast, but **MEASURE** in Stage 3 | **Medium**: the stale-label design, its copy and its tests are the point of the tool today | rewrite stale-state tests; BigInt golden values unchanged |
| 7 | SIP | A | A | n/a | keep | on input and blur | immediate | polite, `speak:false` on reset | trivial | none | none |
| 8 | SWP | A | A | n/a | keep | settled | immediate | polite | up to 50 years of steps; trivial | none | none |
| 9 | FD | A | A | n/a | keep | settled | immediate | polite | trivial | none | none |
| 10 | CAGR | A | A | n/a | keep | settled | immediate | polite | trivial | none | none |
| 11 | PPF | B with a stale label | **A, change** | **No, remove** | keep | settled | when the inputs are valid | polite | at most a few hundred monthly steps; trivial | **Low to medium** (smaller than CCP: no exact-arithmetic engine, but the stale label and the yearly-versus-monthly pattern comparison must be re-specified) | update `ppf.spec.js`; golden values unchanged |
| 12 | GST | A | A | n/a | keep | settled | immediate | polite | trivial | none | none |
| 13 | Old vs New Tax Regime | A, settled only | A | n/a | keep | settled | immediate | polite, never moves focus | trivial | none | none |
| 14 | Gratuity | A (G9) | A | n/a | keep | settled | settled | polite | trivial | none | none |
| 15 | Salary / CTC to In-Hand | A | A | n/a | keep | settled | settled | polite | trivial | none | none |
| 16 | Profit | A | A | n/a | keep | settled | immediate | polite | trivial | none | none |
| 17 | Margin | A | A | n/a | keep | settled | immediate | polite | trivial | none | none |
| 18 | Percentage | A | A | n/a | keep | on blur (`focusout`) | immediate | polite | BigInt, trivial | none | none |

## 4. Proposed P0 tool

| Tool | Recommended | Why | Detail |
|---|---|---|---|
| XIRR Calculator (new) | **A after validation, with one explicit action for bulk paste** | The solver is a bounded bisection (a few hundred evaluations of a sum over at most 100 rows), instant. Each row edit re-solves once all rows are valid. Pasting many rows is a separate action ("Add these rows") so a half-pasted list never produces a result, which is rule 7.9's file/staged-input case. | FR-XIRR-002, FR-XIRR-003 |

## 5. Recommended changes: reasons, behaviour and risk

**EMI (change).** *Benefit:* the visitor sees the EMI as soon as the three numbers are valid and can change one number to compare, which is how the tool is actually used; Omni's EMI page, which updates live with no button, is the public comparison (OBSERVED, 04). *Behaviour:* see FR-EMI-001 to 004. *Not changed:* the engine, the displayed values, the URL and the golden tests.

**Loan Comparison (tidy).** *Benefit:* removes a control that implies results are not current when they are. *Risk:* low; one handler is shared.

**PPF (change).** *Benefit:* the same as EMI and removes a "labelled out of date" state that exists only because of the button. *Risk:* the editorial wording of the stale label and its tests.

**Credit Card Payoff (change, P1 not P0).** *Benefit:* consistency with rule 7.9. *Why not P0:* the existing explicit design was a deliberate decision in spec 24 ("the page never shows a figure for inputs it was not calculated from"). A live version satisfies that sentence only if results are gated on validity and replaced atomically, which needs its own spec review. Keep as is until that review.

## 6. Live-calculation behaviour (applies to every tool that changes to LIVE: EMI, Loan Comparison, PPF; later CCP and XIRR)

1. **Valid input:** the result appears or updates; the previous result is replaced atomically, never shown beside new inputs it was not computed from.
2. **Empty input:** a neutral prompt ("Enter the loan amount, the rate and the tenure."); no result, no error.
3. **Partially entered value:** no result and **no error while the field has focus**; the message appears when the field is left (`focusout`), as Percentage already does.
4. **Invalid input:** a specific message beside the field, `aria-invalid` set, the visitor's text left intact, **the previous result removed** (never a figure for inputs that are not valid).
5. **Rounding:** calculate unrounded and round only for display (rule 8.3); display conventions stay exactly as they are today.
6. **Focus:** an automatic update never moves focus and never scrolls the page.
7. **Screen readers:** one polite status announcement of the settled result after a pause of about 600 ms with no further input; **never one per keystroke**; Reset announces once and does not repeat the result.
8. **Reset:** restores the documented defaults, clears errors and results, announces once, returns focus to the first field.
9. **Mobile keyboard:** numeric fields use a numeric input mode; focusing a field does not scroll the result out of view; no layout jump larger than the result block itself (reserve space for the result region).
10. **Visual calm:** no animation on update; a changed figure may use a brief colour change only if it respects reduced motion.

## 7. Decision

Recommended for approval: change EMI, Loan Comparison and PPF now (packs 45, 46, 47); schedule Credit Card Payoff as P1 after its spec review; leave the other 14 unchanged. The approval request in 16 asks for exactly this, and it can be narrowed (for example, EMI only) without affecting the rest of the scope.
