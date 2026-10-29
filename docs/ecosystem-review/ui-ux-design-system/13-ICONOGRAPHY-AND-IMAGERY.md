# 13 Iconography and imagery

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Nothing was downloaded, replaced or optimised during research. Requirement IDs refer to doc 17.

## Icons: audit (VERIFIED)

| Where | What is used | Problem |
| --- | --- | --- |
| Header and footer logo | text glyph `▦` | not a logo (doc 06) |
| Home section cards | emoji (abacus, calendar, picture, page) and a `{ }` text glyph | rendered by the operating system: colour, weight and style differ per device; emoji are not a professional icon system |
| Featured cards and tool catalog | `₹ % ◷ ▦ ⚖ ⇄ ↗ ◔ ◉ ▤ ▣ { }` text glyphs inside tinted squares | inconsistent weight and metaphor; several glyphs are ambiguous (what does `◔` mean?) |
| Search button | `⌕` glyph | fine visually, but a glyph |
| Status and alerts | mix of `✓`, `⚠` and plain text | acceptable; they should come from the same set |
| Social links | letters `f`, `X`, `in`, `◎` linking to `#` | dead (F-10) |

## Recommendation (BR-06, P0)

One **inline SVG sprite** (a single file, referenced with `<use>`), a 24 px grid, 1.75 px stroke, round caps and joins, `currentColor`. About 30 icons, each with a purpose:

| Group | Icons |
| --- | --- |
| Sections | calculator, clock, code braces, image, document (PDF) |
| Actions | search, copy, download, upload, remove (x), reset (counter-clockwise arrow), add, check, external link, menu, close, chevron |
| Status | success (check circle), error (alert circle), warning (triangle), info (i circle) |
| Content | article, book (learning), lock (privacy), shield |

Rules: an icon never stands alone without an accessible name; a decorative icon next to a label is `aria-hidden`; no icon font; no emoji as UI; no colour-only meaning.

**Source.** Draw the set in-house, or adopt an open-source set under a permissive licence. Licence and attribution are checked before adoption (this research did **not** verify any licence; `docs/ecosystem-review/17-OPEN-SOURCE-REFERENCE-REGISTER.md` is the right place to record the choice). Budget: sprite under 8 KB gzip.

**Rejected:** emoji (inconsistent, OS-dependent); an icon font (extra request, accessibility issues); a large library import (weight); decorative icons on every tool (rulebook 7.1 and "avoid decorative icons that add no meaning").

## Imagery: audit (VERIFIED)

| Asset | Where | Verdict |
| --- | --- | --- |
| `hero-calculators.webp` 190 KB (PNG 1.26 MB also in the repo) | Home hero: 3D calculator, coins and a chart | generic; the rulebook names "floating coins" as an example to avoid (6.4); remove from the hero |
| `articles-hero.webp` 29 KB (PNG 740 KB) | Articles listing | not inspected in detail; keep if it explains, else remove |
| Six hotlinked Unsplash photographs | Home and Articles cards | not concept-specific (a house model, coins and a plant); a third-party host; disclosed on the Privacy page; `docs/design-follow-ups.md` §2 already lists this |
| Article diagrams (29 small WebP files, each also kept as PNG, in `assets/Images/articles`; about 4 KB each as WebP) | article heroes | these explain the concept and use real numbers: the right pattern; the layout around them leaves the card mostly empty (F-15) |
| PNG sources kept next to their WebP (2 hero images, 29 article diagrams) | repository | whether any page serves a PNG was not checked; their presence is a repository hygiene matter, not a measured page cost |

## Imagery direction (rulebook 6.4 order of preference)

1. an explanatory diagram or a chart drawn from the tool's real numbers (articles, tool explanations);
2. a concept-specific illustration (only where a diagram cannot do the job);
3. a genuinely relevant contextual image;
4. **none**.

| Use | Decision |
| --- | --- |
| Homepage hero | **none** (compact hero), optionally a live HTML result card (doc 10); no stock art |
| Section pages | none; the card and the count carry the page |
| Article cards | the article's own diagram as a thumbnail, or none (DS-04) |
| Article heroes | diagrams sized to content with alt text that states what they explain (CT-02) |
| Tool previews | none; the real tool is the preview |
| Upload and empty states | a simple icon from the sprite, not an illustration |
| Flashcards and labs | none |

Loading rules: modern formats (WebP or AVIF) with `width` and `height` attributes, `loading="lazy"` below the fold, `decoding="async"`, no image above the fold that is not needed, aspect ratios reserved. **No third-party image host.** Local hosting of the Unsplash photographs is **not** recommended: it needs a licence review, a performance review and does not fix that the photographs do not explain anything (design-follow-ups §2). Removing them is the recommendation.

## Performance effect (estimates, not measurements)

Removing the hero artwork and the Unsplash images removes the images measured in this audit from the first view (response headers: Home 338 KB across 4 images, Articles 296 KB across 6) and one third-party connection. The sprite adds under 8 KB. Net saving is estimated at about 330 KB on Home (338 KB of images measured, less the sprite) and about 290 KB on Articles; to be measured in UI-4.
