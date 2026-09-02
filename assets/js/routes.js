/* =========================================================
   ToolZen Hub
   Central Routes
========================================================= */

const SITE_ROOT = "/Toolzenhub/";


export const ROUTES = {

    home: SITE_ROOT,

    categories: `${SITE_ROOT}categories.html`,

    articles: `${SITE_ROOT}articles.html`,

    about: `${SITE_ROOT}about.html`,

    contact: `${SITE_ROOT}contact.html`,

    calculators: `${SITE_ROOT}calculators.html`,

    calculator(slug) {
        return `${SITE_ROOT}calculators/${slug}/`;
    }

};
