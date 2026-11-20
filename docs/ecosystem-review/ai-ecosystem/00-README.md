# AI ecosystem programme, Phase 1: research and specification

Status: **Phase 1 complete and design frozen** (2026-11-16; reconciled with the build and re-frozen 2026-11-17, `19` sections 1, 5 and 7). The owner's master directive of 2026-11-16 delegated routine product and design decisions; they are resolved in `16-DECISION-REGISTER.md`, and `17-FINAL-DESIGN.md` is the build specification (it wins where `06`-`15` differ). Programme checkpoint: `19-IMPLEMENTATION-MAP-AND-FREEZE.md` section 4.

**Current structure (owner, 2026-11-18, decision D22):** the ecosystem is three products, the **AI Prompt Builder** (`/tools/prompt-builder/`, the former AI Workbench, central), the **AI Answer Checker** (`/tools/ai-answer-checker/`, review one answer or compare two) and the **AI Directory**. The documents below describe the programme as it was designed and built; where they name the Workbench, the Context Bridge, the Output Reviewer or the other retired tools, read `26-CONSOLIDATION.md` for where each now lives.

Programme: AI Tools only (rulebook 4.11). Phase 1 research and specification (this folder), Phase 2 development, Phase 3 AI-only testing and production readiness. The other six ecosystems are out of scope and were not audited.

Repository state when the research started: branch `feature/unified-ecosystem-workspace`, HEAD `7b339d7f`, working tree clean.

## The three questions, answered

1. **What do frequent AI users repeatedly struggle with across products?** Four things, in this order of evidence strength: (a) **checking output** that is "almost right" (Stack Overflow 2025: 66 % of developers name it their top frustration; Tow Center 2025: AI search tools answered over 60 % of citation queries incorrectly); (b) **saying what they need** (the articulation barrier: knowing what to include, what format, what "done" means); (c) **context that does not travel** (each product's projects, memory and reusable instructions are locked to that product; the official cross-product path today is copy and paste); (d) **repeating the same work** (recurring tasks rebuilt from memory). Evidence and confidence: `04-USER-PROBLEMS.md`.
2. **What can ToolZenHub do exceptionally well without generating anything?** Structured, task-specific elicitation (the right few questions, nothing invented); **portable, provider-neutral work files** (Work Pack, Context Pack, Review) in Markdown that open again in ToolZenHub and paste into any product; **deterministic checks** a model is bad at being honest about (format compliance, placeholders left, requirements visibly not addressed, figures and claims to verify, contradictions between two answers) plus review prompts for the rest; and neutral, dated, unranked product discovery. `05-OPPORTUNITIES-AND-STRATEGY.md`.
3. **Why would someone return weekly?** Because the second time is much faster: open last week's pack file, change two answers, get a new pack; update a project handoff instead of rewriting it; run every important answer through the reviewer. All of this works **without storing anything** (the file is the memory). Repeat use is a reasoned hypothesis: there is no usage data, and it must be measured after release (consent-based GA4 page views of the tools only; never tool input).

## Recommended product in one paragraph

**"Prepare, carry and check your AI work, for whichever AI you use."** AI Tools becomes a small connected system around one portable file format: the **AI Home** (the existing section page with a "describe what you need" launcher) sends the visitor to the right task; the **Workbench** prepares the work (existing, improved: task-level launcher, reopen a saved pack, playbook starters, project context in, review hand-off out); the **Context Bridge** (the Project Context Pack Builder, evolved) carries a project between products and sessions; the **Output Reviewer** (the AI Answer Evidence Checklist, evolved) checks what came back against what was asked; the **Directory** helps choose a product by task. No chatbot, no API, no account, no storage by default; every existing URL kept.

## Deliverable map

| # | Deliverable | Document |
| --- | --- | --- |
| 1 | Methodology and source register | `01-METHOD-AND-SOURCES.md` |
| (audit) | Existing AI ecosystem audit | `02-EXISTING-ECOSYSTEM-AUDIT.md` |
| 2 | Competitor research and matrix | `03-COMPETITOR-RESEARCH.md` |
| 3 | User problem research | `04-USER-PROBLEMS.md` |
| 4, 5 | Opportunity assessment, prioritisation, product strategy | `05-OPPORTUNITIES-AND-STRATEGY.md` |
| 6, 7 | Information architecture, AI Home, user journeys | `06-IA-HOME-AND-JOURNEYS.md` |
| 8 | AI Workbench specification | `07-WORKBENCH-SPEC.md` |
| 9 | AI Context Bridge specification | `08-CONTEXT-BRIDGE-SPEC.md` |
| 10 | AI Output Reviewer specification | `09-OUTPUT-REVIEWER-SPEC.md` |
| 11 | Reusable Playbook specification | `10-PLAYBOOKS-SPEC.md` |
| 12 | AI Directory research | `11-DIRECTORY-RESEARCH.md` |
| 13 | Prompt engineering research | `12-PROMPT-RESEARCH.md` |
| 14 | Micro-level UX specification | `13-UX-SPEC.md` |
| 15 | Technical feasibility | `14-TECHNICAL-FEASIBILITY.md` |
| 16, 17 | Production scope, Phase 2 and Phase 3 handoff | `15-SCOPE-AND-HANDOFFS.md` |
| (decisions) | Final product decision register (D1-D16) | `16-DECISION-REGISTER.md` |
| (design) | Final design: pages, states, microcopy, compiler rules, data models, responsive, themes, accessibility, privacy, journeys, matcher, playbooks, architecture, performance, the two renamed tools | `17-FINAL-DESIGN.md` |
| (matrix) | Task blueprint and prompt matrix, permutations | `18-TASK-BLUEPRINT-MATRIX.md` |
| (map) | Implementation map, design-freeze gate, checkpoint log | `19-IMPLEMENTATION-MAP-AND-FREEZE.md` |
| (D18) | Professions, tasks and professional tool intelligence in the AI Workbench: research, sources, rules, results | `20-ROLES-TASKS-TOOLS.md` |
| (D19) | The professional prompt engine: gap analysis, design, prompt detail levels, sources, results, limitations | `21-PROFESSIONAL-PROMPT-ENGINE.md` |
| (D19) | Nine generated prompts: three journeys at Standard, Detailed and Very detailed, with word counts | `22-PROMPT-ENGINE-EXAMPLES.md` |
| (D20) | The guided single panel: steps, behaviour, lazy loading, accessibility, performance | `23-GUIDED-PANEL.md` |
| (D21) | Strategy engine, concise prompts, domain method, prompt check, and the coverage audit of all 84 tasks | `24-STRATEGY-ENGINE.md` |
| (D21) | 24 benchmark journeys across the professions and one-change comparisons | `25-BENCHMARK-JOURNEYS.md` |
| (D22) | Three AI products: the AI Prompt Builder (the former Workbench, central), the AI Answer Checker, the AI Directory; what was absorbed, what was discontinued, the redirects | `26-CONSOLIDATION.md` |

Not done, by design: hands-on walk-throughs inside competitor products (need accounts and paid plans; see `01` limitations); search-volume data (none available; rule 12.4).
