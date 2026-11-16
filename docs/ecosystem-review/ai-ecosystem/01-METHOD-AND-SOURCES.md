# 01. Research method and source register

## 1. Method

1. **Repository first.** The AI Tools code, catalog entries, specs (Tool Packs 56 and 58), tests and the AI Directory data were read at HEAD `7b339d7f` (`02-EXISTING-ECOSYSTEM-AUDIT.md`). Counts were recounted from the source, not taken from earlier reports.
2. **External research** by targeted web search (about 25 queries) and direct fetch of primary pages where the search summary was not enough. Official sources were preferred; independent research next; secondary coverage and community posts only for problems and for features the official page did not show.
3. **Synthesis** into problems, opportunities, a scored prioritisation and specifications, each claim labelled with its evidence class (rulebook 12.4): **verified data**, **public evidence**, **reasoned hypothesis**, **unknown**.

All sources were accessed on **2026-11-16**. "Official" means the product's own company; "independent" means a research body or publication not selling the product; "secondary" means a blog, review or news report about it.

## 2. Limitations (read before relying on any finding)

- **No hands-on competitor walk-throughs.** The journeys in `03` are reconstructed from official help pages, announcements and reviews, not from using each product with an account. First-run screens, mobile behaviour and failure states were not observed and are marked as such.
- **Several help-centre pages were seen only through search excerpts** (ChatGPT Projects, Claude Projects, Perplexity Spaces, Midjourney Style Reference). Plan limits and file limits differ between sources and are not repeated here as facts.
- **Products change monthly.** Names changed during 2026 (NotebookLM is now Gemini Notebook; Perplexity Spaces are reported to be called Projects). Every product statement is dated 2026-11-16 and must be re-checked before it is shown on a page.
- **No demand data.** No Search Console, Keyword Planner or Trends figure was available. Search demand and repeat use are hypotheses throughout (rule 12.2).
- **Survey figures are from their populations** (US adults for Pew; developers for Stack Overflow; ChatGPT consumer messages for the NBER paper) and are not generalised to ToolZenHub visitors.
- **Not researched in depth** for lack of reliable primary pages in this pass: Grok, Qwen, Kimi, Windsurf, Replit, Higgsfield, Suno, Descript beyond the directory entry, Copilot Pages. They are listed as gaps in `03`, not judged.

## 3. Source register

| Id | Source | Type | Date of source | What it establishes | What it does not |
| --- | --- | --- | --- | --- | --- |
| S1 | OpenAI Help, "Projects in ChatGPT" (help.openai.com/en/articles/10169521) | official | current page | Projects group chats, files and instructions; project memory covers the project's chats and files | Plan limits (not seen) |
| S2 | OpenAI Academy, "Projects" (openai.com/academy/projects) | official | 2026-04-10 | A project holds chats, files, instructions and context; shared projects on supported plans | Which plans |
| S3 | OpenAI Help, "Memory FAQ" (help.openai.com/en/articles/8590148) | official | current page | Memory draws on past chats; turning memory off does not delete chats | Cross-product transfer |
| S4 | ChatGPT Work launch coverage (androidauthority.com/chatgpt-work-launch-3685935; aicatchup.com/news/chatgpt-work-agent-launch) | secondary | reported 2026-07-09 | An agent mode for long-running tasks ending in files; scheduled tasks; approval levels | Official wording (OpenAI page not reached) |
| S5 | Claude Help, "What are projects" (support.claude.com/en/articles/9519177) | official (excerpt) | current page | Project knowledge is used in every chat of the project; chats do not share context unless added to knowledge; RAG mode on paid plans | Exact limits |
| S6 | Claude memory import coverage (pcworld.com/article/3076376; tomsguide.com) | secondary | March 2026 | Import is copy-paste: Claude gives a prompt to run in the other assistant, the user pastes the result back; no one-click transfer | Plan availability (sources disagree) |
| S7 | Google blog, "Try notebooks in Gemini" (blog.google/innovation-and-ai/products/gemini-app/notebooks-gemini-notebooklm/) | official | 2026-04-08 | Notebooks in Gemini as personal knowledge bases; sources sync with NotebookLM | Final tier availability |
| S8 | Google blog, "NotebookLM is now Gemini Notebook" (blog.google/innovation-and-ai/products/gemini-notebook/notebooklm-gemini-notebook/) | official | 2026-07-16 | Rename; same standalone product; staged rollout by plan | Feature limits |
| S9 | Perplexity Help, "What are Spaces" (intercom.help/perplexity-ai/en/articles/10352961) and secondary reports | official + secondary | current | Spaces hold instructions and files for threads; reported rename to Projects | Limits (sources disagree) |
| S10 | Runway Workflows (runway.com/workflows; help.runwayml.com/hc/en-us/articles/45763528999699); alternativeto.net news Oct 2025 | official + secondary | 2025-10 onward | Node-based workflows: input, media model and LLM nodes; a workflow library to copy and customise | General availability today |
| S11 | Midjourney docs, Style Reference (docs.midjourney.com/docs/style-reference) | official (excerpt) | current | Style references combine with character/omni references and image prompts | Parameter limits (only secondary) |
| S12 | Google blog, "Meet Flow" (blog.google/technology/ai/google-flow-veo-ai-filmmaking-tool/); labs.google Flow FAQ | official | 2025-05 and later | Ingredients (reusable subjects and scenes) for consistency; Scenebuilder; available through Google AI Pro and Ultra | Current Veo version per feature (FAQs differ) |
| S13 | Kling element library guide (kling.ai/quickstart/klingai-element-library-3-user-guide) | official | current | Multi-image elements (2 to 4 reference images) to keep characters and props consistent | Limits by model (sources differ) |
| S14 | ElevenLabs docs: Projects (elevenlabs.io/docs/projects/overview), pronunciation dictionaries | official | current | Long-form projects from a whole document; pronunciation dictionaries attached to projects | Plan coverage |
| S15 | agents.md | official (format site) | current | AGENTS.md is a plain-Markdown instruction file for coding agents, nearest file wins; separate tool-specific files (CLAUDE.md, Cursor rules, copilot-instructions) exist | Which tools read it today (sources conflict) |
| S16 | Claude Academy, "Plan mode" (academy.claude.com/courses/ai-native-sdlc-playbook/plan-mode); Cursor blog, "Dynamic planning agents" (cursor.com/blog/dynamic-planning-agents) | official | current | Coding assistants plan before editing and wait for approval | That plans are portable between tools (they are not, per secondary S31) |
| S17 | Jakob Nielsen, "The Articulation Barrier" (uxtigers.com/post/ai-articulation-barrier) | independent expert | 2023 | Named concept: users struggle to put intent into prose; his estimate (not a measurement) that a large share of people cannot do it well | Measured prevalence |
| S18 | Jakob Nielsen, "Prompt Augmentation" (uxtigers.com/post/prompt-augmentation) | independent expert | 2023 | Six UI patterns: style galleries, prompt rewrite, targeted rewrite, related prompts, prompt builders, parametrisation | Their effect size |
| S19 | Stack Overflow, 2025 Developer Survey AI results (stackoverflow.blog/2025/07/29/developers-remain-willing-but-reluctant-to-use-ai-the-2025-developer-survey-results-are-here/) | official survey | 2025-07-29 | 84 % use or plan to use AI tools; more distrust accuracy than trust it; 66 % cite "almost right, but not quite" as top frustration; 45 % say debugging AI code takes longer | Non-developers |
| S20 | Levy, Jacoby, Goldberg, "Same Task, More Tokens" (arXiv 2402.14848, ACL 2024) | peer-reviewed | 2024 | Reasoning accuracy falls with longer input well below context limits (average 0.92 to 0.68 at about 3,000 tokens in their set-up) | Today's models; prompt (rather than padding) length |
| S21 | OpenAI Cookbook, prompt optimization (developers.openai.com/cookbook/examples/gpt-5/prompt-optimization-cookbook) | official | 2025 | Contradictory instructions reduce performance and add latency in reasoning models | Size of the effect |
| S22 | Google, "Prompting guide 101" (services.google.com/fh/files/misc/gemini-for-google-workspace-prompting-guide-101.pdf) | official | 2024-04 | Four elements: persona, task, context, format; not all are needed | Optimal length (the "21 words" figure is secondary only) |
| S23 | Anthropic docs: prompt generator and prompt improver (platform.claude.com/docs/en/prompt-generator; .../prompt-improver) | official | current | Vendor prompt tools exist for developers inside their own console | Use by non-developers |
| S24 | Pew Research, "34 % of U.S. adults have used ChatGPT" (pewresearch.org/short-reads/2025/06/25/...) | independent survey | 2025-06-25 | 28 % of employed US adults used ChatGPT for work (Feb-Mar 2025), up 20 points in two years | Other products; other countries |
| S25 | Chatterji et al., "How People Use ChatGPT", NBER w34255 | working paper (not peer-reviewed) | 2025-09 | Over 70 % of consumer messages are non-work; writing is the leading work task; most writing requests work on the user's own text | Paid business plans; other products |
| S26 | Tow Center / CJR, "AI search has a citation problem", via niemanlab.org/2025/03/ai-search-engines-fail-to-produce-accurate-citations-in-over-60-of-tests/ | independent research | 2025-03 | Eight AI search tools answered over 60 % of 1,600 citation queries incorrectly; fabricated or broken URLs common; rare hedging | Today's versions |
| S27 | Microsoft, 2025 Work Trend Index (blogs.microsoft.com/blog/2025/04/23/...) | vendor research | 2025-04-23 | Large survey of knowledge workers on AI use and capacity strain | Neutral framing (vendor) |
| S28 | Reviews of AI directories (maketecheasier.com/best-ai-tool-directories/; zarla.com guide) | secondary | 2024-2026 | There's An AI For That: task-based natural-language search; Futurepedia: category and attribute filters, "verified" marks | Accuracy of their listings |
| S29 | Reddit r/PromptDesign post: memory does not carry over between ChatGPT and Claude | community, anecdotal | 2025 | One user's recurring re-explaining problem | Frequency |
| S30 | Comparisons of Custom GPTs, Gemini Gems, Claude Skills (dev.to; bootstrapcreative.com) | secondary, low confidence | 2026 | Each vendor has its own reusable-instruction object; each is bound to its product (Skills reported to be readable by several tools) | Exact limits and dates (sources conflict) |
| S31 | Plan mode versus spec-driven development (intent-driven.dev/knowledge/plan-mode-vs-sdd/) | secondary | 2026 | Plans in coding assistants have no portable format; moving work to another tool means re-explaining | Official confirmation |
| S32 | AI Directory data (`assets/js/data/ai-directory.js`) and its research (`docs/ecosystem-review/audience-ecosystems/04-AI-DIRECTORY-PLAN.md`) | repository | 2026-11-15 | 49 products, each checked on its official page | Products left out (listed in the file) |

## 4. Evidence weighting used in this package

- A problem rated **high confidence** has at least one large independent or official survey or study plus consistent public evidence.
- **Medium**: official product behaviour (vendors built a feature for it) plus community reports.
- **Low**: anecdote or reasoning only. Low-confidence findings never decide a "must-have" on their own.
