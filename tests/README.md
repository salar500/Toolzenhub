# Regression safety net (M0)

Development-only tests that protect today's behaviour before any architectural change.
The website itself has **no build step** and none of this ships to visitors.

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
| `npm run test:unit` | Loan-formula golden tests + mutation self-tests of the static checkers (Node's built-in runner) |
| `npm run test:static` | `inventory:check` + `test:links` + `test:assets` (no browser, ~5 s) |
| `npm run test:links` | Static link/route checker |
| `npm run test:assets` | Static asset checker (exact-case) |
| `npm run test:browser` | Playwright: smoke, 404, calculators, articles, contact, navigation, link crawl, DOM + SEO baselines — in `/Toolzenhub/` desktop + mobile and root-domain mode |
| `npm run test:visual` | Playwright screenshots (desktop, mobile, tablet) |
| `npm run inventory:generate` | Rebuild `tests/inventory/url-inventory.json` after pages are added/removed |
| `npm run baseline:update` | Re-record DOM/SEO/link/visual baselines **after you have reviewed an intentional change** |
| `npm run baseline:lighthouse` | Lighthouse baseline (slow, ~25 min on a laptop, informational) |
| `npm run test:mutation` | Negative controls: breaks a copy of the site in 6 ways and checks the browser tests fail (~4 min) |

Run one file: `npx playwright test --project=subpath-desktop tests/browser/emi.spec.js`.

## What is tested

- **URL inventory** (`tests/inventory/url-inventory.json`): every real page (live/indexable, live/non-indexable, the 404 document) and every "Coming soon" entry that must **not** be a route. Generated from the repository itself; `inventory:check` fails if it drifts. It is also the seed for any future redirect map (`redirectSeed`).
- **Smoke** (`smoke.spec.js`): every inventory page loads, shows its primary element, has the expected `<title>`, header/footer, no broken images, no uncaught errors, no console errors, no failed local requests. Coming-soon URLs return 404; robots/sitemap/favicon are served.
- **404** (`notfound.spec.js`): real 404 status at several depths, wrong-case URLs, favicon and links resolved from the site root, works without JavaScript.
- **Links** (`check-links.mjs` static + `links.spec.js` rendered crawl): every `<a>` resolves (exact case), correct prefix in both `/Toolzenhub/` and root mode, every target is a known live route, sitemap ↔ inventory, registry ↔ pages, no *new* hard-coded `/Toolzenhub`.
- **Assets** (`check-assets.mjs`): every local JS/CSS/image/icon reference (HTML, CSS `@import`/`url()`, JS imports and asset-path strings) exists with **exact case**.
- **Formulas** (`tests/unit/loan-formulas.test.mjs`): golden EMI values (independently computed), zero-interest, validation contract, total repayment/interest, amortization invariants.
- **Flows**: EMI (`emi.spec.js`), Loan Comparison incl. the amortization modal (`loan-comparison.spec.js`), articles + listing (`articles.spec.js`), contact form (`contact.spec.js`), navigation/search/Coming-soon cards (`navigation.spec.js`).
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

GitHub Pages (deploy-from-branch) builds the site with Jekyll, which copies **every** file in the repository unless it is
excluded. The repository root therefore contains `_config.yml` with an `exclude:` list (`tests`, `node_modules`,
`package.json`, `package-lock.json`, `playwright.config.js`, `test-results`, `playwright-report`). The files stay committed;
they are simply not part of the published website, and no site URL changes (Jekyll copies the real site files untouched).
`_config.yml` itself is not published either (Jekyll skips underscore files).

This is enforced, not assumed:

- the test server serves only what Jekyll would publish (`_config.yml` + Jekyll's default excludes), so the whole browser
  suite runs against the deployment configuration; `smoke.spec.js` asserts `/tests/…`, `/package.json`, `/playwright.config.js`,
  `/node_modules/…` and `/_config.yml` are 404;
- `npm run test:assets` fails if a dev-only path is not excluded, if `_config.yml` is missing, or if the config excludes anything a
  live page uses (checked by mutation self-tests).

If the Pages source is ever switched to a GitHub Actions workflow, `_config.yml` becomes inert and the workflow must publish only the site files.

## Known baseline issues (pre-existing, recorded — not fixed by M0)

See `tests/static/known-issues.json` for the machine-readable list. In short:

- `calculateEMI` returns `Infinity` (and totals `NaN`) when the tenure rounds to 0 months (e.g. 0.01 years); `calculateTotalRepayment`/`Interest` do not validate their own input (negative principal → positive "interest"). The UI cannot reach these. Pinned by "KNOWN QUIRKS" unit tests.
- Calculator breadcrumbs show the category in lower case (`Home › Calculators › loans › …`).
- 18+ placeholder `href="#"` links (footer social icons, etc.) and category links to `categories.html#<id>` anchors that do not exist (`links` baseline).
- 11 pages (home, about, articles list, both calculators, all six articles…) have no content in the raw HTML; canonical/Open Graph/JSON-LD exist only on article pages and only after JavaScript runs (`seo` baseline).
- `<h1>`/tags: `theme-color` differs per page (`#2563eb`, `#0b9f58`, none); the Loan Comparison title uses "ToolZenHub".
- A rate typed above the slider maximum (25%) is still used for the calculation (the slider only clamps visually).
- The amortization modal fills the whole phone screen, so it has no clickable overlay on mobile; it has no focus trap.
- `choose-right-loan-tenure` has no featured image (`TODO(image)`).
- Unreachable legacy code: `assets/js/pages/articles.js` references a lowercase `assets/images/…` path (would 404 on a case-sensitive host).
- 7 files hard-code the GitHub Pages path/host (listed in `known-issues.json`); the guard fails on any *new* one.

## When to update what

| You changed… | Do this |
| --- | --- |
| added/removed/renamed a page or a Coming-soon entry | `npm run inventory:generate`, review the diff |
| the DOM/markup of a tested region | review the diff, then `npm run baseline:update` |
| added SEO tags (canonical, OG, JSON-LD) | the SEO baseline will diff — that is the intended signal; update it |
| intentionally fixed a known issue | remove it from `known-issues.json` (the checker tells you when an entry is stale) |
