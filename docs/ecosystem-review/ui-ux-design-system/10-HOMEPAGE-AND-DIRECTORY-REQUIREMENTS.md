# 10 Homepage and directory requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Requirement IDs refer to doc 17.

## Homepage evaluation (VERIFIED on the live preview)

| Element | Today | Assessment |
| --- | --- | --- |
| Header | logo glyph, four links, serif type | functional; see F-01, F-03 |
| Hero | H1 "Practical tools for better everyday decisions", a pill "100% Free · No sign-up · Works in your browser", description, search field, a 3D calculator-and-coins illustration | the message is clear; the illustration is generic and conflicts with rulebook 6.4; large empty bands above and below at 1280 px (F-06) |
| Value proposition | present in the H1 and description | says what ToolZenHub provides; does not say who it helps beyond "everyday decisions" |
| Search | prominent field and button | good; behaviour NOT VERIFIED on a phone (doc 09) |
| Tool category discovery | "Explore Tools": five cards, three columns, an empty slot; horizontal scroller on phones with a cropped card | weak on both widths (F-07) |
| Featured tools | six small cards with truncated descriptions | curated, honest; descriptions cramped |
| Recently added | none | not needed; a "recently added" strip would create a maintenance obligation (rulebook 4.5 says Home copy is not rewritten at each launch) |
| Popular tools | none | **must not be added without data** (rulebook 3.1, 3.2) |
| Educational resources | "Latest Articles": three cards with stock photographs | useful content; images do not explain (F-09) |
| Trust and privacy | only the pill in the hero | thin but honest |
| Calls to action | "View all tools", "View all articles" | adequate |
| Footer | four columns, four dead social links | F-10 |

## What the homepage must communicate

1. **What ToolZenHub provides:** calculators, time tools, developer tools, image and PDF tools, plus guides.
2. **Who it helps:** people making everyday money, date, text and file decisions; developers and testers who need a quick, local utility. (No user count or persona claim.)
3. **How quickly they can find a tool:** a search field in the first viewport and five section cards without scrolling sideways.
4. **Why to trust it:** specific, narrow facts: processed in your browser, no sign-up, estimates are labelled, privacy and disclaimer pages one click away. No ratings or logos.

## Proposed homepage architecture (DS-01 to DS-05)

```
Header (56 px mobile / 64 px desktop): logo | Home  All Tools  Articles  About
--------------------------------------------------------------------------
Hero (compact)
  H1: Practical tools for better everyday decisions        (existing copy)
  One line: Calculate, convert, check and practise ...       (existing copy)
  [ Search by name, for example EMI or GST            ][Search]
  Runs in your browser. No sign-up.  Privacy →
--------------------------------------------------------------------------
Explore tools  (five cards, counts from the catalog)
  [Calculators 19] [Time Tools 13] [Developer Tools 17] [Image Tools 2] [PDF Tools 3]
--------------------------------------------------------------------------
Featured tools  (curated; six cards; "View all tools →")
--------------------------------------------------------------------------
Latest articles (three cards, diagram thumbnail or text only; "View all →")
--------------------------------------------------------------------------
Footer
```

Four content sections after the hero; no additional strips (no stats band, no testimonials, no "how it works"). Whitespace: 32 px between a section heading and its content, 48 px between sections on desktop, 32 px on phones (the audit found bands of about 100 px of empty space between Home sections).

| Requirement | Summary |
| --- | --- |
| DS-01 | compact hero, no stock illustration, search inside the first viewport at 390x844 and 1280x800 |
| DS-02 | five balanced section cards with catalog counts; stacked list on phones, no carousel |
| DS-03 | Featured stays curated; cards show full descriptions |
| DS-04 | article cards use a local diagram thumbnail or no image; no third-party photographs |
| DS-05 | narrow trust line with a Privacy link |
| BR-06 | real icons replace emoji and glyphs on the section cards |

**Hero illustration alternative (rulebook 6.4 order of preference):** instead of the coins artwork, show a **live miniature result card built in HTML and CSS** from a real calculation (for example the EMI result for ₹10,00,000 at 8.5% over 20 years: ₹8,678 a month, interest ₹10,82,776). It explains what the product does, uses the tool's real numbers, adds no image request, and is crawlable text. It is optional and must be labelled "Example" so it is not read as a quote. It is not a requirement; the plain compact hero is sufficient.

## All Tools directory (DS-06, DS-07, DS-08, DS-10, GL-04, GL-05)

| Question | Recommendation |
| --- | --- |
| Is search still the primary method? | Yes, first on the page, and the only element repeated in the rail and the chips (one component, not two implementations) |
| Layout | search; rail (desktop) or chips (mobile); five sections in catalog order, each: eyebrow, h2, one-line purpose, count, card grid |
| Cards | one shared tool card: name, one-line purpose, section label as text; the whole card is one link; no icon-only cards. Grid 1, 2 and 3 columns at the canonical breakpoints |
| Calculators | keep the existing category grouping inside the Calculators section (Loans, Investment, Tax, Business, Math), as sub-headings |
| Status | only published tools are rendered (54 today). Coming-soon entries stay catalog data and are not rendered, not linked and not counted (DS-10). Because every shown tool is live, no "Published" badge is needed |
| Empty search | message, the query echoed as text, links to the five sections (DS-08) |
| Mobile | chips under the search field; a single column of cards; no drawer needed |
| Routes | `/tools.html` stays; no new route is created |
| Source of truth | the central catalog (`assets/js/data/tools.js` and `src/_data/directory.js`); nothing hard-coded |
| Cost | DOM currently 396 nodes; budget under 600 (DS-06) |

## Section landing pages (DS-09)

Time Tools, Developer Tools, Image Tools and PDF Tools pages use the same tool card, fix the h1-to-h3 jump, and keep their current routes and copy. The Calculators landing and category pages adopt the same card; their category structure is unchanged.

## Not proposed

A mega-menu, a persistent global sidebar, a sticky search bar, "recently viewed", "most popular", user ratings, a newsletter block, and a hero video. None is supported by evidence or the rulebook.
