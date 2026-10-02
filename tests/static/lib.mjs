/**
 * Shared helpers for the static (no-browser) link and asset checkers.
 *
 * Everything here is deterministic and dependency-free. Paths are resolved with EXACT-CASE
 * matching: on the developer's (case-insensitive) Windows file system a wrong-case reference
 * "works", but GitHub Pages serves from a case-sensitive file system and returns 404.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The site under test is the BUILD OUTPUT (npm run build -> dist/, npm run build:preview -> dist-ghpages/),
 * not the sources: the checks verify what would be deployed. TZ_REPO_ROOT picks another folder (the
 * preview build, a deliberately broken copy ...); TZ_SITE_BASE says which base that build was made for.
 */
const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const REPO = path.resolve(process.env.TZ_REPO_ROOT || path.join(PROJECT, "dist"));
export const SITE_BASE = process.env.TZ_SITE_BASE || "/";
if (!fs.existsSync(REPO)) {
  console.error(`✗ No build output at ${REPO}. Run  npm run build  (and  npm run build:preview  for the preview) first.`);
  process.exit(2);
}
const SKIP_DIRS = new Set(["node_modules", "tests", "test-results", "playwright-report", ".git"]);
// development tooling at the repo root — NOT part of the deployed site, so never scanned as site code
const ROOT_TOOLING = new Set(["package.json", "package-lock.json", "playwright.config.js", ".gitignore"]);

export const rel = (abs) => path.relative(REPO, abs).split(path.sep).join("/");

export function walk(dir = REPO, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
    if (dir === REPO && ROOT_TOOLING.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** all site files as repo-relative paths (the deployed site; excludes tests/tooling) */
export function siteFiles() {
  return walk().map(rel).sort();
}

const dirCache = new Map();
function entries(dirAbs) {
  if (!dirCache.has(dirAbs)) {
    try {
      dirCache.set(dirAbs, fs.readdirSync(dirAbs));
    } catch {
      dirCache.set(dirAbs, []);
    }
  }
  return dirCache.get(dirAbs);
}

/**
 * Resolve a repo-relative path.
 *   { ok:true }                                  exact-case match
 *   { ok:false, caseMismatch:"actual/path" }     exists only with different case
 *   { ok:false }                                 does not exist
 */
export function checkPath(repoRel) {
  const parts = repoRel.split("/").filter(Boolean);
  let cur = REPO;
  let actual = [];
  let mismatch = false;
  for (const part of parts) {
    const list = entries(cur);
    if (list.includes(part)) {
      actual.push(part);
      cur = path.join(cur, part);
      continue;
    }
    const alt = list.find((e) => e.toLowerCase() === part.toLowerCase());
    if (!alt) return { ok: false };
    mismatch = true;
    actual.push(alt);
    cur = path.join(cur, alt);
  }
  if (mismatch) return { ok: false, caseMismatch: actual.join("/") };
  return { ok: true, abs: cur, isDir: fs.statSync(cur).isDirectory() };
}

/** a directory URL resolves to its index.html (GitHub Pages behaviour) */
export function checkUrlPath(repoRel) {
  const r = checkPath(repoRel);
  if (r.ok && r.isDir) {
    const idx = checkPath(repoRel.replace(/\/+$/, "") + "/index.html");
    return idx.ok ? { ...idx, viaIndex: true } : { ok: false };
  }
  return r;
}

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // http:, https:, data:, mailto:, tel:, javascript:, //host

export function isExternalOrSkippable(ref) {
  const r = ref.trim();
  return r === "" || r.startsWith("#") || EXTERNAL.test(r) || r.includes("${");
}

/** strip ?query and #fragment */
export const stripQuery = (ref) => ref.split("#")[0].split("?")[0];

/**
 * Resolve `ref` found in `fromFile` (repo-relative) to a repo-relative path.
 * Absolute-path references ("/assets/x") are resolved against the SITE ROOT (the repo root).
 * A leading "/Toolzenhub/" is treated as the GitHub Pages prefix and removed.
 */
export function resolveRef(fromFile, ref, { pageRelative = true } = {}) {
  let r = stripQuery(ref.trim());
  if (r.startsWith("/Toolzenhub/")) r = r.slice("/Toolzenhub".length);
  let target;
  if (r.startsWith("/")) target = r.slice(1);
  else if (pageRelative) target = path.posix.join(path.posix.dirname(fromFile), r);
  else target = r;
  const normalized = path.posix.normalize(target).replace(/^\.\//, "");
  return normalized === "." ? "" : normalized; // "/" is the site root: its index.html
}

export function read(repoRel) {
  return fs.readFileSync(path.join(REPO, repoRel), "utf8");
}

/* ----------------------------------------------------------------------------------------------
 * Source scanners
 * -------------------------------------------------------------------------------------------- */

/** Remove /* *\/ and // comments from JS/CSS while leaving string contents untouched. */
export function stripComments(src, { css = false } = {}) {
  let out = "";
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "/" && d === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      out += " ";
      continue;
    }
    if (!css && c === "/" && d === "/") {
      const end = src.indexOf("\n", i);
      i = end === -1 ? n : end;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const q = c;
      out += c;
      i++;
      while (i < n && src[i] !== q) {
        if (src[i] === "\\") {
          out += src[i] + (src[i + 1] ?? "");
          i += 2;
          continue;
        }
        out += src[i++];
      }
      out += q;
      i++;
      continue;
    }
    out += c;
    i++;
  }
  return out;
}

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
  return out;
}

/** every URL-bearing attribute in an HTML file */
export function htmlRefs(html) {
  // ignore content inside <script> bodies and comments
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.match(/<script\b[^>]*>/i)[0] + "</script>");
  const refs = [];
  for (const m of clean.matchAll(/<(link|script|img|source|a|iframe|video|audio|form)\b[^>]*>/gi)) {
    const tag = m[0];
    const t = m[1].toLowerCase();
    const a = attrs(tag);
    if (t === "link" && a.href !== undefined) refs.push({ tag: t, attr: "href", value: a.href, rel: a.rel || "", attrs: a });
    else if (t === "script" && a.src !== undefined) refs.push({ tag: t, attr: "src", value: a.src, attrs: a });
    else if (t === "a" && a.href !== undefined) refs.push({ tag: t, attr: "href", value: a.href, attrs: a });
    else if (t === "form" && a.action !== undefined) refs.push({ tag: t, attr: "action", value: a.action, attrs: a });
    else if (a.src !== undefined) refs.push({ tag: t, attr: "src", value: a.src, attrs: a });
    if (a.srcset) for (const part of a.srcset.split(",")) refs.push({ tag: t, attr: "srcset", value: part.trim().split(/\s+/)[0], attrs: a });
  }
  return refs;
}

export function cssRefs(css) {
  const clean = stripComments(css, { css: true });
  const refs = [];
  for (const m of clean.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?/g)) refs.push({ kind: "import", value: m[1] });
  for (const m of clean.matchAll(/url\(\s*["']?([^"')]+?)["']?\s*\)/g)) refs.push({ kind: "url", value: m[1] });
  return refs;
}

/** static + dynamic imports with string-literal specifiers, plus asset-path string literals */
export function jsRefs(js) {
  const clean = stripComments(js);
  const imports = [];
  for (const m of clean.matchAll(/(?:^|[;\s}])(?:import|export)\s[^'"`;]*?\sfrom\s*["']([^"']+)["']/g)) imports.push({ kind: "import", value: m[1] });
  for (const m of clean.matchAll(/(?:^|[;\s])import\s*["']([^"']+)["']/g)) imports.push({ kind: "import", value: m[1] });
  for (const m of clean.matchAll(/import\s*\(\s*["']([^"']+)["']\s*\)/g)) imports.push({ kind: "dynamic-import", value: m[1] });
  const dynamicTemplate = /import\s*\(\s*[^\s"')]/.test(clean); // import(someVariable) / import(`...`)

  const literals = [];
  const ext = "png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|json|woff2?|ttf|pdf";
  const re = new RegExp(`(["'\`])((?:(?!\\1)[^\\n\\r\\\\])*?\\.(?:${ext}))\\1`, "gi");
  for (const m of clean.matchAll(re)) {
    const v = m[2];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(v) || v.includes("${") || /\s/.test(v)) continue;
    // only paths that look like site assets, not module specifiers already captured above
    if (/(^|\/)assets\//.test(v) || /^\/?[\w.-]+\.(?:svg|ico|json)$/.test(v) || /^\.\.?\//.test(v)) literals.push({ kind: "literal", value: v });
  }
  return { imports, literals, dynamicTemplate };
}

/** inline HTML in JS template strings: href="literal" (non-interpolated) */
export function jsHtmlHrefs(js) {
  const clean = stripComments(js);
  const out = [];
  for (const m of clean.matchAll(/href\s*=\s*"([^"$]*)"/g)) out.push(m[1]);
  return out;
}


/* ----------------------------------------------------------------------------------------------
 * Shared reference graph (used by check-assets and check-links)
 * -------------------------------------------------------------------------------------------- */

/**
 * Scan every site file and build the local reference graph.
 * @param {string[]} entryHtml live HTML files (repo-relative) that seed reachability
 * @returns {{ edges:Map, problems:Array, reachable:Set, stats:object, files:string[] }}
 */
export function buildAssetGraph(entryHtml) {
  const files = siteFiles();
  const edges = new Map();
  const problems = [];
  const stats = { html: 0, css: 0, js: 0, refs: 0, external: 0, dynamicTemplateFiles: [] };

  function addRef(from, kind, raw, { pageRelative = true, asLiteral = false } = {}) {
    if (isExternalOrSkippable(raw)) {
      if (raw && /^https?:|^\/\//.test(raw)) stats.external++;
      return;
    }
    stats.refs++;
    const target = asLiteral
      ? raw.startsWith("./") || raw.startsWith("../")
        ? resolveRef(from, raw, { pageRelative: true })
        : resolveRef(from, raw, { pageRelative: false })
      : resolveRef(from, raw, { pageRelative });
    const r = checkUrlPath(target);
    if (r.ok) {
      if (!edges.has(from)) edges.set(from, new Set());
      edges.get(from).add(rel(r.abs));
      return;
    }
    if (r.caseMismatch) problems.push({ file: from, ref: raw, kind, problem: "CASE MISMATCH", detail: `${target}  (actual: ${r.caseMismatch})` });
    else problems.push({ file: from, ref: raw, kind, problem: "MISSING", detail: target });
  }

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (ext === ".html") {
      stats.html++;
      for (const r of htmlRefs(read(f))) {
        if (r.tag === "a" || r.tag === "form") continue; // navigation: handled by check-links
        addRef(f, `${r.tag}[${r.attr}]`, r.value);
      }
    } else if (ext === ".css") {
      stats.css++;
      for (const r of cssRefs(read(f))) addRef(f, `css ${r.kind}`, r.value);
    } else if (ext === ".js" || ext === ".mjs") {
      stats.js++;
      const { imports, literals, dynamicTemplate } = jsRefs(read(f));
      if (dynamicTemplate) stats.dynamicTemplateFiles.push(f);
      for (const r of imports) addRef(f, r.kind, r.value);
      for (const r of literals) addRef(f, "js string", r.value, { asLiteral: true });
    }
  }

  const reachable = new Set();
  const queue = [...entryHtml];
  while (queue.length) {
    const f = queue.pop();
    if (reachable.has(f)) continue;
    reachable.add(f);
    for (const t of edges.get(f) ?? []) queue.push(t);
  }
  return { edges, problems, reachable, stats, files };
}
