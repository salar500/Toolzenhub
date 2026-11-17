/* =========================================================
   ToolZen Hub
   AI Tools: hand-off between AI tools in the same tab (16 D8)

   One payload per kind, held in this module's memory only. The
   ecosystem workspace swaps AI pages inside one document and
   re-imports only the tool module (tool-mount.js), so this module
   and its payload survive a move from one AI tool to another; a
   reload, a new tab or a direct visit starts empty, by design.
   Nothing is stored. A receiver takes the payload once.

   Kinds: "review"  { request, task, title }   Workbench or QA Workbench -> Reviewer
          "context" { text }                   Bridge -> Workbench
          "seed"    { project, purpose, task } Workbench -> Bridge
          "task"    { task, answers }          QA Workbench -> Workbench
          "bug"     { observed, expected, steps, environment, evidence }   QA Workbench -> Bug Report
========================================================= */

const payloads = new Map();

export function put(kind, payload) {

    payloads.set(kind, payload);

}

/** The payload of this kind, once; null when there is none. */
export function take(kind) {

    const payload = payloads.get(kind) ?? null;
    payloads.delete(kind);

    return payload;

}
