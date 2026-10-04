# Reuse and scaffolding review after Tool Packs 1 to 3

Status: review and design only. Nothing here is implemented. Base commit: `a8bd21f`.
Compared: Loan Prepayment (`4f082f9`), Loan Balance Transfer (`df994d6`), SIP (`a8bd21f`).
Goal: less mechanical work without more abstraction. Quality per tool comes first; reuse must never push a tool
towards a generic calculator, generic content or implicit trust wording.

## 1. What was measured

| Fact | Evidence |
| --- | --- |
| A pack touches 47 to 55 files and about 6,000 added lines | `git show --stat` of the three commits |
| 23 files are touched by all three packs; only 6 are *new files per tool* (`<tool>.css`, `<tool>/index.js`, `formulas/<tool>.js`, `<tool>.spec.js`, `<tool>-golden.py`, `<tool>-golden.test.mjs`) | the other 17 are edits to existing files (catalog, `toolStyles.json`, articles registry, pinned tests, baselines, inventory) |
| `index.js` is 1,254 to 1,449 lines per tool; by function: `render` is identical (9 lines), `init` is 77 to 86 percent similar (147 to 198 lines), `printSummary` about 62 percent, `liveSummary` 33 to 44 percent, `renderResults` 33 to 41 percent, `markup` 36 to 37 percent | line-set comparison of the three modules |
| `toolStyles.json`: Prepayment, Balance Transfer and SIP each list the same 21 shared stylesheets and fonts plus one tool CSS | EMI (21) and Loan Comparison (16) differ, so the shared list is a convention of the newer tools only |
| Print CSS: 71 to 87 lines per tool; about 33 of 58 normalised rule lines are identical in all three | see section 5 |
| Compare-card CSS: 10 to 12 rules per tool; 8 are identical in all three; similarity 0.73 to 0.80 | see section 6 |
| The "Coming Soon representative" was swapped in 7 unit and browser files for SIP (`catalog`, `relationships`, `search`, `taxonomy`, `static-checkers`, `navigation`, `notfound`) and it will happen again, because PPF is the obvious next pick | git history of those tests |
| Per-pack article lists are written by hand in `tests/unit/articles.test.mjs` (8 places) and `tests/browser/articles.spec.js` (6 places) | grep for `*_PACK` |
| Each golden fixture has 5 to 8 `assert` lines and a different set of helper functions; the output is pasted into the unit test as `const GOLDEN` | the fixtures and `*-golden.test.mjs` |

## 2. Repeated work by area

- **Scaffolding.** The six new files above; the `init()` controller in every tool (find the form, validate, render
  results or an error, announce one sentence after 500 ms, Reset, Print); the `render` wrapper; the `markup()`
  skeleton (intro, form, results region, how to use, assumptions, example, FAQ).
- **CSS and UI.** Print block; the three-column comparison cards; a sticky first table column; the 22-entry
  stylesheet list. Field rendering, results, escaping and validation messages already come from `ui/field.js`,
  `ui/result.js` and `ui/escape.js`, so that part is already shared.
- **Tests.** One browser spec per tool built on `helpers/test-base.mjs`; one golden unit test; the Python reference;
  an article-figure test; the Coming Soon swap; hand-written per-pack article sets.
- **Catalog and publication.** A `tools.js` entry (status, loader, aliases, capabilities, SEO, related articles), a
  `toolStyles.json` entry, an articles registry entry per article, inventory regeneration, SEO, DOM and link
  baselines, visual registration, pinned counts. This list is already written down in
  `docs/tool-pack-factory.md`, section 7.
- **Articles.** Metadata in `articles.js`, a body module, a PNG and WebP pair, a CTA to the tool, a related-article
  list of three, a figure test.
- **SEO and static.** All derived from the catalog by the build; nothing hand-written per tool except the catalog
  text itself.

## 3. Classification

A = safe to share now, B = possible later, C = keep explicit, D = do not abstract.

| Pattern | Class | Why |
| --- | --- | --- |
| Formulas and validation ranges | **D** | the product; each tool's model, limits and messages differ |
| Warnings, disclaimers, trust wording | **D** | investment, loan and charge wording must be chosen per tool and read per release |
| Target, scenario, break-even and decision logic | **D** | it is the decision support |
| Chart semantics (`sip/chart.js`) | **C** | one chart in one tool; a second chart in a different tool would differ in axes and meaning |
| Article strategy, topics, text, images | **D** | manual and intent-driven by policy |
| `markup()` and `renderResults()` | **C** | 36 to 41 percent similar; the differences are the product |
| `init()` controller | **B** | 77 to 86 percent similar and mechanical, but each tool's `update()` differs (optional fields, extra blocks) |
| `toolStyles.json` entries | **C** (see 8) | identical lists, but the explicit entry makes the build fail loudly for an unregistered tool |
| Print core (hide chrome, white background, brand and inputs block, table print rules) | **B** | identical in intent, differs in details; no print baseline exists to prove a no-change extraction |
| Compare-card base (grid, card, title, tag, `dt`/`dd` list) | **A** | 8 identical rules in all three; visual baselines for all tool pages already exist and would catch drift |
| Coming Soon "sample" in tests | **A** | recurring cost, now a fourth swap is certain |
| Per-pack article sets in tests | **A** | edited in 14 places per pack |
| Golden-fixture convention | **A** | documentation only |
| Spec skeleton and touch-list | **A** | already in `_spec-template.md` and factory section 7 |

## 4. Generator decision

**A. NO GENERATOR YET.**

Only 6 of the 47 to 55 files are new per tool, and those are the files where the thinking happens (the model, the
fields, the fixture, the first test). The 17 shared edits are edits to existing registries, which a generator could
only do by modifying live catalog data, the thing it must not do. A stub that compiles invites unfinished tools,
filler content and silently registered routes. The saving (perhaps half an hour per pack) does not justify the
risk or the maintenance of a script that has to follow every change to the tool template.

If this is revisited after Tool Pack 4 or 5, the only acceptable scope is structure with no content:
`npm run scaffold:tool -- --id=<catalog id>` creating `docs/tool-packs/NN-<id>.md` from `_spec-template.md`, empty
`<id>/index.js`, `formulas/<id>.js`, `<id>.css`, `tests/browser/<id>.spec.js`, `tests/fixtures/<id>-golden.py` and
`tests/unit/<id>-golden.test.mjs` from skeletons whose first assertion fails ("not implemented"). It must refuse if
the id is not a Coming Soon catalog entry or any target file exists; it must not touch `tools.js`,
`toolStyles.json`, the articles registry, any baseline or any existing test; its output starts unregistered and
unpublished; and it prints the publication touch-list rather than performing it.

## 5. Print styles: REVISIT LATER

Identical in all three, after normalising prefixes: hiding `#header`, `footer.footer`, the breadcrumb, intro, form
section, info and related blocks, the actions row and the live region; the white background and no card shadow; the
brand line; the inputs `<dl>` layout; the three-column compare grid; `break-inside: avoid` on cards and table rows;
table `min-width: 0`, cell padding, the non-sticky first column.

Different: the inputs grid is two columns in Prepayment and one elsewhere; the table font is 8pt in Prepayment and
9pt elsewhere; Prepayment has a monthly-detail wrapper and a repeated table header; SIP also keeps its chart at 420px
and avoids breaking the trust note; Balance Transfer avoids breaking its warning.

An extraction is feasible, but **nothing today proves it changes nothing**: print is tested only by checking that
`window.print()` is called. Do it only after adding print-media baselines (`page.emulateMedia({ media: "print" })`
screenshots of the three tool pages), in a separate commit, with those baselines passing unchanged. A shared
`calculator-print.css` would hold the common core; tool CSS would keep its own overrides.

## 6. Result and comparison cards: EXTRACT THE BASE LATER (optional, small), KEEP THE REST

The metric cards already come from the shared `calculator-results__*` styles. The `*-compare` family (grid, card,
title, tag, definition list) is a real shared primitive: 8 rules are identical, and the differences are SIP's
"assumed" highlight and its single-card variant, which stay in `sip.css`. Do not force a common number of cards,
metrics, mobile layout or comparison logic.

It is a small change but not free: the tools use `.prepay-compare__*`, `.bt-compare__*` and `.sip-compare__*` class
names in `index.js` and in browser specs. Rename to a shared `calculator-compare` base with a tool modifier class,
or keep the tool class and add it to a shared selector list. Visual baselines (desktop, mobile, tablet) exist for all
three pages and must pass unchanged. **Charts: KEEP TOOL-SPECIFIC.** One chart exists.

## 7. Inputs and validation: no change

`ui/field.js` already provides `numberField`, `fieldShell`, `setFieldsInvalid`, `clearFieldsInvalid` with linked hints
and errors. Validation lives in each formula module with tool-owned messages, and that is right: ranges and wording
are the product. A validation framework would hide those. The only repeated code is `periodFields()` (years and
months) in Prepayment, Balance Transfer and SIP; leave it until a fourth tool needs it, then move it to `ui/field.js`.

## 8. `toolStyles.json`: KEEP EXPLICIT

Three entries are the same 22-line list with a different last line (and EMI and Loan Comparison differ), so
inference is possible. But the build currently throws "No stylesheet list for tool" if the entry is missing, which
catches an unregistered tool, and an inferred list would hide a tool that needs a different set. A one-line addition
per tool is cheap. Revisit only if a fifth tool still uses the identical list.

## 9. Golden-reference convention: DOCUMENT NOW

Do not create shared financial helpers; each reference stays independent of the JavaScript. Standardise:

- name `tests/fixtures/<id>-golden.py`; Python `decimal`, 60 digits; the docstring says what is simulated and what is
  asserted;
- the model is **simulated**, and any closed form or solved answer (required SIP, break-even rate) is found a second
  way and asserted equal;
- output is JSON on stdout, one object per named scenario with money as 4-decimal strings; the same script prints a
  separate `articles` block for every figure quoted in an article;
- the JSON is pasted into `const GOLDEN` in `tests/unit/<id>-golden.test.mjs`; money is compared to a cent;
- article figures are checked by `tests/unit/<id>-articles.test.mjs`: the engine reproduces the reference figures and
  each figure, formatted as the site formats it, appears in the article text. (Balance Transfer and SIP have this
  file; Loan Prepayment has no article-figure test, so its two articles' numbers are not guarded. Add one when that
  cluster is next touched.)

## 10. Coming Soon tests: ONE SMALL HELPER

Stop naming a Coming Soon tool in seven files. Add a test helper that returns the first catalog entry with
`status: "coming-soon"` in a requested category (or the first overall), read from the catalog, and use it where a
test only needs *some* Coming Soon tool. Keep these explicit and pinned: the published and Coming Soon **counts**,
the exact published ids, and the search and route assertions for named published tools. The helper must fail loudly
if there is no Coming Soon tool in the category, and each test keeps asserting the Coming Soon behaviour (no route,
badge, not linked, not in the sitemap, not found as a published tool). Where a test needs a specific category (an
Investment tool for category pages), pass the category rather than a name. Tests that pin "PPF" because of its
real attributes (static-checkers publishes it as a mutation) can use the helper too.

Also derive the per-pack article sets in `articles.test.mjs` and `articles.spec.js` from the catalog (articles whose
related tool is `<id>`), and keep one pinned published-article **count** per category so an accidental publication
still fails.

## 11. Inventory, visual and SEO registration: KEEP PINNED

The inventory, SEO, DOM and link baselines and the visual registration are *pinned on purpose*: a pinned count is
the only thing that fails when a page is published by accident. They are regenerated or updated by one reviewed
command each, so the cost is review time, not typing. Leave them. The only cheap improvement is already in place
(`inventory:generate`).

## 12. False abstractions rejected

- a shared calculation or "financial formula" module across loans and investments;
- a base class or controller framework for `init()`, `update()` and `renderResults()`;
- a generic results renderer driven by a config object;
- a shared validation framework or shared messages;
- automatic `toolStyles.json` inference;
- auto-generated catalog entries, aliases, relationships or SEO text;
- article or imagery generation, or a shared article body template;
- a shared chart component;
- deriving the pinned inventory and baseline expectations from the catalog;
- a generator that touches live catalog entries.

## 13. Scoring

| Candidate | Repetition | Saving | Maintenance benefit | Regression risk | Coupling | Flexibility lost | Complexity | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Coming Soon test helper | HIGH | MEDIUM | MEDIUM | LOW | LOW | LOW | LOW | **DO NOW** |
| Derive per-pack article sets in tests | HIGH | MEDIUM | MEDIUM | LOW | LOW | LOW | LOW | **DO NOW** |
| Golden-fixture convention (docs) | HIGH | LOW | MEDIUM | LOW | LOW | LOW | LOW | **DO NOW** (this document) |
| Compare-card base CSS | HIGH | LOW to MEDIUM | MEDIUM | LOW (visual baselines) | MEDIUM (class names) | LOW | LOW | **OPTIONAL, LATER** (after the test-infrastructure items) |
| Print core CSS | MEDIUM | LOW | LOW | MEDIUM (no print baseline) | MEDIUM | LOW | LOW | **DO LATER**, after print baselines |
| `periodFields()` to `ui/field.js` | MEDIUM | LOW | LOW | LOW | LOW | LOW | LOW | **DO LATER** (fourth use) |
| `init()` controller helper | HIGH | MEDIUM | LOW | MEDIUM | HIGH | MEDIUM | MEDIUM | **DO LATER**, probably never |
| `toolStyles.json` inference | MEDIUM | LOW | LOW | MEDIUM (hides a missing entry) | LOW | MEDIUM | LOW | **DO NOT DO** |
| Scaffolding generator | MEDIUM | LOW | LOW | MEDIUM | MEDIUM | MEDIUM | MEDIUM | **DO NOT DO** (revisit only with the scope in section 4) |
| Shared formulas, validation, chart, article content | n/a | n/a | n/a | HIGH | HIGH | HIGH | HIGH | **DO NOT DO** |

## 14. Recommended sequence (if a hardening phase is run)

1. Coming Soon helper, applied to the seven files, plus the derived article sets. Run unit tests and the affected
   browser specs only.
2. Optional, later, only after step 1: the compare-card base. Separate commit; the three tool pages' visual baselines must pass unchanged.
3. Later, with a fourth tool or print baselines: the print core.

Each step is its own commit and none changes a calculation, a message or a page.
