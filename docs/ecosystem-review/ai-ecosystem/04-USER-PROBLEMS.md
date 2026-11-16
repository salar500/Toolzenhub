# 04. User problem research

Evidence classes per rulebook 12.4: **V** verified data, **P** public evidence, **H** reasoned hypothesis, **U** unknown. Source ids in `01`.

## 1. Who we design for

One shared system for people who use AI repeatedly, with professions as optional context (rulebook 4.11; no profession pages). Background evidence: 28 % of employed US adults used ChatGPT for work in early 2025, up 20 points in two years (S24, V for that population); writing is the leading work task and mostly edits the user's own text (S25, V for ChatGPT consumer plans); developers use AI widely but distrust its accuracy (S19, V for developers). Professions in the brief (developers, QA, content, creative, research, business, general) are covered by the Workbench's 44 tasks; their recurring jobs are in section 3.

## 2. Problem taxonomy

| # | Problem | User context | Trigger | Current workaround | Frequency evidence | Consequence | Existing solutions | Remaining gap | ToolZenHub answer | Repeat potential | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| U1 | Output is "almost right"; checking takes time | developers, analysts, researchers, anyone publishing | every substantive answer | reread, ask again, ask another AI | S19: 66 % of developers' top frustration (V); S26: >60 % wrong citation answers in AI search (V, 2025 versions) | rework, published errors | vendor "double-check" features (not researched); review agents in coding tools | a neutral check **against the original request** | Output Reviewer | every important answer | high |
| U2 | Not knowing what to ask or what to include | beginners and occasional users; experts in unfamiliar task types | a new kind of task | blog templates, trial and error | S17 articulation barrier (P, expert estimate); S22 vendor guides exist because of it (P) | weak first answers, many retries | vendor prompt tools for developers (S23) | task-specific questions for everyday users | Workbench (exists), launcher | per new task | medium-high |
| U3 | Re-explaining a project in every chat and every product | anyone working over days; people using two or more assistants | new chat, new product, limit reached | copy old text, memory, projects | S1-S9: every vendor built containers and memory (P); S6: a vendor built cross-product import by paste (P); S29 anecdote | lost decisions, inconsistent output | in-product projects and memory; Claude import | neutral, updatable handoff | Context Bridge | weekly or per session | medium-high |
| U4 | Repeating the same recurring task from scratch | creators, QA, analysts, managers | weekly article, release, report | saved prompts in notes, GPTs/Gems/Skills (one product each) | S4 scheduled tasks and S30 reusable objects show vendors see it (P); frequency for ToolZenHub visitors U | time, inconsistent quality | vendor-bound reusable objects | provider-neutral, file-based reuse | Playbooks (pack files) | weekly | medium |
| U5 | Choosing a product for a task | beginners, people moving into a new modality | "which AI makes videos?" | directories with thousands of ranked or paid listings, social media | S28 directories exist at scale (P); confusion level U | wrong product, wasted trial | TAAFT, Futurepedia | dated, unranked, task-matched shortlist | Directory + Workbench | occasional | medium |
| U6 | Long prompts and contradictions hurt results | heavy prompt writers | adding "one more rule" | longer prompts | S20 accuracy drops with input length (V, 2024 models); S21 contradictions reduce performance (P, official) | worse answers | vendor prompt optimizers (S21, S23) | a deterministic check for everyday users | Prompt check (valuable) and compiler rules | per prompt | medium |
| U7 | Creative consistency across images, shots and voices | image, video, audio creators | series, multi-shot video | per-product reference features | S11-S14: vendors built reference objects (P) | drifting characters, re-work | in-product references | a neutral consistency sheet reused across products | Workbench creative blueprints + consistency sheet (deferred Stage 11 store; file now) | per project | medium |
| U8 | Losing intermediate outputs and the stage reached | multi-stage work | long tasks | scrolling chats | H | restart, missed steps | ChatGPT Work, agents (S4, S16) | a stage list with "done when" the user keeps | Workbench stages + pack file | per task | low-medium |
| U9 | Comparing two answers or two products | people asking two assistants | doubt | read both | S29 (anecdote) | missed contradictions | none neutral found | figure and negation conflicts | Compare Two AI Answers (exists) | occasional | low-medium |
| U10 | Not knowing whether an answer is complete in format (sections, length, JSON, table) | developers, analysts, editors | strict deliverables | eyeballing | H | rejected work | none found | deterministic format checks | Output Reviewer | per strict deliverable | medium (H) |

Not turned into features: "AI forgets everything" in general (vendors solve it in-product; ToolZenHub must not store conversations); "too many AI news" (not a tool job); streaks or reminders for AI practice (rulebook 7.7).

## 3. Recurring jobs by context (what the Workbench and playbooks must cover)

| Context | Recurring jobs (examples) | Covered by Workbench today | Gap |
| --- | --- | --- | --- |
| Developers | feature plan, debug, code review, refactor, docs, handoff to a coding agent | requirements, code-feature, debug, code-review, refactor, api-design, tech-docs | agent context file (Context Bridge "coding agent" format) |
| QA | test plan, cases, API tests, automation, regression, defect report, release readiness | 7 testing tasks | release-readiness playbook (stages across existing tasks) |
| Content and marketing | article, posts, copy, script, repurpose, SEO review | 5 content tasks | **email or message** (top everyday writing job, S25); weekly publishing playbook |
| Creators (image, video, audio) | series with consistent look, storyboard, image to video, narration | 13 creative tasks | consistency sheet; pronunciation list (S14) |
| Research and analysis | research plan, literature, data analysis, report | 5 research tasks | **summarise or extract from a document** (frequent, S25 "seeking information") |
| Business | proposal, presentation, project plan, meeting follow-up | plan tasks + Meeting Notes tool | monthly report playbook |
| Learning and careers | learning plan, interview prep | 2 plan tasks | Practice Labs covers deeper learning (other section; link only through Learn and check) |
| General users | write, rewrite, explain, decide | improve tasks, Prompt Builder | the launcher (they do not know task names) |

## 4. What this means

The four strongest problems (U1, U2, U3, U4) map to four product capabilities: **check, prepare, carry, reuse**. ToolZenHub already prepares well; the gaps are carry, check against the request, and reuse. Discovery (U5) supports the others and is not a destination on its own.
