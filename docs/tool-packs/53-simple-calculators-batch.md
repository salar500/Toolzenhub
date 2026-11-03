# Tool Pack 53: ten calculators from the Coming Soon list (2026-11-02)

Status: **built locally, uncommitted, formulas unit-tested, NOT browser-tested and NOT reviewed by the owner.**
Authority: the owner's "Website Completion" instruction of 2026-11-02 (finish the Coming Soon calculators; develop rather than retire).

## What was built

One shared scaffold, `assets/js/calculators/common/simple-calculator.js`, draws the page every calculator here uses (intro, form, live results, Reset, Copy summary, how to use, reading the result, a worked example produced by calling the same `solve()` the page uses, assumptions, FAQ). Each calculator is a pure formula module plus a configuration file. Number helpers are in `common/number-text.js` (no imports, so the formula modules and their tests do not need the page). Layout is `assets/css/calculators/simple-calculator.css`.

| Calculator | Route | Category | Formula module | Basis |
|---|---|---|---|---|
| Interest | `/calculators/interest/` | Loans | `formulas/interest.js` | simple I = P r t; compound A = P (1 + r/n)^(nt) |
| ROI | `/calculators/roi/` | Business | `formulas/roi.js` | (final - invested) / invested; annualised (final/invested)^(1/years) - 1 |
| Ratio | `/calculators/ratio/` | Math | `formulas/ratio.js` | greatest common divisor on decimals scaled to whole numbers (6 places); D = B x C / A |
| Age | `/calculators/age/` | Math | `formulas/age.js` | the calendar rules of `tools/date-difference/date-engine.js`; next birthday |
| Personal Loan | `/calculators/personal-loan/` | Loans | `formulas/personal-loan.js` | EMI from `formulas/loan.js` plus an optional processing fee in percent |
| Loan Eligibility | `/calculators/loan-eligibility/` | Loans | `formulas/loan-eligibility.js` | EMI room = income x share - existing EMIs; loan = present value of that EMI |
| BMI | `/calculators/bmi/` | Health | `formulas/body.js` | kg / m^2; WHO adult categories 18.5, 25, 30; WHO 2004 Asian action points 23.0 and 27.5 |
| BMR | `/calculators/bmr/` | Health | `formulas/body.js` | Mifflin-St Jeor (1990): 10 kg + 6.25 cm - 5 age + 5 (male) or - 161 (female) |
| Calorie | `/calculators/calorie/` | Health | `formulas/body.js` | BMR x 1.2, 1.375, 1.55, 1.725 or 1.9 (conventional multipliers) |
| Unit Converter | `/calculators/unit-converter/` | Converter | `formulas/units.js` | exact defined factors to a base unit per group; temperature by formula |

Also changed with them: Health and Converter now have category pages (`/health.html`, `/converter.html`, `ROUTES.health`, `ROUTES.converter`, `landing` in `data/categories.js`); the Math and Business pages list their new tools; the sections' wording no longer says "coming soon" for Health and Converter.

## Evidence and limits (read before release)

- **Sources used.** BMI categories: WHO adult classification; WHO Expert Consultation, Lancet 2004;363:157-163 (it kept 18.5/25/30 as the international classification and added 23.0 and 27.5 as public-health action points for Asian populations; it did not redefine cut-offs). Mifflin MD, St Jeor ST et al., Am J Clin Nutr 1990;51(2):241-247. The activity multipliers are conventional and sources word the levels differently; the page says so. Unit factors are the exact definitions (inch 0.0254 m, pound 0.45359237 kg, US gallon 3.785411784 L, UK gallon 4.54609 L, and so on). The BMI and Mifflin facts were checked by a web search on 2026-11-02 against abstracts, not against the full papers.
- **Health wording.** The pages say "screening estimate, not medical advice", refuse BMI under 18, give no weight-loss or weight-gain calorie target, and exclude pregnancy and breastfeeding. A medical or dietetics reviewer has NOT read them.
- **Loan Eligibility** uses a share of income that the visitor enters (50 is only a starting value). It is not any lender's rule and says so. It does not use any lender's figure, because none has been sourced.
- **Personal Loan** adds a processing fee as entered; it assumes no tax and no deduction from the amount received.
- **Unit Converter** has no currency (rates change; the site fetches no live data) and no region-specific land units.
- **Age** gives the plain calendar age; some official forms count age differently, and the page says so.

## Verification done

`tests/unit/simple-calculators.test.mjs` (36 tests): hand-computed vectors for every formula module (for example 50,000 to 65,000 over 3 years is 30% and 9.14% a year; 12 : 20 is 3 : 5; 10,000 at 10% for 2 years is 2,000 simple and 2,100 compound; 15 May 1990 to 2 Nov 2026 is 36 years 5 months 18 days with the next birthday in 194 days; 5,00,000 at 12% for 3 years is an EMI of 16,607.15; 30,000 EMI at 10% for 20 years re-checked through the EMI formula; BMI 22.9 for 70 kg and 175 cm; BMR 1,780 and 1,320.25; 1,780 x 1.55 = 2,759; 1 mile = 1.609344 km), the WHO category boundaries, refusals and empty states, and a static page contract for all ten. The pinned catalog, directory, sections, taxonomy, search, relationships and tool-capabilities tests were edited deliberately for the new published set.

NOT done: any browser test of the ten pages (typing, sliders, the date buttons, Reset, Copy, the select lists), any layout check at 320/360/390 px, a screen-reader check, a visual baseline, and the owner's review. These belong to the testing phase after the owner's review.

## Still Coming Soon after this pack

**Currency Converter.** It needs live exchange rates, which are changing data from an external source (rulebook 13.9: no tracker or comparison without an official source and a maintenance owner, and the site fetches no live data). It cannot be completed responsibly without a decision on the data source. See the ledger for the options.
