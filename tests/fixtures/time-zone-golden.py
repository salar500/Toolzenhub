"""
Independent reference for the Time Zone Converter (Tool Pack 19).

Everything here comes from Python's datetime and zoneinfo (the tzdata time-zone database) and plain integer minutes. It shares nothing with
the JavaScript, which resolves wall times by sampling Intl offsets and finds meeting windows from offsets at the start and the end of each
slot. This script is deliberately slower and simpler:

  resolve   a wall time (date, time, zone) -> every UTC instant that reads that way, found by trying both folds and keeping those that
            round-trip. One result is a normal time, two is a repeated hour, none is a skipped one.
  describe  an instant -> the local date, time, weekday, UTC offset and day difference in a zone (day difference against a source zone).
  overlap   the meeting windows, found MINUTE BY MINUTE: for every minute of the source zone's calendar day, is each participant inside their
            preferred hours; a start time (every 15 minutes from the start of the day) works when every minute of the meeting is available to
            everyone; consecutive working start times are merged into windows.

Only FIXED dates are used (no "today"), so the output changes only when a time-zone rule does. The data is the Python tzdata package;
run it with a Python that can see it (not `python -I`, which hides user site-packages):

    python tests/fixtures/time-zone-golden.py > tests/fixtures/time-zone-golden.json

Deterministic (seeded). Python 3.9+.
"""
import json
import random
import sys
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

UTC = timezone.utc
EPOCH = datetime(1970, 1, 1, tzinfo=UTC)
WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

ZONES = [
    "UTC", "Asia/Kolkata", "Asia/Kathmandu", "Australia/Adelaide", "Australia/Sydney", "Australia/Lord_Howe",
    "America/New_York", "America/Los_Angeles", "America/Adak", "Pacific/Honolulu", "Pacific/Kiritimati",
    "Pacific/Auckland", "Pacific/Chatham", "Europe/London", "Europe/Berlin", "Europe/Dublin",
    "America/Sao_Paulo", "Africa/Casablanca", "America/St_Johns", "Asia/Tehran", "Pacific/Pago_Pago", "Asia/Tokyo",
]


def ms_of(dt):
    return int((dt - EPOCH) / timedelta(milliseconds=1))


def from_ms(ms):
    return EPOCH + timedelta(milliseconds=ms)


def offset_seconds(aware):
    return int(aware.utcoffset().total_seconds())


def resolve(date, time, zone):
    z = ZoneInfo(zone)
    y, mo, d = map(int, date.split("-"))
    h, mi = map(int, time.split(":"))
    naive = datetime(y, mo, d, h, mi)
    found = {}
    for fold in (0, 1):
        aware = naive.replace(tzinfo=z, fold=fold)
        utc = aware.astimezone(UTC)
        if utc.astimezone(z).replace(tzinfo=None) == naive:
            found[ms_of(utc)] = offset_seconds(aware)
    candidates = [[ms, off] for ms, off in sorted(found.items())]
    kind = "gap" if not candidates else ("overlap" if len(candidates) > 1 else "unique")
    return {"date": date, "time": time, "zone": zone, "kind": kind, "candidates": candidates}


def local(ms, zone):
    return from_ms(ms).astimezone(ZoneInfo(zone))


def describe(ms, zone, source):
    t = local(ms, zone)
    s = local(ms, source)
    return {
        "ms": ms,
        "zone": zone,
        "source": source,
        "date": t.strftime("%Y-%m-%d"),
        "time": t.strftime("%H:%M"),
        "weekday": WEEKDAYS[t.weekday()],
        "offsetSeconds": offset_seconds(t),
        "dayDelta": (t.date() - s.date()).days,
    }


def transitions(zone, year):
    """UTC minutes (the first minute with the new offset) where the zone's offset changes during `year`, found by scanning hourly."""
    z = ZoneInfo(zone)
    start = datetime(year, 1, 1, tzinfo=UTC)
    prev = start.astimezone(z).utcoffset()
    out = []
    t = start
    end = datetime(year + 1, 1, 1, tzinfo=UTC)
    while t < end:
        t2 = t + timedelta(hours=1)
        off = t2.astimezone(z).utcoffset()
        if off != prev:
            lo, hi = t, t2
            while hi - lo > timedelta(minutes=1):
                mid = lo + (hi - lo) // 2
                mid = mid.replace(second=0, microsecond=0)
                if mid.astimezone(z).utcoffset() == prev:
                    lo = mid
                else:
                    hi = mid
            out.append(hi)
            prev = off
        t = t2
    return out


def wall_times_around(zone, instant):
    """Wall times on the transition's date, every 15 minutes within +-3 hours of the jump."""
    z = ZoneInfo(zone)
    before = (instant - timedelta(minutes=1)).astimezone(z).replace(tzinfo=None)
    after = instant.astimezone(z).replace(tzinfo=None)
    mid = before + (after - before) / 2
    lo = (mid - timedelta(hours=3)).replace(minute=(mid.minute // 15) * 15, second=0, microsecond=0)
    out = []
    for k in range(25):
        w = lo + timedelta(minutes=15 * k)
        out.append((w.strftime("%Y-%m-%d"), w.strftime("%H:%M")))
    return out


def minute_range_of_local_day(date, zone):
    """(first_ms, end_ms) of the zone's calendar day `date`, by testing every UTC minute around it."""
    z = ZoneInfo(zone)
    y, mo, d = map(int, date.split("-"))
    base = datetime(y, mo, d, tzinfo=UTC)
    first = last = None
    t = base - timedelta(hours=30)
    stop = base + timedelta(hours=54)
    while t < stop:
        if t.astimezone(z).strftime("%Y-%m-%d") == date:
            if first is None:
                first = t
            last = t
        t += timedelta(minutes=1)
    return ms_of(first), ms_of(last) + 60000


def overlap(date, source, participants, duration):
    """participants: [{zone, start, end}] with HH:MM in 15-minute steps. Everything minute by minute."""
    day_start, day_end = minute_range_of_local_day(date, source)
    minutes = (day_end - day_start) // 60000 + duration
    avail = {}
    for p in participants:
        z = ZoneInfo(p["zone"])
        fh, fm = map(int, p["start"].split(":"))
        th, tm = map(int, p["end"].split(":"))
        lo, hi = fh * 60 + fm, th * 60 + tm
        row = []
        for i in range(minutes):
            t = from_ms(day_start + i * 60000).astimezone(z)
            m = t.hour * 60 + t.minute
            row.append(lo <= m < hi)
        avail[p["zone"]] = row

    def all_free(i, length):
        return all(all(avail[z][i:i + length]) for z in avail) if length else False

    starts = []
    per_zone_runs = {z: [] for z in avail}
    grid = (day_end - day_start) // (15 * 60000)
    grid += 1 if (day_end - day_start) % (15 * 60000) else 0
    for k in range(grid):
        i = k * 15
        if day_start + i * 60000 >= day_end:
            break
        if all_free(i, duration):
            starts.append(day_start + i * 60000)
        for z in avail:
            if all(avail[z][i:i + 15]):
                per_zone_runs[z].append(day_start + i * 60000)

    def runs(instants):
        out = []
        for ms in instants:
            if out and ms - out[-1][1] == 15 * 60000:
                out[-1][1] = ms
            else:
                out.append([ms, ms])
        return out

    windows = [[a, b, b + duration * 60000] for a, b in runs(starts)]
    preferred = {z: [[a, b + 15 * 60000] for a, b in runs(per_zone_runs[z])] for z in avail}
    return {
        "date": date,
        "source": source,
        "participants": participants,
        "duration": duration,
        "status": "ok" if windows else "none",
        "windows": windows,
        "preferred": preferred,
    }


def main():
    rng = random.Random(20261007)

    resolve_cases = []
    for zone in ZONES:
        for year in (2026, 2027):
            for instant in transitions(zone, year):
                for date, time in wall_times_around(zone, instant):
                    resolve_cases.append(resolve(date, time, zone))
    for zone in ZONES:
        for _ in range(8):
            date = f"{rng.choice([2026, 2027])}-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}"
            time = f"{rng.randint(0, 23):02d}:{rng.choice([0, 15, 30, 45]):02d}"
            resolve_cases.append(resolve(date, time, zone))

    describe_cases = []
    for _ in range(250):
        ms = ms_of(datetime(2026, 1, 1, tzinfo=UTC)) + rng.randint(0, 2 * 365 * 24 * 60) * 60000
        source, zone = rng.sample(ZONES, 2)
        describe_cases.append(describe(ms, zone, source))
    # the date line, both ways, on a few instants
    for ms in [ms_of(datetime(2026, 6, 15, 10, 0, tzinfo=UTC)), ms_of(datetime(2026, 12, 31, 23, 30, tzinfo=UTC)), ms_of(datetime(2026, 1, 1, 0, 15, tzinfo=UTC))]:
        for source, zone in [("Pacific/Pago_Pago", "Pacific/Kiritimati"), ("Pacific/Kiritimati", "Pacific/Pago_Pago"), ("America/Adak", "Asia/Tokyo"), ("Pacific/Honolulu", "Pacific/Auckland")]:
            describe_cases.append(describe(ms, zone, source))

    overlap_cases = []
    transition_dates = []
    for zone in ["America/New_York", "Europe/London", "Australia/Sydney", "Australia/Lord_Howe", "America/Los_Angeles", "Asia/Kolkata"]:
        for instant in transitions(zone, 2026):
            transition_dates.append(instant.astimezone(ZoneInfo(zone)).strftime("%Y-%m-%d"))
    pools = [
        ["Asia/Kolkata", "Europe/London", "America/New_York"],
        ["Asia/Kolkata", "Asia/Kathmandu"],
        ["Australia/Sydney", "Europe/London"],
        ["America/New_York", "Europe/Berlin", "Asia/Tokyo"],
        ["Australia/Lord_Howe", "Pacific/Auckland", "Asia/Kolkata"],
        ["UTC", "America/Los_Angeles", "Asia/Kolkata", "Australia/Sydney"],
        ["Pacific/Kiritimati", "Pacific/Pago_Pago"],
        ["America/St_Johns", "Pacific/Chatham"],
    ]
    dates = sorted(set(transition_dates)) + [f"2026-{rng.randint(1, 12):02d}-{rng.randint(1, 28):02d}" for _ in range(20)]
    for date in dates:
        zones = rng.choice(pools)
        participants = []
        for zone in zones:
            start = rng.choice(["06:00", "07:30", "08:00", "09:00", "10:15"])
            end = rng.choice(["15:00", "17:00", "18:45", "21:00", "23:45"])
            participants.append({"zone": zone, "start": start, "end": end})
        overlap_cases.append(overlap(date, zones[0], participants, rng.choice([15, 30, 45, 60, 90])))
    # forced ordinary cases with the default hours, so a real overlap exists
    for date in ["2026-10-13", "2026-01-15", "2026-07-01"]:
        for zones in [["Asia/Kolkata", "Europe/London"], ["America/New_York", "Europe/London"], ["Asia/Tokyo", "Australia/Sydney"]]:
            overlap_cases.append(overlap(date, zones[0], [{"zone": z, "start": "09:00", "end": "17:00"} for z in zones], 30))

    # a transition INSIDE the meeting: New York hours that contain the skipped hour (2026-03-08) and the repeated hour (2026-11-01),
    # a half-hour shift (Lord Howe), and a 45-minute zone beside a 30-minute zone
    for date, zones, hours, duration in [
        ("2026-03-08", ["America/New_York", "UTC"], [("01:00", "04:00"), ("00:00", "23:45")], 60),
        ("2026-03-08", ["America/New_York", "UTC"], [("01:00", "04:00"), ("00:00", "23:45")], 90),
        ("2026-11-01", ["America/New_York", "UTC"], [("00:00", "03:00"), ("00:00", "23:45")], 60),
        ("2026-11-01", ["America/New_York", "Europe/London"], [("00:00", "03:00"), ("00:00", "23:45")], 90),
        ("2026-04-05", ["Australia/Lord_Howe", "UTC"], [("00:00", "04:00"), ("00:00", "23:45")], 45),
        ("2026-10-04", ["Australia/Lord_Howe", "UTC"], [("00:00", "04:00"), ("00:00", "23:45")], 30),
        ("2026-10-13", ["Asia/Kathmandu", "Asia/Kolkata", "Australia/Adelaide"], [("09:00", "17:00")] * 3, 45),
    ]:
        overlap_cases.append(overlap(date, zones[0], [{"zone": z, "start": s, "end": e} for z, (s, e) in zip(zones, hours)], duration))

    out = json.dumps({
        "generator": "tests/fixtures/time-zone-golden.py",
        "resolve": resolve_cases,
        "describe": describe_cases,
        "overlap": overlap_cases,
    }, separators=(",", ":"))
    sys.stdout.buffer.write((out + "\n").encode("utf-8"))


if __name__ == "__main__":
    main()
