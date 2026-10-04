"""
Independent reference for the Profit Calculator (Tool Pack 5).

Python `decimal` with 60 digits, written from the DEFINITIONS in the specification, NOT from the JavaScript:

  - profit is revenue minus variable costs minus fixed costs, each straight from the definition
  - the BREAK-EVEN units and the units for a TARGET profit are found by an INTEGER SEARCH over whole units (bisection on n,
    the smallest n whose profit reaches the goal); the closed forms ceil(F / c) and ceil((F + T) / c) are then computed
    separately and asserted to give the same n; the profit one unit fewer is checked to be below the goal
  - when the contribution (price - variable cost) is zero or negative no number of units reaches a positive goal: this is
    shown by checking the profit at a very large number of units rather than by a formula
  - every what-if row is recomputed FROM SCRATCH with the one changed input (price, variable cost, units or fixed costs
    moved by -10% or +10%), the changed quantity of units rounded to the nearest whole unit (half up)
  - the margin of safety is the units sold minus the break-even units, and its share is that over the units sold

Every assertion must hold before a value is printed. Run:  python tests/fixtures/profit-golden.py
The printed JSON is what tests/unit/profit-golden.test.mjs embeds as GOLDEN.
"""
import json
from decimal import Decimal as D, getcontext, ROUND_CEILING, ROUND_HALF_UP

getcontext().prec = 60
HUGE = D(10) ** 18


def profit(price, var, fixed, units):
    revenue = price * units
    variable_costs = var * units
    return revenue - variable_costs - fixed


def smallest_units(price, var, fixed, goal):
    """smallest whole n >= 0 with profit(n) >= goal; None if no number of units can reach it"""
    if price - var <= 0:
        # a non-positive contribution: more units never cover the fixed costs, whatever they are (even at none)
        assert profit(price, var, fixed, HUGE) <= profit(price, var, fixed, D(0)), "a non-positive contribution never gains"
        return None
    if profit(price, var, fixed, D(0)) >= goal:
        return D(0)
    lo, hi = 0, 1
    while profit(price, var, fixed, D(hi)) < goal:
        hi *= 2
    while lo < hi:
        mid = (lo + hi) // 2
        if profit(price, var, fixed, D(mid)) >= goal:
            hi = mid
        else:
            lo = mid + 1
    n = D(lo)
    assert profit(price, var, fixed, n) >= goal
    assert n == 0 or profit(price, var, fixed, n - 1) < goal
    closed = ((fixed + goal) / (price - var)).to_integral_value(rounding=ROUND_CEILING)
    assert n == max(closed, D(0)), f"search {n} != closed form {closed}"
    return n


def money(x, places="0.0001"):
    return str(D(x).quantize(D(places)))


def pct(x):
    return None if x is None else str((D(x) * 100).quantize(D("0.000001")))


def whole(x):
    return int(x)


def what_if(price, var, fixed, units, base_profit):
    rows = [{"key": "base", "change": 0, "value": None, "profit": money(base_profit), "delta": money(0), "breakEven": None}]
    be0 = smallest_units(price, var, fixed, D(0))
    rows[0]["breakEven"] = None if be0 is None else whole(be0)
    for key, label in (("price", "Selling price"), ("variable", "Variable cost"), ("units", "Units sold"), ("fixed", "Fixed costs")):
        for change in (-10, 10):
            p, v, f, q = price, var, fixed, units
            if key == "price":
                p = price * (100 + change) / 100
                value = p
            elif key == "variable":
                v = var * (100 + change) / 100
                value = v
            elif key == "units":
                q = (units * (100 + change) / 100).quantize(D(1), rounding=ROUND_HALF_UP)
                value = q
            else:
                f = fixed * (100 + change) / 100
                value = f
            pr = profit(p, v, f, q)
            be = smallest_units(p, v, f, D(0))
            rows.append({"key": key, "change": change, "value": money(value, "0.000001"), "profit": money(pr),
                         "delta": money(pr - base_profit), "breakEven": None if be is None else whole(be)})
    return rows


def plan(name, price, var, fixed, units, target=None):
    price, var, fixed, units = D(price), D(var), D(fixed), D(units)
    contribution = price - var
    revenue = price * units
    variable_costs = var * units
    pr = profit(price, var, fixed, units)
    assert pr == contribution * units - fixed
    be = smallest_units(price, var, fixed, D(0))
    out = {
        "input": {"price": str(price), "variableCost": str(var), "fixedCosts": str(fixed), "units": str(units), "target": None if target is None else str(target)},
        "contribution": money(contribution), "revenue": money(revenue), "variableCosts": money(variable_costs), "profit": money(pr),
        "profitShare": pct(pr / revenue) if revenue > 0 else None,
        "breakEvenUnits": None if be is None else whole(be),
        "breakEvenRevenue": None if be is None else money(price * be),
    }
    if be is None:
        out["position"] = None
    else:
        diff = units - be
        out["position"] = {"state": "above" if diff > 0 else ("at" if diff == 0 else "short"), "units": whole(abs(diff)),
                           "shareOfUnitsSold": pct(diff / units) if units > 0 else None}
    if target is not None:
        t = D(target)
        tu = smallest_units(price, var, fixed, t)
        block = {"units": None if tu is None else whole(tu), "revenue": None if tu is None else money(price * tu)}
        if tu is None:
            block["additional"] = None
            block["reached"] = False
        else:
            block["additional"] = whole(max(tu - units, D(0)))
            block["reached"] = bool(pr >= t)
            assert block["reached"] == (units >= tu)
        out["target"] = block
    out["whatIf"] = what_if(price, var, fixed, units, pr)
    return out


S = {}
for name, args in [
    ("A-default", ("800", "600", "50000", "400", "100000")),
    ("B-loss", ("800", "600", "50000", "200")),
    ("C-exact-break-even", ("800", "600", "50000", "250")),
    ("D-rounds-up", ("730", "600", "50000", "500")),
    ("E-zero-contribution", ("600", "600", "50000", "400", "10000")),
    ("E2-negative-contribution", ("500", "600", "50000", "400", "10000")),
    ("F-zero-fixed-costs", ("800", "600", "0", "100", "5000")),
    ("G-zero-units", ("800", "600", "50000", "0", "20000")),
    ("H-tiny-contribution", ("0.01", "0", "100000000", "1000")),
    ("I-large", ("1000000", "400000", "500000000", "5000", "900000000")),
    ("J-service-no-variable-cost", ("2000", "0", "60000", "40", "50000")),
    ("K-target-already-reached", ("800", "600", "50000", "1000", "100000")),
    ("L-target-equals-profit", ("800", "600", "50000", "400", "30000")),
    ("M-units-half-rounding", ("800", "600", "50000", "95")),
    ("N-one-unit", ("800", "600", "0", "1", "100")),
    ("O-fractional-money", ("99.99", "45.55", "12345.67", "321", "1000.5")),
    ("P-no-variable-cost-no-fixed", ("10", "0", "0", "0")),
    ("Q-target-with-zero-fixed", ("800", "600", "0", "100", "1")),
]:
    S[name] = plan(name, *args)

# extra independent checks
# 1. profit is linear in units with slope = contribution
a = S["A-default"]
assert D(a["profit"]) == D(200) * 400 - 50000
# 2. the profit at the break-even units is not negative and one unit fewer is negative (when fixed costs are positive)
for k in ("A-default", "D-rounds-up", "J-service-no-variable-cost", "I-large"):
    s = S[k]
    price, var, fixed = D(s["input"]["price"]), D(s["input"]["variableCost"]), D(s["input"]["fixedCosts"])
    n = D(s["breakEvenUnits"])
    assert profit(price, var, fixed, n) >= 0 and profit(price, var, fixed, n - 1) < 0
# 3. break-even does not depend on the units sold
assert S["A-default"]["breakEvenUnits"] == S["B-loss"]["breakEvenUnits"] == S["C-exact-break-even"]["breakEvenUnits"] == 250
# 4. the what-if rows of the default case match the hand calculation
rows = {(r["key"], r["change"]): r for r in S["A-default"]["whatIf"]}
assert rows[("price", 10)]["profit"] == money(62000) and rows[("price", -10)]["profit"] == money(-2000)
assert rows[("variable", 10)]["profit"] == money(6000) and rows[("variable", -10)]["profit"] == money(54000)
assert rows[("units", 10)]["profit"] == money(38000) and rows[("units", -10)]["profit"] == money(22000)
assert rows[("fixed", 10)]["profit"] == money(25000) and rows[("fixed", -10)]["profit"] == money(35000)

# ---- figures quoted in the articles ----------------------------------------------------------------------------------
P, V, F, Q = D(800), D(600), D(50000), D(400)
S["articles"] = {
    "contribution": money(P - V),
    "breakEven": {"units": whole(smallest_units(P, V, F, D(0))), "revenue": money(P * smallest_units(P, V, F, D(0)))},
    "roundingExample": {"contribution": money(D(730) - V), "fixedOverContribution": money(F / (D(730) - V), "0.1"), "units": whole(smallest_units(D(730), V, F, D(0)))},
    "targets": {str(t): {"units": whole(smallest_units(P, V, F, D(t))), "revenue": money(P * smallest_units(P, V, F, D(t)))} for t in (50000, 100000, 200000)},
    "profitAt400": money(profit(P, V, F, Q)),
    "levers": {f"{k}{c:+d}": {"profit": r["profit"], "delta": r["delta"], "breakEven": r["breakEven"], "value": r["value"]} for (k, c), r in rows.items() if k != "base"},
}
print(json.dumps(S, indent=2))
