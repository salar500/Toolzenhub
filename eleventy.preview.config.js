/**
 * Preview build: the same site under the GitHub Pages project path (https://salar500.github.io/Toolzenhub/).
 *   npm run build:preview   ->  dist-ghpages/
 *
 * Only links and asset URLs use this base. Canonical URLs, Open Graph URLs, the sitemap and the
 * structured data still point at the production origin (assets/js/site-config.js).
 */
import { createConfig } from "./eleventy.shared.js";

export default createConfig({ base: "/Toolzenhub/", output: "dist-ghpages" });
