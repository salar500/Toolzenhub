"""
Independent reference vectors for the PPF Calculator (Tool Pack 26, Phase 1).

Python standard library only (fractions, json, random). Every figure is EXACT rational arithmetic, never floating point.
This file does not read, import, run or copy the JavaScript engine, and no expected value comes from a browser or from
the JavaScript. The JavaScript tests (tests/unit/ppf-golden.test.mjs) only READ tests/fixtures/ppf-golden.json, which
only THIS file writes.

Run:  python tests/fixtures/ppf-golden.py     (writes tests/fixtures/ppf-golden.json; a few seconds)

Written from the approved specification (docs/tool-packs/26-ppf-calculator.md, section 7) and the Scheme's rule it
quotes: interest "shall be eligible for a calendar month on the lowest balance at the credit of an account between the
close of the fifth day and the end of the month" and is "credited to the account at the end of each year", with the
V1 assumption that a month's interest is the annual rate divided by 12.

Two models that must agree EXACTLY before a value is written:

  A. A LEDGER MODEL. A financial year is walked month by month, April to March. Each deposit is an event with a month
     and a DAY of the month. The balance at the close of every day of the month is rebuilt from the events, the lowest
     balance from the close of the 5th to the month end is taken literally (so a deposit dated the 6th does NOT earn that
     month, and one dated the 5th does), a month's interest is that lowest balance times rate / 12, and the year's
     interest is credited once, after March. It does not use the "balance after the month's deposits" shortcut the
     JavaScript uses.
  B. CLOSED FORMS. Yearly deposit D at the start of each year:  B_n = D (1 + r) ((1 + r)^n - 1) / r.
     Monthly deposit m:  B_n = (12 m + 6.5 m r) ((1 + r)^n - 1) / r  (the year's interest on one year of monthly deposits
     is (r / 12) m (1 + 2 + ... + 12) = 6.5 m r).  With r = 0 the balance is the deposits.

Display rounding is whole rupees, halves up (specification section 7b); the oracle's golden value is the UNROUNDED exact
balance, written to 6 decimal places (half up). Rounded-interest variants are recorded as information only.
"""
import json
import os
import random
import sys
from fractions import Fraction as F

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))

META = {
    "generator": "tests/fixtures/ppf-golden.py",
    "specification": "docs/tool-packs/26-ppf-calculator.md",
    "arithmetic": "exact fractions; values written to 6 decimal places, halves up",
    "monthlyInterest": "annual rate / 12 applied to the lowest balance between the close of the 5th and the month end (V1 assumption U8)",
    "independence": "no JavaScript is read, imported or run; two separate models (a day-level ledger and closed forms) must agree exactly",
}

MONTH_DAYS = [30, 31, 30, 31, 31, 30, 31, 30, 31, 31, 28, 31]  # April .. March; February at 28, which cannot matter here


def half_up(x):
    """round a Fraction to the nearest integer, halves up (the values here are never negative)"""
    return (x + F(1, 2)).__floor__()


def dec2(x):
    """a Fraction as a decimal string with 2 places, halves up"""
    scaled = half_up(x * 100)
    whole, frac = divmod(scaled, 100)
    return f"{whole}.{frac:02d}"


def dec6(x):
    """a Fraction as a decimal string with 6 places, halves up"""
    scaled = half_up(x * 10 ** 6)
    whole, frac = divmod(scaled, 10 ** 6)
    return f"{whole}.{frac:06d}"


# ---------------------------------------------------------------------------------------------------------------
# Model A: the ledger
# ---------------------------------------------------------------------------------------------------------------

def deposits_for(pattern, amount):
    """events (month index 0 = April, day of month, rupees) for ONE financial year"""
    if pattern == "yearly":
        return [(0, 5, F(amount))]            # all in April, on the 5th
    if pattern == "monthly":
        return [(m, 5, F(amount)) for m in range(12)]  # every month on the 5th
    if pattern == "march_end":                # reference only: the whole year's total on 31 March
        return [(11, 31, F(amount))]
    raise ValueError(pattern)


def year_ledger(opening, events, rate):
    """one financial year: returns (interest credited at the end of the year, closing balance)"""
    balance = F(opening)
    total_interest = F(0)
    for month in range(12):
        days = MONTH_DAYS[month]
        month_events = [(day, amt) for (m, day, amt) in events if m == month]
        # the balance at the close of each day of the month, rebuilt from the events
        close = []
        running = balance
        for day in range(1, days + 1):
            running += sum(amt for (d, amt) in month_events if d == day)
            close.append(running)
        # lowest balance from the close of the 5th (index 4) to the end of the month
        lowest = min(close[4:])
        total_interest += lowest * rate / 12
        balance = close[-1]                   # interest is NOT added during the year
    return total_interest, balance + total_interest


def run_ledger(pattern, amount, rate, years):
    """returns [(closing balance after each year)] and the per-year interest list"""
    events = deposits_for(pattern, amount)
    balance = F(0)
    closings, interests = [], []
    for _ in range(years):
        interest, balance = year_ledger(balance, events, rate)
        closings.append(balance)
        interests.append(interest)
    return closings, interests


# ---------------------------------------------------------------------------------------------------------------
# Model B: closed forms
# ---------------------------------------------------------------------------------------------------------------

def closed_form(pattern, amount, rate, n):
    r = F(rate)
    if r == 0:
        return F(amount) * n if pattern == "yearly" else F(amount) * 12 * n
    growth = (1 + r) ** n - 1
    if pattern == "yearly":
        return F(amount) * (1 + r) * growth / r
    return (12 * F(amount) + F(13, 2) * F(amount) * r) * growth / r


def both(pattern, amount, rate_text, years):
    rate = F(rate_text) / 100
    closings, interests = run_ledger(pattern, amount, rate, years)
    for k in range(1, years + 1):
        assert closed_form(pattern, amount, rate, k) == closings[k - 1], (pattern, amount, rate_text, k)
    return closings, interests


def annual_of(pattern, amount):
    return amount * 12 if pattern == "monthly" else amount


# ---------------------------------------------------------------------------------------------------------------
# Rounded-interest variants (information only; the specification records that no official rounding rule was found)
# ---------------------------------------------------------------------------------------------------------------

def rounded_variant(pattern, amount, rate_text, years, mode):
    rate = F(rate_text) / 100
    balance = F(0)
    for _ in range(years):
        opening = balance
        running = opening
        interest = F(0)
        for m in range(12):
            if pattern == "yearly":
                if m == 0:
                    running += amount
            else:
                running += amount
            monthly_interest = running * rate / 12
            interest += half_up(monthly_interest) if mode == "month" else monthly_interest
        if mode == "year":
            interest = half_up(interest)
        balance = running + interest
    return balance


# ---------------------------------------------------------------------------------------------------------------
# Vectors
# ---------------------------------------------------------------------------------------------------------------

def vector(name, pattern, amount, rate_text, years, rows=True):
    closings, interests = both(pattern, amount, rate_text, years)
    annual = annual_of(pattern, amount)
    deposited = annual * years
    balance = closings[-1]
    rounded = half_up(balance)
    frac = balance - balance.__floor__()
    entry = {
        "id": name,
        "pattern": pattern,
        "deposit": amount,
        "rate": rate_text,
        "years": years,
        "annualDeposit": annual,
        "totalDeposited": deposited,
        "balance": dec6(balance),
        "balanceRounded": rounded,
        "interestDisplayed": rounded - deposited,
        "nearHalfBoundary": abs(frac - F(1, 2)) < F(1, 100),
    }
    if rows:
        prev = F(0)
        out = []
        prev_rounded = 0
        for k, (closing, interest) in enumerate(zip(closings, interests), start=1):
            closing_rounded = half_up(closing)
            out.append({
                "year": k,
                "opening": dec6(prev),
                "interest": dec6(interest),
                "closing": dec6(closing),
                "closingRounded": closing_rounded,
                "interestDisplayed": closing_rounded - prev_rounded - annual,
            })
            prev = closing
            prev_rounded = closing_rounded
        entry["rows"] = out
    if annual % 600 == 0 and annual >= 600 and annual <= 150000:
        yc, _ = both("yearly", annual, rate_text, years)
        mc, _ = both("monthly", annual // 12, rate_text, years)
        entry["comparison"] = {
            "eligible": True,
            "yearlyBalance": dec6(yc[-1]),
            "monthlyBalance": dec6(mc[-1]),
            "difference": dec6(yc[-1] - mc[-1]),
            "displayDifference": half_up(yc[-1] - mc[-1]),  # the specification's displayed difference: the exact difference, rounded
            "displayedBalanceGap": half_up(yc[-1]) - half_up(mc[-1]),  # information: the gap between the two DISPLAYED balances (can differ by 1)
        }
    else:
        entry["comparison"] = {"eligible": False}
    return entry


def documented_expectations():
    """values stated in the specification, checked against the two models (a mismatch stops the run)"""
    # one year of 1,50,000 in April at 7.1%: 150000 x 1.071 (checkable by hand)
    c, _ = both("yearly", 150000, "7.1", 1)
    assert c[-1] == F(160650), c[-1]
    # one year of 12,500 a month: 150000 + 12500 x 0.071 x 6.5
    c, _ = both("monthly", 12500, "7.1", 1)
    assert c[-1] == F(150000) + F(12500) * F(71, 1000) * F(13, 2) == F("155768.75")
    # 15-year golden values quoted in the specification (to two decimals, exact value rounded half up)
    c, _ = both("yearly", 150000, "7.1", 15)
    assert dec2(c[-1]) == "4068209.22", dec6(c[-1])
    c, _ = both("monthly", 12500, "7.1", 15)
    assert dec2(c[-1]) == "3944599.22", dec6(c[-1])
    c, _ = both("yearly", 500, "7.1", 15)
    assert dec2(c[-1]) == "13560.70"
    c, _ = both("monthly", 50, "7.1", 15)
    assert dec2(c[-1]) == "15778.40"
    # 16 years and the projections beyond the first term
    c, _ = both("yearly", 150000, "7.1", 16)
    assert dec2(c[-1]) == "4517702.07"
    c, _ = both("monthly", 12500, "7.1", 16)
    assert dec2(c[-1]) == "4380434.52"
    c20, _ = both("yearly", 150000, "7.1", 20)
    c25, _ = both("yearly", 150000, "7.1", 25)
    c30, _ = both("yearly", 150000, "7.1", 30)
    assert dec2(c20[-1]) == "6658288.17"
    assert dec2(c25[-1]) == "10308014.97"
    assert dec2(c30[-1]) == "15450910.59"
    # the annual-versus-monthly difference for the same 1,50,000 a year
    y15, _ = both("yearly", 150000, "7.1", 15)
    m15, _ = both("monthly", 12500, "7.1", 15)
    assert dec6(y15[-1] - m15[-1]).startswith("123609.998")  # 1,23,609.9985
    y16, _ = both("yearly", 150000, "7.1", 16)
    m16, _ = both("monthly", 12500, "7.1", 16)
    assert dec6(y16[-1] - m16[-1]).startswith("137267.558")
    # a deposit dated the 6th does not earn that month; one dated the 5th does (the ledger models the rule itself)
    on5, _ = year_ledger(F(0), [(0, 5, F(1000))], F(12, 100))
    on6, _ = year_ledger(F(0), [(0, 6, F(1000))], F(12, 100))
    assert on5 - on6 == F(1000) * F(12, 100) / 12 and on5 > on6
    # rate 0: balance equals deposits
    z, _ = both("monthly", 600, "0", 7)
    assert z[-1] == F(600) * 12 * 7
    # the late-March reference in the specification: 15 deposits of 1,50,000 on 31 March
    events = deposits_for("march_end", 150000)
    bal = F(0)
    for _ in range(15):
        _, bal = year_ledger(bal, events, F(71, 1000))
    assert dec2(bal) == "3798514.68", dec6(bal)
    return {"marchEnd15": dec6(bal)}


def build():
    reference = documented_expectations()
    vectors = []

    # --- the specification's golden table
    spec_rows = [
        ("spec_yearly_150000_15y", "yearly", 150000, "7.1", 15),
        ("spec_monthly_12500_15y", "monthly", 12500, "7.1", 15),
        ("spec_yearly_500_15y", "yearly", 500, "7.1", 15),
        ("spec_monthly_50_15y", "monthly", 50, "7.1", 15),
        ("spec_yearly_150000_1y", "yearly", 150000, "7.1", 1),
        ("spec_monthly_12500_1y", "monthly", 12500, "7.1", 1),
        ("spec_yearly_150000_16y_default", "yearly", 150000, "7.1", 16),
        ("spec_monthly_12500_16y", "monthly", 12500, "7.1", 16),
        ("spec_yearly_150000_20y", "yearly", 150000, "7.1", 20),
        ("spec_yearly_150000_25y", "yearly", 150000, "7.1", 25),
        ("spec_yearly_150000_30y", "yearly", 150000, "7.1", 30),
    ]
    for row in spec_rows:
        vectors.append(vector(*row))

    # --- boundaries: minimum and maximum deposits, rates 0 and 15, every pattern, endpoint years
    for pattern, amount in (("yearly", 500), ("yearly", 150000), ("monthly", 50), ("monthly", 12500)):
        for rate in ("0", "0.1", "7.1", "15"):
            for years in (1, 16, 50):
                vectors.append(vector(f"bound_{pattern}_{amount}_{rate}_{years}", pattern, amount, rate, years))
    for years in (2, 14, 15, 16, 17, 20, 21, 22, 25, 26, 31, 36, 41, 46, 49, 50):
        vectors.append(vector(f"years_yearly_150000_7.1_{years}", "yearly", 150000, "7.1", years))
        vectors.append(vector(f"years_monthly_12500_7.1_{years}", "monthly", 12500, "7.1", years))

    # --- comparison eligibility: totals that are and are not multiples of 600
    for total in (600, 1200, 60000, 150000, 100000, 500, 550, 149950, 148800):
        vectors.append(vector(f"comparison_yearly_{total}_8.0_16", "yearly", total, "8.0", 16, rows=False))

    # --- a seeded sample over the whole valid input space
    rnd = random.Random(26100001)
    count = 0
    while count < 300:
        pattern = rnd.choice(["yearly", "monthly"])
        amount = rnd.randrange(500, 150001, 50) if pattern == "yearly" else rnd.randrange(50, 12501, 50)
        rate_text = f"{rnd.randrange(0, 151) / 10:.1f}"
        years = rnd.randint(1, 50)
        vectors.append(vector(f"random_{count}", pattern, amount, rate_text, years, rows=(years <= 20)))
        count += 1
    # make sure the half-rupee display boundary is exercised: keep drawing until at least three vectors sit within 0.01 of .5
    near = [v for v in vectors if v["nearHalfBoundary"]]
    extra = 0
    while len(near) < 3 and extra < 20000:
        pattern = rnd.choice(["yearly", "monthly"])
        amount = rnd.randrange(500, 150001, 50) if pattern == "yearly" else rnd.randrange(50, 12501, 50)
        rate_text = f"{rnd.randrange(0, 151) / 10:.1f}"
        years = rnd.randint(1, 50)
        v = vector(f"boundary_search_{extra}", pattern, amount, rate_text, years, rows=False)
        extra += 1
        if v["nearHalfBoundary"]:
            vectors.append(v)
            near.append(v)
    assert len(near) >= 3, "no values near a half-rupee boundary were found"

    # --- rounded-interest variants, information only (specification section 7)
    variants = []
    for pattern, amount in (("yearly", 150000), ("monthly", 12500), ("yearly", 500), ("monthly", 50)):
        exact, _ = both(pattern, amount, "7.1", 15)
        variants.append({
            "pattern": pattern,
            "deposit": amount,
            "rate": "7.1",
            "years": 15,
            "exact": dec6(exact[-1]),
            "yearRounded": int(rounded_variant(pattern, amount, "7.1", 15, "year")),
            "monthRounded": int(rounded_variant(pattern, amount, "7.1", 15, "month")),
        })

    return {
        "meta": META,
        "reference": reference,
        "vectors": vectors,
        "roundedVariants": variants,
    }


def main():
    data = build()
    with open(os.path.join(HERE, "ppf-golden.json"), "w", encoding="utf-8", newline="\n") as fh:
        json.dump(data, fh, ensure_ascii=True, separators=(",", ":"), sort_keys=True)
        fh.write("\n")
    v = data["vectors"]
    print("vectors:", len(v), "with rows:", sum(1 for x in v if "rows" in x),
          "comparison eligible:", sum(1 for x in v if x["comparison"]["eligible"]),
          "near a half-rupee boundary:", sum(1 for x in v if x["nearHalfBoundary"]))


if __name__ == "__main__":
    main()
