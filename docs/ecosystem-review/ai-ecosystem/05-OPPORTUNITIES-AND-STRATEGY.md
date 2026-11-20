# 05. Opportunity assessment, prioritisation and product strategy

## 1. Scoring method

Twelve criteria from the brief, each 1 (weak) to 5 (strong). For the "cost" criteria the scale is inverted so that 5 is always good: **Existing** (5 = much already built to reuse), **Maint.** (5 = low upkeep), **Privacy** (5 = no new data risk), **Tech** (5 = low technical risk). Scores are judgment, not measurement (rule 12.3); each row names the evidence that drove it (problem ids from `04`, source ids from `01`). The weighted dimensions of rulebook section 12 are applied as a cross-check in section 3; search demand is **unknown** for every candidate and scored conservatively.

Criteria: Sev(erity), Freq(uency), Rep(eat use), Ctx (contexts served), Time (saved), Diff(erentiation), Existing, Feas(ibility), Maint., Privacy, Tech, Conf(idence of evidence).

## 2. Matrix

| # | Opportunity | Sev | Freq | Rep | Ctx | Time | Diff | Existing | Feas | Maint | Privacy | Tech | Conf | Total /60 | Class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| O1 | Workbench improvements (task launcher, reopen pack, context in, review out, two new tasks) | 4 | 4 | 4 | 5 | 4 | 4 | 5 | 4 | 3 | 5 | 4 | 4 | **50** | Essential |
| O2 | Context Bridge (evolve Context Pack Builder: modes, extraction prompt, update, versions) | 4 | 4 | 5 | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 4 | 3 | **49** | Essential |
| O3 | Output Reviewer (evolve Evidence Checklist: against the request, format, placeholders, claims, review prompt) | 5 | 5 | 4 | 5 | 4 | 4 | 3 | 3 | 4 | 5 | 3 | 4 | **49** | Essential |
| O4 | AI Home launcher ("describe what you need" on the section page) | 3 | 5 | 4 | 5 | 3 | 3 | 4 | 4 | 4 | 5 | 4 | 3 | **47** | Essential (D1) |
| O5 | Reusable playbooks as files (pack round-trip + curated starters) | 3 | 4 | 5 | 4 | 4 | 4 | 3 | 4 | 3 | 5 | 4 | 3 | **46** | High priority |
| O6 | Document summary and email or message tasks in the Workbench | 3 | 4 | 3 | 4 | 3 | 2 | 4 | 5 | 4 | 5 | 5 | 3 | **45** | High priority |
| O7 | Prompt check (deterministic lint of a pasted prompt, inside Prompt Builder) | 3 | 4 | 3 | 4 | 3 | 3 | 4 | 4 | 4 | 5 | 4 | 3 | **44** | Valuable |
| O8 | Creative consistency sheet (file-based; storage stays Stage 11) | 3 | 3 | 4 | 2 | 3 | 4 | 3 | 4 | 4 | 5 | 4 | 3 | **42** | Valuable |
| O9 | Directory: task, input and output fields; "find by task"; verified additions | 3 | 2 | 2 | 4 | 3 | 3 | 4 | 4 | 2 | 5 | 4 | 3 | **39** | High priority (supports O1) |
| O10 | Opt-in browser-local recent packs and context profiles | 3 | 4 | 5 | 4 | 3 | 2 | 1 | 3 | 3 | 2 | 3 | 2 | **35** | Experimental (owner + Privacy page) |
| O11 | Compare three or more answers | 2 | 2 | 2 | 3 | 2 | 3 | 4 | 3 | 4 | 5 | 3 | 2 | **35** | Deferred |
| O12 | AI learning and interview preparation beyond the two Workbench tasks | 2 | 2 | 2 | 2 | 2 | 1 | 3 | 4 | 4 | 5 | 4 | 2 | **33** | Deferred (Practice Labs' AI department owns learning) |
| O13 | Chat-style assistant on ToolZenHub | - | - | - | - | - | - | - | - | - | - | - | - | gate fail | Reject (misleading; needs an API) |
| O14 | Executing prompts through AI APIs, auto-submitting to AI sites, browser extension that reads conversations | - | - | - | - | - | - | - | - | - | - | - | - | gate fail | Reject (rules 1.5, 8.8, 11.7) |
| O15 | Ratings, rankings, "best AI for X", affiliate links | - | - | - | - | - | - | - | - | - | - | - | - | gate fail | Reject (rules 3.1, 3.3, 4.11) |
| O16 | A library of copied prompts | 2 | 3 | 2 | 4 | 2 | 1 | - | - | 1 | 5 | - | 2 | low | Reject (no differentiation; curation burden; Tool Pack 56 section 27) |

Why the top rows win: O1 to O3 each answer one of the four strongest problems (U2, U3, U1) with a deterministic job that an assistant cannot do honestly about itself (checking its own answer against the request; carrying context out of its own product). O4 and O5 multiply them: O4 removes the "which tool?" step, O5 makes the second use fast.

## 3. Cross-check with rulebook section 12

| Opportunity | Search demand (25 %) | Repeat use (25 %) | Usefulness (20 %) | Differentiation (10 %) | Feasibility (10 %) | Trust/privacy/perf (10 %) | Verdict (rule 12.7) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| O1 Workbench | 2 (U) | 4 (H) | 5 (P) | 4 (P) | 4 | 5 | A |
| O2 Context Bridge | 2 (U) | 5 (H) | 4 (P) | 5 (P) | 4 | 4 | A |
| O3 Output Reviewer | 3 (U; "check AI answer" intent is plausible) | 4 (H) | 5 (V: S19, S26) | 4 (P) | 3 | 5 | A |
| O4 AI Home | 2 (U) | 4 (H) | 4 (H) | 3 | 4 | 5 | A (owner decision D1) |
| O5 Playbooks | 1 (U) | 5 (H) | 4 (H) | 4 (P) | 4 | 5 | A |
| O9 Directory | 3 (U) | 2 (H) | 3 (P) | 3 | 4 | 4 | B |

No candidate wins on demand; they win on usefulness and repeat use, which rule 12 allows ("modest demand with exceptional repeat usefulness may"). Repeat use is a hypothesis to measure after release.

## 4. Product strategy

### Positioning
**AI Tools: prepare, carry and check your AI work, for whichever AI you use.** ToolZenHub is the neutral workbench beside the AI products: it does not generate; it makes the person using them faster and more reliable.

### Target jobs (the four verbs)
1. **Prepare**: "I know the outcome; give me what to gather, what to ask and the stages." (Workbench)
2. **Carry**: "Continue this project in another chat or another product without retyping it." (Context Bridge)
3. **Check**: "Tell me what this answer missed, what to verify, and what to ask next." (Output Reviewer, Compare)
4. **Reuse**: "Do last week's task again in two minutes." (pack files, playbook starters)
Discovery (the Directory) supports Prepare.

### Differentiation (stated as reasons a user would choose ToolZenHub, rule 12.5)
- Works with every product; nothing to sign into; the output is a plain file the user owns.
- Asks the few task-specific questions that change the result, and never invents what the user did not say.
- Checks an answer against **the user's own request**, deterministically, and says plainly what it cannot check.
- The second time is faster: reopen the file, change what changed.

### Product principles
1. One portable format family (Work Pack, Context Pack, Review), Markdown with a small machine-readable block, that every AI tool reads and writes (`14` section 3).
2. Deterministic and honest: suggestions are confirmed by the user; heuristics are named as heuristics; nothing is "verified" unless the user verified it.
3. Simple surface, deep data: one input or one choice to start; depth in blueprints.
4. Nothing stored by default; any storage is opt-in, owner-approved and on the Privacy page.
5. Existing URLs and working features are kept; capability grows inside existing tools before any new route.
6. Product-neutral prompts; product-specific text only from verified directory data.

### Non-goals
A chatbot or anything that looks like one answering; AI API calls; agents that act; accounts, sync, billing; ranking AI products; prompt marketplaces; profession pages; an eighth section; engagement mechanics (streaks, badges, reminders).
