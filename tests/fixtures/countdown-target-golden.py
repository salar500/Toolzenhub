"""
Independent reference for the Countdown Timer's "to a date" mode (Tool Pack 34).

It shares no code with assets/js/tools/countdown-timer/target-engine.js. The instant of a wall time comes from zoneinfo (fold=0 is the earlier
of a repeated time, fold=1 the later; a time that does not survive a round trip through UTC is a skipped one); the time left comes from
integer arithmetic on seconds.

Run:  python tests/fixtures/countdown-target-golden.py > tests/fixtures/countdown-target-golden.json
"""
import json
import math
import random
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

UTC = timezone.utc
ZONES = ["America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney", "Australia/Lord_Howe", "Pacific/Auckland", "UTC", "Asia/Kathmandu"]


def classify(date_text, time_text, zone):
    tz = ZoneInfo(zone)
    y, mo, d = (int(x) for x in date_text.split("-"))
    h, mi = (int(x) for x in time_text.split(":"))
    dt = datetime(y, mo, d, h, mi, tzinfo=tz)
    back = dt.astimezone(UTC).astimezone(tz)
    if (back.year, back.month, back.day, back.hour, back.minute) != (y, mo, d, h, mi):
        return {"kind": "gap"}
    ambiguous = dt.replace(fold=0).utcoffset() != dt.replace(fold=1).utcoffset()
    first = dt.replace(fold=0).astimezone(UTC)
    second = dt.replace(fold=1).astimezone(UTC)
    ms = lambda t: int(t.timestamp() * 1000)
    if ambiguous:
        return {"kind": "overlap", "earlier": ms(first), "later": ms(second)}
    return {"kind": "unique", "ms": ms(first)}


def remaining(target_ms, now_ms):
    diff = target_ms - now_ms
    absolute = abs(diff)
    seconds = math.ceil(absolute / 1000) if diff > 0 else absolute // 1000
    return {"reached": diff <= 0, "days": seconds // 86400, "hours": (seconds % 86400) // 3600, "minutes": (seconds % 3600) // 60,
            "seconds": seconds % 60, "totalSeconds": seconds}


def build():
    rng = random.Random(34)
    cases = []
    specials = [
        ("2026-03-08", "02:30", "America/New_York"), ("2026-03-08", "03:00", "America/New_York"), ("2026-11-01", "01:30", "America/New_York"),
        ("2026-03-29", "01:30", "Europe/London"), ("2026-10-25", "01:30", "Europe/London"), ("2026-10-04", "02:15", "Australia/Sydney"),
        ("2026-04-05", "02:15", "Australia/Sydney"), ("2026-04-05", "01:45", "Australia/Lord_Howe"), ("2026-10-04", "02:15", "Australia/Lord_Howe"),
        ("2026-12-25", "09:30", "Asia/Kolkata"), ("2100-12-31", "23:59", "UTC"), ("1970-01-01", "00:00", "UTC"), ("2026-02-28", "23:59", "Pacific/Auckland"),
    ]
    for date_text, time_text, zone in specials:
        cases.append({"date": date_text, "time": time_text, "zone": zone, "expect": classify(date_text, time_text, zone)})
    for _ in range(120):
        t = datetime(2024, 1, 1, tzinfo=UTC) + timedelta(days=rng.randrange(0, 1500), minutes=15 * rng.randrange(0, 96))
        zone = rng.choice(ZONES)
        local = t.astimezone(ZoneInfo(zone))
        date_text, time_text = local.strftime("%Y-%m-%d"), local.strftime("%H:%M")
        cases.append({"date": date_text, "time": time_text, "zone": zone, "expect": classify(date_text, time_text, zone)})
    spans = []
    base = int(datetime(2026, 6, 1, tzinfo=UTC).timestamp() * 1000)
    for delta in [1, 999, 1000, 1001, 59_999, 60_000, 3_599_999, 86_400_000, 86_400_001, 90_061_001, 400 * 86_400_000 + 123, -1, -999, -1000, -86_400_001, 0]:
        spans.append({"target": base + delta, "now": base, "expect": remaining(base + delta, base)})
    return {"cases": cases, "spans": spans}


if __name__ == "__main__":
    print(json.dumps(build(), separators=(",", ":")))
