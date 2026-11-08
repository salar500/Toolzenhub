/* =========================================================
   ToolZen Hub
   HTML and CSS playground (the webplay block): the learner's markup is shown in an iframe sandboxed WITHOUT scripts
   (sandbox="allow-same-origin" only), so it renders but cannot run code, submit forms or navigate the page; the checks
   in web/dom-check.js then read its DOM and computed styles. Nothing is stored or sent.
========================================================= */

import { WEB_EXERCISES } from "./web/web-exercises.js";
import { checkDom } from "./web/dom-check.js";

const ALL = new Map(WEB_EXERCISES.map((exercise) => [exercise.id, exercise]));
const BASE = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><style>body{font:16px/1.5 system-ui,sans-serif;margin:12px;color:#111;background:#fff}</style></head><body>";

export function initWebPlay(root = document) {
    for (const block of root.querySelectorAll("[data-webplay]")) {
        const exercise = ALL.get(block.dataset.webplay);
        if (!exercise) continue;
        const tools = block.querySelector("[data-web-tools]");
        const input = block.querySelector("textarea");
        const frame = block.querySelector("iframe");
        const out = block.querySelector("[data-web-out]");
        tools.hidden = false;
        const report = () => {
            const result = checkDom(exercise, frame.contentDocument, frame.contentWindow);
            out.replaceChildren();
            out.dataset.verdict = result.met === result.total ? "correct" : "not-yet";
            const head = document.createElement("p");
            head.textContent = result.met === result.total ? "All checks met." : `${result.met} of ${result.total} checks met.`;
            const ul = document.createElement("ul");
            ul.className = "learn-rubric";
            for (const item of result.items) {
                const li = document.createElement("li");
                li.dataset.met = String(item.met);
                const strong = document.createElement("strong");
                strong.textContent = `${item.met ? "Met" : "Missing"}: ${item.label}.`;
                li.append(strong);
                if (!item.met) li.append(document.createTextNode(` ${item.advice}`));
                ul.append(li);
            }
            out.append(head, ul);
            if (result.met === result.total) block.querySelector("details").open = true;
        };
        block.querySelector("[data-web-run]").addEventListener("click", () => {
            frame.hidden = false;
            frame.addEventListener("load", report, { once: true });
            frame.srcdoc = `${BASE}${input.value}</body></html>`;
        });
        block.querySelector("[data-web-reset]").addEventListener("click", () => { input.value = exercise.starter; out.replaceChildren(); delete out.dataset.verdict; frame.hidden = true; });
    }
}
