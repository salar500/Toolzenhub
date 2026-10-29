# 08 Desktop sidebar research

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. The owner asked for a desktop sidebar to be evaluated. This document evaluates four models, recommends one, and flags where the recommendation touches a rulebook rule.

## Facts that frame the decision

| Fact | Value | Label |
| --- | --- | --- |
| Tools | 54 in five flat sections (19, 13, 17, 2, 3); Calculators has 8 categories | VERIFIED |
| Sections with 3 or fewer tools | Image Tools 2, PDF Tools 3 | VERIFIED |
| Current All Tools | one long column of five sections and 23 groups; 396 DOM nodes | VERIFIED |
| Rulebook 4.8 | "no sidebar exists"; a site-wide sidebar only after a same-section pilot; "desktop-sized sidebar must not take phone screen space"; never lists a tool from another section | VERIFIED |
| Reference scale | MDN's tree covers hundreds of pages; PDF24's flat grid covers 24 tools; iLovePDF uses filter tabs for dozens | OBSERVED (doc 03) |
| Working width | editors and calculators need 720 to 1120 px; wide tools up to 1440 px | doc 11 |

## The four models

| Model | Description |
| --- | --- |
| **A. Persistent left sidebar on every page** | A global navigation column listing sections and tools |
| **B. Collapsible category sidebar** | A global sidebar whose five sections expand and collapse |
| **C. Full-page All Tools directory with sidebar filters** | A page-scoped column of section links and filters beside a card grid, on `/tools.html` only |
| **D. Hybrid** | Compact global header; the Model C directory on All Tools; a contextual same-section rail on tool pages |

## Width arithmetic (a sidebar is paid for with working area)

Assume a 16 px gutter below 640, 24 px to 960, 32 px above, and a 240 px rail plus 24 px gap.

| Viewport | Content width without rail | With a 240 px rail | Result |
| --- | --- | --- | --- |
| 960 | 896 | 632 | two card columns; a calculator or editor would be squeezed |
| 1280 | 1216 (container cap 1120 for standard, 1440 for workspace) | 952 | acceptable for cards; two-pane editors would lose about 20% |
| 1440 | 1376 | 1112 | comfortable |
| 1920 | cap | cap | comfortable |

A global rail (Model A or B) therefore costs 240 px on every tool page, exactly where the workspace is the product. On 1280 px laptops, the owner's own class of machine, JSON Compare or Text Diff would lose about a fifth of their working width.

## Evaluation

Scores 0 to 5 (5 best), judgements (HYPOTHESIS); reasons in the notes.

| Criterion | A | B | C | D |
| --- | --- | --- | --- | --- |
| Discoverability of all tools | 5 | 4 | 4 | 5 |
| Usable content width on tool pages | 1 | 1 | 5 (no rail on tools) | 3 |
| Navigation complexity | 2: 54 links in view | 3: expand and collapse state to learn | 5 | 3 |
| Search integration | 3 | 3 | 5: search sits at the top of the same rail | 4 |
| Few clicks to reach a tool (5 = one click) | 5 | 4 | 3 (All Tools, then card; one via search) | 4 |
| Keyboard access | 3: a long link list before the content, needs a skip link | 3: needs disclosure semantics for five groups | 5: five links | 4 |
| Mobile adaptation | 1: must become a drawer anyway | 2 | 4: becomes chips | 3 |
| Screen-reader behaviour | 3 | 3 | 5: a labelled navigation of five links | 4 |
| Maintenance | 2: a second source of navigation | 2 | 5: derived from the catalog like the page it sits on | 3 |
| SEO | 3: 54 repeated sitewide links dilute and bloat | 3 | 5: links already exist on the page | 4 |
| Rulebook fit | 1: contradicts 4.5 and 4.8 | 1 | 4: needs one owner confirmation | 2: tool-page rail needs a pilot (4.8) |
| **Total (of 55, unweighted)** | 29 | 29 | **50** | 39 |

The totals are a thinking aid, not a measurement (rulebook 12.3).

## Recommendation

**Model C for this programme, with the tool-page rail of Model D recorded as DEFER.**

1. **All Tools page, 960 px and wider:** a sticky 240 px **rail** (GL-04): the shared search, then Calculators, Time Tools, Developer Tools, Image Tools, PDF Tools each with its catalog count; each is an in-page link to that section. The current section is marked with `aria-current` and a non-colour cue (left bar plus tint). The grid is two columns at 960 and three at 1280. No collapsing, no tree, no nested tool list: five links are not a hierarchy.
2. **Below 960 px:** section **chips** (GL-05), see doc 09. No sidebar on a phone.
3. **Tool pages:** **no global sidebar.** The working area keeps the full workspace width class (GL-08). Related tools appear in flow after the workspace as a pilot panel (GL-06, P1). A contextual rail beside the workspace is DEFER (TX-09): it would take 240 px from the tool, it is the next step of rulebook 4.8 and needs a pilot and approval.
4. **Rejected:** Model A and B as global navigation (REJECT in doc 16).

### Behaviour specification (for requirement GL-04)

| Aspect | Specification |
| --- | --- |
| Markup | `<nav aria-label="Sections">` containing a list of five links; the search field above it in the same aside; all in the static HTML |
| Stickiness | `position: sticky; top: header height + 16 px`; own scroll only when taller than the viewport |
| Scroll target | each link targets the section heading id; `scroll-margin-top` clears the sticky header; focus moves to the heading (tabindex -1) so the keyboard user lands in the right place |
| Current section | updated on click and on scroll with a lightweight observer; if scripting fails the links still work; no animation under reduced motion |
| Counts | derived from the catalog (19, 13, 17, 2, 3 today) |
| Performance | a single IntersectionObserver; under 1 KB gzip; no layout reads on scroll |
| Mobile | not rendered below 960 px |

## Rulebook interaction (flagged, not silently resolved)

Rulebook 4.8 says no sidebar exists and a site-wide sidebar is considered only after a same-section pilot. The proposed rail is **page-scoped to one directory route** and offers in-page jump links, not cross-tool navigation. If the owner reads 4.8 as covering any sidebar, the rail needs the 4.8 pilot approval path, and GL-04 would move to P1 and GL-05 chips would carry the whole job on every width. This is approval item 6 in doc 20.
