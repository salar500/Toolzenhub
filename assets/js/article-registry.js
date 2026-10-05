/* =========================================================
   ToolZen Hub
   Article Registry

   Purpose:
   Listing view of the article catalog.

   Everything here is DERIVED from the article catalog
   (data/articles.js), which is the single source of truth
   for article identity, status, title, description, dates,
   images and relationships. Nothing is declared twice.

   Used by:

   - Articles listing page
   - Category filtering
   - Sidebar categories
   - Calculator Related Articles
   - Home page articles
   - Individual article URLs

   To add an article, add it ONCE to data/articles.js.
========================================================= */

import {
    articles,
    articleCategories
} from "./data/articles.js";
import { ROUTES } from "./routes.js";


/*
 * published: true  -> the article page exists and is linked.
 * no published flag -> shown as "Coming soon" (not clickable).
 */

export const articleRegistry =
    articles.map(
        article => {

            const category =
                articleCategories.find(
                    item =>
                        item.slug === article.category
                );

            return {
                id:
                    article.id,
                ...(article.published
                    ? { published: true }
                    : {}),
                category:
                    article.category,
                categoryName:
                    category?.name ||
                    article.category,
                topic:
                    article.topic,
                slug:
                    article.slug,
                title:
                    article.title,
                description:
                    article.description,
                date:
                    article.publishedAt ||
                    article.listingDate,
                readTime:
                    article.readTime,
                /* a local card image is resolved against the site root (Unsplash URLs pass through); an article may have none (cardImage: null) and then its card has no image block */
                image:
                    article.cardImage
                        ? ROUTES.asset(
                            article.cardImage.src
                        )
                        : null,
                alt:
                    article.cardImage?.alt ?? ""
            };

        }
    );


/* =========================================================
   ARTICLE CATEGORIES

   Counts include published articles only (see
   data/articles.js).
========================================================= */

export {
    articleCategories
};
