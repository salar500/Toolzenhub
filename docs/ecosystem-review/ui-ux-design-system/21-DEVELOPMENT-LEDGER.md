# 21 UI/UX development ledger

UI/UX Design System 2.0, Master Prompt 2 (design and development). This is the **one** development ledger. Documents 01 to 20 are the approved research and are not rewritten; where this ledger records a deviation, it says so.

**Authority:** owner approval of Design C recorded in `20-CONSOLIDATED-OWNER-APPROVAL.md` (2026-10-29); rules 1.10 and 4.8 in `docs/product-decision-rules.md`. Local commits are authorised; **no push, pull request, deployment, Hostinger or production change is authorised.**

**Baseline:** research package committed as `9715f6b` on top of `0c2ffe9`. Protected-path gate: `node scripts/ui-protected-paths.mjs` (QA-08), base `0c2ffe9`.

## Milestone order used

Doc 18's dependency order is followed (the prompt's list is the same ten areas in a different order): UI-0 tokens, UI-1 brand, UI-2 shared components, UI-3 header/footer/menu, UI-4 homepage/All Tools/404, UI-5 calculators and Time Tools, UI-6 Developer Tools/labs/flashcards, UI-7 Image and PDF, UI-8 articles and information pages, UI-9 integration.

## Verdict key

GREEN implemented and verified within the stated local evidence scope. AMBER implemented, significant verification gaps remain. RED significant known defect. BLOCKED cannot proceed safely. **Local development complete is not production release accepted.**

## Entries

(Milestone entries are appended below, one per milestone, as each is committed.)

### UI-0 Token foundation, with colour application and self-hosted Inter — GREEN (local scope)

- **Scope.** `base/variables.css` rewritten: semantic tokens (Design C values from doc 05), the older names kept as compatibility aliases pointing at them, type/spacing/radius/shadow/layout/motion scales, breakpoints 640/960/1280 and widths 720/1120/1440 written down. Colour literals across 65 shared and tool stylesheets mapped to tokens (greys to warm neutrals, brand greens to accent or ink, blues to accent, the three status families to the state tokens, form-control borders to the 3:1 `--line-control`, decorative borders to `--line`). Selected and pressed states re-pointed from the success tint to the accent tint (43 rules). Semantic state meaning (success, error, warning) is preserved.
- **Deviation from doc 18.** UI-0 was planned as "no visible change". Because every legacy colour was already a token or a literal, the palette was applied here, so UI-0 and the colour part of UI-1 are one commit. Header, hero art and footer layout are unchanged until their milestones.
- **Requirements.** BR-01, BR-09 (colour part), BR-04 (font part), QA-03 (baseline), QA-08 (gate script). Font condition (owner item 2/BR-04.3): Inter, SIL OFL 1.1 (`assets/fonts/OFL.txt`, no Reserved Font Name), subset made with fontTools (optical size pinned at 14, weights 400 to 700, Basic Latin, Latin-1, punctuation, euro, ₹ U+20B9), **27,136 bytes** against the 70 KB budget, rupee glyph present in the file; metric-matched `Inter Fallback`. All `fonts.googleapis.com` links removed from 9 templates, two data files and `base.njk` (the standalone 404 page keeps its own until UI-4). The `fonts` flag in the data files is now inert. Font tool: `pip install brotli` once, outside the repository (a build-time tool, not a project dependency).
- **Files.** `assets/css/**` (65 files), `assets/fonts/`, 9 `src/*.njk`, `src/_data/{toolStyles,articleStyles}.json`, `src/_includes/layouts/base.njk`, `assets/js/data/tools.js` (theme colour only), `assets/js/pages/categories.js` (one inline colour to a token), `scripts/ui-protected-paths.mjs`, tests `design-tokens`, `button-contrast`, `tool-catalog`.
- **Shared consumers.** Every page. Theme-colour meta is now the page colour `#fafaf9`.
- **Tests.** Unit suite run once in full: 4 failures, all classified and cleared: (1) `build-output` — my README in `assets/fonts` shipped to `dist` (genuine, own defect; README removed, notes live here); (2) `tool-catalog` EMI theme colour — stale expectation, intentionally changed; (3) `time-zone` "fast" timing — environmental/resource (passes alone, 53/53). Re-run after rebuild: design-tokens, button-contrast, tool-catalog, build-output, time-zone all pass. Protected-path gate: 2 changed JS files, both allow-listed (presentation), 0 flagged.
- **Visual review.** Home, EMI, JSON Formatter at 1280 viewed: indigo accent, ink headings, Inter loaded locally, zero third-party font requests (Unsplash photos remain until UI-4), no horizontal overflow. Selected states initially rendered mint (the old success tint doubled as the selected tint): found by eye, fixed by the 43-rule re-point.
- **Performance (CSS gzip, local, `scripts` measure; before = `0c2ffe9` preview build).** Home 24.8 to 26.4 KB, All Tools 17.9 to 19.5, EMI 22.9 to 24.6, JSON 23.5 to 25.2, World Clock 25.9 to 27.5, Article 13.8 to 15.6, Privacy 6.7 to 8.4. Increase 1.6 to 1.8 KB per page (the alias layer), within the +10% budget on the large pages; the Privacy page is +25% in relative terms (+1.7 KB absolute). Plus 27 KB font, minus the Google Fonts CSS request and two preconnects. LCP/CLS not measured.
- **Known gaps.** Component contrast is not yet measured on built components (QA-01.3, due at UI-2 and UI-9). Hero gradient `#eef8f5` and a text-diff "added" highlight keep a green tint by design/until UI-4. Legacy `/loans` page styles remain until their consumers are reviewed.
- **Remaining risk.** Baseline screenshots are expected to differ site-wide; they are reviewed and regenerated per milestone, not blindly.
- **Local commit.** see git log (UI-0).
