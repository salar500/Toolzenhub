/**
 * One entry per PUBLISHED tool, built from the calculator catalog (assets/js/data/calculators.js).
 * Coming-soon tools are not in the catalog's loaders, so no page is generated for them.
 *
 * `html` is the finished tool page content: the tool's own markup plus the shared breadcrumb and the
 * related sections, produced by the same functions the browser used to run (pages/tool-page.js).
 */
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import fs from "node:fs";
import { calculators } from "../../assets/js/data/calculators.js";
import { calculatorMetadata } from "../../assets/js/calculator-registry.js";
import { buildToolPageHtml } from "../../assets/js/pages/tool-page.js";
import { toolBreadcrumbItems, breadcrumbTrail } from "../../assets/js/components/breadcrumb.js";
import { breadcrumbLd } from "../_lib/seo.js";

// Read as plain JSON (an `import ... with { type: "json" }` prints an experimental-feature warning on every build).
const toolStyles = JSON.parse(fs.readFileSync(new URL("./toolStyles.json", import.meta.url), "utf8"));

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CATALOG_DIR = path.join(ROOT, "assets", "js", "data");

/** The tool module's site path, read from the catalog's own import("...") so it is written once. */
function modulePathOf(tool) {
  const source = tool.loader.toString();
  const match = /import\(\s*["']([^"']+)["']\s*\)/.exec(source);
  if (!match) throw new Error(`Cannot read the module path of tool "${tool.id}" from its catalog loader`);
  const abs = path.resolve(CATALOG_DIR, match[1]);
  if (!fs.existsSync(abs)) throw new Error(`Tool "${tool.id}": module ${abs} does not exist`);
  return "/" + path.relative(ROOT, abs).split(path.sep).join("/");
}

export default async function () {
  const published = calculators.filter((tool) => tool.status === "published" && typeof tool.loader === "function");
  const pages = [];
  for (const tool of published) {
    const module = await import(pathToFileURL(path.join(ROOT, modulePathOf(tool))).href);
    const metadata = calculatorMetadata[tool.id];
    const html = buildToolPageHtml(tool.id, module, metadata);
    if (!html) throw new Error(`Tool "${tool.id}" has no markup(): cannot generate its page`);
    const style = toolStyles[tool.id];
    if (!style) throw new Error(`No stylesheet list for tool "${tool.id}" in src/_data/toolStyles.json`);
    const sitePath = `/calculators/${tool.id}/`;
    pages.push({
      id: tool.id,
      sitePath,
      title: tool.seo.title,
      description: tool.seo.description,
      themeColor: tool.seo.themeColor || null,
      modulePath: modulePathOf(tool),
      fonts: style.fonts,
      styles: style.styles,
      html,
      jsonld: [breadcrumbLd(breadcrumbTrail(toolBreadcrumbItems(metadata)), sitePath)],
    });
  }
  return pages;
}
