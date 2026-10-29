# 16 Design alternatives and scoring

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Every concept below is **PROPOSED — NOT APPROVED**. Rendered comparison: `concepts/design-concepts.html` (four tabs; same real content, different palette, header treatment, hero, radius and density). The board varies colour, header, hero tint, radius and card density; it does not render the rail, logo or favicon differences per option beyond the logo colours. Those are specified here.

## The four directions in full

| Attribute | **A · Modern Emerald** | **B · Professional Blue and Slate** | **C · Premium Neutral + Indigo** (recommended) | **D · Deep Teal and Ink** |
| --- | --- | --- | --- | --- |
| Character | an evolution of today's identity | corporate and technical | editorial, calm, content-first | fresh technical, a unified successor to today's two greens |
| Palette (primary / accent / ink) | `#047857` / `#b45309` / `#0f1a16` | `#1d4ed8` / `#0e7490` / `#0f172a` | `#1c1917` / `#4338ca` / `#1c1917` | `#0f766e` / `#b45309` / `#0b1f23` |
| Typography | Inter (self-hosted), as doc 05 | same | same | same |
| Logo concept | hub or grid symbol in emerald | grid symbol in blue | grid symbol, ink ground, indigo accent tile | hub symbol in teal |
| Favicon concept | simplified ring and dots in emerald | enlarged tiles in blue | enlarged tiles in ink, indigo accent | ring and dots in teal |
| Header | white, hairline bottom border | **dark slate bar**, white links, light-blue current marker | white, hairline bottom border | white, teal current marker |
| Desktop sidebar (All Tools rail) | tinted selected row, emerald bar | slate rail, tighter rows | white rail, hairline, ink selected bar | teal-tinted selected row |
| Mobile navigation | dropdown panel, backdrop | same, on the dark header | same, on the white header | same |
| Homepage | tinted hero band, section cards with soft shadow, optional live result card | compact plain hero, dense section cards | plain hero, large type, hairline cards, generous space | tinted hero band and tinted card band, amber counts |
| All Tools directory | rail plus three-column cards | rail plus four-column compact cards | rail plus three-column cards | rail plus three-column cards on a tinted band |
| Tool page | standard frame, emerald primary | dense frame, blue primary | standard frame, ink primary, indigo focus and links | standard frame, teal primary |
| Article page | 720 reading column, emerald links | same, blue links | same, indigo links | same, teal links |
| Card design | radius 14, 1 px divider, soft shadow, padding 16 | radius 8, 1 px divider, no shadow, padding 12 | radius 14, 1 px divider, no shadow, padding 20 | radius 12, 1 px divider, soft shadow, padding 16 |
| Button hierarchy | emerald fill / outline / link / red outline | blue fill / outline / link / red outline | **ink fill** / outline / indigo link / red outline | teal fill / outline / link / red outline |
| Form controls | 44 px, radius 10, 1.5 px border `#7a8c84` | 44 px, radius 6, border `#64748b` | 44 px, radius 10, border `#78716c` | 44 px, radius 10, border `#6b8285` |
| Iconography | one sprite, 1.75 stroke, `currentColor` | same, 1.5 stroke | same, 1.75 stroke | same, 1.75 stroke |
| Imagery | diagrams only, no stock art | same | same | same |
| Interaction and motion | 120 / 200 ms, transform and opacity only | same | same | same |
| Density | medium | **high** | **low (airy)** | medium |

## Scoring under the rulebook's own method (section 12)

The rulebook scores opportunities from 0 to 5 on six dimensions with fixed weights and says the total is decision support, not measurement (12.3). That method is applied here without a new policy; the dimensions are read for a design decision:

| Rulebook dimension | Weight | Read as | A | B | C | D |
| --- | --- | --- | --- | --- | --- | --- |
| Search demand and discoverability | 25% | does it keep or improve how people find and reach tools (structure, static links, search first) and keep SEO intact | 4 | 4 | 4 | 4 |
| Repeat use and retention | 25% | comfort and clarity across repeated use: contrast, calm, density, state clarity | 4 | 3 | 5 | 4 |
| Practical user usefulness | 20% | task speed and clarity on a phone; result and action hierarchy | 4 | 4 | 5 | 4 |
| Differentiation | 10% | would a visitor remember it; distinct from the common blue and green utility look | 3 | 2 | 4 | 4 |
| Implementation and maintenance feasibility | 10% | effort, regression risk, fit with the current tokens | 5 | 3 | 3 | 4 |
| Trust, privacy and performance | 10% | trust signals; no extra requests; weight | 4 | 5 | 4 | 4 |
| **Weighted total (of 5)** | | | **4.00** | **3.55** | **4.35** | **4.00** |

Arithmetic: A = 0.25x4 + 0.25x4 + 0.20x4 + 0.10x3 + 0.10x5 + 0.10x4 = 4.00; B = 1.00 + 0.75 + 0.80 + 0.20 + 0.30 + 0.50 = 3.55; C = 1.00 + 1.25 + 1.00 + 0.40 + 0.30 + 0.40 = 4.35; D = 1.00 + 1.00 + 0.80 + 0.40 + 0.40 + 0.40 = 4.00.

**Labelling (rulebook 12.1 and 12.4).** Search and SEO equality is **VERIFIED** reasoning (palette does not change HTML). Repeat-use comfort for C is a **reasoned hypothesis**: no usage data exists (UNKNOWN). Differentiation is a hypothesis built on doc 03 (text-only observations, visuals UNKNOWN). Feasibility scores are **reasoned from the repository** (A is the nearest to today's tokens: VERIFIED; the extent of work for B, C and D is similar and larger: hypothesis). The conclusion depends on two hypotheses (repeat-use comfort and differentiation), which the owner's own reaction to the board tests better than any measurement could.

**Mandatory gates (rulebook 12).** All four pass: they solve a meaningful user problem; are not a duplicate; cannot mislead output; maintenance is proportionate; need no paid API; create no privacy risk (they remove third-party requests); deliver an acceptable mobile experience (320 px geometry measured on the board); and are not added to raise a count.

**Verdict labels (adapted from 12.7; a planning status only, not approval to build).** C: **A**, recommended planning candidate. D: **B**, credible alternative that needs the owner's colour preference. A: **C**, future or fallback if the owner wants continuity. B: **C**, least distinctive.

**Sensitivity.** If repeat-use comfort for C were scored 4 instead of 5, C would score 4.10 against 4.00 for A and D; if differentiation for C were 3, C would score 4.25. C still leads in both cases, but a lead of 0.1 to 0.35 is small enough that the owner's preference should decide. The scoring is not evidence that C is objectively best.

## Evaluation by the task's criteria

| Criterion | A | B | C | D |
| --- | --- | --- | --- | --- |
| Professional appearance | good | good | strongest | good |
| Brand distinctiveness | medium | low | high | high |
| Trust | good | strongest | strong | good |
| User comfort | good | good (dense) | strongest | good |
| Readability and accessibility | 80 of 80 checks pass | 80 of 80 | 80 of 80 | 80 of 80 |
| Mobile experience | same structure | same | same | same |
| Scalability to hundreds of tools | same | same | same | same |
| Performance | same (tokens only) | same | same | same |
| Maintenance | lowest | medium | medium | medium |
| Fit with the existing architecture | highest | medium | medium | medium |
| Implementation effort | lowest | highest | medium | medium |
| Regression risk | lowest | highest | medium | medium |

## Classification of the main proposals

P0 essential, P1 valuable follow-up, P2 optional, DEFER not justified yet, REJECT inappropriate. Requirement IDs refer to doc 17.

| Proposal | Class | Reason | Reqs |
| --- | --- | --- | --- |
| New colour system (tokens and contrast fixes) | **P0** | closes the 3.43:1 text and 1.47:1 border findings; one source of truth | BR-01, BR-09 |
| Typography (self-hosted Inter, drop the serif, remove Google Fonts) | **P0** | removes inconsistency and a third-party request | BR-04 |
| Logo redesign | **P0** | the current mark is a text glyph | BR-02 |
| Favicon redesign | **P0** | the current favicon is 2.49:1 and does not match | BR-03 |
| Button system | **P0** | one hierarchy, states, 44 px | IX-01, IX-02 |
| Card redesign (one card system) | **P0** | several card styles today | DS-07, DS-02, DS-04 |
| Form controls | **P0** | 1.47:1 border | IX-04 |
| Mobile drawer (restyle and contain focus) | **P0** | verified gaps: 40 px toggle, no containment | GL-03 |
| All Tools category rail and mobile chips | **P0** | solves a long single column; owner asked for sidebar evaluation (needs owner confirmation of rule 4.8 reading) | GL-04, GL-05 |
| Header and footer | **P0** | serif header; dead social links | GL-01, GL-02 |
| Local, explanatory imagery; remove stock art | **P0** | rulebook 6.4; removes a third party | DS-01, DS-04 |
| Icon system | **P0** | emoji and glyph icons | BR-06 |
| Tool search improvements | **P1** | needs an audit first; behaviour unverified | GL-10 |
| Related-tools panel (same section) | **P1** | rulebook 4.8 pilot, its own approval | GL-06 |
| Article-layout modernisation | **P1** | reading column and TOC | CT-01, CT-02, CT-04 |
| Brand asset variants and OG image | **P1** | useful, not blocking | BR-05 |
| Animated transitions (drawer, accordion, reveal only) | **P0 as rules, P2 as extras** | the rules (IX-06) are P0; any decorative motion is P2 and not specified | IX-06 |
| Section tint tokens | **P2** | optional | BR-07 |
| Dark mode | **DEFER** | not required; baseline cost; persistence conflicts with rulebook 7.7 | BR-08 |
| Contextual same-section tool rail | **DEFER** | takes workspace width; next step of rulebook 4.8 | TX-09 |
| Global persistent sidebar (Model A) | **REJECT** | contradicts rulebook 4.5 and 4.8; costs 240 px on every tool | none |
| Collapsible global sidebar (Model B) | **REJECT** | same reasons, more state | none |
| New decorative illustration system | **REJECT** | rulebook 6.4 and 7.1; no meaning added | none |
| Hotlinked or locally hosted stock photography | **REJECT** | does not explain; licence and performance cost | none |
| Heavy animation library or framework | **REJECT** | rulebook 9.1; no need shown | none |
| Social proof, "popular" labels, user counts | **REJECT** | rulebook 3.1 to 3.3 | none |
