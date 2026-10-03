# Tool Pack template

A **Tool Pack** is one tool plus everything that makes it a finished product: its logic, page,
metadata, search presence, relationships, supporting articles, tests and verification. Each pack is
one reviewed vertical slice and ends in one local commit.

```
Tool Pack
 -> specification -> logic -> tool module -> catalog entry -> SEO -> search -> relationships
 -> article cluster -> tests -> builds -> localhost verification -> commit
```

Companion documents: `docs/content-clusters.md` (articles, linking, editorial standard) and
`docs/shared-tool-ux.md` (the shared UI primitives and what not to abstract). A pack's spec lives in
`docs/tool-packs/NN-<name>.md`. Nothing in `docs/` is published.

## What a pack changes in this repository

| Concern | Where |
| --- | --- |
| Pure calculation logic | `assets/js/calculators/formulas/<name>.js` (no DOM, no formatting) |
| The tool page content | `assets/js/calculators/<id>/index.js` exporting `markup()`, `init()` and `render()` |
| Identity, status, category, type, capabilities, SEO text, loader, related ids | one entry in `assets/js/data/tools.js` |
| Stylesheets the page loads | `src/_data/toolStyles.json` (and a tool CSS file only if the shared vocabulary is not enough) |
| Supporting articles | entries in `assets/js/data/articles.js`, bodies in `assets/js/data/articles/<topic>/<slug>.js`, images (PNG and WebP) in `assets/Images/articles/` |
| Pinned expectations | `tests/unit/<id>-golden.test.mjs`, `tests/browser/<id>.spec.js`, the visual page list, DOM baselines, the regenerated URL inventory |

What happens **automatically** once a tool is published (review each, they are visible changes):
the page and its sitemap entry, its card becoming a link on the Loans, All Calculators and Categories
listings, its search results, related-tool and related-article lists on existing tools and articles in
its category (by fallback), and the Coming Soon card turning into a live one. Hand-written lists do
**not** change unless edited: the footer's tool links and the home page's featured tools.

## 1. Product specification (written and approved before code)

- Name, one-sentence purpose, target user, the problem solved, why it is worth building.
- Route (`/{section prefix}/{id}/`), section, category, subcategory (usually none), `toolType`.
- Inputs: label, unit, default, min, max, step, hint. Outputs: primary, secondary.
- Assumptions, stated in plain language, and shown on the page next to the results.
- Validation rules and messages. Empty, error and (if any) loading states.
- Formulas or algorithm, with **what must be verified** before the tool ships (section 2).
- Capabilities, declared **only if built** (`data/tool-capabilities.js`).
- Privacy: where input is processed (in the browser), what is stored (nothing unless approved).
- Accessibility and mobile behaviour. What is deliberately **not** in v1.

## 2. Logic

- A pure module, unit-testable without a browser; inputs validated at the edge, not inside formulas.
- **Golden tests**: expected values from an *independent* method (closed form, hand calculation or a
  second implementation), not from the code under test. Add invariants (monotonic, bounds, "zero
  input equals baseline"). Pin rounding: calculate unrounded, round only for display.
- Reuse existing logic (for example `formulas/loan.js`); do not copy it.

## 3. UI

- Build the page from `markup()` (pure, runs at build time) and bind it in `init()`.
- Use the shared primitives where they fit (`numberField`, `resultMetric`, `setFieldsInvalid`,
  `activateDialog`); keep validation rules, messages and layout in the tool.
- Every control labelled; hints and errors linked; visible focus; results in an `aria-live` region;
  scrolling tables in a labelled focusable region; reduced motion respected.
- Keep the tool's own CSS out of other tools' stylesheets.

## 4. Metadata and route

- Add the catalog entry: `status: "published"`, a literal `loader: () => import("...")`,
  `capabilities` (only true things), `seo` (unique title and description), `relatedTools`,
  `relatedArticles` (curated, strongest first). The route, section and link are derived.
- A pack never stores a route or a section on the tool.

## 5. SEO

- One primary tool page with problem-solving intent; one unique title and description; canonical on
  the production origin; breadcrumb structured data (the page already generates it).
- No pages for keyword variations. No structured data for content that is not visible.

## 6. Search and relationships

- Search derives from the catalog; verify the tool and its cluster rank sensibly for their own name and
  for the question they answer, and that Coming Soon items still behave.
- Set `article.tools` so the **first** entry is each article's primary tool. Keep `related` lists to
  2 to 4 targeted articles.

## 7. Article cluster

Follow `docs/content-clusters.md`: a brief per article, a distinct question each, real numbers computed
with the tool's logic, assumptions stated, the disclaimer framing for sensitive topics. Build now only
what is ready and verified; defer the rest explicitly.

## 8. Tests

- Unit: golden values, invariants, validation edges, catalog entry, relationships.
- Browser: calculate, validation, reset, keyboard, results text, error wiring, empty state, no
  duplicate ids, console clean; both deployment modes.
- Accessibility: labels, described-by, focus, modal behaviour if any.
- Visual: baselines for the new page (intentional, reviewed) and for listings that now show it.
- Update expectations that name the published set (they are intentional edits, not silent updates).

## 9. Build verification

- Regenerate the URL inventory (`npm run inventory:generate`) and review the diff: one new live page,
  one more sitemap URL, one fewer Coming Soon.
- Clean builds for **both** targets (root `/` and `/Toolzenhub/`); both pass the link, asset and SEO
  checks; canonicals on `https://toolzenhub.in`; the only output differences are the intended ones.
- Fingerprint the outputs before and after and explain every difference.

## 10. Localhost checklist

Run `npm run dev` and check in a browser, on desktop and a phone-width window:

- [ ] The new page loads, no console errors; header, breadcrumb (Home › Calculators › Loans › Tool), footer.
- [ ] Defaults give a sensible first result; change each input and see the result update correctly.
- [ ] Reset works; empty and error states read clearly; keyboard-only use works end to end.
- [ ] A screen-reader pass of one error and one result (or at minimum the accessibility tree).
- [ ] The results match a hand calculation for at least two scenarios.
- [ ] Related tools and articles appear and link correctly; the articles link back to the tool.
- [ ] Existing pages still look and behave the same (Home, EMI, Loan Comparison, the listings).
- [ ] The listing cards, search and categories show the tool as expected; Coming Soon items unchanged.

## 11. Commit checkpoint

Review `git status`, `git diff --stat` and every changed line; confirm nothing outside the pack
changed (formulas of other tools, other tools' behaviour, taxonomy, `SITE.origin`, workflow,
dependencies). One commit, one message describing the pack. Do not push from the pack.

## Pack definition of done

Spec approved - logic verified independently - page accessible and correct on desktop and mobile -
catalog, search and relationships consistent - articles meet the editorial standard - tests, builds and
localhost checklist pass - every difference in output explained - one local commit.
