"""
Independent reference for the Home Loan Calculator (Tool Pack 6).

Python `decimal` with 80 digits, written from the MODEL in the specification, NOT from the JavaScript:

  - the loan that fits an EMI room B is found by SIMULATING the repayment month by month
    (balance = balance * (1 + r) - B, with r = annual rate / 12 / 100, one payment at the end of each month) and searching whole
    rupees for the LARGEST principal whose balance is cleared (<= 0) after n months of paying B; the closed form
    floor(B * ((1 + r)^n - 1) / (r * (1 + r)^n)) (floor(B * n) at 0%) is then computed separately and asserted equal
  - one rupee more is checked NOT to be repaid (its balance after n months is above zero)
  - the EMI of the found loan is computed from the formula and cross-checked by simulating that loan with that payment (the
    balance ends at zero to within 1e-40), then total repaid = EMI * n and total interest = total repaid - loan
  - the tenure rows repeat the same search for each tenure with the same room
  - the existing-EMI share is existing EMIs / income

Every assertion must hold before a value is printed. Run:  python tests/fixtures/home-loan-golden.py
The printed JSON is what tests/unit/home-loan-golden.test.mjs embeds as GOLDEN.
"""
import json
from decimal import Decimal as D, getcontext, ROUND_FLOOR

getcontext().prec = 80
STANDARD_TENURES = (10, 15, 20, 25, 30)


def final_balance(principal, rate, months, payment):
    r = D(rate) / 12 / 100
    balance = D(principal)
    for _ in range(months):
        balance = balance * (1 + r) - payment
    return balance


def largest_loan(room, rate, years):
    """largest whole-rupee principal repaid within the tenure by paying `room` every month"""
    n = years * 12
    if room <= 0:
        return 0
    lo, hi = 0, 1
    while final_balance(hi, rate, n, room) <= 0:
        hi *= 2
    while lo < hi - 1:
        mid = (lo + hi) // 2
        if final_balance(mid, rate, n, room) <= 0:
            lo = mid
        else:
            hi = mid
    assert final_balance(lo, rate, n, room) <= 0 and final_balance(lo + 1, rate, n, room) > 0, "not the largest loan"
    r = D(rate) / 12 / 100
    closed = int((room * n).to_integral_value(rounding=ROUND_FLOOR)) if r == 0 else int(
        (room * ((1 + r) ** n - 1) / (r * (1 + r) ** n)).to_integral_value(rounding=ROUND_FLOOR))
    assert lo == closed, f"search {lo} != closed form {closed}"
    return lo


def emi_of(principal, rate, years):
    r = D(rate) / 12 / 100
    n = years * 12
    p = D(principal)
    if p == 0:
        return D(0)
    e = p / n if r == 0 else p * r * (1 + r) ** n / ((1 + r) ** n - 1)
    # cross-check by simulation: paying this EMI clears the loan to zero
    assert abs(final_balance(p, rate, n, e)) < D("1e-40") * max(D(1), p), "simulated EMI does not clear the loan"
    return e


def money(x, places="0.0001"):
    return str(D(x).quantize(D(places)))


def pct(x):
    return str((D(x) * 100).quantize(D("0.000001")))


def row_for(room, rate, years):
    loan = largest_loan(room, rate, years)
    e = emi_of(loan, rate, years)
    repaid = e * years * 12
    assert e <= room, "the EMI is above the room"
    return {"years": years, "loan": loan, "emi": money(e), "repaid": money(repaid), "interest": money(repaid - loan)}


def plan(name, income, existing, share, rate, years, own=None):
    income, existing, share = D(income), D(existing), D(share)
    capacity = income * share / 100
    room = max(D(0), capacity - existing)
    main = row_for(room, rate, years)
    tenures = sorted(set(STANDARD_TENURES) | {years})
    rows = []
    for t in tenures:
        r = row_for(room, rate, t)
        rows.append({"years": t, "loan": r["loan"], "interest": r["interest"], "repaid": r["repaid"], "yours": t == years})
    # a longer tenure never gives a smaller loan
    assert all(rows[i]["loan"] <= rows[i + 1]["loan"] for i in range(len(rows) - 1))
    out = {
        "input": {"income": str(income), "existing": str(existing), "share": str(share), "rate": str(rate), "years": years,
                  "own": None if own is None else str(own)},
        "capacity": money(capacity), "room": money(room), "loan": main["loan"], "emi": main["emi"], "repaid": main["repaid"],
        "interest": main["interest"], "existingShare": pct(existing / income), "noRoom": room == 0,
        "property": None if own is None else money(D(main["loan"]) + D(own)),
        "tenureRows": rows,
    }
    return out


S = {}
for name, args in [
    ("A-defaults", ("100000", "0", "40", "8.5", 20)),
    ("B-existing-and-own-funds", ("100000", "10000", "40", "8.5", 20, "500000")),
    ("C-existing-above-capacity", ("50000", "25000", "40", "8.5", 20)),
    ("D-room-exactly-zero", ("50000", "20000", "40", "8.5", 20)),
    ("E-zero-rate", ("100000", "10000", "40", "0", 20)),
    ("F-thirty-years", ("100000", "10000", "40", "8.5", 30)),
    ("G-one-year", ("100000", "10000", "40", "8.5", 1)),
    ("H-tiny-room", ("1000", "0", "5", "30", 1)),
    ("I-large", ("10000000", "500000", "90", "6.75", 30)),
    ("J-paise-room", ("87654.32", "1234.56", "37.5", "9.25", 15)),
    ("K-custom-tenure-18", ("100000", "10000", "40", "8.5", 18)),
    ("L-existing-above-income", ("10000", "20000", "40", "8.5", 20)),
    ("M-zero-rate-thirty-years", ("60000", "0", "50", "0", 30)),
    ("N-smallest-income-smallest-share", ("1000", "0", "1", "8.5", 20)),
    ("O-own-funds-zero", ("100000", "10000", "40", "8.5", 20, "0")),
    ("P-high-rate-high-share", ("250000", "0", "90", "30", 30)),
    ("Q-fraction-of-a-rupee", ("33333.33", "0", "33.3", "7.35", 25)),
]:
    S[name] = plan(name, *args)

# extra independent checks
a, b = S["A-defaults"], S["B-existing-and-own-funds"]
assert a["loan"] == 4609233 and b["loan"] == 3456925
assert S["E-zero-rate"]["interest"] == money(0) and S["E-zero-rate"]["loan"] == 7200000
assert S["C-existing-above-capacity"]["loan"] == 0 and S["D-room-exactly-zero"]["loan"] == 0
assert S["L-existing-above-income"]["noRoom"] and S["L-existing-above-income"]["existingShare"] == "200.000000"
# a loan one rupee bigger would need an EMI above the room (checked directly, not through the search)
for k in ("A-defaults", "B-existing-and-own-funds", "J-paise-room", "K-custom-tenure-18"):
    s = S[k]
    room = D(s["room"])
    years = s["input"]["years"]
    assert emi_of(s["loan"], s["input"]["rate"], years) <= room < emi_of(s["loan"] + 1, s["input"]["rate"], years)

# ---- figures quoted in the articles ----------------------------------------------------------------------------------
room30 = D(30000)
def at(rate, years, r=room30): return largest_loan(r, rate, years)
tenures = {str(t): row_for(room30, "8.5", t) for t in STANDARD_TENURES}
rates = {r: at(r, 20) for r in ("7.5", "8.5", "9.5", "10.5")}
t10, t20, t30 = tenures["10"], tenures["20"], tenures["30"]
S["articles"] = {
    "example": {"income": 100000, "share": 40, "capacity": 40000, "existing": 10000, "room": 30000, "rate": "8.5", "years": 20,
                "loan": b["loan"], "emi": b["emi"], "own": 500000, "property": b["property"]},
    "noExisting": {"room": 40000, "loan": a["loan"]},
    "existingEffect": {"without": a["loan"], "with": b["loan"], "difference": a["loan"] - b["loan"]},
    "tenures": tenures,
    "tenureChange": {
        "loan10to30": pct(D(t30["loan"]) / D(t10["loan"]) - 1), "interest10to30Times": str((D(t30["interest"]) / D(t10["interest"])).quantize(D("0.01"))),
        "loan20to30": pct(D(t30["loan"]) / D(t20["loan"]) - 1), "interest20to30": pct(D(t30["interest"]) / D(t20["interest"]) - 1),
    },
    "rates": {r: v for r, v in rates.items()},
    "rateSteps": {"7.5to8.5": rates["7.5"] - rates["8.5"], "8.5to9.5": rates["8.5"] - rates["9.5"], "9.5to10.5": rates["9.5"] - rates["10.5"]},
    "incomeSplit": {"existing": 10000, "newEmiRoom": 30000, "rest": 100000 - 10000 - 30000},
}
print(json.dumps(S, indent=2))
