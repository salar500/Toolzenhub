# Design system follow-ups

Known design-quality items that are deliberately **not** fixed yet, each with why and what a fix would touch.
Fix these as their own checkpoint, not as part of a tool pack.

## 1. Site-wide contrast of the brand green used as text

The brand green `--color-brand-green` (#0b9f58) is 3.43:1 against white. That is enough for large text and for
non-text UI parts (outlines, focus rings need 3:1) but **below WCAG AA (4.5:1) for normal-sized text**. The
Tool Pack 1 / DQ1 work fixed the controls only (the buttons now use the darker action green, see
`docs/tool-pack-template.md`). The brand green is still used as the colour of text in these places, found with
`color: var(--color-brand-green)`:

- header and navigation: the brand title span, active and hover links, the mobile menu (`components/header.css`,
  `components/navigation.css`)
- cards, categories and articles (`components/cards.css`, `components/categories.css`, `components/articles.css`,
  `pages/categories.css`, `pages/articles-base.css`)
- hero and the Loans hero (`components/hero.css`, `pages/loans-hero.css`, `pages/loans.css`)
- footer link hover (`components/footer.css`)
- tool pages: the "FINANCE TOOL" and "YOUR RESULT" eyebrows and the highlighted result figure
  (`calculators/calculator-base.css`, `calculators/calculator-results.css`), the Loan Comparison base layout
  (`calculators/loan/01-base-layout.css`), the Loan Prepayment selected-option tick (`calculators/prepayment.css`)
- static pages: contact, privacy, terms, disclaimer (`pages/*.css`)
- breadcrumb links and "View all" links, which take the same green

Large figures (the headline result) and icons are fine at 3:1; small eyebrows, links and labels are not.

Do not darken `--color-brand-green` globally: it also paints the logo, backgrounds and focus rings. A fix is a
separate audit: list each use, decide per use between the action green (#087f47, 5.08:1) for text and the brand
green for fills and rings, add text tokens if needed, and update the affected visual baselines page by page.

## 2. Unsplash card images on article cards

The cards on the Home page, the articles listing and the related-article rows use hotlinked Unsplash photos
(for example a house model on a desk, coins with a plant). They are loosely related stock images, not concept
images, and they depend on a third-party host. The hero charts and diagrams already drawn for the articles could
serve as card images (or the cards could have none), which would change the Home, Articles, Categories and Loans
cards and their baselines. Not done in DQ1 because it is a site-wide visual change, not a tool-pack change.

## 3. Articles without a concept image

`choose-right-loan-tenure` has no hero image. A truthful concept visual (affordability against total cost) would
mostly repeat the `emi-vs-total-interest` chart, so it is left without one until there is a distinct diagram.
