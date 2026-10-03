# Regression safety net (M0)

Development-only tests that protect the site's behaviour through every architectural change.
None of this ships to visitors.

**Since M8 the tests run against the GENERATED site**, exactly what would be deployed: every
`npm test` / `test:visual` first builds both outputs (`npm run build:all`) and then serves
`dist-ghpages/` under `/Toolzenhub/` and `dist/` at the root. The static checkers read the build
output too (`tests/static/run-static.mjs` runs each of them against both builds).

## Run it

```bash
npm install            # once (installs Playwright + Lighthouse; uses your installed Google Chrome)

npm test               # everything functional: unit + static checks + browser tests   (~6.5 min on a 4-thread i3 laptop)
npm run test:visual    # screenshot comparison, machine-dependent, run separately      (~1.5 min)
npm run test:all       # both of the above
```

Individual pieces:

| Command | What it runs |
| --- | --- |
| `npm run test:unit` | Loan-formula and prepayment golden tests + mutation self-tests of the static checkers (Node's built-in runner) |
| `npm run test:static` | `inventory:check` + `test:links` + `test:assets` + `test:seo` (no browser, ~10 s) |
| `npm run test:links` | Static link/route checker, on both builds (base-aware; sitemap/robots on the production origin) |
| `npm run test:assets` | Static asset checker (exact-case), on both builds; the build output contains only deployable files |
| `npm run test:seo` | Generated-HTML SEO check on both builds: canonical / Open Graph / Twitter on https://toolzenhub.in, structured data, static article bodies, per-page scripts, sitemap, robots |
| `npm run build:all` | `npm run build` (dist/, base `/`) + `npm run build:preview` (dist-ghpages/, base `/Toolzenhub/`) |
| `npm run test:browser` | Playwright: smoke, 404, calculators, articles, contact, navigation, link crawl, DOM + SEO baselines — in `/Toolzenhub/` desktop + mobile and root-domain mode |
| `npm run test:visual` | Playwright screenshots (desktop, mobile, tablet) |
| `npm run inventory:generate` | Rebuild `tests/inventory/url-inventory.json` after pages are added/removed |
| `npm run baseline:update` | Re-record DOM/SEO/link/visual baselines **after you have reviewed an intentional change** |
| `npm run baseline:lighthouse` | Lighthouse baseline (slow, ~25 min on a laptop, informational) |
| `npm run test:mutation` | Negative controls: breaks a copy of both builds in 8 ways and checks the browser tests fail (~5 min) |

Run one file: `npx playwright test --project=subpath-desktop tests/browser/emi.spec.js`.

## What is tested

- **URL inventory** (`tests/inventory/url-inventory.json`): every real page (live/indexable, live/non-indexable, the 404 document) and every "Coming soon" entry that must **not** be a route. Generated from the repository itself; `inventory:check` fails if it drifts. It is also the seed for any future redirect map (`redirectSeed`).
- **Smoke** (`smoke.spec.js`): every inventory page loads, shows its primary element, has the expected `<title>`, header/footer, no broken images, no uncaught errors, no console errors, no failed local requests. Coming-soon URLs return 404; robots/sitemap/favicon are served.
- **404** (`notfound.spec.js`): real 404 status at several depths, wrong-case URLs, favicon and links resolved from the site root, works without JavaScript.
- **Links** (`check-links.mjs` static + `links.spec.js` rendered crawl): every `<a>` resolves (exact case), correct prefix in both `/Toolzenhub/` and root mode, every target is a known live route, sitemap ↔ inventory, registry ↔ pages, no *new* hard-coded `/Toolzenhub`.
- **Assets** (`check-assets.mjs`): every local JS/CSS/image/icon reference (HTML, CSS `@import`/`url()`, JS imports and asset-path strings) exists with **exact case**.
- **Sections and routing** (`tests/unit/sections.test.mjs`, also in root-domain mode): category → section ownership, tool → category → section derivation by id, and that every registered tool keeps its URL (checked against the catalog and the committed URL inventory). Counts that used to be literals now come from the URL inventory or the catalogs.
- **Shared tool UX** (`tests/unit/shared-ui.test.mjs`, plus the "shared field and result primitives" tests in `accessibility.spec.js`): what `assets/js/ui/` emits (label/hint/error wiring, escaping), that it imports nothing from calculators or Loans and touches no DOM at import, that EMI and the Loan Comparison modal use it, and that it can describe a converter, a date tool, a developer utility, a timer and a loan-style calculator (synthetic markup only).
- **Tool catalog** (`tests/unit/tool-catalog.test.mjs`): `data/tools.js` is the only owner of tool metadata and the calculator view/registry/search/site build/URL inventory derive from it; the catalog's validation (duplicate or malformed ids, missing title, unknown category/status/type, bad capabilities, loader rules, the removed `type` field, unknown related tools); loaders stay lazy and are named only in the catalog; the two real tools are unchanged.
- **Tool capabilities** (`tests/unit/tool-capabilities.test.mjs`): allowed tool types, capability keys and defaults, loud failure on unknown keys / non-boolean values / unknown types / capabilities on a Coming Soon tool, the exact EMI and Loan Comparison profiles (and that features they lack are not claimed), and that URLs, search entries and the tool module contract are unchanged.
- **Prepayment** (`tests/unit/prepayment-golden.test.mjs`): golden values from the independent Python reference `tests/fixtures/prepayment-golden.py` (re-run it with `python tests/fixtures/prepayment-golden.py` to regenerate), invariants over a grid, closed-form agreement, monotonicity, validation.
- **Formulas** (`tests/unit/loan-formulas.test.mjs`): golden EMI values (independently computed), zero-interest, validation contract, total repayment/interest, amortization invariants.
- **Flows**: EMI (`emi.spec.js`), Loan Comparison incl. the amortization modal (`loan-comparison.spec.js`), articles + listing (`articles.spec.js`), contact form (`contact.spec.js`), navigation/search/Coming-soon cards (`navigation.spec.js`).
- **Accessibility** (`accessibility.spec.js`): Loan Comparison modal focus (in, Tab trap, Escape, restore, inert page behind), accessible names of form controls, visible keyboard focus, reduced motion, landmarks, WebP `<picture>` with PNG fallback. **Design tokens** (`tests/unit/design-tokens.test.mjs`).
- **Baselines**: DOM structure of key regions (`tests/baselines/dom/`), SEO tags per page (`tests/baselines/seo/`), link-crawl summary (`tests/baselines/links/`), screenshots (`tests/baselines/visual/`), Lighthouse (`tests/baselines/lighthouse/`).
- **The checkers are themselves tested**: `static-checkers.test.mjs` injects real faults (wrong-case image, deleted CSS, dead link, Coming-soon URL in the sitemap, new hard-coded prefix…) into a temp copy and asserts they are caught.

## How the tests stay deterministic

- A local server (`tests/helpers/ghpages-server.mjs`) mimics GitHub Pages: **exact-case** paths, directory indexes, real **404 status** with `404.html`. It runs **in the test process**; nothing is left running afterwards.
- Chrome maps `salar500.github.io` → the local server, so the site's own hostname logic really runs (`/Toolzenhub/` prefix). A second host (`tools.example.test`) exercises the root-domain mode.
- **No external network.** Google Fonts and Unsplash are replaced by stubs; any other external request is blocked and fails the test. (PDF export loads jsPDF from a CDN, so it is not clicked; the control's presence is checked.)
- Tests wait for selectors, never for arbitrary delays.
- Two workers by default (more Chrome instances slow down small machines). Visual tests run with one.

## Baselines

All baselines are in **`tests/baselines/`** (one place):

```
baselines/dom/…           structural outlines (text)         – desktop, production mode
baselines/seo/…           title/description/canonical/OG/Twitter/JSON-LD/H1, raw vs rendered
baselines/links/…         placeholders, in-page fragments, external hosts found by the crawl
baselines/visual/…        <page>-visual-{desktop,mobile,tablet}.png
baselines/lighthouse/…    scores, metrics, failed audits
```

A failing baseline means the rendered output changed. If the change is intentional, review it
(Playwright writes diff images to `test-results/`), then run `npm run baseline:update` and commit the
new baseline together with the change. Do **not** change code to "make a screenshot pass" without looking at it.
Screenshots were recorded on one machine/OS; regenerate them on a new machine instead of loosening the tolerance.

## Lighthouse baseline (informational — not a pass/fail gate)

`npm run baseline:lighthouse` writes `tests/baselines/lighthouse/lighthouse-baseline.json`: for Home, EMI, Loan
Comparison and one article — scores, core metrics and every failed audit; median of 3 **mobile** runs plus 1 **desktop** run.

- Run against the local server in production (`/Toolzenhub/`) mode with **external hosts blocked**, so it measures the site's
  first-party cost only. Real-world numbers will be somewhat different.
- Scores depend on CPU speed; compare only with runs from the same machine (the file records the CPU and Lighthouse's `benchmarkIndex`).
- **Ignore these diagnostics: they are artifacts of the plain local test server, not of GitHub Pages** — "Does not use HTTPS",
  "Does not redirect HTTP to HTTPS", "Enable text compression", "Use HTTP/2", "Modern HTTP", "bfcache".
- The first-party findings are real: large PNG hero images (~1.1–1.3 MB each; "next-gen formats" / "properly size images"),
  un-minified JS and CSS, render-blocking CSS (9–23 stylesheet requests per page), images without explicit `width`/`height`,
  colour-contrast failures, links/buttons whose accessible name does not match the visible label, and — on Loan Comparison —
  form controls and selects without associated labels (accessibility 88).

Baseline at the time of M0 (mobile median): Home 64, EMI 80, Loan Comparison 75, Article 69 (performance);
accessibility 96 / 96 / 88 / 96; best-practices 76–79 (HTTPS artifact); SEO 100 on all four.

## Deployment note — development files are not published

Only the generated output is deployed (`dist/` to Hostinger, `dist-ghpages/` to GitHub Pages through
`.github/workflows/pages.yml`), so sources, tests, `node_modules` and tooling can never be published.
This is enforced, not assumed:

- `npm run test:assets` fails if the build output contains anything but site files (it lists an allowlist of top-level
  entries and the development-only names it must never contain) and if a page names a tool module that is missing;
- `tests/unit/build-output.test.mjs` checks the shape of both outputs (exactly 18 live pages + the 404, no Coming-soon
  folder, `.htaccess` only in the root build, the same files in both builds);
- `smoke.spec.js` asserts `/src/…`, `/eleventy.config.js`, `/tests/…`, `/package.json` and `/node_modules/…` are 404;
- the checker self-tests (`static-checkers.test.mjs`) inject a stray file, a leaked preview base, a preview host in the
  sitemap, and more, and assert each is reported.

## Known baseline issues (pre-existing, recorded — not fixed by M0)

See `tests/static/known-issues.json` for the machine-readable list. In short:

- `calculateEMI` returns `Infinity` (and totals `NaN`) when the tenure rounds to 0 months (e.g. 0.01 years); `calculateTotalRepayment`/`Interest` do not validate their own input (negative principal → positive "interest"). The UI cannot reach these. Pinned by "KNOWN QUIRKS" unit tests.
- Calculator breadcrumbs show the category in lower case (`Home › Calculators › loans › …`).
- 18+ placeholder `href="#"` links (footer social icons, etc.) and category links to `categories.html#<id>` anchors that do not exist (`links` baseline).
- 11 pages (home, about, articles list, both calculators, all six articles…) have no content in the raw HTML; canonical/Open Graph/JSON-LD exist only on article pages and only after JavaScript runs (`seo` baseline).
- `<h1>`/tags: `theme-color` differs per page (`#2563eb`, `#0b9f58`, none); the Loan Comparison title uses "ToolZenHub".
- A rate typed above the slider maximum (25%) is still used for the calculation (the slider only clamps visually).
- The amortization modal fills the whole phone screen, so it has no clickable overlay on mobile. (M9: it now moves focus in, keeps Tab inside, closes on Escape and restores focus; see `accessibility.spec.js`.)
- Known, not fixed in M9: brand-green text on white (about 3.4:1) fails WCAG AA contrast on 105 elements across the site, and the Loans listing jumps from `h1` to `h3`; both need a design decision. Four CSS custom properties are referenced but never defined (`--transition-fast`, `--transition-normal`, `--z-dropdown`, `--z-modal`), pinned by `design-tokens.test.mjs`. The mobile Categories page has a layout shift of 0.267 when its scripts load after the first paint (identical before M9).
- `choose-right-loan-tenure` has no featured image (`TODO(image)`).
- 3 files hard-code the GitHub Pages path/host (listed in `known-issues.json`); the guard fails on any *new* one.

## When to update what

| You changed… | Do this |
| --- | --- |
| added/removed/renamed a page or a Coming-soon entry | `npm run inventory:generate`, review the diff |
| the DOM/markup of a tested region | review the diff, then `npm run baseline:update` |
| added SEO tags (canonical, OG, JSON-LD) | the SEO baseline will diff — that is the intended signal; update it |
| intentionally fixed a known issue | remove it from `known-issues.json` (the checker tells you when an entry is stale) |
