"""
Independent reference for the Shift Schedule Planner (Tool Pack 34).

It shares no code with assets/js/tools/shift-planner/shift-engine.js. For each case it writes a cycle as text in one of three styles, then
lists, date by date with datetime.date and a plain modulo, what each date is; shift lengths come from datetime.datetime subtraction (an end at
or before the start is the next day); runs are measured by itertools.groupby over the cycle repeated three times.

Run:  python tests/fixtures/shift-golden.py > tests/fixtures/shift-golden.json
"""
import json
import random
from datetime import date, datetime, timedelta
from fractions import Fraction
from itertools import groupby

TIMES = {"D": ("07:00", "15:00"), "E": ("15:00", "23:00"), "N": ("23:00", "07:00")}
ODD_TIMES = {"D": ("06:30", "18:45"), "E": ("14:15", "22:15"), "N": ("21:00", "05:30")}


def minutes_between(a, b):
    fa = datetime.strptime(a, "%H:%M")
    fb = datetime.strptime(b, "%H:%M")
    if fb <= fa:
        fb += timedelta(days=1)
    return int((fb - fa).total_seconds() // 60)


def as_text(cycle, style, rng):
    if style == "letters":
        return "".join(cycle)
    if style == "spaced":
        return " ".join(cycle)
    runs = [(k, len(list(g))) for k, g in groupby(cycle)]
    return " ".join(f"{n}{k}" for k, n in runs)


def longest(cycle, flag):
    tripled = cycle * 3
    best = 0
    for key, group in groupby(tripled, key=flag):
        if key:
            best = max(best, len(list(group)))
    return min(best, len(cycle))


def build():
    rng = random.Random(34)
    cases = []
    fixed = [
        ("DDDDOOOO", 1), ("DDOOOOO", 3), ("DDOODDDOODDOOO", 1), ("DDNNOOOO", 5), ("DDDDDOO", 1), ("DN", 2), ("ONO", 2), ("DDDDDDDDOOOOOOO", 9),
    ]
    spans = [(date(2026, 11, 2), 8), (date(2026, 12, 21), 4), (date(2024, 2, 19), 4), (date(2026, 3, 1), 52), (date(2026, 12, 28), 2)]
    for text, position in fixed:
        for start, weeks in spans:
            cases.append(make(list(text), position, start, weeks, TIMES, rng))
    for i in range(160):
        n = rng.randrange(2, 57)
        cycle = [rng.choice("DENOOO") for _ in range(n)]
        if all(c == "O" for c in cycle):
            cycle[0] = "D"
        start = date(2023, 1, 1) + timedelta(days=rng.randrange(0, 2800))
        cases.append(make(cycle, rng.randrange(1, n + 1), start, rng.randrange(1, 53), rng.choice([TIMES, ODD_TIMES]), rng))
    return cases


def make(cycle, position, start, weeks, times, rng):
    style = rng.choice(["letters", "spaced", "runs"])
    days = []
    n = len(cycle)
    for i in range(weeks * 7):
        d = start + timedelta(days=i)
        code = cycle[(position - 1 + i) % n]
        days.append(code)
    minutes = sum(minutes_between(*times[c]) for c in days if c != "O")
    avg = Fraction(minutes, weeks)
    avg_rounded = int((avg * 2 + 1) // 2)  # round half up on a non-negative value
    working = [c != "O" for c in days]
    return {
        "text": as_text(cycle, style, rng),
        "cycle": "".join(cycle),
        "position": position,
        "start": start.isoformat(),
        "weeks": weeks,
        "times": {k: {"start": v[0], "end": v[1]} for k, v in times.items()},
        "codes": "".join(days),
        "workingDays": sum(working),
        "offDays": len(days) - sum(working),
        "counts": {k: days.count(k) for k in "DENO"},
        "totalMinutes": minutes,
        "averageMinutesPerWeek": avg_rounded,
        "longestWorkRun": longest(cycle, lambda c: c != "O"),
        "longestOffRun": longest(cycle, lambda c: c == "O"),
        "longestWorkRunInWindow": max((len(list(g)) for k, g in groupby(working) if k), default=0),
        "weekdays": [(start + timedelta(days=i)).weekday() for i in range(0, min(14, weeks * 7))],
        "last": (start + timedelta(days=weeks * 7 - 1)).isoformat(),
    }


if __name__ == "__main__":
    print(json.dumps({"cases": build()}, separators=(",", ":")))
