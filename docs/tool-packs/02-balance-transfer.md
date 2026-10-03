# Tool Pack 02: Loan Balance Transfer Calculator

Status: built (commit df994d6); see the implementation notes at the end      Planning base commit: c7ba6e9
Reserved id and slug: `balance-transfer` (route `/calculators/balance-transfer/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; the lifecycle and gate are in `docs/tool-pack-factory.md`.

## Selection record

### Candidates (from the real catalog)

Everything is Coming Soon except EMI, Loan Comparison and Loan Prepayment. Levels are qualitative.

| Candidate (id) | Problem and pain | Repeat use | Differentiation | Content potential | Maintenance / external risk |
| --- | --- | --- | --- | --- | --- |
| **Balance Transfer** (`balance-transfer`, loans) | "A lender offers a lower rate: is switching worth the fees?" A real, money-sized decision with fees and a trap (a longer tenure makes the EMI look lower). **High** | Medium (a few times in a loan's life, but each is a big decision) | **High**: net saving after fees, break-even month, tenure-neutral comparison, the rate at which switching stops paying | **High**: decision guide, tenure trap, transfer versus prepayment | **Low**: all numbers come from the user, no lender rules assumed, no live data |
| SIP Calculator (`sip`, investment) | "What will a monthly investment grow to, and how much do I need for a goal?" High | **High** (revisited as goals change) | Medium: needs step-up, goal-first and inflation-adjusted views to stand out from the many basic SIP pages | High (strategies, step-up, goal planning) | Medium: the return rate is an assumption, so projections need careful framing; no live data |
| Home Loan Calculator (`home-loan`, loans) | Home loan EMI and total cost. Medium | Medium | **Low** as it stands: EMI plus a property-themed wrapper; the real extras (eligibility, taxes, charges) are rule-dependent | Medium, but it would overlap EMI, Prepayment and the loan articles | Medium |
| Loan Eligibility (`loan-eligibility`, loans) | "How much can I borrow?" High pain | Medium | Medium | Medium | **High**: depends on lender rules (income ratios, bureau scores) the site cannot keep current; trust risk |
| FD Calculator (`fd`, investment) | Fixed deposit maturity. Medium | Low to medium | Low: one formula with compounding frequency | Low | Medium: interest tax and rates change |
| PPF Calculator (`ppf`, investment) | PPF maturity. Medium | Low to medium | Low to medium | Medium | **High**: government rate, deposit limit and lock-in rules change |
| Income Tax Calculator (`income-tax`, tax) | "What tax will I pay?" Very high | High (yearly) | Medium | High | **Very high**: slabs, regimes, deductions and years must be maintained; wrong answers are costly |

Screened out: Personal Loan (an EMI duplicate), Interest (a generic simple and compound formula), CAGR, GST,
ROI, Margin, Profit (basic formulas, high competition, little decision value), the health, math and
converter tools (generic, and Currency needs live data).

### Loans first or a second category

**Loans first** keeps the architecture warm: the EMI, amortization and prepayment engines, the schedule and
print patterns, and the cluster (EMI, Comparison, Prepayment, the six loan articles) can all link to a
transfer tool. It deepens topical authority where the site is strongest and costs the least new infrastructure.
Risk: over-concentration in one category.

**A second category (Investment)** proves the architecture beyond Loans: a second category page, new article
topics and a different kind of result (projections, not repayments). It also needs a new editorial standard for
projections (a return rate is an assumption, not a promise) and has no existing engine to reuse.

Judgement: finish one more strong Loans pack now, because the standard was just proven there and a transfer
decision is the natural next question after prepayment; then use **SIP** as Tool Pack 3 to test a second
category. This is a sequencing choice, not a category quota.

### Selected: Loan Balance Transfer Calculator

- **Name and slug:** catalog title today "Balance Transfer Calculator"; proposed display title
  "Loan Balance Transfer Calculator" (as "Loan Prepayment Calculator" was); id and slug `balance-transfer` kept.
- **Section and category:** Calculators, Loans.
- **Why it comes first:** the strongest decision-support tool among the candidates that needs no rule or rate
  the site must maintain; fully deterministic and in the browser; high commercial intent; a clear
  differentiator (the saving after fees, the break-even month, the tenure trap, the break-even rate); reuses the
  existing loan engines; and links the whole Loans cluster. SIP is the strongest alternative but is better as
  the first test of a second category once this pack has refined the factory.
- **External dependency:** none (no API, no live data, no account). Lender fees and rules are **entered by the
  user**, never assumed by the site.
- **Major risks:** (1) fee structures vary and are easy to model wrongly, so the tool takes two plain amounts
  and does not model a lender's rules; (2) "teaser" or stepped rates are out of scope and must be stated;
  (3) the result must never read as advice; (4) the tenure trap needs a clear, neutral explanation;
  (5) the break-even logic has a case where a saving is temporary, which must be shown honestly.

## Spec

### 1. Tool identity
Loan Balance Transfer Calculator; `balance-transfer`; Calculators, Loans; no subcategory; `toolType`
calculator. Description: "See whether moving your loan to a lower rate pays off after the fees, and when."
Aliases (true names, to confirm at build): "loan transfer", "refinance", "switch loan".

### 2. User problem
A borrower with a running loan is offered a lower interest rate by another lender. The lower EMI looks
attractive, but fees, a possibly longer tenure and the time left on the loan decide whether the move saves
money. Today they compare headline rates or EMIs, which hides the cost.

### 3. Jobs to be done
- Does switching save me money overall once all the fees are counted?
- How many months until the fees are earned back?
- If the new loan runs longer, how much of the "saving" is just a longer tenure?
- How low must the new rate be before switching is worth it?
- How does this compare with simply keeping the loan?

### 4. Target users
Borrowers with a running EMI loan (typically a home loan) comparing a specific offer. Not a tool for choosing a
first loan (that is Loan Comparison), for checking eligibility, or for modelling a lender's fee rules.

### 5. Inputs
| Field | Unit | Default | Limits | Note |
| --- | --- | --- | --- | --- |
| Outstanding loan balance | ₹ | 25,00,000 | 1,000 to 10,00,00,000 | what you owe now |
| Current interest rate | % a year | 9.5 | 0.1 to 30 | assumed constant to the end |
| Remaining tenure | years + months | 15 y 0 m | 1 to 480 months | as in the Prepayment tool |
| New interest rate | % a year | 8.5 | 0.1 to 30 | the offer; assumed constant |
| New tenure | years + months | 15 y 0 m (same as remaining) | 1 to 480 months | shorter or longer is allowed |
| Charges to close the current loan early | ₹ | 0 | 0 to 10,00,00,000 | enter what your lender quotes, or 0 |
| New lender's fees and charges | ₹ | 15,000 | 0 to 10,00,00,000 | processing, legal and valuation fees and taxes, as quoted |

Left out of v1: a fee entered as a percentage, a charge added to the loan, a stepped or teaser rate, an
"actual current EMI" override, a date for the switch. Each is a deferred item with a reason in section 27.

### 6. Outputs
- **Primary:** "Switching would save you about ₹X overall" or "…would cost you about ₹X more overall", worded
  from the sign of the net saving (the words carry the meaning, not a colour).
- **Supporting:** the break-even month (or "the fees are not earned back", or "the saving is temporary", see
  the edge cases); EMI now and after, and the monthly difference; when each loan ends; total interest for each;
  the one-time charges; total you pay with each choice.
- **Tenure-neutral comparison** (only when the new tenure differs from the remaining one): the net saving if
  the new loan ran for the same remaining tenure, beside the net saving for the chosen tenure, with one plain
  sentence saying what the difference means.
- **Break-even rate:** the highest new rate at which the net saving is zero for the chosen tenure ("switching
  only pays if the new rate is below X%").
- Not shown: advice, a recommendation, lender names or any rule.

### 7. Model rules
- Conventions as in the Prepayment engine: monthly rate = annual rate ÷ 12 ÷ 100; EMI from the standard
  formula; interest on the reducing balance; the switch happens now, before the next EMI; the new loan's first
  EMI is month 1; charges are paid at month 0 from your own pocket. Calculate unrounded, round for display.
- Current loan: EMI₀ from (balance, current rate, remaining months n₀). New loan: EMI₁ from (balance, new rate,
  new months n₁). Reuse `formulas/loan.js` for the EMI; do not copy it.
- Total outgo from now: current = EMI₀ × n₀. New = EMI₁ × n₁ + all one-time charges. **Net saving = current −
  new** (a negative value means switching costs more).
- Cumulative position S(m) after month m = the sum over t ≤ m of (payment₀ᵗ − payment₁ᵗ) − charges, where a
  payment is zero after its loan ends. **Break-even month** = the first m with S(m) ≥ 0. S(final) equals the
  net saving. If the new tenure is longer, S can rise above zero and then fall back below it: report this
  as "the saving is temporary" and show the final figure.
- Tenure-neutral comparison: the same calculation with n₁ replaced by n₀.
- Break-even rate: the new rate at which the net saving is zero for the chosen tenure, found numerically
  (bisection on the monotonic net saving); defined as "none" if even the lowest allowed rate does not pay back.
- Independent verification: a Python `decimal` reference (closed-form sums and a month-by-month simulation that
  must agree), as for the Prepayment pack.

### 8. Assumptions (shown on the page)
Both rates stay the same until the loan ends. The EMI is worked out from the balance, rate and tenure you enter,
so it may differ slightly from your lender's. The charges are the amounts you enter, paid up front, not added to
the loan. No prepayment or foreclosure charge is assumed unless you enter one; whether one applies depends on
your loan and lender. Stepped, introductory or floating rate changes are not modelled. Figures are estimates for
understanding, not financial advice (the existing disclaimer link).

### 9. Edge cases
- New rate equal to or above the current rate: the net saving is zero or negative; break-even "not earned back";
  no error.
- Zero charges and a lower rate: break-even is month 1 (immediate).
- Charges larger than the whole interest saving: negative net saving, "does not pay back".
- New tenure longer than remaining: lower EMI but possibly higher total cost; the temporary-saving case.
- New tenure shorter than remaining: higher EMI; the saving is real but needs affordability, said neutrally.
- Remaining tenure of 1 to 3 months: the charges will almost never be earned back; no special error.
- Balance, rate and tenure at the limits; fractional rates (8.35); a very high charge input.
- The EMI of the current loan equals the new one: net saving is minus the charges.

### 10. Validation
Limits as in section 5 with the same message style as the Prepayment tool (tool-owned messages, the shared
field helpers for linked errors). Years 0 to 40 and months 0 to 11 as whole numbers; total tenure 1 to 480
months for both tenures. A cleared field shows the prompt, not an error. Charges must be 0 or more.

### 11. UX flow
Intro, then "Your current loan", "The new offer" and "One-time charges" as three groups in one form, live
results (no Calculate button, as in the Prepayment tool), Reset (secondary). Result summary, comparison, the
yearly position table, then explanation, assumptions, example and FAQ. No primary button, because results are
live. Shared fields, result helpers, buttons and headings only.

### 12. Result hierarchy
First: the net saving sentence. Second: the break-even month and the monthly EMI difference. Third: the
side-by-side comparison. Fourth: the tenure-neutral line and the break-even rate. An unfavourable result is
shown in the same layout with neutral wording ("would cost about ₹X more"), never an alarm style or advice.

### 13. Comparison and table decision
**Comparison cards: needed** (current loan, new loan; EMI, ends in, total interest, total you pay, one-time
charges). **Table: needed**, year by year, default view: year, payments on the current loan, payments on the new
loan, charges, and cumulative net position, so the sign change at break-even is visible. **Monthly detail:
NOT NEEDED** (the break-even month is stated; a monthly table would add rows without a decision).

### 14. Chart decision
**NOT NEEDED in v1.** The table and the break-even sentence carry it. Revisit with one line (cumulative
position crossing zero) only if review shows people miss the break-even point.

### 15. Export decision
**CSV: NOT NEEDED** (a yearly table of at most 40 rows is not something people keep). Revisit if users ask.

### 16. Print decision
**Print Summary: needed** (a switching decision is often taken to a lender or a partner). Native browser print,
no PDF engine. Prints the entered loan and offer, the charges, the result, the comparison and the yearly table,
and the estimate caveat; hides the site chrome, the form and all buttons. This is the second use of the print
pattern: decide at build time whether the print CSS should become shared before copying it.

### 17. Mobile behaviour
Single-column fields with the two tenure pairs side by side; result cards stack; the yearly table scrolls in a
labelled region with a sticky first column; no page-level horizontal scroll; action rows wrap with at least 38px
tap targets.

### 18. Accessibility requirements
Labelled fields with linked hints and errors (`aria-invalid`, `aria-describedby`); a polite live region with one
summary sentence; table caption and `scope`; the favourable or unfavourable result is stated in words, not by
colour alone; focus ring from the shared layer; control text at 4.5:1 or better; reduced motion; Print Summary
reachable by keyboard.

### 19. Search keywords and aliases
Aliases "loan transfer", "refinance", "switch loan" (confirm each is a genuine name). Queries to check: "balance
transfer", "loan transfer", "refinance", "switch", "lower interest".

### 20. Related calculators
`prepayment` (the other way to cut interest), `loan-comparison` (compare offers for a new loan), `emi`.
Adding the tool to the Prepayment tool's `relatedTools` is a visible change to review at build time.

### 21. Article cluster
Build only what is ready and distinct; no forced count.
1. **Is a balance transfer worth it? A break-even way to decide** (decision guide): the fees, the break-even
   month, the rate that stops paying; scenarios from the tool.
2. **Lower EMI is not lower cost: balance transfer and a longer tenure** (mistake avoidance and interpretation):
   the tenure-neutral comparison with real numbers. Check it adds an angle beyond `emi-vs-total-interest` and
   `loan-tenure-total-interest`; if not, fold it into article 1.
3. **Balance transfer or prepayment: which saves more?** (scenario comparison): the same loan, fees against a
   lump sum, using the transfer and prepayment engines.
Deferred (rule-dependent, need a dated source): what lenders charge on a transfer and what the rules on
foreclosure charges are; how a transfer affects a credit score.

### 22. Imagery plan
Each from the tool's own numbers, no text: (a) the cumulative position line starting below zero (the fees) and
crossing zero at the break-even month; (b) two pairs of bars for the same loan, "same tenure" against "longer
tenure": the EMI is lower in both, the total cost is higher only for the longer tenure; (c) for article 3, two
bars of interest saved by the transfer and by a prepayment. PNG plus WebP, descriptive alt text. No stock or
generic art.

### 23. SEO plan
Title "Loan Balance Transfer Calculator | ToolZen Hub"; a unique description about the saving after fees and the
break-even; canonical `https://toolzenhub.in/calculators/balance-transfer/`; one H1; breadcrumb structured data
(generated); the whole form, example and FAQ in the static HTML; internal links to the three related tools and
the cluster. No pages for keyword variations.

### 24. Performance constraints
Tool JS about 10 KB gzipped or less including the formulas, tool CSS about 2 KB, shared styles reused, no new
dependency, loaded only on its own page.

### 25. Tests
- Unit: golden scenarios from the independent reference; invariants (net saving falls as charges rise and
  rises as the new rate falls; break-even month is the first month with S ≥ 0; S(final) equals the net saving;
  tenure-neutral equals the main comparison when the tenures match; the break-even rate gives a net saving of
  zero); validation and boundaries; the catalog entry; relationships.
- Starting scenarios (illustrative, **to be re-derived independently** by the pack's reference): balance
  25,00,000; current 9.5% for 15 years gives EMI 26,105.62; new 8.5% for 15 years gives EMI 24,618.49 (the
  same total interest, 19,31,328.01, as the Prepayment golden baseline); charges 17,500: monthly saving
  1,487.13, net saving 2,50,183.06, break-even month 12. The same offer with a new 20-year tenure: EMI 21,695.58
  (4,410.04 less a month), break-even month 4, but a net **cost** of 5,25,428.33: the temporary-saving case.
- Browser: live results, the three scenario types, validation and linked errors, reset, keyboard, print
  summary calls print, mobile layout, search by name and alias, related content.
- Accessibility spec entries; visual baselines for the new page and the pages that gain a related card.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: chart (section 14), CSV (section 15), monthly detail
(section 13).

### 27. Deferred items
Fee entered as a percentage; charges added to the loan; stepped or introductory rates; an actual-EMI override;
a switch date; CSV; the chart; the rule-dependent articles. Revisit each when there is user evidence or a
verified, dated rule.

### 28. Commit checkpoint
Commit subject: `feat: add loan balance transfer calculator and content cluster`. Afterwards run the exact-tree
verification (`docs/tool-pack-factory.md`, section 8). Do not push.


## Implementation notes (as built, commit `df994d6`)

The tool shipped as planned. Where the build differs from, or settles, the plan above:

| Topic | What was built |
| --- | --- |
| Title and slug | "Loan Balance Transfer Calculator"; `balance-transfer` kept. |
| Defaults | ₹25,00,000; current 9.5% for 15 years; new 8.5% for 15 years; charges 0 at the current lender and ₹15,000 at the new one (the planning scenarios used ₹17,500). |
| New tenure | follows the remaining tenure until the visitor edits it; Reset re-links it. |
| Result states | "Potential saving", "Potential loss", "Lower EMI, higher overall cost" and "About the same"; break-even kinds immediate, months, never and none; the temporary saving is said in words. |
| Same-tenure check | a third comparison card and a sentence that separates the rate's effect from the tenure's. |
| Table | the yearly cumulative-position table with an "At the switch" row; no monthly detail, no chart, no CSV, as decided. |
| Print | native `window.print()` with print CSS in `balance-transfer.css`; the second use of the print pattern (see Pack 3, section 24). |
| Articles | published: "Is a Loan Balance Transfer Worth It? Use Break-Even to Decide" and "Loan Balance Transfer vs Prepayment: Which Saves More?". Not published: "Lower EMI Is Not Always Lower Cost" (it overlaps `emi-vs-total-interest` and `loan-tenure-total-interest`; its tenure-neutral point is in article 1 and the tool's own result) and the rule-dependent articles. |
| Imagery | two charts drawn from the calculators' numbers (the 15-year against 20-year cumulative position; interest saved by prepaying, switching, or both for a large and a small rate drop). |
| Catalog | the Prepayment tool now lists this tool among its related tools; EMI and Loan Comparison show it by category fallback. |
| Verification | the browser suites were run spec by spec because full runs exceeded the machine's memory; stale `npm run dev` servers writing to `dist` were the likely cause of a one-off `/calculators/undefined/` build and an `ENOTEMPTY` error (not proven; neither recurred once they were stopped). |
