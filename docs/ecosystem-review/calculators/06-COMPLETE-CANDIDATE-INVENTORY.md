# 06. Complete candidate inventory

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Evidence labels follow rulebook 12.4: **VERIFIED** (read, run or observed in this session), **PUBLIC** (a cited public page), **HYPOTHESIS** (reasoned, not measured) and **UNKNOWN**.

Every candidate named in the master prompt (134 rows) is placed once. Dispositions: EXISTS (already built or already covered by a named tool), MODE (a mode, preset or alias of a named tool, no new route), P0, P1, P2, DEFER, REJECT, EXCLUDED (a binding exclusion). Class A to D is the feasibility class of section 32 of the prompt: A stable mathematics, B careful assumptions, C changing rules, D needs unavailable data or unacceptable risk. Scores are in 07.

Counts: DEFER 14, EXCLUDED 1, EXISTS 42, MODE 23, P0 6, P1 11, P2 9, REJECT 28, total 134.

## Loans

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| L01 | EMI Calculator enhancements | P0 | A | Highest-traffic generic tool; no schedule, solver or live update today (scored E1) |
| L02 | Loan Comparison enhancements | P0 | A | Button redundant (inputs already recalculate); PDF path loads third-party scripts (scored E2) |
| L03 | Home Loan Calculator enhancements | EXISTS | A | Already an EMI-budget tool with live results; no change recommended |
| L04 | Loan Prepayment enhancements | EXISTS | A | Schedule, CSV export and live results exist; no change recommended |
| L05 | Balance Transfer enhancements | EXISTS | A | Break-even model and live results exist; no change recommended |
| L06 | Credit Card Payoff enhancements | P1 | A | Live results (rule 7.9) and a snowball/avalanche mode; exact BigInt engine must be kept |
| L07 | Personal Loan Calculator | MODE | A | Same maths as EMI; an EMI starting value and alias, not a route (rule 1.6) |
| L08 | Loan Eligibility Calculator | REJECT | D | Eligibility depends on lender rules and credit data that cannot be known; would mislead |
| L09 | Loan Interest Calculator | MODE | A | Total interest is already an EMI output |
| L10 | Simple Interest Calculator | P1 | A | Solve-for-any-variable interest tool, replacing the coming-soon Interest entry (scored N3) |
| L11 | Compound Interest Calculator | P1 | A | Same candidate as L10; FD already covers deposit compounding |
| L12 | Loan Affordability Calculator | EXISTS | A | Home Loan already works out the loan that fits an EMI budget |
| L13 | Loan Tenure Calculator | MODE | A | Solve-for-tenure mode inside EMI (part of E1) |
| L14 | Debt-to-Income Calculator | REJECT | D | Home Loan already takes income share and existing EMIs; a ratio page adds nothing |
| L15 | Debt Repayment Planner (snowball/avalanche) | P1 | A | Mode of Credit Card Payoff; existing matrix row 5 scored 59 |
| L16 | Credit Card Minimum Payment Calculator | REJECT | D | Issuer-specific minimum-payment rules are not knowable; fails the misleading-output gate |
| L17 | Mortgage Amortization Calculator | MODE | A | Amortization schedule inside EMI (part of E1) |
| L18 | Loan Refinance Comparison | EXISTS | A | Balance Transfer and Loan Comparison cover it |
| L19 | Education Loan Calculator | MODE | A | EMI starting value and alias; moratorium rules are lender-specific |
| L20 | Car Loan Calculator | MODE | A | EMI starting value and alias |

## Investment

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| I01 | SIP Calculator enhancements | P0 | A | Optional inflation view (part of E3); lumpsum mode is P1 |
| I02 | SWP Calculator enhancements | P0 | A | Inflation is stated as not modelled; an optional today's-money view (part of E3) |
| I03 | FD Calculator enhancements | EXISTS | A | Compounding choices and effective yield exist; inflation view later (P1) |
| I04 | CAGR Calculator enhancements | EXISTS | A | Complete for two values and a period; XIRR covers dated flows |
| I05 | PPF Calculator enhancements | P0 | B | Live results only (E4); rate stays user-entered; official-rule verification noted |
| I06 | Lumpsum Investment Calculator | P1 | A | Mode in SIP (a Lumpsum/SIP switch is common); FD/CAGR already compute it indirectly |
| I07 | SIP Step-Up Calculator | EXISTS | A | Built: SIP has a yearly step-up |
| I08 | Goal-Based SIP Calculator | EXISTS | A | Built: SIP has a target mode |
| I09 | Recurring Deposit Calculator | P1 | B | Public sources use different RD conventions; verify one bank's terms first (scored N2) |
| I10 | Simple Return Calculator | EXISTS | A | CAGR shows total growth and multiple |
| I11 | Absolute Return Calculator | EXISTS | A | CAGR shows total growth |
| I12 | Annualized Return Calculator | EXISTS | A | That is CAGR |
| I13 | XIRR Calculator | P0 | B | Dated, irregular cash flows are not served by CAGR or SIP (scored N1) |
| I14 | NPV Calculator | P2 | A | Niche, finance students; could share the XIRR cash-flow editor later |
| I15 | Inflation Calculator | P2 | A | Folded into the E3 view first; a standalone page only if that proves demand |
| I16 | Real Return Calculator | MODE | A | (1+r)/(1+i)-1 belongs in the inflation view |
| I17 | Retirement Corpus Calculator | P1 | B | Valuable but assumption-heavy; feasibility audit first (scored N4) |
| I18 | Retirement Withdrawal Planner | EXISTS | A | SWP is this tool |
| I19 | Savings Goal Calculator | EXISTS | A | SIP target mode |
| I20 | Emergency Fund Calculator | REJECT | D | Multiplication by a rule of thumb; no repeat use or differentiation (rule 1.2) |
| I21 | Investment Comparison Calculator | EXISTS | A | CAGR and FD cover two-option comparison |
| I22 | Compounding Calculator | MODE | A | Same as L11 |

## Tax

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| T01 | Income Tax Calculator enhancements | EXISTS | C | Live, dated config, expiry handling exist; annual rule update is the obligation |
| T02 | GST Calculator enhancements | EXISTS | A | Add, remove, multiple items, paise-exact; user supplies the rate |
| T03 | Gratuity Calculator | EXISTS | C | Built; release gated by the owner (specs 29 and 30) |
| T04 | Salary CTC to In-Hand Calculator | EXISTS | C | Built; release gated |
| T05 | Take-Home Salary Calculator | EXISTS | C | Same tool as T04 |
| T06 | HRA Calculator | DEFER | C | Income Tax already has an HRA mode; a separate route fails the duplicate gate without search data |
| T07 | TDS Calculator | DEFER | C | Many sections and rates, annual change; maintenance disproportionate |
| T08 | GST Inclusive/Exclusive Calculator | EXISTS | A | That is the GST calculator |
| T09 | GST Reverse Calculator | EXISTS | A | Remove-GST mode exists |
| T10 | Professional Tax Calculator | DEFER | C | State-specific slabs; unmaintainable at quality |
| T11 | EPF Contribution Calculator | DEFER | C | Salary tool already models the PF share; a separate tool needs wage-ceiling rules |
| T12 | Leave Encashment Calculator | DEFER | C | Exemption limits and rules change; low search evidence |
| T13 | Income Tax Comparison | EXISTS | C | That is the Income Tax calculator |
| T14 | Capital Gains Calculator | DEFER | C | Asset-class rules, indexation and holding periods; high error risk |
| T15 | Salary Increment Calculator | MODE | A | Percentage Calculator already solves percentage change |
| T16 | Salary Breakup Calculator | EXISTS | C | Salary tool shows the breakup |

## Business

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| B01 | Profit Calculator enhancements | EXISTS | A | Break-even, target and margin of safety exist |
| B02 | Margin Calculator enhancements | EXISTS | A | Margin, markup and cost-change table exist |
| B03 | Break-Even Calculator | EXISTS | A | Profit Calculator computes break-even units |
| B04 | Markup Calculator | EXISTS | A | Margin Calculator computes markup |
| B05 | Discount Calculator | P1 | A | Percentage mode with stacked discounts; high intent but Percentage nearly covers it |
| B06 | ROI Calculator | REJECT | D | Profit and CAGR cover it; failed the duplicate gate (coming-soon entry stays deferred) |
| B07 | Profit Percentage Calculator | EXISTS | A | Profit and Margin cover it |
| B08 | Revenue Growth Calculator | EXISTS | A | Percentage change in Percentage or CAGR |
| B09 | Sales Tax Calculator | REJECT | D | US concept; GST covers the Indian equivalent |
| B10 | Commission Calculator | REJECT | D | Percentage of an amount; Percentage covers it |
| B11 | Invoice Amount Calculator | EXISTS | A | GST calculator handles multiple items |
| B12 | Cost Price Calculator | EXISTS | A | Margin and GST remove-GST cover it |
| B13 | Selling Price Calculator | EXISTS | A | Margin derives the price from a target |
| B14 | Cash Flow Calculator | REJECT | D | Needs a business model the tool cannot know; spreadsheet territory |
| B15 | Working Capital Calculator | REJECT | D | Niche formulas, no repeat evidence |
| B16 | Inventory Turnover Calculator | REJECT | D | Niche; two divisions |
| B17 | Unit Economics Calculator | DEFER | B | Profit covers contribution; CAC/LTV audience unproven |
| B18 | Contribution Margin Calculator | EXISTS | A | Profit shows contribution per unit |
| B19 | Pricing Calculator | EXISTS | A | Margin covers it |
| B20 | Freelance Hourly Rate Calculator | P2 | A | Useful decision tool, modest search; later |
| B21 | Project Cost Estimator | REJECT | D | Depends on user estimates only; no calculation value |

## Health

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| H01 | BMI Calculator | DEFER | B | Coming-soon entry; commodity and medically sensitive, no health section decision |
| H02 | BMR Calculator | DEFER | B | Estimate depends on formula choice; medical framing risk |
| H03 | TDEE Calculator | DEFER | B | Stacks activity assumptions on BMR |
| H04 | Calorie Needs Calculator | DEFER | B | Coming-soon entry; same family as H02 and H03 |
| H05 | Body Fat Estimate | REJECT | D | Accuracy too weak without measurement; misleading |
| H06 | Ideal Weight Calculator | REJECT | D | Formulas disputed; encourages a false single answer |
| H07 | Water Intake Estimate | REJECT | D | No sound individual formula |
| H08 | Macro Calculator | DEFER | B | Only as part of one fitness planner, if ever |
| H09 | Pregnancy-related calculators | REJECT | D | High medical risk |
| H10 | Due Date Calculator | REJECT | D | High medical risk |
| H11 | Heart Rate Zone Calculator | DEFER | B | Formula-dependent; fitness planner only |
| H12 | One Rep Max Calculator | DEFER | B | Estimate; fitness planner only |
| H13 | Pace Calculator | P2 | A | Exact arithmetic; runners repeat; modest |
| H14 | Running Speed Calculator | MODE | A | Same as H13 |
| H15 | Workout Volume Calculator | REJECT | D | Multiplication; no value |

## Math

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| M01 | Percentage Calculator enhancements | P1 | A | Discount and stacked-discount mode (B05); already has change and combined change |
| M02 | Ratio Calculator | P2 | A | Coming-soon entry; simple, modest |
| M03 | Fraction Calculator | P2 | A | Exact arithmetic is feasible; education intent |
| M04 | Average Calculator | P1 | A | Combined with M05 |
| M05 | Weighted Average Calculator | P1 | A | Grades and portfolios; repeat use is plausible (scored N5) |
| M06 | Percentage Change Calculator | EXISTS | A | Percentage solves start, end or change |
| M07 | Percentage Difference Calculator | EXISTS | A | Percentage covers ratio of two values |
| M08 | Standard Deviation Calculator | P2 | A | Education; low repeat |
| M09 | Probability Calculator | REJECT | D | Too broad to be correct for every case |
| M10 | Scientific Calculator | REJECT | D | Commodity built into every device |
| M11 | Prime Number Calculator | REJECT | D | Trivial |
| M12 | GCD/LCM Calculator | REJECT | D | Trivial |
| M13 | Decimal/Fraction Converter | MODE | A | Part of a fraction tool |
| M14 | Number Base Converter | REJECT | D | Developer audience; belongs to Developer Tools, which is outside this ecosystem |
| M15 | Equation Solver | REJECT | D | Open-ended; cannot be made reliably correct |
| M16 | Quadratic Equation Calculator | REJECT | D | Commodity |
| M17 | Triangle Calculator | REJECT | D | Commodity |
| M18 | Area Calculator | REJECT | D | Commodity |
| M19 | Volume Calculator | REJECT | D | Commodity |
| M20 | Unit Rate Calculator | P2 | A | Price-per-unit shopping comparison; real but small |

## Conversion

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| C01 | Unit Converter | P2 | A | Stable definitions but inline search answers; needs a section decision (scored N6) |
| C02 | Length Converter | MODE | A | Part of C01 |
| C03 | Weight Converter | MODE | A | Part of C01 |
| C04 | Temperature Converter | MODE | A | Part of C01 (non-linear conversion, needs its own tests) |
| C05 | Area Converter | MODE | A | Part of C01 |
| C06 | Volume Converter | MODE | A | Part of C01 |
| C07 | Speed Converter | MODE | A | Part of C01 |
| C08 | Time Unit Converter | MODE | A | Part of C01; Time Tools overlap |
| C09 | Data Storage Converter | MODE | A | Part of C01; decimal versus binary units need a stated choice |
| C10 | Energy Converter | MODE | A | Part of C01 |
| C11 | Pressure Converter | MODE | A | Part of C01 |
| C12 | Fuel Efficiency Converter | MODE | A | Part of C01 (reciprocal units) |
| C13 | Cooking Measurement Converter | MODE | B | Part of C01; ingredient volume to weight needs density data |
| C14 | Currency Converter | EXCLUDED | D | Binding exclusion: needs fresh external rates (rules 1.5, 13); preserved |

## Date and time

| ID | Candidate | Disposition | Class | Reason |
|---|---|---|---|---|
| D01 | Age Calculator | REJECT | D | Date Difference already returns years, months and days (verified in its source); a link or alias, not a route |
| D02 | Date Calculator | EXISTS | A | Time Tools: Date Calculator exists |
| D03 | Duration Calculator | EXISTS | A | Time Tools: Time Duration exists |
| D04 | Working Hours Calculator | EXISTS | A | Time Tools: Hours Calculator exists |
| D05 | Business Days Calculator | EXISTS | A | Time Tools: Business Days exists |
| D06 | Time Difference Calculator | EXISTS | A | Time Tools: Time Zone Converter and Date Difference exist |

Competitor and demand evidence for the P0 and P1 rows is in 04 and 05. Class C rows depend on rules that change: any future work must record jurisdiction, source, effective date and an update owner (section 32).
