# Site-wide audit and release ledger

Owner prompt of 2026-11-08: "Ultimate autonomous development, improvement, testing and production master plan".

The ledger records findings, changes, test results and blockers, phase by phase. The scope is the whole site: 662 live pages and 1 × 404, from the URL inventory.

## Phase 1: audit (2026-11-08, branch `feature/unified-ecosystem-workspace`)

### Inventory

| Section | Pages |
|---|---|
| Practice Labs | 531 (530 learning pages and ShopLite) |
| Articles | 40 |
| Tools (`/tools/`) | 39 |
| Calculators | 30 |
| Home, directories, category pages, about, contact, legal and 404 | 22 |

Test infrastructure: 174 unit test files, 103 Playwright specs, and static checkers for links, assets, SEO and the URL inventory.

### Positive findings, preserved unchanged

- The architecture is a static Eleventy build with central routes, a base path per build, and per-page lazy-loaded engines.
- The site has a large, meaningful test base: 3,943 unit tests covering calculators, tools, labs, SEO and build output.
- Runtime is clean:
  - Every page loads without JavaScript errors or failed local requests, at 390 px and at 1280 px.
  - No page has horizontal overflow.
  - Every page shows its inventoried primary element.
- Links, assets and SEO metadata pass on all 663 pages once the checkers know the new page types (see below).

### Negative findings and what was done

| # | Finding | Kind | Action | Commit |
|---|---|---|---|---|
| 1 | URL inventory stale: Practice Labs pages missing, then classified as "unknown" | Test infrastructure | Classify `learn` and `practice-target` (ShopLite) pages; regenerate (662 live pages) | `6f58d21` |
| 2 | SEO check did not expect BreadcrumbList on learning pages | Test infrastructure | Expect it, so the visible breadcrumb is now validated against the structured data. ShopLite only has to be noindex | `6f58d21` |
| 3 | Asset check flagged simulated file names ("config.json") and runtime-resolved strings inside vendored Pyodide | False positives | Explicit per-file marker; static imports of vendored Pyodide are still checked | `6f58d21` |
| 4 | Production `.htaccess` had no MIME types for `.mjs` and `.wasm`, so Python lessons could fail on Apache/LiteSpeed | **Production defect** | Added AddType rules; build-output test requires them (red on the old build, green now) | `43ac51e` |
| 5 | `py-x-unique-sorted` was flaky: Python string-set order depends on hash randomisation | Test defect | Added a deterministic integer case | `43ac51e` |
| 6 | Directory test counted the workspace sidebar's links as category-grid links | Stale test (since 2026-11-07) | Scoped to the grid | `43ac51e` |
| 7 | Design-token test: two runtime-set rail variables, plus one undefined `--surface` in `learn.css` | 1 real (`--surface`), 2 documented | `--surface-card` used; rail variables documented | `43ac51e` |
| 8 | Workflow test allowed only `main`, while rule 11.3 allows one named development branch | Stale test | Encodes rule 11.3 | `43ac51e` |
| 9 | Analytics and stylesheet-order tests applied to ShopLite | Stale test | ShopLite asserted as untracked and outside the design system | `43ac51e` |
| 10 | SEO keyword map covered 131 of 662 pages | Stale generated document | Generator handles learning pages; regenerated; cannibalisation warnings 19 → 2 | `43ac51e` |
| 11 | Growth-manifest export check refuses off `main` (BRANCH_UNEXPECTED) | Intended guard | Not changed; it passes on `main` | none |

### Checks run in this phase

| Check | Result |
|---|---|
| `npm run test:static` | Inventory, links (33,387 anchors), assets and SEO all pass on 663 pages |
| Full unit suite | 3,943 tests: 3,929 pass, 10 fail, 4 skipped. Nine failures fixed and re-run green; one intended guard remains (#11) |
| Runtime crawl at 390 px and 1280 px | All 663 pages: no page errors, console errors, failed requests or overflow; primary element present everywhere |
| Production build (`dist/`) | Builds; the build-output test passes (17); `.htaccess` has the MIME rules; engine files present; no preview host except the intended GitHub "report a problem" links |
| Preview deployment | Confirmed serving `43ac51e` (changed files fetched from the live preview) |

### Not yet run (next phases, per the owner's order)

- The Playwright browser suite (103 specs across desktop, mobile and root projects).
- Visual regression and the accessibility suites.

These form the comprehensive regression (phase 8), which follows the owner's preview inspection (phases 6 and 7).

### Blocker for phase 10

There is no Hostinger access from this environment. Production is "manually controlled and intentionally disconnected from GitHub" (rule 11.4), and the owner has requested deployment in this prompt.

- What can be done here: a verified `dist/` artifact.
- What the owner must do: the upload, and a backup of the current site before it.

## Owner findings, 2026-11-09

| Finding | Change | Verification | Commit |
|---|---|---|---|
| Date Difference quick-date wording and placement | Quick dates under each input, named for their field; plain inclusive range labels; both counts in the result; whole periods under "More ranges" | presets spec rewritten (25 passed desktop, 25 mobile); date-difference spec 9 passed | `2e4345b` |
| Header disappears while scrolling | `overflow-x: clip` instead of `hidden` on html/body (sticky works again on the home page); below 960 px the header hides on scroll down and returns on scroll up; the phone tool bar follows it; rule GL-01 updated | new header-scroll spec (desktop 5 passed, mobile 6 passed); tablet spot check on 9 pages | `5fd2d87` |
| All Tools sidebar differs from the ecosystems | All Tools uses the shared section-switcher in the workspace layout; ordinary navigation (`data-workspace="off"`) | navigation spec 47 passed desktop; mobile 1 stale test fixed and re-run green | `a8b60cd` |
| Calculator results need scrolling | From 1200 px the 29 standard calculators show the form and the result side by side (both sidebar states); explanations span below | layout measured on 8 calculators: results start at y 319–405 instead of 727–1803 at 1280×800 | `f811fe5` |

### Calculator browser specs after the side-by-side change (desktop, one worker, 2026-11-09)

| Batch | Result |
|---|---|
| balance-transfer, cagr, credit-card-payoff, emi, fd | 124 passed, 1 failed (stale test, fixed, re-run green) |
| field-slider, gratuity-auto, gst, home-loan, income-tax | 117 passed |
| inflation-view, loan-comparison, loan-schedule-export, margin, percentage | 91 passed |
| ppf, prepayment, profit, risk-reward, salary-in-hand | 106 passed, 1 failed (stale test, fixed, re-run green) |
| section-switcher | 22 passed, 3 failed (stale tests, fixed; the 3 re-run green) |
| simple-calculators, sip, slider-calculation, swp, xirr, tool-controls | First run stopped for low memory at 187 of 192 (not counted). Full re-run in three chunks: **181 passed, 11 skipped, 0 failed** (192) |
| calculators-stage3-responsive, simple-calculators-a11y | 33 passed |

**Desktop total: 690 tests, 679 passed, 11 skipped, 0 failing** after the fixes below. The 11 skips are intended: slider tests on calculators that have no slider.

Mobile (`subpath-mobile`, one worker):

| Batch | Result |
|---|---|
| balance-transfer, cagr, credit-card-payoff, emi, fd | 124 passed, 1 failed (stale test, fixed, re-run green) |
| field-slider, gratuity-auto, gst, home-loan, income-tax | 117 passed |
| inflation-view, loan-comparison, loan-schedule-export, margin, percentage | 91 passed |
| ppf, prepayment, profit, risk-reward, salary-in-hand | 107 passed |
| section-switcher, simple-calculators, sip | 95 passed, 1 failed (racy test, fixed, re-run green) |
| slider-calculation, swp | 58 passed, 11 skipped |
| xirr, tool-controls, calculators-stage3-responsive, simple-calculators-a11y | 84 passed |

**Mobile total: 689 tests, 678 passed, 11 skipped, 0 failing** after the fixes.

Stale tests corrected (each re-run green). No product defect was found:

- Search tests looked for a tool link anywhere on All Tools, but the sidebar now lists every tool even when hidden. Scoped to `#tools-results` in 10 specs.
- Category-page counts included the workspace sidebar's link. Scoped to `.categories-detail__grid` in 5 specs.
- The section-switcher tests predate the overview and All Tools links in the sidebar, and the drawer moving focus to Close. Scoped to `.section-switcher__list` and the focus order updated (3 tests).
- Section pages (loans, investment, time-tools, developer-tools): link checks also matched the workspace sidebar's link. On a phone the first match was in the closed drawer; elsewhere the counts were 2. Scoped to `:not(.section-switcher a)` in 6 specs. The Countdown Timer test's ban on the word "timers" now excludes the sidebar's real "Timers and clocks" group heading.
- simple-calculators: Ratio and Interest read the live-updating result once, without waiting. They failed once under load and passed 3 of 3 alone. Now polled.
- swp: the scenarios were asserted as one row at 1280 px. With the result now beside the form they stack in one column. The test now asserts the side-by-side placement and the stacked order. Screenshot checked: readable, no overflow.

## Regression and fixes, 2026-11-09 (continued)

### Product defect: layout shift on the Calculators overview (`categories.html`)

- Found by `build.spec` ("the footer is not a layout-shift source and total CLS stays good"). The failure was deterministic: CLS **0.315** against a 0.1 limit.
- Cause: the breadcrumb was inserted by script into an empty element after first paint, which pushed the whole sidebar-and-content layout down 36 px.
- Fix: the template renders the breadcrumb (`src/categories.njk`), and the script leaves it alone when it is already there.
- Result: CLS **0.031**. The CLS tests pass 6 of 6 on desktop and 6 of 6 on mobile.
- Remaining, below the limit: the category cards are still inserted by script above the page search. Moving them into the template is a possible follow-up.

### Practice Labs workspaces (reviewed)

- One lesson with an editor was measured per learning path (21 paths) at 1280×800. Each exercise block is 540–880 px tall, with the task, editor, Run, and the "runs in your browser" note together, so an exercise fits about one screen.
- The lesson column's 780 px reading width (about 75 characters a line) is deliberate typography. It is kept, not redesigned (positive finding).

### Full Playwright regression, `subpath-desktop` (resumable, one spec at a time, one worker)

- Started. 10 of the 74 non-calculator specs are done: accessibility, analytics, articles, base64-encoder-decoder, base64url, build, contact, countdown-timer, cron-challenge-lab and cron-explainer.
- Results: 251 passed and 1 failed. The failure is the CLS defect above, now fixed.
- Since completed: see "Regression results" in the 2026-11-10 section below.

## Regression and fixes, 2026-11-10

Branch `feature/unified-ecosystem-workspace`. Every change is committed and pushed. `main` and Hostinger production are untouched.

### Product defects fixed (each with a check that fails without the fix)

| Defect | Commit |
|---|---|
| Calculators overview layout shift, CLS 0.315 → 0.031 | `11ce898` |
| Practice Labs accessibility: links that relied on colour, an empty table-header corner, ARIA on the terminal simulators, the ShopLite banner outside a landmark | `f3d4ace` |
| World Clock "Reset all" off-screen at 320 px after a long search | `b8fec7c` |
| **Wide result tables squeezed by the side-by-side layout** (9 calculators, columns hidden at 1280 px). Owner decision: the summary stays beside the inputs and the tables move to a full-width section below (rule in `docs/shared-tool-ux.md`) | `d741c28` |
| Tool pages had 0 px under the header from 761 to 999 px (section pages 20 px) | `72aa335` |
| Phone tool pages: focus and scroll targets could land under the sticky "Menu" tool bar (WCAG 2.4.11). The scroll padding now clears the header and the bar | `f1f9df5` |
| The wide-table container repeated the table's landmark name (axe landmark-unique); it is now a plain `div` | `7a9d8cd` |

Stale tests were corrected along the way (sidebar-duplicate links, D3 as replaced, rule 8 persistent workspace, the quick dates, GL-01 as updated, ShopLite without site chrome, phone drawer links). Each was re-run green; the commit messages give the details.

### Regression results (one worker, sequential)

| Suite | Result |
|---|---|
| Calculator specs, desktop / mobile | 690: 679 passed, 11 skipped / 689: 678 passed, 11 skipped. The 9 changed calculators were re-run after `d741c28`, all green |
| `calculator-wide-tables` (new, all 30 calculators at 1280) | 31 of 31 |
| Non-calculator specs, subpath-desktop | All run; every failure was fixed and re-run green |
| Non-calculator specs, subpath-mobile | 70 specs: 1,198 passed, 0 failed, 16 skipped (by design) |
| site-a11y (axe, 662 pages), desktop / mobile | 662 / 662 passed |
| smoke (all pages), desktop / mobile / root-desktop | 677 / 677 / 677 passed |
| site-tablet (662 pages), desktop / mobile | 662 / 662 passed |
| root-desktop, other @portable specs | 135 passed |
| visual-desktop / mobile / tablet | Re-recorded after review (35 / 35 / 19 images): 39 / 39 / 20 passed, 19 skipped on tablet by design |
| dom-baseline | 16 of 16 (3 regions re-recorded after review) |
| Unit suite (174 files) | 3,943 tests: 3,938 passed, 4 skipped, 1 failed. The failure is the intended growth-manifest guard that refuses to run off `main` (finding #11) |
| `npm run test:static` | Passes |
| Builds | `dist/` and `dist-ghpages/` rebuilt; build-output 17 of 17 |
| GitHub Pages preview | Serves `7a9d8cd` (changed files fetched from the live preview) |

### Link crawl, SEO baseline and World Clock (completed later on 2026-11-10)

Each of the two all-page specs runs as one test that takes more than 10 minutes, so it cannot finish in the foreground, and in the background the environment's low-memory guard stops it. They were therefore run in chunks of 190–370 pages (3–8 minutes each, one browser, in the foreground). Each chunk uses a copy of the spec's per-page code, unchanged. A merge step then ran the spec's end checks over all chunks: every distinct target answers 200, no orphans, the SEO must-hold facts, and the snapshot comparison. A first mobile chunk failed only because the laptop slept from 18:00 to 20:41 (Kernel-Power event 42). It was re-run in two smaller chunks.

| Check | Result |
|---|---|
| Rendered link crawl, subpath-desktop | 666 entries (662 pages + 4 search/filter variants), 662 distinct targets all 200, no orphans, **0 failures** after the fix below |
| Rendered link crawl, subpath-mobile | 666 entries, **0 failures** |
| Rendered link crawl, root-desktop | 666 entries, **0 failures** (no hard-coded `/Toolzenhub`) |
| SEO baseline (662 pages + the 404 page) | Must-hold facts (expected title, description over 20 characters, an H1) pass on every page after the fix below |
| `npm run test:static` after the fix | Passes on both builds (33,465 anchors, 663 pages) |

Found and fixed:

| Finding | Kind | Fix |
|---|---|---|
| The link crawl rejected `practice-labs/shoplite/?release=r-bugs-1`, linked from 4 Manual Testing lessons | Stale test. `?release=` is the documented ShopLite release switch (`docs/practice-labs/18-department-specifications.md`) | `links.spec.js` accepts a `release` query on links to ShopLite only, and only with a release that exists in ShopLite's `RELEASES`. A typo or unknown release still fails |
| ShopLite (`/practice-labs/shoplite/`, the one noindex page) had no meta description | Real gap, found by `seo-baseline` | A description in `src/shoplite.njk`. Nothing else on the page changed |

Snapshot reviews (both snapshots predated the 530 Practice Labs pages):

- **Links summary** (`tests/baselines/links/summary-subpath-desktop.json`):
  - 531 entries added, 0 removed. No new `#` placeholders and no new external hosts.
  - One recorded fragment: ShopLite's in-app screen `#/requirements`.
  - Existing pages have more internal links, which come from approved navigation (workspace sidebar, Practice Labs links): +2 on most tool and calculator pages, +4 to +32 on section pages, +70 on All Tools.
  - Re-recorded after review.
- **SEO baseline** (`tests/baselines/seo/seo-baseline-subpath-desktop.json`):
  - 531 entries added, 0 removed.
  - The 530 indexable Practice Labs pages each have a self-canonical `https://toolzenhub.in/…` URL, Open Graph, JSON-LD and an H1 in the raw HTML. No title or description is duplicated anywhere on the site.
  - On the 132 existing pages the only change is more visible text in the raw HTML (84 pages, from the statically rendered sidebar and breadcrumb). Titles, descriptions, canonicals, robots, Open Graph, JSON-LD and H1s are unchanged.
  - Re-recorded after review.

**World Clock phone intermittent: not reproduced, left unchanged.**

- **Failures recorded on 2026-11-10:**
  - `world-clock.spec.js:1548` at 360 px: "locator.scrollIntoViewIfNeeded: Test timeout of 45000ms exceeded".
  - Once, `:1638` at 360 px, a test with no scrollIntoViewIfNeeded.
  - Both happened during full runs while free memory was low.
- **Investigated:**
  - The tests take 4–5 s of their 45 s budget: 9 of 9 passed with `--repeat-each 3`.
  - One suspected cause was a stale list read after typing, since the search render is queued on an animation frame. It was ruled out. With every frame delayed by 1.5 s, the heading and the row counts still matched each new query when measured.
  - A full mobile run with traces kept on failure passed 87 of 87 (8.0 min).
- **Next step if it recurs:** read the kept trace. Nothing in the product or the test was changed.

### Open

- The growth-manifest unit guard fails off `main` by design (finding #11).
- Production (Hostinger, `toolzenhub.in`) is not deployed; it needs separate owner authorisation.

## Product transformation programme, from 2026-11-11

Owner instruction (2026-11-11): work autonomously through the whole programme (design system, shared navigation, the six ecosystems, Practice Labs, a seventh AI Tools ecosystem, content), one workstream at a time, publishing to the GitHub Pages preview only. The Pages workflow (`.github/workflows/pages.yml`) deploys every push of `feature/unified-ecosystem-workspace`, so a push is the publish step; `main` and Hostinger stay untouched.

### Batch 1: the three reported defects

| Report | Finding | Action |
|---|---|---|
| "Browse Tools" label invisible on hover | **Reproduced.** The hero's "Browse all tools" button: on hover its text and its background were both `#3730a3`. Root cause: the base rule `a:hover { color: var(--color-primary-dark) }` (specificity 0,1,1) outranks every single-class control that sets its own text colour (`.btn-primary`, `.footer__logo`, `.learn-button`, `.about-primary-button`). An audit of every visible link and button on 12 page types found the same fault on 6 controls (hero CTA, footer logo on every page, "Start lesson 1" on each learning path, "Explore All Categories" on About) | The hover rule is `a:where(:hover)` (zero specificity), and `.btn-primary:hover` states its text colour. Re-audit: 0 controls under 3:1 in default, hover or focus. 4 new browser tests fail without the fix |
| Logo and wordmark stack on phones | **Not reproduced** in Chrome at 320, 360 and 390 px on home, a calculator, a legal page, the directory, a lesson and a lab: the mark (36 px) and "ToolZen Hub" sit side by side in the header (and in the footer), and nothing overflows. The existing `home-brand` test keeps the brand under 60 px tall at 320 px | None. If it recurs, the device, browser and page are needed |
| Lesson numbers out of order (1, 2, 33, 31) | **Not reproduced.** A scan of all 531 built Practice Labs pages found every numbered list consecutive, and the lab tools' lesson lists are consecutive. Numbering comes from the curriculum's authored order (`flatLessons`), not from file names or ids | A unit test now guards it for every published path: numbers 1..N, each module starts where the previous ended, the previous/next chain is unbroken |

Also checked, no change needed: all 30 calculators recalculate on every input (a browser audit at 1280 and 390 px); only Credit Card Payoff waits for Calculate, by its own spec (`docs/tool-packs/24-credit-card-payoff.md`), which marks a stale result rather than showing figures the inputs were not calculated from.

Rule change: none.

### Batch 2: AI Tools, the seventh ecosystem (Tool Pack 56)

Built from the owner's brief: a section for people who already use ChatGPT, Claude, Gemini or Copilot, with no AI service, key or account. Spec: `docs/tool-packs/56-ai-tools-ecosystem.md`.

- **Tools:** AI Prompt Builder (`/tools/prompt-builder/`), Bug Report to Debugging Prompt (`/tools/bug-report-prompt/`), Project Context Pack Builder (`/tools/context-pack-builder/`). Each is a guided form whose brief is composed in the browser as the visitor types, with a clarity check (missing essentials, vague answers such as "etc", a completeness score stated as a check of the brief and not of the answer), an editable result, Copy, Download .md, Reset and a realistic example. One pure engine (`assets/js/tools/ai-tools/common/brief-engine.js`) and one shared page (`brief-tool.js`), as the simple calculators share theirs.
- **Section:** `ai-tools`, landing `/ai-tools.html` (generated), seventh home card ("3 tools"), All Tools, the section sidebar with one group, a `spark` icon. The hero sentence now lists "PDF and AI tools". Rulebook 4.11 records the section and its no-AI-service rule.
- **Verification:** unit `ai-tools.test.mjs` 15 of 15 (engine, check arithmetic, each example ready with no leaked value, section order, page labels and hint links, catalog); pinned expectations updated for seven sections, 73 tools and the three mutual related lists (`sections`, `sections-root`, `taxonomy`, `catalog`, `search`, `relationships`, `section-groups` all pass); browser `ai-tools.spec.js` 6 of 6 on subpath-desktop and subpath-mobile, 2 of 2 on root-desktop; `home-brand.spec.js` and `section-switcher.spec.js` pass on mobile (38); both builds clean; inventory +4 pages (666 live); link, asset and SEO checks pass on both builds; the three pages, the section page and the home card reviewed at 1280 and 390 px.
- **Defects found while building:** the Load example button's id collided with the prompt builder's "example" field (renamed `-load-example`); a select left at its first option counted as a filled field, so Reset left the form "incomplete" (the engine now treats the default choice as empty); the build also needs `render()` from a tool module.
- **Not done:** AI articles (deferred until the tools are reviewed on the preview); the other candidate departments (each needs its own engine, not a template of these); visual baselines for the new pages (added when the look is approved).

Rule change: rulebook 4.11 added (AI Tools section).

Published to the preview as `104831f`: the Pages run succeeded, and `/ai-tools.html` and the three tool pages answered 200 (new paths took about 15 minutes to appear after the deploy, a CDN cache of the earlier 404s; existing pages updated at once).

### Batch 3: AI Answer Evidence Checklist (second AI department)

- **Tool:** `/tools/ai-answer-checklist/`. Paste an assistant's answer and get what to check (every money figure, percentage, date, other figure, named source and absolute statement, each with how to check it), what the answer leaves out (source, assumption, date of the figures, limitation), the questions to put back to the assistant, and a first line set by what the answer is for. Pure engine `claim-engine.js` (sentence splitting that skips code, classification by word patterns); the page says it finds what to check and does not know what is true.
- **Verification:** `ai-tools.test.mjs` 19 of 19 (sentences, classify, the four gaps, the example and a general answer); pins updated (74 tools, the section's four tools, related lists now section-filled, "emi" ranking gains the second description that names Gemini); browser `ai-tools.spec.js` 7 of 7 desktop, 7 of 7 mobile, 2 of 2 root; both builds, inventory (667 live pages), link, asset and SEO checks pass; the page reviewed at 1280 px with the example loaded.
- **Wording fix found in review:** the shared page's paste line said "paste it as the first message" for every tool; a checklist is kept beside the answer instead, so the line is now tool-specific.

Rule change: none.

### Batch 4: the AI article category and the first three AI guides

- **Category:** `ai` ("AI") in `articleCategoryOrder`, named there because no calculator category stands behind it (the map now takes a name); the listing filter chip, the sidebar count (behind "more", as the eighth) and the `?category=ai` link follow from the data. Icon `spark`.
- **Articles (topic `ai`, text only, each leading to its tool):** "How to Write Instructions an AI Assistant Can Act On" (Prompt Builder), "How to Give an AI Assistant Your Project's Context" (Context Pack Builder), "How to Read an AI Answer Before You Trust It" (Evidence Checklist). Each answers one question, quotes no statistics, links the other two, and keeps the "nothing is sent or stored" framing.
- **Defect found by the link check:** an article's call-to-action built its link as `/calculators/<tool id>/` whatever the tool's section, so a guide for a section tool linked to a page that does not exist. The article model now carries the tool's own `href` from the catalog and the page uses it (`article-model.js`, `articleContent.js`); the static link check fails without the fix.
- **Verification:** `articles.test` 32, `taxonomy.test` 26, `search.test`, `relationships.test`, `ai-tools.test` all pass (pins: 43 articles, ids 41 to 43, counts with `ai: 3`, the AI guides' tools and related lists, the legacy registry at 43); browser `articles.spec.js` 58 of 58 on desktop (every article page and the listing: nine pages, the AI filter) and the AI subset on mobile; both builds; inventory 670 live pages; link, asset and SEO checks pass; an article and the AI listing reviewed at 1280 and 390 px.
- **Not done:** the other five AI articles of the brief (AI in software testing, reviewing AI-generated code, repeatable AI workflows, responsible use, common mistakes) wait for the tools they would lead to.
- **Crawl baselines refreshed (same day, chunked runs as on 2026-11-10):** rendered link crawl on subpath-desktop, 674 entries, 670 distinct targets all 200, no orphans, 0 failures; the links summary gains the 8 new pages (no placeholders, no fragments, no external hosts) and existing pages one internal link each (the articles sidebar's AI category and the footer's AI Tools). SEO baseline: must-hold facts pass on all 670 pages plus the 404 page; 8 entries added, each with a self-canonical production URL, Open Graph, JSON-LD and an H1 in the raw HTML; no duplicate title or description; the 661 existing pages changed only in raw visible text (+9 characters, the footer's new section link). Both snapshots re-recorded after review. Mobile and root crawls were not re-run (the per-page rules are shared; the desktop crawl is the one that is compared with the snapshot).

Rule change: none.

## Depth programme, from 2026-11-11 (second master brief)

Owner brief (2026-11-11, afternoon): seven ecosystems and no eighth; depth, guided controls instead of free text, competitor-informed decisions, autonomous batches published to the Pages preview; production stays a manual Hostinger step. **Conflict recorded, not acted on:** the brief names a primary green `#0b9f58` as the established brand colour; the repository's approved Design System 2.0 uses the indigo accent `#4338ca` and has no green token (`--color-brand-green` is an alias of the accent). The palette is unchanged until the owner decides; everything else proceeds.

### Batch 5: the Prompt Builder becomes guided (the brief's own example)

- **Kind of task** select (write, summarise, analyse, code, plan, ideas, rewrite, teach): choosing one writes suggested rules and success criteria into those fields **only when they are empty**, as a starting point the visitor edits; the task type opens the prompt's task line. The shared page gained the mechanism (`option.fill` on any select), so other brief tools can use it.
- **Tone**, **how much detail** and **which assistant** selects add requirement lines (a coding assistant gets "read the files I name; show the commands you run"). Essentials unchanged (what to produce, how you will judge it). Reset returns focus to the first essential.
- Verification: `ai-tools.test` 19 of 19 (the guided lines, every task type's suggestions); `ai-tools.spec` 8 of 8 desktop and mobile (suggestions fill empty fields only, the choices reach the prompt, reset clears them); both builds; static checks.

### Batch 6: Compare Two AI Answers (the brief's named example of real processing)

- **Tool:** `/tools/ai-answer-compare/`. Two answers to the same question; the comparison engine (`ai-tools/common/compare-engine.js`, pure) matches sentences by shared content words (stop words dropped, light stemming), flags matched pairs that conflict (different figures, or one negated), lists what only one answer says, each side's recommendation sentences, and an evidence profile per side (words, statements to check, sources, absolute and hedged wording, a stated limitation or assumption). "What to do next" turns the findings into questions for each assistant. The page says it does not know which answer is right and can miss a disagreement written in different words.
- **A limit found while writing the example:** a sentence that combines two points (a rate and the insurance limit) matches only one of the other side's sentences, so the second point looks like an omission. Recorded in the tool's FAQ; the example's answers were split into one point per sentence.
- **Verification:** `ai-tools.test` 23 of 23 (tokens, similarity, conflicts, the example's placements, every section, the identical-answers case); pins for 75 tools and the section's five; `ai-tools.spec` 9 of 9 desktop and mobile; both builds; inventory 671 live pages; link, asset and SEO checks.

### Batch 7: Meeting Notes to Action Plan (work and productivity)

- **Tool:** `/tools/meeting-notes-action-plan/`. Rough notes, one point per line, sorted by the notes engine (`ai-tools/common/notes-engine.js`, pure) into decisions, actions (owner from "@Name", "Name to/will", "owner:", "(Name)" or an attendee's name; due from "by Friday", "before 18 Nov", a date), open questions (a question mark decides first), risks and blockers, and unsorted notes; actions without an owner or a date are flagged rather than guessed. Output: the plan, a follow-up message to the attendees, or both, plus the one line to give an assistant to polish it. Nothing is invented: a line it cannot place stays under "Other notes".
- **Defects found while building:** a field key `output` collided with the page's own output text area id (renamed; a unit test now forbids any field key that matches a page id); "Agreed to…" was read as an owner named Agreed (verbs ending in -ed and a few common words are excluded); "Is the budget approved?" was read as a decision (a question mark now decides first).
- **Verification:** `ai-tools.test` 27 of 27; the section, catalog, search and relationship pins at 76 tools (131 tests); `ai-tools.spec` 10 of 10 desktop and mobile; both builds; inventory 672 live pages; link, asset and SEO checks.

### Next in the queue (assessed, not started)
- **Design-system and navigation audit** across the seven ecosystems at 390, 412, 820, 980 and 1280 px.
- **The remaining AI articles** follow their tools (above). The category work is done.
- **(Done in Batch 4) AI articles (eight in the brief).** Article categories are the Calculators categories (`articleCategories` in `data/articles.js` reads `data/categories.js`), so an AI cluster needs an article category first: `{ slug: "ai", name: "AI", icon }` in `articleCategoryOrder` (the map must take a name when no calculator category matches), `icons.js` FOR `ai`, and the category pins: `taxonomy.test` line 190 (slugs), `articles.test` (ids order, the PUBLISHED list, per-category counts, related counts), `search.test` (article count 40, the listing parity corpus), `links.spec` `CATEGORY_SLUGS` (the `?category=` allow-list), `articles.spec` (`PACK_TOOL` per topic, pagination 8 pages at 5 cards), `relationships.test` (article to tools: curated AI tools, no category fallback since the section has no category), then the links and SEO crawl baselines. Each article is a content module of the existing shape (introduction, takeaways, sections, example, bigger picture, considerations, FAQ; no image) with one distinct question and one primary AI tool. First three planned: writing instructions an assistant can act on (Prompt Builder), giving an assistant a project's context (Context Pack Builder), reading an AI answer before trusting it (Evidence Checklist).
- **Further AI departments** (comparison of two answers, meeting notes to action plan, workflow planner, skill-gap assessment): each needs its own engine; none is a template of the four built.
- **Design-system and navigation audit** across the seven ecosystems, then the ecosystem-by-ecosystem improvements of the brief.
