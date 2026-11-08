/* =========================================================
   ToolZen Hub
   Git simulator tasks (the gitsim block): the learner types git commands; devops/git-sim.js applies them to a modelled
   repository shown beside the terminal, and the task's goal is checked after each command. In memory only.
========================================================= */

import { createRepo, run, status, headCommit } from "./devops/git-sim.js";
import { GIT_TASKS } from "./devops/git-tasks.js";

const ALL = new Map(GIT_TASKS.map((task) => [task.id, task]));

function text(tag, value, className) {
    const n = document.createElement(tag);
    n.textContent = value;
    if (className) n.className = className;
    return n;
}

function drawState(target, repo) {
    const s = status(repo);
    const rows = [
        ["Branch", `${repo.head} (branches: ${Object.keys(repo.branches).sort().join(", ")})`],
        ["Staged", s.staged.map((x) => `${x.file} (${x.kind})`).join(", ") || "nothing"],
        ["Changed, not staged", s.unstaged.map((x) => `${x.file} (${x.kind})`).join(", ") || "nothing"],
        ["Untracked", s.untracked.join(", ") || "nothing"],
        ["Latest commit", `${headCommit(repo).id} ${headCommit(repo).msg}`]
    ];
    const dl = document.createElement("dl");
    dl.className = "learn-gitsim__state";
    for (const [k, v] of rows) dl.append(text("dt", k), text("dd", v));
    target.replaceChildren(dl);
}

export function initGitSim(root = document) {
    for (const block of root.querySelectorAll("[data-gitsim]")) {
        const task = ALL.get(block.dataset.gitsim);
        if (!task) continue;
        const tools = block.querySelector("[data-git-tools]");
        const input = block.querySelector("input");
        const term = block.querySelector("[data-git-term]");
        const state = block.querySelector("[data-git-state]");
        const goal = block.querySelector("[data-git-goal]");
        let repo;
        const reset = () => { repo = createRepo(task.scenario); term.textContent = ""; goal.textContent = `Goal: ${task.goalText}`; delete goal.dataset.verdict; drawState(state, repo); };
        const exec = () => {
            const line = input.value.trim();
            if (!line) return;
            const output = run(repo, line);
            term.textContent += `$ ${line}\n${output ? `${output}\n` : ""}`;
            term.scrollTop = term.scrollHeight;
            input.value = "";
            drawState(state, repo);
            if (task.goal(repo)) { goal.dataset.verdict = "correct"; goal.textContent = `Goal met: ${task.goalText}`; block.querySelector("details").open = true; }
        };
        tools.hidden = false;
        reset();
        block.querySelector("[data-git-run]").addEventListener("click", exec);
        input.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); exec(); } });
        block.querySelector("[data-git-reset]").addEventListener("click", reset);
    }
}
