# Site-wide audit and release ledger

Owner prompt of 2026-11-08: "Ultimate autonomous development, improvement, testing and production master plan".

The ledger records findings, changes, test results and blockers, phase by phase. The scope is the whole site: 662 live pages and 1 × 404, from the URL inventory.

## Phase 1: audit (2026-11-08, branch `feature/unified-ecosystem-workspace`)

### Inventory

| Section | Pages |
|---|---|
| Practice Labs | 531 (530 learning pages and ShopLite) |
| Articles | 40 |
| Tools (`/tools/`) | 39 |
| Calculators | 30 |
| Home, directories, category pages, about, contact, legal and 404 | 22 |

Test infrastructure: 174 unit test files, 103 Playwright specs, and static checkers for links, assets, SEO and the URL inventory.

### Positive findings, preserved unchanged

- The architecture is a static Eleventy build with central routes, a base path per build, and per-page lazy-loaded engines.
- The site has a large, meaningful test base: 3,943 unit tests covering calculators, tools, labs, SEO and build output.
- Runtime is clean:
  - Every page loads without JavaScript errors or failed local requests, at 390 px and at 1280 px.
  - No page has horizontal overflow.
  - Every page shows its inventoried primary element.
- Links, assets and SEO metadata pass on all 663 pages once the checkers know the new page types (see below).

### Negative findings and what was done

| # | Finding | Kind | Action | Commit |
|---|---|---|---|---|
| 1 | URL inventory stale: Practice Labs pages missing, then classified as "unknown" | Test infrastructure | Classify `learn` and `practice-target` (ShopLite) pages; regenerate (662 live pages) | `6f58d21` |
| 2 | SEO check did not expect BreadcrumbList on learning pages | Test infrastructure | Expect it, so the visible breadcrumb is now validated against the structured data. ShopLite only has to be noindex | `6f58d21` |
| 3 | Asset check flagged simulated file names ("config.json") and runtime-resolved strings inside vendored Pyodide | False positives | Explicit per-file marker; static imports of vendored Pyodide are still checked | `6f58d21` |
| 4 | Production `.htaccess` had no MIME types for `.mjs` and `.wasm`, so Python lessons could fail on Apache/LiteSpeed | **Production defect** | Added AddType rules; build-output test requires them (red on the old build, green now) | `43ac51e` |
| 5 | `py-x-unique-sorted` was flaky: Python string-set order depends on hash randomisation | Test defect | Added a deterministic integer case | `43ac51e` |
| 6 | Directory test counted the workspace sidebar's links as category-grid links | Stale test (since 2026-11-07) | Scoped to the grid | `43ac51e` |
| 7 | Design-token test: two runtime-set rail variables, plus one undefined `--surface` in `learn.css` | 1 real (`--surface`), 2 documented | `--surface-card` used; rail variables documented | `43ac51e` |
| 8 | Workflow test allowed only `main`, while rule 11.3 allows one named development branch | Stale test | Encodes rule 11.3 | `43ac51e` |
| 9 | Analytics and stylesheet-order tests applied to ShopLite | Stale test | ShopLite asserted as untracked and outside the design system | `43ac51e` |
| 10 | SEO keyword map covered 131 of 662 pages | Stale generated document | Generator handles learning pages; regenerated; cannibalisation warnings 19 → 2 | `43ac51e` |
| 11 | Growth-manifest export check refuses off `main` (BRANCH_UNEXPECTED) | Intended guard | Not changed; it passes on `main` | none |

### Checks run in this phase

| Check | Result |
|---|---|
| `npm run test:static` | Inventory, links (33,387 anchors), assets and SEO all pass on 663 pages |
| Full unit suite | 3,943 tests: 3,929 pass, 10 fail, 4 skipped. Nine failures fixed and re-run green; one intended guard remains (#11) |
| Runtime crawl at 390 px and 1280 px | All 663 pages: no page errors, console errors, failed requests or overflow; primary element present everywhere |
| Production build (`dist/`) | Builds; the build-output test passes (17); `.htaccess` has the MIME rules; engine files present; no preview host except the intended GitHub "report a problem" links |
| Preview deployment | Confirmed serving `43ac51e` (changed files fetched from the live preview) |

### Not yet run (next phases, per the owner's order)

- The Playwright browser suite (103 specs across desktop, mobile and root projects).
- Visual regression and the accessibility suites.

These form the comprehensive regression (phase 8), which follows the owner's preview inspection (phases 6 and 7).

### Blocker for phase 10

There is no Hostinger access from this environment. Production is "manually controlled and intentionally disconnected from GitHub" (rule 11.4), and the owner has requested deployment in this prompt.

- What can be done here: a verified `dist/` artifact.
- What the owner must do: the upload, and a backup of the current site before it.
