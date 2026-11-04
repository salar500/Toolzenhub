# Test strategy (quality engineering view)

Authority: `docs/product-decision-rules.md` section 10 (testing policy) and `tests/README.md` (layers and commands). This file only adds the scope model and the evidence rules used by the quality records in this folder; it restates no rule.

## Scopes

| Scope | When | What runs |
|---|---|---|
| A. Change-level | Ordinary change | The changed tool or page, its direct consumers, affected shared components. Nothing unrelated. |
| B. Impact-based | Shared code changed (navigation, registry, shared inputs or sliders, search, file processing, shared styling, routing) | The actual consumers of that shared code, found by grep of the import or the catalog, not every tool. |
| C. Full regression | A deliberate release checkpoint, owner-approved (rule 10.12, 10.13) | The scenario catalogue in `MASTER_REGRESSION_CATALOG.md`, one Playwright project at a time, one worker. |

## Layers, cheapest first

1. Static: `npm run test:static` (links, assets, SEO, inventory) after `npm run build:all`. About 3 minutes here.
2. Unit (`node --test tests/unit/`): formulas with independent golden values, catalog, search, relationships. About 6 minutes for the full suite; run only the touched files in scope A.
3. Browser (`npx playwright test --project=<one> --workers=1 <spec>`): per tool journeys, axe, widths 320/390/820/1280.
4. Visual and Lighthouse: only for changed surfaces; baselines are reviewed edits (rule 10.5).
5. Manual: appearance, clarity, audibility, real devices. See `MANUAL_QA_GUIDE.md`.

## Evidence rules

- Every execution is recorded in `TEST_EXECUTION_LEDGER.md` with the commit it ran against. A result for an older commit is "carried forward" and says so; it is never described as a result for the current commit.
- Carried-forward evidence stays valid while the code it covers is unchanged. It is invalidated by a change to that code or to a shared dependency of it.
- Expected calculation values come from an independent reference (hand derivation, the Python fixtures in `tests/fixtures/`, or a validated oracle), never from the code under test.
- Interrupted runs are recorded as interrupted with the exact remaining list; they are not passes or failures.
- A stale expectation is corrected only after checking it against the new truth and is logged as such, never weakened to go green.

## Low-RAM execution

Check free memory once before a heavy step (above 1 GB proceed, 700 MB to 1 GB small batches, below that defer builds). Look for stale `node`/`chrome` processes before browser work and end only confirmed stale ones. Never run two browser suites at once; the orphaned wrapper in QC-6 is the reason.

## Gaps this strategy cannot close

Real Android and iOS devices, Safari/WebKit, Firefox, screen readers, perceived audio and animation quality, and anything that needs the live Hostinger site. These stay manual and are reported as unverified until a person does them.
