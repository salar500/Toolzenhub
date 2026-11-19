/* =========================================================
   ToolZen Hub
   AI Tools: hand-off between AI tools in the same tab (16 D8)

   One payload per kind, held in this module's memory only. The
   ecosystem workspace swaps AI pages inside one document and
   re-imports only the tool module (tool-mount.js), so this module
   and its payload survive a move from one AI tool to another; a
   reload, a new tab or a direct visit starts empty, by design.
   Nothing is stored. A receiver takes the payload once.

   Kinds: "review"  { request, task, title }   AI Prompt Builder -> AI Answer Checker
   (since D22 the context pack is written inside the Prompt Builder, so it
   needs no hand-off; the QA Workbench and Bug Report pages are retired)
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
