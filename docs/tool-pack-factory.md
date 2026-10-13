# Tool Pack Factory

How a new ToolZen Hub tool goes from idea to one verified local commit, with the least repeated effort and the
fewest ways to get it wrong. This is a **process and checklist**, not a framework: the repository already has
the reusable parts, and the decisions (what to build, what not to build) are not mechanical.

Read with: `docs/tool-pack-template.md` (what a pack changes and the visual quality rules),
`docs/tool-packs/_spec-template.md` (the spec to fill in), `docs/content-clusters.md` (articles),
`docs/shared-tool-ux.md` (shared UI), `docs/design-follow-ups.md` (known deferred design work). The worked
examples are `docs/tool-packs/01-loan-prepayment.md` and `docs/tool-packs/02-balance-transfer.md` (both built);
`docs/tool-packs/03-sip.md` is the planned third pack.

## 1. Factory map (what the first pack taught us)

| | What |
| --- | --- |
| **Already reusable** | One authoritative tool catalog (`data/tools.js`): identity, status, category, capabilities, SEO text, loader, related ids; the route, section and listing cards are derived. Taxonomy (`data/categories.js`). Search index and relationships derived from the catalog and the article catalog. Static generation and SEO (breadcrumb, canonical on `https://toolzenhub.in`, sitemap from the URL inventory, Coming Soon never routed). Shared UI primitives (`ui/field.js`, `ui/result.js`, `ui/escape.js`, `ui/dialog-focus.js`) and formatters (`calculators/common/formatter.js`). Shared tool CSS: form, results, table, **buttons with accessible action tokens**, focus ring, section and result hierarchy. Pure-logic convention (`formulas/*.js`) with an independent golden-value fixture. Article catalog with curated relationships and PNG + WebP hero images. Test layers: unit, static (inventory, links, assets, SEO), browser (3 projects), visual, DOM and SEO baselines. |
| **Still manual and repetitive today** | Editing the pinned "published set" expectations (they are literals on purpose, so an accidental publication fails a test): `tests/unit/{catalog,sections,relationships,search,articles}.test.mjs`, `tests/browser/{navigation,articles,build}.spec.js`, and the regenerated `tests/inventory/url-inventory.json`. Adding the tool to `src/_data/toolStyles.json` and the visual page list. Re-recording baselines for listings and related-tool cards that now show the tool. Making a golden fixture. Drawing article images. Reviewing the output fingerprint. |
| **Standardized now** | The lifecycle, the spec template with explicit "not needed" decisions, the quality gate, the checklist and the touch-list below; the visual quality rules and the contrast test; the exact-tree regression gate. |
| **Intentionally tool-specific** | The model and its formulas, the field set and validation messages, the result layout and wording, the schedule or comparison design, whether there is an export, the article topics, the diagrams. These are product decisions. They are never generated, copied from another tool, or padded to match one. |

## 2. Lifecycle

Each stage has an output. Stages marked *may be NOT NEEDED* are decided and recorded in the spec with a one-line
justification; "not needed" is a finished answer, not a gap.

| Phase | Stage | Output |
| --- | --- | --- |
| **Decide** | A. Tool selection | A chosen catalog entry (existing id and slug), why now, why not the others |
| | B. Problem definition | The user decision the tool supports, in one paragraph |
| | C. User jobs and pain points | 3 to 5 questions the user actually asks |
| | D. Scope | In v1, deliberately out of v1 |
| **Specify** | E. Inputs | Fields, units, defaults, limits, hints |
| | F. Outputs | Primary result, supporting results, what is *not* shown |
| | G. Model | The rules and conventions (timing, rounding, assumptions) in words and formulas |
| | H. Validation | Limits, messages, cross-field rules |
| | I. Edge cases | A list, each with the expected behaviour |
| **Design** | J. UX architecture | Flow, result hierarchy, shared components used |
| | K. Comparison, schedule or table *(may be NOT NEEDED)* | Decision and, if yes, which view by default |
| | L. Export, print and chart *(each may be NOT NEEDED)* | Decision with the user reason |
| | M. Mobile | How each part behaves at about 390px |
| | N. Accessibility | Labels, errors, keyboard, tables, contrast, focus, motion |
| | O. Performance | Budget (gzipped) and what must not load elsewhere |
| **Integrate** | P. Search | Aliases and keywords that are true, and the queries to check |
| | Q. Relationships | Related tools, primary tool of each article |
| | R. SEO | Title and description, canonical, static HTML |
| | S. Article cluster *(may be NOT NEEDED)* | Distinct article intents only; the rest deferred |
| | T. Imagery *(may be NOT NEEDED)* | A concept per image, or none |
| **Verify** | U. Tests | Unit golden values and invariants, browser, accessibility, visual |
| | V. Build verification | Inventory diff, both builds, fingerprint |
| | W. Quality gate | Section 4 |
| | X. Commit gate | Section 6; exactly one local commit |

### 2a. Fast tool pack (approved 2026-10-13)

A faster path for routine tools. Every mandatory gate in section 4 and the rulebook still applies; only the number of approval rounds and the amount of ceremony change.

- **Specification first, always.** Every tool needs an approved specification before implementation. A LOW or MEDIUM tool may use a compact specification that keeps every mandatory acceptance criterion (the decision, inputs and limits, model and rounding, validation, edge cases, accessibility, mobile, search and relationships, SEO, tests, deferred items); a HIGH tool uses the full template.
- **One bounded scope.** An explicitly approved scope may include the engine, UI, catalog entry, Growth ledger record, style entry, affected tests, pinned expectations, inventory and baselines, verification and **one local commit**. Separate approvals for the internal steps are not needed once the whole scope is approved; the commit happens only if the approved scope is met.
- **Tiers (proposed by the tool's risk, reconciled with rulebook sections 8 and 10).** LOW: simple converters and formatters. MEDIUM: ordinary calculators and interactive tools. HIGH: financial, tax, legal or unusually complex calculations. The specification names the tier and why; when unsure, take the higher.
  - *Correctness.* LOW and MEDIUM: golden values from an independent method (closed form, hand calculation, published reference vectors) written into the unit test; a separate executable oracle only when justified by risk. HIGH: an independent oracle (a second implementation or a closed form that must agree exactly) and the checkpoints the specification names.
  - *Scope of tests.* Focused during development; the touch-list in section 7 names the pinned unit and browser expectations, the inventory and the affected listing baselines in advance, and they are edited deliberately in the same pass. The final gate (sections 4 and 6, risk-based) runs **once**; earlier passing results are reused unless the code they cover changed.
  - *Commits.* LOW and MEDIUM: one commit for the bounded scope. HIGH: an engine-and-oracle commit may be reviewed before integration, then the integration commit.
- **Efficiency.** Read only the relevant source files and rulebook sections, once unless they change; keep progress messages and reports short (decisions, failures, final evidence); do not paste long test output; do not re-run a passed check without a cause.
- **Stop conditions.** Stop and report on an unexpected change in the tree, an unresolved correctness question, a visual difference the change does not explain, a failing required check, or a conflict with a rule.
- **Unchanged.** Pushing and any production deployment need separate explicit authorization; privacy, security, accessibility, SEO and the testing policy stand; no new framework or generator is introduced by this section (section 9 stands).

## 3. What the factory prevents

- **Feature bloat.** Every control, output, chart, table, export and article must name the user need it
  serves in the spec. If it cannot, it is deferred. A tool whose results update live does not get a Calculate
  button, a tool without a main action does not get a primary button.
- **Generic calculators.** The spec must say what the tool does better than a basic calculator (a decision, a
  comparison, a break-even, a what-if). If the answer is "nothing", pick another tool.
- **Filler articles.** No forced article count. Each article answers a distinct question with numbers from the
  tool. Rule-dependent articles wait until the rule is verified and dated.
- **Duplicate metadata.** Identity, SEO text and relationships live only in the catalog entry; article metadata
  only in the article catalog; never in a content module or a page.
- **Local one-off styles.** Buttons, focus, headings and spacing come from the shared layer. A tool's CSS holds
  layout only it needs. A visual problem found once is first judged for the shared layer.
- **Inaccessible controls.** The shared button classes and the contrast test; control text meets 4.5:1.
- **Weak imagery.** A diagram or chart drawn from the tool's own numbers, or no image. No generic art.
- **Unnecessary exports and charts.** Native print and CSV only when a schedule is something people keep or
  share; a chart only when a picture shows something the numbers and text do not.
- **Fake "advanced" features.** No settings a typical user does not need, no precision the model does not
  have, no rule or rate the site cannot keep current.

## 4. Quality gate (definition of done)

**Product**: it supports a real decision; outputs are understandable without finance jargon; edge cases are
handled and worded; the result hierarchy puts the headline answer first; assumptions are on the page next to the
results; sensitive topics carry the standard disclaimer framing and no advice.

**Technical**: the tool is a catalog entry with a literal lazy `loader`; no route, section or SEO text stored
twice; relationships and article primaries correct; no new runtime dependency; the tool module is loaded only on
its own page; pure logic is separate from the DOM and unit-tested.

**UX**: primary and secondary actions are clear, enabled controls look enabled and disabled controls look
disabled; focus is visible; headings follow the shared hierarchy; mobile is clean with no page-level horizontal
scroll; empty, error and loading states read clearly.

**Accessibility**: labelled fields with linked hints and errors, keyboard-only use, contrast (4.5:1 for control
and body text, 3:1 for outlines and focus), semantic headings and tables with captions and scope, reduced motion,
no meaning carried by colour alone.

**Content**: articles have distinct intents; none is forced; no filler; images match the concept; no generic or
AI-looking imagery; alt text says what the image explains.

**SEO**: one primary tool page per problem; unique title and description; canonical on the production origin;
the whole page is in the static HTML; the sitemap lists only real published pages; Coming Soon is never routed.

**Testing**: unit (golden values from an independent method, invariants, validation); static; browser on
subpath-desktop, subpath-mobile and root-desktop; accessibility; visual when the UI is new or changed; root and
GitHub Pages builds.

**Quality**: the exact-tree verification passes (below) and the working tree is clean before the commit.

## 5. Implementation checklist

```
PRE-BUILD
[ ] git status clean, HEAD as expected; read the spec; inspect the catalog entry (id, slug, category)
[ ] the existing id and slug are kept; no new category or section unless the spec says so

MODEL
[ ] pure module in formulas/<name>.js; reuse formulas/loan.js and prepayment.js, never copy
[ ] correctness reference by tier (section 2a): HIGH keeps tests/fixtures/<name>-golden.py (closed form and simulation must agree); LOW and MEDIUM may use independently checked standard or reference vectors
[ ] unit tests: golden values, invariants over a grid, validation messages, boundaries

UI
[ ] markup() and init(); shared field/result helpers; labels, hints, linked errors; aria-live summary
[ ] shared button classes only; heading hierarchy; result order: answer, comparison, detail, explanation
[ ] schedule, comparison, chart, export, print: only those the spec decided on

INTEGRATION
[ ] catalog entry (status, loader, capabilities that are true, seo, relatedTools, relatedArticles, aliases)
[ ] src/_data/toolStyles.json entry; npm run inventory:generate and review the diff
[ ] search checks (name, aliases, the user's question); relationships; guide articles point to the new tool

CONTENT
[ ] only the articles the brief approved; numbers computed with the tool; distinct intents
[ ] images: a concept diagram or chart from the tool's numbers, or none; PNG + WebP; real alt text

QUALITY
[ ] update the intentional pinned expectations (section 7) and add the new tool's tests
[ ] focused, risk-based tests (rulebook section 10); the section 8 gate only at a checkpoint or for broad shared risk
[ ] visual: name the affected snapshots from the touch-list during integration, review each changed baseline by eye, update only those in the same commit
[ ] builds: both targets clean; links, assets, SEO checks; fingerprint explained
[ ] diff review of every changed line; no debug code, temp files or unrelated changes
[ ] one coherent commit per approved bounded scope; push only when separately authorized (rulebook section 11)
```

## 6. Commit gate

`git status` and `git diff --stat` reviewed; every changed line belongs to the pack; test-results and
`tests/.tmp` removed; the focused, risk-based checks for this change passed on this exact tree; one commit. A full
exact-tree run (unit, static, three browser projects one at a time with `--workers=1`, visual, both builds) is a
checkpoint for milestones and broad shared-risk changes (rulebook section 10, items 11 and 12), not for every pack.

## 7. Publishing touch-list (what changes when a tool goes live)

From Tool Pack 1. Everything here is a reviewed, intentional edit; none is automatic.

- **Catalog and data:** `assets/js/data/tools.js` (the entry), `src/_data/toolStyles.json`,
  `assets/js/data/articles.js` and `data/articles/<topic>/<slug>.js` for each article, hero images under
  `assets/Images/articles/`.
- **Pinned expectations:** `tests/unit/catalog.test.mjs`, `sections.test.mjs`, `relationships.test.mjs`,
  `search.test.mjs`, `articles.test.mjs` (published sets, counts, ranking order, related lists);
  `tests/browser/navigation.spec.js`, `articles.spec.js`, `build.spec.js`, `emi.spec.js`,
  `loan-comparison.spec.js` (card and related-tool counts); `tests/inventory/url-inventory.json` (regenerate).
- **Baselines (review, then update only what changed):** DOM (`articles-listing`, `related-content-*`,
  `article-content-shell`), links, SEO, and visual for the new page plus the listings and tool pages that now
  show a new related card. List the affected snapshots during integration (the investment, calculators, tools and category listings that gain the card), not afterwards.
- **Visible side effects to review:** the Coming Soon card becoming a live card on Loans, All Calculators and
  Categories; related-tool cards on existing tools of the same category; search results and ranking; related
  articles on tools without a curated list; the home page and footer lists do **not** change unless edited.
- **Docs:** the pack's spec gets an implementation-notes section recording every deviation from the plan.

## 8. Regression gate (memory-safe)

This is the full gate. Run it only at a deliberate checkpoint or for a broad shared-risk change, not after every pack
(rulebook section 10). When it is run: sequentially; one Playwright project at a time with one worker, output to files:

```
npm run build:all
npm run inventory:check
npm run test:static
npm run test:unit
npx playwright test --project=subpath-desktop --workers=1
npx playwright test --project=subpath-mobile  --workers=1
npx playwright test --project=root-desktop    --workers=1
npx playwright test --project=visual-desktop --project=visual-mobile --project=visual-tablet --workers=1
```

The unit, static, browser and visual npm scripts rebuild first (the `pretest:*` hooks). The link check fails on any
`/undefined/` href: once, on a loaded machine, a rebuild produced `/calculators/undefined/` in two article pages of
the root build; the rebuilds that followed (more than a dozen) were clean and the cause is not found. If it ever
recurs, keep the failing `dist/` and investigate before continuing; do not just rerun until it passes.

If a background run is killed for memory, report it and rerun that project alone when asked; do not call a
partial run a pass. Visual and baseline updates are intentional, reviewed edits, never a way to make a test pass.

## 9. Generator decision

**Reviewed after Tool Pack 3: NO GENERATOR YET.** See `docs/tool-pack-reuse-review.md` for the evidence, the
rejected abstractions, the print and comparison-card decisions and the only scope a generator could ever have.
The text below is the earlier deferral, kept for the reasoning.

**DEFERRED.** A `create:tool` script would write about six mechanical edits (a catalog stub, a styles entry, a
test stub). The work that costs time and carries risk is deciding the model, the fields, the articles and the
imagery, and a generator must not do any of that. Two packs is too few to know which parts are really identical,
and a stub that looks complete invites unfinished tools, filler files or silently registered routes. Revisit
after the third pack, and only for: a spec skeleton copied into `docs/tool-packs/NN-<name>.md`, and a list of the
files to touch. Not for formulas, metadata, articles or routes.

## 10. Order of tools

The next pack is chosen from the existing catalog (Coming Soon entries keep their id and slug). The selection
reasoning for Tool Pack 2 is in `docs/tool-packs/02-balance-transfer.md` and for Tool Pack 3 (the first pack in a
second category, Investment) in `docs/tool-packs/03-sip.md`. After Pack 3 is built, review the repeated mechanical
work across Packs 1 to 3 and decide whether a limited generator or shared print and comparison styles are now
justified. That review is recorded in `docs/tool-pack-reuse-review.md` (no generator yet). Tool Pack 4 is the Margin
Calculator, the first Business tool and a pricing decision tool, chosen over a second Investment tool; its spec is
`docs/tool-packs/04-margin.md` (built). Tool Pack 5 is the Profit Calculator, the natural follow-up that takes the fixed costs and
break-even that Margin left out (a second Business tool, chosen over CAGR and the rule-bound Tax and Health tools); its spec is
`docs/tool-packs/05-profit.md` (built). Tool Pack 6 is the Home Loan Calculator, the loan that fits an EMI budget: the question that comes
before the four live Loans tools, chosen over ROI, CAGR and the lender-rule-bound Loan Eligibility; its spec is `docs/tool-packs/06-home-loan.md`
(draft). Do not start a pack without an approved spec.

### Roadmap R1 (provisional; a planning record, not an authorization)

Chosen under `docs/product-decision-rules.md` section 12 from a platform-wide candidate review (24 tools were published when it was made). The scores behind it are judgement: search, retention and competition were **hypotheses**, not data. It is bounded and revisable, and **it does not authorize implementing any of the eight tools**: each needs its own approval (a specification, or a feasibility audit first where marked) and its own risk-based automated verification. The order is a proposal and changes when audit findings justify it.

| # | Candidate | Section | Status |
| --- | --- | --- | --- |
| 1 | Hours & Timesheet Calculator | Time Tools | High confidence. Implemented as Tool Pack 23 (`docs/tool-packs/23-hours-calculator.md`); Android and Safari checks wait for the milestone |
| 2 | Credit Card Payoff Calculator | Calculators, Loans | High confidence. Implemented as Tool Pack 24 (`docs/tool-packs/24-credit-card-payoff.md`); Android and Safari checks wait for the milestone |
| 3 | Cron Expression Explainer | Developer Tools | High confidence. Implemented as Tool Pack 25 (`docs/tool-packs/25-cron-expression-explainer.md`); Android and Safari checks wait for the milestone (no real cronie binary has been run either) |
| 4 | PPF Calculator | Calculators, Investment | High confidence. Implemented as Tool Pack 26 (`docs/tool-packs/26-ppf-calculator.md`, local commits only: not pushed or deployed); the interest rate stays user-entered; Android, Safari and WebKit checks wait for the milestone and are unverified |
| 5 | Base64 Encoder/Decoder | Developer Tools | High confidence. Candidate only (a commodity: least differentiated) |
| 6 | Salary / CTC to In-Hand | Calculators, Tax | Feasibility-dependent: audit first (rule-bound, upkeep) |
| 7 | Photos to PDF | Image Tools | Feasibility-dependent: audit and a real-phone spike first (see the earlier audit) |
| 8 | QR Code Generator | Image Tools | Feasibility-dependent: audit first (verifying an encoder) |

Considered and not on the roadmap: the Unit Converter, Currency, Loan Eligibility, Personal Loan, Interest, ROI, RD, Age, Ratio, the Health tools, Regex Tester, Password Generator, Inflation and an EXIF tool (failed a mandatory gate, were variants of an existing tool, or had no fitting section).

**Milestone counting (the roadmap's own).** For this roadmap the manual-testing milestone in section 10, item 13, counts only these eight tools: the 24 tools published before it are excluded from both numerator and denominator. A tool counts as completed when it is implemented, has passed its risk-based automated verification and has no known critical defect; an unfinished, unsafe or unverified implementation does not count. Device and Safari checks are the milestone's own job, not a precondition for counting a tool. Six completed tools of eight is 75%, which satisfies the approximately 70% checkpoint. If audits or product reviews change the scope, the denominator changes with it (the target is the smallest whole number of tools at or above 70% of the current scope). Critical blockers are addressed when found, never held for the milestone. Progress: 4 of 8 complete (Hours & Timesheet Calculator, Tool Pack 23; Credit Card Payoff Calculator, Tool Pack 24; Cron Expression Explainer, Tool Pack 25; PPF Calculator, Tool Pack 26); the checkpoint is 6 of 8, so 2 more tools remain before it.

### Planning inventory P1 (candidates, not authorizations)

Recorded 2026-10-11 from the user's master product strategy. It is a **planning record**: it names 30 candidates grouped for later evaluation, in the order the user gave, and **it authorizes nothing**, and it is not a build queue: no P1 tool is scheduled automatically, and existing published tools are improved rather than duplicated where research shows a real opportunity. No section is created, no route is reserved, nothing is published or scheduled, and **Roadmap R1 above is unchanged** (it keeps its eight tools and its own milestone denominator). Each candidate still goes through `docs/product-decision-rules.md` section 12 (a platform-wide comparison with labelled evidence and a verdict), then a feasibility audit, then its own approved spec (section 14 of the rulebook) before any build. Search demand, retention and competition for all 30 are **unknown or hypotheses**: no keyword volume, SEO difficulty, traffic, retention or revenue has been measured, and none is stated here. Priorities below are the user's intended order within each group; they are not scores.

"Provisional home" is only where the candidate would live under the current sections (rulebook 4.2 and 4.7); the planning groups Software, Documents & Files and Time & Productivity are **not** sections. The "Existing in the repository" column was checked against the catalog and the specs on this date.

| Group | # | Candidate | Priority | Provisional home | Existing in the repository (verified) |
| --- | --- | --- | --- | --- | --- |
| Software | 1 | SQL Practice Lab | Very high (1st of the group) | Undecided; not an existing section's fit by default | Nothing similar. Needs a browser-local SQL engine chosen by a feasibility audit; results validated by equivalent output, not one exact statement |
| Software | 2 | QA Testing Practice Lab | Very high (2nd) | Undecided | Nothing similar |
| Software | 3 | Excel Formula Practice & Troubleshooting | High (3rd) | Undecided | Nothing similar. No claim of full Excel compatibility without verified support |
| Software | 4 | CSV Cleaning Workbench | High (4th) | Undecided | Nothing similar |
| Software | 5 | Playwright Locator Playground | High (5th) | Undecided | Nothing similar |
| Software | 6 | JSON Schema & JSONPath Lab | High (6th) | Developer Tools | JSON Formatter & Validator is published (Tool Pack 15); extend, do not duplicate |
| Software | 7 | Spreadsheet & CSV Reconciliation | Secondary | Undecided | Text Diff / Compare is published (Tool Pack 18) for text, not keyed records |
| Software | 8 | Regex Tester with Guided Debugging | Secondary | Developer Tools | Regex Tester is listed above as considered and not on Roadmap R1; that exclusion stands, and this listing does not override it |
| Documents & Files | 1 | Merge PDF | First group (1st) | Undecided | None |
| Documents & Files | 2 | Split PDF | First group (2nd) | Undecided | None |
| Documents & Files | 3 | Images to PDF | First group (3rd) | Image Tools | Same job as Roadmap R1 item 7, Photos to PDF; one candidate, one route, the R1 audit and real-phone spike apply |
| Documents & Files | 4 | Batch File Renamer | First group (4th) | Undecided | None; limited by browser file access |
| Documents & Files | 5-7 | Extract, Reorder and Rotate PDF Pages | Secondary | Undecided | None; probably modes of one PDF tool (rulebook 1.6) |
| Documents & Files | 8 | PDF to Images | Secondary | Undecided | None |
| Documents & Files | 9 | Document Format Converter | Secondary | Undecided | None; no promise of perfect layout without proven support |
| Documents & Files | 10 | Document Comparison Tool | Secondary | Undecided | Text Diff / Compare covers plain text; only a PDF or document comparison could be a different job |
| Documents & Files | 11-12 | Blank PDF Page Remover; PDF Print Preparation | Secondary | Undecided | None; never delete an uncertain blank page silently |
| Documents & Files | 13-14 | File Metadata Inspector; Duplicate File Finder | Secondary | Undecided | None |
| Time & Productivity | 1 | Pomodoro Focus Timer | First group (1st) | Time Tools | Countdown Timer is published (Tool Pack 13); a Pomodoro must be a different job, and any saved history or preference is governed by rulebook 7.7 |
| Time & Productivity | 2 | Time Zone Converter | First group (2nd) | Time Tools | **Already published** (Tool Pack 19); not a new candidate |
| Time & Productivity | 3 | International Meeting Planner | First group (3rd) | Time Tools | Builds on the published Time Zone Converter; must do a job it does not |
| Time & Productivity | 4 | Timesheet & Work Hours Tracker | First group (4th) | Time Tools | The Hours & Timesheet Calculator is published (Tool Pack 23); a tracker with stored entries needs its rulebook 7.7 reason |
| Time & Productivity | 5 | World Clock | Second group | Time Tools | Tool Pack 19 deliberately did not build a world-clock dashboard |
| Time & Productivity | 6 | Online Countdown Timer | Second group | Time Tools | **Already published** (Tool Pack 13) |
| Time & Productivity | 7 | Stopwatch with Lap Tracking | Second group | Time Tools | **Already published** (Tool Pack 14, with laps) |
| Time & Productivity | 8 | Shift Schedule Planner | Second group | Time Tools | None |

**Research candidates only** (no evaluation done, none approved): Education & Practice, Business Operations, Writing & Language, Travel & Geography, Home & Everyday Life, and Career & Employment, each with the risks the user listed (strong competitors, content quality, changing regulations, persistence, overlap with Developer Tools or with existing business calculators). A future category follows the rulebook's section 4, item 7. Overlaps already in the catalog (a text difference checker, business finance calculators) are not rebuilt to fill a category.

**Practice and learning tools** (SQL, QA, Excel, Playwright): the intended flow is learn, practise, validate, apply. Validation is deterministic and accepts every correct alternative; it does not require one exact answer, and it uses no AI API.

### Planning inventory P2 (candidates, not authorizations)

Recorded 2026-10-11 from a read-only R&D reconciliation. Like P1 above it is a **planning record and not a build queue**: it authorizes nothing, creates no section, route or Tool Pack, schedules nothing, and leaves **Roadmap R1** (eight tools, its own milestone denominator) and the P1 inventory unchanged. The seven families (Education & Practice, Business Operations, Rates & Market Information, Career & Employment, Travel & Geography, Writing & Language, Home & Everyday Life) are **research families**, not website sections. Only candidates that are new relative to the published tools, the Coming Soon catalog entries, P1 and R1 are listed; the earlier exclusions (Currency, Unit Converter, ROI, Ratio, Regex Tester) stand. Each candidate still needs the rulebook's section 12 comparison, a feasibility audit and its own approved spec. Search demand, retention and competition are **unknown or hypotheses** for all of them: no volume, difficulty, traffic or retention has been measured, and no weighted total is stated. Competitor observations came from public search snippets only and were not verified page by page.

| Tier | Candidate | Provisional home | Conditions and overlaps (checked against the repository on this date) |
| --- | --- | --- | --- |
| A | Supplier Quote Comparison, with landed cost as a possible mode | Calculators, Business (if later selected) | Margin and Profit price what you sell; this compares what you are quoted to buy. Free landed-cost calculators exist, so its case is a like-for-like total across quotes (unit price, quantity, shipping, taxes, discounts, minimum orders, exclusions) |
| A | Gold & Silver Purchase Cost Calculator | Placement open | User-entered metal rate, purity, weight, making charges and tax; quote comparison. **The tax treatment is rule-dependent and must be verified from an authoritative source during its specification** (rule 3.6). No live rates. Silver is a mode, not a second tool |
| A | Subscription Cost Comparison | Undecided | Totals and billing-period comparison from entered values; needs no stored data |
| A | Travel Budget Scenario Planner | Undecided | A deterministic scenario calculator with user-entered exchange rates; no live rates, no visa claims, no bookings |
| B | Workplace English Practice Lab | Undecided | Limited initially to structured exercises whose answers can be assessed reliably (choose, order, correct from known options). No open-ended assessment is claimed; sentence-correction practice is a mode of this lab |
| B | Quantitative Aptitude Practice Lab | Undecided | Logical reasoning is a possible later module. Content correctness and volume are the main cost; strong free incumbents exist. Percentage and profit topics link to existing tools and articles, they are not rebuilt |
| B | Project Profitability & Pricing | Calculators, Business (if later selected) | Must show a job that Profit, Margin and the Hours & Timesheet Calculator do not (for example effective hourly earnings after non-billable time). Service pricing is folded in; otherwise it is not built |
| B | Job Offer Comparison | Undecided | Subject to reconciliation with Roadmap R1 item 6 (Salary / CTC to In-Hand); free comparison calculators are common |
| B | Typing Accuracy & Speed Practice | Undecided | Strong free incumbents; needs a clear point of difference |
| B | Inventory Reorder Planner | Calculators, Business (if later selected) | The formula is simple and widely offered; worth building only with a real workflow gain |
| B | Writing Readability Inspector | Undecided | Deterministic formulas are English-only; limits stated on the page |
| B | Text Cleaning Workbench | Undecided | Check against Text Diff / Compare (published) and P1's CSV Cleaning Workbench for a shared engine before any build; duplicate-sentence finding is a mode, not a separate tool |
| C | Currency Conversion Cost Comparison | Hold | The Currency exclusion remains binding until explicitly resolved; the Currency Converter is also a Coming Soon catalog entry |
| C | Study Revision Planner | Hold | Needs a tool-specific persistence justification under rule 7.7 |
| C | Live gold, currency, market, fuel and commodity information pages | Deferred | Trackers under rule 13: not built unless explicitly selected, and only after licence, redistribution, attribution, timestamp and stale-data handling are settled |
| C | Resume Readability & Structure Checker; Career Skill Gap Planner | Deferred | No ATS claims are supportable; the skill planner needs role data and upkeep |
| C | Travel packing, itinerary, country comparison and geography explorer; household maintenance, warranty, moving, home inventory and grocery planners; Markdown workspace; transliteration helper | Deferred | Persistence-heavy, data-dependent, a commodity, or unverified accuracy |
| Excluded | Interview Scenario Practice | Not a P2 entry | Would duplicate P1's QA Testing Practice Lab (which includes interview practice) |

**Open questions (recorded, not decided):** the Currency exclusion remains binding; live-rate information requires explicit selection under rule 13; local persistence is not blanket-approved and each tool must justify it; the gold tax rules need authoritative verification when its spec is written; Supplier Quote Comparison belongs under Calculators, Business if later selected, and Gold & Silver placement remains open.
