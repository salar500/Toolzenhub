// Per-page values for the AI products directory (src/_data/directory.js, data/ai-directory.js).
export default {
  eleventyComputed: {
    title: (data) => data.directory.aiDirectory.title,
    description: (data) => data.directory.aiDirectory.description,
    jsonld: (data) => data.directory.aiDirectory.jsonld,
  },
};
