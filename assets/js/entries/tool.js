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
import { initSectionRail } from "../ui/section-rail.js";
import { mountTool } from "../ui/tool-mount.js";

async function startTool() {

    renderHeader();
    renderFooter();
    initSectionRail();

    await mountTool(document.getElementById("app"));

}

document.addEventListener(
    "DOMContentLoaded",
    startTool
);
