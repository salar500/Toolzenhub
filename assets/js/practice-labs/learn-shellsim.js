/* =========================================================
   ToolZen Hub
   Shell simulator tasks (the shellsim block): the learner types commands; devops/shell-sim.js runs them on an
   in-memory file system and the task's goal is checked after each command. Up and Down recall earlier commands.
========================================================= */

import { createShell, run } from "./devops/shell-sim.js";
import { SHELL_TASKS, SERVER } from "./devops/shell-tasks.js";

const ALL = new Map(SHELL_TASKS.map((task) => [task.id, task]));

export function initShellSim(root = document) {
    for (const block of root.querySelectorAll("[data-shellsim]")) {
        const task = ALL.get(block.dataset.shellsim);
        if (!task) continue;
        const tools = block.querySelector("[data-sh-tools]");
        const input = block.querySelector("input");
        const term = block.querySelector("[data-sh-term]");
        const prompt = block.querySelector("[data-sh-prompt]");
        const goal = block.querySelector("[data-sh-goal]");
        let sh, history = [], pos = 0;
        const where = () => sh.cwd.replace(/^\/home\/asha/, "~");
        const reset = () => {
            sh = createShell(SERVER); history = []; pos = 0;
            term.textContent = ""; prompt.textContent = `asha@shoplite:${where()}$`;
            goal.textContent = `Goal: ${task.goalText}`; delete goal.dataset.verdict;
        };
        const exec = () => {
            const line = input.value.trim();
            if (!line) return;
            const before = where();
            const output = line === "clear" ? "" : run(sh, line);
            term.textContent = line === "clear" ? "" : `${term.textContent}asha@shoplite:${before}$ ${line}\n${output}`;
            term.scrollTop = term.scrollHeight;
            history.push(line); pos = history.length;
            input.value = "";
            prompt.textContent = `asha@shoplite:${where()}$`;
            if (task.goal(sh)) { goal.dataset.verdict = "correct"; goal.textContent = `Goal met: ${task.goalText}`; block.querySelector("details").open = true; }
        };
        tools.hidden = false;
        reset();
        block.querySelector("[data-sh-run]").addEventListener("click", exec);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") { event.preventDefault(); exec(); }
            else if (event.key === "ArrowUp" && history.length) { event.preventDefault(); pos = Math.max(0, pos - 1); input.value = history[pos]; }
            else if (event.key === "ArrowDown" && history.length) { event.preventDefault(); pos = Math.min(history.length, pos + 1); input.value = history[pos] ?? ""; }
        });
        block.querySelector("[data-sh-reset]").addEventListener("click", reset);
    }
}
