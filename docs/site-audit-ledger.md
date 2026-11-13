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

### Batch 8: responsive audit at the brief's five widths, and the first fixes

A script measured 17 page types (home, All Tools, the AI section, two calculators, a developer, a PDF, an image, two time tools, an AI tool, the SQL lab, the Practice Labs home, a lesson, the articles listing, an article, About) at 390, 412, 820, 980 (desktop site on a phone) and 1280 px: horizontal overflow, controls under 36 px, text under 13 px, where the primary result sits.

- **No horizontal overflow** on any page at any width.
- **Touch targets, fixed:** the SQL lab's exercise chips (46 at 30 px), the Practice Labs home's path and lesson links (48 at 20 px), All Tools' "more" links and the articles sidebar's "More categories" button are 44 px rows on touch screens (`pointer: coarse`) and unchanged with a mouse. Re-measured at 390 px: 0 small controls left on those pages except the four article-card title links inside their cards (the card is the target).
- **Results far down a phone, fixed for the AI tools:** the Prompt Builder's brief began about 2,500 px down a 390 px screen. The shared "jump" link the calculators use now precedes every brief tool's form on phones ("Jump to the prompt"), hidden from 960 px where the brief is beside the form; it lands focus on the brief.
- **Helper text at 12 px** (the `--font-xs` token: form hints, eyebrows, card counts, article filters, the sidebar's section label) is recorded, not changed: raising the token to 13 px touches most visual baselines and is a design-system decision to take in one reviewed batch.
- Verification: the probe at 390 px after the fix; `ai-tools.spec` 10 of 10 on mobile with the phone test extended (jump link visible, focus lands, hidden at 1280); `ai-tools.spec` and `lab-workspace.spec` 19 of 19 on desktop; both builds; static checks.

### Batch 9: the phone "jump to result" link on every tool whose result follows a form

- Measured at 390 px across all `/tools/` pages: six time and schedule tools have a result section one to three screens down (Date Calculator 1,233 px, Time Duration 1,107, Business Days 1,610, Shift Planner 1,628, Date Difference 1,742, Meeting Planner 2,523) and had no link. `tool-mount.js` now adds the shared link for any tool with such a section, not only the calculators; a brief tool's own labelled link comes first and the shared call then does nothing.
- Verification: the probe shows the link on all six; the six time-tool specs pass on mobile (91 of 91); the two mobile visual baselines that include the page top (Date Difference, Date Calculator) were reviewed by eye (the link above the form, everything else shifted down) and re-recorded; both builds.

### Batch 10: helper text from 12 to 13 px, one isolated batch

- The `--font-xs` token is 0.8125rem (13 px), and 41 rules in the 15 shared stylesheets that hard-coded 12 px for readable text now use the token: form hints, errors and slider labels, result descriptions, summaries and metric labels, card and listing descriptions, "read time" and meta lines, the article filter buttons, pagination, the articles sidebar's items, the search inputs that were 12 px, "View all" links, the lesson pager's labels, the section switcher's hide button. Uppercase eyebrows, counts, badges and chips stay at 12 px by design (they are labels, not reading text), and the per-calculator stylesheets were not touched.
- Review: the emi, articles and home pages at 390 px compared against their previous screenshots; the text is larger, nothing shifts out of place, no line wraps badly. Visual baselines re-recorded for the three projects after that review (38 of 39 mobile images changed, the header subtitle being on every page).

### Batch 11: Developer Tools, guided controls

- **Audit first:** a script counted each of the 12 tools' controls. All already offer an example (or a "now" action), mode radios or option checkboxes where a choice exists, copy and reset; the free-text fields that remained were the JSONPath query and the UUID count.
- **JSONPath Tester:** six "common queries" chips under the query field (authors, all prices, the first book, the cheap books, the last book, books with an ISBN), each valid RFC 9535; a click runs at once, and fills an empty document with the example so the click always shows something, while a document of the visitor's own is kept.
- **UUID Generator:** quick-count chips (1, 5, 10, 25, 100) that generate at once with the chosen version and format; typing a count still works.
- Verification: `jsonpath-tester.spec` 23 and `uuid-generator.spec` 15 on desktop (new tests for both chips; the keyboard-order test now walks the chips), both specs on mobile (38), both builds, static checks.

### Batch 12: PDF Tools, quick picks for page selection

- **Audit first:** after a file is chosen, Split PDF has a mode choice with a free-text "pages in each part" and a free-text range list; Extract, Reorder and Rotate has a free-text "pages to keep", a select for the turn and a free-text "pages to turn". Merge PDF and PDF Marks already use lists, selects and previews (not changed).
- **Shared helper** `setPresetChips` (pdf-shared/pdf-page.js) and `.pt-chip` styles (36 px, 44 px on coarse pointers): a chip writes its value into the box and fires `input`, so the existing validation and plan preview run unchanged.
- **Split PDF:** sizes that fit the file (1, 2, 5, plus "Half"); ranges "Two halves", "First page, then the rest", "The rest, then last page".
- **Extract, Reorder and Rotate:** keep list "All pages", "Odd pages", "Even pages", "Reverse order", "Without the first page", "Without the last page"; pages to turn "First page", "Last page", "Odd pages", "Even pages", "All pages". Chips are built from the chosen file's page count and appear only with a file.
- Verification: `pdf-tools.spec` 42 of 42 on desktop and on mobile (two new tests); preview build. Rule change: none.

### Batch 13: Image Tools, guided controls

- **Audit first (source and controls):** Image Compressor & Resizer already had size presets, a locked aspect ratio, a format select, quality preset radios, and a ratio select for cropping; Photos to PDF has only selects (page size, direction, margin). The one remaining typed field in the common path was "Up to (KB)".
- **Change:** chips 100 KB, 200 KB, 500 KB and 1 MB under that field; a click writes the value and fires `input`, so validation and the stale-result marking run as if typed. Photos to PDF unchanged.
- **Stale pin fixed:** `image-compressor-resizer.spec` still expected six sections on All Tools; it now lists AI Tools (6 tools), a consequence of the AI ecosystem, not of this batch.
- Verification: image spec 50 of 50 desktop run (two failures were my test's number format and that stale pin; both fixed, re-run 2 of 2), 51 of 51 on mobile; preview build. Rule change: none.

### Batch 14: light and dark theme (website-wide)

- **Why now:** the owner's master brief asks for a real light and dark theme with persistence; the design-system review (BR-08) had deferred it for baseline cost and rulebook item 7. The owner's brief is the approval; the rule change is recorded in `docs/product-decision-rules.md` section on defaults (item 7): only the word "light" or "dark" is kept (`tz-theme`), and only after the visitor presses the toggle.
- **Foundation:** the colour tokens already existed, so the work was tokenising literals: about 180 plain white backgrounds, white borders, gradient ends, white text on action fills (now `--on-action`, identical in light) and three page-scoped `*-white` aliases moved to `--surface-card`; a handful of neutral literals (greys, warning and accent lines, time-tool day/night cells) moved to tokens. Light pixels are intended to be unchanged (verified by the visual baselines below).
- **Dark set:** `:root[data-theme="dark"]` in `variables.css`: warm stone surfaces, light action fill with dark text, lighter indigo accent, light-on-dark state colours.
- **Delivery:** an inline script in `layouts/base.njk` sets the theme before first paint (saved choice, else the device); header toggle (moon/sun, 44 px, `aria-label` names the next action, `aria-pressed`) in `components/header.js` and `ui/theme.js`; on desktop the toggle sits at the right of the menu, on phones beside the menu button.
- **Audit:** a script flagged elements keeping a light background or low contrast text in dark across 11 page types at 1280 and 390; after the fixes only intended light action fills and disabled buttons remain. Looked at: home, JSON Formatter, Articles (390), Merge PDF (390).
- **Recorded, not changed:** the home hero illustration and article images keep their light artwork in dark; ShopLite (a simulated shop in a lab) keeps its own `prefers-color-scheme` rule; the loans hero illustration keeps its navy and gold artwork; the footer was already a dark band.

- **Verification:** `theme.spec` 6 of 6 on desktop (new: default from the device, toggle and reload, keyboard, dark text contrast of at least 4.5 on three page types, a dark device with a saved light choice, 44 px target on a phone); visual baselines 39 of 39 on desktop and 39 of 39 on mobile pass unchanged (the toggle is inside the 0.5 percent pixel tolerance of full-page images, so no baseline was rewritten); both builds clean.
- **Not run (memory):** a background re-record of the three visual projects was stopped by the system for low memory and was not restarted; it had changed no file. NOT RUN: visual tablet, the other header-dependent browser specs (home-brand, section-switcher, header and drawer specs) on the new toggle, mobile `theme.spec`, root project, and a dark visual baseline set (dark is audited by script and by eye only).
- **Known failing, found by running the whole unit suite for the first time since batch 4 (3,971 tests, 3,950 pass, 17 fail; none caused by this batch):** the AI Tools ecosystem had never been added to the Growth manifest records or some old pins. See Batch 15.

### Batch 15: pins and the identity ledger for the AI ecosystem

- **Pushed and verified first:** `8cf8fa4` (theme plus the navigation pin fix) deployed; on the live preview the theme follows the device (light and dark), the toggle switches and keeps its choice across a reload, on four page types in each theme. Local checks before the push: `home-brand` 8, `navigation` 47 (desktop; 5 stale "six sections" pins updated to seven sections and 52 directory groups), `section-switcher` 25, `header-scroll` 6 (2 skipped by design), mobile `navigation` 46 (3 skipped), `home-brand` 8, `theme` 6; visual tablet 20 (19 skipped).
- **Identity ledger:** the six AI tools (provenance `added`, module `assets/js/tools/<id>/index.js`) and articles 41 to 43 (provenance `allocated`, keys `ai/...`) recorded; `nextArticleId` 44; written with the ledger's own serializer. The "every article is history-verified" pin is now exact rather than loose: ids 1 to 40 must be `history-verified`, later ids `allocated` (the documented rule). `growth-manifest-ledger` 51 of 52 pass.
- **Capability pin:** `tool-capabilities` now lists the six AI tools among the non-calculator tools (24 of 24 pass).
- **Still failing, not changed:** the manifest export refuses articles 41 to 43 because the independent validator requires every article to carry a taxonomy category, and "ai" is an article category with no taxonomy category (the AI section is categoryless by design). A fallback that took the section from the article's primary tool fixed the mapper but not the validator, so it was reverted: loosening the consumer's contract is not mine to do. The options are a taxonomy category under the AI Tools section (it changes the sidebar and listings) or a validator rule for categoryless sections; it needs an owner decision. The dependent export, registry and sections tests fail for the same reason. The `check` mode test also refuses on any branch but `main` (environmental).

### Batch 16: home-loan interest article (search-led)

- **Evidence used:** the Search Console figures recorded in the owner's brief (Oct 5 to Nov 1, 2026: "how to reduce home loan interest" 35 impressions, "...interest rate" 17, "...emi" 16, "how to save interest on home loan" 14; the article 161 impressions, no clicks). No live Search Console access exists in this session, so these are not re-checked.
- **Gap found:** the article was five generic paragraphs with no numbers, no balance transfer or rate negotiation, and no answer for "reduce EMI".
- **Rewritten body** (same URL, title, description, hero, related articles and tools): how monthly interest works, tenure, part-prepayment, reduce-tenure versus reduce-EMI, extra monthly payment, rate negotiation and balance transfer with costs, comparing before borrowing, a five-way worked example and seven FAQs including "how can I reduce my home loan EMI". Worked numbers for a ₹40 lakh, 8.5%, 20-year loan were computed with the standard reducing-balance formula (EMI about ₹34,700, interest about ₹43.3 lakh; 15 years about ₹30.9 lakh; ₹2 lakh prepayment after 36 EMIs keeps EMI about ₹37.5 lakh interest or lowers EMI about ₹41.5 lakh; ₹5,000 extra monthly about ₹30.3 lakh in about 14 years 9 months; a 9.5% to 8.5% transfer after 5 years saves about ₹3.8 lakh before fees). All are labelled illustrations; no lender rate or fee is stated as real, and the prepayment-charge wording is deliberately general (confirm with the lender).
- **Not changed on purpose:** the title and meta description (they are pinned in four DOM baselines, the SEO baseline, the inventory and two specs, so changing them needs a crawl re-record) and `updatedAt` (a unit pin says the original articles keep their dates); the curated related tools (pinned). Recommended next for this article: a new title and description aimed at the queries above, with the baselines re-recorded in one reviewed batch.
- Verification: `articles.test`, `search.test`, `relationships.test` pass; `articles.spec` 58 of 58 on desktop; screenshot of the new top section at 1280 reviewed. NOT RUN: mobile article spec, links crawl and SEO baseline on the changed page.

### Batch 17: the AI taxonomy category and the Growth manifest

- **Decision (owner, 2026-11-12):** create a real AI category; do not weaken the manifest validator. `categories.js` gains category `ai` (section `ai-tools`, landing the section page); the six AI tools carry `category: "ai"` instead of `sectionId`, so tool -> category -> section resolves like every other section and articles 41 to 43 (category "ai") resolve through the same taxonomy. No validator rule changed.
- **Navigation kept as it was:** the AI Tools section is flagged `listing: "tools"`, so its page, the All Tools block and the related-tools block still list tools directly (no calculator-style category page, no category group, no "Related Calculators" block, no extra breadcrumb step). Helpers: `sectionListsToolsDirectly`, `getDirectSectionId` (taxonomy.js). The Calculators categories page shows only calculator categories.
- **Real defects the new category exposed, fixed:** AI related-tool links pointed at /calculators/<id>/ (caught by the links checker); the categories page showed a ninth card; the All Tools page rendered AI as a category group.
- **Check-mode test:** the export refuses off `main` by design (rule unchanged). The test now asserts that on another branch ONLY BRANCH_UNEXPECTED refuses, then checks the export inputs with `expectedBranch` set to the current branch.
- **Other fixes:** the items.mjs working copy was CRLF (environment, not content) and failed two ASCII hygiene tests; the SEO keyword map was regenerated (672 pages, was 662: it had no AI pages); the header DOM baseline was re-recorded for the theme toggle (stale since the theme commit).
- **Effect:** AI guides now list the other five AI tools as related (category fill); AI tools gain related AI guides.
- Verification: unit pins updated (taxonomy, sections, search, relationships, catalog); growth-manifest, tool-capabilities and ai-tools unit 543/543; static-checkers 21/21; navigation spec (categories page, All Tools) 19/19; ai-tools, section-switcher, home-brand desktop green; header DOM baseline re-recorded. NOT RUN after the final change: full unit suite, test:static in full (a background run was stopped for low memory), mobile, tablet, dark visual baselines.

### Batch 18: home-loan article title and description, dark-theme audit

- **Title:** "How to Reduce Home Loan Interest: 6 Ways With Examples" (the six numbered sections). **Description (156 characters):** names EMI, the five levers and the worked 40 lakh example. URL, hero, publication date and updatedAt unchanged. No Search Console figure was available or invented; the wording follows the queries the owner's brief reported (interest, interest rate, EMI).
- **Re-recorded in one reviewed batch:** four DOM baselines (articles-listing, home-main, related-content-emi, article-content-shell), the SEO baseline (title, description, og and twitter text; it also records the two AI pages added earlier and the rewritten article's text length), the URL inventory, the SEO keyword map, articles.test and articles.spec pins.
- **Search effect (intended):** article 1 now matches "emi", "tenure" and "prepay" because its description names them; search.test pins updated; the articles page search test now queries the full title "what is loan prepayment" because the bare word finds five articles (a page's worth) instead of four.
- **Dark theme audit** (script, 1280 and 390): article, AI Tools, SQL, Excel and Power BI labs, Home Loan, Photos to PDF, SQL learning path, World Clock. No unreadable text; the flagged "light background" elements are the intentional light action buttons of the dark theme; two secondary or disabled buttons measure 3.2:1 (disabled controls are exempt). Screenshots of the article (1280) and SQL lab (390) reviewed. Dark VISUAL BASELINES are not recorded (the visual projects capture light only).
- Verification: articles/search/relationships/keyword-map unit green; articles.spec desktop 58/58 after the search-test fix (mobile 58/58 after the same fix); baselines re-recorded. NOT RUN: links crawl baseline, tablet.

### Batch 19: dark-theme visual baselines and the 404 page

- **New spec `tests/browser/visual-dark.spec.js`** (tag @visual, so the existing visual-desktop, visual-mobile and visual-tablet projects run it; `npm run test:visual` includes it): 18 representative pages (home, All Tools, categories, loans, EMI, the home-loan guide, articles, JSON Formatter, Date Difference, Image Compressor, Merge PDF, AI Tools, Prompt Builder, Practice Labs, SQL Practice Lab, SQL learning path, Contact, 404) with the DEVICE colour scheme set to dark, so nothing is stored and the page is what a dark-device visitor gets. Baselines in tests/baselines/visual-dark/: 18 desktop, 18 mobile, 5 tablet (the others skip on tablet). Light baselines untouched.
- **Reviewed before recording:** 404 (desktop), Image Compressor (desktop), Prompt Builder (mobile) and Home (tablet) were opened and read; desktop re-run without --update-snapshots: 18/18 stable. Mobile and tablet were recorded in the same session and not re-run for stability.
- **Defect found by the new spec and fixed:** the 404 page is a self-contained document (own inline CSS, no base layout), so on a dark device it stayed light. It now has a prefers-color-scheme: dark block using the site's dark tokens, and a dark theme-color meta. The test does not assert data-theme for it.
- **Observed, not changed:** the home hero illustration and the article chart images are light-background images inside dark pages (they read as bright cards, which is acceptable); at 820 px the seven ecosystem cards leave the AI Tools card alone on the last row; the Practice Labs card summary on the home page ("JSON, cron and software testing") no longer describes the section (SQL, Excel, Power BI and the learning paths exist) and is pinned by tests, so it needs a reviewed copy change.

### Batch 20: light visual baselines made stale by the home-loan title, and the Practice Labs card copy

- **Found by running the light visual projects for the first time since Batch 18:** the longer home-loan guide title wraps to two lines (and the description to three) wherever the article's card appears, so full-page screenshots grew by one line (about 20 px, two cards on one page 40 px). Failing before re-recording: desktop 4 (home, emi, loan-comparison, prepayment), mobile 6 (those plus articles and article), tablet 3 (home, emi, loan-comparison). I opened the new home article section at 1280 (equal-height cards, no clipping) and checked that every size change was one wrapped line; those 13 baselines were re-recorded and nothing else changed.
- **Lesson recorded:** a title or description change affects visual baselines as well as DOM and SEO ones; Batch 18 listed the DOM and SEO pins but did not run the visual projects. Include them in any such batch.
- **Copy fix:** the Practice Labs card on the home page said "Hands-on exercises and flashcards for JSON, cron and software testing", which no longer describes the section. It now reads "Paths, exercises and flashcards for SQL, Excel, Python and testing" (same length, so no layout change). The home DOM baseline was re-recorded for that one line.
- Verification: before re-recording: light visual desktop 35 of 39 passed, mobile 33 of 39, tablet 17 passed with 3 failed and 19 skipped; the re-recorded tests passed on the recording run only (not re-run for stability); dark home 3/3; home-brand 8/8 desktop.

### Full unit suite (2026-11-12, at 19d13c4, both builds fresh)

- `node --test tests/unit/`: 3,971 tests, 3,967 passed, 0 failed, 4 skipped (the 17 failures seen before Batch 17 are gone: they were the AI category pins, the CRLF working copy, the keyword map, and builds that were out of date). Playwright projects were not part of this run.

### Batch 21: Premium Spectrum palette and ecosystem accents (owner brief 2026-11-12)

- **Decision (rule change: design palette):** the 2026-11-12 brief explicitly authorises replacing the indigo-and-stone palette; this supersedes the earlier green-versus-indigo conflict note. Light: midnight navy action/footer (#202c45), royal violet accent (#7656c9), warm ivory page (#f6f4ee), slate lines. Dark: navy page #0e1424, card #161e33, violet accent #bba8f6. Tokens only in assets/css/base/variables.css; the literals in hero art, logo, footer, the 404 page, theme-color metas and favicon follow.
- **Accessibility:** the requested teal #269A91 is 3.44:1 as text on white, so teal is used only as a fill; the calculators chip uses the darker #17695f. All token text pairs and every ecosystem chip pair measure 4.5:1 or more. Axe (WCAG 2.0 to 2.2 AA plus best practice) passed on all 672 live pages on the preview build (desktop); a light and a dark contrast audit of 13 representative pages found no unreadable text.
- **Ecosystem accents:** one chip colour per ecosystem (calculators teal, time amber, developer blue, image coral, PDF red-orange, Practice Labs and AI violet/indigo), icon chips only; the violet stays the single interface accent.
- **Baselines:** all 139 visual baselines re-recorded (light desktop/mobile/tablet and dark). Lesson: `--update-snapshots` in its default "changed" mode wrote nothing here and reported passes, which looked like success; the first recording was therefore empty. Use `--update-snapshots=all` and confirm files changed. Desktop re-run for stability: 57 of 57 passed; mobile and tablet not re-run.
- **Known gap:** the article card thumbnails still draw green chart bars (article illustration data); not yet recoloured.

### Batch 22: dark tablet coverage, Practice Labs audit, full unit suite, production package (2026-11-12)

- **Dark visual project:** already existed (18 pages at 1280 and 390). Tablet (820) coverage extended from 5 to 15 templates (directories, articles, AI, PDF, image, Time, Practice Labs, SQL lab); the new baselines were recorded with `--update-snapshots=all` and one was reviewed. Two existing tablet baselines re-rendered with tiny differences (breadcrumb word, hero art) and were left as committed.
- **Practice Labs audit (verification, no feature work):** SQL 49 exercises and 18 lessons, Excel 55 exercises and 13 lessons, Power BI 43 exercises and 13 lessons; each exceeds its specification target. Unit suites for the three labs and the curriculum: 126 of 126 passed. Browser specs (SQL, SQL hardening, Excel, Power BI) on subpath-desktop: 84 passed, 2 skipped; the SQL spec runs every stated solution in the real SQLite engine. No defect found, so no change was made; the gaps that remain are the unbuilt departments in the brief, not defects in these labs.
- **Full unit suite on a rested machine:** 3,971 tests, 3,965 passed, 2 failed, 4 skipped. Both failures were caused by the palette change (the primary hover measured 10.72:1 against a pinned 12:1 floor, and the documented ratios were the old ones). Fixed by darkening the hover token to #25335a (12.35:1) and updating the documented ratios to the measured values (13.93 default, 12.35 hover, active above 15); the floor was not lowered. Re-run on 794cf6a: 3,971 tests, 3,967 passed, 0 failed, 4 skipped; test:static passed.
- **Visual after the hover change:** desktop light and dark 56 of 57 on the first run; the one failure (loan-comparison) passed on an immediate re-run, so it is intermittent render noise, not fixed. Mobile and tablet were not re-run after this change.
- **Production package:** toolzenhub-production-794cf6a.zip (1,297 files, 16.4 MB, sha256 prefix ba6500603246c794) built from a clean root build of 794cf6a into C:/Users/DELL/Documents/ToolZenHub-production-package/, outside the repository. Checked: .htaccess, robots.txt and sitemap.xml present (671 URLs on https://toolzenhub.in), home canonical is https://toolzenhub.in/, static checks pass on this build, and the only "/Toolzenhub/" and "github.io" strings are the runtime base-path detection and the public issue-report link. Not verified: a browser run of the root-desktop project against the ZIP's contents, and the older zips (a3b498d and earlier) are superseded. NOT deployed; Hostinger and main untouched.

### Batch 23: design consistency and visual stability (2026-11-13)

Owner decisions applied: the Premium Spectrum palette stays (green is not restored); smallest necessary changes; nothing deployed to Hostinger.

- **Article thumbnails:** 37 of 39 thumbnails (PNG and WebP, 74 files) drew their main series in the old green. Only green pixels were hue-mapped to the palette violet (dark green to #6446b8, bright green to #7656c9, tints and anti-aliasing kept); blue, orange, slate and black elements are untouched, and violet stays distinct from the blue series. The two alt texts that named the colour ("in green", assets/js/data/articles.js) now say "in violet". Other green references were checked and left: the `--state-success` fallbacks in learn.css are functional, and "green" elsewhere is unrelated copy (blue-green deployments, CSS lessons, vendor code).
- **Why the thumbnails were not caught earlier:** the visual tolerance (0.5% of pixels) hides a recolour of small images, so all 57 desktop tests still passed with green baselines. The baselines were therefore stale rather than correct. Lesson: a deliberate palette or image change needs a deliberate re-record, then a diff against the committed images.
- **Confirmed defect 1, form fields under 16px on mobile:** a scan of all 75 tool and calculator pages at 390 px found 35 with fields rendering at 13 px (shared `.calculator-form__input` mobile rule; 14 px at desktop), which makes iOS Safari zoom the page on focus and differs from the Developer, Image and PDF pages (16 px). Fixed: the shared mobile rule and the AI brief textarea are 16 px. Result 0 of 75 pages; no sideways overflow on any page. The desktop 14 px was kept as the established design.
- **Confirmed defect 2, clipped textareas:** a textarea shared the single-line field height (44 px), so example placeholders and pasted lines were cut off on 4 pages at desktop and 7 at mobile (the AI builders, meeting notes, XIRR). Textareas now have a three-line minimum (92 px) and can still be resized. Result 0 clipped at both widths.
- **Confirmed defect 3, old-palette shadows:** 11 `rgba()` literals of the old indigo and stone (focus glows, button and hero shadows, the hero gradient, the mobile menu scrim) were mapped to the new violet (118, 86, 201) and navy (32, 44, 69) with the same alphas.
- **Measured consistency (seven tool pages, 1280 and 390):** h1 42/28 px weight 800, body 16 px, buttons 44 px with a 10 px radius, inputs 44 px with an 8 px radius, no horizontal overflow. Two small variations were left as established: h2 is 19 px on the Image and PDF pages at desktop (21 px elsewhere), and the Practice Labs h1 column is wider (726 px against 680 px).
- **Stale test pin:** unix-timestamp-converter.spec.js listed six All Tools sections; AI Tools is the seventh. Updated to the true list (and the title to 12 tools); the assertion is not weaker.
- **Visual results:** after re-recording for the thumbnails, a read-only run of all three projects failed only for the Prompt Builder (dark) and the Unix Timestamp Converter, the two pages whose textareas changed; those six baselines were re-recorded and reviewed. Final read-only run before that re-record: desktop 55 of 57, mobile 55 of 57, tablet 33 of 35 with 22 skipped (the 2 failures in each were those two pages). The footer logo chip (hover-token change in Batch 22) was also hidden by the tolerance and is now in the re-recorded baselines (145 files changed in total, all explained: thumbnails 0.1% to 1.7% of pixels, footer chip about 0.05%).
- **Loan-comparison intermittent failure:** not reproduced. 8 of 8 repeats passed, and it had failed once, immediately after two consecutive builds on the memory-tight machine. The cause is not proven; it is recorded as an unexplained intermittent, not fixed.
- **Unit suite (complete, after all changes):** 3,971 tests, 3,966 passed, 1 failed, 4 skipped. The failure is the JSON formatter 1 MB timing assertion (1.94 s against a 1.5 s budget); it passed 3 of 3 in isolation (96 of 96 each) and was not changed. The previous complete run (794cf6a) was 3,967 passed, 0 failed. `npm run test:static` passed (exit 0).
- **Functional specs after the CSS changes:** ai-tools, tool-controls, xirr and unix-timestamp-converter on subpath-desktop and subpath-mobile: 175 passed, 2 failed before the pin fix (the stale section list, now fixed and re-run 1 of 1 on each).
- **Production package:** toolzenhub-production-794cf6a.zip is now outdated: this batch changes shipped CSS, images and article data. Source of truth for the next package is the commit of this batch, to be built only after the owner's review. Not built; not deployed.

### Batch 24: completion-first checkpoint (2026-11-13), no code change

- **Phase 10 to 20 recovery:** the repository records the owner's roadmap phases only up to 12 (`docs/quality/REQUIREMENTS_RECONCILIATION.md`, P5111 Phases 1 to 12). No document holds a specification for phases 13 to 20, and they are not invented here; the owner needs to supply them.
- **Scrolling and spacing, measured at 1280 and 390 on 74 tool and calculator pages:** median first control 511 px down a 1280 screen and 623 px down a 390 screen (Batch 8, 9 and the page frame already trimmed this). Deepest are the Practice Labs lesson pages, whose first control is a lesson widget and not a form. No page needed a change on this evidence; the Meeting Planner at 1280 shows two roughly 45 px row gaps and a half-width form, recorded as a candidate, not a confirmed defect.
- **Still open:** JSON Formatter 1 MB timing (passes alone, fails only under full-suite load; threshold unchanged); Loan Comparison intermittent visual failure (not reproduced 8 of 8); mobile and tablet visual re-run after the last re-record; new production package from this commit; JSON Schema Validator and phases 13 to 20 need owner input.

### Production package status (2026-11-12, built from a3b498d, NOT deployed)

- `npm run build` (dist/, root paths) gives 677 pages and files; packaged by Python zipfile (forward-slash entries, .htaccess included) as toolzenhub-production-a3b498d.zip (1,297 files, 16.4 MB) in C:/Users/DELL/Documents/ToolZenHub-production-package/, outside the repository.
- Verified: `npm run test:static` passed (inventory 672 live pages, 671 indexable; links, assets with exact case, SEO, both builds); build-output and static-checker unit tests green; the output holds no development host (only a code comment, the public report-an-issue link to the repository, and runtime base-path detection).
- NOT verified in this batch: browser-run of the root-desktop project against the package, a full unit suite after the last change, tablet and dark visual baselines. Hostinger was not touched and nothing was uploaded; deployment needs the owner's explicit authorization.

### Next in the queue (assessed, not started)
- **(Done in Batch 17)** AI articles in the Growth manifest.
- **(Done in Batch 9)** Jump link for the long time-tool forms.
- **Guided controls in PDF and Image tools** (presets, page selection, fewer free text fields), tool by tool; their controls appear after a file is chosen, so the audit loads the test fixtures first.
- **The remaining AI articles** follow their tools (above). The category work is done.
- **(Done in Batch 4) AI articles (eight in the brief).** Article categories are the Calculators categories (`articleCategories` in `data/articles.js` reads `data/categories.js`), so an AI cluster needs an article category first: `{ slug: "ai", name: "AI", icon }` in `articleCategoryOrder` (the map must take a name when no calculator category matches), `icons.js` FOR `ai`, and the category pins: `taxonomy.test` line 190 (slugs), `articles.test` (ids order, the PUBLISHED list, per-category counts, related counts), `search.test` (article count 40, the listing parity corpus), `links.spec` `CATEGORY_SLUGS` (the `?category=` allow-list), `articles.spec` (`PACK_TOOL` per topic, pagination 8 pages at 5 cards), `relationships.test` (article to tools: curated AI tools, no category fallback since the section has no category), then the links and SEO crawl baselines. Each article is a content module of the existing shape (introduction, takeaways, sections, example, bigger picture, considerations, FAQ; no image) with one distinct question and one primary AI tool. First three planned: writing instructions an assistant can act on (Prompt Builder), giving an assistant a project's context (Context Pack Builder), reading an AI answer before trusting it (Evidence Checklist).
- **Further AI departments** (comparison of two answers, meeting notes to action plan, workflow planner, skill-gap assessment): each needs its own engine; none is a template of the four built.
- **Design-system and navigation audit** across the seven ecosystems, then the ecosystem-by-ecosystem improvements of the brief.
