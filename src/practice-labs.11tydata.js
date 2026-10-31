// Per-page values for the Practice Labs hub (src/_data/directory.js).
export default {
  eleventyComputed: {
    title: (data) => data.directory.practiceLabs.title,
    description: (data) => data.directory.practiceLabs.description,
    jsonld: (data) => data.directory.practiceLabs.jsonld,
  },
};
