# 03. User needs and audience research

Labels: **[P]** public evidence (see the [source register](15-source-register.md)); **[H]** reasoned hypothesis, to be validated by the experiments in [12 roadmap](12-prioritized-roadmap.md), section 5. No user interviews were run. Every "willing to pay" line is a hypothesis.

## 1. Segments

| Segment | Goals | Biggest difficulties | What they search and practise | Why they drop out | What brings them back | Expectations of a practice platform | Pay? |
|---|---|---|---|---|---|---|---|
| Absolute beginners | Understand what coding, databases and testing even are | Jargon; setup; no idea what "good" looks like | "what is SQL", "how to learn testing" [H] | Lack of time, missing background, long lectures [S08 P] | Small wins, clear next step | Nothing to install, plain language, examples first | Rarely [H] |
| College students (India-heavy) | Exams, placements, first job | Theory-heavy courses; few practical labs | "SQL queries for practice", "Java programs", interview question lists [H] | Exams and semester load | Placement season, interview prep | Free, phone-friendly, question banks with answers | Low [H] |
| Job seekers and freshers | A QA, developer or analyst job | Not knowing what employers test; no portfolio | Interview questions, "test case examples", "bug report format" [H] | Unclear progress, isolation [S08 P] | A concrete portfolio artefact | Job-relevant tasks, realistic projects | Some, for certificates [H] |
| Manual testers | Move up to automation, SQL and API | Coding fear; no practice target app | Playwright tutorials, SQL for testers, Postman [S11 P] | Tutorials assume coding background | Daily usefulness in work | Bridge from test thinking to code; a real app to automate | Moderate [H] |
| Automation testers | Modern tools (Playwright), frameworks, CI | Flaky tests, locators, framework design | Locators, auto-waiting, POM, CI [S11 P] | Generic content below their level | Problem-specific references | Advanced debugging labs, framework patterns | Moderate [H] |
| Software developers | Fill gaps (SQL, testing, Git, AI) | Time | Specific how-tos, reference | Too basic | Fast answers and practice snippets | Searchable, skimmable, runnable | Low for basics [H] |
| Backend and database people | SQL depth, performance, design | Execution plans, indexing, data modelling | Window functions, CTEs, EXPLAIN [H] | Shallow content | Advanced challenges | Real engine, real plans | Low to moderate [H] |
| Frontend developers | DOM, accessibility, testing | Accessibility knowledge; testing their UI | a11y checks, Playwright component and e2e [H] | | | Live examples, checkers | Low [H] |
| Data analysts | SQL, Excel, Power BI, Python | DAX, joins, cleaning messy data | "DAX practice", "SQL interview questions for data analyst" [H] | Paywalled data courses [S27 E] | Realistic business datasets | Real datasets and checked answers | Moderate [H] |
| AI and ML learners | Use and build with LLMs; ML basics | Maths; GPU cost; hype vs substance | Prompt engineering, RAG, evaluation [H] | Heavy setup, cloud costs | Clear mental models, visualizers | Visual intuition, honest limits, no paid keys | Moderate [H] |
| Working engineers | Upskill quickly for a task | Time | Targeted lesson or reference | Long courses | Reference value | Skimmable pages, quick labs | Low [H] |
| Interview candidates | Pass rounds | Unknown question patterns | "<topic> interview questions" [H] | | Repeated practice before interviews | Checked practice, explained answers | Some [H] |
| Career switchers | Structured route into tech | Knowing where to start; confidence | "how to become a software tester" [H] | Path too long, no feedback [S08 P] | Visible progress, projects | A roadmap with an end and a portfolio | Some [H] |

## 2. Cross-cutting needs (all segments)

1. **Zero setup and no sign-up to start.** Supported by why free tiers and W3Schools-style entry work [S20, S27]. This is already a ToolZenHub principle.
2. **Immediate, specific feedback** that says *why* something is wrong, not only that it is. Lack of interactivity is a cited drop-out cause [S08].
3. **Realistic practice targets**: a real app to test, a real dataset to query, a real repository state to fix.
4. **Small units with a visible end** (a lesson in 10 to 20 minutes; a path of 15 to 40 lessons).
5. **Phone-first reading, and practice that still works on a phone.** Indian learners are mobile-heavy [H; validate with GA4 device split].
6. **Interview readiness and portfolio artefacts** as the payoff.

## 3. Strongest initial audience: recommendation

**Testers and testing job-seekers (manual and moving to automation), with SQL as their first technical skill, India-first but globally written.**

Evidence and reasoning:

1. **Gap.**
   - There is no free, structured, *checked* testing practice platform among the leaders [S26 P, S20 P, H].
   - Developer audiences are already saturated by freeCodeCamp, Odin, W3Schools and Exercism.
2. **Demand.**
   - Playwright, SQL and API testing recur together in Indian automation postings [S11 P].
   - Playwright adoption is rising [S09 E].
   - About half of testers have not yet adopted AI tools [S10 P], so there is an "AI for testers" learning need.
3. **Existing assets.**
   - ToolZenHub already ships Test Design Lab (20 exercises), SQL (18 lessons, 49 exercises), JSON and JSONPath labs, an HTTP APIs deck and a Software Testing deck (repository, [source register](15-source-register.md)).
   - That is the fastest route to a complete, differentiated cluster.
4. **AI-era resilience.**
   - Testing practice (find the bug, write the test case, automate the flow) is doing, not reading. AI Overviews cannot complete it for the learner (finding 1 of [01](01-market-research.md)).
5. **One coherent journey:**
   - manual testing,
   - then SQL for testers,
   - then API testing,
   - then Playwright,
   - then Git,
   - then CI,
   - then AI in testing.

   Each step reuses the same practice app (ShopLite, [07 tools](07-interactive-tools-catalogue.md), E5), so content compounds.

**Secondary audience (served by the same assets):** data analysts, through SQL, Excel and Power BI, which already exist.

**Validation:** experiments X1 to X4 in [12 roadmap](12-prioritized-roadmap.md), section 5.
