# 10. Nonfunctional requirements

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

Each requirement applies to every P0 pack unless a pack is named. Verification methods are planned, not executed.

| ID | Area | Requirement | Verification (planned) | Risk |
|---|---|---|---|---|
| NFR-ACC-001 | Accessibility | Every control labelled; errors programmatically linked; keyboard-complete; one polite status announcement per settled result; focus never moved by updates | automated scan plus keyboard script, per tool | R15 |
| NFR-ACC-002 | Accessibility | Contrast and focus visibility equal to the site standard; reduced-motion honoured | existing design-token and style checks | R15 |
| NFR-MOB-001 | Mobile | No page-level horizontal scroll at 320, 360, 390 px; targets at least 44 px; inputs at least 16 px; reserved result space | measured in a browser at those widths | R14 |
| NFR-PERF-001 | Performance | No work per keystroke beyond validation; solvers bounded (600 months, 100 rows, 200 iterations) | code review plus measured timing recorded in Stage 3 (no figure claimed here) | R09 |
| NFR-PERF-002 | Performance | No new runtime dependency; no network after load; page weight increase recorded | request log, size report | R06 |
| NFR-SEC-001 | Security | No third-party script, font or style at runtime; any vendored file pinned with a hash test | network log with foreign hosts aborted; hash unit test | R06 |
| NFR-SEC-002 | Security | Visitor strings placed with textContent or as control values; paste size capped before parsing | injection tests | R08 |
| NFR-PRIV-001 | Privacy | No storage, no address-bar state, no sending of inputs; analytics only through the existing consent mechanism and carrying no inputs | storage and request assertions; analytics test | R06 |
| NFR-NUM-001 | Numeric | Unrounded calculation, display-only rounding half up; money in whole paise where the tool parses amounts; no "-0.00" | golden and property tests | R01, R10 |
| NFR-NUM-002 | Numeric | Every golden value traceable to 11, not to the code under test | review of expected-value source | R01 |
| NFR-REG-001 | Regulatory | Dated configurations (tax year, gratuity, salary) keep their expiry states; 2027-03-31 recorded as the next update date; no change to them in P0 | existing tests unchanged | R11 |
| NFR-SEO-001 | SEO | URLs unchanged; new XIRR page has title, description, canonical, structured data and sitemap entry per existing generators | build checks | R12, R13 |
| NFR-CONTENT-001 | Content | Wording avoids best, cheapest, guaranteed, safe, approved, eligible; estimates labelled; assumptions beside results | wording scan in specs | R03 |
| NFR-BASE-001 | Deployment | All links and assets work under the GitHub Pages base path and on the root-hosted Hostinger build | existing path and build checks | R13 |
| NFR-TEST-001 | Testing | Hardcoded counts and pins updated deliberately and named; no assertion weakened; visual baselines updated only with review | test report | R12 |
| NFR-MAINT-001 | Maintainability | Pure engine modules separate from DOM; shared helper (inflation) pure and tested alone | review | R05 |
