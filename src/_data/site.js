/** Site-wide values for templates. The production origin comes from assets/js/site-config.js only. */
import { SITE, productionUrl } from "../../assets/js/site-config.js";

export default {
  name: SITE.name,
  origin: SITE.origin,
  url: SITE.url,
  // where THIS build is deployed (see eleventy.config.js / eleventy.preview.config.js); links use it
  base: globalThis.__TZ_SITE_BASE__ || "/",
  // absolute production URL of a site path: site.productionUrl(page.url)
  productionUrl,
};
