"""
Independent reference for the SWP Calculator (Tool Pack 21).

Python `decimal` with 60 digits, written from the MODEL in the specification (docs/tool-packs/21-swp-calculator.md),
NOT from the JavaScript. Three separate methods must agree before a value is printed:

  1. SIMULATION: the corpus is run forward period by period. A withdrawal is taken at the START of the period,
     then the rest grows by the period return i = (1 + r)^(1/m) - 1 (i = 0 at r = 0). The withdrawal is raised once
     a year: year k pays W * (1 + s)^(k - 1). A withdrawal the balance cannot cover (within TOL, half a paisa) is the
     last, PARTIAL one.
  2. PRESENT VALUE: the corpus that N withdrawals use up is W * F, F = sum over p of a_p * v^(p-1), v = 1 / (1 + i).
     For whole years F also has a closed form, F = A * S with A = sum of v^k (k < m) and S = sum of q^y (y < Y),
     q = (1 + s) / (1 + r); the two are asserted equal. The number of full withdrawals in Mode A is asserted equal to
     the largest N with W * F(N) <= C + TOL.
  3. BISECTION: the first withdrawal that a corpus supports over N periods is found WITHOUT the factor, by bisection
     on W against an unclamped forward run (its final balance falls as W rises), then compared with C / F.

Run:  python tests/fixtures/swp-golden.py
The printed JSON is what tests/unit/swp-golden.test.mjs embeds as GOLDEN; its "articles" block holds the figures
quoted in the two SWP articles and is what tests/unit/swp-articles.test.mjs embeds as REF.
"""
import json
from decimal import Decimal as D, getcontext

getcontext().prec = 60
TOL = D("0.005")
HORIZON_YEARS = 50


def period_return(rate_pct, m):
    r = D(rate_pct) / 100
    return D(0) if r == 0 else (1 + r) ** (D(1) / m) - 1


def factor(s_pct, m, p):
    """the yearly-increase factor of withdrawal p (1-based): once per year, not per period"""
    return (1 + D(s_pct) / 100) ** ((p - 1) // m)


def run(corpus, w, rate, m, s, periods):
    """forward simulation; returns the summary and the yearly rows"""
    i = period_return(rate, m)
    bal, full, withdrawn, growth, partial, used_up = D(corpus), 0, D(0), D(0), D(0), False
    rows, y_w, y_g = [], D(0), D(0)
    for p in range(1, periods + 1):
        due = D(w) * factor(s, m, p)
        if bal < due - TOL:
            partial = bal if bal > TOL else D(0)
            withdrawn += partial
            y_w += partial
            bal, used_up = D(0), True
            if partial > 0 or (p - 1) % m != 0:  # no empty row for a year that never started
                rows.append((((p - 1) // m) + 1, y_w, y_g, bal))
            break
        after = bal - due
        if after < TOL:
            after = D(0)
        g = after * i
        bal = after + g
        withdrawn += due
        growth += g
        y_w += due
        y_g += g
        full += 1
        if p % m == 0:
            rows.append((p // m, y_w, y_g, bal))
            y_w = y_g = D(0)
    return dict(full=full, partial=partial, withdrawn=withdrawn, growth=growth, ending=bal, used_up=used_up), rows


def pv_factor(rate, m, n, s):
    i = period_return(rate, m)
    v = 1 / (1 + i)
    return sum(factor(s, m, p) * v ** (p - 1) for p in range(1, n + 1))


def pv_closed(rate, m, years, s):
    i = period_return(rate, m)
    v = 1 / (1 + i)
    q = (1 + D(s) / 100) / (1 + D(rate) / 100)
    return sum(v ** k for k in range(m)) * sum(q ** y for y in range(years))


def unclamped_end(corpus, w, rate, m, s, n):
    """final balance if every one of n withdrawals is taken, even below zero (linear and falling in w)"""
    i = period_return(rate, m)
    bal = D(corpus)
    for p in range(1, n + 1):
        bal = (bal - D(w) * factor(s, m, p)) * (1 + i)
    return bal


def bisect_withdrawal(corpus, rate, m, s, n):
    lo, hi = D(0), D(corpus)
    for _ in range(220):
        mid = (lo + hi) / 2
        if unclamped_end(corpus, mid, rate, m, s, n) > 0:
            lo = mid
        else:
            hi = mid
    return hi


def state_of(res, n_max):
    if res["full"] == 0:
        return "first-exceeds"
    if res["full"] == n_max:
        return "not-used-up" if res["ending"] > TOL else "used-up-at-horizon"
    return "used-up"


def q4(x):
    return str(x.quantize(D("0.0001")))


def mode_a(label, corpus, w, rate, m, s, with_rows=False):
    n_max = HORIZON_YEARS * m
    res, rows = run(corpus, w, rate, m, s, n_max)
    # method 2: the largest N whose present value the corpus covers
    n_pv = 0
    for n in range(1, n_max + 1):
        if D(w) * pv_factor(rate, m, n, s) <= D(corpus) + TOL:
            n_pv = n
        else:
            break
    assert n_pv == res["full"], (label, n_pv, res["full"])
    # conservation: corpus - withdrawn + growth = ending
    assert abs(D(corpus) - res["withdrawn"] + res["growth"] - res["ending"]) < D("1e-6"), label
    out = {
        "input": {"corpus": corpus, "withdrawal": w, "rate": str(rate), "m": m, "increase": str(s)},
        "full": res["full"],
        "months": res["full"] * 12 // m,
        "state": state_of(res, n_max),
        "partial": q4(res["partial"]),
        "withdrawn": q4(res["withdrawn"]),
        "growth": q4(res["growth"]),
        "ending": q4(res["ending"]),
        "rowCount": len(rows),
    }
    if with_rows:
        out["rows"] = [[y, q4(a), q4(b), q4(c)] for (y, a, b, c) in rows]
    return label, out


def mode_bc(label, corpus, w_for_c, rate, m, years, s):
    n = years * m
    f = pv_factor(rate, m, n, s)
    assert abs(f - pv_closed(rate, m, years, s)) < D("1e-40"), (label, "closed form")
    w_b = D(corpus) / f
    assert abs(bisect_withdrawal(corpus, rate, m, s, n) - w_b) < D("1e-30"), (label, "bisection")
    res, rows = run(corpus, w_b, rate, m, s, n)
    assert res["full"] == n and res["ending"] == 0 and not res["used_up"], (label, res["full"])
    c_needed = D(w_for_c) * f
    last_year_w = w_b * (1 + D(s) / 100) ** (years - 1)
    return label, {
        "input": {"corpus": corpus, "withdrawalForC": w_for_c, "rate": str(rate), "m": m, "years": years, "increase": str(s)},
        "F": str(f.quantize(D("0.000001"))),
        "B": {
            "withdrawal": q4(w_b),
            "withdrawn": q4(res["withdrawn"]),
            "growth": q4(res["growth"]),
            "finalYearWithdrawal": q4(last_year_w),
        },
        "C": {"corpus": q4(c_needed)},
    }


A = [
    mode_a("A1", 10000000, 80000, 8, 12, 0, True),
    mode_a("A1-6", 10000000, 80000, 6, 12, 0),
    mode_a("A1-10", 10000000, 80000, 10, 12, 0),
    mode_a("A2", 1200000, 10000, 0, 12, 0),
    mode_a("A3", 10000000, 30000, 10, 12, 0),
    mode_a("A4", 10000000, 50000, 8, 12, 5, True),
    mode_a("A5", 50000, 60000, 8, 12, 0, True),
    mode_a("A6", 10000000, 100, 8, 12, 0),
    mode_a("A7", 5000000, 100000, 7, 4, 0, True),
    mode_a("A8", 8000000, 600000, 7, 1, 3, True),
    mode_a("A9", 6000000, 10000, 0, 12, 0),
    mode_a("A10", 100000, 100000, 8, 12, 0),
    mode_a("R-low", 10000000, 74859, 8, 12, 0),
    mode_a("R-high", 10000000, 74860, 8, 12, 0),
]

BC = [
    mode_bc("B1", 10000000, 50000, 8, 12, 25, 0),
    mode_bc("B2", 10000000, 50000, 8, 12, 25, 5),
    mode_bc("B3", 10000000, 50000, 7, 1, 20, 3),
    mode_bc("B4", 10000000, 50000, 0, 12, 1, 0),
    mode_bc("B5", 10000000, 50000, 0, 12, 50, 0),
    mode_bc("B6", 10000000, 50000, 6, 4, 30, 2),
    mode_bc("B7", 10000000, 50000, 12, 12, 10, 0),
    mode_bc("B-6", 10000000, 50000, 6, 12, 25, 0),
    mode_bc("B-10", 10000000, 50000, 10, 12, 25, 0),
]

def article_figures():
    """
    The figures quoted in the two SWP articles (Tool Pack 21 content pack), from the SAME three methods as above.
    Baseline of both articles: Rs 1 crore, Rs 80,000 a month, 8% a year (effective), no yearly increase.
    """
    corpus, w, rate, m = 10000000, 80000, 8, 12
    i = period_return(rate, m)

    # one period, as drawn in article 1: withdraw first, then the remainder grows by one period return
    remaining = D(corpus) - w
    growth = remaining * i
    closing = remaining + growth
    # the level at which one period's growth exactly replaces the withdrawal: (C - W)(1 + i) = C
    threshold = D(corpus) * i / (1 + i)
    assert abs((D(corpus) - threshold) * (1 + i) - D(corpus)) < D("1e-40"), "threshold"

    # the same plan seen as the three questions (article 1): A = how long, B = how much, C = what corpus
    _, bc = mode_bc("ART", corpus, w, rate, m, 25, 0)
    total_withdrawn_25y = D(w) * 25 * 12
    corpus_needed_up = D(int(D(bc["C"]["corpus"]).to_integral_value(rounding="ROUND_CEILING")))
    growth_supplied = total_withdrawn_25y - corpus_needed_up

    def a(label, c, wd, r, s):
        _, out = mode_a(label, c, wd, r, 12, s)
        return out

    sens = {
        "base": a("base", corpus, 80000, 8, 0),
        "return6": a("return6", corpus, 80000, 6, 0),
        "return9": a("return9", corpus, 80000, 9, 0),
        "return10": a("return10", corpus, 80000, 10, 0),
        "withdraw90k": a("withdraw90k", corpus, 90000, 8, 0),
        "withdraw70k": a("withdraw70k", corpus, 70000, 8, 0),
        "withdraw66k": a("withdraw66k", corpus, 66000, 8, 0),
        "withdraw65k": a("withdraw65k", corpus, 65000, 8, 0),
        "withdraw60k": a("withdraw60k", corpus, 60000, 8, 0),
        "increase3": a("increase3", corpus, 80000, 8, 3),
        "increase5": a("increase5", corpus, 80000, 8, 5),
    }
    return {
        "baseline": {"corpus": corpus, "withdrawal": w, "rate": rate},
        "monthlyReturnPercent": str((i * 100).quantize(D("0.0001"))),
        "period": {"opening": q4(D(corpus)), "withdrawal": q4(D(w)), "remaining": q4(remaining),
                   "growth": q4(growth), "closing": q4(closing)},
        "threshold": q4(threshold),
        "questions": {
            "B_withdrawalFor25y": q4(D(bc["B"]["withdrawal"])),
            "C_corpusFor25y": q4(D(bc["C"]["corpus"])),
            "C_totalWithdrawn": q4(total_withdrawn_25y),
            "C_growthSupplied": q4(growth_supplied),
            "C_growthShare": str((growth_supplied / total_withdrawn_25y * 100).quantize(D("0.01"))),
        },
        "sensitivity": sens,
        "increase5_year10_monthly": q4(D(w) * factor(5, 12, 109)),
        "increase3_year2_monthly": q4(D(w) * factor(3, 12, 13)),
    }


if __name__ == "__main__":
    print(json.dumps({"A": dict(A), "BC": dict(BC), "articles": article_figures(),
                      "monthlyReturn8": str(period_return(8, 12)), "quarterlyReturn7": str(period_return(7, 4)),
                      "monthlyReturn12": str(period_return(12, 12))}, indent=1))
