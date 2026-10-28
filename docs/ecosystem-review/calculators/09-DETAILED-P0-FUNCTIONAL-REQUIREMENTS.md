# 09. Detailed P0 functional requirements

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Acceptance criteria are **planned tests, none has been run**; expected values come from `formula-reference-check.py` (11), never from the code under test.

## 1. Scope

P0 means the six packs below (45 to 50): three interaction changes (EMI, Loan Comparison, PPF), one enhancement of two tools (inflation view for SIP and SWP), **one new tool (XIRR)** and catalog navigation. Every requirement has a stable ID, an acceptance criterion in 12 and a risk in 14. P1 and P2 items are not specified here (08). Pack numbers continue the existing Tool Pack sequence (the last used is 44) and are **provisional**.

**Facets that apply to every pack** (stated once here and not repeated in each row): numbers are calculated unrounded and rounded half up for display only; money is in rupees with the Indian digit grouping the site already uses; no value is stored, sent or placed in the address; every visitor-supplied string is placed with textContent or as a control value; wording follows rulebook section 3 (no best, cheapest, guaranteed, safe, approved or eligible; estimates are called estimates); focus is never moved by an automatic update; layout is checked at 320, 360 and 390 px and on desktop; touch targets are at least 44 px and text inputs at least 16 px.

## Pack 45: EMI Calculator 2.0

**Problem.** The most generic loan page makes the visitor press a button, shows only three numbers, cannot solve for the tenure or the rate, and does not lead to the prepayment or comparison tools the site already has.

| ID | Requirement | Title |
|---|---|---|
| FR-EMI-001 | The EMI page shows its results as soon as loan amount, annual rate and tenure are all valid, and has no Calculate button. Reset stays (rulebook 7.9). | Automatic results |
| FR-EMI-002 | Empty fields give a neutral prompt and no result. A half-typed value gives no result and no error while it has focus; the message appears when the field is left. An invalid value shows a specific message beside the field with aria-invalid, keeps the typed text and removes the previous result. | Empty, partial and invalid input |
| FR-EMI-003 | One polite status announcement of the settled result after about 600 ms with no further input; never one per keystroke; focus is never moved by an update; Reset announces once and returns focus to the first field. | Announcements and focus |
| FR-EMI-004 | A radio group 'What do you want to find?' offers EMI (default), Loan tenure and Interest rate. Each mode shows only its own inputs; switching keeps shared values; a mode change clears the result and announces once. | Find-for modes |
| FR-EMI-005 | EMI mode outputs monthly EMI, total interest, total payment and the principal share of the total payment. Formula and limits are exactly those of the current page; the engine is not changed. Money is calculated unrounded and displayed rounded half up to two decimals. | EMI mode values |
| FR-EMI-006 | Inputs: loan amount, annual rate, monthly EMI. The number of payments is found by stepping month by month (the closed form -ln(1 - P r / E) / ln(1 + r) is only the test oracle); the last payment is the remaining balance plus its interest. Output: payments, as years and months, last payment, total interest, total payment. If the EMI does not exceed the first month's interest the page says so with that interest figure; if more than 600 payments are needed it says the payoff is more than 50 years away. | Tenure mode |
| FR-EMI-007 | Inputs: loan amount, tenure in years, monthly EMI. The annual rate is found by bisection on the monthly rate to a tolerance of 1e-10 and shown to two decimals. If EMI x months is less than the loan the page says no rate can work; if equal the rate is 0.00%. | Rate mode |
| FR-EMI-008 | After a result the page shows a yearly summary (year, principal paid, interest paid, closing balance) and, in a closed disclosure that renders on first open, the monthly schedule (month, EMI, principal, interest, balance), both from the existing amortization engine, rounded for display, with a totals row and a note that rows are rounded for display and totals come from unrounded values. The last closing balance shows 0.00. | Schedule |
| FR-EMI-009 | Tables are real tables with a caption and scoped headers; the monthly table scrolls horizontally inside its own container only and the page itself never scrolls sideways at 320, 360 or 390 px; the maximum rows follow the tenure limit of the current page. | Schedule layout |
| FR-EMI-010 | Chips for Home, Personal, Car and Education loan set the loan amount and tenure to illustrative values listed in the spec and never set a rate; text beside them says they are starting values and the lender's rate and fees decide the real EMI. Reset restores the defaults. | Starting values |
| FR-EMI-011 | A Copy summary control puts a plain-text summary (inputs, results, and 'Estimate: a lender's figures may differ') on the clipboard; if the clipboard is unavailable the text is selected for the visitor and the page says so; the control is announced once. | Copy summary |
| FR-EMI-012 | Plain links lead to the Loan Prepayment and Loan Comparison calculators with no values passed in the address. | Hand-off links |
| FR-EMI-013 | Next to the result: reducing balance, payment at the end of each month, fixed rate, no fees, insurance or taxes, an estimate and not a lender's quote. | Assumptions |
| FR-EMI-014 | Every input has a visible label; errors use aria-describedby; the result region is a polite status; keyboard operation covers every control; contrast and focus indicators meet the site's existing standard. | Accessibility |
| FR-EMI-015 | No horizontal page overflow at 320, 360, 390 px and desktop; touch targets at least 44 px; text inputs at least 16 px; the result region reserves its space so the layout does not jump. | Mobile |
| FR-EMI-016 | No network request after load, no browser storage, no address-bar state; every visitor-supplied string is placed with textContent or as a control value. | Privacy and security |
| FR-EMI-017 | The route /calculators/emi/, the catalog id and the existing golden values are unchanged; the existing spec is updated intentionally for the removed button. | Compatibility |
| FR-EMI-018 | The catalog adds the aliases: personal loan emi, car loan emi, education loan emi, home loan emi, loan tenure calculator, emi tenure calculator, loan amortization schedule; the search tests that pin aliases are updated deliberately. | Search aliases |

## Pack 46: Loan Comparison interaction tidy and third-party PDF repair

**Problem.** A button implies results are not current when they are, and the PDF option loads three third-party files at click time with no integrity check.

| ID | Requirement | Title |
|---|---|---|
| FR-LC-001 | The Compare Loans button is removed; results still appear on load and update on every field and slider change; Reset stays. | Remove the redundant button |
| FR-LC-002 | No computed figure changes. | Numbers unchanged |
| FR-LC-003 | Opening the amortization view and downloading the PDF make no request to any host other than the page's own. | No third-party requests |
| FR-LC-004 | The two PDF libraries (same versions as today) and the font are served from the repository with a notice and a hash test that fails on any change, as the existing pdf-lib vendoring does. If the font cannot be included on licence or size grounds the PDF uses a documented substitute for the rupee sign and the spec says so. | Pinned local copies |
| FR-LC-005 | The libraries load only when the visitor requests a PDF, not on page load. | Load only on request |
| FR-LC-006 | If PDF generation fails the visitor sees a plain message and the page stays usable. | Failure message |

## Pack 47: PPF Calculator: automatic results

**Problem.** An explicit Calculate plus an out-of-date label for a calculation that is instant.

| ID | Requirement | Title |
|---|---|---|
| FR-PPF-001 | PPF shows results when its inputs are valid and has no Calculate button; Reset and the Example control stay. | Automatic results |
| FR-PPF-002 | The out-of-date label and its state are removed; an edit replaces the result atomically or removes it when the inputs are invalid. | No out-of-date state |
| FR-PPF-003 | The engine and every value it returns are unchanged. | Engine unchanged |
| FR-PPF-004 | The Example fills the fields and the result appears with one announcement; Reset restores the defaults, clears the result, announces once and returns focus to the first field. | Example and Reset |
| FR-PPF-005 | Every existing statement of assumptions stays: the rate is entered by the visitor, the interest reading is this tool's V1 assumption and not an official formula, withdrawals and loans are not modelled. | Assumptions kept |
| FR-PPF-006 | Before Stage 2 changes the page, the Public Provident Fund Scheme's interest rule is read from the official text and any difference from the V1 assumption is recorded; no engine change is part of this pack. | Official-rule check before change |

## Pack 48: Inflation view for SIP and SWP

**Problem.** A projection in future rupees hides what the money will buy; SWP's page says inflation is not modelled.

| ID | Requirement | Title |
|---|---|---|
| FR-INF-001 | SIP and SWP each get an optional field 'Expected inflation (% a year)'. Empty means the view is off; 0 to 30 with up to two decimals is valid. | Optional field |
| FR-INF-002 | With inflation f set, SIP also shows the end value in today's money: value / (1 + f/100)^(months/12), discounted from the end of the period to today. | SIP today's-money value |
| FR-INF-003 | With f set, SWP also shows the remaining corpus in today's money when any is left, and the last year's withdrawal in today's money using withdrawal / (1 + f/100)^(k-1) for year k. | SWP today's-money view |
| FR-INF-004 | The page shows the approximate yearly return after inflation, (1 + r)/(1 + f) - 1, to two decimals. | Inflation-adjusted return |
| FR-INF-005 | With the field empty every existing figure, table and announcement is exactly as before. | Nothing changes when empty |
| FR-INF-006 | An invalid inflation value removes only the inflation figures and shows a message at the field; the existing result stays because it remains valid. | Invalid optional field |
| FR-INF-007 | Text says inflation is an assumption the visitor enters, that actual inflation varies and that this is not a forecast; it never says what money 'will be worth'. | Wording |
| FR-INF-008 | The single announcement of a settled result includes the today's-money figure when it is shown. | Announcement |
| FR-INF-009 | The SIP print view includes the today's-money figure when it is shown. | Print view |
| FR-INF-010 | The arithmetic lives in one pure module (realValue, realRate) with no DOM, shared by both pages and tested on its own. | Pure helper |

## Pack 49: XIRR Calculator (new)

**Problem.** A visitor with irregular dated investments or withdrawals has no way here to find the yearly rate; CAGR and SIP assume two values or a regular instalment.

| ID | Requirement | Title |
|---|---|---|
| FR-XIRR-001 | A new calculator 'XIRR Calculator' in the Investment category at /calculators/xirr/ with a catalog entry, aliases (xirr calculator, xirr online, irregular cash flow return, portfolio return) and a related list of CAGR and SIP. Nothing is published or routed until approved and released. | Tool identity |
| FR-XIRR-002 | The result appears when every row is valid, after a short pause, without a Calculate button; a bulk paste is a separate explicit action so a half-pasted list never produces a result. | Interaction |
| FR-XIRR-003 | Each row has a date, an amount and a type, Money out (invested) or Money in (returned or current value); at least two valid rows and at most 100 rows; rows can be added and removed; dates need not be in order. | Rows |
| FR-XIRR-004 | Amounts are positive rupee values with up to two decimals, at most 1,000,000,000,000; the type supplies the sign; a typed minus, zero, text or too many decimals is refused with a specific message. Money is held in whole paise. | Amounts |
| FR-XIRR-005 | Date fields use a date input. Pasted text accepts YYYY-MM-DD and DD/MM/YYYY and DD-MM-YYYY, read as day then month then year, from 1970-01-01 to 2100-12-31, real calendar dates only (no 31 February). | Dates |
| FR-XIRR-006 | Time is Actual/365: t_i = (date_i - earliest date) in days / 365, the Excel and LibreOffice XIRR definition, stated on the page. | Day count |
| FR-XIRR-007 | The rate r > -1 satisfying sum A_i (1 + r)^(-t_i) = 0 is found by a deterministic bisection to 1e-12 or 200 iterations on a bracket that is widened from [-0.999999, 10] up to 1e6 until the sign changes; the result is the same whatever the order of the rows. | Solver |
| FR-XIRR-008 | At least one Money out and one Money in are required; all dates identical, no amount received, or no rate found within the bracket each give a specific message and no rate. | Preconditions |
| FR-XIRR-009 | If the date-ordered net cash flow changes direction more than once the page says more than one rate can fit; the rate shown is the root nearest zero found by scanning a fixed grid from -0.99 to 100 and bisecting inside the first sign change from zero outward. | More than one possible rate |
| FR-XIRR-010 | XIRR as a percentage a year to two decimals; total money out; total money in; net gain or loss; absolute return (net over money out); first and last date with the number of days; a residual line stating the present value at the shown rate. | Outputs |
| FR-XIRR-011 | With exactly two rows the page says the rate equals the CAGR over those dates under Actual/365 and links to the CAGR calculator. | Equals CAGR for two flows |
| FR-XIRR-012 | A rate above 10,000% a year is shown as 'more than 10,000% a year' with a note that it is rarely meaningful; a rate of -100% or below is never shown. | Extreme results |
| FR-XIRR-013 | A paste box accepts lines of date and amount separated by a comma, tab or spaces; a negative amount is money out and a positive amount is money in (the Excel convention, stated beside the box); a report lists each accepted and rejected line with its number and reason; nothing is added until the visitor confirms; input beyond 20,000 characters or 100 rows is refused. | Paste |
| FR-XIRR-014 | Each row's controls carry the row number in their accessible names (Date, row 3); Remove buttons are at least 44 px; Add row moves focus to the new row's date; Tab order follows the visual order. | Row editing and keyboard |
| FR-XIRR-015 | An Example control fills the reference example; Reset restores two empty rows, clears results and errors, announces once and focuses the first date. | Example and Reset |
| FR-XIRR-016 | A Copy summary control copies the rate, the convention and the totals as plain text, with the sentence that it is a calculation on the flows entered and not a forecast. | Copy summary |
| FR-XIRR-017 | The page explains in plain words what XIRR is, how it differs from CAGR (dates matter, flows can be many), what Actual/365 means, that it uses only the flows entered and so includes no tax or charges unless entered, and that it is not a forecast. | Explanations |
| FR-XIRR-018 | Real labels, errors per row linked with aria-describedby, one polite live region for the settled result, no motion that ignores reduced-motion, contrast and focus as elsewhere on the site. | Accessibility |
| FR-XIRR-019 | At 480 px and narrower the rows stack as cards; no page-level horizontal scroll at 320, 360, 390 px; touch targets at least 44 px; inputs at least 16 px; a 100-row list remains operable. | Mobile |
| FR-XIRR-020 | No storage, no address-bar state, no network; paste and fields placed with textContent or as values; the paste size cap applies before parsing. | Privacy and security |
| FR-XIRR-021 | Solving 100 rows is bounded and instant; no work runs per keystroke beyond validation. | Performance |
| FR-XIRR-022 | Version 1 has no tax, charges, currency, CSV or file upload, saved portfolios, charts or URL sharing. | Exclusions |

## Pack 50: Calculators related navigation and catalog aliases

**Problem.** Related tools are one-directional or empty for six tools, and EMI cannot be found by its product or tenure variants.

| ID | Requirement | Title |
|---|---|---|
| FR-NAV-001 | Curated relatedTools are set within the Calculators section only: SIP to SWP and CAGR; SWP to SIP; CAGR to FD, SIP; FD to CAGR; EMI to Loan Comparison, Loan Prepayment, Home Loan; Loan Comparison to EMI, Loan Prepayment, Loan Balance Transfer; Home Loan to EMI, Loan Comparison; XIRR to CAGR, SIP (once XIRR exists). | Curated related lists |
| FR-NAV-002 | No related list crosses a section (rulebook 4.2). | Same section only |
| FR-NAV-003 | The relationship and catalog tests that pin lists or counts are updated in the same change and each update is named in the report. | Tests updated deliberately |
| FR-NAV-004 | The coming-soon Personal Loan and Loan Eligibility entries are retired only if the owner approves; otherwise unchanged. | Placeholders decision |
| FR-NAV-005 | The search-index total-size backstop is reviewed against the real new size; it is raised only to a justified value and the per-entry ceiling and exact alias pins stay. | Index size |
| FR-NAV-006 | No published URL changes or redirects. | URLs preserved |

## Calculation models by pack

| Pack | Model | Reset | Copy | Explicit exclusions |
|---|---|---|---|---|
| 45 EMI | LIVE | restores defaults, announces once | copy summary (FR-EMI-011) | fees, insurance, floating rates, part-payments (that is Prepayment), eligibility, lender names or rates |
| 46 Loan Comparison | LIVE (as today) | existing | none | no new figures |
| 47 PPF | LIVE | existing | none | withdrawals, loans, premature closure, current rate |
| 48 Inflation view | LIVE | existing | none | historical inflation data, tax, charges |
| 49 XIRR | LIVE after validation; explicit bulk paste | two empty rows | copy summary (FR-XIRR-016) | tax, charges, currency, files, saved portfolios, charts, URL sharing |
| 50 Navigation | not applicable | not applicable | not applicable | any new calculator, any cross-section link |

## Illustrative starting values for FR-EMI-010

These are design choices to be confirmed in the spec, not facts about any lender: Home 50,00,000 over 20 years; Personal 5,00,000 over 3 years; Car 8,00,000 over 5 years; Education 10,00,000 over 7 years.
