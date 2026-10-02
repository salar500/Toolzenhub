/* =========================================================
   ToolZen Hub
   Article Content Loader Registry

   Purpose:
   "topic/slug" -> () => import(content module)

   DERIVED from the article catalog (data/articles.js), which
   declares each published article's content loader once.
   Coming-soon articles have no loader, so they have no
   individual article page.

   Route:

   /articles/{topic}/{slug}/

   GitHub Pages:

   /Toolzenhub/articles/{topic}/{slug}/
========================================================= */

import {
    articles
} from "../articles.js";


export const articleRegistry =
    Object.fromEntries(
        articles
            .filter(
                article =>
                    article.published &&
                    typeof article.content === "function"
            )
            .map(
                article => [
                    article.key,
                    article.content
                ]
            )
    );
