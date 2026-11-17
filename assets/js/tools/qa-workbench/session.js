/* =========================================================
   ToolZen Hub
   QA Workbench: the open project in this tab's memory (QD30). Only
   the tool's entry module is imported again when the workspace shows
   it in place, so this module keeps its value until the page itself
   ends. Not saving: no browser storage is used.
========================================================= */

let current = null;

/** { project, dirty, downloadedAt, stage, build, decision, notes }, or null */
export const getSession = () => current;

export function setSession(session) {

    current = session;

}
