# 24. Strategy engine, concise prompts and the task coverage audit

Status: **built locally on 2026-11-18, not committed** (base `3cafe100`). Decision: D21 in `16-DECISION-REGISTER.md`; policy: rulebook 4.11 (AI Workbench item). Benchmark journeys: `25-BENCHMARK-JOURNEYS.md`.

## 1. Why

The same task is done in more than one legitimate professional way: a test plan can be risk-based, traceability-driven or compliance-focused; an architecture can be reliability- or cost-led; a video script can be retention-led or documentary. A visitor coming back for the same task should be able to get a genuinely different approach, without randomness and without changing their task, answers or tools.

## 2. How strategies work

A strategy is three reusable parts, each adding its own instructions (`strategies.js`, loaded with the method engine):

| Part | Where from | Example | What it changes |
| --- | --- | --- | --- |
| Approach | The task's family (some limited to certain tasks) | QA: risk-based, requirements traceability, business-process-driven, exploratory-led, compliance-focused, automation-oriented, negative and robustness-focused, release-readiness | The methodology |
| Emphasis | All tasks | Verification-heavy, risk-aware, lean and fast, quality-gated, explain as you go | What is stressed and checked |
| Written for | All tasks | The people doing the work, decision makers, review or audit, newcomers | The shape of the deliverables |

Compatibility rules exclude contradictions: compliance-focused or audit-ready work with "lean and fast", exploratory testing with "review or audit", statistical rigour with "lean". An id such as `s1:trace+verify+audit` names the parts; the same id, task and answers always give the same prompt. An unknown or unfitting saved id falls back to the recommended method (the task's own method with no extra parts).

"Generate another approach" walks the valid combinations in a fixed order: a different approach first (the next in the family's order), keeping the emphasis and audience; then other combinations; never one already shown in this visit; when all have been shown it starts again. The panel says which approach is applied and why, and the id is shown beside it.

| Count (79 tasks with approaches) | Value |
| --- | --- |
| Combinations of the parts | 13,020 |
| Valid (compatible) combinations | 12,471 (58 to 261 per task) |
| Valid combinations with a named approach | 10,180 |
| Combinations compiled by the unit tests | all 12,471: none repeats a line, and no two give the same prompt within a task |
| Combinations read by a person | the 24 benchmark journeys and comparisons in `25` (written and reviewed by the developer, not an independent reviewer) |

The combinations are compositions of 92 written parts (83 approaches, 5 emphases, 4 audiences), not thousands of templates; "valid" is not a claim that every combination has been judged ideal for every project.

## 3. Concise and full prompts

Every prompt with a method also has a **concise** version: the role, the goal, the context and answers, how to approach it, the strategy, a one-line outline of the method's sections ("Cover, in this order: …"), the domain method and safeguards, each tool's terms, instructions for the task and general instructions and what to share (all but the Very detailed deeper practice; changed after the real-platform preparation, `25` section 5.5), the requirements, the format, what to avoid, three key checks, and the request to ask for missing details. It leaves out the detail of each section, the phases, examples and the closing list. It is shorter for every task (unit test) and never a cut of the full text. The visitor chooses which leads; the other is one press away, each with Copy; "Copy one section" copies any labelled section on its own. Work Pack files keep the choice and include both versions.

## 4. Domain, quality checks, professions and tools

- **Domain method.** Health, payments or banking, and personal data now change the work itself for the families where they matter (for example a healthcare test plan adds "a patient's record is never shown to or changed for the wrong patient" and audit-trail tests; a payments architecture adds idempotency keys and integer minor units), in a "Because of the domain" section; the safeguard lines stay in the working rules. Triggered by the visitor's own words only ("banking" counts; "file transfer" and "bank holiday" do not).
- **Prompt check.** 22 points by fixed rules: 9 check what the prompt contains (structure), 13 apply a rule to it. New: whether every answer the visitor gave appears in the prompt, and whether a chosen tool is one usually used for the task. The panel says which kind each point is and that a longer prompt does not score higher.
- **Professions.** Two added in a new "Creative and media" group: video, audio or podcast creator, and graphic designer. They were the only way the 13 image, video and audio tasks could be reached from the guided panel. Other suggested roles (cybersecurity, DevOps, database administration, machine learning, operations, supply chain, customer success, e-commerce) were not added: each needs its own task family and methods to be more than a relabelled existing role, which is follow-up work.
- **Tools.** Five media tools added with their official documentation addresses and general terms only (not checked against a dated page): Canva, CapCut, Adobe Premiere Pro, DaVinci Resolve, Audacity; offered for video concepts, scripts, storyboards, presentations and podcasts. 76 tools, 11 checked (12 after the quality batch, section 7).

## 5. Task coverage audit (2026-11-18)

Classification, from what each task's method contains (read by the developer):

- **Strong:** the task's own methodology, its own edge cases or phases, and its own deliverable specification.
- **Adequate:** its own methodology or deliverable section beyond the role and approach.
- **Thin:** a role and an approach, with at most an edge-case or example list of its own that appears only at Very detailed (the family's sections do the rest).
- **Not applicable:** one-paragraph image, video and audio prompts, which have their own descriptive brief and no method.

Before this audit 20 tasks were Thin; each now has its own method section (and edge cases or deliverables where they matter): repurpose, email, video concept, storyboard, podcast, review, fact-check, audience adaptation, sales outreach, onboarding, HR policy, ticket analysis, rubric, explaining a concept, usability test, UX review, runbook, variance analysis, legal research, clause drafting. Result: **12 Strong, 55 Adequate, 7 Thin, 0 Missing, 10 not applicable**, of 84 tasks. The first count (62 Adequate, 0 Thin) also counted a task whose only own section was an edge-case or example list at Very detailed; the product-quality review of the same day applied the stricter rule above, which leaves seven tasks Thin: marketing copy, refactoring, regression testing, performance testing, assessment, operations scripts and budget forecasts. After the quality batch of the same day (section 7) the count is **21 Strong, 54 Adequate, 0 Thin, 0 Missing, 10 not applicable, of 85 tasks** (the table below). Adequate is not a promise of depth: deepening the most used Adequate tasks is the next content work.

Words are for the task with no answers and no tools (S = Standard, D = Detailed, VD = Very detailed); answers, tools and domain add to them.

| Professions | Task | Status | Task-specific sections | Approaches | Valid strategies | Tools offered | Words S / D / VD (no answers) | Concise (D) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Content writer or blogger | article | Strong | Article method; Before publishing; Deliverables | 6 | 203 | 3 | 245 / 503 / 694 | 337 |
| Digital marketer; Content writer or blogger; Entrepreneur or small business owner; Graphic designer | social-posts | Strong | Visual for each post; For LinkedIn; For Instagram; For X; Before publishing | 5 | 174 | 2 | 224 / 398 / 584 | 306 |
| Digital marketer; Entrepreneur or small business owner | marketing-copy | Strong | Copy brief; Message hierarchy and structure; For a landing page; For an email; For an advert; Deliverables; Compliance and trust | 5 | 174 | 4 | 217 / 523 / 714 | 305 |
| Content writer or blogger; Video, audio or podcast creator | script | Adequate | Structure for a longer video; Deliverables for YouTube; Short vertical video method; Deliverables for a short video; Podcast method; Talk method | 7 | 232 | 3 | 219 / 400 / 606 | 309 |
| Content writer or blogger | repurpose | Adequate | Repurposing method | 5 | 174 | 0 | 205 / 439 / 645 | 289 |
| Content writer or blogger; Entrepreneur or small business owner; Sales or business development; Project manager; HR or recruiter; Customer support | email-message | Adequate | Email method; Before sending | 4 | 145 | 0 | 221 / 449 / 644 | 311 |
| Graphic designer | graphic-design | Strong | Visual hierarchy and composition; Typography, colour and accessibility; Social media graphic; Marketing graphic; Presentation design; Brand identity; Layout and editorial; Production specification; Before it is used | 3 | 116 | 2 | 320 / 570 / 792 | 422 |
| Graphic designer | image-generate | Not applicable (one-paragraph media prompt) |  | 0 | - | 0 | - | - |
| Graphic designer | image-edit | Not applicable (one-paragraph media prompt) |  | 0 | - | 0 | - | - |
| Graphic designer | product-photo | Not applicable (one-paragraph media prompt) |  | 0 | - | 0 | - | - |
| Video, audio or podcast creator; Graphic designer | thumbnail | Not applicable (one-paragraph media prompt) |  | 0 | - | 0 | - | - |
| Graphic designer | image-series | Not applicable (one-paragraph media prompt) |  | 0 | - | 0 | - | - |
| Video, audio or podcast creator | video-concept | Adequate | Concept method; Production risks | 6 | 203 | 4 | 193 / 430 / 596 | 282 |
| Video, audio or podcast creator | storyboard | Adequate | Shot method; Deliverables | 6 | 203 | 5 | 185 / 403 / 623 | 273 |
| Video, audio or podcast creator | text-to-video | Not applicable (one-paragraph media prompt) |  | 3 | - | 0 | - | - |
| Video, audio or podcast creator | image-to-video | Not applicable (one-paragraph media prompt) |  | 3 | - | 0 | - | - |
| Video, audio or podcast creator | voiceover | Not applicable (one-paragraph media prompt) |  | 3 | - | 0 | - | - |
| Video, audio or podcast creator | podcast | Adequate | Episode method | 5 | 174 | 1 | 159 / 379 / 607 | 239 |
| Video, audio or podcast creator | music | Not applicable (one-paragraph media prompt) |  | 3 | - | 0 | - | - |
| Video, audio or podcast creator | sound-effects | Not applicable (one-paragraph media prompt) |  | 3 | - | 0 | - | - |
| Software developer; QA engineer or software tester; Business analyst; Product manager | requirements | Adequate | Elicitation; Requirements that are often missed; Example of a testable criterion | 5 | 174 | 5 | 197 / 410 / 672 | 285 |
| Software developer | architecture | Strong | Design elements; Quality attributes; Start from what exists; Failure scenarios; Deliverables; Example of a decision record | 7 | 232 | 6 | 287 / 612 / 953 | 386 |
| Software developer | code-feature | Adequate | Implementation phases; Edge cases to handle | 8 | 261 | 5 | 245 / 471 / 751 | 336 |
| Software developer; IT or system administrator | debug | Strong | Evidence to gather; Diagnosis method; Phases; Causes to consider; Deliverables | 6 | 203 | 5 | 280 / 624 / 987 | 373 |
| Software developer | code-review | Adequate | Context of the change; Review checklist; Example of a useful comment | 5 | 174 | 2 | 230 / 446 / 732 | 313 |
| Software developer | refactor | Strong | Before changing anything; Refactoring steps; Deliverables; Risks in refactoring | 8 | 261 | 3 | 230 / 556 / 766 | 319 |
| Software developer; Technical writer | api-design | Adequate | Design rules; Edge cases in the contract | 7 | 232 | 2 | 202 / 470 / 725 | 292 |
| Software developer; IT or system administrator; Technical writer | tech-docs | Strong | Documentation structure; Accuracy; Verification; Readers who get stuck | 4 | 145 | 5 | 205 / 365 / 537 | 291 |
| QA engineer or software tester | test-plan | Strong | The plan must contain; Risks to look for; Decision rules | 8 | 252 | 4 | 287 / 631 / 1062 | 385 |
| QA engineer or software tester | test-cases | Adequate | Each test case contains; Edge cases to cover; Example of the expected precision | 7 | 223 | 4 | 274 / 584 / 981 | 370 |
| QA engineer or software tester | api-testing | Strong | Endpoint analysis; Status codes, headers and validation; Authentication and authorisation; Negative, boundary and edge cases; Execution approach; Deliverables; Example of a test case row; Entry and exit criteria | 7 | 223 | 6 | 296 / 859 / 1332 | 405 |
| QA engineer or software tester | test-automation | Strong | Reliability rules; Failure scenarios to design for; Deliverables | 7 | 228 | 6 | 288 / 634 / 1061 | 382 |
| QA engineer or software tester | regression | Adequate | Change-impact analysis; Test selection; Execution and exit; Indirect impact to consider | 8 | 252 | 3 | 238 / 636 / 1047 | 333 |
| QA engineer or software tester | defect | Adequate | Analysis method; Before raising it; Severity and priority | 4 | 141 | 3 | 231 / 585 / 976 | 326 |
| QA engineer or software tester | performance-test | Strong | Objectives and workload; Test types and measures; Execution and diagnosis; Deliverables; What distorts results | 7 | 228 | 1 | 250 / 667 / 1076 | 351 |
| Data analyst; Researcher | research-plan | Adequate | Design elements | 4 | 136 | 3 | 254 / 468 / 708 | 342 |
| Student; Researcher | literature-review | Adequate | Appraisal | 4 | 136 | 1 | 273 / 437 / 661 | 366 |
| Data analyst; Business analyst; Product manager; Researcher | data-analysis | Adequate | Analysis method; Phases; Data traps | 6 | 194 | 7 | 246 / 488 / 753 | 346 |
| Digital marketer; Entrepreneur or small business owner; Sales or business development; Product manager | market-research | Adequate | Research structure | 5 | 169 | 3 | 261 / 472 / 690 | 360 |
| Data analyst; Business analyst | dashboard | Strong | KPI definitions; Data preparation and model; Layout and visual design; Build phases; Edge cases and failure scenarios; Deliverables; Example of a KPI definition | 5 | 169 | 7 | 329 / 710 / 1097 | 426 |
| Data analyst; Digital marketer; Business analyst; Sales or business development; Project manager; Researcher; Finance or accounting professional | report | Adequate | Report structure | 6 | 194 | 5 | 207 / 412 / 627 | 287 |
| Data analyst; Technical writer; Business analyst; Student; Researcher; Legal professional | doc-summary | Adequate | Faithfulness; What summaries get wrong | 4 | 140 | 2 | 251 / 431 / 650 | 348 |
| Content writer or blogger; Technical writer; Student | review-draft | Adequate | Review method; Deliverables | 3 | 116 | 0 | 212 / 431 / 614 | 301 |
| Content writer or blogger; Technical writer; Researcher; Legal professional | fix-accuracy | Adequate | Claims table | 3 | 116 | 0 | 201 / 399 / 581 | 296 |
| Technical writer; Teacher or educator | adapt-audience | Adequate | Adaptation method | 3 | 116 | 0 | 162 / 369 / 495 | 242 |
| Project manager | project-plan | Strong | The plan must contain; Planning phases; Example of a task row | 4 | 145 | 5 | 205 / 404 / 551 | 291 |
| Student; Teacher or educator | learning-plan | Adequate | The plan must contain | 3 | 116 | 2 | 222 / 399 / 538 | 307 |
| Student | interview-prep | Adequate | Answer structure | 2 | 87 | 0 | 213 / 363 / 527 | 285 |
| Data analyst; Business analyst; Entrepreneur or small business owner; Sales or business development; Project manager; Product manager; Student; Teacher or educator; UI/UX designer; Finance or accounting professional; Graphic designer | presentation | Strong | Deliverables; Slide design; Questions to prepare for | 3 | 116 | 2 | 187 / 380 / 502 | 269 |
| Digital marketer | seo-audit | Adequate | Audit areas; Deliverables | 5 | 174 | 5 | 327 / 575 / 836 | 424 |
| Digital marketer; Content writer or blogger | keyword-research | Adequate | Deliverables | 5 | 174 | 4 | 262 / 456 / 674 | 364 |
| Digital marketer | campaign-plan | Adequate | The plan must contain; What often goes wrong | 5 | 174 | 6 | 268 / 453 / 654 | 359 |
| Sales or business development | sales-outreach | Adequate | Sequence; Outreach method | 3 | 116 | 3 | 236 / 437 / 587 | 327 |
| Sales or business development | discovery-call | Adequate | Deliverables | 3 | 116 | 2 | 239 / 382 / 457 | 312 |
| Entrepreneur or small business owner | business-plan | Adequate | The plan must contain | 5 | 174 | 2 | 260 / 445 / 591 | 366 |
| Business analyst; Product manager | prd | Strong | The PRD must contain; Feature planning method; Example of a story with criteria; Requirements often missed | 5 | 174 | 4 | 242 / 477 / 654 | 326 |
| Data analyst; Project manager; Product manager | status-report | Adequate | Honest status | 4 | 145 | 4 | 245 / 425 / 537 | 345 |
| Business analyst; Project manager | risk-register | Adequate | Register columns | 3 | 116 | 3 | 226 / 375 / 450 | 303 |
| HR or recruiter | job-description | Adequate | Fairness; The description must contain | 3 | 116 | 1 | 264 / 399 / 564 | 346 |
| HR or recruiter | hiring-interview | Adequate | Fairness; Deliverables | 2 | 87 | 1 | 270 / 408 / 557 | 353 |
| HR or recruiter | onboarding-plan | Adequate | Onboarding structure; Deliverables | 2 | 87 | 2 | 229 / 387 / 538 | 303 |
| HR or recruiter | hr-policy | Adequate | Policy structure; Cases to cover | 2 | 87 | 0 | 236 / 374 / 526 | 314 |
| Entrepreneur or small business owner; Customer support | support-reply | Adequate | Support standards; Difficult cases; Tone example | 3 | 116 | 3 | 244 / 377 / 539 | 316 |
| Technical writer; Customer support | kb-article | Adequate | Support standards | 2 | 87 | 3 | 213 / 344 / 506 | 284 |
| Customer support | ticket-analysis | Adequate | Analysis method | 1 | 58 | 4 | 259 / 444 / 609 | 358 |
| Teacher or educator | lesson-plan | Adequate | The plan must contain; Examples to include | 6 | 203 | 2 | 219 / 371 / 479 | 296 |
| Teacher or educator | assessment | Strong | Assessment design; Multiple-choice questions; Open questions; Fairness and feedback; Deliverables; Question quality | 4 | 145 | 1 | 225 / 473 / 623 | 299 |
| Teacher or educator | rubric | Adequate | Rubric structure | 4 | 145 | 1 | 200 / 372 / 512 | 277 |
| Student | explain-concept | Adequate | Explanation method | 5 | 174 | 0 | 208 / 347 / 489 | 295 |
| Product manager; UI/UX designer | ux-research-plan | Adequate | The plan must contain | 3 | 116 | 2 | 232 / 394 / 499 | 307 |
| UI/UX designer | usability-test | Adequate | Task wording; Test plan; Deliverables | 3 | 116 | 2 | 215 / 394 / 524 | 290 |
| Product manager; UI/UX designer | user-flow | Adequate | Flow method; Deliverables | 6 | 203 | 3 | 255 / 448 / 648 | 351 |
| UI/UX designer | ux-review | Adequate | Review method; Deliverables | 4 | 145 | 1 | 236 / 410 / 538 | 311 |
| UI/UX designer | design-handoff | Adequate | The handoff must contain | 5 | 174 | 2 | 235 / 404 / 509 | 313 |
| Software developer; IT or system administrator | incident | Strong | Incident method; Response phases; After the incident | 3 | 116 | 7 | 261 / 430 / 688 | 335 |
| IT or system administrator | ops-script | Strong | Script design; In PowerShell; In Bash; In Python; Deliverables; Edge cases | 5 | 174 | 2 | 249 / 461 / 618 | 324 |
| IT or system administrator | runbook | Adequate | Runbook structure; When it does not go to plan | 5 | 174 | 5 | 213 / 389 / 524 | 290 |
| IT or system administrator | change-plan | Adequate | The plan must contain | 5 | 174 | 5 | 211 / 372 / 521 | 285 |
| Finance or accounting professional | financial-analysis | Strong | Analysis structure; Phases; Deliverables | 5 | 170 | 5 | 258 / 452 / 663 | 363 |
| Entrepreneur or small business owner; Finance or accounting professional | budget-forecast | Strong | Forecast structure; Assumptions, scenarios and checks; Deliverables; Forecast risks | 5 | 170 | 2 | 250 / 577 / 725 | 358 |
| Finance or accounting professional | variance-analysis | Adequate | Variance method | 4 | 141 | 4 | 237 / 456 / 610 | 341 |
| Finance or accounting professional | reconciliation | Adequate | Deliverables | 2 | 83 | 3 | 218 / 407 / 525 | 323 |
| Legal professional | contract-review | Adequate | Clauses to check; Deliverables | 4 | 145 | 3 | 303 / 493 / 629 | 410 |
| Legal professional | legal-research | Adequate | Research method | 3 | 116 | 1 | 272 / 501 / 646 | 384 |
| Legal professional | clause-draft | Adequate | Drafting method; Deliverables | 4 | 145 | 2 | 238 / 417 / 548 | 328 |

## 6. Product-quality review (2026-11-18)

Five journeys were generated and read in full: healthcare API testing with Postman and Jira, test scenario design for a banking password reset with TestRail and Jira, a healthcare code review with GitHub, a Runway-style text-to-video prompt, and a sales dashboard with Excel and Power BI. Defects found and fixed:

| Defect | Fix |
| --- | --- |
| The AI's self-check repeated checklist lines addressed to the person ("You checked each finding yourself before acting on it"), 14 such lines across the blueprints | Lines that start with "You" stay in the pack's checklist only |
| A banking password-reset test design received payment-testing method lines (currency precision, refunds) | A domain's method lines need words about its own work (payments, refunds, transfers, cards); the sector word alone gives the safeguards only |
| The healthcare method line for software said "Design for an audit trail" even in a code review | Reworded to fit building and reviewing |
| Code review had three overlapping checklists (its own, the family's engineering checks, the requirements) and a build-oriented "investigate the code" section | Its own "Context of the change" and review checklist replace the family's sections |
| A clip length typed as "8" read "About 8 long" in text-to-video and image-to-video prompts | A bare number is written as seconds |
| "Test cases and a Postman collection outline" changed nothing in the API testing prompt | The answer now asks for the collection outline |
| The prompt check reported choice answers as unused, because a choice becomes an instruction rather than a quote | The check compares typed answers only |
| For testing, coding and data tasks the six AI products offered were all specialist platforms (for example six testing platforms), so ChatGPT, Claude and Gemini never appeared where the prompt is pasted | When a task names general assistants, up to three keep a place |
| The coverage rule counted an edge-case list at Very detailed as a method | Stricter rule; seven tasks reclassified Thin (section 5) |

Not changed, recorded for follow-up: the GitHub entry's general line about proposing changes on a branch also appears in a code review; the dashboard's family "Data quality first" partly overlaps its own preparation section; text-to-video prompts are one generic descriptive paragraph, with no Runway- or Higgsfield-specific syntax (no dated documentation was checked; Higgsfield is not in the AI Directory).

## 7. Quality batch (2026-11-18)

**The seven Thin tasks.** Each now has its own method, following the visitor's answers where they change the work:

| Task | Method added | Now |
| --- | --- | --- |
| Marketing copy | Copy brief (objective, audience, problem, value, offer, difference, one action), claims list with supporting facts, message hierarchy, brand voice and channel limits; landing page, email and advert variants by placement; deliverables with headline variants, claims table and how to measure | Strong |
| Refactor | Inspection of dependents and limits, named code smells and scope, characterisation tests where tests are missing; one named refactoring per step with the tests run after each; deliverables with performance and security notes and rollback | Strong |
| Regression testing | Change-impact analysis with critical journeys; selection by impact using the existing automation; data and environments; execution evidence, defect decisions and exit criteria | Adequate (no deliverable specification of its own) |
| Performance testing | Objectives from the visitor's targets (never invented), workload model with marked assumptions; baseline, load, stress, spike and endurance; percentiles, throughput, errors and resources; diagnosis and repeat runs | Strong |
| Assessment (the teacher's assessment of learners) | Objectives table with levels of thinking; multiple-choice or open-question methods by type; fairness, access and feedback; answer key, mark scheme and results template | Strong |
| Ops script | Objective, environment, preconditions and least permissions; validation, idempotency and dry run; error handling and logging; PowerShell, Bash or Python specifics by the shell chosen; recovery, rollback and README | Strong |
| Budget forecast | Purpose and base from the visitor's figures (gaps are asked for), drivers, fixed and variable costs, cash view and lowest point; assumptions table, scenarios, sensitivity, reconciliation and variance plan | Strong |

**Graphic designer.** A new task, "A graphic design brief" (`graphic-design`, design family), gives the profession a professional brief apart from its five image-generation prompts: the brief, two or three concept directions and a production specification, with visual hierarchy and composition, typography, colour and WCAG 2.2 contrast, asset licences, and a workflow per kind of design (social graphic, marketing graphic, presentation, brand identity, layout). Its own working rule replaces the UX family's research rule, and its own edge cases replace the family's screen states. Presentation gained a slide-design section and social posts a visual-per-post deliverable. The image-generation tasks stay one-paragraph prompts for a generator.

**Overlaps removed.** GitHub's authoring line ("work on a branch and propose a pull request") is left out of code reviews (`howNot`); the dashboard's own data-preparation section replaces the family's "Data quality first" and keeps its checks (grain, duplicates, trusted totals).

**Media platforms, checked 2026-11-18 on official pages only:**

| Platform | Official page | What it confirms | Status in the Workbench |
| --- | --- | --- | --- |
| Runway | docs.dev.runwayml.com (API guide); the help centre's prompting guide refused access (403) | Text-to-video and image-to-video; image-to-video needs an input image with the prompt text; length and ratio are settings | AI Directory product, not a tool entry; the video packs now say to set length and aspect ratio in the tool; no Runway prompt syntax claimed |
| Higgsfield | higgsfield.ai | Creates images, videos and voice; editing and upscaling; "cinematic camera control" in its page metadata; no prompt guidance published there | Not added (not in the AI Directory); no claims made |
| Canva | canva.com/help (403) | Nothing | Unverified, general terms only |
| CapCut | capcut.com | Timeline, auto captions, templates (export and aspect ratio not on that page) | Unverified, general terms only |
| Adobe Premiere Pro | helpx.adobe.com user guide (403) | Nothing | Unverified, general terms only |
| DaVinci Resolve | blackmagicdesign.com/products/davinciresolve | The Media, Cut, Edit, Fusion, Color, Fairlight and Deliver pages; timelines (no "media pool" on that page) | Checked: terms corrected to the page's own |
| Audacity | manual.audacityteam.org (403) | Nothing | Unverified, general terms only |

12 of 76 tools are now checked against a dated official page.

**Tests added** (`ai-workbench-strategy.test.mjs`): the seven methods each present, following the answers, and absent from one another; the design brief changing with what is designed and staying apart from the image prompt; the overlaps gone where they did not fit and kept where they do; the task and answers kept in the full and concise prompts across strategies; a missing forecast base asked for, never invented. The real-platform test set (five prompts with selections, full and concise versions and criteria) is in `25` section 4; it has not been run.
