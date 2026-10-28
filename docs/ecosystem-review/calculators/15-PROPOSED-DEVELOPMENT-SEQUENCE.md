# 15. Proposed development sequence

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

Pack numbers are provisional; the last existing spec is 44.

| Order | Pack | Scope | Why this order | Depends on | Rollback |
|---|---|---|---|---|---|
| 1 | 46 | Loan Comparison button removal and PDF remediation | closes the only third-party-loading finding; smallest interaction change | owner choice vendor/drop | revert one commit; no data involved |
| 2 | 45 | EMI 2.0 | largest user-facing change; reuses engines | none | revert one commit; route unchanged |
| 3 | 47 | PPF automatic results | small; needs the official PPF text read first | FR-PPF-006 | revert one commit |
| 4 | 48 | Inflation view in SIP and SWP | optional field; pure helper | none | revert; fields are additive |
| 5 | 49 | XIRR (new) | new tool built last on a stable base | none | not released to production until approved; revert or hold |
| 6 | 50 | Related navigation and aliases | needs XIRR to exist for its links | 49 | revert catalog edit |

Each pack follows the permanent three stages (research, development, testing) and a separate owner approval before any release. Nothing here authorizes a commit, push or deployment; production (`toolzenhub.in`) stays untouched.

**Later candidates (not approved):** Credit Card Payoff live, snowball/avalanche, RD, interest solver, weighted average, retirement planner, SIP lumpsum, Percentage discount mode, copy-summary helper, Unit Converter, inflation page (07).
