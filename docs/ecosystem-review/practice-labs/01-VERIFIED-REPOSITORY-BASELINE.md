# 01 Verified repository baseline

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

**Owner decision recorded 2026-10-28:** the Option B scope baseline in doc 18 was approved with conditions. Only what doc 18 records as approved is approved; everything else in this document remains a proposal for Master Prompt 2 to develop. No implementation has started.

Practice Labs & Smart Flashcards ecosystem, Prompt 1 of 3 (research and requirements). Written 2026-10-28. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`.

Evidence labels used throughout: **OBSERVED** (seen on a public page or in the repository this session), **CLAIMED** (stated by the source about itself, not verified), **INFERRED** (reasoned from observations), **UNKNOWN** (not established). **VERIFIED/HYPOTHESIS** follow rulebook 12.

## Read-only checkpoint (strictly read-only; no file was changed before this package)

| Item | Result |
|---|---|
| Repository root | `C:/Users/DELL/Documents/Toolzenhub` |
| Branch | `main` |
| HEAD | `ba5b9cd` ("fix(privacy): distinguish local calculator processing from third-party page assets"). This matches the last reported closure, but it was read from Git this session, not assumed. |
| Working tree at start | clean (0 changed paths) |
| Remote | `origin` = `https://github.com/salar500/Toolzenhub`. The local tracking ref `origin/main` is `0dc368b`; `main` is **30 commits ahead** of it. The remote was not contacted, so this is the state at the last fetch, not a live reading. |
| Authoritative rulebook | `docs/product-decision-rules.md` (236 lines), read in full. `CLAUDE.md` points to it. |
| Deployment | Nothing pushed, deployed or published in this phase; Hostinger and `toolzenhub.in` untouched. |

## Inventory (from `tests/inventory/url-inventory.json`, the generated catalog inventory)

| Ecosystem | Published | Verified |
|---|---|---|
| Calculators | 19 | matches the previous report |
| Time Tools | 13 | matches |
| Developer Tools | 12 | matches |
| Image and PDF Tools | 5 | matches (1 image tool, 4 PDF tools) |
| **Total tools** | **49** | |
| Published articles | 34 | |
| Live pages | 102 (all indexable) | |
| Coming-soon calculators | 11 (none routable) | |
| Coming-soon articles | 6 (none routable) | |

Sections registered in `assets/js/data/categories.js`: `calculators`, `time-tools`, `developer-tools`, `image-tools`, `pdf-tools`. Every non-calculator tool is routed `/tools/<id>/` (rulebook 4.3).

## Architecture facts relevant to this research (OBSERVED in the repository)

- A tool is one ES module `assets/js/tools/<id>/index.js` with a pure engine beside it (for example `jsonpath-engine.js`); engines do not touch the DOM or `window`. The catalog (`assets/js/data/tools.js`) is the single source for identity, SEO, aliases, section, related tools and capabilities.
- Pages are static HTML from Eleventy templates in `src/`; the preview is served under `/Toolzenhub/` and production at the root; both builds must work (rulebook 11).
- Shared UI helpers exist: `assets/js/ui/{escape,field,result,dialog-focus}.js`, a breadcrumb, header, footer and related-tools component.
- **Storage:** the only browser storage in the site code is the analytics consent key `tz-analytics-consent` in `assets/js/analytics.js`. Tools state that nothing is stored. Rulebook 7.7 forbids persistence, sounds, notifications, accounts, history, streaks, points and gamification by default unless a documented reason exists.
- **No service worker** (searched `assets` and `src`), so no offline caching layer exists.
- **No Content-Security-Policy** is configured anywhere in the repository (searched `src`, `netlify`, the Eleventy config and `scripts`). What production headers Hostinger sends was not inspected.
- No vendored learning or database library exists. Vendored libraries are `jspdf` and `pdf-lib` only.
- Testing policy (rulebook 10): risk-based, one worker, focused specs, no routine full regression; the development laptop has about 4 GB RAM. A browser regression was killed for low memory during the calculators closure.
- Only system Chrome is available for browser tests; Firefox and WebKit are not installed.

## Earlier records that already mention this area

- `docs/tool-pack-factory.md` and `docs/ecosystem-review/02-PENDING-AND-DEFERRED-INVENTORY.md` list **SQL Practice Lab** and **QA Testing Practice Lab** as P1 planning candidates (Very high), "Undecided" section, "no section fits", with the intended flow "learn, practise, validate, apply", deterministic validation that accepts every correct alternative, and no AI API. They also list Excel, Playwright locator, Workplace English and Quantitative Aptitude practice candidates, and put **Study Revision Planner** on hold because it "needs a tool-specific persistence justification under rule 7.7". **Interview Scenario Practice** is excluded as a duplicate of the QA lab.
- These are planning records that authorise nothing. This research does not override them; it adds evidence and a recommendation, and says where it departs (doc 08: the QA lab is split into a Test Design Lab plus a Software testing deck; SQL stays P1).

## Previously approved exclusions and constraints carried forward

No paid API; no external AI at run time; no backend; no accounts; user input never leaves the browser (rule 8.8); no persistence, streaks, points or gamification by default (7.7); real pages only and no coming-soon cards for new sections (4.4); a tool belongs to exactly one section and related lists never cross sections (4.2); hotlinked photos are not a default (6.4); the Currency exclusion remains binding (not relevant here).

## Limits of this baseline

The remote was not fetched, so the "30 commits ahead" figure is relative to the last known tracking ref. The production site headers were not inspected. Counts come from the generated inventory, which the repository's own inventory check keeps current.
