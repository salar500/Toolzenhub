// Per-page values for every generated category page, taken from the paginated `categoryPage` (src/_data/directory.js).
export default {
  eleventyComputed: {
    title: (data) => data.categoryPage.title,
    description: (data) => data.categoryPage.description,
    jsonld: (data) => data.categoryPage.jsonld,
    themeColor: () => "#0b9f58",
    sitemapOrder: () => 3.1,
    fonts: () => true,
  },
};
