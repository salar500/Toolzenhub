/* =========================================================
   ToolZen Hub
   Site Configuration

   The single home of values that are genuinely global:
   the site name and where the site is deployed.

   Deliberately small and free of side effects (it never
   reads window), so it can be imported anywhere, including
   from tests. The URL root for the CURRENT page is computed
   from window.location in routes.js, using resolveSiteRoot()
   below.

   Supports:
   - GitHub Pages project site (salar500.github.io/Toolzenhub/)
   - Hostinger / any root-domain deployment
========================================================= */


export const SITE = {

    name:
        "ToolZen Hub",

    /*
     * The GitHub Pages deployment is served from a
     * sub-path. Every other host serves from "/".
     */

    pagesHost:
        "salar500.github.io",

    pagesBasePath:
        "/Toolzenhub/",

    /*
     * Absolute production URL (structured data, publisher
     * logo). Same value article-seo.js has always used.
     */

    url:
        "https://salar500.github.io/Toolzenhub/"

};


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
