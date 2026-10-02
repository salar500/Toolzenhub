/* =========================================================
   ToolZen Hub
   Article page entry

   Generated article pages already contain the whole article
   (hero, takeaways, sections, FAQ, related ...), the header
   and footer, and every SEO tag. The script only binds the
   header menu, the newsletter form and the table-of-contents
   highlight. It deliberately imports nothing else.
========================================================= */

import { renderHeader } from "../components/header.js";
import { renderFooter } from "../components/footer.js";
import { initializeNewsletter } from "../components/newsletter.js";
import { bindArticleInteractions } from "../pages/article/article-interactions.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderHeader();
        renderFooter();
        initializeNewsletter();
        bindArticleInteractions();
    }
);
