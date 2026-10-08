# Tool Pack 21: SWP Calculator (withdrawal and corpus planning)

Status: built and verified in Chrome (focused, impact-based checks); committed as `ba3f1ae` and pushed; GitHub Pages preview verified; Android real-device verification PASS; Safari/WebKit UNVERIFIED      Base commit: b723140
Reserved id and slug: `swp` (route `/calculators/swp/`). It is **not** an existing Coming Soon entry; it would be a new catalog entry.
Spec follows `docs/tool-packs/_spec-template.md`; the lifecycle and gate are in `docs/tool-pack-factory.md`; the trust wording standard is "Trust standard for projections" in `docs/tool-packs/03-sip.md` and rule 3.7 of `docs/product-decision-rules.md`.

## Selection record

Chosen by the user on the platform-wide opportunity review, which ranked Photos to PDF first and this tool second. The user deliberately overrode the ranking: Photos to PDF combines several risks at once (multi-image memory pressure, hand-written PDF correctness, target-size search, mobile download behaviour, PDF viewer differences, Safari uncertainty) and the platform should not keep following the Image Tools infrastructure only because it exists. This tool has deterministic maths, no API, no backend, low browser risk and a strong phone fit. Photos to PDF stays a future candidate. The decision is recorded in rule 1.7 (category balance, and following the last category, never decides): this tool is chosen on its merits, not because Investment has fewer tools than anything else.

**AI-era test (rule 1.4).** An assistant can explain withdrawal planning, but it is slow and unreliable at an exact month-by-month drawdown. This tool gives the same exact figures every time, shows the year-by-year audit trail that lets someone check the answer, and keeps the visitor's amounts in the browser.

**What it does that no existing tool does.** SIP and FD grow money. Nothing on the site answers the opposite decision: *given a corpus, how long can I draw from it, how much, and what do I need?* It is a different job, not a variant of SIP (rule 1.6).

**Honest limits of the case.** Many SWP calculators exist; most are single-answer "final value" widgets attached to fund houses. The differentiation is the three questions in one consistent model, the lower and higher return scenarios, and an audit table, not novelty of the maths. It is also, deliberately, a modest tool: no tax, no fund data, no advice.

## Trust standard (summary; the wording rules are in the SIP spec and rule 3.7)

Name three things apart, always: what the visitor **takes out** (the withdrawal), the **assumed** annual return (an input, never an expectation), and the **estimated** result. Use: assumed, estimated, modelled, based on your assumptions, projection, scenario. Never use: safe, safe withdrawal rate, sustainable, guaranteed, guaranteed income, recommended return, ideal, best, "you will", or any ranking. Defaults are examples, and the page says so. Scenarios are "if returns are lower / as assumed / higher", never worst or best case. The page states that the model uses one constant return for every year and that real returns vary: when poor years come early, a corpus can run out sooner than a constant-return projection shows (stated as a limitation, not modelled).

## 1. Tool identity

| Item | Decision |
| --- | --- |
| Id / slug | `swp` |
| Title | **SWP Calculator** (the name Indian investors search for; the description spells it out) |
| Section / category | Calculators, **Investment** (no subcategory) |
| URL | `/calculators/swp/` (same convention as every calculator) |
| `toolType` | `calculator` |
| Description | "Estimate how long a corpus could last under regular withdrawals, how much you could withdraw, or what corpus a withdrawal plan needs, for a return you assume." |
| Capabilities | `reset`, `compare` (the three return scenarios), `table`, `realtime`, `multipleInputs`, `validation`, `explanation`, `examples`, `localProcessing`. **Not** `chart`, `print`, `presets`. |
| Position | After `cagr` in the catalog (the end of the Investment block); the Investment list becomes sip, ppf, fd, cagr, swp. |

**Is "SWP Calculator" understandable enough?** For the audience that already invests in funds, yes: it is the common name. For others it is opaque, so the page description, the H1 intro and the SEO text spell out "systematic withdrawal plan" in the first sentence and describe the job in plain words ("how long will my corpus last"). The page does not claim to model a mutual fund's SWP (no units, NAV, exit load or tax): it models a corpus, a constant assumed return and regular withdrawals, and says so.

**Aliases (true names only):** `systematic withdrawal plan`, `retirement withdrawal`, `retirement drawdown`, `withdrawal plan`.
**Considered and left out:**
- `withdrawal calculator` is too broad: it also describes ATM, PF or EPF withdrawals, which this tool does not do, and it would pollute unrelated results. Revisit only if the catalog ever has no other withdrawal tool and search evidence supports it.
- `retirement calculator` implies pension, age, inflation and corpus-at-retirement planning that V1 does not model.
- `pension`, `annuity`, `mutual fund`, `swp mutual fund`: V1 models none of these.

## 2. User problem

Someone with a lump sum (a retirement corpus, a maturity amount, an inheritance) who will take regular money out of it asks three connected questions that a one-number calculator answers badly: *how long will it last, how much can I take, what do I need?* They usually find a "final value" widget that gives one number for one return, hides how sensitive the answer is to the return they assumed, and ignores that they will probably want to raise their withdrawal over the years.

## 3. Jobs to be done

- A: "I have this corpus and want this much every month. How long is it estimated to last?"
- B: "I have this corpus and want it to last this many years. How much could I withdraw?"
- C: "I want this much every month for this many years. What corpus does that need?"
- All: "What changes if returns are lower or higher than I assumed? What if my withdrawal rises every year?"

## 4. Target users

People planning regular withdrawals from a lump sum: retirees and near-retirees, and anyone sizing a corpus for income. **Not** for: choosing a fund, forecasting returns, tax planning, pension or annuity comparison, or a plan that must be followed ("this is a scenario, not a plan").

## 4a. Which modes belong in V1

**Decision: all three modes, one engine, one result layout.**

Reasoning, not enthusiasm:
- B and C are the same relation read two ways. With the withdrawal path fixed in shape (a constant first amount raised by a fixed percentage each year), the corpus a plan needs is linear in the first withdrawal: `corpus = first withdrawal x F`, where F is a factor that depends only on the return, frequency, duration and yearly increase. B is `first withdrawal = corpus / F`; C is `corpus = first withdrawal x F`. One function, two lines of glue, and the two modes **verify each other** (feed B's answer into C and the corpus comes back).
- A is different: it needs a simulation because the corpus may run out partway or never, and it is the question most people actually type first.
- Dropping any one leaves an obvious question unanswered: A without B gives "no" without telling you what would work; B without C cannot size a corpus. Dropping C would remove the one mode that connects to the SIP calculator's target ("how much do I need to build?").
- The cost is UI and tests, not maths: a three-way choice and field visibility. That cost is controlled by one shared result composition and by keeping every entered value when the mode changes.

**Fallback if review finds the form too heavy on a phone:** ship A and B, and defer C (it is a one-line addition later). Decide at design review, not by default.

**Deliberately not in V1 as a fourth mode:** "corpus left at the end" (a target residual balance). It is also linear (`first withdrawal = (corpus x g - residual) / F`) and is the natural next addition, but it adds a field to two modes and a wording burden ("leave something behind"). Deferred (section 27).

## 5. Inputs

All amounts are rupees. All values are kept when the mode changes; fields a mode does not use are hidden (the `hidden` attribute, so they leave the tab order and the accessibility tree).

| Field | Modes | Unit | Default | Limits | Notes |
| --- | --- | --- | --- | --- | --- |
| What do you want to find out? | all | radio: A, B, C | A | | native radios in a fieldset |
| Starting corpus | A, B | Rs | 1,00,00,000 | 10,000 to 100,00,00,000 | |
| Withdrawal | A, C | Rs per withdrawal | 80,000 | 100 to 10,00,00,000 | the amount **each time**, in the first year |
| How often | all | select | Monthly | Monthly, Quarterly, Yearly | the amount above is per withdrawal |
| How long | B, C | years | 25 | whole years 1 to 50 | |
| Assumed annual return | all | % a year | 8 | 0 to 30 (decimals allowed) | "an assumption you control, not a forecast; 8% is only an example" |
| Yearly increase in withdrawal (optional) | all | % | blank (= 0) | 0 to 20 (decimals allowed) | "a number you choose, for example to allow for rising costs; it is not a forecast of inflation" |

**Left out and why:** inflation as its own concept (the increase is a user-chosen number, and a field called inflation would imply a forecast), start date, calendar dates, tax rate, fees, exit load, a residual-balance target, half-yearly frequency (monthly, quarterly and yearly cover the real SWP choices), months in the duration (whole years are enough for a decades-long plan and halve the fields), a lump-sum top-up, changing the withdrawal mid-plan.

**Default values** are examples (the page says so). 80,000 a month on Rs 1 crore at 8% is chosen because it runs out inside the horizon, so the first thing a visitor sees demonstrates the real question; a gentler default (Rs 50,000) would never run out and would teach nothing. This is not a recommendation of a withdrawal level.

## 6. Outputs and result hierarchy

First, the **answer to the selected question**, in one sentence with the figure large.
Second, the supporting figures (at most three).
Third, the **return scenarios**, so a single figure is never read alone.
Fourth, the **year-by-year table**.
Last, how to use, assumptions, how it is calculated, an example, and the FAQ (as the other calculators).

| Mode | Primary answer | Supporting figures (only these) |
| --- | --- | --- |
| A | How long the corpus is estimated to last (years and months, and the number of full withdrawals), or that it is not used up within the 50 years modelled, with the estimated balance then | Total withdrawn; estimated growth; balance left at the end |
| B | The estimated first withdrawal (per withdrawal and, for monthly or quarterly, the first-year total) that would use up the corpus over the chosen years | Total withdrawn; estimated growth; the withdrawal in the final year (only when a yearly increase is entered) |
| C | The estimated starting corpus the plan needs | Total withdrawn; estimated growth; the withdrawal in the final year (only when a yearly increase is entered) |

**Explicitly not shown:** a withdrawal *rate* (first-year withdrawals divided by corpus), "safe", "sustainable" or "ideal" labels, a success probability, a comparison with any benchmark, inflation-adjusted values, tax. A withdrawal rate invites the "4% rule" reading, which is a claim about real markets this model does not make.

**Mode A states (all are results, not errors):**
1. *Used up inside the horizon:* "Based on these assumptions, your corpus is estimated to cover 250 monthly withdrawals in full (20 years 10 months). The next withdrawal would be only partly covered: about Rs 20,680."
2. *Not used up in 50 years:* "Based on these assumptions, the corpus is not used up within the 50 years modelled. The estimated balance after 50 years is Rs X."
3. *Used up exactly at the horizon (only possible by exact arithmetic):* shown as state 1 with "nothing left" and no partial withdrawal.
4. *The first withdrawal exceeds the corpus:* "The corpus is smaller than the first withdrawal, so it could cover only part of it: Rs X of Rs Y." The duration is "0 months".

**Modes B and C** solve for a corpus that reaches **zero at the end of the chosen years**. The page says so in words ("by design, this uses up the corpus at the end of the period; it does not leave anything behind"), because that is a consequence of the question, not a hidden fact.

**Unfavourable results** (short duration, partial first withdrawal) use the same layout and neutral words, never "danger" or "unsafe".

## 7. Mathematical model (implementation-ready)

### 7.1 Variables

| Symbol | Meaning |
| --- | --- |
| C | starting corpus (Rs) |
| W | withdrawal in the **first year**, per withdrawal (Rs) |
| m | withdrawals per year: 12 (monthly), 4 (quarterly), 1 (yearly) |
| r | assumed annual return as a fraction (8% -> 0.08), 0 <= r <= 0.30 |
| s | yearly increase as a fraction, 0 <= s <= 0.20 |
| Y | duration in whole years (modes B and C) |
| N | number of withdrawals: N = Y x m in B and C; the horizon Nmax = 50 x m in A |
| i | return per period (below) |
| p | withdrawal number, 1-based; year(p) = floor((p - 1) / m) + 1 |
| a_p | the increase factor of withdrawal p = (1 + s)^(year(p) - 1) |
| W_p | the amount due at withdrawal p = W x a_p |
| B_(p-1) | the balance just before withdrawal p (B_0 = C) |
| TOL | the funding tolerance, Rs 0.005 (half a paisa) |

### 7.2 Return conversion (decided)

**Effective-annual conversion:** `i = (1 + r)^(1/m) - 1`, with `i = 0` exactly when r = 0.

Why this and not `r / m` (the nominal convention the SIP tool uses):
- It makes "8% a year" mean what a fund return normally means: the corpus grows 8% over a year with no withdrawals, **whatever the withdrawal frequency**. With `r / m`, switching from yearly to monthly withdrawals would quietly raise the effective return (8% nominal monthly is about 8.3% effective), so changing a payout schedule would change the answer for a reason unrelated to the schedule.
- It is the same meaning as the CAGR calculator's "yearly growth rate".
- It is slightly more conservative than nominal division for the same stated rate.

**This deliberately differs from the SIP calculator** (`r / 12`). The SIP spec chose the nominal convention to match other SIP calculators, and the SIP tool is not changed (rule 9.3). The SWP page states its convention in the assumptions and notes that calculators using `r / m`, and the SIP tool's own convention, give slightly different figures for the same percentage. This is a per-tool decision recorded here, not a platform rule.

### 7.3 Timing (decided)

**Each withdrawal is taken at the START of its period, before that period's growth.** For period p: `pay = W_p` (or the whole balance if it cannot cover W_p, see 7.6); `after = B_(p-1) - pay`; the remaining `after` grows for the period: `B_p = after x (1 + i)`; `growth_p = after x i`.

Why start of period: a systematic withdrawal's first payout normally happens at the start, it matches the SIP tool's start-of-period convention (money moves first, then the period's growth), and it is the more cautious reading (the amount withdrawn earns nothing that period). The page states it. Calculators that withdraw at the end of the period show slightly longer durations.

### 7.4 Yearly increase (decided)

The withdrawal is raised **once at the start of each year of the plan**: every withdrawal in year 1 is W, in year 2 it is `W x (1 + s)`, in year k it is `W x (1 + s)^(k - 1)`. The factor changes only when the year number changes (not every period), exactly like the SIP tool's step-up. Compute `a_p` by multiplying by `(1 + s)` at each year boundary, not with `pow` per period. The page calls this "a yearly increase you choose" and never inflation.

### 7.5 Modes B and C: one factor

For a fixed r, m, N, s, the corpus that is exactly used up by N withdrawals is the present value of the withdrawals, discounted at the period return, with the first at time zero (start of period):

`F = sum for p = 1..N of  a_p x v^(p-1)`,  with `v = 1 / (1 + i)`.

Compute it **backwards** for stability: `f = 0; for p = N down to 1: f = a_p + v x f;  F = f`.

- **Mode C:** `corpus = W x F`.
- **Mode B:** `W = C / F`.

Every balance before the end is positive (running the recursion backwards adds a positive withdrawal at each step), so the corpus never runs out early under these solutions. The table is produced by a **forward simulation** (7.6) with the solved value, and its final balance is 0 within TOL; display 0.

A **closed form for whole years** exists and is used only as an independent test oracle, not in the code:
`F = A x S`, with `A = sum for k = 0..m-1 of v^k` and `S = sum for y = 0..Y-1 of q^y`, `q = (1 + s) / (1 + r)`.

### 7.6 Mode A: iterative simulation

```
B = C; full = 0; withdrawn = 0; growth = 0; partial = 0
for p = 1 .. Nmax:
    W_p = W x a_p
    if B < W_p - TOL:                      // cannot fund this withdrawal in full
        partial = (B > TOL) ? B : 0        // the last, partly funded withdrawal
        withdrawn += partial; B = 0; used_up = true; break
    after = B - W_p                        // fully funded
    if after < TOL: after = 0              // exact exhaustion: clear floating residue
    g = after x i; B = after + g
    withdrawn += W_p; growth += g; full += 1
```
Outputs: `full` (the number of full withdrawals), `partial`, `withdrawn`, `growth`, `endingBalance = B`, `usedUp`.

**Duration** shown to the visitor = `full x (12 / m)` months, formatted by the existing `formatDuration` (e.g. 250 monthly -> "20 years 10 months"; 107 quarterly -> 321 months -> "26 years 9 months"; 18 yearly -> "18 years"). The partial withdrawal is described separately and is **not** counted as time.

**Termination:** the loop ends when a withdrawal cannot be fully funded, or after Nmax = 50 x m periods. If it ends at Nmax with `B > TOL` the corpus is "not used up within the 50 years modelled". If `B <= TOL` at Nmax, it is used up exactly at the horizon (state 3).

**Cross-check (test only):** `full` equals the largest N for which `W x F(N) <= C + TOL`. Both are derived from the same recursion read forwards and backwards, so an error in either shows as a mismatch.

### 7.7 Zero and special returns

- **r = 0:** `i = 0`, `v = 1`, `F = sum a_p`, balances only fall by withdrawals. With s = 0, `full = floor(C / W)` (with TOL) and `F = N`; this is exact integer arithmetic in tests.
- **Negative returns: not supported in V1.** A constant negative return for decades is not a plausible scenario and invites reading it as a stress test, which this constant-return model is not (a stress test would need a sequence of returns). Validation says "between 0% and 30%". Revisit only with a stress or sequence feature.
- **Returns above the withdrawal pace** (the corpus grows): a legitimate result (state 2), shown plainly with the estimated balance after 50 years. Nothing is said about whether that is realistic.

### 7.8 Scenarios

For each mode, the same calculation at the assumed return minus 2 and plus 2 percentage points, beside the assumed return: lower clipped at 0%, higher clipped at 30%, a scenario equal to the assumption is not repeated. This is the SIP tool's behaviour (`scenarioRates`); SWP **owns its own 8-line copy**: importing it would load `formulas/sip.js` and `formulas/prepayment.js` (about 1,100 lines) into a tool that needs eight. Shown value per mode: A the duration (or "more than 50 years"), B the first withdrawal, C the corpus.

### 7.9 Precision and rounding (rule 8.3)

- Doubles are sufficient: at most 600 periods, values to Rs 100 crore (and Mode C results up to about Rs 6,000 crore) are far inside double precision; accumulated error is about 1e-6 rupees, well below TOL.
- **Nothing is rounded in the model.** Withdrawals are not rounded to whole rupees or paise, because a real payout rounds in ways the model cannot know (the page says so).
- Display: rupees with the existing `formatINR` (en-IN, ₹, 0 decimals); durations in whole periods through `formatDuration`; percentages as the visitor typed them (trailing zeros trimmed, as the SIP page does).
- Rounding consequences, stated in the spec so they are not "bugs": the displayed rows are rounded independently, so a row may appear to differ by Rs 1 from the arithmetic of its displayed neighbours; a Mode B answer entered **back** into Mode A as a rounded number can change the result by a whole withdrawal (see golden case R: Rs 74,859 covers all 300, Rs 74,860 covers 299 and a partial one). The page does not hide this; its FAQ explains why a sum near the limit is sensitive.
- Exhaustion tolerance TOL = Rs 0.005, used only to decide "funded or not" and to clear residue; it never changes a displayed rupee amount.

### 7.10 Limits

Maximum modelled duration is **50 years** (600 monthly periods): long enough for any realistic retirement or income plan from a lump sum, small enough that the table and the loop are trivial, and a stated bound instead of "unlimited". Maximum Mode A horizon is the same 50 years. Beyond it the answer is "not used up within the 50 years modelled", never "forever".

## 8. Assumptions shown on the page (next to the result and in the assumptions section)

- The return is an assumption you enter, applied as the same rate every year. Real returns vary, can be lower than assumed and can be negative; poor years early in a plan can use a corpus up sooner than a constant return suggests. This model does not include that risk.
- Each withdrawal is taken at the start of its period, before that period's growth.
- The yearly increase is a number you choose, applied once a year; it is not a forecast of inflation.
- The annual return is converted to a return per period so that it grows the corpus by exactly that percentage over a year; other calculators and the SIP tool on this site can use a different convention and give slightly different figures.
- Not included: taxes (including tax on gains and any tax deducted at source), fund charges, exit loads, fees, inflation, and any fund's actual NAV or units.
- Amounts are not rounded in the model; a real withdrawal will round.
- It is a projection for understanding: not a forecast, not a guarantee, not advice. A link to the site disclaimer, as on the other Investment tools. **Nothing the visitor enters leaves the browser.**
- The defaults are examples, not recommendations.

## 9. Edge cases and expected behaviour

| Case | Behaviour |
| --- | --- |
| r = 0 | exact integer behaviour (G2); scenarios are 0% and 2% only |
| s blank or 0 | identical to a flat withdrawal |
| Withdrawal larger than the corpus (A) | state 4: duration 0 months, partial = the whole corpus |
| Withdrawal equals the corpus (A, r any) | one full withdrawal, nothing left: `full = 1`, ending 0 |
| Corpus used up exactly (A) | `full` includes the last withdrawal; no partial; ending 0 |
| Used up partway through a year (A) | duration in months from full withdrawals; the final table row is labelled as the year the corpus ran out |
| Very small withdrawal against a large corpus (A) | not used up; the estimated balance after 50 years |
| Return at the 30% limit | accepted; the +2 scenario clipped (not shown) |
| Duration 1 year and 50 years (B, C) | accepted; boundaries tested |
| Mode C output very large | shown with the existing formatter; the figure wraps inside its card (no overflow) |
| Mode B output tiny (below Rs 1) | shown to the rupee; no special case |
| Yearly frequency with a yearly increase | the increase applies every withdrawal after the first |
| Blank required field | the prompt, not an error (as SIP) |
| Non-numeric, negative, above limit | linked error on that field; other fields' results are not shown until valid |

## 10. Validation

Limits as in section 5, tool-owned messages in the existing style, `numberField` and `setFieldsInvalid` from the shared UI. Required fields: corpus (A, B), withdrawal (A, C), duration (B, C), return. Optional: yearly increase (blank = 0). Only the **fields of the selected mode** are validated; a hidden field's value is neither validated nor used. Messages (drafts):

- Corpus: "Enter a starting corpus between ₹10,000 and ₹100 crore."
- Withdrawal: "Enter a withdrawal between ₹100 and ₹10 crore."
- Duration: "Enter the duration as a whole number of years from 1 to 50."
- Return: "Enter an assumed annual return between 0% and 30%."
- Increase: "Enter a yearly increase between 0% and 20%, or leave it blank for none."

Decimals are accepted for return and increase; amounts need not be whole numbers. A non-empty value that is not a number is an error on its field, never silently treated as blank or zero (rule 8.5). Validation lives in `formulas/swp.js` (pure), as in `formulas/sip.js`.

## 11. UX flow

Intro (spells out "systematic withdrawal plan" and the three questions in plain words), then one form: the mode choice, then only the selected mode's fields, then the assumptions fields; **live results** as in SIP (no Calculate button), Reset. Then the answer card, the supporting figures, the scenarios, the year table, and the content sections (how to use, assumptions, how it is calculated, an example, FAQ). Reset returns every field, and the mode, to the defaults and clears the results to the empty prompt.

## 12. Comparison, table or schedule decision

**Scenarios: yes** (section 7.8). **Year-by-year table: yes, in V1.** It is the audit trail that lets the visitor check the answer, shows how the balance falls and when growth stops covering the withdrawal, and is the only way to read "the balance after year N". Columns: **Year, Withdrawals, Estimated growth, Closing balance** (four, not five). Opening balance is omitted because it equals the previous year's closing balance (and the starting corpus for year 1, stated in the caption); this keeps four columns at phone width. Identity stated in the caption: closing = previous closing - withdrawals + growth. Maximum 50 rows (bounded). The last row in Mode A is labelled when the corpus runs out. **A month-by-month schedule is not offered**: 600 rows are noise, and nobody audits a SWP by month.

## 13. Chart decision

**NOT NEEDED in V1.** A balance-over-time line would show a curve that the year table and the answer sentence already express, and it would be the same "line goes up or down" visual as the SIP chart (the rulebook's restraint on repeated charts and rule 9.6's "defer charts"). Revisit only if user evidence shows the table is hard to read; a chart would have to show something the table does not (for example the moment growth stops covering the withdrawal).

## 14. Export decision

**NOT NEEDED.** A scenario built on assumptions is not a record to keep, and a 50-row table does not warrant CSV. Revisit with user evidence.

## 15. Print decision

**NOT NEEDED in V1.** Print Summary exists on SIP, Prepayment and Balance Transfer; adding it here is not a reason. It would add print CSS and a summary layout for a feature nobody has asked for. Revisit if people ask to share a plan; the table already prints acceptably through the browser's own print.

## 16. Privacy, URL state and storage (decided)

**Entirely ephemeral.** No query parameters, no `localStorage`, no cookies, nothing sent anywhere. Financial scenarios are private, none of the existing calculators stores or shares state (verified: no `location`, `history` or `localStorage` use in the SIP, FD or CAGR tools), and shareable links would put a person's corpus into URLs, browser history and chat logs. If shareable scenarios are ever wanted, they need their own decision and a privacy note; the Time Zone Converter's query-string pattern is not a precedent for money.

## 17. Mobile behaviour (320, 360, 390 px)

- One column. The mode choice is three **stacked** full-width radio options (a segmented control cannot fit three sentences at 320 px), each at least 44 px tall with the label as the whole tap target.
- Fields: corpus, withdrawal, frequency (a native select), duration, return, increase. Amount fields use `inputmode="decimal"`; whole-year duration uses `inputmode="numeric"`. Font size at least 16 px so the browser does not zoom on focus.
- No sticky or floating elements. The result appears below the form and updates live; after the form is valid the first answer is reachable with one scroll.
- The answer card, three supporting figures and three scenarios **stack**; figures wrap (`overflow-wrap: anywhere`) so a large Mode C corpus never widens the page.
- The table sits in a labelled scroll region (`role="region"`, `tabindex="0"`, an accessible name) with a sticky Year column, as the SIP table does. Four columns at 14 px usually fit at 360 px; at 320 px with very large values the region scrolls **inside itself**, never the page. The test asserts no page-level horizontal overflow at 320, 360 and 390.
- Action row: Reset only (at least 44 px).

## 18. Accessibility

- A `<fieldset>` with a `<legend>` ("What do you want to find out?") around native radio inputs: arrow-key navigation and the screen-reader group name come from the platform.
- Every field has a real `<label>`, a linked hint (`aria-describedby`) and, on error, `aria-invalid` and a linked error element (the shared `setFieldsInvalid`). The error sits next to the field and in one summary above the results, as SIP does.
- **Mode change:** the radio keeps focus; the newly hidden fields leave the tab order (`hidden`); the visible fields keep their entered values; the results update. The change is announced through the live region (below), not by moving focus.
- **Live region:** a single `role="status"` / `aria-live="polite"` element, updated one sentence at a time **500 ms after the visitor stops typing** or on a mode change, never per keystroke (rule 7.3), as `sip/index.js` does.
- The table has a `<caption>`, `<th scope="col">` and `<th scope="row">` for the year; the scenarios are a labelled list; meaning is never carried by colour alone (the words "Lower return", "As assumed", "Higher return").
- Contrast at least 4.5:1 for text and controls, 3:1 for outlines; visible keyboard focus from the shared layer; `prefers-reduced-motion` (no animation in the first place); touch targets at least 44 px.

## 19. Architecture and exact file impact

**Where the maths lives: in a new tool-owned module `assets/js/calculators/formulas/swp.js`.** Not in a shared utility: the existing formula modules (`sip.js`, `fd.js`, `cagr.js`) are each tool-owned, and SWP shares no real code with them. The two things SWP has in common with SIP are an eight-line scenario helper (duplicated deliberately, see 7.8) and the formatter, which already exists in `calculators/common/formatter.js`. A "shared investment utility" would be an abstraction for a hypothetical future tool (rule 9.4). Re-use confirmed: `formatINR`, `formatNumber`, `formatDuration` (formatter.js), `numberField`, `setFieldsInvalid`, `clearFieldsInvalid` (ui/field.js), `resultMetric`, `resultEmpty`, `resultError` (ui/result.js), `escapeHTML`, `getCalculatorById`, `ROUTES`, `calculator-form.css` and the table component.

**Create (implementation phase, not now):**
- `assets/js/calculators/formulas/swp.js` (pure: limits, validation, the factor, the simulation, scenarios)
- `assets/js/calculators/swp/index.js` (the page: fields, mode choice, wording, table)
- `assets/css/calculators/swp.css` (layout only: mode options, supporting figures, scenarios, table region)
- `tests/fixtures/swp-golden.py` (the independent reference; see 22) and `tests/unit/swp-golden.test.mjs`
- `tests/browser/swp.spec.js`
- baselines for the new route (DOM, SEO, links, visual desktop and mobile)

**Modify:**
- `assets/js/data/tools.js`: one new entry after `cagr` (id `swp`, `category: "investment"`, `loader: () => import("../calculators/swp/index.js")` as a plain literal, icon, title, description, aliases, capabilities, `seo`, `autoRelated: false`, `relatedTools: ["sip"]`)
- `src/_data/toolStyles.json`: one `"swp"` entry with the same base list as `sip` plus `/assets/css/calculators/swp.css`
- `tests/inventory/url-inventory.json` (regenerated; it derives from the catalog, so `generate-inventory.mjs` does not change)
- Pinned expectations that change because there is one more published Investment tool: `tests/unit/taxonomy.test.mjs` (the Investment tool lists), `tests/unit/catalog.test.mjs` (the id-to-section map and published counts), `tests/unit/tool-catalog.test.mjs` and `tool-capabilities.test.mjs` where they count tools, `tests/unit/sections.test.mjs` and `directory.test.mjs` where they list or count Calculators, `tests/unit/search.test.mjs` (counts, plus the new queries in both directions), `tests/unit/relationships.test.mjs` (the one curated relation). The existing Coming Soon helper tests keep working because PPF stays an Investment Coming Soon entry. Each is a deliberate expectation edit (rule 10.6).
- The shared registries that list "all tools" derive from the catalog and need no code change (`calculators.js`, `search-index.js`, `taxonomy.js`, `relationships.js`, routes, sitemap, All Tools). Confirm by the build, not by assumption.

**Not touched:** `formulas/sip.js`, `fd.js`, `cagr.js`, any existing tool page, the formatter, the shared UI, `categories.js`, `routes.js` (calculator routes derive from the id), Home copy, navigation, Featured Tools, any article.

**Lazy loading:** the catalog `loader` imports the tool module on its own page only; nothing loads on other pages.

## 20. Search, taxonomy and metadata

- Catalog entry as in 19; SEO title draft "SWP Calculator: How Long Will a Corpus Last? | ToolZen Hub"; description draft "Estimate how long a corpus could last under regular withdrawals, how much you could withdraw, or what corpus a plan needs, for a return you assume. A projection, not a forecast." The title and description say "estimate" and "assume" (rule 6.5: true to what the page does).
- Queries to verify, both directions (rule 5.4): `swp` and `systematic withdrawal plan` must lead with this tool; `retirement drawdown` and `withdrawal plan` must find it; `sip`, `systematic investment plan`, `step up`, `fd`, `cagr` must keep their current first result; the broad `withdrawal` must not rank this tool above an exact-match name.
- The Investment category and All Calculators gain one card; the Investment category page lists it after CAGR.

## 21. Related tools (decided)

**One curated relation: SWP -> SIP**, because the intent genuinely overlaps (build the corpus, then draw it down; Mode C's "corpus needed" is exactly the SIP calculator's "target" input). `autoRelated: false` so the tool does **not** inherit FD and CAGR from the Investment category, which do not share its intent (the same device Income Tax uses). The reciprocal link (SIP -> SWP) is **deferred**: it would change the SIP page and its baselines, and the platform already has a precedent for one-way links (Margin and Profit, `relationships.test.mjs`). FD and CAGR are not related: an FD's maturity is not a corpus being drawn, and CAGR turns a past result into a rate.

## 22. Article cluster and imagery

**Articles: NOT NEEDED for V1** (rule 6.1: no article is better than a thin one). When the tool exists, a few questions could earn real articles with the golden numbers: *what a yearly increase does to how long a corpus lasts* (the same corpus, one with and one without a 5% increase), and *why one assumed return is not an answer* (the three scenarios on one plan). Decide after the tool ships and only with real figures. The existing Coming Soon article placeholders are unrelated and untouched. **Imagery: none.**

## 23. SEO plan

One H1 "SWP Calculator"; a first paragraph that spells out "systematic withdrawal plan" and the three questions; the form, example, assumptions and FAQ in the static HTML; canonical `https://toolzenhub.in/calculators/swp/` in every build (a preview is never a production canonical); breadcrumb data generated from the catalog (the category crumb goes to the Investment page); no pages for keyword variations ("swp for retirement", "swp calculator for mutual funds") and no structured data for content that is not shown.

## 24. Performance constraints

Pure arithmetic: at most 600 iterations, microseconds. **No** dependency, worker, API, backend or framework. Budget: tool JS about 12 KB gzipped or less including the formulas (SIP's formulas are about 10 KB raw and its page 37 KB raw), CSS about 3 KB gzipped, shared styles reused, loaded only on its own page. Results update live without debouncing the calculation (it is cheap); only the screen-reader announcement is debounced.

## 25. Golden test cases

**Independent derivation.** Every value below was produced by a separate Python `decimal` reference (60 digits) written for this spec, **not** by the code under test, and checked two ways: (1) a forward simulation of the balance period by period, and (2) the present-value factor `F`, with the whole-year closed form `F = A x S` asserted equal to the summed form, and the number of full withdrawals in Mode A asserted equal to the largest N with `W x F(N) <= C + TOL`. All values agree. The reference becomes `tests/fixtures/swp-golden.py` (as `sip-golden.py`) in the implementation phase and the unit test imports its output; it is **not** committed in this phase. Money is compared to a cent plus double precision, counts of withdrawals exactly.

All use effective-annual conversion, start-of-period withdrawals, TOL Rs 0.005. Amounts in rupees.

**A. How long will it last?**

| Id | Inputs | Expected |
| --- | --- | --- |
| A1 default | C 1,00,00,000; W 80,000 monthly; r 8%; s 0 | full 250 (20 y 10 m); partial 20,680.4637; withdrawn 2,00,20,680.4637; growth 1,00,20,680.4637; ending 0. Table: year 1 withdrawals 9,60,000, growth 7,58,889.08, closing 97,98,889.08; year 2 closing 95,81,689.29; year 20 closing 7,96,769.33; year 21 (final) withdrawals 8,20,680.46, growth 23,911.13, closing 0. Monthly return i = 0.006434030110. First month by hand: (1,00,00,000 - 80,000) = 99,20,000; growth 99,20,000 x 0.00643403011 = 63,825.58 |
| A1 scenarios | same, r 6% and 10% | 6%: full 191 (15 y 11 m), partial 44,211.3180; 10%: full 566 (47 y 2 m), partial 37,675.2883 |
| A2 zero return, exact | C 12,00,000; W 10,000 monthly; r 0; s 0 | full 120 (10 years) exactly, partial 0, withdrawn 12,00,000, growth 0, ending 0 (exact exhaustion, no tolerance needed) |
| A3 never used up | C 1,00,00,000; W 30,000 monthly; r 10%; s 0 | full 600, not used up; withdrawn 1,80,00,000; growth 74,05,35,677.6494; ending 73,25,35,677.6494 |
| A4 yearly increase, partway through a year | C 1,00,00,000; W 50,000 monthly; r 8%; s 5% | full 278 (23 y 2 m); partial 11,732.1836; withdrawn 2,51,77,169.6302; growth 1,51,77,169.6302; ending 0. Year 1 withdrawals 6,00,000; year 2 6,30,000 (monthly 52,500); year 23 closing 3,17,753.24; year 24 (final) withdrawals 3,18,884.56, growth 1,131.32, closing 0. The 278th withdrawal is 50,000 x 1.05^23 = 1,53,576.19 |
| A5 withdrawal larger than corpus | C 50,000; W 60,000 monthly; r 8% | full 0 (0 months); partial 50,000; withdrawn 50,000; growth 0; ending 0 |
| A6 very small withdrawal | C 1,00,00,000; W 100 monthly; r 8% | not used up; withdrawn 60,000; growth 45,83,58,115.6720; ending 46,82,98,115.6720 |
| A7 quarterly | C 50,00,000; W 1,00,000 quarterly; r 7%; s 0 | full 107 (26 y 9 m); partial 83,643.8971; withdrawn 1,07,83,643.8971; growth 57,83,643.8971; ending 0; quarterly return 0.017058525002; year 1 withdrawals 4,00,000, growth 3,32,647.99, closing 49,32,647.99; 27 table rows |
| A8 yearly with increase (hand-checkable) | C 80,00,000; W 6,00,000 yearly; r 7%; s 3% | full 18; partial 1,15,595.8133; withdrawn 1,41,64,257.0381; growth 61,64,257.0381; ending 0. Year 1 by hand: 80,00,000 - 6,00,000 = 74,00,000; x 1.07 = 79,18,000.00 closing; growth 5,18,000. 19 table rows |
| A9 boundary horizon | C 60,00,000; W 10,000 monthly; r 0; s 0 | full 600 and ending exactly 0: used up exactly at the 50-year horizon (state 3), no partial |
| A10 exact one-withdrawal | C 1,00,000; W 1,00,000 monthly; any r | full 1; ending 0; the second withdrawal is not funded (partial 0) |

**B. How much can I withdraw?** (C 1,00,00,000 unless stated; the result `W = C / F`)

| Id | Inputs | F | Expected |
| --- | --- | --- | --- |
| B1 | 25 y, r 8%, monthly, s 0 | 133.582937 | W 74,859.8600; withdrawn 2,24,57,958.01; growth 1,24,57,958.01; final balance 0 |
| B2 | 25 y, r 8%, monthly, s 5% | 210.872146 | first W 47,422.1000; withdrawn 2,71,59,831.04; growth 1,71,59,831.04; final-year monthly W 47,422.10 x 1.05^24 = 1,52,941.01 |
| B3 | 20 y, r 7%, yearly, s 3% | 14.264880 | W 7,01,022.3793; withdrawn 1,88,36,733.86; growth 88,36,733.86 |
| B4 | 1 y, r 0, monthly | 12 | W 8,33,333.3333 (exact) |
| B5 | 50 y, r 0, monthly | 600 | W 16,666.6667 (the longest duration) |
| B6 | 30 y, r 6%, quarterly, s 2% | 71.011000 | W 1,40,823.2530; withdrawn 2,28,51,715.53 |
| B7 | 10 y, r 12%, monthly | 72.133560 | W 1,38,631.7261; monthly return 0.009488792935 |
| B scenarios | 25 y monthly, s 0, r 6% and 10% | | W 63,154.68 and 87,154.58 (8% is B1) |

**C. What corpus do I need?** (W 50,000 per withdrawal; `corpus = W x F`; F as in B)

| Id | Inputs | Expected corpus |
| --- | --- | --- |
| C1 | 25 y, r 8%, monthly, s 0 | 66,79,146.8714 |
| C2 | 25 y, r 8%, monthly, s 5% | 1,05,43,607.3032 |
| C3 | 20 y, r 7%, yearly, s 3% | 7,13,243.9916 |
| C4 | 1 y, r 0, monthly | 6,00,000 exactly |
| C5 | 50 y, r 0, monthly | 3,00,00,000 exactly |
| C scenarios | 25 y monthly, s 0, r 6% and 10% | 79,17,070.17 and 57,36,932.83 |

**R. Rounding-sensitive.** B1 gives W = 74,859.860043. Entered back into Mode A (C 1,00,00,000, 8%, monthly): **W = 74,859** covers all 300 withdrawals in full and leaves a balance that funds only part of a 301st (a partial of 786.8008), while **W = 74,860** covers only **299** full withdrawals and a partial 300th of 74,732.7799. A Rs 1 change in the input moves the result by a whole withdrawal; the implementation must reproduce both and the FAQ explains why.

**Mode equivalence and invariants (tests, not golden values):**
- C(B(C0)) = C0 and B(C(W0)) = W0 to 1e-9 relative, for every B and C row above.
- A forward simulation with B's W ends with a closing balance within TOL of 0 and funds all N withdrawals; with C's corpus it does the same.
- Monotonicity: with other inputs fixed, Mode A's `full` is non-decreasing in the corpus and in the return, non-increasing in the withdrawal and in the increase; B's W is increasing in the corpus and the return and decreasing in the increase and the duration; C's corpus is increasing in the withdrawal, the duration and the increase and decreasing in the return.
- Conservation: `corpus - withdrawn + growth = ending balance` for every Mode A result (to 1e-6).
- A yearly increase of 0 equals a blank increase; scenarios are ordered (lower <= assumed <= higher in duration, withdrawal ability and inverse corpus).
- Frequency independence of the return: with withdrawals so small they are negligible, the corpus grows by exactly r over a year at monthly, quarterly and yearly frequency.
- Hidden-field independence: changing a field the selected mode does not use never changes the result.
- Closed form (whole years) equals the summed factor to 1e-12 relative.

**Validation (unit):** blank required fields; blank optional increase = 0; negative return rejected; return 30.0001 rejected; duration 0, 51, 2.5 rejected; corpus 9,999 and 100,00,00,001 rejected; withdrawal 99 rejected; increase -1 and 20.5 rejected; a hidden mode's field not validated; non-numeric text rejected.

## 26. Impact-based testing plan

All browser runs use `--workers=1`, one project at a time, focused specs and `-g` filters, with the built specs run directly (rule 10.3). **No full regression**; no visual regression beyond the changed surfaces; no run "for confidence" (rule 10.7).

| Layer | What runs | Why |
| --- | --- | --- |
| Unit, new | `swp-golden.test.mjs`: the golden values above, the invariants, mode equivalence, validation, boundaries, scenarios | the only new logic |
| Unit, shared, affected only | the catalog, taxonomy, directory, sections, tool-catalog, tool-capabilities, search and relationships tests, **only** because the published Investment set and counts change | a pinned expectation changes deliberately |
| Existing formula and golden suites (SIP, FD, CAGR, loans) | **not run** | no shared formula or formatter code is modified |
| Static | inventory check, links, assets, SEO on both builds | one new route |
| Browser, focused | `swp.spec.js`: each mode with a real result; mode switching keeps values and hides unused fields from the tab order; a yearly increase changes the result; the not-used-up state, the first-withdrawal-exceeds-corpus state and the partial-year table label; validation, linked errors, reset; keyboard-only operation of the mode radios; the live region updates one sentence after typing stops (not per keystroke); the scenarios; the table region name and caption; **nothing in the URL and nothing in storage** after use; search by name and aliases; the one related link | the tool's own journeys |
| Responsive | at 320, 360, 390 px and desktop: no page-level horizontal overflow, controls at least 44 px, the table scrolls only inside its region, a very large Mode C figure does not widen the page | the rule and a real risk |
| Accessibility | labels, `aria-invalid`/`aria-describedby`, radio group name, hidden-field removal from the tab order, live region politeness (semantic assertions; no automated scanner is claimed) | rule 7.3 |
| Existing tools | route-load sanity for **one** existing Investment tool (the Investment category page, because it now lists a fifth card) and the All Calculators listing; **not** SIP, FD or CAGR behaviour | shared listings change, not those tools |
| Visual | the new tool, desktop and mobile; the Investment category page only if its layout changes; reviewed by eye before accepting any baseline | changed surfaces only |
| DOM, SEO, links baselines | the new route's entries and the updated listings | pinned and reviewed |
| Builds | root and preview | static site |
| Real device | one Android pass on the preview (the user's phone): mode radios, number entry, the table region at 320-390 px, a large Mode C value. Safari/WebKit: **not available**, stated as such. This is a layout and input check; the maths has no browser-specific behaviour (plain arithmetic, `Intl.NumberFormat` already used by every calculator) | the lesson from the Image Compressor |

## 27. Risks

- **Misread as advice or a promise.** The biggest risk for any drawdown tool. Mitigated by the trust wording, no "safe", "sustainable" or rate label, scenarios, explicit exclusions and the constant-return caveat. Mode B's "a corpus used up at the end by design" must not read as a recommended amount.
- **Convention mismatch with other calculators.** The effective-annual conversion differs from `r / m`, and from the SIP tool on this site. A visitor comparing numbers will see small differences. Mitigated by stating the convention and the difference on the page. If review prefers consistency with SIP over frequency independence, the alternative is `r / m` with a note that the effective return then depends on the frequency; the golden values would be regenerated. **Decision for review.**
- **Rounding sensitivity at the exhaustion boundary** (case R): a Rs 1 change can move a result by one withdrawal. Handled by TOL, documented and tested, explained in the FAQ.
- **The constant-return model overstates how long a corpus lasts when bad years come early** (sequence risk). Not modelled in V1; stated as a limitation.
- **Large and tiny values.** Mode C can reach thousands of crores; the figure must wrap inside its card. Tested at 320 px.
- **Three modes on a phone.** A longer form; controlled by showing only the selected mode's fields. Fallback in 4a.
- **Table width at 320 px.** Contained in its own scroll region; page-level overflow is asserted.
- **Browser compatibility:** none beyond what every calculator already uses (`Intl.NumberFormat`, number inputs, a native `<select>`, radios). No Worker, no storage, no API. Safari is unverified for the whole platform; nothing here is Safari-specific.
- **Scope creep** into tax, fund data, sequence-of-returns and inflation. The exclusions list below is the guard.

## 28. Explicit exclusions (V1)

Taxes (capital gains, TDS), exit loads, expense ratios and fees, volatility and sequence-of-returns (a single constant return), inflation as a modelled quantity (the increase is user-chosen), fund NAV, units or dates, a corpus-left-at-the-end target, withdrawals on calendar dates, half-yearly frequency, changing the withdrawal mid-plan, lump-sum top-ups, multiple corpora, pension, annuity, EPF or NPS rules, negative returns, a chart, CSV, print summary, shareable or saved scenarios, articles, a reciprocal SIP link, imagery.

Revisit conditions: a residual-balance target when users ask to "leave something behind"; sequence-of-returns only as a separate, carefully worded stress feature; print or share only on evidence; the reciprocal SIP link in a deliberate separate change that updates the SIP baselines; a chart only if it shows what the table cannot.

## 29. Quality gate and commit checkpoint

Tick against the factory gate in the implementation phase; every NOT NEEDED item above carries its reason. Suggested subject: `feat: add swp calculator`. After implementation: exact-tree verification per `docs/tool-pack-factory.md` section 8 (single project, `--workers=1`), a normal push, and a check of the Pages preview routes. Production and Hostinger are never touched.

## 30. Decisions to confirm at approval

1. All three modes in V1 (fallback: A and B only).
2. Effective-annual return conversion, intentionally unlike the SIP tool's nominal convention.
3. Withdrawals at the start of each period.
4. Withdrawal increase is a user-chosen yearly percentage, applied once a year, never called inflation.
5. 50 years maximum; no negative returns; 0 to 30% return; 0 to 20% increase.
6. No chart, no print, no export, no articles, no persistence, no URL state.
7. Aliases: `systematic withdrawal plan`, `retirement withdrawal`, `retirement drawdown`, `withdrawal plan` (not `withdrawal calculator`).
8. One curated one-way relation to SIP.
9. Defaults: Rs 1 crore, Rs 80,000 monthly, 8%, 25 years.

## Implementation notes (deviations and additions found while building)

The approved decisions in section 30 were implemented as written. Everything below is what the build added or changed, so the spec and the code agree.

1. **Display rounding direction.** The model is still unrounded. For display only, a **withdrawal** the corpus supports (Mode B, the scenario cards and the final-year withdrawal in Mode B) is rounded **down** and a **corpus** a plan needs (Mode C and its scenarios) is rounded **up** (the SIP tool already rounds a required SIP up). Typing a displayed figure back in therefore never makes the plan look better than the estimate, which softens the rounding-sensitive case R (Rs 74,859 is shown, not 74,860). Everything else is rounded to the nearest rupee by `formatINR`. This is a per-tool presentation choice, not a platform rule: the older calculators round to the nearest rupee and are not changed.
2. **Reference script fix.** The first draft of `tests/fixtures/swp-golden.py` emitted an extra, empty year row when a plan was used up exactly at a year boundary (case A2, 11 rows instead of 10). The implementation spec had always meant no empty row; the script and the embedded golden values were corrected before the formula module was written. The rule is: no row for a year that never started.
3. **Engine API.** `formulas/swp.js` exports `SWP_LIMITS`, `EXHAUSTION_TOLERANCE`, `SCENARIO_SPREAD`, `MODES`, `FREQUENCIES`, `validateSwpInputs`, `periodReturn`, `scenarioRates` and `calculateSwp`. An invalid mode returns only a mode error. A yearly plan uses the entered return as it is (no power, no rounding noise). The Mode B/C table comes from a forward simulation with the solved amount, so it is checked against the answer.
4. **Table context.** The visible "closing balance = previous closing balance − withdrawals + growth" sentence sits above the scroll region (linked with `aria-describedby`) and the table's `<caption>` is its short accessible name. A caption inside a wide table is clipped by the scroll region on a phone. The shared `min-width: 560px` on result tables is overridden for this four-column table so it fits at 320 px in typical cases, and the year-used-up marker wraps under the year.
5. **Frequency choice.** Three native radios drawn as segments (the FD tool's pattern), not a `<select>`; the question choice is the same component, stacked.
6. **Headline layout.** The answer takes the first row of the results grid; the supporting figures follow.
7. **Not added:** a chart, print, export, persistence, articles, a reciprocal SIP link, a Worker, a dependency.

**Shared files touched (expectations only):** the catalog and styles registry (one entry each), the regenerated URL inventory, and the pinned expectations that count or list published tools (catalog, taxonomy, directory, sections, search, relationships tests, with `autoRelated: false` handled in the old-selection parity helper). The DOM baselines of the Tools directory and the Investment page, the SEO and links baselines and the Calculators, Tools and Investment visual baselines changed because one card was added; the SWP page has its own desktop and mobile visual baselines.

**Real-device verification.** Android: **PASS**. The user opened the SWP calculator on the GitHub Pages preview on an Android phone, completed the requested real-device review (typing, the three questions, the table region at narrow widths, Reset, the SIP link) and reported "All good". The page loads and works on Android. No device model, Android version or browser version was supplied, so none is recorded. Safari/WebKit: **UNVERIFIED**; no Safari or WebKit run has been made.

8. **Size.** Tool JS is about 14.6 KB gzipped (formulas 4.5 KB, page 10.1 KB) and CSS 2.3 KB: the JS is about 2.6 KB over the roughly 12 KB planned in section 24, because the page carries the three questions, the explanatory sections and the example. Left as it is (SIP pages are of the same order); trimming copy is the first lever if this is ever a concern.
