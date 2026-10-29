# Pre-preview checkpoint (2026-10-29)

Scope: whether the combined 54-tool site is safe to publish to the GitHub Pages development preview. This is not production acceptance. Local only: nothing was pushed, deployed or uploaded, and production was not touched.

State at the start: branch `main`, HEAD `1bd59a1`, working tree clean, 38 commits ahead of `origin/main` (`0dc368b`). The Pages workflow (`.github/workflows/pages.yml`) builds and deploys on every push to `main` and runs no tests.

## Inventory (verified from the catalog and the build)

65 catalog entries: 54 published, 11 coming soon (no route exists for any of them). Published by section: Calculators 19, Time Tools 13, Developer Tools 17 (12 utilities plus the 5 Practice Labs and Flashcards tools), Image Tools 2, PDF Tools 3. Build: 108 pages at both bases, 107 sitemap URLs, production-origin canonicals.

## Verified in this checkpoint (system Chrome, subpath-desktop unless stated, one worker)

| Check | Result |
|---|---|
| Static: links, assets, SEO, inventory | pass |
| DOM baselines (16) | 15 pass, `tools-directory` failed, then passed after a verified baseline update |
| Shared consumers: smoke, links crawl, build, not-found, analytics, Developer Tools related, navigation (271 tests) | 265 pass, 4 fail, 2 skipped (mobile-only) |
| The 4 failures after correction (re-run alone) | 4 pass; also pass on subpath-mobile together with the Developer Tools related spec (23 pass) |
| Ecosystem smoke: EMI (Calculators), time-tools-new (Time Tools), json-csv (Developer Utilities), image-batch (Image), pdf-tools (PDF), smart-flashcards (Practice Labs and Flashcards) | 119 pass, 2 fail |
| Flashcards spec after the fix, desktop | 24 pass; mobile reset and Escape tests 2 pass |

Earlier-stage evidence reused and not re-run: the full unit suite (3,620 tests, 3,616 pass, 0 fail, 4 skipped, Stage 3), the Practice Labs mobile and width audits, and the axe scan of the five Practice Labs and Flashcards pages. The counts above are not added together.

## Findings and dispositions

| Finding | Class | Disposition |
|---|---|---|
| `tools-directory` DOM baseline: the Developer Tools section now shows 17 tools and five new cards (Smart Flashcards and the four labs). The earlier claim about the Image Compressor description could not be reproduced: the diff contains no such line. | STALE EXPECTATION | The new content is intended and was checked against the catalog. Baseline updated. |
| `links` crawl summary: six new pages and higher internal-link counts on `developer-tools.html` (+5), `tools.html` (+6), `calculators.html`, `investment.html` and four calculators (+1 to +2). Every extra link is a new tool card or a curated related link. No external host, dead fragment or other field changed. | STALE EXPECTATION | Baseline updated after a field-by-field diff. |
| `navigation.spec`: All Tools group count 35 and Developer Tools count 12 | STALE EXPECTATION (missed when the Practice Labs tools were added) | Pins now 40 and 17. |
| `navigation.spec`: Loan Comparison related cards expected Home Loan second | STALE EXPECTATION (curated lists were added deliberately in Calculators pack 49) | Order pinned to the curated list: EMI, Prepayment, Balance Transfer, then Home Loan and Credit Card Payoff. |
| Smart Flashcards reset dialog: the Escape handler and focus trap were attached after a dynamic module import, so Escape pressed in the first moments did nothing (failed once under load; passed 4 of 4 alone) | GENUINE DEFECT (Practice Labs pack 51) | The dialog helper is imported statically and activated at once. A same-task Escape test was added; it failed on the old build and passes now. |
| Split PDF `changing a setting or replacing the PDF...`: the last assertion expects the file input not to hold focus after Reset and a new file; it failed 3 of 4 repeats. Reset focuses the input on purpose, and the assertion passes only if the editable area was made inert while the file loaded, which makes it timing-dependent. Neither the code nor the test has changed since the PDF batch commit. | PRE-EXISTING, test relies on timing (cause inferred from code, not bisected) | Not changed. P2: decide whether the assertion should be removed or replaced by a deterministic one. |

## Release register

P0 (before preview): none confirmed.

P1 (before production, not attempted here): the combined desktop and mobile regression is still partial (this checkpoint is representative only); automated accessibility scans exist only for the Practice Labs and Flashcards pages; Loan Comparison slider target size (18 px); no screen-reader testing; Firefox, WebKit, iOS and real Android untested; Google Fonts and Unsplash requests; Gratuity ceiling and legal-source verification; PPF official-source reading; no second reviewer for the 163 learning items; no performance run on the new pages; production backup and release package.

P2: the Split PDF focus assertion above; five published tools have no related-tools list (`ppf`, `profit`, `margin`, `date-difference`, `image-compressor-resizer`); topic-level deck links not built; browser-side performance not measured; the vendored jsPDF contains a cdnjs URL string for an output mode this site never calls (no first-party use found).

Security spot checks (first-party code, outside `vendor/`): no `eval`, `new Function`, `document.write` or `outerHTML` assignment; `insertAdjacentHTML` is used in five tools for row markup, and the XIRR rows (the one that takes pasted values) escape their values; the only `fetch` is the PDF font loaded from the site itself; the analytics specification passes; the new modules make no network call.

Not run: Firefox, WebKit, real devices, screen readers, the root-base browser project, the visual projects, the full unit suite (not needed: no unit-tested module changed), Lighthouse.
