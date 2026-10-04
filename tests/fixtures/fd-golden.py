"""
Independent reference for the FD Calculator (Tool Pack 7). Python decimal, 80 digits.

It does NOT use the JavaScript's closed form to find a maturity. The deposit is SIMULATED period by period:

    for each COMPLETED compounding period:  balance = balance + balance * i
    then, for the remaining q months of a broken period (ToolZenHub's explicit convention, not a universal bank rule):
        balance = balance + balance * i * q / periodLength        (simple interest, pro rata)

The effective annual yield is found by GROWING one year of periods one at a time (balance 1 -> after m periods), not
with a power. The closed forms (P(1+i)^k(1+i q/L), (1+i)^m - 1) are computed separately and asserted equal, so a wrong
formula and a wrong simulation cannot agree by accident.

Run:  python tests/fixtures/fd-golden.py    (prints JSON: scenarios, comparisons, the figures quoted in the articles)
"""
import json
from decimal import Decimal as D, getcontext

getcontext().prec = 80

PERIODS = {"monthly": 12, "quarterly": 4, "half-yearly": 2, "yearly": 1}


def simulate(principal, rate, months, comp):
    m = PERIODS[comp]
    length = 12 // m                       # months in one compounding period
    i = D(rate) / D(100) / D(m)            # rate per period
    k, q = divmod(months, length)          # completed periods, months left over
    balance = D(principal)
    for _ in range(k):
        balance += balance * i             # interest is added, and itself earns interest
    if q:
        balance += balance * i * D(q) / D(length)
    # the closed form, asserted equal to the simulation (a different route to the same number)
    closed = D(principal) * (1 + i) ** k * (1 + i * D(q) / D(length))
    assert abs(balance - closed) < D("1e-50"), (principal, rate, months, comp, balance, closed)
    return balance, k, q


def effective_yield(rate, comp):
    m = PERIODS[comp]
    i = D(rate) / D(100) / D(m)
    growth = D(1)
    for _ in range(m):                     # one year of compounding periods, one at a time
        growth += growth * i
    assert abs((growth - 1) - ((1 + i) ** m - 1)) < D("1e-50")
    return growth - 1


def row(principal, rate, months, comp):
    maturity, k, q = simulate(principal, rate, months, comp)
    interest = maturity - D(principal)
    return {
        "principal": str(principal), "rate": str(rate), "months": months, "compounding": comp,
        "completedPeriods": k, "remainingMonths": q,
        "maturity": f"{maturity:.8f}", "interest": f"{interest:.8f}",
        "effectiveYieldPercent": f"{effective_yield(rate, comp) * 100:.8f}",
        "totalGrowthPercent": f"{interest / D(principal) * 100:.8f}",
    }


def compare(principal, comp, a_rate, a_months, b_rate, b_months):
    a = row(principal, a_rate, a_months, comp)
    b = row(principal, b_rate, b_months, comp)
    diff = {
        "maturity": f"{D(b['maturity']) - D(a['maturity']):.8f}",
        "interest": f"{D(b['interest']) - D(a['interest']):.8f}",
        "effectiveYieldPoints": f"{D(b['effectiveYieldPercent']) - D(a['effectiveYieldPercent']):.8f}",
        "months": b_months - a_months,
        "likeForLike": a_months == b_months,
    }
    return {"A": a, "B": b, "difference": diff}


SCENARIOS = {
    "A_default_quarterly": row(100000, "7", 60, "quarterly"),
    "B_monthly": row(100000, "7", 60, "monthly"),
    "C_half_yearly": row(100000, "7", 60, "half-yearly"),
    "D_yearly": row(100000, "7", 60, "yearly"),
    "E_exact_period_3y_monthly": row(100000, "7", 36, "monthly"),
    "E2_exact_period_2y_yearly": row(100000, "7", 24, "yearly"),
    "E3_exact_period_1y_yearly": row(100000, "7", 12, "yearly"),
    "F_partial_14m_quarterly": row(100000, "7", 14, "quarterly"),
    "F2_partial_18m_yearly": row(100000, "7", 18, "yearly"),
    "F3_under_one_period_2m_quarterly": row(100000, "7", 2, "quarterly"),
    "G_zero_rate": row(100000, "0", 60, "quarterly"),
    "H_smallest_amount_1m": row(1000, "7", 1, "quarterly"),
    "I_largest_amount_20pc_30y_monthly": row(100000000, "20", 360, "monthly"),
    "J_shortest_tenure_1m_monthly": row(100000, "7", 1, "monthly"),
    "K_longest_tenure_360m_quarterly": row(100000, "7", 360, "quarterly"),
    "L_fraction_rate_6_85": row(250000, "6.85", 42, "half-yearly"),
    "M_paise_principal": row("12345.67", "7.25", 27, "monthly"),
    "N_max_rate_20_yearly_1m": row(1000, "20", 1, "yearly"),
}

COMPARISONS = {
    "same_tenure_L": compare(100000, "quarterly", "7", 60, "7.4", 60),
    "different_tenure_M": compare(100000, "quarterly", "7.1", 36, "6.8", 60),
    "identical_terms": compare(100000, "quarterly", "7", 60, "7", 60),
    "same_rate_longer_tenure": compare(100000, "quarterly", "7", 36, "7", 60),
}


def articles():
    base = {c: row(100000, "7", 60, c) for c in PERIODS}
    mon = D(base["monthly"]["maturity"]); yr = D(base["yearly"]["maturity"])
    q = D(base["quarterly"]["maturity"]); hy = D(base["half-yearly"]["maturity"])
    up = row(100000, "7.4", 60, "quarterly")
    diff = compare(100000, "quarterly", "7.1", 36, "6.8", 60)
    like = compare(100000, "quarterly", "7.1", 60, "6.8", 60)       # both for the same 5 years
    return {
        "frequency": {c: base[c] for c in PERIODS},
        "monthlyMinusYearly": f"{mon - yr:.8f}",
        "quarterlyMinusYearly": f"{q - yr:.8f}",
        "halfYearlyMinusYearly": f"{hy - yr:.8f}",
        "rate74Quarterly": up,
        "rate74MinusRate7Quarterly": f"{D(up['maturity']) - q:.8f}",
        "comparison": diff,
        "sameFiveYears": like,
    }


if __name__ == "__main__":
    print(json.dumps({"scenarios": SCENARIOS, "comparisons": COMPARISONS, "articles": articles()}, indent=1))
