# 01 Verified repository baseline

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3 (research and requirements). Written 2026-10-29. Nothing here is a rule, a build queue or an approval; the rulebook is `docs/product-decision-rules.md`. No application file, test or baseline was changed. The only files created are this package, `concepts/design-concepts.html` and three concept SVGs under `concepts/`, all under `docs/`.

Evidence labels used throughout: **VERIFIED** (read in the repository, measured or seen on the live preview this session), **RECORDED** (stated in a repository document and not re-measured), **OBSERVED / CLAIMED / INFERRED / UNKNOWN** (public references, see doc 03), **HYPOTHESIS** (reasoned, not measured).

## Read-only checkpoint

| Item | Result | Label |
| --- | --- | --- |
| Repository root | `C:/Users/DELL/Documents/Toolzenhub` | VERIFIED |
| Branch | `main`, tracking `origin/main` | VERIFIED |
| HEAD | `0c2ffe9` "test(release): pre-preview checkpoint, dialog focus-trap race fix, stale pins and baselines" | VERIFIED |
| Working tree | clean at the start of this phase | VERIFIED |
| Remote state | `origin/main` equals `0c2ffe9`; the 39 local commits were pushed earlier in this session on the owner's instruction (`0dc368b..0c2ffe9`) | VERIFIED |
| GitHub Pages preview | workflow "Deploy GitHub Pages preview" run 40882233172 for `0c2ffe9` finished `success`; the home page, five Practice Labs and Flashcards routes, `sitemap.xml`, `robots.txt`, `favicon.svg` and 31 referenced JS/CSS assets returned HTTP 200 | VERIFIED |
| Historical ZIP | not used. Every figure below was taken from the repository and the live preview, not from an archive | VERIFIED |
| Production | untouched. No Hostinger or `toolzenhub.in` action was taken | VERIFIED |

## Inventory (from `tests/inventory/url-inventory.json`, `dist-ghpages/` and the live preview)

| Item | Count | Label |
| --- | --- | --- |
| Published tools | 54: 19 Calculators, 13 Time Tools, 17 Developer Tools, 2 Image Tools, 3 PDF Tools | VERIFIED (matches the previous audit) |
| Live pages in the inventory | 107, all indexable; plus one 404 document | VERIFIED |
| Built HTML files in `dist-ghpages/` | 108 (107 plus `404.html`) | VERIFIED |
| Sitemap URLs | 107 | VERIFIED |
| Published articles | 34 | VERIFIED |
| Coming-soon catalog entries | 11 calculators, 6 articles; catalog data only, never routed (rulebook 4.4) | VERIFIED |
| Developer Tools that are learning tools | Smart Flashcards plus four Practice Labs (JSON Error-Fixing, JSONPath Challenge, Cron Challenge, Test Design) | VERIFIED |
| Test assets | 133 files in `tests/unit`, 74 in `tests/browser`, 95 PNG visual baselines in `tests/baselines/visual` | VERIFIED |

The earlier "89 URLs" figure in `docs/ecosystem-review/11-...` is stale; the repository now holds 107.

## Distinct page templates (from `src/*.njk` and `src/_includes/layouts`)

Layouts: `base.njk` (document shell, header and footer shortcodes), `tool.njk`, `article.njk`, `info.njk`, `listing.njk`.

| Template | Page family | Routes |
| --- | --- | --- |
| `home.njk` | Home | 1 |
| `tools.njk` | All Tools directory | 1 (`/tools.html`) |
| `section-pages.njk` | Section landings: Time Tools, Developer Tools, Image Tools, PDF Tools | 4 |
| `calculators-index.njk`, `categories.njk`, `category-pages.njk`, `loans.njk` | Calculator directories and categories (Loans, Investment, Business, Tax, Math) | 7 |
| `tool-pages.njk` | Individual tools: 19 calculators plus 35 non-calculator tools | 54 |
| `articles-index.njk`, `article-pages.njk` | Articles listing and 34 articles | 35 |
| `about.njk`, `contact.njk`, `privacy.njk`, `terms.njk`, `disclaimer.njk` | Informational and legal pages | 5 |
| `404.njk` | Error page (standalone, one stylesheet, no navigation) | 1 |

## Design and CSS architecture

| Aspect | Finding | Label |
| --- | --- | --- |
| CSS files | 109 files, about 668 KB of source on disk (uncompressed) in `assets/css/{base,components,pages,calculators,tools,themes}` | VERIFIED |
| Tokens | `assets/css/base/variables.css` defines colours, type scale, spacing, radius, shadow, container and header height. It still carries an unused blue scale (`--color-primary: #2563eb`) beside the real brand green `#0b9f58` and action green `#087f47`. `themes/light.css` is 2 bytes (empty) | VERIFIED |
| Token adoption | 95 CSS files reference `var(--…)`, but about 1,436 hex literals remain across the CSS; the most repeated are `#ffffff` (175), `#475467` (171), `#344054` (125), `#f9fafb` (92), `#d0d5dd` (72) | VERIFIED |
| Radius | 10 px (120 uses), 12 px (81), 8 px (35), 999 px (28), 14 px (27), plus 6, 7, 9 px variants: no single radius scale in use | VERIFIED |
| Breakpoints | seven or more distinct widths (380, 400, 480, 600, 640, 650, 900, 1200 px) | VERIFIED |
| Page weight | 5 to 25 stylesheet requests per page (12 to 25 on most pages, 23 to 25 on tool pages and articles, 1 on the 404 page); CSS transfer 7 to 26 KB where the response reports a length | VERIFIED (transfer from response headers, not a Lighthouse run) |
| Fonts | `Inter` from `fonts.googleapis.com` on every page family except Privacy, Terms, Disclaimer, Contact and the Calculators landing; the header and navigation force Georgia (`components/header.css`) | VERIFIED |
| Logo | the header and footer mark is the text glyph `▦` inside a CSS circle; `favicon.svg` is a white "T" on `#14B8A6`; the two do not share a colour | VERIFIED |
| Icons | text glyphs and emoji (`₹ % ◷ ▦ ⚖ ⇄ ↗ ◔ ◉ ▤ ▣ { }`) in the catalog; the home section cards use emoji | VERIFIED |
| Images | `assets/Images/` holds two hero images (PNG 1.26 MB and WebP 190 KB; PNG 740 KB and WebP 29 KB) and an `articles` folder; six articles use hotlinked Unsplash photos | VERIFIED |
| Dark mode | none (no `prefers-color-scheme` rule anywhere) | VERIFIED |
| Reduced motion | handled in `base/accessibility.css` (one rule block) | VERIFIED |
| Shared UI modules | `assets/js/ui/{field,result,dialog-focus,escape}.js`; documented in `docs/shared-tool-ux.md` | VERIFIED |
| Search | one shared search component in `assets/css/components/search*.css` and the JS entries | VERIFIED |
| Analytics | consent-based GA4 on the production build only; the preview carries none | VERIFIED |

## Authoritative documents read for this phase

`CLAUDE.md`; `docs/product-decision-rules.md` (all sections read; sections 1.10, 3, 4, 6.4, 7, 8, 9, 10, 11, 12, 15 govern this package); `docs/shared-tool-ux.md`; `docs/design-follow-ups.md` (contrast and Unsplash follow-ups); `docs/ecosystem-review/08-GLOBAL-NAVIGATION-AND-DISCOVERY.md` and `11-UX-ACCESSIBILITY-PERFORMANCE-AUDIT.md` (prior findings, treated as RECORDED).

## Test and baseline posture

Visual baselines exist for 95 images across three projects. This phase did not run, regenerate or edit any of them (rulebook 10.5 and 10.6). Browser tests were not run; the screenshots and measurements in doc 02 came from a separate read-only script run against the live preview with the system Chrome, one page at a time, and left no file in the repository.
