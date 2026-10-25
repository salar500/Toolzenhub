"""
Independent reference for the International Meeting Planner (Tool Pack 34).

It shares no code with assets/js/tools/meeting-planner/meeting-engine.js and, unlike the engine, does not lean on a 15-minute shortcut:
availability is tested minute by minute (every 5 minutes here) on each person's real clock, using zoneinfo and datetime. The engine builds
a grid of 15-minute blocks; agreeing with a finer check is the point.

Availability of a person on local day D: the window [start, end) on D; when end < start the window runs into the next morning and belongs to
the day it starts on. Days of the week apply to the day the window starts. A meeting of L minutes fits when every sampled minute fits.

Run:  python tests/fixtures/meeting-golden.py > tests/fixtures/meeting-golden.json
"""
import json
import random
from datetime import date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo

UTC = timezone.utc
STEP = 5  # minutes
GRID = 15

ZONES = [
    "America/New_York", "Europe/London", "Asia/Kolkata", "Asia/Tokyo", "Australia/Sydney", "Pacific/Auckland", "Asia/Kathmandu",
    "Australia/Lord_Howe", "Pacific/Kiritimati", "America/Los_Angeles", "Europe/Berlin", "Asia/Dubai", "America/St_Johns", "Pacific/Apia",
    "Asia/Tehran", "Africa/Cairo", "America/Sao_Paulo", "UTC",
]


def hm(text):
    return int(text[:2]) * 60 + int(text[3:])


def available(person, t_utc):
    local = t_utc.astimezone(ZoneInfo(person["zone"]))
    m = local.hour * 60 + local.minute
    wd = local.weekday()
    start, end = hm(person["start"]), hm(person["end"])
    if start < end:
        return person["days"][wd] and start <= m < end
    return (person["days"][wd] and m >= start) or (person["days"][(wd - 1) % 7] and m < end)


def fits(person, t_utc, length):
    return all(available(person, t_utc + timedelta(minutes=k)) for k in range(0, length, STEP))


def ms(t):
    return int(t.timestamp() * 1000)


def search(people, ref, first, ndays, length):
    ref_tz = ZoneInfo(ref)
    # all 15-minute instants whose reference-zone date lies in the range, found by walking UTC (no local-midnight arithmetic)
    anchor = datetime(first.year, first.month, first.day, tzinfo=UTC) - timedelta(days=2)
    last = first + timedelta(days=ndays - 1)
    out = {}
    d = anchor
    while d < anchor + timedelta(days=ndays + 5):
        local_date = d.astimezone(ref_tz).date()
        if first <= local_date <= last:
            if all(fits(p, d, length) for p in people):
                out.setdefault(local_date.isoformat(), []).append(ms(d))
        d += timedelta(minutes=GRID)
    dates = []
    for n in range(ndays):
        day = (first + timedelta(days=n)).isoformat()
        starts = out.get(day, [])
        runs = []
        for s in starts:
            if runs and s - runs[-1][1] == GRID * 60000:
                runs[-1][1] = s
            else:
                runs.append([s, s])
        dates.append({"date": day, "runs": runs, "startCount": len(starts)})
    return dates


def changes(people, first, ndays, ref):
    ref_tz = ZoneInfo(ref)
    # range of instants: start of the first reference-zone date to the start of the day after the last (walk UTC to find them)
    t = datetime(first.year, first.month, first.day, tzinfo=UTC) - timedelta(days=2)
    start = None
    while True:
        if t.astimezone(ref_tz).date() >= first:
            start = t
            break
        t += timedelta(minutes=GRID)
    # step back to the first instant of the date (the loop above stops on the first instant of the date)
    end_date = first + timedelta(days=ndays)
    t2 = start
    while t2.astimezone(ref_tz).date() < end_date:
        t2 += timedelta(minutes=GRID)
    found = []
    for p in people:
        tz = ZoneInfo(p["zone"])
        cur = start
        prev = cur.astimezone(tz).utcoffset()
        while cur < t2:
            nxt = cur + timedelta(minutes=GRID)
            off = nxt.astimezone(tz).utcoffset()
            if off != prev and nxt < t2 + timedelta(seconds=1):
                found.append({"name": p["name"], "ms": ms(nxt), "from": int(prev.total_seconds()), "to": int(off.total_seconds())})
            prev = off
            cur = nxt
    return found


def recurring(people, ref, slot_ms, length, weeks=12):
    ref_tz = ZoneInfo(ref)
    base = datetime.fromtimestamp(slot_ms / 1000, tz=UTC)
    base_ref = base.astimezone(ref_tz)
    base_locals = [base.astimezone(ZoneInfo(p["zone"])) for p in people]
    rows = []
    for w in range(weeks):
        d = base_ref.date() + timedelta(days=7 * w)
        dt = datetime(d.year, d.month, d.day, base_ref.hour, base_ref.minute, tzinfo=ref_tz)
        utc = dt.astimezone(UTC)
        round_trip = utc.astimezone(ref_tz)
        if (round_trip.hour, round_trip.minute, round_trip.date()) != (dt.hour, dt.minute, dt.date()):
            rows.append({"week": w, "status": "skipped"})
            continue
        ambiguous = dt.replace(fold=0).utcoffset() != dt.replace(fold=1).utcoffset()
        dt0 = dt.replace(fold=0).astimezone(UTC)
        per = []
        for p, bl in zip(people, base_locals):
            lt = dt0.astimezone(ZoneInfo(p["zone"]))
            shift = (lt.hour * 60 + lt.minute) - (bl.hour * 60 + bl.minute)
            shift = ((shift % 1440) + 1440) % 1440
            if shift > 720:
                shift -= 1440
            per.append({"time": f"{lt.hour:02d}:{lt.minute:02d}", "shift": shift, "fits": fits(p, dt0, length)})
        rows.append({"week": w, "status": "ambiguous" if ambiguous else "ok", "ms": ms(dt0), "per": per})
    return rows


def person(rng, zone=None):
    start = rng.choice(["06:00", "08:00", "09:00", "10:30", "13:00", "18:00", "22:00", "22:15"])
    end = rng.choice(["12:00", "17:00", "18:30", "20:00", "23:45", "06:00", "03:00", "07:45"])
    while end == start:
        end = rng.choice(["12:00", "17:00", "18:30"])
    days = [rng.random() < 0.8 for _ in range(7)]
    if not any(days):
        days[0] = True
    return {"name": f"P{rng.randrange(100)}", "zone": zone or rng.choice(ZONES), "start": start, "end": end, "days": days}


def build():
    rng = random.Random(34)
    cases = []
    dst_dates = [date(2026, 3, 5), date(2026, 3, 26), date(2026, 10, 22), date(2026, 10, 30), date(2026, 4, 1), date(2026, 9, 24), date(2026, 11, 2), date(2026, 6, 15), date(2027, 1, 4)]
    fixed = [
        ([("Europe/London", "09:00", "17:00"), ("Asia/Kolkata", "09:00", "17:00")], "Europe/London", date(2026, 11, 3), 3, 30),
        ([("America/New_York", "09:00", "17:00"), ("Europe/London", "09:00", "17:00"), ("Asia/Tokyo", "22:00", "06:00")], "America/New_York", date(2026, 3, 5), 7, 60),
        ([("Asia/Kathmandu", "09:00", "17:00"), ("Pacific/Kiritimati", "08:00", "18:00")], "Asia/Kathmandu", date(2026, 6, 15), 3, 15),
    ]
    for plist, ref, first, n, length in fixed:
        people = [{"name": f"P{i}", "zone": z, "start": s, "end": e, "days": [True] * 5 + [False] * 2} for i, (z, s, e) in enumerate(plist)]
        cases.append(make(people, ref, first, n, length))
    for i in range(48):
        count = rng.randrange(2, 5)
        people = [person(rng) for _ in range(count)]
        ref = rng.choice([p["zone"] for p in people] + ["UTC"])
        first = rng.choice(dst_dates)
        n = rng.randrange(1, 6)
        length = rng.choice([15, 30, 45, 60, 90, 120])
        cases.append(make(people, ref, first, n, length))
    return cases


def make(people, ref, first, n, length):
    dates = search(people, ref, first, n, length)
    case = {
        "people": people,
        "reference": ref,
        "date": first.isoformat(),
        "days": n,
        "duration": length,
        "dates": dates,
        "changes": changes(people, first, n, ref),
    }
    slot = next((r[0] for d in dates for r in d["runs"]), None)
    if slot is not None:
        case["recurring"] = {"slotMs": slot, "rows": recurring(people, ref, slot, length)}
    return case


if __name__ == "__main__":
    print(json.dumps({"cases": build()}, separators=(",", ":")))
