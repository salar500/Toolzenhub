# ToolZen Hub

**Smart Tools, Smarter You.** ToolZen Hub is a free website of online calculators and
guides for finance and everyday decisions (loans, investment, tax, health, business,
math and conversions).

- Production site: <https://toolzenhub.in/> (static hosting on Hostinger)
- Preview / fallback (GitHub Pages): <https://salar500.github.io/Toolzenhub/>
- Repository: <https://github.com/salar500/Toolzenhub>

## Current status

The project is in early development. Only a small part of the planned catalogue exists.

| Area | State |
| --- | --- |
| Calculators | **2 built:** EMI Calculator and Loan Comparison Calculator. The other 24 catalogue entries appear as non-clickable "Coming soon" cards. |
| Articles | **6 published** (all in the Loans / loan-comparison topic). Another 6 are listed as non-clickable "Coming soon" entries. |
| Pages | Home, Categories, All Calculators, Loans, Articles, About, Contact, Privacy Policy, Terms, Disclaimer, plus a 404 page. |
| Newsletter | **Not working yet.** The footer form posts to a Netlify function that cannot run on static hosting. A Brevo-hosted signup form is the intended replacement. |
| Contact form | **Not connected to any backend.** The form is disabled and says so; no messages are sent. |
| Known gap | The article "How to Choose the Right Loan Tenure" has no featured image yet (search for `TODO(image)`). |

Earlier unused code (a calculator-engine scaffold, older page modules, duplicate stylesheets,
sample data files and unreferenced images) was removed in M9 after checking that nothing, in
either build or in the tests, referenced it.

## Technology

- A static site generated with **[Eleventy](https://www.11ty.dev/)** (`@11ty/eleventy`, a
  development dependency). The build writes plain HTML, CSS and JavaScript files; there is
  **no framework and no client-side runtime**.
- Browser JavaScript is **vanilla ES modules** under `assets/js/`. A calculator page loads only
  its own calculator; an article page needs only a tiny script for the table of contents.
- Fonts: Inter from Google Fonts.
- PDF export for the loan comparison loads **jsPDF** and **jsPDF-AutoTable** from cdnjs when
  needed, and a Noto Sans font from jsDelivr.
- `netlify/functions/subscribe.js` (Brevo newsletter signup) is a leftover that is **not
  used** and is not part of the build output.

## Build and deploy

```bash
npm install            # once
npm run dev            # development server with live reload, http://localhost:8080/ (site root "/")
npm run build          # PRODUCTION build   -> dist/          (served from the root:      /)
npm run build:preview  # GITHUB PAGES build -> dist-ghpages/  (served under:  /Toolzenhub/)
npm run build:all      # both
```

| Output | Base (where it is served) | Used for |
| --- | --- | --- |
| `dist/` | `/` | **Production** at <https://toolzenhub.in/>. Upload this to Hostinger. |
| `dist-ghpages/` | `/Toolzenhub/` | GitHub Pages preview / fallback. |

Both come from the **same source** (`src/` templates plus `assets/`); only the base differs.
The base is chosen by the command (`eleventy.config.js` for production,
`eleventy.preview.config.js` for the preview), never by editing files. Links, stylesheet and
script URLs carry the build's base, and each page also declares it
(`<meta name="tz-site-base">`) so browser scripts build the same links. Each build deletes its
output folder first, so there are no stale files. Both folders are git-ignored.

**Hostinger (production).** Run `npm run build` and upload the **contents** of `dist/` to the
site's web root (`public_html`). The site then runs at the root, `https://toolzenhub.in/`. `dist/`
is a plain static site: every page is an `index.html` or `*.html` file, so it needs no server
rules, redirects or rewrites, and every URL works on any static host.

*`dist/.htaccess` is optional.* It contains one line, `ErrorDocument 404 /404.html`, which only
makes **unknown** URLs show the site's own 404 page on Apache-family servers (including
LiteSpeed). Without it (not uploaded, hidden files skipped, or a non-Apache server) every valid URL
works exactly the same, and unknown URLs still return a 404 status; visitors just see the host's
default error page instead of ours. Nothing in the site, the build or the tests depends on it, and
the preview build does not contain it.

**GitHub Pages (preview).** `.github/workflows/pages.yml` runs `npm run build:preview` and
deploys only `dist-ghpages/`, so source templates, tests and tooling are never published.
One-time repository setting: *Settings → Pages → Build and deployment → Source: **GitHub
Actions***.

### The production domain

`https://toolzenhub.in` is set in **one place**: `SITE.origin` in `assets/js/site-config.js`.
Every canonical URL, Open Graph URL, sitemap entry, structured-data URL and the `robots.txt`
sitemap line is built from it, in **both** builds: a GitHub Pages preview still declares
`https://toolzenhub.in/...` as its canonical, so a preview is never a production canonical. To
move the site to another domain, change that one value, run `npm run build`, and upload `dist/`
again.

### What is generated

- Every page's `<head>` (title, description, canonical, Open Graph, Twitter, structured data),
  the header and the footer.
- The **whole article** (hero, key takeaways, sections, FAQ, related articles) for every
  published article, and the **finished page** (tool markup, breadcrumb, related sections) for
  every published calculator. Nothing important waits for JavaScript.
- The **About** page content (static prose).
- `sitemap.xml` (published, indexable pages only), `robots.txt`, and the optional `.htaccess`
  (root build only, see above).
- Coming-soon tools and unpublished articles have no page and appear in none of these.
- Search is **not** a build artifact: the browser builds its in-memory index from the same catalogs
  (`assets/js/data/search-index.js`). There is deliberately no second, generated copy of it.

### Tests

`npm test` rebuilds both outputs and tests what would be deployed: the preview build is served
under `/Toolzenhub/` and the production build at `/`. See `tests/README.md`.

## Repository structure

```
src/                       Eleventy input
  _includes/layouts/       base, tool, article, listing, info
  _data/                   site values, published tools and articles (from the catalogs), stylesheet lists
  _lib/seo.js              build-time structured-data helpers
  *.njk                    pages (home, categories, loans, about, ..., 404), the tool and article
                           page generators, sitemap, robots, optional .htaccess
eleventy.config.js         production build config        (base "/")
eleventy.preview.config.js GitHub Pages build config      (base "/Toolzenhub/")
eleventy.shared.js         what both builds share
scripts/clean-output.mjs   clears dist/ and dist-ghpages/ before a build

assets/
  css/                     Stylesheets: base/, components/, pages/, calculators/, themes/
  js/                      Browser ES modules and the data catalogs (see below)
  Images/                  Local images (article illustrations, heroes)
loans/loan-comparison/     Loan Comparison calculator code (components, helpers, entry module)
favicon.svg                Copied to the output as it is
tests/                     Regression safety net (not part of the output)
```

Styling and images:

- `assets/css/base/variables.css` holds the design tokens. Every generated page loads it first.
  The four most repeated colours are tokens (`--color-brand-green`, `--color-ink`,
  `--color-ink-muted`, `--color-slate-200`); a unit test keeps those literals out of the other stylesheets.
- `assets/css/base/accessibility.css` is loaded last on every generated page: visible keyboard focus
  for the search and newsletter inputs, and the `prefers-reduced-motion` rule.
- Hero and article images ship a `.webp` next to the `.png` of the same name. Pages use
  `<picture>` so browsers take the WebP; the PNG stays as the fallback and the social-sharing image.
  When adding an article image, add both files.

Inside `assets/js/`:

- `entries/tool.js`, `entries/article.js` – the small entry scripts of generated tool and
  article pages. `app.js` is the entry of the other pages (home, listings, about, contact, legal).
- `site-config.js` – site name, **production origin**, preview host.
- `routes.js` – the base of the page being viewed, and every URL builder.
- `data/` – the catalogs: `tools.js`, `articles.js`, `categories.js`, `taxonomy.js`,
  `relationships.js`, `search-index.js`. They are the source of truth for identity, status,
  titles, descriptions and relationships.

  `tools.js` is the **one tool catalog**, for every kind of tool. Each entry owns the tool's id
  (its URL slug), title, description, status (`published` or `coming-soon`), category, `toolType`,
  capabilities, SEO title and description, icon, and its `loader`, the one place a tool's module
  is named (`() => import("...")`, kept as a literal dynamic import so a tool's code loads only
  when its page opens). Section, `sitePath`, link and `available` are derived. The catalog is
  checked when it loads (duplicate or malformed ids, missing title, unknown category, status or
  type, bad capabilities, a published tool with no loader, a Coming Soon tool with one, unknown
  related tools), so a mistake stops the build. Search, relationships, taxonomy, the loader
  registry, the site build and the URL inventory all derive from it. `calculators.js` is only a
  thin compatibility view of the Calculators section's tools (the same objects), and
  `calculator-registry.js` is a build-time view of the loaders and breadcrumb metadata; neither
  stores anything.

  The content hierarchy is **Section → Category → optional Subcategory → Tool → supporting
  Articles**, all linked by stable ids (`data/categories.js`, resolved in `data/taxonomy.js`).
  **Calculators is currently the only section**, and all eight existing categories (Loans,
  Investment, Tax, Health, Business, Math, Converter, More) belong to it through `sectionId`.
  A tool names only its category: its section, its site path and its link are derived from it,
  so a tool's URL is `/{section pathPrefix}/{id}/`, which for Calculators keeps every existing
  URL (`/calculators/emi/`, `/calculators/loan-comparison/`). Other sections and subcategories
  are supported by the data model but none exist yet, so there are no pages for them.

  **Tool type and capabilities** (`data/tool-capabilities.js`). Every tool has a `toolType`, a
  stable value from `calculator`, `converter`, `timer`, `timezone`, `developer`, `utility`
  (default `calculator`; every current tool is one). A published tool may declare
  `capabilities`, a flat set of true/false flags such as `reset`, `compare`, `table`, `modal`,
  `download`, `validation`, `realtime`; whatever is not written is `false`. Unknown keys, values
  other than `true`/`false`, an unknown type, or capabilities on a Coming Soon tool stop the
  build. **A declared capability is not an implemented one:** metadata creates no functionality,
  so a flag may be `true` only where the tool's own code does it. Nothing in the site reads the
  flags yet (search, relationships, the tool page and the generated HTML are unaffected), so
  today they are checked descriptions, kept honest by `tests/unit/tool-capabilities.test.mjs`.
  Current profiles: EMI = reset, validation, explanation, multipleInputs, localProcessing; Loan
  Comparison = compare, reset, realtime, table, schedule, modal, download, unitSelection,
  multipleInputs, explanation, examples, localProcessing.

  **Shared tool UX** (`assets/js/ui/`). A deliberately small, framework-free layer for what tools
  genuinely repeat: a labelled number field with its hint linked (`numberField`), connecting an error
  to its fields (`setFieldsInvalid`), result pieces (`resultMetric`, `resultEmpty`, `resultError`) and
  modal focus management (`activateDialog`). The tool still owns its formulas, validation rules,
  messages and layout. Guidance, the pattern audit and what to avoid abstracting are in
  `docs/shared-tool-ux.md`.

  **Planning documents** (not published, not built): `docs/content-clusters.md` (how a tool and its
  articles fit together, the editorial standard and the linking rules), `docs/tool-pack-template.md`
  (the template every new tool follows) and `docs/tool-packs/01-loan-prepayment.md` (the specification
  of the first planned tool; it is not implemented and its page does not exist).
- `components/`, `pages/` – header, footer, breadcrumb, related content, page modules.

## How it works

1. `npm run build` reads `src/` and the catalogs and writes static pages. The shared parts (head,
   header, footer, tool pages, article pages) are produced by the same modules the browser
   uses, so the generated HTML and the interactive page agree.
2. A calculator page loads one entry script, which starts only that calculator's module.
3. An article page loads one tiny script (header menu, newsletter form, table-of-contents highlight).
4. Catalog entries that are not built or published yet are "Coming soon" cards and have no page.

## Known limits

- Static now: every article, both calculators, and the About page. Their content is in the HTML.
- Still built in the browser, on purpose: the **Categories**, **All Calculators**, **Loans** and
  **Articles** listings are search/filter/pagination interfaces whose card grids are rendered from
  the catalogs and replaced as the visitor types; their head, header, footer, headings and
  breadcrumbs are generated. The **Home** page assembles four catalog-driven sections (hero search,
  categories, popular calculators, latest articles); pre-rendering it means splitting those
  components, which is left for a later change.
- `netlify/functions/subscribe.js` and the newsletter form that calls it are an unfinished
  feature (see the status table); the function is not part of any build output.
