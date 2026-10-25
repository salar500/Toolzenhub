# 16. Evidence and methodology

## Baseline

Branch `main`, HEAD `8ece03a` ("feat(pdf): implement coordinated PDF tool batch"), equal to `origin/main`, working tree clean before this review's files were added. Date of review: 2026-10-25. The latest GitHub Pages workflow run for `8ece03a` was `completed / success` (GitHub API listing seen during the preview check).

## Files and data read

`CLAUDE.md`; `docs/product-decision-rules.md` (sections 1 to 6, 12, 15 and 4.9); `docs/tool-pack-factory.md` (roadmap R1, R2, P1, P2); `docs/content-clusters.md` (relationships section); `docs/design-follow-ups.md`; `docs/shared-tool-ux.md` (headings only); `tests/README.md` (known issues, Lighthouse, when to update what); Tool Pack status lines 20, 23 to 30; `docs/tool-packs/32` (references) and `33` (references, ledger); `assets/js/data/{tools,categories,articles,relationships,taxonomy}.js`; every `assets/js/tools/*/index.js` (flags and neighbour links); `assets/js/vendor/pdf-lib/NOTICE.txt`; `tests/inventory/url-inventory.json`; test file names in `tests/unit` and `tests/browser`; built `dist-ghpages/` HTML for three pages and `sitemap.xml`; the owner's private memory notes about production state (World Clock release package, GSC counts, Gratuity). Those notes are not repository documents.

## Commands and checks

- `git fetch`, `git status`, `git log`, `git merge-base`.
- A throwaway Node script (outside the repository) imported the catalog modules with a stubbed `window` and `document` to list tools, sections, statuses and articles. Counts: 47 catalog entries, 36 published, 11 coming-soon; 40 article entries, 34 published, 6 coming-soon.
- One sequential `curl` sweep of all 89 URLs in the live inventory against `https://salar500.github.io/Toolzenhub` and `https://toolzenhub.in` (GET, status code only): 81 return 200 on both; 8 return 200 on the preview and 404 on production (Gratuity, Salary, World Clock, Photos to PDF, Merge PDF, Split PDF, Extract/Reorder/Rotate PDF Pages, `/pdf-tools.html`).
- `curl` of production `sitemap.xml` (81 URLs, none of the eight), `robots.txt` and `tools.html` (no mention of World Clock or Merge PDF).
- A `grep` and a data scan for related-section flags, neighbour links, hero images and Unsplash cards.

## Test evidence consulted (not re-run)

The PDF batch ledger in `docs/tool-packs/33-pdf-tools-batch.md` section 12 (unit 32, browser 40 per project, whole unit suite 2,957 with one known unrelated failure, portable subset 246). Per-tool pass results for other tools are in their specs and were not re-verified.

## Not done, and why

No browser test, no build, no Lighthouse, no screenshots, no screen-reader or device check: documentation-only scope and a low-memory machine. No external keyword, competitor, search-volume or GitHub research: none was authorized as necessary for a status review, and nothing was invented in its place. Article bodies were not read. Production page versions were not compared byte for byte. The tool pages' visual state was not inspected in this phase.

## Limits of the conclusions

A 200 status is not a version check. A test file existing is not a pass. Scores in 12 are judgment. Production state can change after 2026-10-25.
