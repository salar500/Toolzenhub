/* =========================================================
   ToolZen Hub
   Learning: the shared Practice Lab page

   labMarkup(config) builds the static page (introduction, the worked
   example, how it works and the notes) at build time, so the
   explanatory text is in the HTML. initLab(...) validates the lab's
   exercises and mounts the shell in the browser.

   All text in `config` is written in the lab's own source file and is
   escaped here. Nothing from a visitor reaches this file.
========================================================= */

import { escapeHTML as esc } from "../ui/escape.js";
import { validateExerciseSet } from "./content-schema.js";
import { mountLab } from "./lab-shell.js";
import { getToolById } from "../data/tools.js";

const paragraphs = (list) => (list ?? []).map((p) => `<p>${esc(p)}</p>`).join("");

/**
 * config: { id, title, intro, howTo[], worked: { heading, intro, steps[], example? }, sections: [{ heading, paragraphs[], items[] }] }
 */
export function labMarkup(config) {

    const worked = config.worked;

    return `
        <div class="calculator-page">

            <section class="calculator-intro">

                <div>

                    <span class="calculator-eyebrow">
                        Developer Tool
                    </span>

                    <h1>
                        ${esc(config.title)}
                    </h1>

                    <p>
                        ${esc(config.intro)}
                    </p>

                </div>

                <div class="calculator-trust-card">

                    <div class="calculator-trust-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            100% Free to Use
                        </strong>

                        <span>
                            No account, no upload
                        </span>

                    </div>

                </div>

            </section>

            <section class="calculator-info">

                <h2>${esc(worked.heading)}</h2>

                ${paragraphs([worked.intro])}

                ${worked.example ? `<pre class="lx-code" tabindex="0" role="region" aria-label="Worked example"><code>${esc(worked.example)}</code></pre>` : ""}

                <ol>
                    ${worked.steps.map((s) => `<li>${esc(s)}</li>`).join("")}
                </ol>

            </section>

            <section class="calculator-section">

                <div id="lx-app" class="lx-app" data-tool="${esc(config.id)}">
                    <p class="lx-note">
                        The exercises need JavaScript, which runs in your
                        browser. If this message stays, JavaScript is off or
                        the page did not finish loading.
                    </p>
                </div>

                <p id="lx-live" class="lx-sr-only" role="status" aria-live="polite"></p>

            </section>

            <section class="calculator-info">

                <h2>How the Lab Works</h2>

                <ol>
                    ${config.howTo.map((s) => `<li>${esc(s)}</li>`).join("")}
                </ol>

            </section>

            ${(config.sections ?? []).map((s) => `
            <section class="calculator-info">

                <h2>${esc(s.heading)}</h2>

                ${paragraphs(s.paragraphs)}

                ${s.items ? `<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""}

            </section>`).join("")}

        </div>
    `;

}

/**
 * Mount a lab on the page produced by labMarkup. Returns the controller, or null when there is no mount point.
 * lab: see mountLab in lab-shell.js, plus `set` (the exercise set data) which is validated first.
 */
export function initLab({ lab, set }) {

    const root = document.querySelector("#lx-app");
    const live = document.querySelector("#lx-live");

    if (!root) return null;

    const toolIds = { has: (id) => Boolean(getToolById(id)) };
    const problems = validateExerciseSet(set, { toolIds });

    if (problems.length > 0) {
        root.textContent = "These exercises could not be loaded. Reload the page to try again.";
        root.dataset.ready = "true";
        return null;
    }

    const controller = mountLab({ root, live, lab: { ...lab, exercises: set.exercises } });

    root.dataset.ready = "true";

    return controller;

}
