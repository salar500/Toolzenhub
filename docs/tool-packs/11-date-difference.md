# Tool Pack 11: Date Difference Calculator (the first Time Tools tool, and the first tool outside Calculators)

Status: built and verified      Base commit: b5d6fd4
Id and slug: `date-difference` (route `/tools/date-difference/`)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; the previous pack is `10-percentage.md`.

This pack adds the **second major section** (Time Tools) and its first tool. It must prove the generalized section/tool architecture works without touching any calculator.

## Selection and hierarchy

Home → All Tools → **Time Tools** → Date Difference Calculator. Time Tools has **no subcategory**: a section with one directly understandable tool lists it directly. Subcategories (Date, Timers, World time ...) are introduced only
when several live tools make grouping help; they are not created for symmetry.

- **Section:** `time-tools` (title "Time Tools"), landing `/time-tools.html` (`ROUTES.timeTools`), tool route prefix `tools` (so `/tools/<id>/`; the existing `/calculators/<id>/` routes are untouched).
- **Tool entry:** a catalog entry names its section directly (`sectionId: "time-tools"`) instead of a category. A catalog entry has a `category` (Calculators) **or** a `sectionId`, never both; a tool with a `sectionId` has no category, so it is outside every calculator view
  (Calculator Categories, All Calculators, the Loans search), which are built from the Calculators section only.
- **Why this tool earns a place:** "how many days between two dates?" is asked for deadlines, trips, subscriptions, contracts, employment periods, events and projects; it has no rule, rate or data dependency, it is exact, and it is not a Calculators tool. A search box answers the bare
  count; this page also gives the **calendar breakdown** (years, months, days) under one stated rule, weeks and days, and says plainly what a reversed or equal pair means.

## User job and repeat use

"This tool helps anyone planning or checking a period (a deadline, a trip, a subscription, a contract or employment period, an event) understand how far apart two calendar dates are, when they have two dates in hand."
Trigger: two dates and a question about the gap. Result-driven action: plan, plan again with a different date, or quote the figure. Return: every new deadline, booking or period; changing one date is one edit.
No account, history or notification is needed.

## Date semantics (pinned)

- Inputs are **calendar dates** (year, month, day), read from `YYYY-MM-DD` text. **No time of day, no time zone, no daylight-saving effect.** No `Date` object takes part in the result.
- Day numbers use the **proleptic Gregorian calendar** by integer arithmetic (days from civil). Total days = `dayNumber(later) − dayNumber(earlier)`, exact.
- Supported years: 1 to 9999. A date must be a real calendar date (2026-02-30 is invalid).
- **Reversed order:** the result is the absolute distance, with the line "The end date comes before the start date." Nothing is silently swapped. **Same date:** 0 days and "Both dates are the same."

## Calendar breakdown rule (pinned before implementation)

Let `A` be the earlier date and `B` the later. `addMonths(A, n)` is the date `n` calendar months after `A` with the **same day of the month, clamped to the last day of the target month** (31 January + 1 month = 28 or 29 February; 29 February + 12 months = 28 February in a common year).
- `n` is the **largest whole number of months for which `addMonths(A, n) ≤ B`**.
- `years = floor(n / 12)`, `months = n mod 12`, and `days = dayNumber(B) − dayNumber(addMonths(A, n))`.
- Display omits a zero unit (`1 month, 9 days`); all zero is `0 days`.
- Properties (checked by the reference and its tests): `addMonths(A, n) ≤ B < addMonths(A, n + 1)`, so `0 ≤ days <` the length of the next month step; total days are independent of the rule; the breakdown of a pair is monotonic in `B`.
- Consequences to state on the page: month lengths differ, so "1 month" is 28 to 31 days; the breakdown is calendar-based and total days is exact.

**Weeks:** `weeks = floor(total / 7)`, `days = total mod 7`, shown as "5 weeks, 5 days" (and "0 weeks, 5 days" under a week).

## Inclusive counting: left out of v1

"Include the end date" (a booking from 1 to 3 March is 3 nights-or-days depending on the habit) would add 1 to total days but has no clean meaning for the years/months/days breakdown (which anniversary does the extra day belong to?). Clarity beats feature count: not in v1, and the page says total days is the number
of days between the dates, not counting both ends.

## Inputs, results, states

Inputs: **Start date** and **End date**, native `<input type="date">`, visible labels, no custom picker, no dependency. **Default: both blank**, with the guidance "Choose a start date and an end date." (nothing depends on today's date, so tests and screenshots are stable). Results update as soon as both are valid; Reset clears both and the result.

| State | Result area |
| --- | --- |
| Neither or one date | The guidance sentence; not an error |
| Malformed or impossible date | A linked error on that field; no result |
| Same date | `0 days`, "Both dates are the same." |
| Reversed | The distance, and "The end date comes before the start date." |
| Normal | Primary: total days. Secondary: the calendar breakdown. Supporting: weeks and days. One sentence of interpretation. |

No `NaN`, `undefined`, `Invalid Date`, `Infinity` or blank cards ever appear. No chart, table, print or CSV (nothing to tabulate).

## Exclusions (v1)

Business days, public holidays and working calendars; country rules; hours, minutes and seconds; time of day and time zones; an Age mode; any calendar or external API; storage, account, login. The page says business days and holidays are not calculated.

## Search and isolation

Aliases: "days between dates", "date duration", "weeks between dates", "how many days between dates", "calendar difference". Not "age calculator". Found by All Tools and the global search with "date difference" first and "days between dates" ranked clearly.
**Must not** be found by: the Calculator Categories search, the All Calculators search, the Loans search. No calculator view lists it; `/categories.html`, `/calculators.html` and `/loans.html` are unchanged.

## Verification

- `tests/fixtures/date-difference-golden.py`: an independent reference with Python `datetime.date` and `calendar.monthrange` (no days-from-civil, no shared algorithm): total days from `date` subtraction, and the breakdown by **walking months** with the clamp rule; the script also asserts the properties above over many pairs and exhaustively over a wide
  grid of dates. Its JSON is embedded in `tests/unit/date-difference-golden.test.mjs`; nothing is copied from the JavaScript.
- Goldens (exact): 2026-01-01 → 2026-01-02 = 1 day; 2026-01-01 → 2026-02-01 = 31 days, 1 month; 2024-02-28 → 2024-03-01 = 2 days, 0 months, 2 days; 2023-02-28 → 2023-03-01 = 1 day; 2026-01-31 → 2026-02-28 = 28 days, 1 month; 2026-01-31 → 2026-03-01 = 29 days, 1 month, 1 day;
  2024-01-31 → 2024-03-01 = 30 days, 1 month, 1 day; 2024-02-29 → 2025-02-28 = 365 days, 1 year; 2024-02-29 → 2028-02-29 = 1461 days, 4 years; 2025-12-31 → 2026-01-01 = 1 day; 2000-01-01 → 2026-10-05 = 9,774 days, 26 years, 9 months, 4 days; same date; reversed pair; 0001-01-01 → 9999-12-31 = 3,652,058 days.

## Interface, content and trust

Shared tool page layout, breadcrumb (centralized: Home › Time Tools › Date Difference Calculator; the landing is Home › All Tools › Time Tools), no related calculators (none is related), no related articles unless an article exists. Sections: How to use; How it is calculated; Total days and the calendar breakdown;
Leap years and month lengths; Common uses; FAQ. Trust note: inputs are calendar dates, the time zone does not change the result, month lengths vary, leap years are handled, business days and holidays are not calculated. No claim of accuracy beyond the arithmetic.

## Articles and images

**No article** in this pack: nothing here needs more than the page's own explanation, and an article would be filler. **No image**: an interval diagram would restate the figures. (A future article on business days versus calendar days waits for a tool that calculates business days.)

## Platform changes (kept small, no calculator touched)

`data/categories.js` (the section), `data/tools.js` (the entry, validation, route), `data/taxonomy.js` and the catalog helpers (a tool's section resolves from `sectionId` or its category), `routes.js` (`timeTools`), the search result card (a tool without a category shows the section only), `categories-search.js` (ignores results that are
not calculators), the directory builder (a section's direct tools; a section page), Home Explore Tools (one card per live section) and Featured Tools (Date Difference replaces EMI: Home Loan, SIP, GST, Margin and Percentage remain, so the featured set spans five calculator categories and one Time Tools tool),
the Home supporting copy, the inventory table and the static checks that treat a tool page as a calculator page.

## Impact-based tests and gate

Unit: the date engine goldens and invariants; the section/catalog pins. Browser: the tool (desktop and mobile), Time Tools landing, All Tools, global search and the isolation of the three calculator searches, navigation, accessibility on changed surfaces. Static: links, assets, SEO, inventory. Visual: only Time Tools,
Date Difference, All Tools and Home. **No calculator engine, calculator spec or full regression is run for this pack.**

## Acceptance

Home → View all tools → Time Tools → Date Difference works; "date difference" and "days between dates" find it first in All Tools search; Calculator Categories, All Calculators and Loans searches never show it; both builds pass; no existing calculator file changes.
