"""
Independent reference for the Margin Calculator (Tool Pack 4).

Python `decimal` with 60 digits, written from the DEFINITIONS in the specification, NOT from the JavaScript:

  - profit = price - cost, margin = profit / price, markup = profit / cost, each straight from the definition
  - a price for a TARGET margin or markup is found by an INTEGER SEARCH OVER PAISE (bisection on n, the smallest whole
    number of paise whose margin / markup is at least the target); the closed forms (cost / (1 - m), cost * (1 + k)) are
    then computed separately and asserted to give the same paise
  - every derived price is round-tripped: the margin / markup measured from the paise price must be >= the target and
    the price one paisa lower must be below it
  - cost-change rows: the price that keeps the base margin is again the smallest paisa price whose margin is at least the
    base margin (integer search), asserted equal to price * new cost / cost rounded up; a base margin <= 0 has no margin
    to keep, so the row is the smallest paisa price that covers the new cost
  - a discount: the discounted price is the price * (1 - d) rounded half up to the paisa; the volume multiple is the
    ratio of the profits, and is separately checked by COUNTING units (the smallest n with n * profit_after >=
    1000 * profit_before)

Every assertion must hold before a value is printed. Run:  python tests/fixtures/margin-golden.py
The printed JSON is what tests/unit/margin-golden.test.mjs embeds as GOLDEN.
"""
import json
from decimal import Decimal as D, getcontext, ROUND_CEILING, ROUND_HALF_UP

getcontext().prec = 60
HUNDRED = D(100)


def margin_of(price, cost):
    return (price - cost) / price


def markup_of(price, cost):
    return (price - cost) / cost


def smallest_paise(ok):
    """smallest integer n >= 1 with ok(n / 100) true; ok is monotone in n"""
    lo, hi = 1, 1
    while not ok(D(hi) / 100):
        hi *= 2
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(D(mid) / 100):
            hi = mid
        else:
            lo = mid + 1
    return lo


def price_for_margin(cost, m_percent):
    m = D(m_percent) / 100
    n = smallest_paise(lambda p: margin_of(p, cost) >= m)
    closed = int((cost / (1 - m) * 100).to_integral_value(rounding=ROUND_CEILING))
    assert n == closed, f"margin search {n} != closed form {closed}"
    assert n == 1 or margin_of(D(n - 1) / 100, cost) < m
    return D(n) / 100


def price_for_markup(cost, k_percent):
    k = D(k_percent) / 100
    n = smallest_paise(lambda p: markup_of(p, cost) >= k)
    closed = int((cost * (1 + k) * 100).to_integral_value(rounding=ROUND_CEILING))
    assert n == closed, f"markup search {n} != closed form {closed}"
    assert n == 1 or markup_of(D(n - 1) / 100, cost) < k
    return D(n) / 100


def money(x, places="0.0001"):
    return str(D(x).quantize(D(places)))


def pct(x):
    return str((D(x) * 100).quantize(D("0.000001")))


def keep_price(price, cost, new_cost):
    base = margin_of(price, cost)
    if base > 0:
        n = smallest_paise(lambda p: margin_of(p, new_cost) >= base)
        closed = int((price * new_cost / cost * 100).to_integral_value(rounding=ROUND_CEILING))
        assert n == closed, f"keep search {n} != closed form {closed}"
        return D(n) / 100, "keep"
    n = int((new_cost * 100).to_integral_value(rounding=ROUND_CEILING))
    return D(max(n, 1)) / 100, "cover"


def discount_block(price, cost, d_percent):
    d = D(d_percent)
    if d == 0:
        return None
    price_d = (price * (1 - d / 100)).quantize(D("0.01"), rounding=ROUND_HALF_UP)
    profit = price - cost
    profit_d = price_d - cost
    out = {"percent": str(d_percent), "price": money(price_d), "profit": money(profit_d)}
    out["margin"] = pct(profit_d / price_d) if price_d > 0 else None
    if profit <= 0:
        out["state"] = "base-loss"
    elif profit_d <= 0:
        out["state"] = "none"
    else:
        ratio = profit / profit_d
        need = 0
        # count units: how many sales at the discounted profit replace 1000 sales at the base profit
        lo, hi = 1, 10 ** 12
        while lo < hi:
            mid = (lo + hi) // 2
            if mid * profit_d >= 1000 * profit:
                hi = mid
            else:
                lo = mid + 1
        need = lo
        assert need == int((1000 * ratio).to_integral_value(rounding=ROUND_CEILING)), "counted units != ratio"
        out["state"] = "profit"
        out["volumeMultiple"] = money(ratio, "0.000001")
        out["unitsFor1000"] = need
    return out


def plan(name, cost, basis, value, discount=None):
    cost = D(cost)
    if basis == "price":
        price = D(value)
    elif basis == "margin":
        price = price_for_margin(cost, value)
    else:
        price = price_for_markup(cost, value)
    profit = price - cost
    margin = margin_of(price, cost)
    markup = markup_of(price, cost)
    # margin and markup determine each other
    assert abs(margin - markup / (1 + markup)) < D("1e-40"), f"{name}: margin vs markup"
    if basis == "margin":
        assert margin >= D(value) / 100
    if basis == "markup":
        assert markup >= D(value) / 100
    state = "profit" if profit > 0 else ("zero" if profit == 0 else "loss")
    rows = []
    for change in (-10, -5, 0, 5, 10):
        new_cost = cost * (100 + change) / 100
        kept, kind = keep_price(price, cost, new_cost)
        rows.append({
            "change": change, "cost": money(new_cost, "0.000001"), "margin": pct(margin_of(price, new_cost)),
            "priceToKeep": money(kept), "kind": kind, "priceChange": pct((kept - price) / price),
        })
    out = {
        "input": {"cost": str(cost), "basis": basis, "value": str(value), "discount": None if discount is None else str(discount)},
        "price": money(price), "profit": money(profit), "margin": pct(margin), "markup": pct(markup), "state": state,
        "rows": rows,
    }
    block = None if discount is None else discount_block(price, cost, D(discount))
    if block is not None:
        out["discount"] = block
    return out


S = {}
for name, args in [
    ("A-price", ("600", "price", "800")),
    ("B-margin-40", ("600", "margin", "40")),
    ("C-markup-40", ("600", "markup", "40")),
    ("D-margin-0-boundary", ("1", "margin", "0")),
    ("E-loss", ("800", "price", "700")),
    ("F-cost-limit-margin-95", ("100000000", "margin", "95")),
    ("G-rounding-up", ("333.33", "margin", "35")),
    ("H-smallest-cost", ("0.01", "margin", "50")),
    ("I-markup-limit", ("250", "markup", "1000")),
    ("J-price-equals-cost", ("450", "price", "450")),
    ("K-price-three-decimals", ("100", "price", "123.456")),
    ("L-markup-from-margin-conversion", ("1000", "markup", "25")),
    ("M-awkward-fractions", ("17.77", "markup", "33.33")),
]:
    S[name] = plan(name, *args)

# discounts
for name, args, d in [
    ("N-discount-10", ("600", "price", "800"), "10"),
    ("O-discount-20", ("600", "price", "800"), "20"),
    ("P-discount-removes-profit", ("600", "price", "800"), "25"),
    ("Q-discount-below-cost", ("600", "price", "800"), "30"),
    ("R-discount-40pct-margin-10", ("600", "price", "1000"), "10"),
    ("S-discount-40pct-margin-20", ("600", "price", "1000"), "20"),
    ("T-discount-base-loss", ("800", "price", "700"), "5"),
    ("U-discount-95", ("100", "price", "1000"), "95"),
    ("V-discount-rounding", ("333.33", "margin", "35"), "12.5"),
    ("W-discount-zero-is-none", ("600", "price", "800"), "0"),
    ("X-discount-fractional", ("600", "markup", "50"), "7.5"),
]:
    S[name] = plan(name, *args, discount=d)

# extra independent checks
# 1. margin and markup conversion for the figures quoted in the articles
S["conversion"] = {str(k): pct(D(k) / (100 + D(k))) for k in (10, 25, 50, 100)}
for k, expected in {10: "9.090909", 25: "20.000000", 50: "33.333333", 100: "50.000000"}.items():
    assert S["conversion"][str(k)] == expected
# 2. a target-margin price round trip for several targets
for m in (10, 25, 30, 40, 60, 80, 95):
    p = price_for_margin(D(600), m)
    assert margin_of(p, D(600)) >= D(m) / 100
# 3. the volume multiple rises with the discount and with a lower margin
mult = [discount_block(D(800), D(600), D(d)) for d in (5, 10, 15, 20)]
assert all("volumeMultiple" in x for x in mult)
assert [D(x["volumeMultiple"]) for x in mult] == sorted(D(x["volumeMultiple"]) for x in mult)

# ---- figures quoted in the articles ----------------------------------------------------------------------------------
cost = D(600)
S["articles"] = {
    "priceForMargin": {str(m): money(price_for_margin(cost, m)) for m in (25, 30, 40)},
    "profitForMargin": {str(m): money(price_for_margin(cost, m) - cost) for m in (25, 30, 40)},
    "markupAtMargin": {str(m): pct(markup_of(price_for_margin(cost, m), cost)) for m in (25, 30, 40)},
    "addMarginToCost": {str(m): {"price": money(cost * (1 + D(m) / 100)), "margin": pct(margin_of(cost * (1 + D(m) / 100), cost))} for m in (25, 40)},
    "discountOn800": {str(d): discount_block(D(800), cost, D(d)) for d in (5, 10, 15, 20, 25)},
    "discountOn1000": {str(d): discount_block(D(1000), cost, D(d)) for d in (10, 20, 30)},
    "costRise800": {str(c): {"cost": money(cost * (100 + c) / 100, "0.01"), "margin": pct(margin_of(D(800), cost * (100 + c) / 100)), "keep": money(keep_price(D(800), cost, cost * (100 + c) / 100)[0])} for c in (5, 10)},
}
print(json.dumps(S, indent=2))
