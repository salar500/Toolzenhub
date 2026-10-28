# 01. Verified repository baseline

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read, run or observed in this session), **PUBLIC** (a cited public page), **HYPOTHESIS** (reasoned, not measured) and **UNKNOWN**. Repository facts below are VERIFIED unless marked **HISTORICAL** (carried from the conversation and not re-checked).

## 1. Git state (VERIFIED, read-only)

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD | `6450f8f` (matches the previously reported local HEAD) |
| Working tree at the start | clean |
| Remote tracking | `origin/main`, **20 commits ahead, nothing pushed** |
| Production and Pages | not touched; `toolzenhub.in` (Hostinger) is never modified by this work |

## 2. Authoritative documents read

- `docs/product-decision-rules.md`: sections 8, 12, 13 in full (correctness, the opportunity scoring and gates, changing-data products). Section 7 rule 9 (**automatic results are the default preference for suitable tools, owner-approved 2026-10-22**) governs the Calculate-button review.
- `docs/tool-pack-factory.md` (Roadmap R1, the considered-and-not-selected list), `docs/ecosystem-review/03-CALCULATORS-ECOSYSTEM.md`, `12-ECOSYSTEM-OPPORTUNITY-MATRIX.md`, `14-DECISIONS-AND-OPEN-QUESTIONS.md`.
- No second rulebook was created. The package reuses the rulebook's own scoring model (07).

## 3. Calculator inventory (VERIFIED from `assets/js/data/tools.js`)

The catalog holds 59 entries. The historical list in the brief (16 calculators) is **out of date**: Gratuity and Salary / CTC to In-Hand have since been built.

**Published calculators: 18** (all under the Calculators section; routes `/calculators/<id>/`, Loan Comparison's code lives under `loans/`).

| Category | Published |
|---|---|
| Loans (6) | EMI, Loan Comparison, Home Loan, Loan Balance Transfer, Loan Prepayment, Credit Card Payoff |
| Investment (5) | SIP, PPF, FD, CAGR, SWP |
| Tax and pay (4) | GST, Old vs New Tax Regime (Income Tax), Gratuity (India), Salary / CTC to In-Hand (India) |
| Business (2) | Profit, Margin |
| Math (1) | Percentage |

**Coming-soon calculator entries: 11** (catalog entries only, not routes, not implemented): Personal Loan, Loan Eligibility, Interest, BMI, Calorie, BMR, ROI, Ratio, Age, Unit Converter, Currency Converter.

**Implemented but unpublished:** none found. **Release gate:** Gratuity and Salary are built and on the preview but their specs say release is not approved (owner decision D4 in `14-DECISIONS-AND-OPEN-QUESTIONS.md`); this package does not change that.

Other published tools (outside this ecosystem): 13 Time Tools, 12 Developer Tools, 2 Image Tools, 3 PDF Tools (VERIFIED by the same parse). Total published 48.

## 4. Architecture facts that constrain the requirements (VERIFIED)

- **One pure engine per calculator** under `assets/js/calculators/formulas/` (no DOM, no formatting) and one page module under `assets/js/calculators/<id>/index.js`; Loan Comparison is the exception (`loans/loan-comparison/` with `components/` and `helpers/`).
- **Interaction models today** (details in 03): 14 calculators calculate automatically as the visitor types, with no Calculate button; **EMI, Credit Card Payoff and PPF still require an explicit Calculate**; Loan Comparison shows results on load and recalculates on every field and slider change, yet still shows a "Compare Loans" button.
- **Exact arithmetic where it matters:** GST, Percentage, CAGR, Credit Card Payoff, Income Tax and Salary use integer paise or BigInt; the other loan and investment engines use floating point with documented rounding (calculate unrounded, round for display, rulebook 8.3).
- **Rule-bound tools keep dated configuration:** `income-tax-config.js` (tax year 2026-27, Income-tax Act 2025, Finance Act 2026, Income-tax Rules 2026, `validThrough` 2027-03-31, `verifiedOn` 2026-10-22), `salary-in-hand-config.js` (same year, `verifiedOn` 2026-10-22) and `gratuity-rules.js` (rules checked 2026-10-21). The Income Tax page and the Salary page both test `validThrough` against today's date and show an expiry state.
- **One third-party dependency path:** `assets/js/calculators/common/pdf/` loads jsPDF 2.5.1 and jsPDF-AutoTable 3.8.2 from `cdnjs.cloudflare.com` and a Noto Sans font from `cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/...` (an unpinned branch) when a visitor asks for a PDF. No integrity attribute was found. **Only Loan Comparison uses it** (`AmortizationPDF.js`). Every other tool and the vendored `pdf-lib` run locally. This is finding F-SEC-1 (see 14).
- **No tool stores or transmits input**: none of the 18 calculator modules uses `localStorage`, `sessionStorage` or the address bar for values (VERIFIED by search).

## 5. Test coverage that exists (VERIFIED by listing)

- **Unit:** an independent golden test per engine (`emi-golden`, `loan-formulas`, `home-loan-golden`, `balance-transfer-golden`, `prepayment-golden`, `credit-card-payoff`, `sip-golden`, `swp-golden`, `fd-golden`, `cagr-golden`, `ppf-golden`, `gst-golden`, `income-tax-golden`, `gratuity-golden`, `salary-in-hand-golden`, `profit-golden`, `margin-golden`, `percentage-golden`), plus article, UI and wiring tests for several.
- **Browser:** one spec per calculator (`emi.spec.js`, `loan-comparison.spec.js`, and so on, 18 files).
- **Independent confirmation done in this phase:** the existing EMI and SIP engines were run against a separate high-precision reference (`formula-reference-check.py`) and agree to the paisa (see 11).
- **Not run in this phase:** any browser suite (documentation-only phase, 4 GB laptop).

## 6. Known defects and limits relevant to this ecosystem

| ID | Finding | Evidence |
|---|---|---|
| K1 | `design-tokens` "colour tokens" fails: `assets/css/calculators/gratuity.css:572` has the literal `#667085` outside `variables.css`. Introduced by the Gratuity commit `710ffdf`; deterministic. | VERIFIED (Image/PDF Stage 3) |
| K2 | The Loan Comparison PDF path loads three third-party files at click time without integrity checks (F-SEC-1). | VERIFIED (code) |
| K3 | The Loan Comparison "Compare Loans" button is redundant: every slider and field calls `compareLoans()` and the page compares once on load. | VERIFIED (code) |
| K4 | The EMI page computes only the monthly EMI, total interest and total payment; the engine already has `calculateAmortization` that the page does not use. | VERIFIED |
| K5 | The related-tool curation is one-directional or empty for SIP, CAGR, FD, EMI, Loan Comparison and Home Loan. | VERIFIED (catalog) |
| K6 | How the calculator pages actually look and behave in a browser was **not exercised** in this phase. | NOT VERIFIED |

## 7. Technical constraints

Vanilla ES modules, Eleventy static build, GitHub Pages subpath and root builds; no backend, no external API, no new dependency without owner approval (rule 1.5); user input is placed as text, never markup (rule 8.7); Currency conversion remains excluded (rule 13, R1 considered list).
