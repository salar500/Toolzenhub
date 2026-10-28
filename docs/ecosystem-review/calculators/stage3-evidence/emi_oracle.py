import json, random
from decimal import Decimal as D, getcontext
getcontext().prec = 50
random.seed(20261029)
def emi(p, r, n):
    i = D(r) / 1200
    if i == 0: return D(p) / n
    f = (1 + i) ** n
    return D(p) * i * f / (f - 1)
def payoff(p, r, e):
    i = D(r) / 1200; bal = D(p); n = 0; ti = D(0); last = D(0)
    while bal > D("0.005") and n < 600:
        n += 1; it = bal * i; pay = min(D(e), bal + it)
        if D(e) <= it and i > 0 and n == 1: return None
        ti += it; bal = bal + it - pay; last = pay
        if D(e) <= it: return None
    return None if bal > D("0.005") else (n, last, ti)
def rate_for(p, n, e):
    lo, hi = D(0), D(30)
    f = lambda r: emi(p, r, n) - D(e)
    if f(lo) > 0 or f(hi) < 0: return None
    for _ in range(200):
        m = (lo + hi) / 2
        if f(m) < 0: lo = m
        else: hi = m
    return (lo + hi) / 2
cases = []
grid_p = ["1000", "99999.99", "1234567.89", "500000", "5000000", "100000000"]
grid_r = ["0", "0.1", "6.5", "9", "12", "30"]
grid_y = [1, 3, 5, 20, 40]
for p in grid_p:
    for r in grid_r:
        for y in grid_y:
            cases.append((p, r, y))
for _ in range(60):
    cases.append((str(round(random.uniform(1000, 1e8), 2)), str(round(random.uniform(0, 30), 2)), random.randint(1, 40)))
out = {"emi": [], "payoff": [], "rate": []}
for p, r, y in cases:
    n = y * 12; e = emi(p, r, n)
    out["emi"].append({"p": p, "r": r, "y": y, "emi": str(e), "interest": str(e * n - D(p))})
    # payoff at an EMI 10 percent above the required one (always amortizes)
    e2 = (e * D("1.1")).quantize(D("0.01"))
    po = payoff(p, r, e2)
    if po: out["payoff"].append({"p": p, "r": r, "emi": str(e2), "n": po[0], "last": str(po[1]), "interest": str(po[2])})
    if D(r) > 0:
        e3 = e.quantize(D("0.01"))
        rr = rate_for(p, n, e3)
        if rr is not None: out["rate"].append({"p": p, "n": n, "emi": str(e3), "rate": str(rr)})
json.dump(out, open("emi_oracle.json", "w"))
print({k: len(v) for k, v in out.items()})
