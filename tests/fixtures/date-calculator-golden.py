"""
Independent reference for the Date Calculator (Tool Pack 12): add or subtract years, months, weeks and days.

It deliberately shares no algorithm with the JavaScript engine (assets/js/tools/date-calculator/date-arithmetic.js): the engine uses
integer days-from-civil arithmetic and its inverse; this script uses Python's datetime.date, datetime.timedelta, calendar.monthrange
and divmod on a month index. Python's date type raises OverflowError outside years 1..9999, which is how the supported range is
established here rather than by a hand-written check.

The contract (docs/tool-packs/12-date-calculator.md):
  1. Add or subtract the years and months together as whole calendar months (1 year = 12 months), keeping the day of the month and
     clamping it to the last day of the target month.
  2. Then add or subtract the weeks and days as plain calendar days (1 week = 7 days).
  3. A result outside years 1..9999 is out of range (no result).

Run:  python tests/fixtures/date-calculator-golden.py     (prints JSON, embedded in tests/unit/date-calculator-golden.test.mjs)
"""
import calendar
import json
from datetime import date, timedelta

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def compute(start, op, years, months, weeks, days):
    sign = 1 if op == "add" else -1
    y, m, d = (int(x) for x in start.split("-"))
    total = y * 12 + (m - 1) + sign * (years * 12 + months)
    ny, nm0 = divmod(total, 12)
    nm = nm0 + 1
    if ny < 1 or ny > 9999:
        return {"status": "out-of-range"}
    last = calendar.monthrange(ny, nm)[1]
    nd = min(d, last)
    stepped = date(ny, nm, nd)
    try:
        result = stepped + timedelta(days=sign * (weeks * 7 + days))
    except OverflowError:
        return {"status": "out-of-range"}
    return {
        "status": "ok",
        "result": result.isoformat(),
        "weekday": WEEKDAYS[result.weekday()],
        "clamped": nd != d,
        "displacement": (result - date(y, m, d)).days,
    }


# (start, op, years, months, weeks, days)
CASES = [
    # ordinary
    ("2026-01-15", "add", 0, 0, 0, 10),
    ("2026-01-15", "subtract", 0, 0, 0, 10),
    ("2026-03-10", "add", 0, 0, 2, 3),
    ("2026-03-10", "subtract", 0, 0, 2, 3),
    ("2026-06-15", "add", 1, 2, 3, 4),
    ("2026-06-15", "subtract", 1, 2, 3, 4),
    # month boundaries and clamping
    ("2026-01-31", "add", 0, 1, 0, 0),
    ("2024-01-31", "add", 0, 1, 0, 0),
    ("2026-03-31", "subtract", 0, 1, 0, 0),
    ("2026-05-31", "subtract", 0, 1, 0, 0),
    ("2026-08-31", "add", 0, 1, 0, 0),
    ("2026-01-30", "add", 0, 1, 0, 0),
    ("2026-01-29", "add", 0, 1, 0, 0),
    ("2028-01-29", "add", 0, 1, 0, 0),
    ("2026-01-31", "add", 0, 1, 0, 1),
    ("2026-01-31", "add", 0, 1, 1, 0),
    ("2026-01-31", "add", 0, 2, 0, 0),
    ("2026-01-31", "add", 0, 13, 0, 0),
    ("2026-02-28", "subtract", 0, 1, 0, 0),
    ("2026-02-28", "add", 0, 1, 0, 0),
    ("2026-10-31", "subtract", 0, 8, 0, 0),
    # leap years
    ("2024-02-29", "add", 1, 0, 0, 0),
    ("2024-02-29", "add", 4, 0, 0, 0),
    ("2024-02-29", "subtract", 1, 0, 0, 0),
    ("2024-02-29", "add", 0, 12, 0, 0),
    ("2024-02-28", "add", 0, 0, 0, 1),
    ("2024-02-28", "add", 0, 0, 0, 2),
    ("2023-02-28", "add", 0, 0, 0, 1),
    ("1900-02-28", "add", 0, 0, 0, 1),
    ("2000-02-28", "add", 0, 0, 0, 1),
    ("2100-02-28", "add", 0, 0, 0, 1),
    ("1900-03-01", "subtract", 0, 0, 0, 1),
    ("2000-03-01", "subtract", 0, 0, 0, 1),
    ("2000-02-29", "add", 100, 0, 0, 0),
    ("2000-02-29", "add", 400, 0, 0, 0),
    ("1896-02-29", "add", 4, 0, 0, 0),
    # year boundaries
    ("2025-12-31", "add", 0, 0, 0, 1),
    ("2026-01-01", "subtract", 0, 0, 0, 1),
    ("2025-12-15", "add", 0, 1, 0, 0),
    ("2026-01-15", "subtract", 0, 1, 0, 0),
    ("2025-11-30", "add", 0, 3, 0, 0),
    # weeks crossing months and years
    ("2026-01-28", "add", 0, 0, 1, 0),
    ("2026-12-28", "add", 0, 0, 1, 0),
    ("2026-01-03", "subtract", 0, 0, 1, 0),
    ("2026-02-25", "add", 0, 0, 2, 0),
    # large offsets
    ("2026-01-01", "add", 0, 0, 0, 1000),
    ("2026-01-01", "subtract", 0, 0, 0, 1000),
    ("2026-01-01", "add", 0, 0, 5000, 0),
    ("2026-01-01", "add", 100, 0, 0, 0),
    ("2026-01-01", "add", 0, 1200, 0, 0),
    ("2026-01-01", "add", 0, 0, 0, 3652058),
    # zero duration
    ("2026-05-05", "add", 0, 0, 0, 0),
    ("2026-05-05", "subtract", 0, 0, 0, 0),
    # lower boundary
    ("0001-01-01", "add", 0, 0, 0, 0),
    ("0001-01-01", "add", 0, 0, 0, 1),
    ("0001-01-01", "subtract", 0, 0, 0, 1),
    ("0001-01-02", "subtract", 0, 0, 0, 1),
    ("0001-01-31", "subtract", 0, 1, 0, 0),
    ("0001-03-31", "subtract", 0, 1, 0, 0),
    ("0001-12-31", "subtract", 1, 0, 0, 0),
    ("0002-01-01", "subtract", 1, 0, 0, 0),
    ("0002-01-01", "subtract", 0, 12, 0, 0),
    ("0005-02-28", "subtract", 4, 0, 0, 0),
    # upper boundary
    ("9999-12-31", "add", 0, 0, 0, 0),
    ("9999-12-30", "add", 0, 0, 0, 1),
    ("9999-12-31", "add", 0, 0, 0, 1),
    ("9999-12-31", "add", 0, 1, 0, 0),
    ("9999-12-31", "add", 1, 0, 0, 0),
    ("9999-01-31", "add", 0, 11, 0, 0),
    ("9999-01-31", "add", 0, 12, 0, 0),
    ("9998-12-31", "add", 1, 0, 0, 0),
    ("9999-06-15", "add", 0, 0, 29, 0),
    ("9999-06-15", "add", 0, 0, 28, 0),
    ("9999-12-01", "subtract", 9998, 11, 0, 0),
    ("9999-12-31", "subtract", 9998, 11, 0, 30),
    ("9999-12-31", "subtract", 9998, 11, 0, 31),
    ("9999-12-31", "subtract", 9999, 0, 0, 0),
    # clamp followed by a day offset that lands elsewhere
    ("2026-03-31", "subtract", 0, 1, 0, 1),
    ("2026-03-31", "subtract", 0, 1, 1, 0),
    ("2026-07-31", "add", 0, 1, 0, 0),
]


def key(case):
    return "|".join(str(x) for x in case)


def main():
    cases = {key(c): compute(*c) for c in CASES}
    # sanity: every status is one of the two, and the table is not trivially all "ok"
    assert {v["status"] for v in cases.values()} == {"ok", "out-of-range"}
    # reference self-checks on facts a person can verify by hand
    assert cases[key(("2026-01-31", "add", 0, 1, 0, 0))]["result"] == "2026-02-28"
    assert cases[key(("2024-01-31", "add", 0, 1, 0, 0))]["result"] == "2024-02-29"
    assert cases[key(("2024-02-29", "add", 1, 0, 0, 0))]["result"] == "2025-02-28"
    assert cases[key(("2026-03-31", "subtract", 0, 1, 0, 0))]["result"] == "2026-02-28"
    assert cases[key(("1900-02-28", "add", 0, 0, 0, 1))]["result"] == "1900-03-01"
    assert cases[key(("2000-02-28", "add", 0, 0, 0, 1))]["result"] == "2000-02-29"
    # 1 January 2026 was a Thursday; 29 February 2000 a Tuesday; 1 January 1 (proleptic) a Monday
    assert compute("2026-01-01", "add", 0, 0, 0, 0)["weekday"] == "Thursday"
    assert compute("2000-02-29", "add", 0, 0, 0, 0)["weekday"] == "Tuesday"
    assert compute("0001-01-01", "add", 0, 0, 0, 0)["weekday"] == "Monday"
    print(json.dumps({"cases": cases}, indent=1))


if __name__ == "__main__":
    main()
