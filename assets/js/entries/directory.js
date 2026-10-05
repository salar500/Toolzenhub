/* =========================================================
   ToolZen Hub
   Directory page entry (All Tools and the category pages)

   These pages are generated complete: breadcrumb, intro, the
   tools, the header, the footer and every SEO tag. The script
   only binds the header menu and renders the footer's script
   behaviour. It deliberately imports nothing else.
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderHeader();
        renderFooter();
    }
);
