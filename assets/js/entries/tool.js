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
import { initializeNewsletter } from "../components/newsletter.js";
import { renderToolError, renderToolNotFound } from "../pages/tool-messages.js";

async function startTool() {

    renderHeader();
    renderFooter();
    initializeNewsletter();

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

        const module =
            await import(source);

        if (typeof module.init !== "function") {

            console.error(`Tool module ${source} does not export init().`);

            renderToolNotFound();

            return;

        }

        module.init(app);

    } catch (error) {

        console.error(`Failed to load tool module ${source}:`, error);

        renderToolError();

    }

}

document.addEventListener(
    "DOMContentLoaded",
    startTool
);
