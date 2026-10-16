/** Site-wide values for templates. The production origin comes from assets/js/site-config.js only. */
import { SITE, productionUrl } from "../../assets/js/site-config.js";

// GA4 Measurement ID of the existing ToolZen Hub web data stream. It lives here, in a build-only file, so it is
// never copied into a browser-served module. It is used by the production (root-domain) build only.
const GA4_MEASUREMENT_ID = "G-YEJZMCXJ7V";

const base = globalThis.__TZ_SITE_BASE__ || "/";

if (!/^G-[A-Z0-9]{10}$/.test(GA4_MEASUREMENT_ID)) {
  throw new Error(`GA4_MEASUREMENT_ID in src/_data/site.js is not a valid Measurement ID: ${GA4_MEASUREMENT_ID}`);
}

export default {
  name: SITE.name,
  origin: SITE.origin,
  url: SITE.url,
  // where THIS build is deployed (see eleventy.config.js / eleventy.preview.config.js); links use it
  base,
  // absolute production URL of a site path: site.productionUrl(page.url)
  productionUrl,
  // GA4 Measurement ID, or null. Only the production build (served from "/") carries analytics; the GitHub Pages
  // preview never does. Pages load it only after the visitor accepts (assets/js/analytics.js).
  analyticsId: base === "/" ? GA4_MEASUREMENT_ID : null,
};
