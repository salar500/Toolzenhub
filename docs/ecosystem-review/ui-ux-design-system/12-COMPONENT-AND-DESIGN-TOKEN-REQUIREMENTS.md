# 12 Component and design token requirements

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Values below are for Option C (recommended). If the owner picks another palette, only the colour tokens in doc 05 change. Requirement IDs refer to doc 17. Variable names are illustrative; naming is resolved in development.

## Design tokens (BR-01, GL-08, GL-09, IX-05, IX-06)

| Group | Proposed values | Replaces (VERIFIED today) |
| --- | --- | --- |
| Colour | semantic roles in doc 05 (bg, surface, border, divider, ink, muted, primary, primary-hover, soft, accent, link, success, error, warning, info, focus, disabled) | brand green, action green, blue scale, gray-50…900, 1,436 literals |
| Spacing (4 px base) | 4, 8, 12, 16, 24, 32, 48, 64 px | `--space-1…20` (similar) plus ad-hoc paddings |
| Radius | 6 (chips, tags), 10 (controls, buttons), 14 (cards, panels), 999 (pills) | 6, 7, 8, 9, 10, 12, 14, 999 px |
| Shadow | `0 1px 2px rgba(28,25,23,.06)` (resting card), `0 8px 24px rgba(28,25,23,.12)` (menu, dialog); no coloured shadows | `--shadow-sm/md/lg` |
| Border | 1 px divider for surfaces; 1.5 px control border at 3:1 | 1 px `#d0d5dd` / `#e5e7eb` |
| Type | scale and weights in doc 05 | Inter 300 to 800, Georgia |
| Layout | gutters 16 / 24 / 32; widths 720 / 1120 / 1440; breakpoints 640 / 960 / 1280 | container 1280, seven or more breakpoints |
| Motion | 120 ms (hover, press), 200 ms (drawer, accordion, reveal), `ease-out`; transform and opacity only | `.2s ease` on border-color and others |
| Focus | 2 px accent ring, 2 px offset | existing rings, restored in `accessibility.css` |
| Z-index | header 20, menu 30, backdrop 25, dialog 40 | unspecified |

One token file feeds the shared layer. Tool stylesheets use tokens and contain only tool-specific layout (TX-08).

## Component specifications

"Hover" means pointer devices only; no component depends on hover to reveal an action. "Focus" is the 2 px ring everywhere. Heights are minimums.

| Component | Appearance, spacing, type | Colour, border, shadow, radius | Responsive | States and accessibility | Reqs |
| --- | --- | --- | --- | --- | --- |
| **Tool card** | name 16 px / 600, one-line purpose 14 px muted, section label 12 px caps accent; padding 16; min height 72 | surface, 1 px divider, radius 14, resting shadow none | 1, 2, 3 columns at 640 / 960 | one link per card; hover darkens the border; focus ring; no nested links | DS-07 |
| **Category / section card** | same anatomy with a catalog count | same | five across at 1200 and up, stacked on phones | same | DS-02 |
| **Article card** | title 18 px / 600, 2-line summary, tag 12 px, optional diagram thumbnail (16:9) | same | 3 / 2 / 1 columns | thumbnail has descriptive alt text or none | DS-04 |
| **Input card / panel** | padding 20 to 24; fields stacked; 16 px gaps | surface, 1 px divider, radius 14 | single column below 960 | grouped with a labelled region where several | TX-02 |
| **Result card** | eyebrow, headline figure 36 px / 700 tabular, rows of label and value, assumption text 14 px muted | surface, 1 px divider; headline in ink, not brand colour | sticky at 960 and up, in flow below | live region polite; result never shows a partial figure (rulebook 7.9) | TX-02 |
| **Summary card** | 3 to 4 metrics, label above value | soft tint background allowed | wraps to 2 columns, then 1 | each metric is a label and a value, not an image | TX-02 |
| **Table** | 14 px, cell padding 10 x 12, numeric columns right-aligned, header 600, zebra not used | divider rules only | scroll region (`role="region"`, `tabindex="0"`, label) | real `table`, `th scope`; caption where useful | CT-03 |
| **Alert** | icon, bold lead word, text; padding 12 | surface with a 1.5 px semantic border; text ink; lead word semantic colour | full width | polite status where it appears dynamically; meaning in words, not colour alone | IX-08 |
| **Tabs** | 44 px tab height, 2 px underline indicator, label 14 px / 600 | no fill; selected uses ink and an accent underline | scrollable region on phones | `tablist`, roving tabindex, arrow keys | IX-09 |
| **Accordion** | native `details`; summary 44 px, icon right, content padding 16 | divider top and bottom | single column | Enter and Space; focus ring; content in static HTML | CT-04 |
| **Dialog** | max width 560, padding 24, header and footer rows | surface, 14 radius, menu shadow, scrim 35% ink | sheet-style full width below 640 with safe-area padding | existing `activateDialog` mechanics: focus in, contained, Escape, focus return, background inert | IX-07 |
| **Upload area** | a 44 px "Choose files" button first, plus a dashed 1.5 px drop zone as an enhancement; list below; remove buttons 44 px | surface, dashed divider-strong border | drop zone hidden below 640 | operable by keyboard; drag is never required; file names are text | TX-05 |
| **Progress** | determinate bar 8 px high with a percentage in text; indeterminate shown as text "Working…" with a non-animated bar under reduced motion | track divider, fill primary | full width | `role="progressbar"` with value; text equivalent | TX-05 |
| **Flashcard** | card 720 max, question 22 px / 600, answer revealed beneath, rating buttons 48 px | surface, 14 radius, no 3D flip | full width | "Show answer" button; answer region labelled; reveal is instant under reduced motion | TX-07 |
| **Challenge panel** | task text, editor or field, Check, hint, verdict | surface, verdict alert with icon and word | stacked below 960 | verdict polite; never colour alone | TX-06 |
| **Button** | 44 px min, padding 0 18 px, label 15 px / 600, radius 10 | primary ink fill white label; secondary surface with 1.5 px border and ink label; tertiary link; destructive error outline | full width and stacked when more than two on a phone | states: default, hover, active, focus-visible, disabled, loading, success; enabled secondary never uses the disabled pair | IX-01, IX-02 |
| **Form control** | label above 14 px / 600, 44 px field, 16 px text, hint 13 px muted, error text with icon | 1.5 px border at 3:1; focus ring; error border plus text | single column | linked hint and error, `aria-invalid`, units inside field | IX-04 |
| **Breadcrumb** | 14 px, separators decorative, wraps | link colour, current page plain | wraps to two lines | `nav aria-label="Breadcrumb"`, `aria-current` | GL-07 |
| **Chip (section)** | 44 px, 14 px / 600, pill radius, 1 px border | selected: ink fill, white label | scroll region | link semantics; `aria-current` | GL-05 |

## Anti-patterns to avoid

Multiple card systems with different radii; a colour used only for decoration; tool CSS that restates button colours per state (U4); hover-only information; animation on result updates; gradient buttons; coloured shadows; icon-only controls without a name.

## Consumer map (which pages a component change reaches)

| Component | Consumers | Risk |
| --- | --- | --- |
| Tokens | every page (all 109 CSS files that read them) | HIGH: change values once, verify by family (doc 15) |
| Button, form control | all 54 tools, About and Contact forms where present | HIGH |
| Tool card | Home, All Tools, 5 section pages, category pages | MEDIUM |
| Header, footer, menu | every page | HIGH |
| Result card, table | 19 calculators, some time and developer tools | MEDIUM |
| Dialog | Loan Comparison and other modal users | MEDIUM |
| Upload area, progress | 5 image and PDF tools | MEDIUM |
| Article card, article layout | Articles listing, Home, 34 articles | LOW to MEDIUM |
