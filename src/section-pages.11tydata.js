// Per-page values for every generated section page (src/_data/directory.js): Time Tools.
export default {
  eleventyComputed: {
    title: (data) => data.sectionPage.title,
    description: (data) => data.sectionPage.description,
    jsonld: (data) => data.sectionPage.jsonld,
    themeColor: () => "#0b9f58",
    sitemapOrder: () => 3.2,
    fonts: () => true,
  },
};
