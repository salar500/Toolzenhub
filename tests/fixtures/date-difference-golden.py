"""
Independent reference for the Date Difference Calculator (Tool Pack 11).

Total days come from Python's datetime.date subtraction. The calendar breakdown is found by WALKING months with calendar.monthrange:
from the earlier date A, step one month at a time (same day of the month, clamped to the last day of the month) while the stepped date
is not after the later date B; the number of steps is the whole months, and what is left is counted in days. This shares nothing with the
JavaScript (which uses integer days-from-civil arithmetic and a formula for the month count).

It also asserts, over a wide grid of dates, the properties the page relies on:
  addMonths(A, n) <= B < addMonths(A, n + 1);  0 <= days < the days of the next month step;  total days = (stepped date - A) + days.

Run:  python tests/fixtures/date-difference-golden.py     (prints JSON)
"""
import calendar
import json
from datetime import date, timedelta


def add_months(d, n):
    """the date n calendar months after d: the same day of the month, clamped to the last day of that month"""
    index = d.year * 12 + (d.month - 1) + n
    year, month = divmod(index, 12)
    month += 1
    if year < 1 or year > 9999:
        raise OverflowError
    return date(year, month, min(d.day, calendar.monthrange(year, month)[1]))


def breakdown(a, b):
    """(years, months, days) from the earlier date a to the later date b, by walking months"""
    assert a <= b
    n = 0
    while True:
        try:
            nxt = add_months(a, n + 1)
        except OverflowError:
            break
        if nxt > b:
            break
        n += 1
    stepped = add_months(a, n)
    assert stepped <= b
    return n // 12, n % 12, (b - stepped).days, n


def case(start, end):
    s, e = date.fromisoformat(start), date.fromisoformat(end)
    a, b = (s, e) if s <= e else (e, s)
    total = (b - a).days
    years, months, days, n = breakdown(a, b)
    return {
        "start": start, "end": end, "reversed": s > e, "same": s == e,
        "totalDays": total, "years": years, "months": months, "days": days,
        "weeks": total // 7, "weekDays": total % 7,
    }


PAIRS = [
    ("2026-01-01", "2026-01-02"), ("2026-01-01", "2026-02-01"), ("2024-02-28", "2024-03-01"), ("2023-02-28", "2023-03-01"),
    ("2026-01-31", "2026-02-28"), ("2026-01-31", "2026-03-01"), ("2024-01-31", "2024-03-01"), ("2024-01-31", "2024-02-29"),
    ("2024-02-29", "2025-02-28"), ("2024-02-29", "2025-03-01"), ("2024-02-29", "2028-02-29"), ("2025-12-31", "2026-01-01"),
    ("2026-04-30", "2026-05-30"), ("2026-04-30", "2026-05-31"), ("2026-03-31", "2026-04-30"), ("2026-05-31", "2026-06-30"),
    ("2000-01-01", "2026-10-05"), ("2026-03-15", "2026-03-15"), ("2026-10-05", "2026-01-01"), ("2026-02-10", "2026-01-01"),
    ("0001-01-01", "9999-12-31"), ("1900-02-28", "1900-03-01"), ("2000-02-29", "2000-03-01"), ("2100-02-28", "2100-03-01"),
    ("2026-01-01", "2026-12-31"), ("2025-01-01", "2026-01-01"), ("2024-01-01", "2025-01-01"), ("2026-07-04", "2027-07-03"),
]


def properties():
    """exhaustive-ish: many starts (every month end, leap days, common days) against every offset 0..800 days and a few far ones"""
    starts = []
    for year in (1899, 1900, 2000, 2023, 2024, 2025, 2026, 2100):
        for month in range(1, 13):
            last = calendar.monthrange(year, month)[1]
            for day in sorted({1, 15, 28, 29, 30, 31, last}):
                if day <= last:
                    starts.append(date(year, month, day))
    checked = 0
    for a in starts:
        for offset in list(range(0, 801)) + [1000, 3650, 7305, 36525]:
            b = a + timedelta(days=offset)
            years, months, days, n = breakdown(a, b)
            stepped = add_months(a, n)
            assert stepped <= b
            assert b < add_months(a, n + 1)
            assert (stepped - a).days + days == (b - a).days
            assert 0 <= days <= 30
            assert years * 12 + months == n
            checked += 1
    return checked


def main():
    cases = {f"{s}|{e}": case(s, e) for s, e in PAIRS}
    # the page's own examples must agree with these figures
    assert cases["2026-01-01|2026-02-01"]["totalDays"] == 31 and cases["2026-01-01|2026-02-01"]["months"] == 1
    assert cases["2024-02-28|2024-03-01"]["totalDays"] == 2 and cases["2024-02-28|2024-03-01"]["months"] == 0
    assert cases["2023-02-28|2023-03-01"]["totalDays"] == 1
    out = {"cases": cases, "propertiesChecked": properties()}
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
