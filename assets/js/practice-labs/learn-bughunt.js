/* =========================================================
   ToolZen Hub
   Bug Hunting Simulator (the bughunt block): ShopLite's test release in a frame, a structured bug report, and recognition
   of each finding against the seeded-bug registry (shoplite/bugs.js). Findings are kept in memory for this page view only;
   nothing is stored or sent. Recognition checks what was found (area plus key words), not the quality of the writing.
========================================================= */

import { BUGS, AREAS, matchReport } from "./shoplite/bugs.js";

export function initBugHunt(root = document) {

    for (const block of root.querySelectorAll("[data-bughunt]")) {

        const release = block.dataset.bughunt;
        const total = BUGS.filter((b) => b.release === release).length;
        const form = block.querySelector("form");
        const out = block.querySelector("[data-hunt-out]");
        const list = block.querySelector("[data-hunt-found]");
        const count = block.querySelector("[data-hunt-count]");
        const hints = block.querySelector("[data-hunt-hints]");
        const found = new Set();
        let misses = 0;
        form.hidden = false;

        const say = (kind, text) => { out.dataset.verdict = kind; out.textContent = text; };

        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            if (!data.area || !String(data.steps ?? "").trim() || !String(data.actual ?? "").trim()) {
                say("cannot-check", "Choose the area, and describe at least the steps and what actually happened.");
                return;
            }
            const result = matchReport(data, release, found);
            if (result.bug && result.duplicate) { say("not-yet", `You already found this one: ${result.bug.title}.`); return; }
            if (result.bug) {
                found.add(result.bug.id);
                const li = document.createElement("li");
                li.textContent = `${result.bug.title} (breaks ${result.bug.requirement}, usual severity ${result.bug.severity})`;
                list.append(li);
                count.textContent = `Found ${found.size} of ${total}`;
                say("correct", found.size === total ? `Found: ${result.bug.title}. You found every seeded bug in this release.` : `Found: ${result.bug.title}.`);
                form.reset();
                return;
            }
            misses += 1;
            say("not-yet", result.reason === "no-bug-in-area"
                ? `No seeded bug is known in the ${data.area} area of this release. It may still be worth noting, but look elsewhere.`
                : "Not recognised as one of the seeded bugs. Check that your steps and actual result name the exact value or action that misbehaved.");
            if (misses >= 3) {
                const left = AREAS.map((area) => [area, BUGS.filter((b) => b.release === release && b.area === area && !found.has(b.id)).length]).filter(([, n]) => n > 0);
                hints.textContent = `Hint: unfound bugs remain in ${left.map(([area, n]) => `${area} (${n})`).join(", ")}.`;
            }
        });

    }

}
