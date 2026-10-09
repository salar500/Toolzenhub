/**
 * Scratch Git repositories for the Growth manifest export tests: a tiny SYNTHETIC ToolZenHub-shaped site (catalogs, article
 * and tool modules, a hero image, a ledger) plus a copy of the real producer modules, committed with fixed identities and dates
 * so two scratch repositories with the same content have the same commit id. The real website repository is never touched.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { serializeLedger } from "../../scripts/growth-manifest/ledger.mjs";

const REAL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const COMMIT_DATE = "2026-10-08T13:24:20Z";
export const COMMIT_ISO = "2026-10-08T13:24:20.000Z";
export const NOW_MS = 1791500000000;

const HERO_PNG = (() => {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(1200, 16);
  b.writeUInt32BE(675, 20);
  return b;
})();

export const SITE_FILES = {
  "package.json": JSON.stringify({ name: "toolzenhub-regression-safety-net", version: "0.0.0", type: "module" }, null, 2) + "\n",
  ".gitignore": "growth-export/\n",
  "src/_data/toolStyles.json": JSON.stringify({ alpha: {}, stopwatch: {} }) + "\n",
  "assets/js/data/categories.js": 'export const sections = [{ id: "calculators", title: "Calculators", pathPrefix: "calculators" }, { id: "time-tools", title: "Time Tools", pathPrefix: "tools" }];\nexport const categories = [{ id: "loans", sectionId: "calculators" }];\nexport const subcategories = [];\n',
  "assets/js/data/tool-capabilities.js": 'export const CAPABILITY_KEYS = ["reset", "copy", "validation"];\n',
  "assets/js/data/tools.js":
    'export const tools = [\n  { id: "alpha", status: "published", available: true, category: "loans", title: "Alpha Calculator", description: "The alpha calculator.", sitePath: "/calculators/alpha/", capabilities: { reset: true, copy: false, validation: true }, relatedTools: ["stopwatch"], loader: () => import("../tools/alpha/index.js") },\n  { id: "stopwatch", status: "published", available: true, sectionId: "time-tools", title: "Stopwatch", description: "Time things.", sitePath: "/tools/stopwatch/", capabilities: { reset: true, copy: false, validation: false }, loader: () => import("../tools/stopwatch/index.js") },\n  { id: "future", status: "coming-soon", available: false, category: "loans", title: "Future", description: "Soon." },\n];\n',
  "assets/js/data/articles.js":
    'export const articles = [\n  { id: 1, status: "published", published: true, key: "loans/guide", topic: "loans", slug: "guide", category: "loans", title: "Guide to loans", description: "A guide.", publishedAt: "Aug 25, 2026", updatedAt: "Sep 1, 2026", heroImage: { src: "/assets/Images/articles/guide.png", alt: "A chart of loan costs" }, tools: ["alpha"], related: ["loans/second"], content: () => import("./articles/loans/guide.js") },\n  { id: 2, status: "published", published: true, key: "loans/second", topic: "loans", slug: "second", category: "loans", title: "Second article", description: "Another.", publishedAt: "Aug 26, 2026", updatedAt: "Aug 26, 2026", related: ["loans/guide"], content: () => import("./articles/loans/second.js") },\n  { id: 3, status: "coming-soon", published: false, key: "loans/later", topic: "loans", slug: "later", category: "loans", title: "Later", description: "Soon." },\n];\n',
  "assets/js/data/articles/loans/guide.js": 'import { helper } from "../../../util/helper.js";\nexport default { title: helper() };\n',
  "assets/js/data/articles/loans/second.js": 'export default { title: "Second" };\n',
  "assets/js/util/helper.js": 'export const helper = () => "guide";\n',
  "assets/js/tools/alpha/index.js": "export const alpha = 1;\n",
  "assets/js/tools/stopwatch/index.js": "export const stopwatch = 1;\n",
  "docs/tool-packs/draft.md": "# An owner draft that is not part of the export\n",
};

export function syntheticLedger() {
  return {
    schemaVersion: 1,
    readme: "Synthetic ledger for the export tests.",
    historyWindow: { startDate: "2026-09-29", firstCommit: "a".repeat(40), verifiedAtCommit: "b".repeat(40), scope: "Synthetic scope." },
    nextArticleId: 4,
    articles: [
      { id: 1, key: "loans/guide", keyChanges: [], provenance: "history-verified", state: "active" },
      { id: 2, key: "loans/second", keyChanges: [], provenance: "history-verified", state: "active" },
      { id: 3, key: "loans/later", keyChanges: [], provenance: "history-verified", state: "active" },
    ],
    tools: [
      { id: "alpha", module: "assets/js/tools/alpha/index.js", moduleChanges: [], provenance: "bootstrap", state: "active" },
      { id: "stopwatch", module: "assets/js/tools/stopwatch/index.js", moduleChanges: [], provenance: "bootstrap", state: "active" },
    ],
  };
}

const env = (date) => ({ ...process.env, GIT_AUTHOR_NAME: "Test", GIT_AUTHOR_EMAIL: "test@example.test", GIT_COMMITTER_NAME: "Test", GIT_COMMITTER_EMAIL: "test@example.test", GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date });

export function git(root, args, { date = COMMIT_DATE, allowFail = false } = {}) {
  try {
    return execFileSync("git", ["-c", "core.autocrlf=false", "-c", "commit.gpgsign=false", ...args], { cwd: root, encoding: "utf8", env: env(date), stdio: ["ignore", "pipe", "pipe"] });
  } catch (cause) {
    if (allowFail) return null;
    throw cause;
  }
}

export function write(root, relative, content) {
  const file = path.join(root, ...relative.split("/"));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

export function commitAll(root, message, date = COMMIT_DATE) {
  git(root, ["add", "-A"], { date });
  git(root, ["commit", "-q", "-m", message], { date });
  return git(root, ["rev-parse", "HEAD"], { date }).trim();
}

/** Creates the base scratch repository (clean, one commit on main). */
export function createBaseRepo({ date = COMMIT_DATE } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tz-growth-scratch-"));
  git(root, ["init", "-q", "-b", "main"]);
  git(root, ["config", "core.autocrlf", "false"]);
  for (const [file, content] of Object.entries(SITE_FILES)) write(root, file, content);
  fs.mkdirSync(path.join(root, "assets", "Images", "articles"), { recursive: true });
  fs.writeFileSync(path.join(root, "assets", "Images", "articles", "guide.png"), HERO_PNG);
  const producer = path.join(REAL_ROOT, "scripts", "growth-manifest");
  for (const name of fs.readdirSync(producer).filter((n) => n.endsWith(".mjs"))) write(root, `scripts/growth-manifest/${name}`, fs.readFileSync(path.join(producer, name), "utf8"));
  write(root, "scripts/growth-manifest/identity-ledger.json", serializeLedger(syntheticLedger()));
  commitAll(root, "base", date);
  return root;
}

/** A private copy of a scratch repository (including its history) for one mutating scenario. */
export function cloneRepo(base) {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), "tz-growth-clone-"));
  fs.cpSync(base, copy, { recursive: true });
  return copy;
}

export function removeRepo(root) {
  try {
    fs.rmSync(root, { recursive: true, force: true, maxRetries: 3 });
  } catch {
    /* temporary directory; nothing depends on it */
  }
}

/** Tries to create a symbolic link; returns false when the platform or permissions do not allow it. */
export function trySymlink(target, link, type) {
  try {
    fs.symlinkSync(target, link, type);
    return true;
  } catch {
    return false;
  }
}
