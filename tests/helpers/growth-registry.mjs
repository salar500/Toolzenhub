/**
 * Synthetic registry for the Growth manifest mapper tests: tiny, invented, and shaped like the built catalogs
 * (assets/js/data). No real ToolZenHub content.
 */
export const loader = () => Promise.resolve({});

export function baseRegistry() {
  const tool = (id, extra) => ({ id, status: "published", available: true, loader, title: `Tool ${id}`, description: `Description of ${id}.`, capabilities: { reset: true, copy: false, validation: true }, ...extra });
  const article = (id, slug, extra) => ({ id, status: "published", published: true, key: `loans/${slug}`, topic: "loans", slug, category: "loans", title: `Article ${slug}`, description: `About ${slug}.`, publishedAt: "Aug 25, 2026", updatedAt: "Sep 1, 2026", content: () => Promise.resolve({ default: {} }), ...extra });
  return {
    sections: [
      { id: "calculators", title: "Calculators", pathPrefix: "calculators" },
      { id: "time-tools", title: "Time Tools", pathPrefix: "tools" },
    ],
    categories: [{ id: "loans", sectionId: "calculators" }, { id: "tax", sectionId: "calculators" }],
    subcategories: [],
    capabilityKeys: ["reset", "copy", "validation", "examples"],
    tools: [
      tool("emi-calculator", { category: "loans", sitePath: "/calculators/emi-calculator/", relatedTools: ["stopwatch"], relatedArticles: ["loans/guide"] }),
      tool("stopwatch", { sectionId: "time-tools", sitePath: "/tools/stopwatch/", relatedTools: ["emi-calculator"] }),
      { id: "future-tool", status: "coming-soon", available: false, category: "loans", title: "Future", description: "Not yet." },
    ],
    articles: [
      article(1, "guide", { heroImage: { src: "/assets/Images/articles/guide.png", alt: "A chart of the loan" }, tools: ["emi-calculator"], related: ["loans/second"] }),
      article(2, "second", { related: ["loans/guide"] }),
      { id: 3, status: "coming-soon", published: false, key: "loans/later", topic: "loans", slug: "later", category: "loans", title: "Later", description: "Soon." },
    ],
    facts: {
      toolModules: { "emi-calculator": { ok: true }, stopwatch: { ok: true } },
      toolStyles: ["emi-calculator", "stopwatch"],
      articleContent: { "loans/guide": { ok: true }, "loans/second": { ok: true } },
      images: { "/assets/Images/articles/guide.png": { ok: true, width: 1200, height: 675 } },
    },
  };
}
