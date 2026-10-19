"""
Independent reference for the World Clock (Tool Pack 28).

Everything here comes from Python's datetime and zoneinfo (the tzdata time-zone database) and plain integers. It shares nothing with the
JavaScript, which asks the browser's Intl for offsets and finds the next clock change by sampling every 72 hours and halving. This script is
deliberately slower and simpler: for the next change it asks zoneinfo for the offset at EVERY HOUR over the same 400-day window, and then
every minute inside the first hour that differs.

For a fixed list of zones and fixed reference instants it records, per zone and instant:
  - the zone's UTC offset in seconds, the local date, the local HH:MM and the weekday (0 = Sunday, as in JavaScript);
  - the next change of offset (the instant, to the minute, and the offsets either side), or null when there is none in the window.

Two sets are written:
  strict      zones for which the pinned tzdata release and the supported runtimes agree. The JavaScript must match every case.
  divergent   zones where a different tzdata RELEASE is known to give a different answer (America/Asuncion: Paraguay's move to permanent
              UTC-03:00 is in tzdata 2025a, not in 2024a). They are kept as an explicit version-divergence regression case and are NOT in
              the strict set. `knownDivergentZones` names them and says why.

Only FIXED instants are used (no "today"), so the output changes only when a time-zone rule does. The data is the Python tzdata package;
run it with a Python that can see it (not `python -I`, which hides user site-packages):

    python tests/fixtures/world-clock-golden.py > tests/fixtures/world-clock-golden.json

Regenerate only when the pinned release is changed on purpose, and review the diff. Python 3.9+.
"""
import json
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import tzdata

UTC = timezone.utc
EPOCH = datetime(1970, 1, 1, tzinfo=UTC)
HOUR = timedelta(hours=1)
HORIZON_HOURS = 400 * 24

STRICT_ZONES = [
    "UTC", "Asia/Kolkata", "Asia/Kathmandu", "Australia/Adelaide", "Australia/Darwin", "Australia/Lord_Howe",
    "Pacific/Chatham", "America/St_Johns", "Asia/Tehran", "Asia/Kabul", "Asia/Yangon", "Pacific/Kiritimati",
    "Pacific/Pago_Pago", "America/New_York", "America/Los_Angeles", "America/Chicago", "Europe/London",
    "Europe/Berlin", "Europe/Dublin", "Australia/Sydney", "Pacific/Auckland", "America/Sao_Paulo",
    "Africa/Casablanca", "Africa/Cairo", "Asia/Tokyo", "Asia/Dubai", "Asia/Singapore", "America/Havana",
    "America/Santiago", "Pacific/Honolulu", "Europe/Istanbul", "Asia/Jerusalem",
]

DIVERGENT_ZONES = ["America/Asuncion"]

# fixed instants (UTC): mid-winter, around the US and EU spring changes, a midsummer minute before midnight somewhere,
# a recent date, just before the US autumn change, a spring day in 2027, and a year-end rollover
REFS = [
    datetime(2026, 1, 15, 12, 0, tzinfo=UTC),
    datetime(2026, 3, 8, 6, 30, tzinfo=UTC),
    datetime(2026, 3, 29, 0, 30, tzinfo=UTC),
    datetime(2026, 6, 21, 23, 59, tzinfo=UTC),
    datetime(2026, 10, 19, 14, 20, tzinfo=UTC),
    datetime(2026, 11, 1, 5, 59, tzinfo=UTC),
    datetime(2027, 3, 14, 12, 0, tzinfo=UTC),
    datetime(2027, 12, 31, 23, 30, tzinfo=UTC),
]

# for the divergent zone a second instant sits inside the window where the two tzdata releases give different OFFSETS too
DIVERGENT_REFS = [
    datetime(2026, 10, 19, 14, 20, tzinfo=UTC),
    datetime(2027, 6, 15, 12, 0, tzinfo=UTC),
]


def ms_of(dt):
    return int((dt - EPOCH).total_seconds() * 1000)


def offset_seconds(zone, dt):
    return int(dt.astimezone(zone).utcoffset().total_seconds())


def fields(name, dt):
    zone = ZoneInfo(name)
    local = dt.astimezone(zone)
    return {
        "zone": name,
        "ms": ms_of(dt),
        "date": local.strftime("%Y-%m-%d"),
        "time": local.strftime("%H:%M"),
        "weekday": (local.weekday() + 1) % 7,
        "offsetSeconds": int(local.utcoffset().total_seconds()),
    }


def next_change(name, dt):
    """The first instant (to the minute) after dt at which the offset differs from the offset at dt, or None."""
    zone = ZoneInfo(name)
    before = offset_seconds(zone, dt)
    t = dt
    for _ in range(HORIZON_HOURS):
        t = t + HOUR
        if offset_seconds(zone, t) != before:
            start = t - HOUR
            for minute in range(1, 61):
                c = start + timedelta(minutes=minute)
                after = offset_seconds(zone, c)
                if after != before:
                    return {"atMs": ms_of(c), "fromOffset": before, "toOffset": after}
    return None


def case(name, dt):
    row = fields(name, dt)
    row["next"] = next_change(name, dt)
    return row


out = {
    "tzdata": tzdata.IANA_VERSION,
    "horizonDays": 400,
    "note": "Independent reference for the World Clock: Python datetime and zoneinfo. See the header of tests/fixtures/world-clock-golden.py.",
    "knownDivergentZones": {
        "America/Asuncion": {
            "reason": "Paraguay moved to permanent UTC-03:00 (tzdata 2025a). Runtimes with tz data 2024a still show the 2027-03-28 change and UTC-04:00 in winter.",
            "pinnedAnswer": "no change in the window from 2026-10-19; UTC-03:00 all year",
            "olderRuntimeSeen": "Node 20.17 (ICU 75.1, tz 2024a): change on 2027-03-28T03:00Z, UTC-03:00 to UTC-04:00",
        }
    },
    "strict": [case(z, r) for z in STRICT_ZONES for r in REFS],
    "divergent": [case(z, r) for z in DIVERGENT_ZONES for r in DIVERGENT_REFS],
}

print(json.dumps(out, indent=1, ensure_ascii=False))
