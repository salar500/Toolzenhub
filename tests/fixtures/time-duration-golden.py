"""
Independent reference for the Time Duration Calculator (Tool Pack 34).

It shares no code with assets/js/tools/time-duration/duration-engine.js. Sums are made with datetime.timedelta; the decimal-hour and
total-minute text is made with fractions.Fraction (exact rational arithmetic) and rounded half up, so the engine's integer rounding is
checked against exact arithmetic rather than against itself.

Run:  python tests/fixtures/time-duration-golden.py > tests/fixtures/time-duration-golden.json
"""
import json
import random
from datetime import timedelta
from fractions import Fraction


def round_half_up(value, places):
    scale = 10 ** places
    scaled = Fraction(value) * scale
    floor = scaled.numerator // scaled.denominator
    rem = scaled - floor
    if rem >= Fraction(1, 2):
        floor += 1
    return floor, scale


def decimal_text(value, places):
    n, scale = round_half_up(value, places)
    whole, frac = divmod(n, scale)
    return f"{whole}.{str(frac).zfill(places)}"


def describe(total_seconds):
    td = timedelta(seconds=abs(total_seconds))
    secs = abs(total_seconds)
    hours = Fraction(secs, 3600)
    minutes = Fraction(secs, 60)
    return {
        "days": td.days,
        "hours": (td.seconds // 3600),
        "minutes": (td.seconds % 3600) // 60,
        "seconds": td.seconds % 60,
        "clock": f"{secs // 3600}:{(secs % 3600) // 60:02d}:{secs % 60:02d}",
        "decimalHours": decimal_text(hours, 2),
        "decimalHoursLong": decimal_text(hours, 4),
        "decimalHoursExact": (hours * 10000).denominator == 1,
        "totalMinutes": decimal_text(minutes, 2),
        "totalMinutesExact": (minutes * 100).denominator == 1,
        "totalSeconds": str(secs),
        "negative": total_seconds < 0,
    }


def text_for(seconds, rng):
    h, rem = divmod(seconds, 3600)
    m, s = divmod(rem, 60)
    style = rng.choice(["clock", "units", "single", "clock3"])
    if style == "clock":
        return f"{h}:{m:02d}" if s == 0 else f"{h}:{m:02d}:{s:02d}"
    if style == "clock3":
        return f"{h}:{m:02d}:{s:02d}"
    if style == "single":
        if s == 0 and m == 0:
            return f"{h}h"
        if s == 0:
            return f"{h * 60 + m}m"
        return f"{seconds}s"
    parts = []
    if h:
        parts.append(f"{h}h")
    if m:
        parts.append(f"{m}m")
    if s or not parts:
        parts.append(f"{s}s")
    return " ".join(parts)


def build():
    rng = random.Random(34)
    cases = []
    fixed = [
        [("+", 5400)], [("+", 6300), ("+", 4500)], [("+", 3600), ("-", 5400)], [("-", 60)], [("+", 0)],
        [("+", 359996399)], [("+", 359996399), ("+", 359996399)], [("+", 59), ("+", 1)], [("+", 3599), ("+", 1)],
        [("+", 86399), ("+", 1)], [("+", 20), ("+", 20), ("+", 20)], [("+", 1200)], [("+", 2640)],
    ]
    for rows in fixed:
        cases.append(make(rows, rng))
    for _ in range(300):
        n = rng.randrange(1, 7)
        rows = [(rng.choice("+-"), rng.randrange(0, 200000)) for _ in range(n)]
        cases.append(make(rows, rng))
    return cases


def make(rows, rng):
    total = sum(s if sign == "+" else -s for sign, s in rows)
    return {
        "rows": [{"sign": sign, "text": text_for(s, rng), "seconds": s} for sign, s in rows],
        "total": total,
        "expect": describe(total),
    }


if __name__ == "__main__":
    print(json.dumps({"cases": build()}, separators=(",", ":")))
