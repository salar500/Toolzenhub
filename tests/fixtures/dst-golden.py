"""
Independent reference for the converter's daylight-saving information (Tool Pack 34).

It shares no code with assets/js/tools/time-zone-converter/dst-info.js. Every clock change is found by walking 15-minute steps with zoneinfo
and comparing utcoffset() at consecutive steps; the engine instead samples every three days and bisects to the minute.

Run:  python tests/fixtures/dst-golden.py > tests/fixtures/dst-golden.json
"""
import json
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

UTC = timezone.utc
STEP = timedelta(minutes=15)
WINDOW_DAYS = 195

ZONES = [
    "America/New_York", "Europe/London", "Europe/Berlin", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney", "Australia/Lord_Howe",
    "Pacific/Auckland", "America/Sao_Paulo", "Africa/Cairo", "Asia/Tehran", "America/St_Johns", "Pacific/Apia", "UTC", "Africa/Casablanca",
]

# moments: chosen around real changes and well away from them
MOMENTS = [
    datetime(2026, 3, 1, 12, 0, tzinfo=UTC),
    datetime(2026, 3, 8, 7, 0, tzinfo=UTC),
    datetime(2026, 7, 1, 0, 0, tzinfo=UTC),
    datetime(2026, 10, 25, 1, 0, tzinfo=UTC),
    datetime(2027, 1, 15, 18, 30, tzinfo=UTC),
]


def ms(t):
    return int(t.timestamp() * 1000)


def offset_seconds(tz, t):
    return int(t.astimezone(tz).utcoffset().total_seconds())


def changes_around(zone, moment):
    tz = ZoneInfo(zone)
    start = moment - timedelta(days=WINDOW_DAYS)
    end = moment + timedelta(days=WINDOW_DAYS)
    t = start
    prev = offset_seconds(tz, t)
    found = []
    while t < end:
        n = t + STEP
        off = offset_seconds(tz, n)
        if off != prev:
            found.append({"ms": ms(n), "from": prev, "to": off})
        prev = off
        t = n
    previous = None
    nxt = None
    for c in found:
        if c["ms"] <= ms(moment):
            previous = c
        elif nxt is None:
            nxt = c
    return previous, nxt


def reading(change, offset):
    t = datetime.fromtimestamp(change["ms"] / 1000, tz=UTC) + timedelta(seconds=offset)
    return t.strftime("%Y-%m-%d"), t.strftime("%H:%M")


def describe(change):
    if change is None:
        return None
    d, before = reading(change, change["from"])
    _, after = reading(change, change["to"])
    return {"ms": change["ms"], "from": change["from"], "to": change["to"], "date": d, "time": before, "newTime": after,
            "forward": change["to"] > change["from"], "deltaMinutes": (change["to"] - change["from"]) // 60}


def difference_change(source, target, moment):
    s, t = ZoneInfo(source), ZoneInfo(target)

    def diff(x):
        return (offset_seconds(t, x) - offset_seconds(s, x)) // 60

    cur = moment
    prev = diff(cur)
    end = moment + timedelta(days=118)
    while cur < end:
        n = cur + STEP
        d = diff(n)
        if d != prev:
            return {"target": target, "ms": ms(n), "before": prev, "after": d}
        prev = d
        cur = n
    return None


def build():
    cases = []
    for zone in ZONES:
        for moment in MOMENTS:
            previous, nxt = changes_around(zone, moment)
            cases.append({"zone": zone, "ms": ms(moment), "previous": describe(previous), "next": describe(nxt)})
    pairs = [("Europe/London", "America/New_York"), ("America/New_York", "Asia/Kolkata"), ("Europe/Berlin", "Australia/Sydney"),
             ("Asia/Tokyo", "Pacific/Auckland"), ("Europe/London", "Europe/Berlin"), ("America/New_York", "Asia/Tokyo")]
    diffs = []
    for source, target in pairs:
        for moment in MOMENTS:
            diffs.append({"source": source, "target": target, "ms": ms(moment), "change": difference_change(source, target, moment)})
    return {"zones": cases, "differences": diffs}


if __name__ == "__main__":
    print(json.dumps(build(), separators=(",", ":")))
