# 03. Competitor research

Sources are the ids in `01`. All product statements are as of 2026-11-16 and **reconstructed from documentation and coverage, not from hands-on use** (limitation in `01` section 2). "Not observed" means the journey step could not be established from the sources.

## 1. The pattern across the market

Every major product has converged on the same four objects, each **locked inside that product**:

| Object | ChatGPT | Claude | Gemini | Perplexity | Coding assistants | Creative tools |
| --- | --- | --- | --- | --- | --- | --- |
| Project container (chats + files + instructions) | Projects (S1, S2) | Projects (S5) | Notebooks / Gemini Notebook (S7, S8) | Spaces, reported renamed Projects (S9) | the repository | Runway projects; Flow projects (S12) |
| Persistent memory | Memory (S3) | Memory, with import from other assistants by copy-paste (S6) | (not researched) | (not researched) | CLAUDE.md, AGENTS.md, Cursor rules, copilot-instructions (S15) | style references, elements, ingredients (S11-S13) |
| Reusable instruction object | Custom GPTs (S30) | Skills (S30) | Gems (S30) | Space instructions (S9) | rules files, plan mode (S15, S16) | Runway workflow library (S10) |
| Long task to finished deliverable | ChatGPT Work (S4) | artifacts, files | Notebook outputs (S8) | research answers | agents with plan approval (S16) | Scenebuilder, workflows (S10, S12) |

**Lesson 1, verified (public evidence):** the market already solves "keep context inside one product" well. **Lesson 2:** nobody neutral solves "carry it to the next product". The only cross-product path an official vendor offers is a prompt the user runs in the old product and pastes into the new one (Claude's memory import, S6), and coding plans have no portable format (S31, secondary). **Lesson 3:** reusable instructions are vendor objects; a user of two assistants keeps two copies. These three lessons are the strategic opening (`05`).

## 2. Product-by-product

Format per product: target jobs; key capabilities; journey notes (discovery, first view, missing information, context, output, edit, continue, reuse, failure, limits, mobile, repeat use); strengths; weaknesses (only with evidence); lessons; what not to copy; ToolZenHub differentiation.

### 2.1 ChatGPT (OpenAI)
- Jobs: practical guidance, information, writing (S25: about 80 % of consumer conversations are these three; writing leads work use and mostly edits the user's own text).
- Capabilities: projects with files, instructions and project memory (S1, S2); memory across chats (S3); Work mode for long multi-step deliverables with scheduled tasks and approval levels (S4, secondary); custom GPTs (S30).
- Journey: single central input; projects are a sidebar container; missing information is handled by the model asking or assuming (not observed in detail); outputs in chat or files; reuse through projects, GPTs and scheduled tasks. Mobile app exists (not observed).
- Strengths: one input for everything; deep reuse inside ChatGPT. Weaknesses: context does not leave ChatGPT except by copy and paste (inference from S1-S3, S6).
- Lesson: the **single input** is the familiar starting point (adopted for AI Home, without pretending to answer). Do not copy: chat transcript UI, generated answers.

### 2.2 Claude (Anthropic)
- Capabilities: projects with knowledge used in every chat, RAG mode on paid plans (S5); artifacts beside the chat; memory import by a prompt run elsewhere (S6); Skills (S30); Claude Code plan mode (S16).
- Journey notes: the memory import is a **deterministic, user-run extraction prompt** and a paste back: exactly the pattern ToolZenHub can offer neutrally in every direction.
- Lesson: an extraction prompt plus a fixed format is an honest way to "import" without integration. Do not copy: claims of automatic sync.

### 2.3 Gemini and Gemini Notebook (Google)
- Notebooks in Gemini share sources with NotebookLM (S7); NotebookLM renamed Gemini Notebook, staged by plan (S8); Gems (S30); Workspace prompting guide with persona, task, context, format (S22).
- Lesson: **sources as the unit of a project** (research users think in sources). The Context Bridge keeps a "Sources and references" section with where each came from.

### 2.4 Perplexity
- Spaces with instructions and files (S9); answers with citations. Independent testing found AI search tools, Perplexity included, often mis-cite (S26: Perplexity lowest failure rate in that test, 37 %).
- Lesson: citations on screen are not verification; the Output Reviewer must list every URL and claim for the user to open, never mark them as checked.

### 2.5 Microsoft Copilot
- Copilot Notebooks ground chats in chosen files and meeting notes (S27 coverage). Pages not researched. Lesson: same container pattern inside Microsoft 365.

### 2.6 Grok, Qwen, Kimi
- Not researched in depth (no reliable primary page in this pass). Grok 3 search had the highest citation failure rate in S26 (94 %, secondary figure). Gap recorded.

### 2.7 Research tools: Gemini Notebook, Elicit, Consensus, Semantic Scholar
- In the directory (S32). Pattern: source collection, citation, evidence tables. Lesson for ToolZenHub: research blueprints must separate evidence from interpretation (already in the compiler's `evidence` refinement and `NO_FABRICATION`).

### 2.8 Creative: Midjourney, Adobe Firefly, Runway, Kling, Google Flow, Higgsfield
- Consistency is solved with **reference objects**: style and omni references (S11), elements from 2 to 4 reference images (S13), ingredients reused across clips (S12). Runway adds node workflows with LLM nodes for prompt refinement and a workflow library (S10).
- Journey: the creative user's real preparation is a **reference set** (character sheet, style images, shot list) plus per-shot prompts. Products differ in syntax; the Workbench must not invent syntax (spec rule, kept).
- Lesson: a provider-neutral **consistency sheet** (subject, look, palette, lighting, camera, "never change" list) reused across shots is the transferable part. Do not copy: parameter syntax (`--sref` and similar) unless the directory records it from the official page.
- Higgsfield not researched (gap).

### 2.9 Audio: ElevenLabs, Descript, Suno
- ElevenLabs projects take a whole document; pronunciation dictionaries attach to projects (S14). Lesson: a **pronunciation list** and a voice brief are the reusable assets of narration work; add both to the audio blueprints' preparation. Suno not researched (gap).

### 2.10 Coding: GitHub Copilot, Claude Code, Cursor, Windsurf, Replit, Google AI Studio
- Instruction files per tool, with AGENTS.md as an emerging shared format (S15); plan mode before edits (S16); plans not portable (S31, secondary). Developers distrust accuracy and lose time on "almost right" code (S19).
- Lesson: ToolZenHub can produce **one context file that suits several tools** (the Context Bridge's "coding agent" format: AGENTS.md-style Markdown, with a note that the user may save it under the name their tool reads). Do not copy: running agents.

### 2.11 Workflow and automation: Runway workflows, Zapier, n8n
- Node canvases and libraries of copyable templates (S10). Lesson: **copy a template, then customise** is the reuse model users know; ToolZenHub playbooks follow it without an execution engine.

### 2.12 Discovery: There's An AI For That, Futurepedia
- Natural-language task search over tens of thousands of listings; category and attribute filters; "verified" marks and paid placement models (S28, secondary).
- Lesson: task-first search is expected. Differentiation for ToolZenHub: **few, dated, unranked entries tied to the Workbench's tasks**, never volume.

### 2.13 Prompt tools: Anthropic prompt generator and improver, OpenAI prompt optimizer
- Developer-console tools that write or rewrite prompts for that vendor's models (S21, S23). They need an account and work inside one platform.
- Lesson: deterministic prompt checks (missing deliverable, contradictions, missing format) are a gap for non-developers; candidate "Prompt check" (`05`, valuable).

## 3. Comparison matrix (ToolZenHub's opportunity columns)

Key: ● built in; ◐ partial or plan-dependent; ○ not offered; ? not established.

| Capability | ChatGPT | Claude | Gemini | Perplexity | Coding tools | Creative tools | Directories | ToolZenHub today | ToolZenHub target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Generates answers | ● | ● | ● | ● | ● | ● | ○ | ○ | ○ (by design) |
| Project context inside the product | ● | ● | ● | ● | ● | ◐ | ○ | ○ | ○ (not its job) |
| Context portable to another product | ○ | ◐ import by paste | ? | ? | ◐ AGENTS.md | ○ | ○ | ◐ Context Pack (no update) | ● Context Bridge |
| Task-specific question sets before work | ○ | ○ | ○ | ○ | ◐ plan mode | ○ | ○ | ● Workbench | ● |
| Staged plan with completion criteria | ◐ Work | ◐ | ? | ○ | ● | ◐ workflows | ○ | ● | ● |
| Reusable workflow, provider-neutral | ○ | ◐ Skills | ○ | ○ | ◐ | ○ | ○ | ○ | ● playbooks as files |
| Review of an answer against the request | ○ | ○ | ○ | ○ | ◐ review agents | ○ | ○ | ◐ claim checklist | ● Output Reviewer |
| Product choice by task, unranked, dated | ○ | ○ | ○ | ○ | ○ | ○ | ◐ ranked/paid | ◐ by category | ● by task |
| No account | ○ | ○ | ○ | ◐ | ○ | ○ | ◐ | ● | ● |

## 4. Gaps in this research

Hands-on first-run, failure and mobile behaviour of each product; Grok, Qwen, Kimi, Windsurf, Replit, Higgsfield, Suno; plan-specific limits. None of them changes the strategic conclusion, which rests on the shared pattern in section 1; each is a re-check item before any product-specific text is shown on a page.
