"""
Independent reference for the Unix Timestamp Converter (Tool Pack 16).

Everything here comes from Python's datetime and zoneinfo (the system or tzdata time-zone database), integer arithmetic for the
nanoseconds, and email.utils for RFC 2822. It shares nothing with the JavaScript, which uses BigInt nanoseconds, Intl.DateTimeFormat and
its own strict parsers. Only FIXED dates are used (no "today"), so the output never changes except when a time-zone rule does.

It prints a JSON document that tests/unit/unix-timestamp.test.mjs pins as a literal. It also asserts, over a grid, the properties the
page relies on: a local time round-trips through UTC exactly when it exists, and a local time that is skipped never round-trips.

Run:  python tests/fixtures/unix-timestamp-golden.py     (prints JSON)
"""
import json
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from zoneinfo import ZoneInfo

UTC = timezone.utc
EPOCH = datetime(1970, 1, 1, tzinfo=UTC)


def offset_text(seconds):
    sign = "-" if seconds < 0 else "+"
    seconds = abs(seconds)
    h, rest = divmod(seconds, 3600)
    m, s = divmod(rest, 60)
    return f"{sign}{h:02d}:{m:02d}" + (f":{s:02d}" if s else "")


def fraction(nanos):
    return "" if nanos == 0 else "." + f"{nanos:09d}".rstrip("0")


def utc_iso(ns):
    seconds, nanos = divmod(ns, 1_000_000_000)          # floor division: nanos is 0..999999999 for negatives too
    d = EPOCH + timedelta(seconds=seconds)
    return d.strftime("%Y-%m-%dT%H:%M:%S") + fraction(nanos) + "Z"


def zone_iso(ns, zone):
    seconds, nanos = divmod(ns, 1_000_000_000)
    d = (EPOCH + timedelta(seconds=seconds)).astimezone(ZoneInfo(zone))
    off = int(d.utcoffset().total_seconds())
    return d.strftime("%Y-%m-%dT%H:%M:%S") + fraction(nanos) + offset_text(off), off


def instant_case(seconds, zone, nanos=0):
    ns = seconds * 1_000_000_000 + nanos
    iso, off = zone_iso(ns, zone)
    return {"ns": str(ns), "utc": utc_iso(ns), "zone": zone, "iso": iso, "offset": off}


def local_case(wall, zone):
    """the instants a wall-clock time can be: [] (a gap), one, or two (an overlap), earlier first"""
    z = ZoneInfo(zone)
    naive = datetime.strptime(wall, "%Y-%m-%dT%H:%M:%S")
    found = {}
    for fold in (0, 1):
        d = naive.replace(tzinfo=z, fold=fold)
        utc = d.astimezone(UTC)
        back = utc.astimezone(z).replace(tzinfo=None)
        if back == naive:                                   # the wall time really exists at this instant
            found[int((utc - EPOCH).total_seconds())] = int(d.utcoffset().total_seconds())
    instants = sorted(found.items())
    return {
        "wall": wall,
        "zone": zone,
        "kind": "gap" if not instants else ("overlap" if len(instants) == 2 else "unique"),
        "instants": [{"seconds": s, "offset": o} for s, o in instants],
    }


def parse_case(text):
    """a strict ISO 8601 or RFC 2822 date with an explicit offset, to epoch nanoseconds"""
    if "," in text and text[:3].isalpha():
        d = parsedate_to_datetime(text)
        return {"text": text, "ns": str(int(d.timestamp()) * 1_000_000_000)}
    d = datetime.fromisoformat(text.replace("Z", "+00:00"))
    ns = int((d - EPOCH).total_seconds()) * 1_000_000_000 + d.microsecond * 1000
    return {"text": text, "ns": str(ns)}


INSTANTS = [
    (0, "UTC", 0),
    (1700000000, "UTC", 0),
    (1700000000, "Asia/Kolkata", 0),
    (1700000000, "America/New_York", 0),
    (1700000000, "Europe/London", 0),
    (1700000000, "Australia/Lord_Howe", 0),
    (1700000000, "Asia/Kathmandu", 0),
    (1700000000, "Asia/Tokyo", 123456789),
    (-1, "UTC", 0),
    (-1, "Asia/Kolkata", 0),
    (-1000000000, "UTC", 0),
    (-1000000000, "America/New_York", 0),
    (-1000000000, "Europe/London", 0),
    (-2, "UTC", 500000000),                                  # -1.5 s
    (-62135596800, "UTC", 0),                                # 0001-01-01T00:00:00Z
    (-62135596800, "Asia/Kolkata", 0),                       # local mean time before standard time
    (253402300799, "UTC", 999999999),                        # 9999-12-31T23:59:59.999999999Z
    (253402300799, "America/New_York", 0),
    (2147483647, "UTC", 0),                                  # the last second of 32-bit signed Unix time
    (2147483648, "UTC", 0),
    (4102444800, "UTC", 0),                                  # 2100-01-01
    (32503680000, "Europe/London", 0),                       # 3000-01-01
    (1678604399, "America/New_York", 0),                     # one second before the US spring-forward of 2023
    (1678604400, "America/New_York", 0),                     # the instant of it
    (1699163999, "America/New_York", 0),                     # the last second of the fall-back hour (EDT)
    (1699164000, "America/New_York", 0),                     # the fall-back instant (EST begins)
    (1679792400, "Europe/London", 0),                        # 2023-03-26T01:00:00Z, BST begins
    (1698544800, "Europe/Paris", 0),                         # 2023-10-29T02:00:00Z, CET begins
]

LOCAL = [
    ("2023-11-14T22:13:20", "UTC"),
    ("2023-11-14T22:13:20", "Asia/Kolkata"),
    ("2023-03-12T02:30:00", "Asia/Kolkata"),                 # India has no daylight saving
    ("2023-03-12T02:30:00", "America/New_York"),             # US spring-forward gap
    ("2023-03-12T01:59:59", "America/New_York"),             # the last second before the gap
    ("2023-03-12T03:00:00", "America/New_York"),             # the first second after the gap
    ("2023-11-05T01:30:00", "America/New_York"),             # US fall-back overlap
    ("2023-11-05T00:59:59", "America/New_York"),             # just before the overlap: unique
    ("2023-11-05T02:00:00", "America/New_York"),             # just after the overlap: unique
    ("2023-03-26T01:30:00", "Europe/London"),                # UK gap
    ("2023-10-29T01:30:00", "Europe/London"),                # UK overlap
    ("2023-03-26T02:30:00", "Europe/Paris"),                 # EU gap
    ("2023-10-29T02:30:00", "Europe/Paris"),                 # EU overlap
    ("2023-10-01T02:30:00", "Australia/Sydney"),             # southern hemisphere gap
    ("2024-04-07T02:30:00", "Australia/Sydney"),             # southern hemisphere overlap
    ("2023-10-01T02:15:00", "Australia/Lord_Howe"),          # a 30 minute gap
    ("2023-04-02T01:45:00", "Australia/Lord_Howe"),          # a 30 minute overlap
    ("1969-12-31T23:59:59", "UTC"),
    ("1938-04-24T17:13:20", "America/New_York"),
]

PARSE = [
    "2023-11-14T22:13:20Z",
    "2023-11-14T22:13:20+05:30",
    "2023-11-14T22:13:20-08:00",
    "2023-11-14T22:13:20.123456+00:00",
    "2023-11-14T00:00:00+00:00",
    "Tue, 14 Nov 2023 22:13:20 +0000",
    "Wed, 15 Nov 2023 03:43:20 +0530",
    "Sun, 31 Dec 2000 23:59:59 -0800",
]


def check_properties():
    """local -> UTC -> local round trips exactly when the local time exists; a skipped time never does"""
    for zone in ("America/New_York", "Europe/London", "Australia/Sydney", "Asia/Kolkata", "Australia/Lord_Howe"):
        z = ZoneInfo(zone)
        t = datetime(2023, 1, 1, tzinfo=UTC)
        for _ in range(0, 24 * 366, 1):
            local = t.astimezone(z).replace(tzinfo=None)
            case = local_case(local.strftime("%Y-%m-%dT%H:%M:%S"), zone)
            assert case["kind"] in ("unique", "overlap"), (zone, local)      # a real wall time is never a gap
            assert int((t - EPOCH).total_seconds()) in [i["seconds"] for i in case["instants"]], (zone, local)
            t += timedelta(hours=1)


def main():
    check_properties()
    print(json.dumps({
        "instants": [instant_case(s, z, n) for s, z, n in INSTANTS],
        "local": [local_case(w, z) for w, z in LOCAL],
        "parse": [parse_case(t) for t in PARSE],
    }, indent=1))


if __name__ == "__main__":
    main()
