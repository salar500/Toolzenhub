# 10. Phase 2 development handoff

For Master Prompt 2, **only after the owner answers the one approval question in doc 09**. Nothing here is approved. If the answer limits the scope, build only that scope.

## Starting checkpoint (re-verify, do not trust this table)

`main` at `650aa44` (one commit ahead of `origin/main` `4716c48`), clean tree at the time of writing. Latest preview checkpoint `4716c48`. This documentation package is **uncommitted** (Phase 1 had no commit instruction); the Phase 2 session should read it, then commit it as the first, documentation-only commit if the owner allows. Run `git status` first; if unexpected changes exist, stop and report (rule 11.1). Check free RAM before any browser (rule 10.3).

## Read first

`docs/product-decision-rules.md` sections 10, 11 and 15, then docs 00 to 09 here, `docs/shared-tool-ux.md`, `docs/tool-pack-factory.md` (before N1), `docs/ecosystem-review/practice-labs/` 09, 11, 18 (before U8), and the UI/UX ledger and P0 matrix (to avoid re-opening settled design work).

## Order of work and test plan (risk-based; one worker; one project at a time)

| Stage | Work | Verification (smallest that covers the named risk) |
|---|---|---|
| 0 | Browser trace of Home, All Tools, one calculator, one PDF tool, one lab (cold and warm, throttled mobile and desktop); one rendered screenshot of search focus on All Tools and Home; field inventory of calculator numeric inputs; gratuity primary-source check; SQL spike if O-3 | Record results in a new ledger; no product code |
| 1 | U1 directory item, U2 search component, U3 date guidance, U4 presets, U5 gratuity default, U6 Featured | U4 and U5: pure-module tests with the independent vectors in doc 07. U1, U2: affected specs (navigation, search, directory) and a visual review of changed baselines by eye; shared change, so verify through consumers now. U3: static check plus owner device pass (NOT RUN until done) |
| 2 | U7 images and SVG diagrams; selected guides | Static checks (links, assets, SEO, sitemap), diagram numbers reproduced independently, visual review at 320, 390, desktop |
| 3 | N1 Risk-Reward calculator | Spec first; pure module with hand-computed vectors and a second implementation; focused browser journey; catalog, search, sitemap checks |
| 4 | U8 hub page (only if O-1 = P1) | Link crawl for the hub, search aliases in both directions, no URL change on the five pages |
| 5 | SQL vertical (only if spike passes and O-3 extended) | Content validation against a second engine or hand-written expected result sets; worker time-limit test |

Do not run a full regression after each stage (rule 10.2). A consolidated checkpoint is for Master Prompt 3. Never update a baseline without viewing the changed image.

## Constraints that carry over

Preserve all 54 tool URLs and 34 article URLs; no duplicate catalog records; no coming-soon item routed or counted as published; no analytics call from tool code; no external request; canonical on `toolzenhub.in`; every rule change named in the final report (or "none"); no push, no deployment, no Hostinger. Ledger: create `docs/ecosystem-review/universal-expansion/11-DEVELOPMENT-LEDGER.md` in Stage 0 and keep it as the one progress record.

## Known facts that save time

- Search components: `assets/css/components/search.css`, `search-field.css`, `assets/css/base/accessibility.css` (focus list), plus per-page search CSS (`categories-search`, `calculators-search`, `loans-search`, article search). Search data: `assets/js/data/search-index.js`, `utils/search.js`.
- Directory markup comes from `assets/js/pages/directory/` and `src/_data/directory.js`; the built All Tools page is `dist/tools.html` (rebuild only when built output must change; stop the scratch server first).
- Featured list: `assets/js/components/categories.js`, constant `FEATURED_TOOLS`.
- Date tools: `assets/js/tools/date-difference/` (`date-engine.js` is the engine), `date-calculator/`, shared `time-ui/`.
- Gratuity: `assets/js/calculators/gratuity/` (employee types, `RULES_CHECKED_ON`, `EMPLOYEE_TYPES`).
- Loan Comparison sliders: `loans/loan-comparison/components/LoanCard.js`, CSS `assets/css/calculators/loan/03-form-fields.css`.
- Learning engine: `assets/js/learning/`; labs in `assets/js/tools/*-lab`, `smart-flashcards`; ledger `docs/tool-packs/practice-labs-ecosystem-1-0-ledger.md`.
- Report issue: `assets/js/components/report-issue.js`; Contact page `src/contact.njk`, handler `assets/js/pages/contact.js` (sends nothing).
- Catalog scripts for counts: a Node import of `assets/js/data/*.js` needs a `window` stub (routes read `window.location`); the scratch dump script exists only in the session scratchpad.

## Stop conditions

Stop and consolidate into one decision package if: a gate fails (spike, legal re-verification), a rule change beyond those named is needed, a push or deployment would be needed to test (rule 10.3 runner), or an existing tool's behaviour would have to change. Otherwise continue without routine questions.

## Report required at the end of Phase 2

The 15 items in Master Prompt 2 section 18, ending with exactly one next action, then stop.
