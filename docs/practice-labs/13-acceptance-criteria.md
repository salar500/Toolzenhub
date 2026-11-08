# 13. Development acceptance criteria

An item is **done** only when every criterion of its type holds. These are the "completion criteria" referred to in [12](12-prioritized-roadmap.md) and the [blueprint](../practice-labs-development-blueprint.md).

## 1. By item type

### Lesson

1. Its data passes `validateLesson`: the required elements of [10](10-content-quality-standard.md), section 1, plus a `reviewed` block and `sources`.
2. Every example's expected output was produced by the verification method for its language ([10](10-content-quality-standard.md), section 3). For SQL, a script re-runs every example in the engine and compares.
3. Every practice task has hints, a solution and an explanation; the solution passes its own checker; one typical wrong answer gets a specific "not yet".
4. The page has one H1, a unique title of 65 characters or fewer before the brand where possible, a description of 155 characters or fewer, a breadcrumb including the department, and a production canonical.
5. At 390 × 844 (phone emulation):
   - no horizontal overflow;
   - the first example starts above 1.5 × the viewport height;
   - controls are at least 44 px;
   - the editor text is 16 px.
6. At 1280 × 800, the roadmap marks the lesson and the pager links are correct.
7. Without script, the text, examples, expected results, hints and solutions are readable.

### Path

1. Every module's lessons meet the lesson criteria.
2. Every level and module page has at least 150 words of unique text, or carries `noindex,follow` by rule.
3. Projects and the interview module are complete.
4. The path page lists no "Still to come", or the status stays `building`.
5. All internal links resolve (link script over the path's pages).
6. The sitemap includes every indexable page and no noindex page.
7. The registry status is updated; the department page and the learning-paths home show it.
8. `docs/practice-labs-platform.md` is updated.

### Project

The brief, dataset, 4 to 6 checked milestones, the final checklist and the reference solution exist. The export produces a file containing the learner's own work and nothing else. The reference solution passes every milestone.

### Interview module

At least 20 checked questions across levels, each with an explanation. A filter by level works on a phone.

### Engine (E1, E2 checker, simulator)

1. Lazy load with the size stated.
2. A time limit that recovers (a new worker after a timeout).
3. An "unavailable" path tested by disabling the feature in emulation.
4. No network request carries learner input (checked in the Network panel).
5. Works on desktop Chrome and on a phone emulation.
6. A unit test for the pure parts (checkers, models).

### Standalone tool page

A Tool Pack spec exists (`docs/tool-pack-factory.md`) and passes its own gates. The tool comes first above the fold on phones, with "Learn the skill" links. Catalog entry, sitemap and structured data match the existing tool pages.

### ShopLite release

1. Each seeded bug has an id, steps, expected and actual behaviour, and a matcher.
2. The bug reproduces from its steps.
3. The `stable` release has none of the seeded bugs.
4. The app is responsive and accessible, except in the deliberate a11y release.
5. It is `noindex`.

### Department page

It shows only published paths as links, a recommended order and cross-listed paths labelled with their home department, and it has at least 150 words of unique text.

## 2. Per wave (definition of done)

All items in the wave meet their criteria, then:

- the docs are updated: the platform doc, the blueprint status table, and the rulebook if a rule changed (rule 15);
- one or more commits are made on `feature/unified-ecosystem-workspace`;
- the push is done and the Pages run succeeded;
- the live preview is verified: the changed files are byte-identical to the build, and the focused checks are re-run against the live URL;
- a report is written in the agreed format.

## 3. Sanity checks: what to run and what never to run

**Run only** the checks that cover the item just built:

| Change | Run |
|---|---|
| Content-only (lesson or project data) | Schema test plus expected-result script plus a build plus a focused page script (one page, desktop and phone) |
| New engine or checker | Its unit test plus a browser script that runs, checks, times out and handles unavailability |
| New page type | Build, link check over the new pages, SEO tag check, phone overflow check |
| Shared component change (rail, frame, CSS used by other pages) | The focused checks for 2 to 3 representative existing pages of the affected families (desktop and phone), as in Phase 1 |

**Never run during development:**

- full unit suites;
- the full Playwright or browser regression;
- full desktop or mobile sweeps;
- full accessibility or visual baselines;
- whole-site crawls;
- unrelated tests.

Full regression happens only in the final stage, when the owner authorises it explicitly. Known stale baselines are listed for that stage, not fixed ad hoc.

**Low-RAM practice (4 GB laptop):**

- one build or one browser at a time;
- stop the preview server before building;
- check free memory before a browser run;
- when memory is low, shrink the batch (fewer pages per script) and do not skip the check.
