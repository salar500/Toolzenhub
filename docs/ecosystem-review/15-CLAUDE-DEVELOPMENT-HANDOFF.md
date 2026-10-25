# 15. Development handoff

A short guide for future sessions. It points to the owners of each rule and does not restate them. If this file conflicts with `docs/product-decision-rules.md`, the rulebook wins.

## Read first, and only these

1. `CLAUDE.md`, then `docs/product-decision-rules.md` (sections 10, 11, 15 at least) and `docs/tool-pack-factory.md`.
2. This folder: `00` (state) and `01` (inventory), then only the ecosystem file for the section you touch (03 to 07) and `14` (open decisions).
3. The tool's spec in `docs/tool-packs/`. Do not repeat a portfolio audit: update the status rows in `01` and the relevant ecosystem file when you finish.

## Sources of truth

| Question | Source |
|---|---|
| What exists | `assets/js/data/tools.js`, `categories.js`, `articles.js`; live URLs in `tests/inventory/url-inventory.json` |
| What is approved | The rulebook, the factory, each Tool Pack's status and decisions, and explicit owner statements recorded in them. A proposal, roadmap row or prompt is not approval |
| What is released | The owner's manual production steps; check production with a GET, never by assumption. As of 2026-10-25 seven tools and `/pdf-tools.html` return 404 on production |

## Do not include in any production package (documentation, 2026-10-25)

Gratuity Calculator (`gratuity`) and Salary / CTC to In-Hand (`salary-in-hand`): built and on the preview, release NOT approved (specs 29 and 30). World Clock, Photos to PDF and the PDF Tools section are built but also not on production; each needs the owner's explicit release decision. Check this list and the specs before preparing any upload. Releasing any of them is the owner's decision (14, P1).

## Boundaries (summary of rulebook rules)

- One section per tool; related lists never cross sections (4.2). A new section needs owner approval (4.7). Related-tools display on non-calculator tools is an approved direction, not built (4.8).
- Browser-local processing claims must be narrow and true; never weaken privacy or security (3.4, 8).
- Do not rebuild or restyle existing tools to make an architecture look cleaner; preserve URLs, ids and results.
- Rule-dependent facts (tax, legal) need dated authoritative sources before any calculation ships (3.6, 8).

## When a tool is added (checklist learned from the PDF batch)

Catalog entry, section data and route if a section is new, `src/_data/toolStyles.json`, the Growth ledger records, the inventory generator and regenerated `url-inventory.json`, and the pinned tests (catalog, sections, relationships, search, taxonomy, taxonomy-root, tool-capabilities) plus the DOM, SEO, links and visual baselines. Add curated relations by id inside the same section. Restate the colour of every link-styled button for all states (a shared link colour beat a single-class rule once). Non-calculator modules export `showRelatedCalculators = false` and `showRelatedArticles = false` unless the related-tools pilot has changed that.

## Testing rules

Risk-based and focused (rulebook 10): unit tests for pure logic with an independent oracle where correctness matters, then one coordinated browser pass for the batch. One worker, zero retries, sequential commands. No full-site regression and no Lighthouse unless authorized. Full-suite known failure to expect: the `design-tokens` colour test on `calculators/gratuity.css`. Growth manifest `export.mjs --check` compares to `HEAD`, so run it after committing. Device, Safari and screen-reader checks are the portfolio checkpoint's job.

## Low-memory laptop (about 4 GB)

Sequential commands; run `node --test` on single files instead of `npm run test:unit` (that triggers a full build); avoid parallel browsers, repeated clean builds and large fixtures. On Windows Git Bash very long heredocs can break; write long files with the editor tool.

## Git and release boundaries

Local commits for approved work after checks pass. No push to `main` without approval for that push; GitHub Pages is the dev preview; Hostinger production (`toolzenhub.in`) is never touched. No force-push, no history rewriting. Commit messages end with the attribution line in the session's system reminder.

## Approvals

The owner approves: roadmap and scope changes, new sections or URL policy, shared-architecture changes, privacy or legal assumptions, new dependencies with licence obligations, costs, pushes and deployments. Claude decides routine engineering inside an approved scope. Record approved durable decisions in the owning document in the same phase and report rule changes (or "none") in the final report (rulebook 15).

## Status vocabulary

Use the A to G codes in `01` and say IMPLEMENTED, LOCALLY VERIFIED, BROWSER VERIFIED, DEVICE ACCEPTED, PREVIEW RELEASED, PRODUCTION RELEASED. Never claim a higher level without evidence.
