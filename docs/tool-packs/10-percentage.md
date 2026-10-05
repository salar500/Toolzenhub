# Tool Pack 10: Percentage Calculator (the missing one of a start value, a percentage change and an end value, with the change that undoes it)

Status: built and verified (commit pending)      Base commit: 1c29174
Reserved id and slug: `percentage` (route `/calculators/percentage/`, a Coming Soon entry today)
Spec follows `docs/tool-packs/_spec-template.md`; lifecycle and gate in `docs/tool-pack-factory.md`; reuse rules in `docs/tool-pack-reuse-review.md`; the previous packs are `03-sip.md` to `09-cagr.md`.

Build with the established architecture only. **Do not** build a generator, change the shared related-calculator layout, extract table, radio or page CSS, redesign the breadcrumb, create a category
landing page or add a framework in this pack; observe repetition and record it.

## Taxonomy (spot check, no re-audit)

The catalog entry is `percentage`: category `math`, status `coming-soon`, title "Percentage Calculator", description "Calculate percentages easily." It is owned by **Calculators › Math**
(a category inside the one section, Calculators); no subcategory is defined. **Expected breadcrumb:** Home › Calculators › math › Percentage Calculator (the shared breadcrumb prints the category id,
as for SIP and CAGR). No taxonomy change. Math has **zero** live tools today, so this is its first.

## Selection record

### The real remaining catalog (15 Coming Soon calculators)

Loans: Personal Loan, Loan Eligibility, Interest. Investment: PPF. Tax: Income Tax. Business: ROI. Health: BMI, Calorie, BMR. Math: Percentage, Ratio, Age. Converter: Unit Converter, Currency, Date.
(The inventory's 21 Coming Soon entries are these 15 plus 6 article placeholders, none of which is a route.)

### Candidates, re-ranked from scratch (not by the previous runner-up)

HIGH / MEDIUM / LOW. For maintenance, rule risk, live data, trust complexity and generic risk, lower is better.

| Candidate | Pain | Repeat use | Decision value | Differentiation | Search | Commercial | Links and content | Feasibility | Maintenance | Rule risk | Live data | Trust complexity | Generic risk | Mobile | Flagship | Taxonomy fit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Percentage, as one start / change / end solver with the undoing change** | MEDIUM | **HIGH** | MEDIUM | MEDIUM (three-way solving, the undo percentage, one follow-on change) | HIGH | LOW | **HIGH** (GST, Margin, Profit, CAGR) | HIGH | LOW | NONE | NONE | LOW | **HIGH** (mitigated, see below) | HIGH | MEDIUM | **HIGH** |
| ROI (Business) | MEDIUM | MEDIUM | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | HIGH | LOW | NONE | NONE | LOW to MEDIUM | HIGH | HIGH | LOW | HIGH |
| Date (Converter) | MEDIUM | HIGH | MEDIUM | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | HIGH (a family of modes) | HIGH | MEDIUM | **LOW to MEDIUM** (may be Time Tools) |
| Unit Converter (Converter) | MEDIUM | HIGH | LOW | LOW | HIGH | LOW | LOW | MEDIUM (a conversion table to keep exact) | LOW to MEDIUM | NONE | NONE | LOW | **VERY HIGH** | HIGH | LOW | MEDIUM |
| Age (Math) | LOW to MEDIUM | MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | HIGH | HIGH | LOW | MEDIUM (overlaps Date) |
| Ratio (Math) | LOW | LOW | LOW | LOW to MEDIUM (solve a missing term, split an amount) | MEDIUM | LOW | LOW | HIGH | LOW | NONE | NONE | LOW | VERY HIGH | HIGH | LOW | MEDIUM |
| BMI / BMR / Calorie (Health) | MEDIUM | LOW to MEDIUM | LOW | LOW | HIGH | LOW | LOW | HIGH | LOW | MEDIUM | NONE | **HIGH** (read as diagnosis) | HIGH | HIGH | LOW | MEDIUM |
| Income Tax (Tax) | HIGH | HIGH | HIGH | MEDIUM | HIGH | HIGH | HIGH | MEDIUM | **VERY HIGH** | **VERY HIGH** | NONE | HIGH | LOW | MEDIUM | MEDIUM | HIGH |
| PPF (Investment) | MEDIUM | LOW to MEDIUM | MEDIUM | MEDIUM | MEDIUM | LOW | MEDIUM | MEDIUM | **HIGH** | **HIGH** | NONE | HIGH | MEDIUM | HIGH | MEDIUM | HIGH |
| Currency (Converter) | MEDIUM | MEDIUM | LOW | LOW | HIGH | MEDIUM | LOW | MEDIUM | **HIGH** | NONE | **YES** | MEDIUM | HIGH | HIGH | LOW | MEDIUM |
| Personal Loan / Loan Eligibility / Interest (Loans) | MEDIUM / MEDIUM / LOW to MEDIUM | LOW | LOW to MEDIUM | LOW | HIGH | HIGH / HIGH / LOW | LOW | HIGH / MEDIUM / HIGH | LOW / **HIGH** / LOW | LOW / **HIGH** / NONE | NONE | LOW / **HIGH** / LOW | **HIGH** (EMI) / MEDIUM / HIGH | HIGH | LOW | HIGH |

### Hard rejection

- **Income Tax, PPF:** rule-heavy; there is still no versioned ruleset, update owner, stale-rule behaviour or pinned-ruleset test system. Not ready; they stay Coming Soon.
- **Currency:** needs a live rate feed and freshness infrastructure; a manual-rate version is too weak.
- **Health (BMI, BMR, Calorie):** one formula each and a result that can be read as health-status labelling; rejected again.
- **Personal Loan, Loan Eligibility, Interest:** an EMI duplicate, a lender's underwriting decision, and a generic formula; all stay Coming Soon.
- **ROI:** the profit side is `(gain ÷ cost)`, which is **markup**, already shown by Profit and Margin; the time side is CAGR's. What remains (target ROI, maximum cost, two-case comparison) is a thin re-skin of
  those two tools. Rejected again.
- **Age:** a thin slice of Date.
- **Ratio:** `A : B` simplify/scale/split are three disconnected mini-tools with the heaviest commodity risk and no shared relationship to solve.
- **Unit Converter:** a "narrow V1" (length, mass, temperature) is the most generic tool on the web and adds nothing beyond a lookup table; the sprawl risk is real. Rejected.
- **Date:** real repeat use and no rule risk, but it is a family of unrelated modes, the competition is extreme, and it may belong to a future **Time Tools** section. Deferred until that architecture is decided.

### Why Percentage wins (honestly: the best of a weak remainder, kept narrow)

Percentage is the highest repeat-use tool left with no rule, rate or data dependency and no overlap with a live tool's job. It wins **only because it is built as one relationship, not five mini-tools**,
and it must not be shipped as the usual four-boxes page.

1. **One relationship, one form.** `end = start × (1 + change ÷ 100)`. Any two known values give the third: start and change give the end (a price after a rise or a discount), start and end give the change
   (what percent did it move?), end and change give the start (**reverse percentage**: what was it before a 25% rise?). The visitor fills any two fields and the page works out the third; no mode picker.
2. **The undoing change.** The result always states the change needed to get back: a fall of 20% needs a rise of 25% to recover; a rise of 25% is undone by a fall of 20%. Search engines answer "20% of 80"
   inline; they do not tell you why a 50% cut then a 50% rise does not return the start.
3. **One follow-on change.** An optional second change shows the net effect of two in a row (+20% then −20% is −4.00%, not 0), next to the simple sum, which is the common shortcut.
4. **The other everyday questions fall out of the same figures** and need no mode: "what is X% of Y" is the change amount (start Y, change X); "what percent is A of B" is the end as a percentage of the start
   (start B, end A). They are shown as supporting results, not separate tools.
5. **Evergreen, offline, exact:** no feed, rate or rule; exact rational arithmetic.
6. **Opens Math** with its first live tool and links naturally to GST (a percentage added or removed), Margin and Profit (markup and margin are percentages), and CAGR (a percentage change over time).

The **generic risk stays HIGH**. The mitigation is the differentiation above and an honest bar: if review finds the page is a thin wrapper around the one formula, the pack must not ship (a fall back is to
reject it and take a pack from the next candidate list).

### Runner-up

**ROI (Business).** It would deepen a two-tool category and has medium search intent, but it is markup under another name and CAGR's time dimension under another; it adds a third overlapping framing
rather than a new job. Loses on differentiation and flagship quality. **Date** is the next real alternative once the Time Tools question is settled.

## Product answers

- **Id / slug / title:** `percentage` / `percentage` / Percentage Calculator. **Section:** Calculators. **Category:** Math. **Subcategory:** none. **State today:** Coming Soon. **Breadcrumb:** Home › Calculators › math › Percentage Calculator.
- **User:** anyone checking a number that moved by a percentage: a shopper with a discount, a seller marking a price up or down, a student or analyst with two figures, someone told "it rose 25%" who wants the old value.
- **Real job:** "This tool helps a person who knows two of a starting value, a percentage change and an ending value decide or understand the third, and what change would undo it, when a price, a figure or a
  quantity has gone up or down."
- **Just before:** they saw "now ₹2,400, up 20%", a sale tag, a report line "revenue fell 12.5%", or two numbers they need to compare. **After the result:** they quote the figure, check a price or a claim, set a
  price, or open GST, Margin or Profit for the money detail.
- **Return:** discounts, price changes, reports and homework recur constantly; the form keeps the last two values while the visitor edits the third, so re-asking a variation takes one keystroke.
- **Retention without accounts:** the three-way form makes follow-ups cheap: clear one field and fill another, and the missing quantity changes with it. No login, history, saved cases, share link or notification.
- **Differentiation:** reverse solving (the start from the end), the undoing change, the two-in-a-row net effect, and the plain statement of what the base is. Not a ranking or advice.
- **Decision after the result:** whether a claimed change matches the numbers, what the original was, how big a recovery is needed, whether two changes cancel. The tool never says what is good or fair.

## Trust standard

- **Facts:** the user's own numbers; the relationship `end = start × (1 + change ÷ 100)`.
- **Assumptions (shown on the page):** every percentage is taken of the **starting value**; a second change is taken of the value after the first; values are plain numbers, in no currency or unit.
- **Calculated outputs:** the missing value, the change amount, the end as a percentage of the start, the undoing change, and (optionally) the net change after two changes with the simple sum beside it.
- **Exclusions:** tax, fees, rounding by a shop, percentage points, compounding over time (CAGR's job), averages of percentages, statistical significance.
- **Banned claims:** "good", "fair", "worth it", "you save", "you should", "average", "expected", any reading of a percentage as a benchmark, any currency or rate claim.

## Spec

### 1. Tool identity
As above. Math category, shared tool page skeleton, dynamic loader, `toolStyles.json` entry, catalog activation in place (title kept; description and aliases changed). No new page type.

### 2. User problem
A number changed by a percentage and one of the three pieces is missing. Doing it by hand mixes up the base (percent of what?), and the reverse and the undo are the usual mistakes.

### 3. Jobs to be done
1. Find the end value after a rise or fall. 2. Find the percentage change between two values. 3. Find the starting value before a known change. 4. See the change that returns the value to the start. 5. See the
net effect of a second change.

### 4. Target users
Shoppers, small sellers, students, analysts and anyone reading a news or report figure. Mobile-first, one hand, quick.

### 5. Inputs and the three-way interaction (pinned)

The model is `Start + Percentage change → End`, with any **one** of the three missing. There is **no mode picker**: which quantity is solved is decided only by which core field the visitor leaves empty.

| Input | Label | Unit | Required | Default (after Reset) | Min / max (direct input) | Precision | Helper | Mobile |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Starting value | Starting value | none (a plain number) | core field | 2,000 | 0.01 to 1,00,00,00,000 | up to 2 decimals | "The value before the change" | decimal keypad |
| Percentage change | Percentage change | % | core field | 20 | −99.99 to 10,00,000 | up to 2 decimals | "Use a minus sign for a decrease" | text input with `inputmode="decimal"`; a visible sign hint because some decimal keypads lack the minus |
| Ending value | Ending value | none | core field | blank | 0.01 to 1,00,00,00,000 | up to 2 decimals | "The value after the change" | decimal keypad |
| Second percentage change | Then another change of | % | optional | blank | −99.99 to 10,00,000 | up to 2 decimals | "Taken of the value after the first change" | as the first change |

Parsing: Indian grouping on display; both `1,50,000` and `150000` accepted; a trailing `%` is stripped; an empty or whitespace-only field is "blank", not zero. A field counts as **filled** only when it holds
a value that parses as a number; a half-typed value such as `-` or `1.` is treated as still being typed (blank) until it parses.

**Which field is solved (deterministic, from the user's entries only):**

| Core fields the user has filled | Behaviour |
| --- | --- |
| Start and Change (End blank) | Solve **Ending value**; it is the primary result. |
| Start and End (Change blank) | Solve **Percentage change**; it is the primary result. |
| Change and End (Start blank) | Solve **Starting value**; it is the primary result. |
| Exactly one | No calculation. Neutral prompt in the result area: "Fill in any two of the three to work out the third." Not an error; no field is marked invalid for being empty. |
| None | The same neutral prompt. |
| All three | **No calculation and no primary result.** A form-level instruction is shown: "Clear one field to work it out." Nothing is guessed, no mode is chosen, no field is overwritten, no competing result is shown. |

**The calculated quantity never fills an input.** The blank field stays blank; the answer appears only in the primary result card (labelled "Ending value", "Percentage change" or "Starting value").
**Clearing is the only way to change what is solved.** Example: Start 2,000, Change 20, End 2,400 (all three) shows the instruction; the visitor clears Start; Start stays blank and the primary result is
"Starting value 2,000.00". Re-typing a value into the blank field moves the page back to the all-three state. The same input state always gives the same result.

**Fewer than two (while typing):** a field with a syntactically incomplete value is not validated until the visitor leaves it (blur) or it parses; a field that parses but is out of its direct-input range
is an input error as soon as it parses. A neutral state is shown while fewer than two core fields are valid; an invalid core field counts as not filled for the purpose of solving and shows its own error.

**Input errors vs solved-range errors (pinned distinction):**
- **Input error:** the visitor directly entered something outside an allowed input range (a start below 0.01, a change below −99.99, a zero start). The field shows a linked, specific message ("Enter a value
  between 0.01 and 1,00,00,00,000"); no result is shown while an error stands.
- **Solved result out of range:** the two entered values are each valid, but the exact missing value falls outside this tool's supported range. A mathematically valid solution exists; the tool just does not
  display it. A result-area message (not a field error, nothing marked invalid) says: "The two values are fine, but the answer falls outside the range this calculator shows (0.01 to 1,00,00,00,000 for a
  value, −99.99% to 10,00,000% for a change)." The exact value is **never clamped, rounded up to the minimum or shown as a number**. The range is judged on the **exact** value (see §7), not the rounded one.

**Reset** (a real button) restores: Starting value 2,000; Percentage change 20; Ending value blank; Second change blank. The page therefore opens with a solved forward example (Ending value 2,400.00)
and never opens with all three core fields filled. Reset also collapses the optional follow-on change.

### 6. Outputs and result hierarchy
- **Primary:** the missing quantity, large, labelled by what it is: the ending value, the percentage change (to two decimals, sign shown) or the starting value.
- **Supporting:** the change amount (end − start, signed); **the change that undoes it** ("to get back, the value needs to change by −16.67%"); the ending value as a percentage of the starting value.
- **Scenario (second change):** see §7; inactive and neutral until the first relationship is solved.
- **Detail:** one worked line showing the substitution ("2,000 × (100 + 20) ÷ 100 = 2,400").
- **Trust / exclusions:** the base statement and the exclusions list.
- **Next action:** related links (GST Calculator, Margin Calculator; see §19).
No filler metrics; no money symbol on any result (the numbers are unit-less).
**Output ranges are separate from input ranges.** The undoing change is an output: it is defined for any change greater than −100%, so with the smallest allowed change (−99.99%) it is **+9,99,900.00%**,
and it is displayed in full; it is **never** rejected for exceeding the 10,00,000 direct-input cap on a change (it cannot exceed 9,99,900.00 while the change is bound by −99.99). The net effect of two changes
is also an output and may fall below −99.99% only if a value would round to zero, which the range rule then handles.

### 7. Model and arithmetic rules

**Exact arithmetic (what "exact" means in the JS):** parse Start and End to **integer hundredths** and the percentage change to **integer hundredths of a percentage point** (strings, never `parseFloat`
as the authority); do every formula with **BigInt numerator and denominator** (a small internal fraction); compare ranges on the exact fraction; and **round only at display or output boundaries, half up**,
to 2 decimals. No floating-point value is the authority for any result. The Python reference is independent (it uses `fractions.Fraction`; nothing is copied from the JS).

**Core relationship** (p = percentage change, S = start, E = end):
- end: `E = S × (100 + p) ÷ 100`
- change: `p = (E ÷ S − 1) × 100`
- start: `S = E × 100 ÷ (100 + p)`
- undoing change: `u = −100 × p ÷ (100 + p)` (defined for p > −100; the change that returns E to S)
- change amount: `E − S`; end as a percentage of the start: `E ÷ S × 100`.

**Optional second change (pinned).** It applies **after** the first relationship, to the **ending value** E, with a second percentage q (direct input −99.99 to 10,00,000):
- second result: `E2 = E × (100 + q) ÷ 100`
- net effect from the original start: `(E2 ÷ S − 1) × 100`
- plain arithmetic sum, shown only as a contrast: `p + q`, labelled "Adding the two percentages gives p + q, which is not the combined change", never as a valid combined percentage.
- Example: S = 1,00,000, p = +20 → E = 1,20,000; then q = −20 → E2 = 96,000; net −4.00%; plain sum 0.00%.
**Availability:** the second change is meaningful only once the first relationship is solved (two valid core fields, not all three, no input error). Otherwise its field stays visible but inactive
(neutral, with the helper "Fill in two of the values above first"); it is never a standalone calculation. If the first relationship is solved but E2 or the net falls outside the output range, the same
solved-range message applies. Changing which core field is blank re-bases the follow-on change on the new E.

**Rounding:** half up to 2 decimals at display only, on the exact value; never round an intermediate; no negative zero (−0.00 is shown as 0.00).

**Range rule (exact):** a solved start, end or E2 must be at least 0.01 and at most 1,00,00,00,000 **before** rounding; a solved percentage change must be at least −99.99 and at most 10,00,000 before
rounding. Otherwise the solved-range message is shown (see §5).

### 8. Assumptions (shown on the page)
Every percentage is of the starting value; a second change is of the value after the first; values are plain numbers; nothing is added for tax, fees or rounding in a shop.

### 9. Edge cases
- p = 0: end = start, undoing change 0.00%. A change of −100% or lower is a direct-input error (the value cannot fall to zero or below). p = −99.99 is valid: the undoing change is +9,99,900.00%.
- End equal to start: percentage change 0.00% (never −0.00).
- Start with end giving a change above 10,00,000% or below −99.99%, or a solved start/end outside 0.01 to 1,00,00,00,000: the **solved-range** message (not an input error).
- A zero start (or a start below 0.01) is a **direct-input error**: a percentage change from zero has no meaning and the page says so in the field's message.
- Change and End with p near −100 solve a very large start: handled by the range rule.

### 10. Validation
Linked, specific, polite messages per field (`aria-describedby`); no error while a field is empty or still being typed; the three message kinds are kept separate: **input error** (field), **solved-range**
(result area), and **all-three instruction** (form level, not an error). A valid but unusual value (a change above 1,000%) is accepted without a nag.

### 11. User journey
1. Arrive from a search or a Math link with a question. 2. Three core fields and one result area; the form opens on the Reset example (2,000 and 20, End blank, result 2,400.00). 3. Change or clear fields:
the missing quantity is solved and shown large in the result card; the blank field stays blank. 4. Supporting results and the undo line sit under it. 5. "Then another change" is collapsed and inactive until
two core values exist. 6. Assumptions and exclusions in a quiet panel. 7. Related links (GST, Margin) at the bottom. The first screen is three fields and a result.

### 12. Table decision
**NO.** One relationship has no rows; the net-effect lines fit in the result list.

### 13. Chart decision
**NO.** A bar of "before" and "after" would restate two numbers already printed, and a chart would invite reading a trend.

### 14. Print and CSV decisions
**NO** to both: a one-line answer has nothing to print or tabulate.

### 15. Retention
As above: cheap re-asking by clearing one field. No history, login, share link or notification.

### 16. Mobile behaviour
One column; decimal keypad; the minus sign reachable (a visible "−" helper in the percentage field's label text, since some decimal keypads lack it); tap targets at least 36px; the result stays visible without
scrolling past the keyboard (result region announced with `aria-live="polite"`); no horizontal scroll.

### 17. Accessibility requirements
Labelled inputs, error text linked, the result region a polite live region, results are text not colour only, visible focus, keyboard-operable expander, Reset a real button, heading structure matching the other tools.

### 18. Search keywords and aliases
Aliases: "percentage change calculator", "percentage increase calculator", "percentage decrease calculator", "reverse percentage calculator", "percent difference", "original price before increase".
Queries to check: "percentage", "percent change", "reverse percentage", "increase", "decrease". Percentage must be found as a published tool; Ratio and Age stay Coming Soon and must not appear as usable. No alias
promises a result beyond arithmetic. ("percentage difference" is a different symmetric measure and is **not** claimed.)

### 19. Related calculators and articles (pinned to the repository mechanism)
**Mechanism (verified in `data/relationships.js`):** curated links are an explicit, **one-way** `relatedTools` array on a tool's own catalog entry, always kept in the order written; the automatic
fallback only **adds** published tools from the same subcategory and then the same category, and never edits another tool's list. Percentage is the only live Math tool, so the fallback adds nothing.
- **Percentage displays exactly two related calculators, in this order: GST Calculator, Margin Calculator.** Set as `relatedTools: ["gst", "margin"]` on the `percentage` catalog entry. Reasons: GST is a
  percentage rate added to or taken out of a base (the reverse case is the "remove GST" idea); Margin is the percentage relationship between cost, price and margin. Profit is **not** added to fill space.
  Ratio and Age are **not** exposed: they stay Coming Soon.
- **Reciprocal impact: none.** The GST and Margin catalog entries and pages do not change: their curated lists stay as they are and the same-category fallback never reaches Math. No reciprocal Percentage
  link is added for symmetry. Existing tool pages, their baselines and their tests are therefore **not** consumers and are not retested for relationships.
- **Articles:** the three below, each linking the tool; the tool lists them through its `relatedArticles`.
- **Future, only as they exist:** Ratio, Age (Math), ROI (Business); each would be added by its own pack.

### 20. Article cluster and article visual strategy
Distinct, no forced count, no advice. **Concept first, format second.** The recent visuals to stay away from: FD (timeline spans, compounding tick rows), GST (a proportion bar with brackets and a grouping
flow), CAGR (compounded step routes and equal-step stairs), and any graph, bars, curves, arcs, steps, timelines or dashboards.

**Article 1: Why +20% then −20% does not get you back (percentage of what?)** (explanation of the base)
- *Intent:* "increase then decrease same percentage", "why does 20% off a 20% rise not return the price". *Unique value:* 100 up 20% is 120; 20% of 120 is 24, so it ends at 96, a net −4.00%; the undoing of a
  +20% is −16.67%. The lesson is the base. *Calculator relationship:* the undoing change and the second-change net. *Not a duplicate:* it explains the base, not how to reverse a percentage.
- **IMAGE: YES.** *Visual purpose:* make the base visible: the same 20% is "of" a different number each time. *Visual type:* **formula anatomy cards**: two index-card equations side by side, "20% of 100 = 20"
  and "20% of 120 = 24", with the "of what" slot ringed and an arrow from each ring to its base number; no axis, no scale. *Why this type:* the idea is about which number the percentage refers to, which labelled
  anatomy shows and a size comparison would not. *Why not graph-like:* two equation cards with labelled slots, no proportions, no sequence. *Recent visuals compared against:* FD (timelines), GST (proportion bar
  and grouping flow), CAGR (step routes and stairs): none uses text-and-equation cards. *Anti-repetition decision:* kept; if it reads as a flow, reduce to a plain two-line worked example and use no image.
  *Data source:* 100, 120, 20%, 20 and 24 from the model. *Alt-text intent:* two equations showing that 20% of 100 is 20 but 20% of 120 is 24, because the percentage is of a different starting number.

**Article 2: How to find the original price before a percentage increase or decrease** (a worked method)
- *Intent:* "original price before 25% increase", "reverse percentage". *Unique value:* divide by 1 + p, not subtract p; 2,400 after a 20% rise was 2,000, not 1,920; the check by forward calculation.
  *Calculator relationship:* the end-and-change solving case. *Not a duplicate:* it is the method for working backwards; it is not about the base lesson in article 1 and not about GST invoices (the GST article
  already owns tax add/remove).
- **IMAGE: NO.** *Visual purpose:* none needed. The method is three short lines of arithmetic and a worked example in the text; a picture would only restate it, and the natural pictures (before and after
  bars, a backwards arrow flow) would repeat recent visuals. *Anti-repetition decision:* no image beats a repetitive one. *Alt-text intent:* not applicable.

**Article 3: Percent versus percentage points (what "up 2 points" means)** (a distinction)
- *Intent:* "percentage point vs percent". *Unique value:* a rate moving from 5% to 7% is up 2 percentage points and up 40%; two different bases again. *Calculator relationship:* the percentage-change case on
  5 and 7. *Not a duplicate:* about the two readings of one move, not about a price. It does not name any real rate or index.
- **IMAGE: NO.** *Visual purpose:* none needed; a two-row small text table (5% to 7%, "points: +2", "percent: +40%") sits in the article body, not an image. *Anti-repetition decision:* no image.

**Rejected:** "percentage tricks", "calculate GST percentage" (GST owns it), "average of percentages", "good discount", "what percent of salary to save" (advice).

### 21. Site-wide UX consistency
Same page skeleton, panels, buttons and Reset as SIP, FD, GST, Margin and CAGR; the answer first and largest; the optional follow-on change visually quieter; no orphan card; no new colours, spacing scales or
button styles; no chart; no decorative imagery in the tool.

### 22. Independent verification and tests (impact-based)
**Independent reference:** `tests/fixtures/percentage-golden.py` using Python `fractions.Fraction`, not the engine's expressions. It (a) computes each case with exact `Fraction` arithmetic (the JS uses BigInt fractions on integer hundredths; see section 7); (b) **brute-force searches**
the hundredths grid for small ranges to confirm every forward and reverse case (the solved start, rounded, reproduces the end within half a hundredth); (c) asserts the invariants: forward then reverse
returns the start; applying the undoing change returns the start exactly; a change then its undo is net zero in the factor; antisymmetry of the percent change of (a,b) and the undoing change of (b,a);
(d) checks half-rounding boundaries and no negative zero; (e) prints the article figures. The JSON is embedded as `GOLDEN` in `tests/unit/percentage-golden.test.mjs`; nothing is copied from the JS.
**During implementation, test what changed and its real consumers only:**
- formula change: `tests/unit/percentage-golden.test.mjs` only;
- tool UI: `tests/browser/percentage.spec.js` on `subpath-desktop`, then `subpath-mobile` only if layout can change;
- article figures: `tests/unit/percentage-articles.test.mjs`; the one article image: only the focused asset check (exists, PNG and WebP, small, alt text describes the concept);
- publication: focused catalog, search, taxonomy (pin `percentage` as Section Calculators, Category Math), relationships, sections, tool-catalog and articles unit tests; the real consumers are the Calculators
  listing, the Math category section on `categories.html` (its first live tool), the Articles listing and sidebar, search; the Home page is **not** affected (Percentage is not in Featured Tools: check, do not retest);
- a shared helper or CSS change (none planned): identify its actual consumers first;
- use `tests/helpers/coming-soon.mjs`, never name a tool (after publication `getComingSoonTool({ category: "math" })` returns Ratio or Age).
**Required taxonomy assertions:** `percentage` is Section Calculators, Category Math; the derived hierarchy; the built breadcrumb `Home › Calculators › math › Percentage Calculator`; Ratio and Age remain
Coming Soon in Math.
**Final Tool Pack gate, once:** `npm run build:all`, `inventory:check`, static, full unit, the three browser projects with `--workers=1` spec by spec (never reported as monolithic; preserve completed coverage
after any memory kill and continue only the missing specs), and the three visual projects. Before it: stop only clearly stale project processes; clean `test-results`, `tests/.tmp` and `tests/fixtures/__pycache__`.
- **Unit:** the goldens; the invariants; input validation versus solved-range; which quantity is solved for each filled pair; three filled and none/one filled (no result); the second change and its inactive state; BigInt results equal the reference exactly.
- **Browser:** each of the three solves; the undo line; the second change; zero change; a decrease; the boundaries; all-three-filled message; validation with linked errors; reset; keyboard; mobile; that the solved quantity never fills the blank input; clearing one of three solves it; the Reset example; the solved-range message; the undo +9,99,900.00%; the related cards are exactly GST then Margin; search by name and aliases; no "good", "fair", "save" or ranking wording.
- **Accessibility entry; visual baselines** for the new page and every page that changes.

### 23. Planning goldens (exact figures from a lightweight Fraction calculation; the implementation re-derives them)

| # | Case | Given | Result (2 decimals, half up) |
| --- | --- | --- | --- |
| 1 | End from start + change | 2,000 and +20% | end 2,400.00; change amount 400.00; undo −16.67%; end as % of start 120.00% |
| 2 | Decrease | 2,000 and −20% | end 1,600.00; amount −400.00; undo +25.00%; 80.00% |
| 3 | Zero change | 2,000 and 0% | end 2,000.00; amount 0.00; undo 0.00%; 100.00% |
| 4 | Change from start + end | 2,000 to 2,400 | +20.00%; amount 400.00; undo −16.67% |
| 5 | Fall from start + end | 2,400 to 2,000 | −16.67%; amount −400.00; undo +20.00%; 83.33% |
| 6 | Equal | 1,250 to 1,250 | 0.00% (no negative zero) |
| 7 | Reverse | end 2,400, +20% | start 2,000.00; amount 400.00 |
| 8 | Reverse of a fall | end 1,600, −20% | start 2,000.00; amount −400.00 |
| 9 | Reverse, 18% | end 118, +18% | start 100.00 |
| 10 | Fractional change | 80 and −12.5% | end 70.00; amount −10.00; undo +14.29% |
| 11 | Extreme undo | start 100 and −99.99% | end 0.01 (exact); change amount −99.99; undo **+9,99,900.00%** (an output, shown in full) |
| 12 | Solved range: reverse below the minimum | end 0.01, change +10,00,000% (Start blank) | exact start `0.01 × 100 ÷ (100 + 1,000,000) = 1/1,000,100` ≈ 0.000000999900009999 (9.999000099990001 × 10⁻⁷), which is below 0.01; both entered values are valid, so the solved-range message is shown, no number, no clamp and no error on a field |
| 13 | Large valid in range | end 9,99,99,999.99 and +10,000% | start 9,90,099.01; amount 9,90,09,900.98 |
| 14 | Net of two changes | 1,00,000, +20% then −20% | 96,000.00; net −4.00%; plain sum 0.00% |
| 15 | Net of a fall then a rise | 1,00,000, −20% then +25% | 1,00,000.00; net 0.00%; plain sum 5.00% |
| 16 | Two rises | 5,000, +10% then +10% | 6,050.00; net 21.00%; plain sum 20.00% |
| 17 | Input errors | change −100% or a zero start | the field's input error; no result |
| 18 | All three filled | 2,000, 20, 2,400 | form-level "Clear one field to work it out."; no result |
| 19 | Clear one | the same, Start cleared | primary result Starting value 2,000.00; the Start field stays blank |
| 20 | Fewer than two | only a change of 20 | neutral prompt, no error |

(Cases 11 and 12 pin the output and solved-range boundaries; 18 to 20 pin the interaction. The brute-force check covers 1 to 200 in hundredths.)

### 24. SEO plan
Title "Percentage Calculator: find the change, the start or the end value"; one description sentence; the answer visible in static text for the worked example; the three articles linked from the tool page and
back; no schema claims beyond what the existing tool pages use; the Ratio and Age entries are not exposed.

### 25. Performance constraints
Vanilla JS, dynamic import, browser-local exact arithmetic with small integers, no dependency; the tool code loads only on its own page; the one image optimized (simple diagram, small PNG and WebP). No API, no
feed, no storage beyond an optional URL.

### 26. Quality gate
Tick against the factory gate. NOT NEEDED with reasons: table (12), chart (13), CSV and Print (14), a percent-difference mode, a unit or currency, saved history.

### 27. Deferred items
Percentage difference (a symmetric measure, a different tool), percentage points as a tool, average of percentages, a discount-and-tax combiner, Ratio-style scaling, units, a currency symbol, saved cases,
named rates or indexes (never in scope).

## Category landing-page decision (Math)

Math gains its **first** live tool (depth: Math 1). It stays a section on `categories.html`; a landing page is not plausible with one tool. The depth picture is Loans 5, Investment 3, Business 2, Tax 1,
Math 1, Health 0, Converter 0. Revisit Investment, Business, Tax and Math together as **one separate category-foundation phase**; nothing in this pack creates a page.

## Future section and taxonomy concern (recorded only)

Percentage fits Calculators › Math with no tension. The tension is Date (and Age): they may belong to a future **Time Tools** section, and Currency and Unit Converter sit awkwardly in Converter if that
grows. A global "View All Tools" directory is future work once more than one major section exists. The hierarchy stays Section → Category → optional Subcategory → Tool and is not changed here.

## Known shared-quality issues (deferred, unrelated to this pack)

`home-loan.css` contains the invalid property `home-loan-bottom`; the Articles listing's pagination wraps "Next" on a phone; the years-and-months, radio-segment, table and page-skeleton CSS is repeated
across tools; the shared breadcrumb prints the lowercase category id; the Loans related-card grid wraps three plus one; the footer heading reads "Popular Calculators". None is touched by this pack.

## Publication effects to review (Coming Soon → live)
- **Listings and counts:** the Calculators listing (12 built, 14 Coming Soon); the Math section on `categories.html` gains its first live tool (Ratio and Age remain Coming Soon cards); the Articles listing
  (up to three more articles, pagination read from the catalog) and sidebar; search and ranking for "percentage", "percent", "reverse", "increase"; inventory (the tool and up to three articles: 50 → at most 54
  live pages; Coming Soon calculators 15 → 14, article placeholders unchanged at 6, entries 21 → 20); DOM, link and SEO baselines.
- **Not affected:** Home (not in Featured Tools), Loans, Investment, Business and Tax pages, and every existing tool page, **including GST and Margin** (the Percentage relationships are one-way and no existing catalog entry changes).

## Implementation sequence (when approved)
1. `tests/fixtures/percentage-golden.py`, then `formulas/percentage.js` and its unit tests; focused tests only.
2. The tool module and CSS; `tests/browser/percentage.spec.js`; run it on one project, then mobile if layout can change.
3. Catalog activation in place (title kept, description and aliases changed), `toolStyles.json`; focused catalog, search, taxonomy (with the pinned assertions), sections and tool-catalog tests.
4. The articles, figure tests and the one diagram image (checked for concept, size and alt text); focused article tests.
5. Pinned expectations, baselines and visual registration for the pages that change.
6. Final Tool Pack gate once (section 22), then the commit.

## Implementation notes (Tool Pack 10 built; commit pending)

**Built as specified.** `formulas/percentage.js` (pure; BigInt fractions on integer hundredths; half-up display rounding; solved-range checks on the exact value), `percentage/index.js`, `percentage.css`,
`toolStyles.json`, the catalog entry activated in place (title kept, description and aliases set, `relatedTools: ["gst", "margin"]`, one-way), three articles. The independent reference is
`tests/fixtures/percentage-golden.py` (Fraction, nearest-hundredth search, invariants); its JSON is embedded in `tests/unit/percentage-golden.test.mjs` (53 tests); article figures are pinned by
`tests/unit/percentage-articles.test.mjs`; the browser spec is `tests/browser/percentage.spec.js` (25 tests, desktop and mobile).

**Deliberate refinements of the spec text:**
- The Percentage change and Second change fields use `inputmode="text"`, not `"decimal"`: a decimal keypad on some phones has no minus sign, which would make a decrease impossible to type. The Start and End fields use `"decimal"`.
- A half-typed value is judged when the visitor leaves the field (a polite "Enter a complete number" on that field); it is never an error while typing.
- **No article has an image, and the three have no card image either.** The Articles listing, Home latest list, popular list and the related-article cards were written to assume an image. They now draw no image block when an
  article has none (`cardImage: null`; the legacy registry returns `image: null` and an empty alt), and a listing card without an image uses one column (`article-card--no-image`). Existing cards are unchanged.
  Consumers of that shared change: the Articles listing (and its pagination, now eight pages), the related-article cards, the popular list and the Home latest list (none of which shows a Percentage article today).
- **The Article 1 formula-anatomy image was omitted.** Two equation cards would be text in a picture and add nothing to the body's worked example; no image is the approved outcome (see section 20).

**A defect in the committed navigation cleanup was found and fixed here.** The "Tools by category" sections were inserted between the category grid and the search panel, which pushed the search panel down by about
1,900 px after the script drew them (layout shift 0.20 against a limit of 0.10, caught by `build.spec.js` "categories.html: the footer is not a layout-shift source"). The sections now follow the search panel in
`categories.njk`; the shift is back under the limit and the category anchors work unchanged.

**Math category:** Percentage is its first live tool, Ratio and Age stay Coming Soon cards. The Calculators listing shows 12 built and 14 Coming Soon; the inventory is 54 live pages, 14 Coming Soon calculators and
6 article placeholders (20 Coming Soon entries); 54 sitemap URLs. GST and Margin (and every other existing tool page) are unchanged.

**Size:** page module 32,545 B (7,323 B gzip), engine 11,895 B (3,933 B gzip), CSS 3,603 B (1,110 B gzip); no image.

**Observed repetition, not fixed here:** the tool page skeleton, field and note CSS remain repeated across tools; the shared breadcrumb prints the lowercase category id ("math"); the footer heading still reads "Popular Calculators".
