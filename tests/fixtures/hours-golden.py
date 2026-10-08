"""
Independent reference for the Hours & Timesheet Calculator (Tool Pack 23).

Written from the specification (docs/tool-packs/23-hours-calculator.md), NOT from the JavaScript, with the Python
standard library only. The JavaScript engine uses integer minutes and a modulo; this reference uses a different
method on purpose:

  - the length of a shift comes from datetime arithmetic with an explicit "ends the next day" step,
  - decimal hours come from decimal.Decimal with ROUND_HALF_UP,
  - row states are decided by a plain if/else chain over the same rules.

It writes tests/fixtures/hours-golden.json: named vectors, and SHA-256 digests of exhaustive sweeps (every start and
end pair, every total from 0 to the maximum, and a sampled grid of breaks) that the unit test recomputes with the
engine and compares.

Run:  python tests/fixtures/hours-golden.py
"""
import hashlib
import json
import os
import sys
from datetime import datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

sys.dont_write_bytecode = True

HERE = os.path.dirname(os.path.abspath(__file__))

MAX_ROWS = 31
MAX_TOTAL = MAX_ROWS * 1439  # 44609 minutes, 743:29


def gross_by_datetime(start, end):
    """minutes from start to end, the end being the next day when it is not later; None when equal"""
    if start == end:
        return None
    a = datetime(2000, 1, 1, start // 60, start % 60)
    b = datetime(2000, 1, 1, end // 60, end % 60)
    if b < a:
        b += timedelta(days=1)
    return int((b - a).total_seconds() // 60)


def decimal_text(minutes):
    return str((Decimal(minutes) / Decimal(60)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def hm_text(minutes):
    return "%d:%02d" % (minutes // 60, minutes % 60)


def hhmm(minutes):
    return "%02d:%02d" % (minutes // 60, minutes % 60)


def classify(start, end, brk):
    """start and end are minutes after midnight or None (empty); brk is minutes (blank is 0)"""
    if start is None and end is None and brk is None:
        return {"state": "empty"}
    if start is None or end is None:
        return {"state": "incomplete"}
    gross = gross_by_datetime(start, end)
    if gross is None:
        return {"state": "invalid", "why": "equal"}
    b = 0 if brk is None else brk
    if b > gross:
        return {"state": "invalid", "why": "break"}
    return {"state": "valid", "gross": gross, "net": gross - b, "overnight": end < start}


def digest(lines):
    h = hashlib.sha256()
    for line in lines:
        h.update(line.encode("ascii"))
    return h.hexdigest()


# --- sweep 1: every start and end pair --------------------------------------------------------------------
def pair_lines():
    for s in range(1440):
        for e in range(1440):
            g = gross_by_datetime(s, e)
            yield "%d,%d,%d,%d\n" % (s, e, -1 if g is None else g, 1 if e < s else 0)


# --- sweep 2: every total from 0 to the maximum, as the page would show it --------------------------------
def total_lines():
    for m in range(MAX_TOTAL + 1):
        yield "%d:%s:%s\n" % (m, hm_text(m), decimal_text(m))


# --- sweep 3: a grid of starts, ends and breaks around the break rule --------------------------------------
def grid_lines():
    for s in range(0, 1440, 13):
        for e in range(0, 1440, 17):
            g = gross_by_datetime(s, e)
            breaks = {0, 1, 1439}
            if g is not None:
                breaks |= {g - 1, g, g + 1}
            for b in sorted(x for x in breaks if 0 <= x <= 1439):
                c = classify(s, e, b)
                yield "%d,%d,%d,%s,%s\n" % (s, e, b, c["state"], c.get("net", -1))


def vector(name, rows):
    """rows: list of (start, end, break) with minutes after midnight or None"""
    out = []
    g = b = n = 0
    counts = {"empty": 0, "incomplete": 0, "invalid": 0, "valid": 0}
    for s, e, brk in rows:
        c = classify(s, e, brk)
        counts[c["state"]] += 1
        if c["state"] == "valid":
            g += c["gross"]
            b += 0 if brk is None else brk
            n += c["net"]
        out.append(c)
    return {
        "name": name,
        "rows": [[None if s is None else hhmm(s), None if e is None else hhmm(e), brk] for s, e, brk in rows],
        "states": [c["state"] for c in out],
        "nets": [c.get("net") for c in out],
        "counts": counts,
        "totals": None if counts["valid"] == 0 else {
            "gross": g, "break": b, "net": n, "hm": hm_text(n), "decimal": decimal_text(n),
            "grossHm": hm_text(g), "breakHm": hm_text(b),
        },
    }


T = lambda h, m: h * 60 + m

VECTORS = [
    vector("standard day", [(T(9, 0), T(17, 0), 30)]),
    vector("overnight", [(T(22, 0), T(6, 0), 0)]),
    vector("zero break explicit and blank", [(T(8, 15), T(12, 45), 0), (T(8, 15), T(12, 45), None)]),
    vector("break equal to the shift", [(T(9, 0), T(10, 0), 60)]),
    vector("break longer than the shift", [(T(9, 0), T(10, 0), 61)]),
    vector("equal times", [(T(9, 0), T(9, 0), 0)]),
    vector("midnight boundaries", [(T(23, 0), T(0, 0), 0), (T(23, 59), T(0, 0), 0), (T(0, 0), T(0, 1), 0), (T(12, 0), T(11, 59), 0)]),
    vector("longest shift", [(T(0, 0), T(23, 59), 0)]),
    vector("worked example", [(T(9, 0), T(17, 30), 30), (T(22, 0), T(6, 0), 45), (T(13, 0), T(17, 0), 0)]),
    vector("three twenty-minute shifts", [(T(9, 0), T(9, 20), 0), (T(10, 0), T(10, 20), 0), (T(11, 0), T(11, 20), 0)]),
    vector("excluded rows", [(T(9, 0), T(17, 0), 30), (T(9, 0), None, None), (T(9, 0), T(9, 0), 0), (None, None, None), (None, T(17, 0), 15)]),
    vector("maximum rows", [(T(0, 0), T(23, 59), 0)] * MAX_ROWS),
]

DECIMALS = {str(m): decimal_text(m) for m in (0, 1, 5, 10, 20, 30, 40, 59, 60, 61, 440, 470, 525, 1439, 1155, MAX_TOTAL)}

out = {
    "vectors": VECTORS,
    "decimals": DECIMALS,
    "maxTotal": MAX_TOTAL,
    "digests": {
        "pairs": digest(pair_lines()),
        "totals": digest(total_lines()),
        "grid": digest(grid_lines()),
    },
}

with open(os.path.join(HERE, "hours-golden.json"), "w", encoding="ascii", newline="\n") as f:
    json.dump(out, f, indent=1, ensure_ascii=True)
    f.write("\n")

print("wrote tests/fixtures/hours-golden.json")
