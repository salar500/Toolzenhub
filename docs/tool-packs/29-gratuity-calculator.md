# Tool Pack 29: Gratuity Calculator, India (Roadmap R2 item 2, PROPOSED)

Status: **DRAFT specification, prepared 2026-10-20 (G1 legal verification and G2 requirements), refined 2026-10-21 (G2 final requirements refinement) and updated with the owner's decisions of 2026-10-21 (section 29.1). NOT approved. NOT implementation-ready: the final D10 choice, the four-year presentation line and the ceiling release gate remain open (section 0.4 and section 29). Nothing is implemented.**      Base commit: d31c81b      Reserved id and slug (proposed, not reserved): `gratuity` (route `/calculators/gratuity/`)
Roadmap: R2 item 2 in `docs/tool-pack-factory.md` section 10, which is PROPOSED and **does not authorize this build**. That roadmap row still says "no research done"; this document is the research record, and the row is **not** edited here (recommended follow-up for an approved documentation phase).
Risk tier: **HIGH** (legal and financial calculation; factory section 2a). A separate executable oracle is required (rulebook 8.2).
Section and category: **Calculators**, category **Tax is a provisional navigation candidate only (D5)**; the final placement is decided in G3 (section 1).

Labels used throughout: **[APPROVED]** owner decision; **[VERIFIED]** read in primary official text this session; **[CONDITIONAL]** supported but depends on a stated assumption, source gap or owner acceptance; **[BLOCKED]** may not be implemented until resolved; **[PROPOSED]** design proposal, not approved.

## 0. Evidence record

### 0.1 Sources, and what was actually read (all retrieved 2026-10-20)
| # | Source | How it was read | Reliability |
| --- | --- | --- | --- |
| S1 | **The Code on Social Security, 2020 (Act 36 of 2020)**, Gazette of India Extraordinary, 29 September 2020 (`labour.gov.in/static/uploads/2025/07/b0620548445580767b5c0d18c95c26f7.pdf`) | The PDF text layer was extracted locally and read directly: sections 2(34), 2(88), 53, 54, 55, 56, 164 and the schedule row for Chapter V as reproduced in S5. | Primary. |
| S2 | **Social Security (Central) Rules, 2026**, Gazette Extraordinary No. 310, **8 May 2026**, **G.S.R. 344(E)**, in force on publication; preamble records the draft G.S.R. 935(E) of 30 December 2025 (`labour.gov.in/static/uploads/2026/05/49aa9b62c2125499c37399b90e969d67.pdf`) | Text layer extracted and read: rules 31 to 33 (gratuity), Forms III to VI. | Primary. **Rules 31 to 34 contain no wage definition, no ceiling and no continuous-service text** (searched). |
| S3 | **MoLE "FAQs on Labour Codes"**, uploaded January 2026 and cited by S4 as "FAQ dated 30.12.2025" (`labour.gov.in/static/uploads/2026/01/de4758d5bfeffc456d7de97a801891b0.pdf`) | Text extracted and read: Q1 to Q13 (wages, 50% rule and illustration, gratuity). | Official clarification, not law. |
| S4 | **MoLE "Additional FAQs on Labour Codes (as on 16.03.2026)"** (`labour.gov.in/static/uploads/2026/03/a4ccf4c6d97c4f1f36a6d83f8c64213d.pdf`) | Read: Q1 (total remuneration), Q6, Q7, Q10, Q11, Q13, Q14, Q16, Q17, Q19. | Official clarification, not law. |
| S5 | **MoLE "Compliance Handbook for Employers under the Four Labour Codes"** (uploaded February 2026), section 6.3 and the Chapter V applicability row | Read. | Official guidance. |
| S6 | **PIB factsheet "Code on Social Security, 2020: Towards Universal and Inclusive Social Protection"** (PIB, November 2025 by its URL path) | The gratuity extracts were read. | Official summary. |
| S7 | **Gratuity ceiling:** (a) **PIB release, Ministry of Labour and Employment, 30 March 2018** ("Payment of Gratuity (Amendment) Act, 2018 brought in force on 29th March, 2018"); (b) the MoLE brief and the Income Tax Department pages cite notification **S.O. 1420(E) dated 29 March 2018**. | (a) **Read in full** (the page text was retrieved and read on 2026-10-21): the Government "has issued the notification specifying the maximum limit to Rs. 20 Lakh" for "employees who are covered under the Payment of Gratuity Act, 1972"; the Act now lets the Central Government set the limit "from time to time". The release gives **no notification number**. (b) **Seen only through search-result summaries**; the brief URL returned 404 and the gazette text of S.O. 1420(E) was **not obtained**. | (a) Official, read. (b) Official, **not read**. |
| S8 | **State draft rules** under the Code (Maharashtra, Uttarakhand, Andhra Pradesh, Odisha, Madhya Pradesh, Jammu and Kashmir) via a law-firm tracker and a legal-news site | Search summaries only. | Third party. None confirmed as final. |
| — | **Not obtained or not researched:** the Payment of Gratuity Act, 1972 text and its case law (`Mettur Beardsell` and similar), any gazette text of a notification under section 53(3) of the Code, the Income-tax Act, 2025, any 2026 notification changing the 50% percentage (searched; none found). | — | These are gaps behind sections 0.4 and 29. |

### 0.2 Verified legal findings (primary text; section references are to S1 unless stated)
- **L1 Commencement [VERIFIED by S3 Q8, S4 Q11].** Gratuity under the Code applies from **21 November 2025**, the date the Code was enforced. S4 Q17: gratuity is paid "based on the rate of wages last drawn ... at the time of superannuation or retirement or resignation or death etc, on and after 21.11.2025 as per the provisions of Code on Social Security, 2020."
- **L2 Eligibility, s.53(1).** Gratuity is payable on termination of employment "after he has rendered continuous service for not less than **five years**" on (a) superannuation, (b) retirement or resignation, (c) death or disablement due to accident or disease, (d) termination of the contract period under fixed term employment, or (e) an event notified by the Central Government. **Working journalists:** three years. **Second proviso:** five years of continuous service is **not necessary** for death, disablement, expiration of fixed term employment or notified events.
- **L3 Amount, s.53(2).** "For every completed year of service or part thereof in excess of six months", gratuity at "fifteen days' wages or such number of days as may be notified", "based on the rate of wages last drawn". Piece-rated: daily wages from the average of the three months before termination, excluding overtime. Seasonal establishment: seven days' wages for each season. **Fixed term employment or a deceased employee: "pro rata basis"** (the third proviso; no method is stated).
- **L4 Monthly-rated formula, Explanation 3.** "the fifteen days' wages shall be calculated by dividing the monthly rate of wages last drawn by him by twenty-six and multiplying the quotient by fifteen." So **monthly wages ÷ 26 × 15 per counted year** (monthly-rated employees).
- **L5 Ceiling, s.53(3).** "shall not exceed such amount as may be notified by the Central Government." S3 Q12: "The maximum gratuity is as notified by the Central Government which is currently ₹20 lakhs." See D7 and section 0.4.
- **L6 Better terms, s.53(5).** The right to better terms under an award, agreement or contract is unaffected. **Forfeiture, s.53(6):** for damage or loss caused to the employer's property (to that extent), and wholly or partly for riotous or disorderly conduct, violence, or an offence involving moral turpitude in the course of employment.
- **L7 Exclusion, Explanation 1.** An "employee" does not include a person who holds a post under the Central or a State Government and is governed by another Act or rules providing for gratuity.
- **L8 Wages, s.2(88).** Wages include basic pay, dearness allowance and retaining allowance, and exclude (a) to (k) (bonus not in remuneration, housing and amenity values, employer provident and pension contributions, conveyance, special expenses, **house rent allowance**, award or settlement remuneration, overtime, commission, gratuity, retrenchment and retirement payments). **Proviso:** if payments under exclusions (a) to (i) exceed **one-half, or such other per cent as notified**, of all remuneration, the excess is added to wages. S4 Q6: the revised definition applies to gratuity from 21.11.2025. S4 Q13: a payment outside the s.2(88) components "shall not be considered for calculation of gratuity." No notification changing the percentage was found.
- **L9 Fixed term employment, s.2(34).** "the engagement of an employee on the basis of a written contract of employment for a fixed period", with benefits "available to a permanent employee proportionately according to the period of service". S4 Q10: fixed term employment covers employees **directly engaged** by the employer. S4 Q14 and Q19: a fixed-term employee "will be eligible for gratuity if he/she renders service under the contract for a period of one year (from start of contract)". **Rule 33(1)(a), second proviso (S2):** such an employee is eligible if he "renders service under the contract for a period of **at least one year** and for subsequent period in excess of six months and more, but less than one year, shall be rounded off to one additional year." S6 and S5 section 6.3 agree on one year.
- **L10 Contract labour, S4 Q16.** The employer, "i.e. Contractor", pays gratuity "on rendering of five years continuous service at the rate of 15 days wages for each completed year of service based on the last drawn wages." A contractor's employee is therefore an ordinary (five-year) employee of the contractor, **not** a fixed-term employee unless engaged under a written fixed-term contract.
- **L11 Continuous service, s.54.** (A) uninterrupted service, including interruptions for sickness, accident, leave, lay-off, strike or lock-out, and unauthorized absence unless treated as a break under standing orders. (B) Where not in continuous service for any period of one year or six months, the employee is **deemed** to be so for **one year** if he actually worked in the preceding twelve calendar months not less than **190 days** (underground mines or establishments working under six days a week) or **240 days** (any other case), and for **six months** if he actually worked in the preceding six calendar months not less than **95** or **120** days. (C) A seasonal establishment: 75% of the days it operated.
- **L12 Payment and procedure.** s.56(3): the employer arranges payment "within thirty days from the date it becomes payable". Rule 33: the employee applies "ordinarily within a period of thirty days from the date the gratuity became payable" (Form-IV), the employer responds within fifteen days, and a late application is entertained on sufficient cause. s.55: an employee who has completed one year of service makes a nomination.
- **L13 Applicability, S5 (Chapter V row).** Every factory, mine, oilfield, plantation, port and railway company, and every shop or establishment in which **ten or more employees** are employed, or were employed, on any day of the preceding twelve months, and shops or establishments notified by the appropriate Government.
- **L14 Repeal and savings, s.164.** The Payment of Gratuity Act, 1972 is repealed. s.164(2)(a): any notification made under it is "deemed to have been done or taken ... under the corresponding provisions of this Code ... and shall be in force to the extent they are not contrary" to it. s.164(3): section 6 of the General Clauses Act, 1897 applies.

- **L15 What the 190 and 240 days of s.54(B) are (corrects the first draft).** They are tests of **days actually worked** in the twelve (or, for a six-month period, the six) calendar months **preceding the date of calculation**, applied only where the employee "is not in continuous service within the meaning of clause (A)" for a year or six months, that is, where there was an interruption. 190 days (and 95 for six months) apply only to an employee employed below ground in a mine or in an establishment that works for **less than six days in a week**; 240 days (and 120) apply in any other case. Days of lay-off, leave with full wages earned in the previous year, temporary disablement from an employment accident and up to 26 weeks of maternity leave count as days worked. **They are not thresholds of elapsed service, and nothing in s.54 defines a window "below five years".** Applying them needs attendance, the establishment's working week and any interruption, none of which the form collects.
- **L16 Rule 33(1)(a), second proviso, read with s.53 [VERIFIED text].** The proviso sits in the rule on how a gratuity application is made. Its words: eligible "if he renders service under the contract for a period of at least one year and for subsequent period in excess of six months and more, but less than one year, shall be rounded off to one additional year." It supplies a year-counting rule for fixed-term service that matches s.53(2)'s "completed year ... or part thereof in excess of six months". It does **not** state a pro-rata formula, and the drafting "in excess of six months and more" is awkward at exactly six months.
- **L17 The five-year test and the year-counting rule are different questions.** s.53(1) requires "continuous service for not less than five years" (no rounding is written into it); s.53(2) counts "completed year ... or part thereof in excess of six months" only to set the amount. A rounded count of 5 therefore does not show that the five-year condition is met.

### 0.3 Evidence conflicts found (reported, not resolved by choosing a convenient reading)
1. **The 50% rule illustration conflicts across official FAQs.** S3 Q7 gives total remuneration **₹76,000** = basic + DA ₹20,000 + allowances ₹40,000 + "other components (gratuity and retrenchment compensation)" ₹16,000; the 50% limit is ₹38,000; the excess is ₹2,000; revised wages ₹22,000. S4 Q1 says "Gratuity, ESI and other retirement benefits are not included" in remuneration. If the ₹16,000 is left out, remuneration is ₹60,000, the limit ₹30,000, the excess ₹10,000 and revised wages **₹30,000**. The two official answers produce different wages from the same facts. **Consequence: a wage-assistant that applies the 50% rule cannot be specified (BLOCKED, section 0.4 B5).**
2. **"Exactly one year" versus "at least one year" for fixed-term employees.** S4 Q14 and Q19 use the Ministry's "one year (from start of contract)"; Rule 33 says "at least one year" with rounding of a further period over six months. Treated as consistent for eligibility, but whether a fixed-term employee who **leaves before the contract ends** is covered is **not answered** (Q19's second question is not answered in the reply).
3. **Secondary sources disagree** on the ceiling (₹10 lakh, ₹20 lakh, ₹25 lakh for government employees) and on whether the Rules changed the wage definition. Only primary text and Ministry material are used here.

4. **The 190/240-day rules are not a "four years plus 190 days" threshold.** The first draft's uncertainty window starting at 4 years and 190 days merged two different things (L15). The statute's rule is about days worked in the preceding twelve months of an interrupted year; whether that rule makes an incomplete fifth year count is a **case-law question that was not reviewed**, and no official guidance read this session answers it. The status policy in section 7.3 therefore does not use 190 or 240 days as a calendar threshold.
5. **Fixed-term: Rule 33 and s.53's "pro rata" are reconcilable only by reading.** Rule 33 gives a year-counting rule; "pro rata" is undefined (L16). Section 7.5 classifies each case instead of excluding the whole category.

### 0.4 Open blockers (resolve before the dependent behaviour is implemented)
Classes: **VERIFIED** (primary text), **CONDITIONAL** (workable, but needs the stated owner acceptance, source or review), **BLOCKED** (not to be implemented until closed).
| # | Blocker | Class | Affects | Needed to close it |
| --- | --- | --- | --- | --- |
| **B1** | **Date-counting convention (D10).** Neither the Code nor the Rules says how to measure service between two calendar dates. Option A (section 7.1) is the owner's **provisional** choice and is an estimation convention, **not** a legal attendance calculation. The review found it internally consistent, but for joins on the 29th, 30th or 31st it differs from alternative C′ at a short month's end, in one case by a counted year. | CONDITIONAL | Service duration; every boundary for such joins | A final choice between A with disclosure and C′ (section 29.2), ideally confirmed in the review (D8), before G4. |
| **B2** | **Day-level "in excess of six months" (D2).** The principle is **APPROVED**: exactly six months is not "in excess"; more than six months is. "Six months and one day" is a consequence of the D10 convention, not a separate legal finding. | CONDITIONAL on B1 | Counted years | Settled together with B1. |
| **B3a** | **Fixed-term eligibility and year counting** (direct employee, contract runs to expiry, at least one year). | VERIFIED (section 7.5 F1, F2, F4) | Fixed-term guidance and status | None; F2's exactly-six-months edge follows B2. |
| **B3b** | **Fixed-term amount.** "Pro rata" is undefined; the reading in section 7.5 F3 uses the s.53(2) rate over the Rule 33 counted years and invents no other fraction. | CONDITIONAL | Fixed-term illustrative amount | Shown only as an "illustrative amount" until the review (D8) or an authoritative method confirms it. |
| **B3c** | **Fixed-term early exit and successive contracts.** s.53(1)(d) and the second proviso speak of **expiration** of fixed term employment; s.53(1)(b) (resignation) requires five years; FAQ Q19's second question is unanswered; the Rule speaks of service "under the contract". | UNSUPPORTED (no figure) | Fixed-term early exit, renewals, conversion | An authoritative answer. |
| **B4** | **Eligibility between four and five calendar years (D9).** Whether s.54(B) deeming can make an incomplete fifth year count is case-law dependent and was not reviewed; the 190/240 days are not calendar thresholds (L15). | CONDITIONAL (status policy in 7.3 never states eligibility) | Eligibility status | Professional review (D8) before any firmer wording. |
| **B5** | **Wage assistant** (the 50% rule helper). | BLOCKED, deferred | Optional helper | The two official FAQ illustrations conflict (section 0.3 item 1). |
| **B6** | **Ceiling (D7).** ₹20 lakh is **accepted for specification drafting** (owner, 2026-10-21). It rests on: the PIB release of 30 March 2018 (read), which says the notified limit is ₹20 lakh for employees covered by the 1972 Act; MoLE FAQ Q12 (read), "currently ₹20 lakhs", for the Code; and s.164(2)(a) (read), under which notifications under the repealed Act are deemed made under the Code "to the extent they are not contrary". **Not found:** the gazette text or number of the notification (S.O. 1420(E) is from summaries) and any notification under s.53(3) of the Code itself. | ACCEPTED FOR DRAFTING; **release gate retained** | The ceiling constant | Before **production release**: verify the operative notification and its applicability (gazette text), or record the owner's acceptance of the PIB, FAQ and s.164 reading as sufficient. |
| **B7** | **Death and disablement.** "Pro rata" for a deceased employee is unclear. | Excluded (D6) | Not in the estimator | Not needed for the first release. |
| **B8** | **Monetary rounding.** No rule on rounding the rupee amount was found in S1 or S2. | ACCEPTED as an estimator convention (owner, 2026-10-21) | Displayed amount | Section 7.6: half up to the nearest paisa at final display, labelled as the tool's own and separate from legal year-counting. |
| **B9** | **State rules.** Drafts were seen only in summaries; none confirmed final. s.53 sets the formula and the ceiling is notified by the **Central** Government; whether a state instrument affects an estimate is unverified. | CONDITIONAL | Applicability note | Check the gazettes, or word the page as "the central Code". |
| **B10** | **Exits before 21 November 2025.** The 1972 Act treatment was not researched in depth. | Out of scope (D4) | Explanation only | None; the tool gives no figure. |
| **B11** | **Independent payroll or legal review (D8)** has **not** been performed. | Not performed | All material interpretations | Owner decision. No claim of review may appear on the page until one exists. |
| **B12** | **Tax.** Exemption limits and the Income-tax Act, 2025 were not verified. | Deferred | Out of scope | Not in the first release. |

## 1. Tool identity
- Catalog id `gratuity` [PROPOSED]; no catalog entry exists (verified: no "gratuity" in `assets/js/data/`). Title **Gratuity Calculator (India)**; section Calculators; route `/calculators/gratuity/` by the Calculators prefix convention in `assets/js/data/taxonomy.js`.
- **Category [D5, provisional]:** the existing categories are Loans, Investment, Tax, Health, Business, Math, Converter and More. **Tax** (neighbours: Old vs New Tax Regime, GST; description "Work through tax-related calculations with clear assumptions") is the nearest fit, but gratuity is an **employee benefit, not a tax calculation**, and tax exemption is excluded, so Tax could mislead. Creating or renaming a category is an owner decision (rulebook 11.7). **Recommendation: keep Tax provisionally; decide the final category in G3 once the page wording is known.** A future "Salary / CTC to In-Hand" (R1 item 6) would sit in the same neighbourhood.
- Description (draft): "Estimate gratuity under the Code on Social Security, 2020 from your qualifying wages and service dates, with the eligibility reasoning, the formula and its assumptions shown."
- Aliases (true): gratuity calculator, gratuity calculator india, gratuity calculation, gratuity formula, gratuity eligibility. **Not**: any year, "tax free gratuity", "gratuity on death", a company name.
- Capabilities: the existing flags only, **verified against `assets/js/data/tool-capabilities.js` and the nearest calculators during implementation**; none asserted here.

## 2. User problem
An employee in India who is leaving, retiring or changing jobs wants to know roughly how much gratuity to expect and whether they qualify, and why the employer's figure may differ. Today they use calculators that are often out of date for the Labour Codes (one major legal-site calculator still shows the Code as "pending"), disagree on the ceiling and the wage base, ignore fixed-term employment, and sit among adverts. The answer matters for real decisions, so the tool must explain its basis and never overstate certainty.

## 3. Primary jobs to be done
1. "How much gratuity might I get if I leave on this date?"
2. "Do I meet the five-year condition, and if I am close, what is uncertain?"
3. "How are my years counted, and does another month change anything?"
4. "What if my qualifying wages or my exit date were different?"
5. "Why might my employer's figure be different, and what should I check?"

## 4. Target users
Salaried employees of establishments covered by Chapter V who are **regular (five-year) employees**, including employees of a contractor (L10). Directly engaged fixed-term employees whose contract expires get the one-year status and an illustrative amount (D3, section 7.5). **Not for:** government employees under other gratuity law, working journalists, seasonal or piece-rated employees, death or disablement claims, exits before 21 November 2025, tax-exemption questions.

## 5. Inputs [PROPOSED]
| Input | Rule | Why |
| --- | --- | --- |
| **Employee type** (radio) | Regular employee (including an employee of a contractor) · Fixed-term employee engaged directly by the employer · Other (government post, seasonal, piece-rated, working journalist, or something else) | Selects the rule path and keeps the five-year rule from being applied to fixed-term employees (L9, L10). |
| **Fixed-term only: how does the contract end?** (radio, shown only for the fixed-term type) | "It runs to its end (expires)" · "It ends earlier (resignation, termination or another reason)" | Section 53(1)(d) and the second proviso concern **expiration**; an earlier end is UNSUPPORTED (section 7.5). Progressive disclosure: other users never see it. |
| **Qualifying monthly wages** (₹) | Required; `inputmode="decimal"`; greater than 0; at most ₹1,00,00,000 per month (a sanity limit, confirmed in G3); two decimals. | The formula's only monetary input. |
| **Joining date** | Required; native date input; not after the exit date. For a fixed-term employee: the start of the contract. | Service measurement. |
| **Exit date** | Required; native date input; **on or after 21 November 2025** (D4); future dates allowed for planning. For a fixed-term employee: the contract end date. | Service measurement and the supported date range. |
| Calculate and Reset | Explicit Calculate (as the existing calculators); Reset clears every field. | Rulebook 7.6 and 8.6. |

**How the user finds the qualifying wages figure (D1; the hint beside the field, short form).** "Enter the monthly wages your employer counts for gratuity, **not your gross salary**. Under the Code that is basic pay + dearness allowance + retaining allowance (if you get one). If your allowances and similar payments are more than half of your total remuneration, the excess is added to wages, so the figure can be higher than basic + DA. The safest source is payroll: ask for your wages as defined in section 2(88) of the Code on Social Security, as last drawn. We do not add HRA, bonus or overtime for you." (This wording states L8; the automatic helper stays deferred, B5.)

**Deliberately left out of the first release:** years-and-months entry (P1; it removes day precision), the reason for exit for regular employees (the rule is identical for superannuation, retirement, resignation and termination), and any salary-component breakdown (B5).

## 6. Outputs
The result is built from **six separate blocks**, so an uncertain amount never reads like money owed:
1. **Eligibility explanation** (the status sentence and why).
2. **Amount, with its label set by the status** (section 7.4): "Estimated gratuity" only where the status supports it; "Illustrative amount, not an entitlement" where it does not; no amount where the case is unsupported.
3. **Statutory ceiling** (shown when it applied; always listed in the assumptions).
4. **Working** (service measured, counted years, formula with the numbers).
5. **Assumptions** (section 8).
6. **Check with your employer or payroll** (the items this form cannot decide: the wages figure, continuity of service, whether the establishment is covered, the employer's own better terms, and the fixed-term contract details).
**Not shown:** a legal verdict, tax treatment, advice on when to leave, stored history.

## 7. Calculation and model rules [PROPOSED unless marked]

### 7.1 Service-duration convention (D10) [provisional choice A; CONDITIONAL; owner choices in 29.2]
The owner provisionally chose option A on 2026-10-21. It is a deterministic **estimation convention** for a browser-local tool. It is **not** a legally mandated method, no statute or rule prescribes it, and it stays CONDITIONAL (B1) until the month-end question below is settled.
- **Calendar dates only.** Dates are read as the integers year, month, day from the `YYYY-MM-DD` value; no clock, no time zone and no local-time `Date` parsing is used, so the result cannot vary by device.
- **Both days counted.** Service covers the joining date and the exit date. Internally the end is the **day after the exit date** (the "exclusive end").
- **Anniversary A(m).** The *m*-th month anniversary of the joining date is the same day of the month *m* months later; when that month has fewer days, A(m) is the **last day of that month** (a join on the 31st has a February anniversary on the 28th or 29th; a join on 29 February has a non-leap-year anniversary on 28 February). Each A(m) is computed **from the joining date**, never from the previous anniversary.
- **Completed months** *m* = the largest *m* with A(m) on or before the exclusive end. **Years** = ⌊*m* ÷ 12⌋; **months** = *m* mod 12; **days D** = exclusive end − A(*m*).
- **The displayed Y/M/D is canonical under A.** It is unique, and it is reversible: `exclusive end = A(m) + D days` with `0 ≤ D < A(m+1) − A(m)`. The same decomposition is used for the display, the counted years and the status, so the page can never show a duration that differs from the one it calculated with.

**Consistency review (2026-10-21).** For both A and the alternative C′ below, a scratch script found **0 failures** of reversibility, of "days stay inside the gap to the next anniversary" and of monotonicity (the duration never decreases as the exit date advances) over 4,000 random date pairs and six day-by-day sweeps of 1,500 days (including joins on 31 January, 29 February, 31 August, 31 October and 30 January). All 14 regular and 5 fixed-term rows in 7.7 reproduce under A, including the 4 years 11 months 30 days row (joining 2019-01-01, exit 2023-12-30: exclusive end 2023-12-31, A(59) = 2023-12-01, 30 days remain). **This shows the arithmetic is consistent; it does not show that the convention is the legally right reading.**

**Where the convention can mislead (B1).** A and the alternative C′ give **identical results for every join on the 1st to the 28th** (0 differences in 55,304 of 60,000 random pairs), because every month has those days. They differ only for **joins on the 29th, 30th or 31st**, when the anniversary month is shorter (710 of 4,696 such pairs differ in the displayed days or months, but only 2 differ in counted years, because the six-month boundary is narrow; at the boundary dates themselves the difference is deterministic, as the table shows). Under A the missing day becomes the last day of the month, so a join on the 31st can read "1 month 1 day" for a stay that ends on the last day of a shorter month, and the same calendar days read differently in leap and non-leap years. The effect can reach the six-month boundary and so change N by one year of wages:

| Joining | Exit | Option A | Option C′ |
| --- | --- | --- | --- |
| 2019-10-31 | 2025-04-29 | 5 y 6 m 0 d (N = 5) | 5 y 5 m 30 d (N = 5) |
| 2019-10-31 | 2025-04-30 | **5 y 6 m 1 d (N = 6)** | **5 y 6 m 0 d (N = 5)** |
| 2019-10-31 | 2025-05-01 | 5 y 6 m 2 d (N = 6) | 5 y 6 m 1 d (N = 6) |
| 2019-08-31 | 2025-02-27 | 5 y 6 m 0 d (N = 5) | 5 y 5 m 28 d (N = 5) |
| 2019-08-31 | 2025-02-28 | **5 y 6 m 1 d (N = 6)** | **5 y 6 m 0 d (N = 5)** |
| 2019-08-31 | 2025-03-01 | 5 y 6 m 2 d (N = 6) | 5 y 6 m 1 d (N = 6) |
| 2020-01-31 | 2020-02-28 | 0 y 1 m 0 d | 0 y 0 m 29 d |
| 2021-01-31 | 2021-02-28 | 0 y 1 m 1 d | 0 y 1 m 0 d |

At ₹50,000 the two bold rows differ by one counted year, ₹1,73,076.92 against ₹1,44,230.77, a difference of **₹28,846.15**. Neither reading is shown to be the legal one: a joiner on the 31st who leaves at the end of April "has served six months and a day" under A and "exactly six months" under C′. **Because the choice has money consequences for these joiners, D10 stays CONDITIONAL and G4 is blocked on it.** The page, under either option, states the convention in a sentence and shows the service as "years, months, days".

### 7.2 Counted years N (the amount only) [rule VERIFIED, boundary CONDITIONAL]
`N = completed years + 1` when the remaining period is **more than six months** (remaining months of 7 to 11, or exactly 6 months and at least 1 further day); otherwise `N = completed years`. **Exactly six months and zero days is not "in excess of six months" and does not count** (s.53(2); the day-level reading is B2). N feeds only the amount. **It never feeds eligibility** (L17).

### 7.3 Eligibility status, regular employees (D9) [CONDITIONAL; wording revised 2026-10-21]
Two dates cannot prove that service was legally continuous, so no status states that the person **is** eligible. Eligibility uses the measured service, never N, and the policy **does not apply 190 or 240 days as a calendar threshold** (L15). The four-year dividing line below is a **product presentation convention, not a legal threshold**.
1. **Service of 5 years 0 months 0 days or more → "Five calendar years reached on these dates. This is subject to continuous-service and other eligibility conditions."** The explanation adds the assumption that service was continuous in the sense of s.54(A): leave, sickness, accident, lay-off, strike or lock-out do not break it, and an absence that the standing orders treat as a break can; and that the establishment is covered (L13).
2. **Service of 4 years or more but less than 5 years → "Fifth year of service: the date-based five-year threshold has not been reached, and whether a deeming rule applies cannot be determined from dates alone."** The explanation says that s.54(B) deems a year continuous if the employee actually worked at least 190 days (an establishment working under six days a week, or underground mine work) or 240 days (any other case) in the preceding twelve months; that whether this makes an incomplete fifth year count is **not something this form can decide** (it needs attendance, the establishment's working week and any interruptions) and that **no official guidance read for this tool settles it**; and it advises asking payroll. The amount appears only as an **illustrative amount**.
3. **Service of less than 4 years → "The standard date-based five-year threshold has not been reached on these dates."** No amount is shown; the milestone explorer (P1) shows the calendar five-year date. This is not a final legal determination.
s.54(B) deems a period of one year, so only the final year is in question, which is why the line sits at four years. It is PROPOSED, needs owner acceptance, and a review (D8) may move it. **Rounded years never turn a status into eligibility**: 4 years 11 months 30 days gives N = 5 for the amount and status 2.

### 7.4 Amount and ceiling [formula VERIFIED; ceiling per B6]
- **Formula (monthly-rated, Explanation 3):** `amount = wages ÷ 26 × 15 × N`, capped at the ceiling `₹20,00,000` (B6; shown with its source and date and a "may change by notification" note). The exact rational value is compared with the ceiling **before** any rounding.
- **Labels:** status 1 → "Estimated gratuity (subject to the conditions stated)"; status 2 and every fixed-term amount → "Illustrative amount, not an entitlement"; status 3 and unsupported cases → no amount. "Payable" is never used for a figure the tool computed.

### 7.5 Fixed-term employees (D3) [classified case by case]
| # | Case | Class | Behaviour |
| --- | --- | --- | --- |
| F1 | Direct fixed-term employee; the contract **runs to its end**; service under the contract is **at least one year** | **VERIFIED** (s.53(1)(d), second proviso, s.2(34), Rule 33(1)(a), MoLE Q14 and Q19, S5 and S6) | Status: "Meets the one-year condition for fixed-term employees on these dates." The five-year rule is **not** applied. |
| F2 | Counted years Y: completed years of service under the contract, plus one when the remaining period is more than six months | **VERIFIED** reading of Rule 33; the exactly-six-months edge follows B2 (treated as s.53(2): not counted) | Y feeds the amount only. |
| F3 | Amount for F1 | **CONDITIONAL** (B3b) | `wages ÷ 26 × 15 × Y`, shown as an **illustrative amount**: it applies the s.53(2) rate to the Rule 33 counted years, consistent with s.2(34)(b)'s proportionate benefit, and **invents no other fraction**. It is not called payable until a review (D8) or an authoritative method confirms it. |
| F4 | Contract ends with **less than one year** of service | **VERIFIED** (Rule 33 "at least one year"; MoLE Q19) | "Not yet at one year of service under the contract"; no amount. |
| F5 | The contract **ends earlier** (resignation, termination, other) | **UNSUPPORTED** (B3c) | A message that the outcome depends on the contract and the employer; no figure. |
| F6 | **Successive or renewed contracts**, or conversion to a permanent post | **UNSUPPORTED** (B3c) | A message that service "under the contract" is not summed by this tool; no figure. |
| F7 | A fixed-term employee with five or more years at expiry | CONDITIONAL, as F3 | No five-year need applies (second proviso); the same illustrative amount. |
| F8 | An employee of a **contractor** (labour supplied by a contractor) | **VERIFIED** (MoLE Q16: the contractor pays after five years' continuous service) | Choose "Regular employee"; the page notes that a contractor's employee on a written fixed-term contract with the contractor is **not** covered by this verification. |

A single uncertain fixed-term scenario therefore does not remove the supported cases F1, F2 and F4.

### 7.6 Rounding [convention, B8]
No statutory rule on rounding the rupee amount was found, so none is claimed. **Convention:** calculation uses exact integer paise arithmetic with no intermediate rounding; the exact value `wages × 15 × N ÷ 26` is compared with the ceiling; only the **displayed** amount is rounded, to the nearest paisa, half up, `floor((2 × wagesPaise × 15 × N + 26) / 52)`. A difference shown between two scenarios is the difference of the **two displayed amounts**, so the screen adds up. The page states that this rounding is the tool's own and that payroll may round differently. Counted years and service days are integers and never rounded.

### 7.7 Independent verification and reproducible examples
- **Oracle (G4):** `tests/fixtures/gratuity-golden.py` using `fractions.Fraction` for money and a **month-walking** date algorithm (a different method from the engine's arithmetic), writing `tests/fixtures/gratuity-golden.json`. **Agreement between two implementations shows consistent arithmetic, not legal correctness**: the legal rules come from the cited sections, and the date convention is the owner's choice (D10).
- **Review check done for this draft (a scratch script outside the repository, not a committed test):** two independent date methods (a month walk and a closed-form month index with correction) agreed on 20,000 random date pairs; the invariants of 7.1 held for A and C′; money uses exact `Fraction` values. Every row below was produced by that script and is **hand-checkable** from its columns.
- **Money anchors** (wages ₹50,000 unless stated): N = 8 → 50,000 × 15 × 8 ÷ 26 = 6,000,000 ÷ 26 = **₹2,30,769.23**; N = 6 → 4,500,000 ÷ 26 = **₹1,73,076.92**; N = 5 → 3,750,000 ÷ 26 = **₹1,44,230.77**; N = 4 → 3,000,000 ÷ 26 = **₹1,15,384.62**; wages ₹30,000 and N = 5 → 2,250,000 ÷ 26 = **₹86,538.46**; wages ₹1,00,000 and N = 36 → 54,000,000 ÷ 26 = ₹20,76,923.08, **capped at ₹20,00,000**.
- **Boundary table, regular employees, option A** (wages ₹50,000). Columns: exclusive end = exit date + 1 day; *m* = completed months; A(*m*) = the *m*-th anniversary; service = years, months, days; N = counted years (amount only); status per 7.3 (1 = "five calendar years reached, subject to conditions", 2 = "fifth year, not determined from dates", 3 = "threshold not reached"); amounts for status 2 are **illustrative**, for status 1 "estimated"; the last column shows where option C′ would differ.

| Joining | Exit | Exclusive end | m | A(m) | Service | N | Status | Amount | Option C′ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2016-04-01 | 2024-03-31 | 2024-04-01 | 96 | 2024-04-01 | 8 y 0 m 0 d | 8 | 1 | ₹2,30,769.23 | same |
| 2019-01-01 | 2023-12-31 | 2024-01-01 | 60 | 2024-01-01 | 5 y 0 m 0 d | 5 | 1 | ₹1,44,230.77 | same |
| 2019-01-01 | 2023-12-30 | 2023-12-31 | 59 | 2023-12-01 | 4 y 11 m 30 d | 5 | 2 | illus. ₹1,44,230.77 | same |
| 2019-01-01 | 2024-06-30 | 2024-07-01 | 66 | 2024-07-01 | 5 y 6 m 0 d | 5 | 1 | ₹1,44,230.77 | same |
| 2019-01-01 | 2024-07-01 | 2024-07-02 | 66 | 2024-07-01 | 5 y 6 m 1 d | 6 | 1 | ₹1,73,076.92 | same |
| 2019-01-01 | 2024-07-31 | 2024-08-01 | 67 | 2024-08-01 | 5 y 7 m 0 d | 6 | 1 | ₹1,73,076.92 | same |
| 2020-02-29 | 2025-02-26 | 2025-02-27 | 59 | 2025-01-29 | 4 y 11 m 29 d | 5 | 2 | illus. ₹1,44,230.77 | same |
| 2020-02-29 | 2025-02-27 | 2025-02-28 | 60 | 2025-02-28 | 5 y 0 m 0 d | 5 | 1 | ₹1,44,230.77 | 4 y 11 m 30 d, N = 5, status 2 |
| 2020-02-29 | 2025-02-28 | 2025-03-01 | 60 | 2025-02-28 | 5 y 0 m 1 d | 5 | 1 | ₹1,44,230.77 | 5 y 0 m 0 d, N = 5, status 1 |
| 2018-08-31 | 2024-02-28 | 2024-02-29 | 66 | 2024-02-29 | 5 y 6 m 0 d | 5 | 1 | ₹1,44,230.77 | 5 y 5 m 29 d, N = 5 |
| 2018-08-31 | 2024-02-29 | 2024-03-01 | 66 | 2024-02-29 | 5 y 6 m 1 d | 6 | 1 | ₹1,73,076.92 | 5 y 6 m 0 d, **N = 5** |
| 2020-07-01 | 2025-02-28 | 2025-03-01 | 56 | 2025-03-01 | 4 y 8 m 0 d | 5 | 2 | illus. ₹1,44,230.77 | same |
| 2022-01-01 | 2025-12-31 | 2026-01-01 | 48 | 2026-01-01 | 4 y 0 m 0 d | 4 | 2 | illus. ₹1,15,384.62 | same |
| 2022-01-01 | 2025-12-30 | 2025-12-31 | 47 | 2025-12-01 | 3 y 11 m 30 d | n/a | 3 | none | same |

Every row follows the algorithm as written; none contradicts it. The rows with joining on the 1st to the 28th are identical under A and C′. Four of the five rows with joining on 29 February 2020 or 31 August 2018 differ under C′ (the month-end dependence of 7.1): one changes the status (2020-02-29 to 2025-02-27), one changes the counted years (2018-08-31 to 2024-02-29), and two change only the days shown.

- **Fixed-term rows, option A** (wages ₹50,000; contract start to end; every amount is CONDITIONAL and illustrative, B3b). The joining days are all the 1st, so A and C′ agree.

| Start | End | Exclusive end | m | A(m) | Service | Y | Behaviour | Amount |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2025-01-01 | 2025-12-31 | 2026-01-01 | 12 | 2026-01-01 | 1 y 0 m 0 d | 1 | F1 met | illus. ₹28,846.15 |
| 2025-01-01 | 2026-06-30 | 2026-07-01 | 18 | 2026-07-01 | 1 y 6 m 0 d | 1 | F1 met | illus. ₹28,846.15 |
| 2025-01-01 | 2026-07-01 | 2026-07-02 | 18 | 2026-07-01 | 1 y 6 m 1 d | 2 | F1 met | illus. ₹57,692.31 |
| 2025-01-01 | 2026-07-31 | 2026-08-01 | 19 | 2026-08-01 | 1 y 7 m 0 d | 2 | F1 met | illus. ₹57,692.31 |
| 2025-01-01 | 2025-11-30 | 2025-12-01 | 11 | 2025-12-01 | 0 y 11 m 0 d | n/a | F4 not yet one year | none |

## 8. Assumptions (shown next to the result) [PROPOSED]
Wages entered are the Code's qualifying wages, not gross pay; the exit date is on or after 21 November 2025; the employer is covered by Chapter V; the employee is a regular monthly-rated employee (or a directly engaged fixed-term employee whose contract expires); service is counted from the dates with both days included (the tool's convention, not a legal attendance calculation); service was continuous in the sense of s.54(A); a part-year over six months counts as a year for the **amount only**; the ceiling is ₹20,00,000 and may change by notification; the rupee rounding is the tool's own; the employer's own scheme may be better (s.53(5)); this is an estimate, not legal advice, and the employer decides the actual payment.

## 9. Edge cases
Wages zero or negative: specific message. Wages above the sanity limit: message. Exit before joining: message at the exit field. **Exit before 21 November 2025: a message that this tool covers exits from that date and that earlier exits fall under the earlier law, with no figure (D4).** Exactly 5 years: status 1. 4 years 0 months to 4 years 11 months 30 days: status 2. Remainder of exactly 6 months: N unchanged; 6 months 1 day: N + 1. 29 February and month-end joins: the anniversary rule of 7.1, with the stated artefact. A 40-year service reaching the ceiling: the "ceiling applied" line. Very large wages with a long service: safe-integer limits checked. "Other" type: explanation only. Fixed-term: the cases of 7.5 (F5 and F6 give a message, never a figure).

## 10. Validation
Errors are specific, linked to the field with `aria-describedby`, and leave the input editable. Empty fields at Calculate: a "required" message, not a zero result. Non-numeric wages are refused. Cross-field rule: exit not before joining. No automatic correction (rulebook 8.5, 8.6).

## 11. UX flow
One short form, then the result. Order: employee type, (fixed-term only) how the contract ends, wages (with its hint), joining date, exit date, Calculate and Reset. After Calculate, focus moves to the result heading and a polite live region announces the status once; after Reset, focus returns to the first field. On a phone the first view is the **status sentence and the amount line**; the working, the assumptions and the "check with payroll" list sit directly below in short blocks, with the working collapsible. Scenario tools are collapsed under "Explore other exit dates" and "Compare another wage" (progressive disclosure). The shared calculator components and tokens are used.

## 12. Result hierarchy
1. The status sentence. 2. The amount line, labelled by status (7.4), with the ceiling note when it applied. 3. "Check with your employer or payroll". 4. The counted years and the substituted formula. 5. The assumptions and the "rules checked on" date. An unfavourable result ("not yet at five years") is stated plainly with the calendar five-year date, never as advice.

## 13. Comparison, table or schedule decision
**Needed (P1, proposed for the first release, G6). Both reuse the one verified engine** (same measurement, status, counted-years and ceiling rules, no second implementation):
- **Service milestone explorer** (regular employees only): a short table of hypothetical exit dates (the calendar five-year date if not reached, +6 months, +1 year from the entered exit date), each row showing the measured service, the status and the amount with the same labels, and a line stating the wage assumption. Not shown for fixed-term employees.
- **Wage comparison:** a second wage with the same dates and rules, the two displayed amounts and their difference, and a note that a higher gross salary does not necessarily raise the qualifying wages.
No long schedules.

## 14. Chart decision
NOT NEEDED: the numbers and a three-row table say everything; a chart adds no information.

## 15. Export decision
**Copy summary: P1, conditional** (an employee may paste it into an email to HR; it is text only, written to the clipboard on an explicit click, never to a URL or storage). No PDF, no CSV.

## 16. Print decision
NOT NEEDED in the first release: native browser print works. A print stylesheet is P2.

## 17. Mobile behaviour
At 320, 360 and 390 px: single column, full-width fields, 44 px touch targets, native date pickers and a decimal keypad, the result card stacked with large rupee figures that never overflow (long Indian-format numbers wrap or scale), the explorer table as stacked rows, no page-level horizontal scroll.

## 18. Accessibility requirements
Labelled fields with linked hints and errors; keyboard-only use; focus management as in section 11; a polite live region with a single concise announcement; semantic headings; a table with a caption and header scope; contrast 4.5:1 for text and 3:1 for outlines; reduced motion honoured; no meaning by colour alone (the status is text, with an icon that has a text equivalent).

## 19. Search keywords and aliases
The aliases of section 1. Queries to check after build: "gratuity calculator", "gratuity calculator india", "gratuity calculation formula", "gratuity eligibility". **Search demand is unmeasured; no volume, ranking or traffic figure is claimed.**

## 20. Related calculators
Old vs New Tax Regime Calculator (the nearest existing tool; salary and tax neighbour) and, if it is later built, Salary / CTC to In-Hand. Reasons stated on the page; no forced links.

## 21. Article cluster
Two tool-led articles at most, **both deferred until the legal blockers are closed**: (1) "How gratuity years are counted" (explanation: completed years, the six-month rule, and why eligibility is separate); (2) "Gratuity for fixed-term employees" (interpretation: one year, rounding, what is still unsettled). No tax article until B12 closes. No filler.

## 22. Imagery plan
None.

## 23. SEO plan
Title (draft): "Gratuity Calculator India: Estimate and Eligibility | ToolZen Hub". Description: from section 1. Canonical: `https://toolzenhub.in/calculators/gratuity/`. One H1, headings for the method, assumptions and eligibility explanation; the explanation and assumptions are in the static HTML. A visible **"Rules checked on"** date. Sitemap and breadcrumb derive from the catalog (rulebook 9.2).

## 24. Performance constraints
Native controls, vanilla modules, no dependency, no chart, no network request. The tool's JS and CSS load only on its page. The budget is set in G3 from the nearest calculators; none is invented here.

## 25. Tests
- **Unit (HIGH, independent oracle, G4):** table-driven pure-module tests against the Python oracle for: service measurement by the 7.1 convention (the boundary table in 7.7 is the seed, including 29 February joins, month-end joins and leap-year spans); counted years at remainders of 5 months, exactly 6 months, 6 months 1 day, 7 months and 11 months; the three status bands at 3 years 11 months 30 days, 4 years 0 days, 4 years 11 months 30 days and 5 years; N never altering a status; the ceiling below, at and above ₹20,00,000; money to the paisa and the "difference of displayed amounts" rule; fixed-term rows F1 to F6 (11 months gives no amount, 12 months passes, 1 year 6 months does not round up, 1 year 6 months 1 day rounds up, early end and renewals give a message and no figure); exit before 21 November 2025; exit before joining; zero, negative and very large wages; invalid dates; unsupported types. **Each legally sensitive expected value cites its section, rule or FAQ number**, and rows that depend on the CONDITIONAL convention are marked as such in the test data.
- **Manual (owner, G9), exact URL `…/calculators/gratuity/`** (values assume the proposed convention; if the owner chooses another, they are recomputed):
  - M1: Regular; ₹50,000; 01-04-2016 to 31-03-2024 → 8 years, status 1, **₹2,30,769.23**.
  - M2: Regular; ₹50,000; 01-01-2019 to 30-06-2024 → 5 y 6 m 0 d, N = 5, **₹1,44,230.77**.
  - M3: same joining; exit 01-07-2024 → 5 y 6 m 1 d, N = 6, **₹1,73,076.92**.
  - M4: Regular; ₹50,000; 01-07-2020 to 28-02-2025 → 4 y 8 m 0 d, status 2 "fifth year, not determined from dates", **illustrative** ₹1,44,230.77, the amount not described as owed.
  - M5: Regular; 01-01-2022 to 30-12-2025 → 3 y 11 m 30 d, status 3 "threshold not reached on these dates", no amount; the explorer shows the calendar five-year date.
  - M5b (month-end, **convention-dependent**): Regular; ₹50,000; 31-10-2019 to 30-04-2025 → option A: 5 y 6 m 1 d, N = 6, ₹1,73,076.92; option C′: 5 y 6 m 0 d, N = 5, ₹1,44,230.77. Record the owner's D10 choice before using this row.
  - M6: any joining; exit 31-10-2025 → the earlier-law message, no figure.
  - M7: Regular; ₹1,00,000; a 36-year service → **₹20,00,000**, "ceiling applied".
  - M8: Fixed-term, contract runs to its end; 01-01-2025 to 31-12-2025 → F1 met, illustrative ₹28,846.15; 01-01-2025 to 30-11-2025 → "not yet one year", no amount; "ends earlier" → the message, no figure.
  - M9 to M11: exit before joining, zero wages, "Other" type.
  - Plus Reset, keyboard, 320, 360 and 390 px, the consent banner and the related links.
- **Automation:** unit tests and focused static checks only. Substantial browser automation needs explicit approval (rulebook 10.13) and would use a GitHub-hosted runner. The listing baselines pinned by registering a tool are updated deliberately in the integration phase.

## 26. Quality gate
Mapped to factory section 4 at implementation. NOT NEEDED items: chart (section 14), print (section 16), imagery (section 22), export beyond Copy (section 15). **Product gate, additionally:** every status sentence is reviewed for overstatement; no legal-advice wording; "rules checked on" date present.

## 27. Deferred items
Years-and-months entry (P1, after the date convention is settled); the wage assistant (B5; revisit if the Ministry reconciles its FAQs); the fixed-term amount as a payable figure (B3b; it is shown only as an illustrative amount in v1), fixed-term early exit and renewals (B3c); death and disablement (B7, D6); seasonal, piece-rated and journalist rules (L3); the tax-exemption view (B12); print stylesheet; the two articles.

## 28. Commit checkpoint
Not applicable until implementation is approved. Engine and oracle first as one reviewable commit (factory 2a, HIGH), then integration. This specification is committed locally as documentation only (subject "docs: specify Gratuity Calculator requirements and legal constraints"); it is a draft, not approved for implementation, and not pushed.

## 29. Owner decisions, status and what is needed

### 29.1 Decisions recorded by the owner on 2026-10-21
| # | Decision | Status | Effect and limits |
| --- | --- | --- | --- |
| D1 | One qualifying-wages input, not labelled gross salary | **APPROVED** (earlier) | Section 5, with how to find the figure. |
| D2 | The exactly-six-months versus more-than-six-months **principle**: exactly six months does not add a year; a period exceeding six months does, under a documented date convention | **APPROVED as a principle**; day-level results **CONDITIONAL on D10** | Sections 7.1, 7.2; B2. |
| D3 | Fixed-term: supported guidance, and conditional illustrative amounts | **APPROVED as guidance**; the amount stays **CONDITIONAL** and is never called payable | Section 7.5. F5 and F6 stay UNSUPPORTED. |
| D4 | Exits on or after 21 Nov 2025 only | **APPROVED** (earlier) | Sections 5 and 9. |
| D5 | Tax is a provisional navigation candidate; gratuity is not presented primarily as a tax calculator | **APPROVED as provisional**; final category in G3 | Section 1. |
| D6 | Death and disablement excluded from the estimator | **APPROVED** (earlier) | Sections 4 and 27. |
| D7 | The ₹20 lakh ceiling | **ACCEPTED FOR SPECIFICATION DRAFTING**; **release gate retained** | Supported by the PIB release of 30 March 2018 (read), MoLE FAQ Q12 (read) and s.164(2)(a). The operative notification and its applicability must still be verified before production release (B6). |
| D8 | Independent payroll or legal review | **RECOMMENDED, not mandatory for G3**; **NOT PERFORMED** | Before release if possible, especially for contested cases. No claim of review may appear on the page. |
| D9 | Eligibility kept separate from year rounding; qualified statuses; the four-year line is a presentation convention | **APPROVED as revised** (wording in 7.3); the four-year line stays **CONDITIONAL** | No status says the person is eligible; two dates cannot prove legally continuous service. |
| D10 | Date convention: provisionally **option A** (both days counted, calendar anniversaries) | **PROVISIONAL, remains CONDITIONAL** | Not a legally mandated method. The month-end dependence of 7.1 is unresolved; see 29.2. |
| Rounding | Half-up to the nearest paisa at final display, as an explicitly documented estimator convention | **APPROVED as an estimator convention** (B8) | Section 7.6. It is **not** claimed to be a legal rule and is separate from legal year-counting. |

### 29.2 D10 in detail: the smallest resolution
The review found **no internal contradiction** in option A (7.1): it is reversible, monotone and reproduces every example. The open point is that **for joins on the 29th, 30th or 31st** it gives results that differ from the equally natural alternative C′ at the month-end, in one case by a counted year (**₹28,846.15** at ₹50,000). The owner's choices, the smallest first:
- **A, accepted with disclosure (provisional choice):** keep section 7.1 as written. The page states the convention and the service as years, months and days. Risk: a joiner on the 29th to 31st who leaves at a short month's end may see N one higher than a payroll that reads "month-end to month-end" as complete months.
- **C′ (alternative):** an anniversary that does not exist (for example 31 April) is the **first day of the next month**, so a stay ending on a short month's last day completes the month. Identical to A for joins on the 1st to the 28th; removes the "1 month 1 day" reading at month-end; still has its own leap-year differences (the 2020 and 2021 rows).
- **B (exit day not counted):** simpler wording but every boundary moves by one day, and the last working day would not count as served. Not recommended.
The choice must be made, and ideally checked in the review (D8), **before G4**. Changing it later changes expected values in 7.7, 25 and the oracle.

### 29.3 What is needed before calculation code (G4)
1. A **final choice on D10** (A with disclosure, or C′), with B2.
2. Owner acceptance of the **four-year presentation line** (7.3), or another line after review.
3. **Ceiling (B6):** the operative notification verified before **release**; for G4 the constant is the drafting value ₹20,00,000 with its source and date.
4. The **fixed-term amount stays illustrative** (B3b).
The rounding convention is accepted. The wage assistant, death and disablement, fixed-term early exit and renewals, and tax stay out of the first release.

### 29.4 Can G3 (UX and technical design) proceed?
**Yes, without authorizing any calculation code.** G3 covers layout, copy, the final category, input limits, accessibility, budgets and the file plan, and none of it needs 29.3. **G4 may not start until 29.3 items 1 and 2 are settled** and the unresolved blockers of 0.4 that affect it are accepted or closed. Wording that depends on open items (status 2 text, the assumption lines, the "rules checked on" line) is drafted in G3 and finalized after 29.3.

## 30. SDLC phases (pending phases are not started)
| Phase | Prerequisites | Deliverable and scope | Acceptance | Test responsibility | Risk | Stop gate |
| --- | --- | --- | --- | --- | --- | --- |
| G0 | none | Discovery (done 2026-10-20) | Reviewed by the owner | n/a | none | Done |
| G1 | G0 | Legal verification (this document, section 0) | Sources and conflicts recorded | Claude (research) | Gaps remain (0.4) | Owner review |
| G2 | G1 | Requirements and draft specification (this document) | Owner answers section 29 | Claude drafts; owner decides | Open blockers | **Owner approval of the spec** |
| G3 | G2 approved (the open items of 29.3 need not be closed for design; see 29.4) | UX and technical design, final category, budgets, input limits | No unresolved UI question | Claude; owner reviews | Placement | Owner approval |
| G4 | G3 and section 29.3 settled | Engine, rules metadata, Python oracle and golden tests (one reviewable commit) | Engine equals the oracle on every case; focused unit tests pass | **Claude (automated)** | Wrong legal reading | Owner reviews engine commit |
| G5 | G4 | Calculator UI and styles | Owner reviews layout | Owner (manual) | Overstated wording | Owner approval |
| G6 | G5 | Approved P1 features (explorer, comparison, copy) | Owner accepts wording | Owner (manual) | Scope creep | Owner approval |
| G7 | G5 or G6 | Catalog, search, sitemap, relationships, pinned tests; articles only if unblocked | Focused static checks pass | Claude (focused) | Shared pinned files | Owner approval |
| G8 | G7 | Focused correctness verification | Unit and static checks green; no unexecuted test called passed | Claude | Regression of pinned lists | Owner approval |
| G9 | G8 | Owner manual acceptance (checklist M1 to M11 and Android steps) | All pass | **Owner** | Defects | Owner sign-off |
| G10 | G9 | Staging release and review | Staging serves the page | Owner (review); Claude (HTTP check) | Staging only | Separate push approval |
| G11 | G10 | Release package, backup and rollback | Verified package; backup confirmed | Claude (package); owner (backup) | Production safety | Owner approval |
| G12 | G11 | Production deployment | Post-release checks | Owner | Production | **Separate explicit approval** |
| G13 | G12 | Feedback and law-change review | Changes logged with dates | Both | Law changes | Owner approval |

## 31. Integration impact (verified pattern from the PPF commits; the final list is set in G3)
**New:** `assets/js/calculators/formulas/gratuity.js`, `assets/js/calculators/formulas/gratuity-rules.js` (constants, sources, "checked on" date), `assets/js/calculators/gratuity/index.js`, `assets/css/calculators/gratuity.css`, `tests/unit/gratuity-golden.test.mjs`, `tests/fixtures/gratuity-golden.py` and `.json`. **Changed (by the PPF pattern):** `assets/js/data/tools.js`, `src/_data/toolStyles.json`, `scripts/growth-manifest/identity-ledger.json`, `tests/inventory/url-inventory.json`, the catalog, search, relationships, sections, taxonomy and directory unit tests, the pinned DOM, link and SEO baselines, and `tests/browser/navigation.spec.js` and similar pins. Existing tools' logic is not modified (rulebook 9.3). Rollback is `git revert` of the engine and integration commits.

## 32. Readiness classification
**READY FOR OWNER REVIEW AND G3 DESIGN. NOT IMPLEMENTATION-READY.** Owner decisions were recorded on 2026-10-21 (29.1). The **regular-employee core** is legally grounded in primary text but still needs a **final D10 choice** (the month-end dependence for joins on the 29th to 31st, 7.1 and 29.2) and acceptance of the four-year presentation line. The ceiling carries a **release gate** (B6), the **fixed-term amount is illustrative only** (B3b), and **no independent review has occurred** (B11). **G3 design can proceed; G4 calculation code cannot.**
## 33. Detailed Architecture and UX Design (G3)

Status: **G3 design, written 2026-10-21 as documentation only. DESIGN COMPLETE, LEGAL DECISIONS PENDING.** Base commit: 075c302 (Sections 1 to 32 are unchanged). Nothing in this section is implemented, built or tested, and **no test described here has been run**. Reconciled on 2026-10-21 against Sections 5, 11 and 29 (the changes are listed in 33.19). Labels as in the header: [APPROVED], [VERIFIED] (read in the repository this session), [CONDITIONAL], [PROPOSED], [BLOCKED].

### 33.1 G3 scope and authoritative references
- **Authority:** this specification (Sections 0 to 32) and `docs/product-decision-rules.md` (sections 7 to 11 read for this phase). The G3 Design Prompt Pack (a reference ZIP) was used as a checklist only; it does not override either document.
- **Phase numbering [APPROVED by the owner 2026-10-21]:** the committed G0 to G13 sequence of Section 30 governs. The pack's G0 to G15 map is a planning convention and is mapped, not adopted, in 33.18. Section 30 is not renumbered.
- **What G3 does:** designs the architecture, the pure-engine contracts, the input and result contracts, the UX, the accessibility behaviour, the test design and the file plan, so that G4 to G7 can be implemented without rediscovering decisions. It writes no application code.
- **What G3 does not do:** settle **D10** (option A with disclosure, or C′; Section 29.2) or the **four-year status line and wording** (Section 7.3), add component-based wage inputs, choose a legal interpretation, or authorize G4. **The single qualifying-wages field is preserved [APPROVED, D1].** The wage assistant, fixed-term early exit and renewals, death and disablement, and tax stay out of scope (Sections 4 and 27).
- **Legal references (not repeated here):** the legal findings are L1 to L17 (0.2), the conflicts 0.3, the blockers B1 to B12 (0.4), the rules of Section 7 and the owner decisions of 29.1. This section cites them by number.

### 33.2 Requirements-to-design traceability
| ID | Requirement (source) | Design (this section) | Future module or file (PROPOSED) | Test (33.13) | Readiness |
| --- | --- | --- | --- | --- | --- |
| R1 | Single qualifying-wages field, no gross-salary label (Sec 5, D1) | 33.5, 33.9 | `gratuity/index.js`; `gratuity.js` (`parseWages`) | T-VAL-1 to 5 | **READY** |
| R2 | Employee type; fixed-term "how the contract ends" (Sec 5, 7.5) | 33.5, 33.6 | `gratuity/index.js`; `gratuity.js` (applicability) | T-APP-1 to 10 | **READY** |
| R3 | Joining and exit dates; exit on or after 21 Nov 2025 (D4) | 33.5, 33.8 | `gratuity-rules.js`; `gratuity-calendar.js` | T-VAL-6 to 12 | **READY** |
| R4 | Service-duration convention (7.1, D10) | 33.7 | `gratuity-calendar.js` (one isolated function) | T-CAL-1 to 14 | **BLOCKED on D10** |
| R5 | Counted years N, amount only (7.2) | 33.7 | `gratuity.js` | T-CAL-8 to 12 | **CONDITIONAL on D10** |
| R6 | Eligibility statuses, four-year line (7.3, D9) | 33.6, 33.8 | `gratuity-rules.js`; `gratuity.js` | T-ELG-1 to 8 | **BLOCKED on the four-year line and wording** |
| R7 | Amount, ceiling, labels (7.4, B6) | 33.7, 33.8 | `gratuity.js`; `gratuity-rules.js` | T-AMT-1 to 10 | **CONDITIONAL**; ceiling gate before release |
| R8 | Fixed-term F1 to F8 (7.5) | 33.6 | `gratuity.js` | T-FT-1 to 8 | F1, F2, F4, F8 READY; F3, F7 CONDITIONAL; F5, F6 UNSUPPORTED |
| R9 | Rounding at display only (7.6, B8) | 33.7 | `gratuity.js`; `gratuity/index.js` | T-AMT-5 to 8 | **READY** (accepted) |
| R10 | Six result blocks (Sec 6, 12) | 33.9 | `gratuity/index.js` | M-series (33.12) | READY except wording of block 1 (R6) |
| R11 | Milestone explorer and wage comparison reuse one engine (Sec 13) | 33.7, 33.9 | `gratuity.js` (`explore`, `compareWages`) | T-SCN-1 to 6 | READY once R4 and R6 are decided (G6) |
| R12 | Copy summary (Sec 15, conditional) | 33.9 | `gratuity/index.js` | M-series | CONDITIONAL (G6) |
| R13 | Local processing, no storage, URL or analytics values (8.8, Sec 8) | 33.14 | all | T-SEC-1 to 6 | **READY** |
| R14 | Mobile, accessibility (Sec 17, 18) | 33.10, 33.11 | `gratuity.css`; `gratuity/index.js` | M-series | READY |
| R15 | Catalog, route, SEO, relationships (Sec 1, 19 to 23) | 33.15 | `tools.js` and pinned files | static checks | READY; final category D5 |
| R16 | Oracle and golden tests (7.7, 25) | 33.13 | `gratuity-golden.py/.json/.test.mjs` | all T-series | READY; expected values for R4 to R6 cases PENDING |

### 33.3 Existing architecture findings [VERIFIED by inspecting the repository]
- **Catalog (single source of truth):** `assets/js/data/tools.js`. A published entry carries `id`, `status: "published"`, a literal lazy `loader: () => import("../calculators/<id>/index.js")`, `category`, `icon`, `title`, `description`, `aliases`, `capabilities`, `seo { title, description }`, and optionally `relatedTools`, `relatedArticles` and `toolType` (fields named in the header comments of `tools.js` and `data/relationships.js`). PPF's entry is the nearest model. No `gratuity` entry exists.
- **Derived views (not edited for a new tool):** `assets/js/calculator-registry.js` derives `calculatorRegistry` and `calculatorMetadata` from published catalog entries that have a `loader`; `assets/js/data/calculators.js` is a compatibility view that returns the same objects; `data/taxonomy.js` and `data/categories.js` derive the section, category, breadcrumb and listing hierarchy; `data/relationships.js` derives related tools and articles (curated first, then the same category).
- **Page generation:** `src/tool-pages.njk` paginates `tools` and writes each page at `tool.sitePath` (the Calculators prefix is `/calculators/{id}/`); `src/tool-pages.11tydata.js` and `src/_includes/layouts/tool.njk` supply the shell. The finished page contains the tool's markup, breadcrumb and related sections, the header and footer and every SEO tag.
- **Page load:** `assets/js/entries/tool.js` reads `data-tool-module` from the page, imports only that tool's module and calls its `init(app)`; on failure it shows `renderToolError()` or `renderToolNotFound()` from `pages/tool-messages.js`. **`assets/js/pages/calculator.js` does not exist**; the shared logic is `assets/js/pages/tool-page.js`.
- **Tool module contract (`pages/tool-page.js`):** `export function render(mount)` is **required**; `markup()` (pure, returns the tool's HTML for the build) and `init(mount)` are optional but used by every published calculator; `showRelatedCalculators` and `showRelatedArticles` may opt out. The tool's markup must be wrapped in `<div class="calculator-page">`; the shared layer places the **centralized breadcrumb** (`components/breadcrumb.js`) as its first child and the related sections as its last children. **A tool must not draw its own breadcrumb.**
- **Per-tool styles:** `assets/css/calculators/<id>.css` plus the shared `calculator-base.css`, `calculator-form.css`, `calculator-results.css` and `calculator-responsive.css`; each tool's stylesheet list lives in `src/_data/toolStyles.json` (PPF's entry lists the base, component and calculator sheets and its own).
- **Shared UI helpers:** `ui/field.js` (`fieldShell`, `numberField` which renders `type="number"`, `setFieldsInvalid`, `clearFieldsInvalid`, `hintIdOf`), `ui/result.js` (`resultMetric`, `resultEmpty`, `resultError`), `ui/escape.js` (`escapeHTML`), `calculators/common/formatter.js` (`formatINR`, `formatNumber`, `formatDuration`). User text is written as escaped text.
- **Nearest pattern (PPF):** `calculators/formulas/ppf.js` (pure model, validation, constants) plus `calculators/ppf/index.js` (the page around it) plus `ppf.css`; explicit Calculate; an edit after a result marks it out of date instead of silently recalculating (`ppf-stale`); a `role="status" aria-live="polite"` region with a debounced `announce` and an immediate `announceNow`; Reset restores the starting values, announces "Reset to the starting values." and focuses the first field; values and assumptions in plain view; nothing stored or sent. **Existing calculators announce the result in the live region and do not move focus on Calculate.**
- **Date precedent:** `assets/js/tools/date-difference/date-engine.js` is pure (no DOM, no clock, no JavaScript `Date`), reads `YYYY-MM-DD` strictly (rejects impossible dates), and defines `addMonths(date, n)` with the day clamped to the end of a shorter month and the breakdown "largest n with addMonths(A, n) ≤ B". **This is the same clamp anniversary as option A**, but it measures from the earlier date to the later one (the later date is not counted). `date-difference` and `date-calculator` use `<input type="date">`.
- **Tests:** `tests/unit/<id>-golden.test.mjs` with `tests/fixtures/<id>-golden.py` and `.json` (a Python reference); `tests/browser/<id>.spec.js`; the touch-list of `docs/tool-pack-factory.md` section 7 names the pinned unit tests, baselines and inventory that registering a tool changes.
- **Analytics:** GA4 is production-only, consent-gated and loaded by the shared layer (`analytics.js`); tool code never calls it (rulebook 8.8).

### 33.4 Module and responsibility boundaries [PROPOSED]
Existing files stay untouched except the pinned registration files of 33.15. Five new files; **no shared-system change is required**.
| Module | Responsibility | Inputs → outputs | Depends on | Failure behaviour | Spec reference | Pending-decision impact |
| --- | --- | --- | --- | --- | --- | --- |
| `assets/js/calculators/formulas/gratuity-rules.js` | Constants and metadata only: the 21 Nov 2025 date, the ceiling in paise with its source and date, limits, status and message identifiers, "rules checked on" date | none → frozen constants | none | none (constants) | 7.4, 0.2 | Ceiling (B6 gate); the four-year line value lives here as one constant |
| `assets/js/calculators/formulas/gratuity-calendar.js` | Pure calendar arithmetic: strict `YYYY-MM-DD` parsing, day numbers, the **single `anniversary(join, m)` function**, completed months and days, the calendar five-year date, date addition for the explorer | strings or `{y,m,d}` → `{y,m,d}` or numbers | none (no `Date`, no clock) | Returns `{state:"invalid"}` for impossible dates; never normalizes | 7.1 | **D10 changes only `anniversary`** |
| `assets/js/calculators/formulas/gratuity.js` | The model: `validateGratuityInputs`, applicability, service measurement, counted years, eligibility status, integer-paise amount, ceiling, labels, structured result, `explore`, `compareWages` | raw input object → frozen result object | the two modules above | Structured errors; never a success-shaped amount for an error | 5 to 7, 13 | Status boundaries (four-year), D10 via calendar |
| `assets/js/calculators/gratuity/index.js` | The page: `markup()`, `init()`, `render()`; reads the DOM; calls the engine; formats with `formatINR` and the approved text; stale marking, announce, Reset, scenario panels, copy summary | DOM events → DOM | engine, `ui/*`, `formatter.js`, `data/calculators.js` | A thrown engine error becomes a visible error block, not a blank page | 6, 11 | Wording of status 2 and the assumption lines |
| `assets/css/calculators/gratuity.css` | Layout the tool alone needs; tokens from the shared layer | none | shared calculator CSS | none | 17 | none |
- **Cross-tool date helper decision [PROPOSED; owner choice, G3 gate item P1 in 33.19].** Options: (a) import `dayNumber`, `addMonths`, `parseDate` from `tools/date-difference/date-engine.js`; (b) a **small independent calendar module** (about 60 lines: `daysInMonth`, `dayNumber`, `parseDate`, `anniversary`); (c) extract a shared helper (edits an existing tool, so rulebook 9.3 approval). **Owner direction (2026-10-21): (b), subject to the approved date-counting contract (D10).** A legal-money result must not change because a different tool's engine is edited (rulebook 9.3), the duplication is small and specific (rulebook 9.4), option C′ needs its own anniversary function anyway, and the gratuity golden tests pin the behaviour. The independent oracle (7.7) is the check that the two engines agree where they should.
- **Dependency rule:** `index.js` imports the engine; the engine imports only the rules and calendar modules; no module reads the DOM, storage, cookies, the URL, the clock, locale or analytics except `index.js` (DOM only).

### 33.5 Single-field input contract [PROPOSED; wage model APPROVED]
Raw values are strings from the form; the engine normalizes them. Nothing is defaulted silently, nothing is coerced, and invalid values are never "fixed".
| Field | Control and semantics | Required | Raw → normalized → derived | Dependencies | Invalid behaviour |
| --- | --- | --- | --- | --- | --- |
| Employee type | `fieldset` + `legend`, three native radios: Regular (including a contractor's employee) / Fixed-term, engaged directly / Other | Yes | string → one of `regular`, `fixedTerm`, `other` | Selects the path | Unselected → "Choose the employee type" |
| Fixed-term: contract end | `fieldset`, two radios, **rendered only for fixed-term** | Yes when shown | → `expires`, `earlier` | Shown only for `fixedTerm`; hidden fields are not read, validated or announced (the PPF pattern) | Missing → required message |
| Qualifying monthly wages | `<input type="text" inputmode="decimal" autocomplete="off">`, a rupee prefix label, hint text per 5; **not** `type="number"` (the wheel cannot change it and the entered text is kept exactly as typed) | Yes (not for "Other") | text → integer **paise**, parsed by digit arithmetic and **never through floating point**; digits with one optional decimal point and at most two decimals (the constraints of Section 5); **separators such as commas or spaces are rejected** (owner decision 2026-10-21, P3b) with a helpful message; anything else is refused with a message that shows an example | Hidden for "Other" | Blank → required; letters, symbols, separators, negative, zero or more than two decimals → a specific message with an example (for separators: "Enter digits only, with no commas or spaces, for example 150000 or 150000.50"); the entered text stays |
| Joining date | `<input type="date">` (precedent in `date-difference`) | Yes (not for "Other") | `YYYY-MM-DD` → `{y,m,d}` by strict parse | Contract start for fixed-term | Blank or impossible → message |
| Exit date | `<input type="date">` | Yes (not for "Other") | same | Contract end for fixed-term; on or after 21 Nov 2025 | Before joining → message at the exit field; before 21 Nov 2025 → the D4 unsupported state (not an error) |
- **Wage guidance:** the hint of Section 5 is used as written: not gross salary; basic pay + dearness allowance + retaining allowance; the excess over half of remuneration may be added; ask payroll for wages as defined in section 2(88); no automatic addition. **No Basic, DA or other component fields are added; no component-summing helper.**
- **Defaults:** no personal value is prefilled, and **no employee type is preselected** (owner direction, 2026-10-21; P4): the visitor makes an explicit choice, which hides no assumption.
- **Limits, in three separate classes [reconciled 2026-10-21; P5]:**
  - **Statutory restriction (the only one):** an exit date before 21 November 2025 is outside the supported scope (D4, not an error), and the type determines the rule path. No statutory limit on wages or on service length is claimed, because none was found in the sources read.
  - **Technical safety limits (derived, not opinions):** the calendar accepts years 1 to 9999, the range of the existing `date-difference` engine, so counted years are below 10,000; the amount arithmetic `2 × wagesPaise × 15 × N + 26` must stay within the safe-integer range (2^53 − 1, about 9.0e15), so the maximum wages in paise is derived as `floor((2^53 − 1 − 26) / (30 × maximum counted years))`, which for 9,999 counted years is about 3.0e10 paise (about ₹30 crore a month). Anything above that is refused with the message "This amount is too large to calculate exactly". The engine states the derivation in a comment and a guard test pins it.
  - **Plausibility limits (product choice; owner decision 2026-10-21: retained provisionally):** Section 5 proposes refusing wages above ₹1,00,00,000 a month as "a sanity limit, confirmed in G3". **The owner retains that Section 5 limit provisionally and it is reviewed before implementation (G4 and G5)**; it is not statutory and not technical, and G3 does not change it. The first G3 text also proposed a joining year from 1950 and service up to 70 years; **those two are withdrawn as unsupported inventions.** The technical limits above apply in any case.
- **No clock:** the engine never reads "today". Future exit dates are valid planning dates; a future joining date is valid only with a later exit date.

### 33.6 Legal applicability design [PROPOSED; every branch cites Sections 0 and 7]
Decision order (the first matching rule wins); status and message identifiers are **stable codes**, so a wording change after the four-year decision never changes engine behaviour. Wording shown here is **placeholder text taken from Section 7.3 and is not final**.
| Step | Condition | Result code (proposed) | Amount | Depends on |
| --- | --- | --- | --- | --- |
| 1 | A field required for the chosen type is missing (the type itself, or any field shown for it) | `INCOMPLETE` | none | none |
| 2 | A field is invalid, or exit is before joining | `INVALID` (field errors) | none | none |
| 3 | Type is `other` | `UNSUPPORTED_OTHER_TYPE` (explains L3, L7: government, seasonal, piece-rated, journalist) | none | none |
| 4 | Exit date is before 21 Nov 2025 | `UNSUPPORTED_EARLIER_LAW` (D4) | none | none |
| 5 | `fixedTerm` and contract ends earlier | `UNSUPPORTED_FT_EARLY_END` (F5) | none | none |
| 6 | `fixedTerm`, expires, service under 1 year | `FT_UNDER_ONE_YEAR` (F4) | none | D10 (service) |
| 7 | `fixedTerm`, expires, at least 1 year | `FT_ONE_YEAR_MET` (F1, F2) | **illustrative** (F3, B3b) | D10 |
| 8 | `regular`, service at least 5 years | `STATUS_FIVE_YEARS_REACHED` (7.3 item 1) | "estimated" | D10 |
| 9 | `regular`, service at least the four-year line and under 5 years | `STATUS_FIFTH_YEAR_UNDETERMINED` (7.3 item 2) | **illustrative** | D10, **four-year line** |
| 10 | `regular`, below the four-year line | `STATUS_THRESHOLD_NOT_REACHED` (7.3 item 3) | none; the explorer shows the calendar five-year date | D10, **four-year line** |
- **Successive or renewed contracts (F6)** are not an input: the fixed-term path states, in its assumptions, that service under a single contract is measured and that renewals are not summed.
- **Contractor staff (F8):** the radio label says "Regular employee (including an employee of a contractor)"; the page notes that a contractor's employee on a written fixed-term contract with the contractor is not covered by this verification.
- **Uncertainty is never ineligibility:** codes 9 and 10 never say "not eligible"; unsupported is never rendered as a status.
- **Establishment coverage (L13)** and **continuity of service (s.54(A))** are assumptions listed in the "check with payroll" block, not inputs.

### 33.7 Service-duration and formula design dependencies
- **Data flow:** raw inputs → normalize (wages to paise, dates to `{y,m,d}`) → validate → applicability (33.6) → service measurement → counted years N → eligibility status → amount (integer paise) → ceiling → structured result → presentation. **Rounding occurs once, at the end of the amount calculation (7.6); currency formatting occurs only in `index.js`.**
- **Service measurement** (`gratuity-calendar.js`): exclusive end = exit date + 1 day (both days counted); completed months *m* = largest *m* with `anniversary(join, m)` on or before the exclusive end; years, months, days as in 7.1. Everything else in the engine consumes only `{months, years, remMonths, days}`, so **D10 is isolated to one function** (`anniversary`): option A returns the same day or the last day of the month; option C′ returns the same day or **the first day of the next month**. The tests, the oracle and the expected values of 7.7 change with it; the module boundaries do not.
- **Site-consistency note for the disclosure:** `date-difference` already uses the option-A clamp anniversary but does not count the later date, so the same two dates can read one day differently in the two tools. The gratuity page states that it counts both the joining and the exit day.
- **Counted years N (7.2):** `N = years + 1` if the remaining period is more than six months, else `N = years`; **N feeds only the amount, never a status.**
- **Status boundaries (7.3):** status is a function of total completed months: `≥ 60` status 1; `≥ FOURTH_YEAR_LINE_MONTHS` (a single constant in `gratuity-rules.js`, **value pending the four-year decision; 48 is the Section 7.3 proposal**) and `< 60` status 2; below that, status 3. Changing the line or the wording is a constants-and-text change only.
- **Money (integer paise contract):** wages are integer paise from the digit parse. The exact amount is the fraction `wagesPaise × 15 × N ÷ 26`. **Ceiling comparison is an integer comparison before any rounding:** the ceiling applies when `wagesPaise × 15 × N > 26 × ceilingPaise`; `ceilingApplied` is true only then, and the amount is then exactly `ceilingPaise`. **Display rounding is half up to the nearest paisa:** `floor((2 × wagesPaise × 15 × N + 26) / 52)`, which equals `floor((x + 13) / 26)` for `x = wagesPaise × 15 × N`; an exact tie occurs when `x` leaves remainder 13 on division by 26. An exact value less than half a paisa below the ceiling can round up to the ceiling without `ceilingApplied` being true, which is the specified behaviour. All values are Numbers holding safe integers; the bound of 33.5 guarantees `2 × wagesPaise × 15 × N + 26` never exceeds 2^53 − 1, so **no BigInt is needed**; a guard test at the derived maximum pins it. The derived maximum is a technical limit, not a legal one.
- **Calendar five-year date and explorer targets:** the calendar five-year date is `anniversary(join, 60) − 1 day` (option-dependent). Explorer targets are the entered exit date plus 6 months and plus 12 months, labelled hypothetical. **The rule for adding months to an exit date is itself a calendar convention and is decided together with D10**: under option A it is the same day or the last day of the target month (the `addMonths` clamp); for option C′ the equivalent rule is **not yet defined** and must be settled before G6, so that the explorer never shows a date that the chosen convention would treat differently. Each explorer row calls the **same** measurement, status and amount functions; there is no second implementation.
- **Wage comparison:** two wages, the same dates and rules; the difference is the difference of the **two displayed amounts** (7.6).
- **Not in G3 or the first release:** the wage assistant, the fixed-term "pro rata" beyond F3's labelled reading, death and disablement.


### 33.8 Validation and structured result states [PROPOSED]
**Validation matrix** (the first problem per field is shown beside it; the first invalid field takes focus on Calculate, using `setFieldsInvalid` as the other calculators do):
| Field | Condition | Message class |
| --- | --- | --- |
| Employee type | Not chosen | Required |
| Contract end (fixed-term) | Not chosen | Required |
| Wages | Blank; letters, symbols or separators; negative; zero; more than two decimals; above the derived technical maximum (and above any plausibility limit the owner sets, P5) | Required / format / must be above zero / too large to calculate exactly |
| Joining date | Blank; not a real calendar date; before the minimum year | Required / not a real date / out of range |
| Exit date | Blank; not a real date; before the joining date | Required / not a real date / "cannot be before the joining date" |
| Exit date | On or after joining but before 21 Nov 2025 | **Not an error**: the D4 unsupported state |
Messages are specific, located and actionable; the typed text stays editable (rulebook 8.6). Partial or conflicting inputs (for example a fixed-term contract end chosen, then the type changed) clear the hidden field's value and its error.

**Structured result (shape only, no code; field names are PROPOSED for G4 review):**
- `status`: one of `ok`, `incomplete`, `invalid`, `unsupported`, `error` (an unexpected exception inside the engine).
- `code`: the stable identifier of 33.6 (for example `STATUS_FIVE_YEARS_REACHED`) or an error code.
- `eligibility`: `{ id, subjectToConditions: true }` for the regular path, or the fixed-term code; **never a boolean "eligible"**.
- `service`: `{ totalMonths, years, months, days, conventionId, exclusiveEnd }`; `countedYears` (the amount only).
- `amount`: `{ kind: "estimated" | "illustrative" | "none", paise: integer | null, ceilingApplied: boolean, ceilingPaise, exactNumerator, exactDenominator }`; **`paise` is `null` whenever `kind` is `none`; an error or unsupported result is never a zero amount.**
- `trace`: the normalized inputs, the rule-set "checked on" date and the formula identifier.
- `assumptions`, `checkWithPayroll`, `disclosures`: arrays of stable identifiers; the page owns the sentences.
- `errors`: `[ { field, code } ]` when `status` is `invalid` or `incomplete`.
- **Contract rules:** the result is frozen; the input is never mutated; repeated calls are identical; no `NaN` or `Infinity` can appear; the engine returns identifiers and numbers, the page formats and words them.

**State table (what the page shows, announces and focuses):**
| State | Heading and amount | Announcement (live region, polite) | Focus |
| --- | --- | --- | --- |
| Initial | "Enter your details and press Calculate"; no amount; **no announcement** | none | none |
| Valid, status 1 | Status sentence; "Estimated gratuity" (subject to the conditions) | The status and the amount, once | **result heading, per Section 11** (see 33.11) |
| Valid, status 2 | Status sentence; "Illustrative amount, not an entitlement" | The status and "illustrative" | result heading |
| Valid, status 3 or fixed-term under one year | Status sentence; no amount; calendar five-year date | The status | result heading |
| Fixed-term met (F1) | One-year status; "Illustrative amount, not an entitlement" | as above | result heading |
| Unsupported (three codes: other type, earlier law, fixed-term early end) | Explanation of why and what to ask; no amount | The explanation title | result heading |
| Incomplete or invalid | Inline errors; no result | "Check the highlighted fields" | **first invalid field** |
| Stale (an edit after a result) | The old result stays visible, labelled out of date (the PPF behaviour); never shown as current | "Result is out of date" (debounced) | unchanged |
| Reset | Starting state | "Reset to the starting values." (immediate) | first field |
| Technical error | The shared tool error message; the form is not left blank | n/a | n/a |

### 33.9 Form and result UX [PROPOSED]
**Page order (shared shell around it, one `<h1>`):** breadcrumb (shared; not drawn by the tool) → H1 "Gratuity Calculator (India)" with one sentence of purpose and scope ("an estimate under the Code on Social Security, 2020 for exits from 21 November 2025") and the **"Rules checked on" date** → form card → result region → "How this was worked out" (collapsible) → "Check with your employer or payroll" → Assumptions → collapsed "Explore other exit dates" and "Compare another wage" (P1, G6) → a short "Questions people ask" block only if G7 justifies it → shared related tools and articles → footer.
**Text wireframe, 390 px:**
```
[Breadcrumb]
Gratuity Calculator (India)
Estimate under the Code on Social Security, 2020, for exits from 21 Nov 2025.
Rules checked on <date>
-----------------------------------
Who are you?  ( ) Regular employee (incl. a contractor's)
              ( ) Fixed-term, engaged directly
              ( ) Other
[fixed-term only] How does the contract end?  ( ) It expires  ( ) Earlier
Monthly wages for gratuity (₹)  [ ______ ]  hint: not gross salary ...
Joining date [ date ]     Exit date [ date ]
[ Calculate ]  [ Reset ]
-----------------------------------
<status sentence>
<Estimated gratuity | Illustrative amount>   ₹ 1,44,230.77
Ceiling note (only when it applied)
Check with your employer or payroll  (list)
v How this was worked out   (service, counted years, formula with numbers)
v Assumptions
v Explore other exit dates     v Compare another wage
```
Desktop: the same order in the shared calculator layout, form and result side by side only if the existing calculator layout already does so (to be checked against `calculator-responsive.css` in G5); no new layout system.
- **Calculate and Reset:** Calculate is the primary button, Reset the secondary, both with the shared `calculator-form__button` classes and visibly distinct enabled states. Calculate validates, computes, renders, announces and, per Section 11, moves focus to the result heading (33.11). An edit after a result marks it stale; **it never recalculates silently and never shows a figure for inputs it was not calculated from.** Reset clears every field and error, removes the result and the scenario panels, announces, and focuses the first field.
- **Result blocks (Section 6):** eligibility explanation, amount line, ceiling, working, assumptions, "check with payroll". On a phone the first view is the status sentence and the amount line; the rest follows in short blocks, with the working collapsible. **Status wording is placeholder text from Section 7.3 and stays marked "pending the four-year decision" until it is recorded.**
- **P1 panels (G6):** the explorer table (regular employees only) and the comparison reuse the engine; **Copy summary** (conditional) writes plain text to the clipboard **on an explicit click only**, never to a URL or storage; if the clipboard is unavailable the text is shown for manual copy.
- **No** PDF, history, account, share link or saved scenario (rulebook 7.7).

### 33.10 Mobile and responsive design [PROPOSED]
- **320, 360 and 390 px:** one column; full-width controls; radio options as full-width rows of about 44 px height; native date inputs; the decimal keypad for wages; the amount line large enough to read and wrapping at the thousands separators rather than clipping (`overflow-wrap`), checked with the longest value `₹20,00,000.00` and a long illustrative line; buttons stacked at 320 px and side by side from the existing breakpoint; **no page-level horizontal scroll**; the explorer table becomes stacked rows below the existing small breakpoint (PPF wraps its table in a focusable, labelled scroll region: `role="region"`, `tabindex="0"`, `aria-label`).
- **Tablet and desktop:** the shared calculator container and tokens (Inter and the green action colour from the shared token layer, **to be re-read from `variables.css` in G5, not assumed**); no new breakpoints, no global restyle.
- **Tool CSS** holds only what this tool alone needs (the six-block result, the status line, the stale label), in `gratuity.css`.

### 33.11 Accessibility and focus behaviour [PROPOSED]
- One `<h1>`; headings in order; radio groups in `fieldset` with `legend`; every input has a visible `<label>`; hints and errors are linked with `aria-describedby`; invalid inputs carry `aria-invalid`; hidden fields (fixed-term contract end, the "Other" case) are removed from the tab order and are not announced.
- **Tab order** follows the visual order: type, contract end, wages, joining date, exit date, Calculate, Reset, then the result sections and panels.
- **Announcements:** one polite live region (`role="status"`), **no announcement on load**, one announcement per Calculate, a debounced "out of date" announcement after an edit, an immediate announcement on Reset.
- **Focus [P2; Section 11 governs]:** Section 11 states: "After Calculate, focus moves to the result heading and a polite live region announces the status once; after Reset, focus returns to the first field." **That committed contract takes precedence, and this design follows it**: the result heading carries `tabindex="-1"` and receives focus on a successful Calculate; the live region announces the status once; on an invalid Calculate focus goes to the first invalid field; after Reset it goes to the first field. **Reported difference:** the existing calculators inspected (PPF, SWP) announce in the live region and leave focus on the button (33.3). That is a site convention, not an approved rule for this tool, and it is **not** applied silently. **Owner decision (2026-10-21): Section 11 is kept unchanged, and neither wording proposed in 33.19 is applied**, so that no second accessibility behaviour is introduced before the real interface has been tested. Whether heading focus plus the live region speaks the status twice is to be examined on the built page (owner manual check, G9).
- Visible focus and 4.5:1 and 3:1 contrast from the shared tokens; reduced motion honoured (no animation is added); no meaning by colour alone (the status is text, the stale state is a text label).
- **No claim** of screen-reader compliance is made: assistive-technology behaviour is unverified until tested.

### 33.12 Manual-first verification strategy [PROPOSED]
Follows rulebook 10.13. **Claude (focused, automated):** syntax and static checks, the pure-module tests of 33.13, and a narrow pinned-expectation check when registration changes shared listings. **Owner (manual):** appearance and interaction on a phone at the three widths, the keyboard basics, the consent banner, the related links. **No** routine Playwright suite, Lighthouse or full regression; substantial browser automation needs explicit approval and would run on a GitHub-hosted runner.
**Owner checklist (G9; URL when staged: `https://salar500.github.io/Toolzenhub/calculators/gratuity/`, route per the Calculators prefix; to be confirmed after registration).** Cases M1 to M11 and M5b of Section 25 carry the exact inputs and expected values; expected values for rows marked CONDITIONAL are recomputed after D10 and the four-year decision. For each case: open the page, enter the values, press Calculate, compare the status sentence and the amount, then **Pass** if both match and nothing overflows horizontally, **Fail** otherwise (screenshot at 320 and 390 px). Add: the validation messages (blank, zero, reversed dates), Reset, the stale label after an edit, keyboard-only completion, the explorer and comparison panels (G6), and the related links. **Manual acceptance does not establish numerical or legal correctness.**

### 33.13 Mandatory numerical correctness test design [PROPOSED]
- **Files (G4):** `tests/fixtures/gratuity-golden.py` (the independent oracle: `fractions.Fraction` money, a **month-walking** date method, neither shares code with the engine), `tests/fixtures/gratuity-golden.json` (its output), `tests/unit/gratuity-golden.test.mjs` (table-driven, reads the JSON, calls the pure engine). Expected values come from the oracle and from direct arithmetic, **never from the function under test**; no tolerance is used to weaken a comparison.
- **Groups and identifiers** (the numbered ranges used in 33.2 are indicative; individual case identifiers are allocated in G4 within each group):
  - T-VAL (validation): wages blank, zero, negative, above the **derived technical maximum** (and exactly at it), three decimals, letters, **comma and space separators refused** (until P3b is approved), a fraction of a rupee, the digit-arithmetic parse (for example 0.07 and 1234567.89 give exact paise with no floating-point drift); dates blank, impossible (30 February, month 13, day 0), reversed; the 21 Nov 2025 boundary; the hidden-field rule.
  - T-CAL (service): **PENDING on D10**: the 14 regular and 5 fixed-term rows of 7.7, 29 February and month-end joins, leap-year spans, the 60-month and 59-month boundaries, exact anniversaries and plus or minus one day, counted years at remainders of 5 months, exactly 6 months, 6 months 1 day, 7 and 11 months, timezone invariance (the engine uses no `Date`; the test runs under two `TZ` values).
  - T-ELG (status): status 1, 2 and 3 at the boundaries, **PENDING on the four-year line**; N never altering a status.
  - T-AMT (amount): N = 4, 5, 6, 8; wages ₹50,000, ₹30,000 and ₹1,00,000; the half-up paisa threshold with an exact tie; the ceiling below, at and above ₹20,00,000 with the integer comparison `x > 26 × ceilingPaise`, **including a case where the exact value is less than half a paisa below the ceiling** (rounds up to the ceiling, `ceilingApplied` false) and one just above it (`ceilingApplied` true); exact half-paisa ties built from `x` with remainder 13 modulo 26; the "difference of displayed amounts" rule; the safe-integer guard (the maximum wages and service).
  - T-FT (fixed-term): F1 to F8 incl. 11 months, exactly 12, 1 year 6 months, 1 year 6 months 1 day, "ends earlier", and the contractor mapping.
  - T-APP (applicability order): the ten steps of 33.6 in order, including "Other" ignoring hidden fields.
  - T-SCN (scenarios): explorer rows and the comparison use the same engine; row targets by the clamp date rule; a wage difference is the difference of displayed amounts.
  - T-SEC (safety): inputs as strings of unexpected shapes (objects, arrays, very long strings, `__proto__` keys), frozen input unchanged, repeated calls equal, no `NaN`, `Infinity`, `-0`.
- **Pending rule:** every case whose expected value depends on D10 or the four-year line is stored with the flag `pending` and **not asserted** until the decision is recorded; none is invented.
- **Failure handling:** classify a failure as a product defect, a wrong test, an ambiguous specification or an evidence conflict; fix minimally; never weaken an assertion to pass. High-risk correctness is never deferred to a milestone (rulebook 10.11).

### 33.14 Security and privacy boundaries [PROPOSED]
All calculation is in the browser; the engine has no network, storage, cookie, URL, clock or analytics access; values never enter the URL, `localStorage`, `sessionStorage`, logs or the console; user text is written with `textContent` or `escapeHTML`, never `innerHTML`; the copy summary uses the clipboard only on an explicit click. The engine accepts untrusted strings and must not trust prototypes or coerce types. **Truthful statement for the page:** the calculation does not send your inputs anywhere; the site may load consent-controlled analytics that sees only the page address (rulebook 8.8), so the page does not claim "no network at all".

### 33.15 Integration impact matrix [PROPOSED; paths marked existing were verified]
| File | Existing or new | Change | Consumers at risk | Focused verification | Rollback |
| --- | --- | --- | --- | --- | --- |
| `assets/js/calculators/formulas/gratuity-rules.js`, `gratuity-calendar.js`, `gratuity.js` | new | The engine | none until registered | the T-series | delete the files |
| `assets/js/calculators/gratuity/index.js`, `assets/css/calculators/gratuity.css` | new | The page | none until registered | owner manual checks | delete the files |
| `assets/js/data/tools.js` | **existing** | One new entry (`id: "gratuity"`, loader, category per D5, aliases, capabilities verified against `data/tool-capabilities.js`, seo) | listings, search, relationships, sitemap, related cards on the category | the pinned unit tests below | `git revert` |
| `src/_data/toolStyles.json` | **existing** | One entry listing the shared and tool stylesheets | the generated page only | the page loads its styles | `git revert` |
| `scripts/growth-manifest/identity-ledger.json` | **existing** | The Growth identity record (as PPF did) | the Growth manifest tests | the manifest check | `git revert` |
| Pinned tests: `tests/unit/catalog`, `sections`, `relationships`, `search`, `taxonomy`, `directory` tests | **existing** | Counts and lists | themselves | those tests | `git revert` |
| Baselines and inventory: `tests/inventory/url-inventory.json`, the DOM, links and SEO baselines, `tests/browser/navigation.spec.js` | **existing** | Reviewed edits, listing only what changed | the category and directory listings | review each changed baseline by eye; no blanket update | `git revert` |
| Routes, registry, breadcrumb, `tool-page.js`, `entries/tool.js`, `data/calculators.js`, `calculator-registry.js`, shared UI helpers, shared CSS | **existing** | **No change** | none | none | none |
The touch-list of `docs/tool-pack-factory.md` section 7 is the checklist; the affected listing baselines are named during G7, not afterwards. Registering the tool does **not** add a breadcrumb, because the shared shell owns it.

### 33.16 Proposed implementation file matrix by milestone
G4: `gratuity-rules.js`, `gratuity-calendar.js`, `gratuity.js`, `gratuity-golden.py`, `gratuity-golden.json`, `gratuity-golden.test.mjs`. G5: `gratuity/index.js`, `gratuity.css`. G6: panels inside `gratuity/index.js` and the engine's `explore` and `compareWages` (already in G4 so one engine is tested once). G7: the existing registration and pinned files of 33.15, then supporting content only if unblocked. No other file is touched.

### 33.17 Risk and blocker register
| # | Risk or blocker | Likelihood | Impact | Mitigation | Verification | Blocking |
| --- | --- | --- | --- | --- | --- | --- |
| K1 | D10 unsettled: month-end results differ for joins on the 29th to 31st | Certain until decided | One counted year (₹28,846.15 at ₹50,000) | Isolate `anniversary`; decide before G4 | T-CAL | **Blocks G4** |
| K2 | Four-year line and status wording unsettled | Certain until decided | Misleading eligibility copy | Constant plus stable codes; no "eligible" wording | T-ELG | **Blocks G4 status code and G5 wording** |
| K3 | Ceiling notification not read in the gazette | Medium | Wrong cap | Constant with source and date; release gate | Gazette check before release | Release gate |
| K4 | Wrong legal reading in a contested case | Medium | Wrong money or status | Statuses never assert eligibility; illustrative labels; review recommended (D8) | Review, if done | Not G3; advisory |
| K5 | Wage misunderstanding (gross entered) | High | Overstated figure | Hint, "check with payroll", no gross label | Owner manual read | No |
| K6 | Date edge errors (leap, month-end) | Medium | Wrong N | Independent oracle; boundary table | T-CAL | Blocks G4 until D10 |
| K7 | Float or rounding errors | Low | Paise errors | Integer paise; half-up at the end; guard test | T-AMT | No |
| K8 | Misleading success-shaped result for an error | Low | Trust | Result contract: `paise: null` for none; tests | T-SEC, T-APP | No |
| K9 | Shared registration regressions (listings, counts) | Medium | Broken pinned tests | Touch-list; named baselines; narrow checks | Pinned tests | No |
| K10 | Cross-tool date helper coupling | Low if (b) is chosen | Silent drift | Independent module and tests | T-CAL | Owner choice P1 |
| K11 | Mobile overflow of long rupee figures | Medium | Unreadable result | `overflow-wrap`; check at 320 px | Owner manual | No |
| K12 | Assistive-technology behaviour unknown | Medium | Inaccessible result | Follow existing patterns; announce honestly; test later | Owner or later AT check | No |
| K13 | Privacy overclaim | Low | Trust | Truthful wording (33.14) | Wording review | No |
| K14 | Packaging or deployment mistakes | Low | Production risk | Separate approvals G10 to G12; backup first | G11 checklist | Release gate |
| K15 | No independent review (D8) | Certain | Residual interpretation risk | Recommend before release; never claim | Evidence only | Advisory |
| K16 | Section 11's focus contract differs from the PPF and SWP convention | Certain | Inconsistent behaviour across tools | Follow Section 11, unchanged (owner decision 2026-10-21); examine the heading focus and live region together on the built page | Owner manual check of focus and announcement (G9) | No |
| K17 | The wage plausibility limit (Section 5, ₹1,00,00,000) is provisional | Certain until reviewed | A typing slip yields a very large estimate, or a legitimate value is refused | Retained provisionally; technical limits apply in any case; review before implementation | T-VAL | No (review item before G4 and G5) |

### 33.18 Mapping to the authoritative G0 to G13 milestones (Section 30)
The pack's G0 to G15 map is **not adopted**. Correspondence by name and number:
| Pack phase (planning only) | Authoritative milestone (Section 30) |
| --- | --- |
| G0 Discovery, G1 Legal, G2 Functional specification | **G0, G1, G2** (done) |
| G3 Detailed design | **G3** (this section) |
| Owner decision gate | The gate before **G4** (33.19) |
| G4 Calculation engine | **G4** |
| G5 Interface | **G5** |
| (no pack equivalent) | **G6** Approved P1 features (explorer, comparison, copy) |
| G6 Integration | **G7** Catalog, search, sitemap, relationships, pinned tests |
| G9 Supporting content and SEO | **G7** (articles only if unblocked) |
| G7 Focused verification | **G8** Focused correctness verification |
| G8 Owner manual acceptance | **G9** Owner manual acceptance |
| G11 Staging | **G10** Staging release |
| G10 Release readiness, G12 Production package | **G11** Release package, backup and rollback |
| G13 Hostinger deployment, G14 Production verification | **G12** Production deployment (with its post-release checks) |
| G15 Closure | **G13** Feedback and law-change review (and closure record) |
A future pack handoff that names "G6 integration" means **G7**; "G8 acceptance" means **G9**; "G11 staging" means **G10**.

### 33.19 Approval requirements for the next milestone (G4) and G3 decisions
**Technical decisions P1 to P6** (none is a legal decision; D10, the four-year line and the ceiling verification are separate). The owner's decisions of 2026-10-21 (the G3 commit authorization) are recorded below; D10, the four-year line and the ceiling verification remain **unresolved**.
| # | Definition and alternatives (as raised in G3) | Owner direction, 2026-10-21 | Treatment in Section 33 |
| --- | --- | --- | --- |
| P1 | **Date helper:** (a) import `dayNumber`, `addMonths`, `parseDate` from `tools/date-difference/date-engine.js`; (b) a small independent `gratuity-calendar.js`; (c) extract a shared helper (edits an existing tool, rulebook 9.3 approval) | **Decided 2026-10-21:** a dedicated `gratuity-calendar.js`, subject to the approved date-counting contract | (b) is the design; the contract (D10) is still pending; (a) and (c) are not pursued |
| P2 | **Focus after Calculate:** (i) Section 11 as committed; (ii) the existing calculators' convention (announce in the live region, keep focus on the button) | **Decided 2026-10-21:** keep Section 11 unchanged: focus moves to the result heading after Calculate; no second accessibility behaviour before the real interface is tested | The design follows (i); (ii) and the proposed additions are recorded, **not applied**; **Section 11 is unchanged** |
| P3 | **Wages control:** a text input with `inputmode="decimal"` and a strict parser, or the shared `numberField` (`type="number"`) | **Decided 2026-10-21:** a text input with strict parsing, matching the G2 constraints | Adopted. **P3b decided 2026-10-21:** comma and space separators (a pasted "1,50,000") are **rejected for now** with a helpful validation message (rulebook 8.5: never silently change what was typed); revisit only by a later decision |
| P4 | **Employee type preselection:** none, or "Regular" | **Decided 2026-10-21:** no preselection; an intentional choice | Adopted (33.5) |
| P5 | **Limits:** restated 2026-10-21 in three classes (33.5): statutory (only the D4 date), technical (derived from safe-integer arithmetic and the engine's calendar range), plausibility (product choices) | **Decided 2026-10-21:** retain Section 5's ₹1,00,00,000 specification limit **provisionally**, reviewed before implementation; no invented legal, salary or service thresholds | Technical limits derived and stated; the first G3 figures for the joining year (1950) and service (70 years) **withdrawn**; the ₹1,00,00,000 limit is a provisional product limit, not statutory and not technical |
| P6 | **Supporting content:** a short "Questions people ask" block | **Decided 2026-10-21:** defer to the authoritative **G7**; keep it concise and tied to verified behaviour | Deferred to **G7** (supporting content only if unblocked) of the authoritative plan; never filler |

**P2 in detail.** The conflicting statements are: Section 11, "After Calculate, focus moves to the result heading and a polite live region announces the status once; after Reset, focus returns to the first field" (repeated by reference in Section 18), against the PPF and SWP behaviour in 33.3. The first G3 draft of 33.8 and 33.11 followed the PPF convention and so contradicted Section 11; **that is corrected**. If the owner **keeps** Section 11, the smallest wording change is an addition, proposed and **not applied**: "The result heading takes focus and the live region announces only the amount line, so the status is not spoken twice." If the owner prefers the site convention, the smallest replacement is, proposed and **not applied**: "After Calculate, a polite live region announces the status once and focus stays on Calculate; after Reset, focus returns to the first field." Either way Section 33.8, 33.9 and 33.11 are the only places to adjust. **Owner decision 2026-10-21: Section 11 is kept unchanged and neither proposed wording is applied**, to avoid introducing a second accessibility behaviour before the actual interface is tested.

**Before G4 may start (all required):**
1. The owner reviews and approves this G3 design (a commit approval is separate).
2. **D10 is decided** (A with disclosure, or C′) and recorded in Section 29.
3. **The four-year line and the status wording are decided** and recorded in Section 7.3 and 29.
4. P1 to P6 are decided (2026-10-21); the provisional wage limit of P5 is reviewed before implementation.
5. The ceiling is carried as the drafting constant with its source and date; the gazette check stays a **release** gate (B6).
6. G4 is authorized in a separate instruction, with the phase numbering of Section 30.
**G4 is BLOCKED until 2 and 3 are done.** G4 changes only the six files of 33.16, leaves them uncommitted for review, runs only the focused pure-module tests of 33.13, and stops.

### 33.20 G3 readiness
**DESIGN COMPLETE, LEGAL DECISIONS PENDING.** All four G3 blocks are covered: architecture and integration (33.3, 33.4, 33.15, 33.16), calculation, legal and validation design (33.5 to 33.8, 33.13), UX, mobile and accessibility (33.9 to 33.12), and verification, risks and gates (33.12, 33.13, 33.17 to 33.19). D10 and the four-year line remain open and are not chosen here.
