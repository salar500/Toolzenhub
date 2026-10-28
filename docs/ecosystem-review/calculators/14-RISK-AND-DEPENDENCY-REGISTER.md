# 14. Risk and dependency register

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

| ID | Risk | Likelihood | Impact | Mitigation | Owner decision needed |
|---|---|---|---|---|---|
| R01 | Wrong formula or convention in a new or changed calculation | Med | High | independent references (11), golden tests, stated conventions | no |
| R02 | Schedule rounding makes rows and totals disagree | Med | Med | totals from unrounded values, note shown, tolerance tested | no |
| R03 | Wording implies advice, guarantee or lender quote | Med | Med | wording rules and scans (NFR-CONTENT-001) | no |
| R04 | Live updating announces too often or hides errors from assistive technology | Med | High | one settled announcement, measured | no |
| R05 | Removing a button breaks existing specs or a stored expectation | High | Med | rewrite specs deliberately; engines and goldens unchanged | no |
| R06 | Third-party script or font loading at click time (F-SEC-1) or any new network use | High today | High | vendor with hash test or drop PDF | **yes: vendor versus drop PDF** |
| R07 | XIRR convergence failure or surprising root | Med | Med | bracketing, deterministic scan, plain messages | no |
| R08 | Malformed or hostile pasted text | Med | Med | caps, strict parsing, textContent | no |
| R09 | Extreme values or long schedules slow the page | Low | Med | bounded loops, Stage 3 measurement | no |
| R10 | Convention differences read as errors by visitors comparing sites | High | Med | state conventions on the page (SIP, XIRR) | no |
| R11 | Rules expire: tax config valid through 2027-03-31; PPF official text unread | Certain | High | annual update task; read PPF scheme before Stage 2 | no |
| R12 | Hardcoded counts, aliases, pins and the search-size backstop fail | High | Low | update deliberately and name each | no |
| R13 | Base path, Hostinger build or Growth OS mismatch | Low | Med | existing checks; no production contact | no |
| R14 | Mobile overflow with schedules or 100 XIRR rows | Med | Med | stacked cards, own-container scroll | no |
| R15 | Accessibility regressions | Med | High | scans and keyboard scripts | no |
| R16 | Scope creep into tax, charges or files in XIRR | Med | Med | explicit exclusions (FR-XIRR-022) | no |
| R17 | Documents drift from approved decisions | Low | Med | record decisions in the owning doc in the same phase | no |
| R18 | Test runs exhaust the 4 GB laptop | High | Low | sequential, one worker, focused specs | no |

**Dependencies:** Pack 49 depends on nothing; pack 50's XIRR links depend on pack 49; pack 46's decision on vendoring versus dropping PDF must be made before development; pack 48 depends on none. Unvalidated demand (05) is accepted, not mitigated, until post-release data exists.
