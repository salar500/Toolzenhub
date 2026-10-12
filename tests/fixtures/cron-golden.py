"""
Independent reference vectors for the Cron Expression Explainer (Tool Pack 25).

This file is written from the cronie SOURCE and the crontab(5) manual page, NOT from the JavaScript engine.
It does not read, import, run or copy the JavaScript, and no expected value here comes from a JavaScript output.
The JavaScript tests (tests/unit/cron-explainer.test.mjs) only READ tests/fixtures/cron-golden.json, which only
THIS file writes.

Run:  python tests/fixtures/cron-golden.py     (writes tests/fixtures/cron-golden.json; about a minute)

What it contains, as three parts that must agree before a value is written:

  1. PARSE ORACLE. A line-by-line port of cronie's field parser (src/entry.c: load_entry, get_list, get_range,
     get_number, set_element), including its character-level state machine, the DOM_STAR / DOW_STAR flags and the
     Sunday 0/7 merge. For every input it says whether CRONIE accepts it and what bits it sets. The tool's V1
     restrictions (spec section 6.6 and 7) are applied AFTER that, by independent string checks, and every case
     where cronie accepts but V1 refuses is labelled "accepted by cronie, refused by V1 for reason X".
  2. NEXT-RUN ORACLE. Brute force with datetime: minute by minute for the first year after each start instant
     (525,600 steps) and day by day over a full 400-year cycle (146,097 days), applying the day rule of src/cron.c
     (find_jobs) to the oracle's own bit sets and star flags. It also decides "never" by scanning the whole cycle.
  3. DOCUMENTED EXPECTATIONS. Values that come straight from the manual page and the cron.c comment, independent
     of both of the above: "30 4 1,15 * 5" (the 1st, the 15th and every Friday), "*/23" hours (0 and 23), "*/35"
     minutes (0 and 35), "0-23/2", "8-11", "jan-mar", "mon,wed,fri", and the truth table of the specification.
     The oracle ASSERTS these against its own computation, so a disagreement stops the run.

PROVENANCE. The cronie source revision consulted is recorded in META below. It was fetched on 2026-10-12 from
https://raw.githubusercontent.com/cronie-crond/cronie/<revision>/... after the GitHub API reported that revision as
the head of `master`. NO cronie binary was built or run (this machine has no C toolchain for it), so every claim
here is source-level, not binary-verified.
"""
import hashlib
import json
import os
import random
import sys
from datetime import date, datetime, timedelta, timezone

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))

META = {
    "generator": "tests/fixtures/cron-golden.py",
    "cronieRepository": "https://github.com/cronie-crond/cronie",
    "cronieRevision": "59a3d15672d5738f5b6f76c843f200ef40ac5810",
    "cronieRevisionDate": "2026-09-25T08:48:50Z",
    "cronieRevisionNote": "head of master according to the GitHub API on 2026-10-12; source files fetched at this exact revision",
    "sourceFilesSha256": {
        "src/entry.c": "1429c74324534ff06ce543fa17c69fd2af63006d8be09ad3512a32586ce839d0",
        "src/cron.c": "d5416d701e677cb25ef386a2bbb117dd0d4838b1d437092d82865e42b566f61e",
        "src/macros.h": "d1dafb9814d260a9fc4e22b3b43d7223a708f9bdaaba1544afbaa2ad32eb6d4a",
        "man/crontab.5": "e7554b36aaef407f193177f3a3ad54e707d7073350e1b70049d85084f6166cfa",
    },
    "binaryVerified": False,
    "binaryNote": "No cronie binary was built or executed. Everything here is derived from the source and the manual page.",
}

EOF = -1
EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)

# ---------------------------------------------------------------------------------------------------------------
# 1. PARSE ORACLE: a port of cronie src/entry.c
# ---------------------------------------------------------------------------------------------------------------

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]  # globals.h lists "Sun" twice

# (low, high, names) of the five time fields, from macros.h
FIELD_DEFS = [(0, 59, None), (0, 23, None), (1, 31, None), (1, 12, MONTH_NAMES), (0, 7, DOW_NAMES)]
FIELD_LABELS = ["minute", "hour", "day of month", "month", "day of week"]

R_START, R_AST, R_STEP, R_TERMS, R_NUM1, R_RANGE, R_RANGE_NUM2, R_RANDOM, R_FINISH = range(9)


class Stream:
    def __init__(self, text):
        self.text = text
        self.pos = 0
        self.notes = set()  # markers for behaviours V1 refuses: "reversed", "random"

    def get_char(self):
        if self.pos >= len(self.text):
            return EOF
        c = ord(self.text[self.pos])
        self.pos += 1
        return c

    def unget_char(self, ch):
        if ch != EOF:  # ungetc(EOF) does nothing in C
            self.pos -= 1


def c_isalnum(ch):
    return ch != EOF and ((48 <= ch <= 57) or (65 <= ch <= 90) or (97 <= ch <= 122))


def is_separator(ch):
    return ch in (9, 10, 32, 44)  # \t \n space ,


def get_number(low, names, st):
    """returns (ok, value). Mirrors get_number() in entry.c."""
    temp = []
    ch = st.get_char()
    while c_isalnum(ch):
        temp.append(chr(ch))
        ch = st.get_char()
    if not temp:
        st.unget_char(ch)
        return False, None
    st.unget_char(ch)
    word = "".join(temp)
    # strtol(temp, &endptr, 10): the whole token must be digits (the token is alphanumeric only)
    if word.isdigit():
        return True, (int(word) if len(word) <= 18 else 10 ** 18)  # strtol saturates; the value is far out of range anyway
    if names:
        for i, name in enumerate(names):
            if name.lower() == word.lower():  # strcasecmp
                return True, i + low
    return False, None


def set_element(bits, low, high, number):
    if number < low or number > high:
        return False
    bits.add(number - low)
    return True


def get_range(bits, low, high, names, st):
    """returns the terminating character, or EOF on a syntax error. Mirrors get_range() in entry.c."""
    step = 1
    state = R_START
    low_ = high_ = None
    ch = None
    while state != R_FINISH:
        ch = st.get_char()
        if ch == EOF:
            break
        if state == R_START:
            if ch == ord("*"):
                low_, high_ = low, high
                state = R_AST
                continue
            if ch == ord("~"):
                low_ = low
                state = R_RANDOM
                continue
            st.unget_char(ch)
            ok, value = get_number(low, names, st)
            if ok:
                low_ = value
                state = R_NUM1
                continue
            return EOF
        elif state == R_AST:
            if ch == ord("/"):
                state = R_STEP
                continue
            if is_separator(ch):
                state = R_FINISH
                continue
            return EOF
        elif state == R_STEP:
            st.unget_char(ch)
            ok, value = get_number(0, None, st)
            if ok and value != 0:
                step = value
                state = R_TERMS
                continue
            return EOF
        elif state == R_TERMS:
            if is_separator(ch):
                state = R_FINISH
                continue
            return EOF
        elif state == R_NUM1:
            if ch == ord("-"):
                state = R_RANGE
                continue
            if ch == ord("~"):
                state = R_RANDOM
                continue
            if is_separator(ch):
                high_ = low_
                state = R_FINISH
                continue
            return EOF
        elif state == R_RANGE:
            st.unget_char(ch)
            ok, value = get_number(low, names, st)
            if ok:
                high_ = value
                state = R_RANGE_NUM2
                continue
            return EOF
        elif state == R_RANGE_NUM2:
            if ch == ord("/"):
                if low_ > high_:
                    st.notes.add("reversed")
                state = R_STEP
                continue
            if low_ > high_:
                st.notes.add("reversed")
            if low_ > high_ and high_ == 0:
                high_ = 7
            if is_separator(ch):
                state = R_FINISH
                continue
            return EOF
        elif state == R_RANDOM:
            st.notes.add("random")
            if is_separator(ch):
                high_ = high
                state = R_FINISH
            else:
                st.unget_char(ch)
                ok, value = get_number(low, names, st)
                if ok:
                    high_ = value
                    state = R_TERMS
                else:
                    return EOF
            if low_ > high_:
                return EOF
            low_ = high_ = low_  # the real code picks random() % (high_-low_+1) + low_; one deterministic value here
            continue
        else:
            return EOF
    if state != R_FINISH or ch == EOF:
        return EOF
    for i in range(low_, high_ + 1, step):
        if not set_element(bits, low, high, i):
            return EOF
    return ch


def get_list(bits, low, high, names, ch, st):
    st.unget_char(ch)
    while True:
        ch = get_range(bits, low, high, names, st)
        if ch == EOF:
            return EOF
        if ch == ord(","):
            continue
        break
    while ch not in (9, 32, 10, EOF):  # Skip_Nonblanks
        ch = st.get_char()
    while ch in (9, 32):  # Skip_Blanks
        ch = st.get_char()
    return ch


def get_string(terminators, st):
    out = []
    ch = st.get_char()
    while ch != EOF and chr(ch) not in terminators:
        out.append(chr(ch))
        ch = st.get_char()
    return "".join(out), ch


ALIAS_TABLE = {
    # name: (minute, hour, dom, month, dow, DOM_STAR, DOW_STAR) as sets of absolute values, from load_entry
    "yearly": ({0}, {0}, {1}, {1}, set(range(0, 8)), False, True),
    "annually": ({0}, {0}, {1}, {1}, set(range(0, 8)), False, True),
    "monthly": ({0}, {0}, {1}, set(range(1, 13)), set(range(0, 8)), False, True),
    "weekly": ({0}, {0}, set(range(1, 32)), set(range(1, 13)), {0}, True, False),
    "daily": ({0}, {0}, set(range(1, 32)), set(range(1, 13)), set(range(0, 8)), False, False),
    "midnight": ({0}, {0}, set(range(1, 32)), set(range(1, 13)), set(range(0, 8)), False, False),
    "hourly": ({0}, set(range(0, 24)), set(range(1, 32)), set(range(1, 13)), set(range(0, 8)), False, False),
}


def cronie_parse(text):
    """Feed `text` + a dummy command to the ported load_entry. Returns a dict:
       {"ok": bool, "field": 1..5 or None, "sets": [...] , "domStar": bool, "dowStar": bool, "notes": set, "reboot": bool}"""
    st = Stream(text + " x\n")
    ch = st.get_char()
    if ch == ord("@"):
        word, ch = get_string(" \t\n", st)
        if word == "reboot":
            return {"ok": True, "reboot": True, "notes": st.notes}
        if word in ALIAS_TABLE:
            mi, ho, dm, mo, dw, dstar, wstar = ALIAS_TABLE[word]
            if 0 in dw or 7 in dw:  # load_entry: "make sundays equivalent" runs after the alias branch too
                dw = set(dw) | {0, 7}
            return {"ok": True, "field": None, "sets": [set(mi), set(ho), set(dm), set(mo), set(dw)],
                    "domStar": dstar, "dowStar": wstar, "notes": st.notes, "alias": word}
        return {"ok": False, "field": None, "notes": st.notes}
    sets = []
    flags = {"domStar": False, "dowStar": False}
    for idx, (low, high, names) in enumerate(FIELD_DEFS):
        if idx == 2 and ch == ord("*"):
            flags["domStar"] = True
        if idx == 4 and ch == ord("*"):
            flags["dowStar"] = True
        bits = set()
        ch = get_list(bits, low, high, names, ch, st)
        if ch == EOF:
            return {"ok": False, "field": idx + 1, "notes": st.notes}
        sets.append({b + low for b in bits})
    if 0 in sets[4] or 7 in sets[4]:
        sets[4] |= {0, 7}
    if ch == ord("\n") or ch == ord("*"):
        return {"ok": False, "field": None, "notes": st.notes}
    return {"ok": True, "field": None, "sets": sets, "notes": st.notes, **flags}


# ---- V1 restrictions, applied AFTER cronie, by independent string checks ------------------------------------

def v1_trim(text):
    return text.strip(" \t")


def v1_check(raw):
    """Returns (ok, reason_key, field or None, parse dict or None). `reason_key` names the first V1 refusal."""
    text = v1_trim(raw)
    if text == "":
        return False, "empty", None, None
    if len(text) > 256:
        return False, "input-too-long", None, None
    for ch in text:
        o = ord(ch)
        if not (o == 32 or o == 9 or 33 <= o <= 126):
            return False, "bad-character", None, None
    if text.startswith("@"):
        if " " in text or "\t" in text:
            return False, "alias-extra", None, None
        word = text[1:]
        if word.lower() != word:
            return False, "alias-case" if word.lower() in ALIAS_TABLE or word.lower() == "reboot" else "alias-unknown", None, None
        if word == "reboot":
            return False, "alias-reboot", None, None
        if word not in ALIAS_TABLE:
            return False, "alias-unknown", None, None
        return True, None, None, cronie_parse(text)
    tokens = [t for t in text.replace("\t", " ").split(" ") if t != ""]
    if len(tokens) < 5:
        return False, "too-few-fields", None, None
    if len(tokens) > 5:
        return False, "too-many-fields", None, None
    for i, tok in enumerate(tokens):
        if len(tok) > 64:
            return False, "field-too-long", i + 1, None
        if len(tok.split(",")) > 32:
            return False, "list-too-many", i + 1, None
        run = ""
        for c in tok + "\0":
            if c.isdigit() and c.isascii():
                run += c
            else:
                if len(run) > 3:
                    return False, "number-too-long", i + 1, None
                run = ""
    parsed = cronie_parse(text)
    if not parsed["ok"]:
        return False, "cronie-refuses", parsed.get("field"), parsed
    if "reversed" in parsed["notes"]:
        return False, "reversed-range", None, parsed
    if "random" in parsed["notes"]:
        return False, "tilde", None, parsed
    return True, None, None, parsed


def vector_for(raw):
    ok, reason, field, parsed = v1_check(raw)
    entry = {"input": raw, "v1": "ok" if ok else "no"}
    plain = all((ord(c) == 32 or ord(c) == 9 or 33 <= ord(c) <= 126) for c in raw)
    cr = cronie_parse(v1_trim(raw)) if (plain and v1_trim(raw) != "") else None
    if cr is not None:
        entry["cronie"] = "ok" if cr["ok"] else "no"
        if not cr["ok"] and cr.get("field"):
            entry["field"] = cr["field"]
    if ok:
        entry["values"] = [sorted(s) for s in parsed["sets"]]
        entry["domStar"] = bool(parsed.get("domStar"))
        entry["dowStar"] = bool(parsed.get("dowStar"))
        if "alias" in parsed:
            entry["alias"] = "@" + parsed["alias"]
    else:
        if reason != "cronie-refuses":
            entry["v1Reason"] = reason
            if cr is not None and cr["ok"]:
                entry["acceptedByCronieRefusedByV1"] = reason
        if field and "field" not in entry:
            entry["field"] = field
    return entry


# ---------------------------------------------------------------------------------------------------------------
# 2. NEXT-RUN ORACLE: datetime brute force + the day rule of cron.c
# ---------------------------------------------------------------------------------------------------------------

def day_ok(dom_set, dow_set, dom_star, dow_star, d):
    """cron.c find_jobs: (DOM_STAR || DOW_STAR) ? (dow && dom) : (dow || dom). dow of a date: Sunday = 0."""
    dow = (d.weekday() + 1) % 7
    dow_hit = dow in dow_set
    dom_hit = d.day in dom_set
    return (dow_hit and dom_hit) if (dom_star or dow_star) else (dow_hit or dom_hit)


def expr_sets(expr):
    p = cronie_parse(expr)
    assert p["ok"], expr
    return p


def minute_scan(p, start_dt, limit_minutes, count=5):
    """Minute by minute from start_dt (UTC, inclusive) for `limit_minutes` steps."""
    mi, ho, dm, mo, dw = p["sets"]
    out = []
    t = start_dt
    for _ in range(limit_minutes):
        if (t.minute in mi and t.hour in ho and t.month in mo and day_ok(dm, dw, p["domStar"], p["dowStar"], t.date())):
            out.append(t)
            if len(out) == count:
                break
        t += timedelta(minutes=1)
    return out


def day_scan(p, start_dt, days, count=5):
    """Day by day for `days` days. Returns (runs, any_day_matched)."""
    mi, ho, dm, mo, dw = p["sets"]
    out = []
    any_day = False
    d0 = start_dt.date()
    for k in range(days):
        d = d0 + timedelta(days=k)
        if d.month not in mo:
            continue
        if not day_ok(dm, dw, p["domStar"], p["dowStar"], d):
            continue
        any_day = True
        for h in sorted(ho):
            for m in sorted(mi):
                t = datetime(d.year, d.month, d.day, h, m, tzinfo=timezone.utc)
                if t >= start_dt:
                    out.append(t)
                    if len(out) == count:
                        return out, any_day
    return out, any_day


def start_after(now_ms):
    """first minute boundary STRICTLY after now (spec section 11)"""
    boundary = (now_ms // 60000) * 60000 + 60000
    return EPOCH + timedelta(milliseconds=boundary), boundary


def to_ms(dt):
    return (dt - EPOCH) // timedelta(milliseconds=1)


def next_runs_vector(expr, now_ms, minute_check=True):
    p = expr_sets(expr)
    start_dt, boundary = start_after(now_ms)
    runs, any_day = day_scan(p, start_dt, 146097)
    if minute_check:
        scan = minute_scan(p, start_dt, 525600)
        # the first year, minute by minute, must agree with the day scan wherever it finds matches
        horizon = start_dt + timedelta(minutes=525600)
        expect = [r for r in runs if r < horizon]
        assert [to_ms(r) for r in scan] == [to_ms(r) for r in expect[:5]], (expr, now_ms, "minute scan vs day scan")
    return {
        "expr": expr,
        "nowMs": now_ms,
        "startMs": boundary,
        "runsMs": [to_ms(r) for r in runs],
        "runsText": [r.strftime("%a ") + str(r.day) + r.strftime(" %b %Y, %H:%M UTC") for r in runs],
        "never": (len(runs) == 0 and not any_day),
    }


def ms(y, mo=1, d=1, h=0, mi=0, s=0, msec=0):
    return to_ms(datetime(y, mo, d, h, mi, s, tzinfo=timezone.utc)) + msec


# ---------------------------------------------------------------------------------------------------------------
# 3. DOCUMENTED EXPECTATIONS (from the manual page, the cron.c comment and the specification truth table)
# ---------------------------------------------------------------------------------------------------------------

TRUTH_TABLE = [
    # (expression, expected days of March 2026 on which it fires at 00:00)
    ("0 0 1,15 * 5", [1, 6, 13, 15, 20, 27]),
    ("0 0 * * 5", [6, 13, 20, 27]),
    ("0 0 1,15 * *", [1, 15]),
    ("0 0 */2 * 1", [9, 23]),
    ("0 0 *,1 * 1", [2, 9, 16, 23, 30]),
    ("0 0 1,* * 1", list(range(1, 32))),
    ("0 0 1-31 * 1", list(range(1, 32))),
    ("0 0 1 * 0-7", list(range(1, 32))),
    ("0 0 1 * 7", [1, 8, 15, 22, 29]),
    ("0 0 * * */2", [d for d in range(1, 32) if (date(2026, 3, d).weekday() + 1) % 7 in (0, 2, 4, 6)]),
    ("0 0 1 * */7", [1]),
    ("0 0 1-5 * 0", [1, 2, 3, 4, 5, 8, 15, 22, 29]),
]


def march_days(expr):
    p = expr_sets(expr)
    mi, ho, dm, mo, dw = p["sets"]
    return [d for d in range(1, 32) if 3 in mo and 0 in mi and 0 in ho
            and day_ok(dm, dw, p["domStar"], p["dowStar"], date(2026, 3, d))]


def documented_expectations():
    for expr, days in TRUTH_TABLE:
        got = march_days(expr)
        assert got == days, ("truth table", expr, got, days)
    # the manual: "30 4 1,15 * 5" runs at 4:30 on the 1st and 15th plus every Friday
    p = expr_sets("30 4 1,15 * 5")
    assert p["sets"][2] == {1, 15} and p["sets"][4] == {5} and not p["domStar"] and not p["dowStar"]
    assert expr_sets("0 */23 * * *")["sets"][1] == {0, 23}
    assert expr_sets("*/35 * * * *")["sets"][0] == {0, 35}
    assert expr_sets("0 0-23/2 * * *")["sets"][1] == set(range(0, 24, 2))
    assert expr_sets("0 8-11 * * *")["sets"][1] == {8, 9, 10, 11}
    assert expr_sets("0 0 * jan-mar *")["sets"][3] == {1, 2, 3}
    assert expr_sets("0 0 * * mon,wed,fri")["sets"][4] == {1, 3, 5}
    # cron.c comment: "* * 1,15 * Sun" 1st and 15th AND every Sunday; "* * * * Sun" only Sundays; "* * 1,15 * *" only 1st/15th
    a = expr_sets("* * 1,15 * Sun")
    b = expr_sets("* * * * Sun")
    c = expr_sets("* * 1,15 * *")
    assert not a["domStar"] and not a["dowStar"] and b["domStar"] and c["dowStar"]
    # the aliases of the manual
    assert ALIAS_TABLE["yearly"][:5] == ({0}, {0}, {1}, {1}, set(range(8)))


# ---------------------------------------------------------------------------------------------------------------
# Vectors
# ---------------------------------------------------------------------------------------------------------------

def parse_vectors():
    valid = [
        "* * * * *", "0 0 * * *", "30 9 * * *", "59 23 31 12 7", "0 0 1 1 0", "*/15 * * * *", "*/35 * * * *",
        "0 */23 * * *", "0 0-23/2 * * *", "0 8-11 * * *", "0 0 * jan-mar *", "0 0 * * mon,wed,fri",
        "30 4 1,15 * 5", "0 0 29 2 *", "5 4 * * sun", "0 0 1 */2 *", "0 0 */2 * *", "*/5 * * * *", "1-5 * * * *",
        "1,2,3 * * * *", "0,30 * * * *", "0-59/10 * * * *", "10-20/5 * * * *", "5-5 * * * *", "5-5/2 * * * *",
        "*/60 * * * *", "*/59 * * * *", "0 */24 * * *", "0 0 */31 * *", "0 0 * */12 *", "0 0 * * */7", "0 0 * * */8",
        "0 0 * * 0", "0 0 * * 7", "0 0 * * 0,7", "0 0 * * 5-7", "0 0 * * 1-7", "0 0 * * 0-7", "0 0 * * 0-6",
        "0 0 * * sun", "0 0 * * SUN", "0 0 * * Sun", "0 0 * * mon-fri", "0 0 * * MON-FRI", "0 0 * * mon-fri/2",
        "0 0 * jan *", "0 0 * JAN *", "0 0 * Dec *", "0 0 * jan,mar,may *", "0 0 * jan-dec *", "0 0 * feb-feb *",
        "0 0 1,1,2 * *", "5,5 * * * *", "1-5,3 * * * *", "007 * * * *", "000 * * * *", "0 0 001 * *", "0 0 1 001 *",
        "0\t0\t*\t*\t*", "0   0 *    * *", "  0 0 * * *  ", "\t0 0 * * *\t", "0 0 1,15 * *", "0 0 1,15 * 5", "0 0 1-31 * 1",
        "0 0 *,1 * 1", "0 0 1,* * 1", "0 0 */2 * 1", "0 0 1-5 * 0", "0 0 * * */2", "0 0 1 * */7", "0 0 1 * 0-7",
        "@yearly", "@annually", "@monthly", "@weekly", "@daily", "@midnight", "@hourly",
        "0 0 31 4,6,9,11 *", "0 0 31 2 *", "0 0 30 2 *", "0 0 29 2 */7", "0 0 29,30,31 2 *",
        "15 14 1 * *", "0 22 * * 1-5", "23 0-20/2 * * *", "5 4 * * sun", "0 4 8-14 * *", "0 0 1 1 *",
        "*/2 */2 */2 */2 */2", "1-59/2 * * * *", "0 1-23/2 * * *", "0 0 2-30/2 * *", "0 0 * 2-12/2 *",
        "0 0 * * 1-6/2", "0 0 * * 0-6/3", "0 0 * * 2-7/2", "*/1 */1 */1 */1 */1", "0-0 * * * *",
        "59-59 23-23 31-31 12-12 7-7", "0,59 0,23 1,31 1,12 0,7", "1,2,3,4,5,6,7,8,9,10 * * * *",
        "0 0 * jan-mar mon-fri", "0 0 1-7 * mon", "0 0 * * thu", "0 0 * mar *", "0 0 * * 6,0",
    ]
    # generated families: every field with a star step, a range and a list at its bounds
    for i, (low, high, _names) in enumerate(FIELD_DEFS):
        for text in [f"{low}", f"{high}", f"{low}-{high}", f"*/{max(1, (high - low) // 2)}", f"{low},{high}",
                     f"{low}-{high}/{max(1, (high - low) // 3)}"]:
            fields = ["*"] * 5
            fields[i] = text
            valid.append(" ".join(fields))
    seen = set()
    valid = [v for v in valid if not (v in seen or seen.add(v))]

    invalid = [
        "", "   ", "* * * *", "* * * * * *", "* * * * * * *", "* * * *", "*", "1 2 3", "1 2", "1",
        "60 * * * *", "* 24 * * *", "* * 0 * *", "* * 32 * *", "* * * 0 *", "* * * 13 *", "* * * * 8", "99 * * * *",
        "-1 * * * *", "*/0 * * * *", "0-59/0 * * * *", "* * */0 * *", "*-5 * * * *", "1-5-7 * * * *", "*/5/2 * * * *",
        "1-5/2/3 * * * *", "*/ * * * *", "1- * * * *", "-5 * * * *", "/5 * * * *", "*/a * * * *", "a * * * *",
        "1,,2 * * * *", "1, * * * *", ",1 * * * *", ", * * * *", "1 ,2 * * *", "1, 2 * * *",
        "0/35 * * * *", "5/10 * * * *", "0 0/2 * * *", "0 0 1/2 * *", "0 0 * 1/2 *", "0 0 * * 1/2", "mon/2 * * * *",
        "5-3 * * * *", "5-0 * * * *", "23-0 * * * *", "0 5-0 * * *", "0 0 5-1 * *", "0 0 * 12-1 *", "0 0 * * 5-0", "0 0 * * fri-sun",
        "0 0 * * sat-mon", "0 0 * dec-jan *", "5-3/2 * * * *",
        "? * * * *", "0 0 ? * *", "0 0 * * ?", "0 0 L * *", "0 0 15W * *", "0 0 * * 5L", "0 0 * * 5#2", "0 0 LW * *", "0 0 1,L * *",
        "~ * * * *", "~5 * * * *", "1~5 * * * *", "0 0 * * ~",
        "@reboot", "@REBOOT", "@Daily", "@DAILY", "@YEARLY", "@weekday", "@", "@daily extra", "@daily ", "@ daily", "@every5m",
        "H * * * *", "H/15 * * * *", "* H * * *",
        "0 0 * monday *", "0 0 * * monday", "0 0 * january *", "0 0 * * sunday", "0 0 * jan1 *", "0 0 * * mo", "0 0 * janu *",
        "jan * * * *", "* mon * * *", "* * jan * *", "* * * mon *", "0 0 * * jan",
        "0007 * * * *", "0 0 0001 * *", "1000 * * * *", "*/1000 * * * *", "0-1000 * * * *",
        "1a * * * *", "a1 * * * *", "0x1 * * * *", "1.5 * * * *", "+1 * * * *", "1e1 * * * *", "1_0 * * * *",
        "1 2 3 4 5 6", "0 0 * * * /usr/bin/job", "0 0 * * * command arg", "30 4 1,15 * 5 echo hi",
        "1 2 3 4 5", "١ * * * *", "１ * * * *", "0 0 * * * *é", "0 0 * * *​", "0 0  * * *",
        "0 0 * * *\n", "0 0\n* * *", "0 0 * * *\r", "0 0 * * *\0", "0\u000b0 * * *",
        "<script>alert(1)</script>", "0 0 * * *; rm -rf", "0 0 $(x) * *", "0 0 * * '1'",
    ]
    hostile = [
        "0 " * 128 + "0",  # 257 characters
        "*" * 257,
        "1," * 40 + "1 * * * *",  # 41 items
        "1," * 31 + "1 * * * *",  # 32 items: accepted by the list limit
        "1," * 32 + "1 * * * *",  # 33 items: refused
        "*/" * 40 + " * * * *",
        "1" * 1000 + " * * * *",
        "1" * 64 + " * * * *",
        "1" * 65 + " * * * *",
        "," * 1000 + " * * * *",
        "0-" * 60 + "0 * * * *",
        "* * * * " + "1" * 10000,
        "x" * 10000,
        "0 0 * * *" + " " * 300,  # trailing blanks only: trimmed
        " " * 300 + "0 0 * * *",
    ]
    out = []
    for raw in valid + invalid + hostile:
        out.append(vector_for(raw))
    # the 256-character boundary: runs of blanks between fields are legal, so the length can be set exactly
    for n in (255, 256, 257):
        raw = "0" + " " * (n - 8) + "0 * * *"
        assert len(raw) == n
        out.append(vector_for(raw))
    return out


def sweep(alphabet, max_len, make_expr):
    """Every string of length 1..max_len over `alphabet`: V1 verdict and cronie value set, as canonical lines."""
    digest = hashlib.sha256()
    total = ok_count = 0
    sample = []
    frontier = [""]
    for length in range(1, max_len + 1):
        nxt = []
        for prefix in frontier:
            for c in alphabet:
                s = prefix + c
                nxt.append(s)
                expr = make_expr(s)
                ok, _reason, _field, parsed = v1_check(expr)
                values = ""
                if ok:
                    idx = 0 if make_expr("X").startswith("X ") else 4
                    values = ",".join(str(v) for v in sorted(parsed["sets"][idx]))
                line = f"{s}\t{'ok' if ok else 'no'}\t{values}"
                digest.update(line.encode("ascii") + b"\n")
                total += 1
                ok_count += 1 if ok else 0
                if len(sample) < 400 and (total % 197 == 0 or (ok and total % 31 == 0)):
                    sample.append(line)
        frontier = nxt
    return {"count": total, "okCount": ok_count, "sha256": digest.hexdigest(), "sample": sample}


DOM_TEXTS = ["*", "*/2", "*/10", "*,3", "1", "15", "31", "1,15", "1-31", "1-5", "1,*", "29-31", "10-20/5", "2-30/2", "1,31", "*/31",
             "7,14,21,28", "3-3", "31-31", "*/1"]
DOW_TEXTS = ["*", "*/2", "*/7", "*,3", "0", "7", "0,7", "1", "5", "1-5", "0-7", "5-7", "mon-fri", "sat,sun", "*/3", "6", "1,3,5",
             "0-6", "2-7/2", "sun"]


def day_pairs():
    digest = hashlib.sha256()
    pairs = 0
    total_days = 0
    explicit = []
    for dom in DOM_TEXTS:
        for dow in DOW_TEXTS:
            expr = f"0 0 {dom} * {dow}"
            ok, _r, _f, p = v1_check(expr)
            if not ok:
                continue
            mi, ho, dm, mo, dw = p["sets"]
            for year in (2024, 2025):
                days = []
                d = date(year, 1, 1)
                while d.year == year:
                    if d.month in mo and day_ok(dm, dw, p["domStar"], p["dowStar"], d):
                        days.append(d.timetuple().tm_yday)
                    d += timedelta(days=1)
                line = f"{dom}|{dow}|{year}|" + ",".join(map(str, days))
                digest.update(line.encode("ascii") + b"\n")
                total_days += len(days)
            pairs += 1
    return {"domTexts": DOM_TEXTS, "dowTexts": DOW_TEXTS, "pairs": pairs, "totalMatchingDays": total_days,
            "sha256": digest.hexdigest(), "years": [2024, 2025]}


SUMMARY_VECTORS = [
    # (expression, expected summary sentence or None). Wording is the specification's section 10, typed by hand.
    ("30 9 * * *", "At 09:30, every day"),
    ("0 0 * * *", "At 00:00, every day"),
    ("59 23 * * *", "At 23:59, every day"),
    ("15 * * * *", "At minute 15 of every hour, every day"),
    ("0 * * * *", "At minute 0 of every hour, every day"),
    ("* 9 * * *", "Every minute from 09:00 to 09:59, every day"),
    ("* 0 * * *", "Every minute from 00:00 to 00:59, every day"),
    ("* * * * *", "Every minute, every day"),
    ("*/15 * * * *", "Every 15 minutes, restarting at the start of each hour: at minutes 0, 15, 30 and 45, every day"),
    ("*/35 * * * *", "Every 35 minutes, restarting at the start of each hour: at minutes 0 and 35, every day"),
    ("*/2 * * * *", "Every 2 minutes, restarting at the start of each hour: at minutes " + ", ".join(str(m) for m in range(0, 58, 2)) + " and 58, every day"),
    ("0 4,12,20 * * *", "At 04:00, 12:00 and 20:00, every day"),
    ("0 20,4,12 * * *", "At 04:00, 12:00 and 20:00, every day"),
    ("0,30 9 * * *", "At 09:00 and 09:30, every day"),
    ("0,30 9,17 * * *", "At 09:00, 09:30, 17:00 and 17:30, every day"),
    ("5,5 6 * * *", "At 06:05, every day"),
    ("30 4 * * mon-fri", "At 04:30, on Monday through Friday"),
    ("30 4 * * 1-5", "At 04:30, on Monday through Friday"),
    ("30 4 * * 1,3,5", "At 04:30, on Monday, Wednesday and Friday"),
    ("30 4 * * mon,wed,fri", "At 04:30, on Monday, Wednesday and Friday"),
    ("0 0 * * 0", "At 00:00, on Sunday"),
    ("0 0 * * 7", "At 00:00, on Sunday"),
    ("0 0 * * 0,7", "At 00:00, on Sunday"),
    ("0 0 * * 5-7", "At 00:00, on Friday through Sunday"),
    ("0 0 * * 0-6", "At 00:00, on Sunday through Saturday"),
    ("0 0 * * 1-7", "At 00:00, on Monday through Sunday"),
    ("0 0 * * sat,sun", "At 00:00, on Saturday and Sunday"),
    ("0 0 * * 6,0", "At 00:00, on Saturday and Sunday"),
    ("0 0 1,15 * *", "At 00:00, on day 1 and 15 of the month"),
    ("0 0 1 * *", "At 00:00, on day 1 of the month"),
    ("0 0 1,10,20 * *", "At 00:00, on day 1, 10 and 20 of the month"),
    ("0 0 1,15 * 5", "At 00:00, on day 1 and 15 of the month, or on Friday (either)"),
    ("0 0 1 * mon-fri", "At 00:00, on day 1 of the month, or on Monday through Friday (either)"),
    ("0 0 1,15 jan-mar 5", "At 00:00, on day 1 and 15 of the month, or on Friday (either), in January through March"),
    ("0 0 * jan-mar *", "At 00:00, every day in January through March"),
    ("0 0 * 1,7 *", "At 00:00, every day in January and July"),
    ("0 0 * 3 mon-fri", "At 00:00, on Monday through Friday in March"),
    ("0 0 1,15 6 *", "At 00:00, on day 1 and 15 of the month in June"),
    ("0 0 29 2 *", "At 00:00, on day 29 of the month in February"),
    ("@daily", "At 00:00, every day"),
    ("@midnight", "At 00:00, every day"),
    ("@hourly", "At minute 0 of every hour, every day"),
    ("@weekly", "At 00:00, on Sunday"),
    ("@monthly", "At 00:00, on day 1 of the month"),
    ("@yearly", "At 00:00, on day 1 of the month in January"),
    ("@annually", "At 00:00, on day 1 of the month in January"),
    # not summarised: the page says the schedule is explained field by field
    ("*/60 * * * *", None),
    ("*/1 * * * *", None),
    ("*/5 9 * * *", None),
    ("0-30 * * * *", None),
    ("0,30 * * * *", None),
    ("0 9-17 * * *", None),
    ("0 */2 * * *", None),
    ("0 0 */2 * *", None),
    ("0 0 */2 * 1", None),
    ("0 0 *,1 * 1", None),
    ("0 0 1,* * 1", None),
    ("0 0 1-31 * 1", None),
    ("0 0 1 * 0-7", None),
    ("0 0 1,15 * */2", None),
    ("0 0 * */2 *", None),
    ("0 0 1-5 * 0", None),
    ("0 0 1,2,3,4,5,6,7 * *", None),
    ("0,1,2,3,4,5,6 0 * * *", None),
    ("0 0 * * 1,2,3,4,5,6,0", None),
    ("0 0 * * 0-7", None),
    ("0 0 * jan,feb,mar-apr *", None),
    ("0,10,20 1,2,3,4 * * *", None),
]

REFERENCE_YEAR = 2026


def reference_minutes(expr):
    """all minutes of 2026 (as minute indexes since 2026-01-01T00:00Z) on which the expression fires"""
    p = expr_sets(expr)
    mi, ho, dm, mo, dw = p["sets"]
    base = date(REFERENCE_YEAR, 1, 1)
    out = []
    for k in range(365):
        d = base + timedelta(days=k)
        if d.month in mo and day_ok(dm, dw, p["domStar"], p["dowStar"], d):
            for h in sorted(ho):
                for m in sorted(mi):
                    out.append(k * 1440 + h * 60 + m)
    return out


def summary_vectors():
    out = []
    for expr, sentence in SUMMARY_VECTORS:
        minutes = reference_minutes(expr)
        digest = hashlib.sha256(",".join(map(str, minutes)).encode("ascii")).hexdigest()
        out.append({"expr": expr, "sentence": sentence, "year": REFERENCE_YEAR, "count": len(minutes), "sha256": digest})
    return out


def next_run_vectors():
    cases = []

    def add(expr, now, check=True):
        cases.append(next_runs_vector(expr, now, minute_check=check))

    now = ms(2026, 10, 12, 10, 0, 30)
    for expr in ["* * * * *", "*/15 * * * *", "30 4 * * mon-fri", "0 0 1,15 * 5", "@daily", "@hourly", "@weekly", "@monthly", "@yearly",
                 "0 */2 * * *", "0 0 * * *", "59 23 31 12 *", "0 0 1 1 *", "0 9 * * 1-5", "5 4 * * sun", "0 0 1 */3 *", "0 12 15 * 3"]:
        add(expr, now)
    # leap years, 2100 and rare schedules
    add("0 0 29 2 *", ms(2026, 1, 1), check=False)
    add("0 0 29 2 *", ms(2096, 1, 1), check=False)
    add("0 0 29 2 *", ms(2096, 3, 1), check=False)
    add("0 0 29 2 *", ms(2099, 1, 1), check=False)
    add("0 0 29 2 *", ms(2100, 2, 28, 12), check=False)
    add("0 0 29 2 *", ms(2028, 2, 29, 0, 0), check=False)   # start boundary equals the match: excluded
    add("0 0 29 2 *", ms(2028, 2, 28, 23, 59, 59, 999), check=False)  # 1 ms before the match boundary: included
    add("0 0 29 2 */7", ms(2026, 1, 1), check=False)
    add("0 0 29 2 sun", ms(2026, 1, 1), check=False)
    add("0 0 29 2 1", ms(2026, 1, 1), check=False)
    add("0 0 13 * 5", ms(2026, 1, 1), check=False)
    add("0 0 31 * *", ms(2026, 1, 1))
    add("0 0 30 * *", ms(2026, 1, 1))
    add("0 0 31 4,6,9,11 *", ms(2026, 1, 1), check=False)
    add("0 0 31 2 *", ms(2026, 1, 1), check=False)
    add("0 0 30 2 *", ms(2026, 1, 1), check=False)
    add("0 0 30,31 2 *", ms(2026, 1, 1), check=False)
    add("0 0 31 2,4,6,9,11 *", ms(2026, 1, 1), check=False)
    # boundaries: minute boundary excluded, 1 ms before included
    add("* * * * *", ms(2026, 10, 12, 10, 0, 0))
    add("* * * * *", ms(2026, 10, 12, 10, 0, 59, 999))
    add("* * * * *", ms(2026, 10, 12, 10, 0, 0, 1))
    add("0 10 * * *", ms(2026, 10, 12, 10, 0, 0))
    add("0 10 * * *", ms(2026, 10, 12, 9, 59, 59, 999))
    add("0 10 * * *", ms(2026, 10, 12, 9, 59, 0))
    # year ends, end of February in leap and non-leap years
    add("* * * * *", ms(2026, 12, 31, 23, 58))
    add("0 0 * * *", ms(2026, 12, 31, 23, 59))
    add("0 0 1 1 *", ms(2026, 12, 31, 12))
    add("0 0 * * *", ms(2028, 2, 28, 12))
    add("0 0 * * *", ms(2027, 2, 27, 12))
    add("0 0 * * *", ms(2100, 2, 27, 12))
    add("0 0 1 3 *", ms(2100, 2, 1))
    add("* * * * *", ms(2099, 12, 31, 23, 58))
    add("0 0 * * *", ms(2099, 12, 31, 12))
    add("0 0 * * 0", ms(2099, 12, 25))
    # a start in the 1970s and one before 1970
    add("0 0 * * *", ms(1970, 1, 1, 0, 0))
    add("0 0 * * *", ms(1969, 12, 31, 12))
    add("0 0 29 2 *", ms(1900, 1, 1), check=False)
    # the specification's own examples
    add("0 0 29 2 *", ms(2026, 10, 12), check=False)

    rnd = random.Random(20261012)
    names_m = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
    names_d = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

    def gen_field(idx):
        low, high, _n = FIELD_DEFS[idx]
        kind = rnd.choice(["star", "star", "num", "list", "range", "starstep", "rangestep"])
        use_names = idx in (3, 4) and rnd.random() < 0.3
        def val(v):
            if use_names and idx == 3:
                return names_m[v - 1]
            if use_names and idx == 4:
                return names_d[v % 7]
            return str(v)
        if kind == "star":
            return "*"
        if kind == "num":
            return val(rnd.randint(low, high))
        if kind == "list":
            vs = sorted(rnd.sample(range(low, high + 1), min(rnd.randint(2, 4), high - low + 1)))
            return ",".join(val(v) for v in vs)
        a = rnd.randint(low, high)
        b = rnd.randint(a, high)
        if kind == "range":
            return f"{val(a)}-{val(b)}"
        if kind == "starstep":
            return f"*/{rnd.randint(1, max(1, (high - low)))}"
        return f"{val(a)}-{val(b)}/{rnd.randint(1, max(1, b - a + 1))}"

    for _ in range(400):
        expr = " ".join(gen_field(i) for i in range(5))
        if not v1_check(expr)[0]:
            continue
        year = rnd.randint(2020, 2099)
        now = ms(year, rnd.randint(1, 12), rnd.randint(1, 28), rnd.randint(0, 23), rnd.randint(0, 59), rnd.randint(0, 59), rnd.randint(0, 999))
        # cheap vectors first-year check; rare ones rely on the day scan only
        add(expr, now, check=True)
    return cases


def civil_vectors():
    rnd = random.Random(7)
    out = []
    for z in list(range(-800000, 800000, 4999)) + [rnd.randint(-2000000, 2000000) for _ in range(500)]:
        # z days since 1970-01-01 -> proleptic Gregorian date through the ordinal of datetime.date
        try:
            d = date.fromordinal(z + 719163)
        except ValueError:
            continue
        out.append([z, d.year, d.month, d.day, (d.weekday() + 1) % 7])
    # every day of 1999-12-31 .. 2101-03-02 boundaries, and the leap-year edges
    for y in (1900, 2000, 2024, 2025, 2096, 2100, 2104, 2400):
        for (m, dd) in ((2, 28), (3, 1), (12, 31), (1, 1)):
            d = date(y, m, dd)
            z = d.toordinal() - 719163
            out.append([z, d.year, d.month, d.day, (d.weekday() + 1) % 7])
        if y % 4 == 0 and (y % 100 != 0 or y % 400 == 0):
            d = date(y, 2, 29)
            out.append([d.toordinal() - 719163, y, 2, 29, (d.weekday() + 1) % 7])
    return out


def main():
    documented_expectations()
    data = {
        "meta": META,
        "cycle": {"days": 146097, "weeks": 146097 // 7, "weeksExact": 146097 % 7 == 0,
                  "end": (date(2000, 1, 1) + timedelta(days=146097)).isoformat(),
                  "weekdayStart": date(2000, 1, 1).weekday(), "weekdayEnd": (date(2000, 1, 1) + timedelta(days=146097)).weekday()},
        "truthTable": [{"expr": e, "month": "2026-03", "days": d} for e, d in TRUTH_TABLE],
        "parse": parse_vectors(),
        "nextRuns": next_run_vectors(),
        "civil": civil_vectors(),
        "summary": summary_vectors(),
        "dayPairs": day_pairs(),
        "sweepMinute": {"alphabet": "*/,-0159a", "maxLen": 5,
                        **sweep("*/,-0159a", 5, lambda s: f"{s} * * * *")},
        "sweepDow": {"alphabet": "*/,-017sun", "maxLen": 5,
                     **sweep("*/,-017sun", 5, lambda s: f"* * * * {s}")},
    }
    with open(os.path.join(HERE, "cron-golden.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=True, indent=None, separators=(",", ":"), sort_keys=True)
        fh.write("\n")
    p = data["parse"]
    print("parse vectors:", len(p), "v1 ok:", sum(1 for v in p if v["v1"] == "ok"), "v1 refused:", sum(1 for v in p if v["v1"] == "no"),
          "accepted by cronie but refused by V1:", sum(1 for v in p if v.get("acceptedByCronieRefusedByV1")))
    print("next-run vectors:", len(data["nextRuns"]), "never:", sum(1 for v in data["nextRuns"] if v["never"]))
    print("summary vectors:", len(data["summary"]), "civil:", len(data["civil"]), "day pairs:", data["dayPairs"]["pairs"])
    print("sweeps:", data["sweepMinute"]["count"], data["sweepDow"]["count"])


if __name__ == "__main__":
    main()
