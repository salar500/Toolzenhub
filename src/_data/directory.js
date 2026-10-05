/**
 * The directory pages, built from the hierarchy data (assets/js/data/categories.js) and the tool catalog:
 *   allTools        the All Tools page (/tools.html)
 *   categoryPages   one page per category that has live tools and a landing route (/investment.html, ...)
 *
 * `html` is the finished <main> content, produced by assets/js/pages/directory/directory-html.js.
 */
import { allToolsHtml, categoryPageHtml, categoryPageIds } from "../../assets/js/pages/directory/directory-html.js";
import { getCategory } from "../../assets/js/data/taxonomy.js";
import { breadcrumbTrail } from "../../assets/js/components/breadcrumb.js";
import { sections } from "../../assets/js/data/categories.js";
import { ROUTES } from "../../assets/js/routes.js";
import { breadcrumbLd } from "../_lib/seo.js";

export default function () {
  const categoryPages = categoryPageIds().map((id) => {
    const category = getCategory(id);
    const section = sections.find((s) => s.id === category.sectionId);
    const permalink = `/${id}.html`;
    return {
      id,
      permalink,
      title: `${category.title} Calculators | ToolZen Hub`,
      description: category.seoDescription,
      html: categoryPageHtml(id),
      jsonld: [
        breadcrumbLd(
          breadcrumbTrail([
            { label: section.title, href: ROUTES[section.landing] },
            { label: category.title },
          ]),
          permalink
        ),
      ],
    };
  });

  const allTools = {
    title: "All Tools | ToolZen Hub",
    description:
      "Browse every ToolZen Hub tool by section and category: calculators for loans, investment, tax, business and math.",
    html: allToolsHtml(),
    jsonld: [
      breadcrumbLd(breadcrumbTrail([{ label: "All Tools" }]), "/tools.html"),
    ],
  };

  return { allTools, categoryPages };
}
