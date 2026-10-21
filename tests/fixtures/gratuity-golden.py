"""
Independent reference vectors for the Gratuity Calculator (Tool Pack 29, G4).

Python standard library only (datetime, calendar, fractions, json, random). Every money figure is EXACT rational
arithmetic, never floating point. This file does not read, import, run or copy the JavaScript engine, and no expected
value comes from the JavaScript. The JavaScript tests (tests/unit/gratuity-golden.test.mjs) only READ
tests/fixtures/gratuity-golden.json, which only THIS file writes.

Run:  python tests/fixtures/gratuity-golden.py     (writes tests/fixtures/gratuity-golden.json; a few seconds)

Written from the approved specification (docs/tool-packs/29-gratuity-calculator.md, sections 7 and 33):

  SERVICE  convention C-prime, PROVISIONAL (an estimation convention, not a legal attendance calculation): both days are
           counted, so the exclusive end is the day after the exit date; the m-th anniversary of the joining date is the
           same day of the month m months later, or the FIRST DAY OF THE FOLLOWING MONTH when that day does not exist;
           the completed months are the largest m whose anniversary is on or before the exclusive end; the remaining days
           are the exclusive end minus that anniversary.
           Method here: a MONTH WALK (start at m = 0 and step forward) using Python's datetime for the day arithmetic. The
           JavaScript estimates m from the calendar fields and corrects it, with its own integer "days from civil" code.
  COUNTED YEARS  a completed year plus one when the rest is MORE than six months (7 to 11 months, or exactly 6 months and
           at least one more day); the amount only.
  AMOUNT   wages x 15 x N / 26 as an exact Fraction; the ceiling (20,00,000 rupees, a DEVELOPMENT value) applies when the
           exact value is above it; otherwise the amount is the exact value rounded to the nearest paisa, HALF UP.
  STATUS   regular employees: at least 60 months "five years reached"; at least 48 and under 60 "fifth year, not
           determined from dates"; under 48 "threshold not reached" (the 48-month line is a PRESENTATION classification,
           not a statutory threshold). Fixed-term, contract expires: at least 12 months "one-year condition met" (an
           ILLUSTRATIVE amount); under 12 months no amount.
"""
import calendar
import json
import os
import random
import sys
from datetime import date, timedelta
from fractions import Fraction as F

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))

CEILING_PAISE = 200_000_000
CODE_DATE = date(2025, 11, 21)
PRODUCT_LIMIT_PAISE = 1_000_000_000
TECHNICAL_MAX_PAISE = (2 ** 53 - 1 - 26) // (30 * 10_000)


def dim(y, m):
    return calendar.monthrange(y, m)[1]


def anniversary(join, m):
    """C-prime: the same day, or the first day of the following month when that day does not exist."""
    total = join.year * 12 + (join.month - 1) + m
    y, mo = divmod(total, 12)
    mo += 1
    if join.day <= dim(y, mo):
        return date(y, mo, join.day)
    return date(y + 1, 1, 1) if mo == 12 else date(y, mo + 1, 1)


def anniversary_clamp(join, m):
    """Option A (NOT chosen), kept only to report where it would differ: the last day of the shorter month."""
    total = join.year * 12 + (join.month - 1) + m
    y, mo = divmod(total, 12)
    mo += 1
    return date(y, mo, min(join.day, dim(y, mo)))


def add_months_clamp(d, n):
    """The explorer's hypothetical exit dates: the same day, or the last day of a shorter month."""
    total = d.year * 12 + (d.month - 1) + n
    y, mo = divmod(total, 12)
    mo += 1
    return date(y, mo, min(d.day, dim(y, mo)))


def walk(join, exit_, f=anniversary):
    """The month walk: step m forward from 0 while the next anniversary is on or before the exclusive end."""
    end = exit_ + timedelta(days=1)
    m = 0
    while f(join, m + 1) <= end:
        m += 1
    return m, (end - f(join, m)).days, end


def counted(m, d):
    rest = m % 12
    return m // 12 + (1 if (rest > 6 or (rest == 6 and d >= 1)) else 0)


def regular_status(m):
    if m >= 60:
        return "STATUS_FIVE_YEARS_REACHED"
    if m >= 48:
        return "STATUS_FIFTH_YEAR_UNDETERMINED"
    return "STATUS_THRESHOLD_NOT_REACHED"


def money(wages_paise, n):
    """Exact fraction, ceiling flag and the half-up paisa figure."""
    exact = F(wages_paise) * 15 * n / 26
    if exact > CEILING_PAISE:
        return exact, True, CEILING_PAISE
    paise = (exact + F(1, 2)).__floor__()
    return exact, False, paise


def wages_to_paise(text):
    """Exact: only for text already known to be digits with at most two decimals."""
    return int(F(text) * 100)


def iso(d):
    return d.isoformat()


def full_case(kind, joining, exit_, wages, contract_end=None):
    """The expected outcome of a calculation, from the specification's decision order (33.6)."""
    j, e = date.fromisoformat(joining), date.fromisoformat(exit_)
    out = {"input": {"employeeType": kind, "joiningDate": joining, "exitDate": exit_, "wages": wages}}
    if contract_end:
        out["input"]["contractEnd"] = contract_end
    if e < CODE_DATE:
        out["expect"] = {"status": "unsupported", "code": "UNSUPPORTED_EARLIER_LAW", "amountKind": "none", "paise": None}
        return out
    if kind == "fixedTerm" and contract_end == "earlier":
        out["expect"] = {"status": "unsupported", "code": "UNSUPPORTED_FT_EARLY_END", "amountKind": "none", "paise": None}
        return out
    m, d, end = walk(j, e)
    wp = wages_to_paise(wages)
    service = {"totalMonths": m, "years": m // 12, "months": m % 12, "days": d, "exclusiveEnd": iso(end)}
    if kind == "fixedTerm":
        if m < 12:
            out["expect"] = {"status": "ok", "code": "FT_UNDER_ONE_YEAR", "amountKind": "none", "paise": None, "service": service}
            return out
        n = counted(m, d)
        exact, applied, paise = money(wp, n)
        out["expect"] = {"status": "ok", "code": "FT_ONE_YEAR_MET", "amountKind": "illustrative", "paise": paise,
                         "countedYears": n, "ceilingApplied": applied, "numerator": wp * 15 * n, "service": service}
        return out
    code = regular_status(m)
    five = anniversary(j, 60) - timedelta(days=1)
    service["calendarFiveYearDate"] = iso(five)
    if code == "STATUS_THRESHOLD_NOT_REACHED":
        out["expect"] = {"status": "ok", "code": code, "amountKind": "none", "paise": None, "service": service}
        return out
    n = counted(m, d)
    exact, applied, paise = money(wp, n)
    out["expect"] = {"status": "ok", "code": code,
                     "amountKind": "estimated" if code == "STATUS_FIVE_YEARS_REACHED" else "illustrative",
                     "paise": paise, "countedYears": n, "ceilingApplied": applied, "numerator": wp * 15 * n, "service": service}
    return out


# ---------------------------------------------------------------- the data
data = {"meta": {
    "generator": "tests/fixtures/gratuity-golden.py",
    "specification": "docs/tool-packs/29-gratuity-calculator.md",
    "independence": "no JavaScript is read, imported or run; dates by a month walk on Python datetime; money by exact Fractions",
    "convention": "C-prime (provisional): both days counted; a missing anniversary day is the first day of the following month",
    "ceilingPaise": CEILING_PAISE,
    "productLimitPaise": PRODUCT_LIMIT_PAISE,
    "technicalMaxPaise": TECHNICAL_MAX_PAISE,
    "caveat": "estimation convention and development values; not a legal determination",
}}

# 1. wage text -> exact paise or the error code (rules of 33.5, implemented here by character scanning, not by a regular expression)
parse_cases = []


def parse_expect(text):
    if text.strip() == "":
        return {"state": "blank"}
    if "," in text or any(c.isspace() for c in text):
        return {"state": "invalid", "code": "WAGES_SEPARATOR"}
    body = text
    if body.startswith("-") and len(body) > 1 and all(c in "0123456789." for c in body[1:]) and body[1] in "0123456789":
        return {"state": "invalid", "code": "WAGES_NOT_POSITIVE"}
    parts = body.split(".")
    digits = "0123456789"
    if len(parts) > 2 or parts[0] == "" or not all(c in digits for c in parts[0]) or (len(parts) == 2 and (parts[1] == "" or not all(c in digits for c in parts[1]))):
        return {"state": "invalid", "code": "WAGES_FORMAT"}
    frac = parts[1] if len(parts) == 2 else ""
    if len(frac) > 2:
        return {"state": "invalid", "code": "WAGES_DECIMALS"}
    paise = int(parts[0]) * 100 + int((frac + "00")[:2])
    if paise == 0:
        return {"state": "invalid", "code": "WAGES_NOT_POSITIVE"}
    if paise > PRODUCT_LIMIT_PAISE:
        return {"state": "invalid", "code": "WAGES_PRODUCT_LIMIT"}
    return {"state": "valid", "paise": paise}


for text in ["50000", "50000.5", "50000.50", "0.01", "0.07", "1234567.89", "0050000", "9999999.99", "10000000", "10000000.00",
             "10000000.01", "10000001", "99999999999", "12345678901234567890", "0", "0.00", "00", "-5", "-0", "-0.5", "",
             "   ", "1,50,000", "150,000", "1 500", " 150000", "150000 ", "1.234", "1.2345", ".5", "5.", "abc", "1e5", "+5",
             "5-", "1.2.3", "--5", "٣٤", "150000​", "1_000", "0x10", "NaN", "Infinity", "12.5.0", "٣"]:
    parse_cases.append({"text": text, "expect": parse_expect(text)})
data["parse"] = parse_cases

# 2. service: random pairs, including joins on the 29th to 31st
random.seed(20261021)
service = []
for _ in range(900):
    j = date(1995, 1, 1) + timedelta(days=random.randrange(0, 11000))
    if random.random() < 0.35:
        # prefer month-end style joins
        y, mo = j.year, j.month
        j = date(y, mo, min(random.choice([29, 30, 31]), dim(y, mo)))
    e = j + timedelta(days=random.randrange(0, 9000))
    m, d, end = walk(j, e)
    service.append([iso(j), iso(e), m, d, iso(end)])
data["serviceRandom"] = service

# 3. service boundaries: every join day of a non-leap and a leap year, exits around the 48, 60 and 66 month marks (+-2 days)
boundary = []
for start in (date(2019, 1, 1), date(2020, 1, 1)):
    for k in range(366 if start.year == 2020 else 365):
        j = start + timedelta(days=k)
        for months in (48, 60, 66):
            base = anniversary(j, months) - timedelta(days=1)
            for off in (-2, -1, 0, 1, 2):
                e = base + timedelta(days=off)
                m, d, end = walk(j, e)
                boundary.append([iso(j), iso(e), m, d])
data["serviceBoundary"] = boundary

# 4. where option A (not chosen) would differ: information only
differs = []
for k in range(366):
    j = date(2020, 1, 1) + timedelta(days=k)
    hits = 0
    for years in range(5, 9):
        for off in range(-3, 4):
            e = anniversary(j, 12 * years + 6) - timedelta(days=1) + timedelta(days=off)
            a = walk(j, e, anniversary_clamp)
            c = walk(j, e)
            if counted(a[0], a[1]) != counted(c[0], c[1]):
                hits += 1
    if hits:
        differs.append([j.strftime("%m-%d"), hits])
data["optionADiffersNCountedJoinDays"] = differs

# 5. amounts: exact fraction, ceiling flag, half-up paisa figure
amounts = []
for wp in [1, 13, 26, 39, 100, 5000000, 3000000, 3750000, 10000000, 17333333, 50000 * 100, 99999999, 173333333, 173333334,
           346666666, 1000000000, 150000, 7777777, 123456789]:
    for n in [1, 2, 4, 5, 6, 8, 12, 30, 34, 35, 36, 40, 60, 100]:
        exact, applied, paise = money(wp, n)
        amounts.append({"wagesPaise": wp, "counted": n, "numerator": wp * 15 * n, "paise": paise, "ceilingApplied": applied,
                        "exact": f"{exact.numerator}/{exact.denominator}"})
data["amounts"] = amounts

# 6. full calculations (specification 7.7 and section 25 rows, boundaries, unsupported cases)
cases = []
for joining, exit_ in [("2016-04-01", "2024-03-31"), ("2019-01-01", "2023-12-31"), ("2019-01-01", "2023-12-30"), ("2019-01-01", "2024-06-30"),
                       ("2019-01-01", "2024-07-01"), ("2019-01-01", "2024-07-31"), ("2020-02-29", "2025-02-26"), ("2020-02-29", "2025-02-27"),
                       ("2020-02-29", "2025-02-28"), ("2018-08-31", "2024-02-28"), ("2018-08-31", "2024-02-29"), ("2020-07-01", "2025-02-28"),
                       ("2022-01-01", "2025-12-31"), ("2022-01-01", "2025-12-30"), ("2019-10-31", "2025-04-29"), ("2019-10-31", "2025-04-30"),
                       ("2019-10-31", "2025-05-01"), ("2019-08-29", "2025-02-28"), ("2019-08-30", "2025-02-28"), ("2019-03-31", "2024-09-30"),
                       ("2000-01-01", "2035-12-31"), ("1990-04-01", "2030-03-31"), ("2024-01-01", "2025-11-20"), ("2020-01-01", "2025-11-21"),
                       ("2010-05-15", "2025-11-21"), ("2005-02-28", "2025-11-22"), ("2025-11-21", "2025-11-21"), ("2025-11-21", "2026-11-20")]:
    for wages in ["50000", "30000", "100000", "0.13", "9999999.99"]:
        cases.append(full_case("regular", joining, exit_, wages))
# the same boundaries with exit dates INSIDE the supported range (on or after 21 November 2025): the rows above with earlier
# exits exercise the earlier-law outcome (D4), these exercise the status, counted-year and amount logic
for joining, exit_ in [("2018-04-01", "2026-03-31"), ("2021-01-01", "2025-12-31"), ("2021-01-01", "2025-12-30"), ("2020-12-01", "2025-11-29"),
                       ("2020-12-01", "2025-11-30"), ("2020-10-31", "2026-04-29"), ("2020-10-31", "2026-04-30"), ("2020-10-31", "2026-05-01"),
                       ("2020-08-31", "2026-02-27"), ("2020-08-31", "2026-02-28"), ("2020-08-31", "2026-03-01"), ("2024-02-29", "2029-02-26"),
                       ("2024-02-29", "2029-02-27"), ("2024-02-29", "2029-02-28"), ("2020-07-01", "2026-02-28"), ("2020-08-29", "2026-02-28"),
                       ("2020-08-30", "2026-02-28"), ("2021-03-31", "2026-09-30"), ("2021-05-31", "2026-11-30"), ("2021-12-31", "2027-06-30"),
                       ("2021-01-31", "2026-07-30"), ("2021-01-31", "2026-07-31"), ("2019-05-01", "2025-11-21"), ("2020-11-21", "2025-11-21")]:
    for wages in ["50000", "30000", "100000", "0.13", "9999999.99"]:
        cases.append(full_case("regular", joining, exit_, wages))
for start, end_ in [("2025-01-01", "2025-12-31"), ("2025-01-01", "2026-06-30"), ("2025-01-01", "2026-07-01"), ("2025-01-01", "2026-07-31"),
                    ("2025-01-01", "2025-11-30"), ("2024-12-01", "2025-11-20"), ("2025-01-01", "2026-12-31"), ("2020-03-31", "2026-03-30"),
                    ("2020-03-31", "2026-03-31"), ("2020-01-01", "2025-11-21"), ("2020-01-01", "2030-12-31")]:
    for wages in ["50000", "1733333.33", "1733333.34"]:
        cases.append(full_case("fixedTerm", start, end_, wages, "expires"))
    cases.append(full_case("fixedTerm", start, end_, "50000", "earlier"))
data["fullCases"] = cases

# 7. explorer: the calendar five-year date and the clamp-style targets
explorer = []
for joining, exit_ in [("2022-01-01", "2025-12-31"), ("2022-03-31", "2026-03-31"), ("2021-08-31", "2026-02-28"), ("2020-02-29", "2026-02-27"),
                       ("2023-01-29", "2025-12-31"), ("2019-01-01", "2025-11-21"), ("2019-03-31", "2025-11-30"), ("2018-02-28", "2025-12-15")]:
    j, e = date.fromisoformat(joining), date.fromisoformat(exit_)
    m, d, end = walk(j, e)
    targets = []
    if m < 60:
        targets.append(["FIVE_YEAR_DATE", iso(anniversary(j, 60) - timedelta(days=1))])
    targets.append(["PLUS_6_MONTHS", iso(add_months_clamp(e, 6))])
    targets.append(["PLUS_12_MONTHS", iso(add_months_clamp(e, 12))])
    explorer.append({"joiningDate": joining, "exitDate": exit_, "wages": "50000", "targets": targets})
data["explorer"] = explorer

# 8. validation expectations (rules of 33.5 and 33.8; written by hand from the specification)
data["validation"] = [
    {"input": {}, "status": "incomplete", "errors": [["employeeType", "REQUIRED"]]},
    {"input": {"employeeType": ""}, "status": "incomplete", "errors": [["employeeType", "REQUIRED"]]},
    {"input": {"employeeType": "boss"}, "status": "invalid", "errors": [["employeeType", "TYPE_UNKNOWN"]]},
    {"input": {"employeeType": "regular"}, "status": "incomplete",
     "errors": [["wages", "REQUIRED"], ["joiningDate", "REQUIRED"], ["exitDate", "REQUIRED"]]},
    {"input": {"employeeType": "fixedTerm", "wages": "50000", "joiningDate": "2025-01-01", "exitDate": "2025-12-31"}, "status": "incomplete",
     "errors": [["contractEnd", "REQUIRED"]]},
    {"input": {"employeeType": "fixedTerm", "contractEnd": "soon", "wages": "50000", "joiningDate": "2025-01-01", "exitDate": "2025-12-31"},
     "status": "invalid", "errors": [["contractEnd", "CONTRACT_END_UNKNOWN"]]},
    {"input": {"employeeType": "regular", "wages": "1,50,000", "joiningDate": "2019-01-01", "exitDate": "2025-12-31"}, "status": "invalid",
     "errors": [["wages", "WAGES_SEPARATOR"]]},
    {"input": {"employeeType": "regular", "wages": "0", "joiningDate": "2019-01-01", "exitDate": "2025-12-31"}, "status": "invalid",
     "errors": [["wages", "WAGES_NOT_POSITIVE"]]},
    {"input": {"employeeType": "regular", "wages": "10000000.01", "joiningDate": "2019-01-01", "exitDate": "2025-12-31"}, "status": "invalid",
     "errors": [["wages", "WAGES_PRODUCT_LIMIT"]]},
    {"input": {"employeeType": "regular", "wages": "50000", "joiningDate": "2019-02-30", "exitDate": "2025-12-31"}, "status": "invalid",
     "errors": [["joiningDate", "DATE_INVALID"]]},
    {"input": {"employeeType": "regular", "wages": "50000", "joiningDate": "2019-1-1", "exitDate": "2025-12-31"}, "status": "invalid",
     "errors": [["joiningDate", "DATE_FORMAT"]]},
    {"input": {"employeeType": "regular", "wages": "50000", "joiningDate": "2019-01-01", "exitDate": "2019-13-01"}, "status": "invalid",
     "errors": [["exitDate", "DATE_INVALID"]]},
    {"input": {"employeeType": "regular", "wages": "50000", "joiningDate": "2026-01-02", "exitDate": "2026-01-01"}, "status": "invalid",
     "errors": [["exitDate", "EXIT_BEFORE_JOINING"]]},
    {"input": {"employeeType": "regular", "wages": "abc", "joiningDate": "", "exitDate": "2025-12-31"}, "status": "incomplete",
     "errors": [["wages", "WAGES_FORMAT"], ["joiningDate", "REQUIRED"]]},
    {"input": {"employeeType": "other"}, "status": "unsupported", "errors": []},
    {"input": {"employeeType": "other", "wages": "garbage", "joiningDate": "nope"}, "status": "unsupported", "errors": []},
]

# 9. day numbers: Python's proleptic Gregorian ordinals as days since 1970-01-01 (a check on the engine's own "days from civil" code)
random.seed(7)
ordinals = []
for _ in range(1500):
    y = random.randrange(1, 10000)
    m = random.randrange(1, 13)
    d = random.randrange(1, dim(y, m) + 1)
    ordinals.append([f"{y:04d}-{m:02d}-{d:02d}", date(y, m, d).toordinal() - date(1970, 1, 1).toordinal()])
for text in ("0001-01-01", "0001-03-01", "1900-02-28", "1900-03-01", "2000-02-29", "2000-03-01", "2100-02-28", "2100-03-01", "9999-12-31", "1970-01-01"):
    ordinals.append([text, date.fromisoformat(text).toordinal() - date(1970, 1, 1).toordinal()])
data["ordinals"] = ordinals

with open(os.path.join(HERE, "gratuity-golden.json"), "w", encoding="utf-8", newline="\n") as handle:
    json.dump(data, handle, sort_keys=True, separators=(",", ":"), ensure_ascii=True)

print("gratuity-golden.json written:",
      f"{len(parse_cases)} parse, {len(service)} random service, {len(boundary)} boundary, {len(amounts)} amounts,",
      f"{len(cases)} full cases, {len(explorer)} explorer, {len(data['validation'])} validation, {len(ordinals)} day numbers;",
      f"option A differs for {len(differs)} join days")
