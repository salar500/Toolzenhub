/* =========================================================
   ToolZen Hub
   Tool page entry

   Generated tool pages already contain the finished page
   (tool markup, breadcrumb, related sections), the header and
   footer, and every SEO tag. This script loads ONLY this
   page's own tool module (named by data-tool-module) and
   starts it, so no other tool's code is ever loaded.
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { renderToolError, renderToolNotFound } from "../pages/tool-messages.js";
import { addJumpToResult } from "../ui/jump-link.js";
import { initSectionRail } from "../ui/section-rail.js";

async function startTool() {

    renderHeader();
    renderFooter();
    initSectionRail();

    const app =
        document.getElementById("app");

    const source =
        app?.dataset.toolModule;

    if (!source) {

        console.error("Tool module not declared on this page.");

        renderToolNotFound();

        return;

    }

    try {

        /* start the slider module while the tool module loads, so a calculator's sliders are wired the moment its
           form is drawn instead of one more network round trip later (the slider used to appear a second or two late) */
        const sliderModule = source.includes("/calculators/")
            ? import("../ui/field-slider.js")
            : null;

        const module =
            await import(source);

        if (typeof module.init !== "function") {

            console.error(`Tool module ${source} does not export init().`);

            renderToolNotFound();

            return;

        }

        module.init(app);

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

document.addEventListener(
    "DOMContentLoaded",
    startTool
);
