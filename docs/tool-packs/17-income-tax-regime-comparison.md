# Tool Pack 17: Old vs New Tax Regime Calculator (India, tax year 2026-27)

Status: built and verified      Base commit: 054624c
Id: `income-tax` (the former Coming Soon "Income Tax Calculator" entry, now live); route `/calculators/income-tax/`; Calculators, Tax.
Public name: **Old vs New Tax Regime Calculator** (it compares two regimes for one narrow taxpayer; "Income Tax Calculator" would promise more than it does).
Follows `docs/product-decision-rules.md` and the feasibility spike that preceded it. Spec template `docs/tool-packs/_spec-template.md`.

## Product job

"Based on my supported income and deductions, which regime produces the lower estimated income tax?" Decision support, not advice, not a return, not a universal Indian tax engine. It wins by a narrow, trustworthy scope; visible assumptions and sources; a side-by-side result that reads on a phone; a break-even; and calculation that never leaves the browser.

## Supported taxpayer (hard scope)

An individual, **resident in India, under 60**, with **salary or pension income** for the whole year, optional **other income taxed at normal slab rates**, and **salary plus other income up to ₹50,00,000**, for **tax year 2026-27 (FY 2026-27)** only. The ceiling applies to salary plus other income *before* any deduction, so total income can never exceed ₹50 lakh in either regime and surcharge (which starts when total income exceeds ₹50,00,000) can never apply. Above it the tool refuses with: "This version supports total income up to ₹50 lakh. Higher incomes may require surcharge and marginal-relief calculations that are not included." A deduction does not bring a higher income back into scope.

## Explicit exclusions (never approximated)

Business or professional income, presumptive taxation, capital gains, dividends, VDA/crypto, lottery and online-game winnings, foreign income, non-residents, agricultural income, arrears relief (section 157), seniors (60 and above: different old-regime slabs), rent from a let-out house and house-property loss set-off, family pension (its own deduction, s.93(1)(d)), surcharge, part-year or multiple-employer salary, other tax years, health-insurance medical-expenditure cases and multi-year lump-sum premiums, parents of mixed ages, and any claim that a deduction is allowed.

## Tax year and legal status

Tax year 2026-27 is the first under the **Income-tax Act, 2025**, which uses "tax year" and not "assessment year". The Act was assented on 21 Aug 2025 and came into force on 1 Apr 2026 (PIB, 1 Apr 2026). **Enacted law, not a proposal:** the rates come from the Finance Act, 2026 (No. 4 of 2026, assent 30 Mar 2026), not from the Finance Bill. The page states the year and never says "latest".

## Source freeze (read as primary text; nothing from memory)

| Topic | Provision | What it fixes | Source (read) |
| --- | --- | --- | --- |
| New-regime slabs | Act s.202(1) | 0 to 4L nil; 5% to 8L; 10% to 12L; 15% to 16L; 20% to 20L; 25% to 24L; 30% above | Act, Gazette `egazette.gov.in/WriteReadData/2025/265620.pdf` |
| Old-regime slabs (under 60) | Finance Act 2026, First Schedule Part I-B, Paragraph A(I) | nil to 2,50,000; 5% to 5,00,000; ₹12,500 + 20% to 10,00,000; ₹1,12,500 + 30% above | Finance Act 2026, Gazette `egazette.gov.in/WriteReadData/2026/271439.pdf` (enacted text; identical to the Bill) |
| Rebate | Act s.156 | old: total income up to ₹5,00,000, 100% of tax or ₹12,500, lesser; new: up to ₹12,00,000, lesser of tax or ₹60,000, and above it marginal relief (tax cannot exceed the income above ₹12,00,000), not above tax at s.202(1) rates | Act |
| Standard deduction | Act s.19(1) Table Sl. 2 | ₹75,000 under s.202(1), ₹50,000 otherwise; each limited to the salary | Act |
| Professional tax | s.19(1) Table Sl. 1 | entire amount; disallowed in the new regime (s.202(2)(a)(iv)) | Act |
| Cess | Finance Act 2026 ss.2, 3 | 4% on income-tax plus surcharge | Finance Act 2026 |
| Rounding | Act s.516 | total income and any amount payable: nearest multiple of 10, paise ignored, 5 or more up | Act |
| Chapter VIII cap | Act s.122(2) | deductions together cannot exceed gross total income | Act |
| 80C-type deduction | Act s.123, Schedule XV | up to ₹1,50,000 | Act |
| Own NPS | s.124(3) | up to ₹50,000 (not on an amount also claimed under s.123, s.124(5), (10)) | Act |
| Employer NPS | s.124(1), (2) and the definition of "salary" in that section | 10% of "salary" (14% for a Central/State Government employer); 14% in the new regime (s.124(2)); "salary" = DA if the terms of employment provide it, excluding all other allowances and perquisites | Act |
| Health insurance | s.126(2), (4), (8) | self, spouse, dependent children: ₹25,000; parents: ₹25,000, or ₹50,000 if a senior citizen; preventive check-up ₹5,000 inside the limit | Act |
| Home loan interest | s.22(2), (5); s.21(6); s.202(2)(a)(v) | self-occupied: ₹2,00,000 (acquired/built with borrowed capital, completed within five years of the end of the year of borrowing) or ₹30,000 in any other case; limit covers s.22(1)(b) and (c) after FA 2026; not allowed in the new regime | Act; FA 2026 clause on s.22 |
| HRA | Schedule III Sl. 11; Income-tax Rules 2026 r.279 | least of HRA received, rent minus 10% of salary, 50% of salary in Mumbai, Kolkata, Delhi, Chennai, Hyderabad, Pune, Ahmedabad, Bengaluru, otherwise 40%; salary = basic + DA if the terms provide it; not in the new regime (s.202(2)(a)(i)) | Rules, `incometax.gov.in/.../En-Notified-IT-Rules-2026-20-03-2026.pdf` |
| Salary includes pension; employer NPS is part of salary | Act s.16(b), (k) | classification used in the help text | Act |
| Interest is ordinary income | Act s.92(1) (residual head) and no special rate for it in FA 2026 s.3 | "other income taxed at normal rates" | Act; FA 2026 |
| Act in force from 1 Apr 2026 | PIB | | PIB `pib.gov.in/PressReleasePage.aspx?PRID=2248005` |

**Verified unchanged by the Finance Act 2026:** sections 19, 123, 124, 126, 156 and 516 are not amended; section 22 is amended only to apply its limit to (1)(b) and (c); section 202 only omits an SEZ-related sub-clause (iii) of (2)(a). The e-filing portal's guidance for the previous year (AY 2026-27) is consistent with the same slabs, rebate and cess.

## Unresolved, therefore excluded or constrained

1. **Surcharge for the new regime in tax year 2026-27** (the portal shows a 25% cap for the previous year; the Finance Act 2026 Part I-B table could not be reconciled from the extracted text): excluded by the ₹50 lakh ceiling.
2. **The Department's consolidated "Act as amended by Finance Act 2026"** (on a site that blocks automated access) was not read; amendments were applied by reading the Finance Act's own list of amended sections (above). A human should compare against the consolidated text at the next update.
3. **Rounding of intermediate amounts:** the statute names total income and "any amount payable". Decision: round the total income and the final amount payable only; slab tax, rebate and cess are exact. Effect on any result: at most ₹10.
4. Family pension, seniors, let-out property, surcharge: excluded.

## Annual configuration

`assets/js/calculators/formulas/income-tax-config.js` is one frozen object (`TAX_YEAR_2026_27`, exported as `ACTIVE_TAX_YEAR`): tax year labels, validity dates, `verifiedOn`, the income ceiling, both slab tables, standard deductions, both rebates, cess, rounding multiple, every deduction cap and percentage, the HRA table and city list, and the source list. The engine and the page consume it; no annual constant appears anywhere else. A test pins every value, a test checks it is deeply frozen, and a **staleness tripwire** test fails 90 days after `validThrough`, forcing a review. At runtime the page shows a banner once the tax year has ended.

## Calculation (assumptions in the code header)

All money is **integer paise** inside the engine (inputs are whole rupees); a whole-rupee amount times a whole percent is exact paise, and the 4% cess is held in hundredths of a paisa, so no result carries floating-point error.

**Old regime:** salary, minus HRA exemption, minus standard deduction (limited to salary), minus professional tax (never below zero), plus other income, minus the self-occupied home loan interest (to its limit; shown as a loss on the house), gives gross total income. Chapter VIII deductions (80C-type, own NPS, health insurance, employer NPS, other) are each limited, then limited together to gross total income. The result is the total income, rounded (s.516), taxed at the slabs, reduced by the s.156(1) rebate, plus 4% cess, rounded.

**New regime:** salary minus the ₹75,000 standard deduction, plus other income, minus the employer's NPS contribution only (s.124(1), (2): 14%), rounded, taxed, with the s.156(2) rebate and marginal relief, plus cess, rounded. No other old-regime item is carried over.

**Rebate marginal relief** (new regime): at or below ₹12,00,000 the rebate is the lesser of the tax and ₹60,000; above it the tax after relief is the lesser of the tax and the income above ₹12,00,000. A salary of ₹12,75,000 (total income ₹12,00,000 after the standard deduction) therefore pays nothing and ₹12,75,010 pays ₹10; the relief applies while the tax before relief exceeds the income above ₹12,00,000, that is while 60,000 + 15% of y is more than y (y being that excess), so it ends at a total income of about ₹12,70,588; at ₹12,75,000 the tax before relief (₹71,250) is already below the excess (₹75,000) and there is no relief (pinned in the golden cases).

## Inputs and deductions

Income: annual salary or pension income (as in Form 16; pension is salary; employer NPS is part of it); optional other income; optional basic salary plus DA (needed only for HRA and employer NPS). Deductions (Step 2, collapsed by default, labelled old regime unless stated): section 123 (80C) amount, own NPS, health insurance for self/family, health insurance for parents with an age choice, professional tax, self-occupied home loan interest with the purpose choice, an HRA helper. Advanced: employer NPS with a Government-employer checkbox, and "Other eligible old-regime deductions" with a plain statement that eligibility and limits are not checked.

An amount above a limit is **not an error**: the used amount and the limit are shown ("You entered ₹2,00,000; the limit applied is ₹1,50,000").

## HRA helper

Computed from rule 279 for the common case, full year, one city, one landlord, from the basic salary plus DA field; the three amounts are shown as one worked-out exemption, which the old-regime breakdown lists. If the case does not fit (part-year, several cities), the user chooses "I know my exemption" and enters the amount. The helper's assumptions are stated on the page. Never applied in the new regime.

## Home loan scope

Self-occupied house only, old regime only, the ₹2,00,000 limit or the ₹30,000 limit chosen by loan purpose, interest "for the year" (a pre-construction instalment counts toward the same limit). A link to the Home Loan Calculator for estimating the interest. No let-out property, rent, house-property losses or carry-forward.

## Employer NPS decision

Implemented, under Advanced. The two regimes have different limits and the new regime allows it, so it is its own field. It needs the basic salary plus DA field; without it the page asks for it. Limit: 10% (old), 14% for a Central/State Government employer (old), 14% (new).

## Break-even

"At this income, the old regime would need about ₹X of total eligible exemptions and deductions (not counting the standard deduction) to match the new regime's estimated tax", with what was entered and the shortfall. **Method:** the old regime's final tax never rises when a deduction rises (a deduction only lowers total income, and the slabs, rebate and cess never fall as income rises, even across the ₹5,00,000 rebate cliff), so the smallest extra deduction that brings the old regime to no more than the new regime's tax is found by a **bisection over whole rupees**, bounded by the gross total income, at most about 30 steps; the answer is shown to the nearest ₹1,000. It is not shown when the old regime is already equal or lower. Verified: the Python reference finds the same minimum by an independent bisection and checks by brute force that one rupee less fails; a test confirms monotonicity over grids at several incomes. Above about ₹25 lakh both regimes are at 30% at the margin, so the break-even is the same constant (about ₹8 lakh).

## UX

Step 1 income (three fields), Step 2 deductions (a collapsed disclosure; the first view is not an ITR form), Step 3 the comparison. The tax year and "Rules checked on" are always visible; a "What this calculates" panel states the scope at the top. Result: two cards (New regime, Old regime) with the estimated tax, the taxable income and the effective rate; the lower one carries the words "Lower estimated tax" and a heavier border; then the difference and "Based on these inputs and assumptions, the New Regime results in an estimated ₹X lower tax." (never "you should choose"); the break-even; a collapsed breakdown (income, standard deduction, exemptions, deductions entered and used, taxable income, slab tax, rebate with a marginal-relief note, cess, final); and an assumptions line. "Rules and sources" lists the official sources with links; "What this does not cover" lists the exclusions. Each money field shows a formatted echo (₹15,00,000) under it.

## Mobile

Designed at 320 to 390 px: the two result cards stack (no wide table for the primary result), the breakdown stacks, rupee amounts wrap, disclosures and buttons are at least 44 px tall (the Reset button at least 40), inputs are 16 px so the browser does not zoom. Tested at 320, 360 and 390 px in the empty, result, deductions-open, breakdown-open, refusal and error states.

## Accessibility

Real labels, hints linked by `aria-describedby`, errors linked to their fields with `aria-invalid`; one polite status region announces a **settled** result once (after a pause, not per keystroke) with the year, both amounts and which is lower in words; the result region is not live; headings never skip a level; the steps are native `<details>` (keyboard-operable, visible focus); the winner is a word and a border, not colour alone.

## Privacy

Browser-local. No API, backend, account, storage or analytics of values (asserted: no network request carries the input; local storage, session storage and cookies stay empty).

## Trust and disclaimer

Visible, concise: an estimate for the stated tax year; the supported scope; not tax or legal advice; actual returns may differ; check complex cases against the official sources or with a qualified professional. Section numbers are those of the 2025 Act; the rebate in section 156 is the one called 87A in the earlier Act. **Known gap:** the site has no connected contact form or visible address, so a reader cannot report an error; this is recorded for follow-up (a correction channel should exist before the tool is promoted).

## Platform changes (small)

`data/tools.js` (the Coming Soon entry becomes the live tool; a documented `autoRelated` flag), `data/relationships.js` (`autoRelated: false` keeps a tool out of the automatic same-category lists, as the page and as a candidate, so GST's page is unchanged and the tool has no GST articles; its only related tool is the curated Home Loan Calculator), `src/_data/toolStyles.json`, the tool's module, engine, config and CSS. **Featured Tools, the Home hero and the header are unchanged** (a seasonal, correctness-sensitive tool does not replace an existing Featured entry). No articles and no imagery: the tool is complete without them, and a later article would have to answer a distinct question.

## Search aliases

income tax calculator, old vs new tax regime, tax regime comparison, new regime calculator, old regime calculator, salary tax calculator india, new vs old regime. Exact intents lead; GST, EMI, Date Calculator, Unix Timestamp Converter and JSON keep theirs.

## Verification

- **Independent reference** `tests/fixtures/income-tax-golden.py` (Python, exact `Fraction` rupees; the old-regime table in its cumulative statutory form and the portal's cumulative table for the new regime; rule 279 read literally; a bisection plus a brute-force minimality check) produced **238 cases**, pinned in `tests/unit/income-tax-golden.test.mjs`: every slab boundary of both regimes at 1, 5, 10, 100 and 1,000 rupees either side; the marginal-relief band; the old-regime cliff; rounding at the ₹10 step; caps each side; HRA branches; employer NPS; the ceiling; typical, old-wins, equal and break-even scenarios.
- **Unit:** the 238 cases agree; the rounding helper's exact cases; hand-worked derivations; monotonicity grids; exact-money checks; validation; the frozen configuration and its tripwire.
- **Browser** (`tests/browser/income-tax.spec.js`, desktop and mobile projects): scenario, rebate boundary, old wins, equal, ceiling, validation, HRA, new-regime isolation, caps, privacy, accessibility, three widths, the stale-year banner, and the Tax category, All Calculators, All Tools, search and related-tool isolation.
- Static links, assets, SEO and inventory; root and preview builds; DOM, links and SEO baselines; visual baselines for the tool and the listing pages that changed. No other calculator's tests and no full regression.

## Acceptance criteria

The page states its tax year and scope; every golden case agrees with the independent reference; a salary of ₹15,00,000 gives ₹97,500 (new) and ₹2,57,400 (old); ₹12,75,000 pays nothing in the new regime and ₹12,75,010 pays ₹10; ₹50,00,001 is refused with the stated message; the break-even is the smallest amount that works; GST and the loan tools are unchanged and do not list this tool as related; the Tax category lists GST and this tool with no Coming Soon card; Hostinger and production are untouched.

## Annual update (before every future tax year; never carry a constant forward)

1. Confirm the law is **enacted** (the Finance Act, not the Bill or a Budget speech) and note its date and the tax year it covers.
2. Read the Act as amended and the Finance Act's First Schedule and cess clauses from the Gazette; read the consolidated Act on incometaxindia.gov.in in a browser (it blocks automation) and compare.
3. Slabs, both regimes; basic exemptions; age bands (if seniors are ever added).
4. Standard deduction, both regimes.
5. Rebate: thresholds, maxima, marginal relief, any new condition.
6. Surcharge thresholds and the new-regime cap; decide whether the ceiling can move.
7. Cess rate and the rounding provision (s.516 or its successor).
8. Deduction caps: s.123, s.124, s.126, s.22, and the Chapter VIII aggregate rule; Schedule XV wording in the help text.
9. HRA: the Income-tax Rules rule and its city list and "salary" definition; any amendment of the Rules during the year.
10. Self-occupied home loan interest: limits, conditions, regime treatment.
11. Re-read the section map in the help text and "Rules and sources" (URLs still resolve; section numbers current).
12. New configuration object (new `validFrom`, `validThrough`, `verifiedOn`, source list); update `ACTIVE_TAX_YEAR`.
13. Update the independent Python reference from the new law (not from the old code), regenerate and re-pin the golden fixtures; investigate any disagreement before changing an expectation.
14. Update the configuration-pinning test; the staleness tripwire is moved by the new `validThrough`.
15. Update displayed copy: tax year labels, the SEO title and description, the aliases, the scope panel.
16. Run the focused tests; check the page at 320 to 390 px; verify the stale-year banner dates.
17. Watch for in-year amendments (an ordinance and four amendments to the Rules occurred in 2026) and re-verify on each.

## Known limitations

One tax year; the supported taxpayer only; no surcharge; the HRA helper covers the common case; health insurance covers the simple cases; deduction eligibility is never verified; the break-even rounds to ₹1,000; whether other software rounds the parts of the tax before the final amount is unconfirmed (at most ₹10).
