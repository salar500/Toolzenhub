# 02. Competitor and market research

All pages were checked on **2026-11-15** with a page fetch (text extraction) or a web search. Labels: **observed** (on the competitor's own page), **secondary** (a third-party page, cited), **blocked** (the site refused the automated fetch) and **not observed** (we could not see it, so no claim is made). No search volumes, traffic or market-size figures are used anywhere (rulebook 12.2). Competitors inform the job and the workflow only; nothing is copied.

## 1. Audience validation

| Evidence | Finding | Label |
| --- | --- | --- |
| roadmap.sh | Its 31 role-based roadmaps include **QA**, **Data Analyst**, **BI Analyst**, Backend, Frontend and Full Stack; 62 skill roadmaps include SQL | observed |
| Our own inventory | 31 paths / 264 lessons already cluster on exactly these roles (QA 6 paths, data 7, developer 14+) | verified (01) |
| Futurepedia taxonomy | 10 top-level AI categories with tool counts; "AI Code Tools" 240 includes SQL, but **no testing/QA category** | observed |

Conclusion: the three audiences are recognised career roles with distinct, recurring jobs, and the site already has content for them. Overlap is real (SQL serves all three; JSON and API tools serve developers and QA; Playwright serves QA and developers), so membership must be many-to-many. **Not validated:** search demand per audience (no data source; hypothesis).

## 2. QA and quality engineering

| Competitor | Observed | Gap ToolZenHub can fill |
| --- | --- | --- |
| Guru99 software testing (guru99.com/software-testing.html) | About 190 linked articles grouped into 17 topic blocks; interview-question sets (10–150 questions); one quiz; PDF download; repeated third-party tool banner ads; no interactive exercises or progress | Practice instead of reading: test-design exercises with checked answers (our Test Design Lab), bug-report practice, API practice |
| Ministry of Testing (ministryoftesting.com) | **blocked**. Secondary (its own news/help pages via search): free Club tier with "Essentials" courses and forum; paid Pro/Unlimited tiers with courses, talks and certifications (Software Testing Essentials, Foundation/Intermediate/Advanced in Test Automation) | Community and certification are their moat; we should not compete there. We compete on free, hands-on practice with no account |
| Test Automation University (testautomationu.applitools.com) | Home and learning-paths pages returned navigation only; course structure **not observed** | not claimed |
| Practice Test Automation (practicetestautomation.com/practice/) | Three practice pages (login form, exceptions, dynamic table) for Selenium learners | A practice target is valuable: our "ShopLite" practice app (`src/shoplite.njk`) already plays this role; surface it in the QA hub |
| AI testing vendors (testRigor, mabl, Applitools, Testim, Katalon, Functionize) | Secondary roundups (mostly written by vendors): categories are AI-augmented frameworks (self-healing), visual AI, natural-language tests and newer "agentic" testers; several have free tiers or trials (to be checked on official pricing pages) | A neutral, dated QA slice of the AI directory: no vendor ranks it |

## 3. Developer tools and developer learning

| Competitor | Observed | Gap |
| --- | --- | --- |
| IT-Tools (github.com/CorentinTh/it-tools) | Open source (GPL-3.0), about 41k stars, many small utilities grouped in categories | Breadth exists free; we win on depth (exact error locations, explanations) and the link from tool to lesson |
| CodeBeautify JSON viewer (codebeautify.org/jsonviewer) | Says it uses the browser's JSON library by default, but offers "Save & Share" links (storage not explained); a large category menu; a five-link related-tools row; an ad-block notice suggests ads | A clear "never leaves your browser" statement, true for our tools, and a related row that leads to *learning*, not only more converters |
| Exercism (exercism.org) | Free, not-for-profit; 85 language tracks; about 8,953 exercises; automated analysis plus free human mentoring; CLI-first with an in-browser editor | We should not build coding tracks to compete. Our developer value is utilities + short paths + links to official docs |
| freeCodeCamp (freecodecamp.org/learn) | The page came back empty (client-rendered); **not observed** | not claimed |
| roadmap.sh | Role and skill roadmaps, guides, an AI tutor, accounts (3.2M registered users, self-reported) | Roadmaps are reading lists; our paths run code in the page |

## 4. SQL, Excel and Power BI education

| Competitor | Observed | Lesson |
| --- | --- | --- |
| SQLBolt (sqlbolt.com) | About 19 lessons, each ending with one interactive exercise; checking, hints and progress not described | Lesson + immediate exercise is the right rhythm; we add real result comparison and explanations |
| DataLemur (datalemur.com) | Company-tagged SQL interview questions, Easy/Medium/Hard; free tutorial and crash course; premium tier | Interview framing attracts learners. We cannot verify company tags, so we use realistic business scenarios on our own dataset |
| Microsoft Learn, Power BI (learn.microsoft.com/en-us/training/powerplatform/power-bi) | Learning paths (get started; model data; visuals and reports), per-path progress, instructor-led option, PL-300 practice assessment | Official, deep and free, so we should **link to it** (official resources) rather than compete. Our niche is the small, instant, in-browser practice loop |
| Exceljet (exceljet.net) | Function reference by category, task-based formula examples, short videos, shortcuts; free content plus paid training | Function-to-example cross-linking is the pattern for Excel "learn and check" blocks |
| Excel Easy (excel-easy.com) | 49 numbered chapters in 5 sections (Introduction, Basics, Functions, Data Analysis, VBA) plus 300 examples; side-panel links to related examples; **progress saved automatically**; a certificate | Evidence that learners expect saved progress (decision D5); numbered chapter order matches our level/module model |

## 5. AI tool directories

| Directory | Observed | Weakness / our angle |
| --- | --- | --- |
| There's An AI For That | **blocked**. Secondary: about 52,000 tools indexed; filters by pricing model, platform and release date; leaderboards | Scale = noise; no audience lens |
| Futurepedia (futurepedia.io/ai-tools) | 10 categories with subcategories (largest: Business 830, Automation 805, Productivity 619); "Most Popular and Featured" language; filters and card fields not visible in the fetch | No QA/testing category; "featured" not explained |
| Toolify (toolify.ai) | **blocked** | not claimed |

Our angle: about 50 dated entries, each checked on its official site, filtered by audience and job, with "what it is not" notes and no paid placement.

## 6. Calculators and tool-to-content

| Competitor | Observed | Lesson |
| --- | --- | --- |
| Omni Calculator FD (omnicalculator.com/finance/fixed-deposit) | Tool, then a table of contents: what an FD is, rates and calculation, improving returns, types, formulas, benefits/limits, FAQs; named creator and reviewer with an editorial policy; about 8 related calculators; **no external or official sources**; no visible last-updated date | Strong content pattern. Our differences: official sources with dates, and an honest assumptions panel |
| Groww FD calculator (groww.in/calculators/fd-calculator) | 3 inputs; result (invested, returns, total) with an "Invest now" button; formulas with worked examples; links to **Groww-hosted** bank FD rate pages; about 25 related calculators; heavy cross-sell (stocks, funds, loans) | The commercial conflict is visible. We link to each bank's **own** official rate page with a check date, and sell nothing |
| ClearTax FD calculator (cleartax.in/s/fd-calculator) | Returned **HTTP 410 Gone**: the page was removed | Stale URLs are a real risk, so official links need periodic re-checking (part of the link check) |
| Calculator.net | About 200 calculators in 4 categories; home shows 40; per-page content not visible on the home page | Breadth model; not our goal |

## 7. PDF and image (from the first pass, still valid)

iLovePDF lists 33 PDF tools; processing location not stated for web tools (observed). PDF24 lists 24 and states its online tools process files on its servers, while its desktop app is local (observed). Squoosh: single-image optimiser and "images never leave your device" (observed). Both PDF suites offer **PDF to JPG/images** prominently, which supports backlog B13.

## 8. What we did not observe

Competitors' mobile layouts, pricing pages, search rankings, real usage figures, and any page that returned 403/410 or rendered only with script (Ministry of Testing, There's An AI For That, Toolify, freeCodeCamp, the timeanddate converter UI, Test Automation University course detail).

## Sources (checked 2026-11-15)

roadmap.sh · guru99.com/software-testing.html · ministryoftesting.com (blocked); secondary: ministryoftesting.com/go-pro, help.ministryoftesting.com/article/63-certifications-faqs, ministryoftesting.com/certifications/mot-software-testing-essentials-certificate · testautomationu.applitools.com · practicetestautomation.com/practice/ · github.com/CorentinTh/it-tools · codebeautify.org/jsonviewer · exercism.org · freecodecamp.org/learn · sqlbolt.com · datalemur.com · learn.microsoft.com/en-us/training/powerplatform/power-bi · exceljet.net · excel-easy.com · futurepedia.io/ai-tools · toolify.ai (blocked) · theresanaiforthat.com (blocked); secondary: pasqualepillitteri.it/en/news/10481/theresanaiforthat-ai-directory, toolworthy.ai/blog/best-ai-tools-directory · omnicalculator.com/finance/fixed-deposit · groww.in/calculators/fd-calculator · cleartax.in/s/fd-calculator (410) · calculator.net · ilovepdf.com · tools.pdf24.org/en/ · squoosh.app · AI testing roundups (secondary, vendor-written): testrail.com/blog/ai-testing-tools/, shiplight.ai/blog/best-ai-testing-tools-2026, decode.agency/article/ai-test-automation-tools/
