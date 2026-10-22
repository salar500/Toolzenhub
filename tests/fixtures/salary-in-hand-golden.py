"""
Independent reference for the Salary / CTC to In-Hand Calculator (Tool Pack 30), tax year 2026-27.

Written from the specification (docs/tool-packs/30-salary-ctc-in-hand.md, sections 6 and 7) and the primary sources it
records (EPF Scheme 2026 paragraphs 18(2), 18(3), 18(5); S.O. 5109(E); S.O. 3582(E); Income-tax Act 2025 Schedule XV and
s.123), NOT from the JavaScript. It does not read, import, run or transliterate assets/js/calculators/formulas/salary-in-hand.js.
Where the JavaScript works in integers with the algebra simplified (for example the full-basic contribution as
12 x basic / 1200), this reference keeps the specification's own steps in exact `Fraction` arithmetic (a monthly basic of
basic / 12, then 12% of it, then round half up) so a mistake in either shows as a mismatch.

The tax is taken from the reference of Tool Pack 17 (tests/fixtures/income-tax-golden.py), which was itself written from the
statute and pinned by its own 238 cases. That file is loaded as a library; nothing in it is changed.

Every figure is cross-checked inside this script before it is written: the rounding is re-derived with `Decimal`, the CTC
identity is recomputed from the lines, and the properties the specification states (capped equals full-basic below the
ceiling, employee PF equals employer PF, the pinned examples) are asserted. A failed assertion stops the script.

Run:  python tests/fixtures/salary-in-hand-golden.py            (prints JSON)
      python tests/fixtures/salary-in-hand-golden.py --write    (rewrites tests/fixtures/salary-in-hand-golden.json)
"""
import importlib.util
import sys
sys.dont_write_bytecode = True
import json
import os
from decimal import ROUND_HALF_UP, Decimal, localcontext
from fractions import Fraction as F

HERE = os.path.dirname(os.path.abspath(__file__))

_spec = importlib.util.spec_from_file_location("tp17_reference", os.path.join(HERE, "income-tax-golden.py"))
tp17 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(tp17)

# --- the rules of this tool, as the specification states them (not read from the JavaScript's configuration) -----------
PF_RATE = F(12, 100)                 # S.O. 3582(E); scheme 18(2)
CEILING = F(25000)                   # S.O. 5109(E): rupees per month, from 17 September 2026
GRATUITY_DAYS, GRATUITY_MONTH_DAYS = 15, 26   # 15 days a year, a month of 26 days, spread over 12 months
CTC_CAP = 5_000_000
VALID_FROM, VALID_THROUGH = "2026-04-01", "2027-03-31"
BASES = ("capped", "full-basic", "none")


def rhu(x):
    """round half up to the whole rupee of a non-negative exact value"""
    n = (F(x) + F(1, 2)).__floor__()
    with localcontext() as ctx:                      # an independent second derivation of the same rounding
        ctx.prec = 60
        q = Decimal(F(x).numerator) / Decimal(F(x).denominator)
        assert n == int(q.quantize(Decimal(1), rounding=ROUND_HALF_UP)), (x, n)
    return n


def is_amount(v):
    return isinstance(v, int) and not isinstance(v, bool) and v >= 0


def absent(v):
    return v is None or v == ""


def hundredths(v):
    """the basic percentage as an exact Fraction of a percent, or None when it is not 1 to 100 with at most two decimals"""
    if isinstance(v, bool) or not isinstance(v, (int, float, str)):
        return None
    text = repr(v) if isinstance(v, float) else str(v)
    parts = text.split(".")
    if not (1 <= len(parts) <= 2) or not parts[0].isdigit() or len(parts[0]) > 3:
        return None
    if len(parts) == 2 and not (parts[1].isdigit() and 1 <= len(parts[1]) <= 2):
        return None
    pct = F(text)
    return pct if 1 <= pct <= 100 else None


def decompose(ctc, pct, basis, gratuity_included, other):
    basic = rhu(F(ctc) * pct / 100)
    monthly_basic = F(basic, 12)
    if basis == "capped":
        pf_base = min(monthly_basic, CEILING)
    elif basis == "full-basic":
        pf_base = monthly_basic
    else:
        pf_base = F(0)
    monthly_pf = rhu(PF_RATE * pf_base)
    employer_pf = 12 * monthly_pf
    employee_pf = monthly_pf * 12
    gratuity = rhu(F(basic) * GRATUITY_DAYS / GRATUITY_MONTH_DAYS / 12) if gratuity_included else 0
    gross = ctc - employer_pf - gratuity - other
    return dict(basic=basic, monthlyPf=monthly_pf, employerPf=employer_pf, employeePf=employee_pf,
                gratuity=gratuity, gross=gross)


def tp17_input(**fields):
    return dict(tp17.DEFAULTS, **fields)


def regime(gross, employee_pf, pt, tax):
    take_home = gross - employee_pf - pt - tax
    return dict(tax=tax, annualTakeHome=take_home, monthlyAverage=rhu(F(take_home, 12)) if take_home >= 0 else 0), take_home


def old_regime(settings, d, pt):
    if not isinstance(settings, dict) or settings.get("enabled") is not True:
        return dict(status="off")
    errors, missing = {}, []
    for k in ("hraReceived", "rentPaid", "other80C"):
        v = settings.get(k)
        if absent(v):
            missing.append(k)
        elif not is_amount(v):
            errors[k] = True
    hra, rent = settings.get("hraReceived"), settings.get("rentPaid")
    needs_metro = is_amount(hra) and hra > 0 and is_amount(rent) and rent > 0
    if needs_metro and not isinstance(settings.get("highCity"), bool):
        missing.append("highCity")
    if errors:
        return dict(status="invalid", errorKeys=sorted(errors))
    if missing:
        return dict(status="incomplete", missing=missing)
    if hra + d["basic"] > d["gross"]:
        return dict(status="invalid", errorKeys=["hraReceived"])
    i = tp17_input(salary=d["gross"], basicPlusDa=d["basic"], professionalTax=pt,
                   section80C=d["employeePf"] + settings["other80C"], hraReceived=hra, rentPaid=rent,
                   highCity=bool(needs_metro and settings["highCity"]))
    figures, take_home = regime(d["gross"], d["employeePf"], pt, tp17.old_regime(i)["final"])
    if take_home < 0:
        return dict(status="invalid", errorKeys=["decomposition"])
    return dict(status="ok", **figures)


def reference(case_input, options):
    """the expected outcome of one case, from the specification"""
    inp = case_input
    errors, missing = {}, []

    ctc = inp.get("ctc")
    if absent(ctc):
        missing.append("ctc")
    elif not is_amount(ctc) or ctc == 0:
        errors["ctc"] = True

    pct = None
    if absent(inp.get("basicPercent")):
        missing.append("basicPercent")
    else:
        pct = hundredths(inp.get("basicPercent"))
        if pct is None:
            errors["basicPercent"] = True

    basis = inp.get("pfBasis")
    if absent(basis):
        missing.append("pfBasis")
    elif basis not in BASES:
        errors["pfBasis"] = True

    gi = inp.get("gratuityIncluded")
    if absent(gi):
        missing.append("gratuityIncluded")
    elif not isinstance(gi, bool):
        errors["gratuityIncluded"] = True

    for k in ("otherEmployerCosts", "professionalTax"):
        if not absent(inp.get(k)) and not is_amount(inp.get(k)):
            errors[k] = True

    as_of = options.get("asOf")
    if "asOf" in options and (not isinstance(as_of, str) or len(as_of) != 10 or as_of[4] != "-" or as_of[7] != "-"
                              or not (as_of[:4] + as_of[5:7] + as_of[8:]).isdigit()):
        errors["asOf"] = True

    if errors:
        return dict(status="invalid", errorKeys=sorted(errors))
    if missing:
        return dict(status="incomplete", missing=missing)
    if "asOf" in options and not (VALID_FROM <= as_of <= VALID_THROUGH):
        return dict(status="unsupported", reason="outside-validity")
    if ctc > CTC_CAP:
        return dict(status="unsupported", reason="ctc-above-cap")

    other = inp.get("otherEmployerCosts") or 0
    pt = inp.get("professionalTax") or 0
    d = decompose(ctc, pct, basis, gi, other)

    if d["gross"] <= 0 or d["gross"] < d["basic"]:
        return dict(status="invalid", errorKeys=["decomposition"])
    if pt > d["gross"]:
        return dict(status="invalid", errorKeys=["professionalTax"])

    new_tax = tp17.new_regime(tp17_input(salary=d["gross"], basicPlusDa=d["basic"], professionalTax=pt))["final"]
    new_figs, take_home = regime(d["gross"], d["employeePf"], pt, new_tax)
    if take_home < 0:
        return dict(status="invalid", errorKeys=["decomposition"])

    # --- cross-checks that must hold for every successful case ---------------------------------------------------------
    assert d["employeePf"] == d["employerPf"]
    assert ctc == take_home + d["employeePf"] + pt + new_tax + d["employerPf"] + d["gratuity"] + other
    if basis == "capped" and F(d["basic"], 12) <= CEILING:
        assert d["monthlyPf"] == decompose(ctc, pct, "full-basic", gi, other)["monthlyPf"]
    if basis == "capped" and F(d["basic"], 12) >= CEILING:
        assert d["monthlyPf"] == 3000
    if basis == "none":
        assert d["employerPf"] == 0

    out = dict(status="ok", ctc=ctc, basic=d["basic"], pfBasis=basis, monthlyPf=d["monthlyPf"],
               employerPf=d["employerPf"], employeePf=d["employeePf"], gratuity=d["gratuity"],
               otherEmployerCosts=other, gross=d["gross"], professionalTax=pt, new=new_figs)
    out["old"] = old_regime(inp.get("oldRegime"), d, pt)
    return out


# --- the cases ------------------------------------------------------------------------------------------------------------
def cases():
    out = []

    def add(cid, inp, options=None, note=""):
        out.append(dict(id=cid, note=note, input=inp, options=options or {}))

    def base(**kw):
        d = dict(ctc=1_200_000, basicPercent=50, pfBasis="capped", gratuityIncluded=True)
        d.update(kw)
        return {k: v for k, v in d.items() if v is not None or k in kw and kw[k] is None}

    # specification section 8 (illustrative cases) and the pinned rounding example
    add("spec-A", base(professionalTax=2400))
    add("spec-B", base(pfBasis="full-basic", professionalTax=2400))
    add("spec-C", base(ctc=2_000_000, gratuityIncluded=False, professionalTax=2500))
    add("spec-D", base(ctc=600_000, basicPercent=40, pfBasis="full-basic", gratuityIncluded=False))
    add("pf-tie-full", base(ctc=800_100, gratuityIncluded=False, pfBasis="full-basic"), note="basic 4,00,050; monthly 33,337.50; 12% = 4,000.50 ties up")
    add("pf-tie-capped", base(ctc=800_100, gratuityIncluded=False, pfBasis="capped"), note="same basic, capped: 3,000")

    # the ceiling boundary for the capped basis: annual basic 299,988 / 299,994 / 300,000 / 300,006 (monthly 24,999 .. 25,000.5)
    for ctc in (599_976, 599_988, 599_999, 600_000, 600_001, 600_012, 600_024):
        for basis in ("capped", "full-basic"):
            add("ceiling-%d-%s" % (ctc, basis), base(ctc=ctc, pfBasis=basis, gratuityIncluded=False))

    # gratuity half-rupee tie: basic 52 x odd (15 x 52 / 312 = 2.5)
    add("gratuity-tie", base(ctc=104_104, gratuityIncluded=True, pfBasis="none"), note="basic 52,052; 15 x 52,052 / 312 = 2,502.5")
    add("gratuity-off-same", base(ctc=104_104, gratuityIncluded=False, pfBasis="none"))

    # basic rounding ties (CTC x percent / 100 ends in .5)
    add("basic-tie", base(ctc=4, basicPercent=12.5, pfBasis="none", gratuityIncluded=False), note="basic 0.5 rounds to 1")
    add("basic-pct-2dp", base(ctc=1_000_001, basicPercent="33.33"))
    add("basic-pct-1dp", base(ctc=1_000_001, basicPercent=33.3))

    # CTC range
    for ctc in (1, 2, 100, 5_000_000, 5_000_001, 0, -1, 1.5, "1200000", 99_999_999_999):
        add("ctc-%s" % ctc, base(ctc=ctc))
    # percentage range
    for pct in (0, 0.99, 1, 100, 100.01, 33.333, "abc", "1e2", -5, "", True, [], "50.", ".5", "050"):
        add("pct-%r" % (pct,), base(basicPercent=pct))
    add("pct-100-none-no-gratuity", base(basicPercent=100, pfBasis="none", gratuityIncluded=False), note="gross equals basic")
    add("pct-100-capped", base(basicPercent=100, pfBasis="capped"))
    add("pct-1-full", base(basicPercent=1))

    # required entries missing, one at a time and together
    for key in ("ctc", "basicPercent", "pfBasis", "gratuityIncluded"):
        inp = base()
        del inp[key]
        add("missing-" + key, inp)
        add("null-" + key, base(**{key: None}))
    add("missing-all", {})
    add("missing-and-invalid", {"basicPercent": 500})
    add("pf-basis-unknown", base(pfBasis="Capped"))
    add("pf-basis-none", base(pfBasis="none"))
    add("gratuity-string", base(gratuityIncluded="yes"))
    add("gratuity-number", base(gratuityIncluded=1))

    # optional amounts
    for pt in (0, 2400, 2500, -1, 2.5, "100"):
        add("pt-%r" % (pt,), base(professionalTax=pt))
    add("pt-above-gross", base(ctc=100_000, professionalTax=95_000), note="gross about 85,000")
    add("pt-max-valid", base(ctc=100_000, pfBasis="none", gratuityIncluded=False, professionalTax=100_000))
    add("pt-takes-all-new-tax-free", base(ctc=100_000, pfBasis="none", gratuityIncluded=False, professionalTax=99_999))
    for other in (0, 12_345, -1, 0.5):
        add("other-%r" % (other,), base(otherEmployerCosts=other))
    add("other-eats-gross", base(otherEmployerCosts=1_150_000))
    add("other-leaves-basic-exactly", base(pfBasis="none", gratuityIncluded=False, otherEmployerCosts=600_000))
    add("other-leaves-less-than-basic", base(pfBasis="none", gratuityIncluded=False, otherEmployerCosts=600_001))
    add("takehome-negative", base(ctc=100_000, basicPercent=87, pfBasis="full-basic", gratuityIncluded=False, professionalTax=89_000), note="gross 89,560; employee PF 10,440; PT 89,000")

    # the 80C cap: employee PF above 1,50,000 under full-basic at a high CTC (engine cap applies in the old regime)
    hi = dict(enabled=True, hraReceived=0, rentPaid=0, other80C=0)
    add("cap80c-full", base(ctc=5_000_000, pfBasis="full-basic", oldRegime=hi))
    add("cap80c-capped", base(ctc=5_000_000, pfBasis="capped", oldRegime=hi))
    add("cap80c-extra", base(ctc=1_500_000, pfBasis="capped", oldRegime=dict(hi, other80C=200_000)))

    # old-regime group
    add("old-off", base(oldRegime=dict(enabled=False, hraReceived=1)))
    add("old-absent", base())
    add("old-enabled-empty", base(oldRegime=dict(enabled=True)))
    add("old-zero", base(oldRegime=hi))
    add("old-no-metro-needed", base(oldRegime=dict(hi, hraReceived=120_000)))
    add("old-metro-missing", base(oldRegime=dict(hi, hraReceived=120_000, rentPaid=240_000)))
    add("old-metro-true", base(oldRegime=dict(hi, hraReceived=120_000, rentPaid=240_000, highCity=True)))
    add("old-metro-false", base(oldRegime=dict(hi, hraReceived=120_000, rentPaid=240_000, highCity=False)))
    add("old-hra-too-big", base(oldRegime=dict(hi, hraReceived=700_000, rentPaid=0)))
    add("old-hra-plus-basic-equals-gross", base(pfBasis="none", gratuityIncluded=False, oldRegime=dict(hi, hraReceived=600_000, rentPaid=0)))
    add("old-negative-field", base(oldRegime=dict(hi, rentPaid=-5)))
    add("old-fraction-field", base(oldRegime=dict(hi, other80C=10.5)))
    add("old-invalid-keeps-new", base(oldRegime=dict(hi, hraReceived=9_999_999)))
    add("old-enabled-string", base(oldRegime=dict(enabled="true", hraReceived=0, rentPaid=0, other80C=0)))
    add("old-with-pt", base(professionalTax=2500, oldRegime=hi))
    add("old-nobasis", base(pfBasis="none", oldRegime=hi))

    # tax-year validity (the caller supplies the date)
    for as_of in ("2026-04-01", "2027-03-31", "2026-03-31", "2027-04-01", "2026-10-22", "22/10/2026", "2026-1-5", "", None):
        add("asof-%s" % (as_of,), base(), options=dict(asOf=as_of))

    # grids (every combination)
    for ctc in (100_000, 360_000, 600_000, 1_200_000, 1_800_000, 2_000_000, 3_000_000, 5_000_000):
        for pct in (1, 25, 40, 50, 75, 100):
            for basis in BASES:
                for gi in (True, False):
                    for pt in (0, 2400, 2500):
                        n = len(out)
                        old = (None, dict(enabled=True, hraReceived=0, rentPaid=0, other80C=0),
                               dict(enabled=True, hraReceived=120_000, rentPaid=240_000, highCity=True, other80C=50_000))[n % 3]
                        add("grid-%d-%s-%s-%s-%d" % (ctc, pct, basis, "g" if gi else "n", pt),
                            base(ctc=ctc, basicPercent=pct, pfBasis=basis, gratuityIncluded=gi, professionalTax=pt, oldRegime=old))
    for ctc in (777_777, 1_234_567, 2_468_013):
        for other in (0, 12_345, 100_000):
            for pct in (33.33, 47.5, 52.25):
                add("odd-%d-%d-%s" % (ctc, other, pct), base(ctc=ctc, basicPercent=pct, otherEmployerCosts=other, professionalTax=2500))
    return out


def build():
    result = []
    ids = [c["id"] for c in cases()]
    assert len(ids) == len(set(ids)), "duplicate case ids"
    for c in cases():
        e = reference(c["input"], c["options"])
        result.append(dict(c, expect=e))
    # pinned examples from the specification, asserted here as literals typed from the spec (hand arithmetic), not computed
    byid = {c["id"]: c["expect"] for c in result}
    assert (byid["pf-tie-full"]["monthlyPf"], byid["pf-tie-full"]["employerPf"], byid["pf-tie-full"]["employeePf"]) == (4001, 48012, 48012)
    assert (byid["pf-tie-capped"]["monthlyPf"], byid["pf-tie-capped"]["employerPf"]) == (3000, 36000)
    assert byid["spec-A"]["gross"] == 1_135_154 and byid["spec-A"]["new"]["annualTakeHome"] == 1_096_754
    assert byid["spec-B"]["new"]["annualTakeHome"] == 1_024_754
    assert byid["spec-D"]["new"]["annualTakeHome"] == 542_400
    assert byid["gratuity-tie"]["gratuity"] == 2503, byid["gratuity-tie"]["gratuity"]
    return result


if __name__ == "__main__":
    cs = build()
    head = json.dumps(dict(
        source="tests/fixtures/salary-in-hand-golden.py (independent of the JavaScript; tax from tests/fixtures/income-tax-golden.py)",
        taxYear="2026-27"), ensure_ascii=True, sort_keys=True)[:-1]
    # one case per line: small, diff-friendly, still plain JSON
    lines = ",\n".join(json.dumps(c, ensure_ascii=True, sort_keys=True, separators=(",", ":")) for c in cs)
    text = head + ', "cases": [\n' + lines + "\n]}\n"
    if "--write" in sys.argv:
        with open(os.path.join(HERE, "salary-in-hand-golden.json"), "w", encoding="utf-8", newline="\n") as f:
            f.write(text)
        print("wrote %d cases" % len(cs))
    else:
        sys.stdout.write(text)
