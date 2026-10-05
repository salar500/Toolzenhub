"""
Independent reference for the GST Calculator (Tool Pack 8). Python Fraction / Decimal, whole paise.

It does NOT reuse the JavaScript's integer formulas.

  ADD GST     tax = round_half_up( Fraction(amount) * rate / 100 ) to the paisa           (exact Fraction, then rounded)
  REMOVE GST  the amount before GST is found by a SEARCH over whole paise: the b in [0, total] whose distance
              |b - total * 100 / (100 + rate)| is smallest (exact Fractions), a tie going to the larger b (half up);
              the GST is total - b.  The invariant  before + GST = total  is asserted for every case.

Invoices round ITEM BY ITEM (half up, to the paisa) and then add. The script also measures, over every amount from 0.01
to 2,000.00 at several rates, how often Add then Remove returns the amount that was entered (the page claims only
"usually"), and checks the Remove invariant over the same range with the full search.

Run:  python tests/fixtures/gst-golden.py           (prints JSON; the round trip covers 0.01 to 200.00, a few seconds)
      python tests/fixtures/gst-golden.py --full    (round trip over 0.01 to 2,000.00 at seven rates, about five minutes)
"""
import json
from fractions import Fraction as F
from decimal import Decimal as D, ROUND_HALF_UP


def half_up(x):
    """round a non-negative Fraction to the nearest integer, ties up"""
    return int((x + F(1, 2)).__floor__())


def to_paise(text):
    d = D(text) * 100
    assert d == d.to_integral_value(), text
    return int(d)


def rupees(paise):
    return f"{D(paise) / 100:.2f}"


def rate_fraction(rate):
    return F(D(rate)) / 100               # 18 -> 18/100


def add_item(amount, rate):
    a = to_paise(amount)
    tax = half_up(F(a) * rate_fraction(rate))
    return {"before": a, "gst": tax, "with": a + tax}


def remove_item(total, rate):
    t = to_paise(total) if isinstance(total, str) else total
    exact = F(t) / (1 + rate_fraction(rate))
    # search whole paise around the exact value for the nearest, ties to the larger (half up)
    lo = max(0, int(exact) - 2)
    best = None
    for b in range(lo, min(t, int(exact) + 3) + 1):
        dist = abs(F(b) - exact)
        if best is None or dist < best[0] or (dist == best[0] and b > best[1]):
            best = (dist, b)
    before = best[1]
    gst = t - before
    assert before + gst == t
    return {"before": before, "gst": gst, "with": t}


def share_hundredths(gst, with_):
    """GST as a share of the amount with GST, in hundredths of a percent, half up"""
    if with_ == 0:
        return 0
    return half_up(F(gst) * 10000 / F(with_))


def out(item):
    return {"before": rupees(item["before"]), "gst": rupees(item["gst"]), "with": rupees(item["with"]),
            "sharePercent": f"{D(share_hundredths(item['gst'], item['with'])) / 100:.2f}"}


def invoice(mode, items):
    """items: list of (amount, rate). Item by item, then add; grouped by rate ascending."""
    fn = add_item if mode == "add" else remove_item
    rows = [(rate, fn(amount, rate)) for amount, rate in items]
    groups = {}
    for rate, r in rows:
        key = D(rate).normalize()
        g = groups.setdefault(key, {"before": 0, "gst": 0, "with": 0})
        for k in g:
            g[k] += r[k]
    total = {"before": sum(r["before"] for _, r in rows), "gst": sum(r["gst"] for _, r in rows), "with": sum(r["with"] for _, r in rows)}
    return {
        "mode": mode,
        "items": [{"amount": a, "rate": str(rt), **out(r)} for (a, rt), (_, r) in zip(items, rows)],
        "byRate": [{"rate": format(k, "f"), **out(g)} for k, g in sorted(groups.items())],
        "total": out(total),
    }


SCENARIOS = {
    "A_add_1000_18": invoice("add", [("1000", "18")]),
    "B_remove_1180_18": invoice("remove", [("1180", "18")]),
    "C_remove_1000_18": invoice("remove", [("1000", "18")]),
    "D_add_99.99_5": invoice("add", [("99.99", "5")]),
    "E_add_100.10_5_odd_paisa": invoice("add", [("100.10", "5")]),
    "F_add_1000_0": invoice("add", [("1000", "0")]),
    "F2_remove_1000_0": invoice("remove", [("1000", "0")]),
    "G_add_0.01_18": invoice("add", [("0.01", "18")]),
    "H_remove_0.01_18": invoice("remove", [("0.01", "18")]),
    "I_add_1crore_28": invoice("add", [("10000000", "28")]),
    "J_add_max_28": invoice("add", [("9999999999.99", "28")]),
    "J2_remove_max_28": invoice("remove", [("9999999999.99", "28")]),
    "K_remove_12345.67_12": invoice("remove", [("12345.67", "12")]),
    "P_add_fractional_rate_2.5": invoice("add", [("1000", "2.5")]),
    "P2_add_fractional_rate_0.25": invoice("add", [("333.33", "0.25")]),
    "Q_remove_rate_50": invoice("remove", [("1500", "50")]),
}
INVOICES = {
    "L_add_mixed": invoice("add", [("1000", "5"), ("2000", "18"), ("500", "18")]),
    "M_remove_mixed": invoice("remove", [("1050", "5"), ("2360", "18"), ("590", "18")]),
    "N_three_items_10.10_5": invoice("add", [("10.10", "5")] * 3),
    "O_inherited_rate": invoice("add", [("1000", "18"), ("500", "18")]),     # item 2's blank rate is item 1's 18
    "R_rate_formatting_5_5.0_5.00": invoice("add", [("100", "5"), ("100", "5.0"), ("100", "5.00")]),
    "S_four_rates_sorted": invoice("add", [("100", "18"), ("100", "5"), ("100", "28"), ("100", "12")]),
}
# the same three items taxed ONCE on the grand total, for the rounding-difference note
GRAND_TOTAL_ROUNDING = {
    "itemByItemGst": rupees(sum(add_item("10.10", "5")["gst"] for _ in range(3))),
    "onGrandTotalGst": rupees(half_up(F(to_paise("30.30")) * rate_fraction("5"))),
}


def round_trip(rates, start=1, stop=200000):
    stats = {}
    for rate in rates:
        r = rate_fraction(rate)
        exact_back = 0
        within_one = 0
        invariant_ok = True
        worst = 0
        for a in range(start, stop + 1):
            tax = half_up(F(a) * r)
            total = a + tax
            rem = remove_item(total, rate)
            if rem["before"] + rem["gst"] != total:
                invariant_ok = False
            diff = abs(rem["before"] - a)
            exact_back += diff == 0
            within_one += diff <= 1
            worst = max(worst, diff)
        n = stop - start + 1
        stats[rate] = {"amounts": n, "recoveredExactly": exact_back, "recoveredExactlyPercent": f"{D(exact_back) * 100 / n:.4f}",
                       "withinOnePaise": within_one, "worstDifferencePaise": worst, "removeInvariantHolds": invariant_ok}
    return stats


def full_search_check(rates, upto=3000):
    """Remove mode by a FULL search over every paisa b (no bounded window), compared with the bounded search above"""
    for rate in rates:
        for t in range(1, upto + 1):
            exact = F(t) / (1 + rate_fraction(rate))
            best = None
            for b in range(0, t + 1):
                dist = abs(F(b) - exact)
                if best is None or dist < best[0] or (dist == best[0] and b > best[1]):
                    best = (dist, b)
            assert best[1] == remove_item(t, rate)["before"], (rate, t)
    return True


def articles():
    base = add_item("1000", "18")
    wrong = 118000 - half_up(F(118000) * rate_fraction("18"))        # subtract 18% of the inclusive amount
    mixed = invoice("add", [("1000", "5"), ("2000", "18"), ("500", "18")])
    return {
        "add1000at18": out(base),
        "removeBySubtractingPercent_1180_18": rupees(wrong),
        "shareAt": {r: out(add_item("1000", r))["sharePercent"] for r in ("5", "12", "18", "28")},
        "mixed": mixed,
    }


RATES = ["0", "5", "12", "18", "28", "2.5", "0.25"]

if __name__ == "__main__":
    import sys
    stop = 200000 if "--full" in sys.argv else 20000
    full_search_check(["18", "5", "12.5", "0.25", "50"], 1500)
    print(json.dumps({
        "scenarios": SCENARIOS,
        "invoices": INVOICES,
        "grandTotalRounding": GRAND_TOTAL_ROUNDING,
        "roundTrip": round_trip(RATES, 1, stop),
        "articles": articles(),
    }, indent=1))
