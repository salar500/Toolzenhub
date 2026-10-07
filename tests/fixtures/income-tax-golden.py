"""
Independent reference for the Old vs New Tax Regime Calculator (Tool Pack 17), tax year 2026-27.

Written from the statute, not from the JavaScript, and it shares nothing with it:
  - money is an exact `Fraction` of RUPEES (the JavaScript counts integer paise);
  - the tax on a total income uses the CUMULATIVE form ("Rs 12,500 plus 20% of the amount above Rs 5,00,000") as the old-regime
    table in Finance Act 2026 Part I-B Paragraph A is written, and the official portal's cumulative table for the new regime
    (the JavaScript adds up band by band);
  - the house rent allowance is rule 279 of the Income-tax Rules, 2026, read literally;
  - the break-even is found by bisection AND checked by brute force on its neighbours (the answer is the SMALLEST extra deduction).

Provisions (Income-tax Act 2025 unless stated):
  s.202(1)  new-regime slabs            s.19(1) Table Sl. 1, 2   professional tax; standard deduction Rs 75,000 (new) / Rs 50,000 (old)
  s.156     rebate (old: total income <= Rs 5,00,000, Rs 12,500; new: <= Rs 12,00,000, Rs 60,000, with marginal relief above)
  s.516     round total income and the amount payable to the nearest Rs 10, paise ignored
  s.122(2)  Chapter VIII deductions cannot exceed gross total income
  s.123     80C-type deductions up to Rs 1,50,000     s.124(3) own NPS Rs 50,000       s.124(1),(2) employer NPS 10%/14% of salary
  s.126     health insurance: Rs 25,000 self/family; parents Rs 25,000 (Rs 50,000 if senior)
  s.22(2),(5) self-occupied house interest: Rs 2,00,000 (Rs 30,000 in any other case)
  Finance Act 2026 sections 2, 3: 4% Health and Education Cess on tax (after rebate); Part I-B Paragraph A: old-regime slabs

It prints the cases and their results as JSON for tests/unit/income-tax-golden.test.mjs to pin. Fixed numbers only.

Run:  python tests/fixtures/income-tax-golden.py     (prints JSON)
"""
import json
from fractions import Fraction as F
from math import floor

CEILING = 5_000_000


def r10(amount):
    """s.516: ignore paise, then to the nearest multiple of 10 (5 or more goes up)"""
    n = floor(amount)
    last = n % 10
    return n - last + (10 if last >= 5 else 0)


def tax_old(ti):
    """Finance Act 2026, Part I-B, Paragraph A(I): the amount is stated cumulatively"""
    if ti <= 250_000:
        return F(0)
    if ti <= 500_000:
        return F(5, 100) * (ti - 250_000)
    if ti <= 1_000_000:
        return F(12_500) + F(20, 100) * (ti - 500_000)
    return F(112_500) + F(30, 100) * (ti - 1_000_000)


def tax_new(ti):
    """s.202(1) rates, with the cumulative amounts of the e-filing portal's table for the new regime"""
    table = [  # (income above, tax up to that point, rate on the excess)
        (2_400_000, F(300_000), F(30, 100)),
        (2_000_000, F(200_000), F(25, 100)),
        (1_600_000, F(120_000), F(20, 100)),
        (1_200_000, F(60_000), F(15, 100)),
        (800_000, F(20_000), F(10, 100)),
        (400_000, F(0), F(5, 100)),
    ]
    for above, base, rate in table:
        if ti > above:
            return base + rate * (ti - above)
    return F(0)


def rebate_old(ti, tax):
    return min(tax, F(12_500)) if ti <= 500_000 else F(0)


def rebate_new(ti, tax):
    if ti <= 1_200_000:
        return min(tax, F(60_000))
    excess = F(ti - 1_200_000)
    return tax - excess if tax > excess else F(0)          # s.156(2)(b)


def finish(total_income_exact, regime):
    ti = r10(total_income_exact)
    tax = tax_old(ti) if regime == "old" else tax_new(ti)
    rebate = rebate_old(ti, tax) if regime == "old" else rebate_new(ti, tax)
    after = tax - rebate
    payable = after * F(104, 100)                            # tax plus 4% cess
    return {
        "totalIncome": ti,
        "taxBeforeRebatePaise": int(tax * 100),
        "rebatePaise": int(rebate * 100),
        "taxAfterRebatePaise": int(after * 100),
        "final": r10(payable),
    }


def hra_exemption(basic_da, hra_received, rent, high_city):
    """Income-tax Rules 2026, rule 279: the least of (a), (b), (c)"""
    a = F(hra_received)
    b = max(F(0), F(rent) - F(basic_da) / 10)
    c = F(basic_da) * (F(1, 2) if high_city else F(2, 5))
    return min(a, b, c)


DEFAULTS = dict(
    salary=0, otherIncome=0, basicPlusDa=0, hraMode="calculate", hraReceived=0, rentPaid=0, highCity=False, hraManual=0,
    section80C=0, ownNps=0, healthSelfFamily=0, healthParents=0, parentsSenior=False, professionalTax=0,
    homeLoanInterest=0, homeLoanOtherPurpose=False, employerNps=0, employerGovernment=False, otherDeductions=0,
)


def old_regime(i, extra=0):
    salary = F(i["salary"])
    hra = F(i["hraManual"]) if i["hraMode"] == "manual" else hra_exemption(i["basicPlusDa"], i["hraReceived"], i["rentPaid"], i["highCity"])
    standard = min(F(50_000), salary)
    salary_income = max(F(0), salary - hra - standard - F(i["professionalTax"]))
    house_cap = 30_000 if i["homeLoanOtherPurpose"] else 200_000
    house_loss = F(min(i["homeLoanInterest"], house_cap))
    gti = max(F(0), salary_income + F(i["otherIncome"]) - house_loss)
    parents_cap = 50_000 if i["parentsSenior"] else 25_000
    employer_pct = F(14, 100) if i["employerGovernment"] else F(10, 100)
    claimed = (
        min(i["section80C"], 150_000)
        + min(i["ownNps"], 50_000)
        + min(i["healthSelfFamily"], 25_000)
        + min(i["healthParents"], parents_cap)
        + min(F(i["employerNps"]), F(i["basicPlusDa"]) * employer_pct)
        + i["otherDeductions"] + extra
    )
    applied = min(F(claimed), gti)
    out = finish(gti - applied, "old")
    out["exemptionsAndDeductions"] = hra + F(i["professionalTax"]) + house_loss + applied
    out["grossTotalIncome"] = gti
    return out


def new_regime(i):
    salary = F(i["salary"])
    standard = min(F(75_000), salary)
    gti = max(F(0), salary - standard) + F(i["otherIncome"])
    employer = min(F(i["employerNps"]), F(i["basicPlusDa"]) * F(14, 100))
    applied = min(employer, gti)
    return finish(gti - applied, "new")


def break_even(i, old, new):
    if old["final"] <= new["final"]:
        return {"status": "old-lower-or-equal"}
    lo, hi = 0, floor(old["grossTotalIncome"]) + 1
    while lo < hi:
        mid = (lo + hi) // 2
        if old_regime(i, mid)["final"] <= new["final"]:
            hi = mid
        else:
            lo = mid + 1
    x = lo
    # brute-force check of minimality: x works, x - 1 does not
    assert old_regime(i, x)["final"] <= new["final"]
    assert x == 0 or old_regime(i, x - 1)["final"] > new["final"]
    current = int(floor(old["exemptionsAndDeductions"] + F(1, 2)))   # half up, like the page
    required = current + x
    return {
        "status": "found",
        "extraRupees": x,
        "currentRupees": current,
        "requiredRupees": required,
        "requiredApproxRupees": int(floor(F(required, 1000) + F(1, 2))) * 1000,
    }


def run(case):
    i = {**DEFAULTS, **case}
    if i["salary"] + i["otherIncome"] > CEILING:
        return {"input": case, "status": "unsupported"}
    old = old_regime(i)
    new = new_regime(i)
    be = break_even(i, old, new)
    return {
        "input": case,
        "status": "ok",
        "old": {k: old[k] for k in ("totalIncome", "taxBeforeRebatePaise", "rebatePaise", "taxAfterRebatePaise", "final")},
        "new": {k: new[k] for k in ("totalIncome", "taxBeforeRebatePaise", "rebatePaise", "taxAfterRebatePaise", "final")},
        "lower": "equal" if old["final"] == new["final"] else ("new" if new["final"] < old["final"] else "old"),
        "difference": abs(old["final"] - new["final"]),
        "breakEven": be,
    }


def cases():
    out = []
    add = out.append
    deltas = (-1000, -100, -10, -5, -1, 0, 1, 5, 10, 100, 1000)

    # NEW regime: salary chosen so that the total income is the target (standard deduction 75,000)
    for edge in (400_000, 800_000, 1_200_000, 1_600_000, 2_000_000, 2_400_000):
        for d in deltas:
            add({"salary": edge + d + 75_000})
    # the marginal-relief band above Rs 12,00,000 and just beyond it
    for ti in (1_200_004, 1_200_005, 1_200_006, 1_200_010, 1_201_000, 1_210_000, 1_225_000, 1_250_000, 1_260_000, 1_270_000,
               1_274_990, 1_275_000, 1_275_010, 1_276_000, 1_280_000, 1_300_000, 1_350_000):
        add({"salary": ti + 75_000})
    # OLD regime: salary chosen so that the total income is the target (standard deduction 50,000)
    for edge in (250_000, 500_000, 1_000_000):
        for d in deltas:
            add({"salary": edge + d + 50_000})
    # the old-regime rebate cliff and its neighbours; low and zero incomes
    for ti in (499_990, 500_000, 500_010, 500_100, 510_000, 520_000, 600_000):
        add({"salary": ti + 50_000})
    for s in (0, 1, 49_999, 50_000, 50_001, 75_000, 75_001, 100_000, 250_000, 300_000, 400_000, 450_000):
        add({"salary": s})
    # the supported ceiling, exactly and above
    add({"salary": 5_000_000})
    add({"salary": 4_999_999, "otherIncome": 1})
    add({"salary": 3_000_000, "otherIncome": 2_000_000})
    add({"salary": 5_000_001})
    add({"salary": 5_000_000, "otherIncome": 1})
    # other income
    for s, o in ((900_000, 50_000), (1_250_000, 40_000), (1_500_000, 300_000), (400_000, 120_000), (0, 600_000), (1_275_000, 0), (1_200_000, 75_000)):
        add({"salary": s, "otherIncome": o})
    # deduction caps, each side of the cap
    for v in (0, 149_999, 150_000, 150_001, 400_000):
        add({"salary": 1_800_000, "section80C": v})
    for v in (49_999, 50_000, 50_001):
        add({"salary": 1_800_000, "ownNps": v})
    for v in (24_999, 25_000, 25_001, 90_000):
        add({"salary": 1_800_000, "healthSelfFamily": v})
    for senior in (False, True):
        for v in (25_000, 25_001, 50_000, 50_001):
            add({"salary": 1_800_000, "healthParents": v, "parentsSenior": senior})
    for other in (False, True):
        for v in (29_999, 30_000, 30_001, 199_999, 200_000, 200_001, 350_000):
            add({"salary": 1_800_000, "homeLoanInterest": v, "homeLoanOtherPurpose": other})
    for v in (0, 2_400, 2_500, 5_000):
        add({"salary": 1_200_000, "professionalTax": v})
    for v in (0, 1, 100_000, 400_000):
        add({"salary": 1_500_000, "otherDeductions": v})
    # employer NPS: the limit is a share of basic + DA, different for the two regimes and for a Government employer
    for gov in (False, True):
        for nps in (0, 50_000, 120_000, 168_000, 250_000):
            add({"salary": 2_000_000, "basicPlusDa": 1_200_000, "employerNps": nps, "employerGovernment": gov})
    # HRA: each of the three amounts is the least in turn; high-city and other
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 100_000, "rentPaid": 400_000, "highCity": True})      # received is least
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 300_000, "rentPaid": 150_000, "highCity": True})      # rent excess is least
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 400_000, "rentPaid": 500_000, "highCity": True})      # 50% of salary is least
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 400_000, "rentPaid": 500_000, "highCity": False})     # 40% of salary is least
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 300_000, "rentPaid": 60_000, "highCity": False})      # rent below 10% of salary: zero
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 300_000, "rentPaid": 60_001, "highCity": False})
    add({"salary": 1_800_000, "basicPlusDa": 355_555, "hraReceived": 200_000, "rentPaid": 100_000, "highCity": True})     # fractional rupees in rent - 10% of salary
    add({"salary": 1_800_000, "basicPlusDa": 600_000, "hraReceived": 0, "rentPaid": 400_000})
    add({"salary": 1_800_000, "hraMode": "manual", "hraManual": 250_000})
    add({"salary": 1_800_000, "hraMode": "manual", "hraManual": 0})
    # the exemption can be larger than the income it is taken from
    add({"salary": 600_000, "basicPlusDa": 500_000, "hraReceived": 100_000, "rentPaid": 400_000, "highCity": True, "section80C": 150_000})
    # typical salaried scenarios
    add({"salary": 1_500_000})
    add({"salary": 1_500_000, "section80C": 150_000, "healthSelfFamily": 25_000, "ownNps": 50_000, "homeLoanInterest": 200_000})
    add({"salary": 2_500_000, "basicPlusDa": 1_000_000, "hraReceived": 500_000, "rentPaid": 480_000, "highCity": True,
         "section80C": 150_000, "healthSelfFamily": 25_000, "healthParents": 50_000, "parentsSenior": True, "ownNps": 50_000,
         "homeLoanInterest": 200_000, "professionalTax": 2_400})
    add({"salary": 3_500_000, "basicPlusDa": 1_400_000, "hraReceived": 700_000, "rentPaid": 840_000, "highCity": True,
         "section80C": 150_000, "ownNps": 50_000, "healthSelfFamily": 25_000, "homeLoanInterest": 200_000, "otherDeductions": 300_000})
    add({"salary": 2_000_000, "basicPlusDa": 800_000, "hraReceived": 400_000, "rentPaid": 600_000, "highCity": True,
         "section80C": 150_000, "ownNps": 50_000, "healthSelfFamily": 25_000, "homeLoanInterest": 200_000, "otherDeductions": 600_000})
    # break-even across incomes, with no deductions
    for lakh in (3, 5, 7, 8, 9, 10, 12, 12.75, 13, 14, 15, 16, 18, 20, 22, 24, 25, 30, 35, 40, 45, 49.99, 50):
        add({"salary": int(round(lakh * 100_000))})
    return out


if __name__ == "__main__":
    results = [run(c) for c in cases()]
    print(json.dumps(results, indent=None, separators=(",", ":")))
