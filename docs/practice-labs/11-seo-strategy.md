# 11. SEO and organic discovery strategy

**Constraint:** rulebook 6.5 (truthful, one page per intent, a production canonical, structured data only for visible content) and 6.2 (no filler).

**Context:** AI Overviews compress clicks on informational queries by roughly 35 to 58% [S05, S06, S07]. The strategy is therefore to rank with pages that **do something** (practice, check, simulate) and to treat explanation as support for practice, never the product.

## 1. Page types and their search role

| Type | URL | Intent served | Indexable |
|---|---|---|---|
| Learning-paths home | `/practice-labs/` | "learn software testing / SQL / … free" (navigational for the brand) | Yes |
| Department | `/practice-labs/<dept>/` | "software testing course free", "learn test automation" | Yes |
| Path | `/practice-labs/<path>/` | "learn <subject> step by step", "<subject> roadmap" | Yes |
| Level | `/practice-labs/<path>/<level>/` | "<subject> for beginners / advanced" | Yes, if at least 150 words of unique text; otherwise `noindex,follow` |
| Module | `…/<module>/` | Rarely searched | Same rule as level |
| Lesson | `…/<lesson>/` | Specific how-to: "sql window functions practice" | Yes |
| Project | `/practice-labs/<path>/projects/<slug>/` | "<subject> project for practice", "sql project ideas with dataset" | Yes |
| Interview module | `/practice-labs/<path>/interview/` | "<subject> interview questions" | Yes |
| Standalone tool | `/tools/<id>/` | "test case template", "practice api testing online", "git practice" | Yes |
| ShopLite, API sandbox | `/practice-labs/shoplite/`, `…/api-sandbox/` | none (practice targets) | No (`noindex`; robots disallow, which is optional) |

## 2. Metadata patterns

These are the existing patterns, kept consistent.

- **Lesson title:** `<Lesson title> | <Path> <Level> Lesson | ToolZen Hub`, up to about 65 characters before the brand where possible. Shorten long lesson titles with a `seoTitle` field rather than truncating.
- **Description:** the lesson's first sentence plus "<Level> <path> lesson with examples, exercises and answers." 155 characters or fewer (unit-tested, built).
- **Project:** `<Project>: <Path> Practice Project with Dataset | ToolZen Hub`.
- **Interview:** `<Path> Interview Questions with Checked Answers | ToolZen Hub`. This is truthful only because the answers are checked.
- **Canonical:** the production origin (built); preview never canonical (built).
- **Breadcrumb:** visible and BreadcrumbList JSON-LD from the same trail (built), including the department step.
- **Headings:** one H1; H2 per section; H3 per example or task (built).
- **Structured data:**
  - BreadcrumbList everywhere.
  - `Course` on a **path page only when the path is complete**, with `provider` = ToolZen Hub, `hasCourseInstance` omitted, and no price/offers claims beyond "free" if Google's requirements are met at that time; verify before use.
  - `Quiz` and `FAQPage` are not used for interview pages (FAQ rich results are restricted; the content is practice, not FAQ).
  - `SoftwareApplication` stays as on existing tool pages.

## 3. Internal linking

- **Lesson to:** previous and next; module siblings; the path; the standalone tool the lesson uses; the flashcard deck; one cross-path "Also useful" link only when there is a true dependency (for example Playwright locators to the HTML semantics lesson). Rulebook 6.3 applies: genuine overlap only.
- **Tool to:** "Learn the skill" links to the 1 to 3 lessons that use it.
- **Department to:** paths in the recommended order.
- **Path to:** every lesson (the roadmap, built), projects and interview.
- **Anchor text:** descriptive (the lesson title), never "click here".

## 4. Thin and duplicate content safeguards

1. One intent, one page. "SQL joins" is one lesson; cross-listed paths link instead of copying.
2. Level and module pages need at least 150 words of unique text (a module summary, why this module, what you will be able to do, and the lessons with objectives). Otherwise `noindex,follow`. Build test.
3. No page exists for a planned path or lesson (built behaviour).
4. Interview pages carry at least 20 checked questions with explanations; otherwise they are not published.
5. Generated pages are never published from a title alone. `validateLesson` requires the minimum elements ([10](10-content-quality-standard.md), section 1).

## 5. Topic clusters

Search volumes are **unknown**; there are no figures here (rulebook 12.4).

| Cluster | Hub | Spokes | Practice that makes it AI-resistant |
|---|---|---|---|
| Manual testing for beginners | P01 path | test case writing, bug report, STLC, test types, test plan, interview | Writing labs, bug hunting on ShopLite |
| Test case and bug report templates | Tools (E4) | examples per feature type | Rubric feedback on your own case |
| SQL practice | P50 path | joins, group by, window functions, recursive CTE, query plans, projects, interview | Real query execution and checking |
| API testing practice | P03 path | status codes, methods, auth, negative tests, Postman-style workflow | Mock API with seeded bugs |
| Playwright for beginners | P07 path | locators, assertions, POM, flaky tests, CI | Locator practice on ShopLite |
| Git practice | P13 path | merge conflict, rebase, reset vs revert | Git simulator goals |
| Python and JavaScript practice | P15, P30 | exercises per topic | Runnable challenges |
| AI for testers and developers | P60, P61, P06 | prompt evaluation, testing AI features | Rubric labs on recorded outputs |
| Data analyst practice | P70, P71, P50 | DAX, Excel formulas, SQL for analysts | Existing engines |

## 6. Measuring demand (the first experiment set)

1. **Before each wave:** collect *verified data* for the 20 to 40 target queries of that wave from **Google Search Console** (once pages exist) and, if available, **Keyword Planner** (labelled as ranges, with geography India and global). Record them in the wave's Requirements doc with date, source and limits (rulebook 12.4).
2. **After publication:** GSC impressions, non-branded clicks and average position per page type at 4, 8 and 12 weeks. GA4 (consent-based) engagement events: Run, Check, Hint, Solution, Export. Custom events carry no learner input, only the event name and the page. They are added only if decision D7 approves them under rulebook 8.8; until then, page views only.
3. **Decisions:** a cluster with impressions but low CTR gets better titles or snippets. A cluster with clicks and low practice use gets better practice placement. A cluster with neither after 12 weeks lowers the priority of the related later paths.
