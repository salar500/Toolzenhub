# Tool Pack 26: PPF Calculator (Roadmap R1 item 4)

Status: **specification approved by the owner on 2026-10-13 with the decisions recorded at the end of this document; evidence limits remain (section 0.3). Not implemented.**      Base commit: a53088e      Reserved id and slug: `ppf` (route `/calculators/ppf/`)
Roadmap: item 4 of Roadmap R1 (`docs/tool-pack-factory.md` section 10). The roadmap does not authorize this build; approval of this specification does. R1 progress when written: 3 of 8.
Section and category: **Calculators**, **Investment** (flat, no subcategory). The catalog already holds a Coming Soon entry `ppf` ("PPF Calculator", category `investment`); its id and slug are kept.

This specification was prepared in a read-only research phase on 2026-10-12, revised by an evidence gate on 2026-10-13 (the official Scheme text and orders were read) and finalised on 2026-10-13 with the owner's decisions (D4, D5, D6, D8, D12, U8) and four review corrections. Nothing was implemented, no catalog, article, ledger or test was changed, and nothing was pushed. The approval covers this document only, not implementation.

## 0. Evidence record

Status of the evidence: **Evidence gate run on 2026-10-13** (second pass). Rules are classed as **official scheme requirement**, **official procedural practice** (Department of Posts orders), **simplifying V1 assumption**, **projection beyond initial maturity**, or **unsupported or unresolved**. Search demand, retention and competition for this tool remain **hypotheses, not data** (rulebook 12).

### 0.1 Sources, and what was actually read
| # | Source | How it was read | Reliability |
| --- | --- | --- | --- |
| S1 | **Public Provident Fund Scheme, 2019**, Ministry of Finance (DEA), G.S.R. 915(E), 12 December 2019. India Post copy: `indiapost.gov.in/documents/offerings/schemesandservices/posb/PublicProvidentFundScheme2019English.pdf` | The PDF's English text layer was extracted locally (the fonts carry plain character codes) and read directly: paras 2 to 16. The Hindi columns are not readable and were not used. | **Primary, read.** Some words are cut at line ends by the extraction; the clauses used here are complete in meaning. |
| S2 | **G.S.R. 290(E), the Public Provident Fund (Amendment) Scheme, 2020**, dated 5 May 2020, deemed in force from 1 April 2020, as forwarded by **Department of Posts SB Order No. 15/2020, 13.05.2020** (`utilities.cept.gov.in/dop/pdfbind.ashx?id=4502`) | The text layer of the SB Order PDF was extracted and read; the notification text matches the reproduction on staffnews.in. | **Primary (an official forwarding of the gazette text), read.** |
| S3 | **Department of Posts S.B. Order 08/2020, 14.02.2020**, amendments to the PPF procedural rules in the POSB (CBS) Manual (`utilities.cept.gov.in/dop/pdfbind.ashx?id=4242`) | Scanned pages, read as images: rules 106(vii), 106(xxvii), 108(1)(iii)(iv), 108(4). | **Primary, read; a procedural order of the Post Office** (it binds post-office accounts, not necessarily every bank). |
| S4 | **DEA (Budget Division) Office Memoranda F.No.1/4/2019-NS**, listed at `dea.gov.in/budget-division/475` and read as images: **30.03.2026** (Q1 FY 2026-27 unchanged from Q4 FY 2025-26), **30.06.2026** (Q2 unchanged from Q1) and **30.09.2026** (Q3, **1 October to 31 December 2026**, unchanged from Q2) | Each states that "the rates of interest on various Small Savings Schemes ... shall remain unchanged"; **none prints a PPF figure.** | **Primary, read.** |
| S5 | Press reports of the Q3 announcement (PTI-based pieces, 30 September to 1 October 2026): PPF **7.1%**, unchanged | Search summaries | Secondary. |
| S6 | Search summaries for the 2023 amendment: **G.S.R. 831(E)**, PPF (Amendment) Scheme 2023 (gazette 07.11.2023; DoP SB Order 22/2023, 14.11.2023) amending only the second proviso of para 13 (premature closure) | gconnect.in summary | Secondary; **premature closure is not modelled**, so it does not affect V1. |
| — | **Requested but unavailable:** `indiapost.gov.in/VAS/DOP_PDFFiles/SBORDER12020.pdf` returned **HTTP 404** (13 October 2026) | — | The equivalent official orders were found on `utilities.cept.gov.in` (S2, S3). |
| — | Not obtained: the **Government Savings Promotion General Rules, 2018**, the Income Tax and NSI pages (HTTP 403 or script-driven) | — | Gaps behind U3 and U6. |

### 0.2 Official scheme requirements (S1 unless stated)
- **C1 Accounts (para 3).** An individual may open an account; may also open one account for each minor or person of unsound mind of whom they are guardian, **one account per minor**; **joint accounts are not allowed**.
- **C2 Yearly deposit (para 4).** Not less than **₹500** and not more than **₹1,50,000** in a year, in **multiples of ₹50**; the ₹1,50,000 limit is **inclusive of deposits in the individual's own account and in the account opened for the minor** (4(2)). Opening deposit minimum ₹500 (5(1)). Deposits "in one lump sum or in instalments" (5(2)).
- **C3 "Year" (para 2(1)(f)):** the **financial year**.
- **C4 Deposits in a default-year and the limit (para 6).** A regular account that misses the ₹500 minimum in a year is treated as discontinued; it may be revived during its maturity period on payment of **₹50** and **₹500 for each year of default**; the year's total deposit limit includes arrears for default years but excludes the fee (6(5)). A discontinued account gets no loan or partial withdrawal (6(3)).
- **C5 Interest rule (para 7).** Interest is "eligible for a calendar month on the **lowest balance at the credit of an account between the close of the fifth day and the end of the month**" (7(1)); **credited to the account at the end of each year** (7(2)); credited regardless of transfer (7(3)).
- **C6 The rate, as amended (S2).** Para 7(1) was substituted by G.S.R. 290(E), **deemed in force from 1 April 2020**: deposits made **12 December 2019 to 31 March 2020** (and the balances) bear **7.9% per annum** (7(1)); deposits made **on or after 1 April 2020** (and the balances) bear **7.1% per annum** (7(1A)); in both, the lowest balance after the 5th is what earns interest. The original 2019 text (7.9% for all) therefore no longer describes the rate for new deposits.
- **C7 Rates "from time to time" (S3, S4).** The post-office procedural rule says interest is "admissible at rates prescribed from time to time by the Central Government" and "calculated ... on 31st March day end ... and credited into the account on 1st April" (rule 108(4)). DEA publishes a memorandum each quarter; the three read for 2026-27 say the rates are **unchanged** from the previous quarter (S4). I found **no later amendment of para 7** (the only later amendment found, G.S.R. 831(E) of 2023, concerns para 13).
- **C8 Maturity (para 11(1)).** Closure of the account and payment of the **entire balance with due interest up to the last day of the month preceding the month of closure** is possible "any time after the expiry of **fifteen years from the end of the year in which the account was opened**" (so an account opened in April 2026 matures on 31 March 2042, which is the end of the **16th** financial year of its existence).
- **C9 After maturity (paras 11 and 12).** The holder may **retain the account without deposits** for any period; the balance keeps earning interest at the rate applicable; **one withdrawal a year** (11(2)); once continued without deposits for more than a year, the option to resume deposits is lost (11(3)). The holder may **extend with deposits for a further block of five years**, on application in Form-4 **within one year of maturity** (12(1), 12(2); the Post Office order 106(xxvii) says the same); without that option no deposits are accepted and any made are refunded without interest (12(3)); the balance at maturity keeps earning interest up to the month before closure (12(3) proviso). The provisions repeat at the end of each extended block (12(5)); the holder may leave the account without deposits on completing any block (12(6)); the option, once given, cannot be withdrawn (12(7)). During an extended block, total partial withdrawal is capped at **60%** of the balance at the start of the block (12(4)).
- **C10 Partial withdrawal (para 10).** After expiry of **five years from the end of the year of opening**; not more than **50%** of the amount at credit "at the end of the **fourth year immediately preceding the year of withdrawal** or at the end of the **preceding year, whichever is lower**"; once a year; not from a discontinued account; any outstanding loan is paid first.
- **C11 Loan (paras 8 and 9).** After one year and before five years from the end of the year of the first deposit; up to **25%** of the amount at the end of the second year immediately preceding; one loan a year; no fresh loan until repaid in full; principal repaid within **36 months**; interest **1% per annum** on the principal, or **6%** if not repaid in 36 months.
- **C12 Premature closure (para 13).** Only after five years from the end of the year of opening, on the stated grounds (treatment of a life-threatening disease; higher education; change in residency status); interest allowed at a rate **1% lower** than the rate credited (13(1) provisos; the 2023 amendment changes the reference period, S6).
- **C13 Death (para 14), protection from attachment (para 15), hardship relaxation (para 17):** not used by this tool.

### 0.2a Official procedural practice (Post Office, S3; not verified for banks)
- **P1** "Deposits made in a PPF Account **up to 5th of a calendar month** (irrespective of the deposit if made by cash or cheque of Demand draft or any electronic mode) shall be eligible for earning interest" (rule 108(1)(iii)(iv)).
- **P2** "The subscriptions can be deposited in lump sum or in convenient installments. **More than one installment can be deposited in a month**" (rule 106(vii)). So the Scheme and the Post Office rules set **no cap on the number of deposits** (the old 12-a-year limit is not in either).
- **P3** Interest is calculated on **31 March, day end**, and credited on **1 April** (rule 108(4)).

### 0.3 Evidence-based resolutions and what stays unresolved
| # | Question | Status after the evidence gate |
| --- | --- | --- |
| U1 | Legal route of the rate, and the current rate | **Largely resolved.** The Scheme as amended (S2) fixes **7.1% for deposits on or after 1 April 2020** and the Post Office rule says rates are those "prescribed from time to time by the Central Government" (S3); the three 2026-27 DEA memoranda say **unchanged** through **31 December 2026** (S4); press reports give the figure 7.1% (S5). **Residual gap:** no 2026 primary document prints the PPF figure, and the quarterly memoranda from 2020 to 2025 were not read. The page must still not state a current rate as settled (D2). |
| U2 | Content of G.S.R. 290(E), 5 May 2020 | **Resolved.** It only substitutes para 7(1), giving 7.9% for deposits 12 Dec 2019 to 31 Mar 2020 and 7.1% for deposits from 1 Apr 2020 (C6). |
| U3 | Rounding of the interest credited | **Unresolved; handled by D8.** Neither the Scheme (S1) nor the Post Office order (S3) states a rounding rule, and the General Rules 2018 were not obtained. **Sensitivity measured** (section 7): rounding each year's interest to the nearest rupee moves a 15-year balance by under ₹3 in the four test cases; rounding each month's interest moves it by up to about ₹21. The page claims no convention and discloses the difference. |
| U4 | Partial-withdrawal base | **Resolved** (C10). Not modelled in V1. |
| U5 | Cap on deposits per year; deposit-date convention | **Resolved for the Scheme and the Post Office** (P1, P2). **Bank practice not verified.** |
| U6 | NRI, HUF eligibility and tax treatment; the 2024 regularisation memoranda | **Not researched; unsupported.** The page says nothing about them. (Form-4 as printed in S3 contains a "Resident Citizen of India" declaration at extension; it is not used.) |
| U7 | Late-March deposit pattern and a partial first year | **Product decisions**, not rule questions (D4, D5). The monthly arithmetic is simple: a deposit after the 5th earns from the next month. |
| U8 | Whether interest per month is exactly one twelfth of the annual rate | The Scheme says "interest at 7.1 per cent. per annum shall be eligible for a calendar month on the lowest balance". **Accepted by the owner on 2026-10-13 as the V1 calculation assumption (annual rate ÷ 12)**, shown in the methodology text (A8). It is an interpretation, not a verified official formula, and it does not verify any monthly rounding convention. |

## 1. Tool identity
- Catalog id `ppf` (existing, kept); title **PPF Calculator**; section Calculators; category Investment; no subcategory; route `/calculators/ppf/` (the route convention of the existing Investment tools); `toolType` as the other calculators.
- Description (catalog and SEO): "Estimate the balance of a Public Provident Fund account from a yearly or monthly deposit, the interest rate you enter and the number of years, with a year-by-year table and a comparison of one yearly deposit with the same total paid monthly. It uses the PPF rule that interest is worked out monthly and added once a year. It runs in your browser."
- Aliases (true of the tool): PPF calculator, public provident fund calculator, PPF maturity calculator, PPF interest calculator, PPF return calculator. **Not**: "best PPF", "PPF rate today", "PPF 2026 rate", any named bank or post office.
- Capabilities: the existing flags only, declared only if built, and **verified against the existing architecture (`assets/js/data/tool-capabilities.js` and the nearest tools, FD and SIP) during implementation. No flag name is asserted here.**

## 2. User problem
Someone who has opened, or is thinking of opening, a PPF account wants to see what a yearly or monthly deposit could grow to over a number of years, and why depositing earlier in the year or earlier in the month changes the figure. They use a spreadsheet, a bank's rough table or a generic "compound interest" calculator, none of which follows the PPF rule (interest on the lowest balance after the 5th of each month, added once a year). The tool applies that rule to the numbers they enter and shows the working.

## 3. Primary jobs to be done
1. "If I put ₹X into PPF every year (or every month), what could the balance be after N years at this rate?"
2. "How much of that is my money and how much is interest?"
3. "Does paying the whole year's amount in April, or paying monthly, change it, and by how much?"
4. "What does the balance look like year by year?"

## 4. Target users
People in India holding or considering a PPF account, comfortable entering a deposit and a rate. **Not** for: tax planning (no deduction or taxability), comparing PPF with other products as advice, modelling withdrawals or loans, NRI or HUF questions, or anyone wanting the current rate (a visitor enters it; the page does not supply it).

## 5. Inputs
| Label | Unit | Default | Min | Max | Step | Hint | Why |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Deposit pattern | choice | Yearly: all at the start of the year | | | | Two options (D4) | The timing is what the PPF interest rule rewards |
| Yearly deposit (when yearly) | ₹ per year | 1,50,000 | 500 | 1,50,000 | 50 | Multiples of ₹50 (rule C2) | Deposit |
| Monthly deposit (when monthly) | ₹ per month | 12,500 | 50 | 12,500 | 50 | Twelve deposits a year; the yearly total is at most ₹1,50,000 (C2) | Deposit |
| Interest rate | % per year | 7.1 (labelled **example**, D2) | **0** | 15 | 0.1 | "Enter the rate that applies to you. The Government reviews it every quarter." A rate of 0 is a calculation case (explained on the page), not a PPF rate; 15 is a typing-error bound of this tool, not a statement about PPF rates | The rate is not ours to supply |
| Years of deposits | whole financial years | **16** (the first term of an account opened in April, D6) | 1 | 50 | 1 | Year 16 is the earliest full closure for an April account; other years are projections (section 7a) | Horizon |
Left out, and why: an opening-month selector (D5: the April assumption is stated visibly instead), rate changes over time (D9), withdrawals and loans (D10), a minor's account (the limit note covers it), tax (D11).

## 6. Outputs
- **Primary:** the estimated balance at the end of the chosen number of years ("Estimated balance after N years").
- **Supporting:** total deposited; interest earned (displayed balance minus deposits, so the three figures reconcile); the share of the balance that is interest; the year-by-year table (section 13); and, when the yearly total allows it, the **annual-versus-monthly comparison** (section 13).
- **Not shown:** the current PPF rate; tax; a "return" or "yield" figure that suggests the account's return in other terms; advice; a comparison with any other product on the page.

## 7. Calculation / model rules
Pure module `assets/js/calculators/formulas/ppf.js` (no DOM; inputs validated at the edge). Unrounded arithmetic; rounding only for display (D8). Let `r` be the annual rate as a fraction.

**Model, month by month inside each financial year (the rule C5):**
- The balance at the start of year 1 is zero. In each month, deposits made on or before the 5th are in the balance after the 5th; since nothing is withdrawn, the **lowest balance between the close of the 5th and month-end equals the balance after that month's deposit**, and interest for the month is `balance_after_deposits × r / 12` (**V1 assumption U8**: the Scheme says the annual rate is "eligible for a calendar month"; dividing by 12 is our reading, not a stated formula and not a verified rounding convention).
- Interest is **not** added during the year; it is summed and **added to the balance once, at the end of the financial year** (C5), so it earns interest from the next year.
- *Yearly pattern:* the whole deposit `D` is made in April, on or before the 5th, so all twelve months earn interest on `opening + D`.
- *Monthly pattern:* `m` is deposited every month on or before the 5th (month `k` balance = opening + `k·m`).
- Years are counted as consecutive financial years from year 1 (A5).

**Closed forms (the independent check, section 25):**
- Yearly lump `D`: `B_n = D·(1+r)·((1+r)^n − 1)/r` (and `B_n = n·D` when `r = 0`).
- Monthly `m`: `B_n = (12m + 6.5·m·r)·((1+r)^n − 1)/r`, because the year's interest on the deposits is `(r/12)·m·(1+2+…+12) = 6.5·m·r` (and `B_n = 12·m·n` when `r = 0`).
Totals: deposits = `n·D` or `12·m·n`; interest = balance − deposits.

**Independent oracle.** `tests/fixtures/ppf-golden.py`, Python standard library only (`fractions` for exact arithmetic), **written from the rules in section 0.2 and not from the JavaScript**: (a) an exact month-by-month simulation that tracks the balance after each deposit and sums monthly interest, and (b) the closed forms above. Both must agree exactly before a value is written.

**Golden values, reviewed independently on 2026-10-13.** Each value below was recomputed with exact rational arithmetic from the rules (deposit by the 5th, interest `balance × r / 12` for each month on the balance after that month's deposits, added once at the end of the financial year, interest not earning interest within the year), and the simulation and the closed forms agreed to the last digit. Two are checkable by hand: one year of ₹1,50,000 in April is `150000 × 1.071 = ₹1,60,650`; one year of ₹12,500 a month is `1,50,000 + 12,500 × 0.071 × 6.5 = ₹1,55,768.75`. The earlier figures in this section did not change. **Shared-reading caveat (U8):** the oracle and the closed forms both read "per annum, for a calendar month" as one twelfth of the annual rate, so they cannot detect that reading being wrong.

| Scenario (7.1% used as a test value, not a claim about the current rate) | Deposited | Exact balance (unrounded) | If each year's interest is rounded to the nearest rupee | If each month's interest is rounded to the nearest rupee |
| --- | --- | --- | --- | --- |
| ₹1,50,000 in April each year, 15 years | ₹22,50,000 | ₹40,68,209.22 | ₹40,68,208 | ₹40,68,216 |
| ₹12,500 each month, 15 years | ₹22,50,000 | ₹39,44,599.22 | ₹39,44,600 | ₹39,44,620 |
| ₹500 in April each year, 15 years | ₹7,500 | ₹13,560.70 | ₹13,563 | ₹13,560 |
| ₹50 each month, 15 years | ₹9,000 | ₹15,778.40 | ₹15,778 | ₹15,781 |
| ₹1,50,000 in April, 1 year | ₹1,50,000 | ₹1,60,650.00 | | |
| ₹12,500 each month, 1 year | ₹1,50,000 | ₹1,55,768.75 | | |
| ₹1,50,000 in April each year, **16** years (the first term for an April account) | ₹24,00,000 | ₹45,17,702.07 | | |
| ₹12,500 each month, **16** years | ₹24,00,000 | ₹43,80,434.52 | | |
| *Projection beyond initial maturity:* ₹1,50,000 in April, 20 / 25 / 30 years | ₹30,00,000 / ₹37,50,000 / ₹45,00,000 | ₹66,58,288.17 / ₹1,03,08,014.97 / ₹1,54,50,910.59 | | |
| *Annual versus monthly, the same yearly total ₹1,50,000 (₹12,500 a month):* difference after 15 / 16 years | | ₹1,23,609.9985 / ₹1,37,267.5583 (displayed ₹1,23,610 / ₹1,37,268) in favour of April | | |
| Rate 0, any pattern | | equals the deposits | | |

**What the rounding rows say (D8).** No official rounding rule was found (U3). Rounding the yearly interest moves a 15-year balance by under ₹3 in these cases; rounding every month's interest moves it by up to about ₹21. The tool therefore shows whole rupees, calculates unrounded, and says a passbook can differ by a few rupees. The oracle records the unrounded value as the golden value and may report the two rounded variants as information, never as the expected result.

**Default scenario (D6):** ₹1,50,000 in April, 7.1%, 16 years is the headline example (₹45,17,702.07 exact).

**Reference only (deferred pattern, D4):** ₹1,50,000 deposited on the last day of March each year (after the 5th, so it earns from the next month and, in effect, a year later) gives ₹37,98,514.68 after 15 deposits against ₹40,68,209.22 for the April pattern: the same money, a gap of about ₹2.7 lakh, which is why the timing matters.

### 7b. Display rounding, tolerance and reconciliation (D8)
- **Internal arithmetic is unrounded** (IEEE double in the JavaScript module; exact fractions in the oracle). Nothing is rounded before the final display.
- **Display:** whole rupees, rounding halves up (a value exactly at .5 shows the higher rupee). Deposits are whole rupees already.
- **Reconciliation:** the displayed interest is the displayed balance minus the deposits, so balance, deposits and interest always add up on screen. In the table each closing balance is rounded from its exact value and each row's interest is `closing − opening − deposits` of the displayed figures, so every row adds up.
- **Tolerance, JavaScript against the oracle:** the module's balance must equal the oracle's exact value (given as a decimal string to 6 places) within **max(0.0001 rupee, 1e-12 × |value|)**. This covers the widest case (50 years at 15%, about ₹1.2 × 10^9) with room. The displayed whole-rupee result must equal the oracle's half-up rounding; **if the exact value lies within the tolerance of a .5 boundary, either neighbouring rupee is accepted and the vector is flagged by the oracle**. The oracle must search its vectors for values within 0.01 of a .5 boundary and include at least one, and the tests cover: exact .5 handling in the display function, a value just below and just above .5, rate 0 (balance equals deposits, interest 0, no division by the rate in the code path), the minimum inputs (₹500 a year, ₹50 a month, 1 year), the maximum inputs (₹1,50,000, ₹12,500 a month, rate 15, 50 years) and the 15, 16, 21 and 50-year endpoints.
- **Disclosure shown with the results:** "Rounded to whole rupees. Actual credited balances can differ because of how interest is rounded in practice, which this tool does not claim to know, and because of other rules that apply to your account." No official rounding convention is claimed.

### 7a. What each part of the model rests on
| Class | Items |
| --- | --- |
| **Official scheme requirements** (section 0.2) | Limits and multiples (C2); the financial-year definition (C3); the interest rule, the 5th-day lowest balance and yearly crediting (C5); 7.1% for deposits from 1 April 2020 (C6); maturity 15 years after the end of the opening year (C8); extension in five-year blocks, chosen within a year (C9). |
| **Official procedural practice (Post Office)** | Deposits up to the 5th earn interest for that month, whatever the mode (P1); no cap on the number of deposits (P2); interest calculated on 31 March and credited on 1 April (P3). Bank practice is not verified. |
| **Simplifying V1 assumptions** | The account opens in April and every year is a full year of deposits (A5); one fixed rate for every year (A1, D9); each deposit is on or before the 5th (A3); no withdrawals, loans or missed years (A4); one twelfth of the annual rate per month (U8); unrounded arithmetic, displayed to whole rupees (D8). |
| **Projection beyond initial maturity** | For an April account the first term ends on 31 March of the 16th financial year. Years 17 to 50 assume the holder extends the account **with deposits** in five-year blocks (the option is chosen within one year of maturity and cannot be withdrawn once given, paras 12(1) to 12(7)), so the blocks end at years 21, 26, 31 and so on. A year that is not a block end is a balance on a date inside a block, not a point at which the account can be closed in full. The page labels these rows as a projection beyond maturity and says that the rate for those years is unknown. |
| **Unsupported or unresolved (not modelled, nothing claimed)** | Withdrawals, loans and premature closure (rules known, C10 to C12; not modelled); an account continued without deposits (C9); discontinued or revived accounts (C4); NRI and HUF eligibility and tax treatment (U6); rounding (U3); bank-specific practice; a partial first year, a late-March deposit and a mid-month date (D4, D5). |

**Invariants:** balance is non-decreasing in the deposit, the rate and the years; yearly-in-April ≥ the same total paid monthly for r > 0; at r = 0 both patterns equal the deposits; the table's last balance equals the headline; each year's closing balance = opening + deposits + that year's interest; interest earned = balance − deposits.

## 8. Assumptions (shown next to the results)
- A1 The interest rate entered stays the same for every year. The Government reviews the PPF rate every quarter, so a real account may differ.
- A2 Interest is worked out each month on the lowest balance between the close of the 5th and month-end, and added to the account once, at the end of each financial year (rules C5).
- A3 Every deposit is made on or before the 5th of its month (yearly pattern: in April).
- A4 No withdrawal, loan, premature closure or missed year; every year's deposit is within the ₹500 to ₹1,50,000 limit, which covers all your PPF accounts including one held for a minor.
- A5 **The account is opened in April**, so year 1 is a full financial year of deposits (shown visibly next to the results; there is no opening-month input in V1). An account opened part-way through a year, or deposits late in March, give different numbers.
- A6 The Scheme lets an account be closed in full after 15 years from the end of the financial year in which it was opened. For an account opened in April that is 31 March of the 16th financial year, which is the default duration here. The balance shown for year 16 is the balance at that earliest-closure date. **Every other year is a mathematical projection**: years 1 to 15 are before maturity, and years 17 to 50 assume the account is extended with deposits in five-year blocks (chosen within a year of maturity), which is the holder's option and not an entitlement the tool can know. Only the ends of the first term (year 16) and of each block (years 21, 26, 31 and so on) are points at which the Scheme allows the account to be closed in full; no other selected year is a legal maturity or withdrawal date.
- A7 The figures are estimates from your inputs, not a forecast, a guarantee or advice. Results are rounded to whole rupees; actual credited balances can differ (7b).
- A8 Each month's interest is the annual rate divided by 12, applied to the lowest balance between the close of the 5th and month-end. This is the V1 calculation assumption (U8), shown in the methodology text; it is not an official formula and does not verify any monthly rounding convention.
- Depends on a rule, a rate or a date and is supplied by the visitor: the rate. Depends on a rule the site would have to maintain: the deposit limit, the 5th-of-month rule and the 15-year maturity (stated as rules with their source and date in the static text, D2).

## 9. Edge cases
| Case | Behaviour |
| --- | --- |
| Rate 0 | Allowed as a mathematical case. Balance equals total deposits; interest ₹0; the note "At a rate of 0% there is no interest, so the balance equals what is deposited. PPF rates are above zero; this is a calculation case, not a PPF rate." The closed forms use their `r = 0` branches; no division by `r` occurs |
| Comparison not available | When the yearly total is not a multiple of ₹600 (so it cannot be split into twelve whole-₹50 monthly deposits; each deposit must be a multiple of ₹50, Scheme paras 4 and 5), the comparison is not shown and one line says why. It is shown, for example, for ₹1,50,000 a year (₹12,500 a month) and ₹60,000 a year (₹5,000 a month) |
| Years 1 | Balance is `D(1+r)`; the table has one row |
| Years 17 to 50 | Shown as a **projection beyond initial maturity** (section 7a): a note says it assumes extension with deposits in five-year blocks, which is the holder's option, and that the rate for those years is unknown. **Years 21, 26, 31, 36, 41 and 46 are labelled "end of an extension block (if extended with deposits)"**; every other row after year 16 is labelled "inside an extension block: a projection, not a date on which the account can be closed in full" |
| Years 1 to 16 | Allowed as "balance at the end of year N". **Year 16 is labelled "first term ends here: the earliest full closure for an account opened in April"; years 1 to 15 are labelled "before maturity (projection)"**; before year 16 only the withdrawal, loan and premature-closure rules apply, which are not modelled |
| Yearly deposit not a multiple of ₹50, below ₹500 or above ₹1,50,000 | Validation error naming the rule |
| Monthly deposit with a yearly total above ₹1,50,000 | Cannot happen by the 12,500 cap; a message if a pasted value exceeds it |
| Very large or tiny rate | Bounds 0.1 to 15; outside is an error |
| Result very large (50 years at 15%) | Shown in lakh/crore format with a precision note; no overflow (plain numbers are safe: below 10^15) |

## 10. Validation
Numeric, whole where stated; messages name the field and the limit and quote the rule ("The yearly deposit must be between ₹500 and ₹1,50,000, in multiples of ₹50."). Empty fields are not errors until Calculate. Cross-field rule: monthly deposit × 12 ≤ ₹1,50,000. The interest rate may be 0 to 15 inclusive in steps of 0.1. The page never "repairs" a value.

## 11. UX flow
The existing calculator pattern (intro, form card, results, assumptions beside the results, static sections), the shared field and result primitives, a polite live region. **Calculate** is an explicit action (as the nearest tools); results do not change while typing. Reset clears inputs, results and errors. The deposit-pattern choice swaps which deposit field shows.

## 12. Result hierarchy
1. Estimated balance after N years (with the label for what year N is: before maturity, first-term end, inside or at the end of an extension block). 2. Total deposited, interest earned, the interest share. 3. The assumptions (A1 to A8, the April opening visible) directly beside the numbers. 4. The annual-versus-monthly comparison. 5. The year-by-year table (collapsed by default on phones). 6. Static explanation. A low-interest outcome is shown the same way as any other: numbers and wording, never a verdict.

## 13. Comparison, table or schedule decision
**Needed: a year-by-year table** (year, opening balance, deposits, interest added at year-end, closing balance). Default view: a **summary** with the table behind a labelled disclosure; up to 50 rows, so it is a scrolling table in a labelled, focusable region on phones. **The annual-versus-monthly comparison is included (D4)**, computed by the same module for the same yearly total: it shows the balance if the total is deposited in April and the balance if it is deposited in twelve monthly deposits by the 5th, and the difference after N years. Wording: "Depositing ₹X in April each year gives about ₹Y more after N years than depositing ₹Z a month, because the money is in the account for more months. These are different deposit schedules, not the same investment, and this is not advice about when to deposit." It is shown only when the yearly total is a multiple of ₹600 (section 9), and it never says the two patterns are equivalent or that one is better.

## 14. Chart decision
NOT NEEDED in V1: the table and the two totals say what a chart would, and no image is used (section 22). Revisit if the table proves hard to read.

## 15. Export decision
NOT NEEDED: no case was found for keeping or sharing the table from a rule-bound estimate; no CSV, no PDF.

## 16. Print decision
NOT NEEDED beyond the browser's own print of the page.

## 17. Mobile behaviour
At 390 px: one column, 16 px inputs, the pattern choice as full-width radio buttons, 44 px targets, result cards stacked, the table in a scroll region that does not widen the page; no horizontal page scroll at 320 to 390 px; large rupee figures wrap.

## 18. Accessibility requirements
Labelled fields with linked hints and errors; keyboard-complete; visible focus; one polite live region announcing one sentence per Calculate and per error; the table has a caption, `th scope` headers and a focusable scroll region; no colour-only meaning; reduced motion respected; contrast checked against the shared tokens. (The shared-layer findings recorded for Tool Pack 25, such as the site's green link colour, are not re-litigated here.)

## 19. Search keywords and aliases
Aliases as in section 1. Queries to check: "ppf calculator", "ppf maturity calculator", "ppf interest calculation", "public provident fund calculator".

## 20. Related calculators
**The existing automatic Investment relationship is preserved (D12):** `ppf` is a normal Investment tool with the automatic relationship on (no `autoRelated: false`, no curated `relatedTools`), so it relates to the other published automatically related Investment tools in the catalog's order, and it is added to theirs. `swp` opted out (`autoRelated: false`) and stays unrelated. Only **published** tools appear: no Coming Soon tool is linked as if live, and the page contains no link to a tool that has no route. **Impact on pinned tests (limited and expected):** in `tests/unit/relationships.test.mjs` the lists pinned for `sip`, `fd` and `cagr` gain `ppf` (the order follows the catalog order, to be read from the code at implementation), the pinned article-fallback lists for the Investment article topics (`sip`, `fd`, `cagr` and `swp` articles) gain `ppf`, and the parity check against the pre-M7 rule must still pass for `ppf` itself; the Investment category pages and search tests are covered by the integration list in section 25. No relationship from or to the Loans tools, the Time Tools or the Developer Tools is added.

## 21. Article cluster
Existing Investment articles (SIP, FD, CAGR, SWP: 10 published, none on PPF) are not duplicated. Proposed, each with one intent, for **separate approval after the tool is built**:
1. **How PPF Interest Is Worked Out: Why the 5th of the Month Matters** (explanation; rules C3, C5, P1). Numbers from the tool: the same total deposited in April versus monthly versus a lump sum late in March.
2. **PPF: One Deposit in April or Twelve Monthly Deposits?** (comparison, scenario; C5). Numbers: the tool's two patterns.
3. **PPF Maturity: The 15-Year Rule and the Five-Year Extensions** (interpretation; C8, C9; the 16th-year point for an April account).
**Deferred (rule- or rate-dependent, no article now):** anything quoting the current rate, withdrawals and loans (C10, C11), PPF versus other products, tax treatment (U6). New articles take permanent ids recorded in the Growth ledger (rulebook 6.6). No article is created by this specification.

## 22. Imagery plan
None. If one is later wanted: a diagram of one year (monthly lowest-balance interest summed and added on 31 March), drawn from the tool's own numbers.

## 23. SEO plan
- Title: "PPF Calculator: Estimate Your PPF Balance Year by Year | ToolZen Hub"; description as section 1; canonical `https://toolzenhub.in/calculators/ppf/`; one h1; headings: How to Use; How PPF Interest Works; Deposit Limits and Timing; Maturity and Extension; What This Calculator Does Not Do; FAQ.
- The static HTML carries the explanatory text. No keyword volumes or rankings are claimed. Rules are stated with their source (the PPF Scheme, 2019) and the date checked, or the page says to check current rules (rulebook 3.6).

## 24. Performance constraints
Pure arithmetic over at most 50 years × 12 months (600 steps); no loop is unbounded; no new dependency; the tool's JS and CSS load only on its page; budget in line with the FD calculator's gzipped size.

## 25. Tests
- **Unit** (`tests/unit/ppf-golden.test.mjs`): vectors from `ppf-golden.py` (section 7: the golden table, including 1, 15, 16, 20, 25 and 30 years and the annual-versus-monthly comparison; the rounded variants are informational and never the expected result); **the numerical tolerance and the display-rounding, .5-boundary, rate-0, minimum, maximum and endpoint cases of section 7b**; the reconciliation rule (displayed balance = deposits + interest; each table row adds up); both closed forms; invariants; validation messages and boundaries (₹500, ₹1,50,000, multiples of 50, rate 0 and 15, the comparison's ₹600 rule); the year labels (before maturity, year 16, extension-block ends 21 to 46, inside a block); determinism; no `Date`, network or storage in the module.
- **Browser** (`tests/browser/ppf.spec.js`, one worker): the example, each deposit pattern, errors with linked messages, Reset, keyboard path, the table region, the live region, privacy (no request, no storage), 320/360/390 px, direct URL and refresh.
- **Integration (changes because `ppf` goes from Coming Soon to published):** the catalog entry (loader, capabilities, SEO, related), `toolStyles.json`, the Investment counts and listings, search aliases, **the pinned relationship expectations named in section 20 (`sip`, `fd`, `cagr` and the Investment article fallbacks gain `ppf`)**, the URL inventory (79 to 80 pages), DOM, SEO and link baselines, the Coming Soon representative used by the pinned tests (the reuse review records that `ppf` is the usual representative, so those tests move to another Coming Soon entry through the existing helper), and **the Growth ledger record for `ppf`** (provenance `added`, module `assets/js/calculators/ppf/index.js`, same commit as the catalog change; `node scripts/growth-manifest/export.mjs --check` after the commit). Affected listing visuals reviewed by eye; no dedicated visual baseline unless the testing rules demand one.
- **Manual (R1 milestone):** real Android and Safari/WebKit; unverified until then.
- **Acceptance:** the oracle and the module agree on every vector to the cent; the table's last row equals the headline; every rule in 0.2 used by the page is cited with its source and date, or the page says to check the current rules; no current-rate claim anywhere.

## 26. Quality gate
Mandatory gates (rulebook 12): meaningful problem (yes); not a duplicate (no PPF tool or article exists; the Coming Soon entry is this tool); output reliable **given the stated rules and the visitor's rate** (yes, with U1 to U8 handled as above); maintenance burden: **the rule-bound items (limits, the 5th-of-month rule, maturity) and the rate** (the rate is the visitor's, which keeps the burden low; the limits are stated with a source and date and would need a re-check if the Scheme changes); no paid API; no privacy risk (local only); mobile-good by design; not added for the count. Weighted score: not claimed; search and retention are hypotheses.

## 27. Deferred items
Rate changes over time (a second rate from year N; condition: owner wants it and a reliable rule for its use); withdrawals, loans and premature closure (rules C10 to C12 are now known, so a later version is possible); the opening month and a partial first year; a deposit late in March as a third pattern; extension without deposits; the tax view (U6); a chart; export; articles (section 21); showing the current notified rate (needs the freshness obligations of rulebook 13.9).

## 28. Commit checkpoint
Implementation would follow the three-phase pattern of Tool Packs 24 and 25 (engine and oracle with unit tests; page, catalog, ledger and browser tests; review and notes), each phase committed only on approval. Subject for the final integration commit: `feat: integrate ppf calculator`.

## Product design choices (decided 2026-10-13)
- **D1** The tool models the PPF interest rule exactly as C5 words it (monthly, lowest balance after the 5th, credited yearly) rather than a generic annual compound-interest formula.
- **D2** The rate is **visitor-entered** (approved 2026-10-13). The default 7.1% is labelled an example. **Evidence now supports 7.1% for deposits from 1 April 2020** (Scheme para 7(1A), C6) and the DEA memoranda read for 2026-27 say rates are unchanged through 31 December 2026 (S4), but no 2026 primary document prints the PPF figure (U1). The page therefore shows no "current rate" claim, no dated rate note and no link; it says the Government sets the rate and the visitor should enter the rate that applies. This follows the rule for official changing data (rulebook 13): a tracker is not built.
- **D3** Calculate is an explicit action; results do not move while typing.
- **D4 (approved 2026-10-13)** Two deposit patterns: **yearly in April (by the 5th)** and **monthly (each by the 5th)**; both stated visibly. A concise **annual-versus-monthly comparison for the same yearly total** is included (section 13), shown only when the total splits into whole-₹50 monthly deposits (a multiple of ₹600), worded so that the patterns are never called identical, equivalent investments or better or worse. A late-March pattern and a within-month date are deferred.
- **D5 (approved 2026-10-13)** The account is assumed **opened in April**, stated visibly next to the results (A5). No opening-month selector in V1.
- **D6 (approved 2026-10-13)** Default **16 financial years** (the first term of an account opened in April: maturity 15 years after the end of the opening year, 31 March of year 16). Years 1 to 50 are allowed as **projections**. The page labels what each year is: before maturity (1 to 15), the first-term end (16), the end of an extension block (21, 26, 31, 36, 41, 46) or inside a block; and states that only the term and block ends are points where the Scheme allows full closure, and that extension is the holder's option (A6). No selected year is presented as a legal withdrawal or maturity date.
- **D7** The yearly total limit is checked per tool use; the page cannot know about the visitor's other accounts and says so.
- **D8 (approved 2026-10-13)** Unrounded internal arithmetic; whole-rupee display with the reconciliation and tolerance rules of section 7b; the disclosure in 7b; **no official rounding convention is claimed** (U3).
- **D9** One rate for all years (rate changes are deferred).
- **D10** No withdrawals, loans or premature closure.
- **D11** No tax, NRI or HUF content.
- **D12 (approved 2026-10-13)** The existing automatic Investment relationship is preserved; no curated list; only published tools are linked; the pinned relationship tests named in section 20 are updated.
- **D13** No chart, export or print beyond the browser's.

## Decisions recorded (2026-10-13)
The owner approved the V1 specification with these decisions. They authorize this specification and its local documentation commit only, **not implementation**.

| ID | Decision |
| --- | --- |
| D1 to D3, D7, D9 to D11, D13 | As written above. |
| D2 | Visitor-entered rate, 7.1% labelled an example, no current-rate claim; wording "reviewed every quarter". |
| D4 | April yearly and monthly-by-the-5th patterns; annual-versus-monthly comparison for equivalent yearly totals (multiples of ₹600), never implying the patterns are identical. |
| D5 | April opening, stated visibly; no opening-month selector. |
| D6 | Default 16 financial years; 1 to 50 as projections; labels distinguish projection years from the first-term end and the extension-block ends; no year is presented as a legal date unless it is one. |
| D8 | Unrounded arithmetic, whole-rupee display, disclosed possible difference, no claimed official convention. |
| D12 | Existing automatic Investment relationship preserved; affected pinned relationship tests named in section 20; only published tools linked. |
| U8 | Annual rate ÷ 12 per month, a visible V1 assumption, not a verified convention. |

**Review corrections applied:** (1) a rate of 0 is allowed as a mathematical case, range 0 to 15; (2) a numerical tolerance and boundary tests are defined (section 7b); (3) the relationship impact is documented (section 20); (4) "reviewed every quarter" replaces "revised every quarter". Capability flags are verified at implementation, none is invented here.

**Resolved by the evidence:** U2, U4, and U5 for the Scheme and the Post Office.

**Evidence limitations that remain (accepted, not closed):** no 2026 primary document prints the PPF figure (U1); no official rounding rule (U3); bank practice (U5) and NRI, HUF and tax (U6) not verified; the one-twelfth reading (U8) is an accepted assumption, not a verified formula.
