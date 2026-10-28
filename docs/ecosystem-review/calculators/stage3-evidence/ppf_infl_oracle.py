import json, random
from decimal import Decimal as D, getcontext
getcontext().prec = 60
random.seed(7)
out = {"ppf": [], "infl": []}
def ppf(pattern, dep, rate, years):
    r = D(rate) / 100; bal = D(0)
    for _ in range(years):
        if pattern == "yearly":
            bal = (bal + D(dep)) * (1 + r)            # one April deposit, 12 months of r/12 on the same balance
        else:
            m = D(dep)
            bal = bal + 12 * m + (r / 12) * (12 * bal + 78 * m)   # sum over k=1..12 of (bal + k*m)
    return bal
for _ in range(120):
    pat = random.choice(["yearly", "monthly"])
    dep = random.choice(range(500, 150001, 50)) if pat == "yearly" else random.choice(range(50, 12501, 50))
    rate = round(random.uniform(0, 15), 1); years = random.randint(1, 50)
    out["ppf"].append({"pattern": pat, "dep": dep, "rate": rate, "years": years, "bal": str(ppf(pat, dep, rate, years))})
for _ in range(120):
    nom = round(random.uniform(1, 1e9), 2); f = round(random.uniform(0.01, 30), 2); y = round(random.uniform(0.0833, 60), 4)
    out["infl"].append({"nom": nom, "f": f, "y": y, "real": str(D(str(nom)) / (1 + D(str(f)) / 100) ** D(str(y))),
                        "ret": str(((1 + D("0.12")) / (1 + D(str(f)) / 100) - 1) * 100)})
json.dump(out, open("ppf_infl_oracle.json", "w")); print({k: len(v) for k, v in out.items()})
