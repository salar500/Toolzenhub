"""
Independent reference for the ISO week panel of the Date Calculator (Tool Pack 34).

It shares no code with assets/js/tools/date-calculator/date-arithmetic.js: every value comes from Python's datetime.date.isocalendar()
and date.timetuple().tm_yday. The dates are the year boundaries of 1900 to 2100 (24 December to 8 January, where weeks 52, 53 and 1
meet) and a seeded random sample across years 1 to 9999.

Run:  python tests/fixtures/iso-week-golden.py > tests/fixtures/iso-week-golden.json
Each row: [date, isoYear, isoWeek, isoWeekday, dayOfYear, weeksInIsoYear]
"""
import json
import random
from datetime import date, timedelta


def weeks_in_year(iso_year):
    return date(iso_year, 12, 28).isocalendar()[1]


def row(d):
    iso_year, week, weekday = d.isocalendar()
    return [d.isoformat(), iso_year, week, weekday, d.timetuple().tm_yday, weeks_in_year(iso_year)]


def build():
    rng = random.Random(34)
    rows = []
    for year in range(1900, 2101):
        d = date(year, 12, 24)
        for _ in range(16):
            rows.append(row(d))
            d += timedelta(days=1)
    for _ in range(500):
        rows.append(row(date.fromordinal(rng.randrange(1, date(9999, 12, 31).toordinal() + 1))))
    for d in (date(1, 1, 1), date(1, 1, 7), date(9999, 12, 31), date(9999, 12, 27), date(2024, 2, 29), date(2020, 12, 31), date(2021, 1, 3)):
        rows.append(row(d))
    return rows


if __name__ == "__main__":
    print(json.dumps({"rows": build()}, separators=(",", ":")))
