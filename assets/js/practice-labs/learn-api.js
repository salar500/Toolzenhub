/* =========================================================
   ToolZen Hub
   API request tasks (the apitask block): the learner builds an HTTP request; web/mock-api.js answers it inside the page
   and the task's goal is checked. Nothing is sent over the network; nothing is stored. Drawn with DOM methods only.
========================================================= */

import { API_TASKS, REASONS, handle, meetsGoal, toRequest } from "./web/mock-api.js";

const ALL = new Map(API_TASKS.map((task) => [task.id, task]));

function node(tag, text, className) {
    const n = document.createElement(tag);
    if (text != null) n.textContent = text;
    if (className) n.className = className;
    return n;
}

export function initApiTasks(root = document) {
    for (const block of root.querySelectorAll("[data-apitask]")) {
        const task = ALL.get(block.dataset.apitask);
        if (!task) continue;
        const tools = block.querySelector("[data-api-tools]");
        const field = (name) => block.querySelector(`[data-api-field="${name}"]`);
        const out = block.querySelector("[data-api-out]");
        tools.hidden = false;
        block.querySelector("[data-api-send]").addEventListener("click", () => {
            const fields = { method: field("method").value, target: field("target").value, headers: field("headers").value, body: field("body").value };
            const request = toRequest(fields);
            const response = handle(request);
            const goal = meetsGoal(task.goal, request, response);
            out.replaceChildren();
            out.dataset.verdict = goal.met ? "correct" : "not-yet";
            out.append(node("p", goal.met ? "Goal met." : `Not yet. ${goal.reasons.join(" ")}`));
            const lines = [`HTTP/1.1 ${response.status} ${REASONS[response.status] ?? ""}`, ...Object.entries(response.headers).map(([k, v]) => `${k}: ${v}`)];
            if (response.body !== null) lines.push("", JSON.stringify(response.body, null, 2));
            out.append(node("p", "Response:"), node("pre", lines.join("\n"), "lx-code"));
            out.querySelector("pre").tabIndex = 0;
            if (goal.met) block.querySelector("details").open = true;
        });
        block.querySelector("[data-api-reset]").addEventListener("click", () => {
            for (const name of ["method", "target", "headers", "body"]) field(name).value = task.start[name];
            out.replaceChildren(); delete out.dataset.verdict;
        });
    }
}
