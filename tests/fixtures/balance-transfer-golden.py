"""
Independent reference for the Loan Balance Transfer Calculator (Tool Pack 2).

Python `decimal` with 60 digits, written from the MODEL in the specification, NOT from the JavaScript:

  - the EMI is computed from the closed form  P i (1+i)^n / ((1+i)^n - 1)
  - the loan is also SIMULATED month by month (balance * (1+i) - EMI) and must end at zero (the EMI formula is
    cross-checked against its own schedule)
  - totals are the sum of the individual month payments, not EMI * n
  - the cumulative position S(m) is built by adding month after month (not by the closed form the engine uses)
  - the break-even month is found by scanning m = 1, 2, ... for the first S(m) >= 0
  - the break-even rate is found by bisection on a separate function, to 40 digits

Every assertion must hold before a value is printed. Run:  python tests/fixtures/balance-transfer-golden.py
The printed JSON is what tests/unit/balance-transfer-golden.test.mjs embeds as GOLDEN.
"""
import json
from decimal import Decimal as D, getcontext

getcontext().prec = 60
RATE_MIN, RATE_MAX = D("0.1"), D("30")
NEUTRAL = D(1)
EPS = D("0.005")


def emi(P, rate, n):
    i = D(rate) / 12 / 100
    f = (1 + i) ** n
    return P * i * f / (f - 1)


def simulate(P, rate, n):
    """month by month: returns the list of payments and checks the balance ends at zero"""
    i = D(rate) / 12 / 100
    e = emi(P, rate, n)
    bal = P
    pays = []
    for _ in range(n):
        bal = bal * (1 + i) - e
        pays.append(e)
    assert abs(bal) < D("1e-40"), f"schedule does not end at zero: {bal}"
    return pays


def compare(P, r0, n0, r1, n1, c0, c1):
    ch = D(c0) + D(c1)
    pays0, pays1 = simulate(P, r0, n0), simulate(P, r1, n1)
    out0, rep1 = sum(pays0), sum(pays1)
    out1 = rep1 + ch
    net = out0 - out1
    horizon = max(n0, n1)
    s = -ch
    month = None
    positions = [s]
    for m in range(1, horizon + 1):
        s += (pays0[m - 1] if m <= n0 else 0) - (pays1[m - 1] if m <= n1 else 0)
        positions.append(s)
        if month is None and s >= -EPS:
            month = m
    assert abs(positions[-1] - net) < D("1e-40"), "the final position must equal the net saving"
    neutral = abs(net) < NEUTRAL
    if neutral or month is None:
        be = {"kind": "none" if neutral else "never", "month": None}
    elif month == 1 and ch <= EPS:
        be = {"kind": "immediate", "month": 1}
    else:
        be = {"kind": "months", "month": month}
    if neutral:
        outcome = "neutral"
    elif net > 0:
        outcome = "saving"
    elif be["kind"] == "never":
        outcome = "loss"
    else:
        outcome = "temporary"
    return dict(emi0=pays0[0], emi1=pays1[0], out0=out0, rep1=rep1, out1=out1, charges=ch, net=net,
                breakEven=be, outcome=outcome, positions=positions, horizon=horizon)


def break_even_rate(P, r0, n0, n1, c0, c1):
    net = lambda r: compare(P, r0, n0, r, n1, c0, c1)["net"]
    if net(RATE_MIN) < 0:
        return {"kind": "none", "rate": None}
    if net(RATE_MAX) >= 0:
        return {"kind": "always", "rate": None}
    lo, hi = RATE_MIN, RATE_MAX
    for _ in range(140):
        mid = (lo + hi) / 2
        if net(mid) >= 0:
            lo = mid
        else:
            hi = mid
    return {"kind": "rate", "rate": lo}


def yearly(cmp, n0, n1):
    pos = cmp["positions"]
    e0, e1 = cmp["emi0"], cmp["emi1"]
    rows = [{"year": 0, "paidCurrent": D(0), "paidNew": D(0), "charges": cmp["charges"], "position": -cmp["charges"]}]
    y = 1
    while (y - 1) * 12 < cmp["horizon"]:
        frm, to = (y - 1) * 12, min(y * 12, cmp["horizon"])
        paid0 = sum(e0 for m in range(frm + 1, to + 1) if m <= n0)
        paid1 = sum(e1 for m in range(frm + 1, to + 1) if m <= n1)
        rows.append({"year": y, "paidCurrent": paid0, "paidNew": paid1, "charges": D(0), "position": pos[to]})
        y += 1
    return rows


def money(x):
    return str(D(x).quantize(D("0.0001")))


def scenario(name, P, r0, n0, r1, n1, c0, c1, with_yearly=False):
    P, r0, r1 = D(P), D(r0), D(r1)
    cmp = compare(P, r0, n0, r1, n1, c0, c1)
    out = {
        "input": {"balance": int(P), "currentRate": str(r0), "currentMonths": n0, "newRate": str(r1), "newMonths": n1,
                  "currentCharges": c0, "newCharges": c1},
        "currentEmi": money(cmp["emi0"]), "newEmi": money(cmp["emi1"]),
        "currentTotalInterest": money(cmp["out0"] - P), "newTotalInterest": money(cmp["rep1"] - P),
        "currentOutgo": money(cmp["out0"]), "effectiveNewOutgo": money(cmp["out1"]),
        "netSaving": money(cmp["net"]), "outcome": cmp["outcome"], "breakEven": cmp["breakEven"],
        "emiChange": money(cmp["emi0"] - cmp["emi1"]),
    }
    if n1 != n0:
        same = compare(P, r0, n0, r1, n0, c0, c1)
        out["sameTenure"] = {"emi": money(same["emi1"]), "netSaving": money(same["net"]), "outcome": same["outcome"],
                             "breakEven": same["breakEven"]}
    ber = break_even_rate(P, r0, n0, n1, c0, c1)
    out["breakEvenRate"] = {"kind": ber["kind"], "rate": None if ber["rate"] is None else str(ber["rate"].quantize(D("1e-9")))}
    if with_yearly:
        out["yearly"] = [{k: (v if k == "year" else money(v)) for k, v in row.items()} for row in yearly(cmp, n0, n1)]
    return name, out


S = {}
for name, args, kw in [
    # the base case of the specification: 9.5% -> 8.5%, same 15 years, 17,500 of charges at the new lender
    ("base-same-tenure", (2500000, "9.5", 180, "8.5", 180, 0, 17500), {"with_yearly": True}),
    # the same offer over 20 years: a much lower EMI but a worse total (the temporary-saving case)
    ("longer-tenure", (2500000, "9.5", 180, "8.5", 240, 0, 17500), {"with_yearly": True}),
    # a shorter new loan: a higher EMI, a real saving
    ("shorter-tenure", (2500000, "9.5", 180, "8.5", 120, 0, 17500), {}),
    # no charges at all
    ("zero-charges", (2500000, "9.5", 180, "8.5", 180, 0, 0), {}),
    # charges at both lenders
    ("both-lenders-charge", (2500000, "9.5", 180, "8.5", 180, 50000, 17500), {}),
    # the same rate: only the charges remain
    ("same-rate", (2500000, "9.5", 180, "9.5", 180, 0, 17500), {}),
    # a higher new rate, same tenure
    ("higher-rate", (2500000, "9.5", 180, "10.5", 180, 0, 17500), {}),
    # charges larger than the whole saving, with a lower EMI: lower EMI, higher cost, never breaks even
    ("charges-eliminate-saving", (2500000, "9.5", 180, "8.5", 180, 0, 400000), {}),
    # a tiny rate drop and long tenure
    ("small-drop", (1000000, "8.5", 120, "8.4", 120, 0, 5000), {}),
    # large loan, long tenure, big drop
    ("large-long", (50000000, "11", 360, "8.5", 360, 0, 250000), {"with_yearly": True}),
    # a short remaining loan: fees are almost never earned back
    ("short-remaining", (200000, "12", 6, "10", 6, 0, 2000), {}),
    # one month left
    ("one-month-left", (50000, "12", 1, "9", 1, 0, 100), {}),
    # a higher new rate over a much shorter tenure can still cost less overall
    ("higher-rate-shorter", (2500000, "8.5", 240, "9.5", 120, 0, 0), {}),
    # the charges are almost exactly the interest saved: no difference
    ("near-zero", (2500000, "9.5", 180, "8.5", 180, 0, 267683), {}),
    # low interest
    ("low-interest", (3000000, "1", 240, "0.5", 240, 0, 10000), {}),
]:
    n, o = scenario(name, *args, **kw)
    S[n] = o

# ---- figures quoted in the articles --------------------------------------------------------------------------------
# "Balance transfer or prepayment": 25,00,000 owed at 9.5% with 15 years left; 3,00,000 of savings; EMI kept.
# Interest is simulated month by month (the balance is repaid when it reaches half a paisa), and charges are added.
def interest_after_prepay(P, rate, n, lump):
    i = D(rate) / 12 / 100
    e = emi(P, rate, n)
    bal = D(P) - D(lump)
    interest = D(0)
    months = 0
    while bal > EPS:
        ch = bal * i
        interest += ch
        bal = bal + ch - min(e, bal + ch)
        months += 1
    return interest, months, e


def article_scenario(P, r_now, r_new, n, funds, charges):
    P = D(P)
    base_interest = emi(P, r_now, n) * n - P
    # A: prepay all the funds on the current loan, keep the EMI
    a_int, a_months, _ = interest_after_prepay(P, r_now, n, funds)
    # B: switch (charges paid from the funds), keep the rest of the funds aside, same tenure
    b_int = emi(P, r_new, n) * n - P
    # C: switch, then prepay what is left of the funds on the new loan, keep the EMI
    c_int, c_months, _ = interest_after_prepay(P, r_new, n, D(funds) - D(charges))
    return {
        "baselineInterest": money(base_interest),
        "A_prepayOnly": {"interest": money(a_int), "interestSaved": money(base_interest - a_int), "months": a_months},
        "B_switchOnly": {"interestPlusCharges": money(b_int + D(charges)), "netSaved": money(base_interest - b_int - D(charges))},
        "C_switchThenPrepay": {"interestPlusCharges": money(c_int + D(charges)), "netSaved": money(base_interest - c_int - D(charges)), "months": c_months},
    }


S["articles"] = {
    "bigDrop": article_scenario(2500000, "9.5", "8.5", 180, 300000, 17500),
    "smallDrop": article_scenario(2500000, "9.5", "9.3", 180, 300000, 17500),
}

# an extra independent check: the break-even rate really gives a zero net saving (to the paisa)
b = S["base-same-tenure"]
r = D(b["breakEvenRate"]["rate"])
chk = compare(D(2500000), D("9.5"), 180, r, 180, 0, 17500)
assert abs(chk["net"]) < D("0.01"), chk["net"]
# the 'near-zero' scenario is neutral by construction
assert S["near-zero"]["outcome"] == "neutral", S["near-zero"]["outcome"]
# the longer-tenure case lowers the EMI and still costs more
lt = S["longer-tenure"]
assert D(lt["newEmi"]) < D(lt["currentEmi"]) and D(lt["netSaving"]) < 0 and lt["outcome"] == "temporary", lt
print(json.dumps(S, indent=2))
