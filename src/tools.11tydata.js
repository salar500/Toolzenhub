// Per-page values for the All Tools page (src/_data/directory.js).
export default {
  eleventyComputed: {
    title: (data) => data.directory.allTools.title,
    description: (data) => data.directory.allTools.description,
    jsonld: (data) => data.directory.allTools.jsonld,
  },
};
