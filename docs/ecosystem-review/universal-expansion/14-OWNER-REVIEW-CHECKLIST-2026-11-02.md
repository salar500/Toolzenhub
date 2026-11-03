# 14. Owner review checklist for the Website Completion phase (2026-11-02)

Scope: only what changed in this phase. It is a list to inspect by hand; none of it has been run as a test in a browser. Serve `dist-ghpages/` (base `/Toolzenhub/`) after `npm run build:all`, or run `npm run dev`. Check at about 320, 360, 390 px and on a desktop window, and on your phone for touch.

## A. The ten new calculators (`/calculators/<id>/`)

For each: open the page; type values; check the results change as you type; try an empty and an invalid value (a message, not a stale number); press Reset (fields return, results clear, focus goes to the first field); press Copy summary; read the "Worked Example" and compare it with typing the same values; check nothing overflows sideways.

| Route | Try |
|---|---|
| `/calculators/interest/` | 10000, 10%, 2 years, Yearly: compound interest 2,100.00, simple 2,000.00. Change Compounded to Quarterly: amount 12,184.03. Move the rate and time sliders. |
| `/calculators/roi/` | 50000, 65000, 3 years: 30%, net profit 15,000.00, 9.14% a year. Try 1000 and 0: -100%, no yearly rate. |
| `/calculators/ratio/` | 12 and 20: 3 : 5; add 30 as the new first term: second term 50. Try 1.5 and 2.5. Try 0 and 0 (a message). |
| `/calculators/age/` | 1990-05-15 with the second date empty: today is used and shown. Use the calendar icon and "Use today". Try a future birth date (a message). Try 2000-02-29. |
| `/calculators/personal-loan/` | 500000, 12%, 3 years, fee 2: EMI 16,607.15, fee 10,000.00. Sliders. |
| `/calculators/loan-eligibility/` | income 80000, existing 10000, 50%, 10%, 20 years: new EMI 30,000.00, loan about 31,08,738.56. Read the wording: it must read as an estimate with your own share, not a lender rule. |
| `/calculators/bmi/` | 70 kg, 175 cm, age 30: 22.9, normal range, "Below 23.0". Age 16: a refusal. Read the Asian-population text and the notes. |
| `/calculators/bmr/` | Male, 30, 80 kg, 180 cm: 1,780 kcal a day. Female, 30, 60, 165: 1,320. Leave sex on "Choose": the prompt, not a result. |
| `/calculators/calorie/` | Male, 30, 80, 180, moderate exercise: 2,759 kcal. Read the warning text. Change the activity list. |
| `/calculators/unit-converter/` | 1 km to mi: 0.6213711922 (the page opens on 1 km to mi). 100 C to F: 212. kg to L: a refusal. Open the list: groups for Length, Mass, Area, Volume, Speed, Temperature. |

Please read all health and loan wording as a reader, not only the numbers. No medical or lender review has happened.

## B. New category pages

`/health.html` (BMI, BMR, Calorie), `/converter.html` (Unit Converter), the updated `/math.html` (Percentage, Ratio, Age), `/business.html` (Profit, Margin, ROI), `/loans.html` (the new Loans tools), and the All Tools page `/tools.html`. Check that Health and Converter read well and that no "coming soon" wording is left for them. Currency Converter remains the one Coming Soon calculator (it is not listed as a link).

## C. Sliders (the delayed-slider report)

Open `/calculators/emi/`, `/calculators/fd/`, `/calculators/gst/` and reload a few times, also with the browser's slow-network setting: the sliders should appear with the form, not a second later. This was changed by starting the slider script at the same time as the calculator script; it is reasoning from the code, not a measured trace, so please say if you still see a delay. Also confirm the sliders on the new Interest, ROI, Personal Loan and Loan Eligibility pages, and that Loan Comparison still looks as before.

## D. Date and Time Tools

- `/tools/date-difference/`: a calendar icon beside "Use today" under each date; clicking the icon opens the date picker; the gap between the two date fields and the buttons is no longer cramped; the preset buttons wrap with a gap. New presets "Last 7 days" and "Last 30 days": end today, start 6 or 29 days before, so they show 6 or 29 days apart (7 or 30 counting both ends; the help text says so). Also try them across a month end and the 1st of January.
- The same calendar icon and spacing now appear under the date fields in Business Days, Countdown Timer, Meeting Planner and Shift Planner (they share one helper). Check each opens and that the layout still looks right.

## E. All Tools page `/tools.html`

Calculators inside the category cards are now bordered rows with an arrow and a hover state, like the tool cards. Check that the whole row is clickable, that the cursor and hover are clear, that keyboard Tab shows a visible outline, and that nothing looks clipped on a phone.

## F. Articles

`/articles.html`: page 8 (the last page) now shows the remaining placeholders: Best SIP Strategies for Beginners and Tax Saving Guide are still Coming Soon. The three new guides, if published (see the ledger): `/articles/business/roi-vs-profit-whats-the-difference/`, `/articles/health/how-to-calculate-your-daily-calorie-needs/`, `/articles/converter/easy-unit-conversion-guide/`. Check the figures against the worked examples, the links to the calculator, and the wording of the health article.

## G. Not changed and still open

Gratuity B6, D8 and G9; PDF to Images; SQL Lab and Excel practice (Learning Labs separation); a wider PDF and Image tools collection; the Time Tools audit beyond the date controls; the performance trace. See the ledger and the final report for why.
