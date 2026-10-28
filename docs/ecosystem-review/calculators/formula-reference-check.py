"""
Calculators Ecosystem 2.0: independent reference values (Stage 1, research only).

STATUS: PROPOSED, NOT APPROVED FOR IMPLEMENTATION. Not part of the application or of any test run.

Standard library only (decimal, datetime). Every figure is computed from the mathematical definition at
50 significant digits, never from ToolZenHub code. Stage 2 can copy these cases into golden-value tests,
and a Stage 3 oracle can reuse the functions.

    python docs/ecosystem-review/calculators/formula-reference-check.py
"""
from datetime import date
from decimal import Decimal as D, getcontext, ROUND_HALF_UP

getcontext().prec = 50


def money(x):
    return x.quantize(D("0.01"), rounding=ROUND_HALF_UP)


# ---------------------------------------------------------------- EMI (reducing balance, payments at month end)
def emi(p, annual_pct, months):
    r = D(annual_pct) / 12 / 100
    p = D(p)
    if r == 0:
        return p / months
    f = (1 + r) ** months
    return p * r * f / (f - 1)


def schedule(p, annual_pct, months):
    """Unrounded schedule: (interest, principal_part, balance) per month."""
    r = D(annual_pct) / 12 / 100
    e = emi(p, annual_pct, months)
    bal = D(p)
    rows = []
    for _ in range(months):
        interest = bal * r
        princ = e - interest
        bal -= princ
        rows.append((interest, princ, bal))
    return e, rows


def months_for(p, annual_pct, e):
    """n such that emi(p, r, n) = e (real number of months): n = -ln(1 - P r / E) / ln(1 + r)."""
    r = D(annual_pct) / 12 / 100
    return -(1 - D(p) * r / D(e)).ln() / (1 + r).ln()


def rate_for(p, months, e):
    """Monthly rate by bisection so that emi = e; returns the ANNUAL percentage."""
    lo, hi = D("0"), D("1")  # monthly rate 0..100%
    for _ in range(200):
        mid = (lo + hi) / 2
        if emi(p, mid * 12 * 100, months) > D(e):
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2 * 12 * 100


# ---------------------------------------------------------------- SIP (two published conventions)
def sip_value(monthly, annual_pct, months, convention):
    if convention == "annual/12":
        i = D(annual_pct) / 12 / 100
    else:  # "effective": the annual rate is an effective yearly rate
        i = (1 + D(annual_pct) / 100) ** (D(1) / 12) - 1
    return D(monthly) * (((1 + i) ** months - 1) / i) * (1 + i)  # instalments at the start of each month


# ---------------------------------------------------------------- inflation
def real_value(nominal, inflation_pct, years):
    return D(nominal) / (1 + D(inflation_pct) / 100) ** D(years)


# ---------------------------------------------------------------- XIRR (Actual/365, the Excel/LibreOffice definition)
def xnpv(rate, flows):
    d0 = flows[0][0]
    return sum(D(a) / (1 + rate) ** (D((d - d0).days) / 365) for d, a in flows)


def xirr(flows):
    lo, hi = D("-0.9999"), D("100")
    flo = xnpv(lo, flows)
    for _ in range(300):
        mid = (lo + hi) / 2
        fm = xnpv(mid, flows)
        if (fm > 0) == (flo > 0):
            lo, flo = mid, fm
        else:
            hi = mid
    return (lo + hi) / 2


# ---------------------------------------------------------------- RD (one published bank convention; others differ)
def rd_bank(monthly, annual_pct, months):
    """Quarterly compounding annuity form: M = R ((1+i)^n - 1) / (1 - (1+i)^(-1/3)), i = rate/400, n = quarters."""
    i = D(annual_pct) / 400
    n = D(months) / 3
    return D(monthly) * ((1 + i) ** n - 1) / (1 - (1 + i) ** (D(-1) / 3))


def rd_monthly_sum(monthly, annual_pct, months):
    """Each instalment compounded for its own remaining time at the quarterly rate with a fractional exponent
    (equal to the annuity form). Bank conventions that use simple interest within a quarter give other figures."""
    i = D(annual_pct) / 400
    total = D(0)
    for k in range(months):
        remaining = months - k
        total += D(monthly) * (1 + i) ** (D(remaining) / 3)
    return total


# ---------------------------------------------------------------- simple and compound interest
def compound(p, annual_pct, years, per_year):
    return D(p) * (1 + D(annual_pct) / 100 / per_year) ** (D(years) * per_year)


if __name__ == "__main__":
    print("EMI 10,00,000 at 8.5% for 20 y      :", money(emi(1_000_000, "8.5", 240)))
    print("EMI 1,00,00,000 at 10% for 10 y     :", money(emi(10_000_000, "10", 120)), "(a competitor page claims 132,150.74)")
    print("EMI zero rate 1,20,000 over 12 mo   :", money(emi(120_000, "0", 12)))
    e, rows = schedule(1_000_000, "8.5", 240)
    print("  month 1 interest / principal      :", money(rows[0][0]), money(rows[0][1]))
    print("  balance after 12 payments         :", money(rows[11][2]))
    print("  final balance (must be ~0)        :", abs(rows[-1][2]) < D("1e-30"))
    print("  total interest                    :", money(e * 240 - 1_000_000))
    print("Months to clear 10,00,000 at 9% with EMI 15,000 :", money(months_for(1_000_000, "9", 15000)), "(real months; whole payments = ceil)")
    print("Annual rate for 10,00,000, 240 mo, EMI 9,000    :", round(rate_for(1_000_000, 240, 9000), 6), "%")
    print("SIP 1,000 x 12 mo at 12%: annual/12             :", money(sip_value(1000, "12", 12, "annual/12")))
    print("SIP 1,000 x 12 mo at 12%: effective monthly     :", money(sip_value(1000, "12", 12, "effective")), "(a competitor guide claims about 12,766)")
    print("SIP 5,000 x 120 mo at 12%: annual/12            :", money(sip_value(5000, "12", 120, "annual/12")))
    print("Real value of 1,00,00,000 after 20 y at 6%      :", money(real_value(10_000_000, "6", 20)))
    flows = [(date(2023, 1, 1), -100000), (date(2023, 7, 1), -50000), (date(2024, 3, 31), 20000), (date(2025, 1, 1), 170000)]
    r = xirr(flows)
    print("XIRR example (Actual/365)                       :", round(r * 100, 6), "%  residual", abs(xnpv(r, flows)) < D("1e-20"))
    print("RD 5,000 x 24 mo at 6.5%: annuity form          :", money(rd_bank(5000, "6.5", 24)))
    print("RD 5,000 x 24 mo at 6.5%: per-instalment sum    :", money(rd_monthly_sum(5000, "6.5", 24)), "(algebraically identical to the annuity form; banks that use simple interest inside a quarter differ)")
    print("Compound 1,00,000 at 8% 5 y quarterly           :", money(compound(100000, "8", 5, 4)))
    print("Simple 1,00,000 at 8% 5 y                       :", money(D(100000) * (1 + D("0.08") * 5)))
    # Values used by requirements FR-INF-003/004, FR-XIRR-009/010/011 (added after the first run)
    print("Year-20 withdrawal 1,00,000 in today's money, 6% inflation :", money(D(100000) / (D("1.06") ** 19)))
    print("Return after inflation, 12% and 6%                         :", round(((1 + D("0.12")) / (1 + D("0.06")) - 1) * 100, 4), "%")
    two_flow = [(date(2020, 1, 1), -100000), (date(2025, 1, 1), 200000)]
    print("XIRR two flows (1,827 days) vs 2^(365/1827)-1              :", round(xirr(two_flow) * 100, 6), "%", round((D(2) ** (D(365) / D(1827)) - 1) * 100, 6), "%")
    multi = [(date(2023, 1, 1), -1000), (date(2024, 1, 1), 2300), (date(2024, 12, 31), -1320)]
    print("Two-root flows on days 0, 365, 730: NPV at 10% and 20% (both should be 0.00)")
    print("   NPV@10%:", money(xnpv(D("0.10"), multi)), " NPV@20%:", money(xnpv(D("0.20"), multi)))
