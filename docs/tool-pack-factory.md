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
[ ] independent reference in tests/fixtures/<name>-golden.py (closed form and simulation must agree)
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
[ ] visual: review each changed baseline by eye before updating; update only affected pages
[ ] builds: both targets clean; links, assets, SEO checks; fingerprint explained
[ ] diff review of every changed line; no debug code, temp files or unrelated changes
[ ] one coherent commit; normal push only when the phase instructs (rulebook section 11)
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
  show a new related card.
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
| 2 | Credit Card Payoff Calculator | Calculators, Loans | High confidence. Candidate only |
| 3 | Cron Expression Explainer | Developer Tools | High confidence. Candidate only (dialect decisions needed in its spec) |
| 4 | PPF Calculator | Calculators, Investment | High confidence. Candidate only (the interest rate stays user-entered; it changes) |
| 5 | Base64 Encoder/Decoder | Developer Tools | High confidence. Candidate only (a commodity: least differentiated) |
| 6 | Salary / CTC to In-Hand | Calculators, Tax | Feasibility-dependent: audit first (rule-bound, upkeep) |
| 7 | Photos to PDF | Image Tools | Feasibility-dependent: audit and a real-phone spike first (see the earlier audit) |
| 8 | QR Code Generator | Image Tools | Feasibility-dependent: audit first (verifying an encoder) |

Considered and not on the roadmap: the Unit Converter, Currency, Loan Eligibility, Personal Loan, Interest, ROI, RD, Age, Ratio, the Health tools, Regex Tester, Password Generator, Inflation and an EXIF tool (failed a mandatory gate, were variants of an existing tool, or had no fitting section).

**Milestone counting (the roadmap's own).** For this roadmap the manual-testing milestone in section 10, item 13, counts only these eight tools: the 24 tools published before it are excluded from both numerator and denominator. A tool counts as completed when it is implemented, has passed its risk-based automated verification and has no known critical defect; an unfinished, unsafe or unverified implementation does not count. Device and Safari checks are the milestone's own job, not a precondition for counting a tool. Six completed tools of eight is 75%, which satisfies the approximately 70% checkpoint. If audits or product reviews change the scope, the denominator changes with it (the target is the smallest whole number of tools at or above 70% of the current scope). Critical blockers are addressed when found, never held for the milestone. Progress: 1 of 8 complete (Hours & Timesheet Calculator, Tool Pack 23); the checkpoint is 6 of 8, so 5 more tools remain before it.
