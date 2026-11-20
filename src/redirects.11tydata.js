// /_redirects is emitted for the root-domain (production) build only, like /.htaccess: Cloudflare Pages reads this
// file (it ignores .htaccess), GitHub Pages reads neither.
export default {
  eleventyComputed: {
    permalink: (data) => (data.site.base === "/" ? "/_redirects" : false),
  },
};
