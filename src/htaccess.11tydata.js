// /.htaccess is emitted for the root-domain (production) build only. The preview build lives under a
// sub-path, where "/404.html" would be the wrong place, and GitHub Pages does not read .htaccess anyway.
export default {
  eleventyComputed: {
    permalink: (data) => (data.site.base === "/" ? "/.htaccess" : false),
  },
};
