# 13. Shared integration requirements

PROJECT: ToolZenHub
ECOSYSTEM: Calculators
STATUS: PROPOSED — NOT APPROVED FOR IMPLEMENTATION
PHASE: Research and requirements, 2026-10-28

Research and planning only. No application code, test, baseline, rulebook, roadmap or Tool Pack was changed.

| ID | Area | Requirement | Stage 2 action | Risk |
|---|---|---|---|---|
| INT-CAT-001 | Catalog | `assets/js/data/tools.js` is the single source; new XIRR entry plus EMI aliases and curated related lists; `realtime` flags set for EMI, PPF | edit catalog; run tool-catalog and relationships tests | R12 |
| INT-CAT-002 | Hardcoded counts | The inventory (59 entries today), the search-index size backstop (58,000 bytes), pinned alias lists and relationship pins change deliberately; each is named in the report | update and justify each | R12 |
| INT-BASE-001 | Base path | All links relative or base-aware for the GitHub Pages `/Toolzenhub/` path | run existing path checks | R13 |
| INT-HOST-001 | Hostinger | The root-hosted build is produced by the existing script; **production is never touched** and the new page is held until the owner approves a release | build only; no upload | R13 |
| INT-GROW-001 | Growth OS | Page type, article links and manifest entries follow the existing growth manifest rules; the growth export test must still pass | regenerate and run | R13 |
| INT-ANA-001 | Analytics | Events only through the consent-gated helper; no input values in events | review | R06 |
| INT-SEO-001 | SEO | Title, description, canonical, structured data, sitemap entry and internal links for XIRR; existing pages keep their URLs and metadata unless the spec says otherwise | build check | R12 |
| INT-SEC-001 | Vendoring | Any vendored PDF file gets a notice and a hash test like pdf-lib | add test | R06 |
| INT-DOC-001 | Documentation | Specs 45 to 50 written from this package after approval; rulebook updated in the same phase only for a decision the owner approves | docs | R17 |
| INT-TEST-001 | Tests | Golden tests for new arithmetic; browser specs for new interaction; run sequentially with one worker given the 4 GB machine | test plan | R18 |

Known unrelated defect to carry in the report: `design-tokens` fails on a hard-coded colour in `assets/css/calculators/gratuity.css:572` (predates this work).
