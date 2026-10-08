"""
Independent reference for the Credit Card Payoff Calculator (Tool Pack 24).

Written from the specification (docs/tool-packs/24-credit-card-payoff.md), NOT from the JavaScript, with the Python
standard library only. The JavaScript engine uses BigInt fixed-point integers; this reference works differently on
purpose, and three methods must agree before a value is written:

  1. a `decimal` month-by-month simulation (60 digits),
  2. an exact `fractions` simulation with NO tolerance (every payment until the balance is exactly zero),
  3. the closed-form payment count  n = -ln(1 - B*i/P) / ln(1 + i)  (where mathematically applicable).

The state of a payment is decided by an exact integer test (paise and hundredths of a percent). A fourth check ties
the model to the annuity formula: the payment that clears a balance in N months, rounded UP to the paisa, must take at
most N payments, and one paisa less must take more.

It writes tests/fixtures/credit-card-payoff-golden.json: named vectors (every worked example of the specification,
boundaries one paisa either side of the interest, the 600/601 boundary, the half-paisa residual cases, the extremes),
a seeded sample, comparison pairs, annuity cross-checks and SHA-256 digests of exhaustive sweeps that the unit test
recomputes with the engine.

Run:  python tests/fixtures/credit-card-payoff-golden.py
"""
import hashlib
import json
import math
import os
import random
import sys
from decimal import ROUND_HALF_UP, Decimal as D, getcontext
from fractions import Fraction as F

sys.dont_write_bytecode = True
getcontext().prec = 60

HERE = os.path.dirname(os.path.abspath(__file__))

HORIZON = 600
HALF_PAISA = D("0.005")  # rupees


def paise(text):
    return int((D(text) * 100).to_integral_value())


def hundredths(text):
    return int((D(text) * 100).to_integral_value())


def to_paise_half_up(rupees):
    return int((rupees * 100).quantize(D(1), rounding=ROUND_HALF_UP))


def non_amortizing(b_paise, a_h, p_paise):
    """exact integer test: the payment is at most the first month's interest (and there is interest)"""
    return a_h > 0 and p_paise * 120000 <= b_paise * a_h


def simulate_decimal(b_paise, a_h, p_paise):
    i = D(a_h) / 120000
    balance = D(b_paise) / 100
    pay_amount = D(p_paise) / 100
    total = D(0)
    last = D(0)
    months = 0
    while balance > HALF_PAISA and months < HORIZON:
        months += 1
        due = balance * (1 + i)
        pay = due if due <= pay_amount + HALF_PAISA else pay_amount
        total += pay
        last = pay
        balance = due - pay
    return months, balance, total, last


def simulate_exact(b_paise, a_h, p_paise):
    """no tolerance: every payment until the balance is exactly zero, at most HORIZON payments"""
    i = F(a_h, 120000)
    balance = F(b_paise, 100)
    pay_amount = F(p_paise, 100)
    months = 0
    total = F(0)
    while balance > 0 and months < HORIZON:
        months += 1
        due = balance * (1 + i)
        pay = min(pay_amount, due)
        total += pay
        balance = due - pay
    return months, balance, total


def closed_form_months(b_paise, a_h, p_paise):
    i = D(a_h) / 120000
    b = D(b_paise) / 100
    p = D(p_paise) / 100
    if i == 0:
        return b / p
    x = 1 - b * i / p
    if x <= 0:
        return None
    return -(x.ln()) / ((1 + i).ln())


def outcome(b_paise, a_h, p_paise):
    first = D(b_paise) * D(a_h) / 120000  # paise, exact
    out = {"firstInterestPaise": to_paise_half_up(first / 100)}
    if non_amortizing(b_paise, a_h, p_paise):
        out["state"] = "non-amortizing"
        out["smallestReducingPaise"] = (b_paise * a_h) // 120000 + 1
        return out
    months, balance, total, last = simulate_decimal(b_paise, a_h, p_paise)
    if balance > 0:
        out["state"] = "beyond-horizon"
        return out
    # method 2: exact simulation. It must agree on the number of payments, except where the half-paisa rule moved a
    # residual of under half a paisa onto the last payment (the exact model then needs one more, tiny, payment)
    e_months, e_balance, e_total = simulate_exact(b_paise, a_h, p_paise)
    exact_pays_off_within = e_balance == 0
    rule_used = False
    if exact_pays_off_within and e_months == months:
        pass
    elif exact_pays_off_within and e_months == months + 1:
        rule_used = True  # the exact model's extra payment is the residual: it must be under half a paisa
        i = F(a_h, 120000)
        residual = None
        bal = F(b_paise, 100)
        for _ in range(months):
            due = bal * (1 + i)
            bal = due - min(F(p_paise, 100), due)
        residual = bal
        assert 0 < residual <= F(1, 200), ("residual not under half a paisa", b_paise, a_h, p_paise, float(residual))
    else:
        # the exact model has not finished at the horizon: only possible when the payoff is on payment 600
        rule_used = True
        assert months == HORIZON and e_balance > 0 and e_balance <= F(1, 200) * (1 + F(a_h, 120000)), ("tolerance at the horizon", b_paise, a_h, p_paise, months, float(e_balance))
    assert abs(D(e_total.numerator) / D(e_total.denominator) - total) <= HALF_PAISA, "exact vs decimal total"
    # method 3: the closed form, where it applies
    n = closed_form_months(b_paise, a_h, p_paise)
    if n is not None and n <= HORIZON - 1:
        assert months == math.ceil(n) or months == math.ceil(n) + 1 or abs(n - months) < 1.0001, ("closed form", n, months)
    out.update({
        "state": "payoff",
        "months": months,
        "totalRepaidPaise": to_paise_half_up(total),
        "totalInterestPaise": to_paise_half_up(total - D(b_paise) / 100),
        "finalPaymentPaise": to_paise_half_up(last),
        # the totals to 12 decimal places of a paisa, for an exact comparison with the BigInt engine
        "totalRepaid12": format((total * 100).quantize(D("1e-12")), "f"),
        "totalInterest12": format(((total - D(b_paise) / 100) * 100).quantize(D("1e-12")), "f"),
        "usedHalfPaisaRule": rule_used,
    })
    return out


def vec(name, balance, apr, payment):
    b, a, p = paise(balance), hundredths(apr), paise(payment)
    return {"name": name, "balance": balance, "apr": apr, "payment": payment, **outcome(b, a, p)}


NAMED = [
    vec("example 1", "50000", "36", "3000"),
    vec("example 2", "50000", "36", "4000"),
    vec("one paisa above the interest, 42%", "100000", "42", "3500.01"),
    vec("exactly the interest, 42%", "100000", "42", "3500"),
    vec("one paisa below the interest, 42%", "100000", "42", "3499.99"),
    vec("42% with 4000", "100000", "42", "4000"),
    vec("zero APR", "24000", "0", "2000"),
    vec("one payment clears it", "1000", "36", "5000"),
    vec("non-amortizing, fractional interest", "250000", "40", "7500"),
    vec("below fractional interest", "250000", "40", "8333.33"),
    vec("above fractional interest", "250000", "40", "8333.34"),
    vec("12% just above the interest", "100000", "12", "1005"),
    vec("beyond the horizon 1", "100000", "12", "1001"),
    vec("beyond the horizon 2", "100000", "12", "1002"),
    vec("zero APR, exactly 600 payments", "60000", "0", "100"),
    vec("zero APR, 601 payments needed", "60000", "0", "99.99"),
    vec("12% with 1500", "100000", "12", "1500"),
    vec("half-paisa rule, 37th payment", "371.95", "5.01", "10.87"),
    vec("half-paisa rule, 33rd payment", "1587.71", "8.29", "53.97"),
    vec("half-paisa rule, 25th payment", "2228.07", "42.42", "135.70"),
    vec("half-paisa rule decides payoff at payment 600", "3217.77", "4.75", "14.05"),
    vec("smallest balance, smallest payment, zero APR", "100", "0", "1"),
    vec("smallest balance, smallest payment, 100% APR", "100", "100", "1"),
    vec("largest balance, largest payment, 100% APR", "10000000", "100", "10000000"),
    vec("largest balance, 100% APR, interest plus a paisa", "10000000", "100", "833333.34"),
    vec("largest balance, 100% APR, exactly the interest", "10000000", "100", "833333.33"),
    vec("largest balance, 99.99% APR", "10000000", "99.99", "833325"),
    vec("largest balance, zero APR, largest payment", "10000000", "0", "10000000"),
    vec("payment just below the whole debt plus interest", "1000", "36", "1029.99"),
    vec("payment equal to the whole debt plus interest", "1000", "36", "1030"),
    # added with the wording correction: the exact threshold when the interest has a fraction of a paisa of .5 or more
    vec("fractional-paisa interest (1001.6667), one paisa below the smallest reducing payment", "100000", "12.02", "1001.66"),
    vec("fractional-paisa interest (1001.6667), the smallest reducing payment", "100000", "12.02", "1001.67"),
    # due is exactly half a paisa above the payment: the half-paisa rule makes the single payment 100.005
    vec("tie: the amount due is exactly half a paisa above the payment", "100", "0.06", "100"),
]

# the specification's comparisons (and the other state combinations), as pairs of named payments
COMPARISONS = []
for balance, apr, p1, p2 in [
    ("50000", "36", "3000", "4000"),
    ("100000", "12", "1005", "1500"),
    ("50000", "36", "4000", "3000"),
    ("100000", "42", "3500", "4000"),     # non-amortizing vs payoff
    ("100000", "42", "4000", "3500"),     # payoff vs non-amortizing
    ("100000", "12", "1002", "1005"),     # beyond the horizon vs payoff
    ("100000", "12", "1005", "1002"),
    ("100000", "12", "1001", "1002"),     # two beyond
    ("100000", "42", "3500", "3499.99"),  # two non-amortizing
    ("100000", "12", "1002", "3500"),     # beyond vs payoff (larger payment)
    ("50000", "36", "3000", "3000"),      # equal
    ("50000", "36", "3000", "3000.00"),   # equal, written differently
]:
    b, a = paise(balance), hundredths(apr)
    o1, o2 = outcome(b, a, paise(p1)), outcome(b, a, paise(p2))
    entry = {"balance": balance, "apr": apr, "payment": p1, "compare": p2, "state1": o1["state"], "state2": o2["state"]}
    if paise(p1) == paise(p2):
        entry["kind"] = "equal"
    elif o1["state"] == "payoff" and o2["state"] == "payoff":
        entry["kind"] = "difference"
        entry["monthsDifference"] = o1["months"] - o2["months"]
        d1 = D(o1["totalInterest12"]) - D(o2["totalInterest12"])  # paise, 12 places: exact difference first
        entry["interestDifference12"] = format(d1, "f")
        # one rounding at the end, half up on the size, sign kept
        entry["interestDifferencePaise"] = int(d1.copy_abs().quantize(D(1), rounding=ROUND_HALF_UP)) * (-1 if d1 < 0 else 1)
    else:
        entry["kind"] = "unavailable"
    COMPARISONS.append(entry)

# a seeded sample over every state, with boundaries one paisa either side of the first month's interest
random.seed(2410)
SAMPLE = []
while len(SAMPLE) < 300:
    b = random.randint(100, 10_000_000)
    b = b + random.choice([0, 0, 0.5, 0.25, 0.01 * random.randint(0, 99)])
    apr = random.choice([0, random.randint(1, 100), random.randint(1, 10000) / 100])
    interest = b * apr / 1200
    base = max(1.0, interest)
    p = round(base * random.choice([1, 1, 1.0001, 1.001, 1.01, 1.1, 1.5, 3]) + random.choice([0, 0.01, -0.01, 0.02, 1]), 2)
    p = min(max(p, 1.0), 10_000_000.0)
    SAMPLE.append(vec("sample %d" % len(SAMPLE), "%.2f" % b, ("%.2f" % apr).rstrip("0").rstrip("."), ("%.2f" % p).rstrip("0").rstrip(".")))

# the annuity cross-check: the payment that clears B in N months, rounded UP to the paisa, takes at most N payments;
# one paisa less takes more (or never ends)
ANNUITY = []
for balance, apr, n in [("50000", "36", 24), ("100000", "12", 60), ("100000", "12", 300), ("250000", "40", 36), ("1000", "18", 6), ("75000.50", "24.5", 18), ("100000", "1", 120)]:
    b, a = paise(balance), hundredths(apr)
    i = D(a) / 120000
    pn = (D(b) / 100) * i / (1 - (1 + i) ** -n)
    up = int((pn * 100).to_integral_value(rounding="ROUND_CEILING"))
    at = outcome(b, a, up)
    below = outcome(b, a, up - 1)
    assert at["state"] == "payoff" and at["months"] <= n, ("annuity", balance, apr, n, at)
    assert below["state"] != "payoff" or below["months"] > n, ("annuity below", balance, apr, n, below)
    ANNUITY.append({"balance": balance, "apr": apr, "months": n, "paymentPaise": up,
                    "monthsAtPayment": at["months"], "belowState": below["state"], "monthsBelow": below.get("months")})


# --- exhaustive sweeps (digests) ---------------------------------------------------------------------------------
def threshold_lines():
    for b in (10000, 12345, 99999, 100000, 2500000, 25000000, 1000000000):
        for a in (0, 1, 7, 100, 1200, 3600, 4200, 4250, 9999, 10000):
            interest_floor = (b * a) // 120000
            for p in sorted({max(100, interest_floor - 1), max(100, interest_floor), max(100, interest_floor + 1), max(100, interest_floor + 2), 100, 1000000000}):
                if p > 1000000000:
                    continue
                o = outcome(b, a, p)
                yield "%d,%d,%d,%s,%s\n" % (b, a, p, o["state"], o.get("months", -1))


def digest(lines):
    h = hashlib.sha256()
    for line in lines:
        h.update(line.encode("ascii"))
    return h.hexdigest()


out = {
    "named": NAMED,
    "comparisons": COMPARISONS,
    "sample": SAMPLE,
    "annuity": ANNUITY,
    "digests": {"threshold": digest(threshold_lines())},
}

with open(os.path.join(HERE, "credit-card-payoff-golden.json"), "w", encoding="ascii", newline="\n") as f:
    json.dump(out, f, indent=1, ensure_ascii=True)
    f.write("\n")

print("wrote tests/fixtures/credit-card-payoff-golden.json")
