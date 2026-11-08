// Per-page values for every Practice Labs learning-path page (src/_data/learn.js).
export default {
  eleventyComputed: {
    title: (data) => data.learnPage.title,
    description: (data) => data.learnPage.description,
    jsonld: (data) => data.learnPage.jsonld,
    themeColor: () => "#fafaf9",
    sitemapOrder: (data) => (data.learnPage.kind === "overview" ? 3.4 : data.learnPage.kind === "path" ? 3.41 : data.learnPage.kind === "level" ? 3.42 : data.learnPage.kind === "module" ? 3.43 : 3.44),
    fonts: () => true,
  },
};
