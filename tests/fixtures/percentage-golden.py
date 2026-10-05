"""
Independent reference for the Percentage Calculator (Tool Pack 10). Python fractions.Fraction: every value is an exact rational.

The page's relationship is   end = start * (100 + p) / 100   with p a percentage change. Any two of start, p and end give the third:

    end   = start * (100 + p) / 100
    p     = (end / start - 1) * 100
    start = end * 100 / (100 + p)

and the change that undoes p is   u = -100 * p / (100 + p).   An optional second change q is taken of the ending value:
    end2 = end * (100 + q) / 100,   net = (end2 / start - 1) * 100,   plain sum = p + q.

This script does NOT copy the JavaScript (which parses to integer hundredths and does BigInt numerator / denominator arithmetic). It
  - computes every case with Fraction from the decimal strings;
  - re-derives the solved start / end by EXHAUSTIVE SEARCH over the whole-hundredths grid for small ranges (the nearest grid value to the
    exact answer is the half-up rounding of it), and re-derives the solved change by searching the hundredths of a percent;
  - asserts the invariants: forward then reverse returns the start exactly; applying the undoing change returns the start exactly; the
    two-change net agrees with the direct final / start ratio; the undoing change of the undoing change is the original change;
  - rounds every DISPLAYED figure to two decimals half up, a tie going AWAY from zero (ROUND_HALF_UP), never "-0.00";
  - checks the supported ranges on the EXACT value before any rounding: a value is 0.01 to 1,00,00,00,000; a change is -99.99 to 10,00,000.

Run:  python tests/fixtures/percentage-golden.py    (prints JSON: scenarios, rounding ties, ranges, article figures)
"""
import json
from fractions import Fraction as F

VALUE_MIN, VALUE_MAX = F(1, 100), F(1000000000)
CHANGE_MIN, CHANGE_MAX = F(-9999, 100), F(1000000)


def rnd(x):
    """two decimals, half up (a tie goes away from zero), as a string; never '-0.00'"""
    scaled = x * 100
    sign = -1 if scaled < 0 else 1
    n = abs(scaled)
    whole = n.numerator // n.denominator
    rest = n - whole
    if rest * 2 >= 1:
        whole += 1
    if whole == 0:
        return "0.00"
    s = str(whole).rjust(3, "0")
    return ("-" if sign < 0 else "") + s[:-2] + "." + s[-2:]


def in_value_range(x):
    return VALUE_MIN <= x <= VALUE_MAX


def in_change_range(x):
    return CHANGE_MIN <= x <= CHANGE_MAX


def end_of(s, p):
    return s * (100 + p) / 100


def change_of(s, e):
    return (e / s - 1) * 100


def start_of(e, p):
    return e * 100 / (100 + p)


def undo_of(p):
    return -100 * p / (100 + p)


def scenario(start=None, change=None, end=None, second=None):
    """exactly two of start / change / end are given (strings); the third is solved. Returns the displayed figures."""
    s = F(start) if start is not None else None
    p = F(change) if change is not None else None
    e = F(end) if end is not None else None
    given = [x is not None for x in (s, p, e)]
    assert sum(given) == 2
    for x in (s, e):
        if x is not None:
            assert in_value_range(x), "input out of range"
    if p is not None:
        assert in_change_range(p), "input out of range"
    if e is None:
        solves, solved = "end", end_of(s, p)
        ok = in_value_range(solved)
        e = solved
    elif p is None:
        solves, solved = "change", change_of(s, e)
        ok = in_change_range(solved)
        p = solved
    else:
        solves, solved = "start", start_of(e, p)
        ok = in_value_range(solved)
        s = solved
    inputs = {"start": start or "", "change": change or "", "end": end or "", "second": second or ""}
    out = {"inputs": inputs, "solves": solves, "exact": f"{solved.numerator}/{solved.denominator}", "outOfRange": not ok}
    if not ok:
        return out
    out[solves] = rnd(solved)
    out["start"], out["change"], out["end"] = rnd(s), rnd(p), rnd(e)
    out["amount"] = rnd(e - s)
    out["endPercentOfStart"] = rnd(e / s * 100)
    out["undo"] = rnd(undo_of(p))
    # invariants on exact values
    assert end_of(s, p) == e and start_of(e, p) == s
    assert s * (100 + undo_of(p)) / 100 * (100 + p) / 100 == s  # (1 + p)(1 + u) = 1
    assert end_of(e, undo_of(p)) == s
    assert undo_of(undo_of(p)) == p
    if second is not None:
        q = F(second)
        assert in_change_range(q)
        e2 = end_of(e, q)
        net = change_of(s, e2)
        assert (100 + p) * (100 + q) / 100 - 100 == net  # the net agrees with the factor
        out["second"] = {
            "q": rnd(q),
            "end2": rnd(e2),
            "end2OutOfRange": not in_value_range(e2),
            "net": rnd(net),
            "plainSum": rnd(p + q),
        }
    return out


def nearest(x, floor_h):
    """the whole-hundredths candidate nearest to x, searched over a window of 7 candidates around it (a tie goes to the larger magnitude)"""
    centre = int((x * 100).__floor__())
    window = range(max(centre - 3, floor_h), centre + 4)
    return min(window, key=lambda c: (abs(F(c, 100) - x), -abs(c)))


def grid_search_checks():
    """exhaustive checks on small grids: the nearest whole-hundredths candidate to the exact answer is its rounding"""
    # solved END: every start 0.01 .. 2.00, a spread of changes
    changes = [F(x, 100) for x in (-9999, -5000, -2000, -1250, -50, -1, 0, 1, 50, 1250, 2000, 10000, 123456)]
    for h in range(1, 201):
        s = F(h, 100)
        for p in changes:
            e = end_of(s, p)
            if not in_value_range(e):
                continue
            best = nearest(e, 0)  # ties: the larger (away from zero)
            assert F(best, 100) == F(rnd(e)), (h, p)
    # solved START: ends 0.01 .. 2.00
    for h in range(1, 201):
        e = F(h, 100)
        for p in changes:
            s = start_of(e, p)
            if not in_value_range(s):
                continue
            best = nearest(s, 0)
            assert F(best, 100) == F(rnd(s)), (h, p)
    # solved CHANGE: starts and ends 1 .. 60 (whole), by searching the hundredths of a percent
    for s in range(1, 61):
        for e in range(1, 61):
            p = change_of(F(s), F(e))
            if not in_change_range(p):
                continue
            best = nearest(p, -10**6)
            assert F(best, 100) == F(rnd(p)), (s, e)


def main():
    scenarios = {
        "A_forward_up": scenario(start="2000", change="20"),
        "B_forward_down": scenario(start="2000", change="-20"),
        "C_forward_zero": scenario(start="2000", change="0"),
        "D_change_up": scenario(start="2000", end="2400"),
        "E_change_down": scenario(start="2400", end="2000"),
        "F_change_equal": scenario(start="1250", end="1250"),
        "G_reverse_start": scenario(change="20", end="2400"),
        "H_reverse_start_fall": scenario(change="-20", end="1600"),
        "I_reverse_18": scenario(change="18", end="118"),
        "J_fractional": scenario(start="80", change="-12.5"),
        "K_extreme_undo": scenario(start="100", change="-99.99"),
        "L_solved_start_below_min": scenario(change="1000000", end="0.01"),
        "M_large_reverse": scenario(change="10000", end="99999999.99"),
        "N_chain_20_down20": scenario(start="100000", change="20", second="-20"),
        "O_chain_down20_up25": scenario(start="100000", change="-20", second="25"),
        "P_chain_two_rises": scenario(start="5000", change="10", second="10"),
        "Q_chain_from_solved_start": scenario(change="20", end="120000", second="-20"),
        "R_chain_second_out_of_range": scenario(start="900000000", change="10", second="10"),
        "S_solved_end_above_max": scenario(start="999999999", change="10"),
        "T_solved_change_at_upper": scenario(start="1", end="10001"),
        "U_solved_change_above_upper": scenario(start="1", end="10001.01"),
        "V_solved_change_below_lower": scenario(start="1000", end="0.01"),
        "W_solved_change_at_lower": scenario(start="100", end="0.01"),
        "X_tie_up": scenario(start="1", change="0.5"),
        "Y_tie_down": scenario(start="1", change="-0.5"),
        "Z_change_tie_up": scenario(start="10000", end="10000.5"),
        "Z2_change_tie_down": scenario(start="10000", end="9999.5"),
        "Z3_no_negative_zero": scenario(start="100000", end="99999.99"),
        "Z4_min_values": scenario(start="0.01", change="0"),
        "Z5_max_start_zero_change": scenario(start="1000000000", change="0"),
        "Z6_solved_start_at_min": scenario(change="-50", end="0.01"),
    }
    grid_search_checks()
    article = {
        "a1_up": scenario(start="100", change="20"),
        "a1_down": scenario(start="120", change="-20"),
        "a1_chain": scenario(start="100", change="20", second="-20"),
        "a1_undo_20": undo_of(F(20)),
        "a2_reverse": scenario(change="20", end="2400"),
        "a2_wrong_subtract": rnd(F(2400) - F(2400) * 20 / 100),
        "a2_gst_like": scenario(change="18", end="118"),
        "a3_points": {"from": "5", "to": "7", "points": rnd(F(7) - F(5)), "percent": rnd(change_of(F(5), F(7)))},
    }
    article["a1_undo_20"] = rnd(article["a1_undo_20"])
    print(json.dumps({"scenarios": scenarios, "article": article}, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
