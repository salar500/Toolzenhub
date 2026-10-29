# 06 Logo and favicon concepts

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. The logo and favicon are in scope by the owner's explicit direction. **These are non-production concepts.** No site asset was replaced. Review them at `concepts/design-concepts.html` (section "Logo concepts") and as SVG files `concepts/logo-a-hub.svg`, `logo-b-precision.svg`, `logo-c-monogram.svg`.

## Audit of what exists (VERIFIED)

| Asset | State | Problem |
| --- | --- | --- |
| Header and footer mark | text glyph `▦` inside a CSS circle (`.brand-logo`) | A Unicode character is not a logo: its shape depends on the operating system font; it is not scalable art; it is not reusable as a favicon or share image |
| Wordmark | "ToolZen" in ink and "Hub" in green, Georgia, with a Georgia subtitle | Serif wordmark conflicts with the Inter UI (F-01) |
| `favicon.svg` | 100x100, `#14B8A6` rounded square with a white "T" | White on `#14B8A6` is 2.49:1, below the 3:1 non-text target; the teal does not match the header green; the "T" is a letter of the name's first word only |
| Social share image | none site-wide; Open Graph images exist only where a page supplies one | UNKNOWN beyond that; the OG default is a requirement (BR-05) |
| Touch icon | none found in the base layout (only `rel="icon"` SVG) | no home-screen icon on iOS (INFERRED from the head template) |

## Design brief

A mark that works at 16 px on a browser tab and 180 px on a phone home screen; uses one flat colour plus one accent; has a light-background, a dark-background and a monochrome version; is an SVG under 2 KB; does not resemble a competitor's mark (rulebook 12.5); suggests a **hub of precise tools**, not a calculator or a coin.

## Concepts

All three use a 100 x 100 rounded square (radius 22), near-black `#1c1917` ground, white glyph and indigo `#a5b4fc` accent (the light tone of the recommended accent on a dark ground). Colours follow whichever palette the owner approves.

| Concept | Idea | Strengths | Weaknesses | Small-size risk |
| --- | --- | --- | --- | --- |
| **1. Hub** (abstract utility hub) | a ring with four nodes joined by short spokes | says "hub" and "connected tools" directly; symmetric, calm; works as a loading mark | resembles generic network or settings icons | spokes disappear below 24 px, so the **favicon variant drops the spokes and thickens the ring and the four dots** |
| **2. Connected tools** (precision grid) | three tool tiles and one tile turned 45° and offset in the accent colour | the offset tile reads as "the tool you reached for"; echoes the product's card grid; strong silhouette | a 2x2 grid is a common app-launcher shape | holds up well; the favicon variant enlarges the tiles by about 15% |
| **3. Z monogram** (minimal geometric) | a blocky "Z" with a dot at the corner | the most ownable letterform; fastest to recognise; simplest SVG | the letter references only the middle of the name ("Zen"); a "Z" mark is a common choice | most legible at 16 px; the favicon variant drops the dot |

Not pursued: a coin or calculator glyph (looks like the current hero art and implies finance only); a leaf or enso (clashes with the "precision" tone); a full wordmark in the favicon (illegible at 16 px, the task's explicit warning).

### Required variants (specification, not production assets)

| Variant | Concept 1 | Concept 2 | Concept 3 |
| --- | --- | --- | --- |
| Primary logo (symbol plus wordmark) | symbol 32 px then "ToolZen Hub" in Inter 700, 19 px | same | same |
| Compact symbol | the 100x100 mark | same | same |
| Favicon (16 and 32 px, SVG plus PNG fallbacks) | ring and four dots, no spokes | larger tiles | no corner dot |
| Monochrome | single colour, ring, spokes and dots | four tiles in one colour | single-colour "Z" |
| Light background | near-black ground, white glyph | same | same |
| Dark background | off-white ground (`#fafaf9`), near-black glyph, indigo `#4338ca` accent | same | same |
| Browser-tab rendering | shown at 16 px on a light and a dark tab strip | same | same |
| Wordmark | Inter 700 "ToolZen Hub" in ink; the second word is **not** coloured (a green or indigo "Hub" repeats the old pattern and loses contrast) | same | same |

The concept board renders every variant at header size (32 px), tab size (16 px) and 64 px, on light, dark and monochrome grounds. Rendering was inspected at desktop width on the system Chrome; it was **not** inspected in an actual browser tab strip or on a phone home screen (NOT VERIFIED).

## Evaluation

| Criterion | 1 Hub | 2 Connected tools | 3 Z monogram |
| --- | --- | --- | --- |
| Symbol clarity | 4 | 4 | 5 |
| Memorability | 3 | 4 | 4 |
| Scalability to 16 px | 3 (with the favicon variant) | 4 | 5 |
| Distinct from competitors | 3 | 3 | 3 |
| Fit with the product idea | 5 | 5 | 3 |
| Colour adaptability and dark ground | 5 | 5 | 5 |
| SVG size | about 0.5 KB | about 0.4 KB | about 0.3 KB |
| Accessibility (decorative with a text name) | 5 | 5 | 5 |

Scores are judgements (HYPOTHESIS). **Recommended: Concept 2 (Connected tools)**, because it carries the product idea (tools that connect, one highlighted) and survives 16 px. Concept 3 is the safest favicon; the owner may pair Concept 2's symbol with a "Z"-free wordmark. This is a design decision for the owner (approval item 4 and 5 in doc 20); the requirements BR-02 and BR-03 are written for whichever is chosen.

## Requirements link

BR-02 (one SVG logo), BR-03 (favicon and touch icon matching the logo colours, with a 16 px legibility check), BR-05 (variants and a local OG image). Final production assets are made in milestone UI-1 after approval, never before.
