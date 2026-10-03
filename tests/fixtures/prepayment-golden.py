"""
Independent reference for the Loan Prepayment Calculator's golden values.

This is NOT the product code and shares nothing with it. It recomputes every scenario with Python's
decimal module (60 digits) in two ways that must agree before a value is printed:

  1. closed-form mathematics (annuity formulas and logarithms);
  2. a month-by-month simulation of the loan.

Model (the standard reducing-balance loan; the same model as assets/js/calculators/formulas/loan.js):
  i       monthly rate = annual rate / 12 / 100
  n       remaining monthly payments, EMI paid at the end of each month
  EMI     = P i (1+i)^n / ((1+i)^n - 1)
  B_k     balance after k EMIs = P (1+i)^k - EMI ((1+i)^k - 1) / i
  A prepayment L is applied immediately after EMI number k (k = 0: before the next EMI), so the balance
  becomes B' = B_k - L. If L >= B_k the loan is cleared at that point (only B_k is needed).
  Outcome A (keep EMI): the EMI stays; months after the prepayment m = ceil(-ln(1 - B' i / EMI) / ln(1+i)),
      the last payment is the remaining balance plus its interest.
  Outcome B (reduce EMI): the end date stays; EMI' = B' i (1+i)^(n-k) / ((1+i)^(n-k) - 1).

Run:  python tests/fixtures/prepayment-golden.py        (prints JSON used by tests/unit/prepayment-golden.test.mjs)
"""
import json
from decimal import Decimal as D, getcontext, ROUND_HALF_UP

getcontext().prec = 60

SCENARIOS = {
    # name: (balance, annual rate %, remaining months, prepayment, after EMI number)
    "normal-now":        (2500000, "8.5", 180, 300000, 0),
    "normal-after-24":   (2500000, "8.5", 180, 300000, 24),
    "normal-after-60":   (2500000, "8.5", 180, 300000, 60),
    "normal-after-120":  (2500000, "8.5", 180, 300000, 120),
    "small":             (2500000, "8.5", 180, 25000, 12),
    "large":             (2500000, "8.5", 180, 1500000, 36),
    "short-tenure":      (400000, "10", 24, 100000, 6),
    "long-tenure":       (8000000, "9", 360, 500000, 60),
    "low-interest":      (1200000, "4", 120, 200000, 12),
    "high-interest":     (500000, "24", 60, 100000, 0),
    "near-payoff":       (1000000, "9", 120, 650000, 12),
    "payoff":            (1000000, "9", 120, 2000000, 12),
    "one-month-left":    (100000, "12", 1, 50000, 0),
}


def emi_for(p, i, n):
    f = (1 + i) ** n
    return p * i * f / (f - 1)


def balance_after(p, i, emi, k):
    f = (1 + i) ** k
    return p * f - emi * (f - 1) / i


def simulate_keep(b, i, emi):
    """months to clear balance b paying emi each month; returns (months, total interest, last payment)."""
    months, interest = 0, D(0)
    last = emi
    while b > D("1e-30"):
        months += 1
        interest_m = b * i
        interest += interest_m
        due = b + interest_m
        pay = min(emi, due)
        last = pay
        b = due - pay
        if months > 5000:
            raise RuntimeError("did not converge")
    return months, interest, last


def money(x):
    return str(x.quantize(D("0.01"), rounding=ROUND_HALF_UP))


out = {}
for name, (p, rate, n, lump, k) in SCENARIOS.items():
    p = D(p)
    i = D(rate) / 12 / 100
    lump = D(lump)
    emi = emi_for(p, i, n)
    base_interest = emi * n - p
    bk = balance_after(p, i, emi, k) if k > 0 else p
    clears = lump >= bk
    applied = bk if clears else lump
    after = bk - applied

    # interest already paid in the k months before the prepayment (identical in every outcome)
    interest_before = emi * k - (p - bk)

    row = {
        "input": {"balance": int(p), "rate": rate, "remainingMonths": n, "prepayment": int(lump), "afterMonths": k},
        "baseline": {"emi": money(emi), "totalInterest": money(base_interest), "totalRepayment": money(emi * n)},
        "balanceAtPrepayment": money(bk),
        "clearsLoan": clears,
        "prepaymentApplied": money(applied),
        "balanceAfterPrepayment": money(after),
    }

    if clears:
        total_interest = interest_before
        row["keepEmi"] = {
            "totalMonths": k, "monthsSaved": n - k,
            "totalInterest": money(total_interest), "interestSaved": money(base_interest - total_interest),
        }
        row["reduceEmi"] = None
    else:
        # outcome A: closed form vs simulation
        m_closed = int((-((1 - after * i / emi).ln()) / (1 + i).ln()).to_integral_value(rounding="ROUND_CEILING"))
        m_sim, interest_sim, last = simulate_keep(after, i, emi)
        assert m_closed == m_sim, (name, m_closed, m_sim)
        # closed-form total interest: payments after the prepayment minus the balance paid off
        f = (1 + i) ** (m_sim - 1)
        bal_before_last = after * f - emi * (f - 1) / i
        last_closed = bal_before_last * (1 + i)
        payments_after = emi * (m_sim - 1) + last_closed
        interest_closed = payments_after - after
        assert abs(interest_closed - interest_sim) < D("1e-20"), (name, interest_closed, interest_sim)
        total_a = interest_before + interest_sim
        row["keepEmi"] = {
            "totalMonths": k + m_sim, "monthsSaved": n - (k + m_sim),
            "totalInterest": money(total_a), "interestSaved": money(base_interest - total_a),
            "lastPayment": money(last),
        }
        # outcome B: closed form vs simulation
        rem = n - k
        emi_b = emi_for(after, i, rem)
        b = after
        interest_b_sim = D(0)
        for _ in range(rem):
            im = b * i
            interest_b_sim += im
            b = b + im - emi_b
        assert abs(b) < D("1e-20"), (name, b)
        interest_b_closed = emi_b * rem - after
        assert abs(interest_b_closed - interest_b_sim) < D("1e-20")
        total_b = interest_before + interest_b_sim
        row["reduceEmi"] = {
            "emi": money(emi_b), "emiReduction": money(emi - emi_b), "totalMonths": n,
            "totalInterest": money(total_b), "interestSaved": money(base_interest - total_b),
        }
        # the mathematical ordering the tool relies on
        assert total_a <= total_b <= base_interest

    out[name] = row

# a yearly balance sample for the main scenario (independent of the product's table code)
p, i, n, lump, k = D(2500000), D("8.5") / 12 / 100, 180, D(300000), 24
emi = emi_for(p, i, n)
bk = balance_after(p, i, emi, k)
after = bk - lump
emi_b = emi_for(after, i, n - k)
m_sim, _, _ = simulate_keep(after, i, emi)


def keep_balance(t):
    if t < k:
        return balance_after(p, i, emi, t)
    s = t - k
    if s >= m_sim:
        return D(0)
    return after * (1 + i) ** s - emi * ((1 + i) ** s - 1) / i


def reduce_balance(t):
    if t < k:
        return balance_after(p, i, emi, t)
    s = t - k
    return after * (1 + i) ** s - emi_b * ((1 + i) ** s - 1) / i


out["yearlyBalances-normal-after-24"] = {
    str(y): {
        "withoutPrepayment": money(balance_after(p, i, emi, 12 * y) if y * 12 <= n else D(0)),
        "keepEmi": money(keep_balance(12 * y)),
        "reduceEmi": money(max(reduce_balance(12 * y), D(0))),
    }
    for y in (1, 2, 3, 5, 10, 12, 15)
}

# facts quoted in the supporting articles: how much of an EMI is interest early and late in the loan
p, i, n = D(2500000), D("8.5") / 12 / 100, 180
emi = emi_for(p, i, n)


def interest_share(payment_number):
    b = balance_after(p, i, emi, payment_number - 1) if payment_number > 1 else p
    return b * i


out["interestInEmi-normal"] = {
    str(t): {"interest": money(interest_share(t)), "shareOfEmiPercent": str((interest_share(t) / emi * 100).quantize(D("0.1"), rounding=ROUND_HALF_UP))}
    for t in (1, 61, 121)
}

print(json.dumps(out, indent=2))
