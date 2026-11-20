# 20. Professions, tasks and tool intelligence in the AI Workbench

Status: **built locally on 2026-11-17, not committed** (base `3cafe100`). Extended the same day by D19 (`21-PROFESSIONAL-PROMPT-ENGINE.md`): a dashboard task (82 tasks), Jira and Azure DevOps offered for API testing, and a profession's tools listed in the task's order. Later counts (D20 and D21, `23`, `24`): 22 professions, 85 tasks, 76 tools (12 checked); the tables below record the D18 state. Decision: D18 in `16-DECISION-REGISTER.md`; policy: rulebook 4.11 (AI Workbench item).

## 1. Why inside the Workbench

The owner's brief asked for a "Guided AI Prompt Builder" that knows professions, tasks and the software people use. The audit found the AI Workbench already did the task-first half: 46 tasks, optional roles and experience, depth, blueprint questions, a deterministic master prompt, stages, refinements, a quality checklist and product hand-off. Rule 4.11 keeps professions as context inside it, and a separate tool would have been a third tool for one job next to the AI Prompt Builder (rule 1.6). On 2026-11-17 the owner chose to extend the Workbench (D18).

## 2. What was added

| Part | Where | What it does |
| --- | --- | --- |
| Start from your profession | `ai-workbench/roles.js`, `guide.js` | 20 professions in 6 groups; choosing one lists its tasks; a task opens with the profession written into the prompt ("I work as a QA engineer or software tester.") |
| 36 new tasks in 8 families | `taxonomy.js`, `blueprints/{marketing,business,people,education,design,operations,finance,legal}.js` | Tasks the first catalogue lacked (SEO audit, PRD, job description, lesson plan, usability test, incident, financial analysis, contract review and others), each a full blueprint: questions, brief, stages, refinements, quality checklist, preparation, next steps |
| Tool registry | `ai-workbench/tools.js` | 71 tools: what each is, the terms its documentation uses, how the work is done in it (generally, or per task), what to share with the AI, what a person must check |
| Task-tool map | `TASK_TOOLS` in `tools.js` | Which tools are offered for which of 59 tasks; a profession's own tools are listed first |
| Tool step | `guide.js` | Choose one or more tools, each with the visitor's experience of it (new, basic, intermediate, advanced, expert) asked separately from experience in the job; or "I don't use a specific tool", "Recommend a suitable tool", or another tool by name; search when more than eight |
| Tool-aware prompt | `toolPrompt()` in `tools.js`, used by `compiler.js` | Per tool: its terms, the task's workflow in it, the general workflow, "you cannot open my tool: ask me to share ...", and a line set by the tool experience; hand-offs between tools; preparation and checklist items from the tool |
| Hand-offs | `HANDOFFS`, `handoffLines()` | Ten documented links (for example Playwright with GitHub Actions, Excel to Power BI) are described; any other pair is told to move work by export, file or copied value and never to assume an integration |
| Context review | `guide.js` `reviewHTML` | Above the Work Pack: profession, experience, task, tools, what is missing and what to check, each with a "Change" link to the answer (opening a folded section) |
| Local adjustments | `ai-workbench/index.js` | "Make it shorter" and "Make it more detailed" rewrite the pack at another depth, labelled "no AI is used"; "Edit the prompt before copying" with its own Copy |
| Work Pack files | `index.js` `FILE_SCHEMA` | Keep the profession, the tools with their experience, the tool choice and another tool; opening the file restores them |

Not added, by design: an AI model or API call, storage, accounts, automatic submission to an AI product. The existing AI product hand-off (copy, the AI Directory's products for the task, official links) is unchanged.

## 3. Professions and tasks

| Group | Profession | Tasks (Workbench task ids) |
| --- | --- | --- |
| Technology and IT | Software developer | code-feature, debug, code-review, refactor, api-design, requirements, tech-docs, incident |
| | QA engineer or software tester | test-plan, test-cases, api-testing, test-automation, regression, defect, performance-test, requirements |
| | Data analyst | data-analysis, dashboard, report, doc-summary, research-plan, presentation, status-report |
| | IT or system administrator | incident, ops-script, runbook, change-plan, debug, tech-docs |
| Marketing and content | Digital marketer | seo-audit, keyword-research, campaign-plan, marketing-copy, social-posts, market-research, report |
| | Content writer or blogger | article, keyword-research, social-posts, repurpose, email-message, review-draft, fix-accuracy |
| | Technical writer | tech-docs, api-design, kb-article, review-draft, fix-accuracy, adapt-audience, doc-summary |
| Business and management | Business analyst | requirements, prd, data-analysis, dashboard, doc-summary, report, presentation, risk-register |
| | Entrepreneur or small business owner | business-plan, marketing-copy, social-posts, market-research, email-message, presentation, budget-forecast, support-reply |
| | Sales or business development | sales-outreach, discovery-call, presentation, email-message, market-research, report |
| | Project manager | project-plan, status-report, risk-register, presentation, email-message, report |
| | Product manager | prd, requirements, market-research, ux-research-plan, presentation, status-report, data-analysis |
| Education and research | Student | explain-concept, learning-plan, literature-review, doc-summary, presentation, review-draft, interview-prep |
| | Teacher or educator | lesson-plan, assessment, rubric, adapt-audience, presentation, learning-plan |
| | Researcher | research-plan, literature-review, data-analysis, report, doc-summary, fix-accuracy |
| Design and people | UI/UX designer | ux-research-plan, usability-test, ux-review, design-handoff, presentation |
| | HR or recruiter | job-description, hiring-interview, onboarding-plan, hr-policy, email-message |
| | Customer support | support-reply, kb-article, ticket-analysis, email-message |
| Finance and legal | Finance or accounting professional | financial-analysis, budget-forecast, variance-analysis, reconciliation, report, presentation |
| | Legal professional | contract-review, legal-research, clause-draft, doc-summary, fix-accuracy |

Task counts follow the work, not a target: customer support has four because those are its distinct prompt jobs; designers five. Professions are an entry point and context, never separate pages (rule 4.11).

Professional safeguards written into the new blueprints: finance results reviewed by a qualified accountant, every figure from the visitor's data or a labelled assumption; legal work names the jurisdiction, forbids invented cases or citations, and is reviewed by a qualified lawyer; HR material is job-related and excludes criteria touching protected characteristics, with people deciding; operations never asks for secrets, diagnoses read-only first and requires a rollback; support replies offer only what policy allows; ticket and SEO analysis count only exported data; assessments and lesson facts are checked by the teacher.

## 4. Tools and their sources

`checked` in `tools.js` marks the tools whose official documentation was read on 2026-11-17 for the terms used:

| Tool | Official page read | Confirmed terms |
| --- | --- | --- |
| Postman | learning.postman.com: overview; variables; test scripts | collections; workspaces; Postman CLI; variable scopes global, collection, environment, data, local; environments (one active); post-response scripts; pm.test; pm.expect (Chai BDD); the Collection Runner |
| Playwright | playwright.dev/docs/intro | locators, web-first assertions, auto-waiting, fixtures, projects per browser, trace viewer, HTML reporter, GitHub Actions workflow offered at install, Codegen (test hooks not on that page) |
| Power BI | learn.microsoft.com: create and manage relationships | cardinality (many to one, one to one, one to many, many to many), cross filter direction (single, both), active relationship, Model view, star schema |
| Google Search Console | support.google.com/webmasters/answer/7576553 | Performance report: clicks, impressions, CTR, average position; queries, pages, countries, devices, search appearance, dates |
| Jira Cloud | support.atlassian.com: advanced search | JQL; saved filters; the documentation now calls issues **work items** and projects **spaces** (prompts give both names) |
| Figma | help.figma.com: Guide to Dev Mode | Inspect panel, code snippets, Code Connect, "Ready for dev" status, measurements and annotations, variables and styles; Dev Mode on paid plans |
| Docker | docs.docker.com: multi-stage builds | Dockerfile, multiple FROM, COPY --from (Compose is not on that page) |
| GitHub Actions | docs.github.com: understanding GitHub Actions | workflows in .github/workflows, events, jobs, steps, runners, actions |

Visual Studio Code, GitHub and Excel were checked the same day for D19 (`21` section 3), so 11 tools are now verified. The other 60 tools carry their official documentation address and only long-standing, general terms (for example Selenium's WebDriver and explicit waits, Excel's XLOOKUP and PivotTables, Terraform's plan and apply). They were not re-read this session and are listed as a follow-up: re-check each against its documentation before a release, starting with the tools most often chosen. No pricing or plan facts are given except Figma Dev Mode's, which the page read states.

Hand-offs stated as features come from the pages read (Playwright's GitHub Actions workflow; Postman CLI in CI) or are long-documented links (Excel tables into Power BI Get data; linking Search Console to Analytics; TestRail's Jira integration, worded "TestRail documents a Jira integration; check it is set up in your instance"). Every other pair is described as a manual hand-off.

## 5. How the prompt changes

- With no tool chosen, the master prompt is byte-identical to before (unit test).
- Postman for API testing adds collection structure, environment variables, pm.test and pm.expect assertions, request chaining and the Collection Runner or Postman CLI; Postman for API design adds collection examples instead (unit test).
- Playwright for test automation adds role-based locators, web-first assertions, fixtures, browser projects and the trace viewer; none of Postman's terms appear (unit test).
- Experience with a tool changes the instructions ("I am new to Playwright: say where in Playwright each step is done…"; "I know Playwright in depth: no basic explanations…"), alongside, not instead of, professional experience (unit test).
- Every chosen tool adds "You cannot open my <tool> or my accounts: ask me to share …", a preparation item and a checklist item.
- The ten journeys of the brief (QA with Postman; QA with Playwright and GitHub Actions; developer debugging with GitHub; data analyst with Excel and Power BI; marketer's SEO audit with Search Console; project manager with Jira; designer's handoff with Figma; finance with Excel; student's learning plan; technical writer with docs-as-code) each produce a specific prompt, deterministically, and all ten differ (unit test).

## 6. Quality checks run (2026-11-17)

| Check | Result |
| --- | --- |
| Unit suite (all files except the static-checkers self-test, which this change does not touch and which passed alone earlier the same day) | 4,039 tests: 4,035 pass, 0 fail, 4 skipped (pre-existing) |
| New `tests/unit/ai-workbench-tools.test.mjs` | 12 / 12 |
| Browser `ai-workbench-professions.spec.js` | desktop 5 / 5, mobile 4 / 4, root 1 / 1 |
| Existing AI specs after the change (`ai-workbench`, `ai-ecosystem`, `ai-tools`, `qa-workbench`) | pass on desktop, mobile and root (one reviewed pin: the product section is found by its heading because the context review now comes first) |
| axe-core (WCAG A/AA) on the profession list, tool step and review at 390 px | no violations after one fix (the review's "Change" links are underlined, WCAG 1.4.1) |
| Static checks, both builds | pass |
| Workbench first load (its own modules plus pack-format and hand-off, gzip level 9, from the browser's requests) | 111.0 kB raw / 32.4 kB gzip, about level with before; the task matcher now loads on first use and the tool-prompt code with the tool step, so the new catalogue does not add to the first load. Added when a task is chosen: `guide.js`, `roles.js`, `tools.js` and the blueprint family |

Defects found and fixed: a role starting with an acronym read "a qA engineer", and vowel-initial roles read "a academic researcher"; the article now follows the sound ("a QA engineer", "a UI/UX designer", "an HR or recruiter", "an academic researcher").

## 7. Limitations and follow-ups

- 60 tool entries rely on general documentation terms not re-read this session (section 4).
- Tool knowledge is static: version changes (renamed features, new terms) need the registry to be updated, which is why each entry links its documentation.
- The AI product hand-off is copy and paste; nothing is submitted automatically.
- Physical-device checks of the new steps are outstanding with the other phone checks.
