"""
Independent reference for the CAGR Calculator (Tool Pack 9). Python decimal, 70 digits.

It does NOT use the JavaScript's power. For a start S, an end E and m months, the growth rate g satisfies

    (1 + g) ** (m / 12) = E / S        which is the same as        (1 + g) ** m = (E / S) ** 12

and the second form has only INTEGER powers. g is found by BISECTION on that equation to 40 digits (so no fractional
power and no logarithm is used to find it). It is then cross-checked against a separate derivation,
    g = exp( ln(E / S) * 12 / m ) - 1,
and against the exactly representable cases (100 to 121 over 24 months is exactly 10%).

Displayed percentages are rounded to two decimals with ROUND_HALF_UP (a tie goes away from zero), the rule the page uses.
The script also prints the exact-tie cases (100000 to 100125 over 12 months is exactly 0.125%) and the figures quoted
in the articles.

Run:  python tests/fixtures/cagr-golden.py    (prints JSON: scenarios, comparisons, article figures)
"""
import json
from decimal import Decimal as D, getcontext, ROUND_HALF_UP

getcontext().prec = 70


def bisect_growth(start, end, months):
    """g such that (1 + g) ** months == (end / start) ** 12, by bisection on whole integer powers"""
    ratio12 = (D(end) / D(start)) ** 12
    lo, hi = D(-1), D(1)
    while (1 + hi) ** months < ratio12:             # widen until the answer is bracketed
        hi *= 2
    for _ in range(300):                            # 300 halvings of a width of at most 2**k: far beyond 40 digits
        mid = (lo + hi) / 2
        if (1 + mid) ** months < ratio12:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2


def via_logs(start, end, months):
    return (D(end) / D(start)).ln() * 12 / D(months)


def growth(start, end, months):
    g = bisect_growth(start, end, months)
    g2 = via_logs(start, end, months).exp() - 1
    assert abs(g - g2) < D("1e-40"), (start, end, months, g, g2)
    # the bisection leaves a residue of about 1e-70; rounding to 30 places makes exact cases exact (0 stays 0, an exact
    # tie such as 0.125 per cent stays a tie) without touching any other figure
    g = g.quantize(D("1e-30"))
    return g if g != 0 else D(0)


def pct2(x):
    """a fraction as a percentage string to two decimals, half up (ties away from zero)"""
    out = (x * 100).quantize(D("0.01"), rounding=ROUND_HALF_UP)
    return "0.00" if out == 0 else str(out)       # never "-0.00"


def row(start, end, months):
    g = growth(start, end, months)
    t = D(months) / 12
    total = D(end) / D(start) - 1
    simple = total / t
    multiple = D(end) / D(start)
    return {
        "start": str(start), "end": str(end), "months": months,
        "cagrPercent": f"{g * 100:.12f}", "cagrDisplay": pct2(g),
        "totalGrowthPercent": f"{total * 100:.12f}", "totalGrowthDisplay": pct2(total),
        "multiple": f"{multiple:.12f}", "multipleDisplay": str(multiple.quantize(D("0.01"), rounding=ROUND_HALF_UP)),
        "simpleYearlyPercent": f"{simple * 100:.12f}", "simpleYearlyDisplay": pct2(simple),
    }


SCENARIOS = {
    "A_default": row("100000", "180000", 60),
    "B_second_case": row("100000", "240000", 108),
    "C_exact_10pc": row("100", "121", 24),
    "D_no_change": row("100000", "100000", 60),
    "E_loss": row("100000", "50000", 36),
    "F_shortest_period": row("100000", "101000", 12),
    "G_months": row("100000", "150000", 42),
    "H_looking_ahead": row("500000", "10000000", 180),
    "J_largest_ratio_one_year": row("1", "1000", 12),
    "K_longest_period": row("100000", "100001", 600),
    "L_smallest_ratio_one_year": row("1000", "1", 12),
    "M_tie_up": row("100000", "100125", 12),          # exactly 0.125 per cent: half up shows 0.13
    "M2_tie_down": row("100000", "99875", 12),        # exactly -0.125 per cent: away from zero shows -0.13
    "N_paise": row("12345.67", "23456.78", 66),
    "O_long_flat": row("100000", "100000", 600),
    "P_halving_over_a_year": row("100000", "50000", 12),
    "Q_tiny_amounts": row("0.01", "0.02", 12),
}


def compare(a, b):
    ra, rb = row(*a), row(*b)
    def d(key, digits="0.0001"):
        return f"{D(rb[key]) - D(ra[key]):.8f}"
    return {
        "A": ra, "B": rb,
        "difference": {
            "cagrPoints": d("cagrPercent"), "totalGrowthPoints": d("totalGrowthPercent"),
            "multiple": d("multiple"), "simpleYearlyPoints": d("simpleYearlyPercent"),
            "start": f"{D(b[0]) - D(a[0]):.2f}", "end": f"{D(b[1]) - D(a[1]):.2f}", "months": b[2] - a[2],
        },
    }


COMPARISONS = {
    "L_two_cases": compare(("100000", "180000", 60), ("100000", "240000", 108)),
    "M_inherit_start_and_period": compare(("100000", "180000", 60), ("100000", "240000", 60)),
    "N_identical": compare(("100000", "180000", 60), ("100000", "180000", 60)),
    "R_different_starts": compare(("100000", "180000", 60), ("250000", "400000", 84)),
}


def articles():
    g = growth("100000", "180000", 60)
    step = 1 + g
    return {
        "default": SCENARIOS["A_default"],
        "stepMultiplierA": f"{step:.8f}",
        "caseB": SCENARIOS["B_second_case"],
        "stepMultiplierB": f"{1 + growth('100000', '240000', 108):.8f}",
        "fiveStepsCompound": f"{step ** 5:.8f}",            # reaches 1.8 exactly
        "fiveAdditiveSixteens": f"{1 + D('0.16') * 5:.8f}",  # the simple shortcut also reaches 1.8, additively
        "compoundingSixteenFiveYears": f"{D('1.16') ** 5:.8f}",   # what compounding the simple 16 per cent would give
        "comparison": COMPARISONS["L_two_cases"],
    }


if __name__ == "__main__":
    print(json.dumps({"scenarios": SCENARIOS, "comparisons": COMPARISONS, "articles": articles()}, indent=1))
