# 12. Acceptance criteria and traceability

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed. Acceptance criteria are **planned tests, none has been run**; expected values come from `formula-reference-check.py` (11), never from the code under test.

## 1. How to read this document

Each functional requirement in 09 has one acceptance criterion below. **No criterion has been run.** Test categories: UNIT-GOLDEN (independent expected values from 11), UNIT-PROPERTY (invariants and boundaries), BROWSER-FUNCTIONAL, BROWSER-A11Y, BROWSER-MOBILE, SECURITY-NETWORK (request logs and hashes), CATALOG, STATIC. Cross-cutting conditions (zero, negative, empty, invalid, minimum, maximum, precision, rounding, unit, reset, copy, mobile, keyboard, security, privacy, error recovery) are mapped to the requirement that owns each in section 3.

## 2. Acceptance criteria

| FR | Criterion (Given, when, then) | Category | Formula | Risks | Pack |
|---|---|---|---|---|---|
| FR-EMI-001 | Given valid 10,00,000 / 8.5 / 20, when the last field becomes valid then EMI 8,678.23 appears with no further action; the page has no element named Calculate. | BROWSER-FUNCTIONAL | F-EMI | R04,R05 | 45 |
| FR-EMI-002 | Given a shown result, when the rate is set to -1 and focus leaves, then the rate error is shown, the result region is empty and the text -1 is still in the field; while typing 8. no error appears. | BROWSER-FUNCTIONAL | F-EMI | R04 | 45 |
| FR-EMI-003 | Given typing 10 characters across fields within 600 ms of each other, then the live region text changes at most once; focus remains in the field being typed. | BROWSER-A11Y | n/a | R04,R15 | 45 |
| FR-EMI-004 | Given the Tenure mode selected, then the EMI field is visible and the tenure field is not; returning to EMI mode restores the tenure field with its previous value. | BROWSER-FUNCTIONAL | n/a | R01 | 45 |
| FR-EMI-005 | 10,00,000 at 8.5% for 20 years gives EMI 8,678.23, total interest 10,82,775.76, total payment 20,82,775.76; 1,00,00,000 at 10% for 10 years gives 1,32,150.74; rate 0 for 1,20,000 over 12 months gives 10,000.00. | UNIT-GOLDEN | F-EMI | R01,R03 | 45 |
| FR-EMI-006 | 10,00,000 at 9% with EMI 15,000 needs 93 payments (92.77 months), the last smaller than 15,000; EMI 7,500 (equal to the first month's interest) gives the does-not-reduce message with 7,500; rate 0, EMI 10,000 gives 100 payments. | UNIT-GOLDEN | F-EMI-N | R01,R09 | 45 |
| FR-EMI-007 | 10,00,000 over 240 months with EMI 9,000 gives 9.00% (reference 9.004261%); EMI 4,000 over 240 months gives the no-rate message; EMI 4,166.67 (= P / n to the paisa) gives 0.00%. | UNIT-GOLDEN | F-EMI-R | R01,R09 | 45 |
| FR-EMI-008 | For 10,00,000 / 8.5 / 20 month 1 shows interest 7,083.33 and principal 1,594.90, balance after 12 payments 9,80,097.71, final balance 0.00; the sum of yearly principal equals the loan to within 0.01 per row of rounding. | UNIT-GOLDEN | F-AMORT | R02,R14 | 45 |
| FR-EMI-009 | At 320 px the document's scrollWidth equals its clientWidth with the monthly schedule open; each header cell has scope=col. | BROWSER-MOBILE | n/a | R14,R15 | 45 |
| FR-EMI-010 | Activating Home sets the amount and tenure fields only; the rate field is unchanged; the sentence about the lender is present. | BROWSER-FUNCTIONAL | n/a | R03,R13 | 45 |
| FR-EMI-011 | After activation the clipboard (read in the test) equals the expected text for the reference inputs; with the clipboard API removed the fallback text is selected and the message appears. | BROWSER-FUNCTIONAL | n/a | R03 | 45 |
| FR-EMI-012 | The two links exist, have no query string or hash, and the destination pages return 200. | BROWSER-FUNCTIONAL | n/a | R13 | 45 |
| FR-EMI-013 | The assumptions text is present in the result region for each mode and contains none of 'best', 'cheapest', 'guaranteed', 'approved', 'eligible'. | BROWSER-FUNCTIONAL | n/a | R03 | 45 |
| FR-EMI-014 | An automated accessibility scan reports no violations at each of the three modes; every control is reachable and operable by keyboard alone. | BROWSER-A11Y | n/a | R15 | 45 |
| FR-EMI-015 | Measured at the four widths: overflow none, chips and buttons at least 44 px high, inputs at least 16 px. | BROWSER-MOBILE | n/a | R14 | 45 |
| FR-EMI-016 | A request log during use is empty of non-local requests; storage is unchanged; a field value of <img src=x onerror=1> never creates an element. | SECURITY-NETWORK | n/a | R06 | 45 |
| FR-EMI-017 | emi-golden and loan-formulas pass unchanged; the route returns 200. | UNIT-GOLDEN | F-EMI | R05,R12 | 45 |
| FR-EMI-018 | Searching each alias returns the EMI calculator first; the pinned alias list in the search test equals the catalog. | CATALOG | n/a | R12,R13 | 45 |
| FR-LC-001 | No element with id compare-loans exists; changing the second loan's rate updates both results with no click. | BROWSER-FUNCTIONAL | n/a | R05 | 46 |
| FR-LC-002 | The existing loan-formulas and loan-comparison expectations pass unchanged apart from the removed click. | UNIT-GOLDEN | F-EMI | R05 | 46 |
| FR-LC-003 | With all non-local requests aborted in the browser, the PDF is still produced and a request log shows no foreign host. | SECURITY-NETWORK | n/a | R06 | 46 |
| FR-LC-004 | A unit test compares each file's SHA-256 with the pinned value; the PDF text for the reference loans contains the expected amounts. | SECURITY-NETWORK | n/a | R06 | 46 |
| FR-LC-005 | On load the request log shows none of the PDF files; after the PDF is requested they are loaded from the local origin. | SECURITY-NETWORK | n/a | R06 | 46 |
| FR-LC-006 | With the library file made unavailable in the test, the message appears and the comparison remains operable. | BROWSER-FUNCTIONAL | n/a | R06 | 46 |
| FR-PPF-001 | Given the page's example inputs, the balance appears with no click and no Calculate element exists. | BROWSER-FUNCTIONAL | F-PPF | R04,R05 | 47 |
| FR-PPF-002 | After any edit no element with the old stale-notice id is shown; an invalid edit leaves no result. | BROWSER-FUNCTIONAL | F-PPF | R04 | 47 |
| FR-PPF-003 | ppf-golden passes unchanged. | UNIT-GOLDEN | F-PPF | R05 | 47 |
| FR-PPF-004 | Example then Reset leaves defaults and an empty result region; the live region changed once per action. | BROWSER-A11Y | n/a | R04 | 47 |
| FR-PPF-005 | The page text contains each of those statements. | BROWSER-FUNCTIONAL | F-PPF | R03 | 47 |
| FR-PPF-006 | A dated note in the spec records the paragraph read and whether the V1 reading is consistent. | STATIC | F-PPF | R11 | 47 |
| FR-INF-001 | Empty: no inflation figures; 6: figures appear; 31 and -1 and abc each give a field message. | BROWSER-FUNCTIONAL | F-INF | R04 | 48 |
| FR-INF-002 | A projected end value of 1,00,00,000 after 20 years at 6% shows 31,18,047.27. | UNIT-GOLDEN | F-INF | R01,R10 | 48 |
| FR-INF-003 | A year-20 withdrawal of 1,00,000 at 6% inflation shows 1,00,000 / 1.06^19 = 33,051.30 (recomputed with 50-digit Decimal). | UNIT-GOLDEN | F-INF | R01 | 48 |
| FR-INF-004 | 12% return and 6% inflation shows 5.66%. | UNIT-GOLDEN | F-INF | R01 | 48 |
| FR-INF-005 | sip-golden and swp-golden pass unchanged; the rendered page for an unchanged input set is identical apart from the new field. | UNIT-GOLDEN | F-SIP-CONV | R05 | 48 |
| FR-INF-006 | Given a shown SIP result, entering 40 keeps the nominal result and shows the field error. | BROWSER-FUNCTIONAL | n/a | R04 | 48 |
| FR-INF-007 | The text is present and the banned words list (best, guaranteed, will be worth) is absent. | BROWSER-FUNCTIONAL | n/a | R03 | 48 |
| FR-INF-008 | The live region text contains the today's-money figure. | BROWSER-A11Y | n/a | R15 | 48 |
| FR-INF-009 | The print stylesheet shows the figure (checked by emulating print media). | BROWSER-FUNCTIONAL | n/a | R05 | 48 |
| FR-INF-010 | The module has no DOM import; its unit tests match the reference values. | UNIT-GOLDEN | F-INF | R01 | 48 |
| FR-XIRR-001 | The catalog test shows the entry, the route returns 200 on the preview, the inventory test is updated deliberately. | CATALOG | n/a | R12,R13 | 49 |
| FR-XIRR-002 | With two valid rows the rate appears with no click; pasting text changes nothing until 'Add these rows' is activated. | BROWSER-FUNCTIONAL | F-XIRR | R04,R08 | 49 |
| FR-XIRR-003 | A 101st row is refused with a message; removing a row to leave one gives the 'at least two rows' prompt. | BROWSER-FUNCTIONAL | F-XIRR | R08 | 49 |
| FR-XIRR-004 | -5, 0, 12.345 and 1e3 each produce their own message; 12.34 is accepted and held as 1234 paise. | UNIT-PROPERTY | F-XIRR | R09 | 49 |
| FR-XIRR-005 | 2024-02-30, 31/02/2024 and 1969-12-31 are rejected with reasons; 29/02/2024 is accepted; 03/04/2024 is read as 3 April. | UNIT-PROPERTY | F-XIRR | R08 | 49 |
| FR-XIRR-006 | The reference example's NPV at the returned rate is zero to 1e-9 under this day count. | UNIT-GOLDEN | F-XIRR | R10 | 49 |
| FR-XIRR-007 | The reference example (flows -1,00,000 on 2023-01-01, -50,000 on 2023-07-01, +20,000 on 2024-03-31, +1,70,000 on 2025-01-01) gives 14.3944% to four decimals; shuffling the rows gives the same value. | UNIT-GOLDEN | F-XIRR | R07 | 49 |
| FR-XIRR-008 | Only outflows gives 'XIRR needs at least one amount paid out and one amount received'; two flows on one date gives the same-date message. | BROWSER-FUNCTIONAL | F-XIRR | R07 | 49 |
| FR-XIRR-009 | Flows -1000, +2300, -1320 on days 0, 365, 730 have two roots (10% and 20%); the page shows the note and the root nearest zero (10%). | UNIT-GOLDEN | F-XIRR | R07 | 49 |
| FR-XIRR-010 | The reference example shows out 1,50,000, in 1,90,000, net 40,000, absolute 26.67%, period 731 days. | UNIT-GOLDEN | F-XIRR | R01,R03 | 49 |
| FR-XIRR-011 | -1,00,000 on 2020-01-01 and +2,00,000 on 2025-01-01 gives (2)^(365/1827) - 1 = 14.8524%, equal to the CAGR formula with t = 1827/365. | UNIT-GOLDEN | F-XIRR | R10 | 49 |
| FR-XIRR-012 | Flows -1 on day 0 and +1,000,000 on day 1 give the more-than message. | UNIT-PROPERTY | F-XIRR | R09 | 49 |
| FR-XIRR-013 | Ten lines with two bad ones list those two lines with reasons and add the eight on confirm; 20,001 characters is refused. | BROWSER-FUNCTIONAL | F-XIRR | R08 | 49 |
| FR-XIRR-014 | Accessible names are unique per row; adding a row focuses its date field. | BROWSER-A11Y | n/a | R15 | 49 |
| FR-XIRR-015 | Example then Reset leaves two empty rows and no result. | BROWSER-FUNCTIONAL | n/a | R04 | 49 |
| FR-XIRR-016 | The clipboard text equals the expected string for the reference example. | BROWSER-FUNCTIONAL | n/a | R03 | 49 |
| FR-XIRR-017 | Each topic has its own heading or paragraph; the banned-words list is absent. | BROWSER-FUNCTIONAL | n/a | R03 | 49 |
| FR-XIRR-018 | An automated scan reports no violations on the empty, example and error states. | BROWSER-A11Y | n/a | R15 | 49 |
| FR-XIRR-019 | Measured overflow none at the three widths with 100 rows present. | BROWSER-MOBILE | n/a | R14 | 49 |
| FR-XIRR-020 | A request log is empty of non-local requests; a pasted <script> line is reported as a bad line and creates no element. | SECURITY-NETWORK | n/a | R06,R08 | 49 |
| FR-XIRR-021 | The solve count per settled result is one; the time for 100 rows is measured in Stage 3 and recorded (no figure is claimed here). | BROWSER-FUNCTIONAL | F-XIRR | R09 | 49 |
| FR-XIRR-022 | None of those controls exist. | BROWSER-FUNCTIONAL | n/a | R16 | 49 |
| FR-NAV-001 | Each pair named is present in both directions where listed; no list exceeds three entries. | CATALOG | n/a | R12 | 50 |
| FR-NAV-002 | A catalog test asserts every related tool shares the source tool's section. | CATALOG | n/a | R12 | 50 |
| FR-NAV-003 | relationships, tool-catalog and search tests pass with the new pins; no assertion is weakened. | CATALOG | n/a | R12 | 50 |
| FR-NAV-004 | Either both entries are removed with the inventory test updated, or both remain and no test changes. | CATALOG | n/a | R12,R13 | 50 |
| FR-NAV-005 | The search test passes with an updated bound whose justification is recorded. | CATALOG | n/a | R12 | 50 |
| FR-NAV-006 | The URL inventory shows no removed URL. | STATIC | n/a | R12,R13 | 50 |

## 3. Coverage of the required conditions

| Condition | Owning requirements |
|---|---|
| Normal input | FR-EMI-005, FR-XIRR-007, FR-INF-002 |
| Zero values | FR-EMI-005 (rate 0), FR-EMI-006 (rate 0), FR-XIRR-004 (amount 0) |
| Negative values | FR-EMI-002, FR-XIRR-004 |
| Empty values | FR-EMI-002, FR-XIRR-003, FR-INF-001 |
| Invalid values | FR-EMI-002, FR-INF-006, FR-XIRR-005 |
| Minimum and maximum | FR-XIRR-003, FR-XIRR-004, FR-XIRR-005, FR-INF-001 |
| Precision and rounding | FR-EMI-005, FR-EMI-008, FR-XIRR-004, FR-XIRR-010 |
| Unit conversion | FR-EMI-006 (years and months), FR-XIRR-006 (days to years) |
| Scenario comparison | FR-EMI-012 (hand-off), FR-LC-001, FR-XIRR-011 |
| Live calculation | FR-EMI-001, FR-PPF-001, FR-XIRR-002 |
| Explicit action | FR-XIRR-002 (bulk paste), FR-XIRR-013 |
| Reset | FR-EMI-003, FR-PPF-004, FR-XIRR-015 |
| Copy | FR-EMI-011, FR-XIRR-016 |
| Mobile | FR-EMI-015, FR-EMI-009, FR-XIRR-019 |
| Keyboard | FR-EMI-014, FR-XIRR-014 |
| Accessibility | FR-EMI-003, FR-EMI-014, FR-INF-008, FR-XIRR-018 |
| Security and privacy | FR-EMI-016, FR-LC-003 to FR-LC-005, FR-XIRR-020 |
| Error recovery | FR-LC-006, FR-EMI-002, FR-XIRR-008 |

## 4. Traceability

Chain: user problem, proposed feature, requirement, acceptance criterion, formula reference, test category, risk, pack.

| User problem (pack) | Feature | Requirements | Acceptance | Formula | Test categories | Risks |
|---|---|---|---|---|---|---|
| The most generic loan page makes the visitor press a button, shows only three numbers, can... (pack 45) | EMI Calculator 2.0 | FR-EMI-001 to FR-EMI-018 (18) | same IDs, section 2 | F-AMORT, F-EMI, F-EMI-N, F-EMI-R | BROWSER-A11Y, BROWSER-FUNCTIONAL, BROWSER-MOBILE, CATALOG, SECURITY-NETWORK, UNIT-GOLDEN | R01, R02, R03, R04, R05, R06, R09, R12, R13, R14, R15 |
| A button implies results are not current when they are, and the PDF option loads three thi... (pack 46) | Loan Comparison interaction tidy and third-party PDF repair | FR-LC-001 to FR-LC-006 (6) | same IDs, section 2 | F-EMI | BROWSER-FUNCTIONAL, SECURITY-NETWORK, UNIT-GOLDEN | R05, R06 |
| An explicit Calculate plus an out-of-date label for a calculation that is instant.... (pack 47) | PPF Calculator: automatic results | FR-PPF-001 to FR-PPF-006 (6) | same IDs, section 2 | F-PPF | BROWSER-A11Y, BROWSER-FUNCTIONAL, STATIC, UNIT-GOLDEN | R03, R04, R05, R11 |
| A projection in future rupees hides what the money will buy; SWP's page says inflation is ... (pack 48) | Inflation view for SIP and SWP | FR-INF-001 to FR-INF-010 (10) | same IDs, section 2 | F-INF, F-SIP-CONV | BROWSER-A11Y, BROWSER-FUNCTIONAL, UNIT-GOLDEN | R01, R03, R04, R05, R10, R15 |
| A visitor with irregular dated investments or withdrawals has no way here to find the year... (pack 49) | XIRR Calculator (new) | FR-XIRR-001 to FR-XIRR-022 (22) | same IDs, section 2 | F-XIRR | BROWSER-A11Y, BROWSER-FUNCTIONAL, BROWSER-MOBILE, CATALOG, SECURITY-NETWORK, UNIT-GOLDEN, UNIT-PROPERTY | R01, R03, R04, R06, R07, R08, R09, R10, R12, R13, R14, R15, R16 |
| Related tools are one-directional or empty for six tools, and EMI cannot be found by its p... (pack 50) | Calculators related navigation and catalog aliases | FR-NAV-001 to FR-NAV-006 (6) | same IDs, section 2 | n/a | CATALOG, STATIC | R12, R13 |

## 5. Counts and integrity checks (computed from the same data as this table)

- Functional requirements: **68**; acceptance criteria: **68** (one each); packs: **6**.
- Pack 45: 18 requirements.
- Pack 46: 6 requirements.
- Pack 47: 6 requirements.
- Pack 48: 10 requirements.
- Pack 49: 22 requirements.
- Pack 50: 6 requirements.
- By test category: BROWSER-A11Y 6, BROWSER-FUNCTIONAL 25, BROWSER-MOBILE 3, CATALOG 7, SECURITY-NETWORK 5, STATIC 2, UNIT-GOLDEN 17, UNIT-PROPERTY 3.
- Duplicate IDs: none. Requirements without an acceptance criterion: none. Requirements citing an undefined formula or risk: none (checked by the generator before writing).
- Formula references used: F-AMORT, F-EMI, F-EMI-N, F-EMI-R, F-INF, F-PPF, F-SIP-CONV, F-XIRR (defined in 11).
- Risks referenced: R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R11, R12, R13, R14, R15, R16 (defined in 14).
- Requirements that rest on an evidence gap: FR-PPF-006 (the official PPF interest rule has not been read in this phase); FR-INF-003's value was recomputed once here but is not yet in formula-reference-check.py; add it before Stage 2.
