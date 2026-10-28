# Stage 3 audit scripts

Throwaway audit scripts kept as evidence for `docs/tool-packs/calculators-ecosystem-2-0-ledger.md` (Stage 3 section). They are not part of the build or the test suite; the permanent checks are `tests/unit/calculators-stage3-audit.test.mjs` and the specs named in the ledger.

| Script | What it did |
|---|---|
| `xl_xirr.ps1` | Ran Microsoft Excel's own `XIRR` (Excel 16, COM) on ten cash-flow sets. Windows PowerShell only. |
| `xirr_oracle.py` | Python `decimal` 400-step bisection for the same ten sets (run with `python -I`). |
| `xirr_cmp.mjs` | Compared the engine with the Excel values. |
| `xirr_fuzz.mjs`, `xirr_none.mjs` | 3,000 random cash-flow sets (termination, finiteness, residual, time); a 100-times denser scan of 150 "no rate" outcomes. |
| `emi_oracle.py`, `emi_diff.mjs` | Decimal oracle for 240 EMI, 240 payoff and 193 rate-solving cases, compared with the engines. |
| `ppf_infl_oracle.py`, `ppf_infl_diff.mjs` | Closed-form PPF and inflation oracle (120 cases each), compared with the engines. |

The `.mjs` scripts import the engines through absolute `file:///C:/Users/DELL/Documents/Toolzenhub/...` URLs and read oracle JSON written next to them by the Python scripts; edit the paths to rerun elsewhere.
