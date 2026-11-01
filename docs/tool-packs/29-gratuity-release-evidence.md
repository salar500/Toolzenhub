# Gratuity Calculator (Tool Pack 29): release evidence, review package and phone checklist

Prepared 2026-11-01 from the current repository (`main` at `624b3bb`). This file records evidence and open gates; the specification `29-gratuity-calculator.md` stays the owner of the rules. Nothing here changes a calculation. Status words: VERIFIED, PENDING USER, PENDING EXTERNAL REVIEW, BLOCKED, NOT RUN.

## Status summary

| Item | Status |
|---|---|
| B6 ceiling, ₹20,00,000 | **Partly strengthened, release gate retained.** The text of S.O. 1420(E) was read (reproduction, not the Gazette PDF). No notification under s.53(3) of the Code was found. See Part 1. |
| D8 independent legal review | **PENDING EXTERNAL REVIEW.** Package prepared in Part 2. Nobody has reviewed the tool. |
| G9 phone acceptance | **PENDING USER.** Automated checks pass (Part 3); no case is accepted on the current version. |

## Part 1. B6: statutory ceiling evidence record (verified 2026-11-01)

**Question.** Is ₹20,00,000 the ceiling that applies to a gratuity estimated under the Code on Social Security, 2020 for exits on or after 21 November 2025?

| Field | Entry |
|---|---|
| Source | Ministry of Labour and Employment, Notification **S.O. 1420(E)**, New Delhi, 29 March 2018, file No. S-42012/02/2016-SS-II, signed Manish Gupta, Joint Secretary |
| How it was read | Text read on 2026-11-01 from a copy archived by the Tamil Nadu Labour Department (`https://labour.tn.gov.in/pdf/archives/Govt-increases-maximum-gratuity-limit.pdf`) that reproduces a TaxGuru page. **This is a reproduction, not the Gazette of India PDF.** The labour.gov.in copies named in search results (`/sites/default/files/184299.pdf`, `gratuity_2.pdf`) returned HTTP 403 to the fetch tool and 404 to a direct download; egazette.gov.in was not reached. |
| Text as read | "In exercise of the powers conferred by sub-section (3) of section 4 of the Payment of Gratuity Act, 1972 (39 of 1972), the Central Government hereby specifies that the amount of gratuity payable to an employee under the said Act shall not exceed twenty lakh rupees." |
| Effective date | 29 March 2018 (per the Ministry's own statement quoted in the same page; the notification itself carries no separate date of effect). |
| Code position | s.53(3) of the Code: gratuity "shall not exceed such amount as may be notified by the Central Government". s.164(2)(a): a notification made under the repealed 1972 Act is deemed made under the corresponding provision of the Code and stays in force to the extent not contrary (read earlier, spec L5, L14). MoLE FAQ Q12 (read earlier): "currently ₹20 lakhs". |
| Later change | Searched for a new notification under s.53(3) and for any 2026 change: **none found** in official or secondary sources. A secondary news report cites a Ministry communication of 3 August 2026 saying the ceiling is currently ₹20 lakh; **the letter itself was not seen**. |
| Conclusion | The ₹20 lakh value is supported by the text of the 2018 notification (reproduced), the Ministry's FAQ and the savings clause. It applies to employees of establishments covered by the Code's gratuity chapter, which is what the calculator models. It is **not** a limit on better contractual terms (s.53(5)); bank, central-government and other employer schemes may differ, and the page already says the figure is an estimate. |
| Confidence | Moderate to high that ₹20 lakh is the operative figure; **not** verified from the Gazette itself, and the "deemed under s.53(3)" step is a reading of s.164(2)(a), not a Ministry statement about this notification. |
| Limitation | S.O. 1420(E) names the 1972 Act's s.4(3); no source read says in terms that it continues as a notification under s.53(3). |

**B6 status: the release gate is NOT cleared.** Evidence is stronger than at drafting time, but the Gazette PDF was not obtained. To close it, either (a) download S.O. 1420(E) from egazette.gov.in or labour.gov.in in a normal browser and save it with this evidence, or (b) the owner records acceptance of the reading above as sufficient. **No code was changed.** The comment above `CEILING_PAISE` in `assets/js/calculators/formulas/gratuity-rules.js` still says the gazette text "has NOT been read"; it is left as is, because it remains true of the Gazette itself, and should be updated when B6 closes.

## Part 2. D8: independent legal review package (status: PENDING EXTERNAL REVIEW)

No reviewer has been engaged and none is named. Claude Code did not perform this review and nothing on the page may claim one (spec B11).

**Purpose and users.** An estimator for monthly-rated employees in India, for exits on or after 21 November 2025, showing an estimate with its assumptions. It is not legal advice or an entitlement determination.

**Where each item lives (give the reviewer these).**

| Topic | Location |
|---|---|
| Sources and verified legal findings L1 to L17 | spec section 0 |
| Service-duration convention C′ (D10) and month-end disclosure | spec 7.1, 29.2; `assets/js/calculators/formulas/gratuity-calendar.js` (`anniversary`) |
| Counted years N (more than six months adds a year) | spec 7.2; `gratuity.js` |
| Four-year (48-month) presentation line and three status statements | spec 7.3; `gratuity-rules.js` |
| Amount `wages ÷ 26 × 15 × N`, ceiling | spec 7.4; `gratuity.js`, `gratuity-rules.js` |
| Fixed-term treatment F1 to F6 (amount illustrative) | spec 7.5 |
| Rounding | spec 7.6 |
| Worked examples and independent oracle | spec 7.7; `tests/fixtures/gratuity-golden.py`, `.json`; `tests/unit/gratuity-golden.test.mjs` |
| Page wording | `assets/js/calculators/gratuity/index.js` |

**Verified internally.** Section texts of s.2(88), 53, 54, 164 and Rules 31 to 33 as extracted in spec section 0; the arithmetic, checked by a second implementation (agreement shows consistent arithmetic, not legal correctness); the unit suite for the five Gratuity test files, 166 of 166 passing on 2026-11-01.

**Needs external legal confirmation.**
1. Is option C′ a defensible way to measure service at month ends (it differs from option A for 8 of 366 joining dates, once by a counted year)?
2. Does exactly six months add a year; is "in excess of six months" read as more than six months?
3. Can s.54(B) deeming make an incomplete fifth year count (B4, case law not reviewed)? Is the 48-month line, used only as a presentation classification, acceptable, and are its three statements non-misleading?
4. Is the ₹20 lakh ceiling operative under the Code via s.164(2)(a) (Part 1)?
5. Fixed-term: is "rounded to one additional year" (Rule 33) the right year-count and is the illustrative amount a fair reading of "pro rata"? Early exit and successive contracts (B3c)?
6. Wage input: is a single "qualifying wages" field with the 50% rule left to the user adequate (B5)?
7. Employee categories or exclusions missing (government employees, seasonal, piece-rated, journalists, establishments with fewer than ten employees, state rules B9)?
8. Is any sentence capable of being read as a legal determination, and are the disclaimers adequate?

**Evidence to supply:** this file, the specification sections above, and the page itself (`/calculators/gratuity/` on the preview).

**Review record (fill in only from the reviewer's actual response):** reviewer, qualification, date, answers to 1 to 8, changes requested. **Currently empty. D8 is not complete.**

## Part 3. G9: phone acceptance

**Automated state (2026-11-01, no browser, no build).** `node --test` on `gratuity-golden`, `gratuity-ui`, `gratuity-p1`, `gratuity-auto`, `gratuity-auto-wiring`: 166 tests, 166 pass, 0 fail, 0 skipped. The expected figures for M1 to M5b and M7 and M8 (₹2,30,769.23; ₹1,44,230.77; ₹1,73,076.92; ₹28,846.15; ceiling ₹20,00,000) appear in the golden fixture and tests. The browser spec `tests/browser/gratuity-auto.spec.js` passed 23 of 23 in the recorded desktop regression (ledger, 2026-11-01); it was not re-run today. None of this is phone acceptance.

**Your checklist.** Open `https://salar500.github.io/Toolzenhub/calculators/gratuity/` (or the current preview). There is no Calculate button: enter the case and wait about a second after the last wages digit. Expected figures are from spec section 25 and assume convention C′ (provisional). Tick or write what you actually see.

| Case | What to enter | Expected | Your result | Status |
|---|---|---|---|---|
| M1 | Regular; ₹50,000; join 01-04-2018, exit 31-03-2026 | 8 years, status "five years reached", **₹2,30,769.23** | Passed on the earlier version only (2026-10-22); repeat | PENDING USER |
| M2 | Regular; ₹50,000; 01-01-2021 to 30-06-2026 | 5 y 6 m 0 d, years counted 5, **₹1,44,230.77** | | PENDING USER |
| M3 | Same join; exit 01-07-2026 | 5 y 6 m 1 d, years counted 6, **₹1,73,076.92** | | PENDING USER |
| M4 | Regular; ₹50,000; 01-07-2021 to 28-02-2026 | 4 y 8 m 0 d, "fifth year, not determined from dates", **illustrative** ₹1,44,230.77, not described as owed | | PENDING USER |
| M5 | Regular; 01-01-2022 to 30-12-2025 | 3 y 11 m 30 d, "threshold not reached on these dates", no amount; explorer shows the calendar five-year date | | PENDING USER |
| M5b | Regular; ₹50,000; 31-10-2020 to 30-04-2026 | 5 y 6 m 0 d, years counted 5, ₹1,44,230.77; month-end disclosure visible | | PENDING USER |
| M6 | Any join; exit 31-10-2025 | Earlier-law message, no figure | | PENDING USER |
| M7 | Regular; ₹1,00,000; 01-04-1990 to 31-03-2026 | **₹20,00,000**, "ceiling applied" | | PENDING USER |
| M8 | Fixed-term, runs to its end; 01-01-2025 to 31-12-2025 | Illustrative **₹28,846.15** | | PENDING USER |
| M8b | Fixed-term; 01-01-2025 to 30-11-2025 | "Not yet one year", no amount | | PENDING USER |
| M8c | Fixed-term, "It ends earlier" | Message, no figure (you first see "Still needed" until wages and both dates are entered) | | PENDING USER |
| M9 | Exit date before joining date | Error message, no figure | | PENDING USER |
| M10 | Wages zero | Error message, no figure | | PENDING USER |
| M11 | Employee type "Other" | Explanation, no figure | | PENDING USER |
| Extra | Reset; keyboard only; widths 320, 360, 390 px; consent banner; related links; "Out of date" label above the amount when you change an entry | Reset clears everything and focuses the first field; no focus jump while typing; label shows only while the figure is stale | | PENDING USER |

Send back any failure with a screenshot, the device and browser, and the exact inputs. Record device and browser here only when you supply them. Draft wording (starting message, out-of-date label, Reset message, "Your service" labels) is still awaiting your review (spec 34.11).

## Remaining actions that need a person

1. **You:** run the checklist above on your phone.
2. **You or the owner:** save the Gazette PDF of S.O. 1420(E) or record acceptance (B6).
3. **External reviewer:** answer the Part 2 questions (D8).
