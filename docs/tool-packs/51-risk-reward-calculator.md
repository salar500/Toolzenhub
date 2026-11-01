# Tool Pack 51: Risk-Reward and Position Size Calculator (compact specification, tier HIGH)

Written 2026-11-01. Authority: the owner's instruction of 2026-11-01 to build a complete first increment of N1 (entry, stop-loss, target, risk amount, potential reward, ratio, position sizing, browser-local, existing Investment architecture), blueprint `docs/ecosystem-review/universal-expansion/12-UNIVERSAL-BLUEPRINT-REFRESH-2026-11-01.md` section H, and requirements `07-REQUIREMENTS-AND-ACCEPTANCE-CRITERIA.md` N1. Tier HIGH (financial arithmetic): independent oracle required.

## Decisions (made under the owner's delegation; reasoning recorded)

| # | Decision | Reason |
|---|---|---|
| 1 | Catalog id `risk-reward`, category **Investment** (route `/calculators/risk-reward/`) | Existing category fits traders and investors; no new category (rule 4.1); the id matches the true aliases below |
| 2 | **Fees and slippage are out of v1** | The ledger deferral stands: conventions differ by market (percentage vs flat, exchange taxes, tick sizes) and the cost-aware sizing formula has no primary reference. The page says costs are not included. They can be a later extension |
| 3 | Prices are **currency-neutral numbers** (no ₹ symbol) | The tool works for any market; the page says "same unit as your prices" |
| 4 | Results update as you type; no Calculate button; Reset only | Rule 7.9 and the factory (live results) |
| 5 | The risk-based quantity is **not capped** by account size; if the position value exceeds the account, the page states the fact (no leverage assumed) | Capping silently would hide the sizing result; leverage and margin are out of scope |
| 6 | Break-even win rate = risk ÷ (risk + reward), shown as a fact "ignoring costs" | Pure arithmetic, directly useful for judging the ratio, makes the page more than a basic calculator |
| 7 | No "good/bad" verdict on a ratio, no signals, no advice | Rules 3.3, 3.5, 3.7 |

## Problem, jobs, scope

A person planning a trade wants the distances to the stop and the target, the ratio, the money at risk and a position size that keeps the loss near a chosen share of the account. Jobs: (1) what is my risk and reward per unit; (2) what is the ratio and the win rate it needs to break even; (3) how many units keep my loss at X% of my account; (4) what do I gain or lose at stop and target for that quantity.
In v1: long and short, three prices, optional account size and risk percent. Out of v1: fees, slippage, leverage, margin, taxes, options, saved trades, live prices, journaling.

## Inputs

Side (Long or Short, default Long), Entry, Stop-loss, Target (positive decimals, up to 6 decimal places, at most 1,000,000,000; commas allowed), Account size (optional, positive, at most 1,000,000,000,000), Risk per trade % (optional, greater than 0 and at most 100, up to 4 decimal places; used only with account size). Quantity is a whole number computed by the tool.

## Model (exact rational arithmetic; rounding only for display, half up)

Long: risk/unit = entry − stop; reward/unit = target − entry. Short: risk/unit = stop − entry; reward/unit = entry − target.
Ratio = reward ÷ risk. Break-even win rate = risk ÷ (risk + reward). Risk % of entry = risk ÷ entry; reward % of entry likewise.
With account A and risk percent p: risk amount = A × p ÷ 100; quantity = floor(risk amount ÷ risk/unit); position value = quantity × entry; loss at stop = quantity × risk/unit; gain at target = quantity × reward/unit; position value as % of A. Quantity 0 → "The amount you are willing to risk is smaller than the risk on one unit."

## Validation

Long needs stop < entry < target; short needs target < entry < stop. Errors name the field and say how to fix it ("For a long trade the stop-loss must be below the entry"). Empty, zero, negative, non-numeric and over-limit values are rejected with the limit stated. Partial entry: state "incomplete", no figure. Account and risk percent must be given together or not at all.

## UX, accessibility, mobile

Live result: first the ratio and break-even win rate, then risk and reward per unit, then the position-size block when account and risk percent are given. A small inline SVG scale (stop, entry, target, labelled, text carries meaning). Reset; Copy summary. Labels, hints and errors via the shared `ui/field.js`; `inputmode="decimal"`; 44 px targets; visible focus; errors linked by `aria-describedby`; one polite announcement per settled change; no focus movement on update. 320 px reviewed by the owner (manual-first).

## Honesty

States it is arithmetic on the user's own numbers, not advice or a signal; does not call any ratio good or bad; notes that gaps and fast markets can fill a stop away from the stop price and that fees and slippage are not included; uses "estimate" and "scenario" only.

## Search, relationships, SEO

Aliases (true): risk reward ratio, position size calculator, stop loss calculator, trade risk calculator. Related: sip, cagr, xirr (Investment). SEO title "Risk Reward Ratio and Position Size Calculator | ToolZen Hub"; canonical on `toolzenhub.in`; no article required in v1 (an article only if it answers a question the page does not).

## Tests (tier HIGH)

Independent oracle: `tests/unit/risk-reward.test.mjs` computes every vector with a second implementation (floating-free decimal-string arithmetic written separately in the test) and with hand-computed constants. Vectors: long 100/95/115 (risk 5, reward 15, ratio 3, break-even 25%); with account 100,000 at 1% → risk amount 1,000, quantity 200, value 20,000, loss 1,000, gain 3,000; mirrored short 100/105/85 identical; quantity floor and zero cases; wrong-order and equal-distance rejection; limits; property: mirroring side and prices gives equal outputs; ratio monotonic in target. Browser spec only at a checkpoint (manual-first, rule 10.13).

## Out of scope / deferred

Fees, slippage, tick size, leverage, scaling in/out, multiple targets, saved trades. Recorded as extension candidates, none approved.

## Status and implementation notes (2026-11-01)

Built locally, uncommitted. Files: `assets/js/calculators/formulas/risk-reward.js` (engine), `assets/js/calculators/risk-reward/index.js` (page), `assets/css/calculators/risk-reward.css`, catalog entry in `assets/js/data/tools.js`, `src/_data/toolStyles.json`, `scripts/growth-manifest/identity-ledger.json`, `tests/inventory/url-inventory.json` (regenerated: 109 live pages), tests `risk-reward.test.mjs` (16) and `risk-reward-ui.test.mjs` (7), and the deliberately edited pins in `catalog`, `sections`, `taxonomy`, `directory`, `search`, `relationships` unit tests and the related-card lists in the `cagr`, `fd`, `ppf`, `sip` and `navigation` browser specs.

Deviations from the plan above: none in the model. Side effect (expected, factory section 7): the tool is auto-related inside Investment, so SIP, FD, CAGR, PPF and XIRR gain a Risk-Reward related card and the Investment listing gains a card.

Verified: engine against hand vectors and a 2,000-vector independent integer oracle (16/16; a floor-to-ceil mutation fails 7 tests); page markup contract and registration (7/7); full unit suite 3,648 tests, 3,644 pass, 0 fail, 4 skipped; links, assets, SEO and inventory checks pass on a fresh `build:all`.
NOT RUN: any browser test, so the DOM wiring (typing, side switch, Reset focus, Copy, announcements), the layout at 320 to 390 px and keyboard behaviour are unverified; the DOM, links and SEO baselines and visual baselines (`investment-page`, `tools-directory`, `links/summary`, `seo-baseline`, listings) are stale until a checkpoint run; the edited browser-spec lists are unrun. Owner acceptance of layout and wording on a phone: PENDING USER.
