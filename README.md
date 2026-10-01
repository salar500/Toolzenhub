# ToolZen Hub

**Smart Tools, Smarter You.** ToolZen Hub is a free website of online calculators and
guides for finance and everyday decisions (loans, investment, tax, health, business,
math and conversions).

- Live site (GitHub Pages): <https://salar500.github.io/Toolzenhub/>
- Repository: <https://github.com/salar500/Toolzenhub>

## Current status

The project is in early development. Only a small part of the planned catalogue exists.

| Area | State |
| --- | --- |
| Calculators | **2 built:** EMI Calculator and Loan Comparison Calculator. The other 24 catalogue entries appear as non-clickable "Coming soon" cards. |
| Articles | **6 published** (all in the Loans / loan-comparison topic). Another 6 are listed as non-clickable "Coming soon" entries. |
| Pages | Home, Categories, All Calculators, Loans, Articles, About, Contact, Privacy Policy, Terms, Disclaimer, plus a 404 page. |
| Newsletter | **Not working yet.** The footer form posts to a Netlify function that cannot run on GitHub Pages. A Brevo-hosted signup form is the intended replacement. |
| Contact form | **Not connected to any backend.** The form is disabled and says so; no messages are sent. |
| Known gap | The article "How to Choose the Right Loan Tenure" has no featured image yet (search for `TODO(image)`). |

Some folders still contain unused code from earlier work (for example an unused
calculator-engine scaffold and older page modules). It is left in place for now and is being
reviewed gradually.

## Technology

- Plain **HTML, CSS and JavaScript (ES modules)**. No framework, no bundler, no build step,
  no `package.json`.
- Pages are static HTML files. A shared script (`assets/js/app.js`) renders the header,
  footer and page content in the browser.
- Fonts: Inter from Google Fonts.
- PDF export for the loan comparison loads **jsPDF** and **jsPDF-AutoTable** from cdnjs when
  needed, and a Noto Sans font from jsDelivr.
- Article hero images in the registry use remote Unsplash photos; article page illustrations
  are local files in `assets/Images/articles/`.
- `netlify/functions/subscribe.js` (Brevo newsletter signup) is a leftover that is **not
  used** on the current GitHub Pages hosting.

## Hosting

The site is served by **GitHub Pages** as a *project site* at
`https://salar500.github.io/Toolzenhub/`. No custom domain is configured in the repository, and there is no server-side code.

### Important: the `/Toolzenhub/` path

Because it is a project site, every page lives under the `/Toolzenhub/` path, not at the
domain root. This matters in several ways:

- Root-relative URLs such as `/assets/app.js` or `/favicon.svg` **break** on GitHub Pages,
  because they point at `salar500.github.io/…` instead of `salar500.github.io/Toolzenhub/…`.
- `assets/js/routes.js` is the single place that decides the site root: it uses
  `/Toolzenhub/` when the hostname is `salar500.github.io` and `/` everywhere else. Build
  links with `ROUTES` (for example `ROUTES.article(topic, slug)` or `ROUTES.asset(path)`)
  instead of hard-coding paths.
- Static HTML pages use **page-relative** paths for CSS, JS and the favicon (for example
  `../../assets/…` from a calculator page), so they work under `/Toolzenhub/` and on a root
  domain alike.
- `404.html` is served by GitHub Pages at whatever URL was requested, so it is fully
  self-contained (inline CSS, and a small script that works out the site root).
- `robots.txt` and `sitemap.xml` are in the repository root. Search engines only read
  `robots.txt` from the root of a *host*, so `robots.txt` has no automatic effect while the
  site lives under `/Toolzenhub/`; it will once the site has its own domain. The sitemap can
  be submitted directly in Google Search Console. Both files contain the absolute
  `https://salar500.github.io/Toolzenhub/` address and must be updated if the site moves to a
  custom domain.

## Repository structure

```
index.html, about.html, articles.html, calculators.html,
categories.html, contact.html, loans.html,
privacy.html, terms.html, disclaimer.html     Top-level pages (static HTML shells)
404.html                                      Self-contained "page not found" page
favicon.svg, robots.txt, sitemap.xml          Site-wide files

calculators/
  emi/index.html                              EMI Calculator page shell
  loan-comparison/index.html                  Loan Comparison page shell
articles/
  loan-comparison/<slug>/index.html           One page shell per published article

assets/
  css/                                        Stylesheets: base/, components/, pages/,
                                              calculators/, themes/
  js/                                         ES modules (see below)
  Images/                                     Local images (article illustrations, heroes)

loans/loan-comparison/                        Loan Comparison calculator code
                                              (components, helpers, entry module)
data/                                         Small JSON files (mostly unused)
netlify/functions/subscribe.js                Unused newsletter function (see above)
```

Inside `assets/js/`:

- `app.js` – entry point loaded by every page; picks what to render from the URL.
- `router.js` / `routes.js` – work out which page is open, and build URLs (site root aware).
- `components/` – header, footer, hero, cards, breadcrumb, related content, newsletter form.
- `pages/` – page-specific rendering (articles list, article, about, contact, categories, …).
- `data/calculators.js` – the calculator catalogue; entries with `available: true` are built.
- `article-registry.js` – the article catalogue; entries with `published: true` have a page.
- `calculator-registry.js` – loads the module for each built calculator.
- `data/articles/` – the content of each published article.
- `calculators/` – EMI formulas and shared PDF export code.

## How it works

1. Every page is a small static HTML file that loads its CSS and one module script.
2. `app.js` reads `window.location.pathname` via `router.js` and decides which page it is
   (home, categories, articles, an individual article, a calculator, …).
3. It renders the shared header and footer and the page body into the HTML shell.
4. Calculators are loaded on demand through `calculator-registry.js`. Individual articles are
   loaded on demand through `data/articles/article-registry.js`.
5. Catalogue entries that are not built or published yet are shown as "Coming soon" and are
   not links.

## Running it locally

There is nothing to install. The site uses ES modules, so it must be served over HTTP
(opening the files directly with `file://` will not work). From the repository root:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open <http://localhost:8000/>.

Locally the site runs at the **root** of `localhost` (the `/Toolzenhub/` rule only applies on
`salar500.github.io`), so it behaves like a root domain. To exercise the real GitHub Pages
subpath behaviour you need to serve the repository under a `/Toolzenhub/` prefix and open it
using the `salar500.github.io` hostname, or test on the deployed site.

## Deployment

The site is published from this repository through GitHub Pages (configured in the
repository's Pages settings; there is no workflow or build configuration in the repo). There
is no build step: the files in the repository are the files that are served.

## Architecture

The current approach (static pages plus browser-side rendering) is deliberately simple and is
**planned to evolve later**. No new architecture is part of the current work, and this
document describes the project as it is today.
