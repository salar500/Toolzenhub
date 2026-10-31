# 02. Verified UX defects and the article image audit

Only items observed in the repository, the built output or the live preview are listed as defects. Severity is for ordering, not a measurement. Rendered confirmation is still owed where marked.

## Verified defects (ordered)

| # | Defect | Evidence | Severity | Rendered check |
|---|---|---|---|---|
| D1 | The Contact form looks like a working form but sends nothing; the only working report channel is a public GitHub page needing an account, shown on two calculators only | `assets/js/pages/contact.js` message text; `report-issue.js`; two users of `reportIssueMarkup` | High (trust) | not needed |
| D2 | On All Tools, calculators are a name-only link list, other tools a description block; in both only the title is clickable | built `dist/tools.html` (`directory-group`, `directory-group__tools`) | High (discoverability) | optional |
| D3 | Five published articles have no image, including the owner's loan-tenure article | catalog dump: `cardImage` and `heroImage` empty for `choose-right-loan-tenure`, `why-a-20-percent-rise...`, `how-to-find-the-original-price...`, `percent-vs-percentage-points`, `what-changes-how-long-a-corpus-lasts` | Medium | optional |
| D4 | Article charts carry no axis labels, values or title; the explanation exists only in alt text | viewed `loan-tenure-total-interest.png`: five unlabeled stacked bars | Medium | done for one image only |
| D5 | The Articles page hero is a generic 3D "books, plant and mug" render, unrelated to the content | viewed `articles-hero.png`; alt text in `articles-template.js` line 106 | Medium (relevance) | done |
| D6 | Article card images are 16:9 files shown at 16:8 with `object-fit: cover`, so about 11% of the height is cropped | `components/articles.css` lines 89 and 103 | Low to medium | computed only |
| D7 | Search focus is implemented four different ways; the shared outline list omits the two main search inputs, and the main directory search input has no outline rule | `search.css` line 101, `accessibility.css` lines 43 to 52, `search-field.css` | Medium (accessibility, consistency) | NOT RUN |
| D8 | The date inputs rely on each browser's own calendar symbol and give no format guidance | 11 native inputs, no indicator CSS, no `color-scheme` | Medium | NOT RUN, no device |
| D9 | Gratuity requires choosing an employee type with no default and no plain-language hint for the usual case | gratuity `index.js`, radios without `checked` | Low to medium | not needed |
| D10 | Featured Tools is five calculators plus Countdown Timer, with nothing from Developer, Image or PDF Tools | `components/categories.js` `FEATURED_TOOLS` | Low | not needed |
| D11 | Home, All Tools, Developer Tools and Articles never use the words "practice lab" or "learning" | grep of built HTML: 0 matches each | Medium (discoverability) | not needed |
| D12 | "Coming soon: Health, Converter" appears on All Tools although rule 4.4 asks for no placeholder cards | `dist/tools.html` `directory-soon` | Low (owner decision O-5) | not needed |
| D13 | A focus-colour token named `--color-brand-green` is the indigo accent | `variables.css` line 116 | Low (maintainability) | not needed |

Not defects (checked): the sitemap lists only the 34 published articles and no coming-soon item; image files are small and have WebP siblings; article alt text is descriptive.

## Article image audit

- **Inventory:** 34 published articles; 29 have a card and hero image (the same file for both), 5 have none; 6 coming-soon articles have none and are not shown.
- **Type:** the 29 are in-house flat charts or diagrams (bars, lines, block diagrams) at about 1200 by 675, 2 to 44 KB. Several are genuine concept diagrams (for example compounding frequency periods, GST on a mixed invoice, margin versus markup) and meet the rulebook's "imagery must explain" preference. The loan and SIP articles repeat one visual grammar (bar or line chart) and, with no labels, look alike in the listing.
- **Misleading or low value:** the Articles page hero (D5). No article image was found that depicts something false; one image was viewed in full, the rest only by alt text, so this is not a full visual review (the full review is a Phase 2 task, and needs a browser).
- **Licence and source:** no record of how the images were produced or their licence was found (UNKNOWN). They appear to be generated in the repository; owner to confirm.
- **Recommended direction (rulebook 6.4):** labelled concept diagrams and annotated worked examples drawn from the tool's real numbers, no stock imagery, and no image for an article where none adds value. A text-first article with an annotated formula block is acceptable for the three Math articles. Generate charts from the same independent numbers used in the article, with visible axis titles, units and the key value, in inline SVG so text stays selectable and sharp at 320 px.
- **Loan tenure article:** it has two siblings, `loan-tenure-total-interest` (has a chart) and `choose-right-loan-tenure` (none). The second is a decision article ("how to choose"), so the right visual is a decision diagram: EMI versus total interest across 10 to 30 years for one stated loan, with the affordability ceiling marked. Numbers come from the Loan Comparison engine and an independent closed-form check.
