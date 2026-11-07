/* =========================================================
   ToolZen Hub
   Tool mount: start the tool module named by a page's <main id="app" data-tool-module="...">

   One function used both by a tool page when it loads (entries/tool.js) and by the ecosystem workspace when it shows another tool in place
   (ui/workspace-nav.js), so a tool starts exactly the same way in both. Only this page's own module is loaded.
========================================================= */

import { renderToolError, renderToolNotFound } from "../pages/tool-messages.js";
import { addJumpToResult } from "./jump-link.js";
import { watchDateFields } from "./date-field.js";
import { installToolScope } from "./tool-scope.js";

installToolScope();

/* The first tool of a page load is imported as usual. A tool shown later in the same page (the workspace swaps tools in place) is imported
   under a new query string, which makes the browser evaluate the module again, so its own module-level state (cached elements, timers'
   handles) starts empty exactly as on a page load. The file itself comes from the HTTP cache. */
let mounts = 0;

export async function mountTool(app = document.getElementById("app")) {

    const source = app?.dataset.toolModule;

    if (!source) {

        console.error("Tool module not declared on this page.");

        renderToolNotFound();

        return;

    }

    try {

        /* start the slider module while the tool module loads, so a calculator's sliders are wired the moment its
           form is drawn instead of one more network round trip later (the slider used to appear a second or two late) */
        const sliderModule = source.includes("/calculators/")
            ? import("./field-slider.js")
            : null;

        mounts += 1;

        const module =
            await import(mounts === 1 ? source : `${source}?m=${mounts}`);

        if (typeof module.init !== "function") {

            console.error(`Tool module ${source} does not export init().`);

            renderToolNotFound();

            return;

        }

        module.init(app);

        watchDateFields(app); // a calendar button and "Use today" beside every date input, including ones drawn later

        if (source.includes("/calculators/")) {
            addJumpToResult(app);

            /* a slider beside a bounded field (rate, years) that opted in; the number input stays the source of truth */
            if (app.querySelector("input[data-slider-max]")) {
                (await sliderModule).enhanceSliders(app);
            }
        }

    } catch (error) {

        console.error(`Failed to load tool module ${source}:`, error);

        renderToolError();

    }

}
