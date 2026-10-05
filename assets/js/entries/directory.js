/* =========================================================
   ToolZen Hub
   Directory page entry (All Tools and the category pages)

   These pages are generated complete: breadcrumb, intro, the
   tools, the header, the footer and every SEO tag. The script
   binds the header menu and the footer, and starts the search on
   the All Tools page. Nothing else is loaded.
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderHeader();
        renderFooter();

        /* only the All Tools page has a search */
        if (document.querySelector("[data-tools-search]")) {

            import("../pages/directory/tools-search.js")
                .then(module => module.initializeToolsSearch());

        }
    }
);
