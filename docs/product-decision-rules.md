# ToolZenHub product decision rulebook

The permanent rules for deciding **what** ToolZenHub builds, **how good** it must be, and **how** changes are made, tested and shipped. It is a rulebook, not a build queue: nothing here schedules work.

How it relates to the other documents: this file holds the durable *policy*. The detailed *procedure* lives in `docs/tool-pack-factory.md` (lifecycle, quality gate, checklist), `docs/tool-pack-template.md` (what a pack changes, visual quality rules), `docs/content-clusters.md` (articles and linking), `docs/shared-tool-ux.md` (shared UI) and `tests/README.md` (the test layers). Each tool's own decisions live in its spec, `docs/tool-packs/NN-<name>.md`. Where an older procedure document conflicts with this rulebook, this rulebook wins and the older document should be updated (see section 15).

What does not belong here: commit hashes, test counts, byte sizes, phase-specific instructions and one-off scoping. Those belong in the commit message or the tool's spec.

---

## 1. Product strategy

1. **Quality first, pain first.** Build for a real, recurring user pain, and build it well. Fewer, stronger tools beat a long list.
2. **There is no tool-count goal.** Never build a tool, category or section to look complete, to fill a navigation slot or to match a competitor. A tool earns its place or it is not built.
3. **Every tool and category must earn its place** against these questions. A candidate that fails the bar is stopped and reported, not built:
   - Is there a real, recurring user pain, and who has it?
   - Will people come back (repeat use), or is it a one-off?
   - Is it useful *now*, including in the AI era (rule 4)?
   - Does the browser give it an advantage (rule 5)?
   - Do people search for it, and with what intent?
   - Is it good on a phone?
   - Is the maintenance burden reasonable, and can it reach a polished standard?
   - Does it connect naturally to existing tools, without forced links?
4. **The AI-era test.** Before building, state why the tool still matters when an AI assistant exists. Valid reasons: an exact, deterministic answer; speed and no prompt; privacy of the data; repeatability; handling input an AI itself produced; a task that is faster done than described. If the honest answer is "an assistant does this just as well", do not build it. A tool that is only "paste input, click a button" is not enough: strengthen it around the real job (for example, exact error locations rather than a bare "invalid").
5. **Browser-native and local-first where it helps.** Prefer processing in the browser: it is fast, private and needs no backend. Use it as an advantage in the tool's copy only where it is true.
6. **Different job, not a variant.** A new tool must do a job no existing tool does (a countdown is not a stopwatch with a flag). If it is a variant, make it a mode of the existing tool or do not build it.
7. **Category balance never decides what is built next.** Do not continue a category mechanically, and do not build a tool because its section or category has fewer tools than another, to even out the catalog, or because completing a category feels due. A category having fewer tools is not sufficient justification for prioritizing another tool in it. Choose on user pain, usefulness, differentiation, repeat-use or decision value, architectural fit, implementation and maintenance risk, and platform-wide opportunity: after every tool or small cluster, compare opportunities across the whole platform (section 12). This cuts both ways: a candidate in the category just finished is neither favoured nor penalised, and wins only if it scores higher.
8. **Start narrow, then widen.** One excellent version of a new kind of product comes first; scale only after it has proven itself.

## 2. Product types

ToolZenHub has three complementary product types, and a topic is not forced into only one:

1. **Tools**: users calculate, convert, measure, check or transform something.
2. **Guides**: users learn or understand something.
3. **Trackers and comparisons**: users inspect and compare authoritative, changing information (section 13).

Choose the format by the user's job. Do not build a calculator for an informational problem. Do not write an article where an interactive comparison would clearly serve better. Do not build a tracker that cannot be kept fresh (rule 13.9).

## 3. Honesty and claims

1. **No fake social proof.** No invented popularity, analytics, ratings, reviews, testimonials, user numbers, "trusted by", awards or endorsements. If the site has no usage data it does not say "popular".
2. **Featured means curated, not popular.** Featured Tools is a short, deliberate list of live tools with presentation copy of our own. It is not a ranking and says nothing about usage. Do not change it after every release; a new tool replaces a Featured entry only if it clearly deserves it over a weaker or redundant one, and the reason is recorded.
3. **No unsupported superlatives.** Never claim best, ultimate, most accurate, cheapest, fastest, highest return, lowest rate or most profitable unless the criteria are explicit, the data is current and the method supports it. Prefer factual comparison to promotional ranking.
4. **Say only what is true of the tool.** Privacy and processing claims are factual and narrow ("Your JSON is processed in your browser"), never broader than the code. Capability flags in the catalog describe only what is built.
5. **Sensitive topics (money, tax, health, anything affecting a decision):** the tool computes and the content informs; neither tells the reader what to do with their money or health. Keep assumptions next to every number, avoid overclaiming ("guaranteed", "best", "always") and keep the existing disclaimer framing ("estimates, not advice").
6. **Be accurate or silent.** A fact that depends on a changing rule is either sourced and dated, or the page says to check the current rules. It is never stated as settled.
7. **Projections and scenarios are never forecasts.** A tool that models a future outcome from assumptions (an investment growing, a corpus being drawn down) keeps the visitor's contributions or withdrawals, the *assumed* return or rate, and the *estimated* result visibly apart, and says next to the result that it is a projection from assumptions, not a forecast, guarantee or advice. Use "assumed", "estimated", "projection" and "scenario"; never "guaranteed", "safe", "best" or "recommended", and never present a default as typical or expected. Say what is not modelled (taxes, charges, volatility, inflation). Show a lower and a higher scenario where the answer is sensitive to the assumption, framed as "if returns are lower or higher", never "worst or best case". The detailed wording standard is in `docs/tool-packs/03-sip.md` ("Trust standard for projections").

## 4. Information architecture

1. **Hierarchy is earned by scale.** A section, category or subcategory exists only when real scale or real navigation need justifies it. One tool does not need a subcategory; four tools do not need another layer. A tool may sit directly under its section.
2. **Major sections are distinct user jobs** and stay conceptually isolated: Calculators, Time Tools, Developer Tools and any future section. A tool belongs to exactly one section. It never appears in another section's listings, scoped searches, related lists or counts.
3. **Routes follow the generalized convention.** Non-calculator tools live under their section's path prefix (`/tools/<id>/`), never under `/calculators/`. A section without categories has its own landing page. Routes, sections, links and counts are derived from the central catalog; do not hardcode a tool or section into a page, a count or a special case.
4. **Real pages only.** No fake, placeholder or "coming soon" cards for tools that do not exist; no empty sections; the sitemap lists only real published pages; unpublished items are never routed. (Existing Coming Soon catalog entries are catalog data, not a roadmap to be shown on new sections.)
5. **Navigation restraint.** The header stays uncluttered: All Tools is the global discovery path, and a new section does not automatically become a header item. Home copy and the hero are not rewritten when a tool launches; Home changes only where a catalog-driven count or card updates by itself.
6. **Breadcrumbs come from the one central component.** A tool module never renders its own.

## 5. Search and discovery

1. **Global search (All Tools) covers every published tool and the other searchable content.** Section-scoped searches (Calculator Categories, All Calculators, Loans, and so on) show only that section's content; a tool from another section must never appear in them.
2. **Exact and high-intent queries win.** The tool's name, its obvious alias and the job it does lead its own results (`json` finds the JSON tool first; `stopwatch` finds the Stopwatch first). A new tool must not take the lead on another tool's queries.
3. **Aliases are true and specific.** Add only terms users really use for that job. Avoid broad terms that would pollute unrelated results. Never invent aliases for ranking.
4. **Check both directions.** A new tool is verified for its own queries and for the existing tools' queries that must not change.

## 6. Content, relationships and SEO

1. **Articles only when they add genuine value**: a distinct question, answered with real numbers or real facts, that the tool page does not answer. No article is better than a thin one. There is no required article count. Rule-dependent claims wait until the rule is verified and dated.
2. **No filler SEO.** No keyword stuffing, no pages for keyword variations, no generic padding ("in today's fast-paced world"), no invented authority. Merge a page that merely re-words another into the stronger one.
3. **Related Tools only when user intent genuinely overlaps**, never because two tools share a section or a category. No related section is a valid answer. Relationships are curated by id; tools in different sections are not grouped just because neither has a category.
4. **Imagery must explain.** An image must clarify the page's actual concept, or there is no image. Preference order: explanatory diagram, concept-specific illustration, a chart drawn from the tool's real numbers, a genuinely relevant contextual image, none. Avoid decorative or generic stock art, fake dashboards, floating coins and repeated images. Alt text states what the image explains. Photos and hotlinked third-party images are not a default.
5. **SEO is truthful and one-per-intent.** One primary page per problem; a unique title and description that match what the page does; the canonical on the production origin in every build (a preview is never a production canonical); the whole page in the static HTML; structured data only for visible content.

## 7. UX, accessibility and performance

1. **Premium means clarity, hierarchy, speed and low friction**, not decoration. The main result or action is visually first; detail never competes with it; spacing is calm; no fake glass, gratuitous animation or copied phone UI. No redesign of unrelated pages as part of a feature.
2. **Mobile-first.** Every tool is designed and checked at about 320, 360 and 390 px: no page-level horizontal scroll (long content scrolls inside its own region), controls at least 44 px tall, text that does not trigger browser zoom on focus, and the primary action reachable. Tablet is checked only where there is a specific responsive risk.
3. **Accessibility is part of done.** Real labels and linked hints and errors; visible keyboard focus; keyboard-only use; semantic headings and tables; contrast (4.5:1 for text and controls, 3:1 for outlines and focus); `prefers-reduced-motion`; meaning never carried by colour alone (state is also a word); a polite status region for meaningful changes and never for continuous or per-keystroke updates; real tables for tabular data.
4. **Performance.** Small and framework-free; a page loads only its own tool; no work while idle (no timers or frame loops when paused or hidden); bounded DOM and bounded input sizes with a stated limit, never "unlimited"; weight (raw and gzip) is checked for anything new, and a heavier feature is justified or deferred.
5. **One design layer.** Buttons, focus, headings, spacing and tokens come from the shared layer; a visual problem found once is first judged for the shared layer. Tool CSS holds only layout the tool alone needs. Enabled controls look enabled, disabled look unavailable, primary and secondary are clearly different.
6. **Do not rewrite what the user typed.** Actions that transform input write to a separate output unless the user asked otherwise; destructive actions are deliberate and placed away from primary actions.
7. **Defaults that stay out of the way.** No persistence across reloads, sounds, notifications, accounts, history, streaks, points or gamification unless there is an unusually strong, documented reason. Retention comes from usefulness: reliability, speed, mobile quality and low friction.

## 8. Logic, correctness and trust

1. **Deterministic and verifiable.** A tool's logic is a pure module, separate from the DOM, with explicit states and deterministic behaviour for every control in every state.
2. **Independent verification.** Golden values come from an independent method (closed form, hand calculation, a second implementation or a native oracle), never from the code under test. Add invariants and boundary cases.
3. **Explicit assumptions.** Conventions (rounding, timing, units, number precision, what is and is not checked) are stated on the page and in the spec. Calculate unrounded; round only for display.
4. **Choose the clock or standard deliberately and document it.** For example, elapsed time uses a monotonic clock so a system-clock change cannot move it, while a countdown to a wall-clock moment uses the wall clock. Strict standards stay strict (strict JSON stays strict).
5. **Never silently change data.** Format, convert and display without altering values (a formatter keeps numbers and strings exactly as written). Surface risks (duplicate keys, precision loss) as notes rather than hiding or "fixing" them. No guessing, no automatic repair, no silent coercion.
6. **Fail clearly.** Invalid input produces a specific, located, actionable message and leaves the user's input intact and editable.
7. **User text is data, never markup.** Anything the visitor typed or pasted is placed on the page with `textContent` or as a control value, never as HTML. Security cases (script text, quotes, backslashes, Unicode) are tested.
8. **Privacy by default.** Input is processed locally and is never sent to ToolZenHub servers, external APIs, AI services or analytics. A change that would transmit user input is a separate, explicitly approved decision.

## 9. Engineering restraint

1. **Avoid unnecessary APIs, frameworks, backends and dependencies.** Plain JavaScript and the platform come first; a dependency needs a compelling product reason, and a good native control often beats an editor library.
2. **One source of truth.** Identity, SEO text, section, relationships and capabilities live in the central catalog; routes, listings, search and the sitemap derive from it. Never store the same fact twice.
3. **Preserve working tools.** Do not modify an existing tool's implementation or logic for a new phase, and do not refactor old tools "for consistency". Touch shared code only where the change requires it (registration, catalog, search, directory rendering, routing, breadcrumbs), keep the change small, and state it in the commit.
4. **Share only real duplication.** The shared layer wires presentation and accessibility; the tool owns its domain (formulas, validation rules, wording, result composition). No generic "render a tool from config" layers, no rules engines, no extracting something used once.
5. **Specify before coding.** The tool's contract (scope, semantics, states, limits, exclusions, tests, acceptance criteria) is written in its spec before implementation, with deliberate exclusions listed. Do not discover core semantics by accident while coding.
6. **Defer heavy extras.** Tree views, syntax highlighting, line numbers, charts, exports and similar features are added only when they clear the quality bar (lightweight, accessible, good on mobile) and never delay the core job.

## 10. Testing policy

1. **Risk-based and impact-based.** Testing effort is proportional to the realistic risk and impact of a change, not to the number of files, tools or pages added. Before testing: inspect the changed files, identify the direct consumers, name the realistic failure modes, and run the smallest verification that gives reasonable confidence in them. Testing is not eliminated, unnecessary repetition is. An existing automated test is kept, but it does not have to run after every unrelated change; previously passing coverage for unchanged areas is carried forward as evidence.
2. **No full regression** by default: not every calculator, article, visual baseline or device project. A full regression is justified only at a deliberate checkpoint (item 11) or for a broad shared-risk change, and is then run one project at a time.
3. **The machine is low-memory** (about 2 CPU cores and 4 GB RAM): run browser tests with `--workers=1`, one project at a time, with focused specs and `-g` filters. Do not raise concurrency to save time. Run the built specs directly rather than through hooks that rebuild everything when a build is already fresh. Rebuild only when the change affects built output.
4. **Layers, chosen by risk.** Unit tests for new logic (deeply) and for directly affected shared metadata and search; focused browser tests for a tool's own journeys; section, directory and search integration only where shared code changed; a route-load sanity check on one representative existing tool of each kind only when shared routing or catalog code changed; static checks (links, assets, SEO, inventory, sitemap) when pages, routes or assets changed; the root build and the `/Toolzenhub/` preview build when the change reaches built output. A layer that the change cannot affect is not run.
5. **Visual tests only for changed surfaces.** Do not regenerate baselines unless there is a genuine mismatch or the visible UI genuinely changed; review every changed image by eye before accepting it, and never change code merely to make a screenshot pass. If an existing baseline still passes, leave it alone.
6. **Baselines and pinned expectations are reviewed edits**, never a way to make a test pass. A published-set list that must change when a tool is published is edited deliberately.
7. **Stop rule.** Once the checks that cover the named failure modes pass, stop. Do not add a broad run "for confidence". Report exactly what was and was not run, and state plainly when a full regression was not run.
8. **Be honest about gaps.** A test that could not run, a check that is a proxy (for example semantic assertions instead of an automated accessibility scan) or a live check that was not exercised is reported as such. A partial run is never called a pass. Real-device, Safari and WebKit checks are never claimed unless they actually happened.
9. **Review the result visually** when visual correctness matters. Automated passes do not prove a layout is good. A defect found this way is fixed before committing.
10. **Low-risk changes get lightweight checks.** Article wording, small content corrections, metadata, documentation, isolated styling, noncritical visual refinements, simple static components and minor accessibility improvements need: the diff reviewed, the relevant static check, at most one focused test, and a look at the affected page when appearance matters. A documentation-only change normally needs no browser test. A content correction does not need unrelated calculators tested. A simple new article gets a focused gate (content and metadata, important links, any material numeric claim, image paths, the catalog and static checks). A simple deterministic new tool gets its core logic, representative inputs, basic validation and its catalog and route integration. Neither automatically gets every browser project, every viewport or every visual baseline. Raise the scope for unusual compatibility, memory, download, security or correctness risk.
11. **High-risk changes are verified now, never deferred.** Run the smallest meaningful tests that directly cover the risk for: financial or mathematical correctness, shared formulas, central routing, catalog and relationship infrastructure, shared components with many consumers, security- or privacy-sensitive processing, data loss or corruption, file generation and download integrity, critical accessibility, important mobile compatibility, and anything that can break several published tools. Calculation changes keep an independent reference or golden values (section 8). A shared change is tested through its affected consumers, not every tool; if the risk is genuinely broad, a broad run is justified immediately. A known critical issue is never held until a checkpoint. Reduced test frequency never weakens correctness, trust, privacy, security, essential navigation, file integrity or compatibility the feature depends on.
12. **Periodic checkpoints replace per-tool regression.** Broader testing is scheduled at meaningful milestones: several related tools completed, a substantial feature group, a significant shared-architecture change, before a major production deployment or before an important public release. There is no fixed number of tools. The timing depends on accumulated changes, shared-system impact, unresolved defects, product maturity and deployment importance. A checkpoint selects what it needs from: calculator correctness, routing, search, related content, mobile responsiveness, accessibility, browser compatibility, asset loading, SEO and sitemap, visual consistency, performance and real-device checks. It does not assume every checkpoint needs every test, and it does not rerun checks whose inputs are unchanged. A final production-readiness verification before anything is released to production is always mandatory.
13. **Manual testing is concentrated at milestones**, not repeated after every minor change. Focused automated testing continues in every phase, and security, correctness, privacy and critical-integration risks are tested immediately, never held for the milestone. The first routine consolidated manual mobile and browser pass (real Android, Safari/WebKit) is targeted at about **70% completion of the approved, prioritized tool roadmap**. That figure is measured against a written roadmap the user has approved, not against an arbitrary tool count; until such a roadmap exists the milestone cannot be calculated and that is reported rather than guessed. The denominator is whatever the approved roadmap defines. For the initial roadmap (`docs/tool-pack-factory.md` section 10) it is that roadmap's own new tools only, the tools already published before it are not counted, and an unfinished, unsafe or unverified implementation does not count as completed. Other roadmaps set their own denominator when they are approved, and a roadmap is revised when audits or reviews change its scope. Until the milestone an individual Android or Safari check may stay explicitly unverified (and is reported as such), and a high-risk blocker is never postponed just to reach it. When it finds a small defect (text overflow, an awkward card, a spacing or crop problem): find the actual cause, make the smallest appropriate fix, run focused verification of the fix, check the realistic regression risk, review the diff, then commit through the normal approved workflow. A hotfix does not grow into a redesign, and deferred manual testing is never a reason to leave a known serious defect open.
14. **Execution safeguards.** Before browser testing, look for clearly stale Playwright, Chromium or Node test processes and end only those confirmed stale; never end unrelated processes. Do not run browser suites in parallel. Clean only disposable test artifacts and keep useful results. Do not repeat builds that are already fresh, and do not run expensive tests only because they exist.
15. **Scope is Claude's call, and is reported.** For each phase: name the failure modes, choose tests that address them, skip unrelated suites without asking, and report what was tested, what was deliberately not tested and what risk remains. A high-risk change that needs broader verification is explained. If required verification cannot be completed, report the limitation instead of calling the change fully verified.

## 11. Delivery workflow and environments

1. **Recover state from the repository first**, not from memory: current branch, `HEAD`, `origin/main`, working-tree status and the relevant docs. If repository truth differs from the expectation, trust the repository and report the difference before editing. If unexpected uncommitted work exists, stop and report it.
2. **Flow per phase:** implementation, focused impact-based tests, one coherent commit, a normal push to `origin/main`, then verification of the GitHub Pages preview. One coherent commit per phase, with an accurate message and no unrelated cleanup. **Never force-push.** Commit and push only as the phase instructs.
3. **GitHub Pages is the development preview** (`https://salar500.github.io/Toolzenhub/`), deployed from `origin/main`. When the `gh` CLI is unavailable, verify by requesting the live routes directly; do not install tooling just for this.
4. **Production is deliberately separate.** `https://toolzenhub.in` (Hostinger) is manually controlled and intentionally disconnected from GitHub. Never reconnect it, deploy to it, upload files, change its configuration or alter deployment automation unless explicitly requested.
5. **Preserve other people's changes.** Do not reset, discard or overwrite unfamiliar work; if a file changed on disk unexpectedly, read it before editing.
6. **Report faithfully.** State outcomes as they are: failures with their output, skipped steps as skipped, assumptions as assumptions, and what remains unverified.

## 12. Opportunity evaluation (choosing what to build next)

After each tool or mini-cluster, rank opportunities **across the whole platform**, not within the category just finished. Candidates include tools, guides, trackers and comparisons, developer utilities, time utilities and other browser-native products. Another tool in the same section is chosen only if it clearly scores higher. How many tools a category or section already has is not a scoring criterion in either direction (rule 1.7).

Score every candidate from 0 to 5 on six dimensions. The weights are decision support, not mathematical truth; they guide the ranking and never replace the gates below or judgment.

| Dimension | Weight | What it asks |
| --- | --- | --- |
| Search demand and discoverability | 25% | Do people search for this job, with what intent, and can the page be found for it? |
| Repeat use and retention | 25% | Will the same person come back, or is it one-off? |
| Practical user usefulness | 20% | Does it solve a real, recurring pain well, including in the AI era (rule 1.4) and on a phone? |
| Differentiation | 10% | Does it do something existing tools, here or elsewhere, do worse or not at all (rule 1.6)? |
| Implementation and maintenance feasibility | 10% | Can it reach a polished standard at a reasonable, lasting cost? |
| Trust, privacy and performance | 10% | Is the output reliable, is input kept in the browser, and is it fast and light? |

Two points follow from the list above. Natural internal-linking opportunity is a tiebreaker, never forced. Strong search demand with weak user value does not automatically win, and modest demand with exceptional repeat usefulness may.

**Evidence and uncertainty.**
1. Each score is written with its reason, and every reason is labelled **verified** (observed this session: a live competitor, the existing catalog, a measured fact, a source consulted) or **hypothesis** (reasoned, not measured).
2. Never invent search volumes, traffic projections, competition metrics or retention statistics. Without a data source, demand and retention are hypotheses, scored conservatively and said to be so. Scores are judgment, not data.
3. Do not present a weighted total as a measurement. A candidate whose win depends on a hypothesis is called that, and the audit step below is the place to test it.

**Mandatory gates.** A candidate that fails any gate is rejected or deferred however high it scores:
- it does not solve a meaningful user problem;
- it only duplicates an existing tool without a real improvement (rule 1.6);
- it can give unreliable or misleading output;
- its maintenance burden is disproportionate;
- it needs a paid external API, against the browser-local strategy (rule 1.5);
- it creates an unacceptable privacy or security risk (section 8);
- it cannot deliver an acceptable mobile experience;
- it is being added only to raise the tool count (rule 1.2).

**Scope of the comparison.** Consider candidates across every established section, not the one most recently built (rules 1.7 and 12). Where research access exists, look at search intent and likely queries, competing tools and their weaknesses, a better experience, repeat-use scenarios, complexity, mobile-performance risk and upkeep. Compare roughly three to five credible candidates, recommend one, and say why each other was deferred. Include the question in rule 13.11. Articles are optional and need independent explanatory value (`docs/content-clusters.md`).

**Lifecycle.** Candidate selection, then a focused feasibility audit, then implementation approval, then development, risk-based verification (section 10), deployment approval and, later, periodic product review. A selection is a recommendation: it is not implemented until the user selects it as a phase, and the audit does not itself approve development. Commit, push and production boundaries (section 11) are unchanged.

## 13. Trackers, comparisons and changing-data products

A future product layer may consolidate fragmented *official* information that users would otherwise gather from many websites: for example bank loan interest-rate ranges, FD rates, government savings-scheme rates, tax slabs and deduction limits, fees, deadlines and official eligibility thresholds. **No tracker or scraper is built unless the user explicitly selects it as a phase.**

1. **Opportunity test.** Ask whether fragmented official information exists that users repeatedly search for and compare manually. A strong candidate has high user intent, fragmented sources, authoritative official pages, occasional (not constant) change, clear comparison value, a meaningful link to an existing ToolZenHub tool and reasonable maintenance cost.
2. **Trust rule.** Prefer official or authoritative sources. Never present scraped or inferred information as current without verification. Show, where appropriate, the **source**, the **last-verified date** and the **applicable conditions**, and keep **ranges**. A rate published as "7.75%-13.20% depending on profile" is never reduced to "bank rate = 7.75%": do not collapse conditional ranges into misleading single values.
3. **Product value.** The aim is a decision layer, not a copy of official sites: official data, normalized structure, comparison, filtering, explanation and a hand-off into a ToolZenHub tool (for example, a rate comparison that opens the EMI Calculator with relevant assumptions).
4. **Freshness model, chosen by how often the data changes:** (A) manual and static for rarely changing information; (B) scheduled verification for occasional change; (C) an official API or feed only when a reliable authoritative source genuinely exists. Do not add fragile live scraping merely because automation is possible.
5. **Automation principle.** A pipeline is conceptually: official source, scheduled checker, normalize, validate, update the structured dataset, rebuild and publish. Public pages stay fast and stable: core rendering never depends on a request to an external source.
6. **Source change risk.** Do not assume official pages stay structurally stable. Before automating extraction, evaluate markup changes, JavaScript-rendered content, anti-bot restrictions, terms of use, inconsistent wording, missing update dates and ambiguous conditions. Prefer robust sources or manual verification where needed.
7. **Choose the format by the job.** The same data may be a structured comparison, a tracker, or a guide with a verified data table (section 2).
8. **No unverified claims.** No best, cheapest, highest or lowest labels unless the criteria are explicit, the data is current and the method supports the claim (rule 3.3).
9. **Maintenance reality.** Every changing-data product creates a freshness obligation. Before recommending one, evaluate update frequency, monitoring burden, source stability, legal and usage constraints, the consequence of stale data and automation reliability. A useful static tool may be better than a tracker that cannot be maintained safely.
10. **Start small.** Begin with one narrow, high-value dataset. Prove source reliability, the update process, change detection, validation, user usefulness and maintenance effort before expanding. Never build many live-data pages at once.
11. **Selection check.** When ranking opportunities, ask: *would users gain more value from a trusted structured data comparison than from another calculator or tool?* If yes, the tracker or comparison may outrank another generic tool.
12. **Illustrative only, not selected:** an India home loan rate comparison (selected major banks, official advertised ranges with conditions, last-verified date, source link, optional change history, hand-off to the EMI Calculator). It is an example of the model, not a commitment.

## 14. Quick checklist for a new idea

Before any new tool, section or product is built, answer in writing (in its spec):

1. Whose recurring pain is it, and why would they return?
2. Why is it valuable in the AI era, and what does the browser add?
3. What does it do that no existing tool does?
4. Where does it live (section, route) and what is deliberately **not** created (subcategory, header item, Featured entry, Home copy, article, related tools, imagery)?
5. What are its states, semantics, limits, exclusions and acceptance criteria?
6. What is the smallest integration path, and which existing code is untouched?
7. What exactly will be tested, and what will be carried forward?
8. What does it cost to maintain, and what happens if it goes stale?

If the answers do not support building it, stop and say why.

## 15. Maintaining this document

- Add a rule only when it is a lasting policy; keep one-off instructions out.
- **Rules travel with the change that creates them.** When a development phase introduces or approves a durable product, architecture, testing, UX, compatibility, content or engineering rule, the repository document that owns that kind of rule is updated as part of the same coherent change, when it applies, so the code and the written rule never drift apart. Product policy lives here; procedure lives in the document that owns it (`docs/tool-pack-factory.md` for the build lifecycle, `docs/shared-tool-ux.md` for shared UI, `docs/content-clusters.md` for articles, `tests/README.md` for test layers, the tool's own spec for decisions that belong to one tool). Do not create a new document for a rule that fits an existing one, and do not duplicate a rule across documents: state it once and link to it. Temporary implementation instructions and one-off task details are never promoted into permanent rules.
- **Maintenance process (applies to every phase).**
  1. An approved durable decision (product, architecture, testing, design, SEO, privacy, security, performance, content or deployment) is recorded in the existing document that owns it, in the same phase. Nobody should have to ask for this again.
  2. A changed decision updates or replaces its earlier wording; it is not added beside it. Check for duplicates and contradictions before finishing.
  3. Record only what is approved. A proposal, a recommendation or an open question is not a rule until the user approves it, and a task's own instructions stay out unless they state a lasting policy.
  4. Every phase ends by asking whether its approved decisions need a rulebook update, and its final report names every rule change made (or says none was needed).
  5. Keep the edit minimal and leave unrelated content alone. If a decision is ambiguous, or conflicts with an existing rule, report the conflict and do not override either silently.
  6. None of this changes the commit, push and deployment approval boundaries in section 11, and a rules-only change is not committed or pushed without the approval that section requires.
- When a rule changes, change it here first and update the procedure documents it affects.
- Rules are reviewed when a phase reveals a gap. Every rule change is deliberate and reviewed, and is visible as such: the commit message names it, and it is never smuggled into an unrelated change.

### Changing this rulebook

Changes to this file must be intentional and reviewed.

- A phase that establishes or approves a durable rule updates the rulebook in the same coherent change (see "Rules travel with the change that creates them"). A rules-only decision with no feature, such as a review of how we choose what to build, is its own focused commit.
- Do not edit it casually: change it only for a lasting policy, and strengthen or clarify an existing rule rather than adding a near-duplicate.
- Temporary implementation decisions, test counts, commit hashes and phase-specific instructions do not belong in the rulebook.
- Repository truth and explicit user decisions override stale older procedural documents.
