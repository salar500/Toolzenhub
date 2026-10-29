# 04 Brand identity research

**PROPOSED — NOT APPROVED FOR IMPLEMENTATION**

UI/UX Design System 2.0, Prompt 1 of 3. Written 2026-10-29. Colour numbers are in doc 05; logo and favicon concepts are in doc 06.

## What the brand is today (VERIFIED)

| Element | Today |
| --- | --- |
| Name and line | "ToolZen Hub" with the second word in green; subtitle "Smart Tools, Smarter You" in Georgia |
| Logo | a Unicode `▦` glyph in a `#0b9f58` circle |
| Favicon | white "T" on `#14B8A6` teal, rounded square |
| Greens in use | `#0b9f58` (brand, 3.43:1 on white), `#087f47` (action), `#14B8A6` (favicon), `#ecfdf3` (soft); an unused blue scale remains in the token file |
| Type | Inter for content, Georgia for header and navigation, Times for legal pages |
| Imagery | one 3D calculator-and-coins hero, six stock photographs |
| Voice | plain, honest, specific; "estimates, not advice"; narrow privacy claims |

The owner states green and white are historical colours, not requirements. There is **no brand-equity evidence to protect**: the only recorded search data is about 49 clicks and 1,500 impressions over three months, mostly branded queries (`docs/ecosystem-review/11-...`, RECORDED). A change of colour therefore carries little recognition cost; this is a HYPOTHESIS, not a measurement.

## What the brand needs to carry

ToolZenHub spans four jobs with different moods, so the identity must not belong to only one of them:

- **Financial calculators** (money, tax, loans): need calm, trust, precision, and restraint. Loud colour near money figures reads as marketing.
- **Developer tools and practice labs**: need a neutral workspace, monospace legibility, and low visual noise around code.
- **Time tools**: live numerals; need steady, tabular, quiet design.
- **Image and PDF tools**: task-and-file flows; need clear primary actions and confidence that files stay local.
- **Articles**: long reading; need a calm reading surface.

The rulebook adds: premium means clarity and speed, not decoration (7.1); no fake social proof (3.1); imagery must explain (6.4); the header stays uncluttered (4.5).

## Evaluation criteria and how they are scored

Each direction is judged on the criteria the task lists. Scores are judgements on a 0 to 5 scale, written with reasons, and are **HYPOTHESIS** unless noted. Contrast figures are VERIFIED (computed).

| Criterion | A · Modern Emerald | B · Blue and Slate | C · Premium Neutral + Indigo | D · Deep Teal and Ink |
| --- | --- | --- | --- | --- |
| Memorability | 3: green is the most common "finance and growth" colour | 2: the most common software blue | 4: near-black plus one indigo accent is distinctive in utility sites and gives the logo room to be the memorable element | 4: teal with a warm amber accent is uncommon in tool sites |
| Trustworthiness | 4 | 5: the conventional trust colour | 4: restrained, as in infrastructure and fintech products (INFERRED from Vercel/Stripe texts, visuals UNKNOWN) | 4 |
| Professional appearance | 4 | 4 | 5 | 4 |
| Readability / accessibility | 5: all 16 checks pass | 5 | 5 (highest text and button contrast: 17.5:1) | 5 |
| Emotional impression | warm, optimistic | cool, corporate | calm, focused, editorial | calm, fresh |
| Suitability for financial calculators | 4: green can imply "profit"; risks bias next to losses | 4 | 5: results and states carry the only colour, so a number is never competing with brand colour | 4 |
| Suitability for developer tools | 3 | 4 | 5: neutral workspace around code | 4 |
| Suitability for learning tools | 4 | 3 | 4: success/error colours stay meaningful | 4 |
| Longevity | 3: tied to a trend | 3 | 5: neutral ages slowly | 4 |
| Maintenance complexity | low | medium (new hue everywhere) | medium (new hue everywhere, but fewer coloured elements to maintain) | medium |
| Fit with current code | highest (nearest to today's tokens) | low | medium | medium |

## The four directions

**A. Modern Emerald.** A refinement of the present identity: deep emerald `#047857` for actions and links, amber `#b45309` for eyebrows, off-white tinted green background. Easiest migration. Weakness: green carries "money going up" connotations that conflict with rulebook 3.7 (projections are not forecasts) when it sits next to a result, and a green brand makes a green "success" state ambiguous.

**B. Professional Blue and Slate.** `#1d4ed8` primary on slate neutrals, cyan-700 accent. The safest corporate look. Weakness: least distinctive; links, primary and info colour collapse into one hue so information states lose separation.

**C. Premium Neutral with Indigo accent.** Warm near-black (`#1c1917`) is the primary button colour and the wordmark; indigo `#4338ca` is the single accent for links, focus rings, active states and eyebrows. Backgrounds are stone-tinted whites. Colour is scarce, so success (green), error (red), warning (amber) and info stay unambiguous. The logo can be the main memorable mark.

**D. Research-derived: Deep Teal and Ink.** Derived from the repository evidence instead of a competitor: the header uses a green and the favicon a teal, so a single deep teal `#0f766e` unifies the two, keeps a link to the existing identity, and avoids the "profit green" problem of A by shifting hue. Amber `#b45309` is the warm counterpoint. Evidence strength: INFERRED (the argument is about internal consistency, not user research).

Other palettes were considered and not elaborated: a purple-led identity (too close to a large number of developer-tool brands and weak for finance), and an orange/yellow identity (accent colours at 4.5:1 on white are brown, which loses the brightness that motivated them).

## Recommendation (brand direction)

**Option C.** Reasons, in order: (1) rulebook 7.1 says premium is clarity and hierarchy, and a neutral-led system gives the strongest result and state hierarchy; (2) it is the most suitable of the four for both financial figures and code; (3) the highest measured text and button contrast (17.5:1 for button label, 7.9:1 for the accent on white); (4) it ages slowly; (5) the weakness, lower colour memorability, is solved by the logo and the wordmark rather than by a colour wash. Runner-up: **D** if the owner wants colour presence in the first impression. A is rejected as the lead because of ambiguity between brand and success green; B because it is the least distinctive.

The scored comparison under rulebook section 12's six dimensions is in doc 16. The owner may choose any of the four; the requirements are written against tokens (BR-01), so a switch changes values, not structure.

## Brand voice and copy (unchanged)

Copy is not part of this programme. The existing H1, description and privacy wording stay unless the owner approves a change (DS-01). No testimonial, user count, award or "popular" label is introduced (rulebook 3.1 to 3.3).
