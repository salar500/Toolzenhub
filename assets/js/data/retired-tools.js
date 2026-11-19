/* =========================================================
   ToolZen Hub
   Retired tool pages and where they now live (AI ecosystem
   consolidation, decision D22, 2026-11-18)

   A retired tool has no catalog entry and no tool page. Its old
   address keeps working: the build writes a small page there that
   sends the visitor to the product that now does the job (and the
   production .htaccess answers it with a 301). The page is never
   indexed and never listed in the sitemap; its canonical is the
   new address.

   `query` opens the product at the matching start; with no query
   the visitor's own query and fragment are carried over (an old
   AI Workbench link such as ?outcome=video still works). Ids stay
   reserved in the Growth identity ledger (rule 6.6).
   Pure data; no DOM.
========================================================= */

export const RETIRED_TOOLS = Object.freeze([
    { id: "ai-workbench", title: "AI Workbench", to: "prompt-builder", query: "", now: "The AI Workbench is now the AI Prompt Builder." },
    { id: "bug-report-prompt", title: "Bug Report to Debugging Prompt", to: "prompt-builder", query: "?task=debug", now: "Bug reports are now a task of the AI Prompt Builder: Debug a problem or a bug report." },
    { id: "context-pack-builder", title: "AI Context Bridge", to: "prompt-builder", query: "?start=context", now: "Project context packs are now written in the AI Prompt Builder." },
    { id: "meeting-notes-action-plan", title: "Meeting Notes to Action Plan", to: "prompt-builder", query: "?task=meeting-follow-up", now: "Meeting follow-ups are now a task of the AI Prompt Builder." },
    { id: "qa-workbench", title: "QA Requirement-to-Release Workbench", to: "prompt-builder", query: "?role=qa", now: "QA prompts (requirements, test plans, test cases, defects, release readiness and QA reports) are now in the AI Prompt Builder. QA project records are no longer kept on this site." },
    { id: "ai-answer-checklist", title: "AI Output Reviewer", to: "ai-answer-checker", query: "", now: "The AI Output Reviewer is now the AI Answer Checker's \"Review one answer\" mode." },
    { id: "ai-answer-compare", title: "Compare Two AI Answers", to: "ai-answer-checker", query: "?mode=compare", now: "Comparing two answers is now the AI Answer Checker's \"Compare two answers\" mode." }
]);

export const getRetiredTool = (id) => RETIRED_TOOLS.find((t) => t.id === id) ?? null;
