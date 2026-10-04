"""
Independent reference for the SIP Calculator (Tool Pack 3).

Python `decimal` with 60 digits, written from the MODEL in the specification, NOT from the JavaScript:

  - the plan is SIMULATED month by month:  balance = (balance + payment) * (1 + i),  i = annual rate / 12 / 100,
    each payment made at the START of the month, the value read at the END of the last month
  - the yearly step-up raises the monthly payment at months 13, 25, 37, ... (the payment is multiplied by 1 + s/100)
  - total invested is the sum of the individual payments
  - where a closed form exists (no step-up) it is computed separately and asserted equal to the simulation
  - the required starting SIP for a target is found WITHOUT using linearity: bisection on the starting payment, the
    simulation run for every guess, then checked against T / (value of a 1-rupee plan)
  - the yearly rows come from the same simulation, read at the end of each year (or of the last month)

Every assertion must hold before a value is printed. Run:  python tests/fixtures/sip-golden.py
The printed JSON is what tests/unit/sip-golden.test.mjs embeds as GOLDEN.
"""
import json
from decimal import Decimal as D, getcontext

getcontext().prec = 60


def simulate(P, rate, months, step=0):
    """returns (final value, total invested, yearly rows, last monthly payment)"""
    i = D(rate) / 12 / 100
    bal = D(0)
    invested = D(0)
    pay = D(P)
    rows = []
    for m in range(1, months + 1):
        if m > 1 and (m - 1) % 12 == 0:
            pay = pay * (1 + D(step) / 100)
        bal = (bal + pay) * (1 + i)
        invested += pay
        if m % 12 == 0 or m == months:
            year = (m - 1) // 12 + 1
            rows.append({"year": year, "months": m - (year - 1) * 12, "monthlySip": pay, "invested": invested, "value": bal})
    return bal, invested, rows, pay


def closed_form(P, rate, months):
    i = D(rate) / 12 / 100
    if i == 0:
        return D(P) * months
    return D(P) * ((1 + i) ** months - 1) / i * (1 + i)


def required_start(target, rate, months, step):
    """bisection on the starting payment, the simulation for every guess (no linearity assumed)"""
    lo, hi = D(0), D(target)  # a payment equal to the target already overshoots for any n >= 1 and rate >= 0
    for _ in range(200):
        mid = (lo + hi) / 2
        value = simulate(mid, rate, months, step)[0]
        if value >= D(target):
            hi = mid
        else:
            lo = mid
    return hi


def money(x):
    return str(D(x).quantize(D("0.0001")))


def scenario_rates(rate):
    r = D(rate)
    out = []
    lower = max(D(0), r - 2)
    higher = min(D(30), r + 2)
    if lower != r:
        out.append(("lower", lower))
    out.append(("assumed", r))
    if higher != r:
        out.append(("higher", higher))
    return out


def plan(name, P, rate, months, step=0, target=None, with_yearly=False):
    value, invested, rows, last = simulate(P, rate, months, step)
    if step == 0:
        assert abs(value - closed_form(P, rate, months)) < D("1e-40"), f"{name}: simulation differs from the closed form"
    out = {
        "input": {"monthlySip": P, "annualReturn": str(rate), "months": months, "stepUp": str(step), "target": target},
        "invested": money(invested), "value": money(value), "growth": money(value - invested),
        "finalMonthlySip": money(last),
        "scenarios": [{"key": k, "rate": str(r), "value": money(simulate(P, r, months, step)[0])} for k, r in scenario_rates(rate)],
    }
    if target is not None:
        need = required_start(target, rate, months, step)
        unit = simulate(1, rate, months, step)[0]
        assert abs(need - D(target) / unit) < D("1e-20"), f"{name}: required SIP disagrees with target / unit value"
        assert abs(simulate(need, rate, months, step)[0] - D(target)) < D("1e-15"), f"{name}: required SIP does not reach the target"
        out["target"] = {"amount": target, "reached": value >= D(target), "difference": money(value - D(target)), "requiredStartingSip": money(need)}
    if with_yearly:
        assert rows[-1]["value"] == value and rows[-1]["invested"] == invested, f"{name}: the last row must equal the result"
        out["yearly"] = [{"year": r["year"], "months": r["months"], "monthlySip": money(r["monthlySip"]), "invested": money(r["invested"]), "value": money(r["value"])} for r in rows]
    return out


S = {}
for name, args, kw in [
    ("A-ordinary-15y", (10000, "10", 180), {"target": 10000000, "with_yearly": True}),
    ("B-zero-return-10y", (5000, "0", 120), {"with_yearly": True}),
    ("C-short-12-months", (5000, "8", 12), {"with_yearly": True}),
    ("D-one-month", (10000, "10", 1), {"with_yearly": True}),
    ("E-high-return-10y", (10000, "30", 120), {}),
    ("F-long-40y", (1000, "10", 480), {}),
    ("G-stepup-10pct-15y", (10000, "10", 180), {"step": 10, "target": 10000000, "with_yearly": True}),
    ("H-stepup-5pct-20y", (10000, "10", 240), {"step": 5}),
    ("I-target-reached", (50000, "12", 240), {"target": 10000000}),
    ("J-partial-year-18-months", (10000, "10", 18), {"step": 10, "with_yearly": True}),
    ("K-11-months", (10000, "10", 11), {"with_yearly": True}),
    ("L-stepup-50pct-5y", (1000, "10", 60), {"step": 50, "with_yearly": True}),
    ("M-return-1pct", (10000, "1", 60), {}),
    ("N-return-29pct", (10000, "29", 60), {}),
    ("O-return-30pct", (10000, "30", 60), {}),
    ("P-small-amount", (100, "10", 12), {}),
    ("Q-large-amount", (1000000, "30", 480), {}),
    ("R-target-just-met", (10000, "10", 180), {"target": 4179242}),
]:
    kw = dict(kw)
    step = kw.pop("step", 0)
    S[name] = plan(name, *args, step=step, **kw)

# a few extra independent checks
# 1. the value is linear in the starting payment (checked by two simulations, not assumed by the engine)
v1 = simulate(1, "10", 180, 10)[0]
v2 = simulate(10000, "10", 180, 10)[0]
assert abs(v2 - 10000 * v1) < D("1e-40")
# 2. a step-up of 0 equals the plain plan; 0% equals the sum of the payments
assert simulate(7000, "9", 100, 0)[0] == simulate(7000, "9", 100, D(0))[0]
assert simulate(2500, "0", 50, 0)[0] == D(2500) * 50
# 3. the monthly payments of a stepped plan, year by year
pays = [simulate(10000, "10", 12 * y, 10)[3] for y in (1, 2, 3, 15)]
assert [money(p) for p in pays] == ["10000.0000", "11000.0000", "12100.0000", money(D(10000) * D("1.1") ** 14)]

# ---- figures quoted in the articles ----------------------------------------------------------------------------------
v, inv, rows, _ = simulate(10000, "10", 180, 0)
cross = next(r["year"] for r in rows if r["value"] - r["invested"] > r["invested"])
final_three = rows[-1]["value"] - rows[-4]["value"]
S["articles"] = {
    "growthExceedsInvestmentYear": cross,
    "year": {str(r["year"]): {"invested": money(r["invested"]), "value": money(r["value"]), "growth": money(r["value"] - r["invested"])} for r in rows if r["year"] in (1, 5, 10, 15)},
    "lastThreeYearsAddToValue": money(final_three),
    "lastThreeYearsShare": str((final_three / v * 100).quantize(D("0.01"))),
    "stepUpCompare15y": {s: {"invested": money(simulate(10000, "10", 180, s)[1]), "value": money(simulate(10000, "10", 180, s)[0]), "finalMonthlySip": money(simulate(10000, "10", 180, s)[3])} for s in (0, 5, 10)},
    "targetByReturn": {str(r): money(required_start(10000000, r, 180, 0)) for r in ("8", "10", "12")},
    "targetValueByReturn": {str(r): money(simulate(10000, r, 180, 0)[0]) for r in ("8", "10", "12")},
}
print(json.dumps(S, indent=2))
