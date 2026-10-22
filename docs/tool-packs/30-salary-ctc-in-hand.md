# Tool Pack 30: Salary / CTC to In-Hand Calculator, India (Roadmap R1 item 6)

Status: **DRAFT — NOT APPROVED FOR IMPLEMENTATION.** Prepared 2026-10-22 (Phase 2: official source freeze and draft specification). The owner approved this documentation phase only; no code, route, catalog entry or test exists for this tool.
Roadmap: R1 item 6 in `docs/tool-pack-factory.md` section 10 ("feasibility-dependent: audit first"). That roadmap row is **not edited here**. Per the rulebook (section 12 lifecycle) this document is the feasibility record and a draft spec; a build needs the owner's separate approval.
Risk tier: **HIGH** (financial and tax calculation built on statutory rules; factory section 2a). A separate executable oracle is required (rulebook 8.2).
Section and category: **Calculators**, category **Tax** (same home as Tool Pack 17). Final placement is an open decision (D8).

Labels: **[VERIFIED]** read in primary official text this session; **[PROVISIONAL]** supported by an official but non-statutory source, or by a source whose text was not read in full; **[UNRESOLVED]** an interpretation or source gap that blocks the dependent behaviour; **[OUT OF SCOPE]** deliberately not modelled; **[PROPOSED]** design proposal; **[DECISION]** needs an owner decision (section 15). Nothing marked PROPOSED or DECISION is an approved rule.

## 0. Evidence record

### 0.1 Sources, and what was actually read (all retrieved 2026-10-22)

| # | Source | How it was read | Reliability |
| --- | --- | --- | --- |
| S1 | **Gazette of India, Extraordinary, Part II Sec. 3(ii), No. 4918, 17 September 2026: Ministry of Labour and Employment notification S.O. 5109(E)** (F. No. R-12025/01/2026-SS-II). PDF copy at `staffnews.in/wp-content/uploads/2026/09/MolE-Notification-Wages-Ceiling-17-09-2026.pdf` | Downloaded; text layer extracted; the English notification read in full. The file carries the Government Press digital signature. **It is hosted by a third party**; the eGazette original was not retrieved. | Primary legal text, third-party copy. Confirm on `egazette.gov.in` before release. |
| S2 | **Gazette Extraordinary No. 3447, 1 July 2026: notification S.O. 3582(E)** under the first proviso to section 16(1)(a) of the Code on Social Security, 2020 (F. No. S-35025/09/2026-SS-II) (`egazette.gov.in/WriteReadData/2026/274112.pdf`) | Downloaded from eGazette; English text read in full. | Primary legal text, official host. |
| S3 | **The Code on Social Security, 2020 (Act 36 of 2020)** (`labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf`) | Text layer extracted: sections 2(26) and proviso, 2(88), 2(89), 15, 16(1)(a) and (b). | Primary legal text. |
| S4 | **PIB releases, Ministry of Labour and Employment:** ID 2310973 (16 Sep 2026, Delhi), ID 2313829 (23 Sep 2026, Kolkata/EPFO Berhampore), ID 2314111 (23 Sep 2026, Imphal/EPFO) | HTML retrieved and read directly. | Official press statements. **They are not the Gazette text**, and the two regional briefings are paraphrases of the scheme. |
| S5 | **MoLE "FAQs on Labour Codes"** (`labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf`, FAQ of 30 Dec 2025) and **"Additional FAQs on Labour Codes (as on 16.03.2026)"** (`labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf`) | Downloaded; text extracted; Q1-Q8 of the first and the "total remuneration" entries of the second read. | Official clarification, not law. |
| S6 | **Code on Wages, 2019, section 2(y)** at the URL the owner supplied (`labour.gov.in/sites/default/files/the_code_on_wages_2019_no._29_of_2019.pdf`) | **HTTP 404 on 2026-10-22. Not read from that host.** The ministry FAQs (S5) quote and apply 2(y); the corresponding definition for provident fund purposes, section 2(88) of the Code on Social Security (S3), was read in full. | **Gap recorded** (section 0.4, item 3). |
| S7 | **Social Security (Central) Rules, 2026**, G.S.R. 344(E), 8 May 2026 (`labour.gov.in/static/uploads/2026/05/49aa9b62c2125499c37399b90e969d67.pdf`) | Text extracted and searched for contribution rates and wage ceiling: **no contribution rate or ceiling is set there**. | Primary. Negative result only. |
| S8 | **Tool Pack 17 specification, engine and configuration** (`docs/tool-packs/17-income-tax-regime-comparison.md`, `assets/js/calculators/formulas/income-tax.js`, `income-tax-config.js`) | Read in this session. Its source freeze (Income-tax Act, 2025; Finance Act, 2026; Income-tax Rules, 2026) was **carried forward**, not re-read; its `verifiedOn` is 2026-10-07. | Verified by TP17 on its date. |
| S9 | Law-firm and payroll commentary (EY, KPMG, Taxmann, Khaitan, payroll vendors) on the **Employees' Provident Funds Scheme, 2026** (notified 29 June 2026 per commentary) | Search summaries only. | Third party. **The scheme's Gazette text was not read.** |
| S10 | Competitor calculators: Flexiple, Weekday, Wisemonk (section 17) | Page text only; no mobile test. | Observation, not law. |

### 0.2 Verified findings

1. **[VERIFIED] Wage ceiling (S1).** S.O. 5109(E), "in exercise of the powers conferred by clause (89) of section 2 of the Code on Social Security, 2020", supersedes S.O. 2702(E) of 29 May 2026 (except things done before) and "notifies rupees twenty-five thousand (25,000) per month as the wage ceiling for the purposes of Chapter III of the said Code, **with effect from the date of publication** in the Official Gazette". Publication date: 17 September 2026. So the ceiling is ₹25,000 per month from 17 September 2026.
2. **[VERIFIED] What a "wage ceiling" is (S3).** Section 2(89): "such amount of wages as may be notified by the Central Government, for the purposes of becoming a member under Chapter III and Chapter IV". It is a **membership-eligibility** threshold. The notification itself says nothing about contribution amounts.
3. **[VERIFIED] The ceiling does not limit the Provident Fund Scheme's "employee" (S3, section 2(26) first proviso).** For Chapter III "**except in case of the Employees' Provident Fund Scheme** and Chapter IV", an employee means one drawing wages at or below the wage ceiling. The statute therefore keeps the Provident Fund Scheme outside that proviso; how the ceiling then limits **contributions** is a matter of the scheme text (not read, 0.4 item 1).
4. **[VERIFIED] Contribution rate (S2, S3).** Section 16(1)(a): the employer pays 10% of wages, the employee's contribution equals the employer's and "may, if any employee so desires, be an amount exceeding" it, and the employer is not obliged to match more. S.O. 3582(E) (1 July 2026, deemed in force from 21 November 2025) specifies **twelve per cent** for the employer and employees of establishments covered under section 1(4), (5) and (6) of the Code, "of Employees' Provident Funds Scheme, 2026", except: establishments under an approved insolvency resolution or repayment plan, and the jute, beedi, brick, coir (non-spinning) and guar-gum industries (those stay at the statutory 10%).
5. **[VERIFIED] Pension share (S3).** Section 16(1)(b)(i): the sums paid into the Pension Fund from the employer's contribution are "not exceeding eight and one-third per cent of the wages **or such per cent of wages as may be notified**".
6. **[VERIFIED] Definition of wages for the Social Security Code (S3, section 2(88)).** "All remuneration ... includes basic pay, dearness allowance and retaining allowance"; excludes, among others, employer contributions to a pension or provident fund (c), house rent allowance (f), overtime (h), commission (i), gratuity payable on termination (j) and retrenchment or other retirement benefits (k); and the **first proviso**: where payments under sub-clauses (a) to (i) exceed one-half, or such other percentage as notified, of all remuneration, the excess "shall be deemed as remuneration and shall be accordingly added in wages".
7. **[PROVISIONAL] What the proviso counts (S5, official clarification).** Total remuneration for the 50% test: employer PF and pension contributions and statutory bonus are included; gratuity, ESI and other retirement benefits are **not**; "performance based incentives, ESOPs, variable part of the component or reimbursement-based payments ... shall not be part of the wages"; overtime forms part of the test. The ministry's illustration: remuneration ₹76,000, basic ₹20,000, allowances ₹40,000, gratuity and retrenchment ₹16,000; the allowance cap is 50% of ₹76,000 = ₹38,000; ₹2,000 is added back; statutory wages become ₹22,000. This is a clarification, not statute.
8. **[PROVISIONAL] Press statements on the ceiling (S4).** The ceiling for mandatory EPFO coverage rises from ₹15,000 to ₹25,000 per month with effect from 17 September 2026 (the Cabinet decision was 16 September); employees "joining an establishment at wages above Rs. 15,000 ... are not automatically covered" under the old arrangement; EPFO officers state that, for employees whose contributions were restricted to the ₹15,000 ceiling, "the wage ceiling for monthly contributions shall be enhanced to ₹25,000 per month **or the actual salary/wages, whichever is lower**, subject to the applicable statutory provisions and scheme rules"; and the maximum monthly employer pension contribution at 8.33% moves from ₹1,250 to ₹2,083 (8.33% of ₹25,000). The contribution-basis statement comes from a regional press meet, not from the scheme text.
9. **[VERIFIED, carried forward from TP17] Tax for tax year 2026-27 (S8).** Income-tax Act, 2025 in force from 1 April 2026; new-regime slabs (nil to ₹4 lakh, then 5% to ₹8L, 10% to ₹12L, 15% to ₹16L, 20% to ₹20L, 25% to ₹24L, 30% above); old-regime slabs (under 60) nil to ₹2.5L, 5% to ₹5L, 20% to ₹10L, 30% above; standard deduction ₹75,000 (new, s.19(1) Table Sl. 2 with s.202(1)) and ₹50,000 (old); rebate s.156 (new: total income up to ₹12 lakh, lesser of tax or ₹60,000, with marginal relief; old: up to ₹5 lakh, up to ₹12,500); 4% cess; professional tax deductible from salary in the old regime and disallowed in the new (s.19(1) Table Sl. 1; s.202(2)(a)(iv)); 80C-type cap ₹1,50,000 (s.123); rounding to the nearest ten rupees (s.516). Supported taxpayer: resident individual under 60, salary plus other income up to ₹50 lakh, so surcharge cannot apply. TP17's configuration is valid 2026-04-01 to 2027-03-31.

### 0.3 Evidence conflicts and caveats (reported, not resolved by choosing a convenient reading)

1. **Ceiling for membership against the base for contributions.** The statute and the Gazette fix a membership ceiling. Commentary and the EPFO regional press meet describe the contribution base as "₹25,000 or actual wages, whichever is lower". Commentary on the 2026 scheme also says the older ceiling and 12% rates continued (before 17 September). Employers may contribute on full basic by choice. The tool must therefore separate "the statutory contribution base" from "the base your employer actually uses" (section 5).
2. **A mid-year change.** The ceiling changed on 17 September 2026, part-way through tax year 2026-27. The Gazette says "with effect from the date of publication"; it prescribes no split for the month of September (commentary notes this gap). The tool therefore models a **run-rate at the current ceiling** and says so (D4).
3. **Code on Wages against the Code on Social Security.** The owner pointed to Code on Wages section 2(y); the ministry FAQs apply it to all four Codes, and the text read here is the parallel definition in section 2(88) of the Code on Social Security. The two are described by the FAQ as the same definition; the 2(y) text itself was not read (S6).
4. **Two-source conflicts on administrative charges and EDLI.** Commentary disagrees on employer-only charges (EPF administrative charge, EDLI). They are employer cost and are **not** modelled; they enter only through the user's "other employer costs" amount.
5. **The Code and the 1952 Act.** The Gazette notifications cite the Code; commentary says the Employees' Provident Funds Scheme, 2026 replaced the 1952 scheme. The scheme text was not read, so paragraph-level statements (for example voluntary contributions above the ceiling) are not recorded as rules.

### 0.4 Open blockers (resolve before the dependent behaviour is implemented)

1. **[UNRESOLVED] Employees' Provident Funds Scheme, 2026 text** (and the Employees' Pension Scheme, 2026): the paragraphs on the wage on which contributions are calculated, contributions above the ceiling, and treatment of the September 2026 transition. Until read, the "capped at the ceiling" PF option is labelled a **common arrangement** and not a statutory entitlement.
2. **[UNRESOLVED] Whether the Central Government has notified a percentage other than 50%** under the first proviso to section 2(88). Not found in this session; a negative result from searches is not proof.
3. **[UNRESOLVED] Code on Wages section 2(y) text** from an official host (the supplied URL returned 404).
4. **[UNRESOLVED] Employer contribution tax limit** under the Income-tax Act, 2025 (the former ₹7.5 lakh aggregate limit for employer contributions to provident fund, NPS and superannuation, and tax on interest above the employee contribution threshold). Not part of TP17's source freeze. Mitigation in P0: see the CTC cap (section 3).
5. **[UNRESOLVED] Professional tax by state.** State laws; sources conflict (Karnataka, Tamil Nadu). **[OUT OF SCOPE]** for P0 because it is user-entered.
6. **[UNRESOLVED] Gratuity accrual convention in CTC.** Employer practice only. The 15/26 × 1/12 formula is the Payment of Gratuity Act convention and is shown as an assumption; it is **not** the Gratuity Calculator's legal model (Tool Pack 29, whose own blockers B6 and D8 remain open and are not depended on).
7. **[UNRESOLVED] Tax rules re-check at build time.** TP17 records that an ordinance and four amendments to the Rules occurred in 2026; its sources must be re-verified before TP30 is built.

## 1. Tool identity

- **Public name (proposed):** Salary / CTC to In-Hand Calculator (India).
- **Id and route (proposed, D8):** `salary-in-hand`, `/calculators/salary-in-hand/`; Calculators, Tax. Confirm that the id is unused at implementation.
- **Product job:** "Given my annual CTC and how my employer builds my salary, what is my estimated take-home pay?" It explains **what is employer cost and not cash**, what is deducted from the employee, and the estimated income tax. Decision support, not a payslip, not payroll advice.
- **Why it still matters in the AI era (rulebook 1.4):** an exact, deterministic, sourced breakdown that reconciles to the rupee, on a tax engine with 238 independent golden cases, without sending salary data anywhere.
- **Not** an individual payslip, a TDS statement or a tax-filing tool.

## 2. User problem, jobs and users

- **Problem:** CTC, gross, taxable income and take-home are different numbers; offers quote CTC; the cash arriving each month is lower and employer-dependent.
- **Jobs:** (1) compare an offer's CTC with expected take-home; (2) see what happens in the new and old regimes; (3) understand why gross and CTC differ; (4) sanity-check a revised salary.
- **Users:** salaried employees in India under 60, in an organised-sector job, resident, with one employer for the year.
- **Repeat use:** occasional (offers, appraisals). A **hypothesis**; no demand or retention data exists.

## 3. Scope and exclusions

**P0 [PROPOSED]**

- Annual CTC (₹), basic salary as % of CTC, PF basis choice, gratuity-in-CTC choice, optional other employer-only costs, optional professional tax (annual ₹, visible, default 0).
- New-regime estimated take-home as the primary result (annual, and average monthly).
- Old-regime take-home beside it, clearly qualified (section 10).
- Breakdown: employer cost not paid in cash, employee deductions, tax, take-home; visible assumptions, tax year, "verified on" date and sources.
- Automatic results, Reset, stale-result safeguards (rulebook 7.9).

**P1 [PROPOSED]** state professional-tax table (after official gazettes are read), variable pay and bonus handling, two-offer comparison, copy summary, editable gratuity amount, informational note on the 50% rule, voluntary PF above 12%.

**P2 / excluded [OUT OF SCOPE]** payslip-grade modelling, ESI, LTA and flexible-benefit plans, ESOPs, joining or leaving mid-year, multiple employers, arrears, employer NPS (TP17 supports it; not in P0), incomes above TP17's ceiling, surcharge, seniors, non-residents, other income, house-property loss, currency conversion, share links, saved data.

**Input cap for P0 [PROPOSED]:** annual CTC up to **₹50,00,000**, TP17's supported ceiling. With CTC at most ₹50 lakh the employer PF (at most 12% of CTC) cannot exceed ₹6 lakh, which keeps P0 clear of employer-contribution tax limits (0.4 item 4) without modelling them. A CTC above the cap is refused with TP17's wording style, never approximated.

## 4. Inputs [PROPOSED]

| Field | Type | Rule |
| --- | --- | --- |
| Annual CTC | whole rupees, > 0, <= ₹50,00,000 | Required |
| Basic salary as % of CTC | number, 1 to 100, at most two decimals | **Required, no default** (D1). Help: employers choose it; the Codes' wage definition and 50% rule influence statutory wages but do not set a legal basic percentage |
| PF basis | choice: `full-basic` (12% of actual basic), `capped` (12% of basic up to the monthly wage ceiling), `none` | **Required choice** (D2). `capped` uses the ceiling from the annual configuration |
| Gratuity allowance is part of CTC | choice: yes / no | **Required choice** (D3) |
| Other employer-only costs in CTC (insurance, administrative or EDLI charges and similar), per year | whole rupees, >= 0 | Optional, default 0, shown |
| Professional tax per year | whole rupees, >= 0 | Optional, default 0, shown as "not included until you enter it" (D5) |
| Old regime (optional group): HRA received per year, rent paid per year, metro city, other 80C investments | whole rupees | Optional; progressive disclosure |

Inputs are whole rupees for amounts (TP17's engine requires integers). Percentages are the only non-integers and are converted to paise arithmetic inside the engine (section 6).

## 5. Outputs and what each figure means

| Figure | Meaning | Is it cash to the employee? |
| --- | --- | --- |
| Annual CTC | Employer's total yearly cost of employing the person, as the employer quotes it | n/a (cost) |
| Employer PF (EPF plus EPS share) | Employer's contribution to the provident and pension funds | No |
| Gratuity allowance | Employer's accrual towards gratuity, if the CTC includes it | No (payable on leaving, under conditions) |
| Other employer-only costs | As entered | No |
| **Gross salary** | CTC minus the three lines above: the salary the employer pays the employee before employee deductions | Before deductions |
| Employee PF | The employee's own provident fund contribution | Deducted |
| Professional tax | As entered | Deducted |
| Estimated income tax | TP17 engine result for the regime shown, including cess | Deducted |
| **Estimated annual take-home** | Gross salary minus employee PF, professional tax and estimated income tax | Yes |
| Average monthly take-home | Annual take-home divided by 12, shown to the nearest rupee, **explicitly an average** | Not a payroll deposit |

Distinctions the page must keep: employer cost, gross salary, taxable income (the engine's total income, shown for transparency only), employee deductions, estimated take-home. The page must never describe a CTC component as cash unless it is part of gross salary.

## 6. Calculation and model rules [PROPOSED]

**6.1 Order** (annual figures, whole rupees; let `P` be the monthly wage ceiling from the configuration, ₹25,000 from 17 September 2026):

1. `basic = round(CTC × basicPct / 100)`.
2. `monthlyBasic = basic / 12`.
3. PF base per month: `full-basic`: `monthlyBasic`; `capped`: `min(monthlyBasic, P)`; `none`: 0.
4. `employerPF = round(12 × PFrate × PFbase)`, with `PFrate = 12%` ([VERIFIED] for establishments covered by S.O. 3582(E); the 10% establishments are outside P0, 6.4). `employeePF = employerPF` (section 16(1)(a): the employee's contribution equals the employer's).
5. `gratuity = round(basic × 15 / 312)` if the gratuity choice is yes, else 0 ([PROVISIONAL]: the 15/26 × 1/12 convention, shown as an assumption).
6. `gross = CTC − employerPF − gratuity − otherEmployerCosts`. Refuse if `gross < basic` or `gross <= 0`.
7. The engine call (section 7) gives `finalTax` for each regime from `gross`.
8. `annualTakeHome = gross − employeePF − professionalTax − finalTax`.
9. `monthlyAverage = annualTakeHome / 12`, displayed rounded to the nearest rupee.

**6.2 Rounding.** Money is held in whole rupees at every line shown. `round` is round-half-up to the whole rupee, applied once per line, in the order above. Tax rounding is the engine's own statutory rounding (nearest ten). The displayed monthly average rounds to the nearest rupee, and the page also shows the annual figure so the average never stands alone.

**6.3 Reconciliation (required).** `CTC = takeHome + employeePF + professionalTax + finalTax + employerPF + gratuity + otherEmployerCosts`, exactly, in rupees. Because gross is defined by subtraction this holds by construction; the oracle must therefore compute **every line independently from its rule** and compare, not rely on the identity.

**6.4 Statutory wages and the rate caveat.** P0 uses the user's basic as the PF base. It does **not** apply the 50% add-back, so where the Codes would count more as wages the employer's actual PF (and gratuity) could be higher than shown; this is stated as an assumption (D12). The 10% establishments listed in S.O. 3582(E) are not detected; the page states "12% of wages" and says establishments in a few industries differ.

**6.5 Monthly against annual.** Because bonuses, joining month, changing deductions and the September 2026 ceiling change exist, **monthly figures are an average of an annual estimate**, never a promise of a payroll deposit (rulebook 8.3). Payroll tax deduction at source can be spread unevenly; this tool estimates the year's tax, not each month's deduction.

**6.6 Old regime with missing data.** The old-regime column always uses the standard deduction, professional tax and employee PF as a section-80C amount (engine-capped at ₹1,50,000), plus whatever the optional group supplies. The label says exactly which deductions were included; it does not claim the best possible old-regime result.

## 7. Tax-engine reuse contract (Tool Pack 17, not modified)

- **Interface (verified by reading):** `calculate(raw, config = ACTIVE_TAX_YEAR)` from `assets/js/calculators/formulas/income-tax.js`; also `validateInput`, `DEFAULT_INPUT`, `roundStatutory`, `FIELD_MAX`, `isWithinSupportedIncome`, and `ACTIVE_TAX_YEAR` from `income-tax-config.js`. Pure, deterministic, no DOM or clock; integer whole-rupee inputs; paise inside.
- **Returns:** `status` of `ok`, `invalid` (with `errors`) or `unsupported` (with `reason`, `ceiling`, `taxYear`); on `ok`, `old` and `new` objects each with `salaryIncome`, `grossTotalIncome`, `totalIncome`, `taxBeforeRebate`, `rebate`, `cess`, `finalTax` and `lines`, plus `comparison`, `effective` and `breakEven`.
- **Adapter (new pure function, TP30 only):** build `{ salary: gross, basicPlusDa: basic, professionalTax, section80C: employeePF + extra80C, hraReceived, rentPaid, highCity }` from the validated TP30 inputs and call `calculate` once. Leave `otherIncome`, `employerNps` and all other fields at TP17 defaults. Map `invalid` and `unsupported` to TP30 messages; never display the engine's text out of context.
- **Unsupported scenarios:** any TP30 input combination TP17 refuses (income above its ceiling, `basicPlusDa > salary`, and so on) is refused with a TP30 message and **no figure**.
- **No duplication:** TP30 contains no slab, rebate, cess, standard-deduction or rounding constant for tax. Annual PF constants (rate 12%, ceiling ₹25,000) live in a TP30 configuration object with `validFrom`, `verifiedOn` and sources, separate from TP17's.
- **Dependency policy:** TP30 imports TP17's engine unchanged. A TP17 change that alters outputs breaks TP30's pinned examples deliberately, and both are re-verified together. TP17 is not refactored for TP30; if the engine ever needs a change, it is a separate approved phase.
- **Gap to confirm at build time:** the engine's `validateInput` rejects non-integers; the adapter must round first (6.2) and never pass fractions.

## 8. Calculation examples (illustrative, not golden)

Computed with the real TP17 engine for the tax lines and by hand for the rest, on 2026-10-22, to show the shape. **They are not golden values**: golden cases must come from the independent oracle (section 12).

| Case | CTC | Basic % | PF basis | Gratuity | Prof. tax | Employer PF | Gratuity | Gross | New: tax / annual / avg month | Old: tax / annual / avg month |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | ₹12,00,000 | 50 | capped | yes | ₹2,400 | ₹36,000 | ₹28,846 | ₹11,35,154 | ₹0 / ₹10,96,754 / ₹91,396 | ₹1,31,590 / ₹9,65,164 / ₹80,430 |
| B | ₹12,00,000 | 50 | full basic | yes | ₹2,400 | ₹72,000 | ₹28,846 | ₹10,99,154 | ₹0 / ₹10,24,754 / ₹85,396 | ₹1,11,750 / ₹9,13,004 / ₹76,084 |
| C | ₹20,00,000 | 50 | capped | no | ₹2,500 | ₹36,000 | ₹0 | ₹19,64,000 | ₹1,84,910 / ₹17,40,590 / ₹1,45,049 | ₹3,90,160 / ₹15,35,340 / ₹1,27,945 |
| D | ₹6,00,000 | 40 | full basic | no | ₹0 | ₹28,800 | ₹0 | ₹5,71,200 | ₹0 / ₹5,42,400 / ₹45,200 | ₹0 / ₹5,42,400 / ₹45,200 |

Hand check of A, new regime: PF base = min(₹50,000, ₹25,000) = ₹25,000 per month, employer PF = 12% × ₹25,000 × 12 = ₹36,000; gratuity = ₹6,00,000 × 15/312 = ₹28,846.15, rounded ₹28,846; gross = ₹12,00,000 − ₹36,000 − ₹28,846 = ₹11,35,154; taxable salary after the ₹75,000 standard deduction = ₹10,60,154; slab tax = ₹20,000 + ₹26,015.4 = ₹46,015.4, which is below the ₹60,000 rebate, so tax = ₹0 (total income is under ₹12 lakh). Old regime, hand check: ₹11,35,154 − ₹50,000 − ₹2,400 = ₹10,82,754; less ₹36,000 (employee PF as 80C) = ₹10,46,754; slab tax ₹12,500 + ₹1,00,000 + 30% × ₹46,754 = ₹1,26,526; with 4% cess ₹1,31,587; the engine's statutory rounding gives ₹1,31,590. Cases A and B show that the PF basis alone moves monthly take-home by about ₹6,000 in the new regime; the page must make that visible.

## 9. Assumptions shown next to the result [PROPOSED]

Tax year 2026-27 and the "verified on" date; resident individual under 60; salary from one employer for the whole year; 12% provident fund contribution (with the note on 10% establishments); the PF basis selected; the wage ceiling used (₹25,000 per month from 17 September 2026, applied as a run-rate); gratuity accrued at 15/26 of a month's basic per year if selected; professional tax as entered; no other income, surcharge, employer NPS, ESI, bonus or variable pay; monthly figures are averages; "an estimate, not your payslip".

## 10. UX specification [PROPOSED]

- **Flow:** answer a few starting questions; the result appears when all required inputs are valid; optional groups ("Professional tax and other employer costs", "Old regime details") are collapsed disclosures.
- **Automatic results (rulebook 7.9):** no Calculate button. Choices and committed fields evaluate at once; typed amounts debounce at 600 ms (Gratuity's tested value). While required inputs are missing the result area says what is still needed; it never shows a partial figure. An earlier result that no longer matches the inputs is dimmed and labelled "Out of date. These figures are not your current estimate." (the label pattern already approved for Tool Pack 29; reuse needs the same owner wording decision). Reset clears everything and cancels pending updates. Focus never moves on an automatic update; one polite status region announces a settled result, not each keystroke.
- **Result hierarchy:** (1) estimated monthly average and annual take-home for the new regime, labelled as estimates; (2) the reconciliation as a table: CTC, then "not paid to you as cash" (employer PF, gratuity, other), then gross, then deductions, then take-home; (3) the old-regime figure, qualified; (4) the assumptions and sources panel with the tax year and verification date; (5) a link to the regime comparison for a full tax view.
- **Errors and refusals:** specific and located (rulebook 8.6): CTC above ₹50 lakh, basic larger than gross, non-numeric entries, unsupported TP17 cases; input stays editable.
- **Mobile:** 320, 360 and 390 px, no horizontal page scroll, controls at least 44 px, the breakdown as a real table that scrolls inside its own region if needed. **Accessibility:** labelled fields with linked hints and errors, visible focus, a real table, state never conveyed by colour alone, `prefers-reduced-motion`.
- **Privacy:** all computation in the browser; nothing stored or sent; no saved inputs (rulebook 7.7, 8.8).
- **Copy:** neutral and cautious. No "best", "exact payslip" or tax-advice claims; the disclaimer follows TP17's tone.

## 11. Integration, search and relationships [PROPOSED; nothing changed now]

- **Section/category:** Calculators, Tax. **Related (rule 6.3):** a curated link to the Old vs New Tax Regime Calculator (Tool Pack 17) and the reverse only if the owner approves editing TP17's related list in the integration phase. **No relation to the Gratuity Calculator** until it is released.
- **Aliases to test both ways (rulebook 5.4):** "ctc to in hand", "in hand salary", "take home salary", "salary calculator" must not take the lead on existing tools' queries.
- **Touch-list** follows `docs/tool-pack-factory.md` section 7 at integration time (catalog, styles, pinned expectations, baselines, inventory). The catalog's `autoRelated: false` pattern and the central breadcrumb are used as for other tools. No sidebar, no new section, no URL change.
- **Preserved:** every existing URL, TP17 and its tests, Gratuity, World Clock.

## 12. Test strategy [PROPOSED; HIGH tier; nothing has been run]

- **Independent oracle (new):** a separate executable reference (Python with exact `Fraction`, as TP17's), written from this specification and the source register, not from the new JavaScript. It computes every line in 6.1 independently, including the PF base, the gratuity formula, rounding and the reconciliation, and calls its own tax reference for the tax part (or reuses TP17's pinned golden cases for the tax lines).
- **Golden cases from the oracle:** a CTC grid; both regimes; basic % grid including 1, 25, 40, 50, 100; each PF basis; gratuity yes and no; professional tax 0, ₹2,400, ₹2,500; other employer costs; old-regime optional group.
- **Boundaries:** monthly basic at ₹24,999, ₹25,000, ₹25,001 (the ceiling) for `capped`; the ₹12 lakh and ₹12,75,000-style rebate edges applied to the **gross-derived taxable salary**, not to CTC; CTC at ₹50 lakh and ₹50,00,001 (refused); basic equal to gross; gratuity rounding at half a rupee; `none` PF.
- **Invariants:** reconciliation exact; take-home never exceeds gross; monotonicity in CTC; annual ÷ 12 consistency; employee PF equals employer PF; no fractional rupee displayed.
- **Adapter tests:** unit tests of the adapter and message mapping, using TP17's engine as a dependency (TP17's own 238-case suite is not rerun here).
- **Browser (bounded, remote):** automatic calculation after required inputs; no intermediate or partial figure; the out-of-date label at 320, 360 and 390 px; Reset during a pending update; keyboard flow; no focus jumps; overflow checks; accessibility roles. Use the same temporary-branch, read-only workflow pattern already used for Gratuity: one worker, zero retries, no snapshot regeneration, no broad regression until the approved milestone.
- **Local checks:** focused `node --test` on the pure modules only (never the full build on this machine).

## 13. Maintenance and release gates

**Annual review (before each tax year, and on any in-year amendment):** TP17's annual update procedure first (its steps 1-17); then: the provident fund rate and any notified percentage (S.O. 3582(E) successors); the wage ceiling (changed in-year in 2026, so also watch notifications); the pension share; the wages proviso percentage; the gratuity convention; the cap in 3; the "verified on" date and a staleness tripwire like TP17's `validThrough`. A new configuration object is added for each year; constants are never carried forward silently.

**Source review owner:** the project owner, with a calendar reminder at 1 April and on any EPFO or Ministry notification.

**Gates before an implementation phase starts (D-items resolved):** the owner's decisions D1-D12 (section 15); the Employees' Provident Funds Scheme, 2026 text read for the contribution base and transition (0.4 item 1); the 50% percentage check (0.4 item 2); TP17's tax sources re-verified at build time (0.4 item 7); the eGazette original of S.O. 5109(E) confirmed (S1).

**Gates before production release:** the independent oracle and goldens pass; bounded remote browser verification passes; owner acceptance on a real Android phone; an **independent financial or payroll review of the model and wording by a qualified person** (this specification makes no claim of legal or tax approval); staging check; the owner's separate production approval (rulebook section 11). Production remains deliberately separate and untouched.

**Assumptions that must block production release if unresolved:** the PF contribution base rule (0.4 item 1) and the 50% add-back treatment (D12), because both change the headline figure.

## 14. Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| PF base or ceiling misread | Take-home off by thousands per month | Required explicit choice; scheme text read before build; labelled assumptions |
| Employer-specific CTC structure | The model does not match the user's offer | Editable inputs; "estimate, not payslip"; no default for basic % |
| Gratuity treated as an exact legal model | Misleading | Labelled employer convention; no link to the Gratuity Calculator |
| Stale rule (in-year amendment) | Wrong tax or PF | Annual and in-year review; `validThrough` tripwire; visible "verified on" date |
| Monthly figure mistaken for a payroll deposit | Mistrust | Always labelled an average; annual shown first |
| Engine coupling | A TP17 change shifts TP30 | Pinned examples; joint re-verification |
| Third-party Gazette copy | Provenance | Confirm on eGazette before build |

## 15. Open decisions

| # | Decision | Recommendation (proposal only) |
| --- | --- | --- |
| D1 | Default for "basic % of CTC" | Required entry, no default; help text explains it is employer-dependent |
| D2 | Default for the PF basis | Required choice among full basic, capped at the ceiling, none |
| D3 | Gratuity-in-CTC default | Required yes/no; accrual formula shown; editable amount in P1 |
| D4 | Convention for the 17 September 2026 ceiling change | Run-rate at the current ceiling for the whole year, stated on the page |
| D5 | Professional tax | Optional annual amount, default 0, visibly "not included"; state table in P1 only after gazettes are read |
| D6 | Old regime in P0 | Shown beside the new regime with the qualifier in 6.6; otherwise move to P1 |
| D7 | Variable pay and bonus | P1; P0 treats all CTC as fixed pay |
| D8 | Id, route and category | `salary-in-hand`, Calculators, Tax; confirm no clash |
| D9 | Monthly figure | Average of the annual estimate, nearest rupee, annual shown first |
| D10 | CTC input cap | ₹50,00,000 (TP17's ceiling) |
| D11 | Reuse of the Gratuity "Out of date" wording | Reuse the approved wording if the owner agrees it applies here |
| D12 | The 50% add-back | Not applied in P0; stated as an assumption; an informational note in P1 after legal wording review |

## 16. Implementation phases and approval gates [PROPOSED]

Each phase needs the owner's explicit approval; a written spec does not authorize a build.

1. **S1 (this document):** source freeze and draft specification. Local documentation commit only.
2. **S2 Source closure and decisions:** read the Employees' Provident Funds Scheme, 2026 and the 2(y) text from an official host; confirm S1 on eGazette; resolve D1-D12. Documentation only.
3. **S3 Pure module and oracle:** the PF configuration, the CTC model, the adapter and the independent oracle with goldens. Focused local tests. Local commit.
4. **S4 Interface:** page, styles, automatic-calculation wiring. Local commit.
5. **S5 Integration:** catalog, search, related links, baselines. Local commit.
6. **S6 Remote browser verification:** one bounded temporary-branch run; at most one status check; failures reported, not auto-fixed.
7. **S7 Preview and owner acceptance:** push to the development preview only with approval; Android acceptance by the owner.
8. **S8 Release:** independent review, staging, production, each with its own approval.

## 17. Competitor observations (2026-10-22; page text only, no mobile testing, no complaint research)

- **Flexiple in-hand salary calculator:** inputs CTC, basic % (default 40), variable %, state, metro, rent, old-regime deductions; both regimes shown; recalculates automatically; shareable link; states that calculations run in the browser; no formal sources or disclaimers; no Reset described.
- **Weekday in-hand salary calculator:** CTC, basic %, regime, PF option (12% of full basic, 12% of ₹25,000, none), gratuity checkbox (4.81% of basic), professional tax amount; compare two offers; mentions the labour-code 50% basic rule; no formal disclaimer or primary sources.
- **Wisemonk salary calculator:** gross salary and currency; Calculate button; new regime only; full breakdown behind a name-and-email form; mixed tax-year labels.
- **Opportunity [INFERRED]:** a calculator that shows primary sources and a verification date, reconciles every line to the CTC, explains what is not cash, and never gates the result. Differences in basic-% defaults (40% against 50%) show why the tool must not hide them. No competitor traffic, retention or complaint data was gathered.

## 18. Source URLs

- S1: https://www.staffnews.in/wp-content/uploads/2026/09/MolE-Notification-Wages-Ceiling-17-09-2026.pdf (third-party copy of Gazette No. 4918)
- S2: https://egazette.gov.in/WriteReadData/2026/274112.pdf
- S3: https://labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf
- S4: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310973, ...PRID=2313829, ...PRID=2314111
- S5: https://labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf and https://labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf
- S6 (404 on 2026-10-22): https://labour.gov.in/sites/default/files/the_code_on_wages_2019_no._29_of_2019.pdf
- S7: https://labour.gov.in/static/uploads/2026/05/49aa9b62c2125499c37399b90e969d67.pdf
- S10: https://flexiple.com/tools/in-hand-salary-calculator, https://www.weekday.works/in-hand-salary-calculator, https://www.wisemonk.io/tools/salary-calculator

## 19. Implementation notes

(None yet. This section records every deviation from the plan when a build is approved.)

## 20. Commit checkpoint

Phase 2 (this document): one local documentation-only commit, `docs(salary): draft Tool Pack 30 specification`. Not pushed, not deployed. No rulebook change; no roadmap change.
