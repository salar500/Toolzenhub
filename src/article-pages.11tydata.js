// Per-page values for every generated article page, taken from the paginated `article` (src/_data/articlePages.js).
export default {
  eleventyComputed: {
    title: (data) => data.article.title,
    description: (data) => data.article.description,
    themeColor: (data) => data.article.themeColor,
    fonts: (data) => data.article.fonts,
    styles: (data) => data.article.styles,
    jsonld: (data) => data.article.jsonld,
    ogImage: (data) => data.article.imageUrl || null,
  },
};
