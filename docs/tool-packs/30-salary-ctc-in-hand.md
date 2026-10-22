# Tool Pack 30: Salary / CTC to In-Hand Calculator, India (Roadmap R1 item 6)

Status: **DRAFT — NOT APPROVED FOR IMPLEMENTATION.** Prepared 2026-10-22 (Phase 2: source freeze and draft specification) and updated the same day by Phase 3 (statutory source closure: sections 0.1 to 0.4, 4, 6, 15 and 16). The owner approved documentation phases only; no code, route, catalog entry or test exists for this tool, and this update grants no implementation approval.
Roadmap: R1 item 6 in `docs/tool-pack-factory.md` section 10 ("feasibility-dependent: audit first"). That roadmap row is **not edited here**. Per the rulebook (section 12 lifecycle) this document is the feasibility record and a draft spec; a build needs the owner's separate approval.
Risk tier: **HIGH** (financial and tax calculation built on statutory rules; factory section 2a). A separate executable oracle is required (rulebook 8.2).
Section and category: **Calculators**, category **Tax** (same home as Tool Pack 17). Final placement is an open decision (D8).

Labels: **[VERIFIED]** read in primary official text this session; **[PROVISIONAL]** supported by an official but non-statutory source, or by a source whose text was not read in full; **[UNRESOLVED]** an interpretation or source gap that blocks the dependent behaviour; **[OUT OF SCOPE]** deliberately not modelled; **[PROPOSED]** design proposal; **[DECISION]** needs an owner decision (section 15). Nothing marked PROPOSED or DECISION is an approved rule.

## 0. Evidence record

### 0.1 Sources, and what was actually read (all retrieved 2026-10-22)

| # | Source | How it was read | Reliability |
| --- | --- | --- | --- |
| S1 | **Gazette of India, Extraordinary, Part II Sec. 3(ii), No. 4918, 17 September 2026: Ministry of Labour and Employment notification S.O. 5109(E)** (F. No. R-12025/01/2026-SS-II) (`egazette.gov.in/WriteReadData/2026/276299.pdf`; Gazette ID CG-DL-E-17092026-276299) | **Phase 3: downloaded from eGazette and read; the operative sentence is identical to the third-party copy read in Phase 2** (`staffnews.in/wp-content/uploads/2026/09/MolE-Notification-Wages-Ceiling-17-09-2026.pdf`). | Primary legal text, official host. |
| S2 | **Gazette Extraordinary No. 3447, 1 July 2026: notification S.O. 3582(E)** under the first proviso to section 16(1)(a) of the Code on Social Security, 2020 (F. No. S-35025/09/2026-SS-II) (`egazette.gov.in/WriteReadData/2026/274112.pdf`) | Downloaded from eGazette; English text read in full. | Primary legal text, official host. |
| S3 | **The Code on Social Security, 2020 (Act 36 of 2020)** (`labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf`) | Text layer extracted: sections 2(26) and proviso, 2(88), 2(89), 15, 16(1)(a) and (b). | Primary legal text. |
| S4 | **PIB releases, Ministry of Labour and Employment:** ID 2310973 (16 Sep 2026, Delhi), ID 2313829 (23 Sep 2026, Kolkata/EPFO Berhampore), ID 2314111 (23 Sep 2026, Imphal/EPFO) | HTML retrieved and read directly. | Official press statements. **They are not the Gazette text**, and the two regional briefings are paraphrases of the scheme. |
| S5 | **MoLE "FAQs on Labour Codes"** (`labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf`, FAQ of 30 Dec 2025) and **"Additional FAQs on Labour Codes (as on 16.03.2026)"** (`labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf`) | Downloaded; text extracted; Q1-Q8 of the first and the "total remuneration" entries of the second read. | Official clarification, not law. |
| S6 | **Code on Wages, 2019, section 2(y)** | **Not obtained.** Four routes failed on 2026-10-22: the owner-supplied labour.gov.in URL (HTTP 404), the labour.gov.in alternative file name (404), `indiacode.nic.in/bitstream/123456789/15793/1/aA2019-29.pdf` (HTTP 504 twice) and `vvgnli.gov.in` (no response). The ministry FAQs (S5) apply 2(y) and say one definition applies across the four Codes; the corresponding section 2(88) of the Code on Social Security (S3) was read in full. | **Gap recorded** (0.4 item 3). |
| S7 | **Social Security (Central) Rules, 2026**, G.S.R. 344(E), 8 May 2026 (`labour.gov.in/static/uploads/2026/05/49aa9b62c2125499c37399b90e969d67.pdf`) | Text extracted and searched for contribution rates and wage ceiling: **no contribution rate or ceiling is set there**. | Primary. Negative result only. |
| S8 | **Tool Pack 17 specification, engine and configuration** (`docs/tool-packs/17-income-tax-regime-comparison.md`, `assets/js/calculators/formulas/income-tax.js`, `income-tax-config.js`) | Read in this session. Its source freeze (Income-tax Act, 2025; Finance Act, 2026; Income-tax Rules, 2026) was **carried forward**, not re-read; its `verifiedOn` is 2026-10-07. | Verified by TP17 on its date. |
| S9 | Law-firm and payroll commentary (EY, KPMG, Taxmann, Khaitan, payroll vendors) on the **Employees' Provident Funds Scheme, 2026** (notified 29 June 2026 per commentary) | Search summaries only. | Third party. Superseded by S11, the Gazette text read in Phase 3. |
| S10 | Competitor calculators: Flexiple, Weekday, Wisemonk (section 17) | Page text only; no mobile test. | Observation, not law. |
| S11 | **Employees' Provident Funds Scheme, 2026**, G.S.R. 525(E), dated 29 June 2026, Gazette ID CG-DL-E-01072026-273957 (`egazette.gov.in/WriteReadData/2026/273957.pdf`), made under section 15(1)(a) of the Code, superseding the Employees' Provident Funds Scheme, 1952 | **Phase 3: downloaded from eGazette; text extracted; paragraphs 2(f), 9, 18 and 19 read in full.** | Primary legal text, official host. |
| S12 | **Employees' Pension Scheme, 2026**, G.S.R. 527(E), 29 June 2026 (`egazette.gov.in/WriteReadData/2026/273951.pdf`) with amendments **G.S.R. 847(E), 25 September 2026** (`staffnews.in/wp-content/uploads/2026/09/276595.pdf`, third-party copy of the Gazette) and **G.S.R. 890(E), 15 October 2026** (`egazette.gov.in/WriteReadData/2026/277193.pdf`, downloaded; English text read) | Paragraph 4 and the pensionable-wage paragraphs read in the principal scheme; both amendments read in full. | Primary legal text. |
| S13 | **Income-tax Act, 2025** (`egazette.gov.in/WriteReadData/2025/265620.pdf`) | **Phase 3 re-read of selected provisions:** section 156 (rebates), the section 202(1) rate table, the section 19(1) standard-deduction table, and sections 16 and 17 (the "salary" and "perquisite" definitions, including the employer-contribution threshold). | Primary legal text. |
| S14 | Search for amendments after TP17's `verifiedOn` (2026-10-07) | Web search for any October 2026 amendment of the Income-tax Act, 2025 or Income-tax Rules, 2026: **none reported**. | Negative result from secondary reporting; the CBDT and eGazette feeds were not checked. |

### 0.2 Verified findings

1. **[VERIFIED] Wage ceiling (S1).** S.O. 5109(E), "in exercise of the powers conferred by clause (89) of section 2 of the Code on Social Security, 2020", supersedes S.O. 2702(E) of 29 May 2026 (except things done before) and "notifies rupees twenty-five thousand (25,000) per month as the wage ceiling for the purposes of Chapter III of the said Code, **with effect from the date of publication** in the Official Gazette". Publication date: 17 September 2026. So the ceiling is ₹25,000 per month from 17 September 2026.
2. **[VERIFIED] What a "wage ceiling" is (S3).** Section 2(89): "such amount of wages as may be notified by the Central Government, for the purposes of becoming a member under Chapter III and Chapter IV". It is a **membership-eligibility** threshold. The notification itself says nothing about contribution amounts.
3. **[VERIFIED] The ceiling does not limit the Provident Fund Scheme's "employee" (S3, section 2(26) first proviso).** For Chapter III "**except in case of the Employees' Provident Fund Scheme** and Chapter IV", an employee means one drawing wages at or below the wage ceiling. The statute therefore keeps the Provident Fund Scheme outside that proviso; how the ceiling limits **contributions** is set by the scheme text, read in Phase 3 (items 10 and 11).
4. **[VERIFIED] Contribution rate (S2, S3).** Section 16(1)(a): the employer pays 10% of wages, the employee's contribution equals the employer's and "may, if any employee so desires, be an amount exceeding" it, and the employer is not obliged to match more. S.O. 3582(E) (1 July 2026, deemed in force from 21 November 2025) specifies **twelve per cent** for the employer and employees of establishments covered under section 1(4), (5) and (6) of the Code, "of Employees' Provident Funds Scheme, 2026", except: establishments under an approved insolvency resolution or repayment plan, and the jute, beedi, brick, coir (non-spinning) and guar-gum industries (those stay at the statutory 10%).
5. **[VERIFIED] Pension share (S3).** Section 16(1)(b)(i): the sums paid into the Pension Fund from the employer's contribution are "not exceeding eight and one-third per cent of the wages **or such per cent of wages as may be notified**".
6. **[VERIFIED] Definition of wages for the Social Security Code (S3, section 2(88)).** "All remuneration ... includes basic pay, dearness allowance and retaining allowance"; excludes, among others, employer contributions to a pension or provident fund (c), house rent allowance (f), overtime (h), commission (i), gratuity payable on termination (j) and retrenchment or other retirement benefits (k); and the **first proviso**: where payments under sub-clauses (a) to (i) exceed one-half, or such other percentage as notified, of all remuneration, the excess "shall be deemed as remuneration and shall be accordingly added in wages".
7. **[PROVISIONAL] What the proviso counts (S5, official clarification).** Total remuneration for the 50% test: employer PF and pension contributions and statutory bonus are included; gratuity, ESI and other retirement benefits are **not**; "performance based incentives, ESOPs, variable part of the component or reimbursement-based payments ... shall not be part of the wages"; overtime forms part of the test. The ministry's illustration: remuneration ₹76,000, basic ₹20,000, allowances ₹40,000, gratuity and retrenchment ₹16,000; the allowance cap is 50% of ₹76,000 = ₹38,000; ₹2,000 is added back; statutory wages become ₹22,000. This is a clarification, not statute.
8. **[PROVISIONAL, now consistent with the Gazette texts in items 1, 10 and 12] Press statements on the ceiling (S4).** The ceiling for mandatory EPFO coverage rises from ₹15,000 to ₹25,000 per month with effect from 17 September 2026 (the Cabinet decision was 16 September); employees "joining an establishment at wages above Rs. 15,000 ... are not automatically covered" under the old arrangement; EPFO officers state that, for employees whose contributions were restricted to the ₹15,000 ceiling, "the wage ceiling for monthly contributions shall be enhanced to ₹25,000 per month **or the actual salary/wages, whichever is lower**, subject to the applicable statutory provisions and scheme rules"; and the maximum monthly employer pension contribution at 8.33% moves from ₹1,250 to ₹2,083 (8.33% of ₹25,000). The contribution-basis statement came from a regional press meet; the scheme text (item 10) now confirms the capped base.
9. **[VERIFIED, carried forward from TP17] Tax for tax year 2026-27 (S8).** Income-tax Act, 2025 in force from 1 April 2026; new-regime slabs (nil to ₹4 lakh, then 5% to ₹8L, 10% to ₹12L, 15% to ₹16L, 20% to ₹20L, 25% to ₹24L, 30% above); old-regime slabs (under 60) nil to ₹2.5L, 5% to ₹5L, 20% to ₹10L, 30% above; standard deduction ₹75,000 (new, s.19(1) Table Sl. 2 with s.202(1)) and ₹50,000 (old); rebate s.156 (new: total income up to ₹12 lakh, lesser of tax or ₹60,000, with marginal relief; old: up to ₹5 lakh, up to ₹12,500); 4% cess; professional tax deductible from salary in the old regime and disallowed in the new (s.19(1) Table Sl. 1; s.202(2)(a)(iv)); 80C-type cap ₹1,50,000 (s.123); rounding to the nearest ten rupees (s.516). Supported taxpayer: resident individual under 60, salary plus other income up to ₹50 lakh, so surcharge cannot apply. TP17's configuration is valid 2026-04-01 to 2027-03-31.

10. **[VERIFIED] The contribution base is capped at the wage ceiling (S11, paragraph 18).** 18(2): the employer's contribution is "twelve per cent of the wages payable to the employee" (ten per cent for classes of establishment notified by the Central Government) and "the employees' contribution shall be equal to the employer's". 18(3): "The contribution payable in respect of a member shall be subject to the wage ceiling limit, notified by the Central Government ... where the monthly wage of such a member exceeds the wage ceiling, the employer and employee's contribution shall be limited to the contribution payable on the wage ceiling" (subject to paragraph 9(4) and a pension-fund proviso). 18(4): contributions are calculated on wages "actually drawn or payable during the month". **18(5): each contribution is calculated to the nearest rupee, fifty paise or more counting up.**
11. **[VERIFIED] Contribution above the ceiling is optional, not statutory (S11).** Paragraph 2(f)(i): an "excluded employee" is one whose wage "at the time he is otherwise entitled to become a member of the Fund, exceeds wage ceiling". Paragraph 9(4): an employee and employer "may jointly opt in writing" to enrol such an employee "or allow him to contribute on such wages exceeding wage ceiling limit"; the employer pays the administrative charges. Paragraph 19(1) to (4): an employee "may opt to contribute on a voluntary basis, an additional contribution on wages exceeding the statutory wage ceiling at statutory rate or at any rate in excess of statutory rate"; the employer "may if he so desires" match but is "under no obligation to match"; the employer is liable for additional administrative charges on those wages; either side may reduce or stop at any time. Paragraph 9(1): every member of the 1952 scheme continues as a member. **Consequence:** "12% of the whole basic" is a voluntary or jointly agreed arrangement; it is not the statutory base; and a person whose wage exceeded the ceiling when first entitled to join may not be a member at all.
12. **[VERIFIED] Pension share and the two different "15,000" and "25,000" figures (S12).** Paragraph 4(1): "a part of contribution of eight and thirty-three hundredths per cent. of the wages of employee up to wage ceiling notified by the Central Government" goes to the Pension Fund, so the maximum is 8.33% of the notified ceiling (₹2,083 a month at ₹25,000, matching the PIB statement). Paragraph 4(2): the **Central Government's own** contribution of 1.16% of pay; G.S.R. 890(E) (15 October 2026, in force from 17 September 2026) replaces "such sum as may be specified by the Central Government" with "wages upto rupees fifteen thousand (Rs. 15,000/-) per month" and omits "and the Central Government" from the first proviso. That ₹15,000 limit therefore governs the Government's share, not the employer's or employee's, and it does not enter this calculator. G.S.R. 847(E) (25 September 2026) inserts a membership category into paragraph 7(1). The split of the employer's 12% between pension and provident fund changes no employee figure and no CTC figure, so the calculator does not show it.
13. **[VERIFIED] Employer-contribution tax threshold (S13, section 17(1)(h)).** The Income-tax Act, 2025 treats as a perquisite "aggregate amount of any contribution, in excess of ₹7,50,000 in a tax year, made to the account of the assessee by the employer" in a recognised provident fund, in the section 124(1) scheme and in an approved superannuation fund; section 17(1)(i) adds the annual accretion on that excess. With the P0 CTC cap of ₹50,00,000 the largest possible employer provident-fund contribution is 12% of CTC = ₹6,00,000, below ₹7,50,000, so P0 does not need to model it. Employer NPS is not in P0.
14. **[VERIFIED] Tax provisions re-read on 2026-10-22 (S13).** Section 202(1) rate table: nil to ₹4,00,000; 5% to ₹8,00,000; 10% to ₹12,00,000; and so on up to 30% above ₹24,00,000. Section 156(1): old-regime rebate where total income does not exceed ₹5,00,000, 100% of the tax or ₹12,500, whichever is less. Section 156(2): new-regime rebate to ₹12,00,000 (lesser of the tax or ₹60,000) with marginal relief above. Section 19(1) Table Sl. 2: standard deduction ₹75,000 or the salary, whichever is less, where tax is computed under section 202(1), and ₹50,000 otherwise. These match TP17's configuration. **Not re-read in Phase 3:** the Finance Act, 2026 old-regime slabs and cess, the Income-tax Rules, 2026 rule on HRA, and sections 123, 124 and 126; TP17's earlier reading of them stands (S8) and is re-verified at build time.

### 0.3 Evidence conflicts and caveats (reported, not resolved by choosing a convenient reading)

1. **Membership ceiling against contribution base: RESOLVED by primary text.** The Gazette fixes a membership ceiling (S1, S3); the Scheme limits the mandatory contribution to the wage ceiling (S11, 18(3)) and makes anything above it voluntary or jointly agreed (S11, 9(4) and 19). Commentary and the EPFO regional press briefing agree with this.
2. **A mid-year change.** The ceiling changed on 17 September 2026, part-way through tax year 2026-27. S1 says "with effect from the date of publication" and gives no split-month rule, and S11 18(4) calculates contributions on the wages of "the month". The calculator therefore models a **run-rate at the current ceiling** and says so (D4).
3. **Reports that the pension wage ceiling is ₹15,000.** Some summaries of G.S.R. 890(E) say the pension ceiling was "fixed at ₹15,000". The Gazette text shows the figure limits the **Central Government's** 1.16% contribution under paragraph 4(2). The employer's 8.33% is on wages up to the notified ceiling (paragraph 4(1)). Reported here because a reader could misapply the ₹15,000 to the employee's contribution.
4. **Code on Wages against the Code on Social Security.** The owner pointed to Code on Wages section 2(y); the text read here is the parallel definition in section 2(88) of the Code on Social Security, the one that governs provident fund wages. The ministry FAQs describe one definition across the four Codes. The 2(y) text itself was not obtainable (S6).
5. **Employer-only charges.** Commentary disagrees on EDLI and administrative charge rates. They are employer cost, not employee deductions, and are not modelled; they enter only through the user's "other employer costs" amount. The EDLI Scheme, 2026 (G.S.R. 526(E)) was not read. **[OUT OF SCOPE]**
6. **Mixed percentage in the 12% notification.** S.O. 3582(E) specifies twelve per cent but excludes a few industries and insolvency-plan establishments; those stay at ten per cent (S11 18(2) first proviso).

### 0.4 Source gaps and status

| # | Item | Status | Effect on the calculator |
| --- | --- | --- | --- |
| 1 | EPF/EPS scheme text on the contribution base and the ceiling | **[VERIFIED]** S11 18(2) to (5), 9(4), 19; S12 4(1) | Resolves the PF-basis structure (section 4). Details of the 17 September 2026 split month are not prescribed anywhere read (0.3 item 2) |
| 2 | Any percentage other than one-half notified under the wages proviso | **[UNRESOLVED]** Searches found none (secondary reporting only); the Social Security (Central) Rules, 2026 text contains no such percentage; the Code on Wages (Central) Rules, 2026 were not read | The 50% add-back stays at one-half in the text (D12) |
| 3 | Code on Wages 2(y) text from an official host | **[UNRESOLVED]** four routes failed (S6) | None for PF, which follows 2(88) (VERIFIED, S3) |
| 4 | Employer contribution tax threshold | **[VERIFIED]** S13 section 17(1)(h) | P0 stays under it by arithmetic (0.2 item 13) |
| 5 | Professional tax by state | **[OUT OF SCOPE]** for P0 | User-entered amount |
| 6 | Gratuity accrual convention in CTC | **[PROVISIONAL]** employer practice; the 15/26 x 1/12 formula is shown as an assumption, not as the Gratuity Calculator's legal model (Tool Pack 29's blockers B6 and D8 stay open and are not depended on) | Labelled assumption |
| 7 | Tax sources re-verification | **[PARTIAL]** 0.2 item 14 | Remainder re-read at build time |
| 8 | EDLI Scheme, 2026 and employer administrative charges | **[OUT OF SCOPE]** employer-only | Through "other employer costs" |
| 9 | Further amendments | **[UNRESOLVED by nature]** the Pension Scheme was amended twice within four months of notification | Re-verify at the start of every build phase |

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

**Input cap for P0 [PROPOSED]:** annual CTC up to **₹50,00,000**, TP17's supported ceiling. With CTC at most ₹50 lakh the employer provident-fund contribution (at most 12% of CTC, ₹6,00,000) stays below the ₹7,50,000 aggregate threshold of section 17(1)(h) of the Income-tax Act, 2025 (**[VERIFIED]**, 0.2 item 13), so P0 does not model it. A CTC above the cap is refused with TP17's wording style, never approximated.

## 4. Inputs [PROPOSED]

| Field | Type | Rule |
| --- | --- | --- |
| Annual CTC | whole rupees, > 0, <= ₹50,00,000 | Required |
| Basic salary as % of CTC | number, 1 to 100, at most two decimals | **Required, no default** (D1). Help: employers choose it; the Codes' wage definition and 50% rule influence statutory wages but do not set a legal basic percentage |
| PF basis | choice, each option with its legal description: `capped` (**the statutory contribution**: 12% of monthly wages up to the wage ceiling, EPF Scheme 2026 paragraph 18(3)); `full-basic` (**voluntary or jointly agreed**: 12% on the whole basic, with the employer matching; paragraphs 9(4) and 19; employer-dependent); `none` (**not a member**, for example an excluded employee or an establishment not covered) | **Required choice** (D2). `capped` uses the ceiling from the annual configuration. The page says that if your employer does not follow the statutory minimum, you choose the option that matches your offer letter |
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
3. PF base per month: `capped`: `min(monthlyBasic, P)`; `full-basic`: `monthlyBasic`; `none`: 0.
4. `monthlyPF = roundHalfUp(0.12 × PFbase)` to the whole rupee (**EPF Scheme 2026 paragraph 18(5): each contribution is calculated to the nearest rupee**, applied to the month); `employerPF = 12 × monthlyPF`; `employeePF = employerPF` (paragraph 18(2): the employee's contribution equals the employer's). `PFrate = 12%` (**[VERIFIED]** by S.O. 3582(E) for covered establishments; the ten per cent classes are outside P0, 6.4).
5. `gratuity = round(basic × 15 / 312)` if the gratuity choice is yes, else 0 ([PROVISIONAL]: the 15/26 × 1/12 convention, shown as an assumption).
6. `gross = CTC − employerPF − gratuity − otherEmployerCosts`. Refuse if `gross < basic` or `gross <= 0`.
7. The engine call (section 7) gives `finalTax` for each regime from `gross`.
8. `annualTakeHome = gross − employeePF − professionalTax − finalTax`.
9. `monthlyAverage = annualTakeHome / 12`, displayed rounded to the nearest rupee.

**6.2 Rounding.** Money is held in whole rupees at every line shown. `round` is round-half-up to the whole rupee, applied once per line, in the order above, **except that the PF contribution is rounded per month before multiplying by 12** (6.1 step 4). Tax rounding is the engine's own statutory rounding (nearest ten). The displayed monthly average rounds to the nearest rupee, and the page also shows the annual figure so the average never stands alone.

**6.3 Reconciliation (required).** `CTC = takeHome + employeePF + professionalTax + finalTax + employerPF + gratuity + otherEmployerCosts`, exactly, in rupees. Because gross is defined by subtraction this holds by construction; the oracle must therefore compute **every line independently from its rule** and compare, not rely on the identity.

**6.4 Statutory wages and the rate caveat.** The Scheme's "wages" are the wages defined in section 2(88) of the Code on Social Security (basic, dearness allowance and any amount added back by the one-half rule). P0 uses the user's basic as the PF base. It does **not** apply the 50% add-back, so where the add-back applies the employer's actual contribution could be higher than shown; this is stated as an assumption (D12). The ten per cent classes of S.O. 3582(E) are not detected; the page states "12% of wages" and says a few industries differ.

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

Tax year 2026-27 and the "verified on" date; resident individual under 60; salary from one employer for the whole year; 12% provident fund contribution (with the note on 10% establishments), rounded to the rupee each month; the PF basis selected and its legal description; the wage ceiling used (₹25,000 per month from 17 September 2026, applied as a run-rate); gratuity accrued at 15/26 of a month's basic per year if selected; professional tax as entered; no other income, surcharge, employer NPS, ESI, bonus or variable pay; monthly figures are averages; "an estimate, not your payslip".

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

**Gates before an implementation phase starts:** the owner's answers to D1, D2 (confirmation), D6, D11 and D12 (section 15); the remaining routine decisions are recorded as resolved by evidence; the 50% percentage check (0.4 item 2) re-run at the start of the phase; the tax sources not re-read in Phase 3 (0.2 item 14) re-read at build time; the PF and pension schemes re-checked for amendments (0.4 item 9). The scheme text and the eGazette original of S.O. 5109(E) are no longer gates: both were read in Phase 3.

**Gates before production release:** the independent oracle and goldens pass; bounded remote browser verification passes; owner acceptance on a real Android phone; an **independent financial or payroll review of the model and wording by a qualified person** (this specification makes no claim of legal or tax approval); staging check; the owner's separate production approval (rulebook section 11). Production remains deliberately separate and untouched.

**Assumptions that must block production release if unresolved:** the 50% add-back treatment (D12) and the owner's acceptance of the "required choice" PF and basic-percentage design (D1, D2), because they change the headline figure. The PF contribution base is no longer such an assumption: it is verified (0.2 items 10 and 11).

## 14. Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| PF base or ceiling misread | Take-home off by thousands per month | Required explicit choice with legal descriptions (scheme text read in Phase 3); labelled assumptions; re-check for amendments at the start of each build phase |
| Employer-specific CTC structure | The model does not match the user's offer | Editable inputs; "estimate, not payslip"; no default for basic % |
| Gratuity treated as an exact legal model | Misleading | Labelled employer convention; no link to the Gratuity Calculator |
| Stale rule (in-year amendment) | Wrong tax or PF | Annual and in-year review; `validThrough` tripwire; visible "verified on" date |
| Monthly figure mistaken for a payroll deposit | Mistrust | Always labelled an average; annual shown first |
| Engine coupling | A TP17 change shifts TP30 | Pinned examples; joint re-verification |
| Third-party Gazette copy | Provenance | Confirm on eGazette before build |

## 15. Decisions D1 to D12 (Phase 3 review)

Evidence labels refer to section 0. "Owner" means the decision is material product or legal-risk and needs the owner's answer; the others are routine inside the existing rulebook and are recorded as resolved by evidence (a resolution here is a drafting position, not an approval of implementation).

| # | Decision and options | Official evidence | Recommended position | UX impact | Financial impact | Owner? | Blocks |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | Basic salary percentage of CTC: (a) required entry, no default; (b) prefilled value labelled as an assumption | None sets a basic percentage. The one-half rule limits exclusions and adds back the excess to wages (S3 2(88), VERIFIED); competitors default to 40% or 50% and the difference changes the answer (observation) | (a) required entry; help text says employers choose it | One more required field; the result waits with a "Still needed" message | Avoids a silent default that moves the PF base and the gratuity | **Owner** (friction against trust) | The interface phase |
| D2 | PF basis: (a) required choice with the three legally described options; (b) preselect `capped` | The structure is now verified: `capped` is the statutory contribution (S11 18(3)); `full-basic` is voluntary or jointly agreed (9(4), 19); `none` covers non-members (2(f)). The evidence does **not** say which an employer uses | (a); do not preselect, because the wrong choice moves monthly take-home by about ₹6,000 in the new-regime example | A second required choice, explained in plain words | Direct (Case A against Case B, section 8) | **Owner** to confirm the stance together with D1 | The interface phase |
| D3 | Gratuity inside CTC: required yes/no, or a default | Employer practice; the 15/26 x 1/12 convention is the Payment of Gratuity Act convention and is not a CTC rule (0.4 item 6) | Required yes/no; formula shown as an assumption; editable amount in P1 | One choice | Moves gross by about 4.8% of basic | Routine, resolved | No |
| D4 | The 17 September 2026 ceiling change | S1 gives no split; S11 18(4) is monthly (0.3 item 2) | Run-rate at the current ceiling for the whole year, stated on the page | One assumption line | Small for the supported range | Routine, resolved | No |
| D5 | Professional tax | State laws; sources conflict; no gazette read (0.4 item 5) | Optional annual amount, default 0, shown as "not included until you enter it" | Optional field | Direct but user-controlled | Routine, resolved | No |
| D6 | Old regime in P0: (a) shown with the qualifier in 6.6; (b) move to P1 | Old-regime slabs, rebate and deductions verified for TP17 (S8, S13); missing user data (rent, other deductions) cannot be derived | (a), qualified, behind an optional group; fall back to (b) if the owner prefers the smaller P0 | Extra optional inputs and a qualifier | A misleading old-regime figure is the main risk | **Owner** (scope and risk) | The interface phase |
| D7 | Variable pay and bonus | The ministry says variable pay is not part of wages (S5, PROVISIONAL); tax spreading is uneven (6.5) | P1, per the rule not to widen P0 | None in P0 | Avoids a timing model | Routine, resolved | No |
| D8 | Id, route and category | `salary-in-hand` is unused in the catalog and tests (checked 2026-10-22); Calculators, Tax like TP17 | `salary-in-hand`, `/calculators/salary-in-hand/`, Calculators, Tax | None | None | Routine, resolved | No |
| D9 | Monthly figure | Contributions are monthly (S11 18(4)); tax is annual | Average of the annual estimate, nearest rupee, annual shown first, labelled an average | Clear label | Avoids a payroll-deposit claim | Routine, resolved | No |
| D10 | CTC cap | Section 17(1)(h) threshold verified (0.2 item 13); TP17's ceiling is ₹50 lakh | ₹50,00,000 | A refusal message above it | Keeps P0 clear of the threshold | Routine, resolved | No |
| D11 | Reuse of the Gratuity "Out of date" wording | The wording was approved for Tool Pack 29 only | Reuse the same text if the owner agrees | Consistent behaviour | None | **Owner** (wording) | The interface phase |
| D12 | The one-half add-back: (a) not applied in P0 and stated as an assumption; (b) apply a simple add-back test | S3 2(88) first proviso and S5 FAQs (VERIFIED/PROVISIONAL); no notified percentage found (0.4 item 2); the 2(y) text is unobtained | (a); an informational note in P1 after a legal wording review | Fewer assumptions to explain | Could understate PF and gratuity where the add-back applies | **Owner** (legal risk) | Production release; not the pure-module phase |

**Owner decisions needed now: D1 and D2 together, D6, D11 and D12.** The other seven are closed as routine decisions inside the rulebook.

## 16. Implementation phases and approval gates [PROPOSED]

Each phase needs the owner's explicit approval; a written spec does not authorize a build.

1. **S1 (done, `9f1650b`):** source freeze and draft specification.
2. **S2 (this update, Phase 3):** statutory source closure. The EPF and pension scheme texts were read; the Code on Wages 2(y) text was not obtainable; the decisions were reviewed. Documentation only; local commit.
3. **S3 Owner decisions and pure module:** the owner answers D1, D2, D6, D11 and D12; then the PF configuration, the CTC model, the adapter and the independent oracle with goldens. Focused local tests. Local commit.
4. **S4 Interface:** page, styles, automatic-calculation wiring. Local commit.
5. **S5 Integration:** catalog, search, related links, baselines. Local commit.
6. **S6 Remote browser verification:** one bounded temporary-branch run; at most one status check; failures reported, not auto-fixed.
7. **S7 Preview and owner acceptance:** push to the development preview only with approval; Android acceptance by the owner.
8. **S8 Release:** independent financial or payroll review, staging, production, each with its own approval.

## 17. Competitor observations (2026-10-22; page text only, no mobile testing, no complaint research)

- **Flexiple in-hand salary calculator:** inputs CTC, basic % (default 40), variable %, state, metro, rent, old-regime deductions; both regimes shown; recalculates automatically; shareable link; states that calculations run in the browser; no formal sources or disclaimers; no Reset described.
- **Weekday in-hand salary calculator:** CTC, basic %, regime, PF option (12% of full basic, 12% of ₹25,000, none), gratuity checkbox (4.81% of basic), professional tax amount; compare two offers; mentions the labour-code 50% basic rule; no formal disclaimer or primary sources.
- **Wisemonk salary calculator:** gross salary and currency; Calculate button; new regime only; full breakdown behind a name-and-email form; mixed tax-year labels.
- **Opportunity [INFERRED]:** a calculator that shows primary sources and a verification date, reconciles every line to the CTC, explains what is not cash, and never gates the result. Differences in basic-% defaults (40% against 50%) show why the tool must not hide them. No competitor traffic, retention or complaint data was gathered.

## 18. Source URLs

- S1 (third-party copy read in Phase 2): https://www.staffnews.in/wp-content/uploads/2026/09/MolE-Notification-Wages-Ceiling-17-09-2026.pdf
- S1 (eGazette original): https://egazette.gov.in/WriteReadData/2026/276299.pdf
- S2: https://egazette.gov.in/WriteReadData/2026/274112.pdf
- S11: https://egazette.gov.in/WriteReadData/2026/273957.pdf
- S12: https://egazette.gov.in/WriteReadData/2026/273951.pdf, https://egazette.gov.in/WriteReadData/2026/277193.pdf (G.S.R. 890(E)) and https://www.staffnews.in/wp-content/uploads/2026/09/276595.pdf (G.S.R. 847(E), third-party copy)
- S13: https://egazette.gov.in/WriteReadData/2025/265620.pdf
- S3: https://labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf
- S4: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2310973, ...PRID=2313829, ...PRID=2314111
- S5: https://labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf and https://labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf
- S6 (not obtained; owner-supplied URL returned 404 on 2026-10-22): https://labour.gov.in/sites/default/files/the_code_on_wages_2019_no._29_of_2019.pdf
- S7: https://labour.gov.in/static/uploads/2026/05/49aa9b62c2125499c37399b90e969d67.pdf
- S10: https://flexiple.com/tools/in-hand-salary-calculator, https://www.weekday.works/in-hand-salary-calculator, https://www.wisemonk.io/tools/salary-calculator

## 19. Implementation notes

(None yet. This section records every deviation from the plan when a build is approved.)

## 20. Commit checkpoint

Phase 2 (`9f1650b`): `docs(salary): draft Tool Pack 30 specification`. Phase 3 (statutory source closure): one local documentation-only commit, `docs(salary): verify statutory source assumptions`. Neither is pushed or deployed. No rulebook change; no roadmap change; no application or tax-engine code changed.
