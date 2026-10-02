// Per-page values for every generated tool page, taken from the paginated `tool` (src/_data/tools.js).
export default {
  eleventyComputed: {
    title: (data) => data.tool.title,
    description: (data) => data.tool.description,
    themeColor: (data) => data.tool.themeColor,
    fonts: (data) => data.tool.fonts,
    styles: (data) => data.tool.styles,
    jsonld: (data) => data.tool.jsonld,
  },
};
