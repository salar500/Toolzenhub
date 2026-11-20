# 21. The professional prompt engine in the AI Workbench

Status: **built locally on 2026-11-17, not committed** (base `3cafe100`, on top of the uncommitted D18 work in `20-ROLES-TASKS-TOOLS.md`). Decision: D19 in `16-DECISION-REGISTER.md`; policy: rulebook 4.11 (AI Workbench item). The nine generated examples: `22-PROMPT-ENGINE-EXAMPLES.md`.

Principle (owner's brief, 2026-11-17): few selections, deep professional thinking, comprehensive and actionable prompts. The interface stays simple; the professional method behind it is written into the prompt.

## 1. Audit and gap analysis

| Requirement | Existing status (before D19) | Gap | Action taken |
| --- | --- | --- | --- |
| Profession, task, tools, questions, review | Built in D18: 20 professions, 81 tasks, 71 tools, tool step, context review | No dashboard task for the data analyst journey | Added "A business performance dashboard" (82 tasks), with blueprint, matcher words, tools and two professions |
| Depth that changes the prompt | `depth` (short to multi-stage) changed only the stages; the master prompt was the same at every depth (QA journey: 545 words at all four) | No professional depth in the prompt itself | Prompt detail: Standard, Detailed (default), Very detailed, written by `method.js` from each task's method |
| Professional method per task | Blueprints held requirements and a format; no role for the AI, no methodology, phases, edge cases, deliverable specs | The thinking a professional adds was missing | `methods/<family>.js`: a method for each of the 72 labelled tasks (role, approach, sections by level), family sections shared, generic sections written for the task's deliverable where a method has none |
| Tool intelligence by depth | Tool terms, task lines and general workflow (D18) | No deeper practice; hand-offs only as one line | `deep` practice per tool (general or per task) and step-by-step hand-offs at Very detailed; Jira offered for API testing |
| Tool experience | New to expert, changes the instructions (D18) | Beginners at Very detailed got no examples | Very detailed adds an example and prerequisites per step for new and basic users |
| Refinement controls | Shorter and longer stepped the stage depth; edit and copy | No way to add edge cases, examples, steps or deliverables; no format or tone | Controls above the pack: detail level with word counts, four parts to add, answer format, tone, reset; shorter and longer step the detail |
| Prompt validation | Missing essentials, placeholders and conflicts listed | No check of the prompt as a whole | A 20-point prompt check by fixed rules, shown above the pack, labelled as not an AI review |
| Missing information and assumptions | Placeholders and "ask me" (essential questions) | Facts, assumptions and unknowns not separated | Working rules: four kinds of information labelled; never present planned work as done |
| Safeguards | Professional safeguards in the D18 blueprints | Health, payments, personal data and security not handled from the visitor's own words; pasted material could carry instructions | Domain safeguards when the visitor's words name the domain (a word that only suggests it, such as "checkout" or "clinic", becomes an open question for the AI instead, D-25, 2026-11-20); pasted material treated as data; family safeguards at every level |
| Long prompts | A note advised a shorter prompt over 600 words | Contradicts a requested long prompt | A chosen long prompt keeps a note on working through the stages instead (12's research kept for prompts without a method) |
| Work Pack files | Kept profession and tools | Detail and refinements not kept | `prompt` object in the file (detail, extras, format, tone); older files open at Detailed |

Reused unchanged: the compiler contract, blueprints, questions and conditional questions, placeholders, stages, refinements, quality checklist, preparation, products, Markdown and file format, lazy loading, task matching, routes and navigation. Without a method (no task chosen through the page, or image, video and audio prompts) the compiler writes exactly what it wrote before (unit test).

## 2. Design

- `method.js` (lazy, with the tool step): `loadMethod(taskId)`, `methodPrompt(method, settings)` returning the lead role, the method blocks, phases, working rules, presentation, the AI's self-check and the closing list; `checkPrompt(pack, info)`; `domainsIn(text)`. Pure and deterministic.
- `methods/<family>.js` (lazy, per family, 2.7 to 17.5 kB raw): `METHODS[taskId] = { role, approach, sections }`, `FAMILY = { review, sections }`. A section's `at` is the lowest level that includes it; its `kind` (edges, examples, steps, deliverables) lets the visitor add it at a lower level; a task section with the same `id` replaces the family's.
- `compiler.js`: `input.method` places the role first, the method after the context, the presentation after the format, the self-check and closing list last.
- `tools.js`: `deep` lines (a list, or `{ all, [taskId] }`), `steps` on hand-offs, both used only at Very detailed.
- `guide.js`: the controls (drawn once, outside the redrawn pack, so focus stays), word counts per level, the prompt check, shorter and longer, file state.

What each level contains:

| Level | Contains |
| --- | --- |
| Standard | The AI's professional role, the goal, context, how to approach it (3 to 5 lines), the tools' guidance, requirements, format, constraints, the honesty rule and the profession's safeguard |
| Detailed (default) | Standard plus the method sections (for example endpoint analysis, status codes, authorisation for API testing; KPI definitions, model, layout for a dashboard), the family sections (for example test design techniques, traceability, test data), an edge-case and risk instruction, the four kinds of information, and the quality checklist as the AI's self-check |
| Very detailed | Detailed plus phases (the method's own or the task's stages), edge cases and failure scenarios, deliverable specifications, examples of the expected precision, entry and exit criteria, decision rules, risks, deeper tool practice, step-by-step hand-offs, and a closing list of assumptions, open questions and what a person must verify |

## 3. Sources and verification

Checked on 2026-11-17 for this engine (in addition to the eight tools in `20` section 4):

| Source | Confirmed |
| --- | --- |
| OWASP API Security Top 10 2023 (api-security.owasp.org) | API1 Broken Object Level Authorization, API3 Broken Object Property Level Authorization, API4 Unrestricted Resource Consumption, and the other seven names |
| Postman `pm.response` reference (learning.postman.com) | `pm.response.to.have.jsonSchema(schema)` for JSON Schema validation |
| VS Code debugging (code.visualstudio.com/docs/debugtest/debugging) | launch.json configurations, breakpoints and conditional breakpoints, the Variables, Watch and Call Stack sections, the integrated terminal |
| GitHub viewing files (docs.github.com) | The Blame view (line-by-line revision history) and earlier versions of a file |
| Excel XLOOKUP (support.microsoft.com) | XLOOKUP is not available in Excel 2016 or Excel 2019; the registry's wording was corrected (it said "needs Microsoft 365") |

VS Code, GitHub and Excel are now marked `checked`, so 11 of 71 tools are verified against a dated official page. Established practice used without a fetched source this session, and worded as practice rather than as a standard's text: HTTP method idempotency and the meaning of common status codes; the test design techniques named in the ISTQB glossary (equivalence partitioning, boundary value analysis, decision tables, state transitions, error guessing); WCAG 2.2 AA (the site's own accessibility standard); `git bisect`; JQL `statusCategory`. The health, payments and personal-data lines name laws only as examples to confirm (HIPAA, GDPR, India's DPDP Act, PCI DSS), never as the law that applies.

## 4. Results (2026-11-17)

Nine examples from the three journeys of the brief, generated by the same functions the page calls (full text in `22`):

| Journey | Standard | Detailed | Very detailed | Prompt check |
| --- | --- | --- | --- | --- |
| 1. QA engineer, API testing strategy, Postman and Jira, healthcare | 774 | 1,337 | 2,167 | 20 of 20 at every level |
| 2. Developer, debug a reproducible defect, VS Code and GitHub | 568 | 912 | 1,475 | 17, 19, 19: "what should happen" was not given (asked for, not invented); Standard leaves out edge cases and risks |
| 3. Data analyst, business performance dashboard, Excel and Power BI | 666 | 1,078 | 1,763 | 17, 19, 19: the data description was not given; the same Standard note |

All 72 labelled tasks compile at the three levels with no repeated line; without answers or tools their prompts run from about 160 to 330 words (Standard), 280 to 830 (Detailed) and 380 to 1,330 (Very detailed); answers, tools and hand-offs add to that.

| Check | Result |
| --- | --- |
| New `tests/unit/ai-workbench-method.test.mjs` | 13 / 13 |
| Unit suite (all files except the static-checkers self-test, untouched) | 4,052 tests, 0 failing after rebuilding both builds (one comparison test had read a stale root build), 4 skipped as before |
| Browser: professions spec (new tests for detail, refinements, check, file) | desktop 6 / 6, mobile 5 / 5, root 1 / 1 |
| Browser: AI Workbench, AI ecosystem, AI Tools, QA Workbench | pass on desktop, mobile and root |
| Controls at 412, 820 and 1280 px, light and dark (axe WCAG 2.2 A/AA, no horizontal overflow) | pass; radios enlarged to 24 px |
| Static checks, both builds | pass |
| First-load JavaScript added since the programme began (D17: 50 / 16 kB) | 49.9 kB raw / 14.6 kB gzip, within the budget but at the raw ceiling: the task matcher, the controls and the prompt check's code moved to lazy modules to make room |
| Loaded when a task is chosen | `guide.js` 19.5 / 5.7, `method.js` 18.2 / 6.8, `tools.js` 57.8 / 18.3, one method family 2.7 to 17.5 / 1.2 to 5.5 kB |

## 5. Limitations and follow-ups

- Depth of task-specific content varies: 10 tasks have three or more task-specific sections (requirements, debugging, technical documentation, test plan, test cases, API testing, test automation, data analysis, dashboard, project plan); the other 62 have a role, an approach and up to two sections, and reach Very detailed through their family's sections and the generic sections written for their deliverable. Deepening them, starting with the most used, is the main follow-up.
- 60 of 71 tools still rely on general documentation terms (`20` section 4).
- The prompt check reads structure and wording by fixed rules; it cannot judge whether the advice is right for a particular project.
- Domain safeguards trigger on words; a domain described in other words is missed (the profession's own safeguards still apply). A suggesting word alone (checkout, billing, clinic, security, user accounts) asks the AI to raise the domain as an open question rather than apply its rules.
- The raw first-load budget has about 100 bytes left: the next first-load feature needs a trim or a budget decision.
- Real-device checks are outstanding.
