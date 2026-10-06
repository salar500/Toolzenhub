# Tool Pack 12: Date Calculator (add or subtract; the second Time Tools tool)

Status: built and verified      Base commit: 5e6acb3
Id and slug: `date-calculator` (route `/tools/date-calculator/`)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; the previous pack is `11-date-difference.md`.

## Selection and hierarchy

Home → All Tools → **Time Tools** → Date Calculator. The tool sits directly under the Time Tools section (`sectionId: "time-tools"`, no category), exactly as Date Difference does. It is not a Calculators-category tool and no calculator view lists it.

- **User job:** "I have a date and a length of time; what date do I get?" A deadline, a notice period, a due date, a warranty, a booking.
- **Different from Date Difference:** Date Difference answers "how far apart are these two dates?"; this tool answers "what date results if I add or subtract this?". The two link to each other in prose.
- **Replaces** the Coming Soon Converter entry `date` ("Date Calculator – Calculate dates and date differences."), which was a placeholder that half-overlapped Date Difference and sat in the wrong place. That entry is removed so there is one Date Calculator; the Coming Soon count falls from 14 to 13 and the All Calculators list from 26 to 25 entries.

## Arithmetic contract (pinned before implementation)

Inputs are calendar dates read from `YYYY-MM-DD` text (native date input) in the proleptic Gregorian calendar. **No `Date` object takes part**, so no time zone or daylight-saving rule can touch a result.

1. **Years and months together** are added or subtracted as whole calendar months (1 year = 12 months). The day of the month is kept and **clamped to the last day of the target month** when that month is shorter (31 January + 1 month = 28, or in a leap year 29, February; 29 February 2024 + 1 year = 28 February 2025).
2. **Then weeks and days** are added or subtracted as plain calendar days (1 week = 7 days), counted from the date step 1 produced.
3. Subtract uses the same two steps with the sign reversed (31 March − 1 month = the last day of February).
4. **Supported range:** years 1 to 9999, the same as Date Difference. A start date outside it is invalid; a result outside it is not shown, with a message that says why.
5. **Not reversible after a clamp**, by definition: 31 January + 1 month = 28 February, and 28 February − 1 month = 28 January. No test asserts that add-then-subtract returns the start; the page says so.

Amounts: whole numbers, 0 or more, up to seven digits; a blank field is 0. A decimal, a negative, an exponent, a sign, a separator or text is an error on that field. Seven digits cannot overflow; whatever they reach beyond year 9999 or before year 1 is the out-of-range message.

Weekday: from the day number (1970-01-01, day number 0, was a Thursday). The date for a day number is the inverse of the Date Difference engine's day number (Hinnant's civil-from-days).

## Result

- **Resulting date** (primary), written out ("28 February 2026").
- **Weekday.**
- **Distance from the start date:** the signed calendar days between the start and the result, said in words ("28 days after the start date", "1 day before…", "the same day as the start date"). This is not the entered duration: "1 month" is not a fixed number of days.
- One sentence stating the operation in words, with both weekdays.
- **Month-end note, only when a clamp happened:** "February 2026 has only 28 days, so the date was adjusted from day 31 to the last day of the month, 28 February." (and, when weeks or days follow, that they were counted from that date). Never shown otherwise.
- States: no start date or no duration (or an all-zero duration) is guidance, not an error; a malformed or impossible date or a bad amount is an error linked to that field (`aria-invalid`, `aria-describedby`); an out-of-range result is an error with no figures. No `NaN`, `undefined`, `Invalid Date` or `Infinity` ever appears.

## Default state and controls

Both blank: the start date is not filled with today (the tool is deterministic and screenshots are stable); Add is selected; years, months, weeks and days are blank (zero). Add and Subtract are two native radios in a labelled group (`fieldset`/`legend`), drawn as large segments with a tick as well as a colour, so the choice never relies on colour. The four amounts are text fields with a numeric keypad (`inputmode="numeric"`), two by two on a narrow screen and four across on a wide one, 48px high. The result updates live; Reset restores the default and returns focus to the start date; Reset looks enabled. The result is announced politely after a short pause.

## Exclusions (v1)

Weekdays-only or business-day mode, weekends, public holidays and any calendar (a business-day tool needs its own clear model, and "weekdays" are not "business days" once holidays exist; **"business days calculator" is deliberately not an alias**); time of day, hours, minutes and time zones; "today" as a default or shortcut; counting between two dates (Date Difference); an Age mode (**"age calculator" is not an alias**); any API, storage, account or login.

## Search and isolation

Aliases: "add days to date", "subtract days from date", "date after days", "date before days", "add months to date", "subtract months from date", "date arithmetic". The title itself is "Date Calculator". Found by All Tools and the global search; "date calculator" and each alias lead with this tool, and "date difference" or "days between dates" still lead with Date Difference. **Not** found by the Calculator Categories, All Calculators or Loans searches, and none of the three pages lists it. No tool-specific search code: metadata and aliases only.

## Platform changes (small, no calculator touched)

`data/tools.js` (the entry; the Converter `date` entry removed), `src/_data/toolStyles.json` (the stylesheet), the tool's own module, engine and CSS, tests and baselines. The directory builder, section page, Home cards and search already derive from the data, so nothing there changed. Featured Tools is unchanged (no tool is replaced to make room). Related tools: the tool opts out of the related-calculators and related-articles sections (no calculator or article is related) and links Date Difference in prose.

## Verification

- `tests/fixtures/date-calculator-golden.py`: an independent reference using Python `datetime.date`, `timedelta`, `calendar.monthrange` and `divmod` on a month index (no days-from-civil, no shared algorithm; the supported range is whatever Python's date type allows, found through `OverflowError`). 80 cases: ordinary, same month, month and year boundaries, 31 January + 1 month, 31 March − 1 month, 29 February + years, 1900 (not leap), 2000 (leap), 2100 (not leap), weeks across months and years, 1000 days, 5000 weeks, 3,652,058 days, zero durations, both range ends and one step beyond each, clamp followed by a day offset. Its JSON is embedded in `tests/unit/date-calculator-golden.test.mjs`.
- The same test file adds: the contract by example, years = 12 months and weeks = 7 days equivalences, the not-reversible example, the range ends, seven-digit amounts, blank and invalid input per field, the weekday against `Date.UTC` as a second opinion over about 60,000 sampled dates across years 1 to 9999, and `dateFromDayNumber` ∘ `dayNumber` round trips over every day in windows around the epoch and the 1900, 2000 and 2100 boundaries.
- Browser: `tests/browser/date-calculator.spec.js` (tool, validation, keyboard, mobile layout, Time Tools, All Tools, intent queries, calculator-search isolation); accessibility and smoke on the changed surfaces; DOM, SEO and links baselines; visual baselines for Date Calculator, Time Tools, All Tools, All Calculators and Calculator Categories (the last two lost one Coming Soon card). No calculator engine, calculator spec or full regression was run.

## Known limitations

Calendar days only; no weekends, business days or holidays; no time of day; years 1 to 9999; the result of adding then subtracting a month-end date is not the start by definition; the amounts are whole numbers (no "1.5 months").
