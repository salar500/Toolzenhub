# 03 Public design reference research

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Accessed 2026-10-29. Nothing here is a rule or an approval.

## Method and honest limits

Each page was retrieved as **text** (HTML converted to markdown by the fetch tool). No screenshots, computed styles, scripts or mobile views were available. Therefore:

- **OBSERVED** = present in the retrieved text on the access date: navigation items, section order, labels, counts, filters.
- **CLAIMED** = a statement the site makes about itself (for example a user count). Not verified.
- **INFERRED** = my reasoning from the observation or from general knowledge of the product that this session did not verify. Used sparingly and always marked.
- **UNKNOWN** = not retrievable here. **Colour, typography, spacing, radius, hover and focus states, animation, and mobile behaviour are UNKNOWN for every reference below.** No interaction was tested on any reference site.

Patterns are recorded for ideas, not popularity. Nothing is to be copied: no layout, illustration, brand asset or text (rulebook 12.5).

## Reference records

### 1. Linear — `https://linear.app` (product marketing page)
- **Observed:** skip-to-content link first; logo; top items Product, Resources, Customers, Pricing, Now, Contact; right-side Docs, Open app, Log in, Sign up. No search or command field on the page. Sections: intake, planning, AI, build, changelog, testimonials, closing call to action. Footer columns: Product, Features, Company, Resources, Connect, Legal; a small legal row. **Claimed:** "over 40,000 product teams".
- **Sidebar, search, cards, colour, type, spacing, mobile, states:** UNKNOWN. **Inferred (unverified):** restrained, low-chroma, dense product UI.
- **Principle:** a short, ordered story, one call to action repeated, a visible skip link. **Tradeoff:** a marketing page, not a utility directory.
- **Relevance:** low for navigation; useful for restraint and for the discipline of one primary action.

### 2. Vercel — `https://vercel.com`
- **Observed:** hero, three feature groups with named capabilities, "Recently shipped" cards, a closing call to action. Header and footer links were not present in the retrieved text (UNKNOWN). No search in the text.
- **Colour, type, mobile, states:** UNKNOWN. **Inferred:** high-contrast, mostly monochrome identity with sparing accents.
- **Principle:** content-first pages with few colours. **Tradeoff:** tone aimed at agent and infrastructure buyers.
- **Relevance:** supports the neutral-led option (C) as a credible way to look professional.

### 3. Raycast — `https://www.raycast.com`
- **Observed:** header Store, Pro, AI, iOS, Windows, Teams, Enterprise, Blog, Pricing, Log in; extension grid with category tabs (Productivity, Engineering, Design, Writing); a "plus thousands more" link; footer with newsletter field. **Claimed:** community sizes and a crash-free percentage.
- **Cards, colour, type, mobile, states:** UNKNOWN.
- **Principle:** category tabs above a card grid of many items. **Tradeoff:** store-style discovery depends on scale ToolZenHub does not have.
- **Relevance:** medium for the All Tools filter idea.

### 4. MDN Web Docs — `https://developer.mozilla.org/en-US/docs/Web/CSS`
- **Observed:** two skip links ("main content", "search"); logo; topic navigation (HTML, CSS, JavaScript, Web APIs, All, Learn, Tools, About, Blog) with dropdown-style sub-lists; breadcrumbs "Web > CSS"; a deep **left tree** (CSS, guides, about 69 modules, how-to, tools, reference with about 180 properties, selectors); "In this article" in-page contents; footer with edit and report links. Whether branches collapse by default is UNKNOWN (text only).
- **Colour, type, spacing, mobile, states:** UNKNOWN.
- **Principle:** persistent hierarchical sidebar suits reference material with hundreds of pages, plus breadcrumbs and in-page contents. **Tradeoff:** the tree is long; it costs width.
- **Relevance:** high as the model of when a sidebar earns its width. ToolZenHub's 54 tools in 5 flat sections are far smaller than a 600-page reference, which argues for a lighter pattern.

### 5. GitHub Docs — `https://docs.github.com/en`
- **Observed:** a landing list of about 35 product areas, each a link with a one-line description; a "Search" link to a search page; no sidebar on the landing; entries are not grouped under labels in the retrieved text.
- **Colour, type, cards, mobile, states:** UNKNOWN.
- **Principle:** one flat, scannable list of named areas with descriptions, search one click away. **Tradeoff:** 35 ungrouped items push work onto search.
- **Relevance:** supports short descriptions on every tool card; warns against an ungrouped long list.

### 6. Stripe — `https://stripe.com`
- **Observed:** header Products, Solutions, Developers, Resources, Pricing, Sign in with mega-menus listing about 20 products and 15 solutions; bento-style cards in the first section; statistics block; footer with region selector and legal line. **Claimed:** volume and uptime figures.
- **Colour, type, mobile, states:** UNKNOWN. **Inferred:** a restrained palette with one strong accent.
- **Principle:** grouped mega-menu keeps a deep catalog behind a short header. **Tradeoff:** complex; statistics of this kind would break rulebook 3.1 for ToolZenHub.
- **Relevance:** low for layout; the lesson is grouping, not claims.

### 7. Notion — `https://www.notion.com`
- **Observed:** header Product, Resources, Pricing, Request a demo, Log in, Get Notion free; hero; customer logo strip; three capability sections; testimonials; statistics bar; footer with locales and cookie settings. **Claimed:** user counts and rankings.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** three-point story. **Tradeoff:** relies on social proof ToolZenHub must not invent (rulebook 3.1).
- **Relevance:** low; a negative reference for proof elements.

### 8. Canva — `https://www.canva.com`
- **Retrieval failed: HTTP 403.** Everything about this reference is **UNKNOWN**.

### 9. Adobe Express — `https://www.adobe.com/express/`
- **Observed:** header with product switcher, Create, Edit, Print, Business, Education, Plans; tools grouped by job (Create: social media, marketing, document; Edit: image and video quick actions; Print); no search input on the page; a plan comparison with filters and sort labels.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** group tools by job ("Edit", "Create") rather than file type. **Tradeoff:** account-led.
- **Relevance:** supports ToolZenHub's section-as-job framing (rulebook 4.2).

### 10. Smallpdf — `https://smallpdf.com`
- **Observed:** Tools menu (Compress, Convert, Merge, Edit, Sign, AI PDF); "Most Popular PDF Tools" six featured cards with one-line descriptions and a "See All PDF Tools" link; the full list grouped by job in the footer-style menu; no search field. **Claimed:** "most popular" (a ranking ToolZenHub must not copy without data).
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** a short featured set plus an "all tools" link. **Tradeoff:** "popular" wording.
- **Relevance:** supports the existing curated Featured list with the word "Featured" (rulebook 3.2).

### 11. iLovePDF — `https://www.ilovepdf.com`
- **Observed:** "All PDF tools" menu with seven groups (Organize, Optimize, Convert to PDF, Convert from PDF, Edit, Security, Intelligence); filter tabs All / Workflows / group names above the card grid; cards with a name and one or two sentences; "New!" labels; very large footer and a language selector with about 30 languages. No search field in the text.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** filter tabs over one tool grid scale to dozens of tools without a sidebar. **Tradeoff:** heavy chrome (apps, languages, pricing).
- **Relevance:** high for the All Tools directory.

### 12. PDF24 Tools — `https://tools.pdf24.org/en/`
- **Observed:** minimal header ("PDF24 Tools", "All tools", "PDF24 Creator"); one flat list of 24 cards, each a name plus a sentence; no filters in the text; footer with legal links and a language selector of about 38.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** a minimal, flat grid is enough at about two dozen tools. **Tradeoff:** does not scale to 50 or more.
- **Relevance:** shows that an enormous sidebar is not needed at ToolZenHub's scale.

### 13. Omni Calculator — `https://www.omnicalculator.com`
- **Observed:** tagline with "3938 free calculators"; 14 categories with per-category counts (Finance 618, Math 687, Health 440…); "Most popular calculators" (16 cards with category label); no search field in the text; footer repeats the category list. **Claimed:** media mentions and the count.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** category counts make scale visible; each card names its category. **Tradeoff:** "most popular" and logo strip are claims.
- **Relevance:** supports section counts derived from the catalog.

### 14. Calculator.net — `https://www.calculator.net`
- **Observed:** an embedded calculator keypad above the heading; four categories (Financial 15, Fitness & Health 9, Math 6, Other 10) each with an image link and a bulleted list of calculators; "All Calculators" goes to a sitemap page; "around 200 calculators"; no sidebar observed; footer minimal.
- **Visuals, ads, mobile, states:** UNKNOWN.
- **Principle:** category headings with text lists are quick to scan. **Tradeoff:** a text-link wall.
- **Relevance:** the nearest relative of today's All Tools page; confirms the current structure is conventional, and that cards plus descriptions would add scanning value.

### 15. Desmos — `https://www.desmos.com`
- **Retrieval returned only the title "Desmos | Beautiful free math." and "Loading…".** Everything else is **UNKNOWN**.

### 16. freeCodeCamp — `https://www.freecodecamp.org/learn`
- **Retrieval returned no content.** **UNKNOWN.**

### 17. Codecademy — `https://www.codecademy.com`
- **Observed:** a search control; "Top subjects" and "Certification prep" tabs with "Load more"; subject and language filters; content types (career path, course, certification path, skill path); difficulty levels and hour estimates; footer groups Subjects, Languages, Career building. Menu items were not rendered in the text.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** show level and time on learning cards. **Tradeoff:** account and pricing prominence.
- **Relevance:** medium for Flashcards and Practice Labs cards (card count and topic, not "difficulty" invented per tool).

## Additional references discovered

### 18. regex101 — `https://regex101.com`
- **Observed:** a top bar with home, library and account icons; a regex bar with delimiters and flags; a flavour selector; four mode tabs (Match, Substitution, Extraction, Unit Tests); an input pane; a tools list; an explanation panel; a match-information panel with export formats; a 25-token quick reference. No privacy statement in the text.
- **Visuals, mobile, states:** UNKNOWN.
- **Principle:** a utility's workspace is the page; modes are tabs; reference material sits beside the work. **Tradeoff:** many panels compete.
- **Relevance:** high for developer tool pages; supports giving the workspace width and keeping explanations adjacent, not in a global sidebar.

### 19. NerdWallet calculators — `https://www.nerdwallet.com/calculators`
- **Retrieval failed: HTTP 404** (the address no longer exists). **UNKNOWN.**

## Cross-reference synthesis (INFERRED from the OBSERVED rows above)

| Pattern | Seen in | Fit for ToolZenHub |
| --- | --- | --- |
| Short header, deep catalog behind a menu or tabs | Stripe, iLovePDF, Smallpdf, MDN | Fits: keep four header links (rulebook 4.5), put depth on All Tools |
| Filter tabs or chips above one card grid | iLovePDF, Codecademy, Raycast | Fits for All Tools on phones |
| Persistent hierarchical sidebar | MDN | Only at hundreds of pages; ToolZenHub has 54 in 5 flat sections |
| One flat grid is enough at about 25 tools | PDF24 | Supports a lighter approach |
| Category with count | Omni Calculator, Calculator.net | Fits, derived from the catalog |
| Featured short list with an all-tools link | Smallpdf, Omni | Fits (Featured, never "popular") |
| Workspace first, reference beside | regex101 | Fits developer tools |
| Social proof blocks | Linear, Notion, Stripe, Omni | Does **not** fit (rulebook 3.1) |
| Skip links | Linear, MDN | Fits; already good practice |

No reference was fetched twice and no result was cached beyond the retrieval tool's own 15-minute cache. Counts such as "3938" and "about 35" are the reference's content on 2026-10-29 and will drift.
