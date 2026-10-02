/* =========================================================
   ToolZen Hub
   Site Configuration

   The single home of values that are genuinely global:
   the site name, the production origin and where the
   preview is deployed.

   Deliberately small and free of side effects (it never
   reads window), so it can be imported anywhere, including
   from tests. The URL root for the CURRENT page is computed
   from window.location in routes.js, using resolveSiteRoot()
   below.

   Supports:
   - Production: root-domain hosting at the origin below
   - Preview: GitHub Pages project site (salar500.github.io/Toolzenhub/)
========================================================= */


export const SITE = {

    name:
        "ToolZen Hub",

    /*
     * PRODUCTION ORIGIN - the one place the canonical domain is
     * set. Every canonical URL, Open Graph URL, sitemap entry and
     * structured-data URL is this origin plus the page path.
     * To move the site to another domain, change this value and
     * rebuild. Deployment previews (GitHub Pages) NEVER change it:
     * a preview build still declares the production URLs.
     */

    origin:
        "https://toolzenhub.in",

    /*
     * The GitHub Pages preview is served from a sub-path. This
     * is used only when a page carries no base from the build
     * (source files, unit tests). Built pages carry their base
     * (see routes.js).
     */

    pagesHost:
        "salar500.github.io",

    pagesBasePath:
        "/Toolzenhub/"

};


/*
 * Production URL with a trailing slash.
 */

SITE.url =
    `${SITE.origin}/`;


/*
 * Absolute production URL of a site path such as
 * "/calculators/emi/" (a path from the site root, never
 * including a deployment base).
 */

export function productionUrl(
    sitePath = "/"
) {

    return (
        SITE.origin +
        "/" +
        String(sitePath).replace(/^\/+/, "")
    );

}


/* =========================================================
   SITE ROOT FOR A HOST
========================================================= */

export function resolveSiteRoot(
    hostname
) {

    return hostname === SITE.pagesHost
        ? SITE.pagesBasePath
        : "/";

}
