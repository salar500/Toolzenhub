/**
 * Growth manifest registry loader: the only module of this layer that touches the file system (read-only).
 *
 * It loads the site's own catalogs (assets/js/data/tools.js, articles.js, categories.js, tool-capabilities.js), exactly
 * the modules the Eleventy build uses, and gathers the file-system FACTS the pure mapper needs to decide whether each
 * published entry has a valid page contract: the tool's implementation file, its stylesheet entry, the article content
 * module, and the verified hero image files. It creates no second registry, writes nothing, uses no network, spawns no
 * process and reads no clock.
 *
 * Importing the catalogs needs the same build-time stand-in for `window` that eleventy.shared.js installs (the shipped
 * modules read window.location when imported). It is installed only when absent, with the production base "/". The base
 * affects links only, never the canonical paths exported here.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { APPROVED_IMAGE_PREFIX, mapRegistry } from "./items.mjs";
import { LEDGER_FILE, checkIdentities, parseLedgerText } from "./ledger.mjs";
import { validateItems } from "./validate.mjs";

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function installBuildEnvironment() {
  if (globalThis.window === undefined) globalThis.window = { location: { hostname: "build.local", pathname: "/", search: "" } };
  if (globalThis.__TZ_SITE_BASE__ === undefined) globalThis.__TZ_SITE_BASE__ = "/";
}

const within = (parent, child) => child === parent || child.startsWith(parent + path.sep);

/** Reads the width and height of a PNG from its header, or says why it cannot. Nothing else is read. */
export function readPngSize(file) {
  let fd;
  try {
    fd = fs.openSync(file, "r");
    const head = Buffer.alloc(24);
    const n = fs.readSync(fd, head, 0, 24, 0);
    if (n < 24 || !head.subarray(0, 8).equals(PNG_SIGNATURE) || head.toString("latin1", 12, 16) !== "IHDR") return { ok: false, error: "not a PNG file (only PNG heroes are supported)" };
    return { ok: true, width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
  } catch (cause) {
    return { ok: false, error: `cannot be read (${cause.code ?? "error"})` };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** Verifies a local hero image: the file exists inside assets/Images (after resolving links) and has a readable PNG size. */
export function verifyLocalImage(root, src) {
  if (typeof src !== "string" || !src.startsWith(APPROVED_IMAGE_PREFIX)) return { ok: false, error: "outside the approved image directory" };
  let imagesRoot;
  let real;
  try {
    imagesRoot = fs.realpathSync(path.join(root, "assets", "Images"));
    real = fs.realpathSync(path.join(root, src.slice(1)));
  } catch {
    return { ok: false, error: "file does not exist" };
  }
  if (!within(imagesRoot, real)) return { ok: false, error: "resolves outside the approved image directory" };
  if (!fs.statSync(real).isFile()) return { ok: false, error: "is not a file" };
  return readPngSize(real);
}

/** The tool's module path, read from the catalog loader's own import("...") so it is written once (as src/_data/tools.js does). */
function toolModuleFact(root, tool) {
  const match = typeof tool.loader === "function" ? /import\(\s*["']([^"']+)["']\s*\)/.exec(tool.loader.toString()) : null;
  if (match === null) return { ok: false, error: "the catalog loader names no module" };
  const file = path.resolve(root, "assets", "js", "data", match[1]);
  try {
    const real = fs.realpathSync(file);
    const realRoot = fs.realpathSync(root);
    if (!within(realRoot, real)) return { ok: false, error: "the module path leaves the repository" };
    // `path` is the repository-relative location the identity ledger anchors a published tool to
    return fs.statSync(real).isFile() ? { ok: true, path: path.relative(realRoot, real).split(path.sep).join("/") } : { ok: false, error: "the module is not a file" };
  } catch {
    return { ok: false, error: "the module file does not exist" };
  }
}

/** Loads the published-content registry from the site sources. Reads files only. */
export async function loadRegistry({ root = REPO_ROOT } = {}) {
  installBuildEnvironment();
  const load = (rel) => import(pathToFileURL(path.join(root, rel)).href);
  const [toolsModule, articlesModule, taxonomy, capabilityModule] = await Promise.all([
    load("assets/js/data/tools.js"),
    load("assets/js/data/articles.js"),
    load("assets/js/data/categories.js"),
    load("assets/js/data/tool-capabilities.js"),
  ]);
  const tools = toolsModule.tools;
  const articles = articlesModule.articles;
  const styles = JSON.parse(fs.readFileSync(path.join(root, "src", "_data", "toolStyles.json"), "utf8"));

  const facts = { toolModules: {}, toolStyles: Object.keys(styles).sort(), articleContent: {}, images: {} };
  for (const tool of tools) if (tool.status === "published") facts.toolModules[tool.id] = toolModuleFact(root, tool);
  for (const article of articles) {
    if (article.status !== "published") continue;
    const key = `${article.topic}/${article.slug}`;
    if (typeof article.content !== "function") {
      facts.articleContent[key] = { ok: false, error: "no content loader" };
    } else {
      try {
        const module = await article.content();
        const body = module?.default || module?.article;
        facts.articleContent[key] = body !== null && typeof body === "object" ? { ok: true } : { ok: false, error: "the module exports no article" };
      } catch (cause) {
        facts.articleContent[key] = { ok: false, error: `the module does not load (${cause?.code ?? cause?.name ?? "error"})` };
      }
    }
    const hero = article.heroImage;
    if (hero && typeof hero.src === "string" && hero.src.startsWith(APPROVED_IMAGE_PREFIX) && !(hero.src in facts.images)) facts.images[hero.src] = verifyLocalImage(root, hero.src);
  }

  return {
    tools,
    articles,
    sections: taxonomy.sections,
    categories: taxonomy.categories,
    subcategories: taxonomy.subcategories,
    capabilityKeys: [...capabilityModule.CAPABILITY_KEYS],
    facts,
  };
}

/**
 * Reads and validates the identity ledger file (read-only; the ledger is only ever changed by a reviewed edit). Returns
 * { ok, ledger, errors }; a missing, unreadable, malformed or non-canonical file is an error, never an empty ledger.
 */
export function readLedgerFile({ root = REPO_ROOT } = {}) {
  let text;
  try {
    text = fs.readFileSync(path.join(root, LEDGER_FILE), "utf8");
  } catch {
    return { ok: false, ledger: null, errors: [{ code: "LEDGER_MISSING", id: "ledger", message: `${LEDGER_FILE} cannot be read` }] };
  }
  return parseLedgerText(text);
}

/**
 * Maps the real published registries to validated manifest items. Writes nothing and returns data only:
 * { ok, items, errors, notices, validation }. `ok` is true only when the identity ledger, the mapper and the independent
 * validator all pass. The ledger is checked FIRST and fails closed: any identity problem returns no items.
 * Options: `root`; `ledger` (a parsed ledger, default the file); `previousLedger` (the last committed ledger, supplied by the
 * caller that reads Git, for the no-silent-change comparison).
 */
export async function exportPublishedItems(options = {}) {
  const registry = await loadRegistry(options);
  const loaded = options.ledger !== undefined ? { ok: true, ledger: options.ledger, errors: [] } : readLedgerFile(options);
  if (!loaded.ok) return { ok: false, items: [], errors: loaded.errors, notices: [], validation: null };
  const identity = checkIdentities({ ledger: loaded.ledger, previousLedger: options.previousLedger ?? null, articles: registry.articles, tools: registry.tools, toolModules: registry.facts.toolModules });
  if (!identity.ok) return { ok: false, items: [], errors: identity.errors, notices: [], validation: null };
  const mapped = mapRegistry(registry);
  if (!mapped.ok) return { ...mapped, validation: null };
  const validation = validateItems(mapped.items);
  if (!validation.ok) return { ok: false, items: [], errors: validation.problems, notices: mapped.notices, validation };
  return { ok: true, items: mapped.items, errors: [], notices: mapped.notices, validation };
}
