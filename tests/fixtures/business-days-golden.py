"""
Independent reference for the Business Days Calculator (Tool Pack 34).

It shares no algorithm with the JavaScript engine (assets/js/tools/business-days/business-days-engine.js): the engine steps integer day
numbers; this script steps datetime.date objects one day at a time and asks date.weekday() (Monday = 0) whether a day is a weekend day.

The convention (docs/tool-packs/34-time-tools-ecosystem.md):
  ADD / SUBTRACT n: the nth business day after / before the start date; the start date is never counted; n = 0 is the start date.
  COUNT: the earlier date is not counted and the later one is; "include" also counts the earlier date when it is a business day.
  A business day is neither a weekend day nor a listed holiday.

Run:  python tests/fixtures/business-days-golden.py > tests/fixtures/business-days-golden.json
"""
import json
import random
from datetime import date, timedelta

DEFAULT = [5, 6]  # Saturday, Sunday


def is_business(d, weekend, holidays):
    return d.weekday() not in weekend and d not in holidays


def add(start, n, direction, weekend, holidays):
    d = start
    counted = 0
    while counted < n:
        try:
            d = d + timedelta(days=direction)
        except OverflowError:
            return {"status": "out-of-range"}
        if is_business(d, weekend, holidays):
            counted += 1
    wk = sum(1 for k in range(1, abs((d - start).days) + 1)
             if (start + timedelta(days=direction * k)).weekday() in weekend)
    hol = sum(1 for k in range(1, abs((d - start).days) + 1)
              if (start + timedelta(days=direction * k)).weekday() not in weekend
              and (start + timedelta(days=direction * k)) in holidays)
    return {"status": "ok", "result": d.isoformat(), "calendarDays": abs((d - start).days), "weekendDays": wk, "holidayDays": hol}


def count(a, b, include, weekend, holidays):
    first, last = (a, b) if a <= b else (b, a)
    d = first if include else first + timedelta(days=1)
    business = weekends = hols = 0
    total = 0
    while d <= last:
        total += 1
        if d.weekday() in weekend:
            weekends += 1
        elif d in holidays:
            hols += 1
        else:
            business += 1
        d += timedelta(days=1)
    return {"businessDays": business, "calendarDays": total, "weekendDays": weekends, "holidayDays": hols, "reversed": b < a}


def iso(d):
    return d.isoformat()


def build():
    rng = random.Random(34)
    cases = []
    holiday_pool = [date(2026, 1, 1), date(2026, 1, 26), date(2026, 12, 25), date(2027, 1, 1), date(2024, 2, 29), date(2026, 4, 3), date(2026, 4, 6)]
    weekends = [DEFAULT, [4, 5], [6], [], [5, 6, 0], [2]]
    fixed = [
        ("2026-11-13", 1), ("2026-11-14", 1), ("2026-11-15", 1), ("2026-11-16", 1),
        ("2026-11-13", 0), ("2026-11-14", 0), ("2024-02-28", 2), ("2024-02-29", 1),
        ("2026-12-31", 1), ("2026-12-24", 3), ("0001-01-02", 1), ("9999-12-30", 1), ("9999-12-31", 1),
    ]
    for start, n in fixed:
        s = date.fromisoformat(start)
        for direction in (1, -1):
            for wi, w in enumerate(weekends[:2]):
                for hol in ([], holiday_pool):
                    h = set(hol)
                    cases.append({"kind": "add", "start": start, "n": n, "dir": direction, "weekend": w,
                                  "holidays": sorted(iso(x) for x in h), "expect": add(s, n, direction, set(w), h)})
    for _ in range(300):
        s = date(2020, 1, 1) + timedelta(days=rng.randrange(0, 3000))
        n = rng.randrange(0, 400)
        direction = rng.choice([1, -1])
        w = rng.choice(weekends)
        h = set(rng.sample(holiday_pool + [s + timedelta(days=k) for k in range(-5, 40, 3)], rng.randrange(0, 7)))
        cases.append({"kind": "add", "start": iso(s), "n": n, "dir": direction, "weekend": w,
                      "holidays": sorted(iso(x) for x in h), "expect": add(s, n, direction, set(w), h)})
    pairs = [("2026-11-13", "2026-11-13"), ("2026-11-13", "2026-11-14"), ("2026-11-14", "2026-11-15"), ("2026-11-16", "2026-11-17"),
             ("2026-11-17", "2026-11-16"), ("2024-02-28", "2024-03-01"), ("2026-12-31", "2027-01-01"), ("2026-01-01", "2026-12-31")]
    for a, b in pairs:
        for include in (False, True):
            for w in weekends[:3]:
                for hol in ([], holiday_pool):
                    h = set(hol)
                    cases.append({"kind": "count", "start": a, "end": b, "include": include, "weekend": w,
                                  "holidays": sorted(iso(x) for x in h), "expect": count(date.fromisoformat(a), date.fromisoformat(b), include, set(w), h)})
    for _ in range(300):
        a = date(2020, 1, 1) + timedelta(days=rng.randrange(0, 3000))
        b = date(2020, 1, 1) + timedelta(days=rng.randrange(0, 3000))
        include = rng.choice([False, True])
        w = rng.choice(weekends)
        h = set(rng.sample(holiday_pool + [a + timedelta(days=k) for k in range(0, 60, 4)], rng.randrange(0, 8)))
        cases.append({"kind": "count", "start": iso(a), "end": iso(b), "include": include, "weekend": w,
                      "holidays": sorted(iso(x) for x in h), "expect": count(a, b, include, set(w), h)})
    return cases


if __name__ == "__main__":
    print(json.dumps({"cases": build()}, separators=(",", ":")))
